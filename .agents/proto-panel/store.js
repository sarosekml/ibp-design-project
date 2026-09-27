/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — хранение (store.js).

   Что здесь:
     - шина событий панели (ProtoPanel._bus);
     - хранилища браузера без падений: localStorage (настройки pp.prefs,
       выбор таба и сценария pp.ui:<app>, черновики комментариев
       pp.drafts:<app>, черновые операции схемы pp.flowOps:<app>) и
       sessionStorage (состояние сценария — его ведёт runner.js). По file://
       хранилище бывает недоступно — тогда панель живёт до перезагрузки;
     - данные: всегда из зеркала window.ProtoPanelData, без копии — после
       записи на диск панель заменяет поля в том же объекте. Сценарии для
       интерфейса и проигрывателя — зеркало плюс черновые операции (превью);
     - подключение папки через File System Access API: корень проекта, папка
       приложения или сама папка панели; хендлы — в IndexedDB «proto-panel»;
     - запись — всегда «прочитать → слить → записать»: свежий файл с диска,
       операции поверх, каноническая запись ядром и зеркало тем же
       core.mirrorText, что у оснастки. comments.md — операции комментариев,
       flows.yaml — операции схемы (Fix State, New flow, Rename, Delete;
       задача 0005a): одна очередь и одна блокировка на оба файла;
     - без папки — черновики в браузере, «Download comments.md»,
       «Download flows.yaml», «Copy text».
   Файлы вне <приложение>/proto-panel/ панель не пишет. Форматы —
   .agents/proto-panel/README.md. Строки интерфейса — strings.js.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel = window.ProtoPanel || {};
  var core = window.ProtoPanelCore;
  var ctx = window.__PROTO_PANEL || {};
  if (!core || !ctx.app) return;
  var t = PP._strings ? PP._strings.t : function (k) { return k; };

  var APP = ctx.app;
  var DIR = ctx.dir || 'proto-panel';
  var FILES = { flows: 'flows.yaml', comments: 'comments.md', mirror: 'panel-data.js' };
  var LOG = '[proto panel]';

  /* ---------------- шина ---------------- */

  var handlers = {};
  var bus = {
    on: function (ev, fn) {
      (handlers[ev] = handlers[ev] || []).push(fn);
      return function () { handlers[ev] = (handlers[ev] || []).filter(function (f) { return f !== fn; }); };
    },
    emit: function (ev, data) {
      (handlers[ev] || []).slice().forEach(function (fn) {
        try { fn(data); } catch (e) { console.warn(LOG, e); }
      });
    }
  };

  function msg(e) { return e && e.message || String(e); }
  /* номер комментария К-3 — формат файла, строка живёт в strings.js */
  function num(n) { return t('comments.num', { n: n }); }

  /* ---------------- хранилища браузера ---------------- */

  function area(kind) {
    var a = null;
    try { a = window[kind]; } catch (e) { a = null; }
    var mem = {};
    function ok() {
      try { if (!a) return false; a.setItem('pp.probe', '1'); a.removeItem('pp.probe'); return true; } catch (e) { return false; }
    }
    var usable = ok();
    return {
      usable: usable,
      /* Значение ключа живёт только в памяти, до перезагрузки: хранилище закрыто
         со старта или отказало на записи этого ключа (ревью 0005, R5, R10). */
      volatile: function (k) { return !usable || k in mem; },
      get: function (k, def) {
        var v = null;
        /* Память важнее диска: там свежая запись или надгробие удаления — иначе
           при переполнении хранилища чтение видело бы старое значение (ревью 0005, R5). */
        if (k in mem) v = mem[k];
        else if (usable) { try { v = a.getItem(k); } catch (e) { v = null; } }
        if (v === null || v === undefined) return def;
        try { return JSON.parse(v); } catch (e) { return def; }
      },
      set: function (k, v) {
        var s = v === undefined || v === null ? null : JSON.stringify(v);
        if (!usable) { if (s === null) delete mem[k]; else mem[k] = s; return false; }
        try {
          if (s === null) a.removeItem(k); else a.setItem(k, s);
          delete mem[k];
          return true;
        } catch (e) { /* квота или запрет — живёт в памяти до перезагрузки */ }
        mem[k] = s;   // null — надгробие удаления: чтение не вернёт прежнее значение с диска
        return false;
      }
    };
  }
  var local = area('localStorage');
  var session = area('sessionStorage');

  var PREFS = { author: '', showFab: false, showPlayer: true, closeOnGo: true, showActions: false, drawerWidth: null };
  function prefs() {
    var p = local.get('pp.prefs', {}) || {};
    var out = {};
    for (var k in PREFS) out[k] = k in p ? p[k] : PREFS[k];
    return out;
  }
  function setPref(k, v) {
    var p = local.get('pp.prefs', {}) || {};
    p[k] = v;
    local.set('pp.prefs', p);
    bus.emit('prefs', prefs());
  }

  function ui() { return local.get('pp.ui:' + APP, {}) || {}; }
  function setUi(patch) {
    var u = ui();
    for (var k in patch) { if (patch[k] === undefined) delete u[k]; else u[k] = patch[k]; }
    local.set('pp.ui:' + APP, u);
  }

  /* ---------------- данные ---------------- */

  var dataVersion = 0;   // растёт при каждой замене данных — ключ кеша превью
  function data() { return window.ProtoPanelData || null; }

  /* Новые данные — в тот же объект: сценарии рантайм читает прямо из него. */
  function replaceData(next) {
    var d = window.ProtoPanelData;
    dataVersion++;
    if (!d || typeof d !== 'object') { window.ProtoPanelData = next; return; }
    Object.keys(next).forEach(function (k) { d[k] = next[k]; });
  }

  /* ---------------- черновики комментариев ---------------- */

  var K_DRAFTS = 'pp.drafts:' + APP;
  function drafts() { return local.get(K_DRAFTS, []) || []; }
  /* Черновики живут только в памяти, до перезагрузки: хранилище браузера закрыто
     со старта или отказало на ходу (ревью 0005, R5, R10). */
  function draftsVolatile() { return local.volatile(K_DRAFTS) || local.volatile(K_FLOWOPS); }
  function setDrafts(list) {
    local.set(K_DRAFTS, list && list.length ? list : null);
    bus.emit('comments');
  }
  /* o.created, o.author — у черновика, в который превратилось неудачное
     добавление: та же подпись, что у исходной операции, и повтор узнает её на
     диске, если запись всё же дошла (ревью 0005, R9). */
  function addDraft(text, page, step, o) {
    o = o || {};
    var list = drafts();
    var id = newRef('d');
    list.push({ op: 'add', id: id, text: text, page: page || null, step: step || null, created: o.created || core.stamp(),
      author: o.author !== undefined ? o.author || null : prefs().author || null });
    setDrafts(list);
    return id;
  }
  function editDraft(id, text) { setDrafts(drafts().map(function (d) { if (d.id === id) d.text = text; return d; })); }
  function removeDraft(id) { setDrafts(drafts().filter(function (d) { return d.id !== id; })); }
  /* Снять ровно записанные: черновик, добавленный в другой вкладке во время записи, остаётся (R13). */
  function removeDrafts(ids) { setDrafts(drafts().filter(function (d) { return ids.indexOf(d.id) < 0; })); }

  /** Комментарии для показа: записанные из зеркала + черновики (draft: id). */
  function comments() {
    var d = data();
    var saved = d && d.comments ? d.comments.slice() : [];
    var out = saved.map(function (c) { return Object.assign({ draft: null }, c); });
    drafts().forEach(function (x) {
      out.push({ n: null, status: 'open', created: x.created, author: x.author, page: x.page, step: x.step, resolution: null, body: x.text, draft: x.id });
    });
    return out;
  }

  function newRef(prefix) { return (prefix || 'r') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---------------- черновые операции схемы (flows.yaml, задача 0005a) ---------------- */

  /* Журнал операций схемы, не записанных на диск: без подключённой папки или
     после ошибки записи. Превью — зеркало плюс журнал через core.applyFlowOps:
     черновые состояния видны на схеме с пометкой Unsaved и проигрываются так
     же, как записанные. */
  var K_FLOWOPS = 'pp.flowOps:' + APP;
  var viewCache = { key: null, value: null };

  function flowOps() { return local.get(K_FLOWOPS, []) || []; }
  function setFlowOps(list) {
    local.set(K_FLOWOPS, list && list.length ? list : null);
    viewCache.key = null;
    bus.emit('flows-drafts');
  }
  function addFlowOps(ops) { setFlowOps(flowOps().concat(ops)); }
  function removeFlowOps(refs) { setFlowOps(flowOps().filter(function (op) { return refs.indexOf(op.ref) < 0; })); }

  /** Превью схемы: { doc, res, ops } — документ из зеркала с применённым журналом. */
  function preview() {
    var d = data();
    var ops = flowOps();
    var key = dataVersion + '|' + JSON.stringify(ops);
    if (viewCache.key === key) return viewCache.value;
    var doc = { header: d && d.flowsHeader || [], version: 1, lastState: d && typeof d.lastState === 'number' ? d.lastState : null,
      flows: d && Array.isArray(d.flows) ? JSON.parse(JSON.stringify(d.flows)) : [] };
    core.numberStates(doc);   // зеркало нумерует сборка; на случай файла без номеров — те же номера, что даст запись
    var res = core.applyFlowOps(doc, ops, { dedupe: true });
    Object.keys(res.states).forEach(function (ref) {
      var hit = core.findState(doc, res.states[ref].state);
      if (hit) hit.step.draft = ref;
    });
    Object.keys(res.flows).forEach(function (ref) {
      doc.flows.forEach(function (f) { if (f.id === res.flows[ref]) f.draft = ref; });
    });
    viewCache = { key: key, value: { doc: doc, res: res, ops: ops } };
    return viewCache.value;
  }

  /* Черновые номера и id, которые человек видит сейчас. Подключение папки
     пересчитывает превью по свежему файлу ещё до записи журнала — сверка
     «показанный → выданный» (тост «State 03 saved as State 13», ссылки
     проигрывателя и рекордера) идёт от этого снимка. */
  function shownDrafts() { return flowOps().length ? preview().res : null; }

  /** Сценарии для интерфейса и проигрывателя: без черновиков — прямо из зеркала, без копии. */
  function flows() {
    var d = data();
    if (!flowOps().length) return d && Array.isArray(d.flows) ? d.flows : [];
    return preview().doc.flows;
  }
  /** Наибольший выданный номер с учётом черновиков — от него считается черновой номер. */
  function lastState() {
    var d = data();
    if (!flowOps().length) return d && typeof d.lastState === 'number' ? d.lastState : preview().doc.lastState;
    return preview().doc.lastState;
  }

  /* ---------------- папка на диске ---------------- */

  var st = {
    status: 'mirror',   // mirror | needs-permission | linked | unsupported
    supported: typeof window.showDirectoryPicker === 'function',
    dir: null,          // хендл папки панели
    appDir: null,       // хендл папки приложения (если известен — для app.json)
    saved: null,        // { handle, key } из IndexedDB, если ждёт разрешения
    key: null,
    error: null,        // последняя ошибка записи или подключения
    flowsError: false,  // ошибка — у записи схемы: в Alert «Discard unsaved flow changes»
    mirrorError: null,  // зеркало не записано, но данные на диске (производный файл)
    note: null          // 'updated' — зеркало обновлено с диска
  };
  if (!st.supported) st.status = 'unsupported';

  function setStatus(s) { st.status = s; bus.emit('store', status()); }
  function status() { return st.status; }

  function idb() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('IndexedDB is unavailable')); return; }
      var r = indexedDB.open('proto-panel', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('handles'); };
      r.onsuccess = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error); };
    });
  }
  function idbDo(mode, fn) {
    return idb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('handles', mode);
        var req = fn(tx.objectStore('handles'));
        tx.oncomplete = function () { db.close(); resolve(req && req.result); };
        tx.onerror = function () { db.close(); reject(tx.error); };
        tx.onabort = function () { db.close(); reject(tx.error); };
      });
    });
  }
  function idbGet(k) { return idbDo('readonly', function (s) { return s.get(k); }).catch(function () { return null; }); }
  function idbSet(k, v) { return idbDo('readwrite', function (s) { return s.put(v, k); }).catch(function (e) { console.warn(LOG, 'folder handle not stored:', e); }); }
  function idbDel(k) { return idbDo('readwrite', function (s) { return s.delete(k); }).catch(function () {}); }

  function has(h, name, kind) {
    var get = kind === 'dir' ? h.getDirectoryHandle(name) : h.getFileHandle(name);
    return get.then(function () { return true; }, function () { return false; });
  }

  /* Что выбрал человек: корень проекта, папку приложения или папку панели. */
  function resolvePanel(h) {
    var segs = String(ctx.base || 'apps').split('/').concat(APP.split('/')).filter(Boolean);
    return has(h, 'project.json', 'file').then(function (isRoot) {
      if (!isRoot) return null;
      return segs.reduce(function (p, s) {
        return p.then(function (d) { return d ? d.getDirectoryHandle(s).catch(function () { return null; }) : null; });
      }, Promise.resolve(h)).then(function (appDir) {
        if (!appDir) return null;
        return appDir.getDirectoryHandle(DIR).then(function (dir) { return { dir: dir, appDir: appDir, key: 'root' }; }, function () { return null; });
      });
    }).then(function (r) {
      if (r) return r;
      return Promise.all([has(h, ctx.manifest || 'app.json', 'file'), has(h, DIR, 'dir')]).then(function (x) {
        if (x[0] && x[1]) return h.getDirectoryHandle(DIR).then(function (dir) { return { dir: dir, appDir: h, key: 'app:' + APP }; });
        if (h.name === DIR) return has(h, FILES.flows, 'file').then(function (y) { return y ? { dir: h, appDir: null, key: 'app:' + APP } : null; });
        return null;
      });
    }).then(function (r) {
      if (!r) throw new Error(t('err.wrongFolder', { path: (ctx.base || 'apps') + '/' + APP + '/' + DIR, base: ctx.base || 'apps' }));
      return r;
    });
  }

  function readText(name) {
    return st.dir.getFileHandle(name).then(function (fh) { return fh.getFile(); }).then(function (f) { return f.text(); }, function (e) {
      if (e && e.name === 'NotFoundError') return null;
      throw e;
    });
  }
  function writeText(name, text) {
    return st.dir.getFileHandle(name, { create: true }).then(function (fh) { return fh.createWritable(); }).then(function (w) {
      return w.write(text).then(function () { return w.close(); });
    });
  }

  /* Название приложения — как у оснастки: из app.json, если папка приложения доступна. */
  function appMeta() {
    var d = data();
    var fallbackId = APP.split('/').pop();
    var fb = d && d.app ? { id: d.app.id || fallbackId, title: d.app.title || d.app.id || fallbackId } : { id: fallbackId, title: fallbackId };
    if (!st.appDir) return Promise.resolve(fb);
    return st.appDir.getFileHandle(ctx.manifest || 'app.json').then(function (fh) { return fh.getFile(); }).then(function (f) { return f.text(); }).then(function (tx) {
      var j = JSON.parse(tx);
      var id = typeof j.id === 'string' && j.id.trim() ? j.id.trim() : fallbackId;
      return { id: id, title: typeof j.title === 'string' && j.title.trim() ? j.title.trim() : id };
    }).catch(function () { return fb; });
  }

  /* Зеркало — производный файл: основной файл уже на диске, поэтому сбой зеркала
     не проваливает сохранение (ревью 0005, R3, R9). На следующем открытии
     свежесть увидит расхождение хешей и пересоберёт зеркало. */
  function mirrorFailed(e) {
    st.mirrorError = t('err.mirror', { mirror: FILES.mirror, why: msg(e) });
    bus.emit('store', status());
  }

  function rebuildMirror(flowsText, commentsText) {
    return appMeta().then(function (app) {
      var o = { app: app, flowsText: flowsText || '', commentsText: commentsText || '' };
      var fresh = core.mirrorData(o);
      return writeText(FILES.mirror, core.mirrorText(o)).then(function () {
        st.mirrorError = null;
        replaceData(fresh);
        bus.emit('data');
      }, function (e) {
        replaceData(fresh);
        bus.emit('data');
        mirrorFailed(e);
      });
    });
  }

  /* Второй файл не прочитался — зеркало не собрать: в памяти обновляется
     записанная часть, sources остаются прежними (по ним следующее открытие
     пересоберёт зеркало). */
  function commentsInMemory(text) {
    var c = core.parseComments(text);
    replaceData({ comments: c.model.comments, commentsPreamble: c.model.preamble, commentErrors: [] });
    bus.emit('data');
  }
  function flowsInMemory(text) {
    var f = core.readFlows(text);
    replaceData({ flows: f.flows, flowErrors: [], flowsHeader: f.header, lastState: f.doc ? f.doc.lastState : null });
    bus.emit('data');
  }

  /* Свежесть: файлы правили после сборки (агент, человек) — перечитать и пересобрать зеркало. */
  function freshness(force) {
    return Promise.all([readText(FILES.flows), readText(FILES.comments)]).then(function (x) {
      var d = data();
      var flowsText = x[0] || '', commentsText = x[1] === null ? core.emptyComments() : x[1];
      var stale = !d || !d.sources || core.hash(flowsText) !== d.sources.flows || core.hash(commentsText) !== d.sources.comments;
      if (!stale && !force) return false;
      return rebuildMirror(flowsText, commentsText).then(function () {
        if (stale) { st.note = 'updated'; bus.emit('store', status()); }
        return stale;
      });
    });
  }

  /* Подключить папку: хендлы, статус, свежесть. Черновики здесь не пишутся —
     attach зовётся и изнутри записи (разрешение в новой сессии), а запись
     черновиков встала бы в очередь за ней самой (ревью 0005, R7). */
  function attach(r, persistHandle, handle) {
    st.dir = r.dir;
    st.appDir = r.appDir;
    st.key = r.key;
    st.saved = null;
    st.error = null;
    st.flowsError = false;
    st.mirrorError = null;
    var chain = Promise.resolve();
    if (persistHandle) {
      chain = idbSet(r.key, handle).then(function () { return r.key === 'root' ? idbDel('app:' + APP) : null; });
    }
    return chain.then(function () {
      setStatus('linked');
      return freshness(false);
    });
  }

  /* Подключить и дописать черновики — только вне очереди записи. Сначала
     операции схемы, потом комментарии: комментарий к черновому состоянию
     получает выданный номер (задача 0005a, §7.4). Черновики не записались —
     папка всё равно подключена: это ошибка записи (она в Alert), а не
     подключения (ревью 0005, R8). */
  function connect(r, persistHandle, handle) {
    var shown = shownDrafts();
    return attach(r, persistHandle, handle).then(function (updated) {
      return flushAll(shown).then(function (n) { return { updated: updated, drafts: n }; },
        function (e) { return { updated: updated, drafts: 0, error: e }; });
    });
  }

  /** Записать черновые операции схемы и черновики комментариев. → число записанных.
      shown — снимок черновых номеров до подключения (shownDrafts). */
  function flushAll(shown) {
    return flushFlowOps(shown).then(function (a) { return flushDrafts().then(function (b) { return a + b; }); });
  }

  /** Записать черновики комментариев одной правкой. Список берётся под очередью и блокировкой (commit). */
  function flushDrafts() {
    if (!drafts().length) return Promise.resolve(0);
    return commit(null, { drafts: true }).then(function (r) {
      if (r.drafts) bus.emit('drafts-saved', r.drafts);
      return r.drafts;
    });
  }

  /** Записать журнал операций схемы одной правкой flows.yaml. → число записанных состояний.
      Событие 'states-saved' { count, moved: [{ from, to }] } — moved: номера, выданные
      не такими, какими их видел человек (§6.2). */
  function flushFlowOps(shown) {
    if (!flowOps().length) return Promise.resolve(0);
    return commitFlows(null, { journal: true, before: shown }).then(function (r) {
      var n = r && r.res ? Object.keys(r.res.states).length : 0;
      var moved = [];
      if (r && r.map) Object.keys(r.map.states).forEach(function (ref) {
        var m = r.map.states[ref];
        if (m.from && m.from.state !== m.to.state) moved.push({ from: m.from.state, to: m.to.state });
      });
      if (n) bus.emit('states-saved', { count: n, moved: moved });
      return n;
    });
  }

  /** Старт: хендл из IndexedDB — сначала папки приложения, потом корня проекта. */
  function init() {
    if (!st.supported) { setStatus('unsupported'); return Promise.resolve(status()); }
    return idbGet('app:' + APP).then(function (h) {
      return h ? { handle: h, key: 'app:' + APP } : idbGet('root').then(function (r) { return r ? { handle: r, key: 'root' } : null; });
    }).then(function (saved) {
      if (!saved || !saved.handle || typeof saved.handle.queryPermission !== 'function') { setStatus('mirror'); return status(); }
      return saved.handle.queryPermission({ mode: 'readwrite' }).then(function (perm) {
        if (perm === 'granted') {
          return resolvePanel(saved.handle).then(function (r) { return connect(r, false); }).then(function () { return status(); });
        }
        st.saved = saved;
        setStatus(perm === 'prompt' ? 'needs-permission' : 'mirror');
        return status();
      });
    }).catch(function (e) {
      console.warn(LOG, 'project folder not connected:', msg(e));
      st.error = msg(e);
      setStatus('mirror');
      return status();
    });
  }

  /** Подключить папку (жест пользователя): системный выбор папки. */
  function link() {
    if (!st.supported) return Promise.reject(new Error(t('err.unsupported')));
    return window.showDirectoryPicker({ id: 'proto-panel', mode: 'readwrite' }).then(function (h) {
      return resolvePanel(h).then(function (r) { return connect(r, true, h); });
    });
  }

  /** Подключить готовый хендл без системного диалога (проверка на OPFS). В IndexedDB не пишется. */
  function linkHandle(h) {
    return resolvePanel(h).then(function (r) { return connect(r, false); });
  }

  /* Разрешение на сохранённую папку. Зовётся в жесте пользователя — из
     обработчика клика или клавиши, до очереди и блокировок: браузер даёт
     спросить разрешение только сразу после жеста. */
  function requestAccess() {
    var s = st.saved;
    if (!s) return Promise.reject(new Error(t('err.notConnected')));
    return s.handle.requestPermission({ mode: 'readwrite' }).then(function (perm) {
      if (perm !== 'granted') throw new Error(t('err.denied'));
      return resolvePanel(s.handle);
    });
  }

  /** Разрешить доступ к сохранённой папке (жест пользователя) и дописать черновики. */
  function permit() {
    if (!st.saved) return link();
    return requestAccess().then(function (r) { return connect(r, false); });
  }

  function unlink() {
    var key = st.key || (st.saved && st.saved.key);
    st.dir = null; st.appDir = null; st.key = null; st.saved = null; st.note = null;
    setStatus(st.supported ? 'mirror' : 'unsupported');
    return key ? idbDel(key) : Promise.resolve();
  }

  /** Перечитать файлы с диска; черновики, не записанные из-за ошибки, — дописать. */
  function refresh() {
    if (st.status !== 'linked') return Promise.reject(new Error(t('err.notConnected')));
    var shown = shownDrafts();
    return freshness(true).then(function (changed) {
      return flushAll(shown).then(function () { return changed; });
    });
  }

  /* ---------------- запись: прочитать → слить → записать ---------------- */

  function FormatError(file, errors) {
    this.name = 'FormatError';
    this.errors = errors;
    this.message = t('err.format', { file: file, list: errors.map(function (e) { return t('err.formatLine', { line: e.line, text: e.text }); }).join('; ') });
  }

  function retryError(text) {
    var e = new Error(text);
    e.name = 'RetryError';
    return e;
  }

  /* Внутри очереди доступ только проверяется: разрешение в новой сессии
     спрашивает commit до очереди, в жесте пользователя (ревью 0005, R7). */
  function ensureAccess() {
    if (st.status === 'linked' && st.dir) return Promise.resolve();
    return Promise.reject(new Error(st.status === 'needs-permission' ? t('err.needPermission') : t('err.notConnected')));
  }

  /* Одна очередь записи на документ: записи страницы идут по очереди, а не
     параллельно (у фрейма свой window и своя очередь, но панели во фрейме нет).
     Код внутри очереди сам запись не начинает — она встала бы за ним и ждала
     бы его вечно (ревью 0005, R7). */
  function pageQueue(fn) {
    var q = window.__ppSaveQueue = window.__ppSaveQueue || Promise.resolve();
    var run = q.then(fn, fn);
    window.__ppSaveQueue = run.then(function () {}, function () {});
    return run;
  }

  /* Между вкладками одного источника цикл «чтение → изменение → запись»
     держит Web Locks. Источник без блокировок (file://) — пишем без неё:
     окно сужают повторное чтение перед записью и проверка после. */
  function tabLock(name, fn) {
    var nav = window.navigator || null;
    if (!nav || !nav.locks || typeof nav.locks.request !== 'function') return fn();
    var reached = false;
    return nav.locks.request(name, { mode: 'exclusive' }, function () {
      return Promise.resolve(fn()).then(function (r) { reached = true; return r; }, function (e) { reached = true; throw e; });
    }).catch(function (e) {
      if (reached) throw e;   // это ошибка самой записи, а не блокировки
      return fn();            // блокировки недоступны — пишем в одиночном режиме
    });
  }

  /* Доступ перед записью: в новой сессии — разрешение в жесте пользователя. */
  function withAccess() {
    if (st.status !== 'needs-permission') return Promise.resolve(false);
    return requestAccess().then(function (r) { return attach(r, false); }).then(function () { return true; });
  }

  var SAVE_TRIES = 3;

  /* --- comments.md --- */

  /* Подпись добавления: одинаковые текст (в той форме, что ляжет в файл), время,
     автор и контекст — это один и тот же комментарий. По подписи повтор записи
     и черновики узнают «своё» добавление, уже дошедшее до диска, и не
     задваивают его (ревью 0005, R1, R3, R9, R13). */
  function metaLine(v) { var s = v == null ? '' : core.oneLine(v); return s || null; }
  function stepKey(s) { return s ? core.stepRefText(s) : null; }
  function addSig(c) {
    return JSON.stringify([core.cleanBody(c.body), metaLine(c.created), metaLine(c.author), metaLine(c.page), stepKey(c.step)]);
  }
  /* Подписи комментариев файла → их номера. Одинаковых комментариев может быть
     несколько: каждое «своё» добавление забирает по одному номеру. */
  function sigIndex(list) {
    var idx = {};
    list.forEach(function (c) { var k = addSig(c); (idx[k] = idx[k] || []).push(c.n); });
    return idx;
  }
  /* Ссылка черновика на черновое состояние: внутренняя метка ref в файл не идёт. */
  function fileStep(step) { return step && step.state != null ? { state: step.state } : step || null; }

  function apply(model, op, out, pre, retry) {
    var list = model.comments;
    var find = function (n) {
      var c = list.filter(function (x) { return x.n === n; })[0];
      if (!c) throw new Error(t('err.gone', { n: num(n) }));
      return c;
    };
    if (op.op === 'add') {
      var cand = { body: String(op.text), created: op.created || core.stamp(), author: (op.author !== undefined ? op.author : (prefs().author || null)) || null, page: op.page || null, step: fileStep(op.step) };
      var mine = pre && pre[addSig(cand)];
      if (mine && mine.length) { out.push(mine.shift()); return; }   // уже на диске: прошлая попытка или черновик
      var n = core.nextNumber(list);
      list.push(Object.assign({ n: n, status: 'open', resolution: null }, cand));
      out.push(n);
    } else if (op.op === 'edit') {
      find(op.n).body = String(op.text);
    } else if (op.op === 'status') {
      var c = find(op.n);
      c.status = op.status;
      if (op.resolution !== undefined) c.resolution = op.resolution || null;
      else if (op.status === 'open') c.resolution = null;
    } else if (op.op === 'delete') {
      /* повтор после неподтверждённой записи: комментария уже нет — удаление состоялось */
      if (retry && !list.some(function (x) { return x.n === op.n; })) return;
      find(op.n);
      model.comments = list.filter(function (x) { return x.n !== op.n; });
    }
  }

  /* Повторный разбор записи должен вернуть тот же состав комментариев. Сравнение —
     с канонической формой, которую даёт сама запись: заголовки в тексте
     понижены, незакрытый блок кода закрыт, метаданные — одной строкой (ревью
     0005, R2, R8). null — запись безопасна. */
  function roundTrip(model, text) {
    var back = core.parseComments(text);
    if (back.errors.length) return t('err.reparse', { line: back.errors[0].line, text: back.errors[0].text });
    var a = model.comments.slice().sort(function (x, y) { return x.n - y.n; });
    var b = back.model.comments;
    if (a.length !== b.length) return t('err.count', { b: b.length, a: a.length });
    for (var i = 0; i < a.length; i++) {
      var x = a[i], y = b[i];
      if (x.n !== y.n || x.status !== y.status || core.cleanBody(x.body) !== y.body || stepKey(x.step) !== stepKey(y.step)
        || ['created', 'author', 'page', 'resolution'].some(function (k) { return metaLine(x[k]) !== metaLine(y[k]); })) return t('err.differs', { n: num(x.n) });
    }
    return null;
  }

  /* Одна попытка: свежий файл → правки → контрольный повторный разбор → запись →
     сверка, что на диске то, что писали. Конкурентное изменение и
     неподтверждённая запись — RetryError: попытка повторяется с новым снимком
     и узнаёт свои добавления по подписи (ревью 0005, R1, R9). После сверки
     операция состоялась: onCommit снимает записанные черновики, а сбой чтения
     flows.yaml или записи зеркала сохранение уже не проваливает (R3, R9).
     Номера добавленных — только этой попытки (R12). */
  function attemptOnce(ops, usePre, retry, onCommit) {
    var written = null, added = [];
    return ensureAccess().then(function () {
      return readText(FILES.comments);
    }).then(function (md) {
      var base = md === null ? core.emptyComments() : md;
      var p = core.parseComments(base);
      if (p.errors.length) throw new FormatError(FILES.comments, p.errors);
      return readText(FILES.comments).then(function (again) {
        var fresh = again === null ? core.emptyComments() : again;
        if (fresh !== base) throw retryError(t('err.changedBeforeWrite', { file: FILES.comments }));
        /* Подписи — у повторной попытки и у черновиков: узнать «своё» добавление,
           уже дошедшее до диска. У первой попытки новой операции совпадение
           подписи — самостоятельный комментарий (два одинаковых текста за одну
           минуту), его пропускать нельзя. */
        var pre = usePre ? sigIndex(p.model.comments) : null;
        ops.forEach(function (op) { apply(p.model, op, added, pre, retry); });
        written = core.serializeComments(p.model);
        var bad = roundTrip(p.model, written);
        if (bad) throw new Error(t('err.roundTrip', { why: bad }));
        return writeText(FILES.comments, written);
      });
    }).then(function () {
      return readText(FILES.comments).then(null, function (e) {
        throw retryError(t('err.notReread', { file: FILES.comments, why: msg(e) }));
      });
    }).then(function (disk) {
      if (disk !== written) throw retryError(t('err.overwritten', { file: FILES.comments }));
      if (onCommit) onCommit();
      return readText(FILES.flows).then(function (flowsText) {
        return rebuildMirror(flowsText || '', written);
      }, function (e) {
        commentsInMemory(written);
        mirrorFailed(new Error(t('err.unread', { file: FILES.flows, why: msg(e) })));
      });
    }).then(function () { return added; });
  }

  /* Цикл записи внутри очереди и блокировки. Черновики (opts.drafts) берутся
     здесь, свежим списком: вторая вкладка могла их уже записать или добавить
     новые; после подтверждённой записи снимаются ровно записанные (ревью 0005,
     R13). Черновик со ссылкой на ещё не записанное состояние ждёт записи
     схемы (задача 0005a, §7.4). Черновики пишутся с подписями всегда: их время
     зафиксировано при создании, и повтор после неподтверждённой записи их не
     задвоит (R9). */
  function work(stamped, opts) {
    var batch = stamped, ids = null;
    if (opts.drafts) {
      var list = drafts().filter(function (d) { return !(d.step && d.step.ref); });
      if (!list.length) return Promise.resolve({ added: [], drafts: 0 });
      ids = list.map(function (d) { return d.id; });
      batch = list.map(function (x) { return { op: 'add', text: x.text, page: x.page, step: x.step, created: x.created, author: x.author || null }; });
    }
    var tries = 0;
    function go() {
      return attemptOnce(batch, !!ids || tries > 0, tries > 0, ids ? function () { removeDrafts(ids); } : null).catch(function (e) {
        if (e && e.name === 'RetryError' && ++tries < SAVE_TRIES) return go();
        if (e && e.name === 'RetryError') throw new Error(t('err.unconfirmed', { file: FILES.comments, why: e.message }));
        throw e;
      });
    }
    return go().then(function (added) { return { added: added, drafts: ids ? ids.length : 0 }; });
  }

  /* Записать операции комментариев (или черновики) одной правкой свежего файла:
     { added: номера добавленных, drafts: сколько черновиков записано }.
     Конкурентные записи — вторая вкладка, внешний редактор — не теряются:
     попытка перечитывает файл и повторяет слияние (ревью 0005, R1).
     Разрешение на папку в новой сессии спрашивается здесь, до очереди: это ещё
     жест пользователя, а подключение изнутри очереди не пишет черновики — они
     дописываются следом, отдельной записью (R7). */
  function commit(ops, opts) {
    opts = opts || {};
    /* Время создания фиксируется один раз на вызов: повторная попытка должна
       узнать «своё» добавление на диске по той же подписи. */
    var stamped = (ops || []).map(function (op) {
      return op.op === 'add' && !op.created ? Object.assign({}, op, { created: core.stamp() }) : op;
    });
    var granted = false, shown = shownDrafts();
    return withAccess().then(function (g) {
      granted = g;
      return pageQueue(function () { return tabLock('proto-panel:' + APP, function () { return work(stamped, opts); }); });
    }).then(function (res) {
      st.error = null;
      st.flowsError = false;
      bus.emit('saved', { added: res.added, ops: ops || [], fromDrafts: !!opts.drafts });
      bus.emit('store', status());
      if (!granted || opts.drafts || (!drafts().length && !flowOps().length)) return res;
      return flushAll(shown).then(function () { return res; }, function () { return res; });
    }, function (e) {
      if (e && e.name === 'AbortError') throw e;
      st.error = msg(e);
      st.flowsError = false;
      console.warn(LOG, 'write failed:', st.error);
      bus.emit('store', status());
      throw e;
    });
  }

  /** Записать операции комментариев одной правкой свежего файла. Возвращает номера добавленных. */
  function save(ops) { return commit(ops).then(function (r) { return r.added; }); }

  /* --- flows.yaml (задача 0005a) --- */

  function FlowOpsError(errors) {
    this.name = 'FlowOpsError';
    this.errors = errors;
    this.message = t('err.ops', { list: errors.map(function (e) { return t('err.ops.' + e.code); }).join('; ') });
  }

  /* Шапка для файла без своей: та, что у зеркала (её написала сборка). */
  function flowsHeader() { var d = data(); return d && d.flowsHeader && d.flowsHeader.length ? d.flowsHeader : null; }

  /* Одна попытка записи схемы — тот же путь, что у комментариев: свежий файл →
     номера (файл мог прийти от агента без номеров) → операции → каноническая
     запись → контроль повторного разбора → запись → сверка → зеркало.
     Номер состояния выдаётся по свежему файлу. */
  function attemptFlows(ops, dedupe, onCommit) {
    var written = null, res = null;
    return ensureAccess().then(function () {
      return readText(FILES.flows);
    }).then(function (src) {
      var base = src === null ? '' : src;
      var r = core.readFlows(base);
      if (r.errors.length) throw new FormatError(FILES.flows, r.errors);
      if (r.innerComments.length) throw new FormatError(FILES.flows, r.innerComments.map(function (n) { return { line: n, text: t('err.innerComment') }; }));
      return readText(FILES.flows).then(function (again) {
        if ((again === null ? '' : again) !== base) throw retryError(t('err.changedBeforeWrite', { file: FILES.flows }));
        var doc = r.doc;
        core.numberStates(doc);
        res = core.applyFlowOps(doc, ops, { dedupe: dedupe });
        if (res.errors.length) throw new FlowOpsError(res.errors);
        written = core.serializeFlows(doc, { header: flowsHeader(), title: (data() && data().app && data().app.title) || '' });
        var back = core.readFlows(written);
        if (back.errors.length || JSON.stringify(back.flows) !== JSON.stringify(doc.flows)) throw new Error(t('err.flowsRoundTrip'));
        return writeText(FILES.flows, written);
      });
    }).then(function () {
      return readText(FILES.flows).then(null, function (e) {
        throw retryError(t('err.notReread', { file: FILES.flows, why: msg(e) }));
      });
    }).then(function (disk) {
      if (disk !== written) throw retryError(t('err.overwritten', { file: FILES.flows }));
      if (onCommit) onCommit();
      return readText(FILES.comments).then(function (commentsText) {
        return rebuildMirror(written, commentsText === null ? core.emptyComments() : commentsText);
      }, function (e) {
        flowsInMemory(written);
        mirrorFailed(new Error(t('err.unread', { file: FILES.comments, why: msg(e) })));
      });
    }).then(function () { return res; });
  }

  function workFlows(ops, opts) {
    var batch = ops, refs = null;
    if (opts.journal) {
      batch = flowOps();
      if (!batch.length) return Promise.resolve(null);
      refs = batch.map(function (op) { return op.ref; });
    }
    var tries = 0;
    function go() {
      return attemptFlows(batch, !!refs || tries > 0, refs ? function () { removeFlowOps(refs); } : null).catch(function (e) {
        if (e && e.name === 'RetryError' && ++tries < SAVE_TRIES) return go();
        if (e && e.name === 'RetryError') throw new Error(t('err.unconfirmed', { file: FILES.flows, why: e.message }));
        throw e;
      });
    }
    return go();
  }

  /* После записи черновые номера и id могли смениться (агент или вторая
     вкладка успели выдать номер): подписчики — проигрыватель, рекордер,
     интерфейс — сопоставляют их по ref. Ссылки черновиков комментариев на
     черновые состояния получают выданный номер. */
  function remap(before, res) {
    var map = { states: {}, flows: {} };
    Object.keys(res.states).forEach(function (ref) { map.states[ref] = { from: before && before.states[ref] || null, to: res.states[ref] }; });
    Object.keys(res.flows).forEach(function (ref) { map.flows[ref] = { from: before && before.flows[ref] || null, to: res.flows[ref] }; });
    var list = drafts(), changed = false;
    list.forEach(function (d) {
      if (d.step && d.step.ref && map.states[d.step.ref]) { d.step = { state: map.states[d.step.ref].to.state }; changed = true; }
    });
    if (changed) setDrafts(list);
    return map;
  }

  /**
   * Записать операции схемы (или журнал черновиков, opts.journal) одной правкой
   * flows.yaml. → { res, map, draft: false } — выданные номера; без папки или
   * после ошибки записи (кроме логических ошибок операций) с opts.orJournal
   * операции ложатся в журнал: → { res: превью, draft: true }.
   */
  function commitFlows(ops, opts) {
    opts = opts || {};
    var shown = shownDrafts();
    var before = opts.journal ? opts.before || shown : null;
    function toJournal(err) {
      addFlowOps(ops);
      var pv = preview().res;
      return { res: pv, map: null, draft: true, error: err || null };
    }
    if (!opts.journal && opts.orJournal && st.status !== 'linked' && st.status !== 'needs-permission') return Promise.resolve(toJournal(null));
    var granted = false;
    return withAccess().then(function (g) {
      granted = g;
      return pageQueue(function () { return tabLock('proto-panel:' + APP, function () { return workFlows(ops, opts); }); });
    }).then(function (res) {
      st.error = null;
      st.flowsError = false;
      if (!res) return { res: null, map: null, draft: false };
      var map = remap(before, res);
      bus.emit('flows-saved', { res: res, map: map, journal: !!opts.journal });
      bus.emit('store', status());
      var out = { res: res, map: map, draft: false };
      if (!granted || opts.journal || (!drafts().length && !flowOps().length)) return out;
      return flushAll(shown).then(function () { return out; }, function () { return out; });
    }, function (e) {
      if (e && e.name === 'AbortError') throw e;
      st.error = msg(e);
      st.flowsError = !!opts.journal || e.name !== 'FlowOpsError';
      console.warn(LOG, 'flows write failed:', st.error);
      bus.emit('store', status());
      if (!opts.journal && opts.orJournal && e.name !== 'FlowOpsError') return toJournal(e);
      throw e;
    });
  }

  /** Операции схемы: записать на диск, без папки — в журнал черновиков. */
  function saveFlows(ops) { return commitFlows(ops, { orJournal: true }); }

  /** Сбросить журнал черновых операций схемы (после подтверждения человеком). */
  function discardFlowOps() {
    var refs = flowOps().map(function (op) { return op.ref; });
    setFlowOps([]);
    var list = drafts(), changed = false;
    list.forEach(function (d) { if (d.step && d.step.ref && refs.indexOf(d.step.ref) >= 0) { d.step = null; changed = true; } });
    if (changed) setDrafts(list);
    st.error = null;
    st.flowsError = false;
    bus.emit('store', status());
  }

  /* ---------------- без папки: скачать и скопировать ---------------- */

  function exportText() {
    var d = data();
    var model = { front: ['type: proto-comments'], preamble: d && typeof d.commentsPreamble === 'string' ? d.commentsPreamble : undefined, comments: (d && d.comments ? d.comments : []).slice() };
    var n = core.nextNumber(model.comments);
    drafts().forEach(function (x) {
      model.comments.push({ n: n++, status: 'open', created: x.created, author: x.author || null, page: x.page || null, step: fileStep(x.step), resolution: null, body: x.text });
    });
    return core.serializeComments(model);
  }

  /** Канонический flows.yaml превью: зеркало с черновыми операциями (шапка и lastState — из зеркала). */
  function exportFlowsText() {
    var pv = preview();
    var doc = JSON.parse(JSON.stringify(pv.doc));
    doc.flows.forEach(function (f) { delete f.draft; f.steps.forEach(function (s) { delete s.draft; }); });
    return core.serializeFlows(doc, { header: flowsHeader(), title: (data() && data().app && data().app.title) || '' });
  }

  function downloadText(name, text, type) {
    var blob = new Blob([text], { type: type + ';charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.className = 'pp-hidden';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function download() { downloadText(FILES.comments, exportText(), 'text/markdown'); }
  function downloadFlows() { downloadText(FILES.flows, exportFlowsText(), 'text/yaml'); }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }
  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.className = 'pp-hidden';
      ta.setAttribute('readonly', '');
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      if (ok) resolve(); else reject(new Error(t('err.clipboard')));
    });
  }

  /* Два кадра — страница успела перерисоваться. Во вкладке в фоне браузер
     кадров почти не даёт, поэтому у ожидания есть запасной таймер. */
  function frames(n) {
    return new Promise(function (resolve) {
      var left = n || 1, done = false;
      var tm = setTimeout(finish, 100 * left);
      function finish() { if (!done) { done = true; clearTimeout(tm); resolve(); } }
      (function tick() { if (--left < 0) { finish(); return; } requestAnimationFrame(tick); })();
    });
  }

  PP._bus = bus;
  PP._store = {
    frames: frames, newRef: newRef,
    APP: APP, DIR: DIR, FILES: FILES,
    local: local, session: session,
    prefs: prefs, setPref: setPref, ui: ui, setUi: setUi,
    data: data, replaceData: replaceData,
    drafts: drafts, draftsVolatile: draftsVolatile, addDraft: addDraft, editDraft: editDraft, removeDraft: removeDraft, comments: comments,
    flows: flows, lastState: lastState, preview: preview, flowOps: flowOps, setFlowOps: setFlowOps, saveFlows: saveFlows, discardFlowOps: discardFlowOps,
    status: status, state: st, init: init, link: link, linkHandle: linkHandle, permit: permit, unlink: unlink, refresh: refresh,
    flushDrafts: flushDrafts, flushFlowOps: flushFlowOps, flushAll: flushAll,
    save: save, exportText: exportText, exportFlowsText: exportFlowsText, download: download, downloadFlows: downloadFlows, copyText: copyText,
    FormatError: FormatError
  };
})();

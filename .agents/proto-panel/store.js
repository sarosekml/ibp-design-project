/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — хранение (store.js).

   Что здесь:
     - шина событий панели (ProtoPanel._bus);
     - хранилища браузера без падений: localStorage (настройки pp.prefs,
       выбор таба и сценария pp.ui:<app>, черновики pp.drafts:<app>) и
       sessionStorage (состояние сценария — его ведёт runner.js). По file://
       хранилище бывает недоступно — тогда панель живёт до перезагрузки;
     - данные: всегда из зеркала window.ProtoPanelData, без копии — после
       записи на диск панель заменяет поля в том же объекте;
     - подключение папки через File System Access API: корень проекта, папка
       приложения или сама папка панели; хендлы — в IndexedDB «proto-panel»;
     - запись комментария — всегда «прочитать → слить → записать»: свежий
       comments.md с диска, операции поверх, каноническая запись ядром и
       зеркало тем же core.mirrorText, что у оснастки;
     - без папки — черновики в браузере, «Скачать comments.md», «Скопировать».
   Файлы вне <приложение>/proto-panel/ панель не пишет; flows.yaml из
   браузера не пишется никогда. Форматы — .agents/proto-panel/README.md.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel = window.ProtoPanel || {};
  var core = window.ProtoPanelCore;
  var ctx = window.__PROTO_PANEL || {};
  if (!core || !ctx.app) return;

  var APP = ctx.app;
  var DIR = ctx.dir || 'proto-panel';
  var FILES = { flows: 'flows.yaml', comments: 'comments.md', mirror: 'panel-data.js' };
  var LOG = '[панель прототипа]';

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

  function data() { return window.ProtoPanelData || null; }

  /* Новые данные — в тот же объект: сценарии рантайм читает прямо из него. */
  function replaceData(next) {
    var d = window.ProtoPanelData;
    if (!d || typeof d !== 'object') { window.ProtoPanelData = next; return; }
    Object.keys(next).forEach(function (k) { d[k] = next[k]; });
  }

  /* ---------------- черновики ---------------- */

  var K_DRAFTS = 'pp.drafts:' + APP;
  function drafts() { return local.get(K_DRAFTS, []) || []; }
  /* Черновики живут только в памяти, до перезагрузки: хранилище браузера закрыто
     со старта или отказало на ходу (ревью 0005, R5, R10). */
  function draftsVolatile() { return local.volatile(K_DRAFTS); }
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
    var id = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
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

  /* ---------------- папка на диске ---------------- */

  var st = {
    status: 'mirror',   // mirror | needs-permission | linked | unsupported
    supported: typeof window.showDirectoryPicker === 'function',
    dir: null,          // хендл папки панели
    appDir: null,       // хендл папки приложения (если известен — для app.json)
    saved: null,        // { handle, key } из IndexedDB, если ждёт разрешения
    key: null,
    error: null,        // последняя ошибка записи comments.md или подключения
    mirrorError: null,  // зеркало не записано, но comments.md на диске (производный файл)
    note: null          // 'updated' — зеркало обновлено с диска
  };
  if (!st.supported) st.status = 'unsupported';

  function setStatus(s) { st.status = s; bus.emit('store', status()); }
  function status() { return st.status; }

  function idb() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('IndexedDB недоступен')); return; }
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
  function idbSet(k, v) { return idbDo('readwrite', function (s) { return s.put(v, k); }).catch(function (e) { console.warn(LOG, 'хендл папки не сохранён:', e); }); }
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
      if (!r) throw new Error('В выбранной папке нет ' + (ctx.base || 'apps') + '/' + APP + '/' + DIR + ' — выберите корневую папку проекта (там, где ' + (ctx.base || 'apps') + '/ и project.json)');
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
    return st.appDir.getFileHandle(ctx.manifest || 'app.json').then(function (fh) { return fh.getFile(); }).then(function (f) { return f.text(); }).then(function (t) {
      var j = JSON.parse(t);
      var id = typeof j.id === 'string' && j.id.trim() ? j.id.trim() : fallbackId;
      return { id: id, title: typeof j.title === 'string' && j.title.trim() ? j.title.trim() : id };
    }).catch(function () { return fb; });
  }

  /* Зеркало — производный файл: comments.md уже на диске, поэтому сбой зеркала
     не проваливает сохранение комментария (ревью 0005, R3, R9). На следующем
     открытии свежесть увидит расхождение хешей и пересоберёт зеркало. */
  function mirrorFailed(e) {
    st.mirrorError = 'Зеркало ' + FILES.mirror + ' не записано (' + (e && e.message || e) + ') — ' + FILES.comments
      + ' на месте, данные панели обновлены в памяти; зеркало пересоберётся при следующем открытии или по команде «Перечитать с диска»';
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

  /* flows.yaml не прочитался — зеркало не собрать: комментарии в памяти берутся
     из записанного comments.md, сценарии остаются прежними, sources — тоже
     (по ним следующее открытие пересоберёт зеркало). */
  function commentsInMemory(text) {
    var c = core.parseComments(text);
    replaceData({ comments: c.model.comments, commentsPreamble: c.model.preamble, commentErrors: [] });
    bus.emit('data');
  }

  /* Свежесть: файлы правили после сборки (агент, человек) — перечитать и пересобрать зеркало. */
  function freshness(force) {
    return Promise.all([readText(FILES.flows), readText(FILES.comments)]).then(function (x) {
      var d = data();
      var flows = x[0] || '', comments = x[1] === null ? core.emptyComments() : x[1];
      var stale = !d || !d.sources || core.hash(flows) !== d.sources.flows || core.hash(comments) !== d.sources.comments;
      if (!stale && !force) return false;
      return rebuildMirror(flows, comments).then(function () {
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

  /* Подключить и дописать черновики — только вне очереди записи. Черновики не
     записались — папка всё равно подключена: это ошибка записи (она в Alert,
     черновики ждут «Повторить запись»), а не подключения (ревью 0005, R8). */
  function connect(r, persistHandle, handle) {
    return attach(r, persistHandle, handle).then(function (updated) {
      return flushDrafts().then(function (n) { return { updated: updated, drafts: n }; },
        function (e) { return { updated: updated, drafts: 0, error: e }; });
    });
  }

  /** Записать черновики одной правкой. Список берётся под очередью и блокировкой (commit). */
  function flushDrafts() {
    if (!drafts().length) return Promise.resolve(0);
    return commit(null, { drafts: true }).then(function (r) {
      if (r.drafts) bus.emit('drafts-saved', r.drafts);
      return r.drafts;
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
      console.warn(LOG, 'папка проекта не подключена:', e && e.message || e);
      st.error = e && e.message || String(e);
      setStatus('mirror');
      return status();
    });
  }

  /** Подключить папку (жест пользователя): системный выбор папки. */
  function link() {
    if (!st.supported) return Promise.reject(new Error('Этот браузер не умеет сохранять в папку: выбор папки есть в браузерах на Chromium'));
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
    if (!s) return Promise.reject(new Error('Папка проекта не подключена'));
    return s.handle.requestPermission({ mode: 'readwrite' }).then(function (perm) {
      if (perm !== 'granted') throw new Error('Браузер не дал доступ к папке проекта');
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
    if (st.status !== 'linked') return Promise.reject(new Error('Папка проекта не подключена'));
    return freshness(true).then(function (changed) {
      return flushDrafts().then(function () { return changed; });
    });
  }

  /* ---------------- запись: прочитать → слить → записать ---------------- */

  function FormatError(errors) {
    this.name = 'FormatError';
    this.errors = errors;
    this.message = 'comments.md не по формату — запись остановлена, чтобы не затереть файл: ' + errors.map(function (e) { return 'строка ' + e.line + ' — ' + e.text; }).join('; ');
  }

  /* Подпись добавления: одинаковые текст (в той форме, что ляжет в файл), время,
     автор и контекст — это один и тот же комментарий. По подписи повтор записи
     и черновики узнают «своё» добавление, уже дошедшее до диска, и не
     задваивают его (ревью 0005, R1, R3, R9, R13). */
  function metaLine(v) { var s = v == null ? '' : core.oneLine(v); return s || null; }
  function stepKey(s) { return s ? s.flow + '/' + s.step : null; }
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

  function apply(model, op, out, pre, retry) {
    var list = model.comments;
    var find = function (n) {
      var c = list.filter(function (x) { return x.n === n; })[0];
      if (!c) throw new Error('К-' + n + ' в comments.md уже нет — файл правили; перечитайте с диска');
      return c;
    };
    if (op.op === 'add') {
      var cand = { body: String(op.text), created: op.created || core.stamp(), author: (op.author !== undefined ? op.author : (prefs().author || null)) || null, page: op.page || null, step: op.step || null };
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
     понижены, незакрытый блок кода закрыт, метаданные — одной строкой. Сырой
     текст модели с ней расходится, и прямое сравнение отвергало законный ввод
     (ревью 0005, R2, R8). null — запись безопасна. */
  function roundTrip(model, text) {
    var back = core.parseComments(text);
    if (back.errors.length) return 'повторный разбор записи не прошёл: строка ' + back.errors[0].line + ' — ' + back.errors[0].text;
    var a = model.comments.slice().sort(function (x, y) { return x.n - y.n; });
    var b = back.model.comments;
    if (a.length !== b.length) return 'в записи комментариев ' + b.length + ', в модели ' + a.length;
    for (var i = 0; i < a.length; i++) {
      var x = a[i], y = b[i];
      if (x.n !== y.n || x.status !== y.status || core.cleanBody(x.body) !== y.body || stepKey(x.step) !== stepKey(y.step)
        || ['created', 'author', 'page', 'resolution'].some(function (k) { return metaLine(x[k]) !== metaLine(y[k]); })) return 'К-' + x.n + ' в записи отличается от модели';
    }
    return null;
  }

  /* Внутри очереди доступ только проверяется: разрешение в новой сессии
     спрашивает commit до очереди, в жесте пользователя (ревью 0005, R7). */
  function ensureAccess() {
    if (st.status === 'linked' && st.dir) return Promise.resolve();
    return Promise.reject(new Error(st.status === 'needs-permission' ? 'Нужно разрешение на папку проекта — «Разрешить доступ»' : 'Папка проекта не подключена'));
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
     окно сужают повторное чтение перед записью и проверка после (ниже). */
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

  /* Одна попытка: свежий файл → правки → контрольный повторный разбор → запись →
     сверка, что на диске то, что писали. Конкурентное изменение и
     неподтверждённая запись — RetryError: попытка повторяется с новым снимком
     и узнаёт свои добавления по подписи (ревью 0005, R1, R9). После сверки
     операция состоялась: onCommit снимает записанные черновики, а сбой чтения
     flows.yaml или записи зеркала — производного файла — сохранение уже не
     проваливает (R3, R9). Номера добавленных — только этой попытки (R12). */
  function attemptOnce(ops, usePre, retry, onCommit) {
    var written = null, added = [];
    return ensureAccess().then(function () {
      return readText(FILES.comments);
    }).then(function (md) {
      var base = md === null ? core.emptyComments() : md;
      var p = core.parseComments(base);
      if (p.errors.length) throw new FormatError(p.errors);
      return readText(FILES.comments).then(function (again) {
        var fresh = again === null ? core.emptyComments() : again;
        if (fresh !== base) throw retryError('comments.md изменился, пока готовилась запись');
        /* Подписи — у повторной попытки и у черновиков: узнать «своё» добавление,
           уже дошедшее до диска. У первой попытки новой операции совпадение
           подписи — самостоятельный комментарий (два одинаковых текста за одну
           минуту), его пропускать нельзя. */
        var pre = usePre ? sigIndex(p.model.comments) : null;
        ops.forEach(function (op) { apply(p.model, op, added, pre, retry); });
        written = core.serializeComments(p.model);
        var bad = roundTrip(p.model, written);
        if (bad) throw new Error('Запись изменила бы состав комментариев — сохранение остановлено: ' + bad);
        return writeText(FILES.comments, written);
      });
    }).then(function () {
      return readText(FILES.comments).then(null, function (e) {
        throw retryError('comments.md не перечитался после записи (' + (e && e.message || e) + ')');
      });
    }).then(function (disk) {
      if (disk !== written) throw retryError('comments.md перезаписан параллельной записью');
      if (onCommit) onCommit();
      return readText(FILES.flows).then(function (flows) {
        return rebuildMirror(flows || '', written);
      }, function (e) {
        commentsInMemory(written);
        mirrorFailed(new Error(FILES.flows + ' не прочитан: ' + (e && e.message || e)));
      });
    }).then(function () { return added; });
  }

  function retryError(text) {
    var e = new Error(text);
    e.name = 'RetryError';
    return e;
  }

  var SAVE_TRIES = 3;

  /* Цикл записи внутри очереди и блокировки. Черновики (opts.drafts) берутся
     здесь, свежим списком: вторая вкладка могла их уже записать или добавить
     новые; после подтверждённой записи снимаются ровно записанные (ревью 0005,
     R13). Черновики пишутся с подписями всегда: их время зафиксировано при
     создании, и повтор после неподтверждённой записи их не задвоит (R9). */
  function work(stamped, opts) {
    var batch = stamped, ids = null;
    if (opts.drafts) {
      var list = drafts();
      if (!list.length) return Promise.resolve({ added: [], drafts: 0 });
      ids = list.map(function (d) { return d.id; });
      batch = list.map(function (x) { return { op: 'add', text: x.text, page: x.page, step: x.step, created: x.created, author: x.author || null }; });
    }
    var tries = 0;
    function go() {
      return attemptOnce(batch, !!ids || tries > 0, tries > 0, ids ? function () { removeDrafts(ids); } : null).catch(function (e) {
        if (e && e.name === 'RetryError' && ++tries < SAVE_TRIES) return go();
        if (e && e.name === 'RetryError') throw new Error('Запись в comments.md не подтвердилась: ' + e.message + ' — попробуйте ещё раз');
        throw e;
      });
    }
    return go().then(function (added) { return { added: added, drafts: ids ? ids.length : 0 }; });
  }

  /* Записать операции (или черновики) одной правкой свежего файла:
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
    var granted = false;
    var access = st.status === 'needs-permission'
      ? requestAccess().then(function (r) { return attach(r, false); }).then(function () { granted = true; })
      : Promise.resolve();
    return access.then(function () {
      return pageQueue(function () { return tabLock('proto-panel:' + APP, function () { return work(stamped, opts); }); });
    }).then(function (res) {
      st.error = null;
      bus.emit('saved', { added: res.added, ops: ops || [], fromDrafts: !!opts.drafts });
      bus.emit('store', status());
      if (!granted || opts.drafts || !drafts().length) return res;
      return flushDrafts().then(function () { return res; }, function () { return res; });
    }, function (e) {
      if (e && e.name === 'AbortError') throw e;
      st.error = e && e.message || String(e);
      console.warn(LOG, 'запись не удалась:', st.error);
      bus.emit('store', status());
      throw e;
    });
  }

  /** Записать операции одной правкой свежего файла. Возвращает номера добавленных. */
  function save(ops) { return commit(ops).then(function (r) { return r.added; }); }

  /* ---------------- без папки: скачать и скопировать ---------------- */

  function exportText() {
    var d = data();
    var model = { front: ['type: proto-comments'], preamble: d && typeof d.commentsPreamble === 'string' ? d.commentsPreamble : undefined, comments: (d && d.comments ? d.comments : []).slice() };
    var n = core.nextNumber(model.comments);
    drafts().forEach(function (x) {
      model.comments.push({ n: n++, status: 'open', created: x.created, author: x.author || null, page: x.page || null, step: x.step || null, resolution: null, body: x.text });
    });
    return core.serializeComments(model);
  }

  function download() {
    var blob = new Blob([exportText()], { type: 'text/markdown;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = FILES.comments;
    a.className = 'pp-hidden';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }
  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var t = document.createElement('textarea');
      t.value = text;
      t.className = 'pp-hidden';
      t.setAttribute('readonly', '');
      document.body.appendChild(t);
      t.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      t.remove();
      if (ok) resolve(); else reject(new Error('Буфер обмена недоступен'));
    });
  }

  /* Два кадра — страница успела перерисоваться. Во вкладке в фоне браузер
     кадров почти не даёт, поэтому у ожидания есть запасной таймер. */
  function frames(n) {
    return new Promise(function (resolve) {
      var left = n || 1, done = false;
      var t = setTimeout(finish, 100 * left);
      function finish() { if (!done) { done = true; clearTimeout(t); resolve(); } }
      (function tick() { if (--left < 0) { finish(); return; } requestAnimationFrame(tick); })();
    });
  }

  PP._bus = bus;
  PP._store = {
    frames: frames,
    APP: APP, DIR: DIR, FILES: FILES,
    local: local, session: session,
    prefs: prefs, setPref: setPref, ui: ui, setUi: setUi,
    data: data, replaceData: replaceData,
    drafts: drafts, draftsVolatile: draftsVolatile, addDraft: addDraft, editDraft: editDraft, removeDraft: removeDraft, comments: comments,
    status: status, state: st, init: init, link: link, linkHandle: linkHandle, permit: permit, unlink: unlink, refresh: refresh, flushDrafts: flushDrafts,
    save: save, exportText: exportText, download: download, copyText: copyText,
    FormatError: FormatError
  };
})();

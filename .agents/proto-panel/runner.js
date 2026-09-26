/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — проигрыватель сценариев (runner.js).

   Шаг сценария — одно состояние интерфейса (State NN). Шаг с page — точка
   входа: страница открывается заново и выполняет свои действия. Шаг без
   page — приращение поверх предыдущего. Чтобы прийти в шаг N, проигрыватель
   берёт ближайшую точку входа k ≤ N, открывает её страницу и выполняет
   действия шагов k…N. «Вперёд» по той же странице — без перезагрузки;
   «назад» — всегда с точки входа: обратных действий нет.

   Состояние — в sessionStorage вкладки: pp.state:<app> — сценарий, шаг,
   «изменено вручную», ошибка; pp.pending — продолжение после перезагрузки;
   pp.guard — страж перехода: действие, которое увело со страницы,
   ловится на следующей загрузке. События действий синтетические:
   то, что требует настоящего жеста (буфер обмена страницы, выбор файла,
   полноэкранный режим), проигрыватель не воспроизводит — это в README.

   Задача 0005a: цель действия может уточнять текст (text — aria-label или
   видимая подпись); свои элементы панели целью не бывают; о каждом
   выполненном действии проигрыватель сообщает шиной (replay-start,
   replay-target — цель перед действием, replay-action, step) — по ним
   рекордер знает, до какого шага страницу довела панель; адрес шага — по
   номеру состояния (#pp=07). Сценарии —
   зеркало плюс черновые операции (store.flows).
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  var core = window.ProtoPanelCore;
  var ctx = window.__PROTO_PANEL || {};
  if (!PP || !PP._store || !core) return;
  var t = PP._strings ? PP._strings.t : function (k) { return k; };

  var store = PP._store, bus = PP._bus, session = store.session;
  var APP = ctx.app;
  var K_STATE = 'pp.state:' + APP, K_PENDING = 'pp.pending', K_GUARD = 'pp.guard';
  var PENDING_TTL = 20000, GUARD_TTL = 5000, SHOW_PAUSE = 450, POLL = 50;
  var LOG = '[proto panel]';
  /* свои элементы панели: не цель действий, не «изменено вручную», не запись */
  var PANEL_SEL = '.pp-root, #pp-drawer, .pp-modal, .pp-hl, .snackbar-layer, .toast-layer';
  var busy = null;   // { flow, from, to, phase } — пока идёт переход
  var last = null;   // последний прогон: { flow, from, to, start, end, ok } — время от начала загрузки страницы, мс (диагностика)

  /* ---------------- сценарии ---------------- */

  function flows() { return store.flows(); }
  function flowById(id) { return flows().filter(function (f) { return f.id === id; })[0] || null; }
  function stepIdx(flow, ref) {
    if (typeof ref === 'number') return ref >= 0 && ref < flow.steps.length ? ref : -1;
    for (var i = 0; i < flow.steps.length; i++) if (flow.steps[i].id === ref) return i;
    return -1;
  }
  /** Шаг по номеру состояния: { flow, index } | null. */
  function byState(n) {
    var list = flows();
    for (var fi = 0; fi < list.length; fi++) {
      for (var si = 0; si < list[fi].steps.length; si++) if (list[fi].steps[si].state === n) return { flow: list[fi], index: si };
    }
    return null;
  }
  function entryIdx(flow, j) { for (var m = j; m >= 0; m--) if (flow.steps[m].page) return m; return -1; }
  function decode(s) { try { return decodeURIComponent(s); } catch (e) { return s; } }
  function urlKey(u) { var x = new URL(u, location.href); return decode(x.pathname) + x.search; }
  function here() { return decode(location.pathname) + location.search; }
  function entryUrl(flow, k) { return new URL(flow.steps[k].page, ctx.pagesUrl).href; }
  /** Имя шага: State 07; шаг без номера (файл ещё не собран) — Step 3. */
  function stepName(flow, i) { var s = flow.steps[i]; return s && s.state ? core.stateLabel(s.state) : t('run.stepN', { n: i + 1 }); }

  /** Адрес шага: страница точки входа + #pp=07 (без номера — #pp=<сценарий>/<шаг>). */
  function stepUrl(flowId, stepRef) {
    var flow = flowById(flowId);
    if (!flow) return null;
    var j = stepIdx(flow, stepRef);
    if (j < 0) return null;
    var k = entryIdx(flow, j);
    var s = flow.steps[j];
    var hash = s.state ? core.pad2(s.state) : encodeURIComponent(flow.id) + '/' + encodeURIComponent(s.id);
    return entryUrl(flow, k).split('#')[0] + '#pp=' + hash;
  }

  /* ---------------- состояние ---------------- */

  function rawState() { return session.get(K_STATE, null); }
  /** { flow, step, dirty, error } | null — только если сценарий и шаг ещё есть. */
  function state() {
    var st = rawState();
    if (!st || !st.flow) return null;
    var flow = flowById(st.flow);
    if (!flow || stepIdx(flow, st.step) < 0) return null;
    return st;
  }
  function setState(st) {
    session.set(K_STATE, st);
    bus.emit('state', st);
  }
  /** Поставить состояние сессии на шаг (после Fix State): текущий, не изменён.
      fixed — записан, но ещё не проверен: первый клик по узлу не пропускается как
      «уже здесь», а открывает страницу заново и проигрывает запись (§7.2). */
  function setAt(flowId, stepRef) {
    var flow = flowById(flowId);
    var j = flow ? stepIdx(flow, stepRef) : -1;
    if (j < 0) return false;
    setState({ flow: flow.id, step: flow.steps[j].id, dirty: false, error: null, fixed: true });
    return true;
  }

  function current() {
    var st = state();
    if (!st) return null;
    var flow = flowById(st.flow), i = stepIdx(flow, st.step);
    return { flow: st.flow, step: st.step, index: i, total: flow.steps.length, state: flow.steps[i].state || null, title: flow.steps[i].title,
      dirty: !!st.dirty, error: st.error || null };
  }

  function sec(ms) { return t('run.sec', { n: String(Math.round(ms / 100) / 10) }); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  var frames = store.frames;

  /* ---------------- поиск цели ---------------- */

  function isOwn(el) { return !!(el && el.closest && el.closest(PANEL_SEL)); }
  /** Подпись элемента для цели по тексту: aria-label, иначе видимый текст; пробелы схлопнуты, края обрезаны. */
  function textOf(el) {
    var a = el && el.getAttribute ? el.getAttribute('aria-label') : null;
    var s = a && a.trim() ? a : el ? (el.innerText != null ? el.innerText : el.textContent) : '';
    return String(s || '').replace(/\s+/g, ' ').trim();
  }
  function visible(el) {
    if (!el || !el.isConnected) return false;
    if (typeof el.checkVisibility === 'function') return el.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true, visibilityProperty: true });
    return el.getClientRects().length > 0;
  }
  function enabled(el) {
    if (el.disabled || (el.matches && el.matches(':disabled'))) return false;
    if (el.getAttribute && el.getAttribute('aria-disabled') === 'true') return false;
    if (el.closest && el.closest('[inert]')) return false;
    return true;
  }
  function pick(list, index) {
    var i = index < 0 ? list.length + index : index;
    return i >= 0 && i < list.length ? list[i] : null;
  }

  /* Совпадения селектора без своих элементов панели (скрытая шторка лежит в
     DOM и сбила бы index), при text — только с такой подписью. */
  function matches(sel, text) {
    var all = document.querySelectorAll(sel);
    return Array.prototype.filter.call(all, function (el) { return !isOwn(el) && (!text || textOf(el) === text); });
  }

  function find(sel, index, timeout, want, needEnabled, text) {
    var deadline = Date.now() + timeout;
    return new Promise(function (resolve, reject) {
      (function poll() {
        var list;
        try { list = matches(sel, text); } catch (e) { reject(new Error(t('run.badSelector', { msg: e.message }))); return; }
        var el = pick(list, index || 0), ok = false, why = '';
        if (want === 'absent') { ok = list.length === 0; why = t('run.notGone', { sec: sec(timeout) }); }
        else if (want === 'hidden') { ok = !el || !visible(el); why = t('run.notHidden', { sec: sec(timeout) }); }
        else if (want === 'present') { ok = !!el; why = t('run.notFound', { sec: sec(timeout) }); }
        else if (!el) why = t('run.notFound', { sec: sec(timeout) });
        else if (!visible(el)) why = t('run.hidden');
        else if (needEnabled && !enabled(el)) why = t('run.disabled');
        else ok = true;
        if (ok) { resolve(el || null); return; }
        if (Date.now() >= deadline) { reject(new Error(why)); return; }
        setTimeout(poll, POLL);
      })();
    });
  }

  /* ---------------- действия ---------------- */

  var FOCUSABLE = 'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"], [contenteditable=""]';

  function center(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  function pointerEv(el, type, p, buttons) {
    var Ev = window.PointerEvent || window.MouseEvent;
    el.dispatchEvent(new Ev(type, { bubbles: !/enter|leave/.test(type), cancelable: true, composed: true, view: window, clientX: p.x, clientY: p.y,
      button: 0, buttons: buttons || 0, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
  }
  function mouseEv(el, type, p, buttons) {
    el.dispatchEvent(new MouseEvent(type, { bubbles: !/enter|leave/.test(type), cancelable: true, composed: true, view: window, clientX: p.x, clientY: p.y,
      button: 0, buttons: buttons || 0, detail: type === 'click' ? 1 : 0 }));
  }
  /* Фокус, как его ставит настоящий mousedown: ближайший фокусируемый предок или снятие фокуса. */
  function focusFor(el) {
    var f = el.closest ? el.closest(FOCUSABLE) : null;
    if (f && !f.disabled) { try { f.focus({ preventScroll: true }); } catch (e) { /* не фокусируется */ } }
    else if (document.activeElement && document.activeElement !== document.body && document.activeElement.blur) document.activeElement.blur();
  }
  function click(el) {
    var p = center(el);
    pointerEv(el, 'pointerdown', p, 1);
    mouseEv(el, 'mousedown', p, 1);
    focusFor(el);
    pointerEv(el, 'pointerup', p, 0);
    mouseEv(el, 'mouseup', p, 0);
    mouseEv(el, 'click', p, 0);
  }
  function hover(el) {
    var p = center(el);
    pointerEv(el, 'pointerover', p); pointerEv(el, 'pointerenter', p);
    mouseEv(el, 'mouseover', p); mouseEv(el, 'mouseenter', p);
    pointerEv(el, 'pointermove', p); mouseEv(el, 'mousemove', p);
  }
  function fill(el, value) {
    focusFor(el);
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
      : el instanceof HTMLInputElement ? HTMLInputElement.prototype
      : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : null;
    if (proto) Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
    else if (el.isContentEditable) el.textContent = value;
    else throw new Error(t('run.notField'));
    var InputEv = window.InputEvent || Event;
    el.dispatchEvent(new InputEv('input', { bubbles: true, inputType: 'insertText', data: value }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  var KEY_CODES = { Enter: 'Enter', Escape: 'Escape', Tab: 'Tab', ' ': 'Space', Space: 'Space', Backspace: 'Backspace', Delete: 'Delete',
    ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight', Home: 'Home', End: 'End', PageUp: 'PageUp', PageDown: 'PageDown' };
  function codeOf(key) {
    if (KEY_CODES[key]) return KEY_CODES[key];
    if (/^[a-z]$/i.test(key)) return 'Key' + key.toUpperCase();
    if (/^\d$/.test(key)) return 'Digit' + key;
    return key;
  }
  function press(tg, a) {
    var key = a.key === 'Space' ? ' ' : a.key;
    ['keydown', 'keyup'].forEach(function (type) {
      tg.dispatchEvent(new KeyboardEvent(type, { key: key, code: codeOf(a.key), bubbles: true, cancelable: true, composed: true,
        altKey: !!a.mods.alt, shiftKey: !!a.mods.shift, ctrlKey: !!a.mods.ctrl, metaKey: !!a.mods.meta }));
    });
  }

  /* Подсветка цели для зрителя: рамка поверх прямоугольника и пауза. */
  function highlight(el) {
    var r = el.getBoundingClientRect();
    var hl = document.createElement('div');
    hl.className = 'pp-hl';
    hl.setAttribute('aria-hidden', 'true');
    hl.style.top = r.top + 'px';
    hl.style.left = r.left + 'px';
    hl.style.width = r.width + 'px';
    hl.style.height = r.height + 'px';
    document.body.appendChild(hl);
    return sleep(SHOW_PAUSE).then(function () { return hl; });
  }

  /* Выполнить действие. → элемент-цель (для записи и подписи) или null. */
  function exec(a, show) {
    if (a.verb === 'wait') return sleep(a.ms).then(function () { return null; });
    if (a.verb === 'waitFor') return find(a.target, a.index, a.timeout, a.state || 'visible', false, a.text);
    var need = a.verb === 'click' || a.verb === 'fill';
    var target = a.target ? find(a.target, a.index, a.timeout, 'visible', need, a.text) : Promise.resolve(document.activeElement || document.body);
    return target.then(function (el) {
      if (a.verb !== 'scroll' && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      return (show && a.target ? highlight(el) : Promise.resolve(null)).then(function (hl) {
        bus.emit('replay-target', { el: el });   // до действия: рекордер берёт подпись такой, какой её видел человек
        if (a.verb === 'click') click(el);
        else if (a.verb === 'fill') fill(el, a.value == null ? '' : a.value);
        else if (a.verb === 'hover') hover(el);
        else if (a.verb === 'focus') el.focus();
        else if (a.verb === 'scroll') el.scrollIntoView({ block: a.block || 'center', inline: 'nearest' });
        else if (a.verb === 'press') press(el, a);
        if (hl) setTimeout(function () { hl.remove(); }, 250);
        return el;
      });
    });
  }

  /* ---------------- переходы ---------------- */

  function message(flow, s, ai, why) {
    var step = flow.steps[s];
    var act = ai == null ? '' : t('run.action', { n: ai + 1, what: core.describeAction(step.do[ai]) });
    return t('run.message', { state: stepName(flow, s), title: step.title, action: act, why: why });
  }

  function fail(flow, lastOk, s, ai, text) {
    session.set(K_GUARD, null);
    var st = { flow: flow.id, step: flow.steps[Math.max(0, lastOk)].id, dirty: true, error: { step: flow.steps[s].id, action: ai, message: text } };
    setState(st);
    console.warn(LOG + ' ' + text);
    bus.emit('error', { flow: flow.id, step: flow.steps[s].id, index: s, state: flow.steps[s].state || null, action: ai, message: text });
  }

  function run(flow, a, b, opts) {
    opts = opts || {};
    busy = { flow: flow.id, from: a, to: b, phase: 'run' };
    last = { flow: flow.id, from: a, to: b, start: Math.round(performance.now()), end: null, ok: null };
    bus.emit('busy', busy);
    bus.emit('replay-start', { flow: flow.id, from: a, to: b, reload: !!opts.reload });
    var ui = PP._ui;
    var s = a, ai = null;
    return (ui ? ui.releasePage() : Promise.resolve()).then(function loop() {
      if (s > b) return null;
      var step = flow.steps[s];
      var i = 0;
      function nextAction() {
        if (i >= step.do.length) { s++; return loop(); }
        ai = i;
        session.set(K_GUARD, { app: APP, flow: flow.id, step: step.id, action: i, url: here(), at: Date.now() });
        var act = step.do[i];
        return exec(act, !!opts.show && s === b).then(function (el) {
          bus.emit('replay-action', { flow: flow.id, step: step.id, action: act, el: el });
          i++;
          return frames(2).then(nextAction);
        });
      }
      return nextAction();
    }).then(function () {
      session.set(K_GUARD, null);
      setState({ flow: flow.id, step: flow.steps[b].id, dirty: false, error: null });
      busy = null;
      bus.emit('busy', null);
      last.end = Math.round(performance.now()); last.ok = true;
      bus.emit('step', { flow: flow.id, step: flow.steps[b].id, index: b, total: flow.steps.length, state: flow.steps[b].state || null, title: flow.steps[b].title });
      if (opts.reopen && ui) ui.open('flows');
      return true;
    }, function (e) {
      busy = null;
      last.end = Math.round(performance.now()); last.ok = false;
      bus.emit('busy', null);
      fail(flow, s - 1 >= entryIdx(flow, b) ? s - 1 : entryIdx(flow, b), s, ai, message(flow, s, ai, e && e.message || String(e)));
      return false;
    });
  }

  /** Перейти к шагу: без перезагрузки, если шаг — приращение текущего на той же странице. */
  function goTo(flowId, stepRef, opts) {
    opts = opts || {};
    if (busy) return Promise.resolve(false);
    var flow = flowById(flowId);
    if (!flow) return Promise.reject(new Error(t('run.noFlow', { id: flowId })));
    var j = stepIdx(flow, stepRef);
    if (j < 0) return Promise.reject(new Error(t('run.noState', { ref: stepRef, title: flow.title })));
    var k = entryIdx(flow, j);
    var url = entryUrl(flow, k);
    var onPage = urlKey(url) === here();
    var st = state();
    var clean = st && st.flow === flow.id && !st.dirty && !st.error;
    var cur = st && st.flow === flow.id ? stepIdx(flow, st.step) : -1;
    var show = opts.show != null ? !!opts.show : store.prefs().showActions;
    var reopen = opts.reopen != null ? !!opts.reopen : !store.prefs().closeOnGo;
    /* Документ только что загружен (адрес шага): DOM свежий, сохранённое
       состояние к нему не относится — оптимизации по нему недействительны,
       путь проигрывается с точки входа (ревью 0005, R4). */
    if (opts.fresh && onPage) return run(flow, k, j, { show: show, reopen: reopen, reload: true });
    if (clean && onPage && cur >= k && cur < j) return run(flow, cur + 1, j, { show: show, reopen: reopen });
    if (clean && onPage && cur === j && !st.fixed) {
      if (PP._ui && !reopen) PP._ui.close();
      return Promise.resolve(true);
    }
    session.set(K_PENDING, { app: APP, flow: flow.id, from: flow.steps[k].id, to: flow.steps[j].id, url: urlKey(url), at: Date.now(), show: show, reopen: reopen });
    busy = { flow: flow.id, from: k, to: j, phase: 'navigate' };
    bus.emit('busy', busy);
    if (onPage) location.reload(); else location.href = url.split('#')[0];
    return Promise.resolve(true);
  }

  /** Перейти к состоянию по номеру. */
  function goToState(n, opts) {
    var hit = byState(n);
    if (!hit) return Promise.reject(new Error(t('run.noStateN', { state: core.stateLabel(n) })));
    return goTo(hit.flow.id, hit.index, opts);
  }

  function step(delta) {
    var c = current();
    if (!c || busy) return Promise.resolve(false);
    var flow = flowById(c.flow);
    var base = c.index;
    /* после ошибки «вперёд» повторяет шаг с ошибкой */
    if (delta > 0 && c.error) { var ei = stepIdx(flow, c.error.step); if (ei >= 0) base = ei - 1; }
    var j = base + delta;
    if (j < 0 || j >= flow.steps.length) return Promise.resolve(false);
    return goTo(flow.id, j);
  }
  function next() { return step(1); }
  function prev() { return step(-1); }
  function stop() {
    session.set(K_PENDING, null);
    session.set(K_GUARD, null);
    setState(null);
    bus.emit('stop');
  }
  function start(flowId) { return goTo(flowId, 0); }

  /* ---------------- после загрузки страницы ---------------- */

  /* Адрес шага #pp=07 (номер состояния) или прежний #pp=<сценарий>/<шаг>: хеш убирается, панель идёт к шагу. */
  function fromHash(fresh) {
    var m = /(?:^#|&)pp=([^&]+)/.exec(location.hash || '');
    if (!m) return null;
    history.replaceState(history.state, '', location.pathname + location.search);
    var ref = decode(m[1]);
    var go;
    if (ref.indexOf('/') < 0 && core.parseStateRef(ref)) go = goToState(core.parseStateRef(ref), { fresh: !!fresh });
    else { var parts = ref.split('/'); go = goTo(parts[0], parts[1] || 0, { fresh: !!fresh }); }
    return go.catch(function (e) {
      bus.emit('error', { message: t('run.hash', { msg: e.message }) });
    });
  }
  /* та же страница, другой хеш — документ не перезагружается */
  window.addEventListener('hashchange', function () { if (!busy) fromHash(); });

  function resume() {
    var now = Date.now();
    var p = session.get(K_PENDING, null);
    var g = session.get(K_GUARD, null);
    session.set(K_PENDING, null);
    session.set(K_GUARD, null);
    var byHash = fromHash(true);
    if (byHash) return byHash;
    var valid = p && p.app === APP && p.url === here() && now - p.at < PENDING_TTL;
    if (valid) {
      var flow = flowById(p.flow);
      var a = flow ? stepIdx(flow, p.from) : -1, b = flow ? stepIdx(flow, p.to) : -1;
      if (flow && a >= 0 && b >= a) return run(flow, a, b, { show: p.show, reopen: p.reopen, reload: true });
    }
    if (g && g.app === APP && now - g.at < GUARD_TTL) {
      var gf = flowById(g.flow);
      var gs = gf ? stepIdx(gf, g.step) : -1;
      if (gf && gs >= 0) {
        fail(gf, gs - 1 >= entryIdx(gf, gs) ? gs - 1 : entryIdx(gf, gs), gs, g.action, message(gf, gs, g.action, t('run.leftPage')));
        return Promise.resolve(false);
      }
    }
    var st = state();
    if (st && !st.dirty) { st.dirty = true; setState(st); }
    return Promise.resolve(false);
  }

  /* ---------------- «изменено вручную» ---------------- */

  var QUIET_KEYS = { Alt: 1, Shift: 1, Control: 1, Meta: 1, AltGraph: 1, CapsLock: 1, Tab: 1, Fn: 1 };
  ['pointerdown', 'keydown', 'input'].forEach(function (type) {
    document.addEventListener(type, function (e) {
      if (!e.isTrusted || busy) return;
      if (type === 'keydown' && (QUIET_KEYS[e.key] || core.hotkeyOf(e))) return;
      var tg = e.target;
      if (tg && tg.nodeType !== 1) tg = tg.parentElement;
      if (isOwn(tg)) return;
      var st = state();
      if (!st || st.dirty) return;
      st.dirty = true;
      setState(st);
    }, true);
  });

  /* После записи схемы черновые id могли смениться — состояние сессии идёт следом. */
  bus.on('flows-saved', function (x) {
    var st = rawState();
    if (!st || !x || !x.map) return;
    Object.keys(x.map.states).forEach(function (ref) {
      var m = x.map.states[ref];
      if (m.from && m.from.flow === st.flow && m.from.id === st.step) { st.flow = m.to.flow; st.step = m.to.id; session.set(K_STATE, st); }
    });
  });

  PP._runner = {
    flows: flows, flowById: flowById, stepIdx: stepIdx, entryIdx: entryIdx, entryUrl: entryUrl, stepUrl: stepUrl, byState: byState, stepName: stepName,
    state: state, current: current, busy: function () { return busy; }, setAt: setAt,
    goTo: goTo, goToState: goToState, next: next, prev: prev, stop: stop, start: start, resume: resume,
    here: here, lastRun: function () { return last; }, textOf: textOf, isOwn: isOwn, matches: matches, PANEL_SEL: PANEL_SEL
  };
})();

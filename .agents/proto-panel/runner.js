/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — проигрыватель сценариев (runner.js).

   Шаг сценария — одно состояние интерфейса. Шаг с page — точка входа:
   страница открывается заново и выполняет свои действия. Шаг без page —
   приращение поверх предыдущего. Чтобы прийти в шаг N, проигрыватель берёт
   ближайшую точку входа k ≤ N, открывает её страницу и выполняет действия
   шагов k…N. «Вперёд» по той же странице — без перезагрузки; «назад» —
   всегда с точки входа: обратных действий нет.

   Состояние — в sessionStorage вкладки: pp.state:<app> — сценарий, шаг,
   «изменено вручную», ошибка; pp.pending — продолжение после перезагрузки;
   pp.guard — страж перехода: действие, которое увело со страницы,
   ловится на следующей загрузке. События действий синтетические:
   то, что требует настоящего жеста (буфер обмена страницы, выбор файла,
   полноэкранный режим), проигрыватель не воспроизводит — это в README.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  var core = window.ProtoPanelCore;
  var ctx = window.__PROTO_PANEL || {};
  if (!PP || !PP._store || !core) return;

  var store = PP._store, bus = PP._bus, session = store.session;
  var APP = ctx.app;
  var K_STATE = 'pp.state:' + APP, K_PENDING = 'pp.pending', K_GUARD = 'pp.guard';
  var PENDING_TTL = 20000, GUARD_TTL = 5000, SHOW_PAUSE = 450, POLL = 50;
  var LOG = '[панель прототипа]';
  var busy = null;   // { flow, from, to, phase } — пока идёт переход
  var last = null;   // последний прогон: { flow, from, to, start, end, ok } — время от начала загрузки страницы, мс (диагностика)

  /* ---------------- сценарии ---------------- */

  function flows() { var d = store.data(); return d && Array.isArray(d.flows) ? d.flows : []; }
  function flowById(id) { return flows().filter(function (f) { return f.id === id; })[0] || null; }
  function stepIdx(flow, ref) {
    if (typeof ref === 'number') return ref >= 0 && ref < flow.steps.length ? ref : -1;
    for (var i = 0; i < flow.steps.length; i++) if (flow.steps[i].id === ref) return i;
    return -1;
  }
  function entryIdx(flow, j) { for (var m = j; m >= 0; m--) if (flow.steps[m].page) return m; return -1; }
  function decode(s) { try { return decodeURIComponent(s); } catch (e) { return s; } }
  function urlKey(u) { var x = new URL(u, location.href); return decode(x.pathname) + x.search; }
  function here() { return decode(location.pathname) + location.search; }
  function entryUrl(flow, k) { return new URL(flow.steps[k].page, ctx.pagesUrl).href; }

  /** Адрес шага: страница точки входа + #pp=<сценарий>/<шаг>. */
  function stepUrl(flowId, stepRef) {
    var flow = flowById(flowId);
    if (!flow) return null;
    var j = stepIdx(flow, stepRef);
    if (j < 0) return null;
    var k = entryIdx(flow, j);
    return entryUrl(flow, k).split('#')[0] + '#pp=' + encodeURIComponent(flow.id) + '/' + encodeURIComponent(flow.steps[j].id);
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

  function current() {
    var st = state();
    if (!st) return null;
    var flow = flowById(st.flow), i = stepIdx(flow, st.step);
    return { flow: st.flow, step: st.step, index: i, total: flow.steps.length, title: flow.steps[i].title, dirty: !!st.dirty, error: st.error || null };
  }

  function sec(ms) { return String(Math.round(ms / 100) / 10).replace('.', ',') + ' с'; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  var frames = store.frames;

  /* ---------------- поиск цели ---------------- */

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

  function find(sel, index, timeout, want, needEnabled) {
    var deadline = Date.now() + timeout;
    return new Promise(function (resolve, reject) {
      (function poll() {
        var list;
        try { list = document.querySelectorAll(sel); } catch (e) { reject(new Error('селектор не разбирается: ' + e.message)); return; }
        var el = pick(list, index || 0), ok = false, why = '';
        if (want === 'absent') { ok = list.length === 0; why = 'элемент не исчез за ' + sec(timeout); }
        else if (want === 'hidden') { ok = !el || !visible(el); why = 'элемент не скрылся за ' + sec(timeout); }
        else if (want === 'present') { ok = !!el; why = 'элемент не найден за ' + sec(timeout); }
        else if (!el) why = 'элемент не найден за ' + sec(timeout);
        else if (!visible(el)) why = 'элемент есть, но скрыт';
        else if (needEnabled && !enabled(el)) why = 'элемент заблокирован';
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
    else throw new Error('элемент — не поле ввода');
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
  function press(t, a) {
    var key = a.key === 'Space' ? ' ' : a.key;
    ['keydown', 'keyup'].forEach(function (type) {
      t.dispatchEvent(new KeyboardEvent(type, { key: key, code: codeOf(a.key), bubbles: true, cancelable: true, composed: true,
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

  function exec(a, show) {
    if (a.verb === 'wait') return sleep(a.ms);
    if (a.verb === 'waitFor') return find(a.target, a.index, a.timeout, a.state || 'visible', false);
    var need = a.verb === 'click' || a.verb === 'fill';
    var target = a.target ? find(a.target, a.index, a.timeout, 'visible', need) : Promise.resolve(document.activeElement || document.body);
    return target.then(function (el) {
      if (a.verb !== 'scroll' && el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      return (show && a.target ? highlight(el) : Promise.resolve(null)).then(function (hl) {
        if (a.verb === 'click') click(el);
        else if (a.verb === 'fill') fill(el, a.value == null ? '' : a.value);
        else if (a.verb === 'hover') hover(el);
        else if (a.verb === 'focus') el.focus();
        else if (a.verb === 'scroll') el.scrollIntoView({ block: a.block || 'center', inline: 'nearest' });
        else if (a.verb === 'press') press(el, a);
        if (hl) setTimeout(function () { hl.remove(); }, 250);
      });
    });
  }

  /* ---------------- переходы ---------------- */

  function message(flow, s, ai, why) {
    var step = flow.steps[s];
    return 'Шаг ' + (s + 1) + ' «' + step.title + '»' + (ai == null ? '' : ', действие ' + (ai + 1) + ' (' + core.describeAction(step.do[ai]) + ')') + ': ' + why;
  }

  function fail(flow, lastOk, s, ai, text) {
    session.set(K_GUARD, null);
    var st = { flow: flow.id, step: flow.steps[Math.max(0, lastOk)].id, dirty: true, error: { step: flow.steps[s].id, action: ai, message: text } };
    setState(st);
    console.warn(LOG + ' ' + text);
    bus.emit('error', { flow: flow.id, step: flow.steps[s].id, index: s, action: ai, message: text });
  }

  function run(flow, a, b, opts) {
    opts = opts || {};
    busy = { flow: flow.id, from: a, to: b, phase: 'run' };
    last = { flow: flow.id, from: a, to: b, start: Math.round(performance.now()), end: null, ok: null };
    bus.emit('busy', busy);
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
        return exec(act, !!opts.show && s === b).then(function () {
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
      bus.emit('step', { flow: flow.id, step: flow.steps[b].id, index: b, total: flow.steps.length, title: flow.steps[b].title });
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
    if (!flow) return Promise.reject(new Error('Сценария «' + flowId + '» нет'));
    var j = stepIdx(flow, stepRef);
    if (j < 0) return Promise.reject(new Error('Шага «' + stepRef + '» в сценарии «' + flow.title + '» нет'));
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
    if (opts.fresh && onPage) return run(flow, k, j, { show: show, reopen: reopen });
    if (clean && onPage && cur >= k && cur < j) return run(flow, cur + 1, j, { show: show, reopen: reopen });
    if (clean && onPage && cur === j) {
      if (PP._ui && !reopen) PP._ui.close();
      return Promise.resolve(true);
    }
    session.set(K_PENDING, { app: APP, flow: flow.id, from: flow.steps[k].id, to: flow.steps[j].id, url: urlKey(url), at: Date.now(), show: show, reopen: reopen });
    busy = { flow: flow.id, from: k, to: j, phase: 'navigate' };
    bus.emit('busy', busy);
    if (onPage) location.reload(); else location.href = url.split('#')[0];
    return Promise.resolve(true);
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

  /* Адрес шага #pp=<сценарий>/<шаг>: хеш убирается, панель идёт к шагу. */
  function fromHash(fresh) {
    var m = /(?:^#|&)pp=([^&]+)/.exec(location.hash || '');
    if (!m) return null;
    history.replaceState(history.state, '', location.pathname + location.search);
    var parts = decode(m[1]).split('/');
    return goTo(parts[0], parts[1] || 0, { fresh: !!fresh }).catch(function (e) {
      bus.emit('error', { message: 'Адрес шага: ' + e.message });
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
      if (flow && a >= 0 && b >= a) return run(flow, a, b, { show: p.show, reopen: p.reopen });
    }
    if (g && g.app === APP && now - g.at < GUARD_TTL) {
      var gf = flowById(g.flow);
      var gs = gf ? stepIdx(gf, g.step) : -1;
      if (gf && gs >= 0) {
        fail(gf, gs - 1 >= entryIdx(gf, gs) ? gs - 1 : entryIdx(gf, gs), gs, g.action,
          message(gf, gs, g.action, 'увело на другую страницу — переход задаётся полем page следующего шага'));
        return Promise.resolve(false);
      }
    }
    var st = state();
    if (st && !st.dirty) { st.dirty = true; setState(st); }
    return Promise.resolve(false);
  }

  /* ---------------- «изменено вручную» ---------------- */

  var QUIET_KEYS = { Alt: 1, Shift: 1, Control: 1, Meta: 1, AltGraph: 1, CapsLock: 1, Tab: 1, Fn: 1 };
  var PANEL_SEL = '.pp-root, #pp-drawer, .pp-modal, .pp-hl, .snackbar-layer, .toast-layer';
  ['pointerdown', 'keydown', 'input'].forEach(function (type) {
    document.addEventListener(type, function (e) {
      if (!e.isTrusted || busy) return;
      if (type === 'keydown' && (QUIET_KEYS[e.key] || core.hotkeyOf(e))) return;
      var t = e.target;
      if (t && t.nodeType !== 1) t = t.parentElement;
      if (t && t.closest && t.closest(PANEL_SEL)) return;
      var st = state();
      if (!st || st.dirty) return;
      st.dirty = true;
      setState(st);
    }, true);
  });

  PP._runner = {
    flows: flows, flowById: flowById, stepIdx: stepIdx, entryIdx: entryIdx, entryUrl: entryUrl, stepUrl: stepUrl,
    state: state, current: current, busy: function () { return busy; },
    goTo: goTo, next: next, prev: prev, stop: stop, start: start, resume: resume,
    here: here, lastRun: function () { return last; }
  };
})();

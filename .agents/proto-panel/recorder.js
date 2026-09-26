/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — запись действий (recorder.js), задача 0005a.

   Пассивно, без кнопки «начать запись»: с открытия страницы рекордер ведёт
   в памяти вкладки журнал настоящих действий человека (isTrusted) — клики,
   ввод, выбор в списке, Enter и Escape — на языке сценариев (click, fill,
   press) с устойчивыми селекторами (§5.3). Действия, которые проиграла
   сама панель, приходят от проигрывателя шиной в готовом виде. Журнал живёт
   до перезагрузки или перехода на другую страницу, на диск сам не попадает.

   Fix State берёт из журнала нужный кусок и превращает его в шаг: чистая
   функция ядра core.composeState (её проверяет селфтест) решает, приращение
   это или новая точка входа. Записанный шаг уходит в flows.yaml операцией
   addState (store.saveFlows) — без папки ложится черновиком.

   Не записываются: перетаскивание, наведение, прокрутка, Tab и стрелки,
   действия во фрейме превью, выбор файла, поле пароля; перетаскивание,
   фрейм и выбор файла дают шагу пометку (issues), как и хрупкий селектор.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  var core = window.ProtoPanelCore;
  var ctx = window.__PROTO_PANEL || {};
  if (!PP || !PP._store || !PP._runner || !core) return;
  var store = PP._store, runner = PP._runner, bus = PP._bus;

  var LIMIT = 300, DRAG = 6;
  /* §5.2: элемент, который реагирует на клик */
  var CLICKABLE = 'a[href], button, input, select, textarea, label, summary, [role="button"], [role="link"], [role="tab"], [role="option"], '
    + '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="checkbox"], [role="radio"], [role="switch"], [role="treeitem"], '
    + '[tabindex]:not([tabindex="-1"]), [onclick]';
  /* открытые плавающие слои ДС: клик мимо закрывает слой — это действие */
  var LAYERS = '.menu.is-open, .ddl.is-open, .popover.is-open';
  var NOT_TEXT = { button: 1, submit: 1, reset: 1, image: 1, checkbox: 1, radio: 1, file: 1, range: 1, color: 1, hidden: 1, password: 1 };
  /* §5.3, п. 2: «говорящие» атрибуты — первыми; служебные и изменчивые — никогда */
  var SPEAKING = ['data-act', 'data-id', 'data-obj', 'data-focus', 'data-thread', 'data-menu', 'data-modal', 'data-drawer', 'data-tab',
    'data-value', 'data-key', 'data-col', 'data-sort', 'data-flow'];
  var SKIP_ATTR = /^data-(icon|illu|tooltip.*|pp.*|popover-.*|modal-.*|drawer-.*|tabs-.*|state|selected|open|active)$|^data-menu-/;

  function now() { return Date.now(); }
  function cut(s, n) { s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function esc(v) { return window.CSS && CSS.escape ? CSS.escape(v) : String(v).replace(/[^\w-]/g, '\\$&'); }
  function cssStr(v) { return '"' + String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\a ') + '"'; }

  /* Страница текущей загрузки: путь от pages/ и параметры, без #. */
  function pagePath() {
    var p = location.pathname, base = ctx.pagesUrl ? new URL(ctx.pagesUrl).pathname : '';
    try { p = decodeURIComponent(p); base = decodeURIComponent(base); } catch (e) { /* как есть */ }
    var rel = base && p.indexOf(base) === 0 ? p.slice(base.length) : p.split('/').pop();
    return rel + location.search;
  }

  var trail = { page: pagePath(), log: [], mark: 0, flagMark: 0, lastFix: null, base: null, flags: [] };
  var pending = null;   // отложенный ввод: { el, desc, label, at }
  var down = null;      // нажатие: { el, x, y, desc, label, layer, moved }
  var lastLabel = null; // клик по label браузер повторяет на его поле — второй клик не пишется

  /* ---------------- журнал ---------------- */

  function flag(code) {
    if (code === 'truncated' && trail.flags.some(function (f) { return f.code === 'truncated'; })) return;
    trail.flags.push({ code: code, at: trail.log.length });
    bus.emit('recorded', trail.log.length);
  }
  function push(action, extra) {
    extra = extra || {};
    if (trail.log.length >= LIMIT) { flag('truncated'); return; }
    trail.log.push({ action: core.makeAction(action), replayed: !!extra.replayed, at: extra.at || now(), label: extra.label || null, fragile: !!extra.fragile });
    bus.emit('recorded', trail.log.length);
  }

  /* Событие человека на странице: не синтетическое, не во время проигрывания, не в панели.
     Открытая шторка модальна: пока она открыта, клавиши — её (Esc закрывает шторку,
     даже если фокус после перерисовки упал на body). */
  function record(e) {
    if (!e.isTrusted || runner.busy()) return false;
    if (PP._ui && PP._ui.isOpen && PP._ui.isOpen()) return false;
    var tg = e.target && e.target.nodeType === 1 ? e.target : e.target && e.target.parentElement;
    return !!tg && !runner.isOwn(tg);
  }

  /* ---------------- на что кликнули (§5.2) ---------------- */

  function clickTarget(node) {
    var el = node && node.nodeType === 1 ? node : node && node.parentElement;
    if (!el || runner.isOwn(el)) return null;
    var c = el.closest(CLICKABLE);
    if (c) return c;
    /* курсор наследуется: берётся внешний элемент, который объявил pointer (у его родителя курсор уже другой) */
    var found = null;
    for (var p = el; p && p.nodeType === 1 && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      var cur = '';
      try { cur = getComputedStyle(p).cursor; } catch (e) { cur = ''; }
      if (cur === 'pointer') found = p;
      else if (found) break;
    }
    return found;
  }
  function openLayer() {
    return Array.prototype.some.call(document.querySelectorAll(LAYERS), function (l) { return !runner.isOwn(l); });
  }
  function isTextField(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.isContentEditable) return true;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName === 'INPUT') return !NOT_TEXT[String(el.type || 'text').toLowerCase()];
    return false;
  }
  function isField(el) { return el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el && el.isContentEditable; }

  /* ---------------- подпись (§5.5) ---------------- */

  function fieldLabel(el) {
    var a = el.getAttribute('aria-label');
    if (a && a.trim()) return cut(a, 40);
    if (el.labels && el.labels.length) { var lt = cut(el.labels[0].innerText || el.labels[0].textContent, 40); if (lt) return lt; }
    var ph = el.getAttribute('placeholder');
    if (ph && ph.trim()) return cut(ph, 40);
    var nm = el.getAttribute('name');
    return nm ? cut(nm, 40) : null;
  }
  function firstLine(s) { return String(s || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean)[0] || ''; }
  /* Подпись компонента ДС — его часть по БЭМ (.btn__label, .bopt__label, .doc__title):
     у опции «Группа · ГК «Северный агрохолдинг»» первая строка — тег «Группа», а
     подпись — имя. Видимый текст важнее title: у кнопок с подписью title — описание-
     подсказка (у чипа «Долговая нагрузка и ковенанты» — текст запроса); title —
     подпись кнопок-иконок, у которых видимого текста нет. */
  var LABEL_PART = '[class*="__label"], [class*="__title"], [class*="__name"]';
  /** Подпись элемента: aria-label → подпись компонента → видимый текст (первая строка) → title; у поля: label, placeholder, name. До 40 символов. */
  function labelOf(el) {
    if (!el || el.nodeType !== 1) return null;
    var a = el.getAttribute('aria-label');
    if (a && a.trim()) return cut(a, 40);
    if (isField(el)) return fieldLabel(el);
    var part = el.querySelector(LABEL_PART);
    if (part && part.getClientRects().length) { var pl = firstLine(part.innerText || part.textContent); if (pl) return cut(pl, 40); }
    var first = firstLine(el.innerText || el.textContent);
    if (first) return cut(first, 40);
    var ti = el.getAttribute('title');
    return ti && ti.trim() ? cut(ti, 40) : null;
  }

  /* ---------------- селектор цели (§5.3) ---------------- */

  function okId(id) {
    return /^[A-Za-z_][\w-]*$/.test(id) && !/^pp-/.test(id) && !/\d{4,}/.test(id) && !/[0-9a-f]{8,}$/i.test(id) && id.indexOf(':') < 0;
  }
  function attrSel(el, name) { var v = el.getAttribute(name); return v === '' ? '[' + name + ']' : '[' + name + '=' + cssStr(v) + ']'; }
  function dataAttrs(el) {
    var names = SPEAKING.filter(function (n) { return el.hasAttribute(n); });
    Array.prototype.forEach.call(el.attributes, function (a) {
      if (/^data-/.test(a.name) && names.indexOf(a.name) < 0 && !SKIP_ATTR.test(a.name)) names.push(a.name);
    });
    return names.map(function (n) { return attrSel(el, n); });
  }
  /* Область: ближайший предок с устойчивым id или «говорящим» атрибутом. */
  function scopeOf(el) {
    for (var p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (runner.isOwn(p)) return null;
      if (p.id && okId(p.id)) return '#' + esc(p.id);
      for (var i = 0; i < SPEAKING.length; i++) if (p.hasAttribute(SPEAKING[i])) return attrSel(p, SPEAKING[i]);
    }
    return null;
  }
  /* Первый класс компонента: не состояние (is-*), не модификатор (--), не свой. */
  function componentClass(el) {
    var list = Array.prototype.slice.call(el.classList || []);
    return list.filter(function (c) { return !/^is-/.test(c) && c.indexOf('--') < 0 && !/^pp-/.test(c) && /^[A-Za-z_][\w-]*$/.test(c); })[0] || null;
  }
  /* Структурный путь от ближайшего предка с id (или от body) — единственный, но хрупкий. */
  function structural(el) {
    var parts = [];
    for (var node = el; node && node.nodeType === 1 && node !== document.body; node = node.parentElement) {
      if (node !== el && node.id && okId(node.id)) { parts.unshift('#' + esc(node.id)); return parts.join(' > '); }
      var tag = node.tagName.toLowerCase(), k = 1, same = 0;
      for (var sib = node.previousElementSibling; sib; sib = sib.previousElementSibling) if (sib.tagName === node.tagName) k++;
      if (node.parentElement) Array.prototype.forEach.call(node.parentElement.children, function (x) { if (x.tagName === node.tagName) same++; });
      parts.unshift(same > 1 ? tag + ':nth-of-type(' + k + ')' : tag);
    }
    parts.unshift('body');
    return parts.join(' > ');
  }

  function candidates(el, opts) {
    var c = [], tag = el.tagName.toLowerCase();
    if (el.id && okId(el.id)) c.push({ target: '#' + esc(el.id) });
    var attrs = dataAttrs(el);
    attrs.forEach(function (a) { c.push({ target: a }); });
    for (var i = 0; i < attrs.length; i++) for (var j = i + 1; j < attrs.length; j++) c.push({ target: attrs[i] + attrs[j] });
    var own = [];
    if (el.getAttribute('name') && /^(input|select|textarea|button)$/.test(tag)) own.push(tag + attrSel(el, 'name'));
    var al = el.getAttribute('aria-label');
    if (al && al.trim()) own.push(tag + attrSel(el, 'aria-label'));
    own.forEach(function (s) { c.push({ target: s }); });
    var scope = scopeOf(el);
    if (scope) attrs.concat(own).forEach(function (s) { c.push({ target: scope + ' ' + s }); });
    var cls = componentClass(el);
    if (!opts.noText) {
      var txt = runner.textOf(el);
      if (txt && txt.length <= 60) {
        c.push({ target: cls ? '.' + esc(cls) : tag, text: txt });
        if (scope) c.push({ target: scope + ' ' + (cls ? '.' + esc(cls) : tag), text: txt });
      }
    }
    if (cls && scope) c.push({ target: scope + ' .' + esc(cls) });
    return c;
  }

  /**
   * Селектор для элемента: { target, text, index, fragile }. Первая стратегия с
   * единственным совпадением (свои элементы панели не в счёт); нет такой —
   * первая совпавшая с index (цель последняя — index: -1); не совпала ни одна —
   * структурный путь (хрупкий). opts.unique — только единственное совпадение
   * (у press нет index), opts.noText — без цели по тексту (у fill нет text).
   */
  function describe(el, opts) {
    opts = opts || {};
    var list = candidates(el, opts), first = null;
    for (var i = 0; i < list.length; i++) {
      var m;
      try { m = runner.matches(list[i].target, list[i].text); } catch (e) { continue; }
      var pos = m.indexOf(el);
      if (pos < 0) continue;
      if (m.length === 1) return { target: list[i].target, text: list[i].text || null, index: 0, fragile: false };
      if (!first && !opts.unique) first = { c: list[i], pos: pos, len: m.length };
    }
    if (first) return { target: first.c.target, text: first.c.text || null, index: first.pos === first.len - 1 ? -1 : first.pos, fragile: false };
    return { target: structural(el), text: null, index: 0, fragile: true };
  }

  /* ---------------- отложенный ввод ---------------- */

  function pendingEntry() {
    if (!pending) return null;
    var el = pending.el;
    var value = el.isContentEditable ? el.textContent : el.value;
    return { action: core.makeAction({ verb: 'fill', target: pending.desc.target, index: pending.desc.index, value: value == null ? '' : String(value) }),
      replayed: false, at: pending.at, label: pending.label, fragile: pending.desc.fragile };
  }
  /* Клик в текстовое поле перед вводом в него же — часть ввода: fill сам даёт
     полю фокус (§4.2: «Конструктор», ввод, выбор — три действия, не четыре).
     Снимается только последний клик журнала — человека, после последней
     фиксации и проигрывания, без цели по тексту; время ввода — с клика. */
  function absorbs(log, e) {
    var last = log[log.length - 1];
    var floor = Math.max(trail.mark || 0, trail.base ? trail.base.at : 0);
    return !!last && log.length - 1 >= floor && !last.replayed && last.action.verb === 'click' && !last.action.text
      && last.action.target === e.action.target && last.action.index === e.action.index;
  }
  /* Журнал с отложенным вводом — как он ляжет после flushPending (строка рекордера). */
  function withPending(log) {
    var e = pendingEntry();
    if (!e) return log;
    var out = log.slice();
    if (absorbs(out, e)) e.at = out.pop().at;
    out.push(e);
    return out;
  }
  function flushPending() {
    var e = pendingEntry();
    pending = null;
    if (!e) return;
    if (absorbs(trail.log, e)) e.at = trail.log.pop().at;
    if (trail.log.length >= LIMIT) { flag('truncated'); return; }
    trail.log.push(e);
    bus.emit('recorded', trail.log.length);
  }

  /* ---------------- слушатели (§5.1) ---------------- */

  document.addEventListener('pointerdown', function (e) {
    if (!record(e)) return;
    var el = clickTarget(e.target);
    if (pending && pending.el !== el && !(el && pending.el.contains(el))) flushPending();
    down = { el: el, x: e.clientX, y: e.clientY, desc: el ? describe(el) : null, label: el ? labelOf(el) : null, layer: openLayer(), moved: false };
  }, true);

  document.addEventListener('pointerup', function (e) {
    if (!down || !e.isTrusted) return;
    if (Math.max(Math.abs(e.clientX - down.x), Math.abs(e.clientY - down.y)) > DRAG) { down.moved = true; flag('drag'); }
  }, true);

  document.addEventListener('click', function (e) {
    if (!record(e)) return;
    var d = down;
    down = null;
    if (d && d.moved) return;   // перетаскивание: пометка уже стоит
    var el = clickTarget(e.target);
    if (el && (el.matches('input[type="file"]') || el.tagName === 'LABEL' && el.control && el.control.type === 'file')) { flag('file'); return; }
    if (lastLabel && el && el === lastLabel.control && now() - lastLabel.at < 300) { lastLabel = null; return; }
    if (el) {
      if (pending && pending.el !== el) flushPending();
      var same = d && d.el === el;
      var desc = same && d.desc ? d.desc : describe(el);
      push({ verb: 'click', target: desc.target, text: desc.text, index: desc.index }, { label: same ? d.label : labelOf(el), fragile: desc.fragile });
      lastLabel = el.tagName === 'LABEL' && el.control ? { control: el.control, at: now() } : null;
      return;
    }
    /* клик мимо, пока открыт плавающий слой ДС, — закрытие слоя */
    if (d ? d.layer : openLayer()) { flushPending(); push({ verb: 'click', target: 'body' }, { label: null }); }
  }, true);

  document.addEventListener('input', function (e) {
    if (!record(e)) return;
    var el = e.target;
    if (!isTextField(el)) return;
    if (pending && pending.el !== el) flushPending();
    if (!pending) pending = { el: el, desc: describe(el, { noText: true }), label: fieldLabel(el), at: now() };
  }, true);

  document.addEventListener('change', function (e) {
    if (!record(e)) return;
    var el = e.target;
    if (el.tagName === 'SELECT') {
      flushPending();
      var d = describe(el, { noText: true });
      push({ verb: 'fill', target: d.target, index: d.index, value: el.value }, { label: fieldLabel(el), fragile: d.fragile });
    } else if (pending && pending.el === el) flushPending();
  }, true);

  document.addEventListener('focusout', function (e) {
    if (pending && e.target === pending.el) flushPending();
  }, true);

  /* На window, в фазе захвата: раньше обработчиков документа — рантайм ДС закрывает
     шторку по Esc в своём, и к document-слушателю рекордера она была бы уже закрыта. */
  window.addEventListener('keydown', function (e) {
    if (!record(e) || core.hotkeyOf(e)) return;
    var el = e.target;
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey && isTextField(el)) {
      flushPending();
      var d = describe(el, { noText: true, unique: true });
      push({ verb: 'press', key: 'Enter', target: d.target }, { label: fieldLabel(el), fragile: d.fragile });
    } else if (e.key === 'Escape') {
      flushPending();
      if (isTextField(el)) {
        var d2 = describe(el, { noText: true, unique: true });
        push({ verb: 'press', key: 'Escape', target: d2.target }, { label: fieldLabel(el), fragile: d2.fragile });
      } else push({ verb: 'press', key: 'Escape' }, { label: null });
    }
  }, true);

  /* фокус ушёл во фрейм превью: действия там не записываются */
  window.addEventListener('blur', function () {
    setTimeout(function () {
      var a = document.activeElement;
      if (a && a.tagName === 'IFRAME' && !runner.isOwn(a) && !runner.busy()) flag('frame');
    }, 0);
  });

  /* ---------------- проигрыватель ---------------- */

  bus.on('replay-start', function () { flushPending(); trail.lastFix = null; });
  /* подпись цели — до действия: после клика «Конструктор» кнопка уже «Закрыть конструктор» */
  var before = null;
  bus.on('replay-target', function (x) { before = x && x.el ? { el: x.el, label: labelOf(x.el) } : null; });
  bus.on('replay-action', function (x) {
    var label = x.el && x.action.verb !== 'waitFor' && x.action.verb !== 'wait' ? (before && before.el === x.el ? before.label : labelOf(x.el)) : null;
    before = null;
    if (trail.log.length >= LIMIT) { flag('truncated'); return; }
    trail.log.push({ action: core.makeAction(x.action), replayed: true, at: now(), label: label, fragile: false });
  });
  bus.on('step', function (x) { trail.base = { flow: x.flow, step: x.step, at: trail.log.length, flags: trail.flags.length }; });
  /* после записи черновые номера и id могли смениться — ссылки журнала идут следом */
  bus.on('flows-saved', function (x) {
    if (!x || !x.map) return;
    Object.keys(x.map.states).forEach(function (ref) {
      var m = x.map.states[ref];
      if (trail.lastFix && trail.lastFix.ref === ref) { trail.lastFix.flow = m.to.flow; trail.lastFix.state = m.to.state; }
      if (trail.base && m.from && trail.base.flow === m.from.flow && trail.base.step === m.from.id) { trail.base.flow = m.to.flow; trail.base.step = m.to.id; }
    });
  });

  /* ---------------- Fix State ---------------- */

  function flowOf(flowId) {
    var list = store.flows();
    return flowId ? list.filter(function (f) { return f.id === flowId; })[0] || null : null;
  }

  /** Что сделает Fix State прямо сейчас — без записи (строка рекордера, §7.2). */
  function preview(flowId) {
    var tr = Object.assign({}, trail, { log: withPending(trail.log) });
    var flow = flowOf(flowId) || { id: flowId || null, steps: [] };
    var n = (store.lastState() || 0) + 1;
    var c = core.composeState({ trail: tr, flow: flow, n: n, pageTitle: document.title });
    c.n = n;
    c.page = trail.page;
    return c;
  }

  /**
   * Зафиксировать текущее состояние в сценарии flowId (нет сценариев — новый
   * «Flow 01»). → { ref, flow, id, state, drafted, mode, draft, title } | { error }.
   */
  function fix(flowId) {
    flushPending();
    var flow = flowOf(flowId);
    var ops = [], flowRef = null;
    if (!flow) { flowRef = store.newRef('f'); ops.push({ op: 'addFlow', ref: flowRef }); }
    var n = (store.lastState() || 0) + 1;
    var c = core.composeState({ trail: trail, flow: flow || { id: null, steps: [] }, n: n, when: core.stamp(), pageTitle: document.title });
    if (c.error) return Promise.resolve({ error: c.error, after: c.after ? c.after.state : null });
    var ref = store.newRef('s');
    ops.push({ op: 'addState', ref: ref, flow: flow ? flow.id : flowRef, step: c.step });
    var mark = trail.log.length, flagMark = trail.flags.length;
    return store.saveFlows(ops).then(function (out) {
      var s = out.res && out.res.states[ref];
      if (!s) return { error: 'not-saved' };
      trail.lastFix = { flow: s.flow, state: s.state, ref: ref };
      trail.mark = mark;
      trail.flagMark = flagMark;
      runner.setAt(s.flow, s.id);
      var saved = core.findState({ flows: store.flows() }, s.state);
      var res = { ref: ref, flow: s.flow, id: s.id, state: s.state, drafted: n, mode: c.mode, draft: !!out.draft,
        title: saved ? saved.step.title : c.step.title, flowTitle: saved ? saved.flow.title : '', saveError: out.error || null };
      bus.emit('fixed', res);
      return res;
    });
  }

  PP._recorder = {
    trail: function () { return trail; }, preview: preview, fix: fix, describe: describe, labelOf: labelOf, flush: flushPending
  };
})();

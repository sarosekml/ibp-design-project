/* ============================================================
   kit-docpage.js — рантайм страницы компонента витрины.

   Страницы компонентов собирает kit-build.mjs: реальный фрагмент виджета
   уже вшит в стенд демо (#pg-stage), его окна — в конец body, скрипты данных
   и виджетов — как на странице-хозяине. Каркас и табы держит слой ДС
   (docs-split.css + docs-split.js), оглавление он собирает сам. Этот модуль
   закрывает то, чего в слое ДС нет:

   1. Конструктор. Оси — из CSS виджета: состояния данных (data-state) и
      режимы прав (data-mode); у тайла и таблицы ещё ширина. Все выборы
      создаются селектами — docs-split.js сам делает из да/нет свитч, из 2–3
      вариантов ButtonGroup, 4 и больше оставляет списком (правило §11).
   2. Демо. Переключатели меняют атрибуты на ЖИВОМ фрагменте, а не
      пересобирают его: скрипт окна держит ссылки на свои узлы, и замена
      разметки оборвала бы его поведение.
   3. «Все состояния рядом» — копии исходного фрагмента, по одной на пару
      «состояние × режим». id в копиях получают суффикс, чтобы не задвоиться.
   4. Сценарий демо. Необязательный <Имя>.demo.js рядом со страницей
      регистрирует его до загрузки страницы:
        IBPKitDemo.register('<Имя>', {
          states: ['partial'],                  // состояния, которые различают
                                                // данные, а не CSS виджета
          controls: function (defs) { return defs.concat([...]); },  // свои контролы
          apply: function (el, st, ctx) { … }   // наполнить узел данными;
                                                // ctx.fixtures — fixtures.json,
                                                // ctx.live — живой фрагмент или копия
        });

   Вызов — из страницы: IBPKitDoc.page(window.IBPKitPage).
   ============================================================ */
(function () {
  'use strict';

  var STATE_LABELS = {
    loading: 'Загрузка', data: 'Данные есть', partial: 'Заполнено частично', empty: 'Данных нет',
    error: 'Ошибка', updating: 'Обновление'
  };
  var MODE_LABELS = { edit: 'Редактирование', view: 'Только просмотр', select: 'Выбор' };
  var STATE_ORDER = ['loading', 'data', 'partial', 'empty', 'error', 'updating'];
  var label = function (map, v) { return map[v] || v; };
  /* Порядок контролов конструктора по ключу (раздел 3 канона): оси, вариант,
     пример, длинные значения, свои — по порядку сценария, ширина — последней. */
  var CONTROL_ORDER = { state: 0, mode: 1, variant: 2, example: 3, long: 4, width: 6 };
  var rankOf = function (d) { var r = CONTROL_ORDER[d.key]; return r === undefined ? 5 : r; };

  /* ---------- контролы конструктора (разметка — конвенция ДС: .ctl > .lbl + контрол) ---------- */
  function makeSelect(def, state, onChange) {
    var wrap = document.createElement('div');
    wrap.className = 'ctl';
    var lbl = document.createElement('div');
    lbl.className = 'lbl';
    lbl.textContent = def.label;
    wrap.appendChild(lbl);
    var box = document.createElement('div');
    box.className = 'pg-select';
    var sel = document.createElement('select');
    var options = def.bool ? [['no', 'Нет'], ['yes', 'Да']] : def.options;
    var cur = def.bool ? (state[def.key] ? 'yes' : 'no') : String(state[def.key]);
    options.forEach(function (pair) {
      var op = document.createElement('option');
      op.value = pair[0];
      op.textContent = pair[1];
      if (pair[0] === cur) op.selected = true;
      sel.appendChild(op);
    });
    sel.addEventListener('change', function () {
      state[def.key] = def.bool ? sel.value === 'yes' : sel.value;
      onChange(state);
    });
    box.appendChild(sel);
    wrap.appendChild(box);
    return wrap;
  }

  /* Демо перерисовывается на каждом шаге слайдера: перестроение по ширине
     видно, пока тянешь. */
  function makeRange(def, state, onChange) {
    var wrap = document.createElement('div');
    wrap.className = 'ctl';
    var lbl = document.createElement('div');
    lbl.className = 'lbl';
    var val = document.createElement('b');
    lbl.appendChild(document.createTextNode(def.label + ' · '));
    lbl.appendChild(val);
    wrap.appendChild(lbl);
    var input = document.createElement('input');
    input.type = 'range';
    input.min = String(def.range.min);
    input.max = String(def.range.max);
    input.step = String(def.range.step || 1);
    input.value = String(state[def.key]);
    input.setAttribute('aria-label', def.label);
    val.textContent = input.value;
    input.addEventListener('input', function () {
      state[def.key] = Number(input.value);
      val.textContent = input.value;
      onChange(state);
    });
    wrap.appendChild(input);
    return wrap;
  }

  /* docs-split.js раскладывает контролы на DOMContentLoaded; слайдеры по
     конвенции стоят справа, в .toggles, — переносим их после раскладки. */
  function placeRanges(host, ranges) {
    if (!ranges.length) return;
    function move() {
      setTimeout(function () {
        var toggles = host.querySelector('.toggles');
        if (toggles) ranges.forEach(function (r) { toggles.appendChild(r); });
      }, 0);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', move);
    else move();
  }

  function controls(defs, onChange) {
    var host = document.getElementById('pg-controls');
    var state = {};
    var switches = window.DS_SPLIT_SWITCH_LABELS || (window.DS_SPLIT_SWITCH_LABELS = {});
    defs.forEach(function (d) {
      if (d.bool) { state[d.key] = !!d.value; switches[d.label] = switches[d.label] || d.label; }
      else if (d.range) state[d.key] = d.value !== undefined ? Number(d.value) : d.range.min;
      else state[d.key] = d.value !== undefined && d.value !== null ? d.value : d.options[0][0];
    });
    if (host) {
      if (!defs.length) {
        host.insertAdjacentHTML('beforeend', '<p class="kit-controls__empty">Переключать нечего: у компонента одно состояние и один режим.</p>');
      }
      var ranges = [];
      defs.forEach(function (d) {
        if (d.range) { var r = makeRange(d, state, onChange); ranges.push(r); host.appendChild(r); }
        else host.appendChild(makeSelect(d, state, onChange));
      });
      placeRanges(host, ranges);
    }
    onChange(state);
    return state;
  }

  /* ---------- рантаймы ДС после правки разметки ---------- */
  /* Привязки ДС идемпотентны (метки __ds… на узлах), поэтому звать можно
     сколько угодно раз; свежим узлам без них не заработать. */
  function paint(root) {
    var w = window;
    if (w.dsIcons) w.dsIcons.apply(root);
    if (w.DSRiskMetric) w.DSRiskMetric.mount(root);
    if (w.DSModal) w.DSModal.bindAll(root);
    if (w.DSTooltip) w.DSTooltip.bindAll(root);
    if (w.DSMenu) w.DSMenu.bindAll(root);
    if (w.DSPopover) w.DSPopover.bindAll(root);
    if (w.DSDrawer) w.DSDrawer.bindAll(root);
    if (w.DSTable) w.DSTable.wireAll(root);
  }

  /* ---------- стенд ---------- */
  /* Демо-узел: у окна — сам скрим, встроенный в стенд (сборщик уже
     поставил .modal-scrim--inline); у поповера — он же без плавающего слоя;
     у подчасти-шаблона (<template>) — копия эталона: сам шаблон остаётся на
     месте, им рисуют карточки скрипты окон. */
  function subjectOf(stage, type) {
    var root = stage.firstElementChild;
    if (!root) return null;
    var tpl = root.tagName === 'TEMPLATE' ? root : root.querySelector('template');
    if (tpl && tpl.content && tpl.content.firstElementChild) {
      var el = tpl.content.firstElementChild.cloneNode(true);
      stage.appendChild(el);
      return el;
    }
    if (type === 'modal' || type === 'popover') {
      root.hidden = false;
      root.classList.remove('pop--floating');
    }
    return root;
  }
  function axisEl(el, attr) { return el.hasAttribute(attr) ? el : el.querySelector('[' + attr + ']'); }

  /* Копия для «Все состояния»: id с суффиксом, ссылки на них — тоже; ссылки
     наружу (data-modal на окно страницы) остаются — кнопки копий открывают
     настоящее окно. */
  var REF_ATTRS = ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'list'];
  function suffixIds(el, sfx) {
    var nodes = [el].concat(Array.prototype.slice.call(el.querySelectorAll('*')));
    var own = {};
    nodes.forEach(function (n) { if (n.id) { own[n.id] = true; n.id += sfx; } });
    nodes.forEach(function (n) {
      REF_ATTRS.forEach(function (a) {
        var v = n.getAttribute(a);
        if (!v) return;
        n.setAttribute(a, v.split(/\s+/).map(function (t) { return own[t] ? t + sfx : t; }).join(' '));
      });
      if (n.hasAttribute('aria-modal')) n.removeAttribute('aria-modal');
    });
  }

  var scenarios = {};
  window.IBPKitDemo = { register: function (id, s) { scenarios[id] = s || {}; } };

  function page(P) {
    var nav = document.getElementById('nav');
    if (window.IBPKitNav) window.IBPKitNav.render({ nav: nav, base: P.base, current: P.id, hub: P.hub });

    var stage = document.getElementById('pg-stage');
    var subject = stage && subjectOf(stage, P.type);
    if (!subject) return;
    var pristine = subject.cloneNode(true);
    var sc = scenarios[P.id] || {};
    /* Подписи своих состояний и режимов — полем labels сценария, а не в общем
       рантайме (раздел 3 канона). Ключ один на оба словаря: значения состояний
       и режимов не пересекаются. */
    var stateLabels = Object.assign({}, STATE_LABELS, sc.labels);
    var modeLabels = Object.assign({}, MODE_LABELS, sc.labels);
    /* Состояние, которое CSS не различает (заполнено частично — та же
       разметка, другие данные), добавляет сценарий; порядок — как у правил ДС. */
    if (sc.states) {
      sc.states.forEach(function (s) { if (P.states.indexOf(s) < 0) P.states.push(s); });
      var rank = function (s) { var k = STATE_ORDER.indexOf(s); return k < 0 ? STATE_ORDER.length : k; };
      P.states.sort(function (a, b) { return rank(a) - rank(b); });
    }

    var defs = [];
    if (P.states.length > 1) {
      defs.push({ key: 'state', label: 'Состояние данных', value: P.state,
        options: P.states.map(function (s) { return [s, label(stateLabels, s)]; }) });
    }
    if (P.modes.length > 1) {
      defs.push({ key: 'mode', label: 'Режим прав', value: P.mode,
        options: P.modes.map(function (m) { return [m, label(modeLabels, m)]; }) });
    }
    if (P.width) defs.push({ key: 'width', label: 'Ширина, px', range: { min: 180, max: 1600, step: 10 }, value: P.width });
    if (sc.controls) defs = sc.controls(defs) || defs;
    /* Порядок контролов — по ключу, а не по тому, как их добавил сценарий. */
    defs.sort(function (a, b) { return rankOf(a) - rankOf(b); });

    function applyTo(el, st, live) {
      var s = axisEl(el, 'data-state');
      if (s && st.state) s.setAttribute('data-state', st.state);
      var m = axisEl(el, 'data-mode');
      if (m && st.mode) m.setAttribute('data-mode', st.mode);
      if (sc.apply) sc.apply(el, st, { fixtures: P.fixtures || {}, live: live });
    }

    var state = controls(defs, function (st) {
      if (st.width) stage.style.width = st.width + 'px';
      applyTo(subject, st, true);
      paint(stage);
    });

    /* все состояния рядом */
    var host = document.getElementById('kit-cases');
    if (!host) return;
    var states = P.states.length ? P.states : [P.state];
    var modes = P.modes.length ? P.modes : [P.mode];
    var cases = [];
    states.forEach(function (s) {
      modes.forEach(function (m) {
        var name = [s && label(stateLabels, s), modes.length > 1 && m && label(modeLabels, m)].filter(Boolean).join(' · ');
        cases.push([name || 'Как во фрагменте', { state: s, mode: m }]);
      });
    });
    if (cases.length < 2) {
      host.insertAdjacentHTML('beforeend', '<p class="desc">У компонента одно состояние — оно в демо выше.</p>');
      return;
    }
    cases.forEach(function (c, i) {
      var box = document.createElement('div');
      box.className = 'kit-case';
      var cap = document.createElement('p');
      cap.className = 'kit-case__label';
      cap.textContent = c[0];
      var el = pristine.cloneNode(true);
      var st = {};
      Object.keys(state).forEach(function (k) { st[k] = state[k]; });
      st.state = c[1].state;
      st.mode = c[1].mode;
      applyTo(el, st, false);
      suffixIds(el, '-case' + (i + 1));
      box.appendChild(cap);
      box.appendChild(el);
      host.appendChild(box);
    });
    paint(host);
  }

  window.IBPKitDoc = { page: page, controls: controls, paint: paint };
})();

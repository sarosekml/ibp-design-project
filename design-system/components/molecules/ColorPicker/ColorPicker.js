/* ============================================================
   ColorPicker.js — выбор одного цвета sRGB (1.002, MS0013 Р29).

   Состав, как у coolors: поле насыщенности и яркости (SV), ползунок
   тона (Slider), строка с полем Hex (InputText S, слева плашка цвета),
   IconButton «Пипетка» (EyeDropper API, есть только в Chromium) и
   IconButton «Копировать». Ниже — необязательный подвал: слот потребителя
   (opts.footer) и ссылка «Сбросить» (если задан opts.onReset).

   API window.DSColorPicker:
     create(root, opts) — пикер в контейнере; вернёт { get, set, disabled, destroy }.
     bind(trigger, opts) — пикер в Popover M у триггера; вернёт { picker, open, close, destroy, configure }.
                           После bind триггер сам открывает и закрывает пикер по клику:
                           open() — только для программного открытия (например, первый
                           клик, в котором bind и вызван). Позиция — opts.popover
                           { placement, align }, как у DSPopover.
     hsv(hex) / hex({ h, s, v }) — преобразования.

   opts:
     value     — начальный цвет #RRGGBB;
     onChange  — каждое изменение (тянут маркер, двигают тон) — для живого предпросмотра;
     onCommit  — законченное изменение (отпустили маркер или ползунок, ввели Hex) —
                 для истории правок; если не задан, вызывается onChange;
     onReset   — показать «Сбросить» и вызвать по клику;
     footer    — узел DOM для подвала (например, переключатель потребителя);
     disabled  — выключить пикер.

   Hex принимает «18a59e», «#18A59E» и короткую запись «#abc». Ошибку формата
   показывает только по Enter или уходу из поля — не на каждое нажатие.
   Альфа-канал не поддерживается.
   ============================================================ */
(function () {
  'use strict';

  var next = 0;

  function hsv(hex) {
    var rgb = hex.slice(1).match(/../g).map(function (v) { return parseInt(v, 16) / 255; });
    var max = Math.max.apply(null, rgb), min = Math.min.apply(null, rgb), d = max - min, h = 0;
    if (d) {
      var i = rgb.indexOf(max);
      h = 60 * (i === 0 ? ((rgb[1] - rgb[2]) / d) % 6 : i === 1 ? (rgb[2] - rgb[0]) / d + 2 : (rgb[0] - rgb[1]) / d + 4);
    }
    return { h: (h + 360) % 360, s: max ? d / max : 0, v: max };
  }

  function hex(c) {
    var h = c.h / 60, s = c.s, v = c.v, i = Math.floor(h), f = h - i;
    var p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    var rgb = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
    return '#' + rgb.map(function (x) { return Math.round(x * 255).toString(16).padStart(2, '0'); }).join('').toUpperCase();
  }

  /* «18a59e», «#18A59E», «#abc» → «#18A59E»; иначе null. */
  function parseHex(text) {
    var s = String(text || '').trim().replace(/^#/, '');
    if (/^[\da-f]{3}$/i.test(s)) s = s.replace(/./g, function (ch) { return ch + ch; });
    return /^[\da-f]{6}$/i.test(s) ? '#' + s.toUpperCase() : null;
  }

  function create(root, opts) {
    opts = opts || {};
    var id = 'cpk-' + (++next);
    var value = parseHex(opts.value) || '#000000';
    var state = hsv(value);

    root.classList.add('cpk');
    root.innerHTML =
      '<div class="cpk__sv" role="slider" tabindex="0" aria-label="Насыщенность и яркость" aria-valuemin="0" aria-valuemax="100"><span class="cpk__marker"></span></div>' +
      '<div class="slr cpk__hue"><input class="slr__input" id="' + id + '-h" type="range" min="0" max="360" step="1" aria-label="Тон"></div>' +
      '<div class="cpk__row">' +
        '<div class="inp inp--s cpk__hex"><div class="inp__field">' +
          '<span class="inp__lead" aria-hidden="true"><span class="cpk__swatch"></span></span>' +
          '<input class="inp__control" id="' + id + '-hex" spellcheck="false" maxlength="7" aria-label="Hex" aria-describedby="' + id + '-error">' +
        '</div><span class="ds-helper" id="' + id + '-error" hidden>Цвет в формате #RRGGBB</span></div>' +
        '<span class="cpk__tools">' +
          '<button type="button" class="ibtn ibtn--neutral ibtn--m" data-pick aria-label="Пипетка" data-tooltip="Пипетка"><i data-icon="dropper"></i></button>' +
          '<button type="button" class="ibtn ibtn--neutral ibtn--m" data-copy aria-label="Копировать цвет" data-tooltip="Копировать"><i data-icon="copy"></i></button>' +
        '</span>' +
      '</div>' +
      '<div class="cpk__foot" hidden><span class="cpk__slot"></span>' +
        '<button type="button" class="btn btn--transparent btn--xs" data-reset hidden><span class="btn__label">Сбросить</span></button></div>';

    var sv = root.querySelector('.cpk__sv'), marker = root.querySelector('.cpk__marker');
    var hue = root.querySelector('.cpk__hue .slr__input');
    var field = root.querySelector('.cpk__hex'), input = field.querySelector('.inp__control');
    var swatch = root.querySelector('.cpk__swatch'), error = root.querySelector('#' + id + '-error');
    var pick = root.querySelector('[data-pick]'), copy = root.querySelector('[data-copy]');
    var foot = root.querySelector('.cpk__foot'), slot = root.querySelector('.cpk__slot'), reset = root.querySelector('[data-reset]');

    hue.style.setProperty('--slr-track', 'linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)');
    var slider = window.DSSlider.bind(root.querySelector('.cpk__hue'));

    function showError(on) {
      field.classList.toggle('inp--error', on);
      if (on) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
      error.hidden = !on;
    }

    function paint() {
      value = hex(state);
      if (document.activeElement !== input) input.value = value;
      hue.value = Math.round(state.h);
      slider.sync();
      swatch.style.setProperty('--cpk-value', value);
      sv.style.setProperty('--cpk-hue', hex({ h: state.h, s: 1, v: 1 }));
      marker.style.left = state.s * 100 + '%';
      marker.style.top = (1 - state.v) * 100 + '%';
      sv.setAttribute('aria-valuenow', Math.round(state.s * 100));
      sv.setAttribute('aria-valuetext', 'Насыщенность ' + Math.round(state.s * 100) + '%, яркость ' + Math.round(state.v * 100) + '%');
    }

    function emit(final) {
      if (opts.onChange) opts.onChange(value);
      if (final && opts.onCommit) opts.onCommit(value);
      root.dispatchEvent(new CustomEvent('colorpicker:change', { bubbles: true, detail: { value: value, final: !!final } }));
    }

    function setValue(v, notify, final) {
      var parsed = parseHex(v);
      if (!parsed) return false;
      state = hsv(parsed);
      paint();
      showError(false);
      if (notify) emit(final);
      return true;
    }

    /* SV: мышь и касание. */
    var dragging = false;
    function point(e) {
      if (opts.disabled) return;
      var r = sv.getBoundingClientRect();
      state.s = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      state.v = Math.max(0, Math.min(1, 1 - (e.clientY - r.top) / r.height));
      paint();
      emit(false);
    }
    sv.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || opts.disabled) return;
      dragging = true;
      sv.setPointerCapture(e.pointerId);
      sv.focus();
      point(e);
    });
    sv.addEventListener('pointermove', function (e) { if (dragging) point(e); });
    ['pointerup', 'pointercancel'].forEach(function (type) {
      sv.addEventListener(type, function () { if (dragging) { dragging = false; emit(true); } });
    });

    /* SV: стрелки — 1 %, с Shift — 10 %. */
    sv.addEventListener('keydown', function (e) {
      if (opts.disabled) return;
      var step = e.shiftKey ? 0.1 : 0.01;
      if (e.key === 'ArrowRight') state.s = Math.min(1, state.s + step);
      else if (e.key === 'ArrowLeft') state.s = Math.max(0, state.s - step);
      else if (e.key === 'ArrowUp') state.v = Math.min(1, state.v + step);
      else if (e.key === 'ArrowDown') state.v = Math.max(0, state.v - step);
      else return;
      e.preventDefault();
      paint();
      emit(true);
    });

    hue.addEventListener('input', function () { state.h = Number(hue.value) % 360; paint(); emit(false); });
    hue.addEventListener('change', function () { emit(true); });

    /* Hex: полный корректный ввод применяется сразу, ошибка — по Enter или уходу из поля. */
    input.addEventListener('input', function () {
      var parsed = parseHex(input.value);
      if (parsed && parsed !== value) { state = hsv(parsed); paint(); showError(false); emit(false); }
    });
    function commitHex() {
      if (!setValue(input.value, true, true)) showError(true);
      else input.value = value;
    }
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); commitHex(); } });
    input.addEventListener('blur', function () { if (input.value !== value) commitHex(); });

    pick.hidden = !window.EyeDropper;
    pick.addEventListener('click', function () {
      new window.EyeDropper().open().then(function (r) { setValue(r.sRGBHex, true, true); }, function (e) {
        if (e && e.name !== 'AbortError') { error.textContent = 'Пипетка недоступна'; error.hidden = false; }
      });
    });
    copy.addEventListener('click', function () {
      if (!window.DSCopy) return;
      window.DSCopy.write(value).then(function () { window.DSCopy.flash(copy, 'Скопировано'); });
    });

    function setFooter(node, onReset) {
      slot.replaceChildren();
      if (node) slot.appendChild(node);
      opts.onReset = onReset;
      reset.hidden = !onReset;
      foot.hidden = !node && !onReset;
    }
    reset.addEventListener('click', function () { if (opts.onReset) opts.onReset(); });
    setFooter(opts.footer || null, opts.onReset || null);

    function disabled(flag) {
      opts.disabled = !!flag;
      root.classList.toggle('cpk--disabled', opts.disabled);
      sv.tabIndex = opts.disabled ? -1 : 0;
      sv.setAttribute('aria-disabled', String(opts.disabled));
      root.querySelectorAll('input, button').forEach(function (el) { el.disabled = opts.disabled; });
    }
    disabled(opts.disabled);

    paint();
    if (window.dsIcons && window.dsIcons.apply) window.dsIcons.apply(root);

    return {
      get: function () { return value; },
      set: function (v) { setValue(v, false); },
      disabled: disabled,
      footer: setFooter,
      configure: function (next) {
        Object.keys(next || {}).forEach(function (k) { if (k !== 'value' && k !== 'footer' && k !== 'onReset') opts[k] = next[k]; });
        if (next && 'value' in next) setValue(next.value, false);
        if (next && ('footer' in next || 'onReset' in next)) setFooter(next.footer || null, next.onReset || null);
        if (next && 'disabled' in next) disabled(next.disabled);
      },
      destroy: function () { root.replaceChildren(); root.classList.remove('cpk'); }
    };
  }

  /* Пикер в Popover у триггера. Повторный bind того же триггера перенастраивает
     живой пикер; после destroy триггер свободен для нового bind. */
  function bind(trigger, opts) {
    opts = opts || {};
    if (trigger.__dsColorPicker) { trigger.__dsColorPicker.configure(opts); return trigger.__dsColorPicker; }

    var pop = document.createElement('div');
    pop.className = 'pop pop--w-m pop--floating cpk-pop';
    pop.id = 'cpk-pop-' + (++next);
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'false');
    pop.setAttribute('aria-label', opts.label || 'Редактирование цвета');
    pop.innerHTML = '<div class="pop__body"><div class="cpk"></div></div>';
    document.body.appendChild(pop);

    var picker = create(pop.querySelector('.cpk'), opts);
    var api = window.DSPopover.bind(trigger, Object.assign({ pop: pop }, opts.popover || {}));
    var result = {
      picker: picker,
      pop: pop,
      open: function () {
        if (!pop.isConnected) document.body.appendChild(pop);
        if (pop.classList.contains('is-open')) return api;   // уже открыт — повторный вызов ничего не меняет
        return api.open();
      },
      close: function () { return api.close(); },
      configure: function (next) { picker.configure(next); },
      destroy: function () {
        api.close();
        pop.remove();
        delete trigger.__dsColorPicker;
      }
    };
    trigger.__dsColorPicker = result;
    return result;
  }

  window.DSColorPicker = { create: create, bind: bind, hsv: hsv, hex: hex, parseHex: parseHex };
})();

/* ============================================================
   Themes.page.js — конструктор темы на странице «Темы» (MS0013, Р29).

   Образец — coolors.co/tailwind. Состояние живёт только в памяти этого
   документа: черновик темы, история правок, режим (светлая / тёмная).
   Сохранение — файлом в папку tokens (ThemeFiles.js); несохранённое
   пропадает при перезагрузке, перед уходом страница предупреждает.

   Зависимости: DS_THEMES, DS_RAMP, DS_THEME_ENGINE, DS_THEME_DATA
   (ThemeBoot), DSTheme (Themes.js), DSThemeFiles (ThemeFiles.js) и
   рантаймы ДС из ds.js: DSColorPicker, DSSlider, DSTabs, DSMenu,
   DSPopover, DSModal, DSDrawer, DSChart, DSDatePicker, DSCopy, DSSnack.

   Правка цвета:
   - ступень Brand / Neutral — по умолчанию сдвигает всю растяжку: ступень
     становится опорной (brandStep / neutralStep) и ровно выбранным цветом;
     у другого режима ступень 500 берёт новую 500 (Р27). Переключатель
     «Только эта ступень» в пикере оставляет точечную правку;
   - полосы Brand и Neutral в нижней панели — ступень 500 в обоих режимах;
   - роль — правка роли текущего режима; у смешанной роли (color-mix)
     меняется базовый цвет, доля сохраняется (Р6);
   - базовая растяжка — точечная правка выбранного профиля.
   ============================================================ */
(function () {
  'use strict';

  var T = window.DS_THEMES, R = window.DS_RAMP, E = window.DS_THEME_ENGINE;
  var F = window.DSThemeFiles, A = window.DSTheme;
  if (!T || !R || !E || !F || !A) return;

  var STEPS = R.STEPS;
  var TONES = [{ tone: 'accent', kind: 'brand', title: 'Brand' }, { tone: 'neutral', kind: 'neutral', title: 'Neutral' }];
  var METHODS = {
    auto: 'Авто', monochromatic: 'Монохромный', analogous: 'Аналоговый', complementary: 'Комплементарный',
    'split-complementary': 'Сплит-комплементарный', triadic: 'Триадный', tetradic: 'Тетрадный', square: 'Квадрат'
  };
  var STATUS_FG = /^--color-(danger|warning|success|info)-/;
  var LIGHT_TEXT = '#FFFFFF', DARK_TEXT = '#111112';   /* функциональный цвет подписи на плашке */

  function $(id) { return document.getElementById(id); }
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function isHex(v) { return /^#[\da-f]{6}$/i.test(v || ''); }
  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function icons(root) { if (window.dsIcons && window.dsIcons.apply) window.dsIcons.apply(root || document); }
  function textOn(hex) { return isHex(hex) && R.contrast(LIGHT_TEXT, hex) >= R.contrast(DARK_TEXT, hex) ? LIGHT_TEXT : DARK_TEXT; }
  function stepOf(key) { return key.slice(key.lastIndexOf('-') + 1); }
  function toneOf(key) { return key.slice(7, key.lastIndexOf('-')); }
  function notify(tone, title, text) {
    if (window.DSSnack) window.DSSnack.show({ tone: tone, title: title, text: text });
  }

  /* ---------------- состояние ---------------- */

  var data = window.DS_THEME_DATA;
  var original = null, draft = null, mode = 'light';
  var history = [], cursor = 0, dirty = false;
  var method = 'auto';
  var picker = null;          /* открытый ColorPicker: { binding, key } */
  var suppress = false;       /* собственный ds:themechange при предпросмотре */
  var pendingLoad = null;     /* тема, на которую переключаемся после подтверждения */
  var allTab = 'roles', baseMode = 'light';

  function fileByName(name) { return data.themes.filter(function (f) { return f.name === name; })[0] || null; }

  function prepare(file) {
    var copy = clone(file);
    ['light', 'dark'].forEach(function (m) {
      if (!copy[m]) return;
      copy[m].overrides = copy[m].overrides || {};
      copy[m].adjust = copy[m].adjust || { hue: 0, saturation: 0, temperature: 0 };
    });
    return copy;
  }
  function profile(m) { return draft[m || mode]; }
  function computeDirty() { return JSON.stringify(draft) !== JSON.stringify(prepare(original)); }

  function compileDraft(m) {
    var file = clone(draft);
    /* Правленая Legacy считается как обычная тема: её роли держат значения legacy. */
    if (file.name === 'ibp-legacy' && dirty) { file.name = 'theme-preview'; file.locked = false; }
    return E.compile(file, m || mode, data);
  }

  /* ---------------- история ---------------- */

  function snapshot() {
    var now = JSON.stringify(draft);
    if (now === JSON.stringify(history[cursor])) return;
    history = history.slice(0, cursor + 1);
    history.push(clone(draft));
    if (history.length > 100) history.shift();
    cursor = history.length - 1;
  }

  /* fn меняет draft. live — промежуточное значение (тянут маркер или ползунок):
     без шага истории; шаг ставит commit(). */
  function change(fn, live) {
    fn();
    if (!live) snapshot();
    dirty = computeDirty();
    render();
  }
  function commit() { snapshot(); dirty = computeDirty(); render(); }

  function undo(step) {
    var index = cursor + step;
    if (index < 0 || index >= history.length) return;
    cursor = index;
    draft = clone(history[cursor]);
    dirty = computeDirty();
    closePicker();
    render();
  }

  /* ---------------- правки ---------------- */

  /* Настройки (тон, насыщенность, температура) применяются поверх входа.
     Перед правкой ступени их «запекаем» во вход, иначе выбранный цвет
     снова сдвинулся бы настройками. */
  function bake(p) {
    var adj = p.adjust || {};
    if (!adj.hue && !adj.saturation && !adj.temperature) return;
    p.brand = R.adjustHex(p.brand, adj);
    p.neutral = R.adjustHex(p.neutral, adj);
    p.adjust = { hue: 0, saturation: 0, temperature: 0 };
  }

  /* Custom тёмная хранит прежнюю service ручными правками. Когда вход меняется,
     правки, совпадающие с service, снимаются — иначе вход ничего бы не менял. */
  function releaseService(p, m) {
    if (m !== 'dark' || draft.name !== 'custom') return;
    var fixed = Object.assign({}, T.values, T.themeValues.service);
    Object.keys(p.overrides).forEach(function (k) {
      if (/^--ramp-(accent|neutral)-/.test(k)) {
        var tone = toneOf(k);
        if (p.overrides[k] === R.tone(T.seeds.service.ramps[tone], 'dark')[stepOf(k)]) delete p.overrides[k];
      } else if (/--ramp-(accent|neutral)-/.test(fixed[k] || '') && p.overrides[k] === fixed[k]) {
        delete p.overrides[k];
      }
    });
  }

  function dropPointEdits(p, tone) {
    Object.keys(p.overrides).forEach(function (k) { if (k.indexOf('--ramp-' + tone + '-') === 0) delete p.overrides[k]; });
  }

  /* Р27: ступень step рампы tone становится опорной и ровно color. */
  function shiftRamp(tone, kind, step, color) {
    var p = profile();
    bake(p);
    p[kind] = color;
    p[kind + 'Step'] = step;
    dropPointEdits(p, tone);
    releaseService(p, mode);
    followRamp(p, mode, [tone]);
    var other = mode === 'dark' ? 'light' : 'dark';
    if (draft[other]) {
      var q = draft[other];
      bake(q);
      q[kind] = R.fromStep(color, step, tone, mode)['500'];
      q[kind + 'Step'] = '500';
      dropPointEdits(q, tone);
      releaseService(q, other);
      followRamp(q, other, [tone]);
    }
  }

  /* Полоса панели — ступень 500 в обоих режимах. */
  function setBase(tone, kind, color) {
    ['light', 'dark'].forEach(function (m) {
      var p = draft[m];
      if (!p) return;
      bake(p);
      p[kind] = color;
      p[kind + 'Step'] = '500';
      dropPointEdits(p, tone);
      releaseService(p, m);
      followRamp(p, m, [tone]);
    });
  }

  /* ---------------- роли за растяжкой ---------------- */

  /* Роль строится от растяжки tone, если её значение по умолчанию (профиль
     режима) ссылается на --ramp-<tone>- прямо или через другую роль. */
  function roleFollows(mode, role, tone, seen) {
    var expr = Object.assign({}, T.values, T.profiles[mode])[role];
    if (!expr || (seen = seen || {})[role]) return false;
    seen[role] = true;
    if (expr.indexOf('--ramp-' + tone + '-') >= 0) return true;
    return (expr.match(/--color-[\w-]+/g) || []).some(function (r) { return roleFollows(mode, r, tone, seen); });
  }

  /* Смена входа применяется к теме сразу, во всех темах одинаково
     (решение человека 08.10.2026): ручные значения ролей, которые строятся
     от растяжки тона, снимаются — в IBP Legacy роли записаны готовыми
     цветами, в тёмной Custom — значениями service, и без этого растяжка
     менялась бы, а тема нет. Роли статусов и графиков не трогаются. */
  function followRamp(p, m, tones) {
    tones.forEach(function (tone) {
      Object.keys(p.overrides || {}).forEach(function (k) {
        if (k.indexOf('--color-') === 0 && roleFollows(m, k, tone)) delete p.overrides[k];
      });
    });
  }

  /* ---------------- пикер ---------------- */

  /* Пикер живёт у своего триггера и переиспользуется: Popover держит триггер
     за собой, поэтому повторный bind того же триггера только перенастраивает
     пикер. Пикеры строк шторки уничтожаются при её перестройке. */
  var drawerBindings = [];
  function closePicker() {
    if (picker) { picker.binding.close(); picker = null; }
  }
  function dropDrawerPickers() {
    drawerBindings.forEach(function (b) { b.destroy(); });
    drawerBindings = [];
    if (picker && !picker.binding.pop.isConnected) picker = null;
  }

  function pointSwitch(checked, onChange) {
    var label = document.createElement('label');
    label.className = 'sw';
    label.innerHTML = '<input type="checkbox" class="sw__input" role="switch"' + (checked ? ' checked' : '') + '>' +
      '<span class="sw__control"><span class="sw__thumb"></span></span>' +
      '<span class="sw__content"><span class="sw__label">Только эта ступень</span></span>';
    label.querySelector('input').addEventListener('change', function (e) { onChange(e.target.checked); });
    return label;
  }

  function openPicker(trigger, key, value, handlers) {
    if (picker && picker.binding !== trigger.__dsColorPicker) closePicker();
    var fresh = !trigger.__dsColorPicker;
    var binding = window.DSColorPicker.bind(trigger, {
      value: value,
      label: handlers.label || 'Цвет',
      /* Граница — область страницы: у края меню ДС поповер сдвигается, а не уходит под меню. */
      popover: { placement: handlers.placement || 'bottom', align: handlers.align || 'start', boundary: document.querySelector('main.page') },
      onChange: function (v) { handlers.apply(v, true); },
      onCommit: function (v) { handlers.apply(v, false); },
      onReset: handlers.reset || null,
      footer: handlers.footer || null
    });
    if (fresh && trigger.closest('#all-colors')) drawerBindings.push(binding);
    picker = { binding: binding, key: key };
    /* После bind триггер сам переключает пикер по клику (ColorPicker 1.002);
       открываем вручную только в первый раз — bind случился в этом же клике.
       Иначе второй клик открывал и тут же закрывал пикер. */
    if (fresh) binding.open();
  }

  function editRampStep(trigger, tone, kind, step) {
    var key = '--ramp-' + tone + '-' + step;
    var point = !!profile().overrides[key];
    var value = compileDraft().ramps[tone][step];
    openPicker(trigger, key, value, {
      label: (kind === 'brand' ? 'Brand ' : 'Neutral ') + step,
      footer: pointSwitch(point, function (on) { point = on; }),
      reset: profile().overrides[key] ? function () { closePicker(); change(function () { delete profile().overrides[key]; }); } : null,
      apply: function (v, live) {
        change(function () {
          if (point) profile().overrides[key] = v;
          else shiftRamp(tone, kind, step, v);
        }, live);
      }
    });
  }

  function editPill(trigger, tone, kind) {
    var value = compileDraft().ramps[tone]['500'];
    openPicker(trigger, '--pill-' + kind, value, {
      label: (kind === 'brand' ? 'Brand' : 'Neutral') + ' 500',
      placement: 'top',
      align: 'center',
      apply: function (v, live) { change(function () { setBase(tone, kind, v); }, live); }
    });
  }

  /* Смешанная роль color-mix(in srgb, <база> N%, <фон>): правится база, доля остаётся. */
  var MIX = /^color-mix\(in srgb,\s*(.+?)\s+(\d+(?:\.\d+)?)%,\s*(.+)\)$/;

  function baseOfMix(expr, m) {
    var match = MIX.exec(expr || '');
    if (!match) return null;
    var base = match[1], hex = null, ref = /^var\((--[\w-]+)\)$/.exec(base);
    if (isHex(base)) hex = base;
    else if (ref && ref[1].indexOf('--ramp-') === 0) hex = m.ramps[toneOf(ref[1])][stepOf(ref[1])];
    else if (ref && isHex(m.colors[ref[1]])) hex = m.colors[ref[1]];
    return hex ? { hex: hex, share: match[2], rest: match[3] } : null;
  }

  /* Непрозрачный цвет любого CSS-значения — через вычисленный стиль. */
  function opaqueHex(value) {
    if (isHex(value)) return value.toUpperCase();
    var probe = document.createElement('span');
    probe.style.color = value;
    document.body.appendChild(probe);
    var rgb = (getComputedStyle(probe).color.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3);
    probe.remove();
    return '#' + rgb.map(function (n) { return Math.round(Number(n)).toString(16).padStart(2, '0'); }).join('').toUpperCase();
  }

  function editRole(trigger, key) {
    var m = compileDraft();
    var expr = m.roles[key], mix = baseOfMix(expr, m);
    var value = mix ? mix.hex : opaqueHex(m.colors[key]);
    openPicker(trigger, key, value, {
      label: key,
      reset: profile().overrides[key] ? function () { closePicker(); change(function () { delete profile().overrides[key]; }); } : null,
      apply: function (v, live) {
        change(function () {
          profile().overrides[key] = mix ? 'color-mix(in srgb, ' + v + ' ' + mix.share + '%, ' + mix.rest + ')' : v;
        }, live);
      }
    });
  }

  function editBase(trigger, tone, step) {
    if (!draft[baseMode]) { notify('info', 'Только светлая', 'У IBP Legacy нет тёмного профиля. Сохраните тему под новым именем.'); return; }
    var key = '--ramp-' + tone + '-' + step;
    var value = compileDraft(baseMode).ramps[tone][step];
    openPicker(trigger, key, value, {
      label: tone + ' ' + step,
      reset: draft[baseMode].overrides[key] ? function () { closePicker(); change(function () { delete draft[baseMode].overrides[key]; }); } : null,
      apply: function (v, live) { change(function () { draft[baseMode].overrides[key] = v; }, live); }
    });
  }

  /* ---------------- палитра ---------------- */

  function swatchHTML(attrs, step) {
    return '<button type="button" class="theme-swatch" ' + attrs + '>' +
      '<span class="theme-swatch__mark" aria-hidden="true"><span class="theme-swatch__dot"></span><i data-icon="brush-01" hidden></i></span>' +
      '<span class="theme-swatch__step">' + step + '</span><span class="theme-swatch__hex"></span></button>';
  }

  function buildRamps() {
    $('theme-ramps').innerHTML = TONES.map(function (t) {
      return '<div class="theme-ramp" data-tone="' + t.tone + '">' +
        '<div class="theme-ramp__name"><span class="theme-ramp__title">' + t.title + '</span><span class="theme-ramp__sub" data-sub></span></div>' +
        STEPS.map(function (s) { return swatchHTML('data-tone="' + t.tone + '" data-kind="' + t.kind + '" data-step="' + s + '"', s); }).join('') +
        '</div>';
    }).join('');
    icons($('theme-ramps'));
  }

  function paintSwatch(el, color, opts) {
    el.style.setProperty('--sw', color);
    el.style.setProperty('--sw-fg', textOn(color));
    el.classList.toggle('theme-swatch--edge', isHex(color) && R.contrast(color, '#FFFFFF') < 1.15);
    var hex = el.querySelector('.theme-swatch__hex');
    if (hex) hex.textContent = String(color).replace('#', '');
    var dot = el.querySelector('.theme-swatch__dot'), brush = el.querySelector('[data-icon="brush-01"]');
    if (dot) dot.hidden = !opts.anchor || opts.manual;
    if (brush) brush.hidden = !opts.manual;
    if (opts.label) {
      el.setAttribute('aria-label', opts.label + ', ' + color + (opts.anchor ? ', опорная' : '') + (opts.manual ? ', ручная правка' : '') + '. Изменить');
      el.setAttribute('data-tooltip', opts.label + ' · ' + color + ' · с белым ' + R.contrast(LIGHT_TEXT, color).toFixed(2) + ' : 1 · с тёмным ' + R.contrast(DARK_TEXT, color).toFixed(2) + ' : 1');
    }
  }

  function renderRamps(m) {
    var p = profile();
    TONES.forEach(function (t) {
      var row = document.querySelector('.theme-ramp[data-tone="' + t.tone + '"]');
      var anchor = String(p[t.kind + 'Step'] || '500');
      row.querySelector('[data-sub]').textContent = 'Опорная ' + anchor + ' · ' + m.ramps[t.tone][anchor];
      row.querySelectorAll('.theme-swatch').forEach(function (el) {
        var s = el.getAttribute('data-step');
        paintSwatch(el, m.ramps[t.tone][s], {
          anchor: s === anchor, manual: !!p.overrides['--ramp-' + t.tone + '-' + s], label: t.title + ' ' + s
        });
      });
    });
  }

  /* ---------------- шапка ---------------- */

  function renderBar() {
    $('theme-pick-label').textContent = draft.label;
    var status = $('theme-status');
    status.className = 'badge badge--s ' + (dirty ? 'badge--warning' : draft.locked ? 'badge--neutral' : 'badge--success');
    status.textContent = dirty ? 'Не сохранено' : draft.locked ? 'Базовая · только чтение' : 'Сохранено';
    var save = $('theme-save');
    save.disabled = !!draft.locked || !dirty;
    save.setAttribute('data-tooltip', draft.locked ? 'Базовую тему нельзя перезаписать — «Сохранить как…»' : dirty ? 'Записать в ' + draft.name + '.json' : 'Изменений нет');
    $('theme-mode').checked = mode === 'dark';
    $('theme-mode').disabled = !draft.dark;
    $('theme-mode-box').setAttribute('data-tooltip', draft.dark ? '' : 'У IBP Legacy только светлая');
    $('theme-preview-name').textContent = draft.label + ' · ' + (mode === 'dark' ? 'тёмная' : 'светлая') + (dirty ? ' · черновик' : '');
    $('theme-undo').disabled = cursor === 0;
    $('theme-redo').disabled = cursor >= history.length - 1;
  }

  /* Меню тем: все файлы папки (или зеркала), у одинаковых названий — имя файла;
     файлы, которые не читаются, — неактивными пунктами; внизу — обновить список
     из папки или подключить её (08.10.2026). */
  function buildThemeMenu() {
    var files = A.files(), count = {};
    files.forEach(function (f) { count[f.label] = (count[f.label] || 0) + 1; });
    var html = files.map(function (f) {
      var hint = count[f.label] > 1 ? f.name + '.json' : f.modes.length < 2 ? 'только светлая' : '';
      return '<button type="button" class="menu__item" role="menuitemradio" data-theme-file="' + esc(f.name) + '" aria-checked="' + (f.name === draft.name) + '">' +
        '<span class="menu__item-icon"><i data-icon="' + (f.locked ? 'lock' : 'palette') + '"></i></span>' +
        '<span class="menu__item-label">' + esc(f.label) + '</span>' +
        (hint ? '<span class="menu__item-hint">' + esc(hint) + '</span>' : '') +
        '</button>';
    }).join('');
    var problems = F.problems();
    if (problems.length) {
      html += '<hr class="menu__divider">' + problems.map(function (p) {
        return '<span class="menu__item" role="menuitem" aria-disabled="true">' +
          '<span class="menu__item-icon"><i data-icon="alert-triangle"></i></span>' +
          '<span class="menu__item-label">' + esc(p.file) + '</span><span class="menu__item-hint">не читается</span></span>';
      }).join('');
    }
    var folder = F.connected() || F.pending()
      ? ['refresh', 'refresh', 'Обновить список из папки']
      : ['connect', 'folder', 'Подключить папку tokens…'];
    html += '<hr class="menu__divider"><button type="button" class="menu__item" role="menuitem" data-folder-action="' + folder[0] + '">' +
      '<span class="menu__item-icon"><i data-icon="' + folder[1] + '"></i></span><span class="menu__item-label">' + folder[2] + '</span></button>';
    $('theme-menu').innerHTML = html;
    icons($('theme-menu'));
  }

  /* ---------------- нижняя панель ---------------- */

  function renderDock(m) {
    TONES.forEach(function (t) {
      var pill = $('pill-' + t.kind), color = m.ramps[t.tone]['500'];
      pill.style.setProperty('--sw', color);
      pill.style.setProperty('--sw-fg', textOn(color));
      $('pill-' + t.kind + '-hex').textContent = color;
      pill.setAttribute('aria-label', t.title + ' 500, ' + color + '. Изменить');
    });
    var adj = profile().adjust || {};
    [['hue', 'adjust-hue'], ['saturation', 'adjust-saturation'], ['temperature', 'adjust-temperature']].forEach(function (pair) {
      var input = $(pair[1]);
      if (document.activeElement !== input) input.value = adj[pair[0]] || 0;
      window.DSSlider.bind(input.closest('.slr')).sync();
    });
    $('theme-onfill').checked = profile().onFill === 'dark';
  }

  function buildMethodMenu() {
    $('method-menu').innerHTML = Object.keys(METHODS).map(function (k) {
      return '<button type="button" class="menu__item" role="menuitemradio" data-method="' + k + '" aria-checked="' + (k === method) + '">' +
        '<span class="menu__item-label">' + METHODS[k] + '</span>' + (k === method ? '<span class="menu__item-check"><i data-icon="check"></i></span>' : '') + '</button>';
    }).join('');
    icons($('method-menu'));
  }

  function generate() {
    var seeds = R.generate(method);
    closePicker();
    change(function () {
      ['light', 'dark'].forEach(function (m) {
        var p = draft[m];
        if (!p) return;
        p.brand = seeds.brand; p.neutral = seeds.neutral;
        p.brandStep = '500'; p.neutralStep = '500';
        p.adjust = { hue: 0, saturation: 0, temperature: 0 };
        dropPointEdits(p, 'accent');
        dropPointEdits(p, 'neutral');
        releaseService(p, m);
        followRamp(p, m, ['accent', 'neutral']);
      });
    });
  }

  /* ---------------- все цвета ---------------- */

  function tokenRow(key, title, desc, attr) {
    return '<div class="theme-token" data-row="' + esc(key) + '" data-search="' + esc((key + ' ' + title + ' ' + desc).toLowerCase()) + '">' +
      '<button type="button" class="theme-token__chip" ' + attr + '="' + esc(key) + '"></button>' +
      '<div class="theme-token__main"><span class="theme-token__name">' + esc(title) + '</span><span class="theme-token__desc">' + esc(desc) + '</span></div>' +
      '<div class="theme-token__acts">' +
        '<span class="theme-token__manual" hidden data-tooltip="Ручная правка"><i data-icon="brush-01"></i></span>' +
        '<button type="button" class="btn btn--transparent btn--xs" data-reset-role="' + esc(key) + '" hidden><span class="btn__label">Сбросить</span></button>' +
        '<button type="button" class="ibtn ibtn--neutral ibtn--s" data-copy-role="' + esc(key) + '" aria-label="Копировать значение" data-tooltip="Копировать"><i data-icon="copy"></i></button>' +
      '</div></div>';
  }

  function buildAll() {
    dropDrawerPickers();
    var groups = {};
    Object.keys(T.roles).forEach(function (k) {
      var g = T.roles[k].group || 'Прочее';
      (groups[g] || (groups[g] = [])).push(k);
    });
    $('all-roles').innerHTML = Object.keys(groups).map(function (g) {
      return '<div class="theme-group"><p class="theme-group__title">' + esc(g) + ' · ' + groups[g].length + '</p>' +
        groups[g].map(function (k) { return tokenRow(k, k, T.roles[k].desc || '', 'data-edit-role'); }).join('') + '</div>';
    }).join('');
    $('all-map').innerHTML = '<div class="theme-group">' + Object.keys(T.map).map(function (name) {
      return tokenRow(T.map[name], name, '→ ' + T.map[name], 'data-edit-role').replace('data-row="' + esc(T.map[name]) + '"', 'data-row="' + esc(T.map[name]) + '" data-old="' + esc(name) + '"');
    }).join('') + '</div>';
    $('all-base').innerHTML =
      '<div class="segctrl" role="radiogroup" aria-label="Профиль базы" id="base-mode">' +
        '<div class="segctrl__thumb"></div>' +
        '<button type="button" class="segctrl__item" role="radio" aria-checked="' + (baseMode === 'light') + '" tabindex="0" data-value="light"><span class="segctrl__label">Светлая</span></button>' +
        '<button type="button" class="segctrl__item" role="radio" aria-checked="' + (baseMode === 'dark') + '" tabindex="-1" data-value="dark"><span class="segctrl__label">Тёмная</span></button>' +
      '</div>' +
      Object.keys(data.bases.light.ramps).map(function (tone) {
        return '<div class="theme-mini"><span class="theme-mini__name">' + esc(tone) + '</span>' +
          STEPS.map(function (s) { return swatchHTML('data-base-tone="' + tone + '" data-step="' + s + '"', s); }).join('') + '</div>';
      }).join('');
    window.DSTabs.segment($('base-mode'), {
      onChange: function (i, el) { baseMode = el.getAttribute('data-value'); updateAll(compileDraft()); }
    });
    icons($('all-roles')); icons($('all-map')); icons($('all-base'));
    filterAll();
  }

  function contrastHTML(m) {
    return '<div class="theme-group">' + m.contrast.map(function (p) {
      var ok = p.ratio === null || p.ratio >= p.min;
      var fixed = STATUS_FG.test(p.fg) || (p.fg === '--color-fg-on-fill' && p.bg !== '--color-accent-fill' && p.bg.indexOf('--color-accent-fill') !== 0);
      var tone = ok ? 'success' : p.required === false || fixed ? 'neutral' : 'error';
      var label = p.ratio === null ? 'Проверить глазами' : ok ? 'AA' : fixed ? 'Фиксированный цвет' : p.required === false ? 'Ниже AA · информационная' : 'Ниже AA';
      return '<div class="theme-token"><span class="theme-token__chip" style="--sw:' + esc(m.colors[p.bg] || '') + '"></span>' +
        '<div class="theme-token__main"><span class="theme-token__name">' + esc(p.fg) + ' / ' + esc(p.bg) + '</span>' +
        '<span class="theme-token__desc">' + (p.ratio === null ? 'составной цвет' : p.ratio.toFixed(2) + ' : 1') + ' · минимум ' + p.min + ' : 1' + (p.note ? ' · ' + esc(p.note) : '') + '</span></div>' +
        '<div class="theme-token__acts"><span class="badge badge--s badge--' + tone + '">' + label + '</span></div></div>';
    }).join('') + '</div>';
  }

  function updateAll(m) {
    if (!$('all-colors') || $('all-colors').hidden) return;
    $('all-path').textContent = draft.label + ' · ' + (mode === 'dark' ? 'тёмная' : 'светлая');
    var p = profile();
    document.querySelectorAll('#all-roles [data-row], #all-map [data-row]').forEach(function (row) {
      var key = row.getAttribute('data-row'), color = m.colors[key];
      row.querySelector('.theme-token__chip').style.setProperty('--sw', color || 'transparent');
      var manual = !!p.overrides[key];
      row.querySelector('.theme-token__manual').hidden = !manual;
      row.querySelector('[data-reset-role]').hidden = !manual;
      var desc = row.querySelector('.theme-token__desc');
      if (row.hasAttribute('data-old')) desc.textContent = '→ ' + key + ' · ' + (isHex(color) ? color : 'составной');
    });
    var base = draft[baseMode] ? compileDraft(baseMode) : null;
    document.querySelectorAll('#all-base [data-base-tone]').forEach(function (el) {
      var tone = el.getAttribute('data-base-tone'), s = el.getAttribute('data-step');
      var color = base ? base.ramps[tone][s] : data.bases[baseMode].ramps[tone][s];
      paintSwatch(el, color, { manual: !!(draft[baseMode] && draft[baseMode].overrides['--ramp-' + tone + '-' + s]), label: tone + ' ' + s });
    });
    $('all-contrast').innerHTML = contrastHTML(m);
  }

  function filterAll() {
    var q = ($('all-search').value || '').trim().toLowerCase();
    document.querySelectorAll('#all-roles [data-search], #all-map [data-search]').forEach(function (row) {
      row.hidden = !!q && row.getAttribute('data-search').indexOf(q) < 0;
    });
  }

  function showAllTab(name) {
    allTab = name;
    ['roles', 'map', 'base', 'contrast'].forEach(function (k) { $('all-' + k).hidden = k !== name; });
  }

  /* ---------------- экспорт ---------------- */

  function oklch(hex) {
    var v = R.hexToOklch(hex);
    return 'oklch(' + (v.l * 100).toFixed(2) + '% ' + v.c.toFixed(4) + ' ' + v.h.toFixed(2) + ')';
  }

  function exportText(m) {
    var kind = document.querySelector('#export-kind [aria-checked="true"]').getAttribute('data-value');
    var format = document.querySelector('#export-format [aria-checked="true"]').getAttribute('data-value');
    var text;
    if (kind === 'json') text = JSON.stringify(draft, null, 2);
    else {
      text = E.css(m);
      if (!text) text = '/* IBP Legacy — без data-theme: значения текущей ДС. */\n:root {\n' +
        Object.keys(m.old).map(function (k) { return '  ' + k + ': ' + m.old[k] + ';'; }).join('\n') + '\n}';
    }
    return format === 'oklch' ? text.replace(/#[\da-f]{6}\b/gi, oklch) : text;
  }

  function renderExport(m) {
    if ($('export-modal').hidden) return;
    $('export-code').textContent = exportText(m);
  }

  /* ---------------- общий рендер ---------------- */

  function applyTheme() {
    suppress = true;
    if (dirty) {
      var view = clone(draft);
      if (view.name === 'ibp-legacy') { view.name = 'theme-preview'; view.locked = false; }
      A.preview(view, mode);
    } else {
      A.set(draft.name, mode);
    }
    suppress = false;
  }

  function render() {
    var m = compileDraft();
    applyTheme();
    renderBar();
    renderRamps(m);
    renderDock(m);
    updateAll(m);
    renderExport(m);
  }

  function load(name, m) {
    closePicker();
    original = fileByName(name) || data.themes[0];
    draft = prepare(original);
    mode = m === 'dark' && draft.dark ? 'dark' : 'light';
    history = [clone(draft)];
    cursor = 0;
    dirty = false;
    buildThemeMenu();
    if (!$('all-colors').hidden) buildAll();
    render();
  }

  function requestLoad(name, m) {
    if (!dirty) { load(name, m); return; }
    pendingLoad = { name: name, mode: m };
    window.DSModal.open($('discard-modal'));
  }

  /* ---------------- сохранение ---------------- */

  function needFolder() {
    window.DSModal.open($('folder-modal'));
  }

  async function save(file, create) {
    try {
      data = await F.save(file, { create: create, original: create ? null : original });
      original = clone(file);
      draft = prepare(file);
      dirty = false;
      history = [clone(draft)];
      cursor = 0;
      buildThemeMenu();
      render();
      notify('success', 'Тема сохранена', file.name + '.json и зеркало tokens.data.js записаны');
      return true;
    } catch (e) {
      notify('error', 'Тема не сохранена', e.message);
      return false;
    }
  }

  function showSaveError(text) {
    $('save-error-text').textContent = text;
    $('save-error').hidden = !text;
  }

  /* ---------------- папка tokens: список тем ---------------- */

  /* Список из папки: зеркало tokens.data.js переписывается, если разошлось с
     ней, — новая тема видна и на других страницах ДС. Открытая тема без правок
     перечитывается, если её файл поменяли или убрали снаружи. */
  async function applyFolder(next, title) {
    var mirrored = await F.syncMirror(next);
    data = next;
    A.reload(next);
    $('act-connect-label').textContent = 'Папка tokens подключена';
    var current = fileByName(draft.name);
    if (!dirty && !current) load(data.themes[0].name, mode);
    else if (!dirty && JSON.stringify(current) !== JSON.stringify(original)) load(draft.name, mode);
    else buildThemeMenu();
    var problems = F.problems();
    if (problems.length) {
      notify('warning', 'Не все файлы папки прочитаны', problems.map(function (p) { return p.file + ' — ' + p.reason; }).join('; '));
    } else if (title || mirrored) {
      notify('success', title || 'Список тем обновлён', mirrored ? 'Зеркало tokens.data.js обновлено — темы видны на всех страницах ДС' : 'Список совпадает с папкой');
    }
  }

  async function syncFolder(byUser) {
    try {
      await applyFolder(byUser ? await F.refresh() : await F.read(), byUser ? 'Список тем обновлён' : '');
    } catch (e) {
      if (e.name !== 'AbortError') notify('error', 'Папка tokens не прочитана', e.message);
    }
  }

  /* ---------------- примеры ---------------- */

  function buildButtons() {
    var states = [['Обычная', ''], ['Наведение', 'is-hover'], ['Нажатие', 'is-active'], ['Включена', 'pressed'], ['Недоступна', 'disabled'], ['Загрузка', 'loading']];
    var html = '<span></span>' + states.map(function (s) { return '<span class="theme-ex-buttons__head">' + s[0] + '</span>'; }).join('');
    [['accent', 'Accent'], ['outline', 'Outline'], ['transparent', 'Transparent']].forEach(function (type) {
      html += '<span class="theme-ex-buttons__type">' + type[1] + '</span>';
      states.forEach(function (s) {
        var cls = 'btn btn--' + type[0] + ' btn--s' + (s[1] === 'is-hover' || s[1] === 'is-active' ? ' ' + s[1] : '') + (s[1] === 'loading' ? ' btn--loading' : '');
        var attrs = (s[1] === 'disabled' ? ' disabled' : '') + (s[1] === 'pressed' ? ' aria-pressed="true"' : '') + (s[1] === 'loading' ? ' aria-busy="true"' : '');
        html += '<button type="button" class="' + cls + '"' + attrs + '>' + (s[1] === 'loading' ? '<span class="spin spin--current" aria-hidden="true"></span>' : '') +
          '<span class="btn__label">Далее</span></button>';
      });
    });
    $('ex-buttons-grid').innerHTML = html;
  }

  function buildChart() {
    if (!window.DSChart || !$('ex-chart')) return;
    $('ex-chart').appendChild(window.DSChart.make({
      type: 'grouped', size: 'm',
      categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
      series: [
        { id: 'out', name: 'Выдачи', data: [42, 38, 51, 47, 62, 59] },
        { id: 'back', name: 'Погашения', data: [21, 26, 24, 30, 28, 34] },
        { id: 'res', name: 'Резервы', data: [6, 7, 7, 8, 9, 9] }
      ],
      ariaLabel: 'Выдачи, погашения и резервы по месяцам'
    }));
  }

  function buildCalendar() {
    if (!window.DSDatePicker || !$('ex-calendar')) return;
    $('ex-calendar').appendChild(window.DSDatePicker.makeCalendar({
      inline: true, mode: 'range', today: new Date(2026, 9, 7),
      rangeStart: new Date(2026, 9, 6), rangeEnd: new Date(2026, 9, 17), year: 2026, month: 9
    }));
  }

  function wireProducts() {
    var list = $('ex-product-list');
    if (!list) return;
    list.addEventListener('click', function (e) {
      var card = e.target.closest('.tile--card');
      if (!card) return;
      list.querySelectorAll('.tile--card').forEach(function (c) {
        var on = c === card;
        c.setAttribute('aria-checked', String(on));
        c.tabIndex = on ? 0 : -1;
      });
    });
  }

  /* ---------------- события ---------------- */

  function isTyping(target) {
    return !!(target && target.closest && target.closest('input, textarea, select, [contenteditable]'));
  }
  function isInteractive(target) {
    return !!(target && target.closest && target.closest('button, a, summary, [role], [tabindex], .pop, .menu, .modal-scrim'));
  }

  function wire() {
    /* Вкладки страницы. */
    window.DSTabs.tabs($('theme-tabs'), {
      onChange: function (i, el) {
        var docs = el.id === 'tab-docs';
        $('pane-builder').hidden = docs;
        $('pane-docs').hidden = !docs;
        $('theme-dock').hidden = docs;
        closePicker();
      }
    });

    /* Тема: меню, режим, сохранение. */
    $('theme-menu').addEventListener('click', function (e) {
      var item = e.target.closest('[data-theme-file]');
      if (item) { requestLoad(item.getAttribute('data-theme-file'), mode); return; }
      var action = e.target.closest('[data-folder-action]');
      if (action) { if (action.getAttribute('data-folder-action') === 'connect') connect(); else syncFolder(true); }
    });
    $('discard-confirm').addEventListener('click', function () {
      window.DSModal.closeTop();
      if (pendingLoad) { var p = pendingLoad; pendingLoad = null; load(p.name, p.mode); }
    });
    $('theme-mode').addEventListener('change', function () {
      closePicker();
      mode = this.checked && draft.dark ? 'dark' : 'light';
      render();
    });
    $('theme-save').addEventListener('click', function () {
      if (!F.connected()) { needFolder(); return; }
      save(draft, false);
    });
    /* «Сохранить как…» спрашивает имя всегда: без папки файл скачивается
       под введённым именем, и name внутри совпадает с именем файла. */
    $('theme-save-as').addEventListener('click', function () {
      var toFolder = F.connected();
      $('save-note').hidden = toFolder;
      $('save-confirm-label').textContent = toFolder ? 'Сохранить тему' : 'Скачать JSON';
      $('save-name').value = '';
      $('save-label').value = draft.label + ' — копия';
      showSaveError('');
      window.DSModal.open($('save-modal'));
    });
    $('save-name').addEventListener('input', function () { showSaveError(''); });
    $('save-confirm').addEventListener('click', async function () {
      var file = clone(draft);
      file.name = $('save-name').value.trim();
      file.label = $('save-label').value.trim();
      file.locked = false;
      if (!file.dark) file.dark = { brand: file.light.brand, neutral: file.light.neutral, adjust: clone(file.light.adjust), overrides: {}, onFill: 'white' };
      var errors = E.validate(file);
      if (!errors.length && !F.connected() && fileByName(file.name)) errors.push('Тема с этим именем уже есть. Выберите другое имя');
      if (errors.length) { showSaveError(errors.join('; ')); return; }
      if (!F.connected()) {
        F.download(file);
        window.DSModal.closeTop();
        notify('info', 'Скачан ' + file.name + '.json', 'Положите файл в папку tokens и выберите «Обновить список из папки» в меню темы');
        return;
      }
      if (await save(file, true)) window.DSModal.closeTop();
    });

    async function connect() {
      try {
        await applyFolder(await F.connect(), 'Папка tokens подключена');
        return true;
      } catch (e) {
        if (e.name !== 'AbortError') notify('error', 'Папка не подключена', e.message);
        return false;
      }
    }
    $('act-connect').addEventListener('click', connect);
    $('folder-connect').addEventListener('click', async function () { if (await connect()) window.DSModal.closeTop(); });
    $('act-download').addEventListener('click', function () { F.download(draft); });
    $('folder-download').addEventListener('click', function () { F.download(draft); window.DSModal.closeTop(); });
    $('act-reset').addEventListener('click', function () {
      change(function () { profile().overrides = {}; profile().adjust = { hue: 0, saturation: 0, temperature: 0 }; });
    });

    /* Палитра. */
    $('theme-ramps').addEventListener('click', function (e) {
      var sw = e.target.closest('.theme-swatch');
      if (sw) editRampStep(sw, sw.getAttribute('data-tone'), sw.getAttribute('data-kind'), sw.getAttribute('data-step'));
    });

    /* Нижняя панель. */
    TONES.forEach(function (t) {
      $('pill-' + t.kind).addEventListener('click', function () { editPill(this, t.tone, t.kind); });
    });
    [['adjust-hue', 'hue'], ['adjust-saturation', 'saturation'], ['adjust-temperature', 'temperature']].forEach(function (pair) {
      var input = $(pair[0]);
      function apply(live) {
        var value = Number(input.value);
        change(function () {
          ['light', 'dark'].forEach(function (m) {
            var p = draft[m];
            if (!p) return;
            p.adjust = Object.assign({ hue: 0, saturation: 0, temperature: 0 }, p.adjust);
            p.adjust[pair[1]] = value;
            releaseService(p, m);
            followRamp(p, m, ['accent', 'neutral']);
          });
        }, live);
      }
      input.addEventListener('input', function () { apply(true); });
      input.addEventListener('change', function () { apply(false); });
    });
    $('adjust-reset').addEventListener('click', function () {
      change(function () { ['light', 'dark'].forEach(function (m) { if (draft[m]) draft[m].adjust = { hue: 0, saturation: 0, temperature: 0 }; }); });
    });
    $('theme-onfill').addEventListener('change', function () {
      var dark = this.checked;
      change(function () {
        profile().onFill = dark ? 'dark' : 'white';
        delete profile().overrides['--color-fg-on-fill'];
      });
    });
    $('theme-undo').addEventListener('click', function () { undo(-1); });
    $('theme-redo').addEventListener('click', function () { undo(1); });
    $('theme-generate').addEventListener('click', generate);
    buildMethodMenu();
    window.DSMenu.bind($('theme-method-btn'), { menu: $('method-menu'), placement: 'top', align: 'end' });
    $('method-menu').addEventListener('click', function (e) {
      var item = e.target.closest('[data-method]');
      if (!item) return;
      method = item.getAttribute('data-method');
      $('theme-generate').setAttribute('data-tooltip', 'Пробел · ' + METHODS[method]);
      buildMethodMenu();
      generate();
    });

    /* Все цвета. */
    $('theme-all').addEventListener('click', function () {
      setTimeout(function () { buildAll(); updateAll(compileDraft()); }, 0);
    });
    window.DSTabs.tabs($('all-tabs'), { onChange: function (i, el) { showAllTab(el.getAttribute('data-all')); } });
    $('all-search').addEventListener('input', filterAll);
    $('all-colors').addEventListener('click', function (e) {
      var role = e.target.closest('[data-edit-role]');
      if (role) { editRole(role, role.getAttribute('data-edit-role')); return; }
      var reset = e.target.closest('[data-reset-role]');
      if (reset) { var k = reset.getAttribute('data-reset-role'); change(function () { delete profile().overrides[k]; }); return; }
      var copy = e.target.closest('[data-copy-role]');
      if (copy) {
        var m = compileDraft(), key = copy.getAttribute('data-copy-role');
        var value = isHex(m.colors[key]) ? m.colors[key] : m.roles[key];
        window.DSCopy.write(value).then(function () { window.DSCopy.flash(copy, 'Скопировано'); });
        return;
      }
      var base = e.target.closest('[data-base-tone]');
      if (base) editBase(base, base.getAttribute('data-base-tone'), base.getAttribute('data-step'));
    });

    /* Экспорт. */
    $('theme-export').addEventListener('click', function () { setTimeout(function () { renderExport(compileDraft()); }, 0); });
    ['export-kind', 'export-format'].forEach(function (id) {
      window.DSTabs.segment($(id), { onChange: function () { renderExport(compileDraft()); } });
    });
    $('export-copy').addEventListener('click', function () {
      var btn = this;
      window.DSCopy.write($('export-code').textContent).then(function () { window.DSCopy.flash(btn, 'Скопировано'); });
    });
    $('export-download').addEventListener('click', function () { F.download(draft); });

    /* Клавиши: пробел — генерация, ⌘Z / ⇧⌘Z — история. Только при нейтральном
       фокусе: пробел на кнопке нажимает кнопку (Р5). */
    document.addEventListener('keydown', function (e) {
      if (!$('pane-builder') || $('pane-builder').hidden || isTyping(e.target)) return;
      if (window.DSModal && window.DSModal.current && window.DSModal.current()) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(e.shiftKey ? 1 : -1); return; }
      if (e.code === 'Space' && !e.metaKey && !e.ctrlKey && !e.altKey && !isInteractive(e.target)) { e.preventDefault(); generate(); }
    });

    window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
    document.addEventListener('ds:themechange', function () {
      if (suppress || dirty) return;
      var s = A.selection();
      if ((s.name !== draft.name || s.mode !== mode) && fileByName(s.name)) load(s.name, s.mode);
    });
    document.addEventListener('ds:themelistchange', function () { data = window.DS_THEME_DATA; buildThemeMenu(); });
  }

  /* ---------------- старт ---------------- */

  function start() {
    buildRamps();
    buildButtons();
    buildChart();
    buildCalendar();
    wireProducts();
    wire();
    var s = A.selection();
    load(fileByName(s.name) ? s.name : data.themes[0].name, s.mode);
    icons(document);
    /* Папка, подключённая раньше: при живом разрешении список читается сразу;
       иначе меню предложит «Обновить список из папки» (нужен клик). */
    F.restore().then(function (handle) { if (handle) syncFolder(false); else buildThemeMenu(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

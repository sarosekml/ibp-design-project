/* ============================================================
   ThemeEngine.js — компилятор файлов тем (MS0013).

   Один модуль для браузера (ThemeBoot, конструктор «Темы») и Node
   (tools/theme-build.mjs через vm). Читает window.DS_RAMP (алгоритм рамп)
   и window.DS_THEMES (роли, профили, карта старых имён, пары контраста).

   Файл темы: { name, label, locked, light, dark? }. Профиль режима:
     brand, neutral      — цвет опорной ступени (#RRGGBB);
     brandStep,
     neutralStep         — опорная ступень, по умолчанию '500' (Р27);
     adjust              — { hue, saturation, temperature };
     overrides           — ручные правки ступеней (--ramp-*) и ролей (--color-*);
     onFill              — 'white' | 'dark': текст на заливке brand.

   API window.DS_THEME_ENGINE:
     validate(file)            — список ошибок (пустой — файл годен);
     compile(file, mode, data) — модель режима: ramps, roles, colors, old, contrast;
     css(model)                — блок CSS темы для [data-theme="<имя>-<режим>"];
     sources(data)             — данные в форме DS_THEMES для theme-build;
     resolve(expr, vars)       — разворачивает цепочку var(--…);
     mirror(data)              — текст зеркала tokens.data.js.

   Основная кнопка — ровно brand 500 (решение человека 07.10.2026, Р2):
   заливка, наведение и нажатие — ступени 500 → 600 → 700 той же рампы.
   Заливку ради контраста белого текста не затемняем: текст на заливке
   переключается («белый / тёмный»), провал виден в таблице контраста.
   ============================================================ */
window.DS_THEME_ENGINE = (function () {
  'use strict';

  var R = window.DS_RAMP, T = window.DS_THEMES;
  var PROFILES = ['light', 'dark'];
  var STATUS_FG = /^--color-(danger|warning|success|info)-/;

  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function validHex(x) { return typeof x === 'string' && /^#[0-9a-f]{6}$/i.test(x); }
  function has(obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); }

  function isRampKey(key) {
    return T.ramps.tones.some(function (tone) {
      return T.ramps.steps.some(function (step) { return key === '--ramp-' + tone + '-' + step; });
    });
  }

  /* Значение правки: hex, color-mix, rgb(a) или var(--…). Без ; { } < > —
     значение уходит в CSS как есть, поэтому инъекция здесь отсекается. */
  function validOverride(value) {
    if (typeof value !== 'string' || /[;{}<>\n\r]/.test(value)) return false;
    return validHex(value) ||
      /^color-mix\([^;{}]+\)$/.test(value) ||
      /^rgba?\([\d\s.,%/]+\)$/.test(value) ||
      /^var\(--[\w-]+\)$/.test(value);
  }

  function validate(file) {
    var errors = [];
    if (!file || !/^[a-z][a-z0-9-]{0,47}$/.test(file.name || '')) errors.push('Имя файла: латинские буквы, цифры и дефис');
    if (file && (/^(base-|service$|legacy$|ibp-light$|ibp-dark$)/.test(file.name) || /-(light|dark)$/.test(file.name))) {
      errors.push('Это имя зарезервировано для профиля или базы');
    }
    if (file && (!file.label || typeof file.label !== 'string' || file.label.length > 80)) errors.push('Название темы — от 1 до 80 символов');
    if (file && !file.light) errors.push('Нужен светлый профиль');

    PROFILES.forEach(function (mode) {
      var p = file && file[mode];
      if (!p) return;
      if (!validHex(p.brand) || !validHex(p.neutral)) errors.push(mode + ': цвета должны быть #RRGGBB');
      ['brandStep', 'neutralStep'].forEach(function (k) {
        if (p[k] != null && R.STEPS.indexOf(String(p[k])) < 0) errors.push(mode + ': опорная ступень ' + k + ' — одна из ' + R.STEPS.join(', '));
      });
      Object.keys(p.overrides || {}).forEach(function (k) {
        if (!has(T.roles, k) && !isRampKey(k)) errors.push('Неизвестная роль: ' + k);
        if (!validOverride(p.overrides[k])) errors.push('Недопустимое значение: ' + k);
      });
      ['hue', 'saturation', 'temperature'].forEach(function (k) {
        var v = (p.adjust || {})[k];
        if (v != null && (!Number.isFinite(v) || Math.abs(v) > (k === 'hue' ? 180 : 100))) errors.push('Недопустимая настройка ' + k);
      });
    });
    return errors;
  }

  /* Разворачивает цепочку var(--a) → var(--b) → значение. Составные
     выражения (color-mix) возвращаются как есть. */
  function resolve(expr, vars, seen) {
    seen = seen || [];
    if (!expr || seen.length > 30) return null;
    var m = /^var\((--[\w-]+)\)$/.exec(expr);
    if (!m) return expr;
    if (seen.indexOf(m[1]) >= 0) return null;
    return resolve(vars[m[1]], vars, seen.concat(m[1]));
  }

  function checkBase(ramps, mode) {
    T.ramps.tones.filter(function (t) { return t !== 'accent' && t !== 'neutral'; }).forEach(function (tone) {
      R.STEPS.forEach(function (step) {
        if (!ramps[tone] || !validHex(ramps[tone][step])) throw new Error('База ' + mode + ': нет ' + tone + '-' + step);
      });
    });
  }

  /* Обязательные пары держит генератор, сдвигая цвет текста. Не трогаем:
     ручные правки, фиксированные статусы, информационные пары и всё, что
     касается заливки brand — она ровно ступень 500 (Р2). */
  function fitContrast(roles, vars, manual) {
    (T.contrast || []).forEach(function (pair) {
      if (pair.required === false) return;
      if (STATUS_FG.test(pair.fg) || pair.fg === '--color-fg-on-fill') return;
      if (pair.fg === '--color-accent-fill' || pair.bg === '--color-accent-fill') return;
      if (manual.indexOf(pair.fg) >= 0 || manual.indexOf(pair.bg) >= 0) return;
      var fg = resolve(vars[pair.fg], vars), bg = resolve(vars[pair.bg], vars);
      if (!validHex(fg) || !validHex(bg) || R.contrast(fg, bg) >= pair.min) return;
      roles[pair.fg] = R.fitContrast(fg, bg, pair.min);
      vars[pair.fg] = roles[pair.fg];
    });
  }

  function checkGraph(graph, keys) {
    var done = {}, active = {};
    function visit(k) {
      if (active[k]) throw new Error('Цикл цвета: ' + k);
      if (done[k]) return;
      active[k] = true;
      (String(graph[k]).match(/var\((--[\w-]+)/g) || []).forEach(function (ref) {
        var key = ref.slice(4);
        if (!has(graph, key)) throw new Error('Неизвестная переменная цвета: ' + key);
        visit(key);
      });
      delete active[k];
      done[k] = true;
    }
    keys.forEach(visit);
  }

  function compile(file, mode, data) {
    var errors = validate(file);
    if (errors.length) throw new Error(errors.join('; '));
    mode = mode === 'dark' && file.dark ? 'dark' : 'light';
    var legacy = file.name === 'ibp-legacy';
    var p = file[mode], overrides = p.overrides || {}, manual = Object.keys(overrides);

    var ramps = clone(data.bases[mode].ramps);
    checkBase(ramps, mode);
    ramps.accent = R.fromStep(p.brand, p.brandStep || '500', 'accent', mode, p.adjust);
    ramps.neutral = R.fromStep(p.neutral, p.neutralStep || '500', 'neutral', mode, p.adjust);

    var roles = Object.assign({}, T.values, T.profiles[mode]);
    /* Акцентные статусы идут за brand; фиксированные статусы и графики — за базой. */
    Object.keys(roles).forEach(function (k) {
      if (k.indexOf('--color-status-accent-') === 0) roles[k] = roles[k].replace(/--emerald-/g, '--ramp-accent-');
    });
    /* Текст на заливке — ступени рамп, не hex: «белый» — самый светлый серый,
       «тёмный» — самая тёмная нейтраль своего режима. */
    roles['--color-fg-on-fill'] = p.onFill === 'dark'
      ? (mode === 'dark' ? 'var(--ramp-neutral-50)' : 'var(--ramp-neutral-950)')
      : (mode === 'dark' ? 'var(--ramp-grey-950)' : 'var(--ramp-grey-50)');

    var vars = Object.assign({}, data.legacy.variables);
    Object.keys(ramps).forEach(function (tone) {
      R.STEPS.forEach(function (step) {
        var key = '--ramp-' + tone + '-' + step;
        if (overrides[key]) ramps[tone][step] = overrides[key];
        vars[key] = ramps[tone][step];
      });
    });
    manual.forEach(function (k) { if (k.indexOf('--color-') === 0) roles[k] = overrides[k]; });
    Object.assign(vars, roles);

    if (!legacy) fitContrast(roles, vars, manual);

    var graph = Object.assign({}, vars);
    if (!legacy) Object.keys(T.map).forEach(function (k) { graph[k] = 'var(' + T.map[k] + ')'; });
    checkGraph(graph, Object.keys(roles));

    var colors = {};
    Object.keys(roles).forEach(function (k) { colors[k] = resolve(roles[k], vars) || roles[k]; });
    var old = {};
    Object.keys(T.map).forEach(function (k) { old[k] = legacy ? data.legacy.variables[k] : colors[T.map[k]]; });
    var contrast = (T.contrast || []).map(function (pair) {
      var fg = colors[pair.fg], bg = colors[pair.bg];
      return Object.assign({}, pair, { ratio: validHex(fg) && validHex(bg) ? R.contrast(fg, bg) : null });
    });

    return {
      name: file.name, mode: mode, id: legacy ? 'legacy' : file.name + '-' + mode,
      ramps: ramps, roles: roles, colors: colors, old: old, contrast: contrast, manual: manual
    };
  }

  function css(model) {
    if (model.id === 'legacy') return '';
    var lines = [':root[data-theme="' + model.id + '"], [data-theme="' + model.id + '"] {', '  color-scheme: ' + model.mode + ';'];
    Object.keys(model.ramps).forEach(function (tone) {
      R.STEPS.forEach(function (step) { lines.push('  --ramp-' + tone + '-' + step + ': ' + model.ramps[tone][step] + ';'); });
    });
    Object.keys(model.roles).forEach(function (k) { if (k.indexOf('--color-') === 0) lines.push('  ' + k + ': ' + model.roles[k] + ';'); });
    Object.keys(T.map).forEach(function (k) { lines.push('  ' + k + ': var(' + T.map[k] + ');'); });
    (T.elevation || []).forEach(function (e) { lines.push('  ' + e.name + ': ' + e.value + ';'); });
    (T.rules || []).forEach(function (rule) { if (rule.selector === ':root') lines.push('  ' + rule.prop + ': ' + rule.value + ';'); });
    lines.push('}');
    return lines.join('\n');
  }

  /* Данные в форме DS_THEMES для theme-build: service — как была, темы из
     файлов — скомпилированными профилями. Исторические исключения пар
     контраста (фиксированные статусы) переносятся на новые темы, у
     custom-dark — исключения service: это её ручная база. */
  function sources(data) {
    var out = clone(T);
    out.themes = ['service'];
    out.seeds = { service: clone(T.seeds.service) };
    out.themeValues = { service: clone(T.themeValues.service) };

    data.themes.forEach(function (file) {
      if (file.name === 'ibp-legacy') return;
      PROFILES.forEach(function (mode) {
        if (!file[mode]) return;
        var m = compile(file, mode, data);
        out.themes.push(m.id);
        out.seeds[m.id] = { profile: mode, fixedBase: true, ramps: {} };
        Object.keys(m.ramps).forEach(function (k) { out.seeds[m.id].ramps[k] = { values: m.ramps[k] }; });
        out.themeValues[m.id] = m.roles;
      });
    });

    out.contrast = out.contrast.map(function (p) {
      var v = clone(p);
      v.exempt = (v.exempt || []).filter(function (x) { return x === 'service'; });
      var fixedStatus = STATUS_FG.test(p.fg) || (p.fg === '--color-fg-on-fill' && p.bg !== '--color-accent-fill');
      if (p.exempt && p.exempt.indexOf('ibp-light') >= 0 && fixedStatus) {
        data.themes.forEach(function (f) {
          if (f.light) v.exempt.push(f.name + '-light');
          if (f.dark) v.exempt.push(f.name + '-dark');
        });
      }
      if (p.exempt && p.exempt.indexOf('service') >= 0) v.exempt.push('custom-dark');
      return v;
    });
    return out;
  }

  function mirror(data) {
    return '/* Генерат theme-build.mjs / сохранения конструктора. */\nwindow.DS_THEME_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
  }

  return { validate: validate, compile: compile, css: css, sources: sources, resolve: resolve, mirror: mirror };
})();

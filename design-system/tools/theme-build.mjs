#!/usr/bin/env node
/* ============================================================
   THEME-BUILD — генератор CSS тем ДС (RE0005).

   Источник — foundations/Themes/Themes.tokens.js (роли, значения
   ролей, семена рамп, карта 119 старых имён, точечные правила,
   правила страниц). Генератор пишет два файла:
     foundations/Themes/Themes.css        — блоки [data-theme], точечные
                                            правила компонентов и хрома ДС;
     foundations/Themes/Themes.pages.css  — правила страниц ДС (инлайн-стили
                                            и блоки <style>), подключается
                                            только на страницах ДС.
   Оба — генераты, руками не правятся; источник правится руками.

   Механика наложения (задача RE0005, §2):
   - блок темы `:root[data-theme="X"], [data-theme="X"]` — рампы --ramp-*,
     роли --color-*, все 119 старых имён, тени, color-scheme;
   - без атрибута не действует ни одно правило файла: legacy как прежде;
   - точечные правила компонентов — `:where([data-theme]:not([data-theme="legacy"])) <селектор>`:
     :where не добавляет специфичности (состояния сильнее), исключение legacy
     не даёт правилам работать на блоке старой темы;
   - правило токена, определённого на :root, — внутри блока каждой темы
     (не один раз на :root[data-theme]): так вложенная тема берёт свои
     токены компонентов, а не значения темы страницы (RE0007);
   - новые тона (accent, neutral, grey) считает Ramp.tokens.js (один модуль
     для Node и браузера) из семян темы; семя `{ h, c }` — по кривой профиля,
     семя `{ values: { '50': '#…' } }` — явные эталонные ступени (напр. slate
     или акцент с закреплённой ступенью); базовые тона без семени переносятся
     из Colors.css как есть (A-шаги не переносятся, 950 = 900).

   Проверки (--check):
   - генерат совпадает с источником;
   - у каждой собранной темы — все роли словаря и все 119 имён карты;
   - селектор и свойство каждого точечного правила ещё есть в файле;
   - нет циклов в ссылках переменных;
   - сгенерированные рампы монотонны по светлоте (яркость WCAG строго
     убывает 50 → 950); перенесённые базовые — как есть;
   - контраст пар из `contrast` источника: текст — AA 4,5:1, границы полей
     и элементы управления — 3:1. Пары `required: false` (базовые тона legacy)
     печатаются как INFO и сборку не роняют.
   Селекторы, ссылающиеся на пропавший из файла приём, сообщаются строкой
   FAIL: правка компонента не должна ломать тему молча.

   Использование (из корня ДС):
     node tools/theme-build.mjs             — собрать Themes.css и Themes.pages.css
     node tools/theme-build.mjs --check     — только сверить, ничего не записывая
     node tools/theme-build.mjs --selftest  — откат на встроенной фикстуре
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const AT = {
  tokens: 'foundations/Themes/Themes.tokens.js',
  ramp: 'foundations/Themes/Ramp.tokens.js',
  css: 'foundations/Themes/Themes.css',
  pages: 'foundations/Themes/Themes.pages.css',
  colors: 'foundations/Colors/Colors.css',
  palette: 'foundations/Colors/Palette.css',
};

const GEN = 'theme-build.mjs';
const TODAY = '04.10.2026';
const CSS_HEAD = '/* ============================================================\n' +
  '   Themes.css — генерат ' + GEN + ' (RE0005–RE0006, ' + TODAY + '). Руками не править:\n' +
  '   источник — foundations/Themes/Themes.tokens.js, пересобрать —\n' +
  '   node tools/theme-build.mjs (гейт сверяет, --check).\n' +
  '   Без атрибута data-theme не действует ни одно правило файла.\n' +
  '   ============================================================ */\n';
const PAGES_HEAD = '/* ============================================================\n' +
  '   Themes.pages.css — генерат ' + GEN + ' (RE0005–RE0006, ' + TODAY + '). Руками не править.\n' +
  '   Только для страниц ДС: перекрашивает инлайн-стили демо и блоки <style>\n' +
  '   страниц. На страницу ставит docs-kit/ds-theme-boot.js.\n' +
  '   ============================================================ */\n';

/* Запасной список пар контраста: [роль, роль фона, минимум] — если в
   источнике нет `contrast`. Основной список — `contrast` в Themes.tokens.js
   (его же читает стенд). Только чистые ссылки на рампы (без color-mix
   transparent) — их значения разрешаются в hex. Текст — AA_TEXT 4,5:1;
   границы полей и элементы управления — AA_UI 3:1. warning в пары
   `--color-fg-on-fill` не входит: по решению Э2 у него нет `-fg-inverse`,
   текст на жёлтой заливке — тёмный (--color-warning-fg). */
const AA_TEXT = 4.5;
const AA_UI = 3;
const CONTRAST_PAIRS = [
  ['--color-fg-default', '--color-bg-page', AA_TEXT],
  ['--color-fg-default', '--color-bg-surface', AA_TEXT],
  ['--color-fg-default', '--color-bg-raised', AA_TEXT],
  ['--color-fg-secondary', '--color-bg-surface', AA_TEXT],
  ['--color-fg-inverse', '--color-bg-inverse', AA_TEXT],
  ['--color-accent-fg', '--color-bg-surface', AA_TEXT],
  ['--color-link', '--color-bg-surface', AA_TEXT],
  ['--color-fg-on-fill', '--color-accent-fill', AA_TEXT],
  ['--color-fg-on-fill', '--color-danger-fill', AA_TEXT],
  ['--color-fg-on-fill', '--color-success-fill', AA_TEXT],
  ['--color-fg-on-fill', '--color-info-fill', AA_TEXT],
  ['--color-danger-fg', '--color-bg-surface', AA_TEXT],
  ['--color-warning-fg', '--color-bg-surface', AA_TEXT],
  ['--color-success-fg', '--color-bg-surface', AA_TEXT],
  ['--color-info-fg', '--color-bg-surface', AA_TEXT],
  ['--color-border-default', '--color-bg-surface', AA_UI],
  ['--color-border-strong', '--color-bg-surface', AA_UI],
];

/* ---------- чтение данных через vm (как icons-data.js) ---------- */
function loadData(rel) {
  const abs = path.join(ROOT, rel);
  const ctx = { window: {} };
  vm.runInNewContext(readFileSync(abs, 'utf8'), ctx, { timeout: 2000, filename: rel });
  return ctx.window;
}

/* ---------- разбор :root { --x: value } ---------- */
const RX_VAR = /(--[\w-]+)\s*:\s*([^;}]+)/g;
function rootVars(css) {
  const out = new Map();
  const m = css.match(/:root\s*\{([\s\S]*?)\}/);
  if (!m) throw new Error(GEN + ': в файле нет блока :root');
  for (const x of m[1].matchAll(RX_VAR)) out.set(x[1], x[2].trim());
  return out;
}

const norm = (s) => String(s).replace(/\s+/g, '');
const escAttr = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

/* ---------- сборка рамп темы ----------
   Тона с семенем считает Ramp.tokens.js; базовые тона без семени генератор
   переносит из Colors.css как есть (A-шаги не переносятся, 950 = 900). */
function themeRamps(tokens, ramp, theme, legacyVars) {
  const seed = tokens.seeds[theme];
  if (!seed) return null;
  const out = new Map();
  for (const tone of tokens.ramps.tones) {
    const s = seed.ramps && seed.ramps[tone];
    if (s) {
      const r = ramp.tone(s, seed.profile);
      for (const step of tokens.ramps.steps) out.set('--ramp-' + tone + '-' + step, r[step]);
    } else {
      for (const step of tokens.ramps.steps) {
        const from = legacyVars.get('--' + tone + '-' + step) || (step === '950' ? legacyVars.get('--' + tone + '-900') : null);
        if (!from) throw new Error(GEN + ': нет легаси-значения --' + tone + '-' + step + ' в Colors.css');
        out.set('--ramp-' + tone + '-' + step, from);
      }
    }
  }
  return out;
}

/* ---------- генерация ---------- */
export function generate(tokens, ramp, colorsCss, paletteCss) {
  const colors = rootVars(colorsCss);
  const palette = rootVars(paletteCss);
  const roleNames = Object.keys(tokens.roles);
  const map = tokens.map;
  const out = [];

  const built = tokens.themes.filter((t) => tokens.seeds && tokens.seeds[t]);
  /* Флаг seeds[тема].palette — «тема = текущая палитра» (исторический режим
     RE0005): роли заданы значениями Palette.css, точечные правила к ней не
     применяются — иначе перекрасили бы legacy. С RE0006 флагом не пользуется
     ни одна тема (ibp-light переведена на генератор), ветка оставлена как
     поддержанный режим. */
  const paletteThemes = built.filter((t) => tokens.seeds[t].palette);
  const notThemed = [':not([data-theme="legacy"])']
    .concat(paletteThemes.map((t) => ':not([data-theme="' + t + '"])')).join('');

  /* Токены компонентов (правила с селектором :root) задаём в блоке КАЖДОЙ
     темы, а не один раз на :root[data-theme]: иначе вложенная тема
     (`[data-theme="service"]` на стенде, окно тем) наследует их от темы
     страницы — ховер сервисной кнопки становился бирюзовым (RE0007). */
  const tokenRules = [];
  for (const rule of tokens.rules) {
    if ((rule.selector || '').trim() === ':root') tokenRules.push({ prop: rule.prop, value: rule.value });
  }

  for (const theme of built) {
    const ramps = themeRamps(tokens, ramp, theme, colors);
    const scheme = (tokens.seeds[theme].profile || 'light') === 'dark' ? 'dark' : 'light';
    const L = [];
    L.push(':root[data-theme="' + theme + '"], [data-theme="' + theme + '"] {');
    L.push('  color-scheme: ' + scheme + ';');
    L.push('');
    L.push('  /* рампы */');
    for (const [name, value] of ramps) L.push('  ' + name + ': ' + value + ';');
    L.push('');
    L.push('  /* роли */');
    const themeVals = (tokens.themeValues && tokens.themeValues[theme]) || {};
    const roleValues = {};
    for (const role of roleNames) {
      const v = themeVals[role] || tokens.values[role];
      if (!v) throw new Error(GEN + ': тема ' + theme + ' — роли ' + role + ' нет значения');
      roleValues[role] = v;
      L.push('  ' + role + ': ' + v + ';');
    }
    L.push('');
    L.push('  /* старые имена (карта ' + Object.keys(map).length + ') */');
    for (const [oldName, role] of Object.entries(map)) {
      if (!roleValues[role]) throw new Error(GEN + ': карта ведёт ' + oldName + ' → ' + role + ', которой нет в теме ' + theme);
      L.push('  ' + oldName + ': var(' + role + ');');
    }
    L.push('');
    L.push('  /* тени */');
    for (const e of tokens.elevation) L.push('  ' + e.name + ': ' + e.value + ';');
    if (tokenRules.length) {
      L.push('');
      L.push('  /* токены компонентов (правила :root) — свои в каждой теме */');
      for (const t of tokenRules) L.push('  ' + t.prop + ': ' + t.value + ';');
    }
    out.push(L.join('\n') + '\n}\n');
  }

  /* legacy — блок старых значений для стенда: внутри новой темы возвращает страницу в legacy */
  const legacy = [];
  legacy.push('/* legacy: старые значения — для стенда (показать рядом с новой темой).');
  legacy.push('   Точечные правила внутри блока не действуют: они ждут не-[data-theme="legacy"]. */');
  legacy.push(':root[data-theme="legacy"], [data-theme="legacy"] {');
  for (const [name, value] of palette) legacy.push('  ' + name + ': ' + value + ';');
  /* Токены компонентов тема задаёт на :root[data-theme] — они наследуются в
     поддерево вложенной legacy. Возвращаем их к исходному значению компонента
     (поле `from`), иначе легаси-сцена стенда получает чужие hover/статус-токены. */
  for (const rule of tokens.rules) {
    if ((rule.selector || '').trim() === ':root' && rule.from) {
      legacy.push('  ' + rule.prop + ': ' + rule.from + ';');
    }
  }
  legacy.push('}');
  out.push(legacy.join('\n') + '\n');

  /* точечные правила компонентов и хрома ДС */
  const whereRules = new Map();   // селектор → [{prop,value}]
  for (const rule of tokens.rules) {
    if ((rule.selector || '').trim() === ':root') continue;   // токены компонентов — в блоке темы
    if (!whereRules.has(rule.selector)) whereRules.set(rule.selector, []);
    whereRules.get(rule.selector).push({ prop: rule.prop, value: rule.value });
  }
  const rulesOut = [];
  rulesOut.push('/* Точечные правила: место компонента или оболочки документации → роль.');
  rulesOut.push('   :where не добавляет специфичности — состояния компонента сильнее.'); 
  rulesOut.push('   Блок legacy исключён: старые значения остаются старыми. */');
  const gate = ':where([data-theme]' + notThemed + ') ';
  /* Вложенная legacy (сцена стенда `data-theme="legacy"` внутри themed <html>)
     не должна получать правила темы: гейт-предок `:where([data-theme]…)` матчит
     и <html>, поэтому цель ещё и исключаем из поддерева любой legacy. `:where`
     держит нулевую специфичность — состояния компонента остаются сильнее. */
  const notLegacyDesc = ':where(:not([data-theme="legacy"] *))';
  const scopeTarget = (sel) => {
    const s = sel.trim();
    const i = s.indexOf('::');
    return i >= 0 ? s.slice(0, i) + notLegacyDesc + s.slice(i) : s + notLegacyDesc;
  };
  for (const [selector, decls] of whereRules) {
    const byProp = new Map();
    for (const d of decls) byProp.set(d.prop, d.value);
    /* Гейт — на КАЖДЫЙ селектор списка. Иначе у правил с запятой гейт достаётся
       только первому, а хвост (`…, .sw--hover.sw--on …`) срабатывает без
       data-theme — в legacy подставляет несуществующие токены темы, и свойство
       становится невалидным (напр. фон свитча пропадал на наведении). */
    const gated = selector.split(',').map((s) => gate + scopeTarget(s)).join(', ');
    rulesOut.push(gated + ' {');
    for (const [prop, value] of byProp) rulesOut.push('  ' + prop + ': ' + value + ';');
    rulesOut.push('}');
  }
  out.push(rulesOut.join('\n') + '\n');

  const css = CSS_HEAD + '\n' + out.join('\n');

  /* правила страниц ДС */
  const p = [];
  p.push('/* Блоки <style> страниц ДС: стиль страницы идёт после подключённых');
  p.push('   файлов, поэтому тема добавляет :root[data-theme] к селектору. */');
  for (const b of tokens.pages.block) {
    p.push(':root[data-theme] ' + b.selector + ' {');
    p.push('  ' + b.prop + ': ' + b.value + ';');
    p.push('}');
  }
  p.push('');
  p.push('/* Инлайн-стили демо страниц ДС: по значению атрибута style, !important */');
  p.push('/* перебивает инлайн; гейт :root[data-theme] — в legacy не действует. */');
  for (const s of tokens.pages.style) {
    for (const raw of s.match) {
      p.push(':root[data-theme] [style*="' + escAttr(raw) + '"] {');
      p.push('  ' + s.prop + ': ' + s.value + ' !important;');
      p.push('}');
    }
  }
  const pages = PAGES_HEAD + '\n' + p.join('\n') + '\n';

  return { css, pages, built, roleNames, palette };
}

/* ---------- проверки ---------- */
function checkRules(tokens, root) {
  const bad = [];
  const cache = new Map();
  const file = (f) => {
    if (!cache.has(f)) {
      const abs = path.join(root, f);
      if (!existsSync(abs)) { cache.set(f, null); return null; }
      cache.set(f, readFileSync(abs, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''));
    }
    return cache.get(f);
  };
  for (const r of tokens.rules) {
    const css = file(r.file);
    if (css === null) { bad.push('нет файла ' + r.file); continue; }
    const n = norm(css);
    const decl = norm(r.prop + ':' + r.from);
    if (!n.includes(norm(r.selector))) { bad.push(r.file + ' — пропал селектор «' + r.selector + '»'); continue; }
    if (!n.includes(decl)) bad.push(r.file + ' — пропало объявление «' + r.prop + ': ' + r.from + '» (' + r.selector + ')');
  }
  return bad;
}

function refsOf(value) {
  return [...String(value).matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]);
}

function checkCycles(tokens) {
  const graph = new Map();
  const known = new Set();
  const add = (name, value) => { known.add(name); graph.set(name, refsOf(value)); };
  for (const r of Object.keys(tokens.roles)) {
    const v = tokens.values[r] || Object.values(tokens.themeValues || {}).map((o) => o[r]).find(Boolean);
    if (v) add(r, v);
  }
  for (const [oldName, role] of Object.entries(tokens.map)) add(oldName, 'var(' + role + ')');
  for (const e of tokens.elevation) add(e.name, e.value);
  for (const r of tokens.rules) if (r.value) add(r.prop, r.value);
  const state = new Map();
  const bad = [];
  const visit = (n, trail) => {
    if (!known.has(n)) return;
    if (state.get(n) === 1) { bad.push(trail.concat(n).join(' → ')); return; }
    if (state.get(n) === 2) return;
    state.set(n, 1);
    for (const ref of graph.get(n) || []) visit(ref, trail.concat(n));
    state.set(n, 2);
  };
  for (const n of known) visit(n, []);
  return bad;
}

/* Все значения рамп темы: сгенерированные из семян и перенесённые из
   Colors.css. Нужны отчёту контраста (базовые тона — тоже). */
function themeRampValues(tokens, ramp, theme, legacyVars) {
  const seed = tokens.seeds[theme];
  const ramps = new Map();
  for (const tone of tokens.ramps.tones) {
    if (seed.ramps && seed.ramps[tone]) {
      const r = ramp.tone(seed.ramps[tone], seed.profile);
      for (const s of tokens.ramps.steps) ramps.set('--ramp-' + tone + '-' + s, r[s]);
    } else {
      for (const s of tokens.ramps.steps) {
        const from = legacyVars.get('--' + tone + '-' + s) || (s === '950' ? legacyVars.get('--' + tone + '-900') : null);
        if (from) ramps.set('--ramp-' + tone + '-' + s, from);
      }
    }
  }
  return ramps;
}

/* Возвращает { bad, info }: bad — обязательные пары (required), info —
   пары на базовых тонах legacy, которые AA не гарантируют. */
function checkContrast(tokens, generated, theme, legacyVars) {
  const ramp = generated.ramp;
  const values = tokens.values;
  const themeVals = (tokens.themeValues && tokens.themeValues[theme]) || {};
  const ramps = themeRampValues(tokens, ramp, theme, legacyVars);
  const hexOf = (role) => {
    const v = String(themeVals[role] || values[role]);
    let m = v.match(/^var\((--ramp-[\w-]+)\)$/);
    if (m) return ramps.get(m[1]);                       // рампа темы
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v.toUpperCase(); // hex (ibp-light = палитра)
    m = v.match(/^var\((--[\w-]+)\)$/);
    if (m) return legacyVars.get(m[1]) || null;           // токен Colors.css/Palette.css
    return null;                                          // color-mix — не проверяется
  };
  const pairs = (tokens.contrast && tokens.contrast.length)
    ? tokens.contrast
    : CONTRAST_PAIRS.map(([fg, bg, min]) => ({ fg, bg, min, required: true }));
  const bad = [], info = [];
  for (const p of pairs) {
    const a = hexOf(p.fg), b = hexOf(p.bg);
    if (!a || !b) continue;   // выражение с color-mix — проверяется на своём этапе
    const c = ramp.contrast(a, b);
    if (c < p.min) {
      /* exempt: [тема] — для этой темы пара информационная. Так ibp-light
         повторяет текущую палитру, где AA на кнопках/ссылках/границах
         не держится (решение человека 04.10.2026). */
      const exempt = p.required === false || (Array.isArray(p.exempt) && p.exempt.includes(theme));
      (exempt ? info : bad).push(p.fg + ' на ' + p.bg + ' — ' + c.toFixed(2) + ':1 < ' + p.min + ' (' + a + ' на ' + b + ')' + (exempt && p.required !== false ? ', ' + theme + ' exempt' : ''));
    }
  }
  return { bad, info };
}

/* Рампа монотонна по светлоте: светлая тема — яркость WCAG строго убывает
   от 50 к 950, тёмная — строго растёт (значения рампы считает Ramp.tokens.js
   из одной кривой светлоты профиля). */
function checkMonotone(tokens, ramp, theme) {
  const seed = tokens.seeds[theme];
  const sign = seed.profile === 'dark' ? 1 : -1;
  const bad = [];
  for (const tone of tokens.ramps.tones) {
    if (!seed.ramps[tone]) continue;
    const r = ramp.tone(seed.ramps[tone], seed.profile);
    let prev = null;
    for (const s of tokens.ramps.steps) {
      const lum = ramp.luminance(r[s]);
      if (prev && sign * (lum - prev.lum) <= 0) {
        bad.push(tone + ': ' + prev.s + '→' + s + ' не монотонна (' + prev.lum.toFixed(4) + ' → ' + lum.toFixed(4) + ')');
      }
      prev = { s, lum };
    }
  }
  return bad;
}

/* Каждое правило генерата должно быть под атрибутом data-theme. */
function checkGated(css) {
  const bad = [];
  for (const sel of css.matchAll(/^([^{}\n][^{}]*)\{/gm)) {
    const s = sel[1].trim();
    if (!s || s.startsWith('/*')) continue;
    /* Проверяем КАЖДЫЙ селектор списка: запятая без атрибута — правило
       сработает вне темы (баг «гейт только на первый селектор»). */
    for (const part of s.split(',')) {
      if (!part.includes('data-theme')) bad.push(part.trim().slice(0, 60));
    }
  }
  return bad;
}

export function check(tokens, ramp, colorsCss, paletteCss, files) {
  const defects = [], infos = [];
  const colors = rootVars(colorsCss);
  const palette = rootVars(paletteCss);
  /* Приведение значения к сравнимому виду: цепочка var → hex; color-mix →
     строка без пробелов. Нужно теме-«палитре» (проверка ниже). */
  const resolveVal = (expr, seen) => {
    const e = String(expr || '').trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(e)) return e.toUpperCase();
    const m = /^var\((--[\w-]+)\)$/.exec(e);
    if (m) {
      if (seen && seen.has(m[1])) return 'ЦИКЛ';
      const v = colors.get(m[1]) || palette.get(m[1]);
      return v ? resolveVal(v, new Set([...(seen || []), m[1]])) : e;
    }
    return e.replace(/\s+/g, ' ');
  };
  let g;
  try {
    g = generate(tokens, ramp, colorsCss, paletteCss);
  } catch (e) {
    return { defects: ['генерация: ' + e.message], infos, generated: null };
  }
  for (const theme of g.built) {
    const v = tokens.themeValues && tokens.themeValues[theme] || {};
    const missingRoles = g.roleNames.filter((r) => !tokens.values[r] && !v[r]);
    if (missingRoles.length) defects.push('тема ' + theme + ' — нет значений ролей: ' + missingRoles.slice(0, 6).join(', '));
    const badMap = Object.entries(tokens.map).filter(([, role]) => !tokens.roles[role]).map(([n, r]) => n + ' → ' + r);
    if (badMap.length) defects.push('карта ведёт в неизвестные роли: ' + badMap.slice(0, 6).join(', '));
    if (Object.keys(tokens.map).length !== 119) defects.push('карта: имён ' + Object.keys(tokens.map).length + ', ожидается 119');
    const seeds = tokens.seeds[theme].ramps || {};
    const noSeed = tokens.ramps.tones.filter((tone) => !seeds[tone]);
    for (const tone of noSeed) {
      if (!colors.has('--' + tone + '-500')) defects.push('нет легаси-рампы --' + tone + '-* в Colors.css (перенос тона ' + tone + ')');
    }
    /* Тема-«палитра» обязана совпадать с текущей палитрой: каждое старое имя
       через свою роль должно равняться значению Palette.css. Иначе правка роли
       разошлась бы с legacy молча. */
    if (tokens.seeds[theme].palette) {
      const tv = tokens.themeValues && tokens.themeValues[theme] || {};
      const bad = [];
      for (const [old, role] of Object.entries(tokens.map)) {
        if (!palette.has(old)) { bad.push(old + ' (нет в Palette.css)'); continue; }
        const want = resolveVal(palette.get(old));
        const got = tv[role] ? resolveVal(tv[role]) : null;
        if (got === null) bad.push(old + ' (нет роли ' + role + ' в themeValues)');
        else if (got !== want) bad.push(old + ': ' + got + ' ≠ ' + want);
      }
      if (bad.length) defects.push('тема-«палитра» ' + theme + ' ≠ Palette.css: ' + bad.slice(0, 6).join('; ') + (bad.length > 6 ? ' … ещё ' + (bad.length - 6) : ''));
    }
    const contra = checkContrast(tokens, { ramp }, theme, colors);
    for (const c of contra.bad) defects.push('контраст ' + theme + ': ' + c);
    for (const c of contra.info) infos.push('контраст (пара не обязательна для темы) ' + theme + ': ' + c);
    for (const m of checkMonotone(tokens, ramp, theme)) defects.push('монотонность ' + theme + ': ' + m);
  }
  for (const b of checkRules(tokens, ROOT)) defects.push('правило: ' + b);
  for (const c of checkCycles(tokens)) defects.push('цикл: ' + c);
  for (const s of checkGated(g.css)) defects.push('правило без data-theme: ' + s);
  if (files) {
    for (const [rel, want] of [['css', g.css], ['pages', g.pages]]) {
      const abs = path.join(ROOT, AT[rel]);
      if (!existsSync(abs)) defects.push('нет ' + AT[rel] + ' — собрать: node tools/' + GEN);
      else if (readFileSync(abs, 'utf8') !== want) defects.push(AT[rel] + ' разошёлся с генератором — пересобрать: node tools/' + GEN);
    }
  }
  return { defects, infos, generated: g };
}

/* ---------- selftest ---------- */
function selftest() {
  const out = ['== theme-build --selftest =='];
  let failed = 0;
  const t = (name, cond, extra) => { if (!cond) { failed++; out.push('FAIL  ' + name + (extra ? ' — ' + extra : '')); } else out.push('ok    ' + name); };

  const ramp = loadData(AT.ramp).DS_RAMP;
  t('ramp: чёрный/белый', ramp.lch(0, 0, 0) === '#000000' && ramp.lch(1, 0, 0) === '#FFFFFF', ramp.lch(1, 0, 0));
  t('ramp: белый на чёрном — 21:1', Math.abs(ramp.contrast('#FFFFFF', '#000000') - 21) < 0.01, String(ramp.contrast('#FFFFFF', '#000000')));
  t('ramp: grey без хромы — R=G=B', (() => { const h = ramp.tone({ h: 0, c: 0 })['500']; return ramp.hexToRgb(h)[0] === ramp.hexToRgb(h)[1]; })(), ramp.tone({ h: 0, c: 0 })['500']);
  t('ramp: шагов 11', ramp.STEPS.length === 11);
  t('ramp: явные ступени возвращаются как есть',
    ramp.tone({ values: { '50': '#F9F9FB', '500': '#00AA9B', '950': '#111113' } })['500'] === '#00AA9B');

  /* фикстура: минимальная ДС-обстановка для generate */
  const tokens = {
    themes: ['t-light'],
    ramps: { steps: ramp.STEPS, tones: ['accent', 'grey', 'red'] },
    seeds: { 't-light': { profile: 'light', ramps: { accent: { h: 175, c: 0.115 }, grey: { h: 0, c: 0 } } } },
    roles: { '--color-fg-default': {}, '--color-bg-surface': {} },
    values: { '--color-fg-default': 'var(--ramp-grey-900)', '--color-bg-surface': 'var(--ramp-grey-50)' },
    themeValues: {},
    map: { '--text-primary': '--color-fg-default' },
    elevation: [{ name: '--elevation-1', value: '0 1px 2px color-mix(in srgb, var(--color-shadow) 28%, transparent)' }],
    rules: [
      { file: 'x', selector: ':root', prop: '--k', from: 'v', value: 'var(--color-bg-surface)' },
      { file: 'x', selector: '.a .b, .c .d', prop: 'background', from: 'v', value: 'var(--color-bg-surface)' },
    ],
    pages: { style: [], block: [] },
  };
  const redSteps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
  const redVals = ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C'];
  const colors = ':root{' + redSteps.map((s, i) => '--red-' + s + ':' + redVals[i] + ';').join('') + '--grey-50:#F7F7F7;--grey-500:#878787;--grey-900:#262626;}';
  const palette = ':root{--text-primary:var(--grey-900);}';
  const g = generate(tokens, ramp, colors, palette);
  t('генерат: блок темы с атрибутом', g.css.includes(':root[data-theme="t-light"]'));
  t('генерат: 119-карта даёт старое имя', g.css.includes('--text-primary: var(--color-fg-default);'));
  t('генерат: legacy-блок', g.css.includes('[data-theme="legacy"]'));
  t('генерат: токен компонента (:root) в блоке темы, а не на :root[data-theme]',
    g.css.includes('--k: var(--color-bg-surface);') && !g.css.includes(':root[data-theme]:not([data-theme="legacy"]) {'));
  t('генерат: тон с семенем считан', g.css.includes('--ramp-accent-500:'));
  t('генерат: тон без семени перенесён', g.css.includes('--ramp-red-500: #F44336'), g.css.match(/--ramp-red-500: [^;]+/));
  t('генерат: 950 перенесённого = 900', g.css.includes('--ramp-red-950: #B71C1C'));
  t('генерат: нет правил вне data-theme', checkGated(g.css).length === 0, checkGated(g.css).join(' | '));
  t('генерат: точечное правило исключает вложенную legacy',
    g.css.includes(':where(:not([data-theme="legacy"] *))'));
  t('генерат: legacy возвращает токены компонентов',
    g.css.includes('--k: v;'), (g.css.match(/--k: [^;]+/) || [''])[0]);
  const c1 = checkContrast(tokens, { ramp }, 't-light', rootVars(colors));
  t('генерат: пары контраста AA', c1.bad.length === 0, c1.bad.join(' | '));
  t('монотонность: сгенерированные рампы убывают', checkMonotone(tokens, ramp, 't-light').length === 0, checkMonotone(tokens, ramp, 't-light').join(' | '));
  const cFalsy = { ...tokens, values: { '--color-fg-default': 'var(--ramp-grey-50)', '--color-bg-surface': 'var(--ramp-grey-50)' }, contrast: [{ fg: '--color-fg-default', bg: '--color-bg-surface', min: 4.5, required: false }] };
  const rInfo = checkContrast(cFalsy, { ramp }, 't-light', rootVars(colors));
  t('информационная пара не роняет', rInfo.bad.length === 0 && rInfo.info.length === 1, JSON.stringify(rInfo));
  const cReq = { ...cFalsy, contrast: [{ fg: '--color-fg-default', bg: '--color-bg-surface', min: 4.5, required: true }] };
  t('обязательная пара роняет', checkContrast(cReq, { ramp }, 't-light', rootVars(colors)).bad.length === 1);

  /* цикл ловится */
  const cyc = { ...tokens, roles: { '--a': {}, '--b': {} }, values: { '--a': 'var(--b)', '--b': 'var(--a)' }, map: {}, elevation: [], rules: [] };
  t('цикл ловится', checkCycles(cyc).length > 0);
  const acyc = { ...tokens, roles: { '--a': {}, '--b': {} }, values: { '--a': 'var(--b)', '--b': '#000' }, map: {}, elevation: [], rules: [] };
  t('ацикл не ловится', checkCycles(acyc).length === 0);

  /* правило без селектора в файле ловится */
  const rulesBad = { ...tokens, rules: [{ file: AT.palette, selector: '.нет-такого', prop: 'color', from: '#000', value: 'var(--color-bg-surface)' }] };
  t('пропавший селектор ловится', checkRules(rulesBad, ROOT).length > 0);

  out.push('ВЕРДИКТ: ' + (failed ? 'FAIL (кейсов не прошло: ' + failed + ')' : 'OK'));
  console.log(out.join('\n'));
  process.exit(failed ? 1 : 0);
}

/* ---------- main ---------- */
function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();
  const checkOnly = args.includes('--check');
  const tokens = loadData(AT.tokens).DS_THEMES;
  const ramp = loadData(AT.ramp).DS_RAMP;
  const colorsCss = readFileSync(path.join(ROOT, AT.colors), 'utf8');
  const paletteCss = readFileSync(path.join(ROOT, AT.palette), 'utf8');

  const { defects, infos, generated } = check(tokens, ramp, colorsCss, paletteCss, checkOnly);
  if (!checkOnly && generated) {
    writeFileSync(path.join(ROOT, AT.css), generated.css, 'utf8');
    writeFileSync(path.join(ROOT, AT.pages), generated.pages, 'utf8');
  }
  const notBuilt = tokens.themes.filter((t) => !(tokens.seeds && tokens.seeds[t]));
  const head = checkOnly ? 'theme-build --check' : 'theme-build';
  console.log('== ' + head + ' ==');
  console.log('собраны темы: ' + (generated ? generated.built.join(', ') : '—') + (notBuilt.length ? '; ждут семян: ' + notBuilt.join(', ') : ''));
  if (!checkOnly) console.log('записаны ' + AT.css + ', ' + AT.pages);
  for (const d of defects) console.log('FAIL  ' + d);
  for (const i of infos) console.log('INFO  ' + i);
  console.log('ВЕРДИКТ: ' + (defects.length ? 'FAIL (дефектов: ' + defects.length + ')' : 'OK'));
  process.exit(defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

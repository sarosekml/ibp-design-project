/* ============================================================
   apply-light.mjs — разовый скрипт RE0006, Э2 (04.10.2026).

   Переводит светлую тему ibp-light с «копии текущей палитры»
   (seeds["ibp-light"].palette = true, роли из themeValues) на
   генератор:
   - seeds["ibp-light"].ramps — явные эталонные шкалы:
       neutral — Radix slate (сине-серая),
       grey    — чисто-серая (поверхности, поверх 50 = #FFFFFF),
       accent  — эмеральдовая вокруг #00AA9B (закреплена на ступени 500);
   - themeValues["ibp-light"] — только графики (12), остальные роли
     берутся из общего values;
   - contrast: снят exempt ["ibp-light"] — светлая теперь проходит AA.

   Источник Themes.tokens.js — это window.DS_THEMES в стиле
   JSON.stringify(obj, null, 2). Файл читается через vm, правится и
   пишется заново тем же форматом; шапка-комментарий сохраняется.
   Бэкап кладётся рядом.

   Запуск: node docs/misc/RE0006-palette/apply-light.mjs
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const SRC = path.join(ROOT, 'design-system/foundations/Themes/Themes.tokens.js');

const SLATE = {
  50: '#F9F9FB', 100: '#F0F0F3', 200: '#E0E1E6', 300: '#D9D9E0',
  400: '#B9BBC6', 500: '#8B8D98', 600: '#60646C', 700: '#52575E',
  800: '#3A3F46', 900: '#1C2024', 950: '#111113',
};
const GREY = {
  50: '#FFFFFF', 100: '#FAFAFA', 200: '#F5F5F5', 300: '#E5E5E5',
  400: '#D4D4D4', 500: '#A3A3A3', 600: '#737373', 700: '#525252',
  800: '#404040', 900: '#171717', 950: '#0A0A0A',
};
const ACCENT = {
  50: '#E9F7F5', 100: '#C9EDE9', 200: '#A0DFD8', 300: '#6BCCC2',
  400: '#38B8AB', 500: '#00AA9B', 600: '#0A7D6D', 700: '#0A6A5C',
  800: '#085648', 900: '#064238', 950: '#043027',
};

const text = readFileSync(SRC, 'utf8');
const marker = 'window.DS_THEMES = ';
const at = text.indexOf(marker);
if (at < 0) throw new Error('не найден window.DS_THEMES');
const header = text.slice(0, at + marker.length);

const ctx = { window: {} };
vm.runInNewContext(text, ctx, { filename: SRC });
const obj = ctx.window.DS_THEMES;

writeFileSync(path.join(HERE, 'Themes.tokens.before.js'), text, 'utf8');

/* 1) светлая тема: явные шкалы, флаг palette снят */
obj.seeds['ibp-light'] = {
  profile: 'light',
  ramps: {
    accent: { values: ACCENT },
    neutral: { values: SLATE },
    grey: { values: GREY },
  },
};

/* 2) роли светлой — из общего values; в themeValues остаются только графики */
const charts = {};
for (const key of Object.keys(obj.themeValues['ibp-light'])) {
  if (key.startsWith('--color-chart-')) charts[key] = obj.themeValues['ibp-light'][key];
}
obj.themeValues['ibp-light'] = charts;

/* 3) светлая больше не «палитра» — снят exempt */
for (const p of obj.contrast) {
  if (Array.isArray(p.exempt)) delete p.exempt;
}

writeFileSync(SRC, header + JSON.stringify(obj, null, 2) + ';\n', 'utf8');
console.log('записано: ' + SRC);
console.log('графиков светлой: ' + Object.keys(charts).length);
console.log('ролей в values: ' + Object.keys(obj.values).length + ', карта: ' + Object.keys(obj.map).length);

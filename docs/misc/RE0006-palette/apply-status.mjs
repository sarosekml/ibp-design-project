/* ============================================================
   apply-status.mjs — разовый скрипт RE0006, Э4 (04.10.2026).

   Статусные тона — на Tailwind-ориентированные семена (`{h,c}`):
   генератор даёт рампу под профиль темы (светлая — тёмный текст/заливка
   700, тёмная — светлый текст 800/заливка 700). Тона: red (danger),
   amber (warning), light-green (success), light-blue (info),
   green (status-green), deep-purple (status-purple).

   Графики (`--color-chart-1…12`) — категориальная палитра Tailwind:
   светлая — ступени 500, тёмная — 400.

   Запуск: node docs/misc/RE0006-palette/apply-status.mjs
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const SRC = path.join(ROOT, 'design-system/foundations/Themes/Themes.tokens.js');

/* Tailwind-ориентированные семена статусных тонов (тон, пиковая хрома). */
const SEEDS = {
  red: { h: 27, c: 0.22 },          // danger
  amber: { h: 75, c: 0.185 },       // warning / status-orange
  'light-green': { h: 145, c: 0.20 }, // success
  'light-blue': { h: 258, c: 0.205 }, // info / status-blue
  green: { h: 145, c: 0.20 },       // status-green
  'deep-purple': { h: 293, c: 0.25 } // status-purple
};

const LIGHT_CHARTS = {
  '--color-chart-1': '#3B82F6', '--color-chart-2': '#14B8A6', '--color-chart-3': '#8B5CF6',
  '--color-chart-4': '#F97316', '--color-chart-5': '#22C55E', '--color-chart-6': '#A855F7',
  '--color-chart-7': '#0EA5E9', '--color-chart-8': '#F59E0B', '--color-chart-9': '#84CC16',
  '--color-chart-10': '#EC4899', '--color-chart-11': '#EF4444', '--color-chart-12': '#D946EF'
};
const DARK_CHARTS = {
  '--color-chart-1': '#60A5FA', '--color-chart-2': '#2DD4BF', '--color-chart-3': '#A78BFA',
  '--color-chart-4': '#FB923C', '--color-chart-5': '#4ADE80', '--color-chart-6': '#C084FC',
  '--color-chart-7': '#38BDF8', '--color-chart-8': '#FBBF24', '--color-chart-9': '#A3E635',
  '--color-chart-10': '#F472B6', '--color-chart-11': '#F87171', '--color-chart-12': '#E879F9'
};

const text = readFileSync(SRC, 'utf8');
const marker = 'window.DS_THEMES = ';
const at = text.indexOf(marker);
if (at < 0) throw new Error('не найден window.DS_THEMES');
const header = text.slice(0, at + marker.length);

const ctx = { window: {} };
vm.runInNewContext(text, ctx, { filename: SRC });
const obj = ctx.window.DS_THEMES;

/* 1) семена статусных тонов — обеим темам */
for (const theme of ['ibp-light', 'ibp-dark']) {
  for (const [tone, seed] of Object.entries(SEEDS)) obj.seeds[theme].ramps[tone] = seed;
}

/* 2) графики */
Object.assign(obj.themeValues['ibp-light'], LIGHT_CHARTS);
Object.assign(obj.themeValues['ibp-dark'], DARK_CHARTS);

writeFileSync(SRC, header + JSON.stringify(obj, null, 2) + ';\n', 'utf8');
console.log('записано: ' + SRC);
console.log('семена статусов: ' + Object.keys(SEEDS).join(', '));
console.log('графиков: light ' + Object.keys(LIGHT_CHARTS).length + ', dark ' + Object.keys(DARK_CHARTS).length);

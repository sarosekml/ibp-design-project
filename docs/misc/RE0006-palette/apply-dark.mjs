/* ============================================================
   apply-dark.mjs — разовый скрипт RE0006, Э3 (04.10.2026).

   Тёмная тема ibp-dark: нейтраль — Radix slate (dark), grey —
   чисто-серая (dark), accent — яркая бирюза под тёмный фон
   (бегунок/текст на заливке тёмные, заливка светлая). Ступени
   заданы явно (`values`) — профиль на них не влияет.

   Базовые 16 тонов остаются сгенерированными из legacy-семян
   (статусы переделываются в Э4). Переопределения ролей темы —
   surfaces, навигация, «inverse», бегунок свитча, иконки, тень;
   графики сохраняются.

   Запуск: node docs/misc/RE0006-palette/apply-dark.mjs
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const SRC = path.join(ROOT, 'design-system/foundations/Themes/Themes.tokens.js');

const NEUTRAL = {
  50: '#111113', 100: '#18191B', 200: '#212225', 300: '#272A2D',
  400: '#5A6169', 500: '#8A9099', 600: '#B0B4BA', 700: '#C7CBD1',
  800: '#D6D9DE', 900: '#EDEEF0', 950: '#FAFAFB',
};
const GREY = {
  50: '#0D0D0D', 100: '#161616', 200: '#1E1E1E', 300: '#262626',
  400: '#383838', 500: '#666666', 600: '#999999', 700: '#B8B8B8',
  800: '#D6D6D6', 900: '#EDEDED', 950: '#FAFAFA',
};
const ACCENT = {
  50: '#04302B', 100: '#06453E', 200: '#085A50', 300: '#0A7063',
  400: '#0C8778', 500: '#0E9E8D', 600: '#12B3A1', 700: '#2FCBBB',
  800: '#5FDDD0', 900: '#96EAE0', 950: '#C9F5F0',
};

const text = readFileSync(SRC, 'utf8');
const marker = 'window.DS_THEMES = ';
const at = text.indexOf(marker);
if (at < 0) throw new Error('не найден window.DS_THEMES');
const header = text.slice(0, at + marker.length);

const ctx = { window: {} };
vm.runInNewContext(text, ctx, { filename: SRC });
const obj = ctx.window.DS_THEMES;

writeFileSync(path.join(HERE, 'Themes.tokens.before-dark.js'), text, 'utf8');

/* 1) нейтраль, серая и акцент тёмной — явные ступени; базовые 16 тонов не трогаем */
obj.seeds['ibp-dark'].ramps.neutral = { values: NEUTRAL };
obj.seeds['ibp-dark'].ramps.grey = { values: GREY };
obj.seeds['ibp-dark'].ramps.accent = { values: ACCENT };

/* 2) переопределения ролей тёмной: поверхности светлеют с подъёмом,
   бегунок и иконки — светлые, тень из тёмного конца */
const dark = obj.themeValues['ibp-dark'];
Object.assign(dark, {
  '--color-bg-sunken': 'var(--ramp-neutral-50)',
  '--color-bg-surface': 'var(--ramp-neutral-100)',
  '--color-bg-raised': 'var(--ramp-neutral-200)',
  '--color-bg-nav': 'var(--ramp-neutral-100)',
  '--color-bg-muted': 'var(--ramp-neutral-200)',
  '--color-bg-hover': 'var(--ramp-neutral-200)',
  '--color-bg-pressed': 'var(--ramp-neutral-300)',
  '--color-bg-selected-hover': 'var(--ramp-neutral-300)',
  '--color-bg-inverse': 'var(--ramp-neutral-200)',
  '--color-fg-inverse': 'var(--ramp-neutral-900)',
  '--color-bg-scrim': 'color-mix(in srgb, var(--ramp-neutral-50) 64%, transparent)',
  '--color-shadow': 'var(--ramp-neutral-50)',
  '--color-accent-shadow': 'color-mix(in srgb, var(--ramp-accent-300) 40%, transparent)',
  '--color-row-hover': 'var(--ramp-neutral-200)',
  '--color-row-selected': 'var(--ramp-neutral-200)',
  '--color-row-selected-hover': 'var(--ramp-neutral-300)',
  '--color-row-pinned': 'var(--ramp-neutral-200)',
  '--color-row-pinned-hover': 'var(--ramp-neutral-300)',
  '--color-row-pinned-selected': 'var(--ramp-neutral-200)',
  '--color-control-thumb': 'var(--ramp-neutral-700)',
  '--color-fg-icon': 'var(--ramp-accent-800)',
  '--color-fg-icon-strong': 'var(--ramp-accent-900)',
  '--color-accent-muted': 'var(--ramp-accent-700)',
});

writeFileSync(SRC, header + JSON.stringify(obj, null, 2) + ';\n', 'utf8');
console.log('записано: ' + SRC);
console.log('neutral-50/100/200: ' + [NEUTRAL[50], NEUTRAL[100], NEUTRAL[200]].join(', '));
console.log('accent-600 (fill): ' + ACCENT[600] + ', accent-700 (link): ' + ACCENT[700]);

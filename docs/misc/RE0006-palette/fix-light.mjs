/* ============================================================
   fix-light.mjs — разовый скрипт RE0006, Э2 (04.10.2026).

   1) Чинит пропущенное в RE0005 точечное правило `.badge--accent`:
      без него общее `.badge { background: var(--color-bg-muted) }`
      (та же специфичность, загружено позже) перебивает
      `.badge--accent { background: var(--primary) }` — плашка
      «Активно» становится бледной с белым текстом.
   2) Возвращает акцент светлой ровно #00AA9B на заливках (кнопка,
      свитч, ссылка, подложки) — решение человека 04.10.2026
      «оставить ровно текущий #00AA9B». Роли задаются ссылками на
      ступени шкалы accent (500 = #00AA9B, 600 = #0A7D6D, 700 = #0A6A5C).
   3) Возвращает exempt ["ibp-light"] для пар, где белый лежит на
      акценте #00AA9B (2.91:1) и на ссылке — как в legacy.

   Источник Themes.tokens.js — window.DS_THEMES (JSON.stringify);
   читается через vm, пишется тем же форматом.

   Запуск: node docs/misc/RE0006-palette/fix-light.mjs
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const SRC = path.join(ROOT, 'design-system/foundations/Themes/Themes.tokens.js');

const text = readFileSync(SRC, 'utf8');
const marker = 'window.DS_THEMES = ';
const at = text.indexOf(marker);
if (at < 0) throw new Error('не найден window.DS_THEMES');
const header = text.slice(0, at + marker.length);

const ctx = { window: {} };
vm.runInNewContext(text, ctx, { filename: SRC });
const obj = ctx.window.DS_THEMES;

/* 1) пропущенное правило .badge--accent */
const hasBadgeAccent = obj.rules.some(
  (r) => r.selector === '.badge--accent' && r.prop === 'background'
);
if (!hasBadgeAccent) {
  const i = obj.rules.findIndex((r) => r.selector === '.badge' && r.prop === 'background');
  const rule = {
    file: 'components/atoms/Badge/Badge.css',
    line: 74,
    selector: '.badge--accent',
    prop: 'background',
    from: 'var(--primary)',
    value: 'var(--color-accent-fill)',
    kind: 'роль',
    why: '',
  };
  obj.rules.splice(i < 0 ? obj.rules.length : i + 1, 0, rule);
}

/* 2) акцент светлой — ровно legacy (#00AA9B и его ступени) */
const lightAccent = {
  '--color-accent-fill': 'var(--ramp-accent-500)',
  '--color-accent-fill-hover': 'var(--ramp-accent-600)',
  '--color-accent-fill-pressed': 'var(--ramp-accent-700)',
  '--color-accent-bg': 'color-mix(in srgb, var(--ramp-accent-500) 8%, transparent)',
  '--color-accent-bg-subtle': 'color-mix(in srgb, var(--ramp-accent-500) 4%, transparent)',
  '--color-accent-bg-hover': 'color-mix(in srgb, var(--ramp-accent-500) 10%, transparent)',
  '--color-accent-bg-pressed': 'color-mix(in srgb, var(--ramp-accent-500) 18%, transparent)',
  '--color-secondary-bg': 'color-mix(in srgb, var(--ramp-accent-200) 32%, transparent)',
  '--color-secondary-bg-subtle': 'color-mix(in srgb, var(--ramp-accent-200) 16%, transparent)',
  '--color-focus-ring': 'var(--ramp-accent-500)',
  '--color-link': 'var(--ramp-accent-500)',
  '--color-link-hover': 'var(--ramp-accent-600)',
  '--color-link-pressed': 'var(--ramp-accent-700)',
};
Object.assign(obj.themeValues['ibp-light'], lightAccent);
/* ошибочные переопределения свитча с прошлого прогона убираем */
delete obj.themeValues['ibp-light']['--color-control-track-on'];
delete obj.themeValues['ibp-light']['--color-control-track-on-hover'];

/* 2b) роль свитча = бледный трек (в legacy --secondary-light = emerald-100,
   hover --secondary = emerald-200), а не сплошной акцент: иначе трек и
   бегунок одного цвета, а на ховере трек становится бледным (--fg-icon). */
obj.values['--color-control-track-on'] = 'var(--ramp-accent-200)';
obj.values['--color-control-track-on-hover'] = 'var(--ramp-accent-300)';

/* 3) пары с белым на #00AA9B и ссылкой — информационные для светлой (как legacy) */
for (const p of obj.contrast) {
  const isAccentFill = p.fg === '--color-fg-on-fill' && p.bg === '--color-accent-fill';
  const isLink = p.fg === '--color-link';
  if ((isAccentFill || isLink) && p.min === 4.5) p.exempt = ['ibp-light'];
}

writeFileSync(SRC, header + JSON.stringify(obj, null, 2) + ';\n', 'utf8');
console.log('записано: ' + SRC);
console.log('правил: ' + obj.rules.length + ' (badge--accent: ' + (hasBadgeAccent ? 'уже было' : 'добавлено') + ')');
console.log('accent-fill светлой: ' + obj.themeValues['ibp-light']['--color-accent-fill']);

/* ============================================================
   theme-values.mjs — разовый сборщик (RE0005, Э3).

   Читает v1 Themes.tokens.js (docs/misc), добавляет к нему
   черновые значения ролей (общие выражения над --ramp-*),
   начальные семена ibp-light и значения графиков, пишет v2 в
   design-system/foundations/Themes/Themes.tokens.js.

   Значения — ЧЕРНОВЫЕ: их пишет этап Э3, чтобы проверить
   механику тем; финальную карту «роль → рампа» утверждает
   дизайнер на Э4. Скрипт не рантайм — прогнан один раз, лежит
   рядом как происхождение решения.

   Запуск из корня проекта: node docs/misc/RE0005-themes/theme-values.mjs
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const V1 = path.join(HERE, 'Themes.tokens.js');
const OUT = path.join(ROOT, 'design-system', 'foundations', 'Themes', 'Themes.tokens.js');

/* v1 — данные, читаем через vm (как это делает генератор) */
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(V1, 'utf8'), ctx, { timeout: 2000 });
const v1 = ctx.window.DS_THEMES;
const roleNames = new Set(Object.keys(v1.roles));

const r = (tone, step) => 'var(--ramp-' + tone + '-' + step + ')';
const m = (tone, step, pct) => 'color-mix(in srgb, var(--ramp-' + tone + '-' + step + ') ' + pct + '%, transparent)';

const V = {};
const R = (name, expr) => {
  if (!roleNames.has(name)) throw new Error('theme-values: роль не из словаря: ' + name);
  if (name in V) throw new Error('theme-values: роль задана дважды: ' + name);
  V[name] = expr;
};

/* --- Фон --- */
R('--color-bg-page', r('neutral', '50'));
R('--color-bg-surface', r('grey', '50'));
R('--color-bg-raised', r('grey', '50'));
R('--color-bg-nav', r('grey', '100'));
R('--color-bg-inverse', r('neutral', '900'));
R('--color-bg-sunken', r('neutral', '100'));
R('--color-bg-muted', r('neutral', '100'));
R('--color-bg-muted-strong', r('neutral', '400'));
R('--color-bg-hover', r('neutral', '100'));
R('--color-bg-pressed', r('neutral', '200'));
R('--color-bg-selected-hover', r('neutral', '200'));
R('--color-bg-tint', m('neutral', '900', 8));
R('--color-bg-tint-subtle', m('neutral', '900', 4));
R('--color-bg-veil', m('grey', '50', 50));
R('--color-bg-scrim', m('neutral', '950', 32));

/* --- Строки таблиц --- */
R('--color-row-hover', r('neutral', '50'));
R('--color-row-selected', r('neutral', '100'));
R('--color-row-selected-hover', r('neutral', '200'));
R('--color-row-accent', r('amber', '50'));
R('--color-row-accent-hover', r('amber', '100'));
R('--color-row-accent-selected', r('amber', '200'));
R('--color-row-pinned', r('neutral', '50'));
R('--color-row-pinned-hover', r('neutral', '100'));
R('--color-row-pinned-selected', r('neutral', '100'));

/* --- Текст и иконки --- */
R('--color-fg-default', r('neutral', '900'));
R('--color-fg-secondary', r('neutral', '600'));
R('--color-fg-muted', r('neutral', '400'));
R('--color-fg-on-fill', r('grey', '50'));
R('--color-fg-inverse', r('grey', '50'));
R('--color-fg-icon', r('accent', '200'));
R('--color-fg-icon-strong', r('accent', '600'));

/* --- Границы --- */
R('--color-border-default', r('neutral', '300'));
R('--color-border-subtle', r('neutral', '200'));
R('--color-border-strong', r('neutral', '500'));

/* --- Акцент --- */
R('--color-accent-fill', r('accent', '600'));
R('--color-accent-fill-hover', r('accent', '700'));
R('--color-accent-fill-pressed', r('accent', '800'));
R('--color-accent-fg', r('accent', '700'));
R('--color-accent-fg-strong', r('accent', '800'));
R('--color-accent-fg-pressed', r('accent', '800'));
R('--color-accent-border', r('accent', '500'));
R('--color-accent-muted', r('accent', '300'));
R('--color-accent-bg', m('accent', '600', 8));
R('--color-accent-bg-subtle', m('accent', '600', 4));
R('--color-accent-bg-hover', m('accent', '600', 10));
R('--color-accent-bg-pressed', m('accent', '600', 18));
R('--color-accent-shadow', m('accent', '950', 24));

/* --- Ссылка --- */
R('--color-link', r('accent', '700'));
R('--color-link-hover', r('accent', '800'));
R('--color-link-pressed', r('accent', '900'));
R('--color-link-muted', r('accent', '300'));

/* --- Вторичный тон --- */
R('--color-secondary-bg', m('accent', '300', 32));
R('--color-secondary-bg-subtle', m('accent', '300', 16));

/* --- Элементы управления --- */
R('--color-control-track', r('neutral', '200'));
R('--color-control-track-hover', r('neutral', '300'));
R('--color-control-track-on', r('accent', '600'));
R('--color-control-track-on-hover', r('accent', '700'));
R('--color-control-thumb', r('grey', '50'));
R('--color-scrollbar', r('neutral', '400'));
R('--color-focus-ring', r('accent', '600'));

/* --- Неактивное --- */
R('--color-disabled-fill', r('neutral', '300'));
R('--color-disabled-border', r('neutral', '200'));
R('--color-disabled-border-subtle', r('neutral', '100'));
R('--color-disabled-bg', r('neutral', '100'));
R('--color-disabled-veil', m('grey', '50', 56));

/* --- Сообщения: danger / warning / success / info --- */
const MSG = [['danger', 'red'], ['warning', 'amber'], ['success', 'light-green'], ['info', 'light-blue']];
for (const [t, tone] of MSG) {
  R('--color-' + t + '-fg', r(tone, '800'));
  R('--color-' + t + '-fg-strong', r(tone, '900'));
  R('--color-' + t + '-fg-pressed', r(tone, '900'));
  if (t !== 'warning') R('--color-' + t + '-fg-inverse', r('grey', '50'));
  R('--color-' + t + '-fill', r(tone, '700'));
  R('--color-' + t + '-fill-hover', r(tone, '800'));
  R('--color-' + t + '-fill-pressed', r(tone, '900'));
  if (t === 'danger' || t === 'warning') R('--color-' + t + '-border', r(tone, '500'));
  R('--color-' + t + '-bg', r(tone, '50'));
}
R('--color-danger-bg-subtle', r('red', '100'));
R('--color-danger-bg-strong', r('red', '200'));

/* --- Статусы --- */
const ST = [['green', 'green'], ['blue', 'light-blue'], ['orange', 'amber'], ['red', 'red'], ['purple', 'deep-purple'],
  ['grey', 'grey'], ['system', 'neutral'], ['disabled', 'neutral'], ['accent', 'accent']];
for (const [t, tone] of ST) {
  R('--color-status-' + t + '-strong', r(tone, '800'));
  R('--color-status-' + t + '-solid', r(tone, '500'));
  R('--color-status-' + t + '-mid', m(tone, '500', 56));
  R('--color-status-' + t + '-soft', m(tone, '500', 32));
  R('--color-status-' + t + '-subtle', m(tone, '500', 16));
}
/* недоступный статус — своя шкала прозрачности, как в legacy (cgrey-600: 40/24/16/8/4) */
for (const [suf, pct] of [['strong', 40], ['solid', 24], ['mid', 16], ['soft', 8], ['subtle', 4]]) {
  V['--color-status-disabled-' + suf] = m('neutral', '600', pct);
}

/* --- Тень --- */
R('--color-shadow', r('neutral', '950'));

/* --- Графики: hex переносится из legacy на Э3, Э5 перекрасит под тёмный --- */
const CHART_ORDER = ['--ch-blue', '--ch-turquoise', '--ch-indigo', '--ch-orange', '--ch-pastel-green', '--ch-purple',
  '--ch-light-blue', '--ch-yellow', '--ch-shiny-green', '--ch-pink-purple', '--ch-red', '--ch-pale-purple'];
const CHART_HEX = ['#5B9CFA', '#31D4A8', '#8D87F9', '#F9A580', '#76E385', '#CB88F8',
  '#7DCAFA', '#FFD081', '#8CCB5E', '#EC7390', '#F99290', '#F58BD8'];
const charts = {};
CHART_ORDER.forEach((_, i) => { charts['--color-chart-' + (i + 1)] = CHART_HEX[i]; });

/* --- Семена: пока только ibp-light (ibp-dark — Э5, service — Э6) --- */
const seeds = {
  'ibp-light': {
    profile: 'light',
    ramps: {
      grey: { h: 0, c: 0.000 },
      neutral: { h: 235, c: 0.020 },
      accent: { h: 175, c: 0.115 },
    },
  },
};

/* --- Проверка полноты: каждая роль словаря имеет значение ---
   Графики живут не в values, а в themeValues[тема] (hex без рамп). */
const inTheme = new Set(Object.values({ 'ibp-light': charts }).flatMap((o) => Object.keys(o)));
const missing = [...roleNames].filter((n) => !(n in V) && !inTheme.has(n));
const extra = Object.keys(V).filter((n) => !roleNames.has(n));
if (missing.length || extra.length) {
  console.error('theme-values: пробелы в карте значений — нет: ' + missing.join(', ') + '; лишние: ' + extra.join(', '));
  process.exit(1);
}

const v2 = {
  version: 2,
  legacy: v1.legacy,
  themes: v1.themes,
  ramps: v1.ramps,
  seeds,
  roles: v1.roles,
  values: V,
  themeValues: { 'ibp-light': charts },
  map: v1.map,
  elevation: v1.elevation,
  rules: v1.rules,
  pages: v1.pages,
  keep: v1.keep,
};

const header = `/* ============================================================
   Themes.tokens.js — источник тем ДС (RE0005). v2, Э3 (02.10.2026):
   роли, карта 119 имён, точечные правила, правила страниц,
   «не перекрашивается», семена рамп, значения ролей (черновые) и
   значения графиков. Файл читают Node (vm) и страница (тег), как
   icons-data.js. С Э3 это источник: правится руками, а Themes.css
   пересобирает генератор tools/theme-build.mjs.

   Формат:
   - seeds[тема].ramps — семена { h, c } для новых рамп; тона
     legacy (amber…yellow) переносятся генератором из Colors.css;
   - values[роль] — выражение над --ramp-*, одинаковое для всех
     новых тем (значения рамп у темы свои);
   - themeValues[тема][роль] — значения без рамп (графики: hex);
   - roles / map / elevation / rules / pages / keep — как в v1.
   ============================================================ */
`;

fs.writeFileSync(OUT, header + 'window.DS_THEMES = ' + JSON.stringify(v2, null, 2) + ';\n', 'utf8');
console.log('theme-values: ролей ' + Object.keys(V).length + '/' + roleNames.size + ', правил ' + v2.rules.length +
  ', страниц style/block ' + v2.pages.style.length + '/' + v2.pages.block.length + ' → ' + path.relative(ROOT, OUT).split(path.sep).join('/'));

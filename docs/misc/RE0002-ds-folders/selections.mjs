#!/usr/bin/env node
// RE0002, этап Э1 — состав выборок: старая регулярка по диску против модуля путей
// (разовый скрипт, удаляется на Э3). Эталонные выводы не отличают «чисто» от «не
// проверялось»: у правила без находок сужение выборки вывода не меняет. Здесь
// каждая выборка, которую инструменты брали префиксом папки, сверяется по составу.
// Работает только на старой раскладке — она и описана регулярками.
//
//   node docs/misc/RE0002-ds-folders/selections.mjs
//
// Строка «−» — файл выпал из выборки (сужение), «+» — добавился (расширение).

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const DS = 'design-system';
const { layout } = await import(pathToFileURL(path.join(ROOT, DS, 'tools/ds-paths.mjs')).href);
const L = layout(path.join(ROOT, DS));

const files = execFileSync('git', ['ls-files', DS], { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter(Boolean).map((f) => f.slice(DS.length + 1));
const LINTER = 'scripts/ds-lint.js';
const pick = (rx) => files.filter((f) => rx.test(f));

let narrowed = 0;
function cmp(title, before, after, why = '') {
  const a = new Set(before), b = new Set(after);
  const lost = [...a].filter((x) => !b.has(x)).sort();
  const got = [...b].filter((x) => !a.has(x)).sort();
  narrowed += lost.length;
  console.log((lost.length ? 'СУЖЕНИЕ  ' : got.length ? 'шире     ' : 'то же    ') + title + ' — было ' + a.size + ', стало ' + b.size + (why ? ' · ' + why : ''));
  for (const x of lost) console.log('    − ' + x);
  for (const x of got) console.log('    + ' + x);
}

const kind = (f) => L.kindOf(f) || {};
const pageNames = L.pages();

// ds-lint.js, spec-audit, layout-check, proto-panel
cmp('стили ДС (styles/*.css)', pick(/^styles\/.+\.css$/), L.styles());
cmp('скрипты ДС, линтер добавлен явно (scripts/*.js)', pick(/^scripts\/.+\.js$/), [...L.scripts(), L.at.linter]);
cmp('скрипты ДС без линтера (B10, runtimeApiCheck)', pick(/^scripts\/.+\.js$/).filter((f) => !/ds-lint/.test(f)), L.scripts().filter((f) => !/ds-lint/.test(f)));
cmp('B9: рантаймы, оборачивающие разметку (линтер добавлен явно)', pick(/^scripts\/(ds-|tbl-|input-kit).*\.js$/), [...L.runtimes(), L.at.linter],
  'шире — оболочка документации и ibp-home.js');
cmp('сценарии страниц (*.page.js)', pick(/^scripts\/.+\.page\.js$/), L.pageScripts());
cmp('runtimeJs паритета (без icons-data и линтера)', pick(/^scripts\/.+\.js$/).filter((f) => !/icons-data|ds-lint/.test(f)),
  L.scripts().filter((f) => !/icons-data|ds-lint/.test(f)));
cmp('спеки (specs/*.md)', pick(/^specs\/[^/]+\.md$/), L.specs());
cmp('страницы (pages/**/*.html)', pick(/^pages\/.+\.html$/), pageNames.map((p) => p.rel));
for (const [title, dirs, cats] of [
  ['контракт разделов', ['pages/atoms/', 'pages/molecules/', 'pages/organisms/'], ['atoms', 'molecules', 'organisms']],
  ['реестры D1–D9', ['pages/foundations/', 'pages/atoms/', 'pages/molecules/', 'pages/organisms/'], ['foundations', 'atoms', 'molecules', 'organisms']],
]) {
  cmp(title, pick(/\.html$/).filter((f) => dirs.some((d) => f.startsWith(d))), pageNames.filter((p) => cats.includes(p.category)).map((p) => p.rel));
}
cmp('A8: страницы ДС', pick(/^pages\//).filter((f) => f.endsWith('.html')), files.filter((f) => kind(f).kind === 'page'));
for (const cat of ['atoms', 'molecules', 'organisms', 'foundations']) {
  cmp('счётчик ' + cat + ' (шапка главной, README)', pick(new RegExp('^pages/' + cat + '/[^/]+\\.html$')), pageNames.filter((p) => p.category === cat).map((p) => p.rel));
}
// proto-panel: стили и скрипты без icons-data
cmp('корпус панели прототипа', pick(/^(styles|scripts)\/[^/]+\.(css|js)$/).filter((f) => !f.endsWith('/icons-data.js')),
  [...L.styles(), ...L.scripts(), L.at.linter].filter((f) => f !== L.at.iconsData));
// сенсор: токены
cmp('токены сенсора', ['styles/spacing.css', 'styles/layout.css', 'styles/tile.css', 'styles/nav-panel.css'],
  ['Spacing', 'Layout', 'Tile', 'NavPanel'].flatMap((n) => L.cssOf(n)));
// витрина
cmp('стили страницы витрины', ['splitter.css', 'segment-control.css', 'tab.css', 'docs-split.css', 'ds-docs.css'].map((f) => 'styles/' + f),
  [...['Splitter', 'SegmentControl', 'Tab'].flatMap((n) => L.cssOf(n)), L.at.docsSplitCss, L.at.docsCss]);

// маршруты гейта: вид каждого файла ДС по старым префиксам и по модулю
const oldRoute = (f) => {
  const r = [];
  if (/^pages\/(atoms|molecules|organisms|foundations)\/[^/]+\.html$/.test(f) || f === 'scripts/icons-data.js') r.push('readme-stats');
  if (['ds-icons.js', 'icons-data.js', 'ds.js', 'ds-icon.mjs'].some((x) => f === 'scripts/' + x)) r.push('icons');
  if (/^pages\/.+\.html$/.test(f)) r.push('lint-page');
  if (/^scripts\/[^/]+\.page\.js$/.test(f)) r.push('page-js');
  else if (f === LINTER || f === 'scripts/ds-lint-cli.mjs') r.push('linter');
  else if (f === 'scripts/spec-audit.mjs') r.push('audit');
  else if (/^scripts\/[^/]+\.js$/.test(f)) r.push('script');
  if (f.startsWith('styles/') || f === 'ds.css') r.push('style');
  if (f.startsWith('specs/')) r.push('spec');
  if (['index.html', 'MAINTAINING.md', 'CHANGELOG.md', 'scripts/ds-home.mjs'].includes(f)) r.push('global');
  return r.join(' ');
};
const newRoute = (f) => {
  const k = kind(f), r = [];
  if ((k.kind === 'page' && ['atoms', 'molecules', 'organisms', 'foundations'].includes(k.category)) || f === L.at.iconsData) r.push('readme-stats');
  if ([L.at.iconsRuntime, L.at.iconsData, L.at.entryJs, L.at.iconTool].includes(f)) r.push('icons');
  if (k.kind === 'page') r.push('lint-page');
  if (k.kind === 'script' && k.role === 'page-script') r.push('page-js');
  else if (f === L.at.linter || f === L.at.lintCli) r.push('linter');
  else if (f === L.at.specAudit) r.push('audit');
  else if (k.kind === 'script') r.push('script');
  if (k.kind === 'style' || f === L.at.bundleCss) r.push('style');
  if (k.kind === 'spec') r.push('spec');
  if ([L.at.home, 'MAINTAINING.md', 'CHANGELOG.md', L.at.homeTool].includes(f)) r.push('global');
  return r.join(' ');
};
const routeDiff = files.filter((f) => oldRoute(f) !== newRoute(f));
narrowed += routeDiff.length;
console.log((routeDiff.length ? 'РАЗНИЦА  ' : 'то же    ') + 'маршруты гейта по виду файла — файлов ДС ' + files.length + ', расхождений ' + routeDiff.length);
for (const f of routeDiff) console.log('    ' + f + ': было «' + oldRoute(f) + '», стало «' + newRoute(f) + '»');

console.log('');
console.log(narrowed ? 'ИТОГ: сужений и расхождений маршрутов — ' + narrowed + ' (разобрать каждое)' : 'ИТОГ: сужений нет');

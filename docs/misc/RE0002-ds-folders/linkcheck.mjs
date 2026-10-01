#!/usr/bin/env node
// RE0002 — проверка локальных ссылок (разовый скрипт, удаляется на Э3).
// Снимок «до» на Э0, сравнение «после» на Э2: битых не должно прибавиться.
//
//   node docs/misc/RE0002-ds-folders/linkcheck.mjs [--out <файл>]
//
// Что проверяется (раздел 8, Э0 п. 4):
//   · .html и .css ДС, приложений, витрины, хаба: href=, src=, url(), @import;
//   · ds.js — список FILES (от папки ds.js; после переезда — от корня ДС);
//   · ds-nav.js — пункты навигации (от корня ДС);
//   · самоподключение CSS в скриптах оболочки: (window.__DS_ROOT || '') + '<путь>';
//   · ссылки на страницы в сценариях страниц *.page.js — от папки своей страницы;
//   · data-ds экранов и загрузчика — от корня ДС.
// Динамические значения (с «'+», «${», «{{») пропускаются — их ловит ручной просмотр.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const DS = 'design-system';
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const OUT = arg('--out') || path.join(HERE, 'linkcheck-before.txt');

const tracked = execFileSync('git', ['ls-files', '-co', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter(Boolean).filter((f) => existsSync(path.join(ROOT, f)));
const inScope = (f) => (f.startsWith(DS + '/') || f.startsWith('apps/') || f === 'index.html')
  && !f.startsWith(DS + '/uploads/') && !f.startsWith('docs/');

const broken = [];
let checked = 0;
const byKind = {};
const lineOf = (text, idx) => text.slice(0, idx).split('\n').length;
const isDynamic = (v) => /['"+`]|\$\{|\{\{|<|^\s*$/.test(v);
const isExternal = (v) => /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\?)/i.test(v);
function check(from, line, base, raw, how) {
  if (isExternal(raw) || isDynamic(raw)) return;
  let v = raw.split('#')[0].split('?')[0];
  if (!v) return;
  try { v = decodeURIComponent(v); } catch { /* как есть */ }
  const target = path.resolve(path.join(ROOT, base), v);
  checked++; byKind[how] = (byKind[how] || 0) + 1;
  if (!existsSync(target)) broken.push(`${from}:${line} [${how}] ${raw}`);
}

const ATTR = /\s(?:href|src)\s*=\s*"([^"]*)"|\s(?:href|src)\s*=\s*'([^']*)'/g;
const URL_FN = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
const IMPORT = /@import\s+(['"])([^'"]+)\1/g;
const DATA_DS = /data-ds\s*=\s*"([^"]*)"/g;

for (const f of tracked.filter(inScope)) {
  const dir = path.posix.dirname(f);
  if (/\.(html|css)$/.test(f)) {
    const text = readFileSync(path.join(ROOT, f), 'utf8');
    if (f.endsWith('.html')) for (const m of text.matchAll(ATTR)) check(f, lineOf(text, m.index), dir, m[1] ?? m[2], 'attr');
    for (const m of text.matchAll(URL_FN)) check(f, lineOf(text, m.index), dir, m[2], 'url');
    for (const m of text.matchAll(IMPORT)) check(f, lineOf(text, m.index), dir, m[2], 'import');
    for (const m of text.matchAll(DATA_DS)) for (const p of m[1].split(/\s+/).filter(Boolean)) check(f, lineOf(text, m.index), DS, p, 'data-ds');
  }
}

// Рантаймы ДС: ds.js там, где он лежит (scripts/ds.js до переезда, ds.js после).
const dsJs = [DS + '/scripts/ds.js', DS + '/ds.js'].find((p) => existsSync(path.join(ROOT, p)));
{
  const text = readFileSync(path.join(ROOT, dsJs), 'utf8');
  const list = text.match(/var FILES = \[([\s\S]*?)\]/);
  if (!list) throw new Error('в ds.js не найден список FILES');
  for (const m of list[1].matchAll(/'([^']+)'/g)) check(dsJs, lineOf(text, list.index + m.index), path.posix.dirname(dsJs), m[1], 'ds.js FILES');
}
const findDs = (name) => tracked.find((f) => f.startsWith(DS + '/') && path.posix.basename(f) === name);
{
  const nav = findDs('ds-nav.js');
  const text = readFileSync(path.join(ROOT, nav), 'utf8');
  let n = 0;
  for (const m of text.matchAll(/href:\s*'([^']+)'/g)) { check(nav, lineOf(text, m.index), DS, m[1], 'ds-nav'); n++; }
  if (!n) throw new Error('в ds-nav.js не найдено ни одного пункта навигации');
}
for (const f of tracked.filter((x) => x.startsWith(DS + '/') && x.endsWith('.js'))) {
  const text = readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of text.matchAll(/\(window\.__DS_ROOT \|\| ''\) \+ '([^']+)'(\s*\+\s*f)?/g)) {
    if (m[2]) {
      // docs-split.js: префикс + имя файла из соседнего списка ['a.css', 'b.css']
      const around = text.slice(Math.max(0, m.index - 600), m.index);
      const arr = [...around.matchAll(/\[((?:\s*'[^']+\.css',?)+)\s*\]/g)].pop();
      if (!arr) { broken.push(`${f}:${lineOf(text, m.index)} [self-css] список файлов не найден`); continue; }
      for (const x of arr[1].matchAll(/'([^']+)'/g)) check(f, lineOf(text, m.index), DS, m[1] + x[1], 'self-css');
    } else check(f, lineOf(text, m.index), DS, m[1], 'self-css');
  }
}
// Сценарии страниц: ссылки на страницы — от папки страницы, которая их подключает.
for (const page of tracked.filter((x) => x.startsWith(DS + '/') && x.endsWith('.html'))) {
  const text = readFileSync(path.join(ROOT, page), 'utf8');
  for (const m of text.matchAll(/src="([^"]+\.page\.js)"/g)) {
    const js = path.posix.normalize(path.posix.join(path.posix.dirname(page), m[1]));
    if (!existsSync(path.join(ROOT, js))) continue; // битая ссылка уже учтена выше
    const src = readFileSync(path.join(ROOT, js), 'utf8');
    for (const h of src.matchAll(/href="([^"'+]+\.html(?:#[^"]*)?)"/g)) check(js + ' (из ' + page + ')', lineOf(src, h.index), path.posix.dirname(page), h[1], 'page.js');
    // таблицы ссылок строками: ['InputAutocomplete', '../molecules/InputAutocomplete.html', …]
    for (const h of src.matchAll(/'([\w./-]+\.html(?:#[\w-]*)?)'/g)) check(js + ' (из ' + page + ')', lineOf(src, h.index), path.posix.dirname(page), h[1], 'page.js');
  }
}
// Загрузчик: ds.js и примеры data-ds — от корня ДС.
{
  const body = 'apps/ds-body.js';
  const text = readFileSync(path.join(ROOT, body), 'utf8');
  const tags = text.match(/var tags = \['([^']+)'\]/);
  if (!tags) throw new Error('в ds-body.js не найден ds.js');
  check(body, lineOf(text, tags.index), DS, tags[1], 'ds-body');
}

broken.sort();
const report = [`проверено ссылок: ${checked}`, `по видам: ${Object.entries(byKind).sort().map(([k, v]) => k + " " + v).join(" · ")}`, `битых: ${broken.length}`, '', ...broken, ''].join('\n');
writeFileSync(OUT, report);
console.log(`проверено ${checked} · битых ${broken.length} → ${path.relative(ROOT, OUT).split(path.sep).join('/')}`);

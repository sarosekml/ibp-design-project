#!/usr/bin/env node
/* ============================================================
   INJECT-THEME-TAG — разовый скрипт задачи RE0005 (Э3.2).
   Ставит служебный тег темы последним в <head> каждой страницы
   документации ДС:

     <script src="<путь до корня ДС>/docs-kit/ds-theme-boot.js"></script>

   Страница ДС = html-файл design-system/ с подключённым `docs-kit/ds-nav.js`
   (64 страницы компонентов/основ/паттернов/концептов + главная ДС index.html).
   Папки fixtures/ и templates/ исключены — это не страницы документации.

   Тег идемпотентен: страница с уже вставленным тегом пропускается.
   EOL файла сохраняется.

   Использование (из корня проекта):
     node docs/misc/RE0005-themes/inject-theme-tag.mjs           — вставить
     node docs/misc/RE0005-themes/inject-theme-tag.mjs --check   — только сверить
   Строка `ВЕРДИКТ: OK | FAIL`.
   ============================================================ */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DS = path.join(ROOT, 'design-system');
const FILE = 'docs-kit/ds-theme-boot.js';
const MARK = 'ds-theme-boot.js';
const check = process.argv.includes('--check');

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) {
      if (name === 'fixtures' || name === 'templates') continue;
      walk(abs, out);
    } else if (name.endsWith('.html')) {
      out.push(abs);
    }
  }
  return out;
}

const pages = walk(DS, []).filter((abs) => readFileSync(abs, 'utf8').includes('docs-kit/ds-nav.js'));
const missing = [];
let changed = 0, skipped = 0;

for (const abs of pages.sort()) {
  const text = readFileSync(abs, 'utf8');
  const rel = path.relative(path.dirname(abs), DS).split(path.sep).join('/');
  const src = (rel ? rel + '/' : '') + FILE;
  const tag = '<script src="' + src + '"></script>';
  if (text.includes(MARK)) { skipped++; continue; }
  const at = text.indexOf('</head>');
  if (at < 0) { missing.push(path.relative(ROOT, abs).split(path.sep).join('/')); continue; }
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const next = text.slice(0, at) + tag + eol + text.slice(at);
  if (!check) writeFileSync(abs, next, 'utf8');
  changed++;
}

if (check) {
  if (missing.length) console.log('FAIL  нет </head>: ' + missing.join(', '));
  console.log('== inject-theme-tag --check ==');
  console.log('страниц ДС: ' + pages.length + ', тег стоит: ' + skipped + ', без тега: ' + changed);
  console.log('ВЕРДИКТ: ' + (changed || missing.length ? 'FAIL' : 'OK'));
  process.exit(changed || missing.length ? 1 : 0);
}

console.log('== inject-theme-tag ==');
console.log('страниц ДС: ' + pages.length + ', вставлен тег: ' + changed + ', уже был: ' + skipped + (missing.length ? ', без </head>: ' + missing.join(', ') : ''));
console.log('ВЕРДИКТ: ' + (missing.length ? 'FAIL' : 'OK'));
process.exit(missing.length ? 1 : 0);

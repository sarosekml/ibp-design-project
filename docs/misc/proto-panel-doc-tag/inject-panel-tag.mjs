#!/usr/bin/env node
/* ============================================================
   INJECT-PANEL-TAG — разовый скрипт: тег включателя панели прототипа
   последним в <body> каждой страницы документации ДС:

     <script src="<путь до корня проекта>/apps/proto-panel.js"></script>

   Так панель (Alt+Shift+P) есть и на страницах ДС: без приложения она
   показывает заглушку, стили и рантаймы ДС добирает сам включатель.
   Ставится ПОСЛЕ скриптов страницы, чтобы document.write включателя не
   задвоил уже загруженные рантаймы (он сверяется с ними по DOM).

   Тег идемпотентен: страница с уже вставленным тегом пропускается.
   EOL файла сохраняется.

   Использование (из корня проекта):
     node docs/misc/proto-panel-doc-tag/inject-panel-tag.mjs           — вставить
     node docs/misc/proto-panel-doc-tag/inject-panel-tag.mjs --check   — сверить
   Строка `ВЕРДИКТ: OK | FAIL`.
   ============================================================ */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DS = path.join(ROOT, 'design-system');
const BOOT = path.join(ROOT, 'apps', 'proto-panel.js');
const MARK = 'apps/proto-panel.js';
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
  if (text.includes(MARK)) { skipped++; continue; }
  const rel = path.relative(path.dirname(abs), BOOT).split(path.sep).join('/');
  const tag = '<script src="' + rel + '"></script>';
  const at = text.lastIndexOf('</body>');
  if (at < 0) { missing.push(path.relative(ROOT, abs).split(path.sep).join('/')); continue; }
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const next = text.slice(0, at) + tag + eol + text.slice(at);
  if (!check) writeFileSync(abs, next, 'utf8');
  changed++;
}

if (check) {
  if (missing.length) console.log('FAIL  нет </body>: ' + missing.join(', '));
  console.log('== inject-panel-tag --check ==');
  console.log('страниц ДС: ' + pages.length + ', тег стоит: ' + skipped + ', без тега: ' + changed);
  console.log('ВЕРДИКТ: ' + (changed || missing.length ? 'FAIL' : 'OK'));
  process.exit(changed || missing.length ? 1 : 0);
}

console.log('== inject-panel-tag ==');
console.log('страниц ДС: ' + pages.length + ', вставлен тег: ' + changed + ', уже был: ' + skipped + (missing.length ? ', без </body>: ' + missing.join(', ') : ''));
console.log('ВЕРДИКТ: ' + (missing.length ? 'FAIL' : 'OK'));
process.exit(missing.length ? 1 : 0);

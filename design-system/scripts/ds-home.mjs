#!/usr/bin/env node
/* ============================================================
   DS-HOME — шапка главной ДС (index.html) из данных ДС.

   Строку «Версия М.ммм · обновлено ДД.ММ.ГГГГ» и счётчик «Компоненты» в
   герое index.html руками не правят. Их выводит homeMeta() в ds-lint.js:
   дата — последний раздел CHANGELOG.md, версия — последняя метка
   «· ДС М.ммм» в заголовке раздела плюс 0.001 за каждый более поздний
   день журнала, счётчик — страницы pages/atoms|molecules|organisms.
   Расхождение ловит правило D9 линтера; эта команда переписывает обе
   строки по тому же выводу и больше ничего в файле не трогает.

     node scripts/ds-home.mjs           — переписать шапку
     node scripts/ds-home.mjs --check   — только сверить (код 1 при расхождении)

   Когда запускать: после записи в CHANGELOG.md и после добавления или
   удаления страницы компонента. Правило версии — MAINTAINING.md,
   «Версионирование».
   ============================================================ */
import { readFile as fsReadFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

// хелперы в том же контракте, что у ds-lint-cli.mjs: пути от корня ДС
const readFile = (p) => fsReadFile(path.join(ROOT, p), 'utf8');
const ls = async (dir) => (await readdir(path.join(ROOT, dir || '.'), { withFileTypes: true }))
  .map((e) => (e.isDirectory() ? e.name + '/' : e.name));

const src = await readFile('scripts/ds-lint.js');
const { homeMeta, homeApply } = new Function('readFile', 'ls', src + ';return dsLint;')(readFile, ls);

const meta = await homeMeta();
if (!meta.ver) {
  console.log('ОШИБКА: в CHANGELOG.md нет базы версии ДС — метки в заголовке раздела вида «## ДД.ММ.ГГГГ · ДС 1.000»');
  process.exit(1);
}

const html = await readFile('index.html');
const { html: next, diffs } = homeApply(html, meta);
const lost = diffs.filter(([, was]) => was === null);
if (lost.length) {
  for (const [what] of lost) console.log('ОШИБКА: index.html — в шапке нет места под «' + what + '» (<p class="ver"> или «Компоненты» в .meta)');
  process.exit(1);
}
if (!diffs.length) {
  console.log('ds-home: шапка index.html актуальна — ' + meta.ver + ' · ' + meta.comps);
  process.exit(0);
}
for (const [what, was, want] of diffs) console.log((check ? 'РАСХОЖДЕНИЕ' : 'обновлено') + ': ' + what + ' «' + was + '» → «' + want + '»');
if (check) {
  console.log('Запусти node scripts/ds-home.mjs без --check.');
  process.exit(1);
}
await writeFile(path.join(ROOT, 'index.html'), next, 'utf8');

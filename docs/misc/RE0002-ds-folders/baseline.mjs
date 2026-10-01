#!/usr/bin/env node
// RE0002 — эталонные выводы инструментов (разовый скрипт, удаляется на Э3).
// Снимает полный текст выводов, а не вердикты (раздел 7 задачи): «чисто» и
// «не проверялось» по вердикту неотличимы.
//
//   node docs/misc/RE0002-ds-folders/baseline.mjs [--out <папка>] [--only <подстрока>]
//
// По умолчанию пишет в baseline/ рядом со скриптом. Пути инструментов и
// образцов для gate --changed заданы старой раскладкой; если файла по старому
// пути нет — берётся новый из move-map.json. Поэтому тот же скрипт снимает
// «после» на Э1 и Э2, а имена выходных файлов не меняются и сравниваются diff-ом.
// Код выхода каждой команды — первой строкой файла.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const DS_REL = 'design-system';
const DS = path.join(ROOT, DS_REL);
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const OUT = path.resolve(arg('--out') || path.join(HERE, 'baseline'));
const ONLY = arg('--only');
const MAP = JSON.parse(readFileSync(path.join(HERE, 'move-map.json'), 'utf8'));
const fwd = new Map(MAP.moves.map((m) => [m.from, m.to]));

// Путь от корня ДС: старый, если файл на месте, иначе — по карте.
const ds = (old) => (existsSync(path.join(DS, old)) || !fwd.has(old) ? old : fwd.get(old));
const dsRoot = (old) => DS_REL + '/' + ds(old);

const jobs = []; // { name, cwd, args }
const add = (name, cwd, ...args) => jobs.push({ name, cwd, args });

// 1. Инструменты ДС (из корня ДС, как в design-system/AGENTS.md §7).
add('ds-check--all', DS, ds('scripts/ds-check.mjs'), '--all');
add('ds-lint-cli--global', DS, ds('scripts/ds-lint-cli.mjs'));
add('ds-lint-cli--parity', DS, ds('scripts/ds-lint-cli.mjs'), '--parity');
add('spec-audit', DS, ds('scripts/spec-audit.mjs'));
add('ds-icon--selftest', DS, ds('scripts/ds-icon.mjs'), '--selftest');
add('ds-home--check', DS, ds('scripts/ds-home.mjs'), '--check');

// Линтер постранично — полный отчёт каждой страницы документации.
const pages = MAP.moves.filter((m) => /^pages\/.+\.html$/.test(m.from)).map((m) => m.from).sort();
for (const p of pages) add('lint-page__' + p.replace(/\//g, '__'), DS, ds('scripts/ds-lint-cli.mjs'), ds(p));

// 2. Сенсор по каждому экрану приложений (витрина — вне: её сенсор не обходит).
const screens = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    const rel = path.relative(ROOT, abs).split(path.sep).join('/');
    if (e.isDirectory()) { if (rel !== 'apps/local-components' && e.name !== 'node_modules') walk(abs); continue; }
    if (/\/pages\/[^/]+\.html$/.test(rel)) screens.push(rel);
  }
})(path.join(ROOT, 'apps'));
for (const s of screens.sort()) add('sensor__' + s.replace(/\//g, '__'), ROOT, '.agents/tools/layout-check.mjs', s);

// 3. Журнал уроков и сторожа.
const LC = '.agents/tools/lessons-cli.mjs';
add('lessons-verify', ROOT, LC, 'verify');
add('lessons-anchors', ROOT, LC, 'anchors');
add('lessons-check', ROOT, LC, 'check');
add('lessons-coverage', ROOT, LC, 'coverage');
add('sensor--etalons', ROOT, '.agents/tools/layout-check.mjs', '--etalons');

// 4. Генераторы и сторожа оснастки — --check.
for (const t of ['boot-build', 'hub-build', 'kit-build', 'docs-index', 'module-readme', 'readme-stats', 'assemble', 'proto-panel']) {
  add(t + '--check', ROOT, `.agents/tools/${t}.mjs`, '--check');
}
add('registry-check', ROOT, '.agents/tools/registry-check.mjs');
add('manifest-check', ROOT, '.agents/tools/manifest-check.mjs');
// docs-split map режима --dry не имеет (пишет pages-index.md) — генерат сверяется git diff-ом на Э3.

// 5. Маршрутизация гейта: какие шаги вызывает правка файла каждого вида.
const SAMPLES = [
  'styles/tooltip.css', 'scripts/ds-tooltip.js', 'scripts/tooltip.page.js', 'pages/molecules/Tooltip.html', 'specs/Tooltip.md',
  'styles/input.css', 'scripts/ds-input.js', 'scripts/input-kit.js', 'scripts/input-text.page.js', 'pages/molecules/InputText.html', 'specs/InputText.md',
  'pages/atoms/Avatar.html', 'pages/organisms/Table.html', 'scripts/tbl-pin.js', 'styles/table-settings.css',
  'styles/colors.css', 'styles/typography.css', 'pages/foundations/Colors.html', 'specs/Colors.md', 'scripts/ds-scroll.js', 'scripts/layout.page.js',
  'pages/patterns/LocalComponents.html', 'pages/rnd/Backlog.html',
  'styles/docs-split.css', 'scripts/docs-split.js', 'scripts/ds-nav.js', 'scripts/image-slot.js',
  'scripts/ds-float.js', 'scripts/ds-notify.js',
  'scripts/ds.js', 'scripts/icons-data.js', 'scripts/ds-icons.js', 'specs/Icons.md',
  'scripts/ds-lint.js', 'scripts/ds-lint-cli.mjs', 'scripts/spec-audit.mjs', 'scripts/ds-icon.mjs', 'scripts/ds-home.mjs', 'scripts/ds-check.mjs', 'scripts/kit-link.mjs',
  'scripts/ibp-home.js', 'fonts/SBSansText-Regular.otf',
  // остаются на месте — маршрут не должен измениться
  'fixtures/A1.bad.html', 'index.html', 'AGENTS.md', 'MAINTAINING.md', 'CHANGELOG.md', 'ds.css',
  'specs/_index.md', 'specs/_cheatsheet.md', 'specs/_runtime-hooks.md', 'templates/screen/Screen.html',
  'assets/illustrations/deals.svg',
];
for (const s of SAMPLES) add('gate-route__' + s.replace(/\//g, '__'), ROOT, LC, 'gate', '--dry', '--changed', dsRoot(s));

mkdirSync(OUT, { recursive: true });
let n = 0;
for (const j of jobs) {
  if (ONLY && !j.name.includes(ONLY)) continue;
  let out = '', code = 0;
  try {
    out = execFileSync(process.execPath, j.args, { cwd: j.cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 600000, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    out = String(e.stdout || '') + String(e.stderr || '');
    code = typeof e.status === 'number' ? e.status : 1;
  }
  writeFileSync(path.join(OUT, j.name + '.txt'), `код ${code}\n` + out);
  n++;
}
console.log(`снято выводов: ${n} → ${path.relative(ROOT, OUT).split(path.sep).join('/')}`);

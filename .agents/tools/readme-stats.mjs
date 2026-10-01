#!/usr/bin/env node
/* ============================================================
   README-STATS — строка счётчиков в корневом README.md.
   Зачем (решение владельца 01.10.2026). Под заголовком README стоят четыре
   числа: компоненты и основы ДС, глифы, иллюстрации, модули приложений.
   Набитые руками, они разошлись с диском («58 компонентов и основ ДС» при
   59 страницах) — README никто не обновляет, когда в ДС появляется
   страница или в apps/ модуль. Поэтому строка — генерат: блок между метками
   `<!-- @stats … -->` и `<!-- /@stats -->` пишет этот инструмент, гейт (шаг
   `readme-stats`) сверяет его с диском. Текст вокруг блока — ручной.
   Что считается (пути — из project.json, имени ДС инструмент не знает):
     компоненты и основы — страницы `pages/{atoms,molecules,organisms,foundations}/*.html` ДС;
     глифы — ключи `window.DS_ICONS` в `scripts/icons-data.js` ДС;
     иллюстрации — `*.svg` в `assets/illustrations/` ДС;
     модули — `apps/<раздел>/<имя>-app/` (тот же обход, что у module-readme).
   Коды РС — «README: счётчики»:
     РС1 в README нет блока счётчиков (меток @stats) или нет самого README;
     РС2 счётчики разошлись с диском: в ДС или apps/ что-то добавили или
         удалили, а README не обновлён.
   Использование:
     node readme-stats.mjs              — переписать блок счётчиков
     node readme-stats.mjs --check      — сверить (гейт, шаг readme-stats)
     node readme-stats.mjs --selftest   — откат на временном дереве
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { project, need } from './project.mjs';
import { modulesOf } from './module-readme.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SELF = path.resolve(fileURLToPath(import.meta.url));
const GEN = 'readme-stats.mjs';
const README = 'README.md';
const OPEN_RX = /<!-- @stats\b[^>]*-->/;
const CLOSE = '<!-- /@stats -->';
const PAGE_GROUPS = ['atoms', 'molecules', 'organisms', 'foundations'];

/* Склонение: 1 компонент, 2 компонента, 5 компонентов. */
function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b === 1) return one;
  if (b >= 2 && b <= 4) return few;
  return many;
}

function filesIn(dir, rx) {
  try { return readdirSync(dir, { withFileTypes: true }).filter((e) => e.isFile() && rx.test(e.name)).length; } catch { return 0; }
}

/* Число глифов: icons-data.js выполняется в песочнице с заглушкой window. */
function glyphs(dsAbs) {
  const file = path.join(dsAbs, 'scripts', 'icons-data.js');
  if (!existsSync(file)) return 0;
  const sandbox = { window: {} };
  sandbox.self = sandbox.window;
  vm.runInNewContext(readFileSync(file, 'utf8'), sandbox, { filename: file });
  const icons = sandbox.window.DS_ICONS || sandbox.DS_ICONS || {};
  return Object.keys(icons).length;
}

/** Счётчики: { components, glyphs, illustrations, modules }. */
export function countsOf(P) {
  const ds = P.dsAbs;
  return {
    components: ds ? PAGE_GROUPS.reduce((s, g) => s + filesIn(path.join(ds, 'pages', g), /\.html$/i), 0) : 0,
    glyphs: ds ? glyphs(ds) : 0,
    illustrations: ds ? filesIn(path.join(ds, 'assets', 'illustrations'), /\.svg$/i) : 0,
    modules: modulesOf(P).length,
  };
}

/** Блок счётчиков целиком, с метками. */
export function statsBlock(P, c = countsOf(P)) {
  const tools = P.tools || '.agents/tools';
  return [
    '<!-- @stats — счётчики генерирует ' + tools + '/' + GEN + ', руками не править -->',
    '<div align="center">',
    '',
    '| ' + [c.components, c.glyphs, c.illustrations, c.modules].join(' | ') + ' |',
    '|:---:|:---:|:---:|:---:|',
    '| ' + [
      plural(c.components, 'компонент', 'компонента', 'компонентов') + ' и основ ДС',
      plural(c.glyphs, 'глиф', 'глифа', 'глифов'),
      plural(c.illustrations, 'иллюстрация', 'иллюстрации', 'иллюстраций'),
      plural(c.modules, 'модуль', 'модуля', 'модулей') + ' по устройству фронтенда',
    ].join(' | ') + ' |',
    '',
    '</div>',
    CLOSE,
  ].join('\n');
}

function blockAt(text) {
  const open = text.match(OPEN_RX);
  const closeAt = text.indexOf(CLOSE);
  return open && closeAt > open.index ? { from: open.index, to: closeAt + CLOSE.length } : null;
}

export function check(P, write = false) {
  const defects = [];
  const written = [];
  const file = path.join(P.root, README);
  if (!existsSync(file)) return { defects: ['РС1 ' + README + ' — нет файла'], written };
  const text = readFileSync(file, 'utf8');
  const at = blockAt(text);
  if (!at) return { defects: ['РС1 ' + README + ' — нет блока счётчиков (метки @stats): поставьте метки вокруг строки счётчиков и запустите node ' + P.tools + '/' + GEN], written };
  const block = statsBlock(P);
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const want = eol === '\n' ? block : block.replace(/\n/g, eol);
  if (text.slice(at.from, at.to) === want) return { defects, written };
  if (write) {
    writeFileSync(file, text.slice(0, at.from) + want + text.slice(at.to), 'utf8');
    written.push(README);
  } else {
    const c = countsOf(P);
    defects.push('РС2 ' + README + ' — счётчики разошлись с диском (сейчас: ' + c.components + ' · ' + c.glyphs + ' · ' + c.illustrations + ' · ' + c.modules + '): node ' + P.tools + '/' + GEN);
  }
  return { defects, written };
}

function report(title, { defects, written }) {
  const out = ['== ' + title + ' =='];
  for (const w of written) out.push('записан ' + w);
  for (const d of defects) out.push('FAIL  ' + d);
  out.push('ВЕРДИКТ: ' + (defects.length ? 'FAIL (дефектов: ' + defects.length + ')' : 'OK'));
  return out.join('\n');
}

/* ---------------- selftest: откат на временном дереве ---------------- */

function put(root, rel, text) {
  const p = path.join(root, rel);
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, text, 'utf8');
}

const MANIFEST = {
  contract: 1, id: 't', designSystem: { mount: 'ds' }, agentKit: { mount: '.kit', tools: '.kit/tools' },
  hub: { page: 'index.html', registry: 'hub.js' }, apps: { dir: 'apps', manifest: 'app.json' },
  appShape: { pages: 'pages', widgets: 'widgets', data: 'data', refs: 'refs' },
  appPlaces: { moduleSuffix: '-app', drafts: 'drafts' }, tracks: [],
};

function tree(r) {
  put(r, 'project.json', JSON.stringify(MANIFEST));
  put(r, 'ds/pages/atoms/Button.html', '');
  put(r, 'ds/pages/molecules/Tile.html', '');
  put(r, 'ds/pages/foundations/Colors.html', '');
  put(r, 'ds/pages/patterns/Screen.html', '');                 // не компонент и не основа — не считается
  put(r, 'ds/scripts/icons-data.js', 'window.DS_ICONS = {"a":"<svg/>","b":"<svg/>"};\n');
  put(r, 'ds/assets/illustrations/empty.svg', '<svg/>');
  put(r, 'apps/postrade/deals-app/app.json', '{}');
  put(r, 'apps/postrade/drafts/lab/app.json', '{}');            // концепт — не модуль
  put(r, README, '# Проект\n\n<!-- @stats -->\n<!-- /@stats -->\n\nТекст.\n');
}

const CASES = [
  { name: 'собрано — диффа нет', expect: null, build: true },
  { name: 'нет меток', expect: 'РС1 ' + README,
    mutate: (r) => put(r, README, '# Проект\n\n| 1 | 2 |\n') },
  { name: 'новая страница ДС без пересборки', expect: 'РС2 ' + README, build: true,
    mutate: (r) => put(r, 'ds/pages/organisms/NavPanel.html', '') },
  { name: 'новый модуль без пересборки', expect: 'РС2 ' + README, build: true,
    mutate: (r) => put(r, 'apps/core/clients-app/app.json', '{}') },
  { name: 'правка руками внутри блока', expect: 'РС2 ' + README, build: true,
    mutate: (r) => { const f = path.join(r, README); writeFileSync(f, readFileSync(f, 'utf8').replace('| 3 |', '| 4 |'), 'utf8'); } },
  { name: 'новый глиф и пересборка', expect: null, build: true,
    mutate: (r) => { put(r, 'ds/scripts/icons-data.js', 'window.DS_ICONS = {"a":"","b":"","c":""};\n'); check(project(r), true); } },
];

function selftest() {
  const out = ['== ' + GEN + ' --selftest =='];
  let failed = 0;
  for (const c of CASES) {
    const root = mkdtempSync(path.join(os.tmpdir(), 'readme-stats-'));
    try {
      tree(root);
      if (c.build) check(project(root), true);
      if (c.mutate) c.mutate(root);
      const { defects } = check(project(root));
      const pass = c.expect === null ? defects.length === 0 : defects.some((d) => d.startsWith(c.expect));
      if (!pass) failed++;
      out.push((pass ? 'ok    ' : 'FAIL  ') + c.name + ' — ' + (defects.length ? defects.join(' | ') : 'дефектов нет'));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
  /* Содержимое: числа, склонение, текст вокруг блока не тронут. */
  const root = mkdtempSync(path.join(os.tmpdir(), 'readme-stats-'));
  try {
    tree(root);
    check(project(root), true);
    const text = readFileSync(path.join(root, README), 'utf8');
    const want = ['# Проект', '| 3 | 2 | 1 | 1 |', 'компонента и основ ДС', '| глифа |', '| иллюстрация |', 'модуль по устройству фронтенда', 'Текст.'];
    const miss = want.filter((w) => !text.includes(w));
    const forms = [[1, 'модуль'], [2, 'модуля'], [5, 'модулей'], [11, 'модулей'], [22, 'модуля'], [59, 'модулей']]
      .filter(([n, w]) => plural(n, 'модуль', 'модуля', 'модулей') !== w).map(([n]) => n);
    if (miss.length || forms.length) failed++;
    out.push((miss.length || forms.length ? 'FAIL  ' : 'ok    ') + 'числа, склонение и текст вокруг блока'
      + (miss.length ? ' — нет: ' + miss.join(' | ') : '') + (forms.length ? ' — склонение для: ' + forms.join(', ') : ''));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  const total = CASES.length + 1;
  out.push('ВЕРДИКТ: ' + (failed ? 'FAIL (кейсов не прошло: ' + failed + ' из ' + total + ')' : 'OK (кейсов: ' + total + ')'));
  console.log(out.join('\n'));
  process.exit(failed ? 1 : 0);
}

/* ---------------- main ---------------- */

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();
  const P = need(GEN, HERE);
  const write = !args.includes('--check');
  const res = check(P, write);
  console.log(report(write ? GEN : GEN + ' --check', res));
  process.exit(res.defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SELF) main();

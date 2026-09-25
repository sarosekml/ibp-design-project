#!/usr/bin/env node
/* ============================================================
   PROMOTE — перенос согласованного концепта в модуль раздела.

   Зачем (решение владельца 23–24.09.2026). Концепт живёт в
   `apps/<раздел>/drafts/<имя>/` в той же форме, что модуль
   `apps/<раздел>/<имя>-app/`, — чтобы после согласования переехать без
   перекладки. Руками такой переезд — это десятки путей: загрузчик ДС и хаб
   становятся на один `../` ближе, метки виджетов соседей, ссылки в
   концепт из других страниц, `file:` в спеках, правило прав агента,
   реестр хаба, README модуля, собранные страницы. Инструмент делает это
   за один шаг; гейт после него проверяет результат (П5, П7, СБ, МР).

   Что делает:
   1. проверяет: источник — концепт раздела с app.json; цель — модуль того
      же раздела (`<имя>-app`); в цели нет своего app.json и нет файлов с
      теми же путями (пустые заготовки `.gitkeep` не в счёт);
   2. переносит файлы концепта в модуль, пути внутри сохраняются
      (`pages/…` → `pages/…`); README концепта становится описанием модуля:
      у заготовки — вместо текста-заготовки, у модуля с содержимым —
      разделом «Из концепта …»; дерево и «Имена фронтенда» остаются;
   3. пересчитывает относительные пути, которые ведут ИЗ перенесённых
      файлов за пределы концепта (загрузчик ДС, хаб, виджеты соседей), и
      пути, которые ведут В концепт из любых файлов проекта (метки
      соседних страниц, ссылки со страниц документации);
   4. заменяет упоминание `apps/<раздел>/drafts/<имя>` путём модуля в
      перенесённых файлах и в конфиге адаптера (правило прав агента);
      остальные файлы с упоминанием печатает списком — их правят по смыслу;
   5. app.json: `id` — имя модуля, трек — прежний или `--track`;
   6. пересобирает реестр хаба, страницы модуля и README модуля; если у
      концепта есть папка панели прототипа (задача 0005), она переезжает
      вместе с остальными файлами, а включатель и зеркало панели
      пересобираются (proto-panel.mjs → build): включатель получает путь
      модуля, зеркало — новый id записи.

   Коды ПР — «перенос»:
     ПР1 цель не модуль того же раздела (`<раздел>/<имя>-app`);
     ПР2 источник не концепт (`<раздел>/drafts/<имя>/` с app.json);
     ПР3 конфликт: у модуля свой app.json или файл с тем же путём.
   При любом ПР ничего не переносится.

   Использование:
     node promote.mjs <концепт> <модуль> [--track product|rnd] [--dry]
     node promote.mjs --selftest   — откат на временном дереве
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync, mkdtempSync, unlinkSync, rmdirSync, cpSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { project, need } from './project.mjs';
import { check as hubCheck } from './hub-build.mjs';
import { run as assembleRun, sourcesUnder } from './assemble.mjs';
import { check as readmeCheck, withTree, treeBlock } from './module-readme.mjs';
import { build as panelBuild, check as panelCheck, enable as panelEnable } from './proto-panel.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SELF = path.resolve(fileURLToPath(import.meta.url));
const slash = (p) => p.split(path.sep).join('/');
const TEXT = /\.(html?|m?js|css|md|json)$/i;
const SKIP = new Set(['node_modules', '.git']);
/* Относительный путь в тексте: цепочка `../` и хвост до кавычки, пробела
   или скобки. Пересчитывается только путь, который ведёт в существующий
   файл, — «../» в прозе не трогается. */
const REL_RX = /(?<![\w/.-])((?:\.\.\/)+[^\s"'`<>()[\]{}|,;*]*)/g;
const inside = (file, dir) => file === dir || file.startsWith(dir + path.sep);

function walkFiles(dir, out = [], skipAbs = new Set()) {
  let list;
  try { list = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of list) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP.has(e.name) || skipAbs.has(p) || (e.name.startsWith('.') && e.name !== '.agents' && e.name !== '.opencode')) continue;
      walkFiles(p, out, skipAbs);
    } else out.push(p);
  }
  return out;
}

/* Пересчитать относительные пути текста: `map(старая цель) → новая цель | null`. */
function rewriteRel(text, oldDir, newDir, map) {
  return text.replace(REL_RX, (tok) => {
    const m = tok.match(/^([^?#]*)([?#].*)?$/);
    let pathPart = m[1];
    const tail = m[2] || '';
    const dot = pathPart.match(/[.,:]+$/);                 // точка в конце предложения — не часть пути
    const trail = dot && !existsSync(path.resolve(oldDir, pathPart)) ? dot[0] : '';
    if (trail) pathPart = pathPart.slice(0, -trail.length);
    const target = path.resolve(oldDir, pathPart);
    if (!existsSync(target)) return tok;
    const next = map(target);
    if (!next) return tok;
    let rel = slash(path.relative(newDir, next)) || '.';
    if (pathPart.endsWith('/') && !rel.endsWith('/')) rel += '/';
    return rel + tail + trail;
  });
}

/* План переноса: { defects, moves: [{ from, to }], conceptAbs, moduleAbs, … }. */
export function plan(P, conceptArg, moduleArg) {
  const defects = [];
  const APPS = path.join(P.root, P.appsDir);
  const drafts = (P.places && P.places.drafts) || 'drafts';
  const suffix = (P.places && P.places.moduleSuffix) || '-app';
  const conceptAbs = path.resolve(P.root, conceptArg);
  const moduleAbs = path.resolve(P.root, moduleArg);
  const c = slash(path.relative(APPS, conceptAbs)).split('/');
  const m = slash(path.relative(APPS, moduleAbs)).split('/');
  const cRel = slash(path.relative(P.root, conceptAbs));
  const mRel = slash(path.relative(P.root, moduleAbs));
  if (c.length !== 3 || c[1] !== drafts || c[0] === '..' || !existsSync(path.join(conceptAbs, P.appsManifest))) {
    defects.push('ПР2 ' + cRel + ' — не концепт: ожидается ' + P.appsDir + '/<раздел>/' + drafts + '/<имя>/ с ' + P.appsManifest);
  }
  if (m.length !== 2 || m[0] === '..' || !m[1].endsWith(suffix) || m[0] !== c[0]) {
    defects.push('ПР1 ' + mRel + ' — не модуль раздела ' + c[0] + ': ожидается ' + P.appsDir + '/' + c[0] + '/<имя>' + suffix + '/');
  }
  if (defects.length) return { defects };
  const files = walkFiles(conceptAbs).filter((f) => path.basename(f) !== '.DS_Store' && path.basename(f) !== '.gitkeep');
  const moves = files.map((from) => ({ from, to: path.join(moduleAbs, path.relative(conceptAbs, from)) }));
  if (existsSync(path.join(moduleAbs, P.appsManifest))) defects.push('ПР3 ' + mRel + '/' + P.appsManifest + ' — у модуля своя запись: слияние двух приложений не делается переносом');
  for (const { to } of moves) {
    if (path.basename(to) === 'README.md' && path.dirname(to) === moduleAbs) continue;   // README сливается
    if (existsSync(to)) defects.push('ПР3 ' + slash(path.relative(P.root, to)) + ' — в модуле уже есть файл с этим путём');
  }
  return { defects, moves, conceptAbs, moduleAbs, cRel, mRel, part: c[0], name: m[1] };
}

/* README модуля после переноса: описание концепта + дерево + имена фронтенда. */
function mergedReadme(moduleText, conceptText, cRel) {
  const treeAt = moduleText.search(/^## Что лежит\s*$/m);
  const tail = treeAt >= 0 ? moduleText.slice(treeAt) : '';
  if (/<!-- @scaffold\b/.test(moduleText) || treeAt < 0 && !moduleText.trim()) {
    return conceptText.trimEnd() + '\n\n' + (tail || '## Что лежит\n');
  }
  const head = treeAt >= 0 ? moduleText.slice(0, treeAt) : moduleText;
  const body = conceptText.replace(/^# .*\n+/, '').replace(/^(#{2,5}) /gm, '#$1 ');
  return head.trimEnd() + '\n\n## Из концепта `' + cRel + '`\n\n' + body.trimEnd() + '\n\n' + tail;
}

export function promote(P, conceptArg, moduleArg, opts = {}) {
  const pl = plan(P, conceptArg, moduleArg);
  const lines = [];
  if (pl.defects.length) return { defects: pl.defects, lines };
  const { moves, conceptAbs, moduleAbs, cRel, mRel } = pl;
  const oldRx = new RegExp(cRel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=[/\\s"\'`)\\]]|$)', 'gm');
  lines.push('перенос ' + cRel + ' → ' + mRel + ': файлов ' + moves.length);
  if (opts.dry) { moves.forEach((mv) => lines.push('  ' + slash(path.relative(P.root, mv.from)) + ' → ' + slash(path.relative(P.root, mv.to)))); return { defects: [], lines }; }

  /* 3а. Файлы проекта вне концепта, которые ссылаются в концепт, — считаются
     ДО переноса: цель должна существовать на диске. */
  const scratch = new Set((P.scratch || []).map((s) => path.join(P.root, s)));
  if (P.stateAbs) scratch.add(P.stateAbs);
  const outsiders = [];
  for (const f of walkFiles(P.root, [], scratch)) {
    if (inside(f, conceptAbs) || !TEXT.test(f)) continue;
    const text = readFileSync(f, 'utf8');
    if (!text.includes('../')) continue;
    const next = rewriteRel(text, path.dirname(f), path.dirname(f), (t) => (inside(t, conceptAbs) ? path.join(moduleAbs, path.relative(conceptAbs, t)) : null));
    if (next !== text) outsiders.push({ f, next });
  }
  /* 3б, 4. Перенесённые файлы: пути наружу — от нового места, упоминания — модулем. */
  const moved = moves.map(({ from, to }) => {
    if (!TEXT.test(from)) return { from, to, text: null };
    let text = readFileSync(from, 'utf8');
    text = rewriteRel(text, path.dirname(from), path.dirname(to), (t) => (inside(t, conceptAbs) ? null : t));
    text = text.replace(oldRx, mRel);
    return { from, to, text };
  });
  /* 2. Перенос. */
  let conceptReadme = null;
  for (const { from, to, text } of moved) {
    if (path.basename(to) === 'README.md' && path.dirname(to) === moduleAbs && existsSync(to)) { conceptReadme = text; unlinkSync(from); continue; }
    mkdirSync(path.dirname(to), { recursive: true });
    const keep = path.join(path.dirname(to), '.gitkeep');
    if (existsSync(keep)) unlinkSync(keep);
    if (text === null) writeFileSync(to, readFileSync(from)); else writeFileSync(to, text, 'utf8');
    unlinkSync(from);
  }
  for (const { f, next } of outsiders) {
    writeFileSync(f, next, 'utf8');
    lines.push('ссылки в концепт пересчитаны: ' + slash(path.relative(P.root, f)));
  }
  /* Пустые каталоги концепта и остатки вроде .DS_Store. */
  rmSync(conceptAbs, { recursive: true, force: true });
  /* README и запись приложения. */
  const readme = path.join(moduleAbs, 'README.md');
  if (conceptReadme !== null) writeFileSync(readme, mergedReadme(readFileSync(readme, 'utf8'), conceptReadme, cRel), 'utf8');
  const mf = path.join(moduleAbs, P.appsManifest);
  const app = JSON.parse(readFileSync(mf, 'utf8'));
  app.id = path.basename(moduleAbs);
  if (opts.track) app.track = opts.track;
  writeFileSync(mf, JSON.stringify(app, null, 2) + '\n', 'utf8');
  lines.push('запись: id «' + app.id + '», трек ' + app.track);
  /* Правило прав агента в конфиге адаптера. */
  if (P.adapterAbs) {
    for (const f of walkFiles(P.adapterAbs).filter((x) => /\.jsonc?$/i.test(x))) {
      const text = readFileSync(f, 'utf8');
      const next = text.replace(oldRx, mRel);
      if (next !== text) { writeFileSync(f, next, 'utf8'); lines.push('правило прав агента: ' + slash(path.relative(P.root, f))); }
    }
  }
  /* 6. Пересборка генератов — до списка упоминаний: реестр хаба тоже их носит. */
  const defects = [];
  const P2 = project(P.root);
  if (opts.sync !== false) {
    defects.push(...hubCheck(P2, true).defects, ...assembleRun(P2, sourcesUnder(path.join(P2.root, P2.appsDir)), true).defects, ...readmeCheck(P2, true).defects);
    lines.push('реестр хаба, страницы, README модуля — пересобраны');
  }
  /* Панель прототипа (задача 0005): её папка переехала вместе с файлами
     концепта; включатель получает путь модуля, зеркало — новый id записи. */
  if ((opts.sync !== false || opts.panel) && P2.panel && existsSync(path.join(moduleAbs, P2.panel.dir))) {
    const pb = panelBuild(P2);
    defects.push(...pb.defects);
    lines.push('панель прототипа — зеркало и включатель пересобраны' + (pb.written.length ? ': ' + pb.written.join(', ') : ''));
  }
  /* Остальные упоминания — списком: их правят по смыслу. */
  walkFiles(P.root, [], scratch)
    .filter((f) => TEXT.test(f) && !inside(f, moduleAbs) && !(P.adapterAbs && inside(f, P.adapterAbs)) && readFileSync(f, 'utf8').match(oldRx))
    .forEach((f) => lines.push('упоминание старого пути — поправить по смыслу: ' + slash(path.relative(P.root, f))));
  return { defects, lines };
}

function report(title, { defects, lines }) {
  const out = ['== ' + title + ' =='];
  out.push(...lines);
  for (const d of defects) out.push('FAIL  ' + d);
  out.push('ВЕРДИКТ: ' + (defects.length ? 'FAIL (дефектов: ' + defects.length + ')' : 'OK'));
  if (!defects.length && !title.includes('--dry')) out.push('дальше: node .agents/tools/lessons-cli.mjs gate');
  return out.join('\n');
}

/* ---------------- selftest: откат на временном дереве ---------------- */

function put(root, rel, text) {
  const p = path.join(root, rel);
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, text, 'utf8');
}
const read = (root, rel) => readFileSync(path.join(root, rel), 'utf8');

const MANIFEST = {
  contract: 1, id: 't', designSystem: { mount: 'ds' }, agentKit: { mount: '.kit', tools: '.kit/tools', adapter: '.cli' },
  hub: { page: 'index.html', registry: 'hub.js' }, apps: { dir: 'apps', manifest: 'app.json' },
  appShape: { pages: 'pages', widgets: 'widgets', data: 'data', refs: 'refs', widgetGroups: ['tiles'] },
  appPlaces: { moduleSuffix: '-app', drafts: 'drafts' }, tracks: [],
};

function tree(r) {
  put(r, 'project.json', JSON.stringify(MANIFEST));
  put(r, 'index.html', '<p>хаб</p>');
  put(r, 'apps/ds-config.js', '// загрузчик');
  put(r, '.cli/config.json', JSON.stringify({ rules: [{ edit: 'apps/postrade/drafts/lab/**', effect: 'ask' }] }));
  put(r, 'apps/postrade/drafts/lab/app.json', JSON.stringify({ id: 'lab', track: 'rnd', title: 'Лаб', desc: 'т', home: 'pages/Lab.html', icon: 'folder' }));
  put(r, 'apps/postrade/drafts/lab/README.md', '# lab — концепт\n\nОписание концепта.\n');
  put(r, 'apps/postrade/drafts/lab/pages/Lab.html',
    '<script src="../../../../ds-config.js"></script>\n<a class="nav__user" href="../../../../../index.html">хаб</a>\n'
    + '<ds-include src="../widgets/tiles/LabTile/LabTile.html"></ds-include>\n<script src="../data/lab.js"></script>\n');
  put(r, 'apps/postrade/drafts/lab/pages/Lab.screen.md', '---\nscreen: Lab\nfile: apps/postrade/drafts/lab/pages/Lab.html\n---\n');
  put(r, 'apps/postrade/drafts/lab/widgets/tiles/LabTile/LabTile.html', '<section class="tile">Лаб</section>');
  put(r, 'apps/postrade/drafts/lab/data/lab.js', '/* данные */');
  for (const d of ['pages', 'widgets', 'data', 'refs']) put(r, 'apps/postrade/lab-app/' + d + '/.gitkeep', '');
  put(r, 'apps/postrade/lab-app/README.md', '# lab-app\n\n<!-- @scaffold — заготовка -->\n\n## Что лежит\n\n<!-- @tree -->\n<!-- /@tree -->\n\n## Имена фронтенда\n\nLabTile\n');
  /* соседний концепт того же раздела вшивает виджет переносимого */
  put(r, 'apps/postrade/drafts/other/app.json', '{}');
  put(r, 'apps/postrade/drafts/other/pages/O.html', '<ds-include src="../../lab/widgets/tiles/LabTile/LabTile.html"></ds-include>');
  put(r, 'docs/note.md', 'Концепт лежал в apps/postrade/drafts/lab/.\n');
}

const CASES = [
  { name: 'перенос: пути, запись, README, права, ссылки соседей', run: (r) => promote(project(r), 'apps/postrade/drafts/lab', 'apps/postrade/lab-app', { sync: false }),
    verify: (r, res) => {
      const miss = [];
      const page = read(r, 'apps/postrade/lab-app/pages/Lab.html');
      if (!page.includes('src="../../../ds-config.js"')) miss.push('загрузчик на один ../ короче');
      if (!page.includes('href="../../../../index.html"')) miss.push('хаб на один ../ короче');
      if (!page.includes('src="../widgets/tiles/LabTile/LabTile.html"') || !page.includes('src="../data/lab.js"')) miss.push('пути внутри приложения не тронуты');
      if (!read(r, 'apps/postrade/lab-app/pages/Lab.screen.md').includes('file: apps/postrade/lab-app/pages/Lab.html')) miss.push('file: в спеке');
      if (JSON.parse(read(r, 'apps/postrade/lab-app/app.json')).id !== 'lab-app') miss.push('id записи');
      if (existsSync(path.join(r, 'apps/postrade/drafts/lab'))) miss.push('концепт удалён');
      if (existsSync(path.join(r, 'apps/postrade/lab-app/pages/.gitkeep'))) miss.push('.gitkeep заготовки снят');
      if (!existsSync(path.join(r, 'apps/postrade/lab-app/refs/.gitkeep'))) miss.push('.gitkeep пустой папки остался');
      const readme = read(r, 'apps/postrade/lab-app/README.md');
      if (!readme.startsWith('# lab — концепт') || !readme.includes('## Имена фронтенда') || readme.includes('@scaffold')) miss.push('README: описание концепта + дерево + имена');
      if (!read(r, 'apps/postrade/drafts/other/pages/O.html').includes('src="../../../lab-app/widgets/tiles/LabTile/LabTile.html"')) miss.push('метка соседа пересчитана');
      if (!read(r, '.cli/config.json').includes('apps/postrade/lab-app/**')) miss.push('правило прав агента');
      if (!res.lines.some((l) => l.includes('docs/note.md'))) miss.push('упоминание в docs — списком');
      return miss;
    } },
  { name: 'конфликт: файл с тем же путём — ничего не переносится', expect: 'ПР3 apps/postrade/lab-app/pages/Lab.html',
    run: (r) => { put(r, 'apps/postrade/lab-app/pages/Lab.html', '<p>свой</p>'); return promote(project(r), 'apps/postrade/drafts/lab', 'apps/postrade/lab-app', { sync: false }); },
    verify: (r) => (existsSync(path.join(r, 'apps/postrade/drafts/lab/pages/Lab.html')) ? [] : ['концепт на месте']) },
  { name: 'у модуля своя запись', expect: 'ПР3 apps/postrade/lab-app/app.json',
    run: (r) => { put(r, 'apps/postrade/lab-app/app.json', '{}'); return promote(project(r), 'apps/postrade/drafts/lab', 'apps/postrade/lab-app', { sync: false }); } },
  { name: 'модуль другого раздела', expect: 'ПР1 apps/core/lab-app',
    run: (r) => promote(project(r), 'apps/postrade/drafts/lab', 'apps/core/lab-app', { sync: false }) },
  { name: 'источник не концепт', expect: 'ПР2 apps/postrade/lab-app',
    run: (r) => promote(project(r), 'apps/postrade/lab-app', 'apps/postrade/other-app', { sync: false }) },
  { name: 'перенос с панелью прототипа: папка переезжает, включатель и зеркало пересобраны',
    run: (r) => { panelTree(r); return promote(project(r), 'apps/postrade/drafts/lab', 'apps/postrade/lab-app', { sync: false, panel: true }); },
    verify: (r) => {
      const miss = [];
      const boot = read(r, 'apps/proto-panel.js');
      if (!boot.includes('"postrade/lab-app"') || boot.includes('"postrade/drafts/lab"')) miss.push('включатель с путём модуля');
      if (!existsSync(path.join(r, 'apps/postrade/lab-app/proto-panel/flows.yaml')) || existsSync(path.join(r, 'apps/postrade/drafts/lab'))) miss.push('папка панели переехала');
      if (!read(r, 'apps/postrade/lab-app/proto-panel/panel-data.js').includes('"id": "lab-app"')) miss.push('зеркало с id модуля');
      const pc = panelCheck(project(r)).defects.filter((d) => /^ПН[4789]/.test(d));
      if (pc.length) miss.push(pc.join(' | '));
      return miss;
    } },
];

/* Панель прототипа у концепта: манифест с protoPanel, копия рантайма, папка панели через --enable. */
function panelTree(r) {
  const P0 = project(HERE);
  const runtime = P0.panel && existsSync(P0.panel.runtimeAbs) ? P0.panel.runtimeAbs : path.join(HERE, '..', 'proto-panel');
  put(r, 'project.json', JSON.stringify({ ...MANIFEST, boot: { dir: 'apps', head: 'apps/ds-config.js', body: 'apps/ds-body.js' },
    protoPanel: { runtime: '.kit/proto-panel', boot: 'apps/proto-panel.js', dir: 'proto-panel' } }));
  cpSync(runtime, path.join(r, '.kit/proto-panel'), { recursive: true });
  put(r, 'apps/postrade/drafts/lab/pages/Lab.preview.html', '<section class="tile">Лаб</section>\n');
  const res = panelEnable(project(r), 'apps/postrade/drafts/lab');
  if (res.refused) throw new Error(res.refused.join('; '));
}

function selftest() {
  const out = ['== promote --selftest =='];
  let failed = 0;
  for (const c of CASES) {
    const root = mkdtempSync(path.join(os.tmpdir(), 'promote-'));
    try {
      tree(root);
      const res = c.run(root);
      const miss = [];
      if (c.expect && !res.defects.some((d) => d.includes(c.expect))) miss.push('ожидался ' + c.expect);
      if (!c.expect && res.defects.length) miss.push('дефекты: ' + res.defects.join(' | '));
      if (c.verify) miss.push(...c.verify(root, res));
      if (miss.length) failed++;
      out.push((miss.length ? 'FAIL  ' : 'ok    ') + c.name + (miss.length ? ' — ' + miss.join('; ') : ''));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
  out.push('ВЕРДИКТ: ' + (failed ? 'FAIL (кейсов не прошло: ' + failed + ' из ' + CASES.length + ')' : 'OK (кейсов: ' + CASES.length + ')'));
  console.log(out.join('\n'));
  process.exit(failed ? 1 : 0);
}

/* ---------------- main ---------------- */

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();
  const P = need('promote', HERE);
  const ti = args.indexOf('--track');
  const track = ti >= 0 ? args[ti + 1] : null;
  const pos = args.filter((a, i) => !a.startsWith('--') && (ti < 0 || i !== ti + 1));
  if (pos.length !== 2) {
    console.log('Использование: node promote.mjs <концепт> <модуль> [--track product|rnd] [--dry]');
    process.exit(2);
  }
  const dry = args.includes('--dry');
  const res = promote(P, pos[0], pos[1], { dry, track });
  console.log(report('promote' + (dry ? ' --dry' : ''), res));
  process.exit(res.defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SELF) main();

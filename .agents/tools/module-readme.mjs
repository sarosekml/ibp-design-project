#!/usr/bin/env node
/* ============================================================
   MODULE-README — README модуля раздела: описание и дерево «что где лежит».

   Зачем (решение владельца 24.09.2026). В корне каждого модуля
   `apps/<раздел>/<имя>-app/` лежит README.md с деревом папки и описанием
   того, что в ней. Дерево, написанное руками, устаревает с первым же новым
   виджетом, поэтому оно — генерат: блок между метками
   `<!-- @tree … -->` и `<!-- /@tree -->` пишет этот инструмент, гейт (шаг
   `readme`) сверяет его с диском. Описание вокруг блока — ручное.

   Дерево подписано из самих файлов: страница — `title:` своей спеки
   (`<Имя>.screen.md`), виджет — `title:` или `name:` паспорта
   (`<Имя>.md`), файл данных — первая строка его шапки-комментария,
   `app.json` — название и трек. Скрытые файлы и `.gitkeep` не показываются.

   Новый README заводится заготовкой: заголовок, пометка `@scaffold`,
   дерево и раздел «Имена фронтенда» — сущности этого модуля во фронтенде,
   разложенные по нашей форме (модалки из `features/` — в `widgets/modals/`
   и т. д.). Имена берутся из дерева фронтенда (`--names <файл>`, по
   умолчанию — `docs/misc/project-tree.md`, если он есть) один раз, при
   создании README: черновой каталог периодически чистят, а README остаётся.

   Коды МР — «README модуля»:
     МР1 у модуля нет README.md;
     МР2 в README нет блока дерева (меток @tree);
     МР3 дерево разошлось с папкой: файлы добавлены, переименованы или
         удалены, а README не обновлён.

   Использование:
     node module-readme.mjs [--names <дерево фронтенда>]  — завести недостающие README, обновить деревья
     node module-readme.mjs --check                       — сверить (гейт, шаг readme)
     node module-readme.mjs --selftest                    — откат на временном дереве
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { project, need } from './project.mjs';
import { includesOf } from './assemble.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SELF = path.resolve(fileURLToPath(import.meta.url));
const GEN = 'module-readme.mjs';
const OPEN = '<!-- @tree — дерево генерирует .agents/tools/' + GEN + ', руками не править -->';
const OPEN_RX = /<!-- @tree\b[^>]*-->/;
const CLOSE = '<!-- /@tree -->';
const SCAFFOLD = '<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->';
const GROUP_TITLE = { tiles: 'тайлы', tables: 'таблицы', modals: 'модальные окна', 'context-menus': 'контекстные меню', popovers: 'поповеры и тултипы' };
const PANEL_NOTES = {
  '': 'панель прототипа: сценарии показа и комментарии',
  'flows.yaml': 'сценарии показа',
  'comments.md': 'комментарии к прототипу',
  'panel-data.js': 'генерат панели — руками не править',
};
const DEFAULT_NAMES = 'docs/misc/project-tree.md';
const slash = (p) => p.split(path.sep).join('/');

/* Модули: `apps/<раздел>/<имя><суффикс>/`. [{ rel, abs, part, name }] */
export function modulesOf(P) {
  if (!P.appsDir) return [];
  const APPS = path.join(P.root, P.appsDir);
  const suffix = (P.places && P.places.moduleSuffix) || '-app';
  const dirs = (d) => { try { return readdirSync(d, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('.')).map((e) => e.name).sort(); } catch { return []; } };
  const out = [];
  for (const part of dirs(APPS)) {
    for (const name of dirs(path.join(APPS, part))) {
      if (name.endsWith(suffix)) out.push({ rel: P.appsDir + '/' + part + '/' + name, abs: path.join(APPS, part, name), part, name });
    }
  }
  return out;
}

/* Поле YAML-шапки md-файла или null. */
function frontField(file, keys) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { return null; }
  const lines = text.split(/\r?\n/);
  if (lines[0] !== '---') return null;
  const end = lines.indexOf('---', 1);
  for (const k of keys) {
    const l = lines.slice(1, end).find((x) => x.startsWith(k + ':'));
    if (l) {
      const v = l.slice(k.length + 1).replace(/#.*$/, '').trim().replace(/^["']|["']$/g, '');
      if (v) return v;
    }
  }
  return null;
}

/* Первая содержательная строка шапки-комментария файла данных. */
function leadComment(file) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { return null; }
  const m = text.match(/^\s*\/\*([\s\S]*?)\*\//);
  if (!m) return null;
  const line = m[1].split(/\r?\n/).map((l) => l.replace(/^[\s*=#-]+/, '').trim()).find((l) => l && !/^[=*#-]+$/.test(l));
  if (!line) return null;
  return line.length > 72 ? line.slice(0, 71).trimEnd() + '…' : line;
}

const visible = (name) => !name.startsWith('.');
const byName = (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });

/* Подпись элемента дерева или null. */
function noteFor(moduleAbs, abs, isDir, P) {
  const rel = slash(path.relative(moduleAbs, abs));
  const parts = rel.split('/');
  const S = P.appShape;
  const name = path.basename(abs);
  if (rel === P.appsManifest) {
    try {
      const app = JSON.parse(readFileSync(abs, 'utf8'));
      return 'запись хаба: «' + (app.title || app.id) + '», трек ' + app.track;
    } catch { return 'запись хаба (не читается как JSON)'; }
  }
  /* Папка панели прототипа (задача 0005). Подписи статичные: число сценариев
     и комментариев в дереве дёргало бы README на каждом комментарии. */
  if (P.panel && parts[0] === P.panel.dir) {
    if (parts.length === 1) return isDir ? PANEL_NOTES[''] : null;
    if (parts.length === 2 && !isDir) return PANEL_NOTES[name] || null;
  }
  if (isDir) {
    if (!readdirSync(abs).some(visible)) return 'пусто';
    if (parts[0] === S.widgets && parts.length === 2) return GROUP_TITLE[parts[1]] || null;
    if (parts[0] === S.widgets && parts.length === 3) return frontField(path.join(abs, name + '.md'), ['title', 'name']);
    return null;
  }
  if (parts[0] === S.pages && parts.length === 2) {
    if (/\.preview\.html$/i.test(name)) return 'собранная страница — открывать её';
    if (/\.screen\.md$/i.test(name)) return 'спека';
    if (/\.html$/i.test(name)) {
      const title = frontField(abs.replace(/\.html$/i, '.screen.md'), ['title']);
      const source = includesOf(readFileSync(abs, 'utf8')).length > 0;
      return [title, source ? 'источник, собирается в ' + name.replace(/\.html$/i, '.preview.html') : null].filter(Boolean).join(' — ') || null;
    }
  }
  if (parts[0] === S.data && /\.m?js$/i.test(name)) return leadComment(abs);
  return null;
}

/* Строки дерева модуля: [{ text, note }]. */
function treeLines(moduleAbs, P) {
  const S = P.appShape;
  const form = [S.pages, S.widgets, S.data, S.refs, S.tools, P.panel && P.panel.dir].filter(Boolean);
  const lines = [{ text: path.basename(moduleAbs) + '/', note: null }];
  const walk = (dir, prefix, top) => {
    let entries = readdirSync(dir, { withFileTypes: true }).filter((e) => visible(e.name) && e.name !== '.gitkeep');
    if (top) {
      /* корень: запись и README, затем папки формы по порядку, затем прочее */
      const rank = (e) => (e.name === P.appsManifest ? 0 : e.name === 'README.md' ? 1 : e.isDirectory() && form.includes(e.name) ? 2 + form.indexOf(e.name) : e.isDirectory() ? 10 : 20);
      entries = entries.sort((a, b) => rank(a) - rank(b) || byName(a, b));
    } else entries = entries.sort(byName);
    entries.forEach((e, i) => {
      const last = i === entries.length - 1;
      const abs = path.join(dir, e.name);
      const isDir = e.isDirectory();
      lines.push({ text: prefix + (last ? '└── ' : '├── ') + e.name + (isDir ? '/' : ''), note: noteFor(moduleAbs, abs, isDir, P) });
      if (isDir) walk(abs, prefix + (last ? '    ' : '│   '), false);
    });
  };
  walk(moduleAbs, '', true);
  return lines;
}

/* Блок дерева целиком — от метки до метки. */
export function treeBlock(moduleAbs, P) {
  const lines = treeLines(moduleAbs, P);
  const width = Math.min(46, Math.max(...lines.filter((l) => l.note).map((l) => [...l.text].length), 0)) + 2;
  const body = lines.map((l) => (l.note ? l.text + ' '.repeat(Math.max(1, width - [...l.text].length)) + '← ' + l.note : l.text));
  return OPEN + '\n```\n' + body.join('\n') + '\n```\n' + CLOSE;
}

/* ---------- имена фронтенда: сущности модуля по нашей форме ---------- */

/* Файлы дерева фронтенда (markdown-дерево «├── …»): пути .md от корня дерева. */
function frontendFiles(treeFile) {
  const lines = readFileSync(treeFile, 'utf8').split('\n');
  const stack = [];
  const out = [];
  for (const l of lines) {
    const m = l.match(/^((?:│   | {4})*)(?:├── |└── )(.+?)\s*$/);
    if (!m) continue;
    const depth = [...m[1]].length / 4;
    const name = m[2];
    stack.length = depth;
    if (name.endsWith('/')) stack.push(name.slice(0, -1));
    else if (name.endsWith('.md')) out.push([...stack, name].join('/'));
  }
  return out;
}

const KIND_BY_SUFFIX = [[/Modal$/, 'modals'], [/ContextMenu(Button)?$/, 'context-menus'], [/Popover\w*$/, 'popovers'], [/Tile$/, 'tiles'], [/Table$/, 'tables']];
const KIND_BY_GROUP = { tiles: 'tiles', tables: 'tables', modals: 'modals', contextmenus: 'context-menus', popovers: 'popovers' };

/* Сущности модуля `<раздел>/<имя>` во фронтенде: { pages, tiles, …, other, small }. */
export function frontendNames(treeFile, part, name) {
  const buckets = { pages: new Set(), tiles: new Set(), tables: new Set(), modals: new Set(), 'context-menus': new Set(), popovers: new Set(), other: new Set(), small: new Set() };
  const prefix = part + '/' + name + '/';
  for (const f of frontendFiles(treeFile)) {
    if (!f.startsWith(prefix)) continue;
    const parts = f.slice(prefix.length).split('/');
    const entity = parts[parts.length - 1].replace(/\.md$/, '');
    const layerAt = parts.findIndex((p) => p === 'pages' || p === 'widgets' || p === 'features');
    if (layerAt < 0) continue;
    const layer = parts[layerAt];
    const bySuffix = KIND_BY_SUFFIX.find(([rx]) => rx.test(entity));
    if (bySuffix) { buckets[bySuffix[1]].add(entity); continue; }
    if (layer === 'pages') { (parts.length - layerAt <= 3 ? buckets.pages : buckets.other).add(entity); continue; }
    if (layer === 'widgets') {
      const group = KIND_BY_GROUP[(parts[layerAt + 1] || '').toLowerCase()];
      (group ? buckets[group] : buckets.other).add(entity);
      continue;
    }
    buckets.small.add(entity);
  }
  return Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, [...v].sort()]));
}

function namesSection(P, mod, namesFile) {
  const head = '## Имена фронтенда\n\n';
  if (!namesFile || !existsSync(namesFile)) return head + 'Дерево фронтенда при создании README было недоступно — имена сверять с командой разработки.\n';
  const n = frontendNames(namesFile, mod.part, mod.name);
  const total = Object.values(n).reduce((s, l) => s + l.length, 0);
  if (!total) return head + 'Во фронтенде у модуля пока нет описанных страниц и виджетов.\n';
  const S = P.appShape;
  const row = (where, list, note) => (list.length ? '| ' + where + ' | ' + list.join(', ') + (note ? ' — ' + note : '') + ' |\n' : '');
  return head
    + 'Сущности модуля во фронтенде (снято с дерева фронтенда ' + new Date().toLocaleDateString('ru-RU') + ') —\n'
    + 'разложены по нашей форме. Экран или виджет, у которого здесь есть пара, называется\n'
    + 'так же: разработчик находит его без перевода (`apps/README.md`, «widgets»).\n\n'
    + '| Куда у нас | Имена во фронтенде |\n|---|---|\n'
    + row('`' + S.pages + '/`', n.pages)
    + row('`' + S.widgets + '/tiles/`', n.tiles)
    + row('`' + S.widgets + '/tables/`', n.tables)
    + row('`' + S.widgets + '/modals/`', n.modals, 'у фронтенда в `features/` и `widgets/`')
    + row('`' + S.widgets + '/context-menus/`', n['context-menus'])
    + row('`' + S.widgets + '/popovers/`', n.popovers)
    + row('другие виджеты', n.other, 'своей группы у нас нет: новая группа — в `project.json → appShape.widgetGroups`')
    + row('мелкие элементы', n.small, 'у фронтенда `features/`; у нас — в разметке страницы или виджета');
}

/* Заготовка README нового модуля. */
function scaffold(P, mod, namesFile) {
  return '# ' + mod.name + ' — модуль раздела ' + mod.part + '\n\n'
    + SCAFFOLD + '\n\n'
    + 'Модуль повторяет модуль фронтенда `' + mod.part + '/' + mod.name + '`. Прототипов пока нет:\n'
    + 'экраны появятся здесь напрямую или переездом согласованного концепта из\n'
    + '`' + P.appsDir + '/' + mod.part + '/' + ((P.places && P.places.drafts) || 'drafts') + '/` (`/promote`). Форма модуля — `' + P.appsDir + '/README.md`.\n\n'
    + '## Что лежит\n\n' + treeBlock(mod.abs, P) + '\n\n'
    + namesSection(P, mod, namesFile);
}

/* Вставить или обновить блок дерева в тексте README. */
export function withTree(text, block) {
  const open = text.match(OPEN_RX);
  const closeAt = text.indexOf(CLOSE);
  if (open && closeAt > open.index) return text.slice(0, open.index) + block + text.slice(closeAt + CLOSE.length);
  return text.trimEnd() + '\n\n## Что лежит\n\n' + block + '\n';
}

export function check(P, write = false, namesFile = null) {
  const defects = [];
  const written = [];
  for (const mod of modulesOf(P)) {
    const file = path.join(mod.abs, 'README.md');
    const block = treeBlock(mod.abs, P);
    const rel = mod.rel + '/README.md';
    if (!existsSync(file)) {
      if (write) {
        /* дерево строится после записи: в нём есть и сам README */
        writeFileSync(file, scaffold(P, mod, namesFile), 'utf8');
        writeFileSync(file, withTree(readFileSync(file, 'utf8'), treeBlock(mod.abs, P)), 'utf8');
        written.push(rel + ' (заведён)');
      }
      else defects.push('МР1 ' + mod.rel + ' — нет README.md: node ' + P.tools + '/' + GEN);
      continue;
    }
    const text = readFileSync(file, 'utf8');
    const open = text.match(OPEN_RX);
    const closeAt = text.indexOf(CLOSE);
    const hasBlock = open && closeAt > open.index;
    if (write) {
      const next = withTree(text, block);
      if (next !== text) { writeFileSync(file, next, 'utf8'); written.push(rel); }
      continue;
    }
    if (!hasBlock) defects.push('МР2 ' + rel + ' — нет блока дерева (метки @tree): node ' + P.tools + '/' + GEN);
    else if (text.slice(open.index, closeAt + CLOSE.length) !== block) defects.push('МР3 ' + rel + ' — дерево разошлось с папкой модуля: node ' + P.tools + '/' + GEN);
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
  appShape: { pages: 'pages', widgets: 'widgets', data: 'data', refs: 'refs', widgetGroups: ['tiles', 'tables', 'modals'] },
  appPlaces: { moduleSuffix: '-app', drafts: 'drafts' }, tracks: [],
};
const FRONT_TREE = [
  'ibp-design-spec/',
  '├── postrade/',
  '│   └── deals-app/',
  '│       ├── features/',
  '│       │   ├── modals/',
  '│       │   │   └── DealTeamModal/',
  '│       │   │       └── DealTeamModal.md',
  '│       │   └── buttons/',
  '│       │       └── DealMetricsLinkButton.md',
  '│       ├── pages/',
  '│       │   └── Deal/',
  '│       │       └── Deal.md',
  '│       └── widgets/',
  '│           ├── Navigator/',
  '│           │   └── Navigator.md',
  '│           └── tiles/',
  '│               └── DealTeamTile/',
  '│                   └── DealTeamTile.md',
  '└── README.md',
].join('\n');

function tree(r) {
  put(r, 'project.json', JSON.stringify(MANIFEST));
  put(r, 'front.md', FRONT_TREE + '\n');
  for (const d of ['pages', 'widgets', 'data', 'refs']) put(r, 'apps/postrade/deals-app/' + d + '/.gitkeep', '');
  put(r, 'apps/core/clients-app/pages/.gitkeep', '');
  put(r, 'apps/postrade/drafts/lab/app.json', '{}');              // концепт — не модуль, README ему не положен
}

const CASES = [
  { name: 'заведено и собрано — диффа нет', expect: null, build: true },
  { name: 'у модуля нет README', expect: 'МР1 apps/core/clients-app' },
  { name: 'README без блока дерева', expect: 'МР2 apps/postrade/deals-app/README.md', build: true,
    mutate: (r) => put(r, 'apps/postrade/deals-app/README.md', '# deals-app\n\nОписание без дерева.\n') },
  { name: 'новый файл без обновления дерева', expect: 'МР3 apps/postrade/deals-app/README.md', build: true,
    mutate: (r) => put(r, 'apps/postrade/deals-app/pages/Deal.html', '<p>экран</p>\n') },
  { name: 'новый файл и пересборка', expect: null, build: true,
    mutate: (r) => { put(r, 'apps/postrade/deals-app/pages/Deal.html', '<p>экран</p>\n'); check(project(r), true); } },
];

function selftest() {
  const out = ['== ' + GEN + ' --selftest =='];
  let failed = 0;
  for (const c of CASES) {
    const root = mkdtempSync(path.join(os.tmpdir(), 'module-readme-'));
    try {
      tree(root);
      if (c.build) check(project(root), true, path.join(root, 'front.md'));
      if (c.mutate) c.mutate(root);
      const { defects } = check(project(root));
      const pass = c.expect === null ? defects.length === 0 : defects.some((d) => d.includes(c.expect));
      if (!pass) failed++;
      out.push((pass ? 'ok    ' : 'FAIL  ') + c.name + ' — ' + (defects.length ? defects.join(' | ') : 'дефектов нет'));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
  /* Содержимое: подписи из спек и паспортов, раскладка имён фронтенда по
     нашей форме (модалка из features/ — в widgets/modals/, кнопка — мелочь). */
  const root = mkdtempSync(path.join(os.tmpdir(), 'module-readme-'));
  try {
    tree(root);
    put(root, 'apps/postrade/deals-app/app.json', JSON.stringify({ id: 'deals-app', track: 'product', title: 'Сделки' }));
    put(root, 'apps/postrade/deals-app/pages/Deal.html', '<!DOCTYPE html><html><head></head><body><ds-include src="../widgets/tiles/DealTeamTile/DealTeamTile.html"></ds-include></body></html>');
    put(root, 'apps/postrade/deals-app/pages/Deal.screen.md', '---\nscreen: Deal\ntitle: Страница сделки\n---\n');
    put(root, 'apps/postrade/deals-app/widgets/tiles/DealTeamTile/DealTeamTile.html', '<section class="tile"></section>');
    put(root, 'apps/postrade/deals-app/widgets/tiles/DealTeamTile/DealTeamTile.md', '---\nname: Команда сделки\n---\n');
    put(root, 'apps/postrade/deals-app/data/deals.js', '/* ====\n   Мок сделок ДИД.\n   ==== */\n');
    check(project(root), true, path.join(root, 'front.md'));
    const text = readFileSync(path.join(root, 'apps/postrade/deals-app/README.md'), 'utf8');
    const want = ['запись хаба: «Сделки», трек product', 'Страница сделки — источник, собирается в Deal.preview.html',
      '← спека', '← тайлы', 'DealTeamTile/', '← Команда сделки', '← Мок сделок ДИД.', 'refs/', '← пусто',
      '| `pages/` | Deal |', '| `widgets/tiles/` | DealTeamTile |', '| `widgets/modals/` | DealTeamModal', '| другие виджеты | Navigator', '| мелкие элементы | DealMetricsLinkButton'];
    const miss = want.filter((w) => !text.includes(w));
    if (miss.length) failed++;
    out.push((miss.length ? 'FAIL  ' : 'ok    ') + 'подписи дерева и имена фронтенда' + (miss.length ? ' — нет: ' + miss.join(' | ') : ''));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  /* Панель прототипа (задача 0005): папка стоит после папок формы, подписи —
     статичные, без чисел. */
  const proot = mkdtempSync(path.join(os.tmpdir(), 'module-readme-'));
  try {
    tree(proot);
    put(proot, 'project.json', JSON.stringify({ ...MANIFEST, protoPanel: { runtime: '.kit/proto-panel', boot: 'apps/proto-panel.js', dir: 'proto-panel' } }));
    for (const f of ['flows.yaml', 'comments.md', 'panel-data.js']) put(proot, 'apps/postrade/deals-app/proto-panel/' + f, '');
    check(project(proot), true);
    const text = readFileSync(path.join(proot, 'apps/postrade/deals-app/README.md'), 'utf8');
    const want = ['proto-panel/', '← панель прототипа: сценарии показа и комментарии', 'flows.yaml', '← сценарии показа', '← комментарии к прототипу', '← генерат панели — руками не править'];
    const miss = want.filter((w) => !text.includes(w));
    const order = text.indexOf('refs/') < text.indexOf('proto-panel/');
    if (miss.length || !order) failed++;
    out.push((miss.length || !order ? 'FAIL  ' : 'ok    ') + 'папка панели прототипа: подписи и место после папок формы' + (miss.length ? ' — нет: ' + miss.join(' | ') : !order ? ' — стоит раньше refs/' : ''));
  } finally {
    rmSync(proot, { recursive: true, force: true });
  }
  const total = CASES.length + 2;
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
  const ni = args.indexOf('--names');
  const namesFile = ni >= 0 ? path.resolve(process.cwd(), args[ni + 1]) : path.join(P.root, DEFAULT_NAMES);
  const res = check(P, write, namesFile);
  console.log(report(write ? GEN : GEN + ' --check', res));
  process.exit(res.defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SELF) main();

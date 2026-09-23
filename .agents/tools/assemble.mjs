#!/usr/bin/env node
/* ============================================================
   ASSEMBLE — сборщик модульных страниц: виджеты вшиваются в страницу.

   Зачем. Страница держит перечень виджетов и их место в сетке, а разметка
   виджета живёт в своей папке `widgets/<группа>/<Имя>/<Имя>.html`. Рантайм-
   инклуд ДС `scripts/ds-include.js` здесь не годится: он тянет фрагмент через
   `fetch`, а `fetch` по `file://` не работает — страницы же открываются
   двойным кликом. Поэтому аналог `import` — сборка до открытия.

   До 24.09.2026 сборщик жил в приложении Post (`tools/assemble.mjs`) и
   собирал только его страницы. Теперь он общий (решение владельца): виджет
   одного модуля можно вшить в страницу другого модуля того же раздела —
   тайл `deals-app` на странице `payments-app`, оба в `postrade/`.

   Что делает (контракт прежний, паритет с рантаймом `ds-include.js`):
   - находит в источнике метки `<ds-include src="…"></ds-include>` (или
     самозакрывающиеся `… />`), метки внутри комментариев не трогает;
   - подставляет содержимое фрагмента (путь — от папки источника);
   - переносит на корневой элемент фрагмента атрибуты метки: `id`, `class`
     (слияние с классом корня, без второго атрибута), `state`/`mode` →
     `data-state`/`data-mode`;
   - подключает CSS виджета: файл рядом с `src` с расширением `.css`, если он
     есть (`css="…"` задаёт путь явно, `css="none"` отключает); линки — после
     маркера `<!-- @lc-css -->` или перед `</head>`, без дублей;
   - пишет самодостаточный `<имя>.preview.html` рядом с источником — его и
     открывают двойным кликом.

   Правила меток (коды СБ — «сборка», их держит `--check`, шаг гейта
   `assemble`):
     СБ1 у источника нет собранного `<имя>.preview.html`;
     СБ2 собранный файл устарел: источник или виджет правлены, сборка не
         запускалась;
     СБ3 метка ведёт в никуда или не на фрагмент (целый документ, нет
         корневого элемента, пустой файл);
     СБ4 метка ведёт не в `widgets/<группа>/<Имя>/` приложения (группа — из
         `project.json → appShape.widgetGroups`);
     СБ5 метка ведёт в виджет другого раздела: виджеты общие только в
         пределах раздела (`postrade/…` ↔ `postrade/…`);
     СБ6 страница модуля берёт виджет из `drafts/`: согласованный модуль не
         зависит от черновика, который могут переписать или удалить.
   Правила СБ4–СБ6 действуют для источников внутри `apps/`.

   Использование:
     node assemble.mjs                  — собрать все источники apps/
     node assemble.mjs <источник …>     — собрать указанные
     node assemble.mjs --check          — сверить, ничего не записывая
     node assemble.mjs --selftest       — откат на временном дереве
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { project, need } from './project.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SELF = path.resolve(fileURLToPath(import.meta.url));

const TAG_OPEN_RE = /<ds-include\b[^>]*>/gi;   // открывающая метка (в т.ч. самозакрывающаяся)
const ATTR_RE = /([a-zA-Z-]+)\s*=\s*"([^"]*)"/g;
const CSS_MARKER = '<!-- @lc-css -->';
const slash = (p) => p.split(path.sep).join('/');

/* Разобрать атрибуты тега в объект. */
function parseAttrs(tag) {
  const attrs = {};
  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(tag)) !== null) attrs[m[1].toLowerCase()] = m[2];
  return attrs;
}

/* Открывающий тег корневого элемента фрагмента: пропускает комментарии и
   декларации <!…>, возвращает { start, end } или null. */
function findRootTag(text) {
  let i = 0;
  while (i < text.length) {
    const lt = text.indexOf('<', i);
    if (lt === -1) return null;
    if (text.startsWith('<!--', lt)) {
      const close = text.indexOf('-->', lt + 4);
      if (close === -1) return null;
      i = close + 3;
      continue;
    }
    if (text.startsWith('<!', lt) || text.startsWith('<?', lt)) {
      const gt = text.indexOf('>', lt);
      if (gt === -1) return null;
      i = gt + 1;
      continue;
    }
    let quote = null;
    let j = lt + 1;
    for (; j < text.length; j++) {
      const ch = text[j];
      if (quote) { if (ch === quote) quote = null; continue; }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === '>') break;
    }
    if (j >= text.length) return null;
    return { start: lt, end: j + 1 };
  }
  return null;
}

/* Убрать атрибут из открывающего тега. Разбор посимвольный, а не регуляркой
   по тегу: цена ошибки — молча испорченный тег. */
function stripAttr(tagText, name) {
  const lower = tagText.toLowerCase();
  const needle = name.toLowerCase();
  let from = 1;
  while (from < tagText.length) {
    const at = lower.indexOf(needle, from);
    if (at === -1) return tagText;
    let j = at + needle.length;
    while (j < tagText.length && /\s/.test(tagText[j])) j++;
    if (!/\s/.test(tagText[at - 1]) || tagText[j] !== '=') { from = at + needle.length; continue; }
    j++;
    while (j < tagText.length && /\s/.test(tagText[j])) j++;
    const quote = tagText[j];
    if (quote !== '"' && quote !== "'") { from = at + needle.length; continue; }
    const close = tagText.indexOf(quote, j + 1);
    if (close === -1) return tagText;
    return tagText.slice(0, at - 1) + tagText.slice(close + 1);
  }
  return tagText;
}

/* Добавить атрибуты в открывающий тег. Прежнее значение снимается, а не
   дописывается вторым: два class в одном теге браузер читает первым, и
   ширина тайла из метки молча пропадает (паритет с ds-include.js). */
function injectAttrs(tagText, extra) {
  const keys = Object.keys(extra);
  if (!keys.length) return tagText;
  let tag = tagText;
  keys.forEach((k) => { tag = stripAttr(tag, k); });
  const insert = keys.map((k) => k + '="' + String(extra[k]).trim() + '"').join(' ');
  let head = tag.slice(0, -1).replace(/\s+$/, '');
  let tail = '>';
  if (head.endsWith('/')) { head = head.slice(0, -1).replace(/\s+$/, ''); tail = ' />'; }
  return head + ' ' + insert + tail;
}

/* Путь до CSS виджета: атрибут css= перекрывает файл рядом с src. */
function cssFor(inputDir, src, override) {
  if (override === 'none') return null;
  const rel = override || src.replace(/\.html?$/i, '.css');
  return existsSync(path.resolve(inputDir, rel)) ? rel : null;
}

/* Одна метка → разметка фрагмента, готовая к вставке. Ошибка — исключение с
   кодом СБ3: режим сборки печатает её и выходит, режим проверки копит. */
function loadFragment(inputDir, attrs, tag) {
  const rel = attrs.src;
  if (!rel) throw new Error('СБ3 метка без атрибута src: ' + tag.trim());
  const file = path.resolve(inputDir, rel);
  if (!existsSync(file)) throw new Error('СБ3 метка ведёт в никуда: ' + rel);
  const raw = readFileSync(file, 'utf8');
  /* BOM снимается по коду символа, а не регуляркой: escape-последовательность
     в исходнике легко теряется при правке через шелл (process.md §8) */
  const frag = (raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw).trim();
  if (!frag) throw new Error('СБ3 фрагмент пуст: ' + rel);
  if (/^<!DOCTYPE/i.test(frag) || /^<html[\s>]/i.test(frag)) {
    throw new Error('СБ3 ' + rel + ' — целый документ, а не фрагмент: у фрагмента один корневой элемент, без <html>/<head>/<link>/<script>');
  }
  const root = findRootTag(frag);
  if (!root) throw new Error('СБ3 во фрагменте нет корневого элемента: ' + rel);
  const extra = {};
  if (attrs.id) extra.id = attrs.id;
  if (attrs.state) extra['data-state'] = attrs.state;
  if (attrs.mode) extra['data-mode'] = attrs.mode;
  if (attrs['class'] !== undefined) {
    const rootAttrs = parseAttrs(frag.slice(root.start, root.end));
    const merged = [rootAttrs['class'], attrs['class']].filter(Boolean).join(' ').trim();
    if (merged) extra['class'] = merged;
  }
  return frag.slice(0, root.start) + injectAttrs(frag.slice(root.start, root.end), extra) + frag.slice(root.end);
}

/* Диапазоны HTML-комментариев: упоминание <ds-include …> в тексте
   комментария — не метка. */
function commentRanges(text) {
  const ranges = [];
  let i = 0;
  while (i < text.length) {
    const start = text.indexOf('<!--', i);
    if (start === -1) break;
    const end = text.indexOf('-->', start + 4);
    if (end === -1) break;
    ranges.push([start, end + 3]);
    i = end + 3;
  }
  return ranges;
}

/* Вставить линки на CSS виджетов в <head>. */
function injectCss(html, hrefs) {
  if (!hrefs.length) return html;
  const links = hrefs.map((h) => '<link rel="stylesheet" href="' + h + '">').filter((l) => html.indexOf(l) === -1);
  if (!links.length) return html;
  const block = '\n' + links.join('\n');
  const markerAt = html.indexOf(CSS_MARKER);
  if (markerAt !== -1) {
    const at = markerAt + CSS_MARKER.length;
    return html.slice(0, at) + block + html.slice(at);
  }
  const headAt = html.toLowerCase().indexOf('</head>');
  if (headAt === -1) throw new Error('СБ3 в источнике нет </head> — некуда вставить CSS виджетов');
  return html.slice(0, headAt) + block.slice(1) + '\n' + html.slice(headAt);
}

/* Метки источника вне комментариев: [{ tag, attrs }]. */
export function includesOf(source) {
  const out = [];
  const comments = commentRanges(source);
  TAG_OPEN_RE.lastIndex = 0;
  let m;
  while ((m = TAG_OPEN_RE.exec(source)) !== null) {
    if (comments.some((r) => m.index >= r[0] && m.index < r[1])) continue;
    out.push({ tag: m[0], attrs: parseAttrs(m[0]) });
  }
  return out;
}

/* Сборка текста источника: { html, inlined, css }. */
export function assemble(source, inputDir) {
  let out = source;
  const inlined = [];
  const cssHrefs = [];
  /* Диапазоны комментариев пересчитываются на каждой итерации, а не один раз
     по исходнику: вставка фрагмента сдвигает позиции, и настоящая метка
     попала бы в устаревший диапазон — её молча пропустили бы вместе с куском
     страницы. */
  let comments = commentRanges(out);
  let loops = 0;
  const inComment = (pos) => comments.some((r) => pos >= r[0] && pos < r[1]);
  TAG_OPEN_RE.lastIndex = 0;
  while (true) {
    if (++loops > 200) throw new Error('СБ3 похоже на бесконечный цикл: больше 200 меток');
    const m = TAG_OPEN_RE.exec(out);
    if (!m) break;
    if (inComment(m.index)) {
      const range = comments.find((r) => m.index >= r[0] && m.index < r[1]);
      TAG_OPEN_RE.lastIndex = range[1];
      continue;
    }
    const tag = m[0];
    const tagStart = m.index;
    const tagEnd = m.index + tag.length;
    let closeEnd;
    if (/\/\s*>$/.test(tag)) closeEnd = tagEnd;
    else {
      const closeAt = out.indexOf('</ds-include>', tagEnd);
      if (closeAt === -1) throw new Error('СБ3 не закрыта метка: ' + tag.trim());
      closeEnd = closeAt + '</ds-include>'.length;
    }
    const attrs = parseAttrs(tag);
    const frag = loadFragment(inputDir, attrs, tag);
    inlined.push(attrs.src + (attrs.id ? '  (id="' + attrs.id + '")' : ''));
    const css = cssFor(inputDir, attrs.src, attrs.css);
    if (css && !cssHrefs.includes(css)) cssHrefs.push(css);
    out = out.slice(0, tagStart) + frag + out.slice(closeEnd);
    comments = commentRanges(out);
    TAG_OPEN_RE.lastIndex = tagStart + frag.length;
  }
  return { html: injectCss(out, cssHrefs), inlined, css: cssHrefs };
}

/* Собранный файл источника. */
export const previewOf = (file) => file.replace(/\.html$/i, '.preview.html');

/* Источники apps/: .html с меткой вне комментариев; собранные *.preview.html
   — результат, а не источник; fixtures и скрытые каталоги не обходятся. */
export function sourcesUnder(dir, out = []) {
  let list;
  try { list = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of list) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'fixtures') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { sourcesUnder(full, out); continue; }
    if (!/\.html$/i.test(e.name) || /\.preview\.html$/i.test(e.name)) continue;
    if (includesOf(readFileSync(full, 'utf8')).length) out.push(full);
  }
  return out.sort();
}

/* Ближайший вверх каталог приложения (с app.json) внутри apps/, или null. */
function appRootOf(file, APPS, manifest) {
  for (let d = path.dirname(file); d.startsWith(APPS + path.sep); d = path.dirname(d)) {
    if (existsSync(path.join(d, manifest))) return d;
  }
  return null;
}

/* Правила меток СБ4–СБ6 для источника внутри apps/. */
function ruleDefects(P, sourceAbs, includes) {
  const defects = [];
  if (!P.appsDir) return defects;
  const APPS = path.join(P.root, P.appsDir);
  if (!sourceAbs.startsWith(APPS + path.sep)) return defects;
  const S = P.appShape;
  const drafts = (P.places && P.places.drafts) || 'drafts';
  const rel = (abs) => slash(path.relative(P.root, abs));
  const partOf = (abs) => slash(path.relative(APPS, abs)).split('/')[0];
  const inDraftsOf = (abs) => slash(path.relative(APPS, abs)).split('/')[1] === drafts;
  for (const { attrs } of includes) {
    if (!attrs.src) continue;
    const target = path.resolve(path.dirname(sourceAbs), attrs.src);
    if (!existsSync(target)) continue;                        // это СБ3, его печатает сборка
    const where = rel(sourceAbs) + ' → ' + attrs.src;
    if (!target.startsWith(APPS + path.sep) || partOf(target) !== partOf(sourceAbs)) {
      defects.push('СБ5 ' + where + ' — виджет другого раздела: виджеты общие только в пределах раздела (' + P.appsDir + '/' + partOf(sourceAbs) + '/…)');
      continue;
    }
    const appRoot = appRootOf(target, APPS, P.appsManifest);
    const parts = appRoot ? slash(path.relative(appRoot, target)).split('/') : [];
    if (!appRoot || parts[0] !== S.widgets || parts.length < 4) {
      defects.push('СБ4 ' + where + ' — метка ведёт не в ' + S.widgets + '/<группа>/<Имя>/ приложения');
      continue;
    }
    if (S.widgetGroups && !S.widgetGroups.includes(parts[1])) {
      defects.push('СБ4 ' + where + ' — группы виджетов «' + parts[1] + '» нет в project.json → appShape.widgetGroups (' + S.widgetGroups.join(', ') + ')');
      continue;
    }
    if (!inDraftsOf(sourceAbs) && inDraftsOf(target)) {
      defects.push('СБ6 ' + where + ' — страница модуля берёт виджет из ' + drafts + '/: сначала перенесите виджет в модуль (/promote)');
    }
  }
  return defects;
}

/* Проверка или сборка списка источников: { defects, lines }. */
export function run(P, files, write) {
  const defects = [];
  const lines = [];
  for (const file of files) {
    const rel = slash(path.relative(P.root, file));
    const source = readFileSync(file, 'utf8');
    const includes = includesOf(source);
    if (!includes.length) { defects.push('СБ3 ' + rel + ' — в источнике нет меток <ds-include>'); continue; }
    defects.push(...ruleDefects(P, file, includes));
    let built;
    try { built = assemble(source, path.dirname(file)); } catch (e) { defects.push(e.message.replace(/^(СБ\d) /, '$1 ' + rel + ' — ')); continue; }
    const out = previewOf(file);
    const outRel = slash(path.relative(P.root, out));
    if (write) {
      if (!existsSync(out) || readFileSync(out, 'utf8') !== built.html) writeFileSync(out, built.html, 'utf8');
      lines.push('собран ' + outRel + ' — фрагментов ' + built.inlined.length + ', CSS виджетов ' + built.css.length);
      built.inlined.forEach((f) => lines.push('  – ' + f));
      continue;
    }
    if (!existsSync(out)) defects.push('СБ1 ' + rel + ' — нет собранного ' + path.basename(out) + ': node ' + P.tools + '/assemble.mjs');
    else if (readFileSync(out, 'utf8') !== built.html) defects.push('СБ2 ' + outRel + ' устарел — источник или виджет правлены после сборки: node ' + P.tools + '/assemble.mjs');
  }
  return { defects, lines };
}

function report(title, { defects, lines }) {
  const out = ['== ' + title + ' =='];
  out.push(...lines);
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
  appPlaces: { moduleSuffix: '-app', drafts: 'drafts' },
  tracks: [{ id: 'product', title: 'Проекты', hubGroup: 'projects' }, { id: 'rnd', title: 'Концепты', hubGroup: 'concepts' }],
};
const PAGE = (body) => '<!DOCTYPE html>\n<html><head>\n<!-- @lc-css -->\n</head><body>\n<!-- <ds-include src="нет.html"> в комментарии не метка -->\n' + body + '\n</body></html>\n';
const TILE = '<section class="tile">КНР</section>\n';

function tree(r) {
  put(r, 'project.json', JSON.stringify(MANIFEST));
  put(r, 'apps/postrade/deals-app/app.json', '{}');
  put(r, 'apps/postrade/deals-app/widgets/tiles/KNRTile/KNRTile.html', TILE);
  put(r, 'apps/postrade/deals-app/widgets/tiles/KNRTile/KNRTile.css', '.tile{}\n');
  put(r, 'apps/postrade/deals-app/pages/Deal.html', PAGE('<ds-include src="../widgets/tiles/KNRTile/KNRTile.html" id="knr" class="col-6" state="empty"></ds-include>'));
}
const src = (r, rel) => path.join(r, rel);

const CASES = [
  { name: 'собрано — диффа нет', expect: null, build: true },
  { name: 'нет собранного файла', expect: 'СБ1 apps/postrade/deals-app/pages/Deal.html' },
  { name: 'виджет правлен после сборки', expect: 'СБ2 apps/postrade/deals-app/pages/Deal.preview.html устарел', build: true,
    mutate: (r) => put(r, 'apps/postrade/deals-app/widgets/tiles/KNRTile/KNRTile.html', '<section class="tile">КНР, правка</section>\n') },
  { name: 'метка ведёт в никуда', expect: 'СБ3 apps/postrade/deals-app/pages/Deal.html — метка ведёт в никуда',
    mutate: (r) => put(r, 'apps/postrade/deals-app/pages/Deal.html', PAGE('<ds-include src="../widgets/tiles/Missing/Missing.html"></ds-include>')) },
  { name: 'фрагмент — целый документ', expect: 'целый документ, а не фрагмент',
    mutate: (r) => put(r, 'apps/postrade/deals-app/widgets/tiles/KNRTile/KNRTile.html', '<!DOCTYPE html><html><body></body></html>') },
  /* Главное, ради чего сборщик стал общим: виджет модуля — на странице
     другого модуля того же раздела. */
  { name: 'виджет соседнего модуля того же раздела', expect: null,
    mutate: (r) => {
      put(r, 'apps/postrade/payments-app/app.json', '{}');
      put(r, 'apps/postrade/payments-app/pages/Payments.html', PAGE('<ds-include src="../../deals-app/widgets/tiles/KNRTile/KNRTile.html" class="col-12"></ds-include>'));
      run(project(r), [src(r, 'apps/postrade/deals-app/pages/Deal.html'), src(r, 'apps/postrade/payments-app/pages/Payments.html')], true);
    } },
  { name: 'виджет другого раздела', expect: 'СБ5 apps/core/clients-app/pages/Clients.html',
    mutate: (r) => {
      put(r, 'apps/core/clients-app/app.json', '{}');
      put(r, 'apps/core/clients-app/pages/Clients.html', PAGE('<ds-include src="../../../postrade/deals-app/widgets/tiles/KNRTile/KNRTile.html"></ds-include>'));
    } },
  { name: 'метка не в widgets/', expect: 'СБ4 apps/postrade/deals-app/pages/Deal.html → ../refs/Knr.html',
    mutate: (r) => {
      put(r, 'apps/postrade/deals-app/refs/Knr.html', TILE);
      put(r, 'apps/postrade/deals-app/pages/Deal.html', PAGE('<ds-include src="../refs/Knr.html"></ds-include>'));
    } },
  { name: 'группа виджетов не из списка', expect: 'группы виджетов «cards» нет',
    mutate: (r) => {
      put(r, 'apps/postrade/deals-app/widgets/cards/KnrCard/KnrCard.html', TILE);
      put(r, 'apps/postrade/deals-app/pages/Deal.html', PAGE('<ds-include src="../widgets/cards/KnrCard/KnrCard.html"></ds-include>'));
    } },
  { name: 'модуль берёт виджет из drafts/', expect: 'СБ6 apps/postrade/deals-app/pages/Deal.html',
    mutate: (r) => {
      put(r, 'apps/postrade/drafts/lab/app.json', '{}');
      put(r, 'apps/postrade/drafts/lab/widgets/tiles/LabTile/LabTile.html', TILE);
      put(r, 'apps/postrade/deals-app/pages/Deal.html', PAGE('<ds-include src="../../drafts/lab/widgets/tiles/LabTile/LabTile.html"></ds-include>'));
    } },
  { name: 'концепт берёт виджет модуля — можно', expect: null,
    mutate: (r) => {
      put(r, 'apps/postrade/drafts/lab/app.json', '{}');
      put(r, 'apps/postrade/drafts/lab/pages/Lab.html', PAGE('<ds-include src="../../../deals-app/widgets/tiles/KNRTile/KNRTile.html"></ds-include>'));
      run(project(r), sourcesUnder(path.join(r, 'apps')), true);
    } },
];

function selftest() {
  const out = ['== assemble --selftest =='];
  let failed = 0;
  for (const c of CASES) {
    const root = mkdtempSync(path.join(os.tmpdir(), 'assemble-'));
    try {
      tree(root);
      const P = project(root);
      if (c.build) run(P, sourcesUnder(path.join(root, 'apps')), true);
      if (c.mutate) c.mutate(root);
      const { defects } = run(project(root), sourcesUnder(path.join(root, 'apps')), false);
      const pass = c.expect === null ? defects.length === 0 : defects.some((d) => d.includes(c.expect));
      if (!pass) failed++;
      out.push((pass ? 'ok    ' : 'FAIL  ') + c.name + ' — ' + (defects.length ? defects.join(' | ') : 'дефектов нет'));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
  /* Контракт вшивания — паритет с рантаймом ds-include.js: атрибуты метки на
     корне, CSS виджета — линком после маркера, метка в комментарии — текст. */
  const root = mkdtempSync(path.join(os.tmpdir(), 'assemble-'));
  try {
    tree(root);
    run(project(root), sourcesUnder(path.join(root, 'apps')), true);
    const html = readFileSync(path.join(root, 'apps/postrade/deals-app/pages/Deal.preview.html'), 'utf8');
    const pass = html.includes('<section id="knr" data-state="empty" class="tile col-6">КНР</section>')
      && html.includes('<!-- @lc-css -->\n<link rel="stylesheet" href="../widgets/tiles/KNRTile/KNRTile.css">')
      && html.includes('<!-- <ds-include src="нет.html"> в комментарии не метка -->');
    if (!pass) failed++;
    out.push((pass ? 'ok    ' : 'FAIL  ') + 'контракт вшивания: id, class, state → data-state, CSS виджета, метка в комментарии');
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
  const P = need('assemble', HERE);
  const check = args.includes('--check');
  const named = args.filter((a) => !a.startsWith('--')).map((a) => path.resolve(process.cwd(), a));
  const files = named.length ? named : sourcesUnder(path.join(P.root, P.appsDir || 'apps'));
  const res = run(P, files, !check);
  console.log(report(check ? 'assemble --check' : 'assemble', res));
  process.exit(res.defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SELF) main();

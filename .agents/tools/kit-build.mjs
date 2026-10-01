#!/usr/bin/env node
/* ============================================================
   KIT-BUILD — витрина локальных компонентов (`apps/local-components/`) из
   виджетов приложений.

   Зачем (решение человека 25.09.2026). Тайлы, окна и поповеры модулей живут в
   `apps/<раздел>/<модуль>/widgets/<группа>/<Имя>/`: паспорт `<Имя>.md`,
   фрагмент `<Имя>.html`, `.css`, `.js`, `fixtures.json`. Витрина показывает
   каждый такой виджет живым — как работает, из чего собран и зачем нужен, — и
   при этом ничего не копирует руками и ничего не пишет в `apps/`: всё берётся
   из папки виджета, а в `apps/` не появляется ни одного файла.

   Где лежит витрина. Каталог — `project.json → localKit.dir`, с 25.09.2026
   `apps/local-components/` (до того — `kit/` в корне; решение человека).
   Инструменты приёмки считают страницу в `apps/` экраном, поэтому витрина
   исключена из них по этому пути (project.mjs → showcase): сторож хаба
   (П4, П7), сборщик страниц и матрица гейта её не обходят, сверяет её только
   этот генератор (шаг `kit`). Сборщик не раскрывает метки внутри
   фрагментов, поэтому окна тайла вшиваются на его страницу отдельными
   метками — так же, как их вшивает страница-хозяин.

   Что делает:
   - обходит виджеты приложений (`findApps`, группы — `appShape.widgetGroups`);
     компонент — папка с паспортом `<Имя>.md`, в том числе подчасть в папке
     окна (`InstrumentsCounterpartiesModal/CounterpartyCard/`);
   - разбирает шапку паспорта (скаляры, строки в кавычках, списки в скобках)
     и связи `opens` / `uses` / `opensFrom` / `artifactOf` — и именем
     виджета, и путём до его `.md`;
   - находит страницу-хозяина — первую страницу приложений, которая вшивает
     виджет, — и берёт с неё то, что нужно для живого демо: соседние
     фрагменты (окна тайла, их подчасти) и скрипты данных и виджетов в её
     порядке;
   - пишет `<Имя>.doc.html` на каждый компонент (каркас docs-split ДС) и
     реестр `kit-data.js`. Метки `<ds-include>` раскрывает `assemble()`
     сборщика страниц, поэтому в готовом файле меток нет, и страница
     открывается двойным кликом (`file://`, без `fetch`). CSS и JS виджета
     подключены ссылками в `apps/` — их правка видна сразу;
   - необязательный `<Имя>.demo.js` рядом со страницей (пишется руками)
     подключается последним: он добавляет демо данные из `fixtures.json`.

   Коды КТ — «кит»:
     КТ1 манифест не объявляет витрину (`localKit`) или без загрузчика ДС
         (`boot`, каталог ДС) — собирать нечего и некуда;
     КТ2 паспорт не годится: нет `name`, `category`, `purpose`, категория не из
         `localKit.categories`, у папки виджета нет паспорта;
     КТ3 витрина разошлась с виджетами — паспорт, фрагмент, CSS/JS или
         страница-хозяин правлены, а пересборки не было;
     КТ4 у компонента нет фрагмента `<Имя>.html`;
     КТ5 в витрине лишняя страница: её виджета больше нет;
     КТ6 два компонента с одним id — страницы витрины и пункты меню
         разошлись бы.
   Нераспознанная ссылка в паспорте — предупреждение, не дефект: паспорта
   приводятся к общему шаблону отдельно (задача 0003).

   Сравнение с диском — без учёта концов строк: при `text=auto` на Windows
   файлы выходят из git с CRLF, и сравнение байт в байт краснело бы на каждом
   клоне, ничего не меняя по существу.

   Использование:
     node kit-build.mjs             — собрать витрину
     node kit-build.mjs --check     — сверить, ничего не записывая
     node kit-build.mjs --selftest  — откат на временном дереве
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, mkdtempSync, readdirSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { project, need, findApps, dsPaths } from './project.mjs';

/* Раскладка ДС — у модуля путей ДС (задача RE0002): страницы документации,
   стили и рантаймы оболочки витрины. Пути внутри ДС берутся у ДС этого
   проекта и прикладываются к ДС любого манифеста — и стенда селфтеста. */
const DSP = await dsPaths();
const DS_HERE = DSP.layout();
const oneCss = (name) => {
  const css = DS_HERE.cssOf(name);
  if (css.length !== 1) throw new Error('kit-build: у ' + name + ' в спеке ДС не один файл стилей (css: ' + (css.join(', ') || '—') + ')');
  return css[0];
};
// стили оболочки страницы витрины: сплиттер, переключатель, вкладки, docs-split
const KIT_PAGE_CSS = [oneCss('Splitter'), oneCss('SegmentControl'), oneCss('Tab'), DS_HERE.at.docsSplitCss, DS_HERE.at.docsCss];
import { assemble, includesOf } from './assemble.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SELF = path.resolve(fileURLToPath(import.meta.url));
const GEN = 'kit-build.mjs';

const slash = (p) => p.split(path.sep).join('/');
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* Текст с диска: без BOM и с LF — от концов строк не зависит ни сборка, ни сверка. */
const read = (f) => {
  const t = readFileSync(f, 'utf8');
  return (t.charCodeAt(0) === 0xFEFF ? t.slice(1) : t).replace(/\r\n/g, '\n');
};
const rel = (from, abs) => slash(path.relative(from, abs)) || '.';
/* Ссылка на файл вне витрины: путь может быть с пробелами и кириллицей. */
const href = (from, abs) => rel(from, abs).split('/').map(encodeURIComponent).join('/');
const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, '');
const dirsOf = (abs) => {
  try {
    return readdirSync(abs, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules')
      .map((e) => e.name).sort();
  } catch { return []; }
};
const filesOf = (abs) => {
  try { return readdirSync(abs, { withFileTypes: true }).filter((e) => e.isFile()).map((e) => e.name).sort(); } catch { return []; }
};

const TYPE_LABEL = {
  tile: 'тайл', table: 'таблица', modal: 'модальное окно', popover: 'поповер',
  'context-menu': 'контекстное меню', part: 'подчасть',
};
const TYPE_BY_WORD = {
  tile: 'tile', 'тайл': 'tile', table: 'table', 'таблица': 'table', modal: 'modal', 'модальное окно': 'modal',
  popover: 'popover', 'поповер': 'popover', 'context-menu': 'context-menu', 'контекстное меню': 'context-menu',
};
const TYPE_BY_GROUP = { tiles: 'tile', tables: 'table', modals: 'modal', popovers: 'popover', 'context-menus': 'context-menu' };
/* Ширину демо крутит слайдер только у того, что стоит в сетке страницы. */
const WIDTH_TYPES = new Set(['tile', 'table', 'part']);
const STATE_ORDER = ['loading', 'data', 'partial', 'empty', 'error', 'updating'];
const MODE_ORDER = ['edit', 'view', 'select'];

/* ---------------- манифест ---------------- */

/** Блок витрины из project.json → localKit, или null. */
export function kitConfig(P) {
  const k = P.manifest && P.manifest.localKit;
  if (!k || typeof k !== 'object') return null;
  const dir = (typeof k.dir === 'string' && k.dir.trim()) || 'kit';
  return {
    dir,
    registry: (typeof k.registry === 'string' && k.registry.trim()) || dir + '/kit-data.js',
    id: k.id, title: k.title, desc: k.desc, icon: k.icon,
    categories: Array.isArray(k.categories) ? k.categories.filter((c) => typeof c === 'string') : [],
  };
}

/* ---------------- паспорт ---------------- */

function unquote(s) {
  s = s.trim();
  if (s.length >= 2 && ((s[0] === '"' && s.at(-1) === '"') || (s[0] === "'" && s.at(-1) === "'"))) return s.slice(1, -1);
  return s;
}

/* Список в скобках: запятая делит элементы только вне кавычек и скобок —
   «Сделка — «КНР» (собран), Обеспечение — …» остаётся двумя элементами. */
function splitList(s) {
  const out = [];
  let depth = 0, quote = false, cur = '';
  for (const ch of s) {
    if (ch === '"') { quote = !quote; cur += ch; continue; }
    if (!quote) {
      if ('([{«'.includes(ch)) depth++;
      else if (')]}»'.includes(ch)) depth = Math.max(0, depth - 1);
      else if (ch === ',' && depth === 0) { out.push(unquote(cur)); cur = ''; continue; }
    }
    cur += ch;
  }
  if (cur.trim()) out.push(unquote(cur));
  return out.filter(Boolean);
}

/** Шапка паспорта и тело: { fm, body }. */
export function frontMatter(text) {
  const t = text.replace(/\r\n/g, '\n');
  if (!t.startsWith('---\n')) return { fm: {}, body: t };
  const end = t.indexOf('\n---', 3);
  if (end === -1) return { fm: {}, body: t };
  const fm = {};
  for (const line of t.slice(4, end).split('\n')) {
    const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!m) continue;
    const v = m[2].trim();
    fm[m[1]] = v.startsWith('[') && v.endsWith(']') ? splitList(v.slice(1, -1)) : unquote(v);
  }
  const after = t.indexOf('\n', end + 1);
  return { fm, body: after === -1 ? '' : t.slice(after + 1) };
}

const listOf = (v) => (Array.isArray(v) ? v : v ? [v] : []);

/* ---------------- Markdown паспорта → HTML ---------------- */

const emph = (s) => s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

/** Строка Markdown: код, ссылки, жирный; остальное экранируется. */
export function inline(raw, link) {
  let out = '', buf = '';
  const flush = () => { out += emph(esc(buf)); buf = ''; };
  for (let i = 0; i < raw.length;) {
    const ch = raw[i];
    if (ch === '`') {
      const j = raw.indexOf('`', i + 1);
      if (j > i) { flush(); out += '<code class="tok">' + esc(raw.slice(i + 1, j)) + '</code>'; i = j + 1; continue; }
    }
    if (ch === '[') {
      const m = /^\[((?:[^\]`]|`[^`]*`)+)\]\(([^)\s]+)\)/.exec(raw.slice(i));
      if (m) {
        flush();
        const text = inline(m[1], () => null);
        const h = link ? link(m[2]) : null;
        out += h ? '<a class="inl" href="' + esc(h) + '">' + text + '</a>' : text;
        i += m[0].length;
        continue;
      }
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
}

/* Ячейки строки таблицы: `|` внутри кода ячейку не делит. */
function rowCells(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  const cells = [];
  let cur = '', code = false;
  for (const ch of s) {
    if (ch === '`') code = !code;
    if (ch === '|' && !code) { cells.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}
const TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

/** Таблица ДС (Table/TableCell): шапка .th с ручкой ширины (поведение таблицы из
    коробки, tbl-resize.js; линтер ДС, F6), ячейки .tc--wrap, разделители по краям.
    cols — дорожки сетки между разделителями. Нативная <table> — устаревшая сетка
    справочника (линтер ДС, B5). */
export function dsTable(head, rows, cols) {
  const grid = ' style="grid-template-columns:8px ' + cols + ' 8px;"';
  const row = (cells, th) => '<div class="tbl__row"' + grid + '><div class="' + (th ? 'th' : 'tc') + ' ' + (th ? 'th' : 'tc') + '--separator"></div>'
    + cells.map((c) => (th ? '<div class="th"><span class="th__label">' + c + '</span><span class="th__resize" role="separator" aria-orientation="vertical" tabindex="0" aria-label="Изменить ширину колонки"></span></div>'
      : '<div class="tc tc--wrap"><span class="tc__row"><span class="tc__text">' + c + '</span></span></div>')).join('')
    + '<div class="' + (th ? 'th' : 'tc') + ' ' + (th ? 'th' : 'tc') + '--separator"></div></div>';
  return '<div class="tbl kit-tbl" data-table>' + (head ? row(head, true) : '') + rows.map((r) => row(r, false)).join('') + '</div>';
}

/* Ширина колонок — по средней длине текста в них: узкая «Есть в продукте» не
   занимает столько же, сколько «Вид». Самое длинное слово колонки задаёт
   нижнюю границу — ячейка его не переносит, и узкая колонка его обрезала бы. */
function trackWeights(head, rows) {
  return head.map((h, k) => {
    const texts = [h, ...rows.map((r) => r[k] || '')].map((t) => t.replace(/`/g, ''));
    const avg = texts.reduce((a, t) => a + t.length, 0) / texts.length;
    const word = Math.max(...texts.flatMap((t) => t.split(/[\s/]+/)).map((x) => x.length));
    const w = Math.min(3, Math.max(0.8, avg / 20, word / 9));
    return 'minmax(0,' + (Math.round(w * 10) / 10) + 'fr)';
  }).join(' ');
}
const LIST_ITEM = /^(\s*)([-*]|\d+\.)\s+(.*)$/;

/** Тело паспорта → разделы страницы: [{ title, html }]. `#` пропускается —
    это имя компонента, оно уже в шапке страницы. */
export function mdSections(md, link) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const sections = [];
  let cur = null;
  const push = (html) => {
    if (!cur) { cur = { title: 'Коротко', html: '' }; sections.push(cur); }
    cur.html += html + '\n';
  };
  const blockStart = (l) => /^#{1,6}\s/.test(l) || /^```/.test(l) || LIST_ITEM.test(l) || /^>\s?/.test(l) || l.trim().startsWith('|');
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = /^(#{1,6})\s+(.*)$/.exec(l))) {
      const level = m[1].length, text = m[2].trim();
      if (level === 2) { cur = { title: text.replace(/`/g, ''), html: '' }; sections.push(cur); }
      else if (level >= 3) { const h = Math.min(level, 4); push('<h' + h + ' class="kit-md__h' + h + '">' + inline(text, link) + '</h' + h + '>'); }
      i++;
      continue;
    }
    if (/^```/.test(l)) {
      const code = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++;
      push('<pre class="kit-md__pre"><code>' + esc(code.join('\n')) + '</code></pre>');
      continue;
    }
    if (l.trim().startsWith('|') && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1])) {
      const head = rowCells(l);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(rowCells(lines[i++]));
      push(dsTable(head.map((c) => inline(c, link)),
        rows.map((r) => head.map((_, k) => inline(r[k] || '', link))), trackWeights(head, rows)));
      continue;
    }
    if (LIST_ITEM.test(l)) {
      /* Список с одним уровнем вложенности; строка продолжения — к пункту. */
      const base = LIST_ITEM.exec(l)[1].length;
      const ordered = /\d+\./.test(LIST_ITEM.exec(l)[2]);
      const items = [];
      while (i < lines.length && lines[i].trim()) {
        const it = LIST_ITEM.exec(lines[i]);
        if (it && it[1].length <= base) items.push({ text: it[3], sub: [] });
        else if (it && items.length) items.at(-1).sub.push(it[3]);
        else if (items.length && !blockStart(lines[i].trim())) {
          const last = items.at(-1);
          if (last.sub.length) last.sub[last.sub.length - 1] += ' ' + lines[i].trim();
          else last.text += ' ' + lines[i].trim();
        } else break;
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      push('<' + tag + ' class="' + (ordered ? 'kit-md__ol' : 'bullets') + '">' + items.map((it) => '<li>' + inline(it.text, link)
        + (it.sub.length ? '<ul class="bullets kit-md__sub">' + it.sub.map((s) => '<li>' + inline(s, link) + '</li>').join('') + '</ul>' : '')
        + '</li>').join('') + '</' + tag + '>');
      continue;
    }
    if (/^>\s?/.test(l)) {
      const q = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
      push('<div class="kit-md__note"><p>' + inline(q.join(' '), link) + '</p></div>');
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !(para.length && blockStart(lines[i]))) para.push(lines[i++].trim());
    push('<p class="desc">' + inline(para.join(' '), link) + '</p>');
  }
  return sections;
}

/* ---------------- фрагмент и CSS ---------------- */

/** Открывающий тег корня фрагмента: { tag, attrs } или null. */
function rootOf(frag) {
  const m = /^<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/.exec(stripComments(frag).trimStart());
  if (!m) return null;
  const attrs = {};
  for (const a of m[2].matchAll(/([a-zA-Z_:][\w:.-]*)(?:\s*=\s*"([^"]*)")?/g)) attrs[a[1].toLowerCase()] = a[2] === undefined ? '' : a[2];
  return { tag: m[1].toLowerCase(), attrs };
}

/* Значения оси (data-state / data-mode), которые различает CSS виджета. */
function axisValues(css, attr, order) {
  const found = [];
  for (const m of css.matchAll(new RegExp('\\[' + attr + '\\s*[~^$*|]?=\\s*["\']?([\\w-]+)', 'g'))) if (!found.includes(m[1])) found.push(m[1]);
  const rank = (v) => (order.includes(v) ? order.indexOf(v) : order.length);
  return found.map((v, k) => ({ v, k })).sort((a, b) => rank(a.v) - rank(b.v) || a.k - b.k).map((x) => x.v);
}
const firstAttr = (frag, attr) => {
  const m = new RegExp('\\s' + attr + '="([^"]*)"').exec(stripComments(frag));
  return m ? m[1] : null;
};

/* ---------------- сбор ---------------- */

/** Страницы приложений с метками и что они вшивают. */
function hostIndex(P, apps) {
  const byTarget = new Map();
  const pages = [];
  for (const app of apps) {
    const dir = path.join(app.abs, P.appShape.pages);
    for (const f of filesOf(dir)) {
      if (!/\.html$/i.test(f) || /\.preview\.html$/i.test(f)) continue;
      const abs = path.join(dir, f);
      const text = read(abs);
      const incs = includesOf(text).filter((x) => x.attrs.src)
        .map((x) => ({ attrs: x.attrs, abs: path.resolve(dir, x.attrs.src) }));
      if (!incs.length) continue;
      const page = { abs, text, incs };
      pages.push(page);
      for (const inc of incs) {
        if (!byTarget.has(inc.abs)) byTarget.set(inc.abs, []);
        byTarget.get(inc.abs).push({ page, attrs: inc.attrs });
      }
    }
  }
  return { byTarget, pages };
}

/** Скрипты страницы-хозяина: до и после загрузчика ДС; только файлы приложений. */
function hostScripts(P, page) {
  const APPS = path.join(P.root, P.appsDir);
  const bodyAbs = path.join(P.root, P.boot.body);
  const pre = [], post = [];
  let afterBoot = false;
  for (const m of stripComments(page.text).matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)) {
    const abs = path.resolve(path.dirname(page.abs), m[1]);
    if (abs === bodyAbs) { afterBoot = true; continue; }
    if (!abs.startsWith(APPS + path.sep) || path.dirname(abs) === APPS || !existsSync(abs)) continue;
    (afterBoot ? post : pre).push(abs);
  }
  return { pre, post };
}

/* Каталог страниц ДС: имя компонента → файл страницы. */
function dsPages(P) {
  const map = new Map();
  if (!P.ds) return map;
  const L = DSP.layout(P.dsAbs);
  for (const p of [...L.pages()].sort((a, b) => (a.rel < b.rel ? -1 : 1))) {
    if (!map.has(p.name)) map.set(p.name, L.abs(p.rel));
  }
  return map;
}

function typeOf(fm, group, nested) {
  const t = TYPE_BY_WORD[String(fm.type || '').trim().toLowerCase()];
  if (t) return t;
  if (nested) return 'part';
  return TYPE_BY_GROUP[group] || 'tile';
}

/** Компоненты витрины и дефекты: { cfg, comps, defects, warnings }. */
export function collect(P) {
  const defects = [], warnings = [];
  const cfg = kitConfig(P);
  if (!cfg) return { cfg, comps: [], defects: ['КТ1 project.json не объявляет витрину (localKit) — собирать нечего'], warnings };
  if (!P.appsDir || !P.boot || !P.boot.head || !P.boot.body || !P.ds) {
    return { cfg, comps: [], defects: ['КТ1 project.json без каталога приложений, загрузчика ДС (boot) или каталога ДС — страницам витрины нечем подключить ДС'], warnings };
  }
  const apps = findApps(P.root, P.appsDir, P.appsManifest);
  const comps = [];
  for (const app of apps) {
    const W = path.join(app.abs, P.appShape.widgets);
    for (const group of (P.appShape.widgetGroups || dirsOf(W))) {
      for (const name of dirsOf(path.join(W, group))) {
        const walk = (dir, parent) => {
          const id = path.basename(dir);
          const md = path.join(dir, id + '.md');
          const own = existsSync(md);
          if (own) comps.push({ id, dir, group, parent, app });
          else if (!parent) defects.push('КТ2 ' + P.rel(dir) + '/ — у виджета нет паспорта ' + id + '.md');
          for (const sub of dirsOf(dir)) walk(path.join(dir, sub), own ? id : parent);
        };
        walk(path.join(W, group, name), null);
      }
    }
  }

  const byId = new Map();
  for (const c of comps) {
    if (byId.has(c.id)) defects.push('КТ6 ' + c.id + ' — два компонента с одним id: ' + P.rel(byId.get(c.id).dir) + '/ и ' + P.rel(c.dir) + '/');
    else byId.set(c.id, c);
    const mdAbs = path.join(c.dir, c.id + '.md');
    const { fm, body } = frontMatter(read(mdAbs));
    const at = (ext) => { const f = path.join(c.dir, c.id + ext); return existsSync(f) ? f : null; };
    Object.assign(c, {
      mdAbs, fm, body,
      name: fm.name || '', category: fm.category || '', purpose: fm.purpose || '',
      type: typeOf(fm, c.group, !!c.parent),
      module: c.app.dir,
      htmlAbs: at('.html'), cssAbs: at('.css'), jsAbs: at('.js'),
      fixturesAbs: existsSync(path.join(c.dir, 'fixtures.json')) ? path.join(c.dir, 'fixtures.json') : null,
    });
    const miss = ['name', 'category', 'purpose'].filter((k) => !c[k]);
    if (miss.length) defects.push('КТ2 ' + P.rel(mdAbs) + ' — нет полей паспорта: ' + miss.join(', '));
    else if (cfg.categories.length && !cfg.categories.includes(c.category)) {
      defects.push('КТ2 ' + P.rel(mdAbs) + ' — категории «' + c.category + '» нет в project.json → localKit.categories (' + cfg.categories.join(', ') + ')');
    }
    if (!c.htmlAbs) defects.push('КТ4 ' + P.rel(c.dir) + '/ — нет фрагмента ' + c.id + '.html');
  }

  /* Связи: имя виджета или путь до его .md в строке паспорта. */
  const ids = [...byId.keys()].sort((a, b) => b.length - a.length);
  const findId = (text, self) => {
    for (const m of text.matchAll(/([A-Za-z][\w-]*)\.md\b/g)) if (byId.has(m[1]) && m[1] !== self) return m[1];
    for (const id of ids) if (id !== self && new RegExp('(^|[^\\w])' + id + '(?![\\w])').test(text)) return id;
    return null;
  };
  const refs = (c, key) => listOf(c.fm[key]).map((text) => {
    const id = findId(text, c.id);
    if (!id && ['opens', 'uses', 'artifactOf'].includes(key)) warnings.push(P.rel(c.mdAbs) + ' → ' + key + ': «' + text + '» — не нашёл компонент витрины, показываю текстом');
    return { text, id };
  });
  for (const c of comps) {
    c.opens = refs(c, 'opens');
    c.uses = refs(c, 'uses');
    c.opensFrom = refs(c, 'opensFrom');
    c.artifactOfRef = refs(c, 'artifactOf');
    c.dependsOn = listOf(c.fm.dependsOn).map((text) => ({ text, id: findId(text, c.id) }));
  }
  /* Владелец в меню: окно или поповер — под тайлом, чей он артефакт. */
  for (const c of comps) {
    const own = c.artifactOfRef.find((r) => r.id);
    let owner = own ? own.id : null;
    if (!owner && (c.type === 'modal' || c.type === 'popover')) {
      const opener = comps.find((o) => o.id !== c.id && o.opens.some((r) => r.id === c.id));
      if (opener) owner = opener.id;
    }
    c.owner = owner && byId.has(owner) && byId.get(owner).owner !== c.id ? owner : null;
  }

  const hosts = hostIndex(P, apps);
  for (const c of comps) {
    c.hosts = c.htmlAbs ? (hosts.byTarget.get(c.htmlAbs) || []) : [];
    c.stub = !!(c.htmlAbs && /class="[^"]*__stub\b/.test(read(c.htmlAbs)));
  }
  comps.sort((a, b) => (a.module < b.module ? -1 : a.module > b.module ? 1 : 0) || a.id.localeCompare(b.id, 'en'));
  return { cfg, comps, byId, hosts, defects, warnings };
}

/* ---------------- страница компонента ---------------- */

/** Замыкание по opens/uses: сам компонент и всё, что он открывает и берёт. */
function closure(c, byId) {
  const seen = new Set([c.id]);
  const out = [c];
  for (let k = 0; k < out.length; k++) {
    for (const r of [...out[k].opens, ...out[k].uses]) {
      if (r.id && !seen.has(r.id) && byId.has(r.id)) { seen.add(r.id); out.push(byId.get(r.id)); }
    }
  }
  return out;
}

const kv = (rows) => {
  const live = rows.filter((r) => r && r[1]);
  return live.length ? dsTable(null, live.map((r) => ['<b>' + esc(r[0]) + '</b>', r[1]]), 'minmax(0,0.5fr) minmax(0,1.5fr)') : '';
};
const joinLinks = (items) => items.join(' · ');

function docPage(P, cfg, c, ctx) {
  const kitAbs = path.join(P.root, cfg.dir);
  const dir = path.join(kitAbs, c.module);
  const R = (abs) => rel(dir, abs);
  const H = (abs) => href(dir, abs);
  const dsAbs = path.join(P.root, P.ds);
  const docOf = (o) => path.join(kitAbs, o.module, o.id + '.doc.html');
  const compLink = (r) => (r.id && ctx.byId.has(r.id)
    ? '<a class="inl" href="' + esc(R(docOf(ctx.byId.get(r.id)))) + '">' + esc(r.text) + '</a>' : esc(r.text));
  const link = (target) => {
    if (/^[a-z]+:/i.test(target)) return target;
    if (target.startsWith('#')) return null;
    let abs;
    try { abs = path.resolve(c.dir, decodeURIComponent(target.split('#')[0])); } catch { return null; }
    const comp = ctx.byMd.get(abs);
    if (comp) return R(docOf(comp));
    if (!existsSync(abs)) return null;
    const preview = abs.replace(/\.html$/i, '.preview.html');
    return H(/\.html$/i.test(abs) && !/\.preview\.html$/i.test(abs) && existsSync(preview) ? preview : abs);
  };

  /* что вшить и подключить — со страницы-хозяина */
  const host = c.hosts[0] || null;
  const clos = closure(c, ctx.byId);
  const closDirs = clos.map((o) => o.dir);
  const inside = (abs) => closDirs.some((d) => abs.startsWith(d + path.sep));
  const carry = (attrs, keys) => keys.filter((k) => attrs[k]).map((k) => ' ' + k + '="' + esc(attrs[k]) + '"').join('');
  let nearby;
  if (host) {
    nearby = host.page.incs.filter((inc) => inc.abs !== c.htmlAbs && inside(inc.abs) && existsSync(inc.abs))
      .map((inc) => ({ abs: inc.abs, extra: carry(inc.attrs, ['id', 'state', 'mode']) }));
  } else {
    nearby = clos.slice(1).filter((o) => o.htmlAbs).map((o) => ({ abs: o.htmlAbs, extra: '' }));
  }
  const scripts = host ? hostScripts(P, host.page) : { pre: [], post: [] };
  for (const o of [...clos].reverse()) if (o.jsAbs && !scripts.post.includes(o.jsAbs)) scripts.post.push(o.jsAbs);

  /* демо: оси состояния и режима — из CSS виджета, по умолчанию — из фрагмента */
  const frag = read(c.htmlAbs);
  const css = c.cssAbs ? read(c.cssAbs) : '';
  const root = rootOf(frag);
  const defState = firstAttr(frag, 'data-state');
  const defMode = firstAttr(frag, 'data-mode');
  const states = axisValues(css, 'data-state', STATE_ORDER);
  const modes = axisValues(css, 'data-mode', MODE_ORDER);
  if (defState && !states.includes(defState)) states.unshift(defState);
  if (defMode && !modes.includes(defMode)) modes.unshift(defMode);
  const col = host && /\bcol-(\d+)\b/.exec(host.attrs.class || '');
  const width = WIDTH_TYPES.has(c.type)
    ? (col ? Math.round(Number(col[1]) * 1600 / 12 / 10) * 10 : (c.type === 'table' ? 1200 : 400)) : null;
  const scrim = root && /\bmodal-scrim\b/.test(root.attrs.class || '');
  let fixtures = null;
  if (c.fixturesAbs) { try { fixtures = JSON.parse(read(c.fixturesAbs)); } catch (e) { ctx.defects.push('КТ2 ' + P.rel(c.fixturesAbs) + ' не читается как JSON: ' + e.message); } }
  const demoAbs = path.join(dir, c.id + '.demo.js');

  const page = {
    id: c.id, type: c.type, base: R(kitAbs), hub: R(path.join(P.root, P.hubPage || 'index.html')),
    states, modes, state: defState || states[0] || null, mode: defMode || modes[0] || null, width,
    scenario: existsSync(demoAbs), fixtures,
  };

  /* документация: шапка, карточка, состав, связи, разделы паспорта */
  const hostLinks = c.hosts.map((h) => {
    const prev = h.page.abs.replace(/\.html$/i, '.preview.html');
    return '<a class="inl" href="' + esc(H(existsSync(prev) ? prev : h.page.abs)) + '">' + esc(P.rel(h.page.abs)) + '</a>';
  }).filter((x, k, a) => a.indexOf(x) === k);
  const artifacts = ctx.comps.filter((o) => o.owner === c.id);
  const card = kv([
    ['Тип', esc(TYPE_LABEL[c.type])],
    ['Модуль', '<code class="tok">' + esc(P.appsDir + '/' + c.module) + '</code>'],
    ['Папка', '<a class="inl" href="' + esc(H(c.dir)) + '">' + esc(P.rel(c.dir)) + '/</a>'],
    ['Пара во фронтенде', c.fm.frontend ? '<code class="tok">' + esc(c.fm.frontend) + '</code>' : 'в паспорте не указана'],
    ['Где стоит', esc(listOf(c.fm.usedOn).join(', '))],
    ['Страницы', hostLinks.join('<br>')],
    ['Варианты', listOf(c.fm.variants).map(esc).join('<br>')],
    ['Версия', esc([c.fm.version, c.fm.updated && 'обновлено ' + c.fm.updated].filter(Boolean).join(' · '))],
    ['Владелец', esc(c.fm.owner)],
    ['Дизайнер', esc(c.fm.designer)],
  ]);
  const dsLinks = listOf(c.fm.ds).map((n) => (ctx.dsPages.has(n)
    ? '<a class="inl" href="' + esc(R(ctx.dsPages.get(n))) + '">' + esc(n) + '</a>' : esc(n)));
  const files = filesOf(c.dir).map((f) => '<a class="inl" href="' + esc(H(path.join(c.dir, f))) + '">' + esc(f) + '</a>');
  const subs = dirsOf(c.dir).map((d) => {
    const o = ctx.byId.get(d);
    return o && o.dir === path.join(c.dir, d) ? compLink({ text: d, id: d }) : '<a class="inl" href="' + esc(H(path.join(c.dir, d))) + '">' + esc(d) + '/</a>';
  });
  const made = kv([
    ['Компоненты ДС', joinLinks(dsLinks)],
    ['Локальные компоненты', c.uses.map(compLink).join('<br>')],
    ['Файлы', joinLinks(files)],
    ['Подчасти', joinLinks(subs)],
  ]);
  /* Связь «тайл → окно» записана с двух сторон: opens тайла и artifactOf
     окна. На странице — одна строка с каждой стороны, компонент — один раз,
     в едином виде «имя (id)»; не найденное в витрине — текстом паспорта. */
  const named = (o) => compLink({ text: o.name + ' (' + o.id + ')', id: o.id });
  const opened = [];
  const openedText = [];
  for (const r of c.opens) {
    if (r.id && ctx.byId.has(r.id)) { if (!opened.includes(r.id)) opened.push(r.id); }
    else openedText.push(esc(r.text));
  }
  for (const o of artifacts) if (!opened.includes(o.id)) opened.push(o.id);
  const openedBy = c.owner ? [named(ctx.byId.get(c.owner))]
    : c.artifactOfRef.map((r) => (r.id && ctx.byId.has(r.id) ? named(ctx.byId.get(r.id)) : esc(r.text)));
  const ties = kv([
    ['Открывает', [...opened.map((id) => named(ctx.byId.get(id))), ...openedText].join('<br>')],
    ['Открывается из', openedBy.join('<br>')],
    /* opensFrom — описание триггера фразой; запятые делят её на элементы списка, собираем обратно */
    ['Как открывается', c.opensFrom.map(compLink).join(', ')],
    ['Зависит от', c.dependsOn.map(compLink).join('<br>')],
  ]);
  const casesHtml = '<div class="kit-cases' + (WIDTH_TYPES.has(c.type) && c.type !== 'table' ? '' : ' kit-cases--wide') + '" id="kit-cases"></div>';
  const md = mdSections(c.body, link);
  let casesPlaced = false;
  for (const s of md) {
    if (!casesPlaced && /^Состояния/i.test(s.title)) {
      s.html += '<h3 class="kit-md__h3">Все состояния рядом</h3>\n<p class="desc">Каждая комбинация состояния данных и режима прав — копия фрагмента виджета.</p>\n' + casesHtml + '\n';
      casesPlaced = true;
    }
  }
  const section = (title, html) => '<section class="section kit-md" data-screen-label="' + esc(title) + '">\n<h2>' + esc(title) + '</h2>\n' + html + '\n</section>';
  const docs = [
    '<header class="masthead">',
    '  <div class="meta"><span>Тип: <b>' + esc(TYPE_LABEL[c.type]) + '</b></span>'
      + (c.fm.version ? '<span>Версия: <b>' + esc(c.fm.version) + '</b></span>' : '')
      + (c.fm.updated ? '<span>Обновлено: <b>' + esc(c.fm.updated) + '</b></span>' : '')
      + '<span>Категория: <b>' + esc(c.category) + '</b></span></div>',
    '  <p class="eyebrow"><a class="inl" href="' + esc(R(path.join(kitAbs, 'index.html'))) + '">' + esc(cfg.title) + '</a> · ' + esc(c.module) + '</p>',
    '  <h1>' + esc(c.name) + '</h1>',
    '  <p class="lead">' + esc(c.purpose) + '</p>',
    '</header>',
    section('Паспорт коротко', card),
    section('Из чего собран', made),
    ties ? section('Связи', ties) : '',
    casesPlaced ? '' : section('Состояния', '<p class="desc">Каждая комбинация состояния данных и режима прав — копия фрагмента виджета.</p>\n' + casesHtml),
    ...md.map((s) => section(s.title, s.html)),
    '<footer class="page-foot"><p class="desc">Страница собрана из паспорта <code class="tok">' + esc(P.rel(c.mdAbs)) + '</code> и файлов виджета. Правится паспорт и виджет, затем <code class="tok">node ' + esc(P.tools) + '/' + GEN + '</code>.</p></footer>',
  ].filter(Boolean).join('\n');

  const inc = (abs, extra) => '<ds-include src="' + esc(R(abs)) + '"' + extra + '></ds-include>';
  const subjectExtra = carry(host ? host.attrs : {}, ['id']) + (scrim ? ' class="modal-scrim--inline"' : '');
  const stageCls = 'pg__stagebox kit-stage kit-stage--' + c.type;
  const script = (abs) => '<script src="' + esc(H(abs)) + '"></script>';
  const source = [
    '<!DOCTYPE html>',
    '<!-- СГЕНЕРИРОВАН ' + GEN + ' из ' + P.rel(c.dir) + '/ — руками не править.',
    '     Паспорт, фрагмент, CSS и JS — в папке виджета; пересобрать —',
    '     node ' + P.tools + '/' + GEN + ' (гейт сверяет, шаг kit). -->',
    '<html lang="ru">',
    '<head>',
    '<script src="' + esc(R(path.join(P.root, P.boot.head))) + '"></script>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<title>' + esc(c.name) + ' — ' + esc(cfg.title) + '</title>',
    ...KIT_PAGE_CSS
      .map((f) => '<link rel="stylesheet" href="' + esc(R(path.join(dsAbs, f))) + '">'),
    '<link rel="stylesheet" href="' + esc(R(path.join(kitAbs, 'kit.css'))) + '">',
    '<!-- @lc-css -->',
    '</head>',
    '<body>',
    '<div class="nav-layout">',
    '  <nav class="nav nav--fixed" id="nav" aria-label="' + esc(cfg.title) + '">',
    '    <div class="nav__top">',
    '      <button type="button" class="ibtn ibtn--neutral ibtn--m nav__burger" aria-label="Свернуть меню"><i data-icon="left-menu"></i></button>',
    '      <button type="button" class="ibtn ibtn--neutral ibtn--m nav__pin" aria-pressed="false" aria-label="Закрепить панель"><i data-icon="pin-menu"></i></button>',
    '    </div>',
    '    <div class="nav__list"></div>',
    '    <div class="nav__footer">',
    '      <a class="nav__user" href="' + esc(page.hub) + '" aria-label="Хаб проектов">',
    '        <span class="av av--circular av--m"><span class="av__text">АП</span></span>',
    '        <span class="nav__user-text"><span class="nav__user-name">Александров Петр Константинович</span><span class="nav__user-role">Финансист ДИД</span></span>',
    '      </a>',
    '      <button type="button" class="ibtn ibtn--neutral ibtn--m nav__logout" aria-label="Выйти"><i data-icon="logout"></i></button>',
    '    </div>',
    '  </nav>',
    '',
    '  <main class="page ds-split" data-screen-label="' + esc(c.name) + '">',
    '    <div class="splitpane splitpane--h" data-splitter data-min="25" data-max="75" data-initial="42">',
    '      <div class="splitpane__panel splitpane__a app-pane-demo">',
    '        <div class="demo-stage">',
    '          <div class="pg__stage"><div class="' + stageCls + '" id="pg-stage">',
    c.htmlAbs ? inc(c.htmlAbs, subjectExtra) : '',
    '          </div></div>',
    '        </div>',
    '      </div>',
    '',
    '      <div class="spl spl--h" role="separator" aria-orientation="horizontal" aria-label="Изменить высоту демо" tabindex="0"><span class="spl__grip"><i></i><i></i><i></i><i></i><i></i><i></i></span></div>',
    '',
    '      <div class="splitpane__panel splitpane__b app-pane-docs">',
    '        <div class="tabs tabs--horiz" role="tablist" data-tabs aria-label="Разделы страницы">',
    '          <button type="button" class="tab tab--m" id="tab-constructor" role="tab" aria-selected="false" tabindex="-1" data-pane="pane-constructor" aria-controls="pane-constructor"><span class="tab__label">Конструктор</span></button>',
    '          <button type="button" class="tab tab--m tab--selected" id="tab-docs" role="tab" aria-selected="true" tabindex="0" data-pane="pane-docs" aria-controls="pane-docs"><span class="tab__label">Документация</span></button>',
    '          <button type="button" class="tab tab--m" id="tab-code" role="tab" aria-selected="false" tabindex="-1" data-pane="pane-code" aria-controls="pane-code"><span class="tab__label">Код</span></button>',
    '        </div>',
    '',
    '        <div class="tabs-body">',
    '          <div class="tabpane" id="pane-docs" role="tabpanel" aria-labelledby="tab-docs">',
    '            <div class="docs-layout">',
    '              <div class="docs-main">',
    docs,
    '              </div>',
    '              <nav class="docs-toc" id="docs-toc" aria-label="Содержание страницы"></nav>',
    '            </div>',
    '          </div>',
    '',
    '          <div class="tabpane" id="pane-constructor" role="tabpanel" aria-labelledby="tab-constructor" hidden>',
    '            <div class="docs-layout">',
    '              <div class="docs-main">',
    '                <h2>Конструктор</h2>',
    '                <p class="desc">Состояния данных — из селекторов <code class="tok">[data-state]</code> в CSS виджета, режимы прав — из <code class="tok">[data-mode]</code>.'
      + (page.scenario ? ' Данные демо — из <code class="tok">fixtures.json</code>, сценарий — <code class="tok">' + esc(c.id) + '.demo.js</code> рядом со страницей.' : '') + '</p>',
    '                <div class="pg__controls" id="pg-controls"></div>',
    '              </div>',
    '            </div>',
    '          </div>',
    '',
    '          <div class="tabpane" id="pane-code" role="tabpanel" aria-labelledby="tab-code" hidden>',
    '            <div class="docs-layout">',
    '              <div class="docs-main">',
    '                <h2>Код компонента</h2>',
    '                <p class="desc">Файлы виджета как есть, из <code class="tok">' + esc(P.rel(c.dir)) + '/</code>.</p>',
    '                <div class="segctrl segctrl--s code-switch" role="radiogroup" aria-label="Язык кода" data-segctrl>',
    '                  <div class="segctrl__thumb"></div>',
    '                  <button type="button" class="segctrl__item" role="radio" aria-checked="true" data-lang="html"><span class="segctrl__label">HTML</span></button>',
    '                  <button type="button" class="segctrl__item" role="radio" aria-checked="false" data-lang="css"><span class="segctrl__label">CSS</span></button>',
    '                  <button type="button" class="segctrl__item" role="radio" aria-checked="false" data-lang="js"><span class="segctrl__label">JS</span></button>',
    '                </div>',
    '                <div class="code-panel code-view" data-view="html"><pre><code id="code-out-html"></code></pre></div>',
    '                <div class="code-panel code-view" data-view="css" hidden><pre><code id="code-out-css"></code></pre></div>',
    '                <div class="code-panel code-view" data-view="js" hidden><pre><code id="code-out-js"></code></pre></div>',
    '              </div>',
    '            </div>',
    '          </div>',
    '        </div>',
    '      </div>',
    '    </div>',
    '  </main>',
    '</div>',
    '',
    '<!-- Соседние фрагменты — как на странице-хозяине' + (host ? ' (' + P.rel(host.page.abs) + ')' : '') + ': окна и подчасти, которые открывает виджет. -->',
    ...nearby.map((n) => inc(n.abs, n.extra)),
    '',
    ...scripts.pre.map(script),
    '<script src="' + esc(R(path.join(P.root, P.boot.body))) + '" data-ds="' + esc(DS_HERE.at.homeCatalog) + '"></script>',
    '<script src="' + esc(R(path.join(P.root, cfg.registry))) + '"></script>',
    '<script src="' + esc(R(path.join(kitAbs, 'kit-nav.js'))) + '"></script>',
    '<script src="' + esc(R(path.join(kitAbs, 'kit-docpage.js'))) + '"></script>',
    ...scripts.post.map(script),
    page.scenario ? '<script src="' + esc(R(demoAbs)) + '"></script>' : '',
    '<!-- @kit-page -->',
    '<script src="' + esc(R(path.join(dsAbs, DS_HERE.at.docsSplitJs))) + '"></script>',
    '<!-- @kit-code -->',
    '</body>',
    '</html>',
    '',
  ].filter((l) => l !== '').join('\n');

  const built = assemble(source, dir).html.replace(/\r\n/g, '\n');
  const plain = (id, text) => '<script type="text/plain" id="' + id + '">\n' + text.replace(/<\/script/gi, '<\\/script').replace(/\s+$/, '') + '\n</script>';
  const json = JSON.stringify(page).replace(/</g, '\\u003c');
  return built
    .replace('<!-- @kit-page -->', '<script>\nwindow.IBPKitPage = ' + json + ';\nwindow.IBPKitDoc.page(window.IBPKitPage);\n</script>')
    .replace('<!-- @kit-code -->', [
      plain('src-code-html', frag),
      plain('src-code-css', css || '/* У компонента нет своего CSS: вид дают стили ДС. */'),
      plain('src-code-js', c.jsAbs ? read(c.jsAbs) : '/* У компонента нет своего скрипта: поведение дают рантаймы ДС. */'),
    ].join('\n'));
}

/* ---------------- реестр ---------------- */

function registryText(P, cfg, comps) {
  const data = {
    title: cfg.title,
    categories: cfg.categories,
    components: comps.map((c) => ({
      id: c.id, name: c.name, category: c.category, purpose: c.purpose,
      type: c.type, typeLabel: TYPE_LABEL[c.type], module: c.module,
      doc: c.module + '/' + c.id + '.doc.html', owner: c.owner, stub: c.stub,
      version: c.fm.version || null, updated: c.fm.updated || null,
    })),
  };
  return [
    '/* Реестр витрины локальных компонентов — меню и карточки страниц ' + cfg.dir + '/.',
    '',
    '   СГЕНЕРИРОВАН ' + GEN + ' из паспортов виджетов (' + P.appsDir + '/<раздел>/<модуль>/' + P.appShape.widgets + '/<группа>/<Имя>/<Имя>.md)',
    '   и project.json → localKit. Руками не править: пересобрать — node ' + P.tools + '/' + GEN,
    '   (гейт сверяет, шаг kit).',
    '',
    '   Обычный <script>, а не JSON: страницы открываются по file://, где fetch не работает.',
    '',
    '   Поля компонента: id — папка виджета; name, category, purpose, version, updated —',
    '   из паспорта; type — tile | table | modal | popover | context-menu | part (подчасть);',
    '   module — <раздел>/<модуль>; doc — страница компонента от папки витрины; owner —',
    '   id компонента, чей это артефакт (окно, поповер), или null; stub — заглушка. */',
    'window.IBPKit = ' + JSON.stringify(data, null, 2) + ';',
    '',
  ].join('\n');
}

/* ---------------- сборка и сверка ---------------- */

/** Что должно лежать в витрине: Map(путь от корня → текст) и дефекты. */
export function plan(P) {
  const res = collect(P);
  const out = new Map();
  if (!res.cfg || res.defects.some((d) => d.startsWith('КТ1'))) return { ...res, out };
  const ctx = {
    comps: res.comps, byId: res.byId, defects: res.defects, dsPages: dsPages(P),
    byMd: new Map(res.comps.map((c) => [c.mdAbs, c])),
  };
  for (const c of res.comps) {
    if (!c.htmlAbs || res.byId.get(c.id) !== c) continue;
    const file = res.cfg.dir + '/' + c.module + '/' + c.id + '.doc.html';
    try { out.set(file, docPage(P, res.cfg, c, ctx)); } catch (e) { res.defects.push('КТ3 ' + file + ' — не собирается: ' + e.message); }
  }
  out.set(res.cfg.registry, registryText(P, res.cfg, res.comps.filter((c) => res.byId.get(c.id) === c)));
  return { ...res, out };
}

/* Страницы компонентов, лежащие в витрине сейчас. */
function docsOnDisk(P, cfg) {
  const found = [];
  const walk = (abs) => {
    let list;
    try { list = readdirSync(abs, { withFileTypes: true }); } catch { return; }
    for (const e of list) {
      const full = path.join(abs, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.doc\.html$/i.test(e.name)) found.push(P.rel(full));
    }
  };
  walk(path.join(P.root, cfg.dir));
  return found.sort();
}

export function check(P, write = false) {
  const res = plan(P);
  const { cfg, out, defects, warnings } = res;
  const written = [], removed = [];
  if (!cfg || defects.some((d) => /^КТ[124]/.test(d))) return { defects, warnings, written, removed, count: 0 };
  for (const [file, text] of out) {
    const abs = path.join(P.root, file);
    const same = existsSync(abs) && read(abs) === text;
    if (same) continue;
    if (write) { mkdirSync(path.dirname(abs), { recursive: true }); writeFileSync(abs, text, 'utf8'); written.push(file); }
    else defects.push('КТ3 ' + file + (existsSync(abs) ? ' разошёлся с виджетами' : ' нет') + ' — пересобрать: node ' + P.tools + '/' + GEN);
  }
  for (const file of docsOnDisk(P, cfg)) {
    if (out.has(file)) continue;
    if (write) { unlinkSync(path.join(P.root, file)); removed.push(file); }
    else defects.push('КТ5 ' + file + ' — виджета больше нет, страница лишняя — пересобрать: node ' + P.tools + '/' + GEN);
  }
  return { defects, warnings, written, removed, count: out.size - 1 };
}

function report(title, { defects, warnings, written, removed, count }) {
  const out = ['== ' + title + ' ==', 'компонентов: ' + count];
  for (const w of written) out.push('записан ' + w);
  for (const r of removed) out.push('удалён ' + r);
  for (const w of warnings) out.push('ВНИМАНИЕ  ' + w);
  for (const d of defects) out.push('FAIL  ' + d);
  out.push('ВЕРДИКТ: ' + (defects.length ? 'FAIL (дефектов: ' + defects.length + ')' : 'OK'));
  return out.join('\n');
}

/* ---------------- selftest: откат на временном дереве ---------------- */

function put(root, relPath, text) {
  const p = path.join(root, relPath);
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, text, 'utf8');
}

const MANIFEST = {
  contract: 1, id: 't', designSystem: { mount: 'ds' }, agentKit: { mount: '.kit', tools: '.kit/tools' },
  boot: { dir: 'apps', head: 'apps/ds-config.js', body: 'apps/ds-body.js' },
  hub: { page: 'index.html', registry: 'hub.js' }, apps: { dir: 'apps', manifest: 'app.json' },
  appShape: { pages: 'pages', widgets: 'widgets', data: 'data', refs: 'refs', widgetGroups: ['tiles', 'modals'] },
  tracks: [{ id: 'product', title: 'Проекты', hubGroup: 'projects' }],
  localKit: { dir: 'apps/local-components', registry: 'apps/local-components/kit-data.js', id: 'kit', title: 'Кит', desc: 'тест', icon: 'layout-grid-01', categories: ['Общие', 'Сделка'] },
};
const MOD = 'apps/postrade/deals-app';
const TILE = MOD + '/widgets/tiles/KnrTile/KnrTile';
const MODAL = MOD + '/widgets/modals/KnrModal/KnrModal';
const MD_TILE = (patch = '') => '---\nname: КНР\ncategory: Сделка\npurpose: Показать КНР\nds: [Tile, Link]\nopens: [KnrModal]\n' + patch
  + '---\n\n# КНР\n\n## Описание\n\nТайл **КНР**, окно — [KnrModal.md](../../modals/KnrModal/KnrModal.md).\n\n## Состояния\n\n| Состояние | Вид |\n|---|---|\n| Данные | строки `a | b` |\n';
const MD_MODAL = (patch = 'artifactOf: КНР (../../tiles/KnrTile/KnrTile.md)\n') => '---\nname: Окно КНР\ncategory: Сделка\npurpose: Выбрать КНР\n' + patch + '---\n\n# Окно\n';
const DEAL = '<!DOCTYPE html>\n<html><head>\n<script src="../../../ds-config.js"></script>\n<!-- @lc-css -->\n</head><body>\n'
  + '<ds-include src="../widgets/tiles/KnrTile/KnrTile.html" class="col-3 colw-6" id="tile-knr" state="loading"></ds-include>\n'
  + '<ds-include src="../widgets/modals/KnrModal/KnrModal.html"></ds-include>\n'
  + '<script src="../data/mock.js"></script>\n<script src="../../../ds-body.js"></script>\n'
  + '<script src="../widgets/modals/KnrModal/KnrModal.js"></script>\n<script src="../widgets/tiles/KnrTile/KnrTile.js"></script>\n</body></html>\n';

function tree(r) {
  put(r, 'project.json', JSON.stringify(MANIFEST));
  put(r, 'ds/components/atoms/Divider/Divider.html', '');      // ДС стенда: страниц без раскладки не бывает
  put(r, 'ds/foundations/.keep', '');
  put(r, 'apps/ds-config.js', '');
  put(r, 'apps/ds-body.js', '');
  put(r, MOD + '/app.json', '{}');
  put(r, MOD + '/data/mock.js', 'window.MOCK = 1;\n');
  put(r, TILE + '.md', MD_TILE());
  put(r, TILE + '.html', '<section class="tile lc-knr" data-state="data" data-mode="edit"><button data-modal="knr-scrim">Изм</button></section>\n');
  put(r, TILE + '.css', '.lc-knr[data-state="empty"] {}\n.lc-knr[data-state="error"] {}\n.lc-knr[data-mode="view"] {}\n');
  put(r, TILE + '.js', 'window.PostTileKNR = {};\n');
  put(r, MODAL + '.md', MD_MODAL());
  put(r, MODAL + '.html', '<div class="modal-scrim" id="knr-scrim" hidden><div class="modal lc-knrm" data-mode="edit"></div></div>\n');
  put(r, MODAL + '.js', 'window.KnrModal = {};\n');
  put(r, MOD + '/pages/Deal.html', DEAL);
}

const CASES = [
  { name: 'собрано — диффа нет', expect: null, build: true },
  { name: 'витрина не собрана', expect: 'КТ3 apps/local-components/postrade/deals-app/KnrTile.doc.html нет' },
  { name: 'фрагмент правлен без пересборки', expect: 'КТ3 apps/local-components/postrade/deals-app/KnrTile.doc.html разошёлся', build: true,
    mutate: (r) => put(r, TILE + '.html', '<section class="tile lc-knr" data-state="empty">правка</section>\n') },
  { name: 'страница-хозяин правлена без пересборки', expect: 'КТ3 apps/local-components/postrade/deals-app/KnrTile.doc.html', build: true,
    mutate: (r) => put(r, MOD + '/pages/Deal.html', DEAL.replace('<script src="../data/mock.js"></script>\n', '')) },
  { name: 'паспорт без category', expect: 'КТ2 ' + TILE + '.md — нет полей паспорта: category',
    mutate: (r) => put(r, TILE + '.md', MD_TILE().replace('category: Сделка\n', '')) },
  { name: 'категория не из списка', expect: 'категории «Отчёты» нет',
    mutate: (r) => put(r, TILE + '.md', MD_TILE().replace('category: Сделка', 'category: Отчёты')) },
  { name: 'папка виджета без паспорта', expect: 'КТ2 ' + MOD + '/widgets/tiles/NoPassTile/ — у виджета нет паспорта',
    mutate: (r) => put(r, MOD + '/widgets/tiles/NoPassTile/NoPassTile.html', '<section class="tile"></section>\n') },
  { name: 'нет фрагмента', expect: 'КТ4 ' + MOD + '/widgets/modals/KnrModal/',
    mutate: (r) => rmSync(path.join(r, MODAL + '.html')) },
  { name: 'виджет удалён после сборки', expect: 'КТ5 apps/local-components/postrade/deals-app/KnrModal.doc.html', build: true,
    mutate: (r) => rmSync(path.join(r, MOD + '/widgets/modals/KnrModal'), { recursive: true, force: true }) },
  { name: 'одинаковый id в двух модулях', expect: 'КТ6 KnrTile',
    mutate: (r) => {
      put(r, 'apps/postrade/payments-app/app.json', '{}');
      put(r, 'apps/postrade/payments-app/widgets/tiles/KnrTile/KnrTile.md', MD_TILE());
      put(r, 'apps/postrade/payments-app/widgets/tiles/KnrTile/KnrTile.html', '<section class="tile"></section>\n');
    } },
  { name: 'манифест без localKit', expect: 'КТ1',
    mutate: (r) => { const { localKit, ...rest } = MANIFEST; put(r, 'project.json', JSON.stringify(rest)); } },
  { name: 'CRLF в собранной странице — не расхождение', expect: null, build: true,
    mutate: (r) => { const f = path.join(r, 'apps/local-components/postrade/deals-app/KnrTile.doc.html'); writeFileSync(f, readFileSync(f, 'utf8').replace(/\n/g, '\r\n')); } },
];

function selftest() {
  const out = ['== kit-build --selftest =='];
  let failed = 0;
  const ok = (pass, name, detail) => { if (!pass) failed++; out.push((pass ? 'ok    ' : 'FAIL  ') + name + ' — ' + detail); };
  const withTree = (fn) => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'kit-build-'));
    try { tree(root); return fn(root); } finally { rmSync(root, { recursive: true, force: true }); }
  };
  for (const c of CASES) {
    withTree((root) => {
      if (c.build) check(project(root), true);
      if (c.mutate) c.mutate(root);
      const { defects } = check(project(root));
      const pass = c.expect === null ? defects.length === 0 : defects.some((d) => d.includes(c.expect));
      ok(pass, c.name, defects.length ? defects.join(' | ') : 'дефектов нет');
    });
  }
  /* Реестр выполняется, окно — под тайлом (artifactOf путём до .md). */
  withTree((root) => {
    check(project(root), true);
    const ctx = { window: {} };
    let got;
    try { vm.runInNewContext(readFileSync(path.join(root, 'apps/local-components/kit-data.js'), 'utf8'), ctx); got = ctx.window.IBPKit; } catch (e) { got = e.message; }
    const modal = got && got.components && got.components.find((x) => x.id === 'KnrModal');
    ok(!!(modal && got.components.length === 2 && modal.owner === 'KnrTile'), 'реестр выполняется, окно под тайлом',
      got && got.components ? got.components.map((x) => x.id + '←' + x.owner).join(' ') : String(got));
  });
  /* Связь только через opens тайла, записанный путём до .md, — окно всё равно под тайлом. */
  withTree((root) => {
    put(root, TILE + '.md', MD_TILE().replace('opens: [KnrModal]', 'opens: ["Окно КНР → widgets/modals/KnrModal/KnrModal.md (паспорт артефакта)"]'));
    put(root, MODAL + '.md', MD_MODAL(''));
    const { comps } = collect(project(root));
    const modal = comps.find((x) => x.id === 'KnrModal');
    ok(!!modal && modal.owner === 'KnrTile', 'opens путём до .md — окно под тайлом', modal ? 'owner ' + modal.owner : 'окна нет');
  });
  /* Страница: фрагмент вшит, окно рядом, меток нет, CSS и скрипты хозяина на месте. */
  withTree((root) => {
    check(project(root), true);
    const html = readFileSync(path.join(root, 'apps/local-components/postrade/deals-app/KnrTile.doc.html'), 'utf8');
    const modal = readFileSync(path.join(root, 'apps/local-components/postrade/deals-app/KnrModal.doc.html'), 'utf8');
    const tiesOf = (page) => (page.match(/data-screen-label="Связи">[\s\S]*?<\/section>/) || [''])[0];
    const want = {
      'фрагмент вшит': html.includes('<section class="tile lc-knr" data-state="data" data-mode="edit" id="tile-knr">'),
      'окно рядом': html.includes('<div class="modal-scrim" id="knr-scrim" hidden>'),
      'меток нет': !html.includes('<ds-include'),
      'CSS виджета': html.includes('<link rel="stylesheet" href="../../../postrade/deals-app/widgets/tiles/KnrTile/KnrTile.css">'),
      'данные хозяина': html.includes('<script src="../../../postrade/deals-app/data/mock.js"></script>'),
      'оси из CSS': html.includes('"states":["data","empty","error"]') && html.includes('"modes":["edit","view"]'),
      'ширина из col-3': html.includes('"width":400'),
      'таблица паспорта': html.includes('<span class="tc__text">строки <code class="tok">a | b</code></span>') && !html.includes('<table'),
      'футер ведёт на хаб': html.includes('<a class="nav__user" href="../../../../index.html"'),
      'ссылка на окно': html.includes('<a class="inl" href="KnrModal.doc.html">KnrModal.md</a>'),
      'окно в связях один раз': tiesOf(html).split('href="KnrModal.doc.html"').length === 2
        && tiesOf(html).includes('<a class="inl" href="KnrModal.doc.html">Окно КНР (KnrModal)</a>'),
      'у окна — откуда открывается': tiesOf(modal).split('href="KnrTile.doc.html"').length === 2
        && tiesOf(modal).includes('<b>Открывается из</b>'),
    };
    const bad = Object.keys(want).filter((k) => !want[k]);
    ok(!bad.length, 'страница тайла собрана как у хозяина', bad.length ? 'нет: ' + bad.join(', ') : 'всё на месте');
    ok(modal.includes('class="modal-scrim modal-scrim--inline"'), 'окно на своей странице — встроено в стенд',
      modal.includes('modal-scrim--inline') ? 'класс есть' : 'класса нет');
  });
  const total = CASES.length + 4;
  out.push('ВЕРДИКТ: ' + (failed ? 'FAIL (кейсов не прошло: ' + failed + ' из ' + total + ')' : 'OK (кейсов: ' + total + ')'));
  console.log(out.join('\n'));
  process.exit(failed ? 1 : 0);
}

/* ---------------- main ---------------- */

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();
  const P = need('kit-build', HERE);
  const write = !args.includes('--check');
  const res = check(P, write);
  console.log(report(write ? 'kit-build' : 'kit-build --check', res));
  process.exit(res.defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SELF) main();

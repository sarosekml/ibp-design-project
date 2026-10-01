#!/usr/bin/env node
/* ============================================================
   DS-PATHS — единственное место, которое знает раскладку ДС.

   Где лежат стили, рантаймы, страницы документации и спеки, инструменты ДС
   и оснастка проекта узнают здесь, а не литералами `styles/…`, `scripts/…`,
   `pages/…`, `specs/…`. Переезд раскладки (задача RE0002: компонент — в своей
   папке) правит только раздел «Раскладка» ниже; API и инструменты остаются.

   Две половины API:
   - строковая — at, kindOf, specOf: диска не трогает. Отвечает и про
     удалённый файл (маршруты гейта), и про стенд селфтеста;
   - списки — styles, scripts, runtimes, pageScripts, pages, specs, а также
     pageOf и поля YAML спеки: читают диск. Нет каталога раскладки или в нём
     ни одного файла своего вида — список БРОСАЕТ, а не возвращает пустоту:
     пустой список значил бы, что проверка молча ничего не проверила (раздел 7
     задачи RE0002).

   Списки отдаются в порядке обхода диска, как их раньше получали сами
   инструменты; кому нужен порядок, тот сортирует.

   Запуск, из корня ДС:
     node tools/ds-paths.mjs <Имя>   — файлы компонента: страница, спека, сценарий,
                                        рантайм, стили (код 1 — компонента нет)
   ============================================================ */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Корень ДС — каталог выше tools/. */
export const DS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ---------- Раскладка: плоская, до RE0002 ----------
   styles/ — CSS компонентов, основ и оболочки документации; scripts/ —
   рантаймы, сценарии страниц, оболочка документации, общие рантаймы, данные
   иконок, точка входа ds.js и инструменты; pages/<категория>/<Имя>.html —
   страницы документации; specs/ — спеки и общие файлы `_*.md`. */
const LAYOUT = 'плоская: styles/, scripts/, pages/, specs/';
const DIR = { styles: 'styles', scripts: 'scripts', pages: 'pages', specs: 'specs' };

const AT = {
  entryJs: 'scripts/ds.js', bundleCss: 'ds.css', home: 'index.html',
  nav: 'scripts/ds-nav.js', docsSplitJs: 'scripts/docs-split.js',
  docsCss: 'styles/ds-docs.css', docsSplitCss: 'styles/docs-split.css',
  iconsData: 'scripts/icons-data.js', iconsRuntime: 'scripts/ds-icons.js', homeCatalog: 'scripts/ibp-home.js',
  specIndex: 'specs/_index.md', cheatsheet: 'specs/_cheatsheet.md',
  runtimeHooks: 'specs/_runtime-hooks.md', specTemplate: 'specs/_TEMPLATE.md',
  linter: 'scripts/ds-lint.js', lintCli: 'scripts/ds-lint-cli.mjs', check: 'scripts/ds-check.mjs',
  specAudit: 'scripts/spec-audit.mjs', homeTool: 'scripts/ds-home.mjs', iconTool: 'scripts/ds-icon.mjs',
  kitLink: 'scripts/kit-link.mjs', paths: 'tools/ds-paths.mjs',
  fixtures: 'fixtures', templates: 'templates', illustrations: 'assets/illustrations', fonts: 'fonts',
};

// общие рантаймы без своего компонента
const UTILS = ['ds-float.js', 'ds-copy.js', 'ds-actions-overflow.js', 'ds-include.js', 'ds-notify.js'];
// оболочка страниц документации
const DOCS_KIT = ['ds-nav.js', 'ds-toc.js', 'docs-split.js', 'pg-kit.js', 'image-slot.js',
  'ds-docs.css', 'ds-nav.css', 'ds-toc.css', 'docs-split.css', 'pg-kit.css', 'input-pages.css'];
// инструменты, лежащие среди скриптов
const TOOLS = ['ds-lint.js', 'ds-lint.md'];
const TOP_DOCS = ['AGENTS.md', 'CHANGELOG.md', 'MAINTAINING.md', 'readme.md'];

function scriptRole(base) {
  if (base.endsWith('.page.js')) return 'page-script';
  if (base === 'ds.js') return 'entry';
  if (base === 'icons-data.js') return 'data';
  if (UTILS.includes(base)) return 'util';
  if (DOCS_KIT.includes(base)) return 'docs-kit';
  return 'runtime';
}

/* Вид файла по пути от корня ДС — без диска. null — не файл ДС (экран вне
   дерева `../…`, абсолютный путь) или путь, которого раскладка не знает. */
function kindOfLayout(rel) {
  const parts = rel.split('/');
  const base = parts[parts.length - 1];
  if (parts.length === 1) {
    if (rel === AT.bundleCss) return { kind: 'bundle' };
    if (rel === AT.home) return { kind: 'home' };
    if (TOP_DOCS.includes(rel)) return { kind: 'doc' };
    return null;
  }
  switch (parts[0]) {
    case DIR.styles:
      return base.endsWith('.css') ? { kind: 'style', role: DOCS_KIT.includes(base) ? 'docs-kit' : 'component' } : null;
    case DIR.scripts:
      if (TOOLS.includes(base) || base.endsWith('.mjs')) return { kind: 'tool' };
      return base.endsWith('.js') ? { kind: 'script', role: scriptRole(base) } : null;
    case DIR.pages:
      if (base.endsWith('.html')) return { kind: 'page', category: parts.length > 2 ? parts[1] : null, name: base.slice(0, -5) };
      return base.endsWith('.json') ? { kind: 'state' } : null;
    case DIR.specs:
      if (!base.endsWith('.md')) return null;
      return { kind: 'spec', role: base.startsWith('_') ? 'shared' : 'component', name: base.slice(0, -3) };
    case 'tools': return { kind: 'tool' };
    case 'fonts': return { kind: 'font' };
    case 'fixtures': return { kind: 'fixture' };
    case 'templates': return { kind: 'template' };
    case 'assets': return { kind: 'asset' };
    case 'uploads': return { kind: 'upload' };
    default: return null;
  }
}

// где лежит спека компонента — строкой, есть она или нет
const specPathOf = (name) => DIR.specs + '/' + name + '.md';

/* ---------- API: от раскладки не зависит ---------- */

const norm = (rel) => String(rel || '').replace(/\\/g, '/').replace(/^\.\//, '');
const escRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Раскладка ДС с корнем root (по умолчанию — эта ДС; стенд селфтеста — свой корень). */
export function layout(root = DS_ROOT) {
  root = path.resolve(root);

  // файлы каталога раскладки в порядке диска; нет каталога — громкая ошибка
  function filesIn(dir, deep) {
    const abs = path.join(root, dir);
    if (!existsSync(abs) || !statSync(abs).isDirectory()) {
      throw new Error('ds-paths: в ' + root + ' нет каталога ' + dir + '/ — раскладка ДС не та, что описана в ds-paths.mjs (' + LAYOUT + ')');
    }
    const out = [];
    const walk = (d) => {
      for (const e of readdirSync(path.join(root, d), { withFileTypes: true })) {
        const r = d + '/' + e.name;
        if (e.isDirectory()) { if (deep) walk(r); } else out.push(r);
      }
    };
    walk(dir);
    return out;
  }

  const kindOf = (rel) => {
    const r = norm(rel);
    if (!r || r.startsWith('../') || r.startsWith('/') || /^[a-z]:/i.test(r)) return null;
    return kindOfLayout(r);
  };
  const ofKind = (rel, kind) => { const k = kindOf(rel); return !!k && k.kind === kind; };

  // каталог есть, а файлов своего вида в нём нет — раскладка не распознана: тоже отказ
  const nonEmpty = (xs, what) => {
    if (!xs.length) throw new Error('ds-paths: в ' + root + ' не найдено ни одного файла вида «' + what + '» — раскладка ДС не распознана (' + LAYOUT + ')');
    return xs;
  };
  const styles = () => nonEmpty(filesIn(DIR.styles, false).filter((f) => ofKind(f, 'style')), 'стили');
  const scripts = () => nonEmpty(filesIn(DIR.scripts, false).filter((f) => ofKind(f, 'script')), 'скрипты');
  const pages = () => nonEmpty(filesIn(DIR.pages, true).filter((f) => ofKind(f, 'page')), 'страницы')
    .map((rel) => { const k = kindOf(rel); return { rel, name: k.name, category: k.category }; });
  const specs = () => nonEmpty(filesIn(DIR.specs, false).filter((f) => ofKind(f, 'spec')), 'спеки');

  /* Пути из поля YAML спеки (`page`, `page_js`, `runtime`, `css`): свои файлы
     компонента. Скобки — чужие файлы, которые компонент лишь использует
     («(+ scripts/ds-tooltip.js — тултип …)»), они отбрасываются. Путь узнаётся
     по расширению, а не по папке: формат поля переезд не меняет. */
  function yamlPaths(name, key) {
    const f = path.join(root, specPathOf(name));
    if (!existsSync(f)) return [];
    // BOM в начале файла (он есть у части спек) — не повод потерять шапку
    const head = readFileSync(f, 'utf8').replace(/^﻿/, '').split(/^---\s*$/m)[1] || '';
    const line = head.match(new RegExp('^' + key + ':[ \\t]*(.*)$', 'm'));
    if (!line) return [];
    const own = line[1].replace(/\([^)]*(?:\)|$)/g, ' ');
    return [...own.matchAll(/[\w./-]+\.(?:css|js|html)\b/g)].map((m) => m[0]);
  }

  return {
    root,
    layoutName: LAYOUT,
    at: { ...AT },
    /** Абсолютный путь файла ДС по пути от её корня. */
    abs: (rel) => path.join(root, rel),
    kindOf,
    styles,
    scripts,
    /** Рантаймы, которые работают на страницах: компонентов, общие, оболочки документации. */
    runtimes: () => scripts().filter((f) => ['runtime', 'util', 'docs-kit'].includes(kindOf(f).role)),
    pageScripts: () => scripts().filter((f) => kindOf(f).role === 'page-script'),
    pages,
    specs,
    specOf: (name) => specPathOf(name),
    pageOf: (name) => { const p = pages().find((x) => x.name === name); return p ? p.rel : null; },
    cssOf: (name) => yamlPaths(name, 'css'),
    runtimeOf: (name) => yamlPaths(name, 'runtime'),
    pageJsOf: (name) => yamlPaths(name, 'page_js'),
    /** Регулярка пути спеки — для поиска ссылки на неё в тексте. */
    specRx: (name) => escRx(specPathOf(name)),
  };
}

/* ---------- CLI: файлы компонента ---------- */
function cli(argv) {
  const name = argv.find((a) => !a.startsWith('-'));
  if (!name || argv.includes('--help')) {
    console.log('Использование: node tools/ds-paths.mjs <Имя>   — файлы компонента ДС (пути от корня ДС)');
    return name ? 0 : 2;
  }
  const L = layout();
  const page = L.pageOf(name);
  const spec = L.specOf(name);
  const hasSpec = existsSync(L.abs(spec));
  if (!page && !hasSpec) {
    console.log('нет компонента «' + name + '»: ни страницы, ни спеки. Имена — колонка «Компонент» в ' + L.at.specIndex);
    return 1;
  }
  const cat = page ? L.kindOf(page).category : null;
  const rows = [['страница', page ? [page] : []], ['спека', hasSpec ? [spec] : []],
    ['сценарий', L.pageJsOf(name)], ['рантайм', L.runtimeOf(name)], ['стили', L.cssOf(name)]];
  console.log(name + (cat ? ' — ' + cat : ''));
  for (const [what, list] of rows) {
    if (!list.length) { console.log('  ' + what.padEnd(9) + '—'); continue; }
    for (const rel of list) console.log('  ' + what.padEnd(9) + rel + (existsSync(L.abs(rel)) ? '' : '   (нет файла)'));
  }
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(cli(process.argv.slice(2)));
}

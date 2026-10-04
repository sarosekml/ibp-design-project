#!/usr/bin/env node
/* ============================================================
   DS-PATHS — единственное место, которое знает раскладку ДС.

   Где лежат стили, рантаймы, страницы документации и спеки, инструменты ДС
   и оснастка проекта узнают здесь, а не литералами папок. Переезд раскладки
   (задача RE0002: компонент — в своей папке) правил только раздел «Раскладка»
   ниже; API и инструменты остались.

   Две половины API:
   - строковая — at, kindOf: диска не трогает. Отвечает и про удалённый файл
     (маршруты гейта), и про стенд селфтеста;
   - списки — styles, scripts, runtimes, pageScripts, pages, specs, а также
     folderOf, specOf, pageOf и поля YAML спеки: читают диск. Нет каталога
     раскладки или в нём ни одного файла своего вида — список БРОСАЕТ, а не
     возвращает пустоту: пустой список значил бы, что проверка молча ничего
     не проверила (раздел 7 задачи RE0002).

   Списки отдаются в порядке обхода диска; кому нужен порядок, тот сортирует.

   Запуск, из корня ДС:
     node tools/ds-paths.mjs <Имя>   — папка компонента и её файлы, плюс файлы
                                        из спеки вне папки (код 1 — компонента нет)
   ============================================================ */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Корень ДС — каталог выше tools/. */
export const DS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ---------- Раскладка: папка на компонент (RE0002) ----------
   components/<категория>/<Имя>/ — всё про компонент: <Имя>.html (страница
   документации), <Имя>.md (спека), <Имя>.css, <Имя>.js (рантайм),
   <Имя>.page.js (сценарий страницы), части <Имя><Часть>.js/.css. Группа с
   общей базой — одна ступень: components/molecules/Inputs/ (общие файлы
   группы и папки полей). foundations/<Имя>/, patterns/<Имя>/, rnd/<Имя>/ —
   основы, паттерны и концепты той же формы; категория их страниц — имя
   верхней папки. utils/ — общие рантаймы без своего компонента; docs-kit/ —
   оболочка страниц документации; tools/ — инструменты; specs/ — только общие
   `_*.md`; ds.js и ds.css — точки сборки в корне ДС. */
const LAYOUT = 'папка на компонент: components/<категория>/<Имя>/, foundations/, patterns/, rnd/, utils/, docs-kit/, specs/';
// где живут папки компонентов; у components/ категория — следующий сегмент пути
const HOMES = ['components', 'foundations', 'patterns', 'rnd'];
// без этих папок раскладка цела: паттернов и концептов может не быть
const OPTIONAL = ['patterns', 'rnd'];
const DIR = { utils: 'utils', docsKit: 'docs-kit', specs: 'specs', tools: 'tools' };

const AT = {
  entryJs: 'ds.js', bundleCss: 'ds.css', home: 'index.html',
  nav: 'docs-kit/ds-nav.js', docsSplitJs: 'docs-kit/docs-split.js',
  docsCss: 'docs-kit/ds-docs.css', docsSplitCss: 'docs-kit/docs-split.css',
  iconsData: 'foundations/Icons/icons-data.js', iconsRuntime: 'foundations/Icons/Icons.js',
  homeCatalog: 'patterns/HomeRoles/ibp-home.js',
  specIndex: 'specs/_index.md', cheatsheet: 'specs/_cheatsheet.md',
  runtimeHooks: 'specs/_runtime-hooks.md', specTemplate: 'specs/_TEMPLATE.md',
  linter: 'tools/ds-lint.js', lintCli: 'tools/ds-lint-cli.mjs', check: 'tools/ds-check.mjs',
  specAudit: 'tools/spec-audit.mjs', homeTool: 'tools/ds-home.mjs', iconTool: 'tools/ds-icon.mjs',
  kitLink: 'tools/kit-link.mjs', paths: 'tools/ds-paths.mjs',
  fixtures: 'fixtures', templates: 'templates', illustrations: 'assets/illustrations', fonts: 'assets/fonts',
};

const TOP_DOCS = ['AGENTS.md', 'CHANGELOG.md', 'MAINTAINING.md', 'readme.md'];

// категория файла внутри папки компонента; null — путь не в папке компонента
function homeCategory(parts) {
  if (!HOMES.includes(parts[0])) return null;
  const inComponents = parts[0] === 'components';
  // файл лежит в папке компонента: components/<кат>/<Имя>/… или <верх>/<Имя>/…
  if (parts.length < (inComponents ? 4 : 3)) return null;
  return inComponents ? parts[1] : parts[0];
}

/* Вид файла по пути от корня ДС — без диска. null — не файл ДС (экран вне
   дерева `../…`, абсолютный путь) или путь, которого раскладка не знает. */
function kindOfLayout(rel) {
  const parts = rel.split('/');
  const base = parts[parts.length - 1];
  if (parts.length === 1) {
    if (rel === AT.bundleCss) return { kind: 'bundle' };
    if (rel === AT.entryJs) return { kind: 'script', role: 'entry' };
    if (rel === AT.home) return { kind: 'home' };
    if (TOP_DOCS.includes(rel)) return { kind: 'doc' };
    return null;
  }
  const category = homeCategory(parts);
  if (category) {
    if (base.endsWith('.html')) return { kind: 'page', category, name: base.slice(0, -5) };
    if (base.endsWith('.md')) return { kind: 'spec', role: 'component', name: base.slice(0, -3) };
    if (base.endsWith('.css')) return { kind: 'style', role: 'component' };
    if (base.endsWith('.page.js')) return { kind: 'script', role: 'page-script' };
    // данные ДС: иконки и темы (RE0005) — JS-модуль для Node (vm) и страницы (тег)
    if (base === 'icons-data.js' || base.endsWith('.tokens.js')) return { kind: 'script', role: 'data' };
    if (base.endsWith('.js')) return { kind: 'script', role: 'runtime' };
    return base.endsWith('.json') ? { kind: 'state' } : null;
  }
  switch (parts[0]) {
    case DIR.utils:
      return parts.length === 2 && base.endsWith('.js') ? { kind: 'script', role: 'util' } : null;
    case DIR.docsKit:
      if (parts.length !== 2) return null;
      if (base.endsWith('.css')) return { kind: 'style', role: 'docs-kit' };
      return base.endsWith('.js') ? { kind: 'script', role: 'docs-kit' } : null;
    case DIR.specs:
      if (parts.length !== 2 || !base.endsWith('.md')) return null;
      return { kind: 'spec', role: base.startsWith('_') ? 'shared' : 'component', name: base.slice(0, -3) };
    case DIR.tools: return { kind: 'tool' };
    case 'assets': return parts[1] === 'fonts' ? { kind: 'font' } : { kind: 'asset' };
    case 'fixtures': return { kind: 'fixture' };
    case 'templates': return { kind: 'template' };
    case 'uploads': return { kind: 'upload' };
    default: return null;
  }
}

// каталоги, где лежат файлы каждого списка (deep — с подпапками)
const WHERE = {
  styles: [...HOMES.map((d) => [d, true]), [DIR.docsKit, false]],
  scripts: [...HOMES.map((d) => [d, true]), [DIR.utils, false], [DIR.docsKit, false]],
  pages: HOMES.map((d) => [d, true]),
  specs: [...HOMES.map((d) => [d, true]), [DIR.specs, false]],
};

/* ---------- API: от раскладки не зависит ---------- */

const norm = (rel) => String(rel || '').replace(/\\/g, '/').replace(/^\.\//, '');
const escRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Раскладка ДС с корнем root (по умолчанию — эта ДС; стенд селфтеста — свой корень). */
export function layout(root = DS_ROOT) {
  root = path.resolve(root);

  // файлы каталога раскладки в порядке диска; нет обязательного каталога — громкая ошибка
  function filesIn(dir, deep) {
    const abs = path.join(root, dir);
    if (!existsSync(abs) || !statSync(abs).isDirectory()) {
      if (OPTIONAL.includes(dir)) return [];
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
  const filesOf = (what) => WHERE[what].flatMap(([dir, deep]) => filesIn(dir, deep));

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
  const styles = () => nonEmpty(filesOf('styles').filter((f) => ofKind(f, 'style')), 'стили');
  const scripts = () => nonEmpty([
    ...(existsSync(path.join(root, AT.entryJs)) ? [AT.entryJs] : []),
    ...filesOf('scripts').filter((f) => ofKind(f, 'script')),
  ], 'скрипты');
  const pages = () => nonEmpty(filesOf('pages').filter((f) => ofKind(f, 'page')), 'страницы')
    .map((rel) => { const k = kindOf(rel); return { rel, name: k.name, category: k.category }; });
  const specs = () => nonEmpty(filesOf('specs').filter((f) => ofKind(f, 'spec')), 'спеки');

  /* Папка компонента по имени: каталог в components/, foundations/, patterns/,
     rnd/, где лежит файл с его именем (`Tooltip/Tooltip.*`). Группа (`Inputs/`)
     тоже папка, но страницы и спеки у неё нет. Индекс строится один раз. */
  let folders = null;
  function folderOf(name) {
    if (!folders) {
      folders = new Map();
      for (const home of HOMES) {
        if (!existsSync(path.join(root, home))) continue;
        const walk = (d) => {
          const items = readdirSync(path.join(root, d), { withFileTypes: true });
          const own = path.posix.basename(d);
          if (items.some((e) => e.isFile() && e.name.split('.')[0] === own) && !folders.has(own)) folders.set(own, d);
          for (const e of items) if (e.isDirectory()) walk(d + '/' + e.name);
        };
        walk(home);
      }
    }
    return folders.get(name) || null;
  }
  // где лежит (или должна лежать) спека компонента; null — нет папки компонента
  const specPathOf = (name) => { const d = folderOf(name); return d ? d + '/' + name + '.md' : null; };

  /* Пути из поля YAML спеки (`page`, `page_js`, `runtime`, `css`): свои файлы
     компонента. Скобки — чужие файлы, которые компонент лишь использует
     («(+ components/molecules/Tooltip/Tooltip.js — тултип …)»), они
     отбрасываются. Путь узнаётся по расширению, а не по папке. */
  function yamlPaths(name, key) {
    const spec = specPathOf(name);
    const f = spec && path.join(root, spec);
    if (!f || !existsSync(f)) return [];
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
    folderOf,
    specOf: specPathOf,
    pageOf: (name) => { const p = pages().find((x) => x.name === name); return p ? p.rel : null; },
    cssOf: (name) => yamlPaths(name, 'css'),
    runtimeOf: (name) => yamlPaths(name, 'runtime'),
    pageJsOf: (name) => yamlPaths(name, 'page_js'),
    /** Регулярка пути спеки — для поиска ссылки на неё в тексте; нет папки — не находит ничего. */
    specRx: (name) => { const s = specPathOf(name); return s ? escRx(s) : '(?!)'; },
  };
}

/* ---------- CLI: файлы компонента ---------- */
const ROLE_LABEL = { page: 'страница', spec: 'спека', 'page-script': 'сценарий', runtime: 'рантайм', style: 'стили', state: 'состояние', data: 'данные' };

function cli(argv) {
  const name = argv.find((a) => !a.startsWith('-'));
  if (!name || argv.includes('--help')) {
    console.log('Использование: node tools/ds-paths.mjs <Имя>   — папка компонента ДС и её файлы (пути от корня ДС)');
    return name ? 0 : 2;
  }
  const L = layout();
  const dir = L.folderOf(name);
  if (!dir) {
    console.log('нет компонента «' + name + '»: нет его папки. Имена — колонка «Компонент» в ' + L.at.specIndex);
    return 1;
  }
  const cat = (L.kindOf(dir + '/' + name + '.html') || {}).category;
  console.log(name + (cat ? ' — ' + cat : '') + ' · ' + dir + '/');
  const files = readdirSync(L.abs(dir), { withFileTypes: true }).filter((e) => e.isFile()).map((e) => dir + '/' + e.name).sort();
  for (const rel of files) {
    const k = L.kindOf(rel) || {};
    const label = ROLE_LABEL[k.kind === 'script' ? k.role : k.kind] || 'файл';
    console.log('  ' + label.padEnd(10) + rel);
  }
  // файлы, которые спека называет своими, а лежат они вне папки: общие или группы
  const outside = [...new Set([...L.pageJsOf(name), ...L.runtimeOf(name), ...L.cssOf(name)])]
    .filter((rel) => !rel.startsWith(dir + '/'));
  for (const rel of outside) console.log('  ' + 'по спеке'.padEnd(10) + rel + (existsSync(L.abs(rel)) ? '' : '   (нет файла)'));
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(cli(process.argv.slice(2)));
}

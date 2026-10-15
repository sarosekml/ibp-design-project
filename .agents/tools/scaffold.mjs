#!/usr/bin/env node
/* ============================================================
   SCAFFOLD — заготовки виджета и страницы приложения из шаблонов.

   Зачем (задача RE0019, Э4). На виджет агент писал выводом шесть файлов,
   хотя шаблон есть в ДС (`templates/local-component/`), а страница — копия
   `templates/screen/Screen.html` с заменой подключения ДС. Шапки YAML,
   заголовки разделов паспорта и спеки, журнал изменений — шаблонный текст:
   его выгоднее записать командой, чем выводом модели. Заготовка — только
   начало: дальше файлы правятся по скиллам `screen-assembly` и `screen-spec`.

   Что делает:
   - `widget <приложение> <группа> <Имя> --category <категория>` — папка
     `widgets/<группа>/<Имя>/`: паспорт `<Имя>.md`, фрагмент `<Имя>.html`,
     `<Имя>.css`, `fixtures.json`, `CHANGELOG.md` — из шаблона ДС (префикс
     `lc-component` → `lc-<имя>`, `<Имя>` → имя, дата — сегодня) и каркас
     `<Имя>.js` с шапкой API (`--no-js` — без него). Категория сверяется со
     списком раздела (`project.json → localKit`, тот же разбор, что у
     генератора витрины), иначе витрина дала бы КТ2. Паспорт концепта —
     короткий (screen-spec, «Концепт»): все «##» шаблона, под каждым «—»;
     паспорт модуля — тело шаблона целиком;
   - `page <приложение> <Имя>` — `pages/<Имя>.html` из `Screen.html` с
     заменой из `screen-assembly` §2 п. 1: фавикон, `ds.css` и `ds.js`
     уходят, их место — теги загрузчика (`boot.head` первым в `<head>`,
     `boot.body` вместо `ds.js`), строка пользователя меню ведёт на хаб;
     пути — от страницы. Шапка-комментарий шаблона (о самом шаблоне) не
     переносится. Спека `<Имя>.screen.md`: в концепте — по
     `concept-template.md`, в модуле — по `template.md`; шапка заполнена,
     под заголовками разделов «—»;
   - существующий файл не перезаписывается никогда: если есть хоть один —
     ничего не пишется;
   - после себя печатает, что запустить дальше. До этого гейт законно
     красный (витрина, README модуля, сборка страниц) — промежуточное
     состояние.

   Коды ЗГ — «заготовка»:
     ЗГ1 приложение не найдено: нет каталога с app.json в `apps/`;
     ЗГ2 неверный вызов: группа не из `appShape.widgetGroups`, имя не
         PascalCase, категория не из списка раздела или не задана;
     ЗГ3 файл уже есть — ничего не записано;
     ЗГ4 шаблон не найден или изменился так, что замена не нашла своё место.
   При любом ЗГ ничего не пишется.

   Использование:
     node scaffold.mjs widget <приложение> <группа> <Имя> --category <категория>
          [--name "<русское имя>"] [--purpose "<зачем>"] [--no-js] [--dry]
     node scaffold.mjs page <приложение> <Имя> [--title "<заголовок>"] [--dry]
     node scaffold.mjs --selftest   — откат на временном дереве
   <приложение> — путь от корня (`apps/postrade/drafts/x`) или от `apps/`.
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1 (2 — неверный вызов).
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { project, need, dsPaths } from './project.mjs';
import { kitConfig } from './kit-build.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SELF = path.resolve(fileURLToPath(import.meta.url));
const slash = (p) => p.split(path.sep).join('/');
const read = (f) => readFileSync(f, 'utf8').replace(/\r\n/g, '\n');

/* Раскладка ДС — у модуля путей ДС (RE0002): каталог шаблонов берётся у ДС
   этого проекта и прикладывается к ДС любого манифеста, в том числе стенда. */
const AT = (await dsPaths()).layout().at;
const TPL_LC = 'local-component';
const TPL_SCREEN = 'screen/Screen.html';
/* Шаблоны спек — в харнесе, скилл screen-spec. */
const SPEC_REFS = 'skills/screen-spec/references';

export function today(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear();
}
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').toLowerCase();

/* ---------------- приложение ---------------- */

/** Каталог приложения по аргументу: { abs, dir — от apps/, section, concept } или { defect }. */
export function resolveApp(P, arg) {
  const appsAbs = path.join(P.root, P.appsDir);
  const cands = [path.resolve(P.root, arg), path.resolve(appsAbs, arg)];
  const abs = cands.find((c) => (c + path.sep).startsWith(appsAbs + path.sep) && existsSync(path.join(c, P.appsManifest)));
  if (!abs) return { defect: 'ЗГ1 ' + arg + ' — не приложение: нет каталога с ' + P.appsManifest + ' внутри ' + P.appsDir + '/' };
  const dir = slash(path.relative(appsAbs, abs));
  const seg = dir.split('/');
  const drafts = P.places ? P.places.drafts : 'drafts';
  return { abs, dir, section: seg[0], concept: seg[1] === drafts };
}

/* ---------------- шапка YAML ---------------- */

function splitFront(text) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
  return m ? { front: m[1].split('\n'), body: m[2] } : { front: null, body: text };
}

/* Строки шапки шаблона → шапка заготовки. Подсказки «#» не переносятся.
   fill — известные значения; остальные ключи — rest(key, value). Кавычки
   значения шаблона сохраняются (`updated: "ДД.ММ.ГГГГ"`). */
function fillFront(lines, fill, rest) {
  const out = [];
  for (const l of lines) {
    if (/^\s*#/.test(l) || !l.trim()) continue;
    const m = /^([\w-]+):\s?(.*)$/.exec(l);
    if (!m) { out.push(l); continue; }
    const [, key, val] = m;
    let v = key in fill ? fill[key] : rest(key, val);
    if (v == null) continue;
    if (key in fill && v && !/^["[]/.test(v) && (/^"/.test(val.trim()) || /^\d\d\.\d\d\.\d{4}$/.test(v))) v = '"' + v + '"';
    out.push(key + ':' + (v === '' ? '' : ' ' + v));
  }
  return '---\n' + out.join('\n') + '\n---\n';
}

/** Заголовки «##» и «###» тела шаблона, под каждым «—». Комментарии не переносятся. */
function headingsOnly(body, keepH3) {
  const hs = body.replace(/<!--[\s\S]*?-->/g, '').split('\n')
    .filter((l) => /^##\s/.test(l) || (keepH3 && /^###\s/.test(l))).map((l) => l.trim());
  /* «—» под «##», за которым сразу «###», не нужен: раздел наполняют подразделы. */
  return hs.map((h, i) => (/^##\s/.test(h) && /^###\s/.test(hs[i + 1] || '') ? h + '\n' : h + '\n\n—\n')).join('\n');
}

/* ---------------- виджет ---------------- */

export function widgetPlan(P, appArg, group, name, opts = {}) {
  const defects = [];
  const app = resolveApp(P, appArg);
  if (app.defect) return { defects: [app.defect], files: [] };
  const groups = P.appShape.widgetGroups;
  if (!group || (groups && !groups.includes(group))) defects.push('ЗГ2 группа «' + (group || '') + '» — не из project.json → appShape.widgetGroups (' + (groups || []).join(', ') + ')');
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name || '')) defects.push('ЗГ2 имя «' + (name || '') + '» — PascalCase с типом в конце: DealTeamTile');
  const cfg = kitConfig(P);
  if (cfg) {
    const kit = cfg.kits.length ? cfg.kits.find((k) => k.section === app.section) : null;
    const cats = kit ? kit.categories : cfg.categories;
    if (cfg.kits.length && !kit) defects.push('ЗГ2 у раздела «' + app.section + '» нет витрины в project.json → localKit.kits');
    else if (!opts.category || (cats.length && !cats.includes(opts.category))) {
      defects.push('ЗГ2 категория «' + (opts.category || '') + '» — нужна одна из списка раздела «' + app.section + '»: ' + cats.join(', ') + ' (--category)');
    }
  } else if (!opts.category) defects.push('ЗГ2 нет категории (--category)');
  const tdir = path.join(P.dsAbs, AT.templates, TPL_LC);
  const tpl = {};
  for (const f of ['Component.md', 'Component.html', 'Component.css', 'fixtures.json', 'CHANGELOG.md']) {
    const abs = path.join(tdir, f);
    if (!existsSync(abs)) defects.push('ЗГ4 нет шаблона ' + P.rel(abs));
    else tpl[f] = read(abs);
  }
  if (defects.length) return { defects, files: [] };

  const d = opts.date || today();
  const undecided = 'не решено (' + d + ')';
  const prefix = 'lc-' + kebab(name);
  const sub = (t) => t.replace(/lc-component/g, prefix).replace(/<Имя>/g, name);
  const dir = path.join(app.abs, P.appShape.widgets, group, name);
  const files = [];
  const add = (f, text) => files.push({ abs: path.join(dir, f), text });

  const { front, body } = splitFront(tpl['Component.md']);
  if (!front) return { defects: ['ЗГ4 ' + P.rel(path.join(tdir, 'Component.md')) + ' — нет шапки YAML'], files: [] };
  const head = fillFront(front, {
    name: opts.name || undecided, category: opts.category, purpose: opts.purpose || undecided,
    updated: d, owner: undecided, designer: undecided, frontend: undecided,
  }, (k, v) => v);
  const title = '# ' + (opts.name || name) + '\n';
  const passport = app.concept
    ? head + '\n' + title + '\n<!-- Короткий паспорт концепта (скилл screen-spec, «Концепт»): в каждом разделе одна-две\n'
      + '     строки или «—». Разделы не переименовываются и не удаляются (витрина, КТ2). Полный\n'
      + '     паспорт по шаблону ДС — при переносе в модуль (/promote). -->\n\n' + headingsOnly(body, false)
    : head + sub(body).replace(/^\s*#\s+[^\n]*\n/, '\n' + title);
  add(name + '.md', passport);
  /* Шапка-комментарий фрагмента — о шаблоне, не о виджете, и в ней названы
     теги <script>, <div>: проверка страниц витрины (docs-split, ДС1, ДС19)
     читает их как код. Фраза о замене префикса после замены не нужна. */
  add(name + '.html', sub(tpl['Component.html'].replace(/^<!--[\s\S]*?-->\n/, '')));
  add(name + '.css', sub(tpl['Component.css'].replace(/\s*Префикс lc-component заменить на lc-<имя>\./, '')));
  add('fixtures.json', tpl['fixtures.json']);
  add('CHANGELOG.md', sub(tpl['CHANGELOG.md']).replace(/ДД\.ММ\.ГГГГ(?=\s*\n\n\*\*Компонент создан)/, d));
  if (!opts.noJs) {
    add(name + '.js', [
      '/* ============================================================',
      '   ' + name + '.js — поведение виджета ' + name + '.',
      '',
      '   API: ' + undecided + ' — глобальное имя, функции и их аргументы',
      '   описываются здесь, до кода; нет поведения сверх рантаймов ДС —',
      '   файл удаляется вместе со ссылкой на него.',
      '   ============================================================ */',
      '(function () {',
      "  'use strict';",
      '})();',
      '',
    ].join('\n'));
  }
  return {
    defects: [], files, app,
    next: [
      'дальше: заполнить паспорт и фрагмент (скиллы screen-spec, screen-assembly), вшить меткой',
      '  <ds-include src="../' + slash(path.join(P.appShape.widgets, group, name, name + '.html')) + '"></ds-include>',
      'затем: node .agents/tools/assemble.mjs; node .agents/tools/kit-build.mjs' + (app.concept ? '' : '; node .agents/tools/module-readme.mjs') + '; node .agents/tools/docs-index.mjs',
    ],
  };
}

/* ---------------- страница ---------------- */

/* Замены в копии Screen.html (screen-assembly §2 п. 1). Каждая обязана найти
   своё место: шаблон поменялся — ЗГ4, а не страница с подключением ДС из шаблона. */
function pageFromTemplate(tplText, rel) {
  const miss = [];
  let t = tplText;
  const rep = (rx, to, what) => {
    if (!rx.test(t)) { miss.push(what); return; }
    t = t.replace(rx, to);
  };
  rep(/<!DOCTYPE html>\n<!--[\s\S]*?-->\n/, '<!DOCTYPE html>\n', 'шапка-комментарий шаблона после <!DOCTYPE html>');
  rep(/<head>\n/, '<head>\n<script src="' + rel.head + '"></script>\n', '<head>');
  rep(/^<link rel="icon"[^\n]*\n/m, '', 'фавикон <link rel="icon">');
  rep(/^<link rel="stylesheet" href="[^"]*ds\.css">\n/m, '', '<link … ds.css>');
  rep(/<script src="[^"]*ds\.js"><\/script>/, '<script src="' + rel.body + '"></script>', '<script … ds.js>');
  rep(/(<a class="nav__user" href=")[^"]*(")/, '$1' + rel.hub + '$2', 'строка пользователя меню <a class="nav__user">');
  return { text: t, miss };
}

export function pagePlan(P, appArg, name, opts = {}) {
  const defects = [];
  const app = resolveApp(P, appArg);
  if (app.defect) return { defects: [app.defect], files: [] };
  if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(name || '')) defects.push('ЗГ2 имя страницы «' + (name || '') + '» — латиница: Deal, DealRegistry, index');
  if (!P.boot || !P.boot.head || !P.boot.body) defects.push('ЗГ4 project.json не называет загрузчик ДС (boot.head, boot.body)');
  if (!P.hubPage) defects.push('ЗГ4 project.json не называет страницу хаба (hub.page)');
  const screenAbs = path.join(P.dsAbs, AT.templates, TPL_SCREEN);
  const specAbs = path.join(P.kitAbs, SPEC_REFS, app.concept ? 'concept-template.md' : 'template.md');
  for (const f of [screenAbs, specAbs]) if (!existsSync(f)) defects.push('ЗГ4 нет шаблона ' + P.rel(f));
  if (defects.length) return { defects, files: [] };

  const pagesAbs = path.join(app.abs, P.appShape.pages);
  const from = (f) => slash(path.relative(pagesAbs, path.join(P.root, f)));
  const page = pageFromTemplate(read(screenAbs), { head: from(P.boot.head), body: from(P.boot.body), hub: from(P.hubPage) });
  if (page.miss.length) return { defects: page.miss.map((w) => 'ЗГ4 ' + P.rel(screenAbs) + ' — не найдено: ' + w), files: [] };

  const d = opts.date || today();
  const undecided = 'не решено (' + d + ')';
  const title = opts.title || undecided;
  const html = opts.title ? page.text.replace(/<title>[^<]*—/, '<title>' + opts.title + ' —') : page.text;
  const { front, body } = splitFront(read(specAbs));
  if (!front) return { defects: ['ЗГ4 ' + P.rel(specAbs) + ' — нет шапки YAML'], files: [] };
  const head = fillFront(front, {
    screen: name, kind: 'screen', title, file: P.rel(path.join(pagesAbs, name + '.html')), module: app.dir,
    version: '1.000', created: d, components: '[Layout, NavPanel, Breadcrumbs, PageHeader]', widgets: '[]',
  }, (k, v) => (k === 'design_system' ? v : /^\s*\[/.test(v) ? '[]' : undecided));
  const h1 = /^#\s+([^:\n]+):/m.exec(body);
  const spec = head + '\n# ' + (h1 ? h1[1].trim() + ': ' : '') + name + ' — ' + title + '\n\n' + headingsOnly(body, !app.concept);
  const files = [
    { abs: path.join(pagesAbs, name + '.html'), text: html },
    { abs: path.join(pagesAbs, name + '.screen.md'), text: spec },
  ];
  return {
    defects: [], files, app,
    next: [
      'дальше: собрать экран по скиллу screen-assembly (шаг 2 и далее), спеку — по screen-spec',
      'затем: node .agents/tools/layout-check.mjs ' + P.rel(files[0].abs)
        + (app.concept ? '' : '; node .agents/tools/module-readme.mjs') + '; node .agents/tools/docs-index.mjs',
      ...(!app.concept && P.screenMap ? ['экран модуля — узел карты экранов ' + P.screenMap.dir + '/' + app.section + '/map.yaml (screen-assembly §2 п. 9)'] : []),
    ],
  };
}

/* ---------------- запись ---------------- */

export function apply(P, plan, dry = false) {
  if (plan.defects.length) return { defects: plan.defects, lines: [] };
  const exist = plan.files.filter((f) => existsSync(f.abs));
  if (exist.length) return { defects: exist.map((f) => 'ЗГ3 ' + P.rel(f.abs) + ' — файл уже есть, заготовка не перезаписывает'), lines: [] };
  const lines = [];
  for (const f of plan.files) {
    if (!dry) {
      mkdirSync(path.dirname(f.abs), { recursive: true });
      writeFileSync(f.abs, f.text, 'utf8');
    }
    lines.push((dry ? 'будет  ' : 'создан ') + P.rel(f.abs));
  }
  if (!dry) lines.push(...plan.next);
  return { defects: [], lines };
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
const at = (root, rel) => read(path.join(root, rel));

/* Шаблоны — настоящие, из ДС и харнеса этого проекта: заготовка проверяется
   на тех файлах, из которых её делают. */
function tree(r) {
  const P0 = project(HERE);
  put(r, 'project.json', JSON.stringify({
    contract: 1, id: 't', designSystem: { mount: 'ds' }, agentKit: { mount: '.kit', tools: '.kit/tools', adapter: '.cli' },
    boot: { dir: 'apps', head: 'apps/ds-config.js', body: 'apps/ds-body.js' },
    hub: { page: 'index.html', registry: 'hub.js' }, apps: { dir: 'apps', manifest: 'app.json' },
    localKit: { dir: 'apps/local-components', categories: ['Общие', 'Другое'],
      kits: [{ id: 'k-post', section: 'postrade', categories: ['Общие', 'Транш'] }, { id: 'k-core', section: 'core' }] },
    appShape: { pages: 'pages', widgets: 'widgets', data: 'data', refs: 'refs', widgetGroups: ['tiles', 'modals'] },
    appPlaces: { moduleSuffix: '-app', drafts: 'drafts' }, tracks: [],
  }));
  for (const f of ['Component.md', 'Component.html', 'Component.css', 'fixtures.json', 'CHANGELOG.md']) {
    put(r, 'ds/' + AT.templates + '/' + TPL_LC + '/' + f, read(path.join(P0.dsAbs, AT.templates, TPL_LC, f)));
  }
  put(r, 'ds/' + AT.templates + '/' + TPL_SCREEN, read(path.join(P0.dsAbs, AT.templates, TPL_SCREEN)));
  for (const f of ['concept-template.md', 'template.md']) put(r, '.kit/' + SPEC_REFS + '/' + f, read(path.join(P0.kitAbs, SPEC_REFS, f)));
  put(r, 'apps/postrade/drafts/lab/app.json', '{"id":"lab","track":"rnd"}');
  put(r, 'apps/postrade/lab-app/app.json', '{"id":"lab-app","track":"product"}');
}

const canon = (r) => at(r, 'ds/' + AT.templates + '/' + TPL_LC + '/Component.md').split('\n').filter((l) => /^##\s/.test(l));
const W = 'apps/postrade/drafts/lab/widgets/tiles/LabTile/';
const D = '01.02.2026';

const CASES = [
  { name: 'виджет концепта: шесть файлов, короткий паспорт, префикс, дата',
    run: (r) => apply(project(r), widgetPlan(project(r), 'apps/postrade/drafts/lab', 'tiles', 'LabTile', { category: 'Транш', date: D })),
    verify: (r) => {
      const miss = [];
      for (const f of ['LabTile.md', 'LabTile.html', 'LabTile.css', 'LabTile.js', 'fixtures.json', 'CHANGELOG.md']) if (!existsSync(path.join(r, W + f))) miss.push('нет ' + f);
      if (miss.length) return miss;
      const md = at(r, W + 'LabTile.md');
      if (!/\ncategory: Транш\n/.test(md) || !/\npurpose: не решено \(01\.02\.2026\)\n/.test(md) || !/\nupdated: "01\.02\.2026"\n/.test(md)) miss.push('шапка паспорта');
      if (/^#\s/m.test(md.split('\n---\n')[0].slice(4))) miss.push('подсказки «#» в шапке');
      const hs = md.split('\n').filter((l) => /^##\s/.test(l));
      if (hs.join('|') !== canon(r).join('|')) miss.push('разделы «##» не по канону');
      if (/<Имя>|\| *\|/.test(md)) miss.push('тело шаблона в коротком паспорте');
      const html = at(r, W + 'LabTile.html');
      if (!html.includes('lc-lab-tile') || html.includes('lc-component')) miss.push('префикс lc-lab-tile');
      if (!at(r, W + 'CHANGELOG.md').includes('## 1.000 — 01.02.2026')) miss.push('дата в журнале');
      if (!at(r, W + 'LabTile.js').includes('API: не решено (01.02.2026)')) miss.push('шапка API');
      return miss;
    } },
  { name: 'виджет модуля: тело паспорта — шаблон целиком, имя в заголовке',
    run: (r) => apply(project(r), widgetPlan(project(r), 'postrade/lab-app', 'modals', 'LabModal', { category: 'Общие', name: 'Окно лаборатории', noJs: true, date: D })),
    verify: (r) => {
      const w = 'apps/postrade/lab-app/widgets/modals/LabModal/';
      const miss = [];
      if (existsSync(path.join(r, w + 'LabModal.js'))) miss.push('--no-js: js не нужен');
      const md = at(r, w + 'LabModal.md');
      if (!md.includes('\n# Окно лаборатории\n') || !md.includes('\nname: Окно лаборатории\n')) miss.push('имя');
      if (!md.includes('| Загрузка (Loading) |')) miss.push('таблицы шаблона');
      if (md.split('\n').filter((l) => /^##\s/.test(l)).join('|') !== canon(r).join('|')) miss.push('разделы «##» не по канону');
      return miss;
    } },
  { name: 'категория не из списка раздела — ничего не пишется', expect: 'ЗГ2 категория «Сделка»',
    run: (r) => apply(project(r), widgetPlan(project(r), 'apps/postrade/drafts/lab', 'tiles', 'LabTile', { category: 'Сделка' })),
    verify: (r) => (existsSync(path.join(r, W)) ? ['папка создана'] : []) },
  { name: 'категория по умолчанию — общий список (у раздела своего нет)',
    run: (r) => { put(r, 'apps/core/drafts/x/app.json', '{}'); return apply(project(r), widgetPlan(project(r), 'apps/core/drafts/x', 'tiles', 'XTile', { category: 'Другое', date: D })); } },
  { name: 'группа не из списка', expect: 'ЗГ2 группа «cards»',
    run: (r) => apply(project(r), widgetPlan(project(r), 'apps/postrade/drafts/lab', 'cards', 'LabCard', { category: 'Общие' })) },
  { name: 'не приложение', expect: 'ЗГ1 apps/postrade/drafts/none',
    run: (r) => apply(project(r), widgetPlan(project(r), 'apps/postrade/drafts/none', 'tiles', 'LabTile', { category: 'Общие' })) },
  { name: 'повторный вызов — отказ, файл не тронут', expect: 'ЗГ3 ' + W + 'LabTile.md',
    run: (r) => {
      apply(project(r), widgetPlan(project(r), 'apps/postrade/drafts/lab', 'tiles', 'LabTile', { category: 'Общие', date: D }));
      put(r, W + 'LabTile.md', 'своё');
      return apply(project(r), widgetPlan(project(r), 'apps/postrade/drafts/lab', 'tiles', 'LabTile', { category: 'Общие', date: D }));
    },
    verify: (r) => (at(r, W + 'LabTile.md') === 'своё' ? [] : ['файл перезаписан']) },
  { name: '--dry — ничего не пишет',
    run: (r) => apply(project(r), widgetPlan(project(r), 'apps/postrade/drafts/lab', 'tiles', 'LabTile', { category: 'Общие' }), true),
    verify: (r) => (existsSync(path.join(r, W)) ? ['папка создана'] : []) },
  { name: 'страница концепта: загрузчик и хаб от страницы, ДС из шаблона ушла, короткая спека',
    run: (r) => apply(project(r), pagePlan(project(r), 'apps/postrade/drafts/lab', 'Lab', { title: 'Лаборатория', date: D })),
    verify: (r) => {
      const miss = [];
      const html = at(r, 'apps/postrade/drafts/lab/pages/Lab.html');
      if (!/<head>\n<script src="\.\.\/\.\.\/\.\.\/\.\.\/ds-config\.js"><\/script>\n/.test(html)) miss.push('ds-config.js первым в <head>');
      if (!html.includes('<script src="../../../../ds-body.js"></script>')) miss.push('ds-body.js вместо ds.js');
      if (!html.includes('class="nav__user" href="../../../../../index.html"')) miss.push('хаб');
      if (/ds\.css|ds\.js"|rel="icon"|Шаблон экрана/.test(html)) miss.push('остатки подключения из шаблона');
      if (!html.includes('<title>Лаборатория — IBP</title>')) miss.push('title');
      for (const a of ['#sec:head', '#sec:content', '#sec:modals']) if (!html.includes(a)) miss.push('якорь ' + a);
      const spec = at(r, 'apps/postrade/drafts/lab/pages/Lab.screen.md');
      if (!spec.includes('\nfile: apps/postrade/drafts/lab/pages/Lab.html\n') || !spec.includes('\nkind: screen\n') || !spec.includes('\ntitle: Лаборатория\n')) miss.push('шапка спеки');
      if (!spec.includes('\nsource: не решено (01.02.2026)\n') || !spec.includes('\nwidgets: []\n') || !spec.includes('\ncreated: "01.02.2026"\n')) miss.push('шапка: неизвестное — «не решено»');
      if (!spec.includes('\n# Концепт: Lab — Лаборатория\n') || !spec.includes('## Открытые вопросы\n\n—')) miss.push('тело концепт-спеки');
      if (/EarlyInterest|Досрочн/.test(spec)) miss.push('пример шаблона в спеке');
      return miss;
    } },
  { name: 'страница модуля: пути на один ../ короче, спека по полному шаблону',
    run: (r) => apply(project(r), pagePlan(project(r), 'apps/postrade/lab-app', 'Lab', { date: D })),
    verify: (r) => {
      const miss = [];
      const html = at(r, 'apps/postrade/lab-app/pages/Lab.html');
      if (!html.includes('<script src="../../../ds-config.js"></script>') || !html.includes('href="../../../../index.html"')) miss.push('пути модуля');
      const spec = at(r, 'apps/postrade/lab-app/pages/Lab.screen.md');
      if (!spec.includes('\n## 8. Состояния (States)\n\n### Loading\n\n—') || !spec.includes('\nroute: не решено (01.02.2026)\n')) miss.push('разделы и шапка полного шаблона');
      if (/DealRegistry|Реестр сделок/.test(spec)) miss.push('пример шаблона в спеке');
      return miss;
    } },
  { name: 'шаблон экрана без ds.js — ЗГ4, ничего не пишется', expect: 'ЗГ4',
    run: (r) => {
      const f = 'ds/' + AT.templates + '/' + TPL_SCREEN;
      put(r, f, at(r, f).replace(/<script src="[^"]*ds\.js"><\/script>/, ''));
      return apply(project(r), pagePlan(project(r), 'apps/postrade/drafts/lab', 'Lab', {}));
    },
    verify: (r) => (existsSync(path.join(r, 'apps/postrade/drafts/lab/pages')) ? ['страница создана'] : []) },
];

function selftest() {
  const out = ['== scaffold --selftest =='];
  let failed = 0;
  for (const c of CASES) {
    const root = mkdtempSync(path.join(os.tmpdir(), 'scaffold-'));
    try {
      tree(root);
      const res = c.run(root);
      const miss = [];
      if (c.expect && !res.defects.some((d) => d.includes(c.expect))) miss.push('ожидался ' + c.expect + (res.defects.length ? ', есть: ' + res.defects.join(' | ') : ''));
      if (!c.expect && res.defects.length) miss.push('дефекты: ' + res.defects.join(' | '));
      if (c.verify) miss.push(...c.verify(root, res));
      if (miss.length) failed++;
      out.push((miss.length ? 'FAIL  ' : 'ok    ') + c.name + (miss.length ? ' — ' + miss.join('; ') : ''));
    } catch (e) {
      failed++;
      out.push('FAIL  ' + c.name + ' — исключение: ' + e.message);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
  out.push('ВЕРДИКТ: ' + (failed ? 'FAIL (кейсов не прошло: ' + failed + ' из ' + CASES.length + ')' : 'OK (кейсов: ' + CASES.length + ')'));
  console.log(out.join('\n'));
  process.exit(failed ? 1 : 0);
}

/* ---------------- main ---------------- */

const USAGE = [
  'Использование:',
  '  node scaffold.mjs widget <приложение> <группа> <Имя> --category <категория> [--name "…"] [--purpose "…"] [--no-js] [--dry]',
  '  node scaffold.mjs page <приложение> <Имя> [--title "…"] [--dry]',
  '  node scaffold.mjs --selftest',
].join('\n');

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();
  const VALUED = new Set(['--category', '--name', '--purpose', '--title']);
  const opt = {}, pos = [];
  for (let i = 0; i < args.length; i++) {
    if (VALUED.has(args[i])) opt[args[i].slice(2)] = args[++i];
    else if (args[i].startsWith('--')) opt[args[i].slice(2)] = true;
    else pos.push(args[i]);
  }
  const [kind, ...rest] = pos;
  const ok = (kind === 'widget' && rest.length === 3) || (kind === 'page' && rest.length === 2);
  if (!ok) { console.log(USAGE); process.exit(2); }
  const P = need('scaffold', HERE);
  const plan = kind === 'widget'
    ? widgetPlan(P, rest[0], rest[1], rest[2], { category: opt.category, name: opt.name, purpose: opt.purpose, noJs: !!opt['no-js'] })
    : pagePlan(P, rest[0], rest[1], { title: opt.title });
  const res = apply(P, plan, !!opt.dry);
  console.log(report('scaffold ' + kind + (opt.dry ? ' --dry' : ''), res));
  process.exit(res.defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SELF) main();

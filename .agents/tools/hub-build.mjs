#!/usr/bin/env node
/* ============================================================
   HUB-BUILD — генератор реестра хаба (hub.js) из записей приложений.

   Зачем (реструктуризация, шаг Ш9). До генератора новое приложение
   регистрировалось правкой общего файла в корне, а забывчивость сторожил
   отдельный валидатор. Теперь запись принадлежит приложению: `apps/<id>/app.json`
   (id, track, title, desc, home, icon), а `hub.js` собирается отсюда. Запись
   дизайн-системы — `project.json → hub.ds`, её href — `<ДС>/index.html`.
   Сторожу хаба остаётся проверить, что генератор отработал, и что экраны
   ведут обратно в хаб.

   Формат `hub.js` прежний — обычный `<script>` с `window.IBPHub`: хаб
   открывается двойным кликом (`file://`), где `fetch` не работает. Страница
   хаба (`index.html`) не меняется (решение владельца Р6).

   Порядок записей: дизайн-система, затем треки в порядке манифеста, внутри
   трека — приложения по id. Группа записи — `hubGroup` трека приложения.

   Коды ХБ — «хаб»:
     ХБ1 манифест не объявляет каталог приложений или реестр (apps.dir,
         hub.registry) — собирать не из чего;
     ХБ2 реестра нет;
     ХБ3 реестр разошёлся с записями приложений — правлен руками или не
         пересобран после правки app.json;
     ХБ4 запись приложения не годится для сборки: app.json не читается, нет
         поля, трек не из манифеста, id не совпадает с каталогом.

   Использование:
     node hub-build.mjs             — собрать hub.js
     node hub-build.mjs --check     — сверить, ничего не записывая
     node hub-build.mjs --selftest  — откат на временном дереве
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, mkdtempSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { project, need } from './project.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEN = 'hub-build.mjs';
const APP_FIELDS = ['id', 'track', 'title', 'desc', 'home', 'icon'];
const DS_FIELDS = ['id', 'title', 'desc', 'icon'];

const js = (v) => (v === null ? 'null' : "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'");

/** Записи реестра из манифеста и app.json приложений: { entries, defects }. */
export function collect(P) {
  const defects = [];
  if (!P.appsDir || !P.hubRegistry) {
    defects.push('ХБ1 project.json не объявляет каталог приложений или реестр хаба (apps.dir, hub.registry)');
    return { entries: [], defects };
  }
  const entries = [];
  const ds = (P.manifest.hub && P.manifest.hub.ds) || null;
  if (ds) {
    const miss = DS_FIELDS.filter((k) => typeof ds[k] !== 'string' || !ds[k].trim());
    if (miss.length) defects.push('ХБ4 project.json → hub.ds — нет полей: ' + miss.join(', '));
    else entries.push({ id: ds.id, group: 'ds', title: ds.title, desc: ds.desc, href: P.ds + '/index.html', root: null, icon: ds.icon });
  }
  const tracks = P.tracks.filter((t) => t.id && t.hubGroup);
  const byTrack = new Map(tracks.map((t) => [t.id, []]));
  const abs = path.join(P.root, P.appsDir);
  const dirs = existsSync(abs) ? readdirSync(abs, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('.')).map((d) => d.name).sort() : [];
  for (const dir of dirs) {
    const rel = P.appsDir + '/' + dir + '/' + P.appsManifest;
    const file = path.join(P.root, rel);
    if (!existsSync(file)) continue;                       // каталог без записи — не приложение; страницы в нём ловит registry-check (П4)
    let app;
    try { app = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { defects.push('ХБ4 ' + rel + ' не читается как JSON: ' + e.message); continue; }
    const miss = APP_FIELDS.filter((k) => typeof app[k] !== 'string' || !app[k].trim());
    if (miss.length) { defects.push('ХБ4 ' + rel + ' — нет полей записи: ' + miss.join(', ')); continue; }
    if (app.id !== dir) { defects.push('ХБ4 ' + rel + ' — id «' + app.id + '» не совпадает с каталогом «' + dir + '»'); continue; }
    if (!byTrack.has(app.track)) { defects.push('ХБ4 ' + rel + ' — track «' + app.track + '» не из треков манифеста: ' + [...byTrack.keys()].join(', ')); continue; }
    byTrack.get(app.track).push(app);
  }
  for (const t of tracks) {
    for (const app of byTrack.get(t.id)) {
      const root = P.appsDir + '/' + app.id;
      entries.push({ id: app.id, group: t.hubGroup, title: app.title, desc: app.desc, href: root + '/' + app.home.replace(/^\.\//, ''), root, icon: app.icon });
    }
  }
  return { entries, defects };
}

/** Текст hub.js. */
export function render(P, entries) {
  const groups = P.tracks.filter((t) => t.hubGroup)
    .map((t) => '     ' + t.hubGroup.padEnd(8) + ' — приложения трека ' + t.id + (t.desc ? ': ' + t.desc : '') + ';');
  const head = [
    '/* Реестр хаба проектов — источник меню и списка на корневой странице ' + P.hubPage + '.',
    '',
    '   СГЕНЕРИРОВАН ' + GEN + ' из ' + P.appsDir + '/<id>/' + P.appsManifest + ' и project.json → hub.ds. Руками не',
    '   править: запись приложения — его ' + P.appsManifest + ', пересобрать — node ' + P.tools + '/' + GEN,
    '   (гейт сверяет, шаг hub). Хаб строит из реестра и меню, и три колонки; сама',
    '   страница не правится.',
    '',
    '   Обычный <script>, а не JSON: страницы открываются по file://, а fetch по',
    '   file:// с кириллическим путём не работает.',
    '',
    '   Группы (колонки хаба, в этом порядке):',
    '     ds       — дизайн-система (запись — project.json → hub.ds);',
    ...groups,
    '   Группа приложения — hubGroup его трека (project.json → tracks).',
    '',
    '   Поля:',
    '     id     — уникальный ключ, латиница; у приложения — его каталог;',
    "     group  — 'ds' | " + P.tracks.filter((t) => t.hubGroup).map((t) => "'" + t.hubGroup + "'").join(' | ') + ';',
    '     title  — название строки на хабе и пункта меню;',
    '     desc   — описание одной строкой;',
    '     href   — стартовая страница от корня: каталог приложения + home из ' + P.appsManifest + ';',
    "     root   — каталог приложения от корня; у группы 'ds' — null. Всё внутри",
    '              него — часть записи: экраны с меню обязаны вести строкой',
    '              пользователя в футере на хаб;',
    '     icon   — имя глифа из ' + P.ds + '/specs/Icons.md. */',
  ].join('\n');
  const body = entries.map((e) => '  {\n' + ['id', 'group', 'title', 'desc', 'href', 'root', 'icon']
    .map((k) => '    ' + k + ': ' + js(e[k])).join(',\n') + '\n  }').join(',\n');
  return head + '\nwindow.IBPHub = [\n' + body + '\n];\n';
}

export function check(P, write = false) {
  const { entries, defects } = collect(P);
  if (defects.length) return { defects, written: [] };
  const text = render(P, entries);
  const file = path.join(P.root, P.hubRegistry);
  if (write) {
    if (!existsSync(file) || readFileSync(file, 'utf8') !== text) { writeFileSync(file, text, 'utf8'); return { defects, written: [P.hubRegistry], entries }; }
    return { defects, written: [], entries };
  }
  if (!existsSync(file)) defects.push('ХБ2 ' + P.hubRegistry + ' нет — собрать: node ' + P.tools + '/' + GEN);
  else if (readFileSync(file, 'utf8') !== text) defects.push('ХБ3 ' + P.hubRegistry + ' разошёлся с записями приложений (' + P.appsDir + '/*/' + P.appsManifest + ') — правлен руками или не пересобран: node ' + P.tools + '/' + GEN);
  return { defects, written: [], entries };
}

function report(title, { defects, written, entries }) {
  const out = ['== ' + title + ' =='];
  if (entries) out.push('записей: ' + entries.length);
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
  hub: { page: 'index.html', registry: 'hub.js', ds: { id: 'ds', title: 'ДС', desc: 'тест', icon: 'layer-01' } },
  apps: { dir: 'apps', manifest: 'app.json' },
  tracks: [{ id: 'product', title: 'Проекты', hubGroup: 'projects' }, { id: 'rnd', title: 'Концепты', hubGroup: 'concepts' }],
};
const app = (id, track, patch = {}) => JSON.stringify({ id, track, title: 'Приложение ' + id, desc: 'тест', home: 'pages/Start.html', icon: 'folder', ...patch });

const CASES = [
  { name: 'собрано — диффа нет', expect: null, build: true },
  { name: 'реестра нет', expect: 'ХБ2 hub.js нет' },
  { name: 'реестр правлен руками', expect: 'ХБ3 hub.js разошёлся', build: true,
    mutate: (r) => put(r, 'hub.js', readFileSync(path.join(r, 'hub.js'), 'utf8').replace("title: 'Приложение beta'", "title: 'Бета'")) },
  { name: 'новое приложение без пересборки', expect: 'ХБ3', build: true,
    mutate: (r) => put(r, 'apps/gamma/app.json', app('gamma', 'rnd')) },
  { name: 'новое приложение и пересборка', expect: null, build: true,
    mutate: (r) => { put(r, 'apps/gamma/app.json', app('gamma', 'rnd')); check(project(r), true); } },
  { name: 'в записи нет поля', expect: 'ХБ4 apps/beta/app.json — нет полей записи: title',
    mutate: (r) => put(r, 'apps/beta/app.json', JSON.stringify({ id: 'beta', track: 'rnd', desc: 'тест', home: 'pages/Start.html', icon: 'folder' })) },
  { name: 'трек не из манифеста', expect: 'ХБ4 apps/beta/app.json — track «lab»',
    mutate: (r) => put(r, 'apps/beta/app.json', app('beta', 'lab')) },
  { name: 'манифест без каталога приложений', expect: 'ХБ1',
    mutate: (r) => { const { apps, ...rest } = MANIFEST; put(r, 'project.json', JSON.stringify(rest)); } },
];

function selftest() {
  const out = ['== hub-build --selftest =='];
  let failed = 0;
  for (const c of CASES) {
    const root = mkdtempSync(path.join(os.tmpdir(), 'hub-build-'));
    try {
      put(root, 'project.json', JSON.stringify(MANIFEST));
      put(root, 'apps/alpha/app.json', app('alpha', 'product', { home: 'pages/MainPage.html' }));
      put(root, 'apps/beta/app.json', app('beta', 'rnd'));
      if (c.build) check(project(root), true);
      if (c.mutate) c.mutate(root);
      const { defects } = check(project(root));
      const pass = c.expect === null ? defects.length === 0 : defects.some((d) => d.includes(c.expect));
      if (!pass) failed++;
      out.push((pass ? 'ok    ' : 'FAIL  ') + c.name + ' — ' + (defects.length ? defects.join(' | ') : 'дефектов нет'));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
  /* Собранный реестр выполняется и отдаёт те же записи: шапка — блочный
     комментарий, и глоб «звёздочка-слэш» в её тексте закрыл бы его на середине
     (так было в первой сборке 22.09.2026 — реестр не выполнялся). */
  {
    const r = mkdtempSync(path.join(os.tmpdir(), 'hub-build-'));
    try {
      put(r, 'project.json', JSON.stringify(MANIFEST));
      put(r, 'apps/alpha/app.json', app('alpha', 'product', { title: "Кавычка ' и слэш \\ в названии" }));
      check(project(r), true);
      const ctx = { window: {} };
      let got = null;
      try { vm.runInNewContext(readFileSync(path.join(r, 'hub.js'), 'utf8'), ctx); got = ctx.window.IBPHub; } catch (e) { got = e.message; }
      const pass = Array.isArray(got) && got.length === 2 && got[1].title === "Кавычка ' и слэш \\ в названии";
      if (!pass) failed++;
      out.push((pass ? 'ok    ' : 'FAIL  ') + 'собранный реестр выполняется — ' + (Array.isArray(got) ? 'записей ' + got.length : got));
    } finally {
      rmSync(r, { recursive: true, force: true });
    }
  }
  /* Порядок и форма записей: ДС первой, треки по порядку манифеста, группа — hubGroup трека. */
  const root = mkdtempSync(path.join(os.tmpdir(), 'hub-build-'));
  try {
    put(root, 'project.json', JSON.stringify(MANIFEST));
    put(root, 'apps/zeta/app.json', app('zeta', 'rnd'));
    put(root, 'apps/alpha/app.json', app('alpha', 'product', { home: 'pages/MainPage.html' }));
    const { entries } = collect(project(root));
    const got = entries.map((e) => e.id + ':' + e.group + ':' + (e.href || '')).join(' ');
    const pass = got === 'ds:ds:ds/index.html alpha:projects:apps/alpha/pages/MainPage.html zeta:concepts:apps/zeta/pages/Start.html';
    if (!pass) failed++;
    out.push((pass ? 'ok    ' : 'FAIL  ') + 'порядок и форма записей — ' + got);
  } finally {
    rmSync(root, { recursive: true, force: true });
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
  const P = need('hub-build', HERE);
  const write = !args.includes('--check');
  const res = check(P, write);
  console.log(report(write ? 'hub-build' : 'hub-build --check', res));
  process.exit(res.defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

#!/usr/bin/env node
/* ============================================================
   REGISTRY-CHECK — сторож реестра хаба проектов (бывший projects-hub.mjs).

   Зачем. Хаб строит меню и три колонки (дизайн-система, проекты, концепты)
   из реестра hub.js в корне. По file:// страница не может сама обойти
   папки, поэтому реестр ведётся руками — а правило «добавь запись в реестр»
   прозой не держится: забытый проект или концепт просто молча не появляется
   на хабе. Сторож делает забывание видимым: гейт краснеет.

   Имена — из манифеста project.json (project.mjs; реструктуризация, шаг Ш4):
   реестр и страница хаба (`hub`), каталог приложений и имя их записи
   (`apps.dir`, `apps.manifest`), форма приложения (`appShape`), треки и их
   группы на хабе (`tracks[]`: `id` → `hubGroup`), ДС (`designSystem.mount`).
   До Ш4 здесь были литералы `hub.js`, `Projects`, `Concepts`, `DS-IBP`, и
   переезд любого каталога сделал бы сторожа слепым. Группа `ds` — витрина ДС,
   у неё нет root.

   С Ш7 (21.09.2026) трек — свойство приложения, а не место на диске: все
   приложения лежат в `apps/<id>/`, трек записан в его `app.json`. Правило
   «root лежит в каталоге своей группы» осталось только для манифеста прежней
   формы (у треков свои `dir`, без `apps.dir`); в новой форме его заменяет
   сверка `track` из `app.json` с треками манифеста и с группой записи.

   Что проверяет (коды П — «проекты»):
     П1 манифест и реестр читаются; у записей есть обязательные поля, id
        уникальны, group из списка, у записей треков есть root;
     П2 иконка записи есть в <ДС>/specs/Icons.md;
     П3 файл по href существует, папка root существует, href лежит в root;
        root — каталог приложения (`apps/<id>`) с записью `app.json`: она
        читается, `track` — из треков манифеста, группа записи — группа
        этого трека (концепт не зарегистрировать проектом и наоборот), `id`,
        если задан, совпадает с каталогом. В манифесте прежней формы — root
        лежит в каталоге своего трека;
     П4 полнота: каждый .html в каталогах треков лежит внутри root
        какой-нибудь записи (исключение — любая папка fixtures);
        витрина ДС (<ДС>/index.html) зарегистрирована;
     П5 возврат в хаб: экран внутри root проекта или концепта, где есть
        строка пользователя меню (nav__user или вызов footerHTML), ведёт ею на
        хаб — в файле есть литерал относительного пути до корневого
        index.html, нет статического nav__user с href="#", а каждый вызов
        footerHTML(…) заканчивается подменой .replace(…);
     П6 форма приложения: .html приложения лежат только в `pages/` — прямо в
        нём, все экраны на одной глубине — или в `components/` на любой
        глубине (фрагменты модульных экранов); исключение — папки fixtures;
     П7 ссылки страниц приложений и хаба живые: каждый относительный путь в
        href, src, data и `__DS_ROOT` (вне комментариев, без склейки в
        скрипте) ведёт к существующему файлу — так страница откроется двойным
        кликом. Линтер ДС этого не видит по устройству: его индекс файлов —
        дерево ДС, путь наружу он пропускает (A5). До 22.09.2026 битую ссылку
        на экране не ловил никто: на переезде Ш7 так уехали семь ссылок на
        pdf-пример и ссылка со страницы ДС на экран проекта (урок Л127).

   Честная граница П5: проверка статическая. Разметку, склеенную из кусков
   без литерала пути, и подмену, которая ничего не находит, она не видит —
   это видно только в браузере.

   Журнал прогонов (runs/) сторож не пишет: у него нет кодов, которые
   `stats` должен делить на «живой/исчез», а лишние строки вытеснили бы из
   окна настоящие экраны.

   Использование:
     node registry-check.mjs [check] [--root <корень проекта>]
     node registry-check.mjs --selftest   — откат на временном дереве
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFileSync, existsSync, readdirSync, statSync, mkdirSync, writeFileSync, rmSync, mkdtempSync, renameSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { project } from './project.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIELDS = ['id', 'group', 'title', 'desc', 'href', 'icon'];

const slash = (p) => p.split(path.sep).join('/');
const inside = (file, dir) => {
  const r = path.relative(dir, file);
  return r !== '' && !r.startsWith('..') && !path.isAbsolute(r);
};

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function loadRegistry(file) {
  const ctx = { window: {} };
  vm.runInNewContext(readFileSync(file, 'utf8'), ctx, { filename: file, timeout: 1000 });
  return ctx.window.IBPHub;
}

/** Имена глифов из строки после заголовка «## Все глифы». null — файла нет. */
function iconNames(dsAbs) {
  const f = path.join(dsAbs, 'specs', 'Icons.md');
  if (!existsSync(f)) return null;
  const lines = readFileSync(f, 'utf8').split(/\r?\n/);
  const i = lines.findIndex((l) => l.startsWith('## Все глифы'));
  if (i < 0) return null;
  return new Set((lines[i + 1] || '').split('·').map((s) => s.trim()).filter(Boolean));
}

/** Текст без HTML- и блочных JS-комментариев: упоминание в комментарии — не код. */
function codeOf(src) {
  return src.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

const inFixtures = (rel) => rel.split('/').includes('fixtures');

export function check(from = HERE) {
  const defects = [];
  const stats = { entries: 0, pages: 0, screens: 0, areas: [] };
  const P = project(from);
  if (P.error) return { defects: ['П1 ' + P.error + ' — реестр не с чем сверять'], stats };
  const repo = P.root;
  const REGISTRY = P.hubRegistry;
  const HUB = P.hubPage;
  // группа → каталог трека, в котором обязан лежать root записи (у ds root нет)
  const GROUP_DIRS = { ds: null };
  for (const t of P.tracks) if (t.hubGroup) GROUP_DIRS[t.hubGroup] = t.dir;
  const AREAS = [...new Set(P.tracks.map((t) => t.dir).filter(Boolean))];
  /* Форма после Ш7: общий каталог приложений, трек — в записи приложения. */
  const APPS = P.appsDir ? path.join(repo, P.appsDir) : null;
  const trackById = new Map(P.tracks.map((t) => [t.id, t]));
  const relOf = (abs) => slash(path.relative(repo, abs));
  stats.areas = AREAS;
  const regFile = path.join(repo, REGISTRY);

  if (!existsSync(regFile)) return { defects: ['П1 нет реестра ' + REGISTRY + ' в корне'], stats };
  let list;
  try { list = loadRegistry(regFile); } catch (e) {
    return { defects: ['П1 реестр ' + REGISTRY + ' не выполняется: ' + e.message], stats };
  }
  if (!Array.isArray(list)) return { defects: ['П1 реестр не задаёт массив window.IBPHub'], stats };
  stats.entries = list.length;

  /* П1–П3 записи */
  const icons = iconNames(P.dsAbs);
  const ids = new Set();
  const valid = [];
  list.forEach((e, i) => {
    const name = 'запись ' + (i + 1) + (e && typeof e.id === 'string' ? ' «' + e.id + '»' : '');
    if (!e || typeof e !== 'object') { defects.push('П1 ' + name + ' — не объект'); return; }
    const missing = FIELDS.filter((f) => typeof e[f] !== 'string' || !e[f].trim());
    if (missing.length) { defects.push('П1 ' + name + ' — нет полей: ' + missing.join(', ')); return; }
    if (ids.has(e.id)) defects.push('П1 ' + name + ' — id повторяется');
    ids.add(e.id);
    if (!(e.group in GROUP_DIRS)) {
      defects.push('П1 ' + name + ' — group «' + e.group + '» не из списка: ' + Object.keys(GROUP_DIRS).join(', '));
      return;
    }
    const groupDir = GROUP_DIRS[e.group];
    const hasRoot = typeof e.root === 'string' && e.root.trim();
    if (groupDir && !hasRoot) defects.push('П1 ' + name + ' — нет root (папка записи от корня, внутри ' + groupDir + '/)');
    if (icons && !icons.has(e.icon)) defects.push('П2 ' + name + ' — иконки «' + e.icon + '» нет в ' + P.ds + '/specs/Icons.md');

    const href = path.resolve(repo, e.href);
    if (!existsSync(href)) defects.push('П3 ' + name + ' — href ведёт на несуществующий файл: ' + e.href);
    let rootAbs = null;
    if (hasRoot) {
      rootAbs = path.resolve(repo, e.root);
      if (!existsSync(rootAbs) || !statSync(rootAbs).isDirectory()) defects.push('П3 ' + name + ' — папки root нет: ' + e.root);
      else if (!inside(href, rootAbs)) defects.push('П3 ' + name + ' — href лежит вне root: ' + e.href);
      if (APPS && groupDir) appDefects(name, e, rootAbs);
      else if (groupDir && !inside(rootAbs, path.join(repo, groupDir))) {
        defects.push('П3 ' + name + ' — root «' + e.root + '» вне папки группы ' + groupDir + '/ (group: \'' + e.group + '\')');
      }
    }
    valid.push({ ...e, hrefAbs: href, rootAbs });
  });

  /* П3 для формы после Ш7: root — каталог приложения с записью app.json. */
  function appDefects(name, e, rootAbs) {
    if (path.dirname(rootAbs) !== APPS) {
      defects.push('П3 ' + name + ' — root «' + e.root + '» не каталог приложения: ожидается ' + P.appsDir + '/<id>');
      return;
    }
    const mf = path.join(rootAbs, P.appsManifest);
    if (!existsSync(mf)) { defects.push('П3 ' + name + ' — нет ' + relOf(mf) + ': трек приложения не объявлен'); return; }
    let app;
    try { app = JSON.parse(readFileSync(mf, 'utf8')); } catch (err) {
      defects.push('П3 ' + name + ' — ' + relOf(mf) + ' не читается как JSON: ' + err.message);
      return;
    }
    const t = trackById.get(app.track);
    if (!t) defects.push('П3 ' + name + ' — track «' + app.track + '» в ' + relOf(mf) + ' не из треков манифеста: ' + [...trackById.keys()].join(', '));
    else if (t.hubGroup !== e.group) {
      defects.push('П3 ' + name + ' — group «' + e.group + '» не совпадает с треком приложения «' + t.id + '» (ожидается group \'' + t.hubGroup + '\')');
    }
    if (app.id !== undefined && app.id !== path.basename(rootAbs)) {
      defects.push('П3 ' + name + ' — id «' + app.id + '» в ' + relOf(mf) + ' не совпадает с каталогом приложения «' + path.basename(rootAbs) + '»');
    }
  }

  /* П4 полнота */
  const roots = valid.filter((e) => e.rootAbs).map((e) => e.rootAbs);
  for (const area of AREAS) {
    for (const f of walk(path.join(repo, area))) {
      if (!f.endsWith('.html')) continue;
      const rel = slash(path.relative(repo, f));
      if (inFixtures(rel)) continue;
      stats.pages++;
      if (roots.some((r) => inside(f, r))) continue;
      defects.push('П4 ' + rel + ' — страница вне записей реестра: добавить запись в ' + REGISTRY + ' (root — ' + (APPS ? 'каталог приложения ' + P.appsDir + '/<id>' : 'папка проекта или концепта') + ')');
    }
  }
  /* П6 форма приложения */
  if (APPS && existsSync(APPS)) {
    const S = P.appShape;
    for (const d of readdirSync(APPS, { withFileTypes: true })) {
      if (!d.isDirectory() || d.name.startsWith('.')) continue;
      const appAbs = path.join(APPS, d.name);
      for (const f of walk(appAbs)) {
        if (!f.endsWith('.html') || inFixtures(relOf(f))) continue;
        const parts = slash(path.relative(appAbs, f)).split('/');
        if ((parts.length === 2 && parts[0] === S.pages) || parts[0] === S.components) continue;
        defects.push('П6 ' + relOf(f) + ' — страница вне ' + S.pages + '/ приложения: экраны лежат прямо в ' + P.appsDir + '/<id>/' + S.pages + '/ на одной глубине, фрагменты — в ' + S.components + '/');
      }
    }
  }

  /* П7 битые относительные ссылки на страницах приложений и хаба */
  const linkPages = AREAS.flatMap((a) => walk(path.join(repo, a)))
    .filter((f) => f.endsWith('.html') && !inFixtures(relOf(f)));
  if (existsSync(path.join(repo, HUB))) linkPages.push(path.join(repo, HUB));
  for (const f of linkPages) {
    const code = codeOf(readFileSync(f, 'utf8'));
    const vals = [...code.matchAll(/\b(?:href|src|data)="([^"]*)"/g)].map((m) => m[1]);
    for (const m of code.matchAll(/__DS_ROOT\s*=\s*'([^']+)'/g)) vals.push(m[1]);
    for (const v of new Set(vals)) {
      if (!v.trim() || /^(https?:|mailto:|tel:|data:|javascript:|#|\/)/i.test(v) || /[${}+'<>…]/.test(v)) continue;
      let clean = v.split('#')[0].split('?')[0];
      try { clean = decodeURI(clean); } catch { /* путь с % оставляем как есть */ }
      if (!clean) continue;
      const target = path.resolve(path.dirname(f), clean);
      if (!existsSync(target)) defects.push('П7 ' + relOf(f) + ' — битая ссылка ' + v + ': ' + relOf(target) + ' нет на диске');
    }
  }

  const dsIndex = path.join(P.dsAbs, 'index.html');
  if (existsSync(dsIndex) && !valid.some((e) => e.hrefAbs === dsIndex)) {
    defects.push('П4 ' + P.ds + '/index.html — дизайн-система не в реестре (group: \'ds\')');
  }

  /* П5 возврат в хаб */
  const hub = path.join(repo, HUB);
  for (const e of valid) {
    if (!e.rootAbs || !GROUP_DIRS[e.group]) continue;
    for (const f of walk(e.rootAbs)) {
      const rel = slash(path.relative(repo, f));
      if (!f.endsWith('.html') || inFixtures(rel)) continue;
      const code = codeOf(readFileSync(f, 'utf8'));
      if (!/nav__user|footerHTML\(/.test(code)) continue;
      stats.screens++;
      const hubRel = slash(path.relative(path.dirname(f), hub));
      if (code.includes('nav__user" href="#"')) {
        defects.push('П5 ' + rel + ' — строка пользователя меню ведёт на «#», а не на хаб ' + hubRel);
      }
      if (!code.includes('"' + hubRel + '"') && !code.includes('\'' + hubRel + '\'')) {
        defects.push('П5 ' + rel + ' — нет ссылки на хаб: ожидается путь ' + hubRel + ' у строки пользователя меню');
      }
      const calls = [...code.matchAll(/footerHTML\(/g)];
      const bare = calls.filter((m) => {
        const end = code.indexOf(';', m.index);
        const stmt = code.slice(m.index, end < 0 ? m.index + 400 : end);
        return !/\)\s*\.replace\(/.test(stmt);
      });
      if (bare.length) {
        defects.push('П5 ' + rel + ' — footerHTML(…) без подмены .replace(…): строка пользователя останется ссылкой «#» (вызовов без подмены: ' + bare.length + ')');
      }
    }
  }

  return { defects, stats };
}

function report({ defects, stats }) {
  const out = ['== registry-check ==',
    'реестр: записей ' + stats.entries + ' · страниц в ' + (stats.areas.map((a) => a + '/').join(' и ') || '—') + ': ' + stats.pages + ' · экранов с меню проверено: ' + stats.screens];
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

function registryJs(entries) {
  return '/* тестовый реестр */\nwindow.IBPHub = ' + JSON.stringify(entries, null, 2) + ';\n';
}

const CLEAN_ENTRIES = [
  { id: 'ds', group: 'ds', title: 'ДС', desc: 'тест', href: 'design-system/index.html', root: null, icon: 'layer-01' },
  { id: 'alpha', group: 'projects', title: 'Альфа', desc: 'тест', href: 'apps/alpha/pages/Start.html', root: 'apps/alpha', icon: 'folder' },
  { id: 'gamma', group: 'concepts', title: 'Гамма', desc: 'тест', href: 'apps/gamma/pages/Gamma.html', root: 'apps/gamma', icon: 'folder' },
];
const withEntry = (i, patch) => CLEAN_ENTRIES.map((e, k) => (k === i ? { ...e, ...patch } : e));

const MANIFEST = {
  contract: 1, id: 'fixture',
  designSystem: { mount: 'design-system' }, agentKit: { mount: '.kit' },
  hub: { page: 'index.html', registry: 'hub.js' },
  apps: { dir: 'apps', manifest: 'app.json' },
  tracks: [
    { id: 'product', title: 'Проекты', hubGroup: 'projects' },
    { id: 'rnd', title: 'Концепты', hubGroup: 'concepts' },
  ],
};
const appJson = (id, track) => JSON.stringify({ id, track }, null, 2);

function cleanTree(root) {
  put(root, 'project.json', JSON.stringify(MANIFEST, null, 2));
  put(root, 'design-system/specs/Icons.md', '# Иконки\n\n## Все глифы (2)\nfolder · layer-01\n');
  put(root, 'design-system/index.html', '<!DOCTYPE html><title>ДС</title>');
  put(root, 'index.html', '<!DOCTYPE html><title>Хаб</title>');
  put(root, 'hub.js', registryJs(CLEAN_ENTRIES));
  put(root, 'apps/alpha/app.json', appJson('alpha', 'product'));
  put(root, 'apps/alpha/pages/Start.html',
    '<nav class="nav"><div class="nav__footer"><a class="nav__user" href="../../../index.html" aria-label="Хаб проектов">А</a></div></nav>');
  put(root, 'apps/alpha/pages/Screen.html',
    '<script>var USER_LINK_TO = \' href="../../../index.html"\';\n'
    + 'var s = window.IBPHome.footerHTML(role, { logoutModal: \'m\' }).replace(\' href="#"\', USER_LINK_TO);</script>');
  put(root, 'apps/alpha/pages/NoNav.html', '<p>экран без меню</p>');
  put(root, 'apps/alpha/components/Tile/Tile.html', '<section class="tile">фрагмент</section>');
  put(root, 'apps/gamma/app.json', appJson('gamma', 'rnd'));
  put(root, 'apps/gamma/pages/Gamma.html',
    '<div class="nav__footer"><a class="nav__user" href="../../../index.html" aria-label="Хаб проектов">Г</a></div>');
  put(root, 'apps/alpha/fixtures/index.html', '<a class="nav__user" href="#">фикстура</a>');
  put(root, 'apps/fixtures/lint/X.html', '<a class="nav__user" href="#">фикстура</a>');
}

const CASES = [
  { name: 'чистое дерево', expect: null },
  { name: 'страница приложения вне реестра', expect: 'П4 apps/beta/pages/Beta.html',
    mutate: (r) => { put(r, 'apps/beta/app.json', appJson('beta', 'rnd')); put(r, 'apps/beta/pages/Beta.html', '<p>новый концепт</p>'); } },
  { name: 'ДС не в реестре', expect: 'П4 design-system/index.html',
    mutate: (r) => put(r, 'hub.js', registryJs(CLEAN_ENTRIES.filter((e) => e.group !== 'ds'))) },
  { name: 'битый href', expect: 'несуществующий файл',
    mutate: (r) => put(r, 'hub.js', registryJs(withEntry(1, { href: 'apps/alpha/pages/Missing.html' }))) },
  { name: 'href вне root', expect: 'href лежит вне root',
    mutate: (r) => put(r, 'hub.js', registryJs(withEntry(1, { href: 'apps/gamma/pages/Gamma.html' }))) },
  { name: 'концепт зарегистрирован проектом', expect: 'не совпадает с треком приложения «rnd»',
    mutate: (r) => put(r, 'hub.js', registryJs(withEntry(2, { group: 'projects' }))) },
  { name: 'у приложения нет app.json', expect: 'нет apps/gamma/app.json',
    mutate: (r) => rmSync(path.join(r, 'apps/gamma/app.json')) },
  { name: 'track не из манифеста', expect: 'track «lab»',
    mutate: (r) => put(r, 'apps/gamma/app.json', appJson('gamma', 'lab')) },
  { name: 'id записи приложения не совпадает с каталогом', expect: 'не совпадает с каталогом приложения «gamma»',
    mutate: (r) => put(r, 'apps/gamma/app.json', appJson('delta', 'rnd')) },
  { name: 'root — не каталог приложения', expect: 'не каталог приложения',
    mutate: (r) => put(r, 'hub.js', registryJs(withEntry(2, { root: 'apps/gamma/pages' }))) },
  { name: 'экран вне pages', expect: 'П6 apps/gamma/Extra.html',
    mutate: (r) => put(r, 'apps/gamma/Extra.html', '<p>экран не на месте</p>') },
  { name: 'экран во вложенной папке pages', expect: 'П6 apps/gamma/pages/sub/Deep.html',
    mutate: (r) => put(r, 'apps/gamma/pages/sub/Deep.html', '<p>экран глубже остальных</p>') },
  { name: 'битая ссылка на экране', expect: 'П7 apps/gamma/pages/Gamma.html — битая ссылка ../refs/missing.pdf',
    mutate: (r) => put(r, 'apps/gamma/pages/Gamma.html',
      '<div class="nav__footer"><a class="nav__user" href="../../../index.html" aria-label="Хаб проектов">Г</a></div>\n<a href="../refs/missing.pdf">пример</a>') },
  { name: 'живая ссылка на входящий материал', expect: null,
    mutate: (r) => { put(r, 'apps/gamma/refs/example.pdf', '%PDF'); put(r, 'apps/gamma/pages/Gamma.html',
      '<div class="nav__footer"><a class="nav__user" href="../../../index.html" aria-label="Хаб проектов">Г</a></div>\n<object data="../refs/example.pdf#toolbar=0"></object>'); } },
  { name: 'ссылка в комментарии и склейка в скрипте не сверяются', expect: null,
    mutate: (r) => put(r, 'apps/gamma/pages/Gamma.html',
      '<div class="nav__footer"><a class="nav__user" href="../../../index.html" aria-label="Хаб проектов">Г</a></div>\n<!-- <a href="old/Gone.html"> -->\n<script>var s = \'<a href="\' + page + \'.html">\';</script>') },
  { name: 'битый корень ДС для рантайма', expect: 'П7 apps/alpha/pages/NoNav.html — битая ссылка ../../design-system/',
    mutate: (r) => put(r, 'apps/alpha/pages/NoNav.html', "<script>window.__DS_ROOT = '../../design-system/';</script><p>экран без меню</p>") },
  { name: 'неизвестная иконка', expect: 'П2',
    mutate: (r) => put(r, 'hub.js', registryJs(withEntry(1, { icon: 'no-such-glyph' }))) },
  { name: 'повтор id', expect: 'id повторяется',
    mutate: (r) => put(r, 'hub.js', registryJs([...CLEAN_ENTRIES, { ...CLEAN_ENTRIES[2] }])) },
  { name: 'концепт без root', expect: 'нет root',
    mutate: (r) => put(r, 'hub.js', registryJs(withEntry(2, { root: null }))) },
  { name: 'строка пользователя на «#»', expect: 'ведёт на «#»',
    mutate: (r) => put(r, 'apps/gamma/pages/Gamma.html', '<a class="nav__user" href="#" aria-label="Открыть личный кабинет">Г</a>') },
  { name: 'footerHTML без подмены', expect: 'без подмены',
    mutate: (r) => put(r, 'apps/alpha/pages/Screen.html', '<script>var USER_LINK_TO = \' href="../../../index.html"\';\nvar s = window.IBPHome.footerHTML(role);</script>') },
  { name: 'реестр не выполняется', expect: 'не выполняется',
    mutate: (r) => put(r, 'hub.js', 'window.IBPHub = [ {;') },
  /* Имена — из манифеста, а не литералами: то же дерево под другими именами
     обязано пройти, а страница вне реестра — найтись в переименованном каталоге. */
  { name: 'другие имена каталогов в манифесте', expect: null,
    mutate: (r) => renameTree(r) },
  { name: 'страница вне реестра в переименованном каталоге', expect: 'П4 prj/delta/screens/Delta.html',
    mutate: (r) => { renameTree(r); put(r, 'prj/delta/meta.json', appJson('delta', 'rnd')); put(r, 'prj/delta/screens/Delta.html', '<p>новый концепт</p>'); } },
  /* Манифест прежней формы: у треков свои каталоги, записи приложений нет. */
  { name: 'форма до Ш7: каталоги треков', expect: null,
    mutate: (r) => legacyTree(r) },
  { name: 'форма до Ш7: концепт зарегистрирован проектом', expect: 'вне папки группы Projects/',
    mutate: (r) => { legacyTree(r); put(r, 'hub.js', registryJs(LEGACY_ENTRIES.map((e) => (e.id === 'gamma' ? { ...e, group: 'projects' } : e)))); } },
  { name: 'манифеста нет', expect: 'П1 project.json не найден',
    mutate: (r) => rmSync(path.join(r, 'project.json')) },
];

/* Дерево под другими именами: ДС, каталог приложений, их записи, папка
   экранов и реестр переименованы, манифест описывает новые имена. Ссылки
   внутри экранов от имён не зависят (глубина та же), поэтому переписываются
   только пути в реестре. */
function renameTree(root) {
  renameSync(path.join(root, 'design-system'), path.join(root, 'kit-ds'));
  renameSync(path.join(root, 'apps'), path.join(root, 'prj'));
  for (const app of ['alpha', 'gamma']) {
    renameSync(path.join(root, 'prj', app, 'app.json'), path.join(root, 'prj', app, 'meta.json'));
    renameSync(path.join(root, 'prj', app, 'pages'), path.join(root, 'prj', app, 'screens'));
  }
  rmSync(path.join(root, 'hub.js'));
  const entries = CLEAN_ENTRIES.map((e) => ({
    ...e,
    href: e.href.replace(/^design-system\//, 'kit-ds/').replace(/^apps\/(\w+)\/pages\//, 'prj/$1/screens/'),
    root: e.root && e.root.replace(/^apps\//, 'prj/'),
  }));
  put(root, 'registry.js', registryJs(entries));
  put(root, 'project.json', JSON.stringify({
    ...MANIFEST,
    designSystem: { mount: 'kit-ds' },
    hub: { page: 'index.html', registry: 'registry.js' },
    apps: { dir: 'prj', manifest: 'meta.json' },
    appShape: { pages: 'screens' },
  }, null, 2));
}

const LEGACY_ENTRIES = [
  CLEAN_ENTRIES[0],
  { id: 'alpha', group: 'projects', title: 'Альфа', desc: 'тест', href: 'Projects/alpha/start/index.html', root: 'Projects/alpha', icon: 'folder' },
  { id: 'gamma', group: 'concepts', title: 'Гамма', desc: 'тест', href: 'Concepts/gamma/Gamma.html', root: 'Concepts/gamma', icon: 'folder' },
];

/* Манифест и дерево до Ш7: треки со своими каталогами, экраны на разной глубине. */
function legacyTree(root) {
  rmSync(path.join(root, 'apps'), { recursive: true, force: true });
  const { apps, ...rest } = MANIFEST;
  put(root, 'project.json', JSON.stringify({
    ...rest,
    tracks: [
      { id: 'product', title: 'Проекты', dir: 'Projects', hubGroup: 'projects' },
      { id: 'rnd', title: 'Концепты', dir: 'Concepts', hubGroup: 'concepts' },
    ],
  }, null, 2));
  put(root, 'hub.js', registryJs(LEGACY_ENTRIES));
  put(root, 'Projects/alpha/start/index.html',
    '<nav class="nav"><div class="nav__footer"><a class="nav__user" href="../../../index.html" aria-label="Хаб проектов">А</a></div></nav>');
  put(root, 'Concepts/gamma/Gamma.html',
    '<div class="nav__footer"><a class="nav__user" href="../../index.html" aria-label="Хаб проектов">Г</a></div>');
}

function selftest() {
  const out = ['== registry-check --selftest =='];
  let failed = 0;
  for (const c of CASES) {
    const root = mkdtempSync(path.join(os.tmpdir(), 'registry-check-'));
    try {
      cleanTree(root);
      if (c.mutate) c.mutate(root);
      const { defects } = check(root);
      const pass = c.expect === null
        ? defects.length === 0
        : defects.length > 0 && defects.some((d) => d.includes(c.expect));
      if (!pass) failed++;
      // префикс FAIL — его показывает гейт (фильтр FINDING в lessons-cli.mjs)
      out.push((pass ? 'ok    ' : 'FAIL  ') + c.name + ' — ' + (defects.length ? defects.join(' | ') : 'дефектов нет'));
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
  const rIdx = args.indexOf('--root');
  const res = check(rIdx >= 0 ? path.resolve(args[rIdx + 1]) : HERE);
  console.log(report(res));
  process.exit(res.defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

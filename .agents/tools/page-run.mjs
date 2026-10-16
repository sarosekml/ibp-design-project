#!/usr/bin/env node
/* ============================================================
   PAGE-RUN — прогон страницы в DOM без браузера (RE0020, Э5).

   Вопрос, на который отвечает: работает ли страница после загрузки и после
   действий — не падают ли скрипты, связаны ли хуки рантаймов, не держит ли
   скрипт страницы узел, который рантайм ДС перестроил (Л184–Л186, Л93).
   Статика (layout-check) этого не видит: дефект проявляется только при
   исполнении. Браузер по скрипту в контуре компании не запускается
   (process.md §9) — страница исполняется в модели браузера на linkedom.

   Как устроено: на каждую загрузку — свой процесс page-env.mjs (чистые
   глобалы, таймаут). Загрузчик ДС, рантаймы, скрипты страницы и панели
   выполняет сама страница — инструмент их не перечисляет и не подменяет.
   Действия проигрывает исполнитель панели прототипа (`ProtoPanel._runner.play`),
   уже загруженный на странице, — своей копии глаголов нет.

   Что проигрывается:
     по умолчанию — загрузка страницы и сценарии панели (зеркало flows.yaml
       приложения), у которых точка входа — эта страница: на точку входа —
       своя загрузка с её адресом, шаги до следующей точки входа;
     --scenario <файл.mjs> — ключевое поведение экрана своим кодом:
       export default async (page) => { … }, API — page.do(действия),
       page.click(селектор, {text, index}), page.check(условие, текст),
       page.text(селектор) — текст без копий тултипа, page.changed(async fn),
       page.step(имя), page.wait(мс), page.window, page.document.

   Запуск (из корня репо):
     node .agents/tools/page-run.mjs <страница.html> [ещё страницы]
         [--query "<id=1&…>"] [--flow <id>] [--no-flows] [--scenario <файл.mjs>]
         [--html <копия.html>] [--swap <src>=<файл>] [--deps <каталог>]
         [--settle <мс>] [--timeout <мс>] [--json]
     node .agents/tools/page-run.mjs --all [--flows]   — все страницы приложений
     node .agents/tools/page-run.mjs --rules | --selftest | --help

   --html — текст страницы из копии, пути от исходника (откат без копии в
   папке страницы); --swap — подменить один скрипт файлом (откат данных),
   src — как в разметке страницы.

   linkedom — вне git: --deps, переменная PAGE_RUN_DEPS или tmp/page-run/
   (в .gitignore). Нет — код 2 и как поставить.

   Вывод: строка ВЕРДИКТ:, коды выхода 0 — OK, 1 — FAIL, 2 — ОШИБКА (нет
   linkedom, нет страницы, неверные аргументы, окружение упало). Страница без
   сценария (ни панели, ни --scenario) — замечание ЖВ10 и вердикт ТОЛЬКО
   ЗАГРУЗКА с кодом 0: дефекта нет, но и действия не проверялись (RE0023).
   В журнал прогонов не пишет и шагом гейта не является (RE0020, решение
   человека).
   ============================================================ */
import { existsSync, readdirSync, mkdirSync, writeFileSync, rmSync, mkdtempSync, readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { need } from './project.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ENV = path.join(HERE, 'page-env.mjs');
const P = need('page-run');
const ROOT = P.root;
const DEFAULT_DEPS = path.join(ROOT, 'tmp', 'page-run');
const LINKEDOM_VERSION = '0.18.13';
const say = (s = '') => console.log(s);
const fail = (msg) => { say('ОШИБКА: ' + msg); process.exit(2); };

const RULES = [
  ['ЖВ1', 'FAIL', 'ошибка скрипта при загрузке, в обработчике, таймере, промисе — файл, строка, происхождение (страница, виджет, данные, ДС, панель, загрузчик)', 'Л184, Л185'],
  ['ЖВ2', 'FAIL', 'src скрипта ведёт в никуда', '—'],
  ['ЖВ3', 'FAIL', 'файл данных присваивает window.X, а после загрузки X не определён', 'Л184'],
  ['ЖВ4', 'FAIL/WARN', 'console.error (FAIL), console.warn (WARN)', '—'],
  ['ЖВ5', 'FAIL', 'хук рантайма без отметки привязки — после загрузки и после каждого шага (список хуков — hook-binds.mjs)', 'Л93'],
  ['ЖВ6', 'FAIL', 'id был при выполнении скриптов, пропал после рантаймов ДС и запрошен скриптом страницы', 'Л185'],
  ['ЖВ7', 'FAIL/WARN', 'шаг сценария панели не прошёл (FAIL) или ничего не изменил на странице (WARN)', 'Л186'],
  ['ЖВ8', 'FAIL', 'проверка или действие из --scenario не прошли', '—'],
  ['ЖВ9', 'FAIL', 'сценарий подменил рантайм ДС — прогон не засчитывается', 'Л34'],
  ['ЖВ10', 'WARN', 'сценария нет — проверена только загрузка: действия не проигрывались, вердикт ТОЛЬКО ЗАГРУЗКА вместо OK', 'RE0023'],
];
const NOT_CHECKED = 'пиксели и CSS-каскад; геометрия, скролл, перекрытия; видимость по стилям вне инлайна; настоящий клик (микрозадачи между слушателями, З13); переход на другую страницу';

/* ---------------- аргументы ---------------- */

const argv = process.argv.slice(2);
const opt = { pages: [], query: '', flow: null, flows: true, scenario: null, html: null, swaps: [], deps: null, settle: 300, timeout: 30000, json: false, all: false, allFlows: false };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  const val = () => { if (i + 1 >= argv.length) fail(a + ' без значения — см. --help'); return argv[++i]; };
  if (a === '--help' || a === '-h') { help(); process.exit(0); }
  else if (a === '--rules') { rules(); process.exit(0); }
  else if (a === '--selftest') { opt.selftest = true; }
  else if (a === '--query') opt.query = val().replace(/^\?/, '');
  else if (a === '--flow') opt.flow = val();
  else if (a === '--no-flows') opt.flows = false;
  else if (a === '--flows') opt.allFlows = true;
  else if (a === '--scenario') opt.scenario = path.resolve(val());
  else if (a === '--html') opt.html = path.resolve(val());
  else if (a === '--swap') { const v = val(); const k = v.indexOf('='); if (k < 1) fail('--swap ждёт <src>=<файл>, получено: ' + v); opt.swaps.push([v.slice(0, k), path.resolve(v.slice(k + 1))]); }
  else if (a === '--deps') opt.deps = path.resolve(val());
  else if (a === '--settle') opt.settle = Math.max(0, parseInt(val(), 10) || 0);
  else if (a === '--timeout') opt.timeout = Math.max(1000, parseInt(val(), 10) || 30000);
  else if (a === '--json') opt.json = true;
  else if (a === '--all') opt.all = true;
  else if (a.startsWith('--')) fail('неизвестный ключ ' + a + ' — см. --help');
  else opt.pages.push(path.resolve(a));
}

function help() {
  const src = readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const head = src.slice(src.indexOf('/* ='), src.indexOf('= */') + 4);
  say(head.replace(/^\/\* =+\n?|\n?\s*=+ \*\/$/g, '').replace(/^ {3}/gm, ''));
}
function rules() {
  say('Проверки прогона page-run (RE0020, Э5):');
  for (const [c, l, w, les] of RULES) say(`  ${c}  ${l.padEnd(9)} ${w}${les !== '—' ? ' (' + les + ')' : ''}`);
  say('НЕ ПРОВЕРЯЕТСЯ: ' + NOT_CHECKED);
}

/* ---------------- linkedom ---------------- */

function findLinkedom(dir) {
  const tried = [];
  const dirs = dir ? [dir] : [process.env.PAGE_RUN_DEPS, DEFAULT_DEPS].filter(Boolean).map((d) => path.resolve(d));
  for (const d of dirs) {
    tried.push(P.rel(d).startsWith('..') ? d : P.rel(d));
    try { return { entry: createRequire(path.join(d, 'noop.js')).resolve('linkedom'), dir: d }; } catch { /* нет в этом каталоге */ }
  }
  return { entry: null, tried };
}
function linkedomOrExit() {
  const lk = findLinkedom(opt.deps);
  if (!lk.entry) {
    say(`ОШИБКА: linkedom не найден (искал: ${lk.tried.join(', ')}).`);
    say(`  Поставить один раз на машине: npm i --prefix tmp/page-run linkedom@${LINKEDOM_VERSION}`);
    say('  Другой каталог — ключ --deps <каталог> или переменная PAGE_RUN_DEPS.');
    say('  Без npm — перенести каталог tmp/page-run/node_modules с машины, где он поставлен (в git его нет и не будет).');
    say('  В отчёте приёмки: «Б28: прогон не выполнен — linkedom недоступен».');
    process.exit(2);
  }
  /* зависимость внутри проекта — только в игнорируемом каталоге, иначе её закоммитят */
  const rel = P.rel(lk.entry);
  if (!rel.startsWith('..') && !P.vendorIgnore.some((ig) => rel === ig || rel.startsWith(ig + '/'))) {
    say(`ВНИМАНИЕ: linkedom лежит в проекте вне игнора (${rel}) — не коммитить; место ему — tmp/page-run/.`);
  }
  return lk;
}

/* ---------------- загрузка ---------------- */

const swapMap = (page) => Object.fromEntries(opt.swaps.map(([s, f]) => [path.resolve(path.dirname(page), s.split(/[?#]/)[0]), f]));
function load(lk, page, extra) {
  const job = {
    root: ROOT, page, query: opt.query, html: opt.html, swaps: swapMap(page), linkedom: lk.entry, settle: opt.settle,
    dsRel: P.ds ? P.ds.replace(/\/$/, '') : null, panelRel: P.panel ? P.panel.runtime : null, panelBoot: P.panel ? P.panel.boot : null,
    boot: P.boot ? [P.boot.head, P.boot.body].filter(Boolean) : [], listFlows: false, flow: null, scenario: null, ...extra,
  };
  const r = spawnSync(process.execPath, [ENV], { input: JSON.stringify(job), encoding: 'utf8', timeout: opt.timeout, maxBuffer: 64 * 1024 * 1024, cwd: ROOT, windowsHide: true });
  const line = (r.stdout || '').split('\n').find((l) => l.startsWith('PAGE-RUN:'));
  if (line) return JSON.parse(line.slice('PAGE-RUN:'.length));
  if (r.error && r.error.code === 'ETIMEDOUT') {
    return { page: P.rel(page), query: job.query, crashed: true, findings: [{ code: 'ЖВ1', level: 'FAIL', msg: `загрузка не завершилась за ${opt.timeout} мс — бесконечный цикл или незакрытое ожидание`, origin: 'страница', step: null }] };
  }
  const tail = ((r.stderr || '') + (r.error ? '\n' + r.error.message : '')).trim().split('\n').slice(-6).join('\n    ');
  return { page: P.rel(page), query: job.query, envError: tail || 'процесс окружения завершился без итога (код ' + r.status + ')' };
}

/* Страница целиком: загрузка, затем точки входа сценариев панели. */
function runPage(lk, page, { flows }) {
  const base = load(lk, page, { listFlows: flows, scenario: opt.scenario });
  const loads = [base];
  if (flows && base.entries) {
    for (const e of base.entries) {
      if (opt.flow && e.flow !== opt.flow) continue;
      const r = load(lk, page, { query: e.query, flow: { flow: e.flow, from: e.from, to: e.to } });
      r.entry = e;
      loads.push(r);
    }
  }
  /* ЖВ10 (RE0023, Э11 (б)): без сценария панели и без --scenario прогон видел
     только загрузку. Зелёный вердикт на нём читался как «страница работает» —
     и при мёртвой перестановке, и при окнах, недоступных в просмотре (RE0022:
     у приложения не было flows.yaml). Теперь это замечание и свой вердикт. */
  if (loads.length === 1 && !opt.scenario && !base.envError) {
    base.findings = base.findings || [];
    base.findings.push({ level: 'WARN', code: 'ЖВ10', msg: 'сценария нет — проверена только загрузка: клики, окна и переходы не проигрывались (сценарий панели flows.yaml или --scenario)' });
    base.loadOnly = true;
  }
  return loads;
}

/* ---------------- отчёт ---------------- */

const sec = (ms) => (ms / 1000).toFixed(2).replace('.', ',') + ' с';
function line(f) {
  const where = [f.file && f.file !== '?' ? f.file + (f.line ? ':' + f.line : '') : null, f.origin ? '[' + f.origin + ']' : null].filter(Boolean).join(' ');
  const ctx = [f.where, f.from ? 'вызвано из ' + f.from : null].filter(Boolean).join('; ');
  return `${f.level} ${f.code} ${f.msg}${where ? ' — ' + where : ''}${ctx ? ' (' + ctx + ')' : ''}`;
}
function report(page, loads, { compact } = {}) {
  const out = [];
  let fails = 0, warns = 0, invalid = false, envErr = null;
  const seenLoad = new Set();
  for (const r of loads) {
    if (r.envError) { envErr = r.envError; out.push(`ОКРУЖЕНИЕ УПАЛО${r.query ? ' ?' + r.query : ''}:\n    ${r.envError}`); continue; }
    const fresh = [];
    for (const f of r.findings || []) {
      if (f.level === 'FAIL') fails++; else warns++;
      if (f.code === 'ЖВ9') invalid = true;
      /* находки загрузки повторяются в каждой точке входа — печатаются один раз */
      const key = f.step ? null : [f.code, f.msg, f.file, f.line].join('|');
      if (key && seenLoad.has(key)) { if (f.level === 'FAIL') fails--; else warns--; continue; }
      if (key) seenLoad.add(key);
      fresh.push(f);
    }
    if (!r.entry) {
      const flowsNote = r.entries ? (r.entries.length ? `, точек входа сценариев: ${r.entries.length}` : ', сценариев панели на эту страницу нет') : '';
      out.push(`ЗАГРУЗКА${r.query ? ' ?' + r.query : ''}: скриптов ${r.scripts ?? '?'}, разбор ${sec(r.ms ? r.ms.parse : 0)}${flowsNote}`);
    } else {
      const st = (r.flow && r.flow.steps) || [];
      const ok = st.filter((s) => s.ok).length;
      out.push(`СЦЕНАРИЙ ${r.entry.flow} «${r.entry.title}», шаги ${r.entry.from + 1}–${r.entry.to + 1}${r.entry.query ? ' ?' + r.entry.query : ''}: прошло ${ok} из ${st.length}`);
    }
    let lastStep;
    for (const f of fresh) {
      if (f.step && f.step !== lastStep) out.push('  ' + f.step + ':');
      lastStep = f.step;
      out.push((f.step ? '    ' : '  ') + line(f));
    }
  }
  /* в сводном прогоне (--all) страница с одним ЖВ10 не печатается: он у каждой без сценария, итог — в вердикте */
  if (!compact || fails || warns - (loads.some((l) => l.loadOnly) ? 1 : 0) || envErr) {
    say('ПРОГОН ' + P.rel(page));
    for (const l of out) say(l);
  }
  return { fails, warns, invalid, envErr, loadOnly: loads.some((l) => l.loadOnly) };
}

/* ---------------- страницы ---------------- */

function allPages() {
  const list = [];
  for (const app of P.apps()) {
    if (P.showcase && (app.dir === P.showcase || app.dir.startsWith(P.showcase + '/'))) continue;
    const dir = path.join(app.abs, P.appShape.pages);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).sort()) if (/\.html$/i.test(f)) list.push(path.join(dir, f));
  }
  return list;
}

/* ---------------- самопроверка ---------------- */

function selftest() {
  const lk = linkedomOrExit();
  const base = path.join(ROOT, 'tmp');
  mkdirSync(base, { recursive: true });
  const dir = mkdtempSync(path.join(base, 'page-run-selftest-'));
  const boot = (from) => path.relative(from, path.join(ROOT, P.boot ? P.boot.head : 'apps/ds-config.js')).split(path.sep).join('/');
  const bodyBoot = (from) => path.relative(from, path.join(ROOT, P.boot ? P.boot.body : 'apps/ds-body.js')).split(path.sep).join('/');
  const page = (name, { head = '', body = '', after = '' }) => {
    const f = path.join(dir, name + '.html');
    writeFileSync(f, `<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<script src="${boot(dir)}"></script>\n${head}\n</head>\n<body>\n${body}\n<script src="${bodyBoot(dir)}"></script>\n${after}\n</body>\n</html>\n`);
    return f;
  };
  const file = (name, text) => { const f = path.join(dir, name); mkdirSync(path.dirname(f), { recursive: true }); writeFileSync(f, text); return f; };
  const crumbs = '<ol class="crumbs" data-breadcrumbs>\n<li class="crumbs__item"><a class="link link--muted" href="#">Главная</a></li>\n'
    + '<li class="crumbs__item crumbs__item--current"><span class="crumbs__current" id="crumb" aria-current="page">Страница</span></li>\n</ol>';
  const etalonBody = crumbs + '\n<h1 id="title">Заголовок</h1>\n<button class="btn" id="go" type="button">Обновить</button>\n'
    + '<button class="btn" type="button" data-modal="m1">Окно</button>\n<div class="modal-scrim" id="m1" hidden><div class="modal" role="dialog"><button class="btn" type="button" data-modal-close>Закрыть</button></div></div>';
  const clickGo = file('click-go.mjs', "export default async (page) => {\n  page.check(await page.changed(() => page.click('#go')), 'клик меняет страницу');\n};\n");
  file('data/ok.js', 'window.ST_DATA = { title: "Из данных" };\n');
  file('widgets/tiles/W/W.html', '<section class="tile" id="w"><h2 id="w-title">Виджет</h2></section>\n');
  file('data/broken.js', 'var x = undefinedThing.y;\nwindow.ST_BROKEN = [];\n');

  const cases = [
    { name: 'эталон молчит', expect: [],
      page: page('etalon', { head: '<script src="data/ok.js"></script>', body: etalonBody,
        after: '<script>\n  document.getElementById("go").addEventListener("click", function () {\n    document.getElementById("title").textContent = window.ST_DATA.title;\n    document.querySelector(".crumbs__current").textContent = window.ST_DATA.title;\n  });\n</script>' }),
      scenario: clickGo },
    /* ЖВ8 — следствие: обработчик упал, клик страницу не изменил */
    { name: 'Л185: поиск крошки по id после перестройки', expect: ['ЖВ1', 'ЖВ6', 'ЖВ8'],
      page: page('l185', { body: etalonBody,
        after: '<script>\n  document.getElementById("go").addEventListener("click", function () {\n    document.getElementById("crumb").textContent = "Новое";\n  });\n</script>' }),
      scenario: clickGo },
    { name: 'Л184: файл данных упал до присваивания', expect: ['ЖВ1', 'ЖВ3'],
      page: page('l184', { head: '<script src="data/broken.js"></script>', body: '<h1>Данные</h1>' }) },
    { name: 'Л93: разметка с хуком после загрузки без привязки', expect: ['ЖВ5'],
      page: page('l93', { body: '<div id="slot"></div>\n<div class="modal-scrim" id="m2" hidden><div class="modal" role="dialog"></div></div>',
        after: '<script>\n  setTimeout(function () {\n    document.getElementById("slot").innerHTML = \'<button class="btn" type="button" data-modal="m2">Окно</button>\';\n  }, 10);\n</script>' }) },
    { name: 'битый src', expect: ['ЖВ2'],
      page: page('src', { head: '<script src="data/none.js"></script>', body: '<h1>Битый src</h1>' }) },
    { name: 'console.error страницы', expect: ['ЖВ4'],
      page: page('console', { body: '<h1>Консоль</h1>', after: '<script>console.error("сбой страницы");</script>' }) },
    { name: 'проверка сценария не прошла', expect: ['ЖВ8'],
      page: page('check', { body: '<h1 id="t">Текст</h1>' }),
      scenario: file('check-fail.mjs', "export default async (page) => {\n  page.check(page.text('#t') === 'Другой', 'заголовок другой');\n};\n") },
    { name: 'подмена рантайма сценарием', expect: ['ЖВ9'],
      page: page('swap', { body: '<h1>Подмена</h1>' }),
      scenario: file('swap-ds.mjs', 'export default async (page) => {\n  page.window.DSModal.open = function () {};\n};\n') },
    /* Цепочка длинная намеренно: короткую успевают выполнить await самого
       разбора, и случай молчал бы и без контрольной точки микрозадач. */
    /* код проверяющего — не код страницы: ЖВ6 считает только страницу, виджет, данные */
    { name: 'сценарий сам ищет id, снятый рантаймом', expect: [],
      page: page('scen-id', { body: crumbs }),
      scenario: file('scen-id.mjs', "export default async (page) => {\n  page.check(!page.document.getElementById('crumb'), 'крошка перестроена рантаймом');\n};\n") },
    /* Ответ fetch приходит, пока разбор ждёт внешний скрипт (как с ds-static):
       скрипт после него уже видит вставленный виджет. */
    { name: 'ds-include: виджет вставлен к следующему внешнему скрипту', expect: [],
      page: page('include', { body: '<ds-include src="widgets/tiles/W/W.html" css="none"></ds-include>',
        after: '<script src="data/ok.js"></script>\n<script>document.getElementById("w-title").textContent = window.ST_DATA.title;</script>' }) },
    { name: 'Л232: промис скрипта до перестройки рантаймом', expect: [],
      page: page('l232', { body: crumbs, after: '<script>\n  (async function () {\n    for (var i = 0; i < 50; i++) await null;\n    document.getElementById("crumb").textContent = "Из промиса";\n  })();\n</script>' }) },
  ];
  let bad = 0;
  for (const c of cases) {
    opt.scenario = c.scenario || null;
    const loads = runPage(lk, c.page, { flows: false });
    const r = loads[0];
    if (r.envError) { bad++; say(`СБОЙ  ${c.name}: окружение упало — ${r.envError}`); continue; }
    const got = [...new Set((r.findings || []).filter((f) => f.level === 'FAIL').map((f) => f.code))].sort();
    const want = [...c.expect].sort();
    const ok = got.join() === want.join();
    if (!ok) bad++;
    say(`${ok ? 'OK   ' : 'СБОЙ '} ${c.name}: ожидалось ${want.join(', ') || 'тишина'}, получено ${got.join(', ') || 'тишина'}`);
    if (!ok) for (const f of r.findings || []) say('       ' + line(f));
  }
  /* ЖВ10: страница без сценария — замечание «только загрузка», со сценарием — нет. */
  {
    opt.scenario = null;
    const bare = runPage(lk, cases[0].page, { flows: false })[0];
    opt.scenario = clickGo;
    const withScen = runPage(lk, cases[0].page, { flows: false })[0];
    opt.scenario = null;
    const has = (r) => (r.findings || []).some((f) => f.code === 'ЖВ10' && f.level === 'WARN');
    const ok = has(bare) && bare.loadOnly && !has(withScen) && !withScen.loadOnly;
    if (!ok) bad++;
    say(`${ok ? 'OK   ' : 'СБОЙ '} ЖВ10: без сценария — «только загрузка», со сценарием — нет`);
  }
  /* пустой каталог зависимостей — код 2, а не тихий OK */
  const empty = mkdtempSync(path.join(base, 'page-run-nodeps-'));
  const r2 = spawnSync(process.execPath, [fileURLToPath(import.meta.url), cases[0].page, '--deps', empty], { encoding: 'utf8', cwd: ROOT, windowsHide: true });
  const depsOk = r2.status === 2 && /linkedom не найден/.test(r2.stdout || '');
  if (!depsOk) bad++;
  say(`${depsOk ? 'OK   ' : 'СБОЙ '} пустой --deps: ожидался код 2, получен ${r2.status}`);
  rmSync(empty, { recursive: true, force: true });
  rmSync(dir, { recursive: true, force: true });
  say(bad ? `ВЕРДИКТ: FAIL (${bad} из ${cases.length + 2} случаев)` : `ВЕРДИКТ: OK (${cases.length + 2} случаев)`);
  process.exit(bad ? 1 : 0);
}

/* ---------------- главное ---------------- */

if (opt.selftest) selftest();
if (opt.all) opt.pages = allPages();
if (!opt.pages.length) fail('не названа страница — см. --help');
for (const p of opt.pages) if (!existsSync(p) || !statSync(p).isFile()) fail('файл не найден: ' + p);
if (opt.html && !existsSync(opt.html)) fail('копия не найдена: ' + opt.html);
if (opt.scenario && !existsSync(opt.scenario)) fail('сценарий не найден: ' + opt.scenario);
for (const [s, f] of opt.swaps) if (!existsSync(f)) fail(`--swap ${s}: файл не найден — ${f}`);

const lk = linkedomOrExit();
const flows = opt.all ? opt.allFlows : opt.flows;
let fails = 0, warns = 0, invalid = false, envErrors = 0, clean = 0, loadOnly = 0;
const t0 = Date.now();
const raw = [];
let modelLine = null;
for (const page of opt.pages) {
  const loads = runPage(lk, page, { flows });
  if (opt.json) { raw.push({ page: P.rel(page), loads }); continue; }
  const m = loads.find((l) => l.model);
  if (m && !modelLine) { modelLine = `ОКРУЖЕНИЕ: linkedom ${m.linkedom} (${P.rel(lk.dir)}); ${m.model}`; say(modelLine); }
  const r = report(page, loads, { compact: opt.all });
  fails += r.fails; warns += r.warns; invalid = invalid || r.invalid;
  if (r.envErr) envErrors++;
  if (r.loadOnly) loadOnly++;
  if (!r.fails && !(r.warns - (r.loadOnly ? 1 : 0)) && !r.envErr) clean++;
}
if (opt.json) { say(JSON.stringify(raw, null, 1)); process.exit(0); }
if (opt.all) say(`СТРАНИЦ: ${opt.pages.length}, чистых ${clean}, падений окружения ${envErrors}, время ${sec(Date.now() - t0)}`);
say('НЕ ПРОВЕРЯЕТСЯ: ' + NOT_CHECKED);
if (envErrors) { say(`ОШИБКА: окружение упало на ${envErrors} загрузк. — прогон не выполнен, это дефект page-env, а не страницы`); process.exit(2); }
if (invalid) { say(`ВЕРДИКТ: FAIL — прогон не засчитывается (ЖВ9); блокеров ${fails}, замечаний ${warns}`); process.exit(1); }
/* Без сценария — не OK (ЖВ10): код выхода 0, дефекта нет, но и действий никто не проверял. */
if (!fails && loadOnly) { say(`ВЕРДИКТ: ТОЛЬКО ЗАГРУЗКА — сценария нет у страниц: ${loadOnly} из ${opt.pages.length}; блокеров 0, замечаний ${warns}`); process.exit(0); }
say(fails === 0 ? `ВЕРДИКТ: OK (замечаний: ${warns})` : `ВЕРДИКТ: FAIL (${fails} блокер, ${warns} замечание)`);
process.exit(fails ? 1 : 0);

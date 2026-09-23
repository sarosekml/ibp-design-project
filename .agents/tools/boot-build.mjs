#!/usr/bin/env node
/* ============================================================
   BOOT-BUILD — генератор загрузчика ДС: путь до ДС в одном месте.

   Зачем (решение владельца Р5, реструктуризация, шаг Ш8). До загрузчика путь
   до ДС был записан в каждом экране: корень для рантайма (`__DS_ROOT`),
   фавикон, `ds.css`, `ds.js`, а у главных — ещё каталог главной и фоновая
   иллюстрация. Переезд ДС означал массовую правку экранов (так прошли Ш6 и
   Ш7). Теперь значение живёт в одной строке `DS_PATH` файла конфигурации
   (`project.json → designSystem.from`, в проекте — `apps/ds-config.js`; с
   23.09.2026, до того — `designSystem.mount` и каталог `boot/`), а экран
   подключает ДС двумя тегами загрузчика, сгенерированного отсюда:

     <head>  <script src="…/ds-config.js"></script>   — первым в <head>
     <body>  <script src="…/ds-body.js"></script>     — вместо тега ds.js

   Строку DS_PATH правит человек, остальное — генератор. Манифест без
   `designSystem.from` (только `mount`) по-прежнему поддержан: тогда файлы
   генерируются целиком.

   Почему не `.env`: страницы открываются двойным кликом (`file://`), где нет
   ни процесса, ни `fetch`, — браузеру доступен только обычный `<script>`.

   Первый тег вычисляет ДС от собственного адреса
   (`document.currentScript.src` + DS_PATH), ставит `window.__DS_ROOT`, пишет фавикон и
   `ds.css` через `document.write` — то же место в разборе, что прежние теги,
   поэтому собственный `<style>` экрана по-прежнему идёт после ДС. Он же
   задаёт CSS-переменную `--boot-bg-illustration` — фон стартовой страницы
   (спека Illustrations: фон — через `background-image`, не через слот
   `.illu`); экран пишет `var(--boot-bg-illustration, none)`.
   ds-body.js пишет `ds.js`, а следом — дополнительные скрипты ДС из атрибута
   `data-ds` своего тега (пути внутри ДС через пробел, например
   `scripts/ibp-home.js`). Порядок тот же, что у прежних тегов: `ds.js`
   дописывает рантаймы прямо за собой, до следующего тега.
   Ограничение честное: загрузчик — обычный тег, без async/defer.

   Файлы генерируются, руками не правятся: `--check` сверяет их с тем, что
   сгенерировал бы манифест (шаг гейта `boot`). Коды БТ — «загрузчик»:
     БТ1 манифест не объявляет загрузчик или ДС (boot, designSystem.from |
         mount), либо строка DS_PATH не читается;
     БТ2 файла загрузчика нет;
     БТ3 файл загрузчика разошёлся с генератором — правлен руками или не
         пересобран после смены designSystem.mount;
     БТ4 по адресу ДС нет ds.css — адрес ведёт не в дизайн-систему.

   Использование:
     node boot-build.mjs             — сгенерировать загрузчик (boot.head, boot.body)
     node boot-build.mjs --check     — сверить, ничего не записывая
     node boot-build.mjs --selftest  — откат на временном дереве
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { project, need } from './project.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GEN = 'boot-build.mjs';

/** Тексты загрузчика для манифеста P: { [путь от корня]: текст }. */
export function render(P) {
  /* Адрес ДС в файле — от каталога загрузчика: файл переносим вместе с
     каталогом, а экраны ссылаются только на сам загрузчик. */
  const dsPath = (path.posix.relative(P.boot.dir, P.ds.replace(/\/+$/, '')) || '.') + '/';
  const headRel = P.boot.head;
  const headName = headRel.slice(P.boot.dir.length + 1);
  const fromConfig = P.dsFrom === headRel;
  const note = fromConfig
    ? '/* Адрес дизайн-системы — строка DS_PATH ниже, и только она: путь от папки\n'
      + '   этого файла. Перенос ДС = правка одной строки.\n'
      + '   Остальное сгенерировано ' + GEN + ' — руками не править; после правки\n'
      + '   адреса сверить: node ' + P.tools + '/' + GEN + ' --check (гейт, шаг boot). */\n'
    : '/* СГЕНЕРИРОВАН ' + GEN + ' из project.json → designSystem.mount. Руками не править:\n'
      + '   пересобрать — node ' + P.tools + '/' + GEN + ' (гейт сверяет, шаг boot). */\n';
  const bodyNote = '/* СГЕНЕРИРОВАН ' + GEN + '. Руками не править; адрес ДС — в ' + headName + '. */\n';
  const head = note
    + 'var DS_PATH = ' + JSON.stringify(dsPath) + ';\n'
    + '\n'
    + '/* Первый тег <head> экрана, обычный (без async/defer): ДС — DS_PATH от\n'
    + '   собственного адреса этого файла. */\n'
    + '(function () {\n'
    + '  var me = document.currentScript;\n'
    + '  if (!me || !me.src) { console.error(' + JSON.stringify(headRel + ' подключён не обычным тегом — ДС не загрузится') + '); return; }\n'
    + '  var DS = new URL(DS_PATH, me.src).href;\n'
    + '  window.__DS_ROOT = DS;\n'
    + '  document.documentElement.style.setProperty(\'--boot-bg-illustration\', \'url("\' + DS + \'assets/illustrations/background-illustration.svg")\');\n'
    + '  document.write(\'<link rel="icon" type="image/svg+xml" href="\' + DS + \'assets/logo.svg">\');\n'
    + '  document.write(\'<link rel="stylesheet" href="\' + DS + \'ds.css">\');\n'
    + '})();\n';
  const body = bodyNote
    + '/* Тег вместо ds.js, перед экранным скриптом. Дополнительные скрипты ДС —\n'
    + '   атрибутом data-ds, пути внутри ДС через пробел: data-ds="scripts/ibp-home.js". */\n'
    + '(function () {\n'
    + '  var DS = window.__DS_ROOT;\n'
    + '  if (!DS) { console.error(' + JSON.stringify(headName + ' не подключён в <head> — ДС не загрузится') + '); return; }\n'
    + '  var me = document.currentScript;\n'
    + '  var extra = ((me && me.getAttribute(\'data-ds\')) || \'\').split(/\\s+/).filter(Boolean);\n'
    + '  var tags = [\'scripts/ds.js\'].concat(extra);\n'
    + '  for (var i = 0; i < tags.length; i++) document.write(\'<scr\' + \'ipt src="\' + DS + tags[i] + \'"><\\/scr\' + \'ipt>\');\n'
    + '})();\n';
  return { [P.boot.head]: head, [P.boot.body]: body };
}

export function check(P, write = false) {
  const defects = [];
  if (P.dsError) {
    defects.push('БТ1 адрес ДС не читается: ' + P.dsError);
    return { defects, written: [] };
  }
  if (!P.boot || !P.boot.dir || !P.boot.head || !P.boot.body || !P.ds) {
    defects.push('БТ1 project.json не объявляет загрузчик (boot: dir, head, body) или ДС (designSystem.from | mount)');
    return { defects, written: [] };
  }
  if (!existsSync(path.join(P.root, P.ds, 'ds.css'))) defects.push('БТ4 по адресу ДС «' + P.ds + '/» нет ds.css — адрес ведёт не в дизайн-систему');
  const files = render(P);
  const written = [];
  /* Строку адреса правит человек (кавычки, пробелы — его дело): её значение
     уже прочитано в P.ds, сверяется всё остальное. */
  const same = (t) => (P.dsFrom ? t.replace(/^var DS_PATH\b.*$/m, 'var DS_PATH') : t);
  for (const [rel, text] of Object.entries(files)) {
    const abs = path.join(P.root, rel);
    if (write) {
      mkdirSync(path.dirname(abs), { recursive: true });
      if (!existsSync(abs) || readFileSync(abs, 'utf8') !== text) { writeFileSync(abs, text, 'utf8'); written.push(rel); }
      continue;
    }
    if (!existsSync(abs)) defects.push('БТ2 ' + rel + ' нет — сгенерировать: node ' + P.tools + '/' + GEN);
    else if (same(readFileSync(abs, 'utf8')) !== same(text)) defects.push('БТ3 ' + rel + ' разошёлся с генератором (ДС — «' + P.ds + '») — правлен руками или не пересобран: node ' + P.tools + '/' + GEN);
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
  boot: { dir: 'boot', head: 'boot/ds-head.js', body: 'boot/ds-body.js' },
  hub: { page: 'index.html', registry: 'hub.js' }, tracks: [],
};

const CASES = [
  { name: 'сгенерировано — диффа нет', expect: null, build: true },
  { name: 'загрузчик не сгенерирован', expect: 'БТ2 boot/ds-head.js нет' },
  { name: 'файл правлен руками', expect: 'БТ3 boot/ds-body.js разошёлся', build: true,
    mutate: (r) => put(r, 'boot/ds-body.js', readFileSync(path.join(r, 'boot/ds-body.js'), 'utf8') + '// ручная правка\n') },
  { name: 'ДС переехала, загрузчик не пересобран', expect: 'БТ3 boot/ds-head.js разошёлся с генератором (ДС — «kit-ds»)', build: true,
    mutate: (r) => put(r, 'project.json', JSON.stringify({ ...MANIFEST, designSystem: { mount: 'kit-ds' } })) },
  { name: 'ДС переехала и загрузчик пересобран', expect: null, build: true,
    mutate: (r) => { put(r, 'project.json', JSON.stringify({ ...MANIFEST, designSystem: { mount: 'kit-ds' } })); check(project(r), true); } },
  { name: 'загрузчик не объявлен', expect: 'БТ1',
    mutate: (r) => { const { boot, ...rest } = MANIFEST; put(r, 'project.json', JSON.stringify(rest)); } },
  { name: 'адрес в файле конфигурации — диффа нет', expect: null,
    mutate: (r) => { useConfig(r); check(project(r), true); } },
  { name: 'ДС переехала: правка одной строки DS_PATH', expect: null,
    mutate: (r) => { useConfig(r); check(project(r), true); editPath(r, '../kit-ds/'); } },
  { name: 'DS_PATH ведёт не в ДС', expect: 'БТ4 по адресу ДС «nowhere/»',
    mutate: (r) => { useConfig(r); check(project(r), true); mkdirSync(path.join(r, 'nowhere')); editPath(r, '../nowhere/'); } },
  { name: 'в файле конфигурации нет DS_PATH', expect: 'БТ1 адрес ДС не читается',
    mutate: (r) => { useConfig(r); put(r, 'apps/ds-config.js', '// пусто\n'); } },
  { name: 'логика загрузчика правлена руками', expect: 'БТ3 apps/ds-config.js разошёлся',
    mutate: (r) => { useConfig(r); check(project(r), true); put(r, 'apps/ds-config.js', readFileSync(path.join(r, 'apps/ds-config.js'), 'utf8') + '// ручная правка\n'); } },
];

/* Форма проекта: адрес ДС — в первом теге загрузчика в корне apps/. */
const CONFIG = { ...MANIFEST, designSystem: { from: 'apps/ds-config.js' },
  boot: { dir: 'apps', head: 'apps/ds-config.js', body: 'apps/ds-body.js' } };
/* Первый запуск: файл с одной строкой адреса, остальное допишет генератор. */
function useConfig(r) {
  put(r, 'project.json', JSON.stringify(CONFIG));
  put(r, 'apps/ds-config.js', 'var DS_PATH = "../ds/";\n');
}
function editPath(r, to) {
  const f = path.join(r, 'apps/ds-config.js');
  writeFileSync(f, readFileSync(f, 'utf8').replace(/DS_PATH = "[^"]*"/, 'DS_PATH = "' + to + '"'), 'utf8');
}

function selftest() {
  const out = ['== boot-build --selftest =='];
  let failed = 0;
  for (const c of CASES) {
    const root = mkdtempSync(path.join(os.tmpdir(), 'boot-build-'));
    try {
      put(root, 'project.json', JSON.stringify(MANIFEST));
      put(root, 'ds/ds.css', '');
      put(root, 'kit-ds/ds.css', '');
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
  /* Загрузчик переносит корень ДС туда, куда указывает манифест: первый тег
     несёт путь до ДС от своего каталога, второй пути не знает. */
  const P = { ds: 'kit-ds', tools: '.kit/tools', root: '/', boot: MANIFEST.boot };
  const head = render(P)['boot/ds-head.js'];
  const pass = head.includes('"../kit-ds/"') && !render(P)['boot/ds-body.js'].includes('kit-ds');
  if (!pass) failed++;
  out.push((pass ? 'ok    ' : 'FAIL  ') + 'путь до ДС — только в ds-head.js');
  /* Сгенерированный код разбирается как JS. --check сравнивает файл с выводом
     генератора и испорченный самим генератором файл признал бы верным —
     правильность генерата доказывается исполнением, а не сравнением (урок Л128). */
  let parsed = 0;
  for (const [rel, text] of Object.entries(render({ ...P, ds: 'kit-ds/it\'s' }))) {
    try { new Function(text); parsed++; } catch (e) { out.push('FAIL  ' + rel + ' не разбирается как JS: ' + e.message); }
  }
  if (parsed !== 2) failed++;
  else out.push('ok    сгенерированный загрузчик разбирается как JS (и с кавычкой в пути до ДС)');
  out.push('ВЕРДИКТ: ' + (failed ? 'FAIL (кейсов не прошло: ' + failed + ' из ' + (CASES.length + 2) + ')' : 'OK (кейсов: ' + (CASES.length + 2) + ')'));
  console.log(out.join('\n'));
  process.exit(failed ? 1 : 0);
}

/* ---------------- main ---------------- */

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();
  const P = need('boot-build', HERE);
  const write = !args.includes('--check');
  const res = check(P, write);
  console.log(report(write ? 'boot-build' : 'boot-build --check', res));
  process.exit(res.defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

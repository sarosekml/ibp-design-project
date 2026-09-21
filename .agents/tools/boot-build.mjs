#!/usr/bin/env node
/* ============================================================
   BOOT-BUILD — генератор загрузчика ДС: путь до ДС в одном месте.

   Зачем (решение владельца Р5, реструктуризация, шаг Ш8). До загрузчика путь
   до ДС был записан в каждом экране: корень для рантайма (`__DS_ROOT`),
   фавикон, `ds.css`, `ds.js`, а у главных — ещё каталог главной и фоновая
   иллюстрация. Переезд ДС означал массовую правку экранов (так прошли Ш6 и
   Ш7). Теперь значение живёт в `project.json → designSystem.mount`, а экран
   подключает ДС двумя тегами загрузчика, сгенерированного отсюда:

     <head>  <script src="…/boot/ds-head.js"></script>   — первым в <head>
     <body>  <script src="…/boot/ds-body.js"></script>   — вместо тега ds.js

   Почему не `.env`: страницы открываются двойным кликом (`file://`), где нет
   ни процесса, ни `fetch`, — браузеру доступен только обычный `<script>`.

   ds-head.js вычисляет корень проекта от собственного адреса
   (`document.currentScript.src`), ставит `window.__DS_ROOT`, пишет фавикон и
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
     БТ1 манифест не объявляет загрузчик или ДС (boot, designSystem.mount);
     БТ2 файла загрузчика нет;
     БТ3 файл загрузчика разошёлся с манифестом — правлен руками или не
         пересобран после смены designSystem.mount.

   Использование:
     node boot-build.mjs             — сгенерировать boot/ds-head.js, boot/ds-body.js
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

const escRx = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Тексты загрузчика для манифеста P: { [путь от корня]: текст }. */
export function render(P) {
  const ds = P.ds.replace(/\/+$/, '') + '/';
  const headRel = P.boot.head;
  const headName = headRel.slice(P.boot.dir.length + 1);
  const bodyName = P.boot.body.slice(P.boot.dir.length + 1);
  const selfRx = escRx(P.boot.dir + '/' + headName);
  const note = '/* СГЕНЕРИРОВАН ' + GEN + ' из project.json → designSystem.mount. Руками не править:\n'
    + '   пересобрать — node ' + P.tools + '/' + GEN + ' (гейт сверяет, шаг boot). */\n';
  const head = note
    + '/* Первый тег <head> экрана, обычный (без async/defer): корень проекта — от\n'
    + '   собственного адреса, ДС — ' + JSON.stringify(ds) + ' от него. */\n'
    + '(function () {\n'
    + '  var me = document.currentScript;\n'
    + '  if (!me || !me.src) { console.error(' + JSON.stringify(headRel + ' подключён не обычным тегом — ДС не загрузится') + '); return; }\n'
    + '  var root = me.src.replace(/' + selfRx.replace(/\//g, '\\/') + '(?:[?#].*)?$/, \'\');\n'
    + '  var DS = root + ' + JSON.stringify(ds) + ';\n'
    + '  window.__DS_ROOT = DS;\n'
    + '  document.documentElement.style.setProperty(\'--boot-bg-illustration\', \'url("\' + DS + \'assets/illustrations/background-illustration.svg")\');\n'
    + '  document.write(\'<link rel="icon" type="image/svg+xml" href="\' + DS + \'assets/logo.svg">\');\n'
    + '  document.write(\'<link rel="stylesheet" href="\' + DS + \'ds.css">\');\n'
    + '})();\n';
  const body = note
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
  void bodyName;
  return { [P.boot.head]: head, [P.boot.body]: body };
}

export function check(P, write = false) {
  const defects = [];
  if (!P.boot || !P.boot.dir || !P.boot.head || !P.boot.body || !P.ds) {
    defects.push('БТ1 project.json не объявляет загрузчик (boot: dir, head, body) или ДС (designSystem.mount)');
    return { defects, written: [] };
  }
  const files = render(P);
  const written = [];
  for (const [rel, text] of Object.entries(files)) {
    const abs = path.join(P.root, rel);
    if (write) {
      mkdirSync(path.dirname(abs), { recursive: true });
      if (!existsSync(abs) || readFileSync(abs, 'utf8') !== text) { writeFileSync(abs, text, 'utf8'); written.push(rel); }
      continue;
    }
    if (!existsSync(abs)) defects.push('БТ2 ' + rel + ' нет — сгенерировать: node ' + P.tools + '/' + GEN);
    else if (readFileSync(abs, 'utf8') !== text) defects.push('БТ3 ' + rel + ' разошёлся с манифестом (designSystem.mount = «' + P.ds + '») — правлен руками или не пересобран: node ' + P.tools + '/' + GEN);
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
  { name: 'ДС переехала, загрузчик не пересобран', expect: 'БТ3 boot/ds-head.js разошёлся с манифестом (designSystem.mount = «kit-ds»)', build: true,
    mutate: (r) => put(r, 'project.json', JSON.stringify({ ...MANIFEST, designSystem: { mount: 'kit-ds' } })) },
  { name: 'ДС переехала и загрузчик пересобран', expect: null, build: true,
    mutate: (r) => { put(r, 'project.json', JSON.stringify({ ...MANIFEST, designSystem: { mount: 'kit-ds' } })); check(project(r), true); } },
  { name: 'загрузчик не объявлен', expect: 'БТ1',
    mutate: (r) => { const { boot, ...rest } = MANIFEST; put(r, 'project.json', JSON.stringify(rest)); } },
];

function selftest() {
  const out = ['== boot-build --selftest =='];
  let failed = 0;
  for (const c of CASES) {
    const root = mkdtempSync(path.join(os.tmpdir(), 'boot-build-'));
    try {
      put(root, 'project.json', JSON.stringify(MANIFEST));
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
  /* Загрузчик переносит корень ДС туда, куда указывает манифест: текст
     ds-head.js несёт ровно значение mount и больше нигде путь не записан. */
  const P = { ds: 'kit-ds', tools: '.kit/tools', root: '/', boot: MANIFEST.boot };
  const head = render(P)['boot/ds-head.js'];
  const pass = head.includes('"kit-ds/"') && !render(P)['boot/ds-body.js'].includes('kit-ds');
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

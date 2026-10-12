#!/usr/bin/env node
/* ============================================================
   SCREEN-MAP — карта экранов проекта: map.yaml → map-data.js и проверки.

   Зачем (задача RE0015, решения человека 11.10.2026): открыть любую
   страницу проекта быстрее, чем через весь пользовательский сценарий.
   Глубокие экраны зависят от адреса (`Tranche.preview.html?id=&tr=`): без
   цепочки «хаб → Главная → … → Транш» до них не дойти. Карта — майндмап
   страниц модулей проекта от его главной (одна точка входа), связи «откуда
   куда»; страница открывается в состоянии по умолчанию, с демо-данными.
   Состояния (окна, статусы, варианты по параметрам) — опционально, под
   переключателем. Концептов на карте нет — только модули раздела.

   Источник — `<screenMap.dir>/<раздел>/map.yaml` (project.json → screenMap),
   пишется руками и сборкой не переписывается: комментарии внутри допустимы.
   Узел описывается языком сценариев панели прототипа (`page`, `do`): YAML и
   действия разбирает ядро панели (`core.js`: parseYaml, schemaReader,
   makeAction), страницы и селекторы проверяет её оснастка (proto-panel.mjs:
   pageProblem, selectorMisses) — второго разбора нет. Генерат `map-data.js`
   лежит рядом: обычный `<script>` (по file:// fetch не работает), его читают
   страница карты и инструмент «Карта» панели прототипа.

   Формат map.yaml (version 1):
     version: 1
     section: postrade            раздел apps/<раздел>/ — совпадает с папкой карты
     title: Карта экранов Post    заголовок карты
     desc: …                      необязательно, одна строка
     nodes:                       экраны; порядок узлов — порядок на схеме
       - id: deal                 латиница, цифры, дефис; уникален в карте
         app: deals-app           модуль раздела: id из app.json или путь от
                                  раздела; концепт (drafts/) — нельзя
         title: Сделка
         page: Deal.preview.html?id=1024   файл в pages/ приложения, можно с
                                  ?параметрами; модульная страница — собранная
         parent: portfolio        откуда приходят: id узла, можно другого модуля;
                                  без parent — ровно один узел: главная проекта
         note: …                  необязательно: пояснение для показа
         states:                  ключевые состояния экрана, по порядку
           - id: tranche-new      своё состояние: id уникален в узле
             title: Новый транш
             page: …              необязательно: тот же экран с другими параметрами
             note: …
             issues:              пометки, как у Fix State (fragile, …): заметка, не дефект
               - fragile
             do:                  действия сценариев панели: click, fill, waitFor …
               - click: '#btn'
               - waitFor: '#modal.is-open'
           - flow: statuses-financier   ссылка на сценарий proto-panel/flows.yaml
             steps:               необязательно: только эти шаги (id), иначе все
               - st-formed
   У своего состояния нужен page с другими параметрами или do — иначе оно не
   отличается от узла. Шаг сценария — состояние того же экрана: его точка
   входа открывается на странице узла.

   Что делает:
   - собирает map.yaml каждой объявленной карты в map-data.js:
     `window.ScreenMaps[<раздел>]` — приложения карты, узлы и состояния с
     готовыми адресами от каталога приложений (apps/): экран —
     `<приложение>/pages/<page>`, своё состояние с действиями —
     `…#ppmap=<узел>/<состояние>` (действия проигрывает панель прототипа),
     только с параметрами — адрес страницы, шаг сценария — `…#pp=NN`, как
     адрес состояния в панели;
   - проверяет карту и её покрытие: каждый экран модулей раздела
     (`pages/*.html`; собранная `.preview.html` — тот же экран) стоит на
     карте — новый экран без узла называется по имени. Шага в гейте нет
     (решение 11.10.2026): проверка — запуском генератора.

   Коды КЭ — «карта экранов»:
     КЭ1 манифест и состав: блок screenMap не по форме (dir; maps — записи
         id, section, title, desc, icon, раздел и id не повторяются; after —
         под какой записью хаба пункт карты, сверяет hub-build);
         объявленной карты нет на диске; карта на диске не объявлена (её нет
         на хабе); нет панели прототипа или её ядро не загружается;
     КЭ2 map.yaml не разбирается (синтаксис вне подмножества YAML панели) или
         не по схеме: поля и типы, id, неизвестное поле, действия do; section
         не совпадает с папкой или раздела нет; состояние без page и do;
     КЭ3 экран: приложения нет в разделе или это концепт; страницы нет в
         pages/; путь с «/», «..» или «#»; источник модульной страницы вместо
         собранной .preview.html; страница своего состояния — другой экран,
         чем у узла;
     КЭ4 связи: точка входа не одна (узлов без parent — ноль или несколько);
         parent не найден, ведёт на сам узел или замыкает круг; flow — у
         приложения нет сценариев панели, flows.yaml не разбирается, нет
         сценария или шага, шаг открывается на другом экране;
     КЭ5 селектор действия состояния не разбирается или его имена не найдены
         в странице и её скриптах (как ПН5 панели);
     КЭ6 покрытие: экрана модуля нет на карте;
     КЭ7 генерата map-data.js нет, он разошёлся с map.yaml, записями
         приложений и сценариями панели, или лежит без map.yaml;
     КЭ8 параметр адреса: ключа или демо-значения нет ни в странице, ни в её
         скриптах и данных — запись данных удалили или опечатка.
   Пометки своих состояний (issues) печатаются заметками — вердикт не меняют.
   Нет screenMap в манифесте — карт в проекте нет: строка и OK.

   Использование:
     node screen-map.mjs             — собрать map-data.js всех карт и проверить
     node screen-map.mjs --check     — сверить, ничего не записывая
     node screen-map.mjs --selftest  — откат на временном дереве (--self-test — то же)
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1; без манифеста — 2.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync, rmSync, mkdtempSync, cpSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { project, need } from './project.mjs';
import { loadCore, pageFile, pageProblem, pageCorpus, classText, hasToken, dsCorpus, selectorMisses, selectorDefects, ISSUE_NOTE } from './proto-panel.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SELF = path.resolve(fileURLToPath(import.meta.url));
const GEN = 'screen-map.mjs';
const SRC = 'map.yaml';
const OUT = 'map-data.js';
const HEAD_MARK = '/* СГЕНЕРИРОВАН ' + GEN;
/** Поля записи карты в манифесте (screenMap.maps) — те же, что у записи витрины на хабе. */
const MAP_FIELDS = ['id', 'section', 'title', 'desc', 'icon'];
const SECTION_RX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const isDir = (abs) => { try { return statSync(abs).isDirectory(); } catch { return false; } };
const isFile = (abs) => { try { return statSync(abs).isFile(); } catch { return false; } };
const text1 = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);
/* Текст с диска без BOM и с LF: сверка генерата не зависит от концов строк (как у kit-build). */
const read = (f) => {
  const t = readFileSync(f, 'utf8');
  return (t.charCodeAt(0) === 0xFEFF ? t.slice(1) : t).replace(/\r\n/g, '\n');
};
const dirsIn = (abs) => {
  try { return readdirSync(abs, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith('.')).map((e) => e.name).sort(); } catch { return []; }
};

/* ---------------- манифест и состав ---------------- */

/** Блок screenMap манифеста: { cfg: { dir, dirAbs, maps } | null, defects } — КЭ1 о форме блока. */
export function config(P) {
  const raw = P.manifest ? P.manifest.screenMap : undefined;
  if (raw === undefined) return { cfg: null, defects: [] };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !P.screenMap) {
    return { cfg: null, defects: ['КЭ1 project.json → screenMap — объект: dir (каталог карт от корня) и maps (записи хаба { ' + MAP_FIELDS.join(', ') + ' })'] };
  }
  const defects = [], maps = [];
  if (!Array.isArray(raw.maps)) defects.push('КЭ1 project.json → screenMap.maps — список записей { ' + MAP_FIELDS.join(', ') + ' }: по записи на раздел');
  else raw.maps.forEach((m, i) => {
    const name = 'project.json → screenMap.maps[' + i + ']';
    if (!m || typeof m !== 'object' || Array.isArray(m)) { defects.push('КЭ1 ' + name + ' — не объект'); return; }
    const miss = MAP_FIELDS.filter((f) => !text1(m[f]));
    if (miss.length) { defects.push('КЭ1 ' + name + ' — нет полей: ' + miss.join(', ')); return; }
    if (!SECTION_RX.test(m.section)) { defects.push('КЭ1 ' + name + ' — section «' + m.section + '»: имя папки раздела в ' + P.appsDir + '/, латиница и дефис'); return; }
    if (maps.some((x) => x.section === m.section)) { defects.push('КЭ1 ' + name + ' — раздел «' + m.section + '» повторяется'); return; }
    if (maps.some((x) => x.id === m.id)) { defects.push('КЭ1 ' + name + ' — id «' + m.id + '» повторяется'); return; }
    maps.push(m);
  });
  return { cfg: { dir: P.screenMap.dir, dirAbs: P.screenMap.dirAbs, maps }, defects };
}

/** Объявленные карты, которые есть на диске: [{ section, entry, abs }]; КЭ1 — о расхождении манифеста и диска. */
function mapsOf(cfg, defects) {
  const list = [];
  for (const m of cfg.maps) {
    const abs = path.join(cfg.dirAbs, m.section);
    if (!isFile(path.join(abs, SRC))) { defects.push('КЭ1 ' + cfg.dir + '/' + m.section + '/' + SRC + ' — карты раздела «' + m.section + '» нет на диске, а project.json → screenMap.maps её объявляет'); continue; }
    list.push({ section: m.section, entry: m, abs });
  }
  for (const name of dirsIn(cfg.dirAbs)) {
    if (isFile(path.join(cfg.dirAbs, name, SRC)) && !cfg.maps.some((m) => m.section === name)) {
      defects.push('КЭ1 ' + cfg.dir + '/' + name + '/' + SRC + ' — карта не объявлена в project.json → screenMap.maps: её нет на хабе (запись { ' + MAP_FIELDS.join(', ') + ' })');
    }
  }
  return list;
}

/** Приложения раздела: [{ id, dir — от apps/, sub — от раздела, abs, title, track, kind: module | concept, panel }]. */
export function sectionApps(P, section) {
  const drafts = P.places ? P.places.drafts : 'drafts';
  const out = [];
  for (const a of P.apps()) {
    if (!a.dir.startsWith(section + '/')) continue;
    let j = {};
    try { j = JSON.parse(read(path.join(a.abs, P.appsManifest))); } catch { /* запись не читается — скажет сторож хаба */ }
    const sub = a.dir.slice(section.length + 1);
    const id = text1(j.id) || path.posix.basename(a.dir);
    out.push({
      id, dir: a.dir, sub, abs: a.abs, title: text1(j.title) || id, track: text1(j.track),
      kind: sub.startsWith(drafts + '/') ? 'concept' : 'module',
      panel: !!P.panel && isDir(path.join(a.abs, P.panel.dir)),
    });
  }
  return out;
}

/* ---------------- map.yaml: разбор и схема ---------------- */

/**
 * map.yaml → { map, errors: [{ code: КЭ2, line, text }] }. Синтаксис — parseYaml
 * ядра панели, поля и действия — его читатель схемы (schemaReader): тот же
 * язык и те же сообщения, что у flows.yaml. При ошибках map — null.
 */
export function readMap(core, src) {
  const errors = [];
  const parsed = core.parseYaml(src);
  if (parsed.error) return { map: null, errors: [{ code: 'КЭ2', line: parsed.error.line, text: parsed.error.text }] };
  const R = core.schemaReader(errors, 'КЭ2');
  const root = parsed.node;
  if (!root || root.kind !== 'map') { R.err(root, 'в корне файла ожидается словарь с ключами version, section, title и nodes'); return { map: null, errors }; }
  const top = R.fields(root, ['version', 'section', 'title', 'desc', 'nodes'], 'корень файла');
  if (!top.version) R.err(root, 'нет version: 1 — версии формата');
  else if (top.version.value.kind !== 'scalar' || top.version.value.value !== 1) R.err(top.version.value, 'version — 1: другой версии формата нет', top.version.line);
  const section = top.section ? R.str(top.section, 'section', true, true) : null;
  if (!top.section) R.err(root, 'нет section — раздела (папки в каталоге приложений), чьи экраны на карте');
  else if (section !== null && !SECTION_RX.test(section)) R.err(top.section.value, 'section — имя папки раздела: латиница в нижнем регистре, цифры и дефис (postrade)', top.section.line);
  const title = top.title ? R.str(top.title, 'title', true, true) : null;
  if (!top.title) R.err(root, 'нет title — заголовка карты');
  const desc = top.desc ? R.str(top.desc, 'desc', false, true) : null;
  const map = { section, title, desc, nodes: [], line: top.section ? top.section.line : 1 };
  if (!top.nodes) R.err(root, 'нет nodes — списка экранов');
  else if (top.nodes.value.kind !== 'seq') R.err(top.nodes.value, 'nodes — список экранов', top.nodes.line);
  else {
    const ids = Object.create(null);
    top.nodes.value.items.forEach((nn, ni) => {
      const node = readNode(core, R, nn, ni, ids);
      if (node) map.nodes.push(node);
    });
  }
  errors.sort((a, b) => a.line - b.line);
  return { map: errors.length ? null : map, errors };
}

function idOk(core, R, entry, where, seen, example, scope) {
  const v = R.str(entry, where + ', id', true, true);
  if (v === null) return null;
  if (!core.ID_RX.test(v)) { R.err(entry.value, where + ': id — латиница в нижнем регистре, цифры и дефис (' + example + ')', entry.line); return null; }
  if (seen[v]) { R.err(entry.value, where + ': id повторяется' + scope + ' (впервые — строка ' + seen[v] + ')', entry.line); return null; }
  seen[v] = entry.line;
  return v;
}

const noteOf = (v) => (v === null ? null : v.replace(/\s+$/, ''));

function readNode(core, R, nn, ni, ids) {
  if (nn.kind !== 'map') { R.err(nn, 'узел ' + (ni + 1) + ' — словарь с полями id, app, title, page'); return null; }
  const where = R.named(nn, 'узел', ni + 1);
  const f = R.fields(nn, ['id', 'app', 'title', 'page', 'parent', 'note', 'states'], where);
  if (!f.id) R.err(nn, where + ': нет id');
  const id = f.id ? idOk(core, R, f.id, where, ids, 'deal, fv-calc', ' в карте') : null;
  const req = (k, what) => {
    if (!f[k]) { R.err(nn, where + ': нет ' + k + ' — ' + what); return null; }
    return R.str(f[k], where + ', ' + k, true, true);
  };
  const app = req('app', 'приложение раздела: id из app.json или путь от раздела');
  const title = req('title', 'название экрана');
  const page = req('page', 'файл в pages/ приложения, можно с ?параметрами');
  const parent = f.parent ? R.str(f.parent, where + ', parent', true, true) : null;
  const note = f.note ? noteOf(R.str(f.note, where + ', note', false, false)) : null;
  const line = (k) => (f[k] ? f[k].line : nn.line);
  const node = { id, app, title, page, parent, note, states: [], line: nn.line, at: { app: line('app'), page: line('page'), parent: line('parent') } };
  if (f.states) readStates(core, R, f.states, where, node);
  return node;
}

function readStates(core, R, entry, where, node) {
  const sv = entry.value;
  if (sv.kind === 'scalar' && sv.value === null) return;   // states: без значения — состояний нет
  if (sv.kind !== 'seq') { R.err(sv, where + ': states — список состояний', entry.line); return; }
  const ids = Object.create(null), flows = Object.create(null);
  sv.items.forEach((sn, si) => {
    if (sn.kind !== 'map') { R.err(sn, where + ', состояние ' + (si + 1) + ' — словарь: своё (id, title, page, do) или ссылка на сценарий (flow)'); return; }
    if (sn.entries.some((e) => e.key === 'flow')) { readFlowRef(core, R, sn, where + ', состояние ' + (si + 1), node, flows); return; }
    const sw = R.named(sn, where + ', состояние', si + 1);
    const f = R.fields(sn, ['id', 'title', 'page', 'note', 'issues', 'do'], sw);
    if (!f.id) R.err(sn, sw + ': нет id');
    const id = f.id ? idOk(core, R, f.id, sw, ids, 'tranche-new', ' в узле') : null;
    if (!f.title) R.err(sn, sw + ': нет title');
    const title = f.title ? R.str(f.title, sw + ', title', true, true) : null;
    const page = f.page ? R.str(f.page, sw + ', page', true, true) : null;
    const note = f.note ? noteOf(R.str(f.note, sw + ', note', false, false)) : null;
    const issues = [];
    if (f.issues) {
      const iv = f.issues.value;
      if (iv.kind === 'seq') {
        iv.items.forEach((it) => {
          if (it.kind !== 'scalar' || core.ISSUES.indexOf(it.value) < 0) R.err(it, sw + ': issues — пометка «' + (it.kind === 'scalar' ? it.value : R.kindName(it)) + '», известны: ' + core.ISSUES.join(', '), it.line);
          else if (issues.indexOf(it.value) < 0) issues.push(it.value);
        });
      } else if (!(iv.kind === 'scalar' && iv.value === null)) R.err(iv, sw + ': issues — список пометок', f.issues.line);
    }
    const acts = [], lines = [];
    if (f.do) {
      const dn = f.do.value;
      if (dn.kind === 'seq') {
        dn.items.forEach((an, ai) => {
          const a = R.action(an, sw + ', действие ' + (ai + 1));
          if (a) { acts.push(a); lines.push(an.line); }
        });
      } else if (!(dn.kind === 'scalar' && dn.value === null)) R.err(dn, sw + ': do — список действий', f.do.line);
    }
    const hasDo = !!f.do && f.do.value.kind === 'seq' && f.do.value.items.length > 0;
    if (!f.page && !hasDo) R.err(sn, sw + ': состояние ничего не меняет — нужен page с другими параметрами или do с действиями');
    node.states.push({ kind: 'do', id, title, page, note, issues, do: acts, line: sn.line, at: { page: f.page ? f.page.line : sn.line, actions: lines } });
  });
}

function readFlowRef(core, R, sn, sw, node, seen) {
  const f = R.fields(sn, ['flow', 'steps'], sw);
  const flow = R.str(f.flow, sw + ', flow', true, true);
  if (flow !== null && !core.ID_RX.test(flow)) R.err(f.flow.value, sw + ': flow — id сценария из flows.yaml панели приложения', f.flow.line);
  else if (flow !== null && seen[flow]) R.err(f.flow.value, sw + ': сценарий «' + flow + '» уже подключён в узле (строка ' + seen[flow] + ')', f.flow.line);
  else if (flow !== null) seen[flow] = f.flow.line;
  let steps = null;
  if (f.steps) {
    const v = f.steps.value;
    if (v.kind !== 'seq' || !v.items.length) R.err(v, sw + ': steps — непустой список id шагов сценария', f.steps.line);
    else {
      steps = [];
      v.items.forEach((it) => {
        const s = it.kind === 'scalar' && (typeof it.value === 'string' || typeof it.value === 'number') ? String(it.value) : null;
        if (s === null || !core.ID_RX.test(s)) R.err(it, sw + ': steps — id шага сценария (латиница, цифры, дефис)', it.line);
        else steps.push({ id: s, line: it.line });
      });
    }
  }
  node.states.push({ kind: 'flow', flow, steps, line: sn.line, at: { flow: f.flow ? f.flow.line : sn.line } });
}

/* ---------------- проверка карты и данные ---------------- */

/** Ключ экрана: собранная страница — тот же экран, что её источник. */
const screenKey = (f) => f.replace(/\.preview\.html$/i, '.html');
const encPath = (rel) => rel.split('/').map(encodeURIComponent).join('/');
/** Страница — адресом: имя файла кодируется, ?параметры — как написаны. */
function encPage(page) {
  const s = String(page);
  const i = s.search(/[?#]/);
  return encodeURIComponent(pageFile(s)) + (i >= 0 ? s.slice(i) : '');
}
const hashProblem = (page) => (String(page).includes('#') ? 'адрес «' + page + '» с «#» — якорь занят переходом панели (#pp=, #ppmap=): только файл и ?параметры' : null);

/** Ключи и значения ?параметров адреса: [{ key, values }] (значения через запятую — по одному). */
function queryParts(page) {
  const q = String(page).split('#')[0].split('?').slice(1).join('?');
  const dec = (s) => { try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch { return s; } };
  const out = [];
  for (const pair of q.split('&')) {
    if (!pair) continue;
    const i = pair.indexOf('=');
    const key = dec(i < 0 ? pair : pair.slice(0, i));
    const values = i < 0 ? [] : dec(pair.slice(i + 1)).split(',').map((v) => v.trim()).filter(Boolean);
    if (key) out.push({ key, values });
  }
  return out;
}

/* КЭ8: ключ, которого страница не читает, и демо-значение, которого нет ни в
   ней и её скриптах, ни в данных приложения (data/). Значение ищется и в
   данных, которые страница не подключает: транш берёт демо-данные целиком, а
   ?id=&tr= несёт в крошки — адрес верен, пока такие сделка и транш есть в
   данных модуля. Эвристика того же рода, что ПН5: переименованный ключ или
   удалённую запись данных она ловит, совпадение числа с чужим полем — нет. */
function paramDefects(page, entry, data, prefix) {
  const out = [];
  for (const p of queryParts(page)) {
    if (!hasToken(entry.text, p.key)) { out.push(prefix + ': параметр «' + p.key + '» не встречается в ' + entry.file + ' и её скриптах — страница его не читает (опечатка?)'); continue; }
    for (const v of p.values) {
      if (!hasToken(entry.text, v) && !hasToken(data, v)) out.push(prefix + ': значение «' + v + '» параметра ' + p.key + ' не встречается ни в ' + entry.file + ' и её скриптах, ни в данных приложения — демо-запись удалили или опечатка');
    }
  }
  return out;
}

/** Текст демо-данных приложения: все .js в его data/ (и вложенных папках). */
function dataTextOf(P, a) {
  let text = '';
  const walk = (abs) => {
    let list = [];
    try { list = readdirSync(abs, { withFileTypes: true }); } catch { return; }
    for (const e of list.sort((x, y) => (x.name < y.name ? -1 : 1))) {
      if (e.name.startsWith('.')) continue;
      if (e.isDirectory()) walk(path.join(abs, e.name));
      else if (/\.js$/i.test(e.name)) text += '\n' + read(path.join(abs, e.name));
    }
  };
  walk(path.join(a.abs, P.appShape.data));
  return text;
}

/** Экраны модуля: ключи pages/*.html (собранная .preview.html — тот же экран). */
function screensOf(P, a) {
  let files = [];
  try { files = readdirSync(path.join(a.abs, P.appShape.pages), { withFileTypes: true }).filter((e) => e.isFile() && /\.html$/i.test(e.name)).map((e) => e.name); } catch { return []; }
  return [...new Set(files.map(screenKey))].sort();
}

function analyse(P, core, mp, map, apps, lazyDs) {
  const defects = [], notes = [];
  const srcRel = P.rel(path.join(mp.abs, SRC));
  const at = (line) => srcRel + ':' + line;
  const sectionAbs = path.join(P.root, P.appsDir, mp.section);
  const pagesAbs = (a) => path.join(a.abs, P.appShape.pages);
  const pagesHref = (a) => encPath(a.dir + '/' + P.appShape.pages);
  const hint = (word, list) => { const s = core.suggest(word, list); return s ? ' — может быть, «' + s + '»?' : ''; };
  const appRef = (a) => (apps.filter((x) => x.id === a.id).length === 1 ? a.id : a.sub);

  if (map.section !== mp.section) defects.push('КЭ2 ' + at(map.line) + ' — section «' + map.section + '» не совпадает с папкой карты ' + P.rel(mp.abs) + '/: карта раздела лежит в папке с его именем');
  else if (!isDir(sectionAbs)) defects.push('КЭ2 ' + at(map.line) + ' — раздела ' + P.appsDir + '/' + mp.section + '/ нет');

  /* Текст страницы и её скриптов в пределах раздела: виджет общий для раздела,
     соседний модуль подключает его скрипты путём от страницы. */
  const corpora = new Map();
  const corpusOf = (a, page) => {
    const abs = path.join(pagesAbs(a), pageFile(page));
    if (!corpora.has(abs)) { const text = pageCorpus(abs, sectionAbs); corpora.set(abs, { file: pageFile(page), text, classes: classText(text) }); }
    return corpora.get(abs);
  };
  const dataCache = new Map();
  const dataOf = (a) => { if (!dataCache.has(a.abs)) dataCache.set(a.abs, dataTextOf(P, a)); return dataCache.get(a.abs); };
  const flowsCache = new Map();
  const flowsOf = (a) => {
    if (!flowsCache.has(a.abs)) {
      const file = P.panel ? path.join(a.abs, P.panel.dir, 'flows.yaml') : null;
      let res;
      if (!a.panel || !file || !isFile(file)) res = { error: 'у приложения ' + a.sub + ' нет сценариев панели (' + (P.panel ? P.panel.dir : 'proto-panel') + '/flows.yaml)' };
      else {
        const fr = core.readFlows(read(file));
        res = fr.errors.length
          ? { error: P.rel(file) + ' не разбирается (первая ошибка — строка ' + fr.errors[0].line + '): node ' + P.tools + '/proto-panel.mjs --check' }
          : { flows: fr.flows, rel: P.rel(file) };
      }
      flowsCache.set(a.abs, res);
    }
    return flowsCache.get(a.abs);
  };

  const byId = new Map(map.nodes.map((n) => [n.id, n]));
  const appOrder = [], covered = new Map(), nodes = [];
  let stateCount = 0;

  for (const n of map.nodes) {
    const where = 'узел ' + n.id;
    const r = apps.filter((x) => x.id === n.app || x.sub === n.app);
    let a = r.length === 1 ? r[0] : null;
    const modules = apps.filter((x) => x.kind === 'module');
    if (r.length > 1) defects.push('КЭ3 ' + at(n.at.app) + ' — ' + where + ': приложение «' + n.app + '» неоднозначно (' + r.map((x) => x.sub).join(', ') + ') — назовите путь от раздела');
    else if (!a) defects.push('КЭ3 ' + at(n.at.app) + ' — ' + where + ': приложения «' + n.app + '» нет в разделе ' + mp.section + (modules.length ? ' (модули: ' + modules.map((x) => x.sub).join(', ') + ')' : ''));
    else if (a.kind !== 'module') {
      /* решение человека 11.10.2026: на карте только страницы проекта — модули раздела */
      defects.push('КЭ3 ' + at(n.at.app) + ' — ' + where + ': «' + n.app + '» — концепт: концепты на карту не ставятся, только модули раздела');
      a = null;
    }
    let entry = null;
    if (a) {
      if (!appOrder.includes(a)) appOrder.push(a);
      if (!covered.has(a.abs)) covered.set(a.abs, new Set());
      covered.get(a.abs).add(screenKey(pageFile(n.page)));
      const prob = pageProblem(n.page, pagesAbs(a)) || hashProblem(n.page);
      if (prob) defects.push('КЭ3 ' + at(n.at.page) + ' — ' + where + ': ' + prob);
      else {
        entry = corpusOf(a, n.page);
        defects.push(...paramDefects(n.page, entry, dataOf(a), 'КЭ8 ' + at(n.at.page) + ' — ' + where));
      }
    }
    if (n.parent !== null) {
      if (n.parent === n.id) defects.push('КЭ4 ' + at(n.at.parent) + ' — ' + where + ': parent ведёт на сам узел');
      else if (!byId.has(n.parent)) defects.push('КЭ4 ' + at(n.at.parent) + ' — ' + where + ': parent «' + n.parent + '» — такого узла нет' + hint(n.parent, [...byId.keys()]));
    }

    const states = [];
    for (const s of n.states) {
      if (s.kind === 'do') {
        const sw = where + ', состояние ' + s.id;
        const page = s.page || n.page;
        let sEntry = entry;
        if (s.page && a) {
          const prob = pageProblem(s.page, pagesAbs(a)) || hashProblem(s.page);
          if (prob) { defects.push('КЭ3 ' + at(s.at.page) + ' — ' + sw + ': ' + prob); sEntry = null; }
          else if (pageFile(s.page) !== pageFile(n.page)) {
            defects.push('КЭ3 ' + at(s.at.page) + ' — ' + sw + ': открывает другой экран (' + pageFile(s.page) + ', у узла — ' + pageFile(n.page) + '): состояние описывается у узла своего экрана');
            sEntry = null;
          } else {
            sEntry = corpusOf(a, s.page);
            defects.push(...paramDefects(s.page, sEntry, dataOf(a), 'КЭ8 ' + at(s.at.page) + ' — ' + sw));
          }
        }
        if (sEntry) {
          s.do.forEach((act, i) => {
            if (!act.target) return;
            const pre = 'КЭ5 ' + at(s.at.actions[i]) + ' — ' + sw + ', действие ' + (i + 1) + ' (' + core.describeAction(act) + ')';
            defects.push(...selectorDefects(pre, selectorMisses(core, act.target, sEntry, lazyDs), sEntry.file));
          });
        }
        for (const code of s.issues) notes.push('заметка: ' + at(s.line) + ' — ' + sw + ' — ' + ISSUE_NOTE[code]);
        states.push({ id: s.id, kind: 'do', title: s.title, page, href: a ? pagesHref(a) + '/' + encPage(page) + (s.do.length ? '#ppmap=' + n.id + '/' + s.id : '') : null,
          note: s.note, issues: s.issues, do: s.do });
        stateCount++;
        continue;
      }
      /* ссылка на сценарий панели: шаги — состояния этого экрана */
      const sw = where + ', сценарий ' + s.flow;
      if (!a) continue;
      const fl = flowsOf(a);
      if (fl.error) { defects.push('КЭ4 ' + at(s.at.flow) + ' — ' + sw + ': ' + fl.error); continue; }
      const flow = fl.flows.find((x) => x.id === s.flow);
      if (!flow) { defects.push('КЭ4 ' + at(s.at.flow) + ' — ' + sw + ': сценария «' + s.flow + '» нет в ' + fl.rel + hint(s.flow, fl.flows.map((x) => x.id))); continue; }
      const picked = [];
      if (s.steps) {
        for (const st of s.steps) {
          const j = flow.steps.findIndex((x) => x.id === st.id);
          if (j < 0) defects.push('КЭ4 ' + at(st.line) + ' — ' + sw + ': шага «' + st.id + '» нет в сценарии ' + flow.id + hint(st.id, flow.steps.map((x) => x.id)));
          else picked.push(j);
        }
      } else flow.steps.forEach((x, j) => picked.push(j));
      for (const j of picked) {
        const step = flow.steps[j];
        let k = j;
        while (k >= 0 && !flow.steps[k].page) k--;
        if (k < 0) continue;   // у первого шага page обязателен — это ПН2 панели
        const entryPage = flow.steps[k].page;
        if (pageFile(entryPage) !== pageFile(n.page)) {
          defects.push('КЭ4 ' + at(s.at.flow) + ' — ' + sw + ': шаг ' + step.id + ' открывается на ' + pageFile(entryPage) + ', а узел — ' + pageFile(n.page)
            + ': состояние другого экрана — выберите шаги (steps) или подключите сценарий у узла его экрана');
        }
        const hash = step.state ? core.pad2(step.state) : encodeURIComponent(flow.id) + '/' + encodeURIComponent(step.id);
        states.push({ id: flow.id + '/' + step.id, kind: 'flow', title: step.title, page: entryPage,
          href: pagesHref(a) + '/' + encPage(entryPage).split('#')[0] + '#pp=' + hash, note: step.note, flow: flow.id, step: step.id, state: step.state });
        stateCount++;
      }
    }
    nodes.push({ id: n.id, app: a ? a.dir : null, title: n.title, page: n.page, href: a ? pagesHref(a) + '/' + encPage(n.page) : null,
      parent: n.parent, note: n.note, states });
  }

  /* Круг по parent: у схемы нет входа, отрисовщик его не разложит. */
  const looped = new Set();
  for (const n of map.nodes) {
    const chain = [n.id];
    let cur = n;
    while (cur.parent !== null && cur.parent !== cur.id && byId.has(cur.parent)) {
      cur = byId.get(cur.parent);
      if (cur.id === n.id) {
        const key = [...chain].sort().join(' ');
        if (!looped.has(key)) { looped.add(key); defects.push('КЭ4 ' + at(n.at.parent) + ' — узел ' + n.id + ': связи parent замыкаются в круг (' + chain.concat(n.id).join(' → ') + '): у схемы должен быть вход'); }
        break;
      }
      if (chain.includes(cur.id)) break;   // круг дальше по цепочке — о нём скажет его узел
      chain.push(cur.id);
    }
  }

  /* Одна точка входа (решение человека 11.10.2026): главная проекта, через
     неё — переход на остальные страницы; у майндмапа один корень. */
  const roots = map.nodes.filter((n) => n.parent === null);
  if (!roots.length && map.nodes.length) defects.push('КЭ4 ' + srcRel + ' — у карты нет точки входа: у каждого узла есть parent — у главной проекта parent не пишется');
  else if (roots.length > 1) defects.push('КЭ4 ' + at(roots[1].line) + ' — у карты одна точка входа — главная проекта; узлов без parent ' + roots.length + ': ' + roots.map((n) => n.id).join(', ') + ' — подвесьте остальные к странице, с которой на них приходят');

  /* КЭ6 — покрытие: каждый экран модулей раздела (концептов на карте нет). */
  const cover = { modules: [0, 0] };
  for (const a of apps) {
    if (a.kind !== 'module') continue;
    const have = covered.get(a.abs) || new Set();
    for (const f of screensOf(P, a)) {
      cover.modules[1]++;
      if (have.has(f)) { cover.modules[0]++; continue; }
      const built = f.replace(/\.html$/i, '.preview.html');
      const page = existsSync(path.join(pagesAbs(a), built)) ? built : f;
      defects.push('КЭ6 ' + srcRel + ' — экрана ' + P.appsDir + '/' + a.dir + '/' + P.appShape.pages + '/' + f + ' нет на карте: добавьте узел — app: ' + appRef(a) + ', page: ' + page + ', parent: <откуда приходят>');
    }
  }

  const data = {
    format: 1,
    section: mp.section,
    title: map.title,
    desc: map.desc,
    apps: appOrder.map((a) => ({ dir: a.dir, id: a.id, title: a.title, track: a.track, panel: a.panel })),
    nodes,
  };
  return { defects, notes, data, stats: { section: mp.section, nodes: nodes.length, states: stateCount, ...cover } };
}

/** Текст map-data.js. Детерминирован: без даты сборки, порядок ключей фиксирован, не-ASCII — \uXXXX. */
export function renderData(P, core, section, data) {
  return HEAD_MARK + ' из ' + SRC + ' — руками не править; пересобрать:\n'
    + '   node ' + P.tools + '/' + GEN + ' (сверка — --check).\n'
    + '   Карта экранов раздела: экраны, связи «откуда куда» и ключевые состояния.\n'
    + '   Адреса — от каталога ' + P.appsDir + '/; обычный <script>: по file:// fetch не работает. */\n'
    + '(window.ScreenMaps = window.ScreenMaps || {})[' + JSON.stringify(section) + '] = ' + core.ascii(JSON.stringify(data, null, 2)) + ';\n';
}

/* ---------------- сборка и сверка ---------------- */

/** { written, removed, defects, notes, stats, none } — write: собрать генераты; без него — только сверка. */
export function run(P, write = false) {
  const res = { written: [], removed: [], defects: [], notes: [], stats: [], none: false };
  const { cfg, defects } = config(P);
  res.defects.push(...defects);
  if (!cfg) { res.none = !defects.length; return res; }
  if (!P.panel) { res.defects.push('КЭ1 project.json → protoPanel нет: состояния карты — действия сценариев панели, их разбор — в ядре её рантайма'); return res; }
  let core;
  try { core = loadCore(P); } catch (e) { res.defects.push('КЭ1 ' + P.panel.runtime + '/core.js — ядро панели не загружается: ' + e.message); return res; }
  let ds = null;
  const lazyDs = () => (ds === null ? (ds = dsCorpus(P)) : ds);

  for (const mp of mapsOf(cfg, res.defects)) {
    const srcAbs = path.join(mp.abs, SRC), outAbs = path.join(mp.abs, OUT);
    const r = readMap(core, read(srcAbs));
    for (const e of r.errors) res.defects.push(e.code + ' ' + P.rel(srcAbs) + ':' + e.line + ' — ' + e.text);
    if (!r.map) { res.stats.push({ section: mp.section, broken: true }); continue; }
    const a = analyse(P, core, mp, r.map, sectionApps(P, mp.section), lazyDs);
    res.defects.push(...a.defects);
    res.notes.push(...a.notes);
    res.stats.push(a.stats);
    const text = renderData(P, core, mp.section, a.data);
    if (write) {
      if (!isFile(outAbs) || read(outAbs) !== text) { writeFileSync(outAbs, text, 'utf8'); res.written.push(P.rel(outAbs)); }
    } else if (!isFile(outAbs)) res.defects.push('КЭ7 ' + P.rel(outAbs) + ' — генерата нет: node ' + P.tools + '/' + GEN);
    else if (read(outAbs) !== text) res.defects.push('КЭ7 ' + P.rel(outAbs) + ' — разошёлся с ' + SRC + ', записями приложений (' + P.appsManifest + ') и сценариями панели (flows.yaml): правлен руками или не пересобран — node ' + P.tools + '/' + GEN);
  }
  /* генерат без карты: карту удалили или перенесли — сборка убирает свой файл */
  for (const name of dirsIn(cfg.dirAbs)) {
    const outAbs = path.join(cfg.dirAbs, name, OUT);
    if (!isFile(outAbs) || isFile(path.join(cfg.dirAbs, name, SRC))) continue;
    if (write && read(outAbs).startsWith(HEAD_MARK)) { rmSync(outAbs); res.removed.push(P.rel(outAbs)); }
    else res.defects.push('КЭ7 ' + P.rel(outAbs) + ' — генерат без карты: ' + SRC + ' рядом нет — удалить (сборка удаляет свой генерат сама)');
  }
  return res;
}

function statLine(s) {
  if (s.broken) return s.section + ' (' + SRC + ' не разбирается)';
  return s.section + ' (узлов ' + s.nodes + ', состояний ' + s.states + '; экраны модулей на карте: ' + s.modules[0] + ' из ' + s.modules[1] + ')';
}

function report(title, res) {
  const out = ['== ' + title + ' =='];
  if (res.none) out.push('карт экранов в проекте нет: project.json не объявляет screenMap');
  for (const w of res.written) out.push('записан ' + w);
  for (const w of res.removed) out.push('удалён ' + w);
  if (res.stats.length) out.push('карт: ' + res.stats.length + ' — ' + res.stats.map(statLine).join('; '));
  out.push(...res.notes);   // пометки состояний — строки без FAIL, вердикт не меняют
  for (const d of res.defects) out.push('FAIL  ' + d);
  out.push('ВЕРДИКТ: ' + (res.defects.length ? 'FAIL (дефектов: ' + res.defects.length + ')' : 'OK'));
  return out.join('\n');
}

/* ---------------- selftest: откат на временном дереве ---------------- */

function put(root, rel, text) {
  const p = path.join(root, rel);
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, text, 'utf8');
}
const get = (root, rel) => readFileSync(path.join(root, rel), 'utf8');

const MANIFEST = {
  contract: 1, id: 't', designSystem: { mount: 'ds' }, agentKit: { mount: '.kit', tools: '.kit/tools' },
  boot: { dir: 'apps', head: 'apps/ds-config.js', body: 'apps/ds-body.js' },
  hub: { page: 'index.html', registry: 'hub.js' }, apps: { dir: 'apps', manifest: 'app.json' },
  appShape: { pages: 'pages', widgets: 'widgets', data: 'data', refs: 'refs', widgetGroups: ['tiles'] },
  appPlaces: { moduleSuffix: '-app', drafts: 'drafts' }, tracks: [],
  protoPanel: { runtime: '.kit/proto-panel', boot: 'apps/proto-panel.js', dir: 'proto-panel' },
  screenMap: { dir: 'apps/screen-map', maps: [{ id: 'map-post', section: 'postrade', title: 'Карта экранов Post', desc: 'тест', icon: 'flow' }] },
};
const MAP_REL = 'apps/screen-map/postrade/' + SRC;
const OUT_REL = 'apps/screen-map/postrade/' + OUT;
const FLOWS_REL = 'apps/postrade/reports-app/proto-panel/flows.yaml';

const MAP = [
  '# Карта экранов стенда: комментарии в map.yaml допустимы — сборка его не переписывает.',
  'version: 1',
  'section: postrade',
  'title: Карта экранов Post',
  'nodes:',
  '  - id: main',
  '    app: deals-app',
  '    title: Главная',
  '    page: Main.html',
  '  - id: portfolio',
  '    app: deals-app',
  '    title: Текущий портфель',
  '    page: Portfolio.html',
  '    parent: main',
  '    states:',
  '      - id: deal-new',
  '        title: Новая сделка',
  '        do:',
  "          - click: '#btnNewDeal'",
  "          - waitFor: '#dealTitleModal.is-open'",
  '  - id: deal',
  '    app: deals-app',
  '    title: Сделка',
  '    page: Deal.preview.html?id=1024',
  '    parent: portfolio',
  '    states:',
  '      - id: tranche-new',
  '        title: Новый транш',
  '        issues:',
  '          - fragile',
  '        do:',
  "          - click: '[data-tree-act=\"tranche-new\"]'",
  "          - waitFor: '#trancheModal'",
  '      - id: short',
  '        title: Краткий вид',
  '        page: Deal.preview.html?id=1024&view=short',
  '  - id: tranche',
  '    app: deals-app',
  '    title: Транш',
  '    page: Tranche.html?id=1024&tr=1024.t1',
  '    parent: deal',
  '  - id: fv-register',
  '    app: reports-app',
  '    title: Реестр расчетов FV',
  '    page: Register.html',
  '    parent: main  # с главной ДИД: плитка',
  '    states:',
  '      - flow: register',
  '  - id: fv-calc',
  '    app: reports-app',
  '    title: Расчет FV',
  '    page: Calc.html?id=16&role=FINANCIER',
  '    parent: fv-register',
  '    states:',
  '      - flow: statuses',
  '        steps:',
  '          - st-formed',
  '',
].join('\n');
/* узел концепта — для кейса «концепт на карте»: концептов на карте нет (решение 11.10.2026) */
const NODE_CONCEPT = ['  - id: tranche-concept', '    app: drafts/tranche-page', '    title: Страница транша', '    page: Tranche.html', '    parent: main', ''].join('\n');

const FLOWS = [
  'version: 1',
  'lastState: 3',
  'flows:',
  '  - id: statuses',
  '    title: Статусы расчета',
  '    steps:',
  '      - state: 1',
  '        id: st-forming',
  '        title: Формируется',
  '        page: Calc.html?id=17&role=FINANCIER',
  '      - state: 2',
  '        id: st-formed',
  '        title: Сформирован',
  '        page: Calc.html?id=16&role=FINANCIER',
  '',
  '  - id: register',
  '    title: Реестр',
  '    steps:',
  '      - state: 3',
  '        id: reg-open',
  '        title: Реестр расчетов',
  '        page: Register.html',
  '',
].join('\n');

function sourceRuntime() {
  const p = project(HERE);
  return p.panel && existsSync(p.panel.runtimeAbs) ? p.panel.runtimeAbs : path.join(HERE, '..', 'proto-panel');
}

function stand(root, runtime) {
  const app = (id, track, home, extra = {}) => JSON.stringify({ id, track, title: 'Приложение ' + id, desc: 'т', home, icon: 'folder', ...extra });
  put(root, 'project.json', JSON.stringify(MANIFEST, null, 2));
  /* ДС стенда: раскладка для корпуса классов (is-open — класс состояния из ДС) */
  put(root, 'ds/ds.css', '');
  put(root, 'ds/components/atoms/X/X.css', '.is-open { display: block; }\n');
  put(root, 'ds/components/atoms/X/X.js', "el.classList.add('is-shown');\n");
  for (const d of ['foundations', 'utils', 'docs-kit']) put(root, 'ds/' + d + '/.keep', '');
  cpSync(runtime, path.join(root, '.kit/proto-panel'), { recursive: true, filter: (s) => !path.basename(s).startsWith('.') });
  const D = 'apps/postrade/deals-app/';
  put(root, D + 'app.json', app('deals-app', 'product', 'pages/Main.html'));
  put(root, D + 'pages/Main.html', '<!DOCTYPE html>\n<a id="toPortfolio" href="Portfolio.html">Портфель</a>\n');
  put(root, D + 'pages/Portfolio.html', '<!DOCTYPE html>\n<button id="btnNewDeal">Новая сделка</button>\n<div id="dealTitleModal" class="modal"></div>\n<script src="../data/deals.js"></script>\n');
  put(root, D + 'pages/Deal.html', '<!DOCTYPE html>\n<ds-include src="../widgets/tiles/Tree/Tree.html"></ds-include>\n<script src="../data/deals.js"></script>\n');
  put(root, D + 'pages/Deal.preview.html', '<!DOCTYPE html>\n<section data-tile="tree"><button data-tree-act="tranche-new">Новый транш</button></section>\n'
    + '<div id="trancheModal" class="modal"></div>\n<script src="../data/deals.js"></script>\n<script>var VIEW = /[?&]view=(full|short)/.exec(location.search);</script>\n');
  put(root, D + 'data/deals.js', "window.DEALS = [{ id: 1024, name: 'Сделка' }];\n");
  /* транш: демо-данные целиком, ?id=&tr= — только в крошки; дерево сделки страница не подключает */
  put(root, D + 'pages/Tranche.html', "<!DOCTYPE html>\n<main id=\"tranche\"></main>\n<script>var KEYS = ['id', 'tr'];</script>\n");
  put(root, D + 'data/trees.js', "window.TREES = { 1024: [{ id: '1024.t1' }] };\n");
  const R = 'apps/postrade/reports-app/';
  put(root, R + 'app.json', app('reports-app', 'product', 'pages/Register.html', { hub: false }));
  put(root, R + 'pages/Register.html', '<!DOCTYPE html>\n<table id="reg"></table>\n');
  put(root, R + 'pages/Calc.html', '<!DOCTYPE html>\n<div id="calc"></div>\n'
    + "<script>var q = new URLSearchParams(location.search); var id = q.get('id'); var role = q.get('role'); var ROLES = { FINANCIER: 1 }; var IDS = [16, 17];</script>\n");
  put(root, FLOWS_REL, FLOWS);
  put(root, R + 'proto-panel/comments.md', '');
  const C = 'apps/postrade/drafts/tranche-page/';
  put(root, C + 'app.json', app('tranche-page', 'rnd', 'pages/Tranche.html'));
  put(root, C + 'pages/Tranche.html', '<!DOCTYPE html>\n<main id="tranche"></main>\n');
  put(root, C + 'pages/index.html', '<!DOCTYPE html>\n<p>оглавление концепта</p>\n');
  /* экран другого раздела на карту Post не нужен */
  put(root, 'apps/core/clients-app/app.json', app('clients-app', 'product', 'pages/Clients.html'));
  put(root, 'apps/core/clients-app/pages/Clients.html', '<!DOCTYPE html>\n<p>клиенты</p>\n');
  put(root, MAP_REL, MAP);
}

/** Номер строки (с 1) первого вхождения needle в тексте. */
const lineOf = (text, needle) => text.slice(0, text.indexOf(needle)).split('\n').length;
const setMap = (r, text) => put(r, MAP_REL, text);
const P_ = (r) => project(r);
const manifestWith = (r, patch) => put(r, 'project.json', JSON.stringify({ ...MANIFEST, ...patch }, null, 2));
const NODE_DEAL = MAP.slice(MAP.indexOf('  - id: deal\n'), MAP.indexOf('  - id: tranche\n'));

const CASES = [
  { name: 'чистое дерево: сборка, проверка — дефектов нет; повторная сборка ничего не пишет; пометка — заметка', expect: null, build: true,
    extra: (r) => {
      const out = [];
      if (run(P_(r), true).written.length) out.push('повторная сборка что-то записала — не идемпотентна');
      const notes = run(P_(r)).notes;
      if (!notes.some((n) => n.includes(MAP_REL + ':' + lineOf(MAP, '      - id: tranche-new') + ' — узел deal, состояние tranche-new — хрупкий селектор'))) out.push('нет заметки о пометке fragile: ' + (notes.join(' | ') || 'заметок нет'));
      return out;
    } },
  { name: 'генерата нет', expect: 'КЭ7 ' + OUT_REL + ' — генерата нет' },
  { name: 'генерат правлен руками', expect: 'КЭ7 ' + OUT_REL + ' — разошёлся', build: true,
    mutate: (r) => put(r, OUT_REL, get(r, OUT_REL).replace('#ppmap=deal/tranche-new', '#ppmap=deal/x')) },
  { name: 'map.yaml правлен без пересборки', expect: 'КЭ7 ' + OUT_REL + ' — разошёлся', build: true,
    mutate: (r) => setMap(r, MAP.replace('title: Сделка', 'title: Сделка ДИД')) },
  { name: 'сценарий панели правлен без пересборки карты', expect: 'КЭ7 ' + OUT_REL + ' — разошёлся', build: true,
    mutate: (r) => put(r, FLOWS_REL, FLOWS.replace('title: Сформирован', 'title: Сформирован расчет')) },
  { name: 'синтаксис вне подмножества YAML — строка', expect: 'КЭ2 ' + MAP_REL + ':' + lineOf(MAP, '    parent: portfolio') + ' — ',
    mutate: (r) => setMap(r, MAP.replace('    parent: portfolio', '    parent: [portfolio]')) },
  { name: 'опечатка в поле узла — подсказка', expect: 'КЭ2 ' + MAP_REL + ':' + lineOf(MAP, '    title: Главная') + ' — узел main: неизвестное поле «titel» — может быть, «title»?',
    mutate: (r) => setMap(r, MAP.replace('    title: Главная', '    titel: Главная')) },
  { name: 'опечатка в глаголе действия — общий разбор панели', expect: 'неизвестный глагол «clik» — может быть, «click»?',
    mutate: (r) => setMap(r, MAP.replace("- click: '#btnNewDeal'", "- clik: '#btnNewDeal'")) },
  { name: 'у fill нет value — общий разбор панели', expect: 'узел portfolio, состояние deal-new, действие 1, fill: нет value',
    mutate: (r) => setMap(r, MAP.replace("          - click: '#btnNewDeal'\n", "          - fill:\n              target: '#btnNewDeal'\n")) },
  { name: 'section не совпадает с папкой карты', expect: 'КЭ2 ' + MAP_REL + ':' + lineOf(MAP, 'section: postrade') + ' — section «pretrade» не совпадает с папкой карты',
    mutate: (r) => setMap(r, MAP.replace('section: postrade', 'section: pretrade')) },
  { name: 'своё состояние без page и do', expect: 'узел deal, состояние short: состояние ничего не меняет',
    mutate: (r) => setMap(r, MAP.replace('        page: Deal.preview.html?id=1024&view=short\n', '')) },
  { name: 'id узла повторяется', expect: 'узел main: id повторяется в карте',
    mutate: (r) => setMap(r, MAP.replace('  - id: fv-calc', '  - id: main')) },
  { name: 'приложения нет в разделе', expect: 'КЭ3 ' + MAP_REL + ':' + lineOf(MAP, '    app: deals-app') + ' — узел main: приложения «clients-app» нет в разделе postrade',
    mutate: (r) => setMap(r, MAP.replace('    app: deals-app', '    app: clients-app')) },
  { name: 'страницы нет в pages/', expect: 'КЭ3 ' + MAP_REL + ':' + lineOf(MAP, '    page: Main.html') + ' — узел main: страницы «Gone.html» нет в pages/ приложения',
    mutate: (r) => setMap(r, MAP.replace('    page: Main.html', '    page: Gone.html')) },
  { name: 'источник модульной страницы вместо собранной', expect: 'узел deal: «Deal.html» — источник модульной страницы',
    mutate: (r) => setMap(r, MAP.replace('    page: Deal.preview.html?id=1024\n', '    page: Deal.html?id=1024\n')) },
  { name: 'якорь в адресе узла', expect: 'узел main: адрес «Main.html#top» с «#»',
    mutate: (r) => setMap(r, MAP.replace('    page: Main.html', '    page: Main.html#top')) },
  { name: 'страница своего состояния — другой экран', expect: 'узел deal, состояние short: открывает другой экран (Portfolio.html, у узла — Deal.preview.html)',
    mutate: (r) => setMap(r, MAP.replace('page: Deal.preview.html?id=1024&view=short', 'page: Portfolio.html')) },
  { name: 'parent не найден — подсказка', expect: 'КЭ4 ' + MAP_REL + ':' + lineOf(MAP, '    parent: portfolio') + ' — узел deal: parent «portfolioo» — такого узла нет — может быть, «portfolio»?',
    mutate: (r) => setMap(r, MAP.replace('    parent: portfolio', '    parent: portfolioo')) },
  { name: 'parent замыкает круг', expect: 'связи parent замыкаются в круг',
    mutate: (r) => setMap(r, MAP.replace('    page: Main.html\n', '    page: Main.html\n    parent: deal\n')) },
  { name: 'сценария нет — подсказка', expect: 'узел fv-register, сценарий registr: сценария «registr» нет в ' + FLOWS_REL + ' — может быть, «register»?',
    mutate: (r) => setMap(r, MAP.replace('      - flow: register', '      - flow: registr')) },
  { name: 'шага сценария нет', expect: 'КЭ4 ' + MAP_REL + ':' + lineOf(MAP, '          - st-formed') + ' — узел fv-calc, сценарий statuses: шага «st-gone» нет в сценарии statuses',
    mutate: (r) => setMap(r, MAP.replace('          - st-formed', '          - st-gone')) },
  { name: 'шаг сценария открывается на другом экране', expect: 'узел fv-calc, сценарий register: шаг reg-open открывается на Register.html, а узел — Calc.html',
    mutate: (r) => setMap(r, MAP.replace('      - flow: statuses\n        steps:\n          - st-formed\n', '      - flow: register\n')) },
  { name: 'сценарий у приложения без панели', expect: 'узел main, сценарий main: у приложения deals-app нет сценариев панели',
    mutate: (r) => setMap(r, MAP.replace('    page: Main.html\n', '    page: Main.html\n    states:\n      - flow: main\n')) },
  { name: 'flows.yaml приложения не разбирается', expect: 'узел fv-register, сценарий register: ' + FLOWS_REL + ' не разбирается',
    mutate: (r) => put(r, FLOWS_REL, FLOWS.replace('version: 1', 'version: 2')) },
  { name: 'id селектора не найден в странице', expect: 'КЭ5 ' + MAP_REL + ':' + lineOf(MAP, "- click: '#btnNewDeal'") + " — узел portfolio, состояние deal-new, действие 1 (click '#btnNewDeall'): «btnNewDeall» не встречается в Portfolio.html и её скриптах",
    mutate: (r) => setMap(r, MAP.replace("'#btnNewDeal'", "'#btnNewDeall'")) },
  { name: 'класса селектора нет ни в странице, ни в ДС', expect: 'класс «is-opened» — нет ни в Portfolio.html',
    mutate: (r) => setMap(r, MAP.replace('.is-open', '.is-opened')) },
  { name: 'data-значение селектора не найдено в собранной странице', expect: '«tranche-old» не встречается в Deal.preview.html',
    mutate: (r) => setMap(r, MAP.replace('data-tree-act="tranche-new"', 'data-tree-act="tranche-old"')) },
  { name: 'покрытие: узел убран — назван пропущенный экран', expect: 'КЭ6 ' + MAP_REL + ' — экрана apps/postrade/deals-app/pages/Deal.html нет на карте: добавьте узел — app: deals-app, page: Deal.preview.html',
    mutate: (r) => setMap(r, MAP.replace(NODE_DEAL, '')) },
  { name: 'покрытие: новый экран модуля без узла', expect: 'КЭ6 ' + MAP_REL + ' — экрана apps/postrade/reports-app/pages/Export.html нет на карте',
    mutate: (r) => put(r, 'apps/postrade/reports-app/pages/Export.html', '<!DOCTYPE html>\n<p>выгрузка</p>\n') },
  { name: 'концепт на карте — только модули раздела', expect: 'КЭ3 ' + MAP_REL + ':' + lineOf(MAP + NODE_CONCEPT, '    app: drafts/tranche-page') + ' — узел tranche-concept: «drafts/tranche-page» — концепт: концепты на карту не ставятся',
    mutate: (r) => setMap(r, MAP + NODE_CONCEPT) },
  { name: 'две точки входа — главная одна', expect: 'КЭ4 ' + MAP_REL + ':' + lineOf(MAP, '  - id: fv-register') + ' — у карты одна точка входа — главная проекта; узлов без parent 2: main, fv-register',
    mutate: (r) => setMap(r, MAP.replace('    parent: main  # с главной ДИД: плитка\n', '')) },
  { name: 'демо-значение параметра не встречается в данных', expect: 'КЭ8 ' + MAP_REL + ':' + lineOf(MAP, '    page: Deal.preview.html?id=1024') + ' — узел deal: значение «1025» параметра id не встречается ни в Deal.preview.html и её скриптах, ни в данных приложения',
    mutate: (r) => setMap(r, MAP.replace('    page: Deal.preview.html?id=1024\n', '    page: Deal.preview.html?id=1025\n')) },
  { name: 'демо-значение, которого нет и в данных, что страница не подключает', expect: 'узел tranche: значение «1024.t9» параметра tr не встречается ни в Tranche.html и её скриптах, ни в данных приложения',
    mutate: (r) => setMap(r, MAP.replace('&tr=1024.t1', '&tr=1024.t9')) },
  { name: 'параметр, которого страница не читает', expect: 'узел deal, состояние short: параметр «veiw» не встречается в Deal.preview.html',
    mutate: (r) => setMap(r, MAP.replace('&view=short', '&veiw=short')) },
  { name: 'карта объявлена, файла нет', expect: 'КЭ1 apps/screen-map/postrade/map.yaml — карты раздела «postrade» нет на диске',
    mutate: (r) => rmSync(path.join(r, MAP_REL)) },
  { name: 'карта на диске не объявлена', expect: 'КЭ1 apps/screen-map/core/map.yaml — карта не объявлена в project.json → screenMap.maps',
    mutate: (r) => put(r, 'apps/screen-map/core/map.yaml', MAP.replace('section: postrade', 'section: core')) },
  { name: 'запись карты в манифесте без полей', expect: 'КЭ1 project.json → screenMap.maps[0] — нет полей: desc, icon',
    mutate: (r) => manifestWith(r, { screenMap: { dir: 'apps/screen-map', maps: [{ id: 'map-post', section: 'postrade', title: 'Карта' }] } }) },
  { name: 'генерат без карты', expect: 'КЭ7 apps/screen-map/old/map-data.js — генерат без карты',
    mutate: (r) => put(r, 'apps/screen-map/old/map-data.js', HEAD_MARK + ' */\n') },
  { name: 'манифест без screenMap — карт нет, OK', expect: null,
    mutate: (r) => { const { screenMap, ...rest } = MANIFEST; put(r, 'project.json', JSON.stringify(rest, null, 2)); },
    extra: (r) => (run(P_(r)).none ? [] : ['нет пометки «карт нет»']) },
];

/** Генерат стенда, исполненный как страница: адреса, виды состояний, действия, ASCII. */
function dataCase(runtime) {
  const r = mkdtempSync(path.join(os.tmpdir(), 'screen-map-'));
  try {
    stand(r, runtime);
    run(P_(r), true);
    const text = get(r, OUT_REL);
    const ctx = { window: {} };
    vm.runInNewContext(text, ctx);
    const d = ctx.window.ScreenMaps && ctx.window.ScreenMaps.postrade;
    const bad = [];
    if (!d) return ['window.ScreenMaps.postrade не задан'];
    const node = (id) => d.nodes.find((n) => n.id === id) || { states: [] };
    const state = (n, id) => node(n).states.find((s) => s.id === id) || {};
    const want = [
      ['узлов', d.nodes.length, 6],
      ['транш — значения из данных модуля', node('tranche').href, 'postrade/deals-app/pages/Tranche.html?id=1024&tr=1024.t1'],
      ['адрес узла deal', node('deal').href, 'postrade/deals-app/pages/Deal.preview.html?id=1024'],
      ['родитель deal', node('deal').parent, 'portfolio'],
      ['вход main', node('main').parent, null],
      ['своё состояние', state('deal', 'tranche-new').href, 'postrade/deals-app/pages/Deal.preview.html?id=1024#ppmap=deal/tranche-new'],
      ['состояние по параметру', state('deal', 'short').href, 'postrade/deals-app/pages/Deal.preview.html?id=1024&view=short'],
      ['шаг сценария', state('fv-calc', 'statuses/st-formed').href, 'postrade/reports-app/pages/Calc.html?id=16&role=FINANCIER#pp=02'],
      ['название шага — из flows.yaml', state('fv-calc', 'statuses/st-formed').title, 'Сформирован'],
      ['все шаги без steps', node('fv-register').states.map((s) => s.href).join(' '), 'postrade/reports-app/pages/Register.html#pp=03'],
      ['действие в полной форме', JSON.stringify(state('deal', 'tranche-new').do && state('deal', 'tranche-new').do[0]),
        JSON.stringify({ verb: 'click', target: '[data-tree-act="tranche-new"]', text: null, index: 0, timeout: 4000, value: null, key: null,
          mods: { alt: false, shift: false, ctrl: false, meta: false }, state: null, block: null, ms: null })],
      ['приложения карты — только модули', d.apps.map((a) => a.dir + ':' + a.panel).join(' '),
        'postrade/deals-app:false postrade/reports-app:true'],
    ];
    for (const [what, got, exp] of want) if (got !== exp) bad.push(what + ': «' + got + '», ждали «' + exp + '»');
    const body = text.slice(text.indexOf('*/') + 2);
    if (/[^\x09\x0a\x0d\x20-\x7e]/.test(body)) bad.push('данные не ASCII: не-ASCII должен идти \\uXXXX');
    return bad;
  } catch (e) {
    return ['генерат не исполняется: ' + e.message];
  } finally {
    rmSync(r, { recursive: true, force: true });
  }
}

function selftest() {
  const out = ['== ' + GEN + ' --selftest =='];
  const runtime = sourceRuntime();
  let failed = 0;
  for (const c of CASES) {
    const r = mkdtempSync(path.join(os.tmpdir(), 'screen-map-'));
    let pass = false, info = '';
    try {
      stand(r, runtime);
      if (c.build) run(P_(r), true);
      if (c.mutate) c.mutate(r);
      const { defects } = run(P_(r));
      pass = c.expect === null ? defects.length === 0 : defects.some((d) => d.includes(c.expect));
      const extra = pass && c.extra ? c.extra(r) : [];
      if (extra.length) pass = false;
      info = [...(defects.length ? defects : ['дефектов нет']), ...extra].join(' | ');
    } catch (e) {
      info = 'исключение: ' + (e && e.stack || e);
    } finally {
      rmSync(r, { recursive: true, force: true });
    }
    if (!pass) failed++;
    out.push((pass ? 'ok    ' : 'FAIL  ') + c.name + ' — ' + info + (pass || c.expect === null ? '' : ' (ждали: ' + c.expect + ')'));
  }
  const bad = dataCase(runtime);
  if (bad.length) failed++;
  out.push((bad.length ? 'FAIL  ' : 'ok    ') + 'генерат исполняется: адреса экранов, своих состояний (#ppmap=) и шагов (#pp=), полная форма действий, ASCII'
    + (bad.length ? ' — ' + bad.join(' | ') : ''));
  const total = CASES.length + 1;
  out.push('ВЕРДИКТ: ' + (failed ? 'FAIL (кейсов не прошло: ' + failed + ' из ' + total + ')' : 'OK (кейсов: ' + total + ')'));
  console.log(out.join('\n'));
  process.exit(failed ? 1 : 0);
}

/* ---------------- main ---------------- */

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest') || args.includes('--self-test')) return selftest();
  const P = need('screen-map', HERE);
  const write = !args.includes('--check');
  const res = run(P, write);
  console.log(report(write ? 'screen-map' : 'screen-map --check', res));
  process.exit(res.defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SELF) main();

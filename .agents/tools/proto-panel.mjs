#!/usr/bin/env node
/* ============================================================
   PROTO-PANEL — оснастка панели прототипа: сборка, проверка, включение.

   Зачем (задача 0005, решения человека 24.09.2026). Панель прототипа —
   служебная шторка поверх страниц приложения: сценарии показа (User Flows)
   и комментарии к прототипу. Код панели один — рантайм в харнесе
   (`project.json → protoPanel.runtime`), данные — рядом с прототипом, в
   папке `<приложение>/<protoPanel.dir>/`: `flows.yaml` (сценарии),
   `comments.md` (комментарии) и `panel-data.js` — их JS-зеркало, потому что
   страница по file:// не может прочитать YAML и MD. Включатель —
   `protoPanel.boot` (`apps/proto-panel.js`): список приложений, у которых
   есть папка панели; его подключает загрузчик ДС `ds-body.js`, прототипы не
   правятся. Папка есть — панель есть, папки нет — страница работает как
   прежде.

   Зеркало и включатель — генераты: руками не правятся, гейт (шаг `panel`)
   сверяет их с тем, что собрал бы инструмент. Логика форматов не
   дублируется: ядро загружается из рантайма (`core.js`, UMD) — тем же кодом
   зеркало пишет и панель в браузере при сохранении комментария, поэтому
   запись из браузера не краснит гейт.

   Коды ПН — «панель» (описание — README панели, раздел «Коды ПН»):
     ПН1  flows.yaml не разбирается: синтаксис вне подмножества YAML;
     ПН2  схема flows.yaml: поля, типы, id, глаголы, page первого шага, пределы;
     ПН3  comments.md не по формату;
     ПН4  страница шага: нет файла в pages/, путь с «/» или «..», источник
          модульной страницы вместо собранной <Имя>.preview.html;
     ПН5  селектор действия не разбирается или его имена не найдены в тексте
          страницы точки входа и её локальных скриптах (классы — ещё и в ДС);
     ПН6  открытый комментарий ссылается на несуществующую страницу или шаг;
     ПН7  зеркала panel-data.js нет или оно разошлось с исходниками;
     ПН8  включателя нет или он разошёлся со списком приложений и рантаймом;
     ПН9  состав папки панели: нет flows.yaml или comments.md, посторонний файл;
     ПН10 рантайм: нет файла, файл не разбирается как JS, файл зовёт глобальную
          закрывашку слоёв ДС (closeAll, hideAll); в panel.css цвет литералом,
          px больше 2 вне условий @media, селектор без pp-.
   Нет protoPanel в манифесте — панели в проекте нет: `--check` пишет это
   строкой и выходит с OK.

   Использование (<app> — путь от корня, от apps/ или id из app.json):
     node proto-panel.mjs                         — сборка зеркал и включателя, затем проверка
     node proto-panel.mjs --check                 — сверка без записи (гейт, шаг panel)
     node proto-panel.mjs --enable <app>          — заготовка папки панели и сборка
     node proto-panel.mjs --disable <app> [--force] — выключить: удалить папку панели
     node proto-panel.mjs --list <app> [--open]   — комментарии коротко
     node proto-panel.mjs --resolve <app> <К-N> --status сделан|отклонён|открыт [--note "…"]
     node proto-panel.mjs --selftest              — откат на временном дереве
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1; без манифеста — 2.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync, rmSync, mkdtempSync, cpSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { project, need } from './project.mjs';
import { includesOf } from './assemble.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SELF = path.resolve(fileURLToPath(import.meta.url));
const GEN = 'proto-panel.mjs';
/** Файлы рантайма в порядке подключения: его пишет включатель, его же сверяет ПН10. */
export const FILES = ['core.js', 'store.js', 'runner.js', 'ui.js', 'tab-flows.js', 'tab-comments.js', 'panel.js'];
const CSS = 'panel.css';
const DATA = { flows: 'flows.yaml', comments: 'comments.md', mirror: 'panel-data.js' };
const req = createRequire(import.meta.url);
const slash = (p) => p.split(path.sep).join('/');

/** Ядро панели из рантайма проекта — один код на браузер и оснастку. */
export function loadCore(P) {
  return req(path.join(P.panel.runtimeAbs, 'core.js'));
}

function appMeta(abs, P) {
  let j = {};
  try { j = JSON.parse(readFileSync(path.join(abs, P.appsManifest), 'utf8')); } catch { /* запись не читается — сторож хаба скажет */ }
  const id = typeof j.id === 'string' && j.id.trim() ? j.id.trim() : path.basename(abs);
  return { id, title: typeof j.title === 'string' && j.title.trim() ? j.title.trim() : id, home: typeof j.home === 'string' ? j.home : '' };
}

function decorate(P, a) {
  return { ...a, rel: P.appsDir + '/' + a.dir, panelAbs: path.join(a.abs, P.panel.dir), meta: appMeta(a.abs, P) };
}

/** Приложения, у которых есть папка панели: [{ dir, abs, rel, panelAbs, meta }]. */
export function panelApps(P) {
  if (!P.panel) return [];
  return P.apps().map((a) => decorate(P, a)).filter((a) => {
    try { return statSync(a.panelAbs).isDirectory(); } catch { return false; }
  });
}

function readData(a, name) {
  const f = path.join(a.panelAbs, name);
  return existsSync(f) ? readFileSync(f, 'utf8') : null;
}

function mirrorFor(core, a) {
  return core.mirrorText({ app: { id: a.meta.id, title: a.meta.title }, flowsText: readData(a, DATA.flows) || '', commentsText: readData(a, DATA.comments) || '' });
}

/** Путь приложения от каталога включателя — так его видит адрес страницы. */
function bootRel(P, a) {
  return path.posix.relative(path.posix.dirname(P.panel.boot), a.rel);
}

/** Текст включателя для списка приложений. */
export function renderBoot(P, apps, core) {
  const bootDir = path.posix.dirname(P.panel.boot);
  const list = apps.map((a) => (typeof a === 'string' ? a : bootRel(P, a))).sort();
  const runtime = (path.posix.relative(bootDir, P.panel.runtime) || '.') + '/';
  const q = (v) => JSON.stringify(v);
  return '/* СГЕНЕРИРОВАН ' + GEN + ' — руками не править; пересобрать:\n'
    + '   node ' + P.tools + '/' + GEN + ' (гейт сверяет, шаг panel).\n'
    + '   Включатель панели прототипа: ds-body.js подключает его на каждой странице.\n'
    + '   Панель есть только у приложений из списка — у них есть папка ' + P.panel.dir + '/;\n'
    + '   на остальных страницах и на хабе файл ничего не делает, во фрейме\n'
    + '   только пересылает горячие клавиши панели наверх. */\n'
    + '(function () {\n'
    + '  var APPS = [' + (list.length ? '\n' + list.map((x) => '    ' + q(x)).join(',\n') + '\n  ' : '') + '];\n'
    + '  var RUNTIME = ' + q(runtime) + ';\n'
    + '  var DIR = ' + q(P.panel.dir) + ', BASE = ' + q(bootDir) + ', MANIFEST = ' + q(P.appsManifest) + '; // для записи: путь от корня проекта\n'
    + '  var DATA = DIR + ' + q('/' + DATA.mirror) + ', PAGES = ' + q(P.appShape.pages) + ';\n'
    + '  var FILES = [' + FILES.map(q).join(', ') + '];\n'
    + '  var KEYS = [' + core.HOTKEYS.codes.map(q).join(', ') + ']; // core.js → HOTKEYS: одна константа на панель и включатель\n'
    + '  var me = document.currentScript;\n'
    + '  if (!me || !me.src || !APPS.length) return;\n'
    + '  var apps = new URL(\'./\', me.src), here, base;\n'
    + '  try { here = decodeURIComponent(location.pathname); base = decodeURIComponent(apps.pathname); } catch (e) { return; }\n'
    + '  if (here.indexOf(base) !== 0) return; // хаб и всё вне каталога приложений\n'
    + '  var rel = here.slice(base.length), cut = rel.lastIndexOf(\'/\' + PAGES + \'/\');\n'
    + '  if (cut < 0) return;\n'
    + '  var app = rel.slice(0, cut);\n'
    + '  if (APPS.indexOf(app) < 0) return; // приложение без панели\n'
    + '  if (window.top !== window.self) {\n'
    + '    /* страница во фрейме (превью материала): своей панели нет, но её клавиши\n'
    + '       работают и отсюда — нажатие уходит странице-хозяйке сообщением */\n'
    + '    document.addEventListener(\'keydown\', function (e) {\n'
    + '      if (!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey || KEYS.indexOf(e.code) < 0) return;\n'
    + '      e.preventDefault(); e.stopPropagation();\n'
    + '      try { window.parent.postMessage({ source: \'proto-panel\', type: \'key\', code: e.code }, \'*\'); } catch (err) { /* хозяйка недоступна */ }\n'
    + '    }, true);\n'
    + '    return;\n'
    + '  }\n'
    + '  var rt = new URL(RUNTIME, apps).href;\n'
    + '  var appUrl = new URL(app.split(\'/\').map(encodeURIComponent).join(\'/\') + \'/\', apps).href;\n'
    + '  window.__PROTO_PANEL = { app: app, appUrl: appUrl, pagesUrl: appUrl + PAGES + \'/\', runtimeUrl: rt, keys: KEYS, dir: DIR, base: BASE, manifest: MANIFEST };\n'
    + '  document.write(\'<link rel="stylesheet" href="\' + rt + \'' + CSS + '">\');\n'
    + '  document.write(\'<scr\' + \'ipt src="\' + appUrl + DATA + \'"><\\/scr\' + \'ipt>\');\n'
    + '  for (var i = 0; i < FILES.length; i++) document.write(\'<scr\' + \'ipt src="\' + rt + FILES[i] + \'"><\\/scr\' + \'ipt>\');\n'
    + '})();\n';
}

/** Сборка: зеркала всех приложений с папкой панели и включатель. { written, defects } */
export function build(P) {
  const written = [];
  if (!P.panel) return { written, defects: [] };
  let core;
  try { core = loadCore(P); } catch (e) { return { written, defects: ['ПН10 ' + P.panel.runtime + '/core.js — ядро не загружается: ' + e.message] }; }
  const apps = panelApps(P);
  for (const a of apps) {
    const file = path.join(a.panelAbs, DATA.mirror);
    const text = mirrorFor(core, a);
    if (!existsSync(file) || readFileSync(file, 'utf8') !== text) { writeFileSync(file, text, 'utf8'); written.push(P.rel(file)); }
  }
  const boot = path.join(P.root, P.panel.boot);
  const text = renderBoot(P, apps.filter((a) => !bootRel(P, a).startsWith('..')), core);
  if (!existsSync(boot) || readFileSync(boot, 'utf8') !== text) {
    mkdirSync(path.dirname(boot), { recursive: true });
    writeFileSync(boot, text, 'utf8');
    written.push(P.panel.boot);
  }
  return { written, defects: [] };
}

/* ---------------- проверка ---------------- */

/* Имя как отдельный токен текста: «pv» не находится внутри «pvWide». */
function hasToken(text, name) {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('(^|[^A-Za-z0-9_\\-\\u0400-\\u04FF])' + esc + '($|[^A-Za-z0-9_\\-\\u0400-\\u04FF])').test(text);
}

function pageFile(page) {
  let file = String(page).split(/[?#]/)[0];
  try { file = decodeURIComponent(file); } catch { /* имя с «%» — как есть */ }
  return file;
}

/** Беда со страницей шага или null. */
function pageProblem(page, pagesAbs) {
  const file = pageFile(page);
  if (!file) return 'пустое имя страницы';
  if (/[\\/]/.test(file) || file === '..' || file === '.') return 'путь «' + page + '» — только имя файла в pages/ приложения, без «/» и «..»';
  const abs = path.join(pagesAbs, file);
  if (!existsSync(abs)) return 'страницы «' + file + '» нет в pages/ приложения';
  if (!/\.html?$/i.test(file)) return 'страница «' + file + '» — не .html';
  if (includesOf(readFileSync(abs, 'utf8')).length) return '«' + file + '» — источник модульной страницы (в нём метки <ds-include>): откройте собранную ' + file.replace(/\.html?$/i, '.preview.html');
  return null;
}

/* Текст страницы точки входа и её локальных скриптов (<script src> внутри приложения). */
function pageCorpus(pageAbs, appAbs) {
  const html = readFileSync(pageAbs, 'utf8');
  let text = html;
  for (const m of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)) {
    if (/^([a-z][\w+.-]*:|\/)/i.test(m[1])) continue;
    let clean = m[1].split(/[?#]/)[0];
    try { clean = decodeURI(clean); } catch { /* как есть */ }
    const abs = path.resolve(path.dirname(pageAbs), clean);
    if (!abs.startsWith(appAbs + path.sep) || !existsSync(abs)) continue;
    text += '\n' + readFileSync(abs, 'utf8');
  }
  return text;
}

/* Текст ДС для классов состояния (.is-open ставит рантайм ДС). Словарь глифов не читается. */
function dsCorpus(P) {
  if (!P.dsAbs) return '';
  let text = '';
  for (const sub of ['styles', 'scripts']) {
    const dir = path.join(P.dsAbs, sub);
    let list = [];
    try { list = readdirSync(dir); } catch { continue; }
    for (const f of list.sort()) {
      if (!/\.(css|js)$/.test(f) || f === 'icons-data.js') continue;
      text += '\n' + readFileSync(path.join(dir, f), 'utf8');
    }
  }
  return text;
}

function splitSelectors(prelude) {
  const out = [];
  let depth = 0, cur = '';
  for (const ch of prelude) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

/** Своё поверх ДС: только токены и только префикс pp-. [{ line, text }] */
export function cssDefects(src) {
  const out = [];
  const text = String(src).replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const lineAt = (idx) => text.slice(0, idx).split('\n').length;
  const stack = [];
  let start = 0;
  const decls = (from, to) => {
    const body = text.slice(from, to);
    for (const m of body.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) out.push({ line: lineAt(from + m.index), text: 'цвет литералом «' + m[0] + '» — только токены ДС: var(--…)' });
    for (const m of body.matchAll(/\b(rgba?|hsla?)\(/gi)) out.push({ line: lineAt(from + m.index), text: 'цвет литералом «' + m[1] + '(…)» — только токены ДС: var(--…)' });
    for (const m of body.matchAll(/(-?\d*\.?\d+)px\b/g)) {
      if (Math.abs(parseFloat(m[1])) > 2) out.push({ line: lineAt(from + m.index), text: '«' + m[0] + '» — размеры только токенами ДС: px больше 2 допустимы лишь в условиях @media' });
    }
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '{') {
      const raw = text.slice(start, i);
      const prelude = raw.trim();
      const pline = lineAt(start + (raw.length - raw.trimStart().length));
      const top = stack[stack.length - 1];
      if (prelude.startsWith('@')) {
        const name = (/^@([\w-]+)/.exec(prelude) || [])[1] || '';
        if (/keyframes$/.test(name)) {
          const kf = prelude.split(/\s+/)[1] || '';
          if (!/^pp-/.test(kf)) out.push({ line: pline, text: 'анимация «' + kf + '» без префикса pp-' });
          stack.push({ kind: 'keyframes' });
        } else stack.push({ kind: 'group' });
      } else if (top && top.kind === 'keyframes') {
        stack.push({ kind: 'decl', from: i + 1 });
      } else {
        for (const sel of splitSelectors(prelude)) {
          if (!/^[.#]pp-/.test(sel)) out.push({ line: pline, text: 'селектор «' + sel + '» без префикса pp- — свой CSS панели только на .pp-* и #pp-*' });
        }
        stack.push({ kind: 'decl', from: i + 1 });
      }
      start = i + 1;
    } else if (c === '}') {
      const ctx = stack.pop();
      if (ctx && ctx.kind === 'decl') decls(ctx.from, i);
      start = i + 1;
    } else if (c === ';' && (!stack.length || stack[stack.length - 1].kind === 'group')) {
      start = i + 1;
    }
  }
  return out;
}

/* Глобальные закрывашки плавающих слоёв ДС. Панель — служебный слой поверх
   страницы: closeAll()/hideAll() закрыли бы и меню страницы, которое шаг
   сценария только что открыл (поймано при проверке пилота 24.09.2026: шаг
   «Выгрузка» проходил, а меню «Скачать» закрывалось перерисовкой плеера).
   Свои слои панель закрывает по одному, сверяясь, что они её. */
const GLOBAL_CLOSE = /\bDS(?:Menu|Tooltip|DropdownList|Modal|Popover|Snack|Toast)\s*\.\s*(closeAll|hideAll|dismissAll|clear)\s*\(/g;

function runtimeDefects(P, defects) {
  const dir = P.panel.runtimeAbs;
  for (const f of FILES) {
    const abs = path.join(dir, f);
    if (!existsSync(abs)) { defects.push('ПН10 ' + P.panel.runtime + '/' + f + ' — нет файла рантайма (порядок файлов — во включателе)'); continue; }
    const text = readFileSync(abs, 'utf8');
    try { new Function(text); } catch (e) { defects.push('ПН10 ' + P.panel.runtime + '/' + f + ' — не разбирается как JS: ' + e.message); }
    const code = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/\/\/[^\n]*/g, '');
    for (const m of code.matchAll(GLOBAL_CLOSE)) {
      defects.push('ПН10 ' + P.panel.runtime + '/' + f + ':' + code.slice(0, m.index).split('\n').length + ' — «' + m[0].replace(/\s+/g, '') + '…)» закрывает слои всей страницы: панель закрывает только свои (current() и проверка, что слой её)');
    }
  }
  const css = path.join(dir, CSS);
  if (!existsSync(css)) defects.push('ПН10 ' + P.panel.runtime + '/' + CSS + ' — нет файла стилей панели');
  else for (const d of cssDefects(readFileSync(css, 'utf8'))) defects.push('ПН10 ' + P.panel.runtime + '/' + CSS + ':' + d.line + ' — ' + d.text);
}

function appDefects(P, a, core, defects, lazyDs) {
  const dirRel = P.rel(a.panelAbs);
  const st = { rel: bootRel(P, a), flows: 0, steps: 0, open: 0 };
  const entries = readdirSync(a.panelAbs, { withFileTypes: true }).filter((e) => !e.name.startsWith('.'));
  const allowed = Object.values(DATA);
  for (const f of [DATA.flows, DATA.comments]) {
    if (!entries.some((e) => e.name === f && e.isFile())) defects.push('ПН9 ' + dirRel + '/ — нет ' + f + ': заготовка — node ' + P.tools + '/' + GEN + ' --enable, формат — README панели');
  }
  for (const e of entries) {
    if (!allowed.includes(e.name) || !e.isFile()) defects.push('ПН9 ' + dirRel + '/' + e.name + (e.isDirectory() ? '/' : '') + ' — посторонний ' + (e.isDirectory() ? 'каталог' : 'файл') + ': в папке панели только ' + allowed.join(', '));
  }
  const flowsText = readData(a, DATA.flows);
  const commentsText = readData(a, DATA.comments);
  const fr = core.readFlows(flowsText || '');
  if (flowsText !== null) for (const e of fr.errors) defects.push(e.code + ' ' + dirRel + '/' + DATA.flows + ':' + e.line + ' — ' + e.text);
  const cr = core.parseComments(commentsText || '');
  if (commentsText !== null) for (const e of cr.errors) defects.push('ПН3 ' + dirRel + '/' + DATA.comments + ':' + e.line + ' — ' + e.text);
  st.flows = fr.flows.length;
  st.steps = fr.flows.reduce((n, f) => n + f.steps.length, 0);
  st.open = cr.model.comments.filter((c) => c.status === 'open').length;

  const pagesAbs = path.join(a.abs, P.appShape.pages);
  const corpus = new Map();
  fr.flows.forEach((flow, fi) => {
    let entry = null;
    flow.steps.forEach((step, si) => {
      const sm = fr.meta[fi].steps[si];
      if (step.page) {
        const prob = pageProblem(step.page, pagesAbs);
        if (prob) { defects.push('ПН4 ' + dirRel + '/' + DATA.flows + ':' + sm.page + ' — сценарий ' + flow.id + ', шаг ' + step.id + ': ' + prob); entry = null; }
        else {
          const file = pageFile(step.page);
          if (!corpus.has(file)) corpus.set(file, pageCorpus(path.join(pagesAbs, file), a.abs));
          entry = { file, text: corpus.get(file) };
        }
      }
      step.do.forEach((act, ai) => {
        if (!act.target || !entry) return;
        const at = dirRel + '/' + DATA.flows + ':' + sm.actions[ai] + ' — сценарий ' + flow.id + ', шаг ' + step.id + ', действие ' + (ai + 1) + ' (' + core.describeAction(act) + ')';
        const t = core.selectorTokens(act.target);
        if (t.error) { defects.push('ПН5 ' + at + ': селектор не разбирается — ' + t.error); return; }
        const miss = [];
        for (const id of t.ids) if (!hasToken(entry.text, id)) miss.push(id);
        for (const x of t.attrs) {
          if (!/^data-/.test(x.name)) continue;
          if (!hasToken(entry.text, x.name)) miss.push(x.name);
          else if (x.value && !hasToken(entry.text, x.value)) miss.push(x.value);
        }
        if (miss.length) defects.push('ПН5 ' + at + ': ' + miss.map((m) => '«' + m + '»').join(', ') + (miss.length > 1 ? ' не встречаются' : ' не встречается') + ' в ' + entry.file + ' и её скриптах');
        const noClass = t.classes.filter((c) => !hasToken(entry.text, c) && !hasToken(lazyDs(), c));
        if (noClass.length) defects.push('ПН5 ' + at + ': ' + noClass.map((c) => 'класс «' + c + '»').join(', ') + ' — нет ни в ' + entry.file + ' и её скриптах, ни в ДС');
      });
    });
  });

  const flowsById = fr.errors.length ? null : new Map(fr.flows.map((f) => [f.id, f]));
  for (const c of cr.model.comments) {
    if (c.status !== 'open') continue;
    const where = 'ПН6 ' + dirRel + '/' + DATA.comments + ':' + (cr.lines[c.n] || 1) + ' — К-' + c.n + ' (открыт): ';
    if (c.page) {
      const file = pageFile(c.page);
      if (!file || /[\\/]/.test(file) || !existsSync(path.join(pagesAbs, file))) defects.push(where + 'страницы «' + c.page + '» нет в pages/ приложения — поправьте ссылку');
    }
    if (c.step && flowsById) {
      const f = flowsById.get(c.step.flow);
      if (!f || !f.steps.some((s) => s.id === c.step.step)) defects.push(where + 'шага «' + c.step.flow + '/' + c.step.step + '» нет в ' + DATA.flows + ' — сценарий или шаг переименовали: поправьте ссылку');
    }
  }

  const mirror = path.join(a.panelAbs, DATA.mirror);
  if (!existsSync(mirror)) defects.push('ПН7 ' + P.rel(mirror) + ' — зеркала нет: node ' + P.tools + '/' + GEN);
  else if (readFileSync(mirror, 'utf8') !== mirrorFor(core, a)) defects.push('ПН7 ' + P.rel(mirror) + ' — зеркало разошлось с ' + DATA.flows + ', ' + DATA.comments + ' и ' + P.appsManifest + ': правлено руками или не пересобрано — node ' + P.tools + '/' + GEN);
  return st;
}

/** Проверка без записи: { defects, stats }. */
export function check(P) {
  const defects = [];
  const stats = [];
  if (!P.panel) return { defects, stats, none: true };
  let core;
  try { core = loadCore(P); } catch (e) { return { defects: ['ПН10 ' + P.panel.runtime + '/core.js — ядро не загружается: ' + e.message], stats }; }
  runtimeDefects(P, defects);
  const apps = panelApps(P);
  let ds = null;
  const lazyDs = () => (ds === null ? (ds = dsCorpus(P)) : ds);
  for (const a of apps) {
    if (bootRel(P, a).startsWith('..')) defects.push('ПН8 ' + a.rel + ' — приложение вне каталога включателя ' + path.posix.dirname(P.panel.boot) + '/: страница не найдёт свою панель');
    stats.push(appDefects(P, a, core, defects, lazyDs));
  }
  const boot = path.join(P.root, P.panel.boot);
  const want = renderBoot(P, apps.filter((a) => !bootRel(P, a).startsWith('..')), core);
  if (!existsSync(boot)) defects.push('ПН8 ' + P.panel.boot + ' — включателя нет: node ' + P.tools + '/' + GEN);
  else if (readFileSync(boot, 'utf8') !== want) {
    defects.push('ПН8 ' + P.panel.boot + ' — включатель разошёлся со списком приложений с папкой панели (' + (apps.map((a) => a.rel).join(', ') || 'нет') + '), путём до рантайма и порядком файлов: node ' + P.tools + '/' + GEN);
  }
  return { defects, stats };
}

function statsLine(stats) {
  return 'приложений с панелью: ' + stats.length + (stats.length ? ' — ' + stats.map((s) => s.rel + ' (сценариев ' + s.flows + ', шагов ' + s.steps + ', комментариев: открытых ' + s.open + ')').join('; ') : '');
}

function report(title, { written = [], lines = [], defects = [], stats = null, refused = [] }) {
  const out = ['== ' + title + ' =='];
  for (const w of written) out.push('записан ' + w);
  out.push(...lines);
  if (stats) out.push(statsLine(stats));
  for (const r of refused) out.push('ОТКАЗ  ' + r);
  for (const d of defects) out.push('FAIL  ' + d);
  const bad = defects.length + refused.length;
  out.push('ВЕРДИКТ: ' + (bad ? 'FAIL (' + (refused.length ? 'отказ' : 'дефектов: ' + defects.length) + ')' : 'OK'));
  return out.join('\n');
}

/* ---------------- команды ---------------- */

/** Приложение по пути от корня, от apps/ или по id из app.json. { app } | { error } */
export function resolveApp(P, arg) {
  if (!arg) return { error: 'не названо приложение: путь от корня (' + P.appsDir + '/<раздел>/…), от ' + P.appsDir + '/ или id из ' + P.appsManifest };
  const want = String(arg).replace(/\\/g, '/').replace(/\/+$/, '');
  const apps = P.apps();
  let hit = apps.filter((a) => P.appsDir + '/' + a.dir === want || a.dir === want);
  if (!hit.length) {
    const abs = path.resolve(process.cwd(), arg);
    hit = apps.filter((a) => a.abs === abs);
  }
  if (!hit.length) hit = apps.filter((a) => appMeta(a.abs, P).id === want);
  if (hit.length > 1) return { error: 'id «' + arg + '» не уникален: ' + hit.map((a) => P.appsDir + '/' + a.dir).join(', ') + ' — назовите путь' };
  if (!hit.length) return { error: 'приложение «' + arg + '» не найдено: нужен каталог с ' + P.appsManifest + ' внутри ' + P.appsDir + '/' };
  return { app: decorate(P, hit[0]) };
}

function flowsScaffold(P, a) {
  let page = String(a.meta.home || '').replace(/\\/g, '/');
  if (page.startsWith(P.appShape.pages + '/')) page = page.slice(P.appShape.pages.length + 1);
  if (!page || page.includes('/')) page = path.posix.basename(page) || 'index.html';
  /* стартовая страница модуля — источник с метками <ds-include>: показывают собранную */
  const abs = path.join(a.abs, P.appShape.pages, page);
  const built = page.replace(/\.html?$/i, '.preview.html');
  if (existsSync(abs) && includesOf(readFileSync(abs, 'utf8')).length && existsSync(path.join(a.abs, P.appShape.pages, built))) page = built;
  return '# Сценарии показа прототипа ' + a.meta.title + ' — панель прототипа.\n'
    + '# Формат — ' + P.panel.runtime + '/README.md, раздел «flows.yaml».\n'
    + '# После правки: node ' + P.tools + '/' + GEN + ' (пересобрать зеркало).\n'
    + 'version: 1\n'
    + 'flows:\n'
    + '  - id: main\n'
    + '    title: Основной путь\n'
    + '    steps:\n'
    + '      - id: start\n'
    + '        title: Стартовая страница\n'
    + '        page: ' + page + '\n';
}

export function enable(P, arg) {
  const r = resolveApp(P, arg);
  if (r.error) return { refused: [r.error] };
  const a = r.app;
  if (existsSync(a.panelAbs)) return { refused: ['панель у ' + a.rel + ' уже включена: папка ' + P.rel(a.panelAbs) + '/ есть'] };
  const core = loadCore(P);
  mkdirSync(a.panelAbs, { recursive: true });
  writeFileSync(path.join(a.panelAbs, DATA.flows), flowsScaffold(P, a), 'utf8');
  writeFileSync(path.join(a.panelAbs, DATA.comments), core.emptyComments(), 'utf8');
  const b = build(P);
  return { written: [P.rel(path.join(a.panelAbs, DATA.flows)) + ' (заготовка)', P.rel(path.join(a.panelAbs, DATA.comments)) + ' (заготовка)', ...b.written],
    lines: ['панель включена у ' + a.rel + ': Alt+Shift+P на любой странице прототипа; сценарии — ' + P.rel(path.join(a.panelAbs, DATA.flows))] };
}

function commentLine(c, core) {
  const first = String(c.body).split('\n').find((l) => l.trim()) || '';
  const ctx = [c.page, c.step ? c.step.flow + '/' + c.step.step : null].filter(Boolean).join(' · ');
  const text = first.length > 90 ? first.slice(0, 89) + '…' : first;
  return 'К-' + c.n + '  ' + core.STATUS.word[c.status].padEnd(8) + ' ' + (ctx ? ctx + ' — ' : '') + text;
}

export function disable(P, arg, force) {
  const r = resolveApp(P, arg);
  if (r.error) return { refused: [r.error] };
  const a = r.app;
  if (!existsSync(a.panelAbs)) return { refused: ['панель у ' + a.rel + ' не включена: папки ' + P.rel(a.panelAbs) + '/ нет'] };
  const core = loadCore(P);
  const text = readData(a, DATA.comments);
  const cr = core.parseComments(text || '');
  if (!force && text !== null && (cr.model.comments.length || cr.errors.length)) {
    return { refused: ['в ' + P.rel(path.join(a.panelAbs, DATA.comments)) + ' ' + (cr.model.comments.length ? 'комментариев: ' + cr.model.comments.length : 'формат не читается') + ' — выключение удалит их вместе с папкой. Удалить — --force, только по прямому решению человека'],
      lines: cr.model.comments.map((c) => commentLine(c, core)) };
  }
  rmSync(a.panelAbs, { recursive: true, force: true });
  const b = build(P);
  return { written: b.written, lines: ['панель у ' + a.rel + ' выключена: папка ' + P.rel(a.panelAbs) + '/ удалена'] };
}

export function list(P, arg, onlyOpen) {
  const r = resolveApp(P, arg);
  if (r.error) return { refused: [r.error] };
  const a = r.app;
  if (!existsSync(a.panelAbs)) return { refused: ['панель у ' + a.rel + ' не включена'] };
  const core = loadCore(P);
  const cr = core.parseComments(readData(a, DATA.comments) || '');
  const all = cr.model.comments;
  const shown = onlyOpen ? all.filter((c) => c.status === 'open') : all;
  return { lines: [...shown.map((c) => commentLine(c, core)), 'всего: ' + all.length + ' · открытых: ' + all.filter((c) => c.status === 'open').length],
    defects: cr.errors.map((e) => 'ПН3 ' + P.rel(path.join(a.panelAbs, DATA.comments)) + ':' + e.line + ' — ' + e.text) };
}

function today(d = new Date()) {
  const p = (x) => String(x).padStart(2, '0');
  return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear();
}

export function resolveComment(P, arg, num, statusArg, note) {
  const r = resolveApp(P, arg);
  if (r.error) return { refused: [r.error] };
  const a = r.app;
  const core = loadCore(P);
  const file = path.join(a.panelAbs, DATA.comments);
  if (!existsSync(file)) return { refused: ['у ' + a.rel + ' нет ' + P.rel(file)] };
  const m = /^(?:[КK]-)?(\d+)$/.exec(String(num || '').trim());
  if (!m) return { refused: ['номер комментария — К-<номер>, например К-3'] };
  const n = parseInt(m[1], 10);
  const code = core.STATUS.byWord[String(statusArg || '').toLowerCase()] || (core.STATUS.codes.includes(statusArg) ? statusArg : null);
  if (!code) return { refused: ['--status — сделан, отклонён или открыт'] };
  const cr = core.parseComments(readFileSync(file, 'utf8'));
  if (cr.errors.length) return { refused: ['comments.md не по формату — запись заблокирована, чтобы не затереть файл'], defects: cr.errors.map((e) => 'ПН3 ' + P.rel(file) + ':' + e.line + ' — ' + e.text) };
  const c = cr.model.comments.find((x) => x.n === n);
  if (!c) return { refused: ['К-' + n + ' в ' + P.rel(file) + ' нет'] };
  const was = c.status;
  c.status = code;
  const clean = note ? String(note).replace(/\s*\n\s*/g, ' ').trim() : '';
  c.resolution = code !== 'open' || clean ? today() + (clean ? ' — ' + clean : '') : null;
  writeFileSync(file, core.serializeComments(cr.model), 'utf8');
  const b = build(P);
  return { written: [P.rel(file), ...b.written], lines: ['К-' + n + ': ' + core.STATUS.word[was] + ' → ' + core.STATUS.word[code] + (c.resolution ? '; Решение: ' + c.resolution : '')] };
}

/* ---------------- selftest: откат на временном дереве ---------------- */

function put(root, rel, text) {
  const p = path.join(root, rel);
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, text, 'utf8');
}
const read = (root, rel) => readFileSync(path.join(root, rel), 'utf8');

const MANIFEST = {
  contract: 1, id: 't', designSystem: { mount: 'ds' }, agentKit: { mount: '.kit', tools: '.kit/tools' },
  boot: { dir: 'apps', head: 'apps/ds-config.js', body: 'apps/ds-body.js' },
  hub: { page: 'index.html', registry: 'hub.js' }, apps: { dir: 'apps', manifest: 'app.json' },
  appShape: { pages: 'pages', widgets: 'widgets', data: 'data', refs: 'refs', widgetGroups: ['tiles'] },
  appPlaces: { moduleSuffix: '-app', drafts: 'drafts' }, tracks: [],
  protoPanel: { runtime: '.kit/proto-panel', boot: 'apps/proto-panel.js', dir: 'proto-panel' },
};
const LAB = 'apps/core/drafts/lab';
const PANEL = LAB + '/proto-panel';
const FLOWS = [
  'version: 1',
  'flows:',
  '  - id: main',
  '    title: Основной путь',
  '    steps:',
  '      - id: start',
  '        title: Старт',
  '        page: A.html',
  '        do:',
  "          - click: '#go'",
  "          - waitFor: '[data-x=\"y\"]'",
  '      - id: next',
  '        title: Дальше',
  '        do:',
  "          - click: '#late'",
  "          - waitFor: '#pv:not([hidden])'",
  '',
].join('\n');

function sourceRuntime() {
  const p = project(HERE);
  return p.panel && existsSync(p.panel.runtimeAbs) ? p.panel.runtimeAbs : path.join(HERE, '..', 'proto-panel');
}

function tree(root, runtime) {
  put(root, 'project.json', JSON.stringify(MANIFEST, null, 2));
  put(root, 'ds/ds.css', '');
  put(root, 'ds/styles/x.css', '.is-open { display: block; }\n');
  put(root, 'ds/scripts/ds-x.js', "el.classList.add('is-shown');\n");
  cpSync(runtime, path.join(root, '.kit/proto-panel'), { recursive: true, filter: (s) => !path.basename(s).startsWith('.') });
  put(root, LAB + '/app.json', JSON.stringify({ id: 'lab', track: 'rnd', title: 'Лаборатория', desc: 'т', home: 'pages/A.html', icon: 'folder' }));
  put(root, LAB + '/pages/A.html', '<!DOCTYPE html>\n<button id="go" data-x="y">Пуск</button>\n<aside id="pv" hidden></aside>\n<script src="a.js"></script>\n');
  put(root, LAB + '/pages/a.js', "var late = document.getElementById('late');\n");
  put(root, LAB + '/pages/M.html', '<!DOCTYPE html>\n<ds-include src="../widgets/tiles/T/T.html"></ds-include>\n');
  put(root, LAB + '/pages/M.preview.html', '<!DOCTYPE html>\n<section id="m"></section>\n');
  put(root, 'apps/core/drafts/other/app.json', JSON.stringify({ id: 'other', track: 'rnd', title: 'Другое', home: 'pages/B.html' }));
  put(root, 'apps/core/drafts/other/pages/B.html', '<p>без панели</p>\n');
}

/* Включатель, исполненный на странице по адресу: что записал и что навесил. */
function runBoot(text, scriptSrc, pageHref, frame) {
  const written = [], listeners = [];
  const ctx = {
    URL, decodeURIComponent, encodeURIComponent,
    location: new URL(pageHref),
    document: { currentScript: { src: scriptSrc }, write: (s) => written.push(s), addEventListener: (type, fn, capture) => listeners.push({ type, capture }) },
  };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.top = frame ? {} : ctx;
  ctx.parent = frame ? { postMessage() {} } : ctx;
  vm.runInNewContext(text, ctx, { timeout: 1000 });
  return { written, listeners, panel: ctx.__PROTO_PANEL || null };
}

const CANON = [
  '---', 'type: proto-comments', '---', '',
  '# Комментарии к прототипу', '',
  'Преамбула сохраняется как есть.', '',
  '## К-1 · открыт', '',
  '- Когда: 24.09.2026 14:05', '- Автор: Михаил', '- Страница: A.html', '- Шаг: main/next', '',
  'Поменять подпись кнопки.', '',
  '## К-2 · сделан', '',
  '- Когда: 24.09.2026 14:07', '- Страница: A.html?id=1', '- Решение: 25.09.2026 — поправлено', '',
  'Текст второго.', '', '- пункт', '',
].join('\n');

const P_ = (r) => project(r);
const enableLab = (r) => enable(P_(r), LAB);
const setFlows = (r, text) => { put(r, PANEL + '/flows.yaml', text); build(P_(r)); };
const setComments = (r, text) => { put(r, PANEL + '/comments.md', text); build(P_(r)); };
const flowsWith = (lines) => FLOWS.replace("          - click: '#late'\n", lines);

const CASES = [
  { name: '1 чистое дерево после --enable и сборки', expect: null, setup: (r) => { enableLab(r); setFlows(r, FLOWS); },
    extra: (r) => (build(P_(r)).written.length ? ['повторная сборка что-то записала — не идемпотентна'] : []) },
  { name: '1б --enable: стартовая страница — источник модульной страницы, заготовка ведёт на собранную', expect: null,
    setup: (r) => { put(r, LAB + '/app.json', JSON.stringify({ id: 'lab', track: 'rnd', title: 'Лаборатория', home: 'pages/M.html' })); enableLab(r); },
    extra: (r) => (read(r, PANEL + '/flows.yaml').includes('page: M.preview.html') ? [] : ['в заготовке не M.preview.html']) },
  { name: '1в --enable второй раз — отказ', expect: null, setup: (r) => { enableLab(r); },
    extra: (r) => (enableLab(r).refused ? [] : ['повторное включение не отказано']) },
  { name: '2а YAML: таб в отступе', expect: 'ПН1 ' + PANEL + '/flows.yaml:6', setup: (r) => { enableLab(r); setFlows(r, FLOWS.replace('      - id: start', '\t- id: start')); } },
  { name: '2б YAML: селектор без кавычек', expect: 'ПН1 ' + PANEL + '/flows.yaml:10 — значение начинается с «[»', setup: (r) => { enableLab(r); setFlows(r, FLOWS.replace("- click: '#go'", '- click: [data-x="y"]')); } },
  { name: '2в YAML: якорь', expect: 'ПН1 ' + PANEL + '/flows.yaml:4 — якоря', setup: (r) => { enableLab(r); setFlows(r, FLOWS.replace('title: Основной путь', 'title: &t Основной путь')); } },
  { name: '2г YAML: повтор ключа', expect: 'ПН1 ' + PANEL + '/flows.yaml:8 — ключ «title» повторяется', setup: (r) => { enableLab(r); setFlows(r, FLOWS.replace('        page: A.html', '        title: Ещё раз')); } },
  { name: '3а схема: неизвестный глагол', expect: 'ПН2 ' + PANEL + '/flows.yaml:10 — сценарий main, шаг start, действие 1: неизвестный глагол «clik»', setup: (r) => { enableLab(r); setFlows(r, FLOWS.replace("- click: '#go'", "- clik: '#go'")); } },
  { name: '3б схема: два глагола в действии', expect: 'ПН2 ' + PANEL + '/flows.yaml:10 — сценарий main, шаг start, действие 1: два глагола', setup: (r) => { enableLab(r); setFlows(r, FLOWS.replace("- click: '#go'", "- click: '#go'\n            hover: '#go'")); } },
  { name: '3в схема: нет page у первого шага', expect: 'ПН2 ' + PANEL + '/flows.yaml:6 — сценарий main, шаг start: у первого шага', setup: (r) => { enableLab(r); setFlows(r, FLOWS.replace('        page: A.html\n', '')); } },
  { name: '3г схема: повтор id шага', expect: 'ПН2 ' + PANEL + '/flows.yaml:12 — сценарий main, шаг start: id шага повторяется', setup: (r) => { enableLab(r); setFlows(r, FLOWS.replace('- id: next', '- id: start')); } },
  { name: '3д схема: timeout 20000', expect: 'ПН2 ' + PANEL + '/flows.yaml:12 — сценарий main, шаг start, действие 1, click: timeout 20000', setup: (r) => { enableLab(r); setFlows(r, FLOWS.replace("- click: '#go'", "- click:\n              target: '#go'\n              timeout: 20000")); } },
  { name: '3е схема: опечатка в имени поля', expect: 'ПН2 ' + PANEL + '/flows.yaml:7 — сценарий main, шаг start: неизвестное поле «titel» — может быть, «title»?', setup: (r) => { enableLab(r); setFlows(r, FLOWS.replace('        title: Старт', '        titel: Старт')); } },
  { name: '4а comments.md: заголовок без статуса', expect: 'ПН3 ' + PANEL + '/comments.md:9 — у К-1 нет статуса', setup: (r) => { enableLab(r); setFlows(r, FLOWS); setComments(r, CANON.replace('## К-1 · открыт', '## К-1')); } },
  { name: '4б comments.md: статус «готов»', expect: 'ПН3 ' + PANEL + '/comments.md:9 — у К-1 статус «готов»', setup: (r) => { enableLab(r); setFlows(r, FLOWS); setComments(r, CANON.replace('## К-1 · открыт', '## К-1 · готов')); } },
  { name: '4в comments.md: повтор номера', expect: 'ПН3 ' + PANEL + '/comments.md:18 — номер К-1 повторяется', setup: (r) => { enableLab(r); setFlows(r, FLOWS); setComments(r, CANON.replace('## К-2 · сделан', '## К-1 · сделан')); } },
  { name: '4г comments.md: пустой текст', expect: 'ПН3 ' + PANEL + '/comments.md:9 — у К-1 пустой текст', setup: (r) => { enableLab(r); setFlows(r, FLOWS); setComments(r, CANON.replace('Поменять подпись кнопки.\n', '')); } },
  { name: '4д comments.md: нет шапки', expect: 'ПН3 ' + PANEL + '/comments.md:1 — нет шапки', setup: (r) => { enableLab(r); setFlows(r, FLOWS); setComments(r, CANON.replace('---\ntype: proto-comments\n---\n', '')); } },
  { name: '5а page: нет файла', expect: 'ПН4 ' + PANEL + '/flows.yaml:8 — сценарий main, шаг start: страницы «Z.html» нет', setup: (r) => { enableLab(r); setFlows(r, FLOWS.replace('page: A.html', 'page: Z.html')); } },
  { name: '5б page: путь с ..', expect: 'ПН4 ' + PANEL + '/flows.yaml:8 — сценарий main, шаг start: путь «../x.html»', setup: (r) => { enableLab(r); setFlows(r, FLOWS.replace('page: A.html', 'page: ../x.html')); } },
  { name: '5в page: источник модульной страницы', expect: 'ПН4 ' + PANEL + '/flows.yaml:8 — сценарий main, шаг start: «M.html» — источник модульной страницы', setup: (r) => { enableLab(r); setFlows(r, FLOWS.replace('page: A.html', 'page: M.html')); } },
  { name: '5г page: собранная M.preview.html — не дефект', expect: null, setup: (r) => { enableLab(r); setFlows(r, 'version: 1\nflows:\n  - id: m\n    title: М\n    steps:\n      - id: s\n        title: С\n        page: M.preview.html\n        do:\n          - click: \'#m\'\n'); } },
  { name: '6а селектор: имени нет в разметке', expect: "ПН5 " + PANEL + "/flows.yaml:15 — сценарий main, шаг next, действие 1 (click '#gone'): «gone» не встречается в A.html и её скриптах", setup: (r) => { enableLab(r); setFlows(r, flowsWith("          - click: '#gone'\n")); } },
  { name: '6б селектор: имя только в локальном скрипте и :not() — не дефект', expect: null, setup: (r) => { enableLab(r); setFlows(r, FLOWS); } },
  { name: '6в селектор: класс состояния из ДС — не дефект, чужой класс — дефект', expect: 'ПН5 ' + PANEL + '/flows.yaml:16 — сценарий main, шаг next, действие 2 (waitFor \'#go.is-gone\'): класс «is-gone»',
    setup: (r) => { enableLab(r); setFlows(r, flowsWith("          - click: '#go.is-open'\n          - waitFor: '#go.is-gone'\n")); },
    extra: (r) => (check(P_(r)).defects.some((d) => d.includes('is-open')) ? ['класс из ДС принят за дефект'] : []) },
  { name: '6г селектор не разбирается', expect: 'ПН5 ' + PANEL + '/flows.yaml:15 — сценарий main, шаг next, действие 1 (click \'#go:hovr\'): селектор не разбирается', setup: (r) => { enableLab(r); setFlows(r, flowsWith("          - click: '#go:hovr'\n")); } },
  { name: '7а открытый комментарий на удалённый шаг', expect: 'ПН6 ' + PANEL + '/comments.md:9 — К-1 (открыт): шага «main/next» нет', setup: (r) => { enableLab(r); setFlows(r, FLOWS.replace('- id: next', '- id: later')); setComments(r, CANON); } },
  { name: '7б тот же комментарий сделан — не дефект', expect: null, setup: (r) => { enableLab(r); setFlows(r, FLOWS.replace('- id: next', '- id: later')); setComments(r, CANON.replace('## К-1 · открыт', '## К-1 · сделан')); } },
  { name: '8а зеркало правлено руками', expect: 'ПН7 ' + PANEL + '/panel-data.js — зеркало разошлось', setup: (r) => { enableLab(r); setFlows(r, FLOWS); put(r, PANEL + '/panel-data.js', read(r, PANEL + '/panel-data.js') + '// правка\n'); } },
  { name: '8б flows.yaml изменён без сборки', expect: 'ПН7 ' + PANEL + '/panel-data.js — зеркало разошлось', setup: (r) => { enableLab(r); setFlows(r, FLOWS); put(r, PANEL + '/flows.yaml', FLOWS.replace('Старт', 'Начало')); } },
  { name: '8в после сборки — чисто', expect: null, setup: (r) => { enableLab(r); setFlows(r, FLOWS); put(r, PANEL + '/flows.yaml', FLOWS.replace('Старт', 'Начало')); build(P_(r)); } },
  { name: '9а папку панели удалили без сборки', expect: 'ПН8 apps/proto-panel.js — включатель разошёлся', setup: (r) => { enableLab(r); setFlows(r, FLOWS); rmSync(path.join(r, PANEL), { recursive: true }); } },
  { name: '9б после сборки — чисто', expect: null, setup: (r) => { enableLab(r); setFlows(r, FLOWS); rmSync(path.join(r, PANEL), { recursive: true }); build(P_(r)); } },
  { name: '10 посторонний файл в папке панели', expect: 'ПН9 ' + PANEL + '/notes.txt — посторонний файл', setup: (r) => { enableLab(r); setFlows(r, FLOWS); put(r, PANEL + '/notes.txt', 'x'); } },
  { name: '11 panel.css: литерал цвета, px, чужой селектор', expect: ['ПН10 .kit/proto-panel/panel.css', '«#fff»', '«13px»', 'селектор «.drawer»'],
    setup: (r) => { enableLab(r); setFlows(r, FLOWS); put(r, '.kit/proto-panel/panel.css', read(r, '.kit/proto-panel/panel.css') + '\n.drawer { color: #fff; padding: 13px; }\n@media (max-width: 640px) { .pp-x { border: 1px solid var(--border-light); } }\n'); } },
  { name: '11б рантайм зовёт глобальную закрывашку слоёв ДС', expect: ['ПН10 .kit/proto-panel/ui.js:', '«DSMenu.closeAll(…)» закрывает слои всей страницы'],
    setup: (r) => { enableLab(r); setFlows(r, FLOWS); put(r, '.kit/proto-panel/ui.js', read(r, '.kit/proto-panel/ui.js') + '\nfunction x() { window.DSMenu.closeAll(); }\n/* DSTooltip.hideAll() в комментарии — не вызов */\n'); },
    extra: (r) => (check(P_(r)).defects.some((d) => d.includes('hideAll')) ? ['вызов в комментарии принят за дефект'] : []) },
];

/* ---------------- рантайм в vm: регрессии код-ревью 0005 (R1–R6) ---------------- */

function fakeStorage() {
  const m = new Map();
  return {
    setItem(k, v) { m.set(k, String(v)); },
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    removeItem(k) { m.delete(k); },
  };
}

/* Хранилище, отказавшее на ходу: стартовая проба проходит, дальше setItem падает (R5). */
function leakyStorage() {
  const base = fakeStorage();
  let broken = false;
  return {
    breakNow() { broken = true; },
    setItem(k, v) {
      if (broken && k !== 'pp.probe') { const e = new Error('квота'); e.name = 'QuotaExceededError'; throw e; }
      base.setItem(k, v);
    },
    getItem: (k) => base.getItem(k),
    removeItem(k) { base.removeItem(k); },
  };
}

/* Web Locks в памяти: исключительная блокировка по имени с очередью — как в браузере (R1). */
function fakeLocks() {
  const tails = new Map();
  return {
    request(name, _opts, fn) {
      const prev = tails.get(name) || Promise.resolve();
      let release;
      const gate = new Promise((r) => { release = r; });
      tails.set(name, prev.then(() => gate));
      return prev.then(() => Promise.resolve(fn()).then(
        (v) => { release(); return v; },
        (e) => { release(); throw e; },
      ));
    },
  };
}

/* Папка панели как FileSystemDirectoryHandle: Map «имя → текст» и хуки проверок.
   Разрешение (requestPermission, queryPermission) — выдано: так выглядит папка,
   на которую человек только что нажал «Разрешить». */
function fakeDir(files, hooks = {}) {
  return {
    name: 'proto-panel',
    queryPermission: () => Promise.resolve('granted'),
    requestPermission: () => Promise.resolve('granted'),
    getFileHandle(name, opts) {
      if (!files.has(name)) {
        if (!(opts && opts.create)) return Promise.reject(Object.assign(new Error('нет файла ' + name), { name: 'NotFoundError' }));
        files.set(name, '');
      }
      return Promise.resolve({
        name,
        getFile: () => Promise.resolve({ name, text: () => { if (hooks.afterRead) hooks.afterRead(name); return Promise.resolve(files.get(name)); } }),
        createWritable() {
          if (hooks.failWrite && hooks.failWrite(name)) return Promise.reject(new Error('запись ' + name + ' запрещена хуком'));
          let buf = '';
          return Promise.resolve({
            write: (t) => { buf += t; return Promise.resolve(); },
            close: () => { if (hooks.beforeClose) hooks.beforeClose(name, files); files.set(name, buf); return Promise.resolve(); },
          });
        },
      });
    },
    getDirectoryHandle() { return Promise.reject(Object.assign(new Error('нет папки'), { name: 'NotFoundError' })); },
  };
}

/* IndexedDB в памяти — ровно то, что зовёт store.js: open → transaction → get / put / delete. */
function fakeIdb(data = new Map()) {
  const later = (fn) => setTimeout(fn, 0);
  return {
    data,
    open() {
      const r = {};
      later(() => {
        r.result = {
          close() {},
          transaction() {
            const tx = {};
            const done = () => later(() => tx.oncomplete && tx.oncomplete());
            tx.objectStore = () => ({
              get(k) { const q = { result: data.get(k) }; done(); return q; },
              put(v, k) { data.set(k, v); done(); return {}; },
              delete(k) { data.delete(k); done(); return {}; },
            });
            return tx;
          },
        };
        if (r.onsuccess) r.onsuccess();
      });
      return r;
    },
  };
}

/* Страница приложения в vm: загружается core.js + store.js (+ runner.js / tab-comments.js).
   idb — хранилище хендлов для старта init(); с ним же страница «умеет» выбор папки. */
function pageEnv({ files, locks, href, storage, session, idb }) {
  const listeners = {};
  const ctx = {
    URL, console: { log() {}, warn() {} },
    setTimeout, clearTimeout,
    localStorage: storage || fakeStorage(),
    sessionStorage: session || fakeStorage(),
    location: new URL(href),
    history: { replaceState() {} },
    addEventListener() {},
    document: {
      addEventListener(type, fn) { (listeners[type] = listeners[type] || []).push(fn); },
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
      createElement: () => ({ style: {}, setAttribute() {}, remove() {}, click() {} }),
      body: { appendChild() {} },
    },
    navigator: locks ? { locks } : {},
    performance: { now: () => Date.now() },
    requestAnimationFrame: (fn) => setTimeout(fn, 0),
  };
  if (idb) { ctx.indexedDB = idb; ctx.showDirectoryPicker = () => Promise.reject(Object.assign(new Error('отмена'), { name: 'AbortError' })); }
  ctx.window = ctx; ctx.self = ctx; ctx.top = ctx; ctx.parent = ctx;
  ctx.__PROTO_PANEL = { app: 'core/drafts/lab', dir: 'proto-panel', base: 'apps', manifest: 'app.json',
    appUrl: 'file:///proj/apps/core/drafts/lab/', pagesUrl: 'file:///proj/apps/core/drafts/lab/pages/', runtimeUrl: 'file:///proj/.kit/proto-panel/' };
  ctx.__ppListeners = listeners;
  return ctx;
}

function loadRuntime(ctx, runtime, names) {
  for (const n of names) vm.runInNewContext(readFileSync(path.join(runtime, n), 'utf8'), ctx, { timeout: 5000 });
  return ctx.window.ProtoPanel;
}

const panelFiles = (core) => new Map([['flows.yaml', ''], ['comments.md', core.emptyComments()]]);

async function selftest() {
  const out = ['== ' + GEN + ' --selftest =='];
  let failed = 0, total = 0;
  const runtime = sourceRuntime();
  const pass = (ok, name, why) => { total++; if (!ok) failed++; out.push((ok ? 'ok    ' : 'FAIL  ') + name + (why ? ' — ' + why : '')); };
  if (!existsSync(path.join(runtime, 'core.js'))) {
    out.push('FAIL  рантайм панели не найден: ' + runtime);
    out.push('ВЕРДИКТ: FAIL (кейсов не прошло: 1 из 1)');
    console.log(out.join('\n'));
    process.exit(1);
  }
  const withTree = (fn) => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'proto-panel-'));
    try { tree(root, runtime); return fn(root); } finally { rmSync(root, { recursive: true, force: true }); }
  };
  for (const c of CASES) {
    withTree((r) => {
      c.setup(r);
      const { defects } = check(P_(r));
      const want = Array.isArray(c.expect) ? c.expect : c.expect ? [c.expect] : [];
      let ok = c.expect === null ? defects.length === 0 : want.every((w) => defects.some((d) => d.includes(w)));
      const why = [];
      if (c.extra) why.push(...c.extra(r));
      if (why.length) ok = false;
      pass(ok, c.name, [...why, defects.length ? defects.join(' | ') : 'дефектов нет'].join('; '));
    });
  }

  /* 12. Генерат исполняется: правильность зеркала и включателя доказывается
     исполнением, а не сравнением с генератором (урок Л128). */
  withTree((r) => {
    enableLab(r);
    setFlows(r, FLOWS);
    setComments(r, CANON);
    const P = P_(r);
    const core = loadCore(P);
    const text = read(r, PANEL + '/panel-data.js');
    const ctx = { window: {} };
    vm.runInNewContext(text, ctx, { timeout: 1000 });
    const model = core.mirrorData({ app: { id: 'lab', title: 'Лаборатория' }, flowsText: read(r, PANEL + '/flows.yaml'), commentsText: read(r, PANEL + '/comments.md') });
    const json = text.slice(text.indexOf('window.ProtoPanelData'));
    pass(JSON.stringify(ctx.window.ProtoPanelData) === JSON.stringify(model) && ctx.window.ProtoPanelData.flows.length === 1 && ctx.window.ProtoPanelData.comments.length === 2,
      '12а зеркало в vm даёт window.ProtoPanelData, равный модели');
    pass(!/[^\x00-\x7e]/.test(json), '12б в данных зеркала не-ASCII экранирован');
    const boot = renderBoot(P, ['core/drafts/lab', 'core/drafts/лаб 2'], core);
    const base = 'file:///%D0%9C%D0%BE%D0%B9%20%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82/';
    const src = base + 'apps/proto-panel.js';
    const page = runBoot(boot, src, base + 'apps/core/drafts/lab/pages/A.html', false);
    pass(page.written.length === 2 + FILES.length && page.written[0].includes('panel.css') && page.written[1].includes('apps/core/drafts/lab/proto-panel/panel-data.js')
      && page.written[2 + FILES.length - 1].includes('/.kit/proto-panel/panel.js') && page.panel && page.panel.app === 'core/drafts/lab' && !page.listeners.length,
      '12в включатель: страница приложения с панелью — стили, зеркало и рантайм по порядку', page.written.length + ' тегов');
    const other = runBoot(boot, src, base + 'apps/core/drafts/other/pages/B.html', false);
    pass(!other.written.length && !other.listeners.length && !other.panel, '12г включатель: приложение без панели — ничего');
    const frame = runBoot(boot, src, base + 'apps/core/drafts/lab/pages/A.html', true);
    pass(!frame.written.length && frame.listeners.length === 1 && frame.listeners[0].type === 'keydown' && frame.listeners[0].capture === true && !frame.panel,
      '12д включатель: фрейм приложения с панелью — только пересылка клавиш');
    const hub = runBoot(boot, src, base + 'index.html', false);
    pass(!hub.written.length && !hub.listeners.length, '12е включатель: хаб — ничего');
    const cyr = runBoot(boot, src, base + 'apps/core/drafts/%D0%BB%D0%B0%D0%B1%202/pages/A.html', false);
    pass(cyr.written.length === 2 + FILES.length && cyr.written[1].includes('apps/core/drafts/%D0%BB%D0%B0%D0%B1%202/proto-panel/panel-data.js') && cyr.panel && cyr.panel.app === 'core/drafts/лаб 2',
      '12ж включатель: путь с пробелом и кириллицей — теги с адресом приложения', cyr.written[1] || 'тегов нет');
    const empty = runBoot(renderBoot(P, [], core), src, base + 'apps/core/drafts/lab/pages/A.html', false);
    pass(!empty.written.length && !empty.listeners.length, '12з включатель без приложений — ничего');
    let parsed = 0;
    for (const t of [boot, renderBoot(P, [], core), text]) { try { new Function(t); parsed++; } catch { /* ниже */ } }
    pass(parsed === 3, '12и генераты разбираются как JS');
  });

  /* 13. comments.md по кругу. */
  withTree((r) => {
    const core = loadCore(P_(r));
    const p = core.parseComments(CANON);
    pass(!p.errors.length && core.serializeComments(p.model) === CANON, '13а serialize(parse(x)) === x на каноническом файле', p.errors.map((e) => e.text).join(' | '));
    pass(p.model.preamble === '# Комментарии к прототипу\n\nПреамбула сохраняется как есть.', '13б преамбула сохраняется');
    pass(core.serializeComments(core.parseComments(CANON.replace(/\n/g, '\r\n')).model) === CANON, '13в CRLF читается, пишется LF');
    const m = core.parseComments(CANON).model;
    m.comments[0].body = '## Раздел\nтекст\n```\n## в коде\n```';
    const out2 = core.serializeComments(m);
    pass(out2.includes('\n### Раздел\n') && out2.includes('\n## в коде\n') && core.parseComments(out2).errors.length === 0, '13г заголовок внутри текста понижается до ###, в блоке кода — нет');
    pass(core.serializeComments(core.parseComments(core.emptyComments()).model) === core.emptyComments(), '13д пустой файл-заготовка устойчив');
  });

  /* 14. Подмножество YAML разбирается верно. */
  withTree((r) => {
    const core = loadCore(P_(r));
    const y = core.parseYaml([
      "a: 'кавычки # не комментарий'  # хвост",
      'b: "двойные \\"#\\" \\u0041"',
      'c: |',
      '  строка 1',
      '  # тоже текст',
      '',
      '  строка 3',
      'd: 42',
      'e: -1',
      'f: true',
      'g: false',
      'h: простой # хвост',
      'i: ~',
      'list:',
      '- x',
      '- k: v',
      '  k2: v2',
      'empty:',
      '',
    ].join('\n'));
    const v = core.yamlPlain(y.node);
    const want = { a: 'кавычки # не комментарий', b: 'двойные "#" A', c: 'строка 1\n# тоже текст\n\nстрока 3\n', d: 42, e: -1, f: true, g: false, h: 'простой', i: null, list: ['x', { k: 'v', k2: 'v2' }], empty: null };
    pass(!y.error && JSON.stringify(v) === JSON.stringify(want), '14а кавычки, блок «|», числа, логические, хвостовые комментарии', y.error ? y.error.text : JSON.stringify(v));
    const f = core.readFlows('version: 1\nflows:\n');
    pass(!f.errors.length && f.flows.length === 0, '14б пустой список flows: разбирается');
    const s = core.readFlows("version: 1\nflows:\n  - id: a\n    title: 2025\n    steps:\n      - id: s\n        title: S\n        page: A.html\n        note: |-\n          тезис\n");
    pass(!s.errors.length && s.flows[0].title === '2025' && s.flows[0].steps[0].note === 'тезис', '14в число в title приводится к строке, «|-» без перевода строки');
  });

  /* 15–17. Команды. */
  withTree((r) => {
    enableLab(r);
    setFlows(r, FLOWS);
    setComments(r, CANON);
    const res = resolveComment(P_(r), 'lab', 'К-1', 'сделан', 'подпись поправлена');
    const text = read(r, PANEL + '/comments.md');
    const ok = !res.refused && text.includes('## К-1 · сделан') && /- Решение: \d{2}\.\d{2}\.\d{4} — подпись поправлена/.test(text) && check(P_(r)).defects.length === 0;
    pass(ok, '15 --resolve меняет статус, пишет «Решение», пересобирает зеркало', (res.refused || []).join(' | '));
  });
  withTree((r) => {
    enableLab(r);
    setComments(r, CANON);
    const refused = disable(P_(r), LAB, false);
    const kept = existsSync(path.join(r, PANEL));
    setComments(r, core0(r).emptyComments());
    const done = disable(P_(r), LAB, false);
    const gone = !existsSync(path.join(r, PANEL)) && !read(r, 'apps/proto-panel.js').includes('core/drafts/lab');
    pass(!!refused.refused && kept && !done.refused && gone, '16 --disable: при комментариях без --force — отказ, без комментариев — папки нет, включатель пересобран');
  });
  withTree((r) => {
    enableLab(r);
    setFlows(r, FLOWS);
    setComments(r, CANON);
    const res = list(P_(r), 'lab', true);
    pass(res.lines.length === 2 && res.lines[0].startsWith('К-1') && !res.lines.some((l) => l.startsWith('К-2')), '17 --list --open печатает только открытые', res.lines.join(' | '));
  });

  /* 18. Регрессии код-ревью 0005 (docs/tasks/0005-code-review.md):
        конкурентная запись, границы комментариев, зеркало после сохранения,
        адрес шага в новом документе, отказ хранилища, контекст недописанного
        комментария. Рантайм исполняется в vm на поддельных папке, блокировках
        и хранилищах — без браузера. */
  {
    const core18 = req(path.join(runtime, 'core.js'));
    const A = 'file:///proj/apps/core/drafts/lab/pages/A.html';
    const link = async (ctx, files, hooks) => {
      await loadRuntime(ctx, runtime, ['core.js', 'store.js'])._store.linkHandle(fakeDir(files, hooks));
      return ctx.window.ProtoPanel._store;
    };

    /* R1а: add/add из двух «вкладок» с общей папкой и общими блокировками */
    const filesA = panelFiles(core18);
    const locks = fakeLocks();
    const s1 = await link(pageEnv({ files: filesA, locks, href: A }), filesA);
    const s2 = await link(pageEnv({ files: filesA, locks, href: A }), filesA);
    const [a1, a2] = await Promise.all([
      s1.save([{ op: 'add', text: 'From tab A' }]),
      s2.save([{ op: 'add', text: 'From tab B' }]),
    ]);
    const pa = core18.parseComments(filesA.get('comments.md'));
    pass(!pa.errors.length && pa.model.comments.length === 2 && a1.length === 1 && a2.length === 1
      && pa.model.comments.some((c) => c.body === 'From tab A') && pa.model.comments.some((c) => c.body === 'From tab B'),
      '18а R1: параллельные add/add из двух экземпляров — обе записи на диске', pa.errors.map((e) => e.text).join(' | '));

    /* R1б: add/status из двух экземпляров — порядок не важен, обе операции живут */
    const filesB = panelFiles(core18);
    const mB = core18.parseComments(core18.emptyComments()).model;
    mB.comments.push({ n: 1, status: 'open', created: '24.09.2026 10:00', author: null, page: 'A.html', step: null, resolution: null, body: 'Первый' });
    filesB.set('comments.md', core18.serializeComments(mB));
    const s3 = await link(pageEnv({ files: filesB, locks, href: A }), filesB);
    const s4 = await link(pageEnv({ files: filesB, locks, href: A }), filesB);
    await Promise.all([
      s3.save([{ op: 'add', text: 'Добавка' }]),
      s4.save([{ op: 'status', n: 1, status: 'done', resolution: 'готово' }]),
    ]);
    const pb = core18.parseComments(filesB.get('comments.md'));
    pass(!pb.errors.length && pb.model.comments.length === 2 && pb.model.comments[0].status === 'done' && pb.model.comments[1].body === 'Добавка',
      '18б R1: параллельные add/status — оба применились');

    /* R1в: без блокировок, но одна страница — пишет очередь, а не гонка */
    const filesC = panelFiles(core18);
    const s5 = await link(pageEnv({ files: filesC, href: A }), filesC);
    await Promise.all([
      s5.save([{ op: 'add', text: 'Первый в очереди' }]),
      s5.save([{ op: 'add', text: 'Второй в очереди' }]),
    ]);
    const pc = core18.parseComments(filesC.get('comments.md'));
    pass(!pc.errors.length && pc.model.comments.length === 2
      && pc.model.comments.some((c) => c.body === 'Первый в очереди') && pc.model.comments.some((c) => c.body === 'Второй в очереди'),
      '18в R1: два одновременных save в одной странице идут по очереди');

    /* R1г: внешний редактор правит файл между чтением и записью — слияние, не потеря */
    const filesD = panelFiles(core18);
    const mD = core18.parseComments(core18.emptyComments()).model;
    mD.comments.push({ n: 1, status: 'open', created: '24.09.2026 10:05', author: 'агент', page: null, step: null, resolution: null, body: 'Из редактора' });
    const extText = core18.serializeComments(mD);
    let arm = false, seen = 0;
    const s6 = await link(pageEnv({ files: filesD, href: A }), filesD, { afterRead: (name) => {
      if (name !== 'comments.md' || !arm) return;
      seen++;
      if (seen === 2) filesD.set('comments.md', extText);   // между чтением и контрольным чтением
    } });
    arm = true;
    await s6.save([{ op: 'add', text: 'После правки' }]);
    const pd = core18.parseComments(filesD.get('comments.md'));
    pass(!pd.errors.length && pd.model.comments.length === 2
      && pd.model.comments.some((c) => c.body === 'Из редактора') && pd.model.comments.some((c) => c.body === 'После правки'),
      '18г R1: внешняя правка между чтением и записью сливается, а не затирается');

    /* R3: сбой записи зеркала после записи комментария — один комментарий и без дубля на повторе */
    const filesE = panelFiles(core18);
    let mirrorBroken = true;
    const s7 = await link(pageEnv({ files: filesE, href: A }), filesE, { failWrite: (name) => name === 'panel-data.js' && mirrorBroken });
    s7.addDraft('Retry me');
    const n7 = await s7.flushDrafts();
    const pe = core18.parseComments(filesE.get('comments.md'));
    pass(n7 === 1 && !pe.errors.length && pe.model.comments.length === 1 && pe.model.comments[0].body === 'Retry me'
      && s7.drafts().length === 0 && !!s7.state.mirrorError,
      '18д R3: зеркало не записалось — комментарий сохранён, черновик снят, ошибка видна');
    mirrorBroken = false;
    await s7.refresh();
    const pe2 = core18.parseComments(filesE.get('comments.md'));
    const mirrorE = core18.mirrorText({ app: { id: 'lab', title: 'lab' }, flowsText: filesE.get('flows.yaml'), commentsText: filesE.get('comments.md') });
    pass(pe2.model.comments.length === 1 && !s7.state.mirrorError && filesE.get('panel-data.js') === mirrorE,
      '18е R3: «Перечитать с диска» пересобирает зеркало байт в байт — комментарий один, предупреждение снято');

    /* R5: хранилище отказало после старта — черновики читаются и удаляются */
    const ls = leakyStorage();
    const c8 = pageEnv({ files: panelFiles(core18), href: A, storage: ls });
    loadRuntime(c8, runtime, ['core.js', 'store.js']);
    const s8 = c8.window.ProtoPanel._store;
    ls.breakNow();
    const id8 = s8.addDraft('Do not lose me');
    const kept = !!id8 && s8.drafts().length === 1 && s8.drafts()[0].text === 'Do not lose me' && s8.draftsVolatile();
    s8.removeDraft(id8);
    pass(s8.local.usable === true && kept && s8.drafts().length === 0,
      '18ж R5: после отказа хранилища черновик живёт в памяти — читается и удаляется');

    /* R4: адрес шага в новом документе проигрывает путь с точки входа;
       в живом документе приращение без перезагрузки сохраняется */
    const filesF = panelFiles(core18);
    const sessionF = fakeStorage();
    const c9 = pageEnv({ files: filesF, href: A + '#pp=demo%2Fready', session: sessionF });
    const s9 = await link(c9, filesF);
    c9.window.ProtoPanelData = Object.assign({}, c9.window.ProtoPanelData, { flows: [{ id: 'demo', title: 'Демо', steps: [
      { id: 'entry', title: 'Вход', page: 'A.html', note: null, do: [] },
      { id: 'ready', title: 'Готово', page: null, note: null, do: [{ verb: 'wait', ms: 1 }] },
    ] }] });
    sessionF.setItem('pp.state:core/drafts/lab', JSON.stringify({ flow: 'demo', step: 'ready', dirty: false, error: null }));
    c9.window.ProtoPanel._ui = { releasePage: () => Promise.resolve(), open() {}, close() {} };
    loadRuntime(c9, runtime, ['runner.js']);
    const r9 = c9.window.ProtoPanel._runner;
    await r9.resume();
    const l9 = r9.lastRun();
    pass(!!l9 && l9.ok === true && l9.from === 0 && l9.to === 1, '18з R4: новый документ по адресу шага — путь с точки входа', l9 ? '' : 'прогона нет');
    sessionF.setItem('pp.state:core/drafts/lab', JSON.stringify({ flow: 'demo', step: 'entry', dirty: false, error: null }));
    await r9.goTo('demo', 'ready');
    const l10 = r9.lastRun();
    pass(!!l10 && l10.ok === true && l10.from === 1, '18и R4: живой документ — приращение от текущего шага');

    /* R6: контекст недописанного комментария фиксируется при вводе */
    const filesG = panelFiles(core18);
    const c10 = pageEnv({ files: filesG, href: A });
    const s10 = await link(c10, filesG);
    c10.window.ProtoPanel._ui = { esc: (x) => String(x), refresh() {}, toast() {}, confirm: () => Promise.resolve(false), hideFloating() {}, wire() {} };
    let stepNow = null;
    c10.window.ProtoPanel._runner = { current: () => stepNow, flowById: () => null, stepIdx: () => -1 };
    c10.window.ProtoPanel.tab = (d) => d;
    loadRuntime(c10, runtime, ['tab-comments.js']);
    (c10.__ppListeners.input || []).forEach((fn) => fn({ target: { id: 'pp-new-text', value: 'Fix page A' } }));
    c10.location = new URL('file:///proj/apps/core/drafts/lab/pages/B.html');
    stepNow = { flow: 'demo', step: 'b-step', dirty: false, error: null };
    const f10 = c10.window.ProtoPanel._comments.form();
    pass(f10.text === 'Fix page A' && f10.page === 'A.html' && f10.step === null,
      '18к R6: набранный комментарий не перезаписывается страницей и шагом другого экрана', JSON.stringify(f10));
    s10.setUi({ form: { text: 'старое', custom: false } });
    const f11 = c10.window.ProtoPanel._comments.form();
    pass(f11.page === 'B.html', '18л R6: форма без зафиксированного контекста берёт текущую страницу');
    c10.window.ProtoPanel._comments.setContext({ page: 'C.html', step: { flow: 'demo', step: 'entry' } });
    const f12 = c10.window.ProtoPanel._comments.form();
    pass(f12.custom === true && f12.page === 'C.html' && f12.step && f12.step.flow === 'demo', '18м R6: «Комментировать шаг» фиксирует выбранный контекст');

    /* R2: незакрытый блок кода — границы записей целы; битый файл — ошибка разбора */
    const mR2 = core18.parseComments(core18.emptyComments()).model;
    mR2.comments.push({ n: 1, status: 'open', created: '24.09.2026 10:00', author: null, page: 'A.html', step: null, resolution: null, body: 'Пример\n```js\nconst x = 1;' });
    mR2.comments.push({ n: 2, status: 'open', created: '24.09.2026 10:01', author: null, page: null, step: null, resolution: null, body: 'Второй комментарий' });
    const outR2 = core18.serializeComments(mR2);
    const backR2 = core18.parseComments(outR2);
    pass(!backR2.errors.length && backR2.model.comments.length === 2
      && backR2.model.comments[0].body.endsWith('```') && backR2.model.comments[1].body === 'Второй комментарий',
      '18н R2: незакрытый блок кода закрывается при записи — соседний комментарий цел');
    const pR2 = core18.parseComments(outR2.replace('\n```\n\n## К-2', '\n\n## К-2'));
    pass(pR2.errors.length === 1 && pR2.errors[0].text.includes('не закрыт'),
      '18о R2: файл с незакрытым блоком — диагностируемая ошибка, не тихая усечённая модель', pR2.errors.map((e) => e.text).join(' | '));

    /* 19. Регрессии повторного ревью 0005 (R7–R13): исправления R1–R6 проверяются
          на собственных границах — запись изнутри очереди, ввод, который запись
          нормализует, сбой после записи, хранилище, закрытое со старта, контекст
          формы, номера повтора, общие черновики вкладок. */
    const within = (p, ms) => Promise.race([p.then((v) => ({ done: true, v }), (e) => ({ done: true, error: e && e.message || String(e) })),
      new Promise((r) => setTimeout(() => r({ done: false }), ms))]);
    const until = async (fn, ms = 2000) => {
      const t0 = Date.now();
      while (!fn()) { if (Date.now() - t0 > ms) return false; await new Promise((r) => setTimeout(r, 5)); }
      return true;
    };
    const bodies = (files) => core18.parseComments(files.get('comments.md')).model.comments.map((c) => c.body);
    const commentWith = (n, body) => ({ n, status: 'open', created: '24.09.2026 10:00', author: null, page: null, step: null, resolution: null, body });
    const fileWith = (list) => { const m = core18.parseComments(core18.emptyComments()).model; m.comments.push(...list); return core18.serializeComments(m); };
    const stubUi = (PPx, current) => {
      PPx._ui = { esc: (x) => String(x), refresh() {}, toast() {}, updateAlert() {}, confirm: () => Promise.resolve(false), hideFloating() {}, wire() {} };
      PPx._runner = { current: () => current, flowById: () => null, stepIdx: () => -1 };
      PPx.tab = (d) => d;
    };

    /* R7: «нужно разрешение» + черновик — запись не ждёт сама себя */
    const filesH = panelFiles(core18);
    const sH = loadRuntime(pageEnv({ files: filesH, href: A }), runtime, ['core.js', 'store.js'])._store;
    sH.addDraft('Черновик до разрешения');
    sH.state.status = 'needs-permission';
    sH.state.saved = { handle: fakeDir(filesH), key: 'app:core/drafts/lab' };
    const rH = await within(sH.save([{ op: 'add', text: 'После разрешения' }]), 3000);
    const rH2 = rH.done ? await within(sH.save([{ op: 'add', text: 'Следом' }]), 3000) : { done: false };
    const bH = bodies(filesH);
    pass(rH.done && !rH.error && rH2.done && !rH2.error && sH.status() === 'linked' && sH.drafts().length === 0
      && bH.length === 3 && ['После разрешения', 'Черновик до разрешения', 'Следом'].every((t) => bH.includes(t)),
      '19а R7: запись в статусе «нужно разрешение» при черновике завершается — на диске она, черновик и следующая запись',
      JSON.stringify(rH) + ' · ' + JSON.stringify(bH));

    /* R8: запись нормализует текст — контроль сверяет с канонической формой */
    const filesI = panelFiles(core18);
    filesI.set('comments.md', fileWith([commentWith(1, 'Правки агента')]).replace('Правки агента', '# Правки агента\nпункт'));
    const cleanI = core18.parseComments(filesI.get('comments.md')).errors.length === 0;
    const sI = await link(pageEnv({ files: filesI, href: A }), filesI);
    const rI = [];
    for (const text of ['## Раздел\nтекст', 'Пример\n```js\nconst x = 1;']) rI.push(await within(sI.save([{ op: 'add', text }]), 2000));
    rI.push(await within(sI.save([{ op: 'status', n: 1, status: 'done' }]), 2000));
    rI.push(await within(sI.save([{ op: 'edit', n: 2, text: 'Раздел поправлен\n' }]), 2000));
    const pI = core18.parseComments(filesI.get('comments.md'));
    pass(cleanI && rI.every((r) => r.done && !r.error) && !pI.errors.length && pI.model.comments.length === 3
      && pI.model.comments[0].status === 'done' && pI.model.comments[0].body.startsWith('### Правки агента')
      && pI.model.comments[1].body === 'Раздел поправлен' && pI.model.comments[2].body.endsWith('```'),
      '19б R8: заголовки, незакрытый блок, чужой «# …» (ПН3 молчит) и перевод строки в конце — запись идёт в канонической форме',
      rI.filter((r) => r.error || !r.done).map((r) => r.error || 'не завершена').join(' | '));

    /* R8: старт с черновиком-заголовком — папка подключена, черновик записан;
       сбой записи черновиков (сломанный comments.md) папку не отключает */
    const filesJ = panelFiles(core18);
    const lsJ = fakeStorage();
    const idbJ = fakeIdb();
    idbJ.data.set('app:core/drafts/lab', fakeDir(filesJ));
    const pageJ = () => loadRuntime(pageEnv({ files: filesJ, href: A, storage: lsJ, idb: idbJ }), runtime, ['core.js', 'store.js'])._store;
    const sJ0 = pageJ();
    sJ0.addDraft('## Что поправить\nкнопка');
    sJ0.addDraft('обычный черновик');
    const sJ = pageJ();
    const stJ = await sJ.init();
    const okJ = stJ === 'linked' && sJ.drafts().length === 0 && bodies(filesJ).length === 2 && bodies(filesJ)[0].startsWith('### Что поправить');
    filesJ.set('comments.md', 'файл без шапки\n');
    sJ.addDraft('ещё черновик');
    const sJ2 = pageJ();
    const stJ2 = await sJ2.init();
    pass(okJ && stJ2 === 'linked' && sJ2.drafts().length === 1 && /не по формату/.test(sJ2.state.error || ''),
      '19в R8: старт с черновиком-заголовком — папка подключена, черновик записан; сломанный comments.md — папка подключена, черновик ждёт, ошибка видна',
      'старт 1: ' + stJ + ', старт 2: ' + stJ2 + ', ошибка: ' + sJ2.state.error);

    /* R9: flows.yaml не прочитался после записи comments.md — сохранение состоялось */
    const filesK = panelFiles(core18);
    let breakFlows = false;
    const sK = await link(pageEnv({ files: filesK, href: A }), filesK, { afterRead: (name) => {
      if (name === 'flows.yaml' && breakFlows) { breakFlows = false; throw Object.assign(new Error('файл занят'), { name: 'NotReadableError' }); }
    } });
    breakFlows = true;
    const rK = await within(sK.save([{ op: 'add', text: 'Один раз' }]), 2000);
    const memK = (sK.data() && sK.data().comments || []).map((c) => c.body);
    pass(rK.done && !rK.error && rK.v[0] === 1 && bodies(filesK).length === 1 && /flows\.yaml не прочитан/.test(sK.state.mirrorError || '') && memK.length === 1,
      '19г R9: flows.yaml не прочитался после записи — сохранение состоялось, зеркало — предупреждением, данные в памяти обновлены',
      JSON.stringify(rK) + ' · ' + sK.state.mirrorError);

    /* R9: запись не подтвердилась (контрольное чтение падает) — интерфейс делает
       черновик с подписью операции, повтор узнаёт комментарий на диске */
    const filesL = panelFiles(core18);
    let failVerify = false, readsL = 0;
    const cL = pageEnv({ files: filesL, href: A });
    const sL = await link(cL, filesL, { afterRead: (name) => {
      if (name !== 'comments.md' || !failVerify) return;
      if (++readsL % 3 === 0) throw Object.assign(new Error('файл занят'), { name: 'NotReadableError' });   // каждое третье чтение попытки — контрольное
    } });
    stubUi(cL.window.ProtoPanel, null);
    loadRuntime(cL, runtime, ['tab-comments.js']);
    (cL.__ppListeners.input || []).forEach((fn) => fn({ target: { id: 'pp-new-text', value: 'Не задвоить' } }));
    failVerify = true;
    const addBtn = { disabled: false, getAttribute: (n) => (n === 'data-pp-c' ? 'add' : null) };
    (cL.__ppListeners.click || []).forEach((fn) => fn({ target: { closest: (s) => (s === '#pp-drawer' ? {} : s === '[data-pp-c]' ? addBtn : null) }, preventDefault() {} }));
    const draftedL = await until(() => sL.drafts().length === 1);
    failVerify = false;
    await within(sL.flushDrafts(), 2000);
    pass(draftedL && bodies(filesL).length === 1 && sL.drafts().length === 0,
      '19д R9: запись не подтвердилась — черновик интерфейса с подписью операции, повтор не задваивает', JSON.stringify(bodies(filesL)));

    /* R10: хранилище закрыто со старта — черновики временные с первого ввода;
       отказ записи другого ключа сохранённые черновики временными не делает */
    const deadLs = { setItem() { throw Object.assign(new Error('запрещено'), { name: 'SecurityError' }); }, getItem: () => null, removeItem() {} };
    const sM = loadRuntime(pageEnv({ files: panelFiles(core18), href: A, storage: deadLs }), runtime, ['core.js', 'store.js'])._store;
    const volM = sM.draftsVolatile();
    sM.addDraft('до перезагрузки');
    const okM = sM.local.usable === false && volM && sM.drafts().length === 1 && sM.draftsVolatile();
    const baseN = fakeStorage();
    const pickyLs = { setItem(k, v) { if (k.startsWith('pp.ui:')) throw Object.assign(new Error('квота'), { name: 'QuotaExceededError' }); baseN.setItem(k, v); },
      getItem: (k) => baseN.getItem(k), removeItem: (k) => baseN.removeItem(k) };
    const sN = loadRuntime(pageEnv({ files: panelFiles(core18), href: A, storage: pickyLs }), runtime, ['core.js', 'store.js'])._store;
    sN.setUi({ tab: 'comments' });
    sN.addDraft('в localStorage');
    pass(okM && sN.drafts().length === 1 && !sN.draftsVolatile() && sN.local.volatile('pp.ui:core/drafts/lab'),
      '19е R10: хранилище закрыто со старта — черновики временные с первого ввода; отказ другого ключа не делает временными сохранённые черновики');

    /* R11: снятый чип убирает только свой ключ; стёртый текст снимает фиксацию */
    const cO = pageEnv({ files: panelFiles(core18), href: A });
    const PPO = loadRuntime(cO, runtime, ['core.js', 'store.js']);
    stubUi(PPO, { flow: 'demo', step: 'a', dirty: false, error: null });
    loadRuntime(cO, runtime, ['tab-comments.js']);
    const chipPage = { id: '', closest: (s) => (s === '#pp-drawer' ? {} : null), matches: (s) => s === '[data-pp-ctx]', getAttribute: () => 'page' };
    (cO.__ppListeners.keydown || []).forEach((fn) => fn({ target: chipPage, key: 'Backspace', ctrlKey: false, metaKey: false, preventDefault() {} }));
    const fO = PPO._comments.form();
    PPO._store.setUi({ form: undefined });
    const typeO = (value) => (cO.__ppListeners.input || []).forEach((fn) => fn({ target: { id: 'pp-new-text', value } }));
    typeO('Fix A');
    typeO('');
    cO.location = new URL('file:///proj/apps/core/drafts/lab/pages/B.html');
    const fO2 = PPO._comments.form();
    pass(fO.page === null && !!fO.step && fO.step.step === 'a' && fO2.text === '' && fO2.page === 'B.html',
      '19ж R11: снятый чип страницы не снимает шаг; стёртый текст — форма снова берёт текущую страницу', JSON.stringify({ fO, fO2 }));

    /* R12: повтор после перезаписи файла другой вкладкой — номер своего комментария */
    const filesP = panelFiles(core18);
    let readsP = 0, armP = false;
    const sP = await link(pageEnv({ files: filesP, href: A }), filesP, { afterRead: (name) => {
      if (!armP || name !== 'comments.md' || ++readsP !== 3) return;
      filesP.set('comments.md', fileWith([commentWith(1, 'Из вкладки B')]));   // контрольное чтение: вкладка B перезаписала файл
    } });
    armP = true;
    const rP = await within(sP.save([{ op: 'add', text: 'Из вкладки A' }]), 2000);
    const mineP = core18.parseComments(filesP.get('comments.md')).model.comments.find((c) => c.body === 'Из вкладки A');
    pass(rP.done && !rP.error && !!mineP && mineP.n === 2 && rP.v.length === 1 && rP.v[0] === 2,
      '19з R12: после повтора save возвращает номер своего комментария, а не номера всех попыток', JSON.stringify(rP));

    /* R13: две вкладки дописывают общие черновики одновременно — один раз; черновик,
       добавленный другой вкладкой во время записи, не пропадает */
    const filesQ = panelFiles(core18);
    const lsQ = fakeStorage();
    const locksQ = fakeLocks();
    let armQ = true, sQ2 = null;
    const hooksQ = { beforeClose: (name) => { if (armQ && name === 'comments.md' && sQ2) { armQ = false; sQ2.addDraft('Во время записи'); } } };
    const sQ1 = loadRuntime(pageEnv({ files: filesQ, href: A, storage: lsQ, locks: locksQ }), runtime, ['core.js', 'store.js'])._store;
    sQ2 = loadRuntime(pageEnv({ files: filesQ, href: A, storage: lsQ, locks: locksQ }), runtime, ['core.js', 'store.js'])._store;
    sQ1.addDraft('Черновик прошлой сессии');
    await within(Promise.all([sQ1.linkHandle(fakeDir(filesQ, hooksQ)), sQ2.linkHandle(fakeDir(filesQ, hooksQ))]), 3000);
    const bQ = bodies(filesQ), leftQ = sQ1.drafts().map((d) => d.text);
    const once = (t) => bQ.filter((b) => b === t).length === 1;
    pass(once('Черновик прошлой сессии') && (once('Во время записи') ? !leftQ.includes('Во время записи') : leftQ.includes('Во время записи') && !bQ.includes('Во время записи')),
      '19и R13: две вкладки пишут общие черновики один раз, черновик другой вкладки не теряется', JSON.stringify({ bQ, leftQ }));
  }

  out.push('ВЕРДИКТ: ' + (failed ? 'FAIL (кейсов не прошло: ' + failed + ' из ' + total + ')' : 'OK (кейсов: ' + total + ')'));
  console.log(out.join('\n'));
  process.exit(failed ? 1 : 0);
}
const core0 = (r) => loadCore(project(r));

/* ---------------- main ---------------- */

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();
  const P = need(GEN, HERE);
  const val = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : undefined; };
  const title = 'proto-panel ' + args.filter((a) => a.startsWith('--')).join(' ');
  if (!P.panel) {
    console.log('== ' + title.trim() + ' ==\nпанели прототипа в проекте нет: project.json не объявляет protoPanel\nВЕРДИКТ: OK');
    process.exit(0);
  }
  let res;
  if (args.includes('--enable')) {
    res = enable(P, val('--enable'));
    if (!res.refused) { const c = check(P); res.defects = c.defects; res.stats = c.stats; }
  } else if (args.includes('--disable')) {
    res = disable(P, val('--disable'), args.includes('--force'));
    if (!res.refused) { const c = check(P); res.defects = c.defects; res.stats = c.stats; }
  } else if (args.includes('--list')) {
    res = list(P, val('--list'), args.includes('--open'));
  } else if (args.includes('--resolve')) {
    const i = args.indexOf('--resolve');
    res = resolveComment(P, args[i + 1], args[i + 2], val('--status'), val('--note'));
    if (!res.refused) { const c = check(P); res.defects = [...(res.defects || []), ...c.defects]; }
  } else if (args.includes('--check')) {
    res = check(P);
  } else {
    const b = build(P);
    const c = check(P);
    res = { written: b.written, defects: [...b.defects, ...c.defects], stats: c.stats };
  }
  console.log(report(title.trim(), res));
  process.exit((res.defects && res.defects.length) || (res.refused && res.refused.length) ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SELF) main().catch((e) => { console.error(e); process.exit(1); });

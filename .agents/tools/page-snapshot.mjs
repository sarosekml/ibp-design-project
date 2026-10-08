#!/usr/bin/env node
/* ============================================================
   PAGE-SNAPSHOT — сверка сохранности страниц в браузере (MS0013, Э6 / Р12).

   Вопрос, на который отвечает: не изменила ли правка ДС вид прототипов,
   хаба и страниц ДС, кроме тех, что меняли намеренно. Ответ — снимок
   вычисленных стилей всех страниц до и после и их сравнение.

   Как устроено:
     serve   — локальный HTTP-сервер для одного дерева (рабочая копия или
               рабочая копия другой ветки). Отдаёт файлы дерева и служебную
               страницу /__snapshot/: она по очереди открывает каждую страницу
               в iframe 1440 × 900 и шлёт серверу по строке на страницу.
               Сервер пишет их в JSONL (первая строка — meta).
     compare — сравнивает два JSONL и печатает отличия по страницам.

   Детерминизм: в каждую страницу снимка (?__snap=1) сервер первым тегом
   <head> вставляет заморозку — Math.random с постоянным зерном, Date
   на одну дату, без переходов и анимаций, — и собирает ошибки JS. Перед
   каждой страницей служебная страница чистит localStorage и
   sessionStorage своего адреса. Тема — та, что у страниц без выбора:
   IBP Legacy.

   Что снимается у каждого видимого элемента: селектор (тег, id, классы),
   color, background-color и -image, цвета рамок, тень, обводка, fill,
   stroke, opacity, прямоугольник (x, y, w, h, округлённые) и собственный
   текст (до 80 знаков). У элементов внутри <svg> id в селектор не идёт:
   рантайм иконок нумерует копии сквозным счётчиком, и лишняя иконка выше
   по странице сдвигала бы номера всех ниже. Оболочка — меню ДС (nav.ds-nav),
   прежнее окно тем (.ds-theme-launcher, .ds-theme-panel) и панель прототипа
   (#pp-*, .pp-*) — пишется отдельно: меню растёт с каждой новой страницей
   ДС, её состав сравнивается мягче (см. compare).

   Сравнение страницы: ряды выравниваются по селекторам — при расхождении
   ищется ближайшая точка, где снова совпадают три ряда подряд; пропущенное
   до неё — «структура», в выровненных рядах — «цвет», «геометрия», «текст». Оболочка: другой
   состав — сведение, тот же состав с другими цветами — отличие.

   Запуск (из корня репо):
     node .agents/tools/page-snapshot.mjs pages <корень>
     node .agents/tools/page-snapshot.mjs serve <корень> --out <файл.jsonl> [--port 8765] [--settle 1200] [--once] [--only <часть пути,…>]
       затем открыть http://localhost:<port>/__snapshot/ в браузере;
       --once — сервер выходит, когда снимок записан; --only — только
       страницы, в пути которых есть одна из частей (повтор подозрительных)
     node .agents/tools/page-snapshot.mjs compare <до.jsonl> <после.jsonl> [--expect <файл|путь,путь>] [--detail 5]
     node .agents/tools/page-snapshot.mjs --selftest

   Ожидаемые отличия (--expect): файл со строкой на путь или список через
   запятую; «#» и всё после — комментарий; путь с «/» на конце — папка.
   ВЕРДИКТ compare: OK — неожиданных отличий и новых ошибок JS нет;
   код выхода 0 | 1. Сравнение «до» лучше снимать с рабочей копии базы
   (git worktree add <папка> <коммит>) — сервер у каждого дерева свой.
   ============================================================ */
import { createServer } from 'node:http';
import { existsSync, readFileSync, writeFileSync, appendFileSync, readdirSync, statSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { dsFromConfig } from './project.mjs';

const SNAP_DATE = '2026-10-08T09:00:00Z';
const VIEWPORT = { w: 1440, h: 900 };
const SKIP_DIRS = new Set(['node_modules', '.git', 'fixtures', 'templates']);
const CHROME_SELECTOR = 'nav.ds-nav, .ds-theme-launcher, .ds-theme-panel, [id^="pp-"], [class^="pp-"], [class*=" pp-"]';
const PROPS = ['color', 'bg', 'bgi', 'border', 'shadow', 'outline', 'fill', 'stroke', 'opacity'];
const GEOMETRY = ['x', 'y', 'w', 'h'];

/* ---------- страницы дерева ---------- */

function walkHtml(root, dir, out) {
  const abs = path.join(root, dir);
  if (!existsSync(abs)) return;
  for (const name of readdirSync(abs).sort()) {
    if (name.startsWith('.') || SKIP_DIRS.has(name)) continue;
    const rel = dir ? dir + '/' + name : name;
    const st = statSync(path.join(root, rel));
    if (st.isDirectory()) walkHtml(root, rel, out);
    else if (name.endsWith('.html')) out.push(rel);
  }
}

/* Хаб, все страницы ДС (без фикстур и шаблонов) и все страницы приложений. */
export function listPages(root) {
  const manifest = JSON.parse(readFileSync(path.join(root, 'project.json'), 'utf8'));
  const pages = [];
  if (manifest.hub && existsSync(path.join(root, manifest.hub.page))) pages.push(manifest.hub.page);
  const ds = dsFromConfig(root, manifest.designSystem.from);
  if (ds.error) throw new Error(ds.error);
  walkHtml(root, ds.ds, pages);
  walkHtml(root, manifest.boot.dir, pages);
  return [...new Set(pages)];
}

/* ---------- заморозка и служебная страница ---------- */

const FREEZE = `(function(){
  var seed = 1234567;
  Math.random = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  var Real = Date, fixed = Real.parse(${JSON.stringify(SNAP_DATE)});
  function Frozen(a, b, c, d, e, f, g) {
    if (!(this instanceof Frozen)) return new Real(fixed).toString();
    switch (arguments.length) {
      case 0: return new Real(fixed);
      case 1: return new Real(a);
      default: return new Real(a, b, c === undefined ? 1 : c, d || 0, e || 0, f || 0, g || 0);
    }
  }
  Frozen.prototype = Real.prototype;
  Frozen.now = function () { return fixed; };
  Frozen.parse = Real.parse;
  Frozen.UTC = Real.UTC;
  window.Date = Frozen;
  window.__snapErrors = [];
  window.addEventListener('error', function (e) { window.__snapErrors.push(String(e.message || e.type) + (e.filename ? ' @ ' + e.filename.split('/').pop() + ':' + e.lineno : '')); }, true);
  window.addEventListener('unhandledrejection', function (e) { window.__snapErrors.push('promise: ' + String(e.reason && e.reason.message || e.reason)); });
  document.write('<style id="__snap-freeze">*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important;scroll-behavior:auto!important}</style>');
})();`;

/* Сборщик выполняется в окне страницы: (селектор оболочки) → { rows, chrome }. */
function collect(chromeSelector) {
  const skip = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'HEAD', 'TITLE', 'TEMPLATE', 'NOSCRIPT', 'BASE']);
  const rows = [], chrome = [];
  const sx = window.scrollX, sy = window.scrollY;
  const own = (el) => {
    let t = '';
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue;
    t = t.replace(/\s+/g, ' ').trim();
    return t.length > 80 ? t.slice(0, 80) + '…' : t;
  };
  for (const el of document.querySelectorAll('*')) {
    if (skip.has(el.tagName) || el.id === '__snap-freeze') continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none') continue;
    const r = el.getBoundingClientRect();
    const cls = typeof el.className === 'string' ? el.className.trim().replace(/\s+/g, '.') : (el.getAttribute('class') || '').trim().replace(/\s+/g, '.');
    const sides = [cs.borderTopColor, cs.borderRightColor, cs.borderBottomColor, cs.borderLeftColor];
    const row = {
      sel: el.tagName.toLowerCase() + (el.id && !el.parentElement.closest('svg') ? '#' + el.id : '') + (cls ? '.' + cls : ''),
      color: cs.color,
      bg: cs.backgroundColor,
      bgi: cs.backgroundImage === 'none' ? '' : cs.backgroundImage,
      border: sides.every((s) => s === sides[0]) ? sides[0] : sides.join(' | '),
      shadow: cs.boxShadow === 'none' ? '' : cs.boxShadow,
      outline: cs.outlineStyle === 'none' ? '' : cs.outlineColor + ' ' + cs.outlineWidth,
      fill: cs.fill,
      stroke: cs.stroke,
      opacity: cs.opacity,
      x: Math.round(r.left + sx), y: Math.round(r.top + sy), w: Math.round(r.width), h: Math.round(r.height),
      text: own(el)
    };
    (el.closest(chromeSelector) ? chrome : rows).push(row);
  }
  return { rows, chrome };
}

function harnessHtml(cfg) {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Снимок страниц</title>
<style>
  body { margin: 16px; font: 14px/1.4 system-ui, sans-serif; background: #FFFFFF; color: #111111; }
  #log { white-space: pre-wrap; font: 12px/1.4 ui-monospace, monospace; max-height: 30vh; overflow: auto; }
  iframe { width: ${cfg.w}px; height: ${cfg.h}px; border: 1px solid #CCCCCC; display: block; margin-top: 12px; }
</style></head><body>
<h1>Снимок страниц</h1>
<p id="status">Подготовка…</p>
<div id="log"></div>
<iframe id="frame" title="Страница снимка"></iframe>
<script>
(async function () {
  var cfg = ${JSON.stringify(cfg)};
  var collectSrc = ${JSON.stringify('(' + collect.toString() + ')')};
  var statusEl = document.getElementById('status'), logEl = document.getElementById('log'), frame = document.getElementById('frame');
  function log(s) { logEl.textContent += s + '\\n'; logEl.scrollTop = logEl.scrollHeight; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function post(kind, body) { return fetch('/__snapshot/' + kind, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }
  var pages = await (await fetch('/__snapshot/pages.json', { cache: 'no-store' })).json();
  await post('start', { total: pages.length, userAgent: navigator.userAgent });
  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    statusEl.textContent = (i + 1) + ' / ' + pages.length + ' · ' + page;
    try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
    var result = { page: page };
    try {
      await new Promise(function (resolve, reject) {
        var timer = setTimeout(function () { reject(new Error('страница не загрузилась за 20 с')); }, 20000);
        frame.onload = function () { clearTimeout(timer); resolve(); };
        frame.src = '/' + page.split('/').map(encodeURIComponent).join('/') + '?__snap=1';
      });
      var win = frame.contentWindow;
      if (win.document.fonts && win.document.fonts.ready) await Promise.race([win.document.fonts.ready, wait(3000)]);
      await wait(cfg.settle);
      win.scrollTo(0, 0);
      var snap = win.eval(collectSrc + '(' + JSON.stringify(cfg.chrome) + ')');
      result.rows = snap.rows;
      result.chrome = snap.chrome;
      result.errors = (win.__snapErrors || []).slice();
      result.title = win.document.title;
    } catch (e) {
      result.fail = String(e && e.message || e);
    }
    await post('result', result);
    log((result.fail ? 'СБОЙ ' : 'ok   ') + page + (result.rows ? ' · ' + result.rows.length + ' эл.' : '') + (result.fail ? ' · ' + result.fail : ''));
  }
  frame.src = 'about:blank';
  await post('done', { total: pages.length });
  statusEl.textContent = 'Готово: ' + pages.length + ' страниц записано.';
})();
</script></body></html>`;
}

/* Вставка заморозки первым тегом <head> страницы снимка. */
export function injectFreeze(html) {
  const tag = '<script>' + FREEZE + '</script>';
  const m = html.match(/<head(\s[^>]*)?>/i);
  if (m) return html.slice(0, m.index + m[0].length) + tag + html.slice(m.index + m[0].length);
  return tag + html;
}

/* ---------- сервер ---------- */

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf'
};

function gitInfo(root) {
  try {
    const commit = execFileSync('git', ['-C', root, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
    const dirty = execFileSync('git', ['-C', root, 'status', '--porcelain'], { encoding: 'utf8' }).split('\n').filter(Boolean).length;
    return { commit, dirty };
  } catch (e) {
    return { commit: null, dirty: null };
  }
}

function serve(root, opts) {
  root = path.resolve(root);
  const pages = listPages(root).filter((p) => !opts.only.length || opts.only.some((part) => p.includes(part)));
  const cfg = { w: VIEWPORT.w, h: VIEWPORT.h, settle: opts.settle, chrome: CHROME_SELECTOR };
  let written = 0;

  const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const send = (code, type, body) => {
      res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      res.end(body);
    };

    if (url.pathname === '/__snapshot/' || url.pathname === '/__snapshot') return send(200, TYPES['.html'], harnessHtml(cfg));
    if (url.pathname === '/__snapshot/pages.json') return send(200, TYPES['.json'], JSON.stringify(pages));
    if (req.method === 'POST' && url.pathname.startsWith('/__snapshot/')) {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        const kind = url.pathname.slice('/__snapshot/'.length);
        if (kind === 'start') {
          written = 0;
          const meta = { meta: { root, ...gitInfo(root), pages: pages.length, viewport: VIEWPORT, date: SNAP_DATE, settle: opts.settle, userAgent: body.userAgent, taken: new Date().toISOString() } };
          writeFileSync(opts.out, JSON.stringify(meta) + '\n');
          console.log('снимок начат: ' + pages.length + ' страниц → ' + opts.out);
        } else if (kind === 'result') {
          appendFileSync(opts.out, JSON.stringify(body) + '\n');
          written++;
          if (body.fail) console.log('СБОЙ ' + body.page + ': ' + body.fail);
        } else if (kind === 'done') {
          console.log('снимок записан: ' + written + ' / ' + pages.length + ' → ' + opts.out);
          if (opts.once) setTimeout(() => server.close(() => process.exit(0)), 200);
        }
        send(200, TYPES['.json'], '{"ok":true}');
      });
      return;
    }

    let rel;
    try { rel = decodeURIComponent(url.pathname); } catch (e) { return send(400, TYPES['.txt'], 'плохой адрес'); }
    let file = path.join(root, rel);
    if (!file.startsWith(root)) return send(403, TYPES['.txt'], 'вне корня');
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!existsSync(file)) return send(404, TYPES['.txt'], 'нет файла');
    const ext = path.extname(file).toLowerCase();
    let body = readFileSync(file);
    if (ext === '.html' && url.searchParams.has('__snap')) body = injectFreeze(body.toString('utf8'));
    send(200, TYPES[ext] || 'application/octet-stream', body);
  });

  server.listen(opts.port, '127.0.0.1', () => {
    console.log('корень: ' + root);
    console.log('страниц: ' + pages.length);
    console.log('открыть: http://localhost:' + opts.port + '/__snapshot/');
  });
}

/* ---------- сравнение ---------- */

export function readSnapshot(file) {
  const lines = readFileSync(file, 'utf8').split('\n').filter(Boolean);
  const meta = JSON.parse(lines[0]).meta || {};
  const pages = new Map();
  for (const line of lines.slice(1)) {
    const p = JSON.parse(line);
    pages.set(p.page, p);
  }
  return { meta, pages };
}

/* Выравнивание по селекторам: при расхождении — ближайшая точка, где снова
   совпадают три ряда подряд (окно поиска LOOK по сумме сдвигов). Не нашлось —
   остаток обеих сторон считается структурной разницей. */
const LOOK = 400;
function align(a, b) {
  const same = (x, y) => {
    for (let k = 0; k < 3; k++) {
      const p = a[x + k], q = b[y + k];
      if (!p && !q) return true;
      if (!p || !q || p.sel !== q.sel) return false;
    }
    return true;
  };
  const pairs = [], removed = [], added = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i].sel === b[j].sel) { pairs.push([a[i], b[j]]); i++; j++; continue; }
    let found = false;
    for (let step = 1; step <= LOOK && !found; step++) {
      for (let di = 0; di <= step; di++) {
        const dj = step - di;
        if (i + di > a.length || j + dj > b.length) continue;
        if (same(i + di, j + dj)) {
          removed.push(...a.slice(i, i + di));
          added.push(...b.slice(j, j + dj));
          i += di; j += dj; found = true;
          break;
        }
      }
    }
    if (!found) break;
  }
  removed.push(...a.slice(i));
  added.push(...b.slice(j));
  return { pairs, removed, added };
}

export function diffRows(a, b, detail) {
  const { pairs, removed, added } = align(a || [], b || []);
  const out = { color: 0, layout: 0, text: 0, structure: removed.length + added.length, removed: removed.length, added: added.length, samples: [] };
  for (const [x, y] of pairs) {
    const props = PROPS.filter((k) => x[k] !== y[k]);
    const geo = GEOMETRY.filter((k) => x[k] !== y[k]);
    const text = x.text !== y.text;
    if (props.length) out.color++;
    if (geo.length) out.layout++;
    if (text) out.text++;
    if ((props.length || geo.length || text) && out.samples.length < detail) {
      const parts = props.map((k) => k + ': ' + (x[k] || '—') + ' → ' + (y[k] || '—'));
      if (geo.length) parts.push('rect: ' + [x.x, x.y, x.w, x.h].join(',') + ' → ' + [y.x, y.y, y.w, y.h].join(','));
      if (text) parts.push('text: «' + x.text + '» → «' + y.text + '»');
      out.samples.push(y.sel + ' · ' + parts.join('; '));
    }
  }
  if (removed.length && out.samples.length < detail) out.samples.push('убрано ' + removed.length + ', с ' + removed[0].sel);
  if (added.length && out.samples.length < detail) out.samples.push('добавлено ' + added.length + ', с ' + added[0].sel);
  return out;
}

const changed = (d) => d.color + d.layout + d.text + d.structure > 0;

export function parseExpect(value) {
  if (!value) return [];
  const text = existsSync(value) ? readFileSync(value, 'utf8') : value.split(',').join('\n');
  return text.split('\n').map((l) => l.replace(/#.*/, '').trim()).filter(Boolean);
}

const expected = (page, list) => list.some((e) => (e.endsWith('/') ? page.startsWith(e) : page === e));

export function compareSnapshots(before, after, opts = {}) {
  const expect = opts.expect || [];
  const detail = opts.detail ?? 5;
  const report = { identical: [], expected: [], unexpected: [], added: [], removed: [], failed: [], newErrors: [], chromeComposition: [] };
  const pages = [...new Set([...before.pages.keys(), ...after.pages.keys()])].sort();

  for (const page of pages) {
    const a = before.pages.get(page), b = after.pages.get(page);
    if (!a) { report.added.push(page); continue; }
    if (!b) { report.removed.push(page); continue; }
    if (a.fail || b.fail) { report.failed.push({ page, before: a.fail || '', after: b.fail || '' }); continue; }

    const errs = (b.errors || []).filter((e) => !(a.errors || []).includes(e));
    if (errs.length) report.newErrors.push({ page, errors: errs });

    const content = diffRows(a.rows, b.rows, detail);
    const chrome = diffRows(a.chrome, b.chrome, detail);
    const chromeSameComposition = chrome.structure === 0;
    if (!chromeSameComposition) report.chromeComposition.push({ page, removed: chrome.removed, added: chrome.added });
    const differs = changed(content) || (chromeSameComposition && changed(chrome));

    if (!differs) report.identical.push(page);
    else (expected(page, expect) ? report.expected : report.unexpected).push({ page, content, chrome: chromeSameComposition ? chrome : null });
  }
  report.ok = report.unexpected.length === 0 && report.newErrors.length === 0 && report.failed.length === 0;
  return report;
}

function printSummary(name, d) {
  return name + ': цвет ' + d.color + ', геометрия ' + d.layout + ', текст ' + d.text + ', структура ' + d.structure;
}

function printReport(before, after, report) {
  const m = (x) => (x.commit || '—') + (x.dirty ? ' (+' + x.dirty + ' правок)' : '') + ' · ' + (x.root || '');
  console.log('до:    ' + m(before.meta));
  console.log('после: ' + m(after.meta));
  console.log('страниц: общих ' + (report.identical.length + report.expected.length + report.unexpected.length + report.failed.length)
    + ', новых ' + report.added.length + ', убранных ' + report.removed.length);
  console.log('без отличий: ' + report.identical.length);
  if (report.added.length) console.log('\nНОВЫЕ СТРАНИЦЫ\n  ' + report.added.join('\n  '));
  if (report.removed.length) console.log('\nУБРАННЫЕ СТРАНИЦЫ\n  ' + report.removed.join('\n  '));
  const block = (title, list) => {
    if (!list.length) return;
    console.log('\n' + title + ' (' + list.length + ')');
    for (const x of list) {
      console.log('  ' + x.page);
      console.log('    ' + printSummary('содержимое', x.content));
      if (x.chrome && changed(x.chrome)) console.log('    ' + printSummary('оболочка', x.chrome));
      for (const s of [...x.content.samples, ...(x.chrome ? x.chrome.samples : [])]) console.log('      · ' + s);
    }
  };
  block('ОЖИДАЕМЫЕ ОТЛИЧИЯ', report.expected);
  block('НЕОЖИДАННЫЕ ОТЛИЧИЯ', report.unexpected);
  if (report.chromeComposition.length) {
    const sizes = new Map();
    for (const c of report.chromeComposition) {
      const key = '−' + c.removed + ' +' + c.added;
      sizes.set(key, (sizes.get(key) || 0) + 1);
    }
    console.log('\nОБОЛОЧКА: другой состав меню ДС или панели на ' + report.chromeComposition.length + ' стр. (' + [...sizes].map(([k, n]) => k + ' эл. × ' + n).join(', ') + ') — сведение, не отличие');
  }
  if (report.failed.length) {
    console.log('\nСБОИ ЗАГРУЗКИ (' + report.failed.length + ')');
    for (const f of report.failed) console.log('  ' + f.page + ' · до: ' + (f.before || 'ok') + ' · после: ' + (f.after || 'ok'));
  }
  if (report.newErrors.length) {
    console.log('\nНОВЫЕ ОШИБКИ JS (' + report.newErrors.length + ')');
    for (const e of report.newErrors) console.log('  ' + e.page + '\n    ' + e.errors.join('\n    '));
  }
  const bad = report.unexpected.length + report.newErrors.length + report.failed.length;
  console.log('\nВЕРДИКТ: ' + (report.ok ? 'OK' : 'FAIL (неожиданных отличий: ' + report.unexpected.length + ', новых ошибок JS: ' + report.newErrors.length + ', сбоев: ' + report.failed.length + ')'));
  return bad ? 1 : 0;
}

/* ---------- самопроверка ---------- */

function selftest() {
  const row = (sel, extra = {}) => ({ sel, color: 'rgb(0, 0, 0)', bg: 'rgba(0, 0, 0, 0)', bgi: '', border: 'rgb(0, 0, 0)', shadow: '', outline: '', fill: 'rgb(0, 0, 0)', stroke: 'none', opacity: '1', x: 0, y: 0, w: 10, h: 10, text: '', ...extra });
  const base = [row('html'), row('body'), row('main.page'), row('h1', { text: 'Заголовок' }), row('p.desc')];
  const nav = [row('nav.ds-nav'), row('a.ds-nav__link')];
  const page = (p, rows, chrome = nav, more = {}) => ({ page: p, rows, chrome, errors: [], ...more });
  const snap = (list) => ({ meta: {}, pages: new Map(list.map((p) => [p.page, p])) });

  const before = snap([
    page('same.html', base),
    page('color.html', base),
    page('struct.html', base),
    page('expected.html', base),
    page('folder/a.html', base),
    page('nav.html', base),
    page('navcolor.html', base),
    page('errors.html', base),
    page('gone.html', base)
  ]);
  const recolored = base.map((r) => (r.sel === 'h1' ? { ...r, color: 'rgb(1, 2, 3)' } : r));
  const inserted = [...base.slice(0, 3), row('div.new'), ...base.slice(3)];
  const after = snap([
    page('same.html', base),
    page('color.html', recolored),
    page('struct.html', inserted),
    page('expected.html', recolored),
    page('folder/a.html', recolored),
    page('nav.html', base, [...nav, row('a.ds-nav__link')]),
    page('navcolor.html', base, nav.map((r) => ({ ...r, bg: 'rgb(9, 9, 9)' }))),
    page('errors.html', base, nav, { errors: ['ReferenceError: x is not defined'] }),
    page('new.html', base)
  ]);

  const r = compareSnapshots(before, after, { expect: ['expected.html', 'folder/'] });
  assert.deepEqual(r.identical, ['errors.html', 'nav.html', 'same.html']);
  assert.deepEqual(r.expected.map((x) => x.page), ['expected.html', 'folder/a.html']);
  assert.deepEqual(r.unexpected.map((x) => x.page), ['color.html', 'navcolor.html', 'struct.html']);
  const struct = r.unexpected.find((x) => x.page === 'struct.html').content;
  assert.equal(struct.added, 1);
  assert.equal(struct.color, 0, 'вставка в середину не сдвигает сравнение остальных рядов');
  assert.equal(r.unexpected.find((x) => x.page === 'color.html').content.color, 1);
  assert.deepEqual(r.added, ['new.html']);
  assert.deepEqual(r.removed, ['gone.html']);
  assert.equal(r.chromeComposition.length, 1);
  assert.equal(r.newErrors.length, 1);
  assert.equal(r.ok, false);
  assert.equal(compareSnapshots(before, before).ok, true);
  const two = diffRows([row('html'), row('body'), row('div.launcher'), row('main'), row('h1'), row('h2'), row('h3'), row('p'), row('footer')],
    [row('html'), row('body'), row('main'), row('h1'), row('h2'), row('h3'), row('div.new'), row('p'), row('footer')], 5);
  assert.deepEqual([two.removed, two.added, two.color], [1, 1, 0], 'две правки в разных местах выравниваются по отдельности');

  assert.deepEqual(parseExpect('a.html, b/ # комментарий'), ['a.html', 'b/']);
  assert.match(injectFreeze('<!doctype html><html><head lang="ru"><title>x</title></head></html>'), /<head lang="ru"><script>/);
  assert.match(injectFreeze('<p>без head</p>'), /^<script>/);

  const tmp = mkdtempSync(path.join(os.tmpdir(), 'page-snapshot-'));
  try {
    const put = (rel, text) => { mkdirSync(path.dirname(path.join(tmp, rel)), { recursive: true }); writeFileSync(path.join(tmp, rel), text); };
    put('project.json', JSON.stringify({ hub: { page: 'index.html' }, designSystem: { from: 'apps/ds-config.js' }, boot: { dir: 'apps' } }));
    put('apps/ds-config.js', "var DS_PATH = '../ds';");
    put('index.html', '');
    put('ds/index.html', '');
    put('ds/fixtures/A1.bad.html', '');
    put('ds/templates/screen/Screen.html', '');
    put('ds/components/X/X.html', '');
    put('apps/a/pages/One.html', '');
    put('apps/a/node_modules/skip.html', '');
    assert.deepEqual(listPages(tmp), ['index.html', 'ds/components/X/X.html', 'ds/index.html', 'apps/a/pages/One.html']);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  console.log('ВЕРДИКТ: OK — классы отличий, ожидаемые и папки, оболочка, ошибки JS, новые и убранные страницы, заморозка, состав страниц');
  return 0;
}

/* ---------- вход ---------- */

function option(args, name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
}

function main(args) {
  const cmd = args[0];
  if (cmd === '--selftest') return selftest();
  if (cmd === 'pages' && args[1]) {
    const pages = listPages(path.resolve(args[1]));
    console.log(pages.join('\n'));
    console.log('страниц: ' + pages.length);
    return 0;
  }
  if (cmd === 'serve' && args[1]) {
    const out = option(args, '--out', null);
    if (!out) { console.error('нужен --out <файл.jsonl>'); return 1; }
    const only = option(args, '--only', '').split(',').map((x) => x.trim()).filter(Boolean);
    serve(args[1], { out: path.resolve(out), port: Number(option(args, '--port', 8765)), settle: Number(option(args, '--settle', 1200)), once: args.includes('--once'), only });
    return null;
  }
  if (cmd === 'compare' && args[1] && args[2]) {
    const before = readSnapshot(args[1]), after = readSnapshot(args[2]);
    const report = compareSnapshots(before, after, { expect: parseExpect(option(args, '--expect', '')), detail: Number(option(args, '--detail', 5)) });
    return printReport(before, after, report);
  }
  console.error('Использование:\n  page-snapshot.mjs pages <корень>\n  page-snapshot.mjs serve <корень> --out <файл.jsonl> [--port 8765] [--settle 1200] [--once] [--only <часть пути,…>]\n  page-snapshot.mjs compare <до.jsonl> <после.jsonl> [--expect <файл|список>] [--detail 5]\n  page-snapshot.mjs --selftest');
  return 1;
}

const code = main(process.argv.slice(2));
if (code !== null) process.exitCode = code;

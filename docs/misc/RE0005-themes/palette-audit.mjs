#!/usr/bin/env node
/* ============================================================
   RE0005 · Э1 — аудит текущей палитры ДС. Разовый скрипт этапа.

   Что меряет (задача docs/tasks/RE0005-ds-themes.md, §4 Э1):
   - рампы основы Colors (Colors.css) — светлота, насыщенность и тон в OKLCH
     по шагам, немонотонные и слипшиеся шаги, дубли и почти-дубли, тон
     нейтральных, где каждая рампа применяется;
   - семантику (Palette.css, 119 токенов) — итоговый цвет, места применения
     по областям (вместе с color-mix и fallback), неиспользуемые, совпадающие
     значения;
   - старые имена в разных ролях — класс свойства и состояние из селектора
     по каждому месту CSS ДС; компонентные токены (`--btn-pale`) раскрываются;
   - места без токена — hex, rgb/hsl, white/black и прямые ссылки на рампы в
     CSS и рантаймах ДС; тени; цвета в страницах ДС; рампы в apps/;
   - контраст основных пар legacy — точка отсчёта для критерия AA.

   Пишет только отчёт audit.md рядом с собой: ДС и apps/ читаются.
   Импорт модулем (Э2, role-map.mjs) ничего не пишет — отдаёт замер данными
   (экспорт в конце файла).

   Запуск из корня проекта:
     node docs/misc/RE0005-themes/palette-audit.mjs
   ============================================================ */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { project } from '../../../.agents/tools/project.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'audit.md');

/* ---------- пороги ---------- */
const DL_STUCK = 0.02;        // соседние шаги ближе по светлоте OKLCH — «слиплись»
const DE_NEAR = 0.02;         // цвета ближе в OKLab — почти-дубль
const SEMANTIC_COUNT = 119;   // столько токенов в Palette.css по спеке
const NEUTRALS = ['swamp', 'cgrey', 'mgrey'];
const MAIN_STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
const A_STEPS = ['A100', 'A200', 'A400', 'A700'];
const PLACES_SHOWN = 6;       // мест на строку роли в разделе «Одно имя — несколько ролей»

/* ---------- проект и раскладка ДС ---------- */
const P = project(HERE);
if (P.error) throw new Error(P.error);
const { layout } = await import(pathToFileURL(path.join(P.dsAbs, 'tools', 'ds-paths.mjs')).href);
const L = layout(P.dsAbs);

const slash = (p) => p.split(path.sep).join('/');
const rel = (abs) => slash(path.relative(P.root, abs));
const read = (abs) => readFileSync(abs, 'utf8').replace(/^\uFEFF/, '');
const dsAbs = (r) => path.join(L.root, r);

const colorsDir = L.folderOf('Colors');
const elevDir = L.folderOf('Elevation');
if (!colorsDir || !elevDir) throw new Error('нет папок основ Colors или Elevation');
const COLORS = colorsDir + '/Colors.css';
const PALETTE = colorsDir + '/Palette.css';
const ELEVATION = elevDir + '/Elevation.css';

/* ---------- текст: комментарии, строки ---------- */
const blank = (s) => s.replace(/[^\n]/g, ' ');
const stripCss = (t) => t.replace(/\/\*[\s\S]*?\*\//g, blank);
const stripJs = (t) => t
  .replace(/\/\*[\s\S]*?\*\//g, blank)
  .replace(/(^|[^:'"\\])(\/\/[^\n]*)/g, (m, p, c) => p + blank(c));
// код и комментарии в страницах — текст, а не применение цвета
const stripHtml = (t) => t
  .replace(/<!--[\s\S]*?-->/g, blank)
  .replace(/<script\b[^>]*type=["']text\/plain["'][^>]*>[\s\S]*?<\/script>/gi, blank)
  .replace(/<(pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, blank)
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, stripCss)
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, stripJs);

function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (idx) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= idx) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
}

function splitTop(s, sep) {
  const out = []; let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++; else if (ch === ')') depth--;
    const isSep = sep === ' ' ? /\s/.test(ch) : ch === sep;
    if (isSep && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  out.push(cur.trim());
  return out.filter((x) => x !== '');
}

/* ---------- цвет: разбор, смешение, OKLCH, контраст ---------- */
function hexRgb(hex) {
  let h = hex.slice(1);
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
  const n = (i) => parseInt(h.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
}

/* Значение CSS → { r, g, b, a } (каналы 0…255, a 0…1) или null.
   lookup(имя) отдаёт значение пользовательского свойства. color-mix — по
   спецификации: srgb, премультипликация альфы, сумма долей < 100 % — прозрачность. */
function evalColor(expr, lookup, seen = new Set()) {
  const s = String(expr).trim();
  let m;
  if ((m = s.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/))) {
    const v = seen.has(m[1]) ? null : lookup(m[1]);
    if (v != null) {
      seen.add(m[1]);
      const c = evalColor(v, lookup, seen);
      seen.delete(m[1]);
      if (c) return c;
    }
    return m[2] ? evalColor(m[2], lookup, seen) : null;
  }
  if (/^#[0-9a-f]{3,8}$/i.test(s)) return hexRgb(s);
  const low = s.toLowerCase();
  if (low === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (low === 'white') return { r: 255, g: 255, b: 255, a: 1 };
  if (low === 'black') return { r: 0, g: 0, b: 0, a: 1 };
  if ((m = s.match(/^rgba?\(([^)]*)\)$/i))) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const v = parts.map((p, i) => (p.endsWith('%') ? parseFloat(p) / 100 * (i < 3 ? 255 : 1) : parseFloat(p)));
    if (v.some(Number.isNaN)) return null;
    return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 };
  }
  if ((m = s.match(/^color-mix\(([\s\S]*)\)$/i))) {
    const args = splitTop(m[1], ',');
    if (args.length !== 3 || !/^in\s+srgb$/i.test(args[0])) return null;
    const part = (a) => {
      const toks = splitTop(a, ' ');
      const i = toks.findIndex((t) => /^\d*\.?\d+%$/.test(t));
      if (i < 0) return [toks.join(' '), null];
      const p = parseFloat(toks[i]);
      toks.splice(i, 1);
      return [toks.join(' '), p];
    };
    const [c1, q1] = part(args[1]);
    const [c2, q2] = part(args[2]);
    let w1 = q1, w2 = q2;
    if (w1 == null && w2 == null) { w1 = 50; w2 = 50; } else if (w1 == null) w1 = 100 - w2; else if (w2 == null) w2 = 100 - w1;
    const A = evalColor(c1, lookup, seen), B = evalColor(c2, lookup, seen);
    if (!A || !B) return null;
    const sum = w1 + w2, t1 = w1 / sum, t2 = w2 / sum, mult = Math.min(sum, 100) / 100;
    const a = A.a * t1 + B.a * t2;
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
    const ch = (k) => (A[k] * A.a * t1 + B[k] * B.a * t2) / a;
    return { r: ch('r'), g: ch('g'), b: ch('b'), a: a * mult };
  }
  return null;
}

const hex2 = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0').toUpperCase();
const hexOf = (c) => '#' + hex2(c.r) + hex2(c.g) + hex2(c.b);
const fmtColor = (c) => (c ? hexOf(c) + (c.a < 0.995 ? ' · ' + Math.round(c.a * 100) + '%' : '') : '—');
const over = (c, bg) => ({ r: c.r * c.a + bg.r * (1 - c.a), g: c.g * c.a + bg.g * (1 - c.a), b: c.b * c.a + bg.b * (1 - c.a), a: 1 });

const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
function oklab(c) {
  const R = lin(c.r), G = lin(c.g), B = lin(c.b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return {
    L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  };
}
function oklch(c) {
  const { L: l, a, b } = oklab(c);
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return { L: l, C: Math.hypot(a, b), H: (h + 360) % 360 };
}
const deltaE = (x, y) => { const p = oklab(x), q = oklab(y); return Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b); };
const luminance = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
const contrast = (x, y) => { const a = luminance(x), b = luminance(y); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };

const n2 = (x) => x.toFixed(2).replace(/^0\./, '.').replace(/^-0\./, '-.');
const n3 = (x) => x.toFixed(3).replace(/^0\./, '.');
const deg = (x) => String(Math.round(x));
const hueOf = (lch) => (lch.C < 0.002 ? '—' : deg(lch.H));   // у серого тон не определён

/* ---------- 1. рампы ---------- */
const rampDefs = new Map();      // имя рампы → Map(шаг → { hex, c, lch })
for (const m of read(dsAbs(COLORS)).matchAll(/--([a-z][a-z-]*?)-(50|[1-9]00|A[1-7]00)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
  if (!rampDefs.has(m[1])) rampDefs.set(m[1], new Map());
  const c = hexRgb(m[3]);
  rampDefs.get(m[1]).set(m[2], { hex: m[3].toUpperCase(), c, lch: oklch(c) });
}
if (!rampDefs.size) throw new Error('в ' + COLORS + ' не найдено ни одной рампы');
const RAMPS = [...rampDefs.keys()].sort();
const rampHex = new Map();       // '--emerald-500' → hex
for (const [r, steps] of rampDefs) for (const [s, v] of steps) rampHex.set('--' + r + '-' + s, v.hex);
const RAMP_ALT = [...RAMPS].sort((a, b) => b.length - a.length).join('|');
const RAMP_ANY = new RegExp('--(' + RAMP_ALT + ')-(50|[1-9]00|A[1-7]00)(?![\\w-])', 'g');

/* ---------- 2. семантика ---------- */
const sem = [];
{
  let section = '', group = '';
  read(dsAbs(PALETTE)).split('\n').forEach((line, i) => {
    let m;
    if ((m = line.match(/^\s+(STATIC|ACTIVE|SITUATIVE|STATUS|CHART)\s+—/))) { section = m[1]; group = m[1]; return; }
    if ((m = line.match(/^\s*\/\*\s*(.+?)\s*\*\/\s*$/))) { group = m[1].split(' — ')[0]; return; }
    if ((m = line.match(/^\s*(--[\w-]+)\s*:\s*(.+?);\s*$/))) sem.push({ name: m[1], value: m[2].replace(/\s+/g, ' '), section, group, line: i + 1 });
  });
}
if (sem.length !== SEMANTIC_COUNT) throw new Error('в ' + PALETTE + ' ' + sem.length + ' токенов, ожидалось ' + SEMANTIC_COUNT);
const semByName = new Map(sem.map((t) => [t.name, t]));
const lookupBase = (name) => rampHex.get(name) ?? semByName.get(name)?.value ?? null;
for (const t of sem) t.color = evalColor(t.value, lookupBase);

/* ---------- 3. тени ---------- */
const elevation = [];
for (const m of read(dsAbs(ELEVATION)).matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) {
  const rgba = m[2].match(/rgba?\([^)]*\)/i);
  elevation.push({ name: m[1], value: m[2].trim(), color: rgba ? evalColor(rgba[0], lookupBase) : null });
}

/* ---------- 4. файлы по областям ---------- */
const AREAS = [
  ['css', 'CSS ДС'], ['js', 'JS ДС'], ['docs', 'оболочка доков'], ['html', 'страницы ДС'],
  ['hub', 'хаб и панель'], ['apps', 'apps/'], ['kit', 'витрина'],
];

function walk(dir, exts, skip = () => false) {
  const out = [];
  if (!existsSync(dir)) return out;
  const go = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith('.') || e.name === 'node_modules') continue;
      const a = path.join(d, e.name);
      if (e.isDirectory()) go(a);
      else if (exts.some((x) => e.name.endsWith(x)) && !skip(a)) out.push(a);
    }
  };
  go(dir);
  return out.sort();
}

const kindOfFile = (abs) => (abs.endsWith('.css') ? 'css' : abs.endsWith('.js') || abs.endsWith('.mjs') ? 'js' : 'html');
const files = [];
const addFile = (area, abs, dsRel = null) => {
  const kind = kindOfFile(abs);
  const raw = read(abs);
  const text = kind === 'css' ? stripCss(raw) : kind === 'js' ? stripJs(raw) : stripHtml(raw);
  files.push({ area, abs, rel: rel(abs), dsRel, kind, raw, text });
};

for (const f of L.styles()) {
  if (f === COLORS || f === PALETTE) continue;
  addFile(L.kindOf(f).role === 'docs-kit' ? 'docs' : 'css', dsAbs(f), f);
}
for (const f of L.scripts()) {
  const role = L.kindOf(f).role;
  if (role === 'data') continue;                     // icons-data.js — глифы, отдельно ниже
  addFile(role === 'docs-kit' ? 'docs' : role === 'page-script' ? 'html' : 'js', dsAbs(f), f);
}
for (const p of L.pages()) addFile('html', dsAbs(p.rel), p.rel);
if (existsSync(dsAbs(L.at.home))) addFile('html', dsAbs(L.at.home), L.at.home);
for (const a of walk(dsAbs(L.at.templates), ['.html', '.css', '.js'])) addFile('html', a, slash(path.relative(L.root, a)));

if (P.hubPage && existsSync(path.join(P.root, P.hubPage))) addFile('hub', path.join(P.root, P.hubPage));
const panelDir = path.join(P.root, (P.panel && (P.panel.runtime || P.panel.dir)) || '.agents/proto-panel');
for (const a of walk(panelDir, ['.css', '.js'])) addFile('hub', a);

const kitAbs = P.showcaseAbs || path.join(P.root, P.appsDir, 'local-components');
for (const a of walk(path.join(P.root, P.appsDir), ['.css', '.js', '.html'], (x) => x.endsWith('.preview.html'))) {
  addFile(a.startsWith(kitAbs + path.sep) ? 'kit' : 'apps', a);
}

/* ---------- 5. счёт ссылок ---------- */
const VAR_REF = /var\(\s*(--[\w-]+)\s*[,)]/g;
const NAME_REF = /(?<![\w-])(--[a-zA-Z][\w-]*)/g;   // в JS имя бывает строкой без var()
const tally = Object.fromEntries(AREAS.map(([k]) => [k, new Map()]));
for (const F of files) {
  const rx = F.kind === 'js' ? NAME_REF : VAR_REF;
  for (const m of F.text.matchAll(rx)) {
    const r = tally[F.area].get(m[1]) || { n: 0, files: new Set() };
    r.n++; r.files.add(F.rel);
    tally[F.area].set(m[1], r);
  }
}
const cnt = (area, name) => tally[area].get(name)?.n || 0;
const total = (name, areas = AREAS.map(([k]) => k)) => areas.reduce((s, a) => s + cnt(a, name), 0);
function areaTotals(names, area) {
  let n = 0; const fs = new Set();
  for (const nm of names) { const r = tally[area].get(nm); if (r) { n += r.n; r.files.forEach((f) => fs.add(f)); } }
  return { n, files: fs.size };
}

// ссылки на рампы в семантике
const rampInPalette = new Map();
for (const t of sem) for (const m of t.value.matchAll(RAMP_ANY)) {
  const r = rampInPalette.get(m[1]) || { n: 0, steps: new Set(), tokens: new Set() };
  r.n++; r.steps.add(m[2]); r.tokens.add(t.name);
  rampInPalette.set(m[1], r);
}
const rampArea = (ramp, area) => [...MAIN_STEPS, ...A_STEPS].reduce((s, st) => s + cnt(area, '--' + ramp + '-' + st), 0);

/* ---------- 6. разбор CSS: объявления с селектором и строкой ---------- */
function cssDecls(text) {
  const src = stripCss(text);
  const lineOf = lineIndex(src);
  const out = [], stack = [];
  let start = 0, depth = 0, quote = null;
  const flush = (end) => {
    const raw = src.slice(start, end), t = raw.trim();
    if (!t) return;
    const c = t.indexOf(':');
    if (c < 1) return;
    const prop = t.slice(0, c).trim();
    if (!/^(--[\w-]+|-?[a-zA-Z][a-zA-Z-]*)$/.test(prop)) return;
    const selector = [...stack].reverse().find((s) => !s.startsWith('@')) || '';
    out.push({ prop: prop.startsWith('--') ? prop : prop.toLowerCase(), value: t.slice(c + 1).trim().replace(/\s+/g, ' '), selector, line: lineOf(start + raw.search(/\S/)) });
  };
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quote) { if (ch === '\\') i++; else if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if (ch === '(') { depth++; continue; }
    if (ch === ')') { depth = Math.max(0, depth - 1); continue; }
    if (depth) continue;
    if (ch === '{') { stack.push(src.slice(start, i).trim().replace(/\s+/g, ' ')); start = i + 1; }
    else if (ch === '}') { flush(i); stack.pop(); start = i + 1; }
    else if (ch === ';') { flush(i); start = i + 1; }
  }
  return out;
}

const ICON_SEL = /(svg|icon|\bico|glyph|ibtn|chev|caret|arrow)/i;
function propClass(prop, selector) {
  if (prop.startsWith('--')) return 'токен';
  if (/^(fill|stroke|stop-color|flood-color)$/.test(prop)) return 'иконка';
  if (/^(color|-webkit-text-fill-color|caret-color|text-decoration(-color)?)$/.test(prop)) return ICON_SEL.test(selector) ? 'иконка' : 'текст';
  if (/^background/.test(prop)) return 'фон';
  if (/^(border|outline|column-rule)/.test(prop)) return 'граница';
  if (/shadow$/.test(prop)) return 'тень';
  if (/^(-webkit-)?mask/.test(prop)) return 'маска';
  if (prop === 'accent-color' || prop === 'scrollbar-color') return 'контрол';
  return 'другое';
}
const STATES = [
  ['наведение', /:hover|is-hover/],
  ['нажатие', /:active|is-pressed|is-active/],
  ['фокус', /:focus|is-focus/],
  ['выбрано', /is-selected|aria-selected|\[selected|:checked|is-checked|is-on\b|aria-checked|aria-current|is-current/],
  ['неактивно', /:disabled|is-disabled|aria-disabled|\[disabled/],
  ['открыто', /is-open|aria-expanded/],
  ['ошибка', /is-error|--error|:invalid|is-invalid/],
];
const stateOf = (selector) => STATES.filter(([, rx]) => rx.test(selector)).map(([n]) => n).join('+');

const cssFiles = files.filter((F) => F.kind === 'css' && (F.area === 'css' || F.area === 'docs'));
for (const F of cssFiles) F.decls = cssDecls(F.raw);

// компонентные токены: имя → семантика, на которую они смотрят (транзитивно)
const compDefs = new Map();
const compAt = new Map();   // компонентный токен → места определения { file, line, selector, value }
for (const F of cssFiles) for (const d of F.decls) {
  if (!d.prop.startsWith('--') || semByName.has(d.prop)) continue;
  const refs = [...d.value.matchAll(VAR_REF)].map((m) => m[1]);
  if (!refs.length) continue;
  if (!compDefs.has(d.prop)) { compDefs.set(d.prop, new Set()); compAt.set(d.prop, []); }
  refs.forEach((r) => compDefs.get(d.prop).add(r));
  compAt.get(d.prop).push({ file: F.rel, line: d.line, selector: d.selector, value: d.value });
}
function semanticsOf(name, seen = new Set()) {
  if (semByName.has(name)) return new Set([name]);
  if (seen.has(name) || !compDefs.has(name)) return new Set();
  seen.add(name);
  const out = new Set();
  for (const r of compDefs.get(name)) semanticsOf(r, seen).forEach((x) => out.add(x));
  return out;
}

const places = new Map(sem.map((t) => [t.name, []]));   // семантика → места в CSS ДС
const usedComp = new Set();
for (const F of cssFiles) for (const d of F.decls) {
  if (d.prop.startsWith('--')) continue;
  const cls = propClass(d.prop, d.selector), st = stateOf(d.selector);
  for (const m of d.value.matchAll(VAR_REF)) {
    const name = m[1];
    const base = { file: F.rel, line: d.line, selector: d.selector, prop: d.prop, cls, state: st };
    if (semByName.has(name)) places.get(name).push({ ...base, via: '' });
    else if (compDefs.has(name)) {
      usedComp.add(name);
      for (const s of semanticsOf(name)) places.get(s).push({ ...base, via: name });
    }
  }
}
// компонентный токен, который в CSS ДС не применён (берут JS или разметка), — роль «токен»
for (const F of cssFiles) for (const d of F.decls) {
  if (!d.prop.startsWith('--') || semByName.has(d.prop) || usedComp.has(d.prop)) continue;
  for (const m of d.value.matchAll(VAR_REF)) if (semByName.has(m[1])) {
    places.get(m[1]).push({ file: F.rel, line: d.line, selector: d.selector, prop: d.prop, cls: 'токен', state: stateOf(d.selector), via: '' });
  }
}
const roleKey = (p) => p.cls + (p.state ? '/' + p.state : '');

/* ---------- 7. места без токена ---------- */
const HEX = /(?<!url\()#[0-9a-fA-F]{3,8}\b/g;
const FUNC = /\b(?:rgba?|hsla?)\([^)]*\)/gi;
const NAMED = /(?<![\w-])(white|black)(?![\w-])/gi;
const COLOR_CLS = new Set(['текст', 'иконка', 'фон', 'граница', 'тень', 'токен', 'контрол']);
function colorHits(value, cls) {
  const hits = [];
  for (const m of value.matchAll(HEX)) hits.push({ kind: 'hex', v: m[0] });
  for (const m of value.matchAll(FUNC)) hits.push({ kind: 'rgb', v: m[0].replace(/\s+/g, ' ') });
  for (const m of value.matchAll(RAMP_ANY)) hits.push({ kind: 'рампа', v: m[0] });
  if (!cls || COLOR_CLS.has(cls)) for (const m of value.matchAll(NAMED)) hits.push({ kind: 'имя', v: m[0] });
  return hits;
}
const groupOfDs = (dsRel) => (dsRel.startsWith('docs-kit/') ? 'оболочка доков' : dsRel.startsWith('foundations/') ? 'основы' : 'компоненты');

const noToken = [];   // { group, file, line, selector, prop, cls, kind, v, note }
for (const F of cssFiles) {
  if (F.dsRel === ELEVATION) continue;   // тени основы — раздел «Тени»
  for (const d of F.decls) {
    const cls = propClass(d.prop, d.selector);
    for (const h of colorHits(d.value, cls)) {
      noToken.push({ group: groupOfDs(F.dsRel), file: F.rel, line: d.line, selector: d.selector, prop: d.prop, cls, ...h,
        note: cls === 'маска' ? 'не цвет (маска)' : /url\(/.test(d.value) ? 'в url()' : '' });
    }
  }
}

// JS рантаймы ДС: строки с цветом мимо токенов
function jsHits(F) {
  const out = [];
  F.text.split('\n').forEach((line, i) => {
    for (const h of colorHits(line, null).filter((x) => x.kind !== 'имя')) out.push({ file: F.rel, line: i + 1, ...h });
  });
  return out;
}
const jsNoToken = files.filter((F) => F.kind === 'js' && (F.area === 'js' || F.area === 'docs')).flatMap(jsHits);
const iconsData = L.scripts().find((f) => L.kindOf(f).role === 'data');
const iconsHex = iconsData ? [...read(dsAbs(iconsData)).matchAll(/#[0-9a-fA-F]{3,6}\b/g)] : [];

/* ---------- 8. цвета в страницах ДС ---------- */
const pageColors = [];   // { file, style, block, script, svg, values:Set }
// места страниц для правил Э2: атрибут style — сырой отрезок «свойство: значение», блок <style> — селектор
const pagePlaces = [];   // { file, where: 'style'|'block', selector, prop, raw, value, kind, v }
for (const F of files.filter((x) => x.area === 'html')) {
  const r = { file: F.rel, style: 0, block: 0, script: 0, svg: 0, values: new Map() };
  const note = (v) => r.values.set(v, (r.values.get(v) || 0) + 1);
  if (F.kind === 'js') {
    for (const h of jsHits(F)) { r.script++; note(h.v); }
  } else {
    for (const m of F.text.matchAll(/\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
      const attr = m[1] ?? m[2];
      for (const h of colorHits(attr, null)) { r.style++; note(h.v); }
      for (const seg of splitTop(attr, ';')) {
        const c = seg.indexOf(':');
        if (c < 1) continue;
        const prop = seg.slice(0, c).trim().toLowerCase(), value = seg.slice(c + 1).trim();
        for (const h of colorHits(value, null)) pagePlaces.push({ file: F.rel, where: 'style', selector: '', prop, raw: seg, value, ...h });
      }
    }
    for (const m of F.text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
      for (const d of cssDecls(m[1])) for (const h of colorHits(d.value, propClass(d.prop, d.selector))) {
        r.block++; note(h.v);
        pagePlaces.push({ file: F.rel, where: 'block', selector: d.selector, prop: d.prop, raw: '', value: d.value, ...h });
      }
    }
    for (const m of F.text.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
      for (const line of stripJs(m[1]).split('\n')) for (const h of colorHits(line, null).filter((x) => x.kind !== 'имя')) { r.script++; note(h.v); }
    }
    for (const m of F.text.matchAll(/\s(?:fill|stroke|stop-color|color)\s*=\s*"(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))"/gi)) { r.svg++; note(m[1]); }
  }
  if (r.style + r.block + r.script + r.svg) pageColors.push(r);
}

/* ---------- 9. рампы напрямую в apps/ ---------- */
const appsRamps = [];
for (const F of files.filter((x) => x.area === 'apps' || x.area === 'kit')) {
  F.text.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(RAMP_ANY)) appsRamps.push({ area: F.area, file: F.rel, line: i + 1, v: m[0] });
  });
}

/* ---------- 10. рампы: дефекты ---------- */
function ladder(ramp, steps) {
  const defs = rampDefs.get(ramp);
  const have = steps.filter((s) => defs.has(s));
  const bad = new Set(), notes = [];
  for (let i = 1; i < have.length; i++) {
    const a = defs.get(have[i - 1]).lch.L, b = defs.get(have[i]).lch.L, d = a - b;
    if (d < 0) { notes.push('немонотонно ' + have[i - 1] + '→' + have[i] + ' (L ' + n2(a) + '→' + n2(b) + ')'); bad.add(have[i - 1]); bad.add(have[i]); }
    else if (d < DL_STUCK) { notes.push('слиплись ' + have[i - 1] + '·' + have[i] + ' (ΔL ' + n3(d) + ')'); bad.add(have[i - 1]); bad.add(have[i]); }
  }
  return { bad, notes };
}
const rampInfo = RAMPS.map((r) => {
  const main = ladder(r, MAIN_STEPS), acc = ladder(r, A_STEPS);
  const lchs = [...rampDefs.get(r).values()].map((v) => v.lch);
  const chromatic = lchs.filter((x) => x.C > 0.02);
  const hue = chromatic.length ? meanHue(chromatic) : meanHue(lchs);
  const cmean = lchs.reduce((s, x) => s + x.C, 0) / lchs.length;
  const use = Object.fromEntries(AREAS.map(([k]) => [k, rampArea(r, k)]));
  const pal = rampInPalette.get(r);
  const status = pal ? 'семантика' : use.css + use.js + use.apps + use.kit + use.hub ? 'напрямую' : use.html + use.docs ? 'только доки' : 'нигде';
  return { r, main, acc, hue, cmean, cmax: Math.max(...lchs.map((x) => x.C)), use, pal, status, bad: new Set([...main.bad, ...acc.bad]) };
});
function meanHue(lchs) {
  let x = 0, y = 0;
  for (const c of lchs) { x += Math.cos((c.H * Math.PI) / 180) * c.C; y += Math.sin((c.H * Math.PI) / 180) * c.C; }
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}
function hueName(h, c) {
  if (c < 0.005) return 'нейтральный';
  if (h < 70 || h >= 330) return 'красно-тёплый';
  if (h < 110) return 'жёлто-тёплый';
  if (h < 165) return 'зелёный';
  if (h < 215) return 'зелёно-бирюзовый';
  if (h < 285) return 'сине-голубой';
  return 'фиолетовый';
}

// дубли и почти-дубли
const allSteps = [];
for (const r of RAMPS) for (const [s, v] of rampDefs.get(r)) allSteps.push({ id: r + '-' + s, ramp: r, ...v });
const exact = new Map();
for (const s of allSteps) exact.set(s.hex, [...(exact.get(s.hex) || []), s.id]);
const exactGroups = [...exact.entries()].filter(([, ids]) => ids.length > 1);
const near = [];
for (let i = 0; i < allSteps.length; i++) for (let j = i + 1; j < allSteps.length; j++) {
  const a = allSteps[i], b = allSteps[j];
  if (a.hex === b.hex) continue;
  const d = deltaE(a.c, b.c);
  if (d < DE_NEAR) near.push({ a: a.id, b: b.id, ra: a.ramp, rb: b.ramp, ha: a.hex, hb: b.hex, d });
}
near.sort((x, y) => x.d - y.d || x.a.localeCompare(y.a));
// почти-дубли среди рамп без применения в новые темы не переходят — в отчёте только счётом
const liveRamp = new Set(rampInfo.filter((x) => x.status !== 'нигде').map((x) => x.r));
const nearLive = near.filter((p) => liveRamp.has(p.ra) && liveRamp.has(p.rb));

/* ---------- 11. семантика: неиспользуемые, совпадения, роли ---------- */
const PRODUCT_AREAS = ['css', 'js', 'hub', 'apps', 'kit'];
const unused = sem.filter((t) => total(t.name) === 0);
const docsOnly = sem.filter((t) => total(t.name) > 0 && total(t.name, PRODUCT_AREAS) === 0);
const sameColor = new Map();
for (const t of sem) if (t.color) { const k = fmtColor(t.color); sameColor.set(k, [...(sameColor.get(k) || []), t.name]); }
const sameGroups = [...sameColor.entries()].filter(([, ns]) => ns.length > 1);
const multiRole = sem.map((t) => {
  const pl = places.get(t.name);
  const roles = new Map();
  for (const p of pl) roles.set(roleKey(p), [...(roles.get(roleKey(p)) || []), p]);
  const classes = new Set(pl.map((p) => p.cls));
  return { t, pl, roles, classes };
}).filter((x) => x.roles.size > 1)
  .sort((a, b) => b.classes.size - a.classes.size || b.roles.size - a.roles.size || a.t.name.localeCompare(b.t.name));

/* ---------- 12. контраст legacy ---------- */
const PAIRS = [
  ['--text-primary', '--bg-page'], ['--text-primary', '--bg-tile'], ['--text-primary', '--bg-main-menu'],
  ['--text-primary', '--bg-table-default-hover'], ['--text-primary', '--bg-table-default-focus'], ['--text-primary', '--bg-table-accent'],
  ['--text-secondary', '--bg-page'], ['--text-secondary', '--bg-tile'], ['--text-inactive', '--bg-tile'],
  ['--text-on-dark', '--bg-hint'], ['--text-on-dark', '--primary'], ['--text-on-dark', '--primary-dark'],
  ['--link', '--bg-tile'], ['--link-dark', '--bg-tile'], ['--primary', '--bg-tile'], ['--secondary', '--bg-tile'],
  ['--error', '--bg-tile'], ['--error-dark', '--error-bg'], ['--warning', '--bg-tile'], ['--warning-dark', '--warning-bg'],
  ['--success', '--bg-tile'], ['--success-dark', '--success-bg'], ['--info', '--bg-tile'], ['--info-dark', '--info-bg'],
  ['--border-primary', '--bg-tile'], ['--border-light', '--bg-tile'], ['--border-dark', '--bg-tile'],
  ['--disabled', '--disabled-bg'], ['--text-primary', '--primary-bg'], ['--text-secondary', '--bg-main-menu'],
];
const tile = semByName.get('--bg-tile').color;
const contrastRows = PAIRS.map(([fg, bg]) => {
  const b0 = semByName.get(bg).color, f0 = semByName.get(fg).color;
  const B = b0.a < 1 ? over(b0, tile) : b0;
  const F = f0.a < 1 ? over(f0, B) : f0;
  return { fg, bg, ratio: contrast(F, B), translucent: b0.a < 1 };
});

/* ---------- отчёт ---------- */
const esc = (s) => String(s).replace(/\|/g, '\\|');
const code = (s) => '`' + esc(s) + '`';
const cut = (s, n = 70) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const short = (f) => f.replace(/^design-system\//, '');
const today = (() => { const d = new Date(); return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear(); })();
const md = [];
const out = (...lines) => md.push(...lines);

const semNames = sem.map((t) => t.name);
const tot = Object.fromEntries(AREAS.map(([k]) => [k, areaTotals(semNames, k)]));
const kinds = (list) => ['hex', 'rgb', 'рампа', 'имя'].map((k) => k + ' ' + list.filter((x) => x.kind === k).length).join(' · ');
const nonColorNotes = noToken.filter((x) => x.note.startsWith('не цвет')).length;

out('# RE0005 · Э1 — аудит текущей палитры ДС', '',
  '> Генерат `docs/misc/RE0005-themes/palette-audit.mjs`, руками не править. Замер ' + today + '.',
  '> Перезапуск из корня проекта: `node docs/misc/RE0005-themes/palette-audit.mjs`.',
  '> Пороги: слипшиеся шаги — ΔL OKLCH < ' + DL_STUCK + '; почти-дубли — ΔE OKLab < ' + DE_NEAR + '.',
  '> Области: «CSS ДС» — CSS компонентов, основ и паттернов (без Colors.css и Palette.css); «JS ДС» — `ds.js`, рантаймы, `utils/`;',
  '> «оболочка доков» — `docs-kit/`; «страницы ДС» — страницы документации, главная ДС, шаблоны и сценарии `*.page.js`',
  '> (без блоков кода и комментариев); «хаб и панель» — корневой `index.html` и протопанель; «apps/» — приложения',
  '> без собранных `*.preview.html`; «витрина» — локальные компоненты. В CSS и HTML считается `var(--x)` (вместе с',
  '> `color-mix` и fallback), в JS — любое упоминание имени вне комментариев.', '');

out('## 1. Сводка', '', '| Что | Замер |', '|---|---|');
out('| Рампы | ' + RAMPS.length + ' (' + allSteps.length + ' шагов) |');
out('| Рампы в семантике | ' + rampInfo.filter((x) => x.status === 'семантика').length + ': ' + rampInfo.filter((x) => x.status === 'семантика').map((x) => x.r).join(', ') + ' |');
out('| Рампы мимо семантики — напрямую в CSS/JS ДС, хабе, apps/ | ' + (rampInfo.filter((x) => x.status === 'напрямую').map((x) => x.r).join(', ') || '—') + ' |');
out('| Рампы только в документации ДС | ' + (rampInfo.filter((x) => x.status === 'только доки').map((x) => x.r).join(', ') || '—') + ' |');
out('| Рампы без единого применения | ' + (rampInfo.filter((x) => x.status === 'нигде').map((x) => x.r).join(', ') || '—') + ' |');
out('| Немонотонные / слипшиеся шаги | ' + rampInfo.reduce((s, x) => s + [...x.main.notes, ...x.acc.notes].filter((n) => n.startsWith('немонотонно')).length, 0) + ' / ' +
  rampInfo.reduce((s, x) => s + [...x.main.notes, ...x.acc.notes].filter((n) => n.startsWith('слиплись')).length, 0) + ' (раздел 2) |');
out('| Точные дубли рамп / почти-дубли | ' + exactGroups.length + ' групп / ' + nearLive.length + ' пар среди применяемых рамп (раздел 4), ещё ' + (near.length - nearLive.length) + ' — с участием рамп без применения |');
out('| Семантика | ' + sem.length + ' токенов |');
for (const [k, label] of AREAS) out('| Ссылки на семантику — ' + label + ' | ' + tot[k].n + ' в ' + tot[k].files + ' файлах |');
out('| Семантика без единого применения | ' + unused.length + ': ' + (unused.map((t) => code(t.name)).join(', ') || '—') + ' |');
out('| Семантика только в документации ДС | ' + docsOnly.length + ': ' + (docsOnly.map((t) => code(t.name)).join(', ') || '—') + ' |');
out('| Группы семантики с одинаковым итоговым цветом | ' + sameGroups.length + ' (раздел 7) |');
out('| Семантика в нескольких ролях (класс свойства или состояние) | ' + multiRole.length + ', из них в ≥ 2 классах свойств — ' + multiRole.filter((x) => x.classes.size > 1).length + ' (раздел 8) |');
for (const g of ['компоненты', 'основы', 'оболочка доков']) {
  const list = noToken.filter((x) => x.group === g);
  out('| Цвет мимо токена в CSS — ' + g + ' | ' + list.length + ' мест в ' + new Set(list.map((x) => x.file)).size + ' файлах: ' + kinds(list) + ' |');
}
out('| из них не цвет (маска) | ' + nonColorNotes + ' |');
out('| Цвет мимо токена в JS ДС | ' + jsNoToken.length + ' мест в ' + new Set(jsNoToken.map((x) => x.file)).size + ' файлах: ' + kinds(jsNoToken) + ' |');
out('| Глифы `icons-data.js` с hex | ' + iconsHex.length + ' вхождений (для Э5) |');
out('| Страницы ДС с цветом мимо токенов | ' + pageColors.length + ' файлов, ' + pageColors.reduce((s, r) => s + r.style + r.block + r.script + r.svg, 0) + ' мест (раздел 11) |');
out('| Рампы напрямую в apps/ | ' + appsRamps.filter((x) => x.area === 'apps').length + ' в ' + new Set(appsRamps.filter((x) => x.area === 'apps').map((x) => x.file)).size +
  ' файлах; витрина — ' + appsRamps.filter((x) => x.area === 'kit').length + ' |');
out('');

out('## 2. Рампы: применение и дефекты', '',
  'H° — средний тон по шагам с насыщенностью > .02 (взвешен по C); C max — наибольшая насыщенность OKLCH. Столбцы — число ссылок на шаги рампы.', '',
  '| Рампа | H° | Тон | C max | Семантика | CSS ДС | JS ДС | Доки | Страницы ДС | Хаб | apps/ | Витрина | Статус | Дефекты светлоты |',
  '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const x of rampInfo) {
  const pal = x.pal ? x.pal.n + ' (' + [...MAIN_STEPS, ...A_STEPS].filter((s) => x.pal.steps.has(s)).join(', ') + ')' : '0';
  out('| ' + x.r + ' | ' + deg(x.hue) + ' | ' + hueName(x.hue, x.cmean) + ' | ' + n3(x.cmax) + ' | ' + pal + ' | ' + x.use.css + ' | ' + x.use.js + ' | ' + x.use.docs + ' | ' +
    x.use.html + ' | ' + x.use.hub + ' | ' + x.use.apps + ' | ' + x.use.kit + ' | ' + x.status + ' | ' + ([...x.main.notes, ...x.acc.notes].join('; ') || '—') + ' |');
}
out('');

out('## 3. Рампы по шагам (OKLCH)', '', 'Жирным — шаги с дефектом светлоты (раздел 2). L — светлота, C — насыщенность, H — тон в градусах.', '',
  '| Рампа | | ' + [...MAIN_STEPS, ...A_STEPS].join(' | ') + ' |', '|---|---|' + [...MAIN_STEPS, ...A_STEPS].map(() => '---').join('|') + '|');
for (const x of rampInfo) {
  const defs = rampDefs.get(x.r);
  const row = (label, f) => out('| ' + (label === 'L' ? x.r : '') + ' | ' + label + ' | ' + [...MAIN_STEPS, ...A_STEPS].map((s) => {
    const v = defs.get(s);
    if (!v) return '';
    const t = f(v);
    return label === 'L' && x.bad.has(s) ? '**' + t + '**' : t;
  }).join(' | ') + ' |');
  row('hex', (v) => v.hex);
  row('L', (v) => n2(v.lch.L));
  row('C', (v) => n3(v.lch.C));
  row('H', (v) => hueOf(v.lch));
}
out('');

out('## 4. Дубли и почти-дубли рамп', '', '### Точные дубли', '');
if (exactGroups.length) { out('| hex | Шаги |', '|---|---|'); for (const [h, ids] of exactGroups) out('| ' + h + ' | ' + ids.join(' = ') + ' |'); }
else out('Нет.');
out('', '### Почти-дубли среди применяемых рамп (ΔE OKLab < ' + DE_NEAR + ')', '');
if (nearLive.length) { out('| Шаг | Шаг | hex | ΔE |', '|---|---|---|---|'); for (const p of nearLive) out('| ' + p.a + ' | ' + p.b + ' | ' + p.ha + ' / ' + p.hb + ' | ' + n3(p.d) + ' |'); }
else out('Нет.');
out('', 'Ещё ' + (near.length - nearLive.length) + ' пар — с участием рамп без единого применения (' + RAMPS.filter((r) => !liveRamp.has(r)).join(', ') + '); не перечисляются.');
out('');

out('## 5. Нейтральные рампы', '', 'Тон и насыщенность каждого шага. Сине-серый — H примерно 215–285°, зелёно-бирюзовый — 165–215°.', '',
  'Тон «нейтральный» — средняя насыщенность < .005; у шага с C < .002 тон не определён (—).', '',
  '| Рампа | Средний H° | Тон | C ср. | C max | Шаги: H° / C |', '|---|---|---|---|---|---|');
for (const r of NEUTRALS.filter((x) => rampDefs.has(x))) {
  const x = rampInfo.find((i) => i.r === r);
  const steps = [...MAIN_STEPS, ...A_STEPS].filter((s) => rampDefs.get(r).has(s)).map((s) => { const v = rampDefs.get(r).get(s).lch; return s + ' ' + hueOf(v) + '/' + n3(v.C); });
  out('| ' + r + ' | ' + deg(x.hue) + ' | ' + hueName(x.hue, x.cmean) + ' | ' + n3(x.cmean) + ' | ' + n3(x.cmax) + ' | ' + steps.join(' · ') + ' |');
}
out('');

out('## 6. Семантика — ' + sem.length + ' токенов', '', 'Итог — цвет после вычисления `color-mix` (процент — непрозрачность). Столбцы — число ссылок по областям.', '',
  '| Группа | Токен | Значение | Итог | CSS ДС | JS ДС | Доки | Страницы ДС | Хаб | apps/ | Витрина |', '|---|---|---|---|---|---|---|---|---|---|---|');
for (const t of sem) {
  out('| ' + esc(t.section + ' · ' + t.group) + ' | ' + code(t.name) + ' | ' + code(t.value) + ' | ' + fmtColor(t.color) + ' | ' +
    AREAS.map(([k]) => cnt(k, t.name)).join(' | ') + ' |');
}
out('');

out('## 7. Неиспользуемые и совпадающие', '', '### Без единого применения', '');
out(unused.length ? unused.map((t) => '- ' + code(t.name) + ' = ' + code(t.value)).join('\n') : 'Нет.');
out('', '### Только в документации ДС (страницы, оболочка доков)', '');
out(docsOnly.length ? docsOnly.map((t) => '- ' + code(t.name) + ' — страницы ' + cnt('html', t.name) + ', доки ' + cnt('docs', t.name)).join('\n') : 'Нет.');
out('', '### Одинаковый итоговый цвет', '', '| Итог | Токены |', '|---|---|');
for (const [k, ns] of sameGroups) out('| ' + k + ' | ' + ns.map(code).join(', ') + ' |');
out('');

out('## 8. Одно имя — несколько ролей', '',
  'Места применения в CSS ДС (компоненты, основы, оболочка доков). Роль — класс свойства и состояние из селектора:',
  'класс «иконка» — `fill`/`stroke` или `color` на селекторе иконки (`svg`, `icon`, `ibtn`, `chev`…); «токен» — компонентный токен,',
  'который в CSS не применён. «через» — место берёт семантику через компонентный токен. Первыми — токены в нескольких классах свойств.', '',
  '| Токен | Мест | Классы | Роли |', '|---|---|---|---|');
for (const x of multiRole) {
  out('| ' + code(x.t.name) + ' | ' + x.pl.length + ' | ' + [...x.classes].join(', ') + ' | ' + [...x.roles.entries()].map(([k, v]) => k + ' ×' + v.length).join('; ') + ' |');
}
out('');
for (const x of multiRole) {
  out('### ' + x.t.name, '');
  for (const [k, v] of x.roles) {
    const shown = v.slice(0, PLACES_SHOWN).map((p) => code(short(p.file).split('/').pop() + ':' + p.line) + ' ' + code(cut(p.selector, 50)) + ' → ' + p.prop + (p.via ? ' (через ' + p.via + ')' : ''));
    out('- **' + k + '** ×' + v.length + ': ' + shown.join('; ') + (v.length > PLACES_SHOWN ? '; +' + (v.length - PLACES_SHOWN) : ''));
  }
  out('');
}

out('## 9. Цвет мимо токена в CSS ДС', '', 'Без Colors.css, Palette.css и Elevation.css. «рампа» — прямая ссылка на рампу, «имя» — `white`/`black`.', '');
for (const g of ['компоненты', 'основы', 'оболочка доков']) {
  const list = noToken.filter((x) => x.group === g);
  out('### ' + g[0].toUpperCase() + g.slice(1) + ' — ' + list.length, '');
  if (!list.length) { out('Нет.', ''); continue; }
  out('| Файл:строка | Селектор | Свойство | Вид | Значение | Заметка |', '|---|---|---|---|---|---|');
  for (const x of list) out('| ' + code(short(x.file) + ':' + x.line) + ' | ' + code(cut(x.selector)) + ' | ' + x.prop + ' | ' + x.kind + ' | ' + code(x.v) + ' | ' + x.note + ' |');
  out('');
}
out('### JS ДС — ' + jsNoToken.length, '');
if (jsNoToken.length) { out('| Файл:строка | Вид | Значение |', '|---|---|---|'); for (const x of jsNoToken) out('| ' + code(short(x.file) + ':' + x.line) + ' | ' + x.kind + ' | ' + code(x.v) + ' |'); }
else out('Нет.');
out('');

out('## 10. Тени', '', '### Токены основы Elevation', '', '| Токен | Значение | Цвет тени | CSS ДС | JS ДС | Доки | Страницы ДС | Хаб | apps/ | Витрина |', '|---|---|---|---|---|---|---|---|---|---|');
for (const e of elevation) out('| ' + code(e.name) + ' | ' + code(e.value) + ' | ' + fmtColor(e.color) + ' | ' + AREAS.map(([k]) => cnt(k, e.name)).join(' | ') + ' |');
out('', '### Тени и подложки с цветом мимо токена (из раздела 9)', '', '| Файл | Тени | Подложки фона | Цвета |', '|---|---|---|---|');
{
  const byFile = new Map();
  for (const x of noToken.filter((y) => y.kind !== 'рампа' && (y.cls === 'тень' || (y.cls === 'фон' && y.kind === 'rgb') || (y.cls === 'токен' && /shadow/.test(y.prop))))) {
    const r = byFile.get(x.file) || { sh: 0, bg: 0, vals: new Set() };
    if (x.cls === 'фон') r.bg++; else r.sh++;
    r.vals.add(x.v);
    byFile.set(x.file, r);
  }
  for (const [f, r] of byFile) out('| ' + code(short(f)) + ' | ' + r.sh + ' | ' + r.bg + ' | ' + [...r.vals].map(code).join(', ') + ' |');
}
out('');

out('## 11. Цвета в страницах ДС', '',
  'Инлайн-атрибуты `style`, блоки `<style>` страницы, скрипты страницы и `*.page.js`, атрибуты `fill`/`stroke`/`color` разметки.',
  'Блоки кода вкладки «Код» (`script type="text/plain"`), `<pre>`, `<code>` и комментарии не считаются.', '',
  '| Файл | style | `<style>` | Скрипт | SVG | Значения (до 6) |', '|---|---|---|---|---|---|');
for (const r of pageColors) {
  const vals = [...r.values.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  out('| ' + code(short(r.file)) + ' | ' + r.style + ' | ' + r.block + ' | ' + r.script + ' | ' + r.svg + ' | ' +
    vals.slice(0, 6).map(([v, n]) => code(v) + (n > 1 ? ' ×' + n : '')).join(', ') + (vals.length > 6 ? ', +' + (vals.length - 6) : '') + ' |');
}
out('');

out('## 12. Рампы напрямую в apps/', '', '| Область | Файл:строка | Рампа |', '|---|---|---|');
for (const x of appsRamps) out('| ' + (x.area === 'kit' ? 'витрина' : 'apps/') + ' | ' + code(x.file + ':' + x.line) + ' | ' + code(x.v) + ' |');
if (!appsRamps.length) out('| — | — | — |');
out('');

out('## 13. Контраст legacy (справочно)', '',
  'Отправная точка для критерия AA на Э4: 4,5:1 для текста, 3:1 для элементов управления и границ полей. Какая пара — текст,',
  'а какая — элемент, решается на Э2 по ролям. Полупрозрачный фон положен на `--bg-tile`, полупрозрачный цвет — на фон.', '',
  '| Цвет | Фон | Контраст | ≥ 4,5 | ≥ 3 |', '|---|---|---|---|---|');
for (const r of contrastRows) {
  out('| ' + code(r.fg) + ' ' + fmtColor(semByName.get(r.fg).color) + ' | ' + code(r.bg) + ' ' + fmtColor(semByName.get(r.bg).color) + (r.translucent ? ' на tile' : '') + ' | ' +
    r.ratio.toFixed(2).replace('.', ',') + ' | ' + (r.ratio >= 4.5 ? 'да' : 'нет') + ' | ' + (r.ratio >= 3 ? 'да' : 'нет') + ' |');
}
out('');

/* ---------- данные для Э2 (role-map.mjs) ---------- */
export {
  P, L, sem, semByName, elevation, files, tally, cnt, total, AREAS, places, compDefs, compAt, roleKey,
  propClass, stateOf, cssDecls, noToken, jsNoToken, pageColors, pagePlaces, evalColor, lookupBase, fmtColor,
};

// при импорте модулем ничего не пишется
const IS_MAIN = !!process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (IS_MAIN) {
writeFileSync(OUT, md.join('\n'), 'utf8');

/* ---------- сводка в консоль ---------- */
console.log('palette-audit: ' + rel(OUT) + ' — ' + md.length + ' строк');
console.log('  рампы ' + RAMPS.length + ' · в семантике ' + rampInfo.filter((x) => x.status === 'семантика').length +
  ' · напрямую ' + rampInfo.filter((x) => x.status === 'напрямую').length + ' · только доки ' + rampInfo.filter((x) => x.status === 'только доки').length +
  ' · нигде ' + rampInfo.filter((x) => x.status === 'нигде').length);
console.log('  дубли ' + exactGroups.length + ' групп · почти-дубли ' + near.length + ' пар');
console.log('  семантика ' + sem.length + ' · CSS ДС ' + tot.css.n + ' в ' + tot.css.files + ' · apps/ ' + tot.apps.n + ' в ' + tot.apps.files +
  ' · без применения ' + unused.length + ' · только доки ' + docsOnly.length + ' · совпадения ' + sameGroups.length + ' · несколько ролей ' + multiRole.length);
console.log('  мимо токена: CSS ' + noToken.length + ' · JS ' + jsNoToken.length + ' · страницы ДС ' + pageColors.length + ' файлов · рампы в apps/ ' + appsRamps.length);
}

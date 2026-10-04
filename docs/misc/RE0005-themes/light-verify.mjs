/* ============================================================
   light-verify.mjs — разовая проверка (RE0005, Э6).

   Доказательство, что светлая тема = текущая палитра: для каждого из
   119 старых имён значение legacy (Palette.css) и значение роли светлой
   темы (themeValues["ibp-light"] через map) должны совпасть — как hex,
   так и выражение color-mix.

   Ничего не пишет. Запуск из корня проекта:
     node docs/misc/RE0005-themes/light-verify.mjs
   ============================================================ */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const DS = path.join(ROOT, 'design-system');

function load(rel) {
  const ctx = { window: {} };
  vm.runInNewContext(readFileSync(path.join(ROOT, rel), 'utf8'), ctx, { timeout: 2000, filename: rel });
  return ctx.window;
}
const T = load('design-system/foundations/Themes/Themes.tokens.js').DS_THEMES;

const RX_VAR = /(--[\w-]+)\s*:\s*([^;}]+)/g;
function rootVars(css) {
  const m = css.match(/:root\s*\{([\s\S]*?)\}/);
  const out = new Map();
  for (const x of m[1].matchAll(RX_VAR)) out.set(x[1], x[2].trim());
  return out;
}
const colors = rootVars(readFileSync(path.join(DS, 'foundations/Colors/Colors.css'), 'utf8'));
const palette = rootVars(readFileSync(path.join(DS, 'foundations/Colors/Palette.css'), 'utf8'));
const light = (T.themeValues && T.themeValues['ibp-light']) || {};

/* Приводим обе стороны к сравнимому виду: цепочка var → hex; color-mix → сама
   строка без пробелов (обе стороны — одна и та же формула). */
function normalize(expr, seen) {
  const e = String(expr || '').trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(e)) return e.toUpperCase();
  const m = /^var\((--[\w-]+)\)$/.exec(e);
  if (m) {
    if (seen && seen.has(m[1])) return 'ЦИКЛ';
    const v = colors.get(m[1]) || palette.get(m[1]);
    return v ? normalize(v, new Set([...(seen || []), m[1]])) : e;
  }
  return e.replace(/\s+/g, ' ');
}

let same = 0;
const diffs = [];
for (const [old, role] of Object.entries(T.map)) {
  const want = normalize(palette.get(old));
  const got = normalize(light[role]);
  if (want && got && want === got) same++;
  else diffs.push(old + '  legacy=' + want + '  light[' + role + ']=' + got);
}
console.log('старых имён:', Object.keys(T.map).length, '| совпало:', same, '| расхождений:', diffs.length);
diffs.forEach((d) => console.log('  РАСХОЖДЕНИЕ ' + d));
console.log(diffs.length ? 'ВЕРДИКТ: FAIL' : 'ВЕРДИКТ: OK — светлая = текущая палитра');
process.exit(diffs.length ? 1 : 0);

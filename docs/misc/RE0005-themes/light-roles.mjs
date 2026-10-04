/* ============================================================
   light-roles.mjs — разовый сборщик ролей светлой темы (RE0005, Э6).

   Решение человека 04.10.2026: светлая тема = текущая. Роли светлой
   берут значения старой палитры (Palette.css) по карте
   «старое имя → роль» (Themes.tokens.js, map). Печатает готовый объект
   themeValues["ibp-light"] и отчёт контраста обязательных пар под
   светлой темой — по нему расставляются `exempt`.

   Ничего не пишет. Запуск из корня проекта:
     node docs/misc/RE0005-themes/light-roles.mjs
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

/* :root { --x: value } → Map (значение — как записано, до ';') */
const RX_VAR = /(--[\w-]+)\s*:\s*([^;}]+)/g;
function rootVars(css) {
  const m = css.match(/:root\s*\{([\s\S]*?)\}/);
  if (!m) throw new Error('нет блока :root');
  const out = new Map();
  for (const x of m[1].matchAll(RX_VAR)) out.set(x[1], x[2].trim());
  return out;
}
const colors = rootVars(readFileSync(path.join(DS, 'foundations/Colors/Colors.css'), 'utf8'));
const palette = rootVars(readFileSync(path.join(DS, 'foundations/Colors/Palette.css'), 'utf8'));

/* Резолв значения в hex, если это переменная/hex/цепочка переменных. */
function resolve(expr, seen) {
  const e = String(expr || '').trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(e)) return e.toUpperCase();
  const m = /^var\((--[\w-]+)\)$/.exec(e);
  if (m) {
    if (seen && seen.has(m[1])) return null;
    const v = colors.get(m[1]) || palette.get(m[1]);
    if (!v) return null;
    return resolve(v, new Set([...(seen || []), m[1]]));
  }
  return null;   // color-mix и прочее — не hex
}

/* role → старое имя (карта почти взаимно-однозначна) */
const byRole = new Map();
for (const [oldName, role] of Object.entries(T.map)) {
  if (!byRole.has(role)) byRole.set(role, oldName);
}

const pinned = new Map();
const problems = [];
for (const [role, oldName] of byRole) {
  const expr = palette.get(oldName);
  if (!expr) { problems.push('нет старого значения для ' + oldName + ' → ' + role); continue; }
  const hex = resolve(expr);
  pinned.set(role, hex || expr);
}
/* графики: значения берём из Palette (hex) по карте, как остальные роли */
for (const [oldName, role] of Object.entries(T.map)) {
  if (!/^--color-chart-\d+$/.test(role)) continue;
  if (!pinned.has(role)) pinned.set(role, palette.get(oldName).toUpperCase());
}

const sortedRoles = [...pinned.keys()].sort();
console.log('== themeValues["ibp-light"] — роли из текущей палитры ==');
console.log('// ' + sortedRoles.length + ' ролей (json):');
console.log('    "ibp-light": {');
sortedRoles.forEach((r, i) => {
  console.log('      "' + r + '": ' + JSON.stringify(pinned.get(r)) + (i < sortedRoles.length - 1 ? ',' : ''));
});
console.log('    },');
if (problems.length) { console.log('ПРОБЛЕМЫ:'); problems.forEach((p) => console.log('  ' + p)); }

/* Отчёт контраста обязательных пар под светлой темой */
const value = (role) => pinned.get(role) || T.values[role];
function hexOf(role) {
  const v = value(role);
  return resolve(v) || null;
}
function lum(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a, b) {
  const la = lum(a), lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
console.log('\n== обязательные пары под светлой темой ==');
const fails = [];
for (const p of T.contrast) {
  const a = hexOf(p.fg), b = hexOf(p.bg);
  if (!a || !b) { console.log('SKIP  ' + p.fg + ' на ' + p.bg + ' (не hex)'); continue; }
  const c = contrast(a, b);
  const ok = c >= p.min;
  const tag = ok ? 'PASS ' : (p.exempt && p.exempt.includes('ibp-light') ? 'EXEMPT ' : (p.required === false ? 'INFO ' : 'FAIL '));
  if (!ok) fails.push({ pair: p, c });
  console.log(tag + c.toFixed(2) + ':1  ' + p.fg + ' на ' + p.bg + '  (' + a + ' на ' + b + ')');
}
console.log('\nпары, которым нужен exempt: ["ibp-light"]:');
for (const f of fails) console.log('  ' + f.pair.fg + ' на ' + f.pair.bg + ' — ' + f.c.toFixed(2) + ':1 < ' + f.pair.min + (f.pair.required === false ? ' (required:false)' : ''));

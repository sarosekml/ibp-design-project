/* ============================================================
   light-seeds.mjs — разовый сборщик семян светлой темы (RE0005, Э4a).

   Тема считает только новые тона — accent, neutral, grey; базовые
   тона генератор переносит из Colors.css как есть (решение человека
   02.10.2026), поэтому их семена не нужны. Таблица печатает все
   19 тонов для справки: тон и пиковая хрома со шага 500 legacy-рампы,
   кламп по гамме sRGB при L=500.

   Правило для accent (единственный считаемый из legacy):
   - h — тон (OKLCH, градусы) шага 500 рампы emerald;
   - c — min(хрома шага 500, гамма-максимум хромы при L=500);
   - neutral/grey — новые семена решений Э2 (сине-серая h235 c0.02
     и чисто серая h0 c0), не из legacy.

   Ничего не пишет: печатает таблицу замера и объект семян.
   Семена вносит человек/агент в
   design-system/foundations/Themes/Themes.tokens.js (сейчас — три тона).

   Запуск из корня проекта:
     node docs/misc/RE0005-themes/light-seeds.mjs
   ============================================================ */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const COLORS = path.join(ROOT, 'design-system', 'foundations', 'Colors', 'Colors.css');

/* ---------- цвета: hex → OKLCH и обратно ---------- */
function hexRgb(h) {
  const s = String(h).replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };

function oklab(c) {
  const r = lin(c[0]), g = lin(c[1]), b = lin(c[2]);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}
const srgb = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

/* OKLab → sRGB 0..1 (без клампа — для проверки гаммы) */
function toRgb(L, C, Hdeg) {
  const h = (Hdeg || 0) * Math.PI / 180;
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
  return [
    srgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    srgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    srgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ];
}
const inGamut = (L, C, H) => toRgb(L, C, H).every((v) => v >= -0.0005 && v <= 1.0005);
function maxChroma(L, H) {
  let lo = 0, hi = 0.4;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(L, mid, H)) lo = mid; else hi = mid;
  }
  return lo;
}

function oklch(hex) {
  const [L, a, b] = oklab(hexRgb(hex));
  const C = Math.hypot(a, b);
  let H = Math.atan2(b, a) * 180 / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

/* ---------- рампы Colors.css ---------- */
const css = readFileSync(COLORS, 'utf8');
const rampVars = new Map();
for (const m of css.matchAll(/--([a-z-]+)-(\d{2,3})\s*:\s*(#[0-9A-Fa-f]{6})/g)) {
  if (!rampVars.has(m[1])) rampVars.set(m[1], new Map());
  rampVars.get(m[1]).set(m[2], m[3].toUpperCase());
}
const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

/* Тона новых тем → рампа legacy (accent — emerald, neutral/grey — новые). */
const TONES = [
  ['accent', 'emerald'], ['neutral', null], ['grey', null],
  ['amber', 'amber'], ['blue', 'blue'], ['brown', 'brown'], ['cyan', 'cyan'],
  ['deep-orange', 'deep-orange'], ['deep-purple', 'deep-purple'], ['green', 'green'],
  ['indigo', 'indigo'], ['light-blue', 'light-blue'], ['light-green', 'light-green'],
  ['lime', 'lime'], ['orange', 'orange'], ['pink', 'pink'], ['purple', 'purple'],
  ['red', 'red'], ['yellow', 'yellow'],
];

/* Светлота шага 500 генератора — здесь только для приведения хромы. */
const L500 = 0.625;

const rows = [];
const seeds = {};
/* Новые семена решений Э2 (02.10.2026): neutral — сине-серая, grey — чисто серая. */
seeds.neutral = { h: 235, c: 0.02 };
seeds.grey = { h: 0, c: 0 };

for (const [tone, legacy] of TONES) {
  if (!legacy) { rows.push([tone, '—', '—', '—', seeds[tone]]); continue; }
  const ramp = rampVars.get(legacy);
  if (!ramp) throw new Error('light-seeds: в Colors.css нет рампы ' + legacy);
  for (const s of STEPS) if (!ramp.get(s)) throw new Error('light-seeds: нет --' + legacy + '-' + s);
  const ref = oklch(ramp.get('500'));
  const cap = maxChroma(L500, ref.H);
  const c = Math.min(ref.C, cap);
  seeds[tone] = { h: Math.round(ref.H * 10) / 10, c: Math.round(c * 1000) / 1000 };
  rows.push([tone, legacy, '500 (L ' + ref.L.toFixed(3) + ')', ref.C.toFixed(3) + ' / cap ' + cap.toFixed(3), seeds[tone]]);
}

console.log('== light-seeds ==');
console.log('тон            legacy     пик        C / гамма        семя');
for (const [tone, legacy, peak, cc, seed] of rows) {
  console.log(tone.padEnd(14) + String(legacy).padEnd(11) + String(peak).padEnd(11) + String(cc).padEnd(17) +
    'h ' + String(seed.h).padStart(6) + '  c ' + seed.c);
}
console.log('\nseeds["ibp-light"].ramps:');
console.log(JSON.stringify(seeds, null, 2));

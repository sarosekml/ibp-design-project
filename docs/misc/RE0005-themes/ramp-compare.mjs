/* ============================================================
   ramp-compare.mjs — разовый замер (RE0005, Э6, 04.10.2026).

   Печатает рядом: рампы legacy из Colors.css (swamp, cgrey, mgrey,
   emerald) и рампы, которые Ramp.tokens.js строит из семян кандидата.
   Нужен, чтобы подобрать семена accent/neutral/grey светлой темы
   «близко к текущей» (решение человека 04.10.2026: близко, на семенах).

   Ничего не пишет. Запуск из корня проекта:
     node docs/misc/RE0005-themes/ramp-compare.mjs
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
const R = load('design-system/foundations/Themes/Ramp.tokens.js').DS_RAMP;

/* рампы Colors.css: --имя-шаг: #hex */
const css = readFileSync(path.join(DS, 'foundations', 'Colors', 'Colors.css'), 'utf8');
const ramps = new Map();
for (const m of css.matchAll(/--([a-z-]+)-(\d{2,3})\s*:\s*(#[0-9A-Fa-f]{6})/g)) {
  if (!ramps.has(m[1])) ramps.set(m[1], new Map());
  ramps.get(m[1]).set(m[2], m[3].toUpperCase());
}
const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
const get = (tone, s) => (ramps.get(tone) || new Map()).get(s) || '—';

const CAND = {
  'neutral h187 c0.020': { h: 187, c: 0.020 },
  'neutral h187 c0.014': { h: 187, c: 0.014 },
  'neutral h190 c0.018': { h: 190, c: 0.018 },
  'neutral h235 c0.020 (сейчас)': { h: 235, c: 0.020 },
  'accent  h183.9 c0.111': { h: 183.9, c: 0.111 },
  'grey    h0 c0': { h: 0, c: 0 },
};

console.log('== legacy рампы (Colors.css) ==');
console.log('шаг   swamp     cgrey     mgrey     emerald');
for (const s of STEPS) {
  console.log(s.padEnd(6) + get('swamp', s).padEnd(10) + get('cgrey', s).padEnd(10) + get('mgrey', s).padEnd(10) + get('emerald', s));
}

console.log('\n== рампы из семян (light) ==');
console.log('шаг   ' + Object.keys(CAND).map((k) => k.padEnd(30)).join(''));
for (const s of STEPS.concat(['950'])) {
  const row = Object.values(CAND).map((seed) => R.tone(seed, 'light')[s].padEnd(30)).join('');
  console.log(s.padEnd(6) + row);
}

console.log('\n== близость к legacy по ключевым ролям (light) ==');
const seedNeutral = { h: 187, c: 0.02 };
const seedGrey = { h: 0, c: 0 };
const seedAccent = { h: 183.9, c: 0.111 };
const n = R.tone(seedNeutral, 'light');
const g = R.tone(seedGrey, 'light');
const a = R.tone(seedAccent, 'light');
const pairs = [
  ['bg-page          ', 'swamp-A100', '#F5F7F7', n['50']],
  ['bg-surface       ', 'mgrey-50  ', '#FFFFFF', g['50']],
  ['bg-nav           ', 'mgrey-100 ', '#FEFEFE', g['100']],
  ['bg-muted         ', 'swamp-100 ', '#E5ECEB', n['100']],
  ['bg-muted-strong  ', 'swamp-400 ', '#7A9994', n['400']],
  ['bg-hover         ', 'swamp-50  ', '#EEF2F1', n['100']],
  ['fg-default       ', 'cgrey-600 ', '#324844', n['900']],
  ['fg-secondary     ', 'cgrey-500 ', '#6C8080', n['600']],
  ['fg-muted         ', 'cgrey-300 ', '#AAB2B1', n['400']],
  ['border-default   ', 'swamp-300 ', '#B8CCCC', n['500']],
  ['border-subtle    ', 'swamp-200 ', '#E1EDE7', n['200']],
  ['border-strong    ', 'swamp-600 ', '#6C8080', n['600']],
  ['accent-fill      ', 'emerald-500', '#00AA9B', a['600']],
  ['link             ', 'emerald-500', '#00AA9B', a['700']],
  ['fg-icon          ', 'emerald-200', '#B8D6D3', a['200']],
  ['fg-icon-strong   ', 'emerald-600', '#639994', a['600']],
  ['control-track-on ', 'emerald-100', '#CDE2E0', a['600']],
];
console.log('роль              legacy      legacy-hex  генерат');
for (const [role, name, hex, gen] of pairs) console.log(role + ' ' + name + '  ' + hex + '     ' + gen + '  ' + R.contrast(hex, gen).toFixed(2));

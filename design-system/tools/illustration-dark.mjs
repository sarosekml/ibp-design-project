#!/usr/bin/env node
/* ============================================================
   ILLUSTRATION-DARK — тёмные варианты иллюстраций (задача RE0011).

   Иллюстрации — плоские SVG (`assets/illustrations/*.svg`) с палитрой в
   диапазоне бирюзового; тёмная тема ДС (`ibp-dark`, `service`) на светлых
   картинках выглядит чужеродно. Тёмный вариант — не перерисовка, а перевод
   палитры: у каждого исходного цвета ищется тёмный того же семейства.

   Эталон карты — принятый образец `current-depo-dark.svg` (RE0010, Э3):
   шесть светлых ступеней → шесть тёмных, светлота инвертируется (светлое
   становится тёмным, тёмное — светлым), тон держится бирюзовым. Остальные
   цвета интерполируются между якорями по светлоте; за пределами якорей —
   линейное продолжение крайнего отрезка.

   Что не переводится:
   - цвета внутри `<mask>` — они функциональные (белый = показать,
     чёрный/серый = скрыть), перекраска ломает маску;
   - семантика и акцент (`#4CAF50` — успех, `#00AA9B` — акцент) — остаются;
   - `#000000` — чёрный в библиотеке встречается только как маска или как
     фигура с `fill-opacity="0"` (невидима), поэтому сохраняется.

   Файлы кладутся рядом с исходными: `<имя>-dark.svg`. Список вариантов в
   рантайме — `foundations/Illustrations/Illustrations.js` (`DARK`).

   Запуск из корня ДС:
     node tools/illustration-dark.mjs            — пересобрать все тёмные варианты
     node tools/illustration-dark.mjs --check    — сверить с диском, ничего не писать
     node tools/illustration-dark.mjs --table    — карта «светлый → тёмный»
     node tools/illustration-dark.mjs --selftest — откат: якоря, монотонность, защита маски
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ILLU_DIR = path.join(DS_ROOT, 'assets', 'illustrations');

/* Якоря принятого образца current-depo-dark: светлый → тёмный. */
const ANCHOR_PAIRS = [
  ['#A3CCC9', '#3D6068'],
  ['#B8D6D3', '#345057'],
  ['#C3DFDC', '#2D4449'],
  ['#D0EAE7', '#27393D'],
  ['#E0F3F1', '#212F33'],
  ['#F0F9F8', '#1B2429'],
];

/* Цвета, которые не переводятся: семантика, акцент, служебный чёрный. */
const KEEP = new Set(['#000000', '#4CAF50', '#00AA9B']);

/* Библиотека: тайловые иллюстрации NavTile (195×140) + фон стартовых страниц. */
const TILES = [
  'deals', 'booked-deals', 'calclate-fv', 'cash-flow', 'ckp-pipeline', 'clients',
  'corporate-transactions', 'current-depo', 'dcm-pipeline', 'dcm-potentials', 'ecm-pipeline',
  'empty-check', 'empty-folder', 'empty-loading', 'important-deals', 'important-leads', 'kpki-cal',
  'mna-pipeline', 'payment-ib', 'pipeline', 'possible-deals', 'possible-leads', 'potentials-rd',
  'qliksense-reports', 'registry', 'reports-1-c', 'reserve', 'rwa', 'sales-company',
  'sales-projects', 'settings', 'tasks',
];
const BACKGROUND = ['background-illustration'];
const LIBRARY = [...TILES, ...BACKGROUND];

const ANCHORS = ANCHOR_PAIRS
  .map(([light, dark]) => ({ light: light.toUpperCase(), dark: dark.toUpperCase(), l: lightness(light) }))
  .sort((a, b) => a.l - b.l);
const ANCHOR_MAP = new Map(ANCHORS.map((a) => [a.light, a.dark]));

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r, g, b) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).toUpperCase().padStart(2, '0');
  return '#' + c(r) + c(g) + c(b);
}
/** Светлота HSL, 0–100. */
function lightness(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  return ((Math.max(r, g, b) + Math.min(r, g, b)) / 2) * 100;
}
function mix(a, b, t) {
  const [ar, ag, ab] = hexToRgb(a), [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

/** Перевод одного цвета. Сохраняемые и якорные — как есть; остальные — интерполяция. */
export function mapColor(hex) {
  const H = hex.toUpperCase();
  if (KEEP.has(H)) return H;
  if (ANCHOR_MAP.has(H)) return ANCHOR_MAP.get(H);
  const L = lightness(H);
  let i = 0;
  while (i < ANCHORS.length - 1 && ANCHORS[i + 1].l < L) i++;
  let a = ANCHORS[i], b = ANCHORS[i + 1];
  if (L <= ANCHORS[0].l) { a = ANCHORS[0]; b = ANCHORS[1]; }
  else if (L >= ANCHORS[ANCHORS.length - 1].l) { a = ANCHORS[ANCHORS.length - 2]; b = ANCHORS[ANCHORS.length - 1]; }
  let t = (L - a.l) / (b.l - a.l);
  t = Math.max(-4, Math.min(1.6, t)); /* крайнее продолжение — с запасом, без улёта */
  return mix(a.dark, b.dark, t);
}

/** Диапазоны тел `<mask>…</mask>`: их цвета функциональные, не красятся. */
function maskRanges(txt) {
  const ranges = [];
  for (const m of txt.matchAll(/<mask\b[^>]*>[\s\S]*?<\/mask>/g)) ranges.push([m.index, m.index + m[0].length]);
  return ranges;
}
const inRanges = (p, rs) => rs.some(([a, b]) => p >= a && p < b);

/** Перекраска всего SVG: видимые `fill`/`stroke`/`stop-color`, вне тел масок. */
export function recolor(txt) {
  const rs = maskRanges(txt);
  return txt.replace(/(fill|stroke|stop-color)="(#[0-9A-Fa-f]{6})"/g, (full, attr, hex, off) => {
    if (inRanges(off, rs)) return full;
    return attr + '="' + mapColor(hex) + '"';
  });
}

/** Светлые цвета, оставшиеся после перекраски (сторож: форма краски не учтена).
    Сканируются ВСЕ `#RRGGBB`, кроме тел масок, — градиентные `stop-color` в том
    числе (именно они однажды остались светлыми: recolor знал только fill/stroke). */
export function visibleLight(txt, limit = 60) {
  const rs = maskRanges(txt);
  const bad = [];
  for (const m of txt.matchAll(/#[0-9A-Fa-f]{6}/g)) {
    if (inRanges(m.index, rs)) continue;
    const c = m[0].toUpperCase();
    if (KEEP.has(c) || lightness(c) <= limit) continue;
    bad.push(c);
  }
  return [...new Set(bad)];
}

function generate(names, write) {
  const written = [], defects = [];
  for (const name of names) {
    const src = path.join(ILLU_DIR, name + '.svg');
    const dst = path.join(ILLU_DIR, name + '-dark.svg');
    if (!existsSync(src)) { defects.push('нет исходника ' + name + '.svg'); continue; }
    const made = recolor(readFileSync(src, 'utf8'));
    const left = visibleLight(made);
    if (left.length) defects.push(name + '.svg — после перекраски остались светлые цвета: ' + left.join(', ') + ' (форма краски не учтена генератором)');
    if (write) {
      if (!existsSync(dst) || readFileSync(dst, 'utf8') !== made) {
        writeFileSync(dst, made, 'utf8');
        written.push(name + '-dark.svg');
      }
      continue;
    }
    if (!existsSync(dst)) defects.push('нет ' + name + '-dark.svg — собрать: node tools/illustration-dark.mjs');
    else if (readFileSync(dst, 'utf8') !== made) defects.push(name + '-dark.svg разошёлся с генератором — правлен руками или палитра исходника изменилась: node tools/illustration-dark.mjs');
  }
  return { written, defects };
}

function table() {
  const colors = new Set();
  for (const name of LIBRARY) {
    const txt = readFileSync(path.join(ILLU_DIR, name + '.svg'), 'utf8');
    for (const m of txt.matchAll(/#[0-9A-Fa-f]{6}/g)) colors.add(m[0].toUpperCase());
  }
  const out = ['== карта иллюстраций: светлый (L) → тёмный =='];
  for (const c of [...colors].sort((a, b) => lightness(b) - lightness(a))) {
    out.push(c + '  L=' + lightness(c).toFixed(1).padStart(5) + '  →  ' + mapColor(c));
  }
  return out.join('\n');
}

function selftest() {
  const out = ['== illustration-dark --selftest =='];
  let failed = 0;
  const t = (name, ok) => { out.push((ok ? 'ok    ' : 'FAIL  ') + name); if (!ok) failed++; };

  /* 1. Якоря образца воспроизводятся точно — карта не разъехалась с референсом. */
  for (const a of ANCHORS) t('якорь ' + a.light + ' → ' + a.dark, mapColor(a.light) === a.dark);

  /* 2. Монотонность: чем светлее исходник, тем темнее результат. */
  let monotone = true;
  for (let i = 1; i < ANCHORS.length; i++) {
    if (!(lightness(ANCHORS[i].dark) < lightness(ANCHORS[i - 1].dark))) monotone = false;
  }
  t('тёмная шкала монотонна (светлее исходник → темнее результат)', monotone);

  /* 3. Сохраняемые цвета не трогаются. */
  for (const c of KEEP) t('сохраняется ' + c, mapColor(c) === c);

  /* 4. Цвета внутри маски не красятся, вне — красятся. */
  const fixture = '<mask><rect fill="#F0F9F8"/></mask><path fill="#F0F9F8"/>';
  const got = recolor(fixture);
  t('маска не красится, видимая фигура красится',
    got === '<mask><rect fill="#F0F9F8"/></mask><path fill="#1B2429"/>');

  /* 5. Градиентный stop-color тоже красится. Именно он однажды остался светлым:
     recolor знал только fill/stroke, а фоновая иллюстрация залита градиентами. */
  const grad = '<linearGradient><stop stop-color="#E5ECEB"/></linearGradient>';
  t('stop-color градиента красится (не остаётся светлым)',
    recolor(grad).includes(mapColor('#E5ECEB')) && visibleLight(recolor(grad)).length === 0);

  /* 6. Сторож visibleLight: светлый цвет вне маски виден, в теле маски — скрыт. */
  t('светлый цвет вне маски ловится', visibleLight('<path fill="#E5ECEB"/>').includes('#E5ECEB'));
  t('светлый цвет в теле маски не ловится', visibleLight('<mask><rect fill="#E5ECEB"/></mask>').length === 0);

  out.push('ВЕРДИКТ: ' + (failed ? 'FAIL (провалено: ' + failed + ')' : 'OK'));
  console.log(out.join('\n'));
  process.exit(failed ? 1 : 0);
}

const args = process.argv.slice(2);
if (args.includes('--selftest')) selftest();
else if (args.includes('--table')) console.log(table());
else {
  const write = !args.includes('--check');
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
  const names = only ? [only] : LIBRARY;
  const { written, defects } = generate(names, write);
  if (write) {
    console.log('== illustration-dark ==');
    for (const w of written) console.log('записан ' + w);
    for (const d of defects) console.log('FAIL  ' + d);
    if (!written.length && !defects.length) console.log('изменений нет — все тёмные варианты собраны');
    console.log('ВЕРДИКТ: ' + (defects.length ? 'FAIL (дефектов: ' + defects.length + ')' : 'OK'));
    process.exit(defects.length ? 1 : 0);
  } else {
    console.log('== illustration-dark --check ==');
    for (const d of defects) console.log('FAIL  ' + d);
    console.log('ВЕРДИКТ: ' + (defects.length ? 'FAIL (дефектов: ' + defects.length + ')' : 'OK'));
    process.exit(defects.length ? 1 : 0);
  }
}

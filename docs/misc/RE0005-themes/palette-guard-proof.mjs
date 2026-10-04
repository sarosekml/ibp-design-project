/* ============================================================
   palette-guard-proof.mjs — разовое доказательство сторожа (RE0005, Э6).

   Показывает, что новый шаг `theme-build --check` ловит расхождение
   темы-«палитры» (ibp-light) с Palette.css: на эталоне молчит, на
   подменённой в памяти роли — падает. Файлы не трогаются.

   Запуск из корня проекта:
     node docs/misc/RE0005-themes/palette-guard-proof.mjs
   ============================================================ */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { check } from '../../../design-system/tools/theme-build.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const DS = path.join(ROOT, 'design-system');
const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');

function load(rel) {
  const ctx = { window: {} };
  vm.runInNewContext(readFileSync(path.join(ROOT, rel), 'utf8'), ctx, { timeout: 2000, filename: rel });
  return ctx.window;
}
const T = load('design-system/foundations/Themes/Themes.tokens.js').DS_THEMES;
const R = load('design-system/foundations/Themes/Ramp.tokens.js').DS_RAMP;
const colorsCss = read('design-system/foundations/Colors/Colors.css');
const paletteCss = read('design-system/foundations/Colors/Palette.css');

const clone = (o) => JSON.parse(JSON.stringify(o));
const paletteDefects = (tokens) => check(tokens, R, colorsCss, paletteCss, false).defects.filter((d) => d.includes('тема-«палитра»'));

const ok = paletteDefects(clone(T));
console.log('эталон: дефектов сторожа — ' + ok.length + (ok.length ? ' → ' + ok.join(' | ') : ''));

const broken = clone(T);
broken.themeValues['ibp-light']['--color-accent-fill'] = '#123456';
const bad = paletteDefects(broken);
console.log('подмена роли: дефектов сторожа — ' + bad.length + (bad.length ? ' → ' + bad[0] : ''));

const pass = ok.length === 0 && bad.length === 1 && bad[0].includes('--primary');
console.log(pass ? 'ВЕРДИКТ: OK — сторож молчит на эталоне, падает на подмене' : 'ВЕРДИКТ: FAIL');
process.exit(pass ? 0 : 1);

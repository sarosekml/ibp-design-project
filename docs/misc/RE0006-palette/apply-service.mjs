/* ============================================================
   apply-service.mjs — разовый скрипт RE0006, Э6 (04.10.2026).

   `service` = новая тёмная тема (`ibp-dark`) с пурпурным акцентом
   Untitled UI. Копируются семена и переопределения ролей тёмной,
   меняется только рампа акцента: ступени даны в ориентации тёмного
   профиля (50 — тёмный, 950 — светлый), узнаваемый `#7F56D9` —
   на ступени 500 (граница/статус), заливка 600 светлее (на ней
   тёмный текст `fg-on-fill`).

   Запуск: node docs/misc/RE0006-palette/apply-service.mjs
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const SRC = path.join(ROOT, 'design-system/foundations/Themes/Themes.tokens.js');

/* Пурпур Untitled UI, развёрнутый под тёмную шкалу (50 тёмный → 950 светлый). */
const PURPLE = {
  50: '#1E1240', 100: '#2C1C5F', 200: '#42307D', 300: '#53389E',
  400: '#6941C6', 500: '#7F56D9', 600: '#9E77ED', 700: '#B692F6',
  800: '#D6BBFB', 900: '#E9D7FE', 950: '#F4EBFF',
};

const text = readFileSync(SRC, 'utf8');
const marker = 'window.DS_THEMES = ';
const at = text.indexOf(marker);
if (at < 0) throw new Error('не найден window.DS_THEMES');
const header = text.slice(0, at + marker.length);

const ctx = { window: {} };
vm.runInNewContext(text, ctx, { filename: SRC });
const obj = ctx.window.DS_THEMES;

const copy = (o) => JSON.parse(JSON.stringify(o));

obj.seeds['service'].profile = 'dark';
obj.seeds['service'].ramps = copy(obj.seeds['ibp-dark'].ramps);
obj.seeds['service'].ramps.accent = { values: PURPLE };
obj.themeValues['service'] = copy(obj.themeValues['ibp-dark']);

writeFileSync(SRC, header + JSON.stringify(obj, null, 2) + ';\n', 'utf8');
console.log('записано: ' + SRC);
console.log('service: neutral/grey/статусы — как ibp-dark; акцент — пурпур ' + PURPLE[500] + '/' + PURPLE[600]);

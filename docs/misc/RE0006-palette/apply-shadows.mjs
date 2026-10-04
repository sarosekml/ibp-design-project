/* ============================================================
   apply-shadows.mjs — разовый скрипт RE0006, Э5 (04.10.2026).

   Тени ДС — по модели Untitled UI (`shadow-xs…3xl`): мягкие
   многослойные, малые альфы, цвет — `--color-shadow` темы.
   `--elevation-1…5` и `--shadow-modal-form` получают значения
   модели; компонентные тени уже на ролях (точечные правила RE0005).

   Запуск: node docs/misc/RE0006-palette/apply-shadows.mjs
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..', '..');
const SRC = path.join(ROOT, 'design-system/foundations/Themes/Themes.tokens.js');

const cm = (p) => 'color-mix(in srgb, var(--color-shadow) ' + p + '%, transparent)';

const ELEV = [
  { name: '--elevation-1', from: '0 1px 2px rgba(40, 50, 55, .28)',
    value: '0 1px 3px ' + cm(10) + ', 0 1px 2px -1px ' + cm(10) },
  { name: '--elevation-2', from: '0 10px 30px rgba(40, 50, 55, .16)',
    value: '0 4px 6px -1px ' + cm(10) + ', 0 2px 4px -2px ' + cm(6) },
  { name: '--elevation-3', from: '0 14px 38px rgba(40, 50, 55, .18)',
    value: '0 12px 16px -4px ' + cm(8) + ', 0 4px 6px -2px ' + cm(3) + ', 0 2px 2px -1px ' + cm(4) },
  { name: '--elevation-4', from: '0 18px 48px rgba(40, 50, 55, .20)',
    value: '0 20px 24px -4px ' + cm(8) + ', 0 8px 8px -4px ' + cm(3) + ', 0 3px 3px -1.5px ' + cm(4) },
  { name: '--elevation-5', from: '0 22px 58px rgba(40, 50, 55, .22)',
    value: '0 24px 48px -12px ' + cm(18) + ', 0 4px 4px -2px ' + cm(4) },
  { name: '--shadow-modal-form', from: '0 24px 64px rgba(40, 50, 55, .28)',
    value: '0 32px 64px -12px ' + cm(14) + ', 0 5px 5px -2.5px ' + cm(4) },
];

const text = readFileSync(SRC, 'utf8');
const marker = 'window.DS_THEMES = ';
const at = text.indexOf(marker);
if (at < 0) throw new Error('не найден window.DS_THEMES');
const header = text.slice(0, at + marker.length);

const ctx = { window: {} };
vm.runInNewContext(text, ctx, { filename: SRC });
const obj = ctx.window.DS_THEMES;

obj.elevation = ELEV;

writeFileSync(SRC, header + JSON.stringify(obj, null, 2) + ';\n', 'utf8');
console.log('записано: ' + SRC);
console.log('теней: ' + ELEV.length + ' (' + ELEV.map((e) => e.name).join(', ') + ')');

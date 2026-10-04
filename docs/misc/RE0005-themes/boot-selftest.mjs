#!/usr/bin/env node
/* Разовая проверка ds-theme-boot.js (RE0005, Э3.2): атрибут темы и два <link>.
   Браузерный прогон в контуре запрещён — механика того же класса, что
   selftest boot-build.mjs: первый тег исполняется в vm на подставном DOM. */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SRC = 'design-system/docs-kit/ds-theme-boot.js';
const BASE = 'file:///p/design-system/docs-kit/ds-theme-boot.js';
const src = readFileSync(SRC, 'utf8');

function run(search, store) {
  const links = [];
  const attrs = {};
  const ctx = {
    URL, console,
    location: { search },
    document: {
      currentScript: { src: BASE },
      documentElement: {
        setAttribute: (k, v) => { attrs[k] = v; },
        removeAttribute: (k) => { delete attrs[k]; },
      },
      write: (s) => links.push(s),
    },
    localStorage: { getItem: (k) => (k in store ? store[k] : null) },
  };
  ctx.window = ctx;
  vm.runInNewContext(src, ctx, { timeout: 1000 });
  return { attr: attrs['data-theme'], links };
}

const cases = [
  ['нет выбора — без атрибута', run('', {}).attr === undefined],
  ['?theme=ibp-dark — атрибут', run('?theme=ibp-dark', {}).attr === 'ibp-dark'],
  ['localStorage service — атрибут', run('', { 'ds.theme': 'service' }).attr === 'service'],
  ['?theme=legacy поверх хранилища — без атрибута', run('?theme=legacy', { 'ds.theme': 'service' }).attr === undefined],
];
const links = run('', {}).links.join('');
cases.push(['подключены Themes.css и Themes.pages.css',
  links.includes('file:///p/design-system/foundations/Themes/Themes.css')
  && links.includes('file:///p/design-system/foundations/Themes/Themes.pages.css')]);
cases.push(['подключены данные и рантайм тем',
  links.includes('file:///p/design-system/foundations/Themes/Themes.tokens.js')
  && links.includes('file:///p/design-system/foundations/Themes/Themes.js')]);

let bad = 0;
for (const [name, ok] of cases) { if (!ok) bad++; console.log((ok ? 'ok    ' : 'FAIL  ') + name); }
console.log('ВЕРДИКТ: ' + (bad ? 'FAIL (' + bad + ')' : 'OK'));
process.exit(bad ? 1 : 0);

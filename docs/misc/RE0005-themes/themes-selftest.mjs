#!/usr/bin/env node
/* Разовая проверка API Themes.js (RE0005, Э3.2): get/set/list, хранение,
   чужое имя темы. Браузерный прогон запрещён — рантайм исполняется в vm,
   `mount()` не срабатывает (`readyState: 'loading'`), проверяется логика. */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src = readFileSync('design-system/foundations/Themes/Themes.js', 'utf8');

function makeCtx(store) {
  const attrs = {};
  const events = [];
  const ctx = {
    console: { warn: () => {} },
    CustomEvent: function (type, opts) { this.type = type; this.detail = opts && opts.detail; },
    document: {
      readyState: 'loading',
      addEventListener: () => {},
      documentElement: {
        setAttribute: (k, v) => { attrs[k] = String(v); },
        getAttribute: (k) => (k in attrs ? attrs[k] : null),
        removeAttribute: (k) => { delete attrs[k]; },
      },
      dispatchEvent: (e) => { events.push(e); },
    },
    localStorage: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
    },
    DS_THEMES: { themes: ['ibp-light', 'ibp-dark', 'service'] },
  };
  ctx.window = ctx;
  vm.runInNewContext(src, ctx, { timeout: 1000 });
  return { ctx, attrs, events };
}

const store = {};
const { ctx, attrs, events } = makeCtx(store);
const T = ctx.DSTheme;
const cases = [];
const eq = (name, got, want) => cases.push([name, JSON.stringify(got) === JSON.stringify(want)]);

eq('list: legacy + 3 темы', T.list().map((t) => t.id), ['legacy', 'ibp-light', 'ibp-dark', 'service']);
eq('list: метка legacy', T.list()[0].label, 'Текущая');
eq('get по умолчанию — legacy', T.get(), 'legacy');
eq('set возвращает тему', T.set('ibp-dark'), 'ibp-dark');
eq('set ставит атрибут', attrs['data-theme'], 'ibp-dark');
eq('set пишет в хранилище', store['ds.theme'], 'ibp-dark');
eq('set legacy снимает атрибут', (T.set('legacy'), attrs['data-theme']), undefined);
eq('set legacy чистит хранилище', store['ds.theme'], undefined);
eq('чужое имя — не меняет тему', (T.set('foo'), T.get()), 'legacy');
eq('событие ds:themechange', events[events.length - 1] && events[events.length - 1].type, 'ds:themechange');
eq('detail темы', events[events.length - 1] && events[events.length - 1].detail.theme, 'legacy');

let bad = 0;
for (const [name, ok] of cases) { if (!ok) bad++; console.log((ok ? 'ok    ' : 'FAIL  ') + name); }
console.log('ВЕРДИКТ: ' + (bad ? 'FAIL (' + bad + ')' : 'OK'));
process.exit(bad ? 1 : 0);

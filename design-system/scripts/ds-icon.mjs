#!/usr/bin/env node
/* ============================================================
   DS-ICON — достать один глиф из icons-data.js, не читая файл.

   icons-data.js — 671 KB в одну строку: чтение целиком съедает
   контекст и запрещено правилами (MAINTAINING, «Жёсткие запреты»).
   Здесь файл разбирается как JSON и наружу отдаётся ровно то,
   что просили.

   Запуск (из корня ДС):
     node scripts/ds-icon.mjs check              # SVG одного глифа
     node scripts/ds-icon.mjs --list             # все имена (247 шт.)
     node scripts/ds-icon.mjs --list deal        # имена по подстроке
     node scripts/ds-icon.mjs --selftest         # рантайм ds-icons.js: уникальные id копий

   Имя не найдено — печатаются похожие, код выхода 1.
   Полный каталог с картинками — pages/foundations/Icons.html.

   --selftest (задача 0007) исполняет icons-data.js и ds-icons.js в vm на
   заглушках DOM и проверяет: копии глифа не делят id, ссылки url(#…) и
   href="#…" ведут в свою копию, копия отличается от исходной строки только
   суффиксами id; apply() и window.DS_ICONS отдают такие копии; в ds.js
   ds-icons.js грузится сразу за icons-data.js и раньше рантаймов, которые
   читают DS_ICONS напрямую. Шаг гейта харнеса и ds-check.mjs --all.
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const src = await readFile(path.join(ROOT, 'scripts', 'icons-data.js'), 'utf8');
// формат файла: window.DS_ICONS = {"имя":"<svg …>", …};
const json = src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1);
let icons;
try {
  icons = JSON.parse(json);
} catch (e) {
  console.error('icons-data.js не разобрался как JSON: ' + e.message);
  process.exit(2);
}

const names = Object.keys(icons);
const args = process.argv.slice(2);

/* ---------------- --selftest: рантайм ds-icons.js ---------------- */

/* Страница в vm: документ уже разобран (readyState complete — apply() идёт при
   загрузке рантайма), элементы <i data-icon> — заглушки с innerHTML. */
function page(els, warns) {
  const doc = {
    readyState: 'complete',
    head: { appendChild() {} },
    createElement: () => ({ textContent: '' }),
    addEventListener() {},
    querySelectorAll: (sel) => (sel === '[data-icon]' ? els : []),
  };
  const ctx = { document: doc, console: { warn: (m) => warns.push(String(m)), log() {} } };
  ctx.window = ctx;
  return vm.createContext(ctx);
}
function iconEl(name) {
  return { dataset: {}, innerHTML: '', getAttribute: (k) => (k === 'data-icon' ? name : null), querySelector: () => null };
}
const idsOf = (s) => [...s.matchAll(/\sid=["']([^"']+)["']/g)].map((m) => m[1]);
const refsOf = (s) => [...s.matchAll(/url\(["']?#([^"')]+)["']?\)|\s(?:xlink:)?href=["']#([^"']+)["']/g)].map((m) => m[1] || m[2]);

async function selftest() {
  const out = ['== ds-icon.mjs --selftest =='];
  let total = 0, failed = 0;
  const pass = (ok, title, why) => { total++; if (!ok) failed++; out.push((ok ? 'ok    ' : 'FAIL  ') + title + (!ok && why ? ' — ' + why : '')); };
  /* кейс, упавший исключением, — FAIL со своей строкой, а не обрыв прогона */
  const guard = async (title, fn) => { try { await fn(); } catch (e) { pass(false, title, 'исключение: ' + (e && e.message || e)); } };
  const dataSrc = src;
  const runtimeSrc = await readFile(path.join(ROOT, 'scripts', 'ds-icons.js'), 'utf8');
  const dsSrc = await readFile(path.join(ROOT, 'scripts', 'ds.js'), 'utf8');

  /* 1. Копии всех глифов: id не пересекаются, ссылки — в свою копию, снятие суффикса — исходная строка. */
  await guard('1 копии всех глифов', async () => {
    const warns = [];
    const ctx = page([], warns);
    vm.runInContext(dataSrc, ctx);
    vm.runInContext(runtimeSrc, ctx);
    const api = ctx.window.dsIcons;
    const bad = [];
    let withIds = 0, withRefs = 0, withRepeats = 0;
    for (const n of names) {
      const raw = icons[n];
      const a = api && typeof api.svg === 'function' ? api.svg(n) : '';
      const b = api && typeof api.svg === 'function' ? api.svg(n) : '';
      const rawIds = new Set(idsOf(raw));
      if (!rawIds.size) { if (a !== raw) bad.push(n + ': глиф без id изменился'); continue; }
      withIds++;
      if (rawIds.size !== idsOf(raw).length) withRepeats++;
      const ia = new Set(idsOf(a)), ib = new Set(idsOf(b));
      if (!ia.size) { bad.push(n + ': в копии нет id'); continue; }
      if (ia.size !== idsOf(a).length) { bad.push(n + ': id повторяется внутри копии'); continue; }
      if ([...ia].some((x) => ib.has(x))) { bad.push(n + ': у двух копий общий id'); continue; }
      if ([...ia].some((x) => rawIds.has(x))) { bad.push(n + ': в копии остался исходный id'); continue; }
      const refs = refsOf(a);
      if (refs.length) withRefs++;
      if (refs.some((r) => rawIds.has(r) || (/-i\d+$/.test(r) && !ia.has(r)))) { bad.push(n + ': ссылка ведёт не в свою копию'); continue; }
      const k = (idsOf(a)[0].match(/-i(\d+)$/) || [])[1];
      if (!k || a.replace(new RegExp('-i' + k + '(?:-\\d+)?(?=["\')])', 'g'), '') !== raw) bad.push(n + ': копия отличается от исходной не только суффиксами id');
    }
    pass(names.length > 0 && !bad.length, '1 копии ' + names.length + ' глифов (с id — ' + withIds + ', со ссылками url/href — ' + withRefs + ', с повтором id внутри глифа — ' + withRepeats + '): id уникальны и между копиями, и внутри копии, ссылки в свою копию, остальное байт в байт', bad.slice(0, 5).join('; ') || (api ? '' : 'нет window.dsIcons'));
  });

  /* 2. apply(): разные id у двух копий, повторный apply не вставляет заново, неизвестное имя — предупреждение. */
  await guard('2 apply()', async () => {
    const warns = [];
    const els = [iconEl('message-text'), iconEl('message-text'), iconEl('no-such-glyph')];
    const ctx = page(els, warns);
    vm.runInContext(dataSrc, ctx);
    vm.runInContext(runtimeSrc, ctx);
    const [e1, e2, e3] = els;
    const i1 = idsOf(e1.innerHTML), i2 = idsOf(e2.innerHTML);
    const first = e1.innerHTML;
    ctx.window.dsIcons.apply();
    pass(i1.length > 0 && i1.every((x) => !i2.includes(x)) && e1.dataset.iconDone === '1' && e2.dataset.iconDone === '1'
      && e1.innerHTML === first && e3.innerHTML === '' && warns.some((w) => w.includes('no-such-glyph')),
      '2 apply(): две копии message-text с разными id, повторный apply не вставляет заново, неизвестное имя — предупреждение без вставки',
      JSON.stringify({ i1, i2, warns }));
  });

  /* 3. DS_ICONS после ds-icons.js отдаёт копии; при обратном порядке загрузки — замена при первом обращении. */
  await guard('3 DS_ICONS после ds-icons.js', async () => {
    const ctx = page([], []);
    vm.runInContext(dataSrc, ctx);
    vm.runInContext(runtimeSrc, ctx);
    const D = ctx.window.DS_ICONS;
    const r1 = D['message-text'], r2 = D['message-text'];
    const keysOk = Object.keys(D).length === names.length && Object.keys(D).every((n) => icons[n] !== undefined);
    const els = [iconEl('message-text')];
    const ctx2 = page(els, []);
    vm.runInContext(runtimeSrc, ctx2);   // рантайм раньше данных: замены ещё нет
    vm.runInContext(dataSrc, ctx2);
    ctx2.window.dsIcons.apply();
    const D2 = ctx2.window.DS_ICONS;
    pass(keysOk && D.__dsUnique === true && idsOf(r1).every((x) => !idsOf(r2).includes(x))
      && D2.__dsUnique === true && idsOf(els[0].innerHTML).length > 0 && !idsOf(els[0].innerHTML).some((x) => idsOf(icons['message-text']).includes(x)),
      '3 DS_ICONS после ds-icons.js: те же ключи, каждое чтение — копия со своими id; рантайм раньше данных — замена при первом apply()');
  });

  /* 4. Порядок в ds.js: ds-icons.js сразу за icons-data.js и раньше каждого рантайма, который читает DS_ICONS. */
  await guard('4 порядок в ds.js', async () => {
    const list = [...dsSrc.matchAll(/'([\w.-]+\.js)'/g)].map((m) => m[1]);
    const iData = list.indexOf('icons-data.js'), iRt = list.indexOf('ds-icons.js');
    const readers = [];
    for (const f of list) {
      if (f === 'icons-data.js' || f === 'ds-icons.js') continue;
      let text = '';
      try { text = await readFile(path.join(ROOT, 'scripts', f), 'utf8'); } catch { continue; }
      if (/DS_ICONS/.test(text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, ''))) readers.push(f);
    }
    const early = readers.filter((f) => list.indexOf(f) < iRt);
    pass(iData >= 0 && iRt === iData + 1 && !early.length,
      '4 ds.js: ds-icons.js сразу за icons-data.js и раньше рантаймов, читающих DS_ICONS (' + readers.join(', ') + ')',
      'icons-data.js — ' + iData + ', ds-icons.js — ' + iRt + (early.length ? ', раньше рантайма иконок: ' + early.join(', ') : ''));
  });

  out.push('ВЕРДИКТ: ' + (failed ? 'FAIL (кейсов не прошло: ' + failed + ' из ' + total + ')' : 'OK (кейсов: ' + total + ')'));
  console.log(out.join('\n'));
  return failed ? 1 : 0;
}

if (args[0] === '--selftest') process.exit(await selftest());

if (args[0] === '--list') {
  const filter = (args[1] || '').toLowerCase();
  const list = filter ? names.filter((n) => n.toLowerCase().includes(filter)) : names;
  console.log(list.sort().join('\n'));
  console.log(`\n— ${list.length} из ${names.length}`);
  process.exit(0);
}

const name = args[0];
if (!name) {
  console.error('Использование: node scripts/ds-icon.mjs <имя глифа> | --list [подстрока]');
  process.exit(2);
}

if (icons[name]) {
  console.log(icons[name]);
  process.exit(0);
}

const near = names.filter((n) => n.toLowerCase().includes(name.toLowerCase()));
console.error(`Глифа «${name}» нет (всего ${names.length}).`);
if (near.length) console.error('Похожие: ' + near.slice(0, 15).join(', '));
else console.error('Список имён: node scripts/ds-icon.mjs --list');
process.exit(1);

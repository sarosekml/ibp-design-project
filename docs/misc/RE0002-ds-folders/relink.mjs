#!/usr/bin/env node
// RE0002 — переписать ссылки по карте переезда (разовый скрипт, удаляется на Э3).
//
//   node docs/misc/RE0002-ds-folders/relink.mjs [--dry] [--scope b|docs] [--out <файл>]
//
// Файлы уже перенесены (коммит А): скрипт знает старое место каждого файла по
// карте и для каждого пути в тексте решает, куда он вёл ДО переезда:
//   · относительный путь (`../../styles/x.css`, `Avatar.html` в href) —
//     разрешается от старой папки файла; вёл в известный файл — пересчитывается
//     от новой папки к новому месту цели;
//   · путь от корня ДС (`styles/x.css` в YAML спеки, `pages/atoms/X.html` в
//     ds-nav.js, `data-ds`) — заменяется по карте;
//   · `design-system/<старый путь>` в любом файле — по карте, префикс сохраняется;
//   · `window.__DS_ROOT = '../../'` — по глубине новой папки;
//   · сценарий страницы `*.page.js`: его ссылки на страницы считаются от папки
//     страницы, а не от папки сценария.
// Голое имя без `/` трогается только там, где это точно ссылка: href/src,
// url(), ссылка markdown `](…)`, список FILES в ds.js.
//
// --scope b    — коммит Б: файлы ДС, кроме документов (журнал, AGENTS, MAINTAINING,
//                readme, tools/), и data-ds/ссылки на ДС в файлах вне ДС из списка OUTSIDE_B.
// --scope docs — Э3: документы ДС и проекта (список задаётся там же).
// Генераты не трогаются: их пересобирают генераторы.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const DS = 'design-system';
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const DRY = process.argv.includes('--dry');
const SCOPE = arg('--scope') || 'b';
const OUT = arg('--out') || path.join(HERE, 'relink-' + SCOPE + '.txt');

const MAP = JSON.parse(readFileSync(path.join(HERE, 'move-map.json'), 'utf8'));
const fwd = new Map(MAP.moves.map((m) => [m.from, m.to]));
const rev = new Map(MAP.moves.map((m) => [m.to, m.from]));
for (const c of MAP.copies) rev.set(c.to, c.from);
const oldKnown = new Set([...MAP.moves.map((m) => m.from), ...MAP.stay]);
const P = path.posix;

// файлы ДС, которые коммит Б не трогает: история и документы (Э3), инструменты (правятся руками)
const DS_SKIP_B = [/^CHANGELOG\.md$/, /^AGENTS\.md$/, /^MAINTAINING\.md$/, /^readme\.md$/, /^tools\//, /^uploads\//];
// файлы вне ДС в коммите Б: data-ds экранов и хаба, фикстура линтера с прямой ссылкой на рантайм
const OUTSIDE_B = [
  'index.html', 'apps/local-components/index.html',
  'apps/postrade/deals-app/pages/Deal.html', 'apps/postrade/deals-app/pages/MainPage.html',
  'apps/postrade/deals-app/pages/Portfolio.html',
  '.agents/tools/fixtures/lint-screens/A7.bad.html',
];
const TEXT = /\.(html|css|js|mjs|md|json|txt)$/;

const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
let files;
if (SCOPE === 'b') {
  files = tracked.filter((f) => f.startsWith(DS + '/') && TEXT.test(f)
    && !DS_SKIP_B.some((rx) => rx.test(f.slice(DS.length + 1))))
    .concat(OUTSIDE_B);
} else if (SCOPE === 'tools') {
  // код инструментов: справка, сообщения, комментарии — только точные пути от корня ДС
  files = tracked.filter((f) => /^design-system\/tools\/[^/]+\.(mjs|js)$/.test(f)
    || /^\.agents\/tools\/[^/]+\.mjs$/.test(f) || /^\.agents\/skills\/[^/]+\/tooling\/[^/]+\.mjs$/.test(f));
} else {
  throw new Error('relink: --scope ' + SCOPE + ' ещё не задан (Э3)');
}

// ---------- один путь ----------
const TOKEN = /(?<![\w.\/@:$-])((?:\.\.?\/)*(?:[\w-][\w.-]*\/)*[\w-][\w.-]*\.(?:css|js|mjs|html|md|otf|svg|json|png))(?![\w\/-])/g;
const BARE_CTX = /(?:\b(?:href|src)\s*=\s*["']?|url\(\s*["']?|\]\()$/;

/* tok — путь как в тексте; ctx — { dsOld, baseOld, baseNew, bare }:
   baseOld/baseNew — папка, от которой считается относительный путь (от корня
   репозитория), dsOld — файл лежит в ДС. Возвращает новый путь или null. */
function rewrite(tok, ctx) {
  // 1. явный путь в ДС: …design-system/<старый путь>
  const at = tok.indexOf(DS + '/');
  if (at >= 0 && (at === 0 || tok[at - 1] === '/')) {
    const rest = tok.slice(at + DS.length + 1);
    return fwd.has(rest) ? tok.slice(0, at + DS.length + 1) + fwd.get(rest) : null;
  }
  const hasSlash = tok.includes('/');
  if (!hasSlash && !ctx.bare) return null;
  // 2. относительный путь от старой папки файла
  const target = P.normalize(P.join(ctx.baseOld, tok));
  let newTarget = null;
  if (target.startsWith(DS + '/')) {
    const r = target.slice(DS.length + 1);
    if (oldKnown.has(r)) newTarget = DS + '/' + (fwd.get(r) || r);
  } else if (!target.startsWith('../') && existsSync(path.join(ROOT, target)) && !rev.has(target)) {
    newTarget = target; // цель вне ДС на месте
  }
  if (newTarget) {
    let rel = P.relative(ctx.baseNew, newTarget);
    if (tok.startsWith('./') && !rel.startsWith('.')) rel = './' + rel;
    return rel === tok ? null : rel;
  }
  // 3. путь от корня ДС (YAML спек, ds-nav.js, самоподключение CSS, data-ds, проза)
  if (hasSlash && fwd.has(tok)) return fwd.get(tok);
  return null;
}

// ---------- файл ----------
const report = [];
let changedFiles = 0, changes = 0;
const lineOf = (text, idx) => text.slice(0, idx).split('\n').length;

for (const fNew of files) {
  const abs = path.join(ROOT, fNew);
  if (!existsSync(abs)) { report.push('НЕТ ФАЙЛА ' + fNew); continue; }
  const inDs = fNew.startsWith(DS + '/');
  const dsRelNew = inDs ? fNew.slice(DS.length + 1) : null;
  const dsRelOld = inDs ? (rev.get(dsRelNew) || dsRelNew) : null;
  const fOld = inDs ? DS + '/' + dsRelOld : fNew;
  let baseOld = P.dirname(fOld), baseNew = P.dirname(fNew);
  // сценарий страницы: ссылки — от папки своей страницы
  if (inDs && fNew.endsWith('.page.js')) {
    const pageNew = dsRelNew.replace(/\.page\.js$/, '.html');
    if (!rev.has(pageNew)) throw new Error('relink: у сценария ' + fNew + ' нет страницы в той же папке');
    baseOld = P.dirname(DS + '/' + rev.get(pageNew));
  }
  const isEntry = dsRelNew === 'ds.js';
  const text = readFileSync(abs, 'utf8');
  const edits = []; // [start, end, new]

  for (const m of text.matchAll(TOKEN)) {
    const tok = m[1];
    const before = text.slice(Math.max(0, m.index - 40), m.index);
    const bare = BARE_CTX.test(before) || (isEntry && /'$/.test(before));
    // вне ДС — только data-ds (от корня ДС) и явные пути design-system/…
    let nu;
    if (SCOPE === 'tools') {
      const at = tok.indexOf(DS + '/');
      nu = at >= 0 ? rewrite(tok, { baseOld, baseNew, bare: false }) : (fwd.get(tok) || null);
    } else if (!inDs) {
      if (/data-ds\s*=\s*"[^"]*$/.test(before)) nu = fwd.get(tok) || null;
      else nu = tok.includes(DS + '/') ? rewrite(tok, { baseOld, baseNew, bare }) : null;
    } else nu = rewrite(tok, { baseOld, baseNew, bare });
    if (nu && nu !== tok) edits.push([m.index, m.index + tok.length, nu, tok]);
  }
  // корень ДС для рантаймов страницы — по глубине новой папки
  if (inDs) {
    for (const m of text.matchAll(/(__DS_ROOT\s*=\s*)(['"])((?:\.\.\/)*)\2/g)) {
      const was = m[3];
      if (P.join(P.dirname(dsRelOld), was || '.').replace(/\/$/, '') !== '.') { report.push('!! ' + fNew + ':' + lineOf(text, m.index) + ' __DS_ROOT не ведёт в корень ДС: ' + was); continue; }
      const depth = dsRelNew.split('/').length - 1;
      const nu = '../'.repeat(depth);
      if (nu !== was) { const s = m.index + m[1].length + 1; edits.push([s, s + was.length, nu, was]); }
    }
  }
  if (!edits.length) continue;
  edits.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < edits.length; i++) if (edits[i][0] < edits[i - 1][1]) throw new Error('relink: пересечение правок в ' + fNew);
  let out = text;
  for (const [s, e, nu] of [...edits].reverse()) out = out.slice(0, s) + nu + out.slice(e);
  for (const [s, , nu, was] of edits) report.push(fNew + ':' + lineOf(text, s) + '  ' + was + '  →  ' + nu);
  changedFiles++; changes += edits.length;
  if (!DRY) writeFileSync(abs, out);
}

writeFileSync(OUT, report.join('\n') + '\n');
console.log((DRY ? '[dry] ' : '') + 'файлов: ' + changedFiles + ' · замен: ' + changes + ' → ' + path.relative(ROOT, OUT).split(path.sep).join('/'));

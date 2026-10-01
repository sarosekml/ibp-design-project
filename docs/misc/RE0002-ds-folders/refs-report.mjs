#!/usr/bin/env node
// RE0002, этап Э0 — отчёт ссылок вне ДС на переезжающие пути (разовый скрипт, удаляется на Э3).
// Ищет в отслеживаемых файлах вне design-system/:
//   · явные пути `design-system/<старый путь>` из move-map.json;
//   · пути от корня ДС без префикса (`specs/Tile.md`, `scripts/ibp-home.js`, `styles/x.css`) —
//     у инструментов и в атрибуте data-ds так и пишут;
//   · литералы раскладки в коде оснастки ('styles/', 'scripts/', 'pages/', 'specs/', 'fonts/').
// Каждому файлу — действие из раздела 6: переписать · пересобрать · история.
// Выход: refs-report.md рядом со скриптом.
//
//   node docs/misc/RE0002-ds-folders/refs-report.mjs

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const MAP = JSON.parse(readFileSync(path.join(HERE, 'move-map.json'), 'utf8'));
const moved = new Set([...MAP.moves.map((m) => m.from), ...MAP.copies.map((m) => m.from)]);

const TEXT = /\.(md|mjs|js|cjs|json|jsonl|html|css|txt|ya?ml|sh|ps1)$/i;
const files = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter((f) => f && !f.startsWith('design-system/') && !f.startsWith('docs/misc/RE0002-ds-folders/') && TEXT.test(f));

// Действие по разделу 6.
const HISTORY = [
  /^docs\/tasks\/(?!RE0002)/, /^docs\/misc\//, /lessons-raw\.md$/, /\/references\/lessons\.md$/,
];
const GENERATED = [
  /^hub\.js$/, /^docs\/index\.md$/, /^apps\/ds-body\.js$/,
  /^apps\/local-components\/(?!index\.html$|README\.md$|.*\.demo\.js$)/,
  /\.preview\.html$/, /^\.agents\/tools\/anchors\.json$/,
  /^\.agents\/skills\/docs-split\/references\/pages-index\.md$/,
];
const actionOf = (f) => {
  if (f === 'docs/tasks/RE0002-ds-component-folders.md') return 'задача';
  if (HISTORY.some((r) => r.test(f))) return 'история';
  if (GENERATED.some((r) => r.test(f))) return 'пересобрать';
  return 'переписать';
};

const OLD = /design-system\/((?:styles|scripts|pages|specs|fonts)\/[\w.@/-]*[\w])/g;
const BARE = /(?<![\w./-])((?:styles|scripts|pages|specs|fonts)\/[A-Za-z][\w.@/-]*\.(?:css|js|mjs|md|html|otf|json))/g;
const LITERAL = /(['"`])(?:\.\.\/)*(styles|scripts|pages|specs|fonts)\/(?:\1|\$\{|[a-z*{])/g;
// Голое имя папки: path.join(ds, 'styles'), ['styles', 'scripts']. Ловит и чужие 'pages'
// (папка экранов приложения) — такие строки разбираются руками, поэтому колонка отдельная.
const TOKEN = /(['"`])(styles|scripts|pages|specs|fonts)\1/g;
const isCode = (f) => /\.(mjs|js|cjs)$/.test(f) && (f.startsWith('.agents/') || f.startsWith('apps/ds-'));

const rows = [];
for (const f of files) {
  let text;
  try { text = readFileSync(path.join(ROOT, f), 'utf8'); } catch { continue; }
  const hits = { explicit: 0, bare: 0, literal: 0, keepShared: 0 };
  const samples = new Set();
  for (const m of text.matchAll(OLD)) {
    const p = m[1];
    if (/^specs\/_/.test(p)) { hits.keepShared++; continue; } // общие спеки остаются
    hits.explicit++; if (samples.size < 3) samples.add(p);
  }
  for (const m of text.matchAll(BARE)) {
    const p = m[1];
    if (!moved.has(p)) continue; // только реальные файлы ДС, которые переезжают
    hits.bare++; if (samples.size < 3) samples.add(p);
  }
  if (isCode(f)) for (const m of text.matchAll(LITERAL)) { hits.literal++; if (samples.size < 3) samples.add(m[0]); }
  hits.token = 0;
  if (isCode(f)) for (const m of text.matchAll(TOKEN)) { hits.token++; if (samples.size < 3) samples.add(m[0]); }
  const total = hits.explicit + hits.bare + hits.literal + hits.token;
  if (!total) continue;
  rows.push({ f, action: actionOf(f), ...hits, total, samples: [...samples] });
}

const order = { 'переписать': 0, 'пересобрать': 1, 'история': 2, 'задача': 3 };
rows.sort((a, b) => order[a.action] - order[b.action] || a.f.localeCompare(b.f));
const count = (a) => rows.filter((r) => r.action === a).length;
const md = [
  '# RE0002 · ссылки вне ДС на переезжающие пути (генерат refs-report.mjs — руками не править)',
  '',
  `Файлов: ${rows.length} — переписать ${count('переписать')}, пересобрать ${count('пересобрать')}, история ${count('история')}.`,
  '',
  'Колонки: «явн.» — `design-system/<путь>`; «от корня» — путь от корня ДС без префикса, только существующие переезжающие файлы;',
  '«литер.» — литерал раскладки в коде оснастки (`\'styles/\'`, `` `pages/${…}` ``); «имя» — голое имя папки (`\'styles\'`), в том числе',
  'чужое `\'pages\'` папки экранов приложения — разбирается руками. Общие спеки `specs/_*.md` не считаются — они остаются.',
  '',
];
for (const action of ['переписать', 'пересобрать', 'история']) {
  const list = rows.filter((r) => r.action === action);
  md.push(`## ${action} (${list.length})`, '', '| Файл | явн. | от корня | литер. | имя | Пример |', '|---|--:|--:|--:|--:|---|');
  for (const r of list) md.push(`| \`${r.f}\` | ${r.explicit || ''} | ${r.bare || ''} | ${r.literal || ''} | ${r.token || ''} | ${r.samples.map((s) => '`' + s.replace(/\|/g, '\\|') + '`').join(' ')} |`);
  md.push('');
}
writeFileSync(path.join(HERE, 'refs-report.md'), md.join('\n'));
console.log(`файлов ${rows.length}: переписать ${count('переписать')} · пересобрать ${count('пересобрать')} · история ${count('история')}`);

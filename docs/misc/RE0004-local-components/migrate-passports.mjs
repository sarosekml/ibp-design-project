#!/usr/bin/env node
// Миграция паспортов локальных компонентов к канону 2.000 (задача RE0004, этап Э2).
// Пишется и правится только редактором (process.md §8) — не через шелл.
// Запуск из корня проекта:
//   node docs/misc/RE0004-local-components/migrate-passports.mjs              # отчёт + копии в migrated/
//   node docs/misc/RE0004-local-components/migrate-passports.mjs --write      # записать на место
//   node docs/misc/RE0004-local-components/migrate-passports.mjs --only DealTeamModal
//
// Что делает (механика, детерминированно, с доказательством сохранности):
//   1. Шапка — порядок полей по шаблону ДС; widget/file/module убираются; type кодом;
//      rulesVersion → 2.000; updated → дата миграции; version не трогается.
//   2. Тело — канонические h2 приводятся к «Русский (English)» и ставятся в канонический
//      порядок; свои h2 из списка ниже понижаются до h3 под нужный канонический раздел;
//      «### Скрипт …», вложенный под чужой раздел, выносится в «Для разработчиков» как h3;
//      вложенные h3 внутри переезжающего раздела становятся h4. «Состав» скрипт НЕ трогает —
//      он сплитится руками.
//   3. Сравнение «до/после»: все непустые строки тела, кроме строк-заголовков, на месте.
//
// РУКАМИ (после скрипта): сплит «Состав» → «Раскладка» + «Поля»; строки Disabled;
// недостающие разделы; frontend; ссылки «см. „…“»; журналы; fixtures.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const WIDGETS = path.join(ROOT, 'apps', 'postrade', 'deals-app', 'widgets');
const OUT = path.join(HERE, 'migrated');

const MIGRATION_DATE = '02.10.2026';

const HEADER_ORDER = [
  'name', 'type', 'category', 'purpose', 'version', 'updated', 'rulesVersion',
  'owner', 'designer', 'frontend', 'ds', 'uses', 'usedOn', 'opens', 'artifactOf',
  'opensFrom', 'dependsOn', 'variants', 'modifiers', 'requirements', 'knowledge',
];
const DROP_KEYS = new Set(['widget', 'file', 'module']);
const TYPE_MAP = {
  'модальное окно': 'modal', 'тайл': 'tile', 'таблица': 'table',
  'поповер': 'popover', 'контекстное меню': 'context-menu', 'подчасть': 'part',
};

const CANON = new Map([
  ['Описание', 'Purpose'],
  ['Раскладка', 'Layout'],
  ['Компоненты', 'Components'],
  ['Поля', 'Fields'],
  ['Права', 'Permissions'],
  ['Состояния', 'States'],
  ['Обязательность заполнения', 'Required'],
  ['Переполнение', 'Overflow'],
  ['Поведение', 'Behavior'],
  ['Данные', 'Data dependencies'],
  ['Для разработчиков', 'Implementation'],
  ['Осознанные отклонения', 'Deviations'],
  ['Открытые вопросы', 'Open questions'],
]);
const CANON_ORDER = [...CANON.keys()];

// Свои h2 (и «### Скрипт …») → h3 под канонический раздел. «Состав» сюда не входит.
const DEMOTE = new Map([
  ['Связанные артефакты', { target: 'Поведение', h3: 'Связанные артефакты' }],
  ['Параметры метки', { target: 'Для разработчиков', h3: 'Параметры метки' }],
  ['Соответствие файлов', { target: 'Для разработчиков', h3: 'Соответствие файлов' }],
  ['Правила проверки', { target: 'Поведение', h3: 'Правила проверки' }],
  ['Правила состава и проверки', { target: 'Поведение', h3: 'Правила состава и проверки' }],
  ['Правила состава', { target: 'Поведение', h3: 'Правила состава' }],
  ['Проверка и сохранение', { target: 'Поведение', h3: 'Проверка и сохранение' }],
  ['Поведение выбора', { target: 'Поведение', h3: 'Поведение выбора' }],
  ['Когда тайл показывается', { target: 'Поведение', h3: 'Когда тайл показывается' }],
  ['Связи с другими модулями', { target: 'Поведение', h3: 'Связи с другими модулями' }],
  ['Типы узлов', { target: 'Поля', h3: 'Типы узлов' }],
  ['Витрина', { target: 'Состояния', h3: 'Варианты состава' }],
]);
const DEMOTE_PREFIX = [
  { prefix: 'Скрипт', target: 'Для разработчиков' },
  { prefix: 'Вложенный артефакт', target: 'Поведение' },
];

// Ручной сплит: остаётся «##» до разбора руками.
const MANUAL = new Set(['Состав']);

// ---------------------------------------------------------------------------

function russianName(heading) {
  const h = heading.trim();
  const m = /^(.+?)\s+\([^()]*\)$/.exec(h);
  return m ? m[1] : h;
}

function classify(rn) {
  if (CANON.has(rn)) return { kind: 'canon', english: CANON.get(rn) };
  if (DEMOTE.has(rn)) { const d = DEMOTE.get(rn); return { kind: 'demote', target: d.target, h3: d.h3 }; }
  for (const p of DEMOTE_PREFIX) if (rn.startsWith(p.prefix)) return { kind: 'demote', target: p.target, h3: rn };
  if (MANUAL.has(rn)) return { kind: 'manual' };
  return { kind: 'unknown' };
}

// Только правила переноса (для вложенных «### Скрипт …»): null, если не перенос.
function demoteRule(rn) {
  if (DEMOTE.has(rn)) { const d = DEMOTE.get(rn); return { target: d.target, h3: d.h3 }; }
  for (const p of DEMOTE_PREFIX) if (rn.startsWith(p.prefix)) return { target: p.target, h3: rn };
  return null;
}

function parseFrontmatter(headerLines) {
  const fields = [];
  for (const line of headerLines) {
    const m = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
    if (m) fields.push({ key: m[1], value: m[2] });
  }
  return fields;
}

function transformFrontmatter(fields) {
  const map = new Map();
  for (const f of fields) map.set(f.key, f.value);
  map.set('rulesVersion', '2.000');
  map.set('updated', '"' + MIGRATION_DATE + '"');
  const out = [];
  for (const key of HEADER_ORDER) {
    if (!map.has(key)) continue;
    let value = map.get(key);
    if (key === 'type' && TYPE_MAP[value]) value = TYPE_MAP[value];
    out.push(key + ': ' + value);
  }
  return out;
}

// Разрезает тело на преамбулу (до первого «##») и секции «##» с вложенными «###».
function parseBody(lines) {
  const preamble = [];
  const sections = [];
  let cur = null;
  let curSub = null;
  for (const line of lines) {
    const m2 = /^##\s+(.*)$/.exec(line);
    if (m2) {
      cur = { raw: line, heading: m2[1], intro: [], subs: [] };
      sections.push(cur);
      curSub = null;
      continue;
    }
    const m3 = /^(###|####|#####|######)\s+(.*)$/.exec(line);
    if (m3 && cur) {
      curSub = { level: m3[1].length, raw: line, heading: m3[2], lines: [] };
      cur.subs.push(curSub);
      continue;
    }
    if (curSub) curSub.lines.push(line);
    else if (cur) cur.intro.push(line);
    else preamble.push(line);
  }
  return { preamble, sections };
}

function transformBody(bodyLines) {
  const { preamble, sections } = parseBody(bodyLines);
  const buckets = new Map();
  for (const ru of CANON_ORDER) buckets.set(ru, { own: [], sub: [] });
  const manual = [];
  const changes = [];

  for (const s of sections) {
    const rn = russianName(s.heading);
    const c = classify(rn);
    if (c.kind === 'canon') {
      const b = buckets.get(rn);
      b.own.push(...s.intro);
      for (const sub of s.subs) {
        const rule = demoteRule(russianName(sub.heading));
        if (rule) {
          buckets.get(rule.target).sub.push({ name: rule.h3, lines: sub.lines });
          changes.push({ kind: 'demote', from: sub.raw, to: '### ' + rule.h3, parent: rule.target });
        } else {
          b.own.push(sub.raw);
          b.own.push(...sub.lines);
        }
      }
    } else if (c.kind === 'demote') {
      const content = [...s.intro];
      for (const sub of s.subs) {
        const rule = demoteRule(russianName(sub.heading));
        if (rule) {
          buckets.get(rule.target).sub.push({ name: rule.h3, lines: sub.lines });
          changes.push({ kind: 'demote', from: sub.raw, to: '### ' + rule.h3, parent: rule.target });
        } else {
          content.push('#' + sub.raw); // ### → #### (вложенный в переезжающий раздел)
          content.push(...sub.lines);
        }
      }
      buckets.get(c.target).sub.push({ name: c.h3, lines: content });
      changes.push({ kind: 'demote', from: s.raw, to: '### ' + c.h3, parent: c.target });
    } else {
      manual.push(s);
      changes.push({ kind: c.kind === 'manual' ? 'manual' : 'unknown', from: s.raw });
    }
  }

  const out = [...preamble];
  for (const ru of CANON_ORDER) {
    const b = buckets.get(ru);
    if (b.own.length === 0 && b.sub.length === 0) continue;
    out.push('## ' + ru + ' (' + CANON.get(ru) + ')');
    if (b.own.length > 0) out.push(...b.own);
    else out.push('');
    for (const sub of b.sub) {
      out.push('### ' + sub.name);
      out.push(...sub.lines);
    }
  }
  for (const s of manual) {
    out.push(s.raw);
    out.push(...s.intro);
    for (const sub of s.subs) {
      out.push(sub.raw);
      out.push(...sub.lines);
    }
  }
  return { lines: out, changes };
}

function contentMultiset(lines) {
  const m = new Map();
  for (const l of lines) {
    if (l.trim() === '') continue;
    if (/^#{1,6}\s/.test(l)) continue;
    m.set(l, (m.get(l) || 0) + 1);
  }
  return m;
}

function diffContent(orig, next) {
  const a = contentMultiset(orig);
  const b = contentMultiset(next);
  const lost = [];
  const added = [];
  for (const k of new Set([...a.keys(), ...b.keys()])) {
    const d = (b.get(k) || 0) - (a.get(k) || 0);
    for (let i = 0; i < Math.abs(d); i++) (d < 0 ? lost : added).push(k);
  }
  return { lost, added };
}

function splitDoc(text) {
  const lines = text.split('\n');
  const i1 = lines.indexOf('---');
  const i2 = lines.indexOf('---', i1 + 1);
  const headerLines = lines.slice(i1 + 1, i2);
  const bodyLines = lines.slice(i2 + 1);
  return { headerLines, bodyLines };
}

function build(headerLines, bodyLines) {
  return ['---', ...headerLines, '---', ...bodyLines].join('\n') + '\n';
}

function discover() {
  const out = [];
  function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.md') && path.basename(e.name, '.md') === path.basename(dir)) out.push(p);
    }
  }
  walk(WIDGETS);
  return out.sort();
}

function migrateFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  const { headerLines, bodyLines } = splitDoc(text);

  const origFields = parseFrontmatter(headerLines);
  const nextHeader = transformFrontmatter(origFields);

  const { lines: nextBody, changes } = transformBody(bodyLines);
  const { lost, added } = diffContent(bodyLines, nextBody);

  const report = { changes, lost, added, headerDropped: [], headerType: null };
  for (const f of origFields) {
    if (DROP_KEYS.has(f.key)) report.headerDropped.push(f.key);
    if (f.key === 'type' && TYPE_MAP[f.value]) report.headerType = f.value + ' → ' + TYPE_MAP[f.value];
  }

  return { next: build(nextHeader, nextBody), report };
}

function main() {
  const args = process.argv.slice(2);
  const writeMode = args.includes('--write');
  const onlyIdx = args.indexOf('--only');
  const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

  const files = discover().filter((f) => (!only || path.basename(f, '.md') === only));
  if (files.length === 0) {
    console.error('Нет паспортов' + (only ? ' с именем ' + only : ''));
    process.exit(1);
  }

  let ok = 0;
  let bad = 0;
  let totalLost = 0;

  for (const file of files) {
    const rel = path.relative(WIDGETS, file).replace(/\\/g, '/');
    const { next, report } = migrateFile(file);
    const passed = report.lost.length === 0;
    if (passed) ok++;
    else bad++;
    totalLost += report.lost.length;

    console.log('== ' + rel + (passed ? '  [OK]' : '  [ПОТЕРИ!]'));
    if (report.headerDropped.length) console.log('   шапка: убрано ' + report.headerDropped.join(', '));
    if (report.headerType) console.log('   шапка: type ' + report.headerType);
    for (const c of report.changes) {
      if (c.kind === 'demote') console.log('   ↓ ' + c.from + '  →  ' + c.to + '  (в «' + c.parent + '»)');
      else if (c.kind === 'manual') console.log('   ? ' + c.from + '  [руками: сплит «Состав»]');
      else if (c.kind === 'unknown') console.log('   ! ' + c.from + '  [неизвестно]');
    }
    if (report.lost.length) {
      console.log('   ПОТЕРЯНО СТРОК:');
      for (const l of report.lost.slice(0, 10)) console.log('     - ' + l);
    }
    if (report.added.length) {
      console.log('   ДОБАВЛЕНО СТРОК (не заголовки):');
      for (const l of report.added.slice(0, 10)) console.log('     + ' + l);
    }

    if (writeMode) {
      fs.writeFileSync(file, next, 'utf8');
    } else {
      const dest = path.join(OUT, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, next, 'utf8');
    }
  }

  console.log('\n=== ИТОГ ===');
  console.log('Паспортов: ' + files.length + ' | без потерь: ' + ok + ' | с потерями: ' + bad + ' | потеряно строк: ' + totalLost);
  console.log(writeMode ? 'Записано на место.' : 'Копии записаны в ' + path.relative(ROOT, OUT));
}

main();

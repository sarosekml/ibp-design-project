#!/usr/bin/env node
// RE0002, этап Э0 — карта переезда ДС «было → стало» (разовый скрипт, удаляется на Э3).
// Правила — разделы 4–5 задачи docs/tasks/RE0002-ds-component-folders.md.
// Владелец файла: страница pages/<кат>/<Имя>.html задаёт имя и категорию,
// CSS/рантайм/сценарий страницы находят владельца по нормализованному имени
// файла; расхождения имени и компонента — таблица OVERRIDE (раздел 5).
// Выход: move-map.json и move-map.md рядом со скриптом. Файлы ДС не меняются.
//
//   node docs/misc/RE0002-ds-folders/move-map.mjs

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const DS = 'design-system';

const files = execFileSync('git', ['ls-files', DS], { cwd: ROOT, encoding: 'utf8' })
  .split('\n').filter(Boolean).map((f) => f.slice(DS.length + 1));

// Группа полей с общей базой (раздел 4, п. 3).
const INPUTS = ['InputText', 'InputAutocomplete', 'InputDate', 'InputAmountRange', 'InputDateRange'];
const INPUTS_DIR = 'components/molecules/Inputs';

// Компоненты: из страниц документации.
const comp = new Map(); // Имя → { cat, dir }
for (const f of files) {
  const m = f.match(/^pages\/([a-z]+)\/([A-Za-z]+)\.html$/);
  if (!m) continue;
  const [, cat, name] = m;
  let dir;
  if (INPUTS.includes(name)) dir = `${INPUTS_DIR}/${name}`;
  else if (['atoms', 'molecules', 'organisms'].includes(cat)) dir = `components/${cat}/${name}`;
  else dir = `${cat}/${name}`; // foundations, patterns, rnd
  comp.set(name, { cat, dir });
}
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const byNorm = new Map([...comp.keys()].map((n) => [norm(n), n]));
const dirOf = (name) => {
  if (!comp.has(name)) throw new Error(`нет компонента ${name}`);
  return comp.get(name).dir;
};

// Раздел 5 — неочевидные переносы. Значение: путь от корня ДС
// или [Имя компонента, имя файла в его папке].
const OVERRIDE = {
  'styles/button.css': ['Buttons', 'Buttons.css'],
  'styles/radio.css': ['Radiobutton', 'Radiobutton.css'],
  'styles/riskmetric.css': ['RiskMetric', 'RiskMetric.css'],
  'styles/datepicker.css': ['DatePicker', 'DatePicker.css'],
  'styles/colors.css': ['Colors', 'Colors.css'],
  'styles/palette.css': ['Colors', 'Palette.css'],
  'styles/shadow.css': ['Elevation', 'Elevation.css'],
  'styles/illustration.css': ['Illustrations', 'Illustrations.css'],
  'scripts/ds-illustrations.js': ['Illustrations', 'Illustrations.js'],
  'styles/layout.css': ['Layout', 'Layout.css'],
  'scripts/ds-scroll.js': ['Layout', 'Layout.js'],
  'scripts/layout.page.js': ['Layout', 'Layout.page.js'],
  'scripts/ds-icons.js': ['Icons', 'Icons.js'],
  'scripts/icons-data.js': ['Icons', 'icons-data.js'],
  'styles/input.css': `${INPUTS_DIR}/Inputs.css`,
  'styles/input-range.css': `${INPUTS_DIR}/InputRanges.css`,
  'scripts/ds-input.js': `${INPUTS_DIR}/Inputs.js`,
  'scripts/input-kit.js': `${INPUTS_DIR}/InputKit.js`,
  'scripts/ds-table.js': ['Table', 'Table.js'],
  'scripts/tbl-resize.js': ['Table', 'TableResize.js'],
  'scripts/tbl-reorder.js': ['Table', 'TableReorder.js'],
  'scripts/tbl-pin.js': ['Table', 'TablePin.js'],
  'scripts/ds-table-settings.js': ['Table', 'TableSettings.js'],
  'styles/table-settings.css': ['Table', 'TableSettings.css'],
  'scripts/ds-menu.js': ['ContextMenu', 'ContextMenu.js'],
  'scripts/ds-tabs.js': ['Tab', 'Tab.js'],
  'scripts/ds-buttongroup.js': ['ButtonGroup', 'ButtonGroup.js'],
  'scripts/ds.js': 'ds.js',
  'scripts/ibp-home.js': ['HomeRoles', 'ibp-home.js'], // открытый вопрос 1
};
const UTILS = ['ds-float.js', 'ds-copy.js', 'ds-actions-overflow.js', 'ds-include.js', 'ds-notify.js'];
const DOCS_KIT = ['ds-nav.js', 'ds-toc.js', 'docs-split.js', 'pg-kit.js', 'image-slot.js',
  'ds-docs.css', 'ds-nav.css', 'ds-toc.css', 'docs-split.css', 'pg-kit.css', 'input-pages.css'];
const TOOLS = ['ds-lint.js', 'ds-lint.md', 'ds-lint-cli.mjs', 'ds-check.mjs', 'spec-audit.mjs',
  'ds-home.mjs', 'ds-icon.mjs', 'kit-link.mjs'];
const SHARED_SPECS = ['_index.md', '_cheatsheet.md', '_runtime-hooks.md', '_TEMPLATE.md'];
const STAY_TOP = ['AGENTS.md', 'CHANGELOG.md', 'MAINTAINING.md', 'readme.md', 'index.html', 'ds.css'];
const STAY_DIRS = ['assets/', 'templates/', 'fixtures/', 'uploads/'];

const moves = [];   // { from, to, why }
const copies = [];  // { from, to, why }
const stay = [];
const unowned = [];
const at = (v) => (Array.isArray(v) ? `${dirOf(v[0])}/${v[1]}` : v);

for (const f of files) {
  const base = path.posix.basename(f);
  let to = null, why = 'правило раздела 4';
  if (STAY_TOP.includes(f) || STAY_DIRS.some((d) => f.startsWith(d))) { stay.push(f); continue; }
  if (OVERRIDE[f]) { to = at(OVERRIDE[f]); why = 'раздел 5'; }
  else if (f.startsWith('fonts/')) { to = `assets/fonts/${base}`; why = 'раздел 5'; }
  else if (f.startsWith('specs/')) {
    if (SHARED_SPECS.includes(base)) { stay.push(f); continue; }
    const name = base.replace(/\.md$/, '');
    if (comp.has(name)) to = `${dirOf(name)}/${name}.md`;
  } else if (f.startsWith('pages/')) {
    const m = f.match(/^pages\/[a-z]+\/([A-Za-z]+)\.html$/);
    if (m) to = `${dirOf(m[1])}/${m[1]}.html`;
    else if (base === '.image-slots.state.json') {
      to = `${dirOf('Avatar')}/${base}`; why = 'раздел 5; ключ один — pg-av-img (Avatar)';
      copies.push({ from: f, to: `${dirOf('Chip')}/${base}`, why: 'Chip подключает image-slot.js, без файла — 404 в консоли; содержимое — {}' });
    }
  } else if (f.startsWith('styles/') || f.startsWith('scripts/')) {
    if (UTILS.includes(base)) { to = `utils/${base}`; why = 'раздел 5, utils'; }
    else if (DOCS_KIT.includes(base)) { to = `docs-kit/${base}`; why = 'раздел 5, docs-kit'; }
    else if (TOOLS.includes(base)) { to = `tools/${base}`; why = 'раздел 5, tools'; }
    else {
      let m;
      if ((m = base.match(/^(.+)\.page\.js$/))) {
        const name = byNorm.get(norm(m[1]));
        if (name) to = `${dirOf(name)}/${name}.page.js`;
      } else if ((m = base.match(/^ds-(.+)\.js$/))) {
        const name = byNorm.get(norm(m[1]));
        if (name) to = `${dirOf(name)}/${name}.js`;
      } else if ((m = base.match(/^(.+)\.css$/))) {
        const name = byNorm.get(norm(m[1]));
        if (name) to = `${dirOf(name)}/${name}.css`;
      }
    }
  }
  if (to) moves.push({ from: f, to, why });
  else unowned.push(f);
}

// Сверка с YAML спек: куда уходят файлы, которые спека называет своими.
const yamlNotes = [];
for (const name of comp.keys()) {
  let text;
  try { text = readFileSync(path.join(ROOT, DS, 'specs', name + '.md'), 'utf8'); } catch { continue; }
  const head = text.split(/^---$/m)[1] || '';
  for (const key of ['page', 'page_js', 'runtime', 'css']) {
    const line = head.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
    if (!line) continue;
    for (const p of line[1].match(/(?:styles|scripts|pages)\/[\w./-]+/g) || []) {
      const mv = moves.find((x) => x.from === p);
      if (!mv) { yamlNotes.push(`${name}.${key}: ${p} — файла нет в ДС`); continue; }
      if (!mv.to.startsWith(dirOf(name) + '/') && !mv.to.startsWith(INPUTS_DIR + '/')) {
        yamlNotes.push(`${name}.${key}: ${p} → ${mv.to} (общий файл, не в папке ${name})`);
      }
    }
  }
}

// Цели не должны совпадать.
const seen = new Map();
for (const m of [...moves, ...copies]) {
  if (seen.has(m.to)) throw new Error(`две цели в одну точку: ${seen.get(m.to)} и ${m.from} → ${m.to}`);
  seen.set(m.to, m.from);
}

const out = { task: 'RE0002', root: DS, generated: 'move-map.mjs', moves, copies, stay, unowned, yamlNotes };
writeFileSync(path.join(HERE, 'move-map.json'), JSON.stringify(out, null, 2) + '\n');

// Человекочитаемая карта — по папкам назначения.
const groups = new Map();
for (const m of moves) {
  const top = m.to.includes('/') ? m.to.split('/').slice(0, m.to.startsWith('components/') ? (m.to.startsWith(INPUTS_DIR + '/') && m.to.split('/').length > 5 ? 4 : 3) : 2).join('/') : '(корень ДС)';
  if (!groups.has(top)) groups.set(top, []);
  groups.get(top).push(m);
}
const md = [
  '# RE0002 · карта переезда ДС (генерат move-map.mjs — руками не править)',
  '',
  `Переносов: ${moves.length} · копий: ${copies.length} · остаются на месте: ${stay.length} · без владельца: ${unowned.length}.`,
  'Пути — от корня ДС.',
  '',
  '## Без владельца',
  '',
  unowned.length ? unowned.map((f) => `- \`${f}\``).join('\n') : 'нет',
  '',
  '## Копии',
  '',
  copies.length ? copies.map((c) => `- \`${c.from}\` → \`${c.to}\` — ${c.why}`).join('\n') : 'нет',
  '',
  '## Файлы спек вне папки своего компонента',
  '',
  'Спека называет файл своим, а он уезжает в общую папку или к другому компоненту.',
  '',
  yamlNotes.length ? yamlNotes.map((n) => `- ${n}`).join('\n') : 'нет',
  '',
  '## Переносы по папкам',
  '',
];
for (const [top, list] of [...groups].sort((a, b) => a[0].localeCompare(b[0]))) {
  md.push(`### ${top}`, '', '| Было | Станет | Основание |', '|---|---|---|');
  for (const m of list.sort((a, b) => a.to.localeCompare(b.to))) md.push(`| \`${m.from}\` | \`${m.to}\` | ${m.why} |`);
  md.push('');
}
md.push('## Остаются на месте', '', stay.map((f) => `\`${f}\``).join(' · '), '');
writeFileSync(path.join(HERE, 'move-map.md'), md.join('\n'));

console.log(`переносов ${moves.length} · копий ${copies.length} · на месте ${stay.length} · без владельца ${unowned.length} · заметок YAML ${yamlNotes.length}`);
if (unowned.length) console.log('без владельца:\n  ' + unowned.join('\n  '));

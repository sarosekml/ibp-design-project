#!/usr/bin/env node
/* ============================================================
   STATUS-MODEL — схема и таблицы статусной модели из файла данных.

   Зачем (задача RE0013, решение человека 09.10.2026). Статусная модель
   сущности — статусы по дорожкам, переходы, степперы, открытые вопросы —
   записана один раз в данных приложения (`data/<имя>-status-model.js`,
   `window.<ИМЯ>`), её читают стор и виджеты прототипа. Человеку модель нужна
   картинкой и таблицами, а расхождения макетов — списком. Всё это — генерат:
   инструмент пишет рядом с моделью `<имя>.md`, руками его не правят.

   Формат модели (typedef — в шапке файла модели):
     meta        { title, records: { file, global }, name, category, purpose,
                 about: [{ title, text }], related: [{ label, ref }] } — заголовок,
                 демо-данные рядом с моделью (с ними сверяются значения статусов),
                 запись витрины локальных компонентов (name, category, purpose —
                 пункт меню и карточка; задача RE0014), «Как работает» и связи;
     lanes       { id, label, avatar, field, toneScope } — дорожка, поле записи
                 со статусом, словарь тонов стора;
     statuses    { id, lane, label, kind, tone, editable, note, questions };
                 kind: initial · intermediate · target · final · terminal · null
                 (null — статуса нет на схеме);
     transitions { id, from, to, trigger, actor, via, action, modal, when,
                 after: { any | all: [id перехода] }, requires: [id статуса],
                 note, questions }; trigger: manual · auto · null; from = to —
                 действие без смены статуса;
     steppers    { lane, variant, mode, shownIn, steps: [{ label, status,
                 group: { title, items } }], extraButtons, note, questions };
     openQuestions { n, about: [id], text, since }.

   Что в генерате: схема Mermaid `flowchart` (подграф на дорожку; сплошная
   стрелка — ручной переход, пунктир — автоматический, толстая — тип не
   указан; цвет узла — по kind, значения палитры ДС), таблицы статусов и
   переходов, степперы, «Несостыковки» (структура модели, недостижимые
   статусы, выходы терминальных и конечных, статусы без выхода, переходы без
   подписи и типа, значения демо-данных вне модели, расхождение тонов в одном
   словаре стора), статусы без записей в демо-данных, «Открытые вопросы».
   Дат и времени в генерате нет: повторный запуск без правок модели файл не
   меняет.

   В гейт не включён (новые проверки — только с согласия человека).

   Модуль: loadModel, loadRecords, analyse и подписи видов, типов и способов
   перехода берёт генератор витрины kit-build.mjs — страница модели в витрине
   показывает те же несостыковки, что и генерат. CLI срабатывает только при
   прямом запуске; в режиме модуля ошибка модели — исключение.

   Использование:
     node .agents/tools/status-model.mjs <файл модели>          — записать <имя>.md рядом
     node .agents/tools/status-model.mjs <файл модели> --check  — сверить без записи
   Строка `ВЕРДИКТ: OK | FAIL`; код выхода 1 — только у --check, если генерат
   устарел, или если модель не читается.
   ============================================================ */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const GEN = 'status-model.mjs';

export const KINDS = ['initial', 'intermediate', 'target', 'final', 'terminal'];
export const KIND_LABEL = {
  initial: 'начальный', intermediate: 'промежуточный', target: 'целевой',
  final: 'конечный', terminal: 'терминальный', none: 'нет на схеме'
};
export const TRIGGER_LABEL = { manual: 'ручной', auto: 'авто', none: 'не указан' };
export const VIA_LABEL = { button: 'кнопка', menu: 'меню' };

/* Цвета узлов схемы — значения палитры ДС (foundations, Colors):
   промежуточный и начальный — cgrey-100 / cgrey-800; целевой — green-50 /
   green-500, текст green-800; конечный — deep-purple-50 / deep-purple-400,
   текст deep-purple-900; терминальный — red-50 / red-400, текст red-800;
   «нет на схеме» — cgrey-50 / cgrey-400, пунктирная рамка. */
const CLASS_DEF = [
  'classDef initial fill:#E8EDED,stroke:#283237,stroke-width:3px,color:#131618',
  'classDef intermediate fill:#E8EDED,stroke:#283237,color:#131618',
  'classDef target fill:#E8F5E9,stroke:#4CAF50,color:#2E7D32',
  'classDef final fill:#EDE7F6,stroke:#7E57C2,color:#311B92',
  'classDef terminal fill:#FEEBEE,stroke:#EF5350,color:#C62828',
  'classDef offschema fill:#FBFBFB,stroke:#A0A8B0,stroke-dasharray:4 3,color:#131618'
];

const MAIN = !!process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

function fail(msg) {
  if (!MAIN) throw new Error(GEN + ': ' + msg);
  console.error(GEN + ': ' + msg);
  console.log('ВЕРДИКТ: FAIL');
  process.exit(1);
}

function rel(abs) { return path.relative(ROOT, abs).split(path.sep).join('/'); }

/* Файл данных — обычный <script>, пишущий в window. */
function runScript(abs) {
  const ctx = { window: {}, console };
  vm.runInNewContext(readFileSync(abs, 'utf8'), ctx, { filename: abs });
  return ctx.window;
}

export function loadModel(abs) {
  const win = runScript(abs);
  const entry = Object.entries(win).find(([, v]) => v && Array.isArray(v.lanes) && Array.isArray(v.statuses));
  if (!entry) fail('в ' + rel(abs) + ' нет объекта модели (window.<ИМЯ> с lanes и statuses)');
  const m = entry[1];
  for (const k of ['transitions', 'steppers', 'openQuestions']) if (!Array.isArray(m[k])) m[k] = [];
  m.meta = m.meta || {};
  return { name: entry[0], model: m };
}

export function loadRecords(modelAbs, meta) {
  const r = meta.records;
  if (!r || !r.file || !r.global) return null;
  const abs = path.join(path.dirname(modelAbs), r.file);
  if (!existsSync(abs)) return { file: r.file, missing: true, list: [] };
  const list = runScript(abs)[r.global];
  return { file: r.file, global: r.global, missing: !Array.isArray(list), list: Array.isArray(list) ? list : [] };
}

/* ---------- текст ---------- */

function cell(v) {
  if (v == null || v === '') return '—';
  return String(v).replace(/\r?\n/g, ' ').replace(/\|/g, '\\|');
}

function mmText(s) { return String(s).replace(/"/g, '#quot;'); }

function qList(qs) { return (qs && qs.length) ? qs.join(', ') : '—'; }

export function kindKey(k) { return KINDS.includes(k) ? k : 'none'; }

export function triggerKey(t) { return (t === 'manual' || t === 'auto') ? t : 'none'; }

/* ---------- проверки ---------- */

export function analyse(m, records) {
  const issues = [];
  const add = (code, text) => issues.push({ code, text });
  const laneById = new Map(m.lanes.map((l) => [l.id, l]));
  const stById = new Map();
  const trById = new Map();
  const qNums = new Set(m.openQuestions.map((q) => q.n));

  for (const s of m.statuses) {
    if (stById.has(s.id)) add('структура', 'id статуса повторяется: `' + s.id + '`');
    stById.set(s.id, s);
    if (!laneById.has(s.lane)) add('структура', 'статус `' + s.id + '` — неизвестная дорожка `' + s.lane + '`');
    if (s.kind != null && !KINDS.includes(s.kind)) add('структура', 'статус `' + s.id + '` — неизвестный вид `' + s.kind + '`');
  }
  for (const t of m.transitions) {
    if (trById.has(t.id)) add('структура', 'id перехода повторяется: `' + t.id + '`');
    trById.set(t.id, t);
  }
  for (const t of m.transitions) {
    for (const end of ['from', 'to']) {
      if (!stById.has(t[end])) add('структура', 'переход `' + t.id + '` ведёт ' + (end === 'from' ? 'из' : 'в') + ' неизвестный статус `' + t[end] + '`');
    }
    const a = stById.get(t.from), b = stById.get(t.to);
    if (a && b && a.lane !== b.lane) add('структура', 'переход `' + t.id + '` соединяет разные дорожки (' + a.lane + ' → ' + b.lane + ')');
    if (t.trigger != null && t.trigger !== 'manual' && t.trigger !== 'auto') add('структура', 'переход `' + t.id + '` — неизвестный тип `' + t.trigger + '`');
    const after = t.after ? [].concat(t.after.any || [], t.after.all || []) : [];
    for (const id of after) if (!trById.has(id)) add('структура', 'переход `' + t.id + '` срабатывает после неизвестного перехода `' + id + '`');
    for (const id of (t.requires || [])) if (!stById.has(id)) add('структура', 'переход `' + t.id + '` требует неизвестный статус `' + id + '`');
    if (t.trigger === 'auto' && !after.length) add('переход', 'автопереход `' + t.id + '` без `after` — непонятно, что его запускает');
  }
  for (const st of m.steppers) {
    for (const id of (st.shownIn || [])) if (!stById.has(id)) add('структура', 'степпер «' + st.variant + '» показан в неизвестном статусе `' + id + '`');
    for (const step of (st.steps || [])) if (step.status && !stById.has(step.status)) add('структура', 'степпер «' + st.variant + '»: шаг «' + step.label + '» — неизвестный статус `' + step.status + '`');
  }
  const refQ = (owner, qs) => { for (const n of (qs || [])) if (!qNums.has(n)) add('структура', owner + ' ссылается на несуществующий вопрос ' + n); };
  m.statuses.forEach((s) => refQ('статус `' + s.id + '`', s.questions));
  m.transitions.forEach((t) => refQ('переход `' + t.id + '`', t.questions));
  m.steppers.forEach((s) => refQ('степпер «' + s.variant + '»', s.questions));
  for (const q of m.openQuestions) {
    for (const id of (q.about || [])) if (!stById.has(id) && !trById.has(id)) add('структура', 'вопрос ' + q.n + ' — неизвестный id `' + id + '`');
  }

  /* граф по дорожкам */
  const out = new Map(m.statuses.map((s) => [s.id, []]));
  for (const t of m.transitions) if (t.from !== t.to && out.has(t.from) && stById.has(t.to)) out.get(t.from).push(t);
  for (const lane of m.lanes) {
    const own = m.statuses.filter((s) => s.lane === lane.id);
    const starts = own.filter((s) => s.kind === 'initial');
    if (!starts.length) { add('граф', 'у дорожки «' + lane.label + '» нет начального статуса'); continue; }
    const seen = new Set(starts.map((s) => s.id));
    const queue = starts.map((s) => s.id);
    while (queue.length) {
      for (const t of out.get(queue.shift()) || []) if (!seen.has(t.to)) { seen.add(t.to); queue.push(t.to); }
    }
    for (const s of own) if (!seen.has(s.id)) add('граф', '«' + s.label + '» (' + lane.label + ') недостижим из начального статуса');
  }
  for (const s of m.statuses) {
    const exits = out.get(s.id) || [];
    const lane = laneById.get(s.lane);
    const where = '«' + s.label + '» (' + (lane ? lane.label : s.lane) + ')';
    if (s.kind == null) add('схема', where + ' — статуса нет на схеме');
    if (s.kind === 'terminal' && exits.length) add('граф', where + ' — терминальный, но из него есть выход: ' + exits.map((t) => '`' + t.id + '`').join(', '));
    if (s.kind === 'final' && exits.length) add('граф', where + ' — конечный, но из него есть выход: ' + exits.map((t) => '`' + t.id + '`').join(', '));
    if (s.kind !== 'terminal' && s.kind !== 'final' && !exits.length) add('граф', where + ' — не терминальный и не конечный (' + KIND_LABEL[kindKey(s.kind)] + '), но выхода из него нет');
    if (s.tone == null) add('тон', where + ' — тон чипа не задан');
  }
  for (const t of m.transitions) {
    if (t.trigger == null) add('переход', '`' + t.id + '` — не указано, ручной переход или автоматический');
    if (t.trigger === 'manual' && !t.action) add('переход', '`' + t.id + '` — ручной переход без подписи действия');
  }

  /* один словарь тонов стора — одна подпись, один тон */
  const scopes = new Map();
  for (const s of m.statuses) {
    const lane = laneById.get(s.lane);
    if (!lane || s.tone == null) continue;
    const key = lane.toneScope + '\u0000' + s.label;
    if (!scopes.has(key)) scopes.set(key, new Map());
    const tones = scopes.get(key);
    if (!tones.has(s.tone)) tones.set(s.tone, []);
    tones.get(s.tone).push(lane.label);
  }
  for (const [key, tones] of scopes) {
    if (tones.size < 2) continue;
    const [scope, label] = key.split('\u0000');
    add('тон', '«' + label + '» в словаре `' + scope + '` с разными тонами: ' + [...tones].map(([t, ls]) => t + ' (' + ls.join(', ') + ')').join('; '));
  }

  /* демо-данные */
  const counts = new Map(m.statuses.map((s) => [s.id, 0]));
  if (records && records.missing) add('данные', 'демо-данные `' + records.file + '` не читаются');
  if (records && !records.missing) {
    for (const lane of m.lanes) {
      const byLabel = new Map(m.statuses.filter((s) => s.lane === lane.id).map((s) => [s.label, s]));
      const unknown = new Map();
      for (const rec of records.list) {
        const v = rec[lane.field];
        if (v == null || v === '') continue;
        const s = byLabel.get(v);
        if (s) counts.set(s.id, counts.get(s.id) + 1);
        else unknown.set(v, (unknown.get(v) || 0) + 1);
      }
      for (const [v, n] of unknown) add('данные', '`' + records.file + '`, поле `' + lane.field + '`: значения «' + v + '» нет в модели (записей: ' + n + ')');
    }
  }
  return { issues, counts, laneById, stById };
}

/* ---------- генерат ---------- */

function render(modelAbs, name, m, records) {
  const { issues, counts, laneById, stById } = analyse(m, records);
  const L = [];
  const title = m.meta.title || name;
  L.push('<!-- Генерат: node .agents/tools/' + GEN + ' ' + rel(modelAbs) + ' — руками не править. -->');
  L.push('');
  L.push('# ' + title);
  L.push('');
  L.push('Источник — `' + path.basename(modelAbs) + '` (`window.' + name + '`). Правка — в нём, затем');
  L.push('`node .agents/tools/' + GEN + ' ' + rel(modelAbs) + '`.');
  if (records) L.push('Сверка значений — с `' + records.file + '`' + (records.global ? ' (`window.' + records.global + '`)' : '') + '.');
  L.push('');
  L.push('Дорожек: ' + m.lanes.length + ' · статусов: ' + m.statuses.length + ' · переходов: ' + m.transitions.length +
    ' · несостыковок: ' + issues.length + ' · открытых вопросов: ' + m.openQuestions.length + '.');
  L.push('');

  /* как работает */
  if (Array.isArray(m.meta.about) && m.meta.about.length) {
    L.push('## Как работает');
    L.push('');
    for (const a of m.meta.about) {
      L.push('### ' + a.title);
      L.push('');
      L.push(String(a.text).replace(/\r?\n/g, ' '));
      L.push('');
    }
  }

  /* схема */
  L.push('## Схема');
  L.push('');
  L.push('Сплошная стрелка — ручной переход, пунктир — автоматический, толстая — тип не указан.');
  L.push('Узлы: толстая рамка — начальный, зелёный — целевой, фиолетовый — конечный, красный —');
  L.push('терминальный, серый — промежуточный, пунктирная рамка — статуса нет на схеме макета.');
  L.push('Петля — действие без смены статуса.');
  L.push('');
  L.push('```mermaid');
  L.push('flowchart LR');
  for (const lane of m.lanes) {
    L.push('  subgraph ' + lane.id + '["' + mmText(lane.label) + '"]');
    L.push('    direction TB');
    for (const s of m.statuses.filter((x) => x.lane === lane.id)) {
      L.push('    ' + s.id + '["' + mmText(s.label) + '"]:::' + (KINDS.includes(s.kind) ? s.kind : 'offschema'));
    }
    L.push('  end');
  }
  for (const t of m.transitions) {
    if (!stById.has(t.from) || !stById.has(t.to)) continue;
    const label = t.action || t.when || (t.trigger == null ? '?' : '');
    const arrow = t.trigger === 'manual' ? '-->' : t.trigger === 'auto' ? '-.->' : '==>';
    L.push('  ' + t.from + ' ' + arrow + (label ? '|"' + mmText(label) + '"|' : '') + ' ' + t.to);
  }
  for (const c of CLASS_DEF) L.push('  ' + c);
  L.push('```');
  L.push('');

  /* статусы */
  L.push('## Статусы');
  L.push('');
  for (const lane of m.lanes) {
    L.push('### ' + lane.label + ' — поле `' + lane.field + '`' + (lane.avatar ? ', аватарка «' + lane.avatar + '»' : '') + ', словарь тонов `' + lane.toneScope + '`');
    L.push('');
    L.push('| Статус | id | Вид | Тон | Правка сущностей | Записей | Пояснение | Вопросы |');
    L.push('|---|---|---|---|---|---|---|---|');
    for (const s of m.statuses.filter((x) => x.lane === lane.id)) {
      const ed = s.editable === true ? 'да' : s.editable === false ? 'нет' : '—';
      L.push('| ' + [cell(s.label), '`' + s.id + '`', KIND_LABEL[kindKey(s.kind)], s.tone ? '`' + s.tone + '`' : '—', ed,
        records && !records.missing ? String(counts.get(s.id)) : '—', cell(s.note), qList(s.questions)].join(' | ') + ' |');
    }
    L.push('');
  }

  /* переходы */
  L.push('## Переходы');
  L.push('');
  for (const lane of m.lanes) {
    const own = m.transitions.filter((t) => { const s = stById.get(t.from); return s && s.lane === lane.id; });
    if (!own.length) continue;
    L.push('### ' + lane.label);
    L.push('');
    L.push('| id | Откуда → куда | Тип | Кто | Как | Действие | Окно | Условие | Примечание | Вопросы |');
    L.push('|---|---|---|---|---|---|---|---|---|---|');
    for (const t of own) {
      const a = stById.get(t.from), b = stById.get(t.to);
      const route = t.from === t.to ? cell(a.label) + ' (без смены)' : cell(a.label) + ' → ' + cell(b ? b.label : t.to);
      const after = t.after ? (t.after.all ? 'после всех: ' + t.after.all.join(', ') : 'после: ' + (t.after.any || []).join(', ')) : '';
      const req = t.requires && t.requires.length ? 'и статусы: ' + t.requires.join(', ') : '';
      const cond = [t.when, after, req].filter(Boolean).join('; ');
      L.push('| ' + ['`' + t.id + '`', route, TRIGGER_LABEL[triggerKey(t.trigger)], cell(t.actor), VIA_LABEL[t.via] || '—',
        cell(t.action), t.modal ? '`' + t.modal + '`' : '—', cell(cond), cell(t.note), qList(t.questions)].join(' | ') + ' |');
    }
    L.push('');
  }

  /* степперы */
  if (m.steppers.length) {
    L.push('## Степперы');
    L.push('');
    for (const st of m.steppers) {
      const lane = laneById.get(st.lane);
      const steps = (st.steps || []).map((s) => s.group ? s.label + ' [' + s.group.title + ': ' + s.group.items.join(' · ') + ']' : s.label);
      L.push('- **' + (lane ? lane.label : st.lane) + ' — ' + st.variant + '** (' + (st.mode === 'checklist' ? 'чек-лист' : 'путь статусов') + '): ' +
        (steps.length ? steps.join(' → ') : 'не показан') + '.');
      L.push('  Виден в: ' + (st.shownIn || []).map((id) => (stById.get(id) || { label: id }).label).join(', ') + '.');
      for (const b of (st.extraButtons || [])) L.push('  Кнопка «' + b.label + '» — в: ' + b.shownIn.map((id) => (stById.get(id) || { label: id }).label).join(', ') + (b.note ? '. ' + b.note : '.'));
      if (st.note) L.push('  ' + st.note);
      if (st.questions && st.questions.length) L.push('  Вопросы: ' + st.questions.join(', ') + '.');
    }
    L.push('');
  }

  /* несостыковки */
  L.push('## Несостыковки');
  L.push('');
  L.push('Находит генератор по структуре модели и демо-данным; смысловые расхождения макетов — в «Открытых вопросах».');
  L.push('');
  if (!issues.length) L.push('Нет.');
  else {
    L.push('| Где | Что |');
    L.push('|---|---|');
    for (const i of issues) L.push('| ' + i.code + ' | ' + cell(i.text) + ' |');
  }
  L.push('');
  if (records && !records.missing) {
    const empty = m.statuses.filter((s) => counts.get(s.id) === 0);
    L.push('### Нет в демо-данных');
    L.push('');
    L.push(empty.length ? empty.map((s) => '«' + s.label + '» (' + laneById.get(s.lane).label + ')').join(', ') + '.' : 'Все статусы есть в записях.');
    L.push('');
  }

  /* вопросы */
  L.push('## Открытые вопросы');
  L.push('');
  if (!m.openQuestions.length) L.push('Нет.');
  else {
    L.push('| № | О чём | Вопрос | С |');
    L.push('|---|---|---|---|');
    for (const q of m.openQuestions) L.push('| ' + q.n + ' | ' + (q.about || []).map((id) => '`' + id + '`').join(', ') + ' | ' + cell(q.text) + ' | ' + cell(q.since) + ' |');
  }
  L.push('');
  return { text: L.join('\n'), issues: issues.length, questions: m.openQuestions.length };
}

/* ---------- запуск ---------- */

if (MAIN) {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const file = args.find((a) => !a.startsWith('--'));
  if (!file) fail('укажите файл модели: node .agents/tools/' + GEN + ' <data/…-status-model.js> [--check]');
  const modelAbs = path.resolve(file);
  if (!existsSync(modelAbs)) fail('нет файла ' + file);

  const { name, model } = loadModel(modelAbs);
  const records = loadRecords(modelAbs, model.meta);
  const res = render(modelAbs, name, model, records);
  const outAbs = modelAbs.replace(/\.js$/, '') + '.md';
  const prev = existsSync(outAbs) ? readFileSync(outAbs, 'utf8') : null;
  const same = prev === res.text;

  console.log('== ' + GEN + (check ? ' --check' : '') + ' ==');
  console.log('модель: ' + rel(modelAbs) + ' · несостыковок: ' + res.issues + ' · вопросов: ' + res.questions);
  if (check) {
    console.log(same ? 'генерат актуален: ' + rel(outAbs) : 'генерат устарел: ' + rel(outAbs) + ' — запустите без --check');
    console.log('ВЕРДИКТ: ' + (same ? 'OK' : 'FAIL'));
    process.exit(same ? 0 : 1);
  }
  if (same) console.log('без изменений: ' + rel(outAbs));
  else { writeFileSync(outAbs, res.text, 'utf8'); console.log('записан: ' + rel(outAbs)); }
  console.log('ВЕРДИКТ: OK');
}

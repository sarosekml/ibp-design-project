#!/usr/bin/env node
/* ============================================================
   TASK-COST — токены и активное время по этапам задачи (задача RE0021).

   Зачем (решение человека 14.10.2026). Затраты на задачу нигде не
   фиксировались: модель своего расхода не видит, смета ctx-budget ни разу не
   сверена с фактом. Скрипт читает локальные журналы сессий агента (без сети),
   считает окно «прошлая отметка → сейчас» и пишет строку этапа в раздел
   «Затраты» задачи между метками `<!-- task-cost:begin -->` и
   `<!-- task-cost:end -->`, пересчитывая «Итого». Строку этапа, отмеченного
   повторно, заменяет.

   Отметки — `<state>/task-cost/<ID>.jsonl` (каталог состояния из
   project.json, вне git): время старта и закрытия каждого этапа. Таблица в
   задаче — в git; «Итого» считается по её строкам, поэтому переживает смену
   машины. На другой машине первую отметку задаёт `--from`.

   ИСТОЧНИКИ (читаются все найденные, суммируются):
     журнал JSONL — CLI, который пишет сессию построчно в
       <дом>/.<каталог CLI>/projects/<корень проекта, всё кроме букв и цифр → «-»>/
       <сессия>.jsonl и <сессия>/subagents/*.jsonl. Каталог CLI не называется:
       ищется любой `.<имя>` в домашнем каталоге, где есть такая папка.
       Токены — `message.usage` строк `assistant` (одна реплика пишется
       несколькими строками с общим `message.id` — считается один раз).
     opencode — `opencode.db` (по умолчанию <дом>/.local/share/opencode/;
       другой путь — `--db`): v2 — `session_v2` + `session_message`, v1 —
       `session` + `message`; сессии — по `directory` = корень проекта.
     общий читатель — для CLI без своего читателя (CLI контура): включается,
       когда два источника выше за окно не дали ни одного запроса, или флагом
       --generic. Ищет .json/.jsonl с упоминанием корня проекта и ID задачи,
       узнаёт распространённые формы счётчиков токенов (раздел «общий
       читатель» ниже); форма печатается строкой «источники». Не узнал —
       `probe` печатает форму журналов (имена полей, без значений), по ней
       дописывается читатель; до тех пор — `--manual`.

   ЗАПРОСЫ И ВЫЗОВЫ: под строкой отчёта — число запросов к модели и вызовов
   инструментов за окно (субагенты — тоже). В таблицу задачи не пишутся: её
   форма не меняется. opencode вызовы не отдаёт — «—».

   ТОКЕНЫ: Вход = новые на входе + запись в кэш; Кэш = чтение из кэша
   (повторно прочитанный контекст); Выход = выход + рассуждения; Всего — сумма.
   Всего — объём работы, а не занятость окна: каждый запрос заново несёт весь
   контекст, и сумма по запросам в десятки раз больше окна. Занятость окна —
   «Пик окна»: самый большой запрос за этап (вход + кэш + выход одного запроса,
   субагенты — тоже, у них своё окно). В «Итого» — максимум по этапам. Его и
   сравнивают с пределом окна модели и со сметой ctx-budget. В opencode запрос —
   одно сообщение ассистента; не проверено, не суммирует ли оно несколько шагов
   (тогда пик завышен).
   Субагенты входят в токены, но не во время: их работа идёт, пока основная
   сессия ждёт результата инструмента, и уже входит в её время.

   АКТИВНОЕ ВРЕМЯ: сумма промежутков между соседними событиями сессии, кроме
   промежутков, которые кончаются сообщением человека (пауза между ходами), и
   ожидания ответа на инструмент вопроса или одобрения (WAIT_TOOLS). Ожидание
   подтверждения прав внутри хода от работы инструмента не отличить — оно
   входит. В opencode инструмент вопроса не вычитается: в журнале v2 его
   ожидание не отделено от шага.

   Шапка задачи: `status` не из словаря docs/tasks/README.md или `id` не равен
   ID из имени файла — предупреждение (проверки шапки в гейте нет, решение
   человека 14.10.2026).

   Использование:
     node task-cost.mjs start <ID> [--at <ISO>]
     node task-cost.mjs mark <ID> <Этап> [--from <ISO>] [--at <ISO>] [--dry]
     node task-cost.mjs mark <ID> <Этап> --manual --tokens <N> --minutes <M> [--peak <N>]
     node task-cost.mjs report <ID> [--from <ISO>] [--at <ISO>] [--generic]
     node task-cost.mjs probe              — где лежат журналы неизвестного CLI
     node task-cost.mjs --selftest
   Общие флаги: --db <путь к opencode.db>, --home <домашний каталог>.
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1 (2 — нет проекта).
   ============================================================ */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync, appendFileSync, rmSync, mkdtempSync, openSync, readSync, closeSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { need } from './project.mjs';

const SELF = fileURLToPath(import.meta.url);
const HERE = path.dirname(SELF);
const TOOL = 'task-cost';

const STATUSES = ['draft', 'open', 'in-progress', 'review', 'done', 'backlog', 'superseded'];
const BEGIN = '<!-- task-cost:begin -->';
const END = '<!-- task-cost:end -->';
const HEAD = '| Этап | Вход | Кэш | Выход | Всего | Пик окна | Время | Сессий |';
const SEP = '|---|---:|---:|---:|---:|---:|---:|---:|';
const NOTE = 'Время — активное: без пауз между ходами и ожидания ответа человека. '
  + 'Кэш — повторно прочитанный контекст. Всего = Вход + Кэш + Выход по всем запросам к модели: '
  + 'каждый запрос заново несёт весь контекст, поэтому сумма в десятки раз больше окна. '
  + 'Пик окна — самый большой один запрос: столько модель держала в окне разом; его сравнивают '
  + 'с пределом окна модели. В «Итого» пик — максимум, а не сумма.';
/* Инструменты, ответа на которые ждут от человека: вопрос и одобрение плана. */
const WAIT_TOOLS = new Set(['AskUserQuestion', 'ExitPlanMode', 'question']);

/* ---------------- источник: журнал JSONL ---------------- */

const sanitize = (root) => path.resolve(root).replace(/[^A-Za-z0-9]/g, '-');

/** Каталоги сессий проекта: <дом>/.<любое>/projects/<корень проекта>/. */
function jsonlDirs(home, root) {
  const name = sanitize(root);
  let entries = [];
  try { entries = readdirSync(home, { withFileTypes: true }); } catch { return []; }
  return entries
    .filter((d) => d.isDirectory() && d.name.startsWith('.'))
    .map((d) => path.join(home, d.name, 'projects', name))
    .filter((p) => existsSync(p));
}

function walk(dir, out = [], depth = 0) {
  if (depth > 3) return out;
  let entries = [];
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out, depth + 1);
    else if (e.name.endsWith('.jsonl')) out.push(p);
  }
  return out;
}

/** Одна сессия JSONL → { usage: [{t,in,cache,out}], events: [{t,human}], waits: [[s,e]] }. */
/* task — ID задачи. Упоминание считается, только если его написал человек или
   агент (текст, аргументы инструмента); вывод инструментов не в счёт: сессия
   о другой задаче видит ID в пересобранном docs/index.md или в диффе. */
function parseJsonl(text, task) {
  const usage = [], events = [], waits = [], calls = [], open = new Map(), seen = new Set(), seenCall = new Set();
  let hit = !task;
  const says = (c) => !hit && c && c.type !== 'tool_result' && JSON.stringify(c).includes(task);
  for (const line of text.split('\n')) {
    if (!line.trim()) continue;
    let e;
    try { e = JSON.parse(line); } catch { continue; }
    const t = Date.parse(e.timestamp);
    if (!Number.isFinite(t)) continue;
    const msg = e.message || {};
    const content = Array.isArray(msg.content) ? msg.content : [];
    if (e.type === 'assistant') {
      events.push({ t, human: false });
      const key = msg.id || e.requestId || e.uuid;
      const u = msg.usage;
      if (u && !seen.has(key)) {
        seen.add(key);
        const x = {
          t,
          in: (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0),
          cache: u.cache_read_input_tokens || 0,
          out: u.output_tokens || 0,
        };
        usage.push({ ...x, peak: x.in + x.cache + x.out });
      }
      for (const c of content) {
        if (c && c.type === 'tool_use' && !seenCall.has(c.id)) { seenCall.add(c.id); calls.push(t); }
        if (c && c.type === 'tool_use' && WAIT_TOOLS.has(c.name)) open.set(c.id, t);
        if (says(c)) hit = true;
      }
    } else if (e.type === 'user') {
      const results = content.filter((c) => c && c.type === 'tool_result');
      for (const r of results) if (open.has(r.tool_use_id)) { waits.push([open.get(r.tool_use_id), t]); open.delete(r.tool_use_id); }
      events.push({ t, human: !results.length && !e.isMeta });
      if (typeof msg.content === 'string' ? !hit && task && msg.content.includes(task) : content.some(says)) hit = true;
    }
  }
  return { usage, events, waits, calls, hit };
}

/** task — ID задачи: берутся сессии, где он встречается; субагент — вместе со своей сессией. */
function readJsonl(home, root, from, to, task) {
  const sessions = [];
  for (const dir of jsonlDirs(home, root)) {
    const files = walk(dir).filter((f) => { try { return statSync(f).mtimeMs >= from; } catch { return false; } });
    const isSub = (f) => path.basename(path.dirname(f)) === 'subagents';
    const taken = new Set();
    for (const file of [...files.filter((f) => !isSub(f)), ...files.filter(isSub)]) {
      const text = readFileSync(file, 'utf8');
      const id = path.basename(file, '.jsonl');
      const sub = isSub(file);
      const parent = sub ? path.basename(path.dirname(path.dirname(file))) : null;
      const s = parseJsonl(text, task);
      if (!s.hit && !(sub && taken.has(parent))) continue;
      if (!sub) taken.add(id);
      sessions.push({ id, sub, src: 'jsonl', ...s });
    }
  }
  return sessions;
}

/* ---------------- источник: opencode ---------------- */

async function sqlite() {
  const emit = process.emitWarning;
  process.emitWarning = (w, ...a) => (/SQLite/i.test(String(w)) ? undefined : emit.call(process, w, ...a));
  try { return (await import('node:sqlite')).DatabaseSync; } catch { return null; } finally { process.emitWarning = emit; }
}

const sameDir = (a, b) => {
  const n = (p) => path.resolve(p).split(path.sep).join('/').replace(/\/+$/, '');
  return process.platform === 'win32' ? n(a).toLowerCase() === n(b).toLowerCase() : n(a) === n(b);
};

function ocTokens(tk, t) {
  const c = tk.cache || {};
  const x = { t, in: (tk.input || 0) + (c.write || 0), cache: c.read || 0, out: (tk.output || 0) + (tk.reasoning || 0) };
  return { ...x, peak: x.in + x.cache + x.out };
}

async function readOpencode(dbPath, root, from, to, task) {
  if (!dbPath || !existsSync(dbPath)) return [];
  const DB = await sqlite();
  if (!DB) return [];
  const db = new DB(dbPath, { readOnly: true });
  try {
    const tables = new Set(db.prepare("select name from sqlite_master where type='table'").all().map((r) => r.name));
    /* Упоминание задачи — в словах человека (v2: сообщения user) или в тексте
       (v1: части type text); вывод инструментов не в счёт, как и в JSONL. */
    const mentions = (msgTable, id) => (msgTable === 'session_message'
      ? db.prepare("select 1 from session_message where session_id = ? and type = 'user' and data like ? limit 1").get(id, '%' + task + '%')
      : tables.has('part') && db.prepare('select 1 from part where session_id = ? and data like ? and data like ? limit 1').get(id, '%"type":"text"%', '%' + task + '%'));
    const pick = (sessTable, msgTable, kindOf) => {
      if (!tables.has(sessTable) || !tables.has(msgTable)) return [];
      const ids = db.prepare(`select id, directory from ${sessTable}`).all().filter((r) => sameDir(r.directory, root)).map((r) => r.id)
        .filter((id) => !task || mentions(msgTable, id));
      const out = [];
      const q = db.prepare(`select ${kindOf}, data from ${msgTable} where session_id = ? and time_created >= ? and time_created <= ?`);
      for (const id of ids) {
        const usage = [], events = [];
        for (const r of q.all(id, from - 864e5, to)) {
          let d;
          try { d = JSON.parse(r.data); } catch { continue; }
          const kind = r.kind || d.role;
          const time = d.time || {};
          if (kind === 'user') { if (time.created) events.push({ t: time.created, human: true }); continue; }
          if (time.created) events.push({ t: time.created, human: false });
          if (time.completed) events.push({ t: time.completed, human: false });
          if (kind === 'assistant' && d.tokens) usage.push(ocTokens(d.tokens, time.completed || time.created));
        }
        if (usage.length || events.length) out.push({ id, sub: false, usage, events, waits: [], calls: null, src: 'opencode' });
      }
      return out;
    };
    const v2 = pick('session_v2', 'session_message', 'type as kind');
    return v2.length ? v2 : pick('session', 'message', 'null as kind');
  } finally {
    db.close();
  }
}

/* ---------------- источник: общий читатель (CLI без своего читателя) ----------------

   Включается, только когда журнал JSONL и opencode за окно не дали ни одного
   запроса (или флагом --generic): CLI контура пишет журнал в неизвестном месте и
   форме. Ищет, как probe, файлы .json/.jsonl в скрытых каталогах дома (и APPDATA,
   LOCALAPPDATA, ~/Library/Application Support), изменённые с начала окна, где
   упомянуты корень проекта и ID задачи. В каждой записи узнаёт распространённые
   формы счётчиков токенов (USAGE_FORMS), время записи, вызовы инструментов и
   реплики человека. Файл — одна сессия. Допущения: счётчик — на запрос, а не
   нарастающий итог за сессию; запись без времени не считается. Форма, по
   которой посчитано, печатается строкой «источники» — её сверяют глазами. */

const TS_KEYS = ['timestamp', 'time', 'ts', 'created', 'createdAt', 'created_at', 'startTime', 'date'];
function tsOf(o) {
  for (const k of TS_KEYS) {
    let v = o[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) v = v.completed || v.created || v.end || v.start;
    if (typeof v === 'number' && v > 1e9) return v > 1e12 ? v : v * 1000;
    if (typeof v === 'string') { const t = Date.parse(v); if (Number.isFinite(t)) return t; }
  }
  return null;
}
const nz = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0);
const has = (o, ...ks) => ks.some((k) => typeof o[k] === 'number');
/* [имя формы, узнать, разложить в { in, cache, out }]. Вход — новое плюс запись в кэш,
   Кэш — чтение из кэша, Выход — выход плюс рассуждения (как у JSONL и opencode). */
const USAGE_FORMS = [
  ['input_tokens+cache_*', (o) => has(o, 'input_tokens', 'output_tokens') && has(o, 'cache_read_input_tokens', 'cache_creation_input_tokens'),
    (o) => ({ in: nz(o.input_tokens) + nz(o.cache_creation_input_tokens), cache: nz(o.cache_read_input_tokens), out: nz(o.output_tokens) })],
  ['input_tokens+cached_tokens', (o) => has(o, 'input_tokens', 'output_tokens'),
    (o) => { const c = nz((o.input_tokens_details || {}).cached_tokens); return { in: Math.max(0, nz(o.input_tokens) - c), cache: c, out: nz(o.output_tokens) }; }],
  ['prompt_tokens/completion_tokens', (o) => has(o, 'prompt_tokens', 'completion_tokens'),
    (o) => { const c = nz((o.prompt_tokens_details || {}).cached_tokens); return { in: Math.max(0, nz(o.prompt_tokens) - c), cache: c, out: nz(o.completion_tokens) }; }],
  ['promptTokenCount', (o) => has(o, 'promptTokenCount', 'candidatesTokenCount'),
    (o) => { const c = nz(o.cachedContentTokenCount); return { in: Math.max(0, nz(o.promptTokenCount) - c) + nz(o.toolUsePromptTokenCount), cache: c, out: nz(o.candidatesTokenCount) + nz(o.thoughtsTokenCount) }; }],
];
/* Короткие имена (input/output) узнаются только под ключом tokens/usage: иначе их
   слишком много в чужих данных. cached числом — вход его включает; cache объектом —
   не включает (форма opencode). */
const SHORT_PARENTS = new Set(['tokens', 'usage', 'tokenUsage', 'token_usage', 'usageMetadata']);
function shortUsage(o) {
  if (!has(o, 'input', 'output')) return null;
  if (o.cache && typeof o.cache === 'object') return { form: 'tokens{input,output,cache}', in: nz(o.input) + nz(o.cache.write), cache: nz(o.cache.read), out: nz(o.output) + nz(o.reasoning) };
  const c = nz(o.cached);
  return { form: 'tokens{input,output,cached}', in: Math.max(0, nz(o.input) - c) + nz(o.tool), cache: c, out: nz(o.output) + nz(o.thoughts) + nz(o.reasoning) };
}
const CALL_TYPES = new Set(['tool_use', 'tool_call', 'function_call', 'toolCall', 'server_tool_use']);
const RESULT_RX = /tool_result|functionResponse|tool_call_id|toolResult|function_call_output/;

/** Один файл → { usage, events, calls, forms }. */
function parseGeneric(text) {
  const usage = [], events = [], calls = [], forms = new Set(), seenU = new Set(), seenC = new Set(), seenH = new Set();
  const call = (id, t) => { const k = id || t + ':' + calls.length; if (!seenC.has(k)) { seenC.add(k); calls.push(t); } };
  /* rid — id ответа у владельца счётчика (сам объект или его родитель, не глубже): одна
     реплика бывает записана несколькими строками с разным временем — считается один раз. */
  const visit = (o, t, parentKey, depth, rid = null) => {
    if (!o || typeof o !== 'object' || depth > 10) return;
    if (Array.isArray(o)) {
      if ((parentKey === 'tool_calls' || parentKey === 'toolCalls') && t !== null) for (const c of o) call(c && c.id, t);
      else for (const v of o) visit(v, t, parentKey, depth + 1);
      return;
    }
    const own = tsOf(o);
    if (own !== null) t = own;
    const id = typeof (o.id || o.requestId || o.responseId) === 'string' ? (o.id || o.requestId || o.responseId) : null;
    let u = null;
    for (const [form, is, split] of USAGE_FORMS) if (is(o)) { u = { form, ...split(o) }; break; }
    if (!u && SHORT_PARENTS.has(parentKey)) u = shortUsage(o);
    if (u) {
      if (t !== null && u.in + u.cache + u.out > 0) {
        const k = (id || rid) ? 'id:' + (id || rid) : t + '|' + u.in + '|' + u.cache + '|' + u.out;
        if (!seenU.has(k)) { seenU.add(k); forms.add(u.form); usage.push({ t, in: u.in, cache: u.cache, out: u.out, peak: u.in + u.cache + u.out }); events.push({ t, human: false }); }
      }
      return;
    }
    if (t !== null && (CALL_TYPES.has(o.type) || (o.functionCall && typeof o.functionCall === 'object'))) call(o.id, t);
    if (own !== null && (o.role === 'user' || o.type === 'user') && !seenH.has(own)) {
      seenH.add(own);
      events.push({ t: own, human: !RESULT_RX.test(JSON.stringify(o)) });
    }
    for (const [k, v] of Object.entries(o)) if (v && typeof v === 'object') visit(v, t, k, depth + 1, id);
  };
  const lines = text.split('\n').filter((l) => l.trim());
  let parsed = 0;
  if (lines.length > 1) for (const l of lines) { try { visit(JSON.parse(l), null, '', 0); parsed++; } catch { /* не строка JSON */ } }
  if (!parsed) { try { visit(JSON.parse(text), null, '', 0); } catch { /* не JSON целиком */ } }
  return { usage, events, calls, forms };
}

function genericRoots(home) {
  const roots = [];
  try { for (const d of readdirSync(home, { withFileTypes: true })) if (d.isDirectory() && d.name.startsWith('.')) roots.push(path.join(home, d.name)); } catch { /* нет дома */ }
  for (const env of ['APPDATA', 'LOCALAPPDATA']) if (process.env[env] && process.env[env].startsWith(home)) roots.push(process.env[env]);
  const lib = path.join(home, 'Library', 'Application Support');
  if (existsSync(lib)) roots.push(lib);
  return roots;
}
const needlesOf = (root) => [root, root.split(path.sep).join('/'), root.split(path.sep).join('\\\\'), sanitize(root)];

/* Windows и macOS по умолчанию не различают регистр: каталог журнала «e--…» и найденный
   existsSync путь «E--…» — один каталог, иначе общий читатель посчитал бы его второй раз. */
const under = (p, k) => (process.platform === 'linux' ? p.startsWith(k) : p.toLowerCase().startsWith(k.toLowerCase()));

function readGeneric(home, root, from, to, task) {
  const skip = jsonlDirs(home, root);
  const needles = needlesOf(root);
  const sessions = [];
  let visited = 0;
  const walkDir = (dir, depth) => {
    if (depth > 6 || visited > 30000) return;
    let entries = [];
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (!/^(node_modules|\.git|Cache|cache|GPUCache|Code Cache|CachedData|extensions)$/.test(e.name) && !skip.some((k) => under(p, k))) walkDir(p, depth + 1); continue; }
      if (!/\.jsonl?$/i.test(e.name)) continue;
      visited++;
      let st;
      try { st = statSync(p); } catch { continue; }
      if (st.mtimeMs < from || st.size > 64 * 1024 * 1024) continue;
      let txt;
      try { txt = readFileSync(p, 'utf8'); } catch { continue; }
      const hay = process.platform === 'linux' ? txt : txt.toLowerCase();
      if (!needles.some((n) => hay.includes(process.platform === 'linux' ? n : n.toLowerCase())) || (task && !txt.includes(task))) continue;
      const g = parseGeneric(txt);
      if (!g.usage.some((x) => x.t >= from && x.t <= to)) continue;
      sessions.push({ id: p, sub: false, src: 'generic', usage: g.usage, events: g.events, waits: [], calls: g.calls, forms: [...g.forms] });
    }
  };
  for (const r of genericRoots(home)) walkDir(r, 0);
  return sessions;
}

/* ---------------- счёт окна ---------------- */

function activeMs(events, waits, from, to) {
  const ev = events.filter((e) => e.t >= from && e.t <= to).sort((a, b) => a.t - b.t);
  let ms = 0;
  for (let i = 1; i < ev.length; i++) {
    const a = ev[i - 1], b = ev[i];
    if (b.human) continue;
    let gap = b.t - a.t;
    for (const [s, e] of waits) {
      const o = Math.min(e, b.t) - Math.max(s, a.t);
      if (o > 0) gap -= o;
    }
    ms += Math.max(0, gap);
  }
  return ms;
}

function tally(sessions, from, to) {
  const r = { in: 0, cache: 0, out: 0, peak: 0, ms: 0, sessions: 0, reqs: 0, calls: 0, callsKnown: true, src: {}, forms: new Set() };
  const counted = new Set();
  for (const s of sessions) {
    const u = s.usage.filter((x) => x.t >= from && x.t <= to);
    for (const x of u) { r.in += x.in; r.cache += x.cache; r.out += x.out; r.peak = Math.max(r.peak, x.peak); }
    r.reqs += u.length;
    if (u.length) {
      if (s.calls) r.calls += s.calls.filter((t) => t >= from && t <= to).length; else r.callsKnown = false;
      r.src[s.src || 'jsonl'] = (r.src[s.src || 'jsonl'] || 0) + 1;
      for (const f of s.forms || []) r.forms.add(f);
    }
    if (!s.sub) {
      r.ms += activeMs(s.events, s.waits, from, to);
      if (u.length && !counted.has(s.id)) { counted.add(s.id); r.sessions++; }
    }
  }
  return r;
}

async function collect(opts, root, from, to, task) {
  const sessions = [
    ...readJsonl(opts.home, root, from, to, task),
    ...(await readOpencode(opts.db, root, from, to, task)),
  ];
  const known = tally(sessions, from, to);
  if (!opts.generic && known.reqs) return known;
  return tally([...sessions, ...readGeneric(opts.home, root, from, to, task)], from, to);
}

/** Строки «источники» и «запросов / вызовов» под строкой отчёта. */
function extraLines(c) {
  const names = { jsonl: 'журнал JSONL', opencode: 'opencode', generic: 'общий читатель' };
  const src = Object.entries(c.src).map(([k, n]) => names[k] + ' — файлов ' + n).join('; ') || 'нет';
  return [
    'источники: ' + src + (c.forms.size ? ' (форма: ' + [...c.forms].join(', ') + ')' : ''),
    'запросов к модели: ' + num(c.reqs) + ' · вызовов инструментов: ' + (c.callsKnown ? num(c.calls) : '— (источник не пишет вызовы)'),
  ];
}

/* ---------------- таблица в задаче ---------------- */

const num = (n) => (n === null ? '—' : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
const unnum = (s) => (/^\s*—\s*$/.test(s) ? null : Number(s.replace(/[\s  ]/g, '')) || 0);
function dur(min) {
  if (min === null) return '—';
  const m = Math.round(min);
  return m < 60 ? m + ' мин' : Math.floor(m / 60) + ' ч ' + String(m % 60).padStart(2, '0') + ' мин';
}
function undur(s) {
  if (/^\s*—\s*$/.test(s)) return null;
  const h = /(\d+)\s*ч/.exec(s), m = /(\d+)\s*мин/.exec(s);
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}

function rowOf(stage, r) {
  const total = r.in === null ? r.total : r.in + r.cache + r.out;
  return { stage, in: r.in, cache: r.cache, out: r.out, total, peak: r.peak ?? null, min: r.min, sessions: r.sessions };
}
const line = (r) => '| ' + [r.stage, num(r.in), num(r.cache), num(r.out), num(r.total), num(r.peak), dur(r.min), r.sessions === null ? '—' : String(r.sessions)].join(' | ') + ' |';

/* Строки этапов: 8 колонок; 7 — таблица до колонки «Пик окна» (до 14.10.2026),
   пик у таких строк «—», при следующей отметке таблица перерисуется в 8.
   Шапка и разделитель любой из двух форм строками этапов не считаются. */
function parseRows(block) {
  return block.split('\n')
    .filter((l) => /^\|/.test(l) && !/^\|\s*(Этап|\*\*Итого\*\*)\s*\|/.test(l) && !/^\|[-:|\s]+\|$/.test(l))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
    .filter((c) => c.length === 7 || c.length === 8)
    .map((c) => (c.length === 7 ? [...c.slice(0, 5), '—', ...c.slice(5)] : c))
    .map((c) => ({ stage: c[0], in: unnum(c[1]), cache: unnum(c[2]), out: unnum(c[3]), total: unnum(c[4]), peak: unnum(c[5]), min: undur(c[6]), sessions: /^\d+$/.test(c[7]) ? Number(c[7]) : null }));
}

function render(rows) {
  const sum = (k) => (rows.every((r) => r[k] === null) ? null : rows.reduce((a, r) => a + (r[k] || 0), 0));
  const peaks = rows.map((r) => r.peak).filter((v) => v !== null);
  const total = { stage: '**Итого**', in: sum('in'), cache: sum('cache'), out: sum('out'), total: sum('total'), peak: peaks.length ? Math.max(...peaks) : null, min: sum('min'), sessions: null };
  return [HEAD, SEP, ...rows.map(line), line(total), '', NOTE].join('\n');
}

/** Вставить или заменить строку этапа; текст вне меток не трогается. */
function upsert(text, row) {
  const b = text.indexOf(BEGIN), e = text.indexOf(END);
  if (b < 0 || e < b) return null;
  const rows = parseRows(text.slice(b + BEGIN.length, e));
  const i = rows.findIndex((r) => r.stage === row.stage);
  if (i >= 0) rows[i] = row; else rows.push(row);
  return text.slice(0, b + BEGIN.length) + '\n' + render(rows) + '\n' + text.slice(e);
}

/* ---------------- задача и отметки ---------------- */

function taskFile(tasksDir, id) {
  let names = [];
  try { names = readdirSync(tasksDir); } catch { return null; }
  const f = names.find((n) => n.startsWith(id + '-') && n.endsWith('.md') && !/\.(handoff|review(-\d+)?)\.md$/.test(n));
  return f ? path.join(tasksDir, f) : null;
}

function headerWarnings(text, id) {
  const w = [];
  const fm = /^---\n([\s\S]*?)\n---/.exec(text.replace(/\r\n/g, '\n'));
  if (!fm) return ['нет YAML-шапки'];
  const val = (k) => { const m = new RegExp('^' + k + ':\\s*(.*)$', 'm').exec(fm[1]); return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : null; };
  const st = val('status');
  if (!STATUSES.includes(st)) w.push('status «' + st + '» не из словаря: ' + STATUSES.join(' | '));
  if (val('id') !== id) w.push('id «' + val('id') + '» не равен ' + id + ' из имени файла');
  return w;
}

const ledgerFile = (stateAbs, id) => path.join(stateAbs, 'task-cost', id + '.jsonl');
function ledger(stateAbs, id) {
  const f = ledgerFile(stateAbs, id);
  if (!existsSync(f)) return [];
  return readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}
function note(stateAbs, id, rec) {
  const f = ledgerFile(stateAbs, id);
  mkdirSync(path.dirname(f), { recursive: true });
  appendFileSync(f, JSON.stringify(rec) + '\n', 'utf8');
}

/* ---------------- команды ---------------- */

function parseArgs(argv) {
  const pos = [], fl = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const k = a.slice(2), v = argv[i + 1];
    if (v !== undefined && !v.startsWith('--')) { fl[k] = v; i++; } else fl[k] = true;
  }
  return { pos, fl };
}

const time = (s, def) => {
  if (s === undefined || s === true) return def;
  const t = Date.parse(s);
  if (!Number.isFinite(t)) throw new Error('время не разобрано: ' + s + ' (нужен ISO, например 2026-10-14T14:03:43Z)');
  return t;
};

function defaults(fl) {
  const home = typeof fl.home === 'string' ? fl.home : os.homedir();
  const db = typeof fl.db === 'string' ? fl.db : path.join(home, '.local', 'share', 'opencode', 'opencode.db');
  return { home, db, generic: fl.generic === true };
}

/** Ядро команд — без process.exit, чтобы его гонял selftest. Возвращает { out, ok }. */
async function run(ctx, argv) {
  const { pos, fl } = parseArgs(argv);
  const [cmd, id, stage] = pos;
  const out = [];
  const fail = (m) => ({ out: [...out, 'ОШИБКА: ' + m, 'ВЕРДИКТ: FAIL'], ok: false });
  const opts = defaults(fl);

  if (cmd === 'probe') return probe(ctx, opts);
  if (!id) return fail('нужен ID задачи');
  const file = taskFile(ctx.tasksDir, id);
  if (!file) return fail('задача ' + id + ' не найдена в ' + ctx.tasksDir);
  const text = readFileSync(file, 'utf8');
  for (const w of headerWarnings(text, id)) out.push('ПРЕДУПРЕЖДЕНИЕ: ' + w);
  const marked = text.includes(BEGIN) && text.includes(END);

  let now;
  try { now = time(fl.at, ctx.now()); } catch (e) { return fail(e.message); }

  if (cmd === 'start') {
    if (!marked) out.push('ПРЕДУПРЕЖДЕНИЕ: в задаче нет меток ' + BEGIN + ' / ' + END + ' — mark не сможет записать строку');
    note(ctx.stateAbs, id, { t: new Date(now).toISOString(), kind: 'start' });
    out.push('старт ' + id + ': ' + new Date(now).toISOString(), 'ВЕРДИКТ: OK');
    return { out, ok: true };
  }
  if (cmd !== 'mark' && cmd !== 'report') return fail('команда: start | mark | report | probe');
  if (cmd === 'mark' && !stage) return fail('нужен этап: mark ' + id + ' Э1');

  let from;
  try { from = time(fl.from, null); } catch (e) { return fail(e.message); }
  if (from === null) {
    const last = ledger(ctx.stateAbs, id).filter((r) => Date.parse(r.t) < now).pop();
    if (!last) return fail('нет отметки старта: start ' + id + ' или --from <ISO>');
    from = Date.parse(last.t);
  }

  let r, extra = [];
  if (fl.manual) {
    const tokens = Number(fl.tokens), minutes = Number(fl.minutes), peak = fl.peak === undefined ? null : Number(fl.peak);
    if (!Number.isFinite(tokens) || !Number.isFinite(minutes)) return fail('--manual: нужны --tokens <N> и --minutes <M> (пик окна — необязательный --peak <N>)');
    if (peak !== null && !Number.isFinite(peak)) return fail('--peak: нужно число токенов');
    r = rowOf(stage, { in: null, cache: null, out: null, total: tokens, peak, min: minutes, sessions: null });
  } else {
    const c = await collect(opts, ctx.root, from, now, fl['all-sessions'] ? null : id);
    if (!c.sessions && !(c.in + c.cache + c.out)) {
      return fail('за окно ' + new Date(from).toISOString() + ' → ' + new Date(now).toISOString()
        + ' журналов сессий не найдено. Неизвестный CLI — probe; без журналов — --manual --tokens <N> --minutes <M>');
    }
    r = rowOf(stage || 'окно', { ...c, min: c.ms / 60000 });
    extra = extraLines(c);
  }
  out.push('окно: ' + new Date(from).toISOString() + ' → ' + new Date(now).toISOString(), HEAD, SEP, line(r), ...extra);

  if (cmd === 'report' || fl.dry) { out.push('ВЕРДИКТ: OK'); return { out, ok: true }; }
  if (!marked) return fail('в задаче нет меток ' + BEGIN + ' / ' + END + ' (раздел «Затраты» шаблона)');
  writeFileSync(file, upsert(text, r), 'utf8');
  note(ctx.stateAbs, id, { t: new Date(now).toISOString(), kind: 'mark', stage, from: new Date(from).toISOString(), total: r.total, min: r.min });
  out.push('строка ' + stage + ' записана: ' + path.relative(ctx.root, file).split(path.sep).join('/'), 'ВЕРДИКТ: OK');
  return { out, ok: true };
}

/* ---------------- probe: где журналы неизвестного CLI ---------------- */

function head(file, bytes = 262144) {
  const fd = openSync(file, 'r');
  try { const b = Buffer.alloc(bytes); const n = readSync(fd, b, 0, bytes, 0); return b.toString('utf8', 0, n); } finally { closeSync(fd); }
}

/** Имена полей (пути через точку), без значений; tokenish — те, что похожи на счётчики токенов и время. */
function keyPaths(obj, prefix = '', out = new Set(), depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 4) return out;
  for (const [k, v] of Object.entries(Array.isArray(obj) ? obj.slice(0, 3) : obj)) {
    const p = Array.isArray(obj) ? prefix + '[]' : prefix ? prefix + '.' + k : k;
    if (!Array.isArray(obj)) out.add(p);
    keyPaths(v, p, out, depth + 1);
  }
  return out;
}

function probe(ctx, opts) {
  const out = ['== ' + TOOL + ' probe: журналы сессий агента =='];
  const known = jsonlDirs(opts.home, ctx.root);
  out.push('журнал JSONL: ' + (known.length ? known.length + ' каталог(ов) найдено' : 'нет'));
  out.push('opencode: ' + (existsSync(opts.db) ? 'база есть' : 'базы нет'));
  const needles = [ctx.root, ctx.root.split(path.sep).join('/'), ctx.root.split(path.sep).join('\\\\'), sanitize(ctx.root)];
  const roots = [];
  try { for (const d of readdirSync(opts.home, { withFileTypes: true })) if (d.isDirectory() && d.name.startsWith('.')) roots.push(path.join(opts.home, d.name)); } catch { /* нет дома */ }
  for (const env of ['APPDATA', 'LOCALAPPDATA']) if (process.env[env]) roots.push(process.env[env]);
  const since = ctx.now() - 30 * 864e5;
  const found = new Map();
  let visited = 0;
  const visit = (dir, depth) => {
    if (depth > 5 || visited > 20000) return;
    let entries = [];
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (!/^(node_modules|\.git|Cache|cache|GPUCache|Code Cache)$/.test(e.name)) visit(p, depth + 1); continue; }
      if (!/\.(jsonl?|db|sqlite)$/i.test(e.name)) continue;
      visited++;
      let st;
      try { st = statSync(p); } catch { continue; }
      if (st.mtimeMs < since || known.some((k) => p.startsWith(k))) continue;
      if (/\.(db|sqlite)$/i.test(e.name)) { if (/session|chat|history|agent/i.test(p)) found.set(p, { keys: ['(база SQLite — таблицы смотреть отдельно)'] }); continue; }
      let txt;
      try { txt = head(p); } catch { continue; }
      if (!needles.some((n) => txt.includes(n))) continue;
      const keys = new Set();
      for (const l of txt.split('\n').slice(0, 200)) { try { keyPaths(JSON.parse(l), '', keys); } catch { /* не строка JSON */ } }
      if (!keys.size) { try { keyPaths(JSON.parse(txt), '', keys); } catch { /* обрезан */ } }
      found.set(p, { keys: [...keys] });
    }
  };
  for (const r of roots) visit(r, 0);
  out.push('файлов просмотрено: ' + visited + '; упоминают этот проект за 30 дней: ' + found.size);
  for (const [p, { keys }] of [...found].slice(0, 15)) {
    const tokenish = keys.filter((k) => /token|usage|time|stamp|created|role|type/i.test(k));
    out.push('', p, '  поля: ' + (tokenish.length ? tokenish.slice(0, 40).join(', ') : keys.slice(0, 25).join(', ')));
  }
  out.push('', 'Вывод — только пути и имена полей, значений нет. Пришлите его в отчёт задачи: если report не нашёл журналов, по нему пишется читатель.', 'ВЕРДИКТ: OK');
  return { out, ok: true };
}

/* ---------------- selftest: временное дерево и поддельные журналы ---------------- */

function put(root, rel, text) {
  const p = path.join(root, rel);
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, text, 'utf8');
}

const T0 = Date.parse('2026-10-14T10:00:00Z');
const at = (min) => new Date(T0 + min * 60000).toISOString();
const asst = (min, id, usage, tools = []) => JSON.stringify({ type: 'assistant', timestamp: at(min), message: { id, usage, content: tools.map(([tid, name]) => ({ type: 'tool_use', id: tid, name })) } });
const human = (min, text = 'x') => JSON.stringify({ type: 'user', timestamp: at(min), message: { content: [{ type: 'text', text } ] } });
const result = (min, tid) => JSON.stringify({ type: 'user', timestamp: at(min), message: { content: [{ type: 'tool_result', tool_use_id: tid }] } });
const U = (i, c, o) => ({ input_tokens: i, cache_creation_input_tokens: 0, cache_read_input_tokens: c, output_tokens: o });

const TASK = '---\nid: \'RE0099\'\ntitle: \'Проба\'\nstatus: in-progress\n---\n\n# Проба\n\n## Затраты\n\n' + BEGIN + '\n' + END + '\n\nТекст после.\n';

function stand() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'task-cost-'));
  const home = path.join(root, '_home');
  const sess = path.join(home, '.cli', 'projects', sanitize(root));
  /* Ход 1: 0 → 5 мин, внутри — вопрос человеку 2 → 12 мин (ждём 10 мин), дальше 13 мин.
     Пауза до 40 мин. Ход 2: 40 → 43 мин. Строки одной реплики (m1) — дважды. */
  put(sess, 's1.jsonl', [
    human(0, 'продолжим RE0099'), asst(1, 'm1', U(10, 1000, 5)), asst(1, 'm1', U(10, 1000, 5)),
    asst(2, 'm2', U(20, 2000, 10), [['q1', 'AskUserQuestion']]), result(12, 'q1'),
    asst(13, 'm3', U(30, 3000, 15)),
    human(40), asst(43, 'm4', U(40, 4000, 20)),
    human(200), asst(201, 'm5', U(1, 1, 1)),
  ].join('\n') + '\n');
  put(sess, 's1/subagents/a1.jsonl', [asst(3, 's-1', U(100, 0, 50)), asst(30, 's-2', U(100, 0, 50))].join('\n') + '\n');
  /* Параллельная сессия о другой задаче — в счёт RE0099 не входит. */
  put(sess, 's2.jsonl', [human(4, 'другая задача'), asst(5, 'o1', U(7777, 7777, 7777))].join('\n') + '\n');
  put(root, 'docs/tasks/RE0099-probe.md', TASK);
  put(root, 'docs/tasks/RE0099-probe.handoff.md', '# не задача\n');
  return { root, home, ctx: { root, tasksDir: path.join(root, 'docs', 'tasks'), stateAbs: path.join(root, '.state'), now: () => T0 + 100 * 60000 } };
}

async function selftest() {
  const lines = ['== ' + TOOL + ' --selftest =='];
  let failed = 0, total = 0;
  const check = (name, pass, detail = '') => { total++; if (!pass) failed++; lines.push((pass ? 'ok    ' : 'FAIL  ') + name + (detail ? ' — ' + detail : '')); };
  const s = stand();
  const H = ['--home', s.home, '--db', path.join(s.root, 'none.db')];
  try {
    /* Окно 0 → 100 мин: токены без дубля реплики, субагент в токенах; время 1+1+(13−2−10)+3 = 6 мин. */
    const c = await collect({ home: s.home, db: null }, s.root, T0, T0 + 100 * 60000, 'RE0099');
    const every = await collect({ home: s.home, db: null }, s.root, T0, T0 + 100 * 60000, null);
    check('параллельная сессия без ID задачи не входит; без отбора — входит', c.sessions === 1 && every.sessions === 2 && every.in === c.in + 7777, c.sessions + ' / ' + every.sessions);
    check('токены: реплика из двух строк — один раз, субагент учтён', c.in === 100 + 200 && c.cache === 10000 && c.out === 50 + 100, JSON.stringify(c));
    check('время: без паузы между ходами и ожидания вопроса, субагент не удваивает', Math.round(c.ms / 60000) === 6, Math.round(c.ms / 60000) + ' мин');
    check('сессии: субагент — не отдельная сессия', c.sessions === 1, String(c.sessions));
    check('пик окна: самый большой один запрос, а не сумма', c.peak === 4060, String(c.peak));
    check('запросы и вызовы инструментов: субагент в счёте, повтор строки — один раз', c.reqs === 6 && c.calls === 1 && c.callsKnown, c.reqs + ' / ' + c.calls);
    check('общий читатель не включается, когда журнал JSONL дал запросы', !c.src.generic && c.src.jsonl === 2, JSON.stringify(c.src));

    /* Общий читатель: CLI без своего читателя. Чат одним JSON (короткие имена под
       tokens, вход включает cached, toolCalls) и JSONL с usage вида prompt/completion (реплика записана дважды с разным временем — один раз);
       файл без ID задачи и файл без корня проекта — не в счёт. */
    const home2 = path.join(s.root, '_home2');
    const sec = (min) => Math.round((T0 + min * 60000) / 1000);
    put(home2, '.gcli/tmp/h1/chats/session-1.json', JSON.stringify({ sessionId: 'x', projectRoot: s.root, messages: [
      { type: 'user', timestamp: at(0), content: 'RE0099 старт' },
      { type: 'model', timestamp: at(2), tokens: { input: 1000, output: 50, cached: 800, thoughts: 10, tool: 0, total: 1060 }, toolCalls: [{ id: 't1', name: 'a' }, { id: 't2', name: 'b' }] },
      { type: 'user', timestamp: at(3), content: [{ functionResponse: { name: 'a' } }] },
      { type: 'model', timestamp: at(5), tokens: { input: 3000, output: 100, cached: 2500, thoughts: 0, tool: 0, total: 3100 } },
      { type: 'user', timestamp: at(30), content: 'ещё' },
      { type: 'model', timestamp: at(31), tokens: { input: 10, output: 1, cached: 0 } },
    ] }, null, 2));
    put(home2, '.ocli/log/a.jsonl', [
      JSON.stringify({ created: sec(1), cwd: s.root, role: 'user', content: 'RE0099' }),
      JSON.stringify({ id: 'r1', created: sec(2), role: 'assistant', usage: { prompt_tokens: 500, completion_tokens: 20, prompt_tokens_details: { cached_tokens: 300 } }, tool_calls: [{ id: 'c1', type: 'function' }, { id: 'c2', type: 'function' }] }),
      JSON.stringify({ id: 'r1', created: sec(2) + 7, role: 'assistant', usage: { prompt_tokens: 500, completion_tokens: 20, prompt_tokens_details: { cached_tokens: 300 } }, tool_calls: [{ id: 'c1', type: 'function' }, { id: 'c2', type: 'function' }] }),
    ].join('\n') + '\n');
    put(home2, '.ocli/log/b.jsonl', JSON.stringify({ created: sec(2), cwd: s.root, role: 'assistant', usage: { prompt_tokens: 9e6, completion_tokens: 9e6 } }) + '\n' + JSON.stringify({ created: sec(3), role: 'user', content: 'другое' }) + '\n');
    put(home2, '.ocli/log/c.jsonl', JSON.stringify({ created: sec(2), cwd: '/elsewhere', role: 'assistant', text: 'RE0099', usage: { prompt_tokens: 8e6, completion_tokens: 8e6 } }) + '\n' + JSON.stringify({ created: sec(3), role: 'user', content: 'x' }) + '\n');
    const g = await collect({ home: home2, db: null }, s.root, T0, T0 + 100 * 60000, 'RE0099');
    check('общий читатель: вход без кэша, кэш, выход с рассуждениями, пик — один запрос', g.in === 910 && g.cache === 3600 && g.out === 181 && g.peak === 3100, JSON.stringify({ in: g.in, cache: g.cache, out: g.out, peak: g.peak }));
    check('общий читатель: вызовы инструментов и запросы; чужая задача и чужой проект — не в счёт', g.calls === 4 && g.reqs === 4 && g.src.generic === 2 && g.sessions === 2, JSON.stringify({ calls: g.calls, reqs: g.reqs, src: g.src }));
    const g1 = tally(readGeneric(home2, s.root, T0, T0 + 100 * 60000, 'RE0099').filter((x) => x.id.endsWith('session-1.json')), T0, T0 + 100 * 60000);
    check('общий читатель: время без паузы до реплики человека, ответ инструмента — не человек', Math.round(g1.ms / 60000) === 6, Math.round(g1.ms / 60000) + ' мин');
    const gr = await run(s.ctx, ['report', 'RE0099', '--from', at(0), '--at', at(100), '--home', home2, '--db', path.join(s.root, 'none.db')]);
    const grs = gr.out.join('\n');
    check('report печатает источник с формой и число вызовов', gr.ok && /общий читатель — файлов 2/.test(grs) && grs.includes('prompt_tokens/completion_tokens') && /вызовов инструментов: 4/.test(grs), grs.replace(/\n/g, ' / '));

    let r = await run(s.ctx, ['mark', 'RE0099', 'Э1', ...H]);
    check('mark без старта — отказ с подсказкой', !r.ok && r.out.join('\n').includes('start RE0099'));

    r = await run(s.ctx, ['start', 'RE0099', '--at', at(0), ...H]);
    check('start пишет отметку', r.ok && ledger(s.ctx.stateAbs, 'RE0099').length === 1);

    r = await run({ ...s.ctx, now: () => T0 + 20 * 60000 }, ['mark', 'RE0099', 'Э1', ...H]);
    let text = readFileSync(path.join(s.root, 'docs/tasks/RE0099-probe.md'), 'utf8');
    check('mark: строка этапа и «Итого», текст вне меток цел', r.ok && /\| Э1 \| 160 \| 6 000 \| 80 \| 6 240 \| 3 045 \| 3 мин \| 1 \|/.test(text) && text.includes('| **Итого** | 160 |') && text.endsWith('Текст после.\n'), r.out.join(' / '));

    r = await run({ ...s.ctx, now: () => T0 + 100 * 60000 }, ['mark', 'RE0099', 'Э2', ...H]);
    text = readFileSync(path.join(s.root, 'docs/tasks/RE0099-probe.md'), 'utf8');
    check('второй этап — окно от прошлой отметки, «Итого» пересчитано', r.ok && /\| Э2 \| 140 \| 4 000 \| 70 \| 4 210 \| 4 060 \| 3 мин \| 1 \|/.test(text) && text.includes('| **Итого** | 300 | 10 000 | 150 | 10 450 | 4 060 | 6 мин | — |'), r.out.join(' / '));

    r = await run(s.ctx, ['mark', 'RE0099', 'Э2', '--manual', '--tokens', '5000', '--minutes', '75', '--from', at(20), ...H]);
    text = readFileSync(path.join(s.root, 'docs/tasks/RE0099-probe.md'), 'utf8');
    check('повторная отметка заменяет строку; ручной ввод', r.ok && (text.match(/\| Э2 \|/g) || []).length === 1 && text.includes('| Э2 | — | — | — | 5 000 | — | 1 ч 15 мин | — |') && text.includes('| **Итого** | 160 | 6 000 | 80 | 11 240 | 3 045 | 1 ч 18 мин | — |'), r.out.join(' / '));

    /* Таблица до колонки «Пик окна» (7 колонок): строки читаются, пик у них «—»,
       шапка перерисовывается в 8 колонок. */
    const OLD = ['| Этап | Вход | Кэш | Выход | Всего | Время | Сессий |', '|---|---:|---:|---:|---:|---:|---:|',
      '| Э0 | 1 | 2 | 3 | 6 | 4 мин | 1 |', '| **Итого** | 1 | 2 | 3 | 6 | 4 мин | — |'].join('\n');
    put(s.root, 'docs/tasks/RE0099-probe.md', TASK.replace(BEGIN + '\n', BEGIN + '\n' + OLD + '\n'));
    r = await run(s.ctx, ['mark', 'RE0099', 'Э1', '--manual', '--tokens', '10', '--minutes', '1', '--peak', '7', '--from', at(0), ...H]);
    text = readFileSync(path.join(s.root, 'docs/tasks/RE0099-probe.md'), 'utf8');
    check('старая таблица на 7 колонок: строки целы, пик «—», шапка новая; --peak в ручном вводе', r.ok && text.includes('| Э0 | 1 | 2 | 3 | 6 | — | 4 мин | 1 |') && text.includes('| Э1 | — | — | — | 10 | 7 | 1 мин | — |')
      && text.includes('| **Итого** | 1 | 2 | 3 | 16 | 7 | 5 мин | — |') && text.includes(HEAD) && !text.includes('| Этап | Вход | Кэш | Выход | Всего | Время |'), r.out.join(' / '));

    r = await run(s.ctx, ['report', 'RE0099', '--from', at(150), '--at', at(160), ...H]);
    check('пустое окно — отказ с подсказкой probe и --manual', !r.ok && /probe/.test(r.out.join(' ')));

    put(s.root, 'docs/tasks/RE0099-probe.md', TASK.replace('status: in-progress', 'status: pending').replace("id: 'RE0099'", "id: '099'").replace(BEGIN + '\n' + END + '\n', ''));
    r = await run(s.ctx, ['mark', 'RE0099', 'Э3', '--from', at(0), ...H]);
    const all = r.out.join('\n');
    check('шапка: статус не из словаря и чужой id — предупреждения; нет меток — отказ', !r.ok && /status «pending»/.test(all) && /id «099»/.test(all) && /нет меток/.test(all), all.replace(/\n/g, ' / '));

    /* opencode v2: сессии по каталогу проекта, токены с кэшем и рассуждениями. */
    const DB = await sqlite();
    if (!DB) check('opencode: node:sqlite недоступен — пропуск', true);
    else {
      const dbPath = path.join(s.root, 'oc.db');
      const db = new DB(dbPath);
      db.exec('create table session_v2 (id text, directory text); create table session_message (id text, session_id text, type text, time_created integer, data text);');
      db.prepare('insert into session_v2 values (?, ?)').run('a', s.root);
      db.prepare('insert into session_v2 values (?, ?)').run('b', path.join(s.root, 'другой'));
      const ins = db.prepare('insert into session_message values (?, ?, ?, ?, ?)');
      const m = (min) => T0 + min * 60000;
      ins.run('1', 'a', 'user', m(0), JSON.stringify({ time: { created: m(0) }, text: 'RE0099' }));
      ins.run('2', 'a', 'assistant', m(0), JSON.stringify({ time: { created: m(0), completed: m(2) }, tokens: { input: 5, output: 7, reasoning: 3, cache: { read: 900, write: 10 } } }));
      ins.run('3', 'b', 'assistant', m(1), JSON.stringify({ time: { created: m(1), completed: m(2) }, tokens: { input: 1e6, output: 0, reasoning: 0, cache: { read: 0, write: 0 } } }));
      db.close();
      const oc = tally(await readOpencode(dbPath, s.root, T0, T0 + 10 * 60000, 'RE0099'), T0, T0 + 10 * 60000);
      check('opencode v2: только сессии проекта, вход с записью в кэш, выход с рассуждениями', oc.in === 15 && oc.cache === 900 && oc.out === 10 && oc.peak === 925 && Math.round(oc.ms / 60000) === 2 && oc.sessions === 1, JSON.stringify(oc));
    }
  } finally {
    rmSync(s.root, { recursive: true, force: true });
  }
  lines.push('ВЕРДИКТ: ' + (failed ? 'FAIL (кейсов не прошло: ' + failed + ' из ' + total + ')' : 'OK (кейсов: ' + total + ')'));
  console.log(lines.join('\n'));
  process.exit(failed ? 1 : 0);
}

/* ---------------- main ---------------- */

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--selftest')) return selftest();
  const P = need(TOOL, HERE);
  const ctx = {
    root: P.root,
    tasksDir: path.join(P.docsAbs || path.join(P.root, 'docs'), 'tasks'),
    stateAbs: P.stateAbs || path.join(P.root, '.agent-state'),
    now: () => Date.now(),
  };
  const { out, ok } = await run(ctx, argv);
  console.log(out.join('\n'));
  process.exit(ok ? 0 : 1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SELF) main();

#!/usr/bin/env node
/* ============================================================
   AGENT-CONFIG — сторож адаптера агентного CLI (opencode).

   Зачем. Харнес — роли, команды, скиллы, правила — живёт в нейтральном
   каталоге (`agentKit.mount` манифеста, с 21.09.2026 — `.agents/`;
   реструктуризация, шаг Ш5). opencode ищет агентов и команды только в своём
   каталоге `.opencode/`, поэтому рядом лежит тонкий адаптер
   (`agentKit.adapter`): конфиг opencode и файлы-указатели на роли и команды
   харнеса. В шапке указателя — то, что понимает только opencode (режим,
   температура, права роли; роль, которая выполняет команду), в теле — путь к
   файлу харнеса. Скиллы opencode v2 находит в `.agents/skills` сам
   (документация установленной версии 2.0.11, проверено 21.09.2026).
   Симлинки вместо указателей не годятся: на Windows без режима разработчика
   git выписывает их текстовыми файлами, и CLI молча остался бы без ролей.

   Конфиг opencode читается из двух мест: корень проекта и папка `.opencode/`.
   Слой `.opencode/` грузится ПОСЛЕ корневого и перекрывает его (проверено на
   1.18.30, 15.09.2026). Решено держать один файл — `opencode.json` в каталоге
   адаптера. Второй конфиг в корне не ломает ничего явно: права просто
   начинают складываться из двух слоёв, и запрет на удаление может оказаться
   снятым в файле, на который никто не смотрит.

   Модель в конфиге репозитория не задаётся: провайдер и имя модели зависят
   от контура (дома — публичный API, на работе — корпоративная копия у другого
   провайдера). Неверная пара «провайдер/модель» в opencode — не откат на
   модель по умолчанию, а ошибка «Model not found», агент не стартует. Модель
   и провайдер пишутся в глобальный конфиг машины (README харнеса, раздел
   «Как подключить модель»).

   Что проверяет (коды КФ — «конфиг»):
     КФ1 в корне репозитория нет opencode.json и opencode.jsonc;
     КФ2 адаптер объявлен в манифесте; конфиг есть ровно один —
         `opencode.json` в каталоге адаптера, читается как JSON; в каталоге
         харнеса конфига нет — opencode его не читает, и правка в нём молча
         не действовала бы;
     КФ3 модели нет нигде: ни в конфиге (model, small_model, provider,
         модель агента или команды — ключи v1 agent/command и v2
         agents/commands), ни в шапках ролей и команд — харнеса и адаптера;
     КФ4 каждый скилл `<харнес>/skills/<id>/SKILL.md` виден модели: в шапке
         есть непустой `description`, а `name`, если задан, совпадает с
         именем папки. opencode v2 (документация установленной версии 2.0.11,
         проверено 21.09.2026) берёт ID скилла из пути, а скилл без
         `description` модели не объявляет: он зарегистрирован, но в список
         доступных не попадает, и агент узнаёт о нём, только прочитав файл
         по пути. Так жил `docs-split` до 21.09.2026 (docs/agent-imp.md, У6).
         `name` в v2 — отображаемое имя; расходящееся с папкой вводит в
         заблуждение, а в v1 скилл грузился именно по нему;
     КФ5 адаптер не расходится с харнесом: у каждой роли (`agents/`) и
         команды (`commands/`) харнеса есть указатель в адаптере и наоборот;
         указатель называет свой файл харнеса; `description` совпадает, у
         команды — и `agent`; указатель команды передаёт все подстановки,
         которые использует сценарий (`$ARGUMENTS`, `$1`…`$9`), — иначе
         аргумент пропадёт молча; тело указателя — не длиннее
         ADAPTER_BODY_MAX непустых строк: содержание роли в адаптер не
         копируется, копия разъедется молча;
     КФ6 каждый путь в `instructions` конфига существует (пути с масками не
         сверяются). opencode не жалуется на пропавший файл правил — правила
         просто перестают попадать в контекст. Так на Ш5 чуть не уехал
         `.opencode/rules/ds-rules.md`: файл переехал в харнес, а конфиг
         адаптера по-прежнему называл старый путь, и КФ1–КФ5 молчали.

   Журнал прогонов (runs/) сторож не пишет — по той же причине, что
   registry-check.mjs: кодов для деления на «живой/исчез» у него нет.

   Использование:
     node agent-config.mjs [--root <корень проекта>]
     node agent-config.mjs --selftest   — откат на временном дереве
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync, mkdtempSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { need } from './project.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/* Каталоги харнеса и адаптера — из манифеста (project.mjs; Ш4, Ш5). В
   селфтесте они задаются явно: временное дерево без манифеста. */
const SELFTEST_KIT = '.agents';
const SELFTEST_ADAPTER = '.opencode';
const SELFTEST_CONFIG = SELFTEST_ADAPTER + '/opencode.json';
const MODEL_KEYS = ['model', 'small_model', 'provider'];
const ADAPTER_BODY_MAX = 6;
const CONFIG_NAMES = ['opencode.json', 'opencode.jsonc'];

/* Шапка markdown-файла: значение ключа в строке ключа или, для блочной формы
   YAML (`description: >`), в следующих строках с отступом. */
function frontmatter(text) {
  const lines = text.split(/\r?\n/);
  const end = lines[0] === '---' ? lines.indexOf('---', 1) : -1;
  const head = end > 0 ? lines.slice(1, end) : [];
  const body = end > 0 ? lines.slice(end + 1).join('\n') : text;
  const field = (k) => {
    const i = head.findIndex((l) => l.startsWith(k + ':'));
    if (i < 0) return null;
    let v = head[i].slice(k.length + 1).trim();
    if (/^[>|][-+]?$/.test(v)) {
      const block = [];
      for (let j = i + 1; j < head.length && /^\s+\S/.test(head[j]); j++) block.push(head[j].trim());
      v = block.join(' ');
    }
    return v.replace(/^["']|["']$/g, '');
  };
  return { body, field };
}

const placeholders = (text) => [...new Set(text.match(/\$(?:ARGUMENTS|[1-9])/g) || [])].sort();

function check(root, kit, adapter) {
  const defects = [];
  const CONFIG = adapter ? adapter + '/opencode.json' : null;

  if (!adapter) {
    defects.push('КФ2 адаптер агентного CLI не объявлен в манифесте (project.json → agentKit.adapter) — конфиг и указатели на роли сверять не с чем');
  }
  for (const name of CONFIG_NAMES) {
    if (existsSync(path.join(root, name))) {
      defects.push('КФ1 ' + name + ' в корне — второй слой конфига' + (CONFIG ? ' поверх ' + CONFIG + '; перенести содержимое в ' + CONFIG + ' и удалить' : ''));
    }
  }
  if (kit !== adapter) {
    for (const name of CONFIG_NAMES) {
      if (existsSync(path.join(root, kit, name))) {
        defects.push('КФ2 ' + kit + '/' + name + ' — конфиг в каталоге харнеса opencode не читает: правка в нём не действует' + (CONFIG ? '; конфиг — ' + CONFIG : ''));
      }
    }
  }
  if (adapter) {
    checkConfig(root, adapter, defects);
    checkAdapter(root, kit, adapter, defects);
  }
  checkSkills(root, kit, defects);
  return { defects };
}

function checkConfig(root, adapter, defects) {
  const CONFIG = adapter + '/opencode.json';
  if (existsSync(path.join(root, adapter, 'opencode.jsonc'))) {
    defects.push('КФ2 ' + adapter + '/opencode.jsonc — конфиг ведётся одним файлом ' + CONFIG);
  }
  const abs = path.join(root, CONFIG);
  if (!existsSync(abs)) {
    defects.push('КФ2 ' + CONFIG + ' не найден — права и instructions не подключены');
    return;
  }
  let cfg;
  try {
    cfg = JSON.parse(readFileSync(abs, 'utf8'));
  } catch (e) {
    defects.push('КФ2 ' + CONFIG + ' не читается как JSON: ' + e.message);
    return;
  }
  for (const k of MODEL_KEYS) {
    if (cfg[k] !== undefined) defects.push('КФ3 ' + CONFIG + ' → ' + k + ' — модель и провайдер задаются в глобальном конфиге машины, не в репозитории');
  }
  for (const key of ['agent', 'agents', 'command', 'commands']) {
    for (const [name, a] of Object.entries(cfg[key] || {})) {
      if (a && a.model !== undefined) defects.push('КФ3 ' + CONFIG + ' → ' + key + '.' + name + '.model — на другом контуре даст «Model not found»');
    }
  }
  // КФ6: пути instructions — от корня проекта (opencode ищет их от папки запуска вверх, README харнеса §2)
  for (const p of Array.isArray(cfg.instructions) ? cfg.instructions : []) {
    if (typeof p !== 'string' || /[*?[{]/.test(p) || /^https?:/.test(p)) continue;
    if (!existsSync(path.join(root, p))) defects.push('КФ6 ' + CONFIG + ' → instructions: «' + p + '» нет на диске — правила молча не попадают в контекст');
  }
}

/* КФ5 и КФ3 для шапок — см. шапку файла. */
function checkAdapter(root, kit, adapter, defects) {
  const mdIn = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).sort() : []);
  for (const [kind, what, whose] of [['agents', 'роль', 'роли'], ['commands', 'команда', 'команды']]) {
    const inKit = mdIn(path.join(root, kit, kind));
    const inAdapter = mdIn(path.join(root, adapter, kind));
    for (const f of inKit) {
      const kRel = kit + '/' + kind + '/' + f;
      const K = frontmatter(readFileSync(path.join(root, kRel), 'utf8'));
      if (K.field('model') !== null) defects.push('КФ3 ' + kRel + ' → model — модель задаётся в глобальном конфиге машины');
      if (!inAdapter.includes(f)) defects.push('КФ5 ' + kRel + ' — ' + what + ' без указателя в адаптере ' + adapter + '/' + kind + '/: агентный CLI её не увидит');
    }
    for (const f of inAdapter) {
      const aRel = adapter + '/' + kind + '/' + f;
      const kRel = kit + '/' + kind + '/' + f;
      const A = frontmatter(readFileSync(path.join(root, aRel), 'utf8'));
      if (A.field('model') !== null) defects.push('КФ3 ' + aRel + ' → model — модель задаётся в глобальном конфиге машины');
      if (!inKit.includes(f)) {
        defects.push('КФ5 ' + aRel + ' — указатель без ' + whose + ' в харнесе: ' + kRel + ' нет (переименован или удалён)');
        continue;
      }
      const K = frontmatter(readFileSync(path.join(root, kRel), 'utf8'));
      if (!A.body.includes(kRel)) defects.push('КФ5 ' + aRel + ' — тело не называет свой файл харнеса ' + kRel);
      const lines = A.body.split(/\r?\n/).filter((l) => l.trim()).length;
      if (lines > ADAPTER_BODY_MAX) defects.push('КФ5 ' + aRel + ' — тело ' + lines + ' непустых строк (предел ' + ADAPTER_BODY_MAX + '): в адаптере только указатель, содержание — в ' + kRel);
      if (A.field('description') !== K.field('description')) defects.push('КФ5 ' + aRel + ' — description расходится с ' + kRel);
      if (kind === 'commands') {
        if (A.field('agent') !== K.field('agent')) defects.push('КФ5 ' + aRel + ' — agent расходится с ' + kRel);
        const passed = placeholders(A.body);
        const lost = placeholders(K.body).filter((p) => !passed.includes(p));
        if (lost.length) defects.push('КФ5 ' + aRel + ' — не передаёт подстановки сценария: ' + lost.join(' '));
      }
    }
  }
}

/* КФ4 — см. шапку. */
function checkSkills(root, kit, defects) {
  const dir = path.join(root, kit, 'skills');
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const file = path.join(dir, e.name, 'SKILL.md');
    if (!existsSync(file)) continue;
    const rel = kit + '/skills/' + e.name + '/SKILL.md';
    const { field } = frontmatter(readFileSync(file, 'utf8'));
    const desc = field('description');
    const name = field('name');
    if (!desc) defects.push('КФ4 ' + rel + ' — в шапке нет description: скилл зарегистрирован, но модели не объявлен и грузится только чтением файла по пути');
    if (name !== null && name !== e.name) defects.push('КФ4 ' + rel + ' — name «' + name + '» не совпадает с папкой «' + e.name + '»: ID скилла берётся из пути');
  }
}

function report({ defects }) {
  const out = ['== agent-config =='];
  for (const d of defects) out.push('FAIL  ' + d);
  out.push('ВЕРДИКТ: ' + (defects.length ? 'FAIL (дефектов: ' + defects.length + ')' : 'OK'));
  return out.join('\n');
}

/* ---------------- selftest: откат на временном дереве ---------------- */

function put(root, rel, text) {
  const p = path.join(root, rel);
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, text, 'utf8');
}

const CLEAN = {
  $schema: 'https://opencode.ai/config.json',
  instructions: [SELFTEST_KIT + '/rules/process.md'],
  permission: { bash: { '*': 'allow', 'rm *': 'deny' } },
  agent: { build: { temperature: 0.2 } },
};
const cfgJson = (patch) => JSON.stringify({ ...CLEAN, ...patch }, null, 2);

// в каждом дереве селфтеста — исправные скилл, роль и команда: чистый случай проходит через КФ4 и КФ5, а не мимо
const GOOD_SKILL = '---\nname: good\ndescription: Исправный скилл для селфтеста.\n---\n\n# Исправный скилл\n';
const ROLE = '---\ndescription: Роль для селфтеста.\n---\n\nТы — роль для селфтеста.\n';
const roleAdapter = (patch = {}) => '---\ndescription: ' + (patch.description || 'Роль для селфтеста.') + '\nmode: subagent\n'
  + (patch.head || '') + '---\n\n' + (patch.body || 'Роль целиком — `' + SELFTEST_KIT + '/agents/role.md`: прочитай и работай по нему.\n');
const COMMAND = '---\ndescription: Команда для селфтеста.\nagent: role\n---\n\nЭкран: $1\nТЗ: $2\n';
const commandAdapter = (patch = {}) => '---\ndescription: Команда для селфтеста.\nagent: ' + (patch.agent || 'role') + '\n---\n\n'
  + 'Сценарий — `' + SELFTEST_KIT + '/commands/run.md`: прочитай и выполни.\n\n' + (patch.args || 'Аргумент 1: $1\nАргумент 2: $2\n');

const CASES = [
  { name: 'чистое дерево', expect: null },
  { name: 'конфиг в корне', expect: 'КФ1 opencode.json',
    mutate: (r) => put(r, 'opencode.json', cfgJson({})) },
  { name: 'jsonc в корне', expect: 'КФ1 opencode.jsonc',
    mutate: (r) => put(r, 'opencode.jsonc', '{}') },
  { name: 'конфига нет', expect: 'не найден',
    mutate: (r) => rmSync(path.join(r, SELFTEST_CONFIG)) },
  { name: 'jsonc рядом в адаптере', expect: 'КФ2 .opencode/opencode.jsonc',
    mutate: (r) => put(r, SELFTEST_ADAPTER + '/opencode.jsonc', '{}') },
  { name: 'конфиг в каталоге харнеса', expect: 'КФ2 .agents/opencode.json — конфиг в каталоге харнеса opencode не читает',
    mutate: (r) => put(r, SELFTEST_KIT + '/opencode.json', cfgJson({})) },
  { name: 'адаптер не объявлен в манифесте', expect: 'КФ2 адаптер агентного CLI не объявлен', adapter: null },
  { name: 'битый JSON', expect: 'не читается как JSON',
    mutate: (r) => put(r, SELFTEST_CONFIG, '{ "permission": ') },
  { name: 'модель агента', expect: 'agent.plan.model',
    mutate: (r) => put(r, SELFTEST_CONFIG, cfgJson({ agent: { plan: { model: 'deepseek/deepseek-v4-flash' } } })) },
  { name: 'модель агента в ключе v2', expect: 'agents.plan.model',
    mutate: (r) => put(r, SELFTEST_CONFIG, cfgJson({ agents: { plan: { model: 'deepseek/deepseek-v4-flash' } } })) },
  { name: 'instructions на пропавший файл', expect: 'КФ6 .opencode/opencode.json → instructions: «.opencode/rules/ds-rules.md» нет на диске',
    mutate: (r) => put(r, SELFTEST_CONFIG, cfgJson({ instructions: ['.opencode/rules/ds-rules.md'] })) },
  { name: 'instructions с маской не сверяется', expect: null,
    mutate: (r) => put(r, SELFTEST_CONFIG, cfgJson({ instructions: [SELFTEST_KIT + '/rules/*.md'] })) },
  { name: 'модель по умолчанию', expect: '→ model',
    mutate: (r) => put(r, SELFTEST_CONFIG, cfgJson({ model: 'corp-gateway/deepseek-v4-flash' })) },
  { name: 'провайдер', expect: '→ provider',
    mutate: (r) => put(r, SELFTEST_CONFIG, cfgJson({ provider: { 'corp-gateway': {} } })) },
  { name: 'модель в шапке указателя', expect: 'КФ3 .opencode/agents/role.md → model',
    mutate: (r) => put(r, SELFTEST_ADAPTER + '/agents/role.md', roleAdapter({ head: 'model: corp-gateway/deepseek-v4-flash\n' })) },
  { name: 'скилл без description', expect: 'КФ4 .agents/skills/bare/SKILL.md — в шапке нет description',
    mutate: (r) => put(r, SELFTEST_KIT + '/skills/bare/SKILL.md', '---\nbelongs_to: bare\npurpose: скилл без описания\n---\n\n# Голый скилл\n') },
  { name: 'name скилла не совпадает с папкой', expect: 'name «other» не совпадает с папкой «named»',
    mutate: (r) => put(r, SELFTEST_KIT + '/skills/named/SKILL.md', '---\nname: other\ndescription: Описание есть.\n---\n\n# Скилл\n') },
  { name: 'description блочной формой YAML', expect: null,
    mutate: (r) => put(r, SELFTEST_KIT + '/skills/folded/SKILL.md', '---\nname: folded\ndescription: >\n  Описание в две\n  строки.\n---\n\n# Скилл\n') },
  { name: 'роль без указателя в адаптере', expect: 'КФ5 .agents/agents/extra.md — роль без указателя',
    mutate: (r) => put(r, SELFTEST_KIT + '/agents/extra.md', ROLE) },
  { name: 'указатель на удалённую роль', expect: 'КФ5 .opencode/agents/role.md — указатель без роли в харнесе',
    mutate: (r) => rmSync(path.join(r, SELFTEST_KIT, 'agents', 'role.md')) },
  { name: 'указатель не называет файл роли', expect: 'тело не называет свой файл харнеса .agents/agents/role.md',
    mutate: (r) => put(r, SELFTEST_ADAPTER + '/agents/role.md', roleAdapter({ body: 'Прочитай свою роль в харнесе.\n' })) },
  { name: 'содержание роли скопировано в адаптер', expect: 'непустых строк (предел ' + ADAPTER_BODY_MAX + ')',
    mutate: (r) => put(r, SELFTEST_ADAPTER + '/agents/role.md', roleAdapter({ body: 'Роль — `' + SELFTEST_KIT + '/agents/role.md`.\n' + 'Правило роли.\n'.repeat(12) })) },
  { name: 'description роли разошёлся', expect: 'КФ5 .opencode/agents/role.md — description расходится',
    mutate: (r) => put(r, SELFTEST_ADAPTER + '/agents/role.md', roleAdapter({ description: 'Старое описание роли.' })) },
  { name: 'команда без указателя', expect: 'КФ5 .agents/commands/more.md — команда без указателя',
    mutate: (r) => put(r, SELFTEST_KIT + '/commands/more.md', COMMAND) },
  { name: 'указатель команды теряет аргумент', expect: 'не передаёт подстановки сценария: $2',
    mutate: (r) => put(r, SELFTEST_ADAPTER + '/commands/run.md', commandAdapter({ args: 'Аргумент 1: $1\n' })) },
  { name: 'agent команды разошёлся', expect: 'КФ5 .opencode/commands/run.md — agent расходится',
    mutate: (r) => put(r, SELFTEST_ADAPTER + '/commands/run.md', commandAdapter({ agent: 'other' })) },
];

function selftest() {
  const out = ['== agent-config --selftest =='];
  let failed = 0;
  for (const c of CASES) {
    const root = mkdtempSync(path.join(os.tmpdir(), 'agent-config-'));
    try {
      put(root, SELFTEST_CONFIG, cfgJson({}));
      put(root, SELFTEST_KIT + '/rules/process.md', '# Правила процесса\n');
      put(root, SELFTEST_KIT + '/skills/good/SKILL.md', GOOD_SKILL);
      put(root, SELFTEST_KIT + '/agents/role.md', ROLE);
      put(root, SELFTEST_ADAPTER + '/agents/role.md', roleAdapter());
      put(root, SELFTEST_KIT + '/commands/run.md', COMMAND);
      put(root, SELFTEST_ADAPTER + '/commands/run.md', commandAdapter());
      if (c.mutate) c.mutate(root);
      const { defects } = check(root, SELFTEST_KIT, c.adapter === undefined ? SELFTEST_ADAPTER : c.adapter);
      const pass = c.expect === null
        ? defects.length === 0
        : defects.length > 0 && defects.some((d) => d.includes(c.expect));
      if (!pass) failed++;
      // префикс FAIL — его показывает гейт (фильтр FINDING в lessons-cli.mjs)
      out.push((pass ? 'ok    ' : 'FAIL  ') + c.name + ' — ' + (defects.length ? defects.join(' | ') : 'дефектов нет'));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
  out.push('ВЕРДИКТ: ' + (failed ? 'FAIL (кейсов не прошло: ' + failed + ' из ' + CASES.length + ')' : 'OK (кейсов: ' + CASES.length + ')'));
  console.log(out.join('\n'));
  process.exit(failed ? 1 : 0);
}

/* ---------------- main ---------------- */

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();
  const rIdx = args.indexOf('--root');
  const P = need('agent-config', rIdx >= 0 ? path.resolve(args[rIdx + 1]) : HERE);
  const res = check(P.root, P.kit, P.adapter);
  console.log(report(res));
  process.exit(res.defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

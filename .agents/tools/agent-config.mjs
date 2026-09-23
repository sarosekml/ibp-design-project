#!/usr/bin/env node
/* ============================================================
   AGENT-CONFIG — сторож адаптера агентного CLI (opencode).

   Зачем. Харнес — роли, команды, скиллы, правила — живёт в нейтральном
   каталоге (`agentKit.mount` манифеста, с 21.09.2026 — `.agents/`;
   реструктуризация, шаг Ш5). Адаптер под конкретный CLI (`agentKit.adapter`,
   `.opencode/`) — **один файл `opencode.json`** (решение владельца
   22.09.2026): в нём пути до харнеса и то, что понимает только opencode —
   режим и права роли, роль-исполнитель команды, каталог скиллов. Ни ролей,
   ни команд, ни скиллов копиями в адаптере нет: запись конфига называет файл
   харнеса, а агент читает его целиком первым действием.

   Почему указателем, а не текстом роли в конфиге: копия разъедется с
   оригиналом молча. Почему не путём в поле `system`: подстановки файла в
   значения конфига в документации установленной версии (2.0.11, проверено
   22.09.2026) нет. Симлинки тоже не годятся — на Windows без режима
   разработчика git выписывает их текстовыми файлами.

   Честная граница: массив `instructions` v2 принимает схемой, но **не
   загружает** (документация v2, «Instructions → Configuration»): активные
   правила в v2 берёт из `AGENTS.md`. Поэтому правила процесса и ДС
   подключены двумя путями сразу — `instructions` (их читает v1) и указатели
   корневого `AGENTS.md` плюс `system` каждой роли (их исполняет агент).

   Конфиг opencode читается из двух мест: корень проекта и каталог адаптера.
   Слой адаптера грузится ПОСЛЕ корневого и перекрывает его (проверено на
   1.18.30, 15.09.2026). Второй конфиг в корне не ломает ничего явно: права
   просто начинают складываться из двух слоёв, и запрет может оказаться
   снятым в файле, на который никто не смотрит.

   Модель в конфиге репозитория не задаётся: провайдер и имя модели зависят
   от контура (дома — публичный API, на работе — корпоративная копия у другого
   провайдера). Неверная пара «провайдер/модель» — не откат на модель по
   умолчанию, а ошибка «Model not found», агент не стартует. Модель и
   провайдер пишутся в глобальный конфиг машины (README харнеса).

   Что проверяет (коды КФ — «конфиг»):
     КФ1 в корне репозитория нет opencode.json и opencode.jsonc;
     КФ2 адаптер объявлен в манифесте; конфиг есть ровно один —
         `opencode.json` в каталоге адаптера, читается как JSON; в каталоге
         харнеса конфига нет (opencode его не читает); в самом адаптере нет
         ничего, кроме конфига и служебных файлов самого CLI: роли, команды и
         скиллы живут в харнесе;
     КФ3 модели нет нигде: ни в конфиге (model, small_model, provider, модель
         агента или команды в ключах v1 `agent`/`command` и v2
         `agents`/`commands`), ни в шапках ролей и команд харнеса;
     КФ4 каждый скилл `<харнес>/skills/<id>/SKILL.md` виден модели: в шапке
         есть непустой `description`, а `name`, если задан, совпадает с
         именем папки. opencode v2 берёт ID скилла из пути, а скилл без
         `description` модели не объявляет: он зарегистрирован, но в список
         доступных не попадает (docs/agent-imp.md, У6);
     КФ5 конфиг не расходится с харнесом: у каждой роли (`agents/`) и команды
         (`commands/`) харнеса есть запись в конфиге и наоборот; текст записи
         называет свой файл харнеса и остаётся указателем (не длиннее
         ENTRY_MAX символов — содержание не копируется); `description`
         совпадает, у команды — и роль-исполнитель `agent`; шаблон команды
         передаёт все подстановки, которые использует сценарий (`$ARGUMENTS`,
         `$1`…`$9`), иначе аргумент пропадёт молча;
     КФ6 пути, объявленные конфигом, существуют: `instructions` и `skills`
         (маски и URL не сверяются). Пропавший файл правил opencode не
         сообщает — правила просто перестают попадать в контекст (урок Л126);
     КФ7 приложение трека, который агент правит только с подтверждением
         (`agentEdit: ask | deny` у трека манифеста; трек приложения — в его
         `app.json`), закрыто у каждой роли: итоговое право на правку пробного
         экрана `<apps>/<id>/pages/…` — не `allow`. Право считается, как его
         считает opencode: общие правила конфига, затем правила роли,
         побеждает последнее совпавшее (документация v1 и v2), без правил —
         разрешено. С Ш7 проекты и концепты лежат в одном `apps/`, и граница
         «в продукт агент не пишет» держится строкой-исключением после общего
         разрешения; забытая строка открыла бы продукт молча.

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
import { need, findApps } from './project.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/* Каталоги харнеса и адаптера — из манифеста (project.mjs; Ш4, Ш5). В
   селфтесте они задаются явно: временное дерево без манифеста. */
const SELFTEST_KIT = '.agents';
const SELFTEST_ADAPTER = '.opencode';
const CONFIG_NAME = 'opencode.json';
const SELFTEST_CONFIG = SELFTEST_ADAPTER + '/' + CONFIG_NAME;
const MODEL_KEYS = ['model', 'small_model', 'provider'];
const CONFIG_NAMES = [CONFIG_NAME, 'opencode.jsonc'];
const ENTRY_MAX = 600;                      // запись конфига — указатель, а не копия роли
/* Служебные файлы самого CLI: он создаёт их в своём каталоге сам. */
const ADAPTER_OWN = new Set([CONFIG_NAME, '.gitignore', '.DS_Store', 'package.json', 'package-lock.json', 'bun.lock', 'bun.lockb', 'node_modules']);

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
  return { head, body, field };
}

const placeholders = (text) => [...new Set(text.match(/\$(?:ARGUMENTS|[1-9])/g) || [])].sort();
/** Записи конфига в форме v2 (agents/commands) и v1 (agent/command). */
const entriesOf = (cfg, v2, v1) => ({ ...(cfg[v1] || {}), ...(cfg[v2] || {}) });
/** Текст записи: v2 — system у роли, template у команды; v1 — prompt. */
const entryText = (e) => [e.system, e.prompt, e.template].filter((x) => typeof x === 'string').join('\n');

/* Правила правки из конфига: форма v1 (`permission.edit` — строка или карта)
   и v2 (`permissions` — список action/resource/effect). */
function editRules(src) {
  const rules = [];
  const e = src && src.permission && src.permission.edit;
  if (typeof e === 'string') rules.push(['*', e]);
  else if (e && typeof e === 'object') for (const [k, v] of Object.entries(e)) rules.push([k, v]);
  for (const r of Array.isArray(src && src.permissions) ? src.permissions : []) {
    if (r && (r.action === 'edit' || r.action === '*')) rules.push([r.resource || '*', r.effect]);
  }
  return rules;
}

const globRx = (g) => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
/** Итоговое право на путь: побеждает последнее совпавшее правило, без правил — allow. */
function effectFor(rules, p) {
  let eff = 'allow';
  for (const [pat, ef] of rules) if (globRx(pat).test(p)) eff = ef;
  return eff;
}

export function check(root, kit, adapter, apps = null) {
  const defects = [];
  const CONFIG = adapter ? adapter + '/' + CONFIG_NAME : null;

  if (!adapter) {
    defects.push('КФ2 адаптер агентного CLI не объявлен в манифесте (project.json → agentKit.adapter) — конфиг и его записи сверять не с чем');
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
  let cfg = null;
  if (adapter) {
    cfg = readConfig(root, adapter, defects);
    checkAdapterDir(root, adapter, defects);
    if (cfg) {
      checkModel(CONFIG, cfg, defects);
      checkEntries(root, kit, adapter, cfg, defects);
      checkPaths(root, CONFIG, cfg, defects);
      if (apps && apps.guarded.length) checkGuardedApps(adapter, cfg, apps, defects);
    }
  }
  checkSkills(root, kit, defects);
  return { defects };
}

function readConfig(root, adapter, defects) {
  const CONFIG = adapter + '/' + CONFIG_NAME;
  if (existsSync(path.join(root, adapter, 'opencode.jsonc'))) {
    defects.push('КФ2 ' + adapter + '/opencode.jsonc — конфиг ведётся одним файлом ' + CONFIG);
  }
  const abs = path.join(root, CONFIG);
  if (!existsSync(abs)) { defects.push('КФ2 ' + CONFIG + ' не найден — права, пути и записи ролей не подключены'); return null; }
  try {
    return JSON.parse(readFileSync(abs, 'utf8'));
  } catch (e) {
    defects.push('КФ2 ' + CONFIG + ' не читается как JSON: ' + e.message);
    return null;
  }
}

/* КФ2 — в адаптере только конфиг: роли, команды и скиллы живут в харнесе. */
function checkAdapterDir(root, adapter, defects) {
  const dir = path.join(root, adapter);
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir)) {
    if (ADAPTER_OWN.has(e)) continue;
    defects.push('КФ2 ' + adapter + '/' + e + ' — в адаптере только ' + CONFIG_NAME + ': роли, команды и скиллы живут в харнесе, конфиг называет их путями');
  }
}

/* КФ3 — модели нет ни в конфиге, ни в шапках харнеса. */
function checkModel(CONFIG, cfg, defects) {
  for (const k of MODEL_KEYS) {
    if (cfg[k] !== undefined) defects.push('КФ3 ' + CONFIG + ' → ' + k + ' — модель и провайдер задаются в глобальном конфиге машины, не в репозитории');
  }
  for (const key of ['agent', 'agents', 'command', 'commands']) {
    for (const [name, e] of Object.entries(cfg[key] || {})) {
      if (e && e.model !== undefined) defects.push('КФ3 ' + CONFIG + ' → ' + key + '.' + name + '.model — на другом контуре даст «Model not found»');
    }
  }
}

/* КФ5 — записи конфига против файлов харнеса. */
function checkEntries(root, kit, adapter, cfg, defects) {
  const CONFIG = adapter + '/' + CONFIG_NAME;
  const mdIn = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.md')).sort() : []);
  const kinds = [
    { dir: 'agents', what: 'роль', whose: 'роли', entries: entriesOf(cfg, 'agents', 'agent'), key: 'agents' },
    { dir: 'commands', what: 'команда', whose: 'команды', entries: entriesOf(cfg, 'commands', 'command'), key: 'commands' },
  ];
  for (const k of kinds) {
    const files = mdIn(path.join(root, kit, k.dir));
    const names = new Set(files.map((f) => f.replace(/\.md$/, '')));
    for (const f of files) {
      const name = f.replace(/\.md$/, '');
      const kRel = kit + '/' + k.dir + '/' + f;
      const K = frontmatter(readFileSync(path.join(root, kRel), 'utf8'));
      if (K.field('model') !== null) defects.push('КФ3 ' + kRel + ' → model — модель задаётся в глобальном конфиге машины');
      const e = k.entries[name];
      if (!e) { defects.push('КФ5 ' + kRel + ' — ' + k.what + ' без записи в ' + CONFIG + ' → ' + k.key + '.' + name + ': агентный CLI её не увидит'); continue; }
      const text = entryText(e);
      if (!text.trim()) defects.push('КФ5 ' + CONFIG + ' → ' + k.key + '.' + name + ' — нет текста записи (' + (k.dir === 'agents' ? 'system' : 'template') + ') с путём к ' + kRel);
      else {
        if (!text.includes(kRel)) defects.push('КФ5 ' + CONFIG + ' → ' + k.key + '.' + name + ' — текст записи не называет свой файл харнеса ' + kRel);
        if (text.length > ENTRY_MAX) defects.push('КФ5 ' + CONFIG + ' → ' + k.key + '.' + name + ' — текст записи ' + text.length + ' символов (предел ' + ENTRY_MAX + '): в конфиге указатель, содержание — в ' + kRel);
      }
      if ((e.description || null) !== K.field('description')) defects.push('КФ5 ' + CONFIG + ' → ' + k.key + '.' + name + '.description расходится с ' + kRel);
      if (k.dir === 'commands') {
        if ((e.agent || null) !== K.field('agent')) defects.push('КФ5 ' + CONFIG + ' → commands.' + name + '.agent расходится с ' + kRel);
        const passed = placeholders(text);
        const lost = placeholders(K.body).filter((p) => !passed.includes(p));
        if (lost.length) defects.push('КФ5 ' + CONFIG + ' → commands.' + name + ' — не передаёт подстановки сценария: ' + lost.join(' '));
      }
    }
    for (const name of Object.keys(k.entries)) {
      if (!names.has(name)) defects.push('КФ5 ' + CONFIG + ' → ' + k.key + '.' + name + ' — запись без ' + k.whose + ' в харнесе: ' + kit + '/' + k.dir + '/' + name + '.md нет (переименован или удалён)');
    }
  }
}

/* КФ6 — объявленные конфигом пути существуют. */
function checkPaths(root, CONFIG, cfg, defects) {
  const list = (v) => (Array.isArray(v) ? v : []);
  for (const [key, vals] of [['instructions', list(cfg.instructions)], ['skills', list(cfg.skills)]]) {
    for (const p of vals) {
      if (typeof p !== 'string' || /[*?[{]/.test(p) || /^https?:/.test(p) || p.startsWith('~')) continue;
      if (!existsSync(path.join(root, p))) defects.push('КФ6 ' + CONFIG + ' → ' + key + ': «' + p + '» нет на диске — подключение молча не работает');
    }
  }
}

/* КФ7 — см. шапку. apps: { dir, guarded: [{ id, track, agentEdit }] }. */
function checkGuardedApps(adapter, cfg, apps, defects) {
  const CONFIG = adapter + '/' + CONFIG_NAME;
  const global = editRules(cfg);
  const roles = entriesOf(cfg, 'agents', 'agent');
  for (const [name, e] of Object.entries(roles)) {
    const rules = [...global, ...editRules(e)];
    for (const app of apps.guarded) {
      const probe = apps.dir + '/' + app.id + '/pages/Probe.html';
      if (effectFor(rules, probe) !== 'allow') continue;
      defects.push('КФ7 ' + CONFIG + ' → agents.' + name + ' — роль правит ' + apps.dir + '/' + app.id + '/ (трек ' + app.track + ', agentEdit: ' + app.agentEdit
        + ') без подтверждения: после общего разрешения нужно правило edit «' + apps.dir + '/' + app.id + '/**» с эффектом ' + app.agentEdit);
    }
  }
}

/* Приложения, чей трек агент правит только с подтверждением. null — формы
   apps/ в манифесте нет. Форму записей приложений сторожит registry-check. */
function guardedApps(P) {
  if (!P.appsDir) return null;
  const tracks = new Map(P.tracks.map((t) => [t.id, t]));
  const guarded = [];
  /* Приложение — на любой глубине apps/ (разделы core/, postrade/drafts/ …):
     id здесь — путь каталога от apps/, по нему строится правило edit. */
  for (const d of findApps(P.root, P.appsDir, P.appsManifest)) {
    let app;
    try { app = JSON.parse(readFileSync(path.join(d.abs, P.appsManifest), 'utf8')); } catch { continue; }
    const t = tracks.get(app.track);
    if (t && t.agentEdit && t.agentEdit !== 'allow') guarded.push({ id: d.dir, track: t.id, agentEdit: t.agentEdit });
  }
  return { dir: P.appsDir, guarded };
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

const ROLE = '---\ndescription: Роль для селфтеста.\n---\n\nТы — роль для селфтеста.\n';
const COMMAND = '---\ndescription: Команда для селфтеста.\nagent: role\n---\n\nЭкран: $1\nТЗ: $2\n';
const ROLE_PTR = 'Роль целиком — файл ' + SELFTEST_KIT + '/agents/role.md: прочитай и работай по нему.';
const CMD_PTR = 'Сценарий — файл ' + SELFTEST_KIT + '/commands/run.md: прочитай и выполни. Аргумент 1: $1. Аргумент 2: $2';
const GOOD_SKILL = '---\nname: good\ndescription: Исправный скилл для селфтеста.\n---\n\n# Исправный скилл\n';

const CLEAN = {
  $schema: 'https://opencode.ai/config.json',
  instructions: [SELFTEST_KIT + '/rules/process.md'],
  skills: [SELFTEST_KIT + '/skills'],
  permissions: [{ action: 'edit', resource: '*', effect: 'allow' }],
  agents: { role: { description: 'Роль для селфтеста.', mode: 'subagent', system: ROLE_PTR } },
  commands: { run: { description: 'Команда для селфтеста.', agent: 'role', template: CMD_PTR } },
};
const cfgJson = (patch) => JSON.stringify({ ...CLEAN, ...patch }, null, 2);
const withAgent = (patch) => cfgJson({ agents: { role: { ...CLEAN.agents.role, ...patch } } });
const withCommand = (patch) => cfgJson({ commands: { run: { ...CLEAN.commands.run, ...patch } } });

/* КФ7: приложение трека «только с подтверждением». */
const GUARDED = { dir: 'apps', guarded: [{ id: 'prod', track: 'product', agentEdit: 'ask' }] };
const perms = (...rules) => rules.map(([resource, effect]) => ({ action: 'edit', resource, effect }));

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
  { name: 'конфиг в каталоге харнеса', expect: 'КФ2 .agents/opencode.json — конфиг в каталоге харнеса',
    mutate: (r) => put(r, SELFTEST_KIT + '/opencode.json', cfgJson({})) },
  { name: 'в адаптере завелись роли', expect: 'КФ2 .opencode/agents — в адаптере только opencode.json',
    mutate: (r) => put(r, SELFTEST_ADAPTER + '/agents/role.md', ROLE) },
  { name: 'служебные файлы CLI в адаптере не мешают', expect: null,
    mutate: (r) => { put(r, SELFTEST_ADAPTER + '/package.json', '{}'); put(r, SELFTEST_ADAPTER + '/node_modules/plugin/index.js', '//'); } },
  { name: 'адаптер не объявлен в манифесте', expect: 'КФ2 адаптер агентного CLI не объявлен', adapter: null },
  { name: 'битый JSON', expect: 'не читается как JSON',
    mutate: (r) => put(r, SELFTEST_CONFIG, '{ "permissions": ') },
  { name: 'модель по умолчанию', expect: '→ model',
    mutate: (r) => put(r, SELFTEST_CONFIG, cfgJson({ model: 'corp-gateway/deepseek-v4-flash' })) },
  { name: 'провайдер', expect: '→ provider',
    mutate: (r) => put(r, SELFTEST_CONFIG, cfgJson({ provider: { 'corp-gateway': {} } })) },
  { name: 'модель роли', expect: 'agents.role.model',
    mutate: (r) => put(r, SELFTEST_CONFIG, withAgent({ model: 'corp-gateway/deepseek-v4-flash' })) },
  { name: 'модель в шапке роли харнеса', expect: 'КФ3 .agents/agents/role.md → model',
    mutate: (r) => put(r, SELFTEST_KIT + '/agents/role.md', '---\ndescription: Роль для селфтеста.\nmodel: corp/deepseek\n---\n\nТы — роль.\n') },
  { name: 'скилл без description', expect: 'КФ4 .agents/skills/bare/SKILL.md — в шапке нет description',
    mutate: (r) => put(r, SELFTEST_KIT + '/skills/bare/SKILL.md', '---\nbelongs_to: bare\npurpose: скилл без описания\n---\n\n# Голый скилл\n') },
  { name: 'name скилла не совпадает с папкой', expect: 'name «other» не совпадает с папкой «named»',
    mutate: (r) => put(r, SELFTEST_KIT + '/skills/named/SKILL.md', '---\nname: other\ndescription: Описание есть.\n---\n\n# Скилл\n') },
  { name: 'роль без записи в конфиге', expect: 'КФ5 .agents/agents/extra.md — роль без записи',
    mutate: (r) => put(r, SELFTEST_KIT + '/agents/extra.md', ROLE) },
  { name: 'запись без роли в харнесе', expect: 'agents.role — запись без роли в харнесе',
    mutate: (r) => rmSync(path.join(r, SELFTEST_KIT, 'agents', 'role.md')) },
  { name: 'запись не называет файл роли', expect: 'не называет свой файл харнеса .agents/agents/role.md',
    mutate: (r) => put(r, SELFTEST_CONFIG, withAgent({ system: 'Прочитай свою роль в харнесе.' })) },
  { name: 'содержание роли скопировано в конфиг', expect: 'символов (предел ' + ENTRY_MAX + ')',
    mutate: (r) => put(r, SELFTEST_CONFIG, withAgent({ system: ROLE_PTR + ' ' + 'Правило роли. '.repeat(60) })) },
  { name: 'description роли разошёлся', expect: 'agents.role.description расходится',
    mutate: (r) => put(r, SELFTEST_CONFIG, withAgent({ description: 'Старое описание роли.' })) },
  { name: 'у роли нет текста записи', expect: 'нет текста записи (system)',
    mutate: (r) => put(r, SELFTEST_CONFIG, cfgJson({ agents: { role: { description: 'Роль для селфтеста.', mode: 'subagent' } } })) },
  { name: 'команда без записи в конфиге', expect: 'КФ5 .agents/commands/more.md — команда без записи',
    mutate: (r) => put(r, SELFTEST_KIT + '/commands/more.md', COMMAND) },
  { name: 'шаблон команды теряет аргумент', expect: 'не передаёт подстановки сценария: $2',
    mutate: (r) => put(r, SELFTEST_CONFIG, withCommand({ template: 'Сценарий — файл ' + SELFTEST_KIT + '/commands/run.md. Аргумент 1: $1' })) },
  { name: 'роль-исполнитель команды разошлась', expect: 'commands.run.agent расходится',
    mutate: (r) => put(r, SELFTEST_CONFIG, withCommand({ agent: 'other' })) },
  { name: 'записи в форме v1 (agent/command) тоже сверяются', expect: null,
    mutate: (r) => put(r, SELFTEST_CONFIG, JSON.stringify({
      ...CLEAN, agents: undefined, commands: undefined,
      agent: { role: { description: 'Роль для селфтеста.', mode: 'subagent', prompt: ROLE_PTR } },
      command: { run: { description: 'Команда для селфтеста.', agent: 'role', template: CMD_PTR } },
    }, null, 2)) },
  { name: 'instructions на пропавший файл', expect: 'КФ6 .opencode/opencode.json → instructions: «.agents/rules/gone.md»',
    mutate: (r) => put(r, SELFTEST_CONFIG, cfgJson({ instructions: [SELFTEST_KIT + '/rules/gone.md'] })) },
  { name: 'каталог скиллов не по пути', expect: 'КФ6 .opencode/opencode.json → skills: «.agents/skillz»',
    mutate: (r) => put(r, SELFTEST_CONFIG, cfgJson({ skills: [SELFTEST_KIT + '/skillz'] })) },
  { name: 'маска в instructions не сверяется', expect: null,
    mutate: (r) => put(r, SELFTEST_CONFIG, cfgJson({ instructions: [SELFTEST_KIT + '/rules/*.md'] })) },
  { name: 'продуктовое приложение закрыто после разрешения', expect: null, apps: GUARDED,
    mutate: (r) => put(r, SELFTEST_CONFIG, withAgent({ permissions: perms(['*', 'ask'], ['apps/**', 'allow'], ['apps/prod/**', 'ask']) })) },
  { name: 'продуктовое приложение открыто роли', expect: 'КФ7 .opencode/opencode.json → agents.role — роль правит apps/prod/', apps: GUARDED,
    mutate: (r) => put(r, SELFTEST_CONFIG, withAgent({ permissions: perms(['*', 'ask'], ['apps/**', 'allow']) })) },
  { name: 'исключение записано до разрешения', expect: 'КФ7', apps: GUARDED,
    mutate: (r) => put(r, SELFTEST_CONFIG, withAgent({ permissions: perms(['apps/prod/**', 'ask'], ['apps/**', 'allow']) })) },
  { name: 'роль без своих прав наследует общее разрешение', expect: 'КФ7', apps: GUARDED },
  { name: 'правка запрещена роли целиком', expect: null, apps: GUARDED,
    mutate: (r) => put(r, SELFTEST_CONFIG, withAgent({ permissions: perms(['*', 'deny']) })) },
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
      put(root, SELFTEST_KIT + '/commands/run.md', COMMAND);
      if (c.mutate) c.mutate(root);
      const { defects } = check(root, SELFTEST_KIT, c.adapter === undefined ? SELFTEST_ADAPTER : c.adapter, c.apps || null);
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
  const res = check(P.root, P.kit, P.adapter, guardedApps(P));
  console.log(report(res));
  process.exit(res.defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

#!/usr/bin/env node
/* ============================================================
   AGENT-CONFIG — сторож конфигурации агентного CLI (opencode).

   Зачем. Конфиг opencode читается из двух мест: корень проекта и папка
   `.opencode/`. Слой `.opencode/` грузится ПОСЛЕ корневого и перекрывает его
   (проверено на 1.18.30, 15.09.2026). Решено держать один файл —
   `.opencode/opencode.json`. Второй конфиг в корне не ломает ничего явно:
   права просто начинают складываться из двух слоёв, и запрет на удаление
   может оказаться снятым в файле, на который никто не смотрит.

   Модель в конфиге репозитория не задаётся: провайдер и имя модели зависят
   от контура (дома — публичный API, на работе — корпоративная копия у другого
   провайдера). Неверная пара «провайдер/модель» в opencode — не откат на
   модель по умолчанию, а ошибка «Model not found», агент не стартует. Модель
   и провайдер пишутся в глобальный конфиг машины (.opencode/README.md,
   раздел «Как подключить модель»).

   Что проверяет (коды КФ — «конфиг»):
     КФ1 в корне репозитория нет opencode.json и opencode.jsonc;
     КФ2 конфиг есть ровно один — .opencode/opencode.json, читается как JSON;
     КФ3 в нём нет ключей модели: model, small_model, provider,
         agent.<имя>.model;
     КФ4 каждый скилл `.opencode/skills/<id>/SKILL.md` виден модели: в шапке
         есть непустой `description`, а `name`, если задан, совпадает с
         именем папки. opencode v2 (документация установленной версии 2.0.11,
         проверено 21.09.2026) берёт ID скилла из пути, а скилл без
         `description` модели не объявляет: он зарегистрирован, но в список
         доступных не попадает, и агент узнаёт о нём, только прочитав файл
         по пути. Так жил `docs-split` до 21.09.2026 (docs/agent-imp.md, У6).
         `name` в v2 — отображаемое имя; расходящееся с папкой вводит в
         заблуждение, а в v1 скилл грузился именно по нему.

   Честная граница: frontmatter агентов (.opencode/agents) на ключ model
   не проверяется — там его сейчас нет, и заводить вход без случая незачем.

   Журнал прогонов (runs/) сторож не пишет — по той же причине, что
   registry-check.mjs: кодов для деления на «живой/исчез» у него нет.

   Использование:
     node agent-config.mjs [--root <корень репозитория>]
     node agent-config.mjs --selftest   — откат на временном дереве
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync, mkdtempSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { need } from './project.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/* Каталог конфига и скиллов — каталог харнеса из манифеста (project.mjs;
   реструктуризация, Ш4). В селфтесте он задаётся явно: временное дерево без
   манифеста. */
const SELFTEST_KIT = '.opencode';
const SELFTEST_CONFIG = SELFTEST_KIT + '/opencode.json';
const MODEL_KEYS = ['model', 'small_model', 'provider'];

function check(root, kit) {
  const defects = [];
  const CONFIG = kit + '/opencode.json';

  for (const name of ['opencode.json', 'opencode.jsonc']) {
    if (existsSync(path.join(root, name))) {
      defects.push('КФ1 ' + name + ' в корне — второй слой конфига поверх ' + CONFIG + '; перенести содержимое в ' + CONFIG + ' и удалить');
    }
  }

  if (existsSync(path.join(root, kit, 'opencode.jsonc'))) {
    defects.push('КФ2 ' + kit + '/opencode.jsonc — конфиг ведётся одним файлом ' + CONFIG);
  }
  const abs = path.join(root, CONFIG);
  if (!existsSync(abs)) {
    defects.push('КФ2 ' + CONFIG + ' не найден — права и instructions не подключены');
    return { defects };
  }
  let cfg;
  try {
    cfg = JSON.parse(readFileSync(abs, 'utf8'));
  } catch (e) {
    defects.push('КФ2 ' + CONFIG + ' не читается как JSON: ' + e.message);
    return { defects };
  }

  for (const k of MODEL_KEYS) {
    if (cfg[k] !== undefined) defects.push('КФ3 ' + CONFIG + ' → ' + k + ' — модель и провайдер задаются в глобальном конфиге машины, не в репозитории');
  }
  for (const [name, a] of Object.entries(cfg.agent || {})) {
    if (a && a.model !== undefined) defects.push('КФ3 ' + CONFIG + ' → agent.' + name + '.model — на другом контуре даст «Model not found»');
  }

  checkSkills(root, kit, defects);
  return { defects };
}

/* КФ4 — см. шапку. Шапка читается построчно: значение в строке ключа или,
   для блочной формы YAML (`description: >`), в следующих строках с отступом. */
function checkSkills(root, kit, defects) {
  const dir = path.join(root, kit, 'skills');
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const file = path.join(dir, e.name, 'SKILL.md');
    if (!existsSync(file)) continue;
    const rel = kit + '/skills/' + e.name + '/SKILL.md';
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    const end = lines[0] === '---' ? lines.indexOf('---', 1) : -1;
    const head = end > 0 ? lines.slice(1, end) : [];
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
  instructions: ['.opencode/rules/ds-rules.md'],
  permission: { bash: { '*': 'allow', 'rm *': 'deny' } },
  agent: { build: { temperature: 0.2 } },
};
const cfgJson = (patch) => JSON.stringify({ ...CLEAN, ...patch }, null, 2);

const CASES = [
  { name: 'чистое дерево', expect: null },
  { name: 'конфиг в корне', expect: 'КФ1 opencode.json',
    mutate: (r) => put(r, 'opencode.json', cfgJson({})) },
  { name: 'jsonc в корне', expect: 'КФ1 opencode.jsonc',
    mutate: (r) => put(r, 'opencode.jsonc', '{}') },
  { name: 'конфига нет', expect: 'не найден',
    mutate: (r) => rmSync(path.join(r, SELFTEST_CONFIG)) },
  { name: 'jsonc рядом в .opencode', expect: 'КФ2 .opencode/opencode.jsonc',
    mutate: (r) => put(r, '.opencode/opencode.jsonc', '{}') },
  { name: 'битый JSON', expect: 'не читается как JSON',
    mutate: (r) => put(r, SELFTEST_CONFIG, '{ "permission": ') },
  { name: 'модель агента', expect: 'agent.plan.model',
    mutate: (r) => put(r, SELFTEST_CONFIG, cfgJson({ agent: { plan: { model: 'deepseek/deepseek-v4-flash' } } })) },
  { name: 'модель по умолчанию', expect: '→ model',
    mutate: (r) => put(r, SELFTEST_CONFIG, cfgJson({ model: 'corp-gateway/deepseek-v4-flash' })) },
  { name: 'провайдер', expect: '→ provider',
    mutate: (r) => put(r, SELFTEST_CONFIG, cfgJson({ provider: { 'corp-gateway': {} } })) },
  { name: 'скилл без description', expect: 'КФ4 .opencode/skills/bare/SKILL.md — в шапке нет description',
    mutate: (r) => put(r, '.opencode/skills/bare/SKILL.md', '---\nbelongs_to: bare\npurpose: скилл без описания\n---\n\n# Голый скилл\n') },
  { name: 'name скилла не совпадает с папкой', expect: 'name «other» не совпадает с папкой «named»',
    mutate: (r) => put(r, '.opencode/skills/named/SKILL.md', '---\nname: other\ndescription: Описание есть.\n---\n\n# Скилл\n') },
  { name: 'description блочной формой YAML', expect: null,
    mutate: (r) => put(r, '.opencode/skills/folded/SKILL.md', '---\nname: folded\ndescription: >\n  Описание в две\n  строки.\n---\n\n# Скилл\n') },
];
// в каждом дереве селфтеста — исправный скилл: чистый случай проходит через КФ4, а не мимо
const GOOD_SKILL = '---\nname: good\ndescription: Исправный скилл для селфтеста.\n---\n\n# Исправный скилл\n';

function selftest() {
  const out = ['== agent-config --selftest =='];
  let failed = 0;
  for (const c of CASES) {
    const root = mkdtempSync(path.join(os.tmpdir(), 'agent-config-'));
    try {
      put(root, SELFTEST_CONFIG, cfgJson({}));
      put(root, '.opencode/skills/good/SKILL.md', GOOD_SKILL);
      if (c.mutate) c.mutate(root);
      const { defects } = check(root, SELFTEST_KIT);
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
  const res = check(P.root, P.kit);
  console.log(report(res));
  process.exit(res.defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

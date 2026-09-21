#!/usr/bin/env node
/* ============================================================
   DS-CHECK — единый гейт механической проверки ДС.

   Два режима, вердикт один:

     node scripts/ds-check.mjs <страница>   — гейт страницы:
       1. scripts/ds-lint-cli.mjs <page>        — статический ревизор целостности ДС
       2. docs-split.mjs check <page>           — структурные проверки docs-split
          (только для страниц на docs-split)

     node scripts/ds-check.mjs --all        — проверка всей ДС своими силами,
       без харнеса агента (реструктуризация, шаг Ш4: ДС проверяет себя сама):
       1. ds-lint-cli.mjs                       — глобальные правила и реестры
       2. ds-lint-cli.mjs --parity              — документация = код
       3. spec-audit.mjs                        — обещания спек против кода
       4. ds-lint-cli.mjs <все страницы pages/> — одним вызовом

   Раскатка docs-split — инструмент харнеса агента: где он лежит, говорит
   манифест проекта (kit-link.mjs). ДС без проекта — шаг печатается строкой
   ПРОПУЩЕН, а не молчит. Браузерный шаг verify удалён 13.09.2026: в рабочем
   контуре браузер по скрипту запрещён.

   Код выхода: 1 если хоть один шаг дал FAIL/BLOCKER, иначе 0.
   ============================================================ */
import { readFile, readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { kitFile, projectRoot } from './kit-link.mjs';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NODE = process.execPath;
const DS_LINT = path.join(ROOT, 'scripts', 'ds-lint-cli.mjs');
const SPEC_AUDIT = path.join(ROOT, 'scripts', 'spec-audit.mjs');
const DOCS_SPLIT = kitFile('skills/docs-split/tooling/docs-split.mjs');

const argv = process.argv.slice(2);
const all = argv.includes('--all');
const page = argv.find((a) => !a.startsWith('--'));
if (!page && !all) {
  console.error('Использование: node scripts/ds-check.mjs <страница> | --all');
  process.exit(2);
}

async function pagesOf(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await pagesOf(p));
    else if (e.name.endsWith('.html')) out.push(path.relative(ROOT, p).split(path.sep).join('/'));
  }
  return out.sort();
}

const steps = [];
if (all) {
  steps.push(['линтер, глобальные правила', [DS_LINT]]);
  steps.push(['линтер --parity', [DS_LINT, '--parity']]);
  steps.push(['spec-audit', [SPEC_AUDIT]]);
  const pages = await pagesOf(path.join(ROOT, 'pages'));
  steps.push(['линтер, страницы — ' + pages.length, [DS_LINT, ...pages]]);
} else {
  const pageAbs = path.resolve(ROOT, page);
  // ds-lint-cli.mjs ожидает ОТНОСИТЕЛЬНЫЙ путь (он делает path.join(ROOT, p));
  // абсолютный путь превращается в мусор и даёт ложные C1/C2. На Windows
  // path.relative() отдаёт обратные слэши, а ds-lint режет по '/' — нормализуем.
  const pageRel = path.relative(ROOT, pageAbs).split(path.sep).join('/');
  steps.push(['ds-lint', [DS_LINT, pageRel]]);
  const isDocsSplit = (await readFile(pageAbs, 'utf8')).includes('class="page ds-split"');
  if (isDocsSplit) {
    if (DOCS_SPLIT) {
      // docs-split.mjs резолвит страницу от корня проекта — путь передаём от него
      steps.push(['docs-split check', [DOCS_SPLIT, 'check', path.relative(projectRoot(), pageAbs).split(path.sep).join('/')]]);
    } else {
      console.log('ПРОПУЩЕН: docs-split check — ДС не в проекте с оснасткой агента (нет project.json → agentKit.mount)');
    }
  }
}

let failed = 0;
for (const [name, args] of steps) {
  console.log(`\n=== ${name} ===`);
  try {
    const { stdout } = await run(NODE, args, { cwd: ROOT, maxBuffer: 32 * 1024 * 1024, timeout: 300000, windowsHide: true });
    process.stdout.write(all ? stdout.split('\n').slice(-6).join('\n') + '\n' : stdout);
  } catch (e) {
    if (e.stdout) process.stdout.write(String(e.stdout));
    if (e.stderr) process.stderr.write(String(e.stderr));
    failed++;
    console.log(`шаг ${name} завершился с ошибкой (код ${e.code ?? '?'})`);
  }
}

console.log('\n' + '='.repeat(40));
console.log(failed === 0 ? 'ВЕРДИКТ: OK' : `ВЕРДИКТ: FAIL (${failed} шаг(а))`);
process.exit(failed === 0 ? 0 : 1);

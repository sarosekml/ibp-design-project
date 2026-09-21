#!/usr/bin/env node
/* ============================================================
   MANIFEST-CHECK — сторож манифеста проекта `project.json`.

   Зачем. Манифест — одна точка правды о структуре проекта: где лежит ДС, где
   харнес, где хаб и его реестр, какие треки у приложений и в каких каталогах
   они живут. Реструктуризация (docs/restructure-3-repos.md) двигает эти
   каталоги по одному шагу, и каждый переезд становится правкой одного значения
   плюс перемещением файлов. Манифест, разошедшийся с диском, хуже
   отсутствующего: инструменты, которые читают его, пойдут по несуществующим
   путям. Поэтому он сторожится с первого дня (шаг Ш1).

   Поля, контракт 1. Обязательные: contract, id, designSystem.mount,
   agentKit.mount, hub.page, hub.registry, tracks[] — у каждого трека id,
   title, hubGroup (группа записи в реестре хаба) и каталог: собственный `dir`
   или общий `apps.dir`. Остальные поля описаны в плане, §6.1; поля, которые
   служили только универсальности харнеса (checks[], пины версий), не
   заводятся — решение владельца Р8 (харнес работает только с этой ДС и этим
   проектом).

   Что проверяет (коды МФ — «манифест»):
     МФ1 project.json в корне есть и читается как JSON;
     МФ2 обязательные поля на месте и нужного вида;
     МФ3 contract известен сторожу;
     МФ4 объявленные пути существуют: каталоги ДС, харнеса, его оснастки
         (agentKit.tools) и адаптера под агентный CLI (agentKit.adapter —
         каталог, который CLI ищет сам, с его конфигом и указателями в
         харнес; Ш5), страница хаба и её реестр, каталоги треков или
         apps.dir, каталог документов (docs). Каталог состояния (state) на
         диске не требуется: он вне git и создаётся инструментами;
     МФ5 id треков не повторяются.

   Корень — каталог, где лежит project.json: поиск идёт вверх от этого файла
   (`findRoot` в project.mjs — один владелец на всю оснастку). Подъём на
   фиксированное число уровней привязал бы сторожа к одной глубине харнеса, а
   она меняется на Ш5.

   Использование:
     node manifest-check.mjs [--root <корень проекта>]
     node manifest-check.mjs --selftest   — откат на временном дереве
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { findRoot, MANIFEST_FILE as MANIFEST } from './project.mjs';

const CONTRACTS = [1];

const str = (v) => typeof v === 'string' && v.trim() !== '';

export function check(root) {
  const defects = [];
  const abs = path.join(root, MANIFEST);
  if (!existsSync(abs)) {
    defects.push('МФ1 ' + MANIFEST + ' в корне нет — структура проекта не описана');
    return { defects, manifest: null };
  }
  let m;
  try {
    m = JSON.parse(readFileSync(abs, 'utf8'));
  } catch (e) {
    defects.push('МФ1 ' + MANIFEST + ' не читается как JSON: ' + e.message);
    return { defects, manifest: null };
  }

  const need = (ok, what) => { if (!ok) defects.push('МФ2 ' + what); };
  need(Number.isInteger(m.contract), 'contract — целое число, версия формата манифеста');
  need(str(m.id), 'id — строка');
  need(m.designSystem && str(m.designSystem.mount), 'designSystem.mount — каталог ДС от корня');
  need(m.agentKit && str(m.agentKit.mount), 'agentKit.mount — каталог харнеса от корня');
  need(m.hub && str(m.hub.page), 'hub.page — страница хаба');
  need(m.hub && str(m.hub.registry), 'hub.registry — реестр хаба');
  const tracks = Array.isArray(m.tracks) ? m.tracks : [];
  need(tracks.length > 0, 'tracks — непустой список треков');
  const appsDir = m.apps && str(m.apps.dir) ? m.apps.dir : null;
  tracks.forEach((t, i) => {
    const where = 'tracks[' + i + ']';
    need(t && str(t.id), where + '.id');
    need(t && str(t.title), where + '.title');
    need(t && str(t.hubGroup), where + '.hubGroup — группа записи в реестре хаба');
    need(t && (str(t.dir) || appsDir), where + ' — каталог: dir у трека или общий apps.dir');
  });

  if (Number.isInteger(m.contract) && !CONTRACTS.includes(m.contract)) {
    defects.push('МФ3 contract ' + m.contract + ' сторожу неизвестен (известны: ' + CONTRACTS.join(', ') + ')');
  }

  const onDisk = (rel, kind, what) => {
    if (!str(rel)) return;
    let st = null;
    try { st = statSync(path.join(root, rel)); } catch { /* нет на диске */ }
    const ok = st && (kind === 'dir' ? st.isDirectory() : st.isFile());
    if (!ok) defects.push('МФ4 ' + what + ': «' + rel + '» — ' + (kind === 'dir' ? 'каталога' : 'файла') + ' нет на диске');
  };
  onDisk(m.designSystem?.mount, 'dir', 'designSystem.mount');
  onDisk(m.agentKit?.mount, 'dir', 'agentKit.mount');
  onDisk(m.agentKit?.tools, 'dir', 'agentKit.tools');
  if (m.agentKit && m.agentKit.adapter !== undefined && !str(m.agentKit.adapter)) defects.push('МФ2 agentKit.adapter — каталог адаптера агентного CLI от корня (строка)');
  onDisk(m.agentKit?.adapter, 'dir', 'agentKit.adapter');
  onDisk(m.docs, 'dir', 'docs');
  const stateRel = typeof m.state === 'string' ? m.state : m.state?.dir;
  if (m.state !== undefined && !str(stateRel)) defects.push('МФ2 state — каталог состояния гейта от корня (строка)');
  onDisk(m.hub?.page, 'file', 'hub.page');
  onDisk(m.hub?.registry, 'file', 'hub.registry');
  onDisk(appsDir, 'dir', 'apps.dir');
  if (m.apps && m.apps.manifest !== undefined && !str(m.apps.manifest)) defects.push('МФ2 apps.manifest — имя файла записи приложения (строка)');
  for (const [k, v] of Object.entries(m.appShape || {})) if (!str(v)) defects.push('МФ2 appShape.' + k + ' — каталог внутри приложения (строка)');
  tracks.forEach((t, i) => {
    if (t && t.agentEdit !== undefined && !['allow', 'ask', 'deny'].includes(t.agentEdit)) {
      defects.push('МФ2 tracks[' + i + '].agentEdit — allow | ask | deny: как агент правит приложения трека');
    }
  });
  for (const t of tracks) if (t && str(t.dir)) onDisk(t.dir, 'dir', 'tracks[' + (t.id || '?') + '].dir');

  const ids = tracks.map((t) => t && t.id).filter(Boolean);
  const dup = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (dup.length) defects.push('МФ5 id треков повторяются: ' + dup.join(', '));

  return { defects, manifest: m };
}

function report({ defects }) {
  const out = ['== manifest-check =='];
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
  contract: 1,
  id: 'fixture',
  designSystem: { mount: 'ds', source: { type: 'inline' } },
  agentKit: { mount: '.kit', tools: '.kit/tools', adapter: '.cli', source: { type: 'inline' } },
  state: '.state',
  docs: 'docs',
  hub: { page: 'index.html', registry: 'hub.js' },
  tracks: [
    { id: 'product', title: 'Проекты', dir: 'Projects', hubGroup: 'projects' },
    { id: 'rnd', title: 'Концепты', dir: 'Concepts', hubGroup: 'concepts' },
  ],
};
const manifestJson = (patch) => JSON.stringify({ ...CLEAN, ...patch }, null, 2);

const CASES = [
  { name: 'чистое дерево', expect: null },
  { name: 'манифеста нет', expect: 'МФ1 project.json в корне нет',
    mutate: (r) => rmSync(path.join(r, MANIFEST)) },
  { name: 'битый JSON', expect: 'не читается как JSON',
    mutate: (r) => put(r, MANIFEST, '{ "contract": ') },
  { name: 'нет точки монтирования ДС', expect: 'МФ2 designSystem.mount',
    mutate: (r) => put(r, MANIFEST, manifestJson({ designSystem: { source: { type: 'inline' } } })) },
  { name: 'неизвестный contract', expect: 'МФ3 contract 2',
    mutate: (r) => put(r, MANIFEST, manifestJson({ contract: 2 })) },
  { name: 'каталога ДС нет на диске', expect: 'МФ4 designSystem.mount: «ds»',
    mutate: (r) => rmSync(path.join(r, 'ds'), { recursive: true }) },
  { name: 'каталога трека нет на диске', expect: 'МФ4 tracks[rnd].dir: «Concepts»',
    mutate: (r) => rmSync(path.join(r, 'Concepts'), { recursive: true }) },
  { name: 'реестра хаба нет', expect: 'МФ4 hub.registry: «hub.js»',
    mutate: (r) => rmSync(path.join(r, 'hub.js')) },
  { name: 'id треков повторяются', expect: 'МФ5 id треков повторяются: rnd',
    mutate: (r) => put(r, MANIFEST, manifestJson({ tracks: [CLEAN.tracks[1], { ...CLEAN.tracks[1], dir: 'Projects' }] })) },
  { name: 'трек без каталога и без apps.dir', expect: 'tracks[0] — каталог',
    mutate: (r) => put(r, MANIFEST, manifestJson({ tracks: [{ id: 'product', title: 'Проекты', hubGroup: 'projects' }] })) },
  { name: 'каталога оснастки харнеса нет', expect: 'МФ4 agentKit.tools: «.kit/tools»',
    mutate: (r) => rmSync(path.join(r, '.kit', 'tools'), { recursive: true }) },
  { name: 'каталога адаптера CLI нет', expect: 'МФ4 agentKit.adapter: «.cli»',
    mutate: (r) => rmSync(path.join(r, '.cli'), { recursive: true }) },
  { name: 'каталог состояния на диске не нужен', expect: null,
    mutate: (r) => { if (existsSync(path.join(r, '.state'))) rmSync(path.join(r, '.state'), { recursive: true }); } },
  { name: 'agentEdit вне словаря', expect: 'МФ2 tracks[0].agentEdit',
    mutate: (r) => put(r, MANIFEST, manifestJson({ tracks: [{ ...CLEAN.tracks[0], agentEdit: 'sometimes' }, CLEAN.tracks[1]] })) },
  { name: 'форма после Ш7: общий apps.dir', expect: null,
    mutate: (r) => {
      mkdirSync(path.join(r, 'apps'));
      put(r, MANIFEST, manifestJson({ apps: { dir: 'apps' }, tracks: CLEAN.tracks.map(({ dir, ...t }) => t) }));
    } },
];

function selftest() {
  const out = ['== manifest-check --selftest =='];
  let failed = 0;
  for (const c of CASES) {
    const root = mkdtempSync(path.join(os.tmpdir(), 'manifest-check-'));
    try {
      put(root, MANIFEST, manifestJson({}));
      for (const d of ['ds', '.kit', '.kit/tools', '.cli', 'docs', 'Projects', 'Concepts']) mkdirSync(path.join(root, d));
      put(root, 'index.html', '<!DOCTYPE html>\n');
      put(root, 'hub.js', 'window.IBPHub = [];\n');
      if (c.mutate) c.mutate(root);
      const { defects } = check(root);
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
  const root = rIdx >= 0 ? path.resolve(args[rIdx + 1]) : findRoot();
  if (!root) {
    console.log(report({ defects: ['МФ1 ' + MANIFEST + ' не найден ни в одном каталоге выше оснастки — структура проекта не описана'] }));
    process.exit(1);
  }
  const res = check(root);
  console.log(report(res));
  process.exit(res.defects.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

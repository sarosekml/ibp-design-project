/* ============================================================
   RUNLOG — журнал прогонов инструментов проверки (каталог `runs/`).

   Зачем. `verify` доказывает, что сторож ЖИВОЙ (падает на дефекте, молчит на
   эталоне). Он не отвечает на другой вопрос: сработал ли сторож хоть раз на
   настоящей работе и не вернулся ли дефект после того, как урок объявили
   закреплённым. Этого сигнала не было вовсе: журнал уроков знает дату
   закрепления, но не знает, что случилось ПОСЛЕ неё.

   ХРАНЕНИЕ — ФАЙЛ НА ПРОГОН (с 21.09.2026, решение владельца, docs/agent-imp.md,
   У4). Журнал — каталог `runs/` в каталоге состояния проекта (`state` в
   project.json, вне git — реструктуризация, шаг Ш4: журнал внутри харнеса
   пачкал бы его подмодуль после каждого прогона гейта). В нём
   `run-<ГГГГ-ММ-ДД>-<ЧЧММСС>-<id>.jsonl`:
   дата и время UTC, `id` случайный. Прогон — один вызов гейта (все
   инструменты, которые он запускает, пишут в его файл: путь приходит
   переменной окружения RUNLOG_FILE) или один отдельный запуск инструмента.
   До этого журнал был одним файлом `runs.jsonl` и рос без предела (1572
   строки за две недели), а каждая ветка дописывала его конец — слияние двух
   веток давало конфликт ровно в одном месте. Файл с уникальным именем
   конфликта не даёт, а вращение сводится к удалению старых файлов.

   ВРАЩЕНИЕ. Хранятся последние LIMIT строк: когда появляется файл нового
   прогона, самые старые файлы удаляются ЦЕЛИКОМ, пока сумма строк не уложится
   в предел. Разрыва в истории нет: удалив файл, удаляем и всё, что старше.
   Самый новый файл не удаляется никогда. Гейт вращает журнал ещё раз в конце
   своего прогона: его файл растёт уже после первой строки, и без этого
   журнал держался бы в пределе «плюс один прогон». Глубже `stats` и не смотрит: его
   выводы — окно последних 10 прогонов инструмента и прогоны после дня
   закрепления урока. Проверено на усечении: списки ЖИВОЙ и РЕГРЕСС не
   меняются; «встречался раньше» у кода, не встречавшегося в оставшемся окне,
   переходит в «не встречался» — это и значит «глубина журнала», а не ошибка.

   Одна строка на прогон инструмента, JSON Lines:
     {"t":"2026-09-06T10:11:12.000Z","tool":"линтер",
      "target":"pages/molecules/InputText.html","verdict":"PASS с замечаниями",
      "codes":["D4"]}
   Поле `n` — номер строки в общем файле — ушло вместе с общим файлом; в
   перенесённых строках оно осталось и ни на что не влияет.

   `codes` — только СРАБОТАВШИЕ идентификаторы (FAIL/WARN/BLOCKER/INFO).
   Пройденные проверки не пишутся: их состав меняется от версии к версии, а
   различать нужно «код появился» и «код не появился».

   ФИКСТУРЫ В ЖУРНАЛ НЕ ПОПАДАЮТ. `verify` гоняет 37 пар «дефект/эталон», и
   каждый прогон по определению даёт сработавший код. Пусти их в журнал — и
   «код появлялся» будет верно для любого сторожа с фикстурой, то есть сигнал
   обнулится ровно там, где он нужен. Отсекается по пути: любой файл внутри
   каталога `fixtures/` не логируется.

   Владелец один — и записи, и чтения, и вращения. Три инструмента
   (`layout-check.mjs`, `ds-lint-cli.mjs`, `spec-audit.mjs`) импортируют этот
   модуль МЯГКО — через try/catch: журнал прогонов не имеет права уронить
   проверку. Инструменты ДС находят его через манифест проекта
   (`scripts/kit-link.mjs` ДС → `agentKit.tools`), а не литералом пути в
   харнес. Нет проекта (ДС проверяется отдельно, без харнеса) — инструменты
   работают как работали, просто без записи. Читает журнал `lessons-cli` (`stats`, `check`,
   `state`) — через `readRuns` отсюда, а не своим разбором.

   Запуск: node runlog.mjs --selftest — откат на временном каталоге.
   ============================================================ */
import { appendFileSync, readFileSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync, mkdtempSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { project } from './project.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/* Корень и каталоги — из манифеста (project.mjs). Проекта нет — журнал не
   пишется (RUNS_DIR = null), а пути в проверках отсчитываются от каталога
   запуска: инструмент обязан работать и так. */
const P = project(HERE);
const ROOT = P.root || process.cwd();
export const RUNS_DIR = P.stateAbs ? path.join(P.stateAbs, 'runs') : null;
/* Общий файл — форма журнала до 21.09.2026, внутри оснастки харнеса. Если он
   появится снова (слияние с веткой, где журнал ещё общий), его строки
   читаются как самые старые и уходят первыми при вращении. */
const LEGACY = path.join(HERE, 'runs.jsonl');
export const LIMIT = 2000;
const FILE_RX = /^run-\d{4}-\d{2}-\d{2}-\d{6}-[0-9a-z]+\.jsonl$/;

const pad = (n) => String(n).padStart(2, '0');

/** Имя файла прогона: дата и время UTC — порядок имён совпадает с порядком прогонов. */
export function runFileName(d = new Date(), id = randomBytes(3).toString('hex')) {
  return 'run-' + d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + '-'
    + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + '-' + id + '.jsonl';
}

/** Файлы журнала от старых к новым; общий файл старой формы — первым. */
export function runFiles(dir = RUNS_DIR, legacy = LEGACY) {
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => FILE_RX.test(f)).sort().map((f) => path.join(dir, f)) : [];
  return legacy && existsSync(legacy) ? [legacy, ...files] : files;
}

const linesOf = (file) => {
  try { return readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()); } catch { return []; }
};

/** Сколько строк в файле прогона (гейт проверяет, что прогон по настоящему файлу записан). */
export const countLines = (file) => linesOf(file).length;

/** Все записи журнала по порядку прогонов. Битая строка чтение не роняет. */
export function readRuns(dir = RUNS_DIR, legacy = LEGACY) {
  const out = [];
  for (const f of runFiles(dir, legacy)) {
    for (const l of linesOf(f)) {
      try { out.push(JSON.parse(l)); } catch { /* битая строка журнала не роняет отчёт */ }
    }
  }
  return out;
}

/** Вращение: см. шапку. Возвращает, сколько строк осталось и какие файлы удалены. */
export function rotate(dir = RUNS_DIR, limit = LIMIT, legacy = LEGACY) {
  const files = runFiles(dir, legacy);
  const removed = [];
  let kept = 0, cut = false;
  for (let i = files.length - 1; i >= 0; i--) {
    const n = countLines(files[i]);
    if (!cut && (i === files.length - 1 || kept + n <= limit)) { kept += n; continue; }
    cut = true;                                   // дальше — только старше: удаляется всё, разрыва нет
    rmSync(files[i], { force: true });
    removed.push(files[i]);
  }
  return { kept, removed };
}

/* Файл прогона этого процесса: путь от гейта (RUNLOG_FILE) или свой, один на
   процесс — отдельный запуск инструмента и есть отдельный прогон. */
let own = null;
export function currentRunFile() {
  if (process.env.RUNLOG_FILE) return process.env.RUNLOG_FILE;
  if (!RUNS_DIR) return null;
  if (!own) own = path.join(RUNS_DIR, runFileName());
  return own;
}

/** Путь к корню репозитория, слэшами вперёд — иначе на Windows пути в журнале
    будут в двух разных видах и `stats` посчитает их разными файлами. */
export function relTarget(p) {
  if (!p) return '';
  const abs = path.isAbsolute(p) ? p : path.resolve(ROOT, p);
  return path.relative(ROOT, abs).split(path.sep).join('/');
}

export function isFixture(p) {
  const rel = relTarget(p);
  return rel.split('/').includes('fixtures');
}

/** ЭТАЛОНЫ В ЖУРНАЛ ТОЖЕ НЕ ПОПАДАЮТ. Шаблон экрана ДС
    (`<ДС>/templates/screen/*.html`, пути — из манифеста) и образцы скиллов
    (`<харнес>/skills/<скилл>/references/*.html`) — образец каркаса, а не
    работа: его прогоняют, чтобы образец не разъехался с ДС. Определение одно
    на всех: его зовут и журнал, и сенсор (пропуск Б12) — две копии правила
    разошлись бы на первом переезде образца (Л43). Причина отсечения та же, что у фикстур, но
    механизм вреда другой: `stats` считает код «живым», если он встретился в
    последних 10 прогонах инструмента. Десяток прогонов по эталонам вытеснил
    бы из этого окна настоящие экраны — их коды уехали бы в «ИСЧЕЗ», то есть
    были бы прочитаны как ОБУЧЕНИЕ. Молчание снова читалось бы как чистота
    (Л100), только дороже: не пустой обход, а подделанный вывод.

    Отдельная функция, а не расширение `isFixture`: `ds-lint-cli.mjs` зовёт
    `isFixture` по своему поводу — «партия целиком фикстурная», — и менять
    смысл чужого вызова из этого файла нельзя. */
const escRx = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const KIT_REFS = P.kit ? new RegExp('^' + escRx(P.kit) + '/skills/[^/]+/references/') : null;
const DS_TEMPLATES = P.ds ? new RegExp('^' + escRx(P.ds) + '/templates/screen/') : null;
export function isEtalon(p) {
  const rel = relTarget(p);
  return Boolean((KIT_REFS && KIT_REFS.test(rel)) || (DS_TEMPLATES && DS_TEMPLATES.test(rel)));
}

/** ФАЙЛ ВНЕ РЕПОЗИТОРИЯ — НЕ РАБОТА НАД РЕПОЗИТОРИЕМ. Путь, вышедший из
    корня (`../..`), приходит ровно из одного места: копия экрана во временном
    каталоге, на которой проверяют сторожа откатом. Такая копия — та же
    фикстура, только созданная на ходу, и в журнале она занимает место
    настоящего экрана в окне HORIZON. Поймано на себе 12.09.2026: две строки
    `../../../../../AppData/Local/Temp/…` от проверки правила З11. */
export function isOutside(p) {
  return relTarget(p).startsWith('..');
}

/** Сработавшие идентификаторы из отчёта любого из трёх инструментов.
    Формы строк: «FAIL  Б12 …», «WARN  K1 …», «BLOCKER A2 …», «WARN    D4  …».
    Один разбор на всех — три копии разъезжались бы так же, как разъезжались
    прозаические перечни проверок (урок Л43). */
export function codesFrom(text) {
  const out = [];
  const seen = new Set();
  for (const m of String(text).matchAll(/^(?:FAIL|WARN|BLOCKER|INFO)\s+([A-ZА-ЯЁ][0-9]{1,2}(?:\.[0-9])?)(?![0-9])/gmu)) {
    if (!seen.has(m[1])) { seen.add(m[1]); out.push(m[1]); }
  }
  return out;
}

/**
 * @param {{tool:string, target?:string, verdict:string, codes?:string[], text?:string}} rec
 *   `codes` можно не передавать — тогда они извлекаются из `text` (отчёта).
 * @returns {boolean} записана ли строка
 */
export function logRun(rec) {
  try {
    const target = relTarget(rec.target || '');
    if (target && (isFixture(target) || isEtalon(target) || isOutside(target))) return false;
    const codes = rec.codes || codesFrom(rec.text || '');
    const line = JSON.stringify({ t: new Date().toISOString(), tool: rec.tool, target, verdict: rec.verdict, codes });
    const file = currentRunFile();
    if (!file) return false;                      // проекта нет — журнала нет
    const fresh = !existsSync(file);
    mkdirSync(path.dirname(file), { recursive: true });
    appendFileSync(file, line + '\n', 'utf8');
    // новый прогон — повод сдвинуть окно; общий файл старой формы — только у настоящего журнала
    if (fresh) rotate(path.dirname(file), LIMIT, path.dirname(file) === RUNS_DIR ? LEGACY : null);
    return true;
  } catch {
    // журнал прогонов не имеет права уронить проверку
    return false;
  }
}

/* ---------------- selftest: откат на временном каталоге ---------------- */

function fill(dir, name, n, from = 0) {
  const rows = [];
  for (let i = 0; i < n; i++) rows.push(JSON.stringify({ t: '2026-09-0' + (1 + ((from + i) % 9)) + 'T00:00:00.000Z', tool: 'сенсор', target: 'x.html', verdict: 'OK', codes: [], k: from + i }));
  writeFileSync(path.join(dir, name), rows.join('\n') + '\n', 'utf8');
}
const names = (dir) => (existsSync(dir) ? readdirSync(dir).sort() : []);

const CASES = [
  { name: 'вращение: предел держится, новые файлы остаются', run: (d) => {
      ['run-2026-09-01-000000-a', 'run-2026-09-02-000000-b', 'run-2026-09-03-000000-c', 'run-2026-09-04-000000-d', 'run-2026-09-05-000000-e']
        .forEach((b, i) => fill(d, b + '.jsonl', 3, i * 3));
      const r = rotate(d, 7, null);
      const left = names(d);
      return r.kept <= 7 && left.length === 2 && left[0].includes('-d.') && left[1].includes('-e.')
        ? null : 'осталось ' + r.kept + ' строк, файлы: ' + left.join(' ');
    } },
  { name: 'вращение: разрыва в истории нет', run: (d) => {
      fill(d, 'run-2026-09-01-000000-a.jsonl', 1);
      fill(d, 'run-2026-09-02-000000-b.jsonl', 6);
      fill(d, 'run-2026-09-03-000000-c.jsonl', 1);
      rotate(d, 5, null);
      const left = names(d);
      return left.length === 1 && left[0].includes('-c.') ? null : 'файлы: ' + left.join(' ') + ' — старый файл пережил удалённый новый';
    } },
  { name: 'вращение: самый новый файл не удаляется, даже если он больше предела', run: (d) => {
      fill(d, 'run-2026-09-01-000000-a.jsonl', 2);
      fill(d, 'run-2026-09-02-000000-b.jsonl', 9);
      const r = rotate(d, 5, null);
      const left = names(d);
      return left.length === 1 && left[0].includes('-b.') && r.kept === 9 ? null : 'файлы: ' + left.join(' ');
    } },
  { name: 'чтение: от старых к новым, общий файл старой формы первым', run: (d) => {
      const legacy = path.join(d, 'legacy.jsonl');
      writeFileSync(legacy, JSON.stringify({ k: 1 }) + '\n' + JSON.stringify({ k: 2 }) + '\n', 'utf8');
      mkdirSync(path.join(d, 'runs'));
      writeFileSync(path.join(d, 'runs', 'run-2026-09-02-000000-b.jsonl'), JSON.stringify({ k: 4 }) + '\n', 'utf8');
      writeFileSync(path.join(d, 'runs', 'run-2026-09-01-000000-a.jsonl'), JSON.stringify({ k: 3 }) + '\nбитая строка\n', 'utf8');
      writeFileSync(path.join(d, 'runs', 'заметка.txt'), 'не журнал\n', 'utf8');
      const ks = readRuns(path.join(d, 'runs'), legacy).map((r) => r.k).join(',');
      return ks === '1,2,3,4' ? null : 'порядок ' + ks;
    } },
  { name: 'гейт: инструменты одного прогона пишут в один файл', run: (d) => {
      const file = path.join(d, runFileName());
      const was = process.env.RUNLOG_FILE;
      process.env.RUNLOG_FILE = file;
      try {
        logRun({ tool: 'сенсор', target: 'Concepts/x/x.html', verdict: 'OK', codes: [] });
        logRun({ tool: 'линтер', target: 'Concepts/x/x.html', verdict: 'PASS', codes: ['D4'] });
      } finally {
        if (was === undefined) delete process.env.RUNLOG_FILE; else process.env.RUNLOG_FILE = was;
      }
      return names(d).length === 1 && countLines(file) === 2 ? null : 'файлов ' + names(d).length + ', строк ' + countLines(file);
    } },
  { name: 'фикстура в журнал не пишется', run: (d) => {
      const file = path.join(d, runFileName());
      const was = process.env.RUNLOG_FILE;
      process.env.RUNLOG_FILE = file;
      let wrote;
      try { wrote = logRun({ tool: 'сенсор', target: '.agents/tools/fixtures/Б5@document.bad.html', verdict: 'FAIL', codes: ['Б5'] }); }
      finally { if (was === undefined) delete process.env.RUNLOG_FILE; else process.env.RUNLOG_FILE = was; }
      return !wrote && !existsSync(file) ? null : 'строка фикстуры записана';
    } },
];

function selftest() {
  const out = ['== runlog --selftest =='];
  let failed = 0;
  for (const c of CASES) {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'runlog-'));
    try {
      const why = c.run(dir);
      if (why) failed++;
      // префикс FAIL — его показывает гейт (фильтр FINDING в lessons-cli.mjs)
      out.push((why ? 'FAIL  ' : 'ok    ') + c.name + (why ? ' — ' + why : ''));
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  out.push('ВЕРДИКТ: ' + (failed ? 'FAIL (кейсов не прошло: ' + failed + ' из ' + CASES.length + ')' : 'OK (кейсов: ' + CASES.length + ')'));
  console.log(out.join('\n'));
  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--selftest')) selftest();
  else { console.log('использование: node runlog.mjs --selftest'); process.exit(2); }
}

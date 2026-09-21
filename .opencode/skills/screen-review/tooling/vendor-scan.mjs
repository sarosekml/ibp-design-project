/* ============================================================
   VENDOR-SCAN — сторож нейтральности репозитория.

   Зачем. Репозиторий уезжает на рабочий контур, и следов посторонних
   агентных инструментов в нём быть не должно: ни имён вендоров и моделей,
   ни служебных каталогов, ни абсолютных путей с машины автора. Правило
   существовало текстом и нарушалось трижды (путь к внешнему плану в
   `Projects/post/…/data/`, два URL в скилле композиции) — текст правилом
   не является, пока его никто не проверяет.
   (Глоб-шаблоны в этой шапке записаны с многоточием: последовательность
   «звёздочка-слэш» закрыла бы блочный комментарий на середине файла.)

   Почему не проходом `spec-audit.mjs`. У аудита корень — `DS-IBP/`, он
   физически не видит `.opencode/` и `Projects/`, то есть ровно те места,
   где следы и нашлись. Сторож, не достающий до входа, — это класс Л100
   («правило, у которого отняли вход, молчит»), и повторять его здесь
   нельзя. Корень берётся как у `layout-check.mjs` — четыре уровня вверх.

   Почему шаблоны собраны из кусков. Сторож, написавший стоп-слова
   литералами, находит сам себя: файл правила стал бы первым нарушителем.
   Склейка — не украшение, а условие работоспособности. Образцы путей в
   селфтесте собраны так же: иначе этот файл носил бы в себе настоящие с виду
   пути, и первая же его копия в другой репозиторий стала бы находкой.

   Абсолютный путь ловится в ДВУХ формах, и обе держит селфтест (21.09.2026).
   До этого образец был только windows-формы, а работа идёт на macOS: файл
   с posix-путём сторож пропускал с вердиктом «чисто» — правило выглядело
   охраняемым, и на него полагались при написании документов.
     posix   — `/Users/` или `/home/`, за ними имя пользователя и каталог.
               Слева — начало строки или символ, который не бывает частью
               имени хоста или каталога: пробел, кавычки, обратная кавычка
               markdown, скобка, `=`, `/` из `file:///`. Поэтому путь на
               чужом хосте (`https://…/Users/…`) и относительный путь
               (`../home/…`) находками не считаются;
     windows — `C:\Users\`, за ним имя и каталог; то же с удвоенными
               слэшами (строка JSON) и с прямыми.
   Путь без имени пользователя (`/Users/…` в прозе) находкой не считается:
   он ничего не выдаёт и нужен, чтобы описывать само правило. Примеры в этой
   шапке записаны именно так — полный пример стал бы находкой в первой же
   копии файла, которую обходит не он сам.

   Что СОЗНАТЕЛЬНО не считается нарушением:
   - имя протокола и имя npm-пакета шлюза (`@ai-sdk/openai-compatible` и
     «…-совместимый API» в `.opencode/README.md`). Политика запрещает
     выдавать, каким агентным инструментом пользуются вне рабочего контура,
     а это — описание корпоративного шлюза и техническое имя зависимости:
     убрать их значит сломать инструкцию по настройке. Решение владельца
     от 11.09.2026;
   - `node_modules/` — чужой код, репозиторием не авторствуется.

   Запуск:
     node .opencode/skills/screen-review/tooling/vendor-scan.mjs
     node vendor-scan.mjs --root <каталог>   — обход другого дерева
     node vendor-scan.mjs --selftest         — откат на временном дереве
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1.
   ============================================================ */
import { readFileSync, readdirSync, mkdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const SELF = path.resolve(fileURLToPath(import.meta.url));

const SKIP_DIRS = new Set(['node_modules', '.git', 'uploads']);
const TEXT_EXT = new Set(['.md', '.json', '.js', '.mjs', '.cjs', '.html', '.css', '.txt', '.yml', '.yaml', '.jsonc']);

/* Стоп-слова: имя вендора, имя ассистента, два имени семейств моделей и
   служебный каталог. Собраны склейкой — см. шапку. */
const A = 'anthr' + 'opic';
const B = 'cla' + 'ude';
const C = 'op' + 'us';
const D = 'son' + 'net';
const U = 'Us' + 'ers';
const H = 'ho' + 'me';
const PATH_WHAT = 'абсолютный путь с машины автора';
const VENDOR_NAME = { re: new RegExp(A, 'i'), what: 'имя вендора' };
const ASSISTANT_NAME = { re: new RegExp(B, 'i'), what: 'имя ассистента' };
const PATTERNS = [
  VENDOR_NAME,
  ASSISTANT_NAME,
  { re: new RegExp('\\b' + C + '\\b', 'i'), what: 'имя семейства моделей' },
  { re: new RegExp('\\b' + D + '\\b', 'i'), what: 'имя семейства моделей' },
  // posix — граница слева см. шапку; буквы любого алфавита считаются частью имени
  { re: new RegExp('(^|[^\\p{L}\\p{N}_.~-])/(' + U + '|' + H + ')/[^/\\s"\'`]+/', 'u'), what: PATH_WHAT },
  // windows — одинарные, удвоенные (JSON) и прямые слэши
  { re: new RegExp('[A-Za-z]:(?:\\\\{1,2}|/)' + U + '(?:\\\\{1,2}|/)[^\\\\/\\s"\'`]+[\\\\/]', 'i'), what: PATH_WHAT },
];

/* Имя файла, которое само было бы следом: локальные правила постороннего
   инструмента в корне. Сторож читает содержимое, а не имена, — но гейт пишет
   имена файлов в снимок `gate-snapshot.json`, а снимок лежит в репозитории.
   Гейт спрашивает здесь, чтобы у словаря остался один владелец (Л43).
   Имена семейств моделей сюда не входят: это обычные слова, и файл с таким
   словом в имени выпал бы из отпечатка гейта молча. */
export const isTraceName = (name) => [VENDOR_NAME, ASSISTANT_NAME].some((p) => p.re.test(name));

function walk(dir, acc) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') && e.isDirectory() && e.name !== '.opencode') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      walk(p, acc);
    } else if (TEXT_EXT.has(path.extname(e.name).toLowerCase())) {
      acc.push(p);
    }
  }
  return acc;
}

function scan(root) {
  const hits = [];
  for (const file of walk(root, [])) {
    if (path.resolve(file) === SELF) continue;          // см. шапку: иначе сторож ловит сам себя
    let text;
    try { text = readFileSync(file, 'utf8'); } catch { continue; }
    const rel = path.relative(root, file).replace(/\\/g, '/');
    text.split(/\r?\n/).forEach((line, i) => {
      // одна находка на строку и вид: posix- и windows-образец видят `C:/Users/…` оба
      const seen = new Set();
      for (const p of PATTERNS) {
        if (seen.has(p.what) || !p.re.test(line)) continue;
        seen.add(p.what);
        hits.push({ rel, n: i + 1, what: p.what, line: line.trim().slice(0, 120) });
      }
    });
  }
  return hits;
}

/* ---------------- selftest: откат на временном дереве ---------------- */

function put(root, rel, text) {
  const p = path.join(root, rel);
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, text, 'utf8');
}

// образцы путей — склейкой, см. шапку
const POSIX_USER = '/' + U + '/someone/Work/secret-project/file.md';
const POSIX_HOME = '/' + H + '/someone/project/notes.md';
const WIN = 'C:' + '\\' + U + '\\someone\\Work\\file.md';

const CASES = [
  { name: 'чистое дерево и почти-совпадения', expect: null,
    mutate: (r) => put(r, 'docs/near.md', [
      'Путь вида `/' + U + '/…` в прозе ничего не выдаёт.',
      'Ссылка https://example.com/' + U + '/someone/page/ — путь на чужом хосте.',
      'Относительный путь ../' + H + '/someone/x/ — не абсолютный.',
      'Windows без имени: `C:\\' + U + '\\…`.',
    ].join('\n')) },
  { name: 'posix: шапка спеки', expect: 'x.screen.md — ' + PATH_WHAT,
    mutate: (r) => put(r, 'Concepts/x/x.screen.md', '---\nsource: ' + POSIX_USER + '\n---\n') },
  { name: 'posix: обратные кавычки markdown', expect: 'b.md — ' + PATH_WHAT,
    mutate: (r) => put(r, 'docs/b.md', 'Исходник — `' + POSIX_HOME + '`.\n') },
  { name: 'posix: file:///', expect: 'index.html — ' + PATH_WHAT,
    mutate: (r) => put(r, 'index.html', '<a href="file://' + POSIX_USER + '">план</a>\n') },
  { name: 'windows: обратные слэши', expect: 'w.md — ' + PATH_WHAT,
    mutate: (r) => put(r, 'docs/w.md', 'Файл: ' + WIN + '\n') },
  { name: 'windows: строка JSON', expect: 'w.json — ' + PATH_WHAT,
    mutate: (r) => put(r, 'data/w.json', JSON.stringify({ source: WIN }) + '\n') },
  { name: 'windows: прямые слэши', expect: 'w.js — ' + PATH_WHAT,
    mutate: (r) => put(r, 'data/w.js', "const src = '" + WIN.replace(/\\/g, '/') + "';\n") },
  { name: 'имя вендора', expect: 'v.md — имя вендора',
    mutate: (r) => put(r, 'v.md', 'Сделано в ' + A + '.\n') },
  { name: 'node_modules не обходится', expect: null,
    mutate: (r) => put(r, 'node_modules/pkg/readme.md', 'source: ' + POSIX_USER + '\n') },
];

function selftest() {
  const out = ['== vendor-scan --selftest =='];
  let failed = 0;
  for (const c of CASES) {
    const root = mkdtempSync(path.join(os.tmpdir(), 'vendor-scan-'));
    try {
      put(root, 'AGENTS.md', '# Правила проекта\n\nТекст без следов.\n');
      if (c.mutate) c.mutate(root);
      const hits = scan(root).map((h) => h.rel + ' — ' + h.what);
      const pass = c.expect === null
        ? hits.length === 0
        : hits.some((h) => h.endsWith(c.expect));
      if (!pass) failed++;
      // префикс FAIL — его показывает гейт (фильтр FINDING в lessons-cli.mjs)
      out.push((pass ? 'ok    ' : 'FAIL  ') + c.name + ' — ' + (hits.length ? hits.join(' | ') : 'находок нет'));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
  out.push('ВЕРДИКТ: ' + (failed ? 'FAIL (кейсов не прошло: ' + failed + ' из ' + CASES.length + ')' : 'OK (кейсов: ' + CASES.length + ')'));
  console.log(out.join('\n'));
  process.exit(failed ? 1 : 0);
}

/* ---------------- main ---------------- */

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return selftest();
  const rIdx = args.indexOf('--root');
  const root = rIdx >= 0 ? path.resolve(args[rIdx + 1]) : REPO;
  const hits = scan(root);

  console.log('== vendor-scan: нейтральность репозитория ==');
  // корень печатается относительно места запуска: абсолютный путь в выводе,
  // сохранённом в файл репозитория, стал бы находкой этого же сторожа
  console.log('корень: ' + (path.relative(process.cwd(), root) || '.'));
  if (!hits.length) {
    console.log('\nчисто — следов посторонних инструментов нет');
  } else {
    console.log('\nнаходок: ' + hits.length);
    for (const h of hits) console.log(`  ${h.rel}:${h.n} — ${h.what}\n      ${h.line}`);
    console.log('\nКаждая находка — либо правится, либо получает явное исключение');
    console.log('в шапке этого файла с причиной и датой решения владельца.');
  }
  console.log('ВЕРДИКТ: ' + (hits.length ? 'FAIL (находок: ' + hits.length + ')' : 'OK'));

  /* Журнал прогонов — мягко: сторож обязан работать и без оснастки уроков.
     Чужое дерево (--root) — не работа над репозиторием, в журнал не идёт. */
  if (root === REPO) {
    try {
      const { logRun } = await import('./runlog.mjs');
      logRun({ tool: 'нейтральность', target: 'репозиторий', verdict: hits.length ? 'FAIL' : 'OK', codes: hits.length ? ['V1'] : [] });
    } catch { /* оснастки нет — сторож работает как работал */ }
  }

  process.exit(hits.length ? 1 : 0);
}

// импорт из гейта (isTraceName) не должен запускать обход
if (process.argv[1] && path.resolve(process.argv[1]) === SELF) main();

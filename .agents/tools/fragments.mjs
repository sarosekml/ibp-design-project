/* ============================================================
   FRAGMENTS — фрагмент экрана не является экраном.

   Зачем. Модульный экран (пилот `Projects/test/post/`) собирается из
   источника с метками `<ds-include src="…">` и файлов-фрагментов — модалок и
   таблиц без `<html>`, `<link>` и каркаса. Экраном их делает сборщик: он
   вшивает фрагменты в `*.preview.html`. Сенсор и линтер проверяли фрагмент как
   целый экран и выносили «нет ds.css», «нет каркаса», «нет .screen.md» —
   13.09.2026 это 21 ложный блокер на четырёх файлах, и каждый полный гейт был
   красным из-за них.

   Определение строгое: фрагмент — файл без `<!DOCTYPE`/`<html>`, на который
   ССЫЛАЕТСЯ `<ds-include src>` из html в той же папке или выше (до корня
   репозитория). Одного «нет DOCTYPE» мало: настоящий экран, где DOCTYPE забыт,
   молча перестал бы проверяться (класс Л100).

   Владелец один — этот модуль. Импортируют: `layout-check.mjs`,
   `design-system/tools/ds-lint-cli.mjs` (мягко: ДС без оснастки линтуется как
   раньше), `lessons-cli gate`.
   ============================================================ */
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { project } from './project.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
/* Граница поиска вверх — корень проекта из манифеста (project.mjs; Ш4), а не
   «четыре уровня вверх». Проекта нет — каталог запуска: поиск по всему диску
   был бы хуже промаха. */
const PRJ = project(HERE);
export const REPO = PRJ.root || process.cwd();

const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, '');

/* Каталог харнеса не исключается намеренно: фикстуры корпуса лежат там, и
   источник фрагмента-фикстуры обязан находиться. */
const SKIP_DIRS = new Set(['.git', 'node_modules']);

/** Все .html в поддереве каталога. */
function htmlUnder(dir, out = []) {
  let entries = [];
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) htmlUnder(full, out); continue; }
    if (e.isFile() && e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/** Источники, которые вшивают этот файл через `<ds-include src>`. Пустой
    список — файл не фрагмент (или фрагмент-сирота: он проверяется как экран).

    Поиск идёт по уровням вверх, и на КАЖДОМ уровне просматривается всё его
    поддерево, а не только файлы, лежащие в нём прямо. Причина: общие модули
    направления живут в своей папке (`apps/postrade/deals-app/widgets/`),
    а страница, которая их вшивает, — в соседней (`apps/postrade/deals-app/pages/`).
    Предок у них общий, прямым родителем источник фрагменту не приходится, и
    поиск «только по прямым файлам предков» объявлял такой модуль сиротой —
    его линтовали как страницу документации ДС (2 ложных блокера на каждом
    модуле, 19.09.2026). Подъём прекращается на первом уровне, где источник
    нашёлся, поэтому полный обход репозитория делает только настоящая сирота. */
export function includersOf(file) {
  const abs = path.resolve(file);
  let text;
  try { text = stripComments(readFileSync(abs, 'utf8')); } catch { return []; }
  if (/<!DOCTYPE|<html\b/i.test(text)) return [];

  let dir = path.dirname(abs);
  while (dir.startsWith(REPO) && dir.length >= REPO.length) {
    const out = [];
    for (const host of htmlUnder(dir)) {
      if (host === abs) continue;
      let h;
      try { h = stripComments(readFileSync(host, 'utf8')); } catch { continue; }
      for (const m of h.matchAll(/<ds-include\b[^>]*\bsrc="([^"]+)"/gi)) {
        if (path.resolve(path.dirname(host), m[1]) === abs) out.push(host);
      }
    }
    if (out.length) return out;
    if (dir === REPO) break;
    dir = path.dirname(dir);
  }
  return [];
}

/** Виджет приложения — фрагмент и без вшивки (решение человека 15.10.2026,
    RE0023 Э8). Файл `.html` в `widgets/` приложения каркаса страницы не несёт:
    его проверяет собранная страница, а до вшивки — витрина. Экранные правила
    (каркас, загрузчик, подключения ДС) к нему не применяются; без этого
    черновик окна краснил гейт как экран, пока его не вшили (RE0022 О10 п. 8).
    Файл с `<!DOCTYPE`/`<html>` фрагментом не считается и здесь: целый документ
    в `widgets/` — ошибка, и молча перестать его проверять нельзя (Л100). */
export function isWidgetFragment(file, P = PRJ) {
  const abs = path.resolve(file);
  const rel = path.relative(P.root || REPO, abs).split(path.sep).join('/');
  const apps = P.appsDir || 'apps';
  const widgets = (P.appShape && P.appShape.widgets) || 'widgets';
  if (!rel.startsWith(apps + '/') || !/\.html$/i.test(rel) || /\.preview\.html$/i.test(rel)) return false;
  if (P.showcase && (rel + '/').startsWith(P.showcase + '/')) return false;
  if (!rel.split('/').slice(1, -1).includes(widgets)) return false;
  let text;
  try { text = stripComments(readFileSync(abs, 'utf8')); } catch { return false; }
  return !/<!DOCTYPE|<html\b/i.test(text);
}

/** Собранный файл источника: `<имя>.html` → `<имя>.preview.html`, если есть. */
export function assembledOf(host) {
  const p = host.replace(/\.html$/, '.preview.html');
  return existsSync(p) ? p : null;
}

/* ---------------- selftest: временное дерево ----------------
   Фикстура Э8 RE0023 — невшитый виджет без каркаса: фрагмент. Рядом — то,
   что фрагментом считаться не должно: целый документ в widgets/, страница в
   pages/, собранный файл, файл витрины. Корпус сенсора лежит вне apps/, поэтому
   вход «файл в widgets/» доказывается здесь, а не парой фикстур сенсора. */
function selftest() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'fragments-'));
  const put = (rel, text) => { const p = path.join(root, rel); mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, text, 'utf8'); return p; };
  const P = { root, appsDir: 'apps', appShape: { widgets: 'widgets' }, showcase: 'apps/local-components' };
  const FRAG = '<div class="modal-scrim" hidden><div class="modal"><h2 class="modal__title">Окно</h2></div></div>\n';
  const cases = [
    ['невшитый виджет без каркаса — фрагмент', put('apps/core/drafts/c/widgets/modals/AModal/AModal.html', FRAG), true],
    ['виджет с комментарием о <!DOCTYPE> — фрагмент', put('apps/core/x-app/widgets/tiles/BTile/BTile.html', '<!-- не <!DOCTYPE html> -->\n' + FRAG), true],
    ['целый документ в widgets/ — не фрагмент', put('apps/core/x-app/widgets/tiles/CTile/CTile.html', '<!DOCTYPE html>\n<html><body></body></html>\n'), false],
    ['страница в pages/ — не фрагмент', put('apps/core/x-app/pages/Main.html', FRAG), false],
    ['собранный файл — не фрагмент', put('apps/core/x-app/widgets/tiles/BTile/BTile.preview.html', FRAG), false],
    ['витрина локальных компонентов — не фрагмент', put('apps/local-components/core/widgets/D.html', FRAG), false],
    ['вне apps/ — не фрагмент', put('docs/widgets/E.html', FRAG), false],
  ];
  let failed = 0;
  const out = ['== fragments --selftest =='];
  try {
    for (const [name, file, want] of cases) {
      const got = isWidgetFragment(file, P);
      if (got !== want) failed++;
      out.push((got === want ? 'ok    ' : 'FAIL  ') + name + (got === want ? '' : ' — получено ' + got));
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  out.push('ВЕРДИКТ: ' + (failed ? 'FAIL (кейсов не прошло: ' + failed + ' из ' + cases.length + ')' : 'OK (кейсов: ' + cases.length + ')'));
  console.log(out.join('\n'));
  return failed ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv.includes('--selftest')) process.exit(selftest());

/* ============================================================
   PROJECT — корень проекта и пути из манифеста project.json.

   Зачем (реструктуризация, шаг Ш4). Сторож, который вычисляет корень как
   «четыре уровня вверх от себя» и зовёт каталоги литералами (`design-system`,
   `Projects`, `Concepts`, `.opencode`), намертво привязан к одному дереву:
   каждый переезд (Ш5–Ш7) ломал бы его молча. Здесь один владелец двух
   ответов для всей оснастки харнеса:
     - где корень — ближайший вверх каталог с project.json;
     - как зовутся каталоги — как записано в манифесте: ДС, харнес, его
       оснастка и адаптер под агентный CLI, состояние гейта, документы, хаб и
       треки приложений.

   Модуль ничего не бросает при импорте: журнал прогонов импортируют мягко и
   инструменты ДС, а ДС обязана проверяться и без проекта. Отсутствие
   манифеста сообщается полем `error`; `need()` превращает его в понятный
   отказ там, где без манифеста работать нельзя. Форму манифеста сторожит
   manifest-check.mjs.
   ============================================================ */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const MANIFEST_FILE = 'project.json';

/** Ближайший вверх каталог с project.json или null. */
export function findRoot(from = HERE) {
  for (let d = path.resolve(from); ; d = path.dirname(d)) {
    if (existsSync(path.join(d, MANIFEST_FILE))) return d;
    if (path.dirname(d) === d) return null;
  }
}

const norm = (p) => (typeof p === 'string' && p.trim() ? p.trim().replace(/\\/g, '/').replace(/\/+$/, '') : null);

/** Строка адреса ДС в файле конфигурации загрузчика: `var DS_PATH = '…';`. */
export const DS_PATH_RX = /\bDS_PATH\s*=\s*(['"])([^'"\n]*)\1/;

/**
 * Каталог ДС от корня по файлу конфигурации (`designSystem.from`): адрес в
 * нём записан от каталога самого файла. { ds } или { error }.
 */
export function dsFromConfig(root, from) {
  const file = path.join(root, from);
  if (!existsSync(file)) return { error: from + ' (designSystem.from) нет на диске' };
  const m = readFileSync(file, 'utf8').match(DS_PATH_RX);
  if (!m || !m[2].trim()) return { error: from + ' — нет строки DS_PATH = \'<путь до ДС>\'' };
  if (/^([a-z][\w+.-]*:|\/)/i.test(m[2])) return { error: from + ' — DS_PATH «' + m[2] + '» не относительный путь: проверкам гейта нужна ДС на диске' };
  const ds = path.relative(root, path.resolve(path.dirname(file), m[2])).split(path.sep).join('/');
  if (!ds || ds.startsWith('..')) return { error: from + ' — DS_PATH «' + m[2] + '» ведёт вне проекта' };
  return { ds };
}

/**
 * Приложения: каталоги с записью `manifest` внутри `appsDir` на любой глубине
 * (разделы `core/`, `ib/` …, их модули `*-app/` и концепты `drafts/<имя>/` —
 * где приложению можно лежать, решает манифест, `appPlaces`, и сторожит
 * registry-check, П8). Внутрь приложения поиск не спускается; `fixtures`,
 * скрытые каталоги и node_modules пропускаются. [{ dir — путь от appsDir,
 * abs }] по порядку dir.
 */
export function findApps(root, appsDir, manifest = 'app.json') {
  const out = [];
  const base = path.join(root, appsDir);
  const walk = (abs, rel) => {
    let list;
    try { list = readdirSync(abs, { withFileTypes: true }); } catch { return; }
    for (const e of list) {
      if (!e.isDirectory() || e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'fixtures') continue;
      const a = path.join(abs, e.name), r = rel ? rel + '/' + e.name : e.name;
      if (existsSync(path.join(a, manifest))) out.push({ dir: r, abs: a });
      else walk(a, r);
    }
  };
  walk(base, '');
  return out.sort((x, y) => (x.dir < y.dir ? -1 : x.dir > y.dir ? 1 : 0));
}

/**
 * Проект с разобранными путями: `x` — от корня слэшами вперёд, `xAbs` —
 * абсолютный. Ошибка чтения — в поле `error`, остальные поля тогда null.
 */
export function project(from = HERE) {
  const root = findRoot(from);
  if (!root) return { error: MANIFEST_FILE + ' не найден ни в одном каталоге выше ' + path.resolve(from), root: null };
  let m;
  try {
    m = JSON.parse(readFileSync(path.join(root, MANIFEST_FILE), 'utf8'));
  } catch (e) {
    return { error: MANIFEST_FILE + ' не читается: ' + e.message, root };
  }
  const abs = (rel) => (rel ? path.join(root, rel) : null);
  /* Путь до ДС: `designSystem.from` — файл конфигурации загрузчика, где
     адрес записан один раз (apps/ds-config.js), либо прямо `mount`. */
  const dsFrom = norm(m.designSystem && m.designSystem.from);
  const dsConf = dsFrom ? dsFromConfig(root, dsFrom) : null;
  const ds = dsConf ? (dsConf.ds || null) : norm(m.designSystem && m.designSystem.mount);
  const kit = norm(m.agentKit && m.agentKit.mount);
  const tools = norm(m.agentKit && m.agentKit.tools);
  const adapter = norm(m.agentKit && m.agentKit.adapter);
  const state = norm(typeof m.state === 'string' ? m.state : m.state && m.state.dir);
  const docs = norm(m.docs);
  /* Черновые каталоги (решение владельца 24.09.2026): рабочие заметки и
     выгрузки, которые периодически чистятся; сторожа их не обходят. */
  const scratch = (Array.isArray(m.scratch) ? m.scratch : typeof m.scratch === 'string' ? [m.scratch] : []).map(norm).filter(Boolean);
  const appsDir = norm(m.apps && m.apps.dir);
  const appsManifest = appsDir ? norm(m.apps.manifest) || 'app.json' : null;
  /* Форма приложения (23–24.09.2026): pages — экраны, widgets — крупные блоки
     (тайлы, таблицы, модалки, контекстные меню, поповеры) по группам, data —
     демо-данные, refs — входящие материалы. Других папок в приложении нет:
     features/ и components/ фронтенда у нас — widgets/; сборка страниц —
     общий сборщик оснастки, не папка приложения. tools — только если манифест
     её объявит. */
  const shape = m.appShape || {};
  const appShape = {
    pages: norm(shape.pages) || 'pages', widgets: norm(shape.widgets) || 'widgets',
    data: norm(shape.data) || 'data', refs: norm(shape.refs) || 'refs', tools: norm(shape.tools),
    /** Группы виджетов (widgets/<группа>/…); null — манифест их не ограничивает. */
    widgetGroups: Array.isArray(shape.widgetGroups) ? shape.widgetGroups.map(norm).filter(Boolean) : null,
  };
  /* Где приложению лежать (23.09.2026): модуль раздела — `<раздел>/<имя>-app/`,
     концепт — `<раздел>/drafts/<имя>/`. null — манифест места не задаёт. */
  const places = m.appPlaces && typeof m.appPlaces === 'object'
    ? { moduleSuffix: norm(m.appPlaces.moduleSuffix) || '-app', drafts: norm(m.appPlaces.drafts) || 'drafts' }
    : null;
  const tracks = (Array.isArray(m.tracks) ? m.tracks : []).map((t) => ({ ...t, dir: norm(t && t.dir) || appsDir }));
  /* Загрузчик ДС (Ш8): экран подключает ДС двумя его тегами, путь до ДС
     записан только в файле конфигурации (designSystem.from) — он же первый
     тег загрузчика (boot.head). */
  const boot = m.boot && typeof m.boot === 'object'
    ? { dir: norm(m.boot.dir), head: norm(m.boot.head), body: norm(m.boot.body) }
    : null;
  const hubPage = norm(m.hub && m.hub.page);
  const hubRegistry = norm(m.hub && m.hub.registry);
  return {
    error: null, root, manifest: m,
    ds, dsAbs: abs(ds), dsFrom, dsError: dsConf && dsConf.error || null,
    kit, kitAbs: abs(kit),
    tools, toolsAbs: abs(tools),
    adapter, adapterAbs: abs(adapter),
    state, stateAbs: abs(state),
    docs, docsAbs: abs(docs), scratch,
    appsDir, appsManifest, appShape, places, tracks,
    /** Приложения на любой глубине apps/: [{ dir, abs }]. */
    apps: () => (appsDir ? findApps(root, appsDir, appsManifest) : []),
    boot, bootAbs: boot ? { head: abs(boot.head), body: abs(boot.body), dir: abs(boot.dir) } : null,
    hubPage, hubRegistry,
    /** Путь от корня проекта, слэшами вперёд. */
    rel: (p) => path.relative(root, path.resolve(root, p)).split(path.sep).join('/'),
  };
}

/** Проект, без которого инструменту работать нельзя: нет манифеста — отказ с кодом 2. */
export function need(tool, from = HERE) {
  const p = project(from);
  if (p.error) {
    console.log('ОШИБКА: ' + tool + ' — ' + p.error + '. Корень проекта — каталог с ' + MANIFEST_FILE + ', его форму проверяет manifest-check.');
    process.exit(2);
  }
  return p;
}

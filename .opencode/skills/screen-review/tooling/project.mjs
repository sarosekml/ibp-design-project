/* ============================================================
   PROJECT — корень проекта и пути из манифеста project.json.

   Зачем (реструктуризация, шаг Ш4). Сторож, который вычисляет корень как
   «четыре уровня вверх от себя» и зовёт каталоги литералами (`DS-IBP`,
   `Projects`, `Concepts`, `.opencode`), намертво привязан к одному дереву:
   каждый переезд (Ш5–Ш7) ломал бы его молча. Здесь один владелец двух
   ответов для всей оснастки харнеса:
     - где корень — ближайший вверх каталог с project.json;
     - как зовутся каталоги — как записано в манифесте: ДС, харнес и его
       оснастка, состояние гейта, документы, хаб и треки приложений.

   Модуль ничего не бросает при импорте: журнал прогонов импортируют мягко и
   инструменты ДС, а ДС обязана проверяться и без проекта. Отсутствие
   манифеста сообщается полем `error`; `need()` превращает его в понятный
   отказ там, где без манифеста работать нельзя. Форму манифеста сторожит
   manifest-check.mjs.
   ============================================================ */
import { existsSync, readFileSync } from 'node:fs';
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
  const ds = norm(m.designSystem && m.designSystem.mount);
  const kit = norm(m.agentKit && m.agentKit.mount);
  const tools = norm(m.agentKit && m.agentKit.tools);
  const state = norm(typeof m.state === 'string' ? m.state : m.state && m.state.dir);
  const docs = norm(m.docs);
  const appsDir = norm(m.apps && m.apps.dir);
  const tracks = (Array.isArray(m.tracks) ? m.tracks : []).map((t) => ({ ...t, dir: norm(t && t.dir) || appsDir }));
  const hubPage = norm(m.hub && m.hub.page);
  const hubRegistry = norm(m.hub && m.hub.registry);
  return {
    error: null, root, manifest: m,
    ds, dsAbs: abs(ds),
    kit, kitAbs: abs(kit),
    tools, toolsAbs: abs(tools),
    state, stateAbs: abs(state),
    docs, docsAbs: abs(docs),
    appsDir, tracks,
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

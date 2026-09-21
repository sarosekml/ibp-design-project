/* ============================================================
   KIT-LINK — связь инструментов ДС с оснасткой агента проекта.

   ДС проверяется и сама по себе, без проекта: линтер, аудит и гейт страницы
   работают. Если же ДС примонтирована в проект, её инструменты пишут журнал
   прогонов агента, узнают фрагменты модульных экранов и зовут раскатку
   docs-split — это модули оснастки харнеса. Где она лежит, говорит манифест
   проекта: `project.json` → `agentKit.tools` (оснастка) и `agentKit.mount`
   (каталог харнеса). До 21.09.2026 здесь были литералы `../../.opencode/…`,
   и каждый переезд харнеса ломал бы их молча (реструктуризация, шаг Ш4).

   Манифест ищется вверх от родителя корня ДС. Импортировать читатель
   манифеста из харнеса нельзя — чтобы его найти, нужен манифест; поэтому
   здесь свой, в несколько строк. Нет проекта или оснастки — функции
   возвращают null, и инструмент работает без журнала: запись в журнал не
   имеет права уронить проверку.
   ============================================================ */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const DS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let cached;
function projectOf() {
  if (cached !== undefined) return cached;
  cached = null;
  for (let d = path.dirname(DS_ROOT); ; d = path.dirname(d)) {
    const f = path.join(d, 'project.json');
    if (existsSync(f)) {
      try { cached = { root: d, m: JSON.parse(readFileSync(f, 'utf8')) }; } catch { cached = null; }
      return cached;
    }
    if (path.dirname(d) === d) return cached;
  }
}

/** Корень проекта, в который примонтирована ДС, или null. */
export function projectRoot() {
  const p = projectOf();
  return p ? p.root : null;
}

/** Файл оснастки агента (`agentKit.tools/<name>`) или null. */
export function kitTool(name) {
  const p = projectOf();
  const tools = p && p.m.agentKit && p.m.agentKit.tools;
  if (!tools) return null;
  const f = path.join(p.root, tools, name);
  return existsSync(f) ? f : null;
}

/** Файл в каталоге харнеса (`agentKit.mount/<rel>`) или null. */
export function kitFile(rel) {
  const p = projectOf();
  const mount = p && p.m.agentKit && p.m.agentKit.mount;
  if (!mount) return null;
  const f = path.join(p.root, mount, rel);
  return existsSync(f) ? f : null;
}

/** Загрузчик ДС проекта (`boot` манифеста): имена файлов тегов экрана
    { head, body } или null. Экран в таком проекте подключает ДС тегами
    загрузчика, а ds.css и ds.js пишет сам загрузчик — линтеру их не видно. */
export function projectBoot() {
  const p = projectOf();
  const b = p && p.m.boot;
  if (!b || typeof b.head !== 'string' || typeof b.body !== 'string') return null;
  return { head: path.basename(b.head), body: path.basename(b.body) };
}

/** Модуль оснастки агента для мягкого импорта или null. */
export async function importKitTool(name) {
  const f = kitTool(name);
  return f ? import(pathToFileURL(f).href) : null;
}

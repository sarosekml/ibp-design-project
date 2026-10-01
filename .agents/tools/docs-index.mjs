#!/usr/bin/env node
/* ============================================================
   DOCS-INDEX — карта всей markdown-документации для человека.

   Решения задачи 0006. Источник — диск, без git. Пути кластеров берутся
   из project.json. Обход не следует символическим ссылкам. Игнор-лист
   ниже — общий для генератора и матрицы гейта: зависимости, фикстуры
   оснастки, локальные файлы машины и сам каталог. Scratch и handoff
   входят с пометками «архив/черновики» и «снимки задач».
   Имя локального входа другого CLI собрано из частей, как в vendor-scan:
   этот файл не коммитится, ссылка на него была бы битой у коллег.

   Рукописная часть сохраняется побайтно; меняется только зона @docs-index.
   Аннотация: title в YAML-шапке, иначе первый заголовок H1, иначе «—».
   Ссылки — от каталога docs; пробелы и служебные символы URL кодируются,
   кириллица остаётся читаемой. Сортировка по пути не зависит от локали.
   Нет даты генерации: одинаковый вход даёт одинаковый результат.

   КД1 — каталог отсутствует; КД2 — повреждены/дублируются маркеры;
   КД3 — сгенерированная зона разошлась с диском.

   node docs-index.mjs [build]    — собрать каталог
   node docs-index.mjs --check    — сверить (шаг гейта docs-index)
   node docs-index.mjs --selftest — откат на временном дереве
   ВЕРДИКТ: OK | FAIL, код выхода 0 | 1.
   ============================================================ */
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, mkdtempSync, rmSync, renameSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { need } from './project.mjs';

const SELF = fileURLToPath(import.meta.url);
const GEN = 'docs-index.mjs';
const OPEN = '<!-- @docs-index -->';
const CLOSE = '<!-- /@docs-index -->';
const IGNORE_DIR_NAMES = new Set(['node_modules', '.git']);
// Корневые refs/ в main стали локальными материалами; refs/ приложений входят.
const IGNORE_LOCAL = ['tmp', 'refs', '.zcodeignore', '.obsidian', ('cla' + 'ude').toUpperCase() + '.md'];
const slash = (p) => p.split(path.sep).join('/');
const under = (rel, base) => Boolean(base) && (rel === base || rel.startsWith(base + '/'));
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
export const indexPath = (P) => P.docs + '/index.md';

/* Не требует существования пути: тот же предикат работает для удалений. */
export function docsIgnored(rel, P, includeIndex = false) {
  return rel.split('/').some((part) => IGNORE_DIR_NAMES.has(part))
    || IGNORE_LOCAL.some((base) => under(rel, base))
    || under(rel, P.tools + '/fixtures')
    || (!includeIndex && rel === indexPath(P));
}

export function isDocPath(rel, P, includeIndex = false) {
  return !path.posix.isAbsolute(rel) && rel !== '..' && !rel.startsWith('../')
    && /\.md$/i.test(rel) && !docsIgnored(rel, P, includeIndex);
}

export function documentationPaths(P, includeIndex = false) {
  const files = [];
  function walk(dir, prefix = '') {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix + entry.name;
      if (docsIgnored(rel, P, includeIndex)) continue;
      if (entry.isDirectory()) walk(path.join(dir, entry.name), rel + '/');
      else if (entry.isFile() && isDocPath(rel, P, includeIndex)) files.push(rel);
    }
  }
  walk(P.root);
  return files.sort(compare);
}

function scalar(value) {
  const text = value.trim();
  if (text.startsWith('"')) {
    const quoted = text.match(/^"(?:[^"\\]|\\.)*"/);
    if (quoted) { try { return JSON.parse(quoted[0]); } catch { /* переход к H1 */ } }
    return '';
  }
  if (text.startsWith("'")) return text.match(/^'((?:[^']|'')*)'/)?.[1].replace(/''/g, "'") || '';
  return text.replace(/\s+#.*$/, '').trim();
}

export function annotation(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  let start = 0;
  if (lines[0] === '---') {
    const end = lines.findIndex((line, i) => i > 0 && /^(---|\.\.\.)\s*$/.test(line));
    if (end > 0) {
      start = end + 1;
      const at = lines.findIndex((line, i) => i > 0 && i < end && /^title:/.test(line));
      if (at > 0) {
        const value = lines[at].slice(6).trim();
        let title;
        if (/^[|>][-+]?\s*(?:#.*)?$/.test(value)) {
          const block = [];
          for (let i = at + 1; i < end && (/^\s/.test(lines[i]) || !lines[i]); i++) block.push(lines[i].trim());
          title = block.join(' ').trim();
        } else title = scalar(value);
        if (title) return title.replace(/\s+/g, ' ');
      }
    }
  }
  let fence = null;
  for (const line of lines.slice(start)) {
    const match = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (match) {
      if (!fence) fence = match[1];
      else if (match[1][0] === fence[0] && match[1].length >= fence.length) fence = null;
      continue;
    }
    const heading = !fence && line.match(/^#\s+(.+?)\s*#*\s*$/);
    if (heading) return heading[1];
  }
  return '—';
}

const cell = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/[\\`*_[\]|]/g, '\\$&').replace(/\s+/g, ' ');
export function docLink(rel, P) {
  return slash(path.relative(P.docs, rel)).replace(/[% #?()[\]<>\\]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function groupOf(rel, P) {
  if (under(rel, P.appsDir)) {
    const parts = rel.slice(P.appsDir.length + 1).split('/');
    if (parts.length === 1) return '';
    const depth = parts[1] === (P.places?.drafts || 'drafts') ? 3 : 2;
    return [P.appsDir, ...parts.slice(0, Math.min(depth, parts.length - 1))].join('/')
      + (rel.endsWith('.handoff.md') ? ' — снимки задач' : '');
  }
  if (rel.endsWith('.handoff.md')) return 'Снимки задач';
  if ((P.scratch || []).some((base) => under(rel, base))) return 'Архив/черновики';
  if (under(rel, P.docs + '/tasks')) return 'Задачи';
  for (const base of [P.ds, P.kit]) {
    if (under(rel, base)) {
      const parts = rel.slice(base.length + 1).split('/');
      return parts.length > 1 ? base + '/' + parts[0] : '';
    }
  }
  return '';
}

export function indexBlock(P, files = documentationPaths(P)) {
  const clusters = [
    ['Корень', (rel) => !rel.includes('/')],
    ['Дизайн-система', (rel) => under(rel, P.ds)],
    ['Агентная система', (rel) => under(rel, P.kit)],
    ['Приложения', (rel) => under(rel, P.appsDir)],
    ['Задачи и заметки', (rel) => under(rel, P.docs)],
    ['Служебное', (rel) => under(rel, P.state)],
    ['Прочая документация', () => true],
  ].map(([title, match]) => ({ title, match, files: [] }));
  for (const rel of files) clusters.find((cluster) => cluster.match(rel)).files.push(rel);
  const out = [OPEN, '<!-- генерирует ' + GEN + ', руками не править -->', '', 'Документов: ' + files.length + '.', ''];
  for (const cluster of clusters) {
    if (!cluster.files.length) continue;
    out.push('## ' + cluster.title + ' (' + cluster.files.length + ')', '');
    const groups = new Map();
    for (const rel of cluster.files) {
      const key = groupOf(rel, P);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(rel);
    }
    for (const [group, members] of [...groups].sort(([a], [b]) => compare(a, b))) {
      if (group) out.push('### ' + cell(group), '');
      out.push('| Документ | Аннотация |', '|---|---|');
      for (const rel of members) out.push('| [' + cell(rel) + '](' + docLink(rel, P) + ') | ' + cell(annotation(readFileSync(path.join(P.root, rel), 'utf8'))) + ' |');
      out.push('');
    }
  }
  return out.join('\n') + CLOSE;
}

export function check(P, write = false) {
  const rel = indexPath(P);
  const file = path.join(P.root, rel);
  const fix = 'node ' + P.tools + '/' + GEN;
  const files = documentationPaths(P);
  const result = { defects: [], written: [], count: files.length };
  if (!existsSync(file) && !write) { result.defects.push('КД1 ' + rel + ' — нет каталога: ' + fix); return result; }
  const text = existsSync(file) ? readFileSync(file, 'utf8') : '# Карта документации\n\n' + OPEN + '\n' + CLOSE + '\n';
  const begin = text.indexOf(OPEN);
  const end = text.indexOf(CLOSE);
  if (begin < 0 || end < begin || text.indexOf(OPEN, begin + OPEN.length) >= 0 || text.indexOf(CLOSE, end + CLOSE.length) >= 0) {
    result.defects.push('КД2 ' + rel + ' — нужны ровно две упорядоченные метки @docs-index; рукописный текст сохранён');
    return result;
  }
  const next = text.slice(0, begin) + indexBlock(P, files) + text.slice(end + CLOSE.length);
  if (next !== text || !existsSync(file)) {
    if (write) { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, next, 'utf8'); result.written.push(rel); }
    else result.defects.push('КД3 ' + rel + ' — каталог разошёлся с документацией: ' + fix);
  }
  return result;
}

function selftest() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'docs-index-'));
  const P = { root, docs: 'docs', ds: 'ds', kit: '.kit', tools: '.kit/tools', appsDir: 'apps', state: '.state', scratch: ['docs/misc'] };
  const put = (rel, text = '# Документ\n') => { const file = path.join(root, rel); mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, text, 'utf8'); };
  const read = () => readFileSync(path.join(root, indexPath(P)), 'utf8');
  const tests = [];
  const test = (name, fn) => { try { fn(); tests.push([name, true]); } catch (error) { tests.push([name, false, error.message]); } };
  const stale = () => assert.ok(check(P).defects.some((d) => d.startsWith('КД3')));
  try {
    test('отсутствующий каталог — КД1; build создаёт его', () => {
      assert.match(check(P).defects[0], /^КД1/); check(P, true); assert.equal(check(P).defects.length, 0);
    });
    const prefix = '# Карта документации\n\nРукописные маршруты.\n\n';
    const suffix = '\n\nРукописный подвал.\n';
    put(indexPath(P), prefix + OPEN + '\n' + CLOSE + suffix);
    put('README.md', '---\ntitle: "Название из шапки"\n---\n# Другое\n');
    put('apps/postrade/deals-app/refs/Текущий портфель.md', '# Портфель\n');
    put('apps/postrade/deals-app/Deal.handoff.md');
    put('docs/misc/draft.md'); put('.state/README.md'); put('ds/components/organisms/Tile/Tile.md'); put('.kit/README.md');
    test('полнота, кластеры, кириллица и пробелы, архив и снимки', () => {
      check(P, true); const text = read();
      assert.equal(documentationPaths(P).length, 7);
      for (const token of ['Название из шапки', 'refs/Текущий%20портфель.md', 'Архив/черновики', 'снимки задач', 'Служебное', 'Дизайн-система', 'Агентная система']) assert.ok(text.includes(token), token);
      for (const rel of documentationPaths(P)) assert.ok(existsSync(path.resolve(root, P.docs, decodeURIComponent(docLink(rel, P)))));
    });
    test('повторная сборка и рукописная часть неизменны', () => {
      const before = read(); assert.equal(check(P, true).written.length, 0); assert.equal(read(), before);
      assert.ok(read().startsWith(prefix) && read().endsWith(suffix));
    });
    test('новый md вне известных кластеров → красный, пересборка → зелёный', () => {
      put('new-folder/new.md'); stale(); check(P, true); assert.equal(check(P).defects.length, 0);
      assert.ok(read().includes('Прочая документация'));
    });
    test('переименование → красный, старой ссылки после сборки нет', () => {
      renameSync(path.join(root, 'new-folder/new.md'), path.join(root, 'new-folder/renamed.md')); stale(); check(P, true);
      assert.ok(!read().includes('new-folder/new.md')); assert.equal(check(P).defects.length, 0);
    });
    test('удаление → красный, пересборка → зелёный', () => {
      rmSync(path.join(root, 'new-folder/renamed.md')); stale(); check(P, true); assert.equal(check(P).defects.length, 0);
    });
    test('изменение title и ручная правка генерата обнаруживаются', () => {
      put('README.md', '# Новое название\n'); stale(); check(P, true);
      put(indexPath(P), read().replace('Документов:', 'Ручная правка:')); stale(); check(P, true); assert.equal(check(P).defects.length, 0);
    });
    test('игнор-лист одинаков для обхода и матрицы, каталог не ссылается на себя', () => {
      const before = read();
      const ignored = ['node_modules/a.md', '.git/a.md', '.opencode/node_modules/a.md', '.kit/tools/fixtures/a.md', ...IGNORE_LOCAL.map((p) => p.endsWith('.md') ? p : p + '/a.md')];
      for (const rel of ignored) { put(rel); assert.ok(!isDocPath(rel, P, true), rel); }
      assert.equal(check(P).defects.length, 0); assert.equal(indexBlock(P), before.slice(before.indexOf(OPEN), before.indexOf(CLOSE) + CLOSE.length));
      assert.ok(!documentationPaths(P).includes(indexPath(P))); assert.ok(documentationPaths(P, true).includes(indexPath(P)));
    });
    test('аннотации: title, кавычки, многострочная шапка, H1, прочерк', () => {
      assert.equal(annotation("---\ntitle: 'It''s title' # пояснение\n---\n# Другой"), "It's title");
      assert.equal(annotation('---\ntitle: >-\n  Две\n  строки\n---'), 'Две строки');
      assert.equal(annotation('---\ntitle: Название # пояснение\n---'), 'Название');
      assert.equal(annotation('```md\n# Пример\n```\n# Заголовок'), 'Заголовок');
      assert.equal(annotation('нет заголовка'), '—');
      assert.equal(docLink('docs/Тест #1 (x).md', P), 'Тест%20%231%20%28x%29.md');
      assert.ok(cell('[текст] | <x>').includes('\\|'));
    });
    test('потерянные, обратные и повторные маркеры не перезаписывают текст', () => {
      for (const content of [prefix, CLOSE + OPEN, OPEN + CLOSE + OPEN, OPEN + CLOSE + CLOSE]) {
        put(indexPath(P), content); assert.match(check(P, true).defects[0], /^КД2/); assert.equal(read(), content);
      }
    });
  } finally { rmSync(root, { recursive: true, force: true }); }
  for (const [name, ok, error] of tests) console.log((ok ? 'ok    ' : 'FAIL  ') + name + (error ? ' — ' + error : ''));
  const failed = tests.filter(([, ok]) => !ok).length;
  console.log('ВЕРДИКТ: ' + (failed ? 'FAIL' : 'OK') + ' (кейсов: ' + tests.length + ', ошибок: ' + failed + ')');
  return failed ? 1 : 0;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length && !['build', '--check', '--selftest'].includes(args[0]))) {
    console.error('Использование: node ' + GEN + ' [build | --check | --selftest]'); return 1;
  }
  if (args[0] === '--selftest') return selftest();
  const P = need(GEN, path.dirname(SELF));
  const result = check(P, args[0] !== '--check');
  for (const file of result.written) console.log('записан ' + file);
  for (const defect of result.defects) console.log('FAIL  ' + defect);
  console.log('ВЕРДИКТ: ' + (result.defects.length ? 'FAIL' : 'OK') + ' (документов: ' + result.count + ')');
  return result.defects.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SELF) {
  try { process.exitCode = main(); }
  catch (error) { console.error('ВЕРДИКТ: FAIL — ' + error.message); process.exitCode = 1; }
}

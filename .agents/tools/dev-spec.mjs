#!/usr/bin/env node
/* ============================================================
   DEV-SPEC — спецификация на разработку: md + автономный html
   со снимками состояний прототипа (задача RE0016).

   Исходник — `<приложение>/refs/<Spec>/<Spec>.dev-spec.md` (концепт
   `apps/postrade/drafts/dev-specs/`): front matter со списком снимков и
   текст по шаблону `.agents/skills/dev-spec/references/template.md`.
   Результат — генерат `<приложение>/data/<Spec>.dev-spec.js`
   (`window.DEV_SPECS.push({ … md, html })`) и индекс `data/dev-specs.js`;
   страница концепта показывает спеку и выгружает папку `<Spec>/` с
   `<Spec>.md` и `<Spec>.html`. Руками генераты не правятся.

   Снимок — не растр, а замороженный DOM состояния: разметка на момент
   съёмки без скриптов, стили ДС — только правила, которые находят что-то
   на снимках, шрифты и картинки — data-URI. Кадр с target — цель и цепочка
   её предков без соседей; цель закреплена в левом верхнем углу кадра со
   снятыми со страницы шириной и высотой (размер идёт в подпись). Без
   target — экран целиком (height: full — во всю высоту прокрутки).

   Съёмку делает браузер человека: инструмент поднимает локальный сервер и
   печатает адрес служебной страницы; она открывает каждое состояние в
   iframe размера viewport, проигрывает действия do (язык flows.yaml панели
   прототипа) и отдаёт снимок серверу. Браузер скриптом не запускается —
   правила процесса §9 (headless в контуре не согласуется). Дата и
   Math.random на страницах заморожены (injectFreeze из page-snapshot.mjs).

   Формат front matter (YAML — разбор ядром панели, core.js):
     spec: RsbuInterestAdjustments     имя файла без .dev-spec.md
     title: …                          название сценария
     module: postrade/deals-app        модуль, чьи страницы снимаются (apps/<module>/pages/)
     version: "1.000"   date: "12.10.2026"   designer: …
     sources: [пути от корня проекта]  откуда взяты факты: спеки экранов, паспорта
     viewport: 1920x1080
     snaps:
       - id: tile-none                 латиница, цифры, дефис
         title: Тайл — корректировок нет
         page: Tranche.preview.html?…  файл в pages/ модуля с параметрами
         target: '#tile-rsbu-adjustments'   кадр; нет — экран целиком
         mark: '#…'                    обвести на снимке (необязательно)
         height: full                  только для экрана: во всю высоту прокрутки
         note: …                       подпись под снимком (необязательно)
         do: [действия flows.yaml]     click, fill, press, hover, focus, scroll, waitFor, wait

   Маркеры в тексте: `<!-- snap: id -->` — снимок; `<!-- snaps: a b c -->` —
   галерея в ряд. Разделы `## 1. Коротко` … `## 7. Открытые вопросы` — канон
   шаблона (SECTIONS ниже).

   Коды:
     СР1 — файл и front matter: место, имя, разбор YAML, поля
     СР2 — снимки: id, title, viewport, height
     СР3 — страница снимка: нет файла, источник с метками <ds-include>
     СР4 — селекторы target, mark и действий do не встречаются в странице
     СР5 — текст: маркер ведёт на необъявленный снимок, снимок не использован,
           нет раздела шаблона, нет заголовка «# …»
     СР6 — съёмка: страница не открылась, цель не найдена, ошибки JS

   Использование (из корня проекта):
     node .agents/tools/dev-spec.mjs <spec.dev-spec.md> --check   только проверки
     node .agents/tools/dev-spec.mjs <spec.dev-spec.md>           проверки → съёмка → генерат
         [--port 8766] [--settle 700] [--only id,id] [--out <папка>]
         --only — переснять часть снимков, остальные берутся из генерата;
         --out — дополнительно записать папку <Spec>/ с двумя файлами
     node .agents/tools/dev-spec.mjs <spec.dev-spec.md> --text    пересобрать текст без съёмки
     node .agents/tools/dev-spec.mjs --selftest
   Строка `ВЕРДИКТ: OK | FAIL`, код выхода 0 | 1; без манифеста — 2.
   Шага в гейте нет (как у карты экранов): проверка — здесь.
   ============================================================ */

import { createServer } from 'node:http';
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { need } from './project.mjs';
import { loadCore, pageFile, pageProblem, pageCorpus, classText, dsCorpus, selectorMisses, selectorDefects } from './proto-panel.mjs';
import { injectFreeze } from './page-snapshot.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SELF = path.resolve(fileURLToPath(import.meta.url));

const SUFFIX = '.dev-spec.md';
const SPEC_RX = /^[A-Z][A-Za-z0-9]*$/;
const VIEWPORT_RX = /^(\d{3,4})x(\d{3,4})$/;
const FIELDS = ['spec', 'title', 'module', 'version', 'date', 'designer', 'sources', 'viewport', 'snaps'];
const SNAP_FIELDS = ['id', 'title', 'page', 'target', 'mark', 'height', 'note', 'do'];
const SECTIONS = ['Коротко', 'Сценарий', 'Экраны', 'Новые локальные компоненты', 'Данные и API', 'Тексты', 'Открытые вопросы'];
const MARK_RX = /<!--\s*(snaps?)\s*:\s*([^>]*?)\s*-->/g;
const THEME = 'IBP Legacy';
const INDEX = 'dev-specs.js';
const MIME = {
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.otf': 'font/otf', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2',
};
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', ...MIME,
};

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slash = (p) => p.split(path.sep).join('/');

/* ---------------- исходник: front matter и проверки ---------------- */

/** Текст исходника → { fm, fmLines, body, bodyLine } | { error }. */
export function splitSource(src) {
  const text = src.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const m = /^---\n([\s\S]*?)\n---[ \t]*(\n|$)/.exec(text);
  if (!m) return { error: 'нет front matter: файл начинается с «---», затем поля спеки и снимки, затем «---»' };
  return { fm: m[1], body: text.slice(m[0].length), bodyLine: m[1].split('\n').length + 3 };
}

/**
 * Front matter → { spec, errors: [{ code, line, text }] }. Синтаксис — parseYaml
 * ядра панели, поля и действия — его читатель схемы: тот же язык, что у
 * flows.yaml и map.yaml.
 */
export function readFrontMatter(core, fm) {
  const errors = [];
  const parsed = core.parseYaml(fm);
  const shift = (line) => (line || 1) + 1;   // строка 1 файла — «---»
  if (parsed.error) return { spec: null, errors: [{ code: 'СР1', line: shift(parsed.error.line), text: parsed.error.text }] };
  const R = core.schemaReader(errors, 'СР1');
  const root = parsed.node;
  if (!root || root.kind !== 'map') { R.err(root, 'front matter — словарь полей: ' + FIELDS.join(', ')); return { spec: null, errors: errors.map((e) => ({ ...e, line: shift(e.line) })) }; }
  const f = R.fields(root, FIELDS, 'front matter');
  const req = (k, what) => {
    if (!f[k]) { R.err(root, 'нет ' + k + ' — ' + what); return null; }
    return R.str(f[k], k, true, true);
  };
  const spec = {
    spec: req('spec', 'имя спеки латиницей, как у файла (RsbuInterestAdjustments)'),
    title: req('title', 'название сценария'),
    module: req('module', 'модуль, чьи страницы снимаются: <раздел>/<имя>-app'),
    version: f.version ? R.str(f.version, 'version', true, true) : null,
    date: f.date ? R.str(f.date, 'date', true, true) : null,
    designer: f.designer ? R.str(f.designer, 'designer', false, true) : null,
    sources: [],
    viewport: null,
    snaps: [],
    at: { spec: f.spec ? f.spec.line : 1, module: f.module ? f.module.line : 1, sources: [] },
  };
  if (spec.spec && !SPEC_RX.test(spec.spec)) R.err(f.spec.value, 'spec — имя латиницей с заглавной, без пробелов (RsbuInterestAdjustments)', f.spec.line);
  const vp = f.viewport ? R.str(f.viewport, 'viewport', true, true) : '1920x1080';
  const vm1 = vp && VIEWPORT_RX.exec(vp);
  if (vp && !vm1) errors.push({ code: 'СР2', line: f.viewport.line, text: 'viewport «' + vp + '» — ширина x высота в px (1920x1080)' });
  else if (vm1) spec.viewport = { w: Number(vm1[1]), h: Number(vm1[2]) };
  if (f.sources) {
    const sv = f.sources.value;
    if (sv.kind === 'seq') sv.items.forEach((it) => {
      if (it.kind !== 'scalar' || typeof it.value !== 'string' || !it.value.trim()) { R.err(it, 'sources — пути от корня проекта строками'); return; }
      spec.sources.push(it.value.trim());
      spec.at.sources.push(it.line);
    });
    else if (!(sv.kind === 'scalar' && sv.value === null)) R.err(sv, 'sources — список путей от корня проекта', f.sources.line);
  }
  if (!f.snaps) R.err(root, 'нет snaps — списка снимков');
  else if (f.snaps.value.kind !== 'seq') R.err(f.snaps.value, 'snaps — список снимков', f.snaps.line);
  else {
    const ids = Object.create(null);
    f.snaps.value.items.forEach((sn, si) => {
      if (sn.kind !== 'map') { R.err(sn, 'снимок ' + (si + 1) + ' — словарь: id, title, page, target, do'); return; }
      const where = R.named(sn, 'снимок', si + 1);
      const sf = R.fields(sn, SNAP_FIELDS, where);
      let id = null;
      if (!sf.id) R.err(sn, where + ': нет id');
      else {
        id = R.str(sf.id, where + ', id', true, true);
        if (id !== null && !core.ID_RX.test(id)) { errors.push({ code: 'СР2', line: sf.id.line, text: where + ': id — латиница в нижнем регистре, цифры и дефис (tile-none)' }); id = null; }
        else if (id !== null && ids[id]) { errors.push({ code: 'СР2', line: sf.id.line, text: where + ': id повторяется (впервые — строка ' + shift(ids[id]) + ')' }); id = null; }
        else if (id !== null) ids[id] = sf.id.line;
      }
      if (!sf.title) errors.push({ code: 'СР2', line: sn.line, text: where + ': нет title — подписи снимка' });
      if (!sf.page) R.err(sn, where + ': нет page — файла в pages/ модуля');
      const s = {
        id, title: sf.title ? R.str(sf.title, where + ', title', true, true) : null,
        page: sf.page ? R.str(sf.page, where + ', page', true, true) : null,
        target: sf.target ? R.str(sf.target, where + ', target', true, true) : null,
        mark: sf.mark ? R.str(sf.mark, where + ', mark', true, true) : null,
        height: sf.height ? R.str(sf.height, where + ', height', true, true) : null,
        note: sf.note ? R.str(sf.note, where + ', note', false, false) : null,
        do: [], line: sn.line,
        at: { page: sf.page ? sf.page.line : sn.line, target: sf.target ? sf.target.line : sn.line, mark: sf.mark ? sf.mark.line : sn.line, actions: [] },
      };
      if (s.height && s.height !== 'full') errors.push({ code: 'СР2', line: sf.height.line, text: where + ': height — только full (во всю высоту прокрутки); без поля — высота viewport' });
      if (s.height && s.target) errors.push({ code: 'СР2', line: sf.height.line, text: where + ': height — только у снимка экрана целиком; у кадра с target высоту даёт сама цель' });
      if (sf.do) {
        const dn = sf.do.value;
        if (dn.kind === 'seq') dn.items.forEach((an, ai) => {
          const a = R.action(an, where + ', действие ' + (ai + 1));
          if (a) { s.do.push(a); s.at.actions.push(an.line); }
        });
        else if (!(dn.kind === 'scalar' && dn.value === null)) R.err(dn, where + ': do — список действий', sf.do.line);
      }
      spec.snaps.push(s);
    });
  }
  errors.forEach((e) => { e.line = shift(e.line); });
  for (const s of spec.snaps) {
    s.line = shift(s.line);
    for (const k of Object.keys(s.at)) s.at[k] = Array.isArray(s.at[k]) ? s.at[k].map(shift) : shift(s.at[k]);
  }
  spec.at.spec = shift(spec.at.spec); spec.at.module = shift(spec.at.module); spec.at.sources = spec.at.sources.map(shift);
  errors.sort((a, b) => a.line - b.line);
  return { spec, errors };
}

/** Маркеры текста по порядку: [{ kind: snap|snaps, ids, line }]. */
export function markersOf(body, bodyLine = 1) {
  const out = [];
  let inCode = false;
  body.split('\n').forEach((ln, i) => {
    if (/^\s*```/.test(ln)) inCode = !inCode;
    if (inCode) return;
    for (const m of ln.matchAll(MARK_RX)) out.push({ kind: m[1], ids: m[2].split(/[\s,]+/).filter(Boolean), line: bodyLine + i });
  });
  return out;
}

/** Номера снимков — по первому появлению в тексте: { id → n }. */
export function numberSnaps(markers) {
  const num = Object.create(null);
  let n = 0;
  for (const m of markers) for (const id of m.ids) if (!(id in num)) num[id] = ++n;
  return num;
}

/** Проверки текста (СР5): [{ code, line, text }]. */
export function bodyDefects(spec, body, bodyLine) {
  const out = [];
  const lines = body.split('\n');
  const h1 = lines.findIndex((l) => /^#\s+\S/.test(l));
  if (h1 < 0) out.push({ code: 'СР5', line: bodyLine, text: 'нет заголовка «# <название>» — первой строкой текста' });
  const heads = lines.map((l, i) => ({ m: /^##\s+(\d+)\.\s+(.+?)\s*$/.exec(l), line: bodyLine + i })).filter((x) => x.m);
  SECTIONS.forEach((name, i) => {
    const h = heads.find((x) => x.m[2].replace(/\s*\(.*\)$/, '') === name);
    if (!h) out.push({ code: 'СР5', line: bodyLine, text: 'нет раздела «## ' + (i + 1) + '. ' + name + '» — разделы шаблона обязательны; нечего сказать — строка «Нет.»' });
    else if (Number(h.m[1]) !== i + 1) out.push({ code: 'СР5', line: h.line, text: 'раздел «' + name + '» — номер ' + (i + 1) + ', а не ' + h.m[1] });
  });
  const declared = new Set(spec.snaps.map((s) => s.id).filter(Boolean));
  const used = new Set();
  for (const m of markersOf(body, bodyLine)) {
    if (!m.ids.length) out.push({ code: 'СР5', line: m.line, text: 'маркер без id снимка: <!-- ' + m.kind + ': id -->' });
    if (m.kind === 'snap' && m.ids.length > 1) out.push({ code: 'СР5', line: m.line, text: 'snap — один снимок; несколько в ряд — <!-- snaps: ' + m.ids.join(' ') + ' -->' });
    for (const id of m.ids) {
      if (!declared.has(id)) out.push({ code: 'СР5', line: m.line, text: 'снимка «' + id + '» нет в snaps' });
      used.add(id);
    }
  }
  for (const s of spec.snaps) if (s.id && !used.has(s.id)) out.push({ code: 'СР5', line: s.line, text: 'снимок «' + s.id + '» объявлен, но в тексте нет его маркера' });
  return out;
}

/** Где лежит спека и куда писать: { appAbs, dataAbs } | { error }. */
export function placeOf(specAbs, P) {
  const dir = path.dirname(specAbs);
  const refs = path.dirname(dir);
  const appAbs = path.dirname(refs);
  const base = path.basename(specAbs);
  if (!base.endsWith(SUFFIX)) return { error: 'файл спеки — <Spec>' + SUFFIX };
  if (path.basename(refs) !== P.appShape.refs || path.basename(dir) !== base.slice(0, -SUFFIX.length) || !existsSync(path.join(appAbs, P.appsManifest))) {
    return { error: 'спека лежит в <приложение>/' + P.appShape.refs + '/<Spec>/<Spec>' + SUFFIX + ' (у приложения есть ' + P.appsManifest + ')' };
  }
  return { appAbs, dataAbs: path.join(appAbs, P.appShape.data) };
}

/** Полная проверка исходника: { spec, body, bodyLine, defects, place, pagesAbs }. */
export function checkSpec(P, core, specAbs, lazyDs) {
  const defects = [];
  const at = (line) => P.rel(specAbs) + ':' + line;
  const push = (e) => defects.push(e.code + ' ' + at(e.line) + ' — ' + e.text);
  if (!existsSync(specAbs)) { defects.push('СР1 ' + P.rel(specAbs) + ' — файла нет'); return { defects }; }
  const place = placeOf(specAbs, P);
  if (place.error) defects.push('СР1 ' + P.rel(specAbs) + ' — ' + place.error);
  const split = splitSource(readFileSync(specAbs, 'utf8'));
  if (split.error) { defects.push('СР1 ' + at(1) + ' — ' + split.error); return { defects }; }
  const { spec, errors } = readFrontMatter(core, split.fm);
  errors.forEach(push);
  if (!spec) return { defects };
  const name = path.basename(specAbs).slice(0, -SUFFIX.length);
  if (spec.spec && spec.spec !== name) push({ code: 'СР1', line: spec.at.spec, text: 'spec «' + spec.spec + '», а файл — ' + name + SUFFIX });
  spec.sources.forEach((s, i) => { if (!existsSync(path.join(P.root, s))) push({ code: 'СР1', line: spec.at.sources[i], text: 'источника ' + s + ' нет — путь от корня проекта' }); });
  bodyDefects(spec, split.body, split.bodyLine).forEach(push);
  let pagesAbs = null;
  if (spec.module) {
    const modAbs = path.join(P.root, P.appsDir, spec.module);
    pagesAbs = path.join(modAbs, P.appShape.pages);
    if (!existsSync(path.join(modAbs, P.appsManifest))) { push({ code: 'СР1', line: spec.at.module, text: 'module «' + spec.module + '» — нет приложения ' + P.appsDir + '/' + spec.module + '/' }); pagesAbs = null; }
  }
  if (pagesAbs) {
    const sectionAbs = path.join(P.root, P.appsDir, spec.module.split('/')[0]);
    const corpora = new Map();
    for (const s of spec.snaps) {
      if (!s.page) continue;
      const prob = pageProblem(s.page, pagesAbs);
      if (prob) { push({ code: 'СР3', line: s.at.page, text: 'снимок ' + s.id + ': ' + prob }); continue; }
      const abs = path.join(pagesAbs, pageFile(s.page));
      if (!corpora.has(abs)) { const text = pageCorpus(abs, sectionAbs); corpora.set(abs, { file: pageFile(s.page), text, classes: classText(text) }); }
      const entry = corpora.get(abs);
      const sel = (what, target, line) => selectorDefects('СР4 ' + at(line) + ' — снимок ' + s.id + ', ' + what, selectorMisses(core, target, entry, lazyDs), entry.file).forEach((d) => defects.push(d));
      if (s.target) sel('target', s.target, s.at.target);
      if (s.mark) sel('mark', s.mark, s.at.mark);
      s.do.forEach((a, i) => { if (a.target) sel('действие ' + (i + 1) + ' (' + core.describeAction(a) + ')', a.target, s.at.actions[i]); });
    }
  }
  return { spec, body: split.body, bodyLine: split.bodyLine, defects, place, pagesAbs };
}

/* ---------------- markdown → html ---------------- */

/** Строчная разметка: `код`, **жирный**, *курсив*, [ссылка](адрес). */
export function inline(s) {
  const codes = [];
  let t = String(s).replace(/`([^`]+)`/g, (m, c) => { codes.push('<code>' + esc(c) + '</code>'); return '\u0000' + (codes.length - 1) + '\u0000'; });
  t = esc(t)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, txt, href) => '<a href="' + href + '">' + txt + '</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
  return t.replace(/\u0000(\d+)\u0000/g, (m, i) => codes[Number(i)]);
}

function cells(row) {
  const out = [];
  let cur = '', code = false;
  const s = row.trim().replace(/^\|/, '').replace(/\|$/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\' && s[i + 1] === '|') { cur += '|'; i++; continue; }
    if (c === '`') code = !code;
    if (c === '|' && !code) { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  out.push(cur.trim());
  return out;
}

const LIST_RX = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const isTableSep = (l) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(l);

export function slugOf(text, seen) {
  let s = String(text).toLowerCase().replace(/<[^>]+>/g, '').replace(/[`*_[\]()«»"'.,:;!?№/\\]/g, '').trim().replace(/\s+/g, '-') || 'section';
  const base = s;
  let n = 1;
  while (seen.has(s)) s = base + '-' + (++n);
  seen.add(s);
  return s;
}

/**
 * Markdown → html. ctx: { snap(marker) → html — маркер снимка, heads — куда
 * складывать заголовки для оглавления [{ level, id, text }], seen — занятые id }.
 */
export function mdToHtml(md, ctx = {}) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const heads = ctx.heads || [];
  const seen = ctx.seen || new Set();
  const out = [];
  let i = 0;
  const blockStart = (l) => /^\s*```/.test(l) || /^#{1,6}\s/.test(l) || /^\s*>/.test(l) || LIST_RX.test(l) || /^\s*\|/.test(l) || /^\s*<!--/.test(l) || /^\s*(-{3,}|\*{3,})\s*$/.test(l);
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (/^\s*```/.test(l)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push('<pre><code>' + esc(buf.join('\n')) + '</code></pre>');
      continue;
    }
    if (/^\s*<!--/.test(l)) {
      const one = l.match(MARK_RX);
      if (one && ctx.snap) { MARK_RX.lastIndex = 0; for (const m of l.matchAll(MARK_RX)) out.push(ctx.snap({ kind: m[1], ids: m[2].split(/[\s,]+/).filter(Boolean) })); i++; continue; }
      while (i < lines.length && !/-->/.test(lines[i])) i++;
      i++;
      continue;
    }
    const h = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(l);
    if (h) {
      const level = h[1].length;
      const id = slugOf(h[2], seen);
      heads.push({ level, id, text: h[2] });
      out.push('<h' + level + ' id="' + id + '">' + inline(h[2]) + '</h' + level + '>');
      i++;
      continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
    if (/^\s*\|/.test(l) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = cells(l);
      const align = cells(lines[i + 1]).map((c) => (/^:-+:$/.test(c) ? 'center' : /-:$/.test(c) ? 'right' : null));
      i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(cells(lines[i++]));
      const td = (tag, c, k) => '<' + tag + (align[k] ? ' style="text-align:' + align[k] + '"' : '') + '>' + inline(c) + '</' + tag + '>';
      out.push('<div class="sp-table"><table><thead><tr>' + head.map((c, k) => td('th', c, k)).join('') + '</tr></thead><tbody>'
        + rows.map((r) => '<tr>' + head.map((x, k) => td('td', r[k] == null ? '' : r[k], k)).join('') + '</tr>').join('') + '</tbody></table></div>');
      continue;
    }
    if (/^\s*>/.test(l)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ''));
      out.push('<blockquote>' + mdToHtml(buf.join('\n'), { ...ctx, heads: [], seen }) + '</blockquote>');
      continue;
    }
    if (LIST_RX.test(l)) {
      const r = list(lines, i, ctx, seen);
      out.push(r.html);
      i = r.next;
      continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !(buf.length && blockStart(lines[i]))) buf.push(lines[i++].trim());
    out.push('<p>' + inline(buf.join(' ')) + '</p>');
  }
  return out.join('\n');
}

function list(lines, i, ctx, seen) {
  const first = LIST_RX.exec(lines[i]);
  const indent = first[1].length;
  const ordered = /\d/.test(first[2]);
  const start = ordered ? parseInt(first[2], 10) : 1;
  const items = [];
  while (i < lines.length) {
    const m = LIST_RX.exec(lines[i]);
    if (!m || m[1].length !== indent || /\d/.test(m[2]) !== ordered) break;
    const body = [m[3]];
    i++;
    while (i < lines.length) {
      const ln = lines[i];
      if (!ln.trim()) {
        const nx = lines[i + 1];
        if (nx !== undefined && nx.trim() && (nx.length - nx.trimStart().length) > indent) { body.push(''); i++; continue; }
        break;
      }
      const lead = ln.length - ln.trimStart().length;
      const lm = LIST_RX.exec(ln);
      if (lm && lead <= indent) break;
      if (!lm && lead <= indent && /^(#{1,6}\s|\||>|```|<!--)/.test(ln.trim())) break;
      body.push(lead > indent ? ln.slice(Math.min(lead, indent + 2)) : ln.trim());
      i++;
    }
    const plain = body.every((b) => !LIST_RX.test(b) && !/^\s*(\||>|```|<!--)/.test(b) && b.trim() !== '');
    items.push('<li>' + (plain ? inline(body.map((b) => b.trim()).join(' ')) : mdToHtml(body.join('\n'), { ...ctx, heads: [], seen }).replace(/^<p>([\s\S]*?)<\/p>/, '$1')) + '</li>');
    while (i < lines.length && !lines[i].trim()) {
      const nx = lines[i + 1];
      const nm = nx !== undefined ? LIST_RX.exec(nx) : null;
      if (nm && nm[1].length === indent) i++;
      else break;
    }
  }
  const tag = ordered ? 'ol' : 'ul';
  return { html: '<' + tag + (ordered && start !== 1 ? ' start="' + start + '"' : '') + '>' + items.join('') + '</' + tag + '>', next: i };
}

/* ---------------- сборка выгрузки ---------------- */

const frameOf = (s) => (s.target ? 'кадр ' + s.target : s.height === 'full' ? 'экран во всю высоту' : 'экран');
const sizeOf = (c) => (c ? c.w + ' × ' + c.h + ' px' : 'не снят');
const ruDate = (iso) => { const d = new Date(iso); const p = (n) => String(n).padStart(2, '0'); return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear(); };

/** Текст md для разработки: без front matter, маркеры — строками со ссылкой на html. */
export function exportMd(spec, body, capture) {
  const num = numberSnaps(markersOf(body));
  const byId = new Map(spec.snaps.map((s) => [s.id, s]));
  const file = spec.spec + '.html';
  const line = (id) => {
    const s = byId.get(id);
    return '> **Снимок ' + num[id] + '** — ' + (s ? s.title : id) + ' · ' + sizeOf(capture && capture.snaps[id]) + ' (`' + file + '#snap-' + id + '`)';
  };
  let lines = body.replace(/\r\n?/g, '\n').split('\n');
  let inCode = false;
  lines = lines.flatMap((l) => {
    if (/^\s*```/.test(l)) inCode = !inCode;
    if (inCode) return [l];
    const ms = [...l.matchAll(MARK_RX)];
    if (!ms.length) return [l];
    const pad = /^\s*/.exec(l)[0];   // маркер в пункте списка — с его отступом, иначе список рвётся
    return ms.flatMap((m, k) => (k ? ['>'] : []).concat(m[2].split(/[\s,]+/).filter(Boolean).flatMap((id, j) => (j ? ['>', line(id)] : [line(id)])))).map((x) => pad + x);
  });
  const h1 = lines.findIndex((l) => /^#\s+\S/.test(l));
  const meta = [
    '',
    '> Модуль `' + spec.module + '`' + (spec.version ? ' · версия ' + spec.version : '') + (spec.date ? ' · ' + spec.date : '') + (spec.designer ? ' · дизайнер ' + spec.designer : ''),
    '>',
    '> Снимки состояний — в файле `' + file + '` рядом: DOM-снимки прототипа, не картинки' + (capture ? ' (' + capture.viewport.w + '×' + capture.viewport.h + ', тема ' + THEME + ', сняты ' + ruDate(capture.taken) + ')' : '') + '. Открывается в браузере без сети; классы ДС и размеры видны в инструментах разработчика.',
  ];
  lines.splice(h1 + 1, 0, ...meta);
  const appendix = ['', '## Снимки', '', '| № | Снимок | Страница прототипа | Кадр | Размер |', '|---|---|---|---|---|'];
  for (const s of [...spec.snaps].sort((a, b) => num[a.id] - num[b.id])) {
    appendix.push('| ' + num[s.id] + ' | ' + s.title + ' | `' + s.page.replace(/\|/g, '\\|') + '` | ' + frameOf(s).replace(/\|/g, '\\|') + ' | ' + sizeOf(capture && capture.snaps[s.id]) + ' |');
  }
  return lines.join('\n').replace(/\s+$/, '') + '\n' + appendix.join('\n') + '\n';
}

/** :root-правила общего CSS — токены ДС для самой страницы спеки. */
function tokensOf(shared) {
  return shared.filter((t) => /^:root\s*\{/.test(t)).join('\n');
}

/** Автономный html: текст, оглавление, снимки; данные снимков — JSON внутри. */
export function exportHtml(spec, body, capture) {
  const num = numberSnaps(markersOf(body));
  const byId = new Map(spec.snaps.map((s) => [s.id, s]));
  const heads = [];
  const seen = new Set(['snaps']);
  const figure = (id) => {
    const s = byId.get(id);
    const c = capture.snaps[id];
    const cap = '<figcaption><span class="sp-snap__num">Снимок ' + num[id] + '</span> · ' + esc(s ? s.title : id) + ' · <span class="sp-snap__size">' + sizeOf(c) + '</span>'
      + (s && s.note ? '<span class="sp-snap__note">' + inline(s.note) + '</span>' : '') + '</figcaption>';
    if (!c) return '<figure class="sp-snap sp-snap--missing" id="snap-' + esc(id) + '"><div class="sp-snap__empty">Снимок не снят</div>' + cap + '</figure>';
    return '<figure class="sp-snap" id="snap-' + esc(id) + '" data-snap="' + esc(id) + '"><button type="button" class="sp-snap__frame" aria-label="Открыть снимок ' + num[id] + ' в натуральную величину"><span class="sp-snap__scale"></span></button>' + cap + '</figure>';
  };
  const text = body.replace(/\r\n?/g, '\n');
  const h1Rx = /^#\s+(.+)$/m;
  const h1 = h1Rx.exec(text);
  const rest = h1 ? text.slice(0, h1.index) + text.slice(h1.index + h1[0].length) : text;
  const main = mdToHtml(rest, {
    heads, seen,
    snap: (m) => (m.kind === 'snaps' ? '<div class="sp-gallery">' + m.ids.map(figure).join('') + '</div>' : m.ids.map(figure).join('')),
  });
  const toc = heads.filter((h) => h.level === 2 || h.level === 3)
    .map((h) => '<a class="sp-toc__link sp-toc__link--' + h.level + '" href="#' + h.id + '">' + inline(h.text) + '</a>').join('')
    + '<a class="sp-toc__link sp-toc__link--2" href="#snaps">Снимки</a>';
  const list = [...spec.snaps].sort((a, b) => num[a.id] - num[b.id]).map((s) => '<tr><td>' + num[s.id] + '</td><td><a href="#snap-' + esc(s.id) + '">' + esc(s.title) + '</a></td><td><code>' + esc(s.page) + '</code></td><td>' + esc(frameOf(s)) + '</td><td>' + sizeOf(capture.snaps[s.id]) + '</td></tr>').join('');
  const data = {
    fonts: capture.fonts,
    shared: capture.shared,
    snaps: Object.fromEntries(spec.snaps.filter((s) => capture.snaps[s.id]).map((s) => {
      const c = capture.snaps[s.id];
      return [s.id, { id: s.id, n: num[s.id], title: s.title, page: s.page, target: s.target, mark: s.mark, height: s.height, w: c.w, h: c.h, crop: !!s.target, htmlAttrs: c.htmlAttrs, body: c.body, local: c.local.join('\n') }];
    })),
    capture: { taken: capture.taken, viewport: capture.viewport, userAgent: capture.userAgent },
  };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const meta = ['Модуль <code>' + esc(spec.module) + '</code>', spec.version ? 'версия ' + esc(spec.version) : '', spec.date ? esc(spec.date) : '', spec.designer ? 'дизайнер ' + esc(spec.designer) : ''].filter(Boolean).join(' · ');
  const snapsMeta = 'Снимки: ' + Object.keys(data.snaps).length + ' · ' + capture.viewport.w + '×' + capture.viewport.h + ' · тема ' + THEME + ' · сняты ' + ruDate(capture.taken)
    + ' — DOM-снимки прототипа, не картинки: классы ДС и размеры видны в инструментах разработчика.';
  return '<!DOCTYPE html>\n<html lang="ru">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '<title>' + esc(spec.title) + ' — спецификация на разработку</title>\n'
    + '<!-- Собрано dev-spec.mjs (RE0016) из ' + esc(spec.spec) + SUFFIX + '. Руками не править: правка — в исходнике и пересборка. -->\n'
    + '<style>' + tokensOf(capture.shared) + '</style>\n<style>' + PAGE_CSS + '</style>\n'
    + '<script type="application/json" id="devspec-data">' + json + '</script>\n</head>\n<body>\n'
    + '<div class="sp">\n<aside class="sp-toc" aria-label="Оглавление"><div class="sp-toc__title">' + esc(spec.title) + '</div><nav>' + toc + '</nav></aside>\n'
    + '<main class="sp-main">\n<header class="sp-head"><div class="sp-head__kicker">Спецификация на разработку</div><h1>' + inline(h1 ? h1[1] : spec.title) + '</h1>'
    + '<p class="sp-head__meta">' + meta + '</p><p class="sp-head__meta">' + esc(snapsMeta) + '</p></header>\n'
    + main + '\n<h2 id="snaps">Снимки</h2>\n<div class="sp-table"><table><thead><tr><th>№</th><th>Снимок</th><th>Страница прототипа</th><th>Кадр</th><th>Размер</th></tr></thead><tbody>' + list + '</tbody></table></div>\n'
    + '</main>\n</div>\n<div class="sp-zoom" hidden role="dialog" aria-modal="true" aria-label="Снимок в натуральную величину"><div class="sp-zoom__bar"><span class="sp-zoom__title"></span><button type="button" class="sp-zoom__close">Закрыть · Esc</button></div><div class="sp-zoom__body"></div></div>\n'
    + '<script>(' + viewer.toString() + ')();</script>\n</body>\n</html>\n';
}

/* Стиль страницы спеки — на токенах ДС (:root-правила снимков вшиты выше). */
const PAGE_CSS = [
  '*,*::before,*::after{box-sizing:border-box}',
  'html{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}',
  'body{margin:0;background:var(--bg-page);color:var(--text-primary);font:var(--type-body-m);font-family:var(--font-text),system-ui,sans-serif}',
  '.sp{display:grid;grid-template-columns:288px minmax(0,1fr);min-height:100vh}',
  '.sp-toc{position:sticky;top:0;height:100vh;overflow-y:auto;padding:var(--space-24) var(--space-16);background:var(--bg-tile);border-right:1px solid var(--border-light)}',
  '.sp-toc__title{font:var(--type-body-m-strong);margin:0 0 var(--space-16) var(--space-8)}',
  '.sp-toc nav{display:flex;flex-direction:column;gap:var(--space-2)}',
  '.sp-toc__link{display:block;padding:var(--space-4) var(--space-8);border-radius:var(--radius-s);color:var(--text-primary);text-decoration:none;font:var(--type-body-s)}',
  '.sp-toc__link:hover{background:var(--secondary-bg-light)}',
  '.sp-toc__link--3{padding-left:var(--space-24);color:var(--text-secondary)}',
  '.sp-main{padding:var(--space-32) var(--space-48) var(--space-96);min-width:0;max-width:1400px}',
  '.sp-head{margin-bottom:var(--space-32)}',
  '.sp-head__kicker{font:var(--type-body-s);color:var(--text-secondary);margin-bottom:var(--space-4)}',
  '.sp-head__meta{font:var(--type-body-s);color:var(--text-secondary);margin:var(--space-4) 0 0}',
  'h1{font:var(--type-h2);margin:0 0 var(--space-8)}',
  'h2{font:var(--type-h3-strong);margin:var(--space-48) 0 var(--space-16);padding-top:var(--space-16);border-top:1px solid var(--border-light)}',
  'h3{font:var(--type-h4-strong);margin:var(--space-32) 0 var(--space-12)}',
  'h4{font:var(--type-h5-strong);margin:var(--space-24) 0 var(--space-8)}',
  'p{margin:0 0 var(--space-12)}',
  'ul,ol{margin:0 0 var(--space-12);padding-left:var(--space-24)}',
  'li{margin:var(--space-4) 0}',
  'a{color:var(--link)}',
  'code{font-family:ui-monospace,Consolas,monospace;font-size:.9em;background:var(--secondary-bg-light);border-radius:var(--radius-xs);padding:0 var(--space-4)}',
  'pre{background:var(--bg-tile);border:1px solid var(--border-light);border-radius:var(--radius-card);padding:var(--space-12) var(--space-16);overflow-x:auto;margin:0 0 var(--space-16)}',
  'pre code{background:none;padding:0;font-size:var(--space-12)}',
  'blockquote{margin:0 0 var(--space-16);padding:var(--space-12) var(--space-16);background:var(--bg-tile);border-left:4px solid var(--border-primary);border-radius:var(--radius-s)}',
  'blockquote p:last-child{margin:0}',
  'hr{border:0;border-top:1px solid var(--border-light);margin:var(--space-24) 0}',
  '.sp-table{overflow-x:auto;margin:0 0 var(--space-16)}',
  'table{border-collapse:collapse;width:100%;background:var(--bg-tile);font:var(--type-body-s)}',
  'th,td{border:1px solid var(--border-light);padding:var(--space-8) var(--space-12);text-align:left;vertical-align:top}',
  'th{background:var(--secondary-bg-light);font:var(--type-body-s-strong)}',
  '.sp-snap{margin:0 0 var(--space-24);padding:var(--space-12);background:var(--bg-tile);border:1px solid var(--border-light);border-radius:var(--radius-card);min-width:0}',
  '.sp-snap__frame{display:block;width:100%;padding:0;border:0;background:var(--bg-page);cursor:zoom-in;overflow:hidden;position:relative;text-align:left}',
  '.sp-snap__scale{display:block;transform-origin:0 0}',
  '.sp-snap iframe,.sp-zoom iframe{display:block;border:0;background:var(--bg-page)}',
  '.sp-snap__frame iframe{pointer-events:none}',
  'figcaption{font:var(--type-body-s);color:var(--text-secondary);margin-top:var(--space-8)}',
  '.sp-snap__num{font:var(--type-body-s-strong);color:var(--text-primary)}',
  '.sp-snap__note{display:block;margin-top:var(--space-4);color:var(--text-primary)}',
  '.sp-snap__empty{padding:var(--space-24);text-align:center;color:var(--text-secondary);background:var(--bg-page)}',
  '.sp-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:var(--space-16);align-items:start;margin:0 0 var(--space-24)}',
  '.sp-gallery .sp-snap{margin:0}',
  '.sp-zoom{position:fixed;inset:0;z-index:10;display:flex;flex-direction:column;background:var(--bg-page)}',
  '.sp-zoom[hidden]{display:none}',
  '.sp-zoom__bar{display:flex;align-items:center;justify-content:space-between;gap:var(--space-16);padding:var(--space-12) var(--space-24);background:var(--bg-tile);border-bottom:1px solid var(--border-light)}',
  '.sp-zoom__title{font:var(--type-body-m-strong)}',
  '.sp-zoom__close{font:var(--type-body-s);padding:var(--space-6) var(--space-12);border:1px solid var(--border-primary);border-radius:var(--radius-control);background:var(--bg-tile);color:var(--text-primary);cursor:pointer}',
  '.sp-zoom__body{flex:1;min-height:0;overflow:auto;padding:var(--space-24)}',
].join('\n');

/* Рантайм страницы спеки: выполняется в браузере (toString). Снимок — iframe
   srcdoc без скриптов (sandbox), вписан по ширине; клик — в натуральную величину. */
function viewer() {
  var data = JSON.parse(document.getElementById('devspec-data').textContent);
  var fonts = document.createElement('style');
  var FONTS = data.fonts.join('\n'), SHARED = data.shared.join('\n');
  fonts.textContent = FONTS;
  document.head.appendChild(fonts);
  var FREEZE = '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}html,body{overflow:hidden!important}';
  function srcdoc(s) {
    var css = FREEZE;
    if (s.crop) {
      css += '[data-snap-target]{position:fixed!important;left:0!important;top:0!important;right:auto!important;bottom:auto!important;margin:0!important;'
        + 'width:' + s.w + 'px!important;height:' + s.h + 'px!important;min-width:0!important;max-width:none!important;max-height:none!important;transform:none!important;z-index:2147483646!important}'
        + '[data-snap-anc]{background:transparent!important;box-shadow:none!important}';
    }
    css += '[data-snap-mark]{outline:2px solid var(--primary)!important;outline-offset:-2px!important}';
    return '<!DOCTYPE html><html ' + s.htmlAttrs + '><head><meta charset="UTF-8"><style>' + FONTS + '\n' + SHARED + '\n' + s.local + '\n' + css + '</style></head>' + s.body + '</html>';
  }
  function frame(s) {
    var f = document.createElement('iframe');
    f.setAttribute('sandbox', '');
    f.setAttribute('loading', 'lazy');
    f.setAttribute('title', 'Снимок ' + s.n + ': ' + s.title);
    f.width = s.w;
    f.height = s.h;
    f.srcdoc = srcdoc(s);
    return f;
  }
  var figs = [];
  Array.prototype.forEach.call(document.querySelectorAll('figure[data-snap]'), function (fig) {
    var s = data.snaps[fig.getAttribute('data-snap')];
    if (!s) return;
    var btn = fig.querySelector('.sp-snap__frame');
    var scale = fig.querySelector('.sp-snap__scale');
    scale.appendChild(frame(s));
    if (!fig.parentNode.classList.contains('sp-gallery')) fig.style.maxWidth = 'calc(' + s.w + 'px + 2 * var(--space-12) + 2px)';   // узкий снимок не тянет карточку
    figs.push({ s: s, btn: btn, scale: scale });
    btn.addEventListener('click', function () { zoom(s); });
  });
  function fit() {
    figs.forEach(function (x) {
      var k = Math.min(1, x.btn.clientWidth / x.s.w);
      x.scale.style.transform = 'scale(' + k + ')';
      x.scale.style.width = x.s.w + 'px';
      x.btn.style.height = Math.ceil(x.s.h * k) + 'px';
    });
  }
  fit();
  if (window.ResizeObserver) new ResizeObserver(fit).observe(document.querySelector('.sp-main'));
  else window.addEventListener('resize', fit);
  var z = document.querySelector('.sp-zoom');
  var zb = z.querySelector('.sp-zoom__body');
  var last = null;
  function zoom(s) {
    last = document.activeElement;
    zb.innerHTML = '';
    zb.appendChild(frame(s));
    z.querySelector('.sp-zoom__title').textContent = 'Снимок ' + s.n + ' · ' + s.title + ' · ' + s.w + ' × ' + s.h + ' px';
    z.hidden = false;
    z.querySelector('.sp-zoom__close').focus();
  }
  function close() { z.hidden = true; zb.innerHTML = ''; if (last && last.focus) last.focus(); }
  z.querySelector('.sp-zoom__close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !z.hidden) close(); });
}

/* ---------------- съёмка: служебная страница ---------------- */

/* Выполняется в браузере (toString): открывает состояния в iframe, проигрывает
   действия, сериализует DOM и стили, шлёт серверу. Исполнитель действий —
   та же семантика, что у проигрывателя панели (runner.js): синтетические события. */
function harness(cfg) {
  var logEl = document.getElementById('log');
  function log(t) { logEl.textContent += t + '\n'; }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function post(kind, body) { return fetch('/__devspec/' + kind, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); }); }
  var frame = document.getElementById('frame');
  var PANEL = '[id^="pp-"], [class^="pp-"], [class*=" pp-"], #__snap-freeze';

  function load(url, w, h) {
    return new Promise(function (resolve, reject) {
      frame.style.width = w + 'px';
      frame.style.height = h + 'px';
      var t = setTimeout(function () { reject(new Error('страница не загрузилась за 30 с')); }, 30000);
      frame.onload = function () { clearTimeout(t); resolve(); };
      frame.src = url;
    });
  }

  /* ---- исполнитель действий ---- */
  function textOf(el) {
    var a = el.getAttribute ? el.getAttribute('aria-label') : null;
    var s = a && a.trim() ? a : (el.innerText != null ? el.innerText : el.textContent);
    return String(s || '').replace(/\s+/g, ' ').trim();
  }
  function visible(el) {
    if (!el || !el.isConnected) return false;
    if (typeof el.checkVisibility === 'function') return el.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true });
    return el.getClientRects().length > 0;
  }
  function find(doc, a, want) {
    var deadline = Date.now() + (a.timeout || 5000);
    return new Promise(function (resolve, reject) {
      (function poll() {
        var list;
        try { list = Array.prototype.filter.call(doc.querySelectorAll(a.target), function (el) { return !el.closest(PANEL) && (!a.text || textOf(el) === a.text); }); }
        catch (e) { reject(new Error('селектор не разбирается: ' + e.message)); return; }
        var i = (a.index || 0) < 0 ? list.length + a.index : (a.index || 0);
        var el = list[i] || null, ok;
        if (want === 'absent') ok = list.length === 0;
        else if (want === 'hidden') ok = !el || !visible(el);
        else if (want === 'present') ok = !!el;
        else ok = !!el && visible(el);
        if (ok) { resolve(el); return; }
        if (Date.now() >= deadline) { reject(new Error('«' + a.target + '» — ' + (want === 'absent' || want === 'hidden' ? 'не исчез' : 'не найден или скрыт'))); return; }
        setTimeout(poll, 50);
      })();
    });
  }
  function exec(win, a) {
    var doc = win.document;
    if (a.verb === 'wait') return sleep(a.ms);
    if (a.verb === 'waitFor') return find(doc, a, a.state || 'visible');
    var get = a.target ? find(doc, a, 'visible') : Promise.resolve(doc.activeElement || doc.body);
    return get.then(function (el) {
      var r = el.getBoundingClientRect(), p = { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, bubbles: true, cancelable: true, composed: true, view: win, button: 0 };
      var PE = win.PointerEvent || win.MouseEvent;
      if (a.verb === 'click') {
        el.dispatchEvent(new PE('pointerdown', p)); el.dispatchEvent(new win.MouseEvent('mousedown', p));
        var f = el.closest('a[href], button, input, select, textarea, summary, [tabindex]');
        if (f && f.focus) f.focus({ preventScroll: true });
        el.dispatchEvent(new PE('pointerup', p)); el.dispatchEvent(new win.MouseEvent('mouseup', p)); el.dispatchEvent(new win.MouseEvent('click', p));
      } else if (a.verb === 'fill') {
        if (el.focus) el.focus();
        var proto = el instanceof win.HTMLTextAreaElement ? win.HTMLTextAreaElement.prototype : el instanceof win.HTMLInputElement ? win.HTMLInputElement.prototype : el instanceof win.HTMLSelectElement ? win.HTMLSelectElement.prototype : null;
        if (!proto) throw new Error('«' + a.target + '» — не поле ввода');
        Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, a.value == null ? '' : a.value);
        el.dispatchEvent(new (win.InputEvent || win.Event)('input', { bubbles: true, inputType: 'insertText', data: a.value }));
        el.dispatchEvent(new win.Event('change', { bubbles: true }));
      } else if (a.verb === 'hover') {
        ['pointerover', 'pointerenter', 'mouseover', 'mouseenter', 'pointermove', 'mousemove'].forEach(function (t) { el.dispatchEvent(new (/^pointer/.test(t) ? PE : win.MouseEvent)(t, p)); });
      } else if (a.verb === 'focus') el.focus();
      else if (a.verb === 'scroll') el.scrollIntoView({ block: a.block || 'center' });
      else if (a.verb === 'press') {
        var key = a.key === 'Space' ? ' ' : a.key;
        ['keydown', 'keyup'].forEach(function (t) { el.dispatchEvent(new win.KeyboardEvent(t, { key: key, bubbles: true, cancelable: true, altKey: !!a.mods.alt, shiftKey: !!a.mods.shift, ctrlKey: !!a.mods.ctrl, metaKey: !!a.mods.meta })); });
      }
      return el;
    });
  }

  /* ---- снимок ---- */
  function absUrls(text, base) {
    return text.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, function (m, q, u) {
      if (/^(data:|#|about:)/.test(u)) return m;
      try { return 'url("' + new URL(u, base).href + '")'; } catch (e) { return m; }
    });
  }
  /* Селектор без динамики (:hover, ::before…) — для проверки «есть ли кому применяться». */
  function staticSel(sel) {
    var s = sel.replace(/::?(before|after|placeholder|marker|selection|backdrop|first-line|first-letter|file-selector-button|-webkit-[a-z-]+|-moz-[a-z-]+)(\([^)]*\))?/gi, '')
      .replace(/:(hover|focus|focus-visible|focus-within|active|visited|link|any-link|target|placeholder-shown|autofill|-webkit-autofill)\b/gi, '');
    s = s.replace(/([>+~]\s*)$/, '$1*').trim();
    return s || '*';
  }
  function used(doc2, selectorText) {
    var parts = selectorText.split(/,(?![^(]*\))/);
    for (var i = 0; i < parts.length; i++) {
      try { if (doc2.querySelector(staticSel(parts[i]))) return true; } catch (e) { return true; }
    }
    return false;
  }
  function familyOf(v) { return String(v || '').split(',')[0].trim().replace(/^["']|["']$/g, '').toLowerCase(); }

  function collectCss(doc, doc2, families) {
    var shared = [], local = [], fonts = [];
    function walk(rules, base, idx, outArr) {
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i], key = idx.concat(i), name = r.constructor && r.constructor.name;
        if (r.type === 3 || name === 'CSSImportRule') { if (r.styleSheet) sheet(r.styleSheet); continue; }
        if (r.type === 5 || name === 'CSSFontFaceRule') {
          if (families[familyOf(r.style.getPropertyValue('font-family'))]) fonts.push(absUrls(r.cssText, base));
          continue;
        }
        if (r.type === 7 || name === 'CSSKeyframesRule' || name === 'CSSPageRule' || name === 'CSSNamespaceRule') continue;
        if (r.type === 1 || name === 'CSSStyleRule') { if (used(doc2, r.selectorText)) outArr.push({ k: key, t: absUrls(r.cssText, base) }); continue; }
        if (r.cssRules) {
          var inner = [];
          walk(r.cssRules, base, key, inner);
          if (inner.length) outArr.push({ k: key, t: r.cssText.slice(0, r.cssText.indexOf('{')).trim() + '{' + inner.map(function (x) { return x.t; }).join('\n') + '}' });
          continue;
        }
        if (name === 'CSSLayerStatementRule') outArr.push({ k: key, t: r.cssText });
      }
    }
    var seenSheets = [];
    function sheet(sh) {
      if (seenSheets.indexOf(sh) >= 0) return;
      seenSheets.push(sh);
      var owner = sh.ownerNode;
      if (owner && owner.id === '__snap-freeze') return;
      var href = sh.href || '';
      if (/\/proto-panel\//.test(href)) return;
      var rules;
      try { rules = sh.cssRules; } catch (e) { return; }
      var isDs = href && href.indexOf(cfg.dsRoot) === 0;
      var arr = [];
      walk(rules, href || doc.baseURI, [], arr);
      if (isDs) shared.push({ sheet: href, rules: arr });
      else local.push.apply(local, arr.map(function (x) { return x.t; }));
    }
    Array.prototype.forEach.call(doc.styleSheets, sheet);
    return { shared: shared, local: local, fonts: fonts };
  }

  function capture(win, s) {
    var doc = win.document;
    var target = null, rect = null;
    var prep = s.target ? find(doc, { target: s.target, timeout: 5000 }, 'visible') : Promise.resolve(null);
    return prep.then(function (el) {
      target = el;
      if (target) { rect = target.getBoundingClientRect(); target.setAttribute('data-snap-target', ''); }
      var mark = s.mark ? doc.querySelector(s.mark) : null;
      if (s.mark && !mark) throw new Error('mark «' + s.mark + '» не найден');
      if (mark) mark.setAttribute('data-snap-mark', '');
      /* значения полей — в атрибуты, чтобы пережили сериализацию */
      Array.prototype.forEach.call(doc.querySelectorAll('input, textarea, select'), function (f) {
        if (f.tagName === 'TEXTAREA') f.textContent = f.value;
        else if (f.tagName === 'SELECT') Array.prototype.forEach.call(f.options, function (o) { if (o.selected) o.setAttribute('selected', ''); else o.removeAttribute('selected'); });
        else if (f.type === 'checkbox' || f.type === 'radio') { if (f.checked) f.setAttribute('checked', ''); else f.removeAttribute('checked'); }
        else if (f.type !== 'file' && f.type !== 'password') f.setAttribute('value', f.value);
      });
      /* шрифты, которыми набран кадр */
      var families = {};
      var scope = target || doc.body;
      [scope].concat(Array.prototype.slice.call(scope.querySelectorAll('*'))).forEach(function (n) {
        families[familyOf(win.getComputedStyle(n).fontFamily)] = 1;
        families[familyOf(win.getComputedStyle(n, '::before').fontFamily)] = 1;
      });
      var html = doc.documentElement.cloneNode(true);
      if (target) target.removeAttribute('data-snap-target');
      if (mark) mark.removeAttribute('data-snap-mark');
      var head = html.querySelector('head');
      if (head) head.innerHTML = '';
      var body = html.querySelector('body');
      Array.prototype.forEach.call(body.querySelectorAll('script, noscript, template, link, style, meta, base, iframe'), function (n) { n.remove(); });
      Array.prototype.forEach.call(body.querySelectorAll(PANEL), function (n) { n.remove(); });
      /* кадр: цель и цепочка предков, без соседей */
      if (target) {
        var t = body.querySelector('[data-snap-target]');
        for (var n = t; n && n !== body; n = n.parentNode) {
          var p = n.parentNode;
          Array.prototype.slice.call(p.childNodes).forEach(function (c) { if (c !== n) p.removeChild(c); });
          if (p !== body) p.setAttribute('data-snap-anc', '');
        }
      }
      [html].concat(Array.prototype.slice.call(html.querySelectorAll('*'))).forEach(function (n) {
        Array.prototype.slice.call(n.attributes).forEach(function (a) { if (/^on/i.test(a.name)) n.removeAttribute(a.name); });
        if (n.tagName === 'A' && n.hasAttribute('href') && n.getAttribute('href').charAt(0) !== '#') n.setAttribute('href', '#');
        if (n.tagName === 'FORM') n.removeAttribute('action');
        if (n.hasAttribute('style') && /url\(/.test(n.getAttribute('style'))) n.setAttribute('style', absUrls(n.getAttribute('style'), doc.baseURI));
        if (n.tagName === 'IMG' && n.getAttribute('src')) n.setAttribute('src', n.src);
        if (n.removeAttribute && n.tagName === 'IMG') n.removeAttribute('srcset');
      });
      var doc2 = document.implementation.createHTMLDocument('');
      doc2.replaceChild(doc2.importNode(html, true), doc2.documentElement);
      var css = collectCss(doc, doc2, families);
      var attrs = Array.prototype.map.call(html.attributes, function (a) { return a.name + '="' + a.value.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"'; }).join(' ');
      return {
        id: s.id,
        w: Math.round(rect ? rect.width : s.vw), h: Math.round(rect ? rect.height : parseInt(frame.style.height, 10)),
        x: Math.round(rect ? rect.left : 0), y: Math.round(rect ? rect.top : 0),
        htmlAttrs: absUrls(attrs, doc.baseURI), body: body.outerHTML,
        shared: css.shared, local: css.local, fonts: css.fonts,
        errors: (win.__snapErrors || []).slice(0, 10),
      };
    });
  }

  function fullHeight(win, vh) {
    var doc = win.document, need = doc.documentElement.scrollHeight;
    Array.prototype.forEach.call(doc.querySelectorAll('*'), function (el) {
      var oy = win.getComputedStyle(el).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) need = Math.max(need, vh + el.scrollHeight - el.clientHeight);
    });
    return Math.min(need, 20000);
  }

  function one(s) {
    var url = s.url + (s.url.indexOf('?') >= 0 ? '&' : '?') + '__snap=1';
    return load(url, s.vw, s.vh).then(function () {
      var win = frame.contentWindow;
      return (win.document.fonts ? win.document.fonts.ready : Promise.resolve()).then(function () { return sleep(cfg.settle); }).then(function () {
        var i = 0;
        return (function next() {
          if (i >= s.actions.length) return Promise.resolve();
          var a = s.actions[i++];
          return exec(win, a).then(function () { return sleep(120); }).then(next, function (e) { throw new Error('действие ' + i + ' (' + a.verb + (a.target ? ' ' + a.target : '') + '): ' + e.message); });
        })();
      }).then(function () { return sleep(s.actions.length ? cfg.settle : 0); }).then(function () {
        if (s.height !== 'full') return null;
        frame.style.height = fullHeight(win, s.vh) + 'px';
        return sleep(cfg.settle).then(function () { frame.style.height = fullHeight(win, s.vh) + 'px'; return sleep(200); });
      }).then(function () { return capture(win, s); });
    });
  }

  var list = cfg.snaps, done = 0, failed = 0;
  log('снимков: ' + list.length + ' · ' + cfg.spec);
  (function loop(i) {
    if (i >= list.length) {
      log('сборка…');
      post('done', { userAgent: navigator.userAgent }).then(function (r) {
        log(r.ok ? 'готово: ' + r.text : 'СБОЙ сборки: ' + r.text);
        document.title = r.ok ? 'Готово — dev-spec' : 'Сбой — dev-spec';
        frame.remove();
      });
      return;
    }
    var s = list[i];
    log((i + 1) + '/' + list.length + ' ' + s.id + ' …');
    one(s).then(function (res) {
      done++;
      return post('result', res).then(function () { log('   ' + res.w + '×' + res.h + (res.errors.length ? ' · ошибки JS: ' + res.errors.join('; ') : '')); });
    }, function (e) {
      failed++;
      log('   СБОЙ: ' + e.message);
      return post('result', { id: s.id, fail: e.message });
    }).then(function () { loop(i + 1); });
  })(0);
}

function harnessHtml(cfg) {
  return '<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><title>Съёмка — dev-spec</title>'
    + '<style>body{margin:16px;font:14px/1.5 system-ui,sans-serif}#log{white-space:pre-wrap;font:12px/1.5 ui-monospace,Consolas,monospace}iframe{border:1px solid #ccc;display:block;margin-top:16px;transform-origin:0 0}</style></head><body>'
    + '<h1 style="font-size:18px;margin:0 0 8px">Съёмка спецификации ' + esc(cfg.spec) + '</h1><p style="margin:0 0 8px">Страница снимает состояния сама — дождитесь строки «готово». Вкладку можно не трогать.</p>'
    + '<pre id="log"></pre><iframe id="frame" title="состояние"></iframe>'
    + '<script>(' + harness.toString() + ')(' + JSON.stringify(cfg).replace(/</g, '\\u003c') + ');</script></body></html>';
}

/* ---------------- съёмка: сервер ---------------- */

/** Адреса http://localhost:<port>/… в тексте → data-URI файлов проекта. */
export function inlineUrls(text, root, port, cache = new Map()) {
  const rx = new RegExp('https?://(?:localhost|127\\.0\\.0\\.1):' + port + '(/[^"\')\\s]*)', 'g');
  return text.replace(rx, (m, p) => {
    if (cache.has(p)) return cache.get(p);
    let rel = p.split(/[?#]/)[0];
    const hash = p.includes('#') ? p.slice(p.indexOf('#')) : '';
    try { rel = decodeURIComponent(rel); } catch { /* как есть */ }
    const abs = path.join(root, rel);
    const mime = MIME[path.extname(abs).toLowerCase()];
    let out = m;
    if (abs.startsWith(root) && mime && existsSync(abs) && statSync(abs).isFile()) out = 'data:' + mime + ';base64,' + readFileSync(abs).toString('base64') + (mime === 'image/svg+xml' ? '' : hash);
    cache.set(p, out);
    return out;
  });
}

/** Ответы служебной страницы → capture { taken, viewport, userAgent, shared, fonts, snaps }. */
export function mergeCapture(results, meta, root, port, prev) {
  const cache = new Map();
  const fix = (t) => inlineUrls(t, root, port, cache);
  const sheets = [];
  const byHref = new Map();
  const fonts = [];
  const snaps = {};
  for (const r of results) {
    if (r.fail) continue;
    for (const sh of r.shared) {
      if (!byHref.has(sh.sheet)) { const e = { href: sh.sheet, rules: new Map() }; byHref.set(sh.sheet, e); sheets.push(e); }
      const e = byHref.get(sh.sheet);
      for (const x of sh.rules) e.rules.set(x.k.map((n) => String(n).padStart(5, '0')).join('.'), x.t);
    }
    for (const f of r.fonts) if (!fonts.includes(f)) fonts.push(f);
    snaps[r.id] = { w: r.w, h: r.h, x: r.x, y: r.y, htmlAttrs: fix(r.htmlAttrs), body: fix(r.body), local: r.local.map(fix), errors: r.errors };
  }
  let shared = [];
  for (const e of sheets) shared.push(...[...e.rules.keys()].sort().map((k) => e.rules.get(k)));
  shared = shared.map(fix);
  let fontCss = fonts.map(fix);
  /* досъёмка части снимков: остальные — из прежнего генерата, общий CSS — объединение */
  if (prev) {
    for (const [id, c] of Object.entries(prev.snaps)) if (!(id in snaps)) snaps[id] = c;
    for (const t of prev.shared) if (!shared.includes(t)) shared.push(t);
    for (const t of prev.fonts) if (!fontCss.includes(t)) fontCss.push(t);
  }
  return { taken: meta.taken, viewport: meta.viewport, userAgent: meta.userAgent, shared, fonts: fontCss, snaps };
}

function serve(P, specAbs, checked, opts) {
  const { spec } = checked;
  const root = P.root;
  const pagesRel = slash(path.relative(root, checked.pagesAbs));
  const dsRel = P.ds ? slash(P.ds).replace(/\/?$/, '/') : '';
  const only = opts.only.length ? spec.snaps.filter((s) => opts.only.includes(s.id)) : spec.snaps;
  const prev = opts.only.length ? readGenerat(checked.place.dataAbs, spec.spec) : null;
  if (opts.only.length && !prev) { console.log('ОШИБКА: --only — переснять часть снимков, но прежнего генерата ' + spec.spec + '.dev-spec.js нет: снимите все'); process.exit(1); }
  const results = [];
  let server;
  const cfgOf = (port) => ({
    spec: spec.spec, settle: opts.settle, dsRoot: 'http://localhost:' + port + '/' + dsRel,
    snaps: only.map((s) => ({ id: s.id, url: '/' + pagesRel + '/' + s.page.replace(/^([^?#]*)/, (m) => m.split('/').map(encodeURIComponent).join('/')), vw: spec.viewport.w, vh: spec.viewport.h, target: s.target, mark: s.mark, height: s.height, actions: s.do })),
  });
  server = createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const send = (code, type, body) => { res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(body); };
    if (url.pathname === '/__devspec/' || url.pathname === '/__devspec') return send(200, TYPES['.html'], harnessHtml(cfgOf(opts.port)));
    if (req.method === 'POST' && url.pathname.startsWith('/__devspec/')) {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        let body = {};
        try { body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch (e) { return send(400, TYPES['.json'], JSON.stringify({ ok: false, text: 'плохой JSON' })); }
        const kind = url.pathname.slice('/__devspec/'.length);
        if (kind === 'result') {
          results.push(body);
          console.log((body.fail ? 'СБОЙ  ' : 'снят  ') + body.id + (body.fail ? ' — ' + body.fail : ' ' + body.w + '×' + body.h + (body.errors && body.errors.length ? ' · ошибки JS: ' + body.errors.join('; ') : '')));
          return send(200, TYPES['.json'], '{"ok":true}');
        }
        if (kind === 'done') {
          const fails = results.filter((r) => r.fail);
          const jsErr = results.filter((r) => !r.fail && r.errors && r.errors.length);
          const capture = mergeCapture(results, { taken: new Date().toISOString(), viewport: spec.viewport, userAgent: body.userAgent }, root, opts.port, prev);
          const out = writeAll(P, checked, capture, opts);
          const defects = fails.map((r) => 'СР6 снимок ' + r.id + ' — ' + r.fail).concat(jsErr.map((r) => 'СР6 снимок ' + r.id + ' — ошибки JS на странице: ' + r.errors.join('; ')));
          console.log(report('dev-spec', { defects, written: out.written, stats: out.stats }));
          send(200, TYPES['.json'], JSON.stringify({ ok: !defects.length, text: out.stats.join(' · ') + (defects.length ? ' · ' + defects.length + ' замечаний — см. консоль' : '') }));
          setTimeout(() => server.close(() => process.exit(defects.length ? 1 : 0)), 200);
          return;
        }
        send(404, TYPES['.json'], '{"ok":false}');
      });
      return;
    }
    let rel;
    try { rel = decodeURIComponent(url.pathname); } catch { return send(400, TYPES['.txt'], 'плохой адрес'); }
    let file = path.join(root, rel);
    if (!file.startsWith(root)) return send(403, TYPES['.txt'], 'вне корня');
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!existsSync(file)) return send(404, TYPES['.txt'], 'нет файла');
    const ext = path.extname(file).toLowerCase();
    let buf = readFileSync(file);
    if (ext === '.html' && url.searchParams.has('__snap')) buf = injectFreeze(buf.toString('utf8'));
    send(200, TYPES[ext] || 'application/octet-stream', buf);
  });
  server.on('error', (e) => { console.log('ОШИБКА: сервер на порту ' + opts.port + ' — ' + e.message + ' (другой порт: --port)'); process.exit(1); });
  server.listen(opts.port, '127.0.0.1', () => {
    console.log('проверки: OK · снимков к съёмке: ' + only.length + (prev ? ' (остальные — из генерата)' : ''));
    console.log('');
    console.log('Откройте в браузере:  http://localhost:' + opts.port + '/__devspec/');
    console.log('Страница снимет состояния сама; по строке «готово» сервер соберёт спеку и закроется.');
  });
}

/* ---------------- генерат ---------------- */

const HEADER = '/* СГЕНЕРИРОВАН dev-spec.mjs (RE0016) из refs/';

/** Прежний генерат → capture (для --text и --only) или null. */
export function readGenerat(dataAbs, name) {
  const file = path.join(dataAbs, name + '.dev-spec.js');
  if (!existsSync(file)) return null;
  const win = { DEV_SPECS: [] };
  try { vm.runInNewContext(readFileSync(file, 'utf8'), { window: win }); } catch { return null; }
  const rec = win.DEV_SPECS.find((x) => x.id === name);
  if (!rec) return null;
  return captureFromHtml(rec.html);
}

/** Данные снимков из автономного html → capture. */
export function captureFromHtml(html) {
  const m = /<script type="application\/json" id="devspec-data">([\s\S]*?)<\/script>/.exec(html);
  if (!m) return null;
  const d = JSON.parse(m[1]);
  const snaps = {};
  for (const [id, s] of Object.entries(d.snaps)) snaps[id] = { w: s.w, h: s.h, htmlAttrs: s.htmlAttrs, body: s.body, local: s.local ? [s.local] : [], errors: [] };
  return { taken: d.capture.taken, viewport: d.capture.viewport, userAgent: d.capture.userAgent, shared: d.shared || [], fonts: d.fonts || [], snaps };
}

function generatText(spec, md, html, P, specAbs, capture) {
  const rec = { id: spec.spec, title: spec.title, module: spec.module, version: spec.version, date: spec.date, designer: spec.designer,
    snaps: spec.snaps.filter((s) => capture.snaps[s.id]).length, viewport: capture.viewport, taken: capture.taken, md, html };
  return HEADER + spec.spec + '/' + spec.spec + SUFFIX + '. Руками не править. */\n'
    + '/* Источник: ' + P.rel(specAbs) + '; пересборка — node .agents/tools/dev-spec.mjs ' + P.rel(specAbs) + ' */\n'
    + 'window.DEV_SPECS = window.DEV_SPECS || [];\n'
    + 'window.DEV_SPECS = window.DEV_SPECS.filter(function (x) { return x.id !== ' + JSON.stringify(spec.spec) + '; });\n'
    + 'window.DEV_SPECS.push(' + JSON.stringify(rec) + ');\n';
}

function indexText(names) {
  return '/* СГЕНЕРИРОВАН dev-spec.mjs (RE0016): список спек на разработку. Руками не править. */\n'
    + '/* Страница подключает этот файл обычным <script>; он дописывает теги спек (file:// без fetch). */\n'
    + '(function () {\n'
    + '  var files = ' + JSON.stringify(names.map((n) => n + '.dev-spec.js')) + ';\n'
    + '  var me = document.currentScript, base = me && me.src ? me.src.replace(/[^\\/]*$/, \'\') : \'\';\n'
    + '  window.DEV_SPECS = window.DEV_SPECS || [];\n'
    + '  for (var i = 0; i < files.length; i++) document.write(\'<script src="\' + base + files[i] + \'"><\\/script>\');\n'
    + '})();\n';
}

function writeAll(P, checked, capture, opts) {
  const { spec, body, place } = checked;
  const md = exportMd(spec, body, capture);
  const html = exportHtml(spec, body, capture);
  mkdirSync(place.dataAbs, { recursive: true });
  const genAbs = path.join(place.dataAbs, spec.spec + '.dev-spec.js');
  writeFileSync(genAbs, generatText(spec, md, html, P, opts.specAbs, capture));
  const names = readdirSync(place.dataAbs).filter((f) => f.endsWith('.dev-spec.js')).map((f) => f.slice(0, -'.dev-spec.js'.length)).sort();
  const idxAbs = path.join(place.dataAbs, INDEX);
  writeFileSync(idxAbs, indexText(names));
  const written = [P.rel(genAbs), P.rel(idxAbs)];
  if (opts.out) {
    const dir = path.join(path.resolve(opts.out), spec.spec);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, spec.spec + '.md'), md);
    writeFileSync(path.join(dir, spec.spec + '.html'), html);
    written.push(slash(dir) + '/');
  }
  const kb = (s) => Math.round(Buffer.byteLength(s) / 1024) + ' КБ';
  const missing = spec.snaps.filter((s) => !capture.snaps[s.id]).map((s) => s.id);
  return { written, stats: ['снимков ' + (spec.snaps.length - missing.length) + '/' + spec.snaps.length, 'html ' + kb(html), 'md ' + kb(md)].concat(missing.length ? ['не сняты: ' + missing.join(', ')] : []) };
}

/* ---------------- отчёт и запуск ---------------- */

function report(title, res) {
  const out = [title];
  for (const w of res.written || []) out.push('записан ' + w);
  for (const s of res.stats || []) out.push('  ' + s);
  for (const d of res.defects) out.push('  ' + d);
  out.push('ВЕРДИКТ: ' + (res.defects.length ? 'FAIL — ' + res.defects.length + ' замечаний' : 'OK'));
  return out.join('\n');
}

function option(args, name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : fallback;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--selftest') || args.includes('--self-test')) return selftest();
  const file = args.find((a) => !a.startsWith('--') && a.endsWith(SUFFIX));
  if (!file) {
    console.log('Использование:\n  dev-spec.mjs <…/refs/<Spec>/<Spec>' + SUFFIX + '> [--check | --text] [--port 8766] [--settle 700] [--only id,id] [--out <папка>]\n  dev-spec.mjs --selftest');
    process.exit(1);
  }
  const P = need('dev-spec', HERE);
  if (!P.panel) { console.log(report('dev-spec', { defects: ['СР1 project.json → protoPanel нет: действия снимков разбирает ядро панели прототипа'] })); process.exit(1); }
  const core = loadCore(P);
  let ds = null;
  const lazyDs = () => (ds === null ? (ds = dsCorpus(P)) : ds);
  const specAbs = path.resolve(file);
  const checked = checkSpec(P, core, specAbs, lazyDs);
  const opts = {
    specAbs, port: Number(option(args, '--port', 8766)), settle: Number(option(args, '--settle', 700)),
    only: option(args, '--only', '').split(',').map((x) => x.trim()).filter(Boolean), out: option(args, '--out', null),
  };
  if (checked.defects.length || args.includes('--check')) {
    console.log(report('dev-spec --check ' + P.rel(specAbs), { defects: checked.defects }));
    process.exit(checked.defects.length ? 1 : 0);
  }
  const unknown = opts.only.filter((id) => !checked.spec.snaps.some((s) => s.id === id));
  if (unknown.length) { console.log(report('dev-spec', { defects: ['СР2 --only: снимков ' + unknown.join(', ') + ' нет в snaps'] })); process.exit(1); }
  if (args.includes('--text')) {
    const capture = readGenerat(checked.place.dataAbs, checked.spec.spec);
    if (!capture) { console.log(report('dev-spec --text', { defects: ['СР6 генерата ' + checked.spec.spec + '.dev-spec.js нет или он не читается: нужна съёмка (без --text)'] })); process.exit(1); }
    const out = writeAll(P, checked, capture, opts);
    const missing = checked.spec.snaps.filter((s) => !capture.snaps[s.id]).map((s) => 'СР6 снимок ' + s.id + ' не снят: досъёмка — --only ' + s.id);
    console.log(report('dev-spec --text', { defects: missing, written: out.written, stats: out.stats }));
    process.exit(missing.length ? 1 : 0);
  }
  serve(P, specAbs, checked, opts);
}

/* ---------------- самотест ---------------- */

function selftest() {
  const P = need('dev-spec --selftest', HERE);
  const core = loadCore(P);
  const cases = [];
  const t = (name, fn) => { fn(); cases.push(name); };

  const SRC = [
    '---',
    'spec: DemoSpec',
    'title: Демо',
    'module: postrade/deals-app',
    'version: "1.000"',
    'viewport: 1440x900',
    'snaps:',
    '  - id: tile-a',
    '    title: Тайл А',
    '    page: Tranche.preview.html?x=1',
    "    target: '#tile'",
    '    do:',
    "      - click: '[data-go]'",
    '  - id: page-b',
    '    title: Экран Б',
    '    page: Rsbu.preview.html',
    '    height: full',
    '---',
    '# Демо',
    '',
    '## 1. Коротко',
    'Текст **жирный** и `код`.',
    '<!-- snap: page-b -->',
    '## 2. Сценарий',
    '1. Шаг один',
    '2. Шаг два',
    '   - вложенный',
    '<!-- snaps: tile-a page-b -->',
    '## 3. Экраны', 'Нет.', '## 4. Новые локальные компоненты', '| A | B |', '|---|---|', '| `a|b` | 2 |',
    '## 5. Данные и API', 'Нет.', '## 6. Тексты', 'Нет.', '## 7. Открытые вопросы', 'Нет.',
  ].join('\n');

  const split = splitSource(SRC);
  const fm = readFrontMatter(core, split.fm);
  t('front matter: поля, снимки, действия', () => {
    assert.deepEqual(fm.errors, []);
    assert.equal(fm.spec.spec, 'DemoSpec');
    assert.deepEqual(fm.spec.viewport, { w: 1440, h: 900 });
    assert.equal(fm.spec.snaps.length, 2);
    assert.equal(fm.spec.snaps[0].do[0].verb, 'click');
    assert.equal(fm.spec.snaps[1].height, 'full');
    assert.equal(fm.spec.snaps[0].line, 8);
  });
  t('front matter: ошибки СР1/СР2 со строками файла', () => {
    const bad = readFrontMatter(core, 'spec: demo\ntitle: X\nmodule: m\nviewport: 10x\nsnaps:\n  - id: A\n    page: p.html\n    height: half');
    const codes = bad.errors.map((e) => e.code + ':' + e.line);
    assert.ok(codes.includes('СР1:2'), codes.join(' '));
    assert.ok(codes.includes('СР2:5'), codes.join(' '));
    assert.ok(codes.includes('СР2:7'), codes.join(' '));
    assert.ok(bad.errors.some((e) => /height/.test(e.text)));
  });
  t('текст: разделы и маркеры (СР5)', () => {
    assert.deepEqual(bodyDefects(fm.spec, split.body, split.bodyLine), []);
    const lost = bodyDefects(fm.spec, split.body.replace('## 6. Тексты', '## 6. Подписи').replace('<!-- snap: page-b -->', '<!-- snap: page-x -->'), split.bodyLine);
    assert.ok(lost.some((e) => /«## 6\. Тексты»/.test(e.text)));
    assert.ok(lost.some((e) => /page-x/.test(e.text)));
    const unused = bodyDefects(fm.spec, split.body.replace('<!-- snaps: tile-a page-b -->', ''), split.bodyLine);
    assert.ok(unused.some((e) => /tile-a.*нет его маркера/.test(e.text)));
  });
  t('номера снимков — по первому появлению', () => {
    assert.deepEqual({ ...numberSnaps(markersOf(split.body)) }, { 'page-b': 1, 'tile-a': 2 });
  });
  t('markdown: строчная разметка, списки, таблица с | в коде', () => {
    assert.equal(inline('a **b** *c* `d<e>` [x](y)'), 'a <strong>b</strong> <em>c</em> <code>d&lt;e&gt;</code> <a href="y">x</a>');
    assert.equal(inline('snake_case и 2*3*4'), 'snake_case и 2*3*4');
    const h = mdToHtml(split.body.split('## 3.')[0].replace(/<!--[^>]*-->/g, ''));
    assert.ok(/<ol><li>Шаг один<\/li><li>Шаг два\s*<ul><li>вложенный<\/li><\/ul><\/li><\/ol>/.test(h), h);
    const tb = mdToHtml('| A | B |\n|---|---:|\n| `a|b` | 2 |');
    assert.ok(tb.includes('<td><code>a|b</code></td><td style="text-align:right">2</td>'), tb);
  });
  const capture = {
    taken: '2026-10-12T09:00:00Z', viewport: { w: 1440, h: 900 }, userAgent: 'test',
    shared: [':root{--x:1px}', '.tile{color:red}'], fonts: ['@font-face{font-family:"T";src:url("data:font/otf;base64,AA")}'],
    snaps: { 'tile-a': { w: 300, h: 200, htmlAttrs: 'lang="ru"', body: '<body><div data-snap-target class="tile">A</div></body>', local: ['.x{}'] } },
  };
  t('выгрузка md: front matter убран, маркеры — строки, приложение со снимками', () => {
    const md = exportMd(fm.spec, split.body, capture);
    assert.ok(!md.includes('snaps:'));
    assert.ok(md.includes('> **Снимок 2** — Тайл А · 300 × 200 px (`DemoSpec.html#snap-tile-a`)'), md);
    assert.ok(md.includes('> **Снимок 1** — Экран Б · не снят'));
    assert.ok(/## Снимки\n\n\| № \|/.test(md));
    assert.ok(md.includes('| 2 | Тайл А | `Tranche.preview.html?x=1` | кадр #tile | 300 × 200 px |'));
  });
  t('выгрузка html: снимки, оглавление, данные; круг через captureFromHtml', () => {
    const html = exportHtml(fm.spec, split.body, capture);
    assert.ok(html.includes('id="snap-tile-a" data-snap="tile-a"'));
    assert.ok(html.includes('sp-snap--missing" id="snap-page-b"'));
    assert.ok(html.includes('href="#1-коротко"'), 'оглавление');
    assert.ok(!/<\/script>[\s\S]*<\/script>[\s\S]*<\/script>[\s\S]*<\/script>/.test(html.split('id="devspec-data">')[1].split('</head>')[0]), 'JSON не рвёт тег script');
    const back = captureFromHtml(html);
    assert.equal(back.snaps['tile-a'].w, 300);
    assert.equal(back.snaps['tile-a'].body, capture.snaps['tile-a'].body);
    const again = exportHtml(fm.spec, split.body, back);
    assert.equal(captureFromHtml(again).snaps['tile-a'].local[0], '.x{}');
  });
  t('маркер в пункте списка — снимок, а не текст; в md — с отступом пункта', () => {
    const body = '# Д\n\n1. Шаг\n   <!-- snap: tile-a -->\n2. Дальше\n';
    const h = mdToHtml(body, { snap: (m) => '<figure data-snap="' + m.ids[0] + '"></figure>' });
    assert.ok(h.includes('<figure data-snap="tile-a"></figure>'), h);
    assert.ok(!h.includes('&lt;!--'), h);
    assert.ok(/<ol><li>Шаг\s*<figure[^>]*><\/figure><\/li><li>Дальше<\/li><\/ol>/.test(h), h);
    assert.ok(exportMd(fm.spec, body, capture).includes('\n   > **Снимок 1** — Тайл А'));
  });
  t('адреса сервера → data-URI', () => {
    const logo = path.join(P.dsAbs, 'assets', 'logo.svg');
    if (!existsSync(logo)) return;
    const rel = '/' + slash(path.relative(P.root, logo));
    const out = inlineUrls('a url("http://localhost:9999' + rel + '") b http://127.0.0.1:9999/нет.svg', P.root, 9999);
    assert.ok(out.includes('url("data:image/svg+xml;base64,'));
    assert.ok(out.includes('http://127.0.0.1:9999/нет.svg'), 'несуществующий файл — как есть');
  });
  t('сведение ответов: порядок правил листа, шрифты без повторов, неудачные пропущены', () => {
    const r = (id, k, t2) => ({ id, w: 1, h: 1, x: 0, y: 0, htmlAttrs: '', body: '<body></body>', local: [], errors: [], fonts: ['@font-face{a}'], shared: [{ sheet: 's1', rules: [{ k, t: t2 }] }] });
    const c = mergeCapture([r('a', [10], '.b{}'), r('b', [2], '.a{}'), { id: 'c', fail: 'нет' }], { taken: 'x', viewport: { w: 1, h: 1 } }, P.root, 1);
    assert.deepEqual(c.shared, ['.a{}', '.b{}']);
    assert.deepEqual(c.fonts, ['@font-face{a}']);
    assert.deepEqual(Object.keys(c.snaps), ['a', 'b']);
  });
  console.log('dev-spec --selftest');
  for (const c of cases) console.log('  ok  ' + c);
  console.log('ВЕРДИКТ: OK — ' + cases.length + ' проверок');
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === SELF) {
  try { main(); } catch (e) { console.log('ОШИБКА: dev-spec — ' + (e && e.stack || e)); process.exit(1); }
}

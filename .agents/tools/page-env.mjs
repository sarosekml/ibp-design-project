/* ============================================================
   PAGE-ENV — одна загрузка страницы в модели браузера (RE0020, Э5).

   Зовёт page-run.mjs, по процессу на загрузку; руками не запускается.
   Задание — JSON на stdin, итог — одна строка `PAGE-RUN:` + JSON на stdout.
   Больше в stdout ничего не пишется: консоль страницы собирается в итог.

   Страница разбирается как в браузере: исходник переносится в живой документ
   узел за узлом, скрипт исполняется в своей позиции (`readyState = 'loading'`,
   `document.write` вставляет текст в точку разбора, `currentScript` — сам тег),
   после каждого скрипта — контрольная точка микрозадач, таймеры страницы на
   время разбора придерживаются (урок Л232). Поэтому цепочку
   `ds-config.js → ThemeBoot → ds-body.js → ds.js → панель` выполняет сама
   страница: рантаймы ДС, скрипты страницы и панели не подменяются и списком
   здесь не перечисляются (Л34).

   Модель окружения — что прогон НЕ воспроизводит — печатается в каждом отчёте
   строкой ОКРУЖЕНИЕ (MODEL ниже). Пробелы linkedom, которые модель закрывает:
   фаза перехвата и всплытие до window, атрибуты-обработчики `on…`, `checked`,
   `selectedIndex`, `form.elements`/`reset`, `label.control`, действие клика
   по умолчанию (флажок, переключатель, подпись, отправка формы), события мыши,
   клавиатуры и фокуса, узлы чужого документа (`DOMParser`) в живом дереве.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { HOOK_BINDS } from './hook-binds.mjs';

const SELF = fileURLToPath(import.meta.url);
const job = JSON.parse(fs.readFileSync(0, 'utf8'));
const require = createRequire(SELF);
const { parseHTML } = require(job.linkedom);
const lkPkg = (() => { try { return JSON.parse(fs.readFileSync(path.join(path.dirname(job.linkedom), '..', 'package.json'), 'utf8')); } catch { return {}; } })();

const MODEL = 'геометрия нулевая; стиль — только инлайн (CSS не каскадируется); наблюдатели размеров и пересечений не срабатывают; '
  + 'сеть наружу отклоняется, файлы проекта отдаются с диска (как ds-static), ответ — пока разбор ждёт следующий внешний скрипт; хранилища — в памяти, пустые; значение поля — атрибут; '
  + 'переход по ссылке и отправка формы не исполняются';

const t0 = performance.now();
const ROOT = job.root;
const pageFile = job.page;
const pageUrl = pathToFileURL(pageFile).href + (job.query ? '?' + job.query.replace(/^\?/, '') : '');
const srcFile = job.html || pageFile;
const srcHtml = fs.readFileSync(srcFile, 'utf8');
const srcUrl = pathToFileURL(srcFile).href;
const PANEL_SEL = '.pp-root, #pp-drawer, .pp-modal, .pp-hl, [data-pp-own]';

/* ---------------- находки и происхождение ---------------- */

const findings = [];
let stepLabel = null;   // шаг сценария, к которому относятся находки; null — загрузка
const add = (code, level, msg, extra = {}) => findings.push({ code, level, msg, step: stepLabel, ...extra });
const relOf = (u) => {
  try { return path.relative(ROOT, fileURLToPath(String(u).split(/[?#]/)[0])).split(path.sep).join('/'); } catch { return String(u); }
};
/* Чей файл: сценарий --scenario, ДС, панель, загрузчик, виджет, данные или страница. Пути — от
   манифеста проекта (их передаёт page-run), не угадываются по имени папки. */
const SCENARIO_REL = job.scenario ? relOf(pathToFileURL(job.scenario).href) : null;
function originOf(rel) {
  if (!rel || rel === '?') return 'среда';
  if (rel === SCENARIO_REL) return 'сценарий';   // код проверяющего, не страницы: ЖВ6 его не считает
  if (job.dsRel && rel.startsWith(job.dsRel + '/')) return 'ДС';
  if ((job.panelRel && rel.startsWith(job.panelRel + '/')) || rel === job.panelBoot) return 'панель';
  if ((job.boot || []).includes(rel)) return 'загрузчик';
  if (/\/widgets\//.test(rel)) return 'виджет';
  if (/\/data\//.test(rel)) return 'данные';
  return 'страница';
}
const PAGE_SIDE = new Set(['страница', 'виджет', 'данные']);
/* Кадры стека, принадлежащие коду страницы: адрес file:// (так именуются
   скрипты в vm), не этот файл и не зависимость. */
function framesOf(stack) {
  const out = [];
  for (const m of String(stack || '').matchAll(/(file:\/\/\/[^\s)]+?):(\d+):(\d+)/g)) {
    const file = m[1];
    if (file === pathToFileURL(SELF).href || /\/node_modules\//.test(file)) continue;
    const rel = relOf(file);
    out.push({ file: rel, line: +m[2], origin: originOf(rel) });
  }
  return out;
}
function report(e, where) {
  const frames = framesOf(e && e.stack);
  /* у SyntaxError скрипта в стеке «файл:строка» без колонки — первой строкой */
  const syn = !frames.length && /^(file:\/\/\/\S+?):(\d+)\s*$/m.exec(String(e && e.stack || ''));
  if (syn) { const rel = relOf(syn[1]); frames.push({ file: rel, line: +syn[2], origin: originOf(rel) }); }
  const top = frames[0] || { file: '?', line: null, origin: 'среда' };
  const by = frames.find((f) => PAGE_SIDE.has(f.origin));
  add('ЖВ1', 'FAIL', (e && e.message) || String(e), {
    where, file: top.file, line: top.line, origin: top.origin,
    from: by && by !== top ? by.file + ':' + by.line : null,
  });
}

/* ---------------- живой документ ---------------- */

const { window: lw, document } = parseHTML('<!doctype html><html><head></head><body></body></html>');
const src = parseHTML(srcHtml).document;
for (const a of src.documentElement.attributes) document.documentElement.setAttribute(a.name, a.value);

const g = {};
const ctx = vm.createContext(g);
const W = vm.runInContext('this', ctx);
/* глубже стек — точнее «вызвано из»: обработчик страницы сидит под исполнителем панели */
Error.stackTraceLimit = 40;
vm.runInContext('Error.stackTraceLimit = 40', ctx);

const protoOwning = (obj, key) => {
  for (let p = Object.getPrototypeOf(obj); p; p = Object.getPrototypeOf(p)) if (Object.prototype.hasOwnProperty.call(p, key)) return p;
  return null;
};
const define = (proto, key, desc) => Object.defineProperty(proto, key, { configurable: true, ...desc });
/* Прототипы — с живых узлов: классы окна linkedom — фасады. */
const probeEl = document.createElement('div');
const Elp = protoOwning(probeEl, 'getAttribute');
const HElp = protoOwning(probeEl, 'hidden') || Object.getPrototypeOf(Object.getPrototypeOf(probeEl));
const Nodep = protoOwning(probeEl, 'isConnected');
const ETp = protoOwning(probeEl, 'addEventListener');
const protoOf = (tag) => Object.getPrototypeOf(document.createElement(tag));
const InputP = protoOf('input'), SelectP = protoOf('select'), FormP = protoOf('form'), LabelP = protoOf('label'), OptionP = protoOf('option');

/* Узел подключён, если по родителям доходит до документа. У linkedom узел
   чужого документа (DOMParser, ds-include) в живом дереве считался бы
   отключённым — и исполнитель панели писал бы «скрыт». */
define(Nodep, 'isConnected', { get() { let n = this; while (n.parentNode) n = n.parentNode; return n === document; } });

/* ---------------- события ---------------- */

const Ev = lw.Event;
class UIEvent extends Ev { constructor(t, i = {}) { super(t, i); this.view = W; this.detail = i.detail || 0; } }
class MouseEvent extends UIEvent {
  constructor(t, i = {}) {
    super(t, i);
    for (const k of ['clientX', 'clientY', 'screenX', 'screenY', 'button', 'buttons']) this[k] = i[k] || 0;
    for (const k of ['altKey', 'shiftKey', 'ctrlKey', 'metaKey']) this[k] = !!i[k];
    this.relatedTarget = i.relatedTarget || null; this.pageX = this.clientX; this.pageY = this.clientY; this.offsetX = 0; this.offsetY = 0;
  }
}
class PointerEvent extends MouseEvent { constructor(t, i = {}) { super(t, i); this.pointerId = i.pointerId || 1; this.pointerType = i.pointerType || 'mouse'; this.isPrimary = true; } }
class WheelEvent extends MouseEvent { constructor(t, i = {}) { super(t, i); this.deltaX = i.deltaX || 0; this.deltaY = i.deltaY || 0; this.deltaMode = 0; } }
class KeyboardEvent extends UIEvent {
  constructor(t, i = {}) { super(t, i); this.key = i.key || ''; this.code = i.code || ''; for (const k of ['altKey', 'shiftKey', 'ctrlKey', 'metaKey', 'repeat', 'isComposing']) this[k] = !!i[k]; }
  getModifierState(k) { return !!this[{ Alt: 'altKey', Shift: 'shiftKey', Control: 'ctrlKey', Meta: 'metaKey' }[k]]; }
}
class FocusEvent extends UIEvent { constructor(t, i = {}) { super(t, i); this.relatedTarget = i.relatedTarget || null; } }
class DragEvent extends MouseEvent { constructor(t, i = {}) { super(t, i); this.dataTransfer = i.dataTransfer || null; } }

/* Ошибка слушателя не роняет диспетчер (как в браузере) и идёт в ЖВ1. */
const wrapMap = new WeakMap();
const wrapped = (type, fn) => {
  let w = wrapMap.get(fn);
  if (!w) {
    w = function (ev) {
      try { return typeof fn === 'function' ? fn.call(this, ev) : fn.handleEvent(ev); } catch (e) { report(e, 'обработчик ' + type); }
    };
    wrapMap.set(fn, w);
  }
  return w;
};
/* Фаза перехвата: linkedom вызывает слушатель с capture в фазе всплытия.
   Слушатели перехвата живут здесь и вызываются до диспетчера linkedom — от
   окна к цели; иначе перехват клика «снаружи меню» срабатывал бы после
   открытия меню и тут же его закрывал. */
const captureMap = new WeakMap();   // узел → тип → [{ fn, once }]
const isCapture = (opt) => opt === true || !!(opt && typeof opt === 'object' && opt.capture);
const origAdd = ETp.addEventListener, origRemove = ETp.removeEventListener, origDispatch = ETp.dispatchEvent;
ETp.addEventListener = function (type, fn, opt) {
  if (!fn) return;
  if (isCapture(opt)) {
    let byType = captureMap.get(this); if (!byType) captureMap.set(this, (byType = new Map()));
    const list = byType.get(type) || []; if (!list.some((x) => x.fn === fn)) list.push({ fn, once: !!(opt && opt.once) });
    byType.set(type, list); return;
  }
  return origAdd.call(this, type, wrapped(type, fn), opt);
};
ETp.removeEventListener = function (type, fn, opt) {
  if (isCapture(opt)) { const byType = captureMap.get(this), list = byType && byType.get(type); if (list) byType.set(type, list.filter((x) => x.fn !== fn)); return; }
  return origRemove.call(this, type, wrapMap.get(fn) || fn, opt);
};
const winTarget = () => lw.addEventListener && document._getParent();   // цель окна linkedom — родитель документа
function pathOf(node) {
  const out = [];
  for (let n = node; n; n = n.parentNode) out.push(n);
  if (out[out.length - 1] === document) out.push(winTarget());
  return out;
}
/* Атрибут `onclick="…"` — обработчик, как в браузере: тело компилируется в
   контексте страницы при первом событии этого типа на узле. */
const attrHandlers = new WeakMap();
function materializeAttr(node, type) {
  if (!node || node.nodeType !== 1 || !node.hasAttribute('on' + type)) return;
  let byType = attrHandlers.get(node); if (!byType) attrHandlers.set(node, (byType = new Map()));
  const code = node.getAttribute('on' + type);
  const prev = byType.get(type);
  if (prev && prev.code === code) return;
  if (prev) origRemove.call(node, type, prev.fn);
  let fn;
  try { fn = vm.runInContext('(function (event) {\n' + code + '\n})', ctx, { filename: pageUrl.split(/[?#]/)[0] + '#on' + type }); } catch (e) { report(e, 'атрибут on' + type); return; }
  const w = wrapped(type, fn);
  byType.set(type, { code, fn: w });
  origAdd.call(node, type, w);
}
const formState = new WeakMap();   // флажок/переключатель → checked после первого изменения
function activationOf(ev, target) {
  if (ev.type !== 'click' || !(ev instanceof MouseEvent)) return null;
  for (let n = target; n && n.nodeType === 1; n = n.parentNode) {
    const tag = n.tagName;
    if (tag === 'INPUT' && /^(checkbox|radio)$/i.test(n.getAttribute('type') || '')) return n;
    if (tag === 'INPUT' && /^(submit|reset|image)$/i.test(n.getAttribute('type') || '')) return n;
    if (tag === 'BUTTON') return n;
    if (tag === 'LABEL' || tag === 'SUMMARY' || (tag === 'A' && n.hasAttribute('href'))) return n;
  }
  return null;
}
ETp.dispatchEvent = function (ev) {
  const path = this.nodeType ? pathOf(this) : [this];
  for (const n of path) materializeAttr(n, ev.type);
  const act = activationOf(ev, this);
  const kind = act && act.tagName === 'INPUT' ? (act.getAttribute('type') || '').toLowerCase() : null;
  /* действие по умолчанию флажка — до диспетчеризации, откат при отмене */
  let undo = null;
  if (act && (kind === 'checkbox' || kind === 'radio') && !act.disabled) {
    const before = act.checked;
    const group = kind === 'radio' ? radioGroup(act).map((r) => [r, r.checked]) : [];
    act.checked = kind === 'checkbox' ? !before : true;
    undo = () => { act.checked = before; for (const [r, c] of group) r.checked = c; };
    undo.changed = act.checked !== before;
  }
  /* перехват: от окна к цели */
  ev.target = this;
  for (let i = path.length - 1; i >= 0 && !ev.cancelBubble; i--) {
    const byType = captureMap.get(path[i]), list = byType && byType.get(ev.type);
    if (!list || !list.length) continue;
    ev.currentTarget = path[i]; ev.eventPhase = i === 0 ? 2 : 1;
    for (const x of list.slice()) {
      if (x.once) byType.set(ev.type, byType.get(ev.type).filter((y) => y !== x));
      try { typeof x.fn === 'function' ? x.fn.call(path[i], ev) : x.fn.handleEvent(ev); } catch (e) { report(e, 'обработчик ' + ev.type); }
      if (ev._stopImmediatePropagationFlag) break;
    }
  }
  let result;
  if (ev.cancelBubble) { ev.eventPhase = 0; result = !ev.defaultPrevented; }
  else { delete ev.target; delete ev.currentTarget; result = origDispatch.call(this, ev); }
  if (act) afterActivation(act, kind, ev, undo);
  return result;
};
function radioGroup(r) {
  const name = r.getAttribute('name'); if (!name) return [r];
  const scope = r.closest('form') || document;
  return [...scope.querySelectorAll('input[type="radio"]')].filter((x) => x.getAttribute('name') === name);
}
function afterActivation(act, kind, ev, undo) {
  if (undo) {
    if (ev.defaultPrevented) { undo(); return; }
    if (undo.changed) { act.dispatchEvent(new lw.InputEvent('input', { bubbles: true })); act.dispatchEvent(new Ev('change', { bubbles: true })); }
    return;
  }
  if (ev.defaultPrevented || act.disabled) return;
  const tag = act.tagName;
  if (tag === 'LABEL') {
    const c = act.control;
    if (c && c !== ev.target && !c.contains(ev.target)) c.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return;
  }
  if (tag === 'SUMMARY') {
    const d = act.parentNode;
    if (d && d.tagName === 'DETAILS') { d.toggleAttribute('open'); d.dispatchEvent(new Ev('toggle')); }
    return;
  }
  const type = (act.getAttribute('type') || (tag === 'BUTTON' ? 'submit' : '')).toLowerCase();
  const form = act.form;
  if (!form) return;
  if (type === 'submit' || type === 'image') form.requestSubmit();
  else if (type === 'reset') form.reset();
}

/* ---------------- формы ---------------- */

define(InputP, 'checked', {
  get() { return formState.has(this) ? formState.get(this) : this.hasAttribute('checked'); },
  set(v) {
    v = !!v; formState.set(this, v);
    if (v && (this.getAttribute('type') || '').toLowerCase() === 'radio') for (const r of radioGroup(this)) if (r !== this) formState.set(r, false);
  },
});
define(InputP, 'defaultChecked', { get() { return this.hasAttribute('checked'); }, set(v) { this.toggleAttribute('checked', !!v); } });
const CONTROLS = 'input, select, textarea, button, fieldset, output, object';
for (const P of [InputP, SelectP, protoOf('textarea'), protoOf('button'), protoOf('fieldset'), protoOf('output')]) {
  if (!('form' in P)) define(P, 'form', { get() { const id = this.getAttribute('form'); return id ? document.getElementById(id) : this.closest('form'); } });
}
define(LabelP, 'control', {
  get() {
    const id = this.getAttribute('for');
    if (id) return document.getElementById(id);
    return this.querySelector('input:not([type="hidden"]), select, textarea, button');
  },
});
define(LabelP, 'htmlFor', { get() { return this.getAttribute('for') || ''; }, set(v) { this.setAttribute('for', v); } });
define(FormP, 'elements', {
  get() {
    const list = [...this.querySelectorAll(CONTROLS)];
    const id = this.id;
    if (id) for (const el of document.querySelectorAll('[form]')) if (el.getAttribute('form') === id && !list.includes(el)) list.push(el);
    const coll = Object.assign([], list);
    for (const el of list) for (const k of [el.getAttribute('name'), el.id]) if (k && !(k in coll)) coll[k] = el;
    coll.namedItem = (k) => coll[k] || null;
    coll.item = (i) => list[i] || null;
    return coll;
  },
});
define(FormP, 'length', { get() { return this.elements.length; } });
FormP.reset = function () {
  if (!this.dispatchEvent(new Ev('reset', { bubbles: true, cancelable: true }))) return;
  for (const el of this.querySelectorAll('input')) formState.delete(el);
};
FormP.requestSubmit = function (submitter) {
  const e = new Ev('submit', { bubbles: true, cancelable: true }); e.submitter = submitter || null;
  this.dispatchEvent(e);
};
FormP.submit = function () {};
for (const P of [HElp]) {
  if (!P.checkValidity) P.checkValidity = function () { return true; };
  if (!P.reportValidity) P.reportValidity = function () { return true; };
  if (!P.setCustomValidity) P.setCustomValidity = function () {};
  if (!('validity' in P)) define(P, 'validity', { get() { return { valid: true, valueMissing: false, customError: false }; } });
  if (!('willValidate' in P)) define(P, 'willValidate', { get() { return false; } });
  if (!('validationMessage' in P)) define(P, 'validationMessage', { get() { return ''; } });
}
InputP.select = function () {}; InputP.setSelectionRange = function () {};
const optionsOf = (sel) => [...sel.querySelectorAll('option')];
const optValue = (o) => (o.hasAttribute('value') ? o.getAttribute('value') : o.textContent.trim());
define(SelectP, 'selectedIndex', {
  get() { const o = optionsOf(this); const i = o.findIndex((x) => x.hasAttribute('selected')); return i >= 0 ? i : o.length && !this.multiple ? 0 : -1; },
  set(i) { optionsOf(this).forEach((o, k) => o.toggleAttribute('selected', k === +i)); },
});
define(SelectP, 'value', {
  get() { const o = optionsOf(this)[this.selectedIndex]; return o ? optValue(o) : ''; },
  set(v) { let hit = false; for (const o of optionsOf(this)) { const on = !hit && optValue(o) === String(v); o.toggleAttribute('selected', on); hit = hit || on; } },
});
define(SelectP, 'selectedOptions', { get() { return optionsOf(this).filter((o) => o.hasAttribute('selected')); } });
define(OptionP, 'value', { get() { return optValue(this); }, set(v) { this.setAttribute('value', v); } });

/* ---------------- геометрия, фокус, прочее ---------------- */

const zeroRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON() { return this; } });
const hiddenByModel = (el) => {
  for (let n = el; n && n.nodeType === 1; n = n.parentNode) {
    if (n.hasAttribute('hidden')) return true;
    const s = n.getAttribute('style') || '';
    if (/display\s*:\s*none/i.test(s) || /visibility\s*:\s*hidden/i.test(s)) return true;
  }
  return false;
};
Elp.getBoundingClientRect = function () { return zeroRect(); };
Elp.getClientRects = function () { return this.isConnected && !hiddenByModel(this) ? [zeroRect()] : []; };
Elp.checkVisibility = function () { return this.isConnected && !hiddenByModel(this); };
Elp.scrollIntoView = function () {}; Elp.scrollTo = function () {}; Elp.scrollBy = function () {};
Elp.animate = function () { return { finished: Promise.resolve(), ready: Promise.resolve(), cancel() {}, finish() {}, play() {}, pause() {}, reverse() {}, onfinish: null, addEventListener() {} }; };
Elp.getAnimations = function () { return []; };
if (!Elp.setPointerCapture) { Elp.setPointerCapture = function () {}; Elp.releasePointerCapture = function () {}; Elp.hasPointerCapture = function () { return false; }; }
for (const k of ['offsetWidth', 'offsetHeight', 'clientWidth', 'clientHeight', 'scrollWidth', 'scrollHeight', 'offsetTop', 'offsetLeft', 'clientTop', 'clientLeft']) {
  if (!(k in HElp)) define(HElp, k, { get() { return 0; } });
}
if (!('offsetParent' in HElp)) define(HElp, 'offsetParent', { get() { return this.isConnected && !hiddenByModel(this) ? document.body : null; } });
for (const k of ['scrollTop', 'scrollLeft']) if (!(k in Elp)) define(Elp, k, { get() { return 0; }, set() {} });
let active = null;
HElp.focus = function () {
  const prev = active; if (prev === this) return;
  active = this;
  if (prev) { prev.dispatchEvent(new FocusEvent('blur', { relatedTarget: this })); prev.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: this })); }
  this.dispatchEvent(new FocusEvent('focus', { relatedTarget: prev })); this.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: prev }));
};
HElp.blur = function () {
  if (active !== this) return;
  active = null; this.dispatchEvent(new FocusEvent('blur')); this.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
};
HElp.click = function () { if (!this.disabled) this.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: W })); };
define(document, 'activeElement', { get() { return active && active.isConnected ? active : document.body; } });
if (!('innerText' in HElp)) define(HElp, 'innerText', { get() { return this.textContent; }, set(v) { this.textContent = v; } });

/* ---------------- окно ---------------- */

const memStore = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(String(k)) ? m.get(String(k)) : null), setItem: (k, v) => { m.set(String(k), String(v)); },
    removeItem: (k) => { m.delete(String(k)); }, clear: () => m.clear(), key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; },
  };
};
const location = (() => {
  const loc = { assign() {}, replace() {}, reload() {}, toString() { return this.href; } };
  const set = (href) => {
    const u = new URL(href);
    Object.assign(loc, { href: u.href, protocol: u.protocol, host: '', hostname: '', port: '', origin: 'null', pathname: u.pathname, search: u.search, hash: u.hash });
  };
  set(pageUrl); loc._set = set;
  return loc;
})();
define(document, 'location', { get() { return location; } });
define(document, 'URL', { get() { return location.href; } });
define(document, 'documentURI', { get() { return location.href; } });
define(document, 'baseURI', { get() { return location.href; } });
let readyState = 'loading', currentScript = null, writeBuf = null;
define(document, 'readyState', { get() { return readyState; } });
define(document, 'currentScript', { get() { return currentScript; } });
define(document, 'defaultView', { get() { return W; } });
document.write = (...s) => { if (writeBuf) writeBuf.push(s.join('')); else add('ЖВ1', 'FAIL', 'document.write после загрузки — в браузере стёр бы страницу', { where: 'загрузка', file: '?', origin: 'страница' }); };
document.writeln = (...s) => document.write(s.join('') + '\n');
document.hasFocus = () => true;
document.elementFromPoint = () => null;
document.elementsFromPoint = () => [];
document.execCommand = () => false;
document.queryCommandSupported = () => false;
document.fonts = { ready: Promise.resolve(), check: () => true, load: () => Promise.resolve([]), addEventListener() {}, forEach() {}, status: 'loaded' };
for (const k of ['visibilityState']) define(document, k, { get() { return 'visible'; } });
define(document, 'hidden', { get() { return false; } });

/* Таймеры на время разбора придерживаются: между скриптами ход получает
   только очередь промисов (контрольная точка микрозадач браузера после
   каждого скрипта), таймер страницы в эту щель не проскакивает. После
   разбора придержанные запускаются со своими задержками. */
let parsing = true;
const held = new Map();
const realIds = new Map(); let realSeq = 0;
function later(fn, ms, repeat) {
  const id = ++realSeq + 100000;
  const start = () => realIds.set(id, (repeat ? setInterval : setTimeout)(fn, ms));
  if (parsing) held.set(id, start); else start();
  return id;
}
function cancel(id) { held.delete(id); const r = realIds.get(id); if (r) { clearTimeout(r); clearInterval(r); realIds.delete(id); } }
function releaseHeld() { parsing = false; for (const [, start] of held) start(); held.clear(); for (const answer of netQueue.splice(0)) later(answer, 1); }
const microtaskCheckpoint = () => new Promise((r) => setImmediate(r));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const noopObs = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
const cssDecl = (el) => {
  const st = el && el.style;
  return new Proxy({}, {
    get(_, k) {
      if (k === 'getPropertyValue') return (p) => (st && st.getPropertyValue ? st.getPropertyValue(p) : '') || '';
      if (k === 'display' && el && hiddenByModel(el)) return 'none';
      return (st && st[k]) || '';
    },
  });
};
/* fetch: файл внутри проекта — с диска, как статический сервер ds-static
   (решение человека 14.10.2026, вариант А); нет файла — 404; всё прочее —
   отказ сети. Ответ приходит задачей сети: во время разбора — пока разбор
   ждёт следующий внешний скрипт (браузер в это время разбирает ответы по
   порядку запросов), после разбора — следующим таймером. Иначе исходник с
   <ds-include> падал бы на каждом скрипте, который ищет узел виджета, — в
   браузере со статического сервера виджет к тому моменту уже вставлен. */
const netQueue = [];
function fetchModel(input) {
  const href = new URL(String(input && input.url || input), location.href).href;
  return new Promise((resolve, reject) => {
    const answer = () => {
      if (!href.startsWith('file:')) { reject(new TypeError('сеть отклонена моделью окружения: ' + href)); return; }
      const fp = fileURLToPath(href.split(/[?#]/)[0]);
      const inside = !path.relative(ROOT, fp).startsWith('..') && !path.isAbsolute(path.relative(ROOT, fp));
      if (!inside) { reject(new TypeError('вне проекта — отклонено моделью окружения: ' + href)); return; }
      if (!fs.existsSync(fp) || !fs.statSync(fp).isFile()) { resolve(new Response('', { status: 404, statusText: 'Not Found' })); return; }
      resolve(new Response(fs.readFileSync(fp), { status: 200, statusText: 'OK' }));
    };
    if (parsing) netQueue.push(answer); else later(answer, 1);
  });
}
/* Ответы сети, пришедшие к границе внешнего скрипта, и цепочки их промисов
   (тело ответа читается за несколько ходов — отсюда круги до тишины). */
async function deliverNet() {
  while (netQueue.length) {
    for (const answer of netQueue.splice(0)) answer();
    for (let i = 0; i < 8; i++) await microtaskCheckpoint();
  }
}
/* DOMParser: фрагмент без <html> у linkedom становится корнем, и body
   пустой — ds-include не нашёл бы корень виджета. */
class DOMParser {
  parseFromString(s, type) {
    if (!/html/i.test(String(type))) return new lw.DOMParser().parseFromString(s, type);
    const full = /<html[\s>]/i.test(s) ? s : '<!doctype html><html><head></head><body>' + s + '</body></html>';
    return parseHTML(full).document;
  }
}
const consoleLog = [];
const fmt = (a) => a.map((x) => (x && x.message && x.stack ? x.message : typeof x === 'object' && x !== null && x.nodeType ? '<' + (x.tagName || '#node').toLowerCase() + '>' : String(x))).join(' ');
const consoleModel = {};
for (const k of ['log', 'info', 'debug', 'trace', 'dir', 'table', 'group', 'groupCollapsed', 'groupEnd', 'time', 'timeEnd', 'timeLog', 'count', 'countReset', 'clear']) consoleModel[k] = () => {};
consoleModel.warn = (...a) => consoleLog.push({ level: 'warn', msg: fmt(a), step: stepLabel, frames: framesOf(new Error().stack) });
consoleModel.error = (...a) => consoleLog.push({ level: 'error', msg: fmt(a), step: stepLabel, frames: framesOf(new Error().stack) });
consoleModel.assert = (c, ...a) => { if (!c) consoleModel.error('Assertion failed:', ...a); };

function guard(f, args, where) {
  try { return typeof f === 'function' ? f.apply(W, args) : vm.runInContext(String(f), ctx); } catch (e) { report(e, where); }
}
Object.assign(g, {
  window: W, self: W, top: W, parent: W, globalThis: W, frames: W, frameElement: null, opener: null, closed: false, name: '', length: 0,
  document, location,
  navigator: { userAgent: 'page-run (linkedom)', language: 'ru-RU', languages: ['ru-RU'], platform: 'Win32', onLine: true, cookieEnabled: false,
    maxTouchPoints: 0, hardwareConcurrency: 4, clipboard: { writeText: () => Promise.reject(new Error('буфер обмена: нет в модели')), readText: () => Promise.reject(new Error('буфер обмена: нет в модели')) } },
  history: { length: 1, state: null, scrollRestoration: 'auto',
    pushState(s, t, h) { this.state = s; if (h != null) location._set(new URL(h, location.href).href); },
    replaceState(s, t, h) { this.pushState(s, t, h); }, back() {}, forward() {}, go() {} },
  localStorage: memStore(), sessionStorage: memStore(), console: consoleModel,
  setTimeout: (f, ms, ...a) => later(() => guard(f, a, 'таймер'), ms || 0), clearTimeout: cancel,
  setInterval: (f, ms, ...a) => later(() => guard(f, a, 'интервал'), Math.max(ms || 0, 4), true), clearInterval: cancel,
  requestAnimationFrame: (f) => later(() => guard(f, [performance.now()], 'кадр'), 16), cancelAnimationFrame: cancel,
  requestIdleCallback: (f) => later(() => guard(f, [{ timeRemaining: () => 10, didTimeout: false }], 'idle'), 1), cancelIdleCallback: cancel,
  queueMicrotask: (f) => queueMicrotask(() => guard(f, [], 'микрозадача')),
  structuredClone, URL, URLSearchParams, TextEncoder, TextDecoder, AbortController, AbortSignal, Blob, File: globalThis.File, FormData: globalThis.FormData,
  Headers, Request, Response, performance, crypto: globalThis.crypto, atob, btoa,
  matchMedia: (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null }),
  getComputedStyle: cssDecl, getSelection: () => ({ removeAllRanges() {}, addRange() {}, toString: () => '', rangeCount: 0, collapse() {}, selectAllChildren() {} }),
  ResizeObserver: noopObs, IntersectionObserver: noopObs, PerformanceObserver: noopObs,
  fetch: fetchModel,
  XMLHttpRequest: class { open() {} send() { throw new Error('XMLHttpRequest: сеть отклонена моделью окружения'); } setRequestHeader() {} addEventListener() {} abort() {} },
  innerWidth: 1440, innerHeight: 900, outerWidth: 1440, outerHeight: 900, devicePixelRatio: 1, scrollX: 0, scrollY: 0, pageXOffset: 0, pageYOffset: 0,
  screen: { width: 1440, height: 900, availWidth: 1440, availHeight: 900 },
  scrollTo() {}, scrollBy() {}, scroll() {}, alert() {}, confirm: () => true, prompt: () => null, open: () => null, close() {}, focus() {}, blur() {}, print() {}, postMessage() {},
  UIEvent, MouseEvent, PointerEvent, WheelEvent, KeyboardEvent, FocusEvent, DragEvent, ClipboardEvent: Ev, TouchEvent: UIEvent, AnimationEvent: Ev, TransitionEvent: Ev,
  DOMParser,
  CSS: { escape: (s) => String(s).replace(/[^a-zA-Z0-9_ -￿-]/g, (c) => '\\' + c), supports: () => false },
});
/* Интерфейсы DOM — из linkedom: модуля (классы) и окна (фасады с instanceof). */
const lk = require(job.linkedom);
for (const k of Object.keys(lk)) {
  if (/^(HTML|SVG|Node|Element|Event|CustomEvent|InputEvent|DocumentFragment|Document|Text|Comment|NodeList|NodeFilter|CharacterData|Attr|EventTarget|ShadowRoot|Range|TreeWalker)/.test(k) && !(k in g)) {
    try { g[k] = lw[k] || lk[k]; } catch { /* у фасада нет такого интерфейса */ }
  }
}
for (const k of ['MutationObserver', 'Range', 'Image', 'TreeWalker', 'customElements', 'CustomElementRegistry', 'Event', 'CustomEvent', 'InputEvent']) {
  try { if (lw[k]) g[k] = lw[k]; } catch { /* нет в окне */ }
}
/* окно — цель событий; это родитель документа у linkedom, поэтому всплытие до window работает */
const WT = winTarget();
for (const k of ['addEventListener', 'removeEventListener', 'dispatchEvent']) g[k] = (...a) => ETp[k].apply(WT, a);
process.on('unhandledRejection', (e) => report(e, 'промис'));
process.on('uncaughtException', (e) => report(e, 'исключение'));

/* ЖВ6: запрос `id`, пропавшего после рантаймов, кодом страницы. */
let goneIds = null;
const askedGone = new Set();
function noteGone(id, found) {
  if (found || !goneIds || !goneIds.has(id)) return;
  const frames = framesOf(new Error().stack);
  const by = frames.find((f) => PAGE_SIDE.has(f.origin));
  if (!by) return;
  const key = id + '@' + by.file + ':' + by.line;
  if (askedGone.has(key)) return;
  askedGone.add(key);
  add('ЖВ6', 'FAIL', `#${id} был в разметке при выполнении скриптов, после рантаймов ДС его нет, а скрипт его запрашивает — рантайм перестроил разметку, ссылка мертва (Л185)`,
    { file: by.file, line: by.line, origin: by.origin });
}
const origById = document.getElementById.bind(document);
document.getElementById = (id) => { const r = origById(id); noteGone(String(id), r); return r; };
const QSp = protoOwning(probeEl, 'querySelector');
const origQS = QSp.querySelector;
QSp.querySelector = function (sel) { const r = origQS.call(this, sel); const m = /^#([\w-]+)$/.exec(String(sel).trim()); if (m) noteGone(m[1], r); return r; };
if (Object.prototype.hasOwnProperty.call(document, 'querySelector') || protoOwning(document, 'querySelector') !== QSp) {
  const dq = document.querySelector.bind(document);
  document.querySelector = (sel) => { const r = dq(sel); const m = /^#([\w-]+)$/.exec(String(sel).trim()); if (m) noteGone(m[1], r); return r; };
}

/* ---------------- разбор ---------------- */

/* Строки инлайн-скриптов — от начала файла: номер ошибки должен вести в файл. */
const inlineAt = [];
for (const m of srcHtml.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
  if (/\ssrc\s*=/i.test(' ' + m[1])) continue;
  const at = m.index + m[0].indexOf('>') + 1;
  const before = srcHtml.slice(0, at);
  const line = before.split('\n').length - 1;
  inlineAt.push({ code: m[2], line, col: at - before.lastIndexOf('\n') - 1, used: false });
}
const loaded = [], dataScripts = [];
function runScript(el) {
  const s = el.getAttribute('src');
  const type = (el.getAttribute('type') || '').trim();
  if (type && !/^(text|application)\/(javascript|ecmascript)$|^module$/i.test(type)) return '';
  let code, filename, opts = {};
  if (s) {
    const abs = new URL(s, location.href).href;
    define(el, 'src', { get: () => abs });
    const fp = fileURLToPath(abs.split(/[?#]/)[0]);
    const rel = relOf(abs);
    const swap = job.swaps && job.swaps[fp];
    if (!swap && !fs.existsSync(fp)) {
      add('ЖВ2', 'FAIL', `src="${s}" ведёт в никуда — ${rel}`, { file: relOf(srcUrl), origin: 'страница' });
      el.dispatchEvent(new Ev('error')); return '';
    }
    code = fs.readFileSync(swap || fp, 'utf8');
    /* подмена (--swap) числится за исходным src: происхождение и путь — его, строки — подменного файла */
    filename = abs;
    loaded.push(rel);
    if (originOf(rel) === 'данные' || swap) dataScripts.push({ rel, code });
  } else {
    code = el.textContent;
    const hit = inlineAt.find((x) => !x.used && x.code === code);
    if (hit) { hit.used = true; opts = { lineOffset: hit.line, columnOffset: hit.col }; filename = srcUrl; } else filename = srcUrl + '#write';
  }
  currentScript = el; writeBuf = [];
  try { vm.runInContext(code, ctx, { filename, ...opts }); } catch (e) { report(e, 'загрузка'); }
  currentScript = null;
  const out = writeBuf.join(''); writeBuf = null;
  if (s) el.dispatchEvent(new Ev('load'));
  return out;
}
function fragOf(html) { const tpl = document.createElement('template'); tpl.innerHTML = html; return tpl.content; }
async function pump(srcParent, liveParent) {
  let n;
  while ((n = srcParent.firstChild)) {
    srcParent.removeChild(n);
    if (n.nodeType !== 1) { liveParent.appendChild(n); continue; }
    const tag = n.tagName.toLowerCase();
    if (tag === 'script') {
      if (n.hasAttribute('src')) await deliverNet();
      liveParent.appendChild(n);
      const written = runScript(n);
      if (written) await pump(fragOf(written), liveParent);   // document.write разбирается до микрозадач
      await microtaskCheckpoint();
      continue;
    }
    const kids = n.ownerDocument.createDocumentFragment();
    while (n.firstChild) kids.appendChild(n.firstChild);
    liveParent.appendChild(n);
    if (tag === 'template') { if (n.content) n.content.appendChild(kids); continue; }
    await pump(kids, n);
  }
}
/* свои узлы панели — по корням, найденным один раз: closest со списком селекторов
   на каждом узле у linkedom стоит секунды */
const panelRoots = () => new Set(document.querySelectorAll(PANEL_SEL));
const inPanel = (el, roots) => { for (let n = el; n; n = n.parentNode) if (roots.has(n)) return true; return false; };
const idsNow = () => { const roots = panelRoots(); return new Set([...document.querySelectorAll('[id]')].filter((e) => !inPanel(e, roots)).map((e) => e.id)); };

const tParse = performance.now();
await pump(fragOf(src.head.innerHTML), document.head);
for (const a of src.body.attributes) document.body.setAttribute(a.name, a.value);
await pump(fragOf(src.body.innerHTML), document.body);
const idsAtParse = idsNow();
releaseHeld();
readyState = 'interactive';
document.dispatchEvent(new Ev('readystatechange'));
document.dispatchEvent(new Ev('DOMContentLoaded', { bubbles: true }));
await sleep(0);
readyState = 'complete';
document.dispatchEvent(new Ev('readystatechange'));
const loadEv = new Ev('load'); ETp.dispatchEvent.call(WT, loadEv);
if (typeof W.onload === 'function') guard(W.onload, [loadEv], 'window.onload');
const msParse = Math.round(performance.now() - tParse);
await sleep(job.settle);
const idsLoaded = idsNow();
goneIds = new Set([...idsAtParse].filter((id) => !idsLoaded.has(id)));

/* ---------------- проверки состояния ---------------- */

const describe = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
const seenHooks = new Set();
function checkHooks() {
  const miss = new Map(), roots = panelRoots();
  for (const h of HOOK_BINDS) {
    for (const el of document.querySelectorAll('[' + h.hook + ']')) {
      if (seenHooks.has(el) || inPanel(el, roots)) continue;
      const b = h.bound(el, W);
      if (b !== false) continue;
      seenHooks.add(el);
      if (!miss.has(h)) miss.set(h, []);
      miss.get(h).push(describe(el) + '[' + h.hook + (el.getAttribute(h.hook) ? '="' + el.getAttribute(h.hook) + '"' : '') + ']');
    }
  }
  for (const [h, list] of miss) {
    add('ЖВ5', 'FAIL', `${list.length} узл. с ${h.hook} не связаны рантаймом: ${list.slice(0, 4).join(', ')}${list.length > 4 ? ' …' : ''} — разметка нарисована после загрузки без ${h.bind}, или у хука нет цели (Л93)`);
  }
}
function checkData() {
  for (const d of dataScripts) {
    const names = new Set([...d.code.matchAll(/(?:^|[^.\w$])window\.([A-Za-z_$][\w$]*)\s*=(?!=)/gm)].map((m) => m[1]));
    const lost = [...names].filter((n) => W[n] === undefined);
    if (lost.length) add('ЖВ3', 'FAIL', `файл данных присваивает ${lost.map((n) => 'window.' + n).join(', ')}, а после загрузки не определено — файл упал до присваивания или его перезаписали (Л184)`, { file: d.rel, origin: 'данные' });
  }
}
/* Состояние страницы без своих узлов панели: разметка плюс то, чего в
   разметке нет, — флажки и выбор списков. */
function pageState() {
  const roots = panelRoots();
  const body = document.body.cloneNode(true);
  for (const n of body.querySelectorAll(PANEL_SEL)) n.remove();
  const inputs = [...document.querySelectorAll('input[type="checkbox"], input[type="radio"]')].filter((e) => !inPanel(e, roots)).map((e) => (e.checked ? 1 : 0)).join('');
  return body.innerHTML + '|' + inputs + '|' + location.href;
}

checkHooks();
checkData();

const PP = W.ProtoPanel, runner = PP && PP._runner;
const result = {
  page: relOf(pageUrl), query: job.query || '', scripts: loaded.length, linkedom: lkPkg.version || '?',
  ms: { parse: msParse, total: 0 }, panel: !!runner, model: MODEL,
};

/* Точки входа сценариев панели на эту страницу (страница сравнивается по
   файлу, адрес — со своим query). */
if (runner && job.listFlows) {
  const here = path.resolve(pageFile).toLowerCase();
  result.entries = [];
  for (const f of runner.flows()) {
    for (let k = 0; k < f.steps.length; k++) {
      if (!f.steps[k].page) continue;
      let u; try { u = new URL(runner.entryUrl(f, k)); } catch { continue; }
      if (u.protocol !== 'file:' || path.resolve(fileURLToPath(u)).toLowerCase() !== here) continue;
      let to = k; while (to + 1 < f.steps.length && !f.steps[to + 1].page) to++;
      result.entries.push({ flow: f.id, from: k, to, query: u.search.replace(/^\?/, ''), title: f.title || f.id });
    }
  }
}

const doSteps = (st) => (st.do || []).filter(Boolean);
const passive = (acts) => acts.every((a) => a.verb === 'waitFor' || a.verb === 'wait');
if (job.flow) {
  const f = runner ? runner.flowById(job.flow.flow) : null;
  result.flow = { id: job.flow.flow, steps: [] };
  if (!runner) add('ЖВ7', 'FAIL', 'на странице нет исполнителя панели — сценарий не проигран');
  else if (!f) add('ЖВ7', 'FAIL', `сценария ${job.flow.flow} нет в данных панели`);
  else {
    for (let i = job.flow.from; i <= job.flow.to; i++) {
      const st = f.steps[i]; const acts = doSteps(st);
      stepLabel = (st.state != null ? 'State ' + String(st.state).padStart(2, '0') : 'шаг ' + (i + 1)) + (st.title ? ' «' + st.title + '»' : '');
      const before = pageState(), ts = performance.now();
      const r = acts.length ? await runner.play(acts) : { ok: true };
      await sleep(job.settle);
      const changed = pageState() !== before;
      result.flow.steps.push({ i, label: stepLabel, ok: r.ok, changed, actions: acts.length, ms: Math.round(performance.now() - ts) });
      if (!r.ok) {
        const a = r.action ? (W.ProtoPanelCore && W.ProtoPanelCore.describeAction ? W.ProtoPanelCore.describeAction(r.action) : r.action.verb) : '';
        add('ЖВ7', 'FAIL', `шаг не прошёл на действии ${r.index + 1} (${a}): ${r.message}`);
        break;
      }
      if (acts.length && !passive(acts) && !changed) add('ЖВ7', 'WARN', 'шаг выполнен, но страница не изменилась — действие ни к чему не привело');
      checkHooks();
    }
  }
}

if (job.scenario) {
  /* ЖВ9: сценарий не подменяет рантайм ДС — иначе проверяется подмена, а не страница. */
  const dsNames = Object.keys(W).filter((k) => /^(DS[A-Z]\w*|dsIcons)$/.test(k));
  const snap = new Map(dsNames.map((k) => [k, { obj: W[k], fns: Object.fromEntries(Object.entries(W[k] || {}).filter(([, v]) => typeof v === 'function')) }]));
  const actionOf = (a) => {
    if (a && a.verb) return a;
    const verb = Object.keys(a || {}).find((k) => ['click', 'fill', 'hover', 'focus', 'scroll', 'press', 'waitFor', 'wait', 'system'].includes(k));
    if (!verb) throw new Error('действие без глагола: ' + JSON.stringify(a));
    const v = a[verb], out = { ...a, verb }; delete out[verb];
    if (verb === 'wait') out.ms = v; else if (verb === 'press') out.key = v; else if (typeof v === 'string') out.target = v; else Object.assign(out, v);
    return out;
  };
  const page = {
    window: W, document,
    step(name) { stepLabel = String(name); },
    async do(actions) {
      if (!runner) throw new Error('на странице нет исполнителя панели — page.do недоступен');
      const list = (Array.isArray(actions) ? actions : [actions]).map(actionOf);
      const r = await runner.play(list);
      await sleep(job.settle);
      checkHooks();
      if (!r.ok) add('ЖВ8', 'FAIL', `действие ${r.index + 1} не прошло: ${r.message}`);
      return r.ok;
    },
    click(target, opts = {}) { return page.do([{ verb: 'click', target, ...opts }]); },
    check(cond, msg) { if (!cond) add('ЖВ8', 'FAIL', 'проверка не прошла: ' + (msg || '(без текста)')); return !!cond; },
    text(sel) {
      const el = document.querySelector(sel); if (!el) return null;
      const c = el.cloneNode(true); for (const n of c.querySelectorAll('.tip, [role="tooltip"]')) n.remove();
      return c.textContent.replace(/\s+/g, ' ').trim();
    },
    async changed(fn) { const b = pageState(); await fn(); await sleep(job.settle); return pageState() !== b; },
    wait: (ms) => sleep(ms),
  };
  try {
    const mod = await import(pathToFileURL(job.scenario).href);
    const fn = mod.default || mod.run;
    if (typeof fn !== 'function') throw new Error('сценарий не экспортирует функцию по умолчанию');
    stepLabel = 'сценарий';
    await fn(page);
  } catch (e) {
    add('ЖВ8', 'FAIL', 'сценарий упал: ' + (e && e.message || e), { file: relOf(pathToFileURL(job.scenario).href) });
  }
  stepLabel = null;
  const swapped = [];
  for (const [k, s] of snap) {
    if (W[k] !== s.obj) { swapped.push(k); continue; }
    for (const [fk, fv] of Object.entries(s.fns)) if (W[k][fk] !== fv) swapped.push(k + '.' + fk);
  }
  if (swapped.length) add('ЖВ9', 'FAIL', `сценарий подменил рантайм ДС: ${swapped.join(', ')} — прогон не засчитывается (Л34)`);
}

/* консоль страницы — в ЖВ4 */
const seenConsole = new Set();
for (const c of consoleLog) {
  const top = c.frames[0] || {};
  const key = c.level + c.msg;
  if (seenConsole.has(key)) continue;
  seenConsole.add(key);
  findings.push({ code: 'ЖВ4', level: c.level === 'error' ? 'FAIL' : 'WARN', msg: 'console.' + c.level + ': ' + c.msg.slice(0, 300), step: c.step, file: top.file, line: top.line, origin: top.origin });
}

result.ms.total = Math.round(performance.now() - t0);
result.findings = findings;
process.stdout.write('PAGE-RUN:' + JSON.stringify(result) + '\n', () => process.exit(0));

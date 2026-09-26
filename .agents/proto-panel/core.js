/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — ядро без DOM.

   Один файл для браузера и для Node (UMD): в браузере ядро ложится в
   window.ProtoPanelCore, в Node его отдаёт module.exports — так его
   загружает оснастка .agents/tools/proto-panel.mjs. Второй копии логики
   нет: зеркало panel-data.js, которое пишет панель при сохранении
   комментария, байт в байт совпадает с зеркалом инструмента, потому что
   текст строит одна функция mirrorText, и гейт не краснеет после записи
   из браузера.

   Что здесь:
     HOTKEYS           — сочетания панели: одна константа на рантайм и
                         включатель (его пишет генератор из этой же константы);
     parseYaml         — подмножество YAML с номерами строк; подмножество —
                         договор, он описан в README панели;
     readFlows         — схема flows.yaml и нормализованная модель сценариев;
     parseComments,
     serializeComments — comments.md: разбор и каноническая запись;
     cleanBody,
     oneLine           — каноническая форма текста и строки метаданных — та,
                         что ляжет в файл (по ней панель сверяет запись);
     mirrorData,
     mirrorText        — зеркало panel-data.js для страниц по file://;
     hash              — FNV-1a, 32 бита, по UTF-8 текста;
     selectorTokens    — разбор CSS-селектора без DOM: имена для проверки
                         сценария по разметке (ПН5);
     STATUS            — коды статусов комментария и подписи к ним.

   Форматы файлов и коды ПН — .agents/proto-panel/README.md.
   ============================================================ */
(function (root, factory) {
  var core = factory();
  if (typeof module === 'object' && module && module.exports) module.exports = core;
  else root.ProtoPanelCore = core;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---------------- горячие клавиши ---------------- */

  /* Модификаторы — Alt+Shift (на macOS Alt — это Option), клавиши — по
     event.code: они не зависят от раскладки. Смена сочетания — правка здесь
     и пересборка включателя (node .agents/tools/proto-panel.mjs). */
  var HOTKEYS = {
    mods: { alt: true, shift: true, ctrl: false, meta: false },
    toggle: 'KeyP',
    next: 'ArrowRight',
    prev: 'ArrowLeft',
    fix: 'KeyS',
    label: { toggle: 'Alt+Shift+P', next: 'Alt+Shift+→', prev: 'Alt+Shift+←', fix: 'Alt+Shift+S' }
  };
  HOTKEYS.codes = [HOTKEYS.toggle, HOTKEYS.next, HOTKEYS.prev, HOTKEYS.fix];

  /** Какое действие панели означает нажатие: 'toggle' | 'next' | 'prev' | 'fix' | null. */
  function hotkeyOf(e) {
    if (!e || !e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey) return null;
    if (e.code === HOTKEYS.toggle) return 'toggle';
    if (e.code === HOTKEYS.next) return 'next';
    if (e.code === HOTKEYS.prev) return 'prev';
    if (e.code === HOTKEYS.fix) return 'fix';
    return null;
  }

  /* ---------------- подмножество YAML ---------------- */

  var KEY_RX = /^([A-Za-z_][A-Za-z0-9_-]*) *:(?: +(.*))?$/;
  var DASH_RX = /^-( |$)/;

  function YamlError(line, text) { this.line = line; this.text = text; }

  function spaces(n) { return new Array(n + 1).join(' '); }

  /* Шапка — строки-комментарии в начале файла до первой значимой строки
     (пустые строки между ними не в счёт); без хвостовых пробелов. */
  function headerOf(lines) {
    var out = { text: [], at: Object.create(null) };
    for (var i = 0; i < lines.length; i++) {
      var t = lines[i].trim();
      if (t === '') continue;
      if (t.charAt(0) !== '#') break;
      out.text.push(lines[i].replace(/\s+$/, ''));
      out.at[i + 1] = true;
    }
    return out;
  }

  /**
   * Разбор подмножества YAML. { node, error, header, comments } — узлы с
   * номерами строк: map { entries: [{ key, line, value }] } · seq { items } ·
   * scalar { value, style: plain | quoted | block | empty }. header — строки
   * шапки; comments — номера строк с комментариями внутри документа (целые
   * строки после шапки и хвосты « #…» после значений): при переписывании
   * файла они потерялись бы.
   */
  function parseYaml(src) {
    var lines = String(src == null ? '' : src).replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
    var pos = 0;
    var header = headerOf(lines);
    var comments = [], noted = Object.create(null);
    function noteComment(i) { if (!noted[i]) { noted[i] = true; comments.push(i + 1); } }

    function fail(i, text) { throw new YamlError(i + 1, text); }

    function isBlank(i) {
      var t = lines[i].trim();
      return t === '' || t.charAt(0) === '#';
    }

    /* Следующая значимая строка (пустые и строки-комментарии пропускаются), без сдвига курсора дальше неё. */
    function next() {
      while (pos < lines.length && isBlank(pos)) { if (lines[pos].trim()) noteComment(pos); pos++; }
      if (pos >= lines.length) return -1;
      if (/^(---|\.\.\.)( |$)/.test(lines[pos])) fail(pos, 'разделитель документов «' + lines[pos].slice(0, 3) + '»: в файле один документ, несколько документов в подмножестве нет');
      return pos;
    }

    function indentOf(i) {
      var w = /^[ \t]*/.exec(lines[i])[0];
      if (w.indexOf('\t') >= 0) fail(i, 'таб в отступе: отступы — только пробелы');
      return w.length;
    }

    function selectorHint(i, r) {
      fail(i, 'значение начинается с «#»: без кавычек это комментарий — селектор возьмите в одинарные кавычки: \'' + r.split(/\s/)[0] + '\'');
    }

    function keyLineError(i, body) {
      var c = body.charAt(0);
      if (c === '"' || c === "'") fail(i, 'ключ в кавычках не поддерживается: ключ — латиница, цифры, «_» и «-»');
      if (c === '?' && /^\?( |$)/.test(body)) fail(i, 'сложные ключи («?») в подмножестве не поддерживаются');
      if (c === '[' || c === '{') fail(i, 'строка начинается с «' + c + '»: потоковых списков и словарей в подмножестве нет');
      var m = /^([^:\s]+) *:/.exec(body);
      if (m) {
        if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(m[1])) fail(i, 'ключ «' + m[1] + '»: только латиница, цифры, «_» и «-», первая — буква или «_»');
        fail(i, 'после «' + m[1] + ':» нужен пробел перед значением');
      }
      fail(i, 'ожидается «ключ: значение» или элемент списка «- …»');
    }

    function parseNode(ind) {
      var i = next();
      var body = lines[i].slice(ind);
      return DASH_RX.test(body) ? parseSeq(ind) : parseMap(ind);
    }

    function parseMap(ind) {
      var node = { kind: 'map', line: pos + 1, entries: [] };
      var seen = Object.create(null);
      for (;;) {
        var i = next();
        if (i < 0) break;
        var li = indentOf(i);
        if (li < ind) break;
        if (li > ind) fail(i, 'лишний отступ: строка глубже соседних ключей');
        var body = lines[i].slice(ind);
        if (DASH_RX.test(body)) fail(i, 'элемент списка «- » на уровне ключей словаря: список пишется под своим ключом');
        var m = KEY_RX.exec(body);
        if (!m) keyLineError(i, body);
        if (seen[m[1]]) fail(i, 'ключ «' + m[1] + '» повторяется (впервые — строка ' + seen[m[1]] + ')');
        seen[m[1]] = i + 1;
        pos = i + 1;
        node.entries.push({ key: m[1], line: i + 1, value: afterKey(m[2] || '', ind, i) });
      }
      return node;
    }

    function afterKey(rest, keyCol, i) {
      var r = rest.replace(/^ +/, '');
      if (r === '' || /^#(\s|$)/.test(r)) {
        if (r) noteComment(i);
        var j = next();
        if (j >= 0) {
          var lj = indentOf(j);
          var bj = lines[j].slice(lj);
          var dash = DASH_RX.test(bj);
          if (lj > keyCol) {
            if (!dash && bj.indexOf(':') < 0) fail(j, 'значение пишется в той же строке, что и ключ; многострочный текст — блоком «|»');
            return parseNode(lj);
          }
          if (lj === keyCol && dash) return parseSeq(lj);
        }
        return { kind: 'scalar', line: i + 1, value: null, style: 'empty' };
      }
      if (r.charAt(0) === '#') selectorHint(i, r);
      if (r.charAt(0) === '|') return blockScalar(r, keyCol, i);
      if (r.charAt(0) === '>') fail(i, 'свёрнутый блок «>» в подмножестве не поддерживается: многострочный текст — блоком «|»');
      var v = inlineScalar(r, i);
      var k = next();
      if (k >= 0 && indentOf(k) > keyCol) fail(k, 'продолжение значения на следующей строке: многострочный текст — блоком «|»');
      return v;
    }

    function parseSeq(ind) {
      var node = { kind: 'seq', line: pos + 1, items: [] };
      for (;;) {
        var i = next();
        if (i < 0) break;
        var li = indentOf(i);
        if (li < ind) break;
        if (li > ind) fail(i, 'лишний отступ: строка глубже элементов списка');
        var body = lines[i].slice(ind);
        if (!DASH_RX.test(body)) break;
        var after = body.slice(1);
        var r = after.replace(/^ +/, '');
        if (r === '' || /^#(\s|$)/.test(r)) {
          if (r) noteComment(i);
          pos = i + 1;
          var j = next();
          if (j >= 0 && indentOf(j) > ind) node.items.push(parseNode(indentOf(j)));
          else node.items.push({ kind: 'scalar', line: i + 1, value: null, style: 'empty' });
          continue;
        }
        if (DASH_RX.test(r)) fail(i, 'вложенный список в строке элемента не поддерживается: пишите его с новой строки');
        if (KEY_RX.test(r)) {
          /* словарь внутри элемента: первый ключ стоит на колонке после «- » */
          lines[i] = spaces(ind + 1 + (after.length - r.length)) + r;
          node.items.push(parseMap(ind + 1 + (after.length - r.length)));
          continue;
        }
        pos = i + 1;
        if (r.charAt(0) === '#') selectorHint(i, r);
        if (r.charAt(0) === '|') { node.items.push(blockScalar(r, ind, i)); continue; }
        if (r.charAt(0) === '>') fail(i, 'свёрнутый блок «>» в подмножестве не поддерживается: многострочный текст — блоком «|»');
        var v = inlineScalar(r, i);
        var k = next();
        if (k >= 0 && indentOf(k) > ind) fail(k, 'продолжение значения на следующей строке: многострочный текст — блоком «|»');
        node.items.push(v);
      }
      return node;
    }

    function blockScalar(h, parentCol, i) {
      var m = /^\|(-?)(\s+#.*)?\s*$/.exec(h);
      if (!m) {
        if (/^\|[+0-9]/.test(h)) fail(i, 'у блока «|» в подмножестве есть только вариант «|-»: индикаторы «+» и отступа не поддерживаются');
        fail(i, 'после «|» — лишний текст: содержимое блока пишется со следующей строки');
      }
      if (m[2]) noteComment(i);
      pos = i + 1;
      var out = [], blockInd = -1;
      while (pos < lines.length) {
        var s = lines[pos];
        if (s.trim() === '') { out.push(''); pos++; continue; }
        var sp = /^ */.exec(s)[0].length;
        if (blockInd < 0) {
          if (sp <= parentCol) break;
          if (s.charAt(sp) === '\t') fail(pos, 'таб в отступе: отступы — только пробелы');
          blockInd = sp;
        }
        if (sp < blockInd) {
          if (s.charAt(sp) === '\t') fail(pos, 'таб в отступе: отступы — только пробелы');
          break;
        }
        out.push(s.slice(blockInd));
        pos++;
      }
      while (out.length && out[out.length - 1] === '') out.pop();
      var value = out.join('\n');
      if (!m[1] && out.length) value += '\n';
      return { kind: 'scalar', line: i + 1, value: value, style: 'block' };
    }

    function tail(rest, i, value) {
      if (!/^(\s+#.*|\s*)$/.test(rest)) fail(i, 'после закрывающей кавычки — лишний текст');
      if (rest.indexOf('#') >= 0) noteComment(i);
      return { kind: 'scalar', line: i + 1, value: value, style: 'quoted' };
    }

    function quoted1(r, i) {
      var out = '', k = 1;
      for (;;) {
        var q = r.indexOf("'", k);
        if (q < 0) fail(i, 'одинарная кавычка не закрыта в этой строке: многострочный текст — блоком «|»');
        out += r.slice(k, q);
        if (r.charAt(q + 1) === "'") { out += "'"; k = q + 2; continue; }
        return tail(r.slice(q + 1), i, out);
      }
    }

    function quoted2(r, i) {
      var out = '', k = 1;
      while (k < r.length) {
        var c = r.charAt(k);
        if (c === '"') return tail(r.slice(k + 1), i, out);
        if (c === '\\') {
          var e = r.charAt(k + 1);
          if (e === '"' || e === '\\') { out += e; k += 2; continue; }
          if (e === 'n') { out += '\n'; k += 2; continue; }
          if (e === 't') { out += '\t'; k += 2; continue; }
          if (e === 'u' && /^[0-9a-fA-F]{4}$/.test(r.substr(k + 2, 4))) {
            out += String.fromCharCode(parseInt(r.substr(k + 2, 4), 16));
            k += 6;
            continue;
          }
          fail(i, 'в двойных кавычках неизвестная последовательность «\\' + e + '»: допустимы \\" \\\\ \\n \\t \\uXXXX');
        }
        out += c;
        k++;
      }
      fail(i, 'двойная кавычка не закрыта в этой строке: многострочный текст — блоком «|»');
    }

    function typed(t) {
      if (t === 'true') return true;
      if (t === 'false') return false;
      if (t === 'null' || t === '~') return null;
      if (/^-?\d+$/.test(t)) return parseInt(t, 10);
      return t;
    }

    function inlineScalar(r, i) {
      var c = r.charAt(0);
      if (c === "'") return quoted1(r, i);
      if (c === '"') return quoted2(r, i);
      if (c === '[' || c === '{') fail(i, 'значение начинается с «' + c + '»: потоковых списков и словарей в подмножестве нет; селектор возьмите в одинарные кавычки');
      if (c === ']' || c === '}') fail(i, 'значение начинается с «' + c + '»: возьмите его в одинарные кавычки');
      if (c === '&' || c === '*') fail(i, 'якоря и ссылки («&», «*») в подмножестве не поддерживаются; если это текст — возьмите его в кавычки');
      if (c === '!') fail(i, 'теги («!») в подмножестве не поддерживаются; если это текст — возьмите его в кавычки');
      if (c === '%' || c === '@' || c === '`') fail(i, 'значение начинается с «' + c + '»: возьмите его в кавычки');
      if (/^[-?:]( |$)/.test(r)) fail(i, 'значение начинается с «' + c + ' »: возьмите его в кавычки');
      var cut = r.search(/\s#/);
      if (cut >= 0) noteComment(i);
      var text = (cut >= 0 ? r.slice(0, cut) : r).replace(/\s+$/, '');
      if (/:( |$)/.test(text)) fail(i, 'в значении «: » — так начинается словарь; возьмите значение в кавычки');
      return { kind: 'scalar', line: i + 1, value: typed(text), style: 'plain' };
    }

    /* комментарии внутри — всё, что не шапка */
    function inner() { return comments.filter(function (n) { return !header.at[n]; }).sort(function (a, b) { return a - b; }); }
    try {
      var root = null;
      var i0 = next();
      if (i0 >= 0) {
        if (indentOf(i0) !== 0) fail(i0, 'документ начинается с отступа');
        root = parseNode(0);
        var rest = next();
        if (rest >= 0) fail(rest, 'строка вне структуры документа: лишний отступ или ключ после списка верхнего уровня');
      }
      return { node: root, error: null, header: header.text, comments: inner() };
    } catch (e) {
      if (e instanceof YamlError) return { node: null, error: { line: e.line, text: e.text }, header: header.text, comments: inner() };
      throw e;
    }
  }

  /** Узлы разбора → обычные значения JS (для проверок; ключ «__proto__» не меняет прототип). */
  function yamlPlain(node) {
    if (!node) return null;
    if (node.kind === 'scalar') return node.value;
    if (node.kind === 'seq') return node.items.map(yamlPlain);
    var o = {};
    node.entries.forEach(function (e) {
      Object.defineProperty(o, e.key, { value: yamlPlain(e.value), enumerable: true, writable: true, configurable: true });
    });
    return o;
  }

  /* ---------------- flows.yaml: схема и модель ---------------- */

  var VERBS = ['click', 'fill', 'press', 'hover', 'focus', 'scroll', 'waitFor', 'wait'];
  var PARAMS = {
    click: ['target', 'text', 'index', 'timeout'],
    fill: ['target', 'value', 'index', 'timeout'],
    press: ['key', 'target', 'alt', 'shift', 'ctrl', 'meta'],
    hover: ['target', 'text', 'index', 'timeout'],
    focus: ['target', 'text', 'index', 'timeout'],
    scroll: ['target', 'text', 'block', 'index'],
    waitFor: ['target', 'text', 'state', 'timeout'],
    wait: []
  };
  var NEEDS_TARGET = { click: 1, fill: 1, hover: 1, focus: 1, scroll: 1, waitFor: 1 };
  var STATES = ['visible', 'hidden', 'present', 'absent'];
  var BLOCKS = ['start', 'center', 'end'];
  /* Пометки записи (задача 0005a, §5.6): подсказка агенту, не дефект. */
  var ISSUES = ['fragile', 'frame', 'drag', 'file', 'truncated'];
  var ID_RX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  var LIMITS = { timeout: 4000, timeoutMax: 15000, waitMax: 5000 };

  /* Расстояние правки для подсказки «может быть, title?» при опечатке в имени поля. */
  function distance(a, b) {
    var d = [];
    for (var i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (var j = 1; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
        if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
    return d[a.length][b.length];
  }

  function suggest(word, list) {
    var best = null, bd = 3;
    list.forEach(function (w) { var dd = distance(word.toLowerCase(), w.toLowerCase()); if (dd < bd) { bd = dd; best = w; } });
    return best;
  }

  /** Действие в полной форме со значениями по умолчанию — модель сценария. Порядок ключей постоянный: зеркало детерминировано. */
  function makeAction(p) {
    var verb = p.verb;
    var a = { verb: verb, target: null, text: null, index: 0, timeout: verb === 'wait' ? null : LIMITS.timeout, value: null, key: null,
      mods: { alt: false, shift: false, ctrl: false, meta: false },
      state: verb === 'waitFor' ? 'visible' : null, block: verb === 'scroll' ? 'center' : null, ms: null };
    Object.keys(p).forEach(function (k) {
      if (k === 'mods') { Object.keys(p.mods || {}).forEach(function (m) { if (m in a.mods) a.mods[m] = !!p.mods[m]; }); }
      else if (k in a) a[k] = p[k];
    });
    return a;
  }

  /** Действие в полной форме — как его показывают сообщения: click '#btnBuilder', click '.menu__item' “Краткий — PDF”. */
  function describeAction(a) {
    if (a.verb === 'wait') return 'wait ' + a.ms;
    if (a.verb === 'press') return 'press ' + a.key + (a.target ? ' → \'' + a.target + '\'' : '');
    return a.verb + ' \'' + a.target + '\'' + (a.text ? ' “' + a.text + '”' : '');
  }

  /**
   * flows.yaml → { flows, errors: [{ code: ПН1|ПН2, line, text }], meta, doc,
   * header, innerComments, numbering }.
   * При любой ошибке flows пуст (и doc — null): панель показывает ошибки, а не
   * половину сценария. meta — номера строк (для сообщений оснастки), в зеркало
   * не идёт. doc — документ для канонической записи: { header, version,
   * lastState, flows }. innerComments — строки с комментариями внутри файла:
   * при переписывании они потерялись бы (ПН11). numbering — шаги без номера,
   * повторы, негодные номера, lastState меньше максимума (ПН11, ПН12): файл
   * при этом читается, нумерацию чинит сборка.
   */
  function readFlows(src) {
    var numbering = { missing: [], duplicates: [], bad: [], low: null };
    var res = { flows: [], errors: [], meta: [], doc: null, header: [], innerComments: [], numbering: numbering };
    var parsed = parseYaml(src);
    res.header = parsed.header || [];
    res.innerComments = parsed.comments || [];
    if (parsed.error) {
      res.errors.push({ code: 'ПН1', line: parsed.error.line, text: parsed.error.text });
      return res;
    }
    var errs = res.errors;
    function err(node, text, line) { errs.push({ code: 'ПН2', line: line || (node && node.line) || 1, text: text }); }

    /* Словарь → { поле: запись }, неизвестные поля — ошибка с подсказкой. */
    function fields(node, allowed, where) {
      var out = {};
      node.entries.forEach(function (e) {
        if (allowed.indexOf(e.key) < 0) {
          var s = suggest(e.key, allowed);
          err(null, where + ': неизвестное поле «' + e.key + '»' + (s ? ' — может быть, «' + s + '»?' : '') + ' (допустимы: ' + allowed.join(', ') + ')', e.line);
          return;
        }
        out[e.key] = e;
      });
      return out;
    }

    function kindName(n) { return n.kind === 'map' ? 'словарь' : n.kind === 'seq' ? 'список' : typeof n.value === 'boolean' ? 'логическое значение' : 'значение'; }

    /* Строковое поле: число приводится к строке (title: 2025), пусто — ошибка у обязательного. */
    function str(entry, what, required, oneLine) {
      if (!entry) { return null; }
      var n = entry.value;
      if (n.kind !== 'scalar' || typeof n.value === 'boolean') { err(n, what + ' — строка, а не ' + kindName(n), entry.line); return null; }
      var v = n.value;
      if (v === null) { if (required) err(n, what + ' — пустое значение', entry.line); return null; }
      if (typeof v === 'number') v = String(v);
      if (!v.trim()) { if (required) err(n, what + ' — пустое значение', entry.line); return null; }
      if (oneLine) {
        v = v.replace(/\s+$/, '');
        if (v.indexOf('\n') >= 0) { err(n, what + ' — одна строка', entry.line); return null; }
      }
      return v;
    }

    /* Имя сущности для сообщений: по id, если он читается, иначе по номеру. */
    function named(node, prefix, n) {
      var e = node.entries.filter(function (x) { return x.key === 'id'; })[0];
      var v = e && e.value.kind === 'scalar' ? e.value.value : null;
      return prefix + ' ' + (typeof v === 'string' && v.trim() || typeof v === 'number' ? String(v).trim() : n);
    }

    function int(entry, what) {
      var n = entry.value;
      if (n.kind !== 'scalar' || typeof n.value !== 'number') { err(n, what + ' — целое число', entry.line); return null; }
      return n.value;
    }

    function bool(entry, what) {
      var n = entry.value;
      if (n.kind !== 'scalar' || typeof n.value !== 'boolean') { err(n, what + ' — true или false', entry.line); return false; }
      return n.value;
    }

    /* Номер состояния и lastState: негодное значение — не ошибка схемы, а
       нумерация (ПН12): файл читается, сборка выдаёт номер заново. */
    function number(entry, what, min) {
      var n = entry.value;
      if (n.kind === 'scalar' && typeof n.value === 'number' && n.value >= min) return n.value;
      numbering.bad.push({ what: what, line: entry.line, value: n.kind === 'scalar' ? n.value : kindName(n) });
      return null;
    }

    function readAction(node, where) {
      if (node.kind !== 'map') { err(node, where + ': действие — словарь «глагол: цель», например click: \'#btn\''); return null; }
      var verbs = node.entries.filter(function (e) { return VERBS.indexOf(e.key) >= 0; });
      var other = node.entries.filter(function (e) { return VERBS.indexOf(e.key) < 0; });
      if (!node.entries.length) { err(node, where + ': пустое действие'); return null; }
      if (verbs.length > 1) { err(node, where + ': два глагола в одном действии («' + verbs.map(function (e) { return e.key; }).join('», «') + '») — каждое действие отдельным элементом списка'); return null; }
      if (!verbs.length) {
        var s = suggest(other[0].key, VERBS);
        err(node, where + ': неизвестный глагол «' + other[0].key + '»' + (s ? ' — может быть, «' + s + '»?' : '') + ' (допустимы: ' + VERBS.join(', ') + ')', other[0].line);
        return null;
      }
      var ve = verbs[0], verb = ve.key;
      if (other.length) { err(node, where + ': «' + other[0].key + '» рядом с глаголом ' + verb + ' — параметры действия пишутся под глаголом (полная форма: ' + verb + ': с новой строки target, index…)', other[0].line); return null; }
      var a = makeAction({ verb: verb });
      var v = ve.value;
      var at = where + ', ' + verb;
      if (v.kind === 'scalar') {
        if (v.value === null) { err(v, at + ': нет значения — ' + (verb === 'wait' ? 'пауза в мс' : verb === 'press' ? 'клавиша' : 'селектор цели'), ve.line); return null; }
        if (verb === 'fill') { err(v, at + ': у fill нет короткой формы — нужны target и value (полная форма)', ve.line); return null; }
        if (verb === 'wait') {
          var ms = int(ve, at);
          if (ms === null) return null;
          if (ms < 1 || ms > LIMITS.waitMax) { err(v, at + ': пауза ' + ms + ' мс — допустимо от 1 до ' + LIMITS.waitMax + ' (дольше — ждать признак в DOM через waitFor)', ve.line); return null; }
          a.ms = ms;
          return a;
        }
        var t = str(ve, at, true, true);
        if (t === null) return null;
        if (verb === 'press') a.key = t; else a.target = t;
        return a;
      }
      if (v.kind !== 'map') { err(v, at + ': значение — селектор или словарь параметров, а не список', ve.line); return null; }
      if (verb === 'wait') { err(v, at + ': у wait только короткая форма — wait: 300', ve.line); return null; }
      var f = fields(v, PARAMS[verb], at);
      if (f.target) a.target = str(f.target, at + ', target', true, true);
      if (f.text) a.text = str(f.text, at + ', text', true, true);
      if (f.value) a.value = str(f.value, at + ', value', false, false) || '';
      if (f.key) a.key = str(f.key, at + ', key', true, true);
      if (f.index) { var ix = int(f.index, at + ', index'); if (ix !== null) a.index = ix; }
      if (f.timeout) {
        var to = int(f.timeout, at + ', timeout');
        if (to !== null && (to < 1 || to > LIMITS.timeoutMax)) err(f.timeout.value, at + ': timeout ' + to + ' мс — допустимо от 1 до ' + LIMITS.timeoutMax, f.timeout.line);
        else if (to !== null) a.timeout = to;
      }
      if (f.state) {
        var st = str(f.state, at + ', state', true, true);
        if (st !== null && STATES.indexOf(st) < 0) err(f.state.value, at + ': state «' + st + '» — допустимы: ' + STATES.join(', '), f.state.line);
        else if (st !== null) a.state = st;
      }
      if (f.block) {
        var bl = str(f.block, at + ', block', true, true);
        if (bl !== null && BLOCKS.indexOf(bl) < 0) err(f.block.value, at + ': block «' + bl + '» — допустимы: ' + BLOCKS.join(', '), f.block.line);
        else if (bl !== null) a.block = bl;
      }
      ['alt', 'shift', 'ctrl', 'meta'].forEach(function (k) { if (f[k]) a.mods[k] = bool(f[k], at + ', ' + k); });
      if (NEEDS_TARGET[verb] && !f.target) err(v, at + ': нет target — селектора цели', ve.line);
      if (verb === 'fill' && !f.value) err(v, at + ': нет value — что ввести', ve.line);
      if (verb === 'press' && !f.key) err(v, at + ': нет key — какую клавишу нажать', ve.line);
      return a;
    }

    var root = parsed.node;
    if (!root || root.kind !== 'map') { err(root, 'в корне файла ожидается словарь с ключами version и flows'); return res; }
    var top = fields(root, ['version', 'lastState', 'flows'], 'корень файла');
    if (!top.version) err(root, 'нет version: 1 — версии формата');
    else if (top.version.value.kind !== 'scalar' || top.version.value.value !== 1) err(top.version.value, 'version — 1: другой версии формата нет', top.version.line);
    var lastState = top.lastState ? number(top.lastState, 'lastState', 0) : null;
    if (!top.flows) { err(root, 'нет flows — списка сценариев (может быть пустым)'); return res; }
    var fl = top.flows.value;
    var flowItems = [];
    if (fl.kind === 'seq') flowItems = fl.items;
    else if (!(fl.kind === 'scalar' && fl.value === null)) err(fl, 'flows — список сценариев', top.flows.line);

    var flowIds = Object.create(null);
    flowItems.forEach(function (fn, fi) {
      if (fn.kind !== 'map') { err(fn, 'сценарий ' + (fi + 1) + ' — словарь с полями id, title, steps'); return; }
      var where = named(fn, 'сценарий', fi + 1);
      var ff = fields(fn, ['id', 'title', 'desc', 'steps'], where);
      var id = ff.id ? str(ff.id, where + ', id', true, true) : null;
      if (!ff.id) err(fn, where + ': нет id');
      if (id !== null) {
        if (!ID_RX.test(id)) err(ff.id.value, where + ': id — латиница в нижнем регистре, цифры и дефис (report-from-builder)', ff.id.line);
        else if (flowIds[id]) err(ff.id.value, where + ': id повторяется (впервые — строка ' + flowIds[id] + ')', ff.id.line);
        else flowIds[id] = ff.id.line;
      }
      var title = ff.title ? str(ff.title, where + ', title', true, true) : null;
      if (!ff.title) err(fn, where + ': нет title');
      var desc = ff.desc ? str(ff.desc, where + ', desc', false, true) : null;
      var flow = { id: id, title: title, desc: desc, steps: [] };
      var fmeta = { line: fn.line, steps: [] };
      var sv = ff.steps && ff.steps.value;
      if (!ff.steps) { err(fn, where + ': нет steps — шагов сценария (пустой сценарий — «steps:» без значения)'); }
      else if (sv.kind === 'scalar' && sv.value === null) { /* пустой сценарий: создан кнопкой New flow, шагов ещё нет */ }
      else if (sv.kind !== 'seq') { err(sv, where + ': steps — список шагов', ff.steps.line); }
      else {
        var stepIds = Object.create(null);
        sv.items.forEach(function (sn, si) {
          if (sn.kind !== 'map') { err(sn, where + ', шаг ' + (si + 1) + ' — словарь с полями id, title'); return; }
          var sw = named(sn, where + ', шаг', si + 1);
          var sf = fields(sn, ['state', 'id', 'title', 'page', 'note', 'recorded', 'issues', 'do'], sw);
          var num = sf.state ? number(sf.state, sw + ', state', 1) : null;
          var sid = sf.id ? str(sf.id, sw + ', id', true, true) : null;
          if (!sf.id) err(sn, sw + ': нет id');
          if (sid !== null) {
            if (!ID_RX.test(sid)) err(sf.id.value, sw + ': id — латиница в нижнем регистре, цифры и дефис (builder-open)', sf.id.line);
            else if (stepIds[sid]) err(sf.id.value, sw + ': id шага повторяется в сценарии (впервые — строка ' + stepIds[sid] + ')', sf.id.line);
            else stepIds[sid] = sf.id.line;
          }
          var stitle = sf.title ? str(sf.title, sw + ', title', true, true) : null;
          if (!sf.title) err(sn, sw + ': нет title');
          var page = sf.page ? str(sf.page, sw + ', page', true, true) : null;
          if (si === 0 && !sf.page) err(sn, sw + ': у первого шага сценария обязателен page — с него сценарий открывается');
          var note = sf.note ? str(sf.note, sw + ', note', false, false) : null;
          if (note !== null) note = note.replace(/\s+$/, '');
          var recorded = sf.recorded ? str(sf.recorded, sw + ', recorded', true, true) : null;
          if (recorded !== null && !validWhen(recorded)) { err(sf.recorded.value, sw + ': recorded «' + recorded + '» — ожидается ДД.ММ.ГГГГ ЧЧ:ММ', sf.recorded.line); recorded = null; }
          var issues = [];
          if (sf.issues) {
            var iv = sf.issues.value;
            if (iv.kind === 'seq') {
              iv.items.forEach(function (it) {
                if (it.kind !== 'scalar' || ISSUES.indexOf(it.value) < 0) err(it, sw + ': issues — пометка «' + (it.kind === 'scalar' ? it.value : kindName(it)) + '», известны: ' + ISSUES.join(', '), it.line);
                else if (issues.indexOf(it.value) < 0) issues.push(it.value);
              });
            } else if (!(iv.kind === 'scalar' && iv.value === null)) err(iv, sw + ': issues — список пометок', sf.issues.line);
          }
          var step = { state: num, id: sid, title: stitle, page: page, note: note || null, recorded: recorded, issues: issues, do: [] };
          var smeta = { line: sn.line, state: sf.state ? sf.state.line : null, badState: !!sf.state && num === null, page: sf.page ? sf.page.line : null, actions: [] };
          if (sf.do) {
            var dn = sf.do.value;
            if (dn.kind === 'seq') {
              dn.items.forEach(function (an, ai) {
                var act = readAction(an, sw + ', действие ' + (ai + 1));
                if (act) { step.do.push(act); smeta.actions.push(an.line); }
              });
            } else if (!(dn.kind === 'scalar' && dn.value === null)) err(dn, sw + ': do — список действий', sf.do.line);
          }
          flow.steps.push(step);
          fmeta.steps.push(smeta);
        });
      }
      res.flows.push(flow);
      res.meta.push(fmeta);
    });
    if (errs.length) { res.flows = []; res.meta = []; }
    else {
      var seen = Object.create(null), max = 0;
      res.flows.forEach(function (f, fi) {
        f.steps.forEach(function (s, si) {
          var sm = res.meta[fi].steps[si];
          if (s.state === null) { if (!sm.badState) numbering.missing.push({ flow: f.id, step: s.id, line: sm.line }); return; }
          if (seen[s.state]) numbering.duplicates.push({ state: s.state, flow: f.id, step: s.id, line: sm.state, first: seen[s.state] });
          else seen[s.state] = sm.state;
          max = Math.max(max, s.state);
        });
      });
      if (lastState !== null && lastState < max) numbering.low = { lastState: lastState, max: max, line: top.lastState.line };
      res.doc = { header: res.header, version: 1, lastState: lastState, flows: res.flows };
    }
    errs.sort(function (a, b) { return a.line - b.line; });
    return res;
  }

  /* ---------------- flows.yaml: каноническая запись ---------------- */

  var PARAM_ORDER = ['target', 'text', 'value', 'key', 'index', 'state', 'block', 'timeout', 'alt', 'shift', 'ctrl', 'meta'];

  /** Шапка flows.yaml по умолчанию — как у заготовки --enable. */
  function defaultFlowsHeader(title) {
    return [
      '# Сценарии показа прототипа' + (title ? ' ' + title : '') + ' — панель прототипа.',
      '# Формат — .agents/proto-panel/README.md, раздел «flows.yaml».',
      '# После правки: node .agents/tools/proto-panel.mjs (пересобрать зеркало).'
    ];
  }

  function ySingle(s) { return "'" + String(s).replace(/'/g, "''") + "'"; }
  function yDouble(s) {
    return '"' + String(s).replace(/[\\"]|[\u0000-\u001f\u007f]/g, function (c) {
      if (c === '\\' || c === '"') return '\\' + c;
      if (c === '\n') return '\\n';
      if (c === '\t') return '\\t';
      return '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4);
    }) + '"';
  }
  /* Простой скаляр — только если разбор подмножества вернёт ту же строку. */
  function yPlainOk(s) {
    return s !== '' && !/[\u0000-\u001f\u007f]/.test(s) && !/^\s|\s$/.test(s)
      && !/^[\[\]{}&*!|>'"%@#`]/.test(s) && !/^[-?:](\s|$)/.test(s)
      && !/:(\s|$)/.test(s) && !/\s#/.test(s) && !/^(-?\d+|true|false|null|~)$/.test(s);
  }
  /* Строка: простым скаляром, иначе в одинарных кавычках; перевод строки и
     прочие управляющие символы — только в двойных (с экранированием). */
  function yStr(s) {
    s = String(s);
    if (/[\u0000-\u0008\u000a-\u001f\u007f]/.test(s)) return yDouble(s);
    return yPlainOk(s) ? s : ySingle(s);
  }
  /* Многострочную note можно записать блоком «|», если разбор вернёт её же:
     отступ блока задаёт первая строка, строки из одних пробелов схлопнулись бы. */
  function canBlock(s) {
    var ls = s.split('\n');
    return ls[0] !== '' && !/^[ \t]/.test(ls[0]) && !/[\u0000-\u0008\u000b-\u001f\u007f]/.test(s)
      && ls.every(function (l) { return l === '' || l.trim() !== ''; });
  }

  function isDefaultParam(a, p) {
    if (p === 'target') return a.target == null;
    if (p === 'text') return a.text == null || a.text === '';
    if (p === 'value') return a.verb !== 'fill';   // у fill значение пишется всегда, даже пустое
    if (p === 'key') return a.key == null;
    if (p === 'index') return !a.index;
    if (p === 'state') return a.state == null || a.state === 'visible';
    if (p === 'block') return a.block == null || a.block === 'center';
    if (p === 'timeout') return a.timeout == null || a.timeout === LIMITS.timeout;
    return !(a.mods && a.mods[p]);   // alt, shift, ctrl, meta
  }

  /* Действие — минимальная форма: короткая, если кроме цели (клавиши) всё по умолчанию. */
  function actionLines(a, ind) {
    var pad = spaces(ind);
    if (a.verb === 'wait') return [pad + '- wait: ' + a.ms];
    var allowed = PARAMS[a.verb] || [];
    var set = PARAM_ORDER.filter(function (p) { return allowed.indexOf(p) >= 0 && !isDefaultParam(a, p); });
    var main = a.verb === 'press' ? 'key' : 'target';
    if (a.verb !== 'fill' && set.length === 1 && set[0] === main) {
      return [pad + '- ' + a.verb + ': ' + (main === 'target' ? ySingle(a.target) : yStr(a.key))];
    }
    var out = [pad + '- ' + a.verb + ':'], inner = spaces(ind + 4);
    set.forEach(function (p) {
      var v;
      if (p === 'target') v = ySingle(a.target);
      else if (p === 'value') v = yStr(a.value == null ? '' : a.value);
      else if (p === 'text' || p === 'key' || p === 'state' || p === 'block') v = yStr(a[p]);
      else if (p === 'index' || p === 'timeout') v = String(a[p]);
      else v = 'true';
      out.push(inner + p + ': ' + (p === 'value' && v === '' ? "''" : v));
    });
    return out;
  }

  /* Шаг: поля в постоянном порядке, пустые не пишутся. ind — отступ «- ». */
  function stepLines(s, ind) {
    var head = spaces(ind) + '- ', body = spaces(ind + 2), out = [], first = true;
    function field(line) { out.push((first ? head : body) + line); first = false; }
    if (s.state != null) field('state: ' + s.state);
    field('id: ' + yStr(s.id));
    if (s.title != null) field('title: ' + yStr(s.title));
    if (s.page) field('page: ' + yStr(s.page));
    if (s.note) {
      if (s.note.indexOf('\n') >= 0 && canBlock(s.note)) {
        field('note: |');
        s.note.split('\n').forEach(function (l) { out.push(l ? body + '  ' + l : ''); });
      } else field('note: ' + yStr(s.note));
    }
    if (s.recorded) field('recorded: ' + yStr(s.recorded));
    if (s.issues && s.issues.length) {
      field('issues:');
      s.issues.forEach(function (x) { out.push(body + '  - ' + yStr(x)); });
    }
    if (s.do && s.do.length) {
      field('do:');
      s.do.forEach(function (a) { actionLines(a, ind + 4).forEach(function (l) { out.push(l); }); });
    }
    return out;
  }

  /**
   * Каноническая запись flows.yaml (задача 0005a, §4.3): её пишут и панель, и
   * сборка, поэтому запись из браузера не даёт шумного диффа. Комментарии —
   * только шапкой. opts.header — шапка, если своей у файла нет (иначе
   * стандартная defaultFlowsHeader(opts.title)).
   */
  function serializeFlows(doc, opts) {
    opts = opts || {};
    var header = doc.header && doc.header.length ? doc.header : opts.header && opts.header.length ? opts.header : defaultFlowsHeader(opts.title);
    var out = header.map(function (l) { return String(l).replace(/\s+$/, ''); });
    out.push('version: ' + (doc.version || 1));
    if (doc.lastState != null) out.push('lastState: ' + doc.lastState);
    out.push('flows:');
    (doc.flows || []).forEach(function (f, fi) {
      if (fi) out.push('');
      out.push('  - id: ' + yStr(f.id));
      if (f.title != null) out.push('    title: ' + yStr(f.title));
      if (f.desc) out.push('    desc: ' + yStr(f.desc));
      out.push('    steps:');
      (f.steps || []).forEach(function (s) { stepLines(s, 6).forEach(function (l) { out.push(l); }); });
    });
    return out.join('\n') + '\n';
  }

  /* ---------------- номера состояний ---------------- */

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  /** Подпись номера: State 07, State 12, State 105. */
  function stateLabel(n) { return 'State ' + pad2(n); }
  /** Номер из ссылки: 07 · 7 · State 07 · state-07 → 7; иначе null. */
  function parseStateRef(s) {
    if (typeof s === 'number') return s > 0 && Math.floor(s) === s ? s : null;
    var m = /^\s*(?:state[\s-]*)?0*(\d+)\s*$/i.exec(String(s == null ? '' : s));
    return m && +m[1] > 0 ? +m[1] : null;
  }

  /**
   * Номера шагам без номера и повторам (у повтора номер меняет второй и
   * следующие, первый сохраняет), lastState — не меньше наибольшего номера.
   * Номера выдаются подряд после max(lastState, наибольший): удалённые не
   * возвращаются. → { changes: [{ flow, step, from, to, why }], lastState: { from, to } }
   */
  function numberStates(doc) {
    var seen = Object.create(null), max = 0, marks = [];
    (doc.flows || []).forEach(function (f) {
      (f.steps || []).forEach(function (s) {
        var ok = typeof s.state === 'number' && s.state > 0 && Math.floor(s.state) === s.state;
        if (ok && !seen[s.state]) { seen[s.state] = true; max = Math.max(max, s.state); }
        else marks.push({ flow: f, step: s, why: ok ? 'duplicate' : s.state == null ? 'missing' : 'bad', from: s.state == null ? null : s.state });
      });
    });
    var before = typeof doc.lastState === 'number' ? doc.lastState : null;
    var last = Math.max(before !== null && before >= 0 ? before : 0, max);
    var changes = marks.map(function (m) {
      m.step.state = ++last;
      return { flow: m.flow.id, step: m.step.id, from: m.from, to: m.step.state, why: m.why };
    });
    doc.lastState = last;
    return { changes: changes, lastState: { from: before, to: last } };
  }

  function findState(doc, n) {
    for (var fi = 0; fi < (doc.flows || []).length; fi++) {
      var f = doc.flows[fi];
      for (var si = 0; si < f.steps.length; si++) if (f.steps[si].state === n) return { flow: f, step: f.steps[si], index: si };
    }
    return null;
  }

  /** Удалить шаг можно, если от него ничего не зависит: он последний или следующий шаг — точка входа. */
  function canDeleteState(flow, index) {
    var next = flow.steps[index + 1];
    return !next || !!next.page;
  }

  /**
   * Правки схемы из браузера (задача 0005a, §6.1) — одна функция для записи и
   * для превью черновиков. ops: addFlow { ref, title? } · renameFlow { flow, title } ·
   * addState { ref, flow, step } · renameState { state, title } · deleteState { state }.
   * addState: номер — lastState + 1, но не меньше step.state (номер черновика).
   * flow и state могут ссылаться на ref операций того же журнала.
   * → { states: { ref: { flow, id, state } }, flows: { ref: id }, errors: [{ op, ref, code }] },
   * коды ошибок: no-flow, no-state, entry-required, dependents, empty-title.
   * Документ должен быть пронумерован (numberStates). opts.dedupe — повтор
   * записи и журнал черновиков: addState, чей шаг уже есть в сценарии (то же
   * время записи, страница и действия), не добавляет второй, а отдаёт номер
   * имеющегося.
   */
  function stateSig(s) { return JSON.stringify([s.recorded || null, s.page || null, (s.do || []).map(makeAction)]); }
  function applyFlowOps(doc, ops, opts) {
    opts = opts || {};
    var res = { states: {}, flows: {}, errors: [] };
    doc.flows = doc.flows || [];
    function fail(op, code) { res.errors.push({ op: op.op, ref: op.ref || null, code: code }); }
    function flowOf(ref) {
      var id = Object.prototype.hasOwnProperty.call(res.flows, ref) ? res.flows[ref] : ref;
      return doc.flows.filter(function (f) { return f.id === id; })[0] || null;
    }
    function stateOf(ref) {
      var n = Object.prototype.hasOwnProperty.call(res.states, ref) ? res.states[ref].state : parseStateRef(ref);
      return n ? findState(doc, n) : null;
    }
    (ops || []).forEach(function (op) {
      var title = op.title == null ? '' : String(op.title).replace(/\s+/g, ' ').trim();
      if (op.op === 'addFlow') {
        /* номер — порядковый: третий сценарий — Flow 03 (§3, §4.2); занят — следующий свободный */
        var k = doc.flows.length + 1, id;
        do { id = 'flow-' + pad2(k++); } while (doc.flows.some(function (f) { return f.id === id; }));
        doc.flows.push({ id: id, title: title || 'Flow ' + id.slice(5), desc: null, steps: [] });
        if (op.ref) res.flows[op.ref] = id;
      } else if (op.op === 'renameFlow') {
        var rf = flowOf(op.flow);
        if (!rf) fail(op, 'no-flow');
        else if (!title) fail(op, 'empty-title');
        else rf.title = title;
      } else if (op.op === 'addState') {
        var af = flowOf(op.flow);
        var src = op.step || {};
        if (!af) { fail(op, 'no-flow'); return; }
        if (opts.dedupe && src.recorded) {
          var sig = stateSig(src);
          var same = af.steps.filter(function (s) { return s.recorded && stateSig(s) === sig; })[0];
          if (same) { if (op.ref) res.states[op.ref] = { flow: af.id, id: same.id, state: same.state }; return; }
        }
        if (!af.steps.length && !src.page) { fail(op, 'entry-required'); return; }
        /* Номер — lastState + 1 по свежему файлу, но не меньше того, что человек
           видел на черновике (step.state): удалённый черновик не сдвигает номера
           следующих; пропуск в номерах допустим — номера не выдаются повторно. */
        var n = Math.max((typeof doc.lastState === 'number' ? doc.lastState : 0) + 1, typeof src.state === 'number' && src.state > 0 ? src.state : 0);
        var base = 'state-' + pad2(n), sid = base, j = 2;
        while (af.steps.some(function (s) { return s.id === sid; })) sid = base + '-' + j++;
        var step = JSON.parse(JSON.stringify(src));
        step.state = n;
        step.id = sid;
        step.title = step.title || stateLabel(n);
        step.page = step.page || null;
        step.note = step.note || null;
        step.recorded = step.recorded || null;
        step.issues = step.issues || [];
        step.do = (step.do || []).map(makeAction);
        af.steps.push({ state: step.state, id: step.id, title: step.title, page: step.page, note: step.note, recorded: step.recorded, issues: step.issues, do: step.do });
        doc.lastState = n;
        if (op.ref) res.states[op.ref] = { flow: af.id, id: sid, state: n };
      } else if (op.op === 'renameState') {
        var rs = stateOf(op.state);
        if (!rs) fail(op, 'no-state');
        else if (!title) fail(op, 'empty-title');
        else rs.step.title = title;
      } else if (op.op === 'deleteState') {
        var ds = stateOf(op.state);
        if (!ds) fail(op, 'no-state');
        else if (!canDeleteState(ds.flow, ds.index)) fail(op, 'dependents');
        else ds.flow.steps.splice(ds.index, 1);
      }
    });
    return res;
  }

  /* ---------------- Fix State: шаг из журнала действий ---------------- */

  function cut(s, n) { s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; }

  /* Автоназвание (§5.5): подпись цели последнего действия человека в шаге;
     у ввода — «подпись поля: значение», у клавиши без подписи — имя клавиши;
     точка входа без действий — заголовок страницы до первого « — », « | », « - ». */
  function autoTitle(picked, mode, pageTitle) {
    /* ожидания — не действия человека: подписи у них нет */
    var acts = picked.filter(function (p) { var v = p.e.action && p.e.action.verb; return v !== 'waitFor' && v !== 'wait'; });
    var pool = acts.filter(function (p) { return !p.e.replayed; });
    if (!pool.length) pool = acts;
    if (pool.length) {
      var e = pool[pool.length - 1].e, a = e.action;
      if (a.verb === 'fill') return cut((e.label ? e.label + ': ' : '') + (a.value == null ? '' : a.value), 40) || null;
      if (e.label) return cut(e.label, 40);
      if (a.verb === 'press' && a.key) return cut(a.key, 40);
      return null;
    }
    if (mode === 'entry' && pageTitle) return cut(String(pageTitle).split(/ — | \| | - /)[0], 40) || null;
    return null;
  }

  /**
   * Шаг из журнала загрузки страницы (задача 0005a, §5.4) — чистая функция.
   * input: { trail, flow, n, when, pageTitle, title? }; trail: { page,
   * log: [{ action, replayed, at, label, fragile }], mark, flagMark, lastFix,
   * base: { flow, step, at, flags }, flags: [{ code }] }.
   * → { step, mode: 'increment' | 'entry', count, user } или { error: 'nothing-changed', mode }.
   */
  function composeState(o) {
    var trail = o.trail || {}, flow = o.flow || { id: null, steps: [] };
    var log = trail.log || [], flags = trail.flags || [];
    var last = flow.steps && flow.steps.length ? flow.steps[flow.steps.length - 1] : null;
    var mode = 'entry', from = 0, flagsFrom = 0;
    if (last && trail.lastFix && trail.lastFix.flow === flow.id && trail.lastFix.state === last.state) {
      mode = 'increment'; from = trail.mark || 0; flagsFrom = trail.flagMark || 0;
    } else if (last && trail.base && trail.base.flow === flow.id && trail.base.step === last.id) {
      mode = 'increment'; from = trail.base.at || 0; flagsFrom = trail.base.flags || 0;
    }
    var picked = [];
    for (var i = from; i < log.length; i++) if (mode === 'entry' || !log[i].replayed) picked.push({ e: log[i], i: i });
    if (mode === 'increment' && !picked.length) return { error: 'nothing-changed', mode: mode, after: last };
    /* Ожидания: каждое действие само ждёт цель до timeout; если человек ждал
       результата дольше 3,5 с, у его действия timeout = пауза + 1,5 с, вверх до 500 мс.
       Пауза — между действиями журнала (и через границу фиксации: ждали итога
       прошлого шага); первое действие после открытия страницы не ждёт ничего —
       время до него человек осматривался (у точки входа — короткая форма, §4.2). */
    var acts = picked.map(function (p) {
      var a = makeAction(p.e.action);
      var pause = p.i > 0 ? (p.e.at || 0) - (log[p.i - 1].at || 0) : 0;
      if (!p.e.replayed && pause > 3500 && (PARAMS[a.verb] || []).indexOf('timeout') >= 0) {
        var want = Math.min(LIMITS.timeoutMax, Math.ceil((pause + 1500) / 500) * 500);
        if (want > (a.timeout || LIMITS.timeout)) a.timeout = want;
      }
      return a;
    });
    var codes = {};
    flags.slice(mode === 'entry' ? 0 : flagsFrom).forEach(function (f) { codes[f.code] = true; });
    picked.forEach(function (p) { if (p.e.fragile) codes.fragile = true; });
    var n = o.n;
    var title = o.title != null ? o.title : autoTitle(picked, mode, o.pageTitle);
    var step = { state: n, id: 'state-' + pad2(n), title: title || null, page: mode === 'entry' ? trail.page || null : null, note: null,
      recorded: o.when || stamp(), issues: ISSUES.filter(function (c) { return codes[c]; }), do: acts };
    return { step: step, mode: mode, count: acts.length, user: picked.filter(function (p) { return !p.e.replayed; }).length, after: mode === 'increment' ? last : null,
      entries: picked.map(function (p) { return { label: p.e.label || null, replayed: !!p.e.replayed, fragile: !!p.e.fragile }; }) };
  }

  /* ---------------- comments.md ---------------- */

  var STATUS = {
    codes: ['open', 'done', 'rejected'],
    word: { open: 'открыт', done: 'сделан', rejected: 'отклонён' },
    label: { open: 'Открыт', done: 'Сделан', rejected: 'Отклонён' },
    byWord: { 'открыт': 'open', 'сделан': 'done', 'отклонён': 'rejected', 'отклонен': 'rejected' }
  };
  var META_KEYS = { 'Когда': 'created', 'Автор': 'author', 'Страница': 'page', 'Шаг': 'step', 'Решение': 'resolution' };
  var META_ORDER = [['created', 'Когда'], ['author', 'Автор'], ['page', 'Страница'], ['step', 'Шаг'], ['resolution', 'Решение']];
  var COMMENT_RX = /^[КK]-(\d+)(?:\s*[·•|-]\s*(.*?))?\s*$/;
  var META_RX = /^- (Когда|Автор|Страница|Шаг|Решение):[ \t]*(.*?)\s*$/;
  var WHEN_RX = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/;
  var STEP_RX = /^([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-z0-9]+(?:-[a-z0-9]+)*)$/;
  var STATE_RX = /^state[\s-]*0*(\d+)$/i;
  var FENCE_RX = /^(```|~~~)/;
  var PREAMBLE = '# Комментарии к прототипу\n\n'
    + 'Комментарии пишет панель прототипа (Alt+Shift+P на любой странице прототипа)\n'
    + 'и правит агент. Формат — `.agents/proto-panel/README.md`, раздел «comments.md».';

  function validWhen(s) {
    var m = WHEN_RX.exec(s || '');
    if (!m) return false;
    var d = +m[1], mo = +m[2], h = +m[4], mi = +m[5];
    return d >= 1 && d <= 31 && mo >= 1 && mo <= 12 && h <= 23 && mi <= 59;
  }

  /* Пустые строки в начале и пробельный хвост — не часть текста. */
  function trimBlock(text) {
    return String(text || '').replace(/\r\n?/g, '\n').replace(/^(?:[ \t]*\n)+/, '').replace(/\s+$/, '');
  }

  /**
   * comments.md → { model: { front, preamble, comments }, errors: [{ code: ПН3, line, text }], lines: { n: строка } }.
   * Комментарии со сломанным заголовком в модель не попадают; запись при
   * ошибках блокирует вызывающий (панель и оснастка), чтобы не затереть файл.
   */
  function parseComments(src) {
    var text = String(src == null ? '' : src).replace(/^﻿/, '').replace(/\r\n?/g, '\n');
    var lines = text.split('\n');
    var errors = [];
    var model = { front: [], preamble: '', comments: [] };
    var at = {};
    function err(i, t) { errors.push({ code: 'ПН3', line: i + 1, text: t }); }

    var i = 0;
    if (lines[0] === '---') {
      var end = -1;
      for (var k = 1; k < lines.length; k++) if (lines[k] === '---') { end = k; break; }
      if (end < 0) err(0, 'шапка «---» не закрыта второй строкой «---»');
      else {
        model.front = lines.slice(1, end);
        if (!model.front.some(function (l) { return /^type:\s*["']?proto-comments["']?\s*$/.test(l); })) err(0, 'в шапке нет «type: proto-comments»');
        i = end + 1;
      }
    } else err(0, 'нет шапки: файл начинается с «---», «type: proto-comments», «---»');

    var pre = [], cur = null, fence = false, fenceLine = -1, list = [];
    function finish(c) {
      if (!c || c.bad) return;
      var raw = c.raw, k = 0;
      while (k < raw.length && !raw[k].text.trim()) k++;
      var meta = {}, seen = {};
      for (; k < raw.length; k++) {
        var mm = META_RX.exec(raw[k].text);
        if (!mm) break;
        var key = META_KEYS[mm[1]];
        if (seen[key]) err(raw[k].i, 'у К-' + c.n + ' строка «' + mm[1] + '» повторяется');
        seen[key] = true;
        meta[key] = mm[2] === '' ? null : mm[2];
      }
      var body = trimBlock(raw.slice(k).map(function (x) { return x.text; }).join('\n'));
      if (!meta.created) err(c.line, 'у К-' + c.n + ' нет строки «- Когда: ДД.ММ.ГГГГ ЧЧ:ММ»');
      else if (!validWhen(meta.created)) err(c.line, 'у К-' + c.n + ' «Когда: ' + meta.created + '» — ожидается ДД.ММ.ГГГГ ЧЧ:ММ');
      var step = null;
      if (meta.step) {
        /* Ссылка на состояние (задача 0005a, §9): State 07 или state-07; прежняя
           форма <сценарий>/<шаг> читается, сборка переводит её в номер. */
        var sn = STATE_RX.exec(meta.step);
        var sm = STEP_RX.exec(meta.step);
        if (sn && +sn[1] > 0) step = { state: +sn[1] };
        else if (sm) step = { flow: sm[1], step: sm[2] };
        else err(c.line, 'у К-' + c.n + ' «Шаг: ' + meta.step + '» — ожидается номер состояния State 07 (прежняя форма — <сценарий>/<шаг>)');
      }
      if (!body) err(c.line, 'у К-' + c.n + ' пустой текст');
      if (c.status === null) return;
      list.push({ c: { n: c.n, status: c.status, created: meta.created || null, author: meta.author || null, page: meta.page || null,
        step: step, resolution: meta.resolution || null, body: body }, line: c.line });
    }

    for (; i < lines.length; i++) {
      var l = lines[i];
      if (FENCE_RX.test(l)) { if (!fence) fenceLine = i; fence = !fence; }
      if (!fence && /^##(\s|$)/.test(l)) {
        finish(cur);
        var h = l.replace(/^##\s*/, '').trim();
        var cm = COMMENT_RX.exec(h);
        if (!cm) { err(i, 'заголовок «' + l + '» — не комментарий: ожидается «## К-<номер> · <статус>»'); cur = { bad: true, raw: [] }; continue; }
        var n = parseInt(cm[1], 10);
        var word = cm[2] == null ? '' : cm[2];
        var st = word ? STATUS.byWord[word.toLowerCase()] || null : null;
        if (!word) err(i, 'у К-' + n + ' нет статуса: «## К-' + n + ' · открыт | сделан | отклонён»');
        else if (!st) err(i, 'у К-' + n + ' статус «' + word + '» — допустимы: открыт, сделан, отклонён');
        cur = { n: n, status: st, line: i, raw: [] };
        continue;
      }
      if (cur) cur.raw.push({ text: l, i: i }); else pre.push(l);
    }
    finish(cur);
    /* Незакрытый блок кода прячет все заголовки после себя: комментарии теряются
       молча (ревью 0005, R2). Такой файл — ошибка разбора, запись блокируется. */
    if (fence) err(fenceLine, 'блок кода «' + lines[fenceLine].slice(0, 3) + '» не закрыт — заголовки после строки ' + (fenceLine + 1) + ' читаются как код и комментарии пропадают; закройте блок');

    var byN = {};
    list.forEach(function (x) {
      if (byN[x.c.n] !== undefined) err(x.line, 'номер К-' + x.c.n + ' повторяется (впервые — строка ' + (byN[x.c.n] + 1) + ')');
      else { byN[x.c.n] = x.line; at[x.c.n] = x.line + 1; model.comments.push(x.c); }
    });
    model.comments.sort(function (a, b) { return a.n - b.n; });
    model.preamble = trimBlock(pre.join('\n'));
    errors.sort(function (a, b) { return a.line - b.line; });
    return { model: model, errors: errors, lines: at };
  }

  /* Одна строка метаданных: перевод строки сломал бы формат. */
  function oneLine(s) { return String(s).replace(/\s*\n\s*/g, ' ').trim(); }

  /* Текст комментария: заголовки # и ## (вне блоков кода) понижаются до ###,
     иначе следующий разбор принял бы их за границу комментария. Незакрытый
     блок кода закрывается тем же маркером — иначе он поглотил бы заголовок
     следующего комментария (ревью 0005, R2). */
  function cleanBody(body) {
    var fence = false, mark = null;
    var out = trimBlock(body).split('\n').map(function (l) {
      if (FENCE_RX.test(l)) { fence = !fence; if (fence) mark = l.slice(0, 3); return l; }
      if (!fence && /^#{1,2}(\s|$)/.test(l)) return l.replace(/^#{1,2}/, '###');
      return l;
    });
    if (fence) out.push(mark || '```');
    return out.join('\n');
  }

  function commentBlock(c) {
    var meta = [];
    META_ORDER.forEach(function (p) {
      var v = c[p[0]];
      if (p[0] === 'step') v = v ? stepRefText(v) : null;
      if (v !== null && v !== undefined && String(v).trim() !== '') meta.push('- ' + p[1] + ': ' + oneLine(v));
    });
    return '## К-' + c.n + ' · ' + STATUS.word[c.status] + '\n\n' + meta.join('\n') + '\n\n' + cleanBody(c.body);
  }

  /** Каноническая запись comments.md: шапка, преамбула, комментарии по номеру; LF, один перевод строки в конце. */
  function serializeComments(model) {
    var front = model && model.front && model.front.length ? model.front : ['type: proto-comments'];
    var parts = [];
    var pre = trimBlock(model && model.preamble != null ? model.preamble : PREAMBLE);
    if (pre) parts.push(pre);
    ((model && model.comments) || []).slice().sort(function (a, b) { return a.n - b.n; }).forEach(function (c) { parts.push(commentBlock(c)); });
    return '---\n' + front.join('\n') + '\n---\n' + (parts.length ? '\n' + parts.join('\n\n') + '\n' : '');
  }

  /** Пустой файл комментариев — заготовка панели. */
  function emptyComments() { return serializeComments({ front: ['type: proto-comments'], preamble: PREAMBLE, comments: [] }); }

  /** Следующий номер: максимум + 1 по переданному (свежему) списку. */
  function nextNumber(comments) {
    return (comments || []).reduce(function (m, c) { return Math.max(m, c.n); }, 0) + 1;
  }

  /** Ссылка комментария на шаг текстом файла: { state: 7 } → State 07; прежняя { flow, step } → сценарий/шаг. */
  function stepRefText(ref) {
    if (!ref) return '';
    return ref.state != null ? stateLabel(ref.state) : ref.flow + '/' + ref.step;
  }

  /**
   * Прежние ссылки комментариев <сценарий>/<шаг> → номер состояния, если шаг
   * нашёлся и пронумерован (задача 0005a, §9). Не нашёлся — ссылка остаётся
   * как есть (у открытого комментария это ПН6). → [{ n, from, to }]
   */
  function migrateCommentRefs(model, flows) {
    var changes = [];
    (model.comments || []).forEach(function (c) {
      if (!c.step || c.step.state != null) return;
      var f = (flows || []).filter(function (x) { return x.id === c.step.flow; })[0];
      var s = f && f.steps.filter(function (x) { return x.id === c.step.step; })[0];
      if (!s || !s.state) return;
      changes.push({ n: c.n, from: c.step.flow + '/' + c.step.step, to: stateLabel(s.state) });
      c.step = { state: s.state };
    });
    return changes;
  }

  /** Дата и время в формате файла: ДД.ММ.ГГГГ ЧЧ:ММ (по часам машины). */
  function stamp(d) {
    d = d || new Date();
    function p(x) { return (x < 10 ? '0' : '') + x; }
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  /* ---------------- хеш и зеркало ---------------- */

  function fnvByte(h, b) { h ^= b; return Math.imul(h, 0x01000193) >>> 0; }

  /** FNV-1a, 32 бита, по UTF-8 строки (метка BOM в начале не считается). Восемь hex-символов. */
  function hash(text) {
    var s = String(text == null ? '' : text).replace(/^﻿/, '');
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
        var d = s.charCodeAt(i + 1);
        if (d >= 0xdc00 && d <= 0xdfff) { c = 0x10000 + ((c - 0xd800) << 10) + (d - 0xdc00); i++; }
      }
      if (c < 0x80) h = fnvByte(h, c);
      else if (c < 0x800) { h = fnvByte(h, 0xc0 | (c >> 6)); h = fnvByte(h, 0x80 | (c & 63)); }
      else if (c < 0x10000) { h = fnvByte(h, 0xe0 | (c >> 12)); h = fnvByte(h, 0x80 | ((c >> 6) & 63)); h = fnvByte(h, 0x80 | (c & 63)); }
      else { h = fnvByte(h, 0xf0 | (c >> 18)); h = fnvByte(h, 0x80 | ((c >> 12) & 63)); h = fnvByte(h, 0x80 | ((c >> 6) & 63)); h = fnvByte(h, 0x80 | (c & 63)); }
    }
    return ('0000000' + (h >>> 0).toString(16)).slice(-8);
  }

  function fmtErrors(file, list) {
    return list.map(function (e) { return file + ':' + e.line + ' — ' + e.text; });
  }

  /** Данные зеркала: { app: { id, title }, flowsText, commentsText } → объект window.ProtoPanelData. */
  function mirrorData(o) {
    var f = readFlows(o.flowsText);
    var c = parseComments(o.commentsText);
    return {
      format: 1,
      app: { id: String(o.app && o.app.id || ''), title: String(o.app && o.app.title || '') },
      sources: { flows: hash(o.flowsText), comments: hash(o.commentsText) },
      /* шапка и lastState — для «Download flows.yaml» из браузера (задача 0005a, §6.3) */
      flowsHeader: f.header,
      lastState: f.doc ? f.doc.lastState : null,
      flows: f.flows,
      flowErrors: fmtErrors('flows.yaml', f.errors),
      comments: c.model.comments,
      commentsPreamble: c.model.preamble,
      commentErrors: fmtErrors('comments.md', c.errors)
    };
  }

  /* Не-ASCII — через \uXXXX: зеркало не зависит от того, в какой кодировке
     браузер прочитал скрипт (по file:// кодировку он угадывает). */
  function ascii(json) {
    return json.replace(/[\u007f-￿]/g, function (ch) { return '\\u' + ('000' + ch.charCodeAt(0).toString(16)).slice(-4); });
  }

  /** Текст panel-data.js. Детерминирован: без даты сборки, порядок ключей фиксирован. */
  function mirrorText(o) {
    return '/* СГЕНЕРИРОВАН из flows.yaml и comments.md — руками не править.\n'
      + '   Пересобрать: node .agents/tools/proto-panel.mjs */\n'
      + 'window.ProtoPanelData = ' + ascii(JSON.stringify(mirrorData(o), null, 2)) + ';\n';
  }

  /* ---------------- селектор без DOM ---------------- */

  var PSEUDO_SEL = { not: 1, is: 1, where: 1, has: 1 };
  var PSEUDO_ARG = { 'nth-child': 1, 'nth-last-child': 1, 'nth-of-type': 1, 'nth-last-of-type': 1, lang: 1, dir: 1 };
  var PSEUDO = ('first-child last-child only-child first-of-type last-of-type only-of-type empty root scope checked disabled '
    + 'enabled focus focus-visible focus-within hover active visited link any-link target required optional read-only '
    + 'read-write placeholder-shown default indeterminate valid invalid in-range out-of-range defined open modal '
    + 'popover-open autofill fullscreen').split(' ');

  /**
   * Имена из селектора: { ids, classes, attrs: [{ name, value }], tags, error }.
   * Разбирает списки, комбинаторы, [атрибуты], псевдоклассы и селекторы
   * внутри :not(), :is(), :where(), :has(). Ошибка — текстом, без исключения.
   */
  function selectorTokens(sel) {
    var out = { ids: [], classes: [], attrs: [], tags: [], error: null };
    var s = String(sel == null ? '' : sel), i = 0;
    function fail(t) { throw new Error(t); }
    function ws() { while (i < s.length && /\s/.test(s.charAt(i))) i++; }
    function ident() {
      var v = '', start = i;
      while (i < s.length) {
        var c = s.charAt(i);
        if (/[A-Za-z0-9_-]/.test(c) || c.charCodeAt(0) >= 0x80) { v += c; i++; }
        else if (c === '\\' && i + 1 < s.length) { v += s.charAt(i + 1); i += 2; }
        else break;
      }
      if (!v) fail('ожидалось имя в позиции ' + (start + 1));
      return v;
    }
    function attr() {
      ws();
      var name = ident();
      ws();
      if (s.charAt(i) === ']') { i++; out.attrs.push({ name: name, value: null }); return; }
      var op = /^[~|^$*]?=/.exec(s.slice(i));
      if (!op) fail('в «[' + name + '…» ожидается «=» или «]»');
      i += op[0].length;
      ws();
      var c = s.charAt(i), value;
      if (c === '"' || c === "'") {
        var j = s.indexOf(c, i + 1);
        if (j < 0) fail('кавычка в «[' + name + '=…» не закрыта');
        value = s.slice(i + 1, j);
        i = j + 1;
      } else value = ident();
      ws();
      if (/^[is]\]/i.test(s.slice(i, i + 2)) || /^[is]\s/i.test(s.slice(i, i + 2))) { i++; ws(); }
      if (s.charAt(i) !== ']') fail('«[' + name + '…» не закрыта «]»');
      i++;
      out.attrs.push({ name: name, value: value });
    }
    function pseudo() {
      i++;
      if (s.charAt(i) === ':') fail('псевдоэлементы («::») в селекторе действия не поддерживаются');
      var name = ident().toLowerCase();
      if (PSEUDO_SEL[name]) {
        if (s.charAt(i) !== '(') fail('«:' + name + '» — нужен аргумент в скобках');
        i++;
        list(name);
        ws();
        if (s.charAt(i) !== ')') fail('«:' + name + '(…» не закрыта «)»');
        i++;
        return;
      }
      if (PSEUDO_ARG[name]) {
        if (s.charAt(i) !== '(') fail('«:' + name + '» — нужен аргумент в скобках');
        var depth = 1, j = i + 1;
        while (j < s.length && depth) { if (s.charAt(j) === '(') depth++; else if (s.charAt(j) === ')') depth--; j++; }
        if (depth) fail('«:' + name + '(…» не закрыта «)»');
        i = j;
        return;
      }
      if (PSEUDO.indexOf(name) < 0) fail('псевдокласс «:' + name + '» не поддерживается');
    }
    function compound() {
      var any = false, c = s.charAt(i);
      if (c === '*') { i++; any = true; }
      else if (/[A-Za-z]/.test(c)) { out.tags.push(ident().toLowerCase()); any = true; }
      for (;;) {
        c = s.charAt(i);
        if (c === '#') { i++; out.ids.push(ident()); any = true; }
        else if (c === '.') { i++; out.classes.push(ident()); any = true; }
        else if (c === '[') { i++; attr(); any = true; }
        else if (c === ':') { pseudo(); any = true; }
        else break;
      }
      if (!any) fail(i >= s.length ? 'селектор оборван' : 'неожиданный символ «' + s.charAt(i) + '» в позиции ' + (i + 1));
    }
    function complex() {
      compound();
      for (;;) {
        var save = i;
        ws();
        var c = s.charAt(i);
        if (c === '>' || c === '+' || c === '~') { i++; ws(); compound(); continue; }
        if (i > save && i < s.length && c !== ',' && c !== ')') { compound(); continue; }
        i = save;
        return;
      }
    }
    function list(inside) {
      for (;;) {
        ws();
        if (inside === 'has' && /[>+~]/.test(s.charAt(i))) { i++; ws(); }
        complex();
        ws();
        if (s.charAt(i) === ',') { i++; continue; }
        return;
      }
    }
    try {
      if (!s.trim()) fail('пустой селектор');
      list(null);
      ws();
      if (i < s.length) fail('лишний символ «' + s.charAt(i) + '» в позиции ' + (i + 1));
    } catch (e) {
      out.error = e.message;
    }
    return out;
  }

  return {
    version: 1,
    HOTKEYS: HOTKEYS,
    hotkeyOf: hotkeyOf,
    parseYaml: parseYaml,
    yamlPlain: yamlPlain,
    VERBS: VERBS,
    LIMITS: LIMITS,
    readFlows: readFlows,
    describeAction: describeAction,
    STATUS: STATUS,
    ISSUES: ISSUES,
    PARAMS: PARAMS,
    makeAction: makeAction,
    serializeFlows: serializeFlows,
    defaultFlowsHeader: defaultFlowsHeader,
    numberStates: numberStates,
    applyFlowOps: applyFlowOps,
    canDeleteState: canDeleteState,
    findState: findState,
    composeState: composeState,
    pad2: pad2,
    stateLabel: stateLabel,
    parseStateRef: parseStateRef,
    parseComments: parseComments,
    serializeComments: serializeComments,
    stepRefText: stepRefText,
    migrateCommentRefs: migrateCommentRefs,
    cleanBody: cleanBody,
    oneLine: oneLine,
    emptyComments: emptyComments,
    nextNumber: nextNumber,
    stamp: stamp,
    validWhen: validWhen,
    hash: hash,
    mirrorData: mirrorData,
    mirrorText: mirrorText,
    selectorTokens: selectorTokens
  };
});

/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — карта экранов (map-view.js, задача RE0015).

   Один отрисовщик на два входа: страница карты проекта
   (`apps/screen-map/<раздел>/index.html`, режим `mind` — майндмап) и
   инструмент «Карта» в рельсе панели (режим `tree` — вертикальное дерево в
   шторке). Данные — `window.ScreenMaps[<раздел>]` из `map-data.js` (генерат
   `.agents/tools/screen-map.mjs`): узлы-страницы с готовыми адресами от
   каталога `apps/`, связь «откуда приходят» — `parent`, один корень —
   главная проекта, состояния — опционально.

   Зачем (решение человека 11.10.2026): открыть любую страницу проекта
   быстрее, чем через весь пользовательский сценарий. Страница открывается в
   состоянии по умолчанию; состояния — чипы под страницей, видны по
   переключателю.

   Устройство:
   - `mind`: Главная слева, ветви вправо; раскладка по измеренным карточкам
     (родитель — по центру между якорями крайних детей); HTML-узлы поверх
     SVG-слоя линий — осознанное отклонение, как схема статусной модели
     витрины (`apps/local-components/kit-model.js`): компонента схемы в ДС нет.
     Узел — карточка ДС (Tile Card) с Entity внутри; кликабельна вся карточка,
     ссылка — Entity (`a`, открывается и в новой вкладке). Ширина карточки и
     зазоры — токены в `panel.css` (`.pp-map__board`, `--pp-map-card`),
     скрипт читает их вычисленные значения;
   - `tree`: дерево строк ДС (ProductRow `.prow-tree`); корень дерева —
     служебный узел без строки, чтобы каждый уровень сдвигался (у ДС группа
     детей корня не сдвигается); текущая страница — `.is-selected` и
     `aria-current="page"`, её состояния — чипы под строкой (вне `.prow`:
     зона клика ссылки строки перекрыла бы их);
   - состояния — `a.chip` (ссылки, а не кнопки: чип-кнопка в ДС — только
     выбор); `#pp=NN` — шаг сценария панели, `#ppmap=<узел>/<состояние>` —
     действия карты (проигрывает runner.js).

   Строк интерфейса здесь нет (ПН10): подписи даёт хозяин — страница по-русски,
   панель из strings.js; без них — английские запасные.

   API: window.ProtoPanelMap = {
     render(host, data, { mode, base, here, states, labels, onGo }) →
       { setStates(on), relayout(), current(), destroy() },
     current(data, url, base) → id узла текущей страницы или null
   };
   base — абсолютный адрес каталога apps/; onGo(href, nodeId, stateId) —
   перехват перехода (true — переход взят на себя).
   ============================================================ */
(function () {
  'use strict';
  if (window.ProtoPanelMap) return;

  var SVGNS = 'http://www.w3.org/2000/svg';
  var PREVIEW = /\.preview\.html$/i;
  var ICON_ROOT = 'main-page', ICON_PAGE = 'file';
  var DEFAULT_LABELS = { map: 'Screen map', states: 'Page states', empty: 'No pages on the map' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function lab(o, k) { return (o.labels && o.labels[k]) || DEFAULT_LABELS[k] || k; }
  function decode(s) { try { return decodeURIComponent(s); } catch (e) { return s; } }
  function baseUrl(base) { var b = String(base || ''); return b.charAt(b.length - 1) === '/' ? b : b + '/'; }
  function abs(href, base) { try { return new URL(href, baseUrl(base)).href; } catch (e) { return href; } }

  /* ---------------- данные ---------------- */

  /** { byId, kids, root, order (обход в глубину), appTitle } — порядок детей — порядок узлов в данных. */
  function index(data) {
    var nodes = (data && data.nodes) || [];
    var byId = {}, kids = {}, appTitle = {}, root = null;
    nodes.forEach(function (n) { byId[n.id] = n; kids[n.id] = []; });
    ((data && data.apps) || []).forEach(function (a) { appTitle[a.dir] = a.title; });
    nodes.forEach(function (n) {
      if (n.parent && byId[n.parent] && n.parent !== n.id) kids[n.parent].push(n.id);
      else if (!root) root = n.id;
    });
    /* узел без живого родителя (генератор такое не пропустит) — под корень */
    nodes.forEach(function (n) {
      if (n.id !== root && !(n.parent && byId[n.parent] && n.parent !== n.id)) kids[root].push(n.id);
    });
    var order = [], seen = {};
    (function walk(id) {
      if (!id || seen[id]) return;
      seen[id] = true;
      order.push(id);
      kids[id].forEach(walk);
    })(root);
    return { byId: byId, kids: kids, root: root, order: order, appTitle: appTitle };
  }

  /** Адрес → { dir, file, params }: dir — папка от apps/, file — экран (собранная = источник). */
  function where(url, base) {
    var u, b;
    try { u = new URL(url, baseUrl(base)); b = new URL(baseUrl(base)); } catch (e) { return null; }
    var p = decode(u.pathname), bp = decode(b.pathname);
    if (p.indexOf(bp) !== 0) return null;
    var rel = p.slice(bp.length), cut = rel.lastIndexOf('/');
    var params = {};
    u.searchParams.forEach(function (v, k) { params[k] = v; });
    return { dir: cut < 0 ? '' : rel.slice(0, cut), file: rel.slice(cut + 1).replace(PREVIEW, '.html'), params: params };
  }

  /** Узел текущей страницы: тот же экран той же папки, при нескольких — с большим совпадением параметров. */
  function current(data, url, base) {
    var here = where(url, base);
    if (!here || !data) return null;
    var best = null, score = -1;
    (data.nodes || []).forEach(function (n) {
      var w = where(n.href, base);
      if (!w || w.dir !== here.dir || w.file !== here.file) return;
      var s = 0;
      Object.keys(w.params).forEach(function (k) { if (here.params[k] === w.params[k]) s++; });
      if (s > score) { score = s; best = n.id; }
    });
    return best;
  }

  /* ---------------- разметка ---------------- */

  function chipsHTML(n, o, hidden) {
    if (!n.states || !n.states.length) return '';
    return '<div class="chiplist chiplist--s pp-map__states" role="group" aria-label="' + esc(lab(o, 'states')) + '"' + (hidden ? ' hidden' : '') + '>'
      + n.states.map(function (s) {
        return '<a class="chip chip--edit chip--xs chip--rounded chip--press pp-map__state" href="' + esc(abs(s.href, o.base)) + '"'
          + ' data-pp-map-node="' + esc(n.id) + '" data-pp-map-state="' + esc(s.id) + '">'
          + '<span class="chip__label" data-tooltip="' + esc(s.title) + '" data-tooltip-truncated="only">' + esc(s.title) + '</span></a>';
      }).join('') + '</div>';
  }

  function cardHTML(n, ix, o, hereId) {
    var on = n.id === hereId;
    var app = ix.appTitle[n.app] || n.app || '';
    return '<div class="tile tile--card pp-map__node' + (on ? ' is-selected' : '') + '" role="listitem" data-pp-map-node="' + esc(n.id) + '">'
      + '<div class="tile__body">'
      + '<a class="entity entity--s pp-map__link" href="' + esc(abs(n.href, o.base)) + '"' + (on ? ' aria-current="page"' : '') + '>'
      + '<div class="entity__lead"><span class="entity__icon entity__icon--accent" aria-hidden="true"><i data-icon="' + (n.id === ix.root ? ICON_ROOT : ICON_PAGE) + '"></i></span></div>'
      + '<div class="entity__main"><div class="entity__titles">'
      + '<p class="entity__header">' + esc(app) + '</p>'
      + '<div class="entity__labelrow"><span class="entity__label entity__label--truncate" data-tooltip="' + esc(n.title) + '" data-tooltip-truncated="only">' + esc(n.title) + '</span></div>'
      + '</div>'
      + '<div class="entity__subs entity__subs--single"><span class="entity__subs-list" data-tooltip="' + esc(n.page) + '" data-tooltip-truncated="only">' + esc(n.page) + '</span></div>'
      + '</div></a>'
      + chipsHTML(n, o, !o.states)
      + '</div></div>';
  }

  function rowHTML(id, ix, o, hereId) {
    var n = ix.byId[id], on = id === hereId;
    var app = ix.appTitle[n.app] || n.app || '';
    var kids = ix.kids[id];
    return '<li class="prow-tree__node" data-pp-map-node="' + esc(id) + '">'
      + '<div class="prow' + (id === ix.root ? ' prow--root' : '') + (on ? ' is-selected' : '') + '"><div class="prow__main">'
      + '<div class="prow__head"><a class="prow__title prow__title--link pp-map__link" href="' + esc(abs(n.href, o.base)) + '"' + (on ? ' aria-current="page"' : '') + '>' + esc(n.title) + '</a></div>'
      + '<div class="prow__meta"><span class="prow__meta-item"><i data-icon="' + (id === ix.root ? ICON_ROOT : ICON_PAGE) + '"></i>'
      + '<span class="prow__meta-text">' + esc(app) + ' · ' + esc(n.page) + '</span></span></div>'
      + '</div></div>'
      + (on ? chipsHTML(n, o, !o.states) : '')
      + (kids.length ? '<ul class="prow-tree__group">' + kids.map(function (k) { return rowHTML(k, ix, o, hereId); }).join('') + '</ul>' : '')
      + '</li>';
  }

  function treeHTML(ix, o, hereId) {
    /* служебный корень без строки: группа под ним сдвигается, как и все вложенные */
    return '<ul class="prow-tree" aria-label="' + esc(lab(o, 'map')) + '"><li class="prow-tree__node pp-map__vroot">'
      + '<ul class="prow-tree__group">' + rowHTML(ix.root, ix, o, hereId) + '</ul></li></ul>';
  }

  /* ---------------- раскладка майндмапа ---------------- */

  function layoutMind(v) {
    var board = v.board, ix = v.ix;
    if (!board || !ix.root) return;
    var cs = getComputedStyle(board);
    var colGap = parseFloat(cs.columnGap) || 0, rowGap = parseFloat(cs.rowGap) || 0;
    var H = {}, A = {}, X = {}, Y = {}, W = 0, maxDepth = 0;
    ix.order.forEach(function (id) {
      var el = v.cards[id], link = el.querySelector('.pp-map__link');
      H[id] = el.offsetHeight;
      W = Math.max(W, el.offsetWidth);
      A[id] = link ? link.offsetTop + link.offsetHeight / 2 : H[id] / 2;   // якорь линии — середина ссылки
    });
    if (!W) return;   // хост скрыт — повторит ResizeObserver
    function shift(id, d) { Y[id] += d; ix.kids[id].forEach(function (k) { shift(k, d); }); }
    function place(id, depth, top) {
      X[id] = depth * (W + colGap);
      maxDepth = Math.max(maxDepth, depth);
      var ks = ix.kids[id];
      if (!ks.length) { Y[id] = top; return top + H[id]; }
      var cur = top, bottom = top;
      ks.forEach(function (k) { bottom = place(k, depth + 1, cur); cur = bottom + rowGap; });
      var f = ks[0], l = ks[ks.length - 1];
      Y[id] = ((Y[f] + A[f]) + (Y[l] + A[l])) / 2 - A[id];
      if (Y[id] < top) { var d = top - Y[id]; ks.forEach(function (k) { shift(k, d); }); Y[id] = top; bottom += d; }
      return Math.max(bottom, Y[id] + H[id]);
    }
    var height = place(ix.root, 0, 0);
    var width = (maxDepth + 1) * W + maxDepth * colGap;
    ix.order.forEach(function (id) {
      v.cards[id].style.left = Math.round(X[id]) + 'px';
      v.cards[id].style.top = Math.round(Y[id]) + 'px';
    });
    board.style.width = Math.ceil(width) + 'px';
    board.style.height = Math.ceil(height) + 'px';
    var svg = v.svg;
    svg.setAttribute('width', Math.ceil(width));
    svg.setAttribute('height', Math.ceil(height));
    svg.setAttribute('viewBox', '0 0 ' + Math.ceil(width) + ' ' + Math.ceil(height));
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var dx = colGap / 2;
    ix.order.forEach(function (p) {
      ix.kids[p].forEach(function (c) {
        var x1 = X[p] + W, y1 = Y[p] + A[p], x2 = X[c], y2 = Y[c] + A[c];
        var path = document.createElementNS(SVGNS, 'path');
        path.setAttribute('class', 'pp-map__edge');
        path.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + (x1 + dx) + ',' + y1 + ' ' + (x2 - dx) + ',' + y2 + ' ' + x2 + ',' + y2);
        svg.appendChild(path);
      });
    });
  }

  /* ---------------- рантаймы ДС ---------------- */

  function wire(host) {
    try { if (window.dsIcons && window.dsIcons.apply) window.dsIcons.apply(host); } catch (e) { /* нет глифов */ }
    try { if (window.DSTooltip && window.DSTooltip.bindAll) window.DSTooltip.bindAll(host); } catch (e) { /* нет тултипов */ }
    try { if (window.DSChip && window.DSChip.refresh) window.DSChip.refresh(host); } catch (e) { /* нет рантайма чипов */ }
  }
  /* только свой тултип: глобальные закрывашки ДС закрыли бы слои страницы (ПН10) */
  function hideOwnTip(host) {
    try {
      var tt = window.DSTooltip && window.DSTooltip.current && window.DSTooltip.current();
      if (tt && tt.target && host.contains(tt.target)) tt.hide(true);
    } catch (e) { /* нет тултипов */ }
  }

  /* ---------------- render ---------------- */

  function render(host, data, opts) {
    var o = {
      mode: opts && opts.mode === 'tree' ? 'tree' : 'mind',
      base: baseUrl(opts && opts.base), here: (opts && opts.here) || location.href,
      states: !!(opts && opts.states), labels: (opts && opts.labels) || {}, onGo: opts && opts.onGo
    };
    var ix = index(data);
    var hereId = current(data, o.here, o.base);
    var v = { host: host, ix: ix, board: null, svg: null, cards: {}, ro: null, raf: 0 };
    host.classList.add('pp-map', 'pp-map--' + o.mode);
    if (!ix.root) {
      host.innerHTML = '<p class="pp-map__empty">' + esc(lab(o, 'empty')) + '</p>';
      return { setStates: function () {}, relayout: function () {}, current: function () { return null; }, destroy: function () { host.innerHTML = ''; } };
    }
    if (o.mode === 'tree') {
      host.innerHTML = treeHTML(ix, o, hereId);
    } else {
      host.innerHTML = '<div class="pp-map__scroll"><div class="pp-map__board" role="list" aria-label="' + esc(data.title || lab(o, 'map')) + '">'
        + '<svg class="pp-map__edges" aria-hidden="true" focusable="false"></svg>'
        + ix.order.map(function (id) { return cardHTML(ix.byId[id], ix, o, hereId); }).join('')
        + '</div></div>';
      v.board = host.querySelector('.pp-map__board');
      v.svg = host.querySelector('.pp-map__edges');
      Array.prototype.forEach.call(host.querySelectorAll('.pp-map__node'), function (el) { v.cards[el.getAttribute('data-pp-map-node')] = el; });
    }
    wire(host);

    function relayout() {
      if (o.mode !== 'mind') return;
      if (v.raf) cancelAnimationFrame(v.raf);
      v.raf = 0;
      layoutMind(v);
    }
    function later() {
      if (v.raf || o.mode !== 'mind') return;
      v.raf = requestAnimationFrame(function () { v.raf = 0; layoutMind(v); });
    }
    if (o.mode === 'mind') {
      layoutMind(v);
      try { if (document.fonts && document.fonts.ready) document.fonts.ready.then(later); } catch (e) { /* без шрифтового API */ }
      if (window.ResizeObserver) {
        v.ro = new ResizeObserver(later);
        Object.keys(v.cards).forEach(function (id) { v.ro.observe(v.cards[id]); });
      }
    }

    /* клик по карточке вне ссылки и чипов — переход по ссылке карточки */
    function onClick(e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (a && host.contains(a)) {
        if (!o.onGo || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        var owner = a.closest('[data-pp-map-node]');
        var nodeId = a.getAttribute('data-pp-map-node') || (owner && owner.getAttribute('data-pp-map-node'));
        if (o.onGo(a.href, nodeId, a.getAttribute('data-pp-map-state'))) e.preventDefault();
        return;
      }
      var card = e.target.closest && e.target.closest('.pp-map__node');
      if (!card || !host.contains(card) || e.target.closest('button')) return;
      var link = card.querySelector('.pp-map__link');
      if (!link) return;
      /* клик с модификаторами (новая вкладка, окно) — с теми же клавишами */
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window,
        ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey, button: e.button }));
    }
    host.addEventListener('click', onClick);

    return {
      setStates: function (on) {
        o.states = !!on;
        hideOwnTip(host);
        Array.prototype.forEach.call(host.querySelectorAll('.pp-map__states'), function (el) { el.hidden = !o.states; });
        if (o.states) { try { if (window.DSChip && window.DSChip.refresh) window.DSChip.refresh(host); } catch (e) { /* нет рантайма чипов */ } }
        relayout();
      },
      relayout: relayout,
      current: function () { return hereId; },
      destroy: function () {
        hideOwnTip(host);
        host.removeEventListener('click', onClick);
        if (v.ro) v.ro.disconnect();
        if (v.raf) cancelAnimationFrame(v.raf);
        host.innerHTML = '';
        host.classList.remove('pp-map', 'pp-map--' + o.mode);
      }
    };
  }

  window.ProtoPanelMap = { render: render, current: current };
})();

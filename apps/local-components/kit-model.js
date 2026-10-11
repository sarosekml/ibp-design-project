/* ============================================================
   kit-model.js — схема статусной модели на её странице в витрине.

   Страницу модели собирает kit-build.mjs (задача RE0014): каркас docs-split,
   вкладки с описанием, таблицами и вопросами. Модель (data/*-status-model.js
   приложения) подключена ссылкой, и этот модуль рисует по ней схему в
   верхней панели. Поэтому правка модели видна на схеме сразу, без
   пересборки; таблицы под схемой обновляет пересборка.

   Что рисует:
   - дорожки — колонки, как на макете «Статусы сделки»; статус — узел, ряд —
     шаг от начального статуса дорожки (обход в ширину; обратные рёбра и
     петли ряд не повышают); вид узла — по kind модели (легенда — на вкладке
     «Описание»);
   - переход — линия со стрелкой: сплошная — ручной, пунктир —
     автоматический, толстая — тип не указан; петля — действие без смены
     статуса;
   - связи между дорожками (after / requires переходов) — по переключателю;
     у выбранного статуса — всегда;
   - дорожки, связи между дорожками и масштаб — контролы вкладки
     «Конструктор» (конвенция конструктора ДС; вид им даёт docs-split.js);
   - выбор статуса или перехода — карточка справа (Tile ДС): входы, выходы,
     условия, окна (ссылки на их страницы), что запускает и после чего
     срабатывает. Адрес выбора — в хеше (#s=<id статуса> | #t=<id перехода>).

   Осознанное отклонение витрины: компонента схемы или графа в ДС нет, поэтому
   схема своя — HTML-узлы поверх SVG-слоя линий, только на токенах ДС
   (kit.css, раздел «страница статусной модели»).

   Вызов — из страницы: IBPKitModel.page({ id, global, base, hub, links }).
     global — имя window-переменной модели; links — id окна или компонента →
     путь до его страницы витрины.
   ============================================================ */
(function () {
  'use strict';

  var NODE_W = 164, NODE_H = 52, SLOT_GAP = 14, ROW_GAP = 40, LANE_PAD = 30, LANE_GAP = 10, HEAD_H = 52, TOP = 16;
  var SVGNS = 'http://www.w3.org/2000/svg';
  var KIND_LABEL = {
    initial: 'начальный', intermediate: 'промежуточный', target: 'целевой',
    final: 'конечный', terminal: 'терминальный', none: 'нет на схеме'
  };
  var TRIGGER_LABEL = { manual: 'ручной', auto: 'автоматический', none: 'тип не указан' };
  var VIA_LABEL = { button: 'кнопка', menu: 'пункт меню' };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function kindKey(k) { return KIND_LABEL[k] && k !== 'none' ? k : 'none'; }
  function triggerKey(t) { return t === 'manual' || t === 'auto' ? t : 'none'; }
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  function svg(tag, attrs) {
    var el = document.createElementNS(SVGNS, tag);
    for (var k in attrs) if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    return el;
  }

  /* ---------- индекс модели ---------- */

  function indexModel(model) {
    var ix = { model: model, lane: {}, st: {}, tr: {}, out: {}, inc: {}, loops: {}, triggers: {} };
    model.lanes.forEach(function (l) { ix.lane[l.id] = l; });
    model.statuses.forEach(function (s) { ix.st[s.id] = s; ix.out[s.id] = []; ix.inc[s.id] = []; ix.loops[s.id] = []; });
    model.transitions.forEach(function (t) {
      ix.tr[t.id] = t;
      if (!ix.st[t.from] || !ix.st[t.to]) return;
      if (t.from === t.to) { ix.loops[t.from].push(t); return; }
      ix.out[t.from].push(t);
      ix.inc[t.to].push(t);
    });
    /* triggers[id перехода] — автопереходы, которые срабатывают после него */
    model.transitions.forEach(function (t) {
      afterOf(t).forEach(function (id) { (ix.triggers[id] = ix.triggers[id] || []).push(t); });
    });
    return ix;
  }
  function afterOf(t) { return t.after ? [].concat(t.after.all || [], t.after.any || []) : []; }

  /* Ряд статуса — шаг от начального статуса своей дорожки. Недостижимые —
     ниже всех, в порядке модели. */
  function ranks(ix) {
    var rank = {};
    ix.model.lanes.forEach(function (lane) {
      var own = ix.model.statuses.filter(function (s) { return s.lane === lane.id; });
      var queue = own.filter(function (s) { return s.kind === 'initial'; }).map(function (s) { rank[s.id] = 0; return s.id; });
      while (queue.length) {
        var id = queue.shift();
        ix.out[id].forEach(function (t) {
          if (rank[t.to] === undefined) { rank[t.to] = rank[id] + 1; queue.push(t.to); }
        });
      }
      var max = 0;
      own.forEach(function (s) { if (rank[s.id] !== undefined) max = Math.max(max, rank[s.id]); });
      own.forEach(function (s) { if (rank[s.id] === undefined) rank[s.id] = ++max; });
    });
    return rank;
  }

  /* ---------- раскладка ---------- */

  function layout(ix, rank, laneIds) {
    var lanes = [], nodes = {}, x = 0, rows = 0;
    laneIds.forEach(function (lid) {
      var own = ix.model.statuses.filter(function (s) { return s.lane === lid; });
      var byRank = {};
      own.forEach(function (s) { (byRank[rank[s.id]] = byRank[rank[s.id]] || []).push(s); });
      var slots = 1;
      Object.keys(byRank).forEach(function (r) { slots = Math.max(slots, byRank[r].length); rows = Math.max(rows, Number(r) + 1); });
      var w = slots * NODE_W + (slots - 1) * SLOT_GAP + 2 * LANE_PAD;
      var lane = { id: lid, x: x, w: w, slots: slots, backL: 0, backR: 0 };
      lanes.push(lane);
      Object.keys(byRank).forEach(function (r) {
        var list = byRank[r];
        var off = (slots - list.length) * (NODE_W + SLOT_GAP) / 2;
        list.forEach(function (s, k) {
          var nx = x + LANE_PAD + off + k * (NODE_W + SLOT_GAP);
          var ny = HEAD_H + TOP + Number(r) * (NODE_H + ROW_GAP);
          nodes[s.id] = { s: s, lane: lane, x: nx, y: ny, cx: nx + NODE_W / 2, cy: ny + NODE_H / 2, r: Number(r) };
        });
      });
      x += w + LANE_GAP;
    });
    return { lanes: lanes, nodes: nodes, w: Math.max(0, x - LANE_GAP), h: HEAD_H + TOP + rows * (NODE_H + ROW_GAP) - ROW_GAP + TOP + 16 };
  }

  /* Кривая перехода: [x1,y1, c1x,c1y, c2x,c2y, x2,y2]. */
  function edgeCurve(a, b, lane, loopIndex) {
    if (a === b) {
      var k = 1 + loopIndex * 0.45;
      var sx = a.x + NODE_W - 22, sy = a.y, ex = a.x + NODE_W, ey = a.y + 18;
      return [sx, sy, sx + 10 * k, sy - 30 * k, ex + 30 * k, ey - 8 * k, ex, ey];
    }
    if (b.r > a.r) {
      var y1 = a.y + NODE_H, y2 = b.y, dy = (y2 - y1) / 2;
      return [a.cx, y1, a.cx, y1 + dy, b.cx, y2 - dy, b.cx, y2];
    }
    if (b.r === a.r) {
      var right = b.x > a.x;
      var x1 = right ? a.x + NODE_W : a.x, x2 = right ? b.x : b.x + NODE_W;
      return [x1, a.cy, (x1 + x2) / 2, a.cy, (x1 + x2) / 2, b.cy, x2, b.cy];
    }
    /* обратное ребро — дугой в поле дорожки, сбоку от узлов */
    var leftSide = (a.cx + b.cx) / 2 < lane.x + lane.w / 2;
    var n = leftSide ? lane.backL++ : lane.backR++;
    var gx = leftSide ? lane.x + LANE_PAD - 10 - (n % 4) * 7 : lane.x + lane.w - LANE_PAD + 10 + (n % 4) * 7;
    var ax = leftSide ? a.x : a.x + NODE_W, bx = leftSide ? b.x : b.x + NODE_W;
    return [ax, a.cy, gx, a.cy, gx, b.cy, bx, b.cy];
  }
  /* Связь между дорожками — горизонтальной S-кривой от бока к боку. */
  function crossCurve(a, b) {
    var right = b.cx > a.cx;
    var x1 = right ? a.x + NODE_W : a.x, x2 = right ? b.x : b.x + NODE_W, mx = (x1 + x2) / 2;
    return [x1, a.cy, mx, a.cy, mx, b.cy, x2, b.cy];
  }
  function pathOf(c) { return 'M' + c[0] + ',' + c[1] + ' C' + c[2] + ',' + c[3] + ' ' + c[4] + ',' + c[5] + ' ' + c[6] + ',' + c[7]; }
  function midOf(c) { return [(c[0] + 3 * c[2] + 3 * c[4] + c[6]) / 8, (c[1] + 3 * c[3] + 3 * c[5] + c[7]) / 8]; }

  /* ---------- страница ---------- */

  function page(opts) {
    ready(function () {
      if (window.IBPKitNav) window.IBPKitNav.render({ nav: document.getElementById('nav'), base: opts.base, current: opts.id, hub: opts.hub });
      var model = window[opts.global];
      var host = document.getElementById('kit-model');
      if (!host) return;
      if (!model || !Array.isArray(model.lanes)) {
        host.innerHTML = '<p class="kit-model__empty">Модель <code class="tok">window.' + esc(opts.global) + '</code> не загрузилась — проверьте путь к файлу модели.</p>';
        return;
      }
      new ModelView(host, model, opts.links || {}).mount();
      bindQuestionLinks();
    });
  }

  /* Номер вопроса — ссылка на строку «Открытых вопросов» во вкладке
     «Документация»: из карточки схемы вкладка может быть скрыта, и якорь сам не
     дойдёт — сначала показать вкладку, потом прокрутить. Хеш адреса не
     трогаем: в нём выбор на схеме. */
  function bindQuestionLinks() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[data-q]') : null;
      if (!a) return;
      e.preventDefault();
      var pane = document.getElementById('pane-docs'), tab = document.getElementById('tab-docs');
      if (pane && pane.hidden && tab) tab.click();
      setTimeout(function () {
        var row = document.getElementById('q-' + a.getAttribute('data-q'));
        if (!row) return;
        var r = row.closest('.tbl__row') || row;
        r.scrollIntoView({ block: 'center' });
        r.classList.add('kit-model-flash');
        setTimeout(function () { r.classList.remove('kit-model-flash'); }, 1600);
      }, 0);
    });
  }

  function ModelView(host, model, links) {
    this.host = host;
    this.ix = indexModel(model);
    this.rank = ranks(this.ix);
    this.links = links;
    this.laneFilter = null;     // null — все дорожки
    this.cross = false;         // связи между дорожками
    this.fit = true;            // масштаб «По ширине»
    this.sel = null;            // { kind: 's' | 't', id }
  }

  /* Контролы — в «Конструкторе», конвенцией ДС (.ctl > .lbl + .pg-select >
     select): docs-split.js сам делает из да/нет Switch, из 2–3 вариантов —
     ButtonGroup, 4 и больше оставляет списком. Строятся до его обработчика. */
  ModelView.prototype.controls = function () {
    var self = this, m = this.ix.model, host = document.getElementById('pg-controls');
    if (!host) return;
    var defs = [
      { key: 'lanes', label: 'Дорожки', options: [['all', 'Все дорожки']].concat(m.lanes.map(function (l) { return [l.id, l.label]; })) },
      { key: 'cross', label: 'Связи между дорожками', options: [['no', 'Нет'], ['yes', 'Да']] },
      { key: 'scale', label: 'Масштаб', options: [['fit', 'По ширине'], ['full', '100 %']] }
    ];
    this.ctl = {};
    defs.forEach(function (d) {
      var wrap = document.createElement('div');
      wrap.className = 'ctl';
      wrap.innerHTML = '<div class="lbl">' + esc(d.label) + '</div><div class="pg-select"><select aria-label="' + esc(d.label) + '">'
        + d.options.map(function (o) { return '<option value="' + esc(o[0]) + '">' + esc(o[1]) + '</option>'; }).join('') + '</select></div>';
      var sel = wrap.querySelector('select');
      sel.addEventListener('change', function () {
        if (d.key === 'lanes') { var f = sel.value === 'all' ? null : sel.value; if (f !== self.laneFilter) { self.laneFilter = f; self.draw(); } }
        if (d.key === 'cross') { var c = sel.value === 'yes'; if (c !== self.cross) { self.cross = c; self.highlight(); } }
        if (d.key === 'scale') { var k = sel.value === 'fit'; if (k !== self.fit) { self.fit = k; self.scale(); } }
      });
      self.ctl[d.key] = sel;
      host.appendChild(wrap);
    });
  };

  ModelView.prototype.mount = function () {
    var self = this;
    this.controls();
    this.host.innerHTML =
      '<div class="kit-model__bar">'
      + '<span class="kit-model__hint">Клик по статусу или линии — подробности справа · Esc — снять выбор · дорожки, связи и масштаб — вкладка «Конструктор»</span>'
      + '</div>'
      + '<div class="kit-model__main">'
      + '<div class="kit-model__canvas" tabindex="-1"><div class="kit-model__fit"><div class="kit-model__board"></div></div></div>'
      + '<aside class="kit-model__side" aria-live="polite"></aside>'
      + '</div>';
    this.canvas = this.host.querySelector('.kit-model__canvas');
    this.fitBox = this.host.querySelector('.kit-model__fit');
    this.board = this.host.querySelector('.kit-model__board');
    this.side = this.host.querySelector('.kit-model__side');

    this.board.addEventListener('click', function (e) {
      var n = e.target.closest('[data-node]'), ed = e.target.closest('[data-edge]');
      if (n) self.select({ kind: 's', id: n.getAttribute('data-node') });
      else if (ed) self.select({ kind: 't', id: ed.getAttribute('data-edge') });
      else self.select(null);
    });
    this.side.addEventListener('click', function (e) {
      var a = e.target.closest('[data-select]');
      if (a) { e.preventDefault(); self.select(parseSel(a.getAttribute('data-select')), true); return; }
      if (e.target.closest('[data-close]')) self.select(null);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && self.sel) self.select(null); });
    window.addEventListener('resize', function () { self.scale(); });
    if (window.ResizeObserver) new ResizeObserver(function () { self.scale(); }).observe(this.canvas);

    var fromHash = parseSel((location.hash || '').slice(1));
    this.sel = fromHash && ((fromHash.kind === 's' && this.ix.st[fromHash.id]) || (fromHash.kind === 't' && this.ix.tr[fromHash.id])) ? fromHash : null;
    this.draw();
    if (this.sel) this.reveal();
  };

  function parseSel(s) {
    var mm = /^([st])=(.+)$/.exec(s || '');
    return mm ? { kind: mm[1], id: decodeURIComponent(mm[2]) } : null;
  }

  ModelView.prototype.draw = function () {
    var self = this, ix = this.ix;
    var laneIds = this.laneFilter ? [this.laneFilter] : ix.model.lanes.map(function (l) { return l.id; });
    var L = this.lay = layout(ix, this.rank, laneIds);
    var html = '';
    L.lanes.forEach(function (lane, k) {
      var l = ix.lane[lane.id];
      html += '<div class="kit-model-lane' + (k % 2 ? ' kit-model-lane--alt' : '') + '" style="left:' + lane.x + 'px;width:' + lane.w + 'px;height:' + L.h + 'px">'
        + '<div class="kit-model-lane__head">'
        + (l.avatar ? '<span class="av av--circular av--s"><span class="av__text">' + esc(l.avatar) + '</span></span>' : '')
        + '<span class="kit-model-lane__title">' + esc(l.label) + '</span>'
        + '<code class="tok">' + esc(l.field) + '</code></div></div>';
    });
    Object.keys(L.nodes).forEach(function (id) {
      var n = L.nodes[id], s = n.s;
      var q = s.questions && s.questions.length ? ' · вопросы: ' + s.questions.join(', ') : '';
      html += '<button type="button" class="kit-model-node kit-model-node--' + kindKey(s.kind) + '" data-node="' + esc(id) + '"'
        + ' style="left:' + n.x + 'px;top:' + n.y + 'px;width:' + NODE_W + 'px;height:' + NODE_H + 'px"'
        + ' aria-label="' + esc(ix.lane[s.lane].label + ': ' + s.label + ', ' + KIND_LABEL[kindKey(s.kind)] + q) + '"'
        + ' title="' + esc(KIND_LABEL[kindKey(s.kind)] + q) + '">'
        + '<span class="kit-model-node__label">' + esc(s.label) + '</span>'
        + (s.questions && s.questions.length ? '<span class="kit-model-node__q" aria-hidden="true">?</span>' : '')
        + '</button>';
    });
    this.board.innerHTML = html;
    this.board.style.width = L.w + 'px';
    this.board.style.height = L.h + 'px';

    var g = svg('svg', { class: 'kit-model__edges', width: L.w, height: L.h, 'aria-hidden': 'true' });
    var defs = svg('defs', {});
    ['', '-hot', '-cross', '-dim'].forEach(function (v) {
      var mk = svg('marker', { id: 'km-arrow' + v, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
      mk.appendChild(svg('path', { d: 'M0,0 L10,5 L0,10 z', class: 'kit-model-arrow' + v }));
      defs.appendChild(mk);
    });
    g.appendChild(defs);
    this.edges = [];
    this.labels = [];
    var loopN = {};
    ix.model.transitions.forEach(function (t) {
      var a = L.nodes[t.from], b = L.nodes[t.to];
      if (!a || !b) return;
      var li = t.from === t.to ? (loopN[t.from] = (loopN[t.from] || 0) + 1) - 1 : 0;
      var c = edgeCurve(a, b, a.lane, li);
      var d = pathOf(c);
      var tk = triggerKey(t.trigger);
      var title = (t.action ? '«' + t.action + '»' : TRIGGER_LABEL[tk]) + ': ' + a.s.label + (t.from === t.to ? ' (без смены статуса)' : ' → ' + b.s.label);
      var hit = svg('path', { d: d, class: 'kit-model-hit', 'data-edge': t.id });
      var tt = svg('title', {}); tt.textContent = title; hit.appendChild(tt);
      var p = svg('path', { d: d, class: 'kit-model-edge kit-model-edge--' + tk, 'marker-end': 'url(#km-arrow)' });
      g.appendChild(p);
      g.appendChild(hit);
      self.edges.push({ t: t, el: p, kind: 'tr', from: t.from, to: t.to });
      self.labels.push({ id: t.id, at: midOf(c), text: t.action || (tk === 'auto' ? 'авто' : tk === 'none' ? '?' : '') });
    });
    /* связи между дорожками: «после перехода X» — от статуса, куда пришёл X,
       к статусу, куда ведёт автопереход; requires — от требуемого статуса */
    var seen = {};
    ix.model.transitions.forEach(function (t) {
      var b = L.nodes[t.to];
      if (!b) return;
      var srcs = afterOf(t).map(function (id) { var x = ix.tr[id]; return x ? x.to : null; }).concat(t.requires || []);
      srcs.forEach(function (sid) {
        var a = L.nodes[sid];
        if (!a || a.s.lane === b.s.lane) return;
        var key = sid + '>' + t.to;
        if (seen[key]) return;
        seen[key] = true;
        var p = svg('path', { d: pathOf(crossCurve(a, b)), class: 'kit-model-edge kit-model-edge--cross', 'marker-end': 'url(#km-arrow-cross)' });
        g.appendChild(p);
        self.edges.push({ t: t, el: p, kind: 'cross', from: sid, to: t.to });
      });
    });
    this.board.insertBefore(g, this.board.firstChild);
    this.labelLayer = document.createElement('div');
    this.labelLayer.className = 'kit-model__labels';
    this.board.appendChild(this.labelLayer);
    if (window.dsIcons) window.dsIcons.apply(this.board);
    this.highlight();
    this.renderSide();
    this.scale();
  };

  ModelView.prototype.scale = function () {
    if (!this.lay) return;
    var avail = this.canvas.clientWidth - 32;
    var k = this.fit && avail > 0 && this.lay.w > avail ? Math.max(0.4, avail / this.lay.w) : 1;
    this.board.style.transform = k === 1 ? '' : 'scale(' + k + ')';
    this.fitBox.style.width = Math.ceil(this.lay.w * k) + 'px';
    this.fitBox.style.height = Math.ceil(this.lay.h * k) + 'px';
  };

  /* Что связано с выбором: узлы, переходы и связи между дорожками. */
  ModelView.prototype.related = function () {
    var ix = this.ix, sel = this.sel, nodes = {}, trs = {};
    if (!sel) return null;
    if (sel.kind === 's') {
      nodes[sel.id] = true;
      [].concat(ix.out[sel.id], ix.inc[sel.id], ix.loops[sel.id]).forEach(function (t) { trs[t.id] = true; nodes[t.from] = true; nodes[t.to] = true; });
      this.crossOf(sel.id).forEach(function (c) { nodes[c.node] = true; });
    } else {
      var t = ix.tr[sel.id];
      if (t) { trs[t.id] = true; nodes[t.from] = true; nodes[t.to] = true; }
    }
    return { nodes: nodes, trs: trs };
  };

  /* Связи статуса с другими дорожками: { dir: 'after' | 'starts', tr, node }.
     after — автопереход сюда срабатывает после перехода tr другой дорожки
     (или требует статус); starts — приход сюда запускает автопереход tr. */
  ModelView.prototype.crossOf = function (sid) {
    var ix = this.ix, out = [];
    ix.inc[sid].forEach(function (t) {
      afterOf(t).forEach(function (id) {
        var x = ix.tr[id];
        if (x && ix.st[x.to] && ix.st[x.to].lane !== ix.st[sid].lane) out.push({ dir: 'after', tr: x, via: t, node: x.to });
      });
      (t.requires || []).forEach(function (rid) {
        if (ix.st[rid] && ix.st[rid].lane !== ix.st[sid].lane) out.push({ dir: 'requires', via: t, node: rid });
      });
    });
    ix.inc[sid].forEach(function (t) {
      (ix.triggers[t.id] || []).forEach(function (y) {
        if (ix.st[y.to] && ix.st[y.to].lane !== ix.st[sid].lane) out.push({ dir: 'starts', tr: y, via: t, node: y.to });
      });
    });
    return out;
  };

  ModelView.prototype.highlight = function () {
    var self = this, rel = this.related();
    this.board.querySelectorAll('[data-node]').forEach(function (n) {
      var id = n.getAttribute('data-node');
      n.classList.toggle('is-selected', !!(self.sel && self.sel.kind === 's' && self.sel.id === id));
      n.classList.toggle('is-dim', !!(rel && !rel.nodes[id]));
      n.setAttribute('aria-pressed', String(!!(self.sel && self.sel.kind === 's' && self.sel.id === id)));
    });
    this.edges.forEach(function (e) {
      var hot, show = true;
      if (e.kind === 'cross') {
        hot = !!(rel && self.sel.kind === 's' && (e.from === self.sel.id || e.to === self.sel.id));
        show = self.cross || hot;
      } else hot = !!(rel && rel.trs[e.t.id]);
      e.el.style.display = show ? '' : 'none';
      e.el.classList.toggle('is-hot', hot);
      e.el.classList.toggle('is-dim', !!(rel && !hot));
      e.el.setAttribute('marker-end', 'url(#km-arrow' + (hot ? '-hot' : rel ? '-dim' : e.kind === 'cross' ? '-cross' : '') + ')');
    });
    var lab = '';
    if (rel) {
      this.labels.forEach(function (l) {
        if (!rel.trs[l.id] || !l.text) return;
        lab += '<span class="kit-model-elabel" style="left:' + l.at[0] + 'px;top:' + l.at[1] + 'px">' + esc(l.text) + '</span>';
      });
    }
    this.labelLayer.innerHTML = lab;
    spread(this.labelLayer.children);
  };

  /* Подписи соседних переходов садятся в одну точку — раздвинуть по вертикали:
     каждая следующая (по высоте) опускается ниже той, с которой пересеклась. */
  function spread(list) {
    var els = Array.prototype.slice.call(list).sort(function (a, b) { return parseFloat(a.style.top) - parseFloat(b.style.top); });
    var boxes = [];
    els.forEach(function (el) {
      var w = el.offsetWidth, h = el.offsetHeight || 20;
      var x = parseFloat(el.style.left) - w / 2, y = parseFloat(el.style.top) - h / 2;
      for (var moved = true, n = 0; moved && n < 20; n++) {
        moved = false;
        for (var i = 0; i < boxes.length; i++) {
          var b = boxes[i];
          if (x < b.x + b.w + 4 && b.x < x + w + 4 && y < b.y + b.h + 2 && b.y < y + h + 2) { y = b.y + b.h + 2; moved = true; }
        }
      }
      el.style.top = (y + h / 2) + 'px';
      boxes.push({ x: x, y: y, w: w, h: h });
    });
  }

  ModelView.prototype.select = function (sel, reveal) {
    this.sel = sel;
    try {
      history.replaceState(null, '', sel ? '#' + sel.kind + '=' + encodeURIComponent(sel.id) : location.pathname + location.search);
    } catch (e) { /* file:// в части браузеров — без адреса выбора */ }
    if (sel && sel.kind === 's' && this.laneFilter && this.ix.st[sel.id] && this.ix.st[sel.id].lane !== this.laneFilter) {
      this.laneFilter = null;
      this.draw();
      /* контрол «Дорожки» — следом: change синхронизирует его вид (docs-split) */
      if (this.ctl && this.ctl.lanes) { this.ctl.lanes.value = 'all'; this.ctl.lanes.dispatchEvent(new Event('change', { bubbles: true })); }
    } else {
      this.highlight();
      this.renderSide();
    }
    if (reveal) this.reveal();
  };

  ModelView.prototype.reveal = function () {
    var id = this.sel && (this.sel.kind === 's' ? this.sel.id : (this.ix.tr[this.sel.id] || {}).from);
    var n = id && this.board.querySelector('[data-node="' + id + '"]');
    if (n) n.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  /* ---------- карточка справа ---------- */

  ModelView.prototype.stRef = function (id) {
    var s = this.ix.st[id];
    return s ? '<a class="inl" href="#s=' + esc(id) + '" data-select="s=' + esc(id) + '">' + esc(s.label) + '</a>' : esc(id);
  };
  ModelView.prototype.laneOf = function (id) { var s = this.ix.st[id]; return s ? this.ix.lane[s.lane].label : ''; };
  ModelView.prototype.qLinks = function (qs) {
    return (qs || []).map(function (n) { return '<a class="inl" href="#q-' + n + '" data-q="' + n + '">' + n + '</a>'; }).join(', ');
  };
  ModelView.prototype.cond = function (t) {
    var self = this, ix = this.ix, parts = [];
    if (t.when) parts.push(esc(t.when));
    var trText = function (id) {
      var x = ix.tr[id];
      return x ? esc(self.laneOf(x.from)) + ': ' + (x.action ? '«' + esc(x.action) + '»' : self.stRef(x.from) + ' → ' + self.stRef(x.to)) : esc(id);
    };
    if (t.after && t.after.all) parts.push('после всех: ' + t.after.all.map(trText).join('; '));
    if (t.after && t.after.any) parts.push('после любого: ' + t.after.any.map(trText).join('; '));
    if (t.requires && t.requires.length) parts.push('и статусы: ' + t.requires.map(function (id) { return esc(self.laneOf(id)) + ' ' + self.stRef(id); }).join(', '));
    return parts.join('<br>');
  };
  ModelView.prototype.trMeta = function (t) {
    var rows = [];
    rows.push(['Тип', esc(TRIGGER_LABEL[triggerKey(t.trigger)])]);
    if (t.actor) rows.push(['Кто', esc(t.actor)]);
    if (t.action) rows.push(['Действие', (VIA_LABEL[t.via] ? esc(VIA_LABEL[t.via]) + ' ' : '') + '«' + esc(t.action) + '»']);
    if (t.modal) rows.push(['Окно', this.links[t.modal] ? '<a class="inl" href="' + esc(this.links[t.modal]) + '">' + esc(t.modal) + '</a>' : '<code class="tok">' + esc(t.modal) + '</code>']);
    var c = this.cond(t);
    if (c) rows.push(['Условие', c]);
    var self = this, starts = this.ix.triggers[t.id] || [];
    if (starts.length) rows.push(['Запускает', starts.map(function (y) {
      return esc(self.laneOf(y.from)) + ': ' + self.stRef(y.from) + ' → ' + self.stRef(y.to);
    }).join('<br>')]);
    if (t.note) rows.push(['Примечание', esc(t.note)]);
    if (t.questions && t.questions.length) rows.push(['Вопросы', this.qLinks(t.questions)]);
    return dl(rows);
  };
  function dl(rows) {
    return '<dl class="kit-model-card__dl">' + rows.map(function (r) { return '<dt>' + esc(r[0]) + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>';
  }
  function chipOf(s) {
    return '<span class="chip chip--xs' + (s.tone ? ' ' + esc(s.tone) : '') + '"><span class="chip__label">' + esc(s.label) + '</span></span>';
  }
  function tile(title, eyebrow, body, closable) {
    return '<section class="tile kit-model-card">'
      + '<header class="tile__header"><div class="tile__header-main">'
      + (eyebrow ? '<p class="kit-model-card__eyebrow">' + eyebrow + '</p>' : '')
      + '<div class="tile__title-row"><h3 class="tile__title">' + title + '</h3></div></div>'
      + (closable ? '<div class="tile__actions"><button type="button" class="ibtn ibtn--neutral ibtn--s" data-close aria-label="Снять выбор"><i data-icon="close"></i></button></div>' : '')
      + '</header><div class="tile__body">' + body + '</div></section>';
  }

  ModelView.prototype.renderSide = function () {
    var self = this, ix = this.ix, sel = this.sel, html;
    if (!sel) {
      var m = ix.model;
      html = tile('Схема статусов', '', '<p class="kit-model-card__text">Выберите статус или линию перехода на схеме: здесь появятся входы и выходы, кто и чем переводит, условия, окна и связи с другими дорожками.</p>'
        + dl([
          ['Дорожки', m.lanes.map(function (l) { return esc(l.label); }).join(' · ')],
          ['Статусов', String(m.statuses.length)],
          ['Переходов', String(m.transitions.length)],
          ['Открытых вопросов', String(m.openQuestions.length)]
        ]), false);
    } else if (sel.kind === 's') {
      var s = ix.st[sel.id];
      var item = function (t, dir) {
        var other = dir === 'in' ? t.from : t.to;
        return '<li class="kit-model-card__item"><p class="kit-model-card__route">' + (dir === 'in' ? self.stRef(other) + ' → сюда' : dir === 'out' ? 'отсюда → ' + self.stRef(other) : 'без смены статуса')
          + ' · <a class="inl" href="#t=' + esc(t.id) + '" data-select="t=' + esc(t.id) + '">' + (t.action ? '«' + esc(t.action) + '»' : esc(TRIGGER_LABEL[triggerKey(t.trigger)])) + '</a></p>'
          + self.trMeta(t) + '</li>';
      };
      var block = function (title, list) { return list.length ? '<h4 class="kit-model-card__h">' + esc(title) + '</h4><ul class="kit-model-card__list">' + list.join('') + '</ul>' : ''; };
      var cross = this.crossOf(sel.id).map(function (c) {
        var what = c.dir === 'after' ? 'срабатывает после: ' + esc(self.laneOf(c.tr.from)) + ' ' + (c.tr.action ? '«' + esc(c.tr.action) + '»' : 'переход') + ' → ' + self.stRef(c.node)
          : c.dir === 'requires' ? 'требует статус: ' + esc(self.laneOf(c.node)) + ' ' + self.stRef(c.node)
          : 'запускает: ' + esc(self.laneOf(c.tr.from)) + ' ' + self.stRef(c.tr.from) + ' → ' + self.stRef(c.tr.to);
        return '<li class="kit-model-card__item"><p class="kit-model-card__route">' + what + '</p></li>';
      });
      var info = [['Вид', esc(KIND_LABEL[kindKey(s.kind)])]];
      if (s.editable === true || s.editable === false) info.push(['Правка сущностей', s.editable ? 'да' : 'нет']);
      info.push(['id', '<code class="tok">' + esc(s.id) + '</code>']);
      if (s.questions && s.questions.length) info.push(['Вопросы', this.qLinks(s.questions)]);
      html = tile(esc(s.label), esc(ix.lane[s.lane].label) + ' · ' + chipOf(s),
        (s.note ? '<p class="kit-model-card__text">' + esc(s.note) + '</p>' : '') + dl(info)
        + block('Как попасть', ix.inc[s.id].map(function (t) { return item(t, 'in'); }))
        + block('Что дальше', ix.out[s.id].map(function (t) { return item(t, 'out'); }))
        + block('Действия без смены статуса', ix.loops[s.id].map(function (t) { return item(t, 'loop'); }))
        + block('Связи с другими дорожками', cross)
        + (!ix.inc[s.id].length && !ix.out[s.id].length && !ix.loops[s.id].length ? '<p class="kit-model-card__text">Переходов у статуса нет.</p>' : ''), true);
    } else {
      var t = ix.tr[sel.id];
      if (!t) { this.sel = null; return this.renderSide(); }
      html = tile(t.from === t.to ? self.stRef(t.from) + ' (без смены)' : self.stRef(t.from) + ' → ' + self.stRef(t.to),
        esc(this.laneOf(t.from)) + ' · переход <code class="tok">' + esc(t.id) + '</code>',
        this.trMeta(t), true);
    }
    this.side.innerHTML = html;
    if (window.dsIcons) window.dsIcons.apply(this.side);
  };

  window.IBPKitModel = { page: page };
})();

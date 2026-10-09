/* =========================================================================
   DocCard — documentation page logic
   ========================================================================= */
(function () {
  const L = window.DS_ICONS || {};
  const icon = (n) => L[n] || '';
  const paint = (el) => {
    if (window.dsIcons) window.dsIcons.apply(el);
    if (window.DSMenu) window.DSMenu.bindAll(el);
    return el;
  };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const TITLES = {
    short: 'ПАО «Волга-Агро» — материал с идеями',
    long: 'Минеральные удобрения, СЗФО — бенчмарки маржинальности и долговой нагрузки по группе компаний',
  };
  const META = {
    own: 'Детальный · версия 2 · 05.10.2026',
    prior: 'Гусев П. И. · 28.08.2026, 09:15 · Краткий',
  };

  /* ---------- card factory ----------
     o.title, o.meta: текст; o.actions: 2 | 1 | 0; o.glyph: иконка документа;
     o.hover / o.focus: витрина состояний */
  function makeCard(o) {
    const card = document.createElement('div');
    card.className = 'doccard' + (o.hover ? ' is-hover' : '');
    const acts = o.actions === 0 ? '' : '<div class="doccard__actions">' +
      '<button type="button" class="btn btn--outline btn--s"><i data-icon="visibility-on"></i><span class="btn__label">Просмотр</span></button>' +
      (o.actions === 2 ? '<button type="button" class="btn btn--outline btn--s" aria-haspopup="menu" aria-expanded="false" data-menu="doc-menu"><i data-icon="download"></i><span class="btn__label">Скачать</span><i data-icon="chevron-down"></i></button>' : '') +
      '</div>';
    card.innerHTML = '<span class="doccard__icon" aria-hidden="true"><i data-icon="' + (o.glyph || 'document-check') + '"></i></span>' +
      '<div class="doccard__main">' +
      '<button type="button" class="doccard__title' + (o.focus ? ' is-focus' : '') + '" data-tooltip="' + esc(o.title) + '" data-tooltip-truncated="only">' + esc(o.title) + '</button>' +
      '<span class="doccard__meta">' + esc(o.meta) + '</span></div>' + acts;
    return paint(card);
  }
  function markup(o) {
    return '&lt;div class="doccard"&gt;<br>' +
      '&nbsp;&nbsp;&lt;span class="doccard__icon" aria-hidden="true"&gt;&lt;i data-icon="' + (o.glyph || 'document-check') + '"&gt;&lt;/i&gt;&lt;/span&gt;<br>' +
      '&nbsp;&nbsp;&lt;div class="doccard__main"&gt;&lt;button class="doccard__title" data-tooltip="…" data-tooltip-truncated="only"&gt;…&lt;/button&gt;&lt;span class="doccard__meta"&gt;…&lt;/span&gt;&lt;/div&gt;' +
      (o.actions ? '<br>&nbsp;&nbsp;&lt;div class="doccard__actions"&gt;' + (o.actions === 2 ? 'Просмотр + Скачать ▾' : 'Просмотр') + '&lt;/div&gt;' : '') + '<br>&lt;/div&gt;';
  }

  /* ============================ PLAYGROUND ============================ */
  (function () {
    const state = { title: 'short', meta: 'own', actions: '2', width: 'wide', st: 'default' };
    const controls = document.getElementById('pg-controls');
    const stage = document.getElementById('pg-stage');
    const codeEl = document.getElementById('pg-code');

    function select(label, options, getCur, onPick) {
      const wrap = document.createElement('div'); wrap.className = 'ctl';
      const l = document.createElement('div'); l.className = 'lbl'; l.textContent = label; wrap.appendChild(l);
      const box = document.createElement('div'); box.className = 'pg-select';
      const sel = document.createElement('select');
      options.forEach(([val, txt]) => { const op = document.createElement('option'); op.value = val; op.textContent = txt; if (val === getCur()) op.selected = true; sel.appendChild(op); });
      sel.addEventListener('change', () => { onPick(sel.value); render(); });
      box.appendChild(sel); wrap.appendChild(box); return wrap;
    }

    controls.appendChild(select('Название', [['short', 'Короткое'], ['long', 'Длинное — усечение и тултип']], () => state.title, (v) => state.title = v));
    controls.appendChild(select('Параметры', [['own', 'Материал: тип · версия · дата'], ['prior', 'Документ коллеги: автор · дата · объём']], () => state.meta, (v) => state.meta = v));
    controls.appendChild(select('Действия', [['2', 'Просмотр и Скачать'], ['1', 'Только Просмотр'], ['0', 'Без действий']], () => state.actions, (v) => state.actions = v));
    controls.appendChild(select('Состояние', [['default', 'Default'], ['hover', 'Hover — карточка'], ['focus', 'Focus — название']], () => state.st, (v) => state.st = v));
    controls.appendChild(select('Ширина', [['wide', 'Колонка нити · 880px'], ['narrow', 'Узкая колонка · 480px']], () => state.width, (v) => state.width = v));

    function render() {
      stage.innerHTML = '';
      const box = document.createElement('div');
      box.style.cssText = 'width:100%; max-width:' + (state.width === 'narrow' ? '480px' : '880px') + ';';
      const o = { title: TITLES[state.title], meta: META[state.meta], actions: +state.actions, hover: state.st === 'hover', focus: state.st === 'focus' };
      box.appendChild(makeCard(o));
      stage.appendChild(box);
      codeEl.innerHTML = '<code>' + markup(o) + '</code>';
    }
    render();
  })();

  /* ============================ USAGE: в нити ============================ */
  (function () {
    const host = document.getElementById('use-thread');
    if (!host) return;
    const msg = (text, node, extra) => {
      const m = document.createElement('div');
      m.style.cssText = 'display:flex; flex-direction:column; gap:var(--space-8);';
      const p = document.createElement('p');
      p.style.cssText = 'margin:0; font:var(--type-body-m); color:var(--text-primary);';
      p.textContent = text;
      m.appendChild(p);
      m.appendChild(node);
      if (extra) m.appendChild(extra);
      return m;
    };
    host.appendChild(msg('Готово — материал собран: ключевые показатели, возможности для продуктов, риски и позиция на встречу.', makeCard({ title: TITLES.short, meta: META.own, actions: 2 })));
    /* композиция экрана: под карточкой коллеги — переключатель «Добавить в контекст» */
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;';
    row.innerHTML = '<button type="button" class="btn btn--transparent btn--s" aria-pressed="false"><span class="btn__icon btn__icon--toggle" aria-hidden="true"><i data-icon="add"></i><i data-icon="check"></i></span><span class="btn__label">Добавить в контекст</span></button>';
    const tgl = row.querySelector('button');
    tgl.addEventListener('click', () => {
      const on = tgl.getAttribute('aria-pressed') !== 'true';
      tgl.setAttribute('aria-pressed', String(on));
      tgl.querySelector('.btn__label').textContent = on ? 'В контексте' : 'Добавить в контекст';
    });
    paint(row);
    host.appendChild(msg('Отчёт коллеги из другого запроса.', makeCard({ title: 'Минеральные удобрения, СЗФО — бенчмарки маржинальности', meta: META.prior, actions: 2 }), row));
  })();

  /* ============================ VARIANTS ============================ */
  (function () {
    const host = document.getElementById('var-actions');
    if (!host) return;
    [[2, 'Два действия — Просмотр и Скачать ▾'], [1, 'Одно действие'], [0, 'Без действий — только название']].forEach(([n, t]) => {
      const cap = document.createElement('p'); cap.className = 'demo-rowlabel'; cap.textContent = t;
      host.appendChild(cap);
      host.appendChild(makeCard({ title: TITLES.short, meta: META.own, actions: n }));
    });
  })();

  /* ============================ CONTENT: усечение ============================ */
  (function () {
    const host = document.getElementById('content-trunc');
    if (!host) return;
    const box = document.createElement('div');
    box.style.cssText = 'max-width:520px;';
    box.appendChild(makeCard({ title: TITLES.long, meta: META.own, actions: 2 }));
    host.appendChild(box);
  })();

  /* ============================ STATES ============================ */
  (function () {
    const host = document.getElementById('states-demo');
    if (!host) return;
    [['Default', {}], ['Hover — карточка', { hover: true }], ['Focus — название', { focus: true }]].forEach(([t, s]) => {
      const cap = document.createElement('p'); cap.className = 'demo-rowlabel'; cap.textContent = t;
      host.appendChild(cap);
      host.appendChild(makeCard(Object.assign({ title: TITLES.short, meta: META.own, actions: 2 }, s)));
    });
  })();

  /* ============================ GUIDELINES ============================ */
  (function () {
    const BAD = icon('close') || '×';
    const GOOD = icon('check') || '✓';
    ['ic-bad1', 'ic-bad2'].forEach((id) => { const n = document.getElementById(id); if (n) n.innerHTML = BAD; });
    ['ic-good1', 'ic-good2'].forEach((id) => { const n = document.getElementById(id); if (n) n.innerHTML = GOOD; });
    const put = (id, node) => { const n = document.getElementById(id); if (n) { node.style.flex = '1'; n.appendChild(node); } };
    put('guide-good1', makeCard({ title: TITLES.short, meta: META.own, actions: 2 }));
    /* антипример: третье действие кнопкой — ряд теснит название */
    const bad1 = makeCard({ title: TITLES.short, meta: META.own, actions: 2 });
    const third = document.createElement('button');
    third.type = 'button'; third.className = 'btn btn--outline btn--s';
    third.innerHTML = '<i data-icon="copy"></i><span class="btn__label">Копировать</span>';
    bad1.querySelector('.doccard__actions').appendChild(paint(third));
    put('guide-bad1', bad1);
    put('guide-good2', makeCard({ title: TITLES.short, meta: META.own, actions: 1 }));
    /* антипример: вся карточка — ссылка, кнопки внутри неё */
    const bad2 = makeCard({ title: TITLES.short, meta: META.own, actions: 1 });
    bad2.style.cursor = 'pointer';
    bad2.querySelector('.doccard__title').outerHTML = '<span class="doccard__title" style="cursor:pointer">' + esc(TITLES.short) + '</span>';
    put('guide-bad2', bad2);
  })();

  /* ============================ COLORS: hex из живого токена ============================ */
  (function () {
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute; left:-9999px; width:0; height:0;';
    document.body.appendChild(probe);
    document.querySelectorAll('[data-hex]').forEach((n) => {
      probe.style.backgroundColor = 'transparent';
      probe.style.backgroundColor = 'var(' + n.getAttribute('data-hex') + ')';
      const v = getComputedStyle(probe).backgroundColor;
      const c = v.match(/[\d.]+/g);
      if (!c) return;
      const hx = (x) => Math.round(+x).toString(16).padStart(2, '0').toUpperCase();
      n.textContent = '#' + hx(c[0]) + hx(c[1]) + hx(c[2]) + (c[3] !== undefined && +c[3] < 1 ? ' · ' + Math.round(c[3] * 100) + '%' : '');
    });
    probe.remove();
  })();

  /* ============================ DEV: redline measured from live component ============================ */
  (function () {
    const host = document.createElement('div');
    host.style.cssText = 'position:absolute; left:-9999px; top:0; width:880px;';
    document.body.appendChild(host);
    const card = makeCard({ title: TITLES.short, meta: META.own, actions: 2 });
    host.appendChild(card);
    const cs = getComputedStyle(card);
    const ic = getComputedStyle(card.querySelector('.doccard__icon'));
    const gl = getComputedStyle(card.querySelector('.doccard__icon > [data-icon]'));
    const mn = getComputedStyle(card.querySelector('.doccard__main'));
    const tt = getComputedStyle(card.querySelector('.doccard__title'));
    const mt = getComputedStyle(card.querySelector('.doccard__meta'));
    const ac = getComputedStyle(card.querySelector('.doccard__actions'));
    const set = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = v; };
    set('dv-pad-x', cs.paddingTop);
    set('dv-radius-x', cs.borderTopLeftRadius + ' · рамка ' + cs.borderTopWidth);
    set('dv-gap-x', cs.columnGap);
    set('dv-icon-x', ic.width + ' × ' + ic.height + ' · радиус ' + ic.borderTopLeftRadius + ' · глиф ' + gl.width);
    set('dv-main-x', mn.rowGap);
    set('dv-title-x', tt.fontSize + ' / ' + tt.lineHeight + ' · ' + tt.fontWeight);
    set('dv-meta-x', mt.fontSize + ' / ' + mt.lineHeight);
    set('dv-acts-x', ac.columnGap);
    host.remove();
  })();
})();

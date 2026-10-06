/* =========================================================================
   StepMarker — documentation page logic
   ========================================================================= */
(function () {
  const L = window.DS_ICONS || {};
  const icon = (n) => L[n] || '';
  const paint = (el) => { if (window.dsIcons) window.dsIcons.apply(el); return el; };

  /* ---------- marker factory ----------
     n: номер шага; size: 's' | 'm' | 'l';
     state: '' (ожидает) | 'current' | 'done' | 'error' | 'disabled';
     err: глиф ошибки в разметке */
  function makeMarker(n, size = 'm', state = '', err = false) {
    const el = document.createElement('span');
    el.className = 'stepmark stepmark--' + size + (state ? ' stepmark--' + state : '');
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<span class="stepmark__num">' + n + '</span>' +
      '<i class="stepmark__icon" data-icon="check"></i>' +
      (err ? '<i class="stepmark__icon stepmark__icon--error" data-icon="alert-circle"></i>' : '');
    return paint(el);
  }
  function markup(n, size, state, err) {
    const cls = 'stepmark stepmark--' + size + (state ? ' stepmark--' + state : '');
    return '&lt;span class="' + cls + '" aria-hidden="true"&gt;' +
      '&lt;span class="stepmark__num"&gt;' + n + '&lt;/span&gt;' +
      '&lt;i class="stepmark__icon" data-icon="check"&gt;&lt;/i&gt;' +
      (err ? '&lt;i class="stepmark__icon stepmark__icon--error" data-icon="alert-circle"&gt;&lt;/i&gt;' : '') +
      '&lt;/span&gt;';
  }
  /* шаг: маркер + подпись — как в подписи шага StepForm */
  function step(marker, text, muted) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; align-items:center; gap:var(--space-8); font:var(--type-body-s-strong); color:var(' + (muted ? '--text-inactive' : '--text-primary') + ');';
    row.appendChild(marker);
    row.appendChild(document.createTextNode(text));
    return row;
  }
  function caption(text) {
    const p = document.createElement('p');
    p.className = 'demo-rowlabel';
    p.style.margin = '0';
    p.textContent = text;
    return p;
  }
  const STATES = [['', 'Ожидает'], ['current', 'Текущий'], ['done', 'Готов'], ['error', 'Ошибка'], ['disabled', 'Недоступен']];

  /* ============================ PLAYGROUND ============================ */
  (function () {
    const state = { size: 'm', st: 'done', n: '1', err: 'y', surface: 'tile' };
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

    controls.appendChild(select('Размер', [['s', 'S · 20'], ['m', 'M · 24'], ['l', 'L · 32']], () => state.size, (v) => state.size = v));
    controls.appendChild(select('Состояние', STATES.map(([v, t]) => [v || 'pending', t]), () => state.st, (v) => state.st = v));
    controls.appendChild(select('Номер', [['1', 'Номер 1'], ['2', 'Номер 2'], ['12', 'Номер 12']], () => state.n, (v) => state.n = v));
    controls.appendChild(select('Поверхность', [['tile', 'На тайле'], ['page', 'На фоне страницы']], () => state.surface, (v) => state.surface = v));
    controls.appendChild(select('Глиф ошибки', [['y', 'Есть'], ['n', 'Нет']], () => state.err, (v) => state.err = v));

    function render() {
      const st = state.st === 'pending' ? '' : state.st;
      stage.innerHTML = '';
      const box = document.createElement('div');
      box.style.cssText = 'padding:var(--space-16) var(--space-24); border-radius:var(--radius-m); background:var(' + (state.surface === 'page' ? '--bg-page' : '--bg-tile') + ');';
      box.appendChild(step(makeMarker(state.n, state.size, st, state.err === 'y'), 'Объект анализа', st === 'disabled'));
      stage.appendChild(box);
      codeEl.innerHTML = '<code>' + markup(state.n, state.size, st, state.err === 'y') + '</code>';
    }
    render();
  })();

  /* ============================ USAGE ============================ */
  (function () {
    const host = document.getElementById('use-steps');
    if (!host) return;
    host.appendChild(step(makeMarker(1, 'm', 'done'), 'Объект анализа'));
    host.appendChild(step(makeMarker(2, 'm', 'current'), 'Дополнительный фокус'));
    host.appendChild(step(makeMarker(3), 'Параметры отчёта'));
  })();

  /* ============================ VARIANTS ============================ */
  (function () {
    const host = document.getElementById('var-content');
    if (!host) return;
    [['Номер', makeMarker(2)], ['Галочка', makeMarker(2, 'm', 'done')], ['Глиф ошибки', makeMarker(2, 'm', 'error', true)], ['Номер тоном Error — без глифа', makeMarker(2, 'm', 'error')]].forEach(([t, m]) => {
      const cell = document.createElement('div');
      cell.style.cssText = 'display:flex; flex-direction:column; align-items:flex-start; gap:var(--space-8);';
      cell.appendChild(caption(t));
      cell.appendChild(m);
      host.appendChild(cell);
    });
  })();

  /* ============================ SIZES ============================ */
  (function () {
    const host = document.getElementById('sizes-demo');
    if (!host) return;
    [['s', 'S · 20'], ['m', 'M · 24'], ['l', 'L · 32']].forEach(([sz, nm]) => {
      const cell = document.createElement('div');
      cell.style.cssText = 'display:flex; flex-direction:column; gap:var(--space-8);';
      cell.appendChild(caption(nm));
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; align-items:center; gap:var(--space-8);';
      STATES.forEach(([st], i) => row.appendChild(makeMarker(i + 1, sz, st, true)));
      cell.appendChild(row);
      host.appendChild(cell);
    });
  })();

  /* ============================ BEHAVIOR: шаг готов ============================ */
  (function () {
    const host = document.getElementById('beh-steps');
    const next = document.getElementById('beh-next');
    const reset = document.getElementById('beh-reset');
    if (!host || !next || !reset) return;
    const LABELS = ['Объект анализа', 'Дополнительный фокус', 'Параметры отчёта'];
    let done = 0;
    function draw() {
      host.innerHTML = '';
      LABELS.forEach((t, i) => host.appendChild(step(makeMarker(i + 1, 'm', i < done ? 'done' : (i === done ? 'current' : '')), t)));
      next.disabled = done >= LABELS.length;
    }
    /* маркеры не перерисовываются целиком: меняется только модификатор —
       так видна анимация смены номера на галочку */
    next.addEventListener('click', () => {
      const marks = host.querySelectorAll('.stepmark');
      if (done >= marks.length) return;
      marks[done].classList.remove('stepmark--current');
      marks[done].classList.add('stepmark--done');
      done += 1;
      if (marks[done]) marks[done].classList.add('stepmark--current');
      next.disabled = done >= marks.length;
    });
    reset.addEventListener('click', () => { done = 0; draw(); });
    draw();
  })();

  /* ============================ STATES ============================ */
  (function () {
    const host = document.getElementById('states-demo');
    if (!host) return;
    STATES.forEach(([st, t], i) => {
      const cell = document.createElement('div');
      cell.style.cssText = 'display:flex; flex-direction:column; align-items:flex-start; gap:var(--space-8);';
      cell.appendChild(caption(t));
      cell.appendChild(makeMarker(i + 1, 'm', st, true));
      host.appendChild(cell);
    });
  })();

  /* ============================ GUIDELINES ============================ */
  (function () {
    const BAD = icon('close') || '×';
    const GOOD = icon('check') || '✓';
    ['ic-bad1', 'ic-bad2'].forEach((id) => { const n = document.getElementById(id); if (n) n.innerHTML = BAD; });
    ['ic-good1', 'ic-good2'].forEach((id) => { const n = document.getElementById(id); if (n) n.innerHTML = GOOD; });

    const col = () => { const d = document.createElement('div'); d.style.cssText = 'display:flex; flex-direction:column; gap:var(--space-8);'; return d; };
    const good1 = document.getElementById('guide-good1');
    if (good1) { const c = col(); c.appendChild(step(makeMarker(1, 'm', 'done'), 'Объект анализа')); c.appendChild(step(makeMarker(2), 'Дополнительный фокус')); good1.appendChild(c); }
    const bad1 = document.getElementById('guide-bad1');
    if (bad1) { const c = col(); c.appendChild(step(makeMarker('А'), 'Объект анализа')); c.appendChild(step(makeMarker('Б'), 'Дополнительный фокус')); bad1.appendChild(c); }

    const good2 = document.getElementById('guide-good2');
    if (good2) good2.appendChild(step(makeMarker(1, 'm', 'done'), 'Объект анализа'));
    const bad2 = document.getElementById('guide-bad2');
    if (bad2) {
      /* антипример: «готов» только цветом — номер остался на заливке */
      const m = makeMarker(1);
      m.style.background = 'var(--primary)';
      m.style.color = 'var(--text-on-dark)';
      bad2.appendChild(step(m, 'Объект анализа'));
    }
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
    host.style.cssText = 'position:absolute; left:-9999px; top:0;';
    document.body.appendChild(host);
    const m = {};
    ['s', 'm', 'l'].forEach((sz) => {
      const k = makeMarker(1, sz, 'done');
      host.appendChild(k);
      const cs = getComputedStyle(k);
      const ic = getComputedStyle(k.querySelector('.stepmark__icon'));
      m[sz] = {
        d: cs.width + ' × ' + cs.height,
        icon: ic.width,
        font: cs.fontSize + ' / ' + cs.lineHeight,
        weight: cs.fontWeight,
        radius: cs.borderTopLeftRadius,
      };
    });
    host.remove();
    const set = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = v; };
    ['s', 'm', 'l'].forEach((sz) => {
      set('dv-d-' + sz, m[sz].d);
      set('dv-icon-' + sz, m[sz].icon);
      set('dv-font-' + sz, m[sz].font);
      set('dv-weight-' + sz, m[sz].weight);
      set('dv-radius-' + sz, m[sz].radius);
    });
  })();
})();

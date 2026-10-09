/* =========================================================================
   Keyboard — documentation page logic
   ========================================================================= */
(function () {
  const L = window.DS_ICONS || {};
  const icon = (n) => L[n] || '';

  /* ---------- kbd factory ----------
     keys: ['Enter'] | ['Shift', 'Enter'] | …; size: 's' | 'm' | 'l' */
  function makeKbd(keys, size = 's') {
    const one = (k) => {
      const el = document.createElement('kbd');
      el.className = 'kbd kbd--' + size;
      el.textContent = k;
      return el;
    };
    if (keys.length === 1) return one(keys[0]);
    const combo = document.createElement('span');
    combo.className = 'kbd-combo';
    keys.forEach((k, i) => {
      if (i) combo.appendChild(document.createTextNode(' + '));
      combo.appendChild(one(k));
    });
    return combo;
  }
  function markup(keys, size) {
    const k = (t) => '&lt;kbd class="kbd kbd--' + size + '"&gt;' + t + '&lt;/kbd&gt;';
    if (keys.length === 1) return k(keys[0]);
    return '&lt;span class="kbd-combo"&gt;' + keys.map(k).join(' + ') + '&lt;/span&gt;';
  }
  /* строка текста того же кегля, что и клавиша: клавиша стоит в тексте */
  const TEXT = { s: '--type-body-xs', m: '--type-body-s', l: '--type-body-m' };
  function line(size, parts) {
    const p = document.createElement('p');
    p.style.cssText = 'margin:0; font:var(' + TEXT[size] + '); color:var(--text-secondary);';
    parts.forEach((x) => p.appendChild(typeof x === 'string' ? document.createTextNode(x) : x));
    return p;
  }
  const KEYS = { one: ['Enter'], two: ['Shift', 'Enter'], three: ['Ctrl', 'Shift', 'K'] };
  const ACTION = { one: ' — отправить', two: ' — новая строка', three: ' — открыть поиск' };

  /* ============================ PLAYGROUND ============================ */
  (function () {
    const state = { size: 's', keys: 'two', surface: 'tile' };
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

    controls.appendChild(select('Размер', [['s', 'S · Body XS'], ['m', 'M · Body S'], ['l', 'L · Body M']], () => state.size, (v) => state.size = v));
    controls.appendChild(select('Клавиши', [['one', 'Одна клавиша'], ['two', 'Сочетание из двух'], ['three', 'Сочетание из трёх']], () => state.keys, (v) => state.keys = v));
    controls.appendChild(select('Поверхность', [['tile', 'На тайле'], ['page', 'На фоне страницы']], () => state.surface, (v) => state.surface = v));

    function render() {
      stage.innerHTML = '';
      const box = document.createElement('div');
      box.style.cssText = 'padding:var(--space-16) var(--space-24); border-radius:var(--radius-m); background:var(' + (state.surface === 'page' ? '--bg-page' : '--bg-tile') + ');';
      box.appendChild(line(state.size, [makeKbd(KEYS[state.keys], state.size), ACTION[state.keys]]));
      stage.appendChild(box);
      codeEl.innerHTML = '<code>' + markup(KEYS[state.keys], state.size) + '</code>';
    }
    render();
  })();

  /* ============================ USAGE ============================ */
  (function () {
    /* подсказка под полем ввода — как в композере AI Pitcher */
    const hint = document.getElementById('use-hint');
    if (hint) {
      const row = document.createElement('p');
      row.style.cssText = 'margin:0; display:flex; flex-wrap:wrap; justify-content:center; gap:var(--space-4) var(--space-16); font:var(--type-body-xs); color:var(--text-secondary);';
      const part = (...xs) => { const s = document.createElement('span'); xs.forEach((x) => s.appendChild(typeof x === 'string' ? document.createTextNode(x) : x)); return s; };
      row.appendChild(part(makeKbd(['Enter']), ' — отправить'));
      row.appendChild(part(makeKbd(['Shift', 'Enter']), ' — новая строка'));
      row.appendChild(part('К запросу можно приложить PDF, Word, PowerPoint и Excel'));
      hint.appendChild(row);
    }
    /* справка в тексте */
    const text = document.getElementById('use-text');
    if (text) {
      text.appendChild(line('m', ['Нажмите ', makeKbd(['Ctrl', 'K'], 'm'), ', чтобы открыть поиск по разделам.']));
      text.appendChild(line('l', ['Сочетание ', makeKbd(['Ctrl', 'Enter'], 'l'), ' отправляет форму, не закрывая окно.']));
    }
  })();

  /* ============================ VARIANTS ============================ */
  (function () {
    const one = document.getElementById('var-one');
    const combo = document.getElementById('var-combo');
    if (one) ['Enter', 'Esc', 'Tab', 'K'].forEach((k) => { one.appendChild(makeKbd([k])); one.appendChild(document.createTextNode(' ')); });
    if (combo) {
      combo.appendChild(line('s', [makeKbd(['Shift', 'Enter'])]));
      combo.appendChild(line('s', [makeKbd(['Ctrl', 'Shift', 'K'])]));
    }
  })();

  /* ============================ SIZES ============================ */
  (function () {
    const host = document.getElementById('sizes-demo');
    if (!host) return;
    [['s', 'S'], ['m', 'M'], ['l', 'L']].forEach(([sz, nm]) => {
      const cell = document.createElement('div');
      cell.style.cssText = 'display:flex; flex-direction:column; gap:var(--space-8);';
      const cap = document.createElement('p'); cap.className = 'demo-rowlabel'; cap.textContent = nm; cell.appendChild(cap);
      cell.appendChild(line(sz, [makeKbd(['Enter'], sz), ' — отправить']));
      cell.appendChild(line(sz, [makeKbd(['Shift', 'Enter'], sz), ' — новая строка']));
      host.appendChild(cell);
    });
  })();

  /* ============================ GUIDELINES ============================ */
  (function () {
    const BAD = icon('close') || '×';
    const GOOD = icon('check') || '✓';
    ['ic-bad1', 'ic-bad2'].forEach((id) => { const n = document.getElementById(id); if (n) n.innerHTML = BAD; });
    ['ic-good1', 'ic-good2'].forEach((id) => { const n = document.getElementById(id); if (n) n.innerHTML = GOOD; });

    const good1 = document.getElementById('guide-good1');
    if (good1) good1.appendChild(line('s', [makeKbd(['Ctrl', 'Shift', 'K']), ' — открыть поиск']));
    const bad1 = document.getElementById('guide-bad1');
    if (bad1) bad1.appendChild(line('s', [makeKbd(['Ctrl', 'Alt', 'Shift', 'Win', 'K']), ' — открыть поиск']));

    const good2 = document.getElementById('guide-good2');
    if (good2) good2.appendChild(line('s', [makeKbd(['Enter']), ' — отправить']));
    const bad2 = document.getElementById('guide-bad2');
    if (bad2) {
      const b = makeKbd(['Отправить']);
      b.style.cursor = 'pointer';
      bad2.appendChild(line('s', ['Нажмите ', b]));
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
      n.textContent = '#' + hx(c[0]) + hx(c[1]) + hx(c[2]);
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
      const k = makeKbd(['K'], sz);
      host.appendChild(k);
      const cs = getComputedStyle(k);
      m[sz] = {
        h: k.offsetHeight + 'px',
        minW: cs.minWidth,
        pad: cs.paddingLeft,
        font: cs.fontSize + ' / ' + cs.lineHeight,
        radius: cs.borderTopLeftRadius,
        border: cs.borderTopWidth + ' / ' + cs.borderBottomWidth,
      };
    });
    host.remove();
    const set = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = v; };
    ['s', 'm', 'l'].forEach((sz) => {
      set('dv-h-' + sz, m[sz].h);
      set('dv-minw-' + sz, m[sz].minW);
      set('dv-pad-' + sz, m[sz].pad);
      set('dv-font-' + sz, m[sz].font);
      set('dv-radius-' + sz, m[sz].radius);
      set('dv-border-' + sz, m[sz].border);
    });
  })();
})();

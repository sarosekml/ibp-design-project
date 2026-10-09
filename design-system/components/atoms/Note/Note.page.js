/* =========================================================================
   Note — documentation page logic
   ========================================================================= */
(function () {
  const L = window.DS_ICONS || {};
  const icon = (n) => L[n] || '';
  const paint = (el) => { if (window.dsIcons) window.dsIcons.apply(el); return el; };

  const TEXT = {
    short: 'Подготовка отчета обычно занимает до 30 минут.',
    long: 'Подготовка отчета обычно занимает до 30 минут. Работа продолжится, даже если закрыть инструмент.',
    link: null,
  };

  /* ---------- note factory ----------
     size: 'xs' | 's' | 'm'; accent: тон иконки Primary; glyph: имя иконки;
     content: строка или узел (текст со ссылкой) */
  function makeNote(content, size = 's', accent = false, glyph = 'clock-timer') {
    const p = document.createElement('p');
    p.className = 'note note--' + size + (accent ? ' note--accent' : '');
    p.innerHTML = '<span class="note__icon" aria-hidden="true"><i data-icon="' + glyph + '"></i></span><span class="note__text"></span>';
    const t = p.querySelector('.note__text');
    if (typeof content === 'string') t.textContent = content; else t.appendChild(content);
    return paint(p);
  }
  function linkText() {
    const f = document.createDocumentFragment();
    f.appendChild(document.createTextNode('Доступ к отчёту получат участники сделки. '));
    const a = document.createElement('a');
    a.className = 'link link--accent link--inline';
    a.href = '#';
    a.textContent = 'Кто это';
    a.addEventListener('click', (e) => e.preventDefault());
    f.appendChild(a);
    return f;
  }
  function markup(size, accent, glyph, text) {
    return '&lt;p class="note note--' + size + (accent ? ' note--accent' : '') + '"&gt;' +
      '&lt;span class="note__icon" aria-hidden="true"&gt;&lt;i data-icon="' + glyph + '"&gt;&lt;/i&gt;&lt;/span&gt;' +
      '&lt;span class="note__text"&gt;' + text + '&lt;/span&gt;&lt;/p&gt;';
  }
  function caption(text) {
    const p = document.createElement('p');
    p.className = 'demo-rowlabel';
    p.textContent = text;
    return p;
  }

  /* ============================ PLAYGROUND ============================ */
  (function () {
    const state = { size: 's', tone: 'accent', glyph: 'clock-timer', text: 'long', width: 'wide' };
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

    controls.appendChild(select('Размер', [['xs', 'XS · Body XS'], ['s', 'S · Body S'], ['m', 'M · Body M']], () => state.size, (v) => state.size = v));
    controls.appendChild(select('Иконка', [['clock-timer', 'Часы (clock-timer)'], ['info-circle', 'Информация (info-circle)'], ['history', 'История (history)']], () => state.glyph, (v) => state.glyph = v));
    controls.appendChild(select('Текст', [['short', 'Одна строка'], ['long', 'Длинный текст'], ['link', 'Текст со ссылкой']], () => state.text, (v) => state.text = v));
    controls.appendChild(select('Ширина', [['wide', 'Широкий контейнер'], ['narrow', 'Узкий контейнер · 280px']], () => state.width, (v) => state.width = v));
    controls.appendChild(select('Тон', [['accent', 'Акцент'], ['neutral', 'Нейтральный']], () => state.tone, (v) => state.tone = v));

    function render() {
      stage.innerHTML = '';
      const box = document.createElement('div');
      box.style.cssText = 'padding:var(--space-16) var(--space-24); border-radius:var(--radius-m); background:var(--bg-tile);' + (state.width === 'narrow' ? ' width:280px;' : ' width:100%; max-width:640px;');
      const content = state.text === 'link' ? linkText() : TEXT[state.text];
      box.appendChild(makeNote(content, state.size, state.tone === 'accent', state.glyph));
      stage.appendChild(box);
      const txt = state.text === 'link' ? 'Доступ к отчёту получат участники сделки. &lt;a class="link link--accent link--inline" href="…"&gt;Кто это&lt;/a&gt;' : TEXT[state.text];
      codeEl.innerHTML = '<code>' + markup(state.size, state.tone === 'accent', state.glyph, txt) + '</code>';
    }
    render();
  })();

  /* ============================ USAGE ============================ */
  (function () {
    const form = document.getElementById('use-form');
    if (form) {
      const field = document.createElement('div');
      field.className = 'inp inp--m';
      field.innerHTML = '<label class="ds-label" for="use-inp"><span class="ds-label__text">Объект анализа</span></label>' +
        '<div class="inp__field"><input class="inp__control" id="use-inp" placeholder="Компания, группа или отрасль"></div>';
      form.appendChild(field);
      form.appendChild(makeNote(TEXT.long, 's', true));
    }
    const modal = document.getElementById('use-modal');
    if (modal) {
      modal.appendChild(makeNote('Изменения вступят в силу со следующего дня. Сделка останется в работе.', 'xs', false, 'info-circle'));
    }
  })();

  /* ============================ VARIANTS ============================ */
  (function () {
    const tone = document.getElementById('var-tone');
    if (tone) {
      [['Нейтральный — --secondary', false], ['Акцент — --primary', true]].forEach(([t, a]) => {
        const cell = document.createElement('div');
        cell.appendChild(caption(t));
        cell.appendChild(makeNote(TEXT.short, 's', a));
        tone.appendChild(cell);
      });
    }
    const link = document.getElementById('var-link');
    if (link) link.appendChild(makeNote(linkText(), 's', false, 'info-circle'));
  })();

  /* ============================ SIZES ============================ */
  (function () {
    const host = document.getElementById('sizes-demo');
    if (!host) return;
    [['xs', 'XS · Body XS'], ['s', 'S · Body S'], ['m', 'M · Body M']].forEach(([sz, nm]) => {
      const cell = document.createElement('div');
      cell.appendChild(caption(nm));
      cell.appendChild(makeNote(TEXT.long, sz, true));
      host.appendChild(cell);
    });
  })();

  /* ============================ BEHAVIOR: перенос ============================ */
  (function () {
    const host = document.getElementById('beh-wrap');
    if (!host) return;
    const box = document.createElement('div');
    box.style.cssText = 'width:240px;';
    box.appendChild(makeNote(TEXT.long, 's', true));
    host.appendChild(box);
  })();

  /* ============================ GUIDELINES ============================ */
  (function () {
    const BAD = icon('close') || '×';
    const GOOD = icon('check') || '✓';
    ['ic-bad1', 'ic-bad2'].forEach((id) => { const n = document.getElementById(id); if (n) n.innerHTML = BAD; });
    ['ic-good1', 'ic-good2'].forEach((id) => { const n = document.getElementById(id); if (n) n.innerHTML = GOOD; });

    const put = (id, node) => { const n = document.getElementById(id); if (n) n.appendChild(node); };
    put('guide-good1', makeNote(TEXT.short, 's', true));
    const bad1 = makeNote('Не удалось сохранить изменения.', 's', false, 'alert-circle');
    put('guide-bad1', bad1);
    put('guide-good2', makeNote('Отчёт увидят только участники сделки.', 's', false, 'info-circle'));
    const bad2 = makeNote('Отчёт увидят только участники сделки.', 's', false, 'info-circle');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--outline btn--xs';
    btn.innerHTML = '<span class="btn__label">Изменить</span>';
    bad2.querySelector('.note__text').appendChild(document.createTextNode(' '));
    bad2.querySelector('.note__text').appendChild(btn);
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
      n.textContent = '#' + hx(c[0]) + hx(c[1]) + hx(c[2]);
    });
    probe.remove();
  })();

  /* ============================ DEV: redline measured from live component ============================ */
  (function () {
    const host = document.createElement('div');
    host.style.cssText = 'position:absolute; left:-9999px; top:0; width:600px;';
    document.body.appendChild(host);
    const m = {};
    ['xs', 's', 'm'].forEach((sz) => {
      const n = makeNote(TEXT.short, sz, true);
      host.appendChild(n);
      const cs = getComputedStyle(n);
      const ic = getComputedStyle(n.querySelector('.note__icon > [data-icon]'));
      const box = getComputedStyle(n.querySelector('.note__icon'));
      m[sz] = {
        font: cs.fontSize + ' / ' + cs.lineHeight,
        icon: ic.width + ' × ' + ic.height,
        box: box.height,
        gap: cs.columnGap,
      };
    });
    host.remove();
    const set = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = v; };
    ['xs', 's', 'm'].forEach((sz) => {
      set('dv-font-' + sz, m[sz].font);
      set('dv-icon-' + sz, m[sz].icon);
      set('dv-box-' + sz, m[sz].box);
      set('dv-gap-' + sz, m[sz].gap);
    });
  })();
})();

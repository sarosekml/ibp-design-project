/* =========================================================================
   StepForm — documentation page logic
   ========================================================================= */
(function () {
  const L = window.DS_ICONS || {};
  const icon = (n) => L[n] || '';
  const paint = (el) => { if (window.dsIcons) window.dsIcons.apply(el); if (window.DSInput) window.DSInput.syncAll(el); return el; };
  let uid = 0;

  const OBJECTS = [['Отрасль', 'Минеральные удобрения, СЗФО'], ['Компания', 'ПАО «Волга-Агро»'], ['Группа', 'ГК «Северный агрохолдинг»']];
  const FOCUS = ['Долговая нагрузка и ковенанты', 'Оценка по мультипликаторам', 'Структура владения', 'Рефинансирование'];
  const FORMAT = ['Краткий', 'Детальный'];

  /* ---------- parts ---------- */
  function marker(n) {
    return '<span class="stepmark stepmark--m" aria-hidden="true"><span class="stepmark__num">' + n + '</span>' +
      '<i class="stepmark__icon" data-icon="check"></i><i class="stepmark__icon stepmark__icon--error" data-icon="alert-circle"></i></span>';
  }
  function field(titleId, placeholder) {
    return '<div class="inp inp--m inp--fullwidth"><div class="inp__field">' +
      '<span class="inp__lead" aria-hidden="true"><i data-icon="client-search"></i></span>' +
      '<input class="inp__control" type="text" role="searchbox" autocomplete="off" placeholder="' + placeholder + '" aria-labelledby="' + titleId + '">' +
      '</div></div>';
  }
  function radioChips(titleId, items) {
    return '<div class="chiplist" role="radiogroup" aria-labelledby="' + titleId + '">' + items.map(([tag, name]) =>
      '<button type="button" class="chip chip--edit chip--outline chip--m chip--compact chip--rounded" role="radio" aria-checked="false">' +
      (tag ? '<span class="chip__tag">' + tag + '</span>' : '') +
      '<span class="chip__label">' + name + '</span><span class="chip__check" aria-hidden="true"><i data-icon="check"></i></span></button>').join('') + '</div>';
  }
  function toggleChips(titleId, items) {
    return '<div class="chiplist" role="group" aria-labelledby="' + titleId + '">' + items.map((name) =>
      '<button type="button" class="chip chip--edit chip--dashed chip--m chip--compact chip--rounded" aria-pressed="false">' +
      '<span class="chip__icon chip__icon--toggle" aria-hidden="true"><i data-icon="add"></i><i data-icon="check"></i></span>' +
      '<span class="chip__label">' + name + '</span></button>').join('') + '</div>';
  }
  function inset(hidden) {
    const id = 'sf-inset-' + (++uid);
    const row = (ini, name, meta) => '<div class="entity entity--s"><div class="entity__lead"><span class="av av--circular av--m" aria-hidden="true"><span class="av__text">' + ini + '</span></span></div>' +
      '<div class="entity__main"><div class="entity__titles"><div class="entity__labelrow"><span class="entity__label entity__label--truncate">' + name + '</span></div></div>' +
      '<div class="entity__subs"><span class="entity__subs-list">' + meta + '</span></div></div>' +
      '<div class="entity__actions"><button type="button" class="btn btn--outline btn--xs"><i data-icon="message-text"></i><span class="btn__label">Показать в чате</span></button></div></div>';
    return '<section class="tile tile--inset stepform__wide" aria-labelledby="' + id + '"' + (hidden ? ' hidden' : '') + '>' +
      '<header class="tile__header"><div class="tile__header-main"><div class="tile__title-row">' +
      '<span class="tile__title-icon tile__title-icon--accent" aria-hidden="true"><i data-icon="history"></i></span>' +
      '<h4 class="tile__title" id="' + id + '">История запросов по объекту анализа — 2</h4></div>' +
      '<p class="tile__subtitle">Документ откроется в чате, конструктор останется на месте.</p></div></header>' +
      '<div class="tile__body"><div class="entity-list">' +
      row('ОН', 'Минеральные удобрения, СЗФО — отраслевой обзор', 'Орлова Н. В. · 15.09.2026 · Детальный') + '<hr class="dvd dvd--h">' +
      row('ГП', 'Минеральные удобрения, СЗФО — бенчмарки маржинальности', 'Гусев П. И. · 28.08.2026 · Краткий') +
      '</div></div></section>';
  }
  function foot() {
    return '<p class="note note--s note--accent stepform__foot"><span class="note__icon" aria-hidden="true"><i data-icon="clock-timer"></i></span>' +
      '<span class="note__text">Подготовка отчета обычно занимает до 30 минут. Работа продолжится, даже если закрыть инструмент.</span></p>';
  }
  function step(n, title, state, control, wide) {
    const k = ++uid;
    return '<section class="stepform__step" data-state="' + state + '" aria-labelledby="sf-l' + k + '">' +
      '<div class="stepform__label" id="sf-l' + k + '">' + marker(n) +
      '<span class="stepform__title" id="sf-t' + k + '">' + title + '</span>' +
      '<span class="stepform__status stepform__status--done">выполнено</span><span class="stepform__status stepform__status--error">ошибка</span></div>' +
      '<div class="stepform__control">' + control('sf-t' + k) + '</div>' + (wide || '') + '</section>';
  }

  /* ---------- form factory ----------
     o.steps: 2 | 3; o.control: 'both' | 'field' | 'chips'; o.wide, o.foot, o.appear: bool;
     o.states: массив data-state по шагам */
  function makeForm(o) {
    const st = o.states || [];
    const s1 = o.control === 'chips' ? (t) => radioChips(t, OBJECTS)
      : o.control === 'field' ? (t) => field(t, 'Компания, группа, бенефициар или отрасль')
      : (t) => field(t, 'Компания, группа, бенефициар или отрасль') + radioChips(t, OBJECTS);
    const s2 = o.control === 'field' ? (t) => field(t, 'Например, долговая нагрузка') : (t) => toggleChips(t, FOCUS);
    const s3 = o.control === 'field' ? (t) => field(t, 'Краткий или детальный') : (t) => radioChips(t, FORMAT.map((f) => ['', f]));
    let html = step(1, 'Объект анализа', st[0] || 'pending', s1, o.wide ? inset(!o.wideShown) : '') +
      step(2, 'Дополнительный фокус', st[1] || 'pending', s2) +
      (o.steps === 3 ? step(3, 'Формат отчёта', st[2] || 'pending', s3) : '') +
      (o.foot ? foot() : '');
    const form = document.createElement('div');
    form.className = 'stepform' + (o.appear ? ' stepform--appear' : '');
    form.setAttribute('role', 'group');
    form.setAttribute('aria-label', 'Конструктор запроса');
    form.innerHTML = html;
    if (o.live) live(form, o);
    return paint(form);
  }

  /* ---------- живое поведение: выбор делает шаг готовым ----------
     Экран меняет только data-state шага — маркер красится сам. */
  function live(form, o) {
    function update(stepEl) {
      const picked = stepEl.querySelector('.chip[aria-checked="true"], .chip[aria-pressed="true"]');
      const typed = [...stepEl.querySelectorAll('.stepform__control .inp__control')].some((i) => i.value.trim());
      stepEl.setAttribute('data-state', picked || typed ? 'done' : 'pending');
      if (stepEl === form.querySelector('.stepform__step')) {
        const w = stepEl.querySelector('.stepform__wide');
        if (w) w.hidden = !(picked || typed);
      }
    }
    form.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip || !form.contains(chip)) return;
      if (chip.hasAttribute('aria-pressed')) {
        chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
      } else if (chip.getAttribute('role') === 'radio') {
        const on = chip.getAttribute('aria-checked') !== 'true';
        chip.parentElement.querySelectorAll('[role="radio"]').forEach((c) => c.setAttribute('aria-checked', 'false'));
        chip.setAttribute('aria-checked', String(on));
      }
      update(chip.closest('.stepform__step'));
    });
    form.addEventListener('input', (e) => {
      const s = e.target.closest('.stepform__step');
      if (s) update(s);
    });
  }

  function markup(o) {
    return '&lt;div class="stepform' + (o.appear ? ' stepform--appear' : '') + '" role="group" aria-label="…"&gt;<br>' +
      '&nbsp;&nbsp;&lt;section class="stepform__step" data-state="pending" aria-labelledby="…"&gt;<br>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;&lt;div class="stepform__label" id="…"&gt;StepMarker + &lt;span class="stepform__title"&gt;Объект анализа&lt;/span&gt; + статус&lt;/div&gt;<br>' +
      '&nbsp;&nbsp;&nbsp;&nbsp;&lt;div class="stepform__control"&gt;' + (o.control === 'chips' ? 'чипы' : o.control === 'field' ? 'InputText M' : 'InputText M + чипы') + '&lt;/div&gt;' +
      (o.wide ? '<br>&nbsp;&nbsp;&nbsp;&nbsp;&lt;section class="tile tile--inset stepform__wide"&gt;…&lt;/section&gt;' : '') + '<br>' +
      '&nbsp;&nbsp;&lt;/section&gt; × ' + o.steps + (o.foot ? '<br>&nbsp;&nbsp;&lt;p class="note note--s note--accent stepform__foot"&gt;…&lt;/p&gt;' : '') + '<br>&lt;/div&gt;';
  }

  /* ============================ PLAYGROUND ============================ */
  (function () {
    const state = { steps: '2', control: 'both', states: 'live', width: 'wide', wide: 'y', foot: 'y', appear: 'y' };
    const PRESET = {
      live: null,
      pending: ['pending', 'pending', 'pending'],
      progress: ['done', 'current', 'pending'],
      error: ['done', 'error', 'pending'],
      disabled: ['done', 'current', 'disabled'],
    };
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

    controls.appendChild(select('Шаги', [['2', 'Два шага'], ['3', 'Три шага']], () => state.steps, (v) => state.steps = v));
    controls.appendChild(select('Контролы', [['both', 'Поле и чипы'], ['field', 'Только поля'], ['chips', 'Только чипы']], () => state.control, (v) => state.control = v));
    controls.appendChild(select('Состояние шагов', [['live', 'По выбору — живое демо'], ['pending', 'Все ожидают'], ['progress', 'Готов · текущий · ожидает'], ['error', 'Готов · ошибка · ожидает'], ['disabled', 'Готов · текущий · недоступен']], () => state.states, (v) => state.states = v));
    controls.appendChild(select('Ширина', [['wide', 'Широкая форма · 880px'], ['narrow', 'Узкая форма · 600px']], () => state.width, (v) => state.width = v));
    controls.appendChild(select('Блок на всю ширину', [['y', 'Есть'], ['n', 'Нет']], () => state.wide, (v) => state.wide = v));
    controls.appendChild(select('Подвал', [['y', 'Есть'], ['n', 'Нет']], () => state.foot, (v) => state.foot = v));
    controls.appendChild(select('Появление', [['y', 'Есть'], ['n', 'Нет']], () => state.appear, (v) => state.appear = v));

    function render() {
      stage.innerHTML = '';
      const box = document.createElement('div');
      box.style.cssText = 'width:100%; max-width:' + (state.width === 'narrow' ? '600px' : '880px') + '; padding:var(--space-16); border:1px solid var(--border-light); border-radius:var(--radius-m); background:var(--bg-tile);';
      const live = state.states === 'live';
      const o = {
        steps: +state.steps, control: state.control, wide: state.wide === 'y', foot: state.foot === 'y', appear: state.appear === 'y',
        states: PRESET[state.states] || [], live, wideShown: !live,
      };
      box.appendChild(makeForm(o));
      stage.appendChild(box);
      codeEl.innerHTML = '<code>' + markup(o) + '</code>';
    }
    render();
  })();

  /* ============================ USAGE ============================ */
  (function () {
    const host = document.getElementById('use-live');
    if (host) host.appendChild(makeForm({ steps: 2, control: 'both', wide: true, foot: true, live: true, appear: false }));
  })();

  /* ============================ VARIANTS ============================ */
  (function () {
    const put = (id, o) => { const n = document.getElementById(id); if (n) n.appendChild(makeForm(o)); };
    put('var-field', { steps: 2, control: 'field', foot: false, states: ['done', 'pending'] });
    put('var-chips', { steps: 2, control: 'chips', foot: false, states: ['done', 'pending'] });
    put('var-wide', { steps: 2, control: 'both', wide: true, wideShown: true, foot: false, states: ['done', 'pending'] });
    put('var-foot', { steps: 2, control: 'chips', foot: true, states: ['pending', 'pending'] });
  })();

  /* ============================ BEHAVIOR ============================ */
  (function () {
    const narrow = document.getElementById('beh-narrow');
    if (narrow) {
      const box = document.createElement('div');
      box.style.cssText = 'max-width:520px;';
      box.appendChild(makeForm({ steps: 2, control: 'both', foot: true, states: ['done', 'pending'] }));
      narrow.appendChild(box);
    }
    const appearHost = document.getElementById('beh-appear');
    const replay = document.getElementById('beh-replay');
    if (appearHost && replay) {
      const panel = document.createElement('div');
      panel.appendChild(makeForm({ steps: 2, control: 'chips', foot: true, appear: true, states: ['done', 'pending'] }));
      appearHost.appendChild(panel);
      /* закрыть и открыть панель: inert снимается — форма появляется лесенкой */
      replay.addEventListener('click', () => {
        panel.setAttribute('inert', '');
        setTimeout(() => panel.removeAttribute('inert'), 450);
      });
    }
  })();

  /* ============================ STATES ============================ */
  (function () {
    const host = document.getElementById('states-demo');
    if (!host) return;
    const form = document.createElement('div');
    form.className = 'stepform';
    const rows = [['pending', 'Ожидает'], ['current', 'Текущий'], ['done', 'Готов'], ['error', 'Ошибка'], ['disabled', 'Недоступен']];
    form.innerHTML = rows.map(([st, t], i) => step(i + 1, t, st, (id) => '<p class="demo-rowlabel" style="margin:0; line-height:40px;" id="' + id + '-h">data-state="' + st + '"</p>')).join('');
    host.appendChild(paint(form));
  })();

  /* ============================ GUIDELINES ============================ */
  (function () {
    const BAD = icon('close') || '×';
    const GOOD = icon('check') || '✓';
    ['ic-bad1', 'ic-bad2'].forEach((id) => { const n = document.getElementById(id); if (n) n.innerHTML = BAD; });
    ['ic-good1', 'ic-good2'].forEach((id) => { const n = document.getElementById(id); if (n) n.innerHTML = GOOD; });
    const put = (id, node) => { const n = document.getElementById(id); if (n) { n.style.justifyContent = 'stretch'; node.style.flex = '1'; n.appendChild(node); } };
    put('guide-good1', makeForm({ steps: 2, control: 'chips', foot: false, states: ['done', 'pending'] }));
    /* антипример: свой hr между шагами — пунктир компонента + линия, две черты подряд */
    const bad1 = makeForm({ steps: 2, control: 'chips', foot: false, states: ['done', 'pending'] });
    const hr = document.createElement('hr');
    hr.className = 'dvd dvd--h';
    hr.style.gridColumn = '1 / -1';
    bad1.insertBefore(hr, bad1.children[1]);
    put('guide-bad1', bad1);
    put('guide-good2', makeForm({ steps: 2, control: 'field', foot: false, states: ['pending', 'pending'] }));
    /* антипример: длинная подпись шага растягивает колонку и переносится */
    const bad2 = makeForm({ steps: 2, control: 'field', foot: false, states: ['pending', 'pending'] });
    bad2.querySelector('.stepform__title').textContent = 'Объект, по которому будет подготовлен аналитический материал';
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
    host.style.cssText = 'position:absolute; left:-9999px; top:0; width:880px;';
    document.body.appendChild(host);
    const form = makeForm({ steps: 2, control: 'both', foot: true, states: ['done', 'pending'] });
    host.appendChild(form);
    const cs = getComputedStyle(form);
    const steps = form.querySelectorAll('.stepform__step');
    const s2 = getComputedStyle(steps[1]);
    const lbl = getComputedStyle(form.querySelector('.stepform__label'));
    const ctl = getComputedStyle(form.querySelector('.stepform__control'));
    const ft = getComputedStyle(form.querySelector('.stepform__foot'));
    const cols = cs.gridTemplateColumns.split(' ');
    const set = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = v; };
    set('dv-col-x', cols[0] + ' (по самой длинной подписи, ≤ 33 %)');
    set('dv-gapc-x', cs.columnGap);
    set('dv-gaps-x', cs.rowGap);
    set('dv-gapr-x', s2.rowGap);
    set('dv-pad-x', s2.paddingTop + ' · ' + s2.borderTopWidth + ' ' + s2.borderTopStyle);
    set('dv-label-x', lbl.minHeight + ' · ' + lbl.fontSize + ' / ' + lbl.lineHeight + ' · ' + lbl.fontWeight);
    set('dv-lgap-x', lbl.columnGap);
    set('dv-ctl-x', ctl.rowGap);
    set('dv-foot-x', ft.paddingTop + ' · ' + ft.borderTopWidth + ' ' + ft.borderTopStyle);
    host.remove();
  })();
})();

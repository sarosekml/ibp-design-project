/* =========================================================================
   registry-table.js — общий рендер реестров концепта ibp-redesign-v2.

   Пары во фронтенде нет: это общий код таблиц-виджетов (MS0014a, правило
   имён 8). Его зовут виджеты с именами фронтенда — пять реестров сделок
   (V2BindingOpportunitiesTable, V2PossibleOpportunitiesTable,
   V2OpportunitySalesProjectsTable, V2SalesCampaignsTable,
   V2OpportunitiesPipelineTable), V2LeadsTable, V2MyClientsTable, V2TasksTable,
   V2MeetingsProtocolsList, V2SimpleSettingsTable. Копий кода по виджетам нет.

   Что делает (всё на компонентах ДС, свой CSS не нужен):
   - шапка и строки таблицы (Table, TableCell) по конфигу колонок;
   - вкладка — подфильтр одной таблицы (Р4): строки отбирает функция rows(tab);
   - фильтр TableFilter + модалка .tfm (разделы — поля конфига), чип
     «Применено: N», крестик чипа сбрасывает всё; фильтр отбирает строки
     подстрокой по значению поля;
   - пагинация — DSPagination.row({ pager }) из кода: автоподключение по
     разметке data-pagination в ДС 1.x не передаёт data-total в пейджер
     (buildFooter → buildRow берёт o.pager), поэтому только из кода;
   - пустое состояние тела — .dtable__empty;
   - «Краткий отчет» — Toast «Файл выгружен» (MS0014 §3).

   API: window.IBPR_TABLE
     mount(host, opts) → handle { setTab, tab, refresh, rows, select }
     get(host) → handle | null
     chip(label, { tone, icon }) → разметка чипа ДС (слот иконки — .chip__icon)
     headCell(col, first) → единая разметка шапки TableCell для всех реестров
     tabs(tabsEl, handle, tabsCfg, onChange) — вкладки ↔ handle ↔ ?tab=<страница фронтенда>
   opts:
     id         — уникальный ключ таблицы (id модалки фильтра)
     columns    — [{ key, label, type, align?, width?, sort? }] или fn(tab)
     rows       — fn(tab) → массив записей
     value      — fn(row, col) → строка значения (по умолчанию row[col.key])
     cell       — fn(row, col, value) → html ячейки или null (тип по умолчанию)
     rowClass   — fn(row) → доп. классы строки
     rowAttrs   — fn(row) → доп. атрибуты строки (строкой)
     filter     — [{ label, key }] поля модалки фильтра
     preset     — { key: значение } заполненные поля по умолчанию
     pageSize   — 50 по умолчанию
     tab        — начальная вкладка
     rowTail    — fn(row) → html после замыкающего разделителя строки
                  (скрытые действия .tc__hidden — по наведению на строку)
     onRowClick — fn(row, rowEl) — выбор строки (предпросмотр)
     emptyText  — подпись пустого состояния; [data-rt-empty-only] внутри
                  пустого блока видны только без применённого фильтра
     compact    — { title, actions? } компактный режим таблицы-тайла (вкладка
                  «Сделки» клиента): заголовок .dtable__title вместо фильтра,
                  actions — разметка кнопок справа вместо «Краткого отчета»,
                  таблица не тянется на высоту экрана, по 10 строк
   ========================================================================= */
(function () {
  'use strict';

  var handles = [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Чип ДС: тон — модификатор chip--<tone>, иконка — в слоте .chip__icon;
     rounded — статусный чип (статусные чипы ДС всегда скруглённые). */
  function chip(label, o) {
    o = o || {};
    return '<span class="chip chip--s chip--fit' + (o.rounded ? ' chip--rounded' : '') + (o.tone ? ' chip--' + o.tone : '') + '">'
      + (o.icon ? '<span class="chip__icon" aria-hidden="true"><i data-icon="' + o.icon + '"></i></span>' : '')
      + '<span class="chip__label">' + esc(label) + '</span></span>';
  }

  /* Ширины колонок по типу: fr — резиновые текстовые, px — компактные. */
  var WIDTH = {
    'id-link': '120px', text: 'minmax(140px,1.4fr)', wide: 'minmax(200px,2fr)',
    chip: '120px', chips: 'minmax(170px,1fr)', bool: '96px', 'icon-actions': '96px', muted: '130px'
  };
  function colWidth(col) {
    if (col.width) return col.width;
    if (col.align === 'right') return '150px';
    return WIDTH[col.type] || WIDTH.text;
  }
  function gridFor(cols) {
    return ['8px'].concat(cols.map(colWidth)).concat(['minmax(8px,1fr)']).join(' ');
  }

  function headCell(col, first) {
    var cls = 'th' + (first ? ' th--pinned' : '') + (col.align === 'right' ? ' th--right' : '') + (col.type === 'icon-actions' ? ' th--center' : '');
    var sortable = col.type !== 'icon-actions' && col.sort !== false;
    return '<div class="' + cls + '" data-col="' + esc(col.key) + '"' + (col.sortType ? ' data-sort-type="' + esc(col.sortType) + '"' : '') + (sortable ? ' aria-sort="none"' : '') + '>'
      + '<span class="th__label">' + esc(col.label) + '</span>'
      + (sortable ? '<span class="th__tools"><button class="ibtn ibtn--neutral ibtn--s th__sort" data-sort="' + esc(col.key) + '" aria-label="Сортировать"><i data-icon="arrow-up-down"></i></button></span>' : '')
      + '<span class="th__resize" role="separator" aria-orientation="vertical" tabindex="0" aria-label="Изменить ширину колонки"></span></div>';
  }

  function defaultCell(row, col, v, first) {
    var cls = 'tc' + (first ? ' tc--pinned' : '') + (col.align === 'right' ? ' tc--numbers' : '') + (col.type === 'icon-actions' ? ' tc--center' : '');
    var empty = v == null || v === '' || v === '–';
    var body;
    if (col.type === 'chip') {
      body = empty ? '<span class="tc__text tc__empty">–</span>' : chip(v);
    } else if (col.type === 'chips') {
      var list = Array.isArray(v) ? v : [];
      body = list.length ? list.map(function (l) { return chip(l); }).join('') : '<span class="tc__text tc__empty">–</span>';
    } else if (col.type === 'bool') {
      body = '<span class="tc__text' + (v ? '' : ' tc__empty') + '">' + (v ? 'Да' : 'Нет') + '</span>';
    } else {
      var muted = col.type === 'muted' || empty;
      body = '<span class="tc__text tc__text--truncate' + (muted ? ' tc__empty' : '') + '">' + (empty ? '–' : esc(v)) + '</span>';
    }
    return '<div class="' + cls + '" data-col="' + esc(col.key) + '"><span class="tc__row">' + body + '</span></div>';
  }

  /* ── Модалка фильтра .tfm ──────────────────────────────────────────── */
  function buildFilter(st) {
    var sid = 'rt-filter-' + st.id;
    var old = document.getElementById(sid);
    if (old) old.remove();
    var fields = st.opts.filter || [];
    var nav = fields.map(function (f, i) {
      return '<button type="button" class="tab tab--m tab--vert' + (i === 0 ? ' tab--selected' : '') + '" aria-current="' + (i === 0 ? 'true' : 'false') + '" data-target="' + sid + '-s' + i + '"><span class="tab__label">' + esc(f.label) + '</span></button>';
    }).join('');
    var panel = fields.map(function (f, i) {
      var inId = sid + '-f' + i;
      return '<section class="tfm__sec" id="' + sid + '-s' + i + '"><h4 class="tfm__sec-title">' + esc(f.label) + '</h4>'
        + '<div class="tfm__grid"><div class="inp inp--m tfm__span-2"><label class="ds-label" for="' + inId + '"><span class="ds-label__text">' + esc(f.label) + ' содержит</span></label>'
        + '<div class="inp__field"><input class="inp__control" id="' + inId + '" data-rt-field="' + i + '" placeholder="Любое значение"></div></div></div></section>';
    }).join('');
    var scrim = document.createElement('div');
    scrim.className = 'modal-scrim';
    scrim.id = sid;
    scrim.hidden = true;
    scrim.innerHTML = '<div class="modal modal--w6 tfm" role="dialog" aria-modal="true" aria-labelledby="' + sid + '-title">'
      + '<header class="modal__head"><h2 class="modal__title" id="' + sid + '-title">Фильтр</h2>'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--l" data-modal-close aria-label="Закрыть"><i data-icon="close"></i></button></header>'
      + '<div class="modal__body modal__body--flush"><div class="tfm__body">'
      + '<nav class="tabs tabs--vert tfm__nav" aria-label="Разделы фильтра">' + nav + '</nav>'
      + '<div class="tfm__panel">' + panel + '</div></div></div>'
      + '<footer class="modal__foot"><div class="modal__foot-right">'
      + '<button type="button" class="btn btn--transparent btn--m" data-rt-clear><span class="btn__label">Очистить фильтр</span></button>'
      + '<button type="button" class="btn btn--accent btn--m" data-rt-apply><span class="btn__label">Применить</span></button>'
      + '</div></footer></div>';
    document.body.appendChild(scrim);
    scrim.querySelectorAll('.tfm__nav .tab').forEach(function (t) {
      t.addEventListener('click', function () {
        scrim.querySelectorAll('.tfm__nav .tab').forEach(function (x) { x.classList.remove('tab--selected'); x.setAttribute('aria-current', 'false'); });
        t.classList.add('tab--selected'); t.setAttribute('aria-current', 'true');
        var sec = document.getElementById(t.getAttribute('data-target'));
        var body = scrim.querySelector('.modal__body');
        if (sec && body) body.scrollTo({ top: sec.offsetTop - 16, behavior: 'smooth' });
      });
    });
    scrim.querySelector('[data-rt-apply]').addEventListener('click', function () {
      st.values = {};
      scrim.querySelectorAll('[data-rt-field]').forEach(function (inp) {
        var v = inp.value.trim();
        if (v) st.values[inp.getAttribute('data-rt-field')] = v;
      });
      if (window.DSModal) window.DSModal.closeTop();
      st.page = 1;
      render(st);
    });
    scrim.querySelector('[data-rt-clear]').addEventListener('click', function () {
      scrim.querySelectorAll('[data-rt-field]').forEach(function (inp) { inp.value = ''; });
      if (window.DSInput && window.DSInput.syncAll) window.DSInput.syncAll(scrim);
    });
    if (window.dsIcons) window.dsIcons.apply(scrim);
    st.scrim = scrim;
  }

  function syncFilterInputs(st) {
    if (!st.scrim) return;
    st.scrim.querySelectorAll('[data-rt-field]').forEach(function (inp) {
      inp.value = st.values[inp.getAttribute('data-rt-field')] || '';
    });
    if (window.DSInput && window.DSInput.syncAll) window.DSInput.syncAll(st.scrim);
  }

  function renderBar(st) {
    var bar = st.host.querySelector('[data-rt-filter]');
    if (!bar) return;
    var n = Object.keys(st.values).length;
    var h = '<button class="btn btn--outline btn--s tfilter__open" aria-haspopup="dialog" aria-expanded="false" data-modal="rt-filter-' + st.id + '"><i data-icon="filter"></i><span class="btn__label">Фильтр</span></button>';
    if (n) h += '<span class="chip chip--edit chip--m tfilter__applied" tabindex="0"><span class="chip__label">Применено: ' + n + '</span><span class="chip__remove" role="button" aria-label="Сбросить все фильтры"><i data-icon="close"></i></span></span>';
    bar.innerHTML = h;
    var rm = bar.querySelector('.chip__remove');
    if (rm) rm.addEventListener('click', function (e) {
      e.stopPropagation();
      st.values = {};
      st.page = 1;
      render(st);
    });
    bar.querySelector('.tfilter__open').addEventListener('click', function () { syncFilterInputs(st); });
    if (window.DSModal) window.DSModal.bindAll(bar);
    if (window.dsIcons) window.dsIcons.apply(bar);
  }

  /* ── Отбор, страница, отрисовка ─────────────────────────────────────── */
  function valueOf(st, row, col) {
    return st.opts.value ? st.opts.value(row, col) : row[col.key];
  }
  function filtered(st) {
    var rows = st.opts.rows(st.tab) || [];
    var fields = st.opts.filter || [];
    var keys = Object.keys(st.values);
    if (!keys.length) return rows;
    return rows.filter(function (row) {
      return keys.every(function (i) {
        var f = fields[i];
        var v = valueOf(st, row, f);
        var s = Array.isArray(v) ? v.join(' ') : String(v == null ? '' : v);
        return s.toLowerCase().indexOf(String(st.values[i]).toLowerCase()) >= 0;
      });
    });
  }

  function render(st) {
    var host = st.host;
    var cols = typeof st.opts.columns === 'function' ? st.opts.columns(st.tab) : st.opts.columns;
    var grid = gridFor(cols);
    var all = filtered(st);
    var size = st.pageSize === 'all' ? all.length || 1 : st.pageSize;
    var pages = Math.max(1, Math.ceil(all.length / size));
    if (st.page > pages) st.page = pages;
    var slice = all.slice((st.page - 1) * size, st.page * size);
    st.shown = slice;

    var tbl = host.querySelector('[data-rt-tbl]');
    var empty = host.querySelector('[data-rt-empty]');
    var h = '<div class="tbl__row tbl__row--head" style="grid-template-columns:' + grid + '"><div class="th th--separator"></div>'
      + cols.map(function (c, i) { return headCell(c, i === 0); }).join('')
      + '<div class="th th--separator"></div></div>';
    h += slice.map(function (row, ri) {
      var extra = st.opts.rowClass ? st.opts.rowClass(row) : '';
      var attrs = st.opts.rowAttrs ? st.opts.rowAttrs(row) : '';
      var sel = st.selected != null && String(st.selected) === String(row.id) ? ' tbl__row--selected' : '';
      return '<div class="tbl__row' + (extra ? ' ' + extra : '') + sel + '" data-rt-row="' + ri + '" style="grid-template-columns:' + grid + '"' + (attrs ? ' ' + attrs : '') + '>'
        + '<div class="tc tc--separator"></div>'
        + cols.map(function (c, i) {
          var v = valueOf(st, row, c);
          var custom = st.opts.cell ? st.opts.cell(row, c, v, i === 0) : null;
          return custom != null ? custom : defaultCell(row, c, v, i === 0);
        }).join('')
        + '<div class="tc tc--separator"></div>'
        + (st.opts.rowTail ? st.opts.rowTail(row) || '' : '') + '</div>';
    }).join('');
    tbl.innerHTML = h;
    tbl.hidden = !slice.length;
    if (empty) {
      empty.hidden = !!slice.length;
      var et = empty.querySelector('[data-rt-empty-title]');
      var filtering = Object.keys(st.values).length > 0;
      if (et) et.textContent = filtering ? 'Ничего не найдено' : (st.opts.emptyText || 'Записей нет');
      empty.querySelectorAll('[data-rt-empty-only]').forEach(function (x) { x.hidden = filtering; });
    }

    if (st.opts.onRowClick) {
      tbl.querySelectorAll('[data-rt-row]').forEach(function (rowEl) {
        rowEl.addEventListener('click', function (e) {
          if (e.target.closest('a, button')) return;
          var row = st.shown[Number(rowEl.getAttribute('data-rt-row'))];
          st.selected = row.id;
          tbl.querySelectorAll('.tbl__row--selected').forEach(function (r) { r.classList.remove('tbl__row--selected'); });
          rowEl.classList.add('tbl__row--selected');
          st.opts.onRowClick(row, rowEl);
        });
      });
    }

    renderBar(st);
    renderPager(st, all.length);
    if (window.DSTable) window.DSTable.bind(host.querySelector('.dtable__body'));
    if (window.DSModal) window.DSModal.bindAll(tbl);
    if (window.dsIcons) window.dsIcons.apply(host);
    if (window.DSTooltip && window.DSTooltip.bindAll) window.DSTooltip.bindAll(host);
    if (window.DSIllustrations && empty && !empty.hidden) window.DSIllustrations.render();
    if (st.opts.onRender) st.opts.onRender(slice, all);
  }

  function renderPager(st, total) {
    var pg = st.host.querySelector('[data-rt-footer]');
    if (!pg || !window.DSPagination) return;
    pg.innerHTML = '';
    pg.appendChild(window.DSPagination.row({ pager: {
      total: total, page: st.page, pageSize: st.pageSize,
      onChange: function (p) { st.page = p; render(st); },
      onPageSizeChange: function (v) { st.pageSize = v; st.page = 1; render(st); }
    } }));
  }

  /* Компактный режим: заголовок вместо фильтра, свои кнопки вместо отчёта. */
  function compactFrame(host, c) {
    var dt = host.querySelector('.dtable');
    if (dt) dt.classList.remove('dtable--fill');
    var left = host.querySelector('.dtable__toolbar-left');
    if (left) left.innerHTML = '<h3 class="dtable__title">' + esc(c.title || '') + '</h3>';
    var right = host.querySelector('.dtable__toolbar-right');
    if (right) right.innerHTML = c.actions || '';
  }

  function mount(host, opts) {
    if (!host) return null;
    var exist = get(host);
    if (exist) return exist;
    var st = {
      host: host, opts: opts, id: opts.id || ('t' + handles.length),
      tab: opts.tab, page: 1, pageSize: opts.pageSize || (opts.compact ? 10 : 50), values: {}, selected: null, shown: []
    };
    if (opts.compact) compactFrame(host, opts.compact);
    var fields = opts.filter || [];
    if (opts.preset) {
      fields.forEach(function (f, i) { if (opts.preset[f.key] != null) st.values[i] = opts.preset[f.key]; });
    }
    buildFilter(st);
    var rep = host.querySelector('[data-rt-report]');
    if (rep) rep.addEventListener('click', function () {
      if (window.DSToast) window.DSToast.show({ message: 'Файл выгружен' });
    });
    render(st);
    var handle = {
      host: host,
      tab: function () { return st.tab; },
      setTab: function (t) { st.tab = t; st.page = 1; st.selected = null; render(st); },
      refresh: function () { render(st); },
      rows: function () { return st.shown.slice(); },
      select: function (id) { st.selected = id; render(st); }
    };
    handles.push({ host: host, handle: handle });
    return handle;
  }

  function get(host) {
    for (var i = 0; i < handles.length; i++) if (handles[i].host === host) return handles[i].handle;
    return null;
  }

  /* Вкладки реестра: выбор ↔ handle.setTab ↔ ?tab=<имя страницы фронтенда>. */
  function tabs(tabsEl, handle, cfg, onChange) {
    if (!tabsEl || !handle) return;
    function select(id) {
      tabsEl.querySelectorAll('.tab').forEach(function (b) {
        var on = b.getAttribute('data-tab-id') === id;
        b.classList.toggle('tab--selected', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
        b.setAttribute('tabindex', on ? '0' : '-1');
      });
    }
    select(handle.tab());
    tabsEl.addEventListener('click', function (e) {
      var b = e.target.closest('.tab');
      if (!b || b.getAttribute('aria-disabled') === 'true') return;
      var id = b.getAttribute('data-tab-id');
      select(id);
      handle.setTab(id);
      var t = cfg.filter(function (x) { return x.id === id; })[0];
      var q = new URLSearchParams(location.search);
      q.set('tab', t && t.page ? t.page : id);
      history.replaceState(null, '', '?' + q.toString());
      if (onChange) onChange(id, t);
    });
    if (onChange) onChange(handle.tab(), cfg.filter(function (x) { return x.id === handle.tab(); })[0]);
  }

  /* Начальная вкладка из ?tab= (имя страницы фронтенда или id вкладки). */
  function tabFromUrl(cfg) {
    var v = new URLSearchParams(location.search).get('tab');
    var t = cfg.filter(function (x) { return x.page === v || x.id === v; })[0];
    return t ? t.id : (cfg[0] && cfg[0].id);
  }

  /* ── Реестры сделок: общий набор пяти виджетов-реестров ─────────────────
     Виджет (V2BindingOpportunitiesTable и др.) несёт data-registry="<id>"
     конфига REGISTRY_CONFIGS; здесь — значения, ячейки и действия. */
  var PRIORITY_TONE = { MAX: 'error', HIGH: 'error', MEDIUM: 'warning', LOW: 'info' };

  function oppValue(o, col) {
    var S = window.IBPR, F = window.DICT_FMT;
    switch (col.key) {
      case 'tbLabel': return S.lbl.terBank(o.terBank);
      case 'priorityLabel': return S.lbl.priority(o.priorityCode);
      case 'statusLabel': return S.lbl.oppStatus(o.statusCode);
      case 'dropoutReasonLabel': return o.dropoutReasonCode ? S.lbl.dropReason(o.dropoutReasonCode) : '';
      case 'totalVolumeLabel': return o.totalVolume != null ? F.money(o.totalVolume) : '';
      case 'keyDeal': case 'growthCompany': case 'didGrowthCompany': case 'topClient': case 'onePager':
        return !!o[col.key];
      default: return o[col.key];
    }
  }

  function opportunities(host, extra) {
    var S = window.IBPR;
    var cfg = S.registryConfig(host.getAttribute('data-registry'));
    if (!cfg) return null;
    extra = extra || {};
    /* компактный режим (вкладка клиента): без действий строк, только сделки клиента */
    var compact = !!extra.compact;
    var clientId = extra.clientId;
    var byLabel = {};
    cfg.columns.forEach(function (c) { byLabel[c.label] = c.key; });
    byLabel['Статус'] = 'statusLabel';
    byLabel['Общий объем по сделке'] = 'totalVolumeLabel';
    var handle = mount(host, Object.assign({
      id: cfg.id,
      tab: tabFromUrl(cfg.tabs),
      columns: function (tab) {
        return cfg.columns.filter(function (c) {
          if (compact && c.type === 'icon-actions') return false;
          return !(cfg.dropoutColumnsOnlyInArchive && tab !== 'archive' && (c.key === 'dropoutReasonLabel' || c.key === 'dropoutComment'));
        });
      },
      rows: function (tab) {
        return S.registry(cfg.id, tab).filter(function (o) { return !clientId || o.clientId === clientId; });
      },
      value: oppValue,
      filter: cfg.filterSections.map(function (l) { return { label: l, key: byLabel[l] || l }; }),
      preset: cfg.defaultPreset,
      rowClass: function (o) { return !o.viewed && o.source !== 'pipeline' ? 'tbl__row--accent' : ''; },
      cell: function (o, col, v, first) {
        if (col.type === 'id-link') {
          var url = window.IBPR_NAV.href('opportunity', { source: o.source, id: o.id, tab: o.tab });
          return '<div class="tc' + (first ? ' tc--pinned' : '') + '" data-col="id"><span class="tc__row"><a class="link link--accent link--m" href="' + url + '" data-opp-link="' + o.id + '">' + o.id + '</a></span></div>';
        }
        if (col.type === 'icon-actions') {
          var can = o.statusCode === 'WORK';
          var acts = '';
          if (can && cfg.rowActions.indexOf('take') >= 0) acts += '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Взять в работу" data-modal="take-opp-scrim" data-opp="' + o.id + '"><i data-icon="folder-arrow-forward"></i></button>';
          if (can && cfg.rowActions.indexOf('refuse') >= 0) acts += '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Отказаться" data-modal="refuse-opp-scrim" data-opp="' + o.id + '"><i data-icon="minus-circle"></i></button>';
          return '<div class="tc tc--center" data-col="actions"><div class="tc__controls">' + acts + '</div></div>';
        }
        if (col.key === 'priorityLabel' && v) {
          return '<div class="tc" data-col="priorityLabel"><span class="tc__row">' + chip(v, { tone: PRIORITY_TONE[o.priorityCode] }) + '</span></div>';
        }
        if (col.key === 'totalVolumeLabel') {
          return '<div class="tc tc--numbers" data-col="totalVolumeLabel"' + (o.totalVolume != null ? ' data-sort-value="' + o.totalVolume + '"' : '') + '><span class="tc__row"><span class="tc__text' + (v ? '' : ' tc__empty') + '">' + (v || '–') + '</span></span></div>';
        }
        return null;
      }
    }, extra));
    host.addEventListener('click', function (e) {
      var a = e.target.closest('[data-opp-link]');
      if (a) S.markViewed(a.getAttribute('data-opp-link'));
    });
    handle.config = cfg;
    return handle;
  }

  window.IBPR_TABLE = { mount: mount, get: get, chip: chip, headCell: headCell, esc: esc, tabs: tabs, tabFromUrl: tabFromUrl, opportunities: opportunities };
})();

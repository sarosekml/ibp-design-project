/* ============================================================
   DealFinancialMetricsTile.js — тайл «Финансовые метрики сделки» из данных.

   Фрагмент DealFinancialMetricsTile.html держит эталон всех состояний, а
   значения в нём — пример с макета. Страница сделки берёт метрики своей
   сделки (data/mock-financial-metrics.js) и отдаёт сюда.

   Разметку AllocationBar и полей строят функции этого файла — ими же рисует
   окно DealFinancialMetricsModal: бар ВБС в тайле и в окне один и тот же, и
   разметка у него одна. Анатомия бара — из спеки ДС AllocationBar (DOM,
   классы, состояния); рантайм страницы документации ДС сюда не подключается,
   он не для экранов. Связь сегмента со строкой по наведению даёт общий
   рантайм ds-allocationbar.js (входит в ds.js).

   API:
     PostTileDealFinMetrics.barCfg(kind, block, currencyCode) → cfg
       kind — 'vbs' | 'osz'; block — AllocationRsDto. Подпись, итог,
       позиции с подписями и цветами, статус расчёта, предупреждение о
       просрочке (только ОСЗ). Итог над баром — сумма значений строк
       (решение человека 25.09.2026): своего поля итога в данных нет.
     PostTileDealFinMetrics.albarHTML(cfg) → строка
       cfg.status: 'ready' | 'calc' | 'error' | 'loading'.
     PostTileDealFinMetrics.fieldHTML(f) → строка
       ReadOnlyField с иконкой-пояснением в подписи и постфиксом.
     PostTileDealFinMetrics.stateOf(metrics, failed) → 'data' | 'empty' | 'error'
     PostTileDealFinMetrics.render(tile, metrics, opts)
       metrics — DealFinancialMetricsRsDto или null; opts.failed — запрос
       не выполнен. Ставит data-state и data-pe, перерисовывает бар, поля и
       блок PE.
   ============================================================ */
(function () {
  'use strict';

  /* Цвета позиций — доменный маппинг продукта из спеки AllocationBar:
     цвет привязан к продукту, а не к месту в списке, поэтому у «Акций» он
     один и тот же в любой сделке (макет «Привязанные к легенде цветовые
     стили»). Цвета ОСЗ — с макета окна; в маппинге ДС их нет (паспорт,
     «Открытые вопросы»). */
  var COLORS = {
    vbs: {
      LOAN: '--ch-indigo',
      LOAN_LIABILITY: '--ch-pastel-green',
      INTRA_GROUP_LOAN: '--ch-blue',
      REPO: '--ch-light-blue',
      SHARES: '--ch-shiny-green',
      BONDS: '--ch-turquoise',
      CORPORATE_CONTROL: '--ch-red',
      ADD_INCOME: '--ch-orange',
      COMMISSION: '--ch-yellow',
      ACCOUNTS_RECEIVABLE: '--ch-purple'
    },
    osz: {
      PRINCIPAL: '--ch-indigo',
      INTEREST: '--ch-shiny-green',
      COMMISSIONS: '--ch-light-blue'
    }
  };

  /* Тексты пояснений у подписей — с макета «Текст тултипов». */
  var TIPS = {
    reserveAmount: 'Общая сумма по кредитным ФИ',
    reserveRate: 'Среднее значение по кредитным ФИ',
    rwa: 'Среднее значение по всем ФИ',
    impairmentRate: 'Общая сумма по всем кредитным ФИ для «Типа учета» = «FV»'
  };

  /* Свыше пяти позиций — «Показать ещё N» (спека AllocationBar). */
  var MAX_VISIBLE = 5;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function num(n, min, max) {
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: min, maximumFractionDigits: max }).format(n);
  }
  /* Суммы и проценты бара — два знака (спека AllocationBar); ставки полей —
     как на макете, без лишних нулей: «62 %», а не «62,00 %». */
  function amount(n) { return n == null ? '—' : num(n, 2, 2); }
  function rate(n) { return n == null ? '—' : num(n, 0, 2); }
  function percent(p) { return num(p, 2, 2) + '%'; }
  function signed(n) {
    if (n == null) return '—';
    return (n > 0 ? '+' : n < 0 ? '−' : '') + amount(Math.abs(n));
  }
  function compact(n) {
    var a = Math.abs(n);
    if (a >= 1e9) return num(n / 1e9, 0, 1) + ' млрд';
    if (a >= 1e6) return num(n / 1e6, 0, 1) + ' млн';
    if (a >= 1e3) return num(n / 1e3, 0, 1) + ' тыс.';
    return num(n, 0, 2);
  }
  function date(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? m[3] + '.' + m[2] + '.' + m[1] : (iso || '—');
  }

  function labels(kind) {
    var L = window.DEAL_FIN_METRICS_LABELS || {};
    return L[kind] || {};
  }

  /* ---------- AllocationBar ---------- */

  function barCfg(kind, block, currencyCode) {
    var L = labels(kind);
    var C = COLORS[kind] || {};
    var cur = currencyCode || 'RUB';
    block = block || {};
    var overdue = kind === 'osz' && block.overdueAmount > 0;
    var items = block.items || [];
    return {
      kind: kind,
      label: (kind === 'osz' ? 'ОСЗ' : 'ВБС') + ' по сделке на ' + date(block.reportDate) + ', ' + cur,
      total: items.reduce(function (sum, it) { return sum + (it.amount || 0); }, 0),
      status: block.calcStatus === 'CALCULATING' ? 'calc' : 'ready',
      warning: overdue ? 'Просроченная задолженность на сумму ' + compact(block.overdueAmount) + ' ' + cur : '',
      items: items.map(function (it) {
        return { id: kind + '-' + it.code, label: L[it.code] || it.code, value: it.amount, color: C[it.code] };
      })
    };
  }

  function headHTML(cfg, totalHTML) {
    var warn = cfg.warning
      ? '<span class="albar__warn" tabindex="0" role="img" aria-label="' + esc(cfg.warning) + '"'
        + ' data-tooltip="' + esc(cfg.warning) + '" data-tooltip-multiline="yes">'
        + '<i data-icon="alert-triangle-filled"></i></span>'
      : '';
    return '<div class="albar__head">'
      + '<div class="albar__titles"><div class="albar__label" title="' + esc(cfg.label) + '">' + esc(cfg.label) + '</div></div>'
      + warn + (totalHTML || '')
      + '</div>';
  }

  /* Состояния бара — из спеки AllocationBar, с двумя отступлениями по макету
     «Состояния лайн чарта» (паспорт тайла):
       calc  — шапка без итога и плашка «Данные рассчитываются», без
               скелетона итога и бара;
       error — шапка без итога и Alert error без кнопки «Повторить»
               (решение человека 25.09.2026). */
  function albarHTML(cfg) {
    var status = cfg.status || 'ready';
    var items = cfg.items || [];
    var body;

    if (status === 'loading') {
      var skRows = '';
      for (var i = 0; i < 3; i++) {
        skRows += '<div class="albar__row albar__row--sk"><span class="albar__dot albar__dot--sk"></span>'
          + '<span class="albar__sk albar__sk--name"></span><span class="albar__sk albar__sk--num"></span></div>';
      }
      body = headHTML(cfg, '<div class="albar__sk albar__sk--total"></div>')
        + '<div class="albar__sk albar__sk--bar"></div>'
        + '<div class="albar__list">' + skRows + '</div>';
    } else if (status === 'calc') {
      body = headHTML(cfg, '')
        + '<div class="albar__calc"><div class="albar__calc-title">Данные рассчитываются</div>'
        + '<div class="albar__calc-sub">Это может занять несколько секунд</div></div>';
    } else if (status === 'error') {
      body = headHTML(cfg, '')
        + '<div class="albar__foot"><div class="alert alert--error alert--m" role="alert" aria-live="assertive">'
        + '<span class="alert__icon" aria-hidden="true"><i data-icon="alert-circle-filled"></i></span>'
        + '<div class="alert__body"><p class="alert__text">Не удалось загрузить данные</p></div>'
        + '</div></div>';
    } else if (!items.length || !cfg.total) {
      body = headHTML(cfg, '<div class="albar__total albar__total--empty">—</div>')
        + '<div class="albar__empty">Нет данных</div>';
    } else {
      var rows = items.map(function (it) {
        return {
          id: it.id, label: it.label, value: it.value,
          pct: cfg.total > 0 ? (it.value / cfg.total) * 100 : 0,
          color: 'var(' + it.color + ')'
        };
      });
      var aria = 'Распределение: ' + rows.map(function (r) { return r.label + ' ' + percent(r.pct); }).join(', ');
      var segs = rows.map(function (r) {
        return '<div class="albar__seg" data-id="' + esc(r.id) + '" title="' + esc(r.label + ' · ' + percent(r.pct)) + '"'
          + ' style="background:' + r.color + ';flex-grow:' + Math.max(r.pct, 0) + '"></div>';
      }).join('');
      var list = rows.map(function (r, n) {
        return '<div class="albar__row" data-id="' + esc(r.id) + '"' + (n >= MAX_VISIBLE ? ' hidden' : '') + '>'
          + '<span class="albar__dot" style="background:' + r.color + '"></span>'
          + '<span class="albar__name">' + esc(r.label) + '</span>'
          + '<span class="albar__pct">' + percent(r.pct) + '</span>'
          + '<span class="albar__val">' + amount(r.value) + '</span>'
          + '</div>';
      }).join('');
      var more = rows.length > MAX_VISIBLE
        ? '<button type="button" class="btn btn--transparent btn--xs albar__more"><span class="btn__label">Показать ещё '
          + (rows.length - MAX_VISIBLE) + '</span></button>'
        : '';
      body = headHTML(cfg, '<div class="albar__total"><span>' + amount(cfg.total) + '</span></div>')
        + '<div class="albar__bar" role="img" aria-label="' + esc(aria) + '">' + segs + '</div>'
        + '<div class="albar__list">' + list + '</div>' + more;
    }
    return '<div class="albar albar--stretch" data-albar="' + esc(cfg.kind || '') + '">' + body + '</div>';
  }

  /* «Показать ещё N»: скрытые строки уже в разметке — кнопка открывает их и
     уходит. Делегировано на документ: работает и в тайле, и в окне, и после
     перерисовки. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.albar__more') : null;
    if (!btn) return;
    var root = btn.closest('.albar');
    if (!root) return;
    Array.prototype.forEach.call(root.querySelectorAll('.albar__row[hidden]'), function (r) { r.hidden = false; });
    btn.parentNode.removeChild(btn);
  });

  /* ---------- поля ---------- */

  /* ReadOnlyField: подпись с иконкой-пояснением (IconButton S neutral в
     .ds-label__icons, LabelHelper), значение и постфикс единицы. Пояснение —
     тултипом ДС по data-tooltip, в несколько строк. */
  function fieldHTML(f) {
    var tip = f.tip
      ? '<span class="ds-label__icons"><button type="button" class="ibtn ibtn--s ibtn--neutral" aria-label="Пояснение: '
        + esc(f.label) + '" data-tooltip="' + esc(f.tip) + '" data-tooltip-multiline="yes"><i data-icon="info-circle"></i></button></span>'
      : '';
    var tone = f.tone === 'positive' ? ' rof__value--positive' : f.tone === 'negative' ? ' rof__value--negative' : '';
    return '<div class="rof"' + (f.key ? ' data-fin-field="' + esc(f.key) + '"' : '') + '>'
      + '<span class="ds-label"><span class="ds-label__text">' + esc(f.label) + '</span>' + tip + '</span>'
      + '<div class="rof__row"><span class="rof__value' + tone + '">' + esc(f.value) + '</span>'
      + (f.affix ? '<span class="rof__affix">' + esc(f.affix) + '</span>' : '')
      + '</div></div>';
  }

  /* Четыре поля тайла в порядке макета: сумма резерва, ставка резерва, RWA,
     вторым рядом — ставка обесценения. */
  function fieldsHTML(r, cur) {
    r = r || {};
    return fieldHTML({ key: 'reserveAmount', label: 'Сумма резерва', tip: TIPS.reserveAmount, value: amount(r.reserveAmount), affix: cur })
      + fieldHTML({ key: 'reserveRate', label: 'Ставка резерва', tip: TIPS.reserveRate, value: rate(r.reserveRate), affix: '%' })
      + fieldHTML({ key: 'rwa', label: 'RWA', tip: TIPS.rwa, value: rate(r.rwa), affix: '%' })
      + fieldHTML({ key: 'impairmentRate', label: 'Ставка обесценения', tip: TIPS.impairmentRate, value: rate(r.impairmentRate), affix: '%' });
  }

  /* ---------- состояние и рендер ---------- */

  function stateOf(metrics, failed) {
    if (failed) return 'error';
    return metrics && metrics.vbs ? 'data' : 'empty';
  }

  function hasPe(metrics) {
    return !!(metrics && metrics.peRevaluation);
  }

  function setText(root, sel, text) {
    var el = root.querySelector(sel);
    if (el) el.textContent = text;
  }

  function render(tile, metrics, opts) {
    if (!tile) return;
    opts = opts || {};
    var state = stateOf(metrics, opts.failed);
    var cur = (metrics && metrics.currencyCode) || 'RUB';
    tile.setAttribute('data-state', state);
    tile.setAttribute('data-pe', hasPe(metrics) ? 'yes' : 'no');

    if (state === 'data') {
      var host = tile.querySelector('[data-fin-bar="vbs"]');
      if (host) host.innerHTML = albarHTML(barCfg('vbs', metrics.vbs, cur));
      var grid = tile.querySelector('.lc-deal-metrics__grid');
      if (grid) grid.innerHTML = fieldsHTML(metrics.reserves, cur);
      if (hasPe(metrics)) {
        var p = metrics.peRevaluation;
        var d = tile.querySelector('.lc-deal-metrics__pe-delta');
        setText(tile, '.lc-deal-metrics__pe-unit', cur);
        setText(tile, '.lc-deal-metrics__pe-date', 'на ' + date(p.lastValuationDate));
        setText(tile, '.lc-deal-metrics__pe-amount', amount(p.revaluationAmount));
        if (d) {
          d.textContent = signed(p.revaluationDelta);
          d.classList.toggle('lc-deal-metrics__pe-delta--negative', p.revaluationDelta < 0);
        }
      }
    }
    /* Ошибка: подпись бара остаётся — видно, чего именно не удалось получить
       (макет «Состояния лайн чарта»). Даты в ответе нет, поэтому без неё. */
    if (state === 'error') {
      var err = tile.querySelector('.lc-deal-metrics__error');
      if (err) err.innerHTML = albarHTML({ kind: 'vbs', label: 'ВБС по сделке, ' + cur, status: 'error' });
    }

    if (window.dsIcons) window.dsIcons.apply(tile);
    if (window.DSTooltip) window.DSTooltip.bindAll(tile);
  }

  window.PostTileDealFinMetrics = {
    COLORS: COLORS,
    TIPS: TIPS,
    fmt: { amount: amount, rate: rate, percent: percent, signed: signed, date: date },
    barCfg: barCfg,
    albarHTML: albarHTML,
    fieldHTML: fieldHTML,
    stateOf: stateOf,
    render: render
  };
})();

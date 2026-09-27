/* ============================================================
   DealFinancialMetricsModal.js — окно «Финансовые метрики сделки».

   Фрагмент DealFinancialMetricsModal.html держит пример с макета. Скрипт
   при каждом открытии перерисовывает окно метриками сделки — окно живёт в
   разметке постоянно, а метрики могли смениться. Режима правки у окна нет:
   оно только показывает.

   Бары ВБС и ОСЗ и поля с пояснениями рисуют функции тайла
   (PostTileDealFinMetrics.albarHTML / fieldHTML): бар в тайле и в окне один
   и тот же, разметка у него одна. Поэтому DealFinancialMetricsTile.js
   подключается раньше этого файла.

   Что делает скрипт (рантаймы ДС этого не делают):
     1. Бары: ВБС и ОСЗ из метрик; у ОСЗ — плашка «Данные рассчитываются»
        и предупреждение о просрочке.
     2. Сводки и таблицы: «Резервы на …» и «Переоценка по PE», строки по ФИ.
     3. Раздел PE — только у сделки с PE (data-pe на .modal).
     4. Оба раздела при открытии свёрнуты (DSTile.toggle) — так на макете.
        Сворачивает открытие (bind), а не render: витрина перерисовывает
        окно переключателями, и раскрытый раздел остаётся раскрытым.

   API:
     PostDealFinMetricsModal.render(scrim, metrics)
       metrics — DealFinancialMetricsRsDto (data/mock-financial-metrics.js).
     PostDealFinMetricsModal.bind(scrim, opts) → api
       opts.get() → metrics сделки в момент открытия.
       api.refresh()
     PostDealFinMetricsModal.collapse(scrim) — свернуть оба раздела.
   ============================================================ */
(function () {
  'use strict';

  var SCRIM_ID = 'deal-fin-metrics-scrim';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function T() { return window.PostTileDealFinMetrics; }

  function setField(root, key, text, tone) {
    Array.prototype.forEach.call(root.querySelectorAll('[data-fin-field="' + key + '"] .rof__value'), function (v) {
      v.textContent = text;
      if (tone !== undefined) {
        v.classList.toggle('rof__value--positive', tone === 'positive');
        v.classList.toggle('rof__value--negative', tone === 'negative');
      }
    });
  }
  function setAffix(root, key, text) {
    Array.prototype.forEach.call(root.querySelectorAll('[data-fin-field="' + key + '"] .rof__affix'), function (a) {
      a.textContent = text;
    });
  }

  /* Строки таблиц. Разметка строки — TableCell ДС; колонки задаёт класс
     строки (DealFinancialMetricsModal.css), один на шапку и данные. Имя ФИ —
     Link ДС: ведёт на страницу ФИ, пока её нет в прототипе — href="#". */
  function linkCell(title) {
    return '<div class="tc"><span class="tc__row"><a class="link link--accent link--s tc__text tc__text--truncate" href="#">'
      + esc(title) + '</a></span></div>';
  }
  function textCell(text) {
    return '<div class="tc"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(text) + '</span></span></div>';
  }
  function numCell(text, postfix, cls) {
    return '<div class="tc tc--numbers"><span class="tc__row"><span class="tc__text' + (cls ? ' ' + cls : '') + '">' + esc(text) + '</span>'
      + (postfix ? '<span class="tc__postfix">' + esc(postfix) + '</span>' : '') + '</span></div>';
  }
  var SEP = '<div class="tc tc--separator"></div>';

  function reserveRows(list, cur) {
    var f = T().fmt;
    return (list || []).map(function (r) {
      return '<div class="tbl__row lc-deal-metrics-modal__cols-reserves">' + SEP
        + linkCell(r.financialInstrumentTitle)
        + numCell(f.amount(r.reserveAmount), cur)
        + numCell(f.rate(r.reserveRate), '%')
        + numCell(f.rate(r.impairmentRate), '%')
        + numCell(f.rate(r.rwa), '%')
        + SEP + '</div>';
    }).join('');
  }

  function peRows(list, cur) {
    var f = T().fmt;
    var L = window.DEAL_FIN_METRICS_LABELS || {};
    var per = L.periodicity || {};
    var val = L.valuer || {};
    return (list || []).map(function (r) {
      var cls = 'lc-deal-metrics-modal__delta' + (r.revaluationDelta < 0 ? ' lc-deal-metrics-modal__delta--negative' : '');
      return '<div class="tbl__row lc-deal-metrics-modal__cols-pe">' + SEP
        + linkCell(r.financialInstrumentTitle)
        + textCell(f.date(r.valuationDate))
        + textCell(per[r.periodicityCode] || r.periodicityCode || '—')
        + numCell(f.amount(r.valuationAmount), cur)
        + numCell(f.signed(r.revaluationDelta), '', cls)
        + textCell(val[r.valuerCode] || r.valuerCode || '—')
        + SEP + '</div>';
    }).join('');
  }

  /* Строку шапки оставляем, строки данных — заменяем. */
  function fillTable(root, name, rowsHTML) {
    var tbl = root.querySelector('[data-fin-table="' + name + '"]');
    if (!tbl) return;
    Array.prototype.slice.call(tbl.children).forEach(function (row) {
      if (!row.classList.contains('tbl__row--head')) tbl.removeChild(row);
    });
    tbl.insertAdjacentHTML('beforeend', rowsHTML);
  }

  function render(scrim, metrics) {
    if (!scrim || !T() || !metrics) return;
    var t = T();
    var f = t.fmt;
    var cur = metrics.currencyCode || 'RUB';
    var modal = scrim.querySelector('.lc-deal-metrics-modal') || scrim;

    /* 1. Бары. ОСЗ нет в ответе — пустой бар ДС («Нет данных»), а не пропавшая
       подложка: пропавший блок читался бы как отсутствие показателя. */
    var vbsHost = scrim.querySelector('[data-fin-bar="vbs"]');
    var oszHost = scrim.querySelector('[data-fin-bar="osz"]');
    if (vbsHost) vbsHost.innerHTML = t.albarHTML(t.barCfg('vbs', metrics.vbs, cur));
    if (oszHost) {
      oszHost.innerHTML = t.albarHTML(metrics.osz
        ? t.barCfg('osz', metrics.osz, cur)
        : { kind: 'osz', label: 'ОСЗ по сделке, ' + cur, status: 'ready', items: [] });
    }

    /* 2. Резервы. */
    var r = metrics.reserves || {};
    var title = scrim.querySelector('[data-fin-text="reservesTitle"]');
    if (title) title.textContent = r.reportDate ? 'Резервы на ' + f.date(r.reportDate) : 'Резервы';
    setField(modal, 'reserveAmount', f.amount(r.reserveAmount));
    setAffix(modal, 'reserveAmount', cur);
    setField(modal, 'reserveRate', f.rate(r.reserveRate));
    setField(modal, 'impairmentRate', f.rate(r.impairmentRate));
    setField(modal, 'rwa', f.rate(r.rwa));
    setField(modal, 'calcDate', f.date(r.calcDate));
    fillTable(modal, 'reserves', reserveRows(r.instruments, cur));

    /* 3. Переоценка по PE — только у сделки с PE. */
    var pe = metrics.peRevaluation;
    modal.setAttribute('data-pe', pe ? 'yes' : 'no');
    if (pe) {
      setField(modal, 'revaluationAmount', f.amount(pe.revaluationAmount));
      setAffix(modal, 'revaluationAmount', cur);
      setField(modal, 'revaluationDelta', f.signed(pe.revaluationDelta),
        pe.revaluationDelta > 0 ? 'positive' : pe.revaluationDelta < 0 ? 'negative' : '');
      setAffix(modal, 'revaluationDelta', cur);
      setField(modal, 'lastValuationDate', f.date(pe.lastValuationDate));
      setField(modal, 'nextValuationDate', f.date(pe.nextValuationDate));
      fillTable(modal, 'pe', peRows(pe.instruments, cur));
    }

    if (window.dsIcons) window.dsIcons.apply(scrim);
    if (window.DSTooltip) window.DSTooltip.bindAll(scrim);
    if (window.DSTable) window.DSTable.bindAll(scrim);
  }

  /* Разделы «Резервы» и «Переоценка по PE» — свёрнуты. */
  function collapse(scrim) {
    if (!scrim || !window.DSTile) return;
    Array.prototype.forEach.call(scrim.querySelectorAll('.lc-deal-metrics-modal__section'), function (s) {
      window.DSTile.toggle(s, true);
    });
  }

  function bind(scrim, opts) {
    opts = opts || {};
    scrim = scrim || document.getElementById(SCRIM_ID);
    function refresh() { render(scrim, opts.get ? opts.get() : null); }

    /* Открытие: метрики берутся в момент клика по «Развернуть» — до того, как
       рантайм модалки покажет окно; разделы при каждом открытии свёрнуты. */
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-modal="' + SCRIM_ID + '"]')) {
        refresh();
        collapse(scrim);
      }
    });
    refresh();
    return { refresh: refresh };
  }

  window.PostDealFinMetricsModal = { render: render, bind: bind, collapse: collapse };
})();

/* FinancialMetricsTile — заполнение «Финансовых метрик» (части ValuesBlock).
   render(host, { opportunity }) — «Всего по сделке» и «Продукты УСИ»; у
   сделки без метрик (CIB) — прочерки на своих местах. */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function money(v) { return v == null ? '' : window.DICT_FMT.money(v) + ',00'; }

  function render(host, opts) {
    var o = opts && opts.opportunity;
    if (!host || !o) return;
    var f = o.financials || {};
    set(host, '[data-fm-total]', money(f.totalVolume));
    var cur = host.querySelector('[data-fm-currencies]');
    if (cur) {
      cur.innerHTML = (f.currencies || []).length
        ? f.currencies.map(function (c) { return '<span class="chip chip--xs chip--fit"><span class="chip__label">' + esc(c) + '</span></span>'; }).join('')
        : '<span class="rof__value">–</span>';
    }
    set(host, '[data-fm-invest]', money(f.investVolume));
    set(host, '[data-fm-vm]', f.vmMezzanine == null ? '' : String(f.vmMezzanine.toFixed(1)).replace('.', ','));
    set(host, '[data-fm-total-income]', money(f.totalIncome));
    set(host, '[data-fm-interest]', money(f.interestIncome));
    set(host, '[data-fm-commission]', money(f.commissionIncome));
    set(host, '[data-fm-additional]', money(f.additionalIncome));
  }

  window.LcFinancialMetricsTile = { render: render };
})();

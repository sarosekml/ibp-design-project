/* FinancialsChart — тайл «Выручка» с графиком ФОК.
   render(host, { fok }) — значение и рост выручки, график combo по
   кварталам (Chart ДС: DSChart.make, легенда — его же). Кнопки периода и
   метрики — по клику ничего (Р6). */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    var f = opts && opts.fok;
    if (!host || !f) return;
    set(host, '[data-fc-value]', f.revenueValue);
    set(host, '[data-fc-growth]', f.revenueGrowth);
    var plot = host.querySelector('[data-fc-plot]');
    if (!plot || !window.DSChart) return;
    plot.innerHTML = '';
    plot.appendChild(window.DSChart.make({
      type: 'combo', size: 'm',
      categories: f.periods,
      series: (f.series || []).map(function (s, i) { return { id: 's' + i, name: s.label, data: s.values, type: s.type === 'bar' ? 'bar' : 'line' }; }),
      crosshair: true
    }));
  }

  window.LcFinancialsChart = { render: render };
})();

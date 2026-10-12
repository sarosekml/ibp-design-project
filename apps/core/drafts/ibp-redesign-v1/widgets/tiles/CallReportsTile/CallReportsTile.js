/* CallReportsTile — протоколы встреч проекта продаж.
   render(host, { protocols }) — { note, count } из сделки
   (protocolsProjectSales). */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    var p = opts && opts.protocols;
    if (!host || !p) return;
    set(host, '[data-cr-note]', p.note);
    set(host, '[data-cr-count]', String(p.count == null ? 0 : p.count));
  }

  window.LcCallReportsTile = { render: render };
})();

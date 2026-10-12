/* V2IndustryInfoTile — заполнение «Отрасли».
   render(host, { client }) — подотрасль, отрасль, макроотрасль, сегмент,
   территориальный банк, ГОСБ (ClientRsDto). */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    var c = opts && opts.client;
    if (!host || !c) return;
    var v = { sub: c.sub, industry: c.industry, macro: c.macro, segment: c.segment, tb: window.IBPR.lbl.terBank(c.terBank), gosb: c.gosb };
    Object.keys(v).forEach(function (k) { set(host, '[data-ii="' + k + '"]', v[k]); });
  }

  window.LcIndustryInfoTile = { render: render };
})();

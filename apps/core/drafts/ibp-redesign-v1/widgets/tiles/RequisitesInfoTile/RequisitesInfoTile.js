/* RequisitesInfoTile — заполнение «Реквизитов».
   render(host, { client }) — ИНН, ОГРН, КПП, КПП КН, КИО, CRM ID, юридический
   адрес (ClientRsDto); пусто — прочерк. */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    var c = opts && opts.client;
    if (!host || !c) return;
    host.querySelectorAll('[data-rq]').forEach(function (el) {
      var v = c[el.getAttribute('data-rq')];
      el.textContent = v == null || v === '' ? '–' : v;
    });
  }

  window.LcRequisitesInfoTile = { render: render };
})();

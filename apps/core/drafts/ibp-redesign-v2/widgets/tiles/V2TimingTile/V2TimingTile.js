/* V2TimingTile — заполнение «Сроков».
   render(host, { opportunity }) — даты начала работы, КПКИ, подписания и
   выдачи; пустая дата — прочерк. */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    var o = opts && opts.opportunity;
    if (!host || !o) return;
    var F = window.DICT_FMT, d = o.dates || {};
    set(host, '[data-tm-start]', d.startAt ? F.date(d.startAt) : '');
    set(host, '[data-tm-kpki]', d.kpkiAt ? F.date(d.kpkiAt) : '');
    set(host, '[data-tm-sign]', d.signAt ? F.date(d.signAt) : '');
    set(host, '[data-tm-issue]', d.issueAt ? F.date(d.issueAt) : '');
  }

  window.LcTimingTile = { render: render };
})();

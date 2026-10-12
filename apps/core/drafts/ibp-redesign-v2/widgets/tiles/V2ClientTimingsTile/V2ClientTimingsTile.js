/* V2ClientTimingsTile — сроки клиента.
   render(host, { client }) — дата добавления и последней активности. */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    var c = opts && opts.client;
    if (!host || !c) return;
    set(host, '[data-ct="addedAt"]', c.addedAt ? window.DICT_FMT.date(c.addedAt) : '');
    set(host, '[data-ct="lastActivityAt"]', c.lastActivityAt ? window.DICT_FMT.date(c.lastActivityAt) : '');
  }

  window.LcClientTimingsTile = { render: render };
})();

/* SimpleSettingsTile — предпросмотр записи справочника.
   render(host, { row, onClose }) — заголовок — наименование, поля «Код» и
   «Наименование»; крестик зовёт onClose. */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    var r = opts && opts.row;
    if (!host || !r) return;
    set(host, '[data-ss-title]', r.label);
    set(host, '[data-ss-code]', r.code);
    set(host, '[data-ss-label]', r.label);
    var close = host.querySelector('[data-ss-close]');
    if (close) close.onclick = function () { if (opts.onClose) opts.onClose(); };
  }

  window.LcSimpleSettingsTile = { render: render };
})();

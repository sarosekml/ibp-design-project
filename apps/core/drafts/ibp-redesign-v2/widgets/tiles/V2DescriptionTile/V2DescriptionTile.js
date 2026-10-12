/* V2DescriptionTile — заполнение «Описания сделки».
   render(host, { opportunity }) — текст описания; пусто — кнопка «Заполнить»
   (по клику ничего, Р6); у CIB и кампаний — Alert «Данные К1…». */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    var o = opts && opts.opportunity;
    if (!host || !o) return;
    var text = (o.description || '').trim();
    show(host, '[data-dt-k1]', !!o.alertK1);
    show(host, '[data-dt-text]', !!text);
    show(host, '[data-dt-empty]', !text);
    if (text) set(host, '[data-dt-text]', text);
  }

  window.LcDescriptionTile = { render: render };
})();

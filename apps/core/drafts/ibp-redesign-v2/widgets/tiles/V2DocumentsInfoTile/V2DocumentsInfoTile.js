/* V2DocumentsInfoTile — заполнение «Документов».
   render(host, { documents }) — {name, uploadedAt}[]: первый документ —
   DocCard, остальные — ссылка «Еще N документа…». Кнопки и ссылка — по
   клику ничего (Р6). */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function plural(n) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return 'документ';
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'документа';
    return 'документов';
  }

  function render(host, opts) {
    var list = (opts && opts.documents) || [];
    if (!host) return;
    var d = list[0];
    show(host, '[data-di-card]', !!d);
    show(host, '[data-di-empty]', !d);
    if (d) {
      set(host, '[data-di-name]', d.name);
      var nm = host.querySelector('[data-di-name]');
      if (nm) nm.setAttribute('data-tooltip', d.name);
      set(host, '[data-di-meta]', 'Загружено: ' + window.DICT_FMT.date(d.uploadedAt));
    }
    var rest = Math.max(0, list.length - 1);
    show(host, '[data-di-more]', rest > 0);
    set(host, '[data-di-more]', 'Еще ' + rest + ' ' + plural(rest) + '…');
  }

  window.LcDocumentsInfoTile = { render: render };
})();

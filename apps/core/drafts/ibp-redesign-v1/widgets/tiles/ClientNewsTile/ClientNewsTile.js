/* ClientNewsTile — новости клиента.
   render(host, { news }) — {date, source, title, teaser}[]. «Смотреть все…»
   — по клику ничего (вкладка «Новости» вне объёма, Р3). */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    var list = (opts && opts.news) || [];
    var ul = host && host.querySelector('[data-cn-list]');
    if (!ul) return;
    ul.innerHTML = list.map(function (n) {
      return '<li class="lc-client-news__item"><p class="lc-client-news__meta">' + window.DICT_FMT.date(n.date) + ' · ' + esc(n.source) + '</p>'
        + '<p class="lc-client-news__title">' + esc(n.title) + '</p><p class="lc-client-news__teaser">' + esc(n.teaser) + '</p></li>';
    }).join('');
  }

  window.LcClientNewsTile = { render: render };
})();

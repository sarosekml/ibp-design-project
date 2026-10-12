/* GigaInfoTile — заполнение «ГигаСправки».
   render(host, { giga }) — { about: string[], lpr: {name, position}[],
   cooperation: string[] }. */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function para(t) { return '<p class="lc-giga-info__text">' + esc(t) + '</p>'; }

  function render(host, opts) {
    var g = opts && opts.giga;
    if (!host || !g) return;
    var put = function (k, html) { var el = host.querySelector('[data-gg="' + k + '"]'); if (el) el.innerHTML = html || para('–'); };
    put('about', (g.about || []).map(para).join(''));
    put('lpr', (g.lpr || []).map(function (l) { return para(l.name + ' — ' + l.position); }).join(''));
    put('cooperation', (g.cooperation || []).map(para).join(''));
  }

  window.LcGigaInfoTile = { render: render };
})();

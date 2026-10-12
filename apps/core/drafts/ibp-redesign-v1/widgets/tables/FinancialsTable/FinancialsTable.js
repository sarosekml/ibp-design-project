/* FinancialsTable — «Показатель × квартал».
   render(host, { fok, firstLabel, caption }) — fok.periods (колонки),
   fok.rows: {label, values, subs?} — значение и подзначение в ячейке
   (.tc__body + .tc__subtext; без subs — одна строка). firstLabel — подпись
   первой колонки, caption — примечание над таблицей справа (вкладка
   «Финансовый анализ»: «Данные АС Cashflow…»). */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    var f = opts && opts.fok;
    var tbl = host && host.querySelector('[data-ft-tbl]');
    if (!f || !tbl) return;
    var grid = '8px minmax(180px,1.6fr) ' + f.periods.map(function () { return 'minmax(120px,1fr)'; }).join(' ') + ' minmax(8px,1fr)';
    var rs = ' role="separator" aria-orientation="vertical" tabindex="0" aria-label="Изменить ширину колонки"';
    var h = '<div class="tbl__row tbl__row--head" style="grid-template-columns:' + grid + '"><div class="th th--separator"></div>'
      + '<div class="th th--pinned"><span class="th__label">' + esc(opts.firstLabel || 'Показатель') + '</span><span class="th__resize"' + rs + '></span></div>'
      + f.periods.map(function (p) { return '<div class="th th--right"><span class="th__label">' + esc(p) + '</span><span class="th__resize"' + rs + '></span></div>'; }).join('')
      + '<div class="th th--separator"></div></div>';
    h += (f.rows || []).map(function (r) {
      return '<div class="tbl__row" style="grid-template-columns:' + grid + '"><div class="tc tc--separator"></div>'
        + '<div class="tc tc--pinned"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(r.label) + '</span></span></div>'
        + r.values.map(function (v, i) {
          var sub = (r.subs || [])[i];
          return sub
            ? '<div class="tc tc--numbers"><div class="tc__body"><span class="tc__row"><span class="tc__text">' + esc(v) + '</span></span><span class="tc__subtext">' + esc(sub) + '</span></div></div>'
            : '<div class="tc tc--numbers"><span class="tc__row"><span class="tc__text">' + esc(v) + '</span></span></div>';
        }).join('')
        + '<div class="tc tc--separator"></div></div>';
    }).join('');
    tbl.innerHTML = h;
    show(host, '[data-ft-caption-bar]', !!opts.caption);
    if (opts.caption) set(host, '[data-ft-caption]', opts.caption);
    if (window.DSTable) window.DSTable.bind(tbl.closest('.dtable__body'));
  }

  window.LcFinancialsTable = { render: render };
})();

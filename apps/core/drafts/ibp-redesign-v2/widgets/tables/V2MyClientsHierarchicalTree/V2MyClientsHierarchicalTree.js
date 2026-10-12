/* V2MyClientsHierarchicalTree — клиенты, сгруппированные по холдингам.
   render(host, { onView }) — строки-группы холдингов (TableCell tree,
   раскрытие — рантайм Table ДС по [data-node]/[data-parent]) и клиенты
   холдинга; клиент → ClientInfoPage. onView — выбор вида в SegmentControl. */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  var GRID = '8px minmax(260px,2fr) minmax(220px,2fr) 130px minmax(160px,1.4fr) 110px minmax(180px,1.4fr) 130px minmax(8px,1fr)';
  var HEADS = ['Клиент', 'Полное наименование', 'ИНН', 'Отрасль', 'ТБ', 'ГКМ', 'CRM ID'];

  function cell(text, muted) { return '<div class="tc"><span class="tc__row"><span class="tc__text tc__text--truncate' + (muted ? ' tc__empty' : '') + '">' + esc(text || '–') + '</span></span></div>'; }

  function render(host, opts) {
    opts = opts || {};
    var S = window.IBPR, N = window.IBPR_NAV;
    var tbl = host && host.querySelector('[data-mt-tbl]');
    if (!tbl) return;
    var rs = ' role="separator" aria-orientation="vertical" tabindex="0" aria-label="Изменить ширину колонки"';
    var h = '<div class="tbl__row tbl__row--head" style="grid-template-columns:' + GRID + '"><div class="th th--separator"></div>'
      + HEADS.map(function (l, i) { return '<div class="th' + (i ? '' : ' th--pinned') + '"><span class="th__label">' + l + '</span><span class="th__resize"' + rs + '></span></div>'; }).join('')
      + '<div class="th th--separator"></div></div>';
    var groups = {};
    S.clients().forEach(function (c) { (groups[c.holdingId] = groups[c.holdingId] || { name: c.holdingName, list: [] }).list.push(c); });
    Object.keys(groups).forEach(function (hid) {
      var g = groups[hid], node = 'mt-' + hid;
      h += '<div class="tbl__row" style="grid-template-columns:' + GRID + '" data-node="' + node + '"><div class="tc tc--separator"></div>'
        + '<div class="tc tc--tree tc--pinned"><span class="tc__row"><button type="button" class="tc__twisty" aria-expanded="true" aria-label="Свернуть холдинг"><i data-icon="chevron-down"></i></button>'
        + '<span class="tc__text tc__text--truncate">' + esc(g.name) + ' (' + g.list.length + ')</span></span></div>'
        + HEADS.slice(1).map(function () { return cell('', true); }).join('')
        + '<div class="tc tc--separator"></div></div>';
      h += g.list.map(function (c) {
        var gcm = S.employee(c.gcmId);
        return '<div class="tbl__row" style="grid-template-columns:' + GRID + '" data-parent="' + node + '"><div class="tc tc--separator"></div>'
          + '<div class="tc tc--tree tc--pinned" style="--tc-level:1"><span class="tc__row"><span class="tc__twisty tc__twisty--leaf" aria-hidden="true"></span>'
          + '<a class="link link--accent link--m" href="' + N.href('client', { id: c.id }) + '">' + esc(c.name) + '</a></span></div>'
          + cell(c.fullName) + cell(c.inn, true) + cell(c.industry) + cell(S.lbl.terBank(c.terBank)) + cell(gcm ? gcm.fullName : '') + cell(c.id, true)
          + '<div class="tc tc--separator"></div></div>';
      }).join('');
    });
    tbl.innerHTML = h;
    if (window.DSTable) window.DSTable.bind(tbl.closest('.dtable__body'));
    if (window.dsIcons) window.dsIcons.apply(tbl);
    if (window.LcMyClientsTable) window.LcMyClientsTable.wireView(host, opts.onView);
    var rep = host.querySelector('[data-rt-report]');
    if (rep && !rep.__mtWired) {
      rep.__mtWired = true;
      rep.addEventListener('click', function () { if (window.DSToast) window.DSToast.show({ message: 'Файл выгружен' }); });
    }
  }

  window.LcMyClientsHierarchicalTree = { render: render };
})();

/* MeetingsProtocolsList — реестр встреч на общем рендере data/registry-table.js.
   mount(host, { scope, onSelect, clientId }) — scope: 'MY' | 'DESK' (вкладки),
   clientId — только встречи клиента (вкладка «Встречи» клиента). Строка
   выбирается кликом — onSelect(meeting); ID источника ведёт на его страницу. */
(function () {
  'use strict';

  var TONE = { SCHEDULED: 'info', COMPLETED: 'success', CANCELLED: 'grey' };
  var SOURCE = { POTENTIAL: 'Потенциал', CLIENT: 'Клиент', DEAL: 'Сделка ДИД' };

  function sourceHref(m) {
    var N = window.IBPR_NAV;
    if (m.sourceType === 'POTENTIAL') return N.href('potential', { id: m.sourceId });
    if (m.sourceType === 'CLIENT') return N.href('client', { id: m.clientId });
    var o = window.IBPR.opportunity(m.sourceId);
    return o ? N.href('opportunity', { source: o.source, id: o.id, tab: o.tab }) : null;
  }

  function columnsFor(clientMode) {
    if (!clientMode) return window.MEETING_COLUMNS;
    /* вкладка клиента (Pixso): ID · Дата · Статус · Начало · Окончание · Временная зона · Способ коммуникации */
    return [
      { key: 'id', label: 'ID встречи', type: 'text', width: '120px' },
      { key: 'dateLabel', label: 'Дата встречи', type: 'text', width: '130px' },
      { key: 'statusLabel', label: 'Статус', type: 'chip', width: '160px' },
      { key: 'timeStart', label: 'Начало', type: 'text', width: '100px' },
      { key: 'timeEnd', label: 'Окончание', type: 'text', width: '110px' },
      { key: 'timezone', label: 'Временная зона', type: 'text', width: '130px' },
      { key: 'commMethod', label: 'Способ коммуникации', type: 'text' }
    ];
  }

  function mount(host, opts) {
    opts = opts || {};
    var S = window.IBPR, T = window.IBPR_TABLE;
    var cols = columnsFor(!!opts.clientId).map(function (c) {
      var w = { statusLabel: '160px', deskChips: '250px', desks: '220px', sourceId: '170px' }[c.key];
      return Object.assign({}, c, w ? { width: w } : {}, c.key === 'id' ? { type: 'text' } : {});
    });
    return T.mount(host, {
      id: opts.clientId ? 'client-meetings' : 'meetings',
      tab: opts.scope || 'MY',
      columns: cols,
      rows: function (scope) {
        return S.meetings(opts.clientId ? null : scope).filter(function (m) { return !opts.clientId || m.clientId === opts.clientId; });
      },
      value: function (m, col) {
        if (col.key === 'statusLabel') return S.lbl.meetingStatus(m.statusCode);
        if (col.key === 'sourceTypeLabel') return SOURCE[m.sourceType];
        if (col.key === 'dateLabel') return window.DICT_FMT.date(m.date);
        return m[col.key];
      },
      filter: cols.filter(function (c) { return c.type !== 'chips'; }).map(function (c) { return { label: c.label, key: c.key }; }),
      onRowClick: opts.onSelect ? function (m) { opts.onSelect(m); } : null,
      cell: function (m, col, v) {
        if (col.key === 'statusLabel') {
          var tone = m.needsAttention && m.statusCode === 'SCHEDULED' ? 'error' : TONE[m.statusCode];
          return '<div class="tc" data-col="statusLabel"><span class="tc__row">' + T.chip(v, { tone: tone, rounded: true }) + '</span></div>';
        }
        if (col.key === 'sourceId') {
          var url = sourceHref(m);
          var label = m.sourceType === 'CLIENT' ? m.clientName : m.sourceId;
          return '<div class="tc" data-col="sourceId"><span class="tc__row">' + (url ? '<a class="link link--accent link--m" href="' + url + '">' + T.esc(label) + '</a>' : '<span class="tc__text">' + T.esc(label) + '</span>') + '</span></div>';
        }
        return null;
      }
    });
  }

  window.LcMeetingsProtocolsList = { mount: mount };
})();

/* MaPipelineTable — M&A сделки клиента на общем рендере data/registry-table.js
   (компактный режим тайла вкладки «Сделки»).
   mount(host, { client, title }) — client.maPipeline: {id, name, amount,
   date, status, date2}[]. */
(function () {
  'use strict';

  var COLS = [
    { key: 'id', label: 'ID', type: 'text', width: '110px' },
    { key: 'name', label: 'Наименование', type: 'wide' },
    { key: 'amount', label: 'Сумма', type: 'text', width: '150px' },
    { key: 'date', label: 'Дата', type: 'text', width: '120px' },
    { key: 'status', label: 'Статус', type: 'chip', width: '140px' },
    { key: 'date2', label: 'Дата закрытия', type: 'text', width: '130px' }
  ];

  function mount(host, opts) {
    var T = window.IBPR_TABLE, c = opts.client;
    return T.mount(host, {
      id: 'ma-' + c.id, columns: COLS, compact: { title: opts.title || 'M&A Pipeline' },
      rows: function () { return c.maPipeline || []; },
      emptyText: 'Нет данных',
      cell: function (r, col, v) {
        if (col.key === 'status' && v) return '<div class="tc" data-col="status"><span class="tc__row">' + T.chip(v, { tone: 'info', rounded: true }) + '</span></div>';
        return null;
      }
    });
  }

  window.LcMaPipelineTable = { mount: mount };
})();

/* V2DcmEcmPipelineTable — сделки DCM или ECM клиента на общем рендере
   data/registry-table.js (компактный режим тайла вкладки «Сделки»).
   mount(host, { client, kind, title }) — kind 'dcm' | 'ecm':
   client.dcmPipeline / client.ecmPipeline — {id, name, income, incomeDate}[]. */
(function () {
  'use strict';

  var COLS = {
    dcm: [{ key: 'id', label: 'ID', type: 'text', width: '110px' }, { key: 'name', label: 'Наименование сделки', type: 'wide' },
          { key: 'income', label: 'Ожидаемый доход, млн RUB', type: 'text', width: '190px' }, { key: 'incomeDate', label: 'Ожидаемая дата дохода', type: 'text', width: '170px' }],
    ecm: [{ key: 'id', label: 'ID', type: 'text', width: '110px' }, { key: 'name', label: 'Проект', type: 'wide' },
          { key: 'income', label: 'Ожидаемый доход', type: 'text', width: '170px' }, { key: 'incomeDate', label: 'Дата комиссионного дохода', type: 'text', width: '190px' }]
  };

  function mount(host, opts) {
    var c = opts.client, kind = opts.kind === 'ecm' ? 'ecm' : 'dcm';
    return window.IBPR_TABLE.mount(host, {
      id: kind + '-' + c.id, columns: COLS[kind], compact: { title: opts.title || (kind === 'ecm' ? 'Pipeline ECM' : 'Pipeline DCM') },
      rows: function () { return c[kind + 'Pipeline'] || []; },
      emptyText: 'Нет данных'
    });
  }

  window.LcDcmEcmPipelineTable = { mount: mount };
})();

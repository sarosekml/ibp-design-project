/* SimpleSettingsTable — простой справочник на общем рендере
   data/registry-table.js. mount(host, { rows, onSelect }) — rows:
   {code, label, enabled, disabledDate}[]; «Статус» — зелёная галочка у
   действующей записи, «blocked» и дата у выключенной; строка выбирается
   кликом — onSelect(row). */
(function () {
  'use strict';

  var COLS = [
    { key: 'stateLabel', label: 'Статус', type: 'text', width: '200px' },
    { key: 'code', label: 'Код', type: 'text', width: 'minmax(200px,1fr)' },
    { key: 'label', label: 'Наименование', type: 'wide' }
  ];

  function mount(host, opts) {
    var T = window.IBPR_TABLE, F = window.DICT_FMT;
    var rows = (opts.rows || []).map(function (r) { return Object.assign({ id: r.code }, r); });
    return T.mount(host, {
      id: opts.id || 'simple-settings', columns: COLS,
      rows: function () { return rows; },
      value: function (r, col) { return col.key === 'stateLabel' ? (r.enabled ? 'Действует' : 'Выключен ' + F.date(r.disabledDate)) : r[col.key]; },
      filter: [{ label: 'Код', key: 'code' }, { label: 'Наименование', key: 'label' }],
      onRowClick: opts.onSelect ? function (r) { opts.onSelect(r); } : null,
      cell: function (r, col) {
        if (col.key !== 'stateLabel') return null;
        var body = r.enabled
          ? '<span class="tc__icon lc-simple-settings__on" aria-label="Действует"><i data-icon="check-circle-filled"></i></span>'
          : '<span class="tc__icon" aria-label="Выключен"><i data-icon="blocked"></i></span><span class="tc__text tc__empty">' + F.date(r.disabledDate) + '</span>';
        return '<div class="tc" data-col="stateLabel" data-sort-value="' + (r.enabled ? '0' : '1' + r.disabledDate) + '"><span class="tc__row">' + body + '</span></div>';
      }
    });
  }

  window.LcSimpleSettingsTable = { mount: mount };
})();

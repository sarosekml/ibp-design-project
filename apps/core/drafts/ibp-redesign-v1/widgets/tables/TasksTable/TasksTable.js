/* TasksTable — реестр задач на общем рендере data/registry-table.js.
   mount(host, { scope, onSelect, clientId }) — scope: 'MY' | 'DESK' (вкладки
   «Мои задачи» — TasksPage, «Задачи моего деска» — TasksOfMyDeskPage);
   clientId — задачи клиента (вкладка «Задачи» клиента, колонки по Pixso).
   Строка выбирается кликом — onSelect(task). */
(function () {
  'use strict';

  var STATUS_TONE = { PENDING_EXECUTION: 'info', DONE: 'success', CANCELLED: 'grey', ADJUSTMENT_REQUIRED: 'warning' };
  var PRIORITY_TONE = { MAX: 'error', HIGH: 'error', MEDIUM: 'warning', LOW: 'info' };
  var CLIENT_KEYS = ['id', 'name', 'description', 'statusLabel', 'priorityLabel'];

  function mount(host, opts) {
    opts = opts || {};
    var S = window.IBPR, T = window.IBPR_TABLE, F = window.DICT_FMT;
    var cols = window.TASK_COLUMNS
      .filter(function (c) { return !opts.clientId || CLIENT_KEYS.indexOf(c.key) >= 0; })
      .map(function (c) {
        var w = { id: '110px', statusLabel: '230px', priorityLabel: '170px', dueDateLabel: '140px', createdDateLabel: '130px', linkedObjectNumber: '150px' }[c.key];
        return Object.assign({}, c, c.key === 'id' ? { type: 'text' } : {}, w ? { width: w } : {});
      });
    return T.mount(host, {
      id: opts.clientId ? 'client-tasks' : 'tasks',
      tab: opts.scope || 'MY',
      columns: cols,
      rows: function (scope) {
        return S.tasks(opts.clientId ? null : scope).filter(function (t) { return !opts.clientId || t.clientId === opts.clientId; });
      },
      value: function (t, col) {
        switch (col.key) {
          case 'statusLabel': return S.lbl.taskStatus(t.statusCode);
          case 'priorityLabel': return S.lbl.priority(t.priorityCode);
          case 'dueDateLabel': return F.date(t.dueDate);
          case 'createdDateLabel': return F.date(t.createdAt);
          case 'executorName': return (S.employee(t.executorId) || {}).fullName;
          case 'initiatorName': return (S.employee(t.initiatorId) || {}).fullName;
          case 'linkedObjectTypeLabel': return t.linkedObject && t.linkedObject.typeLabel;
          case 'linkedObjectNumber': return t.linkedObject && t.linkedObject.number;
          default: return t[col.key];
        }
      },
      filter: cols.map(function (c) { return { label: c.label, key: c.key }; }),
      onRowClick: opts.onSelect ? function (t) { opts.onSelect(t); } : null,
      cell: function (t, col, v) {
        if (col.key === 'statusLabel') return '<div class="tc" data-col="statusLabel"><span class="tc__row">' + T.chip(v, { tone: STATUS_TONE[t.statusCode], rounded: true }) + '</span></div>';
        if (col.key === 'priorityLabel') return '<div class="tc" data-col="priorityLabel"><span class="tc__row">' + T.chip(v, { tone: PRIORITY_TONE[t.priorityCode] }) + '</span></div>';
        if (col.key === 'linkedObjectNumber' && t.linkedObject) {
          var lo = t.linkedObject, base = window.IBPR_NAV.href(lo.page);
          return '<div class="tc" data-col="linkedObjectNumber"><span class="tc__row">' + (base ? '<a class="link link--accent link--m" href="' + base + '?' + lo.params + '">' + T.esc(lo.number) + '</a>' : '<span class="tc__text">' + T.esc(lo.number) + '</span>') + '</span></div>';
        }
        return null;
      }
    });
  }

  window.LcTasksTable = { mount: mount };
})();

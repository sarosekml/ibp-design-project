/* История задачи: данные передаёт V2TaskPreviewTile; механика таблицы — ДС. */
(function () {
  'use strict';
  var GRID = '8px 110px minmax(140px,1fr) minmax(160px,1.4fr) 170px minmax(180px,1.6fr) 130px minmax(8px,1fr)';
  var STATUS_TONE = { PENDING_EXECUTION: 'info', DONE: 'success', CANCELLED: 'grey', ADJUSTMENT_REQUIRED: 'warning' };
  var PRIORITY_TONE = { MAX: 'error', HIGH: 'error', MEDIUM: 'warning', LOW: 'info' };
  function esc(s) { return String(s == null ? '–' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function chip(label, tone, rounded) { return '<span class="chip chip--s chip--fit' + (rounded ? ' chip--rounded' : '') + (tone ? ' chip--' + tone : '') + '"><span class="chip__label">' + esc(label) + '</span></span>'; }
  function render(host, opts) {
    if (!host || !opts || !opts.task) return;
    var rows = opts.task.history || [], S = window.IBPR, F = window.DICT_FMT;
    var table = host.querySelector('[data-history-rows]');
    var heads = ['Дата', 'Событие', 'Название', 'Статус', 'Описание задачи', 'Приоритет'];
    var html = '<div class="tbl__row tbl__row--head" style="grid-template-columns:' + GRID + '"><div class="th th--separator"></div>'
      + heads.map(function (label, i) { return '<div class="th" data-col="h' + i + '"><span class="th__label">' + label + '</span><span class="th__resize" role="separator" aria-orientation="vertical" tabindex="0" aria-label="Изменить ширину колонки"></span></div>'; }).join('') + '<div class="th th--separator"></div></div>';
    html += rows.map(function (r) {
      var cells = ['<span class="tc__text">' + esc(F.date(r.date)) + '</span>',
        '<span class="tc__text tc__text--truncate">' + esc(r.event) + '</span>',
        '<span class="tc__text tc__text--truncate">' + esc(r.name) + '</span>',
        chip(S.lbl.taskStatus(r.statusCode), STATUS_TONE[r.statusCode], true),
        '<span class="tc__text tc__text--truncate">' + esc(r.description) + '</span>',
        chip(S.lbl.priority(r.priorityCode), PRIORITY_TONE[r.priorityCode])];
      return '<div class="tbl__row" style="grid-template-columns:' + GRID + '"><div class="tc tc--separator"></div>'
        + cells.map(function (cell, i) { return '<div class="tc" data-col="h' + i + '"><span class="tc__row">' + cell + '</span></div>'; }).join('') + '<div class="tc tc--separator"></div></div>';
    }).join('');
    table.innerHTML = html;
    host.setAttribute('data-state', rows.length ? 'data' : 'empty');
    if (window.DSTable) window.DSTable.bind(host.querySelector('.dtable__body'));
    if (window.dsIcons) window.dsIcons.apply(host);
  }
  window.LcTaskHistoryTable = { render: render };
})();

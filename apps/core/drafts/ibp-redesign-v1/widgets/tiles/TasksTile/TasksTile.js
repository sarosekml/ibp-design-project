/* TasksTile — задачи сделки.
   render(host, { tasks }) — TaskRsDto[]: строка «№. Название» ссылкой на
   реестр задач (выбранная задача в предпросмотре) и чип статуса; пусто —
   «В сделке нет задач». «Добавить» — по клику ничего (Р6). */
(function () {
  'use strict';

  var STATUS_TONE = { PENDING_EXECUTION: 'info', DONE: 'success', CANCELLED: 'grey', ADJUSTMENT_REQUIRED: 'warning' };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    if (!host) return;
    var S = window.IBPR, N = window.IBPR_NAV;
    var list = (opts && opts.tasks) || [];
    var ul = host.querySelector('[data-tt-list]');
    if (ul) {
      ul.innerHTML = list.map(function (t) {
        return '<li class="lc-tasks-tile__row"><a class="link link--accent link--m link--truncate" href="' + N.href('tasks', { id: t.id }) + '">' + esc(t.id + '. ' + t.name) + '</a>'
          + '<span class="chip chip--xs chip--fit chip--rounded' + (STATUS_TONE[t.statusCode] ? ' chip--' + STATUS_TONE[t.statusCode] : '') + '"><span class="chip__label">' + esc(S.lbl.taskStatus(t.statusCode)) + '</span></span></li>';
      }).join('');
    }
    show(host, '[data-tt-list]', list.length > 0);
    show(host, '[data-tt-empty]', !list.length);
  }

  window.LcTasksTile = { render: render };
})();

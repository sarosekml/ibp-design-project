/* V2TaskPreviewTile — заполнение предпросмотра задачи.
   render(host, { task, onAction }) — задача (TaskRsDto из data/store.js);
   onAction(action, task) — 'done' | 'reassign' | 'cancel' | 'close'.
   Окно смены статуса — V2ChangeTaskStatusModal, его открывает страница (Р7). */
(function () {
  'use strict';

  var STATUS_TONE = { PENDING_EXECUTION: 'info', DONE: 'success', CANCELLED: 'grey', ADJUSTMENT_REQUIRED: 'warning' };
  var PRIORITY_TONE = { MAX: 'error', HIGH: 'error', MEDIUM: 'warning', LOW: 'info' };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text; }
  function setChip(el, label, tone, rounded) {
    if (!el) return;
    el.className = 'chip chip--s chip--fit' + (rounded ? ' chip--rounded' : '') + (tone ? ' chip--' + tone : '');
    el.querySelector('.chip__label').textContent = label;
  }

  function render(host, opts) {
    var t = opts && opts.task;
    if (!t || !host) return;
    var S = window.IBPR, F = window.DICT_FMT, N = window.IBPR_NAV;
    set(host, '[data-tp-title]', t.id + '. ' + t.name);
    setChip(host.querySelector('[data-tp-status]'), S.lbl.taskStatus(t.statusCode), STATUS_TONE[t.statusCode], true);
    setChip(host.querySelector('[data-tp-priority]'), S.lbl.priority(t.priorityCode), PRIORITY_TONE[t.priorityCode]);
    set(host, '[data-tp-type]', t.type || '–');
    set(host, '[data-tp-category]', t.category || '–');
    set(host, '[data-tp-due]', F.date(t.dueDate));
    var ex = S.employee(t.executorId), ini = S.employee(t.initiatorId);
    set(host, '[data-tp-executor]', ex ? ex.fullName : '–');
    set(host, '[data-tp-client]', t.clientName || '–');
    set(host, '[data-tp-created]', F.date(t.createdAt));
    set(host, '[data-tp-initiator]', ini ? ini.fullName : '–');
    set(host, '[data-tp-holding]', t.holdingName || '–');
    set(host, '[data-tp-description]', t.description || '–');
    var lo = t.linkedObject || {};
    setChip(host.querySelector('[data-tp-linked-type]'), lo.typeLabel || '–', '');
    set(host, '[data-tp-linked-number]', lo.number || '–');
    set(host, '[data-tp-linked-name]', lo.name || '–');
    var ll = host.querySelector('[data-tp-linked-link]');
    if (ll) ll.setAttribute('href', lo.page && N.href(lo.page) ? N.href(lo.page) + '?' + lo.params : '#');
    var cs = host.querySelector('[data-tp-comment-sec]');
    var cm = (t.comments || [])[0];
    if (cs) cs.hidden = !cm;
    if (cm) set(host, '[data-tp-comment]', cm.text);
    var acts = host.querySelector('[data-tp-acts]');
    if (acts) acts.hidden = !(t.statusCode === 'PENDING_EXECUTION' || t.statusCode === 'ADJUSTMENT_REQUIRED');
    var slot = host.querySelector('[data-tp-history]');
    if (slot) {
      if (!slot.firstElementChild) slot.appendChild(document.getElementById('task-history-template').content.cloneNode(true));
      window.LcTaskHistoryTable.render(slot.firstElementChild, { task: t });
    }
    var cb = opts.onAction || function () {};
    var bind = function (sel, action) { var b = host.querySelector(sel); if (b) b.onclick = function () { cb(action, t); }; };
    bind('[data-tp-done]', 'done');
    /* Формы переназначения в источнике нет: кнопка видна, действие — Р6. */
    var reassign = host.querySelector('[data-tp-reassign]');
    if (reassign) reassign.onclick = function () {};
    bind('[data-tp-cancel]', 'cancel');
    bind('[data-tp-close]', 'close');
    if (window.dsIcons) window.dsIcons.apply(host);
  }

  window.LcTaskPreviewTile = { render: render };
})();

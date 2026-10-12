/* V2ChangeTaskStatusModal — окно действий Р7 над задачей.
   open({ task, action, onConfirm }) — action: 'done' | 'reassign' | 'cancel';
   при reassign показывается поле исполнителя (DropdownList из employees.js).
   Открывается слоем Modal ДС (DSModal.open): фокус, Esc, inert фона.
   Подтверждение меняет задачу в хранилище (IBPR) и зовёт onConfirm(task). */
(function () {
  'use strict';

  var current = null;
  var TITLES = { done: 'Исполнить задачу', reassign: 'Переназначить задачу', cancel: 'Отменить задачу' };
  var TEXTS = { done: 'получит статус «Выполнено»', reassign: 'будет передана другому исполнителю', cancel: 'получит статус «Отменена»' };

  function fillEmployees(scrim, selectedId) {
    var ddl = scrim.querySelector('#tc-employee-ddl');
    if (!ddl || !window.IBPR) return;
    ddl.innerHTML = window.IBPR.employees().map(function (e) {
      return '<button type="button" class="ddl__item" role="option" aria-selected="' + (e.id === selectedId ? 'true' : 'false') + '" data-emp="' + e.id + '"><span class="ddl__item-body"><span class="ddl__item-label">' + e.fullName + '</span></span></button>';
    }).join('');
  }

  function open(opts) {
    var scrim = document.getElementById('task-change-scrim');
    if (!scrim || !opts || !opts.task) return;
    bind();
    current = opts;
    scrim.querySelector('#task-change-title').textContent = TITLES[opts.action] || 'Смена статуса задачи';
    scrim.querySelector('[data-tc-number]').textContent = opts.task.id;
    scrim.querySelector('[data-tc-name]').textContent = opts.task.name + ' — ' + (TEXTS[opts.action] || '');
    var emp = scrim.querySelector('[data-tc-employee]');
    if (emp) emp.hidden = opts.action !== 'reassign';
    var input = document.getElementById('tc-employee');
    if (input) {
      var cur = window.IBPR.employee(opts.task.executorId);
      input.value = opts.action === 'reassign' && cur ? cur.fullName : '';
      fillEmployees(scrim, opts.task.executorId);
      if (window.DSInput && window.DSInput.sync) window.DSInput.sync(input.closest('.inp'));
    }
    if (window.DSModal) window.DSModal.open(scrim);
  }

  function bind() {
    var scrim = document.getElementById('task-change-scrim');
    if (!scrim || scrim.getAttribute('data-bound')) return;
    scrim.setAttribute('data-bound', '1');
    scrim.querySelector('[data-tc-confirm]').addEventListener('click', function () {
      if (!current) return;
      var t = current.task, S = window.IBPR;
      if (current.action === 'done') S.setTaskStatus(t.id, 'DONE');
      else if (current.action === 'cancel') S.setTaskStatus(t.id, 'CANCELLED');
      else if (current.action === 'reassign') {
        var name = (document.getElementById('tc-employee').value || '').trim();
        var found = S.employees().filter(function (e) { return e.fullName === name; })[0];
        if (found) S.reassignTask(t.id, found.id);
      }
      if (window.DSModal) window.DSModal.closeTop();
      var labels = { done: 'выполнена', cancel: 'отменена', reassign: 'переназначена' };
      if (window.DSSnack) window.DSSnack.show({ tone: 'success', title: 'Задача ' + t.id + ' ' + labels[current.action] });
      if (current.onConfirm) current.onConfirm(S.task(t.id));
    });
  }

  window.LcChangeTaskStatusModal = { open: open, bind: bind };
})();

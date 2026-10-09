/* ============================================================
   TaskCreateModal.js — окно «Новая задача».

   Подключается после MeetingCreateModal.js: списки и ошибки полей — общий
   слой форм главной window.LcHomeForm, своей копии здесь нет (Л43).

   Открывают триггеры data-modal="task-create-scrim" и
   LcTaskCreateModal.open(). Перед открытием поля сбрасываются: срок —
   сегодня, приоритет — средний. «Создать задачу» → проверка →
   HomeStore.addTask → окно закрывается, уведомление DSSnack.
   ============================================================ */
(function () {
  'use strict';

  var scrim = document.getElementById('task-create-scrim');
  var F = window.LcHomeForm;
  if (!scrim || !F) return;

  function clients() {
    var seen = {}, out = [{ code: '', label: 'Без клиента' }];
    [].concat(window.MOCK_MEETINGS || [], window.MOCK_TASKS || [], window.MOCK_NEWS || []).forEach(function (x) {
      if (x.clientName && !seen[x.clientName]) { seen[x.clientName] = true; out.push({ code: x.clientName, label: x.clientName }); }
    });
    return out;
  }

  var title = scrim.querySelector('#task-create-title-input');
  var due = scrim.querySelector('#task-create-due');
  var deal = scrim.querySelector('#task-create-deal');
  var seg = scrim.querySelector('.segctrl');
  var errTitle = F.fieldError(title);
  var errDue = F.fieldError(due);
  var errDeal = F.fieldError(deal);
  var client = F.select(scrim, 'task-create-client', { options: clients });
  title.addEventListener('input', function () { if (title.value.trim()) errTitle.clear(); });
  due.addEventListener('input', function () { errDue.clear(); });
  deal.addEventListener('input', function () { errDeal.clear(); });

  function priority() {
    var on = seg.querySelector('.segctrl__item[aria-checked="true"]');
    return on ? on.getAttribute('data-priority') : 'MEDIUM';
  }

  function reset() {
    var S = window.HomeStore, today = S ? S.today : '';
    title.value = '';
    deal.value = '';
    due.value = today ? today.slice(8, 10) + '.' + today.slice(5, 7) + '.' + today.slice(0, 4) : '';
    client.set('');
    var medium = seg.querySelector('[data-priority="MEDIUM"]');
    if (seg.__dsSeg) seg.__dsSeg.select(medium);
    [errTitle, errDue, errDeal].forEach(function (e) { e.clear(); });
    if (window.DSInput) window.DSInput.syncAll(scrim);
  }

  function validate() {
    client.commitTyped();
    var S = window.HomeStore, ok = true;
    if (!title.value.trim()) { errTitle.set('Сформулируйте задачу'); ok = false; }
    var iso = F.parseDate(due.value);
    if (!iso) { errDue.set('Укажите срок в формате ДД.ММ.ГГГГ'); ok = false; }
    else if (S && iso < S.today) { errDue.set('Срок не может быть раньше сегодняшнего дня'); ok = false; }
    var d = deal.value.trim();
    if (d && !/^D-\d{6}$/.test(d)) { errDeal.set('Номер сделки — D- и шесть цифр'); ok = false; }
    if (!ok) { var first = scrim.querySelector('.inp--error .inp__control'); if (first) first.focus(); }
    return ok ? iso : null;
  }

  function open() {
    reset();
    if (window.DSModal) window.DSModal.open(scrim);
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-modal="task-create-scrim"]')) reset();
  }, true);

  scrim.querySelector('[data-task-create-save]').addEventListener('click', function () {
    var S = window.HomeStore, iso = validate();
    if (!S || !iso) return;
    var t = S.addTask({ title: title.value.trim(), dueDate: iso, priorityCode: priority(), clientName: client.get() || null, dealNumber: deal.value.trim() || null });
    if (window.DSModal) window.DSModal.closeTop();
    if (window.DSSnack) window.DSSnack.show({ tone: 'success', title: 'Задача создана', text: t.title + ' · срок ' + S.fmt.date(t.dueDate) });
  });

  reset();
  window.LcTaskCreateModal = { open: open, reset: reset };
})();

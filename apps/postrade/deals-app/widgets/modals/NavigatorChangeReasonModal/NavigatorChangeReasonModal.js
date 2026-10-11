/* ============================================================
   NavigatorChangeReasonModal.js — окно причины ввода изменений.

   Открывает его тайл «Заведение сделки» (Navigator) по полю modal перехода
   статусной модели: пункт кебаба «Ввести изменения» (deal_start_changes).
   Макета нет — оболочка с полем «Причина» (задача RE0013, раздел 4).

   Делает то, чего нет в рантаймах ДС:
   1) открывается с пустым полем: причина — у каждого цикла изменений своя;
   2) держит «Сохранить» недоступной, пока в поле нет текста (допущение
      10.10.2026, вопрос 3 паспорта);
   3) по «Сохранить» отдаёт тайлу { patch: { changeReason } } и закрывает окно.
      Крестик и Esc — без перехода.

   API — реестр окон навигатора (его читает страница в openModal тайла):
     PostNavigatorModals.NavigatorChangeReasonModal.open(ctx, done)
       ctx = { deal, transition }; done({ patch }) — после «Сохранить»
     PostNavigatorModals.NavigatorChangeReasonModal.use(ctx) — нарисовать без
       открытия (витрина)
   ============================================================ */
(function () {
  'use strict';

  var NAME = 'NavigatorChangeReasonModal';
  var scrim = document.getElementById('nav-change-reason-scrim');
  if (!scrim) return;
  var reason = scrim.querySelector('#nav-change-reason-text');
  var save = scrim.querySelector('[data-nav-change-reason-save]');
  var pending = null;

  function sync() { if (save) save.disabled = !String((reason && reason.value) || '').trim(); }

  function paint() {
    if (reason) reason.value = '';
    if (window.DSInput) window.DSInput.syncAll(scrim);
    sync();
  }

  function inline() { return scrim.classList.contains('modal-scrim--inline'); }

  function open(ctx, done) {
    paint(ctx);
    pending = done || null;
    if (window.DSModal && !inline()) window.DSModal.open(scrim);
  }

  if (reason) ['input', 'change'].forEach(function (type) { reason.addEventListener(type, sync); });

  if (save) {
    save.addEventListener('click', function () {
      if (save.disabled) return;
      var done = pending;
      pending = null;
      var extra = { patch: { changeReason: String(reason.value).trim() } };
      if (window.DSModal && !inline()) window.DSModal.closeTop();
      if (done) done(extra);
    });
  }

  window.PostNavigatorModals = window.PostNavigatorModals || {};
  window.PostNavigatorModals[NAME] = { open: open, use: paint };
})();

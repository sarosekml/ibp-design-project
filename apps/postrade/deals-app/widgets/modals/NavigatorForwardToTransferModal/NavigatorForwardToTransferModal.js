/* ============================================================
   NavigatorForwardToTransferModal.js — окно «Подтвердите действие» с датой
   передачи на мониторинг (макет screenflow дизайнера).

   Открывает его тайл «Заведение сделки» (Navigator) по полю modal перехода
   статусной модели: кнопка «Направить на передачу» — первая передача
   (mon_forward) и передача изменений (mon_changes_forward). Окно одно.

   Делает то, чего нет в рантаймах ДС:
   1) открывается с пустым полем даты — и в цикле изменений;
   2) держит «Сохранить» недоступной, пока в поле нет настоящей даты
      ДД.ММ.ГГГГ (допущение 10.10.2026, вопрос 3 паспорта);
   3) по «Сохранить» отдаёт тайлу { patch: { monitoringTransferDate } } и
      закрывает окно. Крестик и Esc — без перехода.

   API — реестр окон навигатора (его читает страница в openModal тайла):
     PostNavigatorModals.NavigatorForwardToTransferModal.open(ctx, done)
       ctx = { deal, transition }; done({ patch }) — после «Сохранить»
     PostNavigatorModals.NavigatorForwardToTransferModal.use(ctx) — нарисовать
       без открытия (витрина)
   ============================================================ */
(function () {
  'use strict';

  var NAME = 'NavigatorForwardToTransferModal';
  var scrim = document.getElementById('nav-forward-scrim');
  if (!scrim) return;
  var date = scrim.querySelector('#nav-forward-date');
  var save = scrim.querySelector('[data-nav-forward-save]');
  var pending = null;

  /* Настоящая дата ДД.ММ.ГГГГ (31.02 — не дата) */
  function isDate(value) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(value || '').trim());
    if (!m) return false;
    var d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    return d.getFullYear() === Number(m[3]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[1]);
  }

  function sync() { if (save) save.disabled = !isDate(date && date.value); }

  /* Поле открывается пустым и в цикле изменений: прежняя дата передачи —
     другая передача, подставлять её значило бы подсказывать неверное
     (допущение 10.10.2026, вопрос 4 паспорта). */
  function paint() {
    if (date) date.value = '';
    if (window.DSInput) window.DSInput.syncAll(scrim);
    sync();
  }

  function inline() { return scrim.classList.contains('modal-scrim--inline'); }

  function open(ctx, done) {
    paint(ctx);
    pending = done || null;
    if (window.DSModal && !inline()) window.DSModal.open(scrim);
  }

  if (date) ['input', 'change'].forEach(function (type) { date.addEventListener(type, sync); });

  if (save) {
    save.addEventListener('click', function () {
      if (save.disabled) return;
      var done = pending;
      pending = null;
      var extra = { patch: { monitoringTransferDate: String(date.value).trim() } };
      if (window.DSModal && !inline()) window.DSModal.closeTop();
      if (done) done(extra);
    });
  }

  window.PostNavigatorModals = window.PostNavigatorModals || {};
  window.PostNavigatorModals[NAME] = { open: open, use: paint };
})();

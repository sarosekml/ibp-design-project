/* ============================================================
   NavigatorDealCloseModal.js — окно погашения сделки.

   Открывает его тайл «Заведение сделки» (Navigator) по полю modal перехода
   статусной модели: пункт кебаба «Погасить» (deal_repay). Макета окна нет;
   из пояснения screenflow — только дата погашения. Состав взят по образцу
   окна погашения инструмента (RepaymentModal) — допущение 10.10.2026.

   Делает то, чего нет в рантаймах ДС:
   1) пишет строку «Погашение сделки N. Имя» и ставит в поле сегодняшнюю дату;
   2) держит «Подтвердить» недоступной, пока в поле нет настоящей даты
      ДД.ММ.ГГГГ (допущение 10.10.2026, вопрос 3 паспорта);
   3) по «Подтвердить» отдаёт тайлу { patch: { repayDate } } и закрывает окно.
      Дату показывает подзаголовок страницы («Погашена ДД.ММ.ГГГГ»). Крестик и
      Esc — без перехода.

   API — реестр окон навигатора (его читает страница в openModal тайла):
     PostNavigatorModals.NavigatorDealCloseModal.open(ctx, done)
       ctx = { deal, transition }; done({ patch }) — после «Подтвердить»
     PostNavigatorModals.NavigatorDealCloseModal.use(ctx) — нарисовать без
       открытия (витрина)
   ============================================================ */
(function () {
  'use strict';

  var NAME = 'NavigatorDealCloseModal';
  var scrim = document.getElementById('nav-deal-close-scrim');
  if (!scrim) return;
  var text = scrim.querySelector('.lc-nav-deal-close__text');
  var date = scrim.querySelector('#nav-deal-close-date');
  var save = scrim.querySelector('[data-nav-deal-close-save]');
  var pending = null;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() {
    var d = new Date();
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
  }

  /* Настоящая дата ДД.ММ.ГГГГ (31.02 — не дата) */
  function isDate(value) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(value || '').trim());
    if (!m) return false;
    var d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    return d.getFullYear() === Number(m[3]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[1]);
  }

  function sync() { if (save) save.disabled = !isDate(date && date.value); }

  function paint(ctx) {
    var deal = (ctx && ctx.deal) || {};
    if (text) text.textContent = 'Погашение сделки ' + (deal.id != null ? deal.id + '. ' : '') + (deal.name || '');
    if (date) date.value = today();
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
      var extra = { patch: { repayDate: String(date.value).trim() } };
      if (window.DSModal && !inline()) window.DSModal.closeTop();
      if (done) done(extra);
    });
  }

  window.PostNavigatorModals = window.PostNavigatorModals || {};
  window.PostNavigatorModals[NAME] = { open: open, use: paint };
})();

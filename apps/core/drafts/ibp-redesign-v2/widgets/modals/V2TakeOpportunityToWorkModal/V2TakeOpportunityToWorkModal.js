/* V2TakeOpportunityToWorkModal — «Взять сделку в работу» (Р7 MS0014).
   Окно одно на страницу, триггеры — любые [data-modal="take-opp-scrim"][data-opp]
   (иконка строки реестра, кнопка шапки сделки). Подтверждение переносит сделку
   в Pipeline «Сделки моего деска» (IBPR.takeToWork) и показывает SnackBar.
   bind({ onDone(o) }) — что сделать странице после переноса. */
(function () {
  'use strict';
  var current = null;

  function bind(opts) {
    opts = opts || {};
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-modal="take-opp-scrim"][data-opp]');
      if (!t) return;
      current = Number(t.getAttribute('data-opp'));
      var id = document.querySelector('[data-take-opp-id]');
      if (id) id.textContent = String(current);
    }, true);
    var ok = document.querySelector('[data-take-opp-confirm]');
    if (!ok) return;
    ok.addEventListener('click', function () {
      if (current == null || !window.IBPR) return;
      var o = window.IBPR.takeToWork(current);
      if (window.DSModal) window.DSModal.closeTop();
      if (o && window.DSSnack) window.DSSnack.show({ tone: 'success', title: 'Сделка ' + o.id + ' взята в работу', text: 'Она в Pipeline, вкладка «Сделки моего деска»' });
      if (o && opts.onDone) opts.onDone(o);
    });
  }

  window.LcTakeOpportunityToWorkModal = { bind: bind };
})();

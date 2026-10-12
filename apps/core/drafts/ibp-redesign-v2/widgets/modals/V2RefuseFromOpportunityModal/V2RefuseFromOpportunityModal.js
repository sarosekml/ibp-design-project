/* V2RefuseFromOpportunityModal — «Отказаться от сделки» (Р7 MS0014).
   Триггеры — [data-modal="refuse-opp-scrim"][data-opp]. Подтверждение переносит
   сделку во вкладку «В архиве» источника (IBPR.refuse) с причиной и
   комментарием; известна одна причина — «Срок ожидания истек» (вопрос 3).
   bind({ onDone(o) }) — что сделать странице после переноса. */
(function () {
  'use strict';
  var current = null;

  function bind(opts) {
    opts = opts || {};
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-modal="refuse-opp-scrim"][data-opp]');
      if (!t) return;
      current = Number(t.getAttribute('data-opp'));
      var id = document.querySelector('[data-refuse-opp-id]');
      if (id) id.textContent = String(current);
    }, true);
    var ok = document.querySelector('[data-refuse-opp-confirm]');
    if (!ok) return;
    ok.addEventListener('click', function () {
      if (current == null || !window.IBPR) return;
      var comment = document.getElementById('refuse-opp-comment');
      var o = window.IBPR.refuse(current, { reasonCode: 'WAIT_EXPIRED', comment: comment ? comment.value : '' });
      if (comment) { comment.value = ''; if (window.DSInput && window.DSInput.sync) window.DSInput.sync(comment.closest('.inp')); }
      if (window.DSModal) window.DSModal.closeTop();
      if (o && window.DSSnack) window.DSSnack.show({ tone: 'success', title: 'Отказ по сделке ' + o.id, text: 'Сделка во вкладке «В архиве»' });
      if (o && opts.onDone) opts.onDone(o);
    });
  }

  window.LcRefuseFromOpportunityModal = { bind: bind };
})();

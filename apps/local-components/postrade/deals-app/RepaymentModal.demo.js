/* ============================================================
   RepaymentModal.demo.js — сценарий демо витрины для окна погашения.
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает
   этот файл последним.

   Что добавляет к общему демо:
   - контрол «Вариант»: погашение (текст и поле «Дата фактического
     погашения», по умолчанию сегодня) или отмена погашения (только текст);
   - узлы — транши сделки-образца из fixtures.json: непогашенный для
     погашения, погашенный для отмены. Рисует окно само
     (PostModalRepayment.use) по ProductTreeStore; «Подтвердить» в живом
     стенде гасит узел в сторе, витрина правки не сохраняет
     (ProductTreeStore.persist(false));
   - копии «Все состояния рядом» — снимок текста, варианта и даты живого окна.
   ============================================================ */
(function () {
  'use strict';

  function copy(from, to) {
    var a = from.querySelector('.lc-repay'), b = to.querySelector('.lc-repay');
    if (a && b) b.setAttribute('data-variant', a.getAttribute('data-variant'));
    var t = from.querySelector('.lc-repay__text'), u = to.querySelector('.lc-repay__text');
    if (t && u) u.textContent = t.textContent;
    var i = from.querySelector('.inp__control'), j = to.querySelector('.inp__control');
    if (i && j) j.value = i.value;
  }

  window.IBPKitDemo.register('RepaymentModal', {
    controls: function (defs) {
      return defs.concat([{ key: 'variant', label: 'Вариант', value: 'repay',
        options: [['repay', 'Погашение'], ['undo', 'Отмена погашения']] }]);
    },
    apply: function (scrim, st, ctx) {
      var S = window.ProductTreeStore, M = window.PostModalRepayment;
      var fx = (ctx.fixtures || {}).data;
      if (!S || !M || !fx) return;
      if (ctx.live) {
        S.persist(false);
        if (String(S.dealId()) !== String(fx.dealId)) S.use(fx.dealId);
        var undo = st.variant === 'undo';
        M.use(undo ? fx.undoNodeId : fx.repayNodeId, undo ? 'undo' : 'repay');
      } else {
        var live = document.getElementById(scrim.id);
        if (live && live !== scrim) copy(live, scrim);
      }
    }
  });
})();

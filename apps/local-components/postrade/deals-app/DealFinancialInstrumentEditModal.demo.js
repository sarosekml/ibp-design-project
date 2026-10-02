/* ============================================================
   DealFinancialInstrumentEditModal.demo.js — сценарий демо витрины для
   окна «ФИ — изменение». Пишется руками; страницу рядом собирает
   kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо:
   - контрол «Тип ФИ»: состав окна у кредита, акций, доп. доходности, РЕПО
     и у незаполненной карточки — карточки сделки-образца из fixtures.json;
   - окно заполняет само (PostModalFinInstrumentEdit.use) по
     FinInstrumentsStore — те же функции, что на странице сделки. Витрина
     правки не сохраняет (FinInstrumentsStore.persist(false));
   - копии «Все состояния рядом» — снимок заголовка, видимых полей и
     значений живого окна.
   ============================================================ */
(function () {
  'use strict';

  function copy(from, to) {
    var t = from.querySelector('.modal__title'), u = to.querySelector('.modal__title');
    if (t && u) u.textContent = t.textContent;
    var a = from.querySelectorAll('[data-fi-field]'), b = to.querySelectorAll('[data-fi-field]');
    Array.prototype.forEach.call(a, function (el, i) { if (b[i]) b[i].hidden = el.hidden; });
    var x = from.querySelectorAll('input'), y = to.querySelectorAll('input');
    Array.prototype.forEach.call(x, function (el, i) {
      if (!y[i]) return;
      if (el.type === 'checkbox') y[i].checked = el.checked; else y[i].value = el.value;
    });
  }

  window.IBPKitDemo.register('DealFinancialInstrumentEditModal', {
    controls: function (defs) {
      return defs.concat([{ key: 'type', label: 'Тип ФИ', value: 'SHARES',
        options: [['LOAN', 'Кредит'], ['SHARES', 'Акции'], ['ADDITIONAL_YIELD', 'Доп. доходность'],
          ['REPO', 'РЕПО'], ['LOAN_EMPTY', 'Кредит, не заполнено']] }]);
    },
    apply: function (scrim, st, ctx) {
      var S = window.FinInstrumentsStore, T = window.ProductTreeStore, M = window.PostModalFinInstrumentEdit;
      var fx = ctx.fixtures || {};
      if (!S || !T || !M || !fx.cards) return;
      if (ctx.live) {
        S.persist(false);
        T.persist(false);
        if (String(S.dealId()) !== String(fx.dealId)) { T.use(fx.dealId); S.use(fx.dealId); }
        M.use(fx.cards[st.type] || fx.cards.SHARES);
      } else {
        var live = document.getElementById(scrim.id);
        if (live && live !== scrim) copy(live, scrim);
      }
    }
  });
})();

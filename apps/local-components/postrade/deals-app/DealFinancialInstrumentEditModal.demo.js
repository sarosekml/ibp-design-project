/* ============================================================
   DealFinancialInstrumentEditModal.demo.js — сценарий демо витрины для
   окна «ФИ — изменение». Пишется руками; страницу рядом собирает
   kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо:
   - контрол «Тип ФИ» (вариант) — состав окна у кредита, акций, доп. доходности
     и РЕПО; «Кредит, не заполнено» — не вариант, а состояние «Заполнено
     частично»: вариант и состояние разнесены по осям;
   - окно заполняет само (PostModalFinInstrumentEdit.use) по
     FinInstrumentsStore — те же функции, что на странице сделки. Витрина
     правки не сохраняет (FinInstrumentsStore.persist(false));
   - копии «Все состояния рядом» — снимок: окно привязано к живому скриму,
     копию рисуем напрямую по карточке стора (заголовок, видимые поля, значения).
   ============================================================ */
(function () {
  'use strict';

  function renderCopy(el, id, S) {
    var c = S.card(id);
    if (!c) return;
    var fields = S.fieldsOf(c.typeCode);
    var title = el.querySelector('.modal__title');
    if (title) title.textContent = 'ФИ: ' + c.number + '. ' + c.typeLabel;
    Array.prototype.forEach.call(el.querySelectorAll('[data-fi-field]'), function (box) {
      box.hidden = fields.indexOf(box.getAttribute('data-fi-field')) === -1;
    });
    function setInp(sel, v) { var inp = el.querySelector(sel); if (inp) inp.value = v == null ? '' : String(v); }
    setInp('#fi-edit-name', c.name);
    setInp('#fi-edit-irr', c.targetIrr == null ? '' : String(c.targetIrr).replace('.', ','));
    setInp('#fi-edit-contract', c.linkedContractNumber);
    var cp = S.counterpartyOptions();
    var cpName = function (id) { var o = cp.filter(function (x) { return x.id === id; })[0]; return o ? o.name : ''; };
    setInp('#fi-edit-counterparty', cpName(c.counterpartyId));
    setInp('#fi-edit-reserve', cpName(c.reserveCounterpartyId));
    setInp('#fi-edit-allocation', cpName(c.allocationCounterpartyId));
    var fv = S.fvAcOptions().filter(function (x) { return x.code === c.fvAcCode; })[0];
    setInp('#fi-edit-fvac', fv ? fv.label : '');
    var opt = S.optionNodes().filter(function (x) { return x.id === c.ifrsOptionNodeId; })[0];
    setInp('#fi-edit-option', opt ? opt.label : '');
    [['#fi-edit-pe', c.isPE], ['#fi-edit-dkkk', c.isDkkk], ['#fi-edit-option-flag', c.hasLinkedUnconditionalOption]].forEach(function (p) {
      var cb = el.querySelector(p[0]); if (cb) cb.checked = p[1] === true;
    });
  }

  window.IBPKitDemo.register('DealFinancialInstrumentEditModal', {
    /* «Не заполнено» — состояние «Заполнено частично», а не вариант. */
    states: ['data', 'partial'],
    controls: function (defs) {
      return defs.concat([{ key: 'variant', label: 'Тип ФИ', value: 'SHARES',
        options: [['LOAN', 'Кредит'], ['SHARES', 'Акции'], ['ADDITIONAL_YIELD', 'Доп. доходность'],
          ['REPO', 'РЕПО']] }]);
    },
    apply: function (scrim, st, ctx) {
      var S = window.FinInstrumentsStore, T = window.ProductTreeStore, M = window.PostModalFinInstrumentEdit;
      var fx = ctx.fixtures || {};
      if (!S || !T || !M || !fx.cards) return;
      var id = st.state === 'partial' ? fx.cards.LOAN_EMPTY : (fx.cards[st.variant] || fx.cards.SHARES);
      if (!ctx.live) { renderCopy(scrim, id, S); return; }
      S.persist(false);
      T.persist(false);
      if (String(S.dealId()) !== String(fx.dealId)) { T.use(fx.dealId); S.use(fx.dealId); }
      M.use(id);
    }
  });
})();

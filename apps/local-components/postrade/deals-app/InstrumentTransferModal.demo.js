/* ============================================================
   InstrumentTransferModal.demo.js — сценарий демо витрины для окна
   «Перенос инструмента». Пишется руками; страницу рядом собирает
   kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо:
   - «Обновление» — сохранение идёт: CSS его не различает, его переводит в
     классы ДС скрипт окна (PostModalInstrumentTransfer.mirror), поэтому
     состояние объявляет сценарий; в нём выбран продукт из fixtures.json,
     как на третьем кадре макета;
   - списки «Откуда» и «Куда» — инструмент сделки-образца из fixtures.json.
     Рисует окно само (PostModalInstrumentTransfer.use) по ProductTreeStore
     — те же функции, что на странице сделки. Живое окно встроено в стенд:
     выбор строки кликом и клавишами работает; витрина правки не сохраняет
     (ProductTreeStore.persist(false));
   - копии «Все состояния рядом» — снимок списков живого окна.
   ============================================================ */
(function () {
  'use strict';

  function copy(from, to) {
    ['from', 'to'].forEach(function (k) {
      var sel = '[data-transfer-list="' + k + '"]';
      var a = from.querySelector(sel), b = to.querySelector(sel);
      if (a && b) b.innerHTML = a.innerHTML;
    });
    var t = from.querySelector('.lc-transfer__text'), u = to.querySelector('.lc-transfer__text');
    if (t && u) u.textContent = t.textContent;
  }

  function mark(scrim, id, on) {
    Array.prototype.forEach.call(scrim.querySelectorAll('[data-transfer-product]'), function (r) {
      r.setAttribute('aria-checked', on && r.getAttribute('data-transfer-product') === id ? 'true' : 'false');
    });
  }

  window.IBPKitDemo.register('InstrumentTransferModal', {
    states: ['updating'],
    apply: function (scrim, st, ctx) {
      var S = window.ProductTreeStore, M = window.PostModalInstrumentTransfer;
      var fx = (ctx.fixtures || {}).data;
      var root = scrim.querySelector('.lc-transfer');
      if (!S || !M || !fx || !root) return;
      var busy = st.state === 'updating';
      if (ctx.live) {
        S.persist(false);
        if (String(S.dealId()) !== String(fx.dealId)) S.use(fx.dealId);
        M.use(fx.instrumentId);
        if (busy) M.select(fx.targetId);
      } else {
        var live = document.getElementById(scrim.id);
        if (live && live !== scrim) copy(live, scrim);
        mark(scrim, fx.targetId, busy);
      }
      root.setAttribute('data-state', st.state);
      M.mirror(scrim);
    }
  });
})();

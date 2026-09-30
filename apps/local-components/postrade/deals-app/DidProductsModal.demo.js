/* ============================================================
   DidProductsModal.demo.js — сценарий демо витрины для окна
   «Продукты ДИД». Пишется руками; страницу рядом собирает kit-build.mjs и
   подключает этот файл последним.

   Что добавляет к общему демо:
   - ось состояний. Своего CSS у окна нет — раскладку и состояния держит
     ProductsModal.css общего слоя, поэтому генератор их не видит и
     состояния объявляет сценарий: загрузка · данные · обновление (ошибки
     и пустого справочника нет — ответ человека 30.09.2026, 27);
   - колонки — сделка-образец из fixtures.json окна: весь справочник
     продуктов ДИД слева, продукты ДИД сделки справа, у сохранённых —
     номер. Рисует окно само (PostModalDidProducts.use) по
     ProductTreeStore — те же функции, что на странице сделки. Живое окно
     встроено в стенд: перенос ⇄ и двойной клик работают, удаление
     сохранённого из «Выбрано» поднимает подтверждение; витрина правки не
     сохраняет (ProductTreeStore.persist(false));
   - копии «Все состояния рядом» — снимок колонок живого окна; «Обновление»
     переводится в классы ДС тем же PostProductPicker.mirror, что у окна.
   ============================================================ */
(function () {
  'use strict';

  function lists(scrim) {
    return {
      available: scrim.querySelector('[data-prodpick-list="available"]'),
      selected: scrim.querySelector('[data-prodpick-list="selected"]')
    };
  }

  function copyRows(from, to) {
    var a = lists(from), b = lists(to);
    ['available', 'selected'].forEach(function (k) {
      if (!a[k] || !b[k]) return;
      Array.prototype.slice.call(b[k].querySelectorAll('.prow')).forEach(function (el) { el.parentNode.removeChild(el); });
      Array.prototype.slice.call(a[k].querySelectorAll('.prow')).forEach(function (el) { b[k].appendChild(el.cloneNode(true)); });
    });
  }

  window.IBPKitDemo.register('DidProductsModal', {
    states: ['loading', 'updating'],
    apply: function (scrim, st, ctx) {
      var S = window.ProductTreeStore, M = window.PostModalDidProducts, Picker = window.PostProductPicker;
      var fx = (ctx.fixtures || {}).data;
      var root = scrim.querySelector('.lc-prodpick');
      if (!S || !M || !Picker || !fx || !root) return;
      if (ctx.live) {
        S.persist(false);
        if (String(S.dealId()) !== String(fx.dealId)) S.use(fx.dealId);
        M.use();
      } else {
        /* копия собирается раньше, чем встаёт в документ: живое окно — это
           ещё единственный узел с этим id */
        var live = document.getElementById(scrim.id);
        if (live && live !== scrim) copyRows(live, scrim);
      }
      /* перерисовка ставит data — вернуть выбранное */
      root.setAttribute('data-state', st.state);
      Picker.mirror(scrim);
    }
  });
})();

/* ============================================================
   ProductsModal.demo.js — сценарий демо витрины для окна «Продукты».
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает
   этот файл последним.

   Что добавляет к общему демо (состояния из ProductsModal.css):
   - «Обновление» — CSS его не различает: его переводит в классы ДС
     скрипт окна (PostProductPicker.mirror), поэтому состояние объявляет
     сценарий;
   - колонки и заголовок — продукт ДИД сделки-образца из fixtures.json
     окна: доступные продукты слева, продукты ветки справа, обязательный
     единственный выключен. Рисует окно само (PostModalProducts.use) по
     ProductTreeStore — те же функции, что на странице сделки. Живое окно
     встроено в стенд: перенос ⇄ и двойной клик работают;
   - копии «Все состояния рядом» — снимок колонок и заголовка живого окна.
   ============================================================ */
(function () {
  'use strict';

  function copyRows(from, to) {
    ['available', 'selected'].forEach(function (k) {
      var sel = '[data-prodpick-list="' + k + '"]';
      var a = from.querySelector(sel), b = to.querySelector(sel);
      if (!a || !b) return;
      Array.prototype.slice.call(b.querySelectorAll('.prow')).forEach(function (el) { el.parentNode.removeChild(el); });
      Array.prototype.slice.call(a.querySelectorAll('.prow')).forEach(function (el) { b.appendChild(el.cloneNode(true)); });
    });
    var t = from.querySelector('.modal__title'), u = to.querySelector('.modal__title');
    if (t && u) u.textContent = t.textContent;
  }

  window.IBPKitDemo.register('ProductsModal', {
    states: ['updating'],
    apply: function (scrim, st, ctx) {
      var S = window.ProductTreeStore, M = window.PostModalProducts, Picker = window.PostProductPicker;
      var fx = (ctx.fixtures || {}).data;
      var root = scrim.querySelector('.lc-prodpick');
      if (!S || !M || !Picker || !fx || !root) return;
      if (ctx.live) {
        S.persist(false);
        if (String(S.dealId()) !== String(fx.dealId)) S.use(fx.dealId);
        var did = S.view().filter(function (n) { return n.code === fx.didCode; })[0] || S.view()[0];
        if (did) M.use(did.id);
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

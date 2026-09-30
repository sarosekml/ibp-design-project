/* ============================================================
   InstrumentsModal.demo.js — сценарий демо витрины для окна «Инструменты».
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает
   этот файл последним.

   Что добавляет к общему демо:
   - ось состояний. Своего CSS у окна нет — раскладку и состояния держит
     ProductsModal.css общего слоя, поэтому состояния объявляет сценарий:
     загрузка · данные · обновление;
   - колонки и заголовок — продукт сделки-образца из fixtures.json окна:
     доступные типы инструментов слева, инструменты продукта справа, с
     номерами; прикреплённый к ФИ выключен. Рисует окно само
     (PostModalInstruments.use) по ProductTreeStore — те же функции, что на
     странице сделки. Живое окно встроено в стенд: перенос ⇄ и двойной
     клик работают; витрина правки не сохраняет
     (ProductTreeStore.persist(false));
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

  window.IBPKitDemo.register('InstrumentsModal', {
    states: ['loading', 'updating'],
    apply: function (scrim, st, ctx) {
      var S = window.ProductTreeStore, M = window.PostModalInstruments, Picker = window.PostProductPicker;
      var fx = (ctx.fixtures || {}).data;
      var root = scrim.querySelector('.lc-prodpick');
      if (!S || !M || !Picker || !fx || !root) return;
      if (ctx.live) {
        S.persist(false);
        if (String(S.dealId()) !== String(fx.dealId)) S.use(fx.dealId);
        var did = S.view().filter(function (n) { return n.code === fx.didCode; })[0] || S.view()[0];
        var product = did && (did.children.filter(function (p) { return p.code === fx.productCode; })[0] || did.children[0]);
        if (product) M.use(product.id);
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

/* ============================================================
   LinkChangeModal.demo.js — сценарий демо витрины для окна «Изменить
   связь с ФИ». Пишется руками; страницу рядом собирает kit-build.mjs и
   подключает этот файл последним.

   Что добавляет к общему демо:
   - «Обновление» — сохранение идёт: CSS его не различает, его переводит в
     классы ДС скрипт окна (PostModalLinkChange.mirror), поэтому состояние
     объявляет сценарий;
   - заголовок и карточки ФИ — узел сделки-образца из fixtures.json и
     карточки ФИ этой сделки. Рисует окно само (PostModalLinkChange.use) по
     ProductTreeStore — те же функции, что на странице сделки. Живое окно
     встроено в стенд: выбор карточек кликом и клавишами работает (не
     больше двух); витрина правки не сохраняет
     (ProductTreeStore.persist(false));
   - копии «Все состояния рядом» — снимок заголовка и карточек живого окна.
   ============================================================ */
(function () {
  'use strict';

  function copy(from, to) {
    var a = from.querySelector('[data-link-list]'), b = to.querySelector('[data-link-list]');
    if (a && b) b.innerHTML = a.innerHTML;
    var t = from.querySelector('.modal__title'), u = to.querySelector('.modal__title');
    if (t && u) u.textContent = t.textContent;
  }

  window.IBPKitDemo.register('LinkChangeModal', {
    states: ['updating'],
    apply: function (scrim, st, ctx) {
      var S = window.ProductTreeStore, M = window.PostModalLinkChange;
      var fx = (ctx.fixtures || {}).data;
      var root = scrim.querySelector('.lc-fi-link');
      if (!S || !M || !fx || !root) return;
      if (ctx.live) {
        S.persist(false);
        if (String(S.dealId()) !== String(fx.dealId)) S.use(fx.dealId);
        M.use(fx.nodeId);
      } else {
        var live = document.getElementById(scrim.id);
        if (live && live !== scrim) copy(live, scrim);
      }
      root.setAttribute('data-state', st.state);
      M.mirror(scrim);
    }
  });
})();

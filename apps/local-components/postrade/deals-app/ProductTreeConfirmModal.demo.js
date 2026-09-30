/* ============================================================
   ProductTreeConfirmModal.demo.js — сценарий демо витрины для
   подтверждения действия над деревом продуктов. Пишется руками; страницу
   рядом собирает kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо:
   - контрол «Вариант»: удаление узла (заголовок «Подтвердите действие»,
     «Отменить» и «Подтвердить» в тоне error) или назначение основного
     продукта ДИД (заголовок «Подтверждение действия», одна кнопка);
   - текст — из узлов сделки-образца (fixtures.json), собирает его сам
     диалог: PostProductTreeConfirm.deleteText / mainText, рисует —
     PostProductTreeConfirm.paint. Витрина правки не сохраняет.
   ============================================================ */
(function () {
  'use strict';

  window.IBPKitDemo.register('ProductTreeConfirmModal', {
    controls: function (defs) {
      return defs.concat([{ key: 'variant', label: 'Вариант', value: 'delete',
        options: [['delete', 'Удаление узла'], ['main', 'Назначение основного']] }]);
    },
    apply: function (scrim, st, ctx) {
      var S = window.ProductTreeStore, C = window.PostProductTreeConfirm;
      var fx = (ctx.fixtures || {}).data;
      if (!S || !C || !fx) return;
      S.persist(false);
      if (String(S.dealId()) !== String(fx.dealId)) S.use(fx.dealId);
      var main = st.variant === 'main';
      var node = S.node(main ? fx.mainNodeId : fx.deleteNodeId);
      if (!node) return;
      C.paint(scrim, { variant: main ? 'main' : 'delete', text: main ? C.mainText(node) : C.deleteText(node) });
    }
  });
})();

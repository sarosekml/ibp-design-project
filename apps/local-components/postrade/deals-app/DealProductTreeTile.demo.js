/* ============================================================
   DealProductTreeTile.demo.js — сценарий демо витрины для тайла
   «Продукты сделки». Пишется руками; страницу рядом собирает
   kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо (состояния и режимы из CSS виджета):
   - дерево — сделки-образцы из fixtures.json тайла, а не пример из
     фрагмента: data (часть узлов прикреплена к ФИ), partial (значения
     второй строки не заполнены), empty (в просмотре — сделка без правки);
   - «Заполнено частично» — состояние, которое CSS не различает: разметка
     та же, отличаются данные;
   - контрол «Пример дерева» — три стадии макета для «Данные есть»,
     «Загрузка», «Обновление»: прикреплены к ФИ / без ФИ / длинные названия.
   Состояния ошибки нет (ответ человека 30.09.2026, 21).
   Витрина правки дерева не сохраняет: ProductTreeStore.persist(false).
   Деревья рисует DealProductTreeTile.js (PostTileProductTree.render) по
   ProductTreeStore — те же функции и тот же стор, что на странице сделки.

   Стор один на страницу, а «Все состояния рядом» показывают разные
   сделки. Поэтому виды всех сделок-образцов снимаются один раз, до того
   как живой тайл привязан к стору: смена сделки в сторе перерисовала бы
   живой тайл. Живой тайл связан со стором (PostTileProductTree.bind) —
   звезда, «Удалить», транш и окна работают, как на странице; копии —
   снимки.
   ============================================================ */
(function () {
  'use strict';

  var views = null;
  var bound = false;

  function dealOf(st, fx) {
    if (st.state === 'empty') return st.mode === 'view' && fx.empty.viewDealId ? fx.empty.viewDealId : fx.empty.dealId;
    if (st.state === 'partial') return fx.partial.dealId;
    return (fx[st.tree] || fx.data).dealId;
  }

  function snapshot(S, fx) {
    if (views) return;
    views = {};
    Object.keys(fx).forEach(function (k) {
      [fx[k] && fx[k].dealId, fx[k] && fx[k].viewDealId].forEach(function (id) {
        if (id == null || views[id]) return;
        S.use(id);
        views[id] = S.view();
      });
    });
  }

  /* Явное состояние — только у тех, что не выводятся из данных: загрузка,
     обновление. Остальные render выводит сам (stateOf). */
  function opts(st) {
    var o = { mode: st.mode };
    if (st.state === 'loading' || st.state === 'updating') o.state = st.state;
    return o;
  }

  if (window.ProductTreeStore) window.ProductTreeStore.persist(false);

  window.IBPKitDemo.register('DealProductTreeTile', {
    states: ['partial'],
    controls: function (defs) {
      return defs.concat([{ key: 'tree', label: 'Пример дерева', value: 'data',
        options: [['data', 'Прикреплены к ФИ'], ['instruments', 'Без прикрепления к ФИ'], ['long', 'Длинные названия']] }]);
    },
    apply: function (tile, st, ctx) {
      var T = window.PostTileProductTree, S = window.ProductTreeStore;
      var fx = ctx.fixtures || {};
      if (!T || !S || !fx.data) return;
      snapshot(S, fx);
      var id = dealOf(st, fx);
      if (!ctx.live) { T.render(tile, views[id], opts(st)); return; }
      if (String(S.dealId()) !== String(id)) S.use(id);
      if (!bound) { T.bind(tile, S); bound = true; }
      T.render(tile, S.view(), opts(st));
    }
  });
})();

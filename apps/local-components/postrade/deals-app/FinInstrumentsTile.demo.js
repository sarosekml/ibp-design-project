/* ============================================================
   FinInstrumentsTile.demo.js — сценарий демо витрины для тайла
   «Финансовые инструменты». Пишется руками; страницу рядом собирает
   kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо (состояния и режимы из CSS виджета):
   - карточки — сделки-образцы из fixtures.json тайла, а не пример из
     фрагмента: data (1027, в просмотре — 1024), empty (1026 — есть что
     генерировать; в просмотре — 1042);
   - «Заполнено частично» — состояние, которое CSS не различает: разметка
     та же, отличаются данные (у карточек 1027 есть прочерки);
   - «Загрузка» и «Обновление» — на карточках сделки data.
   Витрина правки не сохраняет: FinInstrumentsStore.persist(false),
   ProductTreeStore.persist(false). Карточки рисует FinInstrumentsTile.js
   (PostTileFinInstruments.render) по FinInstrumentsStore — те же функции и
   тот же стор, что на странице сделки.

   Стор один на страницу, а «Все состояния рядом» показывают разные
   сделки. Поэтому виды всех сделок-образцов снимаются один раз, до того
   как живой тайл привязан к стору. Живой тайл связан со стором
   (PostTileFinInstruments.bind) — вкладки, сворачивание, «Сгенерировать
   автоматически» и окна работают, как на странице; копии — снимки.
   ============================================================ */
(function () {
  'use strict';

  var views = null;
  var bound = false;

  function dealOf(st, fx) {
    var k = st.state === 'empty' ? 'empty' : 'data';
    var f = fx[k] || {};
    return st.mode === 'view' && f.viewDealId ? f.viewDealId : f.dealId;
  }

  function open(id) {
    window.ProductTreeStore.use(id);
    window.FinInstrumentsStore.use(id);
  }

  function snapshot(fx) {
    if (views) return;
    views = {};
    Object.keys(fx).forEach(function (k) {
      [fx[k] && fx[k].dealId, fx[k] && fx[k].viewDealId].forEach(function (id) {
        if (id == null || views[id]) return;
        open(id);
        var S = window.FinInstrumentsStore;
        views[id] = { cards: S.view(), gen: S.generatable().length > 0 };
      });
    });
  }

  /* Явное состояние — только у тех, что не выводятся из данных: загрузка,
     обновление. Остальные render выводит сам (stateOf). */
  function opts(st, gen) {
    var o = { mode: st.mode, canGenerate: gen };
    if (st.state === 'loading' || st.state === 'updating') o.state = st.state;
    return o;
  }

  if (window.FinInstrumentsStore) window.FinInstrumentsStore.persist(false);
  if (window.ProductTreeStore) window.ProductTreeStore.persist(false);

  window.IBPKitDemo.register('FinInstrumentsTile', {
    states: ['partial'],
    apply: function (tile, st, ctx) {
      var T = window.PostTileFinInstruments, S = window.FinInstrumentsStore;
      var fx = ctx.fixtures || {};
      if (!T || !S || !window.ProductTreeStore || !fx.data) return;
      snapshot(fx);
      var id = dealOf(st, fx);
      if (!ctx.live) { T.render(tile, views[id].cards, opts(st, views[id].gen)); return; }
      if (String(S.dealId()) !== String(id)) open(id);
      if (!bound) { T.bind(tile, S); T.watchTabs(tile); bound = true; }
      T.render(tile, S.view(), opts(st, S.generatable().length > 0));
    }
  });
})();

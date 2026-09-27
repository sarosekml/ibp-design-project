/* ============================================================
   DealFinancialMetricsTile.demo.js — сценарий демо витрины для тайла
   «Финансовые метрики сделки». Пишется руками; страницу рядом собирает
   kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо (состояния из CSS виджета):
   - метрики — из fixtures.json тайла: data (без PE) и pe (с PE);
   - свои контролы: «Есть Private Equity», «ВБС рассчитывается», число
     продуктов в баре (1–5 и 7 — макет «Состояния лайн чарта»; семь —
     больше пяти, «Показать ещё 2») и «Δ переоценки отрицательная» — как в
     витрине окна.
   Рисует PostTileDealFinMetrics.render — та же функция, что на странице
   сделки, поэтому разметка бара и полей одна.
   ============================================================ */
(function () {
  'use strict';

  function copy(o) { return JSON.parse(JSON.stringify(o)); }

  window.IBPKitDemo.register('DealFinancialMetricsTile', {
    controls: function (defs) {
      return defs.concat([
        { key: 'pe', label: 'Есть Private Equity', bool: true, value: true },
        { key: 'calc', label: 'ВБС рассчитывается', bool: true, value: false },
        { key: 'segments', label: 'Строк в баре ВБС', value: '3',
          options: [['1', '1 строка'], ['2', '2 строки'], ['3', '3 строки'], ['4', '4 строки'], ['5', '5 строк'], ['7', '7 строк']] },
        { key: 'negative', label: 'Δ переоценки отрицательная', bool: true, value: false }
      ]);
    },
    apply: function (tile, st, ctx) {
      var fx = ctx.fixtures || {};
      var T = window.PostTileDealFinMetrics;
      if (!T || !fx.data) return;
      /* подписи кодов — из данных приложения; нет их на странице — из фикстур */
      if (!window.DEAL_FIN_METRICS_LABELS && fx.labels) window.DEAL_FIN_METRICS_LABELS = fx.labels;
      /* Загрузка, «Нет данных» и ошибка — как во фрагменте: их показывает CSS. */
      if (st.state !== 'data') return;
      var m = copy(st.pe ? fx.pe : fx.data);
      delete m._;
      if (fx.segments && fx.segments[st.segments]) m.vbs = copy(fx.segments[st.segments]);
      if (st.calc) m.vbs.calcStatus = 'CALCULATING';
      if (st.negative && m.peRevaluation) m.peRevaluation.revaluationDelta = -Math.abs(m.peRevaluation.revaluationDelta);
      T.render(tile, m);
    }
  });
})();

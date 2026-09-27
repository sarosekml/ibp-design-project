/* ============================================================
   DealFinancialMetricsModal.demo.js — сценарий демо витрины для окна
   «Финансовые метрики сделки». Пишется руками; страницу рядом собирает
   kit-build.mjs и подключает этот файл последним.

   Окно одно, состояний данных у него нет — есть варианты состава. Их
   переключают контролы «Конструктора» (решение человека 25.09.2026):
   - «Есть Private Equity» — раздел «Переоценка по PE» есть / нет;
   - «Строк в баре ВБС» — 1–5 и 7 продуктов (семь — «Показать ещё 2»);
   - «ОСЗ рассчитывается» — плашка «Данные рассчитываются» вместо бара ОСЗ;
   - «Δ переоценки отрицательная» — знак у сводки PE и у строк ФИ;
   - «Есть просроченная задолженность» — иконка-предупреждение у ОСЗ.
   Метрики — из fixtures.json окна; рисует PostDealFinMetricsModal.render —
   та же функция, что на странице сделки. Раскрытый раздел при переключении
   остаётся раскрытым: разделы сворачивает открытие окна, а не отрисовка.
   ============================================================ */
(function () {
  'use strict';

  function copy(o) { return JSON.parse(JSON.stringify(o)); }

  window.IBPKitDemo.register('DealFinancialMetricsModal', {
    controls: function (defs) {
      return defs.concat([
        { key: 'pe', label: 'Есть Private Equity', bool: true, value: true },
        { key: 'segments', label: 'Строк в баре ВБС', value: '3',
          options: [['1', '1 строка'], ['2', '2 строки'], ['3', '3 строки'], ['4', '4 строки'], ['5', '5 строк'], ['7', '7 строк']] },
        { key: 'oszCalc', label: 'ОСЗ рассчитывается', bool: true, value: false },
        { key: 'negative', label: 'Δ переоценки отрицательная', bool: true, value: false },
        { key: 'overdue', label: 'Есть просроченная задолженность', bool: true, value: true }
      ]);
    },
    apply: function (scrim, st, ctx) {
      var fx = ctx.fixtures || {};
      var M = window.PostDealFinMetricsModal;
      if (!M || !fx.data) return;
      /* подписи кодов — из данных приложения; нет их на странице — из фикстур */
      if (!window.DEAL_FIN_METRICS_LABELS && fx.labels) window.DEAL_FIN_METRICS_LABELS = fx.labels;

      var m = copy(fx.data);
      if (fx.segments && fx.segments[st.segments]) m.vbs = copy(fx.segments[st.segments]);
      if (m.osz) {
        m.osz.calcStatus = st.oszCalc ? 'CALCULATING' : 'READY';
        m.osz.overdueAmount = st.overdue ? (fx.overdueAmount || 0) : 0;
      }
      if (!st.pe) delete m.peRevaluation;
      else if (m.peRevaluation && st.negative) {
        m.peRevaluation.revaluationDelta = -Math.abs(m.peRevaluation.revaluationDelta);
        (m.peRevaluation.instruments || []).forEach(function (r) { r.revaluationDelta = -Math.abs(r.revaluationDelta); });
      }
      M.render(scrim, m);
    }
  });
})();

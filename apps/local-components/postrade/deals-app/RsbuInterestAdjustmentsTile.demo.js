/* ============================================================
   RsbuInterestAdjustmentsTile.demo.js — сценарий демо витрины для тайла
   «Корректировки процентов РСБУ». Пишется руками; страницу рядом собирает
   kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо (оси данных и прав — из CSS виджета):
   - третья ось «Условия» — выполнены (процентные платежи рассчитаны) или
     нет («Требуется расчёт…»); свой контрол, атрибут data-calc;
   - подписи осей словами задачи: есть / нет данных, редактирование
     доступно / недоступно;
   - пробный вид «Все состояния» в зоне демо (gallery): пять копий — четыре
     сочетания данных и прав при выполненных условиях и одна «Условия не
     выполнены» (данные и права на неё не влияют);
   - рисует PostTileRsbuAdjustments.render — та же функция, что на странице
     транша; число корректировок — из fixtures.json. Ссылки тайла в витрине
     ведут в «#»: страницы корректировок рядом нет.
   ============================================================ */
(function () {
  'use strict';

  var CALC = { done: 'Условия выполнены', required: 'Условия не выполнены' };
  var LABELS = {
    data: 'Есть данные', empty: 'Нет данных',
    edit: 'Редактирование доступно', view: 'Редактирование недоступно'
  };

  window.IBPKitDemo.register('RsbuInterestAdjustmentsTile', {
    labels: LABELS,
    gallery: true,
    controls: function (defs) {
      return defs.concat([
        { key: 'calc', label: 'Условия', value: 'done',
          options: [['done', 'Выполнены'], ['required', 'Не выполнены']] }
      ]);
    },
    cases: function () {
      var out = [];
      ['data', 'empty'].forEach(function (s) {
        ['edit', 'view'].forEach(function (m) {
          out.push({ label: [CALC.done, LABELS[s], LABELS[m]].join(' · '), st: { calc: 'done', state: s, mode: m } });
        });
      });
      out.push({ label: CALC.required + ' — данные и права на вид не влияют', st: { calc: 'required', state: 'empty', mode: 'edit' } });
      return out;
    },
    apply: function (tile, st, ctx) {
      var T = window.PostTileRsbuAdjustments;
      if (!T) return;
      var fx = ctx.fixtures || {};
      var view = st.calc === 'required' ? 'locked' : (st.state === 'data' ? 'filled' : 'none');
      var rec = fx[view] || {};
      T.render(tile, { state: view, mode: st.mode, count: rec.count });
      tile.querySelectorAll('a[href]').forEach(function (a) { a.setAttribute('href', '#'); });
    }
  });
})();

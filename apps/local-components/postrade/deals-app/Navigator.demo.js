/* ============================================================
   Navigator.demo.js — сценарий демо витрины для тайла «Заведение сделки».
   Пишется руками; страницу рядом собирает kit-build.mjs и подключает этот
   файл последним.

   Что добавляет к общему демо (состояния данных — из CSS виджета):
   - «Этап процесса» — состояние записи сделки из fixtures.json тайла:
     черновик, ожидает подтверждения, корректировка, активная, ввод и
     подтверждение изменений, погашена, этапы мониторинга;
   - ширина по умолчанию — 320px, как у правой колонки страницы сделки
     (pages/Deal.html, .gen__side): тайл стоит вне сетки, и витрина не
     выводит ширину из класса col-N метки.
   Вкладку переключают в самом демо; выбор этапа открывает вкладку из
   фикстуры, остальные контролы открытую вкладку не сбрасывают.
   Рисует и переводит статусы PostNavigator.bind — та же функция, что на
   странице сделки. Переходы работают на копии записи: кнопки и пункты кебаба
   меняют статусы в демо, правки не сохраняются и сбрасываются выбором этапа.
   ============================================================ */
(function () {
  'use strict';

  var PAGE_WIDTH = 320;

  function copy(o) { return JSON.parse(JSON.stringify(o)); }

  var STAGES = [
    ['draft', 'Черновик'],
    ['awaiting', 'Ожидает подтверждения'],
    ['correction', 'Корректировка'],
    ['active', 'Активная'],
    ['changesInput', 'Ввод изменений'],
    ['changesConfirm', 'Подтверждение изменений'],
    ['repaid', 'Погашена'],
    ['monAwaitingTransfer', 'Мониторинг: ожидает передачи'],
    ['monSentToTransfer', 'Мониторинг: направлена на передачу'],
    ['monTransferred', 'Мониторинг: передана, РМ принял'],
    ['monOnMonitoring', 'Мониторинг: на мониторинге ГК СБИ']
  ];

  window.IBPKitDemo.register('Navigator', {
    controls: function (defs) {
      defs.forEach(function (d) { if (d.key === 'width') d.value = PAGE_WIDTH; });
      return defs.concat([
        { key: 'stage', label: 'Этап процесса', value: 'draft', options: STAGES }
      ]);
    },
    apply: function (tile, st, ctx) {
      var fx = ctx.fixtures || {};
      var N = window.PostNavigator;
      if (!N || !fx.draft) return;
      /* Загрузка и ошибка — как во фрагменте: их показывает CSS. */
      if (st.state !== 'data') return;
      /* Тот же этап (сдвинули ширину, сменили режим) — запись с переходами и
         открытая вкладка остаются; новый этап — свежая копия фикстуры. */
      var demo = tile.__navDemo;
      if (!demo || demo.stage !== st.stage) {
        var fresh = copy(fx[st.stage] || fx.draft);
        delete fresh._;
        demo = tile.__navDemo = { stage: st.stage, rec: fresh };
        tile.__navLane = fresh.lane || 'deal';
      }
      var rec = demo.rec;
      var nav = N.bind(tile, {
        get: function () { return rec; },
        save: function (patch) { Object.assign(rec, patch); nav.paint(); },
        progress: function () { return rec.progress || []; }
      });
    }
  });
})();

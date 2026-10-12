/* ============================================================
   NavigatorAppointmentOfResponsibleModal.demo.js — сценарий демо витрины
   для окна «Назначение ответственного». Пишется руками; страницу рядом
   собирает kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо:
   - состояние «Данных нет»: сделка без ГСЗ — прочерк в поле ГСЗ и пустое
     состояние таблицы. CSS окна его не различает (та же разметка, другие
     данные), поэтому состояние объявляет сценарий;
   - рисует окно функцией самого окна (PostNavigatorModals…use) по срезу
     записи сделки из fixtures.json; таблица — другие сделки той же ГСЗ из
     DealsStore, как на странице. «Назначить» на витрине ничего не пишет;
   - копии «Все состояния рядом» рисуются той же функцией окна.
   ============================================================ */
(function () {
  'use strict';

  var NAME = 'NavigatorAppointmentOfResponsibleModal';
  var liveDeal = null;

  window.IBPKitDemo.register(NAME, {
    states: ['data', 'empty'],
    apply: function (scrim, st, ctx) {
      var M = (window.PostNavigatorModals || {})[NAME];
      var fx = (ctx.fixtures || {})[st.state === 'empty' ? 'empty' : 'data'];
      if (!M || !fx) return;
      if (ctx.live) { liveDeal = fx.deal; M.use({ deal: fx.deal }); return; }
      /* копия: окно держит ссылки на живые узлы, поэтому копия — снимок
         живого окна, нарисованного под её состояние; потом живое окно
         возвращается к своему */
      var live = document.getElementById(scrim.id);
      if (!live || live === scrim) return;
      M.use({ deal: fx.deal });
      var from = live.querySelector('.modal__body'), to = scrim.querySelector('.modal__body');
      if (from && to) to.innerHTML = from.innerHTML;
      var a = live.querySelector('.inp__control'), b = scrim.querySelector('.inp__control');
      if (a && b) b.value = a.value;
      if (liveDeal) M.use({ deal: liveDeal });
    }
  });
})();

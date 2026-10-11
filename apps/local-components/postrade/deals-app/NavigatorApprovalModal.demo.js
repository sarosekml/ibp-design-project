/* ============================================================
   NavigatorApprovalModal.demo.js — сценарий демо витрины для окна
   «Подтвердите действие» (приём на мониторинг). Пишется руками; страницу
   рядом собирает kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо:
   - контрол «Подразделение»: РМ, ПМ или ПМЗ — вариант окна; у ПМЗ над полями
     Switch «С обеспечением». Переход модели на каждое подразделение — из
     fixtures.json, окно выбирает вариант по нему само (PostNavigator.markOf);
   - контрол «Длинные значения»: отметки всех трёх подразделений с самым
     длинным ФИО справочника;
   - рисует окно функцией самого окна (PostNavigatorModals…use) по срезу
     записи сделки; «Сохранить» на витрине ничего не пишет — тайла нет;
   - копии «Все состояния рядом» — снимок варианта и полей живого окна.
   ============================================================ */
(function () {
  'use strict';

  var NAME = 'NavigatorApprovalModal';

  function copy(from, to) {
    var a = from.querySelector('.lc-nav-approval'), b = to.querySelector('.lc-nav-approval');
    if (a && b) b.setAttribute('data-variant', a.getAttribute('data-variant'));
    var fa = from.querySelectorAll('.inp__control, .sw__input'), fb = to.querySelectorAll('.inp__control, .sw__input');
    fa.forEach(function (el, i) {
      if (!fb[i]) return;
      if (el.type === 'checkbox') fb[i].checked = el.checked;
      else fb[i].value = el.value;
    });
  }

  window.IBPKitDemo.register(NAME, {
    controls: function (defs) {
      return defs.concat([
        { key: 'variant', label: 'Подразделение', value: 'rm',
          options: [['rm', 'РМ'], ['pm', 'ПМ'], ['pmz', 'ПМЗ']] },
        { key: 'long', label: 'Длинные значения', bool: true, value: false }
      ]);
    },
    apply: function (scrim, st, ctx) {
      var M = (window.PostNavigatorModals || {})[NAME];
      var model = window.DEAL_STATUS_MODEL;
      var fx = (ctx.fixtures || {})[st.long ? 'long' : 'data'];
      if (!M || !model || !fx) return;
      if (ctx.live) {
        var tid = fx.transitions[st.variant] || fx.transitions.rm;
        var transition = null;
        model.transitions.forEach(function (t) { if (t.id === tid) transition = t; });
        M.use({ deal: fx.deal, transition: transition });
      } else {
        /* копия ещё не в документе и без суффикса id — по id находится живое окно */
        var live = document.getElementById(scrim.id);
        if (live && live !== scrim) copy(live, scrim);
      }
    }
  });
})();

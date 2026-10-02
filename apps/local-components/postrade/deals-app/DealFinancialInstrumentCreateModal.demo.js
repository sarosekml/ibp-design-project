/* ============================================================
   DealFinancialInstrumentCreateModal.demo.js — сценарий демо витрины для
   окна «Создание финансового инструмента». Пишется руками; страницу рядом
   собирает kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо:
   - контрол «Вид»: заполненное окно макета (fixtures.json, data), пустое —
     как оно открывается из тайла, и ошибка — «Сохранить» на пустом окне
     подсвечивает оба поля;
   - значения ставит само окно (PostModalFinInstrumentCreate.use) — те же
     функции, что на странице сделки. Витрина правки не сохраняет
     (FinInstrumentsStore.persist(false));
   - копии «Все состояния рядом» — снимок значений и ошибок живого окна.
   ============================================================ */
(function () {
  'use strict';

  function copy(from, to) {
    var a = from.querySelectorAll('.inp'), b = to.querySelectorAll('.inp');
    Array.prototype.forEach.call(a, function (inp, i) {
      if (!b[i]) return;
      b[i].classList.toggle('inp--error', inp.classList.contains('inp--error'));
      var x = inp.querySelector('.inp__control'), y = b[i].querySelector('.inp__control');
      if (x && y) y.value = x.value;
    });
  }

  window.IBPKitDemo.register('DealFinancialInstrumentCreateModal', {
    controls: function (defs) {
      return defs.concat([{ key: 'view', label: 'Вид', value: 'data',
        options: [['data', 'Заполнено (макет)'], ['empty', 'Пусто'], ['error', 'Ошибка — не выбраны поля']] }]);
    },
    apply: function (scrim, st, ctx) {
      var M = window.PostModalFinInstrumentCreate;
      var fx = ctx.fixtures || {};
      if (!M) return;
      if (ctx.live) {
        if (window.FinInstrumentsStore) window.FinInstrumentsStore.persist(false);
        M.use(st.view === 'data' ? fx.data : null);
        if (st.view === 'error') {
          var save = scrim.querySelector('[data-fi-create-save]');
          if (save) save.click();
        }
      } else {
        var live = document.getElementById(scrim.id);
        if (live && live !== scrim) copy(live, scrim);
      }
    }
  });
})();

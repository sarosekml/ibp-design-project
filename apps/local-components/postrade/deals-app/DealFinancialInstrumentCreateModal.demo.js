/* ============================================================
   DealFinancialInstrumentCreateModal.demo.js — сценарий демо витрины для
   окна «Создание финансового инструмента». Пишется руками; страницу рядом
   собирает kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо:
   - состояния данных «Заполнено / Пусто / Ошибка» — осью state, а не своим
     контролом «Вид»: CSS окна их не различает, поэтому список состояний
     задаёт сценарий. Заполнено — окно макета (fixtures.json, data), пусто —
     как оно открывается из тайла, ошибка — «Сохранить» на пустом окне
     подсвечивает оба поля;
   - значения ставит само окно (PostModalFinInstrumentCreate.use) — те же
     функции, что на странице сделки. Витрина правки не сохраняет
     (FinInstrumentsStore.persist(false));
   - копии «Все состояния рядом» — снимок: окно привязано к живому скриму,
     копию рисуем напрямую по st.state (в фикстуре состояние — это значения
     полей, а не разметка).
   ============================================================ */
(function () {
  'use strict';

  function renderCopy(el, st) {
    var err = st.state === 'error';
    ['fi-create-type', 'fi-create-reporting'].forEach(function (id) {
      var inp = el.querySelector('#' + id);
      if (!inp) return;
      /* «Данные есть» — как во фрагменте (пример макета); пусто и ошибка —
         поля очищены, у ошибки оба поля подсвечены. */
      if (st.state !== 'data') inp.value = '';
      var field = inp.closest('.inp');
      if (field) field.classList.toggle('inp--error', err);
      if (err) inp.setAttribute('aria-invalid', 'true');
      else inp.removeAttribute('aria-invalid');
    });
  }

  window.IBPKitDemo.register('DealFinancialInstrumentCreateModal', {
    states: ['data', 'empty', 'error'],
    apply: function (scrim, st, ctx) {
      var M = window.PostModalFinInstrumentCreate;
      var fx = ctx.fixtures || {};
      if (!ctx.live) { renderCopy(scrim, st); return; }
      if (!M) return;
      if (window.FinInstrumentsStore) window.FinInstrumentsStore.persist(false);
      M.use(st.state === 'data' ? fx.data : null);
      if (st.state === 'error') {
        var save = scrim.querySelector('[data-fi-create-save]');
        if (save) save.click();
      }
    }
  });
})();

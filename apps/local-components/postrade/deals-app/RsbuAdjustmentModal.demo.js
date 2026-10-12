/* ============================================================
   RsbuAdjustmentModal.demo.js — сценарий демо витрины для окна внесения
   корректировки. Пишется руками; страницу рядом собирает kit-build.mjs и
   подключает этот файл последним.

   Что добавляет к общему демо:
   - состояния данных «Пусто / Заполнено / Ошибка» — осью state, а не своим
     контролом: CSS окна их не различает, поэтому список состояний задаёт
     сценарий. Пусто — новая корректировка (кнопка «Добавить»), заполнено —
     правка корректировки из fixtures.json (кнопка «Сохранить»), ошибка —
     «Добавить» на пустой форме подсвечивает поля и показывает Alert;
   - значения и проверку ведёт само окно (PostModalRsbuAdjustment.bind) — те
     же функции, что на странице корректировок;
   - копии «Все состояния рядом» — снимок: окно привязано к живому скриму,
     копию рисуем напрямую по st.state.
   ============================================================ */
(function () {
  'use strict';

  function isoToRu(iso) { var p = String(iso).split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }
  function money(n) {
    var p = Number(n).toFixed(2).split('.');
    return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ',' + p[1];
  }

  function renderCopy(el, st, fx) {
    var rec = st.state === 'data' ? fx.edit : null;
    var set = function (name, v) { var c = el.querySelector('[name="' + name + '"]'); if (c) c.value = v; };
    set('startDate', rec ? isoToRu(rec.startDate) : '');
    set('endDate', rec ? isoToRu(rec.endDate) : '');
    set('adjustmentAmount', rec ? money(rec.adjustmentAmount) : '');
    set('comment', rec ? rec.comment : '');
    var title = el.querySelector('.modal__title');
    if (title) title.textContent = rec ? 'Редактирование корректировки' : 'Новая корректировка';
    var label = el.querySelector('[data-rsbu-submit] .btn__label');
    if (label) label.textContent = rec ? 'Сохранить' : 'Добавить';
    var err = st.state === 'error';
    ['startDate', 'endDate', 'adjustmentAmount'].forEach(function (k) {
      var c = el.querySelector('[name="' + k + '"]');
      var box = c && c.closest('.inp');
      if (box) box.classList.toggle('inp--error', err);
    });
    var alertBox = el.querySelector('.modal__alert');
    if (alertBox) alertBox.hidden = !err;
    var text = el.querySelector('.alert__text');
    if (text && err) text.textContent = 'Выберите исходную дату, введите целевую дату в формате ДД.ММ.ГГГГ и сумму корректировки числом.';
  }

  window.IBPKitDemo.register('RsbuAdjustmentModal', {
    states: ['empty', 'data', 'error'],
    apply: function (scrim, st, ctx) {
      var fx = ctx.fixtures || {};
      if (!ctx.live) { renderCopy(scrim, st, fx); return; }
      var M = window.PostModalRsbuAdjustment;
      if (!M || !fx.options) return;
      var api = M.bind(scrim, { options: function () { return fx.options; } });
      api.fill(st.state === 'data' ? fx.edit : null);
      if (st.state === 'error') {
        var submit = scrim.querySelector('[data-rsbu-submit]');
        if (submit) submit.click();
      }
    }
  });
})();

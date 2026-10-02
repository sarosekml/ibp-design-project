/* ============================================================
   CounterpartiesTile.demo.js — сценарий демо витрины для тайла
   «Контрагенты» (на странице сделки — «КНР»). Пишется руками; страницу
   рядом собирает kit-build.mjs и подключает этот файл последним.

   Что добавляет к общему демо (состояния и режимы из CSS виджета):
   - строки КНР — из fixtures.json тайла, а не пример из фрагмента: data,
     partial (рейтинг не рассчитан) и long (длинные значения);
   - текст ошибки — из fixtures.json → error.
   Строки рисует CounterpartiesTile.js (PostTileKNR.rowsHTML) — та же
   функция, что на странице сделки, поэтому разметка строки одна.
   ============================================================ */
(function () {
  'use strict';

  /* Фикстуры держат плоскую запись контрагента, rowsHTML ждёт { name, risk }.
     Рейтинг не рассчитан (нет ни рейтинга, ни зоны) — risk: null, чип без данных. */
  function rows(list) {
    return (list || []).map(function (k) {
      var none = k.rating == null && !k.zone;
      return {
        name: k.name,
        risk: none ? null : { rating: k.rating, zone: k.zone, ratingDate: k.ratingDate, zoneDate: k.zoneDate, segment: k.segment, profile: k.profile }
      };
    });
  }

  window.IBPKitDemo.register('CounterpartiesTile', {
    /* «Заполнено частично» CSS тайла не различает: разметка та же, что у
       «Данные есть», отличаются данные — рейтинг не рассчитан. */
    states: ['partial'],
    controls: function (defs) {
      return defs.concat([{ key: 'long', label: 'Длинные значения', bool: true, value: false }]);
    },
    apply: function (tile, st, ctx) {
      var fx = ctx.fixtures;
      var pick = st.state === 'partial' ? fx.partial : (st.long ? fx.long : fx.data);
      var box = tile.querySelector('.lc-knr__list');
      if (box && pick && window.PostTileKNR) {
        Array.prototype.slice.call(box.children).forEach(function (el) {
          if (!el.classList.contains('lc-knr__head')) box.removeChild(el);
        });
        box.insertAdjacentHTML('beforeend', window.PostTileKNR.rowsHTML(rows(pick.knr)));
      }
      if (fx.error) {
        var title = tile.querySelector('.lc-knr__error .alert__title');
        var text = tile.querySelector('.lc-knr__error .alert__text');
        if (title) title.textContent = fx.error.title;
        if (text) text.textContent = fx.error.message;
      }
    }
  });
})();

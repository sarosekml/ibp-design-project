/* ============================================================
   CounterpartyCard.demo.js — сценарий демо витрины для «Карточки
   контрагента». Пишется руками; страницу рядом собирает kit-build.mjs и
   подключает этот файл последним.

   Фрагмент карточки — эталон в <template> с пустыми слотами: карточки по
   нему рисует потребитель из своего стора. Общее демо показало бы пустую
   карточку, поэтому здесь её рисует CounterpartyCard.js
   (PostCardCounterparty.render) — та же функция, что в окне КНР, — по
   записям из fixtures.json карточки:
     юрлицо: участник сделки — data, найден — partial;
     физлицо: участник — member, найден — found;
     длинные значения — long.
   ============================================================ */
(function () {
  'use strict';

  function pick(fx, st) {
    if (st.long) return fx.long;
    if (st.kind === 'fl') return st.state === 'member' ? fx.member : fx.found;
    return st.state === 'member' ? fx.data : fx.partial;
  }

  window.IBPKitDemo.register('CounterpartyCard', {
    /* «Участник сделки» CSS различает только через отсутствие правил
       «найден», поэтому ось состояний дополняется здесь. */
    states: ['member'],
    /* Подписи своих состояний — здесь, а не в общем рантайме (раздел 3 канона). */
    labels: { found: 'Найден в поиске', member: 'Участник сделки' },
    controls: function (defs) {
      return defs.concat([
        { key: 'kind', label: 'Вид контрагента', options: [['ul', 'Юрлицо'], ['fl', 'Физлицо']], value: 'ul' },
        { key: 'long', label: 'Длинные значения', bool: true, value: false }
      ]);
    },
    /* Рендер отдаёт новый узел, а демо держит свой: переносим в него
       атрибуты и содержимое отрисованной карточки. */
    apply: function (el, st, ctx) {
      var item = pick(ctx.fixtures, st);
      if (!item || !window.PostCardCounterparty) return;
      var card = window.PostCardCounterparty.render(
        Object.assign({}, item, { place: st.state === 'member' ? 'member' : 'found' }), { mode: st.mode });
      if (!card) return;
      Array.prototype.slice.call(el.attributes).forEach(function (a) { el.removeAttribute(a.name); });
      Array.prototype.slice.call(card.attributes).forEach(function (a) { el.setAttribute(a.name, a.value); });
      while (el.firstChild) el.removeChild(el.firstChild);
      while (card.firstChild) el.appendChild(card.firstChild);
    }
  });
})();

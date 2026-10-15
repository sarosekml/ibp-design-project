/* ============================================================
   DateBadge.js — блок даты из шаблона #lc-date-badge-tpl.

   API (window.LcDateBadge):
     render(iso, opts) → HTMLElement
       iso          — дата или дата-время ISO (2026-10-09, 2026-10-09T14:00)
       opts.weekday — вариант «день недели + дата»: ВТ / 13.10 (тайл встреч)
   Подписи месяца берёт у своего списка; формат даты — ДД.ММ.ГГГГ без года
   в узком блоке. Имена дней — строчными, верхний регистр даёт CSS.
   ============================================================ */
(function () {
  'use strict';

  var MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  var WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

  function render(iso, opts) {
    opts = opts || {};
    var tpl = document.getElementById('lc-date-badge-tpl');
    if (!tpl) { console.warn('DateBadge: нет шаблона #lc-date-badge-tpl — вшейте DateBadge.html меткой ds-include'); return document.createElement('span'); }
    var p = String(iso).slice(0, 10).split('-');
    var el = tpl.content.firstElementChild.cloneNode(true);
    if (opts.weekday) {
      var wd = new Date(+p[0], +p[1] - 1, +p[2]).getDay();
      el.querySelector('.lc-date__day').textContent = WEEKDAYS[wd];
      el.querySelector('.lc-date__month').textContent = p[2] + '.' + p[1];
      el.classList.add('lc-date--weekday');
    } else {
      el.querySelector('.lc-date__day').textContent = p[2];
      el.querySelector('.lc-date__month').textContent = MONTHS[+p[1] - 1];
    }
    el.setAttribute('aria-label', p[2] + '.' + p[1] + '.' + p[0]);
    return el;
  }

  window.LcDateBadge = { render: render };
})();

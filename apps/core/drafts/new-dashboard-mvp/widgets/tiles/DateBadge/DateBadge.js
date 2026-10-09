/* ============================================================
   DateBadge.js — блок даты «день + месяц» из шаблона #lc-date-badge-tpl.

   API (window.LcDateBadge):
     render(iso, opts) → HTMLElement
       iso        — дата или дата-время ISO (2026-10-09, 2026-10-09T14:00)
       opts.today — ISO сегодняшней даты; совпала — модификатор --today
   Подписи месяца и формат даты берёт у HomeStore.fmt, если он есть.
   ============================================================ */
(function () {
  'use strict';

  var MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  function render(iso, opts) {
    opts = opts || {};
    var tpl = document.getElementById('lc-date-badge-tpl');
    if (!tpl) { console.warn('DateBadge: нет шаблона #lc-date-badge-tpl — вшейте DateBadge.html меткой ds-include'); return document.createElement('span'); }
    var d = String(iso).slice(0, 10), p = d.split('-');
    var el = tpl.content.firstElementChild.cloneNode(true);
    el.querySelector('.lc-date__day').textContent = p[2];
    el.querySelector('.lc-date__month').textContent = MONTHS[+p[1] - 1];
    el.setAttribute('aria-label', p[2] + '.' + p[1] + '.' + p[0]);
    if (opts.today && opts.today === d) el.classList.add('lc-date--today');
    return el;
  }

  window.LcDateBadge = { render: render };
})();

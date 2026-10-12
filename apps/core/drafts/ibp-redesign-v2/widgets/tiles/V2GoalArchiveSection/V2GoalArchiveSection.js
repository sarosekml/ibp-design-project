/* V2GoalArchiveSection — архивы целей клиента.
   list(archives, openYear) → разметка секций «Архив YYYY» (раскрыта —
   openYear, остальные свёрнуты); render(host, { year, goals, open }) — одна
   секция. Сворачивание — рантайм Tile ДС (.tile__toggle). */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function html(a, open) {
    var card = document.getElementById('goal-archive-template').content.firstElementChild.cloneNode(true);
    render(card, { year: a.year, goals: a.goals, open: open });
    return card.outerHTML;
  }

  function list(archives, openYear) {
    return (archives || []).map(function (a) { return html(a, a.year === openYear); }).join('');
  }

  function render(host, opts) {
    if (!host || !opts) return;
    set(host, '[data-ga-title]', 'Архив ' + opts.year);
    var cards = host.querySelector('[data-ga-cards]');
    if (cards) cards.innerHTML = window.LcStratDialogueCard.list(opts.goals);
    var body = host.querySelector('.tile__collapsible'), toggle = host.querySelector('.tile__toggle');
    body.id = 'ga-' + opts.year;
    toggle.setAttribute('aria-controls', body.id);
    if (window.DSTile) window.DSTile.toggle(host, !opts.open);
  }

  window.LcGoalArchiveSection = { list: list, render: render };
})();

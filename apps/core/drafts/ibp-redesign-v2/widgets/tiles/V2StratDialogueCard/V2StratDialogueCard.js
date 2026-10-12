/* V2StratDialogueCard — карточка цели клиента.
   html(goal) → разметка карточки; list(goals) → сетка карточек;
   render(host, { goal }) — заполнить одну карточку (витрина).
   goal: {typeLabel, period, title, metric, value, comment, people:
   {fullName, role, initials}[]} (ClientGoalDto). */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function person(p) {
    return '<div class="entity entity--s"><div class="entity__lead"><span class="av av--circular av--s"><span class="av__text">' + esc(p.initials) + '</span></span></div>'
      + '<div class="entity__main"><div class="entity__titles"><div class="entity__labelrow"><span class="entity__label entity__label--truncate">' + esc(p.fullName) + '</span></div></div>'
      + '<div class="entity__subs"><span class="entity__subs-list">' + esc(p.role) + '</span></div></div></div>';
  }
  function field(label, value, full) {
    return '<div class="rof' + (full ? ' tile__grid-full' : '') + '"><span class="ds-label"><span class="ds-label__text">' + label + '</span></span>'
      + '<div class="rof__row"><span class="rof__value">' + esc(value || '–') + '</span></div></div>';
  }

  function html(g) {
    var card = document.getElementById('strat-dialogue-template').content.firstElementChild.cloneNode(true);
    render(card, { goal: g });
    return card.outerHTML;
  }

  function list(goals) {
    return '<div class="lc-strat-grid">' + (goals || []).map(html).join('') + '</div>';
  }

  function render(host, opts) {
    var g = opts && opts.goal;
    if (!host || !g) return;
    set(host, '[data-sc-type] .chip__label', g.typeLabel);
    set(host, '[data-sc-period]', g.period);
    set(host, '[data-sc-title]', g.title);
    set(host, '[data-sc-metric]', g.metric);
    set(host, '[data-sc-value]', g.value);
    set(host, '[data-sc-comment]', g.comment);
    var pl = host.querySelector('[data-sc-people]');
    if (pl) pl.innerHTML = (g.people || []).map(person).join('');
  }

  window.LcStratDialogueCard = { html: html, list: list, render: render };
})();

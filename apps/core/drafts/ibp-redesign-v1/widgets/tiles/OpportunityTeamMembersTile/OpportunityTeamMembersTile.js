/* OpportunityTeamMembersTile — заполнение тайла команды.
   render(host, { analysts, director, vp, regionalDirector, note, title }) —
   сотрудники (employeeId[] / employeeId); note — подпись-пояснение,
   title — заголовок («Команда сделки» / «Команда потенциала»). */
(function () {
  'use strict';

  function emp(id) { return window.IBPR ? window.IBPR.employee(id) : null; }

  function row(e, roleLabel, plus) {
    if (!e) return '';
    return '<div class="lc-opp-team__row">'
      + '<span class="av av--circular av--m"><span class="av__text">' + e.initials + '</span></span>'
      + '<span class="lc-opp-team__fio">' + e.fullName + (plus ? ' <span class="lc-opp-team__plus">+' + plus + '</span>' : '') + '</span>'
      + '<span class="lc-opp-team__role">' + roleLabel + '</span>'
      + '</div>';
  }

  function render(host, opts) {
    if (!opts) return;
    var body = host.querySelector('[data-team-body]');
    if (!body) return;
    if (opts.title) {
      var t = host.querySelector('.tile__title');
      if (t) t.textContent = opts.title;
    }
    if (opts.note) {
      var st = host.querySelector('.tile__subtitle');
      if (st) st.textContent = opts.note;
    }
    var first = emp(opts.analysts && opts.analysts[0]);
    var h = '';
    if (first) h += row(first, 'Аналитик', opts.analysts.length > 1 ? opts.analysts.length - 1 : 0);
    h += row(emp(opts.director), 'Директор');
    h += row(emp(opts.vp), 'VP');
    h += row(emp(opts.regionalDirector), 'Региональный директор');
    body.innerHTML = h;
  }

  window.LcOpportunityTeamMembersTile = { render: render };
})();

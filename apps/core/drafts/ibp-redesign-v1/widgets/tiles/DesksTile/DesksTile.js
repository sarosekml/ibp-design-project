/* DesksTile — заполнение тайла десков.
   render(host, { desks, note }) — desks: [{deskName, roleLabel}];
   note — пояснение (у сделки и клиента они разные). */
(function () {
  'use strict';

  function render(host, opts) {
    var desks = (opts && opts.desks) || [];
    var body = host.querySelector('[data-desks-body]');
    if (!body) return;
    var h = '<p class="lc-desks__note">' + ((opts && opts.note) || 'Сотрудники указанных ниже десков имеют доступ к этой сделке') + '</p>';
    h += '<ul class="lc-desks__list">' + desks.map(function (d) {
      return '<li class="lc-desks__row"><span class="lc-desks__name">' + d.deskName + '</span>'
        + (d.roleLabel ? '<span class="chip chip--xs"><span class="chip__label">' + d.roleLabel + '</span></span>' : '')
        + '</li>';
    }).join('') + '</ul>';
    body.innerHTML = h;
    if (window.dsIcons) window.dsIcons.apply(body);
  }

  window.LcDesksTile = { render: render };
})();

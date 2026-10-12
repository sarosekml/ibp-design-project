/* OpportunityConnectionsTile — заполнение тайла связей.
   render(host, { links, emptyText, title }) — links: [{label, href}];
   пусто — emptyText («Нет связанных сделок» / «Нет связанных сущностей»). */
(function () {
  'use strict';

  function render(host, opts) {
    if (!opts) return;
    var body = host.querySelector('[data-connections-body]');
    if (!body) return;
    if (opts.title) {
      var t = host.querySelector('.tile__title');
      if (t) t.textContent = opts.title;
    }
    var links = opts.links || [];
    body.innerHTML = links.length
      ? '<ul class="lc-opp-connections__list">' + links.map(function (l) {
          return '<li><a class="link link--accent link--m" href="' + (l.href || '#') + '">' + l.label + '</a></li>';
        }).join('') + '</ul>'
      : '<p class="lc-opp-connections__empty">' + (opts.emptyText || 'Нет связанных сделок') + '</p>';
  }

  window.LcOpportunityConnectionsTile = { render: render };
})();

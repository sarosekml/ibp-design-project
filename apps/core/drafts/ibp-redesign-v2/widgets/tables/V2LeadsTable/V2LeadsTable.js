/* =========================================================================
   V2LeadsTable.js — реестр лидов концепта ibp-redesign-v2 на общем рендере
   data/registry-table.js. Конфиг — LEAD_REGISTRY_CONFIGS (колонки, вкладки,
   разделы фильтра), строки — IBPR.potentials(kind): реестр «Лиды» берёт вид
   по вкладке (did | cm), «Обязательные лиды» — binding, «Возможные лиды» —
   possible. ID лида ведёт на страницу лида (PotentialPage).

   API: window.V2LeadsTable.mount(host, registry, opts) → handle общего рендера + config;
        registry — leads | binding-leads | possible-leads (метка <ds-include>
        переносит только id, class, state, mode — реестр задаёт страница);
        opts — режим «по клиенту» (вкладка «Сделки» ClientInfoPage):
        { clientId, kind, compact: { title, actions } } — kind задаёт вид
        лидов (did | rd | binding | possible) вместо вкладки.
   ========================================================================= */
(function () {
  'use strict';

  var KIND = { 'binding-leads': 'binding', 'possible-leads': 'possible' };

  function mount(host, registry, opts) {
    opts = opts || {};
    var S = window.IBPR, T = window.IBPR_TABLE;
    if (registry) host.setAttribute('data-registry', registry);
    var cfg = S.leadRegistryConfig(host.getAttribute('data-registry'));
    if (!cfg) return null;
    var byLabel = {};
    cfg.columns.forEach(function (c) { byLabel[c.label] = c.key; });
    var handle = T.mount(host, {
      id: opts.compact ? cfg.id + '-' + (opts.kind || 'client') : cfg.id,
      tab: opts.kind || (cfg.tabs.length ? T.tabFromUrl(cfg.tabs) : null),
      columns: cfg.columns,
      compact: opts.compact,
      rows: function (tab) {
        return S.potentials(opts.kind || KIND[cfg.id] || tab).filter(function (p) { return !opts.clientId || p.clientId === opts.clientId; });
      },
      filter: cfg.filterSections.map(function (l) { return { label: l, key: byLabel[l] || l }; }),
      cell: function (p, col, v, first) {
        if (col.type !== 'id-link') return null;
        var url = window.IBPR_NAV.href('potential', { id: p.id });
        return '<div class="tc' + (first ? ' tc--pinned' : '') + '" data-col="id"><span class="tc__row"><a class="link link--accent link--m" href="' + url + '">' + T.esc(p.id) + '</a></span></div>';
      }
    });
    handle.config = cfg;
    return handle;
  }

  window.V2LeadsTable = { mount: mount };
})();

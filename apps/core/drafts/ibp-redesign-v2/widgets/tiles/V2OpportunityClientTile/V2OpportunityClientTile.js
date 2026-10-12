/* V2OpportunityClientTile — заполнение тайла «Клиент».
   render(host, { client, variant }) — клиент (ClientRsDto); variant
   'opportunity' (по умолчанию): Клиент, ИНН, Отрасль, Макроотрасль,
   Подотрасль, Сегмент; 'potential' — тайл лида (ТЗ MS0014 §4.6): чипы
   клиента, Клиент, Холдинг, ИНН, Макроотрасль, Сегмент, Клиентский менеджер
   и «Документы по клиенту». Стрелка ведёт на ClientInfoPage. */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    var c = opts && opts.client;
    if (!host || !c) return;
    var S = window.IBPR, N = window.IBPR_NAV;
    var root = host.classList.contains('lc-opp-client') ? host : host.querySelector('.lc-opp-client') || host;
    root.setAttribute('data-variant', opts.variant === 'potential' ? 'potential' : 'opportunity');
    show(root, '[data-oc-chip-growth]', !!c.didGrowthCompany);
    show(root, '[data-oc-chip-top]', !!c.topClient);
    set(root, '[data-oc-name]', c.name);
    set(root, '[data-oc-holding]', c.holdingName);
    set(root, '[data-oc-inn]', c.inn);
    set(root, '[data-oc-industry]', c.industry);
    set(root, '[data-oc-macro]', c.macro);
    set(root, '[data-oc-sub]', c.sub);
    set(root, '[data-oc-segment]', c.segment);
    var m = S.employee(c.gcmId);
    set(root, '[data-oc-manager]', m ? m.fullName : '');
    var link = root.querySelector('[data-oc-link]');
    if (link) link.setAttribute('href', N.href('client', { id: c.id }));
    if (window.dsIcons) window.dsIcons.apply(root);
  }

  window.LcOpportunityClientTile = { render: render };
})();

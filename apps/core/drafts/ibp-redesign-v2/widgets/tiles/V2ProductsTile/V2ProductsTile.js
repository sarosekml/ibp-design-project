/* V2ProductsTile — ряд карточек продуктов.
   render(host, { products, dealId, source, tab, variant }) — products:
   OpportunityProductDto[]; карточки — разметка V2OpportunityProductTile.html();
   пусто — «В сделке пока нет продуктов». variant 'potential' — тайл лида:
   заголовок «Продукт», «Добавить» в теле (ТЗ MS0014 §4.6). «Добавить» — по
   клику ничего (Р6). */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    if (!host || !opts) return;
    var root = host.classList.contains('lc-products') ? host : host.querySelector('.lc-products') || host;
    var pot = opts.variant === 'potential';
    var list = opts.products || [];
    root.setAttribute('data-variant', pot ? 'potential' : 'opportunity');
    set(root, '[data-pt-title]', pot ? 'Продукт' : 'Продукты сделки');
    var grid = root.querySelector('[data-pt-grid]');
    if (grid) {
      grid.innerHTML = list.map(function (p) {
        return window.LcOpportunityProductTile.html({ product: p, dealId: opts.dealId, source: opts.source, tab: opts.tab });
      }).join('');
    }
    show(root, '[data-pt-empty]', !list.length);
    show(root, '[data-pt-add-body]', pot);
    if (window.dsIcons) window.dsIcons.apply(root);
  }

  window.LcProductsTile = { render: render };
})();

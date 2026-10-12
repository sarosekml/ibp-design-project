/* OpportunityProductTile — карточка продукта сделки.
   Два способа сборки:
     render(host, { product, dealId, source, tab })  — заполнить статический
       фрагмент (витрина, страница продукта);
     html({ product, dealId, source, tab }) → string  — разметка карточки
       целиком (ряд «Продукты сделки» строит страница: число карточек
       меняется по данным). Клонирует шаблон страницы, собранный из
       HTML-фрагмента виджета: источник разметки один. */
(function () {
  'use strict';

  function cardHTML(p, opts) {
    var card = document.getElementById('opportunity-product-template').content.firstElementChild.cloneNode(true);
    card.classList.add('col-4', 'colw-6');
    render(card, opts);
    return card.outerHTML;
  }

  function render(host, opts) {
    var p = opts && opts.product;
    if (!p) return;
    var name = host.querySelector('.lc-opp-product__name');
    var group = host.querySelector('.lc-opp-product__group .chip__label');
    var vals = host.querySelectorAll('.rof__value');
    if (name) name.textContent = p.name;
    if (group) group.textContent = p.groupLabel || '';
    if (vals.length >= 2) {
      vals[0].textContent = window.DICT_FMT.int(p.volume);
      vals[1].textContent = (p.vm != null ? p.vm : '–');
    }
    var link = host.querySelector('.tile__actions a');
    if (link) {
      link.setAttribute('href', window.IBPR_NAV.href('product', { source: opts.source, deal: opts.dealId, product: p.id }));
    }
  }

  window.LcOpportunityProductTile = {
    render: render,
    html: function (opts) {
      return opts && opts.product ? cardHTML(opts.product, opts) : '';
    }
  };
})();

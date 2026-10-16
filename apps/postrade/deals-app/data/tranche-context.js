/* =========================================================================
   TrancheContext — какой транш открыт на странице и как он назван в крошках.

   Обычный <script> (file://, без fetch). Подключить ПОСЛЕ mock-deals.js,
   deals-store.js, post-api.js, mock-product-catalog.js, mock-fin-instruments.js,
   mock-deal-trees.js и product-tree-store.js; вызывать после
   ProductTreeStore.ready — иначе сохранённые правки дерева не видны.

   Экспорт: window.TrancheContext = {
     resolve(search) → TrancheContextView|null
     paintCrumbs(ol, patches)               — править звенья крошек по индексу
   }

   Адрес: ?id=<номер сделки>&tr=<id транша в дереве>. Сделки или транша нет в
   адресе (или их нет в данных) — каркас: транш из той же сделки, а если и там
   нет — первый транш первой сделки, где он есть. Совсем нет траншей — null.
   Номера и названия берутся из дерева продуктов сделки (ProductTreeStore),
   номер и наименование сделки — из DealsStore: те же, что на странице сделки.
   ========================================================================= */

/**
 * Открытый транш для шапки и крошек.
 * Source: invented (16.10.2026) — модель представления, не DTO.
 * @typedef {Object} TrancheContextView
 * @property {Object} deal              запись DealsStore
 * @property {string} openedId          номер, под которым открыто дерево (его и кладём в адреса)
 * @property {Object} instrument        ProductTreeNodeView родительского инструмента
 * @property {Object} tranche           ProductTreeNodeView транша
 * @property {string} dealLabel         «1067. Приобретение сети торговых центров»
 * @property {string} parentLabel       «2.1.1. Договор займа (НКЛ)»
 * @property {string} trancheLabel      «2.1.1.1. Транш»
 * @property {string} dealQuery         «?id=1067»
 * @property {string} trancheQuery      «?id=1067&tr=1067.d2.p1.i1.t1»
 */
(function () {
  'use strict';

  function param(search, key) {
    try { return new URLSearchParams(search || '').get(key); } catch (e) { return null; }
  }

  /* Путь [DID, PRODUCT, INSTRUMENT, TRANCHE] или null, если узел — не транш. */
  function asTranchePath(path) {
    return path && path.length === 4 && path[3].kind === 'TRANCHE' ? path : null;
  }

  function firstTranche(nodes, trail) {
    for (var i = 0; i < nodes.length; i++) {
      var here = trail.concat(nodes[i]);
      var hit = nodes[i].kind === 'TRANCHE' ? here : firstTranche(nodes[i].children, here);
      if (hit) return hit;
    }
    return null;
  }

  function label(node) { return node.number + ' ' + node.name; }

  function resolve(search) {
    var trees = window.ProductTreeStore;
    var deals = window.DealsStore;
    if (!trees || !deals) return null;

    /* открыть дерево сделки и найти в нём транш: заданный или первый */
    function pick(openedId, trId) {
      trees.use(openedId);
      return (trId && asTranchePath(trees.path(trId))) || firstTranche(trees.view(), []);
    }

    var id = param(search, 'id');
    var tr = param(search, 'tr');
    var deal = id ? deals.byId(id) : null;
    var openedId = id;
    var path = deal ? pick(id, tr) : null;

    if (!path) {
      var list = deals.list();
      for (var i = 0; i < list.length && !path; i++) {
        deal = list[i];
        openedId = String(deal.id);
        path = pick(openedId, null);
      }
    }
    if (!path) return null;

    var dealQuery = '?id=' + encodeURIComponent(openedId);
    return {
      deal: deal,
      openedId: String(openedId),
      instrument: path[2],
      tranche: path[3],
      dealLabel: deal.id + '. ' + (deal.name || ''),
      parentLabel: label(path[2]),
      trancheLabel: label(path[3]),
      dealQuery: dealQuery,
      trancheQuery: dealQuery + '&tr=' + encodeURIComponent(path[3].id)
    };
  }

  /* Крошки. Рантайм ДС читает звенья один раз и дальше перерисовывает список
     сам (ds-breadcrumbs.js), поэтому правятся его звенья (api.items) с
     последующим refresh — разметка экрана после привязки уже не та.
     patches[i] = { text, href } — что поменять в звене i; пропуск — не трогать.
     Без рантайма — правится разметка. */
  function paintCrumbs(ol, patches) {
    if (!ol) return;
    var api = window.DSBreadcrumbs ? window.DSBreadcrumbs.bind(ol) : null;
    if (api) {
      patches.forEach(function (p, i) {
        if (!p || !api.items[i]) return;
        if (p.text != null) api.items[i].text = p.text;
        if (p.href != null) api.items[i].href = p.href;
      });
      api.refresh();
      return;
    }
    var lis = ol.querySelectorAll(':scope > .crumbs__item');
    patches.forEach(function (p, i) {
      if (!p || !lis[i]) return;
      var el = lis[i].querySelector('a, .crumbs__current');
      if (!el) return;
      if (p.text != null) el.textContent = p.text;
      if (p.href != null && el.tagName === 'A') el.setAttribute('href', p.href);
    });
  }

  window.TrancheContext = { resolve: resolve, paintCrumbs: paintCrumbs };
})();

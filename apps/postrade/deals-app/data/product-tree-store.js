/* =========================================================================
   ProductTreeStore — дерево продуктов текущей сделки.
   Подключить ПОСЛЕ mock-product-catalog.js, mock-fin-instruments.js,
   mock-deal-trees.js и post-api.js; если на странице есть сделки — после
   deals-store.js (стор переносит производные поля дерева в запись сделки:
   их читает реестр портфеля). Реестру деревья и карточки ФИ не нужны:
   ему хватает каталога, PostApi и этого файла.

   Экспорт: window.ProductTreeStore = {
     ready → Promise                       — загружены сохранённые деревья
     persist(on)                           — false: витрина не читает и не
                                             пишет сохранённое
     use(dealId|null[, tree])              — открыть дерево сделки; null —
                                             дерево витрины (tree или пустое)
     dealId() → id|null
     tree() → DealProductTreeRsDto         — копия текущего дерева
     view() → ProductTreeNodeView[]        — корни дерева с номерами, кнопками
                                             и меню, готовые к отрисовке
     node(id) → ProductTreeNodeView|null
     didCatalog() → продукты ДИД[]         — полный список для окна «Продукты ДИД»
     availableProducts(didId) → продукты[] — список окна «Продукты»
     availableInstruments(productId) → типы инструментов[] — окно «Инструменты»
     addDid(code) · addProduct(didId, code) · addInstrument(productId, code)
       · addTranche(instrumentId) → id|null
     remove(id) → boolean · canRemove(id) → boolean
     setMain(didId) → boolean              — основной продукт ДИД сделки
     repay(id, date) · undoRepay(id) → boolean
     moveTargets(instrumentId) → куда перенести инструмент
     moveInstrument(instrumentId, productId) → boolean
     fiCards(id) → карточки ФИ сделки для узла · linkFi(id, fiIds) → boolean
     summary(tree) → поля записи сделки    — mainProductDid, productsDidNames,
                                             productsNames, balances,
                                             currencies, isPE
     begin() · rollback() · commit() · dirty() → boolean
     on('change' | 'commit', fn) → off()
   }

   Правила предметной области живут здесь, а не в тайле и не в окнах
   (ответы человека 30.09.2026 — задача RE0001):
   – номер узла — его место в дереве: «1.», «1.1.», «1.1.1.», «1.1.1.1.»;
   – продукт ДИД создаётся со своими обязательными продуктами, продукт — со
     своими обязательными инструментами (ответ 15);
   – «Удалить» недоступно у продукта, обязательного и единственного в
     продукте ДИД (обязательность — по коду: продукт из обязательного
     состава, добавленный второй раз, тоже обязательный, и тогда любой из
     двух можно удалить), и у узла, который или потомок которого прикреплён
     к ФИ (ответ 20; про потомков — допущение, вопрос 35);
   – основной продукт ДИД в сделке один и есть всегда (ответ 19): первый
     добавленный, который может им быть, становится основным сам (ответ 15);
     после удаления основного — первый оставшийся из тех, кто может
     (допущение, вопрос 34); «Фондирование» основным не бывает (ответ 11);
   – погашение гасит и вложенные узлы (ответ 3), отмена снимает погашение с
     них же (допущение, вопрос 32); погашенный инструмент не входит в
     балансы, валюты и PE реестра (допущение, вопрос 33);
   – инструмент переносится в продукт, в состав которого входит его тип;
     неизвестный состав — любой продукт (допущение, вопрос 41);
   – узел прикрепляется не больше чем к двум карточкам ФИ своего типа
     (решение человека 30.09.2026; тип — допущение, вопрос 39);
   – кнопки и меню узла — по его типу (PRODUCT_TREE_RULES,
     INSTRUMENT_TYPE_CATALOG); у погашенного узла «Погасить» меняется на
     «Отменить погашение».

   Черновик. Окна правят дерево в черновике: begin() запоминает дерево,
   rollback() возвращает его, commit() сохраняет — в память страницы и через
   PostApi.trees (localStorage или сервер данных, data/API.md) — и переносит
   производные поля в DealsStore. Правки тайла (звезда, удаление, транш,
   погашение, перенос, связь с ФИ) сохраняются сразу.
   ========================================================================= */
(function () {
  'use strict';

  function index(list) {
    var map = {};
    (list || []).forEach(function (item) { map[item.code] = item; });
    return map;
  }

  var DID = index(window.PRODUCT_DID_CATALOG);
  var PRODUCT = index(window.PRODUCT_CATALOG);
  var INSTRUMENT = index(window.INSTRUMENT_TYPE_CATALOG);
  var RULES = window.PRODUCT_TREE_RULES || { did: {}, product: {}, tranche: {} };
  var LABELS = window.PRODUCT_MENU_ACTION_LABELS || {};
  var TREES = window.MOCK_DEAL_TREES || {};
  var FI = window.MOCK_DEAL_FIN_INSTRUMENTS || {};
  var FI_TYPE_LABELS = window.FIN_INSTRUMENT_TYPE_LABELS || {};
  var FI_REPORTING_LABELS = window.FIN_INSTRUMENT_REPORTING_LABELS || {};
  var MAX_FI = 2;

  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function emptyTree(dealId) { return { id: dealId, productsDid: [] }; }

  var current = { dealId: null, tree: emptyTree(null) };
  var snapshot = null;
  var saved = {};
  var persistOn = true;
  var listeners = [];
  var seq = 0;

  function emit(type, detail) {
    listeners.forEach(function (l) { if (l.type === type) l.fn(detail || {}); });
  }

  /* ── Хранение ───────────────────────────────────────────────────── */

  function api() { return window.PostApi && window.PostApi.trees ? window.PostApi.trees : null; }

  /* Реестр портфеля читает плоские поля записи сделки — стор кладёт их туда. */
  function syncDeal(dealId, tree) {
    if (dealId == null || !window.DealsStore || !window.DealsStore.byId(dealId)) return;
    window.DealsStore.update(dealId, summary(tree));
  }

  var ready = (api() ? api().all() : Promise.resolve({})).then(function (all) {
    if (!persistOn) return;
    Object.keys(all || {}).forEach(function (key) {
      var rec = all[key];
      if (!rec || !rec.tree) return;
      saved[key] = rec.tree;
      syncDeal(isNaN(Number(key)) ? key : Number(key), rec.tree);
    });
  }).catch(function (e) {
    if (window.console) console.warn('ProductTreeStore: сохранённые деревья не загружены —', e && e.message);
  });

  function persist(on) {
    persistOn = on !== false;
    if (!persistOn) saved = {};
  }

  /* ── Сделка ─────────────────────────────────────────────────────── */

  function use(dealId, tree) {
    snapshot = null;
    if (dealId == null) {
      current = { dealId: null, tree: tree ? clone(tree) : emptyTree(null) };
    } else {
      var key = String(dealId);
      var src = saved[key] || TREES[key];
      current = { dealId: dealId, tree: src ? clone(src) : emptyTree(dealId) };
    }
    emit('change', { reason: 'use' });
  }

  /* ── Обход ──────────────────────────────────────────────────────── */

  /* Каждый узел с родителем и массивом, в котором он лежит. */
  function walk(fn) {
    current.tree.productsDid.forEach(function (did) {
      fn(did, 'DID', null, current.tree.productsDid);
      did.products.forEach(function (p) {
        fn(p, 'PRODUCT', did, did.products);
        p.instruments.forEach(function (i) {
          fn(i, 'INSTRUMENT', p, p.instruments);
          (i.tranches || []).forEach(function (t) { fn(t, 'TRANCHE', i, i.tranches); });
        });
      });
    });
  }

  function find(id) {
    var hit = null;
    walk(function (node, kind, parent, list) {
      if (!hit && node.id === id) hit = { node: node, kind: kind, parent: parent, list: list };
    });
    return hit;
  }

  function childrenOf(node, kind) {
    if (kind === 'DID') return node.products;
    if (kind === 'PRODUCT') return node.instruments;
    if (kind === 'INSTRUMENT') return node.tranches || [];
    return [];
  }
  var CHILD_KIND = { DID: 'PRODUCT', PRODUCT: 'INSTRUMENT', INSTRUMENT: 'TRANCHE' };

  /* Узел и все вложенные — fn(node, kind). */
  function deep(node, kind, fn) {
    fn(node, kind);
    childrenOf(node, kind).forEach(function (c) { deep(c, CHILD_KIND[kind], fn); });
  }

  /* ── Правила ────────────────────────────────────────────────────── */

  function mandatoryCodes(didCode) {
    var item = DID[didCode];
    return (item && item.mandatory) || [];
  }

  function canBeMain(did) {
    var item = DID[did.code];
    return !item || item.canBeMain !== false;
  }

  function attached(node, kind) {
    var hit = false;
    deep(node, kind, function (n) { if ((n.fiIds || []).length) hit = true; });
    return hit;
  }

  function productRemovable(product, did) {
    return !(product.isMandatory && did.products.length === 1);
  }

  function canRemove(id) {
    var hit = find(id);
    if (!hit) return false;
    if (attached(hit.node, hit.kind)) return false;
    return hit.kind !== 'PRODUCT' || productRemovable(hit.node, hit.parent);
  }

  function menuOf(actions, node, removable) {
    if (!actions) return null;
    return actions.map(function (a) {
      var action = (a === 'REPAY' && node.repaidAt) ? 'UNDO_REPAY' : a;
      return { action: action, label: LABELS[action] || action, disabled: action === 'DELETE' && !removable };
    });
  }

  /* Вторая строка: что за значения — по типу узла (ответ 22). */
  function detailsOf(kind, node) {
    var money = { SIGNED_PURCHASE: 'purchaseCost', SIGNED_STRIKE: 'strikePrice', SIGNED_LIMIT: 'limitAmount' }[kind];
    if (money) {
      return [{ field: 'signedAt', value: node.signedAt },
              { field: money, value: node.amount, currency: node.currency }];
    }
    if (kind === 'DID_PERIOD') {
      return [{ field: 'didEntryAt', value: node.didEntryAt },
              { field: 'didExitAt', value: node.didExitAt }];
    }
    return [];
  }

  function fiTypeOf(node, kind) {
    if (kind === 'TRANCHE') return RULES.tranche.fiType || null;
    if (kind !== 'INSTRUMENT') return null;
    var type = INSTRUMENT[node.code];
    return type && type.canAttachToFi ? type.fiType || null : null;
  }

  /* ── Чтение ─────────────────────────────────────────────────────── */

  /**
   * Узел дерева, готовый к отрисовке.
   * Source: invented (29.09.2026) — модель представления, не DTO.
   * @typedef {Object} ProductTreeNodeView
   * @property {string} id
   * @property {'DID'|'PRODUCT'|'INSTRUMENT'|'TRANCHE'} kind
   * @property {number} level             0 — продукт ДИД … 3 — транш
   * @property {string} number            «1.», «1.1.», «1.1.1.», «1.1.1.1.»
   * @property {string|null} code
   * @property {string} name
   * @property {boolean} isMain           основной продукт ДИД (только у DID)
   * @property {boolean} canBeMain        может ли продукт ДИД быть основным
   * @property {boolean} isMandatory      обязательный продукт (только у PRODUCT)
   * @property {'PRODUCT'|'INSTRUMENT'|'TRANCHE'|null} add что добавляет ⊕
   * @property {boolean} canAttachToFi    кнопка ⇄ «Изменить связь с ФИ»
   * @property {string[]} fiIds           карточки ФИ, к которым прикреплён узел
   * @property {string} detailsKind       ProductDetailsKind
   * @property {{field: string, value: (string|number|null), currency: (string|undefined)}[]} details
   *           значения второй строки; null — прочерк
   * @property {string|null} repaidAt     дата фактического погашения
   * @property {boolean} hasPage          заголовок — ссылка на страницу узла
   * @property {{action: string, label: string, disabled: boolean}[]|null} menu пункты ⋮
   * @property {ProductTreeNodeView[]} children
   */
  function viewOf(node, kind, level, number, parent) {
    var removable = canRemove(node.id);
    var v = {
      id: node.id, kind: kind, level: level, number: number,
      code: node.code || null, name: node.name,
      isMain: kind === 'DID' && !!node.isMain,
      canBeMain: kind === 'DID' && canBeMain(node),
      isMandatory: kind === 'PRODUCT' && !!node.isMandatory,
      add: null, canAttachToFi: false, fiIds: (node.fiIds || []).slice(),
      detailsKind: 'NONE', details: [], repaidAt: node.repaidAt || null,
      hasPage: false, menu: null, children: []
    };
    var kids = [];
    if (kind === 'DID') {
      v.add = 'PRODUCT';
      v.menu = menuOf(RULES.did.menuActions, node, removable);
      kids = node.products.map(function (p, i) {
        return viewOf(p, 'PRODUCT', 1, number + (i + 1) + '.', node);
      });
    } else if (kind === 'PRODUCT') {
      v.add = 'INSTRUMENT';
      v.menu = menuOf(RULES.product.menuActions, node, removable);
      kids = node.instruments.map(function (inst, i) {
        return viewOf(inst, 'INSTRUMENT', 2, number + (i + 1) + '.', node);
      });
    } else if (kind === 'INSTRUMENT') {
      var type = INSTRUMENT[node.code] || {};
      v.add = type.canAddTranches === true ? 'TRANCHE' : null;
      v.canAttachToFi = type.canAttachToFi === true;
      v.detailsKind = type.detailsKind || 'NONE';
      v.details = detailsOf(v.detailsKind, node);
      v.hasPage = type.hasPage === true;
      v.menu = menuOf(type.menuActions, node, removable);
      kids = (node.tranches || []).map(function (t, i) {
        return viewOf(t, 'TRANCHE', 3, number + (i + 1) + '.', node);
      });
    } else {
      v.canAttachToFi = RULES.tranche.canAttachToFi === true;
      v.detailsKind = RULES.tranche.detailsKind || 'NONE';
      v.details = detailsOf(v.detailsKind, node);
      v.hasPage = RULES.tranche.hasPage === true;
      v.menu = menuOf(RULES.tranche.menuActions, node, removable);
    }
    v.children = kids;
    return v;
  }

  function view() {
    return current.tree.productsDid.map(function (did, i) {
      return viewOf(did, 'DID', 0, (i + 1) + '.', null);
    });
  }

  function node(id) {
    var hit = null;
    (function scan(list) {
      list.forEach(function (v) {
        if (hit) return;
        if (v.id === id) hit = v; else scan(v.children);
      });
    })(view());
    return hit;
  }

  function didCatalog() { return clone(window.PRODUCT_DID_CATALOG || []); }

  /* Продукты окна «Продукты». Окно на макете есть только у «Кредитный
     мезонин»; у остальных — обязательный состав (ответ 13), а без него —
     весь справочник: «нечего выбрать» не бывает (ответ 27, вопрос 38). */
  function availableProducts(didId) {
    var hit = find(didId);
    if (!hit || hit.kind !== 'DID') return [];
    var item = DID[hit.node.code];
    var codes = (item && item.productCodes) || mandatoryCodes(hit.node.code);
    if (!codes.length) codes = (window.PRODUCT_CATALOG || []).map(function (p) { return p.code; });
    return codes.map(function (c) { return PRODUCT[c]; }).filter(Boolean).map(clone);
  }

  /* Типы инструментов окна «Инструменты»: состав продукта, а без него —
     весь справочник (вопрос 38). */
  function availableInstruments(productId) {
    var hit = find(productId);
    if (!hit || hit.kind !== 'PRODUCT') return [];
    var item = PRODUCT[hit.node.code];
    var codes = (item && item.instrumentCodes) || (window.INSTRUMENT_TYPE_CATALOG || []).map(function (t) { return t.code; });
    return codes.map(function (c) { return INSTRUMENT[c]; }).filter(Boolean).map(clone);
  }

  /* ── Правка ─────────────────────────────────────────────────────── */

  function newId() {
    seq += 1;
    return String(current.dealId == null ? 'demo' : current.dealId) + '.n' + seq;
  }

  function instrumentNode(code) {
    var type = INSTRUMENT[code];
    return {
      id: newId(), code: code, name: type ? type.name : code,
      currency: null, balance: null, isPE: false,
      signedAt: null, amount: null, didEntryAt: null, didExitAt: null,
      fiIds: [], repaidAt: null, tranches: []
    };
  }

  /* Продукт приходит со своими обязательными инструментами (ответ 15). */
  function productNode(code, didCode) {
    var item = PRODUCT[code];
    return {
      id: newId(), code: code, name: item ? item.name : code,
      isMandatory: mandatoryCodes(didCode).indexOf(code) !== -1,
      instruments: ((item && item.mandatoryInstrumentCodes) || []).map(instrumentNode)
    };
  }

  function mainOf() {
    return current.tree.productsDid.filter(function (d) { return d.isMain; })[0] || null;
  }

  /* У сделки основной продукт есть всегда, если есть кому им быть. */
  function ensureMain() {
    if (mainOf()) return;
    var first = current.tree.productsDid.filter(canBeMain)[0];
    if (first) first.isMain = true;
  }

  function addDid(code) {
    var item = DID[code];
    if (!item) return null;
    var did = {
      id: newId(), code: code, name: item.name, isMain: false,
      products: (item.mandatory || []).map(function (p) { return productNode(p, code); })
    };
    current.tree.productsDid.push(did);
    ensureMain();
    emit('change', { reason: 'add', id: did.id });
    return did.id;
  }

  function addProduct(didId, code) {
    var hit = find(didId);
    if (!hit || hit.kind !== 'DID') return null;
    var allowed = availableProducts(didId).map(function (p) { return p.code; });
    if (allowed.indexOf(code) === -1) return null;
    var product = productNode(code, hit.node.code);
    hit.node.products.push(product);
    emit('change', { reason: 'add', id: product.id });
    return product.id;
  }

  function addInstrument(productId, code) {
    var hit = find(productId);
    if (!hit || hit.kind !== 'PRODUCT') return null;
    var allowed = availableInstruments(productId).map(function (t) { return t.code; });
    if (allowed.indexOf(code) === -1) return null;
    var inst = instrumentNode(code);
    hit.node.instruments.push(inst);
    emit('change', { reason: 'add', id: inst.id });
    return inst.id;
  }

  /* Транш — сразу, без окна (ответ 6): данных у него ещё нет, вторая строка
     в прочерках (ответ 5). */
  function addTranche(instrumentId) {
    var hit = find(instrumentId);
    if (!hit || hit.kind !== 'INSTRUMENT') return null;
    var type = INSTRUMENT[hit.node.code];
    if (!type || type.canAddTranches !== true) return null;
    var t = {
      id: newId(), name: RULES.tranche.name || 'Транш', currency: hit.node.currency || null,
      signedAt: null, amount: null, fiIds: [], repaidAt: null
    };
    if (!hit.node.tranches) hit.node.tranches = [];
    hit.node.tranches.push(t);
    emit('change', { reason: 'add', id: t.id });
    return t.id;
  }

  function remove(id) {
    var hit = find(id);
    if (!hit || !canRemove(id)) return false;
    hit.list.splice(hit.list.indexOf(hit.node), 1);
    if (hit.kind === 'DID' && hit.node.isMain) ensureMain();
    emit('change', { reason: 'remove', id: id });
    return true;
  }

  /* Основной продукт снять нельзя — только назначить другой (ответ 19). */
  function setMain(didId) {
    var hit = find(didId);
    if (!hit || hit.kind !== 'DID' || !canBeMain(hit.node)) return false;
    current.tree.productsDid.forEach(function (d) { d.isMain = d.id === didId; });
    emit('change', { reason: 'main', id: didId });
    return true;
  }

  /* Погашение — инструмент или транш с вложенными (ответ 3). */
  function repay(id, date) {
    var hit = find(id);
    if (!hit || (hit.kind !== 'INSTRUMENT' && hit.kind !== 'TRANCHE') || !date) return false;
    deep(hit.node, hit.kind, function (n) { if (!n.repaidAt || n === hit.node) n.repaidAt = date; });
    emit('change', { reason: 'repay', id: id });
    return true;
  }

  function undoRepay(id) {
    var hit = find(id);
    if (!hit || (hit.kind !== 'INSTRUMENT' && hit.kind !== 'TRANCHE')) return false;
    deep(hit.node, hit.kind, function (n) { n.repaidAt = null; });
    emit('change', { reason: 'undo-repay', id: id });
    return true;
  }

  /* Куда перенести инструмент: все продукты ДИД сделки и их продукты.
     current — продукт, где инструмент сейчас; suitable — в состав продукта
     входит тип инструмента (неизвестный состав — любой). */
  function moveTargets(instrumentId) {
    var hit = find(instrumentId);
    if (!hit || hit.kind !== 'INSTRUMENT') return [];
    var code = hit.node.code;
    return view().map(function (did) {
      return {
        did: did,
        products: did.children.map(function (p) {
          var item = PRODUCT[p.code];
          var codes = item && item.instrumentCodes;
          return {
            product: p,
            current: p.id === hit.parent.id,
            suitable: !codes || codes.indexOf(code) !== -1
          };
        })
      };
    });
  }

  function moveInstrument(instrumentId, productId) {
    var hit = find(instrumentId);
    var target = find(productId);
    if (!hit || hit.kind !== 'INSTRUMENT' || !target || target.kind !== 'PRODUCT') return false;
    if (target.node === hit.parent) return false;
    var ok = moveTargets(instrumentId).some(function (d) {
      return d.products.some(function (p) { return p.product.id === productId && p.suitable; });
    });
    if (!ok) return false;
    hit.list.splice(hit.list.indexOf(hit.node), 1);
    target.node.instruments.push(hit.node);
    emit('change', { reason: 'move', id: instrumentId });
    return true;
  }

  /* Карточки ФИ сделки для узла: доступна карточка того же типа, что узел. */
  function fiCards(id) {
    var hit = find(id);
    if (!hit) return [];
    var type = fiTypeOf(hit.node, hit.kind);
    if (!type) return [];
    var list = FI[String(current.dealId)] || [];
    var chosen = hit.node.fiIds || [];
    return list.map(function (c) {
      var card = clone(c);
      card.typeLabel = FI_TYPE_LABELS[c.typeCode] || c.typeCode;
      card.reportingLabel = FI_REPORTING_LABELS[c.reportingType] || c.reportingType;
      card.available = c.typeCode === type;
      card.selected = chosen.indexOf(c.id) !== -1;
      return card;
    });
  }

  function linkFi(id, fiIds) {
    var hit = find(id);
    if (!hit || !Array.isArray(fiIds) || fiIds.length > MAX_FI) return false;
    var ok = fiCards(id).filter(function (c) { return c.available; }).map(function (c) { return c.id; });
    if (!fiTypeOf(hit.node, hit.kind) || fiIds.some(function (f) { return ok.indexOf(f) === -1; })) return false;
    hit.node.fiIds = fiIds.slice();
    emit('change', { reason: 'link', id: id });
    return true;
  }

  /* ── Производные поля записи сделки ─────────────────────────────── */

  function uniq(list) {
    return list.filter(function (x, i) { return x != null && x !== '' && list.indexOf(x) === i; });
  }

  /* Одна формула на генератор демо-данных и на стор: плоские поля
     mock-deals.js посчитаны ею же. Балансы, валюты и признак PE — с
     инструментов; транши их не добавляют; погашенный инструмент исключён
     из отчётов (ответ 3, вопрос 33). */
  function summary(tree) {
    var dids = (tree && tree.productsDid) || [];
    var main = dids.filter(function (d) { return d.isMain; })[0];
    var products = [];
    dids.forEach(function (d) { products = products.concat(d.products); });
    var instruments = [];
    products.forEach(function (p) { instruments = instruments.concat(p.instruments); });
    var live = instruments.filter(function (i) { return !i.repaidAt; });
    return {
      mainProductDid: main ? main.name : '',
      productsDidNames: uniq(dids.map(function (d) { return d.name; })),
      productsNames: uniq(products.map(function (p) { return p.name; })),
      balances: uniq(live.map(function (i) { return i.balance; })),
      currencies: uniq(live.map(function (i) { return i.currency; })),
      isPE: live.some(function (i) { return i.isPE === true; })
    };
  }

  /* ── Черновик ───────────────────────────────────────────────────── */

  function begin() { snapshot = clone(current.tree); }

  function dirty() {
    return !!snapshot && JSON.stringify(snapshot) !== JSON.stringify(current.tree);
  }

  function rollback() {
    if (!snapshot) return;
    current.tree = snapshot;
    snapshot = null;
    emit('change', { reason: 'rollback' });
  }

  /* Витрины (dealId === null или persist(false)) не сохраняются: дерево
     живёт в памяти стора. */
  function commit() {
    snapshot = null;
    var dealId = current.dealId;
    if (dealId != null) {
      var tree = clone(current.tree);
      saved[String(dealId)] = tree;
      syncDeal(dealId, tree);
      if (persistOn && api()) {
        api().put(dealId, { tree: tree }).catch(function (e) {
          if (window.console) console.warn('ProductTreeStore: дерево не сохранено —', e && e.message);
        });
      }
    }
    emit('commit', { dealId: dealId });
  }

  function on(type, fn) {
    var rec = { type: type, fn: fn };
    listeners.push(rec);
    return function off() {
      var i = listeners.indexOf(rec);
      if (i !== -1) listeners.splice(i, 1);
    };
  }

  window.ProductTreeStore = {
    ready: ready,
    persist: persist,
    use: use,
    dealId: function () { return current.dealId; },
    tree: function () { return clone(current.tree); },
    view: view,
    node: node,
    didCatalog: didCatalog,
    availableProducts: availableProducts,
    availableInstruments: availableInstruments,
    addDid: addDid,
    addProduct: addProduct,
    addInstrument: addInstrument,
    addTranche: addTranche,
    remove: remove,
    canRemove: canRemove,
    setMain: setMain,
    repay: repay,
    undoRepay: undoRepay,
    moveTargets: moveTargets,
    moveInstrument: moveInstrument,
    fiCards: fiCards,
    linkFi: linkFi,
    summary: summary,
    begin: begin,
    rollback: rollback,
    commit: commit,
    dirty: dirty,
    on: on
  };
})();

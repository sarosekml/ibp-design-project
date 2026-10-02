/* =========================================================================
   FinInstrumentsStore — карточки финансовых инструментов (ФИ) текущей сделки.
   Подключить ПОСЛЕ mock-fin-instruments.js, post-api.js и product-tree-store.js;
   если на странице есть контрагенты — после counterparties-store.js
   (контрагенты карточки — записи его базы).

   Экспорт: window.FinInstrumentsStore = {
     ready → Promise                         — загружены сохранённые карточки
     persist(on)                             — false: витрина не читает и не
                                               пишет сохранённое
     use(dealId|null[, cards])               — открыть карточки сделки; null —
                                               карточки витрины (cards или пусто)
     dealId() → id|null
     list() → DealFinInstrumentCardRsDto[]   — копии собственных полей
     view() → FinInstrumentCardView[]        — карточки, готовые к отрисовке:
                                               с производными полями из дерева
     card(id) → FinInstrumentCardView|null
     fieldsOf(typeCode) → поле[]             — какие поля правит окно у типа
     typeOptions() · reportingOptions() · fvAcOptions() → {code, label}[]
     counterpartyOptions() → {id, name, risk, isMember}[]
     optionNodes() → {id, label}[]           — «Пут: РЕПО» и «Колл: РЕПО» дерева
     generatable() → {typeCode, nodeIds}[]   — что создаст «Сгенерировать
                                               автоматически»
     create({typeCode, reportingType}) → id|null
     update(id, patch) → boolean
     remove(id) → boolean
     generate() → id[]                       — карточки по дереву + связь узлов
     commit()
     on('change' | 'commit', fn) → off()
   }

   Правила предметной области живут здесь, а не в тайле и не в окнах:
   – собственные поля карточки — номер, тип, наименование, тип отчётности
     (задаются при создании) и то, что правит окно изменения; какие поля у
     какого типа — FIELDS_BY_TYPE, по макету «Изменение ФИ» (02.10.2026);
   – баланс, валюта, сумма, дата подписания и список инструментов —
     производные: из узлов дерева продуктов, прикреплённых к карточке (fiIds
     узла; решение человека 02.10.2026). Баланс транша — баланс его
     инструмента; несколько разных балансов или валют — через запятую; сумма
     — сумма значений узлов, при разных валютах не считается; дата
     подписания — самая ранняя (допущения агента 02.10.2026);
   – «Плановая дата погашения» — в дереве такого поля нет, источник не решён
     (02.10.2026): пока всегда пусто;
   – карточка погашена, когда к ней прикреплены узлы и все они погашены
     (допущение агента 02.10.2026);
   – «Сгенерировать автоматически» — одна карточка на каждый тип
     прикрепляемых узлов дерева, у которых ещё нет связи с ФИ; узлы сразу
     прикрепляются к своей карточке (решение человека 02.10.2026). Тип
     отчётности сгенерированной карточки — «МСФО и РСБУ» (допущение агента);
   – имя новой карточки — по образцу демо-карточек сделки:
     «<начало имени карточек сделки, без них — номер сделки>-<тип>-<200 +
     номер>» (допущение агента 02.10.2026).

   Хранение. Правки окон сохраняются сразу: commit() кладёт список в память
   страницы и через PostApi.finInstruments (localStorage или сервер данных,
   data/API.md). Сохранённый список перекрывает демо-карточки сделки.
   ========================================================================= */
(function () {
  'use strict';

  var FI = window.MOCK_DEAL_FIN_INSTRUMENTS || {};
  var TYPE_LABELS = window.FIN_INSTRUMENT_TYPE_LABELS || {};
  var REPORTING_LABELS = window.FIN_INSTRUMENT_REPORTING_LABELS || {};
  var FV_AC_LABELS = window.FIN_INSTRUMENT_FV_AC_LABELS || {};
  var DETAIL_LABELS = window.PRODUCT_DETAIL_LABELS || {};
  var RULES = window.PRODUCT_TREE_RULES || { tranche: {} };

  var GENERATED_REPORTING = 'IFRS_RAS';

  /* Поля окна изменения по типу ФИ — в порядке окна (макет «Изменение ФИ»). */
  var FIELDS_BY_TYPE = {
    LOAN: ['name', 'counterpartyId', 'fvAcCode', 'reserveCounterpartyId', 'allocationCounterpartyId', 'isDkkk'],
    SHARES: ['name', 'counterpartyId', 'fvAcCode', 'targetIrr', 'reserveCounterpartyId', 'allocationCounterpartyId',
      'isPE', 'isDkkk', 'hasLinkedUnconditionalOption'],
    ADDITIONAL_YIELD: ['name', 'counterpartyId', 'fvAcCode', 'reserveCounterpartyId', 'allocationCounterpartyId',
      'linkedContractNumber', 'ifrsOptionNodeId', 'isDkkk'],
    REPO: ['name', 'counterpartyId', 'fvAcCode', 'reserveCounterpartyId', 'allocationCounterpartyId',
      'linkedContractNumber', 'ifrsOptionNodeId', 'isDkkk'],
    RECEIVABLES: ['name', 'counterpartyId', 'fvAcCode', 'targetIrr', 'reserveCounterpartyId', 'allocationCounterpartyId', 'isDkkk']
  };

  /* Что за сумма у ФИ — по типу; подпись — PRODUCT_DETAIL_LABELS дерева. */
  var AMOUNT_FIELD = {
    LOAN: 'limitAmount',
    SHARES: 'purchaseCost',
    RECEIVABLES: 'purchaseCost',
    REPO: 'strikePrice',
    ADDITIONAL_YIELD: 'strikePrice'
  };

  var DEFAULTS = {
    counterpartyId: null, reserveCounterpartyId: null, allocationCounterpartyId: null,
    fvAcCode: null, targetIrr: null, isDkkk: false, isPE: false,
    hasLinkedUnconditionalOption: false, linkedContractNumber: null, ifrsOptionNodeId: null,
    rwaCodes: [], errorText: null
  };
  var FLAGS = { isDkkk: 1, isPE: 1, hasLinkedUnconditionalOption: 1 };

  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function has(v) { return v !== null && v !== undefined && v !== ''; }

  function normalize(c) {
    var card = clone(c);
    Object.keys(DEFAULTS).forEach(function (k) {
      if (card[k] === undefined) card[k] = clone(DEFAULTS[k]);
    });
    return card;
  }

  var current = { dealId: null, cards: [] };
  var saved = {};
  var persistOn = true;
  var listeners = [];

  function emit(type, detail) {
    listeners.forEach(function (l) { if (l.type === type) l.fn(detail || {}); });
  }

  /* ── Хранение ───────────────────────────────────────────────────── */

  function api() { return window.PostApi && window.PostApi.finInstruments ? window.PostApi.finInstruments : null; }

  var ready = (api() ? api().all() : Promise.resolve({})).then(function (all) {
    if (!persistOn) return;
    Object.keys(all || {}).forEach(function (key) {
      var rec = all[key];
      if (rec && Array.isArray(rec.cards)) saved[key] = rec.cards;
    });
  }).catch(function (e) {
    if (window.console) console.warn('FinInstrumentsStore: сохранённые карточки ФИ не загружены —', e && e.message);
  });

  function persist(on) {
    persistOn = on !== false;
    if (!persistOn) saved = {};
  }

  /* ── Сделка ─────────────────────────────────────────────────────── */

  function use(dealId, cards) {
    var src;
    if (dealId == null) src = cards || [];
    else src = saved[String(dealId)] || FI[String(dealId)] || [];
    current = { dealId: dealId == null ? null : dealId, cards: src.map(normalize) };
    emit('change', { reason: 'use' });
  }

  function find(id) {
    for (var i = 0; i < current.cards.length; i++) if (current.cards[i].id === id) return current.cards[i];
    return null;
  }

  /* ── Дерево продуктов ───────────────────────────────────────────── */

  function tree() {
    var T = window.ProductTreeStore;
    if (!T || String(T.dealId()) !== String(current.dealId)) return null;
    return T;
  }

  /* Тип ФИ узла — как у стора дерева: транш — по правилам транша,
     инструмент — по каталогу типов. */
  function fiTypeOf(raw, kind) {
    if (kind === 'TRANCHE') return RULES.tranche.fiType || null;
    var type = (window.INSTRUMENT_TYPE_CATALOG || []).filter(function (t) { return t.code === raw.code; })[0];
    return type && type.canAttachToFi ? type.fiType || null : null;
  }

  /* Прикрепляемые узлы дерева: сырое значение (баланс, валюта, сумма),
     вид (номер, вторая строка, погашение) и баланс транша — у инструмента. */
  function treeNodes() {
    var T = tree();
    if (!T) return [];
    var views = {};
    (function scan(list) {
      list.forEach(function (v) { views[v.id] = v; scan(v.children || []); });
    })(T.view());
    var out = [];
    T.tree().productsDid.forEach(function (did) {
      did.products.forEach(function (p) {
        p.instruments.forEach(function (i) {
          out.push({ raw: i, kind: 'INSTRUMENT', balance: i.balance, view: views[i.id] });
          (i.tranches || []).forEach(function (t) {
            out.push({ raw: t, kind: 'TRANCHE', balance: i.balance, view: views[t.id] });
          });
        });
      });
    });
    return out.filter(function (n) { return n.view && n.view.canAttachToFi; });
  }

  function uniq(list) {
    return list.filter(function (x, i) { return has(x) && list.indexOf(x) === i; });
  }

  /* ── Чтение ─────────────────────────────────────────────────────── */

  function counterparty(id) {
    if (!has(id)) return null;
    var S = window.CounterpartiesStore;
    var rec = S && S.byId ? S.byId(id) : null;
    return rec ? { id: rec.id, name: rec.name, risk: rec.risk || null } : { id: id, name: id, risk: null };
  }

  /**
   * Карточка ФИ, готовая к отрисовке.
   * Source: invented (02.10.2026) — модель представления, не DTO.
   * @typedef {Object} FinInstrumentCardView
   * @property {string} id
   * @property {number} number
   * @property {string} typeCode · typeLabel
   * @property {string} name
   * @property {string} reportingType · reportingLabel
   * @property {string|null} balance        из прикреплённых узлов, через запятую
   * @property {string|null} currency       из прикреплённых узлов, через запятую
   * @property {string} amountField         limitAmount | purchaseCost | strikePrice
   * @property {string} amountLabel         подпись суммы по типу
   * @property {number|null} amount         сумма значений узлов; при разных валютах — null
   * @property {string|null} signedAt       самая ранняя дата подписания узлов
   * @property {string|null} plannedMaturityAt  источник не решён — всегда null
   * @property {string|null} fvAcCode · fvAcLabel
   * @property {number|null} targetIrr
   * @property {{id, name, risk}|null} counterparty · reserveCounterparty · allocationCounterparty
   * @property {boolean} isDkkk · isPE · hasLinkedUnconditionalOption
   * @property {string|null} linkedContractNumber · ifrsOptionNodeId
   * @property {string[]} rwaCodes
   * @property {string|null} errorText
   * @property {{id, number, name, details, repaidAt, isIfrsOption}[]} nodes прикреплённые узлы
   * @property {boolean} isRepaid           узлы есть и все погашены
   * @property {boolean} isFilled           есть хоть одно значение кроме созданных с карточкой
   */
  function viewOf(card, nodes) {
    var linked = nodes.filter(function (n) { return (n.raw.fiIds || []).indexOf(card.id) !== -1; });
    var currencies = uniq(linked.map(function (n) { return n.raw.currency; }));
    var amounts = linked.map(function (n) { return n.raw.amount; }).filter(function (a) { return typeof a === 'number'; });
    var dates = linked.map(function (n) { return n.raw.signedAt; }).filter(has).sort();
    var field = AMOUNT_FIELD[card.typeCode] || 'limitAmount';
    var v = clone(card);
    v.typeLabel = TYPE_LABELS[card.typeCode] || card.typeCode;
    v.reportingLabel = REPORTING_LABELS[card.reportingType] || card.reportingType || null;
    v.balance = uniq(linked.map(function (n) { return n.balance; })).join(', ') || null;
    v.currency = currencies.join(', ') || null;
    v.amountField = field;
    v.amountLabel = DETAIL_LABELS[field] || '';
    v.amount = amounts.length && currencies.length <= 1
      ? amounts.reduce(function (s, a) { return s + a; }, 0) : null;
    v.signedAt = dates[0] || null;
    v.plannedMaturityAt = null;
    v.fvAcLabel = has(card.fvAcCode) ? (FV_AC_LABELS[card.fvAcCode] || card.fvAcCode) : null;
    v.counterparty = counterparty(card.counterpartyId);
    v.reserveCounterparty = counterparty(card.reserveCounterpartyId);
    v.allocationCounterparty = counterparty(card.allocationCounterpartyId);
    v.nodes = linked.map(function (n) {
      return {
        id: n.raw.id, number: n.view.number, name: n.view.name,
        details: clone(n.view.details || []), repaidAt: n.view.repaidAt || null,
        isIfrsOption: has(card.ifrsOptionNodeId) && card.ifrsOptionNodeId === n.raw.id
      };
    });
    v.isRepaid = linked.length > 0 && linked.every(function (n) { return has(n.raw.repaidAt); });
    v.isFilled = linked.length > 0 || Object.keys(DEFAULTS).some(function (k) {
      if (k === 'rwaCodes' || k === 'errorText') return false;
      return FLAGS[k] ? card[k] === true : has(card[k]);
    });
    return v;
  }

  function view() {
    var nodes = treeNodes();
    return current.cards.map(function (c) { return viewOf(c, nodes); });
  }

  function card(id) {
    var c = find(id);
    return c ? viewOf(c, treeNodes()) : null;
  }

  function fieldsOf(typeCode) { return (FIELDS_BY_TYPE[typeCode] || []).slice(); }

  function coded(map) {
    return Object.keys(map).map(function (k) { return { code: k, label: map[k] }; });
  }
  function typeOptions() { return coded(TYPE_LABELS); }
  function reportingOptions() { return coded(REPORTING_LABELS); }
  function fvAcOptions() { return coded(FV_AC_LABELS); }

  /* Контрагенты окна: участники сделки первыми, за ними остальные юрлица
     базы (допущение агента 02.10.2026 — из кого выбирают контрагента ФИ, не
     решено: у демо-сделок участник один). */
  function counterpartyOptions() {
    var S = window.CounterpartiesStore;
    if (!S || !S.list) return [];
    var members = (S.members ? S.members('ul') : []).map(function (r) { return r.id; });
    var ul = S.list().filter(function (r) { return r.kind === 'ul'; });
    var first = ul.filter(function (r) { return members.indexOf(r.id) !== -1; });
    var rest = ul.filter(function (r) { return members.indexOf(r.id) === -1; });
    return first.concat(rest).map(function (r) {
      return { id: r.id, name: r.name, risk: r.risk || null, isMember: members.indexOf(r.id) !== -1 };
    });
  }

  /* Опцион, включённый в расчёт МСФО, — пут или колл РЕПО дерева сделки. */
  function optionNodes() {
    return treeNodes().filter(function (n) {
      return n.kind === 'INSTRUMENT' && fiTypeOf(n.raw, n.kind) === 'REPO';
    }).map(function (n) { return { id: n.raw.id, label: n.view.number + ' ' + n.view.name }; });
  }

  /* Узлы без связи с ФИ, по типу ФИ, в порядке дерева. */
  function generatable() {
    var groups = [];
    treeNodes().forEach(function (n) {
      if ((n.raw.fiIds || []).length) return;
      var type = fiTypeOf(n.raw, n.kind);
      if (!type) return;
      var g = groups.filter(function (x) { return x.typeCode === type; })[0];
      if (!g) { g = { typeCode: type, nodeIds: [] }; groups.push(g); }
      g.nodeIds.push(n.raw.id);
    });
    return groups;
  }

  /* ── Правка ─────────────────────────────────────────────────────── */

  function nextNumber() {
    return current.cards.reduce(function (m, c) { return Math.max(m, c.number || 0); }, 0) + 1;
  }

  /* Первая часть имени — как у карточек сделки; карточек нет — номер сделки. */
  function namePrefix(deal) {
    var first = current.cards[0] && String(current.cards[0].name || '').split('-')[0];
    return first || deal;
  }

  function create(input) {
    input = input || {};
    if (!TYPE_LABELS[input.typeCode] || !REPORTING_LABELS[input.reportingType]) return null;
    var number = nextNumber();
    var deal = current.dealId == null ? 'demo' : String(current.dealId);
    var id = 'FI-' + deal + '-' + number;
    while (find(id)) id += 'n';
    current.cards.push(normalize({
      id: id, number: number, typeCode: input.typeCode,
      name: namePrefix(deal) + '-' + TYPE_LABELS[input.typeCode] + '-' + (200 + number),
      reportingType: input.reportingType
    }));
    emit('change', { reason: 'create', id: id });
    return id;
  }

  /* Окно правит только поля своего типа; остальные собственные поля типа
     нет — сбрасываются, чтобы значение чужого типа не жило в карточке. */
  function update(id, patch) {
    var c = find(id);
    if (!c || !patch) return false;
    var fields = fieldsOf(c.typeCode);
    /* наименование обязательно: пустым его не сохранить */
    if ('name' in patch && !has(String(patch.name == null ? '' : patch.name).trim())) return false;
    fields.forEach(function (k) {
      if (!(k in patch)) return;
      var val = patch[k];
      if (FLAGS[k]) c[k] = val === true;
      else if (k === 'targetIrr') c[k] = typeof val === 'number' && isFinite(val) ? val : null;
      else c[k] = has(val) ? String(val).trim() : null;
    });
    Object.keys(DEFAULTS).forEach(function (k) {
      if (k === 'rwaCodes' || k === 'errorText' || fields.indexOf(k) !== -1) return;
      c[k] = clone(DEFAULTS[k]);
    });
    emit('change', { reason: 'update', id: id });
    return true;
  }

  /* Удалить можно только карточку без прикреплённых узлов: как снимать
     связь при удалении — не решено (02.10.2026). Пока никто не зовёт. */
  function remove(id) {
    var c = find(id);
    if (!c) return false;
    if (treeNodes().some(function (n) { return (n.raw.fiIds || []).indexOf(id) !== -1; })) return false;
    current.cards.splice(current.cards.indexOf(c), 1);
    emit('change', { reason: 'remove', id: id });
    return true;
  }

  function generate() {
    var T = tree();
    if (!T) return [];
    var made = [];
    generatable().forEach(function (g) {
      var id = create({ typeCode: g.typeCode, reportingType: GENERATED_REPORTING });
      if (!id) return;
      made.push(id);
      g.nodeIds.forEach(function (nodeId) { T.linkFi(nodeId, [id]); });
    });
    if (made.length) { T.commit(); commit(); }
    return made;
  }

  /* Витрины (dealId === null или persist(false)) не сохраняются. */
  function commit() {
    var dealId = current.dealId;
    if (dealId != null) {
      var cards = clone(current.cards);
      saved[String(dealId)] = cards;
      if (persistOn && api()) {
        api().put(dealId, { cards: cards }).catch(function (e) {
          if (window.console) console.warn('FinInstrumentsStore: карточки ФИ не сохранены —', e && e.message);
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

  window.FinInstrumentsStore = {
    ready: ready,
    persist: persist,
    use: use,
    dealId: function () { return current.dealId; },
    list: function () { return clone(current.cards); },
    view: view,
    card: card,
    fieldsOf: fieldsOf,
    typeOptions: typeOptions,
    reportingOptions: reportingOptions,
    fvAcOptions: fvAcOptions,
    counterpartyOptions: counterpartyOptions,
    optionNodes: optionNodes,
    generatable: generatable,
    create: create,
    update: update,
    remove: remove,
    generate: generate,
    commit: commit,
    on: on
  };
})();

/* =========================================================================
   DealsStore — единственная точка доступа к базе сделок ДИД (мок).
   Источник — window.MOCK_DEALS (mock-deals.js), тоны и правка по статусу —
   window.DEAL_STATUS_MODEL (deal-status-model.js); оба подключить ДО этого файла.

   Экспорт: window.DealsStore = {
     list() → запись[]                    — копия текущего состава (снимок)
     byId(id) → запись|null               — и по прежнему номеру сделки,
                                             если номер сменили (см. update)
     exists({ id, name, except }) → boolean — уникальность номера/наименования,
                                             сверка регистронезависимая и по
                                             обрезанным пробелам; except — номер
                                             сделки, которую правят: её запись
                                             в сверке пропускается
     statusTone(value[, scope]) → класс   — тон статусного чипа; scope 'mon' —
                                             словарь статусов мониторинга
     isEditable(deal) → boolean           — допускает ли статус сделки правку
                                             её сущностей (см. READ_ONLY_STATUSES)
     create(partial) → запись             — новая сделка (см. ниже)
     update(id, patch) → запись|null      — patch.id меняет номер сделки
     on(type, fn) → off()                 — подписка на 'change'
   }

   Общий слой для таблицы портфеля и будущей страницы сделки: правила
   валидации и уникальности живут в одном месте, экраны остаются тонкими.
   Состояние — только в памяти вкладки: перезагрузка страницы возвращает
   исходные 50 записей (см. открытый вопрос №2 плана 05.09.2026).
   ========================================================================= */
(function () {
  'use strict';

  var deals = (window.MOCK_DEALS || []).slice();
  var listeners = [];
  /* Прежние номера переименованных сделок → запись. Номер сделки и есть её
     id, а сторы, открытые по сделке раньше (CounterpartiesStore,
     ProductTreeStore), держат её под старым номером и находят запись через
     byId — окно «Редактирование сделки» на странице сделки не должно рвать
     эту связь. Живёт, как и всё здесь, в памяти страницы. */
  var renamed = {};

  function emit(type, detail) {
    listeners.forEach(function (l) { if (l.type === type) l.fn(detail); });
  }

  function norm(s) { return String(s == null ? '' : s).trim().toLowerCase(); }

  /* Тоны статусных чипов и статусы только для просмотра строятся из
     статусной модели (deal-status-model.js, window.DEAL_STATUS_MODEL) — она
     единственный источник: правка статуса — там, схема и таблицы —
     генерат deal-status-model.md. Здесь они, а не на экране: статусы одной
     сделки показывают и реестр портфеля (колонки таблицы), и страница сделки
     (чипы шапки) — две копии разошлись бы на первой же новой строке.

     Словарь тона выбирает дорожка модели (lanes[].toneScope): 'general' —
     общий, ЦУП и Operations; 'mon' — мониторинг (у него свой набор значений).
     Статус без тона в модели (tone: null) в словарь не попадает. Незнакомое
     значение — нейтральный chip--dark, а не пусто: чип без тона визуально
     неотличим от отсутствия статуса.

     Статусы, в которых сущности сделки не правятся при любой роли, —
     editable: false у дорожки общего статуса. Требования (refs/Текущий
     портфель.md): «В активной сделке нельзя редактировать сущности»;
     погашенная сделка и оба этапа утверждения — решение человека 21.09.2026.
     Статус без запрета правку не закрывает — что можно роли, решают её права. */
  var TONE_GENERAL = {};
  var TONE_MON = {};
  var READ_ONLY_STATUSES = [];

  (function fromModel(model) {
    if (!model) {
      console.error('DealsStore: нет window.DEAL_STATUS_MODEL — подключите deal-status-model.js до deals-store.js');
      return;
    }
    var scopeOf = {}, statusLane = null;
    model.lanes.forEach(function (l) {
      scopeOf[l.id] = l.toneScope;
      if (l.field === 'status') statusLane = l.id;
    });
    model.statuses.forEach(function (s) {
      if (s.tone) (scopeOf[s.lane] === 'mon' ? TONE_MON : TONE_GENERAL)[s.label] = s.tone;
      if (s.lane === statusLane && s.editable === false) READ_ONLY_STATUSES.push(s.label);
    });
  })(window.DEAL_STATUS_MODEL);

  function statusTone(value, scope) {
    var map = (scope === 'mon') ? TONE_MON : TONE_GENERAL;
    return map[value] || 'chip--dark';
  }

  function isEditable(deal) {
    return !!deal && READ_ONLY_STATUSES.indexOf(deal.status) === -1;
  }

  /* только текущие номера — для сверки уникальности */
  function byCurrentId(id) {
    var key = String(id);
    for (var i = 0; i < deals.length; i++) if (String(deals[i].id) === key) return deals[i];
    return null;
  }

  function byId(id) {
    return byCurrentId(id) || renamed[String(id)] || null;
  }

  function exists(query) {
    query = query || {};
    var skip = (query.except != null && String(query.except) !== '') ? byCurrentId(query.except) : null;
    if (query.id != null && String(query.id) !== '') {
      var hit = byCurrentId(String(query.id).trim());
      if (hit && hit !== skip) return true;
    }
    if (query.name != null && String(query.name) !== '') {
      var n = norm(query.name);
      for (var i = 0; i < deals.length; i++) if (deals[i] !== skip && norm(deals[i].name) === n) return true;
    }
    return false;
  }

  /* Новая сделка: только номер, наименование и статус (Черновик по правилу
     ТЗ — «все новые сделки создаются с этим статусом») — остальные поля
     заполняются позже, на странице сделки. */
  function create(partial) {
    var deal = Object.assign({
      status: 'Черновик', statusTsup: 'Черновик', statusOps: 'Черновик', statusMon: 'На утверждении',
      restricted: 'Нет',
      desk: '', director: '', manager: '', tsupEmployee: '',
      knr: [], gsz: '',
      jointness: '', collateral: '', corpGovernance: [], boardRep: '', finTpl: '',
      description: '', operationsComment: '', additionalIncome: '',
      ceParticipation: false, ifDeskParticipation: false, restructured: false,
      riskCategory: null, relatedDeals: [],
      signDate: '', firstDisb: '', endDate: '', repayDate: '',
      monitoringTransferDate: '', changeReason: '',
      monEntity: '',
      mainProductDid: '', productsDidNames: [], productsNames: [],
      balances: [], currencies: [], isTypeC: false,
      projectInformation: null,
    }, partial);
    deals.unshift(deal);
    emit('change', { type: 'create', deal: deal });
    return deal;
  }

  /* patch.id — смена номера: запись правится на месте, прежний номер
     остаётся псевдонимом (см. renamed выше). */
  function update(id, patch) {
    var deal = byId(id);
    if (!deal) return null;
    if (patch && patch.id != null && String(patch.id) !== String(deal.id)) {
      renamed[String(deal.id)] = deal;
      delete renamed[String(patch.id)];
    }
    Object.assign(deal, patch);
    emit('change', { type: 'update', id: id, patch: patch, deal: deal });
    return deal;
  }

  function on(type, fn) {
    var entry = { type: type, fn: fn };
    listeners.push(entry);
    return function off() {
      var idx = listeners.indexOf(entry);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  window.DealsStore = {
    list: function () { return deals.slice(); },
    byId: byId,
    exists: exists,
    create: create,
    update: update,
    statusTone: statusTone,
    isEditable: isEditable,
    on: on,
  };
})();

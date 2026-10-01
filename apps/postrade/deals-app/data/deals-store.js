/* =========================================================================
   DealsStore — единственная точка доступа к базе сделок ДИД (мок).
   Источник — window.MOCK_DEALS (mock-deals.js), подключить ДО этого файла.

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

  /* Тон статусного чипа. Словарь живёт здесь, а не на экране: статусы одной
     сделки показывают и реестр портфеля (колонки таблицы), и страница сделки
     (чипы шапки) — две копии словаря разошлись бы на первой же новой строке.
     scope: 'general' — общий, ЦУП и Operations; 'mon' — мониторинг (у него свой
     набор значений). Незнакомое значение — нейтральный chip--dark, а не пусто:
     чип без тона визуально неотличим от отсутствия статуса. */
  var TONE_GENERAL = {
    'Черновик': 'chip--dark',
    'Ожидает подтверждения': 'chip--warning',
    'Подтверждение изменений': 'chip--warning',
    'Ожидает назначения ответственного': 'chip--warning',
    'Корректировка': 'chip--info',
    'Ввод изменений': 'chip--info',
    'Корректировка изменений': 'chip--info',
    'Активная': 'chip--success',
    'Утверждена': 'chip--success',
    'На сопровождении': 'chip--success',
    'Погашена': 'chip--dpurple'
  };
  var TONE_MON = {
    'На утверждении': 'chip--dark',
    'Утверждена': 'chip--dark',
    'Ожидает передачи на мониторинг': 'chip--warning',
    'Направлена на передачу': 'chip--warning',
    'Передана': 'chip--warning',
    'Изменения ожидают передачи на мониторинг': 'chip--warning',
    'Изменения направлены на передачу': 'chip--warning',
    'Передача изменений': 'chip--warning',
    'На мониторинге ГК СБИ': 'chip--success',
    'На мониторинге ПАО Сбербанк': 'chip--success',
    'Погашена': 'chip--dpurple'
  };

  function statusTone(value, scope) {
    var map = (scope === 'mon') ? TONE_MON : TONE_GENERAL;
    return map[value] || 'chip--dark';
  }

  /* Статусы сделки, в которых её сущности не правятся — при любой роли.
     Требования (refs/Текущий портфель.md): «В активной сделке нельзя
     редактировать сущности». Погашенная сделка и оба этапа утверждения —
     решение человека 21.09.2026. Список живёт рядом со словарём тонов по той
     же причине: страница сделки и реестр читают одно правило. Статус без
     запрета (Черновик, Корректировка, Ввод изменений…) правку не закрывает —
     что можно роли, решают её права. */
  var READ_ONLY_STATUSES = ['Активная', 'Погашена', 'Ожидает подтверждения', 'Подтверждение изменений'];

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
      monEntity: '',
      mainProductDid: '', productsDidNames: [], productsNames: [],
      balances: [], currencies: [], isPE: false,
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

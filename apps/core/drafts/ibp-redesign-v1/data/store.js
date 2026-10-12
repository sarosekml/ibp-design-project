/* =========================================================================
   store.js — общее хранилище прототипа ibp-redesign-v1.

   Выборки по id, действия Р7 («Взять в работу», «Отказаться», «Переместить
   в Pipeline», статусы задач и встреч), флаг «просмотрено». Страницы не
   читают MOCK_* напрямую: всё берут отсюда, поэтому список в реестре,
   карточка сделки и соседние реестры не расходятся.

   Состояние (правки демо-данных) живёт в sessionStorage — переживает
   переходы между страницами прототипа; сброс — сценарием панели прототипа
   (IBPR.reset()) или очисткой хранилища. «Сегодня» прототипа зафиксировано
   (демо детерминировано). Образец — new-dashboard-mvp/data/home-store.js.

   Подключается после всех data/*.js. API (window.IBPR):
     registry(source, tab) · registryTotal(source, tab)
     opportunity(id) · product(productId) · clients() · client(id)
     potentials(kind) · potential(id) · meetings(scope) · meeting(id)
     tasks(scope) · task(id) · employees() · employee(id)
     takeToWork(id) · refuse(id, rq) · moveLeadToPipeline(leadId) · removeProduct(productId)
     setTaskStatus(id, code) · reassignTask(id, employeeId)
     finishMeeting(id) · cancelMeeting(id) · markViewed(dealId)
     reset() · on(fn) → снять подписку
     lbl — подписи кодов (статусы, приоритеты, ТБ, группы продуктов)
   ========================================================================= */
(function () {
  'use strict';

  var TODAY = '2026-10-10';
  var STORE_KEY = 'ibp-redesign-v1-state';
  var seq = { deal: 130100 };

  function copy(v) { return JSON.parse(JSON.stringify(v)); }

  /* Выборка по ID должна однозначно определять объект во всех реестрах. */
  function uniqueRows(rows, kind) {
    var seen = new Set();
    rows.forEach(function (row) {
      var key = String(row.id);
      if (seen.has(key)) throw new Error('Повторяющийся ID ' + key + ' в ' + kind);
      seen.add(key);
    });
    return rows;
  }

  uniqueRows(window.MOCK_CLIENTS, 'clients');
  uniqueRows(window.MOCK_EMPLOYEES, 'employees');

  var data = {
    opportunities: copy(uniqueRows(window.MOCK_OPPORTUNITIES, 'opportunities')),
    potentials: copy(uniqueRows(window.MOCK_POTENTIALS, 'potentials')),
    meetings: copy(uniqueRows(window.MOCK_MEETINGS, 'meetings')),
    tasks: copy(uniqueRows(window.MOCK_TASKS, 'tasks')),
    clientComments: { }
  };

  var listeners = [];
  function emit(kind, detail) { listeners.slice().forEach(function (fn) { fn({ kind: kind, detail: detail }); }); }

  /* ── Сохранение и восстановление ─────────────────────────────────────── */
  function save() {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ data: data, seq: seq })); } catch (e) { /* хранилище недоступно — живём в памяти */ }
  }
  function restore() {
    try {
      var raw = sessionStorage.getItem(STORE_KEY);
      if (!raw) return;
      var s = JSON.parse(raw);
      if (s && s.data) {
        ['opportunities', 'potentials', 'meetings', 'tasks'].forEach(function (kind) { uniqueRows(s.data[kind], kind); });
        data = s.data; seq = s.seq || seq;
      }
    } catch (e) { /* битое состояние — стартуем со стартовых данных */ }
  }
  function reset() {
    data = {
      opportunities: copy(window.MOCK_OPPORTUNITIES),
      potentials: copy(window.MOCK_POTENTIALS),
      meetings: copy(window.MOCK_MEETINGS),
      tasks: copy(window.MOCK_TASKS),
      clientComments: { }
    };
    seq = { deal: 130100 };
    try { sessionStorage.removeItem(STORE_KEY); } catch (e) { /* нет хранилища */ }
    emit('reset', null);
  }
  restore();

  /* ── Выборки ─────────────────────────────────────────────────────────── */
  function registry(source, tab) {
    return data.opportunities.filter(function (o) {
      return o.source === source && (!tab || o.tab === tab);
    });
  }
  function opportunity(id) {
    id = Number(id);
    return data.opportunities.filter(function (o) { return o.id === id; })[0] || null;
  }
  function product(productId) {
    for (var i = 0; i < data.opportunities.length; i++) {
      var ps = data.opportunities[i].products || [];
      for (var k = 0; k < ps.length; k++) if (ps[k].id === productId) return { deal: data.opportunities[i], product: ps[k] };
    }
    return null;
  }
  function clients() { return window.MOCK_CLIENTS; }
  function client(id) { return clients().filter(function (c) { return c.id === id; })[0] || null; }
  /* комментарии клиента: новые живут в стор-состоянии и переживают переходы
     между страницами (sessionStorage), исходный список — в clients.js */
  function clientComments(id) {
    return (data.clientComments[id] || []).concat(((client(id) || {}).comments) || []);
  }
  function addClientComment(id, text) {
    if (!data.clientComments[id]) data.clientComments[id] = [];
    var now = new Date();
    var hh = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    var rec = { authorId: (window.MOCK_CURRENT_USER || {}).id || '04127', time: hh, date: TODAY, text: text, system: false };
    data.clientComments[id].unshift(rec);
    save(); emit('clients', { commented: id });
    return rec;
  }
  /* лиды: по умолчанию без перемещённых в Pipeline (они ушли из реестра «Лиды») */
  function potentials(kind, includeMoved) {
    return data.potentials.filter(function (p) {
      return (!kind || p.kind === kind) && (includeMoved || p.statusCode !== 'MOVED_TO_PIPELINE');
    });
  }
  function potential(id) { return data.potentials.filter(function (p) { return p.id === id; })[0] || null; }
  /* scope: 'MY' — мои (вкладка «Мои встречи»), иначе все встречи деска */
  function meetings(scope) {
    return data.meetings.filter(function (m) { return scope !== 'MY' || m.isMine; });
  }
  function meeting(id) { return data.meetings.filter(function (m) { return m.id === id; })[0] || null; }
  /* scope: 'MY' — мои (вкладка «Мои задачи»), иначе все задачи деска */
  function tasks(scope) {
    return data.tasks.filter(function (t) { return scope !== 'MY' || t.isMine; });
  }
  function task(id) { id = Number(id); return data.tasks.filter(function (t) { return t.id === id; })[0] || null; }
  function employees() { return window.MOCK_EMPLOYEES; }
  function employee(id) { return employees().filter(function (e) { return e.id === id; })[0] || null; }

  /* ── Действия Р7 ─────────────────────────────────────────────────────── */
  /* «Взять в работу»: сделка уходит из источника (binding/possible/cib) в
     Pipeline «Сделки моего деска», стадия — «Проработка идеи сделки».
     Допущение по смыслу кнопки (открытый вопрос 2 ТЗ). */
  function takeToWork(id) {
    var o = opportunity(id);
    if (!o || o.source === 'pipeline' || o.source === 'campaign') return null;
    o.source = 'pipeline';
    o.tab = 'my-desk';
    o.stageCode = 'IDEA';
    o.viewed = true;
    o.totalVolume = o.totalVolume || (o.financials ? o.financials.totalVolume : null);
    save(); emit('opportunities', { taken: o });
    return o;
  }

  /* «Отказаться»: сделка уходит во вкладку «В архиве» своего источника. */
  function refuse(id, rq) {
    var o = opportunity(id);
    if (!o || o.source === 'pipeline') return null;
    o.statusCode = 'DROPPED';
    o.stageCode = 'WORK_STOPPED';
    o.tab = 'archive';
    o.probability = 0;
    o.dropoutReasonCode = (rq && rq.reasonCode) || 'WAIT_EXPIRED';
    o.dropoutComment = (rq && rq.comment) || o.dropoutComment;
    save(); emit('opportunities', { refused: o });
    return o;
  }

  /* «Переместить в Pipeline» (лид): создаётся новая сделка в Pipeline
     «Сделки моего деска», лид получает статус MOVED_TO_PIPELINE и ссылку.
     Появление лида в реестре Pipeline — требование раздела «Зачем» ТЗ. */
  function moveLeadToPipeline(leadId) {
    var p = potential(leadId);
    if (!p || p.statusCode === 'MOVED_TO_PIPELINE') return null;
    var c = client(p.clientId);
    var newId = ++seq.deal;
    var deal = {
      id: newId, project: 'Идея: ' + p.idea,
      clientId: p.clientId, clientName: p.clientName, holdingName: p.holdingName,
      potentialId: p.id, industry: p.industry, macro: p.macro, sub: p.sub, clientCrmId: p.clientId,
      description: p.idea,
      terBank: c ? c.terBank : 'CA', gosb: c ? c.gosb : '8634', keyDeal: false,
      priorityCode: 'MEDIUM', realtyType: '',
      productLabels: [], productGroupLabels: [],
      totalVolume: null, source: 'pipeline', tab: 'my-desk', statusCode: 'WORK',
      stageCode: 'IDEA', probability: 0, onePager: false, pikIk: false, termsChanged: false,
      version: 'Версия 1', versionDate: TODAY, calendarDays: 0,
      alertK1: false, tbGosbWarning: false, routingChip: false,
      dates: { startAt: TODAY, kpkiAt: '', signAt: '', issueAt: '' },
      financials: null, products: [],
      desks: [{ deskId: 'D-SMB-NR6', roleLabel: 'Ответственный' }],
      team: copy(p.team), relatedDeals: [], showTasksTile: false,
      meetings: { planned: 0, completed: 0, attention: 0 }, protocolsProjectSales: null,
      comments: [], dropoutReasonCode: null, dropoutComment: '',
      growthCompany: p.growthCompany, didGrowthCompany: p.didGrowthCompany, topClient: p.topClient,
      viewed: true, createdBy: p.createdBy, createdAt: TODAY
    };
    data.opportunities.push(deal);
    p.statusCode = 'MOVED_TO_PIPELINE';
    p.createdDealId = newId;
    save(); emit('opportunities', { createdFromLead: deal, lead: p });
    return { lead: p, deal: deal };
  }

  /* «Удалить» продукт: продукт уходит из сделки (Р7). */
  function removeProduct(productId) {
    var f = product(productId);
    if (!f) return null;
    f.deal.products = f.deal.products.filter(function (p) { return p.id !== productId; });
    save(); emit('opportunities', { productRemoved: f.product, deal: f.deal });
    return f;
  }

  function setTaskStatus(id, code) {
    var t = task(id);
    if (!t) return null;
    t.statusCode = code;
    t.history.push({ date: TODAY, event: 'Смена статуса', name: t.name, statusCode: code, description: t.description, priorityCode: t.priorityCode });
    save(); emit('tasks', { changed: t });
    return t;
  }

  function reassignTask(id, employeeId) {
    var t = task(id);
    if (!t) return null;
    t.executorId = employeeId;
    t.history.push({ date: TODAY, event: 'Переназначение исполнителя', name: t.name, statusCode: t.statusCode, description: t.description, priorityCode: t.priorityCode });
    save(); emit('tasks', { changed: t });
    return t;
  }

  function setMeetingStatus(id, code) {
    var m = meeting(id);
    if (!m) return null;
    m.statusCode = code;
    m.modifiedAt = TODAY;
    if (code === 'CANCELLED' || code === 'COMPLETED') m.needsAttention = false;
    save(); emit('meetings', { changed: m });
    return m;
  }

  function markViewed(id) {
    var o = opportunity(id);
    if (!o || o.viewed) return;
    o.viewed = true;
    save(); emit('opportunities', { viewed: o });
  }

  /* ── Подписи кодов (для таблиц и чипов) ──────────────────────────────── */
  var lbl = {
    terBank: function (code) { return window.DICT_TER_BANKS[code] || code || '–'; },
    desk: function (id) { var d = window.DICT_DESKS.filter(function (x) { return x.id === id; })[0]; return d ? d.name : id; },
    oppStatus: function (code) { return window.OPPORTUNITY_STATUS_LABELS[code] || code; },
    oppStage: function (code) { return window.OPPORTUNITY_STAGE_LABELS[code] || code; },
    dropReason: function (code) { return window.DROP_REASON_LABELS[code] || code || ''; },
    leadStatus: function (code) { return window.LEAD_STATUS_LABELS[code] || code; },
    meetingStatus: function (code) { return window.MEETING_STATUS_LABELS[code] || code; },
    taskStatus: function (code) { return window.TASK_STATUS_LABELS[code] || code; },
    priority: function (code) { return window.PRIORITY_LABELS[code] || code; },
    productGroup: function (code) { return window.PRODUCT_GROUP_LABELS[code] || code; },
    employeeRole: function (code) { return window.EMPLOYEE_ROLE_LABELS[code] || code; },
    leadKind: function (code) { return window.LEAD_KIND_LABELS[code] || code; }
  };

  window.IBPR = {
    today: TODAY,
    user: window.MOCK_CURRENT_USER,
    registry: registry,
    registryTotal: function (source, tab) { return registry(source, tab).length; },
    opportunity: opportunity,
    product: product,
    clients: clients,
    client: client,
    clientComments: clientComments,
    addClientComment: addClientComment,
    holdings: window.MOCK_HOLDINGS,
    potentials: potentials,
    potential: potential,
    meetings: meetings,
    meeting: meeting,
    tasks: tasks,
    task: task,
    employees: employees,
    employee: employee,
    takeToWork: takeToWork,
    refuse: refuse,
    moveLeadToPipeline: moveLeadToPipeline,
    removeProduct: removeProduct,
    setTaskStatus: setTaskStatus,
    reassignTask: reassignTask,
    finishMeeting: function (id) { return setMeetingStatus(id, 'COMPLETED'); },
    cancelMeeting: function (id) { return setMeetingStatus(id, 'CANCELLED'); },
    markViewed: markViewed,
    reset: reset,
    save: save,
    on: function (fn) {
      listeners.push(fn);
      return function () { listeners = listeners.filter(function (x) { return x !== fn; }); };
    },
    lbl: lbl,
    fmt: window.DICT_FMT,
    registryConfig: function (id) { return window.REGISTRY_CONFIGS.filter(function (r) { return r.id === id; })[0] || null; },
    leadRegistryConfig: function (id) { return window.LEAD_REGISTRY_CONFIGS.filter(function (r) { return r.id === id; })[0] || null; }
  };
})();

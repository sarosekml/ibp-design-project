/* Матрица MS0015: стадии и критерии согласованы для демо 12.10.2026.
   Правила реального продукта остаются открытыми. Source: invented (12.10.2026). */
(function () {
  'use strict';
  /** @typedef {Object} LeadStageRsDto
   * @property {string} code Код стадии.
   * @property {string} title Название.
   * @property {string} tone Тон Chip ДС.
   * @property {string} goal Цель шага.
   * @property {string[]} next Допустимые следующие стадии.
   * @property {string} action Главное действие.
   * @property {boolean} final Финальный исход.
   * Source: invented (12.10.2026). */
  /** @type {LeadStageRsDto[]} */
  var stages = [
    { code: 'REVIEW', title: 'Рассмотрение', tone: 'primary', goal: 'Решить, брать ли лид в работу', next: ['IDEA', 'NOT_TAKEN'], action: 'Взять в работу' },
    { code: 'IDEA', title: 'Идея', tone: 'lblue', goal: 'Описать предложение клиенту', next: ['RESEARCH'], action: 'Описать идею' },
    { code: 'RESEARCH', title: 'В проработке', tone: 'lblue', goal: 'Подготовить разговор с клиентом', next: ['MEETING_PLANNED'], action: 'Назначить встречу' },
    { code: 'MEETING_PLANNED', title: 'Встреча назначена', tone: 'orange', goal: 'Провести встречу и зафиксировать итоги', next: ['MEETING_DONE'], action: 'Зафиксировать итоги' },
    { code: 'MEETING_DONE', title: 'Встреча проведена', tone: 'orange', goal: 'Подтвердить договорённости и подготовить документы', next: ['DOCUMENTS'], action: 'К документам' },
    { code: 'DOCUMENTS', title: 'Подготовка документов', tone: 'dpurple', goal: 'Проверить готовность к передаче', next: ['PIPELINE'], action: 'Передать в Pipeline' },
    { code: 'PIPELINE', title: 'Передано в Pipeline', tone: 'green', goal: 'Продолжить работу по сделке', next: [], action: 'Открыть сделку', final: true },
    { code: 'DECLINED', title: 'Клиент отказался', tone: 'red', goal: 'Сохранить причину отказа', next: [], action: 'Вернуть в работу', final: true },
    { code: 'NOT_TAKEN', title: 'Не беру', tone: 'grey', goal: 'Сохранить решение аналитика', next: [], action: 'Вернуть в подборку', final: true }
  ];
  /** @typedef {Object} LeadClientStatusRsDto
   * @property {'ACTIVE'|'IN_PLAN'|'INACTIVE'|'REFUSED'} code Код статуса клиента.
   * @property {string} title Подпись.
   * @property {string} tone Тон Chip ДС.
   * Source: invented (13.10.2026, MS0016 §2.5; смысл для продукта — открытый вопрос). */
  /** @type {Object<string, LeadClientStatusRsDto>} */
  var clientStatus = {
    ACTIVE: { code: 'ACTIVE', title: 'Активен', tone: 'green' },
    IN_PLAN: { code: 'IN_PLAN', title: 'В плане', tone: 'lblue' },
    INACTIVE: { code: 'INACTIVE', title: 'Не активен', tone: 'grey' },
    REFUSED: { code: 'REFUSED', title: 'Отказался', tone: 'red' }
  };
  // icon — глиф одноимённого раздела системы (каталог ibp-home.js; лиды ДИД и КМ — раздел «Лиды»), MS0016.
  var basis = {
    BINDING_OPPORTUNITY: { icon: 'Important-deals', title: 'Обязательная сделка', tone: 'red', colors: ['--st-red-light','--st-red-dark','--st-red'], page: 'opportunity', source: 'binding' },
    POSSIBLE_OPPORTUNITY: { icon: 'deals-possible-deals', title: 'Возможная сделка', tone: 'lblue', colors: ['--st-blue-light','--st-blue-dark','--st-blue'], page: 'opportunity', source: 'possible' },
    DID_LEAD: { icon: 'file-basic', title: 'Лид ДИД', tone: 'primary', colors: ['--st-primary-light','--st-primary-dark','--st-primary'], page: 'potential' },
    CM_LEAD: { icon: 'file-basic', title: 'Лид для КМ', tone: 'green', colors: ['--st-green-light','--st-green-dark','--st-green'], page: 'potential' },
    BINDING_LEAD: { icon: 'important-leads', title: 'Обязательный лид', tone: 'orange', colors: ['--st-orange-light','--st-orange-dark','--st-orange'], page: 'bindingLeads' },
    POSSIBLE_LEAD: { icon: 'possible-leads', title: 'Возможный лид', tone: 'grey', colors: ['--pink-50','--pink-800','--pink-500'], page: 'possibleLeads' },
    CIB_SALES_PROJECT: { icon: 'sales-projects', title: 'Проект продаж CIB', tone: 'dpurple', colors: ['--st-dpurple-light','--st-dpurple-dark','--st-dpurple'], page: 'opportunity', source: 'cib' },
    SALES_CAMPAIGN: { icon: 'sales-company', title: 'Кампания продаж', tone: 'dpurple', colors: ['--indigo-50','--indigo-800','--indigo-500'], page: 'opportunity', source: 'campaign' },
    MEETING: { icon: 'calendar', title: 'Из встречи', tone: 'orange', colors: ['--cyan-50','--cyan-800','--cyan-500'], page: 'meetings' }
  };
  function checks(lead) {
    var m = (lead.meetings || []).filter(function (item) { return item.statusCode !== 'CANCELLED'; });
    var done = m.filter(function (item) { return item.statusCode === 'COMPLETED'; });
    var fields = [
      { key: 'idea', title: 'Идея сделки описана', done: !!lead.idea, action: 'edit' },
      { key: 'products', title: 'Продукт выбран', done: lead.products.length > 0, action: 'edit' },
      { key: 'amount', title: 'Объём оценён', done: lead.amountMln > 0, action: 'edit' }
    ];
    var meeting = [
      { key: 'meeting', title: 'Встреча назначена', done: m.length > 0, action: 'meeting' },
      { key: 'participants', title: 'Участники клиента указаны', done: m.some(function (x) { return x.participantsClient.length > 0; }), action: 'meeting' },
      { key: 'agenda', title: 'Повестка и продукты указаны', done: m.some(function (x) { return x.agenda.length > 0 && x.productsToDiscuss.length > 0; }), action: 'meeting' }
    ];
    var protocol = [
      { key: 'meetingDone', title: 'Встреча завершена', done: done.length > 0, action: 'outcome' },
      { key: 'protocol', title: 'Итоги и договорённости записаны', done: !!lead.protocol, action: 'outcome' }
    ];
    var docs = [
      { key: 'onePager', title: 'One Pager согласован', done: !!lead.documents.onePager, action: 'documents' },
      { key: 'termSheet', title: 'Term Sheet направлен', done: !!lead.documents.termSheet, action: 'documents' },
      { key: 'clientDocs', title: 'Документы клиента проверены', done: !!lead.documents.clientDocs, action: 'documents' }
    ];
    if (lead.stage === 'REVIEW') return [{ key: 'basis', title: 'Рекомендуется посмотреть основание', done: !!lead.basisViewed, action: 'basis', optional: true }];
    if (lead.stage === 'IDEA') return fields;
    if (lead.stage === 'RESEARCH' || lead.stage === 'MEETING_PLANNED') return meeting;
    if (lead.stage === 'MEETING_DONE') {
      if (lead.repeatNeeded && m.some(function (item) { return item.statusCode === 'SCHEDULED'; })) protocol.push({key:'repeatDone',title:'Повторная встреча завершена',done:false,action:'outcome'});
      return protocol;
    }
    if (lead.stage === 'DOCUMENTS') return fields.concat(docs);
    return [];
  }
  window.LEAD_STAGES = {
    all: stages, working: stages.filter(function (s) { return s.code !== 'REVIEW' && !s.final; }),
    workflow: stages.filter(function (s) { return !s.final || s.code === 'PIPELINE'; }), basis: basis,
    get: function (code) { return stages.find(function (s) { return s.code === code; }); },
    checks: checks,
    next: function (lead) { var stage = stages.find(function (s) { return s.code === lead.stage; }); return stage.defaultNext || stage.next[0]; },
    reasons: { NOT_TAKEN: ['Не соответствует фокусу работы', 'Уже есть лид по этому предложению', 'Недостаточно данных', 'Вернуться позже'], DECLINED: ['Нет потребности', 'Не подходят условия', 'Выбран другой банк', 'Другая причина'] },
    clientStatus: clientStatus
  };
})();

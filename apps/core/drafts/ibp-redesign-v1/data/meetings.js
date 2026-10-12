/* =========================================================================
   meetings.js — встречи демо-данных концепта ibp-redesign-v1.

   Формат ID встречи — M-8904 (как в системе, ТЗ MS0014 §«Коротко»).
   Источник встречи — лид (Потенциал), клиент или сделка ДИД; каждый источник
   ссылается на существующий объект демо-данных. У запланированных встреч
   есть действия «Завершить» и «Отменить» (Р7). needsAttention — «красная
   Запланирована» со снимка системы (смысл неизвестен, вопрос 5 ТЗ).
   Source: invented (10.10.2026).
   ========================================================================= */

/**
 * Встреча.
 * Source: invented (10.10.2026) — заменить полями DTO, когда появится контракт.
 * @typedef {Object} MeetingRsDto
 * @property {string} id                 ID встречи (M-8904)
 * @property {MeetingStatusCode} statusCode статус
 * @property {boolean} needsAttention    «красная Запланирована» (вопрос 5 ТЗ)
 * @property {string} clientId           CRM ID клиента
 * @property {string} clientName         клиент
 * @property {string} holdingName        холдинг
 * @property {string[]} deskChips        отраслевой деск (чипы)
 * @property {string[]} desks            дески (чипы)
 * @property {'POTENTIAL'|'CLIENT'|'DEAL'} sourceType тип источника встречи
 * @property {string} sourceId           ID источника (лид, клиент или сделка)
 * @property {string} date               дата встречи (ISO)
 * @property {string} timeStart          начало (ЧЧ:ММ)
 * @property {string} timeEnd            окончание (ЧЧ:ММ)
 * @property {string} timezone           временная зона («UTC+3»)
 * @property {string} place              место встречи
 * @property {string} createdAt          дата создания (ISO)
 * @property {string} modifiedAt         дата изменения (ISO)
 * @property {string} organizerId        организатор (employeeId)
 * @property {string} commMethod         способ коммуникации
 * @property {string[]} productsToDiscuss продукты к обсуждению
 * @property {{fullName:string,position:string}[]} participantsClient участники со стороны клиента
 * @property {string[]} participantsDid  участники со стороны ДИД (employeeId)
 * @property {boolean} stratDialog       «Проведен страт. диалог»
 * @property {boolean} withKm            «Встреча с участием КМ»
 * @property {boolean} withSponsor       «Встреча с участием спонсора»
 * @property {{title:string,taskIds:number[]}[]} agenda повестка встречи (темы со ссылками на задачи)
 * @property {{label:string,page:string,params:string}[]} links связи («Сделка ДИД … →», «Лид … →»); page — ключ страницы IBPR_NAV.PAGES
 * @property {boolean} isMine            моя встреча (вкладка «Мои встречи»)
 */

(function () {
  'use strict';

  var CLIENTS = window.MOCK_CLIENTS;
  var TOPICS = ['Инвестиционная программа: структура и сроки', 'Залоговая база и поручительства', 'Финансовая модель проекта', 'Клиентская экосистема: РКО и зарплатный проект', 'План поставок и контрактная база'];

  function mkMeeting(o) {
    var c = CLIENTS[o.clientIdx % CLIENTS.length];
    return {
      id: o.id, statusCode: o.statusCode || 'SCHEDULED', needsAttention: !!o.needsAttention,
      clientId: c.id, clientName: c.name, holdingName: c.holdingName,
      deskChips: ['SMB Природные ресурсы +6'].concat(o.i % 3 === 0 ? ['CIB Москва'] : []),
      desks: ['ДИД Центральный'].concat(o.i % 2 === 0 ? ['CIB Регионы', 'SMB Промышленность'] : []),
      sourceType: o.sourceType || 'POTENTIAL', sourceId: o.sourceId,
      date: o.date, timeStart: '10:00', timeEnd: '11:30', timezone: 'UTC+3',
      place: o.i % 2 === 0 ? 'Офис клиента, переговорная 2' : 'Офис банка, переговорная 514',
      createdAt: '2026-09-' + String(1 + o.i % 28).padStart(2, '0'), modifiedAt: '2026-10-0' + (1 + o.i % 9),
      organizerId: ['04127', '03882', '05204'][o.i % 3], commMethod: o.i % 4 === 0 ? 'Видеоконференция' : 'Личная встреча',
      productsToDiscuss: o.i % 2 === 0 ? ['Инвестиционный кредит', 'Мезонинное финансирование'] : ['Возобновляемая кредитная линия'],
      participantsClient: c.relatedPersons.slice(0, 2).map(function (p) { return { fullName: p.fullName, position: p.role }; }),
      participantsDid: ['04127', '02940'],
      stratDialog: o.i % 3 === 0, withKm: o.i % 4 === 0, withSponsor: false,
      agenda: [], links: [], isMine: o.i % 3 !== 2
    };
  }

  var meetings = [];

  /* ── Герой: M-8904 — полная карточка предпросмотра (§4.9) ───────────── */
  var zarya = CLIENTS[3];
  meetings.push({
    id: 'M-8904', statusCode: 'SCHEDULED', needsAttention: false,
    clientId: zarya.id, clientName: zarya.name, holdingName: zarya.holdingName,
    deskChips: ['SMB Природные ресурсы +6', 'CIB Москва'],
    desks: ['ДИД Центральный', 'CIB Регионы', 'SMB Промышленность'],
    sourceType: 'POTENTIAL', sourceId: 'L-118846',
    date: '2026-10-15', timeStart: '10:00', timeEnd: '11:30', timezone: 'UTC+3',
    place: 'Офис клиента, переговорная 2',
    createdAt: '2026-10-01', modifiedAt: '2026-10-07',
    organizerId: '04127', commMethod: 'Личная встреча',
    productsToDiscuss: ['Инвестиционный кредит', 'Мезонинное финансирование'],
    participantsClient: [
      { fullName: 'Гайдар Игорь Львович', position: 'Генеральный директор' },
      { fullName: 'Полозкова Марина Юрьевна', position: 'Финансовый директор' }
    ],
    participantsDid: ['04127', '02940', '01855'],
    stratDialog: true, withKm: true, withSponsor: false,
    agenda: [
      { title: 'Модернизация мукомольной линии: структура финансирования', taskIds: [169437, 169440] },
      { title: 'Залоговая база: перечень оборудования', taskIds: [169442] }
    ],
    links: [
      { label: 'Сделка ДИД 129451', page: 'opportunity', params: 'source=pipeline&id=129451&tab=my-desk' },
      { label: 'Лид L-12345', page: 'potential', params: 'id=L-12345' }
    ],
    isMine: true
  });

  /* «Красная Запланирована» со снимка системы — вопрос 5 ТЗ. */
  meetings.push(mkMeeting({ id: 'M-9614', statusCode: 'SCHEDULED', needsAttention: true, clientIdx: 0, i: 1, sourceType: 'CLIENT', sourceId: '3000012345', date: '2026-10-06' }));
  meetings.push(mkMeeting({ id: 'M-9466', statusCode: 'SCHEDULED', needsAttention: true, clientIdx: 6, i: 4, sourceType: 'DEAL', sourceId: '166241', date: '2026-09-29' }));
  meetings.push(mkMeeting({ id: 'M-8907', statusCode: 'SCHEDULED', needsAttention: true, clientIdx: 9, i: 7, sourceType: 'POTENTIAL', sourceId: 'L-10035', date: '2026-09-22' }));

  /* Завершённые и отменённые */
  meetings.push(mkMeeting({ id: 'M-8791', statusCode: 'COMPLETED', clientIdx: 0, i: 2, sourceType: 'POTENTIAL', sourceId: 'L-44', date: '2026-10-08' }));
  meetings.push(mkMeeting({ id: 'M-8613', statusCode: 'COMPLETED', clientIdx: 1, i: 5, sourceType: 'CLIENT', sourceId: '3000012346', date: '2026-09-24' }));
  meetings.push(mkMeeting({ id: 'M-8502', statusCode: 'COMPLETED', clientIdx: 4, i: 8, sourceType: 'DEAL', sourceId: '129451', date: '2026-09-18' }));
  meetings.push(mkMeeting({ id: 'M-8415', statusCode: 'CANCELLED', clientIdx: 7, i: 3, sourceType: 'POTENTIAL', sourceId: 'L-10063', date: '2026-09-15' }));
  meetings.push(mkMeeting({ id: 'M-8307', statusCode: 'CANCELLED', clientIdx: 10, i: 6, sourceType: 'CLIENT', sourceId: '3000042008', date: '2026-09-10' }));

  /* Заполнители реестра (12 запланированных на октябрь–ноябрь) */
  var LIDS = window.DICT_FILLER_LEAD_IDS;
  for (var i = 0; i < 12; i++) {
    meetings.push(mkMeeting({
      id: 'M-9' + String(100 + i * 3),
      statusCode: i % 5 === 4 ? 'COMPLETED' : 'SCHEDULED',
      clientIdx: i + 1,
      i: i,
      sourceType: i % 3 === 0 ? 'POTENTIAL' : (i % 3 === 1 ? 'CLIENT' : 'DEAL'),
      sourceId: i % 3 === 0 ? LIDS[(i * 2) % LIDS.length] : (i % 3 === 1 ? CLIENTS[(i + 1) % CLIENTS.length].id : String(129000 + i * 2)),
      date: '2026-1' + (i % 2 === 0 ? '0' : '1') + '-' + String(10 + i % 20).padStart(2, '0')
    }));
  }

  /** @type {MeetingRsDto[]} */
  window.MOCK_MEETINGS = meetings;
})();

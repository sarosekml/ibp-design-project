/* =========================================================================
   opportunities.js — сделки демо-данных концепта ibp-redesign-v1.

   Все источники в одном массиве: source = binding | possible | cib |
   campaign | pipeline (MS0014 §6.1). Герои — сделки с полной детализацией
   для страницы сделки (Opportunity); остальные строки генерируются фабрикой
   детерминированно (без Math.random), поэтому реестры наполнены, а любой ID
   из любой таблицы открывает свою страницу.

   Форматы идентификаторов — как в системе (ТЗ MS0014 §«Коротко»): сделка
   166092, лид L-44, продажа LD-12345. Имена и значения — правдоподобные,
   Source: invented (10.10.2026).
   ========================================================================= */

/**
 * Сделка.
 * Source: invented (10.10.2026) — заменить полями DTO, когда появится контракт.
 * @typedef {Object} OpportunityRsDto
 * @property {number} id                      ID сделки (166092)
 * @property {string} project                 проект
 * @property {string} clientId                CRM ID клиента
 * @property {string} clientName              клиент
 * @property {string} holdingName             холдинг
 * @property {string|null} potentialId        ID потенциала (лида) или null
 * @property {string} industry                отрасль
 * @property {string} macro                   макроотрасль
 * @property {string} sub                     подотрасль
 * @property {string} clientCrmId             CRM ID клиента (колонка)
 * @property {string} description             описание
 * @property {string} terBank                 код ТБ
 * @property {string} gosb                    ГОСБ
 * @property {boolean} keyDeal                ключевая сделка
 * @property {string} priorityCode            приоритет (MAX | HIGH | MEDIUM | LOW)
 * @property {string} realtyType              тип недвижимости
 * @property {string[]} productLabels         продукты сделки (чипы)
 * @property {string[]} productGroupLabels    группы продуктов (чипы)
 * @property {number|null} totalVolume        общий объем по сделке, млн руб. (Pipeline)
 * @property {OpportunitySourceCode} source   источник (раздел)
 * @property {OpportunityTabCode} tab         вкладка реестра внутри источника
 * @property {OpportunityStatusCode} statusCode статус
 * @property {OpportunityStageCode} stageCode стадия
 * @property {number} probability             вероятность сделки, %
 * @property {boolean} onePager               согласован One Pager
 * @property {boolean} pikIk                  пройден ПИК / ИК
 * @property {boolean} termsChanged           «Изменение условий / Реструктуризация»
 * @property {string} version                 «Версия N»
 * @property {string} versionDate             дата версии (ISO)
 * @property {number} calendarDays            число у иконки calendar в шапке (смысл — вопрос 6)
 * @property {boolean} alertK1                Alert «Данные К1…» (CIB и кампании)
 * @property {boolean} tbGosbWarning          предупреждающий значок у ТБ и ГОСБ (обязательные; вопрос 7)
 * @property {boolean} routingChip            чип «Маршрутизация» в источнике сделки
 * @property {{startAt:string,kpkiAt:string,signAt:string,issueAt:string}} dates сроки
 * @property {OpportunityFinancialsDto|null} financials финансовые метрики (null — пустые, CIB)
 * @property {OpportunityProductDto[]} products продукты сделки
 * @property {{deskId:string,roleLabel:string}[]} desks дески с ролями (Ответственный, Инициатор, Приглашен)
 * @property {{analystIds:string[],directorId:string,vpId:string,regionalDirectorId:string}} team команда сделки
 * @property {{label:string,page:string}[]} relatedDeals связанные сделки
 * @property {boolean} showTasksTile          тайл «Задачи» (у CIB и кампаний)
 * @property {{planned:number,completed:number,attention:number}} meetings счётчики встреч
 * @property {Object|null} protocolsProjectSales протоколы проекта продаж (CIB/кампании) или null
 * @property {{authorId:string,time:string,date:string,text:string}[]} comments комментарии к стадии
 * @property {string|null} dropoutReasonCode  причина выбытия (архив кампаний/источников)
 * @property {string} dropoutComment          комментарий к причине выбытия
 * @property {boolean} growthCompany          «Компания роста» (кампании)
 * @property {boolean} didGrowthCompany       «Компания роста ДИД» (кампании)
 * @property {boolean} topClient              «Топ клиент» (кампании)
 * @property {boolean} viewed                 строка просмотрена (маркер непросмотренной)
 * @property {string} createdBy               кем создана (employeeId; заведено впрок для MS0015)
 * @property {string} createdAt               дата создания (ISO; заведено впрок для MS0015)
 */

/**
 * Финансовые метрики сделки.
 * Source: invented (10.10.2026).
 * @typedef {Object} OpportunityFinancialsDto
 * @property {number} totalVolume     общий объем, млн ед.
 * @property {string[]} currencies    валюты сделки (коды ISO)
 * @property {number|null} investVolume        «Продукты УСИ»: объём инвестиций, млн ед.
 * @property {number|null} vmMezzanine         «Продукты УСИ»: ВМ Мезонин, %
 * @property {number|null} totalIncome         итоговый доход
 * @property {number|null} interestIncome      процентный доход
 * @property {number|null} commissionIncome    комиссионный доход
 * @property {number|null} additionalIncome    дополнительный доход
 */

/**
 * Продукт сделки (карточка и страница продукта).
 * Source: invented (10.10.2026).
 * @typedef {Object} OpportunityProductDto
 * @property {string} id            идентификатор продукта
 * @property {string} name          название
 * @property {ProductGroupCode} group группа
 * @property {number} volume        объем по продукту, млн ед.
 * @property {number|null} volumeEndYear объем до конца года, млн ед.
 * @property {number|null} vm       ВМ, %
 * @property {number|null} el       EL, %
 * @property {number|null} termMonths срок, мес.
 * @property {number|null} income   доход, млн ед.
 * @property {number|null} incomeEndYear доход до конца текущего года, млн ед.
 * @property {boolean} spv          SPV
 * @property {{name:string,inn:string,crmId:string,kpp:string,kio:string,ogrn:string}} borrower заёмщик
 * @property {{name:string,inn:string,crmId:string,kpp:string,kio:string,ogrn:string}|null} knr КНР или null
 */

(function () {
  'use strict';

  var CLIENTS = window.MOCK_CLIENTS;
  var LIDS = window.DICT_FILLER_LEAD_IDS;

  var PROJECTS = ['Развитие тепличного комплекса', 'Модернизация производственной линии', 'Рефинансирование кредитного портфеля', 'Строительство логистического хаба', 'Обновление парка техники', 'Запуск цеха металлоконструкций', 'Финансирование оборотного капитала', 'Приобретение производственного комплекса', 'Расширение складской инфраструктуры', 'Цифровизация производства', 'Строительство второй очереди производства', 'Выпуск новой продуктовой линейки', 'Программа энергоэффективности', 'Приобретение транспортного парка', 'Развитие дилерской сети', 'Инвестиционная программа 2026–2028', 'Реструктуризация задолженности', 'Финансирование сделки M&A', 'Комплексная автоматизация', 'Развитие сырьевой базы', 'Строительство очистных сооружений', 'Программа импортозамещения', 'Расширение розничной сети', 'Модернизация ИТ-инфраструктуры'];

  var DESCRIPTIONS = ['Финансирование инвестиционной программы клиента', 'Рефинансирование действующего долга', 'Оборотное финансирование под контрактную базу', 'Приобретение основных средств', 'Строительство производственного комплекса', 'Модернизация производственного оборудования', 'Приобретение бизнес-актива', 'Пополнение оборотных средств', 'Программа повышения энергоэффективности', 'Расширение сбытовой сети'];

  var PRODUCTS = [
    { name: 'Инвестиционный кредит', group: 'LOANS', vol: 1200, vm: 14.5 },
    { name: 'Оборотная кредитная линия', group: 'LOANS', vol: 500, vm: 12.0 },
    { name: 'Возобновляемая кредитная линия', group: 'LOANS', vol: 450, vm: 12.4 },
    { name: 'Банковская гарантия', group: 'GUARANTEES', vol: 180, vm: 3.1 },
    { name: 'Мезонинное финансирование', group: 'USI', vol: 800, vm: 16.0 },
    { name: 'Синдицированный кредит', group: 'LOANS', vol: 2400, vm: 13.2 },
    { name: 'Факторинг с регрессом', group: 'FACTORING', vol: 300, vm: 11.0 },
    { name: 'Аккредитивы', group: 'GUARANTEES', vol: 150, vm: 2.8 },
    { name: 'Проектное финансирование', group: 'USI', vol: 1800, vm: 15.0 },
    { name: 'Кредитная линия с лимитом выдачи', group: 'LOANS', vol: 900, vm: 12.9 }
  ];

  var REALTY = ['Производственное помещение', 'Складской комплекс', 'Земельный участок', 'Административное здание', 'Производственный комплекс', ''];
  var PRIORITIES = ['MAX', 'HIGH', 'MEDIUM', 'LOW'];
  var DROPCOMMENTS = ['Клиент не предоставил пакет документов в срок', 'Срок ожидания решения клиента истёк', 'Клиент не подтвердил потребность в отчётном квартале'];

  var PGL = window.PRODUCT_GROUP_LABELS;
  var TBL = window.DICT_TER_BANKS;

  function party(client, suffix) {
    return {
      name: suffix ? client.name + ' ' + suffix : client.name,
      inn: client.inn, crmId: client.id, kpp: client.kpp, kio: client.kio, ogrn: client.ogrn
    };
  }

  function mkProduct(client, idx, volScale) {
    var p = PRODUCTS[idx % PRODUCTS.length];
    var vol = Math.round(p.vol * (volScale || 1));
    return {
      id: 'P' + (1000 + idx), name: p.name, group: p.group, groupLabel: PGL[p.group],
      volume: vol, volumeEndYear: Math.round(vol * 0.4), vm: p.vm, el: null,
      termMonths: 60, income: Math.round(vol * p.vm / 100), incomeEndYear: Math.round(vol * p.vm / 100 * 0.4),
      spv: idx % 4 === 0, borrower: party(client), knr: idx % 3 === 0 ? party(client, '(КНР)') : null
    };
  }

  /* Строка-заполнитель: колонки реестра + минимальная детализация, чтобы
     страница сделки по любому ID была осмысленной. */
  function mkDeal(o) {
    var c = CLIENTS[o.clientIdx % CLIENTS.length];
    var pcount = 1 + (o.i % 3 === 0 ? 1 : 0) + (o.i % 7 === 0 ? 1 : 0);
    var products = [];
    for (var k = 0; k < pcount; k++) products.push(mkProduct(c, o.i + k, 0.5 + (o.i % 5) * 0.1));
    var archive = o.tab === 'archive';
    var groupLabels = products.map(function (p) { return p.groupLabel; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
    var productLabels = products.map(function (p) { return p.name; });
    return {
      id: o.base + o.i, project: PROJECTS[(o.i * 3 + o.clientIdx) % PROJECTS.length],
      clientId: c.id, clientName: c.name, holdingName: c.holdingName,
      potentialId: o.i % 5 < 3 ? LIDS[(o.i * 2) % LIDS.length] : null,
      industry: c.industry, macro: c.macro, sub: c.sub, clientCrmId: c.id,
      description: DESCRIPTIONS[(o.i + o.clientIdx) % DESCRIPTIONS.length],
      terBank: c.terBank, gosb: c.gosb, keyDeal: o.i % 6 === 0,
      priorityCode: PRIORITIES[(o.i + 1) % 4], realtyType: REALTY[(o.i + 2) % REALTY.length],
      productLabels: productLabels, productGroupLabels: groupLabels,
      totalVolume: o.source === 'pipeline' ? Math.round(400 + (o.i % 17) * 180) : null,
      source: o.source, tab: o.tab,
      statusCode: archive ? 'DROPPED' : 'WORK',
      stageCode: archive ? 'WORK_STOPPED' : (o.source === 'pipeline' ? 'IDEA' : 'RESPONSIBLE_ASSIGNMENT'),
      probability: archive ? 0 : (o.source === 'pipeline' ? [10, 25, 45, 60, 75][o.i % 5] : 0),
      onePager: o.source === 'campaign' ? o.i % 3 !== 0 : o.i % 4 === 0,
      pikIk: o.source === 'pipeline' && o.i % 5 === 0,
      termsChanged: false, version: 'Версия 1', versionDate: '2026-09-' + String(1 + o.i % 28).padStart(2, '0'),
      calendarDays: o.i % 21, alertK1: o.source === 'cib' || o.source === 'campaign',
      tbGosbWarning: o.source === 'binding', routingChip: true,
      dates: { startAt: '2026-09-10', kpkiAt: '2026-11-20', signAt: '2026-12-15', issueAt: '2027-01-20' },
      financials: {
        totalVolume: Math.round(400 + (o.i % 17) * 180), currencies: ['RUB'],
        investVolume: o.i % 3 === 0 ? 300 + (o.i % 9) * 50 : null,
        vmMezzanine: o.i % 3 === 0 ? 14 + (o.i % 4) : null,
        totalIncome: 60 + (o.i % 11) * 9, interestIncome: 40 + (o.i % 8) * 7,
        commissionIncome: 10 + (o.i % 5) * 3, additionalIncome: o.i % 2 === 0 ? 5 + (o.i % 4) : null
      },
      products: products,
      desks: [{ deskId: 'D-SMB-NR6', roleLabel: 'Ответственный' }, { deskId: 'D-DID-CTR', roleLabel: 'Инициатор' }],
      team: { analystIds: ['04127'], directorId: '02940', vpId: '01855', regionalDirectorId: '01203' },
      relatedDeals: [], showTasksTile: o.source === 'cib' || o.source === 'campaign',
      meetings: { planned: 0, completed: 0, attention: 0 }, protocolsProjectSales: null,
      comments: [], dropoutReasonCode: archive ? 'WAIT_EXPIRED' : null,
      dropoutComment: archive ? DROPCOMMENTS[o.i % DROPCOMMENTS.length] : '',
      growthCompany: c.growthCompany, didGrowthCompany: c.didGrowthCompany, topClient: c.topClient,
      viewed: !((o.source === 'binding' || o.source === 'cib') && !archive && o.i % 3 === 0),
      createdBy: ['04127', '03882', '05204'][o.i % 3], createdAt: '2026-09-' + String(1 + o.i % 28).padStart(2, '0')
    };
  }

  var FILLER_PLAN = [
    { source: 'binding', tab: 'active-new', count: 22, base: 166100, clientIdx: 1 },
    { source: 'binding', tab: 'active-modified', count: 9, base: 166200, clientIdx: 2 },
    { source: 'binding', tab: 'archive', count: 11, base: 166300, clientIdx: 3 },
    { source: 'possible', tab: 'active-new', count: 21, base: 165100, clientIdx: 4 },
    { source: 'possible', tab: 'active-modified', count: 7, base: 165200, clientIdx: 5 },
    { source: 'possible', tab: 'archive', count: 9, base: 165300, clientIdx: 6 },
    { source: 'cib', tab: 'active', count: 23, base: 155100, clientIdx: 7 },
    { source: 'cib', tab: 'archive', count: 10, base: 155200, clientIdx: 8 },
    { source: 'campaign', tab: 'active', count: 21, base: 140100, clientIdx: 2 },
    { source: 'campaign', tab: 'archive', count: 22, base: 140200, clientIdx: 3 },
    { source: 'pipeline', tab: 'my-desk', count: 41, base: 129000, clientIdx: 0 },
    { source: 'pipeline', tab: 'my', count: 10, base: 128100, clientIdx: 1 },
    { source: 'pipeline', tab: 'lost', count: 8, base: 128200, clientIdx: 4 },
    { source: 'pipeline', tab: 'pf', count: 6, base: 128300, clientIdx: 5 }
  ];

  var fillers = [];
  FILLER_PLAN.forEach(function (plan) {
    for (var i = 0; i < plan.count; i++) {
      fillers.push(mkDeal({ source: plan.source, tab: plan.tab, base: plan.base, i: i, clientIdx: plan.clientIdx + i }));
    }
  });

  /* ── Герои: сделки с полной детализацией (страница сделки Opportunity) ── */
  var romashka = CLIENTS[0];

  var hero166092 = {
    id: 166092, project: 'Развитие тепличного комплекса',
    clientId: romashka.id, clientName: romashka.name, holdingName: romashka.holdingName,
    potentialId: 'L-44', industry: romashka.industry, macro: romashka.macro, sub: romashka.sub,
    clientCrmId: romashka.id,
    description: 'Финансирование строительства второй очереди тепличного комплекса (20 га): инвестиционный кредит и мезонинное финансирование. Залог — действующий тепличный комплекс и поручительство ГК «Цветы».',
    terBank: 'CA', gosb: '8634', keyDeal: false, priorityCode: 'MEDIUM',
    realtyType: 'Производственный комплекс',
    productLabels: ['Инвестиционный кредит', 'Мезонинное финансирование'], productGroupLabels: ['Кредиты', 'Продукты УСИ'],
    totalVolume: null, source: 'binding', tab: 'active-new', statusCode: 'WORK', stageCode: 'RESPONSIBLE_ASSIGNMENT',
    probability: 0, onePager: false, pikIk: false, termsChanged: false,
    version: 'Версия 1', versionDate: '2026-10-05', calendarDays: 5,
    alertK1: false, tbGosbWarning: true, routingChip: true,
    dates: { startAt: '2026-10-05', kpkiAt: '2026-12-10', signAt: '2027-01-25', issueAt: '2027-02-15' },
    financials: {
      totalVolume: 2400, currencies: ['RUB'],
      investVolume: 1800, vmMezzanine: 16.0, totalIncome: 396,
      interestIncome: 252, commissionIncome: 96, additionalIncome: 48
    },
    products: [
      {
        id: 'P9001', name: 'Инвестиционный кредит', group: 'LOANS', groupLabel: 'Кредиты',
        volume: 1600, volumeEndYear: 640, vm: 14.0, el: 1.2, termMonths: 84,
        income: 224, incomeEndYear: 90, spv: false,
        borrower: { name: 'ООО «Ромашка»', inn: '7712345678', crmId: '3000012345', kpp: '771201001', kio: '', ogrn: '1157746123456' },
        knr: { name: 'ООО «Ландыш»', inn: '7712345701', crmId: '3000012346', kpp: '771201002', kio: '', ogrn: '1167746222201' }
      },
      {
        id: 'P9002', name: 'Мезонинное финансирование', group: 'USI', groupLabel: 'Продукты УСИ',
        volume: 800, volumeEndYear: 320, vm: 16.0, el: 2.4, termMonths: 84,
        income: 128, incomeEndYear: 51, spv: true,
        borrower: { name: 'ООО «Ромашка»', inn: '7712345678', crmId: '3000012345', kpp: '771201001', kio: '', ogrn: '1157746123456' },
        knr: null
      }
    ],
    desks: [
      { deskId: 'D-SMB-NR6', roleLabel: 'Ответственный' },
      { deskId: 'D-DID-CTR', roleLabel: 'Инициатор' },
      { deskId: 'D-CIB-MSK', roleLabel: 'Приглашен' }
    ],
    team: { analystIds: ['04127', '03882', '05204'], directorId: '02940', vpId: '01855', regionalDirectorId: '01203' },
    relatedDeals: [], showTasksTile: false,
    meetings: { planned: 0, completed: 0, attention: 0 }, protocolsProjectSales: null,
    comments: [
      { authorId: '02940', time: '09:40', date: '2026-10-06', text: 'Сделка передана в работу после маршрутизации. Назначить ответственного и согласовать состав команды.' }
    ],
    dropoutReasonCode: null, dropoutComment: '',
    growthCompany: true, didGrowthCompany: true, topClient: true,
    viewed: false, createdBy: '04127', createdAt: '2026-10-05'
  };

  var hero166241 = {
    id: 166241, project: 'Финансирование оборотного капитала',
    clientId: romashka.id, clientName: romashka.name, holdingName: romashka.holdingName,
    potentialId: 'L-44', industry: romashka.industry, macro: romashka.macro, sub: romashka.sub,
    clientCrmId: romashka.id,
    description: 'Сезонное финансирование закупки посадочного материала под контрактную базу 2027 года.',
    terBank: 'CA', gosb: '8634', keyDeal: true, priorityCode: 'HIGH',
    realtyType: '',
    productLabels: ['Возобновляемая кредитная линия'], productGroupLabels: ['Кредиты'],
    totalVolume: null, source: 'binding', tab: 'active-new', statusCode: 'WORK', stageCode: 'RESPONSIBLE_ASSIGNMENT',
    probability: 0, onePager: true, pikIk: false, termsChanged: false,
    version: 'Версия 2', versionDate: '2026-10-07', calendarDays: 10,
    alertK1: false, tbGosbWarning: true, routingChip: false,
    dates: { startAt: '2026-09-30', kpkiAt: '2026-11-28', signAt: '2026-12-20', issueAt: '2027-01-15' },
    financials: {
      totalVolume: 500, currencies: ['RUB'],
      investVolume: null, vmMezzanine: null, totalIncome: 62,
      interestIncome: 56, commissionIncome: 6, additionalIncome: null
    },
    products: [
      {
        id: 'P9011', name: 'Возобновляемая кредитная линия', group: 'LOANS', groupLabel: 'Кредиты',
        volume: 500, volumeEndYear: 200, vm: 12.4, el: 0.8, termMonths: 24,
        income: 62, incomeEndYear: 25, spv: false,
        borrower: { name: 'ООО «Ромашка»', inn: '7712345678', crmId: '3000012345', kpp: '771201001', kio: '', ogrn: '1157746123456' },
        knr: null
      }
    ],
    desks: [{ deskId: 'D-SMB-NR6', roleLabel: 'Ответственный' }, { deskId: 'D-DID-CTR', roleLabel: 'Инициатор' }],
    team: { analystIds: ['04127', '03882'], directorId: '02940', vpId: '01855', regionalDirectorId: '01203' },
    relatedDeals: [], showTasksTile: false,
    meetings: { planned: 0, completed: 0, attention: 0 }, protocolsProjectSales: null,
    comments: [
      { authorId: '04127', time: '14:05', date: '2026-10-07', text: 'One Pager согласован. КПКИ — 28.11, документы от клиента получены в полном объёме.' }
    ],
    dropoutReasonCode: null, dropoutComment: '',
    growthCompany: true, didGrowthCompany: true, topClient: true,
    viewed: true, createdBy: '03882', createdAt: '2026-09-30'
  };

  var hero166103 = {
    id: 166103, project: 'Проект продаж: экосистема для ГК «Цветы»',
    clientId: romashka.id, clientName: romashka.name, holdingName: romashka.holdingName,
    potentialId: 'L-10014', industry: romashka.industry, macro: romashka.macro, sub: romashka.sub,
    clientCrmId: romashka.id,
    description: 'Продуктовое предложение ДКК по экосистемному обслуживанию холдинга: РКО, зарплатный проект, торговое финансирование.',
    terBank: 'CA', gosb: '8634', keyDeal: false, priorityCode: 'MEDIUM', realtyType: '',
    productLabels: ['Аккредитивы', 'Факторинг с регрессом'], productGroupLabels: ['Гарантии', 'Факторинг'],
    totalVolume: null, source: 'cib', tab: 'active', statusCode: 'WORK', stageCode: 'RESPONSIBLE_ASSIGNMENT',
    probability: 0, onePager: false, pikIk: false, termsChanged: false,
    version: 'Версия 3', versionDate: '2026-10-01', calendarDays: 17,
    alertK1: true, tbGosbWarning: false, routingChip: false,
    dates: { startAt: '2026-09-14', kpkiAt: '2026-12-05', signAt: '2026-12-25', issueAt: '2027-01-10' },
    financials: null,
    products: [
      {
        id: 'P9021', name: 'Аккредитивы', group: 'GUARANTEES', groupLabel: 'Гарантии',
        volume: 150, volumeEndYear: 60, vm: 2.8, el: 0.2, termMonths: 12,
        income: 4, incomeEndYear: 2, spv: false,
        borrower: { name: 'ООО «Сирень»', inn: '5024113302', crmId: '3000012347', kpp: '502401001', kio: '', ogrn: '1175024011544' },
        knr: null
      },
      {
        id: 'P9022', name: 'Факторинг с регрессом', group: 'FACTORING', groupLabel: 'Факторинг',
        volume: 300, volumeEndYear: 120, vm: 11.0, el: 0.6, termMonths: 18,
        income: 33, incomeEndYear: 13, spv: false,
        borrower: { name: 'ООО «Сирень»', inn: '5024113302', crmId: '3000012347', kpp: '502401001', kio: '', ogrn: '1175024011544' },
        knr: { name: 'ООО «Ландыш»', inn: '7712345701', crmId: '3000012346', kpp: '771201002', kio: '', ogrn: '1167746222201' }
      }
    ],
    desks: [{ deskId: 'D-CIB-MSK', roleLabel: 'Ответственный' }, { deskId: 'D-SMB-NR6', roleLabel: 'Приглашен' }],
    team: { analystIds: ['04127', '05204'], directorId: '02941', vpId: '01855', regionalDirectorId: '01203' },
    relatedDeals: [{ label: 'Проект продаж', page: 'cib' }],
    showTasksTile: true, meetings: { planned: 0, completed: 0, attention: 0 },
    protocolsProjectSales: { note: 'Просмотр протоколов встреч доступен только команде сделки', count: 1 },
    comments: [], dropoutReasonCode: null, dropoutComment: '',
    growthCompany: true, didGrowthCompany: true, topClient: true,
    viewed: false, createdBy: '05204', createdAt: '2026-09-14'
  };

  var hero140877 = {
    id: 140877, project: 'Кампания: декоративные растения 2026',
    clientId: romashka.id, clientName: romashka.name, holdingName: romashka.holdingName,
    potentialId: 'L-44', industry: romashka.industry, macro: romashka.macro, sub: romashka.sub,
    clientCrmId: romashka.id,
    description: 'Продвижение продуктовой линейки декоративных растений в сетях розничных партнёров.',
    terBank: 'CA', gosb: '8634', keyDeal: false, priorityCode: 'LOW', realtyType: '',
    productLabels: ['Оборотная кредитная линия'], productGroupLabels: ['Кредиты'],
    totalVolume: null, source: 'campaign', tab: 'archive', statusCode: 'DROPPED', stageCode: 'WORK_STOPPED',
    probability: 0, onePager: false, pikIk: false, termsChanged: false,
    version: 'Версия 1', versionDate: '2026-06-12', calendarDays: 0,
    alertK1: true, tbGosbWarning: false, routingChip: false,
    dates: { startAt: '2026-06-12', kpkiAt: '2026-08-20', signAt: '', issueAt: '' },
    financials: null,
    products: [
      {
        id: 'P9031', name: 'Оборотная кредитная линия', group: 'LOANS', groupLabel: 'Кредиты',
        volume: 250, volumeEndYear: null, vm: 12.0, el: 0.7, termMonths: 12,
        income: null, incomeEndYear: null, spv: false,
        borrower: { name: 'ООО «Ромашка»', inn: '7712345678', crmId: '3000012345', kpp: '771201001', kio: '', ogrn: '1157746123456' },
        knr: null
      }
    ],
    desks: [{ deskId: 'D-SMB-NR6', roleLabel: 'Ответственный' }],
    team: { analystIds: ['04127'], directorId: '02940', vpId: '01855', regionalDirectorId: '01203' },
    relatedDeals: [], showTasksTile: true, meetings: { planned: 0, completed: 0, attention: 0 },
    protocolsProjectSales: { note: 'Просмотр протоколов встреч доступен только команде сделки', count: 1 },
    comments: [], dropoutReasonCode: 'WAIT_EXPIRED',
    dropoutComment: 'Клиент не предоставил пакет документов в срок',
    growthCompany: true, didGrowthCompany: true, topClient: true,
    viewed: true, createdBy: '04127', createdAt: '2026-06-12'
  };

  var hero129451 = {
    id: 129451, project: 'Расширение тепличного комплекса (этап 1)',
    clientId: romashka.id, clientName: romashka.name, holdingName: romashka.holdingName,
    potentialId: 'L-44', industry: romashka.industry, macro: romashka.macro, sub: romashka.sub,
    clientCrmId: romashka.id,
    description: 'Инвестиционная программа этапа 1: строительство 10 га теплиц, поставка оборудования, запуск к 3 кварталу 2027 года.',
    terBank: 'CA', gosb: '8634', keyDeal: true, priorityCode: 'HIGH',
    realtyType: 'Производственный комплекс',
    productLabels: ['Инвестиционный кредит', 'Проектное финансирование'], productGroupLabels: ['Кредиты', 'Продукты УСИ'],
    totalVolume: 1240, source: 'pipeline', tab: 'my-desk', statusCode: 'WORK', stageCode: 'IDEA',
    probability: 45, onePager: true, pikIk: false, termsChanged: true,
    version: 'Версия 4', versionDate: '2026-10-08', calendarDays: 20,
    alertK1: false, tbGosbWarning: false, routingChip: false,
    dates: { startAt: '2026-07-02', kpkiAt: '2026-11-15', signAt: '2026-12-18', issueAt: '2027-02-01' },
    financials: {
      totalVolume: 1240, currencies: ['RUB'],
      investVolume: 1000, vmMezzanine: 15.0, totalIncome: 186,
      interestIncome: 140, commissionIncome: 38, additionalIncome: 8
    },
    products: [
      {
        id: 'P9041', name: 'Инвестиционный кредит', group: 'LOANS', groupLabel: 'Кредиты',
        volume: 900, volumeEndYear: 360, vm: 13.8, el: 1.1, termMonths: 72,
        income: 124, incomeEndYear: 50, spv: false,
        borrower: { name: 'ООО «Ромашка»', inn: '7712345678', crmId: '3000012345', kpp: '771201001', kio: '', ogrn: '1157746123456' },
        knr: { name: 'ООО «Ландыш»', inn: '7712345701', crmId: '3000012346', kpp: '771201002', kio: '', ogrn: '1167746222201' }
      },
      {
        id: 'P9042', name: 'Проектное финансирование', group: 'USI', groupLabel: 'Продукты УСИ',
        volume: 340, volumeEndYear: 136, vm: 15.0, el: 2.0, termMonths: 72,
        income: 62, incomeEndYear: 25, spv: false,
        borrower: { name: 'ООО «Ромашка»', inn: '7712345678', crmId: '3000012345', kpp: '771201001', kio: '', ogrn: '1157746123456' },
        knr: null
      }
    ],
    desks: [
      { deskId: 'D-SMB-NR6', roleLabel: 'Ответственный' },
      { deskId: 'D-DID-CTR', roleLabel: 'Инициатор' },
      { deskId: 'D-CIB-MSK', roleLabel: 'Приглашен' }
    ],
    team: { analystIds: ['04127', '03882', '05204'], directorId: '02940', vpId: '01855', regionalDirectorId: '01203' },
    relatedDeals: [], showTasksTile: false,
    meetings: { planned: 2, completed: 3, attention: 1 }, protocolsProjectSales: null,
    comments: [
      { authorId: '04127', time: '11:30', date: '2026-10-08', text: 'Обновлена модель денежных потоков: срок окупаемости 6,2 года. Отправил на проверку директору.' },
      { authorId: '02940', time: '16:10', date: '2026-10-02', text: 'Прошли пред KM. Замечания по залоговой базе — усилить пакет до 140%.' }
    ],
    dropoutReasonCode: null, dropoutComment: '',
    growthCompany: true, didGrowthCompany: true, topClient: true,
    viewed: true, createdBy: '03882', createdAt: '2026-07-02'
  };

  /* ID ключевых сделок сохраняются; диапазоны наполнителя могут пересечь их.
     Каждый следующий ID наполнителя выбирается из ещё свободных. */
  var heroes = [hero166092, hero166241, hero166103, hero140877, hero129451];
  var usedIds = new Set(heroes.map(function (deal) { return deal.id; }));
  fillers.forEach(function (deal) {
    while (usedIds.has(deal.id)) deal.id++;
    usedIds.add(deal.id);
  });
  /** @type {OpportunityRsDto[]} */
  window.MOCK_OPPORTUNITIES = heroes.concat(fillers);
})();

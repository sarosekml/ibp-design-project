/* =========================================================================
   clients.js — клиенты демо-данных концепта ibp-redesign-v1.

   12 клиентов в 5 холдингах, имена в стиле макетов Pixso (ООО «Ромашка»,
   ГК «Цветы»). Истории нет: значения правдоподобные и детерминированные
   (Source: invented (10.10.2026)), без Math.random.

   Герой демо — ООО «Ромашка» (ГК «Цветы»): у него полные цели, кредиты,
   финансовые показатели и ГигаСправка; у остальных поля заполняются
   фабрикой mkClient по умолчанию, чтобы каждая вкладка страницы клиента
   была непустой у любого клиента.
   ========================================================================= */

/**
 * Клиент.
 * Source: invented (10.10.2026) — заменить полями DTO, когда появится контракт.
 * @typedef {Object} ClientRsDto
 * @property {string} id                 CRM ID клиента (10 цифр)
 * @property {string} name               краткое наименование («ООО «Ромашка»»)
 * @property {string} fullName           полное наименование
 * @property {string} holdingId          идентификатор холдинга
 * @property {string} holdingName        название холдинга
 * @property {string} inn                ИНН
 * @property {string} ogrn               ОГРН
 * @property {string} kpp                КПП
 * @property {string} kppKn              КПП КН
 * @property {string} kio                КИО
 * @property {string} legalAddress       юридический адрес
 * @property {'ACTIVE'} statusCode       статус клиента
 * @property {string} quarterChip        чип «Дата» реестра клиентов («Q3 2026»)
 * @property {string} quarterPlan        чип календаря в шапке клиента («Q4 2026»)
 * @property {boolean} growthCompany     «Компания роста»
 * @property {boolean} didGrowthCompany  «Компания роста ДИД»
 * @property {boolean} topClient         «Топ клиент»
 * @property {boolean} keyClient         «Ключевой клиент»
 * @property {boolean} goalsFixed        «Цели зафиксированы»
 * @property {boolean} residentRf        «Резидент РФ»
 * @property {number|null} headerCounter счётчик с ⓘ в шапке (смысл неизвестен, вопрос 8)
 * @property {string} industry           отрасль
 * @property {string} macro              макроотрасль
 * @property {string} sub                подотрасль
 * @property {string} segment            сегмент
 * @property {string} terBank            код ТБ
 * @property {string} gosb               ГОСБ
 * @property {string} gcmId              главный клиентский менеджер (employeeId)
 * @property {{fullName:string,role:string,initials:string}[]} relatedPersons связанные физические лица
 * @property {{employeeId:string,roleCode:string}[]} team      команда клиента ДИД
 * @property {{deskId:string,roleCode:string}[]}   desks      дески клиента
 * @property {string} addedAt            дата добавления (ISO)
 * @property {string} lastActivityAt     дата последней активности (ISO)
 * @property {boolean} inQuarterPlan     клиент в плане аналитика на квартал (MS0015, заведено впрок)
 * @property {string} responsibleAnalystId зона ответственности аналитика (MS0015, заведено впрок)
 * @property {{authorId:string,time:string,date:string,text:string,system:boolean}[]} comments комментарии
 * @property {{name:string,uploadedAt:string}[]} documents     документы (ЭКД)
 * @property {{date:string,source:string,title:string,teaser:string}[]} news новости
 * @property {{about:string[],lpr:{name:string,position:string}[],cooperation:string[]}} giga ГигаСправка
 * @property {{business:ClientGoalDto[],personal:ClientGoalDto[],archives:{year:string,goals:ClientGoalDto[]}[]}} goals цели
 * @property {ClientCreditsDto} credits  кредиты
 * @property {ClientFinancialsDto} financials финансовые показатели
 * @property {{sections:{label:string,rows:{label:string,values:string[]}[]}[]}} analysis финансовый анализ (P&L и др.)
 * @property {{id:string,name:string,amount:string,date:string,status:string,date2:string}[]} maPipeline M&A сделки клиента
 * @property {{id:string,name:string,income:string,incomeDate:string}[]} dcmPipeline DCM сделки клиента
 * @property {{id:string,name:string,income:string,incomeDate:string}[]} ecmPipeline ECM сделки клиента
 */

/**
 * Цель клиента.
 * Source: invented (10.10.2026).
 * @typedef {Object} ClientGoalDto
 * @property {string} typeLabel  тип («Бизнес», «Личная», «Стратегическая цель», «Цифровая трансформация»)
 * @property {string} period     период («2026»)
 * @property {string} title      заголовок цели
 * @property {string} metric     метрика
 * @property {string} value      значение
 * @property {string} comment    комментарий
 * @property {{fullName:string,role:string,initials:string}[]} people участники
 */

/**
 * Кредиты клиента.
 * Source: invented (10.10.2026).
 * @typedef {Object} ClientCreditsDto
 * @property {{total:string,overdue:string,margin:string}} summary сводные плашки
 * @property {ClientCreditDto[]} active      действующие кредиты
 * @property {ClientCreditPipelineDto[]} pipeline кредиты в Pipeline
 */

/**
 * Действующий кредит (карточка-аккордеон).
 * Source: invented (10.10.2026).
 * @typedef {Object} ClientCreditDto
 * @property {string} kindLabel   вид («Невозобновляемая кредитная линия»)
 * @property {string} tone        тон чипа вида (neutral | warning | success)
 * @property {string} period      период действия
 * @property {string} number      номер договора
 * @property {string} name        название
 * @property {{label:string,value:string}[]} metrics метрики карточки
 * @property {{category:string,date:string}[]} schedules строки «Сроки»
 * @property {{label:string,amount:string}[]} finIndicators строки «Финансовые показатели»
 */

/**
 * Кредит в Pipeline (карточка «Оборотный кредит»).
 * Source: invented (10.10.2026).
 * @typedef {Object} ClientCreditPipelineDto
 * @property {string} dateLabel   дата
 * @property {string} termLabel   срок
 * @property {string} kfuId       «КФЮЛ ID»
 * @property {string} stageLabel  наименование этапа сделки
 * @property {string} stageStatus статус этапа («В работе»)
 * @property {string} rateLabel   ставка по сделке
 * @property {string} currencyLabel валюта сделки
 * @property {string} amountLabel сумма сделки, руб.
 * @property {string} updatedLabel «Обновлено …»
 * @property {{label:string,value:string}[]} dealData строки «Данные по сделке»
 * @property {string} description описание сделки
 */

/**
 * Финансовые показатели клиента (ФОК и пользовательские метрики).
 * Source: invented (10.10.2026).
 * @typedef {Object} ClientFinancialsDto
 * @property {Object} fok
 * @property {string} fok.revenueValue  выручка на последнюю дату («346,27 млн руб.»)
 * @property {string} fok.revenueGrowth бейдж роста («↑ 12.6% гг»)
 * @property {string[]} fok.periods     подписи кварталов
 * @property {{label:string,values:number[],type:'line'|'bar'}[]} fok.series ряды графика (combo)
 * @property {{label:string,values:string[],subs:string[]}[]} fok.rows таблица «Показатель × квартал»
 * @property {{metrics:{label:string,value:string}[],comment:string}} custom пользовательские метрики
 */

(function () {
  'use strict';

  /* Холдинги демо. @type {{id:string,name:string}[]} */
  window.MOCK_HOLDINGS = [
    { id: 'H-1', name: 'ГК «Цветы»' },
    { id: 'H-2', name: 'ГК «АгроСоюз»' },
    { id: 'H-3', name: 'ГК «ТехноМир»' },
    { id: 'H-4', name: 'ГК «ЛесТрейд»' },
    { id: 'H-5', name: 'ГК «СтройИндустрия»' }
  ];

  var EMP = {};
  window.MOCK_EMPLOYEES.forEach(function (e) { EMP[e.id] = e; });

  function emp(id) { return EMP[id] || EMP['04127']; }

  /* Пул связанных физлиц: комбинация по seed, чтобы у разных клиентов были
     разные люди (Source: invented (10.10.2026)). */
  var PERSON_POOL = [
    { fullName: 'Титов Валерий Сергеевич', role: 'Генеральный директор', initials: 'ТВ' },
    { fullName: 'Миронова Алла Петровна', role: 'Финансовый директор', initials: 'МА' },
    { fullName: 'Гайдар Игорь Львович', role: 'Главный бухгалтер', initials: 'ГИ' },
    { fullName: 'Кузьмина Наталия Олеговна', role: 'Руководитель ПДО', initials: 'КН' },
    { fullName: 'Раевский Герман Петрович', role: 'Коммерческий директор', initials: 'РГ' },
    { fullName: 'Яснова Вера Ильинична', role: 'Директор по экономике', initials: 'ЯВ' },
    { fullName: 'Драгунов Артём Кириллович', role: 'Директор по производству', initials: 'ДА' },
    { fullName: 'Полозкова Марина Юрьевна', role: 'Руководитель юридической службы', initials: 'ПМ' }
  ];

  function persons(seed) {
    var a = seed % PERSON_POOL.length, b = (seed + 3) % PERSON_POOL.length, c = (seed + 5) % PERSON_POOL.length;
    return [PERSON_POOL[a], PERSON_POOL[b], PERSON_POOL[c]];
  }

  /* Фабрика: заполняет блоки клиента ДИА-данными по умолчанию, чтобы любая
     вкладка страницы клиента была непустой; герой и избранные клиенты
     переопределяют поля поверх. */
  function mkClient(o) {
    var seed = o.seed || 100;
    var revenue = o.revenue || (seed * 3 + 46);
    var c = {
      id: o.id, name: o.name, fullName: o.fullName, holdingId: o.holdingId, holdingName: o.holdingName,
      inn: o.inn, ogrn: o.ogrn, kpp: o.kpp || o.inn.slice(0, 4) + '01001', kppKn: o.kppKn || '',
      kio: o.kio || '', legalAddress: o.legalAddress,
      statusCode: 'ACTIVE', quarterChip: o.quarterChip || 'Q3 2026', quarterPlan: o.quarterPlan || 'Q4 2026',
      growthCompany: !!o.growthCompany, didGrowthCompany: !!o.didGrowthCompany, topClient: !!o.topClient,
      keyClient: !!o.keyClient, goalsFixed: o.goalsFixed !== undefined ? !!o.goalsFixed : true,
      residentRf: true, headerCounter: o.headerCounter !== undefined ? o.headerCounter : 26,
      industry: o.industry, macro: o.macro, sub: o.sub, segment: o.segment || 'Крупный бизнес',
      terBank: o.terBank || 'CA', gosb: o.gosb || '8634',
      gcmId: o.gcmId || '04630',
      relatedPersons: o.relatedPersons || persons(seed),
      team: o.team || [
        { employeeId: '04127', roleCode: 'ANALYST' },
        { employeeId: '02940', roleCode: 'DIRECTOR' },
        { employeeId: '01855', roleCode: 'VP' },
        { employeeId: '01203', roleCode: 'REGIONAL_DIRECTOR' }
      ],
      desks: o.desks || [{ deskId: 'D-SMB-NR6', roleCode: 'ANALYST' }, { deskId: 'D-DID-CTR', roleCode: 'DIRECTOR' }],
      addedAt: o.addedAt || '2024-03-14', lastActivityAt: o.lastActivityAt || '2026-10-06',
      inQuarterPlan: o.inQuarterPlan !== undefined ? !!o.inQuarterPlan : false,
      responsibleAnalystId: o.responsibleAnalystId || '04127',
      comments: o.comments || [
        { authorId: '04127', time: '11:20', date: '2026-10-01', text: 'Проведён страт. диалог: приоритет — расширение производственной площадки, потребность в инвестиционном финансировании до конца года.', system: false },
        { authorId: '02940', time: '16:45', date: '2026-09-18', text: 'Согласован план работы по сделке на Q4 2026.', system: false }
      ],
      documents: o.documents || [
        { name: 'Бухгалтерская отчётность за 2025 год.pdf', uploadedAt: '2026-03-12' },
        { name: 'Устав (ред. 2026).pdf', uploadedAt: '2026-04-02' },
        { name: 'Презентация компании 2026.pdf', uploadedAt: '2026-06-21' }
      ],
      news: o.news || [
        { date: '2026-10-04', source: 'Интерфакс', title: 'Компания расширяет производственную линейку', teaser: 'Заявлено о запуске второй очереди производства; инвестиции оцениваются в 1,2 млрд RUB' },
        { date: '2026-09-27', source: 'Коммерсантъ', title: 'Объявлены итоги закупочной кампании', teaser: 'Компания закрепила долгосрочные контракты с ключевыми поставщиками сырья.' },
        { date: '2026-09-15', source: 'СКРИН', title: 'Обновлён кредитный рейтинг', teaser: 'Рейтинговое агентство подтвердило рейтинг устойчивости на прежнем уровне.' }
      ],
      giga: o.giga || {
        about: [
          o.name + ' — производственная компания, входит в ' + o.holdingName + '. Основное направление — ' + o.sub.toLowerCase() + '.',
          'Выручка за последний отчётный год — ' + revenue + ' млн RUB Численность сотрудников — около ' + (seed * 4) + '0 человек.'
        ],
        lpr: [
          { name: 'Титов Валерий Сергеевич', position: 'Генеральный директор' },
          { name: 'Миронова Алла Петровна', position: 'Финансовый директор' }
        ],
        cooperation: [
          'Клиент банка с 2019 года. Действующее кредитное финансирование и расчётное обслуживание.',
          'Текущий фокус сотрудничества — инвестиционная программа расширения производства.'
        ]
      },
      goals: o.goals || {
        business: [
          { typeLabel: 'Бизнес', period: '2026', title: 'Запуск второй очереди производства', metric: 'Выручка, млн RUB', value: String(revenue + 120), comment: 'Цель зафиксирована по итогам страт. диалога.', people: [{ fullName: emp('04630').fullName, role: 'Клиентский менеджер', initials: emp('04630').initials }, { fullName: emp('04127').fullName, role: 'Аналитик', initials: emp('04127').initials }] }
        ],
        personal: [
          { typeLabel: 'Личная', period: '2026', title: 'Подготовить инвестиционную презентацию', metric: 'Срок', value: 'Q4 2026', comment: '', people: [{ fullName: emp('04127').fullName, role: 'Аналитик', initials: emp('04127').initials }] }
        ],
        archives: [
          { year: '2025', goals: [{ typeLabel: 'Бизнес', period: '2025', title: 'Рефинансирование кредитного портфеля', metric: 'Ставка', value: '−1,5 п.п.', comment: 'Выполнено', people: [{ fullName: emp('04630').fullName, role: 'Клиентский менеджер', initials: emp('04630').initials }] }] },
          { year: '2024', goals: [{ typeLabel: 'Стратегическая цель', period: '2024', title: 'Выход на новых поставщиков сырья', metric: 'Доля закупок', value: '30%', comment: 'Выполнено частично', people: [{ fullName: emp('04711').fullName, role: 'Клиентский менеджер', initials: emp('04711').initials }] }] },
          { year: '2023', goals: [{ typeLabel: 'Цифровая трансформация', period: '2023', title: 'Внедрение ERP на производстве', metric: 'Срок', value: 'Q4 2023', comment: 'Выполнено', people: [{ fullName: emp('04127').fullName, role: 'Аналитик', initials: emp('04127').initials }] }] }
        ]
      },
      credits: o.credits || {
        summary: { total: window.DICT_FMT.money(seed * 40) + ',00', overdue: '0,00', margin: '12,' + (seed % 9 + 1) + '%' },
        active: [
          {
            kindLabel: 'Невозобновляемая кредитная линия', tone: 'neutral', period: '01.02.2024 – 01.02.2028',
            number: '№ 4' + (seed % 10) + '-Л/26', name: 'Инвестиционная программа расширения',
            metrics: [
              { label: 'Фиксированная ставка', value: '12,4%' },
              { label: 'Маржинальный доход, RUB', value: window.DICT_FMT.money(seed * 120000) },
              { label: 'Остаток срочной задолженности, RUB', value: window.DICT_FMT.money(seed * 180000) },
              { label: 'Сумма по договору, RUB', value: window.DICT_FMT.money(seed * 300000) }
            ],
            schedules: [
              { category: 'Следующий платёж', date: '20.01.2027' },
              { category: 'Окончание льготного периода', date: '01.08.2027' },
              { category: 'Погашение основного долга', date: '01.02.2028' }
            ],
            finIndicators: [
              { label: 'Выдано, RUB', amount: window.DICT_FMT.money(seed * 300000) },
              { label: 'Проценты уплачено, RUB', amount: window.DICT_FMT.money(seed * 41000) },
              { label: 'Остаток задолженности, RUB', amount: window.DICT_FMT.money(seed * 180000) }
            ]
          }
        ],
        pipeline: [
          {
            dateLabel: '05.10.2026', termLabel: '36 мес.', kfuId: 'КФЮЛ 0' + (seed % 9 + 1) + '-2026',
            stageLabel: 'Проработка структуры финансирования', stageStatus: 'В работе',
            rateLabel: 'КСР + 3,2 п.п.', currencyLabel: 'RUB', amountLabel: window.DICT_FMT.money(seed * 900000),
            updatedLabel: 'Обновлено 08.10.2026',
            dealData: [
              { label: 'Целевое назначение', value: 'Оборотный капитал' },
              { label: 'Обеспечение', value: 'Залог оборудования' },
              { label: 'Штрафы и комиссии', value: 'Не предусмотрены' }
            ],
            description: 'Финансирование пополнения оборотных средств под расширение контрактной базы.'
          }
        ]
      },
      financials: o.financials || (function () {
        var periods = ['3КВ 25', '4КВ 25', '1КВ 26', '2КВ 26', '3КВ 26', '4КВ 26'];
        var netDebt = [seed * 20 + 60, seed * 21 + 55, seed * 22 + 70, seed * 20 + 65, seed * 19 + 60, seed * 18 + 50];
        var ratio = [2.1, 2.0, 2.3, 2.1, 1.9, 1.8];
        return {
          fok: {
            revenueValue: revenue + ',27 млн RUB',
            revenueGrowth: '↑ ' + (seed % 9 + 4) + '.' + (seed % 6 + 1) + '% гг',
            periods: periods,
            series: [
              { label: 'Чистый долг', type: 'line', values: netDebt },
              { label: 'Чистый долг/EBITDA', type: 'bar', values: ratio }
            ],
            rows: [
              { label: 'Выручка', values: periods.map(function (p, i) { return window.DICT_FMT.money(revenue - 40 + i * 8) + ',00'; }), subs: periods.map(function () { return 'млн RUB'; }) },
              { label: 'EBITDA', values: periods.map(function (p, i) { return window.DICT_FMT.money(Math.round(revenue * 0.28) - 8 + i * 2) + ',00'; }), subs: periods.map(function () { return 'млн RUB'; }) },
              { label: 'Чистый долг', values: netDebt.map(function (v) { return window.DICT_FMT.money(v) + ',00'; }), subs: periods.map(function () { return 'млн RUB'; }) }
            ]
          },
          custom: {
            metrics: [
              { label: 'Выручка', value: window.DICT_FMT.money(revenue) + ',00' },
              { label: 'Долг', value: window.DICT_FMT.money(seed * 19) + ',00' },
              { label: 'EBITDA', value: window.DICT_FMT.money(Math.round(revenue * 0.28)) + ',00' },
              { label: 'Маржинальность EBITDA %', value: (seed % 7 + 22) + ',' + (seed % 9) + '%' },
              { label: 'EBIT', value: window.DICT_FMT.money(Math.round(revenue * 0.21)) + ',00' },
              { label: 'Долг / EBITDA', value: (seed % 3 + 1) + ',' + (seed % 8 + 1) },
              { label: 'Прибыль', value: window.DICT_FMT.money(Math.round(revenue * 0.12)) + ',00' },
              { label: 'Долг / EBIT', value: (seed % 2 + 1) + ',' + (seed % 7 + 2) }
            ],
            comment: 'Метрики загружены из последней отчётности, актуализация — после получения 3КВ 2026.'
          }
        };
      })(),
      analysis: o.analysis || {
        sections: [
          {
            label: 'P&L',
            rows: [
              { label: 'Выручка', values: ['102 400,00', '108 900,00', '115 600,00', '119 200,00', '124 800,00'] },
              { label: 'Себестоимость', values: ['74 300,00', '78 100,00', '83 500,00', '85 400,00', '88 900,00'] },
              { label: 'EBITDA', values: ['28 100,00', '30 800,00', '32 100,00', '33 800,00', '35 900,00'] },
              { label: 'Проценты к уплате', values: ['4 100,00', '3 900,00', '3 700,00', '3 600,00', '3 400,00'] },
              { label: 'Чистая прибыль', values: ['12 400,00', '14 100,00', '15 600,00', '16 900,00', '18 300,00'] }
            ]
          }
        ]
      },
      maPipeline: o.maPipeline || [],
      dcmPipeline: o.dcmPipeline || [],
      ecmPipeline: o.ecmPipeline || []
    };
    return c;
  }

  /* ── Герой демо: ООО «Ромашка» ─────────────────────────────────────── */
  var romashka = mkClient({
    id: '3000012345', name: 'ООО «Ромашка»', fullName: 'Общество с ограниченной ответственностью «Ромашка»',
    holdingId: 'H-1', holdingName: 'ГК «Цветы»',
    inn: '7712345678', ogrn: '1157746123456', kpp: '771201001', kppKn: '771243001',
    legalAddress: '125212, г. Москва, Ленинградское шоссе, д. 39, стр. 1, этаж 4, помещ. I',
    quarterChip: 'Q4 2026', quarterPlan: 'Q4 2026',
    growthCompany: true, didGrowthCompany: true, topClient: true, keyClient: true, goalsFixed: true,
    headerCounter: 26,
    industry: 'Сельское хозяйство', macro: 'Агропромышленный комплекс', sub: 'Цветоводство',
    segment: 'Крупный бизнес', terBank: 'CA', gosb: '8634', gcmId: '04630',
    addedAt: '2021-06-14', lastActivityAt: '2026-10-09',
    inQuarterPlan: true, responsibleAnalystId: '04127', seed: 42, revenue: 346,
    comments: [
      { authorId: '04127', time: '14:20', date: '2026-10-08', text: 'Проведён страт. диалог по инвестиционной программе: клиент подтверждает потребность в финансировании второй очереди тепличного комплекса до конца Q1 2027.', system: false },
      { authorId: '02940', time: '10:05', date: '2026-09-30', text: 'Согласованы условия проработки с ДКК. Подготовить расчёт структуры к 20.10.', system: false },
      { authorId: '04127', time: '16:42', date: '2026-09-12', text: 'Обновлена презентация для ПИК: добавлен блок по залоговой базе.', system: false }
    ],
    documents: [
      { name: 'Бухгалтерская отчётность за 2025 год.pdf', uploadedAt: '2026-03-12' },
      { name: 'Презентация для ПИК (ред. 3).pdf', uploadedAt: '2026-09-12' },
      { name: 'Технико-экономическое обоснование проекта.pdf', uploadedAt: '2026-08-30' }
    ],
    news: [
      { date: '2026-10-04', source: 'Интерфакс', title: '«Ромашка» начинает строительство второй очереди тепличного комплекса', teaser: 'Инвестиции в проект оцениваются в 2,4 млрд RUB, запуск планируется на IV квартал 2027 года.' },
      { date: '2026-09-27', source: 'Коммерсантъ', title: 'ГК «Цветы» консолидирует торговую сеть', teaser: 'Холдинг объявил о переводе оптовых продаж в единую торговую компанию группы.' },
      { date: '2026-09-15', source: 'СКРИН', title: 'Обновлён кредитный рейтинг ООО «Ромашка»', teaser: 'Рейтинговое агентство повысило прогноз по рейтингу кредитоспособности со «стабильного» до «позитивного».' }
    ],
    giga: {
      about: [
        'ООО «Ромашка» — крупнейший в РФ производитель срезочных цветов, входит в ГК «Цветы». 4 тепличных комплекса общей площадью 62 га, собственная логистика и торговая сеть.',
        'Выручка за 2025 год — 3,4 млрд RUB Среднегодовой рост выручки за 3 года — 12%. Численность — около 1 200 человек.',
        'Стратегия — удвоение производства к 2028 году за счёт второй очереди тепличного комплекса.'
      ],
      lpr: [
        { name: 'Титов Валерий Сергеевич', position: 'Генеральный директор' },
        { name: 'Миронова Алла Петровна', position: 'Финансовый директор' },
        { name: 'Гайдар Игорь Львович', position: 'Заместитель ГД по производству' }
      ],
      cooperation: [
        'Клиент банка с 2016 года: инвестиционное кредитование, зарплатный проект, РКО.',
        'Действующая невозобновляемая кредитная линия на 1,2 млрд RUB — инвестиционная программа расширения.',
        'Текущий фокус — структурирование финансирования второй очереди тепличного комплекса (2,4 млрд RUB).'
      ]
    },
    goals: {
      business: [
        { typeLabel: 'Бизнес', period: '2026', title: 'Запуск второй очереди тепличного комплекса', metric: 'Выручка, млн RUB', value: '520', comment: 'Цель зафиксирована по итогам страт. диалога 08.10.2026.', people: [{ fullName: 'Панова Елена Юрьевна', role: 'Клиентский менеджер', initials: 'ПЕ' }, { fullName: 'Ким Александр Сергеевич', role: 'Аналитик', initials: 'КА' }] },
        { typeLabel: 'Стратегическая цель', period: '2026', title: 'Удвоение производства к 2028 году', metric: 'Площадь теплиц, га', value: '124', comment: '', people: [{ fullName: 'Панова Елена Юрьевна', role: 'Клиентский менеджер', initials: 'ПЕ' }, { fullName: 'Соколов Дмитрий Викторович', role: 'Директор', initials: 'СД' }] },
        { typeLabel: 'Цифровая трансформация', period: '2026', title: 'Внедрение системы точного земледелия', metric: 'Срок', value: 'Q2 2027', comment: 'Пилот на 2 площадках.', people: [{ fullName: 'Ким Александр Сергеевич', role: 'Аналитик', initials: 'КА' }] }
      ],
      personal: [
        { typeLabel: 'Личная', period: '2026', title: 'Подготовить инвестиционную презентацию для ПИК', metric: 'Срок', value: '20.10.2026', comment: '', people: [{ fullName: 'Ким Александр Сергеевич', role: 'Аналитик', initials: 'КА' }] },
        { typeLabel: 'Личная', period: '2026', title: 'Провести страт. диалог с финансовым директором', metric: 'Срок', value: 'ноябрь 2026', comment: 'Повестка: залоговая база.', people: [{ fullName: 'Панова Елена Юрьевна', role: 'Клиентский менеджер', initials: 'ПЕ' }] }
      ],
      archives: [
        { year: '2025', goals: [
          { typeLabel: 'Бизнес', period: '2025', title: 'Рефинансирование кредитного портфеля', metric: 'Ставка', value: '−1,5 п.п.', comment: 'Выполнено', people: [{ fullName: 'Панова Елена Юрьевна', role: 'Клиентский менеджер', initials: 'ПЕ' }] },
          { typeLabel: 'Бизнес', period: '2025', title: 'Выход на 90% самообеспеченности рассадой', metric: 'Доля, %', value: '90', comment: 'Выполнено', people: [{ fullName: 'Ким Александр Сергеевич', role: 'Аналитик', initials: 'КА' }] }
        ] },
        { year: '2024', goals: [
          { typeLabel: 'Стратегическая цель', period: '2024', title: 'Запуск торговой сети «Цветы у дома»', metric: 'Точек продаж', value: '48', comment: 'Выполнено частично (41)', people: [{ fullName: 'Шотов Руслан Маратович', role: 'Клиентский менеджер', initials: 'ШР' }] }
        ] },
        { year: '2023', goals: [
          { typeLabel: 'Цифровая трансформация', period: '2023', title: 'Внедрение ERP на тепличных комплексах', metric: 'Срок', value: 'Q4 2023', comment: 'Выполнено', people: [{ fullName: 'Ким Александр Сергеевич', role: 'Аналитик', initials: 'КА' }] }
        ] }
      ]
    },
    credits: {
      summary: { total: '1 200 000 000,00', overdue: '0,00', margin: '13,8%' },
      active: [
        {
          kindLabel: 'Невозобновляемая кредитная линия', tone: 'neutral', period: '01.02.2024 – 01.02.2028',
          number: '№ 4172-Л/24', name: 'Инвестиционная программа расширения тепличного комплекса',
          metrics: [
            { label: 'Фиксированная ставка', value: '12,4%' },
            { label: 'Маржинальный доход, RUB', value: '48 300 000,00' },
            { label: 'Остаток срочной задолженности, RUB', value: '720 000 000,00' },
            { label: 'Сумма по договору, RUB', value: '1 200 000 000,00' }
          ],
          schedules: [
            { category: 'Следующий платёж процентов', date: '20.01.2027' },
            { category: 'Окончание льготного периода', date: '01.08.2027' },
            { category: 'Погашение основного долга', date: '01.02.2028' }
          ],
          finIndicators: [
            { label: 'Выдано, RUB', amount: '1 200 000 000,00' },
            { label: 'Проценты уплачено, RUB', amount: '164 200 000,00' },
            { label: 'Остаток задолженности, RUB', amount: '720 000 000,00' }
          ]
        },
        {
          kindLabel: 'Возобновляемая кредитная линия', tone: 'success', period: '15.06.2025 – 15.06.2027',
          number: '№ 5206-ВЛ/25', name: 'Пополнение оборотных средств (сезонное)',
          metrics: [
            { label: 'Фиксированная ставка', value: 'КСР + 2,8 п.п.' },
            { label: 'Маржинальный доход, RUB', value: '21 700 000,00' },
            { label: 'Остаток срочной задолженности, RUB', value: '310 000 000,00' },
            { label: 'Сумма по договору, RUB', value: '500 000 000,00' }
          ],
          schedules: [
            { category: 'Следующая уплата процентов', date: '31.12.2026' },
            { category: 'Плановое погашение', date: '15.06.2027' }
          ],
          finIndicators: [
            { label: 'Текущая задолженность, RUB', amount: '310 000 000,00' },
            { label: 'Доступный лимит, RUB', amount: '190 000 000,00' }
          ]
        },
        {
          kindLabel: 'Банковская гарантия', tone: 'warning', period: '10.09.2026 – 10.03.2027',
          number: '№ 6401-Г/26', name: 'Гарантия исполнения обязательств по контракту поставки',
          metrics: [
            { label: 'Фиксированная ставка', value: '3,1% год.' },
            { label: 'Маржинальный доход, RUB', value: '2 800 000,00' },
            { label: 'Остаток срочной задолженности, RUB', value: '–' },
            { label: 'Сумма по договору, RUB', value: '180 000 000,00' }
          ],
          schedules: [{ category: 'Окончание срока гарантии', date: '10.03.2027' }],
          finIndicators: [{ label: 'Сумма гарантии, RUB', amount: '180 000 000,00' }]
        }
      ],
      pipeline: [
        {
          dateLabel: '05.10.2026', termLabel: '84 мес.', kfuId: 'КФЮЛ 04-2026',
          stageLabel: 'Согласование структуры финансирования', stageStatus: 'В работе',
          rateLabel: 'КСР + 3,4 п.п.', currencyLabel: 'RUB', amountLabel: '2 400 000 000,00',
          updatedLabel: 'Обновлено 08.10.2026',
          dealData: [
            { label: 'Целевое назначение', value: 'Строительство второй очереди тепличного комплекса' },
            { label: 'Обеспечение', value: 'Залог тепличного комплекса, поручительство ГК' },
            { label: 'Льготный период', value: '24 мес.' }
          ],
          description: 'Инвестиционное финансирование проекта строительства второй очереди тепличного комплекса (2,4 млрд RUB, 20 га).'
        },
        {
          dateLabel: '21.09.2026', termLabel: '12 мес.', kfuId: 'КФЮЛ 09-2026',
          stageLabel: 'Предварительная оценка', stageStatus: 'В работе',
          rateLabel: 'КСР + 2,6 п.п.', currencyLabel: 'RUB', amountLabel: '150 000 000,00',
          updatedLabel: 'Обновлено 30.09.2026',
          dealData: [
            { label: 'Целевое назначение', value: 'Оборотный капитал (сезонная закупка рассады)' },
            { label: 'Обеспечение', value: 'Залог товаров в обороте' },
            { label: 'Штрафы и комиссии', value: 'Не предусмотрены' }
          ],
          description: 'Короткое финансирование сезонной закупки посадочного материала под контракт с сетевым покупателем.'
        }
      ]
    },
    financials: {
      fok: {
        revenueValue: '346,27 млн RUB',
        revenueGrowth: '↑ 12.6% гг',
        periods: ['3КВ 25', '4КВ 25', '1КВ 26', '2КВ 26', '3КВ 26', '4КВ 26'],
        series: [
          { label: 'Чистый долг', type: 'line', values: [742, 718, 755, 731, 706, 684] },
          { label: 'Чистый долг/EBITDA', type: 'bar', values: [2.1, 2.0, 2.3, 2.1, 1.9, 1.8] }
        ],
        rows: [
          { label: 'Выручка', values: ['78,40', '84,60', '89,10', '92,30', '96,80', '101,20'], subs: ['млн RUB', 'млн RUB', 'млн RUB', 'млн RUB', 'млн RUB', 'млн RUB'] },
          { label: 'EBITDA', values: ['22,10', '23,80', '25,10', '26,20', '27,60', '29,10'], subs: ['млн RUB', 'млн RUB', 'млн RUB', 'млн RUB', 'млн RUB', 'млн RUB'] },
          { label: 'Чистый долг', values: ['742,00', '718,00', '755,00', '731,00', '706,00', '684,00'], subs: ['млн RUB', 'млн RUB', 'млн RUB', 'млн RUB', 'млн RUB', 'млн RUB'] }
        ]
      },
      custom: {
        metrics: [
          { label: 'Выручка', value: '346,27' },
          { label: 'Долг', value: '684,00' },
          { label: 'EBITDA', value: '98,40' },
          { label: 'Маржинальность EBITDA %', value: '28,4%' },
          { label: 'EBIT', value: '71,20' },
          { label: 'Долг / EBITDA', value: '1,8' },
          { label: 'Прибыль', value: '42,10' },
          { label: 'Долг / EBIT', value: '2,5' }
        ],
        comment: 'Метрики за 12 мес. на 30.09.2026. Источник — управленческая отчётность клиента.'
      }
    },
    analysis: {
      sections: [
        { label: 'P&L', rows: [
          { label: 'Выручка', values: ['102 400,00', '108 900,00', '115 600,00', '119 200,00', '124 800,00', '131 500,00'] },
          { label: 'Себестоимость', values: ['74 300,00', '78 100,00', '83 500,00', '85 400,00', '88 900,00', '92 600,00'] },
          { label: 'EBITDA', values: ['28 100,00', '30 800,00', '32 100,00', '33 800,00', '35 900,00', '38 900,00'] },
          { label: 'Проценты к уплате', values: ['4 100,00', '3 900,00', '3 700,00', '3 600,00', '3 400,00', '3 200,00'] },
          { label: 'Чистая прибыль', values: ['12 400,00', '14 100,00', '15 600,00', '16 900,00', '18 300,00', '20 700,00'] }
        ] },
        { label: 'Балансовые показатели', rows: [
          { label: 'Внеоборотные активы', values: ['1 890 000,00', '1 920 000,00', '1 960 000,00', '2 010 000,00', '2 060 000,00', '2 120 000,00'] },
          { label: 'Оборотные активы', values: ['640 000,00', '680 000,00', '710 000,00', '690 000,00', '730 000,00', '760 000,00'] },
          { label: 'Капитал', values: ['1 240 000,00', '1 290 000,00', '1 330 000,00', '1 380 000,00', '1 440 000,00', '1 500 000,00'] }
        ] },
        { label: 'ДДС и CAPEX', rows: [
          { label: 'Операционный поток', values: ['31 200,00', '33 500,00', '34 100,00', '35 800,00', '37 200,00', '39 400,00'] },
          { label: 'CAPEX', values: ['48 000,00', '52 000,00', '56 000,00', '58 000,00', '61 000,00', '64 000,00'] },
          { label: 'Финансовый поток', values: ['16 800,00', '18 500,00', '21 900,00', '22 200,00', '23 800,00', '24 600,00'] }
        ] },
        { label: 'Общий долг', rows: [
          { label: 'Краткосрочный', values: ['310 000,00', '310 000,00', '310 000,00', '310 000,00', '310 000,00', '310 000,00'] },
          { label: 'Долгосрочный', values: ['720 000,00', '720 000,00', '720 000,00', '720 000,00', '720 000,00', '720 000,00'] }
        ] },
        { label: 'Долг перед Сбербанком', rows: [
          { label: 'Основной долг', values: ['1 030 000,00', '1 030 000,00', '1 030 000,00', '1 030 000,00', '1 030 000,00', '1 030 000,00'] },
          { label: 'Проценты', values: ['10 600,00', '10 300,00', '10 100,00', '9 900,00', '9 700,00', '9 400,00'] }
        ] },
        { label: 'Коэффициенты', rows: [
          { label: 'Текущая ликвидность', values: ['1,62', '1,68', '1,71', '1,69', '1,74', '1,78'] },
          { label: 'Автономия', values: ['0,48', '0,49', '0,50', '0,51', '0,52', '0,53'] }
        ] },
        { label: 'LTM показатели', rows: [
          { label: 'LTM Выручка', values: ['418 600,00', '424 900,00', '431 200,00', '436 700,00', '442 100,00', '448 600,00'] },
          { label: 'LTM EBITDA', values: ['117 900,00', '120 300,00', '121 800,00', '123 600,00', '125 400,00', '127 800,00'] }
        ] }
      ]
    },
    maPipeline: [
      { id: 'MA-1042', name: 'Приобретение тепличного комплекса «Южный»', amount: '1 800 млн RUB', date: '12.11.2026', status: 'В работе', date2: '12.11.2026' }
    ],
    dcmPipeline: [
      { id: 'DCM-0311', name: 'Выпуск биржевых облигаций, серия 001Р', income: '86 400 тыс. RUB', incomeDate: 'Q1 2027' }
    ],
    ecmPipeline: []
  });

  /* ── Остальные клиенты холдинга «Цветы» ────────────────────────────── */
  var landysh = mkClient({
    id: '3000012346', name: 'ООО «Ландыш»', fullName: 'Общество с ограниченной ответственностью «Ландыш»',
    holdingId: 'H-1', holdingName: 'ГК «Цветы»', inn: '7712345701', ogrn: '1167746222201',
    legalAddress: '125212, г. Москва, Ленинградское шоссе, д. 39, стр. 1, этаж 4, помещ. II',
    growthCompany: true, didGrowthCompany: true, quarterChip: 'Q3 2026',
    industry: 'Сельское хозяйство', macro: 'Агропромышленный комплекс', sub: 'Растениеводство',
    terBank: 'CA', gosb: '8634', seed: 31, revenue: 214, inQuarterPlan: true
  });
  var siren = mkClient({
    id: '3000012347', name: 'ООО «Сирень»', fullName: 'Общество с ограниченной ответственностью «Сирень»',
    holdingId: 'H-1', holdingName: 'ГК «Цветы»', inn: '5024113302', ogrn: '1175024011544',
    legalAddress: '141014, Московская обл., г. Мытищи, Волковское шоссе, д. 5, стр. 1',
    industry: 'Сельское хозяйство', macro: 'Агропромышленный комплекс', sub: 'Цветоводство',
    terBank: 'CA', gosb: '8634', seed: 17, revenue: 96, topClient: false
  });

  /* ── ГК «АгроСоюз» ─────────────────────────────────────────────────── */
  var zarya = mkClient({
    id: '3000020011', name: 'ООО «Заря Агро»', fullName: 'Общество с ограниченной ответственностью «Заря Агро»',
    holdingId: 'H-2', holdingName: 'ГК «АгроСоюз»', inn: '6652334455', ogrn: '1156654032211',
    legalAddress: '620144, Свердловская обл., г. Екатеринбург, ул. Малышева, д. 51, оф. 902',
    didGrowthCompany: true, topClient: true, industry: 'Производство пищевых продуктов',
    macro: 'Агропромышленный комплекс', sub: 'Мукомольные изделия', terBank: 'SZB', gosb: '5228',
    seed: 55, revenue: 421, gcmId: '04711', inQuarterPlan: true
  });
  var niva = mkClient({
    id: '3000020012', name: 'ООО «Нива-Центр»', fullName: 'Общество с ограниченной ответственностью «Нива-Центр»',
    holdingId: 'H-2', holdingName: 'ГК «АгроСоюз»', inn: '6652334462', ogrn: '1166654043322',
    legalAddress: '620144, Свердловская обл., г. Екатеринбург, ул. Малышева, д. 51, оф. 904',
    industry: 'Производство пищевых продуктов', macro: 'Агропромышленный комплекс', sub: 'Кондитерские изделия',
    terBank: 'SZB', gosb: '5228', seed: 28, revenue: 178
  });
  var kolos = mkClient({
    id: '3000020013', name: 'ООО «Колос»', fullName: 'Общество с ограниченной ответственностью «Колос»',
    holdingId: 'H-2', holdingName: 'ГК «АгроСоюз»', inn: '6652334479', ogrn: '1176654054433',
    legalAddress: '620017, Свердловская обл., г. Екатеринбург, пр-т Космонавтов, д. 38, лит. Б',
    industry: 'Сельское хозяйство', macro: 'Агропромышленный комплекс', sub: 'Растениеводство',
    terBank: 'SZB', gosb: '5228', seed: 12, revenue: 84, segment: 'Средний бизнес'
  });

  /* ── ГК «ТехноМир» ─────────────────────────────────────────────────── */
  var promteh = mkClient({
    id: '3000031004', name: 'ООО «ПромТехСервис»', fullName: 'Общество с ограниченной ответственностью «ПромТехСервис»',
    holdingId: 'H-3', holdingName: 'ГК «ТехноМир»', inn: '7814001122', ogrn: '1147847005566',
    legalAddress: '194100, г. Санкт-Петербург, Лесной пр-т, д. 63, лит. А, пом. 7-Н',
    growthCompany: true, industry: 'Машиностроение', macro: 'Промышленность', sub: 'Комплектующие',
    terBank: 'SZB', gosb: '9013', seed: 37, revenue: 268, gcmId: '04711'
  });
  var tehmash = mkClient({
    id: '3000031005', name: 'АО «ТехноМаш»', fullName: 'Акционерное общество «ТехноМаш»',
    holdingId: 'H-3', holdingName: 'ГК «ТехноМир»', inn: '7814001139', ogrn: '1157847066778',
    legalAddress: '194100, г. Санкт-Петербург, Лесной пр-т, д. 63, лит. Б',
    didGrowthCompany: true, topClient: true, industry: 'Машиностроение', macro: 'Промышленность',
    sub: 'Приборостроение', terBank: 'SZB', gosb: '9013', seed: 63, revenue: 512, inQuarterPlan: true
  });
  var mikro = mkClient({
    id: '3000031006', name: 'ООО «МикроПрибор»', fullName: 'Общество с ограниченной ответственностью «МикроПрибор»',
    holdingId: 'H-3', holdingName: 'ГК «ТехноМир»', inn: '7814001146', ogrn: '1167847078899',
    legalAddress: '195279, г. Санкт-Петербург, ш. Революции, д. 69, к. 2, лит. Е',
    industry: 'Машиностроение', macro: 'Промышленность', sub: 'Приборостроение',
    terBank: 'SZB', gosb: '9013', seed: 9, revenue: 61, segment: 'Средний бизнес'
  });

  /* ── ГК «ЛесТрейд» ─────────────────────────────────────────────────── */
  var severles = mkClient({
    id: '3000042007', name: 'ООО «СеверЛес»', fullName: 'Общество с ограниченной ответственностью «СеверЛес»',
    holdingId: 'H-4', holdingName: 'ГК «ЛесТрейд»', inn: '5262003301', ogrn: '1185262011233',
    legalAddress: '603005, г. Нижний Новгород, ул. Нижегородская, д. 12, оф. 301',
    growthCompany: true, didGrowthCompany: true, industry: 'Лесозаготовка',
    macro: 'Лесопромышленный комплекс', sub: 'Пиломатериалы', terBank: 'PVB', gosb: '7121',
    seed: 44, revenue: 305, gcmId: '04711', inQuarterPlan: true
  });
  var lestrade = mkClient({
    id: '3000042008', name: 'ООО «ЛесТрейд Логистика»', fullName: 'Общество с ограниченной ответственностью «ЛесТрейд Логистика»',
    holdingId: 'H-4', holdingName: 'ГК «ЛесТрейд»', inn: '5262003318', ogrn: '1195262022344',
    legalAddress: '603005, г. Нижний Новгород, ул. Нижегородская, д. 12, оф. 305',
    industry: 'Лесозаготовка', macro: 'Лесопромышленный комплекс', sub: 'Целлюлоза',
    terBank: 'PVB', gosb: '7121', seed: 21, revenue: 142
  });

  /* ── ГК «СтройИндустрия» ───────────────────────────────────────────── */
  var betonmix = mkClient({
    id: '3000055009', name: 'ООО «БетонМикс»', fullName: 'Общество с ограниченной ответственностью «БетонМикс»',
    holdingId: 'H-5', holdingName: 'ГК «СтройИндустрия»', inn: '6321045530', ogrn: '1206321023455',
    legalAddress: '432072, Ульяновская обл., г. Ульяновск, Московское шоссе, д. 92, корп. 5',
    industry: 'Производство стройматериалов', macro: 'Строительство', sub: 'Бетон и ЖБИ',
    terBank: 'SRB', gosb: '4402', seed: 26, revenue: 187
  });

  /** @type {ClientRsDto[]} */
  window.MOCK_CLIENTS = [romashka, landysh, siren, zarya, niva, kolos, promteh, tehmash, mikro, severles, lestrade, betonmix];
})();

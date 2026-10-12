/* =========================================================================
   dictionaries.js — справочники и конфиги реестров концепта ibp-redesign-v1.

   Обычный <script>, не JSON: страницы открываются по file://. Всё, что
   перечислениями и подписями пользуется сразу несколько страниц, живёт здесь.

   Имена — в стиле API фронтенда (Source: invented (10.10.2026) у каждого
   typedef): значения правдоподобные, детерминированные; состав справочников —
   по описи задачи MS0014 (разделы 3–4) и открытым вопросам из неё.
   ========================================================================= */

/**
 * Код территориального банка (колонка «ТБ», чип).
 * Source: invented (10.10.2026) — перечень из ТЗ MS0014 §4.2.
 * @typedef {'SZB'|'DB'|'CA'|'SRB'|'PVB'|'SB'} TerBankCode
 */

/** Подписи кодов ТБ. @type {Record<TerBankCode, string>} */
window.DICT_TER_BANKS = { SZB: 'СЗБ', DB: 'ДБ', CA: 'ЦА', SRB: 'СРБ', PVB: 'ПВБ', SB: 'СБ' };

/**
 * ГОСБ — четырёхзначный номер головного отделения.
 * Source: invented (10.10.2026).
 * @typedef {string} GosbCode
 */

/** @type {GosbCode[]} */
window.DICT_GOSB = ['8634', '5228', '9013', '7121', '4402', '1804'];

/**
 * Отраслевая цепочка: макроотрасль → отрасль → подотрасль.
 * Source: invented (10.10.2026) — правдоподобные значения в стиле системы.
 * @typedef {Object} IndustryNodeDto
 * @property {string} macro     макроотрасль
 * @property {string} industry  отрасль
 * @property {string[]} subs    подотрасли
 */

/** @type {IndustryNodeDto[]} */
window.DICT_INDUSTRIES = [
  { macro: 'Агропромышленный комплекс', industry: 'Сельское хозяйство', subs: ['Цветоводство', 'Растениеводство', 'Птицеводство'] },
  { macro: 'Агропромышленный комплекс', industry: 'Производство пищевых продуктов', subs: ['Мукомольные изделия', 'Кондитерские изделия'] },
  { macro: 'Промышленность', industry: 'Машиностроение', subs: ['Приборостроение', 'Сельхозтехника', 'Комплектующие'] },
  { macro: 'Промышленность', industry: 'Металлообработка', subs: ['Металлоконструкции', 'Метизы'] },
  { macro: 'Лесопромышленный комплекс', industry: 'Лесозаготовка', subs: ['Пиломатериалы', 'Целлюлоза'] },
  { macro: 'Строительство', industry: 'Производство стройматериалов', subs: ['Бетон и ЖБИ', 'Сухие смеси'] }
];

/** Сегменты клиента (колонка «Сегмент»). @type {string[]} */
window.DICT_SEGMENTS = ['Крупный бизнес', 'Средний бизнес', 'Финансовые институты'];

/**
 * Деск — рабочая группа сотрудников.
 * Source: invented (10.10.2026); деск демо-пользователя — из ТЗ MS0014 §3.
 * @typedef {Object} DeskDto
 * @property {string} id   код деска
 * @property {string} name название
 */

/** @type {DeskDto[]} */
window.DICT_DESKS = [
  { id: 'D-SMB-NR6', name: 'SMB Природные ресурсы +6' },
  { id: 'D-CIB-MSK', name: 'CIB Москва' },
  { id: 'D-CIB-REG', name: 'CIB Регионы' },
  { id: 'D-SMB-IND', name: 'SMB Промышленность' },
  { id: 'D-DID-CTR', name: 'ДИД Центральный' }
];

/**
 * Статус сделки.
 * Source: invented (10.10.2026) — из описи вариантов сделки MS0014 §4.3.
 * @typedef {'WORK'|'DROPPED'} OpportunityStatusCode
 */

/** Подписи статусов сделки. @type {Record<OpportunityStatusCode, string>} */
window.OPPORTUNITY_STATUS_LABELS = { WORK: 'В работе', DROPPED: 'Выбыла' };

/**
 * Стадия сделки.
 * Source: invented (10.10.2026) — из описи вариантов сделки MS0014 §4.3.
 * @typedef {'RESPONSIBLE_ASSIGNMENT'|'IDEA'|'WORK_STOPPED'} OpportunityStageCode
 */

/** Подписи стадий сделки. @type {Record<OpportunityStageCode, string>} */
window.OPPORTUNITY_STAGE_LABELS = {
  RESPONSIBLE_ASSIGNMENT: 'Назначение ответственного',
  IDEA: 'Проработка идеи сделки',
  WORK_STOPPED: 'Работа прекращена'
};

/**
 * Источник сделки — раздел, в котором она показывается.
 * Source: invented (10.10.2026) — MS0014 §6.1.
 * @typedef {'binding'|'possible'|'cib'|'campaign'|'pipeline'} OpportunitySourceCode
 */

/**
 * Вкладка реестра внутри источника.
 * Source: invented (10.10.2026) — MS0014 §4.2 (вкладки — подфильтры, Р4).
 * @typedef {'active-new'|'active-modified'|'archive'|'active'|'my-desk'|'my'|'lost'|'pf'} OpportunityTabCode
 */

/** Подписи вкладок реестров сделок. @type {Record<string, string>} */
window.OPPORTUNITY_TAB_LABELS = {
  'active-new': 'Активные новые сделки',
  'active-modified': 'Активные сделки с изменениями',
  'archive': 'В архиве',
  'active': 'Активные проекты',
  'my-desk': 'Сделки моего деска',
  'my': 'Мои сделки',
  'lost': 'Упущенные сделки',
  'pf': 'Потенциальные сделки ПФ'
};

/**
 * Причина выбытия/отказа.
 * Source: invented (10.10.2026) — известна одна причина, справочника нет
 * (открытый вопрос 3 задачи MS0014); пока все выбывшие — с ней.
 * @typedef {'WAIT_EXPIRED'} DropReasonCode
 */

/** Подписи причин выбытия. @type {Record<DropReasonCode, string>} */
window.DROP_REASON_LABELS = { WAIT_EXPIRED: 'Срок ожидания истек' };

/**
 * Группа продуктов сделки (чипы колонки «Группа продуктов», группа на карточке
 * продукта).
 * Source: invented (10.10.2026) — «Кредиты» и «Продукты УСИ» из ТЗ, остальные
 * доборы — правдоподобные, заменить по справочнику системы.
 * @typedef {'LOANS'|'USI'|'GUARANTEES'|'FACTORING'} ProductGroupCode
 */

/** Подписи групп продуктов. @type {Record<ProductGroupCode, string>} */
window.PRODUCT_GROUP_LABELS = { LOANS: 'Кредиты', USI: 'Продукты УСИ', GUARANTEES: 'Гарантии', FACTORING: 'Факторинг' };

/**
 * Статус лида (потенциала).
 * Source: invented (10.10.2026).
 * @typedef {'WORK'|'MOVED_TO_PIPELINE'} LeadStatusCode
 */

/** Подписи статусов лида. @type {Record<LeadStatusCode, string>} */
window.LEAD_STATUS_LABELS = { WORK: 'В работе', MOVED_TO_PIPELINE: 'Перемещена в Pipeline' };

/**
 * Вид лида — реестр, в котором лид показывается.
 * Source: invented (10.10.2026) — MS0014 §6.1.
 * @typedef {'did'|'cm'|'binding'|'possible'|'rd'} LeadKindCode
 */

/** Подписи видов лидов. @type {Record<LeadKindCode, string>} */
window.LEAD_KIND_LABELS = { did: 'Лиды ДИД', cm: 'Лиды для КМ', binding: 'Обязательные лиды', possible: 'Возможные лиды', rd: 'Потенциалы ДИД в ТБ. Потенциалы РД.' };

/**
 * Статус встречи.
 * Source: invented (10.10.2026) — перечень из ТЗ MS0014 §3; needsAttention —
 * «красная Запланирована» со снимка, смысл неизвестен (открытый вопрос 5).
 * @typedef {'SCHEDULED'|'COMPLETED'|'CANCELLED'} MeetingStatusCode
 */

/** Подписи статусов встречи. @type {Record<MeetingStatusCode, string>} */
window.MEETING_STATUS_LABELS = { SCHEDULED: 'Запланирована', COMPLETED: 'Завершена', CANCELLED: 'Отменена' };

/**
 * Статус задачи.
 * Source: invented (10.10.2026) — перечень из ТЗ MS0014 §3 и справочника
 * «Статусы задач» (MS0014 §4.11).
 * @typedef {'PENDING_EXECUTION'|'DONE'|'CANCELLED'|'ADJUSTMENT_REQUIRED'} TaskStatusCode
 */

/** Подписи статусов задачи. @type {Record<TaskStatusCode, string>} */
window.TASK_STATUS_LABELS = {
  PENDING_EXECUTION: 'Ожидает исполнения',
  DONE: 'Выполнено',
  CANCELLED: 'Отменена',
  ADJUSTMENT_REQUIRED: 'Требуется корректировка'
};

/** Действующие/выключенные статусы справочника «Статусы задач» (§4.11). @type {{code:TaskStatusCode,label:string,enabled:boolean,disabledDate:string|null}[]} */
window.DICT_TASK_STATES = [
  { code: 'PENDING_EXECUTION', label: 'Ожидает исполнения', enabled: true, disabledDate: null },
  { code: 'DONE', label: 'Выполнено', enabled: true, disabledDate: null },
  { code: 'CANCELLED', label: 'Отменена', enabled: true, disabledDate: null },
  { code: 'ADJUSTMENT_REQUIRED', label: 'Требуется корректировка', enabled: true, disabledDate: null },
  { code: 'CLOSED_MANUAL', label: 'Закрыта вручную', enabled: false, disabledDate: '2026-02-14' },
  { code: 'REJECTED', label: 'Отклонена', enabled: false, disabledDate: '2025-11-03' },
  { code: 'POSTPONED', label: 'Отложена', enabled: false, disabledDate: '2025-06-18' },
  { code: 'IN_PROGRESS', label: 'В исполнении', enabled: false, disabledDate: '2025-04-02' },
  { code: 'CHECK_WAIT', label: 'Ожидает проверки', enabled: false, disabledDate: '2024-12-20' }
];

/**
 * Приоритет задачи/сделки.
 * Source: invented (10.10.2026) — перечень из ТЗ MS0014 §3.
 * @typedef {'MAX'|'HIGH'|'MEDIUM'|'LOW'} PriorityCode
 */

/** Подписи приоритетов. @type {Record<PriorityCode, string>} */
window.PRIORITY_LABELS = { MAX: 'Максимальный', HIGH: 'Высокий', MEDIUM: 'Средний', LOW: 'Низкий' };

/** Тип задачи (справочник «Типы задач», колонка и фильтр задач).
 * Source: invented (10.10.2026) — состав справочника неизвестен, «Другое»
 * из фильтра-чипа ТЗ; заменить по справочнику системы. @type {string[]} */
window.DICT_TASK_TYPES = ['Другое', 'Встреча', 'Документы', 'Проработка сделки'];

/** Тип источника встречи (§4.9). @type {string[]} */
window.DICT_MEETING_SOURCE_TYPES = ['Потенциал', 'Клиент', 'Сделка ДИД'];

/* ─────────────────────────────────────────────────────────────────────────
   Конфиги реестров: колонки, вкладки, действия, разделы модалки фильтра.
   Колонку рисует виджет таблицы по полю type:
     id-link — ссылка на страницу объекта; chip — одиночный чип; chips —
     чипы со свёрткой «+N»; bool — «Да»/«Нет»; icon-actions — кнопки «Действия»;
     text — обычный текст; muted — приглушённый текст.
   ========================================================================= */

/**
 * Конфиг колонки реестра.
 * Source: invented (10.10.2026).
 * @typedef {Object} RegistryColumnDto
 * @property {string} key   ключ поля записи
 * @property {string} label заголовок колонки
 * @property {string} type  тип отрисовки (id-link | text | chip | chips | bool | icon-actions | muted)
 * @property {string} [align] выравнивание значения (left | right)
 */

/**
 * Конфиг реестра.
 * Source: invented (10.10.2026) — колонки по описи MS0014 §4.2, §4.5, §4.9, §4.10.
 * @typedef {Object} RegistryConfigDto
 * @property {string} id              идентификатор реестра
 * @property {string} title           заголовок страницы
 * @property {{id:string,label:string,page:string}[]} tabs вкладки (подфильтры одной таблицы, Р4); page — страница фронтенда вкладки, значение ?tab=
 * @property {boolean} hasMoreTabs    есть ли хвост «…» у ряда вкладок (Pipeline)
 * @property {RegistryColumnDto[]} columns колонки
 * @property {string[]} rowActions    действия «Взять в работу»/«Отказаться» (id кнопок)
 * @property {string[]} filterSections разделы модалки фильтра (по колонкам, допущение агента)
 * @property {Object} [defaultPreset]  заполненные поля фильтра по умолчанию (Pipeline «Статус: В работе»)
 */

/** Колонки, общие для реестров сделок (MS0014 §4.2). @type {RegistryColumnDto[]} */
var OPP_COMMON = [
  { key: 'id', label: 'ID сделки', type: 'id-link' },
  { key: 'project', label: 'Проект', type: 'text' },
  { key: 'clientName', label: 'Клиент', type: 'text' },
  { key: 'holdingName', label: 'Холдинг', type: 'text' },
  { key: 'potentialId', label: 'ID потенциала', type: 'text' },
  { key: 'industry', label: 'Отрасль', type: 'text' },
  { key: 'macro', label: 'Макроотрасль', type: 'text' },
  { key: 'sub', label: 'Подотрасль', type: 'text' },
  { key: 'clientCrmId', label: 'CRM ID клиента', type: 'muted' },
  { key: 'description', label: 'Описание', type: 'text' },
  { key: 'tbLabel', label: 'ТБ', type: 'chip' },
  { key: 'gosb', label: 'ГОСБ', type: 'text' },
  { key: 'keyDeal', label: 'Ключевая сделка', type: 'bool' },
  { key: 'priorityLabel', label: 'Приоритет', type: 'chip' },
  { key: 'realtyType', label: 'Тип недвижимости', type: 'text' },
  { key: 'productLabels', label: 'Продукты сделки', type: 'chips' },
  { key: 'productGroupLabels', label: 'Группа продуктов', type: 'chips' }
];

var OPP_ACTIONS = [{ key: 'actions', label: 'Действия', type: 'icon-actions' }];

/** @type {RegistryConfigDto[]} */
window.REGISTRY_CONFIGS = [
  {
    id: 'binding',
    title: 'Обязательные сделки',
    tabs: [
      { id: 'active-new', label: 'Активные новые сделки', page: 'BindingActiveNewOpportunities' },
      { id: 'active-modified', label: 'Активные сделки с изменениями', page: 'BindingActiveModifiedOpportunities' },
      { id: 'archive', label: 'В архиве', page: 'BindingArchiveOpportunities' }
    ],
    hasMoreTabs: false,
    columns: OPP_ACTIONS.concat(OPP_COMMON),
    rowActions: ['take', 'refuse'],
    filterSections: ['ТБ', 'ГОСБ', 'Отрасль', 'Макроотрасль', 'Подотрасль', 'Приоритет', 'Группа продуктов', 'Ключевая сделка']
  },
  {
    id: 'possible',
    title: 'Возможные сделки',
    tabs: [
      { id: 'active-new', label: 'Активные новые сделки', page: 'PossibleActiveNewOpportunities' },
      { id: 'active-modified', label: 'Активные сделки с изменениями', page: 'PossibleActiveModifiedOpportunities' },
      { id: 'archive', label: 'В архиве', page: 'PossibleArchiveOpportunities' }
    ],
    hasMoreTabs: false,
    columns: OPP_ACTIONS.concat(OPP_COMMON),
    rowActions: ['take', 'refuse'],
    filterSections: ['ТБ', 'ГОСБ', 'Отрасль', 'Макроотрасль', 'Подотрасль', 'Приоритет', 'Группа продуктов', 'Ключевая сделка']
  },
  {
    id: 'cib',
    title: 'Проекты продаж CIB',
    tabs: [
      { id: 'active', label: 'Активные проекты', page: 'OpportunityActiveSalesProjects' },
      { id: 'archive', label: 'В архиве', page: 'OpportunityArchiveSalesProjects' }
    ],
    hasMoreTabs: false,
    columns: OPP_ACTIONS.concat(OPP_COMMON),
    rowActions: ['take', 'refuse'],
    filterSections: ['ТБ', 'ГОСБ', 'Отрасль', 'Макроотрасль', 'Подотрасль', 'Приоритет', 'Группа продуктов']
  },
  {
    id: 'campaign',
    title: 'Кампании продаж',
    tabs: [
      { id: 'active', label: 'Активные кампании', page: 'CampaignsActiveOpportunities' },
      { id: 'archive', label: 'В архиве', page: 'CampaignsArchiveOpportunities' }
    ],
    hasMoreTabs: false,
    columns: [
      { key: 'dropoutReasonLabel', label: 'Причина выбытия', type: 'text' },
      { key: 'dropoutComment', label: 'Комментарий к причине выбытия', type: 'text' }
    ].concat([
      { key: 'id', label: 'ID сделки', type: 'id-link' },
      { key: 'project', label: 'Проект', type: 'text' },
      { key: 'clientName', label: 'Клиент', type: 'text' },
      { key: 'potentialId', label: 'ID потенциала', type: 'text' },
      { key: 'growthCompany', label: 'Компания роста', type: 'bool' },
      { key: 'didGrowthCompany', label: 'Компания роста ДИД', type: 'bool' },
      { key: 'topClient', label: 'Топ клиент', type: 'bool' },
      { key: 'onePager', label: 'Согласован One Pager', type: 'bool' },
      { key: 'description', label: 'Описание', type: 'text' },
      { key: 'industry', label: 'Отрасль', type: 'text' },
      { key: 'macro', label: 'Макроотрасль', type: 'text' },
      { key: 'sub', label: 'Подотрасль', type: 'text' },
      { key: 'tbLabel', label: 'ТБ', type: 'chip' },
      { key: 'gosb', label: 'ГОСБ', type: 'text' },
      { key: 'productGroupLabels', label: 'Группа продуктов', type: 'chips' }
    ]),
    /* активные кампании — те же колонки без двух колонок выбытия (Р4): ключ
       dropoutVisible регулирует это на странице */
    dropoutColumnsOnlyInArchive: true,
    rowActions: [],
    filterSections: ['ТБ', 'ГОСБ', 'Отрасль', 'Макроотрасль', 'Подотрасль', 'Группа продуктов']
  },
  {
    id: 'pipeline',
    title: 'Pipeline',
    tabs: [
      { id: 'my-desk', label: 'Сделки моего деска', page: 'MyDeskOpportunities' },
      { id: 'my', label: 'Мои сделки', page: 'MyOpportunities' },
      /* пары «Упущенных» и «Потенциальных ПФ» — по В2 MS0014a: допущение агента */
      { id: 'lost', label: 'Упущенные сделки', page: 'PipelineGenericOpportunities' },
      { id: 'pf', label: 'Потенциальные сделки ПФ', page: 'DidOpportunities' }
    ],
    hasMoreTabs: true,
    columns: OPP_COMMON.concat([{ key: 'totalVolumeLabel', label: 'Общий объем по сделке, млн RUB', type: 'text', align: 'right' }]),
    rowActions: [],
    filterSections: ['Статус', 'ТБ', 'ГОСБ', 'Отрасль', 'Макроотрасль', 'Подотрасль', 'Приоритет', 'Группа продуктов', 'Общий объем по сделке'],
    /* фильтр по умолчанию — «Статус: В работе» снимка; в ДС — чип «Применено: N» */
    defaultPreset: { statusLabel: 'В работе' }
  }
];

/** Колонки реестра «Лиды» (§4.5). @type {RegistryColumnDto[]} */
var LEAD_COMMON = [
  { key: 'id', label: 'ID лида', type: 'id-link' },
  { key: 'clientName', label: 'Клиент', type: 'text' },
  { key: 'holdingName', label: 'Холдинг', type: 'text' },
  { key: 'inn', label: 'ИНН', type: 'muted' },
  { key: 'growthCompany', label: 'Компания роста', type: 'bool' },
  { key: 'didGrowthCompany', label: 'Компания роста ДИД', type: 'bool' },
  { key: 'topClient', label: 'Топ клиент', type: 'bool' },
  { key: 'priorityQuarter', label: 'Приоритет на квартал РД', type: 'text' },
  { key: 'industry', label: 'Отрасль', type: 'text' },
  { key: 'macro', label: 'Макроотрасль', type: 'text' },
  { key: 'sub', label: 'Подотрасль', type: 'text' },
  { key: 'keyClient', label: 'Ключевой клиент', type: 'bool' },
  { key: 'segment', label: 'Сегмент', type: 'text' }
];

var LEAD_BINDING = [
  { key: 'id', label: 'ID продажи', type: 'id-link' },
  { key: 'clientName', label: 'Клиент', type: 'text' },
  { key: 'holdingName', label: 'Холдинг', type: 'text' },
  { key: 'inn', label: 'ИНН', type: 'muted' },
  { key: 'growthCompany', label: 'Компания роста', type: 'bool' },
  { key: 'didGrowthCompany', label: 'Компания роста ДИД', type: 'bool' },
  { key: 'topClient', label: 'Топ клиент', type: 'bool' },
  { key: 'priorityQuarter', label: 'Приоритет на квартал РД', type: 'text' },
  { key: 'industry', label: 'Отрасль', type: 'text' },
  { key: 'macro', label: 'Макроотрасль', type: 'text' }
];

/** @type {RegistryConfigDto[]} */
window.LEAD_REGISTRY_CONFIGS = [
  {
    id: 'leads',
    title: 'Лиды',
    tabs: [
      { id: 'did', label: 'Лиды', page: 'LeadsPage' },
      { id: 'cm', label: 'Лиды для КМ', page: 'LeadsForCmPage' }
    ],
    hasMoreTabs: false,
    columns: LEAD_COMMON,
    rowActions: [],
    filterSections: ['Компания роста', 'Компания роста ДИД', 'Топ клиент', 'Приоритет на квартал РД', 'Отрасль', 'Макроотрасль', 'Подотрасль', 'Ключевой клиент', 'Сегмент']
  },
  {
    id: 'binding-leads',
    title: 'Обязательные лиды',
    tabs: [],
    hasMoreTabs: false,
    columns: LEAD_BINDING,
    rowActions: [],
    filterSections: ['Компания роста', 'Компания роста ДИД', 'Топ клиент', 'Приоритет на квартал РД', 'Отрасль', 'Макроотрасль']
  },
  {
    id: 'possible-leads',
    title: 'Возможные лиды',
    tabs: [],
    hasMoreTabs: false,
    columns: LEAD_BINDING,
    rowActions: [],
    filterSections: ['Компания роста', 'Компания роста ДИД', 'Топ клиент', 'Приоритет на квартал РД', 'Отрасль', 'Макроотрасль']
  }
];

/** Колонки реестра встреч (§4.9). @type {RegistryColumnDto[]} */
window.MEETING_COLUMNS = [
  { key: 'id', label: 'ID встречи', type: 'id-link' },
  { key: 'statusLabel', label: 'Статус', type: 'chip' },
  { key: 'clientName', label: 'Клиент', type: 'text' },
  { key: 'deskChips', label: 'Отраслевой деск', type: 'chips' },
  { key: 'desks', label: 'Дески', type: 'chips' },
  { key: 'sourceTypeLabel', label: 'Источник встречи', type: 'text' },
  { key: 'sourceId', label: 'ID источника встречи', type: 'text' }
];

/** Колонки реестра задач (§4.10). @type {RegistryColumnDto[]} */
window.TASK_COLUMNS = [
  { key: 'id', label: '№', type: 'id-link' },
  { key: 'clientName', label: 'Клиент', type: 'text' },
  { key: 'holdingName', label: 'Холдинг', type: 'text' },
  { key: 'name', label: 'Название', type: 'text' },
  { key: 'description', label: 'Описание задачи', type: 'text' },
  { key: 'statusLabel', label: 'Статус', type: 'chip' },
  { key: 'priorityLabel', label: 'Приоритет', type: 'chip' },
  { key: 'dueDateLabel', label: 'Срок исполнения', type: 'text' },
  { key: 'type', label: 'Тип задачи', type: 'text' },
  { key: 'executorName', label: 'Исполнитель', type: 'text' },
  { key: 'createdDateLabel', label: 'Дата создания', type: 'text' },
  { key: 'initiatorName', label: 'Инициатор', type: 'text' },
  { key: 'linkedObjectTypeLabel', label: 'Связанный объект', type: 'text' },
  { key: 'linkedObjectNumber', label: 'Номер связанного объекта', type: 'text' }
];

/** Колонки справочника «Статусы задач» (§4.11). @type {RegistryColumnDto[]} */
window.TASK_STATE_COLUMNS = [
  { key: 'statusIcon', label: 'Статус', type: 'chip' },
  { key: 'code', label: 'Код', type: 'muted' },
  { key: 'label', label: 'Наименование', type: 'text' }
];

/* ── Формат чисел и дат (общий для страниц прототипа) ─────────────────── */

/* ID лидов-заполнителей: единый список для opportunities.js (колонка
   «ID потенциала») и potentials.js — каждый показанный ID открывается
   на странице лида. Source: invented (10.10.2026). */
window.DICT_FILLER_LEAD_IDS = [
  'L-10007', 'L-10014', 'L-10021', 'L-10028', 'L-10035', 'L-10042', 'L-10049', 'L-10056',
  'L-10063', 'L-10070', 'L-10077', 'L-10084', 'L-10091', 'L-10098', 'L-10105', 'L-10112',
  'L-10119', 'L-10126', 'L-10133', 'L-10140', 'L-10147', 'L-10154', 'L-10161', 'L-10168'
];

window.DICT_FMT = {
  /** «1 000 000,00» — деньги с разделителями. */
  money: function (n) {
    var v = Number(n) || 0;
    var neg = v < 0; v = Math.abs(v);
    var s = v.toFixed(2).replace('.', ',');
    var parts = s.split(',');
    var int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    var frac = parts[1].replace(/0+$/, '');
    return (neg ? '−' : '') + int + (frac ? ',' + frac : '');
  },
  /** «1 000 000» — целые с разделителями. */
  int: function (n) { return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0'); },
  /** «05.11.2026» из ISO-даты. */
  date: function (iso) {
    if (!iso) return '–';
    var p = String(iso).slice(0, 10).split('-');
    return p[2] + '.' + p[1] + '.' + p[0];
  },
  /** «05.11.2026 14:30» из ISO-даты-времени. */
  dateTime: function (iso) {
    if (!iso) return '–';
    return window.DICT_FMT.date(iso) + ' ' + String(iso).slice(11, 16);
  }
};

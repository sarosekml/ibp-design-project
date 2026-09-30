/* =========================================================================
   Каталог продуктов сделки — демо-данные прототипа.
   window.PRODUCT_DID_CATALOG · window.PRODUCT_CATALOG ·
   window.INSTRUMENT_TYPE_CATALOG · window.PRODUCT_TREE_RULES + карты подписей.

   Обычный <script> (file://, без fetch). Подключается до стора дерева:
   <script src="../data/mock-product-catalog.js"></script>
   <script src="../data/product-tree-store.js"></script>

   Откуда значения:
   – состав и порядок продуктов ДИД — макет «Продукты ДИД полный список»
     (29.09.2026);
   – обязательный состав — макет «созданные продукты ДИД с обязательными
     продуктами и инструментами» (11 продуктов ДИД из 25): продукт ДИД
     приходит со своими обязательными продуктами, продукт — со своими
     обязательными инструментами (ответ человека 30.09.2026);
   – продукты, доступные продукту ДИД, — окно «Продукты» (есть только для
     «Кредитный мезонин»);
   – флаги инструментов — описание строки на макете ProductRow и ответы
     человека 30.09.2026: к ФИ прикрепляются акции, пут и колл РЕПО,
     дебиторская задолженность и транш; вторая строка — у них и у «НКЛ с
     баланса ПАО»; своя страница — у них, у «НКЛ с баланса ПАО» и у
     «Договора займа (НКЛ)»; ⊕ «Добавить транш» — только у договора займа.
   Чего нет ни на макетах, ни в ответах — null с пометкой «не решено». Стор
   дерева читает null как «не показывать», а не как «нельзя»; у окна выбора
   null в составе значит «весь справочник» (ответ 27: «нечего выбрать» не
   бывает).

   Названия — по ответу человека 30.09.2026: продукт ДИД «Долевое участие в
   жилой недвижимости», продукт в нём «Долевое в ЖН»; «Акции / Доли»;
   «Договор займа (НКЛ)»; «Корп. договор»; «Корп. Контроль».
   ========================================================================= */

/**
 * Продукт ДИД — корневой узел дерева продуктов сделки.
 * Source: invented (29.09.2026) — заменить на DTO справочника, когда он появится.
 * @typedef {Object} ProductDidCatalogItemRsDto
 * @property {ProductDidCode} code            код продукта ДИД
 * @property {string} name                    название так, как его показывает интерфейс
 * @property {string|null} description        текст тултипа ⓘ в окне выбора;
 *                                            тексты даст человек (ответ 7)
 * @property {boolean} canBeMain              может быть основным продуктом ДИД
 *                                            сделки (у «Фондирования» — нет, ответ 11)
 * @property {ProductCode[]|null} mandatory   обязательные продукты — создаются
 *           вместе с продуктом ДИД, каждый со своими обязательными
 *           инструментами; [] — макет показывает продукт ДИД без состава;
 *           null — состава на макете нет, не решено (29.09.2026)
 * @property {ProductCode[]|null} productCodes продукты, которые можно добавить
 *           в окне «Продукты»; null — окна для этого продукта ДИД на макете
 *           нет: окно показывает обязательный состав, а без него — весь
 *           справочник продуктов (ответы 13 и 27)
 */

/**
 * Продукт — второй уровень дерева, входит в продукт ДИД.
 * Source: invented (29.09.2026).
 * @typedef {Object} ProductCatalogItemRsDto
 * @property {ProductCode} code
 * @property {string} name
 * @property {string|null} description             текст тултипа ⓘ; тексты даст человек
 * @property {InstrumentTypeCode[]} mandatoryInstrumentCodes инструменты, которые
 *           приходят вместе с продуктом, в порядке на макете (ответ 15)
 * @property {InstrumentTypeCode[]|null} instrumentCodes инструменты, которые можно
 *           добавить в окне «Инструменты»; null — примеров нет, окно
 *           показывает весь справочник типов инструментов
 */

/**
 * Тип инструмента — третий уровень дерева, входит в продукт.
 * Source: invented (29.09.2026).
 * @typedef {Object} InstrumentTypeCatalogItemRsDto
 * @property {InstrumentTypeCode} code
 * @property {string} name
 * @property {boolean} canAttachToFi        прикрепляется к карточке ФИ — в
 *           строке кнопка ⇄ «Изменить связь с ФИ»
 * @property {FinInstrumentTypeCode|null} fiType тип карточки ФИ, к которой
 *           инструмент прикрепляется; карточки другого типа в окне связи
 *           выключены (допущение агента, 30.09.2026, вопрос 39)
 * @property {ProductDetailsKind} detailsKind что стоит во второй строке
 * @property {boolean} canAddTranches       в строке кнопка ⊕ «Добавить транш»
 * @property {boolean} hasPage              у инструмента своя страница:
 *           заголовок — ссылка; страницы будут позже, адрес пока «#»
 * @property {ProductMenuAction[]} menuActions пункты меню ⋮ до погашения;
 *           после погашения «Погасить» меняется на «Отменить погашение»
 */

/**
 * Что показывает вторая строка узла (ответ человека 30.09.2026).
 * SIGNED_PURCHASE — дата подписания договора и стоимость покупки (акции,
 *                   дебиторская задолженность);
 * SIGNED_STRIKE   — дата подписания договора и цена исполнения (пут и колл РЕПО);
 * SIGNED_LIMIT    — дата подписания договора и сумма лимита (транш);
 * DID_PERIOD      — дата входа ДИД и дата выхода ДИД («НКЛ с баланса ПАО»);
 * NONE            — второй строки нет.
 * Source: invented (29.09.2026).
 * @typedef {'SIGNED_PURCHASE'|'SIGNED_STRIKE'|'SIGNED_LIMIT'|'DID_PERIOD'|'NONE'} ProductDetailsKind
 */

/**
 * Пункт меню ⋮ узла дерева.
 * Source: invented (29.09.2026).
 * @typedef {'REPAY'|'UNDO_REPAY'|'MOVE'|'DELETE'} ProductMenuAction
 */

/**
 * Source: invented (29.09.2026).
 * @typedef {'EQUITY_MEZZANINE'|'ADDITIONAL_YIELD'|'VENTURE_FINANCING'|'PAY_ONCE'|
 *   'EQUITY_PARTICIPATION'|'COMPENSATION_AGREEMENT'|'RESIDENTIAL_MEZZANINE'|
 *   'RESIDENTIAL_EQUITY'|'RESIDENTIAL_PROJECT_BRIDGE'|'PRE_PROJECT_BRIDGE'|
 *   'CREDIT_MEZZANINE'|'CORPORATE_CONTROL'|'FUNDING'|'COMMERCIAL_PROJECT_BRIDGE'|
 *   'LBO_MEZZANINE'|'AGRO_MEZZANINE'|'INTRAGROUP_LOAN'|'SEED_3_IN_1'|
 *   'SEED_COMPLEX_HOUSING'|'PRIVATE_EQUITY'|'MA_FINANCING'|'ADVISORY'|
 *   'PRODUCT_2_IN_1'|'GUARANTEE'|'PROJECT_FINANCE'} ProductDidCode
 */

/**
 * Коды продуктов — свой справочник: код продукта может совпадать с кодом
 * продукта ДИД того же названия («Кредитный мезонин» есть на обоих уровнях).
 * Source: invented (29.09.2026).
 * @typedef {'EQUITY_MEZZANINE_REPO'|'ADDITIONAL_YIELD'|'CREDIT_MEZZANINE'|
 *   'CORPORATE_CONTROL'|'FUNDING'|'EQUITY_STAKE'|'RESIDENTIAL_EQUITY_STAKE'|
 *   'CORPORATE_CONTROL_SENIOR'|'INTRAGROUP_LOAN'} ProductCode
 */

/**
 * Source: invented (29.09.2026); CALL_REPO и RECEIVABLES — ответ человека 30.09.2026.
 * @typedef {'SHARES'|'PUT_REPO'|'CALL_REPO'|'RECEIVABLES'|'LOAN_NCL'|
 *   'NCL_PJSC_BALANCE'|'CORPORATE_AGREEMENT'|'INTRAGROUP_LOAN_NCL'} InstrumentTypeCode
 */

/** Продукты ДИД в порядке полного списка. @type {ProductDidCatalogItemRsDto[]} */
window.PRODUCT_DID_CATALOG = [
  { code: 'EQUITY_MEZZANINE', name: 'Акционерный мезонин', description: null, canBeMain: true,
    mandatory: ['EQUITY_MEZZANINE_REPO'], productCodes: null },
  { code: 'ADDITIONAL_YIELD', name: 'Доп. доходность', description: null, canBeMain: true,
    mandatory: ['ADDITIONAL_YIELD'], productCodes: null },
  /* обязательный продукт «Кредитный мезонин» — ответ человека 30.09.2026 (18.1) */
  { code: 'VENTURE_FINANCING', name: 'Венчурное финансирование', description: null, canBeMain: true,
    mandatory: ['CREDIT_MEZZANINE'], productCodes: null },
  { code: 'PAY_ONCE', name: 'Pay Once', description: null, canBeMain: true, mandatory: null, productCodes: null },
  { code: 'EQUITY_PARTICIPATION', name: 'Долевое участие в капитале', description: null, canBeMain: true,
    mandatory: ['EQUITY_STAKE'], productCodes: null },
  { code: 'COMPENSATION_AGREEMENT', name: 'Соглашение о компенсационных выплатах', description: null, canBeMain: true,
    mandatory: [], productCodes: null },
  { code: 'RESIDENTIAL_MEZZANINE', name: 'Мезонин в жилой недвижимости', description: null, canBeMain: true,
    mandatory: null, productCodes: null },
  { code: 'RESIDENTIAL_EQUITY', name: 'Долевое участие в жилой недвижимости', description: null, canBeMain: true,
    mandatory: ['RESIDENTIAL_EQUITY_STAKE'], productCodes: null },
  { code: 'RESIDENTIAL_PROJECT_BRIDGE', name: 'Проектный бридж в жилой недвижимости', description: null, canBeMain: true,
    mandatory: null, productCodes: null },
  { code: 'PRE_PROJECT_BRIDGE', name: 'Предпроектный бридж', description: null, canBeMain: true,
    mandatory: null, productCodes: null },
  { code: 'CREDIT_MEZZANINE', name: 'Кредитный мезонин', description: null, canBeMain: true,
    mandatory: ['CREDIT_MEZZANINE'],
    productCodes: ['CREDIT_MEZZANINE', 'CORPORATE_CONTROL', 'FUNDING'] },
  { code: 'CORPORATE_CONTROL', name: 'Корпоративный контроль', description: null, canBeMain: true,
    mandatory: ['CORPORATE_CONTROL_SENIOR'], productCodes: null },
  /* основным быть не может — ответ человека 30.09.2026 (11) */
  { code: 'FUNDING', name: 'Фондирование', description: null, canBeMain: false,
    mandatory: ['FUNDING'], productCodes: null },
  { code: 'COMMERCIAL_PROJECT_BRIDGE', name: 'Проектный бридж в коммерческой недвижимости', description: null, canBeMain: true,
    mandatory: null, productCodes: null },
  { code: 'LBO_MEZZANINE', name: 'Мезонин в LBO', description: null, canBeMain: true, mandatory: null, productCodes: null },
  { code: 'AGRO_MEZZANINE', name: 'Мезонин в АПК', description: null, canBeMain: true, mandatory: null, productCodes: null },
  { code: 'INTRAGROUP_LOAN', name: 'Внутригрупповой кредит', description: null, canBeMain: true,
    mandatory: ['INTRAGROUP_LOAN'], productCodes: null },
  { code: 'SEED_3_IN_1', name: 'Начальное финансирование в рамках продукта "3 в 1"', description: null, canBeMain: true,
    mandatory: null, productCodes: null },
  { code: 'SEED_COMPLEX_HOUSING', name: 'Начальное финансирование в рамках продукта "Комплексное жилищное"',
    description: null, canBeMain: true, mandatory: null, productCodes: null },
  { code: 'PRIVATE_EQUITY', name: 'Private Equity', description: null, canBeMain: true,
    mandatory: ['EQUITY_STAKE'], productCodes: null },
  { code: 'MA_FINANCING', name: 'M&A Финансирование', description: null, canBeMain: true, mandatory: null, productCodes: null },
  { code: 'ADVISORY', name: 'Консультационные услуги', description: null, canBeMain: true, mandatory: null, productCodes: null },
  { code: 'PRODUCT_2_IN_1', name: 'Продукт "2 в 1"', description: null, canBeMain: true, mandatory: null, productCodes: null },
  { code: 'GUARANTEE', name: 'Гарантия', description: null, canBeMain: true, mandatory: null, productCodes: null },
  { code: 'PROJECT_FINANCE', name: 'Проектное финансирование', description: null, canBeMain: true, mandatory: null, productCodes: null }
];

/** Продукты. @type {ProductCatalogItemRsDto[]} */
window.PRODUCT_CATALOG = [
  /* «Колл: РЕПО» — рядом с путом, допущение агента (30.09.2026, вопрос 37) */
  { code: 'EQUITY_MEZZANINE_REPO', name: 'Акционерный мезонин (РЕПО)', description: null,
    mandatoryInstrumentCodes: ['SHARES', 'PUT_REPO'], instrumentCodes: ['SHARES', 'PUT_REPO', 'CALL_REPO'] },
  { code: 'ADDITIONAL_YIELD', name: 'Дополнительная доходность', description: null,
    mandatoryInstrumentCodes: [], instrumentCodes: null },
  /* Договор займа — с макетов состава и тайла, «НКЛ с баланса ПАО» — с макета тайла */
  { code: 'CREDIT_MEZZANINE', name: 'Кредитный мезонин', description: null,
    mandatoryInstrumentCodes: ['LOAN_NCL'], instrumentCodes: ['LOAN_NCL', 'NCL_PJSC_BALANCE'] },
  /* приходит с «Корп. договором», как на макете тайла, — допущение агента
     (30.09.2026, вопрос 36) */
  { code: 'CORPORATE_CONTROL', name: 'Корп. Контроль', description: null,
    mandatoryInstrumentCodes: ['CORPORATE_AGREEMENT'], instrumentCodes: ['CORPORATE_AGREEMENT'] },
  { code: 'FUNDING', name: 'Фондирование', description: null,
    mandatoryInstrumentCodes: [], instrumentCodes: null },
  { code: 'EQUITY_STAKE', name: 'Долевое участие', description: null,
    mandatoryInstrumentCodes: ['SHARES', 'CORPORATE_AGREEMENT'], instrumentCodes: ['SHARES', 'CORPORATE_AGREEMENT'] },
  { code: 'RESIDENTIAL_EQUITY_STAKE', name: 'Долевое в ЖН', description: null,
    mandatoryInstrumentCodes: ['SHARES', 'CORPORATE_AGREEMENT'], instrumentCodes: ['SHARES', 'CORPORATE_AGREEMENT'] },
  /* инструменты у продукта корпоративного контроля бывают — ответ человека
     30.09.2026 (18.2); какие — «Корп. договор», допущение агента (вопрос 36) */
  { code: 'CORPORATE_CONTROL_SENIOR', name: 'Корп. контроль для старшего кредита', description: null,
    mandatoryInstrumentCodes: [], instrumentCodes: ['CORPORATE_AGREEMENT'] },
  { code: 'INTRAGROUP_LOAN', name: 'Внутригрупповой кредит', description: null,
    mandatoryInstrumentCodes: ['INTRAGROUP_LOAN_NCL'], instrumentCodes: ['INTRAGROUP_LOAN_NCL'] }
];

/* Меню ⋮ инструмента — у всех одно (ответ человека 30.09.2026: кебаб у каждого
   инструмента, «Item» на макете — ошибка). На месте «Item» у договора займа —
   «Удалить», как у корп. договора, — допущение агента (вопрос 31). */
/** Типы инструментов. @type {InstrumentTypeCatalogItemRsDto[]} */
window.INSTRUMENT_TYPE_CATALOG = [
  { code: 'SHARES', name: 'Акции / Доли', canAttachToFi: true, fiType: 'SHARES', detailsKind: 'SIGNED_PURCHASE',
    canAddTranches: false, hasPage: true, menuActions: ['REPAY', 'MOVE', 'DELETE'] },
  { code: 'PUT_REPO', name: 'Пут: РЕПО', canAttachToFi: true, fiType: 'REPO', detailsKind: 'SIGNED_STRIKE',
    canAddTranches: false, hasPage: true, menuActions: ['REPAY', 'MOVE', 'DELETE'] },
  { code: 'CALL_REPO', name: 'Колл: РЕПО', canAttachToFi: true, fiType: 'REPO', detailsKind: 'SIGNED_STRIKE',
    canAddTranches: false, hasPage: true, menuActions: ['REPAY', 'MOVE', 'DELETE'] },
  /* в составе какого продукта — не решено (30.09.2026, вопрос 37) */
  { code: 'RECEIVABLES', name: 'Дебиторская задолженность', canAttachToFi: true, fiType: 'RECEIVABLES',
    detailsKind: 'SIGNED_PURCHASE', canAddTranches: false, hasPage: true, menuActions: ['REPAY', 'MOVE', 'DELETE'] },
  /* второй строки нет, ⊕ «Добавить транш» — только здесь (ответы 6, 12) */
  { code: 'LOAN_NCL', name: 'Договор займа (НКЛ)', canAttachToFi: false, fiType: null, detailsKind: 'NONE',
    canAddTranches: true, hasPage: true, menuActions: ['REPAY', 'MOVE', 'DELETE'] },
  { code: 'NCL_PJSC_BALANCE', name: 'НКЛ с баланса ПАО', canAttachToFi: false, fiType: null, detailsKind: 'DID_PERIOD',
    canAddTranches: false, hasPage: true, menuActions: ['REPAY', 'MOVE', 'DELETE'] },
  { code: 'CORPORATE_AGREEMENT', name: 'Корп. договор', canAttachToFi: false, fiType: null, detailsKind: 'NONE',
    canAddTranches: false, hasPage: false, menuActions: ['REPAY', 'MOVE', 'DELETE'] },
  { code: 'INTRAGROUP_LOAN_NCL', name: 'Внутригрупповой кредит (НКЛ)', canAttachToFi: false, fiType: null,
    detailsKind: 'NONE', canAddTranches: false, hasPage: false, menuActions: ['REPAY', 'MOVE', 'DELETE'] }
];

/**
 * Правила узлов, у которых нет справочника: продукт ДИД, продукт, транш.
 * Source: invented (29.09.2026) — по описанию строки на макете ProductRow и
 * ответам человека 30.09.2026.
 * @type {{did: {menuActions: ProductMenuAction[]}, product: {menuActions: ProductMenuAction[]},
 *         tranche: {name: string, canAttachToFi: boolean, fiType: FinInstrumentTypeCode,
 *                   detailsKind: ProductDetailsKind, hasPage: boolean, menuActions: ProductMenuAction[]}}}
 */
window.PRODUCT_TREE_RULES = {
  did: { menuActions: ['DELETE'] },
  /* «Удалить» недоступно, если продукт обязательный и единственный в продукте ДИД */
  product: { menuActions: ['DELETE'] },
  /* Транш входит только в договор займа (НКЛ), перенести его нельзя; своя
     страница у него будет (ответ 4) */
  tranche: { name: 'Транш', canAttachToFi: true, fiType: 'LOAN', detailsKind: 'SIGNED_LIMIT',
    hasPage: true, menuActions: ['REPAY', 'DELETE'] }
};

/** Подписи ProductMenuAction. @type {Record<ProductMenuAction, string>} */
window.PRODUCT_MENU_ACTION_LABELS = {
  REPAY: 'Погасить',
  UNDO_REPAY: 'Отменить погашение',
  MOVE: 'Перенести',
  DELETE: 'Удалить'
};

/** Подписи значений второй строки и строки статуса — для aria-label и тултипов
    (ответ человека 30.09.2026, 22; тултип с подписью — допущение 29.09.2026). */
window.PRODUCT_DETAIL_LABELS = {
  signedAt: 'Дата подписания договора',
  purchaseCost: 'Стоимость покупки',
  strikePrice: 'Цена исполнения',
  limitAmount: 'Сумма лимита',
  didEntryAt: 'Дата входа ДИД',
  didExitAt: 'Дата выхода ДИД',
  repaidAt: 'Фактическая дата погашения'
};

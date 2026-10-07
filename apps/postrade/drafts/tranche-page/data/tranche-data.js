/* =========================================================================
   Транш — демо-данные страницы транша (window.MOCK_TRANCHE).

   Обычный <script> (file://, без fetch). Подключается до экранного скрипта:
   <script src="../data/tranche-data.js"></script>.
   Значения — рыба по макету дизайнера 07.10.2026, правятся по ходу дизайна.
   ========================================================================= */

/**
 * Договор и дополнительные соглашения транша.
 * Source: invented (07.10.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} TrancheContractRsDto
 * @property {string} contractNumber         номер договора
 * @property {string} contractSignDate       дата подписания договора (ISO)
 * @property {string} plannedRepaymentDate   плановая дата погашения (ISO)
 * @property {string} lastAmendmentNumber    номер последнего ДС
 * @property {string} lastAmendmentSignDate  дата подписания последнего ДС (ISO)
 */

/**
 * Связь транша с фондирующим траншем.
 * Source: invented (07.10.2026).
 * @typedef {Object} TrancheFundingLinkRsDto
 * @property {string} fundingTrancheName  номер и наименование фондирующего транша
 * @property {string} fundingDate         дата фондирования (ISO)
 * @property {number} fundingAmount       сумма фондирования
 * @property {string} currencyCode        код валюты ISO 4217
 */

/**
 * Транш (страница транша).
 * Source: invented (07.10.2026).
 * @typedef {Object} TrancheRsDto
 * @property {string} trancheNumber               номер транша в дереве («1.1.1.1.»)
 * @property {string} productCode                 код продукта («НКЛ»)
 * @property {string} dealName                    номер и название сделки для крошек
 * @property {string} parentContractName          родительский договор для крошек
 * @property {string} counterpartyName            контрагент
 * @property {string} balanceCode                 баланс
 * @property {string} currencyCode                валюта транша, ISO 4217
 * @property {number} totalLimitAmount            общая сумма лимита
 * @property {TrancheContractRsDto} contract      договор и ДС
 * @property {TrancheFundingLinkRsDto} fundingLink связь с фондированием
 * @property {number} fixedRatePercent            ETC: фиксированная ставка, %
 * @property {string} gfoId                       ГФО ID
 * @property {string} gfoFundingCreditId          ГФО ID фондирующего кредита
 * @property {string} crmProductId                CRM ID продукта
 * @property {number} nextPaymentAmount           ближайший плановый платёж
 * @property {string} nextPaymentCurrencyCode     валюта планового платежа
 * @property {string} nextPaymentDate             дата планового платежа (ISO)
 * @property {boolean} nextPaymentOverdue         платёж просрочен или на контроле
 * @property {number} lastCounterpartyPaymentAmount последний платёж от контрагента
 * @property {string} lastCounterpartyPaymentCurrencyCode валюта платежа
 * @property {string} lastCounterpartyPaymentDate дата платежа (ISO)
 * @property {string} rsbuHardsState              состояние карточки «Харды в РСБУ»: empty | filled | locked
 */

/** @type {TrancheRsDto} */
window.MOCK_TRANCHE = {
  trancheNumber: '1.1.1.1.',
  productCode: 'НКЛ',
  dealName: '348. МКС',
  parentContractName: '1.1.1. Договор займа (НКЛ)',
  counterpartyName: 'СамолетИнвестХолдинг inc',
  balanceCode: 'SBIL',
  currencyCode: 'RUB',
  totalLimitAmount: 123456789.00,
  contract: {
    contractNumber: '1234567890',
    contractSignDate: '2022-09-12',
    plannedRepaymentDate: '2022-09-12',
    lastAmendmentNumber: '3-1234567890',
    lastAmendmentSignDate: '2022-09-12'
  },
  fundingLink: {
    fundingTrancheName: '1.1.1.1. Фондирующий транш',
    fundingDate: '2024-04-22',
    fundingAmount: 800000.00,
    currencyCode: 'RUB'
  },
  fixedRatePercent: 5,
  gfoId: '1234567890',
  gfoFundingCreditId: '1234567890-12-12',
  crmProductId: '1234567890-12-12',
  nextPaymentAmount: 1000000.00,
  nextPaymentCurrencyCode: 'USD',
  nextPaymentDate: '2023-02-22',
  nextPaymentOverdue: true,
  lastCounterpartyPaymentAmount: 1000000.00,
  lastCounterpartyPaymentCurrencyCode: 'RUB',
  lastCounterpartyPaymentDate: '2023-02-22',
  rsbuHardsState: 'empty'
};

/**
 * Период расчёта процентов для РСБУ (строка таблицы «Текущий расчёт» / «Хардовый расчёт»).
 * Source: invented (07.10.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} RsbuHardPeriodRsDto
 * @property {number} periodNumber                   №
 * @property {string} periodStartDate                дата начала периода (ISO)
 * @property {string} periodEndDate                  дата окончания периода (ISO)
 * @property {number} currentInterestOnLoan          текущие проценты, начисленные на объём кредита
 * @property {number} currentInterestOnPik           текущие проценты, начисленные на PIK проценты
 * @property {number} capitalizedInterestOnLoan      капитализируемые проценты на объём кредита
 * @property {number} capitalizedInterestOnPik       капитализируемые проценты на PIK проценты
 * @property {number} deferredInterestAccrued        отложенные проценты начисленные
 * @property {number} repoPaymentsAmount             платежи по сделкам РЕПО
 * @property {string} articleName                    статья
 */

/**
 * Харды в РСБУ транша: расчёт процентов as-is и хардовая (правленая) копия.
 * Source: invented (07.10.2026).
 * @typedef {Object} RsbuHardsRsDto
 * @property {string} currencyCode                   валюта сумм, ISO 4217
 * @property {string} lastCalculatedAt               дата и время последнего расчёта (ISO, без часового пояса)
 * @property {RsbuHardPeriodRsDto[]} currentPeriods  текущий расчёт
 */

/** @type {RsbuHardsRsDto} */
window.MOCK_RSBU_HARDS = {
  currencyCode: 'RUB',
  lastCalculatedAt: '2026-10-06T18:30:00',
  currentPeriods: [
    { periodNumber: 1, periodStartDate: '2024-01-01', periodEndDate: '2024-03-31', currentInterestOnLoan: 1250000.00, currentInterestOnPik: 0.00,       capitalizedInterestOnLoan: 0.00,      capitalizedInterestOnPik: 0.00,     deferredInterestAccrued: 0.00,      repoPaymentsAmount: 0.00,       articleName: 'Проценты по кредитам' },
    { periodNumber: 2, periodStartDate: '2024-04-01', periodEndDate: '2024-06-30', currentInterestOnLoan: 1262500.00, currentInterestOnPik: 18750.00,   capitalizedInterestOnLoan: 312500.00, capitalizedInterestOnPik: 4687.50,  deferredInterestAccrued: 125000.00, repoPaymentsAmount: 95000.00,  articleName: 'Проценты по кредитам' },
    { periodNumber: 3, periodStartDate: '2024-07-01', periodEndDate: '2024-09-30', currentInterestOnLoan: 1275000.00, currentInterestOnPik: 37812.50,  capitalizedInterestOnLoan: 318750.00, capitalizedInterestOnPik: 9453.12,  deferredInterestAccrued: 127500.00, repoPaymentsAmount: 95000.00,  articleName: 'Проценты по кредитам' },
    { periodNumber: 4, periodStartDate: '2024-10-01', periodEndDate: '2024-12-31', currentInterestOnLoan: 1287500.00, currentInterestOnPik: 56718.75,  capitalizedInterestOnLoan: 321875.00, capitalizedInterestOnPik: 14179.69, deferredInterestAccrued: 128750.00, repoPaymentsAmount: 110000.00, articleName: 'Проценты по кредитам' },
    { periodNumber: 5, periodStartDate: '2025-01-01', periodEndDate: '2025-03-31', currentInterestOnLoan: 1300000.00, currentInterestOnPik: 75937.50,  capitalizedInterestOnLoan: 325000.00, capitalizedInterestOnPik: 18984.38, deferredInterestAccrued: 130000.00, repoPaymentsAmount: 110000.00, articleName: 'Проценты по кредитам' },
    { periodNumber: 6, periodStartDate: '2025-04-01', periodEndDate: '2025-06-30', currentInterestOnLoan: 1312500.00, currentInterestOnPik: 95468.75,  capitalizedInterestOnLoan: 328125.00, capitalizedInterestOnPik: 23867.19, deferredInterestAccrued: 131250.00, repoPaymentsAmount: 120000.00, articleName: 'Проценты по кредитам' }
  ]
};

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
 * @property {string} rsbuInterestAdjustmentsState              состояние карточки «Корректировки процентов РСБУ»: locked | none | filled
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
  rsbuInterestAdjustmentsState: 'none'
};

/**
 * Корректировка процентов РСБУ: сумма, которая прибавляется/вычитается начиная с начальной даты.
 * Source: invented (09.10.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} RsbuInterestAdjustmentRsDto
 * @property {string} startDate          начальная дата корректировки — одна из дат процентных платежей (ISO)
 * @property {string} endDate            конечная дата корректировки — любая дата, вводится руками (ISO)
 * @property {number} adjustmentAmount   сумма корректировки в валюте инструмента; может быть отрицательной
 * @property {string} comment            комментарий
 */

/**
 * Корректировки процентов РСБУ транша.
 * Source: invented (09.10.2026).
 * @typedef {Object} RsbuInterestAdjustmentsRsDto
 * @property {string} currencyCode                          валюта сумм, ISO 4217
 * @property {string[]} startDateOptions                    даты для списка «Начальная дата» — даты процентных платежей (ISO); в демо — рыба
 * @property {RsbuInterestAdjustmentRsDto[]} adjustments    внесённые корректировки (демо для состояния filled)
 */

/** @type {RsbuInterestAdjustmentsRsDto} */
window.MOCK_RSBU_ADJUSTMENTS = {
  currencyCode: 'RUB',
  startDateOptions: ['2025-01-31', '2025-02-28', '2025-03-31', '2025-04-30', '2025-05-31', '2025-06-30', '2025-07-31', '2025-08-31', '2025-09-30'],
  adjustments: [
    { startDate: '2025-03-31', endDate: '2025-04-10', adjustmentAmount: 150000.00, comment: 'Корректировка по просьбе контрагента' },
    { startDate: '2025-06-30', endDate: '2025-07-15', adjustmentAmount: -42500.50, comment: 'Корректировка после сверки с бухгалтерией' },
    { startDate: '2025-09-30', endDate: '2025-10-03', adjustmentAmount: 98000.00,  comment: '' }
  ]
};

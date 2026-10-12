/* =========================================================================
   Досрочные проценты — демо-данные страницы «Досрочные проценты» и карточки
   на странице транша (window.MOCK_EARLY_INTEREST_PAYMENTS и карты подписей).

   Обычный <script> (file://, без fetch). Подключается до экранного скрипта:
   <script src="../data/early-interest-data.js"></script>.
   Значения — рыба по бизнес-требованию RE0017 (12.10.2026), правятся по ходу дизайна.
   ========================================================================= */

/**
 * Досрочный платёж процентов — строка таблицы «Досрочные проценты».
 * Source: invented (12.10.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} EarlyInterestPaymentRsDto
 * @property {string} id               идентификатор платежа
 * @property {string} paymentDate      дата платежа (ISO) — одна из дат погашения процентов в «Плановых платежах»; с неё сумма начинает гасить задолженность в порядке погашения
 * @property {number} paymentAmount    сумма платежа в валюте инструмента, больше нуля
 * @property {string} paymentTypeCode  тип платежа, код EARLY_INTEREST_PAYMENT_TYPE_LABELS; всегда EARLY_INTEREST_REPAYMENT
 * @property {string} comment          комментарий, ручной ввод; может быть пустым
 */

/**
 * Порядок погашения процентной задолженности — один на инструмент.
 * Source: invented (12.10.2026).
 * @typedef {Object} InterestRepaymentOrderRsDto
 * @property {string[]} debtTypeCodes  все типы задолженности, коды INTEREST_DEBT_TYPE_LABELS; первый — приоритет 1 (гасится первым)
 */

/**
 * Досрочные проценты инструмента.
 * Source: invented (12.10.2026).
 * @typedef {Object} EarlyInterestPaymentsRsDto
 * @property {string} currencyCode                       валюта инструмента, ISO 4217
 * @property {string[]} plannedInterestPaymentDates      даты платежей по погашению всех видов процентов из «Плановых платежей» (ISO) — список «Дата платежа»
 * @property {EarlyInterestPaymentRsDto[]} payments      внесённые досрочные платежи (демо для состояния filled)
 * @property {InterestRepaymentOrderRsDto} repaymentOrder порядок погашения
 */

/**
 * Типы процентной задолженности для порядка погашения.
 * Первые три — из примера бизнес-требования; полного списка нет — «Тип 4» и «Тип 5» заглушки
 * (решение человека 12.10.2026: список не важен, можно заглушками).
 * @type {Object<string, string>}
 */
window.INTEREST_DEBT_TYPE_LABELS = {
  CAPITALIZED: 'Капитализированная задолженность',
  DEFERRED: 'Отложенная задолженность',
  CAPITALIZED_DEFERRED: 'Капитализированная отложенная задолженность',
  DEBT_TYPE_4: 'Тип 4',
  DEBT_TYPE_5: 'Тип 5'
};

/** Подписи типов платежа. @type {Object<string, string>} */
window.EARLY_INTEREST_PAYMENT_TYPE_LABELS = {
  EARLY_INTEREST_REPAYMENT: 'Погашение процентов (досрочное)'
};

/** @type {EarlyInterestPaymentsRsDto} */
window.MOCK_EARLY_INTEREST_PAYMENTS = {
  currencyCode: 'RUB',
  plannedInterestPaymentDates: [
    '2025-01-31', '2025-02-28', '2025-03-31', '2025-04-30', '2025-05-31', '2025-06-30',
    '2025-07-31', '2025-08-31', '2025-09-30', '2025-10-31', '2025-11-30', '2025-12-31'
  ],
  payments: [
    { id: 'eip-1', paymentDate: '2025-01-31', paymentAmount: 120000.00, paymentTypeCode: 'EARLY_INTEREST_REPAYMENT', comment: 'Досрочное погашение по письму контрагента от 27.01.2025' },
    { id: 'eip-2', paymentDate: '2025-03-31', paymentAmount: 250000.00, paymentTypeCode: 'EARLY_INTEREST_REPAYMENT', comment: 'Досрочное погашение по письму контрагента от 25.03.2025' },
    { id: 'eip-3', paymentDate: '2025-06-30', paymentAmount: 180500.50, paymentTypeCode: 'EARLY_INTEREST_REPAYMENT', comment: 'Частичное погашение капитализированных процентов' },
    { id: 'eip-4', paymentDate: '2025-06-30', paymentAmount: 75000.00,  paymentTypeCode: 'EARLY_INTEREST_REPAYMENT', comment: '' },
    { id: 'eip-5', paymentDate: '2025-08-31', paymentAmount: 310000.00, paymentTypeCode: 'EARLY_INTEREST_REPAYMENT', comment: 'Погашение отложенных процентов по графику реструктуризации' },
    { id: 'eip-6', paymentDate: '2025-09-30', paymentAmount: 64250.75,  paymentTypeCode: 'EARLY_INTEREST_REPAYMENT', comment: 'Остаток по капитализированной отложенной задолженности' }
  ],
  repaymentOrder: {
    debtTypeCodes: ['CAPITALIZED', 'DEFERRED', 'CAPITALIZED_DEFERRED', 'DEBT_TYPE_4', 'DEBT_TYPE_5']
  }
};

/* =========================================================================
   Реестр расчетов FV — демо-данные (window.MOCK_FV_CALCULATIONS).

   Обычный <script> (file://). Подключается после fv-dictionaries.js:
   <script src="../data/fv-calculations.js"></script>.
   Имена — в стиле API; перечисления — кодами (подписи — в fv-dictionaries.js),
   суммы — числами, валюта — кодом, даты — ISO. Значения — рыба.
   ========================================================================= */

/**
 * Расчет FV в реестре.
 * Source: invented (08.10.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} FvCalculationRsDto
 * @property {number} calculationId            номер расчета (колонка «№»)
 * @property {string} formedDate               дата формирования
 * @property {string} calculationDate          дата, на которую считается FV
 * @property {number|null} totalFvAmount       сумма FV; только у CALCULATED и APPROVED
 * @property {string} currencyCode             валюта суммы (код ISO 4217)
 * @property {import('./fv-dictionaries.js').FvCalculationStatusCode} statusCode статус расчета
 */

/** @type {FvCalculationRsDto[]} */
window.MOCK_FV_CALCULATIONS = [
  { calculationId: 17, formedDate: '2026-10-01', calculationDate: '2026-09-30', totalFvAmount: null,          currencyCode: 'RUB', statusCode: 'FORMING' },
  { calculationId: 16, formedDate: '2026-09-02', calculationDate: '2026-08-31', totalFvAmount: null,          currencyCode: 'RUB', statusCode: 'FORMED' },
  { calculationId: 15, formedDate: '2026-08-03', calculationDate: '2026-07-31', totalFvAmount: null,          currencyCode: 'RUB', statusCode: 'SENT_TO_LP' },
  { calculationId: 14, formedDate: '2026-07-02', calculationDate: '2026-06-30', totalFvAmount: null,          currencyCode: 'RUB', statusCode: 'CALCULATING_LP' },
  { calculationId: 13, formedDate: '2026-06-02', calculationDate: '2026-05-31', totalFvAmount: 3900500000.00, currencyCode: 'RUB', statusCode: 'CALCULATED' },
  { calculationId: 12, formedDate: '2026-05-04', calculationDate: '2026-04-30', totalFvAmount: 3900500000.00, currencyCode: 'RUB', statusCode: 'APPROVED' },
  { calculationId: 11, formedDate: '2026-04-02', calculationDate: '2026-03-31', totalFvAmount: null,          currencyCode: 'RUB', statusCode: 'ERROR' }
];

/**
 * Строка предпросмотра загрузки «Данные FV» (до 100 первых строк).
 * Source: invented (08.10.2026).
 * @typedef {Object} ReservesFvPreviewRsDto
 * @property {number} rowNumber       порядковый номер строки файла
 * @property {string} date            дата
 * @property {string} instrumentName  финансовый инструмент
 * @property {number} fvAmount        FV, RUB
 */

/**
 * Строка предпросмотра «Данные FV» с компонентами.
 * Source: invented (08.10.2026).
 * @typedef {Object} ReservesFvComponentsPreviewRsDto
 * @property {number} rowNumber               порядковый номер строки файла
 * @property {string} date                    дата
 * @property {string} instrumentName          инструмент
 * @property {number} curveShiftFvAmount      изм. FV, объясненное сдвигом % кривых
 * @property {number} creditCurveShiftFvAmount изм. FV, объясненное сдвигом кредитных кривых
 * @property {number} ratingLgdShiftFvAmount  изм. FV, объясненное изм. рейтингов/LGD/ставки резерва
 * @property {number} currencyFvAmount        изм. FV, объясненное изм. валюты
 * @property {number} unexplainedFvAmount     изм. FV, необъясненная составляющая
 */

/** @type {ReservesFvPreviewRsDto[]} */
window.MOCK_FV_UPLOAD_PREVIEW = [
  { rowNumber: 1, date: '2026-01-01', instrumentName: '1.2.1 Кредитный мезонин', fvAmount: 30000000000.00 },
  { rowNumber: 2, date: '2026-01-01', instrumentName: '1.2.2 Кредитный мезонин', fvAmount: 28500000000.00 },
  { rowNumber: 3, date: '2026-01-01', instrumentName: '1.3.1 Синдицированный кредит', fvAmount: 12400000000.00 },
  { rowNumber: 4, date: '2026-01-01', instrumentName: '1.3.2 Синдицированный кредит', fvAmount: 9800000000.00 },
  { rowNumber: 5, date: '2026-01-01', instrumentName: '2.1.1 Кредитная линия', fvAmount: 7650000000.00 },
  { rowNumber: 6, date: '2026-01-01', instrumentName: '2.1.2 Кредитная линия', fvAmount: 5100000000.00 },
  { rowNumber: 7, date: '2026-01-01', instrumentName: '2.2.1 Акции', fvAmount: 2300000000.00 },
  { rowNumber: 8, date: '2026-01-01', instrumentName: '2.2.2 Акции', fvAmount: 1950000000.00 }
];

/** @type {ReservesFvComponentsPreviewRsDto[]} */
window.MOCK_FV_COMPONENTS_UPLOAD_PREVIEW = [
  { rowNumber: 1, date: '2026-01-01', instrumentName: '1.2.1 Кредитный мезонин',        curveShiftFvAmount: 900800900.00, creditCurveShiftFvAmount: 900800900.00, ratingLgdShiftFvAmount: 900800900.00, currencyFvAmount: 900800900.00, unexplainedFvAmount: 900800900.00 },
  { rowNumber: 2, date: '2026-01-01', instrumentName: '1.2.2 Кредитный мезонин',        curveShiftFvAmount: 640100250.00, creditCurveShiftFvAmount: 512300700.00, ratingLgdShiftFvAmount: 221000400.00, currencyFvAmount: 98000000.00,  unexplainedFvAmount: 41500000.00 },
  { rowNumber: 3, date: '2026-01-01', instrumentName: '1.3.1 Синдицированный кредит',   curveShiftFvAmount: 410000000.00, creditCurveShiftFvAmount: 305500000.00, ratingLgdShiftFvAmount: 120400000.00, currencyFvAmount: 0.00,         unexplainedFvAmount: 18200000.00 },
  { rowNumber: 4, date: '2026-01-01', instrumentName: '1.3.2 Синдицированный кредит',   curveShiftFvAmount: 380250000.00, creditCurveShiftFvAmount: 270900000.00, ratingLgdShiftFvAmount: 99800000.00,  currencyFvAmount: 0.00,         unexplainedFvAmount: 12700000.00 },
  { rowNumber: 5, date: '2026-01-01', instrumentName: '2.1.1 Кредитная линия',       curveShiftFvAmount: 215000000.00, creditCurveShiftFvAmount: 130000000.00, ratingLgdShiftFvAmount: 54000000.00,  currencyFvAmount: 31000000.00,  unexplainedFvAmount: 9100000.00 },
  { rowNumber: 6, date: '2026-01-01', instrumentName: '2.1.2 Кредитная линия',       curveShiftFvAmount: 180400000.00, creditCurveShiftFvAmount: 110200000.00, ratingLgdShiftFvAmount: 47500000.00,  currencyFvAmount: 25000000.00,  unexplainedFvAmount: 7300000.00 }
];

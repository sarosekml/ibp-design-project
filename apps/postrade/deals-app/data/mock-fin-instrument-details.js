/* =========================================================================
   Страница финансового инструмента — демо-данные прототипа
   (window.MOCK_FIN_INSTRUMENT_DETAILS).

   Обычный <script>, а не JSON: страницы открываются по file://, где fetch не
   работает. Подключается до экранного скрипта FinInstrument.html:
   <script src="../data/mock-fin-instrument-details.js"></script>.

   Здесь только то, чего нет в карточке ФИ сделки (mock-fin-instruments.js):
   идентификаторы договоров и связанных объектов блока «ID ФИ» и состав
   подразделов «Корректировки KPI», «Дефолтные сделки», «Счета для 1С».
   Остальное — наименование, баланс, контрагенты, признаки, коды RWA — страница
   берёт из FinInstrumentsStore.

   Значения — рыба: правятся по ходу дизайна; имена и типы держатся.
   ========================================================================= */

/**
 * Идентификаторы финансового инструмента (блок «ID ФИ»).
 * Source: invented (09.10.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} FinInstrumentIdsRsDto
 * @property {string|null} contract1cNumber              № договора 1С
 * @property {string|null} contract1cSharesNumber        № договора 1С для акций
 * @property {string|null} contract1cReservesNumber      № договора 1С для резервов
 * @property {string|null} contract1cUhNumber            № договора 1С:УХ
 * @property {string|null} contract1cUhSharesNumber      № договора 1С:УХ для акций
 * @property {string|null} contract1cUhReservesNumber    № договора 1С:УХ для резервов
 * @property {string|null} linkedLetterOfCreditId        ID связанного аккредитива
 * @property {string|null} linkedEscrowAccountId         ID связанного счета эскроу
 * @property {string|null} linkedDerivativeMurexId       Murex ID связанного ПФИ
 */

/**
 * Состояние подраздела страницы ФИ, который открывается отдельным экраном.
 * Source: invented (09.10.2026).
 * @typedef {Object} FinInstrumentSectionRsDto
 * @property {string} code        KPI_ADJUSTMENTS | DEFAULT_DEALS | ACCOUNTS_1C
 * @property {boolean} isFilled   есть ли данные — тайл показывает «Заполнено» или «Не заполнено»
 */

/**
 * Дополнительные данные ФИ.
 * Source: invented (09.10.2026).
 * @typedef {Object} FinInstrumentDetailsRsDto
 * @property {string} fiId                           id карточки ФИ сделки (FI-<сделка>-<номер>)
 * @property {FinInstrumentIdsRsDto} ids             блок «ID ФИ»
 * @property {FinInstrumentSectionRsDto[]} sections  подразделы
 */

window.MOCK_FIN_INSTRUMENT_DETAILS = {
  /* Подставляется, когда у карточки нет своей записи: демо-значения макета. */
  defaults: {
    ids: {
      contract1cNumber: '00-456789',
      contract1cSharesNumber: '00-456789',
      contract1cReservesNumber: '00-456789',
      contract1cUhNumber: '00-456789',
      contract1cUhSharesNumber: '00-456789',
      contract1cUhReservesNumber: '00-456789',
      linkedLetterOfCreditId: '00-456789',
      linkedEscrowAccountId: '00-456789',
      linkedDerivativeMurexId: '00-456789'
    },
    sections: [
      { code: 'KPI_ADJUSTMENTS', isFilled: true },
      { code: 'DEFAULT_DEALS', isFilled: true },
      { code: 'ACCOUNTS_1C', isFilled: true }
    ]
  },
  byFiId: {}
};

/* Подписи подразделов — карта кодов, как у остальных перечислений. */
window.FIN_INSTRUMENT_SECTION_LABELS = {
  KPI_ADJUSTMENTS: 'Корректировки KPI',
  DEFAULT_DEALS: 'Дефолтные сделки',
  ACCOUNTS_1C: 'Счета для 1С'
};

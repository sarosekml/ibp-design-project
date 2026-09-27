/* =========================================================================
   Финансовые метрики сделок — демо-данные (window.MOCK_DEAL_FIN_METRICS).

   Обычный <script>, а не JSON: страницы открываются по file://, где fetch не
   работает. Читают тайл «Финансовые метрики сделки»
   (widgets/tiles/DealFinancialMetricsTile) и его окно
   (widgets/modals/DealFinancialMetricsModal); связывает их страница сделки.

   Откуда значения. Метрики сделки складываются из её финансовых
   инструментов: суммы ВБС и ОСЗ по продуктам и частям долга, резервы и
   переоценка — по ФИ. В прототипе это демо-данные, с деревом ФИ сделки
   (mock-deal-trees.js) они не связаны. Привязать тайл к бэкенду и к
   мок-данным ФИ — следующий шаг (решение человека 25.09.2026).

   Ключ — id сделки. Записи нет — сделка без метрик, тайл «Нет данных».
   Имена типов и полей — в стиле API, коды — UPPER_SNAKE с картами подписей
   ниже. Суммы — числа в валюте currencyCode, ставки — проценты числом (62 —
   это 62%), даты — ISO-строки, форматируются при выводе. Цвета позиций бара —
   не данные: их держит тайл (доменный маппинг из спеки AllocationBar).

   Демо по сделкам (решение человека 25.09.2026 — состояния с макетов
   apps/postrade/deals-app/refs/финансовые метрики/):
     1024 — без PE: три продукта, ОСЗ с просрочкой (иконка-предупреждение);
     1025 — с PE: ОСЗ ещё рассчитывается — первый вариант окна на макете;
     1032 — с PE: пять продуктов, ОСЗ без просрочки;
     1027 — ВБС рассчитывается (плашка «Данные рассчитываются»);
     1028 — запрос метрик не выполнен (MOCK_DEAL_FIN_METRICS_FAILED);
     1029 — один продукт, 100%;
     1033 — два продукта;
     1034 — семь продуктов: больше пяти, в баре «Показать ещё 2».
   Остальные сделки записей не имеют — «Нет данных». PE бывает только у
   сделок с isPE: true в mock-deals.js (1025, 1032).

   Значения — рыба, но сведены между собой: сумма резерва — сумма по ФИ,
   ставки сводки — средние по ФИ, Δ переоценки по PE — сумма Δ по ФИ.
   Итога бара в данных нет: над баром стоит сумма значений его строк, её
   считает тайл (решение человека 25.09.2026).
   ========================================================================= */

/**
 * Финансовые метрики сделки.
 * Source: invented (25.09.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} DealFinancialMetricsRsDto
 * @property {number} dealId
 * @property {string} currencyCode                 валюта всех сумм (ISO 4217)
 * @property {AllocationRsDto} vbs                 ВБС в разрезе продуктов
 * @property {AllocationRsDto} [osz]               ОСЗ в разрезе составляющих
 * @property {DealReservesRsDto} [reserves]        резервы, обесценение, RWA
 * @property {PeRevaluationRsDto} [peRevaluation]  переоценка по PE — только у сделок с PE
 */

/**
 * Разбивка суммы по составляющим — ВБС по продуктам или ОСЗ по частям долга.
 * Итога нет: итог над баром — сумма amount позиций, её считает тайл.
 * Source: invented (25.09.2026).
 * @typedef {Object} AllocationRsDto
 * @property {CalcStatusCode} calcStatus
 * @property {string} reportDate        дата, на которую посчитана сумма
 * @property {number} [overdueAmount]   только ОСЗ: просроченная задолженность, 0 — нет
 * @property {AllocationItemRsDto[]} items
 */

/**
 * Позиция разбивки. Код — VbsProductCode у ВБС, OszPartCode у ОСЗ.
 * Source: invented (25.09.2026).
 * @typedef {Object} AllocationItemRsDto
 * @property {string} code
 * @property {number} amount
 */

/**
 * Состояние расчёта суммы: READY — посчитана, CALCULATING — ещё считается.
 * Source: invented (25.09.2026).
 * @typedef {'READY'|'CALCULATING'} CalcStatusCode
 */

/**
 * Продукт в разбивке ВБС. Состав и порядок — с макета «Привязанные к легенде
 * цветовые стили».
 * Source: invented (25.09.2026).
 * @typedef {'LOAN'|'LOAN_LIABILITY'|'INTRA_GROUP_LOAN'|'REPO'|'SHARES'|'BONDS'|'CORPORATE_CONTROL'|'ADD_INCOME'|'COMMISSION'|'ACCOUNTS_RECEIVABLE'} VbsProductCode
 */

/**
 * Часть долга в разбивке ОСЗ.
 * Source: invented (25.09.2026).
 * @typedef {'PRINCIPAL'|'INTEREST'|'COMMISSIONS'} OszPartCode
 */

/**
 * Резервы по сделке: сводка и строки по финансовым инструментам.
 * Source: invented (25.09.2026).
 * @typedef {Object} DealReservesRsDto
 * @property {string} reportDate        «Резервы на …»
 * @property {number} reserveAmount     сумма резерва — сумма по кредитным ФИ
 * @property {number} reserveRate       ставка резерва, % — среднее по кредитным ФИ
 * @property {number} impairmentRate    ставка обесценения, %
 * @property {number} rwa               RWA, % — среднее по всем ФИ
 * @property {string} calcDate          дата расчёта
 * @property {ReserveByInstrumentRsDto[]} instruments
 */

/**
 * Source: invented (25.09.2026).
 * @typedef {Object} ReserveByInstrumentRsDto
 * @property {string} financialInstrumentId
 * @property {string} financialInstrumentTitle
 * @property {number} reserveAmount
 * @property {number} reserveRate
 * @property {number} impairmentRate
 * @property {number} rwa
 */

/**
 * Переоценка по Private Equity.
 * Source: invented (25.09.2026).
 * @typedef {Object} PeRevaluationRsDto
 * @property {number} revaluationAmount   сумма переоценки по PE
 * @property {number} revaluationDelta    Δ переоценки — сумма Δ по ФИ
 * @property {string} lastValuationDate   дата последней оценки; её же показывает тайл («на …»)
 * @property {string} nextValuationDate   дата ближайшей оценки
 * @property {PeRevaluationByInstrumentRsDto[]} instruments
 */

/**
 * Source: invented (25.09.2026).
 * @typedef {Object} PeRevaluationByInstrumentRsDto
 * @property {string} financialInstrumentId
 * @property {string} financialInstrumentTitle
 * @property {string} valuationDate
 * @property {PeriodicityCode} periodicityCode
 * @property {number} valuationAmount     оценка на дату
 * @property {number} revaluationDelta    Δ переоценки
 * @property {ValuerCode} valuerCode      кем определена оценка
 */

/** Source: invented (25.09.2026). @typedef {'MONTHLY'|'QUARTERLY'|'ANNUALLY'} PeriodicityCode */
/** Source: invented (25.09.2026). @typedef {'INDEPENDENT_VALUER'|'INTERNAL'} ValuerCode */

(function () {
  'use strict';

  /* Резервы — один шаблон на все демо-сделки, отличается только префикс ФИ:
     четыре кредитных ФИ, сумма 217 000 000 (62% от 350 000 000 кредита),
     обесценение в среднем 13%, RWA — 150%. */
  function reserves(dealId) {
    var rows = [
      [120000000, 62, 10, 150],
      [55000000, 62, 12, 150],
      [30000000, 62, 14, 140],
      [12000000, 62, 16, 160]
    ];
    return {
      reportDate: '2026-02-25',
      reserveAmount: 217000000,
      reserveRate: 62,
      impairmentRate: 13,
      rwa: 150,
      calcDate: '2026-02-25',
      instruments: rows.map(function (r, i) {
        var n = '0' + (i + 1);
        return {
          financialInstrumentId: dealId + '-LOAN-' + n,
          financialInstrumentTitle: dealId + '-Кредит-' + n,
          reserveAmount: r[0],
          reserveRate: r[1],
          impairmentRate: r[2],
          rwa: r[3]
        };
      })
    };
  }

  /* Переоценка по PE: Δ по ФИ в сумме дают Δ сводки (234 567,89). */
  function pe(dealId, deltas) {
    return {
      revaluationAmount: 1234567.89,
      revaluationDelta: deltas.reduce(function (a, b) { return Math.round((a + b) * 100) / 100; }, 0),
      lastValuationDate: '2025-12-21',
      nextValuationDate: '2026-12-21',
      instruments: deltas.map(function (d, i) {
        var n = '0' + (i + 1);
        return {
          financialInstrumentId: dealId + '-SHARES-' + n,
          financialInstrumentTitle: dealId + '-Акции-' + n,
          valuationDate: '2025-12-21',
          periodicityCode: i === deltas.length - 1 && deltas.length > 2 ? 'QUARTERLY' : 'MONTHLY',
          valuationAmount: 123456789 + i * 1000000,
          revaluationDelta: d,
          valuerCode: 'INDEPENDENT_VALUER'
        };
      })
    };
  }

  function vbs(items, status) {
    return {
      calcStatus: status || 'READY',
      reportDate: '2026-02-25',
      items: items.map(function (it) { return { code: it[0], amount: it[1] }; })
    };
  }

  function osz(overdue, status) {
    var items = [['PRINCIPAL', 550000000], ['INTEREST', 400000000], ['COMMISSIONS', 50000000]];
    return {
      calcStatus: status || 'READY',
      reportDate: '2026-03-12',
      overdueAmount: overdue || 0,
      items: items.map(function (it) { return { code: it[0], amount: it[1] }; })
    };
  }

  var THREE = [['LOAN', 350000000], ['SHARES', 350000000], ['REPO', 300000000]];

  /** @type {Record<string, DealFinancialMetricsRsDto>} */
  window.MOCK_DEAL_FIN_METRICS = {
    '1024': { dealId: 1024, currencyCode: 'RUB', vbs: vbs(THREE), osz: osz(123000000), reserves: reserves(1024) },
    '1025': {
      dealId: 1025, currencyCode: 'RUB', vbs: vbs(THREE), osz: osz(0, 'CALCULATING'), reserves: reserves(1025),
      peRevaluation: pe(1025, [56789, 60000, 58889.45, 58889.44])
    },
    '1032': {
      dealId: 1032, currencyCode: 'RUB',
      vbs: vbs([['LOAN', 350000000], ['SHARES', 350000000], ['REPO', 100000000], ['CORPORATE_CONTROL', 100000000], ['COMMISSION', 100000000]]),
      osz: osz(0), reserves: reserves(1032),
      peRevaluation: pe(1032, [134567.89, 100000])
    },
    '1027': { dealId: 1027, currencyCode: 'RUB', vbs: vbs(THREE, 'CALCULATING'), osz: osz(0, 'CALCULATING'), reserves: reserves(1027) },
    '1029': { dealId: 1029, currencyCode: 'RUB', vbs: vbs([['LOAN', 1000000000]]), osz: osz(0), reserves: reserves(1029) },
    '1033': { dealId: 1033, currencyCode: 'RUB', vbs: vbs([['LOAN', 600000000], ['SHARES', 400000000]]), osz: osz(0), reserves: reserves(1033) },
    '1034': {
      dealId: 1034, currencyCode: 'RUB',
      vbs: vbs([['LOAN', 300000000], ['LOAN_LIABILITY', 150000000], ['INTRA_GROUP_LOAN', 120000000], ['REPO', 110000000],
        ['SHARES', 100000000], ['BONDS', 120000000], ['ACCOUNTS_RECEIVABLE', 100000000]]),
      osz: osz(0), reserves: reserves(1034)
    }
  };

  /** Сделки, у которых запрос метрик не выполнен — демо состояния «Ошибка». @type {number[]} */
  window.MOCK_DEAL_FIN_METRICS_FAILED = [1028];

  /** Подписи кодов для интерфейса. */
  window.DEAL_FIN_METRICS_LABELS = {
    /** @type {Record<VbsProductCode, string>} */
    vbs: {
      LOAN: 'Кредит',
      LOAN_LIABILITY: 'Фондирующий кредит',
      INTRA_GROUP_LOAN: 'Внутригрупповой кредит',
      REPO: 'РЕПО',
      SHARES: 'Акции',
      BONDS: 'Облигации',
      CORPORATE_CONTROL: 'Корп. контроль',
      ADD_INCOME: 'Доп. доходность',
      COMMISSION: 'Комиссия',
      ACCOUNTS_RECEIVABLE: 'Дебиторская задолженность'
    },
    /** @type {Record<OszPartCode, string>} */
    osz: {
      PRINCIPAL: 'Основной долг',
      INTEREST: 'Проценты',
      COMMISSIONS: 'Комиссии'
    },
    /** @type {Record<PeriodicityCode, string>} */
    periodicity: {
      MONTHLY: 'Ежемесячно',
      QUARTERLY: 'Ежеквартально',
      ANNUALLY: 'Ежегодно'
    },
    /** @type {Record<ValuerCode, string>} */
    valuer: {
      INDEPENDENT_VALUER: 'Независимый оценщик',
      INTERNAL: 'Внутренняя оценка'
    }
  };
})();

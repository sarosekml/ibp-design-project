/* =========================================================================
   Финансовые метрики сделок — демо-данные (window.MOCK_DEAL_FIN_METRICS).

   Обычный <script>, а не JSON: страницы открываются по file://, где fetch не
   работает. Читают тайл «Финансовые метрики сделки»
   (widgets/tiles/DealFinancialMetricsTile) и его окно
   (widgets/modals/DealFinancialMetricsModal); связывает их страница сделки.

   Откуда значения. Тайл показывает типы ФИ (Кредит, Акции, РЕПО, …), и они
   соответствуют финансовым инструментам сделки: блоки резервов и переоценки
   по PE собраны по карточкам ФИ, прикреплённым к узлам дерева продуктов
   (mock-deal-trees.js, fiIds); ВБС — по типам прикреплённых ФИ. Суммы и ОСЗ —
   демо. Значения сведены между собой: сумма резерва — сумма строк по
   кредитным ФИ, Δ переоценки по PE — сумма Δ по ФИ. Итога бара в данных нет:
   над баром стоит сумма значений его строк, её считает тайл.

   Демо-состояния по сделкам:
     1024 — ОСЗ с просрочкой (иконка-предупреждение);
     1025 — ОСЗ «рассчитывается» (calcStatus CALCULATING);
     1028 — запрос метрик не выполнен (MOCK_DEAL_FIN_METRICS_FAILED);
     1034 — больше пяти позиций ВБС: в баре «Показать ещё» (исключение,
            сохранённое с макета, — по ФИ не пересобирается);
     1025, 1032, 1045, 1053, 1060, 1068 — сделки с PE: блок «Переоценка по PE»;
     остальные сделки целевых статусов (Активная, Погашена, Ожидает
     подтверждения) — метрики собраны по прикреплённым ФИ; у сделок без
     дерева (1042, 1066) запись оставлена прежней демонстрационной.

   Ключ — id сделки. Записи нет — тайл «Нет данных».
   ========================================================================= */

(function () {
  'use strict';

  function vbs(items, status) {
    return { calcStatus: status || 'READY', reportDate: '2026-02-25',
      items: items.map(function (it) { return { code: it[0], amount: it[1] }; }) };
  }
  function osz(overdue, status) {
    var items = [['PRINCIPAL', 550000000], ['INTEREST', 400000000], ['COMMISSIONS', 50000000]];
    return { calcStatus: status || 'READY', reportDate: '2026-03-12', overdueAmount: overdue || 0,
      items: items.map(function (it) { return { code: it[0], amount: it[1] }; }) };
  }
  /* rows: [id, title, reserveAmount, reserveRate, impairmentRate, rwa] */
  function reserves(rows) {
    rows = rows || [];
    var instruments = rows.map(function (r) {
      return { financialInstrumentId: r[0], financialInstrumentTitle: r[1],
        reserveAmount: r[2], reserveRate: r[3], impairmentRate: r[4], rwa: r[5] };
    });
    function avg(f) { return instruments.length
      ? Math.round(instruments.reduce(function (s, x) { return s + x[f]; }, 0) / instruments.length * 100) / 100 : 0; }
    return { reportDate: '2026-02-25',
      reserveAmount: instruments.reduce(function (s, x) { return s + x.reserveAmount; }, 0),
      reserveRate: avg('reserveRate'), impairmentRate: avg('impairmentRate'), rwa: avg('rwa'),
      calcDate: '2026-02-25', instruments: instruments };
  }
  /* rows: [id, title, valuationAmount, revaluationDelta, periodicityCode] */
  function pe(rows) {
    rows = rows || [];
    var instruments = rows.map(function (r) {
      return { financialInstrumentId: r[0], financialInstrumentTitle: r[1], valuationDate: '2025-12-21',
        periodicityCode: r[4], valuationAmount: r[2], revaluationDelta: r[3], valuerCode: 'INDEPENDENT_VALUER' };
    });
    return { revaluationAmount: 1234567.89,
      revaluationDelta: Math.round(instruments.reduce(function (s, x) { return s + x.revaluationDelta; }, 0) * 100) / 100,
      lastValuationDate: '2025-12-21', nextValuationDate: '2026-12-21', instruments: instruments };
  }
  window.MOCK_DEAL_FIN_METRICS = {
  "1024": { dealId: 1024, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000]]), osz: osz(123000000), reserves: reserves([["FI-1024-1", "124-Кредит-201", 120000000, 62, 10, 150], ["FI-1024-2", "124-Кредит-202", 55000000, 62, 12, 150]]) },
  "1025": { dealId: 1025, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000]]), osz: osz(0, 'CALCULATING'), reserves: reserves([["FI-1025-1", "125-Кредит-201", 120000000, 62, 10, 150], ["FI-1025-2", "125-Кредит-202", 55000000, 62, 12, 150]]), peRevaluation: pe([["FI-1025-3", "125-Акции-203", 123456789, 234567.89, "MONTHLY"]]) },
  "1027": { dealId: 1027, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000], ["REPO", 300000000]], 'CALCULATING'), osz: osz(0, 'CALCULATING'), reserves: reserves([["1027-LOAN-01", "1027-Кредит-01", 120000000, 62, 10, 150], ["1027-LOAN-02", "1027-Кредит-02", 55000000, 62, 12, 150], ["1027-LOAN-03", "1027-Кредит-03", 30000000, 62, 14, 140], ["1027-LOAN-04", "1027-Кредит-04", 12000000, 62, 16, 160]]) },
  "1029": { dealId: 1029, currencyCode: 'RUB', vbs: vbs([["LOAN", 1000000000]]), osz: osz(0), reserves: reserves([["1029-LOAN-01", "1029-Кредит-01", 120000000, 62, 10, 150], ["1029-LOAN-02", "1029-Кредит-02", 55000000, 62, 12, 150], ["1029-LOAN-03", "1029-Кредит-03", 30000000, 62, 14, 140], ["1029-LOAN-04", "1029-Кредит-04", 12000000, 62, 16, 160]]) },
  "1030": { dealId: 1030, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000]]), osz: osz(0), reserves: reserves([["FI-1030-1", "130-Кредит-201", 120000000, 62, 10, 150]]) },
  "1032": { dealId: 1032, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000], ["REPO", 300000000]]), osz: osz(0), reserves: reserves([["FI-1032-2", "132-Кредит-202", 120000000, 62, 10, 150]]), peRevaluation: pe([["FI-1032-1", "132-Акции-201", 123456789, 234567.89, "MONTHLY"]]) },
  "1033": { dealId: 1033, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000]]), osz: osz(0), reserves: reserves([["FI-1033-1", "133-Кредит-201", 120000000, 62, 10, 150]]) },
  "1034": { dealId: 1034, currencyCode: 'RUB', vbs: vbs([["LOAN", 300000000], ["LOAN_LIABILITY", 150000000], ["INTRA_GROUP_LOAN", 120000000], ["REPO", 110000000], ["SHARES", 100000000], ["BONDS", 120000000], ["ACCOUNTS_RECEIVABLE", 100000000]]), osz: osz(0), reserves: reserves([["FI-1034-1", "134-Кредит-201", 120000000, 62, 10, 150]]) },
  "1036": { dealId: 1036, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000], ["REPO", 300000000]]), osz: osz(85000000), reserves: reserves([["1036-LOAN-01", "1036-Кредит-01", 120000000, 62, 10, 150], ["1036-LOAN-02", "1036-Кредит-02", 55000000, 62, 12, 150], ["1036-LOAN-03", "1036-Кредит-03", 30000000, 62, 14, 140], ["1036-LOAN-04", "1036-Кредит-04", 12000000, 62, 16, 160]]) },
  "1038": { dealId: 1038, currencyCode: 'RUB', vbs: vbs([["LOAN", 1000000000]]), osz: osz(0), reserves: reserves([["1038-LOAN-01", "1038-Кредит-01", 120000000, 62, 10, 150], ["1038-LOAN-02", "1038-Кредит-02", 55000000, 62, 12, 150], ["1038-LOAN-03", "1038-Кредит-03", 30000000, 62, 14, 140], ["1038-LOAN-04", "1038-Кредит-04", 12000000, 62, 16, 160]]) },
  "1039": { dealId: 1039, currencyCode: 'RUB', vbs: vbs([["SHARES", 350000000], ["REPO", 300000000]]), osz: osz(0) },
  "1040": { dealId: 1040, currencyCode: 'RUB', vbs: vbs([["LOAN", 600000000], ["SHARES", 400000000]]), osz: osz(0), reserves: reserves([["1040-LOAN-01", "1040-Кредит-01", 120000000, 62, 10, 150], ["1040-LOAN-02", "1040-Кредит-02", 55000000, 62, 12, 150], ["1040-LOAN-03", "1040-Кредит-03", 30000000, 62, 14, 140], ["1040-LOAN-04", "1040-Кредит-04", 12000000, 62, 16, 160]]) },
  "1041": { dealId: 1041, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000]]), osz: osz(0), reserves: reserves([["FI-1041-2", "141-Кредит-202", 120000000, 62, 10, 150]]) },
  "1042": { dealId: 1042, currencyCode: 'RUB', vbs: vbs([["LOAN", 450000000], ["REPO", 300000000], ["BONDS", 250000000]]), osz: osz(85000000), reserves: reserves([["1042-LOAN-01", "1042-Кредит-01", 120000000, 62, 10, 150], ["1042-LOAN-02", "1042-Кредит-02", 55000000, 62, 12, 150], ["1042-LOAN-03", "1042-Кредит-03", 30000000, 62, 14, 140], ["1042-LOAN-04", "1042-Кредит-04", 12000000, 62, 16, 160]]) },
  "1043": { dealId: 1043, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000], ["REPO", 300000000]]), osz: osz(0), reserves: reserves([["FI-1043-1", "143-Кредит-201", 120000000, 62, 10, 150]]) },
  "1044": { dealId: 1044, currencyCode: 'RUB', vbs: vbs([["LOAN", 400000000], ["SHARES", 250000000], ["REPO", 150000000], ["COMMISSION", 100000000], ["ADD_INCOME", 100000000]]), osz: osz(0), reserves: reserves([["1044-LOAN-01", "1044-Кредит-01", 120000000, 62, 10, 150], ["1044-LOAN-02", "1044-Кредит-02", 55000000, 62, 12, 150], ["1044-LOAN-03", "1044-Кредит-03", 30000000, 62, 14, 140], ["1044-LOAN-04", "1044-Кредит-04", 12000000, 62, 16, 160]]) },
  "1045": { dealId: 1045, currencyCode: 'RUB', vbs: vbs([["SHARES", 350000000]]), osz: osz(0), peRevaluation: pe([["FI-1045-3", "145-Акции-203", 123456789, 234567.89, "MONTHLY"]]) },
  "1046": { dealId: 1046, currencyCode: 'RUB', vbs: vbs([["LOAN_LIABILITY", 500000000], ["INTRA_GROUP_LOAN", 300000000], ["ACCOUNTS_RECEIVABLE", 200000000]]), osz: osz(0), reserves: reserves([["1046-LOAN-01", "1046-Кредит-01", 120000000, 62, 10, 150], ["1046-LOAN-02", "1046-Кредит-02", 55000000, 62, 12, 150], ["1046-LOAN-03", "1046-Кредит-03", 30000000, 62, 14, 140], ["1046-LOAN-04", "1046-Кредит-04", 12000000, 62, 16, 160]]) },
  "1048": { dealId: 1048, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000]]), osz: osz(85000000), reserves: reserves([["FI-1048-1", "148-Кредит-201", 120000000, 62, 10, 150]]) },
  "1049": { dealId: 1049, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000], ["REPO", 300000000]]), osz: osz(0), reserves: reserves([["FI-1049-1", "149-Кредит-201", 120000000, 62, 10, 150], ["FI-1049-2", "149-Кредит-202", 55000000, 62, 12, 150]]) },
  "1050": { dealId: 1050, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000]]), osz: osz(0), reserves: reserves([["FI-1050-1", "150-Кредит-201", 120000000, 62, 10, 150]]) },
  "1052": { dealId: 1052, currencyCode: 'RUB', vbs: vbs([["LOAN", 600000000], ["SHARES", 400000000]]), osz: osz(0), reserves: reserves([["1052-LOAN-01", "1052-Кредит-01", 120000000, 62, 10, 150], ["1052-LOAN-02", "1052-Кредит-02", 55000000, 62, 12, 150], ["1052-LOAN-03", "1052-Кредит-03", 30000000, 62, 14, 140], ["1052-LOAN-04", "1052-Кредит-04", 12000000, 62, 16, 160]]) },
  "1053": { dealId: 1053, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000], ["REPO", 300000000]]), osz: osz(0), reserves: reserves([["FI-1053-1", "153-Кредит-201", 120000000, 62, 10, 150], ["FI-1053-4", "153-Кредит-204", 55000000, 62, 12, 150], ["FI-1053-5", "153-Кредит-205", 30000000, 62, 14, 140]]), peRevaluation: pe([["FI-1053-2", "153-Акции-202", 123456789, 234567.89, "MONTHLY"]]) },
  "1054": { dealId: 1054, currencyCode: 'RUB', vbs: vbs([["SHARES", 350000000], ["REPO", 300000000]]), osz: osz(85000000) },
  "1056": { dealId: 1056, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000]]), osz: osz(0), reserves: reserves([["FI-1056-2", "156-Кредит-202", 120000000, 62, 10, 150]]) },
  "1057": { dealId: 1057, currencyCode: 'RUB', vbs: vbs([["SHARES", 350000000]]), osz: osz(0) },
  "1058": { dealId: 1058, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000], ["REPO", 300000000]]), osz: osz(0), reserves: reserves([["FI-1058-1", "158-Кредит-201", 120000000, 62, 10, 150]]) },
  "1059": { dealId: 1059, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000], ["REPO", 300000000]]), osz: osz(0), reserves: reserves([["FI-1059-3", "159-Кредит-203", 120000000, 62, 10, 150], ["FI-1059-4", "159-Кредит-204", 55000000, 62, 12, 150]]) },
  "1060": { dealId: 1060, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000]]), osz: osz(85000000), reserves: reserves([["FI-1060-1", "160-Кредит-201", 120000000, 62, 10, 150]]), peRevaluation: pe([["FI-1060-3", "160-Акции-203", 123456789, 234567.89, "MONTHLY"]]) },
  "1061": { dealId: 1061, currencyCode: 'RUB', vbs: vbs([["SHARES", 350000000]]), osz: osz(0) },
  "1062": { dealId: 1062, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000], ["REPO", 300000000]]), osz: osz(0), reserves: reserves([["FI-1062-2", "162-Кредит-202", 120000000, 62, 10, 150]]) },
  "1063": { dealId: 1063, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000]]), osz: osz(0), reserves: reserves([["FI-1063-1", "163-Кредит-201", 120000000, 62, 10, 150]]) },
  "1064": { dealId: 1064, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000], ["REPO", 300000000]]), osz: osz(0), reserves: reserves([["FI-1064-1", "164-Кредит-201", 120000000, 62, 10, 150]]) },
  "1065": { dealId: 1065, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000]]), osz: osz(0), reserves: reserves([["FI-1065-1", "165-Кредит-201", 120000000, 62, 10, 150], ["FI-1065-3", "165-Кредит-203", 55000000, 62, 12, 150]]) },
  "1066": { dealId: 1066, currencyCode: 'RUB', vbs: vbs([["LOAN", 450000000], ["REPO", 300000000], ["BONDS", 250000000]]), osz: osz(85000000), reserves: reserves([["1066-LOAN-01", "1066-Кредит-01", 120000000, 62, 10, 150], ["1066-LOAN-02", "1066-Кредит-02", 55000000, 62, 12, 150], ["1066-LOAN-03", "1066-Кредит-03", 30000000, 62, 14, 140], ["1066-LOAN-04", "1066-Кредит-04", 12000000, 62, 16, 160]]) },
  "1067": { dealId: 1067, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000]]), osz: osz(0), reserves: reserves([["FI-1067-1", "167-Кредит-201", 120000000, 62, 10, 150]]) },
  "1068": { dealId: 1068, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000], ["REPO", 300000000]]), osz: osz(0), reserves: reserves([["FI-1068-1", "168-Кредит-201", 120000000, 62, 10, 150], ["FI-1068-4", "168-Кредит-204", 55000000, 62, 12, 150]]), peRevaluation: pe([["FI-1068-2", "168-Акции-202", 123456789, 234567.89, "MONTHLY"]]) },
  "1069": { dealId: 1069, currencyCode: 'RUB', vbs: vbs([["SHARES", 350000000], ["REPO", 300000000]]), osz: osz(0) },
  "1070": { dealId: 1070, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000]]), osz: osz(0), reserves: reserves([["FI-1070-1", "170-Кредит-201", 120000000, 62, 10, 150]]) },
  "1071": { dealId: 1071, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000]]), osz: osz(0), reserves: reserves([["FI-1071-2", "171-Кредит-202", 120000000, 62, 10, 150]]) },
  "1072": { dealId: 1072, currencyCode: 'RUB', vbs: vbs([["SHARES", 350000000]]), osz: osz(85000000) },
  "1073": { dealId: 1073, currencyCode: 'RUB', vbs: vbs([["LOAN", 350000000], ["SHARES", 350000000], ["REPO", 300000000]]), osz: osz(0), reserves: reserves([["FI-1073-1", "173-Кредит-201", 120000000, 62, 10, 150]]) }
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

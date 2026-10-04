/* =========================================================================
   Карточки финансовых инструментов (ФИ) сделок — демо-данные прототипа.
   window.MOCK_DEAL_FIN_INSTRUMENTS (ключ — id сделки) · карты подписей
   FIN_INSTRUMENT_TYPE_LABELS, FIN_INSTRUMENT_REPORTING_LABELS,
   FIN_INSTRUMENT_FV_AC_LABELS.

   Обычный <script> (file://, без fetch), подключается рядом с деревом
   продуктов — до стора дерева и стора ФИ:
   <script src="../data/mock-fin-instruments.js"></script>

   Читает стор ФИ (fin-instruments-store.js): карточки сделки, которую ещё
   не сохраняли, берутся отсюда, сохранённые — из PostApi. Его читают тайл
   «Финансовые инструменты» (FinInstrumentsTile), окна создания и изменения
   ФИ и окно связи с ФИ у дерева продуктов (LinkChangeModal — через стор
   дерева). Без стора ФИ стор дерева берёт карточки отсюда же.

   Здесь только собственные поля карточки — их правит окно изменения ФИ, а
   номер, тип, наименование и тип отчётности задаются при создании. Баланс,
   валюта, сумма, дата подписания и список инструментов — производные: стор
   ФИ считает их из узлов дерева продуктов, прикреплённых к карточке (fiIds
   узла в mock-deal-trees.js; решение человека 02.10.2026). Поэтому их в
   записи нет. У карточек без заполненных полей пустые поля опущены — стор
   подставляет null, false и [].

   Откуда: макет «Перенос из дерева в ФИ» (30.09.2026) — номер и тип ФИ в
   сделке, наименование, тип отчётности; макеты «Card-Fininstrument»,
   «Tile-Deal-Fininstrument» и «Изменение ФИ» (02.10.2026) — контрагенты,
   FV/AC, целевой IRR, признаки, номер связанного договора, опцион МСФО,
   коды для RWA, ошибка. Карточки с id из деревьев — те, к которым узлы уже
   прикреплены; у сделок в работе ещё четыре свободные: два кредита (МСФО,
   РСБУ), акции и РЕПО. В погашенных сделках (1030, 1039, 1048) свободных
   карточек нет: все карточки прикреплены к погашенным узлам и погашены
   (решение человека 04.10.2026). Тип карточки прикреплённого узла — по его
   типу: транш — кредит, акции — акции, пут — РЕПО (допущение агента
   30.09.2026, вопрос 39 задачи RE0001).

   Сделки под состояния тайла «Финансовые инструменты» (02.10.2026):
   – 1027 (Корректировка, правка) — заполненные карточки: кредит с
     прикреплённым траншем, кредит с погашенным траншем (вкладка
     «Погашенные»), акции с PE, свободные «не заполнено», карточка с
     ошибкой (5), РЕПО и «Доп. доходность»;
   – 1024 (Активная, просмотр) — то же без права правки;
   – 1026 (Черновик) — карточек нет, а в дереве есть транши и акции:
     «Сгенерировать автоматически» создаёт карточки и прикрепляет узлы;
   – 1035 (Черновик) и 1042 (Активная) — карточек нет и дерева нет: пусто в
     правке и в просмотре.

   Признак PE на карточке (isPE, акции): у сделок с PE — 1025 (FI-1025-3),
   1032 (FI-1032-1), 1045 (FI-1045-3), 1053 (FI-1053-2), 1060 (FI-1060-3),
   1068 (FI-1068-2); к каждой прикреплён узел акций (решение человека
   04.10.2026).

   Значения — рыба; наименование — «<клиент>-<тип>-<номер>», как на макете.
   Контрагенты — id базы mock-counterparties.js.
   ========================================================================= */

/**
 * Карточка ФИ сделки.
 * Source: invented (30.09.2026, расширена 02.10.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} DealFinInstrumentCardRsDto
 * @property {string} id                          идентификатор ФИ (его держит узел дерева в fiIds)
 * @property {number} number                      порядковый номер ФИ в сделке
 * @property {FinInstrumentTypeCode} typeCode     тип ФИ
 * @property {string} name                        наименование ФИ
 * @property {FinReportingTypeCode} reportingType тип отчётности
 * @property {string|null} counterpartyId         контрагент — id базы контрагентов
 * @property {string|null} reserveCounterpartyId  контрагент для целей резервирования
 * @property {string|null} allocationCounterpartyId контрагент для аллокации финансового результата
 * @property {FinFvAcCode|null} fvAcCode          FV/AC
 * @property {number|null} targetIrr              целевой IRR, % (акции, дебиторская задолженность)
 * @property {boolean} isDkkk                     участие ДККК
 * @property {boolean} isPE                       Private Equity (акции)
 * @property {boolean} hasLinkedUnconditionalOption связанный безусловный опцион (акции)
 * @property {string|null} linkedContractNumber   номер связанного договора (РЕПО, доп. доходность)
 * @property {string|null} ifrsOptionNodeId       опцион, включённый в расчёт МСФО, — id узла
 *           дерева «Пут: РЕПО» / «Колл: РЕПО» (РЕПО, доп. доходность)
 * @property {string[]} rwaCodes                  коды для RWA — считает система, только чтение
 * @property {string|null} errorText              текст ошибки карточки — от системы, только чтение
 */

/**
 * Тип ФИ. Source: invented (30.09.2026); ADDITIONAL_YIELD — макеты 02.10.2026.
 * @typedef {'LOAN'|'SHARES'|'REPO'|'RECEIVABLES'|'ADDITIONAL_YIELD'} FinInstrumentTypeCode
 */

/**
 * Тип отчётности ФИ. Source: invented (30.09.2026).
 * @typedef {'IFRS_RAS'|'IFRS'|'RAS'} FinReportingTypeCode
 */

/**
 * FV/AC — способ учёта. Source: invented (02.10.2026): на макете окна «FV»,
 * на карточке «Инвестиции в АК» — справочник не решён.
 * @typedef {'FV'|'AC'} FinFvAcCode
 */

/** @type {Record<string, DealFinInstrumentCardRsDto[]>} */
window.MOCK_DEAL_FIN_INSTRUMENTS = {
  "1024": [
    {"id": "FI-1024-1", "number": 1, "typeCode": "LOAN", "name": "124-Кредит-201", "reportingType": "IFRS_RAS", "counterpartyId": "ul-11", "reserveCounterpartyId": "ul-24", "allocationCounterpartyId": "ul-27", "fvAcCode": "AC", "isDkkk": true, "rwaCodes": ["6002-1,5%", "6005-5%", "6005.21-3%"]},
    {"id": "FI-1024-2", "number": 2, "typeCode": "LOAN", "name": "124-Кредит-202", "reportingType": "IFRS", "counterpartyId": "ul-11", "fvAcCode": "AC", "rwaCodes": ["6002-1,5%"]},
    {"id": "FI-1024-3", "number": 3, "typeCode": "SHARES", "name": "124-Акции-203", "reportingType": "RAS", "counterpartyId": "ul-11", "reserveCounterpartyId": "ul-38", "allocationCounterpartyId": "ul-30", "fvAcCode": "FV", "targetIrr": 12.5, "isDkkk": true, "hasLinkedUnconditionalOption": true, "rwaCodes": ["6002-1,5%"]},
    {"id": "FI-1024-4", "number": 4, "typeCode": "LOAN", "name": "124-Кредит-204", "reportingType": "IFRS"},
    {"id": "FI-1024-5", "number": 5, "typeCode": "LOAN", "name": "124-Кредит-205", "reportingType": "RAS"},
    {"id": "FI-1024-6", "number": 6, "typeCode": "SHARES", "name": "124-Акции-206", "reportingType": "IFRS_RAS"},
    {"id": "FI-1024-7", "number": 7, "typeCode": "REPO", "name": "124-РЕПО-207", "reportingType": "IFRS_RAS"}
  ],
  "1025": [
    {"id": "FI-1025-1", "number": 1, "typeCode": "LOAN", "name": "125-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1025-2", "number": 2, "typeCode": "LOAN", "name": "125-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1025-3", "number": 3, "typeCode": "SHARES", "name": "125-Акции-203", "reportingType": "IFRS_RAS", "isPE": true},
    {"id": "FI-1025-4", "number": 4, "typeCode": "REPO", "name": "125-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1026": [],
  "1027": [
    {"id": "FI-1027-1", "number": 1, "typeCode": "LOAN", "name": "127-Кредит-201", "reportingType": "IFRS_RAS", "counterpartyId": "ul-22", "reserveCounterpartyId": "ul-2", "allocationCounterpartyId": "ul-20", "fvAcCode": "AC", "isDkkk": true, "rwaCodes": ["6002-1,5%", "6005-5%"]},
    {"id": "FI-1027-2", "number": 2, "typeCode": "LOAN", "name": "127-Кредит-202", "reportingType": "IFRS", "counterpartyId": "ul-22", "fvAcCode": "FV", "rwaCodes": ["6002-1,5%"]},
    {"id": "FI-1027-3", "number": 3, "typeCode": "SHARES", "name": "127-Акции-203", "reportingType": "RAS", "counterpartyId": "ul-22", "reserveCounterpartyId": "ul-31", "allocationCounterpartyId": "ul-23", "fvAcCode": "FV", "targetIrr": 17.03, "isDkkk": true, "isPE": true, "hasLinkedUnconditionalOption": true, "rwaCodes": ["6002-1,5%"]},
    {"id": "FI-1027-4", "number": 4, "typeCode": "LOAN", "name": "127-Кредит-204", "reportingType": "IFRS"},
    {"id": "FI-1027-5", "number": 5, "typeCode": "LOAN", "name": "127-Кредит-205", "reportingType": "RAS", "errorText": "Текст описания ошибки"},
    {"id": "FI-1027-6", "number": 6, "typeCode": "SHARES", "name": "127-Акции-206", "reportingType": "IFRS_RAS", "counterpartyId": "ul-22"},
    {"id": "FI-1027-7", "number": 7, "typeCode": "REPO", "name": "127-РЕПО-207", "reportingType": "IFRS_RAS", "counterpartyId": "ul-22", "fvAcCode": "FV", "isDkkk": true, "linkedContractNumber": "123456789", "rwaCodes": ["6002-1,5%"]},
    {"id": "FI-1027-8", "number": 8, "typeCode": "ADDITIONAL_YIELD", "name": "127-Доп. доходность-208", "reportingType": "IFRS_RAS", "counterpartyId": "ul-22", "linkedContractNumber": "987654321"}
  ],
  "1028": [
    {"id": "FI-1028-1", "number": 1, "typeCode": "LOAN", "name": "128-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1028-2", "number": 2, "typeCode": "LOAN", "name": "128-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1028-3", "number": 3, "typeCode": "SHARES", "name": "128-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1028-4", "number": 4, "typeCode": "REPO", "name": "128-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1029": [
    {"id": "FI-1029-1", "number": 1, "typeCode": "SHARES", "name": "129-Акции-201", "reportingType": "IFRS_RAS"},
    {"id": "FI-1029-2", "number": 2, "typeCode": "REPO", "name": "129-РЕПО-202", "reportingType": "IFRS"},
    {"id": "FI-1029-3", "number": 3, "typeCode": "LOAN", "name": "129-Кредит-203", "reportingType": "IFRS"},
    {"id": "FI-1029-4", "number": 4, "typeCode": "LOAN", "name": "129-Кредит-204", "reportingType": "RAS"},
    {"id": "FI-1029-5", "number": 5, "typeCode": "SHARES", "name": "129-Акции-205", "reportingType": "IFRS_RAS"},
    {"id": "FI-1029-6", "number": 6, "typeCode": "REPO", "name": "129-РЕПО-206", "reportingType": "IFRS_RAS"}
  ],
  "1030": [
    {"id": "FI-1030-1", "number": 1, "typeCode": "LOAN", "name": "130-Кредит-201", "reportingType": "IFRS"}
  ],
  "1031": [
    {"id": "FI-1031-1", "number": 1, "typeCode": "LOAN", "name": "131-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1031-2", "number": 2, "typeCode": "LOAN", "name": "131-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1031-3", "number": 3, "typeCode": "SHARES", "name": "131-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1031-4", "number": 4, "typeCode": "REPO", "name": "131-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1032": [
    {"id": "FI-1032-1", "number": 1, "typeCode": "SHARES", "name": "132-Акции-201", "reportingType": "IFRS_RAS", "isPE": true},
    {"id": "FI-1032-2", "number": 2, "typeCode": "LOAN", "name": "132-Кредит-202", "reportingType": "IFRS"},
    {"id": "FI-1032-3", "number": 3, "typeCode": "SHARES", "name": "132-Акции-203", "reportingType": "RAS"},
    {"id": "FI-1032-4", "number": 4, "typeCode": "REPO", "name": "132-РЕПО-204", "reportingType": "IFRS_RAS"},
    {"id": "FI-1032-5", "number": 5, "typeCode": "LOAN", "name": "132-Кредит-205", "reportingType": "IFRS"},
    {"id": "FI-1032-6", "number": 6, "typeCode": "LOAN", "name": "132-Кредит-206", "reportingType": "RAS"},
    {"id": "FI-1032-7", "number": 7, "typeCode": "SHARES", "name": "132-Акции-207", "reportingType": "IFRS_RAS"},
    {"id": "FI-1032-8", "number": 8, "typeCode": "REPO", "name": "132-РЕПО-208", "reportingType": "IFRS_RAS"}
  ],
  "1033": [
    {"id": "FI-1033-1", "number": 1, "typeCode": "LOAN", "name": "133-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1033-2", "number": 2, "typeCode": "LOAN", "name": "133-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1033-3", "number": 3, "typeCode": "SHARES", "name": "133-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1033-4", "number": 4, "typeCode": "REPO", "name": "133-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1034": [
    {"id": "FI-1034-1", "number": 1, "typeCode": "LOAN", "name": "134-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1034-2", "number": 2, "typeCode": "LOAN", "name": "134-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1034-3", "number": 3, "typeCode": "SHARES", "name": "134-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1034-4", "number": 4, "typeCode": "REPO", "name": "134-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1035": [],
  "1036": [
    {"id": "FI-1036-1", "number": 1, "typeCode": "LOAN", "name": "136-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1036-2", "number": 2, "typeCode": "LOAN", "name": "136-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1036-3", "number": 3, "typeCode": "SHARES", "name": "136-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1036-4", "number": 4, "typeCode": "REPO", "name": "136-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1037": [
    {"id": "FI-1037-1", "number": 1, "typeCode": "LOAN", "name": "137-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1037-2", "number": 2, "typeCode": "LOAN", "name": "137-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1037-3", "number": 3, "typeCode": "SHARES", "name": "137-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1037-4", "number": 4, "typeCode": "REPO", "name": "137-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1038": [
    {"id": "FI-1038-1", "number": 1, "typeCode": "LOAN", "name": "138-Кредит-201", "reportingType": "IFRS_RAS"},
    {"id": "FI-1038-2", "number": 2, "typeCode": "SHARES", "name": "138-Акции-202", "reportingType": "IFRS"},
    {"id": "FI-1038-3", "number": 3, "typeCode": "REPO", "name": "138-РЕПО-203", "reportingType": "RAS"},
    {"id": "FI-1038-4", "number": 4, "typeCode": "LOAN", "name": "138-Кредит-204", "reportingType": "IFRS_RAS"},
    {"id": "FI-1038-5", "number": 5, "typeCode": "LOAN", "name": "138-Кредит-205", "reportingType": "IFRS"},
    {"id": "FI-1038-6", "number": 6, "typeCode": "LOAN", "name": "138-Кредит-206", "reportingType": "RAS"},
    {"id": "FI-1038-7", "number": 7, "typeCode": "SHARES", "name": "138-Акции-207", "reportingType": "IFRS_RAS"},
    {"id": "FI-1038-8", "number": 8, "typeCode": "REPO", "name": "138-РЕПО-208", "reportingType": "IFRS_RAS"}
  ],
  "1039": [
    {"id": "FI-1039-3", "number": 3, "typeCode": "SHARES", "name": "139-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1039-4", "number": 4, "typeCode": "REPO", "name": "139-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1040": [
    {"id": "FI-1040-1", "number": 1, "typeCode": "LOAN", "name": "140-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1040-2", "number": 2, "typeCode": "LOAN", "name": "140-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1040-3", "number": 3, "typeCode": "SHARES", "name": "140-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1040-4", "number": 4, "typeCode": "REPO", "name": "140-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1041": [
    {"id": "FI-1041-1", "number": 1, "typeCode": "SHARES", "name": "141-Акции-201", "reportingType": "IFRS_RAS"},
    {"id": "FI-1041-2", "number": 2, "typeCode": "LOAN", "name": "141-Кредит-202", "reportingType": "IFRS"},
    {"id": "FI-1041-3", "number": 3, "typeCode": "LOAN", "name": "141-Кредит-203", "reportingType": "IFRS"},
    {"id": "FI-1041-4", "number": 4, "typeCode": "LOAN", "name": "141-Кредит-204", "reportingType": "RAS"},
    {"id": "FI-1041-5", "number": 5, "typeCode": "SHARES", "name": "141-Акции-205", "reportingType": "IFRS_RAS"},
    {"id": "FI-1041-6", "number": 6, "typeCode": "REPO", "name": "141-РЕПО-206", "reportingType": "IFRS_RAS"}
  ],
  "1042": [],
  "1043": [
    {"id": "FI-1043-1", "number": 1, "typeCode": "LOAN", "name": "143-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1043-2", "number": 2, "typeCode": "LOAN", "name": "143-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1043-3", "number": 3, "typeCode": "SHARES", "name": "143-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1043-4", "number": 4, "typeCode": "REPO", "name": "143-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1044": [
    {"id": "FI-1044-1", "number": 1, "typeCode": "LOAN", "name": "144-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1044-2", "number": 2, "typeCode": "LOAN", "name": "144-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1044-3", "number": 3, "typeCode": "SHARES", "name": "144-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1044-4", "number": 4, "typeCode": "REPO", "name": "144-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1045": [
    {"id": "FI-1045-1", "number": 1, "typeCode": "LOAN", "name": "145-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1045-2", "number": 2, "typeCode": "LOAN", "name": "145-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1045-3", "number": 3, "typeCode": "SHARES", "name": "145-Акции-203", "reportingType": "IFRS_RAS", "isPE": true},
    {"id": "FI-1045-4", "number": 4, "typeCode": "REPO", "name": "145-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1046": [
    {"id": "FI-1046-1", "number": 1, "typeCode": "LOAN", "name": "146-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1046-2", "number": 2, "typeCode": "LOAN", "name": "146-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1046-3", "number": 3, "typeCode": "SHARES", "name": "146-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1046-4", "number": 4, "typeCode": "REPO", "name": "146-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1047": [
    {"id": "FI-1047-1", "number": 1, "typeCode": "SHARES", "name": "147-Акции-201", "reportingType": "IFRS_RAS"},
    {"id": "FI-1047-2", "number": 2, "typeCode": "LOAN", "name": "147-Кредит-202", "reportingType": "IFRS"},
    {"id": "FI-1047-3", "number": 3, "typeCode": "SHARES", "name": "147-Акции-203", "reportingType": "RAS"},
    {"id": "FI-1047-4", "number": 4, "typeCode": "REPO", "name": "147-РЕПО-204", "reportingType": "IFRS_RAS"},
    {"id": "FI-1047-5", "number": 5, "typeCode": "LOAN", "name": "147-Кредит-205", "reportingType": "IFRS"},
    {"id": "FI-1047-6", "number": 6, "typeCode": "LOAN", "name": "147-Кредит-206", "reportingType": "RAS"},
    {"id": "FI-1047-7", "number": 7, "typeCode": "SHARES", "name": "147-Акции-207", "reportingType": "IFRS_RAS"},
    {"id": "FI-1047-8", "number": 8, "typeCode": "REPO", "name": "147-РЕПО-208", "reportingType": "IFRS_RAS"}
  ],
  "1048": [
    {"id": "FI-1048-1", "number": 1, "typeCode": "LOAN", "name": "148-Кредит-201", "reportingType": "IFRS"}
  ],
  "1049": [
    {"id": "FI-1049-1", "number": 1, "typeCode": "LOAN", "name": "149-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1049-2", "number": 2, "typeCode": "LOAN", "name": "149-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1049-3", "number": 3, "typeCode": "SHARES", "name": "149-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1049-4", "number": 4, "typeCode": "REPO", "name": "149-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1050": [
    {"id": "FI-1050-1", "number": 1, "typeCode": "LOAN", "name": "150-Кредит-201", "reportingType": "IFRS_RAS"},
    {"id": "FI-1050-2", "number": 2, "typeCode": "SHARES", "name": "150-Акции-202", "reportingType": "IFRS"},
    {"id": "FI-1050-3", "number": 3, "typeCode": "LOAN", "name": "150-Кредит-203", "reportingType": "IFRS"},
    {"id": "FI-1050-4", "number": 4, "typeCode": "LOAN", "name": "150-Кредит-204", "reportingType": "RAS"},
    {"id": "FI-1050-5", "number": 5, "typeCode": "SHARES", "name": "150-Акции-205", "reportingType": "IFRS_RAS"},
    {"id": "FI-1050-6", "number": 6, "typeCode": "REPO", "name": "150-РЕПО-206", "reportingType": "IFRS_RAS"}
  ],
  "1051": [
    {"id": "FI-1051-1", "number": 1, "typeCode": "LOAN", "name": "151-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1051-2", "number": 2, "typeCode": "LOAN", "name": "151-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1051-3", "number": 3, "typeCode": "SHARES", "name": "151-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1051-4", "number": 4, "typeCode": "REPO", "name": "151-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1052": [
    {"id": "FI-1052-1", "number": 1, "typeCode": "LOAN", "name": "152-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1052-2", "number": 2, "typeCode": "LOAN", "name": "152-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1052-3", "number": 3, "typeCode": "SHARES", "name": "152-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1052-4", "number": 4, "typeCode": "REPO", "name": "152-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1053": [
    {"id": "FI-1053-1", "number": 1, "typeCode": "LOAN", "name": "153-Кредит-201", "reportingType": "IFRS_RAS"},
    {"id": "FI-1053-2", "number": 2, "typeCode": "SHARES", "name": "153-Акции-202", "reportingType": "IFRS", "isPE": true},
    {"id": "FI-1053-3", "number": 3, "typeCode": "REPO", "name": "153-РЕПО-203", "reportingType": "RAS"},
    {"id": "FI-1053-4", "number": 4, "typeCode": "LOAN", "name": "153-Кредит-204", "reportingType": "IFRS_RAS"},
    {"id": "FI-1053-5", "number": 5, "typeCode": "LOAN", "name": "153-Кредит-205", "reportingType": "IFRS"},
    {"id": "FI-1053-6", "number": 6, "typeCode": "LOAN", "name": "153-Кредит-206", "reportingType": "RAS"},
    {"id": "FI-1053-7", "number": 7, "typeCode": "SHARES", "name": "153-Акции-207", "reportingType": "IFRS_RAS"},
    {"id": "FI-1053-8", "number": 8, "typeCode": "REPO", "name": "153-РЕПО-208", "reportingType": "IFRS_RAS"}
  ],
  "1054": [
    {"id": "FI-1054-1", "number": 1, "typeCode": "LOAN", "name": "154-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1054-2", "number": 2, "typeCode": "LOAN", "name": "154-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1054-3", "number": 3, "typeCode": "SHARES", "name": "154-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1054-4", "number": 4, "typeCode": "REPO", "name": "154-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1055": [
    {"id": "FI-1055-1", "number": 1, "typeCode": "LOAN", "name": "155-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1055-2", "number": 2, "typeCode": "LOAN", "name": "155-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1055-3", "number": 3, "typeCode": "SHARES", "name": "155-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1055-4", "number": 4, "typeCode": "REPO", "name": "155-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1056": [
    {"id": "FI-1056-1", "number": 1, "typeCode": "SHARES", "name": "156-Акции-201", "reportingType": "IFRS_RAS"},
    {"id": "FI-1056-2", "number": 2, "typeCode": "LOAN", "name": "156-Кредит-202", "reportingType": "IFRS"},
    {"id": "FI-1056-3", "number": 3, "typeCode": "LOAN", "name": "156-Кредит-203", "reportingType": "IFRS"},
    {"id": "FI-1056-4", "number": 4, "typeCode": "LOAN", "name": "156-Кредит-204", "reportingType": "RAS"},
    {"id": "FI-1056-5", "number": 5, "typeCode": "SHARES", "name": "156-Акции-205", "reportingType": "IFRS_RAS"},
    {"id": "FI-1056-6", "number": 6, "typeCode": "REPO", "name": "156-РЕПО-206", "reportingType": "IFRS_RAS"}
  ],
  "1057": [
    {"id": "FI-1057-1", "number": 1, "typeCode": "LOAN", "name": "157-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1057-2", "number": 2, "typeCode": "LOAN", "name": "157-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1057-3", "number": 3, "typeCode": "SHARES", "name": "157-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1057-4", "number": 4, "typeCode": "REPO", "name": "157-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1058": [
    {"id": "FI-1058-1", "number": 1, "typeCode": "LOAN", "name": "158-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1058-2", "number": 2, "typeCode": "LOAN", "name": "158-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1058-3", "number": 3, "typeCode": "SHARES", "name": "158-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1058-4", "number": 4, "typeCode": "REPO", "name": "158-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1059": [
    {"id": "FI-1059-1", "number": 1, "typeCode": "SHARES", "name": "159-Акции-201", "reportingType": "IFRS_RAS"},
    {"id": "FI-1059-2", "number": 2, "typeCode": "REPO", "name": "159-РЕПО-202", "reportingType": "IFRS"},
    {"id": "FI-1059-3", "number": 3, "typeCode": "LOAN", "name": "159-Кредит-203", "reportingType": "RAS"},
    {"id": "FI-1059-4", "number": 4, "typeCode": "LOAN", "name": "159-Кредит-204", "reportingType": "IFRS"},
    {"id": "FI-1059-5", "number": 5, "typeCode": "LOAN", "name": "159-Кредит-205", "reportingType": "RAS"},
    {"id": "FI-1059-6", "number": 6, "typeCode": "SHARES", "name": "159-Акции-206", "reportingType": "IFRS_RAS"},
    {"id": "FI-1059-7", "number": 7, "typeCode": "REPO", "name": "159-РЕПО-207", "reportingType": "IFRS_RAS"}
  ],
  "1060": [
    {"id": "FI-1060-1", "number": 1, "typeCode": "LOAN", "name": "160-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1060-2", "number": 2, "typeCode": "LOAN", "name": "160-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1060-3", "number": 3, "typeCode": "SHARES", "name": "160-Акции-203", "reportingType": "IFRS_RAS", "isPE": true},
    {"id": "FI-1060-4", "number": 4, "typeCode": "REPO", "name": "160-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1061": [
    {"id": "FI-1061-1", "number": 1, "typeCode": "LOAN", "name": "161-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1061-2", "number": 2, "typeCode": "LOAN", "name": "161-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1061-3", "number": 3, "typeCode": "SHARES", "name": "161-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1061-4", "number": 4, "typeCode": "REPO", "name": "161-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1062": [
    {"id": "FI-1062-1", "number": 1, "typeCode": "SHARES", "name": "162-Акции-201", "reportingType": "IFRS_RAS"},
    {"id": "FI-1062-2", "number": 2, "typeCode": "LOAN", "name": "162-Кредит-202", "reportingType": "IFRS"},
    {"id": "FI-1062-3", "number": 3, "typeCode": "SHARES", "name": "162-Акции-203", "reportingType": "RAS"},
    {"id": "FI-1062-4", "number": 4, "typeCode": "REPO", "name": "162-РЕПО-204", "reportingType": "IFRS_RAS"},
    {"id": "FI-1062-5", "number": 5, "typeCode": "LOAN", "name": "162-Кредит-205", "reportingType": "IFRS"},
    {"id": "FI-1062-6", "number": 6, "typeCode": "LOAN", "name": "162-Кредит-206", "reportingType": "RAS"},
    {"id": "FI-1062-7", "number": 7, "typeCode": "SHARES", "name": "162-Акции-207", "reportingType": "IFRS_RAS"},
    {"id": "FI-1062-8", "number": 8, "typeCode": "REPO", "name": "162-РЕПО-208", "reportingType": "IFRS_RAS"}
  ],
  "1063": [
    {"id": "FI-1063-1", "number": 1, "typeCode": "LOAN", "name": "163-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1063-2", "number": 2, "typeCode": "LOAN", "name": "163-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1063-3", "number": 3, "typeCode": "SHARES", "name": "163-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1063-4", "number": 4, "typeCode": "REPO", "name": "163-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1064": [
    {"id": "FI-1064-1", "number": 1, "typeCode": "LOAN", "name": "164-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1064-2", "number": 2, "typeCode": "LOAN", "name": "164-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1064-3", "number": 3, "typeCode": "SHARES", "name": "164-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1064-4", "number": 4, "typeCode": "REPO", "name": "164-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1065": [
    {"id": "FI-1065-1", "number": 1, "typeCode": "LOAN", "name": "165-Кредит-201", "reportingType": "IFRS_RAS"},
    {"id": "FI-1065-2", "number": 2, "typeCode": "SHARES", "name": "165-Акции-202", "reportingType": "IFRS"},
    {"id": "FI-1065-3", "number": 3, "typeCode": "LOAN", "name": "165-Кредит-203", "reportingType": "IFRS"},
    {"id": "FI-1065-4", "number": 4, "typeCode": "LOAN", "name": "165-Кредит-204", "reportingType": "RAS"},
    {"id": "FI-1065-5", "number": 5, "typeCode": "SHARES", "name": "165-Акции-205", "reportingType": "IFRS_RAS"},
    {"id": "FI-1065-6", "number": 6, "typeCode": "REPO", "name": "165-РЕПО-206", "reportingType": "IFRS_RAS"}
  ],
  "1066": [
    {"id": "FI-1066-1", "number": 1, "typeCode": "LOAN", "name": "166-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1066-2", "number": 2, "typeCode": "LOAN", "name": "166-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1066-3", "number": 3, "typeCode": "SHARES", "name": "166-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1066-4", "number": 4, "typeCode": "REPO", "name": "166-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1067": [
    {"id": "FI-1067-1", "number": 1, "typeCode": "LOAN", "name": "167-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1067-2", "number": 2, "typeCode": "LOAN", "name": "167-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1067-3", "number": 3, "typeCode": "SHARES", "name": "167-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1067-4", "number": 4, "typeCode": "REPO", "name": "167-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1068": [
    {"id": "FI-1068-1", "number": 1, "typeCode": "LOAN", "name": "168-Кредит-201", "reportingType": "IFRS_RAS"},
    {"id": "FI-1068-2", "number": 2, "typeCode": "SHARES", "name": "168-Акции-202", "reportingType": "IFRS", "isPE": true},
    {"id": "FI-1068-3", "number": 3, "typeCode": "REPO", "name": "168-РЕПО-203", "reportingType": "RAS"},
    {"id": "FI-1068-4", "number": 4, "typeCode": "LOAN", "name": "168-Кредит-204", "reportingType": "IFRS_RAS"},
    {"id": "FI-1068-5", "number": 5, "typeCode": "LOAN", "name": "168-Кредит-205", "reportingType": "IFRS"},
    {"id": "FI-1068-6", "number": 6, "typeCode": "LOAN", "name": "168-Кредит-206", "reportingType": "RAS"},
    {"id": "FI-1068-7", "number": 7, "typeCode": "SHARES", "name": "168-Акции-207", "reportingType": "IFRS_RAS"},
    {"id": "FI-1068-8", "number": 8, "typeCode": "REPO", "name": "168-РЕПО-208", "reportingType": "IFRS_RAS"}
  ],
  "1069": [
    {"id": "FI-1069-1", "number": 1, "typeCode": "LOAN", "name": "169-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1069-2", "number": 2, "typeCode": "LOAN", "name": "169-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1069-3", "number": 3, "typeCode": "SHARES", "name": "169-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1069-4", "number": 4, "typeCode": "REPO", "name": "169-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1070": [
    {"id": "FI-1070-1", "number": 1, "typeCode": "LOAN", "name": "170-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1070-2", "number": 2, "typeCode": "LOAN", "name": "170-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1070-3", "number": 3, "typeCode": "SHARES", "name": "170-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1070-4", "number": 4, "typeCode": "REPO", "name": "170-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1071": [
    {"id": "FI-1071-1", "number": 1, "typeCode": "SHARES", "name": "171-Акции-201", "reportingType": "IFRS_RAS"},
    {"id": "FI-1071-2", "number": 2, "typeCode": "LOAN", "name": "171-Кредит-202", "reportingType": "IFRS"},
    {"id": "FI-1071-3", "number": 3, "typeCode": "LOAN", "name": "171-Кредит-203", "reportingType": "IFRS"},
    {"id": "FI-1071-4", "number": 4, "typeCode": "LOAN", "name": "171-Кредит-204", "reportingType": "RAS"},
    {"id": "FI-1071-5", "number": 5, "typeCode": "SHARES", "name": "171-Акции-205", "reportingType": "IFRS_RAS"},
    {"id": "FI-1071-6", "number": 6, "typeCode": "REPO", "name": "171-РЕПО-206", "reportingType": "IFRS_RAS"}
  ],
  "1072": [
    {"id": "FI-1072-1", "number": 1, "typeCode": "LOAN", "name": "172-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1072-2", "number": 2, "typeCode": "LOAN", "name": "172-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1072-3", "number": 3, "typeCode": "SHARES", "name": "172-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1072-4", "number": 4, "typeCode": "REPO", "name": "172-РЕПО-204", "reportingType": "IFRS_RAS"}
  ],
  "1073": [
    {"id": "FI-1073-1", "number": 1, "typeCode": "LOAN", "name": "173-Кредит-201", "reportingType": "IFRS"},
    {"id": "FI-1073-2", "number": 2, "typeCode": "LOAN", "name": "173-Кредит-202", "reportingType": "RAS"},
    {"id": "FI-1073-3", "number": 3, "typeCode": "SHARES", "name": "173-Акции-203", "reportingType": "IFRS_RAS"},
    {"id": "FI-1073-4", "number": 4, "typeCode": "REPO", "name": "173-РЕПО-204", "reportingType": "IFRS_RAS"}
  ]
};

/** Подписи типов ФИ. @type {Record<FinInstrumentTypeCode, string>} */
window.FIN_INSTRUMENT_TYPE_LABELS = {
  LOAN: 'Кредит',
  SHARES: 'Акции',
  ADDITIONAL_YIELD: 'Доп. доходность',
  REPO: 'РЕПО',
  RECEIVABLES: 'Дебиторская задолженность'
};

/** Подписи типов отчётности. @type {Record<FinReportingTypeCode, string>} */
window.FIN_INSTRUMENT_REPORTING_LABELS = {
  IFRS_RAS: 'МСФО и РСБУ',
  IFRS: 'МСФО',
  RAS: 'РСБУ'
};

/** Подписи FV/AC. @type {Record<FinFvAcCode, string>} */
window.FIN_INSTRUMENT_FV_AC_LABELS = {
  FV: 'FV',
  AC: 'AC'
};

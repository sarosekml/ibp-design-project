/* =========================================================================
   Расчет FV — словари и матрица статусов × роль (window.FV_*).

   Обычный <script> (file://, без fetch). Подключается до данных и экранного
   скрипта: <script src="../data/fv-dictionaries.js"></script>.
   Матрица действий живёт ТОЛЬКО здесь: скрипты экранов и спеки берут её
   отсюда, копий нет (задача RE0012, раздел 3).
   Имена — в стиле API, перечисления — кодами, подписи — отдельными картами.
   ========================================================================= */

/**
 * Статус расчета FV.
 * Source: invented (08.10.2026).
 * @typedef {'FORMING'|'FORMED'|'SENT_TO_LP'|'CALCULATING_LP'|'CALCULATED'|'ERROR'|'APPROVED'} FvCalculationStatusCode
 */

/**
 * Статус финансового инструмента (ФИ) и инструмента в его составе.
 * Source: invented (08.10.2026).
 * RETURNED_FROM_LP — LP нашёл ошибку в файле; ERROR — мы сами вернули файл
 * кнопкой «Вернуть с ошибкой»; NO_DATA — файл удалён.
 * @typedef {'FORMED'|'SENT_TO_LP'|'CALCULATING_LP'|'CALCULATED'|'RETURNED_FROM_LP'|'ERROR'|'NO_DATA'} FvItemStatusCode
 */

/**
 * Состояние XML-файла инструмента.
 * Source: invented (08.10.2026).
 * @typedef {'GENERATED'|'UPLOADED'|'DELETED'} FvXmlFileStateCode
 */

/**
 * Роль пользователя на страницах расчета FV.
 * Source: invented (08.10.2026).
 * @typedef {'FINANCIER'|'RISK_MANAGER'} FvUserRoleCode
 */

/** Подписи статусов расчета. @type {Record<FvCalculationStatusCode, string>} */
window.FV_CALCULATION_STATUS_LABELS = {
  FORMING: 'Формируется',
  FORMED: 'Сформирован',
  SENT_TO_LP: 'Отправлен в LP',
  CALCULATING_LP: 'Рассчитывается LP',
  CALCULATED: 'Рассчитан',
  ERROR: 'Ошибка',
  APPROVED: 'Утвержден'
};

/** Подписи статусов ФИ и инструмента. @type {Record<FvItemStatusCode, string>} */
window.FV_ITEM_STATUS_LABELS = {
  FORMED: 'Сформирован',
  SENT_TO_LP: 'Отправлен в LP',
  CALCULATING_LP: 'Рассчитывается LP',
  CALCULATED: 'Рассчитан',
  RETURNED_FROM_LP: 'Возвращен из LP',
  ERROR: 'Ошибка',
  NO_DATA: 'Нет данных'
};

/**
 * Класс тона чипа статуса (Chip ДС, тональные тона). Формируется и
 * Рассчитывается LP — серые.
 * @type {Record<string, string>}
 */
window.FV_STATUS_TONES = {
  FORMING: 'chip--grey',
  FORMED: 'chip--lblue',
  SENT_TO_LP: 'chip--orange',
  CALCULATING_LP: 'chip--grey',
  CALCULATED: 'chip--dpurple',
  APPROVED: 'chip--green',
  ERROR: 'chip--red',
  RETURNED_FROM_LP: 'chip--red',
  NO_DATA: 'chip--red'
};

/** Подписи состояния XML-файла в колонке «Файл xml». @type {Record<FvXmlFileStateCode, string>} */
window.FV_XML_FILE_STATE_LABELS = {
  GENERATED: 'Сформирован',
  UPLOADED: 'Загружен',
  DELETED: 'Удалён'
};

/** Подписи ролей. @type {Record<FvUserRoleCode, string>} */
window.FV_USER_ROLE_LABELS = {
  FINANCIER: 'Финансист и другие',
  RISK_MANAGER: 'Риск-менеджер'
};

/** Подписи пунктов меню «⋮» страницы расчета. */
window.FV_MENU_ITEM_LABELS = {
  refresh: 'Обновить',
  recalculate: 'Пересчитать',
  exportXml: 'Выгрузить в XML',
  exportXlsx: 'Выгрузить в xlsx'
};

/**
 * Матрица «статус расчета × роль → кнопки, меню, правка, массовые действия».
 *
 * send     — кнопка «Отправить в LP»: 'none' нет; 'ifReady' есть, включена,
 *            только если есть ФИ «Сформирован» с отметкой «Передавать в LP»
 *            (иначе выключена; нажатие без таких ФИ — снекбар
 *            «Нет данных для отправки в LP»); 'always' есть и включена
 *            (повторная отправка).
 * approve  — кнопка «Утвердить»: только роль RISK_MANAGER, только CALCULATED.
 * menu     — пункты меню «⋮» в порядке показа (порядок один для всех статусов).
 * bulk     — массовые действия над выбранными ФИ.
 * editFi   — правка ФИ доступна всегда; после «Сохранить» — подтверждение.
 * lockedUi — расчет формируется: действия выключены.
 *
 * Допущения (RE0012, открытые вопросы): в SENT_TO_LP и CALCULATING_LP кнопки
 * «Отправить в LP» нет; в CALCULATED при правке ФИ статус расчета не меняется,
 * «Отправить в LP» включена (вопрос 2); у FORMING меню и кнопки выключены.
 */
window.FV_CALCULATION_ACTIONS = {
  FORMING:        { send: 'none',    approve: false, menu: [],                                                bulk: [],                lockedUi: true },
  FORMED:         { send: 'ifReady', approve: false, menu: ['refresh', 'recalculate', 'exportXml', 'exportXlsx'], bulk: ['recalculate'],   lockedUi: false },
  SENT_TO_LP:     { send: 'none',    approve: false, menu: ['refresh', 'exportXml', 'exportXlsx'],            bulk: ['recalculate'],   lockedUi: false },
  CALCULATING_LP: { send: 'none',    approve: false, menu: ['refresh', 'exportXml', 'exportXlsx'],            bulk: ['recalculate'],   lockedUi: false },
  CALCULATED:     { send: 'always',  approve: true,  menu: ['refresh', 'exportXml', 'exportXlsx'],            bulk: ['recalculate'],   lockedUi: false },
  ERROR:          { send: 'none',    approve: false, menu: ['recalculate', 'exportXml', 'exportXlsx'],        bulk: ['recalculate'],   lockedUi: false },
  APPROVED:       { send: 'none',    approve: false, menu: ['recalculate', 'exportXml', 'exportXlsx'],        bulk: ['recalculate'],   lockedUi: false }
};

/** Роли, которым доступна кнопка «Утвердить» (при approve: true). @type {FvUserRoleCode[]} */
window.FV_APPROVE_ROLES = ['RISK_MANAGER'];

/**
 * Действия над XML-файлом инструмента в окне ФИ — по статусу инструмента.
 * exportTemplate — выгрузить шаблон; upload — загрузить; delete — удалить
 * (только если файл загружен, FvXmlFileStateCode = UPLOADED);
 * returnWithError — «Вернуть с ошибкой»; export — выгрузить файл.
 *
 * Допущение: RETURNED_FROM_LP, ERROR и NO_DATA — как FORMED (файл нужно
 * поправить и загрузить заново); в ТЗ для них набор не назван.
 */
window.FV_INSTRUMENT_FILE_ACTIONS = {
  FORMED:           ['exportTemplate', 'upload', 'delete'],
  SENT_TO_LP:       ['export', 'returnWithError'],
  CALCULATING_LP:   ['export', 'returnWithError'],
  CALCULATED:       ['export'],
  RETURNED_FROM_LP: ['exportTemplate', 'upload', 'delete'],
  ERROR:            ['exportTemplate', 'upload', 'delete'],
  NO_DATA:          ['exportTemplate', 'upload', 'delete']
};

/**
 * Статус ФИ по статусам его инструментов: хоть один RETURNED_FROM_LP или
 * ERROR — у ФИ «Ошибка»; иначе остаётся собственный статус ФИ.
 * @param {FvItemStatusCode} ownStatus
 * @param {FvItemStatusCode[]} instrumentStatuses
 * @returns {FvItemStatusCode}
 */
window.fvResolveItemStatus = function (ownStatus, instrumentStatuses) {
  var bad = instrumentStatuses.some(function (s) { return s === 'RETURNED_FROM_LP' || s === 'ERROR'; });
  return bad ? 'ERROR' : ownStatus;
};

/**
 * Сводный статус инструментов ФИ (колонка «Статус инструментов (xml)»):
 * ошибочный приоритетнее, затем «Нет данных», иначе первый по списку.
 * @param {FvItemStatusCode[]} instrumentStatuses
 * @returns {FvItemStatusCode}
 */
window.fvSummarizeInstruments = function (instrumentStatuses) {
  if (instrumentStatuses.indexOf('RETURNED_FROM_LP') >= 0) return 'RETURNED_FROM_LP';
  if (instrumentStatuses.indexOf('ERROR') >= 0) return 'ERROR';
  if (instrumentStatuses.indexOf('NO_DATA') >= 0) return 'NO_DATA';
  return instrumentStatuses[0];
};

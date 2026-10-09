/* =========================================================================
   Задачи сотрудника и деска — демо-данные прототипа (window.MOCK_TASKS).

   Обычный <script>, а не JSON: страницы открываются по file://. Подключается
   до data/home-store.js: <script src="../data/mock-tasks.js"></script>.

   «Сегодня» прототипа — 09.10.2026. Задачи сотрудника помечены isMine;
   «задачи моего деска» — все задачи деска, свои в том числе. Выполненные
   задачи на главную не приходят. Названия клиентов вымышлены.
   ========================================================================= */

/**
 * Задача.
 * Source: invented (09.10.2026) — заменить на DTO tasks-app, когда он появится.
 * @typedef {Object} TaskRsDto
 * @property {string} taskId               идентификатор задачи
 * @property {string} title                формулировка задачи
 * @property {TaskPriorityCode} priorityCode приоритет
 * @property {TaskStatusCode} statusCode   статус
 * @property {string} dueDate              срок, ISO-дата (2026-10-09)
 * @property {string} createdDate          дата поступления, ISO-дата
 * @property {string|null} dealNumber      номер сделки; задача без сделки — null
 * @property {string|null} clientName      клиент; задача без клиента — null
 * @property {string} assigneeName         исполнитель, «Фамилия И. О.»
 * @property {boolean} isMine              исполнитель — сотрудник
 */

/**
 * Приоритет задачи.
 * Source: invented (09.10.2026).
 * @typedef {'HIGH'|'MEDIUM'|'LOW'} TaskPriorityCode
 */

/**
 * Статус задачи.
 * Source: invented (09.10.2026).
 * @typedef {'NEW'|'IN_PROGRESS'|'DONE'} TaskStatusCode
 */

/** @type {TaskRsDto[]} */
window.MOCK_TASKS = [
  { taskId: 'T-1001', title: 'Обновить forecast P&L по АО «Платформа»', priorityCode: 'HIGH', statusCode: 'IN_PROGRESS', dueDate: '2026-10-05', createdDate: '2026-09-28', dealNumber: 'D-126618', clientName: 'АО «Платформа»', assigneeName: 'Ким А. С.', isMine: true },
  { taskId: 'T-1002', title: 'Проверить пакет КПКИ по ГК «Волга Тех»', priorityCode: 'HIGH', statusCode: 'NEW', dueDate: '2026-10-09', createdDate: '2026-10-09', dealNumber: 'D-134518', clientName: 'ГК «Волга Тех»', assigneeName: 'Ким А. С.', isMine: true },
  { taskId: 'T-1003', title: 'Обновить КП «Эталон-Сити»', priorityCode: 'HIGH', statusCode: 'NEW', dueDate: '2026-10-09', createdDate: '2026-10-07', dealNumber: 'D-153418', clientName: 'ГК «Эталон-Сити»', assigneeName: 'Ким А. С.', isMine: true },
  { taskId: 'T-1004', title: 'Сверить график погашения по траншу', priorityCode: 'MEDIUM', statusCode: 'IN_PROGRESS', dueDate: '2026-10-07', createdDate: '2026-10-01', dealNumber: 'D-118204', clientName: 'ПАО «Трубная группа»', assigneeName: 'Ким А. С.', isMine: true },
  { taskId: 'T-1005', title: 'Подготовить справку по ковенантам', priorityCode: 'LOW', statusCode: 'IN_PROGRESS', dueDate: '2026-10-08', createdDate: '2026-10-02', dealNumber: 'D-126618', clientName: 'АО «Платформа»', assigneeName: 'Ким А. С.', isMine: true },
  { taskId: 'T-1006', title: 'Актуализировать рейтинг заёмщика', priorityCode: 'MEDIUM', statusCode: 'IN_PROGRESS', dueDate: '2026-10-09', createdDate: '2026-10-03', dealNumber: 'D-120998', clientName: 'ПАО «СибМеталл»', assigneeName: 'Ким А. С.', isMine: true },
  { taskId: 'T-1007', title: 'Проверить исполнение ковенантов за III квартал', priorityCode: 'MEDIUM', statusCode: 'IN_PROGRESS', dueDate: '2026-10-09', createdDate: '2026-10-05', dealNumber: 'D-134518', clientName: 'ГК «Волга Тех»', assigneeName: 'Ким А. С.', isMine: true },
  { taskId: 'T-1008', title: 'Добавить данные по клиенту в сделку', priorityCode: 'MEDIUM', statusCode: 'NEW', dueDate: '2026-10-09', createdDate: '2026-10-09', dealNumber: 'D-120998', clientName: 'ПАО «СибМеталл»', assigneeName: 'Ким А. С.', isMine: true },
  { taskId: 'T-1009', title: 'Обновить контакты клиента', priorityCode: 'LOW', statusCode: 'NEW', dueDate: '2026-10-09', createdDate: '2026-10-06', dealNumber: null, clientName: 'ООО «ДомСтрой Сибирь»', assigneeName: 'Ким А. С.', isMine: true },
  { taskId: 'T-1010', title: 'Согласовать условия рефинансирования', priorityCode: 'HIGH', statusCode: 'IN_PROGRESS', dueDate: '2026-10-09', createdDate: '2026-10-06', dealNumber: 'D-160231', clientName: 'АО «Урал-Инвест»', assigneeName: 'Ким А. С.', isMine: true },
  { taskId: 'T-1011', title: 'Внести итоги встречи с ГК «Волга Тех»', priorityCode: 'MEDIUM', statusCode: 'IN_PROGRESS', dueDate: '2026-10-09', createdDate: '2026-10-09', dealNumber: 'D-134518', clientName: 'ГК «Волга Тех»', assigneeName: 'Ким А. С.', isMine: true },
  { taskId: 'T-1012', title: 'Согласовать материалы к КПКИ', priorityCode: 'MEDIUM', statusCode: 'NEW', dueDate: '2026-10-12', createdDate: '2026-10-08', dealNumber: 'D-120998', clientName: 'ПАО «СибМеталл»', assigneeName: 'Ким А. С.', isMine: true },
  { taskId: 'T-1013', title: 'Подготовить выгрузку по портфелю деска', priorityCode: 'LOW', statusCode: 'NEW', dueDate: '2026-10-14', createdDate: '2026-10-08', dealNumber: null, clientName: null, assigneeName: 'Ким А. С.', isMine: true },
  { taskId: 'T-1014', title: 'Проверить залоговое обеспечение', priorityCode: 'MEDIUM', statusCode: 'IN_PROGRESS', dueDate: '2026-10-15', createdDate: '2026-10-07', dealNumber: 'D-118204', clientName: 'ПАО «Трубная группа»', assigneeName: 'Ким А. С.', isMine: true },
  { taskId: 'T-2001', title: 'Подготовить заключение по лимиту', priorityCode: 'HIGH', statusCode: 'NEW', dueDate: '2026-10-09', createdDate: '2026-10-09', dealNumber: 'D-161004', clientName: 'ООО «Сима-Опт»', assigneeName: 'Зуев Р. Р.', isMine: false },
  { taskId: 'T-2002', title: 'Запросить отчётность за 9 месяцев', priorityCode: 'MEDIUM', statusCode: 'IN_PROGRESS', dueDate: '2026-10-06', createdDate: '2026-09-30', dealNumber: 'D-153418', clientName: 'ГК «Эталон-Сити»', assigneeName: 'Орлова Е. В.', isMine: false },
  { taskId: 'T-2003', title: 'Проверить анкету клиента', priorityCode: 'LOW', statusCode: 'NEW', dueDate: '2026-10-13', createdDate: '2026-10-08', dealNumber: null, clientName: 'АО «СтройАтомКомплекс»', assigneeName: 'Белов И. А.', isMine: false },
  { taskId: 'T-2004', title: 'Обновить модель денежных потоков', priorityCode: 'MEDIUM', statusCode: 'IN_PROGRESS', dueDate: '2026-10-09', createdDate: '2026-10-04', dealNumber: 'D-160231', clientName: 'АО «Урал-Инвест»', assigneeName: 'Зуев Р. Р.', isMine: false }
];

/** Подписи кодов TaskPriorityCode для интерфейса. @type {Record<TaskPriorityCode, string>} */
window.TASK_PRIORITY_LABELS = { HIGH: 'Высокий', MEDIUM: 'Средний', LOW: 'Низкий' };

/** Подписи кодов TaskStatusCode для интерфейса. @type {Record<TaskStatusCode, string>} */
window.TASK_STATUS_LABELS = { NEW: 'Новая', IN_PROGRESS: 'В работе', DONE: 'Выполнена' };

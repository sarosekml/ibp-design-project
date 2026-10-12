/* =========================================================================
   tasks.js — задачи демо-данных концепта ibp-redesign-v1.

   Формат номера — 169437 (как в системе). Связанный объект каждой задачи
   существует в демо-данных (потенциал, сделка или встреча). У задач со
   статусом «Ожидает исполнения» доступны действия «Исполнить»,
   «Переназначить», «Отменить» (Р7). История — для предпросмотра (§4.10).
   Source: invented (10.10.2026).
   ========================================================================= */

/**
 * Задача.
 * Source: invented (10.10.2026) — заменить полями DTO, когда появится контракт.
 * @typedef {Object} TaskRsDto
 * @property {number} id                номер задачи (169437)
 * @property {string} clientId          CRM ID клиента
 * @property {string} clientName        клиент
 * @property {string} holdingName       холдинг
 * @property {string} name              название
 * @property {string} description       описание задачи
 * @property {TaskStatusCode} statusCode статус
 * @property {PriorityCode} priorityCode приоритет
 * @property {string} dueDate           срок исполнения (ISO)
 * @property {string} type              тип задачи
 * @property {string} category          категория
 * @property {string} executorId        исполнитель (employeeId)
 * @property {string} createdAt         дата создания (ISO)
 * @property {string} initiatorId       инициатор (employeeId)
 * @property {{typeCode:string,typeLabel:string,number:string,name:string,page:string,params:string}} linkedObject связанный объект
 * @property {{date:string,event:string,name:string,statusCode:TaskStatusCode,description:string,priorityCode:PriorityCode}[]} history история
 * @property {{authorId:string,time:string,date:string,text:string}[]} comments комментарий предпросмотра
 * @property {boolean} isMine           моя задача (вкладка «Мои задачи»)
 */

(function () {
  'use strict';

  var CLIENTS = window.MOCK_CLIENTS;
  var LIDS = window.DICT_FILLER_LEAD_IDS;

  var NAMES = ['Подготовить расчёт структуры сделки', 'Запросить обновлённую отчётность', 'Согласовать залоговую базу с рисками', 'Обновить презентацию для ПИК', 'Проверить документы по сделке', 'Согласовать график платежей', 'Подготовить выписку из ЕГРЮЛ', 'Обновить модель денежных потоков', 'Согласовать One Pager', 'Проверить страхование предмета залога'];

  function history(t) {
    return [
      { date: t.createdAt, event: 'Создание', name: t.name, statusCode: 'PENDING_EXECUTION', description: t.description, priorityCode: t.priorityCode },
      { date: '2026-10-05', event: 'Назначение исполнителя', name: t.name, statusCode: 'PENDING_EXECUTION', description: t.description, priorityCode: t.priorityCode }
    ];
  }

  function mkTask(o) {
    var c = CLIENTS[o.clientIdx % CLIENTS.length];
    var linked;
    if (o.linkType === 'DEAL') {
      linked = { typeCode: 'DEALS', typeLabel: 'Сделки', number: String(129000 + o.i * 2), name: 'Расширение производства', page: 'opportunity', params: 'source=pipeline&id=' + (129000 + o.i * 2) + '&tab=my-desk' };
    } else if (o.linkType === 'MEETING') {
      linked = { typeCode: 'MEETINGS', typeLabel: 'Встречи', number: 'M-9' + String(100 + o.i * 3), name: 'Встреча с клиентом', page: 'meetings', params: 'id=M-9' + String(100 + o.i * 3) };
    } else {
      linked = { typeCode: 'POTENTIALS', typeLabel: 'Потенциалы', number: LIDS[(o.i * 2) % LIDS.length], name: 'Идея сделки: финансирование развития', page: 'potential', params: 'id=' + LIDS[(o.i * 2) % LIDS.length] };
    }
    var t = {
      id: o.id,
      clientId: c.id, clientName: c.name, holdingName: c.holdingName,
      name: NAMES[(o.i * 3 + o.clientIdx) % NAMES.length],
      description: 'Задача по проработке сделки: собрать недостающие документы и согласовать позиции с подразделениями банка.',
      statusCode: o.statusCode || 'PENDING_EXECUTION',
      priorityCode: ['MAX', 'HIGH', 'MEDIUM', 'LOW'][o.i % 4],
      dueDate: o.dueDate || '2026-10-' + String(5 + o.i % 26).padStart(2, '0'),
      type: ['Другое', 'Встреча', 'Документы', 'Проработка сделки'][o.i % 4],
      category: ['Формирование сделки', 'Клиентский сервис', 'Риски'][o.i % 3],
      executorId: ['04127', '03882', '05204'][o.i % 3],
      createdAt: '2026-09-' + String(1 + o.i % 28).padStart(2, '0'),
      initiatorId: ['02940', '04630', '01855'][o.i % 3],
      linkedObject: linked,
      history: [], comments: [], isMine: o.i % 3 !== 2
    };
    t.history = history(t);
    return t;
  }

  var tasks = [];

  /* ── Герой: 169437 — полная карточка предпросмотра (§4.10) ──────────── */
  var zarya = CLIENTS[3];
  tasks.push({
    id: 169437,
    clientId: zarya.id, clientName: zarya.name, holdingName: zarya.holdingName,
    name: 'Подготовить финансовую модель модернизации мукомольной линии',
    description: 'Собрать модель денежных потоков по проекту модернизации: CAPEX 850 млн RUB, срок 24 мес. Согласовать предпосылки с финансовым директором клиента.',
    statusCode: 'PENDING_EXECUTION', priorityCode: 'HIGH',
    dueDate: '2026-10-20', type: 'Проработка сделки', category: 'Формирование сделки',
    executorId: '04127', createdAt: '2026-10-01', initiatorId: '02940',
    linkedObject: { typeCode: 'POTENTIALS', typeLabel: 'Потенциалы', number: 'L-118846', name: 'Модернизация мукомольной линии', page: 'potential', params: 'id=L-118846' },
    history: [
      { date: '2026-10-01', event: 'Создание', name: 'Подготовить финансовую модель модернизации мукомольной линии', statusCode: 'PENDING_EXECUTION', description: 'Задача создана по итогам встречи с клиентом.', priorityCode: 'HIGH' },
      { date: '2026-10-04', event: 'Комментарий', name: 'Подготовить финансовую модель модернизации мукомольной линии', statusCode: 'PENDING_EXECUTION', description: 'Получены предпосылки от клиента, начало сборки модели.', priorityCode: 'HIGH' },
      { date: '2026-10-07', event: 'Изменение срока', name: 'Подготовить финансовую модель модернизации мукомольной линии', statusCode: 'PENDING_EXECUTION', description: 'Срок перенесён с 13.10 на 20.10 по запросу клиента.', priorityCode: 'HIGH' }
    ],
    comments: [
      { authorId: '04127', time: '12:40', date: '2026-10-07', text: 'Срок сдвинут на 20.10: клиент досылает данные по выручке помесячно.' }
    ],
    isMine: true
  });

  /* Задачи повестки встречи M-8904 (карточки в предпросмотре) */
  tasks.push({
    id: 169440,
    clientId: zarya.id, clientName: zarya.name, holdingName: zarya.holdingName,
    name: 'Согласовать структуру финансирования с ДКК',
    description: 'Презентовать предварительную структуру: инвестиционный кредит + мезонин.',
    statusCode: 'PENDING_EXECUTION', priorityCode: 'MAX',
    dueDate: '2026-10-18', type: 'Проработка сделки', category: 'Формирование сделки',
    executorId: '04127', createdAt: '2026-10-02', initiatorId: '02940',
    linkedObject: { typeCode: 'POTENTIALS', typeLabel: 'Потенциалы', number: 'L-118846', name: 'Модернизация мукомольной линии', page: 'potential', params: 'id=L-118846' },
    history: [], comments: [], isMine: true
  });
  tasks.push({
    id: 169442,
    clientId: zarya.id, clientName: zarya.name, holdingName: zarya.holdingName,
    name: 'Запросить перечень залогового оборудования',
    description: 'Получить от клиента перечень оборудования с балансовой и оценочной стоимостью.',
    statusCode: 'DONE', priorityCode: 'MEDIUM',
    dueDate: '2026-10-10', type: 'Документы', category: 'Формирование сделки',
    executorId: '03882', createdAt: '2026-10-02', initiatorId: '04127',
    linkedObject: { typeCode: 'POTENTIALS', typeLabel: 'Потенциалы', number: 'L-118846', name: 'Модернизация мукомольной линии', page: 'potential', params: 'id=L-118846' },
    history: [], comments: [], isMine: true
  });

  /* Статусы-примеры: ADJUSTMENT_REQUIRED (на снимке у одной строки сырой код —
     показываем подпись, ТЗ §3), DONE, CANCELLED */
  tasks.push(mkTask({ id: 169333, clientIdx: 0, i: 1, statusCode: 'ADJUSTMENT_REQUIRED', dueDate: '2026-10-12', linkType: 'DEAL' }));
  tasks.push(mkTask({ id: 169334, clientIdx: 5, i: 5, statusCode: 'DONE', dueDate: '2026-09-30', linkType: 'POTENTIAL' }));
  tasks.push(mkTask({ id: 169335, clientIdx: 8, i: 9, statusCode: 'CANCELLED', dueDate: '2026-09-28', linkType: 'MEETING' }));

  /* Заполнители реестра */
  for (var i = 0; i < 14; i++) {
    tasks.push(mkTask({
      id: 169200 + i * 7,
      clientIdx: i + 1,
      i: i,
      statusCode: i % 6 === 5 ? 'DONE' : (i % 6 === 3 ? 'ADJUSTMENT_REQUIRED' : 'PENDING_EXECUTION'),
      linkType: i % 3 === 0 ? 'POTENTIAL' : (i % 3 === 1 ? 'DEAL' : 'MEETING')
    }));
  }

  /** @type {TaskRsDto[]} */
  window.MOCK_TASKS = tasks;
})();

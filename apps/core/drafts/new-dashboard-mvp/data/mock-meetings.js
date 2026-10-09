/* =========================================================================
   Встречи с клиентами — демо-данные прототипа (window.MOCK_MEETINGS).

   Обычный <script>, а не JSON: страницы открываются по file://. Подключается
   до data/home-store.js: <script src="../data/mock-meetings.js"></script>.

   «Сегодня» прототипа — 09.10.2026 (пятница), см. HomeStore.today. Встречи
   сотрудника помечены isMine; «встречи моего деска» — все встречи деска,
   свои в том числе. Названия клиентов вымышлены.
   ========================================================================= */

/**
 * Встреча с клиентом.
 * Source: invented (09.10.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} MeetingRsDto
 * @property {string} meetingId          идентификатор встречи
 * @property {string} clientName         клиент — компания или группа
 * @property {string} topic              тема встречи
 * @property {string} startDateTime      начало, ISO без часового пояса (2026-10-09T09:30)
 * @property {string} endDateTime        окончание, ISO
 * @property {string} organizerName      ответственный сотрудник, «Фамилия И. О.»
 * @property {MeetingStatusCode} statusCode статус встречи
 * @property {boolean} isMine            сотрудник — организатор или участник
 */

/**
 * Статус встречи.
 * Source: invented (09.10.2026).
 * @typedef {'SCHEDULED'|'NEEDS_ATTENTION'|'PROTOCOL_DONE'|'CANCELLED'} MeetingStatusCode
 */

/** @type {MeetingRsDto[]} */
window.MOCK_MEETINGS = [
  { meetingId: 'M-0101', clientName: 'ГК «Волга Тех»', topic: 'Ковенанты на горизонте трёх лет', startDateTime: '2026-10-09T09:30', endDateTime: '2026-10-09T10:30', organizerName: 'Ким А. С.', statusCode: 'PROTOCOL_DONE', isMine: true },
  { meetingId: 'M-0102', clientName: 'АО «Урал-Инвест»', topic: 'Условия рефинансирования', startDateTime: '2026-10-09T14:00', endDateTime: '2026-10-09T15:00', organizerName: 'Ким А. С.', statusCode: 'NEEDS_ATTENTION', isMine: true },
  { meetingId: 'M-0108', clientName: 'ООО «Сима-Опт»', topic: 'Созвон по лимиту на оборотное кредитование', startDateTime: '2026-10-09T17:00', endDateTime: '2026-10-09T17:30', organizerName: 'Ким А. С.', statusCode: 'SCHEDULED', isMine: true },
  { meetingId: 'M-0103', clientName: 'АО «СтройАтомКомплекс»', topic: 'Знакомство с новым финансовым директором', startDateTime: '2026-10-10T11:00', endDateTime: '2026-10-10T12:00', organizerName: 'Зуев Р. Р.', statusCode: 'SCHEDULED', isMine: true },
  { meetingId: 'M-0104', clientName: 'ООО «ДомСтрой Сибирь»', topic: 'Проектное финансирование второй очереди', startDateTime: '2026-10-12T10:00', endDateTime: '2026-10-12T11:00', organizerName: 'Ким А. С.', statusCode: 'SCHEDULED', isMine: true },
  { meetingId: 'M-0105', clientName: 'ПАО «Трубная группа»', topic: 'График погашения по траншу', startDateTime: '2026-10-13T15:30', endDateTime: '2026-10-13T16:30', organizerName: 'Ким А. С.', statusCode: 'SCHEDULED', isMine: true },
  { meetingId: 'M-0106', clientName: 'ООО «Сима-Опт»', topic: 'Лимит на оборотное кредитование', startDateTime: '2026-10-14T12:00', endDateTime: '2026-10-14T13:00', organizerName: 'Зуев Р. Р.', statusCode: 'SCHEDULED', isMine: true },
  { meetingId: 'M-0107', clientName: 'ООО «ДомСтрой Сибирь»', topic: 'Итоги due diligence', startDateTime: '2026-10-16T16:00', endDateTime: '2026-10-16T17:00', organizerName: 'Ким А. С.', statusCode: 'SCHEDULED', isMine: true },
  { meetingId: 'M-0201', clientName: 'ПАО «СибМеталл»', topic: 'Материалы к КПКИ', startDateTime: '2026-10-09T12:00', endDateTime: '2026-10-09T13:00', organizerName: 'Орлова Е. В.', statusCode: 'SCHEDULED', isMine: false },
  { meetingId: 'M-0202', clientName: 'АО «Платформа»', topic: 'Прогноз P&L на 2027 год', startDateTime: '2026-10-09T16:30', endDateTime: '2026-10-09T17:30', organizerName: 'Зуев Р. Р.', statusCode: 'NEEDS_ATTENTION', isMine: false },
  { meetingId: 'M-0203', clientName: 'ПАО «СибМеталл»', topic: 'Структура сделки', startDateTime: '2026-10-11T10:00', endDateTime: '2026-10-11T11:00', organizerName: 'Белов И. А.', statusCode: 'SCHEDULED', isMine: false },
  { meetingId: 'M-0204', clientName: 'АО «Платформа»', topic: 'Отчётность за 9 месяцев', startDateTime: '2026-10-15T11:30', endDateTime: '2026-10-15T12:30', organizerName: 'Орлова Е. В.', statusCode: 'NEEDS_ATTENTION', isMine: false },
  { meetingId: 'M-0205', clientName: 'ГК «Эталон-Сити»', topic: 'Коммерческое предложение', startDateTime: '2026-10-20T14:00', endDateTime: '2026-10-20T15:00', organizerName: 'Белов И. А.', statusCode: 'SCHEDULED', isMine: false }
];

/** Подписи кодов MeetingStatusCode для интерфейса. @type {Record<MeetingStatusCode, string>} */
window.MEETING_STATUS_LABELS = {
  SCHEDULED: 'Встреча назначена',
  NEEDS_ATTENTION: 'Требует внимания',
  PROTOCOL_DONE: 'Протокол заполнен',
  CANCELLED: 'Отменена'
};

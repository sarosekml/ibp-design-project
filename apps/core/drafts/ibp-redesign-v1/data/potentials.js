/* =========================================================================
   potentials.js — лиды демо-данных концепта ibp-redesign-v1.

   Во фронтенде и API лид — «потенциал» (PotentialPage, «Команда потенциала»,
   связанные объекты «Потенциалы L-…»); в интерфейсе раздела — «Лид». Здесь
   сущность одна: kind = did | cm | binding | possible | rd задаёт реестр
   (MS0014 §6.1). Формат ID: лид «L-44», продажа «LD-12345».
   Source: invented (10.10.2026).
   ========================================================================= */

/**
 * Лид (потенциал).
 * Source: invented (10.10.2026) — заменить полями DTO, когда появится контракт.
 * @typedef {Object} PotentialRsDto
 * @property {string} id                 ID лида (L-44) или продажи (LD-12345)
 * @property {LeadKindCode} kind         вид лида — реестр показа
 * @property {string} clientId           CRM ID клиента
 * @property {string} clientName         клиент
 * @property {string} holdingName        холдинг
 * @property {string} inn                ИНН
 * @property {boolean} growthCompany     «Компания роста»
 * @property {boolean} didGrowthCompany  «Компания роста ДИД»
 * @property {boolean} topClient         «Топ клиент»
 * @property {boolean} keyClient         «Ключевой клиент» (Да/Нет)
 * @property {string} priorityQuarter    приоритет на квартал РД («Q2 2026»)
 * @property {string} industry           отрасль
 * @property {string} macro              макроотрасль
 * @property {string} sub                подотрасль
 * @property {string} segment            сегмент
 * @property {LeadStatusCode} statusCode статус
 * @property {string} idea               идея сделки
 * @property {string} createdAt          дата создания (ISO)
 * @property {string} lastActivityAt     дата последней активности (ISO)
 * @property {Object[]} products         продукты (карточки, как у сделки)
 * @property {{analystIds:string[],directorId:string,vpId:string,regionalDirectorId:string}} team команда потенциала
 * @property {{deskId:string,roleLabel:string}[]} desks  дески
 * @property {{authorId:string,time:string,date:string,text:string}[]} comments комментарии
 * @property {string[]} meetingIds       встречи лида (ID из meetings.js)
 * @property {Object|null} related       связанные сущности (null — «Нет связанных сущностей»)
 * @property {string|null} createdDealId сделка, созданная из лида (MS0015, заведено впрок)
 * @property {string} createdBy          кем создан (employeeId; заведено впрок для MS0015)
 */

(function () {
  'use strict';

  var CLIENTS = window.MOCK_CLIENTS;
  var IDEAS = ['Финансирование расширения производства', 'Рефинансирование текущего долга', 'Оборотное финансирование под контракты', 'Инвестиционная программа модернизации', 'Приобретение бизнес-актива', 'Проектное финансирование новой площадки', 'Программа энергоэффективности', 'Финансирование канала сбыта', 'Зелёная модернизация производства', 'Цифровая платформа для клиентов холдинга'];

  function mkLead(o) {
    var c = CLIENTS[o.clientIdx % CLIENTS.length];
    return {
      id: o.id, kind: o.kind,
      clientId: c.id, clientName: c.name, holdingName: c.holdingName, inn: c.inn,
      growthCompany: c.growthCompany || o.i % 4 === 0,
      didGrowthCompany: c.didGrowthCompany || o.i % 6 === 0,
      topClient: c.topClient && o.i % 3 !== 0,
      keyClient: c.keyClient || o.i % 7 === 0,
      priorityQuarter: ['Q2 2026', 'Q3 2026', 'Q4 2026'][o.i % 3],
      industry: c.industry, macro: c.macro, sub: c.sub, segment: c.segment,
      statusCode: 'WORK',
      idea: IDEAS[(o.i + o.clientIdx) % IDEAS.length],
      createdAt: '2026-0' + (5 + o.i % 5) + '-' + String(1 + (o.i * 3) % 27).padStart(2, '0'),
      lastActivityAt: '2026-10-0' + (1 + o.i % 9),
      products: o.products || [],
      team: { analystIds: ['04127'], directorId: '02940', vpId: '01855', regionalDirectorId: '01203' },
      desks: [{ deskId: 'D-SMB-NR6', roleLabel: 'Ответственный' }, { deskId: 'D-DID-CTR', roleLabel: 'Инициатор' }],
      comments: [], meetingIds: o.meetingIds || [], related: null,
      createdDealId: null, createdBy: ['04127', '03882', '05204'][o.i % 3]
    };
  }

  var leads = [];

  /* ── Герои ───────────────────────────────────────────────────────────── */
  /* L-44 — лид со снимка (§4.6): без продуктов, без связей. */
  var romashka = CLIENTS[0];
  leads.push({
    id: 'L-44', kind: 'did',
    clientId: romashka.id, clientName: romashka.name, holdingName: romashka.holdingName, inn: romashka.inn,
    growthCompany: true, didGrowthCompany: true, topClient: true, keyClient: true,
    priorityQuarter: 'Q4 2026', industry: romashka.industry, macro: romashka.macro, sub: romashka.sub,
    segment: romashka.segment, statusCode: 'WORK',
    idea: 'Вторая очередь тепличного комплекса: инвестиционное финансирование 2,4 млрд RUB под поручительство ГК.',
    createdAt: '2026-09-21', lastActivityAt: '2026-10-09',
    products: [],
    team: { analystIds: ['04127', '03882'], directorId: '02940', vpId: '01855', regionalDirectorId: '01203' },
    desks: [{ deskId: 'D-SMB-NR6', roleLabel: 'Ответственный' }, { deskId: 'D-DID-CTR', roleLabel: 'Инициатор' }],
    comments: [
      { authorId: '04127', time: '10:15', date: '2026-10-01', text: 'Идея подтверждена страт. диалогом. Готовлю расчёт структуры к встрече с ДКК.' }
    ],
    meetingIds: [], related: null, createdDealId: null, createdBy: '04127'
  });

  /* L-118846 — источник встречи M-8904 (сценарий панели «Встреча родила лид»). */
  leads.push({
    id: 'L-118846', kind: 'did',
    clientId: '3000020011', clientName: 'ООО «Заря Агро»', holdingName: 'ГК «АгроСоюз»', inn: '6652334455',
    growthCompany: true, didGrowthCompany: true, topClient: true, keyClient: false,
    priorityQuarter: 'Q4 2026', industry: 'Производство пищевых продуктов', macro: 'Агропромышленный комплекс',
    sub: 'Мукомольные изделия', segment: 'Крупный бизнес', statusCode: 'WORK',
    idea: 'Модернизация мукомольной линии: 850 млн RUB, срок окупаемости 5 лет.',
    createdAt: '2026-08-14', lastActivityAt: '2026-10-07',
    products: [],
    team: { analystIds: ['03882'], directorId: '02941', vpId: '01855', regionalDirectorId: '01203' },
    desks: [{ deskId: 'D-SMB-NR6', roleLabel: 'Ответственный' }],
    comments: [], meetingIds: ['M-8904'], related: null, createdDealId: null, createdBy: '03882'
  });

  /* L-12345 — лид из блока «Связи» предпросмотра встречи клиента. */
  leads.push({
    id: 'L-12345', kind: 'did',
    clientId: '3000012346', clientName: 'ООО «Ландыш»', holdingName: 'ГК «Цветы»', inn: '7712345701',
    growthCompany: true, didGrowthCompany: true, topClient: false, keyClient: false,
    priorityQuarter: 'Q3 2026', industry: 'Сельское хозяйство', macro: 'Агропромышленный комплекс',
    sub: 'Растениеводство', segment: 'Крупный бизнес', statusCode: 'WORK',
    idea: 'Финансирование посадочного материала под расширение площадей на 40 га.',
    createdAt: '2026-09-02', lastActivityAt: '2026-10-03',
    products: [],
    team: { analystIds: ['05204'], directorId: '02940', vpId: '01855', regionalDirectorId: '01203' },
    desks: [{ deskId: 'D-SMB-NR6', roleLabel: 'Ответственный' }],
    comments: [], meetingIds: [], related: null, createdDealId: null, createdBy: '05204'
  });

  /* ── Заполнители: «Лиды ДИД» по общему списку ID из dictionaries.js ──── */
  window.DICT_FILLER_LEAD_IDS.forEach(function (lid, i) {
    leads.push(mkLead({ id: lid, kind: 'did', clientIdx: i + 3, i: i }));
  });

  /* «Лиды для КМ» */
  for (var cm = 0; cm < 8; cm++) {
    leads.push(mkLead({ id: 'L-2' + String(200 + cm * 7), kind: 'cm', clientIdx: cm + 1, i: cm + 2 }));
  }

  /* «Потенциалы ДИД в ТБ. Потенциалы РД.» (вкладка «Сделки → Лиды» клиента) */
  for (var rd = 0; rd < 6; rd++) {
    leads.push(mkLead({ id: 'L-3' + String(300 + rd * 11), kind: 'rd', clientIdx: rd * 2, i: rd + 1 }));
  }

  /* Обязательные лиды (продажи LD-…) и возможные лиды */
  for (var b = 0; b < 22; b++) {
    leads.push(mkLead({ id: 'LD-' + (12300 + b * 3), kind: 'binding', clientIdx: b, i: b }));
  }
  for (var p = 0; p < 22; p++) {
    leads.push(mkLead({ id: 'LD-' + (22200 + p * 3), kind: 'possible', clientIdx: p + 2, i: p + 1 }));
  }

  /** @type {PotentialRsDto[]} */
  window.MOCK_POTENTIALS = leads;
})();

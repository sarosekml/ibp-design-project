/* =========================================================================
   ФИ расчета FV — демо-данные (window.MOCK_FV_CALCULATION_ITEMS).

   Обычный <script> (file://). Подключается после fv-dictionaries.js:
   <script src="../data/fv-calculation-items.js"></script>.
   Это ФИ ОДНОГО расчета-образца; статус расчета и роль — параметры демо
   экрана, строки показывают все статусы ФИ и инструментов сразу.
   Названия ФИ разные («1. Кредитный мезонин» — один из вариантов).
   Значения — рыба, имена и типы держатся.
   ========================================================================= */

/**
 * Пользовательская правка поля ФИ: значение пользователя лежит в самом поле
 * ФИ, расчётное — здесь (для тултипа «Исправлено. Расчетное значение: …»
 * и кнопки сброса в окне ФИ).
 * Source: invented (08.10.2026).
 * @typedef {Object} FvEditedFieldRsDto
 * @property {'rating'|'lgd'|'reserveRate'|'individualReserveRate'|'comment'} fieldCode поле
 * @property {number|string|null} calculatedValue расчетное значение
 */

/**
 * Инструмент в составе ФИ с XML-файлом.
 * Source: invented (08.10.2026).
 * @typedef {Object} FvInstrumentRsDto
 * @property {string} instrumentCode          код инструмента (1.1.1.1)
 * @property {string} instrumentName          подпись чипа: у ФИ типа «Кредит» — «Транш», у ФИ типа «Акции» — «Акция»
 * @property {import('./fv-dictionaries.js').FvItemStatusCode} statusCode статус инструмента
 * @property {import('./fv-dictionaries.js').FvXmlFileStateCode} xmlFileStateCode состояние XML-файла
 * @property {number|null} fvAmount           рассчитанное FV инструмента в валюте (только у «Рассчитан»)
 * @property {string|null} errorText          текст ошибки LP (для RETURNED_FROM_LP / ERROR)
 */

/**
 * ФИ расчета FV (строка таблицы расчета).
 * Source: invented (08.10.2026).
 * @typedef {Object} FvCalculationItemRsDto
 * @property {number} rowNumber               колонка «№»
 * @property {string} itemId                  идентификатор ФИ
 * @property {import('./fv-dictionaries.js').FvItemStatusCode} statusCode статус ФИ
 * @property {number} dealNumber              номер сделки
 * @property {string} dealName                наименование сделки
 * @property {string} itemTypeName            тип ФИ
 * @property {string} itemName                наименование ФИ
 * @property {string} balanceName             баланс ФИ
 * @property {string} currencyCode            валюта ФИ (код ISO 4217)
 * @property {boolean} sendToLp               «Передавать в LP»
 * @property {string} counterpartyName        контрагент
 * @property {string} counterpartyInn         ИНН контрагента
 * @property {string} crmId                   CRM ID
 * @property {string} firstIssueDate          дата первой выдачи
 * @property {string} maturityDate            действующая дата погашения
 * @property {number|null} fvAmount           итоговое FV в валюте
 * @property {number|null} prevFvAmount       FV за прошлый период в валюте
 * @property {number|null} deltaFvAmount      Δ FV в валюте
 * @property {number|null} uploadedFvAmount   загруженная FV в валюте
 * @property {number|null} rating             рейтинг при расчете
 * @property {number|null} lgd                LGD, %
 * @property {number|null} reserveRate        ставка резерва, %
 * @property {number|null} individualReserveRate индивидуальная ставка резерва ПАО, %
 * @property {number|null} vbsAmount          ВВС в валюте
 * @property {string|null} vbsDate            дата ВВС
 * @property {number|null} curveShiftFvAmount     изм. FV, объясненное сдвигом % кривых
 * @property {number|null} creditCurveShiftFvAmount изм. FV, объясненное сдвигом кредитных кривых
 * @property {number|null} ratingLgdShiftFvAmount изм. FV, объясненное изм. рейтингов/LGD/ставки резерва
 * @property {number|null} currencyFvAmount   изм. FV, объясненное изм. валюты
 * @property {number|null} unexplainedFvAmount изм. FV, необъясненная составляющая
 * @property {string} comment                 комментарий
 * @property {FvEditedFieldRsDto[]} editedFields поля, правленные пользователем (маркер `.tc--edited`)
 * @property {FvInstrumentRsDto[]} instruments инструменты в составе ФИ
 */

(function () {
  var COMMENT = 'В Своде выгрузке с Праймом! Получайте наш новый отчёт';

  function inst(code, name, statusCode, xmlFileStateCode, errorText) {
    return {
      instrumentCode: code, instrumentName: name, statusCode: statusCode, xmlFileStateCode: xmlFileStateCode,
      fvAmount: statusCode === 'CALCULATED' ? 900800900.00 : null, errorText: errorText || null
    };
  }

  /* Базовая строка; отличия — в переданных полях. */
  function item(n, over) {
    var base = {
      rowNumber: n, itemId: 'FI-' + (1000 + n), statusCode: 'FORMED',
      dealNumber: 123456789, dealName: 'РогаКопыта', itemTypeName: 'Кредит',
      itemName: '1. Кредитный мезонин', balanceName: 'ООО «СБИ»', currencyCode: 'RUB', sendToLp: true,
      counterpartyName: 'ООО «Рога и копыта»', counterpartyInn: '1234567890', crmId: '1-1FFR',
      firstIssueDate: '2024-01-21', maturityDate: '2024-01-21',
      fvAmount: null, prevFvAmount: 900800900.00, deltaFvAmount: null, uploadedFvAmount: null,
      rating: 25, lgd: 80, reserveRate: 80, individualReserveRate: 80,
      vbsAmount: 900800900.00, vbsDate: '2024-01-21',
      curveShiftFvAmount: 1490800900.00, creditCurveShiftFvAmount: 900800900.00,
      ratingLgdShiftFvAmount: 900800900.00, currencyFvAmount: 900800900.00, unexplainedFvAmount: 900800900.00,
      comment: COMMENT, editedFields: [],
      instruments: [inst('1.1.1.1', 'Транш', 'FORMED', 'GENERATED'), inst('1.2.1.1', 'Транш', 'FORMED', 'GENERATED')]
    };
    Object.keys(over).forEach(function (k) { base[k] = over[k]; });
    return base;
  }

  /** @type {FvCalculationItemRsDto[]} */
  window.MOCK_FV_CALCULATION_ITEMS = [
    item(168, { itemName: '1. Кредитный мезонин',
      editedFields: [{ fieldCode: 'rating', calculatedValue: 67 }, { fieldCode: 'lgd', calculatedValue: 72 }] }),
    item(169, { itemName: '2. Синдицированный кредит', dealNumber: 123456790, dealName: 'Горизонт', itemTypeName: 'Кредит',
      counterpartyName: 'АО «Вектор»', counterpartyInn: '7701234567', crmId: '1-2GHT', sendToLp: false,
      editedFields: [{ fieldCode: 'reserveRate', calculatedValue: 74 }],
      instruments: [inst('1.1.1.1', 'Транш', 'FORMED', 'UPLOADED'), inst('1.2.1.1', 'Транш', 'FORMED', 'GENERATED')] }),
    item(170, { statusCode: 'ERROR', itemName: '3. Револьверный кредит', dealNumber: 123456791, dealName: 'Северный путь', itemTypeName: 'Кредит',
      counterpartyName: 'ПАО «Север»', counterpartyInn: '7802345678', crmId: '1-3SVR',
      fvAmount: 900800900.00, deltaFvAmount: 900800900.00,
      instruments: [inst('1.1.1.1', 'Транш', 'RETURNED_FROM_LP', 'UPLOADED', 'LP: не пройдена проверка структуры файла (строка 14)'), inst('1.2.1.1', 'Транш', 'CALCULATED', 'GENERATED')] }),
    item(171, { statusCode: 'ERROR', itemName: '4. Пакет акций', dealNumber: 123456792, dealName: 'Ладога', itemTypeName: 'Акции',
      counterpartyName: 'ООО «Ладога-Инвест»', counterpartyInn: '7803456789', crmId: '1-4LDG',
      instruments: [inst('1.1.1.1', 'Акция', 'ERROR', 'UPLOADED', 'Файл возвращён пользователем на доработку'), inst('1.2.1.1', 'Акция', 'FORMED', 'GENERATED')] }),
    item(172, { statusCode: 'SENT_TO_LP', itemName: '5. Кредитная линия', dealNumber: 123456793, dealName: 'Прометей', itemTypeName: 'Кредит',
      counterpartyName: 'ООО «Прометей»', counterpartyInn: '7704567890', crmId: '1-5PRM',
      instruments: [inst('1.1.1.1', 'Транш', 'SENT_TO_LP', 'UPLOADED'), inst('1.2.1.1', 'Транш', 'SENT_TO_LP', 'GENERATED')] }),
    item(173, { statusCode: 'CALCULATING_LP', itemName: '6. Овердрафт', dealNumber: 123456794, dealName: 'Меридиан', itemTypeName: 'Кредит',
      counterpartyName: 'АО «Меридиан»', counterpartyInn: '7705678901', crmId: '1-6MRD',
      instruments: [inst('1.1.1.1', 'Транш', 'CALCULATING_LP', 'UPLOADED'), inst('1.2.1.1', 'Транш', 'CALCULATING_LP', 'GENERATED')] }),
    item(174, { statusCode: 'CALCULATED', itemName: '7. Синдицированный кредит', dealNumber: 123456795, dealName: 'Арктика', itemTypeName: 'Кредит',
      counterpartyName: 'ООО «Арктика»', counterpartyInn: '7706789012', crmId: '1-7ARK',
      fvAmount: 900800900.00, deltaFvAmount: 0.00, uploadedFvAmount: 900800900.00,
      instruments: [inst('1.1.1.1', 'Транш', 'CALCULATED', 'UPLOADED'), inst('1.2.1.1', 'Транш', 'CALCULATED', 'GENERATED')] }),
    item(175, { statusCode: 'NO_DATA', itemName: '8. Кредитный мезонин', dealNumber: 123456796, dealName: 'Бриз', itemTypeName: 'Кредит',
      counterpartyName: 'ООО «Бриз»', counterpartyInn: '7707890123', crmId: '1-8BRZ',
      instruments: [inst('1.1.1.1', 'Транш', 'NO_DATA', 'DELETED'), inst('1.2.1.1', 'Транш', 'NO_DATA', 'DELETED')] })
  ];
})();

/**
 * Текст XML-файла инструмента для предпросмотра «Данные по инструменту».
 * Заглушка: тестовых файлов нет, окно показывает один и тот же образец.
 * Source: invented (08.10.2026).
 * @type {string}
 */
window.MOCK_FV_INSTRUMENT_XML = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<PrintData>',
  '  <PrinterName/>',
  '  <TemplateName>A4_URL_schtpl</TemplateName>',
  '  <Count>1</Count>',
  '  <Head>',
  '    <Client>SP</Client>',
  '    <Date>02.04.2020 16:38:23</Date>',
  '    <Number>000000018</Number>',
  '    <Barcode>UP|000000018</Barcode>',
  '    <Pack>000000018</Pack>',
  '  </Head>',
  '  <Detail>',
  '    <Item>',
  '      <ArtName>Сыр Рокфор</ArtName>',
  '      <Barcode>2000000000123</Barcode>',
  '    </Item>',
  '  </Detail>',
  '</PrintData>'
].join('\n');

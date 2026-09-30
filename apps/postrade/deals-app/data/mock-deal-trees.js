/* =========================================================================
   Деревья продуктов сделок ДИД (window.MOCK_DEAL_TREES), ключ — id сделки.
   Структура: productsDid[] → products[] → instruments[] → tranches[]
   (транши — только у договора займа). Читает стор дерева
   (product-tree-store.js), таблица портфеля этот файл не грузит.

   Названия и коды узлов — из каталога mock-product-catalog.js, продукт ДИД
   создан со своим обязательным составом. Плоские поля записи в mock-deals.js
   (mainProductDid, productsDidNames, productsNames, balances, currencies,
   isPE) посчитаны из этого дерева формулой ProductTreeStore.summary и
   заморожены там — в проде их считает бэкенд.

   Сделки под стадии макета тайла «Продукты сделки» (29.09.2026):
   – 1035 (Черновик) и 1042 (Активная) — нет данных: правка и просмотр;
   – 1044 (Черновик) — добавлены два продукта ДИД, значения не заполнены;
   – 1026 (Черновик) — добавлены инструменты и транши;
   – 1027 (Корректировка) и 1024 (Активная) — часть инструментов и траншей
     прикреплена к ФИ, есть погашенный инструмент и погашенный транш;
   – 1055 (Черновик) — одиннадцать продуктов ДИД с обязательным составом;
   – 1051 (Черновик) — длинные названия и продукты ДИД без состава.
   Остальные сделки — те же продукты ДИД, что были до каталога, с их
   обязательным составом; валюта, баланс и признак PE перенесены со старых
   инструментов. У 1036 и 1066 в «Корп. контроль для старшего кредита»
   заведён «Корп. договор» с балансом и валютой (ответ человека 30.09.2026:
   у продукта корпоративного контроля бывают инструменты).

   Связь с ФИ — fiIds: id карточек ФИ сделки из mock-fin-instruments.js, не
   больше двух (ответ человека 30.09.2026). Правки дерева, сохранённые на
   странице сделки, живут в PostApi (post-api.js) и перекрывают этот файл.

   Значения — рыба: даты ISO, суммы — числа, валюта — код ISO 4217.
   ========================================================================= */

/**
 * Дерево продуктов сделки.
 * Source: invented (29.09.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} DealProductTreeRsDto
 * @property {number} id                           номер сделки
 * @property {DealProductDidRsDto[]} productsDid   продукты ДИД в порядке номеров
 */

/**
 * Продукт ДИД сделки — корневой узел.
 * Source: invented (29.09.2026).
 * @typedef {Object} DealProductDidRsDto
 * @property {string} id                     идентификатор узла
 * @property {ProductDidCode} code           код из PRODUCT_DID_CATALOG
 * @property {string} name                   название из каталога
 * @property {boolean} isMain                основной продукт ДИД сделки — один на сделку
 * @property {DealProductRsDto[]} products
 */

/**
 * Продукт сделки — входит в продукт ДИД.
 * Source: invented (29.09.2026).
 * @typedef {Object} DealProductRsDto
 * @property {string} id
 * @property {ProductCode} code              код из PRODUCT_CATALOG
 * @property {string} name
 * @property {boolean} isMandatory           продукт из обязательного состава
 *           своего продукта ДИД: обязательный и единственный не удаляется
 * @property {DealInstrumentRsDto[]} instruments
 */

/**
 * Инструмент сделки — входит в продукт.
 * Source: invented (29.09.2026).
 * @typedef {Object} DealInstrumentRsDto
 * @property {string} id
 * @property {InstrumentTypeCode} code       тип из INSTRUMENT_TYPE_CATALOG
 * @property {string} name
 * @property {string|null} currency          код валюты
 * @property {string|null} balance           баланс, на котором учтён инструмент
 * @property {boolean} isPE                  признак PE
 * @property {string|null} signedAt          дата подписания договора
 * @property {number|null} amount            стоимость покупки (акции, дебиторская
 *           задолженность) или цена исполнения (пут и колл РЕПО)
 * @property {string|null} didEntryAt        дата входа ДИД («НКЛ с баланса ПАО»)
 * @property {string|null} didExitAt         дата выхода ДИД («НКЛ с баланса ПАО»)
 * @property {string[]} fiIds                карточки ФИ, к которым прикреплён
 *           инструмент (mock-fin-instruments.js), не больше двух
 * @property {string|null} repaidAt          дата фактического погашения
 * @property {DealTrancheRsDto[]} tranches
 */

/**
 * Транш — входит в договор займа (НКЛ).
 * Source: invented (29.09.2026).
 * @typedef {Object} DealTrancheRsDto
 * @property {string} id
 * @property {string} name
 * @property {string|null} currency
 * @property {string|null} signedAt          дата подписания
 * @property {number|null} amount            сумма лимита
 * @property {string[]} fiIds                карточки ФИ, к которым прикреплён транш,
 *           не больше двух
 * @property {string|null} repaidAt          дата фактического погашения
 */

/** @type {Record<string, DealProductTreeRsDto>} */
window.MOCK_DEAL_TREES = {
  "1024": {
    "id": 1024,
    "productsDid": [
      {
        "id": "1024.d1",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1024.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1024.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1024.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "RUB",
                    "signedAt": "2024-04-22",
                    "amount": 800000,
                    "fiIds": [
                      "FI-1024-1"
                    ],
                    "repaidAt": null
                  },
                  {
                    "id": "1024.d1.p1.i1.t2",
                    "name": "Транш",
                    "currency": "RUB",
                    "signedAt": "2024-04-22",
                    "amount": 800000,
                    "fiIds": [
                      "FI-1024-2"
                    ],
                    "repaidAt": "2025-06-30"
                  }
                ]
              },
              {
                "id": "1024.d1.p1.i2",
                "code": "NCL_PJSC_BALANCE",
                "name": "НКЛ с баланса ПАО",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 800000,
                "didEntryAt": "2024-04-01",
                "didExitAt": "2026-12-31",
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          },
          {
            "id": "1024.d1.p2",
            "code": "CORPORATE_CONTROL",
            "name": "Корп. Контроль",
            "isMandatory": false,
            "instruments": [
              {
                "id": "1024.d1.p2.i1",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": "2025-06-30",
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1024.d2",
        "code": "RESIDENTIAL_EQUITY",
        "name": "Долевое участие в жилой недвижимости",
        "isMain": false,
        "products": [
          {
            "id": "1024.d2.p1",
            "code": "RESIDENTIAL_EQUITY_STAKE",
            "name": "Долевое в ЖН",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1024.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1024-3"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1024.d2.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1025": {
    "id": 1025,
    "productsDid": [
      {
        "id": "1025.d1",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1025.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1025.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "USD",
                "balance": "SBERFIN",
                "isPE": true,
                "signedAt": "2021-02-07",
                "amount": 1500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1025.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "USD",
                    "signedAt": "2021-02-07",
                    "amount": 750000,
                    "fiIds": [],
                    "repaidAt": null
                  },
                  {
                    "id": "1025.d1.p1.i1.t2",
                    "name": "Транш",
                    "currency": "USD",
                    "signedAt": "2021-05-07",
                    "amount": 750000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1025.d2",
        "code": "CORPORATE_CONTROL",
        "name": "Корпоративный контроль",
        "isMain": false,
        "products": [
          {
            "id": "1025.d2.p1",
            "code": "CORPORATE_CONTROL_SENIOR",
            "name": "Корп. контроль для старшего кредита",
            "isMandatory": true,
            "instruments": []
          }
        ]
      }
    ]
  },
  "1026": {
    "id": 1026,
    "productsDid": [
      {
        "id": "1026.d1",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1026.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1026.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "RUB",
                "balance": "СОКОЛ ФИНАНС",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1026.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "RUB",
                    "signedAt": "2024-04-22",
                    "amount": 800000,
                    "fiIds": [],
                    "repaidAt": null
                  },
                  {
                    "id": "1026.d1.p1.i1.t2",
                    "name": "Транш",
                    "currency": "RUB",
                    "signedAt": "2024-04-22",
                    "amount": 800000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              },
              {
                "id": "1026.d1.p1.i2",
                "code": "NCL_PJSC_BALANCE",
                "name": "НКЛ с баланса ПАО",
                "currency": "RUB",
                "balance": "ТрансКапитал",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 800000,
                "didEntryAt": "2024-04-01",
                "didExitAt": "2026-12-31",
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          },
          {
            "id": "1026.d1.p2",
            "code": "CORPORATE_CONTROL",
            "name": "Корп. Контроль",
            "isMandatory": false,
            "instruments": [
              {
                "id": "1026.d1.p2.i1",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "RUB",
                "balance": "СОКОЛ ФИНАНС",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1026.d2",
        "code": "RESIDENTIAL_EQUITY",
        "name": "Долевое участие в жилой недвижимости",
        "isMain": false,
        "products": [
          {
            "id": "1026.d2.p1",
            "code": "RESIDENTIAL_EQUITY_STAKE",
            "name": "Долевое в ЖН",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1026.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "RUB",
                "balance": "ТрансКапитал",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1026.d2.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "RUB",
                "balance": "СОКОЛ ФИНАНС",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1027": {
    "id": 1027,
    "productsDid": [
      {
        "id": "1027.d1",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1027.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1027.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "RUB",
                "balance": "VPE CAPITAL",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1027.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "RUB",
                    "signedAt": "2024-04-22",
                    "amount": 800000,
                    "fiIds": [
                      "FI-1027-1"
                    ],
                    "repaidAt": null
                  },
                  {
                    "id": "1027.d1.p1.i1.t2",
                    "name": "Транш",
                    "currency": "RUB",
                    "signedAt": "2024-04-22",
                    "amount": 800000,
                    "fiIds": [
                      "FI-1027-2"
                    ],
                    "repaidAt": "2025-06-30"
                  }
                ]
              },
              {
                "id": "1027.d1.p1.i2",
                "code": "NCL_PJSC_BALANCE",
                "name": "НКЛ с баланса ПАО",
                "currency": "RUB",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 800000,
                "didEntryAt": "2024-04-01",
                "didExitAt": "2026-12-31",
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          },
          {
            "id": "1027.d1.p2",
            "code": "CORPORATE_CONTROL",
            "name": "Корп. Контроль",
            "isMandatory": false,
            "instruments": [
              {
                "id": "1027.d1.p2.i1",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "RUB",
                "balance": "VPE CAPITAL",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": "2025-06-30",
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1027.d2",
        "code": "RESIDENTIAL_EQUITY",
        "name": "Долевое участие в жилой недвижимости",
        "isMain": false,
        "products": [
          {
            "id": "1027.d2.p1",
            "code": "RESIDENTIAL_EQUITY_STAKE",
            "name": "Долевое в ЖН",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1027.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "RUB",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1027-3"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1027.d2.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "RUB",
                "balance": "VPE CAPITAL",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1028": {
    "id": 1028,
    "productsDid": [
      {
        "id": "1028.d1",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": true,
        "products": [
          {
            "id": "1028.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1028.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "RUB",
                "balance": "ЮГ ИНВЕСТ",
                "isPE": false,
                "signedAt": "2021-05-29",
                "amount": 3500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1028.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "RUB",
                    "signedAt": "2021-05-28",
                    "amount": 3500000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1028.d2",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1028.d2.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1028.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "USD",
                "balance": "АгроБаланс",
                "isPE": false,
                "signedAt": "2021-05-29",
                "amount": 64000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1028.d2.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "RUB",
                "balance": "ЮГ ИНВЕСТ",
                "isPE": false,
                "signedAt": "2021-05-29",
                "amount": 9800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1029": {
    "id": 1029,
    "productsDid": [
      {
        "id": "1029.d1",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1029.d1.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1029.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2021-07-05",
                "amount": 64000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1029-1"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1029.d1.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "USD",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2021-07-05",
                "amount": 9800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1029-2"
                ],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1030": {
    "id": 1030,
    "productsDid": [
      {
        "id": "1030.d1",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1030.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1030.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "EUR",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2021-08-11",
                "amount": 9800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1030.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "EUR",
                    "signedAt": "2021-08-11",
                    "amount": 9800000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          },
          {
            "id": "1030.d1.p2",
            "code": "CORPORATE_CONTROL",
            "name": "Корп. Контроль",
            "isMandatory": false,
            "instruments": [
              {
                "id": "1030.d1.p2.i1",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "EUR",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2021-08-11",
                "amount": 450000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1031": {
    "id": 1031,
    "productsDid": [
      {
        "id": "1031.d1",
        "code": "CORPORATE_CONTROL",
        "name": "Корпоративный контроль",
        "isMain": true,
        "products": [
          {
            "id": "1031.d1.p1",
            "code": "CORPORATE_CONTROL_SENIOR",
            "name": "Корп. контроль для старшего кредита",
            "isMandatory": true,
            "instruments": []
          }
        ]
      },
      {
        "id": "1031.d2",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": false,
        "products": [
          {
            "id": "1031.d2.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1031.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "JPY",
                "balance": "АгроБаланс",
                "isPE": false,
                "signedAt": "2021-09-17",
                "amount": 450000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1031.d2.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "RUB",
                "balance": "СОКОЛ ФИНАНС",
                "isPE": false,
                "signedAt": "2021-09-17",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1032": {
    "id": 1032,
    "productsDid": [
      {
        "id": "1032.d1",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": true,
        "products": [
          {
            "id": "1032.d1.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1032.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": true,
                "signedAt": "2021-10-24",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1032-1"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1032.d1.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "USD",
                "balance": "VPE CAPITAL",
                "isPE": false,
                "signedAt": "2021-10-24",
                "amount": 1500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1032.d2",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": false,
        "products": [
          {
            "id": "1032.d2.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1032.d2.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2021-10-24",
                "amount": 25000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1032.d2.p1.i1.t1",
                    "name": "Транш",
                    "currency": "RUB",
                    "signedAt": "2021-10-24",
                    "amount": 25000000,
                    "fiIds": [
                      "FI-1032-2"
                    ],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1032.d3",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1032.d3.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1032.d3.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "USD",
                "balance": "VPE CAPITAL",
                "isPE": false,
                "signedAt": "2021-10-24",
                "amount": 120000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1032-3"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1032.d3.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": true,
                "signedAt": "2021-10-24",
                "amount": 3500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1032-4"
                ],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1033": {
    "id": 1033,
    "productsDid": [
      {
        "id": "1033.d1",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": true,
        "products": [
          {
            "id": "1033.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1033.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "USD",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2021-11-30",
                "amount": 1500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1033.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "USD",
                    "signedAt": "2021-11-28",
                    "amount": 1500000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "1034": {
    "id": 1034,
    "productsDid": [
      {
        "id": "1034.d1",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1034.d1.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1034.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "EUR",
                "balance": "СОКОЛ ФИНАНС",
                "isPE": false,
                "signedAt": "2022-01-06",
                "amount": 25000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1034.d1.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "JPY",
                "balance": "ТрансКапитал",
                "isPE": false,
                "signedAt": "2022-01-06",
                "amount": 120000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1034.d2",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1034.d2.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1034.d2.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "EUR",
                "balance": "СОКОЛ ФИНАНС",
                "isPE": false,
                "signedAt": "2022-01-06",
                "amount": 3500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1034.d2.p1.i1.t1",
                    "name": "Транш",
                    "currency": "EUR",
                    "signedAt": "2022-01-06",
                    "amount": 3500000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "1035": {
    "id": 1035,
    "productsDid": []
  },
  "1036": {
    "id": 1036,
    "productsDid": [
      {
        "id": "1036.d1",
        "code": "CORPORATE_CONTROL",
        "name": "Корпоративный контроль",
        "isMain": true,
        "products": [
          {
            "id": "1036.d1.p1",
            "code": "CORPORATE_CONTROL_SENIOR",
            "name": "Корп. контроль для старшего кредита",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1036.d1.p1.i1",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": null,
                "amount": null,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1037": {
    "id": 1037,
    "productsDid": [
      {
        "id": "1037.d1",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": true,
        "products": [
          {
            "id": "1037.d1.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1037.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "USD",
                "balance": "ТрансКапитал",
                "isPE": false,
                "signedAt": "2022-04-27",
                "amount": 64000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1037.d1.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "EUR",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2022-04-27",
                "amount": 9800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1037.d2",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": false,
        "products": [
          {
            "id": "1037.d2.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1037.d2.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "USD",
                "balance": "ТрансКапитал",
                "isPE": false,
                "signedAt": "2022-04-27",
                "amount": 450000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1037.d2.p1.i1.t1",
                    "name": "Транш",
                    "currency": "USD",
                    "signedAt": "2022-04-27",
                    "amount": 450000000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "1038": {
    "id": 1038,
    "productsDid": [
      {
        "id": "1038.d1",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": true,
        "products": [
          {
            "id": "1038.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1038.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "EUR",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2022-06-03",
                "amount": 9800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1038.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "EUR",
                    "signedAt": "2022-06-03",
                    "amount": 9800000,
                    "fiIds": [
                      "FI-1038-1"
                    ],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1038.d2",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1038.d2.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1038.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "JPY",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2022-06-03",
                "amount": 450000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1038-2"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1038.d2.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "EUR",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2022-06-03",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1038-3"
                ],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1038.d3",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1038.d3.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1038.d3.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "JPY",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2022-06-03",
                "amount": 1500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1038.d3.p1.i1.t1",
                    "name": "Транш",
                    "currency": "JPY",
                    "signedAt": "2022-06-03",
                    "amount": 1500000,
                    "fiIds": [
                      "FI-1038-4"
                    ],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "1039": {
    "id": 1039,
    "productsDid": [
      {
        "id": "1039.d1",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1039.d1.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1039.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "JPY",
                "balance": "АгроБаланс",
                "isPE": false,
                "signedAt": "2022-07-10",
                "amount": 450000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1039.d1.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "RUB",
                "balance": "СОКОЛ ФИНАНС",
                "isPE": false,
                "signedAt": "2022-07-10",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1040": {
    "id": 1040,
    "productsDid": [
      {
        "id": "1040.d1",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1040.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1040.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2022-08-16",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1040.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "RUB",
                    "signedAt": "2022-08-16",
                    "amount": 800000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1040.d2",
        "code": "CORPORATE_CONTROL",
        "name": "Корпоративный контроль",
        "isMain": false,
        "products": [
          {
            "id": "1040.d2.p1",
            "code": "CORPORATE_CONTROL_SENIOR",
            "name": "Корп. контроль для старшего кредита",
            "isMandatory": true,
            "instruments": []
          }
        ]
      }
    ]
  },
  "1041": {
    "id": 1041,
    "productsDid": [
      {
        "id": "1041.d1",
        "code": "CORPORATE_CONTROL",
        "name": "Корпоративный контроль",
        "isMain": true,
        "products": [
          {
            "id": "1041.d1.p1",
            "code": "CORPORATE_CONTROL_SENIOR",
            "name": "Корп. контроль для старшего кредита",
            "isMandatory": true,
            "instruments": []
          }
        ]
      },
      {
        "id": "1041.d2",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": false,
        "products": [
          {
            "id": "1041.d2.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1041.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "USD",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2022-09-22",
                "amount": 1500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1041-1"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1041.d2.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "EUR",
                "balance": "ЮГ ИНВЕСТ",
                "isPE": false,
                "signedAt": "2022-09-22",
                "amount": 25000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1041.d3",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": false,
        "products": [
          {
            "id": "1041.d3.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1041.d3.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "USD",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2022-09-22",
                "amount": 120000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1041.d3.p1.i1.t1",
                    "name": "Транш",
                    "currency": "USD",
                    "signedAt": "2022-09-22",
                    "amount": 120000000,
                    "fiIds": [
                      "FI-1041-2"
                    ],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "1042": {
    "id": 1042,
    "productsDid": []
  },
  "1043": {
    "id": 1043,
    "productsDid": [
      {
        "id": "1043.d1",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": true,
        "products": [
          {
            "id": "1043.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1043.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "JPY",
                "balance": "VPE CAPITAL",
                "isPE": false,
                "signedAt": "2022-12-05",
                "amount": 120000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1043.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "JPY",
                    "signedAt": "2022-12-05",
                    "amount": 120000000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1043.d2",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1043.d2.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1043.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "RUB",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2022-12-05",
                "amount": 3500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1043.d2.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "JPY",
                "balance": "VPE CAPITAL",
                "isPE": false,
                "signedAt": "2022-12-05",
                "amount": 64000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1044": {
    "id": 1044,
    "productsDid": [
      {
        "id": "1044.d1",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1044.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1044.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": null,
                "balance": null,
                "isPE": false,
                "signedAt": null,
                "amount": null,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1044.d2",
        "code": "RESIDENTIAL_EQUITY",
        "name": "Долевое участие в жилой недвижимости",
        "isMain": false,
        "products": [
          {
            "id": "1044.d2.p1",
            "code": "RESIDENTIAL_EQUITY_STAKE",
            "name": "Долевое в ЖН",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1044.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": null,
                "balance": null,
                "isPE": false,
                "signedAt": null,
                "amount": null,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1044.d2.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": null,
                "balance": null,
                "isPE": false,
                "signedAt": null,
                "amount": null,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1045": {
    "id": 1045,
    "productsDid": [
      {
        "id": "1045.d1",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1045.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1045.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "USD",
                "balance": "ТрансКапитал",
                "isPE": true,
                "signedAt": "2023-02-17",
                "amount": 64000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1045.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "USD",
                    "signedAt": "2023-02-17",
                    "amount": 32000000,
                    "fiIds": [],
                    "repaidAt": null
                  },
                  {
                    "id": "1045.d1.p1.i1.t2",
                    "name": "Транш",
                    "currency": "USD",
                    "signedAt": "2023-05-17",
                    "amount": 32000000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          },
          {
            "id": "1045.d1.p2",
            "code": "CORPORATE_CONTROL",
            "name": "Корп. Контроль",
            "isMandatory": false,
            "instruments": [
              {
                "id": "1045.d1.p2.i1",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "EUR",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2023-02-17",
                "amount": 9800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1046": {
    "id": 1046,
    "productsDid": [
      {
        "id": "1046.d1",
        "code": "CORPORATE_CONTROL",
        "name": "Корпоративный контроль",
        "isMain": true,
        "products": [
          {
            "id": "1046.d1.p1",
            "code": "CORPORATE_CONTROL_SENIOR",
            "name": "Корп. контроль для старшего кредита",
            "isMandatory": true,
            "instruments": []
          }
        ]
      },
      {
        "id": "1046.d2",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": false,
        "products": [
          {
            "id": "1046.d2.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1046.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "EUR",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2023-03-26",
                "amount": 9800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1046.d2.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "JPY",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2023-03-26",
                "amount": 450000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1047": {
    "id": 1047,
    "productsDid": [
      {
        "id": "1047.d1",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": true,
        "products": [
          {
            "id": "1047.d1.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1047.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "JPY",
                "balance": "АгроБаланс",
                "isPE": false,
                "signedAt": "2023-05-02",
                "amount": 450000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1047-1"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1047.d1.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "RUB",
                "balance": "СОКОЛ ФИНАНС",
                "isPE": false,
                "signedAt": "2023-05-02",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1047.d2",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": false,
        "products": [
          {
            "id": "1047.d2.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1047.d2.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "JPY",
                "balance": "АгроБаланс",
                "isPE": false,
                "signedAt": "2023-05-02",
                "amount": 1500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1047.d2.p1.i1.t1",
                    "name": "Транш",
                    "currency": "JPY",
                    "signedAt": "2023-05-02",
                    "amount": 1500000,
                    "fiIds": [
                      "FI-1047-2"
                    ],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1047.d3",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1047.d3.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1047.d3.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "RUB",
                "balance": "СОКОЛ ФИНАНС",
                "isPE": false,
                "signedAt": "2023-05-02",
                "amount": 25000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1047-3"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1047.d3.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "JPY",
                "balance": "АгроБаланс",
                "isPE": false,
                "signedAt": "2023-05-02",
                "amount": 120000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1047-4"
                ],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1048": {
    "id": 1048,
    "productsDid": [
      {
        "id": "1048.d1",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": true,
        "products": [
          {
            "id": "1048.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1048.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2023-06-08",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1048.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "RUB",
                    "signedAt": "2023-06-08",
                    "amount": 800000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "1049": {
    "id": 1049,
    "productsDid": [
      {
        "id": "1049.d1",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1049.d1.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1049.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "USD",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2023-07-15",
                "amount": 1500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1049.d1.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "EUR",
                "balance": "ЮГ ИНВЕСТ",
                "isPE": false,
                "signedAt": "2023-07-15",
                "amount": 25000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1049.d2",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1049.d2.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1049.d2.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "USD",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2023-07-15",
                "amount": 120000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1049.d2.p1.i1.t1",
                    "name": "Транш",
                    "currency": "USD",
                    "signedAt": "2023-07-15",
                    "amount": 60000000,
                    "fiIds": [],
                    "repaidAt": null
                  },
                  {
                    "id": "1049.d2.p1.i1.t2",
                    "name": "Транш",
                    "currency": "USD",
                    "signedAt": "2023-10-15",
                    "amount": 60000000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "1050": {
    "id": 1050,
    "productsDid": [
      {
        "id": "1050.d1",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1050.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1050.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "EUR",
                "balance": "СОКОЛ ФИНАНС",
                "isPE": false,
                "signedAt": "2023-08-21",
                "amount": 25000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1050.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "EUR",
                    "signedAt": "2023-08-21",
                    "amount": 25000000,
                    "fiIds": [
                      "FI-1050-1"
                    ],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1050.d2",
        "code": "CORPORATE_CONTROL",
        "name": "Корпоративный контроль",
        "isMain": false,
        "products": [
          {
            "id": "1050.d2.p1",
            "code": "CORPORATE_CONTROL_SENIOR",
            "name": "Корп. контроль для старшего кредита",
            "isMandatory": true,
            "instruments": []
          }
        ]
      },
      {
        "id": "1050.d3",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": false,
        "products": [
          {
            "id": "1050.d3.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1050.d3.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "JPY",
                "balance": "ТрансКапитал",
                "isPE": false,
                "signedAt": "2023-08-21",
                "amount": 120000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1050-2"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1050.d3.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "EUR",
                "balance": "СОКОЛ ФИНАНС",
                "isPE": false,
                "signedAt": "2023-08-21",
                "amount": 3500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1051": {
    "id": 1051,
    "productsDid": [
      {
        "id": "1051.d1",
        "code": "SEED_COMPLEX_HOUSING",
        "name": "Начальное финансирование в рамках продукта \"Комплексное жилищное\"",
        "isMain": true,
        "products": []
      },
      {
        "id": "1051.d2",
        "code": "COMPENSATION_AGREEMENT",
        "name": "Соглашение о компенсационных выплатах",
        "isMain": false,
        "products": []
      },
      {
        "id": "1051.d3",
        "code": "INTRAGROUP_LOAN",
        "name": "Внутригрупповой кредит",
        "isMain": false,
        "products": [
          {
            "id": "1051.d3.p1",
            "code": "INTRAGROUP_LOAN",
            "name": "Внутригрупповой кредит",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1051.d3.p1.i1",
                "code": "INTRAGROUP_LOAN_NCL",
                "name": "Внутригрупповой кредит (НКЛ)",
                "currency": "JPY",
                "balance": "VPE CAPITAL",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 120000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1051.d4",
        "code": "PRIVATE_EQUITY",
        "name": "Private Equity",
        "isMain": false,
        "products": [
          {
            "id": "1051.d4.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1051.d4.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "RUB",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 3500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1051.d4.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "JPY",
                "balance": "VPE CAPITAL",
                "isPE": false,
                "signedAt": "2024-04-22",
                "amount": 64000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1052": {
    "id": 1052,
    "productsDid": [
      {
        "id": "1052.d1",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": true,
        "products": [
          {
            "id": "1052.d1.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1052.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "RUB",
                "balance": "ЮГ ИНВЕСТ",
                "isPE": false,
                "signedAt": "2023-11-03",
                "amount": 3500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1052.d1.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "USD",
                "balance": "АгроБаланс",
                "isPE": false,
                "signedAt": "2023-11-03",
                "amount": 64000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1052.d2",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": false,
        "products": [
          {
            "id": "1052.d2.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1052.d2.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "RUB",
                "balance": "ЮГ ИНВЕСТ",
                "isPE": false,
                "signedAt": "2023-11-03",
                "amount": 9800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1052.d2.p1.i1.t1",
                    "name": "Транш",
                    "currency": "RUB",
                    "signedAt": "2023-11-03",
                    "amount": 9800000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "1053": {
    "id": 1053,
    "productsDid": [
      {
        "id": "1053.d1",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": true,
        "products": [
          {
            "id": "1053.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1053.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "USD",
                "balance": "ТрансКапитал",
                "isPE": true,
                "signedAt": "2023-12-10",
                "amount": 64000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1053.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "USD",
                    "signedAt": "2023-12-10",
                    "amount": 64000000,
                    "fiIds": [
                      "FI-1053-1"
                    ],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1053.d2",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1053.d2.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1053.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "EUR",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2023-12-10",
                "amount": 9800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1053-2"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1053.d2.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "USD",
                "balance": "ТрансКапитал",
                "isPE": false,
                "signedAt": "2023-12-10",
                "amount": 450000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1053-3"
                ],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1053.d3",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1053.d3.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1053.d3.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "EUR",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2023-12-10",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1053.d3.p1.i1.t1",
                    "name": "Транш",
                    "currency": "EUR",
                    "signedAt": "2023-12-10",
                    "amount": 400000,
                    "fiIds": [
                      "FI-1053-4"
                    ],
                    "repaidAt": null
                  },
                  {
                    "id": "1053.d3.p1.i1.t2",
                    "name": "Транш",
                    "currency": "EUR",
                    "signedAt": "2024-03-10",
                    "amount": 400000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "1054": {
    "id": 1054,
    "productsDid": [
      {
        "id": "1054.d1",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1054.d1.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1054.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "EUR",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2024-01-16",
                "amount": 9800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1054.d1.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "EUR",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2024-01-16",
                "amount": 450000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1055": {
    "id": 1055,
    "productsDid": [
      {
        "id": "1055.d1",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1055.d1.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1055.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": null,
                "balance": null,
                "isPE": false,
                "signedAt": null,
                "amount": null,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1055.d1.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": null,
                "balance": null,
                "isPE": false,
                "signedAt": null,
                "amount": null,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1055.d2",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1055.d2.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1055.d2.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": null,
                "balance": null,
                "isPE": false,
                "signedAt": null,
                "amount": null,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1055.d3",
        "code": "ADDITIONAL_YIELD",
        "name": "Доп. доходность",
        "isMain": false,
        "products": [
          {
            "id": "1055.d3.p1",
            "code": "ADDITIONAL_YIELD",
            "name": "Дополнительная доходность",
            "isMandatory": true,
            "instruments": []
          }
        ]
      },
      {
        "id": "1055.d4",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": false,
        "products": [
          {
            "id": "1055.d4.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": []
          }
        ]
      },
      {
        "id": "1055.d5",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": false,
        "products": [
          {
            "id": "1055.d5.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1055.d5.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": null,
                "balance": null,
                "isPE": false,
                "signedAt": null,
                "amount": null,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1055.d5.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": null,
                "balance": null,
                "isPE": false,
                "signedAt": null,
                "amount": null,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1055.d6",
        "code": "COMPENSATION_AGREEMENT",
        "name": "Соглашение о компенсационных выплатах",
        "isMain": false,
        "products": []
      },
      {
        "id": "1055.d7",
        "code": "RESIDENTIAL_EQUITY",
        "name": "Долевое участие в жилой недвижимости",
        "isMain": false,
        "products": [
          {
            "id": "1055.d7.p1",
            "code": "RESIDENTIAL_EQUITY_STAKE",
            "name": "Долевое в ЖН",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1055.d7.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": null,
                "balance": null,
                "isPE": false,
                "signedAt": null,
                "amount": null,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1055.d7.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": null,
                "balance": null,
                "isPE": false,
                "signedAt": null,
                "amount": null,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1055.d8",
        "code": "CORPORATE_CONTROL",
        "name": "Корпоративный контроль",
        "isMain": false,
        "products": [
          {
            "id": "1055.d8.p1",
            "code": "CORPORATE_CONTROL_SENIOR",
            "name": "Корп. контроль для старшего кредита",
            "isMandatory": true,
            "instruments": []
          }
        ]
      },
      {
        "id": "1055.d9",
        "code": "FUNDING",
        "name": "Фондирование",
        "isMain": false,
        "products": [
          {
            "id": "1055.d9.p1",
            "code": "FUNDING",
            "name": "Фондирование",
            "isMandatory": true,
            "instruments": []
          }
        ]
      },
      {
        "id": "1055.d10",
        "code": "INTRAGROUP_LOAN",
        "name": "Внутригрупповой кредит",
        "isMain": false,
        "products": [
          {
            "id": "1055.d10.p1",
            "code": "INTRAGROUP_LOAN",
            "name": "Внутригрупповой кредит",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1055.d10.p1.i1",
                "code": "INTRAGROUP_LOAN_NCL",
                "name": "Внутригрупповой кредит (НКЛ)",
                "currency": null,
                "balance": null,
                "isPE": false,
                "signedAt": null,
                "amount": null,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1055.d11",
        "code": "PRIVATE_EQUITY",
        "name": "Private Equity",
        "isMain": false,
        "products": [
          {
            "id": "1055.d11.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1055.d11.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": null,
                "balance": null,
                "isPE": false,
                "signedAt": null,
                "amount": null,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1055.d11.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": null,
                "balance": null,
                "isPE": false,
                "signedAt": null,
                "amount": null,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1056": {
    "id": 1056,
    "productsDid": [
      {
        "id": "1056.d1",
        "code": "CORPORATE_CONTROL",
        "name": "Корпоративный контроль",
        "isMain": true,
        "products": [
          {
            "id": "1056.d1.p1",
            "code": "CORPORATE_CONTROL_SENIOR",
            "name": "Корп. контроль для старшего кредита",
            "isMandatory": true,
            "instruments": []
          }
        ]
      },
      {
        "id": "1056.d2",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": false,
        "products": [
          {
            "id": "1056.d2.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1056.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2024-03-30",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1056-1"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1056.d2.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "USD",
                "balance": "VPE CAPITAL",
                "isPE": false,
                "signedAt": "2024-03-30",
                "amount": 1500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1056.d3",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": false,
        "products": [
          {
            "id": "1056.d3.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1056.d3.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2024-03-30",
                "amount": 25000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1056.d3.p1.i1.t1",
                    "name": "Транш",
                    "currency": "RUB",
                    "signedAt": "2024-03-28",
                    "amount": 25000000,
                    "fiIds": [
                      "FI-1056-2"
                    ],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "1057": {
    "id": 1057,
    "productsDid": [
      {
        "id": "1057.d1",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": true,
        "products": [
          {
            "id": "1057.d1.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1057.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "USD",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2024-05-06",
                "amount": 1500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1057.d1.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "EUR",
                "balance": "ЮГ ИНВЕСТ",
                "isPE": false,
                "signedAt": "2024-05-06",
                "amount": 25000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1058": {
    "id": 1058,
    "productsDid": [
      {
        "id": "1058.d1",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": true,
        "products": [
          {
            "id": "1058.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1058.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "EUR",
                "balance": "СОКОЛ ФИНАНС",
                "isPE": false,
                "signedAt": "2024-06-12",
                "amount": 25000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1058.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "EUR",
                    "signedAt": "2024-06-12",
                    "amount": 25000000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1058.d2",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1058.d2.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1058.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "JPY",
                "balance": "ТрансКапитал",
                "isPE": false,
                "signedAt": "2024-06-12",
                "amount": 120000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1058.d2.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "EUR",
                "balance": "СОКОЛ ФИНАНС",
                "isPE": false,
                "signedAt": "2024-06-12",
                "amount": 3500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1059": {
    "id": 1059,
    "productsDid": [
      {
        "id": "1059.d1",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1059.d1.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1059.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "JPY",
                "balance": "VPE CAPITAL",
                "isPE": false,
                "signedAt": "2024-07-19",
                "amount": 120000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1059-1"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1059.d1.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "RUB",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2024-07-19",
                "amount": 3500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1059-2"
                ],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1059.d2",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1059.d2.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1059.d2.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "JPY",
                "balance": "VPE CAPITAL",
                "isPE": false,
                "signedAt": "2024-07-19",
                "amount": 64000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1059.d2.p1.i1.t1",
                    "name": "Транш",
                    "currency": "JPY",
                    "signedAt": "2024-07-19",
                    "amount": 32000000,
                    "fiIds": [
                      "FI-1059-3"
                    ],
                    "repaidAt": null
                  },
                  {
                    "id": "1059.d2.p1.i1.t2",
                    "name": "Транш",
                    "currency": "JPY",
                    "signedAt": "2024-10-19",
                    "amount": 32000000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1059.d3",
        "code": "CORPORATE_CONTROL",
        "name": "Корпоративный контроль",
        "isMain": false,
        "products": [
          {
            "id": "1059.d3.p1",
            "code": "CORPORATE_CONTROL_SENIOR",
            "name": "Корп. контроль для старшего кредита",
            "isMandatory": true,
            "instruments": []
          }
        ]
      }
    ]
  },
  "1060": {
    "id": 1060,
    "productsDid": [
      {
        "id": "1060.d1",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1060.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1060.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "RUB",
                "balance": "ЮГ ИНВЕСТ",
                "isPE": true,
                "signedAt": "2024-08-25",
                "amount": 3500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1060.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "RUB",
                    "signedAt": "2024-08-25",
                    "amount": 3500000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          },
          {
            "id": "1060.d1.p2",
            "code": "CORPORATE_CONTROL",
            "name": "Корп. Контроль",
            "isMandatory": false,
            "instruments": [
              {
                "id": "1060.d1.p2.i1",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "RUB",
                "balance": "ЮГ ИНВЕСТ",
                "isPE": true,
                "signedAt": "2024-08-25",
                "amount": 64000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1061": {
    "id": 1061,
    "productsDid": [
      {
        "id": "1061.d1",
        "code": "CORPORATE_CONTROL",
        "name": "Корпоративный контроль",
        "isMain": true,
        "products": [
          {
            "id": "1061.d1.p1",
            "code": "CORPORATE_CONTROL_SENIOR",
            "name": "Корп. контроль для старшего кредита",
            "isMandatory": true,
            "instruments": []
          }
        ]
      },
      {
        "id": "1061.d2",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": false,
        "products": [
          {
            "id": "1061.d2.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1061.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "USD",
                "balance": "ТрансКапитал",
                "isPE": false,
                "signedAt": "2024-10-01",
                "amount": 64000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1061.d2.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "EUR",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2024-10-01",
                "amount": 9800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1062": {
    "id": 1062,
    "productsDid": [
      {
        "id": "1062.d1",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": true,
        "products": [
          {
            "id": "1062.d1.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1062.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "EUR",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2024-11-07",
                "amount": 9800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1062-1"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1062.d1.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "JPY",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2024-11-07",
                "amount": 450000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1062.d2",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": false,
        "products": [
          {
            "id": "1062.d2.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1062.d2.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "EUR",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2024-11-07",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1062.d2.p1.i1.t1",
                    "name": "Транш",
                    "currency": "EUR",
                    "signedAt": "2024-11-07",
                    "amount": 800000,
                    "fiIds": [
                      "FI-1062-2"
                    ],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1062.d3",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1062.d3.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1062.d3.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "JPY",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2024-11-07",
                "amount": 1500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1062-3"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1062.d3.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "EUR",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2024-11-07",
                "amount": 25000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1062-4"
                ],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1063": {
    "id": 1063,
    "productsDid": [
      {
        "id": "1063.d1",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": true,
        "products": [
          {
            "id": "1063.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1063.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "JPY",
                "balance": "АгроБаланс",
                "isPE": false,
                "signedAt": "2024-12-14",
                "amount": 450000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1063.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "JPY",
                    "signedAt": "2024-12-14",
                    "amount": 450000000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "1064": {
    "id": 1064,
    "productsDid": [
      {
        "id": "1064.d1",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1064.d1.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1064.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2025-01-20",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1064.d1.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "USD",
                "balance": "VPE CAPITAL",
                "isPE": false,
                "signedAt": "2025-01-20",
                "amount": 1500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1064.d2",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1064.d2.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1064.d2.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2025-01-20",
                "amount": 25000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1064.d2.p1.i1.t1",
                    "name": "Транш",
                    "currency": "RUB",
                    "signedAt": "2025-01-20",
                    "amount": 25000000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "1065": {
    "id": 1065,
    "productsDid": [
      {
        "id": "1065.d1",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1065.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1065.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "USD",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2025-02-26",
                "amount": 1500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1065.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "USD",
                    "signedAt": "2025-02-26",
                    "amount": 750000,
                    "fiIds": [
                      "FI-1065-1"
                    ],
                    "repaidAt": null
                  },
                  {
                    "id": "1065.d1.p1.i1.t2",
                    "name": "Транш",
                    "currency": "USD",
                    "signedAt": "2025-05-26",
                    "amount": 750000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1065.d2",
        "code": "CORPORATE_CONTROL",
        "name": "Корпоративный контроль",
        "isMain": false,
        "products": [
          {
            "id": "1065.d2.p1",
            "code": "CORPORATE_CONTROL_SENIOR",
            "name": "Корп. контроль для старшего кредита",
            "isMandatory": true,
            "instruments": []
          }
        ]
      },
      {
        "id": "1065.d3",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": false,
        "products": [
          {
            "id": "1065.d3.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1065.d3.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "EUR",
                "balance": "ЮГ ИНВЕСТ",
                "isPE": false,
                "signedAt": "2025-02-26",
                "amount": 25000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1065-2"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1065.d3.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "USD",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2025-02-26",
                "amount": 120000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1066": {
    "id": 1066,
    "productsDid": [
      {
        "id": "1066.d1",
        "code": "CORPORATE_CONTROL",
        "name": "Корпоративный контроль",
        "isMain": true,
        "products": [
          {
            "id": "1066.d1.p1",
            "code": "CORPORATE_CONTROL_SENIOR",
            "name": "Корп. контроль для старшего кредита",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1066.d1.p1.i1",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "RUB",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": null,
                "amount": null,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1067": {
    "id": 1067,
    "productsDid": [
      {
        "id": "1067.d1",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": true,
        "products": [
          {
            "id": "1067.d1.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1067.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "JPY",
                "balance": "VPE CAPITAL",
                "isPE": false,
                "signedAt": "2025-05-11",
                "amount": 120000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1067.d1.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "RUB",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2025-05-11",
                "amount": 3500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1067.d2",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": false,
        "products": [
          {
            "id": "1067.d2.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1067.d2.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "JPY",
                "balance": "VPE CAPITAL",
                "isPE": false,
                "signedAt": "2025-05-11",
                "amount": 64000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1067.d2.p1.i1.t1",
                    "name": "Транш",
                    "currency": "JPY",
                    "signedAt": "2025-05-11",
                    "amount": 64000000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "1068": {
    "id": 1068,
    "productsDid": [
      {
        "id": "1068.d1",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": true,
        "products": [
          {
            "id": "1068.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1068.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "RUB",
                "balance": "ЮГ ИНВЕСТ",
                "isPE": true,
                "signedAt": "2025-06-17",
                "amount": 3500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1068.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "RUB",
                    "signedAt": "2025-06-17",
                    "amount": 3500000,
                    "fiIds": [
                      "FI-1068-1"
                    ],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1068.d2",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1068.d2.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1068.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "USD",
                "balance": "АгроБаланс",
                "isPE": false,
                "signedAt": "2025-06-17",
                "amount": 64000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1068-2"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1068.d2.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "RUB",
                "balance": "ЮГ ИНВЕСТ",
                "isPE": false,
                "signedAt": "2025-06-17",
                "amount": 9800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1068-3"
                ],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1068.d3",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1068.d3.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1068.d3.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "USD",
                "balance": "АгроБаланс",
                "isPE": false,
                "signedAt": "2025-06-17",
                "amount": 450000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1068.d3.p1.i1.t1",
                    "name": "Транш",
                    "currency": "USD",
                    "signedAt": "2025-06-17",
                    "amount": 450000000,
                    "fiIds": [
                      "FI-1068-4"
                    ],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "1069": {
    "id": 1069,
    "productsDid": [
      {
        "id": "1069.d1",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1069.d1.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1069.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "USD",
                "balance": "ТрансКапитал",
                "isPE": false,
                "signedAt": "2025-07-24",
                "amount": 64000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1069.d1.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "EUR",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2025-07-24",
                "amount": 9800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1070": {
    "id": 1070,
    "productsDid": [
      {
        "id": "1070.d1",
        "code": "CREDIT_MEZZANINE",
        "name": "Кредитный мезонин",
        "isMain": true,
        "products": [
          {
            "id": "1070.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1070.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "EUR",
                "balance": "ПромФинанс",
                "isPE": false,
                "signedAt": "2025-08-30",
                "amount": 9800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1070.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "EUR",
                    "signedAt": "2025-08-28",
                    "amount": 9800000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1070.d2",
        "code": "CORPORATE_CONTROL",
        "name": "Корпоративный контроль",
        "isMain": false,
        "products": [
          {
            "id": "1070.d2.p1",
            "code": "CORPORATE_CONTROL_SENIOR",
            "name": "Корп. контроль для старшего кредита",
            "isMandatory": true,
            "instruments": []
          }
        ]
      }
    ]
  },
  "1071": {
    "id": 1071,
    "productsDid": [
      {
        "id": "1071.d1",
        "code": "CORPORATE_CONTROL",
        "name": "Корпоративный контроль",
        "isMain": true,
        "products": [
          {
            "id": "1071.d1.p1",
            "code": "CORPORATE_CONTROL_SENIOR",
            "name": "Корп. контроль для старшего кредита",
            "isMandatory": true,
            "instruments": []
          }
        ]
      },
      {
        "id": "1071.d2",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": false,
        "products": [
          {
            "id": "1071.d2.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1071.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "JPY",
                "balance": "АгроБаланс",
                "isPE": false,
                "signedAt": "2025-10-06",
                "amount": 450000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [
                  "FI-1071-1"
                ],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1071.d2.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "RUB",
                "balance": "СОКОЛ ФИНАНС",
                "isPE": false,
                "signedAt": "2025-10-06",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      },
      {
        "id": "1071.d3",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": false,
        "products": [
          {
            "id": "1071.d3.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1071.d3.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "JPY",
                "balance": "АгроБаланс",
                "isPE": false,
                "signedAt": "2025-10-06",
                "amount": 1500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1071.d3.p1.i1.t1",
                    "name": "Транш",
                    "currency": "JPY",
                    "signedAt": "2025-10-06",
                    "amount": 1500000,
                    "fiIds": [
                      "FI-1071-2"
                    ],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "1072": {
    "id": 1072,
    "productsDid": [
      {
        "id": "1072.d1",
        "code": "EQUITY_PARTICIPATION",
        "name": "Долевое участие в капитале",
        "isMain": true,
        "products": [
          {
            "id": "1072.d1.p1",
            "code": "EQUITY_STAKE",
            "name": "Долевое участие",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1072.d1.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2025-11-12",
                "amount": 800000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1072.d1.p1.i2",
                "code": "CORPORATE_AGREEMENT",
                "name": "Корп. договор",
                "currency": "RUB",
                "balance": "ООО «СБИ»",
                "isPE": false,
                "signedAt": "2025-11-12",
                "amount": 1500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  },
  "1073": {
    "id": 1073,
    "productsDid": [
      {
        "id": "1073.d1",
        "code": "VENTURE_FINANCING",
        "name": "Венчурное финансирование",
        "isMain": true,
        "products": [
          {
            "id": "1073.d1.p1",
            "code": "CREDIT_MEZZANINE",
            "name": "Кредитный мезонин",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1073.d1.p1.i1",
                "code": "LOAN_NCL",
                "name": "Договор займа (НКЛ)",
                "currency": "USD",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2025-12-19",
                "amount": 1500000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": [
                  {
                    "id": "1073.d1.p1.i1.t1",
                    "name": "Транш",
                    "currency": "USD",
                    "signedAt": "2025-12-19",
                    "amount": 1500000,
                    "fiIds": [],
                    "repaidAt": null
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "id": "1073.d2",
        "code": "EQUITY_MEZZANINE",
        "name": "Акционерный мезонин",
        "isMain": false,
        "products": [
          {
            "id": "1073.d2.p1",
            "code": "EQUITY_MEZZANINE_REPO",
            "name": "Акционерный мезонин (РЕПО)",
            "isMandatory": true,
            "instruments": [
              {
                "id": "1073.d2.p1.i1",
                "code": "SHARES",
                "name": "Акции / Доли",
                "currency": "EUR",
                "balance": "ЮГ ИНВЕСТ",
                "isPE": false,
                "signedAt": "2025-12-19",
                "amount": 25000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              },
              {
                "id": "1073.d2.p1.i2",
                "code": "PUT_REPO",
                "name": "Пут: РЕПО",
                "currency": "USD",
                "balance": "SBERFIN",
                "isPE": false,
                "signedAt": "2025-12-19",
                "amount": 120000000,
                "didEntryAt": null,
                "didExitAt": null,
                "fiIds": [],
                "repaidAt": null,
                "tranches": []
              }
            ]
          }
        ]
      }
    ]
  }
};

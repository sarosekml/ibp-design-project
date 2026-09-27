# deals-app — сделки ДИД (раздел postrade)

Модуль повторяет модуль фронтенда `postrade/deals-app`. Здесь — прототип
направления Post (Operations / финансисты ДИД): главная, реестр «Текущий
портфель ДИД», страница сделки. Перенесён из концепта `postrade/drafts/post`
24.09.2026 (`/promote`, `.agents/tools/promote.mjs`). Трек `product`
(`app.json`): агент правит модуль только с подтверждением человека.

Форма модуля — `../../README.md`: `pages/`, `widgets/<группа>/<Имя>/`,
`data/`, `refs/`; дерево ниже собирается само.

## Экраны

| Экран | Открывать двойным кликом | Пара во фронтенде |
|---|---|---|
| Главная | `pages/MainPage.html` | нет в `deals-app`; главная у фронтенда — `core/host-app` → `HomePage` |
| Текущий портфель ДИД | `pages/Portfolio.html` | вероятно `Deals` с таблицей `CurrentPortfolioDidTable` — подтвердить |
| Сделка | `pages/Deal.preview.html` — **собранная**; источник — `pages/Deal.html` | `Deal` |

Экраны лежат на одном уровне — прямо в `pages/`, папок под роль нет. Копии
страниц под каждую роль не делаются: различия ролей закрываются сменой
состояний одной страницы. Механизм такой смены пока не спроектирован.

ДС подключает загрузчик проекта: `../../../ds-config.js` первым в `<head>` и
`../../../ds-body.js` (с `data-ds="scripts/ibp-home.js"`) вместо тега `ds.js`;
строка пользователя в футере меню ведёт на хаб `../../../../index.html`.

## Виджеты

12 тайлов и таблица страницы сделки, шесть модальных окон и поповер. Наполнены пять
тайлов — «КНР», «Сроки сделки», «Команда сделки», «Описание сделки», «Финансовые метрики
сделки», у каждого своё окно; остальные 7 тайлов и таблица — заглушки (`data-state="empty"`): оболочка есть, состав полей не
согласован. Имена сверены с деревом фронтенда 24.09.2026: где пара нашлась,
имя — как у фронтенда; где нет — осталось нашим, с типом в конце.

| Виджет | Где стоит на странице сделки | Пара во фронтенде |
|---|---|---|
| `widgets/tiles/CounterpartiesTile` — наполнен | Общая информация, первый ряд (3) | `CounterpartiesTile` (было `KNRTile`). Универсальный тайл контрагентов, заголовок по странице: на сделке «КНР», на обеспечении «Залогодатель» / «Поручитель» / «Гарант», на инструменте «Контрагент»; собран вариант сделки |
| `widgets/tiles/DealPeriodTile` — наполнен | Общая информация, первый ряд (3) | `DealPeriodTile` (было `DealTermsTile`) |
| `widgets/tiles/DealTeamTile` — наполнен | Общая информация, первый ряд (6) | `DealTeamTile` |
| `widgets/tiles/DealDescriptionTile` — наполнен | Общая информация, второй ряд (6) | `DealDescriptionTile` |
| `widgets/tiles/DealFinancialMetricsTile` — наполнен | Общая информация, второй ряд (6) | `DealFinancialMetricsTile` (было `DealMetricsTile`) |
| `widgets/tiles/ProjectInformationTile` | Общая информация, третий ряд (12, опциональный) | `ProjectInformationTile` (было `ProjectInfoTile`) |
| `widgets/tiles/DealSetupTile` | Общая информация, правая колонка 320px | ближайшее — виджет `Navigator` (у фронтенда не тайл) — имя оставлено |
| `widgets/tiles/DealProductTreeTile` | «Финансовые данные», первый ряд (6) | `DealProductTreeTile` (было `DealProductsTile`) |
| `widgets/tiles/FinInstrumentsTile` | «Финансовые данные», первый ряд (6) | ближайшее — группа `DealFinancialInstrumentsGroup` из `DealFinancialInstrumentTile` — имя оставлено |
| `widgets/tiles/EpsVbsImpactTile` | «Финансовые данные», второй ряд (6) | точной нет; рядом по теме `DealEirIbsvFixationTile` (фиксация, а не влияние) — имя оставлено |
| `widgets/tiles/DealMetricsCalculationTile` | «Финансовые данные», второй ряд (6) | `DealMetricsCalculationTile` (было `FinMetricsTile`) |
| `widgets/tables/DealCounterpartiesTable` | вкладка «Контрагенты» (12) | нет — новая сущность, имя наше (было `widgets/tiles/CounterpartiesTile`, до того `widgets/tables/CounterpartiesTable`; корень — тайл без шапки) |
| `widgets/tiles/DealRelatedCollateralsTile` | вкладка «Обеспечения» (12) | `DealRelatedCollateralsTile` (было `CollateralsTile`) |
| `widgets/modals/InstrumentsCounterpartiesModal` | конец `body`; окно тайла «КНР» (+ `KNRConfirmModal.html` — подтверждение, `CounterpartyCard/` — шаблон карточки контрагента) | `InstrumentsCounterpartiesModal` (было `KNRModal`, до того `TileKNRModal`; карточка — `CardCounterparty`) |
| `widgets/modals/DealPeriodModal` | конец `body`; окно тайла «Сроки сделки» | `DealPeriodModal` (было `TileDealTermsModal`) |
| `widgets/modals/DealTeamModal` | конец `body`; окно тайла «Команда сделки» | `DealTeamModal` (было `TileDealTeamModal`) |
| `widgets/modals/DealDescriptionModal` | конец `body`; окно тайла «Описание сделки» — правка и просмотр | `DealDescriptionModal` |
| `widgets/modals/DealFinancialMetricsModal` | конец `body`; окно тайла «Финансовые метрики сделки» — только просмотр | `DealFinancialMetricsModal` |
| `widgets/modals/CounterpartiesEcmModal` | конец `body`; «Документы ЭКД по сделке» тайла «Описание сделки»: выбор участника (+ `EcmModal/` — второй шаг, документы) | `CounterpartiesEcmModal` (+ `EcmModal`) |
| `widgets/popovers/RelatedDealsPopover` | конец `body`; поповер ссылки «Связанные сделки» тайла «Описание сделки» | пара — окно `RelatedDealsModal`; у нас поповер (решение человека 24.09.2026), имя наше |

Тайл и его окно лежат в разных группах, как у фронтенда; подчасть окна — в
его папке. JS наполненных виджетов (`<Имя>.js`) подключает страница после
`ds-body.js`: сборщик вшивает разметку и CSS, но не скрипты. Страницы
документации виджетов — в витрине локальных компонентов `apps/local-components/`
(пункт хаба «Локальные компоненты»): их собирает `kit-build.mjs` из папок виджетов
(`widgets/README.md`, «Документация модулей»).

Как устроены виджеты и их связи — `widgets/README.md`.

**Виджеты общие для раздела `postrade`.** Страница любого модуля раздела
может вшить виджет отсюда: из `pages/` соседнего модуля —
`<ds-include src="../../deals-app/widgets/tiles/CounterpartiesTile/CounterpartiesTile.html" class="col-6"></ds-include>`,
из концепта `postrade/drafts/<имя>/pages/` — на один `../` длиннее. Виджет
остаётся здесь, у своего модуля; из другого раздела его не берут (сборщик,
СБ5), модуль не берёт виджеты из `drafts/` (СБ6).

## Сборка

Страница сделки модульная: `pages/Deal.html` держит перечень виджетов метками
`<ds-include>`, разметку вшивает общий сборщик. После правки источника или
любого виджета, а заодно дерева ниже:

```bash
node .agents/tools/assemble.mjs
node .agents/tools/module-readme.mjs
```

Гейт напомнит, если забыть (СБ2, МР3).

## Данные

`data/` — единственная точка доступа к данным для всех экранов: таблица
портфеля и страница сделки читают один и тот же `window.DealsStore`, поэтому
правила валидации, уникальности и тоны статусных чипов
(`DealsStore.statusTone`) живут в одном месте. Состояние сделок — только в
памяти вкладки; справочник сотрудников для окна команды — `mock-team.js`.

Состав участников сделки и её КНР — `window.CounterpartiesStore`
(`counterparties-store.js` поверх базы `mock-counterparties.js`). Его правки
сохраняет адаптер `PostApi` (`post-api.js`): сервер данных, если он отвечает,
иначе — localStorage браузера. Сервера в этом репозитории пока нет (решение
человека 24.09.2026), поэтому состав, сохранённый на странице сделки, живёт в
браузере и виден и в тайле «КНР», и в колонке «КНР» реестра. Контракт —
`data/API.md`; настоящий бэкенд реализует его же, и тогда меняется только
адаптер.

Финансовые метрики сделок — `mock-financial-metrics.js`
(`window.MOCK_DEAL_FIN_METRICS`, ключ — id сделки): ВБС и ОСЗ по составляющим,
резервы и переоценка по PE по ФИ. Только чтение — метрики считает система,
стора и сохранения у них нет. Какая демо-сделка какое состояние тайла
показывает — в шапке файла. В продукте метрики складываются из финансовых
инструментов сделки; здесь — демо-данные, с деревом ФИ (`mock-deal-trees.js`)
не связанные. Привязка к бэкенду и мок-данным ФИ — следующий шаг (решение
человека 25.09.2026).

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
deals-app/
├── app.json                                 ← запись хаба: «Post — ДИД», трек product
├── README.md
├── pages/
│   ├── Deal.html                            ← Сделка — источник, собирается в Deal.preview.html
│   ├── Deal.preview.html                    ← собранная страница — открывать её
│   ├── Deal.screen.md                       ← спека
│   ├── MainPage.html                        ← Главная страница
│   ├── MainPage.screen.md                   ← спека
│   ├── Portfolio.html                       ← Текущий портфель ДИД
│   └── Portfolio.screen.md                  ← спека
├── widgets/
│   ├── modals/                              ← модальные окна
│   │   ├── CounterpartiesEcmModal/          ← Модальное окно «Документы по сделке»
│   │   │   ├── CounterpartiesEcmModal.css
│   │   │   ├── CounterpartiesEcmModal.html
│   │   │   ├── CounterpartiesEcmModal.js
│   │   │   ├── CounterpartiesEcmModal.md
│   │   │   └── EcmModal/
│   │   │       └── EcmModal.html
│   │   ├── DealDescriptionModal/            ← Модальное окно описания сделки
│   │   │   ├── DealDescriptionModal.css
│   │   │   ├── DealDescriptionModal.html
│   │   │   ├── DealDescriptionModal.js
│   │   │   └── DealDescriptionModal.md
│   │   ├── DealFinancialMetricsModal/       ← Модальное окно финансовых метрик сделки
│   │   │   ├── DealFinancialMetricsModal.css
│   │   │   ├── DealFinancialMetricsModal.html
│   │   │   ├── DealFinancialMetricsModal.js
│   │   │   ├── DealFinancialMetricsModal.md
│   │   │   └── fixtures.json
│   │   ├── DealPeriodModal/                 ← Модальное окно сроков сделки
│   │   │   ├── DealPeriodModal.html
│   │   │   ├── DealPeriodModal.js
│   │   │   └── DealPeriodModal.md
│   │   ├── DealTeamModal/                   ← Модальное окно команды сделки
│   │   │   ├── DealTeamModal.css
│   │   │   ├── DealTeamModal.html
│   │   │   ├── DealTeamModal.js
│   │   │   └── DealTeamModal.md
│   │   └── InstrumentsCounterpartiesModal/  ← Модальное окно контрагентов
│   │       ├── CounterpartyCard/
│   │       │   ├── CHANGELOG.md
│   │       │   ├── CounterpartyCard.css
│   │       │   ├── CounterpartyCard.html
│   │       │   ├── CounterpartyCard.js
│   │       │   ├── CounterpartyCard.md
│   │       │   └── fixtures.json
│   │       ├── InstrumentsCounterpartiesModal.css
│   │       ├── InstrumentsCounterpartiesModal.html
│   │       ├── InstrumentsCounterpartiesModal.js
│   │       ├── InstrumentsCounterpartiesModal.md
│   │       └── KNRConfirmModal.html
│   ├── popovers/                            ← поповеры и тултипы
│   │   └── RelatedDealsPopover/             ← Поповер связанных сделок
│   │       ├── RelatedDealsPopover.css
│   │       ├── RelatedDealsPopover.html
│   │       ├── RelatedDealsPopover.js
│   │       └── RelatedDealsPopover.md
│   ├── README.md
│   ├── tables/                              ← таблицы
│   │   └── DealCounterpartiesTable/         ← Контрагенты сделки
│   │       ├── DealCounterpartiesTable.css
│   │       ├── DealCounterpartiesTable.html
│   │       └── DealCounterpartiesTable.md
│   └── tiles/                               ← тайлы
│       ├── CounterpartiesTile/              ← Контрагенты
│       │   ├── CHANGELOG.md
│       │   ├── CounterpartiesTile.css
│       │   ├── CounterpartiesTile.html
│       │   ├── CounterpartiesTile.js
│       │   ├── CounterpartiesTile.md
│       │   └── fixtures.json
│       ├── DealDescriptionTile/             ← Описание сделки
│       │   ├── CHANGELOG.md
│       │   ├── DealDescriptionTile.css
│       │   ├── DealDescriptionTile.html
│       │   ├── DealDescriptionTile.js
│       │   ├── DealDescriptionTile.md
│       │   └── fixtures.json
│       ├── DealFinancialMetricsTile/        ← Финансовые метрики сделки
│       │   ├── CHANGELOG.md
│       │   ├── DealFinancialMetricsTile.css
│       │   ├── DealFinancialMetricsTile.html
│       │   ├── DealFinancialMetricsTile.js
│       │   ├── DealFinancialMetricsTile.md
│       │   └── fixtures.json
│       ├── DealMetricsCalculationTile/      ← Финансовые метрики
│       │   ├── DealMetricsCalculationTile.css
│       │   ├── DealMetricsCalculationTile.html
│       │   └── DealMetricsCalculationTile.md
│       ├── DealPeriodTile/                  ← Сроки сделки
│       │   ├── CHANGELOG.md
│       │   ├── DealPeriodTile.css
│       │   ├── DealPeriodTile.html
│       │   ├── DealPeriodTile.js
│       │   ├── DealPeriodTile.md
│       │   └── fixtures.json
│       ├── DealProductTreeTile/             ← Продукты сделки
│       │   ├── DealProductTreeTile.css
│       │   ├── DealProductTreeTile.html
│       │   └── DealProductTreeTile.md
│       ├── DealRelatedCollateralsTile/      ← Связанные обеспечения
│       │   ├── DealRelatedCollateralsTile.css
│       │   ├── DealRelatedCollateralsTile.html
│       │   └── DealRelatedCollateralsTile.md
│       ├── DealSetupTile/                   ← Заведение сделки
│       │   ├── DealSetupTile.css
│       │   ├── DealSetupTile.html
│       │   └── DealSetupTile.md
│       ├── DealTeamTile/                    ← Команда сделки
│       │   ├── CHANGELOG.md
│       │   ├── DealTeamTile.css
│       │   ├── DealTeamTile.html
│       │   ├── DealTeamTile.js
│       │   ├── DealTeamTile.md
│       │   └── fixtures.json
│       ├── EpsVbsImpactTile/                ← Влияние на ЭПС/ВБС
│       │   ├── EpsVbsImpactTile.css
│       │   ├── EpsVbsImpactTile.html
│       │   └── EpsVbsImpactTile.md
│       ├── FinInstrumentsTile/              ← Финансовые инструменты
│       │   ├── FinInstrumentsTile.css
│       │   ├── FinInstrumentsTile.html
│       │   └── FinInstrumentsTile.md
│       └── ProjectInformationTile/          ← Сведения о проекте
│           ├── ProjectInformationTile.css
│           ├── ProjectInformationTile.html
│           └── ProjectInformationTile.md
├── data/
│   ├── API.md
│   ├── counterparties-store.js              ← CounterpartiesStore — база контрагентов и состав участников сделки.
│   ├── deals-store.js                       ← DealsStore — единственная точка доступа к базе сделок ДИД (мок).
│   ├── mock-counterparties.js               ← Мок-данные ДИД — база контрагентов (window.MOCK_COUNTERPARTIES) и
│   ├── mock-deal-trees.js                   ← Деревья продуктов сделок ДИД (window.MOCK_DEAL_TREES), ключ — id сделки.
│   ├── mock-deals.js                        ← Мок-данные ДИД — реестр сделок (window.MOCK_DEALS) и перечни (window.DE…
│   ├── mock-financial-metrics.js            ← Финансовые метрики сделок — демо-данные (window.MOCK_DEAL_FIN_METRICS).
│   ├── mock-team.js                         ← Мок-данные ДИД — сотрудники банка для выпадающих списков окна «Команда
│   └── post-api.js                          ← PostApi — адаптер хранения данных направления Post.
└── refs/
    ├── Post _ DEAL _ R&D/
    │   ├── Tile-Deal-KNR.png
    │   ├── Модальное окно КНР-физлица.png
    │   └── Модальное окно КНР-юрлица.png
    ├── команда/
    │   ├── Modal_.png
    │   └── Tile-Deal-Team.png
    ├── описание/
    │   ├── Modal_Tile_Deal_Description.png
    │   ├── Section 1.png
    │   ├── Tile-Deal-Description.png
    │   └── Документы по сделке (ЭКД).png
    ├── пример страницы/
    │   ├── Контрагенты.png
    │   ├── Обеспечения.png
    │   ├── Схематичное расположение тайлов на странице.png
    │   └── Финансовые данные.png
    ├── Текущий портфель.md
    └── финансовые метрики/
        ├── Tile-fin-metrics.png
        ├── Модальное окно.png
        ├── Привязанные к легенде цветовые стили.png
        ├── Состояния лайн чарта.png
        └── Текст тултипов.png
```
<!-- /@tree -->

## Имена фронтенда

Сущности модуля во фронтенде (снято с дерева фронтенда 24.09.2026) —
разложены по нашей форме. Экран или виджет, у которого здесь есть пара, называется
так же: разработчик находит его без перевода (`apps/README.md`, «widgets»).

| Куда у нас | Имена во фронтенде |
|---|---|
| `pages/` | AgreementSbiRepresentativesPage, Cashflow, ChangesHistory, ChangesList, CheckList, CheckLists, Collateral, CollateralAgreementPage, CollateralRelatedInstruments, CommissionAccountingsPage, Deal, DealNotFoundPage, Deals, DefaultDeals, DefiniteCycle, EtsDictionary, FactualPaymentsRegister, FinancialData, FinancialInstrument, FinancialMetrics, ForecastCashFlow, InitialAndAdditionalAgreementsPage, Instrument, KPI, OneCAccounts, PlanPaymentsDid, PledgeCostPage, TranchePage, TransferSchemasPage |
| `widgets/tiles/` | AgreementSbiRepresentativesTile, BalanceAndCurrencyTile, CashflowTile, CollateralAccountingTile, CollateralAgreementOnlyTile, CollateralAgreementsTile, CollateralBalanceTile, CollateralDescriptionTile, CollateralLiabilityTile, CollateralLocationTile, CollateralRelatedDealsTile, CollateralTITile, CommissionAccountingsTile, CommissionPaymentsTile, CorporateAgreementTile, CounterpartiesTile, DealDescriptionTile, DealEirIbsvFixationTile, DealFinancialInstrumentTile, DealFinancialMetricsTile, DealMetricsCalculationTile, DealPeriodTile, DealProductTreeTile, DealRelatedCollateralsTile, DealTeamTile, DefaultDealsTile, DisbursementRepaymentTile, EarlyRepaymentsTile, ExternalIdTile, FinancialInstrumentTile, FixationModalTile, ForecastOfIncomeTile, GuaranteesInformationTile, IDFITile, InitialAndAdditionalAgreementsTile, InstrumentBindingTile, InstrumentCorporateAgreementTile, InstrumentRevaluationTile, InterestPaymentsTile, InterestPeriodsTile, InterestSchemasTile, LoanExternalDataTile, LoanNrlTranchesTile, OneCTile, OptionContractTypeTile, OptionFinancialDataTile, OptionLoanLimitsTile, OptionPremiumTile, OptionStrikeEstimationTile, OptionWindowsTile, PledgeCostTile, ProjectInformationTile, RelatedCorporateAgreementsTile, RelationToInstrumentTile, SharesStocksAssetTypeTile, SharesStocksDividendsTile, SharesStocksPriceAndNominalTile, SharesStocksSaleTile, SummaryTile, TileRecalculation, TrancheCommissionPeriodsTile, TrancheLoanLimitsTile, TransferRateTile, TransferSchemaTile |
| `widgets/tables/` | AgreementSbiRepresentativesTable, CashflowTable, ChangesHistoryTable, CheckListFormTable, CheckListTable, CurrentPortfolioDidTable, DefaultDealsTable, DefiniteCycleTable, EtsDictionaryTable, FactualPaymentsRegisterTable, FinancialDataTable, FinancialMetricsTable, FixationHistoryTable, ForecastCashFlowTable, KPIMetricsTable, KPITable, OneCTable, PlanPaymentsDidTable |
| `widgets/modals/` | AdditionalAgreementModal, AgreementSbiRepresentativeModal, BalanceAndCurrencyModal, BaseTransferIndexHistoryModal, CashBalancesModal, CheckListCreationModal, CheckListPatchModal, CollateralAccountingModal, CollateralAgreementModal, CollateralBalanceModal, CollateralDescriptionModal, CollateralLiabilityModal, CollateralLocationModal, CollateralRelatedDealsModal, CollateralRepaymentModal, CollateralTIModal, CommissionAccountingsModal, CorporateAgreementModal, CorrectReturnModal, CounterpartiesEcmModal, DealCollateralCreateModal, DealCreateModal, DealDescriptionModal, DealEirIbsvFixationModal, DealFinancialInstrumentCreateModal, DealFinancialInstrumentEditModal, DealFinancialMetricsModal, DealMetricsCalculationModal, DealPeriodModal, DealProjectInformationModal, DealTeamModal, DealTitleModal, DefaultDealsModal, DidProductsModal, DownloadReportModal, EcmModal, EtsDictionaryModal, FactualPaymentsRegisterModal, FinancialDataModal, FinancialDataUploadModal, FixationModal, GuaranteesInformationModal, IDFIModal, InitialAndAdditionalAgreementsModal, InstrumentCorporateAgreementModal, InstrumentRevaluationModal, InstrumentTransferModal, InstrumentsCounterpartiesModal, InstrumentsModal, InterestPeriodsPlanningParametersModal, KPIModal, LinkChangeModal, LoanExternalDataModal, NavigatorAppointmentOfResponsibleModal, NavigatorApprovalModal, NavigatorChangeReasonModal, NavigatorDealCloseModal, NavigatorForwardToTransferModal, OneCModal, OptionContractTypeModal, OptionPremiumModal, OptionStrikeEstimationModal, OptionWindowsModal, OutstandingDebtDealModal, OutstandingDebtModal, OutstandingDebtTrancheModal, PartyPaymentsModal, PickMonthAndYearModal, PlanningParametersDateModal, PledgeCostModal, ProductsModal, RelatedDealsModal, RepaymentModal, SharesStocksAssetTypeModal, SharesStocksDividendsModal, SharesStocksPriceAndNominalModal, TrancheInterestPaymentsModal, TransferRateHistoryModal, TransferSchemaModal, TransferringInstrumentsToFIModal, TreeModal — у фронтенда в `features/` и `widgets/` |
| `widgets/context-menus/` | InstrumentContextMenuButton |
| другие виджеты | AdditionalAgreementsSection, DealFinancialInstrumentsGroup, DetailedChanges, ForecastCashFlowBar, InitialAndAdditionalAgreementsPageBar, InstrumentPaymentSection, Navigator, TrancheCounterpartiesGroup — своей группы у нас нет: новая группа — в `project.json → appShape.widgetGroups` |
| мелкие элементы | AccordionProductRow, AdditionalAgreementForm, ConfirmTransferGrid, DealMetricsLinkButton, DealMetricsReportButtons, Ets, FICards, ForecastCashFlowButton, PreliminaryCalculationButton, TransferSchemaTileButton — у фронтенда `features/`; у нас — в разметке страницы или виджета |

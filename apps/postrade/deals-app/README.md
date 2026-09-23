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

13 виджетов страницы сделки, все пока в состоянии заглушки
(`data-state="empty"`): оболочка есть, состав полей не согласован. Имена
сверены с деревом фронтенда 24.09.2026: где пара нашлась, имя — как у
фронтенда; где нет — осталось нашим, с типом в конце.

| Виджет | Где стоит на странице сделки | Пара во фронтенде |
|---|---|---|
| `widgets/tiles/KNRTile` | Общая информация, первый ряд (3) | нет |
| `widgets/tiles/DealPeriodTile` | Общая информация, первый ряд (3) | `DealPeriodTile` (было `DealTermsTile`) |
| `widgets/tiles/DealTeamTile` | Общая информация, первый ряд (6) | `DealTeamTile` |
| `widgets/tiles/DealDescriptionTile` | Общая информация, второй ряд (6) | `DealDescriptionTile` |
| `widgets/tiles/DealFinancialMetricsTile` | Общая информация, второй ряд (6) | `DealFinancialMetricsTile` (было `DealMetricsTile`) |
| `widgets/tiles/ProjectInformationTile` | Общая информация, третий ряд (12, опциональный) | `ProjectInformationTile` (было `ProjectInfoTile`) |
| `widgets/tiles/DealSetupTile` | Общая информация, правая колонка 320px | ближайшее — виджет `Navigator` (у фронтенда не тайл) — имя оставлено |
| `widgets/tiles/DealProductTreeTile` | «Финансовые данные», первый ряд (6) | `DealProductTreeTile` (было `DealProductsTile`) |
| `widgets/tiles/FinInstrumentsTile` | «Финансовые данные», первый ряд (6) | ближайшее — группа `DealFinancialInstrumentsGroup` из `DealFinancialInstrumentTile` — имя оставлено |
| `widgets/tiles/EpsVbsImpactTile` | «Финансовые данные», второй ряд (6) | точной нет; рядом по теме `DealEirIbsvFixationTile` (фиксация, а не влияние) — имя оставлено |
| `widgets/tiles/DealMetricsCalculationTile` | «Финансовые данные», второй ряд (6) | `DealMetricsCalculationTile` (было `FinMetricsTile`) |
| `widgets/tiles/CounterpartiesTile` | вкладка «Контрагенты» (12) | `CounterpartiesTile` (было `widgets/tables/CounterpartiesTable`; корень — тайл без шапки) |
| `widgets/tiles/DealRelatedCollateralsTile` | вкладка «Обеспечения» (12) | `DealRelatedCollateralsTile` (было `CollateralsTile`) |

Как устроены виджеты и их связи — `widgets/README.md`.

**Виджеты общие для раздела `postrade`.** Страница любого модуля раздела
может вшить виджет отсюда: из `pages/` соседнего модуля —
`<ds-include src="../../deals-app/widgets/tiles/KNRTile/KNRTile.html" class="col-6"></ds-include>`,
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

`data/` — единственная точка доступа к базе сделок для всех экранов: таблица
портфеля и страница сделки читают один и тот же `window.DealsStore`, поэтому
правила валидации, уникальности и тоны статусных чипов
(`DealsStore.statusTone`) живут в одном месте. Состояние — только в памяти
вкладки.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
deals-app/
├── app.json                             ← запись хаба: «Post — ДИД», трек product
├── README.md
├── pages/
│   ├── Deal.html                        ← Сделка — источник, собирается в Deal.preview.html
│   ├── Deal.preview.html                ← собранная страница — открывать её
│   ├── Deal.screen.md                   ← спека
│   ├── MainPage.html                    ← Главная страница
│   ├── MainPage.screen.md               ← спека
│   ├── Portfolio.html                   ← Текущий портфель ДИД
│   └── Portfolio.screen.md              ← спека
├── widgets/
│   ├── README.md
│   └── tiles/                           ← тайлы
│       ├── CounterpartiesTile/          ← Контрагенты сделки
│       │   ├── CounterpartiesTile.html
│       │   └── CounterpartiesTile.md
│       ├── DealDescriptionTile/         ← Описание сделки
│       │   ├── DealDescriptionTile.html
│       │   └── DealDescriptionTile.md
│       ├── DealFinancialMetricsTile/    ← Финансовые метрики сделки
│       │   ├── DealFinancialMetricsTile.html
│       │   └── DealFinancialMetricsTile.md
│       ├── DealMetricsCalculationTile/  ← Финансовые метрики
│       │   ├── DealMetricsCalculationTile.html
│       │   └── DealMetricsCalculationTile.md
│       ├── DealPeriodTile/              ← Сроки сделки
│       │   ├── DealPeriodTile.html
│       │   └── DealPeriodTile.md
│       ├── DealProductTreeTile/         ← Продукты сделки
│       │   ├── DealProductTreeTile.html
│       │   └── DealProductTreeTile.md
│       ├── DealRelatedCollateralsTile/  ← Связанные обеспечения
│       │   ├── DealRelatedCollateralsTile.html
│       │   └── DealRelatedCollateralsTile.md
│       ├── DealSetupTile/               ← Заведение сделки
│       │   ├── DealSetupTile.html
│       │   └── DealSetupTile.md
│       ├── DealTeamTile/                ← Команда сделки
│       │   ├── DealTeamTile.html
│       │   └── DealTeamTile.md
│       ├── EpsVbsImpactTile/            ← Влияние на ЭПС/ВБС
│       │   ├── EpsVbsImpactTile.html
│       │   └── EpsVbsImpactTile.md
│       ├── FinInstrumentsTile/          ← Финансовые инструменты
│       │   ├── FinInstrumentsTile.html
│       │   └── FinInstrumentsTile.md
│       ├── KNRTile/                     ← КНР
│       │   ├── KNRTile.html
│       │   └── KNRTile.md
│       └── ProjectInformationTile/      ← Сведения о проекте
│           ├── ProjectInformationTile.html
│           └── ProjectInformationTile.md
├── data/
│   ├── deals-store.js                   ← DealsStore — единственная точка доступа к базе сделок ДИД (мок).
│   ├── mock-deal-trees.js               ← Деревья продуктов сделок ДИД (window.MOCK_DEAL_TREES), ключ — id сделки.
│   └── mock-deals.js                    ← Мок-данные ДИД — реестр сделок (window.MOCK_DEALS) и перечни (window.DE…
└── refs/
    ├── Post _ DEAL _ R&D/
    │   ├── Tile-Deal-KNR.png
    │   ├── Модальное окно КНР-физлица.png
    │   └── Модальное окно КНР-юрлица.png
    ├── пример страницы/
    │   ├── Контрагенты.png
    │   ├── Обеспечения.png
    │   ├── Схематичное расположение тайлов на странице.png
    │   └── Финансовые данные.png
    └── Текущий портфель.md
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

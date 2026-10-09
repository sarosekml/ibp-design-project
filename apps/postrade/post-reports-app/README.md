# post-reports-app — модуль раздела postrade

Модуль повторяет модуль фронтенда `postrade/post-reports-app` (отчёты раздела
postrade). Сейчас собирается «Расчет FV»: реестр расчетов, страница расчета на
дату, окна правки ФИ, загрузки и выгрузки файлов. Требования — задача
`docs/tasks/RE0012-fv-calculation.md` (статусы, роли, матрица действий).

Демо-данные — `data/fv-*.js`. Матрица «статус × роль → действия» лежит в одном
месте, `data/fv-dictionaries.js`; экраны и спеки берут её оттуда. Форма модуля —
`apps/README.md`.

Панель прототипа: Alt+Shift+P на любой странице; сценарии — proto-panel/flows.yaml (статусы расчета, обе роли, окно ФИ, выгрузка в сетях Сигма и Альфа).

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
post-reports-app/
├── app.json                                    ← запись хаба: «Post — Отчёты», трек product
├── README.md
├── pages/
│   ├── FairValueCalculation.html               ← Расчет FV — источник, собирается в FairValueCalculation.preview.html
│   ├── FairValueCalculation.preview.html       ← собранная страница — открывать её
│   ├── FairValueCalculation.screen.md          ← спека
│   ├── FairValueRegister.html                  ← Реестр расчетов FV — источник, собирается в FairValueRegister.preview.html
│   ├── FairValueRegister.preview.html          ← собранная страница — открывать её
│   └── FairValueRegister.screen.md             ← спека
├── widgets/
│   └── modals/                                 ← модальные окна
│       ├── CreateFairValueCalculationModal/    ← Окно формирования нового расчета FV
│       │   ├── CHANGELOG.md
│       │   ├── CreateFairValueCalculationModal.html
│       │   ├── CreateFairValueCalculationModal.js
│       │   └── CreateFairValueCalculationModal.md
│       ├── DownloadReportModal/                ← Выгрузка расчета FV
│       │   ├── CHANGELOG.md
│       │   ├── DownloadReportModal.css
│       │   ├── DownloadReportModal.html
│       │   ├── DownloadReportModal.js
│       │   └── DownloadReportModal.md
│       ├── FairValueInstrumentablesUploadFileModal/ ← Окно «Данные по инструменту»
│       │   ├── CHANGELOG.md
│       │   ├── FairValueInstrumentablesUploadFileModal.css
│       │   ├── FairValueInstrumentablesUploadFileModal.html
│       │   ├── FairValueInstrumentablesUploadFileModal.js
│       │   └── FairValueInstrumentablesUploadFileModal.md
│       ├── FairValueUserMetricsModal/          ← Окно ФИ расчета FV
│       │   ├── CHANGELOG.md
│       │   ├── FairValueUserMetricsModal.css
│       │   ├── FairValueUserMetricsModal.html
│       │   ├── FairValueUserMetricsModal.js
│       │   └── FairValueUserMetricsModal.md
│       ├── ReservesFvComponentsModal/          ← Окно «Данные FV» с компонентами
│       │   ├── CHANGELOG.md
│       │   ├── ReservesFvComponentsModal.html
│       │   └── ReservesFvComponentsModal.md
│       └── ReservesFvModal/                    ← Окно «Данные FV»
│           ├── CHANGELOG.md
│           ├── ReservesFvModal.html
│           └── ReservesFvModal.md
├── data/
│   ├── fv-calculation-items.js                 ← ФИ расчета FV — демо-данные (window.MOCK_FV_CALCULATION_ITEMS).
│   ├── fv-calculations.js                      ← Реестр расчетов FV — демо-данные (window.MOCK_FV_CALCULATIONS).
│   ├── fv-dictionaries.js                      ← Расчет FV — словари и матрица статусов × роль (window.FV_*).
│   └── fv-employees.js                         ← Сотрудники для выгрузки расчета FV — демо-данные (window.MOCK_FV_EMPLOY…
├── refs/                                       ← пусто
└── proto-panel/                                ← панель прототипа: сценарии показа и комментарии
    ├── comments.md                             ← комментарии к прототипу
    ├── flows.yaml                              ← сценарии показа
    └── panel-data.js                           ← генерат панели — руками не править
```
<!-- /@tree -->

## Имена фронтенда

Сущности модуля во фронтенде (снято с дерева фронтенда 24.09.2026) —
разложены по нашей форме. Экран или виджет, у которого здесь есть пара, называется
так же: разработчик находит его без перевода (`apps/README.md`, «widgets»).

| Куда у нас | Имена во фронтенде |
|---|---|
| `pages/` | OneCNavision |
| `widgets/modals/` | CalculationUserMetricsModal, ConfirmUploadActionModal, CreateFairValueCalculationModal, CreateIncomeExpensesModal, CreateOcpReportModal, CreateReserveModal, CreateReservesCalculationModal, CreateRwaReportModal, DownloadReportModal, EditLimitSumModal, EditOcpReportRecordModal, FairValueInstrumentablesUploadFileModal, FairValueUserMetricsModal, FinancialUploadCsvModal, OcpLimitReportUserValuesModal, OcpSummaryReportUserValuesModal, PickMonthAndYearModal, ReservesFvComponentsModal, ReservesFvModal, ReservesLgdModal, RwaReportUserMetricsModal, RwaValuesModal, UserMetricsModal — у фронтенда в `features/` и `widgets/` |
| `widgets/context-menus/` | FairValueContextMenuButton, FinancialCalculationContextMenuButton, OcpReportContextMenuButton, ReservesRecordContextMenuButton, ReservesRegisterUploadFileContextMenuButton, RwaReportContextMenuButton |
| другие виджеты | AccrualInterestCalculation, FairValueCalculation, FairValueRegister, FinancialCalculation, IncomeExpenses, OcpReport, OcpReports, OneCData, OneCDataCheck, ReservesRecordComparison, ReservesRecordPage, ReservesRegisterPage, RwaReport, RwaReports, RwaValues — своей группы у нас нет: новая группа — в `project.json → appShape.widgetGroups` |
| мелкие элементы | LinkIconButton, ReservesRecordApprovalButton, ReservesRecordComparisonButton, ReservesRecordComparisonDownloadButton, ReservesRecordComparisonTabs, RwaValuesTabs, UploadReservesModals — у фронтенда `features/`; у нас — в разметке страницы или виджета |

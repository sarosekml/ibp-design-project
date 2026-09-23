# post-reports-app — модуль раздела postrade

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `postrade/post-reports-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/postrade/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
post-reports-app/
├── README.md
├── pages/    ← пусто
├── widgets/  ← пусто
├── data/     ← пусто
└── refs/     ← пусто
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

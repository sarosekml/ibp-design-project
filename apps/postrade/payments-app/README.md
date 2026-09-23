# payments-app — модуль раздела postrade

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `postrade/payments-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/postrade/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
payments-app/
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
| `pages/` | CommissionPayments, CommissionPeriods, CommissionSchemas, DisbursementRepayment, EarlyRepayments, ForecastOfIncome, InterestPeriods, InterestSchemas, LoanLimits, PartyPaymentsPage, PlanPaymentsForDeal, PlanPaymentsPage, SharesStocksSale |
| `widgets/tiles/` | CommissionSchemaTile, InterestSchemaTile |
| `widgets/tables/` | CommissionPaymentsTable, CommissionPeriodsTable, DisbursementRepaymentTable, EarlyRepaymentsTable, ForecastOfIncomeTable, InterestPeriodsTable, LoanLimitsTable, PartyPaymentsTable, PlanPaymentsForDealTable, PlanPaymentsTable, SharesStocksSaleTable |
| `widgets/modals/` | BaseIndexHistoryModal, CommissionPaymentsDetailedCalculationModal, CommissionPaymentsModal, CommissionPeriodsModal, CommissionSchemaModal, ConfirmMassiveActionsModal, DisbursementRepaymentModal, EarlyRepaymentsModal, ForecastOfIncomeModal, InterestPeriodModal, InterestPeriodPartitionModal, InterestSchemaModal, LoanLimitsModal, OverpaymentModal, PartyPaymentsModal, PartyPlanPaymentsModal, PaymentAmountChangingModal, PlanPaymentsModal, RateHistoryModal, RulesForCalculatingInterestModal, SharesStocksSaleModal, UploadCommissionPeriodsModal, UploadForecastOfIncomeModal, UploadInterestPeriodsModal — у фронтенда в `features/` и `widgets/` |
| `widgets/context-menus/` | CommissionPeriodsContextMenuButton |
| другие виджеты | EarlyOptionRepaymentsPage, EarlyTrancheRepaymentsPage, InstrumentDisbursementRepayment, InstrumentInterestPeriods, InstrumentInterestSchemasPage, TrancheDisbursementRepayment, TrancheInterestPeriods, TrancheInterestSchemasPage — своей группы у нас нет: новая группа — в `project.json → appShape.widgetGroups` |
| мелкие элементы | InterestSchemaTileButton — у фронтенда `features/`; у нас — в разметке страницы или виджета |

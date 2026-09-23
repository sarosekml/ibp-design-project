# ib-payments-app — модуль раздела ib

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `ib/ib-payments-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/ib/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
ib-payments-app/
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
| `pages/` | Documents, Empty, Payment, PaymentSchedule, Register |
| `widgets/tiles/` | PaidDateTile, PaymentAccordionPreviewTile, PaymentAmountTile, PaymentCounterpartyTile, PaymentDescriptionTile, PaymentDocumentsTile, PaymentEntityTile, PaymentPreviewTile, PaymentTaskTile, PaymentTransactionsTile |
| `widgets/tables/` | ActReconPaymentTable, DocumentsTable, LinkedPaymentsTable, PaymentTransactionsTable, PaymentsRegisterTable |
| `widgets/modals/` | ActReconPaymentModal, ApprovePaymentModal, CancelPaymentModal, ClientSearchModal, DeclinePaymentModal, DeleteDocumentModal, DuplicatesPaymentsModal, EditDocumentModal, ExecutionPaymentModal, ExpectedIncomeModal, InvoiceDownloadModal, IssuePaymentModal, PaymentModal — у фронтенда в `features/` и `widgets/` |
| мелкие элементы | EditDocumentForm, PaymentModalForm — у фронтенда `features/`; у нас — в разметке страницы или виджета |

# corporate-requests-app — модуль раздела postrade

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `postrade/corporate-requests-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/postrade/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
corporate-requests-app/
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
| `pages/` | CorporateRequest, CorporateRequestNotFoundPage, CorporateRequests, MailRegister |
| `widgets/tiles/` | CorporateRequestAgreementTile, CorporateRequestCounterparty, CorporateRequestDealTile, CorporateRequestPeriodTile, CorporateRequestTeamTile, EssenceRequestTile, ResponseToTheClientTile |
| `widgets/tables/` | CorporateRequestsTable, MailRegisterTable |
| `widgets/modals/` | CloseRequestModal, CorporateRequestAgreementModal, CorporateRequestCounterpartyModal, CorporateRequestDealModal, CorporateRequestEcmModal, CorporateRequestPeriodModal, CorporateRequestTeamModal, EssenceRequestModal, ResponseToTheClientModal — у фронтенда в `features/` и `widgets/` |
| другие виджеты | Mail, Navigator — своей группы у нас нет: новая группа — в `project.json → appShape.widgetGroups` |
| мелкие элементы | CounterpartyCards, DealCards — у фронтенда `features/`; у нас — в разметке страницы или виджета |

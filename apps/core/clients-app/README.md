# clients-app — модуль раздела core

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `core/clients-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/core/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
clients-app/
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
| `pages/` | ClientInfoDealsPage, ClientInfoFinancials, ClientInfoGoalsPage, ClientInfoPage, ClientsPage, ClientsRnpPage, MyClientsPage |
| `widgets/tiles/` | ClientRnpTile, ClientTile, ClientsRnpCacheTile, DocumentsInfoTile, GigaInfoTile, GoalArchiveSection, IndustryInfoTile, RequisitesInfoTile, TeamInfoTile |
| `widgets/tables/` | UcpClientTeamTable |
| `widgets/modals/` | ControlClientModal, GetEcmTicketModal, UcpClientSearchModal — у фронтенда в `features/` и `widgets/` |
| `widgets/popovers/` | GoalsPopoverBadge |
| другие виджеты | ClientForm, FinancialsChart, MyClientsHierarchicalTree — своей группы у нас нет: новая группа — в `project.json → appShape.widgetGroups` |
| мелкие элементы | ClientCard, ClientsModalActions, FinancialChartFilters, FinancialChartInfo, FinancialsChartLegend, GoalSegmentFilter, StratDialogueBadge, StratDialogueCard, StratDialogueUser, UcpClientInformationView, UcpClientReferenceView — у фронтенда `features/`; у нас — в разметке страницы или виджета |

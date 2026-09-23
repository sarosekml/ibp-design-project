# kfulsources-app — модуль раздела pretrade

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `pretrade/kfulsources-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/pretrade/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
kfulsources-app/
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
| `pages/` | KfulOpportunities, KfulOpportunity, KfulPipelineScanner |
| `widgets/tiles/` | KfulDescriptionTile, KfulDetailInfoTile, KfulDocumentsTile, KfulPartyTile, KfulProductsTile, KfulTeamTile |
| `widgets/tables/` | KfulOpportunitiesFilters, KfulOpportunitiesReportButton, KfulOpportunitiesTable |
| `widgets/modals/` | CreateKfulModal, KfulDeclineToArchiveModal, KfulDocumentsAnalysisModal, KfulMassCheckAnswersModal, KfulRouteToDeskModal — у фронтенда в `features/` и `widgets/` |
| другие виджеты | KfulOpportunityActions — своей группы у нас нет: новая группа — в `project.json → appShape.widgetGroups` |
| мелкие элементы | KfulBreadCrumbs, KfulDocumentsAnalysisView, KfulOpportunityNotifications, NavigateToKfulTableLink — у фронтенда `features/`; у нас — в разметке страницы или виджета |

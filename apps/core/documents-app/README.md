# documents-app — модуль раздела core

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `core/documents-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/core/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
documents-app/
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
| `pages/` | FoldersPage, ScenariosPage |
| `widgets/tiles/` | FoldersTile, ScenariosTile |
| `widgets/tables/` | DocumentResultsTable, FolderDocumentsTileTable, FoldersFilters, FoldersTable, ScenariosFilters, ScenariosSettingsTileTable, ScenariosTable |
| `widgets/modals/` | CreateScenarioModal, CreateScenarioSettingModal, DeleteScenarioSettingModal, DocumentResultsModal, UpdateScenarioModal, UpdateScenarioSettingModal — у фронтенда в `features/` и `widgets/` |
| мелкие элементы | DocumentResultButton — у фронтенда `features/`; у нас — в разметке страницы или виджета |

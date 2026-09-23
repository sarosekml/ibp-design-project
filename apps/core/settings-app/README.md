# settings-app — модуль раздела core

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `core/settings-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/core/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
settings-app/
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
| `pages/` | CitiesPage, DepartmentsPage, DesksPage, DocumentsTypesPage, MacroIndustriesPage, MicroservicesPage, RegionsPage, RiskSegmentsPage, SettingsGroupPage, SettingsPage, TaskCategoriesPage, TaskEntityObjectsPage, TaskStatesPage, TaskTypeGroupsPage, TaskTypesPage |
| `widgets/tiles/` | CitiesTile, DeskTile, SettingsTile, SettingsValueItem, SimpleSettingsTile, TaskTypesTile |
| `widgets/tables/` | CitiesTable, DeprecatedVariantSettingsTable, DeskFilters, DesksTable, RiskSegmentsTable, SettingsFilters, SettingsHistoryTable, SettingsTable, SimpleSettingsFilters, SimpleSettingsTable, TaskTypesTable |
| `widgets/modals/` | CitiesModal, DeprecatedVariantSettingsModal, DeskModal, SettingModal, SettingsValueModal, SimpleSettingsModal, TaskTypesModal — у фронтенда в `features/` и `widgets/` |
| `widgets/context-menus/` | SettingsContextMenu, TableContextMenu |
| мелкие элементы | CitiesForm, CloseDateItem, DeskForm, SettingForm, SettingFormFieldByType, SimpleSettingsForm, TaskTypesForm — у фронтенда `features/`; у нас — в разметке страницы или виджета |

# employees-app — модуль раздела core

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `core/employees-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/core/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
employees-app/
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
| `pages/` | DepartmentsPage, DesksPage, EmployeesPage, ProfilePage |
| `widgets/tiles/` | DesksTile, EmployeesTile, ProfileInfoTile |
| `widgets/tables/` | BranchesTileTable, DepartmentsTable, DesksFilters, DesksTable, DesksTileTable, EmployeesFilters, EmployeesSearchTableByDesk, EmployeesTable, EmployeesTileTable |
| `widgets/modals/` | CardList, CreateEmployeeModal, EmployeeBranchesModal, EmployeeDesksModal, UpdateEmployeesByDeskModal — у фронтенда в `features/` и `widgets/` |
| мелкие элементы | CreateEmployeeSearchForm, UpdateEmployeeSearchForm — у фронтенда `features/`; у нас — в разметке страницы или виджета |

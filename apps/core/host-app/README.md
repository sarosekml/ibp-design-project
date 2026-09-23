# host-app — модуль раздела core

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `core/host-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/core/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
host-app/
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
| `pages/` | AdminPage, HomePage, LoginPage, MissingRightsPage, NotFoundPage, ServerErrorPage, ServicesVersionPage |
| `widgets/tiles/` | LinkNavigationTile |
| `widgets/modals/` | AuthorizationExpiredModal — у фронтенда в `features/` и `widgets/` |
| другие виджеты | BreadcrumbsSection, MissingRightsSideBar, ServiceVersionFilters, Sidebar, SnackbarArea — своей группы у нас нет: новая группа — в `project.json → appShape.widgetGroups` |
| мелкие элементы | Logout — у фронтенда `features/`; у нас — в разметке страницы или виджета |

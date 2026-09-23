# callreports-app — модуль раздела pretrade

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `pretrade/callreports-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/pretrade/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
callreports-app/
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
| `pages/` | CallReportsPage, LoginPage, MissingRightsPage, ModuleNotAvailablePage, NotFoundPage, PermissionPageWrapper, ServerErrorPage |
| `widgets/tiles/` | CallReportTile |
| `widgets/modals/` | AuthorizationExpiredModal — у фронтенда в `features/` и `widgets/` |
| другие виджеты | BreadcrumbsSection, CallReportsPageBar, Sidebar, SnackbarArea — своей группы у нас нет: новая группа — в `project.json → appShape.widgetGroups` |
| мелкие элементы | CallReportMeetings, CallReportRelation, LogoutButton — у фронтенда `features/`; у нас — в разметке страницы или виджета |

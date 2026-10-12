---
screen: TasksPage
kind: screen
title: Задачи
file: apps/core/drafts/ibp-redesign-v1/pages/TasksPage.preview.html
module: core/drafts/ibp-redesign-v1
frontend: core/tasks-app TasksPage · TasksOfMyDeskPage
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.000"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tab, Splitter, Table, TableCell, TableFilter, Pagination, Chip, Link, Buttons, IconButton, Modal, SnackBar, Toast, Tile, ReadOnlyField, InputText, DropdownList]
widgets: [tables/TasksTable, tables/TaskHistoryTable, tiles/TaskPreviewTile, modals/ChangeTaskStatusModal]
---

# Page: TasksPage — Задачи

## 1. Назначение (Purpose)

Реестр задач с предпросмотром справа (Splitter), как в системе: карточка задачи с действиями Р7, полями, описанием, связанным объектом и историей.

**Роль пользователя:** Аналитик ДИД
**Права:** просмотр; «Исполнить», «Отменить» (Р7); «Переназначить» и карандаш — по клику ничего (Р6, Б7 MS0014a)

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** не решено (10.10.2026)
- **Адрес в прототипе:** `TasksPage.preview.html?tab=TasksPage`
- **Пункт бокового меню** в состоянии `nav__item--selected`: «Задачи».

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 | Главная | `HomePage.html` |
| 2 (текущий) | Задачи | — |

## 3. Пары во фронтенде

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница («Мои задачи») | `pages/TasksPage.html` | core/tasks-app `TasksPage` |
| Вкладка «Задачи моего деска» | `?tab=TasksOfMyDeskPage` | core/tasks-app `TasksOfMyDeskPage` |
| Реестр | `TasksTable` | TasksTable (фильтр TasksTableFilters — часть) |
| Предпросмотр | `TaskPreviewTile` | TaskPreviewTile (история — TaskHistoryTable) |
| Окно действий | `ChangeTaskStatusModal` | ChangeTaskStatusModal |

## 4. Раскладка (Layout)

```
Page (Layout, nav--rail, screen--app)
├── PageHeader — «Задачи»
├── Tab ×2 — Мои задачи · Задачи моего деска
└── Splitter (заполняет высоту)
    ├── TasksTable — реестр (горизонтальный скролл внутри)
    └── .ds-scroll: TaskPreviewTile — предпросмотр выбранной задачи
```

Высота: `.screen--app`; сплиттер заполняет высоту, правая панель прокручивается своей областью `.ds-scroll`.

## 5. Компоненты (Components)

| Компонент | Откуда |
|---|---|
| Layout | ДС — `design-system/foundations/Layout/Layout.md` |
| NavPanel | ДС — `design-system/components/organisms/NavPanel/NavPanel.md` |
| Breadcrumbs | ДС — `design-system/components/molecules/Breadcrumbs/Breadcrumbs.md` |
| PageHeader | ДС — `design-system/components/organisms/PageHeader/PageHeader.md` |
| Tab | ДС — `design-system/components/molecules/Tab/Tab.md` |
| Splitter | ДС — `design-system/components/molecules/Splitter/Splitter.md` |
| Table | ДС — `design-system/components/organisms/Table/Table.md` |
| TableCell | ДС — `design-system/components/organisms/TableCell/TableCell.md` |
| TableFilter | ДС — `design-system/components/organisms/TableFilter/TableFilter.md` |
| Pagination | ДС — `design-system/components/molecules/Pagination/Pagination.md` |
| Chip | ДС — `design-system/components/atoms/Chip/Chip.md` |
| Link | ДС — `design-system/components/atoms/Link/Link.md` |
| Buttons | ДС — `design-system/components/atoms/Buttons/Buttons.md` |
| IconButton | ДС — `design-system/components/atoms/IconButton/IconButton.md` |
| Modal | ДС — `design-system/components/organisms/Modal/Modal.md` |
| SnackBar | ДС — `design-system/components/organisms/SnackBar/SnackBar.md` |
| Toast | ДС — `design-system/components/molecules/Toast/Toast.md` |
| Tile | ДС — `design-system/components/organisms/Tile/Tile.md` |
| ReadOnlyField | ДС — `design-system/components/molecules/ReadOnlyField/ReadOnlyField.md` |
| InputText | ДС — `design-system/components/molecules/Inputs/InputText/InputText.md` |
| DropdownList | ДС — `design-system/components/molecules/DropdownList/DropdownList.md` |
| `TasksTable` | виджет концепта — `../widgets/tables/TasksTable/TasksTable.md` |
| `TaskPreviewTile` | виджет концепта — `../widgets/tiles/TaskPreviewTile/TaskPreviewTile.md` |
| `ChangeTaskStatusModal` | виджет концепта — `../widgets/modals/ChangeTaskStatusModal/ChangeTaskStatusModal.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 6. Таблицы (Tables)

Таблиц в разметке страницы нет: таблицы — виджеты, колонки — в их паспортах.

## 7. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| Открытие без `?id=` | выбор отсутствует, правая панель скрыта; таблица на всю ширину |
| Строка задачи или явный `?id=` | предпросмотр выбранной задачи справа |
| Крестик | панель скрыта |
| «Исполнить» / «Отменить» | `ChangeTaskStatusModal` → статус, история, SnackBar (Р7) |
| «Переназначить» | по клику ничего (Р6, Б7 MS0014a) |
| Связанный объект | страница объекта |
| Вкладки | `?tab=TasksPage|TasksOfMyDeskPage` |

## 8. Модальные окна (Modals)

| id | Заголовок | Ширина | Содержимое | Кнопки подвала |
|---|---|---|---|---|
| `task-change-scrim` | по действию | `--w4` | виджет `ChangeTaskStatusModal` | см. паспорт |

## 9. Состояния (States)

### Loading
В прототипе не моделируется: демо-данные в памяти. У виджетов — блок загрузки по `data-state="loading"` (паспорта).

### Empty
Без выбранной строки правая панель скрыта.

### Error
В прототипе не моделируется. У виджетов — Alert с повтором по `data-state="error"` (паспорта).

### Disabled
Нет: права роли — просмотр; правка не воссоздаётся (Р6).

## 10. Тексты интерфейса (Texts)

| Место | Текст |
|---|---|
| Заголовок | Задачи |
| Вкладки | Мои задачи · Задачи моего деска |
| Действия | Исполнить · Переназначить · Отменить |

## 11. Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — в паспортах виджетов и typedef демо-данных. Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../data/tasks.js` | `window.MOCK_TASKS` | `TaskRsDto[]` | invented (10.10.2026) |
| `../data/clients.js` | `window.MOCK_CLIENTS` | `ClientRsDto[]` | invented (10.10.2026) |
| `../data/employees.js` | `window.MOCK_EMPLOYEES` | `EmployeeRsDto[]` | invented (10.10.2026) |
| `../data/store.js` | `window.IBPR` | — | хранилище: выборки, действия Р7, sessionStorage |
| `../data/nav-links.js` | `window.IBPR_NAV` | — | меню и карта страниц |
| `../data/registry-table.js` | `window.IBPR_TABLE` | — | общий рендер реестров (пары нет) |

### Permissions — роли, права, флаги

| Роль | Просмотр | Действия |
|---|---|---|
| Аналитик ДИД | да | Р7 над задачами |

## 12. Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| Страница | `pages/TasksPage.html` | `src/pages/TasksPage/TasksPage.tsx` |
| Реестр | `widgets/tables/TasksTable/` | по паспорту |
| Предпросмотр | `widgets/tiles/TaskPreviewTile/` | по паспорту |

Пути фронтенда — по соглашениям его модуля; окончательный путь выбирает разработка.

## 13. Доступность

- `<main>` для контентной области, `<nav aria-label="Хлебные крошки">`, `<nav aria-label="Главное меню">`;
- заголовок страницы — единственный `h1`;
- у всех кнопок-иконок есть `aria-label`;
- вкладки — `role="tablist"`, переключатели — `role="radiogroup"`.

## 14. Открытые вопросы и допущения (Open questions)

| № | Вопрос / допущение | Статус |
|---|---|---|
| 1 | Категории и типы задач — invented справочники | допущение |
| 3 | Меню и карта страниц — `data/nav-links.js`: один источник на концепт; пункт без страницы — клик гасится (Р5) | решено (MS0014a, С1) |

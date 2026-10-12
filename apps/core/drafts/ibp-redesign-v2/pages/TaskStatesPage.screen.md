---
screen: TaskStatesPage
kind: screen
title: Статусы задач
file: apps/core/drafts/ibp-redesign-v2/pages/TaskStatesPage.preview.html
module: core/drafts/ibp-redesign-v2
frontend: core/settings-app pages/TaskStatesPage
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.000"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Splitter, Table, TableCell, TableFilter, Pagination, Tile, ReadOnlyField, IconButton]
widgets: [tables/V2SimpleSettingsTable, tiles/V2SimpleSettingsTile]
---

# Page: TaskStatesPage — Статусы задач

## 1. Назначение (Purpose)

Справочник «Статусы задач»: таблица со статусом, кодом и наименованием, предпросмотр записи справа (Splitter).

**Роль пользователя:** Аналитик ДИД
**Права:** просмотр

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** не решено (10.10.2026)
- **Адрес в прототипе:** `TaskStatesPage.preview.html`
- **Пункт бокового меню** в состоянии `nav__item--selected`: «Администрирование».

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 | Главная | `HomePage.html` |
| 2 | Администрирование | `AdminPage.preview.html` |
| 3 (текущий) | Статусы задач | — |

## 3. Пары во фронтенде

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница | `pages/TaskStatesPage.html` | core/settings-app `pages/TaskStatesPage` |
| Таблица | `V2SimpleSettingsTable` | core/settings-app `widgets/Tables/V2SimpleSettingsTable` (В6) |
| Предпросмотр | `V2SimpleSettingsTile` | core/settings-app `widgets/Tiles/V2SimpleSettingsTile` (В6) |

## 4. Раскладка (Layout)

```
Page (Layout, nav--rail, screen--app)
├── PageHeader — «Статусы задач»
└── Splitter (заполняет высоту)
    ├── V2SimpleSettingsTable — Статус · Код · Наименование
    └── .ds-scroll: V2SimpleSettingsTile — выбранная запись
```

Высота: `.screen--app`; сплиттер заполняет высоту.

## 5. Компоненты (Components)

| Компонент | Откуда |
|---|---|
| Layout | ДС — `design-system/foundations/Layout/Layout.md` |
| NavPanel | ДС — `design-system/components/organisms/NavPanel/NavPanel.md` |
| Breadcrumbs | ДС — `design-system/components/molecules/Breadcrumbs/Breadcrumbs.md` |
| PageHeader | ДС — `design-system/components/organisms/PageHeader/PageHeader.md` |
| Splitter | ДС — `design-system/components/molecules/Splitter/Splitter.md` |
| Table | ДС — `design-system/components/organisms/Table/Table.md` |
| TableCell | ДС — `design-system/components/organisms/TableCell/TableCell.md` |
| TableFilter | ДС — `design-system/components/organisms/TableFilter/TableFilter.md` |
| Pagination | ДС — `design-system/components/molecules/Pagination/Pagination.md` |
| Tile | ДС — `design-system/components/organisms/Tile/Tile.md` |
| ReadOnlyField | ДС — `design-system/components/molecules/ReadOnlyField/ReadOnlyField.md` |
| IconButton | ДС — `design-system/components/atoms/IconButton/IconButton.md` |
| `V2SimpleSettingsTable` | виджет концепта — `../widgets/tables/V2SimpleSettingsTable/V2SimpleSettingsTable.md` |
| `V2SimpleSettingsTile` | виджет концепта — `../widgets/tiles/V2SimpleSettingsTile/V2SimpleSettingsTile.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 6. Таблицы (Tables)

Таблиц в разметке страницы нет: таблицы — виджеты, колонки — в их паспортах.

## 7. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| Строка | предпросмотр справа |
| Крестик | панель скрыта |
| «Фильтр» | модалка `.tfm`: Код, Наименование |

## 8. Модальные окна (Modals)

| id | Заголовок | Ширина | Содержимое | Кнопки подвала |
|---|---|---|---|---|
| `rt-filter-task-states` | Фильтр | `--w6` | TableFilter `.tfm` | «Очистить фильтр», «Применить» |

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
| Заголовок | Статусы задач |
| Колонки | Статус · Код · Наименование |
| Поля | Код · Наименование |

## 11. Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — в паспортах виджетов и typedef демо-данных. Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../data/dictionaries.js` | `window.DICT_TASK_STATES` | `{code, label, enabled, disabledDate}[]` | invented (10.10.2026) |
| `../data/nav-links.js` | `window.IBPR_NAV` | — | меню и карта страниц |
| `../data/registry-table.js` | `window.IBPR_TABLE` | — | общий рендер реестров (пары нет) |

### Permissions — роли, права, флаги

| Роль | Просмотр | Действия |
|---|---|---|
| Аналитик ДИД | да | нет |

## 12. Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| Страница | `pages/TaskStatesPage.html` | `src/pages/TaskStatesPage/TaskStatesPage.tsx` |
| Таблица | `widgets/tables/V2SimpleSettingsTable/` | `src/widgets/Tables/V2SimpleSettingsTable/V2SimpleSettingsTable.tsx` |
| Предпросмотр | `widgets/tiles/V2SimpleSettingsTile/` | `src/widgets/Tiles/V2SimpleSettingsTile/V2SimpleSettingsTile.tsx` |

Пути фронтенда — по соглашениям его модуля; окончательный путь выбирает разработка.

## 13. Доступность

- `<main>` для контентной области, `<nav aria-label="Хлебные крошки">`, `<nav aria-label="Главное меню">`;
- заголовок страницы — единственный `h1`;
- у всех кнопок-иконок есть `aria-label`;
- вкладки — `role="tablist"`, переключатели — `role="radiogroup"`.

## 14. Открытые вопросы и допущения (Open questions)

| № | Вопрос / допущение | Статус |
|---|---|---|
| 1 | Пары таблицы и предпросмотра — V2SimpleSettingsTable и V2SimpleSettingsTile (В6 MS0014a) | допущение |
| 3 | Меню и карта страниц — `data/nav-links.js`: один источник на концепт; пункт без страницы — клик гасится (Р5) | решено (MS0014a, С1) |

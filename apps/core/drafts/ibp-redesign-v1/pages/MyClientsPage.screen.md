---
screen: MyClientsPage
kind: screen
title: Клиенты
file: apps/core/drafts/ibp-redesign-v1/pages/MyClientsPage.preview.html
module: core/drafts/ibp-redesign-v1
frontend: core/clients-app pages/MyClients/MyClientsPage
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.000"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tab, Table, TableCell, TableFilter, Pagination, Chip, Link, Buttons, IconButton, SegmentControl, Toast]
widgets: [tables/MyClientsTable, tables/MyClientsHierarchicalTree]
---

# Page: MyClientsPage — Клиенты

## 1. Назначение (Purpose)

Реестр клиентов аналитика: таблица или дерево холдингов, фильтр, переход на страницу клиента; вкладка «Клиенты ДИД» — пустое состояние.

**Роль пользователя:** Аналитик ДИД
**Права:** просмотр; «Добавить клиента», «в избранное», ⓘ целей — по клику ничего (Р6)

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** не решено (10.10.2026)
- **Адрес в прототипе:** `MyClientsPage.preview.html?tab=MyClientsPage`
- **Пункт бокового меню** в состоянии `nav__item--selected`: «Клиенты».

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 | Главная | `HomePage.html` |
| 2 (текущий) | Клиенты | — |

## 3. Пары во фронтенде

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница | `pages/MyClientsPage.html` | core/clients-app `pages/MyClients/MyClientsPage` |
| Реестр | `MyClientsTable` | core/clients-app MyClientsTable (фильтр MyClientsTableFilters — часть) |
| Дерево холдингов | `MyClientsHierarchicalTree` | core/clients-app `widgets/HierarchicalTree/MyClientsHierarchicalTree` |
| Пустое состояние | `.dtable__empty` реестра | ErrorBanner страницы |
| Вкладки «Клиенты моего деска», «Избранные клиенты», «Клиенты ДИД» | видны; первые две не переключаются (Р3) | не решено (В4 MS0014a) |

## 4. Раскладка (Layout)

```
Page (Layout, nav--rail, screen--app)
├── PageHeader — «Клиенты»
├── Tab ×4 — Мои клиенты · Клиенты моего деска (Р3) · Избранные клиенты (Р3) · Клиенты ДИД
└── MyClientsTable (12) или MyClientsHierarchicalTree (12) — выбор в SegmentControl тулбара
```

**Блоки контента** — 12 колонок; ряды и ширины — в разметке страницы, скрипт только наполняет виджеты:

| № | Блок | Компонент или виджет | Колонок из 12 | Содержимое |
|---|---|---|---|---|
| 1 | Реестр | `widgets/tables/MyClientsTable` | 12 | Фильтр · «Краткий отчет» · «Добавить клиента» · SegmentControl; 15 колонок |
| 2 | Дерево холдингов | `widgets/tables/MyClientsHierarchicalTree` | 12 | вместо реестра по SegmentControl |

Высота: `.screen--app`, реестр заполняет высоту (`dtable--fill`).

## 5. Компоненты (Components)

| Компонент | Откуда |
|---|---|
| Layout | ДС — `design-system/foundations/Layout/Layout.md` |
| NavPanel | ДС — `design-system/components/organisms/NavPanel/NavPanel.md` |
| Breadcrumbs | ДС — `design-system/components/molecules/Breadcrumbs/Breadcrumbs.md` |
| PageHeader | ДС — `design-system/components/organisms/PageHeader/PageHeader.md` |
| Tab | ДС — `design-system/components/molecules/Tab/Tab.md` |
| Table | ДС — `design-system/components/organisms/Table/Table.md` |
| TableCell | ДС — `design-system/components/organisms/TableCell/TableCell.md` |
| TableFilter | ДС — `design-system/components/organisms/TableFilter/TableFilter.md` |
| Pagination | ДС — `design-system/components/molecules/Pagination/Pagination.md` |
| Chip | ДС — `design-system/components/atoms/Chip/Chip.md` |
| Link | ДС — `design-system/components/atoms/Link/Link.md` |
| Buttons | ДС — `design-system/components/atoms/Buttons/Buttons.md` |
| IconButton | ДС — `design-system/components/atoms/IconButton/IconButton.md` |
| SegmentControl | ДС — `design-system/components/molecules/SegmentControl/SegmentControl.md` |
| Toast | ДС — `design-system/components/molecules/Toast/Toast.md` |
| `MyClientsTable` | виджет концепта — `../widgets/tables/MyClientsTable/MyClientsTable.md` |
| `MyClientsHierarchicalTree` | виджет концепта — `../widgets/tables/MyClientsHierarchicalTree/MyClientsHierarchicalTree.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 6. Таблицы (Tables)

Таблиц в разметке страницы нет: таблицы — виджеты, колонки — в их паспортах.

## 7. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| SegmentControl «дерево» | вместо реестра — дерево холдингов; переключатели вида у таблицы и дерева согласованы |
| Вкладка «Клиенты ДИД» | пустое состояние с текстом и «Добавить клиента» |
| Вкладки «Клиенты моего деска», «Избранные клиенты» | видны, не переключаются (Р3) |
| Клиент | `ClientInfoPage.preview.html?id=…` |
| «Фильтр» | модалка `.tfm`, чип «Применено: N» |
| «Краткий отчет» | Toast «Файл выгружен» |

## 8. Модальные окна (Modals)

| id | Заголовок | Ширина | Содержимое | Кнопки подвала |
|---|---|---|---|---|
| `rt-filter-my-clients` | Фильтр | `--w6` | TableFilter `.tfm`: Клиент, ИНН, Отрасль, Сегмент, ТБ, ГОСБ | «Очистить фильтр», «Применить» |

## 9. Состояния (States)

### Loading
В прототипе не моделируется: демо-данные в памяти. У виджетов — блок загрузки по `data-state="loading"` (паспорта).

### Empty
«Клиенты ДИД»: «Здесь пока ничего нет», текст макета, «Добавить клиента»; при фильтре — «Ничего не найдено».

### Error
В прототипе не моделируется. У виджетов — Alert с повтором по `data-state="error"` (паспорта).

### Disabled
Нет: права роли — просмотр; правка не воссоздаётся (Р6).

## 10. Тексты интерфейса (Texts)

| Место | Текст |
|---|---|
| Заголовок | Клиенты |
| Пусто — заголовок | Здесь пока ничего нет |
| Пусто — текст | Выберете клиента через поиск и добавте в список "Клиенты" с помощью кнопки |
| Кнопка | Добавить клиента |

## 11. Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — в паспортах виджетов и typedef демо-данных. Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../data/clients.js` | `window.MOCK_CLIENTS` | `ClientRsDto[]` | invented (10.10.2026) |
| `../data/employees.js` | `window.MOCK_EMPLOYEES` | `EmployeeRsDto[]` | invented (10.10.2026) |
| `../data/dictionaries.js` | `window.REGISTRY_CONFIGS`, `*_LABELS` | конфиги, подписи кодов | invented (10.10.2026) |
| `../data/store.js` | `window.IBPR` | — | хранилище: выборки, действия Р7, sessionStorage |
| `../data/nav-links.js` | `window.IBPR_NAV` | — | меню и карта страниц |
| `../data/registry-table.js` | `window.IBPR_TABLE` | — | общий рендер реестров (пары нет) |

### Permissions — роли, права, флаги

| Роль | Просмотр | Действия |
|---|---|---|
| Аналитик ДИД | да | нет |

## 12. Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| Страница | `pages/MyClientsPage.html` | `src/pages/MyClients/MyClientsPage.tsx` |
| Реестр | `widgets/tables/MyClientsTable/` | `src/widgets/Tables/MyClientsTable/MyClientsTable.tsx` |
| Дерево | `widgets/tables/MyClientsHierarchicalTree/` | `src/widgets/HierarchicalTree/MyClientsHierarchicalTree/MyClientsHierarchicalTree.tsx` |

Пути фронтенда — по соглашениям его модуля; окончательный путь выбирает разработка.

## 13. Доступность

- `<main>` для контентной области, `<nav aria-label="Хлебные крошки">`, `<nav aria-label="Главное меню">`;
- заголовок страницы — единственный `h1`;
- у всех кнопок-иконок есть `aria-label`;
- вкладки — `role="tablist"`, переключатели — `role="radiogroup"`.

## 14. Открытые вопросы и допущения (Open questions)

| № | Вопрос / допущение | Статус |
|---|---|---|
| 1 | Пары вкладок «Клиенты моего деска», «Избранные клиенты», «Клиенты ДИД» (В4 MS0014a) | вопрос |
| 2 | Опечатки «Выберете», «добавте» — дословно с макета (открытый вопрос 9 MS0014) | вопрос |
| 3 | Во фронтенде группировка — InputSwitch «Group by holdings», на снимке — SegmentControl | допущение по снимку |
| 3 | Меню и карта страниц — `data/nav-links.js`: один источник на концепт; пункт без страницы — клик гасится (Р5) | решено (MS0014a, С1) |

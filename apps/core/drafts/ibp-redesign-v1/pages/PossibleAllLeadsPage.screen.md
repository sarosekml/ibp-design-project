---
screen: PossibleAllLeadsPage
kind: screen
title: Возможные лиды
file: apps/core/drafts/ibp-redesign-v1/pages/PossibleAllLeadsPage.preview.html
module: core/drafts/ibp-redesign-v1
frontend: pretrade/offersources-app PossibleLeadsPage/PossibleAllLeadsPage
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.000"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tab, Table, TableCell, TableFilter, Pagination, Chip, Link, Buttons, Toast]
widgets: [tables/LeadsTable]
---

# Page: PossibleAllLeadsPage — Возможные лиды

## 1. Назначение (Purpose)

Реестр возможных лидов с фильтром и переходом на страницу лида. Снимка раздела нет — собран по аналогии (Р4).

**Роль пользователя:** Аналитик ДИД
**Права:** просмотр

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** не решено (10.10.2026)
- **Адрес в прототипе:** `PossibleAllLeadsPage.preview.html`
- **Пункт бокового меню** в состоянии `nav__item--selected`: «Возможные лиды».

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 | Главная | `HomePage.html` |
| 2 (текущий) | Возможные лиды | — |

## 3. Пары во фронтенде

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница | `pages/PossibleAllLeadsPage.html` | pretrade/offersources-app `pages/PossibleLeadsPage/PossibleAllLeadsPage` |
| Реестр | `widgets/tables/LeadsTable` (`registry: possible-leads`) | pretrade/offersources-app `widgets/tables/LeadsTable` (фильтр LeadsFilters — часть) |

## 4. Раскладка (Layout)

```
Page (Layout, nav--rail, screen--app)
├── PageHeader — «Возможные лиды»
└── LeadsTable (12) — dtable--fill: Фильтр · «Краткий отчет» · Table · Pagination
```

**Блоки контента** — 12 колонок; ряды и ширины — в разметке страницы, скрипт только наполняет виджеты:

| № | Блок | Компонент или виджет | Колонок из 12 | Содержимое |
|---|---|---|---|---|
| 1 | Реестр лидов | `widgets/tables/LeadsTable` | 12 | колонки — `LEAD_REGISTRY_CONFIGS`, паспорт виджета |

Высота: `.screen--app`, таблица заполняет высоту (`dtable--fill`).

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
| Toast | ДС — `design-system/components/molecules/Toast/Toast.md` |
| `LeadsTable` | виджет концепта — `../widgets/tables/LeadsTable/LeadsTable.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 6. Таблицы (Tables)

Таблица — виджет `LeadsTable` на общем рендере; конфиг `possible-leads` в `LEAD_REGISTRY_CONFIGS` (`data/dictionaries.js`).

## 7. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| ID лида | `PotentialPage.preview.html?id=…` |
| «Фильтр» | модалка `.tfm`, чип «Применено: N» |
| «Краткий отчет» | Toast «Файл выгружен» |

## 8. Модальные окна (Modals)

| id | Заголовок | Ширина | Содержимое | Кнопки подвала |
|---|---|---|---|---|
| `rt-filter-possible-leads` | Фильтр | `--w6` | TableFilter `.tfm` общего рендера | «Очистить фильтр», «Применить» |

## 9. Состояния (States)

### Loading
В прототипе не моделируется: демо-данные в памяти. У виджетов — блок загрузки по `data-state="loading"` (паспорта).

### Empty
`.dtable__empty`: «Записей нет»; при фильтре — «Ничего не найдено».

### Error
В прототипе не моделируется. У виджетов — Alert с повтором по `data-state="error"` (паспорта).

### Disabled
Нет: права роли — просмотр; правка не воссоздаётся (Р6).

## 10. Тексты интерфейса (Texts)

| Место | Текст |
|---|---|
| Заголовок | Возможные лиды |

## 11. Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — в паспортах виджетов и typedef демо-данных. Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../data/dictionaries.js` | `window.REGISTRY_CONFIGS`, `*_LABELS` | конфиги, подписи кодов | invented (10.10.2026) |
| `../data/potentials.js` | `window.MOCK_POTENTIALS` | `PotentialRsDto[]` | invented (10.10.2026) |
| `../data/clients.js` | `window.MOCK_CLIENTS` | `ClientRsDto[]` | invented (10.10.2026) |
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
| Страница | `pages/PossibleAllLeadsPage.html` | `src/pages/PossibleAllLeadsPage/PossibleAllLeadsPage.tsx` |
| Реестр | `widgets/tables/LeadsTable/` | `src/widgets/tables/LeadsTable/LeadsTable.tsx` |
| Общий рендер | `data/registry-table.js` | пары нет |

Пути фронтенда — по соглашениям его модуля; окончательный путь выбирает разработка.

## 13. Доступность

- `<main>` для контентной области, `<nav aria-label="Хлебные крошки">`, `<nav aria-label="Главное меню">`;
- заголовок страницы — единственный `h1`;
- у всех кнопок-иконок есть `aria-label`;
- вкладки — `role="tablist"`, переключатели — `role="radiogroup"`.

## 14. Открытые вопросы и допущения (Open questions)

| № | Вопрос / допущение | Статус |
|---|---|---|
| 1 | Снимка раздела нет — собран по аналогии с обязательными лидами (Р4) | допущение |
| 3 | Меню и карта страниц — `data/nav-links.js`: один источник на концепт; пункт без страницы — клик гасится (Р5) | решено (MS0014a, С1) |

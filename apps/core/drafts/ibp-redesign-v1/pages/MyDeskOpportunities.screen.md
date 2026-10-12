---
screen: MyDeskOpportunities
kind: screen
title: Pipeline
file: apps/core/drafts/ibp-redesign-v1/pages/MyDeskOpportunities.preview.html
module: core/drafts/ibp-redesign-v1
frontend: pretrade/opportunities-app pipeline MyDeskOpportunities · MyOpportunities · PipelineGenericOpportunities · DidOpportunities
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.000"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tab, Table, TableCell, TableFilter, Pagination, Chip, Link, IconButton, Modal, Toast, SnackBar]
widgets: [tables/OpportunitiesPipelineTable]
---

# Page: MyDeskOpportunities — Pipeline

## 1. Назначение (Purpose)

Реестр «Pipeline» роли «Аналитик ДИД»: вкладки-подфильтры, фильтр, переход на страницу сделки.

**Роль пользователя:** Аналитик ДИД
**Права:** просмотр

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** не решено (10.10.2026)
- **Адрес в прототипе:** `MyDeskOpportunities.preview.html?tab=MyDeskOpportunities`
- **Пункт бокового меню** в состоянии `nav__item--selected`: «Pipeline».

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 | Главная | `HomePage.html` |
| 2 (текущий) | Pipeline: <вкладка> | — |

## 3. Пары во фронтенде

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница (вкладка «Сделки моего деска») | `pages/MyDeskOpportunities.html` | pretrade/opportunities-app `pages/root/pipeline/MyDeskOpportunities` |
| Вкладка «Мои сделки» | `?tab=MyOpportunities` | pretrade/opportunities-app `pages/root/pipeline/MyOpportunities` |
| Вкладка «Упущенные сделки» | `?tab=PipelineGenericOpportunities` | pretrade/opportunities-app `pages/root/pipeline/PipelineGenericOpportunities` |
| Вкладка «Потенциальные сделки ПФ» | `?tab=DidOpportunities` | pretrade/opportunities-app `pages/root/pipeline/DidOpportunities` |
| Шапка страницы | разметка страницы | PageBar — часть страницы |
| Реестр | `widgets/tables/OpportunitiesPipelineTable` | pretrade/opportunities-app `widgets/tables/OpportunitiesPipelineTable` |

## 4. Раскладка (Layout)

```
Page (Layout, nav--rail, screen--app)
├── PageHeader — «Pipeline»
├── Tab ×4 — вкладки-подфильтры (Р4)
└── OpportunitiesPipelineTable (12) — dtable--fill: Фильтр · «Краткий отчет» · Table · Pagination
```

**Блоки контента** — 12 колонок; ряды и ширины — в разметке страницы, скрипт только наполняет виджеты:

| № | Блок | Компонент или виджет | Колонок из 12 | Содержимое |
|---|---|---|---|---|
| 1 | Вкладки | Tab | 12 | Сделки моего деска · Мои сделки · Упущенные сделки · Потенциальные сделки ПФ |
| 2 | Реестр | `widgets/tables/OpportunitiesPipelineTable` | 12 | колонки и действия — паспорт виджета |

Высота: `.screen--app`, таблица заполняет высоту (`dtable--fill`), тело таблицы скроллится само.

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
| IconButton | ДС — `design-system/components/atoms/IconButton/IconButton.md` |
| Modal | ДС — `design-system/components/organisms/Modal/Modal.md` |
| Toast | ДС — `design-system/components/molecules/Toast/Toast.md` |
| SnackBar | ДС — `design-system/components/organisms/SnackBar/SnackBar.md` |
| `OpportunitiesPipelineTable` | виджет концепта — `../widgets/tables/OpportunitiesPipelineTable/OpportunitiesPipelineTable.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 6. Таблицы (Tables)

Таблица — виджет `OpportunitiesPipelineTable` на общем рендере `data/registry-table.js`; колонки — конфиг `REGISTRY_CONFIGS` (`data/dictionaries.js`), состав — паспорт виджета. Непросмотренные строки — `tbl__row--accent`.

## 7. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| Вкладка | подфильтр одной таблицы (Р4): строки по вкладке, адрес `?tab=<страница фронтенда>`, крошка «Pipeline: <вкладка>» |
| «Фильтр» | модалка `.tfm` общего рендера: поля по разделам фильтра; «Применить» — чип «Применено: N», крестик чипа сбрасывает всё |
| ID сделки | `Opportunity.preview.html?source=&id=&tab=`; строка помечается просмотренной |
| «Краткий отчет» | Toast «Файл выгружен» |
| Пагинация | `DSPagination.row` из кода: страница и размер страницы |
| Открытие страницы | фильтр по умолчанию «Статус: В работе» — чип «Применено: 1» |
| «…» за вкладками | видно, по клику ничего (Р5) |

## 8. Модальные окна (Modals)

| id | Заголовок | Ширина | Содержимое | Кнопки подвала |
|---|---|---|---|---|
| `rt-filter-<реестр>` | Фильтр | `--w6` | TableFilter `.tfm` общего рендера | «Очистить фильтр», «Применить» |

## 9. Состояния (States)

### Loading
В прототипе не моделируется: демо-данные в памяти. У виджетов — блок загрузки по `data-state="loading"` (паспорта).

### Empty
Тело таблицы — `.dtable__empty`: «Записей нет»; при фильтре — «Ничего не найдено».

### Error
В прототипе не моделируется. У виджетов — Alert с повтором по `data-state="error"` (паспорта).

### Disabled
Нет: права роли — просмотр; правка не воссоздаётся (Р6).

## 10. Тексты интерфейса (Texts)

| Место | Текст |
|---|---|
| Заголовок | Pipeline |
| Вкладка | Сделки моего деска |
| Вкладка | Мои сделки |
| Вкладка | Упущенные сделки |
| Вкладка | Потенциальные сделки ПФ |
| Отчёт | Краткий отчет |
| Toast отчёта | Файл выгружен |

## 11. Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — в паспортах виджетов и typedef демо-данных. Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../data/dictionaries.js` | `window.REGISTRY_CONFIGS`, `*_LABELS` | конфиги, подписи кодов | invented (10.10.2026) |
| `../data/opportunities.js` | `window.MOCK_OPPORTUNITIES` | `OpportunityRsDto[]` | invented (10.10.2026) |
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
| Страница | `pages/MyDeskOpportunities.html` | `src/pages/root/pipeline/MyDeskOpportunities.tsx` (+ вкладки) |
| Реестр | `widgets/tables/OpportunitiesPipelineTable/` | `src/widgets/tables/OpportunitiesPipelineTable/OpportunitiesPipelineTable.tsx` |
| Общий рендер | `data/registry-table.js` | пары нет — общий код таблиц |

Пути фронтенда — по соглашениям его модуля; окончательный путь выбирает разработка.

## 13. Доступность

- `<main>` для контентной области, `<nav aria-label="Хлебные крошки">`, `<nav aria-label="Главное меню">`;
- заголовок страницы — единственный `h1`;
- у всех кнопок-иконок есть `aria-label`;
- вкладки — `role="tablist"`, переключатели — `role="radiogroup"`.

## 14. Открытые вопросы и допущения (Open questions)

| № | Вопрос / допущение | Статус |
|---|---|---|
| 1 | Одна страница раздела, файл по странице первой вкладки; вкладки — `?tab=<страница фронтенда>` (В1, вариант а MS0014a) | допущение (10.10.2026) |
| 2 | Смысл «Взять в работу» и «Отказаться» — перенос в Pipeline и в архив (открытый вопрос 2 MS0014) | допущение |
| 3 | Меню и карта страниц — `data/nav-links.js`: один источник на концепт; пункт без страницы — клик гасится (Р5) | решено (MS0014a, С1) |
| 4 | Пары вкладок «Упущенные сделки» и «Потенциальные сделки ПФ» — PipelineGenericOpportunities и DidOpportunities (В2 MS0014a) | допущение |
| 5 | Что скрыто за «…» — не решено (10.10.2026) | вопрос |

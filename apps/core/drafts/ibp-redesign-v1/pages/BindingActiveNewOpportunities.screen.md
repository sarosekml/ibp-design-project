---
screen: BindingActiveNewOpportunities
kind: screen
title: Обязательные сделки
file: apps/core/drafts/ibp-redesign-v1/pages/BindingActiveNewOpportunities.preview.html
module: core/drafts/ibp-redesign-v1
frontend: pretrade/opportunities-app binding BindingActiveNewOpportunities · BindingActiveModifiedOpportunities · BindingArchiveOpportunities
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.000"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tab, Table, TableCell, TableFilter, Pagination, Chip, Link, IconButton, Modal, Toast, SnackBar]
widgets: [tables/BindingOpportunitiesTable, modals/TakeOpportunityToWorkModal, modals/RefuseFromOpportunityModal]
---

# Page: BindingActiveNewOpportunities — Обязательные сделки

## 1. Назначение (Purpose)

Реестр «Обязательные сделки» роли «Аналитик ДИД»: вкладки-подфильтры, фильтр, переход на страницу сделки.

**Роль пользователя:** Аналитик ДИД
**Права:** просмотр; «Взять в работу» и «Отказаться» (Р7)

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** не решено (10.10.2026)
- **Адрес в прототипе:** `BindingActiveNewOpportunities.preview.html?tab=BindingActiveNewOpportunities`
- **Пункт бокового меню** в состоянии `nav__item--selected`: «Обязательные сделки».

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 | Главная | `HomePage.html` |
| 2 (текущий) | Обязательные сделки: <вкладка> | — |

## 3. Пары во фронтенде

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница (вкладка «Активные новые сделки») | `pages/BindingActiveNewOpportunities.html` | pretrade/opportunities-app `pages/root/binding/BindingActiveNewOpportunities` |
| Вкладка «Активные сделки с изменениями» | `?tab=BindingActiveModifiedOpportunities` | pretrade/opportunities-app `pages/root/binding/BindingActiveModifiedOpportunities` |
| Вкладка «В архиве» | `?tab=BindingArchiveOpportunities` | pretrade/opportunities-app `pages/root/binding/BindingArchiveOpportunities` |
| Шапка страницы | разметка страницы | PageBar — часть страницы |
| Реестр | `widgets/tables/BindingOpportunitiesTable` | pretrade/opportunities-app `widgets/tables/BindingOpportunitiesTable` |

## 4. Раскладка (Layout)

```
Page (Layout, nav--rail, screen--app)
├── PageHeader — «Обязательные сделки»
├── Tab ×3 — вкладки-подфильтры (Р4)
└── BindingOpportunitiesTable (12) — dtable--fill: Фильтр · «Краткий отчет» · Table · Pagination
```

**Блоки контента** — 12 колонок; ряды и ширины — в разметке страницы, скрипт только наполняет виджеты:

| № | Блок | Компонент или виджет | Колонок из 12 | Содержимое |
|---|---|---|---|---|
| 1 | Вкладки | Tab | 12 | Активные новые сделки · Активные сделки с изменениями · В архиве |
| 2 | Реестр | `widgets/tables/BindingOpportunitiesTable` | 12 | колонки и действия — паспорт виджета |

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
| `BindingOpportunitiesTable` | виджет концепта — `../widgets/tables/BindingOpportunitiesTable/BindingOpportunitiesTable.md` |
| `TakeOpportunityToWorkModal` | виджет концепта — `../widgets/modals/TakeOpportunityToWorkModal/TakeOpportunityToWorkModal.md` |
| `RefuseFromOpportunityModal` | виджет концепта — `../widgets/modals/RefuseFromOpportunityModal/RefuseFromOpportunityModal.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 6. Таблицы (Tables)

Таблица — виджет `BindingOpportunitiesTable` на общем рендере `data/registry-table.js`; колонки — конфиг `REGISTRY_CONFIGS` (`data/dictionaries.js`), состав — паспорт виджета. Непросмотренные строки — `tbl__row--accent`.

## 7. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| Вкладка | подфильтр одной таблицы (Р4): строки по вкладке, адрес `?tab=<страница фронтенда>`, крошка «Обязательные сделки: <вкладка>» |
| «Фильтр» | модалка `.tfm` общего рендера: поля по разделам фильтра; «Применить» — чип «Применено: N», крестик чипа сбрасывает всё |
| ID сделки | `Opportunity.preview.html?source=&id=&tab=`; строка помечается просмотренной |
| «Краткий отчет» | Toast «Файл выгружен» |
| Пагинация | `DSPagination.row` из кода: страница и размер страницы |
| «Взять в работу» в строке | окно `TakeOpportunityToWorkModal` → сделка уходит в Pipeline «Сделки моего деска», SnackBar, реестр обновляется (Р7) |
| «Отказаться» в строке | окно `RefuseFromOpportunityModal` → сделка во вкладке «В архиве», SnackBar (Р7) |

## 8. Модальные окна (Modals)

| id | Заголовок | Ширина | Содержимое | Кнопки подвала |
|---|---|---|---|---|
| `take-opp-scrim` | Взять сделку в работу | `--w3` | виджет `TakeOpportunityToWorkModal` | см. паспорт |
| `refuse-opp-scrim` | Отказаться от сделки | `--w4` | виджет `RefuseFromOpportunityModal` | см. паспорт |
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
| Заголовок | Обязательные сделки |
| Вкладка | Активные новые сделки |
| Вкладка | Активные сделки с изменениями |
| Вкладка | В архиве |
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
| Аналитик ДИД | да | «Взять в работу», «Отказаться» (Р7) |

## 12. Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| Страница | `pages/BindingActiveNewOpportunities.html` | `src/pages/root/binding/BindingActiveNewOpportunities.tsx` (+ вкладки) |
| Реестр | `widgets/tables/BindingOpportunitiesTable/` | `src/widgets/tables/BindingOpportunitiesTable/BindingOpportunitiesTable.tsx` |
| Окна действий | `widgets/modals/TakeOpportunityToWorkModal/`, `RefuseFromOpportunityModal/` | `src/features/modals/…` |
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
| З4 | Непросмотренная строка — `tbl__row--accent` ДС; в системе — голубой тон с отметкой слева. Модификатора TableCell под «не просмотрено» в ДС нет | пробел ДС |

---
screen: Opportunity
kind: screen
title: Сделка
file: apps/core/drafts/ibp-redesign-v1/pages/Opportunity.preview.html
module: core/drafts/ibp-redesign-v1
frontend: pretrade/opportunities-app pages/Opportunity/Opportunity
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.001"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tile, ReadOnlyField, Chip, Checkbox, ProgressBar, Alert, Divider, Buttons, IconButton, Link, Entity, Avatar, Modal, SnackBar, Tooltip]
widgets: [tiles/OpportunityClientTile, tiles/GeneralInformationTile, tiles/StateInformationTile, tiles/DescriptionTile, tiles/TimingTile, tiles/CommentsTile, tiles/FinancialMetricsTile, tiles/ProductsTile, tiles/OpportunityProductTile, tiles/DesksTile, tiles/OpportunityTeamMembersTile, tiles/OpportunityConnectionsTile, tiles/TasksTile, tiles/MeetingsProtocolsTile, tiles/CallReportsTile, modals/TakeOpportunityToWorkModal, modals/RefuseFromOpportunityModal]
---

# Page: Opportunity — Сделка

## 1. Назначение (Purpose)

Карточка сделки — один экран на все источники (`?source=binding|possible|cib|campaign|pipeline`): клиент, общая информация, статус, описание, сроки, комментарии, финансовые метрики, продукты, дески, команда, связи, задачи, встречи. Действия источника — «Отказаться» и «Взять в работу».

**Роль пользователя:** Аналитик ДИД
**Права:** просмотр; «Отказаться» и «Взять в работу» у обязательных, возможных и CIB в работе (Р7); карандаши и формы — по клику ничего (Р6)

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** не решено (10.10.2026)
- **Адрес в прототипе:** `Opportunity.preview.html?source=binding&id=166092&tab=active-new`
- **Пункт бокового меню** в состоянии `nav__item--selected`: пункт раздела источника (`IBPR_NAV.itemOf(source)`); после «Взять в работу» — «Pipeline».

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 | Главная | `HomePage.html` |
| 2 | <Раздел>: <Вкладка> | реестр источника `?tab=<страница фронтенда>` |
| 3 (текущий) | Сделка <ID>.<Проект> | — |

## 3. Пары во фронтенде

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница | `pages/Opportunity.html` | pretrade/opportunities-app `pages/Opportunity/Opportunity` |
| Шапка | PageHeader в разметке | OpportunityPageBar — часть страницы |
| Клиент | `OpportunityClientTile` | opportunityTiles/ClientTile/OpportunityClientTile |
| Общая информация | `GeneralInformationTile` | opportunityTiles/GeneralInformationTile |
| Статус | `StateInformationTile` | opportunityTiles/StateInformationTile |
| Описание сделки | `DescriptionTile` | opportunityTiles/DescriptionTile |
| Сроки | `TimingTile` | opportunityTiles/TimingTile |
| Комментарии к стадии | `CommentsTile` | tiles/CommentsTile |
| Финансовые метрики | `FinancialMetricsTile` | opportunityTiles/FinancialMetricsTile (часть — ValuesBlock) |
| Продукты сделки | `ProductsTile` + `OpportunityProductTile` | opportunityTiles/ProductsTile |
| Дески | `DesksTile` | opportunityTiles/DesksTile |
| Команда сделки | `OpportunityTeamMembersTile` | opportunityTiles/OpportunityTeamMembersTile |
| Связанные сделки | `OpportunityConnectionsTile` | opportunityTiles/OpportunityConnectionsTile |
| Задачи | `TasksTile` | opportunityTiles/TasksTile |
| Встречи и протоколы | `MeetingsProtocolsTile` | opportunityTiles/MeetingsProtocolsTile |
| Протоколы встреч проекта продаж | `CallReportsTile` | opportunityTiles/CallReportsTile (В5) |

## 4. Раскладка (Layout)

```
Page (Layout, nav--rail)
├── PageHeader — «<ID>. <Проект>», мета calendar · «Версия N (дата)»; «Отказаться» · «Взять в работу» (по варианту)
└── tile-group
    ├── ряд 1: OpportunityClientTile (6) · GeneralInformationTile (6)
    ├── ряд 2: StateInformationTile (4) · FinancialMetricsTile (8)
    ├── ряд 3: DescriptionTile (8) · TimingTile (4)
    ├── ряд 4: CommentsTile (4)
    ├── ряд 5: ProductsTile (12) — карточки OpportunityProductTile по 4
    ├── ряд 6: DesksTile (4) · OpportunityTeamMembersTile (4) · OpportunityConnectionsTile (4)
    └── ряд 7: TasksTile (4, CIB и кампании) · MeetingsProtocolsTile (4) · CallReportsTile (4, CIB и кампании)
```

**Блоки контента** — 12 колонок; ряды и ширины — в разметке страницы, скрипт только наполняет виджеты:

| № | Блок | Компонент или виджет | Колонок из 12 | Содержимое |
|---|---|---|---|---|
| 1 | Клиент · Общая информация | OpportunityClientTile · GeneralInformationTile | 6 + 6 | клиент — 8 полей шаблона, общая информация — 6; на узком шаге 12 + 12 |
| 2 | Статус · Финансовые метрики | StateInformationTile · FinancialMetricsTile | 4 + 8 | стадия, вероятность и параметры сделки рядом; на узком шаге 12 + 12 |
| 3 | Описание · Сроки | DescriptionTile · TimingTile | 8 + 4 | Alert К1 у CIB и кампаний |
| 4 | Комментарии | CommentsTile | 4 | самостоятельный блок сопровождения |
| 5 | Продукты сделки | ProductsTile | 12 | карточки по данным |
| 6 | Дески · Команда · Связи | DesksTile · OpportunityTeamMembersTile · OpportunityConnectionsTile | 4 + 4 + 4 | |
| 7 | Задачи · Встречи · Протоколы проекта продаж | TasksTile · MeetingsProtocolsTile · CallReportsTile | 4 + 4 + 4 | задачи и протоколы скрыты вне CIB и кампаний |

Порядок отличается от снимка системы по просьбе пользователя от 13.10.2026: «Клиент» и «Общая информация» получили по 6 колонок по объёму полей. «Статус» остаётся в верхней части рядом с финансовыми метриками; комментарии вынесены в самостоятельный блок. Состав данных и действия сохранены.

При ширине рабочей области до 1240px правило `@container screen` применяет штатные `colw-*`: верхние блоки занимают по 12 колонок. Две колонки полей общей информации сохранены для длинных названий проекта и недвижимости; рекомендация K5 о третьей колонке остаётся замечанием.

Вертикальный скролл: есть, скроллится контентная область, крошки залипают.

## 5. Компоненты (Components)

| Компонент | Откуда |
|---|---|
| Layout | ДС — `design-system/foundations/Layout/Layout.md` |
| NavPanel | ДС — `design-system/components/organisms/NavPanel/NavPanel.md` |
| Breadcrumbs | ДС — `design-system/components/molecules/Breadcrumbs/Breadcrumbs.md` |
| PageHeader | ДС — `design-system/components/organisms/PageHeader/PageHeader.md` |
| Tile | ДС — `design-system/components/organisms/Tile/Tile.md` |
| ReadOnlyField | ДС — `design-system/components/molecules/ReadOnlyField/ReadOnlyField.md` |
| Chip | ДС — `design-system/components/atoms/Chip/Chip.md` |
| Checkbox | ДС — `design-system/components/atoms/Checkbox/Checkbox.md` |
| ProgressBar | ДС — `design-system/components/atoms/ProgressBar/ProgressBar.md` |
| Alert | ДС — `design-system/components/molecules/Alert/Alert.md` |
| Divider | ДС — `design-system/components/atoms/Divider/Divider.md` |
| Buttons | ДС — `design-system/components/atoms/Buttons/Buttons.md` |
| IconButton | ДС — `design-system/components/atoms/IconButton/IconButton.md` |
| Link | ДС — `design-system/components/atoms/Link/Link.md` |
| Entity | ДС — `design-system/components/organisms/Entity/Entity.md` |
| Avatar | ДС — `design-system/components/atoms/Avatar/Avatar.md` |
| Modal | ДС — `design-system/components/organisms/Modal/Modal.md` |
| SnackBar | ДС — `design-system/components/organisms/SnackBar/SnackBar.md` |
| Tooltip | ДС — `design-system/components/molecules/Tooltip/Tooltip.md` |
| `OpportunityClientTile` | виджет концепта — `../widgets/tiles/OpportunityClientTile/OpportunityClientTile.md` |
| `GeneralInformationTile` | виджет концепта — `../widgets/tiles/GeneralInformationTile/GeneralInformationTile.md` |
| `StateInformationTile` | виджет концепта — `../widgets/tiles/StateInformationTile/StateInformationTile.md` |
| `DescriptionTile` | виджет концепта — `../widgets/tiles/DescriptionTile/DescriptionTile.md` |
| `TimingTile` | виджет концепта — `../widgets/tiles/TimingTile/TimingTile.md` |
| `CommentsTile` | виджет концепта — `../widgets/tiles/CommentsTile/CommentsTile.md` |
| `FinancialMetricsTile` | виджет концепта — `../widgets/tiles/FinancialMetricsTile/FinancialMetricsTile.md` |
| `ProductsTile` | виджет концепта — `../widgets/tiles/ProductsTile/ProductsTile.md` |
| `OpportunityProductTile` | виджет концепта — `../widgets/tiles/OpportunityProductTile/OpportunityProductTile.md` |
| `DesksTile` | виджет концепта — `../widgets/tiles/DesksTile/DesksTile.md` |
| `OpportunityTeamMembersTile` | виджет концепта — `../widgets/tiles/OpportunityTeamMembersTile/OpportunityTeamMembersTile.md` |
| `OpportunityConnectionsTile` | виджет концепта — `../widgets/tiles/OpportunityConnectionsTile/OpportunityConnectionsTile.md` |
| `TasksTile` | виджет концепта — `../widgets/tiles/TasksTile/TasksTile.md` |
| `MeetingsProtocolsTile` | виджет концепта — `../widgets/tiles/MeetingsProtocolsTile/MeetingsProtocolsTile.md` |
| `CallReportsTile` | виджет концепта — `../widgets/tiles/CallReportsTile/CallReportsTile.md` |
| `TakeOpportunityToWorkModal` | виджет концепта — `../widgets/modals/TakeOpportunityToWorkModal/TakeOpportunityToWorkModal.md` |
| `RefuseFromOpportunityModal` | виджет концепта — `../widgets/modals/RefuseFromOpportunityModal/RefuseFromOpportunityModal.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 6. Таблицы (Tables)

Таблиц в разметке страницы нет: таблицы — виджеты, колонки — в их паспортах.

## 7. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| «Взять в работу» | окно `TakeOpportunityToWorkModal` → сделка в Pipeline «Сделки моего деска», SnackBar; страница перерисовывается: крошки «Pipeline: Сделки моего деска», стадия «Проработка идеи сделки», действий источника нет, адрес и пункт меню — Pipeline |
| «Отказаться» | окно `RefuseFromOpportunityModal` → «В архиве» источника, статус «Выбыла», причина и комментарий в «Статусе» |
| Стрелка «Клиент» | `ClientInfoPage.preview.html?id=…` |
| Стрелка карточки продукта | `OpportunityProduct.preview.html?source=&deal=&product=` |
| «Проект продаж …» в связях | реестр проектов продаж |
| Строка задачи | `TasksPage.preview.html?id=…` |
| Карандаши, «Документы по сделке», «Презентация для ПИК», «Добавить» | по клику ничего (Р6) |
| Открытие страницы | сделка помечается просмотренной |

## 8. Модальные окна (Modals)

| id | Заголовок | Ширина | Содержимое | Кнопки подвала |
|---|---|---|---|---|
| `take-opp-scrim` | Взять сделку в работу | `--w3` | виджет `TakeOpportunityToWorkModal` | см. паспорт |
| `refuse-opp-scrim` | Отказаться от сделки | `--w4` | виджет `RefuseFromOpportunityModal` | см. паспорт |

## 9. Состояния (States)

### Loading
В прототипе не моделируется: демо-данные в памяти. У виджетов — блок загрузки по `data-state="loading"` (паспорта).

### Empty
Пустое состояние — у виджетов (паспорта).

### Error
В прототипе не моделируется. У виджетов — Alert с повтором по `data-state="error"` (паспорта).

### Disabled
Действия источника скрыты у кампаний, Pipeline и выбывших сделок (вариант страницы).

## 10. Тексты интерфейса (Texts)

| Место | Текст |
|---|---|
| Заголовок | <ID>. <Проект> |
| Действия | Отказаться · Взять в работу |
| SnackBar | Сделка <ID> взята в работу · Она в Pipeline, вкладка «Сделки моего деска» |
| Тексты тайлов | паспорта виджетов |

## 11. Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — в паспортах виджетов и typedef демо-данных. Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../data/opportunities.js` | `window.MOCK_OPPORTUNITIES` | `OpportunityRsDto[]` | invented (10.10.2026) |
| `../data/clients.js` | `window.MOCK_CLIENTS` | `ClientRsDto[]` | invented (10.10.2026) |
| `../data/employees.js` | `window.MOCK_EMPLOYEES` | `EmployeeRsDto[]` | invented (10.10.2026) |
| `../data/tasks.js` | `window.MOCK_TASKS` | `TaskRsDto[]` | invented (10.10.2026) |
| `../data/dictionaries.js` | `window.REGISTRY_CONFIGS`, `*_LABELS` | конфиги, подписи кодов | invented (10.10.2026) |
| `../data/store.js` | `window.IBPR` | — | хранилище: выборки, действия Р7, sessionStorage |
| `../data/nav-links.js` | `window.IBPR_NAV` | — | меню и карта страниц |

### Permissions — роли, права, флаги

| Роль | Просмотр | Действия |
|---|---|---|
| Аналитик ДИД | да | «Взять в работу», «Отказаться» (Р7) |

## 12. Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| Страница | `pages/Opportunity.html` | `src/pages/Opportunity/Opportunity/Opportunity.tsx` |
| Тайлы | `widgets/tiles/<Имя>/` | `src/widgets/tiles/opportunityTiles/<Имя>/<Имя>.tsx` |
| Окна | `widgets/modals/<Имя>/` | `src/features/modals/<Имя>/<Имя>.tsx` |

Пути фронтенда — по соглашениям его модуля; окончательный путь выбирает разработка.

## 13. Доступность

- `<main>` для контентной области, `<nav aria-label="Хлебные крошки">`, `<nav aria-label="Главное меню">`;
- заголовок страницы — единственный `h1`;
- у всех кнопок-иконок есть `aria-label`;
- вкладки — `role="tablist"`, переключатели — `role="radiogroup"`.

## 14. Открытые вопросы и допущения (Open questions)

| № | Вопрос / допущение | Статус |
|---|---|---|
| 1 | Число у иконки calendar в шапке — смысл неизвестен (открытый вопрос 6 MS0014) | вопрос |
| 2 | Значок у ТБ и ГОСБ — только у обязательных (открытый вопрос 7 MS0014) | вопрос |
| 3 | Порядок и ширины рядов 6–7 на снимках обрезаны — раскладка по правилам Tile | допущение |
| 4 | Ширины «Клиента» и «Общей информации» — по 6 колонок; прежнее отклонение K4 снято по просьбе пользователя | решено (13.10.2026) |
| 5 | «Протоколы встреч в рамках проекта продаж» — пара CallReportsTile (В5 MS0014a) | допущение |
| 3 | Меню и карта страниц — `data/nav-links.js`: один источник на концепт; пункт без страницы — клик гасится (Р5) | решено (MS0014a, С1) |

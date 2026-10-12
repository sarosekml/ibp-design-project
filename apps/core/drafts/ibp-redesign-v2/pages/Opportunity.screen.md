---
screen: Opportunity
kind: screen
title: Сделка
file: apps/core/drafts/ibp-redesign-v2/pages/Opportunity.preview.html
module: core/drafts/ibp-redesign-v2
frontend: pretrade/opportunities-app pages/Opportunity/Opportunity
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.001"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tile, ReadOnlyField, Chip, Checkbox, ProgressBar, Alert, Divider, Buttons, IconButton, Link, Entity, Avatar, Modal, SnackBar, Tooltip]
widgets: [tiles/V2OpportunityClientTile, tiles/V2GeneralInformationTile, tiles/V2StateInformationTile, tiles/V2DescriptionTile, tiles/V2TimingTile, tiles/V2CommentsTile, tiles/V2FinancialMetricsTile, tiles/V2ProductsTile, tiles/V2OpportunityProductTile, tiles/V2DesksTile, tiles/V2OpportunityTeamMembersTile, tiles/V2OpportunityConnectionsTile, tiles/V2TasksTile, tiles/V2MeetingsProtocolsTile, tiles/V2CallReportsTile, modals/V2TakeOpportunityToWorkModal, modals/V2RefuseFromOpportunityModal]
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
| Клиент | `V2OpportunityClientTile` | opportunityTiles/ClientTile/V2OpportunityClientTile |
| Общая информация | `V2GeneralInformationTile` | opportunityTiles/V2GeneralInformationTile |
| Статус | `V2StateInformationTile` | opportunityTiles/V2StateInformationTile |
| Описание сделки | `V2DescriptionTile` | opportunityTiles/V2DescriptionTile |
| Сроки | `V2TimingTile` | opportunityTiles/V2TimingTile |
| Комментарии к стадии | `V2CommentsTile` | tiles/V2CommentsTile |
| Финансовые метрики | `V2FinancialMetricsTile` | opportunityTiles/V2FinancialMetricsTile (часть — ValuesBlock) |
| Продукты сделки | `V2ProductsTile` + `V2OpportunityProductTile` | opportunityTiles/V2ProductsTile |
| Дески | `V2DesksTile` | opportunityTiles/V2DesksTile |
| Команда сделки | `V2OpportunityTeamMembersTile` | opportunityTiles/V2OpportunityTeamMembersTile |
| Связанные сделки | `V2OpportunityConnectionsTile` | opportunityTiles/V2OpportunityConnectionsTile |
| Задачи | `V2TasksTile` | opportunityTiles/V2TasksTile |
| Встречи и протоколы | `V2MeetingsProtocolsTile` | opportunityTiles/V2MeetingsProtocolsTile |
| Протоколы встреч проекта продаж | `V2CallReportsTile` | opportunityTiles/V2CallReportsTile (В5) |

## 4. Раскладка (Layout)

```
Page (Layout, nav--rail)
├── PageHeader — «<ID>. <Проект>», мета calendar · «Версия N (дата)»; «Отказаться» · «Взять в работу» (по варианту)
└── tile-group
    ├── ряд 1: V2OpportunityClientTile (6) · V2GeneralInformationTile (6)
    ├── ряд 2: V2StateInformationTile (4) · V2FinancialMetricsTile (8)
    ├── ряд 3: V2DescriptionTile (8) · V2TimingTile (4)
    ├── ряд 4: V2CommentsTile (4)
    ├── ряд 5: V2ProductsTile (12) — карточки V2OpportunityProductTile по 4
    ├── ряд 6: V2DesksTile (4) · V2OpportunityTeamMembersTile (4) · V2OpportunityConnectionsTile (4)
    └── ряд 7: V2TasksTile (4, CIB и кампании) · V2MeetingsProtocolsTile (4) · V2CallReportsTile (4, CIB и кампании)
```

**Блоки контента** — 12 колонок; ряды и ширины — в разметке страницы, скрипт только наполняет виджеты:

| № | Блок | Компонент или виджет | Колонок из 12 | Содержимое |
|---|---|---|---|---|
| 1 | Клиент · Общая информация | V2OpportunityClientTile · V2GeneralInformationTile | 6 + 6 | клиент — 8 полей шаблона, общая информация — 6; на узком шаге 12 + 12 |
| 2 | Статус · Финансовые метрики | V2StateInformationTile · V2FinancialMetricsTile | 4 + 8 | стадия, вероятность и параметры сделки рядом; на узком шаге 12 + 12 |
| 3 | Описание · Сроки | V2DescriptionTile · V2TimingTile | 8 + 4 | Alert К1 у CIB и кампаний |
| 4 | Комментарии | V2CommentsTile | 4 | самостоятельный блок сопровождения |
| 5 | Продукты сделки | V2ProductsTile | 12 | карточки по данным |
| 6 | Дески · Команда · Связи | V2DesksTile · V2OpportunityTeamMembersTile · V2OpportunityConnectionsTile | 4 + 4 + 4 | |
| 7 | Задачи · Встречи · Протоколы проекта продаж | V2TasksTile · V2MeetingsProtocolsTile · V2CallReportsTile | 4 + 4 + 4 | задачи и протоколы скрыты вне CIB и кампаний |

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
| `V2OpportunityClientTile` | виджет концепта — `../widgets/tiles/V2OpportunityClientTile/V2OpportunityClientTile.md` |
| `V2GeneralInformationTile` | виджет концепта — `../widgets/tiles/V2GeneralInformationTile/V2GeneralInformationTile.md` |
| `V2StateInformationTile` | виджет концепта — `../widgets/tiles/V2StateInformationTile/V2StateInformationTile.md` |
| `V2DescriptionTile` | виджет концепта — `../widgets/tiles/V2DescriptionTile/V2DescriptionTile.md` |
| `V2TimingTile` | виджет концепта — `../widgets/tiles/V2TimingTile/V2TimingTile.md` |
| `V2CommentsTile` | виджет концепта — `../widgets/tiles/V2CommentsTile/V2CommentsTile.md` |
| `V2FinancialMetricsTile` | виджет концепта — `../widgets/tiles/V2FinancialMetricsTile/V2FinancialMetricsTile.md` |
| `V2ProductsTile` | виджет концепта — `../widgets/tiles/V2ProductsTile/V2ProductsTile.md` |
| `V2OpportunityProductTile` | виджет концепта — `../widgets/tiles/V2OpportunityProductTile/V2OpportunityProductTile.md` |
| `V2DesksTile` | виджет концепта — `../widgets/tiles/V2DesksTile/V2DesksTile.md` |
| `V2OpportunityTeamMembersTile` | виджет концепта — `../widgets/tiles/V2OpportunityTeamMembersTile/V2OpportunityTeamMembersTile.md` |
| `V2OpportunityConnectionsTile` | виджет концепта — `../widgets/tiles/V2OpportunityConnectionsTile/V2OpportunityConnectionsTile.md` |
| `V2TasksTile` | виджет концепта — `../widgets/tiles/V2TasksTile/V2TasksTile.md` |
| `V2MeetingsProtocolsTile` | виджет концепта — `../widgets/tiles/V2MeetingsProtocolsTile/V2MeetingsProtocolsTile.md` |
| `V2CallReportsTile` | виджет концепта — `../widgets/tiles/V2CallReportsTile/V2CallReportsTile.md` |
| `V2TakeOpportunityToWorkModal` | виджет концепта — `../widgets/modals/V2TakeOpportunityToWorkModal/V2TakeOpportunityToWorkModal.md` |
| `V2RefuseFromOpportunityModal` | виджет концепта — `../widgets/modals/V2RefuseFromOpportunityModal/V2RefuseFromOpportunityModal.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 6. Таблицы (Tables)

Таблиц в разметке страницы нет: таблицы — виджеты, колонки — в их паспортах.

## 7. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| «Взять в работу» | окно `V2TakeOpportunityToWorkModal` → сделка в Pipeline «Сделки моего деска», SnackBar; страница перерисовывается: крошки «Pipeline: Сделки моего деска», стадия «Проработка идеи сделки», действий источника нет, адрес и пункт меню — Pipeline |
| «Отказаться» | окно `V2RefuseFromOpportunityModal` → «В архиве» источника, статус «Выбыла», причина и комментарий в «Статусе» |
| Стрелка «Клиент» | `ClientInfoPage.preview.html?id=…` |
| Стрелка карточки продукта | `OpportunityProduct.preview.html?source=&deal=&product=` |
| «Проект продаж …» в связях | реестр проектов продаж |
| Строка задачи | `TasksPage.preview.html?id=…` |
| Карандаши, «Документы по сделке», «Презентация для ПИК», «Добавить» | по клику ничего (Р6) |
| Открытие страницы | сделка помечается просмотренной |

## 8. Модальные окна (Modals)

| id | Заголовок | Ширина | Содержимое | Кнопки подвала |
|---|---|---|---|---|
| `take-opp-scrim` | Взять сделку в работу | `--w3` | виджет `V2TakeOpportunityToWorkModal` | см. паспорт |
| `refuse-opp-scrim` | Отказаться от сделки | `--w4` | виджет `V2RefuseFromOpportunityModal` | см. паспорт |

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
| 5 | «Протоколы встреч в рамках проекта продаж» — пара V2CallReportsTile (В5 MS0014a) | допущение |
| 3 | Меню и карта страниц — `data/nav-links.js`: один источник на концепт; пункт без страницы — клик гасится (Р5) | решено (MS0014a, С1) |

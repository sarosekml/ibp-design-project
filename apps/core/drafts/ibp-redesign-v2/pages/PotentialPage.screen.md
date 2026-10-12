---
screen: PotentialPage
kind: screen
title: Лид
file: apps/core/drafts/ibp-redesign-v2/pages/PotentialPage.preview.html
module: core/drafts/ibp-redesign-v2
frontend: pretrade/offersources-app pages/PotentialPage
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.001"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tile, ReadOnlyField, Chip, Divider, Buttons, IconButton, Link, Entity, Avatar, Modal, SnackBar]
widgets: [tiles/V2OpportunityClientTile, tiles/V2GeneralInformationTile, tiles/V2ProductsTile, tiles/V2OpportunityProductTile, tiles/V2CommentsTile, tiles/V2MeetingsProtocolsTile, tiles/V2DesksTile, tiles/V2OpportunityTeamMembersTile, tiles/V2OpportunityConnectionsTile]
---

# Page: PotentialPage — Лид

## 1. Назначение (Purpose)

Карточка лида (во фронтенде — «потенциал»): клиент, общая информация, продукт, комментарии, встречи, дески, команда, связи; «Переместить в Pipeline».

**Роль пользователя:** Аналитик ДИД
**Права:** просмотр; «Переместить в Pipeline» (Р7); карандаши и «Добавить» — по клику ничего (Р6)

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** не решено (10.10.2026)
- **Адрес в прототипе:** `PotentialPage.preview.html?id=L-44`
- **Пункт бокового меню** в состоянии `nav__item--selected`: «Лиды» (обязательные и возможные лиды — свои пункты).

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 | Главная | `HomePage.html` |
| 2 | Лиды: Лиды · Лиды: Лиды для КМ · Обязательные лиды · Возможные лиды | реестр по виду лида |
| 3 (текущий) | <ID>. <Клиент> | — |

## 3. Пары во фронтенде

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница | `pages/PotentialPage.html` | pretrade/offersources-app `pages/PotentialPage` |
| Шапка | PageHeader в разметке | PotentialsRDPageBar — часть страницы |
| Клиент | `V2OpportunityClientTile` (variant potential) | PotentialTiles/ClientTile |
| Общая информация | `V2GeneralInformationTile` (variant potential) | PotentialTiles/V2GeneralInformationTile |
| Продукт | `V2ProductsTile` (variant potential) | PotentialTiles/PotentialProductsTile |
| Комментарии | `V2CommentsTile` | PotentialTiles/V2CommentsTile |
| Встречи | `V2MeetingsProtocolsTile` (variant potential) | PotentialTiles/V2MeetingsProtocolsTile |
| Дески | `V2DesksTile` | PotentialTiles/V2DesksTile |
| Команда потенциала | `V2OpportunityTeamMembersTile` | PotentialTiles/PotentialTeamTile |
| Связи | `V2OpportunityConnectionsTile` | PotentialTiles/ConnectionsTile |

## 4. Раскладка (Layout)

```
Page (Layout, nav--rail)
├── PageHeader — «<ID>. <Клиент>», мета calendar · «Переместить в Pipeline»
└── tile-group
    ├── ряд 1: V2OpportunityClientTile (6) · V2GeneralInformationTile (6)
    ├── ряд 2: V2ProductsTile (12)
    ├── ряд 3: V2CommentsTile (4) · V2MeetingsProtocolsTile (4) · V2DesksTile (4)
    └── ряд 4: V2OpportunityTeamMembersTile (4) · V2OpportunityConnectionsTile (4)
```

**Блоки контента** — 12 колонок; ряды и ширины — в разметке страницы, скрипт только наполняет виджеты:

| № | Блок | Компонент или виджет | Колонок из 12 | Содержимое |
|---|---|---|---|---|
| 1 | Клиент · Общая информация | V2OpportunityClientTile · V2GeneralInformationTile | 6 + 6 | вариант лида; на узком шаге 12 + 12 |
| 2 | Продукт | V2ProductsTile | 12 | пусто — текст и «Добавить» в теле |
| 3 | Комментарии · Встречи · Дески | V2CommentsTile · V2MeetingsProtocolsTile · V2DesksTile | 4 + 4 + 4 | «Встречи», «Добавить» в теле |
| 4 | Команда · Связи | V2OpportunityTeamMembersTile · V2OpportunityConnectionsTile | 4 + 4 | неполный ряд по ТЗ §4.6, сумма ≤ 12 |

Ширины верхних блоков отличаются от снимка системы по просьбе пользователя от 13.10.2026: каждому отведено по 6 колонок, прежнее отклонение K4 снято. Порядок блоков и состав данных сохранены. При ширине рабочей области до 1240px `@container screen` применяет штатные `colw-*`; верхние блоки занимают по 12 колонок. Идея сделки внутри тайла занимает весь ряд, даты остаются парой.

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
| Divider | ДС — `design-system/components/atoms/Divider/Divider.md` |
| Buttons | ДС — `design-system/components/atoms/Buttons/Buttons.md` |
| IconButton | ДС — `design-system/components/atoms/IconButton/IconButton.md` |
| Link | ДС — `design-system/components/atoms/Link/Link.md` |
| Entity | ДС — `design-system/components/organisms/Entity/Entity.md` |
| Avatar | ДС — `design-system/components/atoms/Avatar/Avatar.md` |
| Modal | ДС — `design-system/components/organisms/Modal/Modal.md` |
| SnackBar | ДС — `design-system/components/organisms/SnackBar/SnackBar.md` |
| `V2OpportunityClientTile` | виджет концепта — `../widgets/tiles/V2OpportunityClientTile/V2OpportunityClientTile.md` |
| `V2GeneralInformationTile` | виджет концепта — `../widgets/tiles/V2GeneralInformationTile/V2GeneralInformationTile.md` |
| `V2ProductsTile` | виджет концепта — `../widgets/tiles/V2ProductsTile/V2ProductsTile.md` |
| `V2OpportunityProductTile` | виджет концепта — `../widgets/tiles/V2OpportunityProductTile/V2OpportunityProductTile.md` |
| `V2CommentsTile` | виджет концепта — `../widgets/tiles/V2CommentsTile/V2CommentsTile.md` |
| `V2MeetingsProtocolsTile` | виджет концепта — `../widgets/tiles/V2MeetingsProtocolsTile/V2MeetingsProtocolsTile.md` |
| `V2DesksTile` | виджет концепта — `../widgets/tiles/V2DesksTile/V2DesksTile.md` |
| `V2OpportunityTeamMembersTile` | виджет концепта — `../widgets/tiles/V2OpportunityTeamMembersTile/V2OpportunityTeamMembersTile.md` |
| `V2OpportunityConnectionsTile` | виджет концепта — `../widgets/tiles/V2OpportunityConnectionsTile/V2OpportunityConnectionsTile.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 6. Таблицы (Tables)

Таблиц в разметке страницы нет: таблицы — виджеты, колонки — в их паспортах.

## 7. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| «Переместить в Pipeline» | окно подтверждения → сделка в Pipeline «Сделки моего деска», лид получает статус «Перемещён в Pipeline», SnackBar; в «Связях» — ссылка на сделку (Р7) |
| Стрелка «Клиент» | `ClientInfoPage.preview.html?id=…` |
| Карандаши, «Добавить», «Документы по клиенту» | по клику ничего (Р6) |

## 8. Модальные окна (Modals)

| id | Заголовок | Ширина | Содержимое | Кнопки подвала |
|---|---|---|---|---|
| `move-pipeline-scrim` | Переместить в Pipeline | `--w3` | текст подтверждения | «Отмена», «Переместить» |

## 9. Состояния (States)

### Loading
В прототипе не моделируется: демо-данные в памяти. У виджетов — блок загрузки по `data-state="loading"` (паспорта).

### Empty
Пустое состояние — у виджетов (паспорта).

### Error
В прототипе не моделируется. У виджетов — Alert с повтором по `data-state="error"` (паспорта).

### Disabled
Лид не в работе — «Переместить в Pipeline» скрыта.

## 10. Тексты интерфейса (Texts)

| Место | Текст |
|---|---|
| Действие | Переместить в Pipeline |
| Подтверждение | По лиду <ID> будет создана сделка в Pipeline, вкладка «Сделки моего деска». Лид покинет реестр «Лиды». |
| SnackBar | Лид перемещён в Pipeline · Сделка <ID> — Pipeline, «Сделки моего деска» |

## 11. Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — в паспортах виджетов и typedef демо-данных. Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../data/potentials.js` | `window.MOCK_POTENTIALS` | `PotentialRsDto[]` | invented (10.10.2026) |
| `../data/clients.js` | `window.MOCK_CLIENTS` | `ClientRsDto[]` | invented (10.10.2026) |
| `../data/employees.js` | `window.MOCK_EMPLOYEES` | `EmployeeRsDto[]` | invented (10.10.2026) |
| `../data/dictionaries.js` | `window.REGISTRY_CONFIGS`, `*_LABELS` | конфиги, подписи кодов | invented (10.10.2026) |
| `../data/store.js` | `window.IBPR` | — | хранилище: выборки, действия Р7, sessionStorage |
| `../data/nav-links.js` | `window.IBPR_NAV` | — | меню и карта страниц |

### Permissions — роли, права, флаги

| Роль | Просмотр | Действия |
|---|---|---|
| Аналитик ДИД | да | «Переместить в Pipeline» (Р7) |

## 12. Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| Страница | `pages/PotentialPage.html` | `src/pages/PotentialPage/PotentialPage.tsx` |
| Тайлы | общие виджеты сделки в варианте лида | `src/widgets/tiles/PotentialTiles/<Имя>/<Имя>.tsx` |

Пути фронтенда — по соглашениям его модуля; окончательный путь выбирает разработка.

## 13. Доступность

- `<main>` для контентной области, `<nav aria-label="Хлебные крошки">`, `<nav aria-label="Главное меню">`;
- заголовок страницы — единственный `h1`;
- у всех кнопок-иконок есть `aria-label`;
- вкладки — `role="tablist"`, переключатели — `role="radiogroup"`.

## 14. Открытые вопросы и допущения (Open questions)

| № | Вопрос / допущение | Статус |
|---|---|---|
| 1 | Тайлы лида — общие виджеты сделки с вариантом (правило 6 MS0014a); во фронтенде — отдельные виджеты offersources-app | решено (MS0014a) |
| 2 | Ширины «Клиента» и «Общей информации» — по 6 колонок; прежнее отклонение K4 снято по просьбе пользователя | решено (13.10.2026) |
| 3 | Меню и карта страниц — `data/nav-links.js`: один источник на концепт; пункт без страницы — клик гасится (Р5) | решено (MS0014a, С1) |

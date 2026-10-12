---
screen: ClientInfoPage
kind: screen
title: Клиент
file: apps/core/drafts/ibp-redesign-v1/pages/ClientInfoPage.preview.html
module: core/drafts/ibp-redesign-v1
frontend: core/clients-app pages/ClientInfo/ClientInfoPage
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.000"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tab, SegmentControl, Tile, ReadOnlyField, Entity, Avatar, Chip, DocCard, Link, Buttons, IconButton, ContextMenu, Splitter, Table, TableCell, TableFilter, Pagination, Chart, Badge, Modal, SnackBar, Toast]
widgets: [tiles/GoalsPopoverBadge, tiles/IndustryInfoTile, tiles/RequisitesInfoTile, tiles/CommentsTile, tiles/DocumentsInfoTile, tiles/TeamInfoTile, tiles/RelatedPersonsTile, tiles/DesksTile, tiles/ClientTimingsTile, tiles/ClientNewsTile, tiles/GigaInfoTile, tables/MeetingsProtocolsList, tiles/MeetingsProtocolsDetails, tables/TasksTable, tables/TaskHistoryTable, tiles/TaskPreviewTile, modals/ChangeTaskStatusModal, tables/LeadsTable, tables/OpportunitiesPipelineTable, tables/BindingOpportunitiesTable, tables/PossibleOpportunitiesTable, tables/MaPipelineTable, tables/DcmEcmPipelineTable, tiles/FinancialsChart, tables/FinancialsTable, tiles/StratDialogueCard, tiles/GoalArchiveSection, tiles/ClientCreditsList]
---

# Page: ClientInfoPage — Клиент

## 1. Назначение (Purpose)

Карточка клиента: шапка с признаками и девять вкладок — общая информация, встречи, задачи, сделки, финансовые показатели, цели, кредиты, финансовый анализ, новости.

**Роль пользователя:** Аналитик ДИД
**Права:** просмотр; действия Р7 над встречами и задачами; формы, карандаши, «Новая встреча», «Новый лид» — по клику ничего (Р6)

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** не решено (10.10.2026)
- **Адрес в прототипе:** `ClientInfoPage.preview.html?id=3000012345&tab=ClientInfoPage`
- **Пункт бокового меню** в состоянии `nav__item--selected`: «Клиенты».

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 | Главная | `HomePage.html` |
| 2 | Клиенты | `MyClientsPage.preview.html` |
| 3 (текущий) | <Клиент> | — |

## 3. Пары во фронтенде

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница («Общая информация») | `pages/ClientInfoPage.html` | core/clients-app `pages/ClientInfo/ClientInfoPage` |
| Шапка | PageHeader в разметке | ClientInfoPageHeader — часть страницы (entities) |
| Вкладка «Сделки» | `?tab=ClientInfoDealsPage` | core/clients-app `pages/ClientInfoDeals/ClientInfoDealsPage` |
| Вкладка «Финансовые показатели» | `?tab=ClientInfoFinancials` | core/clients-app `pages/ClientInfoFinancials/ClientInfoFinancials` |
| Вкладка «Цели» | `?tab=ClientInfoGoalsPage` | core/clients-app `pages/ClientInfoGoals/ClientInfoGoalsPage` |
| Вкладки «Встречи», «Задачи», «Кредиты», «Финансовый анализ», «Новости» | `?tab=meetings|tasks|credits|analysis` | пар нет |
| Отрасль · Реквизиты · Документы · Команда · ГигаСправка | `IndustryInfoTile` · `RequisitesInfoTile` · `DocumentsInfoTile` · `TeamInfoTile` ×2 · `GigaInfoTile` | core/clients-app `widgets/Tiles/<Имя>` |
| Связанные физлица · Новости · Сроки | `RelatedPersonsTile` · `ClientNewsTile` · `ClientTimingsTile` | пар нет |
| «Цели зафиксированы» | `GoalsPopoverBadge` | core/clients-app `widgets/GoalsPopoverBadge` |
| Таблицы вкладки «Сделки» | `LeadsTable` ×4 · `OpportunitiesPipelineTable` · `BindingOpportunitiesTable` · `PossibleOpportunitiesTable` · `MaPipelineTable` · `DcmEcmPipelineTable` ×2 | OffersToProcessTable, PotentialsRDTable, MaPipelineTable, DcmEcmPipelineTable и реестры сделок |
| График и таблица ФОК | `FinancialsChart` · `FinancialsTable` | core/clients-app `widgets/Charts/FinancialsChart` · FinancialsTable |
| Цели | `StratDialogueCard` · `GoalArchiveSection` | core/clients-app `features/StratDialogueCard` · `widgets/Tiles/GoalArchiveSection` |
| Кредиты | `ClientCreditsList` | пары нет |

## 4. Раскладка (Layout)

```
Page (Layout, nav--rail)
├── PageHeader — иконка factory-01 · название · холдинг (meta) · .phead__extras: чипы клиента, GoalsPopoverBadge, счётчик с ⓘ · меню «Ещё»
├── Tab ×9 — Общая информация · Встречи · Задачи · Сделки · Финансовые показатели · Цели · Кредиты · Финансовый анализ · Новости (Р3)
├── [Общая информация] tile-row: 3 стопки по 4
│   ├── IndustryInfoTile · RequisitesInfoTile · CommentsTile · DocumentsInfoTile
│   ├── TeamInfoTile (главный КМ) · RelatedPersonsTile · TeamInfoTile (команда ДИД) · DesksTile · ClientTimingsTile
│   └── ClientNewsTile · GigaInfoTile
├── [Встречи] действия · Splitter: MeetingsProtocolsList | MeetingsProtocolsDetails
├── [Задачи] действия · Splitter: TasksTable | TaskPreviewTile
├── [Сделки] SegmentControl Лиды · Pipeline · Портфель (Р3)
│   ├── Лиды: LeadsTable ×4 (12 · 12 · 6 + 6)
│   └── Pipeline: OpportunitiesPipelineTable (12) · Binding + Possible (6 + 6) · MaPipelineTable (12) · DcmEcmPipelineTable ×2 (6 + 6)
├── [Финансовые показатели] SegmentControl ФОК · Пользовательские метрики: FinancialsChart (12) · FinancialsTable (12) | Tile метрик (12)
├── [Цели] SegmentControl Бизнес · Личные: сетка StratDialogueCard по 3 · GoalArchiveSection ×N
├── [Кредиты] SegmentControl Действующие · Pipeline: сводка 4 + 4 + 4 · ClientCreditsList (12)
└── [Финансовый анализ] SegmentControl из 7 разделов · FinancialsTable (12)
```

Вертикальный скролл: есть, скроллится контентная область, крошки залипают.

## 5. Компоненты (Components)

| Компонент | Откуда |
|---|---|
| Layout | ДС — `design-system/foundations/Layout/Layout.md` |
| NavPanel | ДС — `design-system/components/organisms/NavPanel/NavPanel.md` |
| Breadcrumbs | ДС — `design-system/components/molecules/Breadcrumbs/Breadcrumbs.md` |
| PageHeader | ДС — `design-system/components/organisms/PageHeader/PageHeader.md` |
| Tab | ДС — `design-system/components/molecules/Tab/Tab.md` |
| SegmentControl | ДС — `design-system/components/molecules/SegmentControl/SegmentControl.md` |
| Tile | ДС — `design-system/components/organisms/Tile/Tile.md` |
| ReadOnlyField | ДС — `design-system/components/molecules/ReadOnlyField/ReadOnlyField.md` |
| Entity | ДС — `design-system/components/organisms/Entity/Entity.md` |
| Avatar | ДС — `design-system/components/atoms/Avatar/Avatar.md` |
| Chip | ДС — `design-system/components/atoms/Chip/Chip.md` |
| DocCard | ДС — `design-system/components/molecules/DocCard/DocCard.md` |
| Link | ДС — `design-system/components/atoms/Link/Link.md` |
| Buttons | ДС — `design-system/components/atoms/Buttons/Buttons.md` |
| IconButton | ДС — `design-system/components/atoms/IconButton/IconButton.md` |
| ContextMenu | ДС — `design-system/components/molecules/ContextMenu/ContextMenu.md` |
| Splitter | ДС — `design-system/components/molecules/Splitter/Splitter.md` |
| Table | ДС — `design-system/components/organisms/Table/Table.md` |
| TableCell | ДС — `design-system/components/organisms/TableCell/TableCell.md` |
| TableFilter | ДС — `design-system/components/organisms/TableFilter/TableFilter.md` |
| Pagination | ДС — `design-system/components/molecules/Pagination/Pagination.md` |
| Chart | ДС — `design-system/components/organisms/Chart/Chart.md` |
| Badge | ДС — `design-system/components/atoms/Badge/Badge.md` |
| Modal | ДС — `design-system/components/organisms/Modal/Modal.md` |
| SnackBar | ДС — `design-system/components/organisms/SnackBar/SnackBar.md` |
| Toast | ДС — `design-system/components/molecules/Toast/Toast.md` |
| `GoalsPopoverBadge` | виджет концепта — `../widgets/tiles/GoalsPopoverBadge/GoalsPopoverBadge.md` |
| `IndustryInfoTile` | виджет концепта — `../widgets/tiles/IndustryInfoTile/IndustryInfoTile.md` |
| `RequisitesInfoTile` | виджет концепта — `../widgets/tiles/RequisitesInfoTile/RequisitesInfoTile.md` |
| `CommentsTile` | виджет концепта — `../widgets/tiles/CommentsTile/CommentsTile.md` |
| `DocumentsInfoTile` | виджет концепта — `../widgets/tiles/DocumentsInfoTile/DocumentsInfoTile.md` |
| `TeamInfoTile` | виджет концепта — `../widgets/tiles/TeamInfoTile/TeamInfoTile.md` |
| `RelatedPersonsTile` | виджет концепта — `../widgets/tiles/RelatedPersonsTile/RelatedPersonsTile.md` |
| `DesksTile` | виджет концепта — `../widgets/tiles/DesksTile/DesksTile.md` |
| `ClientTimingsTile` | виджет концепта — `../widgets/tiles/ClientTimingsTile/ClientTimingsTile.md` |
| `ClientNewsTile` | виджет концепта — `../widgets/tiles/ClientNewsTile/ClientNewsTile.md` |
| `GigaInfoTile` | виджет концепта — `../widgets/tiles/GigaInfoTile/GigaInfoTile.md` |
| `MeetingsProtocolsList` | виджет концепта — `../widgets/tables/MeetingsProtocolsList/MeetingsProtocolsList.md` |
| `MeetingsProtocolsDetails` | виджет концепта — `../widgets/tiles/MeetingsProtocolsDetails/MeetingsProtocolsDetails.md` |
| `TasksTable` | виджет концепта — `../widgets/tables/TasksTable/TasksTable.md` |
| `TaskPreviewTile` | виджет концепта — `../widgets/tiles/TaskPreviewTile/TaskPreviewTile.md` |
| `ChangeTaskStatusModal` | виджет концепта — `../widgets/modals/ChangeTaskStatusModal/ChangeTaskStatusModal.md` |
| `LeadsTable` | виджет концепта — `../widgets/tables/LeadsTable/LeadsTable.md` |
| `OpportunitiesPipelineTable` | виджет концепта — `../widgets/tables/OpportunitiesPipelineTable/OpportunitiesPipelineTable.md` |
| `BindingOpportunitiesTable` | виджет концепта — `../widgets/tables/BindingOpportunitiesTable/BindingOpportunitiesTable.md` |
| `PossibleOpportunitiesTable` | виджет концепта — `../widgets/tables/PossibleOpportunitiesTable/PossibleOpportunitiesTable.md` |
| `MaPipelineTable` | виджет концепта — `../widgets/tables/MaPipelineTable/MaPipelineTable.md` |
| `DcmEcmPipelineTable` | виджет концепта — `../widgets/tables/DcmEcmPipelineTable/DcmEcmPipelineTable.md` |
| `FinancialsChart` | виджет концепта — `../widgets/tiles/FinancialsChart/FinancialsChart.md` |
| `FinancialsTable` | виджет концепта — `../widgets/tables/FinancialsTable/FinancialsTable.md` |
| `StratDialogueCard` | виджет концепта — `../widgets/tiles/StratDialogueCard/StratDialogueCard.md` |
| `GoalArchiveSection` | виджет концепта — `../widgets/tiles/GoalArchiveSection/GoalArchiveSection.md` |
| `ClientCreditsList` | виджет концепта — `../widgets/tiles/ClientCreditsList/ClientCreditsList.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 6. Таблицы (Tables)

Таблиц в разметке страницы нет: таблицы — виджеты, колонки — в их паспортах.

## 7. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| Вкладка | панель вкладки, адрес `?tab=<страница фронтенда>` или id вкладки; панель наполняется при первом показе; «Новости» не переключается (Р3) |
| Строка встречи / задачи | предпросмотр справа; крестик прячет панель |
| «Завершить» / «Отменить» встречу | подтверждение → статус, SnackBar (Р7) |
| «Исполнить» / «Отменить» задачу | `ChangeTaskStatusModal` (Р7) |
| «Переназначить» задачу | по клику ничего (Р6, Б7 MS0014a) |
| SegmentControl вкладки | подвид панели; «Портфель» не переключается (Р3) |
| Стрелка «Комментарии» | `ClientComments.preview.html?id=…` |
| ID сделки / лида в таблицах | страница сделки / лида |
| Меню «Ещё» → «Редактирование профиля» | по клику ничего (Р6) |

## 8. Модальные окна (Modals)

| id | Заголовок | Ширина | Содержимое | Кнопки подвала |
|---|---|---|---|---|
| `meeting-confirm-scrim` | Завершить встречу / Отменить встречу | `--w3` | текст подтверждения | «Отмена», «Завершить» |
| `task-change-scrim` | по действию | `--w4` | виджет `ChangeTaskStatusModal` | см. паспорт |

## 9. Состояния (States)

### Loading
В прототипе не моделируется: демо-данные в памяти. У виджетов — блок загрузки по `data-state="loading"` (паспорта).

### Empty
У таблиц вкладки «Сделки» — «Нет данных»; у встреч и задач без выбора строки правая панель скрыта, даже если записи есть. Таблицы занимают всю ширину до выбора.

### Error
В прототипе не моделируется. У виджетов — Alert с повтором по `data-state="error"` (паспорта).

### Disabled
Нет: права роли — просмотр; правка не воссоздаётся (Р6).

## 10. Тексты интерфейса (Texts)

| Место | Текст |
|---|---|
| Вкладки | Общая информация · Встречи · Задачи · Сделки · Финансовые показатели · Цели · Кредиты · Финансовый анализ · Новости |
| Действия встреч | Новый протокол · Новая встреча |
| Действие задач | Новая задача |
| Подвиды | Лиды · Pipeline · Портфель; ФОК · Пользовательские метрики; Бизнес · Личные; Действующие · Pipeline |
| Примечание анализа | Данные АС Cashflow рассчитанные 01.01.2026 |

## 11. Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — в паспортах виджетов и typedef демо-данных. Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../data/clients.js` | `window.MOCK_CLIENTS` | `ClientRsDto[]` | invented (10.10.2026) |
| `../data/employees.js` | `window.MOCK_EMPLOYEES` | `EmployeeRsDto[]` | invented (10.10.2026) |
| `../data/opportunities.js` | `window.MOCK_OPPORTUNITIES` | `OpportunityRsDto[]` | invented (10.10.2026) |
| `../data/potentials.js` | `window.MOCK_POTENTIALS` | `PotentialRsDto[]` | invented (10.10.2026) |
| `../data/meetings.js` | `window.MOCK_MEETINGS` | `MeetingRsDto[]` | invented (10.10.2026) |
| `../data/tasks.js` | `window.MOCK_TASKS` | `TaskRsDto[]` | invented (10.10.2026) |
| `../data/dictionaries.js` | `window.REGISTRY_CONFIGS`, `*_LABELS` | конфиги, подписи кодов | invented (10.10.2026) |
| `../data/store.js` | `window.IBPR` | — | хранилище: выборки, действия Р7, sessionStorage |
| `../data/nav-links.js` | `window.IBPR_NAV` | — | меню и карта страниц |
| `../data/registry-table.js` | `window.IBPR_TABLE` | — | общий рендер реестров (пары нет) |

### Permissions — роли, права, флаги

| Роль | Просмотр | Действия |
|---|---|---|
| Аналитик ДИД | да | Р7 над встречами и задачами |

## 12. Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| Страница | `pages/ClientInfoPage.html` | `src/pages/ClientInfo/ClientInfoPage.tsx` (+ ClientInfoDealsPage, ClientInfoFinancials, ClientInfoGoalsPage) |
| Тайлы | `widgets/tiles/<Имя>/` | `src/widgets/Tiles/<Имя>/<Имя>.tsx` |
| Таблицы | `widgets/tables/<Имя>/` | по паспортам |

Пути фронтенда — по соглашениям его модуля; окончательный путь выбирает разработка.

## 13. Доступность

- `<main>` для контентной области, `<nav aria-label="Хлебные крошки">`, `<nav aria-label="Главное меню">`;
- заголовок страницы — единственный `h1`;
- у всех кнопок-иконок есть `aria-label`;
- вкладки — `role="tablist"`, переключатели — `role="radiogroup"`.

## 14. Открытые вопросы и допущения (Open questions)

| № | Вопрос / допущение | Статус |
|---|---|---|
| 1 | Счётчик «26» с ⓘ в шапке — смысл неизвестен (вопрос 8 MS0014); кандидат — RiskMetric ДС (рейтинг и зона) | вопрос |
| 2 | Холдинг — подзаголовком под названием: у PageHeader ДС нет строки над заголовком | допущение |
| 3 | Цветные плашки сводки кредитов и тайлов (Pixso) — пробел ДС (MS0014 §7) | пробел ДС |
| 4 | «Финансовый анализ» из 7 разделов — SegmentControl (ТЗ §4.8 оставляет выбор сборщику) | допущение |
| 5 | Меню и карта страниц — `data/nav-links.js`: один источник на концепт; пункт без страницы — клик гасится (Р5) | решено (MS0014a, С1) |
| 6 | Форма фильтра кредитов в источнике отсутствует: кнопка видна, по клику ничего (Р6) | допущение |
| 7 | Переключение вида кредитов «Карточки / Список» раскрывает / сворачивает карточки через DSTile; состав данных одинаков | допущение |

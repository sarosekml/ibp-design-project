---
screen: ClientInfoPage
kind: screen
title: Клиент
file: apps/core/drafts/ibp-redesign-v2/pages/ClientInfoPage.preview.html
module: core/drafts/ibp-redesign-v2
frontend: core/clients-app pages/ClientInfo/ClientInfoPage
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.000"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tab, SegmentControl, Tile, ReadOnlyField, Entity, Avatar, Chip, DocCard, Link, Buttons, IconButton, ContextMenu, Splitter, Table, TableCell, TableFilter, Pagination, Chart, Badge, Modal, SnackBar, Toast]
widgets: [tiles/V2GoalsPopoverBadge, tiles/V2IndustryInfoTile, tiles/V2RequisitesInfoTile, tiles/V2CommentsTile, tiles/V2DocumentsInfoTile, tiles/V2TeamInfoTile, tiles/V2RelatedPersonsTile, tiles/V2DesksTile, tiles/V2ClientTimingsTile, tiles/V2ClientNewsTile, tiles/V2GigaInfoTile, tables/V2MeetingsProtocolsList, tiles/V2MeetingsProtocolsDetails, tables/V2TasksTable, tables/V2TaskHistoryTable, tiles/V2TaskPreviewTile, modals/V2ChangeTaskStatusModal, tables/V2LeadsTable, tables/V2OpportunitiesPipelineTable, tables/V2BindingOpportunitiesTable, tables/V2PossibleOpportunitiesTable, tables/V2MaPipelineTable, tables/V2DcmEcmPipelineTable, tiles/V2FinancialsChart, tables/V2FinancialsTable, tiles/V2StratDialogueCard, tiles/V2GoalArchiveSection, tiles/V2ClientCreditsList]
---

# Page: ClientInfoPage — Клиент

## 1. Назначение (Purpose)

Карточка клиента: шапка с признаками и девять вкладок — общая информация, встречи, задачи, сделки, финансовые показатели, цели, кредиты, финансовый анализ, новости.

**Роль пользователя:** Аналитик ДИД
**Права:** в режиме «Стало» единые лиды, создание из встречи; остальные действия — по контекстной части MS0014. Просмотр; действия Р7 над встречами и задачами; формы, карандаши, «Новая встреча», «Новый лид» — по клику ничего (Р6)

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
| Отрасль · Реквизиты · Документы · Команда · ГигаСправка | `V2IndustryInfoTile` · `V2RequisitesInfoTile` · `V2DocumentsInfoTile` · `V2TeamInfoTile` ×2 · `V2GigaInfoTile` | core/clients-app `widgets/Tiles/<Имя>` |
| Связанные физлица · Новости · Сроки | `V2RelatedPersonsTile` · `V2ClientNewsTile` · `V2ClientTimingsTile` | пар нет |
| «Цели зафиксированы» | `V2GoalsPopoverBadge` | core/clients-app `widgets/V2GoalsPopoverBadge` |
| Таблицы вкладки «Сделки» | `V2LeadsTable` ×4 · `V2OpportunitiesPipelineTable` · `V2BindingOpportunitiesTable` · `V2PossibleOpportunitiesTable` · `V2MaPipelineTable` · `V2DcmEcmPipelineTable` ×2 | OffersToProcessTable, PotentialsRDTable, V2MaPipelineTable, V2DcmEcmPipelineTable и реестры сделок |
| График и таблица ФОК | `V2FinancialsChart` · `V2FinancialsTable` | core/clients-app `widgets/Charts/V2FinancialsChart` · V2FinancialsTable |
| Цели | `V2StratDialogueCard` · `V2GoalArchiveSection` | core/clients-app `features/V2StratDialogueCard` · `widgets/Tiles/V2GoalArchiveSection` |
| Кредиты | `V2ClientCreditsList` | пары нет |

## 4. Раскладка (Layout)

```
Page (Layout, nav--rail)
├── PageHeader — иконка factory-01 · название · холдинг (meta) · .phead__extras: чипы клиента, V2GoalsPopoverBadge, счётчик с ⓘ · меню «Ещё»
├── Tab ×9 — Общая информация · Встречи · Задачи · Сделки · Финансовые показатели · Цели · Кредиты · Финансовый анализ · Новости (Р3)
├── [Общая информация] tile-row: 3 стопки по 4
│   ├── V2IndustryInfoTile · V2RequisitesInfoTile · V2CommentsTile · V2DocumentsInfoTile
│   ├── V2TeamInfoTile (главный КМ) · V2RelatedPersonsTile · V2TeamInfoTile (команда ДИД) · V2DesksTile · V2ClientTimingsTile
│   └── V2ClientNewsTile · V2GigaInfoTile
├── [Встречи] действия · Splitter: V2MeetingsProtocolsList | V2MeetingsProtocolsDetails
├── [Задачи] действия · Splitter: V2TasksTable | V2TaskPreviewTile
├── [Сделки] SegmentControl Лиды · Pipeline · Портфель (Р3)
│   ├── Лиды: V2LeadsTable ×4 (12 · 12 · 6 + 6)
│   └── Pipeline: V2OpportunitiesPipelineTable (12) · Binding + Possible (6 + 6) · V2MaPipelineTable (12) · V2DcmEcmPipelineTable ×2 (6 + 6)
├── [Финансовые показатели] SegmentControl ФОК · Пользовательские метрики: V2FinancialsChart (12) · V2FinancialsTable (12) | Tile метрик (12)
├── [Цели] SegmentControl Бизнес · Личные: сетка V2StratDialogueCard по 3 · V2GoalArchiveSection ×N
├── [Кредиты] SegmentControl Действующие · Pipeline: сводка 4 + 4 + 4 · V2ClientCreditsList (12)
└── [Финансовый анализ] SegmentControl из 7 разделов · V2FinancialsTable (12)
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
| `V2GoalsPopoverBadge` | виджет концепта — `../widgets/tiles/V2GoalsPopoverBadge/V2GoalsPopoverBadge.md` |
| `V2IndustryInfoTile` | виджет концепта — `../widgets/tiles/V2IndustryInfoTile/V2IndustryInfoTile.md` |
| `V2RequisitesInfoTile` | виджет концепта — `../widgets/tiles/V2RequisitesInfoTile/V2RequisitesInfoTile.md` |
| `V2CommentsTile` | виджет концепта — `../widgets/tiles/V2CommentsTile/V2CommentsTile.md` |
| `V2DocumentsInfoTile` | виджет концепта — `../widgets/tiles/V2DocumentsInfoTile/V2DocumentsInfoTile.md` |
| `V2TeamInfoTile` | виджет концепта — `../widgets/tiles/V2TeamInfoTile/V2TeamInfoTile.md` |
| `V2RelatedPersonsTile` | виджет концепта — `../widgets/tiles/V2RelatedPersonsTile/V2RelatedPersonsTile.md` |
| `V2DesksTile` | виджет концепта — `../widgets/tiles/V2DesksTile/V2DesksTile.md` |
| `V2ClientTimingsTile` | виджет концепта — `../widgets/tiles/V2ClientTimingsTile/V2ClientTimingsTile.md` |
| `V2ClientNewsTile` | виджет концепта — `../widgets/tiles/V2ClientNewsTile/V2ClientNewsTile.md` |
| `V2GigaInfoTile` | виджет концепта — `../widgets/tiles/V2GigaInfoTile/V2GigaInfoTile.md` |
| `V2MeetingsProtocolsList` | виджет концепта — `../widgets/tables/V2MeetingsProtocolsList/V2MeetingsProtocolsList.md` |
| `V2MeetingsProtocolsDetails` | виджет концепта — `../widgets/tiles/V2MeetingsProtocolsDetails/V2MeetingsProtocolsDetails.md` |
| `V2TasksTable` | виджет концепта — `../widgets/tables/V2TasksTable/V2TasksTable.md` |
| `V2TaskPreviewTile` | виджет концепта — `../widgets/tiles/V2TaskPreviewTile/V2TaskPreviewTile.md` |
| `V2ChangeTaskStatusModal` | виджет концепта — `../widgets/modals/V2ChangeTaskStatusModal/V2ChangeTaskStatusModal.md` |
| `V2LeadsTable` | виджет концепта — `../widgets/tables/V2LeadsTable/V2LeadsTable.md` |
| `V2OpportunitiesPipelineTable` | виджет концепта — `../widgets/tables/V2OpportunitiesPipelineTable/V2OpportunitiesPipelineTable.md` |
| `V2BindingOpportunitiesTable` | виджет концепта — `../widgets/tables/V2BindingOpportunitiesTable/V2BindingOpportunitiesTable.md` |
| `V2PossibleOpportunitiesTable` | виджет концепта — `../widgets/tables/V2PossibleOpportunitiesTable/V2PossibleOpportunitiesTable.md` |
| `V2MaPipelineTable` | виджет концепта — `../widgets/tables/V2MaPipelineTable/V2MaPipelineTable.md` |
| `V2DcmEcmPipelineTable` | виджет концепта — `../widgets/tables/V2DcmEcmPipelineTable/V2DcmEcmPipelineTable.md` |
| `V2FinancialsChart` | виджет концепта — `../widgets/tiles/V2FinancialsChart/V2FinancialsChart.md` |
| `V2FinancialsTable` | виджет концепта — `../widgets/tables/V2FinancialsTable/V2FinancialsTable.md` |
| `V2StratDialogueCard` | виджет концепта — `../widgets/tiles/V2StratDialogueCard/V2StratDialogueCard.md` |
| `V2GoalArchiveSection` | виджет концепта — `../widgets/tiles/V2GoalArchiveSection/V2GoalArchiveSection.md` |
| `V2ClientCreditsList` | виджет концепта — `../widgets/tiles/V2ClientCreditsList/V2ClientCreditsList.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 6. Таблицы (Tables)

Таблиц в разметке страницы нет: таблицы — виджеты, колонки — в их паспортах.

## 7. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| Вкладка | панель вкладки, адрес `?tab=<страница фронтенда>` или id вкладки; панель наполняется при первом показе; «Новости» не переключается (Р3) |
| Строка встречи / задачи | предпросмотр справа; крестик прячет панель |
| «Завершить» / «Отменить» встречу | подтверждение → статус, SnackBar (Р7) |
| «Исполнить» / «Отменить» задачу | `V2ChangeTaskStatusModal` (Р7) |
| «Переназначить» задачу | по клику ничего (Р6, Б7 MS0014a) |
| SegmentControl вкладки | подвид панели; «Портфель» не переключается (Р3) |
| Стрелка «Комментарии» | `ClientComments.preview.html?id=…` |
| ID сделки / лида в таблицах | страница сделки / лида |
| Меню «Ещё» → «Редактирование профиля» | по клику ничего (Р6) |

## 8. Модальные окна (Modals)

| id | Заголовок | Ширина | Содержимое | Кнопки подвала |
|---|---|---|---|---|
| `meeting-confirm-scrim` | Завершить встречу / Отменить встречу | `--w3` | текст подтверждения | «Отмена», «Завершить» |
| `task-change-scrim` | по действию | `--w4` | виджет `V2ChangeTaskStatusModal` | см. паспорт |

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

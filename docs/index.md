# Карта документации

Единая точка входа для человека: маршруты помогают начать, каталог ниже
перечисляет markdown-документы репозитория. Агенту каталог целиком читать
не нужно — начните с [AGENTS.md](../AGENTS.md) и открывайте нужные файлы точечно.

В Obsidian откройте **корень репозитория как vault** и закрепите эту заметку.
В настройках Obsidian исключите из индексации `.opencode/` и `node_modules/`.
Настройки vault хранятся локально в `.obsidian/` и не попадают в git.
Ссылки ниже относительные: они рассчитаны на Obsidian и GitHub.

## Маршруты чтения

### Новичок-дизайнер

1. [Обзор и быстрый старт](../README.md) — как открыть прототипы.
2. [Устройство приложений](../apps/README.md) — модули, концепты и виджеты.
3. [Обзор дизайн-системы](../design-system/readme.md) — её состав и назначение.
4. [Правила дизайн-системы](../design-system/AGENTS.md) — ограничения и каркас экрана.
5. [Работа с агентом](../.agents/README.md) — от ТЗ до приёмки.

### Агент-сборщик

1. [Вход в проект](../AGENTS.md) — указатели на обязательные правила.
2. [Процесс](../.agents/rules/process.md) — границы записи и проверки.
3. [Правила ДС](../design-system/AGENTS.md) — где искать компоненты.
4. [Роль сборщика](../.agents/agents/screen-builder.md) — порядок работы.
5. [Сборка экрана](../.agents/skills/screen-assembly/SKILL.md) — процедура.
6. [Спецификация](../.agents/skills/screen-spec/SKILL.md) — описание результата.

### Фронтенд-разработчик

1. [Передача прототипа](../README.md) — состав результата и способ запуска.
2. [Структура приложений](../apps/README.md) — соответствие модулям фронтенда.
3. [Спеки и демо-данные](../.agents/skills/screen-spec/SKILL.md) — формат контрактов.
4. [Манифест компонентов](../design-system/specs/_index.md) — спеки и зависимости.
5. [Хуки рантаймов](../design-system/specs/_runtime-hooks.md) — поведение компонентов.
6. [Ведение ДС](../design-system/MAINTAINING.md) — правила изменений и проверок.

### Ревьюер

1. [Роль ревьюера](../.agents/agents/screen-reviewer.md) — процедура приёмки.
2. [Проверка экрана](../.agents/skills/screen-review/SKILL.md) — технический чек-лист.
3. [Проверка композиции](../.agents/skills/composition-review/SKILL.md) — раскладка и иерархия.
4. [Правила ДС](../design-system/AGENTS.md) — источник требований.
5. [Уроки приёмки](../.agents/skills/screen-review/references/lessons.md) — известные классы ошибок.

## Обновление каталога

Рукописные маршруты выше редактируются здесь. Таблицы ниже пересобираются
командой `node .agents/tools/docs-index.mjs`; актуальность проверяет гейт.
Решения и исключения обхода — в [генераторе](../.agents/tools/docs-index.mjs).

<!-- @docs-index -->
<!-- генерирует docs-index.mjs, руками не править -->

Документов: 241.

## Корень (4)

| Документ | Аннотация |
|---|---|
| [AGENTS.md](../AGENTS.md) | Прототипы IBP — вход для агентов |
| [GIGACODE.md](../GIGACODE.md) | Правила работы с воркспейсом IBP (GigaCode) |
| [README.md](../README.md) | — |
| [index.screen.md](../index.screen.md) | Хаб проектов |

## Дизайн-система (71)

| Документ | Аннотация |
|---|---|
| [design-system/AGENTS.md](../design-system/AGENTS.md) | Дизайн-система IBP — правила для агента |
| [design-system/CHANGELOG.md](../design-system/CHANGELOG.md) | Журнал правок ДС |
| [design-system/MAINTAINING.md](../design-system/MAINTAINING.md) | Дизайн-система — правила ведения |
| [design-system/readme.md](../design-system/readme.md) | IBP DS — дизайн-система |

### design-system/scripts

| Документ | Аннотация |
|---|---|
| [design-system/scripts/ds-lint.md](../design-system/scripts/ds-lint.md) | Линтер ДС: правила и проверки |

### design-system/specs

| Документ | Аннотация |
|---|---|
| [design-system/specs/Alert.md](../design-system/specs/Alert.md) | Alert |
| [design-system/specs/AllocationBar.md](../design-system/specs/AllocationBar.md) | AllocationBar |
| [design-system/specs/Avatar.md](../design-system/specs/Avatar.md) | Avatar |
| [design-system/specs/Badge.md](../design-system/specs/Badge.md) | Badge |
| [design-system/specs/Breadcrumbs.md](../design-system/specs/Breadcrumbs.md) | Breadcrumbs |
| [design-system/specs/ButtonGroup.md](../design-system/specs/ButtonGroup.md) | ButtonGroup |
| [design-system/specs/Buttons.md](../design-system/specs/Buttons.md) | Button |
| [design-system/specs/Chart.md](../design-system/specs/Chart.md) | Chart |
| [design-system/specs/Checkbox.md](../design-system/specs/Checkbox.md) | Checkbox |
| [design-system/specs/Chip.md](../design-system/specs/Chip.md) | Chip |
| [design-system/specs/Colors.md](../design-system/specs/Colors.md) | Цвета |
| [design-system/specs/ContextMenu.md](../design-system/specs/ContextMenu.md) | Context Menu |
| [design-system/specs/DatePicker.md](../design-system/specs/DatePicker.md) | DatePicker |
| [design-system/specs/Divider.md](../design-system/specs/Divider.md) | Divider |
| [design-system/specs/Drawer.md](../design-system/specs/Drawer.md) | Панель деталей |
| [design-system/specs/DropdownList.md](../design-system/specs/DropdownList.md) | DropdownList |
| [design-system/specs/Elevation.md](../design-system/specs/Elevation.md) | Тени (Elevation) |
| [design-system/specs/EmptyState.md](../design-system/specs/EmptyState.md) | EmptyState |
| [design-system/specs/Entity.md](../design-system/specs/Entity.md) | Entity |
| [design-system/specs/IconButton.md](../design-system/specs/IconButton.md) | IconButton |
| [design-system/specs/Icons.md](../design-system/specs/Icons.md) | Иконки |
| [design-system/specs/Illustrations.md](../design-system/specs/Illustrations.md) | Иллюстрации |
| [design-system/specs/InputAmountRange.md](../design-system/specs/InputAmountRange.md) | InputAmountRange |
| [design-system/specs/InputAutocomplete.md](../design-system/specs/InputAutocomplete.md) | InputAutocomplete |
| [design-system/specs/InputDate.md](../design-system/specs/InputDate.md) | InputDate |
| [design-system/specs/InputDateRange.md](../design-system/specs/InputDateRange.md) | InputDateRange |
| [design-system/specs/InputText.md](../design-system/specs/InputText.md) | InputText |
| [design-system/specs/Kanban.md](../design-system/specs/Kanban.md) | Канбан-доска |
| [design-system/specs/LabelHelper.md](../design-system/specs/LabelHelper.md) | Label / Helper |
| [design-system/specs/Layout.md](../design-system/specs/Layout.md) | Каркас экрана |
| [design-system/specs/Link.md](../design-system/specs/Link.md) | Link |
| [design-system/specs/Modal.md](../design-system/specs/Modal.md) | Modal |
| [design-system/specs/NavPanel.md](../design-system/specs/NavPanel.md) | Панель навигации |
| [design-system/specs/NavTile.md](../design-system/specs/NavTile.md) | NavTile |
| [design-system/specs/PageHeader.md](../design-system/specs/PageHeader.md) | PageHeader |
| [design-system/specs/Pagination.md](../design-system/specs/Pagination.md) | Pagination |
| [design-system/specs/Popover.md](../design-system/specs/Popover.md) | Popover |
| [design-system/specs/ProductRow.md](../design-system/specs/ProductRow.md) | ProductRow |
| [design-system/specs/ProgressBar.md](../design-system/specs/ProgressBar.md) | ProgressBar |
| [design-system/specs/Radiobutton.md](../design-system/specs/Radiobutton.md) | Radiobutton |
| [design-system/specs/Radius.md](../design-system/specs/Radius.md) | Скругления |
| [design-system/specs/ReadOnlyField.md](../design-system/specs/ReadOnlyField.md) | ReadOnlyField |
| [design-system/specs/RiskMetric.md](../design-system/specs/RiskMetric.md) | Риск-метрика |
| [design-system/specs/SegmentControl.md](../design-system/specs/SegmentControl.md) | SegmentControl |
| [design-system/specs/Skeleton.md](../design-system/specs/Skeleton.md) | Skeleton |
| [design-system/specs/SnackBar.md](../design-system/specs/SnackBar.md) | SnackBar |
| [design-system/specs/Spacing.md](../design-system/specs/Spacing.md) | Сетка и отступы |
| [design-system/specs/Spinner.md](../design-system/specs/Spinner.md) | Spinner |
| [design-system/specs/Splitter.md](../design-system/specs/Splitter.md) | Splitter |
| [design-system/specs/SubTab.md](../design-system/specs/SubTab.md) | SubTab — табы второго уровня |
| [design-system/specs/Switch.md](../design-system/specs/Switch.md) | Switch |
| [design-system/specs/Tab.md](../design-system/specs/Tab.md) | Tab |
| [design-system/specs/Table.md](../design-system/specs/Table.md) | Table |
| [design-system/specs/TableCell.md](../design-system/specs/TableCell.md) | TableCell |
| [design-system/specs/TableFilter.md](../design-system/specs/TableFilter.md) | TableFilter |
| [design-system/specs/Tile.md](../design-system/specs/Tile.md) | Tile |
| [design-system/specs/Toast.md](../design-system/specs/Toast.md) | Toast |
| [design-system/specs/Tooltip.md](../design-system/specs/Tooltip.md) | Tooltip |
| [design-system/specs/Typography.md](../design-system/specs/Typography.md) | Типографика |
| [design-system/specs/\_TEMPLATE.md](../design-system/specs/_TEMPLATE.md) | Название по-русски |
| [design-system/specs/\_cheatsheet.md](../design-system/specs/_cheatsheet.md) | IBP DS — чит-шит компонентов |
| [design-system/specs/\_index.md](../design-system/specs/_index.md) | Индекс спек |
| [design-system/specs/\_runtime-hooks.md](../design-system/specs/_runtime-hooks.md) | Хуки рантаймов — чтобы макет работал |

### design-system/templates

| Документ | Аннотация |
|---|---|
| [design-system/templates/local-component/CHANGELOG.md](../design-system/templates/local-component/CHANGELOG.md) | Журнал правок &amp;lt;Имя&amp;gt; |
| [design-system/templates/local-component/Component.md](../design-system/templates/local-component/Component.md) | &lt;Имя&gt; |
| [design-system/templates/local-component/README.md](../design-system/templates/local-component/README.md) | Шаблон локального компонента |

## Агентная система (40)

| Документ | Аннотация |
|---|---|
| [.agents/AGENTS.md](../.agents/AGENTS.md) | Харнес агента-дизайнера IBP — вход |
| [.agents/README.md](../.agents/README.md) | Харнес агента-дизайнера IBP — рабочий процесс |

### .agents/agents

| Документ | Аннотация |
|---|---|
| [.agents/agents/ai-designer.md](../.agents/agents/ai-designer.md) | — |
| [.agents/agents/screen-builder.md](../.agents/agents/screen-builder.md) | — |
| [.agents/agents/screen-reviewer.md](../.agents/agents/screen-reviewer.md) | — |
| [.agents/agents/ux-researcher.md](../.agents/agents/ux-researcher.md) | — |

### .agents/commands

| Документ | Аннотация |
|---|---|
| [.agents/commands/concepts.md](../.agents/commands/concepts.md) | — |
| [.agents/commands/handoff.md](../.agents/commands/handoff.md) | — |
| [.agents/commands/panel.md](../.agents/commands/panel.md) | — |
| [.agents/commands/promote.md](../.agents/commands/promote.md) | — |
| [.agents/commands/resume.md](../.agents/commands/resume.md) | — |
| [.agents/commands/screen-check.md](../.agents/commands/screen-check.md) | — |
| [.agents/commands/screen.md](../.agents/commands/screen.md) | — |

### .agents/proto-panel

| Документ | Аннотация |
|---|---|
| [.agents/proto-panel/README.md](../.agents/proto-panel/README.md) | Панель прототипа |

### .agents/rules

| Документ | Аннотация |
|---|---|
| [.agents/rules/process.md](../.agents/rules/process.md) | Правила процесса агента на дизайн-системе IBP |

### .agents/skills

| Документ | Аннотация |
|---|---|
| [.agents/skills/composition-review/SKILL.md](../.agents/skills/composition-review/SKILL.md) | Приёмка композиции |
| [.agents/skills/concept-design/SKILL.md](../.agents/skills/concept-design/SKILL.md) | Проектирование концептов |
| [.agents/skills/docs-split/SKILL.md](../.agents/skills/docs-split/SKILL.md) | Раскатка \`design-system/pages/\*\*\` на docs-split |
| [.agents/skills/docs-split/references/lessons.md](../.agents/skills/docs-split/references/lessons.md) | Уроки раскатки docs-split |
| [.agents/skills/docs-split/references/pages-index.md](../.agents/skills/docs-split/references/pages-index.md) | Карта страниц документации |
| [.agents/skills/docs-split/references/skeleton.md](../.agents/skills/docs-split/references/skeleton.md) | Скелет страницы docs-split (эталон структуры) |
| [.agents/skills/ds-lookup/SKILL.md](../.agents/skills/ds-lookup/SKILL.md) | Поиск по дизайн-системе IBP |
| [.agents/skills/knowledge-lookup/SKILL.md](../.agents/skills/knowledge-lookup/SKILL.md) | Поиск по базе знаний продукта |
| [.agents/skills/layout-composition/SKILL.md](../.agents/skills/layout-composition/SKILL.md) | Композиция экрана: тайлы и поля |
| [.agents/skills/layout-composition/references/dashboards.md](../.agents/skills/layout-composition/references/dashboards.md) | Дашборды и сводки |
| [.agents/skills/layout-composition/references/detail-view.md](../.agents/skills/layout-composition/references/detail-view.md) | Карточка сущности (detail view) — режим чтения |
| [.agents/skills/layout-composition/references/forms.md](../.agents/skills/layout-composition/references/forms.md) | Формы, модалки редактирования, визарды — режим ввода |
| [.agents/skills/layout-composition/references/tables.md](../.agents/skills/layout-composition/references/tables.md) | Реестры и таблицы |
| [.agents/skills/lessons/SKILL.md](../.agents/skills/lessons/SKILL.md) | Самообучение: урок → закрепление → доказательство |
| [.agents/skills/lessons/references/lessons.md](../.agents/skills/lessons/references/lessons.md) | Уроки об оснастке самообучения |
| [.agents/skills/proto-panel/SKILL.md](../.agents/skills/proto-panel/SKILL.md) | Панель прототипа: включение, сценарии, комментарии |
| [.agents/skills/screen-assembly/SKILL.md](../.agents/skills/screen-assembly/SKILL.md) | Сборка экрана на IBP DS |
| [.agents/skills/screen-assembly/references/patterns.md](../.agents/skills/screen-assembly/references/patterns.md) | Рецепты разметки — типовые узлы экрана |
| [.agents/skills/screen-review/SKILL.md](../.agents/skills/screen-review/SKILL.md) | Приёмка экрана |
| [.agents/skills/screen-review/references/lessons-raw.md](../.agents/skills/screen-review/references/lessons-raw.md) | Журнал уроков — АРХИВ (raw) |
| [.agents/skills/screen-review/references/lessons.md](../.agents/skills/screen-review/references/lessons.md) | Журнал уроков — выжимка (curated) |
| [.agents/skills/screen-spec/SKILL.md](../.agents/skills/screen-spec/SKILL.md) | Спецификации и демо-данные прототипа |
| [.agents/skills/screen-spec/references/template.md](../.agents/skills/screen-spec/references/template.md) | Реестр сделок |
| [.agents/skills/screen-spec/references/widget-template.md](../.agents/skills/screen-spec/references/widget-template.md) | Widget: DealTeamTile — Команда сделки |
| [.agents/skills/session-plan/SKILL.md](../.agents/skills/session-plan/SKILL.md) | Планирование захода: смета и границы сессии |

## Приложения (106)

| Документ | Аннотация |
|---|---|
| [apps/README.md](../apps/README.md) | apps — приложения на дизайн-системе IBP |

### apps/core/clients-app

| Документ | Аннотация |
|---|---|
| [apps/core/clients-app/README.md](../apps/core/clients-app/README.md) | clients-app — модуль раздела core |

### apps/core/documents-app

| Документ | Аннотация |
|---|---|
| [apps/core/documents-app/README.md](../apps/core/documents-app/README.md) | documents-app — модуль раздела core |

### apps/core/employees-app

| Документ | Аннотация |
|---|---|
| [apps/core/employees-app/README.md](../apps/core/employees-app/README.md) | employees-app — модуль раздела core |

### apps/core/host-app

| Документ | Аннотация |
|---|---|
| [apps/core/host-app/README.md](../apps/core/host-app/README.md) | host-app — модуль раздела core |

### apps/core/notifications-app

| Документ | Аннотация |
|---|---|
| [apps/core/notifications-app/README.md](../apps/core/notifications-app/README.md) | notifications-app — модуль раздела core |

### apps/core/settings-app

| Документ | Аннотация |
|---|---|
| [apps/core/settings-app/README.md](../apps/core/settings-app/README.md) | settings-app — модуль раздела core |

### apps/core/tasks-app

| Документ | Аннотация |
|---|---|
| [apps/core/tasks-app/README.md](../apps/core/tasks-app/README.md) | tasks-app — модуль раздела core |

### apps/core/userqueries-app

| Документ | Аннотация |
|---|---|
| [apps/core/userqueries-app/README.md](../apps/core/userqueries-app/README.md) | userqueries-app — модуль раздела core |

### apps/ib/dcmecm-app

| Документ | Аннотация |
|---|---|
| [apps/ib/dcmecm-app/README.md](../apps/ib/dcmecm-app/README.md) | dcmecm-app — модуль раздела ib |

### apps/ib/drafts/ai-bankster-prototype-mvp

| Документ | Аннотация |
|---|---|
| [apps/ib/drafts/ai-bankster-prototype-mvp/README.md](../apps/ib/drafts/ai-bankster-prototype-mvp/README.md) | AI Pitcher — прототип на дизайн-системе IBP |
| [apps/ib/drafts/ai-bankster-prototype-mvp/pages/ActivityLog.screen.md](../apps/ib/drafts/ai-bankster-prototype-mvp/pages/ActivityLog.screen.md) | Журнал действий |
| [apps/ib/drafts/ai-bankster-prototype-mvp/pages/HomePage.screen.md](../apps/ib/drafts/ai-bankster-prototype-mvp/pages/HomePage.screen.md) | Главная страница IBP |
| [apps/ib/drafts/ai-bankster-prototype-mvp/pages/MaterialDocument.screen.md](../apps/ib/drafts/ai-bankster-prototype-mvp/pages/MaterialDocument.screen.md) | Материал с идеями |
| [apps/ib/drafts/ai-bankster-prototype-mvp/pages/MaterialReport.screen.md](../apps/ib/drafts/ai-bankster-prototype-mvp/pages/MaterialReport.screen.md) | Материал с идеями — бриф перед встречей |
| [apps/ib/drafts/ai-bankster-prototype-mvp/pages/RequestBuilder.screen.md](../apps/ib/drafts/ai-bankster-prototype-mvp/pages/RequestBuilder.screen.md) | Новый отчёт — режим конструктора |
| [apps/ib/drafts/ai-bankster-prototype-mvp/pages/RequestBuilderCompact.screen.md](../apps/ib/drafts/ai-bankster-prototype-mvp/pages/RequestBuilderCompact.screen.md) | Новый отчёт — режим конструктора, компактный вариант |
| [apps/ib/drafts/ai-bankster-prototype-mvp/pages/RequestHistory.screen.md](../apps/ib/drafts/ai-bankster-prototype-mvp/pages/RequestHistory.screen.md) | История и материалы |
| [apps/ib/drafts/ai-bankster-prototype-mvp/pages/RequestThread.screen.md](../apps/ib/drafts/ai-bankster-prototype-mvp/pages/RequestThread.screen.md) | Новый отчёт (нить запроса) |

### apps/ib/drafts/ai-bankster-prototype-mvp — снимки задач

| Документ | Аннотация |
|---|---|
| [apps/ib/drafts/ai-bankster-prototype-mvp/ai-bankster-prototype-mvp.handoff.md](../apps/ib/drafts/ai-bankster-prototype-mvp/ai-bankster-prototype-mvp.handoff.md) | ai-bankster-prototype-mvp — handoff |

### apps/ib/drafts/ai-bankster-prototype-v01

| Документ | Аннотация |
|---|---|
| [apps/ib/drafts/ai-bankster-prototype-v01/README.md](../apps/ib/drafts/ai-bankster-prototype-v01/README.md) | Аналитические материалы — прототип на дизайн-системе IBP |
| [apps/ib/drafts/ai-bankster-prototype-v01/pages/ActivityLog.screen.md](../apps/ib/drafts/ai-bankster-prototype-v01/pages/ActivityLog.screen.md) | Журнал действий |
| [apps/ib/drafts/ai-bankster-prototype-v01/pages/HomePage.screen.md](../apps/ib/drafts/ai-bankster-prototype-v01/pages/HomePage.screen.md) | Главная страница IBP |
| [apps/ib/drafts/ai-bankster-prototype-v01/pages/MaterialDocument.screen.md](../apps/ib/drafts/ai-bankster-prototype-v01/pages/MaterialDocument.screen.md) | Материал с идеями |
| [apps/ib/drafts/ai-bankster-prototype-v01/pages/RequestBuilder.screen.md](../apps/ib/drafts/ai-bankster-prototype-v01/pages/RequestBuilder.screen.md) | Новый отчёт — режим конструктора |
| [apps/ib/drafts/ai-bankster-prototype-v01/pages/RequestBuilderCompact.screen.md](../apps/ib/drafts/ai-bankster-prototype-v01/pages/RequestBuilderCompact.screen.md) | Новый отчёт — режим конструктора, компактный вариант |
| [apps/ib/drafts/ai-bankster-prototype-v01/pages/RequestHistory.screen.md](../apps/ib/drafts/ai-bankster-prototype-v01/pages/RequestHistory.screen.md) | История и материалы |
| [apps/ib/drafts/ai-bankster-prototype-v01/pages/RequestThread.screen.md](../apps/ib/drafts/ai-bankster-prototype-v01/pages/RequestThread.screen.md) | Новый отчёт (нить запроса) |

### apps/ib/drafts/ai-bankster-prototype-v02

| Документ | Аннотация |
|---|---|
| [apps/ib/drafts/ai-bankster-prototype-v02/README.md](../apps/ib/drafts/ai-bankster-prototype-v02/README.md) | AI Pitcher — прототип на дизайн-системе IBP |
| [apps/ib/drafts/ai-bankster-prototype-v02/pages/ActivityLog.screen.md](../apps/ib/drafts/ai-bankster-prototype-v02/pages/ActivityLog.screen.md) | Журнал действий |
| [apps/ib/drafts/ai-bankster-prototype-v02/pages/HomePage.screen.md](../apps/ib/drafts/ai-bankster-prototype-v02/pages/HomePage.screen.md) | Главная страница IBP |
| [apps/ib/drafts/ai-bankster-prototype-v02/pages/MaterialDocument.screen.md](../apps/ib/drafts/ai-bankster-prototype-v02/pages/MaterialDocument.screen.md) | Материал с идеями |
| [apps/ib/drafts/ai-bankster-prototype-v02/pages/MaterialReport.screen.md](../apps/ib/drafts/ai-bankster-prototype-v02/pages/MaterialReport.screen.md) | Материал с идеями — бриф перед встречей |
| [apps/ib/drafts/ai-bankster-prototype-v02/pages/RequestBuilder.screen.md](../apps/ib/drafts/ai-bankster-prototype-v02/pages/RequestBuilder.screen.md) | Новый отчёт — режим конструктора |
| [apps/ib/drafts/ai-bankster-prototype-v02/pages/RequestBuilderCompact.screen.md](../apps/ib/drafts/ai-bankster-prototype-v02/pages/RequestBuilderCompact.screen.md) | Новый отчёт — режим конструктора, компактный вариант |
| [apps/ib/drafts/ai-bankster-prototype-v02/pages/RequestHistory.screen.md](../apps/ib/drafts/ai-bankster-prototype-v02/pages/RequestHistory.screen.md) | История и материалы |
| [apps/ib/drafts/ai-bankster-prototype-v02/pages/RequestThread.screen.md](../apps/ib/drafts/ai-bankster-prototype-v02/pages/RequestThread.screen.md) | Новый отчёт (нить запроса) |
| [apps/ib/drafts/ai-bankster-prototype-v02/proto-panel/comments.md](../apps/ib/drafts/ai-bankster-prototype-v02/proto-panel/comments.md) | Комментарии к прототипу |

### apps/ib/drafts/ai-bankster-prototype-v02 — снимки задач

| Документ | Аннотация |
|---|---|
| [apps/ib/drafts/ai-bankster-prototype-v02/ai-bankster-prototype-v02.handoff.md](../apps/ib/drafts/ai-bankster-prototype-v02/ai-bankster-prototype-v02.handoff.md) | ai-bankster-prototype-v02 — handoff |

### apps/ib/ib-payments-app

| Документ | Аннотация |
|---|---|
| [apps/ib/ib-payments-app/README.md](../apps/ib/ib-payments-app/README.md) | ib-payments-app — модуль раздела ib |

### apps/ib/ma-opportunities-app

| Документ | Аннотация |
|---|---|
| [apps/ib/ma-opportunities-app/README.md](../apps/ib/ma-opportunities-app/README.md) | ma-opportunities-app — модуль раздела ib |

### apps/ib/potentials-app

| Документ | Аннотация |
|---|---|
| [apps/ib/potentials-app/README.md](../apps/ib/potentials-app/README.md) | potentials-app — модуль раздела ib |

### apps/local-components

| Документ | Аннотация |
|---|---|
| [apps/local-components/README.md](../apps/local-components/README.md) | — |

### apps/postrade/corporate-requests-app

| Документ | Аннотация |
|---|---|
| [apps/postrade/corporate-requests-app/README.md](../apps/postrade/corporate-requests-app/README.md) | corporate-requests-app — модуль раздела postrade |

### apps/postrade/deals-app

| Документ | Аннотация |
|---|---|
| [apps/postrade/deals-app/README.md](../apps/postrade/deals-app/README.md) | deals-app — сделки ДИД (раздел postrade) |
| [apps/postrade/deals-app/data/API.md](../apps/postrade/deals-app/data/API.md) | API данных направления Post |
| [apps/postrade/deals-app/pages/Deal.screen.md](../apps/postrade/deals-app/pages/Deal.screen.md) | Сделка |
| [apps/postrade/deals-app/pages/MainPage.screen.md](../apps/postrade/deals-app/pages/MainPage.screen.md) | Главная страница |
| [apps/postrade/deals-app/pages/Portfolio.screen.md](../apps/postrade/deals-app/pages/Portfolio.screen.md) | Текущий портфель ДИД |
| [apps/postrade/deals-app/refs/Текущий портфель.md](../apps/postrade/deals-app/refs/Текущий%20портфель.md) | Новая страница "Текущий портфель ДИД" |
| [apps/postrade/deals-app/widgets/README.md](../apps/postrade/deals-app/widgets/README.md) | widgets — виджеты модуля deals-app |
| [apps/postrade/deals-app/widgets/modals/CounterpartiesEcmModal/CounterpartiesEcmModal.md](../apps/postrade/deals-app/widgets/modals/CounterpartiesEcmModal/CounterpartiesEcmModal.md) | Widget: CounterpartiesEcmModal — Модальное окно «Документы по сделке» |
| [apps/postrade/deals-app/widgets/modals/DealDescriptionModal/DealDescriptionModal.md](../apps/postrade/deals-app/widgets/modals/DealDescriptionModal/DealDescriptionModal.md) | Widget: DealDescriptionModal — Модальное окно описания сделки |
| [apps/postrade/deals-app/widgets/modals/DealFinancialMetricsModal/DealFinancialMetricsModal.md](../apps/postrade/deals-app/widgets/modals/DealFinancialMetricsModal/DealFinancialMetricsModal.md) | Модальное окно финансовых метрик сделки |
| [apps/postrade/deals-app/widgets/modals/DealPeriodModal/DealPeriodModal.md](../apps/postrade/deals-app/widgets/modals/DealPeriodModal/DealPeriodModal.md) | Модальное окно сроков сделки |
| [apps/postrade/deals-app/widgets/modals/DealProjectInformationModal/DealProjectInformationModal.md](../apps/postrade/deals-app/widgets/modals/DealProjectInformationModal/DealProjectInformationModal.md) | Widget: DealProjectInformationModal — Модальное окно сведений о проекте |
| [apps/postrade/deals-app/widgets/modals/DealTeamModal/DealTeamModal.md](../apps/postrade/deals-app/widgets/modals/DealTeamModal/DealTeamModal.md) | Модальное окно команды сделки |
| [apps/postrade/deals-app/widgets/modals/DealTitleModal/DealTitleModal.md](../apps/postrade/deals-app/widgets/modals/DealTitleModal/DealTitleModal.md) | Widget: DealTitleModal — Модальное окно редактирования сделки |
| [apps/postrade/deals-app/widgets/modals/DidProductsModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/DidProductsModal/CHANGELOG.md) | Окно «Продукты ДИД» (DidProductsModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/DidProductsModal/DidProductsModal.md](../apps/postrade/deals-app/widgets/modals/DidProductsModal/DidProductsModal.md) | Окно «Продукты ДИД» (DidProductsModal) |
| [apps/postrade/deals-app/widgets/modals/InstrumentTransferModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/InstrumentTransferModal/CHANGELOG.md) | Окно «Перенос инструмента» (InstrumentTransferModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/InstrumentTransferModal/InstrumentTransferModal.md](../apps/postrade/deals-app/widgets/modals/InstrumentTransferModal/InstrumentTransferModal.md) | Окно «Перенос инструмента» (InstrumentTransferModal) |
| [apps/postrade/deals-app/widgets/modals/InstrumentsCounterpartiesModal/CounterpartyCard/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/InstrumentsCounterpartiesModal/CounterpartyCard/CHANGELOG.md) | Карточка контрагента — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/InstrumentsCounterpartiesModal/CounterpartyCard/CounterpartyCard.md](../apps/postrade/deals-app/widgets/modals/InstrumentsCounterpartiesModal/CounterpartyCard/CounterpartyCard.md) | Карточка контрагента |
| [apps/postrade/deals-app/widgets/modals/InstrumentsCounterpartiesModal/InstrumentsCounterpartiesModal.md](../apps/postrade/deals-app/widgets/modals/InstrumentsCounterpartiesModal/InstrumentsCounterpartiesModal.md) | Модальное окно контрагентов (InstrumentsCounterpartiesModal) |
| [apps/postrade/deals-app/widgets/modals/InstrumentsModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/InstrumentsModal/CHANGELOG.md) | Окно «Инструменты» (InstrumentsModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/InstrumentsModal/InstrumentsModal.md](../apps/postrade/deals-app/widgets/modals/InstrumentsModal/InstrumentsModal.md) | Окно «Инструменты» (InstrumentsModal) |
| [apps/postrade/deals-app/widgets/modals/LinkChangeModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/LinkChangeModal/CHANGELOG.md) | Окно «Изменить связь с ФИ» (LinkChangeModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/LinkChangeModal/LinkChangeModal.md](../apps/postrade/deals-app/widgets/modals/LinkChangeModal/LinkChangeModal.md) | Окно «Изменить связь с ФИ» (LinkChangeModal) |
| [apps/postrade/deals-app/widgets/modals/ProductTreeConfirmModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/ProductTreeConfirmModal/CHANGELOG.md) | Подтверждение действия над деревом (ProductTreeConfirmModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/ProductTreeConfirmModal/ProductTreeConfirmModal.md](../apps/postrade/deals-app/widgets/modals/ProductTreeConfirmModal/ProductTreeConfirmModal.md) | Подтверждение действия над деревом (ProductTreeConfirmModal) |
| [apps/postrade/deals-app/widgets/modals/ProductsModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/ProductsModal/CHANGELOG.md) | Окно «Продукты» (ProductsModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/ProductsModal/ProductsModal.md](../apps/postrade/deals-app/widgets/modals/ProductsModal/ProductsModal.md) | Окно «Продукты» (ProductsModal) |
| [apps/postrade/deals-app/widgets/modals/RepaymentModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/RepaymentModal/CHANGELOG.md) | Окно погашения (RepaymentModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/RepaymentModal/RepaymentModal.md](../apps/postrade/deals-app/widgets/modals/RepaymentModal/RepaymentModal.md) | Окно погашения (RepaymentModal) |
| [apps/postrade/deals-app/widgets/popovers/RelatedDealsPopover/RelatedDealsPopover.md](../apps/postrade/deals-app/widgets/popovers/RelatedDealsPopover/RelatedDealsPopover.md) | Widget: RelatedDealsPopover — Поповер связанных сделок |
| [apps/postrade/deals-app/widgets/tables/DealCounterpartiesTable/DealCounterpartiesTable.md](../apps/postrade/deals-app/widgets/tables/DealCounterpartiesTable/DealCounterpartiesTable.md) | Контрагенты сделки |
| [apps/postrade/deals-app/widgets/tiles/CounterpartiesTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/CounterpartiesTile/CHANGELOG.md) | Контрагенты (CounterpartiesTile) — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/CounterpartiesTile/CounterpartiesTile.md](../apps/postrade/deals-app/widgets/tiles/CounterpartiesTile/CounterpartiesTile.md) | Контрагенты (CounterpartiesTile) |
| [apps/postrade/deals-app/widgets/tiles/DealDescriptionTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/DealDescriptionTile/CHANGELOG.md) | Описание сделки — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/DealDescriptionTile/DealDescriptionTile.md](../apps/postrade/deals-app/widgets/tiles/DealDescriptionTile/DealDescriptionTile.md) | Widget: DealDescriptionTile — Описание сделки |
| [apps/postrade/deals-app/widgets/tiles/DealFinancialMetricsTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/DealFinancialMetricsTile/CHANGELOG.md) | Финансовые метрики сделки — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/DealFinancialMetricsTile/DealFinancialMetricsTile.md](../apps/postrade/deals-app/widgets/tiles/DealFinancialMetricsTile/DealFinancialMetricsTile.md) | Финансовые метрики сделки |
| [apps/postrade/deals-app/widgets/tiles/DealMetricsCalculationTile/DealMetricsCalculationTile.md](../apps/postrade/deals-app/widgets/tiles/DealMetricsCalculationTile/DealMetricsCalculationTile.md) | Финансовые метрики |
| [apps/postrade/deals-app/widgets/tiles/DealPeriodTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/DealPeriodTile/CHANGELOG.md) | Сроки сделки — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/DealPeriodTile/DealPeriodTile.md](../apps/postrade/deals-app/widgets/tiles/DealPeriodTile/DealPeriodTile.md) | Сроки сделки |
| [apps/postrade/deals-app/widgets/tiles/DealProductTreeTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/DealProductTreeTile/CHANGELOG.md) | Продукты сделки (DealProductTreeTile) — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/DealProductTreeTile/DealProductTreeTile.md](../apps/postrade/deals-app/widgets/tiles/DealProductTreeTile/DealProductTreeTile.md) | Продукты сделки (DealProductTreeTile) |
| [apps/postrade/deals-app/widgets/tiles/DealRelatedCollateralsTile/DealRelatedCollateralsTile.md](../apps/postrade/deals-app/widgets/tiles/DealRelatedCollateralsTile/DealRelatedCollateralsTile.md) | Связанные обеспечения |
| [apps/postrade/deals-app/widgets/tiles/DealSetupTile/DealSetupTile.md](../apps/postrade/deals-app/widgets/tiles/DealSetupTile/DealSetupTile.md) | Заведение сделки |
| [apps/postrade/deals-app/widgets/tiles/DealTeamTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/DealTeamTile/CHANGELOG.md) | Команда сделки — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/DealTeamTile/DealTeamTile.md](../apps/postrade/deals-app/widgets/tiles/DealTeamTile/DealTeamTile.md) | Команда сделки |
| [apps/postrade/deals-app/widgets/tiles/EpsVbsImpactTile/EpsVbsImpactTile.md](../apps/postrade/deals-app/widgets/tiles/EpsVbsImpactTile/EpsVbsImpactTile.md) | Влияние на ЭПС/ВБС |
| [apps/postrade/deals-app/widgets/tiles/FinInstrumentsTile/FinInstrumentsTile.md](../apps/postrade/deals-app/widgets/tiles/FinInstrumentsTile/FinInstrumentsTile.md) | Финансовые инструменты |
| [apps/postrade/deals-app/widgets/tiles/ProjectInformationTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/ProjectInformationTile/CHANGELOG.md) | Сведения о проекте — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/ProjectInformationTile/ProjectInformationTile.md](../apps/postrade/deals-app/widgets/tiles/ProjectInformationTile/ProjectInformationTile.md) | Widget: ProjectInformationTile — Сведения о проекте |

### apps/postrade/payments-app

| Документ | Аннотация |
|---|---|
| [apps/postrade/payments-app/README.md](../apps/postrade/payments-app/README.md) | payments-app — модуль раздела postrade |

### apps/postrade/post-reports-app

| Документ | Аннотация |
|---|---|
| [apps/postrade/post-reports-app/README.md](../apps/postrade/post-reports-app/README.md) | post-reports-app — модуль раздела postrade |

### apps/pretrade/b3-opportunities-app

| Документ | Аннотация |
|---|---|
| [apps/pretrade/b3-opportunities-app/README.md](../apps/pretrade/b3-opportunities-app/README.md) | b3-opportunities-app — модуль раздела pretrade |

### apps/pretrade/callreports-app

| Документ | Аннотация |
|---|---|
| [apps/pretrade/callreports-app/README.md](../apps/pretrade/callreports-app/README.md) | callreports-app — модуль раздела pretrade |

### apps/pretrade/drafts/pipeline-manager-kanban

| Документ | Аннотация |
|---|---|
| [apps/pretrade/drafts/pipeline-manager-kanban/pages/PipelineManagement.screen.md](../apps/pretrade/drafts/pipeline-manager-kanban/pages/PipelineManagement.screen.md) | Pipeline Management |
| [apps/pretrade/drafts/pipeline-manager-kanban/pages/index.screen.md](../apps/pretrade/drafts/pipeline-manager-kanban/pages/index.screen.md) | Главная (Pipeline Management) |

### apps/pretrade/kfulsources-app

| Документ | Аннотация |
|---|---|
| [apps/pretrade/kfulsources-app/README.md](../apps/pretrade/kfulsources-app/README.md) | kfulsources-app — модуль раздела pretrade |

### apps/pretrade/offersources-app

| Документ | Аннотация |
|---|---|
| [apps/pretrade/offersources-app/README.md](../apps/pretrade/offersources-app/README.md) | offersources-app — модуль раздела pretrade |

### apps/pretrade/opportunities-app

| Документ | Аннотация |
|---|---|
| [apps/pretrade/opportunities-app/README.md](../apps/pretrade/opportunities-app/README.md) | opportunities-app — модуль раздела pretrade |

### apps/pretrade/salesources-app

| Документ | Аннотация |
|---|---|
| [apps/pretrade/salesources-app/README.md](../apps/pretrade/salesources-app/README.md) | salesources-app — модуль раздела pretrade |

## Задачи и заметки (19)

### Архив/черновики

| Документ | Аннотация |
|---|---|
| [docs/misc/agent-imp.md](misc/agent-imp.md) | Задача: привести обвязку агента в порядок до реструктуризации |
| [docs/misc/clients-app-all.md](misc/clients-app-all.md) | clients-app — объединённые дизайн-спецификации |
| [docs/misc/clients-app-tree.md](misc/clients-app-tree.md) | clients-app — структура папки |
| [docs/misc/project-tree.md](misc/project-tree.md) | — |
| [docs/misc/restructure-3-repos.md](misc/restructure-3-repos.md) | Реструктуризация воркспейса в три репозитория — задача к исполнению |

### Задачи

| Документ | Аннотация |
|---|---|
| [docs/tasks/0000-task-template.md](tasks/0000-task-template.md) | Implement feature X |
| [docs/tasks/0001-fix-repo.md](tasks/0001-fix-repo.md) | — |
| [docs/tasks/0002-simplify-m4p-chat.md](tasks/0002-simplify-m4p-chat.md) | Упростить экран чата M4P: убрать временно ненужные функции |
| [docs/tasks/0003-specs-to-common-template.md](tasks/0003-specs-to-common-template.md) | Привести спеки прототипов к общему шаблону |
| [docs/tasks/0004-typed-demo-data.md](tasks/0004-typed-demo-data.md) | Описать типы в демо-данных прототипов (JSDoc, имена в стиле API) |
| [docs/tasks/0005-code-review.md](tasks/0005-code-review.md) | Код-ревью задачи 0005: панель прототипа |
| [docs/tasks/0005-proto-panel.md](tasks/0005-proto-panel.md) | Панель прототипа: сценарии показа и комментарии рядом с прототипом |
| [docs/tasks/0005a-proto-panel-fix-state.md](tasks/0005a-proto-panel-fix-state.md) | Панель прототипа: Fix State — схема из зафиксированных состояний, номера State NN, интерфейс на английском |
| [docs/tasks/0006-docs-index.md](tasks/0006-docs-index.md) | Единый каталог документации: docs/index.md, генератор docs-index.mjs и шаг гейта |
| [docs/tasks/0007-ds-icons-unique-ids.md](tasks/0007-ds-icons-unique-ids.md) | ДС: у каждой копии иконки — свои id внутри SVG (ds-icons.js) |
| [docs/tasks/0008-sensor-linked-css.md](tasks/0008-sensor-linked-css.md) | Сенсор экрана видит CSS тайлов в отдельных файлах (&lt;link rel="stylesheet"&gt;) |
| [docs/tasks/RE0001-product-row-tree.md](tasks/RE0001-product-row-tree.md) | Дерево продуктов сделки: компонент ДС ProductRow, тайл «Продукты сделки» и окна выбора продуктов |

### Снимки задач

| Документ | Аннотация |
|---|---|
| [docs/tasks/0006-docs-index.handoff.md](tasks/0006-docs-index.handoff.md) | DocsIndex — handoff |
| [docs/tasks/RE0001-product-row-tree.handoff.md](tasks/RE0001-product-row-tree.handoff.md) | ProductRowTree — handoff |

## Служебное (1)

| Документ | Аннотация |
|---|---|
| [.agent-state/README.md](../.agent-state/README.md) | .agent-state — состояние проверок агента |
<!-- /@docs-index -->

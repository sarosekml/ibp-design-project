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

Документов: 333.

## Корень (4)

| Документ | Аннотация |
|---|---|
| [AGENTS.md](../AGENTS.md) | Прототипы IBP — вход для агентов |
| [GIGACODE.md](../GIGACODE.md) | Правила работы с воркспейсом IBP (GigaCode) |
| [README.md](../README.md) | — |
| [index.screen.md](../index.screen.md) | Хаб проектов |

## Дизайн-система (79)

| Документ | Аннотация |
|---|---|
| [design-system/AGENTS.md](../design-system/AGENTS.md) | Дизайн-система IBP — правила для агента |
| [design-system/CHANGELOG.md](../design-system/CHANGELOG.md) | Журнал правок ДС |
| [design-system/MAINTAINING.md](../design-system/MAINTAINING.md) | Дизайн-система — правила ведения |
| [design-system/readme.md](../design-system/readme.md) | IBP DS — дизайн-система |

### design-system/components

| Документ | Аннотация |
|---|---|
| [design-system/components/atoms/Avatar/Avatar.md](../design-system/components/atoms/Avatar/Avatar.md) | Avatar |
| [design-system/components/atoms/Badge/Badge.md](../design-system/components/atoms/Badge/Badge.md) | Badge |
| [design-system/components/atoms/Buttons/Buttons.md](../design-system/components/atoms/Buttons/Buttons.md) | Button |
| [design-system/components/atoms/Checkbox/Checkbox.md](../design-system/components/atoms/Checkbox/Checkbox.md) | Checkbox |
| [design-system/components/atoms/Chip/Chip.md](../design-system/components/atoms/Chip/Chip.md) | Chip |
| [design-system/components/atoms/Divider/Divider.md](../design-system/components/atoms/Divider/Divider.md) | Divider |
| [design-system/components/atoms/IconButton/IconButton.md](../design-system/components/atoms/IconButton/IconButton.md) | IconButton |
| [design-system/components/atoms/Keyboard/Keyboard.md](../design-system/components/atoms/Keyboard/Keyboard.md) | Клавиша |
| [design-system/components/atoms/LabelHelper/LabelHelper.md](../design-system/components/atoms/LabelHelper/LabelHelper.md) | Label / Helper |
| [design-system/components/atoms/Link/Link.md](../design-system/components/atoms/Link/Link.md) | Link |
| [design-system/components/atoms/Note/Note.md](../design-system/components/atoms/Note/Note.md) | Заметка |
| [design-system/components/atoms/ProgressBar/ProgressBar.md](../design-system/components/atoms/ProgressBar/ProgressBar.md) | ProgressBar |
| [design-system/components/atoms/Radiobutton/Radiobutton.md](../design-system/components/atoms/Radiobutton/Radiobutton.md) | Radiobutton |
| [design-system/components/atoms/Skeleton/Skeleton.md](../design-system/components/atoms/Skeleton/Skeleton.md) | Skeleton |
| [design-system/components/atoms/Slider/Slider.md](../design-system/components/atoms/Slider/Slider.md) | Ползунок |
| [design-system/components/atoms/Spinner/Spinner.md](../design-system/components/atoms/Spinner/Spinner.md) | Spinner |
| [design-system/components/atoms/StepMarker/StepMarker.md](../design-system/components/atoms/StepMarker/StepMarker.md) | Номер шага |
| [design-system/components/atoms/Switch/Switch.md](../design-system/components/atoms/Switch/Switch.md) | Switch |
| [design-system/components/molecules/Alert/Alert.md](../design-system/components/molecules/Alert/Alert.md) | Alert |
| [design-system/components/molecules/Breadcrumbs/Breadcrumbs.md](../design-system/components/molecules/Breadcrumbs/Breadcrumbs.md) | Breadcrumbs |
| [design-system/components/molecules/ButtonGroup/ButtonGroup.md](../design-system/components/molecules/ButtonGroup/ButtonGroup.md) | ButtonGroup |
| [design-system/components/molecules/ColorPicker/ColorPicker.md](../design-system/components/molecules/ColorPicker/ColorPicker.md) | Выбор цвета |
| [design-system/components/molecules/ContextMenu/ContextMenu.md](../design-system/components/molecules/ContextMenu/ContextMenu.md) | Context Menu |
| [design-system/components/molecules/DatePicker/DatePicker.md](../design-system/components/molecules/DatePicker/DatePicker.md) | DatePicker |
| [design-system/components/molecules/DocCard/DocCard.md](../design-system/components/molecules/DocCard/DocCard.md) | Карточка документа |
| [design-system/components/molecules/DropdownList/DropdownList.md](../design-system/components/molecules/DropdownList/DropdownList.md) | DropdownList |
| [design-system/components/molecules/EmptyState/EmptyState.md](../design-system/components/molecules/EmptyState/EmptyState.md) | EmptyState |
| [design-system/components/molecules/Inputs/InputAmountRange/InputAmountRange.md](../design-system/components/molecules/Inputs/InputAmountRange/InputAmountRange.md) | InputAmountRange |
| [design-system/components/molecules/Inputs/InputAutocomplete/InputAutocomplete.md](../design-system/components/molecules/Inputs/InputAutocomplete/InputAutocomplete.md) | InputAutocomplete |
| [design-system/components/molecules/Inputs/InputDate/InputDate.md](../design-system/components/molecules/Inputs/InputDate/InputDate.md) | InputDate |
| [design-system/components/molecules/Inputs/InputDateRange/InputDateRange.md](../design-system/components/molecules/Inputs/InputDateRange/InputDateRange.md) | InputDateRange |
| [design-system/components/molecules/Inputs/InputText/InputText.md](../design-system/components/molecules/Inputs/InputText/InputText.md) | InputText |
| [design-system/components/molecules/NavTile/NavTile.md](../design-system/components/molecules/NavTile/NavTile.md) | NavTile |
| [design-system/components/molecules/Pagination/Pagination.md](../design-system/components/molecules/Pagination/Pagination.md) | Pagination |
| [design-system/components/molecules/ReadOnlyField/ReadOnlyField.md](../design-system/components/molecules/ReadOnlyField/ReadOnlyField.md) | ReadOnlyField |
| [design-system/components/molecules/SegmentControl/SegmentControl.md](../design-system/components/molecules/SegmentControl/SegmentControl.md) | SegmentControl |
| [design-system/components/molecules/Splitter/Splitter.md](../design-system/components/molecules/Splitter/Splitter.md) | Splitter |
| [design-system/components/molecules/StepForm/StepForm.md](../design-system/components/molecules/StepForm/StepForm.md) | Пошаговая форма |
| [design-system/components/molecules/SubTab/SubTab.md](../design-system/components/molecules/SubTab/SubTab.md) | SubTab — табы второго уровня |
| [design-system/components/molecules/Tab/Tab.md](../design-system/components/molecules/Tab/Tab.md) | Tab |
| [design-system/components/molecules/Toast/Toast.md](../design-system/components/molecules/Toast/Toast.md) | Toast |
| [design-system/components/molecules/Tooltip/Tooltip.md](../design-system/components/molecules/Tooltip/Tooltip.md) | Tooltip |
| [design-system/components/organisms/AllocationBar/AllocationBar.md](../design-system/components/organisms/AllocationBar/AllocationBar.md) | AllocationBar |
| [design-system/components/organisms/Chart/Chart.md](../design-system/components/organisms/Chart/Chart.md) | Chart |
| [design-system/components/organisms/Drawer/Drawer.md](../design-system/components/organisms/Drawer/Drawer.md) | Панель деталей |
| [design-system/components/organisms/Entity/Entity.md](../design-system/components/organisms/Entity/Entity.md) | Entity |
| [design-system/components/organisms/Kanban/Kanban.md](../design-system/components/organisms/Kanban/Kanban.md) | Канбан-доска |
| [design-system/components/organisms/Modal/Modal.md](../design-system/components/organisms/Modal/Modal.md) | Modal |
| [design-system/components/organisms/NavPanel/NavPanel.md](../design-system/components/organisms/NavPanel/NavPanel.md) | Панель навигации |
| [design-system/components/organisms/PageHeader/PageHeader.md](../design-system/components/organisms/PageHeader/PageHeader.md) | PageHeader |
| [design-system/components/organisms/Popover/Popover.md](../design-system/components/organisms/Popover/Popover.md) | Popover |
| [design-system/components/organisms/ProductRow/ProductRow.md](../design-system/components/organisms/ProductRow/ProductRow.md) | ProductRow |
| [design-system/components/organisms/RiskMetric/RiskMetric.md](../design-system/components/organisms/RiskMetric/RiskMetric.md) | Риск-метрика |
| [design-system/components/organisms/SnackBar/SnackBar.md](../design-system/components/organisms/SnackBar/SnackBar.md) | SnackBar |
| [design-system/components/organisms/Table/Table.md](../design-system/components/organisms/Table/Table.md) | Table |
| [design-system/components/organisms/TableCell/TableCell.md](../design-system/components/organisms/TableCell/TableCell.md) | TableCell |
| [design-system/components/organisms/TableFilter/TableFilter.md](../design-system/components/organisms/TableFilter/TableFilter.md) | TableFilter |
| [design-system/components/organisms/Tile/Tile.md](../design-system/components/organisms/Tile/Tile.md) | Tile |

### design-system/foundations

| Документ | Аннотация |
|---|---|
| [design-system/foundations/Colors/Colors.md](../design-system/foundations/Colors/Colors.md) | Цвета |
| [design-system/foundations/Elevation/Elevation.md](../design-system/foundations/Elevation/Elevation.md) | Тени (Elevation) |
| [design-system/foundations/Icons/Icons.md](../design-system/foundations/Icons/Icons.md) | Иконки |
| [design-system/foundations/Illustrations/Illustrations.md](../design-system/foundations/Illustrations/Illustrations.md) | Иллюстрации |
| [design-system/foundations/Layout/Layout.md](../design-system/foundations/Layout/Layout.md) | Каркас экрана |
| [design-system/foundations/Radius/Radius.md](../design-system/foundations/Radius/Radius.md) | Скругления |
| [design-system/foundations/Spacing/Spacing.md](../design-system/foundations/Spacing/Spacing.md) | Сетка и отступы |
| [design-system/foundations/Themes/Themes.md](../design-system/foundations/Themes/Themes.md) | Темы (Themes) |
| [design-system/foundations/Typography/Typography.md](../design-system/foundations/Typography/Typography.md) | Типографика |

### design-system/specs

| Документ | Аннотация |
|---|---|
| [design-system/specs/\_TEMPLATE.md](../design-system/specs/_TEMPLATE.md) | Название по-русски |
| [design-system/specs/\_cheatsheet.md](../design-system/specs/_cheatsheet.md) | IBP DS — чит-шит компонентов |
| [design-system/specs/\_index.md](../design-system/specs/_index.md) | Индекс спек |
| [design-system/specs/\_runtime-hooks.md](../design-system/specs/_runtime-hooks.md) | Хуки рантаймов — чтобы макет работал |

### design-system/templates

| Документ | Аннотация |
|---|---|
| [design-system/templates/local-component/CHANGELOG.md](../design-system/templates/local-component/CHANGELOG.md) | &lt;Имя&gt; — журнал изменений |
| [design-system/templates/local-component/Component.md](../design-system/templates/local-component/Component.md) | &lt;Имя&gt; |
| [design-system/templates/local-component/README.md](../design-system/templates/local-component/README.md) | Шаблон локального компонента |

### design-system/tools

| Документ | Аннотация |
|---|---|
| [design-system/tools/ds-lint.md](../design-system/tools/ds-lint.md) | Линтер ДС: правила и проверки |

## Агентная система (39)

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
| [.agents/skills/docs-split/SKILL.md](../.agents/skills/docs-split/SKILL.md) | Раскатка страниц документации ДС на docs-split |
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
| [.agents/skills/session-plan/SKILL.md](../.agents/skills/session-plan/SKILL.md) | Планирование захода: смета и границы сессии |

## Приложения (143)

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

### apps/ib/drafts/ai-bankster-prototype-v01 — снимки задач

| Документ | Аннотация |
|---|---|
| [apps/ib/drafts/ai-bankster-prototype-v01/HubPanelSpacing.handoff.md](../apps/ib/drafts/ai-bankster-prototype-v01/HubPanelSpacing.handoff.md) | HubPanelSpacing — handoff |

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
| [apps/postrade/deals-app/widgets/modals/CounterpartiesEcmModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/CounterpartiesEcmModal/CHANGELOG.md) | Модальное окно «Документы по сделке» (CounterpartiesEcmModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/CounterpartiesEcmModal/CounterpartiesEcmModal.md](../apps/postrade/deals-app/widgets/modals/CounterpartiesEcmModal/CounterpartiesEcmModal.md) | Widget: CounterpartiesEcmModal — Модальное окно «Документы по сделке» |
| [apps/postrade/deals-app/widgets/modals/DealDescriptionModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/DealDescriptionModal/CHANGELOG.md) | Модальное окно описания сделки (DealDescriptionModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/DealDescriptionModal/DealDescriptionModal.md](../apps/postrade/deals-app/widgets/modals/DealDescriptionModal/DealDescriptionModal.md) | Widget: DealDescriptionModal — Модальное окно описания сделки |
| [apps/postrade/deals-app/widgets/modals/DealFinancialInstrumentCreateModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/DealFinancialInstrumentCreateModal/CHANGELOG.md) | Окно «Создание финансового инструмента» (DealFinancialInstrumentCreateModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/DealFinancialInstrumentCreateModal/DealFinancialInstrumentCreateModal.md](../apps/postrade/deals-app/widgets/modals/DealFinancialInstrumentCreateModal/DealFinancialInstrumentCreateModal.md) | Окно «Создание финансового инструмента» (DealFinancialInstrumentCreateModal) |
| [apps/postrade/deals-app/widgets/modals/DealFinancialInstrumentEditModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/DealFinancialInstrumentEditModal/CHANGELOG.md) | Окно «ФИ — изменение» (DealFinancialInstrumentEditModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/DealFinancialInstrumentEditModal/DealFinancialInstrumentEditModal.md](../apps/postrade/deals-app/widgets/modals/DealFinancialInstrumentEditModal/DealFinancialInstrumentEditModal.md) | Окно «ФИ — изменение» (DealFinancialInstrumentEditModal) |
| [apps/postrade/deals-app/widgets/modals/DealFinancialMetricsModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/DealFinancialMetricsModal/CHANGELOG.md) | Модальное окно финансовых метрик сделки (DealFinancialMetricsModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/DealFinancialMetricsModal/DealFinancialMetricsModal.md](../apps/postrade/deals-app/widgets/modals/DealFinancialMetricsModal/DealFinancialMetricsModal.md) | Модальное окно финансовых метрик сделки |
| [apps/postrade/deals-app/widgets/modals/DealPeriodModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/DealPeriodModal/CHANGELOG.md) | Модальное окно сроков сделки (DealPeriodModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/DealPeriodModal/DealPeriodModal.md](../apps/postrade/deals-app/widgets/modals/DealPeriodModal/DealPeriodModal.md) | Модальное окно сроков сделки |
| [apps/postrade/deals-app/widgets/modals/DealProjectInformationModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/DealProjectInformationModal/CHANGELOG.md) | Модальное окно сведений о проекте (DealProjectInformationModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/DealProjectInformationModal/DealProjectInformationModal.md](../apps/postrade/deals-app/widgets/modals/DealProjectInformationModal/DealProjectInformationModal.md) | Widget: DealProjectInformationModal — Модальное окно сведений о проекте |
| [apps/postrade/deals-app/widgets/modals/DealTeamModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/DealTeamModal/CHANGELOG.md) | Модальное окно команды сделки (DealTeamModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/DealTeamModal/DealTeamModal.md](../apps/postrade/deals-app/widgets/modals/DealTeamModal/DealTeamModal.md) | Модальное окно команды сделки |
| [apps/postrade/deals-app/widgets/modals/DealTitleModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/DealTitleModal/CHANGELOG.md) | Модальное окно редактирования сделки (DealTitleModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/DealTitleModal/DealTitleModal.md](../apps/postrade/deals-app/widgets/modals/DealTitleModal/DealTitleModal.md) | Widget: DealTitleModal — Модальное окно редактирования сделки |
| [apps/postrade/deals-app/widgets/modals/DidProductsModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/DidProductsModal/CHANGELOG.md) | Окно «Продукты ДИД» (DidProductsModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/DidProductsModal/DidProductsModal.md](../apps/postrade/deals-app/widgets/modals/DidProductsModal/DidProductsModal.md) | Окно «Продукты ДИД» (DidProductsModal) |
| [apps/postrade/deals-app/widgets/modals/InstrumentTransferModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/InstrumentTransferModal/CHANGELOG.md) | Окно «Перенос инструмента» (InstrumentTransferModal) — журнал изменений |
| [apps/postrade/deals-app/widgets/modals/InstrumentTransferModal/InstrumentTransferModal.md](../apps/postrade/deals-app/widgets/modals/InstrumentTransferModal/InstrumentTransferModal.md) | Окно «Перенос инструмента» (InstrumentTransferModal) |
| [apps/postrade/deals-app/widgets/modals/InstrumentsCounterpartiesModal/CHANGELOG.md](../apps/postrade/deals-app/widgets/modals/InstrumentsCounterpartiesModal/CHANGELOG.md) | Модальное окно контрагентов (InstrumentsCounterpartiesModal) — журнал изменений |
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
| [apps/postrade/deals-app/widgets/popovers/RelatedDealsPopover/CHANGELOG.md](../apps/postrade/deals-app/widgets/popovers/RelatedDealsPopover/CHANGELOG.md) | Поповер связанных сделок (RelatedDealsPopover) — журнал изменений |
| [apps/postrade/deals-app/widgets/popovers/RelatedDealsPopover/RelatedDealsPopover.md](../apps/postrade/deals-app/widgets/popovers/RelatedDealsPopover/RelatedDealsPopover.md) | Widget: RelatedDealsPopover — Поповер связанных сделок |
| [apps/postrade/deals-app/widgets/tables/DealCounterpartiesTable/CHANGELOG.md](../apps/postrade/deals-app/widgets/tables/DealCounterpartiesTable/CHANGELOG.md) | Контрагенты сделки (DealCounterpartiesTable) — журнал изменений |
| [apps/postrade/deals-app/widgets/tables/DealCounterpartiesTable/DealCounterpartiesTable.md](../apps/postrade/deals-app/widgets/tables/DealCounterpartiesTable/DealCounterpartiesTable.md) | Контрагенты сделки |
| [apps/postrade/deals-app/widgets/tiles/CounterpartiesTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/CounterpartiesTile/CHANGELOG.md) | Контрагенты (CounterpartiesTile) — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/CounterpartiesTile/CounterpartiesTile.md](../apps/postrade/deals-app/widgets/tiles/CounterpartiesTile/CounterpartiesTile.md) | Контрагенты (CounterpartiesTile) |
| [apps/postrade/deals-app/widgets/tiles/DealDescriptionTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/DealDescriptionTile/CHANGELOG.md) | Описание сделки — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/DealDescriptionTile/DealDescriptionTile.md](../apps/postrade/deals-app/widgets/tiles/DealDescriptionTile/DealDescriptionTile.md) | Widget: DealDescriptionTile — Описание сделки |
| [apps/postrade/deals-app/widgets/tiles/DealFinancialMetricsTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/DealFinancialMetricsTile/CHANGELOG.md) | Финансовые метрики сделки — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/DealFinancialMetricsTile/DealFinancialMetricsTile.md](../apps/postrade/deals-app/widgets/tiles/DealFinancialMetricsTile/DealFinancialMetricsTile.md) | Финансовые метрики сделки |
| [apps/postrade/deals-app/widgets/tiles/DealMetricsCalculationTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/DealMetricsCalculationTile/CHANGELOG.md) | Финансовые метрики (DealMetricsCalculationTile) — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/DealMetricsCalculationTile/DealMetricsCalculationTile.md](../apps/postrade/deals-app/widgets/tiles/DealMetricsCalculationTile/DealMetricsCalculationTile.md) | Финансовые метрики |
| [apps/postrade/deals-app/widgets/tiles/DealPeriodTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/DealPeriodTile/CHANGELOG.md) | Сроки сделки — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/DealPeriodTile/DealPeriodTile.md](../apps/postrade/deals-app/widgets/tiles/DealPeriodTile/DealPeriodTile.md) | Сроки сделки |
| [apps/postrade/deals-app/widgets/tiles/DealProductTreeTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/DealProductTreeTile/CHANGELOG.md) | Продукты сделки (DealProductTreeTile) — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/DealProductTreeTile/DealProductTreeTile.md](../apps/postrade/deals-app/widgets/tiles/DealProductTreeTile/DealProductTreeTile.md) | Продукты сделки (DealProductTreeTile) |
| [apps/postrade/deals-app/widgets/tiles/DealRelatedCollateralsTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/DealRelatedCollateralsTile/CHANGELOG.md) | Связанные обеспечения (DealRelatedCollateralsTile) — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/DealRelatedCollateralsTile/DealRelatedCollateralsTile.md](../apps/postrade/deals-app/widgets/tiles/DealRelatedCollateralsTile/DealRelatedCollateralsTile.md) | Связанные обеспечения |
| [apps/postrade/deals-app/widgets/tiles/DealSetupTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/DealSetupTile/CHANGELOG.md) | Заведение сделки (DealSetupTile) — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/DealSetupTile/DealSetupTile.md](../apps/postrade/deals-app/widgets/tiles/DealSetupTile/DealSetupTile.md) | Заведение сделки |
| [apps/postrade/deals-app/widgets/tiles/DealTeamTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/DealTeamTile/CHANGELOG.md) | Команда сделки — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/DealTeamTile/DealTeamTile.md](../apps/postrade/deals-app/widgets/tiles/DealTeamTile/DealTeamTile.md) | Команда сделки |
| [apps/postrade/deals-app/widgets/tiles/EpsVbsImpactTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/EpsVbsImpactTile/CHANGELOG.md) | Влияние на ЭПС/ВБС (EpsVbsImpactTile) — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/EpsVbsImpactTile/EpsVbsImpactTile.md](../apps/postrade/deals-app/widgets/tiles/EpsVbsImpactTile/EpsVbsImpactTile.md) | Влияние на ЭПС/ВБС |
| [apps/postrade/deals-app/widgets/tiles/FinInstrumentsTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/FinInstrumentsTile/CHANGELOG.md) | Финансовые инструменты (FinInstrumentsTile) — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/FinInstrumentsTile/FinInstrumentsTile.md](../apps/postrade/deals-app/widgets/tiles/FinInstrumentsTile/FinInstrumentsTile.md) | Финансовые инструменты (FinInstrumentsTile) |
| [apps/postrade/deals-app/widgets/tiles/ProjectInformationTile/CHANGELOG.md](../apps/postrade/deals-app/widgets/tiles/ProjectInformationTile/CHANGELOG.md) | Сведения о проекте — журнал изменений |
| [apps/postrade/deals-app/widgets/tiles/ProjectInformationTile/ProjectInformationTile.md](../apps/postrade/deals-app/widgets/tiles/ProjectInformationTile/ProjectInformationTile.md) | Widget: ProjectInformationTile — Сведения о проекте |

### apps/postrade/deals-app — снимки задач

| Документ | Аннотация |
|---|---|
| [apps/postrade/deals-app/FinInstrumentsCard.handoff.md](../apps/postrade/deals-app/FinInstrumentsCard.handoff.md) | FinInstrumentsCard — handoff |
| [apps/postrade/deals-app/PortfolioData.handoff.md](../apps/postrade/deals-app/PortfolioData.handoff.md) | PortfolioData — handoff |

### apps/postrade/drafts/tranche-page

| Документ | Аннотация |
|---|---|
| [apps/postrade/drafts/tranche-page/pages/RsbuHards.screen.md](../apps/postrade/drafts/tranche-page/pages/RsbuHards.screen.md) | Харды в РСБУ |
| [apps/postrade/drafts/tranche-page/pages/Tranche.screen.md](../apps/postrade/drafts/tranche-page/pages/Tranche.screen.md) | Страница транша |
| [apps/postrade/drafts/tranche-page/pages/index.screen.md](../apps/postrade/drafts/tranche-page/pages/index.screen.md) | Главная концепта «Страница транша» |
| [apps/postrade/drafts/tranche-page/proto-panel/comments.md](../apps/postrade/drafts/tranche-page/proto-panel/comments.md) | Комментарии к прототипу |

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

### apps/pretrade/drafts/pipelineManager-v01

| Документ | Аннотация |
|---|---|
| [apps/pretrade/drafts/pipelineManager-v01/pages/PipelineManagement.screen.md](../apps/pretrade/drafts/pipelineManager-v01/pages/PipelineManagement.screen.md) | Pipeline Management |
| [apps/pretrade/drafts/pipelineManager-v01/pages/index.screen.md](../apps/pretrade/drafts/pipelineManager-v01/pages/index.screen.md) | Главная (Pipeline Management) |

### apps/pretrade/drafts/pipelineManager-v02

| Документ | Аннотация |
|---|---|
| [apps/pretrade/drafts/pipelineManager-v02/pages/PipelineManagement.screen.md](../apps/pretrade/drafts/pipelineManager-v02/pages/PipelineManagement.screen.md) | Pipeline Management |
| [apps/pretrade/drafts/pipelineManager-v02/pages/index.screen.md](../apps/pretrade/drafts/pipelineManager-v02/pages/index.screen.md) | Главная (Pipeline Management) |

### apps/pretrade/drafts/pipelineScanner-v07

| Документ | Аннотация |
|---|---|
| [apps/pretrade/drafts/pipelineScanner-v07/pages/ActivityLog.screen.md](../apps/pretrade/drafts/pipelineScanner-v07/pages/ActivityLog.screen.md) | Журнал действий |
| [apps/pretrade/drafts/pipelineScanner-v07/pages/HomePage.screen.md](../apps/pretrade/drafts/pipelineScanner-v07/pages/HomePage.screen.md) | Главная страница IBP |
| [apps/pretrade/drafts/pipelineScanner-v07/pages/MaterialDocument.screen.md](../apps/pretrade/drafts/pipelineScanner-v07/pages/MaterialDocument.screen.md) | Материал с идеями |
| [apps/pretrade/drafts/pipelineScanner-v07/pages/MaterialReport-AR.screen.md](../apps/pretrade/drafts/pipelineScanner-v07/pages/MaterialReport-AR.screen.md) | Материал — А-риск не выявлен |
| [apps/pretrade/drafts/pipelineScanner-v07/pages/MaterialReport.screen.md](../apps/pretrade/drafts/pipelineScanner-v07/pages/MaterialReport.screen.md) | Материал с идеями — бриф перед встречей |
| [apps/pretrade/drafts/pipelineScanner-v07/pages/RequestBuilder.screen.md](../apps/pretrade/drafts/pipelineScanner-v07/pages/RequestBuilder.screen.md) | Новый отчёт — режим конструктора |
| [apps/pretrade/drafts/pipelineScanner-v07/pages/RequestBuilderCompact.screen.md](../apps/pretrade/drafts/pipelineScanner-v07/pages/RequestBuilderCompact.screen.md) | Новый отчёт — режим конструктора, компактный вариант |
| [apps/pretrade/drafts/pipelineScanner-v07/pages/RequestHistory.screen.md](../apps/pretrade/drafts/pipelineScanner-v07/pages/RequestHistory.screen.md) | История и материалы |
| [apps/pretrade/drafts/pipelineScanner-v07/pages/RequestThread.screen.md](../apps/pretrade/drafts/pipelineScanner-v07/pages/RequestThread.screen.md) | Новый отчёт (нить запроса) |

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

## Задачи и заметки (67)

### Архив/черновики

| Документ | Аннотация |
|---|---|
| [docs/misc/RE0005-themes/audit.md](misc/RE0005-themes/audit.md) | RE0005 · Э1 — аудит текущей палитры ДС |
| [docs/misc/RE0005-themes/map.md](misc/RE0005-themes/map.md) | RE0005 · Э2 — словарь ролей и карта «старое → новое» |
| [docs/misc/RE0006-palette/lesson-170.md](misc/RE0006-palette/lesson-170.md) | — |
| [docs/misc/RE0006-palette/lesson-171.md](misc/RE0006-palette/lesson-171.md) | — |
| [docs/misc/RE0006-palette/lesson-172.md](misc/RE0006-palette/lesson-172.md) | — |
| [docs/misc/RE0006-palette/lesson-173.md](misc/RE0006-palette/lesson-173.md) | — |
| [docs/misc/RE0007-palette-polish/lesson.md](misc/RE0007-palette-polish/lesson.md) | — |
| [docs/misc/RE0008-palette-legacy/lesson.md](misc/RE0008-palette-legacy/lesson.md) | — |
| [docs/misc/RE0009-scroll-dark/lesson.md](misc/RE0009-scroll-dark/lesson.md) | — |
| [docs/misc/RE0010-scroll-dark-2/lesson-2.md](misc/RE0010-scroll-dark-2/lesson-2.md) | — |
| [docs/misc/RE0010-scroll-dark-2/lesson.md](misc/RE0010-scroll-dark-2/lesson.md) | — |
| [docs/misc/agent-imp.md](misc/agent-imp.md) | Задача: привести обвязку агента в порядок до реструктуризации |
| [docs/misc/clients-app-all.md](misc/clients-app-all.md) | clients-app — объединённые дизайн-спецификации |
| [docs/misc/clients-app-tree.md](misc/clients-app-tree.md) | clients-app — структура папки |
| [docs/misc/project-tree.md](misc/project-tree.md) | — |
| [docs/misc/proto-panel-nested-theme/lesson.md](misc/proto-panel-nested-theme/lesson.md) | — |
| [docs/misc/restructure-3-repos.md](misc/restructure-3-repos.md) | Реструктуризация воркспейса в три репозитория — задача к исполнению |

### Задачи

| Документ | Аннотация |
|---|---|
| [docs/tasks/0000-task-template.md](tasks/0000-task-template.md) | Implement feature X |
| [docs/tasks/MS0001-fix-repo.md](tasks/MS0001-fix-repo.md) | — |
| [docs/tasks/MS0002-simplify-m4p-chat.md](tasks/MS0002-simplify-m4p-chat.md) | Упростить экран чата M4P: убрать временно ненужные функции |
| [docs/tasks/MS0003-specs-to-common-template.md](tasks/MS0003-specs-to-common-template.md) | Привести спеки прототипов к общему шаблону |
| [docs/tasks/MS0004-typed-demo-data.md](tasks/MS0004-typed-demo-data.md) | Описать типы в демо-данных прототипов (JSDoc, имена в стиле API) |
| [docs/tasks/MS0005-code-review.md](tasks/MS0005-code-review.md) | Код-ревью задачи 0005: панель прототипа |
| [docs/tasks/MS0005-proto-panel.md](tasks/MS0005-proto-panel.md) | Панель прототипа: сценарии показа и комментарии рядом с прототипом |
| [docs/tasks/MS0005a-proto-panel-fix-state.md](tasks/MS0005a-proto-panel-fix-state.md) | Панель прототипа: Fix State — схема из зафиксированных состояний, номера State NN, интерфейс на английском |
| [docs/tasks/MS0006-docs-index.md](tasks/MS0006-docs-index.md) | Единый каталог документации: docs/index.md, генератор docs-index.mjs и шаг гейта |
| [docs/tasks/MS0007-ds-icons-unique-ids.md](tasks/MS0007-ds-icons-unique-ids.md) | ДС: у каждой копии иконки — свои id внутри SVG (ds-icons.js) |
| [docs/tasks/MS0008-sensor-linked-css.md](tasks/MS0008-sensor-linked-css.md) | Сенсор экрана видит CSS тайлов в отдельных файлах (&lt;link rel="stylesheet"&gt;) |
| [docs/tasks/MS0009-ds-chip-choice.md](tasks/MS0009-ds-chip-choice.md) | Chip: чипы выбора — стиль Dashed, ведущий тег, состояние Selected, чип на &lt;button&gt; |
| [docs/tasks/MS0010-ds-prompt-input.md](tasks/MS0010-ds-prompt-input.md) | PromptInput: новый организм ДС — поле ввода промпта с вложениями, подсветкой фрагментов и выезжающей панелью |
| [docs/tasks/MS0010a-ds-kbd.md](tasks/MS0010a-ds-kbd.md) | Kbd: новый атом ДС — обозначение клавиши |
| [docs/tasks/MS0010b-ds-button-toggle.md](tasks/MS0010b-ds-button-toggle.md) | Buttons: состояние «нажата» у всех кнопок, две иконки переключателя и смена кнопки с анимацией |
| [docs/tasks/MS0010c-ds-chip-expanded.md](tasks/MS0010c-ds-chip-expanded.md) | Chip: состояние «раскрыт» — чип, который показывает связанный блок |
| [docs/tasks/MS0010d-ds-step-marker.md](tasks/MS0010d-ds-step-marker.md) | StepMarker: новый атом ДС — номер шага, который становится галочкой |
| [docs/tasks/MS0010e-ds-note.md](tasks/MS0010e-ds-note.md) | Note: новый атом ДС — заметка «иконка + вторичный текст» |
| [docs/tasks/MS0010f-ds-chip-expandable.md](tasks/MS0010f-ds-chip-expandable.md) | Chip: раскрывающийся чип — весь текст фрагмента внутри чипа (вместо блока цитаты) |
| [docs/tasks/MS0010g-ds-tile-inset.md](tasks/MS0010g-ds-tile-inset.md) | Tile: вариант Inset — вложенная подложка с заголовком (блок «История запросов по объекту») |
| [docs/tasks/MS0010h-ds-step-form.md](tasks/MS0010h-ds-step-form.md) | StepForm: новая молекула ДС — пошаговая форма (секции конструктора запроса) |
| [docs/tasks/MS0010i-ds-input-focus-ring.md](tasks/MS0010i-ds-input-focus-ring.md) | Inputs: светлое кольцо фокуса как в прототипе — во всех полях ДС |
| [docs/tasks/MS0011-ds-doc-card.md](tasks/MS0011-ds-doc-card.md) | Карточка документа в нити: молекула DocCard вместо локального .doc (план — композиция Tile Card + Entity M) |
| [docs/tasks/MS0012-ds-quote.md](tasks/MS0012-ds-quote.md) | Quote: новая молекула ДС — цитата фрагмента с источником (на будущее) |
| [docs/tasks/MS0013-ds-theme-generator.md](tasks/MS0013-ds-theme-generator.md) | Темы ДС из файлов (ibp-legacy, ibp-neo, custom), генератор палитры из brand 500 и neutral 500, страница «Темы» — выбор темы и конструктор по образцу coolors |
| [docs/tasks/MS0013-ds-theme-generator.review-2.md](tasks/MS0013-ds-theme-generator.review-2.md) | MS0013 — ревью реализации и задание на доработку |
| [docs/tasks/MS0013-ds-theme-generator.review.md](tasks/MS0013-ds-theme-generator.review.md) | MS0013 — приёмка и сохранность |
| [docs/tasks/RE0001-product-row-tree.md](tasks/RE0001-product-row-tree.md) | Дерево продуктов сделки: компонент ДС ProductRow, тайл «Продукты сделки» и окна выбора продуктов |
| [docs/tasks/RE0002-ds-component-folders.md](tasks/RE0002-ds-component-folders.md) | ДС: компонент в своей папке со всеми файлами — структура как в ibp-ui-kit |
| [docs/tasks/RE0004-local-components-template.md](tasks/RE0004-local-components-template.md) | Локальные компоненты: единый шаблон паспорта, страницы документации и конструктора |
| [docs/tasks/RE0005-ds-themes.md](tasks/RE0005-ds-themes.md) | Темы ДС: новая палитра (светлая и тёмная) поверх текущей, переключатель тем, основа кастомных тем |
| [docs/tasks/RE0006-ds-palette.md](tasks/RE0006-ds-palette.md) | Палитра ДС: новая светлая и тёмная темы по эталону Untitled UI, сервисная на пурпуре, инструкция переезда для разработки |
| [docs/tasks/RE0007-ds-palette-polish.md](tasks/RE0007-ds-palette-polish.md) | Полировка палитры и тем: статусы как в legacy, границы, иконки, навигация, скролл, перетаскивание кнопки тем |
| [docs/tasks/RE0008-ds-palette-legacy.md](tasks/RE0008-ds-palette-legacy.md) | Палитра: возврат legacy для графиков и статусов, синева neutral, аутлайны и мелочи |
| [docs/tasks/RE0009-ds-scroll-dark.md](tasks/RE0009-ds-scroll-dark.md) | Оверлейные полосы прокрутки и читаемость тёмной темы |
| [docs/tasks/RE0010-ds-scroll-dark-2.md](tasks/RE0010-ds-scroll-dark-2.md) | Скролл без системной полосы, слои тёмной темы, фокус списка, тёмная иллюстрация |
| [docs/tasks/RE0011-ds-illustrations-dark.md](tasks/RE0011-ds-illustrations-dark.md) | Тёмные варианты иллюстраций и фон главной |

### Снимки задач

| Документ | Аннотация |
|---|---|
| [docs/tasks/MS0006-docs-index.handoff.md](tasks/MS0006-docs-index.handoff.md) | DocsIndex — handoff |
| [docs/tasks/MS0013-ds-theme-generator.handoff.md](tasks/MS0013-ds-theme-generator.handoff.md) | MS0013 — handoff |
| [docs/tasks/RE0001-product-row-tree.handoff.md](tasks/RE0001-product-row-tree.handoff.md) | ProductRowTree — handoff |
| [docs/tasks/RE0002-ds-component-folders.handoff.md](tasks/RE0002-ds-component-folders.handoff.md) | RE0002 · ДС: компонент в своей папке — handoff |
| [docs/tasks/RE0003-fin-instruments-tile.handoff.md](tasks/RE0003-fin-instruments-tile.handoff.md) | RE0003 FinInstrumentsTile — handoff |
| [docs/tasks/RE0004-local-components-template.handoff.md](tasks/RE0004-local-components-template.handoff.md) | RE0004 — handoff |
| [docs/tasks/RE0005-ds-themes.handoff.md](tasks/RE0005-ds-themes.handoff.md) | RE0005 — handoff |
| [docs/tasks/RE0006-ds-palette.handoff.md](tasks/RE0006-ds-palette.handoff.md) | RE0006 — handoff |
| [docs/tasks/RE0007-ds-palette-polish.handoff.md](tasks/RE0007-ds-palette-polish.handoff.md) | RE0007 — handoff |
| [docs/tasks/RE0008-ds-palette-legacy.handoff.md](tasks/RE0008-ds-palette-legacy.handoff.md) | RE0008 — handoff |
| [docs/tasks/RE0009-ds-scroll-dark.handoff.md](tasks/RE0009-ds-scroll-dark.handoff.md) | RE0009 — handoff |
| [docs/tasks/RE0010-ds-scroll-dark-2.handoff.md](tasks/RE0010-ds-scroll-dark-2.handoff.md) | RE0010 — handoff |
| [docs/tasks/RE0011-ds-illustrations-dark.handoff.md](tasks/RE0011-ds-illustrations-dark.handoff.md) | RE0011 — handoff |

## Служебное (1)

| Документ | Аннотация |
|---|---|
| [.agent-state/README.md](../.agent-state/README.md) | .agent-state — состояние проверок агента |
<!-- /@docs-index -->

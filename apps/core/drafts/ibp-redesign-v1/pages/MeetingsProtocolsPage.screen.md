---
screen: MeetingsProtocolsPage
kind: screen
title: Встречи
file: apps/core/drafts/ibp-redesign-v1/pages/MeetingsProtocolsPage.preview.html
module: core/drafts/ibp-redesign-v1
frontend: ib/ma-opportunities-app pages/MeetingsProtocols (модуля встреч стенда в дереве нет)
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.000"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tab, Splitter, Table, TableCell, TableFilter, Pagination, Chip, Link, Buttons, IconButton, Modal, SnackBar, Toast, Tile, Entity, Avatar, Checkbox]
widgets: [tables/MeetingsProtocolsList, tiles/MeetingsProtocolsDetails, modals/ChangeTaskStatusModal]
---

# Page: MeetingsProtocolsPage — Встречи

## 1. Назначение (Purpose)

Реестр встреч с предпросмотром справа (Splitter), как в системе: карточка встречи с источником, общей информацией, участниками, повесткой и связями.

**Роль пользователя:** Аналитик ДИД
**Права:** просмотр; «Завершить», «Отменить», «Исполнить» задачу повестки (Р7); «Новая встреча», «Новый протокол», «Создать лид» — по клику ничего (Р6)

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** не решено (10.10.2026)
- **Адрес в прототипе:** `MeetingsProtocolsPage.preview.html?tab=MY&id=M-8904`
- **Пункт бокового меню** в состоянии `nav__item--selected`: «Встречи».

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 | Главная | `HomePage.html` |
| 2 (текущий) | Встречи: <вкладка> | — |

## 3. Пары во фронтенде

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница | `pages/MeetingsProtocolsPage.html` | ib/ma-opportunities-app `MeetingsProtocolsPage` |
| Реестр | `MeetingsProtocolsList` | MeetingsProtocolsList |
| Предпросмотр | `MeetingsProtocolsDetails` | MeetingsProtocolsDetails (кнопки — MeetingUpdateActions) |
| Вкладки | `?tab=MY|DESK` | не решено (В1 MS0014a) |

## 4. Раскладка (Layout)

```
Page (Layout, nav--rail, screen--app)
├── PageHeader — «Встречи» · «Новый протокол» · «Новая встреча» (Р6)
├── Tab ×2 — Мои встречи · Встречи моего деска
└── Splitter (заполняет высоту)
    ├── MeetingsProtocolsList — реестр
    └── .ds-scroll: MeetingsProtocolsDetails — предпросмотр выбранной встречи
```

Высота: `.screen--app`; сплиттер заполняет высоту, правая панель прокручивается своей областью `.ds-scroll`.

## 5. Компоненты (Components)

| Компонент | Откуда |
|---|---|
| Layout | ДС — `design-system/foundations/Layout/Layout.md` |
| NavPanel | ДС — `design-system/components/organisms/NavPanel/NavPanel.md` |
| Breadcrumbs | ДС — `design-system/components/molecules/Breadcrumbs/Breadcrumbs.md` |
| PageHeader | ДС — `design-system/components/organisms/PageHeader/PageHeader.md` |
| Tab | ДС — `design-system/components/molecules/Tab/Tab.md` |
| Splitter | ДС — `design-system/components/molecules/Splitter/Splitter.md` |
| Table | ДС — `design-system/components/organisms/Table/Table.md` |
| TableCell | ДС — `design-system/components/organisms/TableCell/TableCell.md` |
| TableFilter | ДС — `design-system/components/organisms/TableFilter/TableFilter.md` |
| Pagination | ДС — `design-system/components/molecules/Pagination/Pagination.md` |
| Chip | ДС — `design-system/components/atoms/Chip/Chip.md` |
| Link | ДС — `design-system/components/atoms/Link/Link.md` |
| Buttons | ДС — `design-system/components/atoms/Buttons/Buttons.md` |
| IconButton | ДС — `design-system/components/atoms/IconButton/IconButton.md` |
| Modal | ДС — `design-system/components/organisms/Modal/Modal.md` |
| SnackBar | ДС — `design-system/components/organisms/SnackBar/SnackBar.md` |
| Toast | ДС — `design-system/components/molecules/Toast/Toast.md` |
| Tile | ДС — `design-system/components/organisms/Tile/Tile.md` |
| Entity | ДС — `design-system/components/organisms/Entity/Entity.md` |
| Avatar | ДС — `design-system/components/atoms/Avatar/Avatar.md` |
| Checkbox | ДС — `design-system/components/atoms/Checkbox/Checkbox.md` |
| `MeetingsProtocolsList` | виджет концепта — `../widgets/tables/MeetingsProtocolsList/MeetingsProtocolsList.md` |
| `MeetingsProtocolsDetails` | виджет концепта — `../widgets/tiles/MeetingsProtocolsDetails/MeetingsProtocolsDetails.md` |
| `ChangeTaskStatusModal` | виджет концепта — `../widgets/modals/ChangeTaskStatusModal/ChangeTaskStatusModal.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 6. Таблицы (Tables)

Таблиц в разметке страницы нет: таблицы — виджеты, колонки — в их паспортах.

## 7. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| Открытие без `?id=` | выбор отсутствует, правая панель скрыта; таблица на всю ширину |
| Строка встречи или явный `?id=` | предпросмотр выбранной встречи справа |
| Крестик предпросмотра | панель скрыта, реестр на всю ширину |
| «Завершить» / «Отменить» | подтверждение → статус, SnackBar, реестр и карточка обновляются (Р7) |
| «Исполнить» в повестке | `ChangeTaskStatusModal` |
| Источник встречи | страница лида / сделки / клиента |
| Ручка Splitter | ширины панелей 35–75 % |

## 8. Модальные окна (Modals)

| id | Заголовок | Ширина | Содержимое | Кнопки подвала |
|---|---|---|---|---|
| `meeting-confirm-scrim` | Завершить встречу / Отменить встречу | `--w3` | текст подтверждения | «Отмена», «Завершить» |
| `task-change-scrim` | Исполнить задачу | `--w4` | виджет `ChangeTaskStatusModal` | см. паспорт |

## 9. Состояния (States)

### Loading
В прототипе не моделируется: демо-данные в памяти. У виджетов — блок загрузки по `data-state="loading"` (паспорта).

### Empty
Без выбранной строки правая панель скрыта.

### Error
В прототипе не моделируется. У виджетов — Alert с повтором по `data-state="error"` (паспорта).

### Disabled
Нет: права роли — просмотр; правка не воссоздаётся (Р6).

## 10. Тексты интерфейса (Texts)

| Место | Текст |
|---|---|
| Заголовок | Встречи |
| Вкладки | Мои встречи · Встречи моего деска |
| Кнопки | Новый протокол · Новая встреча |

## 11. Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — в паспортах виджетов и typedef демо-данных. Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../data/meetings.js` | `window.MOCK_MEETINGS` | `MeetingRsDto[]` | invented (10.10.2026) |
| `../data/tasks.js` | `window.MOCK_TASKS` | `TaskRsDto[]` | invented (10.10.2026) |
| `../data/clients.js` | `window.MOCK_CLIENTS` | `ClientRsDto[]` | invented (10.10.2026) |
| `../data/employees.js` | `window.MOCK_EMPLOYEES` | `EmployeeRsDto[]` | invented (10.10.2026) |
| `../data/store.js` | `window.IBPR` | — | хранилище: выборки, действия Р7, sessionStorage |
| `../data/nav-links.js` | `window.IBPR_NAV` | — | меню и карта страниц |
| `../data/registry-table.js` | `window.IBPR_TABLE` | — | общий рендер реестров (пары нет) |

### Permissions — роли, права, флаги

| Роль | Просмотр | Действия |
|---|---|---|
| Аналитик ДИД | да | Р7 над встречами |

## 12. Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| Страница | `pages/MeetingsProtocolsPage.html` | `src/pages/MeetingsProtocols/MeetingsProtocolsPage.tsx` |
| Реестр | `widgets/tables/MeetingsProtocolsList/` | по паспорту |
| Предпросмотр | `widgets/tiles/MeetingsProtocolsDetails/` | по паспорту |

Пути фронтенда — по соглашениям его модуля; окончательный путь выбирает разработка.

## 13. Доступность

- `<main>` для контентной области, `<nav aria-label="Хлебные крошки">`, `<nav aria-label="Главное меню">`;
- заголовок страницы — единственный `h1`;
- у всех кнопок-иконок есть `aria-label`;
- вкладки — `role="tablist"`, переключатели — `role="radiogroup"`.

## 14. Открытые вопросы и допущения (Open questions)

| № | Вопрос / допущение | Статус |
|---|---|---|
| 1 | Вкладки встреч — одна страница или страница на вкладку (В1 MS0014a) | допущение: одна страница |
| 2 | «Красная Запланирована» — смысл needsAttention (вопрос 5 MS0014) | вопрос |
| 3 | Меню и карта страниц — `data/nav-links.js`: один источник на концепт; пункт без страницы — клик гасится (Р5) | решено (MS0014a, С1) |

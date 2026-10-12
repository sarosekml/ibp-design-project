---
screen: AdminPage
kind: screen
title: Администрирование
file: apps/core/drafts/ibp-redesign-v1/pages/AdminPage.preview.html
module: core/drafts/ibp-redesign-v1
frontend: core/host-app pages/AdminPage
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.000"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tile, Link, Divider]
widgets: [tiles/LinkNavigationTile]
---

# Page: AdminPage — Администрирование

## 1. Назначение (Purpose)

Вход в справочники и настройки: группы с подписью-разделителем, в каждой — плитки со ссылками. Живая ссылка одна — «Статусы задач».

**Роль пользователя:** Аналитик ДИД
**Права:** просмотр; ссылки вне объёма — по клику ничего (Р5)

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** не решено (10.10.2026)
- **Адрес в прототипе:** `AdminPage.preview.html`
- **Пункт бокового меню** в состоянии `nav__item--selected`: «Администрирование».

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 | Главная | `HomePage.html` |
| 2 (текущий) | Администрирование | — |

## 3. Пары во фронтенде

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница | `pages/AdminPage.html` | core/host-app `pages/AdminPage` |
| Плитка со ссылками | `LinkNavigationTile` | core/host-app `widgets/LinkNavigationTile` |

## 4. Раскладка (Layout)

```
Page (Layout, nav--rail)
├── PageHeader — «Администрирование»
└── tile-group
    ├── Divider с подписью «Бизнес-справочники» · LinkNavigationTile «Справочники» (12)
    ├── Divider «Бизнес-данные» · LinkNavigationTile «Сотрудники» (6) · «Клиенты» (6)
    └── Divider «Настройки процессов» · LinkNavigationTile «Системные настройки» (12)
```

**Блоки контента** — 12 колонок; ряды и ширины — в разметке страницы, скрипт только наполняет виджеты:

| № | Блок | Компонент или виджет | Колонок из 12 | Содержимое |
|---|---|---|---|---|
| 1 | Справочники | `LinkNavigationTile` | 12 | группы: Риск-сегмент · Сотрудники · Задачи · География |
| 2 | Сотрудники · Клиенты | `LinkNavigationTile` ×2 | 6 + 6 |  |
| 3 | Системные настройки | `LinkNavigationTile` | 12 |  |

Вертикальный скролл: есть, скроллится контентная область, крошки залипают.

## 5. Компоненты (Components)

| Компонент | Откуда |
|---|---|
| Layout | ДС — `design-system/foundations/Layout/Layout.md` |
| NavPanel | ДС — `design-system/components/organisms/NavPanel/NavPanel.md` |
| Breadcrumbs | ДС — `design-system/components/molecules/Breadcrumbs/Breadcrumbs.md` |
| PageHeader | ДС — `design-system/components/organisms/PageHeader/PageHeader.md` |
| Tile | ДС — `design-system/components/organisms/Tile/Tile.md` |
| Link | ДС — `design-system/components/atoms/Link/Link.md` |
| Divider | ДС — `design-system/components/atoms/Divider/Divider.md` |
| `LinkNavigationTile` | виджет концепта — `../widgets/tiles/LinkNavigationTile/LinkNavigationTile.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 6. Таблицы (Tables)

Таблиц в разметке страницы нет: таблицы — виджеты, колонки — в их паспортах.

## 7. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| «Статусы задач» | `TaskStatesPage.preview.html` |
| Остальные ссылки | вид как у живых, клик гасится (Р5, ревью З1) |

## 8. Модальные окна (Modals)

Модальных окон нет.

## 9. Состояния (States)

### Loading
В прототипе не моделируется: демо-данные в памяти. У виджетов — блок загрузки по `data-state="loading"` (паспорта).

### Empty
Пустое состояние — у виджетов (паспорта).

### Error
В прототипе не моделируется. У виджетов — Alert с повтором по `data-state="error"` (паспорта).

### Disabled
Нет: права роли — просмотр; правка не воссоздаётся (Р6).

## 10. Тексты интерфейса (Texts)

| Место | Текст |
|---|---|
| Заголовок | Администрирование |
| Группы | Бизнес-справочники · Бизнес-данные · Настройки процессов |
| Плитки и ссылки | ТЗ MS0014 §4.11 |

## 11. Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — в паспортах виджетов и typedef демо-данных. Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../data/nav-links.js` | `window.IBPR_NAV` | — | меню и карта страниц |

### Permissions — роли, права, флаги

| Роль | Просмотр | Действия |
|---|---|---|
| Аналитик ДИД | да | нет |

## 12. Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| Страница | `pages/AdminPage.html` | `src/pages/AdminPage/AdminPage.tsx` |
| Плитка | `widgets/tiles/LinkNavigationTile/` | `src/widgets/LinkNavigationTile/LinkNavigationTile.tsx` |

Пути фронтенда — по соглашениям его модуля; окончательный путь выбирает разработка.

## 13. Доступность

- `<main>` для контентной области, `<nav aria-label="Хлебные крошки">`, `<nav aria-label="Главное меню">`;
- заголовок страницы — единственный `h1`;
- у всех кнопок-иконок есть `aria-label`;
- вкладки — `role="tablist"`, переключатели — `role="radiogroup"`.

## 14. Открытые вопросы и допущения (Open questions)

| № | Вопрос / допущение | Статус |
|---|---|---|
| 3 | Меню и карта страниц — `data/nav-links.js`: один источник на концепт; пункт без страницы — клик гасится (Р5) | решено (MS0014a, С1) |

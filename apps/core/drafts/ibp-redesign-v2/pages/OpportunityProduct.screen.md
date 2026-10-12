---
screen: OpportunityProduct
kind: screen
title: Продукт сделки
file: apps/core/drafts/ibp-redesign-v2/pages/OpportunityProduct.preview.html
module: core/drafts/ibp-redesign-v2
frontend: pretrade/opportunities-app pages/Opportunity/OpportunityProduct
route: не решено (10.10.2026)
source: ТЗ — docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md
version: "2.000"
created: "10.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tile, ReadOnlyField, Checkbox, Buttons, IconButton, Modal, SnackBar]
widgets: [tiles/V2ProductClientTiles]
---

# Page: OpportunityProduct — Продукт сделки

## 1. Назначение (Purpose)

Продукт сделки: информация по продукту, заёмщик и КНР; «Удалить» с подтверждением.

**Роль пользователя:** Аналитик ДИД
**Права:** просмотр; «Удалить» — подтверждение и удаление из сделки (Р7); карандаш — по клику ничего (Р6)

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** не решено (10.10.2026)
- **Адрес в прототипе:** `OpportunityProduct.preview.html?source=binding&deal=166092&product=P9001`
- **Пункт бокового меню** в состоянии `nav__item--selected`: пункт раздела источника сделки.

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 | Главная | `HomePage.html` |
| 2 | <Раздел>: <Вкладка> | реестр источника |
| 3 | Сделка <ID>.<Проект> | `Opportunity.preview.html?…` |
| 4 (текущий) | Продукт: <название> | — |

## 3. Пары во фронтенде

| Элемент | Прототип | Фронтенд |
|---|---|---|
| Страница | `pages/OpportunityProduct.html` | pretrade/opportunities-app `pages/Opportunity/OpportunityProduct` |
| Информация по продукту | Tile в разметке страницы | часть страницы |
| Заёмщик и КНР | `V2ProductClientTiles` | opportunityTiles/V2ProductClientTiles |

## 4. Раскладка (Layout)

```
Page (Layout, nav--rail)
├── PageHeader — название продукта · .phead__return «Вернуться в сделку» · «Удалить»
└── tile-row
    ├── Tile «Информация по продукту» (8) — tile__grid 3: 9 полей · SPV
    └── V2ProductClientTiles (4) — стопка «Заёмщик» · «КНР»
```

**Блоки контента** — 12 колонок; ряды и ширины — в разметке страницы, скрипт только наполняет виджеты:

| № | Блок | Компонент или виджет | Колонок из 12 | Содержимое |
|---|---|---|---|---|
| 1 | Информация по продукту | Tile | 8 | группа, продукт, объёмы, ВМ, EL, срок, доходы, SPV |
| 2 | Заёмщик · КНР | `widgets/tiles/V2ProductClientTiles` | 4 | tile-stack, КНР — если есть |

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
| Checkbox | ДС — `design-system/components/atoms/Checkbox/Checkbox.md` |
| Buttons | ДС — `design-system/components/atoms/Buttons/Buttons.md` |
| IconButton | ДС — `design-system/components/atoms/IconButton/IconButton.md` |
| Modal | ДС — `design-system/components/organisms/Modal/Modal.md` |
| SnackBar | ДС — `design-system/components/organisms/SnackBar/SnackBar.md` |
| `V2ProductClientTiles` | виджет концепта — `../widgets/tiles/V2ProductClientTiles/V2ProductClientTiles.md` |

Параметры виджета на странице — атрибуты метки `<ds-include>`: `class` (место в сетке), `id`, `state`, `mode`.

## 6. Таблицы (Tables)

Таблиц в разметке страницы нет: таблицы — виджеты, колонки — в их паспортах.

## 7. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| «Вернуться в сделку» | страница сделки |
| «Удалить» / корзина стороны | окно подтверждения → продукт удаляется из сделки, SnackBar, возврат на страницу сделки (Р7) |
| Карандаш | по клику ничего (Р6) |

## 8. Модальные окна (Modals)

| id | Заголовок | Ширина | Содержимое | Кнопки подвала |
|---|---|---|---|---|
| `del-product-scrim` | Удалить продукт? | `--w3` | текст подтверждения | «Отмена», «Удалить» (`btn--danger`) |

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
| Возврат | Вернуться в сделку |
| Действие | Удалить |
| Подтверждение | Продукт «<название>» будет удалён из сделки <ID>. Действие нельзя отменить. |
| SnackBar | Продукт удалён · Возврат на страницу сделки |

## 11. Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — в паспортах виджетов и typedef демо-данных. Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../data/opportunities.js` | `window.MOCK_OPPORTUNITIES` | `OpportunityRsDto[]` | invented (10.10.2026) |
| `../data/dictionaries.js` | `window.REGISTRY_CONFIGS`, `*_LABELS` | конфиги, подписи кодов | invented (10.10.2026) |
| `../data/store.js` | `window.IBPR` | — | хранилище: выборки, действия Р7, sessionStorage |
| `../data/nav-links.js` | `window.IBPR_NAV` | — | меню и карта страниц |

### Permissions — роли, права, флаги

| Роль | Просмотр | Действия |
|---|---|---|
| Аналитик ДИД | да | «Удалить» (Р7) |

## 12. Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| Страница | `pages/OpportunityProduct.html` | `src/pages/Opportunity/OpportunityProduct/OpportunityProduct.tsx` |
| Заёмщик и КНР | `widgets/tiles/V2ProductClientTiles/` | `src/widgets/tiles/opportunityTiles/V2ProductClientTiles/V2ProductClientTiles.tsx` |

Пути фронтенда — по соглашениям его модуля; окончательный путь выбирает разработка.

## 13. Доступность

- `<main>` для контентной области, `<nav aria-label="Хлебные крошки">`, `<nav aria-label="Главное меню">`;
- заголовок страницы — единственный `h1`;
- у всех кнопок-иконок есть `aria-label`;
- вкладки — `role="tablist"`, переключатели — `role="radiogroup"`.

## 14. Открытые вопросы и допущения (Open questions)

| № | Вопрос / допущение | Статус |
|---|---|---|
| 1 | Что удаляет корзина «Заёмщика» и «КНР» — сторону или продукт | допущение: продукт |
| 3 | Меню и карта страниц — `data/nav-links.js`: один источник на концепт; пункт без страницы — клик гасится (Р5) | решено (MS0014a, С1) |

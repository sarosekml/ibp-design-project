---
screen: index
kind: screen
title: Спецификации на разработку
file: apps/postrade/drafts/dev-specs/pages/index.html
module: postrade/drafts/dev-specs
frontend: new
route: не применимо — служебная страница проекта прототипов (12.10.2026)
source: задача RE0016, решения человека 12.10.2026
version: "1.000"
created: "12.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, PageHeader, Tab, Tile, EmptyState, Buttons, IconButton, Avatar]
widgets: []
---

# Page: index — Спецификации на разработку

## 1. Назначение (Purpose)

Витрина спецификаций на разработку раздела Post (задача RE0016): вкладка на каждую спеку,
выбранная спека — ровно тот автономный html, что уходит разработчикам, и выгрузка папкой
`<Spec>/` (`<Spec>.md` + `<Spec>.html`). В продукт страница не переносится.

**Роль пользователя:** дизайнер, который передаёт сценарий разработке.

## 2. Адрес и навигация (Route)

- Хаб → «Концепты» → «Post — Спецификации на разработку».
- Пункт меню «Спецификации на разработку» — выбран; строка пользователя ведёт на хаб.
- Выбранная спека — в якоре адреса (`#RsbuInterestAdjustments`).

| Уровень крошек | Текст | Ссылка |
|---|---|---|
| 1 (текущий) | Спецификации на разработку | — |

## 3. Раскладка (Layout)

```
Page (Layout, nav--rail, screen--app)
├── PageHeader — заголовок, подзаголовок со сведениями о спеке, три кнопки выгрузки
├── Tab (horizontal) — спеки
└── Tile headless — iframe со спекой на всю свободную высоту
```

## 4. Компоненты (Components)

| Компонент | Откуда | Где на экране | Варианты и ключевые параметры |
|---|---|---|---|
| Layout, NavPanel | ДС | каркас | `nav--rail`, `screen--app` |
| Breadcrumbs | ДС | крошки | одна текущая |
| PageHeader | ДС | шапка | `phead__meta` — модуль, версия, дата, число снимков, дата съёмки |
| Buttons | ДС | шапка | «Скачать .md», «Скачать .html» — `btn--outline btn--m`; «Скачать папку (.zip)» — `btn--accent btn--m` |
| Tab | ДС | под шапкой | `tabs--horiz`, `tab--m`, `data-tabs` |
| Tile | ДС | контент | `tile--headless`, внутри iframe `sandbox="allow-scripts"` |
| EmptyState | ДС | вместо вкладок и спеки | `es--l`, `empty-folder` — когда спек нет |

## 5. Таблицы (Tables)

Нет.

## 6. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| Вкладка спеки | спека показывается в iframe, обновляются подзаголовок и якорь адреса |
| «Скачать .md» / «Скачать .html» | файл `<Spec>.md` / `<Spec>.html` |
| «Скачать папку (.zip)» | `<Spec>.zip` с папкой `<Spec>/` и двумя файлами (zip без сжатия, собирается в странице) |

## 7. Модальные окна (Modals)

Нет. Снимок в натуральную величину открывает сама спека внутри iframe.

## 8. Состояния (States)

| Состояние | Что показывается |
|---|---|
| Спеки есть | вкладки, спека, кнопки выгрузки |
| Спек нет | EmptyState «Спецификаций пока нет» |

## 9. Тексты интерфейса (Texts)

Как в разделах 4 и 8.

## 10. Данные (Data dependencies)

`../data/dev-specs.js` — индекс, дописывает теги генератов `../data/<Spec>.dev-spec.js`;
каждый кладёт в `window.DEV_SPECS` запись `{ id, title, module, version, date, designer, snaps,
viewport, taken, md, html }`. Генераты собирает `node .agents/tools/dev-spec.mjs` из
`refs/<Spec>/<Spec>.dev-spec.md`, руками не правятся.

## 11. Соответствие файлов (Implementation mapping)

| Файл | Роль |
|---|---|
| `pages/index.html` | страница |
| `refs/<Spec>/<Spec>.dev-spec.md` | исходники спек |
| `data/*.dev-spec.js`, `data/dev-specs.js` | генераты |

## 12. Доступность

Вкладки — `role="tablist"` / `role="tab"`, iframe с `title` спеки, кнопки выгрузки подписаны текстом.

## 13. Открытые вопросы и допущения (Open questions)

1. iframe без собственной рамки — `border: 0` в стиле экрана; рамку даёт Tile.
2. Пункт меню один — у служебной страницы нет разделов продукта; роль в строке пользователя —
   «Дизайнер» (допущение).

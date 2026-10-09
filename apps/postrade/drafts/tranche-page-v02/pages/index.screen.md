---
screen: index
kind: screen
title: Главная концепта «Страница транша v02»
file: apps/postrade/drafts/tranche-page-v02/pages/index.html
module: postrade/drafts/tranche-page-v02
frontend: new
route: не решено (07.10.2026)
source: копия главной deals-app (MainPage), 07.10.2026
version: "1.000"
created: "07.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, NavTile, Illustrations, Modal, Badge, Avatar, IconButton]
widgets: []
---

# Page: index — Главная концепта

## 1. Назначение (Purpose)

Главная концепта (ссылка «Главная» в крошках; из хаба концепт открывается сразу на странице транша): плитки разделов роли «Финансист ДИД» из каталога
`ibp-home.js`. Плитка «Текущий портфель ДИД» ведёт на страницу транша
(`Tranche.html`), остальные — заглушки `#`.

**Роль пользователя:** финансист ДИД

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** не решено (07.10.2026).
- Пункт меню «Главная» — выбран.

## 3. Раскладка (Layout)

Группы плиток — сетка 12 колонок, по 3 колонки на группу (`col-3 colw-6`), поверх
фоновой иллюстрации. Меню и плитки строит экранный скрипт из `ibp-home.js`.

## 4. Компоненты (Components)

Layout, NavPanel, Breadcrumbs, NavTile, Illustrations, Modal (смена роли).

## 5. Таблицы (Tables)

Нет.

## 6. Поведение (Behavior)

| Триггер | Результат |
|---|---|
| Плитка «Текущий портфель ДИД» | открывается `Tranche.html` |
| Кнопка выхода в меню | окно «Сменить роль» |

## 7. Модальные окна (Modals)

«Сменить роль» — `.modal--w3`, список ролей.

## 8. Состояния (States)

Одно состояние.

## 9. Тексты интерфейса (Texts)

Из каталога `ibp-home.js`.

## 10. Данные (Data dependencies)

Каталог ролей и плиток — `design-system/patterns/HomeRoles/ibp-home.js`.

## 11. Соответствие файлов (Implementation mapping)

`pages/index.html`.

## 12. Доступность

Как у главной `deals-app`.

## 13. Открытые вопросы и допущения (Open questions)

1. Плитка «Текущий портфель ДИД» временно ведёт сразу на страницу транша, пока в
   концепте нет реестра и страницы сделки.

---
screen: index
kind: screen
title: Главная концепта «Досрочные проценты»
file: apps/postrade/drafts/early-interest/pages/index.html
module: postrade/drafts/early-interest
frontend: new
route: не решено (12.10.2026)
source: копия главной концепта tranche-page-v02 (она — копия главной deals-app), 12.10.2026
version: "1.000"
created: "12.10.2026"
design_system: IBP DS
components: [Layout, NavPanel, Breadcrumbs, NavTile, Illustrations, Modal, Badge, Avatar, IconButton]
widgets: []
---

# Page: index — Главная концепта

## 1. Назначение (Purpose)

Стартовая страница концепта (с хаба концепт открывается на ней): плитки разделов роли
«Финансист ДИД» из каталога `ibp-home.js`. Плитка и пункт меню «Текущий портфель ДИД» ведут на
страницу транша (`Tranche.preview.html`), остальные — заглушки `#`.

**Роль пользователя:** финансист ДИД

## 2. Адрес и навигация (Route)

- **Адрес в продукте:** не решено (12.10.2026).
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
| Плитка или пункт меню «Текущий портфель ДИД» | открывается `Tranche.preview.html` |
| Кнопка выхода в меню | окно «Сменить роль» |

## 7. Модальные окна (Modals)

«Сменить роль» — `.modal--w3`, список ролей.

## 8. Состояния (States)

### Loading

Нет: каталог — статичный скрипт.

### Empty

Нет.

### Error

Нет.

### Disabled

Нет.

## 9. Тексты интерфейса (Texts)

Из каталога `ibp-home.js`.

## 10. Данные (Data dependencies)

Каталог ролей и плиток — `ibp-home.js` дизайн-системы (подключается загрузчиком, `data-ds`).

## 11. Соответствие файлов (Implementation mapping)

| Файл | Роль |
|---|---|
| `pages/index.html` | главная концепта |

## 12. Доступность

Как у главной `deals-app`.

## 13. Открытые вопросы и допущения (Open questions)

1. Плитка «Текущий портфель ДИД» ведёт сразу на страницу транша: реестра и страницы сделки в
   концепте нет.

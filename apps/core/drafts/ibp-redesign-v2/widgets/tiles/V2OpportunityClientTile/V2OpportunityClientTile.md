---
name: Клиент сделки
type: tile
category: Сделка
purpose: Ключевые реквизиты клиента сделки или лида со входом на страницу клиента
version: 2.000
updated: 10.10.2026
rulesVersion: 2.000
owner: "не решено (10.10.2026)"
designer: "агент (ibp-redesign-v2)"
frontend: pretrade/opportunities-app widgets/tiles/opportunityTiles/ClientTile/OpportunityClientTile; pretrade/offersources-app widgets/tiles/PotentialTiles/ClientTile
ds: [Tile, ReadOnlyField, Badge, Chip, Divider, Buttons, IconButton, Alert, Skeleton]
uses: []
usedOn: ["pages/Opportunity.html — ряд 1, 4 колонки", "pages/PotentialPage.html — ряд 1, 8 колонок"]
opens: [ClientInfoPage — стрелка в шапке]
artifactOf:
opensFrom: []
dependsOn: [data/store.js (IBPR.employee), data/nav-links.js (IBPR_NAV.href)]
variants: [opportunity — сделка, potential — лид]
modifiers: []
requirements: [docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md]
knowledge: []
---

# V2OpportunityClientTile

## Описание (Purpose)

Тайл «Клиент» по ТЗ MS0014 §4.3 (сделка) и §4.6 (лид). У сделки — клиент с кружком статуса, ИНН, отрасль, макроотрасль, подотрасль, сегмент. У лида — чипы «Компания роста ДИД» и «Топ клиент», клиент, холдинг, ИНН, макроотрасль, сегмент, клиентский менеджер и «Документы по клиенту». Во фронтенде это OpportunityClientTile и ClientTile; в концепте — один виджет с вариантом (MS0014a, правило 6).

## Раскладка (Layout)

```
Tile
├── шапка: «Клиент» · карандаш · стрелка → ClientInfoPage
└── тело
    ├── чипы клиента (лид)
    ├── tile__grid: 2 колонки (сделка) / 3 колонки (лид) — ReadOnlyField
    └── Divider · «Документы по клиенту» (лид)
```

## Компоненты (Components)

| Компонент | Откуда | Варианты и ключевые параметры |
|---|---|---|
| Tile | ДС | обычный |
| ReadOnlyField | ДС | в `.tile__grid` |
| Badge | ДС | dot success — статус клиента |
| Chip | ДС | XS с ведущей иконкой |
| Divider | ДС | горизонтальный |
| Buttons | ДС | outline S |

## Поля (Fields)

| Поле | Смысл | Тип, единица | Источник | Обязательное |
|---|---|---|---|---|
| Клиент | краткое наименование и статус | строка, Badge dot | data/clients.js | нет |
| Холдинг (лид) |  | строка | data/clients.js | нет |
| ИНН |  | строка | data/clients.js | нет |
| Отрасль, Подотрасль (сделка) |  | строка | data/clients.js | нет |
| Макроотрасль |  | строка | data/clients.js | нет |
| Сегмент |  | строка | data/clients.js | нет |
| Клиентский менеджер (лид) | главный КМ | ФИО | data/clients.js (gcmId), data/employees.js | нет |

Порядок строк — порядок отображения. Имя поля — как в описании типа демо-данных.
Незаполненное поле — прочерк на своём месте, с места не уходит.

## Права (Permissions)

| Роль | Просмотр | Редактирование |
|---|---|---|
| Аналитик ДИД | да | не воссоздаётся в части 1 (Р6) |

## Состояния (States)

| Состояние | Есть в продукте | Вид |
|---|---|---|
| Загрузка (Loading) | да | каркас тайла и скелетоны строк (`.lc-opp-client__loading`) |
| Данные есть | да | базовый вид |
| Заполнено частично | да | незаполненное поле — прочерк на своём месте |
| Данных нет (Empty) | да | строка причины без иллюстрации (`.lc-opp-client__empty`) |
| Ошибка (Error) | да | Alert внутри компонента с повтором (`.lc-opp-client__error`) |
| Обновление | да | прежние значения видны; локальной индикации в прототипе нет |
| Редактирование доступно | нет | в части 1 правка не воссоздаётся (Р6): точки входа видны, по клику ничего |
| Только просмотр (Disabled) | да | `data-mode="view"`: действия правки не рисуются |
| Нет права видеть | не решено (10.10.2026) | компонент не ставится экраном |

### Свои состояния

Своих состояний нет.

## Обязательность заполнения (Required)

- Компонент обязателен к заполнению целиком: нет — это просмотр.
- Обязательные поля внутри: не решено (10.10.2026).
- Что показывает, когда обязательное не заполнено: прочерк.
- Что отдаёт наружу: ничего.

## Переполнение (Overflow)

| Случай | Правило |
|---|---|
| Длинный текст в поле | перенос по словам; заголовки и подписи — усечение с тултипом компонента ДС |
| Много строк или записей | не применимо |
| Узкая ширина | сетка полей в одну колонку по ширине самого компонента (container query) |
| Полная ширина | сетка полей по паспорту, лишнего воздуха нет |

## Поведение (Behavior)

- Стрелка → ClientInfoPage клиента.
- Карандаш и «Документы по клиенту» — по клику ничего (Р6).

### Связанные артефакты

Связанных артефактов нет.

## Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — раздел «Поля». Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| data/clients.js | MOCK_CLIENTS | ClientRsDto | invented (10.10.2026) |
| data/employees.js | MOCK_EMPLOYEES | EmployeeRsDto | invented (10.10.2026) |

## Для разработчиков (Implementation)

### Параметры метки (Props)

| Атрибут метки | На корне компонента | Значения | Смысл |
|---|---|---|---|
| `class` | `class` (слияние) | `col-N` / `colw-N` | место в сетке страницы |
| `state` | `data-state` | `loading` · `data` · `partial` · `empty` · `error` · `updating` | состояние данных |
| `mode` | `data-mode` | `edit` · `view` | режим прав |

### Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| тайл сделки | widgets/tiles/V2OpportunityClientTile/ (data-variant="opportunity") | pretrade/opportunities-app widgets/tiles/opportunityTiles/ClientTile/OpportunityClientTile |
| тайл лида | тот же виджет (data-variant="potential") | pretrade/offersources-app widgets/tiles/PotentialTiles/ClientTile |

## Осознанные отклонения (Deviations)

| Правило | Как сделано | Почему |
|---|---|---|
| во фронтенде два виджета | один виджет с вариантом | MS0014a, правило 6 |

## Открытые вопросы (Open questions)

Открытых вопросов нет.

---
name: Карточка продукта
type: tile
category: Сделка
purpose: Карточка продукта сделки: название, группа, объём, ВМ и вход на страницу продукта
version: 1.002
updated: 12.10.2026
rulesVersion: 2.000
owner: "не решено (10.10.2026)"
designer: "агент (ibp-redesign-v1)"
frontend: pretrade/opportunities-app widgets/tiles/opportunityTiles/ProductsTile/OpportunityDetailProducts/OpportunityProductTile
ds: [Tile, ReadOnlyField, Chip, IconButton]
uses: []
usedOn: [widgets/tiles/ProductsTile — карточки ряда, pages/OpportunityProduct.html — не ставится]
opens: [OpportunityProduct — стрелка]
artifactOf:
opensFrom: []
dependsOn: [data/nav-links.js (IBPR_NAV.href), data/dictionaries.js (DICT_FMT)]
variants: []
modifiers: []
requirements: [docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md]
knowledge: []
---

# OpportunityProductTile

## Описание (Purpose)

Карточка продукта по ТЗ MS0014 §4.3: название с усечением, чип группы, «Объем по продукту, млн ед.», «ВМ, %», стрелка на страницу продукта. Ряд карточек строит ProductsTile разметкой `html()` этого виджета.

## Раскладка (Layout)

```
Tile Card
├── шапка: название · чип группы · стрелка
└── tile__grid 2 колонки: Объем по продукту · ВМ
```

## Компоненты (Components)

| Компонент | Откуда | Варианты и ключевые параметры |
|---|---|---|
| Tile | ДС | `tile--card` |
| ReadOnlyField | ДС | в `.tile__grid` 1fr 1fr |
| Chip | ДС | XS — группа |

## Поля (Fields)

| Поле | Смысл | Тип, единица | Источник | Обязательное |
|---|---|---|---|---|
| Название |  | строка | data/opportunities.js (products) | нет |
| Группа |  | чип | data/dictionaries.js (PRODUCT_GROUP_LABELS) | нет |
| Объем по продукту, млн ед. |  | число | data/opportunities.js | нет |
| ВМ, % |  | процент | data/opportunities.js | нет |

Порядок строк — порядок отображения. Имя поля — как в описании типа демо-данных.
Незаполненное поле — прочерк на своём месте, с места не уходит.

## Права (Permissions)

| Роль | Просмотр | Редактирование |
|---|---|---|
| Аналитик ДИД | да | не воссоздаётся в части 1 (Р6) |

## Состояния (States)

| Состояние | Есть в продукте | Вид |
|---|---|---|
| Загрузка (Loading) | да (продукт) | в прототипе не моделируется |
| Данные есть | да | базовый вид |
| Заполнено частично | да | незаполненное поле — прочерк на своём месте |
| Данных нет (Empty) | да | текст пустого состояния компонента |
| Ошибка (Error) | да (продукт) | в прототипе не моделируется |
| Обновление | да | прежние значения видны; локальной индикации в прототипе нет |
| Редактирование доступно | нет | в части 1 правка не воссоздаётся (Р6): точки входа видны, по клику ничего |
| Только просмотр (Disabled) | нет | режим не различается: действия видны, по клику ничего (Р6) |
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

- Стрелка → OpportunityProduct (`?source=&deal=&product=`).

### Связанные артефакты

Связанных артефактов нет.

## Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — раздел «Поля». Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| data/opportunities.js | MOCK_OPPORTUNITIES | OpportunityRsDto | invented (10.10.2026) |

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
| карточка | widgets/tiles/OpportunityProductTile/ | opportunityTiles/ProductsTile/OpportunityDetailProducts/OpportunityProductTile |

## Осознанные отклонения (Deviations)

Отклонений нет.

## Открытые вопросы (Open questions)

Открытых вопросов нет.

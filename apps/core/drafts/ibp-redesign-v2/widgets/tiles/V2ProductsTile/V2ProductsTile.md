---
name: Продукты сделки
type: tile
category: Сделка
purpose: Ряд карточек продуктов сделки или лида со входом на страницу продукта
version: 1.000
updated: 10.10.2026
rulesVersion: 2.000
owner: "не решено (10.10.2026)"
designer: "агент (ibp-redesign-v2)"
frontend: pretrade/opportunities-app widgets/tiles/opportunityTiles/ProductsTile; pretrade/offersources-app widgets/tiles/PotentialTiles/PotentialProductsTile
ds: [Tile, Buttons, Alert, Skeleton]
uses: [V2OpportunityProductTile]
usedOn: ["pages/Opportunity.html — ряд 4, 12 колонок", "pages/PotentialPage.html — ряд 2, 12 колонок"]
opens: [OpportunityProduct — стрелка карточки]
artifactOf:
opensFrom: []
dependsOn: [widgets/tiles/V2OpportunityProductTile (html), data/nav-links.js (IBPR_NAV.href)]
variants: ["opportunity — «Продукты сделки», «Добавить» в шапке", "potential — «Продукт», «Добавить» в теле"]
modifiers: []
requirements: [docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md]
knowledge: []
---

# V2ProductsTile

## Описание (Purpose)

Тайл с карточками продуктов по ТЗ MS0014 §4.3 и §4.6. Карточка — виджет V2OpportunityProductTile, её разметку отдаёт его `html()`: число карточек меняется по данным, сборщик не раскрывает метки в цикле. Пустой тайл — «В сделке пока нет продуктов» внутри тела (ревью MS0014, С9). У лида заголовок «Продукт» и «Добавить» (accent S) в теле.

## Раскладка (Layout)

```
Tile
├── шапка: «Продукты сделки» · «Добавить» (outline XS; у лида нет)
└── тело
    ├── сетка 12 колонок: V2OpportunityProductTile × N (по 4)
    ├── «В сделке пока нет продуктов» (пусто)
    └── «Добавить» (accent S, лид)
```

## Компоненты (Components)

| Компонент | Откуда | Варианты и ключевые параметры |
|---|---|---|
| Tile | ДС | обычный |
| Buttons | ДС | outline XS в шапке; accent S в теле у лида |
| V2OpportunityProductTile | концепт | карточка Tile Card |

## Поля (Fields)

| Поле | Смысл | Тип, единица | Источник | Обязательное |
|---|---|---|---|---|
| Продукты | список продуктов | OpportunityProductDto[] | data/opportunities.js, data/potentials.js | нет |

Порядок строк — порядок отображения. Имя поля — как в описании типа демо-данных.
Незаполненное поле — прочерк на своём месте, с места не уходит.

## Права (Permissions)

| Роль | Просмотр | Редактирование |
|---|---|---|
| Аналитик ДИД | да | не воссоздаётся в части 1 (Р6) |

## Состояния (States)

| Состояние | Есть в продукте | Вид |
|---|---|---|
| Загрузка (Loading) | да | каркас тайла и скелетоны строк (`.lc-products__loading`) |
| Данные есть | да | базовый вид |
| Заполнено частично | да | незаполненное поле — прочерк на своём месте |
| Данных нет (Empty) | да | «В сделке пока нет продуктов» внутри `.tile__body` (С9) |
| Ошибка (Error) | да | Alert внутри компонента с повтором (`.lc-products__error`) |
| Обновление | да | прежние значения видны; локальной индикации в прототипе нет |
| Редактирование доступно | нет | в части 1 правка не воссоздаётся (Р6): точки входа видны, по клику ничего |
| Только просмотр (Disabled) | да | `data-mode="view"`: действия правки не рисуются |
| Нет права видеть | не решено (10.10.2026) | компонент не ставится экраном |

### Свои состояния

| Состояние | Когда | Вид |
|---|---|---|
| Пусто | продуктов нет | «В сделке пока нет продуктов» в теле тайла |

## Обязательность заполнения (Required)

- Компонент обязателен к заполнению целиком: нет — это просмотр.
- Обязательные поля внутри: не решено (10.10.2026).
- Что показывает, когда обязательное не заполнено: прочерк.
- Что отдаёт наружу: ничего.

## Переполнение (Overflow)

| Случай | Правило |
|---|---|
| Длинный текст в поле | перенос по словам; заголовки и подписи — усечение с тултипом компонента ДС |
| Много строк или записей | карточки идут рядами по три, тайл растёт по высоте |
| Узкая ширина | карточки по две (`colw-6`) — container query по ширине тайла |
| Полная ширина | сетка полей по паспорту, лишнего воздуха нет |

## Поведение (Behavior)

- Стрелка карточки → OpportunityProduct.
- «Добавить» — по клику ничего (Р6).

### Связанные артефакты

Связанных артефактов нет.

## Данные (Data dependencies)

### API — что нужно от бэкенда

Поля — раздел «Поля». Имена методов API выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| data/opportunities.js | MOCK_OPPORTUNITIES | OpportunityRsDto | invented (10.10.2026) |
| data/potentials.js | MOCK_POTENTIALS | PotentialRsDto | invented (10.10.2026) |

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
| тайл сделки | widgets/tiles/V2ProductsTile/ (data-variant="opportunity") | pretrade/opportunities-app widgets/tiles/opportunityTiles/ProductsTile |
| тайл лида | тот же виджет (data-variant="potential") | pretrade/offersources-app widgets/tiles/PotentialTiles/PotentialProductsTile |
| карточка | widgets/tiles/V2OpportunityProductTile/ | V2ProductsTile/OpportunityDetailProducts/V2OpportunityProductTile; у лида PotentialDetailedProductTile |

## Осознанные отклонения (Deviations)

| Правило | Как сделано | Почему |
|---|---|---|
| во фронтенде два виджета (ProductsTile и PotentialProductsTile) | один виджет с вариантом | MS0014a, правило 6 |
| алерты ProductAlerts фронтенда | не воссозданы | на снимках их нет |

## Открытые вопросы (Open questions)

Открытых вопросов нет.

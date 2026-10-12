---
name: Встречи и протоколы
type: tile
category: Сделка
purpose: Счётчики встреч сделки или лида и вход в планирование встречи
version: 2.000
updated: 10.10.2026
rulesVersion: 2.000
owner: "не решено (10.10.2026)"
designer: "агент (ibp-redesign-v2)"
frontend: pretrade/opportunities-app widgets/tiles/opportunityTiles/MeetingsProtocolsTile; pretrade/offersources-app widgets/tiles/PotentialTiles/MeetingsProtocolsTile
ds: [Tile, Buttons, IconButton, Alert, Skeleton]
uses: []
usedOn: [pages/Opportunity.html — ряд 6, pages/PotentialPage.html — ряд 3]
opens: []
artifactOf:
opensFrom: []
dependsOn: []
variants: ["opportunity — «Встречи и протоколы», «Добавить» в шапке", "potential — «Встречи», стрелка в шапке, «Добавить» в теле"]
modifiers: []
requirements: [docs/tasks/MS0014-ibp-redesign-context-pages.md, docs/tasks/MS0014a-ibp-redesign-frontend-names.md]
knowledge: []
---

# V2MeetingsProtocolsTile

## Описание (Purpose)

Тайл встреч по ТЗ MS0014 §4.3 (сделка) и §4.6 (лид). Счётчики «Запланированные · Завершенные · Требуют внимания»; при нулевых — подсказка. У лида заголовок «Встречи», «Добавить» в теле, как в системе (ревью MS0014, З6).

## Раскладка (Layout)

```
Tile
├── шапка: заголовок · «Добавить» (сделка) или стрелка (лид)
└── тело: подсказка или счётчики · «Добавить» (лид)
```

## Компоненты (Components)

| Компонент | Откуда | Варианты и ключевые параметры |
|---|---|---|
| Tile | ДС | обычный |
| Buttons | ДС | outline XS в шапке; outline S в теле у лида |
| IconButton | ДС | стрелка у лида |

## Поля (Fields)

| Поле | Смысл | Тип, единица | Источник | Обязательное |
|---|---|---|---|---|
| Запланированные |  | число | data/opportunities.js (meetings.planned) | нет |
| Завершенные |  | число | data/opportunities.js (meetings.completed) | нет |
| Требуют внимания |  | число, тон warning | data/opportunities.js (meetings.attention) | нет |

Порядок строк — порядок отображения. Имя поля — как в описании типа демо-данных.
Незаполненное поле — прочерк на своём месте, с места не уходит.

## Права (Permissions)

| Роль | Просмотр | Редактирование |
|---|---|---|
| Аналитик ДИД | да | не воссоздаётся в части 1 (Р6) |

## Состояния (States)

| Состояние | Есть в продукте | Вид |
|---|---|---|
| Загрузка (Loading) | да | каркас тайла и скелетоны строк (`.lc-meetings-prot__loading`) |
| Данные есть | да | базовый вид |
| Заполнено частично | да | незаполненное поле — прочерк на своём месте |
| Данных нет (Empty) | да | подсказка вместо счётчиков |
| Ошибка (Error) | да | Alert внутри компонента с повтором (`.lc-meetings-prot__error`) |
| Обновление | да | прежние значения видны; локальной индикации в прототипе нет |
| Редактирование доступно | нет | в части 1 правка не воссоздаётся (Р6): точки входа видны, по клику ничего |
| Только просмотр (Disabled) | да | `data-mode="view"`: действия правки не рисуются |
| Нет права видеть | не решено (10.10.2026) | компонент не ставится экраном |

### Свои состояния

| Состояние | Когда | Вид |
|---|---|---|
| Пусто | все счётчики нулевые | подсказка: у сделки «Планируйте встречи…», у лида «Нет протоколов встреч» |

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

- «Добавить» и стрелка — по клику ничего (Р6).

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
| тайл сделки | widgets/tiles/V2MeetingsProtocolsTile/ (data-variant="opportunity") | pretrade/opportunities-app widgets/tiles/opportunityTiles/MeetingsProtocolsTile |
| тайл лида | тот же виджет (data-variant="potential") | pretrade/offersources-app widgets/tiles/PotentialTiles/MeetingsProtocolsTile |

## Осознанные отклонения (Deviations)

Отклонений нет.

## Открытые вопросы (Open questions)

Открытых вопросов нет.

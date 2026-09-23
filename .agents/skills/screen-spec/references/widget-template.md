---
widget: DealTeamTile
type: tile
file: apps/postrade/deals-app/widgets/tiles/DealTeamTile/DealTeamTile.html
module: postrade/deals-app
frontend: postrade/deals-app/widgets/tiles/DealTeamTile
name: Команда сделки
version: 1.000
updated: "24.09.2026"
rulesVersion: 1.003
owner: не решено (24.09.2026)
designer: не решено (24.09.2026)
category: компоненты сделки
purpose: Ответственные по сделке — деск, директор, менеджеры, сотрудник ЦУП, кредитный инспектор
ds: [Tile, Avatar, EmptyState, IconButton]
usedOn: [apps/postrade/deals-app/pages/Deal.html — «Общая информация», первый ряд, 6 колонок]
variants: []
modifiers: []
dependsOn: []
requirements: [ТЗ страницы сделки 19.09.2026]
knowledge: []
---

# Widget: DealTeamTile — Команда сделки

<!-- Шапка: widget — имя папки и файлов виджета; type — группа widgets/
     (tile | table | modal | context-menu | popover); module — <раздел>/<модуль>
     владельца; frontend — пара во фронтенде (README модуля, раздел «Имена
     фронтенда», или дерево фронтенда), нет пары — new. Остальные поля —
     паспорт локального компонента ДС (design-system/pages/patterns/LocalComponents.html):
     name, version, updated, rulesVersion, owner, designer, category, purpose,
     ds, usedOn, variants, modifiers, dependsOn, requirements, knowledge.
     Неизвестное — «не решено (ДД.ММ.ГГГГ)», не догадкой. Этот комментарий в
     паспорт не переносится. -->

## Описание (Purpose)

Развёрнутое описание: место виджета в процессе, откуда по смыслу берутся
значения, что с ними делает пользователь, оговорки. Где виджет стоит на
странице и сколько колонок занимает — решает страница (метка `<ds-include>`),
не виджет.

## Раскладка (Layout)

```
Tile (заголовок «Команда сделки», действие шапки «Изменить»)
└── список сотрудников
    └── строка ×N: Avatar + ФИО + роль в сделке
```

## Компоненты (Components)

| Компонент | Откуда | Варианты и ключевые параметры |
|---|---|---|
| Tile | ДС — `design-system/specs/Tile.md` | шапка с IconButton `edit` |
| Avatar | ДС — `design-system/specs/Avatar.md` | `av--s`, инициалы |
| EmptyState | ДС — `design-system/specs/EmptyState.md` | иллюстрация `empty-folder` |

## Параметры метки (Props)

Что страница задаёт виджету атрибутами метки `<ds-include>`:

| Атрибут метки | На корне виджета | Значения | Смысл |
|---|---|---|---|
| `class` | `class` (слияние) | `col-6 colw-12` | место в сетке страницы |
| `state` | `data-state` | `data` · `empty` · `loading` | состояние данных |
| `mode` | `data-mode` | `view` · `edit` | режим |

## Поля

| Поле | Смысл | Тип, единица | Источник | Обязательное |
|---|---|---|---|---|
| `employeeFullName` | ФИО сотрудника | строка | invented — `DealTeamMemberRsDto` | да |
| `roleCode` | роль в сделке | перечисление, подпись — `DEAL_TEAM_ROLE_LABELS` | invented | да |

Имя поля — как в typedef демо-данных. Порядок строк — порядок отображения.
Незаполненные поля показываются прочерком и с места не уходят.

## Права (Permissions)

| Роль | Просмотр | Редактирование |
|---|---|---|
| Финансист ДИД | да | не решено (24.09.2026) |

## Состояния (States)

| Состояние | Есть в продукте | Вид |
|---|---|---|
| Загрузка (Loading) |  |  |
| Данные есть |  |  |
| Заполнено частично |  |  |
| Данных нет (Empty) | да | EmptyState `empty-folder` + «Данные ещё не заведены» |
| Ошибка (Error) |  |  |
| Обновление |  |  |
| Редактирование доступно |  |  |
| Только просмотр | да | действия шапки не рисуются |
| Правка временно запрещена (Disabled) |  |  |
| Нет права видеть |  |  |

Пустая ячейка «Вид» — непроработанное состояние, а не отсутствие состояния.

### Свои состояния

Состояния, которые есть только у этого виджета: когда возникают и что показывают.

## Обязательность заполнения

- Виджет обязателен к заполнению целиком: да / нет.
- Что показывает, когда обязательное не заполнено:
- Что отдаёт наружу (признак для страницы или формы):

## Переполнение

| Случай | Правило |
|---|---|
| Длинный текст в поле |  |
| Много строк или записей |  |
| Узкая ширина |  |

## Связанные артефакты (Behavior)

| Триггер | Тип | Что внутри | Что меняется после | Кто ещё вызывает |
|---|---|---|---|---|
| «Изменить» в шапке | модальное окно `DealTeamModal` | форма состава команды | обновляется список | — |

## Данные (Data dependencies)

### API — что нужно от бэкенда
Поля — раздел «Поля». Имена методов и хуков API не придумываются: их выбирает
разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../../../data/deals-store.js` | `window.DealsStore` | — | помощник: сделка по id |
| `../../../data/deal-teams.js` | `window.MOCK_DEAL_TEAMS` | `DealTeamMemberRsDto[]` | invented — заменить, когда придёт DTO |

## Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| Виджет | `widgets/tiles/DealTeamTile/DealTeamTile.html` | `src/widgets/tiles/DealTeamTile/DealTeamTile.tsx` |
| Стили раскладки | `widgets/tiles/DealTeamTile/DealTeamTile.css` (если есть) | по соглашениям модуля |
| Окно «Изменить» | `widgets/modals/DealTeamModal/DealTeamModal.html` | `src/features/modals/DealTeamModal/DealTeamModal.tsx` |

## Открытые вопросы (Open questions)

Что не решено и от кого нужен ответ.

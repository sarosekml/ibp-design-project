---
widget: DealFinancialInstrumentCreateModal
type: modal
file: apps/postrade/deals-app/widgets/modals/DealFinancialInstrumentCreateModal/DealFinancialInstrumentCreateModal.html
module: postrade/deals-app
frontend: postrade/deals-app/features/modals/DealFinancialInstrumentCreateModal
name: Окно «Создание финансового инструмента»
version: 1.000
updated: "02.10.2026"
rulesVersion: 1.006
owner: не решено (02.10.2026)
designer: Роман Эсэф
category: Сделка
artifactOf: Финансовые инструменты (../../tiles/FinInstrumentsTile/FinInstrumentsTile.md)
opensFrom: [Тайл «Финансовые инструменты» — Button «+ Фин. инструмент» в шапке, «+ Финансовый инструмент» под списком и «Заполнить вручную» в пустом тайле (правка)]
purpose: Создать карточку финансового инструмента сделки — выбрать тип ФИ и тип отчётности
ds: [Modal, InputAutocomplete, DropdownList, Tooltip, IconButton, Buttons]
usedOn: [Страница сделки — таб «Финансовые данные», из тайла «Финансовые инструменты»]
variants: []
modifiers: []
dependsOn: [Финансовые инструменты (../../tiles/FinInstrumentsTile/FinInstrumentsTile.md) — окно добавляет карточку тайла через FinInstrumentsStore]
requirements: [макет дизайнера «Создание финансового инструмента (кнопка Заполнить вручную)» 02.10.2026]
knowledge: []
---

# Окно «Создание финансового инструмента» (DealFinancialInstrumentCreateModal)

## Описание (Purpose)

Артефакт тайла «Финансовые инструменты»: первый шаг жизни карточки ФИ. В окне выбирают тип
ФИ (Кредит, Акции, Доп. доходность, РЕПО, Дебиторская задолженность) и тип отчётности (МСФО
и РСБУ, МСФО, РСБУ). «Сохранить» создаёт карточку в конце списка тайла в состоянии «не
заполнено»: номер — следующий в сделке, наименование — по образцу карточек сделки (допущение
агента 02.10.2026). Остальные параметры правят окном изменения, а баланс, валюту и суммы
карточка получает из узлов дерева продуктов, прикреплённых к ней.

Окно только правки: в просмотре его кнопок в тайле нет.

В скрипте окна живёт общий слой форм окон ФИ — `PostFinInstrumentForm` (список из
InputAutocomplete + DropdownList и ошибка поля тултипом); им же собрано окно изменения ФИ,
поэтому страница подключает этот скрипт раньше.

## Раскладка (Layout)

```
Modal modal--w4 (595px — ширина макета)
├── шапка: «Создание финансового инструмента» + крестик
├── тело: два поля стопкой через 16
│   ├── «Тип инструмента» — список
│   └── «Тип отчетности» — список
└── подвал справа: Button accent M «Сохранить»
```

## Компоненты (Components)

| Компонент | Откуда | Варианты и ключевые параметры |
|---|---|---|
| Modal | ДС — `design-system/components/organisms/Modal/Modal.md` | `modal--w4` |
| InputAutocomplete + DropdownList | ДС — `design-system/components/molecules/Inputs/InputAutocomplete/InputAutocomplete.md`, `design-system/components/molecules/DropdownList/DropdownList.md` | `inp--m inp--fullwidth`, шеврон, крестик очистки от рантайма; ошибка — `inp--error` |
| Tooltip | ДС — `design-system/components/molecules/Tooltip/Tooltip.md` | тип `error` у поля с ошибкой, при фокусе (правило InputText) |
| IconButton | ДС — `design-system/components/atoms/IconButton/IconButton.md` | крестик шапки `ibtn--neutral ibtn--l` |
| Buttons | ДС — `design-system/components/atoms/Buttons/Buttons.md` | «Сохранить» `btn--accent btn--m` |

## Параметры метки (Props)

Метка `<ds-include>` атрибутов не несёт: окно открывает событие тайла.

## Поля

| Поле | Смысл | Тип | Источник | Обязательное |
|---|---|---|---|---|
| `typeCode` | тип ФИ | список: `FIN_INSTRUMENT_TYPE_LABELS` | `FinInstrumentsStore.typeOptions()` | да |
| `reportingType` | тип отчётности | список: `FIN_INSTRUMENT_REPORTING_LABELS` | `FinInstrumentsStore.reportingOptions()` | да |

Значение списка — только из опций: набранный текст, не совпавший ни с одной, при уходе с поля
откатывается.

## Права (Permissions)

| Роль | Просмотр | Редактирование |
|---|---|---|
| Финансист ДИД | окно не открывается | не решено (19.09.2026) — как у тайла |

## Состояния (States)

| Состояние | Есть в продукте | Вид |
|---|---|---|
| Загрузка (Loading) | нет | справочники локальные |
| Данные есть | да | выбранные значения в полях |
| Заполнено частично | да | одно поле выбрано |
| Данных нет (Empty) | да | окно открывается пустым — как на макете |
| Ошибка (Error) | да, у поля | пустое обязательное поле при «Сохранить» — рамка ошибки и тултип при фокусе: «Выберите тип инструмента», «Выберите тип отчетности»; окно остаётся открытым |
| Обновление | не решено (02.10.2026) | в прототипе сохранение мгновенное |
| Редактирование доступно | да | единственный режим |
| Только просмотр | нет | окно не открывается |
| Правка временно запрещена (Disabled) | нет | — |
| Нет права видеть | не решено (19.09.2026) | решает страница |

## Обязательность заполнения

- Оба поля обязательны: без них «Сохранить» не создаёт карточку.
- Что отдаёт наружу: новая карточка в `FinInstrumentsStore`, сохранённая через `PostApi`.

## Переполнение

| Случай | Правило |
|---|---|
| Длинная подпись опции | усечение в поле, список — по правилам DropdownList |
| Узкая ширина | ширина фиксирована шкалой Modal (`modal--w4`) |

## Связанные артефакты (Behavior)

| Триггер | Тип | Что внутри | Что меняется после | Кто ещё вызывает |
|---|---|---|---|---|
| «+ Фин. инструмент», «+ Финансовый инструмент», «Заполнить вручную» (событие `fiaction`, action `CREATE`) | это окно | два списка, «Сохранить» | новая карточка «не заполнено» в тайле, сохраняется; крестик, Esc и подложка — без изменений | — |

### Скрипт окна

`DealFinancialInstrumentCreateModal.js`:

| Глобал / функция | Что делает |
|---|---|
| `PostModalFinInstrumentCreate.open()` | открыть пустое окно |
| `PostModalFinInstrumentCreate.use(input)` | заполнить без открытия — для витрины |
| `PostFinInstrumentForm.select(scrim, id, opts)` | список: значение только из опций, крестик снимает значение |
| `PostFinInstrumentForm.fieldError(input)` | ошибка поля: `inp--error` и тултип при фокусе |

«Сохранить» — `FinInstrumentsStore.create({ typeCode, reportingType })` и `commit`.

## Данные (Data dependencies)

### API — что нужно от бэкенда
Справочники типов ФИ и типов отчётности; создание карточки ФИ сделки. Имена методов API не
придумываются: их выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../../../data/mock-fin-instruments.js` | `window.FIN_INSTRUMENT_TYPE_LABELS`, `FIN_INSTRUMENT_REPORTING_LABELS` | справочники | invented (30.09.2026, 02.10.2026) |
| `../../../data/fin-instruments-store.js` | `window.FinInstrumentsStore` | `typeOptions`, `reportingOptions`, `create`, `commit` | модель представления, не DTO |

Витрина рисует окно сценарием `apps/local-components/postrade/deals-app/DealFinancialInstrumentCreateModal.demo.js`.

## Соответствие файлов (Implementation mapping)

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| Окно | `widgets/modals/DealFinancialInstrumentCreateModal/DealFinancialInstrumentCreateModal.html` | `src/features/modals/DealFinancialInstrumentCreateModal/` |
| Поведение | `DealFinancialInstrumentCreateModal.js` | в компоненте окна |
| Общий слой полей окон ФИ | `PostFinInstrumentForm` в `DealFinancialInstrumentCreateModal.js` | общие поля формы модуля |

## Открытые вопросы (Open questions)

1. **Имя новой карточки** — по образцу карточек сделки, допущение агента (02.10.2026); правило
   — не решено (вопрос 10 паспорта тайла).
2. **Открывать ли после создания окно изменения** — не решено (02.10.2026): пока окно просто
   закрывается, карточка появляется в списке.
3. **Тип ФИ «Доп. доходность»** — создаётся, но к нему пока ничего не прикрепляется (вопрос 9
   паспорта тайла).

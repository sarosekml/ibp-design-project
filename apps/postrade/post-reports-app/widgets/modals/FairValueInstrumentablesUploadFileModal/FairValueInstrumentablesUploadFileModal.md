---
name: Окно «Данные по инструменту»
type: modal
category: Отчёты
purpose: Показать содержимое загружаемого XML-файла инструмента и принять загрузку
version: 1.000
updated: "08.10.2026"
rulesVersion: 2.000
owner: не решено (08.10.2026)
designer: Роман Эсэф
frontend: postrade/post-reports-app/features/modals/FairValueInstrumentablesUploadFileModal
ds: [Modal, Alert, Buttons, IconButton]
usedOn: [apps/postrade/post-reports-app/pages/FairValueCalculation.html — конец body, открывается из окна ФИ]
opensFrom: [Окно ФИ — «Загрузить xml файл» после подтверждения]
dependsOn: [FairValueUserMetricsModal]
variants: []
modifiers: []
requirements: [задача docs/tasks/RE0012-fv-calculation.md, макет «Загрузка xml файла»]
knowledge: []
---

# Widget: FairValueInstrumentablesUploadFileModal — Окно «Данные по инструменту»

## Описание (Purpose)

Окно открывается поверх окна ФИ после подтверждения загрузки. Системный выбор файла в прототипе имитируется:
кнопка «Выбрать файл» подставляет образец XML. Дальше окно показывает текст файла и Alert «Файл проверен»;
«Сохранить» применяет загрузку.

## Раскладка (Layout)

```
Modal w6 (data-state: choose | preview)
├── шапка: «Данные по инструменту» + IconButton L «Закрыть»
├── Alert success flush (modal__alert) — «Файл проверен», только в preview
├── тело: choose — подсказка + Button outline M «Выбрать файл»; preview — текст XML
└── подвал справа: Button accent M «Сохранить» (выключена в choose)
```

## Компоненты (Components)

| Компонент | Откуда | Варианты и ключевые параметры |
|---|---|---|
| Modal | ДС — `design-system/components/organisms/Modal/Modal.md` | `modal--w6`, `.modal__alert`, вложенный слой |
| Alert | ДС — `design-system/components/molecules/Alert/Alert.md` | `alert--success alert--flush` |
| Buttons | ДС — `design-system/components/atoms/Buttons/Buttons.md` | outline M «Выбрать файл», accent M «Сохранить» |
| IconButton | ДС — `design-system/components/atoms/IconButton/IconButton.md` | neutral L «Закрыть» |

## Поля (Fields)

| Поле | Смысл | Тип, единица | Источник | Обязательное |
|---|---|---|---|---|
| текст XML | содержимое файла инструмента | текст | образец `window.MOCK_FV_INSTRUMENT_XML` | — |

## Права (Permissions)

| Роль | Просмотр | Редактирование |
|---|---|---|
| Финансист и другие | да | да — не решено (08.10.2026) |
| Риск-менеджер | да | да — не решено (08.10.2026) |

## Состояния (States)

| Состояние | Есть в продукте | Вид |
|---|---|---|
| Загрузка (Loading) | не решено (08.10.2026) | — |
| Файл не выбран | да (в прототипе) | подсказка и «Выбрать файл», «Сохранить» выключена |
| Данные есть | да | Alert «Файл проверен», текст XML, «Сохранить» включена |
| Ошибка (Error) | да | окно закрывается, Alert «Не удалось загрузить файл» показывает окно ФИ |
| Нет права видеть | не решено (08.10.2026) | решает экран |

## Обязательность заполнения (Required)

- Окно обязательно к заполнению целиком: да — без выбранного файла «Сохранить» выключена.
- Что отдаёт наружу: факт сохранения (`onSaved`) или неудачи (`onFail`).

## Переполнение (Overflow)

| Случай | Правило |
|---|---|
| Длинный текст | Строки XML переносятся |
| Много строк или записей | Тело окна скроллится |
| Узкая ширина | Ширина окна фиксирована шагом ДС |

## Поведение (Behavior)

### Правила

1. Окно открывается в состоянии «Файл не выбран»; подсказка называет инструмент.
2. «Выбрать файл» подставляет образец XML и переключает окно в предпросмотр. Демо-сценарий неудачи (`?upload=fail` на странице): окно закрывается, в окне ФИ Alert «Не удалось загрузить файл».
3. «Сохранить» закрывает окно; файл инструмента получает состояние «Загружен».
4. Крестик и Esc ничего не применяют.

### Связанные артефакты

| Триггер | Тип | Что внутри | Что меняется после | Кто ещё вызывает |
|---|---|---|---|---|
| «Подтвердить» в окне подтверждения загрузки (общее окно страницы) | это окно | образец XML | в таблице инструментов «Файл xml» — «Загружен» | — |

## Данные (Data dependencies)

### API — что нужно от бэкенда
Проверка и загрузка XML-файла инструмента; ответ с текстом файла и результатом проверки. Имена методов выбирает разработка.

### Mock — демо-данные прототипа

| Файл | Глобальная переменная | Тип | Источник имён |
|---|---|---|---|
| `../../../data/fv-calculation-items.js` | `window.MOCK_FV_INSTRUMENT_XML` | строка | invented (08.10.2026) |

## Для разработчиков (Implementation)

### Соответствие файлов

| Элемент | Прототип | Фронтенд (предложение) |
|---|---|---|
| Окно | `widgets/modals/FairValueInstrumentablesUploadFileModal/FairValueInstrumentablesUploadFileModal.html` | `src/features/modals/FairValueInstrumentablesUploadFileModal/FairValueInstrumentablesUploadFileModal.tsx` |
| Раскладка | `…/FairValueInstrumentablesUploadFileModal.css` | стили компонента |
| Поведение | `…/FairValueInstrumentablesUploadFileModal.js` (`PostFairValueInstrumentablesUploadFileModal.bind(scrim, opts)`) | там же |

## Осознанные отклонения (Deviations)

Системный диалог выбора файла заменён имитацией: тестовых файлов нет (решение человека 08.10.2026).

## Открытые вопросы (Open questions)

1. **Какие проверки проходит файл** и тексты ошибок проверки — в макетах нет, не решено (08.10.2026).
2. **Подсказка в состоянии «Файл не выбран»** — текст наш, в макете системный диалог; не решено (08.10.2026). **Решено 08.10.2026:** подходит; в продукте здесь откроется системный выбор файла, в прототипе он не нужен.

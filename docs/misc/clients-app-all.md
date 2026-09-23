# clients-app — объединённые дизайн-спецификации

Все `.md`-файлы из директории `core/clients-app`, объединённые в один файл.
Каждый документ отделён заголовком с названием и путём относительно корня приложения.

---

# File: ControlClientModal.md — `features/ControlClientModal/ControlClientModal.md`

# Feature: ControlClientModal

## Purpose

Модальное окно для создания и редактирования клиентов. В зависимости от переданного `name` (`CreateClient` или `UpdateClient`) выполняет соответствующий API-вызов через RTK Query. После успешного сохранения обновляет таблицу клиентов и закрывает модальное окно.

## Layout

```
Modal (width=75vw, height=90vh)
├── Title
├── ClientForm (formId={name})
│   └── [Форма редактирования данных клиента]
└── Actions
    └── SubmitButton (formId={name})
```

## Components

| Component | Import source | Key props |
|---|---|---|
| `Modal` | `clients-app/shared` | `closeModal`, `name`, `title`, `width`, `height`, `actions` |
| `SubmitButton` | `@sber-ibp/uikit` | `formId`, `hasLoader`, `disabled` |
| `ClientForm` | `clients-app/widgets` | `formId`, `onSubmit`, `selectedClient` |

## States

### Loading
Кнопка отправки отображает лоадер (`hasLoader`) и блокируется (`disabled`) во время выполнения мутации создания или обновления клиента (`isCreateSubmitting` / `isUpdateSubmitting`).
### Empty
Нет данных
### Error
Проверка ответа через `isFailed()` — если вызов завершился ошибкой, выполнение прерывается (модальное окно не закрывается, таблица не обновляется).
### Disabled
Кнопка `SubmitButton` блокируется на время отправки формы (`isCreateSubmitting || isUpdateSubmitting`).

## Data dependencies

### API hooks
- `ClientsApi.useCreateClientMutation()` — создание клиента (для `name === 'CreateClient'`)
- `ClientsApi.useUpdateClientMutation()` — обновление клиента по `partyId` (для `name === 'UpdateClient'`)

### Redux store
Нет прямого обращения к Redux store. Используется `useTemplatedTableController(clientsTableCode)` для получения функции рефетча таблицы клиентов и `useDelayedRefetchData` для отложенного обновления.

### Permissions
Нет данных

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/features/ControlClientModal/ControlClientModal.tsx` |
| Form-to-DTO converter | `src/features/ControlClientModal/ControlClientModal.convertor.ts` |

---

# File: FinancialChartFilters.md — `features/FinancialsChartFilters/FinancialChartFilters.md`

# Feature: FinancialChartFilters

## Purpose

Панель фильтров финансового графика. Позволяет пользователю выбрать период (12, 24 или 36 месяцев) и финансовую метрику (выручка, EBITDA, долг и т.д.). Передаёт выбранные значения родительскому компоненту через колбэки.

## Layout

```
<>
├── Grid item (period selector)
│   └── InputAutocomplete (period)
└── Grid item (metric selector)
    └── InputAutocomplete (metric)
```

## Components

| Component | Import source | Key props |
|---|---|---|
| `InputAutocomplete` | `@sber-ibp/uikit` | `value`, `onChange`, `getOptionLabel`, `options`, `size="sm"`, `viewFormat="text"`, `viewType="edit"`, `hasClearIndicator={false}` |
| `Grid` | `@sber-ibp/uikit` | `item`, `sx` |

## States

### Loading
Нет данных
### Empty
Нет данных
### Error
Нет данных
### Disabled
Явная обработка состояний не реализована

## Data dependencies

### API hooks
Нет — компонент получает данные через props.

### Redux store
Нет прямого обращения к Redux store.

### Permissions
Нет данных

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/features/FinancialsChartFilters/FinancialChartFilters.tsx` |
| Types | `src/features/FinancialsChartFilters/FinancialChartFilter.types.ts` |
| Constants (period options, postfix map) | `src/features/FinancialsChartFilters/FinancialsChartFilters.const.ts` |
| Styles | `src/features/FinancialsChartFilters/FinancialChartFilters.styles.ts` |

---

# File: FinancialChartInfo.md — `features/FinancialsChartInfo/FinancialChartInfo.md`

# Feature: FinancialChartInfo

## Purpose

Отображает итоговую финансовую информацию по выбранной метрике: текущее значение суммы (в млн руб.) и годовой прирост в процентах по сравнению с аналогичным периодом прошлого года (гг). Прирост показывается со стрелкой вверх (положительный) или вниз (отрицательный).

## Layout

```
<>
├── Grid item (amount block) — отображается если amount !== null
│   ├── Text (amount value, normalized)
│   └── Text (measure: "млн руб.")
└── Grid item (increment block) — отображается если increment !== null
    ├── Icon (ArrowUp / ArrowDown)
    └── Text (increment percentage + "% гг")
```

## Components

| Component | Import source | Key props |
|---|---|---|
| `Text` | `@sber-ibp/uikit` | `sx` (amount, measure, increment styling) |
| `Icon` | `@sber-ibp/uikit` | `name` (`ArrowUp` или `ArrowDown`) |
| `Grid` | `@sber-ibp/uikit` | `item`, `gap`, `spacing`, `sx` |

## States

### Loading
Нет данных
### Empty
Если значение `amount` равно null — блок суммы не рендерится. Если `amount` равен 0 — отображается «—». Если `increment` равен null (нет данных за год назад) — блок прироста не рендерится.
### Error
Нет данных
### Disabled
Явная обработка состояний не реализована

## Data dependencies

### API hooks
Нет — данные передаются через props (`data: FinancialChartItemType[]`).

### Redux store
Нет прямого обращения к Redux store.

### Permissions
Нет данных

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/features/FinancialsChartInfo/FinancialChartInfo.tsx` |
| Styles | `src/features/FinancialsChartInfo/FinancialChartInfo.styles.ts` |

---

# File: FinancialsChartLegend.md — `features/FinancialsChartLegend/FinancialsChartLegend.md`

# Feature: FinancialsChartLegend

## Purpose

Компонент легенды финансового графика. Отображает список элементов легенды — каждый элемент состоит из цветной линии заданной толщины и текстового названия. Используется для обозначения рядов данных на графике.

## Layout

```
legends.map()
└── Grid item (per legend entry)
    ├── SxBox (colored line indicator)
    └── Text (legend title)
```

## Components

| Component | Import source | Key props |
|---|---|---|
| `Grid` | `@sber-ibp/uikit` | `item`, `columnGap`, `sx`, `key` |
| `SxBox` | `@sber-ibp/uikit` | `sx` (line style: color + thickness) |
| `Text` | `@sber-ibp/uikit` | children (legend title) |

## States

### Loading
Нет данных
### Empty
Нет данных — если массив `legends` пуст, компонент не рендерит ничего.
### Error
Нет данных
### Disabled
Явная обработка состояний не реализована

## Data dependencies

### API hooks
Нет — данные передаются через props (`legends: FinancialsLegendType[]`).

### Redux store
Нет прямого обращения к Redux store.

### Permissions
Нет данных

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/features/FinancialsChartLegend/FinancialsChartLegend.tsx` |
| Types | `src/features/FinancialsChartLegend/FinancialsChartLegend.types.ts` |
| Styles | `src/features/FinancialsChartLegend/FinancialsChartLegend.styles.ts` |

---

# File: GetEcmTicketModal.md — `features/GetEcmTicketModal/GetEcmTicketModal.md`

# Feature: GetEcmTicketModal

## Purpose

Модальное окно для просмотра документов клиента из ECM-системы. При открытии запрашивает ticket ID через переданный колбэк `fetchEcmTicket`, затем открывает iframe с URL ECM-сервиса для отображения документа. Используется для доступа к клиентским документам прямо из карточки клиента.

## Layout

```
Modal (width=1200, height=auto, title="Client documents")
├── Grid container
│   └── Grid item (sizes=12)
│       ├── Loader (если isLoading)
│       └── iframe (если не isLoading, src=iframeUrl)
└── Actions
    └── Button ("Done" — закрывает модалку)
```

## Components

| Component | Import source | Key props |
|---|---|---|
| `Modal` | `clients-app/shared` | `name`, `closeModal`, `width`, `height`, `title`, `errors`, `actions`, `actionsJustify` |
| `Loader` | `@sber-ibp/uikit` | `dataTestId` |
| `Grid` | `@sber-ibp/uikit` | `container`, `item`, `spacing`, `pb`, `sizes` |
| `Button` | `@sber-ibp/uikit` | `dataTestId`, `onClick` |
| `iframe` | native HTML | `src`, `style` (height=64vh, width=100%) |

## States

### Loading
Во время запроса ticket ID отображается `Loader` с `dataTestId="EcmTicketLoader"`. Переменная `isLoading` управляется хуком `useEcmTicketUrl`.
### Empty
Нет данных
### Error
Ошибки запроса обрабатываются через `useErrorList` в хуке `useEcmTicketUrl` — ошибки добавляются через `addError()` и передаются в `Modal` через пропс `errors`.
### Disabled
Явная обработка состояний не реализована

## Data dependencies

### API hooks
Нет прямых RTK Query вызовов в самом компоненте. Хук `useEcmTicketUrl` вызывает `fetchEcmTicket` (передаётся через props как колбэк, возвращающий `Promise<EcmId>`) для получения ticket ID.

### Redux store
Нет прямого обращения к Redux store. Хук `useEcmTicketUrl` использует `useErrorList` из `@sber-ibp/uikit` для управления списком ошибок.

### Permissions
Нет данных

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/features/GetEcmTicketModal/GetEcmTicketModal.tsx` |
| Types | `src/features/GetEcmTicketModal/GetEcmTicketModal.types.tsx` |
| Hook (useEcmTicketUrl) | `src/features/GetEcmTicketModal/useEcmTicketUrl.tsx` |

---

# File: GoalSegmentFilter.md — `features/GoalSegmentFilter/GoalSegmentFilter.md`

# Feature: GoalSegmentFilter

## Purpose

Фильтр переключения между типами целей (бизнес-цели / личные цели). Отображает сегментированный контрол с доступными вариантами, отфильтрованными по списку `availableSegments`. Используется для переключения между представлениями стратегического диалога.

## Layout

```
Grid (dataTestId="GoalSegmentFilter")
└── SegmentControl
    ├── segmentsText (доступные названия сегментов)
    └── selectedIndex (текущий выбранный сегмент)
```

## Components

| Component | Import source | Key props |
|---|---|---|
| `SegmentControl` | `@sber-ibp/uikit` | `segmentsText`, `disabled`, `selectedIndex`, `onIndexChange`, `size="md"` |
| `Grid` | `@sber-ibp/uikit` | `dataTestId`, `sx` |

## States

### Loading
Нет данных
### Empty
Если `selectedIndex` меньше 0 (выбранный сегмент не входит в доступные), `selectedIndex` передаётся как `undefined` — ни один сегмент не подсвечен.
### Error
Нет данных
### Disabled
Сегментированный контрол блокируется через пропс `disabled={isDisabled}`, получаемый из props.

## Data dependencies

### API hooks
Нет — компонент получает все данные через props.

### Redux store
Нет прямого обращения к Redux store.

### Permissions
Нет данных

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/features/GoalSegmentFilter/GoalSegmentFilter.tsx` |
| Types | `src/features/GoalSegmentFilter/GoalSegmentFilter.types.ts` |
| Constants (segment values, segment text) | `src/features/GoalSegmentFilter/GoalSegmentFilter.const.ts` |
| Styles | `src/features/GoalSegmentFilter/GoalSegmentFilter.styles.ts` |

---

# File: StratDialogueBadge.md — `features/StratDialogueCard/StratDialogueBadge/StratDialogueBadge.md`

# Feature: StratDialogueBadge

## Purpose

Бейдж-маркер для типа цели в карточке стратегического диалога. Отображает цветной маркер с иконкой и текстом для одного из четырёх типов: «Стратегическая цель», «Цифровая трансформация», «Личная», «Бизнес». Используется внутри `StratDialogueCard` для визуальной классификации цели.

## Layout

```
DictionaryBadge
├── startIcon (Icon: Target | DigitalTransformCube | Zap | CurrentDepo)
├── name (badge label text)
└── colorThemeSx (color styling per type)
```

## Components

| Component | Import source | Key props |
|---|---|---|
| `DictionaryBadge` | `@sber-ibp/uikit` | `code`, `component`, `name`, `size="sm"`, `type="read"`, `variant="filled"`, `colorThemeSx`, `startIcon` |
| `Icon` | `@sber-ibp/uikit` | `name`, `size="sm"` |

## States

### Loading
Нет данных
### Empty
Нет данных
### Error
Выбрасывает `Error('Type is not supported')` при передаче неизвестного типа бейджа.
### Disabled
Явная обработка состояний не реализована

## Data dependencies

### API hooks
Нет — статический презентационный компонент.

### Redux store
Нет прямого обращения к Redux store.

### Permissions
Нет данных

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/features/StratDialogueCard/StratDialogueBadge/StratDialogueBadge.tsx` |
| Types | `src/features/StratDialogueCard/StratDialogueBadge/StratDialogueBadge.types.ts` |
| Styles | `src/features/StratDialogueCard/StratDialogueBadge/StratDialogueBadge.styles.ts` |

---

# File: StratDialogueCard.md — `features/StratDialogueCard/StratDialogueCard.md`

# Feature: StratDialogueCard

## Purpose

Карточка цели стратегического диалога. Отображает информацию о цели: бейджи типа цели (бизнес/личная, стратегическая, цифровая трансформация), даты начала и завершения, описание, метрику, значение метрики и комментарий. Для личных целей показывает список целей группы, для бизнес-целей — текущую цель. Внизу карточки отображается информация об ответственном РНП-пользователе.

## Layout

```
Grid (dataTestId="StratDialogueCard", cardSx)
└── content.map(goal) — для каждой цели:
    ├── Grid (headerSx)
    │   ├── Grid (badgesSx)
    │   │   ├── StratDialogueBadge (business | personal)
    │   │   ├── StratDialogueBadge (strategic) — если goal.strategic
    │   │   └── StratDialogueBadge (digitalTransformation) — если goal.digitalTransformation
    │   └── Grid (datesSx)
    │       ├── Icon (Calendar)
    │       └── Text (startDate - dueDate, formatted dd.MM.yyyy)
    ├── Text (H4StrongSmb, titleSx) — goal.description
    └── Grid container (spacing=2)
        ├── InputText (read, "Description") — sizes=12
        ├── InputText (read, "Metric") — sizes=6
        ├── InputText (read, "Value") — sizes=6
        └── InputText (read, "Comment") — sizes=12
    └── Footer:
        ├── Skeleton (если isLoading) — width=490, height=70
        └── StratDialogueUser (если rnpClient загружен)
```

## Components

| Component | Import source | Key props |
|---|---|---|
| `StratDialogueBadge` | `./StratDialogueBadge` | `type` (`business`, `personal`, `strategic`, `digitalTransformation`) |
| `StratDialogueUser` | `./StratDialogueUser` | `type` (GoalSegment), `rnp` (RnpRsDto) |
| `InputText` | `@sber-ibp/uikit` | `viewType="read"`, `label`, `value`, `dataTestId` |
| `Text` | `@sber-ibp/uikit` | `type` (`BodyXSReg`, `H4StrongSmb`), `sx` |
| `Icon` | `@sber-ibp/uikit` | `name="Calendar"`, `color="#B8D6D3"`, `size="sm"` |
| `Skeleton` | `@sber-ibp/uikit` | `width`, `height` |
| `Grid` | `@sber-ibp/uikit` | `dataTestId`, `sx`, `container`, `item`, `spacing`, `sizes` |

## States

### Loading
Во время загрузки данных РНП (`isLoading` от `RnpApi.useGetRnpQuery`) отображается `Skeleton` (width=490, height=70) в нижней части карточки.
### Empty
Если `rnpClient` не получен и загрузка не идёт — нижний блок не рендерится. Пустые значения полей (`description`, `metric`, `comment`) заменяются символом тире (`dashSymbol`). Значение метрики форматируется через `formatMetricValue` — при отсутствии выводится тире. Даты при отсутствии заменяются на "Не задано".
### Error
Нет данных — ошибки RTK Query не обрабатываются явно в компоненте.
### Disabled
Явная обработка состояний не реализована — поля отображаются в режиме только для чтения (`viewType="read"`).

## Data dependencies

### API hooks
- `RnpApi.useGetRnpQuery(goal.rnpObjectId ?? skipToken)` — получение данных РНП-пользователя по `rnpObjectId`. Запрос пропускается (`skipToken`), если `rnpObjectId` не задан.

### Redux store
Нет прямого обращения к Redux store.

### Permissions
Нет данных

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/features/StratDialogueCard/StratDialogueCard.tsx` |
| Types | `src/features/StratDialogueCard/StratDialogueCard.types.ts` |
| Styles | `src/features/StratDialogueCard/StratDialogueCard.styles.ts` |

---

# File: StratDialogueUser.md — `features/StratDialogueCard/StratDialogueUser/StratDialogueUser.md`

# Feature: StratDialogueUser

## Purpose

Отображение информации об ответственном РНП-пользователе в карточке стратегического диалога. Для личных целей (`GoalType1`) показывается аватар с полным именем; для остальных типов целей — крупное текстовое имя без аватара.

## Layout

```
if type === 'GoalType1':
  SxBox (goalType1Sx)
  ├── Avatar (circular, md)
  └── Text (BodySReg) — fullName

else:
  SxBox (goalDefaultSx)
  └── Text (BodyMStrongSmb) — fullName
```

## Components

| Component | Import source | Key props |
|---|---|---|
| `Avatar` | `@sber-ibp/uikit` | `sx`, `name` (fullName), `size="md"`, `variant="circular"` |
| `Text` | `@sber-ibp/uikit` | `type` (`BodySReg` или `BodyMStrongSmb`) |
| `SxBox` | `@sber-ibp/uikit` | `sx` (goalType1Sx или goalDefaultSx) |

## States

### Loading
Нет данных
### Empty
Если `rnp.fullName` отсутствует — отображается пустая строка (`emptyString`).
### Error
Нет данных
### Disabled
Явная обработка состояний не реализована

## Data dependencies

### API hooks
Нет — данные РНП передаются через props (`rnp: RnpRsDto`).

### Redux store
Нет прямого обращения к Redux store.

### Permissions
Нет данных

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/features/StratDialogueCard/StratDialogueUser/StratDialogueUser.tsx` |
| Styles | `src/features/StratDialogueCard/StratDialogueUser/StratDialogueUser.styles.ts` |

---

# File: ClientInfoPage.md — `pages/ClientInfo/ClientInfoPage.md`

# Page: ClientInfoPage

## Purpose

Главная страница детальной информации о клиенте. Отображает полную карточку клиента: отраслевую информацию, реквизиты, документы, команду клиентских менеджеров, данные РНП, а также AI-справку (GIGA). Позволяет управлять статусом «Мой клиент» (добавить/удалить из списка).

## Route

- Path: `my-clients/:objectId` (определяется через `routeDataMap['my-clients/:objectId'].pagePath`)
- Entry: `ClientInfoPage` (lazy export)

## Layout

```
Page
├── ClientInfoPageHeader        — заголовок с breadcrumb и управлением "Мой клиент"
└── ClientInfoGrid              — сетка информационных плиток
    ├── IndustryInfoTile          — отраслевая информация
    ├── RequisitesInfoTile        — реквизиты клиента
    ├── DocumentsInfoTile         — документы (условно по флагу)
    ├── TeamInfoTile (Main manager) — главный менеджер с аватаром
    ├── TeamInfoTile (Client team)  — команда клиента (список менеджеров)
    ├── ClientsRnpCacheTile       — данные РНП
    └── GigaInfoTile              — AI-справка GIGA
```

## Components

| Component | Import | Props |
|---|---|---|
| `ClientInfoPageHeader` | `clients-app/entities` | `addMyClient`, `deleteMyClient`, `isMyClient`, `root="General"`, `objectId`, `locationPathname` |
| `ClientInfoGrid` | local `./ClientInfo.grid` | `industryInfoTile`, `requisitesInfoTile`, `documentsInfoTile`, `mainClientManagerTile`, `clientTeamTile`, `clientRnpCacheTile`, `gigaInfoTile` — слоты для плиток |
| `IndustryInfoTile` | `clients-app/widgets` | `ucpClientData` |
| `RequisitesInfoTile` | `clients-app/widgets` | `ucpClientData` |
| `DocumentsInfoTile` | `clients-app/widgets/Tiles/DocumentsInfoTile` | `clientDocuments` |
| `TeamInfoTile` | `clients-app/widgets` | `title` (children — badges или текст) |
| `InfoBadge` | `clients-app/entities` | `avatar`, `mainText`, `secondaryText`, `postMainText` |
| `ClientsRnpCacheTile` | `clients-app/widgets` | `rnpData` |
| `GigaInfoTile` | `clients-app/widgets` | `clientReference`, `isLoading` |
| `Avatar` | `@sber-ibp/uikit` | props из `stringAvatar()` |
| `Text` | `@sber-ibp/uikit` | `dataTestId`, `color` |

## States

### Loading
Для GigaInfoTile передаётся `isLoading` от запроса `ClientReferenceApi.useGetClientAiGatewayQuery`. Остальные плитки получают данные без явного отображения loading-состояния на уровне страницы.

### Empty
Когда данные о менеджере отсутствуют, рендерится текст `"No data"` с цветом `TextInactive` в плитках Main manager и Client team.

### Error
Явная обработка ошибок на уровне страницы не реализована. Ошибки API обрабатываются в дочерних виджетах.

### Disabled
Плитка документов (`DocumentsInfoTile`) рендерится только при включённом флаге `ENABLE_CLIENT_DOCUMENT`. Запрос AI-справки пропускается при флаге `DISABLE_CLIENT_REFERENCE`.

## Data dependencies

### API hooks
- `ClientsApi.useGetClientByObjectIdQuery(objectId)` — получение базовых данных клиента по `objectId`
- `ClientsApi.useGetClientByPartyIdQuery(partyId, { skip: !partyId })` — получение UCP-данных клиента по `partyId`
- `RnpApi.useLazySearchRnpCacheQuery()` — ленивый поиск данных РНП (триггерится в `useEffect` при изменении `objectId`)
- `ClientReferenceApi.useGetClientAiGatewayQuery(...)` — получение AI-справки (пропускается при отсутствии `partyId`, `clientData`, `timeout` или флаге `DISABLE_CLIENT_REFERENCE`)
- `ClientsApi.useGetClientDocumentsQuery(objectId)` — получение списка документов клиента

### Redux store
Нет прямого использования `useSelector`/`useDispatch`. Данные получаются через RTK Query hooks из `ClientsApi`, `RnpApi`, `ClientReferenceApi`.

### Permissions
- `useBackendUIFlags()` — feature flags: `ENABLE_CLIENT_DOCUMENT`, `DISABLE_CLIENT_REFERENCE`
- Управление «Мой клиент» реализовано через хук `useClientMyClientStatus(objectId)`, возвращающий `isMyClient`, `addMyClient`, `deleteMyClient`

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/pages/ClientInfo/ClientInfoPage.tsx` |
| Grid layout | `src/pages/ClientInfo/ClientInfo.grid.tsx` |
| Employees hook | `src/pages/ClientInfo/ClientInfo.hooks.ts` |
| My-client status hook | `src/pages/ClientInfo/useClientMyClientStatus.ts` |
| Page styles | `src/pages/ClientInfo/ClientInfoPage.styles.ts` |

---

# File: ClientInfoDealsPage.md — `pages/ClientInfoDeals/ClientInfoDealsPage.md`

# Page: ClientInfoDealsPage

## Purpose

Страница сделок клиента в рамках детальной карточки. Отображает комплексный набор таблиц со сделками и пайплайнами: потенциалы к обработке, потенциалы РД, возможные сделки, связывание сделок, CIB-проекты продаж, пайплайн возможностей, корпоративные запросы, текущий портфель DID, M&A пайплайны (по столу/по филиалу), DCM и ECM пайплайны.

## Route

- Path: `my-clients/:objectId/deals` (определяется через `routeDataMap['my-clients/:objectId/deals'].pagePath`)
- Entry: `ClientInfoDealsPage` (lazy export)

## Layout

```
Page
├── ClientInfoPageHeader           — заголовок с управлением "Мой клиент"
└── ClientDealsGrid                 — сетка таблиц сделок
    ├── OffersToProcessTable         — Потенциалы к обработке
    ├── PotentialsRDTable            — Потенциалы РД
    ├── PossibleOpportunitiesTable   — Возможные сделки
    ├── BindingOpportunitiesTable   — Связывание сделок
    ├── OpportunitySalesProjectsTable — CIB-проекты продаж
    ├── OpportunitiesPipelineTable   — Пайплайн возможностей
    ├── CorporateRequestsTable       — Корпоративные запросы
    ├── CurrentDidPortfolioTable     — Текущий портфель DID
    ├── MaPipelineTable (Ma)         — M&A пайплайн
    ├── MaPipelineTable (MaByDesk)   — M&A пайплайн по столу
    ├── MaPipelineTable (MaByBranch) — M&A пайплайн по филиалу
    ├── DcmEcmPipelineTable (Dcm)    — DCM пайплайн
    └── DcmEcmPipelineTable (Ecm)    — ECM пайплайн
```

## Components

| Component | Import | Props |
|---|---|---|
| `ClientInfoPageHeader` | `clients-app/entities` | `addMyClient`, `deleteMyClient`, `isMyClient`, `root="Deals"`, `objectId`, `locationPathname` |
| `ClientDealsGrid` | local `./ClientInfoDeals.grid` | Слоты для каждой таблицы (`potentialsToProcessTable`, `potentialsRdTable`, `possibleDealsTable`, `bindingDealsTable`, `cibSalesProjectsTable`, `pipelineTable`, `corporateRequestsTable`, `currentDidPortfolioTable`, `maPipelineTable`, `maPipelineTableByDesk`, `maPipelineTableByBranch`, `dcmPipelineTable`, `ecmPipelineTable`) |
| `OffersToProcessTable` | `clients-app/widgets` | `tableCode={'OffersToProcessTable'}` |
| `PotentialsRDTable` | `clients-app/widgets` | `tableCode={'PotentialsRd'}` |
| `PossibleOpportunitiesTable` | `clients-app/widgets` | `tableCode={'PossibleActiveOpportunities'}` |
| `BindingOpportunitiesTable` | `clients-app/widgets` | `tableCode={'BindingActiveOpportunities'}` |
| `OpportunitySalesProjectsTable` | `clients-app/widgets` | `tableCode={'OpportunityActiveSalesProjects'}` |
| `OpportunitiesPipelineTable` | `clients-app/widgets` | `tableCode={'MyDeskOpportunities'}` |
| `CorporateRequestsTable` | `clients-app/widgets` | `tableCode={'CorporateRequests'}` |
| `CurrentDidPortfolioTable` | `clients-app/widgets` | `tableCode={'CurrentDidPortfolio'}` |
| `MaPipelineTable` | `clients-app/widgets` | `tableCode`, `variant` (`"Ma"` / `"MaByDesk"` / `"MaByBranch"`) |
| `DcmEcmPipelineTable` | `clients-app/widgets` | `tableCode`, `variant` (`"Dcm"` / `"Ecm"`) |

## States

### Loading
Явная обработка состояния загрузки на уровне страницы не реализована. Отдельные таблицы-виджеты управляют своими loading-состояниями.

### Empty
Явная обработка пустого состояния на уровне страницы не реализована. Обработка происходит внутри каждого виджета-таблицы.

### Error
Явная обработка ошибок на уровне страницы не реализована. Обработка происходит внутри каждого виджета-таблицы.

### Disabled
Явная обработка состояния блокировки на уровне страницы не реализована.

## Data dependencies

### API hooks
Нет прямых API-вызовов на уровне страницы. Все данные загружаются внутри дочерних виджетов-таблиц. Страница только передаёт `tableCode` и `variant` для конфигурации.

### Redux store
Нет прямого использования `useSelector`/`useDispatch` на уровне страницы.

### Permissions
- Управление «Мой клиент» через хук `useClientMyClientStatus(objectId)` (импортируется из `../ClientInfo`)
- Нет проверки прав на доступ к странице

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/pages/ClientInfoDeals/ClientInfoDealsPage.tsx` |
| Grid layout | `src/pages/ClientInfoDeals/ClientInfoDeals.grid.tsx` |
| Page styles | `src/pages/ClientInfoDeals/ClientInfoDeals.styles.ts` |

---

# File: ClientInfoFinancials.md — `pages/ClientInfoFinancials/ClientInfoFinancials.md`

# Page: ClientInfoFinancials

## Purpose

Страница финансовых показателей клиента. Отображает финансовые метрики (выручка, EBITDA, чистая прибыль, долг, чистый долг) в виде графика и таблицы. Позволяет переключаться между метриками и периодами. При отключённом feature-флаге выполняет редирект на основную страницу клиента.

## Route

- Path: `my-clients/:objectId/financials` (определяется через `routeDataMap['my-clients/:objectId/financials'].pagePath`)
- Entry: `ClientInfoFinancials` (lazy export)

## Layout

```
Page
├── ClientInfoPageHeader                — заголовок с управлением "Мой клиент"
└── [Conditional Content]
    ├── [isLoading] Skeleton              — скелетон (height=400, wave animation)
    ├── [!isLoading && empty] ErrorBanner — "Здесь пока ничего нет" / "Финансовые показатели не загружены"
    └── [!isLoading && has data]
        ├── FinancialsChart               — график финансовых показателей
        └── FinancialsTable               — таблица финансовых показателей
```

## Components

| Component | Import | Props |
|---|---|---|
| `ClientInfoPageHeader` | `clients-app/entities` | `addMyClient`, `deleteMyClient`, `isMyClient`, `root="Financials"`, `objectId`, `locationPathname` |
| `FinancialsChart` | `clients-app/widgets` | `data` (FinancialChartDataType), `metrics` (FinancialMetricKey[]), `period` (FinancialChartPeriodFilter), `onChangePeriod` |
| `FinancialsTable` | `clients-app/widgets` | `data` (FinancialChartDataType), `period` (FinancialChartPeriodFilter) |
| `Skeleton` | `@sber-ibp/uikit` | `animation="wave"`, `height={400}`, `width="100%"`, `variant="rectangular"` |
| `ErrorBanner` | `@sber-ibp/uikit` | `reason="NothingHereYet"`, `isImageOnTop`, `title`, `message` |
| `Navigate` | `react-router` | `to`, `replace` |
| `Grid`, `SxBox` | `@sber-ibp/uikit` | Layout containers |

## States

### Loading
При загрузке данных FSC (`isLoading`) отображается `Skeleton` с анимацией `"wave"`, высотой 400px и шириной 100%.

### Empty
Когда данные FSC отсутствуют или нет доступных метрик (`metrics.length === 0`), отображается `ErrorBanner` с заголовком "There's nothing here yet" и сообщением "Financial indicators are not loaded".

### Error
Если feature-флаг `ENABLED_FINANCIAL_INDICATORS` выключен, выполняется редирект на `/clients-app/my-clients/${objectId}` через `<Navigate>`. При отсутствии `objectId` выбрасывается исключение.

### Disabled
Доступ к странице контролируется feature-флагом `ENABLED_FINANCIAL_INDICATORS`. Если флаг выключен — редирект.

## Data dependencies

### API hooks
- `FscApi.useGetFscByClientsQuery(objectId | skipToken)` — получение финансовых данных клиента (FSC). Запрос пропускается (`skipToken`), если feature-флаг `isFinancialsTabEnabled` выключен.

### Redux store
Нет прямого использования `useSelector`/`useDispatch`.

### Permissions
- `useBackendUIFlags()` — feature flag `ENABLED_FINANCIAL_INDICATORS` контролирует доступ к странице
- Управление «Мой клиент» через хук `useClientMyClientStatus(objectId)` (импортируется из `../ClientInfo`)

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/pages/ClientInfoFinancials/ClientInfoFinancials.tsx` |
| Metrics utils | `src/pages/ClientInfoFinancials/ClientInfoFinancials.utils.ts` |
| Page styles | `src/pages/ClientInfoFinancials/ClientInfoFinancials.styles.ts` |

---

# File: ClientInfoGoalsPage.md — `pages/ClientInfoGoals/ClientInfoGoalsPage.md`

# Page: ClientInfoGoalsPage

## Purpose

Страница целей клиента в рамках детальной карточки. Отображает сгруппированные цели клиента (стратегические диалоги), разделённые по сегментам (GoalType1, GoalType2). Позволяет переключаться между сегментами через фильтр. Управляет статусом «Мой клиент».

## Route

- Path: `my-clients/:objectId/goals` (определяется через `routeDataMap['my-clients/:objectId/goals'].pagePath`)
- Entry: `ClientInfoGoalsPage` (lazy export)

## Layout

```
Page
├── ClientInfoPageHeader                    — заголовок с управлением "Мой клиент"
└── SxBox (contentWrapper)
    ├── GoalSegmentFilter                     — фильтр по сегменту цели
    ├── [isLoading] Grid > Skeleton ×6        — 6 скелетонов (3 колонки)
    ├── [isError] ErrorBanner                  — ошибка загрузки
    ├── [isGoalExists === false] ErrorBanner  — нет целей у клиента
    ├── [isGoalExists === null] ErrorBanner    — цели ещё не получены
    ├── [isGoalExists && empty goals] ErrorBanner — нет поддерживаемых целей
    └── [has goals] ClientInfoGoalsGrid         — сетка целей по сегменту
```

## Components

| Component | Import | Props |
|---|---|---|
| `ClientInfoPageHeader` | `clients-app/entities` | `addMyClient`, `deleteMyClient`, `isMyClient`, `root="Goals"`, `objectId`, `locationPathname` |
| `GoalSegmentFilter` | `clients-app/features` | `availableSegments`, `selectedSegment`, `isDisabled`, `onSegmentChange` |
| `ClientInfoGoalsGrid` | local `./ClientInfoGoals.grid` | `goals` (grouped goals), `selectedSegment` |
| `Skeleton` | `@sber-ibp/uikit` | `animation="wave"`, `height={200}`, `width="100%"`, `variant="rectangular"` |
| `ErrorBanner` | `@sber-ibp/uikit` | `reason`, `isImageOnTop`, `title`, `message` |
| `Grid`, `SxBox` | `@sber-ibp/uikit` | Layout containers |

## States

### Loading
При загрузке целей (`isLoading`) отображается сетка из 6 `Skeleton`-элементов (3 колонки × 2 ряда), каждый высотой 200px с анимацией `"wave"`.

### Empty
Несколько сценариев пустого состояния:
- `clientData?.isGoalExists === false` → ErrorBanner: "There's nothing here yet" / "No goals for this client"
- `clientData?.isGoalExists === null` → ErrorBanner: "There's nothing here yet" / "Goals not yet received"
- `isGoalExists === true && groupedGoals?.length === 0` → ErrorBanner: "There's nothing here yet" / "No goals for this client"

### Error
При ошибке запроса (`isError`) отображается `ErrorBanner` с reason `"ServerFail"`, заголовком "An unknown error occurred" и сообщением "Failed to load goals".

### Disabled
Фильтр сегментов (`GoalSegmentFilter`) получает `isDisabled={!groupedGoals?.length}` — блокируется при отсутствии целей.

## Data dependencies

### API hooks
- `ClientsApi.useGetClientByObjectIdQuery(objectId | skipToken)` — получение базовых данных клиента (используется поле `isGoalExists`)
- `GoalsApi.useGetClientGoalsQuery(objectId | skipToken)` — получение целей клиента. Запрос выполняется только при `GetClientGoals && clientData?.isGoalExists`

### Redux store
Нет прямого использования `useSelector`/`useDispatch`.

### Permissions
- `usePermissions().GetClientGoals` — проверка права на получение целей клиента. Запрос целей пропускается, если право отсутствует.
- Управление «Мой клиент» через хук `useClientMyClientStatus(objectId)` (импортируется из `../ClientInfo`)

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/pages/ClientInfoGoals/ClientInfoGoalsPage.tsx` |
| Grid layout | `src/pages/ClientInfoGoals/ClientInfoGoals.grid.tsx` |
| Page styles | `src/pages/ClientInfoGoals/ClientInfoGoals.styles.ts` |

---

# File: ClientsPage.md — `pages/Clients/ClientsPage.md`

# Page: ClientsPage

## Purpose

Главная страница списка клиентов в кэше. Отображает таблицу всех клиентов с фильтрами, кнопкой создания нового клиента в кэше и возможностью обновления кэша. Доступ к созданию и обновлению контролируется правами пользователя и feature-флагами.

## Layout

```
Page
├── PageBar
│   ├── Title: "Clients"
│   └── extra: Button "New client in cache" (conditionally rendered)
└── Grid
    ├── Grid (filters row)
    │   ├── ClientsFilters            — панель фильтров таблицы
    │   └── Tooltip + Button "Update cache" (conditionally rendered)
    └── Grid (table)
        └── ClientsTable              — таблица клиентов
```

## Components

| Component | Import | Props |
|---|---|---|
| `PageBar` | `@sber-ibp/uikit` | `title`, `dataTestId`, `prefix={null}`, `extra` |
| `Button` | `@sber-ibp/uikit` | `dataTestId`, `onClick`, `startIcon`, `type`, `disabled` |
| `Tooltip` | `@sber-ibp/uikit` | `dataTestId`, `title`, `placement`, `isHint` |
| `ClientsFilters` | `clients-app/widgets` | `tableCode={clientsTableCode}` |
| `ClientsTable` | `clients-app/widgets` | нет явных props |
| `ControlClientModal` | `clients-app/features` | используется через `useModal().openModalWith({ name: 'CreateClient', title })` |

## States

### Loading
Явная обработка состояния загрузки на уровне страницы не реализована. Управляется внутри `ClientsTable`.

### Empty
Явная обработка пустого состояния на уровне страницы не реализована. Управляется внутри `ClientsTable`.

### Error
Явная обработка ошибок на уровне страницы не реализована. Управляется внутри `ClientsTable`.

### Disabled
Кнопка "Update cache" (`UpdateAllClients`) переходит в состояние `disabled={clicked}` после первого клика — предотвращает повторный запуск обновления. Кнопка "New client in cache" отображается только при `createClientFlag && CreateClient`.

## Data dependencies

### API hooks
- `ClientsApi.useLazyRenovationCacheClientAllQuery()` — ленивый запрос обновления кэша всех клиентов. Триггерится по клику на кнопку "Update cache".

### Redux store
Нет прямого использования `useSelector`/`useDispatch`.

### Permissions
- `usePermissions().CreateClient` — право на создание клиента. Кнопка создания рендерится только при наличии права и feature-флага.
- `usePermissions().RenovationCacheClientAll` — право на обновление кэша. Кнопка "Update cache" рендерится только при наличии права.
- `useBackendUIFlags().CREATE_CLIENT` — feature flag для отображения кнопки создания клиента.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/pages/Clients/ClientsPage.tsx` |

---

# File: ClientsRnpPage.md — `pages/ClientsRnp/ClientsRnpPage.md`

# Page: ClientsRnpPage

## Purpose

Страница списка клиентов РНП (реестр неплательщиков). Отображает таблицу клиентов РНП с панелью фильтров. Простейшая страница-обёртка над виджетами фильтров и таблицы.

## Layout

```
Page
├── PageBar
│   └── Title: "ClientsRnp"
└── Grid
    ├── Grid (filters row)
    │   └── ClientsRnpFilters         — панель фильтров
    └── Grid (table)
        └── ClientsRnpTable           — таблица клиентов РНП
```

## Components

| Component | Import | Props |
|---|---|---|
| `PageBar` | `@sber-ibp/uikit` | `title={t('ClientsRnp')}`, `dataTestId`, `prefix={null}` |
| `ClientsRnpFilters` | `clients-app/widgets` | `tableCode={clientsRnpTableCode}` |
| `ClientsRnpTable` | `clients-app/widgets` | нет явных props |

## States

### Loading
Явная обработка состояний не реализована. Управляется внутри `ClientsRnpTable` и `ClientsRnpFilters`.

### Empty
Явная обработка состояний не реализована. Управляется внутри `ClientsRnpTable`.

### Error
Явная обработка состояний не реализована. Управляется внутри `ClientsRnpTable`.

### Disabled
Явная обработка состояния блокировки не реализована.

## Data dependencies

### API hooks
Нет прямых API-вызовов на уровне страницы. Все запросы выполняются внутри дочерних виджетов `ClientsRnpFilters` и `ClientsRnpTable`.

### Redux store
Нет прямого использования `useSelector`/`useDispatch`.

### Permissions
Нет проверок прав доступа на уровне страницы.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/pages/ClientsRnp/ClientsRnpPage.tsx` |

---

# File: MyClientsPage.md — `pages/MyClients/MyClientsPage.md`

# Page: MyClientsPage

## Purpose

Страница «Мои клиенты». Отображает список закреплённых за пользователем клиентов в виде таблицы или иерархического дерева по холдингам. Позволяет добавлять клиентов через модальное окно поиска UCP. При отсутствии клиентов показывает баннер с призывом добавить клиента через поиск.

## Layout

```
Page
├── PageBar
│   ├── Title: "Clients"
│   └── extra: Button "Add client" (conditionally by SearchMyClients)
└── Grid (contentWrapper)
    ├── Grid (toolbar row)
    │   ├── MyClientsTableFilters          — фильтры (скрыты при groupedByHoldings или showErrorBanner)
    │   └── InputSwitch "Group by holdings" — переключатель группировки (conditionally by flag)
    └── Grid
        ├── [showErrorBanner] ErrorBanner   — пустое состояние с кнопкой "Add client"
        ├── [isGroupedByHoldings] MyClientsHierarchicalTree — дерево холдингов
        └── [default] MyClientsTable        — таблица "Мои клиенты"
```

## Components

| Component | Import | Props |
|---|---|---|
| `PageBar` | `@sber-ibp/uikit` | `title`, `dataTestId`, `prefix={null}`, `extra` |
| `Button` | `@sber-ibp/uikit` | `dataTestId`, `onClick`, `startIcon`, `type` |
| `InputSwitch` | `@sber-ibp/uikit` | `dataTestId`, `label`, `size="sm"`, `checked`, `onChange` |
| `ErrorBanner` | `@sber-ibp/uikit` | `reason="NothingHereYet"`, `isImageOnTop`, `title`, `message`, `actions` |
| `MyClientsTableFilters` | `clients-app/widgets` | `tableCode={myClientsTableCode}` |
| `MyClientsTable` | `clients-app/widgets` | `myClientsSearch` (lazy query trigger) |
| `MyClientsHierarchicalTree` | `clients-app/widgets` | нет явных props |
| `Icon` | `@sber-ibp/uikit` | `name`, `sx` |

## States

### Loading
Явная обработка состояния загрузки на уровне страницы не реализована. Управляется внутри `MyClientsTable` и `MyClientsHierarchicalTree`.

### Empty
При пустых фильтрах и пустом ответе (`showErrorBanner = hasEmptyFilters && hasEmptyResponse`) отображается `ErrorBanner`:
- Title: "Здесь пока ничего нет"
- Message: инструкция добавить клиента через поиск с иконкой `BookmarkAdd`
- Actions: кнопка "Add client" с иконкой `ClientSearch`

Таблица `MyClientsTable` скрывается (`display: none`) при `showErrorBanner`, т.к. модальному окну `UcpClientSearchModal` нужен доступ к состоянию таблицы.

### Error
Явная обработка ошибок API на уровне страницы не реализована.

### Disabled
Переключатель «Group by holdings» отображается только при включённом feature-флаге `ENABLE_MY_CLIENTS_HOLDINGS_GROUP`. Фильтры таблицы скрываются при активной группировке по холдингам или при `showErrorBanner`.

## Data dependencies

### API hooks
- `ClientsApi.useLazySearchMyClientsQuery()` — ленивый поиск «Мои клиенты». Trigger-функция `myClientsSearch` передаётся в `MyClientsTable` для управления запросами.

### Redux store
Нет прямого использования `useSelector`/`useDispatch`.

### Permissions
- `usePermissions().SearchMyClients` — право на поиск/добавление клиентов. Кнопка "Add client" рендерится только при наличии права.
- `useBackendUIFlags().ENABLE_MY_CLIENTS_HOLDINGS_GROUP` — feature flag для отображения переключателя группировки по холдингам.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/pages/MyClients/MyClientsPage.tsx` |
| Page styles | `src/pages/MyClients/MyClientsPage.styles.ts` |

---

# File: ClientCard.md — `UcpClientSearchModal/features/ClientCardList/ClientCard.md`

# Feature: ClientCard

## Purpose

Карточка клиента, отображаемая в списке результатов поиска UCP-клиентов. Показывает краткую информацию о клиенте: наименование, тип юридического лица, резидентство, а также реквизиты (ИНН, КПП, ОГРН, CRM ID, КИО) в зависимости от типа клиента. Поддерживает выбор карточки кликом для последующего отображения детальной информации.

## Layout

```
┌─────────────────────────────────────────┐
│ Card (uikit)                             │
│ ┌───┬─────────────────────────────────┐ │
│ │Icon│ Title (shortName/fullName)      │ │
│ │    │ Subtitle (typeText · resident)  │ │
│ ├───┴─────────────────────────────────┘ │
│ ┌───────────────────────────────────────┐│
│ │ Text: INN {inn}                       ││
│ │ Text: KPP {kpp}                       ││
│ │ Text: KPP KN {kppKn}                  ││
│ │ Text: OGRN {ogrn}                     ││
│ │ Text: CRM ID {crmId}                  ││
│ │ Text: KIO {kio}  (только нерезиденты) ││
│ └───────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

Для холдингов (`legalClientTypeCode === 4`) отображается только CRM ID (при наличии). Для остальных типов клиентов отображается полный набор реквизитов, причём KIO показывается только для нерезидентов.

## Components

- **Card** — импортируется из `@sber-ibp/uikit`. Props: `dataTestId`, `title`, `selected`, `onClick`, `subtitle`, `headerIcon`. Отображает заголовок с иконкой и подзаголовком, содержит контент с реквизитами.
- **Grid** — импортируется из `@sber-ibp/uikit`. Используется для layout-разметки карточки и внутренних полей.
- **Icon** — импортируется из `@sber-ibp/uikit`. Отображает иконку типа клиента в заголовке карточки (`Building02` для юр. лица, `Building` для холдинга, `Factory01` по умолчанию).
- **Text** — импортируется из `@sber-ibp/uikit`. Props: `sx`, `type="BodySReg"`, `dataTestId`. Отображает строки реквизитов.
- **SxBox** — импортируется из `@sber-ibp/uikit`. Применяет стили обёртки `clientCardSx`.

## States

### Loading
Нет данных — карточка не реализует состояние загрузки самостоятельно. Состояние загрузки списка управляется родительским компонентом `ClientCardList`.

### Empty
Нет данных — если у клиента отсутствуют конкретные реквизиты (например `inn`, `kpp`, `ogrn`), соответствующие поля не рендерятся. Заголовок fallback'ится: `client.shortName || client.fullName || ''` (пустая строка, если оба отсутствуют).

### Error
Нет данных — обработка ошибок делегируется родительскому компоненту, который управляет данными поиска.

### Disabled
Состояние выбора реализовано через проп `isSelected` — передаётся в `Card.selected` для визуального выделения выбранной карточки.

## Data dependencies

### API hooks
Нет данных — компонент получает данные через проп `client: ClientUcpDto` от родительского компонента. Прямых API-вызовов не выполняет.

### Redux store
Нет данных — компонент не обращается к Redux store напрямую.

### Permissions
Нет данных — проверки прав доступа не используются.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/UcpClientSearchModal/features/ClientCardList/ClientCard.tsx` |
| Client type config | `src/UcpClientSearchModal/features/ClientCardList/ClientCard.utils.ts` |
| Styles | `src/UcpClientSearchModal/features/ClientCardList/ClientCardList.styles.ts` |

---

# File: ClientsModalActions.md — `UcpClientSearchModal/features/ClientsModalActions/ClientsModalActions.md`

# Feature: ClientsModalActions

## Purpose

Фича-диспатчер кнопок действий в футере модального окна поиска UCP-клиентов. В зависимости от текущего режима модального окна (`ModalKind`) выбирает и рендерит соответствующий набор действий: для режима `my-clients` — кнопки добавления/удаления клиента из "Мои клиенты", для режима `ucp-search` — кнопку закрытия модального окна.

## Layout

```
ClientsModalActions
  └── ComponentView (выбирается по modalKind)
        ├── my-clients → MyClientsModalActionsView
        │     ┌───────────────────────────────────────┐
        │     │ Button "Add to My clients"            │
        │     │   или                                  │
        │     │ Button "Delete from My clients"       │
        │     │ Toast "Added to My Clients"            │
        │     └───────────────────────────────────────┘
        └── ucp-search → UcpClientSearchModalActionsView
              ┌───────────────────┐
              │ Button "Close"    │
              └───────────────────┘
```

## Components

- **MyClientsModalActionsView** — импортируется из `./views`. Props: `closeModal` (наследуется от `ClientsModalActionsProps`, но не используется в этом view). Отображает кнопку добавления или удаления клиента из списка "Мои клиенты" в зависимости от статуса `client.myClient`. Использует RTK Query мутации `ClientsApi.useAddMyClientMutation` / `ClientsApi.useDeleteMyClientMutation` и lazy-запрос `ClientsApi.useLazyAddClientByPartyIdQuery` для добавления клиента в кэш при отсутствии `objectId`.
- **UcpClientSearchModalActionsView** — импортируется из `./views`. Props: `closeModal: () => void`. Рендерит единственную кнопку "Закрыть", вызывающую `closeModal` при клике.
- **Button** — импортируется из `@sber-ibp/uikit`. Используется в обоих view-компонентах.
- **Toast** — импортируется из `@sber-ibp/uikit`. Используется в `MyClientsModalActionsView` для уведомления об успешном добавлении клиента.
- **Grid** — импортируется из `@sber-ibp/uikit`. Обёртка действий в `MyClientsModalActionsView`.

## States

### Loading
Кнопки в `MyClientsModalActionsView` блокируются (`disabled={isInputsDisabled}`) во время выполнения мутаций (add/delete/addToCache) или загрузки данных клиента (`isClientSummaryFetching`). Статус отслеживается через `QueryStatus.pending`.

### Empty
В `MyClientsModalActionsView`, если `client` отсутствует (`!client`), кнопки также блокируются (`isInputsDisabled` включает `!client`).

### Error
Ошибки мутаций обрабатываются через `.unwrap()` в `handleAddToMyClients` / `handleRemoveFromMyClients` — при неудаче промис отклоняется, но явной обработки ошибок (toast error) не реализовано.

### Disabled
Кнопки disabled когда: идёт любая из pending-мутаций (`addStatus`, `deleteStatus`, `addClientToCacheStatus`), идёт загрузка данных клиента, или клиент не загружен. Видимость кнопок также зависит от permissions: `AddMyClient` и `DeleteMyClient`.

## Data dependencies

### API hooks
- `ClientsApi.useGetClientByPartyIdQuery(partyId, { refetchOnMountOrArgChange: true, selectFromResult: clearDataOnError })` — получение данных клиента (в `MyClientsModalActionsView`).
- `ClientsApi.useAddMyClientMutation()` — добавление клиента в "Мои клиенты".
- `ClientsApi.useDeleteMyClientMutation()` — удаление клиента из "Мои клиенты".
- `ClientsApi.useLazyAddClientByPartyIdQuery()` — lazy-запрос добавления клиента в кэш для получения `objectId`.

### Redux store
- `useSelectedPartyId()` — получение выбранного `partyId` из Redux store (в `MyClientsModalActionsView`).
- `useTemplatedTableController('MyClientsTable')` — контроллер таблицы для рефетча данных после добавления/удаления.

### Permissions
- `usePermissions()` → `AddMyClient` — флаг разрешения на добавление клиента в "Мои клиенты". Определяет видимость кнопки "Add".
- `usePermissions()` → `DeleteMyClient` — флаг разрешения на удаление клиента из "Мои клиенты". Определяет видимость кнопки "Delete".

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/UcpClientSearchModal/features/ClientsModalActions/ClientsModalActions.tsx` |
| Types | `src/UcpClientSearchModal/features/ClientsModalActions/ClientsModalActions.types.ts` |
| Views barrel | `src/UcpClientSearchModal/features/ClientsModalActions/views/index.ts` |
| MyClients view | `src/UcpClientSearchModal/features/ClientsModalActions/views/MyClientsModalActionsView.tsx` |
| UcpSearch view | `src/UcpClientSearchModal/features/ClientsModalActions/views/UcpClientSearchModalActionsView.tsx` |

---

# File: UcpClientInformationView.md — `UcpClientSearchModal/features/Views/UcpClientView/UcpClientInformationView/UcpClientInformationView.md`

# Feature: UcpClientInformationView

## Purpose

Детальная информационная панель UCP-клиента, отображаемая в правой части модального окна поиска. Показывает полный набор атрибутов клиента: наименование, тип, реквизиты (ИНН, КПП, ОГРН, КИО, CRM ID), отраслевую принадлежность, сегмент, территориальный банк, бейджи (ключевой клиент, резидент РФ, компания роста), цель клиента, а также таблицу команды клиента с навигацией на страницу клиента.

## Layout

```
UcpClientInformationViewGrid
  ┌────────────────────────────────────────────────────┐
  │ shortName                          [Button: Client │
  │                                     page →]        │
  ├────────────────────────────────────────────────────┤
  │ fullName                                            │
  │ legalClientTypeName                                 │
  │ holdingName                                         │
  ├────────────────────────────────────────────────────┤
  │ "Client team"                                       │
  │ Table (UcpClientTeamTable)                          │
  ├────────────────────────────────────────────────────┤
  │ subindustryName / industryName / macroIndustryName │
  │ segmentName / terBankName                           │
  │ curatorIndustryDivisionName                         │
  ├──────────────────────────┬─────────────────────────┤
  │ inn         │ kpp         │ ogrn        │ kppKn     │
  │ kio         │             │             │            │
  │ address (full width)                                │
  ├────────────────────────────────────────────────────┤
  │ isResident (Badge) │ isClient (Badge)               │
  │ isGrowthCompany (Badge) │ isGoalExists (Badge)      │
  └────────────────────────────────────────────────────┘
```

В режиме загрузки все поля заменяются на `Skeleton` плейсхолдеры. При отсутствии данных отображается текст "No data to show".

## Components

- **UcpClientInformationViewGrid** — внутренний grid-компонент (`./UcpClientInformationView.grid`). Раскладывает все поля клиента по сетке. Содержит кнопку навигации на страницу клиента (`/clients-app/my-clients/{objectId}`).
- **InputText** — импортируется из `@sber-ibp/uikit`. Props: `label`, `value`, `viewType="read"`, `size="sm"`, `multiline`. Используется фабрикой `CreateClientField` для рендера полей клиента в режиме чтения.
- **Table** — импортируется из `@sber-ibp/uikit`. Props: `isBordered`, `columns={ucpColumns}`, `isLoading`, `rows={clientTeam}`, `dataTestId`. Таблица команды клиента.
- **Skeleton** — импортируется из `@sber-ibp/uikit`. Превью полей при загрузке.
- **DictionaryBadge** — импортируется из `@sber-ibp/uikit`. Бейджи "Ключевой клиент", "Резидент РФ", "Компания роста" с иконками.
- **GoalsPopoverBadge** — импортируется из `clients-app/widgets`. Бейдж цели клиента с popover.
- **Button** — импортируется из `@sber-ibp/uikit` (в grid-компоненте). Навигация на страницу клиента.
- **Icon** — импортируется из `@sber-ibp/uikit`. Иконки внутри бейджей (`Factory03`, `ResidentRF`, `TrendUp`).
- **Text** — импортируется из `@sber-ibp/uikit`. Заголовок секции "Client team" и пустое состояние.
- **Grid** — импортируется из `@sber-ibp/uikit`. Layout-разметка.

## States

### Loading
При `isFetching` (объединяет `isClientSummaryFetching`, `isClientTeamFetching`, `isAddClientToCacheFetching`) рендерится `UcpClientInformationViewGrid` со всеми полями в виде `Skeleton` высотой `theme.spacing(8)`. Таблица команды рендерится с `isLoading={isClientTeamFetching}`.

### Empty
Когда данные клиента отсутствуют (`!client || !partyId`), отображается текст "No data to show" (`t('No data to show')`) с `dataTestId="EmptyText"`.

### Error
Используется `clearDataOnError` в `selectFromResult` для `useGetClientByPartyIdQuery` — при ошибке запроса данные очищаются, что приводит к отображению пустого состояния. Ошибки `addClientToCache` логируются в `console.error`.

### Disabled
Кнопка навигации на страницу клиента в grid-компоненте блокируется (`disabled`) если отсутствует `partyId` или `objectId`/`resolvedObjectId`.

## Data dependencies

### API hooks
- `ClientsApi.useGetClientByPartyIdQuery(queryArg, { selectFromResult: clearDataOnError })` — получение детальных данных клиента по `partyId`. Использует `skipToken` если `partyId` не задан.
- `ClientsApi.useLazyAddClientByPartyIdQuery()` — lazy-запрос добавления клиента в кэш. Вызывается автоматически, если у клиента нет `objectId`, для его резолва и сохранения в `resolvedObjectId` state.

### Redux store
- `useUcpClientTeamTable({ managerEmployeeInfo })` — hook из `ucp-client-modal/widgets`, возвращает строки таблицы команды клиента и статус загрузки. Внутри использует `EmployeesApi.useSearchEmployeeFioOrPnMutation` для внешнего поиска сотрудников.
- `usePermissions()` → `GetClientGoals` — флаг разрешения на просмотр целей клиента. Определяет видимость `GoalsPopoverBadge`.
- `useTheme()` — доступ к теме для расчёта высоты скелетонов (`theme.spacing(8)`).

### Permissions
- `GetClientGoals` — флаг разрешения на отображение бейджа цели клиента. Если `false`, бейдж `isGoalExists` не рендерится даже при наличии данных.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/UcpClientSearchModal/features/Views/UcpClientView/UcpClientInformationView/UcpClientInformationView.tsx` |
| Grid layout | `src/UcpClientSearchModal/features/Views/UcpClientView/UcpClientInformationView/UcpClientInformationView.grid.tsx` |
| Styles | `src/UcpClientSearchModal/features/Views/UcpClientView/UcpClientInformationView/UcpClientInformationView.styles.ts` |
| Team table hook | `src/UcpClientSearchModal/widgets/Tables/UcpClientTeamTable/useUcpClientTeamTable.ts` |

---

# File: UcpClientReferenceView.md — `UcpClientSearchModal/features/Views/UcpClientView/UcpClientReferenceView/UcpClientReferenceView.md`

# Feature: UcpClientReferenceView

## Purpose

Отображает справочную информацию о клиенте в виде Markdown-секций, отсортированных по приоритету. Каждая секция содержит заголовок (тип справки: "Attention", "Communications", "Company", "LPR") и Markdown-контент. Отдельные секции могут быть скрыты через backend UI-флаги.

## Layout

```
┌────────────────────────────────────────────┐
│ Grid container                              │
│                                              │
│ ┌──────────────────────────────────────────┐│
│ │ Section: Company (приоритет 1)           ││
│ │   Text H6StrongSmb: "About client"       ││
│ │   Markdown: {content}                    ││
│ └──────────────────────────────────────────┘│
│ ┌──────────────────────────────────────────┐│
│ │ Section: LPR (приоритет 2)                ││
│ │   Text H6StrongSmb: "LPR"                 ││
│ │   Markdown: {content}                    ││
│ └──────────────────────────────────────────┘│
│ ┌──────────────────────────────────────────┐│
│ │ Section: Attention (приоритет 3)          ││
│ │   Text H6StrongSmb: "Attention"           ││
│ │   Markdown: {content}                    ││
│ └──────────────────────────────────────────┘│
│ ┌──────────────────────────────────────────┐│
│ │ Section: Communications (приоритет 4)     ││
│ │   Text H6StrongSmb: "Communications"      ││
│ │   Markdown: {content}                    ││
│ └──────────────────────────────────────────┘│
└────────────────────────────────────────────┘
```

Секции сортируются по приоритету: Company (1) → LPR (2) → Attention (3) → Communications (4).

## Components

- **Grid** — импортируется из `@sber-ibp/uikit`. Контейнер для секций справки, вертикальный layout с `rowSpacing={theme.spacing(6)}`.
- **Text** — импортируется из `@sber-ibp/uikit`. Заголовок секции (`type="H6StrongSmb"`) и обёртка контента (`type="BodySReg"`).
- **Markdown** — импортируется из `@sber-ibp/uikit`. Props: `dataTestId`, `sx={markdownSx}`. Рендерит Markdown-контент секции.
- **UcpClientReferenceViewSkeleton** — внутренний скелетон-компонент (`./UcpClientReferenceView.skeleton`). Отображает 3 плейсхолдера (заголовок + контент) во время загрузки.

## States

### Loading
При `isLoading=true` рендерится `UcpClientReferenceViewSkeleton` — 3 блока `Skeleton` (заголовок 150×20, контент 630×96) имитирующие структуру загружаемых секций.

### Empty
Если `sortedReference` отсутствует или пуст (`!sortedReference || !sortedReference?.length`), отображается текст "No data to show" (`t('No data to show')`) с `dataTestId="EmptyText"`.

### Error
Явная обработка ошибок не реализована — ошибки загрузки данных обрабатываются родительским компонентом, который управляет пропом `isLoading`.

### Disabled
Секции могут быть скрыты через backend UI-флаги. Маппинг флагов: `Attention` → `DISABLE_CLIENT_REFERENCE_ATTENTION`, `Communications` → `DISABLE_CLIENT_REFERENCE_COMMUNICATIONS`, `Company` → `DISABLE_CLIENT_REFERENCE_COMPANY`, `LPR` → `DISABLE_CLIENT_REFERENCE_LPR`. Секции с активным флагом отключения не рендерятся.

## Data dependencies

### API hooks
Нет данных — компонент получает данные через проп `reference: ClientReferencesRsDto` от родительского компонента. Прямых API-вызовов не выполняет.

### Redux store
Нет данных — компонент не обращается к Redux store напрямую.

### Permissions
- `useBackendUIFlags()` — получение backend UI-флагов из settings-lib-fe. Флаги `DISABLE_CLIENT_REFERENCE_*` управляют видимостью отдельных секций справки.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/UcpClientSearchModal/features/Views/UcpClientView/UcpClientReferenceView/UcpClientReferenceView.tsx` |
| Const (name map & priority) | `src/UcpClientSearchModal/features/Views/UcpClientView/UcpClientReferenceView/UcpClientReferenceView.const.ts` |
| Types | `src/UcpClientSearchModal/features/Views/UcpClientView/UcpClientReferenceView/UcpClientReferenceView.types.ts` |
| Utils (sorting comparator) | `src/UcpClientSearchModal/features/Views/UcpClientView/UcpClientReferenceView/UcpClientReferenceView.utils.ts` |
| Skeleton | `src/UcpClientSearchModal/features/Views/UcpClientView/UcpClientReferenceView/UcpClientReferenceView.skeleton.tsx` |
| Styles | `src/UcpClientSearchModal/features/Views/UcpClientView/UcpClientReferenceView/UcpClientReferenceView.styles.ts` |

---

# File: UcpClientSearchModal.md — `UcpClientSearchModal/pages/UcpClientSearchModal/UcpClientSearchModal.md`

# Page: UcpClientSearchModal

## Purpose

Страница-контроллер модального окна поиска UCP-клиентов. Слушает навигационные события от host-приложения и управляет жизненным циклом модального окна: открывает/закрывает окно и устанавливает режим работы (`modalKind`). Сам компонент не рендерит визуальных элементов — он делегирует рендеринг контенту модального окна (`UcpClientSearchModalContent`).

## Layout

```
UcpClientSearchModal (рендерит null)
  │
  ├── useEventApiListener → слушает 'ToggleUcpSearch' от 'NavigationEventSource'
  │     ├── toggles isOpen state
  │     └── dispatch modalStateActions.setModalKind(kind)
  │
  └── useLayoutEffect [isOpen]
        ├── isOpen=true  → openModal() → UcpClientSearchModalContent
        └── isOpen=false → dispatch resetSelectedUserInfo() + closeModal()

UcpClientSearchModalContent (рендерится через useModal)
  ┌──────────────────────────────────────────────────────────┐
  │ Modal (title: "UCP Client search", 1358×900)              │
  │ AlertTop: US customers info hidden                        │
  │ ┌──────────────────┬───────────────────────────────────┐ │
  │ │ Left panel        │ Right panel                       │ │
  │ │ ┌──────────────┐  │                                   │ │
  │ │ │SearchForm    │  │  UcpClientInformationView          │ │
  │ │ └──────────────┘  │  (partyId from selectedPartyId)    │ │
  │ │ Divider            │                                   │ │
  │ │ ┌──────────────┐  │                                   │ │
  │ │ │ClientCardList│  │                                   │ │
  │ │ └──────────────┘  │                                   │ │
  │ └──────────────────┴───────────────────────────────────┘ │
  │ Footer: <ClientsModalActions closeModal={...} />          │
  └──────────────────────────────────────────────────────────┘
```

## Components

- **Modal** — импортируется из `@sber-ibp/uikit`. Контейнер модального окна с заголовком, alert-баннером, actions-футером и контентом. Props: `name`, `closeModal`, `title`, `actions`, `width=1358`, `height=900`, `visible=true`.
- **UcpClientSearchModalContent** — внутренний контент-компонент (`./UcpClientSearchModal.content`). Реализует `ModalFsdComponent` и рендерит трёхпанельный layout: форму поиска, список результатов и детальную информацию о клиенте.
- **ClientSearchForm** — импортируется из `ucp-client-modal/entities`. Форма поиска клиентов.
- **ClientCardList** — импортируется из `ucp-client-modal/features`. Список карточек результатов поиска.
- **ClientsModalActions** — импортируется из `ucp-client-modal/features`. Кнопки действий в футере модального окна.
- **UcpClientInformationView** — импортируется из `clients-app/UcpClientSearchModal/features/Views/...`. Детальная панель информации о клиенте.
- **Grid** — импортируется из `@sber-ibp/uikit`. Разметка колонок модального окна.
- **Divider** — импортируется из `@sber-ibp/uikit`. Вертикальные разделители между панелями.

## States

### Loading
Состояния загрузки управляются дочерними компонентами: `ClientCardList` (загрузка результатов поиска), `UcpClientInformationView` (скелетоны при загрузке данных клиента).

### Empty
Пустые состояния управляются дочерними компонентами: `ClientCardList` (нет результатов поиска), `UcpClientInformationView` (текст "No data to show").

### Error
Явная обработка ошибок не реализована на уровне страницы. Alert-баннер сверху (`alertTopProps`) информирует о скрытии данных клиентов США согласно акту № 524/3-Р от 08.04.2022.

### Disabled
Модальное окно закрывается через `closeModal`, который триггерит событие `ToggleUcpSearch` обратно в navigation source. При закрытии сбрасывается выбранная информация о пользователе (`modalStateActions.resetSelectedUserInfo()`).

## Data dependencies

### API hooks
Нет данных — страница не выполняет прямых API-вызовов. API-вызовы инкапсулированы в дочерних компонентах.

### Redux store
- `useDispatch()` → `modalStateActions.setModalKind(data.kind)` — установка режима модального окна при открытии.
- `useDispatch()` → `modalStateActions.resetSelectedUserInfo()` — сброс информации о выбранном пользователе при закрытии.
- `useSelectedPartyId()` — получение выбранного `partyId` из store (в content-компоненте) для передачи в `UcpClientInformationView`.
- `useModalKind()` — получение текущего режима модального окна (в content-компоненте).

### Permissions
Нет данных — проверки прав доступа делегированы дочерним компонентам.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Page component | `src/UcpClientSearchModal/pages/UcpClientSearchModal/UcpClientSearchModal.tsx` |
| Config | `src/UcpClientSearchModal/pages/UcpClientSearchModal/UcpClientSearchModal.config.ts` |
| Modal content | `src/UcpClientSearchModal/pages/UcpClientSearchModal/UcpClientSearchModal.content.tsx` |

---

# File: UcpClientTeamTable.md — `UcpClientSearchModal/widgets/Tables/UcpClientTeamTable/UcpClientTeamTable.md`

# Widget: UcpClientTeamTable

## Purpose

Виджет таблицы команды клиента, формируемый через хук `useUcpClientTeamTable`. Отображает список сотрудников, закреплённых за клиентом: ФИО, табельный номер (personalNumber) и роль. Данные о сотрудниках обогащаются результатами внешнего поиска (через Employees API) для получения полных ФИО. Уволенные сотрудники исключаются из таблицы. Поддерживает сортировку по столбцам.

## Layout

```
┌──────────────────────────────────────────────────────┐
│ Table (ucpColumns, isBordered=true)                   │
│ ┌─────────────┬──────────────────┬─────────────────┐ │
│ │ Full Name   │ Personal Number  │ Role            │ │
│ ├─────────────┼──────────────────┼─────────────────┤ │
│ │ {fullName}  │ {personalNumber} │ {role.name}     │ │
│ │ {fullName}  │ {personalNumber} │ {role.name}     │ │
│ │ ...         │ ...              │ ...             │ │
│ └─────────────┴──────────────────┴─────────────────┘ │
│                                                        │
│ Loading state: isLoading spinner                       │
│ Empty state: emptyRows []                              │
└──────────────────────────────────────────────────────┘
```

Колонки определены внешней константой `ucpColumns` (из `ucp-client-modal/widgets`). Значения ячеей рендерятся через `noEmptyTextPresenter` (с placeholder'ом для пустых значений).

## Components

- **Table** — импортируется из `@sber-ibp/uikit`. Рендерится родительским компонентом (`UcpClientInformationView`), не внутри хука. Хук поставляет данные (`rows`) и статус (`isFetching`).
- **noEmptyTextPresenter** — импортируется из `@sber-ibp/uikit`. Презентер для ячеек, отображает placeholder при пустом значении. Props: `multiline`, `rows`, `value`.
- **Row** — тип из `@sber-ibp/uikit`. Строка таблицы с render-функциями для каждой ячейки.

## States

### Loading
При `isFetching=true` (статус мутации `searchEmployeesExternal`) хук возвращает `isFetching: true` и `rows: emptyRows`. Родительский компонент передаёт `isLoading={isFetching}` в `Table`, что отображает индикатор загрузки. Поля ячеек `fullName` используют `noEmptyTextPresenter` с `multiline: true, rows: 3` для резервирования места.

### Empty
Если `teamMemberInfo` пуст или сотрудники не найдены во внешнем сервисе (`!teamMemberInfo?.length || !employees`), хук возвращает `rows: emptyRows` (пустой массив). Таблица отображается без строк.

### Error
Явная обработка ошибок не реализована. При ошибке мутации `searchEmployeesExternal` данные `employees` остаются `undefined`, что приводит к возврату пустых строк (`emptyRows`).

### Disabled
Нет данных — состояние блокировки не применимо к хуку. Управление сортировкой доступно через `useTableState`.

## Data dependencies

### API hooks
- `EmployeesApi.useSearchEmployeeFioOrPnMutation()` — мутация внешнего поиска сотрудников по табельным номерам (`personalNumbers`). Вызывается автоматически при наличии `teamMemberInfo` (через `useEffect`). Возвращает `data: employees` и `isLoading: isFetching`.

### Redux store
- `useTableState<UcpClientTeamTableRowData, object>(tableCode)` — управление состоянием таблицы (сортировка) из uikit. Возвращает `state.sorting[0]` — текущее правило сортировки, применяемое к строкам через компаратор.

### Permissions
Нет данных — проверки прав доступа не используются в хуке.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Hook (useUcpClientTeamTable) | `src/UcpClientSearchModal/widgets/Tables/UcpClientTeamTable/useUcpClientTeamTable.ts` |
| Types | `src/UcpClientSearchModal/widgets/Tables/UcpClientTeamTable/UcpClientTeamTable.types.ts` |
| Utils (prepareEmployeesRequest, getRowData) | `src/UcpClientSearchModal/widgets/Tables/UcpClientTeamTable/useUcpClientTeamTable.utils.ts` |

---

# File: FinancialsChart.md — `widgets/Charts/FinancialsChart/FinancialsChart.md`

# Widget: FinancialsChart

## Purpose

Виджет финансового графика клиента. Отображает столбчатую/линейную диаграмму финансовых показателей (выручка, EBITDA, чистая прибыль, долг, чистый долг) с фильтрами по метрике и периоду. Показывает легенду и информационные блоки по текущей метрике. Используется на странице финансовых показателей клиента.

## Layout

```
Grid (container, column)
├── Title                         — название текущей метрики
├── Grid (header row)
│   ├── FinancialChartInfo       — информационный блок по выбранной метрике
│   ├── FinancialsChartLegend     — легенда графика
│   └── FinancialChartFilters     — фильтры (метрика + период)
└── Grid
    └── Bar                       — диаграмма (chart.js)
```

## Components

| Component | Import | Props |
|---|---|---|
| `Bar` | `@sber-ibp/uikit` | `dataTestId`, `height="330px"`, `width="100%"`, `params={{ disabledZoom: true }}`, `options`, `data` |
| `Title` | `@sber-ibp/uikit` | `sx`, `dataTestId` |
| `Grid` | `@sber-ibp/uikit` | Layout container |
| `FinancialChartInfo` | `clients-app/features` | `data` (FinancialChartItemType), `metric` (FinancialMetricKey) |
| `FinancialsChartLegend` | `clients-app/features` | `legends` (FinancialsLegendType[]) |
| `FinancialChartFilters` | `clients-app/features` | `metrics`, `onChangeMetric`, `onChangePeriod`, `period`, `selectedMetric` |

## States

### Loading
Явная обработка состояния загрузки не реализована на уровне виджета. Состояние загрузки данных управляется родительской страницей (`ClientInfoFinancials`).

### Empty
Если `currentCollection` отсутствует, блок `FinancialChartInfo` не рендерится. Если `legends` отсутствует, легенда не рендерится.

### Error
Явная обработка ошибок не реализована на уровне виджета.

### Disabled
Параметр `disabledZoom: true` передаётся в компонент `Bar` — отключает зум графика.

## Data dependencies

### API hooks
Нет прямых API-вызовов. Данные поступают через props от родительского компонента.

### Redux store
Нет прямого использования `useSelector`/`useDispatch`.

### Permissions
Нет проверок прав доступа.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/widgets/Charts/FinancialsChart/FinancialsChart.tsx` |
| Types | `src/widgets/Charts/FinancialsChart/FinancialsChart.types.ts` |
| Utils | `src/widgets/Charts/FinancialsChart/FinancialsChart.utils.ts` |
| Bar options hook | `src/widgets/Charts/FinancialsChart/useBarOptions.ts` |
| Styles | `src/widgets/Charts/FinancialsChart/FinancialsChart.styles.ts` |

---

# File: ClientForm.md — `widgets/Forms/ClientForm/ClientForm.md`

# Widget: ClientForm

## Purpose

Виджет формы создания/редактирования клиента в кэше. Отображает многосекционную форму с полями: наименование, идентификаторы, главный менеджер, реквизиты, отрасли, холдинг и прочее. Валидация осуществляется через Yup-схему. Используется внутри модального окна `ControlClientModal`.

## Layout

```
FormConstructor
├── Tab: "Name"          — короткое имя, ФИО, тип клиента, папка ECM
├── Tab: "Identifiers"   — ID клиента, Party Id, CRM ID, Report ID
├── Tab: "Main manager"  — главный менеджер
├── Tab: "Requisites"    — ИНН, КПП, ОГРН, КИО
├── Tab: "Industries"    — коды и названия отраслей, макроотраслей, сегментов
├── Tab: "Holding"       — ID и название холдинга
└── Tab: "Other"         — тербанк, куратор дивизиона, дата обновления, резидентность, статусы
```

## Components

| Component | Import | Props |
|---|---|---|
| `FormConstructor` | `@sber-ibp/uikit` | `formId` ('CreateClient' / 'UpdateClient'), `formTemplate` (from `formTemplate(formId)`), `dictionaries={emptyObject}`, `onSubmit`, `methods` (react-hook-form) |
| `useForm` | `@sber-ibp/uikit` | `defaultValues` (selectedClient + formatted updateDate), `mode="onChange"`, `resolver` (yupResolver from `createClientSchema()`) |

## States

### Loading
Явная обработка состояния загрузки не реализована. Форма рендерится сразу с `defaultValues`.

### Empty
При создании нового клиента (`selectedClient` не передан) поля инициализируются пустыми значениями (все поля nullable).

### Error
Валидация полей осуществляется через Yup-схему `createClientSchema()`. Ошибки валидации отображаются средствами `react-hook-form` + `FormConstructor`. Обязательные поля: `objectId` (required), `partyId` (required).

### Disabled
Поле `partyId` переключается в `disabled` при `formId === 'UpdateClient'` — нельзя изменить Party Id при редактировании.

## Data dependencies

### API hooks
Нет прямых API-вызовов. Форма делегирует отправку данных через колбэк `onSubmit`, предоставляемый родительским компонентом.

### Redux store
Нет прямого использования `useSelector`/`useDispatch`.

### Permissions
Нет проверок прав доступа на уровне виджета. Доступность определяется родительским компонентом (`ControlClientModal`).

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/widgets/Forms/ClientForm/ClientForm.tsx` |
| Form template config | `src/widgets/Forms/ClientForm/ClientForm.const.ts` |
| Validation schema | `src/widgets/Forms/ClientForm/ClientForm.schema.ts` |
| Types | `src/widgets/Forms/ClientForm/ClientForm.types.ts` |

---

# File: GoalsPopoverBadge.md — `widgets/GoalsPopoverBadge/GoalsPopoverBadge.md`

# Widget: GoalsPopoverBadge

## Purpose

Бейдж-индикатор наличия целей у клиента. Отображает метку «Цели зафиксированы» с иконкой цели. При наведении на иконку информации открывается popover со списком целей клиента (стратегические диалоги). Используется в таблицах клиентов для быстрой индикации и просмотра целей.

## Layout

```
ValueBadge (Marker)
├── startIcon: Icon "Target"
├── value: "Goals fixed"
└── endIcon:
    └── Popover (trigger=hover)
        └── content:
            ├── [groupedGoals] Grid > StratDialogueCard × N  — список целей
            ├── [isLoading] GoalsPopoverBadgeSkeleton        — скелетон загрузки
            └── [isError] ErrorBanner                         — ошибка
```

## Components

| Component | Import | Props |
|---|---|---|
| `ValueBadge` | `@sber-ibp/uikit` | `component="Marker"`, `value`, `dataTestId`, `colorThemeSx`, `size="sm"`, `startIcon`, `endIcon` |
| `Popover` | `@sber-ibp/uikit` | `dataTestId`, `title`, `trigger="hover"`, `placement="bottom"`, `size="md"`, `popperSx`, `contentSx`, `offset={[280, 8]}`, `content` |
| `Icon` | `@sber-ibp/uikit` | `name="Target"` / `name="InfoCircle"`, `size="sm"`, `sx` |
| `ErrorBanner` | `@sber-ibp/uikit` | `reason="ServerFail"`, `message` |
| `StratDialogueCard` | local `../Tiles` | `goal` (goal object) |
| `GoalsPopoverBadgeSkeleton` | local `./GoalsPopoverBadge.skeleton` | нет props |

## States

### Loading
При загрузке целей (`isLoading`) внутри popover отображается `GoalsPopoverBadgeSkeleton` — скелетон загрузки.

### Empty
Если цели отсутствуют (`groupedGoals` falsy), блок со списком целей не рендерится. Popover показывает только состояние loading/error или пустое содержимое.

### Error
При ошибке запроса (`isError`) внутри popover отображается `ErrorBanner` с reason `"ServerFail"` и сообщением `error.toString()`.

### Disabled
Свойство `type` может принимать значение `'transparent'`, что меняет цветовое оформление бейджа (через `businessColorSx(type)`) и применяет кастомный стиль к иконке цели (`targetIconSx`).

## Data dependencies

### API hooks
- `GoalsApi.useGetClientGoalsQuery(objectId)` — получение целей клиента по `objectId`

### Redux store
Нет прямого использования `useSelector`/`useDispatch`.

### Permissions
Нет проверок прав доступа на уровне виджета.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/widgets/GoalsPopoverBadge/GoalsPopoverBadge.tsx` |
| Skeleton | `src/widgets/GoalsPopoverBadge/GoalsPopoverBadge.skeleton.tsx` |
| Styles | `src/widgets/GoalsPopoverBadge/GoalsPopoverBadge.styles.ts` |

---

# File: MyClientsHierarchicalTree.md — `widgets/HierarchicalTree/MyClientsHierarchicalTree/MyClientsHierarchicalTree.md`

# Widget: MyClientsHierarchicalTree

## Purpose

Виджет иерархического дерева «Мои клиенты» с группировкой по холдингам. Отображает двухуровневое дерево: первый уровень — холдинги, второй уровень — компании внутри холдинга. Поддерживает сортировку, раскрытие узлов и навигацию на карточку клиента при клике на листовой элемент. Колонки включают данные клиента, холдинга, отрасли, тербанка, GKM и CRM ID.

## Layout

```
HierarchicalTree
├── Level 1: Holdings (холдинги)       — узлы верхнего уровня
│   ├── shortName, fullName, holdingName, inn, industryName, ...
│   └── expandable → Level 2
└── Level 2: Companies (компании)      — листовые узлы
    ├── shortName, fullName, inn, mainManagerFullname, ...
    └── onLeafClick → navigate(`/clients-app/my-clients/${objectId}`)
```

## Components

| Component | Import | Props |
|---|---|---|
| `HierarchicalTree` | `@sber-ibp/uikit` | `key` (with-data/without-data), `dataFetcher`, `maxDepth={2}`, `dataFetcherConfig={{ sortField: 'fullName', sortOrder: 'noDirection' }}`, `nodeIdentifierKey="fullName"`, `dataTestId`, `columns`, `onLeafClick` |

## States

### Loading
Начальная загрузка холдингов выполняется через `ClientsApi.useLazySearchMyClientsHoldingsQuery` в `useEffect`. До получения данных дерево рендерится с `key="without-data"`, после — с `key="with-data"` (перерисовка дерева).

### Empty
При отсутствии холдингов (`holdingsData?.items` пуст) `dataFetcher` возвращает пустой массив — дерево отображается без узлов.

### Error
Ошибки загрузки дочерних компаний логируются в консоль (`console.error`) и возвращается пустой массив. Явная обработка ошибок UI не реализована.

### Disabled
Явная обработка состояния блокировки не реализована.

## Data dependencies

### API hooks
- `ClientsApi.useLazySearchMyClientsHoldingsQuery()` — ленивый запрос списка холдингов. Триггерится в `useEffect` при монтировании.
- `ClientsApi.useLazySearchMyClientsQuery()` — ленивый поиск компаний по `holdingPartyId`. Вызывается в `dataFetcher` при раскрытии узла холдинга.
- `EmployeesApi.useGetEmployeesMutation()` — получение данных сотрудников (менеджеров). Вызывается в `dataFetcher` для заполнения `mainManagerFullname`.

### Redux store
Нет прямого использования `useSelector`/`useDispatch`.

### Permissions
Нет проверок прав доступа на уровне виджета. Доступность определяется родительской страницей `MyClientsPage`.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/widgets/HierarchicalTree/MyClientsHierarchicalTree/MyClientsHierarchicalTree.tsx` |
| Columns config | `src/widgets/HierarchicalTree/MyClientsHierarchicalTree/MyClientsHierarchicalTree.config.ts` |
| Data fetcher utils | `src/widgets/HierarchicalTree/MyClientsHierarchicalTree/MyClientsHierarchicalTree.utils.ts` |
| Types | `src/widgets/HierarchicalTree/MyClientsHierarchicalTree/MyClientsHierarchicalTree.types.ts` |

---

# File: ClientRnpTile.md — `widgets/Tiles/ClientRnpTile/ClientRnpTile.md`

# Widget: ClientRnpTile

## Purpose

Плитка предпросмотра информации о РНП (Регистр Налогоплательщиков Партнёров) выбранного клиента. Отображает идентификаторы клиента (Client Id, RNP ID), контактные данные (телефон, email) и таблицу связей с организациями. Используется как preview-компонент при выборе строки в таблице клиентов РНП.

## Layout

```
BaseTile
├── Title: selectedRow.fullName (полное наименование клиента)
├── Actions:
│   └── IconButton (Close) — закрытие плитки предпросмотра
└── Content (Grid):
    ├── Row 1:
    │   ├── InputText (read) — Client Id (selectedRow.objectId)
    │   └── InputText (read) — RNP ID (selectedRow.partyId)
    ├── Row 2:
    │   ├── InputTemplate — Phone number (из contactInfos типа 'phone')
    │   └── InputTemplate — Email (из contactInfos типа 'email')
    └── Section "Relations with organizations":
        ├── Text H5StrongSmb — заголовок секции
        └── OrganizationsRelationsTable — таблица связей (при наличии прав)
```

## Components

- **BaseTile** (`@sber-ibp/uikit`) — контейнер плитки с заголовком и action-кнопкой. Props: `dataTestId`, `title`, `actions`, `sx`.
- **IconButton** (`@sber-ibp/uikit`) — кнопка закрытия. Props: `name="Close"`, `size="lg"`, `onClick=controller.resetSelectedRowIndex`.
- **InputText** (`@sber-ibp/uikit`) — текстовое поле в режиме чтения. Props: `viewType="read"`, `value`, `label`, `dataTestId`.
- **InputTemplate** (`@sber-ibp/uikit`) — шаблон поля с произвольным контентом. Props: `label`, `children`.
- **Text** (`@sber-ibp/uikit`) — текст для отображения значения контакта. Props: `sx`.
- **Grid** (`@sber-ibp/uikit`) — сетка для layout. Props: `container`, `item`, `spacing`, `sizes` (через `gridSizes`).
- **OrganizationsRelationsTable** (`clients-app/widgets`) — таблица связей клиента с организациями. Props: `relations`.

## States

### Loading
Явная обработка состояния загрузки не реализована. Данные передаются через `selectedRow` из родительского компонента.
### Empty
Отсутствующие значения отображаются как `dashSymbol` (тире). Если `contactInfos` пуст или отсутствует — также отображается `dashSymbol`.
### Error
Явная обработка состояния ошибки не реализована.
### Disabled
Явная обработка состояния блокировки не реализована.

## Data dependencies

### API hooks
Нет прямых вызовов RTK Query. Данные поступают через props `selectedRow` (тип `ClientsRnpTableRowsData`) от родительского preview-контроллера.

### Redux store
Нет прямых селекторов из Redux store.

### Permissions
- `GetRelationTypes` — проверяется через `usePermissions()`. При наличии права отображается таблица `OrganizationsRelationsTable`; при отсутствии — таблица скрывается.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/widgets/Tiles/ClientRnpTile/ClientRnpTile.tsx` |

---

# File: ClientsRnpCacheTile.md — `widgets/Tiles/ClientsRnpCacheTile/ClientsRnpCacheTile.md`

# Widget: ClientsRnpCacheTile

## Purpose

Виджет отображения кэшированных данных РНП-клиентов. Показывает список клиентов РНП в виде бейджей с аватарами, где каждый бейдж содержит полное наименование клиента, тип связи и счётчик дополнительных связей (с tooltip при количестве больше одной). Используется для визуализации связанных РНП-записей внутри плитки `TeamInfoTile`.

## Layout

```
TeamInfoTile (title: "ClientsRnp")
└── Content:
    ├── [if rnpData.length > 0]:
    │   └── List of InfoBadge (по каждому rnp):
    │       ├── Avatar (stringAvatar по fullName)
    │       ├── mainText: rnp.fullName
    │       └── secondaryText:
    │           ├── Text (BodyXSReg) — тип первой связи (formatRelationName)
    │           └── [if relations.length > 1]:
    │               ├── Tooltip — список всех типов связей
    │               └── Counter (+N) — счётчик доп. связей
    └── [if empty]:
        └── Text — "No data"
```

## Components

- **TeamInfoTile** (`clients-app/widgets`) — обёртка-плитка. Props: `title`, `children`.
- **InfoBadge** (`clients-app/entities`) — бейдж с аватаром и текстом. Props: `avatar`, `mainText`, `secondaryText`.
- **Avatar** (`@sber-ibp/uikit`) — аватар, генерируемый из имени клиента через `stringAvatar`. Props: spread из `stringAvatar`, `sx`.
- **Counter** (`@sber-ibp/uikit`) — счётчик количества дополнительных связей. Props: `size="sm"`, `type="read"`, `count`.
- **Tooltip** (`@sber-ibp/uikit`) — всплывающая подсказка со списком всех типов связей. Props: `title`, `type="hint"`, `placement="top"`.
- **Text** (`@sber-ibp/uikit`) — текст типа связи. Props: `type="BodyXSReg"`, `sx`.
- **Grid** (`@sber-ibp/uikit`) — контейнер для tooltip-контента. Props: `container`, `item`, `flexDirection`, `flexWrap`.
- **SxBox** (`@sber-ibp/uikit`) — стилизованные контейнеры для secondary text. Props: `component`, `sx`.

## States

### Loading
Явная обработка состояния загрузки не реализована. Данные передаются через props.
### Empty
При отсутствии данных (`rnpData?.length` falsy) отображается текст "No data" цветом `TextInactive`.
### Error
Явная обработка состояния ошибки не реализована.
### Disabled
Явная обработка состояния блокировки не реализована.

## Data dependencies

### API hooks
Нет прямых вызовов RTK Query. Данные поступают через props `rnpData` (массив с полями `fullName`, `objectId`, `relations` из `RnpSearchRsDto`).

### Redux store
Нет прямых селекторов из Redux store.

### Permissions
Нет проверок прав доступа.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/widgets/Tiles/ClientsRnpCacheTile/ClientsRnpCacheTile.tsx` |
| Styles | `src/widgets/Tiles/ClientsRnpCacheTile/ClientsRnpCacheTile.styles.ts` |

---

# File: ClientTile.md — `widgets/Tiles/ClientTile/ClientTile.md`

# Widget: ClientTile

## Purpose

Главная информационная плитка клиента. Отображает полную карточку выбранного клиента: основную информацию (ФИО, тип клиента, ID), данные ГСЗ, реквизиты (ИНН, ОГРН, КПП и др.), индустриальную классификацию, тербанк, куратора, флаги (резидент, основной клиент, санкции), метрики риска, таблицу РНП и дату обновления. Используется как preview-компонент при выборе строки в таблице клиентов.

## Layout

```
BaseTile
├── Title: selectedRow.shortName (краткое наименование клиента)
├── Actions:
│   ├── ContextMenuButton — контекстное меню (редактировать / обновить из ЕПК)
│   └── IconButton (Close) — закрытие плитки предпросмотра
└── Content (Grid, direction=column):
    ├── Section: MainInfo
    │   ├── InputText — FIO (fullName)
    │   ├── InputText — Client Id (objectId)
    │   ├── InputText — Client's type (legalClientTypeName)
    │   ├── InputText — Party Id (partyId)
    │   ├── InputText — ECM folder (ecmFolder)
    │   ├── InputText — Holding name (holdingName)
    │   ├── InputText — Report ID (reportId)
    │   └── InputText — Main manager (mainManager)
    ├── Section: GSZ (при наличии прав GetGSZ)
    │   ├── InputText — CRM ID GSZ
    │   └── InputText — Name GSZ
    ├── Section: Requisites
    │   ├── InputText — INN
    │   ├── InputText — OGRN
    │   ├── InputText — KPP
    │   ├── InputText — KPP KN
    │   ├── InputText — KIO
    │   └── InputText — Legal address (col=12)
    ├── Section: Industries
    │   ├── InputText — Subindustry code/name
    │   ├── InputText — Industry code/name
    │   ├── InputText — Macro industry code/name
    │   └── InputText — Segment code/name
    ├── Section: Terbank
    │   ├── InputText — Terbank code
    │   └── InputText — Terbank name
    ├── Section: Curator industry division
    │   ├── InputText — Curator industry division code
    │   └── InputText — Curator industry division name
    ├── Section: Checkboxes
    │   ├── InputCheckbox — Resident (isResident)
    │   ├── InputCheckbox — Main client (isClient)
    │   └── InputCheckbox — Sanctioned client (isSanctions)
    ├── RiskMetricsTable (при objectId и правах SearchRiskMetricsByClients)
    ├── RnpTable (при наличии objectId)
    └── Section: Date
        └── InputDate — Update date (updateDate)
```

## Components

- **BaseTile** (`@sber-ibp/uikit`) — контейнер плитки. Props: `dataTestId`, `title`, `actions`, `sx`.
- **IconButton** (`@sber-ibp/uikit`) — кнопка закрытия. Props: `name="Close"`, `size="lg"`, `onClick`.
- **ContextMenuButton** (`@sber-ibp/uikit`) — кнопка контекстного меню. Props: `icon="MoreDots"`, `items`, `onSelectItem`, `size`.
- **InputText** (`@sber-ibp/uikit`) — текстовое поле в режиме чтения. Props: `viewType="read"`, `label`, `value`, `name`.
- **InputCheckbox** (`@sber-ibp/uikit`) — чекбокс в режиме чтения. Props: `label`, `name`, `viewType="read"`, `checked`, `size`.
- **InputDate** (`@sber-ibp/uikit`) — поле даты в режиме чтения. Props: `value`, `label`, `name`, `viewType="read"`.
- **Grid** (`@sber-ibp/uikit`) — сетка. Props: `container`, `item`, `spacing`, `direction`, `rowGap`, `flexWrap`, `flexDirection`, `marginTop`, `sizes`.
- **RiskMetricsTable** (`clients-app/widgets`) — таблица метрик риска клиента. Props: `selectedClientCode`.
- **RnpTable** (`../../Tables`) — таблица РНП клиента. Props: `selectedClientCode`.
- **ControlClientModal** (`clients-app/features`) — модальное окно редактирования клиента. Открывается через `useModal`.

## States

### Loading
Состояние загрузки данных ГСЗ обрабатывается через флаг `isFetching` из RTK Query хука. При загрузке или ошибке поля GSZ отображают `dashSymbol`.
### Empty
Отсутствующие значения во всех полях отображаются как `dashSymbol` (тире).
### Error
При ошибке получения GSZ (`isError`) поля CRM ID GSZ и Name GSZ отображают `dashSymbol`. Остальные ошибки не обрабатываются явно.
### Disabled
Явная обработка состояния блокировки не реализована.

## Data dependencies

### API hooks
- `GszApi.useGetGszQuery({ clientObjectId: selectedRow.objectId })` — получение данных ГСЗ (группы связанных значений). Параметр `skip`: запрос не выполняется, если нет `objectId` или нет прав `GetGSZ`.
- `ClientsApi.useLazyRenovationCacheClientQuery()` — ленивый запрос обновления данных клиента из ЕПК. Вызывается из контекстного меню при наличии прав `RenovationCacheClient` и `partyId`.

### Redux store
Нет прямых селекторов из Redux store. Данные поступают через props `selectedRow` (тип `ClientsTableRowsData`).

### Permissions
- `GetGSZ` — определяет видимость секции ГСЗ и выполнение запроса.
- `SearchRiskMetricsByClients` — определяет видимость `RiskMetricsTable`.
- `UpdateClient` — определяет доступность пункта меню «Редактировать».
- `RenovationCacheClient` — определяет доступность пункта меню «Обновить из ЕПК» (дополнительно требует наличия `partyId`).
- Backend UI flag `UPDATE_CLIENT` — флаг с бэкенда, совместно с правом `UpdateClient` управляет пунктом меню редактирования.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/widgets/Tiles/ClientTile/ClientTile.tsx` |
| Context menu hook | `src/widgets/Tiles/ClientTile/ClientTile.hooks.tsx` |
| Client field mapping | `src/widgets/Tiles/ClientTile/ClientTile.utils.ts` |
| Context menu types | `src/widgets/Tiles/ClientTile/ClientTile.types.ts` |
| Dropdown item values | `src/widgets/Tiles/ClientTile/ClientTile.const.tsx` |

---

# File: DocumentsInfoTile.md — `widgets/Tiles/DocumentsInfoTile/DocumentsInfoTile.md`

# Widget: DocumentsInfoTile

## Purpose

Плитка отображения документов клиента из источника ЕКД (Электронный кадровый документооборот). Показает список загруженных документов с возможностью открытия каждого документа (через ECM ticket) и просмотра содержания (IDP-summary). Отображает первые 3 документа по умолчанию с кнопкой раскрытия остальных.

## Layout

```
TileCard (title: "Documents", subtitle: "Source: EKD")
├── [if documentsCount === 0]:
│   └── Text — "no uploaded documents"
└── [if documentsCount > 0]:
    └── Grid (scrollable container, max-height: 300px):
        ├── DocumentRow[] — строки документов (первые 3 видимы)
        │   ├── InfoBadge (avatar: File icon, mainText: retrievalName, secondaryText: "Uploaded: дата")
        │   ├── Button "Open" — открытие документа (при правах GetAcquireTicket)
        │   └── [Summary section] (при правах GetClientDocumentIdpSummary):
        │       ├── Loader / Error icon — состояние загрузки summary
        │       └── Collapsible content — содержание документа с разбивкой по страницам
        └── Button "More documents: N" — раскрытие скрытых документов
```

## Components

- **TileCard** (`@sber-ibp/uikit`) — контейнер плитки. Props: `dataTestId`, `title`, `subtitle`.
- **Button** (`@sber-ibp/uikit`) — кнопки "Open" и "More documents". Props: `type`, `onClick`, `endIcon`, `size`, `sx`.
- **Grid** (`@sber-ibp/uikit`) — scrollable контейнер документов. Props: `container`, `sx`, `item`, `sizes`.
- **Text** (`@sber-ibp/uikit`) — текст пустого состояния. Props: `dataTestId`, `color`.
- **DocumentRow** (`./DocumentRow`) — строка документа. Props: `document`, `canOpenDocument`, `canShowSummary`, `isHidden`, `onOpenDocument`.
  - Содержит: `InfoBadge`, `Avatar`, `Icon`, `Button`, `Loader`, `Text`, `Grid`, `SxBox`.
  - Запрос: `ClientsApi.useGetClientDocumentIdpSummaryQuery(document.objectId)` для получения содержания.
  - Summary отображается с toggle-кнопкой "Show contents"/"Hide contents".
- **GetEcmTicketModal** (`clients-app/features`) — модальное окно для получения ECM-тикета. Открывается через `useModal`.

## States

### Loading
Загрузка содержания документа (IDP-summary) отображается через `Loader` с текстом "Loading" внутри `DocumentRow`. Состояние определяется флагом `isSummaryLoading` из RTK Query хука.
### Empty
Если количество документов равно 0, отображается текст "no uploaded documents" цветом `TextInactive`.
### Error
Ошибка загрузки содержания документа отображается иконкой `CloseCircle` с текстом "Failed to load document contents" внутри `DocumentRow`. Состояние определяется флагом `isSummaryError` из RTK Query хука.
### Disabled
Кнопка "Open" в `DocumentRow` не отображается при отсутствии прав `GetAcquireTicket`. Секция summary не запрашивается и не отображается при отсутствии прав `GetClientDocumentIdpSummary`.

## Data dependencies

### API hooks
- `EcmApi.useLazyGetAcquireTicketQuery()` — ленивый запрос ECM-тикета для открытия документа. Вызывается при нажатии "Open" с параметром `ecmFolder` (folderId из `clientDocuments`). Результат передаётся в модальное окно `GetEcmTicketModal`.
- `ClientsApi.useGetClientDocumentIdpSummaryQuery(document.objectId)` — запрос содержания документа (IDP-summary). Вызывается внутри `DocumentRow` при наличии прав `GetClientDocumentIdpSummary`. Использует `skipToken` для пропуска запроса.

### Redux store
Нет прямых селекторов из Redux store. Данные поступают через props `clientDocuments` (тип `MyClientsStructureRsDto`).

### Permissions
- `GetAcquireTicket` — определяет доступность кнопки "Open" и выполнение запроса ECM-тикета.
- `GetClientDocumentIdpSummary` — определяет доступность загрузки и отображения содержания документа (IDP-summary).

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/widgets/Tiles/DocumentsInfoTile/DocumentsInfoTile.tsx` |
| DocumentRow sub-component | `src/widgets/Tiles/DocumentsInfoTile/DocumentRow.tsx` |
| Styles | `src/widgets/Tiles/DocumentsInfoTile/DocumentsInfoTile.styles.ts` |
| DocumentRow styles | `src/widgets/Tiles/DocumentsInfoTile/DocumentRow.styles.ts` |

---

# File: GigaInfoTile.md — `widgets/Tiles/GigaInfoTile/GigaInfoTile.md`

# Widget: GigaInfoTile

## Purpose

Плитка AI-справки о клиенте на основе данных из DKK360 и Gigachat. Отображает сгенерированный искусственным интеллектом обзор по клиенту в четырёх секциях: "О клиенте" (Company), "ЛПР" (LPR), "Сотрудничество" (Communications) и "Рекомендации" (Attention). Каждая секция может быть отдельно отключена через backend UI-флаги.

## Layout

```
TileCard (title: "Giga reference", subtitle: "Source: DKK360, Gigachat")
├── [if DISABLE_CLIENT_REFERENCE]: return null
├── [if loading]:
│   └── Skeleton (height=24) + Skeleton (height=180)
├── [if no data]:
│   └── Text — "No data"
└── [if has data]:
    └── Grid (gap=4):
        ├── [if !DISABLE_CLIENT_REFERENCE_COMPANY && aboutClientContent]:
        │   ├── Text H6StrongSmb — "About client"
        │   └── TextMultiRow — aboutClientContent (pre-line, auto clamp)
        ├── [if !DISABLE_CLIENT_REFERENCE_LPR && lprContent]:
        │   ├── Text H6StrongSmb — "LPR"
        │   └── TextMultiRow — lprContent
        ├── [if !DISABLE_CLIENT_REFERENCE_COMMUNICATIONS && cooperationContent]:
        │   ├── Text H6StrongSmb — "Cooperation"
        │   └── TextMultiRow — cooperationContent
        └── [if !DISABLE_CLIENT_REFERENCE_ATTENTION && recommendationsContent]:
            ├── Text H6StrongSmb — "Recommendations"
            └── TextMultiRow — recommendationsContent
```

## Components

- **TileCard** (`@sber-ibp/uikit`) — контейнер плитки. Props: `dataTestId="GigaInfo"`, `title`, `subtitle`.
- **Skeleton** (`@sber-ibp/uikit`) — плейсхолдер загрузки. Props: `height`.
- **Grid** (`@sber-ibp/uikit`) — сетка для layout секций. Props: `container`, `item`, `gap`.
- **Text** (`@sber-ibp/uikit`) — заголовки секций. Props: `type="H6StrongSmb"`, `sx`.
- **TextMultiRow** (`@sber-ibp/uikit`) — многострочный текст контента секций. Props: `dataTestId`, `whiteSpace="pre-line"`, `lineClamp="auto"`, `sx`.
- **SxBox** (`@sber-ibp/uikit`) — контейнер для skeleton. Props: `sx`, `mt`.

## States

### Loading
При `isLoading === true` или `isLoadingUIFlags === true` отображаются два `Skeleton` (высотой 24px и 180px) внутри плитки.
### Empty
При отсутствии данных (`!hasData` — все четыре секции контента пусты) отображается текст "No data" цветом `TextInactive`.
### Error
Явная обработка состояния ошибки не реализована. Ошибки загрузки не перехватываются компонентом.
### Disabled
При активном backend UI-флаге `DISABLE_CLIENT_REFERENCE` компонент возвращает `null` (полностью скрывается). Отдельные секции скрываются флагами `DISABLE_CLIENT_REFERENCE_COMPANY`, `DISABLE_CLIENT_REFERENCE_LPR`, `DISABLE_CLIENT_REFERENCE_ATTENTION`, `DISABLE_CLIENT_REFERENCE_COMMUNICATIONS`.

## Data dependencies

### API hooks
Нет прямых вызовов RTK Query. Данные поступают через props `clientReference` (тип `ClientReferencesRsDto` — массив записей с полями `code` и `content`) и `isLoading`.

### Redux store
Нет прямых селекторов из Redux store.

### Permissions
Нет проверок прав доступа. Управление видимостью осуществляется через backend UI-флаги.

### Backend UI flags
- `DISABLE_CLIENT_REFERENCE` — глобальный флаг скрытия всей плитки.
- `DISABLE_CLIENT_REFERENCE_COMPANY` — скрытие секции "About client".
- `DISABLE_CLIENT_REFERENCE_LPR` — скрытие секции "LPR".
- `DISABLE_CLIENT_REFERENCE_COMMUNICATIONS` — скрытие секции "Cooperation".
- `DISABLE_CLIENT_REFERENCE_ATTENTION` — скрытие секции "Recommendations".

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/widgets/Tiles/GigaInfoTile/GigaInfoTile.tsx` |
| Content extractor util | `src/widgets/Tiles/GigaInfoTile/GigaInfoTile.utils.ts` |
| Styles | `src/widgets/Tiles/GigaInfoTile/GigaInfoTile.styles.ts` |

---

# File: GoalArchiveSection.md — `widgets/Tiles/GoalArchiveSection/GoalArchiveSection.md`

# Widget: GoalArchiveSection

## Purpose

Сворачиваемая секция архивных стратегических диалогов за определённый год. Отображает заголовок с годом и количеством целей, при раскрытии показывает сетку карточек стратегических диалогов (`StratDialogueCard`). Используется для группировки целей по годам в архивном представлении.

## Layout

```
Grid (sizes=12)
├── Header (SxBox, clickable):
│   ├── Icon — ChevronDown/ChevronRight (индикатор раскрытия)
│   └── Text H5StrongSmb — "{year} ({goals.length})"
└── [if expanded]:
    └── Grid (container, spacing=3):
        └── StratDialogueCard[] (sizes=12/6/4):
            └── StratDialogueCard(goal) — карточка стратегии
```

## Components

- **Grid** (`@sber-ibp/uikit`) — контейнер секции и сетка карточек. Props: `dataTestId`, `sizes`, `item`, `container`, `spacing`, `sx`.
- **Icon** (`@sber-ibp/uikit`) — иконка chevron для индикации состояния раскрытия. Props: `name="ChevronDown"|"ChevronRight"`, `size="sm"`.
- **Text** (`@sber-ibp/uikit`) — заголовок секции с годом и счётчиком. Props: `type="H5StrongSmb"`, `sx`.
- **SxBox** (`@sber-ibp/uikit`) — кликабельный заголовок. Props: `sx`, `onClick`.
- **StratDialogueCard** (`clients-app/features`) — карточка стратегического диалога. Props: `goal` (тип `Goal`).

## States

### Loading
Явная обработка состояния загрузки не реализована.
### Empty
Явная обработка пустого состояния не реализована. При пустом массиве `goals` счётчик отображает "(0)", а сетка раскрытия будет пустой.
### Error
Явная обработка состояния ошибки не реализована.
### Disabled
Явная обработка состояния блокировки не реализована.

### Expand/Collapse
Секция управляет собственным состоянием раскрытия через `useState`. Начальное состояние задаётся пропсом `defaultExpanded`. Клик по заголовку переключает состояние через `toggleExpand`.

## Data dependencies

### API hooks
Нет прямых вызовов RTK Query. Данные поступают через props `goals` (массив объектов типа `Goal`) и `year` (число).

### Redux store
Нет прямых селекторов из Redux store.

### Permissions
Нет проверок прав доступа.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/widgets/Tiles/GoalArchiveSection/GoalArchiveSection.tsx` |
| Props types | `src/widgets/Tiles/GoalArchiveSection/GoalArchiveSection.types.ts` |
| Styles | `src/widgets/Tiles/GoalArchiveSection/GoalArchiveSection.styles.ts` |

---

# File: IndustryInfoTile.md — `widgets/Tiles/IndustryInfoTile/IndustryInfoTile.md`

# Widget: IndustryInfoTile

## Purpose

Плитка индустриальной классификации клиента из источника DID Platform. Отображает шесть бейджей с иконками, описывающих индустриальную принадлежность клиента: подотрасль, отрасль, макроотрасль, сегмент, тербанк и ГОсБ из ЕПК. Каждый бейдж содержит наименование классификатора и подпись с названием категории.

## Layout

```
TileCard (title: "Industry", subtitle: "Source: DID Platform")
└── Grid (flexDirection=column, gap=6):
    └── InfoBadge[] (6 бейджей из industryInfoBadgeConfig):
        ├── Avatar (variant=rounded, bgcolor=SecondaryBG)
        │   └── Icon (size=lg, color=TertiaryDark) — иконка категории
        ├── mainText — значение поля из ucpClientData
        └── secondaryText (isSecondaryTextUp=true) — локализованная подпись
```

Бейджи конфигурации:
1. **Subindustry** — icon: `LayersThree01`, key: `subindustryName`
2. **Industry** — icon: `LayersTwo01`, key: `industryName`
3. **Macro industry** — icon: `LayerSingle`, key: `macroIndustryName`
4. **Segment** — icon: `Factory01`, key: `segmentName`
5. **Terbank** — icon: `Bank`, key: `terBankName`
6. **GOSB from EPC** — icon: `MarkerPin01`, key: `gosbName`

## Components

- **TileCard** (`@sber-ibp/uikit`) — контейнер плитки. Props: `dataTestId="IndustryInfo"`, `title`, `subtitle`.
- **Grid** (`@sber-ibp/uikit`) — вертикальный flex-контейнер бейджей. Props: `container`, `sx`.
- **InfoBadge** (`clients-app/entities`) — бейдж с аватаром и текстом. Props: `avatar`, `mainText`, `secondaryText`, `isSecondaryTextUp`.
- **Avatar** (`@sber-ibp/uikit`) — аватар с иконкой. Props: `variant="rounded"`, `sx`, `children`.
- **Icon** (`@sber-ibp/uikit`) — иконка категории. Props: `name`, `size="lg"`, `sx`.

## States

### Loading
Явная обработка состояния загрузки не реализована.
### Empty
Явная обработка пустого состояния не реализована. Если `ucpClientData` не передан или поле отсутствует, `mainText` будет `undefined`.
### Error
Явная обработка состояния ошибки не реализована.
### Disabled
Явная обработка состояния блокировки не реализована.

## Data dependencies

### API hooks
Нет прямых вызовов RTK Query. Данные поступают через props `ucpClientData` (тип `ClientUcpRsDtoWithOptional`).

### Redux store
Нет прямых селекторов из Redux store.

### Permissions
Нет проверок прав доступа.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/widgets/Tiles/IndustryInfoTile/IndustryInfoTile.tsx` |
| Badge config | `src/widgets/Tiles/IndustryInfoTile/IndustryInfo.config.tsx` |

---

# File: RequisitesInfoTile.md — `widgets/Tiles/RequisitesInfoTile/RequisitesInfoTile.md`

# Widget: RequisitesInfoTile

## Purpose

Плитка реквизитов клиента из источника DID Platform. Отображает ключевые реквизиты юридического лица в режиме чтения: ИНН, ОГРН, КПП, КПП КН, КИО, CRM ID (скрывается при отсутствии) и юридический адрес. Поле адреса отображается в многострочном режиме.

## Layout

```
TileCard (title: "Requisites", subtitle: "Source: DID Platform")
└── Grid (rowGap=6):
    ├── InputText (read) — INN (gridSizes 12/6)
    ├── InputText (read) — OGRN (gridSizes 12/6)
    ├── InputText (read) — KPP (gridSizes 12/6)
    ├── InputText (read) — KPP KN (gridSizes 12/6)
    ├── InputText (read) — KIO (gridSizes 12/6)
    ├── InputText (read) — CRM ID (gridSizes 12/6, hideIfEmpty=true)
    └── InputText (read, multiline) — Legal address (gridSizes 12)
```

## Components

- **TileCard** (`@sber-ibp/uikit`) — контейнер плитки. Props: `dataTestId="RequisitesInfo"`, `title`, `subtitle`.
- **Grid** (`@sber-ibp/uikit`) — контейнер полей. Props: `container`, `item`, `rowGap`, `sizes`.
- **InputText** (`@sber-ibp/uikit`) — текстовое поле в режиме чтения. Props: `viewType="read"`, `label`, `value`, `name`, `multiline`.

## States

### Loading
Явная обработка состояния загрузки не реализована.
### Empty
Отсутствующие значения отображаются как `dashSymbol` (тире). Поле CRM ID скрывается полностью при отсутствии значения (настроено через `hideIfEmpty`).
### Error
Если значение поля имеет тип `boolean` или `object` (не string/number), выбрасывается `Error('Data type not supported')`.
### Disabled
Явная обработка состояния блокировки не реализована.

## Data dependencies

### API hooks
Нет прямых вызовов RTK Query. Данные поступают через props `ucpClientData` (тип `ClientUcpRsDtoWithOptional`).

### Redux store
Нет прямых селекторов из Redux store.

### Permissions
Нет проверок прав доступа.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/widgets/Tiles/RequisitesInfoTile/RequisitesInfoTile.tsx` |
| Input config | `src/widgets/Tiles/RequisitesInfoTile/RequisitesInfo.config.ts` |

---

# File: TeamInfoTile.md — `widgets/Tiles/TeamInfoTile/TeamInfoTile.md`

# Widget: TeamInfoTile

## Purpose

Универсальная обёрточная плитка для отображения информации о команде / связанных лицах. Принимает произвольный контент через `children` и заголовок через `title`. Используется как базовый контейнер другими виджетами (например, `ClientsRnpCacheTile`) для единообразного отображения списков бейджей внутри плитки.

## Layout

```
TileCard (title: {переданный title})
└── Grid (flexDirection=column, gap=6):
    └── {children} — произвольный контент
```

## Components

- **TileCard** (`@sber-ibp/uikit`) — контейнер плитки. Props: `dataTestId="TeamInfo"`, `title`.
- **Grid** (`@sber-ibp/uikit`) — flex-контейнер для дочерних элементов. Props: `container`, `sx`.

## States

### Loading
Явная обработка состояния загрузки не реализована. Обрабатывается дочерними компонентами.
### Empty
Явная обработка пустого состояния не реализована. Обрабатывается дочерними компонентами.
### Error
Явная обработка состояния ошибки не реализована. Обрабатывается дочерними компонентами.
### Disabled
Явная обработка состояния блокировки не реализована.

## Data dependencies

### API hooks
Нет прямых вызовов RTK Query. Компонент является презентационной обёрткой.

### Redux store
Нет прямых селекторов из Redux store.

### Permissions
Нет проверок прав доступа.

## Implementation mapping

| Design Element | Source File |
|---|---|
| Component | `src/widgets/Tiles/TeamInfoTile/TeamInfoTile.tsx` |
| Styles | `src/widgets/Tiles/TeamInfoTile/TeamInfoTile.styles.ts` |
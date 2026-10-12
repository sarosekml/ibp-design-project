# ibp-redesign-v2 — IBP Redesign v2, Аналитик ДИД

Отдельный концепт трека `rnd` для **MS0015**: единый раздел «Лиды», главная
«Мои проекты» и путь лида. Пользователь скопировал v1 в эту папку и поручил
вести редизайн здесь (12.10.2026). Контекстные страницы MS0014 сохранены
локально для сценария «было / стало»; исходный v1 остаётся отдельным прототипом.

Реализован **концепт B** (выбор человека 12.10.2026). Главная —
`pages/HomeBoard.preview.html`, реестр — `pages/LeadsNew.preview.html`,
карточка — `pages/Lead.preview.html?id=L-O166092`. A/B/C сохранены в корне
для будущего сравнения на отдельных страницах. Стадии и разные исходы
«Не беру» / «Клиент отказался» приняты для демо; продвижение ручное.

На главной сейчас оставлены канбан и его управление. Сводка, строка плана
и подборка недели сохранены в комментариях HTML/JS для дальнейшей проработки
по обратной связи пользователя. Подборка доступна в разделе «Лиды».
Хедеры новых таблиц используют общий рендер `IBPR_TABLE.headCell`, как Pipeline.

Канбан: пять рабочих колонок и два исхода; сворачивание через меню колонки.
Открытые колонки делят всю доступную ширину; раскрытие исхода сужает их,
свёртка расширяет. Свёрнутые колонки сохраняют штатную ширину ДС.
Нижние итоги объёма повторяют паттерн pipelineManager-v02 и пересчитываются
по видимым лидам. Viewport расширен до правой и нижней кромки. Компактный
режим убран, в шапке календарь и «+ Новый проект» (создаёт тот же Лид).
Повторные встречи — внутри «Встреча проведена»; старая стадия мигрирует
с сохранением лидов, истории и встреч, в том числе при отмене действия.

Реестр Лиды — headless Table с внешним тулбаром как Portfolio: фильтр слева,
SegmentControl источников справа, подписи и иконки Таблица / По холдингам и настройки.
Холдинги раскрываются штатным Table; настройки колонок переживают фильтр.
Названия групп начинаются слева, стрелка вправо / вниз из CSS TableCell.
TableFilter занимает ширину содержимого, сохраняя место всем источникам.
На главной Доска / Таблица — с иконками рядом с текстом, как PipelineManagement. Девять
оснований показаны квадратными цветными Chip; обязательные сделки красные.
Состав нового демо разнообразен и в подборке, и в работе. Старое демо
обновляется без сброса рабочих решений, встреч и полей.

У 51 скопированного виджета префикс V2: идентификаторы витрины глобальны.
Поле `frontend` и таблица соответствия сохраняют исходные имена продукта.
Новые компоненты: LeadBasisTile, LeadStageTile, LeadHistoryTable,
LeadActionsModal, TransferToPipelineModal, LeadPathWidget.

Сохранение — `ibp-redesign-v2-state`, предпочтение пути — отдельный ключ v2.
Сброс в меню очищает только v2. Сравнение «Было / стало» — в меню и панели.
Проверка: `node apps/core/drafts/ibp-redesign-v2/refs/lead-workflow-check.mjs`.
КФЮЛ и потенциалы РД не включены до уточнения объёма; скоринга и
автоматического продвижения по внешним событиям нет.

Контекстные страницы собраны строго на ДС. Для новых экранов MS0015
предложения расширения ДС перечислены отдельно в каждом концепте.
Постановка, опись источников, решения человека Р1–Р9 и этапы —
`docs/tasks/MS0014-ibp-redesign-context-pages.md`.

- **Роль:** Аналитик ДИД (демо-пользователь «Ким А. С.», деск «SMB Природные
  ресурсы +6»); каталог роли — `design-system/patterns/HomeRoles/ibp-home.js`
  (правка одобрена человеком 10.10.2026, Р1).
- **Источники:** снимки системы `tmp/screens-from-system/` (18 страниц, стенд
  ift) и макеты Pixso `tmp/client page/` (реестр и страница клиента). По решению
  Р9 в `refs/` ничего не хранится, в спеках источники указываются словами.
- **Данные:** демо-данные свои, правдоподобные (ООО «Ромашка», ГК «Цветы»),
  форматами идентификаторов как в системе (сделка `166092`, лид `L-44`,
  продажа `LD-12345`, встреча `M-8904`, задача `169437`).

## Страницы (`pages/`)

Имена страниц и виджетов — имена фронтенда (`docs/tasks/MS0014a-ibp-redesign-frontend-names.md`,
правило имён). Страница с метками `<ds-include>` открывается собранной
`<Имя>.preview.html`; вкладка раздела — параметр `?tab=<страница фронтенда>`.

| Страница | Что | Пара во фронтенде |
|---|---|---|
| `HomePage.html` | Главная: плитки NavTile по группам роли | `core/host-app` HomePage |
| `BindingActiveNewOpportunities.html` | Обязательные сделки: 3 вкладки | `pretrade/opportunities-app` root/binding |
| `PossibleActiveNewOpportunities.html` | Возможные сделки: 3 вкладки (по аналогии, Р4) | root/possible |
| `OpportunityActiveSalesProjects.html` | Проекты продаж CIB: 2 вкладки | root/cib |
| `CampaignsActiveOpportunities.html` | Кампании продаж: 2 вкладки | root/campaigns |
| `MyDeskOpportunities.html` | Pipeline: 4 вкладки и «…» | root/pipeline |
| `Opportunity.html` | Сделка, один экран на все источники (`?source=&id=&tab=`) | Opportunity/Opportunity |
| `OpportunityProduct.html` | Продукт сделки | Opportunity/OpportunityProduct |
| `LeadsPage.html` | Лиды: «Лиды», «Лиды для КМ» | `pretrade/offersources-app` (пара вкладки «Лиды» — вопрос В3) |
| `BindingAllLeadsPage.html` | Обязательные лиды (Р4) | BindingLeadsPage |
| `PossibleAllLeadsPage.html` | Возможные лиды (Р4) | PossibleLeadsPage |
| `PotentialPage.html` | Лид (во фронтенде — «потенциал») | PotentialPage |
| `MyClientsPage.html` | Клиенты: таблица, дерево, пустое состояние | `core/clients-app` MyClients |
| `ClientInfoPage.html` | Клиент: 9 вкладок | ClientInfo (+ ClientInfoDealsPage, ClientInfoFinancials, ClientInfoGoalsPage) |
| `ClientComments.html` | Комментарии клиента | пары нет |
| `MeetingsProtocolsPage.html` | Встречи: реестр и предпросмотр (Splitter) | `ib/ma-opportunities-app` MeetingsProtocols |
| `TasksPage.html` | Задачи: реестр и предпросмотр (Splitter) | `core/tasks-app` TasksPage |
| `AdminPage.html` | Администрирование | `core/host-app` AdminPage |
| `TaskStatesPage.html` | Справочник «Статусы задач» (Splitter) | `core/settings-app` TaskStatesPage |

Спека страницы — `<Имя>.screen.md` рядом. Переходы: меню и плитки ведут на
реестры, строка реестра — на страницу объекта (`Opportunity`, `PotentialPage`,
`ClientInfoPage`). Карта «ключ страницы → файл» и меню — `data/nav-links.js`.

## Виджеты (`widgets/`)

51 виджет: 33 тайла, 15 таблиц, 3 модалки.

| Группа | Виджеты |
|---|---|
| `tables/` | реестры сделок `V2BindingOpportunitiesTable`, `V2PossibleOpportunitiesTable`, `V2OpportunitySalesProjectsTable`, `V2SalesCampaignsTable`, `V2OpportunitiesPipelineTable`; `V2LeadsTable`; `V2MyClientsTable`, `V2MyClientsHierarchicalTree`; `V2MeetingsProtocolsList`; `V2TasksTable`, `V2TaskHistoryTable`; `V2MaPipelineTable`, `V2DcmEcmPipelineTable`; `V2FinancialsTable`; `V2SimpleSettingsTable` |
| `tiles/` | сделка и лид: `V2OpportunityClientTile`, `V2GeneralInformationTile`, `V2StateInformationTile`, `V2DescriptionTile`, `V2TimingTile`, `V2CommentsTile`, `V2FinancialMetricsTile`, `V2ProductsTile`, `V2OpportunityProductTile`, `V2DesksTile`, `V2OpportunityTeamMembersTile`, `V2OpportunityConnectionsTile`, `V2TasksTile`, `V2MeetingsProtocolsTile`, `V2CallReportsTile`, `V2ProductClientTiles`; клиент: `V2IndustryInfoTile`, `V2RequisitesInfoTile`, `V2DocumentsInfoTile`, `V2TeamInfoTile`, `V2RelatedPersonsTile`, `V2ClientNewsTile`, `V2ClientTimingsTile`, `V2GigaInfoTile`, `V2GoalsPopoverBadge`, `V2FinancialsChart`, `V2StratDialogueCard`, `V2GoalArchiveSection`, `V2ClientCreditsList`; предпросмотры `V2MeetingsProtocolsDetails`, `V2TaskPreviewTile`; администрирование `V2LinkNavigationTile`, `V2SimpleSettingsTile` |
| `modals/` | `V2TakeOpportunityToWorkModal`, `V2RefuseFromOpportunityModal`, `V2ChangeTaskStatusModal` |

Таблицы рисует общий рендер `data/registry-table.js` (пары нет, правило имён 8):
вкладки-подфильтры, фильтр `.tfm`, пагинация, компактный режим для вкладки
«Сделки» клиента. Витрина — `apps/local-components/`.

## Данные (`data/`)

`dictionaries.js` (справочники и конфиги реестров), `employees.js`,
`clients.js`, `opportunities.js`, `potentials.js`, `meetings.js`, `tasks.js`,
`store.js` (хранилище: выборки, действия Р7, «просмотрено», sessionStorage),
`nav-links.js` (карта страниц и меню — один источник), `registry-table.js`
(общий рендер реестров). Демо-пользователь и «сегодня» прототипа
зафиксированы, значения детерминированы.

## Панель прототипа

Включена (Р8): сценарии «Неделя аналитика сегодня» и «Встреча родила лид» —
`proto-panel/flows.yaml`, открытие `Alt+Shift+P`.

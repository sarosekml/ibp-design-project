# ibp-redesign-v1 — IBP Redesign v1, Аналитик ДИД

Концепт трека `rnd`: страницы системы IBP, которые человек сохранил под ролью
«Аналитик ДИД», воссозданы на компонентах ДС. Это **часть 1 (MS0014)** — контекст
«как сейчас»: живые соседи и точка сравнения «было / стало» для части 2
(MS0015, `docs/tasks/MS0015-ibp-redesign-leads-concept.md` — единый раздел
«Лиды», новая главная-канбан, путь лида).

Сборка строго на ДС: только компоненты, токены и классы дизайн-системы.
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
| `tables/` | реестры сделок `BindingOpportunitiesTable`, `PossibleOpportunitiesTable`, `OpportunitySalesProjectsTable`, `SalesCampaignsTable`, `OpportunitiesPipelineTable`; `LeadsTable`; `MyClientsTable`, `MyClientsHierarchicalTree`; `MeetingsProtocolsList`; `TasksTable`, `TaskHistoryTable`; `MaPipelineTable`, `DcmEcmPipelineTable`; `FinancialsTable`; `SimpleSettingsTable` |
| `tiles/` | сделка и лид: `OpportunityClientTile`, `GeneralInformationTile`, `StateInformationTile`, `DescriptionTile`, `TimingTile`, `CommentsTile`, `FinancialMetricsTile`, `ProductsTile`, `OpportunityProductTile`, `DesksTile`, `OpportunityTeamMembersTile`, `OpportunityConnectionsTile`, `TasksTile`, `MeetingsProtocolsTile`, `CallReportsTile`, `ProductClientTiles`; клиент: `IndustryInfoTile`, `RequisitesInfoTile`, `DocumentsInfoTile`, `TeamInfoTile`, `RelatedPersonsTile`, `ClientNewsTile`, `ClientTimingsTile`, `GigaInfoTile`, `GoalsPopoverBadge`, `FinancialsChart`, `StratDialogueCard`, `GoalArchiveSection`, `ClientCreditsList`; предпросмотры `MeetingsProtocolsDetails`, `TaskPreviewTile`; администрирование `LinkNavigationTile`, `SimpleSettingsTile` |
| `modals/` | `TakeOpportunityToWorkModal`, `RefuseFromOpportunityModal`, `ChangeTaskStatusModal` |

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

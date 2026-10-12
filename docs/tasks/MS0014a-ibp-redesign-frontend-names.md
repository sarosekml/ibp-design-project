---
id: '014a'
title: 'IBP Redesign v1: имена фронтенда для страниц и подкомпонентов, доработка части 1 по ревью'
status: done
priority: high
effort: large
dependencies: ['MS0014']
tags:
  - core
  - drafts
  - ibp-redesign-v1
  - frontend-names
  - review-fixes
created: 2026-10-10
---

# MS0014a — имена фронтенда и доработка части 1

## Коротко

- **Что.** Две вещи.
  1. Правило: страницы и подкомпоненты прототипа сразу называются так, как во фронтенде. Источник — структура проекта от фронтенд-разработчиков. Собранное в MS0014 переименовать, подкомпоненты вынести в виджеты с этими именами.
  2. Исправить дефекты из [ревью MS0014](MS0014-ibp-redesign-context-pages.review.md). Сюда же — предпросмотр встреч и задач: Splitter рядом с таблицей, как в системе. Допущение исполнителя «предпросмотр под таблицей» снимается.
- **Зачем.** Прототип переезжает во фронтенд один к одному: разработчик находит страницу и виджет по имени. MS0015 строит единую страницу лида из тех же подкомпонентов. Без виджетов и имён ей не на чем строить.
- **Где.** `apps/core/drafts/ibp-redesign-v1/` — тот же концепт, трек `rnd`, строго на ДС (как MS0014).
- **Порядок.**
  1. Блокеры исполнения: реестры и предпросмотры сейчас не работают в браузере.
  2. Имена и вынос подкомпонентов.
  3. Остальные правки.

  Спеки, паспорта и витрина обновляются по ходу. В конце — полная приёмка `screen-reviewer`.

## Решения человека 10.10.2026

| Вопрос | Решение |
|---|---|
| Имена | у нас есть структура проекта от фронтенд-разработчиков; страницы и будущие подкомпоненты называем сразу как там |
| Оформление | отдельная задача MS0014a; ревью реализации MS0014 — отдельным файлом |
| Предпросмотр встреч и задач | допущение исполнителя «предпросмотр под таблицей» исправить |
| Остальное | что доделать, определяет ревью |

## Objective

Каждая страница и каждый подкомпонент концепта носит имя фронтенда или помечен «пары нет». Реестры, фильтры, вкладки, пагинация и предпросмотры работают в браузере без ошибок JS. Подкомпоненты сделки, лида и клиента — виджеты, которые MS0015 берёт без копирования. Гейт зелёный, кроме названных отклонений композиции. Приёмка `screen-reviewer` — PASS.

## 1. Источник имён

| Файл | Что в нём | Как читать |
|---|---|---|
| `docs/misc/project-tree.md` | дерево фронтенда (`ibp-design-spec`): раздел → модуль → `pages/`, `widgets/`, `features/` | точечно, по модулю: `grep -n` по имени модуля и `sed -n` по его диапазону строк |
| README модулей, раздел «Имена фронтенда» | сводка имён по нашим группам (`pages/`, `widgets/tiles/` …) | `grep -n -A12 "Имена фронтенда" apps/<раздел>/<модуль>/README.md` |
| `docs/misc/clients-app-all.md` | полные спеки `clients-app`: состав страниц, тайлов, состояния | по якорю `# File: <Имя>.md` и `sed -n` по разделу; файл 143 КБ — целиком не читать |
| `docs/misc/clients-app-tree.md` | дерево `clients-app` | целиком (7 КБ) |

Модули для этой задачи:
- `pretrade/opportunities-app` — сделки и реестры источников;
- `pretrade/offersources-app` — лиды;
- `core/clients-app` — клиенты;
- `core/tasks-app` — задачи;
- `core/host-app` — главная и администрирование;
- `core/settings-app` — справочники;
- `ib/ma-opportunities-app` — встречи. Модуля встреч стенда, `meetings-protocols-app`, в дереве нет; `MeetingsProtocolsPage` и его виджеты живут здесь.

## 2. Правило имён

Правило для этой задачи, для MS0015 и для всего, что дальше строится в `apps/`.

1. **Страница = страница фронтенда:** `pages/<Имя>.html`. Имя — последний сегмент пути `pages/…/<Имя>.md` в дереве, без `.md`.
2. **Подкомпонент = виджет фронтенда:** `widgets/<группа>/<Имя>/`. Группа — наша (`tiles`, `tables`, `modals`, `context-menus`, `popovers`), имя — фронтенда. Фильтр таблицы фронтенда (`…Filters`) — часть виджета таблицы (TableFilter и `.tfm`), отдельной папкой не заводится; имя записывается в паспорт.
3. **Шапки и бары страниц** (`OpportunityPageBar`, `ClientInfoPageHeader`, `PotentialsRDPageBar`), «мелкие элементы» и `entities` фронтенда живут в разметке страницы. Имя пишется в спеку страницы, в разделе «Пары во фронтенде».
4. **Нет пары** — имя наше, в спеке строка «пары во фронтенде нет».
5. **Пара в модуле другого раздела** (встречи — `ib/ma-opportunities-app`) — имя берём. СБ5 запрещает вшивку чужого виджета, а не имя.
6. **Одно имя в разных модулях с разным содержимым.** Например, `GeneralInformationTile` у сделки (`opportunities-app`) и у лида (`offersources-app`). В концепте это один виджет с вариантом (`data-variant="opportunity|potential"`), обе пары — в паспорте. Разные имена у похожих тайлов (`TimingTile` у сделки и `TimingsTile` у лида) — тоже один виджет: имя модуля сделки, второе имя — в паспорте.
7. **Вкладки раздела** — по вопросу В1.
8. **Общий код без пары** (рендер реестров сделок, меню) — имя наше, без суффикса виджета фронтенда. Копии кода по виджетам не допускаются.

## 3. Страницы: было → стало

Пути — от модуля, `…/` — `pages/`. Пары «вкладка → страница» записываются в спеку страницы.

| Было | Стало | Модуль и путь во фронтенде | Вкладки и их пары |
|---|---|---|---|
| `HomePage` | `HomePage` | `core/host-app` `HomePage/` | — |
| `BindingOpportunities` | `BindingActiveNewOpportunities` | `pretrade/opportunities-app` `root/binding/` | Активные новые — `BindingActiveNewOpportunities`; с изменениями — `BindingActiveModifiedOpportunities`; В архиве — `BindingArchiveOpportunities` |
| `PossibleOpportunities` | `PossibleActiveNewOpportunities` | `root/possible/` | `PossibleActiveNewOpportunities` · `PossibleActiveModifiedOpportunities` · `PossibleArchiveOpportunities` |
| `SalesProjects` | `OpportunityActiveSalesProjects` | `root/cib/` | `OpportunityActiveSalesProjects` · `OpportunityArchiveSalesProjects` |
| `SalesCampaigns` | `CampaignsActiveOpportunities` | `root/campaigns/` | `CampaignsActiveOpportunities` · `CampaignsArchiveOpportunities` |
| `Pipeline` | `MyDeskOpportunities` | `root/pipeline/` | Сделки моего деска — `MyDeskOpportunities`; Мои сделки — `MyOpportunities`; «Упущенные сделки», «Потенциальные сделки ПФ» — среди `PipelineGenericOpportunities`, `DidOpportunities` (В2) |
| `Opportunity` | `Opportunity` | `Opportunity/Opportunity/` | — |
| `OpportunityProduct` | `OpportunityProduct` | `Opportunity/OpportunityProduct/` | — |
| `Leads` | по В3 (кандидат — `OffersToProcessTablePage`) | `pretrade/offersources-app` | «Лиды» — по В3; «Лиды для КМ» — `LeadsForCmPage` |
| `BindingLeads` | `BindingAllLeadsPage` | `BindingLeadsPage/` | — |
| `PossibleLeads` | `PossibleAllLeadsPage` | `PossibleLeadsPage/` | — |
| `Potential` | `PotentialPage` | `PotentialPage/` | — |
| `Clients` | `MyClientsPage` | `core/clients-app` `MyClients/` | «Мои клиенты» — `MyClientsPage`; остальные три — по В4 |
| `Client` | `ClientInfoPage` | `ClientInfo/` | «Общая информация» — `ClientInfoPage`; «Сделки» — `ClientInfoDealsPage`; «Финансовые показатели» — `ClientInfoFinancials`; «Цели» — `ClientInfoGoalsPage`; «Встречи», «Задачи», «Кредиты», «Финансовый анализ», «Новости» — пар нет |
| `ClientComments` | `ClientComments` (пары нет) | — | у сделки и лида свои страницы комментариев — `OpportunityComments`, `PotentialCommentsPage` |
| `Meetings` | `MeetingsProtocolsPage` | `ib/ma-opportunities-app` `MeetingsProtocols/` | вкладки — по В1 |
| `Tasks` | `TasksPage` | `core/tasks-app` | «Мои задачи» — `TasksPage`; «Задачи моего деска» — `TasksOfMyDeskPage` |
| `Admin` | `AdminPage` | `core/host-app` `AdminPage/` | — |
| `TaskStates` | `TaskStatesPage` | `core/settings-app` | — |

Вместе с файлами переименовываются:
- `.screen.md`;
- собранные `.preview.html`;
- `data/nav-links.js`;
- ссылки в страницах, виджетах и данных;
- `proto-panel/flows.yaml`;
- `app.json → home`;
- README концепта.

После — `assemble.mjs`, `hub-build.mjs`, `kit-build.mjs`, `docs-index.mjs`. Старые имена в тексте спек не остаются.

## 4. Подкомпоненты: было → стало

### 4.1 Существующие виджеты

| Было | Стало | Пара и примечание |
|---|---|---|
| `tables/OpportunitiesTable` | `tables/BindingOpportunitiesTable`, `PossibleOpportunitiesTable`, `OpportunitySalesProjectsTable`, `SalesCampaignsTable`, `OpportunitiesPipelineTable` и, по В2, `DidOpportunitiesTable` | Во фронтенде пять отдельных таблиц, и `ClientInfoDealsPage` вшивает их же (`clients-app-all.md`, «ClientInfoDealsPage»). Общий рендер — одна папка с нашим именем (правило 8). Пять виджетов с именами фронтенда несут свой конфиг колонок и вкладок |
| `tables/LeadsTable` | `tables/LeadsTable` | пара есть; `LeadsFilters` — часть виджета |
| `tiles/OpportunityClientTile` | без изменений | у лида пара `ClientTile` (`offersources-app`) — в паспорт |
| `tiles/CommentsTile`, `DesksTile`, `MeetingsProtocolsTile` | без изменений | пары в обоих модулях — в паспорт |
| `tiles/OpportunityConnectionsTile` | без изменений | у лида — `ConnectionsTile` |
| `tiles/OpportunityTeamMembersTile` | без изменений | у лида — `PotentialTeamTile` |
| `tiles/OpportunityProductTile` | без изменений | — |
| `tiles/TaskPreviewTile` | без изменений | `core/tasks-app` |
| `tiles/MeetingPreviewTile` | `tiles/MeetingsProtocolsDetails` | `ib/ma-opportunities-app`; кнопки «Завершить» и «Отменить» — `MeetingUpdateActions` (часть виджета, имя в паспорте) |
| `modals/TakeOpportunityToWorkModal`, `RefuseFromOpportunityModal`, `ChangeTaskStatusModal` | без изменений | пары есть |

### 4.2 Вынести в виджеты (сейчас инлайн)

| Страница | Виджеты (имена фронтенда) | Откуда сейчас |
|---|---|---|
| `Opportunity` | `GeneralInformationTile`, `StateInformationTile`, `DescriptionTile`, `TimingTile`, `FinancialMetricsTile` (часть — `ValuesBlock`), `ProductsTile` (вшивает `OpportunityProductTile`), `TasksTile`, `CallReportsTile` — «Протоколы встреч в рамках проекта продаж», если подтвердится (В5) | разметка и скрипт `Opportunity.html` |
| `OpportunityProduct` | `ProductClientTiles` — «Заёмщик» и «КНР» | `OpportunityProduct.html` |
| `PotentialPage` | `GeneralInformationTile` (вариант `potential`), `PotentialProductsTile` (часть — `PotentialDetailedProductTile`), `TimingTile` с парой `TimingsTile`, если тайл появится | `Potential.html` |
| `ClientInfoPage` | `IndustryInfoTile`, `RequisitesInfoTile`, `DocumentsInfoTile`, `TeamInfoTile` (два экземпляра: главный КМ и команда клиента ДИД), `GigaInfoTile`. Связанные физлица, новости, сроки — пар нет, наши имена | строки в JS `Client.html` |
| `ClientInfoDealsPage` (вкладка) | таблицы вкладки — виджеты-реестры из 4.1 и `LeadsTable` в режиме «по клиенту». Пары вкладки из фронтенда — в спеку: `OffersToProcessTable`, `PotentialsRDTable`, `MaPipelineTable`, `DcmEcmPipelineTable` | `Client.html` |
| `ClientInfoFinancials` (вкладка) | `FinancialsChart` (части — `FinancialChartFilters`, `FinancialChartInfo`, `FinancialsChartLegend`), `FinancialsTable` | `Client.html` |
| `ClientInfoGoalsPage` (вкладка) | `GoalArchiveSection`; `GoalSegmentFilter` (Бизнес / Личные) — в разметке; карточка цели — по спеке `clients-app-all.md`; чип «Цели зафиксированы» с ⓘ — `GoalsPopoverBadge` | `Client.html` |
| `MyClientsPage` | `MyClientsTable` (`MyClientsTableFilters` — часть), `MyClientsHierarchicalTree`; пустое состояние — EmptyState ДС, во фронтенде `ErrorBanner` | `Clients.html` |
| `TasksPage` | `TasksTable` (`TasksTableFilters` — часть), `TaskHistoryTable` | `Tasks.html`, `TaskPreviewTile` |
| `MeetingsProtocolsPage` | `MeetingsProtocolsList` — таблица, `MeetingsProtocolsDetails` — предпросмотр (4.1) | `Meetings.html` |
| `AdminPage` | `LinkNavigationTile` — плитка со ссылками | `Admin.html` |
| `TaskStatesPage` | пара таблицы и предпросмотра — по В6 (кандидаты `SimpleSettingsTable`, `SimpleSettingsTile`) | `TaskStates.html` |

Ряды тайлов и ширины — в разметке страницы. JS только наполняет виджеты данными (ревью, С5).

## 5. Исправления по ревью

Номера — из [ревью](MS0014-ibp-redesign-context-pages.review.md).

| № | Что сделать | Как проверить |
|---|---|---|
| Б1 | Пагинация — по API ДС: разметка `[data-pagination]` с `data-total` / `data-page` / `data-page-size`, перерисовка через `DSPagination.wireAll` или `host.__dsPgn.redraw`. Строки режутся по странице, события `pagechange` и `pagesizechange` обрабатываются. Вызов `bind` убрать | в браузере: «1–50 из N» по числу строк вкладки, листание, смена размера |
| Б1 | Таблицы сделок: фильтр `.tfm` строится, «Краткий отчет» привязан, `mount` возвращает ручку, вкладки меняют строки | «Фильтр» открывает модалку; «В архиве» показывает архивные строки |
| Б2, Б3 | «Встречи» и «Задачи» как в системе: две панели со Splitter ДС, слева таблица, справа предпросмотр выбранной строки, крестик закрывает. Без выбора правая панель скрыта. У «Задач» горизонтальный скролл таблицы внутри левой панели. Обе панели в пределах `.screen--app` на всю высоту, скролл у каждой свой. Тот же каркас — на вкладках «Встречи» и «Задачи» клиента | клик по строке открывает предпросмотр справа; страница целиком не скроллится |
| Б4 | «Фильтр» на «Встречах» и «Задачах» с модалкой `.tfm` | модалка открывается |
| Б5 | Чипы с иконкой — по анатомии Chip из чит-шита: иконка в своём слоте, не в `.chip__label` | на снимке иконки 16 px, подписи с многоточием и тултипом |
| Б6 | Колонка → поле по ключу в описании колонки, не по подписи. «ТБ» показывает ТБ, «CRM ID» — CRM ID | сверка колонок с данными |
| Б7 | «Создать лид», «Переназначить» и формы без источника — по клику ничего (Р6). Toast «Фильтр применён / сброшен» убрать | клик без сообщений |
| Б8 | Все ссылки, меню и шаги панели ведут на собранные `.preview.html` | `proto-panel --check` OK |
| Б9 | Генераты пересобраны | `kit-build --check`, `docs-index --check` OK |
| С1 | Меню — один источник на концепт: построение и подмена пользователя без регулярки по ФИО. Как обойти ложный Б31 сенсора, решает сборщик; не обходится — вопрос, а не копия в 19 страниц | одна правка меню меняет все страницы |
| С2 | Вынос подкомпонентов — раздел 4.2 | спеки страниц ссылаются на виджеты |
| С3 | Одна разметка предпросмотра встречи — виджет; строковый запасной шаблон убрать | `grep PV_MARKUP` пусто |
| С4 | Предпросмотр встречи полностью по ТЗ MS0014 §4.8–4.9: «Общая информация» с иконками, «Участники», чекбоксы, «Повестка» с карточками задач, «Связи»; в «Источнике» — название клиента | сверка со снимком `Встречи.png` и Pixso «Встречи – Предпросмотр» |
| С5 | Ряды и ширины тайлов клиента — в разметке | сенсор читает ширины, Б7 нет |
| С6 | Инлайн-стили и px убрать: отступы — токенами Spacing (`--space-*`, `--gap-*`), начертания и цвета — классами компонентов ДС | `grep -c 'style="'` на странице — только ширины колонок и `grid-template-columns` |
| С7 | «Финансовые метрики» — ReadOnlyField: подпись над значением | подписи целиком |
| С8 | После «Взять в работу» сделка открывается в варианте `pipeline` или у шапки нет действий источника | после подтверждения шапка без «Взять в работу» |
| С9 | Пустой «Продукт» у лида — внутри `.tile__body` | снимок |
| С10 | Подзаголовок «Десков» у клиента — один | снимок |
| С11 | Чипы статуса встреч не обрезаются: ширина колонки по чипу | снимок |
| З1 | Неактивные плитки и ссылки — вид как в системе, без бледного состояния; клик гасится (Р5) | снимок главной и «Администрирования» |
| З2 | Расхождение ссылок «Отчёты для рисков» (каталог и стенд ift) — в спеку главной | спека |
| З3 | Из комментариев `ibp-home.js` убрать номера задач проекта, смысл оставить. Это правка ДС: она согласована ответом Р1, но только в объёме комментариев | `ds-check --all` OK |
| З4 | Непросмотренные строки — модификатор TableCell ДС; нет подходящего — пробел ДС в спеке | спека |
| З5, З6 | Шапка сделки без чипа статуса; у лида тайл «Встречи», «Добавить» в теле | снимок |

Ширины, заданные ТЗ для Opportunity и PotentialPage, сохраняются. Текущий сенсор выдаёт K4 на обеих страницах; исторический Б7 на ряду 4+4 PotentialPage больше не возникает. Причины K4 записаны в спеках.

## 6. Этапы

Длинный маршрут: этап — сессия, в конце `lessons-cli gate` и handoff `apps/core/drafts/ibp-redesign-v1/ibp-redesign-v1.handoff.md`. Проверка поведения — в штатном браузере; статическая приёмка — сенсором и гейтом. Headless и скриптовые снимки запрещены текущим process.md §9; старое указание на `page-snapshot` не применяется. Прогон «в Node» браузер не заменяет.

Смета `ctx-budget.mjs --tz` этого документа (10.10.2026), все прогоны `ВЕРДИКТ: OK`. Э1–Э2 build-main (Table, TableCell, TableFilter, Pagination, Tab, Splitter, Modal, Chip; 700 строк) — запас 90 831. Э4 (Tile, ReadOnlyField, Chip, Checkbox, ProgressBar, Alert, Entity, Buttons, IconButton, Link; 900) — 86 762. Э5 (Tab, SegmentControl, Tile, Entity, Avatar, Chip, Table, TableCell, Chart, DocCard, EmptyState; 1200) — 70 064.

### Э0 · Задача
Этот документ и ревью.

### Э1 · Блокеры исполнения
Б1, Б2, Б4, Б6, Б7, Б8, Б9. Итог — ноль ошибок JS на собранных страницах, гейт без `kit-build`, `docs-index`, `proto-panel`.

### Э2 · Предпросмотр встреч и задач
Б3, С3, С4, С11: Splitter на страницах и вкладках клиента, полный предпросмотр встречи.

### Э3 · Меню и имена страниц
С1, раздел 3: переименование, ссылки, панель, `app.json`, README, спеки.

### Э4 · Подкомпоненты сделки, продукта и лида
Раздел 4.1 (разделение `OpportunitiesTable`) и 4.2 для `Opportunity`, `OpportunityProduct`, `PotentialPage`; С7, С8, С9, З5, З6.

### Э5 · Клиенты и клиент
4.2 для `MyClientsPage` и `ClientInfoPage` по `clients-app-all.md`; С5, С6, С10, Б5 на клиенте.

### Э6 · Задачи, встречи, администрирование, справочник
4.2 для `TasksPage`, `MeetingsProtocolsPage`, `AdminPage`, `TaskStatesPage`; З1, З2, З4.

### Э7 · Правка комментариев ДС, приёмка, закрытие
З3, `ds-check --all`. Полная приёмка `screen-reviewer` — оба чек-листа и сверка с MS0014 и этой задачей. Гейт, handoff, отметки в MS0014: её Э9 «приёмка» снять до PASS.

## Tasks

- [x] Э0: задача и ревью (10.10.2026)
- [ ] Ответы человека на В1–В6 — не получены; работа шла на рекомендациях агента как допущениях (В1 — вариант а; В2–В6 — кандидаты из раздела «Открытые вопросы»), допущения записаны в спеках и паспортах
- [x] Э1: блокеры исполнения (11.10.2026) — общий рендер `data/registry-table.js`, пагинация `DSPagination.row`, фильтр `.tfm`, колонки по ключу
- [x] Э2: предпросмотр встреч и задач (11.10.2026) — Splitter на страницах и вкладках клиента
- [x] Э3: меню и имена страниц (11.10.2026) — `data/nav-links.js` один источник, 19 страниц под именами фронтенда, `flows.yaml`, README
- [x] Э4: подкомпоненты сделки, продукта и лида (11.10.2026) — проверено в браузере, С7, С8, С9, З5, З6 закрыты
- [x] Э5: клиенты и клиент (11.10.2026) — проверено в браузере, С5, С6, С10, Б5, Б6 закрыты
- [x] Э6: задачи, встречи, администрирование, справочник (11.10.2026) — З1, З2, З4 закрыты (З4 — пробел ДС в спеках реестров)
- [x] Э7: комментарии ДС, приёмка, закрытие (12.10.2026) — итоговая приёмка PASS с оговорёнными K4; журнал ДС, гейт и handoff обновлены

## Итог (12.10.2026)

MS0014a завершена: 19 страниц и 51 виджет. Имена и вынос подкомпонентов
согласованы со спеками; добавлена отдельная TaskHistoryTable. Блокеры
исходного ревью закрыты. Начальный предпросмотр без выбора скрыт,
«Переназначить» не открывает форму по Б7. Разметка динамических карточек
берётся из единственного HTML-фрагмента через шаблоны страниц.

[Итоговая приёмка](MS0014a-ibp-redesign-frontend-names.review.md) —
**PASS с оговорёнными отклонениями K4**. Полный гейт:
**ВЕРДИКТ: FAIL (2 из 597)**; оба шага — K4 Opportunity/PotentialPage,
сохранённые по ТЗ и объяснённые в спеках. Старый Б7 PotentialPage больше
не возникает. Остальные проверки прошли. Все 19 страниц проверены в
штатном браузере по HTTP без ошибок JS; file:// отклонён политикой
инструмента, его работоспособность отдельно не подтверждена.

В1–В6 остаются открытыми допущениями; приёмка реализации не заменяет
ответы человека. MS0015 не начата. Реализация не закоммичена и не отправлена.

## Acceptance Criteria

- Имя каждой страницы и каждого виджета концепта — из фронтенда (разделы 3–4) или помечено «пары нет». Старых имён в файлах, ссылках, спеках и панели нет.
- Ноль ошибок JS на всех собранных страницах в штатном браузере.
- Реестры: фильтр `.tfm`, вкладки-подфильтры, пагинация, «Краткий отчет» работают.
- «Встречи» и «Задачи» — Splitter с предпросмотром справа, как в системе.
- Подкомпоненты 4.2 — виджеты с паспортом, fixtures и CHANGELOG. Меню — один источник.
- Все пункты раздела 5 закрыты. Гейт `ВЕРДИКТ: OK`, кроме названных отклонений K4 (Opportunity и PotentialPage). Приёмка `screen-reviewer` — PASS.

## Риски

| Риск | Что делаем |
|---|---|
| Переименование порвёт ссылки, панель и хаб | одна сессия на Э3, затем `proto-panel --check`, `registry-check`, `assemble --check` и открытие всех страниц в штатном браузере |
| Разделение `OpportunitiesTable` даст пять копий кода | общий рендер с нашим именем, у виджетов-обёрток только конфиг (правило 8) |
| Одно имя у двух разных тайлов (сделка и лид) | один виджет с вариантом (правило 6), обе пары в паспорте |
| Снова «готово» без браузера | живые сценарии и консоль штатного браузера; ограничения проверки явно записываются в ревью |
| Сенсор Б31 снова толкнёт копировать меню | решение — в этап Э3; не решается — вопрос человеку, копия запрещена |

## Открытые вопросы

1. **В1. Вкладки раздела — одна страница или страница на вкладку?** Во фронтенде у реестров вкладка — отдельная страница (`BindingActiveNewOpportunities`, `BindingArchiveOpportunities` и т. д.).
   - **Вариант а (предложение агента):** одна страница раздела, файл по странице первой вкладки. Значение `?tab=` — имя страницы фронтенда для этой вкладки, соответствие — в спеке. Это сохраняет Р4 «вкладка — подфильтр» и не множит оболочки страниц.
   - **Вариант б:** файл на каждую страницу фронтенда — около 30 страниц вместо 19, оболочки тонкие, виджет общий.
2. **В2. Вкладки Pipeline.** «Упущенные сделки» и «Потенциальные сделки ПФ» — это `PipelineGenericOpportunities` и `DidOpportunities`, или наоборот? Что скрыто за «…»?
3. **В3. Вкладка «Лиды» раздела «Лиды».** Пары в дереве не нашли. Кандидат — `OffersToProcessTablePage`: на странице клиента таблица «Лиды ДИД» во фронтенде — `OffersToProcessTable`. Подтвердить или дать имя.
4. **В4. Вкладки «Клиенты моего деска», «Избранные клиенты», «Клиенты ДИД»** — какие страницы фронтенда? В `clients-app` есть `ClientsPage` (клиенты в кэше) и `ClientsRnpPage`.
5. **В5. «Протоколы встреч в рамках проекта продаж»** на сделке — это `CallReportsTile`?
6. **В6. Справочник «Статусы задач».** Таблица и предпросмотр — `SimpleSettingsTable` и `SimpleSettingsTile` из `settings-app`?

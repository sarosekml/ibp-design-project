# offersources-app — модуль раздела pretrade

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `pretrade/offersources-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/pretrade/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
offersources-app/
├── README.md
├── pages/    ← пусто
├── widgets/  ← пусто
├── data/     ← пусто
└── refs/     ← пусто
```
<!-- /@tree -->

## Имена фронтенда

Сущности модуля во фронтенде (снято с дерева фронтенда 24.09.2026) —
разложены по нашей форме. Экран или виджет, у которого здесь есть пара, называется
так же: разработчик находит его без перевода (`apps/README.md`, «widgets»).

| Куда у нас | Имена во фронтенде |
|---|---|
| `pages/` | BindingAllLeadsPage, LeadsForCmPage, OfferPage, OffersToProcessTablePage, PossibleAllLeadsPage, PotentialAllTasks, PotentialCommentsPage, PotentialPage, PotentialProductPage, PotentialTeamPage, PotentialsRDTablePage, ToProcessKKBindingLeadsPage, ToProcessKKPossibleLeadsPage, ToProcessTBBindingLeadsPage, ToProcessTBPossibleLeadsPage |
| `widgets/tiles/` | ClientTile, CommentsTile, ConnectionsTile, DescriptionTile, DesksTile, FinancialMetricsSummaryTile, GeneralInformationTile, MeetingsProtocolsTile, OfferClientTile, OfferConnectionsTile, OfferDesksTile, OfferGeneralInformationTile, OfferProductTile, OfferTeamTile, OfferTimingsTile, PotentialDetailedProductTile, PotentialProductClientTiles, PotentialProductsTile, PotentialTasksTile, PotentialTeamTile, StateTile, TaskPreviewTile, TimingsTile |
| `widgets/tables/` | LeadsFilters, LeadsTable, OfferClientTable, PotentialsRDTable, PotentialsRDTableFilters, PotentialsUploadResultTable |
| `widgets/modals/` | AddPotentialsModal, ArchiveLeadsFilterModal, ChangePotentialTaskStatusModal, CreateOpportunityModal, CreatePotentialModal, CreatePotentialProductModal, CreatePotentialTaskModal, CreatePotentialTeamMemberModal, DeclineOfferModal, GeneralInformationModal, LinkLeadToPotentialModal, MeetingProtocolModal, PotentialsCreateLidModal, PotentialsUploadResultModal, PreviewContentKfulDealModal, TakeToWorkOfferModal, UpdateFinancialMetricsModal, UpdateOffersourcesStateModal, UpdatePotentialProductModal — у фронтенда в `features/` и `widgets/` |
| другие виджеты | LeadsMenuButtons, OfferRouteActions, PotentialRoutingActions, PotentialsRDPageBar — своей группы у нас нет: новая группа — в `project.json → appShape.widgetGroups` |
| мелкие элементы | ArchiveLeadsCommentForm, ContentDealView, CreatePotentialForm, DeclineOfferForm, DownloadOffersReportButton, DownloadPotentialsReportButton, GeneralInformationForm, LinkLeadToPotentialForm, OffersourcesBreadCrumbs, PotentialsCreateLidForm, TakeToWorkOfferForm, UpdateFinancialMetricsForm, UpdateOffersourcesStateForm — у фронтенда `features/`; у нас — в разметке страницы или виджета |

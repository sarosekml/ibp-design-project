# opportunities-app — модуль раздела pretrade

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `pretrade/opportunities-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/pretrade/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
opportunities-app/
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
| `widgets/tiles/` | CallReportsTile, ChartBlock, CommentsTile, DeltaVersionBlocks, DescriptionTile, DesksTile, FinancialMetricsTile, GeneralInformationTile, MeetingsProtocolsTile, NotInTeamProductsAlert, OpportunityClientTile, OpportunityConnectionsTile, OpportunityHistoryPreviewTile, OpportunityProductTile, OpportunityTeamMembersTile, PipelinePreviewTile, ProductClientTiles, ProductOfferAlert, ProductsTile, StateInformationTile, TaskPreviewTile, TasksTile, TimingTile, ValuesBlock |
| `widgets/tables/` | BindingOpportunitiesTable, DidOpportunitiesTable, OpportunitiesPipelineTable, OpportunityHistoryTable, OpportunityPipelineViewedTable, OpportunitySalesProjectsTable, PossibleOpportunitiesTable, SalesCampaignsTable, ViewableRowsTable |
| `widgets/modals/` | BookingOpportunityModal, ChangeTaskStatusModal, ClientUpdateModal, ConnectKmModal, CreateOpportunityModal, CreateOpportunityProductModal, CreateOpportunityTaskModal, CreateOpportunityTeamMemberModal, CreateSalesProjectModal, DealSearchModal, GeneralInformationModal, GeneratePresentationPicModal, MainSourceValidationModal, MeetingProtocolModal, NotificationDesksModal, RefuseFromOpportunityModal, TakeOpportunityToWorkModal, UpdateOpportunityConnectionsModal, UpdateOpportunityDescriptionModal, UpdateOpportunityProductModal, UpdateOpportunityStateModal, UpdateOpportunityTeamMemberModal, UpdateOpportunityTimingModal — у фронтенда в `features/` и `widgets/` |
| другие виджеты | BindingActiveModifiedOpportunities, BindingActiveNewOpportunities, BindingArchiveOpportunities, CampaignsActiveOpportunities, CampaignsArchiveOpportunities, DidOpportunities, FinancialMetrics, MyDeskOpportunities, MyOpportunities, Opportunity, OpportunityActiveSalesProjects, OpportunityArchiveSalesProjects, OpportunityComments, OpportunityHistory, OpportunityPageBar, OpportunityProduct, OpportunityTasksMyTasks, OpportunityTasksOfMyDesk, OpportunityTeam, PipelineGenericOpportunities, PossibleActiveModifiedOpportunities, PossibleActiveNewOpportunities, PossibleArchiveOpportunities — своей группы у нас нет: новая группа — в `project.json → appShape.widgetGroups` |
| мелкие элементы | GeneralInformationModalAlert, UpdateOpportunityStateClientAlert, UpdateOpportunityStateGeneralInformationAlert, UpdateOpportunityStateTimingAlert, UpdateOpportunityTimingAlert, UpdateOpportunityTimingForm, ViewedRowTableCellMarker — у фронтенда `features/`; у нас — в разметке страницы или виджета |

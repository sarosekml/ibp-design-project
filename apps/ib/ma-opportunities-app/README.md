# ma-opportunities-app — модуль раздела ib

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `ib/ma-opportunities-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/ib/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
ma-opportunities-app/
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
| `pages/` | Client, DetailedHistory, MeetingsProtocolsPage, OpportunitiesPipeline, OpportunityBuySide, OpportunitySellSide |
| `widgets/tiles/` | BranchInfoTile, BuyerInterestTile, ClientTile, DocumentsTile, LinkedOpportunitiesTile, LinkedOpportunityTile, MeetingsProtocolsTile, OpportunityTermsTile, PaymentScheduleTile, StageInformationTile, TargetBuySideTile, TargetSellSideTile, TeamTile |
| `widgets/tables/` | ClientTeamTable, OpportunitiesPipelineTable |
| `widgets/modals/` | AdditionalClientInfoModal, BranchInfoModal, BuyerInterestModal, CancelMeetingModal, ChangeLinkedOpportunityStageModal, ClientSearchModal, CloneOpportunityModal, CreateOpportunityModal, DownloadReportModal, EditOpportunityNameModal, LinkingOpportunitiesModal, MeetingProtocolModal, NotInTeamModal, OpportunityRefusalModal, OpportunityTermsModal, SendToPotentialsModal, StageInformationModal, SuspendWorkModal, TargetModal, TeamModal — у фронтенда в `features/` и `widgets/` |
| другие виджеты | MeetingUpdateActions, MeetingsProtocolsDetails, MeetingsProtocolsHeader, MeetingsProtocolsList, OpportunitiesPipelineCancelled, OpportunitiesPipelineDefaultPage, OpportunitiesPipelineDueDiligence, OpportunitiesPipelineExternal, OpportunitiesPipelineInProgress, OpportunitiesPipelineMarketing, OpportunitiesPipelineOfferPreparing, OpportunitiesPipelinePotentials, OpportunitiesPipelinePreliminary, OpportunitiesPipelineReview, OpportunitiesPipelineSigningAndClosing, OpportunitiesPipelineSuccessfullyClosed — своей группы у нас нет: новая группа — в `project.json → appShape.widgetGroups` |
| мелкие элементы | BackToEntityButton, CancellationForm, ClientCardList, MeetingProtocolAgreementSubForm, MeetingProtocolParticipantSubForm, MeetingProtocolTopicSubForm, ModalTemplate, OpportunityTitle, OpportunityTitleExtraButtons — у фронтенда `features/`; у нас — в разметке страницы или виджета |

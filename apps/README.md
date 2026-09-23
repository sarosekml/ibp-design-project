# apps — приложения на дизайн-системе IBP

Структура `apps/` повторяет дерево фронтенда IBP (`docs/project-tree.md`):
разделы `core/`, `ib/`, `pretrade/`, `postrade/`, `common/`, `ui-kit/` и
их `*-app/` с теми же вложенными папками (`pages/`, `features/`,
`widgets/`, `shared/` …). Файлы из того дерева не переносятся — только
папки; пустые держатся в git файлом `.gitkeep` (23.09.2026).

Приложение прототипа — любая папка с записью `app.json`, на любой глубине
`apps/`: раздел над ним — просто папка. Концепты и черновики лежат в папке
`drafts/` своего модуля: `ib/drafts/`, `pretrade/drafts/`,
`postrade/drafts/` (с 23.09.2026; общей папки `concepts/` больше нет).
Проекты и концепты различает трек приложения, а не место на диске.

**Внутри `drafts/` структура свободная — это папка для ресерча.** Раскладывать
файлы там можно как угодно: приложение может лежать прямо в `drafts/` (так
`postrade/drafts/` — это Post) или глубже, экраны — вне `pages/`, `id` в
`app.json` — не по имени папки, страница — без записи на хабе. Сторож хаба
там не требует П4, П6 и сверки id, но ссылки (П7) и возврат на хаб (П5)
проверяет: страницы обязаны открываться. По полочкам — строгая форма ниже —
раскладывается всё вне `drafts/`.

Открывать удобнее с хаба проектов — корневой `../index.html`: колонки
«Дизайн-система», «Проекты», «Концепты».

## Структура

```
apps/
├── ds-config.js        ← адрес дизайн-системы (DS_PATH) — единственное место
├── ds-body.js          ← второй тег загрузчика ДС
├── common/
├── core/
│   ├── clients-app/ · documents-app/ · employees-app/ · host-app/
│   └── notifications-app/ · settings-app/ · tasks-app/ · userqueries-app/
├── ib/
│   ├── dcmecm-app/ · ib-payments-app/ · ma-opportunities-app/ · potentials-app/
│   └── drafts/
│       ├── ai-bankster-prototype-mvp/   ← приложение
│       ├── ai-bankster-prototype-v01/   ← приложение
│       └── ai-bankster-prototype-v02/   ← приложение
├── postrade/
│   ├── corporate-requests-app/ · deals-app/ · payments-app/ · post-reports-app/
│   └── drafts/                          ← приложение Post (app.json прямо здесь)
├── pretrade/
│   ├── b3-opportunities-app/ · callreports-app/ · kfulsources-app/
│   ├── offersources-app/ · opportunities-app/ · salesources-app/
│   └── drafts/
│       └── pipeline-manager-kanban/     ← приложение
└── ui-kit/
```

<details>
<summary>Полное дерево папок (без файлов)</summary>

```
apps/
├── common/
├── core/
│   ├── clients-app/
│   │   ├── UcpClientSearchModal/
│   │   │   ├── features/
│   │   │   │   ├── ClientCardList/
│   │   │   │   ├── ClientsModalActions/
│   │   │   │   └── Views/
│   │   │   │       └── UcpClientView/
│   │   │   │           ├── UcpClientInformationView/
│   │   │   │           └── UcpClientReferenceView/
│   │   │   ├── pages/
│   │   │   │   └── UcpClientSearchModal/
│   │   │   └── widgets/
│   │   │       └── Tables/
│   │   │           └── UcpClientTeamTable/
│   │   ├── features/
│   │   │   ├── ControlClientModal/
│   │   │   ├── FinancialsChartFilters/
│   │   │   ├── FinancialsChartInfo/
│   │   │   ├── FinancialsChartLegend/
│   │   │   ├── GetEcmTicketModal/
│   │   │   ├── GoalSegmentFilter/
│   │   │   └── StratDialogueCard/
│   │   │       ├── StratDialogueBadge/
│   │   │       └── StratDialogueUser/
│   │   ├── pages/
│   │   │   ├── ClientInfo/
│   │   │   ├── ClientInfoDeals/
│   │   │   ├── ClientInfoFinancials/
│   │   │   ├── ClientInfoGoals/
│   │   │   ├── Clients/
│   │   │   ├── ClientsRnp/
│   │   │   └── MyClients/
│   │   └── widgets/
│   │       ├── Charts/
│   │       │   └── FinancialsChart/
│   │       ├── Forms/
│   │       │   └── ClientForm/
│   │       ├── GoalsPopoverBadge/
│   │       ├── HierarchicalTree/
│   │       │   └── MyClientsHierarchicalTree/
│   │       └── Tiles/
│   │           ├── ClientRnpTile/
│   │           ├── ClientTile/
│   │           ├── ClientsRnpCacheTile/
│   │           ├── DocumentsInfoTile/
│   │           ├── GigaInfoTile/
│   │           ├── GoalArchiveSection/
│   │           ├── IndustryInfoTile/
│   │           ├── RequisitesInfoTile/
│   │           └── TeamInfoTile/
│   ├── documents-app/
│   │   ├── features/
│   │   │   ├── DocumentResultButton/
│   │   │   └── modals/
│   │   ├── pages/
│   │   └── widgets/
│   │       ├── Modals/
│   │       │   └── DocumentResultsModal/
│   │       ├── Tables/
│   │       │   ├── DocumentResultsTable/
│   │       │   ├── FolderDocumentsTileTable/
│   │       │   ├── FoldersTable/
│   │       │   │   └── FoldersFilters/
│   │       │   ├── ScenariosSettingsTileTable/
│   │       │   └── ScenariosTable/
│   │       │       └── ScenariosFilters/
│   │       └── Tiles/
│   │           ├── FoldersTile/
│   │           └── ScenariosTile/
│   ├── employees-app/
│   │   ├── features/
│   │   │   └── Forms/
│   │   │       ├── CreateEmployeeSearchForm/
│   │   │       └── UpdateEmployeeSearchForm/
│   │   ├── pages/
│   │   └── widgets/
│   │       ├── Modals/
│   │       │   ├── CreateEmployeeModal/
│   │       │   │   └── CardList/
│   │       │   ├── EmployeeBranchesModal/
│   │       │   ├── EmployeeDesksModal/
│   │       │   └── UpdateEmployeesByDeskModal/
│   │       ├── Tables/
│   │       │   ├── BranchesTileTable/
│   │       │   ├── DepartmentsTable/
│   │       │   ├── DesksTable/
│   │       │   │   └── DesksFilters/
│   │       │   ├── DesksTileTable/
│   │       │   ├── EmployeesTable/
│   │       │   │   └── EmployeesFilters/
│   │       │   ├── EmployeesTileTable/
│   │       │   └── SearchTableByDesk/
│   │       └── Tiles/
│   │           ├── DesksTile/
│   │           ├── EmployeesTile/
│   │           └── ProfileInfoTile/
│   ├── host-app/
│   │   ├── features/
│   │   │   ├── AuthorizationExpiredModal/
│   │   │   └── Logout/
│   │   ├── pages/
│   │   │   ├── AdminPage/
│   │   │   ├── HomePage/
│   │   │   ├── LoginPage/
│   │   │   ├── MissingRightsPage/
│   │   │   ├── NotFoundPage/
│   │   │   ├── ServerErrorPage/
│   │   │   └── ServiceVersionPage/
│   │   │       └── ServiceVersionFilters/
│   │   └── widgets/
│   │       ├── BreadcrumbsSection/
│   │       ├── LinkNavigationTile/
│   │       ├── MissingRightsSideBar/
│   │       ├── Sidebar/
│   │       └── SnackbarArea/
│   ├── notifications-app/
│   │   ├── features/
│   │   │   └── StateMarker/
│   │   ├── pages/
│   │   └── widgets/
│   │       ├── Tables/
│   │       │   ├── JournalRecipientsTileTable/
│   │       │   ├── JournalTable/
│   │       │   │   └── JournalFilters/
│   │       │   ├── TemplateParametersTileTable/
│   │       │   └── TemplatesTable/
│   │       │       └── TemplatesFilters/
│   │       └── Tiles/
│   │           ├── JournalTile/
│   │           └── TemplatesTile/
│   ├── settings-app/
│   │   ├── features/
│   │   │   ├── CityForm/
│   │   │   ├── DeskForm/
│   │   │   ├── SettingForm/
│   │   │   │   └── SettingFormFields/
│   │   │   ├── SimpleSettingsForm/
│   │   │   └── TaskTypesForm/
│   │   ├── pages/
│   │   └── widgets/
│   │       ├── ContextMenus/
│   │       ├── Modals/
│   │       │   ├── CitiesModal/
│   │       │   ├── DeprecatedVariantSettingsModal/
│   │       │   ├── DeskModal/
│   │       │   ├── SettingModal/
│   │       │   ├── SettingsValueModal/
│   │       │   ├── SimpleSettingsModal/
│   │       │   └── TaskTypesModal/
│   │       ├── Tables/
│   │       │   ├── CitiesTable/
│   │       │   ├── DeprecatedVariantSettingsTable/
│   │       │   ├── Desks/
│   │       │   │   └── DeskFilters/
│   │       │   ├── RiskSegmentsTable/
│   │       │   ├── Settings/
│   │       │   │   └── SettingsFilters/
│   │       │   ├── SettingsHistoryTable/
│   │       │   ├── SimpleSettingsTable/
│   │       │   │   └── SimpleSettingsFilters/
│   │       │   └── TaskTypesTable/
│   │       └── Tiles/
│   │           ├── CitiesTile/
│   │           ├── DeskTile/
│   │           ├── SettingsTile/
│   │           │   └── SettingsValueItem/
│   │           ├── SimpleSettingsTile/
│   │           └── TaskTypesTile/
│   ├── tasks-app/
│   │   ├── features/
│   │   │   ├── Forms/
│   │   │   │   └── PerformTaskActionForms/
│   │   │   ├── Tabs/
│   │   │   └── buttons/
│   │   │       └── DownloadTasksReportButton/
│   │   ├── pages/
│   │   └── widgets/
│   │       ├── Modals/
│   │       │   └── ChangeTaskStatusModal/
│   │       ├── Tables/
│   │       │   ├── TaskHistoryTable/
│   │       │   └── TasksTable/
│   │       │       └── TasksTableFilters/
│   │       └── Tiles/
│   │           └── TaskPreviewTile/
│   └── userqueries-app/
│       ├── features/
│       │   ├── ChatHistory/
│       │   ├── ChatInputs/
│       │   ├── ChatList/
│       │   ├── ChatTypeSelector/
│       │   └── CreateChatButton/
│       ├── pages/
│       │   └── GigaChatPage/
│       └── widgets/
│           └── GigaChatWidget/
├── ib/
│   ├── dcmecm-app/
│   │   ├── features/
│   │   │   ├── grids/
│   │   │   │   ├── ClientExtendedInfoTileGrid/
│   │   │   │   ├── DealTermsTileGrid/
│   │   │   │   ├── IssuanceConditionsTileGrid/
│   │   │   │   └── StatusTileGrid/
│   │   │   └── modals/
│   │   │       ├── ClientExtendedInfoModal/
│   │   │       ├── ClientSearchModal/
│   │   │       ├── DealTermsModal/
│   │   │       ├── DownloadReportModal/
│   │   │       ├── EditClientAliasModal/
│   │   │       ├── EditDealNameModal/
│   │   │       ├── IssuanceConditionsModal/
│   │   │       ├── StatusModal/
│   │   │       └── TeamModal/
│   │   ├── pages/
│   │   │   ├── Client/
│   │   │   ├── Deal/
│   │   │   ├── DetailedHistory/
│   │   │   ├── Empty/
│   │   │   ├── Issuer/
│   │   │   └── Pipeline/
│   │   └── widgets/
│   │       ├── tables/
│   │       │   └── DealsPipelineTable/
│   │       │       └── DealsPipelinePreviewTile/
│   │       └── tiles/
│   │           ├── ClientExtendedInfoTile/
│   │           ├── ClientTile/
│   │           ├── DealTermsTile/
│   │           ├── DocumentsTile/
│   │           ├── IssuanceConditionsTile/
│   │           ├── IssuerTile/
│   │           ├── LinkedPotentialTile/
│   │           ├── PaymentScheduleTile/
│   │           ├── StatusTile/
│   │           └── TeamTile/
│   ├── drafts/
│   │   ├── ai-bankster-prototype-mvp/   ← приложение (app.json)
│   │   ├── ai-bankster-prototype-v01/   ← приложение (app.json)
│   │   └── ai-bankster-prototype-v02/   ← приложение (app.json)
│   ├── ib-payments-app/
│   │   ├── features/
│   │   │   ├── modals/
│   │   │   │   ├── ActReconPaymentModal/
│   │   │   │   │   └── ActReconPaymentTable/
│   │   │   │   ├── ApprovePaymentModal/
│   │   │   │   ├── CancelPaymentModal/
│   │   │   │   ├── ClientSearchModal/
│   │   │   │   ├── DeclinePaymentModal/
│   │   │   │   ├── DeleteDocumentModal/
│   │   │   │   ├── DuplicatesPaymentsModal/
│   │   │   │   ├── EditDocumentModal/
│   │   │   │   │   └── EditDocumentForm/
│   │   │   │   ├── ExecutionPaymentModal/
│   │   │   │   ├── ExpectedIncomeModal/
│   │   │   │   ├── InvoiceDownloadModal/
│   │   │   │   ├── IssuePaymentModal/
│   │   │   │   └── PaymentModal/
│   │   │   │       └── PaymentModalForm/
│   │   │   ├── tables/
│   │   │   │   └── PaymentTransactionsTable/
│   │   │   └── tiles/
│   │   │       ├── PaidDateTile/
│   │   │       ├── PaymentAccordionPreviewTile/
│   │   │       ├── PaymentAmountTile/
│   │   │       ├── PaymentCounterpartyTile/
│   │   │       ├── PaymentDescriptionTile/
│   │   │       ├── PaymentDocumentsTile/
│   │   │       ├── PaymentEntityTile/
│   │   │       ├── PaymentPreviewTile/
│   │   │       ├── PaymentTaskTile/
│   │   │       └── PaymentTransactionsTile/
│   │   ├── pages/
│   │   │   ├── Documents/
│   │   │   ├── Empty/
│   │   │   ├── Payment/
│   │   │   ├── PaymentSchedule/
│   │   │   └── Register/
│   │   └── widgets/
│   │       └── tables/
│   │           ├── DocumentsTable/
│   │           ├── LinkedPaymentsTable/
│   │           └── PaymentsRegisterTable/
│   ├── ma-opportunities-app/
│   │   ├── features/
│   │   │   ├── Modals/
│   │   │   │   ├── AdditionalClientInfoModal/
│   │   │   │   ├── BranchInfoModal/
│   │   │   │   ├── BuyerInterestModal/
│   │   │   │   ├── CancelMeetingModal/
│   │   │   │   │   └── CancellationForm/
│   │   │   │   ├── ChangeLinkedOpportunityStageModal/
│   │   │   │   ├── ClientSearchModal/
│   │   │   │   │   └── ClientCardList/
│   │   │   │   ├── CloneOpportunityModal/
│   │   │   │   ├── CreateOpportunityModal/
│   │   │   │   ├── DownloadReportModal/
│   │   │   │   ├── EditOpportunityNameModal/
│   │   │   │   ├── LinkingOpportunitiesModal/
│   │   │   │   ├── MeetingProtocolModal/
│   │   │   │   │   ├── MeetingProtocolAgreementSubForm/
│   │   │   │   │   ├── MeetingProtocolParticipantSubForm/
│   │   │   │   │   └── MeetingProtocolTopicSubForm/
│   │   │   │   ├── ModalTemplate/
│   │   │   │   ├── NotInTeamModal/
│   │   │   │   ├── OpportunityRefusalModal/
│   │   │   │   ├── OpportunityTermsModal/
│   │   │   │   ├── SendToPotentialsModal/
│   │   │   │   ├── StageInformationModal/
│   │   │   │   ├── SuspendWorkModal/
│   │   │   │   ├── Target/
│   │   │   │   └── TeamModal/
│   │   │   ├── OpportunityTitle/
│   │   │   ├── OpportunityTitleExtraButtons/
│   │   │   └── buttons/
│   │   ├── pages/
│   │   │   ├── Client/
│   │   │   ├── DetailedHistory/
│   │   │   ├── MeetingsProtocols/
│   │   │   ├── OpportunitiesPipeline/
│   │   │   │   ├── OpportunitiesPipelineCancelled/
│   │   │   │   ├── OpportunitiesPipelineDefaultPage/
│   │   │   │   ├── OpportunitiesPipelineDueDiligence/
│   │   │   │   ├── OpportunitiesPipelineExternal/
│   │   │   │   ├── OpportunitiesPipelineInProgress/
│   │   │   │   ├── OpportunitiesPipelineMarketing/
│   │   │   │   ├── OpportunitiesPipelineOfferPreparing/
│   │   │   │   ├── OpportunitiesPipelinePotentials/
│   │   │   │   ├── OpportunitiesPipelinePreliminary/
│   │   │   │   ├── OpportunitiesPipelineReview/
│   │   │   │   ├── OpportunitiesPipelineSigningAndClosing/
│   │   │   │   └── OpportunitiesPipelineSuccessfullyClosed/
│   │   │   ├── OpportunityBuySide/
│   │   │   └── OpportunitySellSide/
│   │   └── widgets/
│   │       ├── MeetingUpdateActions/
│   │       ├── MeetingsProtocolsDetails/
│   │       ├── MeetingsProtocolsHeader/
│   │       ├── MeetingsProtocolsList/
│   │       ├── Tables/
│   │       │   ├── ClientTeamTable/
│   │       │   └── OpportunitiesPipelineTable/
│   │       └── Tiles/
│   │           ├── BranchInfoTile/
│   │           ├── ClientTile/
│   │           ├── DocumentsTile/
│   │           ├── LinkedOpportunitiesTile/
│   │           ├── LinkedOpportunityTile/
│   │           ├── MeetingsProtocolsTile/
│   │           ├── OpportunityTermsTile/
│   │           ├── PaymentScheduleTile/
│   │           ├── StageInformationTile/
│   │           ├── Target/
│   │           └── TeamTile/
│   └── potentials-app/
│       ├── features/
│       │   └── modals/
│       │       ├── CreateDealModal/
│       │       ├── EditPotentialCommentModal/
│       │       ├── EditPotentialNameModal/
│       │       ├── FundsHoldersModal/
│       │       ├── PotentialBondHoldersUploadPreviewModal/
│       │       │   └── PotentialBondHoldersUploadPreviewTable/
│       │       └── PotentialUploadPreviewModal/
│       │           └── PotentialUploadPreviewTable/
│       ├── pages/
│       │   ├── Empty/
│       │   ├── Potential/
│       │   └── PotentialRegister/
│       └── widgets/
│           ├── tables/
│           │   ├── FundsHoldersTable/
│           │   ├── PotentialTable/
│           │   ├── PotentialTableFlatView/
│           │   └── PotentialsWorkTable/
│           └── tiles/
│               ├── BondTermsTile/
│               ├── ClientTile/
│               ├── CommentTile/
│               ├── FundsHoldersTile/
│               ├── HoldingTile/
│               ├── LinkedDealTile/
│               └── LoanTermsTile/
├── postrade/
│   ├── corporate-requests-app/
│   │   ├── features/
│   │   │   └── Modals/
│   │   │       ├── CloseRequestModal/
│   │   │       ├── CorporateRequestAgreementModal/
│   │   │       ├── CorporateRequestCounterpartyModal/
│   │   │       │   └── CounterpartyCards/
│   │   │       ├── CorporateRequestDealModal/
│   │   │       │   └── DealCards/
│   │   │       ├── CorporateRequestEcmModal/
│   │   │       ├── CorporateRequestPeriodModal/
│   │   │       ├── CorporateRequestTeamModal/
│   │   │       ├── EssenceRequestModal/
│   │   │       └── ResponseToTheClientModal/
│   │   ├── pages/
│   │   │   ├── CorporateRequest/
│   │   │   ├── CorporateRequestNotFoundPage/
│   │   │   ├── CorporateRequests/
│   │   │   └── MailRegister/
│   │   └── widgets/
│   │       ├── Mail/
│   │       ├── Navigator/
│   │       ├── Tables/
│   │       │   ├── CorporateRequestsTable/
│   │       │   └── MailRegisterTable/
│   │       └── Tiles/
│   │           ├── CorporateRequestAgreementTile/
│   │           └── CorporateRequestCounterparty/
│   ├── deals-app/
│   │   ├── features/
│   │   │   ├── DealFinancialInstrumentTile/
│   │   │   ├── buttons/
│   │   │   │   ├── ForecastCashFlowButton/
│   │   │   │   ├── InstrumentContextMenuButton/
│   │   │   │   └── TransferSchemaTileButton/
│   │   │   └── modals/
│   │   │       ├── AdditionalAgreementModal/
│   │   │       │   └── AdditionalAgreementForm/
│   │   │       ├── AgreementSbiRepresentativeModal/
│   │   │       ├── BalanceAndCurrencyModal/
│   │   │       ├── BaseTransferIndexHistoryModal/
│   │   │       ├── CashBalancesModal/
│   │   │       ├── CheckListCreationModal/
│   │   │       ├── CheckListPatchModal/
│   │   │       ├── CollateralAccountingModal/
│   │   │       ├── CollateralAgreementModal/
│   │   │       ├── CollateralBalanceModal/
│   │   │       ├── CollateralDescriptionModal/
│   │   │       ├── CollateralLiabilityModal/
│   │   │       ├── CollateralLocationModal/
│   │   │       ├── CollateralRelatedDealsModal/
│   │   │       ├── CollateralRepaymentModal/
│   │   │       ├── CollateralTIModal/
│   │   │       ├── CommissionAccountingsModal/
│   │   │       ├── CorporateAgreementModal/
│   │   │       ├── CorrectReturnModal/
│   │   │       ├── CounterpartiesEcmModal/
│   │   │       │   └── EcmModal/
│   │   │       ├── DealCollateralCreateModal/
│   │   │       ├── DealCreateModal/
│   │   │       ├── DealDescriptionModal/
│   │   │       ├── DealEirIbsvFixationModal/
│   │   │       ├── DealFinancialInstrumentCreateModal/
│   │   │       ├── DealFinancialInstrumentEditModal/
│   │   │       ├── DealFinancialMetricsModal/
│   │   │       ├── DealMetricsCalculationModal/
│   │   │       ├── DealPeriodModal/
│   │   │       ├── DealProjectInformationModal/
│   │   │       ├── DealTeamModal/
│   │   │       ├── DealTitleModal/
│   │   │       ├── DefaultDealsModal/
│   │   │       ├── DidProductsModal/
│   │   │       ├── DownloadReportModal/
│   │   │       ├── EtsDictionaryModal/
│   │   │       ├── FactualPaymentsRegisterModal/
│   │   │       ├── FinancialDataModal/
│   │   │       ├── FinancialDataUploadModal/
│   │   │       ├── FixationModal/
│   │   │       │   └── FixationModalTile/
│   │   │       │       ├── Ets/
│   │   │       │       └── PreliminaryCalculationButton/
│   │   │       ├── GuaranteesInformationModal/
│   │   │       ├── IDFIModal/
│   │   │       ├── InitialAndAdditionalAgreementsModal/
│   │   │       ├── InstrumentCorporateAgreementModal/
│   │   │       ├── InstrumentRevaluationModal/
│   │   │       ├── InstrumentTransferModal/
│   │   │       │   ├── AccordionProductRow/
│   │   │       │   └── ConfirmTransferGrid/
│   │   │       ├── InstrumentsCounterpartiesModal/
│   │   │       ├── InstrumentsModal/
│   │   │       ├── InterestPeriodsPlanningParametersModal/
│   │   │       ├── KPIModal/
│   │   │       ├── LinkChangeModal/
│   │   │       │   └── FICards/
│   │   │       ├── LoanExternalDataModal/
│   │   │       ├── NavigatorAppointmentOfResponsibleModal/
│   │   │       ├── NavigatorApprovalModal/
│   │   │       ├── NavigatorChangeReasonModal/
│   │   │       ├── NavigatorDealCloseModal/
│   │   │       ├── NavigatorForwardToTransferModal/
│   │   │       ├── OneCModal/
│   │   │       ├── OptionContractTypeModal/
│   │   │       ├── OptionPremiumModal/
│   │   │       ├── OptionStrikeEstimationModal/
│   │   │       ├── OptionWindowsModal/
│   │   │       ├── OutstandingDebtModal/
│   │   │       │   ├── OutstandingDebtDealModal/
│   │   │       │   └── OutstandingDebtTrancheModal/
│   │   │       ├── PartyPaymentsModal/
│   │   │       ├── PickMonthAndYearModal/
│   │   │       ├── PlanningParametersDateModal/
│   │   │       ├── PledgeCostModal/
│   │   │       ├── ProductsModal/
│   │   │       ├── RelatedDealsModal/
│   │   │       ├── RepaymentModal/
│   │   │       ├── SharesStocksAssetTypeModal/
│   │   │       ├── SharesStocksDividendsModal/
│   │   │       ├── SharesStocksPriceAndNominalModal/
│   │   │       ├── TrancheInterestPaymentsModal/
│   │   │       ├── TransferRateHistoryModal/
│   │   │       ├── TransferSchemaModal/
│   │   │       ├── TransferringInstrumentsToFIModal/
│   │   │       └── TreeModal/
│   │   ├── pages/
│   │   │   ├── AgreementSbiRepresentatives/
│   │   │   ├── Cashflow/
│   │   │   ├── ChangesHistory/
│   │   │   ├── ChangesList/
│   │   │   ├── CheckList/
│   │   │   ├── CheckLists/
│   │   │   ├── Collateral/
│   │   │   ├── CollateralAgreement/
│   │   │   ├── CollateralRelatedInstruments/
│   │   │   ├── CommissionAccountings/
│   │   │   ├── Deal/
│   │   │   ├── DealNotFoundPage/
│   │   │   ├── Deals/
│   │   │   ├── DefaultDeals/
│   │   │   ├── DefiniteCycle/
│   │   │   ├── EtsDictionary/
│   │   │   ├── FactualPaymentsRegister/
│   │   │   ├── FinancialData/
│   │   │   ├── FinancialInstrument/
│   │   │   ├── FinancialMetrics/
│   │   │   ├── ForecastCashFlow/
│   │   │   ├── InitialAndAdditionalAgreementsPage/
│   │   │   ├── Instrument/
│   │   │   ├── KPI/
│   │   │   ├── OneCAccounts/
│   │   │   ├── PlanPaymentsDid/
│   │   │   ├── PledgeCost/
│   │   │   ├── Tranche/
│   │   │   └── TransferSchemas/
│   │   └── widgets/
│   │       ├── DetailedChanges/
│   │       ├── ForecastCashFlowBar/
│   │       ├── InitialAndAdditionalAgreementsPageBar/
│   │       ├── Navigator/
│   │       ├── groups/
│   │       │   ├── DealFinancialInstrumentsGroup/
│   │       │   └── TrancheCounterpartiesGroup/
│   │       ├── sections/
│   │       │   ├── AdditionalAgreementsSection/
│   │       │   └── InstrumentPaymentSection/
│   │       ├── tables/
│   │       │   ├── AgreementSbiRepresentativesTable/
│   │       │   ├── CashflowTable/
│   │       │   ├── ChangesHistoryTable/
│   │       │   ├── CheckListFormTable/
│   │       │   ├── CheckListTable/
│   │       │   ├── CurrentPortfolioDidTable/
│   │       │   ├── DefaultDealsTable/
│   │       │   ├── DefiniteCycleTable/
│   │       │   ├── EtsDictionaryTable/
│   │       │   ├── FactualPaymentsRegisterTable/
│   │       │   ├── FinancialDataTable/
│   │       │   ├── FinancialMetricsTable/
│   │       │   ├── FixationHistoryTable/
│   │       │   ├── ForecastCashFlowTable/
│   │       │   ├── KPIMetricsTable/
│   │       │   ├── KPITable/
│   │       │   ├── OneCTable/
│   │       │   └── PlanPaymentsDidTable/
│   │       └── tiles/
│   │           ├── AgreementSbiRepresentativesTile/
│   │           ├── BalanceAndCurrencyTile/
│   │           ├── CashflowTile/
│   │           ├── CollateralAccountingTile/
│   │           ├── CollateralAgreementOnlyTile/
│   │           ├── CollateralAgreementsTile/
│   │           ├── CollateralBalanceTile/
│   │           ├── CollateralDescriptionTile/
│   │           ├── CollateralLiabilityTile/
│   │           ├── CollateralLocationTile/
│   │           ├── CollateralRelatedDealsTile/
│   │           ├── CollateralTITile/
│   │           ├── CommissionAccountingsTile/
│   │           ├── CommissionPaymentsTile/
│   │           ├── CorporateAgreementTile/
│   │           ├── CounterpartiesTile/
│   │           ├── DealDescriptionTile/
│   │           ├── DealEirIbsvFixationTile/
│   │           ├── DealFinancialMetricsTile/
│   │           ├── DealMetricsCalculationTile/
│   │           ├── DealPeriodTile/
│   │           ├── DealProductTreeNew/
│   │           ├── DealRelatedCollateralsTile/
│   │           ├── DealTeamTile/
│   │           ├── DefaultDealsTile/
│   │           ├── DisbursementRepaymentTile/
│   │           ├── EarlyRepaymentsTile/
│   │           ├── ExternalIdTile/
│   │           ├── FinancialInstrumentTile/
│   │           ├── ForecastOfIncomeTile/
│   │           ├── GuaranteesInformationTile/
│   │           ├── IDFITile/
│   │           ├── InitialAndAdditionalAgreementsTile/
│   │           ├── InstrumentBindingTile/
│   │           ├── InstrumentCorporateAgreementTile/
│   │           ├── InstrumentRevaluationTile/
│   │           ├── InterestPaymentsTile/
│   │           ├── InterestPeriodsTile/
│   │           ├── InterestSchemasTile/
│   │           ├── LoanExternalDataTile/
│   │           ├── LoanNrlTranchesTile/
│   │           ├── OneCTile/
│   │           ├── OptionContractTypeTile/
│   │           ├── OptionFinancialDataTile/
│   │           ├── OptionLoanLimitsTile/
│   │           ├── OptionPremiumTile/
│   │           ├── OptionStrikeEstimationTile/
│   │           ├── OptionWindowsTile/
│   │           ├── PledgeCostTile/
│   │           ├── ProjectInformationTile/
│   │           ├── RelatedCorporateAgreementsTile/
│   │           ├── RelationToInstrumentTile/
│   │           ├── SharesStocksAssetTypeTile/
│   │           ├── SharesStocksDividendsTile/
│   │           ├── SharesStocksPriceAndNominalTile/
│   │           ├── SharesStocksSaleTile/
│   │           ├── SummaryTile/
│   │           ├── TileRecalculation/
│   │           ├── TrancheCommissionPeriodsTile/
│   │           ├── TrancheLoanLimitsTile/
│   │           ├── TransferRateTile/
│   │           └── TransferSchemaTile/
│   ├── drafts/   ← приложение (app.json)
│   ├── payments-app/
│   │   ├── features/
│   │   │   ├── buttons/
│   │   │   │   ├── CommissionPeriodsContextMenuButton/
│   │   │   │   └── InterestSchemaTileButton/
│   │   │   └── modals/
│   │   │       ├── BaseIndexHistoryModal/
│   │   │       ├── CommissionPaymentsDetailedCalculationModal/
│   │   │       ├── CommissionPaymentsModal/
│   │   │       ├── CommissionPeriodsModal/
│   │   │       ├── CommissionSchemaModal/
│   │   │       ├── ConfirmMassiveActionsModal/
│   │   │       ├── DisbursementRepaymentModal/
│   │   │       ├── EarlyRepaymentsModal/
│   │   │       ├── ForecastOfIncomeModal/
│   │   │       ├── InterestPeriodModal/
│   │   │       ├── InterestPeriodPartitionModal/
│   │   │       ├── InterestSchemaModal/
│   │   │       ├── LoanLimitsModal/
│   │   │       ├── OverpaymentModal/
│   │   │       ├── PartyPaymentsModal/
│   │   │       ├── PartyPlanPaymentsModal/
│   │   │       ├── PaymentAmountChangingModal/
│   │   │       ├── PlanPaymentsModal/
│   │   │       ├── RateHistoryModal/
│   │   │       ├── RulesForCalculatingInterestModal/
│   │   │       ├── SharesStocksSaleModal/
│   │   │       ├── UploadCommissionPeriodsModal/
│   │   │       ├── UploadForecastOfIncomeModal/
│   │   │       └── UploadInterestPeriodsModal/
│   │   ├── pages/
│   │   │   ├── CommissionPayments/
│   │   │   ├── CommissionPeriods/
│   │   │   ├── CommissionSchemas/
│   │   │   ├── DisbursementRepayment/
│   │   │   │   ├── InstrumentDisbursementRepayment/
│   │   │   │   └── TrancheDisbursementRepayment/
│   │   │   ├── EarlyRepayments/
│   │   │   │   ├── EarlyOptionRepaymentsPage/
│   │   │   │   └── EarlyTrancheRepaymentsPage/
│   │   │   ├── ForecastOfIncome/
│   │   │   ├── InterestPeriods/
│   │   │   │   ├── InstrumentInterestPeriods/
│   │   │   │   └── TrancheInterestPeriods/
│   │   │   ├── InterestSchemas/
│   │   │   │   ├── InstrumentInterestSchemasPage/
│   │   │   │   └── TrancheInterestSchemasPage/
│   │   │   ├── LoanLimits/
│   │   │   ├── PartyPaymentsPage/
│   │   │   ├── PlanPaymentsForDeal/
│   │   │   ├── PlanPaymentsPage/
│   │   │   └── SharesStocksSale/
│   │   └── widgets/
│   │       ├── tables/
│   │       │   ├── CommissionPaymentsTable/
│   │       │   ├── CommissionPeriodsTable/
│   │       │   ├── DisbursementRepaymentTable/
│   │       │   ├── EarlyRepaymentsTable/
│   │       │   ├── ForecastOfIncomeTable/
│   │       │   ├── InterestPeriodsTable/
│   │       │   ├── LoanLimitsTable/
│   │       │   ├── PartyPaymentsTable/
│   │       │   ├── PlanPaymentsForDealTable/
│   │       │   ├── PlanPaymentsTable/
│   │       │   └── SharesStocksSaleTable/
│   │       └── tiles/
│   │           ├── CommissionSchemaTile/
│   │           └── InterestSchemaTile/
│   └── post-reports-app/
│       ├── features/
│       │   ├── EditOcpReportRecordModal/
│       │   ├── FairValueContextMenuButton/
│       │   ├── FinancialCalculationContextMenuButton/
│       │   ├── LinkIconButton/
│       │   ├── Modals/
│       │   │   ├── CalculationUserMetricsModal/
│       │   │   ├── ConfirmUploadActionModal/
│       │   │   ├── CreateFairValueCalculationModal/
│       │   │   ├── CreateIncomeExpensesModal/
│       │   │   ├── CreateOcpReportModal/
│       │   │   ├── CreateReserveModal/
│       │   │   ├── CreateReservesCalculationModal/
│       │   │   ├── CreateRwaReportModal/
│       │   │   ├── EditLimitSumModal/
│       │   │   ├── EditOcpReportRecordModal/
│       │   │   ├── FairValueInstrumentablesUploadFileModal/
│       │   │   ├── FinancialUploadCsvModal/
│       │   │   ├── OcpLimitReportUserValuesModal/
│       │   │   ├── OcpSummaryReportUserValuesModal/
│       │   │   ├── PickMonthAndYearModal/
│       │   │   ├── RwaReportUserMetricsModal/
│       │   │   ├── RwaValuesModal/
│       │   │   ├── UploadReservesModals/
│       │   │   │   ├── ReservesFvComponentsModal/
│       │   │   │   ├── ReservesFvModal/
│       │   │   │   └── ReservesLgdModal/
│       │   │   ├── UserMetricsModal/
│       │   │   ├── _DownloadReportModal/
│       │   │   └── _FairValueUserMetricsModal/
│       │   ├── OcpReportContextMenuButton/
│       │   ├── ReservesRecordApprovalButton/
│       │   ├── ReservesRecordComparisonButton/
│       │   ├── ReservesRecordComparisonDownloadButton/
│       │   ├── ReservesRecordComparisonTabs/
│       │   ├── ReservesRecordContextMenuButton/
│       │   ├── ReservesRegisterUploadFileContextMenuButton/
│       │   ├── RwaReportContextMenuButton/
│       │   └── RwaValuesTabs/
│       └── pages/
│           ├── FairValue/
│           │   ├── FairValueCalculation/
│           │   └── FairValueRegister/
│           ├── Ocp/
│           │   ├── OcpReport/
│           │   └── OcpReports/
│           ├── ReportsOneCNavision/
│           │   ├── AccrualInterestCalculation/
│           │   ├── FinancialCalculation/
│           │   ├── IncomeExpenses/
│           │   ├── OneCData/
│           │   └── OneCDataCheck/
│           ├── Reserves/
│           │   ├── ReservesRecordComparison/
│           │   ├── ReservesRecordPage/
│           │   └── ReservesRegisterPage/
│           └── Rwa/
│               ├── RwaReport/
│               ├── RwaReports/
│               └── RwaValues/
├── pretrade/
│   ├── b3-opportunities-app/
│   │   ├── features/
│   │   │   └── modals/
│   │   │       ├── ContentIntegrationModal/
│   │   │       ├── ResumeActivityConfirmationModal/
│   │   │       └── SendExpertiseResultModal/
│   │   │           └── SendExpertiseResultForm/
│   │   ├── pages/
│   │   │   ├── Opportunity/
│   │   │   ├── administrationDcp/
│   │   │   │   ├── ActivitiesDcp/
│   │   │   │   ├── IncomingRequestsDcp/
│   │   │   │   ├── OpportunityProcessingsDcp/
│   │   │   │   └── OutgoingRequestsDcp/
│   │   │   └── pipelineDcp/
│   │   │       └── MyDeskOpportunities/
│   │   └── widgets/
│   │       ├── opportunity/
│   │       │   ├── OpportunityPageBar/
│   │       │   └── tiles/
│   │       │       ├── ClientTile/
│   │       │       ├── CommentsTile/
│   │       │       ├── DescriptionTile/
│   │       │       ├── DesksTile/
│   │       │       ├── GeneralInfoTile/
│   │       │       ├── ProductsTile/
│   │       │       ├── StatusTile/
│   │       │       └── TeamMembersTile/
│   │       └── tables/
│   │           ├── ActivitiesDcpTable/
│   │           │   └── ActivitiesDcpFilters/
│   │           ├── IncomingRequestsDcpTable/
│   │           │   └── IncomingRequestsDcpFilters/
│   │           ├── OpportunityProcessingsDcpTable/
│   │           │   └── OpportunityProcessingsDcpFilters/
│   │           ├── OutgoingRequestsDcpTable/
│   │           │   └── OutgoingRequestsDcpFilters/
│   │           └── PipelineDCPMyDeskOpportunitiesTable/
│   │               └── PipelineDCPMyDeskOpportunitiesFilters/
│   ├── callreports-app/
│   │   ├── features/
│   │   │   ├── AuthorizationExpiredModal/
│   │   │   ├── CallReportMeetings/
│   │   │   ├── CallReportRelation/
│   │   │   └── LogoutButton/
│   │   ├── pages/
│   │   │   ├── CallReportsPage/
│   │   │   ├── LoginPage/
│   │   │   ├── MissingRightsPage/
│   │   │   ├── ModuleNotAvailablePage/
│   │   │   ├── NotFoundPage/
│   │   │   └── ServerErrorPage/
│   │   └── widgets/
│   │       ├── BreadcrumbsSection/
│   │       ├── CallReportTile/
│   │       ├── CallReportsPageBar/
│   │       ├── Sidebar/
│   │       └── SnackbarArea/
│   ├── drafts/
│   │   └── pipeline-manager-kanban/   ← приложение (app.json)
│   ├── kfulsources-app/
│   │   ├── features/
│   │   │   ├── breadcrumbs/
│   │   │   ├── helpers/
│   │   │   │   └── KfulOpportunityNotifications/
│   │   │   ├── links/
│   │   │   │   └── NavigateToKfulTableLink/
│   │   │   └── modals/
│   │   │       ├── CreateKfulModal/
│   │   │       ├── KfulDeclineToArchiveModal/
│   │   │       ├── KfulDocumentsAnalysisModal/
│   │   │       │   └── KfulDocumentsAnalysisView/
│   │   │       ├── KfulMassCheckAnswersModal/
│   │   │       └── KfulRouteToDeskModal/
│   │   ├── pages/
│   │   │   ├── KfulOpportunities/
│   │   │   ├── KfulOpportunity/
│   │   │   └── KfulPipelineScanner/
│   │   └── widgets/
│   │       ├── KfulOpportunityActions/
│   │       ├── tables/
│   │       │   └── KfulOpportunitiesTable/
│   │       │       ├── KfulOpportunitiesFilters/
│   │       │       └── KfulOpportunitiesReportButton/
│   │       └── tiles/
│   │           ├── DetailInfo/
│   │           ├── KfulDescriptionTile/
│   │           ├── KfulDocumentsTile/
│   │           ├── Party/
│   │           ├── Products/
│   │           └── Team/
│   ├── offersources-app/
│   │   ├── features/
│   │   │   ├── breadcrumbs/
│   │   │   ├── buttons/
│   │   │   │   ├── DownloadOffersReportButton/
│   │   │   │   └── DownloadPotentialsReportButton/
│   │   │   ├── modals/
│   │   │   │   ├── AddPotentialsModal/
│   │   │   │   ├── ArchiveLeadsFilterModal/
│   │   │   │   │   └── ArchiveLeadsCommentForm/
│   │   │   │   ├── ChangePotentialTaskStatusModal/
│   │   │   │   ├── CreateOpportunityModal/
│   │   │   │   ├── CreatePotentialModal/
│   │   │   │   │   └── CreatePotentialForm/
│   │   │   │   ├── CreatePotentialTaskModal/
│   │   │   │   ├── DeclineOfferModal/
│   │   │   │   │   └── DeclineOfferForm/
│   │   │   │   ├── GeneralInformationModal/
│   │   │   │   │   └── GeneralInformationForm/
│   │   │   │   ├── MeetingProtocolModal/
│   │   │   │   ├── PotentialTeamMemberModal/
│   │   │   │   ├── PotentialsCreateLidModal/
│   │   │   │   │   └── PotentialsCreateLidForm/
│   │   │   │   ├── PotentialsUploadResultModal/
│   │   │   │   │   └── PotentialsUploadResultTable/
│   │   │   │   ├── PreviewContentKfulDealModal/
│   │   │   │   │   └── ContentDealView/
│   │   │   │   ├── ProductsModals/
│   │   │   │   │   ├── CreateOpportunityProductModal/
│   │   │   │   │   └── UpdateOpportunityProductModal/
│   │   │   │   ├── UpdateFinancialMetricsModal/
│   │   │   │   │   └── UpdateFinancialMetricsForm/
│   │   │   │   └── UpdateOffersourcesStateModal/
│   │   │   │       └── UpdateOffersourcesStateForm/
│   │   │   └── takeToWork/
│   │   │       ├── LinkLeadToPotentialModal/
│   │   │       │   └── LinkLeadToPotentialForm/
│   │   │       └── TakeToWorkOfferModal/
│   │   │           └── TakeToWorkOfferForm/
│   │   ├── pages/
│   │   │   ├── BindingLeadsPage/
│   │   │   ├── LeadsForCmPage/
│   │   │   ├── OfferPage/
│   │   │   ├── OffersToProcessTablePage/
│   │   │   ├── PossibleLeadsPage/
│   │   │   ├── PotentialCommentsPage/
│   │   │   ├── PotentialPage/
│   │   │   ├── PotentialProductPage/
│   │   │   ├── PotentialTasks/
│   │   │   ├── PotentialTeamPage/
│   │   │   ├── PotentialsRDTablePage/
│   │   │   ├── ToProcessKKBindingLeadsPage/
│   │   │   ├── ToProcessKKPossibleLeadsPage/
│   │   │   ├── ToProcessTBBindingLeadsPage/
│   │   │   └── ToProcessTBPossibleLeadsPage/
│   │   └── widgets/
│   │       ├── LeadsMenu/
│   │       ├── OfferRouteActions/
│   │       ├── PotentialRoutingActions/
│   │       ├── PotentialsRDPageBar/
│   │       ├── previewTiles/
│   │       │   └── TaskPreviewTile/
│   │       ├── tables/
│   │       │   ├── LeadsTable/
│   │       │   │   └── LeadsFilters/
│   │       │   ├── OfferClientTable/
│   │       │   └── PotentialsRDTable/
│   │       │       └── PotentialsRDTableFilters/
│   │       └── tiles/
│   │           ├── OfferTiles/
│   │           │   ├── OfferClientTile/
│   │           │   ├── OfferConnectionsTile/
│   │           │   ├── OfferDesksTile/
│   │           │   ├── OfferGeneralInformationTile/
│   │           │   ├── OfferProductTile/
│   │           │   ├── OfferTeamTile/
│   │           │   └── OfferTimingsTile/
│   │           └── PotentialTiles/
│   │               ├── ClientTile/
│   │               ├── CommentsTile/
│   │               ├── ConnectionsTile/
│   │               ├── DescriptionTile/
│   │               ├── DesksTile/
│   │               ├── FinancialMetricsSummaryTile/
│   │               ├── GeneralInformationTile/
│   │               ├── MeetingsProtocolsTile/
│   │               ├── PotentialProductClientTiles/
│   │               ├── PotentialProductsTile/
│   │               │   └── PotentialDetailedProductTile/
│   │               ├── PotentialTasksTile/
│   │               ├── PotentialTeamTile/
│   │               ├── StateTile/
│   │               └── TimingsTile/
│   ├── opportunities-app/
│   │   ├── features/
│   │   │   ├── ViewableRowsTable/
│   │   │   │   ├── OpportunityPipelineViewedTable/
│   │   │   │   └── ViewedRowTableCellMarker/
│   │   │   └── modals/
│   │   │       ├── BookingOpportunityModal/
│   │   │       ├── ChangeTaskStatusModal/
│   │   │       ├── ClientUpdateModal/
│   │   │       ├── ConnectKmModal/
│   │   │       ├── CreateOpportunityTaskModal/
│   │   │       ├── DealSearchModal/
│   │   │       ├── GeneralInformationModal/
│   │   │       │   └── GeneralInformationModalAlert/
│   │   │       ├── GeneratePresentationPicModal/
│   │   │       ├── MainSourceValidationModal/
│   │   │       ├── MeetingProtocolModal/
│   │   │       ├── NotificationDesksModal/
│   │   │       ├── OpportunityTeamMemberModal/
│   │   │       ├── ProductModals/
│   │   │       │   ├── CreateProductModal/
│   │   │       │   └── UpdateProductModal/
│   │   │       ├── StateManagementModals/
│   │   │       ├── UpdateOpportunityConnectionModal/
│   │   │       ├── UpdateOpportunityDescriptionModal/
│   │   │       ├── UpdateOpportunityStateModal/
│   │   │       │   └── alerts/
│   │   │       │       ├── UpdateOpportunityStateClientAlert/
│   │   │       │       ├── UpdateOpportunityStateGeneralInformationAlert/
│   │   │       │       └── UpdateOpportunityStateTimingAlert/
│   │   │       └── UpdateOpportunityTimingModal/
│   │   │           ├── UpdateOpportunityTimingAlert/
│   │   │           └── UpdateOpportunityTimingForm/
│   │   ├── pages/
│   │   │   ├── Opportunity/
│   │   │   │   ├── FinancialMetrics/
│   │   │   │   ├── Opportunity/
│   │   │   │   │   └── OpportunityPageBar/
│   │   │   │   ├── OpportunityComments/
│   │   │   │   ├── OpportunityHistory/
│   │   │   │   ├── OpportunityProduct/
│   │   │   │   ├── OpportunityTeam/
│   │   │   │   └── opportunityTaskPages/
│   │   │   └── root/
│   │   │       ├── binding/
│   │   │       ├── campaigns/
│   │   │       ├── cib/
│   │   │       ├── pipeline/
│   │   │       └── possible/
│   │   └── widgets/
│   │       ├── tables/
│   │       │   ├── BindingOpportunitiesTable/
│   │       │   ├── DidOpportunitiesTable/
│   │       │   ├── OpportunitiesPipelineTable/
│   │       │   ├── OpportunityHistoryTable/
│   │       │   ├── OpportunitySalesProjectsTable/
│   │       │   ├── PossibleOpportunitiesTable/
│   │       │   └── SalesCampaignsTable/
│   │       └── tiles/
│   │           ├── CommentsTile/
│   │           ├── OpportunityHistoryPreviewTile/
│   │           │   └── DeltaVersionBlocks/
│   │           ├── PipelinePreviewTile/
│   │           ├── TaskPreviewTile/
│   │           └── opportunityTiles/
│   │               ├── CallReportsTile/
│   │               ├── ClientTile/
│   │               ├── DescriptionTile/
│   │               ├── DesksTile/
│   │               ├── FinancialMetricsTile/
│   │               │   ├── ChartBlock/
│   │               │   └── ValuesBlock/
│   │               ├── GeneralInformationTile/
│   │               ├── MeetingsProtocolsTile/
│   │               ├── OpportunityConnectionsTile/
│   │               ├── OpportunityTeamMembersTile/
│   │               ├── ProductClientTiles/
│   │               ├── ProductsTile/
│   │               │   ├── OpportunityDetailProducts/
│   │               │   └── ProductAlerts/
│   │               ├── StateInformationTile/
│   │               ├── TasksTile/
│   │               └── TimingTile/
│   └── salesources-app/
│       ├── features/
│       │   ├── breadcrumbs/
│       │   ├── links/
│       │   │   └── NavigateToSalesTableLink/
│       │   └── modals/
│       │       ├── SalesProjectDeclineModal/
│       │       │   └── SalesProjectDeclineForm/
│       │       └── SalesProjectRouteToDeskModal/
│       │           └── SalesProjectRouteToDeskForm/
│       ├── pages/
│       │   └── SalesProjectPage/
│       └── widgets/
│           ├── SalesProjectRoutingActions/
│           ├── tables/
│           │   └── SalesProjectsTable/
│           │       └── SalesProjectsFilters/
│           └── tiles/
│               ├── SalesProjectClientTile/
│               ├── SalesProjectDescriptionTile/
│               ├── SalesProjectGeneralInformationTile/
│               ├── SalesProjectOffersTile/
│               ├── SalesProjectTeamTile/
│               └── SalesProjectTimingTile/
└── ui-kit/
```

</details>

## Форма приложения

Строгая форма — для приложений вне `drafts/` (в `drafts/` — по образцу, но не обязательно).

```
<раздел>/drafts/<id>/
├── app.json            ← запись приложения: id (= имя папки), track
├── README.md           ← что это за приложение, какой файл открывать
├── pages/              ← экраны и их спеки, все на одной глубине
│   ├── <Имя>.html
│   └── <Имя>.screen.md
├── components/         ← фрагменты модульных экранов (если есть)
├── data/               ← демо-данные обычными <script> (если есть)
├── refs/               ← входящие материалы: ТЗ, экспорты, pdf, скриншоты
├── tools/              ← сборка приложения (если нужна)
├── <Имя>.handoff.md    ← контекст задачи между сессиями (/handoff)
└── <Имя>.concept-A.md  ← текстовые концепты (/concepts)
```

## Дизайн-система: адрес в одном месте

Адрес ДС записан **одной строкой** в `apps/ds-config.js`:

```js
var DS_PATH = "../design-system/";   // путь от папки apps/
```

Переезд ДС — правка этой строки, ни один экран не трогается. Остальное в
файле и `ds-body.js` генерирует `node .agents/tools/boot-build.mjs`; гейт
(шаг `boot`) сверяет логику загрузчика и то, что по адресу лежит `ds.css`
(БТ4). Манифест ссылается на файл: `project.json → designSystem.from`.

Экран подключает ДС двумя тегами — путь до `apps/` зависит от глубины
приложения:

```html
<head>
  <script src="../../../../ds-config.js"></script>       <!-- первым в <head> -->
  …
<body>
  …
  <script src="../../../../ds-body.js" data-ds="scripts/ibp-home.js"></script>
  <script> /* экранный скрипт */ </script>
```

| Где приложение | До `apps/` (загрузчик) | До хаба |
|---|---|---|
| `apps/<раздел>/drafts/<id>/pages/` — ib, pretrade | `../../../../` | `../../../../../index.html` |
| `apps/<раздел>/drafts/pages/` — приложение прямо в `drafts/` (Post) | `../../../` | `../../../../index.html` |
| `apps/<раздел>/<id>/pages/` — приложение прямо в разделе | `../../../` | `../../../../index.html` |
| глубже в `drafts/` | на `../` больше за каждую папку | — |

| Файл | Что делает |
|---|---|
| `ds-config.js` | адрес ДС (`DS_PATH`); вычисляет ДС от собственного адреса, ставит `window.__DS_ROOT`, пишет тегами фавикон и `ds.css`, задаёт переменную `--boot-bg-illustration` — фон стартовой страницы (экран пишет `var(--boot-bg-illustration, none)`) |
| `ds-body.js` | пишет тег `scripts/ds.js` (он сам догружает рантаймы ДС), а следом — дополнительные скрипты ДС из атрибута `data-ds` своего тега |

Теги пишутся через `document.write` во время разбора страницы, поэтому
загрузчик подключается обычным тегом, без `async` и `defer`. Почему не
`.env` и не сборщик: страницы открываются двойным кликом (`file://`), где
нет ни процесса, ни `fetch`. Литерал `design-system/` в экране — блокер
сенсора Б34. До данных приложения — `../data/`.

## Треки

| | `product` | `rnd` |
|---|---|---|
| Что лежит | соответствует настоящей системе | концепты, прототипы, экраны агента |
| Основа | строго компоненты ДС | компоненты ДС |
| Кастомные решения | нельзя | можно, **только если ТЗ прямо их просит** |
| Проверки | сенсор, линтер, сторож хаба | те же самые |
| Кто пишет | человек переносит готовое; агент — только с подтверждением | агент и человек |
| Группа на хабе | `projects` | `concepts` |

Треки описаны в `../project.json`, трек приложения — в его `app.json`.
Осознанное отклонение от ДС по ТЗ записывается в «Открытые вопросы и
допущения» спеки экрана; красный сенсор на нём ожидаем — это не повод молча
переписать экран на ДС и не повод гасить правило.

## Правила

- **Каждое приложение — запись `app.json`**: `id` (каталог), `track`, `title`,
  `desc`, `home` (стартовая страница от каталога приложения), `icon`, при
  необходимости `build` (сборка). Реестр хаба `../hub.js` собирается из них:
  `node .agents/tools/hub-build.mjs`, руками не правится (гейт, шаг `hub`).
  Без записи гейт красный: сторож `registry-check` видит страницу вне реестра.
- **Строка пользователя в футере меню** (`<a class="nav__user">`) ведёт на хаб:
  относительный путь до корневого `index.html` (см. таблицу глубин),
  `aria-label="Хаб проектов"`. Футер из
  `IBPHome.footerHTML(...)` подменяется в экранном скрипте, образец —
  `postrade/drafts/pages/MainPage.html`. В продукте эта строка ведёт в личный кабинет,
  подмена действует только в макетах.
- **Приложение трека `product` агент правит только с подтверждением**: у ролей
  в `../.opencode/opencode.json` правило edit `apps/<путь до приложения>/**` с эффектом `ask`
  стоит после общего разрешения `apps/**` (гейт, `agent-config` КФ7).
- Концепт стал частью настоящей системы — меняется `track` в `app.json`
  (реестр пересобирается, группа записи следует за треком) и права ролей.

## Кто проверяет

Сенсор и линтер — как для любого экрана; реестр, форма приложения и возврат
на хаб — сторож `../.agents/tools/registry-check.mjs` (шаг `registry` в
`lessons-cli gate`):

| Код | Что ловит |
|---|---|
| П1 | реестр не читается, нет обязательного поля, повтор `id`, у приложения нет `root` |
| П2 | иконки нет в `design-system/specs/Icons.md` |
| П3 | `href` или `root` ведут в никуда, `href` вне `root`; `root` не каталог приложения (папка с `app.json`), трек не из манифеста, группа записи не совпадает с треком |
| П4 | `.html` в `apps/` вне записей реестра; ДС не в реестре |
| П5 | строка пользователя меню не ведёт на хаб |
| П6 | экран вне `pages/` приложения или глубже него |
| П7 | относительная ссылка страницы (href, src, data, `__DS_ROOT`) ведёт в никуда — двойным кликом страница откроется без неё |

Исключение — любые папки `fixtures/`. Вручную, из корня проекта:
`node .agents/tools/registry-check.mjs`.

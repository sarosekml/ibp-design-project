# RE0002 · ссылки вне ДС на переезжающие пути (генерат refs-report.mjs — руками не править)

Файлов: 113 — переписать 69, пересобрать 36, история 7.

Колонки: «явн.» — `design-system/<путь>`; «от корня» — путь от корня ДС без префикса, только существующие переезжающие файлы;
«литер.» — литерал раскладки в коде оснастки (`'styles/'`, `` `pages/${…}` ``); «имя» — голое имя папки (`'styles'`), в том числе
чужое `'pages'` папки экранов приложения — разбирается руками. Общие спеки `specs/_*.md` не считаются — они остаются.

## переписать (69)

| Файл | явн. | от корня | литер. | имя | Пример |
|---|--:|--:|--:|--:|---|
| `.agents/agents/ai-designer.md` | 4 |  |  |  | `styles/docs-split.css` `scripts/docs-split.js` |
| `.agents/agents/screen-builder.md` | 5 | 1 |  |  | `scripts/ds.js` `specs/Icons.md` `specs/Layout.md` |
| `.agents/README.md` | 2 |  |  |  | `scripts/ds-lint.js` `scripts/spec-audit.mjs` |
| `.agents/rules/process.md` | 2 | 1 |  |  | `scripts/spec-audit.mjs` `styles/x.css` `scripts/ibp-home.js` |
| `.agents/skills/composition-review/SKILL.md` | 3 |  |  |  | `styles/tile.css` `styles/spacing.css` `styles/typography.css` |
| `.agents/skills/docs-split/SKILL.md` | 4 |  |  |  | `pages/foundations` `styles/docs-split.css` `scripts/docs-split.js` |
| `.agents/skills/docs-split/tooling/docs-split.mjs` |  | 1 | 4 | 4 | `styles/splitter.css` ``styles/${` `'styles/'` |
| `.agents/skills/ds-lookup/SKILL.md` | 12 |  |  |  | `scripts/icons-data.js` `specs/Icons.md` `styles/nav-panel.css` |
| `.agents/skills/lessons/SKILL.md` | 2 |  |  |  | `scripts/ds-lint.js` `scripts/spec-audit.mjs` |
| `.agents/skills/screen-assembly/references/patterns.md` |  | 2 |  |  | `specs/TableFilter.md` `scripts/ds-table-settings.js` |
| `.agents/skills/screen-assembly/SKILL.md` | 2 | 1 |  |  | `scripts/ds.js` `scripts/ds` `specs/Layout.md` |
| `.agents/skills/screen-review/SKILL.md` | 4 | 2 |  |  | `specs/Icons.md` `scripts/ds-check.mjs` `scripts/ds.js` |
| `.agents/skills/screen-spec/references/template.md` | 4 |  |  |  | `specs/Layout.md` `specs/Breadcrumbs.md` `specs/PageHeader.md` |
| `.agents/skills/screen-spec/references/widget-template.md` | 4 |  |  |  | `pages/patterns/LocalComponents.html` `specs/Tile.md` `specs/Avatar.md` |
| `.agents/skills/session-plan/tooling/ctx-budget.mjs` |  |  |  | 1 | `'specs'` |
| `.agents/tools/assemble.mjs` |  | 1 | 1 | 1 | `scripts/ds-include.js` ``scripts/d` `'pages'` |
| `.agents/tools/boot-build.mjs` |  | 4 | 4 |  | `scripts/ibp-home.js` `scripts/ds.js` ``scripts/i` |
| `.agents/tools/fixtures/lint-screens/A7.bad.html` | 1 |  |  |  | `scripts/ds-table.js` |
| `.agents/tools/fragments.mjs` | 1 |  |  |  | `scripts/ds-lint-cli.mjs` |
| `.agents/tools/kit-build.mjs` |  | 1 | 1 | 4 | `scripts/ibp-home.js` `"scripts/i` `'pages'` |
| `.agents/tools/layout-check.mjs` |  | 7 | 4 | 4 | `styles/spacing.css` `styles/layout.css` `styles/tile.css` |
| `.agents/tools/lessons-cli.mjs` |  | 10 | 11 | 2 | `scripts/ds-lint-cli.mjs` `scripts/ds-lint.js` `scripts/spec-audit.mjs` |
| `.agents/tools/manifest-check.mjs` |  |  |  | 2 | `'pages'` |
| `.agents/tools/module-readme.mjs` |  |  | 1 | 4 | ``pages/`` `'pages'` |
| `.agents/tools/project.mjs` |  |  |  | 1 | `'pages'` |
| `.agents/tools/promote.mjs` |  |  |  | 2 | `'pages'` |
| `.agents/tools/proto-panel.mjs` |  |  |  | 3 | `'styles'` `'scripts'` `'pages'` |
| `.agents/tools/readme-stats.mjs` |  | 1 | 2 | 3 | `scripts/icons-data.js` ``pages/{` ``scripts/i` |
| `.agents/tools/registry-check.mjs` | 1 |  | 1 | 3 | `specs/Icons.md` ``pages/`` `'specs'` |
| `.agents/tools/runlog.mjs` |  | 2 | 2 |  | `pages/molecules/InputText.html` `scripts/kit-link.mjs` `"pages/m` |
| `apps/ib/drafts/ai-bankster-prototype-mvp/pages/HomePage.screen.md` | 2 |  |  |  | `scripts/ibp-home.js` |
| `apps/ib/drafts/ai-bankster-prototype-mvp/README.md` | 2 |  |  |  | `scripts/ds.js` `scripts/ibp-home.js` |
| `apps/ib/drafts/ai-bankster-prototype-v01/pages/HomePage.screen.md` | 2 |  |  |  | `scripts/ibp-home.js` |
| `apps/ib/drafts/ai-bankster-prototype-v01/README.md` | 2 |  |  |  | `scripts/ds.js` `scripts/ibp-home.js` |
| `apps/ib/drafts/ai-bankster-prototype-v02/pages/HomePage.screen.md` | 2 |  |  |  | `scripts/ibp-home.js` |
| `apps/ib/drafts/ai-bankster-prototype-v02/README.md` | 2 |  |  |  | `scripts/ds.js` `scripts/ibp-home.js` |
| `apps/local-components/index.html` |  | 1 |  |  | `scripts/ibp-home.js` |
| `apps/local-components/README.md` | 2 |  |  |  | `pages/patterns/LocalComponents.html` |
| `apps/postrade/deals-app/pages/Deal.html` |  | 1 |  |  | `scripts/ibp-home.js` |
| `apps/postrade/deals-app/pages/MainPage.html` |  | 1 |  |  | `scripts/ibp-home.js` |
| `apps/postrade/deals-app/pages/MainPage.screen.md` | 1 |  |  |  | `scripts/ibp-home.js` |
| `apps/postrade/deals-app/pages/Portfolio.html` | 1 | 4 |  |  | `scripts/table-filter.page.js` `specs/TableFilter.md` `specs/Table.md` |
| `apps/postrade/deals-app/pages/Portfolio.screen.md` | 1 | 2 |  |  | `scripts/table-filter.page.js` `scripts/ibp-home.js` `specs/Table.md` |
| `apps/postrade/deals-app/README.md` |  | 1 |  |  | `scripts/ibp-home.js` |
| `apps/postrade/deals-app/widgets/modals/CounterpartiesEcmModal/CounterpartiesEcmModal.md` | 4 |  |  |  | `specs/Modal.md` `specs/EmptyState.md` `specs/Skeleton.md` |
| `apps/postrade/deals-app/widgets/modals/DealDescriptionModal/DealDescriptionModal.md` | 6 |  |  |  | `specs/Modal.md` `specs/InputText.md` `specs/InputAutocomplete.md` |
| `apps/postrade/deals-app/widgets/modals/DealProjectInformationModal/DealProjectInformationModal.md` | 7 |  |  |  | `specs/Modal.md` `specs/InputAutocomplete.md` `specs/InputText.md` |
| `apps/postrade/deals-app/widgets/modals/DealTitleModal/DealTitleModal.md` | 6 |  |  |  | `specs/Modal.md` `specs/InputText.md` `specs/LabelHelper.md` |
| `apps/postrade/deals-app/widgets/modals/DidProductsModal/DidProductsModal.md` | 9 |  |  |  | `specs/Modal.md` `specs/ProductRow.md` `specs/IconButton.md` |
| `apps/postrade/deals-app/widgets/modals/InstrumentsModal/InstrumentsModal.md` | 9 |  |  |  | `specs/Modal.md` `specs/ProductRow.md` `specs/IconButton.md` |
| `apps/postrade/deals-app/widgets/modals/InstrumentTransferModal/InstrumentTransferModal.md` | 6 |  |  |  | `specs/Modal.md` `specs/ProductRow.md` `specs/Buttons.md` |
| `apps/postrade/deals-app/widgets/modals/LinkChangeModal/LinkChangeModal.md` | 6 |  |  |  | `specs/Modal.md` `specs/Tile.md` `specs/Buttons.md` |
| `apps/postrade/deals-app/widgets/modals/ProductsModal/ProductsModal.md` | 9 |  |  |  | `specs/Modal.md` `specs/ProductRow.md` `specs/IconButton.md` |
| `apps/postrade/deals-app/widgets/modals/ProductTreeConfirmModal/ProductTreeConfirmModal.md` | 4 |  |  |  | `specs/Modal.md` `specs/IconButton.md` `specs/Buttons.md` |
| `apps/postrade/deals-app/widgets/modals/RepaymentModal/RepaymentModal.md` | 5 |  |  |  | `specs/Modal.md` `specs/InputDate.md` `specs/IconButton.md` |
| `apps/postrade/deals-app/widgets/README.md` | 1 | 1 |  |  | `pages/patterns/LocalComponents.html` `scripts/ds-include.js` |
| `apps/postrade/deals-app/widgets/tiles/CounterpartiesTile/CounterpartiesTile.html` |  | 1 |  |  | `specs/Tooltip.md` |
| `apps/postrade/deals-app/widgets/tiles/DealDescriptionTile/DealDescriptionTile.md` | 6 |  |  |  | `specs/Tile.md` `specs/ReadOnlyField.md` `specs/Buttons.md` |
| `apps/postrade/deals-app/widgets/tiles/DealProductTreeTile/DealProductTreeTile.md` | 8 |  |  |  | `specs/Tile.md` `specs/ProductRow.md` `specs/IconButton.md` |
| `apps/postrade/deals-app/widgets/tiles/DealTeamTile/CHANGELOG.md` |  | 2 |  |  | `specs/Icons.md` `specs/InputText.md` |
| `apps/postrade/deals-app/widgets/tiles/ProjectInformationTile/ProjectInformationTile.md` | 6 |  |  |  | `specs/Tile.md` `specs/ReadOnlyField.md` `specs/Chip.md` |
| `apps/pretrade/drafts/pipelineManager-v01/pages/PipelineManagement.html` | 1 |  |  |  | `specs/Kanban.md` |
| `apps/pretrade/drafts/pipelineManager-v02/pages/PipelineManagement.html` | 1 |  |  |  | `specs/Kanban.md` |
| `apps/pretrade/drafts/pipelineScanner-v07/pages/HomePage.screen.md` | 2 |  |  |  | `scripts/ibp-home.js` |
| `apps/README.md` | 1 | 2 |  |  | `specs/Icons.md` `scripts/ibp-home.js` `scripts/ds.js` |
| `GIGACODE.md` | 4 | 1 |  |  | `scripts/ds.js` `specs/Icons.md` `styles/colors.css` |
| `index.html` |  | 1 |  |  | `scripts/ibp-home.js` |
| `index.screen.md` | 9 |  |  |  | `scripts/ds-nav.js` `specs/Icons.md` `specs/Layout.md` |
| `README.md` |  | 1 |  |  | `scripts/ds.js` |

## пересобрать (36)

| Файл | явн. | от корня | литер. | имя | Пример |
|---|--:|--:|--:|--:|---|
| `.agents/skills/docs-split/references/pages-index.md` |  | 54 |  |  | `styles/shadow.css` `styles/illustration.css` `styles/layout.css` |
| `.agents/tools/anchors.json` | 2 |  |  |  | `scripts/ds-lint.js` `scripts/spec-audit.mjs` |
| `apps/ds-body.js` |  | 2 | 2 |  | `scripts/ibp-home.js` `scripts/ds.js` `"scripts/i` |
| `apps/local-components/postrade/deals-app/CounterpartiesEcmModal.doc.html` | 16 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/CounterpartiesTile.doc.html` | 21 | 3 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/CounterpartyCard.doc.html` | 11 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DealCounterpartiesTable.doc.html` | 11 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DealDescriptionModal.doc.html` | 21 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DealDescriptionTile.doc.html` | 18 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DealFinancialMetricsModal.doc.html` | 16 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DealFinancialMetricsTile.doc.html` | 13 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DealMetricsCalculationTile.doc.html` | 7 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DealPeriodModal.doc.html` | 12 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DealPeriodTile.doc.html` | 14 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DealProductTreeTile.doc.html` | 22 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DealProjectInformationModal.doc.html` | 21 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DealRelatedCollateralsTile.doc.html` | 7 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DealSetupTile.doc.html` | 7 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DealTeamModal.doc.html` | 14 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DealTeamTile.doc.html` | 11 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DealTitleModal.doc.html` | 18 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/DidProductsModal.doc.html` | 24 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/EpsVbsImpactTile.doc.html` | 7 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/FinInstrumentsTile.doc.html` | 7 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/InstrumentsCounterpartiesModal.doc.html` | 18 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/InstrumentsModal.doc.html` | 24 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/InstrumentTransferModal.doc.html` | 18 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/LinkChangeModal.doc.html` | 18 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/ProductsModal.doc.html` | 24 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/ProductTreeConfirmModal.doc.html` | 14 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/ProjectInformationTile.doc.html` | 18 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/RelatedDealsPopover.doc.html` | 9 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/local-components/postrade/deals-app/RepaymentModal.doc.html` | 16 | 1 |  |  | `styles/splitter.css` `styles/segment-control.css` `styles/tab.css` |
| `apps/postrade/deals-app/pages/Deal.preview.html` |  | 2 |  |  | `specs/Tooltip.md` `scripts/ibp-home.js` |
| `docs/index.md` | 120 |  |  |  | `scripts/ds-lint.md` `specs/Alert.md` `specs/AllocationBar.md` |
| `hub.js` | 1 |  |  |  | `specs/Icons.md` |

## история (7)

| Файл | явн. | от корня | литер. | имя | Пример |
|---|--:|--:|--:|--:|---|
| `.agents/skills/lessons/references/lessons.md` | 3 | 3 |  |  | `scripts/ds-lint.js` `scripts/ds-lint-cli.mjs` `styles/sub-tab.css` |
| `.agents/skills/screen-review/references/lessons-raw.md` | 13 | 49 |  |  | `pages/patterns/HomeRoles.html` `scripts/ds-modal.js` `specs/Modal.md` |
| `.agents/skills/screen-review/references/lessons.md` |  | 1 |  |  | `styles/tile.css` |
| `docs/misc/restructure-3-repos.md` |  | 7 |  |  | `scripts/ds.js` `scripts/icons-data.js` `scripts/kit-link.mjs` |
| `docs/tasks/0007-ds-icons-unique-ids.md` | 4 | 3 |  |  | `scripts/ds-icons.js` `scripts/ds-icon.mjs` `specs/Icons.md` |
| `docs/tasks/RE0001-product-row-tree.handoff.md` | 1 | 2 |  |  | `pages/organisms/ProductRow.html` `styles/product-row.css` |
| `docs/tasks/RE0001-product-row-tree.md` | 1 | 15 |  |  | `pages/patterns/LocalComponents.html` `pages/organisms/ProductRow.html` `styles/product-row.css` |

# dcmecm-app — модуль раздела ib

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `ib/dcmecm-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/ib/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
dcmecm-app/
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
| `pages/` | Client, Deal, DetailedHistory, Empty, Issuer, Pipeline |
| `widgets/tiles/` | ClientExtendedInfoTile, ClientTile, DealTermsTile, DealsPipelinePreviewTile, DocumentsTile, IssuanceConditionsTile, IssuerTile, LinkedPotentialTile, PaymentScheduleTile, StatusTile, TeamTile |
| `widgets/tables/` | DealsPipelineTable |
| `widgets/modals/` | ClientExtendedInfoModal, ClientSearchModal, DealTermsModal, DownloadReportModal, EditClientAliasModal, EditDealNameModal, IssuanceConditionsModal, StatusModal, TeamModal — у фронтенда в `features/` и `widgets/` |
| мелкие элементы | ClientExtendedInfoTileGrid, DealTermsTileGrid, IssuanceConditionsTileGrid, StatusTileGrid — у фронтенда `features/`; у нас — в разметке страницы или виджета |

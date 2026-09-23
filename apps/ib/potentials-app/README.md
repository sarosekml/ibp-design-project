# potentials-app — модуль раздела ib

<!-- @scaffold — заготовка: прототипов пока нет. С первым экраном опишите здесь модуль: что это за часть системы, какие экраны и виджеты в нём, откуда требования. Пометку тогда удалите. -->

Модуль повторяет модуль фронтенда `ib/potentials-app`. Прототипов пока нет:
экраны появятся здесь напрямую или переездом согласованного концепта из
`apps/ib/drafts/` (`/promote`). Форма модуля — `apps/README.md`.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
potentials-app/
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
| `pages/` | Empty, Potential, PotentialRegister |
| `widgets/tiles/` | BondTermsTile, ClientTile, CommentTile, FundsHoldersTile, HoldingTile, LinkedDealTile, LoanTermsTile |
| `widgets/tables/` | FundsHoldersTable, PotentialBondHoldersUploadPreviewTable, PotentialTable, PotentialTableFlatView, PotentialUploadPreviewTable, PotentialsWorkTable |
| `widgets/modals/` | CreateDealModal, EditPotentialCommentModal, EditPotentialNameModal, FundsHoldersModal, PotentialBondHoldersUploadPreviewModal, PotentialUploadPreviewModal — у фронтенда в `features/` и `widgets/` |

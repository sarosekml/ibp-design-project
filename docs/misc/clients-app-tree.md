# clients-app — структура папки

Полное дерево директории `core/clients-app`.

```
clients-app/
├── ClientInfoPage/                                          (пустая директория)
├── UcpClientSearchModal/                                    (вложенный микрофронт)
│   ├── features/
│   │   ├── ClientCardList/
│   │   │   └── ClientCard.md
│   │   ├── ClientsModalActions/
│   │   │   ├── ClientsModalActions.md
│   │   │   └── views/                                       (вспомогательные view-компоненты)
│   │   │       ├── MyClientsModalActionsView.tsx
│   │   │       └── UcpClientSearchModalActionsView.tsx
│   │   └── Views/
│   │       └── UcpClientView/
│   │           ├── UcpClientInformationView/
│   │           │   └── UcpClientInformationView.md
│   │           └── UcpClientReferenceView/
│   │               └── UcpClientReferenceView.md
│   ├── pages/
│   │   └── UcpClientSearchModal/
│   │       └── UcpClientSearchModal.md
│   └── widgets/
│       └── Tables/
│           └── UcpClientTeamTable/
│               └── UcpClientTeamTable.md
├── features/
│   ├── ControlClientModal/
│   │   └── ControlClientModal.md
│   ├── FinancialsChartFilters/
│   │   └── FinancialChartFilters.md
│   ├── FinancialsChartInfo/
│   │   └── FinancialChartInfo.md
│   ├── FinancialsChartLegend/
│   │   └── FinancialsChartLegend.md
│   ├── GetEcmTicketModal/
│   │   └── GetEcmTicketModal.md
│   ├── GoalSegmentFilter/
│   │   └── GoalSegmentFilter.md
│   └── StratDialogueCard/
│       ├── StratDialogueBadge/
│       │   └── StratDialogueBadge.md
│       ├── StratDialogueCard.md
│       └── StratDialogueUser/
│           └── StratDialogueUser.md
├── pages/
│   ├── ClientInfo/
│   │   └── ClientInfoPage.md
│   ├── ClientInfoDeals/
│   │   └── ClientInfoDealsPage.md
│   ├── ClientInfoFinancials/
│   │   └── ClientInfoFinancials.md
│   ├── ClientInfoGoals/
│   │   └── ClientInfoGoalsPage.md
│   ├── Clients/
│   │   └── ClientsPage.md
│   ├── ClientsRnp/
│   │   └── ClientsRnpPage.md
│   └── MyClients/
│       └── MyClientsPage.md
└── widgets/
    ├── Charts/
    │   └── FinancialsChart/
    │       └── FinancialsChart.md
    ├── Forms/
    │   └── ClientForm/
    │       └── ClientForm.md
    ├── GoalsPopoverBadge/
    │   └── GoalsPopoverBadge.md
    ├── HierarchicalTree/
    │   └── MyClientsHierarchicalTree/
    │       └── MyClientsHierarchicalTree.md
    └── Tiles/
        ├── ClientRnpTile/
        │   └── ClientRnpTile.md
        ├── ClientTile/
        │   └── ClientTile.md
        ├── ClientsRnpCacheTile/
        │   └── ClientsRnpCacheTile.md
        ├── DocumentsInfoTile/
        │   └── DocumentsInfoTile.md
        ├── GigaInfoTile/
        │   └── GigaInfoTile.md
        ├── GoalArchiveSection/
        │   └── GoalArchiveSection.md
        ├── IndustryInfoTile/
        │   └── IndustryInfoTile.md
        ├── RequisitesInfoTile/
        │   └── RequisitesInfoTile.md
        └── TeamInfoTile/
            └── TeamInfoTile.md
```

## Список `.md`-файлов

| # | Файл | Путь |
|---|------|------|
| 1 | `ControlClientModal.md` | `features/ControlClientModal/` |
| 2 | `FinancialChartFilters.md` | `features/FinancialsChartFilters/` |
| 3 | `FinancialChartInfo.md` | `features/FinancialsChartInfo/` |
| 4 | `FinancialsChartLegend.md` | `features/FinancialsChartLegend/` |
| 5 | `GetEcmTicketModal.md` | `features/GetEcmTicketModal/` |
| 6 | `GoalSegmentFilter.md` | `features/GoalSegmentFilter/` |
| 7 | `StratDialogueBadge.md` | `features/StratDialogueCard/StratDialogueBadge/` |
| 8 | `StratDialogueCard.md` | `features/StratDialogueCard/` |
| 9 | `StratDialogueUser.md` | `features/StratDialogueCard/StratDialogueUser/` |
| 10 | `ClientInfoPage.md` | `pages/ClientInfo/` |
| 11 | `ClientInfoDealsPage.md` | `pages/ClientInfoDeals/` |
| 12 | `ClientInfoFinancials.md` | `pages/ClientInfoFinancials/` |
| 13 | `ClientInfoGoalsPage.md` | `pages/ClientInfoGoals/` |
| 14 | `ClientsPage.md` | `pages/Clients/` |
| 15 | `ClientsRnpPage.md` | `pages/ClientsRnp/` |
| 16 | `MyClientsPage.md` | `pages/MyClients/` |
| 17 | `ClientCard.md` | `UcpClientSearchModal/features/ClientCardList/` |
| 18 | `ClientsModalActions.md` | `UcpClientSearchModal/features/ClientsModalActions/` |
| 19 | `UcpClientInformationView.md` | `UcpClientSearchModal/features/Views/UcpClientView/UcpClientInformationView/` |
| 20 | `UcpClientReferenceView.md` | `UcpClientSearchModal/features/Views/UcpClientView/UcpClientReferenceView/` |
| 21 | `UcpClientSearchModal.md` | `UcpClientSearchModal/pages/UcpClientSearchModal/` |
| 22 | `UcpClientTeamTable.md` | `UcpClientSearchModal/widgets/Tables/UcpClientTeamTable/` |
| 23 | `FinancialsChart.md` | `widgets/Charts/FinancialsChart/` |
| 24 | `ClientForm.md` | `widgets/Forms/ClientForm/` |
| 25 | `GoalsPopoverBadge.md` | `widgets/GoalsPopoverBadge/` |
| 26 | `MyClientsHierarchicalTree.md` | `widgets/HierarchicalTree/MyClientsHierarchicalTree/` |
| 27 | `ClientRnpTile.md` | `widgets/Tiles/ClientRnpTile/` |
| 28 | `ClientTile.md` | `widgets/Tiles/ClientTile/` |
| 29 | `ClientsRnpCacheTile.md` | `widgets/Tiles/ClientsRnpCacheTile/` |
| 30 | `DocumentsInfoTile.md` | `widgets/Tiles/DocumentsInfoTile/` |
| 31 | `GigaInfoTile.md` | `widgets/Tiles/GigaInfoTile/` |
| 32 | `GoalArchiveSection.md` | `widgets/Tiles/GoalArchiveSection/` |
| 33 | `IndustryInfoTile.md` | `widgets/Tiles/IndustryInfoTile/` |
| 34 | `RequisitesInfoTile.md` | `widgets/Tiles/RequisitesInfoTile/` |
| 35 | `TeamInfoTile.md` | `widgets/Tiles/TeamInfoTile/` |

## Разбивка по FSD-уровням

- **pages**: 7 — ClientInfo, ClientInfoDeals, ClientInfoFinancials, ClientInfoGoals, Clients, ClientsRnp, MyClients
- **features**: 9 (основной уровень) + 4 (внутри `UcpClientSearchModal`)
- **widgets**: 14 (основной уровень) + 1 (внутри `UcpClientSearchModal`)
- **вложенный микрофронт**: `UcpClientSearchModal/` (pages, widgets, features внутри)
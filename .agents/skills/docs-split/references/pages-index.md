---
belongs_to: docs-split
purpose: Структурная карта doc-страниц IBP. Читай карту вместо файла целиком. Генерируется командой map, руками не править.
generated: 2026-10-04
---

# Карта страниц документации

Статус: ✅ — раскатано на docs-split, ⬜ — старый формат. Конструктор: dynamic — контролы строит page.js в `#pg-controls` (docs-split.js сам делает две колонки); static — разметка `.ctl-col`/`.toggles` вручную; grouped — `.ctl-group` с двумя колонками в каждой.

## Foundations (9)

| Страница | Конструктор | Демо | page.js | CSS | Секций | Статус |
|---|---|---|---|---|---|---|
| Colors | — | — | — | — | 0 | ⬜ |
| Elevation | static | — | — | foundations/Elevation/Elevation.css | 4 | ✅ |
| Icons | — | — | — | — | 0 | ⬜ |
| Illustrations | — | — | — | foundations/Illustrations/Illustrations.css | 4 | ⬜ |
| Layout | static | — | Layout.page.js | foundations/Layout/Layout.css | 12 | ✅ |
| Radius | static | — | — | — | 4 | ✅ |
| Spacing | static | — | — | foundations/Spacing/Spacing.css | 7 | ✅ |
| Themes | — | — | — | foundations/Themes/Themes.css | 12 | ✅ |
| Typography | — | — | — | — | 4 | ⬜ |

## Atoms (14)

| Страница | Конструктор | Демо | page.js | CSS | Секций | Статус |
|---|---|---|---|---|---|---|
| Avatar | dynamic | — | — | components/atoms/Avatar/Avatar.css | 12 | ✅ |
| Badge | dynamic | — | — | components/atoms/Badge/Badge.css | 12 | ✅ |
| Buttons | dynamic | — | — | components/atoms/Buttons/Buttons.css | 12 | ✅ |
| Checkbox | dynamic | — | — | components/atoms/Checkbox/Checkbox.css | 12 | ✅ |
| Chip | dynamic | — | Chip.page.js | components/atoms/Chip/Chip.css | 12 | ✅ |
| Divider | dynamic | pg-stage | Divider.page.js | components/atoms/Divider/Divider.css | 12 | ✅ |
| IconButton | dynamic | — | — | components/atoms/IconButton/IconButton.css | 12 | ✅ |
| LabelHelper | dynamic | — | LabelHelper.page.js | components/atoms/LabelHelper/LabelHelper.css | 12 | ✅ |
| Link | dynamic | — | — | components/atoms/Link/Link.css | 12 | ✅ |
| ProgressBar | dynamic | — | — | components/atoms/ProgressBar/ProgressBar.css | 12 | ✅ |
| Radiobutton | dynamic | — | — | components/atoms/Radiobutton/Radiobutton.css | 12 | ✅ |
| Skeleton | dynamic | — | — | components/atoms/Skeleton/Skeleton.css | 12 | ✅ |
| Spinner | dynamic | pg-stage | — | components/atoms/Spinner/Spinner.css | 12 | ✅ |
| Switch | dynamic | — | — | components/atoms/Switch/Switch.css | 12 | ✅ |

## Molecules (21)

| Страница | Конструктор | Демо | page.js | CSS | Секций | Статус |
|---|---|---|---|---|---|---|
| Alert | dynamic | — | Alert.page.js | components/molecules/Alert/Alert.css | 12 | ✅ |
| Breadcrumbs | dynamic | — | Breadcrumbs.page.js | components/molecules/Breadcrumbs/Breadcrumbs.css | 12 | ✅ |
| ButtonGroup | dynamic | — | — | components/molecules/ButtonGroup/ButtonGroup.css | 12 | ✅ |
| ContextMenu | dynamic | pg-stage | ContextMenu.page.js | components/molecules/ContextMenu/ContextMenu.css | 12 | ✅ |
| DatePicker | dynamic | pg-stage | DatePicker.page.js | components/molecules/DatePicker/DatePicker.css | 11 | ✅ |
| DropdownList | dynamic | pg-stage | DropdownList.page.js | components/molecules/DropdownList/DropdownList.css | 12 | ✅ |
| EmptyState | dynamic | — | — | components/molecules/EmptyState/EmptyState.css | 12 | ✅ |
| InputAmountRange | dynamic | pg-stage | InputAmountRange.page.js | components/molecules/Inputs/InputRanges.css | 11 | ✅ |
| InputAutocomplete | dynamic | pg-stage | InputAutocomplete.page.js | components/molecules/Inputs/Inputs.css | 11 | ✅ |
| InputDate | dynamic | pg-stage | InputDate.page.js | components/molecules/Inputs/Inputs.css | 11 | ✅ |
| InputDateRange | dynamic | pg-stage | InputDateRange.page.js | components/molecules/Inputs/InputRanges.css | 11 | ✅ |
| InputText | dynamic | pg-stage | InputText.page.js | components/molecules/Inputs/Inputs.css | 11 | ✅ |
| NavTile | dynamic | pg-stage | NavTile.page.js | components/molecules/NavTile/NavTile.css | 11 | ✅ |
| Pagination | dynamic | demo-hscroll | Pagination.page.js | components/molecules/Pagination/Pagination.css | 12 | ✅ |
| ReadOnlyField | dynamic | — | ReadOnlyField.page.js | components/molecules/ReadOnlyField/ReadOnlyField.css | 12 | ✅ |
| SegmentControl | dynamic | — | SegmentControl.page.js | components/molecules/SegmentControl/SegmentControl.css | 12 | ✅ |
| Splitter | dynamic | pg-stage | Splitter.page.js | components/molecules/Splitter/Splitter.css | 12 | ✅ |
| SubTab | dynamic | — | SubTab.page.js | components/molecules/SubTab/SubTab.css | 12 | ✅ |
| Tab | dynamic | — | Tab.page.js | components/molecules/Tab/Tab.css | 12 | ✅ |
| Toast | dynamic | — | Toast.page.js | components/molecules/Toast/Toast.css | 12 | ✅ |
| Tooltip | dynamic | pg-stage | Tooltip.page.js | components/molecules/Tooltip/Tooltip.css | 12 | ✅ |

## Organisms (16)

| Страница | Конструктор | Демо | page.js | CSS | Секций | Статус |
|---|---|---|---|---|---|---|
| AllocationBar | dynamic | pg-stage | AllocationBar.page.js | components/organisms/AllocationBar/AllocationBar.css | 12 | ✅ |
| Chart | dynamic | pg-stage | Chart.page.js | components/organisms/Chart/Chart.css | 12 | ✅ |
| Drawer | dynamic | pg-stage | Drawer.page.js | components/organisms/Drawer/Drawer.css | 12 | ✅ |
| Entity | static | demo-entity | — | components/organisms/Entity/Entity.css | 12 | ✅ |
| Kanban | dynamic | pg-stage | Kanban.page.js | components/organisms/Kanban/Kanban.css | 12 | ✅ |
| Modal | dynamic | pg-stage | Modal.page.js | components/organisms/Modal/Modal.css | 12 | ✅ |
| NavPanel | dynamic | pg-stage | NavPanel.page.js | components/organisms/NavPanel/NavPanel.css | 11 | ✅ |
| PageHeader | static | demo-scale | PageHeader.page.js | components/organisms/PageHeader/PageHeader.css | 12 | ✅ |
| Popover | dynamic | pg-stage | Popover.page.js | components/organisms/Popover/Popover.css | 12 | ✅ |
| ProductRow | static | demo-prow | — | components/organisms/ProductRow/ProductRow.css | 12 | ✅ |
| RiskMetric | dynamic | pg-stage | RiskMetric.page.js | components/organisms/RiskMetric/RiskMetric.css | 12 | ✅ |
| SnackBar | static | demo-layer | — | components/organisms/SnackBar/SnackBar.css | 12 | ✅ |
| Table | static | demo-dtable | Table.page.js | components/organisms/Table/Table.css | 12 | ✅ |
| TableCell | grouped | demo-tbl | TableCell.page.js | components/organisms/TableCell/TableCell.css | 12 | ✅ |
| TableFilter | dynamic | pg-stage | TableFilter.page.js | components/organisms/TableFilter/TableFilter.css | 11 | ✅ |
| Tile | static | demo-tile-wrap | — | components/organisms/Tile/Tile.css | 12 | ✅ |

## Patterns (3)

| Страница | Конструктор | Демо | page.js | CSS | Секций | Статус |
|---|---|---|---|---|---|---|
| HomeRoles | — | demo-menu | — | — | 2 | ⬜ |
| LocalComponents | — | — | — | — | 15 | ⬜ |
| Redpolicy | — | — | — | — | 3 | ⬜ |

<!-- Примечания (дописывать руками при необходимости) -->

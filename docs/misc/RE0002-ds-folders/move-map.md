# RE0002 · карта переезда ДС (генерат move-map.mjs — руками не править)

Переносов: 281 · копий: 1 · остаются на месте: 87 · без владельца: 0.
Пути — от корня ДС.

## Без владельца

нет

## Копии

- `pages/atoms/.image-slots.state.json` → `components/atoms/Chip/.image-slots.state.json` — Chip подключает image-slot.js, без файла — 404 в консоли; содержимое — {}

## Файлы спек вне папки своего компонента

Спека называет файл своим, а он уезжает в общую папку или к другому компоненту.

- Chip.runtime: scripts/ds-tooltip.js → components/molecules/Tooltip/Tooltip.js (общий файл, не в папке Chip)
- Elevation.runtime: scripts/ds-float.js → utils/ds-float.js (общий файл, не в папке Elevation)
- Breadcrumbs.runtime: scripts/ds-menu.js → components/molecules/ContextMenu/ContextMenu.js (общий файл, не в папке Breadcrumbs)
- Breadcrumbs.runtime: scripts/ds-tooltip.js → components/molecules/Tooltip/Tooltip.js (общий файл, не в папке Breadcrumbs)
- ButtonGroup.runtime: scripts/ds-menu.js → components/molecules/ContextMenu/ContextMenu.js (общий файл, не в папке ButtonGroup)
- InputAutocomplete.runtime: scripts/ds-dropdownlist.js → components/molecules/DropdownList/DropdownList.js (общий файл, не в папке InputAutocomplete)
- InputDate.runtime: scripts/ds-datepicker.js → components/molecules/DatePicker/DatePicker.js (общий файл, не в папке InputDate)
- InputDateRange.runtime: scripts/ds-datepicker.js → components/molecules/DatePicker/DatePicker.js (общий файл, не в папке InputDateRange)
- ReadOnlyField.runtime: scripts/ds-copy.js → utils/ds-copy.js (общий файл, не в папке ReadOnlyField)
- ReadOnlyField.runtime: scripts/ds-tooltip.js → components/molecules/Tooltip/Tooltip.js (общий файл, не в папке ReadOnlyField)
- SegmentControl.runtime: scripts/ds-tabs.js → components/molecules/Tab/Tab.js (общий файл, не в папке SegmentControl)
- SubTab.runtime: scripts/ds-tabs.js → components/molecules/Tab/Tab.js (общий файл, не в папке SubTab)
- Tab.runtime: scripts/ds-tooltip.js → components/molecules/Tooltip/Tooltip.js (общий файл, не в папке Tab)
- Toast.runtime: scripts/ds-notify.js → utils/ds-notify.js (общий файл, не в папке Toast)
- NavPanel.runtime: scripts/ds-tooltip.js → components/molecules/Tooltip/Tooltip.js (общий файл, не в папке NavPanel)
- PageHeader.runtime: scripts/ds-menu.js → components/molecules/ContextMenu/ContextMenu.js (общий файл, не в папке PageHeader)
- PageHeader.runtime: scripts/ds-actions-overflow.js → utils/ds-actions-overflow.js (общий файл, не в папке PageHeader)
- SnackBar.runtime: scripts/ds-notify.js → utils/ds-notify.js (общий файл, не в папке SnackBar)
- Table.runtime: scripts/ds-tooltip.js → components/molecules/Tooltip/Tooltip.js (общий файл, не в папке Table)
- TableCell.runtime: scripts/ds-table.js → components/organisms/Table/Table.js (общий файл, не в папке TableCell)
- TableCell.runtime: scripts/tbl-resize.js → components/organisms/Table/TableResize.js (общий файл, не в папке TableCell)
- TableCell.runtime: scripts/tbl-reorder.js → components/organisms/Table/TableReorder.js (общий файл, не в папке TableCell)
- TableCell.runtime: scripts/tbl-pin.js → components/organisms/Table/TablePin.js (общий файл, не в папке TableCell)
- TableFilter.runtime: scripts/ds-menu.js → components/molecules/ContextMenu/ContextMenu.js (общий файл, не в папке TableFilter)
- TableFilter.runtime: scripts/ds-modal.js → components/organisms/Modal/Modal.js (общий файл, не в папке TableFilter)

## Переносы по папкам

### (корень ДС)

| Было | Станет | Основание |
|---|---|---|
| `scripts/ds.js` | `ds.js` | раздел 5 |

### assets/fonts

| Было | Станет | Основание |
|---|---|---|
| `fonts/SBSansDisplay-Light.otf` | `assets/fonts/SBSansDisplay-Light.otf` | раздел 5 |
| `fonts/SBSansDisplay-Regular.otf` | `assets/fonts/SBSansDisplay-Regular.otf` | раздел 5 |
| `fonts/SBSansDisplay-SemiBold.otf` | `assets/fonts/SBSansDisplay-SemiBold.otf` | раздел 5 |
| `fonts/SBSansScreen.otf` | `assets/fonts/SBSansScreen.otf` | раздел 5 |
| `fonts/SBSansText-Regular.otf` | `assets/fonts/SBSansText-Regular.otf` | раздел 5 |
| `fonts/SBSansText-Semibold.otf` | `assets/fonts/SBSansText-Semibold.otf` | раздел 5 |

### components/atoms/Avatar

| Было | Станет | Основание |
|---|---|---|
| `pages/atoms/.image-slots.state.json` | `components/atoms/Avatar/.image-slots.state.json` | раздел 5; ключ один — pg-av-img (Avatar) |
| `styles/avatar.css` | `components/atoms/Avatar/Avatar.css` | правило раздела 4 |
| `pages/atoms/Avatar.html` | `components/atoms/Avatar/Avatar.html` | правило раздела 4 |
| `specs/Avatar.md` | `components/atoms/Avatar/Avatar.md` | правило раздела 4 |

### components/atoms/Badge

| Было | Станет | Основание |
|---|---|---|
| `styles/badge.css` | `components/atoms/Badge/Badge.css` | правило раздела 4 |
| `pages/atoms/Badge.html` | `components/atoms/Badge/Badge.html` | правило раздела 4 |
| `specs/Badge.md` | `components/atoms/Badge/Badge.md` | правило раздела 4 |

### components/atoms/Buttons

| Было | Станет | Основание |
|---|---|---|
| `styles/button.css` | `components/atoms/Buttons/Buttons.css` | раздел 5 |
| `pages/atoms/Buttons.html` | `components/atoms/Buttons/Buttons.html` | правило раздела 4 |
| `specs/Buttons.md` | `components/atoms/Buttons/Buttons.md` | правило раздела 4 |

### components/atoms/Checkbox

| Было | Станет | Основание |
|---|---|---|
| `styles/checkbox.css` | `components/atoms/Checkbox/Checkbox.css` | правило раздела 4 |
| `pages/atoms/Checkbox.html` | `components/atoms/Checkbox/Checkbox.html` | правило раздела 4 |
| `specs/Checkbox.md` | `components/atoms/Checkbox/Checkbox.md` | правило раздела 4 |

### components/atoms/Chip

| Было | Станет | Основание |
|---|---|---|
| `styles/chip.css` | `components/atoms/Chip/Chip.css` | правило раздела 4 |
| `pages/atoms/Chip.html` | `components/atoms/Chip/Chip.html` | правило раздела 4 |
| `scripts/ds-chip.js` | `components/atoms/Chip/Chip.js` | правило раздела 4 |
| `specs/Chip.md` | `components/atoms/Chip/Chip.md` | правило раздела 4 |
| `scripts/chip.page.js` | `components/atoms/Chip/Chip.page.js` | правило раздела 4 |

### components/atoms/Divider

| Было | Станет | Основание |
|---|---|---|
| `styles/divider.css` | `components/atoms/Divider/Divider.css` | правило раздела 4 |
| `pages/atoms/Divider.html` | `components/atoms/Divider/Divider.html` | правило раздела 4 |
| `specs/Divider.md` | `components/atoms/Divider/Divider.md` | правило раздела 4 |
| `scripts/divider.page.js` | `components/atoms/Divider/Divider.page.js` | правило раздела 4 |

### components/atoms/IconButton

| Было | Станет | Основание |
|---|---|---|
| `styles/icon-button.css` | `components/atoms/IconButton/IconButton.css` | правило раздела 4 |
| `pages/atoms/IconButton.html` | `components/atoms/IconButton/IconButton.html` | правило раздела 4 |
| `specs/IconButton.md` | `components/atoms/IconButton/IconButton.md` | правило раздела 4 |

### components/atoms/LabelHelper

| Было | Станет | Основание |
|---|---|---|
| `styles/label-helper.css` | `components/atoms/LabelHelper/LabelHelper.css` | правило раздела 4 |
| `pages/atoms/LabelHelper.html` | `components/atoms/LabelHelper/LabelHelper.html` | правило раздела 4 |
| `specs/LabelHelper.md` | `components/atoms/LabelHelper/LabelHelper.md` | правило раздела 4 |
| `scripts/label-helper.page.js` | `components/atoms/LabelHelper/LabelHelper.page.js` | правило раздела 4 |

### components/atoms/Link

| Было | Станет | Основание |
|---|---|---|
| `styles/link.css` | `components/atoms/Link/Link.css` | правило раздела 4 |
| `pages/atoms/Link.html` | `components/atoms/Link/Link.html` | правило раздела 4 |
| `specs/Link.md` | `components/atoms/Link/Link.md` | правило раздела 4 |

### components/atoms/ProgressBar

| Было | Станет | Основание |
|---|---|---|
| `styles/progress-bar.css` | `components/atoms/ProgressBar/ProgressBar.css` | правило раздела 4 |
| `pages/atoms/ProgressBar.html` | `components/atoms/ProgressBar/ProgressBar.html` | правило раздела 4 |
| `specs/ProgressBar.md` | `components/atoms/ProgressBar/ProgressBar.md` | правило раздела 4 |

### components/atoms/Radiobutton

| Было | Станет | Основание |
|---|---|---|
| `styles/radio.css` | `components/atoms/Radiobutton/Radiobutton.css` | раздел 5 |
| `pages/atoms/Radiobutton.html` | `components/atoms/Radiobutton/Radiobutton.html` | правило раздела 4 |
| `specs/Radiobutton.md` | `components/atoms/Radiobutton/Radiobutton.md` | правило раздела 4 |

### components/atoms/Skeleton

| Было | Станет | Основание |
|---|---|---|
| `styles/skeleton.css` | `components/atoms/Skeleton/Skeleton.css` | правило раздела 4 |
| `pages/atoms/Skeleton.html` | `components/atoms/Skeleton/Skeleton.html` | правило раздела 4 |
| `specs/Skeleton.md` | `components/atoms/Skeleton/Skeleton.md` | правило раздела 4 |

### components/atoms/Spinner

| Было | Станет | Основание |
|---|---|---|
| `styles/spinner.css` | `components/atoms/Spinner/Spinner.css` | правило раздела 4 |
| `pages/atoms/Spinner.html` | `components/atoms/Spinner/Spinner.html` | правило раздела 4 |
| `specs/Spinner.md` | `components/atoms/Spinner/Spinner.md` | правило раздела 4 |

### components/atoms/Switch

| Было | Станет | Основание |
|---|---|---|
| `styles/switch.css` | `components/atoms/Switch/Switch.css` | правило раздела 4 |
| `pages/atoms/Switch.html` | `components/atoms/Switch/Switch.html` | правило раздела 4 |
| `specs/Switch.md` | `components/atoms/Switch/Switch.md` | правило раздела 4 |

### components/molecules/Alert

| Было | Станет | Основание |
|---|---|---|
| `styles/alert.css` | `components/molecules/Alert/Alert.css` | правило раздела 4 |
| `pages/molecules/Alert.html` | `components/molecules/Alert/Alert.html` | правило раздела 4 |
| `scripts/ds-alert.js` | `components/molecules/Alert/Alert.js` | правило раздела 4 |
| `specs/Alert.md` | `components/molecules/Alert/Alert.md` | правило раздела 4 |
| `scripts/alert.page.js` | `components/molecules/Alert/Alert.page.js` | правило раздела 4 |

### components/molecules/Breadcrumbs

| Было | Станет | Основание |
|---|---|---|
| `styles/breadcrumbs.css` | `components/molecules/Breadcrumbs/Breadcrumbs.css` | правило раздела 4 |
| `pages/molecules/Breadcrumbs.html` | `components/molecules/Breadcrumbs/Breadcrumbs.html` | правило раздела 4 |
| `scripts/ds-breadcrumbs.js` | `components/molecules/Breadcrumbs/Breadcrumbs.js` | правило раздела 4 |
| `specs/Breadcrumbs.md` | `components/molecules/Breadcrumbs/Breadcrumbs.md` | правило раздела 4 |
| `scripts/breadcrumbs.page.js` | `components/molecules/Breadcrumbs/Breadcrumbs.page.js` | правило раздела 4 |

### components/molecules/ButtonGroup

| Было | Станет | Основание |
|---|---|---|
| `styles/button-group.css` | `components/molecules/ButtonGroup/ButtonGroup.css` | правило раздела 4 |
| `pages/molecules/ButtonGroup.html` | `components/molecules/ButtonGroup/ButtonGroup.html` | правило раздела 4 |
| `scripts/ds-buttongroup.js` | `components/molecules/ButtonGroup/ButtonGroup.js` | раздел 5 |
| `specs/ButtonGroup.md` | `components/molecules/ButtonGroup/ButtonGroup.md` | правило раздела 4 |

### components/molecules/ContextMenu

| Было | Станет | Основание |
|---|---|---|
| `styles/context-menu.css` | `components/molecules/ContextMenu/ContextMenu.css` | правило раздела 4 |
| `pages/molecules/ContextMenu.html` | `components/molecules/ContextMenu/ContextMenu.html` | правило раздела 4 |
| `scripts/ds-menu.js` | `components/molecules/ContextMenu/ContextMenu.js` | раздел 5 |
| `specs/ContextMenu.md` | `components/molecules/ContextMenu/ContextMenu.md` | правило раздела 4 |
| `scripts/context-menu.page.js` | `components/molecules/ContextMenu/ContextMenu.page.js` | правило раздела 4 |

### components/molecules/DatePicker

| Было | Станет | Основание |
|---|---|---|
| `styles/datepicker.css` | `components/molecules/DatePicker/DatePicker.css` | раздел 5 |
| `pages/molecules/DatePicker.html` | `components/molecules/DatePicker/DatePicker.html` | правило раздела 4 |
| `scripts/ds-datepicker.js` | `components/molecules/DatePicker/DatePicker.js` | правило раздела 4 |
| `specs/DatePicker.md` | `components/molecules/DatePicker/DatePicker.md` | правило раздела 4 |
| `scripts/datepicker.page.js` | `components/molecules/DatePicker/DatePicker.page.js` | правило раздела 4 |

### components/molecules/DropdownList

| Было | Станет | Основание |
|---|---|---|
| `styles/dropdown-list.css` | `components/molecules/DropdownList/DropdownList.css` | правило раздела 4 |
| `pages/molecules/DropdownList.html` | `components/molecules/DropdownList/DropdownList.html` | правило раздела 4 |
| `scripts/ds-dropdownlist.js` | `components/molecules/DropdownList/DropdownList.js` | правило раздела 4 |
| `specs/DropdownList.md` | `components/molecules/DropdownList/DropdownList.md` | правило раздела 4 |
| `scripts/dropdown-list.page.js` | `components/molecules/DropdownList/DropdownList.page.js` | правило раздела 4 |

### components/molecules/EmptyState

| Было | Станет | Основание |
|---|---|---|
| `styles/empty-state.css` | `components/molecules/EmptyState/EmptyState.css` | правило раздела 4 |
| `pages/molecules/EmptyState.html` | `components/molecules/EmptyState/EmptyState.html` | правило раздела 4 |
| `specs/EmptyState.md` | `components/molecules/EmptyState/EmptyState.md` | правило раздела 4 |

### components/molecules/Inputs

| Было | Станет | Основание |
|---|---|---|
| `pages/molecules/InputAmountRange.html` | `components/molecules/Inputs/InputAmountRange/InputAmountRange.html` | правило раздела 4 |
| `specs/InputAmountRange.md` | `components/molecules/Inputs/InputAmountRange/InputAmountRange.md` | правило раздела 4 |
| `scripts/input-amount-range.page.js` | `components/molecules/Inputs/InputAmountRange/InputAmountRange.page.js` | правило раздела 4 |
| `pages/molecules/InputAutocomplete.html` | `components/molecules/Inputs/InputAutocomplete/InputAutocomplete.html` | правило раздела 4 |
| `specs/InputAutocomplete.md` | `components/molecules/Inputs/InputAutocomplete/InputAutocomplete.md` | правило раздела 4 |
| `scripts/input-autocomplete.page.js` | `components/molecules/Inputs/InputAutocomplete/InputAutocomplete.page.js` | правило раздела 4 |
| `pages/molecules/InputDate.html` | `components/molecules/Inputs/InputDate/InputDate.html` | правило раздела 4 |
| `specs/InputDate.md` | `components/molecules/Inputs/InputDate/InputDate.md` | правило раздела 4 |
| `scripts/input-date.page.js` | `components/molecules/Inputs/InputDate/InputDate.page.js` | правило раздела 4 |
| `pages/molecules/InputDateRange.html` | `components/molecules/Inputs/InputDateRange/InputDateRange.html` | правило раздела 4 |
| `specs/InputDateRange.md` | `components/molecules/Inputs/InputDateRange/InputDateRange.md` | правило раздела 4 |
| `scripts/input-date-range.page.js` | `components/molecules/Inputs/InputDateRange/InputDateRange.page.js` | правило раздела 4 |
| `scripts/input-kit.js` | `components/molecules/Inputs/InputKit.js` | раздел 5 |
| `styles/input-range.css` | `components/molecules/Inputs/InputRanges.css` | раздел 5 |
| `styles/input.css` | `components/molecules/Inputs/Inputs.css` | раздел 5 |
| `scripts/ds-input.js` | `components/molecules/Inputs/Inputs.js` | раздел 5 |
| `pages/molecules/InputText.html` | `components/molecules/Inputs/InputText/InputText.html` | правило раздела 4 |
| `specs/InputText.md` | `components/molecules/Inputs/InputText/InputText.md` | правило раздела 4 |
| `scripts/input-text.page.js` | `components/molecules/Inputs/InputText/InputText.page.js` | правило раздела 4 |

### components/molecules/NavTile

| Было | Станет | Основание |
|---|---|---|
| `styles/nav-tile.css` | `components/molecules/NavTile/NavTile.css` | правило раздела 4 |
| `pages/molecules/NavTile.html` | `components/molecules/NavTile/NavTile.html` | правило раздела 4 |
| `specs/NavTile.md` | `components/molecules/NavTile/NavTile.md` | правило раздела 4 |
| `scripts/nav-tile.page.js` | `components/molecules/NavTile/NavTile.page.js` | правило раздела 4 |

### components/molecules/Pagination

| Было | Станет | Основание |
|---|---|---|
| `styles/pagination.css` | `components/molecules/Pagination/Pagination.css` | правило раздела 4 |
| `pages/molecules/Pagination.html` | `components/molecules/Pagination/Pagination.html` | правило раздела 4 |
| `scripts/ds-pagination.js` | `components/molecules/Pagination/Pagination.js` | правило раздела 4 |
| `specs/Pagination.md` | `components/molecules/Pagination/Pagination.md` | правило раздела 4 |
| `scripts/pagination.page.js` | `components/molecules/Pagination/Pagination.page.js` | правило раздела 4 |

### components/molecules/ReadOnlyField

| Было | Станет | Основание |
|---|---|---|
| `styles/read-only-field.css` | `components/molecules/ReadOnlyField/ReadOnlyField.css` | правило раздела 4 |
| `pages/molecules/ReadOnlyField.html` | `components/molecules/ReadOnlyField/ReadOnlyField.html` | правило раздела 4 |
| `scripts/ds-readonlyfield.js` | `components/molecules/ReadOnlyField/ReadOnlyField.js` | правило раздела 4 |
| `specs/ReadOnlyField.md` | `components/molecules/ReadOnlyField/ReadOnlyField.md` | правило раздела 4 |
| `scripts/read-only-field.page.js` | `components/molecules/ReadOnlyField/ReadOnlyField.page.js` | правило раздела 4 |

### components/molecules/SegmentControl

| Было | Станет | Основание |
|---|---|---|
| `styles/segment-control.css` | `components/molecules/SegmentControl/SegmentControl.css` | правило раздела 4 |
| `pages/molecules/SegmentControl.html` | `components/molecules/SegmentControl/SegmentControl.html` | правило раздела 4 |
| `specs/SegmentControl.md` | `components/molecules/SegmentControl/SegmentControl.md` | правило раздела 4 |
| `scripts/segment-control.page.js` | `components/molecules/SegmentControl/SegmentControl.page.js` | правило раздела 4 |

### components/molecules/Splitter

| Было | Станет | Основание |
|---|---|---|
| `styles/splitter.css` | `components/molecules/Splitter/Splitter.css` | правило раздела 4 |
| `pages/molecules/Splitter.html` | `components/molecules/Splitter/Splitter.html` | правило раздела 4 |
| `scripts/ds-splitter.js` | `components/molecules/Splitter/Splitter.js` | правило раздела 4 |
| `specs/Splitter.md` | `components/molecules/Splitter/Splitter.md` | правило раздела 4 |
| `scripts/splitter.page.js` | `components/molecules/Splitter/Splitter.page.js` | правило раздела 4 |

### components/molecules/SubTab

| Было | Станет | Основание |
|---|---|---|
| `styles/sub-tab.css` | `components/molecules/SubTab/SubTab.css` | правило раздела 4 |
| `pages/molecules/SubTab.html` | `components/molecules/SubTab/SubTab.html` | правило раздела 4 |
| `specs/SubTab.md` | `components/molecules/SubTab/SubTab.md` | правило раздела 4 |
| `scripts/sub-tab.page.js` | `components/molecules/SubTab/SubTab.page.js` | правило раздела 4 |

### components/molecules/Tab

| Было | Станет | Основание |
|---|---|---|
| `styles/tab.css` | `components/molecules/Tab/Tab.css` | правило раздела 4 |
| `pages/molecules/Tab.html` | `components/molecules/Tab/Tab.html` | правило раздела 4 |
| `scripts/ds-tabs.js` | `components/molecules/Tab/Tab.js` | раздел 5 |
| `specs/Tab.md` | `components/molecules/Tab/Tab.md` | правило раздела 4 |
| `scripts/tab.page.js` | `components/molecules/Tab/Tab.page.js` | правило раздела 4 |

### components/molecules/Toast

| Было | Станет | Основание |
|---|---|---|
| `styles/toast.css` | `components/molecules/Toast/Toast.css` | правило раздела 4 |
| `pages/molecules/Toast.html` | `components/molecules/Toast/Toast.html` | правило раздела 4 |
| `specs/Toast.md` | `components/molecules/Toast/Toast.md` | правило раздела 4 |
| `scripts/toast.page.js` | `components/molecules/Toast/Toast.page.js` | правило раздела 4 |

### components/molecules/Tooltip

| Было | Станет | Основание |
|---|---|---|
| `styles/tooltip.css` | `components/molecules/Tooltip/Tooltip.css` | правило раздела 4 |
| `pages/molecules/Tooltip.html` | `components/molecules/Tooltip/Tooltip.html` | правило раздела 4 |
| `scripts/ds-tooltip.js` | `components/molecules/Tooltip/Tooltip.js` | правило раздела 4 |
| `specs/Tooltip.md` | `components/molecules/Tooltip/Tooltip.md` | правило раздела 4 |
| `scripts/tooltip.page.js` | `components/molecules/Tooltip/Tooltip.page.js` | правило раздела 4 |

### components/organisms/AllocationBar

| Было | Станет | Основание |
|---|---|---|
| `styles/allocation-bar.css` | `components/organisms/AllocationBar/AllocationBar.css` | правило раздела 4 |
| `pages/organisms/AllocationBar.html` | `components/organisms/AllocationBar/AllocationBar.html` | правило раздела 4 |
| `scripts/ds-allocationbar.js` | `components/organisms/AllocationBar/AllocationBar.js` | правило раздела 4 |
| `specs/AllocationBar.md` | `components/organisms/AllocationBar/AllocationBar.md` | правило раздела 4 |
| `scripts/allocation-bar.page.js` | `components/organisms/AllocationBar/AllocationBar.page.js` | правило раздела 4 |

### components/organisms/Chart

| Было | Станет | Основание |
|---|---|---|
| `styles/chart.css` | `components/organisms/Chart/Chart.css` | правило раздела 4 |
| `pages/organisms/Chart.html` | `components/organisms/Chart/Chart.html` | правило раздела 4 |
| `scripts/ds-chart.js` | `components/organisms/Chart/Chart.js` | правило раздела 4 |
| `specs/Chart.md` | `components/organisms/Chart/Chart.md` | правило раздела 4 |
| `scripts/chart.page.js` | `components/organisms/Chart/Chart.page.js` | правило раздела 4 |

### components/organisms/Drawer

| Было | Станет | Основание |
|---|---|---|
| `styles/drawer.css` | `components/organisms/Drawer/Drawer.css` | правило раздела 4 |
| `pages/organisms/Drawer.html` | `components/organisms/Drawer/Drawer.html` | правило раздела 4 |
| `scripts/ds-drawer.js` | `components/organisms/Drawer/Drawer.js` | правило раздела 4 |
| `specs/Drawer.md` | `components/organisms/Drawer/Drawer.md` | правило раздела 4 |
| `scripts/drawer.page.js` | `components/organisms/Drawer/Drawer.page.js` | правило раздела 4 |

### components/organisms/Entity

| Было | Станет | Основание |
|---|---|---|
| `styles/entity.css` | `components/organisms/Entity/Entity.css` | правило раздела 4 |
| `pages/organisms/Entity.html` | `components/organisms/Entity/Entity.html` | правило раздела 4 |
| `specs/Entity.md` | `components/organisms/Entity/Entity.md` | правило раздела 4 |

### components/organisms/Kanban

| Было | Станет | Основание |
|---|---|---|
| `styles/kanban.css` | `components/organisms/Kanban/Kanban.css` | правило раздела 4 |
| `pages/organisms/Kanban.html` | `components/organisms/Kanban/Kanban.html` | правило раздела 4 |
| `scripts/ds-kanban.js` | `components/organisms/Kanban/Kanban.js` | правило раздела 4 |
| `specs/Kanban.md` | `components/organisms/Kanban/Kanban.md` | правило раздела 4 |
| `scripts/kanban.page.js` | `components/organisms/Kanban/Kanban.page.js` | правило раздела 4 |

### components/organisms/Modal

| Было | Станет | Основание |
|---|---|---|
| `styles/modal.css` | `components/organisms/Modal/Modal.css` | правило раздела 4 |
| `pages/organisms/Modal.html` | `components/organisms/Modal/Modal.html` | правило раздела 4 |
| `scripts/ds-modal.js` | `components/organisms/Modal/Modal.js` | правило раздела 4 |
| `specs/Modal.md` | `components/organisms/Modal/Modal.md` | правило раздела 4 |
| `scripts/modal.page.js` | `components/organisms/Modal/Modal.page.js` | правило раздела 4 |

### components/organisms/NavPanel

| Было | Станет | Основание |
|---|---|---|
| `styles/nav-panel.css` | `components/organisms/NavPanel/NavPanel.css` | правило раздела 4 |
| `pages/organisms/NavPanel.html` | `components/organisms/NavPanel/NavPanel.html` | правило раздела 4 |
| `scripts/ds-nav-panel.js` | `components/organisms/NavPanel/NavPanel.js` | правило раздела 4 |
| `specs/NavPanel.md` | `components/organisms/NavPanel/NavPanel.md` | правило раздела 4 |
| `scripts/nav-panel.page.js` | `components/organisms/NavPanel/NavPanel.page.js` | правило раздела 4 |

### components/organisms/PageHeader

| Было | Станет | Основание |
|---|---|---|
| `styles/page-header.css` | `components/organisms/PageHeader/PageHeader.css` | правило раздела 4 |
| `pages/organisms/PageHeader.html` | `components/organisms/PageHeader/PageHeader.html` | правило раздела 4 |
| `specs/PageHeader.md` | `components/organisms/PageHeader/PageHeader.md` | правило раздела 4 |
| `scripts/page-header.page.js` | `components/organisms/PageHeader/PageHeader.page.js` | правило раздела 4 |

### components/organisms/Popover

| Было | Станет | Основание |
|---|---|---|
| `styles/popover.css` | `components/organisms/Popover/Popover.css` | правило раздела 4 |
| `pages/organisms/Popover.html` | `components/organisms/Popover/Popover.html` | правило раздела 4 |
| `scripts/ds-popover.js` | `components/organisms/Popover/Popover.js` | правило раздела 4 |
| `specs/Popover.md` | `components/organisms/Popover/Popover.md` | правило раздела 4 |
| `scripts/popover.page.js` | `components/organisms/Popover/Popover.page.js` | правило раздела 4 |

### components/organisms/ProductRow

| Было | Станет | Основание |
|---|---|---|
| `styles/product-row.css` | `components/organisms/ProductRow/ProductRow.css` | правило раздела 4 |
| `pages/organisms/ProductRow.html` | `components/organisms/ProductRow/ProductRow.html` | правило раздела 4 |
| `scripts/ds-product-row.js` | `components/organisms/ProductRow/ProductRow.js` | правило раздела 4 |
| `specs/ProductRow.md` | `components/organisms/ProductRow/ProductRow.md` | правило раздела 4 |

### components/organisms/RiskMetric

| Было | Станет | Основание |
|---|---|---|
| `styles/riskmetric.css` | `components/organisms/RiskMetric/RiskMetric.css` | раздел 5 |
| `pages/organisms/RiskMetric.html` | `components/organisms/RiskMetric/RiskMetric.html` | правило раздела 4 |
| `scripts/ds-riskmetric.js` | `components/organisms/RiskMetric/RiskMetric.js` | правило раздела 4 |
| `specs/RiskMetric.md` | `components/organisms/RiskMetric/RiskMetric.md` | правило раздела 4 |
| `scripts/riskmetric.page.js` | `components/organisms/RiskMetric/RiskMetric.page.js` | правило раздела 4 |

### components/organisms/SnackBar

| Было | Станет | Основание |
|---|---|---|
| `styles/snackbar.css` | `components/organisms/SnackBar/SnackBar.css` | правило раздела 4 |
| `pages/organisms/SnackBar.html` | `components/organisms/SnackBar/SnackBar.html` | правило раздела 4 |
| `specs/SnackBar.md` | `components/organisms/SnackBar/SnackBar.md` | правило раздела 4 |

### components/organisms/Table

| Было | Станет | Основание |
|---|---|---|
| `styles/table.css` | `components/organisms/Table/Table.css` | правило раздела 4 |
| `pages/organisms/Table.html` | `components/organisms/Table/Table.html` | правило раздела 4 |
| `scripts/ds-table.js` | `components/organisms/Table/Table.js` | раздел 5 |
| `specs/Table.md` | `components/organisms/Table/Table.md` | правило раздела 4 |
| `scripts/table.page.js` | `components/organisms/Table/Table.page.js` | правило раздела 4 |
| `scripts/tbl-pin.js` | `components/organisms/Table/TablePin.js` | раздел 5 |
| `scripts/tbl-reorder.js` | `components/organisms/Table/TableReorder.js` | раздел 5 |
| `scripts/tbl-resize.js` | `components/organisms/Table/TableResize.js` | раздел 5 |
| `styles/table-settings.css` | `components/organisms/Table/TableSettings.css` | раздел 5 |
| `scripts/ds-table-settings.js` | `components/organisms/Table/TableSettings.js` | раздел 5 |

### components/organisms/TableCell

| Было | Станет | Основание |
|---|---|---|
| `styles/table-cell.css` | `components/organisms/TableCell/TableCell.css` | правило раздела 4 |
| `pages/organisms/TableCell.html` | `components/organisms/TableCell/TableCell.html` | правило раздела 4 |
| `specs/TableCell.md` | `components/organisms/TableCell/TableCell.md` | правило раздела 4 |
| `scripts/table-cell.page.js` | `components/organisms/TableCell/TableCell.page.js` | правило раздела 4 |

### components/organisms/TableFilter

| Было | Станет | Основание |
|---|---|---|
| `styles/table-filter.css` | `components/organisms/TableFilter/TableFilter.css` | правило раздела 4 |
| `pages/organisms/TableFilter.html` | `components/organisms/TableFilter/TableFilter.html` | правило раздела 4 |
| `scripts/ds-table-filter.js` | `components/organisms/TableFilter/TableFilter.js` | правило раздела 4 |
| `specs/TableFilter.md` | `components/organisms/TableFilter/TableFilter.md` | правило раздела 4 |
| `scripts/table-filter.page.js` | `components/organisms/TableFilter/TableFilter.page.js` | правило раздела 4 |

### components/organisms/Tile

| Было | Станет | Основание |
|---|---|---|
| `styles/tile.css` | `components/organisms/Tile/Tile.css` | правило раздела 4 |
| `pages/organisms/Tile.html` | `components/organisms/Tile/Tile.html` | правило раздела 4 |
| `scripts/ds-tile.js` | `components/organisms/Tile/Tile.js` | правило раздела 4 |
| `specs/Tile.md` | `components/organisms/Tile/Tile.md` | правило раздела 4 |

### docs-kit/docs-split.css

| Было | Станет | Основание |
|---|---|---|
| `styles/docs-split.css` | `docs-kit/docs-split.css` | раздел 5, docs-kit |

### docs-kit/docs-split.js

| Было | Станет | Основание |
|---|---|---|
| `scripts/docs-split.js` | `docs-kit/docs-split.js` | раздел 5, docs-kit |

### docs-kit/ds-docs.css

| Было | Станет | Основание |
|---|---|---|
| `styles/ds-docs.css` | `docs-kit/ds-docs.css` | раздел 5, docs-kit |

### docs-kit/ds-nav.css

| Было | Станет | Основание |
|---|---|---|
| `styles/ds-nav.css` | `docs-kit/ds-nav.css` | раздел 5, docs-kit |

### docs-kit/ds-nav.js

| Было | Станет | Основание |
|---|---|---|
| `scripts/ds-nav.js` | `docs-kit/ds-nav.js` | раздел 5, docs-kit |

### docs-kit/ds-toc.css

| Было | Станет | Основание |
|---|---|---|
| `styles/ds-toc.css` | `docs-kit/ds-toc.css` | раздел 5, docs-kit |

### docs-kit/ds-toc.js

| Было | Станет | Основание |
|---|---|---|
| `scripts/ds-toc.js` | `docs-kit/ds-toc.js` | раздел 5, docs-kit |

### docs-kit/image-slot.js

| Было | Станет | Основание |
|---|---|---|
| `scripts/image-slot.js` | `docs-kit/image-slot.js` | раздел 5, docs-kit |

### docs-kit/input-pages.css

| Было | Станет | Основание |
|---|---|---|
| `styles/input-pages.css` | `docs-kit/input-pages.css` | раздел 5, docs-kit |

### docs-kit/pg-kit.css

| Было | Станет | Основание |
|---|---|---|
| `styles/pg-kit.css` | `docs-kit/pg-kit.css` | раздел 5, docs-kit |

### docs-kit/pg-kit.js

| Было | Станет | Основание |
|---|---|---|
| `scripts/pg-kit.js` | `docs-kit/pg-kit.js` | раздел 5, docs-kit |

### foundations/Colors

| Было | Станет | Основание |
|---|---|---|
| `styles/colors.css` | `foundations/Colors/Colors.css` | раздел 5 |
| `pages/foundations/Colors.html` | `foundations/Colors/Colors.html` | правило раздела 4 |
| `specs/Colors.md` | `foundations/Colors/Colors.md` | правило раздела 4 |
| `styles/palette.css` | `foundations/Colors/Palette.css` | раздел 5 |

### foundations/Elevation

| Было | Станет | Основание |
|---|---|---|
| `styles/shadow.css` | `foundations/Elevation/Elevation.css` | раздел 5 |
| `pages/foundations/Elevation.html` | `foundations/Elevation/Elevation.html` | правило раздела 4 |
| `specs/Elevation.md` | `foundations/Elevation/Elevation.md` | правило раздела 4 |

### foundations/Icons

| Было | Станет | Основание |
|---|---|---|
| `scripts/icons-data.js` | `foundations/Icons/icons-data.js` | раздел 5 |
| `pages/foundations/Icons.html` | `foundations/Icons/Icons.html` | правило раздела 4 |
| `scripts/ds-icons.js` | `foundations/Icons/Icons.js` | раздел 5 |
| `specs/Icons.md` | `foundations/Icons/Icons.md` | правило раздела 4 |

### foundations/Illustrations

| Было | Станет | Основание |
|---|---|---|
| `styles/illustration.css` | `foundations/Illustrations/Illustrations.css` | раздел 5 |
| `pages/foundations/Illustrations.html` | `foundations/Illustrations/Illustrations.html` | правило раздела 4 |
| `scripts/ds-illustrations.js` | `foundations/Illustrations/Illustrations.js` | раздел 5 |
| `specs/Illustrations.md` | `foundations/Illustrations/Illustrations.md` | правило раздела 4 |

### foundations/Layout

| Было | Станет | Основание |
|---|---|---|
| `styles/layout.css` | `foundations/Layout/Layout.css` | раздел 5 |
| `pages/foundations/Layout.html` | `foundations/Layout/Layout.html` | правило раздела 4 |
| `scripts/ds-scroll.js` | `foundations/Layout/Layout.js` | раздел 5 |
| `specs/Layout.md` | `foundations/Layout/Layout.md` | правило раздела 4 |
| `scripts/layout.page.js` | `foundations/Layout/Layout.page.js` | раздел 5 |

### foundations/Radius

| Было | Станет | Основание |
|---|---|---|
| `styles/radius.css` | `foundations/Radius/Radius.css` | правило раздела 4 |
| `pages/foundations/Radius.html` | `foundations/Radius/Radius.html` | правило раздела 4 |
| `specs/Radius.md` | `foundations/Radius/Radius.md` | правило раздела 4 |

### foundations/Spacing

| Было | Станет | Основание |
|---|---|---|
| `styles/spacing.css` | `foundations/Spacing/Spacing.css` | правило раздела 4 |
| `pages/foundations/Spacing.html` | `foundations/Spacing/Spacing.html` | правило раздела 4 |
| `specs/Spacing.md` | `foundations/Spacing/Spacing.md` | правило раздела 4 |

### foundations/Typography

| Было | Станет | Основание |
|---|---|---|
| `styles/typography.css` | `foundations/Typography/Typography.css` | правило раздела 4 |
| `pages/foundations/Typography.html` | `foundations/Typography/Typography.html` | правило раздела 4 |
| `specs/Typography.md` | `foundations/Typography/Typography.md` | правило раздела 4 |

### patterns/HomeRoles

| Было | Станет | Основание |
|---|---|---|
| `pages/patterns/HomeRoles.html` | `patterns/HomeRoles/HomeRoles.html` | правило раздела 4 |
| `scripts/ibp-home.js` | `patterns/HomeRoles/ibp-home.js` | раздел 5 |

### patterns/LocalComponents

| Было | Станет | Основание |
|---|---|---|
| `pages/patterns/LocalComponents.html` | `patterns/LocalComponents/LocalComponents.html` | правило раздела 4 |

### patterns/Redpolicy

| Было | Станет | Основание |
|---|---|---|
| `pages/patterns/Redpolicy.html` | `patterns/Redpolicy/Redpolicy.html` | правило раздела 4 |

### rnd/Backlog

| Было | Станет | Основание |
|---|---|---|
| `pages/rnd/Backlog.html` | `rnd/Backlog/Backlog.html` | правило раздела 4 |

### tools/ds-check.mjs

| Было | Станет | Основание |
|---|---|---|
| `scripts/ds-check.mjs` | `tools/ds-check.mjs` | раздел 5, tools |

### tools/ds-home.mjs

| Было | Станет | Основание |
|---|---|---|
| `scripts/ds-home.mjs` | `tools/ds-home.mjs` | раздел 5, tools |

### tools/ds-icon.mjs

| Было | Станет | Основание |
|---|---|---|
| `scripts/ds-icon.mjs` | `tools/ds-icon.mjs` | раздел 5, tools |

### tools/ds-lint-cli.mjs

| Было | Станет | Основание |
|---|---|---|
| `scripts/ds-lint-cli.mjs` | `tools/ds-lint-cli.mjs` | раздел 5, tools |

### tools/ds-lint.js

| Было | Станет | Основание |
|---|---|---|
| `scripts/ds-lint.js` | `tools/ds-lint.js` | раздел 5, tools |

### tools/ds-lint.md

| Было | Станет | Основание |
|---|---|---|
| `scripts/ds-lint.md` | `tools/ds-lint.md` | раздел 5, tools |

### tools/kit-link.mjs

| Было | Станет | Основание |
|---|---|---|
| `scripts/kit-link.mjs` | `tools/kit-link.mjs` | раздел 5, tools |

### tools/spec-audit.mjs

| Было | Станет | Основание |
|---|---|---|
| `scripts/spec-audit.mjs` | `tools/spec-audit.mjs` | раздел 5, tools |

### utils/ds-actions-overflow.js

| Было | Станет | Основание |
|---|---|---|
| `scripts/ds-actions-overflow.js` | `utils/ds-actions-overflow.js` | раздел 5, utils |

### utils/ds-copy.js

| Было | Станет | Основание |
|---|---|---|
| `scripts/ds-copy.js` | `utils/ds-copy.js` | раздел 5, utils |

### utils/ds-float.js

| Было | Станет | Основание |
|---|---|---|
| `scripts/ds-float.js` | `utils/ds-float.js` | раздел 5, utils |

### utils/ds-include.js

| Было | Станет | Основание |
|---|---|---|
| `scripts/ds-include.js` | `utils/ds-include.js` | раздел 5, utils |

### utils/ds-notify.js

| Было | Станет | Основание |
|---|---|---|
| `scripts/ds-notify.js` | `utils/ds-notify.js` | раздел 5, utils |

## Остаются на месте

`AGENTS.md` · `CHANGELOG.md` · `MAINTAINING.md` · `assets/illustrations/background-illustration.svg` · `assets/illustrations/booked-deals.svg` · `assets/illustrations/calclate-fv.svg` · `assets/illustrations/cash-flow.svg` · `assets/illustrations/ckp-pipeline.svg` · `assets/illustrations/clients.svg` · `assets/illustrations/corporate-transactions.svg` · `assets/illustrations/current-depo.svg` · `assets/illustrations/dcm-pipeline.svg` · `assets/illustrations/dcm-potentials.svg` · `assets/illustrations/deals.svg` · `assets/illustrations/ecm-pipeline.svg` · `assets/illustrations/empty-check.svg` · `assets/illustrations/empty-folder.svg` · `assets/illustrations/empty-loading.svg` · `assets/illustrations/error-page-not-found-light.svg` · `assets/illustrations/error-page-not-found.svg` · `assets/illustrations/error-page-unavailable.svg` · `assets/illustrations/error-server-unavailable.svg` · `assets/illustrations/important-deals.svg` · `assets/illustrations/important-leads.svg` · `assets/illustrations/kpki-cal.svg` · `assets/illustrations/mna-pipeline.svg` · `assets/illustrations/payment-ib.svg` · `assets/illustrations/pipeline.svg` · `assets/illustrations/possible-deals.svg` · `assets/illustrations/possible-leads.svg` · `assets/illustrations/potentials-rd.svg` · `assets/illustrations/qliksense-reports.svg` · `assets/illustrations/registry.svg` · `assets/illustrations/reports-1-c.svg` · `assets/illustrations/reserve.svg` · `assets/illustrations/rwa.svg` · `assets/illustrations/sales-company.svg` · `assets/illustrations/sales-projects.svg` · `assets/illustrations/settings.svg` · `assets/illustrations/tasks.svg` · `assets/logo.svg` · `ds.css` · `fixtures/A1.bad.html` · `fixtures/A2.bad.html` · `fixtures/A4.bad.html` · `fixtures/A5.bad.html` · `fixtures/A6.bad.html` · `fixtures/B1.bad.html` · `fixtures/B12.bad.html` · `fixtures/B14.bad.html` · `fixtures/B2.bad.html` · `fixtures/B5.bad.html` · `fixtures/C1.bad.html` · `fixtures/C2.bad.html` · `fixtures/C7.bad.html` · `fixtures/F1.bad.html` · `fixtures/F2.bad.html` · `fixtures/F3.bad.html` · `fixtures/F4.bad.html` · `fixtures/F5.bad.html` · `fixtures/F5@js.bad.html` · `fixtures/L1.bad.html` · `fixtures/L2.bad.html` · `fixtures/R1.bad.html` · `fixtures/R2.bad.html` · `fixtures/R4.bad.html` · `fixtures/R5.bad.html` · `fixtures/R6.bad.html` · `fixtures/R7.bad.html` · `fixtures/R8.bad.html` · `fixtures/R9.bad.html` · `fixtures/R9@static.bad.html` · `fixtures/_base.ok.html` · `index.html` · `readme.md` · `specs/_TEMPLATE.md` · `specs/_cheatsheet.md` · `specs/_index.md` · `specs/_runtime-hooks.md` · `templates/local-component/CHANGELOG.md` · `templates/local-component/Component.css` · `templates/local-component/Component.doc.html` · `templates/local-component/Component.html` · `templates/local-component/Component.md` · `templates/local-component/README.md` · `templates/local-component/fixtures.json` · `templates/screen/Screen.html`

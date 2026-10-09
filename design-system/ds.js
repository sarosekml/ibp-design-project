/* ============================================================
   ds.js — единая точка входа для рантаймов экрана (K0, RulesAudit W0).
   Подключение — один тег в конце body, вместо ручного подбора рантаймов:
     <script src="<путь до ДС>/ds.js"></script>
   Дальше — только скрипт, специфичный для конкретного экрана (если есть).

   Что делает: догружает фиксированный список рантаймов ДС в порядке
   зависимостей (icons-data → ds-icons → остальные). Каждый рантайм сам
   ищет свою разметку и молча ничего не делает, если её нет на странице
   (например ds-modal.js без .modal просто не свяжет ни одного слоя) —
   поэтому список одинаков для любого экрана независимо от набора
   компонентов на нём. Забыть рантайм становится невозможно.

   document.write вставляет теги прямо в поток разбора документа — те же
   гарантии порядка и синхронности, что у ручного списка <script src>,
   поэтому скрипт экрана, идущий следом за ds.js (например
   01-portfolio-v2.screen.js), гарантированно выполняется после того,
   как все рантаймы ниже уже загружены. Работает только пока документ
   ещё разбирается (обычный тег в конце body, без async/defer) — так
   ds.js и подключается везде.

   Добавили новый рантайм (`<Имя>.js` в папке компонента или общий
   `utils/ds-*.js`) — впиши его путь от корня ДС в FILES ниже,
   больше никаких правок на экранах не требуется.
   ============================================================ */
(function () {
  var cur = document.currentScript;
  var base = cur ? cur.src.replace(/[^/]*$/, '') : '';
  var FILES = [
    'foundations/Icons/icons-data.js',
    'foundations/Icons/Icons.js',
    'utils/ds-float.js',
    'components/molecules/Tab/Tab.js',
    'components/organisms/Tile/Tile.js',
    'components/organisms/ProductRow/ProductRow.js',
    'components/organisms/Kanban/Kanban.js',
    'components/molecules/ContextMenu/ContextMenu.js',
    'components/organisms/Popover/Popover.js',
    'components/organisms/RiskMetric/RiskMetric.js',
    'components/molecules/Alert/Alert.js',
    'components/atoms/Chip/Chip.js',
    'components/atoms/Buttons/Buttons.js',
    'components/organisms/AllocationBar/AllocationBar.js',
    'components/organisms/Chart/Chart.js',
    'components/molecules/ButtonGroup/ButtonGroup.js',
    'components/organisms/TableFilter/TableFilter.js',
    'utils/ds-actions-overflow.js',
    'utils/ds-copy.js',
    'components/molecules/ReadOnlyField/ReadOnlyField.js',
    'components/molecules/Tooltip/Tooltip.js',
    'components/molecules/Breadcrumbs/Breadcrumbs.js',
    'components/molecules/DropdownList/DropdownList.js',
    'components/organisms/Modal/Modal.js',
    'components/organisms/Drawer/Drawer.js',
    'components/organisms/Table/Table.js',
    'components/organisms/Table/TableResize.js',
    'components/organisms/Table/TableReorder.js',
    'components/organisms/Table/TablePin.js',
    'components/organisms/Table/TableSettings.js',
    'components/molecules/Pagination/Pagination.js',
    'utils/ds-notify.js',
    'components/molecules/DatePicker/DatePicker.js',
    'components/molecules/Inputs/InputKit.js',
    'components/molecules/Inputs/Inputs.js',
    'components/organisms/NavPanel/NavPanel.js',
    'components/molecules/Splitter/Splitter.js',
    'foundations/Layout/Layout.js',
    'foundations/Illustrations/Illustrations.js',
    'components/atoms/Slider/Slider.js',
    'components/molecules/ColorPicker/ColorPicker.js',
    'foundations/Themes/Ramp.tokens.js',
    'foundations/Themes/Themes.runtime.js',
    'foundations/Themes/tokens/tokens.data.js',
    'foundations/Themes/ThemeEngine.js',
    'foundations/Themes/Themes.js',
    'utils/ds-include.js'
  ];
  /* Скрипты тем уже подключил ThemeBoot.js в <head> (загрузчик приложений и
     служебный тег страниц ДС), чтобы тема встала до первой отрисовки. Второй
     раз их не грузим (MS0013, review-2 Р8). */
  var themesReady = !!window.DS_THEME_ENGINE;
  var html = '';
  FILES.forEach(function (f) {
    if (themesReady && f.indexOf('foundations/Themes/') === 0) return;
    html += '<script src="' + base + f + '"></script>';
  });
  document.write(html);
})();

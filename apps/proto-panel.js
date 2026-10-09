/* СГЕНЕРИРОВАН proto-panel.mjs — руками не править; пересобрать:
   node .agents/tools/proto-panel.mjs (гейт сверяет, шаг panel).
   Включатель панели прототипа: ds-body.js подключает его на каждой странице,
   страницы ДС — тегом каркаса. Панель есть везде: у приложения с папкой
   proto-panel/ — сценарии из зеркала, у остальных (хаб, концепт без папки,
   ДС) — заглушка «сценария нет». Во фрейме превью своей панели нет —
   только пересылка горячих клавиш наверх. */
(function () {
  var APPS = [
    "core/drafts/new-dashboard-mvp",
    "ib/drafts/ai-bankster-prototype-v02",
    "postrade/drafts/tranche-page"
  ];
  var RUNTIME = "../.agents/proto-panel/";
  var DIR = "proto-panel", BASE = "apps", MANIFEST = "app.json"; // для записи: путь от корня проекта
  var DATA = DIR + "/panel-data.js", PAGES = "pages";
  var FILES = ["core.js", "strings.js", "store.js", "runner.js", "recorder.js", "ui.js", "tab-flows.js", "tab-comments.js", "panel.js"];
  var KEYS = ["KeyP", "ArrowRight", "ArrowLeft", "KeyS"]; // core.js → HOTKEYS: одна константа на панель и включатель
  var DSDIR = "design-system/";
  var PCSS = ["foundations/Typography/Typography.css", "foundations/Colors/Colors.css", "foundations/Colors/Palette.css", "foundations/Spacing/Spacing.css", "foundations/Radius/Radius.css", "foundations/Elevation/Elevation.css", "foundations/Illustrations/Illustrations.css", "components/atoms/Avatar/Avatar.css", "components/atoms/Buttons/Buttons.css", "components/atoms/Chip/Chip.css", "components/atoms/IconButton/IconButton.css", "components/atoms/LabelHelper/LabelHelper.css", "components/atoms/Spinner/Spinner.css", "components/molecules/Alert/Alert.css", "components/molecules/ContextMenu/ContextMenu.css", "components/molecules/DropdownList/DropdownList.css", "components/molecules/EmptyState/EmptyState.css", "components/molecules/Inputs/Inputs.css", "components/molecules/ReadOnlyField/ReadOnlyField.css", "components/atoms/Switch/Switch.css", "components/molecules/Tab/Tab.css", "components/molecules/Toast/Toast.css", "components/molecules/Tooltip/Tooltip.css", "components/organisms/Modal/Modal.css", "components/organisms/Drawer/Drawer.css"];
  var PJS = [["dsIcons", "foundations/Icons/icons-data.js", "foundations/Icons/Icons.js"], ["DSFloat", "utils/ds-float.js"], ["DSTabs", "components/molecules/Tab/Tab.js"], ["DSMenu", "components/molecules/ContextMenu/ContextMenu.js"], ["DSTooltip", "components/molecules/Tooltip/Tooltip.js"], ["DSDropdownList", "components/molecules/DropdownList/DropdownList.js"], ["DSModal", "components/organisms/Modal/Modal.js"], ["DSDrawer", "components/organisms/Drawer/Drawer.js"], ["DSChip", "components/atoms/Chip/Chip.js"], ["DSInput", "components/molecules/Inputs/InputKit.js", "components/molecules/Inputs/Inputs.js"], ["DSToast", "utils/ds-notify.js"], ["DSIllustrations", "foundations/Illustrations/Illustrations.js"], ["DSCopy", "utils/ds-copy.js"]];
  var me = document.currentScript;
  if (!me || !me.src) return;
  var apps = new URL('./', me.src), here, base;
  try { here = decodeURIComponent(location.pathname); base = decodeURIComponent(apps.pathname); } catch (e) { return; }
  var app = null;
  if (here.indexOf(base) === 0) {
    var rel = here.slice(base.length), cut = rel.lastIndexOf('/' + PAGES + '/');
    if (cut >= 0) { var cand = rel.slice(0, cut); if (APPS.indexOf(cand) >= 0) app = cand; }
  }
  if (window.top !== window.self) {
    /* страница во фрейме (превью материала): своей панели нет, но её клавиши
       работают и отсюда — нажатие уходит странице-хозяйке сообщением */
    if (!app) return;
    document.addEventListener('keydown', function (e) {
      if (!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey || KEYS.indexOf(e.code) < 0) return;
      e.preventDefault(); e.stopPropagation();
      try { window.parent.postMessage({ source: 'proto-panel', type: 'key', code: e.code }, '*'); } catch (err) { /* хозяйка недоступна */ }
    }, true);
    return;
  }
  var root = new URL('../', apps), dsRoot = new URL(DSDIR, root).href, dsPath = '';
  try { dsPath = decodeURIComponent(new URL(dsRoot).pathname); } catch (e) { dsPath = ''; }
  var onDs = !!dsPath && here.indexOf(dsPath) === 0;
  var rt = new URL(RUNTIME, apps).href;
  var appUrl = app ? new URL(app.split('/').map(encodeURIComponent).join('/') + '/', apps).href : null;
  window.__PROTO_PANEL = { app: app, appUrl: appUrl, pagesUrl: appUrl ? appUrl + PAGES + '/' : null, runtimeUrl: rt, keys: KEYS, dir: DIR, base: BASE, manifest: MANIFEST, ds: onDs };
  /* Страница ДС: нет ds.css/ds.js (каркас грузит поштучно) — добираем
     недостающие стили и рантаймы панели, уже загруженное не трогаем. */
  if (onDs) {
    var hasCss = function (f) { try { return !!document.querySelector('link[href$="/' + f + '"]'); } catch (e) { return false; } };
    var hasJs = function (f) { try { return !!document.querySelector('script[src$="/' + f + '"]'); } catch (e) { return false; } };
    var i, j, files, f;
    for (i = 0; i < PCSS.length; i++) { f = PCSS[i].split('/').pop(); if (!hasCss(f)) document.write('<link rel="stylesheet" href="' + dsRoot + PCSS[i] + '">'); }
    for (i = 0; i < PJS.length; i++) {
      if (window[PJS[i][0]]) continue;
      files = PJS[i].slice(1);
      for (j = 0; j < files.length; j++) { f = files[j].split('/').pop(); if (!hasJs(f)) document.write('<scr' + 'ipt src="' + dsRoot + files[j] + '"><\/scr' + 'ipt>'); }
    }
  }
  document.write('<link rel="stylesheet" href="' + rt + 'panel.css">');
  if (appUrl) document.write('<scr' + 'ipt src="' + appUrl + DATA + '"><\/scr' + 'ipt>');
  for (var i = 0; i < FILES.length; i++) document.write('<scr' + 'ipt src="' + rt + FILES[i] + '"><\/scr' + 'ipt>');
})();

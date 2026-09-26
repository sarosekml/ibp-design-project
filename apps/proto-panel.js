/* СГЕНЕРИРОВАН proto-panel.mjs — руками не править; пересобрать:
   node .agents/tools/proto-panel.mjs (гейт сверяет, шаг panel).
   Включатель панели прототипа: ds-body.js подключает его на каждой странице.
   Панель есть только у приложений из списка — у них есть папка proto-panel/;
   на остальных страницах и на хабе файл ничего не делает, во фрейме
   только пересылает горячие клавиши панели наверх. */
(function () {
  var APPS = [
    "ib/drafts/ai-bankster-prototype-v02"
  ];
  var RUNTIME = "../.agents/proto-panel/";
  var DIR = "proto-panel", BASE = "apps", MANIFEST = "app.json"; // для записи: путь от корня проекта
  var DATA = DIR + "/panel-data.js", PAGES = "pages";
  var FILES = ["core.js", "strings.js", "store.js", "runner.js", "recorder.js", "ui.js", "tab-flows.js", "tab-comments.js", "panel.js"];
  var KEYS = ["KeyP", "ArrowRight", "ArrowLeft", "KeyS"]; // core.js → HOTKEYS: одна константа на панель и включатель
  var me = document.currentScript;
  if (!me || !me.src || !APPS.length) return;
  var apps = new URL('./', me.src), here, base;
  try { here = decodeURIComponent(location.pathname); base = decodeURIComponent(apps.pathname); } catch (e) { return; }
  if (here.indexOf(base) !== 0) return; // хаб и всё вне каталога приложений
  var rel = here.slice(base.length), cut = rel.lastIndexOf('/' + PAGES + '/');
  if (cut < 0) return;
  var app = rel.slice(0, cut);
  if (APPS.indexOf(app) < 0) return; // приложение без панели
  if (window.top !== window.self) {
    /* страница во фрейме (превью материала): своей панели нет, но её клавиши
       работают и отсюда — нажатие уходит странице-хозяйке сообщением */
    document.addEventListener('keydown', function (e) {
      if (!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey || KEYS.indexOf(e.code) < 0) return;
      e.preventDefault(); e.stopPropagation();
      try { window.parent.postMessage({ source: 'proto-panel', type: 'key', code: e.code }, '*'); } catch (err) { /* хозяйка недоступна */ }
    }, true);
    return;
  }
  var rt = new URL(RUNTIME, apps).href;
  var appUrl = new URL(app.split('/').map(encodeURIComponent).join('/') + '/', apps).href;
  window.__PROTO_PANEL = { app: app, appUrl: appUrl, pagesUrl: appUrl + PAGES + '/', runtimeUrl: rt, keys: KEYS, dir: DIR, base: BASE, manifest: MANIFEST };
  document.write('<link rel="stylesheet" href="' + rt + 'panel.css">');
  document.write('<scr' + 'ipt src="' + appUrl + DATA + '"><\/scr' + 'ipt>');
  for (var i = 0; i < FILES.length; i++) document.write('<scr' + 'ipt src="' + rt + FILES[i] + '"><\/scr' + 'ipt>');
})();

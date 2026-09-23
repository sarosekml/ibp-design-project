/* Адрес дизайн-системы — строка DS_PATH ниже, и только она: путь от папки
   этого файла. Перенос ДС = правка одной строки.
   Остальное сгенерировано boot-build.mjs — руками не править; после правки
   адреса сверить: node .agents/tools/boot-build.mjs --check (гейт, шаг boot). */
var DS_PATH = "../design-system/";

/* Первый тег <head> экрана, обычный (без async/defer): ДС — DS_PATH от
   собственного адреса этого файла. */
(function () {
  var me = document.currentScript;
  if (!me || !me.src) { console.error("apps/ds-config.js подключён не обычным тегом — ДС не загрузится"); return; }
  var DS = new URL(DS_PATH, me.src).href;
  window.__DS_ROOT = DS;
  document.documentElement.style.setProperty('--boot-bg-illustration', 'url("' + DS + 'assets/illustrations/background-illustration.svg")');
  document.write('<link rel="icon" type="image/svg+xml" href="' + DS + 'assets/logo.svg">');
  document.write('<link rel="stylesheet" href="' + DS + 'ds.css">');
})();

/* СГЕНЕРИРОВАН boot-build.mjs из project.json → designSystem.mount. Руками не править:
   пересобрать — node .agents/tools/boot-build.mjs (гейт сверяет, шаг boot). */
/* Первый тег <head> экрана, обычный (без async/defer): корень проекта — от
   собственного адреса, ДС — "design-system/" от него. */
(function () {
  var me = document.currentScript;
  if (!me || !me.src) { console.error("boot/ds-head.js подключён не обычным тегом — ДС не загрузится"); return; }
  var root = me.src.replace(/boot\/ds-head\.js(?:[?#].*)?$/, '');
  var DS = root + "design-system/";
  window.__DS_ROOT = DS;
  document.documentElement.style.setProperty('--boot-bg-illustration', 'url("' + DS + 'assets/illustrations/background-illustration.svg")');
  document.write('<link rel="icon" type="image/svg+xml" href="' + DS + 'assets/logo.svg">');
  document.write('<link rel="stylesheet" href="' + DS + 'ds.css">');
})();

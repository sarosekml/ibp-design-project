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
  /* Тема ДС до первой отрисовки (RE0005): ?theme= или сохранённый выбор.
     Без выбранной темы атрибут не ставится — legacy как прежде. */
  try {
    var tm = /[?&]theme=([^&#]*)/.exec(window.location.search || '');
    var th = tm ? decodeURIComponent(tm[1]) : window.localStorage.getItem('ds.theme');
    if (th === 'ibp-light') th = 'ibp-neo-light';
    if (th === 'ibp-dark') th = 'ibp-neo-dark';
    if (th && th !== 'legacy' && th !== 'ibp-legacy') document.documentElement.setAttribute('data-theme', th);
  } catch (e) { /* хранилище недоступно, ?theme= нет — legacy */ }
  /* Фон стартовой страницы (Illustrations): под тёмной темой — тёмный
     вариант; ставится после темы и обновляется на её смену (RE0011). */
  var applyBg = function () {
    var thNow = document.documentElement.getAttribute('data-theme');
    var dark = /-dark$/.test(thNow || '') || thNow === 'service';
    document.documentElement.style.setProperty('--boot-bg-illustration', 'url("' + DS + 'assets/illustrations/background-illustration' + (dark ? '-dark' : '') + '.svg")');
  };
  applyBg();
  if (document.addEventListener) document.addEventListener('ds:themechange', applyBg);
  document.write('<link rel="icon" type="image/svg+xml" href="' + DS + 'assets/logo.svg">');
  document.write('<link rel="stylesheet" href="' + DS + 'ds.css">');
  document.write('<scr' + 'ipt src="' + DS + 'foundations/Themes/ThemeBoot.js"><\/scr' + 'ipt>');
})();

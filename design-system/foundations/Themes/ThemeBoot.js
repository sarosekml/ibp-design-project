/* ============================================================
   ThemeBoot.js — синхронный загрузчик тем в <head> (MS0013).

   Пишет теги скриптов тем по порядку, чтобы CSS выбранной темы встал до
   первой отрисовки: алгоритм рамп, рантайм-данные (генерат
   Themes.runtime.js, без сборочных полей источника — review-2 Р8),
   зеркало файлов тем, компилятор и Themes.js. ds.js второй раз их не грузит.
   ============================================================ */
(function () {
  'use strict';
  var root = new URL('../../', document.currentScript.src).href;
  ['Ramp.tokens.js', 'Themes.runtime.js', 'tokens/tokens.data.js', 'ThemeEngine.js', 'Themes.js'].forEach(function (file) {
    document.write('<scr' + 'ipt src="' + root + 'foundations/Themes/' + file + '"><\/scr' + 'ipt>');
  });
})();

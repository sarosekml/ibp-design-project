/* Синхронный тег head: CSS своей темы готов до первого рендера. */
(function(){
  'use strict';
  var root=new URL('../../',document.currentScript.src).href;
  ['Ramp.tokens.js','Themes.tokens.js','tokens/tokens.data.js','ThemeEngine.js','Themes.js'].forEach(function(file){document.write('<scr'+'ipt src="'+root+'foundations/Themes/'+file+'"><\/scr'+'ipt>');});
})();

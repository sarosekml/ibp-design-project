/* ============================================================
   DS THEME BOOT — служебный тег <head> страниц документации ДС (RE0005, Э3).
   Ставит тему до первой отрисовки и подключает её CSS.

   Зачем отдельный тег: страницы ДС не грузят загрузчик приложений
   (`apps/ds-config.js` / `apps/ds-body.js`) — их стили подключены поштучно.
   Один тег в <head> делает то же, что загрузчик на экранах: ставит атрибут
   `data-theme` на <html> из `?theme=` или сохранённого выбора
   (`localStorage`, ключ `ds.theme`), затем подключает
   `foundations/Themes/Themes.css` и `Themes.pages.css` (второй — только
   страницам ДС, на экраны не попадает).

   Порядок в <head>: тег ставится ПОСЛЕДНИМ, после `<style>` страницы.
   `document.write` вставляет CSS тем и рантайм на его место — генерат идёт
   после CSS компонентов и собственных стилей страницы: точечные правила
   темы (`:where([data-theme]…)`) и правила страниц бьют по порядку, а
   переменные ролей сильнее и по специфичности (`:root[data-theme]`).

   Следом тег подключает рантайм тем: данные `Themes.tokens.js`
   (`window.DS_THEMES`) и `foundations/Themes/Themes.js` (сервисное окно,
   `DSTheme`). На экранах те же два файла грузит `ds.js`.
   Тег на 65 страницах ставится разовым скриптом задачи; новый компонент
   получает его из эталона
   `.agents/skills/docs-split/references/skeleton.md`.
   ============================================================ */
(function () {
  'use strict';
  var me = document.currentScript;
  if (!me || !me.src) {
    console.error('ds-theme-boot.js подключён не обычным тегом — тема не применится');
    return;
  }
  var ROOT = new URL('../', me.src).href;   /* docs-kit/ → корень ДС */
  var KEY = 'ds.theme';
  var LEGACY = 'legacy';

  function fromUrl() {
    var m = /[?&]theme=([^&#]*)/.exec(window.location.search || '');
    return m ? decodeURIComponent(m[1]) : null;
  }
  function fromStore() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
  }

  var theme = fromUrl() || fromStore() || '';
  var root = document.documentElement;
  if (theme && theme !== LEGACY) root.setAttribute('data-theme', theme);
  else root.removeAttribute('data-theme');

  document.write('<link rel="stylesheet" href="' + ROOT + 'foundations/Themes/Themes.css">');
  document.write('<link rel="stylesheet" href="' + ROOT + 'foundations/Themes/Themes.pages.css">');
  document.write('<scr' + 'ipt src="' + ROOT + 'foundations/Themes/Themes.tokens.js"><\/scr' + 'ipt>');
  document.write('<scr' + 'ipt src="' + ROOT + 'foundations/Themes/Themes.js"><\/scr' + 'ipt>');
})();

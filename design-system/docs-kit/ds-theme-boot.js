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

   Следом ThemeBoot подключает профили, зеркало JSON и общий компилятор,
   затем Themes.js применяет выбор до первой отрисовки (`DSTheme`).
   На экранах тот же ThemeBoot грузит apps/ds-config.js.
   Новый компонент
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
  if (theme === 'ibp-light') theme = 'ibp-neo-light';
  if (theme === 'ibp-dark') theme = 'ibp-neo-dark';
  if (theme && theme !== LEGACY && theme !== 'ibp-legacy') root.setAttribute('data-theme', theme);
  else root.removeAttribute('data-theme');

  /* Эти зависимости раньше добирало окно Themes.js. Их используют и
     сами doc-страницы, поэтому удаление окна не должно удалять их CSS. */
  ['components/atoms/IconButton/IconButton.css','components/atoms/Buttons/Buttons.css','components/atoms/Link/Link.css'].forEach(function(file){
    if(!document.querySelector('link[rel="stylesheet"][href$="/'+file.split('/').pop()+'"]'))document.write('<link rel="stylesheet" href="'+ROOT+file+'">');
  });
  document.write('<link rel="stylesheet" href="' + ROOT + 'foundations/Themes/Themes.css">');
  document.write('<link rel="stylesheet" href="' + ROOT + 'foundations/Themes/Themes.pages.css">');
  document.write('<scr' + 'ipt src="' + ROOT + 'foundations/Themes/ThemeBoot.js"><\/scr' + 'ipt>');
})();

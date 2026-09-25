/* СГЕНЕРИРОВАН boot-build.mjs. Руками не править; адрес ДС — в ds-config.js. */
/* Тег вместо ds.js, перед экранным скриптом. Дополнительные скрипты ДС —
   атрибутом data-ds, пути внутри ДС через пробел: data-ds="scripts/ibp-home.js". */
(function () {
  var DS = window.__DS_ROOT;
  if (!DS) { console.error("ds-config.js не подключён в <head> — ДС не загрузится"); return; }
  var me = document.currentScript;
  var extra = ((me && me.getAttribute('data-ds')) || '').split(/\s+/).filter(Boolean);
  var tags = ['scripts/ds.js'].concat(extra);
  for (var i = 0; i < tags.length; i++) document.write('<scr' + 'ipt src="' + DS + tags[i] + '"><\/scr' + 'ipt>');
  /* панель прототипа: включатель (project.json → protoPanel, генерат proto-panel.mjs) */
  if (me && me.src) document.write('<scr' + 'ipt src="' + new URL("proto-panel.js", me.src).href + '"><\/scr' + 'ipt>');
})();

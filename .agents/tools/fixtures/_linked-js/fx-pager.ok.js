/* Фикстура сенсора: вызов колонтитула Pagination В НОРМЕ — опции пагинатора
   вложены в pager, сводка — в info (вход правила Б41, эталон _linked-js.ok.html). */
var fxFoot = document.getElementById('fx-foot');
if (fxFoot && window.DSPagination) fxFoot.appendChild(window.DSPagination.footer({
  info: { items: [['Всего', '9']], warn: '' },
  pager: { total: 9, page: 1, pageSize: 50, onChange: function () {} }
}));

/* Фикстура сенсора: ДЕФЕКТ Б41 — опции пагинатора переданы колонтитулу плоско,
   без pager; ДС рисует значения по умолчанию (вход Б41@linked-js.bad.html). */
var fxFoot = document.getElementById('fx-foot');
if (fxFoot && window.DSPagination) fxFoot.appendChild(window.DSPagination.footer({
  total: 9, page: 1, pageSize: 50, onChange: function () {}
}));

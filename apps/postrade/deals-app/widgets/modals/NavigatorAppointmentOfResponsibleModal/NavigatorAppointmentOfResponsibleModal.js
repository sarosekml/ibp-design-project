/* ============================================================
   NavigatorAppointmentOfResponsibleModal.js — окно «Назначение
   ответственного» (макет screenflow дизайнера).

   Открывает его тайл «Заведение сделки» (Navigator) по полю modal перехода
   статусной модели: кнопка «Назначить ответственного» на вкладке «ЦУП»
   (tsup_appoint).

   Делает то, чего нет в рантаймах ДС:
   1) подставляет в список «Ответственный от ЦУП» справочник сотрудников
      (MOCK_TEAM_ROSTER): ФИО, под ним табельный номер; в поле — «ФИО номер»,
      как в окне «Команда сделки» (PostDealTeamModal.personValue); при открытии
      в поле — нынешний сотрудник ЦУП сделки (tsupEmployee), если он есть;
   2) показывает ГСЗ сделки (gsz) и таблицу «Сделки ГСЗ» — другие сделки
      DealsStore с той же ГСЗ: номер, наименование, сотрудник ЦУП. Текущая
      сделка в таблицу не входит (допущение 10.10.2026, вопрос 2 паспорта).
      ГСЗ не указана или других сделок нет — пустое состояние таблицы;
   3) держит «Назначить» недоступной, пока ответственный не выбран (допущение
      10.10.2026, вопрос 3 паспорта);
   4) по «Назначить» отдаёт тайлу { patch: { tsupEmployee, tsupEmployeeTab } }
      и закрывает окно: ответственный попадает в команду сделки. Крестик и
      Esc — без назначения.

   API — реестр окон навигатора (его читает страница в openModal тайла):
     PostNavigatorModals.NavigatorAppointmentOfResponsibleModal.open(ctx, done)
       ctx = { deal, transition, deals? } — запись сделки, переход модели и
       (необязательно) список сделок для таблицы, по умолчанию
       DealsStore.list(); done({ patch }) — после «Назначить»
     PostNavigatorModals.NavigatorAppointmentOfResponsibleModal.use(ctx) —
       нарисовать без открытия (витрина)
   ============================================================ */
(function () {
  'use strict';

  var NAME = 'NavigatorAppointmentOfResponsibleModal';
  var scrim = document.getElementById('nav-appoint-scrim');
  if (!scrim) return;
  var employee = scrim.querySelector('#nav-appoint-employee');
  var list = scrim.querySelector('#nav-appoint-employee-list');
  var gsz = scrim.querySelector('[data-nav-appoint-gsz]');
  var table = scrim.querySelector('[data-nav-appoint-table]');
  var empty = scrim.querySelector('[data-nav-appoint-empty]');
  var emptyText = scrim.querySelector('[data-nav-appoint-empty-text]');
  var save = scrim.querySelector('[data-nav-appoint-save]');
  var pending = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* «ФИО номер» ↔ { name, tab } — контракт окна «Команда сделки»; без него
     (окно не подключено) — только ФИО. */
  function team() { return window.PostDealTeamModal || null; }
  function personValue(name, tab) { return team() ? team().personValue(name, tab) : (name || ''); }
  function splitPerson(v) { return team() ? team().splitPerson(v) : { name: String(v || '').trim(), tab: '' }; }

  /* Строка списка: ФИО, под ним табельный номер — как в окне «Команда сделки» */
  function optionHTML(p) {
    return '<button type="button" class="ddl__item" role="option" aria-selected="false" data-tab="' + esc(p.tab) + '">'
      + '<span class="ddl__item-body"><span class="ddl__item-label">' + esc(p.name) + '</span>'
      + '<span class="ds-helper"><span class="ds-helper__text">' + esc(p.tab) + '</span></span></span></button>';
  }

  var listReady = false;
  function fillList() {
    if (listReady || !list) return;
    listReady = true;
    list.innerHTML = (window.MOCK_TEAM_ROSTER || []).map(optionHTML).join('');
    var field = scrim.querySelector('[data-ddl="nav-appoint-employee-list"]');
    if (!field || !window.DSDropdownList) return;
    window.DSDropdownList.bind(field, {
      list: list,
      onSelect: function (it) {
        var label = it.querySelector('.ddl__item-label');
        if (employee && label) employee.value = personValue(label.textContent.trim(), it.getAttribute('data-tab') || '');
        sync();
      }
    });
  }

  function cell(value) {
    var v = String(value == null ? '' : value).trim();
    return '<div class="tc">' + (v
      ? '<span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(v) + '</span></span>'
      : '<span class="tc__empty">—</span>') + '</div>';
  }

  function rowHTML(d) {
    return '<div class="tbl__row lc-nav-appoint__cols"><div class="tc tc--separator"></div>'
      + cell(d.id) + cell(d.name) + cell(d.tsupEmployee)
      + '<div class="tc tc--separator"></div></div>';
  }

  function paintTable(deal, deals) {
    var group = String(deal.gsz || '').trim();
    var rows = group
      ? deals.filter(function (d) { return d && d.id !== deal.id && String(d.gsz || '').trim() === group; })
      : [];
    if (table) {
      table.querySelectorAll('.tbl__row:not(.tbl__row--head)').forEach(function (r) { r.remove(); });
      table.insertAdjacentHTML('beforeend', rows.map(rowHTML).join(''));
      table.hidden = !rows.length;
    }
    if (empty) empty.hidden = !!rows.length;
    if (emptyText) emptyText.textContent = group ? 'Других сделок у этой ГСЗ нет' : 'ГСЗ в описании сделки не указана';
  }

  function sync() { if (save) save.disabled = !splitPerson(employee && employee.value).name; }

  function paint(ctx) {
    ctx = ctx || {};
    var deal = ctx.deal || {};
    var store = window.DealsStore;
    var deals = ctx.deals || (store ? store.list() : []);
    fillList();
    if (employee) employee.value = personValue(deal.tsupEmployee || '', deal.tsupEmployeeTab || '');
    /* Прочерк — значение, а не подсказка (ReadOnlyField) */
    if (gsz) gsz.textContent = String(deal.gsz || '').trim() || '—';
    paintTable(deal, deals);
    if (window.DSInput) window.DSInput.syncAll(scrim);
    sync();
  }

  function inline() { return scrim.classList.contains('modal-scrim--inline'); }

  function open(ctx, done) {
    paint(ctx);
    pending = done || null;
    if (window.DSModal && !inline()) window.DSModal.open(scrim);
  }

  if (employee) ['input', 'change'].forEach(function (type) { employee.addEventListener(type, sync); });

  if (save) {
    save.addEventListener('click', function () {
      if (save.disabled) return;
      var done = pending;
      pending = null;
      var p = splitPerson(employee.value);
      var extra = { patch: { tsupEmployee: p.name, tsupEmployeeTab: p.tab } };
      if (window.DSModal && !inline()) window.DSModal.closeTop();
      if (done) done(extra);
    });
  }

  window.PostNavigatorModals = window.PostNavigatorModals || {};
  window.PostNavigatorModals[NAME] = { open: open, use: paint };
})();

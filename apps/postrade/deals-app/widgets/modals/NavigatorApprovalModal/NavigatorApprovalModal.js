/* ============================================================
   NavigatorApprovalModal.js — окно «Подтвердите действие»: приём сделки на
   мониторинг РМ, ПМ или ПМЗ (макет screenflow дизайнера).

   Открывает его тайл «Заведение сделки» (Navigator) по полю modal перехода
   статусной модели: кнопки «РМ принял», «ПМ принял», «ПМЗ принял». Чья
   отметка — говорит переход (PostNavigator.markOf): rm, pm или pmz — это и
   вариант окна. У ПМЗ сверху Switch «С обеспечением».

   Делает то, чего нет в рантаймах ДС:
   1) подставляет в список «Согласующий» справочник сотрудников
      (MOCK_TEAM_ROSTER): ФИО, под ним табельный номер; в поле — «ФИО номер»,
      как в окне «Команда сделки» (PostDealTeamModal.personValue);
   2) заполняет окно отметкой, если она уже стоит, иначе — пусто;
   3) держит «Сохранить» недоступной, пока нет согласующего и настоящей даты
      ДД.ММ.ГГГГ (допущение 10.10.2026, вопрос 3 паспорта);
   4) по «Сохранить» отдаёт тайлу отметку { approver, approverTab,
      approvalDate[, withCollateral] } и закрывает окно. Крестик и Esc — без
      отметки, статус не меняется.

   API — реестр окон навигатора (его читает страница в openModal тайла):
     PostNavigatorModals.NavigatorApprovalModal.open(ctx, done)
       ctx = { deal, transition } — запись сделки и переход модели;
       done({ mark }) — вызывается после «Сохранить»
     PostNavigatorModals.NavigatorApprovalModal.use(ctx) — нарисовать без
       открытия (витрина)
   ============================================================ */
(function () {
  'use strict';

  var NAME = 'NavigatorApprovalModal';
  var scrim = document.getElementById('nav-approval-scrim');
  if (!scrim) return;
  var root = scrim.querySelector('.lc-nav-approval');
  var flag = scrim.querySelector('.sw__input[name="withCollateral"]');
  var approver = scrim.querySelector('#nav-approval-approver');
  var list = scrim.querySelector('#nav-approval-approver-list');
  var date = scrim.querySelector('#nav-approval-date');
  var save = scrim.querySelector('[data-nav-approval-save]');
  var MARK_FIELD = 'monitoringAcceptance';
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

  /* Настоящая дата ДД.ММ.ГГГГ (31.02 — не дата) */
  function isDate(value) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(value || '').trim());
    if (!m) return false;
    var d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    return d.getFullYear() === Number(m[3]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[1]);
  }

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
    var field = scrim.querySelector('[data-ddl="nav-approval-approver-list"]');
    if (!field || !window.DSDropdownList) return;
    window.DSDropdownList.bind(field, {
      list: list,
      onSelect: function (it) {
        var label = it.querySelector('.ddl__item-label');
        if (approver && label) approver.value = personValue(label.textContent.trim(), it.getAttribute('data-tab') || '');
        sync();
      }
    });
  }

  function variant() { return root ? root.getAttribute('data-variant') : 'rm'; }

  function sync() {
    if (save) save.disabled = !(splitPerson(approver && approver.value).name && isDate(date && date.value));
  }

  function paint(ctx) {
    ctx = ctx || {};
    fillList();
    var nav = window.PostNavigator;
    var key = (nav && ctx.transition && nav.markOf(ctx.transition)) || 'rm';
    var mark = ((ctx.deal || {})[MARK_FIELD] || {})[key] || {};
    if (root) root.setAttribute('data-variant', key);
    if (flag) flag.checked = !!mark.withCollateral;
    if (approver) approver.value = personValue(mark.approver || '', mark.approverTab || '');
    if (date) date.value = mark.approvalDate || '';
    if (window.DSInput) window.DSInput.syncAll(scrim);
    sync();
  }

  function inline() { return scrim.classList.contains('modal-scrim--inline'); }

  function open(ctx, done) {
    paint(ctx);
    pending = done || null;
    if (window.DSModal && !inline()) window.DSModal.open(scrim);
  }

  function collect() {
    var p = splitPerson(approver && approver.value);
    var mark = { approver: p.name, approverTab: p.tab, approvalDate: String(date.value).trim() };
    if (variant() === 'pmz') mark.withCollateral = !!(flag && flag.checked);
    return mark;
  }

  [approver, date].forEach(function (el) {
    if (!el) return;
    ['input', 'change'].forEach(function (type) { el.addEventListener(type, sync); });
  });
  scrim.addEventListener('ds-input:clear', sync);

  if (save) {
    save.addEventListener('click', function () {
      if (save.disabled) return;
      var done = pending;
      pending = null;
      var extra = { mark: collect() };
      if (window.DSModal && !inline()) window.DSModal.closeTop();
      if (done) done(extra);
    });
  }

  window.PostNavigatorModals = window.PostNavigatorModals || {};
  window.PostNavigatorModals[NAME] = { open: open, use: paint };
})();

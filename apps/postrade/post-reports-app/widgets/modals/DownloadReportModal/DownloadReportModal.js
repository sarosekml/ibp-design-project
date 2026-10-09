/* ============================================================
   DownloadReportModal.js — поведение окон выгрузки расчета FV.

   Делает то, чего нет в рантаймах ДС, и только это:
   1) с шифрованием (сеть Сигма): список получателей — добавление сотрудника
      из справочника и сотрудника вне штата по e-mail, чекбоксы строк и
      «выбрать всех»; «Выгрузить» выключена, пока не отмечен ни один;
   2) без шифрования (сеть Альфа): подтверждение действия;
   3) по «Выгрузить» / «Подтвердить» закрывает окно и отдаёт страницы
      контекст выгрузки и список получателей. Саму выгрузку и её ошибку
      показывает страница: снекбар для расчета, алерт в окне ФИ для файла.

   API:
     PostDownloadReportModal.bind(encScrim, plainScrim, opts) → api
       opts.employees   — справочник FvEmployeeRsDto[]
       opts.run(ctx, recipients) — выгрузка: ctx — то, что передали в api.open
     api.open(ctx)      — ctx.encrypted решает, какое окно открыть;
                          ctx.title — заголовок окна с шифрованием
   ============================================================ */
(function () {
  'use strict';

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  function bind(encScrim, plainScrim, opts) {
    if (!encScrim || !plainScrim) return null;
    if (encScrim.__fvDownload) return encScrim.__fvDownload;
    opts = opts || {};
    var employees = opts.employees || [];

    var title = encScrim.querySelector('[data-fv-dl-title]');
    var employeeInput = encScrim.querySelector('[data-fv-dl-employee]');
    var employeeList = encScrim.querySelector('#fv-dl-employee-list');
    var addEmployee = encScrim.querySelector('[data-fv-dl-add-employee]');
    var emailInput = encScrim.querySelector('[data-fv-dl-email]');
    var addEmail = encScrim.querySelector('[data-fv-dl-add-email]');
    var table = encScrim.querySelector('[data-fv-dl-rows]');
    var allBox = encScrim.querySelector('[data-fv-dl-all]');
    var submit = encScrim.querySelector('[data-fv-dl-submit]');
    var confirmBtn = plainScrim.querySelector('[data-fv-dl-confirm]');
    if (!employeeInput || !table || !submit || !confirmBtn) return null;

    var rows = [];        // { key, fullName, positionName, externalEmail, internalEmail, checked }
    var picked = null;    // сотрудник, выбранный в автокомплите
    var ctx = null;

    function option(e) {
      return '<button class="ddl__item" role="option" aria-selected="false" data-employee="' + esc(e.employeeId) + '">'
        + '<span class="ddl__item-body"><span class="ddl__item-label">' + esc(e.fullName) + '</span></span></button>';
    }
    function fillOptions(query) {
      var q = (query || '').trim().toLowerCase();
      var list = employees.filter(function (e) { return !q || e.fullName.toLowerCase().indexOf(q) >= 0; });
      employeeList.innerHTML = list.length
        ? list.map(option).join('')
        : '<div class="ddl__state ddl__state--empty">Ничего не найдено</div>';
    }

    function rowHtml(r, idx, grid) {
      return '<div class="tbl__row" data-row="' + idx + '" data-key="' + esc(r.key) + '" style="grid-template-columns:' + grid + ';">'
        + '<div class="tc tc--separator"></div>'
        + '<div class="tc tc--select"><label class="cb cb--no-content"><input type="checkbox" class="cb__input" aria-label="Выбрать получателя"' + (r.checked ? ' checked' : '') + '><span class="cb__box"><span class="cb__mark"><i data-icon="check"></i></span></span></label></div>'
        + '<div class="tc"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(r.fullName || '—') + '</span></span></div>'
        + '<div class="tc"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(r.positionName || '—') + '</span></span></div>'
        + '<div class="tc"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(r.externalEmail || '—') + '</span></span></div>'
        + '<div class="tc"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(r.internalEmail || '—') + '</span></span></div>'
        + '<div class="tc tc--separator"></div></div>';
    }
    function sync() {
      var on = rows.filter(function (r) { return r.checked; }).length;
      allBox.checked = rows.length > 0 && on === rows.length;
      allBox.indeterminate = on > 0 && on < rows.length;
      submit.disabled = on === 0;
    }
    /* Шапку ищем в момент отрисовки: рантаймы таблицы ДС вправе её перестроить (Л185) */
    function draw() {
      var head = table.querySelector('.tbl__row--head');
      var grid = head ? head.style.gridTemplateColumns : '';
      Array.prototype.forEach.call(table.querySelectorAll('.tbl__row:not(.tbl__row--head)'), function (n) { n.remove(); });
      table.insertAdjacentHTML('beforeend', rows.map(function (r, i) { return rowHtml(r, i, grid); }).join(''));
      if (window.dsIcons) window.dsIcons.apply(table);
      sync();
    }
    function rowNode(key) {
      return Array.prototype.filter.call(table.querySelectorAll('.tbl__row[data-key]'), function (n) { return n.getAttribute('data-key') === key; })[0] || null;
    }
    /* показать строку получателя: прокрутка и кратковременная подсветка */
    function reveal(key) {
      var n = rowNode(key);
      if (!n) return;
      if (n.scrollIntoView) n.scrollIntoView({ block: 'nearest' });
      n.classList.add('tbl__row--focus');
      setTimeout(function () { n.classList.remove('tbl__row--focus'); }, 1600);
    }

    /* уже добавленный получатель не дублируется: строка отмечается и подсвечивается */
    function addRow(r) {
      var have = rows.filter(function (x) { return x.key === r.key; })[0];
      if (have) have.checked = true; else { r.checked = true; rows.push(r); }
      draw();
      reveal(r.key);
    }

    /* сотрудник — по выбору из списка либо по точному совпадению ФИО в поле */
    function currentEmployee() {
      var v = employeeInput.value.trim().toLowerCase();
      if (picked && picked.fullName.toLowerCase() === v) return picked;
      return employees.filter(function (e) { return e.fullName.toLowerCase() === v; })[0] || null;
    }
    function syncAdders() {
      addEmployee.disabled = !currentEmployee();
      addEmail.disabled = !EMAIL_RE.test(emailInput.value.trim());
    }
    function doAddEmployee() {
      var e = currentEmployee();
      if (!e) return;
      addRow({ key: e.employeeId, fullName: e.fullName, positionName: e.positionName, externalEmail: e.externalEmail, internalEmail: e.internalEmail });
      employeeInput.value = ''; picked = null; fillOptions(''); syncAdders();
    }
    function doAddEmail() {
      var mail = emailInput.value.trim();
      if (!EMAIL_RE.test(mail)) return;
      /* домен определяет только сам адрес: колонку второго домена не заполняем */
      var internal = /omega|alfa/i.test(mail);
      addRow({ key: 'mail:' + mail.toLowerCase(), fullName: '', positionName: '', externalEmail: internal ? '' : mail, internalEmail: internal ? mail : '' });
      emailInput.value = ''; syncAdders();
    }

    window.DSDropdownList.bind(encScrim.querySelector('[data-ddl="fv-dl-employee-list"]'), {
      onSelect: function (item) {
        var id = item.getAttribute('data-employee');
        picked = employees.filter(function (e) { return e.employeeId === id; })[0] || null;
        employeeInput.value = picked ? picked.fullName : '';
        syncAdders();
      }
    });
    employeeInput.addEventListener('input', function () {
      fillOptions(employeeInput.value);
      syncAdders();
    });
    employeeInput.addEventListener('change', syncAdders);
    encScrim.addEventListener('ds-input:clear', function (e) {
      if (e.target.closest && e.target.closest('.inp') && e.target.closest('.inp').contains(employeeInput)) {
        employeeInput.value = ''; picked = null; fillOptions('');
      }
      syncAdders();
    });
    emailInput.addEventListener('input', syncAdders);
    emailInput.addEventListener('change', syncAdders);
    /* Enter в поле — то же, что «Добавить» (если список автокомплита не выбирает опцию) */
    emailInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); doAddEmail(); } });
    employeeInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && currentEmployee()) { e.preventDefault(); doAddEmployee(); }
    });

    addEmployee.addEventListener('click', doAddEmployee);
    addEmail.addEventListener('click', doAddEmail);

    table.addEventListener('change', function (e) {
      var box = e.target.closest('.tc--select .cb__input');
      if (!box) return;
      var row = box.closest('.tbl__row');
      rows[+row.getAttribute('data-row')].checked = box.checked;
      sync();
    });
    allBox.addEventListener('change', function () {
      rows.forEach(function (r) { r.checked = allBox.checked; });
      draw();
    });

    function finish(recipients) {
      if (window.DSModal) window.DSModal.closeTop(true);
      if (opts.run) opts.run(ctx, recipients);
    }
    submit.addEventListener('click', function () {
      if (submit.disabled) return;
      finish(rows.filter(function (r) { return r.checked; }));
    });
    confirmBtn.addEventListener('click', function () { finish([]); });

    function open(c) {
      ctx = c || {};
      if (!ctx.encrypted) { window.DSModal.open(plainScrim, { nested: true }); return; }
      title.textContent = ctx.title || 'Выгрузка расчета';
      employeeInput.value = ''; emailInput.value = ''; picked = null;
      fillOptions('');
      syncAdders();
      draw();
      window.DSModal.open(encScrim, { nested: true });
    }

    var api = { open: open };
    encScrim.__fvDownload = api;
    return api;
  }

  window.PostDownloadReportModal = { bind: bind };
})();

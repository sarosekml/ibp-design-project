/* ============================================================
   DealFinancialInstrumentEditModal.js — окно «ФИ: <номер>. <тип>»
   (макет «Изменение ФИ», 02.10.2026).

   Подключается ПОСЛЕ DealFinancialInstrumentCreateModal.js: списки и
   ошибка поля — его общий слой PostFinInstrumentForm.

   Окно:
     – открывается событием 'fiaction' (action EDIT, id карточки) тайла
       «Финансовые инструменты» — пункт «Изменить» меню карточки (временный:
       что в меню, не решено, 02.10.2026);
     – заголовок — «ФИ: <номер>. <тип>»; поля — только те, что у типа
       карточки (FinInstrumentsStore.fieldsOf), остальные спрятаны;
     – списки: контрагенты — база контрагентов, участники сделки первыми
       (FinInstrumentsStore.counterpartyOptions); FV/AC — справочник;
       опцион, включённый в расчёт МСФО, — «Пут: РЕПО» и «Колл: РЕПО» дерева
       продуктов сделки (optionNodes);
     – IRR — только число: цифры и одна запятая, постфикс «%»;
     – «Сохранить»: наименование обязательно — пустое подсвечивается ошибкой,
       окно остаётся открытым; иначе FinInstrumentsStore.update и commit,
       окно закрывается, тайл перерисовывается по commit стора.
   Крестик, Esc и подложка — без изменений.

   API: PostModalFinInstrumentEdit.open(id) · use(id) — заполнить без
        открытия (витрина)
   ============================================================ */
(function () {
  'use strict';

  var scrim = typeof document !== 'undefined' && document.getElementById('fi-edit-scrim');
  var F = window.PostFinInstrumentForm;
  if (!scrim || !F) return;

  function store() { return window.FinInstrumentsStore; }
  function has(v) { return v !== null && v !== undefined && v !== ''; }
  function el(id) { return scrim.querySelector('#' + id); }

  /* Только число: цифры и одна запятая (точка становится запятой). */
  function sanitize(text) {
    var s = String(text == null ? '' : text);
    var out = '';
    var sep = false;
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch >= '0' && ch <= '9') out += ch;
      else if ((ch === ',' || ch === '.') && !sep && out.length) { out += ','; sep = true; }
    }
    return out;
  }
  function parseNumber(text) {
    var s = sanitize(text);
    if (!s) return null;
    var n = Number(s.replace(',', '.'));
    return isFinite(n) ? n : null;
  }

  function parties() {
    return store() ? store().counterpartyOptions().map(function (o) { return { code: o.id, label: o.name }; }) : [];
  }

  var SELECTS = {
    counterpartyId: F.select(scrim, 'fi-edit-counterparty', { options: parties }),
    reserveCounterpartyId: F.select(scrim, 'fi-edit-reserve', { options: parties }),
    allocationCounterpartyId: F.select(scrim, 'fi-edit-allocation', { options: parties }),
    fvAcCode: F.select(scrim, 'fi-edit-fvac', { options: function () { return store() ? store().fvAcOptions() : []; } }),
    ifrsOptionNodeId: F.select(scrim, 'fi-edit-option', {
      options: function () {
        return store() ? store().optionNodes().map(function (o) { return { code: o.id, label: o.label }; }) : [];
      }
    })
  };
  var CHECKS = { isPE: 'fi-edit-pe', isDkkk: 'fi-edit-dkkk', hasLinkedUnconditionalOption: 'fi-edit-option-flag' };

  var nameInput = el('fi-edit-name');
  var irrInput = el('fi-edit-irr');
  var contractInput = el('fi-edit-contract');
  var nameError = F.fieldError(nameInput);
  var cardId = null;
  var fields = [];

  if (irrInput) {
    irrInput.addEventListener('input', function () {
      var v = sanitize(irrInput.value);
      if (v !== irrInput.value) irrInput.value = v;
    });
  }
  if (nameInput) {
    nameInput.addEventListener('input', function () { if (nameInput.value.trim()) nameError.clear(); });
  }

  function paint(id) {
    var S = store();
    var c = S && S.card(id);
    if (!c) return false;
    cardId = id;
    fields = S.fieldsOf(c.typeCode);
    var title = scrim.querySelector('.modal__title');
    if (title) title.textContent = 'ФИ: ' + c.number + '. ' + c.typeLabel;
    Array.prototype.forEach.call(scrim.querySelectorAll('[data-fi-field]'), function (box) {
      box.hidden = fields.indexOf(box.getAttribute('data-fi-field')) === -1;
    });
    if (nameInput) nameInput.value = c.name || '';
    if (irrInput) irrInput.value = has(c.targetIrr) ? String(c.targetIrr).replace('.', ',') : '';
    if (contractInput) contractInput.value = c.linkedContractNumber || '';
    Object.keys(SELECTS).forEach(function (k) { SELECTS[k].set(c[k]); });
    Object.keys(CHECKS).forEach(function (k) {
      var cb = el(CHECKS[k]);
      if (cb) cb.checked = c[k] === true;
    });
    nameError.clear();
    /* значения поставлены присваиванием — без этого вызова рантайм поля не
       показал бы крестик очистки (правило InputText) */
    if (window.DSInput) window.DSInput.syncAll(scrim);
    return true;
  }

  function open(id) {
    if (!paint(id)) return;
    if (window.DSModal && !scrim.classList.contains('modal-scrim--inline')) window.DSModal.open(scrim);
  }

  function collect() {
    var patch = {};
    Object.keys(SELECTS).forEach(function (k) { SELECTS[k].commitTyped(); patch[k] = SELECTS[k].get(); });
    Object.keys(CHECKS).forEach(function (k) { var cb = el(CHECKS[k]); patch[k] = !!(cb && cb.checked); });
    patch.name = nameInput ? nameInput.value.trim() : '';
    patch.targetIrr = irrInput ? parseNumber(irrInput.value) : null;
    patch.linkedContractNumber = contractInput ? contractInput.value.trim() : '';
    /* только поля типа карточки: остальные стор сбросит сам */
    var out = {};
    fields.forEach(function (k) { if (k in patch) out[k] = patch[k]; });
    return out;
  }

  var save = scrim.querySelector('[data-fi-edit-save]');
  if (save) {
    save.addEventListener('click', function () {
      var S = store();
      if (!S || !cardId) return;
      if (!nameInput || !nameInput.value.trim()) {
        nameError.set('Введите наименование финансового инструмента');
        if (nameInput) nameInput.focus();
        return;
      }
      if (S.update(cardId, collect())) S.commit();
      if (scrim.classList.contains('modal-scrim--inline')) return;
      if (window.DSModal) window.DSModal.closeTop();
    });
  }

  /* «Изменить» в меню карточки ФИ */
  document.addEventListener('fiaction', function (e) {
    var d = e.detail || {};
    if (d.action === 'EDIT' && d.id) open(d.id);
  });

  window.PostModalFinInstrumentEdit = { open: open, use: paint };
})();

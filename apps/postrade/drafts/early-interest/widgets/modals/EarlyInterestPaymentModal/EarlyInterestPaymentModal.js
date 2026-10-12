/* ============================================================
   EarlyInterestPaymentModal.js — поведение окна «Новые проценты».

   Делает то, чего нет в рантаймах ДС, и только это:
   1) разводит два режима одной формы: новый платёж (кнопка «Добавить») и правка
      существующего («Сохранить») — заголовок, кнопка и значения полей;
   2) собирает список «Дата платежа» из дат погашения процентов («Плановые платежи»)
      и принимает набранную руками дату, если она совпала с датой списка;
   3) форматирует сумму при вводе: только цифры, разряды неразрывным пробелом,
      запятая, не более двух знаков; знака «-» нет — сумма больше нуля;
   4) показывает в подсказке порядок погашения, в котором сумма гасит задолженность;
   5) проверяет форму по «Добавить» / «Сохранить» и показывает ошибку в Alert
      вверху окна с подсветкой полей; правка поля снимает его подсветку.

   Открытие, фокус, Esc и крестик делают рантаймы ДС. Страницу и таблицу окно не
   знает: даты, валюту и порядок берёт у страницы, проверенную запись отдаёт ей же.

   API:
     PostModalEarlyInterest.bind(scrim, { options, save }) → api
       options()           → { currencyCode, dateOptions, orderLabels } — валюта,
                             даты ISO, подписи типов задолженности по приоритету
       save(rec, wasEdit)  — принять запись { paymentDate, paymentAmount, comment }
                             (дата ISO); wasEdit — окно открыто на правку
       api.open(rec|null)  — заполнить окно (null — новый платёж) и открыть
       api.fill(rec|null)  — только заполнить (на витрине окно уже на экране)
       api.validate()      → boolean — проверить форму и показать ошибку
   ============================================================ */
(function () {
  'use strict';

  var NBSP = ' ';
  var KEYS = ['paymentDate', 'paymentAmount'];
  var TOP = 3;

  /* ── Формат ─────────────────────────────────────────────────────── */
  function money(n) {
    var p = Number(n).toFixed(2).split('.');
    return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + ',' + p[1];
  }
  function date(iso) { var p = String(iso).split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }
  /* «1 250 000,5» → число; пусто или мусор → NaN */
  function parseMoney(str) {
    var s = String(str).replace(/\s/g, '').replace(',', '.');
    return s === '' || isNaN(Number(s)) ? NaN : Number(s);
  }

  function bind(scrim, opts) {
    if (!scrim) return null;
    if (scrim.__earlyInterest) return scrim.__earlyInterest;
    opts = opts || {};

    var form = scrim.querySelector('form');
    var alertBox = scrim.querySelector('.modal__alert');
    var alertText = scrim.querySelector('.alert__text');
    var title = scrim.querySelector('.modal__title');
    var submit = scrim.querySelector('[data-ei-submit]');
    var currency = scrim.querySelector('[data-ei-currency]');
    var orderNote = scrim.querySelector('[data-ei-order-note]');
    var dateCtl = form.elements.paymentDate;
    var dateList = scrim.querySelector('.ddl');
    var dateIso = '';
    var editing = false;

    function params() { return (opts.options && opts.options()) || { currencyCode: 'RUB', dateOptions: [], orderLabels: [] }; }
    function field(k) { return form.elements[k]; }
    function boxOf(k) { return field(k).closest('.inp'); }
    function isInline() { return scrim.classList.contains('modal-scrim--inline'); }

    /* ── Ошибки ─────────────────────────────────────────────────────── */
    function clearErrors() {
      alertBox.hidden = true;
      KEYS.forEach(function (k) { boxOf(k).classList.remove('inp--error'); });
    }
    function showError(text, keys) {
      alertText.textContent = text;
      alertBox.hidden = false;
      (keys || []).forEach(function (k) { boxOf(k).classList.add('inp--error'); });
    }

    /* ── Сумма: только положительная ────────────────────────────────── */
    function formatAmount(inp) {
      var raw = inp.value, pos = inp.selectionStart == null ? raw.length : inp.selectionStart;
      var left = raw.slice(0, pos).replace(/[^\d,.]/g, '').length;
      var clean = raw.replace(/\./g, ',').replace(/[^\d,]/g, '');
      var parts = clean.split(',');
      var intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
      var out = intPart + (parts.length > 1 ? ',' + parts.slice(1).join('').slice(0, 2) : '');
      inp.value = out;
      var n = 0, caret = 0;
      while (caret < out.length && n < left) { if (/[\d,]/.test(out.charAt(caret))) n++; caret++; }
      try { inp.setSelectionRange(caret, caret); } catch (e) { /* поле без выделения */ }
    }
    form.addEventListener('input', function (e) {
      var inp = e.target;
      if (inp.hasAttribute('data-amount')) formatAmount(inp);
      inp.closest('.inp').classList.remove('inp--error');
    });
    form.addEventListener('focusout', function (e) {
      var inp = e.target;
      if (inp.hasAttribute && inp.hasAttribute('data-amount')) {
        var n = parseMoney(inp.value);
        if (!isNaN(n)) inp.value = money(n);
      }
    });

    /* ── Дата платежа: даты погашения процентов ─────────────────────── */
    function paintDates() {
      dateList.innerHTML = params().dateOptions.map(function (iso) {
        return '<button type="button" class="ddl__item" role="option" aria-selected="' + (iso === dateIso) + '" data-code="' + iso + '">'
          + '<span class="ddl__item-body"><span class="ddl__item-label">' + date(iso) + '</span></span></button>';
      }).join('');
    }
    function setDate(iso) {
      dateIso = iso || '';
      dateCtl.value = dateIso ? date(dateIso) : '';
      paintDates();
      boxOf('paymentDate').classList.remove('inp--error');
      if (window.DSInput) window.DSInput.syncAll(scrim);
    }
    /* Набранный руками текст: совпал с датой списка — выбор; пусто — сброс; иначе откат к выбранной */
    dateCtl.addEventListener('change', function () {
      var t = dateCtl.value.trim();
      if (!t) { if (dateIso) setDate(''); return; }
      var hit = params().dateOptions.filter(function (iso) { return date(iso) === t; })[0];
      setDate(hit || dateIso);
    });
    dateCtl.closest('.inp').addEventListener('ds-input:clear', function () { setDate(''); });
    if (window.DSDropdownList) {
      window.DSDropdownList.bind(dateCtl.closest('.inp__field'), {
        list: dateList,
        onSelect: function (it) { setDate(it.getAttribute('data-code')); }
      });
    }

    /* ── Подсказка: порядок погашения ───────────────────────────────── */
    function paintOrder() {
      if (!orderNote) return;
      var labels = params().orderLabels || [];
      var top = labels.slice(0, TOP).map(function (l, i) { return (i + 1) + '. ' + l; }).join(', ');
      orderNote.textContent = labels.length
        ? 'Сумма гасит задолженность по порядку погашения: ' + top + (labels.length > TOP ? ' и далее.' : '.')
        : '';
    }

    /* ── Заполнение и проверка ──────────────────────────────────────── */
    function fill(rec) {
      editing = !!rec;
      title.textContent = rec ? 'Редактирование досрочных процентов' : 'Новые проценты';
      submit.querySelector('.btn__label').textContent = rec ? 'Сохранить' : 'Добавить';
      if (currency) currency.textContent = params().currencyCode;
      setDate(rec ? rec.paymentDate : '');
      field('paymentAmount').value = rec ? money(rec.paymentAmount) : '';
      field('comment').value = rec ? (rec.comment || '') : '';
      paintOrder();
      clearErrors();
      if (window.DSInput) window.DSInput.syncAll(scrim);
    }

    function validate() {
      clearErrors();
      var amt = parseMoney(field('paymentAmount').value), bad = [];
      if (!dateIso) bad.push('paymentDate');
      if (isNaN(amt)) bad.push('paymentAmount');
      if (bad.length) { showError('Выберите дату платежа и введите сумму платежа.', bad); return false; }
      if (amt <= 0) { showError('Сумма платежа должна быть больше нуля.', ['paymentAmount']); return false; }
      return true;
    }

    submit.addEventListener('click', function () {
      if (!validate()) return;
      var rec = { paymentDate: dateIso, paymentAmount: parseMoney(field('paymentAmount').value), comment: field('comment').value.trim() };
      if (opts.save) opts.save(rec, editing);
      if (!isInline() && window.DSModal) window.DSModal.closeTop();
    });

    function open(rec) {
      fill(rec || null);
      if (window.DSModal) window.DSModal.open(scrim);
    }

    fill(null);

    var api = { open: open, fill: fill, validate: validate };
    scrim.__earlyInterest = api;
    return api;
  }

  window.PostModalEarlyInterest = { bind: bind };
})();

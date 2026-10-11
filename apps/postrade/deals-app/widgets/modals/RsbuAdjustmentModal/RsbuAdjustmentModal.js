/* ============================================================
   RsbuAdjustmentModal.js — поведение окна внесения корректировки процентов РСБУ.

   Делает то, чего нет в рантаймах ДС, и только это:
   1) разводит два режима одной формы: новая корректировка (кнопка «Добавить») и
      правка существующей («Сохранить») — заголовок, кнопка и значения полей;
   2) собирает список «Начальная дата» из дат процентных платежей и принимает
      набранную руками дату, если она совпала с датой списка;
   3) форматирует сумму при вводе: знак «-» только первым, разряды неразрывным
      пробелом, запятая, не более двух знаков;
   4) проверяет форму по «Добавить» / «Сохранить» и показывает ошибку в Alert
      вверху окна с подсветкой полей; правка поля снимает его подсветку.

   Открытие, фокус, Esc, крестик, календарь и маску даты делают рантаймы ДС.
   Транш и таблицу окно не знает: параметры списка берёт у страницы, проверенную
   запись отдаёт ей же.

   API:
     PostModalRsbuAdjustment.bind(scrim, { options, save }) → api
       options()           → { currencyCode, startDateOptions } — валюта и даты ISO
       save(rec, wasEdit)  — принять запись { startDate, endDate, adjustmentAmount,
                             comment } (даты ISO); wasEdit — окно открыто на правку
       api.open(rec|null)  — заполнить окно (null — новая корректировка) и открыть
       api.fill(rec|null)  — только заполнить (на витрине окно уже на экране)
       api.validate()      → boolean — проверить форму и показать ошибку
   ============================================================ */
(function () {
  'use strict';

  var NBSP = ' ';
  var KEYS = ['startDate', 'endDate', 'adjustmentAmount'];

  /* ── Формат ─────────────────────────────────────────────────────── */
  function money(n) {
    var p = Number(n).toFixed(2).split('.');
    return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + ',' + p[1];
  }
  function date(iso) { var p = String(iso).split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }
  /* «-1 250 000,5» → число; пусто или мусор → NaN */
  function parseMoney(str) {
    var s = String(str).replace(/[\s ]/g, '').replace(',', '.');
    return s === '' || s === '-' || isNaN(Number(s)) ? NaN : Number(s);
  }
  /* «ДД.ММ.ГГГГ» → ISO; мусор (в том числе 31.02) → '' */
  function parseDate(str) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(str).trim());
    if (!m) return '';
    var d = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
    return (d.getUTCFullYear() === +m[3] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[1]) ? m[3] + '-' + m[2] + '-' + m[1] : '';
  }

  function bind(scrim, opts) {
    if (!scrim) return null;
    if (scrim.__rsbuAdjustment) return scrim.__rsbuAdjustment;
    opts = opts || {};

    var form = scrim.querySelector('form');
    var alertBox = scrim.querySelector('.modal__alert');
    var alertText = scrim.querySelector('.alert__text');
    var title = scrim.querySelector('.modal__title');
    var submit = scrim.querySelector('[data-rsbu-submit]');
    var currency = scrim.querySelector('[data-rsbu-currency]');
    var startCtl = form.elements.startDate;
    var startList = scrim.querySelector('.ddl');
    var startIso = '';
    var editing = false;

    function params() { return (opts.options && opts.options()) || { currencyCode: 'RUB', startDateOptions: [] }; }
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

    /* ── Сумма ──────────────────────────────────────────────────────── */
    function formatAmount(inp) {
      var raw = inp.value, pos = inp.selectionStart == null ? raw.length : inp.selectionStart;
      var left = raw.slice(0, pos).replace(/[^\d,.]/g, '').length;
      var neg = /^\s*[-−–]/.test(raw);
      var clean = raw.replace(/\./g, ',').replace(/[^\d,]/g, '');
      var parts = clean.split(',');
      var intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
      var out = (neg ? '-' : '') + intPart + (parts.length > 1 ? ',' + parts.slice(1).join('').slice(0, 2) : '');
      inp.value = out;
      var n = 0, caret = neg ? 1 : 0;
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

    /* ── Начальная дата: список дат процентных платежей ─────────────── */
    function paintStart() {
      startList.innerHTML = params().startDateOptions.map(function (iso) {
        return '<button type="button" class="ddl__item" role="option" aria-selected="' + (iso === startIso) + '" data-code="' + iso + '">'
          + '<span class="ddl__item-body"><span class="ddl__item-label">' + date(iso) + '</span></span></button>';
      }).join('');
    }
    function setStart(iso) {
      startIso = iso || '';
      startCtl.value = startIso ? date(startIso) : '';
      paintStart();
      boxOf('startDate').classList.remove('inp--error');
      if (window.DSInput) window.DSInput.syncAll(scrim);
    }
    /* Набранный руками текст: совпал с датой списка — выбор; пусто — сброс; иначе откат к выбранной */
    startCtl.addEventListener('change', function () {
      var t = startCtl.value.trim();
      if (!t) { if (startIso) setStart(''); return; }
      var hit = params().startDateOptions.filter(function (iso) { return date(iso) === t; })[0];
      setStart(hit || startIso);
    });
    startCtl.closest('.inp').addEventListener('ds-input:clear', function () { setStart(''); });
    if (window.DSDropdownList) {
      window.DSDropdownList.bind(startCtl.closest('.inp__field'), {
        list: startList,
        onSelect: function (it) { setStart(it.getAttribute('data-code')); }
      });
    }

    /* ── Заполнение и проверка ──────────────────────────────────────── */
    function fill(rec) {
      editing = !!rec;
      title.textContent = rec ? 'Редактирование корректировки' : 'Новая корректировка';
      submit.querySelector('.btn__label').textContent = rec ? 'Сохранить' : 'Добавить';
      if (currency) currency.textContent = params().currencyCode;
      setStart(rec ? rec.startDate : '');
      field('endDate').value = rec ? date(rec.endDate) : '';
      field('adjustmentAmount').value = rec ? money(rec.adjustmentAmount) : '';
      field('comment').value = rec ? rec.comment : '';
      clearErrors();
      if (window.DSInput) window.DSInput.syncAll(scrim);
    }

    function read() {
      return { start: startIso, end: parseDate(field('endDate').value), amt: parseMoney(field('adjustmentAmount').value) };
    }

    function validate() {
      clearErrors();
      var v = read(), bad = [];
      if (!v.start) bad.push('startDate');
      if (!v.end) bad.push('endDate');
      if (isNaN(v.amt)) bad.push('adjustmentAmount');
      if (bad.length) { showError('Выберите начальную дату, введите конечную дату в формате ДД.ММ.ГГГГ и сумму корректировки числом.', bad); return false; }
      if (v.end < v.start) { showError('Конечная дата не может быть раньше начальной.', ['startDate', 'endDate']); return false; }
      if (v.amt === 0) { showError('Сумма корректировки не может быть равна нулю.', ['adjustmentAmount']); return false; }
      return true;
    }

    submit.addEventListener('click', function () {
      if (!validate()) return;
      var v = read();
      var rec = { startDate: v.start, endDate: v.end, adjustmentAmount: v.amt, comment: field('comment').value.trim() };
      if (opts.save) opts.save(rec, editing);
      if (!isInline() && window.DSModal) window.DSModal.closeTop();
    });

    function open(rec) {
      fill(rec || null);
      if (window.DSModal) window.DSModal.open(scrim);
    }

    fill(null);

    var api = { open: open, fill: fill, validate: validate };
    scrim.__rsbuAdjustment = api;
    return api;
  }

  window.PostModalRsbuAdjustment = { bind: bind };
})();

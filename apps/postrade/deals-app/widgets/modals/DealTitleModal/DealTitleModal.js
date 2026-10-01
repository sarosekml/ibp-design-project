/* ============================================================
   DealTitleModal.js — поведение окна «Редактирование сделки».

   Делает то, чего нет в рантаймах ДС, и только это:
   1) заполняет окно номером и наименованием сделки при каждом открытии;
   2) проверяет оба поля по «Сохранить» — те же правила и тексты, что у
      окна «Новая сделка» в реестре портфеля (Portfolio.html):
        номер — не пустой, только цифры, не занят другой сделкой;
        наименование — не пустое, не занято другой сделкой.
      Своя сделка дублем не считается: сверку делает страница (exists),
      исключая сделку, которую правят;
   3) показывает ошибку по правилу InputText: красное поле, текст — в
      тултипе на фокусе, не в хелпере. Правка поля снимает ошибку, как
      только ввод стал корректным;
   4) отдаёт правку странице и закрывает окно. Если ничего не поменялось,
      просто закрывает.

   Открытие, фокус, Esc и крестик делают рантаймы ДС. Сделку окно не знает:
   значения берёт, сверяет и сохраняет через функции, которые передала
   страница, — так же окно работает на витрине.

   API:
     PostDealTitleModal.bind(scrim, { get, exists, save }) → api
       get()           → { id, name } — текущие номер и наименование
       exists(query)   → boolean — занят ли номер ({ id }) или наименование
                         ({ name }) другой сделкой
       save(patch)     — принять правку: { id?, name? } — только изменённое
       api.fill()      — заполнить окно заново из get()
       api.validate()  → boolean — проверить оба поля и показать ошибки
   ============================================================ */
(function () {
  'use strict';

  function isInline(scrim) {
    return scrim.classList.contains('modal-scrim--inline');
  }

  function bind(scrim, opts) {
    if (!scrim) return null;
    if (scrim.__dealTitle) return scrim.__dealTitle;
    opts = opts || {};

    var numberInput = scrim.querySelector('[data-title-field="id"]');
    var nameInput = scrim.querySelector('[data-title-field="name"]');
    if (!numberInput || !nameInput) return null;

    function current() { return (opts.get && opts.get()) || {}; }
    function taken(query) { return !!(opts.exists && opts.exists(query)); }

    /* ── Ошибка поля ────────────────────────────────────────────────── */
    /* Тултип строится через DSTooltip, якорь — .inp__box (раскладочно
       прозрачен, в отличие от авто-обёртки .tip-anchor, которая забрала бы
       флекс-рост поля). bind() навешивает показ на наведение и фокус
       навсегда, а снять его нечем, поэтому, пока ошибки нет, показ гасится
       сразу за ним — тот же приём, что в DealPeriodModal.js. */
    function field(input) {
      if (input.__titleField) return input.__titleField;
      var f = { input: input, inp: input.closest('.inp'), box: input.closest('.inp__box'), error: '', tip: null };
      input.__titleField = f;
      return f;
    }
    function ensureTip(f) {
      if (f.tip || !window.DSTooltip || !f.box) return f.tip;
      var o = { type: 'error', placement: 'bottom', align: 'start', multiline: true };
      var tip = window.DSTooltip.make('', o);
      f.box.appendChild(tip);
      o.tip = tip;
      f.tip = window.DSTooltip.bind(f.input, o);
      ['mouseenter', 'focus'].forEach(function (ev) {
        f.input.addEventListener(ev, function () { if (!f.error && f.tip) f.tip.hide(true); });
      });
      return f.tip;
    }
    function setError(input, msg) {
      var f = field(input);
      f.error = msg;
      f.inp.classList.add('inp--error');
      input.setAttribute('aria-invalid', 'true');
      var api = ensureTip(f);
      if (!api) return;
      api.tip.firstChild.textContent = msg;
      if (document.activeElement === input) api.show(true);
    }
    function clearError(input) {
      var f = field(input);
      f.error = '';
      f.inp.classList.remove('inp--error');
      input.removeAttribute('aria-invalid');
      if (f.tip) f.tip.hide(true);
    }

    /* ── Проверка ───────────────────────────────────────────────────── */
    /* Сверка с реестром — регистронезависимая и по обрезанным пробелам, как
       в DealsStore.exists; своё же значение сделки дублем не считается и
       тогда, когда страница не исключила сделку сама. */
    function norm(s) { return String(s == null ? '' : s).trim().toLowerCase(); }
    function numberMessage(v) {
      if (!v) return 'Укажите номер сделки';
      if (/\D/.test(v)) return 'Номер сделки — только цифры'; /* без якоря конца строки: ловится сенсором Б26 как валюта */
      if (norm(v) !== norm(current().id) && taken({ id: v })) return 'Сделка с таким номером уже есть в реестре';
      return '';
    }
    function nameMessage(v) {
      if (!v) return 'Укажите наименование сделки';
      if (norm(v) !== norm(current().name) && taken({ name: v })) return 'Сделка с таким наименованием уже есть в реестре';
      return '';
    }
    function check(input, message) {
      var msg = message(input.value.trim());
      if (msg) { setError(input, msg); return false; }
      clearError(input);
      return true;
    }
    function validate() {
      var numOk = check(numberInput, numberMessage);
      var nameOk = check(nameInput, nameMessage);
      return numOk && nameOk;
    }

    /* ── Заполнение ─────────────────────────────────────────────────── */
    function fill() {
      var d = current();
      numberInput.value = String(d.id == null ? '' : d.id);
      nameInput.value = String(d.name == null ? '' : d.name);
      if (window.DSInput) {
        window.DSInput.sync(numberInput.closest('.inp'));
        window.DSInput.sync(nameInput.closest('.inp'));
      }
      clearError(numberInput);
      clearError(nameInput);
    }

    /* ── События ────────────────────────────────────────────────────── */
    /* Окно открылось — значения заново: несохранённый ввод прошлого
       открытия не нужен, а номер мог смениться прошлым сохранением. */
    var wasOpen = !scrim.hidden;
    new MutationObserver(function () {
      var open = !scrim.hidden;
      if (open === wasOpen) return;
      wasOpen = open;
      if (open) fill();
      else { clearError(numberInput); clearError(nameInput); }
    }).observe(scrim, { attributes: true, attributeFilter: ['hidden'] });

    /* как в окне реестра: при правке поле проверяется сразу, и ошибка
       снимается, как только ввод стал корректным */
    numberInput.addEventListener('input', function () { check(numberInput, numberMessage); });
    nameInput.addEventListener('input', function () { check(nameInput, nameMessage); });

    scrim.addEventListener('click', function (e) {
      if (!e.target.closest('[data-title-save]')) return;
      var numOk = check(numberInput, numberMessage);
      var nameOk = check(nameInput, nameMessage);
      if (!numOk) { numberInput.focus(); return; }
      if (!nameOk) { nameInput.focus(); return; }

      var d = current();
      var patch = {};
      var id = numberInput.value.trim();
      var name = nameInput.value.trim();
      if (id !== String(d.id == null ? '' : d.id)) patch.id = id;
      if (name !== String(d.name == null ? '' : d.name)) patch.name = name;
      if ((patch.id != null || patch.name != null) && opts.save) opts.save(patch);
      if (!isInline(scrim) && window.DSModal) window.DSModal.closeTop(true);
    });

    fill();

    var api = { fill: fill, validate: validate };
    scrim.__dealTitle = api;
    return api;
  }

  window.PostDealTitleModal = { bind: bind };
})();

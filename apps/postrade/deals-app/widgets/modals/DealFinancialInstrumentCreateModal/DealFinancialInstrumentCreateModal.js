/* ============================================================
   DealFinancialInstrumentCreateModal.js — окно «Создание финансового
   инструмента» (макет 02.10.2026) и общий слой форм окон ФИ.

   Общий слой PostFinInstrumentForm — им же собраны поля окна изменения ФИ
   (DealFinancialInstrumentEditModal.js подключается после этого файла):
     select(scrim, id, opts) → { set(code), get() → code|null, refresh() }
       Список из InputAutocomplete + DropdownList: значение — только из
       списка; набранный текст, не совпавший с опцией, при уходе с поля
       откатывается к выбранному; крестик снимает значение.
       opts.options() → {code, label}[] · opts.onChange(code)
     fieldError(input) → { set(message), clear() }
       Ошибка поля — состояние InputText (.inp--error) и тултип при фокусе
       (правило InputText: текст ошибки — не в хелпере). Тултип строится
       DSTooltip и висит на .inp__box поля, как в окне «Сроки сделки».

   Окно:
     – открывается событием 'fiaction' (action CREATE) тайла «Финансовые
       инструменты»: поля пустые, как на макете;
     – «Сохранить»: оба списка обязательны — пустой подсвечивается ошибкой,
       окно остаётся открытым; иначе FinInstrumentsStore.create и commit,
       окно закрывается, тайл перерисовывается по commit стора.
   Крестик, Esc и подложка — без изменений.

   API: PostModalFinInstrumentCreate.open() · use() — заполнить без открытия
        (витрина)
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function has(v) { return v !== null && v !== undefined && v !== ''; }

  /* ── Общий слой: список ─────────────────────────────────────────── */

  function optionHTML(o, selected) {
    return '<button type="button" class="ddl__item" role="option" aria-selected="' + (selected ? 'true' : 'false') + '" data-code="' + esc(o.code) + '">'
      + '<span class="ddl__item-body"><span class="ddl__item-label">' + esc(o.label) + '</span></span></button>';
  }

  function select(scrim, id, opts) {
    opts = opts || {};
    var control = scrim.querySelector('#' + id);
    var list = scrim.querySelector('#' + id + '-list');
    var field = scrim.querySelector('[data-ddl="' + id + '-list"]');
    var cur = null;

    function options() { return opts.options ? opts.options() : []; }
    function labelOf(code) {
      var o = options().filter(function (x) { return x.code === code; })[0];
      return o ? o.label : '';
    }
    function paint() {
      if (list) list.innerHTML = options().map(function (o) { return optionHTML(o, o.code === cur); }).join('');
    }
    function set(code, silent) {
      cur = has(code) ? code : null;
      if (control) control.value = labelOf(cur);
      paint();
      if (window.DSInput) window.DSInput.syncAll(scrim);
      if (!silent && opts.onChange) opts.onChange(cur);
    }
    /* Набранный руками текст: совпал с опцией — выбор; пусто — значение
       снято; иначе — откат к выбранному. */
    function commitTyped() {
      if (!control || control.disabled) return;
      var s = String(control.value || '').trim().toLowerCase();
      if (!s) { if (cur) set(null); return; }
      var hit = options().filter(function (o) { return o.label.toLowerCase() === s; })[0];
      if (hit) { if (hit.code !== cur) set(hit.code); else set(cur, true); return; }
      set(cur, true);
    }

    paint();
    if (field && list && window.DSDropdownList) {
      window.DSDropdownList.bind(field, {
        list: list,
        onSelect: function (it) { set(it.getAttribute('data-code')); }
      });
    }
    if (control) {
      control.addEventListener('change', commitTyped);
      var inp = control.closest('.inp');
      if (inp) inp.addEventListener('ds-input:clear', function () { set(null); });
    }
    return {
      set: function (code) { set(code, true); },
      get: function () { return cur; },
      refresh: function () { set(cur, true); },
      commitTyped: commitTyped
    };
  }

  /* ── Общий слой: ошибка поля ────────────────────────────────────── */

  /* bind() навешивает показ тултипа на наведение и фокус навсегда, поэтому,
     пока ошибки нет, показ гасится сразу за ним (как в DealPeriodModal.js). */
  function fieldError(input) {
    var inp = input && input.closest('.inp');
    var box = input && input.closest('.inp__box');
    var message = '';
    var api = null;

    function ensure() {
      if (api || !window.DSTooltip || !box) return api;
      var o = { type: 'error', placement: 'bottom', align: 'start', multiline: true };
      var tip = window.DSTooltip.make('', o);
      box.appendChild(tip);
      o.tip = tip;
      api = window.DSTooltip.bind(input, o);
      ['mouseenter', 'focus'].forEach(function (ev) {
        input.addEventListener(ev, function () { if (!message && api) api.hide(true); });
      });
      return api;
    }

    return {
      set: function (msg) {
        if (!inp) return;
        message = msg;
        inp.classList.add('inp--error');
        input.setAttribute('aria-invalid', 'true');
        var a = ensure();
        if (!a) return;
        a.tip.firstChild.textContent = msg;
        if (document.activeElement === input) a.show(true);
      },
      clear: function () {
        if (!inp) return;
        message = '';
        inp.classList.remove('inp--error');
        input.removeAttribute('aria-invalid');
        if (api) api.hide(true);
      }
    };
  }

  window.PostFinInstrumentForm = { select: select, fieldError: fieldError, optionHTML: optionHTML };

  /* ── Окно ───────────────────────────────────────────────────────── */

  var scrim = typeof document !== 'undefined' && document.getElementById('fi-create-scrim');
  if (!scrim) return;

  function store() { return window.FinInstrumentsStore; }

  var errType = fieldError(scrim.querySelector('#fi-create-type'));
  var errReporting = fieldError(scrim.querySelector('#fi-create-reporting'));
  var type = select(scrim, 'fi-create-type', {
    options: function () { return store() ? store().typeOptions() : []; },
    onChange: function (code) { if (code) errType.clear(); }
  });
  var reporting = select(scrim, 'fi-create-reporting', {
    options: function () { return store() ? store().reportingOptions() : []; },
    onChange: function (code) { if (code) errReporting.clear(); }
  });

  function reset() {
    type.set(null);
    reporting.set(null);
    errType.clear();
    errReporting.clear();
  }

  function open() {
    reset();
    if (window.DSModal && !scrim.classList.contains('modal-scrim--inline')) window.DSModal.open(scrim);
  }

  function validate() {
    type.commitTyped();
    reporting.commitTyped();
    var ok = true;
    if (!type.get()) { errType.set('Выберите тип инструмента'); ok = false; }
    if (!reporting.get()) { errReporting.set('Выберите тип отчетности'); ok = false; }
    if (!ok) {
      var first = scrim.querySelector('.inp--error .inp__control');
      if (first) first.focus();
    }
    return ok;
  }

  var save = scrim.querySelector('[data-fi-create-save]');
  if (save) {
    save.addEventListener('click', function () {
      var S = store();
      if (!S || !validate()) return;
      if (S.create({ typeCode: type.get(), reportingType: reporting.get() })) S.commit();
      if (scrim.classList.contains('modal-scrim--inline')) return;
      if (window.DSModal) window.DSModal.closeTop();
    });
  }

  /* «+ Фин. инструмент», «+ Финансовый инструмент», «Заполнить вручную» */
  document.addEventListener('fiaction', function (e) {
    var d = e.detail || {};
    if (d.action === 'CREATE') open();
  });

  window.PostModalFinInstrumentCreate = {
    open: open,
    use: function (input) {
      reset();
      if (input && input.typeCode) type.set(input.typeCode);
      if (input && input.reportingType) reporting.set(input.reportingType);
    }
  };
})();

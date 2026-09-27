/* ============================================================
   DealDescriptionModal.js — окно «Описание сделки».

   Фрагмент DealDescriptionModal.html держит оба режима окна. Скрипт делает
   то, чего нет в рантаймах ДС:

     1. Режим окна. Из какого тайла окно открыли, в таком режиме оно и
        открывается: data-mode переносится с тайла на .modal, дальше вид
        переключает DealDescriptionModal.css.
     2. Списки. ГСЗ, Совместность и Категория риска ЦУП — опции из
        справочников DEALS_ENUMS (mock-deals.js); у банка под кодом полное
        имя, у категории — пояснение с макета. Открытие, клавиатуру и выбор
        ведёт DSDropdownList — своей копии этой логики тут нет.
     3. Проверка и сохранение. Значение списка — только из списка: введённое
        руками и не найденное в справочнике не сохраняется, поле помечается
        ошибкой. «Сохранить» закрывает окно само, когда проверка прошла.

   Окно роль не вычисляет, как и тайл не вычисляет режим: режим приходит с
   тайла, а что сохранить — решает страница (opts.save).

   API:
     PostDealDescriptionModal.bind(scrim, opts) → api
       opts.get()         → запись сделки (typedef DealDescriptionFields)
       opts.save(patch)   ← правка: description, operationsComment,
                            additionalIncome, gsz, jointness, riskCategory
                            (код или null), ceParticipation,
                            ifDeskParticipation, restructured (да/нет) и
                            finTpl («Да» / «Нет» — поле реестра)
       opts.enums         — справочники, по умолчанию window.DEALS_ENUMS
       api.setMode(mode) · api.refresh() · api.validate()
   ============================================================ */
(function () {
  'use strict';

  var SCRIM_ID = 'deal-description-scrim';

  var TEXTS = [
    { key: 'description', id: 'dd-description' },
    { key: 'operationsComment', id: 'dd-operations-comment' },
    { key: 'additionalIncome', id: 'dd-additional-income' }
  ];

  /* Признаки окна: ключ записи → чекбокс. finTpl — поле реестра, хранится
     строкой «Да» / «Нет»; остальные — да/нет. */
  var FLAGS = [
    { key: 'ceParticipation', id: 'dd-ce' },
    { key: 'ifDeskParticipation', id: 'dd-if-desk' },
    { key: 'restructured', id: 'dd-restructured' },
    { key: 'finTpl', id: 'dd-fin-tpl', legacy: true }
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function str(src, key) {
    return String((src && src[key]) || '').trim();
  }

  function yes(src, key) {
    var v = src && src[key];
    return v === true || v === 'Да';
  }

  /* ---------- справочники ---------- */

  /* Список поля: опция — подпись, под ней пояснение (если есть). Код едет на
     опции атрибутом, чтобы выбор не разбирал текст обратно. */
  function lists(enums) {
    enums = enums || {};
    var banks = enums.jointnessNames || {};
    var riskNames = enums.riskCategoryNames || {};
    var riskHints = enums.riskCategoryHints || {};
    return {
      gsz: {
        id: 'dd-gsz',
        options: (enums.gsz || []).map(function (v) { return { code: v, label: v }; })
      },
      jointness: {
        id: 'dd-jointness',
        options: (enums.jointness || []).map(function (v) { return { code: v, label: v, hint: banks[v] || '' }; })
      },
      riskCategory: {
        id: 'dd-risk',
        options: (enums.riskCategory || []).map(function (v) {
          return { code: v, label: riskNames[v] || v, hint: riskHints[v] || '' };
        })
      }
    };
  }

  function optionHTML(o) {
    return '<button type="button" class="ddl__item" role="option" aria-selected="false" data-code="' + esc(o.code) + '">'
      + '<span class="ddl__item-body">'
      + '<span class="ddl__item-label">' + esc(o.label) + '</span>'
      + (o.hint ? '<span class="ds-helper"><span class="ds-helper__text">' + esc(o.hint) + '</span></span>' : '')
      + '</span></button>';
  }

  function labelOf(list, code) {
    for (var i = 0; i < list.options.length; i++) if (list.options[i].code === code) return list.options[i].label;
    return '';
  }

  /* Обратно: подпись в поле → код. Ввод без совпадения — undefined, это
     ошибка; пустое поле — '' (значение не выбрано). */
  function codeOf(list, label) {
    var s = String(label == null ? '' : label).trim();
    if (!s) return '';
    for (var i = 0; i < list.options.length; i++) {
      if (list.options[i].label.toLowerCase() === s.toLowerCase()) return list.options[i].code;
    }
    return undefined;
  }

  /* ---------- заполнение ---------- */

  function fillEdit(scrim, deal, L) {
    TEXTS.forEach(function (f) {
      var el = scrim.querySelector('#' + f.id);
      if (el) el.value = str(deal, f.key);
    });
    Object.keys(L).forEach(function (key) {
      var el = scrim.querySelector('#' + L[key].id);
      if (el) el.value = labelOf(L[key], str(deal, key));
      setError(scrim, L[key].id, '');
    });
    FLAGS.forEach(function (f) {
      var el = scrim.querySelector('#' + f.id);
      if (el) el.checked = yes(deal, f.key);
    });
    /* Значения поставлены присваиванием, а оно событий не шлёт: без этого
       вызова рантайм поля считал бы все поля пустыми и не показал крестик
       очистки (правило InputText). */
    if (window.DSInput) window.DSInput.syncAll(scrim);
  }

  function fillView(scrim, deal, L) {
    scrim.querySelectorAll('[data-dd-view]').forEach(function (el) {
      var key = el.getAttribute('data-dd-view');
      var v = L[key] ? labelOf(L[key], str(deal, key)) : str(deal, key);
      /* Прочерк — значение, а не подсказка: своего цвета у него нет
         (ReadOnlyField 1.010). */
      el.textContent = v || '—';
    });
    scrim.querySelectorAll('[data-dd-view-flag]').forEach(function (el) {
      el.checked = yes(deal, el.getAttribute('data-dd-view-flag'));
    });
  }

  /* ---------- проверка ---------- */

  /* Ошибку показывает сам компонент поля: .inp--error + хелпер под полем. */
  function setError(scrim, id, message) {
    var input = scrim.querySelector('#' + id);
    var box = input && input.closest('.inp');
    if (!box) return;
    var helper = box.querySelector('.ds-helper--error');
    if (message) {
      box.classList.add('inp--error');
      input.setAttribute('aria-invalid', 'true');
      if (!helper) {
        helper = document.createElement('span');
        helper.className = 'ds-helper ds-helper--error';
        box.appendChild(helper);
      }
      helper.innerHTML = '<span class="ds-helper__text">' + esc(message) + '</span>';
    } else {
      box.classList.remove('inp--error');
      input.removeAttribute('aria-invalid');
      if (helper) helper.parentNode.removeChild(helper);
    }
  }

  /* ---------- связывание ---------- */

  function bind(scrim, opts) {
    if (!scrim) return null;
    if (scrim.__dealDescriptionApi) return scrim.__dealDescriptionApi;
    opts = opts || {};

    var modal = scrim.querySelector('.lc-deal-description-modal');
    var L = lists(opts.enums || window.DEALS_ENUMS);

    /* Опции — один раз на окно: справочники за время сессии не меняются. */
    Object.keys(L).forEach(function (key) {
      var list = scrim.querySelector('#' + L[key].id + '-list');
      var field = scrim.querySelector('[data-ddl="' + L[key].id + '-list"]');
      if (!list) return;
      list.innerHTML = L[key].options.map(optionHTML).join('');
      if (!field || !window.DSDropdownList) return;
      window.DSDropdownList.bind(field, {
        list: list,
        onSelect: function (it) {
          var input = scrim.querySelector('#' + L[key].id);
          var label = it.querySelector('.ddl__item-label');
          if (!input || !label) return;
          input.value = label.textContent.trim();
          setError(scrim, L[key].id, '');
        }
      });
    });

    function refresh() {
      var mode = modal ? (modal.getAttribute('data-mode') || 'edit') : 'edit';
      var deal = opts.get ? opts.get() : null;
      if (mode === 'view') fillView(scrim, deal, L);
      else fillEdit(scrim, deal, L);
    }

    function setMode(mode) {
      if (modal) modal.setAttribute('data-mode', mode === 'view' ? 'view' : 'edit');
      refresh();
    }

    /* Открытие: режим и значения берутся в момент клика по триггеру — окно
       живёт в разметке постоянно, а сделка и режим тайла могли измениться. */
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-modal="' + SCRIM_ID + '"]');
      if (!trigger) return;
      var tile = trigger.closest('.lc-deal-description');
      setMode(tile ? (tile.getAttribute('data-mode') || 'edit') : 'edit');
    });

    /* Значение списка — только из справочника. Пустое поле допустимо:
       обязательных полей у окна нет (паспорт, «Обязательность»). */
    function validate() {
      var ok = true;
      Object.keys(L).forEach(function (key) {
        var input = scrim.querySelector('#' + L[key].id);
        var code = codeOf(L[key], input ? input.value : '');
        setError(scrim, L[key].id, code === undefined ? 'Выберите значение из списка' : '');
        if (code === undefined) ok = false;
      });
      return ok;
    }

    function collect() {
      var patch = {};
      TEXTS.forEach(function (f) {
        var el = scrim.querySelector('#' + f.id);
        patch[f.key] = el ? el.value.trim() : '';
      });
      Object.keys(L).forEach(function (key) {
        var input = scrim.querySelector('#' + L[key].id);
        var code = codeOf(L[key], input ? input.value : '');
        /* Категории риска нет — null, как в записи сделки; у ГСЗ и
           совместности пустая строка — поля реестра. */
        patch[key] = key === 'riskCategory' ? (code || null) : (code || '');
      });
      FLAGS.forEach(function (f) {
        var el = scrim.querySelector('#' + f.id);
        var on = !!(el && el.checked);
        patch[f.key] = f.legacy ? (on ? 'Да' : 'Нет') : on;
      });
      return patch;
    }

    var save = scrim.querySelector('[data-dd-save]');
    if (save) {
      save.addEventListener('click', function () {
        if (!validate()) {
          var bad = scrim.querySelector('.inp--error .inp__control');
          if (bad) bad.focus();
          return;
        }
        if (opts.save) opts.save(collect());
        if (scrim.classList.contains('modal-scrim--inline')) return;
        if (window.DSModal) window.DSModal.closeTop();
      });
    }

    var api = { setMode: setMode, refresh: refresh, validate: validate };
    scrim.__dealDescriptionApi = api;
    return api;
  }

  window.PostDealDescriptionModal = {
    bind: bind,
    TEXTS: TEXTS,
    FLAGS: FLAGS
  };
})();

/* ============================================================
   DealProjectInformationModal.js — окно «Сведения о проекте».

   Фрагмент DealProjectInformationModal.html держит пример заполненного
   окна. Скрипт делает то, чего нет в рантаймах ДС:

     1. Заполнение. При открытии окно берёт сведения сделки (opts.get) и
        раскладывает их по полям: коды — подписями из DEALS_ENUMS, числа —
        по-русски, с запятой.
     2. Доступность полей по типу недвижимости (макет):
          тип не выбран — метрики выключены;
          Коммерческая  — выключены класс жилья, LTC, LTARV и LLCR;
          Жилая         — выключены DSCR и LTV;
          Иная          — всё включено.
        Поле, которое выключилось, очищается: значение, недоступное типу,
        не сохраняется. Правило — справочники DEALS_ENUMS
        (projectMetricsByPropertyType, housingClassPropertyTypes).
     3. Регион и город. Список городов — города выбранного региона; нет
        региона — все города, и выбор города подставляет его регион. Смена
        региона сбрасывает город другого региона.
     4. Ввод. В списках значение — только из списка: набранный текст, не
        совпавший ни с одной опцией, при уходе с поля откатывается к
        выбранному значению, поэтому ошибочного состояния у полей нет. В
        метрики вводится только число: цифры и одна запятая.
     5. Сохранение. «Сохранить» собирает DealProjectInformationRsDto
        (выключенные поля — null; не заполнено ничего — null целиком),
        отдаёт его странице (opts.save) и закрывает окно.

   Окно роль не вычисляет: открывают его только из режима правки тайла, а
   что сохранить — решает страница.

   API:
     PostDealProjectInformationModal.bind(scrim, opts) → api
       opts.get()        → сведения сделки (DealProjectInformationRsDto | null)
       opts.save(info)   ← DealProjectInformationRsDto | null
       opts.enums        — справочники, по умолчанию window.DEALS_ENUMS
       api.refresh() · api.collect()
     PostDealProjectInformationModal.sanitize(text) → только число, запятая
     PostDealProjectInformationModal.parseNumber(text) → number | null
   ============================================================ */
(function () {
  'use strict';

  var SCRIM_ID = 'deal-project-info-scrim';

  var METRICS = ['dscr', 'ltv', 'ltc', 'ltarv', 'llcr'];

  var LISTS = [
    { key: 'propertyTypeCode', id: 'pi-property-type' },
    { key: 'housingClassCode', id: 'pi-housing-class' },
    { key: 'regionCode', id: 'pi-region' },
    { key: 'cityCode', id: 'pi-city' }
  ];

  var TEXT_KEYS = ['propertyTypeCode', 'housingClassCode', 'regionCode', 'cityCode'];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function has(v) { return v !== null && v !== undefined && v !== ''; }

  /* ---------- числа ---------- */

  /* Только число: цифры и одна запятая (точка становится запятой). Знака
     минуса нет — метрики неотрицательные. */
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

  function formatNumber(n) {
    if (!has(n) || isNaN(Number(n))) return '';
    return Number(n).toLocaleString('ru-RU', { maximumFractionDigits: 2, useGrouping: false });
  }

  /* ---------- справочники ---------- */

  function findCity(E, code) {
    var list = E.cities || [];
    for (var i = 0; i < list.length; i++) if (list[i].code === code) return list[i];
    return null;
  }

  /* Опции списка. Городов — только выбранного региона, если он есть. */
  function optionsFor(E, key, cur) {
    function coded(codes, names) {
      return (codes || []).map(function (c) { return { code: c, label: (names || {})[c] || c }; });
    }
    if (key === 'propertyTypeCode') return coded(E.propertyType, E.propertyTypeNames);
    if (key === 'housingClassCode') return coded(E.housingClass, E.housingClassNames);
    if (key === 'regionCode') return coded(E.regions, E.regionNames);
    return (E.cities || []).filter(function (c) {
      return !cur.regionCode || c.regionCode === cur.regionCode;
    }).map(function (c) { return { code: c.code, label: c.name }; });
  }

  function labelOf(E, key, code) {
    if (!has(code)) return '';
    if (key === 'cityCode') { var c = findCity(E, code); return c ? c.name : ''; }
    var opts = optionsFor(E, key, {});
    for (var i = 0; i < opts.length; i++) if (opts[i].code === code) return opts[i].label;
    return '';
  }

  function optionHTML(o, selected) {
    return '<button type="button" class="ddl__item" role="option" aria-selected="' + (selected ? 'true' : 'false') + '" data-code="' + esc(o.code) + '">'
      + '<span class="ddl__item-body"><span class="ddl__item-label">' + esc(o.label) + '</span></span></button>';
  }

  /* ---------- выключенное поле ---------- */

  /* Выключенное поле — состояние Disabled самого InputText: класс на корне,
     disabled на контроле; подпись гаснет модификатором LabelHelper. */
  function setDisabled(control, on) {
    if (!control) return;
    control.disabled = on;
    var inp = control.closest('.inp');
    if (!inp) return;
    inp.classList.toggle('inp--disabled', on);
    var label = inp.querySelector('.ds-label');
    if (label) label.classList.toggle('ds-label--disabled', on);
  }

  /* ---------- связывание ---------- */

  function bind(scrim, opts) {
    if (!scrim) return null;
    if (scrim.__projectInfoApi) return scrim.__projectInfoApi;
    opts = opts || {};

    var E = opts.enums || window.DEALS_ENUMS || {};
    var cur = { propertyTypeCode: null, housingClassCode: null, regionCode: null, cityCode: null };

    function el(id) { return scrim.querySelector('#' + id); }
    function idOf(key) {
      for (var i = 0; i < LISTS.length; i++) if (LISTS[i].key === key) return LISTS[i].id;
      return '';
    }

    function paintList(key) {
      var list = el(idOf(key) + '-list');
      if (!list) return;
      list.innerHTML = optionsFor(E, key, cur).map(function (o) {
        return optionHTML(o, o.code === cur[key]);
      }).join('');
    }

    function showText(key) {
      var control = el(idOf(key));
      if (control) control.value = labelOf(E, key, cur[key]);
    }

    /* Класс жилья выключен только у типа без класса (Коммерческая); пока тип
       не выбран, класс доступен (макет, пустое окно). Метрики без типа
       выключены все. */
    function classAllowed() {
      return !cur.propertyTypeCode
        || (E.housingClassPropertyTypes || []).indexOf(cur.propertyTypeCode) !== -1;
    }

    function applyType() {
      var classOn = classAllowed();
      if (!classOn && cur.housingClassCode) { cur.housingClassCode = null; showText('housingClassCode'); paintList('housingClassCode'); }
      setDisabled(el('pi-housing-class'), !classOn);

      var allowed = (E.projectMetricsByPropertyType || {})[cur.propertyTypeCode] || [];
      METRICS.forEach(function (k) {
        var control = el('pi-' + k);
        if (!control) return;
        var on = allowed.indexOf(k) !== -1;
        if (!on) control.value = '';
        setDisabled(control, !on);
      });
    }

    function setCode(key, code) {
      cur[key] = has(code) ? code : null;
      showText(key);

      if (key === 'propertyTypeCode') applyType();

      if (key === 'regionCode') {
        var city = findCity(E, cur.cityCode);
        if (city && cur.regionCode && city.regionCode !== cur.regionCode) {
          cur.cityCode = null;
          showText('cityCode');
        }
        paintList('cityCode');
      }

      if (key === 'cityCode' && cur.cityCode && !cur.regionCode) {
        var picked = findCity(E, cur.cityCode);
        if (picked) {
          cur.regionCode = picked.regionCode;
          showText('regionCode');
          paintList('regionCode');
          paintList('cityCode');
        }
      }

      paintList(key);
      if (window.DSInput) window.DSInput.syncAll(scrim);
    }

    /* Набранный руками текст: совпал с опцией — выбор; пусто — значение
       снято; иначе — откат к выбранному. */
    function commitTyped(key) {
      var control = el(idOf(key));
      if (!control || control.disabled) return;
      var s = String(control.value || '').trim().toLowerCase();
      if (!s) { if (cur[key]) setCode(key, null); return; }
      var list = optionsFor(E, key, cur);
      for (var i = 0; i < list.length; i++) {
        if (list[i].label.toLowerCase() === s) {
          if (list[i].code !== cur[key]) setCode(key, list[i].code);
          else showText(key);
          return;
        }
      }
      showText(key);
      if (window.DSInput) window.DSInput.syncAll(scrim);
    }

    /* Списки — один раз на окно: опции перерисовываются при смене значений. */
    LISTS.forEach(function (L) {
      var control = el(L.id);
      var list = el(L.id + '-list');
      var field = scrim.querySelector('[data-ddl="' + L.id + '-list"]');
      paintList(L.key);
      if (field && list && window.DSDropdownList) {
        window.DSDropdownList.bind(field, {
          list: list,
          onSelect: function (it) { setCode(L.key, it.getAttribute('data-code')); }
        });
      }
      if (!control) return;
      control.addEventListener('change', function () { commitTyped(L.key); });
      var inp = control.closest('.inp');
      if (inp) inp.addEventListener('ds-input:clear', function () { setCode(L.key, null); });
    });

    /* Метрики: только число. */
    METRICS.forEach(function (k) {
      var control = el('pi-' + k);
      if (!control) return;
      control.addEventListener('input', function () {
        var v = sanitize(control.value);
        if (v !== control.value) control.value = v;
      });
    });

    function refresh() {
      var info = (opts.get ? opts.get() : null) || {};
      TEXT_KEYS.forEach(function (k) { cur[k] = has(info[k]) ? info[k] : null; });
      TEXT_KEYS.forEach(function (k) { showText(k); paintList(k); });
      var top = el('pi-top-developer');
      if (top) top.checked = info.isTopDeveloper === true;
      METRICS.forEach(function (k) {
        var control = el('pi-' + k);
        if (control) control.value = formatNumber(info[k]);
      });
      applyType();
      /* Значения поставлены присваиванием, а оно событий не шлёт: без этого
         вызова рантайм поля не показал бы крестик очистки (правило InputText). */
      if (window.DSInput) window.DSInput.syncAll(scrim);
    }

    function collect() {
      var top = el('pi-top-developer');
      var info = {
        propertyTypeCode: cur.propertyTypeCode,
        housingClassCode: classAllowed() ? cur.housingClassCode : null,
        isTopDeveloper: !!(top && top.checked),
        regionCode: cur.regionCode,
        cityCode: cur.cityCode
      };
      METRICS.forEach(function (k) {
        var control = el('pi-' + k);
        info[k] = control && !control.disabled ? parseNumber(control.value) : null;
      });
      var any = info.isTopDeveloper
        || TEXT_KEYS.some(function (k) { return has(info[k]); })
        || METRICS.some(function (k) { return has(info[k]); });
      return any ? info : null;
    }

    /* Открытие: значения берутся в момент клика по триггеру — окно живёт в
       разметке постоянно, а сведения сделки могли измениться. */
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-modal="' + SCRIM_ID + '"]')) refresh();
    });

    var save = scrim.querySelector('[data-pi-save]');
    if (save) {
      save.addEventListener('click', function () {
        LISTS.forEach(function (L) { commitTyped(L.key); });
        if (opts.save) opts.save(collect());
        if (scrim.classList.contains('modal-scrim--inline')) return;
        if (window.DSModal) window.DSModal.closeTop();
      });
    }

    var api = { refresh: refresh, collect: collect };
    scrim.__projectInfoApi = api;
    return api;
  }

  window.PostDealProjectInformationModal = {
    bind: bind,
    METRICS: METRICS,
    sanitize: sanitize,
    parseNumber: parseNumber
  };
})();

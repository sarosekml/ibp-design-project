/* ============================================================
   ProjectInformationTile.js — тайл «Сведения о проекте» из данных.

   Фрагмент ProjectInformationTile.html держит эталон всех состояний, а
   значения в нём — пример. Страница сделки берёт сведения своей сделки из
   DealsStore (deal.projectInformation) и отдаёт сюда. Разметка полей не
   пересоздаётся: скрипт меняет текст на местах; пересобирается только
   список чипов метрик.

   Сведения — DealProjectInformationRsDto (data/mock-deals.js): коды типа
   недвижимости, класса жилья, региона и города, признак топ застройщика и
   пять метрик числами. Подписи кодов — справочники window.DEALS_ENUMS; их
   можно передать третьим аргументом.

   API:
     PostTileProjectInformation.render(tile, info[, enums])
       Раскладывает значения, ставит data-state по stateOf.
     PostTileProjectInformation.stateOf(info[, enums]) → 'data' | 'partial' | 'empty'
       empty — сведений нет (null) или не заполнено ни одно поле и не
       отмечен топ застройщик; data — заполнены тип, регион, город, класс
       жилья (если он есть у типа) и все метрики типа; иначе partial.
     PostTileProjectInformation.metrics(info[, enums]) → [{ key, label, text }]
       Чипы метрик в порядке DSCR, LTV, LTC, LTARV, LLCR — только
       доступные типу недвижимости и заполненные. Отдано наружу, чтобы
       формат метрики читался из одного места (им же пользуется окно).
     PostTileProjectInformation.formatNumber(n) → строка по-русски
   ============================================================ */
(function () {
  'use strict';

  var FIELDS = ['propertyTypeCode', 'housingClassCode', 'regionCode', 'cityCode'];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function dict(enums) { return enums || window.DEALS_ENUMS || {}; }

  function has(v) { return v !== null && v !== undefined && v !== ''; }

  /* Метрики, которые есть у типа недвижимости. Тип не выбран — ни одной:
     в окне они выключены, пока тип не выбран (макет). */
  function metricKeys(info, enums) {
    var E = dict(enums);
    var byType = E.projectMetricsByPropertyType || {};
    return (info && byType[info.propertyTypeCode]) || [];
  }

  /* Класс жилья — у жилой и иной недвижимости; у коммерческой его нет. */
  function hasHousingClass(info, enums) {
    var types = dict(enums).housingClassPropertyTypes || [];
    return !!info && types.indexOf(info.propertyTypeCode) !== -1;
  }

  /* Число по-русски: запятая в дробной части, без лишних нулей. */
  function formatNumber(n) {
    if (!has(n) || isNaN(Number(n))) return '';
    return Number(n).toLocaleString('ru-RU', { maximumFractionDigits: 2, useGrouping: false });
  }

  function metrics(info, enums) {
    var E = dict(enums);
    var names = E.projectMetricNames || {};
    var units = E.projectMetricUnits || {};
    var allowed = metricKeys(info, E);
    return (E.projectMetrics || []).filter(function (key) {
      return allowed.indexOf(key) !== -1 && has(info[key]);
    }).map(function (key) {
      var label = names[key] || key.toUpperCase();
      return { key: key, label: label, text: label + ': ' + formatNumber(info[key]) + (units[key] || '') };
    });
  }

  function stateOf(info, enums) {
    if (!info) return 'empty';
    var keys = metricKeys(info, enums);
    var any = info.isTopDeveloper === true
      || FIELDS.some(function (k) { return has(info[k]); })
      || (dict(enums).projectMetrics || []).some(function (k) { return has(info[k]); });
    if (!any) return 'empty';
    var full = has(info.propertyTypeCode) && has(info.regionCode) && has(info.cityCode)
      && (!hasHousingClass(info, enums) || has(info.housingClassCode))
      && keys.every(function (k) { return has(info[k]); });
    return full ? 'data' : 'partial';
  }

  function cityName(E, code) {
    var list = E.cities || [];
    for (var i = 0; i < list.length; i++) if (list[i].code === code) return list[i].name;
    return '';
  }

  /* Значения полей по кодам. Класса жилья у коммерческой недвижимости нет —
     прочерк, как на макете: поле с места не уходит. */
  function values(info, enums) {
    var E = dict(enums);
    info = info || {};
    return {
      propertyType: (E.propertyTypeNames || {})[info.propertyTypeCode] || '',
      housingClass: hasHousingClass(info, E) ? ((E.housingClassNames || {})[info.housingClassCode] || '') : '',
      region: (E.regionNames || {})[info.regionCode] || '',
      city: cityName(E, info.cityCode)
    };
  }

  function render(tile, info, enums) {
    if (!tile) return;
    var v = values(info, enums);

    /* Незаполненное поле — прочерк цветом обычного текста: прочерк —
       значение, а не подсказка (ReadOnlyField 1.010). */
    tile.querySelectorAll('[data-pi-field]').forEach(function (el) {
      el.textContent = v[el.getAttribute('data-pi-field')] || '—';
    });

    var top = tile.querySelector('[data-pi-top]');
    if (top) top.hidden = !(info && info.isTopDeveloper === true);

    var list = tile.querySelector('[data-pi-metrics]');
    var chips = list ? list.closest('.rof__value') : null;
    var dash = tile.querySelector('[data-pi-metrics-empty]');
    var m = info ? metrics(info, enums) : [];
    if (list) {
      list.innerHTML = m.map(function (x) {
        return '<span class="chip chip--xs chip--fit"><span class="chip__label">' + esc(x.text) + '</span></span>';
      }).join('');
      if (window.DSChip && window.DSChip.refresh) window.DSChip.refresh(list);
    }
    if (chips) chips.hidden = m.length === 0;
    if (dash) dash.hidden = m.length > 0;

    tile.setAttribute('data-state', stateOf(info, enums));
  }

  window.PostTileProjectInformation = {
    render: render,
    stateOf: stateOf,
    metrics: metrics,
    formatNumber: formatNumber
  };
})();

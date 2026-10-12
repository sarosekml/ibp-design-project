/* GeneralInformationTile — заполнение «Общей информации».
   render(host, { opportunity, client }) — вариант сделки (OpportunityRsDto,
   ClientRsDto): чипы клиента, проект, приоритет, ТБ и ГОСБ с предупреждением,
   тип недвижимости, источник, чекбоксы только для чтения.
   render(host, { potential }) — вариант лида (PotentialRsDto): чип статуса,
   идея сделки, даты. Карандаш и «Документы по сделке» — по клику ничего (Р6). */
(function () {
  'use strict';

  var PRIORITY_TONE = { MAX: 'error', HIGH: 'error', MEDIUM: 'warning', LOW: 'info' };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    if (!host || !opts) return;
    var S = window.IBPR, F = window.DICT_FMT;
    var root = host.classList.contains('lc-gen-info') ? host : host.querySelector('.lc-gen-info') || host;
    var o = opts.opportunity, p = opts.potential;
    root.setAttribute('data-variant', p ? 'potential' : 'opportunity');
    var c = opts.client || (o && S.client(o.clientId));
    show(root, '[data-gi-chip-growth]', p ? false : !!(c && c.didGrowthCompany));
    show(root, '[data-gi-chip-top]', p ? false : !!(c && c.topClient));
    show(root, '[data-gi-chip-status]', !!p);
    if (p) {
      set(root, '[data-gi-chip-status] .chip__label', S.lbl.leadStatus(p.statusCode));
      set(root, '[data-gi-idea]', p.idea);
      set(root, '[data-gi-created]', F.date(p.createdAt));
      set(root, '[data-gi-activity]', F.date(p.lastActivityAt));
    } else if (o) {
      set(root, '[data-gi-project]', o.project);
      var pr = root.querySelector('[data-gi-priority]');
      if (pr) {
        pr.className = 'chip chip--xs chip--fit' + (PRIORITY_TONE[o.priorityCode] ? ' chip--' + PRIORITY_TONE[o.priorityCode] : '');
        pr.querySelector('.chip__label').textContent = S.lbl.priority(o.priorityCode);
      }
      set(root, '[data-gi-tb]', S.lbl.terBank(o.terBank));
      set(root, '[data-gi-gosb]', o.gosb);
      /* значок у ТБ и ГОСБ — только у обязательной сделки (ТЗ MS0014 §4.3) */
      var warn = !!o.tbGosbWarning && o.source === 'binding';
      show(root, '[data-gi-tb-warn]', warn);
      show(root, '[data-gi-gosb-warn]', warn);
      set(root, '[data-gi-realty]', o.realtyType);
      show(root, '[data-gi-routing]', !!o.routingChip);
      show(root, '[data-gi-routing-none]', !o.routingChip);
      check(root, '[data-gi-terms]', o.termsChanged);
      check(root, '[data-gi-key]', o.keyDeal);
    }
    if (window.dsIcons) window.dsIcons.apply(root);
  }

  window.LcGeneralInformationTile = { render: render };
})();

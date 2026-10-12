/* StateInformationTile — заполнение тайла «Статус».
   render(host, { opportunity }) — статус, стадия, вероятность (ProgressBar),
   чекбоксы One Pager и ПИК / ИК; у выбывшей сделки — причина и комментарий
   выбытия (архив кампаний, ТЗ MS0014 §4.3). */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    var o = opts && opts.opportunity;
    if (!host || !o) return;
    var S = window.IBPR;
    set(host, '[data-si-status]', S.lbl.oppStatus(o.statusCode));
    set(host, '[data-si-stage]', S.lbl.oppStage(o.stageCode));
    var dropped = o.statusCode === 'DROPPED';
    show(host, '[data-si-drop-reason-row]', dropped);
    show(host, '[data-si-drop-comment-row]', dropped);
    set(host, '[data-si-drop-reason]', S.lbl.dropReason(o.dropoutReasonCode));
    set(host, '[data-si-drop-comment]', o.dropoutComment);
    var prob = Math.max(0, Math.min(100, Number(o.probability) || 0));
    set(host, '[data-si-prob-value]', prob + '%');
    var fill = host.querySelector('[data-si-prob-fill]');
    if (fill) fill.style.width = prob + '%';
    var bar = host.querySelector('[data-si-prob]');
    if (bar) bar.setAttribute('aria-valuenow', String(prob));
    check(host, '[data-si-onepager]', o.onePager);
    check(host, '[data-si-pik]', o.pikIk);
  }

  window.LcStateInformationTile = { render: render };
})();

/* V2MeetingsProtocolsTile — счётчики встреч сделки или лида.
   render(host, { meetings, variant }) — meetings: {planned, completed,
   attention}; нулевые счётчики — подсказка. variant 'potential' — тайл лида
   (ТЗ MS0014 §4.6, ревью З6): заголовок «Встречи», стрелка в шапке,
   «Добавить» в теле, подсказка «Нет протоколов встреч». «Добавить» и
   стрелка — по клику ничего (Р6). */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    if (!host) return;
    opts = opts || {};
    var root = host.classList.contains('lc-meetings-prot') ? host : host.querySelector('.lc-meetings-prot') || host;
    var pot = opts.variant === 'potential';
    var m = opts.meetings || { planned: 0, completed: 0, attention: 0 };
    root.setAttribute('data-variant', pot ? 'potential' : 'opportunity');
    set(root, '[data-mp-title]', pot ? 'Встречи' : 'Встречи и протоколы');
    var has = !!(m.planned || m.completed || m.attention);
    show(root, '[data-mp-counters]', has);
    show(root, '[data-mp-hint]', !has);
    set(root, '[data-mp-hint]', pot ? 'Нет протоколов встреч' : 'Планируйте встречи с клиентами и формируйте протоколы встреч');
    set(root, '[data-mp-planned]', String(m.planned || 0));
    set(root, '[data-mp-completed]', String(m.completed || 0));
    set(root, '[data-mp-attention]', String(m.attention || 0));
  }

  window.LcMeetingsProtocolsTile = { render: render };
})();

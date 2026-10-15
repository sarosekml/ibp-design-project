/* ============================================================
   MeetingsTile.js — тайл «Встречи» из HomeStore.

   Тайл сам находит свои корни (.lc-meetings) на DOMContentLoaded и рисует
   счётчики и список — так он живой на странице и в витрине. Выборка —
   «мои встречи» (переключателя в тайле нет). Состояние загрузки ставит
   страница (state="loading" метки); тайл его не снимает, а данные под ним
   уже нарисованы.

   API (window.LcMeetingsTile):
     render(root)              — счётчики, список, «данных нет»
     setState(root, state)     — data-state; data|empty считает сам по данным
     refresh(root)             — обновление: updating → данные
     focus(root, filter)       — показать выборку счётчика и прокрутить к тайлу
   Слушает HomeStore: kind 'meetings' — перерисовка, 'focus' с widget
   'meetings' — focus(). В пустом тайле счётчики остаются с нулями (макет).
   Хуки рантаймов: data-modal (окно «Новая встреча» из витрины).
   ============================================================ */
(function () {
  'use strict';

  var LIMIT = 6;
  var STATS = [
    { key: 'today', label: 'Сегодня', tone: 'info' },
    { key: 'week', label: 'На неделе', tone: '' },
    { key: 'attention', label: 'Требует внимания', tone: 'warning' }
  ];
  var CHIP_TONE = { SCHEDULED: 'info', NEEDS_ATTENTION: 'warning', PROTOCOL_DONE: 'success', CANCELLED: 'grey' };
  var NONE_TEXT = {
    today: 'Сегодня встреч нет',
    week: 'На ближайшие семь дней встреч нет',
    attention: 'Встреч, требующих внимания, нет'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function st(root) { return root.__lcMeetings || (root.__lcMeetings = { filter: null }); }

  /* Другие участники встречи: «, +N» после контакта, у «+N» — тултип со
     списком скрытых участников (по одному в строке, tip--rich) — макет
     главной 15.10.2026. */
  function participantsHTML(m) {
    if (!m.participants || !m.participants.length) return '';
    var tipId = 'lc-tip-mp-' + String(m.meetingId).replace(/[^a-zA-Z0-9_-]/g, '');
    var lines = m.participants.map(function (p) {
      return '<span class="tip__text">' + esc(p.name + ' – ' + p.position) + '</span>';
    }).join('');
    return '<span aria-hidden="true">,&nbsp;</span>' +
      '<span class="tip-anchor">' +
        '<span class="lc-meetings__more" data-tooltip-align="start" aria-describedby="' + tipId + '" aria-label="Ещё участников: ' + m.participants.length + '">+' + m.participants.length + '</span>' +
        '<span class="tip tip--main tip--top tip--start tip--floating tip--rich" role="tooltip" id="' + tipId + '">' + lines + '<span class="tip__arrow"></span></span>' +
      '</span>';
  }

  function rowHTML(m, S) {
    var labels = window.MEETING_STATUS_LABELS || {};
    return '<div class="entity" data-meeting-id="' + esc(m.meetingId) + '">' +
      '<div class="entity__lead" data-date="' + esc(m.startDateTime) + '"></div>' +
      '<div class="entity__main">' +
        '<div class="entity__titles"><div class="entity__labelrow">' +
          '<span class="entity__label entity__label--truncate" data-tooltip="' + esc(m.clientName) + '" data-tooltip-truncated="only">' + esc(m.clientName) + '</span>' +
        '</div></div>' +
        '<div class="entity__subs entity__subs--single"><span class="entity__subs-list">' + esc(m.contactName + ' – ' + m.contactPosition) + participantsHTML(m) + '</span></div>' +
        '<div class="entity__subs entity__subs--single"><span class="entity__subs-list lc-meetings__time"><i data-icon="clock-timer" aria-hidden="true"></i>' + esc(S.fmt.time(m.startDateTime)) + '</span></div>' +
      '</div>' +
      '<div class="entity__chips"><span class="chip chip--xs chip--rounded chip--' + CHIP_TONE[m.statusCode] + '"><span class="chip__label">' + esc(labels[m.statusCode] || m.statusCode) + '</span></span></div>' +
    '</div>';
  }

  function setState(root, state) {
    var S = window.HomeStore;
    if (state === 'data' || state === 'empty') state = S && S.meetings('MY').length ? 'data' : 'empty';
    root.setAttribute('data-state', state);
  }

  function render(root) {
    var S = window.HomeStore;
    if (!S || !window.LcStatCard || !window.LcDateBadge) return;
    var s = st(root);
    var empty = root.getAttribute('data-state') === 'empty';
    var c = empty ? { today: 0, week: 0, attention: 0 } : S.meetingCounters('MY');
    var stats = root.querySelector('.lc-meetings__body > .lc-meetings__stats');
    stats.replaceChildren.apply(stats, STATS.map(function (d) {
      return window.LcStatCard.render({ key: d.key, label: d.label, value: c[d.key], tone: d.tone, size: 's', pressed: s.filter === d.key, ariaLabel: d.label + ': ' + c[d.key] + (s.filter === d.key ? ', фильтр включён' : '') });
    }));

    var all = S.meetings('MY');
    var shown = s.filter ? all.filter(function (m) { return S.meetingMatches(m, s.filter); }) : all;
    var list = root.querySelector('.lc-meetings__list');
    if (window.DSTooltip) window.DSTooltip.hideAll();
    list.innerHTML = shown.slice(0, LIMIT).map(function (m) { return rowHTML(m, S); }).join('');
    list.querySelectorAll('[data-date]').forEach(function (lead) {
      lead.appendChild(window.LcDateBadge.render(lead.getAttribute('data-date'), { weekday: true }));
    });

    var none = root.querySelector('.lc-meetings__none');
    none.hidden = shown.length > 0 || !all.length || empty;
    if (s.filter) none.textContent = NONE_TEXT[s.filter];

    if (window.dsIcons) window.dsIcons.apply(root);
    if (window.DSTooltip) window.DSTooltip.bindAll(list);
  }

  /* Данные изменились или сменилась выборка: «данные» и «пусто» пересчитываются,
     загрузку, ошибку и обновление не трогаем. Сам render() состояние не меняет —
     состояние, заданное снаружи (страницей, витриной), он не перебивает. */
  function update(root) {
    var cur = root.getAttribute('data-state');
    if (cur === 'data' || cur === 'empty') setState(root, 'data');
    render(root);
  }

  function refresh(root) {
    setState(root, 'updating');
    setTimeout(function () { setState(root, 'data'); render(root); }, 900);
  }

  function focus(root, filter) {
    st(root).filter = filter || null;
    update(root);
    root.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    var pressed = root.querySelector('.lc-stat[aria-pressed="true"]');
    if (pressed) pressed.focus({ preventScroll: true });
  }

  function init(root) {
    if (root.__lcMeetingsInit) return;
    root.__lcMeetingsInit = true;
    var s = st(root);

    root.addEventListener('click', function (e) {
      var card = e.target.closest('.lc-stat[data-stat]');
      if (card && root.contains(card)) {
        var key = card.getAttribute('data-stat');
        s.filter = s.filter === key ? null : key;
        render(root);
        var again = root.querySelector('.lc-stat[data-stat="' + key + '"]');
        if (again) again.focus();
        return;
      }
      if (e.target.closest('[data-meetings-act="retry"]')) refresh(root);
    });

    if (window.HomeStore) window.HomeStore.on(function (ev) {
      if (ev.kind === 'meetings') update(root);
      if (ev.kind === 'focus' && ev.detail.widget === 'meetings') focus(root, ev.detail.filter);
    });
    render(root);
  }

  function initAll() { document.querySelectorAll('.lc-meetings').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll); else initAll();

  window.LcMeetingsTile = { render: render, setState: setState, refresh: refresh, focus: focus, init: init };
})();

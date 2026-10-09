/* ============================================================
   MyDayTile.js — тайл «Мой день» из HomeStore.day().

   Лента: свои встречи сегодня по времени и две карточки задач (срок
   сегодня, просрочено). Фаза встречи считается от «сейчас» прототипа
   (HomeStore.now): прошла · идёт · ближайшая (через N) · позже.

   API (window.LcMyDayTile):
     render(root)          — подзаголовок и карточки
     setState(root, state) — data-state; data|empty считает сам по данным
   Клик или Enter/Space по строке → HomeStore.focus(виджет, выборка):
   тайл «Встречи» или «Задачи» включает фильтр и прокручивается в зону
   видимости. Перерисовка — на события HomeStore 'meetings' и 'tasks'.
   ============================================================ */
(function () {
  'use strict';

  var STATUS_TONE = { SCHEDULED: 'dpurple', NEEDS_ATTENTION: 'warning', PROTOCOL_DONE: 'success', CANCELLED: 'grey' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function chip(tone, text) {
    return '<span class="chip chip--xs chip--rounded' + (tone ? ' chip--' + tone : '') + '"><span class="chip__label">' + esc(text) + '</span></span>';
  }

  /* Событие — интерактивная строка Entity M: ведущая иконка, Header — время
     или вид срока, Label — клиент или число задач, Chips — фаза и статус. */
  function slot(o) {
    return '<div class="entity entity--interactive" role="button" tabindex="0" data-day-widget="' + o.widget + '" data-day-filter="' + o.filter + '" aria-label="' + esc(o.aria) + '">' +
      '<div class="entity__lead"><span class="entity__icon entity__icon--' + (o.accent ? 'accent' : 'neutral') + '" aria-hidden="true"><i data-icon="' + o.icon + '"></i></span></div>' +
      '<div class="entity__main">' +
        '<div class="entity__titles">' +
          '<p class="entity__header">' + esc(o.header) + '</p>' +
          '<div class="entity__labelrow"><span class="entity__label entity__label--truncate">' + esc(o.label) + '</span></div>' +
        '</div>' +
        '<div class="entity__chips">' + o.chips + '</div>' +
      '</div>' +
    '</div>';
  }

  function meetingSlot(item, S) {
    var m = item.meeting, labels = window.MEETING_STATUS_LABELS || {};
    var time = S.fmt.time(m.startDateTime) + '–' + S.fmt.time(m.endDateTime);
    var chips, accent = false;
    if (item.phase === 'past') {
      chips = m.statusCode === 'SCHEDULED' ? chip('grey', 'Прошла') : chip(STATUS_TONE[m.statusCode], labels[m.statusCode]);
    } else if (item.phase === 'now') {
      accent = true; chips = chip('info', 'Идёт сейчас');
    } else if (item.phase === 'next') {
      accent = true; chips = chip('accent', cap(S.fmt.until(item.minutesLeft)));
      if (m.statusCode === 'NEEDS_ATTENTION') chips += ' ' + chip('warning', labels.NEEDS_ATTENTION);
    } else {
      chips = chip(STATUS_TONE[m.statusCode], labels[m.statusCode]);
    }
    return slot({ widget: 'meetings', filter: 'today', icon: 'calendar', accent: accent, header: time, label: m.clientName, chips: chips,
      aria: time + ', ' + m.clientName + '. Показать встречи сегодня' });
  }

  function render(root) {
    var S = window.HomeStore;
    if (!S) return;
    var d = S.day();
    root.querySelector('[data-day="subtitle"]').textContent =
      cap(S.fmt.weekday(S.today)) + ', ' + S.fmt.longDate(S.today) + ' · сейчас ' + S.now;

    var html = d.meetings.map(function (it) { return meetingSlot(it, S); });
    if (d.tasksToday.length) {
      var high = d.tasksToday.filter(function (t) { return t.priorityCode === 'HIGH'; }).length;
      var n = d.tasksToday.length;
      html.push(slot({ widget: 'tasks', filter: 'today', icon: 'tasks', header: 'Срок сегодня',
        label: n + ' ' + S.plural(n, ['задача', 'задачи', 'задач']),
        chips: high ? chip('warning', 'Высокий: ' + high) : chip('', 'Без срочных'),
        aria: 'Срок сегодня у ' + n + ' ' + S.plural(n, ['задачи', 'задач', 'задач']) + '. Показать задачи' }));
    }
    if (d.tasksOverdue.length) {
      var o = d.tasksOverdue.length;
      var oldest = d.tasksOverdue.reduce(function (x, t) { return Math.max(x, S.daysOverdue(t)); }, 0);
      html.push(slot({ widget: 'tasks', filter: 'overdue', icon: 'alert-triangle', header: 'Просрочено',
        label: o + ' ' + S.plural(o, ['задача', 'задачи', 'задач']),
        chips: chip('error', 'До ' + oldest + ' ' + S.plural(oldest, ['дня', 'дней', 'дней'])),
        aria: 'Просрочено ' + o + ' ' + S.plural(o, ['задача', 'задачи', 'задач']) + '. Показать просроченные задачи' }));
    }
    root.querySelector('[data-day="slots"]').innerHTML = html.join('');
    if (window.dsIcons) window.dsIcons.apply(root);
    return html.length;
  }

  /* «данные» и «пусто» считаются по числу строк дня; render() сам состояние не
     меняет — заданное снаружи (страницей, витриной) не перебивается. */
  function setState(root, state) {
    var n = render(root);
    if (state === 'data' || state === 'empty') state = n ? 'data' : 'empty';
    root.setAttribute('data-state', state);
  }

  function go(card) {
    if (window.HomeStore) window.HomeStore.focus(card.getAttribute('data-day-widget'), card.getAttribute('data-day-filter'));
  }

  function init(root) {
    if (root.__lcDayInit) return;
    root.__lcDayInit = true;
    root.addEventListener('click', function (e) {
      var card = e.target.closest('[data-day-widget]');
      if (card) { go(card); return; }
      if (e.target.closest('[data-day-act="retry"]')) {
        root.setAttribute('data-state', 'loading');
        setTimeout(function () { setState(root, 'data'); }, 700);
      }
    });
    root.addEventListener('keydown', function (e) {
      var card = e.target.closest('[data-day-widget]');
      if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(card); }
    });
    if (window.HomeStore) window.HomeStore.on(function (ev) {
      if (ev.kind === 'meetings' || ev.kind === 'tasks') {
        var cur = root.getAttribute('data-state');
        if (cur === 'data' || cur === 'empty') setState(root, 'data'); else render(root);
      }
    });
    render(root);
  }

  function initAll() { document.querySelectorAll('.lc-day').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll); else initAll();

  window.LcMyDayTile = { render: render, setState: setState, init: init };
})();

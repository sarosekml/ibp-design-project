/* =========================================================================
   home-store.js — хранилище главной: выборки, счётчики и правки демо-данных.

   Подключается после mock-*.js и до скриптов виджетов. Виджеты главной не
   читают MOCK_* напрямую: всё берут отсюда, поэтому счётчик в тайле, его
   список и «Мой день» считаются одной и той же функцией и не расходятся.

   «Сегодня» и «сейчас» прототипа зафиксированы — 09.10.2026, 12:40: экран
   одинаков при каждом открытии (демо-данные детерминированы).

   API (window.HomeStore):
     today · now                       — дата ISO и время ЧЧ:ММ прототипа
     profile                           — EmployeeProfileRsDto
     meetings(scope) → MeetingRsDto[]  — с сегодняшнего дня, по началу;
                                         scope 'MY' | 'DESK'
     meetingCounters(scope)            — { today, week, attention }
     meetingMatches(m, filter)         — filter 'today' | 'week' | 'attention'
     tasks(scope) → TaskRsDto[]        — невыполненные, по срочности
     taskCounters(scope)               — { fresh, freshToday, today, overdue, oldestOverdue }
     taskMatches(t, filter)            — filter 'new' | 'today' | 'overdue'
     dueState(t)                       — 'overdue' | 'today' | 'later'
     news(scope) → ClientNewsRsDto[]   — scope 'MY' | 'DESK', свежие сверху
     day() → { meetings:[{meeting, phase, minutesLeft}], tasksToday, tasksOverdue }
     addMeeting(rq) · addTask(rq) · setTaskStatus(id, code) — правки демо
     on(fn) → снять подписку           — fn({ kind, detail }); kind:
                                         'meetings' | 'tasks' | 'focus'
     focus(widget, filter)             — попросить виджет показать выборку
     fmt — date · time · day · month · longDate · weekday · until
     plural(n, [одна, две, пять])
   ========================================================================= */
(function () {
  'use strict';

  var TODAY = '2026-10-09';
  var NOW = '12:40';
  var MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  var MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  var PRIORITY_RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 };

  function copy(list) { return JSON.parse(JSON.stringify(list || [])); }

  var data = {
    meetings: copy(window.MOCK_MEETINGS),
    tasks: copy(window.MOCK_TASKS),
    news: copy(window.MOCK_NEWS)
  };
  var seq = 0;
  var listeners = [];

  /* ── Даты: ISO-строки, считаются в днях и минутах ─────────────────── */
  function dateOf(iso) { return String(iso).slice(0, 10); }
  function timeOf(iso) { return String(iso).slice(11, 16); }
  function toDate(isoDate) { var p = isoDate.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function toIso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function daysBetween(a, b) { return Math.round((toDate(b) - toDate(a)) / 86400000); }
  function addDays(isoDate, n) { var d = toDate(isoDate); d.setDate(d.getDate() + n); return toIso(d); }
  function minutesOf(hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }

  function plural(n, forms) {
    var a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return forms[2];
    if (b > 1 && b < 5) return forms[1];
    if (b === 1) return forms[0];
    return forms[2];
  }

  var fmt = {
    date: function (iso) { var p = dateOf(iso).split('-'); return p[2] + '.' + p[1] + '.' + p[0]; },
    time: timeOf,
    day: function (iso) { return dateOf(iso).slice(8, 10); },
    month: function (iso) { return MONTHS_SHORT[+dateOf(iso).slice(5, 7) - 1]; },
    longDate: function (iso) { var d = toDate(dateOf(iso)); return d.getDate() + ' ' + MONTHS_GEN[d.getMonth()]; },
    weekday: function (iso) { return WEEKDAYS[toDate(dateOf(iso)).getDay()]; },
    /* «через 2 ч 20 мин» — сколько осталось до начала */
    until: function (mins) {
      var h = Math.floor(mins / 60), m = mins % 60;
      return 'через ' + (h ? h + ' ч' + (m ? ' ' : '') : '') + (m ? m + ' мин' : '');
    }
  };

  /* ── Встречи ──────────────────────────────────────────────────────── */
  function inScope(item, scope) { return scope === 'DESK' || item.isMine; }

  function meetings(scope) {
    return data.meetings
      .filter(function (m) { return inScope(m, scope) && m.statusCode !== 'CANCELLED' && dateOf(m.startDateTime) >= TODAY; })
      .sort(function (a, b) { return a.startDateTime < b.startDateTime ? -1 : a.startDateTime > b.startDateTime ? 1 : 0; });
  }

  /* «На неделе» — семь дней начиная с сегодняшнего, а не календарная неделя:
     в пятницу календарная неделя почти кончилась (открытый вопрос спеки). */
  function meetingMatches(m, filter) {
    var d = dateOf(m.startDateTime);
    if (filter === 'today') return d === TODAY;
    if (filter === 'week') return d <= addDays(TODAY, 6);
    if (filter === 'attention') return m.statusCode === 'NEEDS_ATTENTION';
    return true;
  }

  function meetingCounters(scope) {
    var list = meetings(scope);
    function count(f) { return list.filter(function (m) { return meetingMatches(m, f); }).length; }
    return { today: count('today'), week: count('week'), attention: count('attention') };
  }

  /* ── Задачи ───────────────────────────────────────────────────────── */
  function dueState(t) {
    var d = daysBetween(TODAY, t.dueDate);
    return d < 0 ? 'overdue' : d === 0 ? 'today' : 'later';
  }

  /* Срочность: просроченные (самая старая первой) → сегодняшние (по
     приоритету) → будущие (по сроку, затем приоритету). */
  function urgency(a, b) {
    var order = { overdue: 0, today: 1, later: 2 };
    var sa = dueState(a), sb = dueState(b);
    if (sa !== sb) return order[sa] - order[sb];
    if (sa !== 'today' && a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
    return PRIORITY_RANK[a.priorityCode] - PRIORITY_RANK[b.priorityCode];
  }

  function tasks(scope) {
    return data.tasks
      .filter(function (t) { return inScope(t, scope) && t.statusCode !== 'DONE'; })
      .sort(urgency);
  }

  function taskMatches(t, filter) {
    if (filter === 'new') return t.statusCode === 'NEW';
    if (filter === 'today') return dueState(t) === 'today';
    if (filter === 'overdue') return dueState(t) === 'overdue';
    return true;
  }

  function taskCounters(scope) {
    var list = tasks(scope);
    var fresh = list.filter(function (t) { return taskMatches(t, 'new'); });
    var overdue = list.filter(function (t) { return taskMatches(t, 'overdue'); });
    var oldest = overdue.reduce(function (n, t) { return Math.max(n, daysBetween(t.dueDate, TODAY)); }, 0);
    return {
      fresh: fresh.length,
      freshToday: fresh.filter(function (t) { return t.createdDate === TODAY; }).length,
      today: list.filter(function (t) { return taskMatches(t, 'today'); }).length,
      overdue: overdue.length,
      oldestOverdue: oldest
    };
  }

  /* ── Новости ──────────────────────────────────────────────────────── */
  function news(scope) {
    return data.news
      .filter(function (n) { return scope === 'DESK' || n.isMyClient; })
      .sort(function (a, b) { return a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0; });
  }

  /* ── Мой день: свои встречи сегодня и задачи со сроком ─────────────── */
  function day() {
    var now = minutesOf(NOW), nextTaken = false;
    var list = meetings('MY').filter(function (m) { return dateOf(m.startDateTime) === TODAY; }).map(function (m) {
      var start = minutesOf(timeOf(m.startDateTime)), end = minutesOf(timeOf(m.endDateTime));
      var phase = end <= now ? 'past' : start <= now ? 'now' : nextTaken ? 'later' : 'next';
      if (phase === 'next' || phase === 'now') nextTaken = true;
      return { meeting: m, phase: phase, minutesLeft: Math.max(0, start - now) };
    });
    var mine = tasks('MY');
    return {
      meetings: list,
      tasksToday: mine.filter(function (t) { return taskMatches(t, 'today'); }),
      tasksOverdue: mine.filter(function (t) { return taskMatches(t, 'overdue'); })
    };
  }

  /* ── Правки демо ──────────────────────────────────────────────────── */
  function emit(kind, detail) { listeners.slice().forEach(function (fn) { fn({ kind: kind, detail: detail }); }); }

  function addMeeting(rq) {
    var m = {
      meetingId: 'M-9' + String(++seq).padStart(3, '0'),
      clientName: rq.clientName,
      topic: rq.topic || '',
      startDateTime: rq.date + 'T' + rq.startTime,
      endDateTime: rq.date + 'T' + (rq.endTime || rq.startTime),
      organizerName: rq.organizerName || 'Ким А. С.',
      statusCode: 'SCHEDULED',
      isMine: true
    };
    data.meetings.push(m);
    emit('meetings', { added: m });
    return m;
  }

  function addTask(rq) {
    var t = {
      taskId: 'T-9' + String(++seq).padStart(3, '0'),
      title: rq.title,
      priorityCode: rq.priorityCode || 'MEDIUM',
      statusCode: 'NEW',
      dueDate: rq.dueDate,
      createdDate: TODAY,
      dealNumber: rq.dealNumber || null,
      clientName: rq.clientName || null,
      assigneeName: 'Ким А. С.',
      isMine: true
    };
    data.tasks.push(t);
    emit('tasks', { added: t });
    return t;
  }

  function setTaskStatus(id, code) {
    var t = data.tasks.filter(function (x) { return x.taskId === id; })[0];
    if (!t) return null;
    var prev = t.statusCode;
    t.statusCode = code;
    emit('tasks', { changed: t, prev: prev });
    return prev;
  }

  window.HomeStore = {
    today: TODAY,
    now: NOW,
    profile: window.MOCK_EMPLOYEE_PROFILE || null,
    meetings: meetings,
    meetingCounters: meetingCounters,
    meetingMatches: meetingMatches,
    tasks: tasks,
    taskCounters: taskCounters,
    taskMatches: taskMatches,
    dueState: dueState,
    daysOverdue: function (t) { return Math.max(0, daysBetween(t.dueDate, TODAY)); },
    news: news,
    day: day,
    addMeeting: addMeeting,
    addTask: addTask,
    setTaskStatus: setTaskStatus,
    on: function (fn) {
      listeners.push(fn);
      return function () { listeners = listeners.filter(function (x) { return x !== fn; }); };
    },
    focus: function (widget, filter) { emit('focus', { widget: widget, filter: filter }); },
    fmt: fmt,
    plural: plural
  };
})();

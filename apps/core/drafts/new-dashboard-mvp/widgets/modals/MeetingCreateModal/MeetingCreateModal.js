/* ============================================================
   MeetingCreateModal.js — окно «Новая встреча» и общий слой форм главной.

   Общий слой (window.LcHomeForm) — один на оба окна главной; окно «Новая
   задача» (TaskCreateModal.js) подключается после этого файла и берёт его
   отсюда, своей копии не заводит (Л43):
     select(scrim, id, { options, onChange }) → { set, get, commitTyped }
       список DropdownList под полем: опции { code, label }, набранный руками
       текст — выбор, если совпал с опцией;
     fieldError(input) → { set(msg), clear() }
       ошибка поля — .inp--error и тултип при фокусе (правило InputText);
     parseDate('ДД.ММ.ГГГГ') → ISO | null.

   Окно: открывают триггеры data-modal="meeting-create-scrim" и
   LcMeetingCreateModal.open(). Перед открытием поля сбрасываются: клиент и
   тема пустые, дата — сегодня, время — ближайшие полчаса после «сейчас» и
   час встречи. «Создать встречу» → проверка → HomeStore.addMeeting →
   окно закрывается, уведомление DSSnack.
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  /* ── Общий слой форм ──────────────────────────────────────────── */

  function optionHTML(o, selected) {
    return '<button type="button" class="ddl__item" role="option" aria-selected="' + (selected ? 'true' : 'false') + '" data-code="' + esc(o.code) + '">' +
      '<span class="ddl__item-body"><span class="ddl__item-label">' + esc(o.label) + '</span></span></button>';
  }

  function select(scrim, id, opts) {
    opts = opts || {};
    var control = scrim.querySelector('#' + id);
    var list = scrim.querySelector('#' + id + '-list');
    var field = scrim.querySelector('[data-ddl="' + id + '-list"]');
    var cur = null;
    function options() { return opts.options ? opts.options() : []; }
    function has(code) { return options().some(function (o) { return o.code === code; }); }
    function labelOf(code) { var o = options().filter(function (x) { return x.code === code; })[0]; return o ? o.label : ''; }
    function paint() { if (list) list.innerHTML = options().map(function (o) { return optionHTML(o, o.code === cur); }).join(''); }
    function set(code, silent) {
      cur = has(code) ? code : null;
      if (control) control.value = labelOf(cur);
      paint();
      if (window.DSInput) window.DSInput.syncAll(scrim);
      if (!silent && opts.onChange) opts.onChange(cur);
    }
    function commitTyped() {
      var s = String(control.value || '').trim().toLowerCase();
      if (!s) { if (cur) set(null); return; }
      var hit = options().filter(function (o) { return o.label.toLowerCase() === s; })[0];
      if (hit) set(hit.code, hit.code === cur); else set(cur, true);
    }
    paint();
    if (field && list && window.DSDropdownList) {
      window.DSDropdownList.bind(field, { list: list, onSelect: function (it) { set(it.getAttribute('data-code')); } });
    }
    if (control) {
      control.addEventListener('change', commitTyped);
      var inp = control.closest('.inp');
      if (inp) inp.addEventListener('ds-input:clear', function () { set(null); });
    }
    return { set: function (code) { set(code, true); }, get: function () { return cur; }, commitTyped: commitTyped, refresh: paint };
  }

  function fieldError(input) {
    var inp = input && input.closest('.inp');
    var box = input && input.closest('.inp__box');
    var message = '', api = null;
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

  function parseDate(s) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(s || '').trim());
    if (!m) return null;
    var d = new Date(+m[3], +m[2] - 1, +m[1]);
    if (d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[1]) return null;
    return m[3] + '-' + m[2] + '-' + m[1];
  }

  window.LcHomeForm = { select: select, fieldError: fieldError, parseDate: parseDate, optionHTML: optionHTML };

  /* ── Окно «Новая встреча» ─────────────────────────────────────── */

  var scrim = document.getElementById('meeting-create-scrim');
  if (!scrim) return;

  var TIMES = [];
  for (var h = 8; h <= 20; h++) { TIMES.push(String(h).padStart(2, '0') + ':00'); if (h < 20) TIMES.push(String(h).padStart(2, '0') + ':30'); }
  function timeOptions() { return TIMES.map(function (t) { return { code: t, label: t }; }); }
  function minutes(t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; }

  function clients() {
    var seen = {}, out = [];
    [].concat(window.MOCK_MEETINGS || [], window.MOCK_TASKS || [], window.MOCK_NEWS || []).forEach(function (x) {
      if (x.clientName && !seen[x.clientName]) { seen[x.clientName] = true; out.push({ code: x.clientName, label: x.clientName }); }
    });
    return out.sort(function (a, b) { return a.label.replace(/^\S+\s«/, '').localeCompare(b.label.replace(/^\S+\s«/, ''), 'ru'); });
  }

  var topic = scrim.querySelector('#meeting-create-topic');
  var date = scrim.querySelector('#meeting-create-date');
  var errClient = fieldError(scrim.querySelector('#meeting-create-client'));
  var errTopic = fieldError(topic);
  var errDate = fieldError(date);
  var errStart = fieldError(scrim.querySelector('#meeting-create-start'));
  var errEnd = fieldError(scrim.querySelector('#meeting-create-end'));
  var client = select(scrim, 'meeting-create-client', { options: clients, onChange: function (c) { if (c) errClient.clear(); } });
  var start = select(scrim, 'meeting-create-start', {
    options: timeOptions,
    onChange: function (t) {
      if (!t) return;
      errStart.clear();
      /* окончание по умолчанию — через час после начала */
      if (!end.get() || minutes(end.get()) <= minutes(t)) end.set(TIMES[Math.min(TIMES.indexOf(t) + 2, TIMES.length - 1)]);
      errEnd.clear();
    }
  });
  var end = select(scrim, 'meeting-create-end', { options: timeOptions, onChange: function (t) { if (t) errEnd.clear(); } });
  topic.addEventListener('input', function () { if (topic.value.trim()) errTopic.clear(); });
  date.addEventListener('input', function () { errDate.clear(); });

  function nextSlot() {
    var S = window.HomeStore, now = minutes(S ? S.now : '12:00');
    var t = TIMES.filter(function (x) { return minutes(x) > now; })[0] || TIMES[0];
    return t;
  }

  function reset() {
    var S = window.HomeStore;
    client.set(null);
    topic.value = '';
    var today = S ? S.today : '';
    date.value = today ? today.slice(8, 10) + '.' + today.slice(5, 7) + '.' + today.slice(0, 4) : '';
    var s = nextSlot();
    start.set(s);
    end.set(TIMES[Math.min(TIMES.indexOf(s) + 2, TIMES.length - 1)]);
    [errClient, errTopic, errDate, errStart, errEnd].forEach(function (e) { e.clear(); });
    if (window.DSInput) window.DSInput.syncAll(scrim);
  }

  function validate() {
    client.commitTyped(); start.commitTyped(); end.commitTyped();
    var S = window.HomeStore, ok = true;
    if (!client.get()) { errClient.set('Выберите клиента'); ok = false; }
    if (!topic.value.trim()) { errTopic.set('Укажите тему встречи'); ok = false; }
    var iso = parseDate(date.value);
    if (!iso) { errDate.set('Укажите дату в формате ДД.ММ.ГГГГ'); ok = false; }
    else if (S && iso < S.today) { errDate.set('Дата не может быть раньше сегодняшней'); ok = false; }
    if (!start.get()) { errStart.set('Выберите время начала'); ok = false; }
    if (!end.get()) { errEnd.set('Выберите время окончания'); ok = false; }
    else if (start.get() && minutes(end.get()) <= minutes(start.get())) { errEnd.set('Окончание позже начала'); ok = false; }
    if (!ok) { var first = scrim.querySelector('.inp--error .inp__control'); if (first) first.focus(); }
    return ok ? iso : null;
  }

  function open() {
    reset();
    if (window.DSModal) window.DSModal.open(scrim);
  }

  /* Триггеры data-modal открывает рантайм ДС — поля сбрасываются до него */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-modal="meeting-create-scrim"]')) reset();
  }, true);

  scrim.querySelector('[data-meeting-create-save]').addEventListener('click', function () {
    var S = window.HomeStore, iso = validate();
    if (!S || !iso) return;
    var m = S.addMeeting({ clientName: client.get(), topic: topic.value.trim(), date: iso, startTime: start.get(), endTime: end.get() });
    if (window.DSModal) window.DSModal.closeTop();
    if (window.DSSnack) window.DSSnack.show({
      tone: 'success', title: 'Встреча создана',
      text: m.clientName + ', ' + S.fmt.date(m.startDateTime) + ' в ' + S.fmt.time(m.startDateTime)
    });
  });

  reset();
  window.LcMeetingCreateModal = { open: open, reset: reset };
})();

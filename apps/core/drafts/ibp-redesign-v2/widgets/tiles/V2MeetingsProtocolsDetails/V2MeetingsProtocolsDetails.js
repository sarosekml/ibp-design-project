/* V2MeetingsProtocolsDetails — заполнение предпросмотра встречи.
   render(host, { meeting, onAction }) — встреча (MeetingRsDto из data/store.js);
   onAction(action, payload) — 'finish' | 'cancel' | 'close' | 'doTask':
   окна подтверждения и смена статуса — забота страницы (Р7).
   «Создать лид» (Р6) и карандаш правки — по клику ничего. */
(function () {
  'use strict';

  var SOURCE = { POTENTIAL: 'Потенциал', CLIENT: 'Клиент', DEAL: 'Сделка ДИД' };
  var STATUS_TONE = { SCHEDULED: 'info', COMPLETED: 'success', CANCELLED: 'grey' };
  var PRIORITY_TONE = { MAX: 'error', HIGH: 'error', MEDIUM: 'warning', LOW: 'info' };
  var TASK_TONE = { DONE: 'success', CANCELLED: 'grey', ADJUSTMENT_REQUIRED: 'warning', PENDING_EXECUTION: 'info' };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text; }
  function chip(label, tone) {
    return '<span class="chip chip--s chip--fit' + (tone ? ' chip--' + tone : '') + '"><span class="chip__label">' + esc(label) + '</span></span>';
  }
  /* строка «иконка + подпись + значение» — Entity ДС (header — подпись) */
  function infoRow(icon, header, value) {
    return '<div class="entity"><div class="entity__lead"><span class="entity__icon" aria-hidden="true"><i data-icon="' + icon + '"></i></span></div>'
      + '<div class="entity__main"><div class="entity__titles"><p class="entity__header">' + esc(header) + '</p>'
      + '<div class="entity__labelrow"><span class="entity__label">' + esc(value || '–') + '</span></div></div></div></div>';
  }
  function person(initials, name, role) {
    return '<div class="entity"><div class="entity__lead"><span class="av av--circular av--m"><span class="av__text">' + esc(initials) + '</span></span></div>'
      + '<div class="entity__main"><div class="entity__titles"><div class="entity__labelrow"><span class="entity__label">' + esc(name) + '</span></div></div>'
      + '<div class="entity__subs entity__subs--single"><span class="entity__subs-list">' + esc(role) + '</span></div></div></div>';
  }
  function initials(full) { var p = String(full).split(' '); return (p[0] ? p[0][0] : '') + (p[1] ? p[1][0] : ''); }

  function sourceHref(m) {
    var N = window.IBPR_NAV;
    if (m.sourceType === 'UNIFIED_LEAD') return N.href('lead', {id:m.sourceId,mode:'after'});
    if (m.sourceType === 'POTENTIAL') return N.href('potential', { id: m.sourceId });
    if (m.sourceType === 'CLIENT') return N.href('client', { id: m.clientId });
    var o = window.IBPR.opportunity(m.sourceId);
    return o ? N.href('opportunity', { source: o.source, id: o.id, tab: o.tab }) : '#';
  }

  function render(host, opts) {
    var m = opts && opts.meeting;
    if (!m || !host) return;
    var S = window.IBPR, F = window.DICT_FMT, N = window.IBPR_NAV;
    var cb = opts.onAction || function () {};
    var create = Array.from(host.querySelectorAll('button')).find(function(b){return b.textContent.includes('Создать лид');});
    if(create){create.onclick=function(){if(window.IBPR_NAV.mode()==='after' && window.LEADS){var lead=window.LEADS.create(null,m.id);window.location.href=window.IBPR_NAV.href('lead',{id:lead.id,mode:'after'});}};}

    set(host, '[data-md-title]', 'Встреча ' + m.id + ' от ' + F.date(m.date));
    var st = host.querySelector('[data-md-status]');
    if (st) {
      st.className = 'chip chip--s chip--rounded chip--' + (m.needsAttention && m.statusCode === 'SCHEDULED' ? 'error' : STATUS_TONE[m.statusCode] || 'grey');
      st.querySelector('.chip__label').textContent = S.lbl.meetingStatus(m.statusCode);
    }
    set(host, '[data-md-line]', F.date(m.date) + ', ' + m.timeStart + '–' + m.timeEnd + ' · ' + m.place + ' · ' + m.timezone);
    var upd = host.querySelector('[data-md-update]');
    if (upd) upd.hidden = m.statusCode !== 'SCHEDULED';

    set(host, '[data-md-source-type]', m.sourceType === 'UNIFIED_LEAD' ? 'Лид' : SOURCE[m.sourceType] || m.sourceType);
    set(host, '[data-md-source-label]', m.sourceType === 'CLIENT' ? m.clientName : m.sourceId);
    var sl = host.querySelector('[data-md-source-link]');
    if (sl) sl.setAttribute('href', sourceHref(m));

    var org = S.employee(m.organizerId);
    var info = host.querySelector('[data-md-info]');
    if (info) info.innerHTML = [
      infoRow('calendar', 'Дата встречи', F.date(m.date)),
      infoRow('clock-timer', 'Время', m.timeStart + '–' + m.timeEnd + ' (' + m.timezone + ')'),
      infoRow('calendar-plus', 'Дата создания встречи', F.date(m.createdAt)),
      infoRow('calendar-edit', 'Дата изменения встречи', F.date(m.modifiedAt)),
      infoRow('marker-pin', 'Место встречи', m.place),
      infoRow('user', 'Организатор', org ? org.fullName : '–'),
      infoRow('message-text', 'Способ коммуникации', m.commMethod),
      infoRow('factory-01', 'Клиент', m.clientName),
      infoRow('building-01', 'Холдинг', m.holdingName),
      infoRow('shopping-cart', 'Продукты к обсуждению', (m.productsToDiscuss || []).join(', '))
    ].join('');
    var pc = host.querySelector('[data-md-people-client]');
    if (pc) pc.innerHTML = (m.participantsClient || []).map(function (p) { return person(initials(p.fullName), p.fullName, p.position); }).join('');
    var pd = host.querySelector('[data-md-people-did]');
    if (pd) pd.innerHTML = (m.participantsDid || []).map(function (id) {
      var e = S.employee(id);
      return e ? person(e.initials, e.fullName, e.position) : '';
    }).join('');
    host.querySelectorAll('[data-md-flag]').forEach(function (el) { el.checked = !!m[el.getAttribute('data-md-flag')]; });

    /* повестка: тема → карточки задач (Tile Inset), у неисполненной — «Исполнить» */
    var agSec = host.querySelector('[data-md-agenda-sec]');
    var ag = host.querySelector('[data-md-agenda]');
    var agenda = m.agenda || [];
    if (agSec) agSec.hidden = !agenda.length;
    if (ag) ag.innerHTML = agenda.map(function (topic, i) {
      var tasks = (topic.taskIds || []).map(function (id) { return S.task(id); }).filter(Boolean);
      return '<section class="tile tile--inset"><header class="tile__header"><div class="tile__header-main">'
        + '<p class="tile__subtitle">Тема ' + (i + 1) + '</p><div class="tile__title-row"><h5 class="tile__title">' + esc(topic.title) + '</h5></div></div></header>'
        + '<div class="tile__body"><div class="lc-meeting-details__tasks">' + tasks.map(function (t) {
          var ex = S.employee(t.executorId);
          return '<div class="entity"><div class="entity__main"><div class="entity__titles">'
            + '<div class="entity__labelrow"><span class="entity__label">Задача №' + t.id + '</span></div></div>'
            + '<div class="entity__chips">' + chip(S.lbl.priority(t.priorityCode), PRIORITY_TONE[t.priorityCode]) + chip(S.lbl.taskStatus(t.statusCode), TASK_TONE[t.statusCode]) + '</div>'
            + '<div class="entity__subs"><span class="entity__subs-list">' + esc(t.name) + ' · срок ' + F.date(t.dueDate) + ' · ' + esc(ex ? ex.fullName : '–') + '</span></div></div>'
            + (t.statusCode === 'PENDING_EXECUTION' ? '<div class="entity__actions"><button type="button" class="btn btn--outline btn--xs" data-md-do-task="' + t.id + '"><i data-icon="check"></i><span class="btn__label">Исполнить</span></button></div>' : '')
            + '</div>';
        }).join('') + '</div></div></section>';
    }).join('');

    var lkSec = host.querySelector('[data-md-links-sec]');
    var lk = host.querySelector('[data-md-links]');
    var links = m.links || [];
    if (lkSec) lkSec.hidden = !links.length;
    if (lk) lk.innerHTML = links.map(function (l) {
      var parts = l.label.split(' ');
      var id = parts.pop();
      return '<p class="lc-meeting-details__link-row"><span>' + esc(parts.join(' ')) + '</span>'
        + '<a class="link link--accent link--m" href="' + (N.href(l.page) || '#') + '?' + l.params + '">' + esc(id) + '<i data-icon="arrow-right"></i></a></p>';
    }).join('');

    var bind = function (sel, action) { var b = host.querySelector(sel); if (b) b.onclick = function () { cb(action, m); }; };
    bind('[data-md-finish]', 'finish');
    bind('[data-md-cancel]', 'cancel');
    bind('[data-md-close]', 'close');
    host.querySelectorAll('[data-md-do-task]').forEach(function (b) {
      b.onclick = function () { cb('doTask', S.task(b.getAttribute('data-md-do-task'))); };
    });
    if (window.dsIcons) window.dsIcons.apply(host);
  }

  window.LcMeetingsProtocolsDetails = { render: render };
})();

/* Адаптер MS0015: исходные поля читаются из IBPR, сохраняются только
   ссылки, рабочие изменения и история. Source: invented (12.10.2026). */
(function () {
  'use strict';
  /** @typedef {Object} LeadOverlayRsDto
   * @property {string} id ID единого лида.
   * @property {{type:string,sourceId:(string|number)}[]} basis Основания со ссылками.
   * @property {string} stage Рабочая стадия.
   * @property {string} stageEnteredAt Дата входа в стадию ISO.
   * @property {string} owner Ответственный сотрудник.
   * @property {boolean} picked В подборке недели.
   * @property {Object} fields Рабочие изменения исходных полей.
   * @property {{date:string,title:string,from:string,to:string}[]} history История стадий.
   * @property {string[]} meetingIds Связанные встречи.
   * @property {(string|LeadCommentRsDto)[]} comments Комментарии; строки старых сессий также поддерживаются.
   * @property {Object} documents Выполнение подготовки документов.
   * @property {number|null} opportunityId Сделка после передачи.
   * @property {'ACTIVE'|'IN_PLAN'|'INACTIVE'|'REFUSED'} [clientStatus] Статус клиента (LEAD_STAGES.clientStatus), invented 13.10.2026.
   * @property {boolean} [outOfScope] Запись источника вне демо-выборки MS0016.
   * Source: invented (12.10.2026). */
  var base = window.IBPR;
  var model = window.LEAD_STAGES;
  function copy(v) { return JSON.parse(JSON.stringify(v)); }
  var state = base.extension('leads');
  var listeners = [];
  /** @typedef {Object} LeadCommentRsDto
   * @property {string} id Идентификатор комментария.
   * @property {string|null} authorId Автор из employees.js; null — система.
   * @property {string} createdAt Дата и время ISO с часовым поясом.
   * @property {string} text Текст сообщения.
   * @property {boolean} [system] Системная запись.
   * Source: invented (13.10.2026), примеры обсуждения для концепта. */
  function seedComments(r) {
    var entries = [
      ['04127', '2026-10-13T10:20:00+03:00', 'Посмотрел основание лида. Для следующего разговора нужно уточнить ожидаемый эффект проекта и запросить актуальную управленческую отчётность.'],
      ['04630', '2026-10-13T09:10:00+03:00', 'Связалась с финансовым директором клиента. Интерес к предложению есть; на встречу пригласят также руководителя проекта. Время подтвердят после согласования повестки.'],
      ['02940', '2026-10-12T16:40:00+03:00', 'На первой встрече предлагаю начать с задачи клиента, а затем обсудить структуру финансирования. Не фиксируем окончательные условия до проверки исходных данных.'],
      ['04127', '2026-10-12T11:30:00+03:00', 'Подготовил вопросы к клиенту:\n• Какие инвестиции планируются и в какие сроки?\n• Какой объём собственных средств предусмотрен?\n• Кто со стороны клиента принимает решение?'],
      [null, '2026-10-11T09:00:00+03:00', 'Лид включён в рабочее пространство. Основание: ' + model.basis[r.basis[0].type].title + '.', true]
    ];
    return entries.map(function (c, i) { return { id: r.id + '-demo-comment-' + i, authorId: c[0], createdAt: c[1], text: c[2], system: !!c[3] }; });
  }
  function save() { base.setExtension('leads', state); listeners.slice().forEach(function (fn) { fn(); }); }
  function sources() {
    var items = [];
    var types = { binding: 'BINDING_OPPORTUNITY', possible: 'POSSIBLE_OPPORTUNITY', cib: 'CIB_SALES_PROJECT', campaign: 'SALES_CAMPAIGN' };
    Object.keys(types).forEach(function (source) {
      base.registry(source).filter(function (o) { return o.tab !== 'archive'; }).forEach(function (o) { items.push({ id: 'L-O' + o.id, basis: [{ type: types[source], sourceId: o.id }] }); });
    });
    base.potentials(null, true).forEach(function (p) {
      var type = { did: 'DID_LEAD', cm: 'CM_LEAD', binding: 'BINDING_LEAD', possible: 'POSSIBLE_LEAD' }[p.kind];
      if (type) items.push({ id: p.id, basis: [{ type: type, sourceId: p.id }] });
    });
    base.meetings().filter(function (m) { return m.statusCode === 'COMPLETED' && m.sourceType !== 'UNIFIED_LEAD'; }).forEach(function (m) {
      items.push({ id: 'L-M' + m.id.slice(2), basis: [{ type: 'MEETING', sourceId: m.id }] });
    });
    return items;
  }
  function source(basis) {
    if (basis.type === 'MEETING') return base.meeting(basis.sourceId);
    if (model.basis[basis.type].page === 'opportunity') return base.opportunity(basis.sourceId);
    return base.potential(basis.sourceId);
  }
  function initial(item) {
    var src = source(item.basis[0]);
    return Object.assign({}, item, { stage: 'REVIEW',
      stageEnteredAt: '2026-10-12', owner: src.createdBy || '04127', picked: false,
      fields: {}, history: [], meetingIds: [], comments: [], documents: {}, opportunityId: null });
  }
  // Выбор демо не зависит от порядка реестров: каждый источник получает очередь.
  function eligible(r) { var c = base.client(source(r.basis[0]).clientId); return c.inQuarterPlan && c.responsibleAnalystId === '04127'; }
  function diverse(rows) {
    var groups = Object.keys(model.basis).map(function (code) { return rows.filter(function (r) { return r.basis[0].type === code; }); });
    var result = [], index = 0;
    while (groups.some(function (list) { return list.length > index; })) {
      groups.forEach(function (list) { if (list[index]) result.push(list[index]); }); index++;
    }
    return result;
  }
  function seedWork(row, i) {
      row.stage = model.working[i % model.working.length].code;
      row.owner = '04127';
      row.stageEnteredAt = i < 2 ? '2026-09-24' : '2026-10-08';
      row.history.push({ date: row.stageEnteredAt, title: 'Лид взят в работу (демо)', from: 'REVIEW', to: row.stage });
      if (['MEETING_PLANNED', 'MEETING_DONE', 'DOCUMENTS'].includes(row.stage)) {
        var src = source(row.basis[0]);
          var meeting = base.createMeeting({ clientId: src.clientId, leadId: row.id,
            date: row.stage === 'MEETING_PLANNED' ? '2026-10-15' : '2026-10-08',
            participant: 'Представитель финансовой службы', agenda: src.project || src.idea || 'Обсуждение предложения',
            products: src.productLabels || src.productsToDiscuss || (src.products || []).map(function (p) { return p.name || p; }) });
          row.meetingIds.push(meeting.id);
          if (row.stage !== 'MEETING_PLANNED') { base.finishMeeting(meeting.id); row.protocol = 'Предложение обсуждено. Подготовить условия и согласовать документы (демо).'; }
      }
  }
  // Лиды коллег: рабочие стадии без встреч — видны только во «Всех лидах».
  var COLLEAGUES = ['03882', '05204'];
  function seedColleague(row, i) {
    row.stage = model.working[(i + 2) % model.working.length].code;
    row.owner = COLLEAGUES[i % COLLEAGUES.length];
    row.stageEnteredAt = ['2026-10-09', '2026-10-01', '2026-09-22'][i % 3];
    row.history.push({ date: row.stageEnteredAt, title: 'Лид взят в работу (демо)', from: 'REVIEW', to: row.stage });
  }
  // Архив: три передачи в Pipeline, четыре отказа клиента, три «Не беру».
  var ARCHIVE = [
    ['PIPELINE', '2026-10-06', 'ACTIVE'], ['PIPELINE', '2026-10-02', 'IN_PLAN'], ['PIPELINE', '2026-09-18', 'ACTIVE'],
    ['DECLINED', '2026-10-07', 'REFUSED'], ['DECLINED', '2026-10-01', 'REFUSED'], ['DECLINED', '2026-09-25', 'REFUSED'], ['DECLINED', '2026-09-11', 'REFUSED'],
    ['NOT_TAKEN', '2026-10-09', 'INACTIVE'], ['NOT_TAKEN', '2026-10-05', 'IN_PLAN'], ['NOT_TAKEN', '2026-09-29', 'INACTIVE']
  ];
  function seedArchive(row, i) {
    var a = ARCHIVE[i], reasons = model.reasons[a[0]] || [];
    row.owner = '04127'; row.clientStatus = a[2];
    if (a[0] === 'PIPELINE') {
      row.documents = { onePager: true, termSheet: true, clientDocs: true };
      row.opportunityId = base.createLeadDeal(lead(row.id)).id;
    }
    row.stage = a[0]; row.stageEnteredAt = a[1]; row.reason = reasons[i % (reasons.length || 1)] || '';
    row.history.push({ date: a[1], title: model.get(a[0]).title + (row.reason ? ': ' + row.reason : '') + ' (демо)', from: 'REVIEW', to: a[0] });
  }
  // Демо MS0016 (решение человека 13.10.2026): 70 лидов во «Всех лидах»
  // (подборка 10, мои в работе 15, в работе у коллег 10, Рассмотрение 35) и 10 в архиве.
  // Остальные записи источников лидами не показываются (outOfScope).
  var DEMO_VERSION = 2;
  var STATUS_CYCLE = { picks: ['ACTIVE', 'IN_PLAN', 'ACTIVE'], rest: ['ACTIVE', 'IN_PLAN', 'INACTIVE'] };
  function initialize() {
    state = { rows: sources().map(initial), week: window.WEEKLY_PICKS.week, demoVersion: DEMO_VERSION };
    state.rows.forEach(function (r) { r.comments = seedComments(r); });
    state.commentsDemoVersion = 1;
    var mine = diverse(state.rows.filter(eligible)), others = diverse(state.rows.filter(function (r) { return !eligible(r); }));
    var used = new Set();
    function take(list, n) {
      var out = [];
      for (var i = 0; i < list.length && out.length < n; i++) if (!used.has(list[i].id)) { used.add(list[i].id); out.push(list[i]); }
      return out;
    }
    var picks = take(mine, 10), work = take(mine, 15);
    if (work.length < 15) work = work.concat(take(others, 15 - work.length));
    var archive = take(others, 10), colleagues = take(others, 10), review = take(others.concat(mine), 35);
    state.rows.forEach(function (r) { if (!used.has(r.id)) r.outOfScope = true; });
    picks.forEach(function (r, i) { r.picked = true; r.clientStatus = STATUS_CYCLE.picks[i % 3]; });
    work.forEach(function (r, i) { seedWork(r, i); r.clientStatus = 'ACTIVE'; });
    colleagues.forEach(function (r, i) { seedColleague(r, i); r.clientStatus = STATUS_CYCLE.rest[i % 3]; });
    review.forEach(function (r, i) { r.clientStatus = STATUS_CYCLE.rest[i % 3]; });
    archive.forEach(seedArchive);
    save();
  }
  // Старая стадия объединена с «Встреча проведена» без потери лидов и встреч.
  function migrateStages() {
    var changed = false;
    state.rows.forEach(function (r) {
      if (r.stage === 'MEETING_AGAIN') { r.stage = 'MEETING_DONE'; changed = true; }
      r.history.forEach(function (h) {
        ['from', 'to'].forEach(function (key) {
          if (h[key] === 'MEETING_AGAIN') { h[key] = 'MEETING_DONE'; changed = true; }
        });
      });
    });
    return changed;
  }
  // Старая сессия (другая версия демо) пересобирается целиком: встречи и сделки прежней засевки сбрасываются.
  if (state && state.demoVersion !== DEMO_VERSION) { base.reset(); state = null; }
  if (!state) initialize();
  else if (migrateStages()) save();
  // Дозаполняем существующее демо без сброса встреч, стадий и комментариев пользователя.
  if (state.commentsDemoVersion !== 1) {
    state.rows.forEach(function (r) { r.comments = (r.comments || []).concat(seedComments(r)); });
    state.commentsDemoVersion = 1; save();
  }
  function row(id) { return state.rows.find(function (x) { return x.id === id; }); }
  function lead(id) {
    var r = row(id);
    if (!r) return null;
    var src = source(r.basis[0]), c = base.client(src.clientId);
    var meetings = base.meetings().filter(function (m) {
      return r.meetingIds.includes(m.id) || m.sourceId === id;
    });
    var rawProducts = src.productLabels || src.productsToDiscuss || (src.products || []).map(function (p) { return typeof p === 'string' ? p : p.name; });
    return Object.assign({}, r, {
      clientId: c.id, client: c, clientName: c.name, holdingName: c.holdingName,
      idea: src.idea || src.project || (src.agenda || []).map(function (x) { return x.title; }).join('; ') || '',
      products: rawProducts, amountMln: src.totalVolume || (src.financials || {}).totalVolume || null,
      currency: 'RUB', createdAt: src.createdAt || '2026-10-01',
      lastActivityAt: r.history.length ? r.history[r.history.length - 1].date : src.lastActivityAt || src.createdAt,
      meetings: meetings, tasks: base.tasks().filter(function (t) { return t.sourceId === id || t.clientId === c.id; }),
      nextStep: { title: model.get(r.stage).goal, dueDate: r.fields.dueDate || '2026-10-16' },
      reasons: window.LEAD_PICK_REASONS(c, { amountMln: src.totalVolume || (src.financials || {}).totalVolume }),
      source: src
    }, r.fields);
  }
  function all() { return state.rows.filter(function (r) { return !r.mergedInto && !r.outOfScope; }).map(function (r) { return lead(r.id); }); }
  function patch(id, fields) {
    var r = row(id); if (!r) throw new Error('Лид не найден');
    Object.assign(r.fields, fields); save(); return lead(id);
  }
  function missing(id, target) {
    var l = lead(id);
    if (target === 'IDEA') return [];
    var checkStage = { RESEARCH: 'IDEA', MEETING_PLANNED: 'RESEARCH', MEETING_DONE: 'MEETING_DONE', DOCUMENTS: 'MEETING_DONE', PIPELINE: 'DOCUMENTS' }[target];
    if (!checkStage) return [];
    var result = model.checks(Object.assign({}, l, { stage: checkStage })).filter(function (x) { return !x.done; });
    return result;
  }
  function move(id, target, reason) {
    var r = row(id), current = model.get(r.stage), next = model.get(target);
    if (!next) throw new Error('Неизвестная стадия');
    if (current.final) throw new Error('Используйте «Вернуть в работу»');
    if (target === 'DECLINED' || target === 'NOT_TAKEN') {
      if (!reason) throw new Error('Укажите причину');
      if (target === 'NOT_TAKEN' && r.stage !== 'REVIEW') throw new Error('«Не беру» доступно в Рассмотрении');
    } else {
      var a = model.all.findIndex(function (s) { return s.code === r.stage; });
      var b = model.all.findIndex(function (s) { return s.code === target; });
      if (b > a && !current.next.includes(target)) throw new Error('Сначала завершите текущую стадию');
      if (b > a && missing(id, target).length) throw new Error('Заполните: ' + missing(id, target).map(function (x) { return x.title; }).join(', '));
    }
    if (target === 'PIPELINE') r.opportunityId = base.createLeadDeal(lead(id)).id;
    var prev = r.stage;
    if (target === 'IDEA' && prev === 'REVIEW') { r.owner = base.user.id; r.fields.owner = base.user.id; }
    r.stage = target; r.stageEnteredAt = base.today; r.reason = reason || '';
    r.history.push({ date: base.today, title: next.title + (reason ? ': ' + reason : ''), from: prev, to: target });
    save(); return lead(id);
  }
  function snapshot() { return { state: copy(state), base: base.snapshotState() }; }
  function restore(snapshot) { base.restoreState(snapshot.base); state = copy(snapshot.state); migrateStages(); save(); }
  function revive(id) {
    var r = row(id); if (!model.get(r.stage).final) return;
    var previous = r.stage; r.stage = previous === 'NOT_TAKEN' ? 'REVIEW' : 'IDEA';
    r.stageEnteredAt = base.today; r.history.push({ date: base.today, title: 'Возвращён в работу', from: previous, to: r.stage }); save();
  }
  function create(rq, meetingId) {
    if (meetingId) {
      var existing = state.rows.find(function (r) { return r.basis.some(function (b) { return b.type === 'MEETING' && b.sourceId === meetingId; }); });
      if (existing) { if (existing.outOfScope) { delete existing.outOfScope; save(); } return lead(existing.id); }
      var m = base.meeting(meetingId);
      var r = initial({ id: 'L-M' + meetingId.slice(2), basis: [{ type: 'MEETING', sourceId: meetingId }] });
      r.meetingIds = [m.id]; state.rows.unshift(r); save(); return lead(r.id);
    }
    var p = base.createPotential(rq), created = row(p.id) || initial({ id: p.id, basis: [{ type: 'DID_LEAD', sourceId: p.id }] });
    created.fields = { idea: rq.idea, products: [rq.product], amountMln: Number(rq.amountMln), owner: rq.owner || '04127' };
    if (!row(p.id)) state.rows.unshift(created); save(); return lead(p.id);
  }
  function schedule(id, rq) {
    var l = lead(id), r = row(id);
    var m = base.createMeeting(Object.assign({}, rq, { leadId: id, clientId: l.clientId, owner: l.owner, products: l.products }));
    r.meetingIds.push(m.id); save(); return m;
  }
  function outcome(id, text) {
    var l = lead(id), r = row(id);
    if (!l.meetings.length) throw new Error('Сначала назначьте встречу');
    var meeting = l.meetings.find(function (m) { return m.statusCode === 'SCHEDULED'; }) || l.meetings[0];
    base.finishMeeting(meeting.id);
    r.protocol = text; save();
  }
  function documents(id, flags) { row(id).documents = flags; save(); }
  function comment(id, text) {
    var now = new Date();
    row(id).comments.unshift({ id: id + '-comment-' + now.getTime(), authorId: (window.MOCK_CURRENT_USER || {}).id || null, createdAt: now.toISOString(), text: text });
    save();
  }
  function markBasis(id) { row(id).basisViewed = true; save(); }
  function basisHref(b) {
    var def = model.basis[b.type];
    return window.IBPR_NAV.href(def.page, { id: b.sourceId, source: def.source, mode: 'before' });
  }
  function ensure() {
    var known = new Set(state.rows.map(function (r) { return r.id; }));
    sources().forEach(function (s) { if (!known.has(s.id)) { state.rows.push(initial(s)); known.add(s.id); } });
  }
  base.on(function (e) {
    if (e.kind === 'reset') { initialize(); return; }
    if (e.kind === 'restore') return;
    if (e.kind !== 'extension') { ensure(); listeners.slice().forEach(function (fn) { fn(); }); }
  });
  // Записи вне демо-выборки лидами не считаются: ссылки ведут на исходную страницу.
  function visible(id) { var r = row(id); return r && !r.outOfScope ? lead(id) : null; }
  window.LEADS = { all: all, get: visible, patch: patch, move: move, missing: missing,
    revive: revive, create: create, schedule: schedule, outcome: outcome, documents: documents,
    comment: comment, markBasis: markBasis, basisHref: basisHref, snapshot: snapshot, restore: restore,
    on: function (fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (x) { return x !== fn; }); }; }
  };
})();

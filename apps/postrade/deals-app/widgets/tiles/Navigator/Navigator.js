/* ============================================================
   Navigator.js — тайл «Заведение сделки» на статусной модели сделки.

   Модель — window.DEAL_STATUS_MODEL (data/deal-status-model.js), единственный
   источник: дорожки (вкладки тайла), статусы, переходы, степперы. Тайл ничего
   о статусах не знает сам — всё, что он рисует и делает, берётся из модели.

   Две части:
   — движок (без DOM): какие действия доступны записи сделки и какой patch
     даёт действие вместе с автопереходами модели. Тот же код проверяется в
     Node — смоук этапа Э2 задачи RE0013;
   — отрисовка: вкладки, степпер, подвал, кебаб; клики → движок → save.

   API:
     PostNavigator.laneStatus(deal, laneId) → статус модели | null
       Статус дорожки по полю записи (lanes[].field) и подписи (label).
     PostNavigator.actions(deal) → { buttons: { <дорожка>: [переход] }, menu: [переход] }
       Ручные переходы из текущих статусов: via 'button' — подвал вкладки своей
       дорожки, via 'menu' — кебаб. Переход без via (технический) не показывается.
     PostNavigator.apply(deal, transitionId[, extra]) → { patch, fired } | null
       Ставит статус перехода и в цикле применяет автопереходы модели: after.any —
       сработал любой из переходов, after.all — собраны все отметки (РМ, ПМ, ПМЗ),
       requires — запись стоит во всех статусах списка. extra.patch — поля из
       окна навигатора (дата погашения, ответственный ЦУП), extra.mark —
       отметка РМ/ПМ/ПМЗ. Запись не меняет: patch пишет страница.
     PostNavigator.markOf(transition) → 'rm' | 'pm' | 'pmz' | null
       Чью отметку ставит переход на себя («РМ принял» → 'rm'); ключ поля
       monitoringAcceptance. По нему окно NavigatorApprovalModal выбирает вариант.
     PostNavigator.render(tile, deal, opts)
       opts.progress — [bool×4]: заполнены ли разделы чек-листа «Сделки» до
       «Согласования»; opts.agreed — «Согласование» нажато; opts.lane — вкладка.
     PostNavigator.bind(tile, { get, save, progress, openModal }) → { paint, off }
       get() — текущая запись; save(patch) — запись в стор; progress(deal) →
       [bool×4]; openModal(name, transition, done(extra)) — окно навигатора
       (widgets/modals/Navigator…Modal; страница берёт его из реестра
       PostNavigatorModals); вернуть false — окна нет, переход сразу. Не дала openModal —
       тоже сразу. Без save тайл перерисовывается сам; с save перерисовку
       зовёт страница — paint() по событию стора.
   ============================================================ */
(function () {
  'use strict';

  var ROOT = '.lc-navigator';
  /* Отметки внутри статуса (переход на себя) — поле записи monitoringAcceptance
     (mock-deals.js, typedef MonitoringAcceptanceRsDto). Ключ — по подписи
     кнопки; порядок ключей — порядок шагов в рамке «Передача» степпера
     (РМ · ПМ · Залоги). */
  var MARKS = [
    { key: 'rm', action: 'РМ принял' },
    { key: 'pm', action: 'ПМ принял' },
    { key: 'pmz', action: 'ПМЗ принял' }
  ];
  var MARK_FIELD = 'monitoringAcceptance';
  /* Удалённая сделка: статусы трёх других ролей не показываются (пояснение
     к статусу «Удалена» в модели). */
  var DELETED = 'deal_deleted';

  /* ── Индексы модели ─────────────────────────────────────────────── */

  var IX = null;
  function ix() {
    if (IX) return IX;
    var m = window.DEAL_STATUS_MODEL;
    if (!m) { console.error('Navigator: нет window.DEAL_STATUS_MODEL — подключите deal-status-model.js'); return null; }
    IX = { model: m, lane: {}, status: {}, byLabel: {}, tr: {} };
    m.lanes.forEach(function (l) { IX.lane[l.id] = l; IX.byLabel[l.id] = {}; });
    m.statuses.forEach(function (s) {
      IX.status[s.id] = s;
      if (!(s.label in IX.byLabel[s.lane])) IX.byLabel[s.lane][s.label] = s;
    });
    m.transitions.forEach(function (t) { IX.tr[t.id] = t; });
    return IX;
  }

  function laneOfTransition(t) { var s = ix().status[t.from]; return s ? s.lane : null; }

  function markOf(t) {
    if (!t || t.from !== t.to) return null;
    for (var i = 0; i < MARKS.length; i++) if (MARKS[i].action === t.action) return MARKS[i].key;
    return null;
  }

  /* ── Движок ─────────────────────────────────────────────────────── */

  function laneStatus(deal, laneId) {
    var I = ix(); if (!I || !deal) return null;
    var lane = I.lane[laneId];
    return lane ? (I.byLabel[laneId][deal[lane.field]] || null) : null;
  }

  function actions(deal) {
    var I = ix(); var out = { buttons: {}, menu: [] };
    if (!I) return out;
    I.model.lanes.forEach(function (l) { out.buttons[l.id] = []; });
    I.model.transitions.forEach(function (t) {
      if (t.trigger !== 'manual' || !t.via || !t.action) return;
      var lane = laneOfTransition(t);
      var cur = laneStatus(deal, lane);
      if (!cur || cur.id !== t.from) return;
      if (t.via === 'button') out.buttons[lane].push(t);
      else out.menu.push(t);
    });
    return out;
  }

  function apply(deal, transitionId, extra) {
    var I = ix(); if (!I || !deal) return null;
    var first = I.tr[transitionId];
    if (!first) return null;
    extra = extra || {};
    var rec = {};
    I.model.lanes.forEach(function (l) { rec[l.field] = deal[l.field]; });
    var marks = Object.assign({}, deal[MARK_FIELD] || {});
    var cur = function (laneId) { return I.byLabel[laneId][rec[I.lane[laneId].field]] || null; };
    var fired = [];

    function fire(t) {
      var lane = laneOfTransition(t);
      var key = markOf(t);
      if (key) marks[key] = extra.mark || { approver: '', approvalDate: '' };
      if (t.from !== t.to) {
        rec[I.lane[lane].field] = I.status[t.to].label;
        /* отметки РМ/ПМ/ПМЗ живут, пока статус не сменился */
        if (lane === 'mon') marks = {};
      }
      fired.push(t.id);
    }

    var c0 = cur(laneOfTransition(first));
    if (!c0 || c0.id !== first.from) return null;
    fire(first);

    function triggered(a) {
      if (!a.after) return false;
      if (a.after.any) return a.after.any.some(function (id) { return fired.indexOf(id) !== -1; });
      if (a.after.all) {
        var now = a.after.all.some(function (id) { return fired.indexOf(id) !== -1; });
        return now && a.after.all.every(function (id) { var k = markOf(I.tr[id]); return k && marks[k]; });
      }
      return false;
    }
    function required(a) {
      return (a.requires || []).every(function (sid) {
        var s = I.status[sid]; var c = s && cur(s.lane); return c && c.id === sid;
      });
    }

    var autos = I.model.transitions.filter(function (t) { return t.trigger === 'auto'; });
    for (var guard = 0, changed = true; changed && guard < 20; guard++) {
      changed = false;
      autos.forEach(function (a) {
        if (fired.indexOf(a.id) !== -1) return;
        var c = cur(laneOfTransition(a));
        if (!c || c.id !== a.from || !triggered(a) || !required(a)) return;
        fire(a); changed = true;
      });
    }

    var patch = {};
    Object.keys(rec).forEach(function (f) { if (rec[f] !== deal[f]) patch[f] = rec[f]; });
    var before = JSON.stringify(deal[MARK_FIELD] || {});
    var hasMarks = Object.keys(marks).length > 0;
    if (JSON.stringify(marks) !== before) patch[MARK_FIELD] = hasMarks ? marks : null;
    Object.assign(patch, extra.patch || {});
    return { patch: patch, fired: fired };
  }

  /* ── Степпер ────────────────────────────────────────────────────── */

  function stepperOf(laneId, statusId) {
    var I = ix();
    for (var i = 0; i < I.model.steppers.length; i++) {
      var s = I.model.steppers[i];
      if (s.lane === laneId && s.shownIn.indexOf(statusId) !== -1) return s;
    }
    return null;
  }

  /* Состояния шагов пути статусов. Пройденные статусы вместе с текущим —
     done, следующий шаг — current, дальше — pending (макет screenflow).
     Текущего статуса среди шагов нет (корректировка, «На утверждении») —
     current у шага, куда из него ведёт переход модели, шаги до него — done
     (допущение 10.10.2026). */
  function pathStates(steps, statusId) {
    var I = ix();
    var at = -1;
    steps.forEach(function (st, i) { if (st.status === statusId && at === -1) at = i; });
    var next;
    if (at !== -1) next = at + 1;
    else {
      next = -1;
      I.model.transitions.forEach(function (t) {
        if (next !== -1 || t.from !== statusId || t.from === t.to) return;
        steps.forEach(function (st, i) { if (next === -1 && st.status === t.to) next = i; });
      });
      if (next === -1) next = 0;
    }
    return steps.map(function (st, i) { return i < next ? 'done' : (i === next ? 'current' : 'pending'); });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var STATE_TEXT = { done: 'пройден', current: 'следующий', pending: 'впереди' };

  function markerHTML(n, state) {
    var mod = state === 'done' ? ' stepmark--done' : (state === 'current' ? ' stepmark--current' : '');
    return '<span class="stepmark stepmark--s' + mod + '" aria-hidden="true"><span class="stepmark__num">' + n
      + '</span><i class="stepmark__icon" data-icon="check"></i></span>';
  }

  function stepHTML(n, label, state, inner) {
    return '<li class="lc-navigator__step" data-state="' + state + '"' + (state === 'current' ? ' aria-current="step"' : '')
      + ' aria-label="' + esc(label + ' — ' + STATE_TEXT[state]) + '">'
      + markerHTML(n, state) + (inner || '<span class="lc-navigator__label">' + esc(label) + '</span>') + '</li>';
  }

  function groupHTML(step, state, marks, isCurrent) {
    var items = step.group.items.map(function (label, i) {
      var key = MARKS[i] && MARKS[i].key;
      var st = state === 'done' && !isCurrent ? 'done' : ((isCurrent && key && marks[key]) ? 'done' : 'pending');
      return stepHTML(i + 1, label, st);
    }).join('');
    return '<li class="lc-navigator__step lc-navigator__step--group">'
      + '<div class="lc-navigator__group"><p class="lc-navigator__group-title">' + esc(step.group.title) + '</p>'
      + '<ol class="lc-navigator__steps">' + items + '</ol></div></li>';
  }

  function checklistHTML(stepper, deal, opts, editable) {
    var progress = opts.progress || [];
    var last = stepper.steps.length - 1;
    return stepper.steps.map(function (st, i) {
      if (i < last) return stepHTML(i + 1, st.label, progress[i] ? 'done' : 'pending');
      /* «Согласование» нажимается, пока статус допускает правку; в статусах
         без правки сделка уже согласована — шаг пройден */
      if (!editable || opts.agreed) return stepHTML(i + 1, st.label, 'done');
      return '<li class="lc-navigator__step lc-navigator__step--action" data-state="current" aria-current="step">'
        + markerHTML(i + 1, 'current')
        + '<button type="button" class="btn btn--transparent btn--s" data-nav-agree>'
        + '<span class="btn__label">' + esc(st.label) + '</span></button></li>';
    }).join('');
  }

  function statusesHTML(stepper, status, deal) {
    var states = pathStates(stepper.steps, status.id);
    var marks = deal[MARK_FIELD] || {};
    var n = 0;
    return stepper.steps.map(function (st, i) {
      if (st.group) return groupHTML(st, states[i], marks, st.status === status.id);
      n += 1;
      return stepHTML(n, st.label, states[i]);
    }).join('');
  }

  /* ── Панель вкладки ─────────────────────────────────────────────── */

  function footHTML(lane, status, rawValue, buttons, extra, gated) {
    var parts = buttons.map(function (t, i) {
      var type = i === 0 ? 'btn--accent' : 'btn--outline';
      return '<button type="button" class="btn ' + type + ' btn--s btn--fullwidth"' + (gated ? ' disabled' : '')
        + ' data-nav-act="' + esc(t.id) + '"><span class="btn__label">' + esc(t.action) + '</span></button>';
    });
    /* дополнительные кнопки степпера («Список изменений») — куда ведут, не
       решено (вопрос 26 модели): кнопка есть, действия нет */
    (extra || []).forEach(function (b) {
      parts.push('<button type="button" class="btn btn--outline btn--s btn--fullwidth" data-nav-extra>'
        + '<span class="btn__label">' + esc(b.label) + '</span></button>');
    });
    if (!parts.length) {
      parts.push('<p class="lc-navigator__status">' + esc(status ? status.label : (rawValue || '—')) + '</p>');
    }
    return '<div class="lc-navigator__foot">' + parts.join('') + '</div>';
  }

  function panelHTML(lane, deal, acts, opts) {
    var status = laneStatus(deal, lane.id);
    var dealStatus = laneStatus(deal, 'deal');
    if (dealStatus && dealStatus.id === DELETED && lane.id !== dealStatus.lane) {
      return footHTML(lane, null, '—', [], [], false);
    }
    var stepper = status ? stepperOf(lane.id, status.id) : null;
    var steps = '';
    var gated = false;
    if (stepper && stepper.steps.length) {
      if (stepper.mode === 'checklist') {
        var editable = status.editable !== false;
        steps = checklistHTML(stepper, deal, opts, editable);
        /* кнопки дорожки с чек-листом ждут последнего шага («Согласование») */
        gated = editable && !opts.agreed;
      } else {
        steps = statusesHTML(stepper, status, deal);
      }
    }
    var extra = stepper && stepper.extraButtons
      ? stepper.extraButtons.filter(function (b) { return b.shownIn.indexOf(status.id) !== -1; })
      : [];
    return (steps ? '<ol class="lc-navigator__steps">' + steps + '</ol>' : '')
      + footHTML(lane, status, deal[lane.field], acts.buttons[lane.id] || [], extra, gated);
  }

  /* ── Отрисовка ──────────────────────────────────────────────────── */

  var seq = 0;

  function menuHTML(tile, items) {
    if (!tile.__navMenuId) tile.__navMenuId = 'lc-navigator-menu-' + (++seq);
    var id = tile.__navMenuId;
    return '<span class="menu-anchor">'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m" aria-label="Действия со сделкой" data-menu="' + id + '" data-menu-align="end"><i data-icon="more-dots"></i></button>'
      + '<div id="' + id + '" class="menu menu--floating" role="menu" hidden>'
      + items.map(function (t) {
        return '<button type="button" class="menu__item" role="menuitem" data-nav-act="' + esc(t.id) + '">'
          + '<span class="menu__item-label">' + esc(t.action) + '</span></button>';
      }).join('')
      + '</div></span>';
  }

  function render(tile, deal, opts) {
    var I = ix();
    if (!tile || !I) return;
    opts = opts || {};
    if (!deal) { tile.setAttribute('data-state', 'error'); return; }
    var acts = actions(deal);
    var laneSel = opts.lane || tile.__navLane || I.model.lanes[0].id;
    tile.__navLane = laneSel;

    if (window.DSMenu) window.DSMenu.closeAll();

    /* кебаб: переходы с via 'menu'; пунктов нет — кебаба нет. Старое меню
       рантайм мог унести в общий слой — убираем его по id. */
    var actionsBox = tile.querySelector('.lc-navigator__actions');
    if (actionsBox) {
      var oldMenu = tile.__navMenuId && document.getElementById(tile.__navMenuId);
      if (oldMenu && !actionsBox.contains(oldMenu)) oldMenu.remove();
      actionsBox.innerHTML = acts.menu.length ? menuHTML(tile, acts.menu) : '';
      actionsBox.hidden = !acts.menu.length;
    }

    I.model.lanes.forEach(function (lane) {
      var tab = tile.querySelector('.tab[data-nav-lane="' + lane.id + '"]');
      var panel = tile.querySelector('.lc-navigator__panel[data-nav-lane="' + lane.id + '"]');
      var on = lane.id === laneSel;
      if (tab) {
        var lbl = tab.querySelector('.tab__label');
        if (lbl) lbl.textContent = lane.label;
        tab.classList.toggle('tab--selected', on);
        tab.setAttribute('aria-selected', String(on));
        tab.setAttribute('tabindex', on ? '0' : '-1');
      }
      if (panel) {
        panel.innerHTML = panelHTML(lane, deal, acts, opts);
        panel.hidden = !on;
      }
    });

    tile.setAttribute('data-state', 'data');
    if (window.dsIcons) window.dsIcons.apply(tile);
    if (window.DSMenu) window.DSMenu.bindAll(tile);
  }

  /* Вкладки ведёт рантайм Tab (data-tabs), показ панели — тайл. Выбор читается
     макрозадачей (setTimeout 0) — после всей рассылки события, когда рантайм
     уже переставил aria-selected, в каком бы порядке ни привязали слушатели.
     Микрозадача здесь не годится: при настоящем клике браузер выполняет
     микрозадачи после КАЖДОГО слушателя, а слушатель тайла встаёт раньше
     рантайма (ds-body грузит рантаймы асинхронно) — тайл читал прежнюю вкладку,
     и панель отставала на клик (урок Л203; синтетический клик смоука этого не
     воспроизводит). onChange рантайма тоже не годится: группу он привязывает
     сам, повторный DSTabs.tabs отдаёт готовый api без onChange. */
  function watchTabs(tile) {
    var bar = tile.querySelector('[data-nav-tabs]');
    if (!bar || bar.__navWatch) return;
    bar.__navWatch = true;
    function sync() {
      setTimeout(function () {
        var sel = bar.querySelector('.tab[aria-selected="true"]');
        var lane = sel && sel.getAttribute('data-nav-lane');
        if (!lane || lane === tile.__navLane) return;
        tile.__navLane = lane;
        tile.querySelectorAll('.lc-navigator__panel').forEach(function (p) {
          p.hidden = p.getAttribute('data-nav-lane') !== lane;
        });
      }, 0);
    }
    bar.addEventListener('click', sync);
    bar.addEventListener('keydown', sync);
  }

  function emit(tile, action, detail) {
    tile.dispatchEvent(new CustomEvent('navaction', {
      bubbles: true, detail: Object.assign({ action: action }, detail || {})
    }));
  }

  function bind(tile, cfg) {
    if (!tile || !cfg || !cfg.get) return function () {};
    /* «Согласование» нажато — флаг тайла, привязан к статусу сделки: смена
       статуса его сбрасывает */
    var agreedAt = null;

    function opts(deal) {
      var s = laneStatus(deal, 'deal');
      return {
        progress: cfg.progress ? cfg.progress(deal) : [],
        agreed: !!(s && agreedAt === s.id)
      };
    }
    function paint() { var d = cfg.get(); render(tile, d, opts(d)); }

    function run(tid, extra) {
      var res = apply(cfg.get(), tid, extra);
      if (!res) return;
      agreedAt = null;
      if (cfg.save) cfg.save(res.patch, res);
      else paint();
    }

    tile.__navAct = function (tid) {
      var t = ix().tr[tid];
      if (!t) return;
      if (t.modal && cfg.openModal && cfg.openModal(t.modal, t, function (extra) { run(tid, extra); }) !== false) return;
      run(tid);
    };
    tile.__navAgree = function () {
      var s = laneStatus(cfg.get(), 'deal');
      agreedAt = s ? s.id : null;
      paint();
    };
    watchTabs(tile);
    paint();
    return {
      paint: paint,
      off: function () { tile.__navAct = null; tile.__navAgree = null; }
    };
  }

  /* Пункты кебаба рантайм держит в общем слое DSFloat, вне тайла: их тайл
     восстанавливается по кнопке-триггеру меню (Л88). */
  function ownerOf(el) {
    var menu = el.closest('.menu');
    if (menu && menu.id) {
      var trigger = document.querySelector('[data-menu="' + menu.id + '"]');
      return trigger ? trigger.closest(ROOT) : null;
    }
    return el.closest(ROOT);
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-nav-act], [data-nav-agree], [data-nav-retry]');
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    var tile = ownerOf(el);
    if (!tile) return;
    if (el.hasAttribute('data-nav-agree')) { if (tile.__navAgree) tile.__navAgree(); return; }
    if (el.hasAttribute('data-nav-retry')) { emit(tile, 'RETRY'); return; }
    var tid = el.getAttribute('data-nav-act');
    if (tile.__navAct) tile.__navAct(tid);
    else emit(tile, 'TRANSITION', { transition: tid });
  });

  function wireTabs(root) { (root || document).querySelectorAll(ROOT).forEach(watchTabs); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { wireTabs(document); });
  else wireTabs(document);

  window.PostNavigator = {
    laneStatus: laneStatus,
    actions: actions,
    apply: apply,
    markOf: markOf,
    stepperOf: stepperOf,
    pathStates: pathStates,
    render: render,
    bind: bind
  };
})();

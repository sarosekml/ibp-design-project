/* ============================================================
   TasksTile.js — тайл «Задачи» из HomeStore.

   Тайл сам находит свои корни (.lc-tasks) на DOMContentLoaded и рисует
   счётчики и список — живой и на странице, и в витрине. Загрузку ставит
   страница (state="loading" метки).

   API (window.LcTasksTile):
     render(root)            — счётчики, список, «данных нет»
     setState(root, state)   — data-state; data|empty считает сам по данным
     refresh(root)           — обновление: updating → данные
     focus(root, filter)     — показать выборку счётчика и прокрутить к тайлу
   Действия со строкой меняют статус в HomeStore и подтверждаются
   уведомлением DSSnack с отменой. Хуки рантаймов: data-segctrl, data-menu
   (меню шапки и строки), data-modal (окно «Новая задача»).
   ============================================================ */
(function () {
  'use strict';

  var LIMIT = 5;
  var NONE_TEXT = {
    'new': 'Новых задач нет',
    today: 'Задач со сроком сегодня нет',
    overdue: 'Просроченных задач нет'
  };
  var PRIORITY_DOT = { HIGH: 'error', MEDIUM: 'warning', LOW: 'neutral' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function st(root) { return root.__lcTasks || (root.__lcTasks = { scope: 'MY', filter: null, menuTask: null }); }
  function editable(root) { return root.getAttribute('data-mode') !== 'view'; }

  function dueChip(t, S) {
    var state = S.dueState(t);
    if (state === 'overdue') {
      var n = S.daysOverdue(t);
      return '<span class="chip chip--xs chip--rounded chip--error"><span class="chip__label">Просрочено на ' + n + ' ' + S.plural(n, ['день', 'дня', 'дней']) + '</span></span>';
    }
    if (state === 'today') return '<span class="chip chip--xs chip--rounded chip--warning"><span class="chip__label">Срок сегодня</span></span>';
    return '<span class="chip chip--xs chip--rounded"><span class="chip__label">До ' + S.fmt.date(t.dueDate) + '</span></span>';
  }

  function rowHTML(t, S, canEdit) {
    var pl = window.TASK_PRIORITY_LABELS || {};
    var meta = [];
    if (!t.isMine) meta.push(t.assigneeName);
    if (t.dealNumber) meta.push('Сделка ' + t.dealNumber);
    if (t.clientName) meta.push(t.clientName);
    if (!meta.length) meta.push('Без сделки и клиента');
    var status = t.statusCode === 'IN_PROGRESS'
      ? '<span class="chip chip--xs chip--rounded chip--info"><span class="chip__label">' + esc((window.TASK_STATUS_LABELS || {}).IN_PROGRESS || 'В работе') + '</span></span>'
      : '';
    var take = canEdit && t.isMine && t.statusCode === 'NEW'
      ? '<button type="button" class="btn btn--outline btn--xs" data-task-act="take"><span class="btn__label">Взять в работу</span></button>'
      : '';
    return '<div class="entity lc-tasks__row" data-task-id="' + esc(t.taskId) + '">' +
      '<div class="entity__main">' +
        '<div class="entity__titles">' +
          '<p class="entity__header"><span class="badge badge--dot badge--' + PRIORITY_DOT[t.priorityCode] + '" aria-hidden="true"></span>' + esc((pl[t.priorityCode] || '') + ' приоритет') + '</p>' +
          '<div class="entity__labelrow"><span class="entity__label entity__label--truncate" data-tooltip="' + esc(t.title) + '" data-tooltip-truncated="only">' + esc(t.title) + '</span></div>' +
        '</div>' +
        '<div class="entity__subs entity__subs--single"><span class="entity__subs-list">' + esc(meta.join(' · ')) + '</span></div>' +
        '<div class="entity__chips">' + dueChip(t, S) + status + '</div>' +
      '</div>' +
      '<div class="entity__actions">' + take +
        '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Действия с задачей" aria-haspopup="menu" data-menu="lc-tasks-row-menu" data-menu-align="end"><i data-icon="more-dots"></i></button>' +
      '</div>' +
    '</div>';
  }

  function statCards(root, S) {
    var s = st(root), c = S.taskCounters(s.scope);
    var defs = [
      { key: 'new', label: 'Новые', value: c.fresh, tone: 'accent',
        caption: c.freshToday ? c.freshToday + ' ' + S.plural(c.freshToday, ['пришла', 'пришли', 'пришли']) + ' сегодня' : 'сегодня новых нет' },
      { key: 'today', label: 'Сегодня', value: c.today, tone: 'warning', caption: 'срок истекает сегодня' },
      { key: 'overdue', label: 'Просрочено', value: c.overdue, tone: 'error',
        caption: c.overdue ? 'самая старая — ' + c.oldestOverdue + ' ' + S.plural(c.oldestOverdue, ['день', 'дня', 'дней']) : 'просрочек нет' }
    ];
    return defs.map(function (d) {
      return window.LcStatCard.render({ key: d.key, label: d.label, value: d.value, caption: d.caption, tone: d.tone, pressed: s.filter === d.key,
        ariaLabel: d.label + ': ' + d.value + ', ' + d.caption + (s.filter === d.key ? ', фильтр включён' : '') });
    });
  }

  function setState(root, state) {
    var S = window.HomeStore;
    if (state === 'data' || state === 'empty') state = S && S.tasks(st(root).scope).length ? 'data' : 'empty';
    root.setAttribute('data-state', state);
  }

  function render(root) {
    var S = window.HomeStore;
    if (!S || !window.LcStatCard) return;
    var s = st(root);
    var stats = root.querySelector('.lc-tasks__body > .lc-tasks__stats');
    stats.replaceChildren.apply(stats, statCards(root, S));

    var all = S.tasks(s.scope);
    var shown = s.filter ? all.filter(function (t) { return S.taskMatches(t, s.filter); }) : all;
    var list = root.querySelector('.lc-tasks__list');
    if (window.DSTooltip) window.DSTooltip.hideAll();
    list.innerHTML = shown.slice(0, LIMIT).map(function (t) { return rowHTML(t, S, editable(root)); }).join('');

    var none = root.querySelector('.lc-tasks__none');
    none.hidden = shown.length > 0 || !all.length;
    if (s.filter) none.textContent = NONE_TEXT[s.filter];
    root.querySelector('.lc-tasks__count').textContent = shown.length > LIMIT ? 'Показано ' + LIMIT + ' из ' + shown.length : '';

    var add = document.querySelector('#lc-tasks-menu [data-tasks-act="add"]');
    if (add) add.hidden = !editable(root);

    if (window.dsIcons) window.dsIcons.apply(root);
    if (window.DSMenu) window.DSMenu.bindAll(list);
    if (window.DSTooltip) window.DSTooltip.bindAll(list);
  }

  /* Данные изменились или сменилась выборка: пересчёт «данные / пусто»;
     render() сам состояние не меняет (см. MeetingsTile.js). */
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
    var s = st(root);
    s.filter = filter || null;
    if (s.scope !== 'MY') {
      s.scope = 'MY';
      var seg = root.querySelector('.lc-tasks__scope');
      var my = seg && seg.querySelector('[data-scope="MY"]');
      if (my && seg.__dsSeg) seg.__dsSeg.select(my);
    }
    update(root);
    root.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    var pressed = root.querySelector('.lc-stat[aria-pressed="true"]');
    if (pressed) pressed.focus({ preventScroll: true });
  }

  /* Смена статуса с подтверждением и отменой */
  function changeStatus(root, taskId, code) {
    var S = window.HomeStore;
    var task = S.tasks('DESK').filter(function (t) { return t.taskId === taskId; })[0];
    if (!task) return;
    var prev = S.setTaskStatus(taskId, code);
    var title = code === 'IN_PROGRESS' ? 'Задача взята в работу' : code === 'DONE' ? 'Задача выполнена' : 'Задача возвращена в новые';
    if (window.DSSnack) window.DSSnack.show({
      tone: 'success', title: title, text: task.title,
      buttons: [{ label: 'Отменить', variant: 'transparent', onClick: function () { S.setTaskStatus(taskId, prev); } }]
    });
  }

  function init(root) {
    if (root.__lcTasksInit) return;
    root.__lcTasksInit = true;
    var s = st(root);

    var seg = root.querySelector('.lc-tasks__scope');
    function syncScope() {
      setTimeout(function () {
        var on = seg.querySelector('.segctrl__item[aria-checked="true"]');
        var scope = on ? on.getAttribute('data-scope') : 'MY';
        if (scope !== s.scope) { s.scope = scope; s.filter = null; update(root); }
      }, 0);
    }
    seg.addEventListener('click', syncScope);
    seg.addEventListener('keydown', syncScope);

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
      var row = e.target.closest('.lc-tasks__row');
      /* Триггер меню строки — запоминаем задачу до открытия меню (Л88) */
      if (row && e.target.closest('[data-menu="lc-tasks-row-menu"]')) { s.menuTask = row.getAttribute('data-task-id'); syncRowMenu(root); return; }
      if (row && e.target.closest('[data-task-act="take"]')) { changeStatus(root, row.getAttribute('data-task-id'), 'IN_PROGRESS'); return; }
      if (e.target.closest('[data-tasks-act="retry"]')) refresh(root);
    }, true);

    var rowMenu = document.getElementById('lc-tasks-row-menu');
    if (rowMenu) rowMenu.addEventListener('click', function (e) {
      var item = e.target.closest('[data-task-act]');
      if (!item || !s.menuTask || item.getAttribute('aria-disabled') === 'true') return;
      var act = item.getAttribute('data-task-act');
      if (act === 'take') changeStatus(root, s.menuTask, 'IN_PROGRESS');
      if (act === 'return') changeStatus(root, s.menuTask, 'NEW');
      if (act === 'done') changeStatus(root, s.menuTask, 'DONE');
      if (act === 'open') document.dispatchEvent(new CustomEvent('home:goto', { detail: { section: 'tasks' } }));
    });

    var menu = document.getElementById('lc-tasks-menu');
    if (menu) menu.addEventListener('click', function (e) {
      var item = e.target.closest('[data-tasks-act]');
      if (!item) return;
      var act = item.getAttribute('data-tasks-act');
      if (act === 'refresh') refresh(root);
      if (act === 'add' && window.LcTaskCreateModal) window.LcTaskCreateModal.open();
    });

    if (window.HomeStore) window.HomeStore.on(function (ev) {
      if (ev.kind === 'tasks') update(root);
      if (ev.kind === 'focus' && ev.detail.widget === 'tasks') focus(root, ev.detail.filter);
    });
    render(root);
  }

  /* Пункты меню строки — по задаче, чьё меню открыто: правка статуса — только
     своей задаче и только в режиме правки; невозможный пункт скрывается. */
  function syncRowMenu(root) {
    var menu = document.getElementById('lc-tasks-row-menu');
    var S = window.HomeStore;
    if (!menu || !S) return;
    var t = S.tasks('DESK').filter(function (x) { return x.taskId === st(root).menuTask; })[0];
    var can = !!t && t.isMine && editable(root);
    menu.querySelector('[data-task-act="take"]').hidden = !(can && t.statusCode === 'NEW');
    menu.querySelector('[data-task-act="return"]').hidden = !(can && t.statusCode === 'IN_PROGRESS');
    menu.querySelector('[data-task-act="done"]').hidden = !can;
    menu.querySelector('.menu__divider').hidden = !can;
  }

  function initAll() { document.querySelectorAll('.lc-tasks').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll); else initAll();

  window.LcTasksTile = { render: render, setState: setState, refresh: refresh, focus: focus, init: init };
})();

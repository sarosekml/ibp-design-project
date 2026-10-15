/* ============================================================
   HomeTasksTile.js — тайл «Задачи» из HomeStore.

   Тайл сам находит свои корни (.lc-tasks) на DOMContentLoaded и рисует
   список — живой и на странице, и в витрине. Загрузку ставит страница
   (state="loading" метки).

   API (window.LcTasksTile):
     render(root)            — список, «данных нет»
     setState(root, state)   — data-state; data|empty считает сам по данным
     refresh(root)           — обновление: updating → данные
     focus(root)             — прокрутить к тайлу
   Действия со строкой (меню строки) меняют статус в HomeStore и
   подтверждаются уведомлением DSSnack с отменой. В списке видны и
   выполненные задачи — статус читается по чипу (макет главной); меню шапки —
   один пункт-переключатель «Скрыть выполненные» (решение человека
   15.10.2026): выполненные убираются из списка, «Обновить» и «Новая задача»
   из меню ушли — окно создания открывает профиль.
   В выборке «задачи моего деска» строка показывает исполнителя:
   имя, первая его группа чипом, остальные — «+N» с тултипом-списком;
   в «моих задачах» исполнителя нет (макет 15.10.2026).
   Хуки рантаймов: data-segctrl (переключатель), data-menu (меню шапки
   и строки).
   ============================================================ */
(function () {
  'use strict';

  var LIMIT = 5;
  var PRIORITY_DOT = { HIGH: 'error', MEDIUM: 'warning', LOW: 'info' };
  var STATUS_TONE = { NEW: 'info', IN_PROGRESS: 'dpurple', DONE: 'success', NEEDS_CORRECTION: 'warning' };
  /* Пустой стейт — по выборке: свои задачи и задачи деска (макет главной 15.10.2026) */
  var EMPTY_TEXT = { MY: 'Нет назначенных задач', DESK: 'Нет задач деска' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function st(root) { return root.__lcTasks || (root.__lcTasks = { scope: 'MY', menuTask: null, hideDone: false }); }
  function editable(root) { return root.getAttribute('data-mode') !== 'view'; }

  /* Исполнитель в строке «задач моего деска»: имя, первая группа чипом,
     остальные свёрнуты в «+N» с тултипом-списком (tip--rich, снизу) —
     макет главной 15.10.2026. В «моих задачах» исполнителя нет. */
  function assigneeHTML(t, scope) {
    if (scope !== 'DESK') return '';
    var groups = t.assigneeGroups || [];
    var chip = groups[0]
      ? '<span class="chip chip--xs chip--rounded chip--outline chip--grey"><span class="chip__label">' + esc(groups[0]) + '</span></span>'
      : '';
    var rest = groups.slice(1);
    var more = '';
    if (rest.length) {
      var tipId = 'lc-tip-tg-' + String(t.taskId).replace(/[^a-zA-Z0-9_-]/g, '');
      more = '<span class="tip-anchor">' +
        '<span class="lc-tasks__more" data-tooltip-placement="bottom" data-tooltip-align="start" aria-describedby="' + tipId + '" aria-label="Ещё групп: ' + rest.length + '">+' + rest.length + '</span>' +
        '<span class="tip tip--main tip--bottom tip--start tip--floating tip--rich" role="tooltip" id="' + tipId + '">' +
          rest.map(function (g) { return '<span class="tip__text">' + esc(g) + '</span>'; }).join('') +
          '<span class="tip__arrow"></span>' +
        '</span>' +
      '</span>';
    }
    return '<div class="lc-tasks__assignee">' +
      '<span>' + esc(t.assigneeName) + '</span>' + chip + more +
    '</div>';
  }

  function rowHTML(t, S, scope) {
    var pl = window.TASK_PRIORITY_LABELS || {};
    var sl = window.TASK_STATUS_LABELS || {};
    var links = [];
    if (t.dealNumber) links.push('<span class="lc-tasks__link"><i data-icon="link" aria-hidden="true"></i>Сделка ' + esc(t.dealNumber) + '</span>');
    if (t.clientName) links.push('<span class="lc-tasks__link"><i data-icon="bank" aria-hidden="true"></i>' + esc(t.clientName) + '</span>');
    var linksHTML = links.length
      ? '<div class="entity__subs entity__subs--single"><span class="entity__subs-list lc-tasks__links">' + links.join('') + '</span></div>'
      : '';
    return '<div class="entity lc-tasks__row" data-task-id="' + esc(t.taskId) + '">' +
      '<div class="entity__main">' +
        '<div class="entity__titles">' +
          '<p class="entity__header"><span class="badge badge--dot badge--' + PRIORITY_DOT[t.priorityCode] + '" aria-hidden="true"></span><span class="lc-tasks__priority">' + esc(pl[t.priorityCode] || '') + '</span>' +
            '<span class="lc-tasks__meta-sep" aria-hidden="true">·</span>' +
            '<span class="lc-tasks__meta-date"><i data-icon="calendar" aria-hidden="true"></i>' + esc(S.fmt.date(t.dueDate)) + '</span></p>' +
          '<div class="entity__labelrow"><span class="entity__label entity__label--truncate" data-tooltip="' + esc(t.title) + '" data-tooltip-truncated="only">' + esc(t.title) + '</span></div>' +
        '</div>' +
        assigneeHTML(t, scope) +
        '<div class="entity__chips"><span class="chip chip--xs chip--rounded chip--' + STATUS_TONE[t.statusCode] + '"><span class="chip__label">' + esc(sl[t.statusCode] || t.statusCode) + '</span></span></div>' +
        linksHTML +
      '</div>' +
      '<div class="entity__actions">' +
        '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Действия с задачей" aria-haspopup="menu" data-menu="lc-tasks-row-menu" data-menu-align="end"><i data-icon="more-dots"></i></button>' +
      '</div>' +
    '</div>';
  }

  function setState(root, state) {
    var S = window.HomeStore;
    if (state === 'data' || state === 'empty') state = S && S.tasks(st(root).scope).length ? 'data' : 'empty';
    root.setAttribute('data-state', state);
  }

  function render(root) {
    var S = window.HomeStore;
    if (!S) return;
    var s = st(root);
    var list = root.querySelector('.lc-tasks__list');
    if (window.DSTooltip) window.DSTooltip.hideAll();
    var all = S.tasks(s.scope);
    var shown = s.hideDone ? all.filter(function (t) { return t.statusCode !== 'DONE'; }) : all;
    list.innerHTML = shown.slice(0, LIMIT).map(function (t) { return rowHTML(t, S, s.scope); }).join('');
    root.querySelector('.lc-tasks__empty-text').textContent = EMPTY_TEXT[s.scope];
    /* «Скрыть выполненные» убрало всё: строка причины объясняет пустой список */
    var none = root.querySelector('.lc-tasks__none');
    if (none) none.hidden = !s.hideDone || shown.length > 0;

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

  function focus(root) {
    update(root);
    root.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* Смена статуса с подтверждением и отменой */
  function changeStatus(root, taskId, code) {
    var S = window.HomeStore;
    var task = S.tasks('DESK').filter(function (t) { return t.taskId === taskId; })[0];
    if (!task) return;
    var prev = S.setTaskStatus(taskId, code);
    var title = code === 'IN_PROGRESS' ? 'Задача взята в работу' : code === 'DONE' ? 'Задача выполнена' : 'Задача возвращена в ожидание исполнения';
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
        if (scope !== s.scope) { s.scope = scope; update(root); }
      }, 0);
    }
    seg.addEventListener('click', syncScope);
    seg.addEventListener('keydown', syncScope);

    root.addEventListener('click', function (e) {
      var row = e.target.closest('.lc-tasks__row');
      /* Триггеры меню — состояние пунктов ставим до открытия (Л88) */
      if (e.target.closest('[data-menu="lc-tasks-menu"]')) { syncMenu(root); return; }
      if (row && e.target.closest('[data-menu="lc-tasks-row-menu"]')) { s.menuTask = row.getAttribute('data-task-id'); syncRowMenu(root); return; }
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

    /* Пункт «Скрыть выполненные»: меню живёт в плавающем слое, вне корня
       тайла, а рантайм ContextMenu обрабатывает клики раньше bubble-слушателей
       на самом меню — слушаем на документе в захвате (Л88). */
    var menuNode = document.getElementById('lc-tasks-menu');
    document.addEventListener('click', function (e) {
      if (!e.target.closest) return;
      var item = e.target.closest('[data-tasks-act="hide-done"]');
      if (!item || item.closest('.menu') !== menuNode) return;
      s.hideDone = !s.hideDone;
      item.setAttribute('aria-checked', String(s.hideDone));
      var cur = root.getAttribute('data-state');
      if (cur === 'data' || cur === 'empty') setState(root, 'data');
      render(root);
    }, true);

    if (window.HomeStore) window.HomeStore.on(function (ev) {
      if (ev.kind === 'tasks') update(root);
      if (ev.kind === 'focus' && ev.detail.widget === 'tasks') focus(root);
    });
    render(root);
  }

  /* Пункт-переключатель меню шапки — галочка по состоянию на момент открытия */
  function syncMenu(root) {
    var item = document.querySelector('#lc-tasks-menu [data-tasks-act="hide-done"]');
    if (item) item.setAttribute('aria-checked', String(st(root).hideDone));
  }

  /* Пункты меню строки — по задаче, чьё меню открыто: правка статуса — только
     своей задаче и только в режиме правки; невозможный пункт скрывается. */
  function syncRowMenu(root) {
    var menu = document.getElementById('lc-tasks-row-menu');
    var S = window.HomeStore;
    if (!menu || !S) return;
    var t = S.tasks('DESK').filter(function (x) { return x.taskId === st(root).menuTask; })[0];
    var can = !!t && t.isMine && editable(root) && t.statusCode !== 'DONE' && t.statusCode !== 'NEEDS_CORRECTION';
    menu.querySelector('[data-task-act="take"]').hidden = !(can && t.statusCode === 'NEW');
    menu.querySelector('[data-task-act="return"]').hidden = !(can && t.statusCode === 'IN_PROGRESS');
    menu.querySelector('[data-task-act="done"]').hidden = !can;
    menu.querySelector('.menu__divider').hidden = !can;
  }

  function initAll() { document.querySelectorAll('.lc-tasks').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll); else initAll();

  window.LcTasksTile = { render: render, setState: setState, refresh: refresh, focus: focus, init: init };
})();

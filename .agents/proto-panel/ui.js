/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — интерфейс (ui.js).

   Что здесь: горячие клавиши (и их приём из фрейма превью), шторка —
   Drawer ДС с ручкой ширины, зона Alert, реестр табов, мини-плеер,
   кнопка панели по настройке, окно настроек, подтверждение удаления,
   живая область для озвучивания хода сценария.

   Вся разметка — компоненты ДС; своё (ручка ширины, плеер, кнопка, липкий
   ряд табов, узлы схемы, карточки) — классы pp-* на токенах, panel.css.
   Слой, фокус, Esc и клик мимо — рантайм ДС (ds-modal.js), своей копии нет.
   Атрибуты, которые ловят обработчики страниц (data-act и т. п.), панель
   не использует: только id pp-* и атрибуты data-pp-*.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  var core = window.ProtoPanelCore;
  var ctx = window.__PROTO_PANEL || {};
  if (!PP || !PP._store || !PP._runner || !core) return;

  var store = PP._store, runner = PP._runner, bus = PP._bus;
  var LOG = '[панель прототипа]';
  var TOOL = 'node .agents/tools/proto-panel.mjs';
  var ICON = { info: 'Info-circle-filled', warning: 'alert-triangle-filled', error: 'alert-circle-filled', success: 'check-circle-filled' };
  var HK = core.HOTKEYS.label;

  var mounted = false;
  var tabs = [], activeId = null, tabsApi = null;
  var el = {};

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  /** Оживить вставленную разметку рантаймами ДС. */
  function wire(root) {
    if (!root) return;
    try {
      if (window.dsIcons) window.dsIcons.apply(root);
      if (window.DSTooltip) window.DSTooltip.bindAll(root);
      if (window.DSMenu) window.DSMenu.bindAll(root);
      if (window.DSModal) window.DSModal.bindAll(root);
      if (window.DSDrawer) window.DSDrawer.bindAll(root);
      if (window.DSInput) window.DSInput.bindAll(root);
      if (window.DSChip && window.DSChip.refresh) window.DSChip.refresh(root);
    } catch (e) { console.warn(LOG, e); }
  }

  /* Закрыть свои плавающие слои (тултип, меню, список) перед перерисовкой.
     Только свои: closeAll() и hideAll() ДС глобальные и закрыли бы меню
     страницы, которое сценарий только что открыл. */
  var OWN = '.pp-root, #pp-drawer, .pp-modal';
  function own(n) { return !!(n && n.closest && n.closest(OWN)); }
  function hideFloating() {
    try {
      var t = window.DSTooltip && window.DSTooltip.current();
      if (t && own(t.target)) t.hide(true);
      var m = window.DSMenu && window.DSMenu.current();
      if (m && own(m.trigger)) m.close();
      var d = window.DSDropdownList && window.DSDropdownList.current();
      if (d && own(d.field)) d.close();
    } catch (e) { /* ДС без этих рантаймов */ }
  }

  /* ---------------- уведомления ---------------- */

  function toast(message, tone) {
    if (window.DSToast) window.DSToast.show({ message: message, kind: 'bar', tone: tone || 'neutral', duration: 3000 });
  }
  function snack(o) { if (window.DSSnack) return window.DSSnack.show(o); return null; }

  function announce(text) {
    if (!el.live) return;
    el.live.textContent = '';
    setTimeout(function () { el.live.textContent = text; }, 30);
  }

  /* ---------------- разметка ---------------- */

  function appTitle() { var d = store.data(); return d && d.app && d.app.title ? d.app.title : ''; }
  function appId() { var d = store.data(); return d && d.app && d.app.id ? d.app.id : String(ctx.app || '').split('/').pop(); }

  function buildRoot() {
    var root = document.createElement('div');
    root.className = 'pp-root';
    root.id = 'pp-root';
    root.innerHTML =
      '<div class="pp-player" id="pp-player" role="group" aria-label="Сценарий показа" hidden></div>'
      + '<button type="button" class="pp-fab" id="pp-fab" aria-label="Панель прототипа" data-drawer="pp-drawer" hidden>'
      + '<i data-icon="settings"></i><span class="pp-fab__badge" hidden></span></button>';
    var live = document.createElement('div');
    live.className = 'pp-hidden';
    live.id = 'pp-live';
    live.setAttribute('aria-live', 'polite');
    return [root, live];
  }

  function buildDrawer() {
    var s = document.createElement('div');
    s.className = 'modal-scrim drawer-scrim';
    s.id = 'pp-drawer';
    s.hidden = true;
    s.innerHTML =
      '<aside class="drawer drawer--w4 pp-drawer" role="dialog" aria-modal="true" aria-labelledby="pp-drawer-title">'
      + '<div class="pp-grip" role="separator" aria-orientation="vertical" aria-label="Ширина панели" tabindex="0"></div>'
      + '<header class="drawer__head">'
      + '<div class="drawer__headmain">'
      + '<p class="drawer__path">Панель прототипа<i data-icon="chevron-right"></i>' + esc(appTitle() || appId()) + '</p>'
      + '<h2 class="drawer__title" id="pp-drawer-title">' + esc(appId()) + '</h2>'
      + '</div>'
      + '<div class="drawer__acts">'
      + '<span class="menu-anchor"><button type="button" class="ibtn ibtn--neutral ibtn--m" aria-label="Действия панели" data-menu="pp-head-menu" data-menu-align="end" data-tooltip="Действия панели"><i data-icon="more-dots"></i></button>'
      + '<div id="pp-head-menu" class="menu" role="menu" hidden></div></span>'
      + '<span class="drawer__close"><button type="button" class="ibtn ibtn--neutral ibtn--m" aria-label="Закрыть панель" data-modal-close data-tooltip="Закрыть · Esc"><i data-icon="close"></i></button></span>'
      + '</div>'
      + '</header>'
      + '<div class="drawer__body drawer__body--flush pp-body" id="pp-body">'
      + '<div class="pp-tabs"><div class="tabs tabs--horiz" role="tablist" aria-label="Разделы панели" id="pp-tabs" data-tabs></div></div>'
      + '<div class="drawer__alert" id="pp-alert" hidden></div>'
      + '<div class="pp-panes" id="pp-panes"></div>'
      + '</div>'
      + '</aside>';
    return s;
  }

  function sw(pref, label, helper) {
    return '<label class="sw">'
      + '<input type="checkbox" class="sw__input" role="switch" aria-checked="false" data-pp-pref="' + pref + '">'
      + '<span class="sw__control"><span class="sw__thumb"></span></span>'
      + '<span class="sw__content"><span class="sw__label">' + esc(label) + '</span>'
      + (helper ? '<span class="ds-helper ds-helper--left">' + esc(helper) + '</span>' : '')
      + '</span></label>';
  }
  function rof(label, value) {
    return '<div class="rof"><span class="ds-label"><span class="ds-label__text">' + esc(label) + '</span></span>'
      + '<div class="rof__row"><span class="rof__value">' + esc(value) + '</span></div></div>';
  }

  function buildSettings() {
    var s = document.createElement('div');
    s.className = 'modal-scrim modal-scrim--nested pp-modal';
    s.id = 'pp-settings';
    s.hidden = true;
    s.innerHTML =
      '<div class="modal modal--w4" role="dialog" aria-modal="true" aria-labelledby="pp-settings-title">'
      + '<header class="modal__head"><h2 class="modal__title" id="pp-settings-title">Настройки панели</h2>'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--l" aria-label="Закрыть" data-modal-close><i data-icon="close"></i></button></header>'
      + '<div class="modal__body">'
      + '<div class="inp inp--m inp--fullwidth"><label class="ds-label" for="pp-author"><span class="ds-label__text">Автор комментариев</span></label>'
      + '<div class="inp__field"><input class="inp__control" id="pp-author" autocomplete="off" placeholder="Как подписывать комментарии" aria-describedby="pp-author-h"></div>'
      + '<span class="ds-helper ds-helper--left" id="pp-author-h">Пусто — строки «Автор» в файле нет</span></div>'
      + sw('showFab', 'Показывать кнопку панели', 'Справа внизу на каждой странице прототипа; без неё панель открывается ' + HK.toggle)
      + sw('showPlayer', 'Показывать мини-плеер во время сценария', 'Без плеера шаги листаются ' + HK.next + ' / ' + HK.prev)
      + sw('closeOnGo', 'Закрывать панель при переходе к шагу')
      + sw('showActions', 'Показывать действия при переходе к шагу', 'Подсветка цели и пауза перед каждым действием последнего шага')
      + '<p class="ds-body-s-strong pp-subtitle">Горячие клавиши</p>'
      + '<div class="pp-keys">'
      + rof(HK.toggle, 'Открыть или закрыть панель')
      + rof(HK.next + ' / ' + HK.prev, 'Следующий / предыдущий шаг сценария')
      + rof('Esc', 'Закрыть шторку')
      + '</div>'
      + '</div>'
      + '<footer class="modal__foot"><div class="modal__foot-right"><button type="button" class="btn btn--accent btn--m" data-modal-close><span class="btn__label">Готово</span></button></div></footer>'
      + '</div>';
    return s;
  }

  function buildConfirm() {
    var s = document.createElement('div');
    s.className = 'modal-scrim modal-scrim--nested pp-modal';
    s.id = 'pp-confirm';
    s.hidden = true;
    s.innerHTML =
      '<div class="modal modal--w3" role="alertdialog" aria-modal="true" aria-labelledby="pp-confirm-title" aria-describedby="pp-confirm-text">'
      + '<header class="modal__head"><h2 class="modal__title" id="pp-confirm-title"></h2>'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--l" aria-label="Закрыть" data-modal-close><i data-icon="close"></i></button></header>'
      + '<div class="modal__body"><p class="ds-body-m" id="pp-confirm-text"></p></div>'
      + '<footer class="modal__foot"><div class="modal__foot-right">'
      + '<button type="button" class="btn btn--transparent btn--m" data-modal-close data-pp-confirm-cancel><span class="btn__label">Отмена</span></button>'
      + '<button type="button" class="btn btn--accent btn--m btn--danger" data-pp-confirm-ok><span class="btn__label">Удалить</span></button>'
      + '</div></footer>'
      + '</div>';
    return s;
  }

  /* ---------------- шторка ---------------- */

  function layer() { return el.drawer && el.drawer.__dsModal; }
  function isOpen() { var l = layer(); return !!(l && l.isOpen()); }

  function onOpened() {
    el.drawer.querySelectorAll('[autofocus]').forEach(function (n) { n.removeAttribute('autofocus'); });
    applyWidth(store.prefs().drawerWidth);
    renderActive();
    renderHeadMenu();
    updateAlert();
    bus.emit('open');
  }
  function onClosed() {
    hideFloating();
    bus.emit('close');
  }

  function open(tabId) {
    if (!mounted || runner.busy()) return;
    if (tabId) selectTab(tabId);
    if (isOpen()) { renderActive(); updateAlert(); return; }
    var nested = !!(window.DSModal && window.DSModal.stack().length);
    el.drawer.classList.toggle('modal-scrim--nested', nested);
    /* фокус при открытии — на выбранном табе: ряд табов первый в теле */
    el.drawer.querySelectorAll('[autofocus]').forEach(function (n) { n.removeAttribute('autofocus'); });
    var t = el.drawer.querySelector('.tab[aria-selected="true"]');
    if (t) t.setAttribute('autofocus', '');
    if (!window.DSDrawer) { console.warn(LOG, 'рантайм Drawer ДС не загружен'); return; }
    window.DSDrawer.open(el.drawer, { returnFocus: document.activeElement, nested: nested, onOpen: onOpened, onClose: onClosed });
  }
  function close() { var l = layer(); if (l && l.isOpen()) l.close(); }
  function toggle() { if (isOpen()) close(); else open(); }

  /* Прежде чем действия сценария пойдут в страницу: свои слои закрыты, фон не inert. */
  function releasePage() {
    return new Promise(function (resolve) {
      var t0 = Date.now();
      hideFloating();
      function ours(l) { return l && l.scrim && /^pp-/.test(l.scrim.id || ''); }
      (function step() {
        var stack = window.DSModal ? window.DSModal.stack() : [];
        var top = stack[stack.length - 1];
        if (ours(top)) top.close();
        var left = window.DSModal ? window.DSModal.stack().some(ours) : false;
        if (left && Date.now() - t0 < 2000) { store.frames(1).then(step); return; }
        store.frames(2).then(resolve);
      })();
    });
  }

  /* ---------------- ширина шторки ---------------- */

  function tokenPx(name) {
    var v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    if (!isNaN(v)) return v;
    var probe = document.createElement('div');
    probe.className = 'pp-hidden';
    probe.style.width = 'var(' + name + ')';
    document.body.appendChild(probe);
    var w = probe.getBoundingClientRect().width;
    probe.remove();
    return w;
  }
  function limits() {
    var min = tokenPx('--modal-w-3');
    return { min: min, max: Math.max(min, window.innerWidth - tokenPx('--modal-w-2')), base: tokenPx('--modal-w-4') };
  }
  function narrow() { return !el.grip || getComputedStyle(el.grip).display === 'none'; }
  function panel() { return el.drawer && el.drawer.querySelector('.drawer'); }

  function applyWidth(w) {
    var d = panel();
    if (!d) return;
    if (narrow()) { d.style.width = ''; return; }
    var L = limits();
    var want = w == null ? L.base : w;
    var c = Math.round(Math.min(L.max, Math.max(L.min, want)));
    d.style.width = w == null && c === Math.round(L.base) ? '' : c + 'px';
    el.grip.setAttribute('aria-valuemin', String(Math.round(L.min)));
    el.grip.setAttribute('aria-valuemax', String(Math.round(L.max)));
    el.grip.setAttribute('aria-valuenow', String(c));
  }
  function currentWidth() { var d = panel(); return d ? Math.round(d.getBoundingClientRect().width) : null; }

  function wireGrip() {
    var g = el.grip;
    var STEP = tokenPx('--space-32') || 32;
    g.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || narrow()) return;
      e.preventDefault();
      /* правый край — у затемнения: сама шторка в первые 200 мс ещё сдвинута анимацией выезда */
      var right = el.drawer.getBoundingClientRect().right;
      var moved = false;
      try { g.setPointerCapture(e.pointerId); } catch (err) { /* указатель уже отпущен */ }
      el.drawer.classList.add('pp-resizing');
      function move(ev) { moved = true; applyWidth(right - ev.clientX); }
      function up() {
        g.removeEventListener('pointermove', move);
        g.removeEventListener('pointerup', up);
        g.removeEventListener('pointercancel', up);
        try { g.releasePointerCapture(e.pointerId); } catch (err) { /* уже снят */ }
        el.drawer.classList.remove('pp-resizing');
        if (moved) store.setPref('drawerWidth', currentWidth());
        /* Клик, которым закончилось перетаскивание, гасится: отпущенная над
           затемнением ручка иначе закрыла бы шторку кликом мимо. */
        var kill = function (ce) { ce.stopPropagation(); ce.preventDefault(); };
        window.addEventListener('click', kill, true);
        setTimeout(function () { window.removeEventListener('click', kill, true); }, 0);
      }
      g.addEventListener('pointermove', move);
      g.addEventListener('pointerup', up);
      g.addEventListener('pointercancel', up);
    });
    g.addEventListener('dblclick', function () {
      store.setPref('drawerWidth', null);
      applyWidth(null);
    });
    g.addEventListener('keydown', function (e) {
      var w = currentWidth(), L = limits(), nw = null;
      if (e.key === 'ArrowLeft') nw = w + STEP;
      else if (e.key === 'ArrowRight') nw = w - STEP;
      else if (e.key === 'Home') nw = L.min;
      else if (e.key === 'End') nw = L.max;
      else if (e.key === 'Enter' || e.key === ' ') { store.setPref('drawerWidth', null); applyWidth(null); e.preventDefault(); return; }
      if (nw === null) return;
      e.preventDefault();
      applyWidth(nw);
      store.setPref('drawerWidth', currentWidth());
    });
    window.addEventListener('resize', function () { if (isOpen()) applyWidth(store.prefs().drawerWidth); });
  }

  /* ---------------- действия шапки и Alert ---------------- */

  function item(cmd, icon, label, disabled) {
    return '<button type="button" class="menu__item" role="menuitem" data-pp-cmd="' + cmd + '"' + (disabled ? ' aria-disabled="true"' : '') + '>'
      + (icon ? '<span class="menu__item-icon"><i data-icon="' + icon + '"></i></span>' : '')
      + '<span class="menu__item-label">' + esc(label) + '</span></button>';
  }
  function renderHeadMenu() {
    var m = document.getElementById('pp-head-menu');
    if (!m) return;
    var s = store.status();
    var html = '';
    if (s === 'linked') html += item('unlink', 'folder-close-x', 'Отключить папку') + item('refresh', 'refresh', 'Перечитать с диска');
    else if (s === 'needs-permission') html += item('permit', 'folder-check', 'Разрешить доступ к папке') + item('unlink', 'folder-close-x', 'Отключить папку');
    else html += item('link', 'folder', 'Подключить папку проекта…', s === 'unsupported');
    html += '<hr class="menu__divider">' + item('settings', 'settings', 'Настройки…');
    m.innerHTML = html;
    wire(m);
  }

  function alertState() {
    var d = store.data();
    var s = store.status(), st = store.state;
    if (!d) return { key: 'nodata', tone: 'error', title: 'Нет данных панели', text: 'Зеркало ' + (ctx.dir || 'proto-panel') + '/panel-data.js не загрузилось — пересоберите: ' + TOOL };
    var drafts = store.drafts().length;
    if (st.error) {
      var retry = s === 'linked' && drafts;
      /* разрешение не выдано (окно закрыли) — кнопка здесь же, а не только в меню шторки */
      var ask = s === 'needs-permission';
      return { key: 'error', tone: 'error', title: 'Не удалось сохранить на диск', text: st.error + (retry || (ask && drafts) ? ' Комментарий остался черновиком в этом браузере.' : ''), close: true,
        buttons: retry ? [{ label: 'Повторить запись', cmd: 'retry' }] : ask ? [{ label: 'Разрешить доступ', cmd: 'permit' }] : [] };
    }
    if (st.mirrorError) return { key: 'mirror', tone: 'warning', title: 'Зеркало панели не обновлено', text: st.mirrorError, close: true };
    var local = s === 'mirror' || s === 'unsupported';
    /* Черновики только в памяти: хранилище закрыто со старта или отказало на ходу.
       Предупреждение — и до первого черновика, пока комментарии идут в черновики
       (ревью 0005, R10). */
    if (store.draftsVolatile() && (drafts || (local && activeId === 'comments'))) {
      return { key: 'volatile', tone: 'warning', title: 'Черновики живут только до перезагрузки',
        text: 'Хранилище браузера ' + (store.local.usable ? 'отказало (переполнено или запрещено)' : 'недоступно') + ' — черновики не переживут перезагрузку страницы. '
          + (s === 'mirror' ? 'Подключите папку проекта или скачайте comments.md.' : s === 'needs-permission' ? 'Разрешите доступ к папке проекта или скачайте comments.md.' : 'Скачайте comments.md.'),
        buttons: [s === 'mirror' ? { label: 'Подключить папку проекта', cmd: 'link' } : s === 'needs-permission' ? { label: 'Разрешить доступ', cmd: 'permit' } : null,
          { label: 'Скачать comments.md', cmd: 'download' }].filter(Boolean) };
    }
    if (s === 'needs-permission') return { key: 'perm', tone: 'warning', title: 'Нужно разрешение на папку проекта', text: 'Браузер спрашивает его заново в новой сессии — одна кнопка.', buttons: [{ label: 'Разрешить доступ', cmd: 'permit' }] };
    if (st.note === 'updated') return { key: 'note', tone: 'success', title: 'Данные панели обновлены с диска', text: 'flows.yaml или comments.md правили после сборки: панель перечитала их и пересобрала зеркало.', close: true };
    if (local && (activeId === 'comments' || drafts)) {
      var can = s === 'mirror';
      return { key: 'local', tone: 'info', title: 'Комментарии сохраняются только в этом браузере',
        text: can ? 'Чтобы они легли рядом с прототипом, подключите корневую папку проекта (там, где ' + (ctx.base || 'apps') + '/ и project.json) — один раз для всех прототипов.'
          : 'Этот браузер не умеет писать в папку: скачайте comments.md и положите его в папку прототипа или отдайте агенту.',
        buttons: [can ? { label: 'Подключить папку проекта', cmd: 'link' } : null, { label: 'Скачать comments.md', cmd: 'download' }].filter(Boolean),
        link: { label: 'Скопировать текст', cmd: 'copy' } };
    }
    return null;
  }

  function updateAlert() {
    var zone = document.getElementById('pp-alert');
    if (!zone) return;
    var a = alertState();
    if (!a) { zone.hidden = true; zone.innerHTML = ''; return; }
    var role = a.tone === 'error' || a.tone === 'warning' ? 'role="alert" aria-live="assertive"' : 'role="status" aria-live="polite"';
    var btns = (a.buttons || []).map(function (b, i) {
      return '<button type="button" class="btn btn--' + (i === 0 ? 'outline' : 'transparent') + ' btn--xs btn--' + a.tone + '" data-pp-cmd="' + b.cmd + '"><span class="btn__label">' + esc(b.label) + '</span></button>';
    }).join('') + (a.link ? '<a class="link link--' + a.tone + ' link--s" href="#" role="button" data-pp-cmd="' + a.link.cmd + '">' + esc(a.link.label) + '</a>' : '');
    zone.innerHTML = '<div class="alert alert--' + a.tone + ' alert--m alert--flush" ' + role + ' data-pp-alert="' + a.key + '">'
      + '<span class="alert__icon" aria-hidden="true"><i data-icon="' + ICON[a.tone] + '"></i></span>'
      + '<div class="alert__body"><p class="alert__title">' + esc(a.title) + '</p><p class="alert__text">' + esc(a.text) + '</p>'
      + (btns ? '<div class="alert__buttons">' + btns + '</div>' : '') + '</div>'
      + (a.close ? '<div class="alert__actions"><button type="button" class="alert__act alert__close" aria-label="Закрыть" data-pp-cmd="dismiss-' + a.key + '"><i data-icon="close"></i></button></div>' : '')
      + '</div>';
    zone.hidden = false;
    wire(zone);
  }

  function linkFolder() {
    toast('Выберите корневую папку проекта (там, где ' + (ctx.base || 'apps') + '/ и project.json) — один раз для всех прототипов', 'info');
    return store.link().then(function (r) {
      toast('Папка проекта подключена' + (r && r.drafts ? ' · черновики сохранены: ' + r.drafts : ''), 'success');
    }, failed('Папка не подключена'));
  }
  function failed(title) {
    return function (e) {
      if (e && e.name === 'AbortError') return;
      snack({ tone: 'error', title: title, text: e && e.message || String(e) });
    };
  }

  function command(cmd) {
    if (cmd === 'link') return linkFolder();
    if (cmd === 'permit') return store.permit().then(function (r) { toast('Доступ к папке разрешён' + (r && r.drafts ? ' · черновики сохранены: ' + r.drafts : ''), 'success'); }, failed('Доступ не получен'));
    if (cmd === 'unlink') return store.unlink().then(function () { toast('Папка отключена: комментарии снова сохраняются только в браузере', 'neutral'); });
    if (cmd === 'refresh') return store.refresh().then(function (changed) { toast(changed ? 'Данные панели обновлены с диска' : 'На диске то же, что в панели', changed ? 'success' : 'neutral'); }, failed('Не удалось перечитать'));
    if (cmd === 'retry') return store.flushDrafts().then(function (n) { if (!n) toast('Черновиков для записи нет', 'neutral'); }, failed('Запись не удалась'));
    if (cmd === 'settings') return openSettings();
    if (cmd === 'download') { store.download(); return null; }
    if (cmd === 'copy') return store.copyText(store.exportText()).then(function () { toast('Текст comments.md скопирован', 'success'); }, failed('Не скопировано'));
    if (cmd === 'dismiss-error') { store.state.error = null; updateAlert(); return null; }
    if (cmd === 'dismiss-note') { store.state.note = null; updateAlert(); return null; }
    if (cmd === 'dismiss-mirror') { store.state.mirrorError = null; updateAlert(); return null; }
    return null;
  }

  /* ---------------- табы ---------------- */

  /** Регистрация таба: { id, title, icon?, badge?() → число|null, render(pane, ctx), onShow?() }. */
  function tab(def) {
    if (!def || !def.id || typeof def.render !== 'function') throw new Error('ProtoPanel.tab: нужны id и render(pane, ctx)');
    if (!/^[a-z0-9-]+$/.test(def.id)) throw new Error('ProtoPanel.tab: id — латиница в нижнем регистре, цифры и дефис');
    if (tabs.some(function (t) { return t.id === def.id; })) throw new Error('ProtoPanel.tab: таб «' + def.id + '» уже есть');
    tabs.push({ id: def.id, title: def.title || def.id, icon: def.icon || null, badge: def.badge || null, render: def.render, onShow: def.onShow || null });
    if (mounted) buildTabs();
    return { id: def.id, refresh: function () { refresh(def.id); }, select: function () { open(def.id); } };
  }

  function paneOf(id) { return document.getElementById('pp-pane-' + id); }
  function defOf(id) { return tabs.filter(function (t) { return t.id === id; })[0] || null; }

  function buildTabs() {
    var row = document.getElementById('pp-tabs');
    var panes = document.getElementById('pp-panes');
    if (!row || !panes) return;
    var saved = store.ui().tab;
    var sel = activeId || saved;
    if (!defOf(sel)) sel = tabs[0] ? tabs[0].id : null;
    var fresh = document.createElement('div');
    fresh.className = 'tabs tabs--horiz';
    fresh.id = 'pp-tabs';
    fresh.setAttribute('role', 'tablist');
    fresh.setAttribute('aria-label', 'Разделы панели');
    fresh.setAttribute('data-tabs', '');
    fresh.innerHTML = tabs.map(function (t) {
      var on = t.id === sel;
      return '<button type="button" class="tab tab--m' + (on ? ' tab--selected' : '') + '" role="tab" id="pp-tab-' + t.id + '" aria-controls="pp-pane-' + t.id + '"'
        + ' aria-selected="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-pp-tab="' + t.id + '">'
        + (t.icon ? '<span class="tab__icon"><i data-icon="' + esc(t.icon) + '"></i></span>' : '')
        + '<span class="tab__label">' + esc(t.title) + '</span><span class="tab__badge" hidden></span></button>';
    }).join('');
    row.replaceWith(fresh);
    tabs.forEach(function (t) {
      if (paneOf(t.id)) return;
      var p = document.createElement('div');
      p.className = 'pp-pane';
      p.id = 'pp-pane-' + t.id;
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', 'pp-tab-' + t.id);
      p.hidden = true;
      panes.appendChild(p);
    });
    if (window.DSTabs) tabsApi = window.DSTabs.tabs(fresh, { onChange: function (i, b) { show(b.getAttribute('data-pp-tab')); } });
    wire(fresh);
    activeId = null;
    show(sel);
    badges();
  }

  function show(id) {
    if (!id || id === activeId) return;
    activeId = id;
    store.setUi({ tab: id });
    tabs.forEach(function (t) { var p = paneOf(t.id); if (p) p.hidden = t.id !== id; });
    if (isOpen()) renderActive();
    updateAlert();
    var d = defOf(id);
    if (d && d.onShow) { try { d.onShow(); } catch (e) { console.warn(LOG, e); } }
  }

  function selectTab(id) {
    if (!defOf(id)) return;
    var b = document.getElementById('pp-tab-' + id);
    if (tabsApi && b && b.getAttribute('aria-selected') !== 'true') tabsApi.select(b);
    else show(id);
  }

  var tabCtx = { esc: esc, wire: wire, toast: toast, snack: snack, confirm: confirm, open: open, close: close, announce: announce, hideFloating: hideFloating };

  function renderActive() {
    var d = defOf(activeId);
    var p = paneOf(activeId);
    if (!d || !p) return;
    try { d.render(p, tabCtx); } catch (e) { console.warn(LOG, 'таб «' + d.id + '» не отрисовался:', e); }
  }
  function refresh(id) {
    badges();
    if (!id || id === activeId) { if (isOpen()) renderActive(); }
  }

  function badges() {
    tabs.forEach(function (t) {
      var b = document.querySelector('#pp-tab-' + t.id + ' .tab__badge');
      if (!b || !t.badge) return;
      var n = null;
      try { n = t.badge(); } catch (e) { n = null; }
      b.hidden = !n;
      b.textContent = n ? String(n) : '';
    });
    renderFab();
  }

  /* ---------------- мини-плеер ---------------- */

  function renderPlayer() {
    var box = document.getElementById('pp-player');
    if (!box) return;
    var p = store.prefs();
    var c = runner.current(), b = runner.busy();
    var on = p.showPlayer && !!(c || b);
    if (!on) { if (!box.hidden) { hideFloating(); box.hidden = true; box.innerHTML = ''; } return; }
    var flow = runner.flowById(b ? b.flow : c.flow);
    if (!flow) { box.hidden = true; return; }
    var total = flow.steps.length;
    var lead = '', text = '', title = '', note = '';
    var canPrev = false, canNext = false;
    if (b) {
      lead = '<span class="spin spin--xs spin--accent" aria-hidden="true"></span>';
      text = 'Перехожу к шагу ' + (b.to + 1) + '…';
    } else if (c.error) {
      var ei = runner.stepIdx(flow, c.error.step);
      lead = '<span class="pp-player__warn" aria-hidden="true"><i data-icon="alert-triangle"></i></span>';
      text = 'Шаг ' + (ei + 1) + ' не воспроизведён';
      note = c.error.message;
      canPrev = ei > 0; canNext = true;
    } else {
      text = (c.index + 1) + ' / ' + total;
      title = flow.steps[c.index].title + (c.dirty ? ' · изменено' : '');
      note = flow.steps[c.index].note || '';
      canPrev = c.index > 0; canNext = c.index < total - 1;
    }
    hideFloating();
    box.innerHTML =
      '<button type="button" class="ibtn ibtn--neutral ibtn--m" data-pp-player="prev" aria-label="Предыдущий шаг"' + (canPrev ? ' data-tooltip="Предыдущий шаг · ' + HK.prev + '"' : ' disabled') + '><i data-icon="chevron-left"></i></button>'
      + '<button type="button" class="pp-player__label" data-pp-player="open"' + (note ? ' data-tooltip="' + esc(note) + '" data-tooltip-multiline="yes"' : '') + (b ? ' disabled' : '') + '>'
      + lead + '<span class="pp-player__num">' + esc(text) + '</span>' + (title ? '<span class="pp-player__title"> · ' + esc(title) + '</span>' : '') + '</button>'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m" data-pp-player="next" aria-label="Следующий шаг"' + (canNext ? ' data-tooltip="Следующий шаг · ' + HK.next + '"' : ' disabled') + '><i data-icon="chevron-right"></i></button>'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m" data-pp-player="stop" aria-label="Выйти из сценария" data-tooltip="Выйти из сценария"' + (b ? ' disabled' : '') + '><i data-icon="close"></i></button>';
    box.classList.toggle('pp-player--error', !!(c && c.error && !b));
    box.hidden = false;
    wire(box);
  }

  /* ---------------- кнопка панели ---------------- */

  function pageFile() { try { return decodeURIComponent(location.pathname.split('/').pop()); } catch (e) { return location.pathname.split('/').pop(); } }

  function renderFab() {
    var fab = el.fab;
    if (!fab) return;
    fab.hidden = !store.prefs().showFab;
    var badge = fab.querySelector('.pp-fab__badge');
    var d = store.data();
    if (!d) {
      badge.innerHTML = '<span class="badge badge--dot badge--error" aria-hidden="true"></span>';
      badge.hidden = false;
      return;
    }
    var here = pageFile();
    var n = store.comments().filter(function (c) { return c.status === 'open' && c.page && c.page.split(/[?#]/)[0] === here; }).length;
    badge.innerHTML = n ? '<span class="badge badge--xs badge--accent" aria-hidden="true">' + (n > 99 ? '99+' : n) + '</span>' : '';
    badge.hidden = !n;
    fab.setAttribute('aria-label', 'Панель прототипа' + (n ? ', открытых комментариев к странице: ' + n : ''));
  }

  /* ---------------- настройки ---------------- */

  function openSettings() {
    var s = el.settings;
    var p = store.prefs();
    s.querySelector('#pp-author').value = p.author || '';
    s.querySelectorAll('[data-pp-pref]').forEach(function (i) {
      var on = !!p[i.getAttribute('data-pp-pref')];
      i.checked = on;
      i.setAttribute('aria-checked', String(on));
    });
    if (window.DSInput) window.DSInput.syncAll(s);
    if (window.DSModal) window.DSModal.open(s, { nested: true, returnFocus: document.activeElement });
  }

  function wireSettings() {
    var s = el.settings;
    s.querySelector('#pp-author').addEventListener('input', function (e) { store.setPref('author', e.target.value.trim()); });
    s.addEventListener('change', function (e) {
      var i = e.target.closest('[data-pp-pref]');
      if (!i) return;
      i.setAttribute('aria-checked', String(i.checked));
      store.setPref(i.getAttribute('data-pp-pref'), i.checked);
    });
  }

  /* ---------------- подтверждение ---------------- */

  /** Вложенный диалог подтверждения удаления. Promise<boolean>. */
  function confirm(o) {
    var s = el.confirm;
    s.querySelector('#pp-confirm-title').textContent = o.title;
    s.querySelector('#pp-confirm-text').textContent = o.text || '';
    s.querySelector('[data-pp-confirm-ok] .btn__label').textContent = o.ok || 'Удалить';
    /* начальный фокус — «Отмена»: удаление не должно случиться от случайного Enter;
       autofocus ставится только на время открытия — в статичной разметке браузер
       пытался бы применить его при вставке и писал об этом в консоль */
    var cancel = s.querySelector('[data-pp-confirm-cancel]');
    cancel.setAttribute('autofocus', '');
    return new Promise(function (resolve) {
      var done = false;
      var ok = s.querySelector('[data-pp-confirm-ok]');
      function yes() { done = true; ok.removeEventListener('click', yes); var l = s.__dsModal; if (l) l.close(true); resolve(true); }
      ok.addEventListener('click', yes);
      window.DSModal.open(s, { nested: true, returnFocus: document.activeElement, onClose: function () {
        ok.removeEventListener('click', yes);
        cancel.removeAttribute('autofocus');
        if (!done) resolve(false);
      } });
    });
  }

  /* ---------------- горячие клавиши ---------------- */

  function hotkey(act) {
    if (runner.busy()) return;
    if (act === 'toggle') toggle();
    else if (act === 'next') runner.next();
    else if (act === 'prev') runner.prev();
  }

  function childFrame(src) {
    for (var i = 0; i < window.frames.length; i++) if (window.frames[i] === src) return true;
    return false;
  }

  function wireKeys() {
    document.addEventListener('keydown', function (e) {
      var act = core.hotkeyOf(e);
      if (!act) return;
      e.preventDefault();
      e.stopPropagation();
      if (!e.repeat) hotkey(act);
    }, true);
    window.addEventListener('message', function (e) {
      var m = e.data;
      if (!m || m.source !== 'proto-panel' || m.type !== 'key' || !childFrame(e.source)) return;
      var H = core.HOTKEYS;
      hotkey(m.code === H.toggle ? 'toggle' : m.code === H.next ? 'next' : m.code === H.prev ? 'prev' : null);
    });
  }

  /* ---------------- монтирование ---------------- */

  function mount() {
    if (mounted) return;
    mounted = true;
    var root = buildRoot();
    document.body.appendChild(root[0]);
    document.body.appendChild(root[1]);
    el.root = root[0];
    el.live = root[1];
    el.fab = document.getElementById('pp-fab');
    el.drawer = buildDrawer();
    document.body.appendChild(el.drawer);
    el.grip = el.drawer.querySelector('.pp-grip');
    el.settings = buildSettings();
    document.body.appendChild(el.settings);
    el.confirm = buildConfirm();
    document.body.appendChild(el.confirm);

    if (window.DSDrawer) window.DSDrawer.bind(el.fab, { onOpen: onOpened, onClose: onClosed });
    var tip = store.data() ? 'Панель прототипа · ' + HK.toggle : 'Нет данных панели: пересоберите ' + TOOL;
    el.fab.setAttribute('data-tooltip', tip);
    wire(el.root);
    wire(el.drawer);
    wire(el.settings);
    wire(el.confirm);
    wireGrip();
    wireSettings();
    wireKeys();

    /* команды шапки, Alert и меню — с задержкой: меню ДС сначала закрывается и возвращает фокус */
    document.addEventListener('click', function (e) {
      var c = e.target.closest && e.target.closest('[data-pp-cmd]');
      if (!c || c.getAttribute('aria-disabled') === 'true') return;
      if (!c.closest('#pp-drawer')) return;
      e.preventDefault();
      var cmd = c.getAttribute('data-pp-cmd');
      if (cmd === 'link' || cmd === 'permit' || cmd === 'download' || cmd === 'copy') command(cmd);   // жест пользователя — сразу
      else setTimeout(function () { command(cmd); }, 0);
    });
    el.root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pp-player]');
      if (!b || b.disabled) return;
      var a = b.getAttribute('data-pp-player');
      if (a === 'prev') runner.prev();
      else if (a === 'next') runner.next();
      else if (a === 'stop') runner.stop();
      else if (a === 'open') open('flows');
    });

    buildTabs();
    renderPlayer();
    renderFab();
    renderHeadMenu();

    bus.on('prefs', function () { renderPlayer(); renderFab(); });
    bus.on('state', function () { renderPlayer(); refresh('flows'); });
    bus.on('busy', function (b) { renderPlayer(); refresh('flows'); if (b) announce('Перехожу к шагу ' + (b.to + 1) + '…'); });
    bus.on('stop', function () { renderPlayer(); refresh(); announce('Сценарий остановлен'); });
    bus.on('step', function (s) { announce('Шаг ' + (s.index + 1) + ' из ' + s.total + ': ' + s.title); });
    bus.on('error', function (x) {
      renderPlayer();
      refresh('flows');
      announce(x.message);
      snack({ tone: 'error', title: 'Шаг не воспроизведён', text: x.message, buttons: [{ label: 'Открыть панель', onClick: function () { open('flows'); } }] });
    });
    bus.on('store', function () { renderHeadMenu(); updateAlert(); refresh(); });
    bus.on('data', function () { refresh(); updateAlert(); });
    bus.on('comments', function () { refresh(); updateAlert(); });
    bus.on('drafts-saved', function (n) { toast('Черновики сохранены: ' + n, 'success'); });
  }

  PP._ui = {
    mount: mount, open: open, close: close, toggle: toggle, isOpen: isOpen, tab: tab, refresh: refresh, selectTab: selectTab,
    releasePage: releasePage, toast: toast, snack: snack, confirm: confirm, announce: announce, esc: esc, wire: wire,
    activeTab: function () { return activeId; }, updateAlert: updateAlert
  };
  PP.tab = tab;
})();

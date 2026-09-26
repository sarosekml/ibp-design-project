/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — интерфейс (ui.js).

   Что здесь: горячие клавиши (и их приём из фрейма превью), шторка —
   Drawer ДС с ручкой ширины и кнопкой Fix State в шапке, зона Alert,
   реестр табов, мини-плеер, кнопка панели по настройке, окно настроек,
   подтверждение удаления, живая область для озвучивания хода сценария.

   Вся разметка — компоненты ДС; своё (ручка ширины, плеер, кнопка, липкий
   ряд табов, узлы схемы, карточки) — классы pp-* на токенах, panel.css.
   Слой, фокус, Esc и клик мимо — рантайм ДС (ds-modal.js), своей копии нет.
   Атрибуты, которые ловят обработчики страниц (data-act и т. п.), панель
   не использует: только id pp-* и атрибуты data-pp-*. Тексты — strings.js
   (интерфейс английский, задача 0005a).
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  var core = window.ProtoPanelCore;
  var ctx = window.__PROTO_PANEL || {};
  if (!PP || !PP._store || !PP._runner || !core) return;
  var t = PP._strings ? PP._strings.t : function (k) { return k; };

  var store = PP._store, runner = PP._runner, bus = PP._bus;
  var LOG = '[proto panel]';
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
      var tt = window.DSTooltip && window.DSTooltip.current();
      if (tt && own(tt.target)) tt.hide(true);
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
      '<div class="pp-player" id="pp-player" role="group" aria-label="' + esc(t('player.label')) + '" hidden></div>'
      + '<button type="button" class="pp-fab" id="pp-fab" aria-label="' + esc(t('panel.name')) + '" data-drawer="pp-drawer" hidden>'
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
      + '<div class="pp-grip" role="separator" aria-orientation="vertical" aria-label="' + esc(t('panel.width')) + '" tabindex="0"></div>'
      + '<header class="drawer__head">'
      + '<div class="drawer__headmain">'
      + '<p class="drawer__path">' + esc(t('panel.name')) + '<i data-icon="chevron-right"></i>' + esc(appTitle() || appId()) + '</p>'
      + '<h2 class="drawer__title" id="pp-drawer-title">' + esc(appId()) + '</h2>'
      + '</div>'
      + '<div class="drawer__acts">'
      + '<span class="pp-fix" id="pp-fix"></span>'
      + '<span class="menu-anchor"><button type="button" class="ibtn ibtn--neutral ibtn--m" aria-label="' + esc(t('panel.actions')) + '" data-menu="pp-head-menu" data-menu-align="end" data-tooltip="' + esc(t('panel.actions')) + '"><i data-icon="more-dots"></i></button>'
      + '<div id="pp-head-menu" class="menu" role="menu" hidden></div></span>'
      + '<span class="drawer__close"><button type="button" class="ibtn ibtn--neutral ibtn--m" aria-label="' + esc(t('panel.close')) + '" data-modal-close data-tooltip="' + esc(t('panel.closeTip')) + '"><i data-icon="close"></i></button></span>'
      + '</div>'
      + '</header>'
      + '<div class="drawer__body drawer__body--flush pp-body" id="pp-body">'
      + '<div class="pp-tabs"><div class="tabs tabs--horiz" role="tablist" aria-label="' + esc(t('panel.tabs')) + '" id="pp-tabs" data-tabs></div></div>'
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
      + '<header class="modal__head"><h2 class="modal__title" id="pp-settings-title">' + esc(t('settings.title')) + '</h2>'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--l" aria-label="' + esc(t('btn.close')) + '" data-modal-close><i data-icon="close"></i></button></header>'
      + '<div class="modal__body">'
      + '<div class="inp inp--m inp--fullwidth"><label class="ds-label" for="pp-author"><span class="ds-label__text">' + esc(t('settings.author')) + '</span></label>'
      + '<div class="inp__field"><input class="inp__control" id="pp-author" autocomplete="off" placeholder="' + esc(t('settings.authorPh')) + '" aria-describedby="pp-author-h"></div>'
      + '<span class="ds-helper ds-helper--left" id="pp-author-h">' + esc(t('settings.authorHelp')) + '</span></div>'
      + sw('showFab', t('settings.showFab'), t('settings.showFabHelp', { key: HK.toggle }))
      + sw('showPlayer', t('settings.showPlayer'), t('settings.showPlayerHelp', { next: HK.next, prev: HK.prev }))
      + sw('closeOnGo', t('settings.closeOnGo'))
      + sw('showActions', t('settings.showActions'), t('settings.showActionsHelp'))
      + '<p class="ds-body-s-strong pp-subtitle">' + esc(t('settings.keys')) + '</p>'
      + '<div class="pp-keys">'
      + rof(HK.toggle, t('keys.toggle'))
      + rof(HK.fix, t('keys.fix'))
      + rof(HK.next + ' / ' + HK.prev, t('keys.nav'))
      + rof('Esc', t('keys.esc'))
      + '</div>'
      + '</div>'
      + '<footer class="modal__foot"><div class="modal__foot-right"><button type="button" class="btn btn--accent btn--m" data-modal-close><span class="btn__label">' + esc(t('btn.done')) + '</span></button></div></footer>'
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
      + '<button type="button" class="ibtn ibtn--neutral ibtn--l" aria-label="' + esc(t('btn.close')) + '" data-modal-close><i data-icon="close"></i></button></header>'
      + '<div class="modal__body"><p class="ds-body-m" id="pp-confirm-text"></p></div>'
      + '<footer class="modal__foot"><div class="modal__foot-right">'
      + '<button type="button" class="btn btn--transparent btn--m" data-modal-close data-pp-confirm-cancel><span class="btn__label">' + esc(t('btn.cancel')) + '</span></button>'
      + '<button type="button" class="btn btn--accent btn--m btn--danger" data-pp-confirm-ok><span class="btn__label">' + esc(t('btn.delete')) + '</span></button>'
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
    renderFix();
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
    if (isOpen()) { renderActive(); updateAlert(); renderFix(); return; }
    var nested = !!(window.DSModal && window.DSModal.stack().length);
    el.drawer.classList.toggle('modal-scrim--nested', nested);
    /* фокус при открытии — на выбранном табе: ряд табов первый в теле */
    el.drawer.querySelectorAll('[autofocus]').forEach(function (n) { n.removeAttribute('autofocus'); });
    var tb = el.drawer.querySelector('.tab[aria-selected="true"]');
    if (tb) tb.setAttribute('autofocus', '');
    if (!window.DSDrawer) { console.warn(LOG, 'DS Drawer runtime is not loaded'); return; }
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

  /* ---------------- Fix State (задача 0005a, §7.1) ---------------- */

  /* Сценарий, куда ляжет фиксация: выбранный в табе Flows (нет сценариев — новый). */
  function targetFlow() {
    var list = runner.flows();
    var u = store.ui();
    var cur = runner.current(), b = runner.busy();
    var id = u.flow || (b && b.flow) || (cur && cur.flow);
    return list.filter(function (f) { return f.id === id; })[0] || list[0] || null;
  }
  /* Почему Fix State сейчас нельзя: null — можно. */
  function fixBlocked() {
    var d = store.data();
    if (!d) return t('fix.noData', { tool: TOOL });
    if (runner.busy()) return t('fix.busy');
    if (d.flowErrors && d.flowErrors.length) return t('fix.flowsErrors', { app: appId() });
    return null;
  }
  function renderFix() {
    var box = document.getElementById('pp-fix');
    if (!box) return;
    var why = fixBlocked(), flow = targetFlow();
    var tip = why || (flow ? t('fix.tip', { flow: flow.title, key: HK.fix }) : t('fix.tipNew', { key: HK.fix }));
    box.setAttribute('data-tooltip', tip);
    box.setAttribute('tabindex', why ? '0' : '-1');
    box.innerHTML = '<button type="button" class="btn btn--outline btn--s" data-pp-cmd="fix"' + (why ? ' disabled' : '') + '>'
      + '<i data-icon="bookmark-add"></i><span class="btn__label">' + esc(t('fix.label')) + '</span></button>';
    wire(box);
  }

  var localSnacks = [];   // id снекбаров «saved in this browser only»: после записи журнала снимаются
  /** Fix State: из шторки — переход к новому узлу и поле названия; без шторки (Alt+Shift+S) — снекбар. */
  function fix() {
    var why = fixBlocked();
    if (why) { snack({ tone: 'error', title: t('fix.label'), text: why }); return Promise.resolve(null); }
    if (!PP._recorder) return Promise.resolve(null);
    var inDrawer = isOpen();
    var flow = targetFlow();
    return PP._recorder.fix(flow ? flow.id : null).then(function (r) {
      if (r.error === 'nothing-changed') { toast(t('toast.nothingChanged', { state: r.after ? core.stateLabel(r.after) : '' }), 'neutral'); return r; }
      if (r.error) { snack({ tone: 'error', title: t('snack.saveFailed'), text: r.error }); return r; }
      store.setUi({ flow: r.flow });
      var label = core.stateLabel(r.state);
      if (!r.draft && r.drafted !== r.state) toast(t('toast.savedAs', { state: label }), 'neutral');
      if (inDrawer) {
        selectTab('flows');
        if (PP._flowsTab) PP._flowsTab.rename(r.state, true);
        refresh('flows');
      } else {
        var local = r.draft;
        var sid = snack({ tone: local ? 'neutral' : 'success', title: local ? t('fix.local', { state: label }) : t('fix.fixed', { state: label }),
          text: t('fix.fixedText', { title: r.title, flow: r.flowTitle }),
          buttons: [{ label: t('btn.rename'), onClick: function () { open('flows'); if (PP._flowsTab) PP._flowsTab.rename(r.state, true); } }]
            .concat(local && store.status() === 'mirror' ? [{ label: t('btn.connectShort'), onClick: function () { linkFolder(); } }] : []) });
        if (local && sid != null) localSnacks.push(sid);
      }
      announce(t('fix.fixed', { state: label }));
      return r;
    }, function (e) {
      snack({ tone: 'error', title: t('snack.saveFailed'), text: e && e.message || String(e) });
      return null;
    });
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
    if (s === 'linked') html += item('unlink', 'folder-close-x', t('menu.disconnect')) + item('refresh', 'refresh', t('menu.reload'));
    else if (s === 'needs-permission') html += item('permit', 'folder-check', t('menu.allow')) + item('unlink', 'folder-close-x', t('menu.disconnect'));
    else html += item('link', 'folder', t('menu.connect'), s === 'unsupported');
    if (store.flowOps().length) html += item('download-flows', 'download', t('btn.downloadFlows'));
    html += '<hr class="menu__divider">' + item('settings', 'settings', t('menu.settings'));
    m.innerHTML = html;
    wire(m);
  }

  function alertState() {
    var d = store.data();
    var s = store.status(), st = store.state;
    if (!d) return { key: 'nodata', tone: 'error', title: t('alert.nodata.title'), text: t('alert.nodata.text', { file: (ctx.dir || 'proto-panel') + '/panel-data.js', tool: TOOL }) };
    var drafts = store.drafts().length, ops = store.flowOps().length;
    var local = s === 'mirror' || s === 'unsupported';
    var downloads = [{ label: t('btn.downloadComments'), cmd: 'download' }].concat(ops ? [{ label: t('btn.downloadFlows'), cmd: 'download-flows' }] : []);
    if (st.error) {
      var retry = s === 'linked' && (drafts || ops);
      /* разрешение не выдано (окно закрыли) — кнопка здесь же, а не только в меню шторки */
      var ask = s === 'needs-permission';
      var extra = (retry || ask) && drafts ? ' ' + t('alert.error.draft') : '';
      if ((retry || ask) && ops) extra += ' ' + t('alert.error.flowDraft');
      var btns = retry ? [{ label: t('btn.retry'), cmd: 'retry' }] : ask ? [{ label: t('btn.allow'), cmd: 'permit' }] : [];
      if (st.flowsError && ops) btns.push({ label: t('btn.discardFlows'), cmd: 'discard-flows' });
      return { key: 'error', tone: 'error', title: t('alert.error.title'), text: st.error + extra, close: true, buttons: btns };
    }
    if (st.mirrorError) return { key: 'mirror', tone: 'warning', title: t('alert.mirror.title'), text: st.mirrorError, close: true };
    /* Черновики только в памяти: хранилище закрыто со старта или отказало на ходу.
       Предупреждение — и до первого черновика, пока изменения идут в черновики
       (ревью 0005, R10). */
    if (store.draftsVolatile() && (drafts || ops || (local && (activeId === 'comments' || activeId === 'flows')))) {
      return { key: 'volatile', tone: 'warning', title: t('alert.volatile.title'),
        text: t('alert.volatile.text', { why: t(store.local.usable ? 'alert.volatile.why.failed' : 'alert.volatile.why.off'),
          next: t(s === 'mirror' ? 'alert.volatile.next.link' : s === 'needs-permission' ? 'alert.volatile.next.allow' : 'alert.volatile.next.download') }),
        buttons: [s === 'mirror' ? { label: t('btn.connect'), cmd: 'link' } : s === 'needs-permission' ? { label: t('btn.allow'), cmd: 'permit' } : null]
          .concat(downloads).filter(Boolean) };
    }
    if (s === 'needs-permission') return { key: 'perm', tone: 'warning', title: t('alert.perm.title'), text: t('alert.perm.text'), buttons: [{ label: t('btn.allow'), cmd: 'permit' }] };
    if (st.note === 'updated') return { key: 'note', tone: 'success', title: t('alert.note.title'), text: t('alert.note.text'), close: true };
    if (local && (activeId === 'comments' || drafts || ops)) {
      var can = s === 'mirror';
      return { key: 'local', tone: 'info', title: t('alert.local.title'),
        text: can ? t('alert.local.text.link', { base: ctx.base || 'apps' }) : t('alert.local.text.unsupported'),
        buttons: [can ? { label: t('btn.connect'), cmd: 'link' } : null].concat(downloads).filter(Boolean),
        link: { label: t('btn.copy'), cmd: 'copy' } };
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
      + (a.close ? '<div class="alert__actions"><button type="button" class="alert__act alert__close" aria-label="' + esc(t('btn.close')) + '" data-pp-cmd="dismiss-' + a.key + '"><i data-icon="close"></i></button></div>' : '')
      + '</div>';
    zone.hidden = false;
    wire(zone);
  }

  function linkFolder() {
    toast(t('toast.chooseRoot', { base: ctx.base || 'apps' }), 'info');
    return store.link().then(function (r) {
      toast(r && r.drafts ? t('toast.connectedDrafts', { n: r.drafts }) : t('toast.connected'), 'success');
    }, failed(t('snack.notConnected')));
  }
  function failed(title) {
    return function (e) {
      if (e && e.name === 'AbortError') return;
      snack({ tone: 'error', title: title, text: e && e.message || String(e) });
    };
  }

  function command(cmd) {
    if (cmd === 'fix') return fix();
    if (cmd === 'link') return linkFolder();
    if (cmd === 'permit') return store.permit().then(function (r) { toast(r && r.drafts ? t('toast.allowedDrafts', { n: r.drafts }) : t('toast.allowed'), 'success'); }, failed(t('snack.noAccess')));
    if (cmd === 'unlink') return store.unlink().then(function () { toast(t('toast.disconnected'), 'neutral'); });
    if (cmd === 'refresh') return store.refresh().then(function (changed) { toast(changed ? t('toast.reloaded') : t('toast.same'), changed ? 'success' : 'neutral'); }, failed(t('snack.reloadFailed')));
    if (cmd === 'retry') return store.flushAll().then(function (n) { if (!n) toast(t('toast.noDrafts'), 'neutral'); }, failed(t('snack.saveFailed')));
    if (cmd === 'discard-flows') {
      return confirm({ title: t('discard.title'), text: t('discard.text'), ok: t('discard.ok') }).then(function (yes) {
        if (!yes) return;
        store.discardFlowOps();
        toast(t('toast.flowsDiscarded'), 'neutral');
      });
    }
    if (cmd === 'settings') return openSettings();
    if (cmd === 'download') { store.download(); return null; }
    if (cmd === 'download-flows') { store.downloadFlows(); return null; }
    if (cmd === 'copy') return store.copyText(store.exportText()).then(function () { toast(t('toast.copied'), 'success'); }, failed(t('snack.copyFailed')));
    if (cmd === 'dismiss-error') { store.state.error = null; store.state.flowsError = false; updateAlert(); return null; }
    if (cmd === 'dismiss-note') { store.state.note = null; updateAlert(); return null; }
    if (cmd === 'dismiss-mirror') { store.state.mirrorError = null; updateAlert(); return null; }
    return null;
  }

  /* ---------------- табы ---------------- */

  /** Регистрация таба: { id, title, icon?, badge?() → число|null, render(pane, ctx), onShow?() }. */
  function tab(def) {
    if (!def || !def.id || typeof def.render !== 'function') throw new Error('ProtoPanel.tab: id and render(pane, ctx) are required');
    if (!/^[a-z0-9-]+$/.test(def.id)) throw new Error('ProtoPanel.tab: id — lowercase latin letters, digits and hyphens');
    if (tabs.some(function (x) { return x.id === def.id; })) throw new Error('ProtoPanel.tab: tab “' + def.id + '” already exists');
    tabs.push({ id: def.id, title: def.title || def.id, icon: def.icon || null, badge: def.badge || null, render: def.render, onShow: def.onShow || null });
    if (mounted) buildTabs();
    return { id: def.id, refresh: function () { refresh(def.id); }, select: function () { open(def.id); } };
  }

  function paneOf(id) { return document.getElementById('pp-pane-' + id); }
  function defOf(id) { return tabs.filter(function (x) { return x.id === id; })[0] || null; }

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
    fresh.setAttribute('aria-label', t('panel.tabs'));
    fresh.setAttribute('data-tabs', '');
    fresh.innerHTML = tabs.map(function (x) {
      var on = x.id === sel;
      return '<button type="button" class="tab tab--m' + (on ? ' tab--selected' : '') + '" role="tab" id="pp-tab-' + x.id + '" aria-controls="pp-pane-' + x.id + '"'
        + ' aria-selected="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-pp-tab="' + x.id + '">'
        + (x.icon ? '<span class="tab__icon"><i data-icon="' + esc(x.icon) + '"></i></span>' : '')
        + '<span class="tab__label">' + esc(x.title) + '</span><span class="tab__badge" hidden></span></button>';
    }).join('');
    row.replaceWith(fresh);
    tabs.forEach(function (x) {
      if (paneOf(x.id)) return;
      var p = document.createElement('div');
      p.className = 'pp-pane';
      p.id = 'pp-pane-' + x.id;
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', 'pp-tab-' + x.id);
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
    tabs.forEach(function (x) { var p = paneOf(x.id); if (p) p.hidden = x.id !== id; });
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
    try { d.render(p, tabCtx); } catch (e) { console.warn(LOG, 'tab “' + d.id + '” failed to render:', e); }
  }
  function refresh(id) {
    badges();
    renderFix();
    if (!id || id === activeId) { if (isOpen()) renderActive(); }
  }

  function badges() {
    tabs.forEach(function (x) {
      var b = document.querySelector('#pp-tab-' + x.id + ' .tab__badge');
      if (!b || !x.badge) return;
      var n = null;
      try { n = x.badge(); } catch (e) { n = null; }
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
      text = t('player.going', { state: runner.stepName(flow, b.to) });
    } else if (c.error) {
      var ei = runner.stepIdx(flow, c.error.step);
      lead = '<span class="pp-player__warn" aria-hidden="true"><i data-icon="alert-triangle"></i></span>';
      text = t('player.failed', { state: runner.stepName(flow, ei) });
      note = c.error.message;
      canPrev = ei > 0; canNext = true;
    } else {
      text = (c.index + 1) + ' / ' + total;
      title = runner.stepName(flow, c.index) + ' · ' + flow.steps[c.index].title + (c.dirty ? t('player.changed') : '');
      note = flow.steps[c.index].note || '';
      canPrev = c.index > 0; canNext = c.index < total - 1;
    }
    hideFloating();
    box.innerHTML =
      '<button type="button" class="ibtn ibtn--neutral ibtn--m" data-pp-player="prev" aria-label="' + esc(t('player.prev')) + '"' + (canPrev ? ' data-tooltip="' + esc(t('player.prevTip', { key: HK.prev })) + '"' : ' disabled') + '><i data-icon="chevron-left"></i></button>'
      + '<button type="button" class="pp-player__label" data-pp-player="open"' + (note ? ' data-tooltip="' + esc(note) + '" data-tooltip-multiline="yes"' : '') + (b ? ' disabled' : '') + '>'
      + lead + '<span class="pp-player__num">' + esc(text) + '</span>' + (title ? '<span class="pp-player__title"> · ' + esc(title) + '</span>' : '') + '</button>'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m" data-pp-player="next" aria-label="' + esc(t('player.next')) + '"' + (canNext ? ' data-tooltip="' + esc(t('player.nextTip', { key: HK.next })) + '"' : ' disabled') + '><i data-icon="chevron-right"></i></button>'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m" data-pp-player="stop" aria-label="' + esc(t('player.stop')) + '" data-tooltip="' + esc(t('player.stop')) + '"' + (b ? ' disabled' : '') + '><i data-icon="close"></i></button>';
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
    var hereFile = pageFile();
    var n = store.comments().filter(function (c) { return c.status === 'open' && c.page && c.page.split(/[?#]/)[0] === hereFile; }).length;
    badge.innerHTML = n ? '<span class="badge badge--xs badge--accent" aria-hidden="true">' + (n > 99 ? '99+' : n) + '</span>' : '';
    badge.hidden = !n;
    fab.setAttribute('aria-label', n ? t('fab.labelCount', { n: n }) : t('panel.name'));
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
    s.querySelector('[data-pp-confirm-ok] .btn__label').textContent = o.ok || t('btn.delete');
    /* начальный фокус — «Cancel»: удаление не должно случиться от случайного Enter;
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
    else if (act === 'fix') fix();
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
    /* Esc при открытом своём меню или списке закрывает только его: модалка ДС
       ловит Esc захватом на document и закрыла бы всю шторку вместе с меню узла.
       Слушатель на window срабатывает раньше; чужие слои не трогаются (ПН10). */
    window.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !isOpen()) return;
      var m = null, d = null;
      try { m = window.DSMenu && window.DSMenu.current(); d = window.DSDropdownList && window.DSDropdownList.current(); } catch (err) { /* ДС без этих рантаймов */ }
      if (m && own(m.trigger)) { e.preventDefault(); e.stopPropagation(); m.close(true); }
      else if (d && own(d.field)) { e.preventDefault(); e.stopPropagation(); d.close(true); }
    }, true);
    window.addEventListener('message', function (e) {
      var m = e.data;
      if (!m || m.source !== 'proto-panel' || m.type !== 'key' || !childFrame(e.source)) return;
      var H = core.HOTKEYS;
      hotkey(m.code === H.toggle ? 'toggle' : m.code === H.next ? 'next' : m.code === H.prev ? 'prev' : m.code === H.fix ? 'fix' : null);
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
    el.fab.setAttribute('data-tooltip', store.data() ? t('panel.hotkeyTip', { key: HK.toggle }) : t('panel.noDataTip', { tool: TOOL }));
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
      if (!c || c.getAttribute('aria-disabled') === 'true' || c.disabled) return;
      if (!c.closest('#pp-drawer')) return;
      e.preventDefault();
      var cmd = c.getAttribute('data-pp-cmd');
      if (cmd === 'link' || cmd === 'permit' || cmd === 'download' || cmd === 'download-flows' || cmd === 'copy' || cmd === 'fix') command(cmd);   // жест пользователя — сразу
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
    renderFix();

    bus.on('prefs', function () { renderPlayer(); renderFab(); });
    bus.on('state', function () { renderPlayer(); refresh('flows'); });
    bus.on('busy', function (b) {
      renderPlayer();
      refresh('flows');
      if (b) { var f = runner.flowById(b.flow); announce(t('live.going', { state: f ? runner.stepName(f, b.to) : '' })); }
    });
    bus.on('stop', function () { renderPlayer(); refresh(); announce(t('live.stopped')); });
    bus.on('step', function (s) {
      var f = runner.flowById(s.flow);
      announce(t('live.step', { state: f ? runner.stepName(f, s.index) : '', i: s.index + 1, total: s.total, title: s.title }));
    });
    bus.on('error', function (x) {
      renderPlayer();
      refresh('flows');
      announce(x.message);
      snack({ tone: 'error', title: t('snack.stepFailed'), text: x.message, buttons: [{ label: t('btn.openPanel'), onClick: function () { open('flows'); } }] });
    });
    bus.on('store', function () { renderHeadMenu(); updateAlert(); refresh(); });
    bus.on('data', function () { refresh(); updateAlert(); });
    bus.on('comments', function () { refresh(); updateAlert(); });
    bus.on('flows-drafts', function () { renderHeadMenu(); refresh(); updateAlert(); renderPlayer(); });
    bus.on('flows-saved', function (x) {
      /* выбранный сценарий — черновой: после записи у него мог смениться id */
      var u = store.ui();
      if (x && x.map) Object.keys(x.map.flows).forEach(function (ref) { var m = x.map.flows[ref]; if (m.from && u.flow === m.from) store.setUi({ flow: m.to }); });
      renderHeadMenu(); refresh(); updateAlert(); renderPlayer();
    });
    bus.on('drafts-saved', function (n) { toast(t('toast.draftsSaved', { n: n }), 'success'); });
    /* журнал записан после подключения папки; номер, выданный не тем, что был на схеме, — назван (§6.2) */
    bus.on('states-saved', function (x) {
      /* «saved in this browser only» больше не правда — свои снекбары снимаются по id */
      localSnacks.splice(0).forEach(function (id) { try { if (window.DSSnack) window.DSSnack.dismiss(id); } catch (e) { /* уже закрыт */ } });
      var count = PP._strings ? PP._strings.count(x.count, 'state', 'states') : x.count;
      var moved = (x.moved || []).map(function (m) { return t('toast.movedItem', { from: core.stateLabel(m.from), to: core.stateLabel(m.to) }); });
      toast(moved.length ? t('toast.statesSavedMoved', { count: count, list: moved.join(', ') }) : t('toast.statesSaved', { count: count }), 'success');
    });
  }

  PP._ui = {
    mount: mount, open: open, close: close, toggle: toggle, isOpen: isOpen, tab: tab, refresh: refresh, selectTab: selectTab,
    releasePage: releasePage, toast: toast, snack: snack, confirm: confirm, announce: announce, esc: esc, wire: wire,
    activeTab: function () { return activeId; }, updateAlert: updateAlert, fix: fix, targetFlow: targetFlow, fixBlocked: fixBlocked
  };
  PP.tab = tab;
})();

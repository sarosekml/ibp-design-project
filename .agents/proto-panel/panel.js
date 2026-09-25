/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — старт и публичный API (panel.js).

   Последний файл рантайма. На верхнем уровне ничего не рисует: ждёт
   DOMContentLoaded — к этому моменту экранный скрипт страницы отработал,
   разметка и рантаймы ДС готовы. Затем монтирует панель, поднимает
   подключённую папку (если была) и через два кадра продолжает сценарий
   после перезагрузки (или открывает шаг по адресу #pp=…).

   Публичный API — для будущих табов и проверки из консоли:
     ProtoPanel = { version, app: { dir, id, title }, open(tabId?), close(), toggle(),
       tab({ id, title, icon, badge, render, onShow }),
       flows: { list(), current(), goTo(flowId, stepId, { show }?), next(), prev(), stop() },
       comments: { list({ status?, page? }?), add(text, { page?, step? }?), edit(n, text),
                   setStatus(n, status, resolution?), remove(n) },
       store: { status(), link(), unlink(), linkHandle(dirHandle), refresh() },
       on(event, fn) }   // 'step' | 'error' | 'saved' | 'open' | 'close'
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  var ctx = window.__PROTO_PANEL;
  if (!ctx || !PP || !PP._ui || !PP._store || !PP._runner) return;
  var store = PP._store, runner = PP._runner, ui = PP._ui, bus = PP._bus;
  var core = window.ProtoPanelCore;
  var d = store.data();

  PP.version = 1;
  PP.app = { dir: ctx.app, id: d && d.app ? d.app.id : String(ctx.app).split('/').pop(), title: d && d.app ? d.app.title : '' };
  PP.open = function (tabId) { ui.open(tabId); };
  PP.close = function () { ui.close(); };
  PP.toggle = function () { ui.toggle(); };
  PP.tab = ui.tab;
  PP.on = bus.on;

  PP.flows = {
    list: function () { return runner.flows(); },
    current: function () { var c = runner.current(); return c ? { flow: c.flow, step: c.step, dirty: c.dirty, error: c.error } : null; },
    goTo: function (flowId, stepId, opts) { return runner.goTo(flowId, stepId, opts); },
    next: function () { return runner.next(); },
    prev: function () { return runner.prev(); },
    stop: function () { runner.stop(); }
  };

  function writable() { var s = store.status(); return s === 'linked' || s === 'needs-permission'; }

  PP.comments = {
    list: function (f) {
      f = f || {};
      return store.comments().filter(function (c) {
        return (!f.status || c.status === f.status) && (!f.page || String(c.page || '').split(/[?#]/)[0] === String(f.page).split(/[?#]/)[0]);
      });
    },
    /** С подключённой папкой — запись в comments.md (номер К-N), без неё — черновик (id черновика). */
    add: function (text, o) {
      o = o || {};
      if (!String(text || '').trim()) return Promise.reject(new Error('Пустой текст'));
      if (writable()) return store.save([{ op: 'add', text: String(text).trim(), page: o.page || null, step: o.step || null }]).then(function (a) { return a[0]; });
      return Promise.resolve(store.addDraft(String(text).trim(), o.page || null, o.step || null));
    },
    edit: function (n, text) {
      if (!String(text || '').trim()) return Promise.reject(new Error('Пустой текст'));
      return store.save([{ op: 'edit', n: n, text: String(text).trim() }]);
    },
    setStatus: function (n, status, resolution) {
      var code = core.STATUS.byWord[status] || status;
      if (core.STATUS.codes.indexOf(code) < 0) return Promise.reject(new Error('Статус — open | done | rejected'));
      return store.save([{ op: 'status', n: n, status: code, resolution: resolution }]);
    },
    remove: function (n) { return store.save([{ op: 'delete', n: n }]); }
  };

  PP.store = {
    status: function () { return store.status(); },
    link: function () { return store.link(); },
    unlink: function () { return store.unlink(); },
    linkHandle: function (h) { return store.linkHandle(h); },
    refresh: function () { return store.refresh(); }
  };

  function start() {
    ui.mount();
    store.init().then(function () { ui.updateAlert(); });
    store.frames(2).then(function () { runner.resume(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

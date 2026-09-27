/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — таб «Flows» (tab-flows.js).

   Сценарии показа из flows.yaml (через зеркало и черновые операции):
   выбор сценария, New flow и Rename flow, «Play from start» и «Stop flow»,
   строка рекордера — что сделает Fix State прямо сейчас (задача 0005a,
   §7.2), шаги вертикальной блок-схемой. Узел — состояние State NN: кнопка
   перехода и меню (перейти, скопировать адрес, комментировать, переименовать,
   удалить). Состояния узла: текущий, идёт переход, ошибка, записан из
   панели (Recorded), не записан на диск (Unsaved). Соединитель подписан
   «↻ страница», если следующий шаг открывает страницу заново. Таб
   регистрируется так же, как будущие табы. Тексты — strings.js.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  if (!PP || !PP._ui || !PP._runner) return;
  var store = PP._store, runner = PP._runner, ui = PP._ui, core = window.ProtoPanelCore;
  var ctx = window.__PROTO_PANEL || {};
  var esc = ui.esc;
  var S = PP._strings || { t: function (k) { return k; }, count: function (n, one, many) { return n + ' ' + (n === 1 ? one : many); } };
  var t = S.t;
  var HK = core.HOTKEYS.label;
  var TOOL = 'node .agents/tools/proto-panel.mjs';

  var editing = null;      // { kind: 'state', n, value, sel } | { kind: 'flow', id, value, sel }; sel — выделение [начало, конец]
  var showActs = false;    // список действий строки рекордера раскрыт

  function appId() { var d = store.data(); return d && d.app && d.app.id || String(ctx.app || '').split('/').pop(); }
  function label(flow, i) { return runner.stepName(flow, i); }

  function selected() {
    var list = runner.flows();
    var cur = runner.current(), busy = runner.busy();
    var id = store.ui().flow || (busy && busy.flow) || (cur && cur.flow);
    return list.filter(function (f) { return f.id === id; })[0] || list[0] || null;
  }

  /* ---------------- строка рекордера ---------------- */

  function actText(a, entry) {
    var lab = entry && entry.label;
    if (a.verb === 'click') return a.target === 'body' ? t('rec.act.outside') : lab ? t('rec.act.click', { label: lab }) : t('rec.act.clickAt', { target: a.target });
    if (a.verb === 'fill') return lab ? t('rec.act.fill', { value: a.value, label: lab }) : t('rec.act.fillAt', { value: a.value, target: a.target });
    if (a.verb === 'press') return t('rec.act.press', { key: a.key });
    if (a.verb === 'waitFor') return t('rec.act.waitFor', { target: a.target });
    if (a.verb === 'wait') return t('rec.act.wait', { ms: a.ms });
    return core.describeAction(a);
  }

  function recorderLine(flow) {
    if (!PP._recorder || runner.busy()) return '';
    var c = PP._recorder.preview(flow ? flow.id : null);
    var text;
    if (c.error === 'nothing-changed') text = t('rec.nothing', { after: c.after && c.after.state ? core.stateLabel(c.after.state) : '' });
    else if (c.mode === 'increment') text = t('rec.increment', { count: S.count(c.count, 'action', 'actions'), after: core.stateLabel(c.after.state), state: core.stateLabel(c.n) });
    else if (c.count) text = t(c.count === 1 ? 'rec.entryOne' : 'rec.entry', { page: c.page, count: S.count(c.count, 'action', 'actions'), state: core.stateLabel(c.n) });
    else text = t('rec.entryEmpty', { page: c.page, state: core.stateLabel(c.n) });
    var acts = c.step ? c.step.do : [];
    var list = showActs && acts.length
      ? '<ul class="pp-rec__list ds-body-xs">' + acts.map(function (a, i) {
        var e = c.entries && c.entries[i];
        return '<li class="pp-rec__item' + (e && e.fragile ? ' pp-rec__item--fragile' : '') + '">'
          + (e && e.fragile ? '<span class="pp-rec__icon" aria-hidden="true"><i data-icon="alert-triangle"></i></span>' : '')
          + '<span>' + esc(actText(a, e)) + (e && e.replayed ? '<span class="pp-muted"> · ' + esc(t('rec.replayed')) + '</span>' : '') + '</span></li>';
      }).join('') + '</ul>'
      : '';
    return '<div class="pp-rec" aria-live="polite">'
      + '<p class="pp-rec__line ds-body-s"><span class="pp-rec__dot" aria-hidden="true"><i data-icon="circle-filled-small"></i></span>'
      + '<span class="pp-rec__text">' + esc(text) + '</span>'
      + (acts.length ? '<button type="button" class="btn btn--transparent btn--xs" data-pp-rec="toggle" aria-expanded="' + showActs + '"><span class="btn__label">' + esc(showActs ? t('btn.hide') : t('btn.show')) + '</span></button>' : '')
      + '</p>' + list + '</div>';
  }

  /* ---------------- узел ---------------- */

  function menuItem(cmd, i, icon, text, disabledTip) {
    var btn = '<button type="button" class="menu__item" role="menuitem" data-pp-step-cmd="' + cmd + '" data-pp-i="' + i + '"' + (disabledTip ? ' aria-disabled="true"' : '') + '>'
      + '<span class="menu__item-icon"><i data-icon="' + icon + '"></i></span><span class="menu__item-label">' + esc(text) + '</span></button>';
    return disabledTip ? '<span class="pp-tipwrap" tabindex="0" data-tooltip="' + esc(disabledTip) + '">' + btn + '</span>' : btn;
  }

  function renameField(id, value, labelText) {
    return '<div class="pp-rename">'
      + '<div class="inp inp--m inp--fullwidth"><label class="ds-label pp-hidden" for="' + id + '"><span class="ds-label__text">' + esc(labelText) + '</span></label>'
      + '<div class="inp__field"><input class="inp__control" id="' + id + '" autocomplete="off" value="' + esc(value) + '" data-pp-rename></div></div>'
      + '<div class="pp-row"><button type="button" class="btn btn--accent btn--s" data-pp-rename-save><span class="btn__label">' + esc(t('btn.save')) + '</span></button>'
      + '<button type="button" class="btn btn--transparent btn--s" data-pp-rename-cancel><span class="btn__label">' + esc(t('btn.cancel')) + '</span></button></div>'
      + '</div>';
  }

  function node(flow, s, i, st) {
    var cls = 'pp-step' + (st.current ? ' pp-step--current' : '') + (st.error ? ' pp-step--error' : '') + (st.busy ? ' pp-step--busy' : '') + (s.draft ? ' pp-step--draft' : '');
    var num = st.busy
      ? '<span class="spin spin--s spin--accent pp-step__spin" aria-hidden="true"></span>'
      : '<span class="av av--circular av--s pp-step__num" aria-hidden="true"><span class="av__text">' + (s.state || i + 1) + '</span></span>';
    var nActs = s.do.length ? S.count(s.do.length, 'action', 'actions') : t('node.noActions');
    var meta = s.page
      ? '<span class="pp-step__meta ds-body-xs"><i data-icon="file"></i><span>' + esc(s.page) + ' · ' + esc(nActs) + '</span></span>'
      : '<span class="pp-step__meta ds-body-xs">' + esc(nActs) + '</span>';
    var chips = (s.recorded ? chip(t('node.recorded'), '') : '') + (s.draft ? chip(t('node.unsaved'), ' chip--warning') : '')
      + (st.current ? chip(st.dirty ? t('node.currentChanged') : t('node.current'), ' chip--info') : '');
    var over = '<span class="pp-step__over"><span class="pp-step__overline ds-body-xs">' + esc(s.state ? t('node.overline', { n: core.pad2(s.state) }) : t('node.unnumbered')) + '</span>' + chips + '</span>';
    var editingThis = editing && editing.kind === 'state' && editing.n === s.state;
    var titleHtml = editingThis ? '' : '<span class="pp-step__title ds-body-m-strong">' + esc(s.title) + '</span>';
    var note = s.note ? '<span class="pp-step__note ds-body-s' + (st.current ? ' pp-step__note--full' : '') + '">' + esc(s.note) + '</span>' : '';
    var issues = (s.issues || []).map(function (code) {
      return '<span class="pp-step__issue ds-body-xs"><i data-icon="alert-triangle"></i><span>' + esc(t('issue.' + code)) + '</span></span>';
    }).join('');
    var err = st.error ? '<span class="pp-step__err ds-body-xs"><i data-icon="alert-triangle"></i><span>' + esc(st.message) + '</span></span>' : '';
    var link = i ? '<div class="pp-link" aria-hidden="true"><span class="pp-link__line"></span><i data-icon="arrow-narrow-down"></i>'
      + (s.page ? '<span class="pp-link__page ds-body-xs">↻ ' + esc(s.page) + '</span>' : '') + '</div>' : '';
    var mid = 'pp-step-menu-' + i;
    var deps = !core.canDeleteState(flow, i) ? t('node.deleteDeps') : null;
    var name = label(flow, i);
    var main = over + titleHtml + meta + note + issues + err;
    var go = editingThis
      ? '<div class="pp-step__go pp-step__go--edit">' + num + '<span class="pp-step__main">' + over + renameField('pp-rename-state', editing.value, t('rename.state')) + meta + '</span></div>'
      : '<button type="button" class="pp-step__go" data-pp-go="' + i + '" aria-label="' + esc(t('node.goAria', { state: name, title: s.title }) + (st.current ? t('node.ariaCurrent') : '') + (st.error ? t('node.ariaError') : '')) + '">'
        + num + '<span class="pp-step__main">' + main + '</span></button>';
    return '<li class="' + cls + '"' + (st.current ? ' aria-current="step"' : '') + ' data-pp-state="' + (s.state || '') + '">' + link
      + '<div class="pp-step__card">' + go
      + '<span class="menu-anchor pp-step__menu"><button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="' + esc(t('node.menu', { state: name })) + '" data-menu="' + mid + '" data-menu-align="end"><i data-icon="more-dots"></i></button>'
      + '<div id="' + mid + '" class="menu" role="menu" hidden>'
      + menuItem('go', i, 'arrow-right', t('node.go')) + menuItem('copy', i, 'link', t('node.copy')) + menuItem('comment', i, 'message-text', t('node.comment'))
      + '<hr class="menu__divider">' + menuItem('rename', i, 'edit', t('node.rename'))
      + menuItem('delete', i, 'trash', t('node.delete'), deps)
      + '</div></span>'
      + '</div></li>';
  }
  function chip(text, tone) { return '<span class="chip chip--xs chip--rounded' + tone + '"><span class="chip__label">' + esc(text) + '</span></span>'; }

  /* ---------------- шапка таба ---------------- */

  function header(list, flow, active) {
    var html = '<div class="pp-flow__row">';
    if (editing && editing.kind === 'flow' && flow && editing.id === flow.id) {
      html += renameField('pp-rename-flow', editing.value, t('rename.flow'));
    } else if (list.length > 1) {
      html += '<div class="inp inp--m inp--fullwidth pp-flow__pick">'
        + '<label class="ds-label" for="pp-flow-input"><span class="ds-label__text">' + esc(t('flows.flow')) + '</span></label>'
        + '<div class="inp__field" data-pp-ddl>'
        + '<input class="inp__control" id="pp-flow-input" readonly autocomplete="off" value="' + esc(flow.title) + '">'
        + '<span class="inp__acts"><button type="button" class="inp__act inp__act--chev" aria-label="' + esc(t('flows.showList')) + '"><i data-icon="chevron-down"></i></button></span>'
        + '</div>'
        + '<div id="pp-flow-list" class="ddl ddl--floating ddl--scroll" role="listbox" aria-label="' + esc(t('flows.tab')) + '">'
        + list.map(function (f) {
          return '<button type="button" class="ddl__item" role="option" aria-selected="' + (f.id === flow.id) + '" data-pp-flow="' + esc(f.id) + '">'
            + '<span class="ddl__item-body"><span class="ddl__item-label">' + esc(f.title) + '</span><span class="ds-helper">' + esc(S.count(f.steps.length, 'state', 'states')) + '</span></span></button>';
        }).join('')
        + '</div></div>';
    } else if (flow) {
      html += '<p class="ds-body-l-strong pp-flow__title">' + esc(flow.title) + '</p>';
    }
    if (flow && !(editing && editing.kind === 'flow')) {
      html += '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="' + esc(t('flows.renameFlow')) + '" data-tooltip="' + esc(t('flows.renameFlow')) + '" data-pp-flow-cmd="rename"><i data-icon="edit"></i></button>';
    }
    html += '<button type="button" class="btn btn--transparent btn--s" data-pp-flow-cmd="new"><i data-icon="add"></i><span class="btn__label">' + esc(t('flows.newFlow')) + '</span></button>';
    html += '</div>';
    if (flow && flow.desc) html += '<p class="ds-body-s pp-muted">' + esc(flow.desc) + '</p>';
    if (flow && flow.steps.length) {
      html += '<div class="pp-row">'
        + '<button type="button" class="btn btn--accent btn--s" data-pp-flow-cmd="start"><i data-icon="arrow-right"></i><span class="btn__label">' + esc(t('flows.play')) + '</span></button>'
        + (active ? '<button type="button" class="btn btn--transparent btn--s" data-pp-flow-cmd="stop"><span class="btn__label">' + esc(t('flows.stop')) + '</span></button>' : '')
        + '</div>';
    }
    return html;
  }

  function empty(icon, title, text) {
    return '<div class="es es--m pp-empty"><span class="illu es__illu" data-illu="' + icon + '" aria-hidden="true"></span>'
      + '<div class="es__body"><p class="es__title">' + esc(title) + '</p><p class="es__text">' + esc(text) + '</p></div></div>';
  }

  /* ---------------- отрисовка ---------------- */

  function render(pane, c) {
    c.hideFloating();
    var d = store.data();
    if (!d) { pane.innerHTML = ''; return; }
    if (d.flowErrors && d.flowErrors.length) {
      pane.innerHTML = '<div class="alert alert--error alert--m" role="alert">'
        + '<span class="alert__icon" aria-hidden="true"><i data-icon="alert-circle-filled"></i></span>'
        + '<div class="alert__body"><p class="alert__title">' + esc(t('flows.error.title')) + '</p>'
        + '<p class="alert__text">' + d.flowErrors.slice(0, 5).map(esc).join('<br>')
        + (d.flowErrors.length > 5 ? '<br>' + esc(t('flows.error.more', { n: d.flowErrors.length - 5 })) : '')
        + '<br>' + esc(t('flows.error.fix', { file: (ctx.dir || 'proto-panel') + '/flows.yaml', tool: TOOL })) + '</p></div></div>';
      c.wire(pane);
      return;
    }
    var list = runner.flows();
    var flow = selected();
    var cur = runner.current(), busy = runner.busy();
    var active = flow && cur && cur.flow === flow.id ? cur : null;
    var html = '<div class="pp-flow">' + header(list, flow, !!active) + recorderLine(flow) + '</div>';
    if (!list.length) {
      html += empty('empty-folder', t('flows.none.title'), t('flows.none.text', { app: appId() }));
    } else if (!flow.steps.length) {
      html += empty('empty-folder', t('flows.empty.title'), t('flows.empty.text', { key: HK.fix }));
    } else {
      var busyHere = busy && busy.flow === flow.id ? busy : null;
      var errIdx = active && active.error ? runner.stepIdx(flow, active.error.step) : -1;
      html += '<ol class="pp-chart" aria-label="' + esc(t('flows.chart', { title: flow.title })) + '">' + flow.steps.map(function (s, i) {
        return node(flow, s, i, {
          current: !!active && !busyHere && active.index === i,
          dirty: !!active && active.dirty,
          error: errIdx === i && !busyHere,
          message: errIdx === i ? active.error.message : '',
          busy: !!busyHere && busyHere.to === i
        });
      }).join('') + '</ol>';
    }
    pane.innerHTML = html;
    c.wire(pane);
    var field = pane.querySelector('[data-pp-ddl]');
    if (field && window.DSDropdownList) {
      window.DSDropdownList.bind(field, {
        list: pane.querySelector('#pp-flow-list'),
        onSelect: function (it) {
          store.setUi({ flow: it.getAttribute('data-pp-flow') });
          editing = null;
          setTimeout(function () { ui.refresh('flows'); }, 0);
        }
      });
    }
    var input = pane.querySelector('[data-pp-rename]');
    if (input) {
      input.focus();
      /* выделение и каретка переживают перерисовку таба (фоновые события шины):
         после Fix State автоназвание выделено, пока человек его не тронул */
      if (editing && editing.sel) input.setSelectionRange(editing.sel[0], editing.sel[1]);
      /* виден весь узел с кнопками Save и Cancel, а не только поле */
      (input.closest('.pp-step, .pp-rename') || input).scrollIntoView({ block: 'nearest' });
      return;
    }
    var curNode = pane.querySelector('.pp-step--current, .pp-step--error, .pp-step--busy');
    if (curNode && curNode.scrollIntoView) curNode.scrollIntoView({ block: 'nearest' });
  }

  /* ---------------- действия ---------------- */

  function fail(title) { return function (e) { ui.snack({ tone: 'error', title: title, text: e && e.message || String(e) }); }; }

  function go(flow, i) {
    store.setUi({ flow: flow.id });
    runner.goTo(flow.id, i).catch(fail(t('snack.stateNotOpened')));
  }

  function copyStep(flow, i) {
    var u = runner.stepUrl(flow.id, i);
    if (!u) return;
    store.copyText(u).then(function () { ui.toast(t('toast.stateLink'), 'success'); }, fail(t('snack.linkFailed')));
  }

  function commentStep(flow, i) {
    var k = runner.entryIdx(flow, i);
    var s = flow.steps[i];
    var step = s.state ? { state: s.state } : null;
    if (step && s.draft) step.ref = s.draft;
    if (PP._comments) PP._comments.setContext({ page: k >= 0 ? flow.steps[k].page : null, step: step });
    ui.selectTab('comments');
  }

  /* Правка чернового состояния или сценария — прямо в его операции журнала. */
  function patchDraft(ref, fn) {
    var ops = store.flowOps();
    var hit = ops.filter(function (op) { return op.ref === ref; })[0];
    if (!hit) return false;
    fn(hit, ops);
    store.setFlowOps(ops);
    return true;
  }

  function saveOps(ops) { return store.saveFlows(ops).then(function (out) { ui.refresh('flows'); return out; }, fail(t('snack.saveFailed'))); }

  function renameState(flow, i, title) {
    var s = flow.steps[i];
    title = String(title || '').replace(/\s+/g, ' ').trim();
    editing = null;
    if (!title || title === s.title) { ui.refresh('flows'); return; }
    if (s.draft && patchDraft(s.draft, function (op) { op.step.title = title; })) { ui.refresh('flows'); return; }
    saveOps([{ op: 'renameState', state: s.state, title: title }]);
  }

  function renameFlow(flow, title) {
    title = String(title || '').replace(/\s+/g, ' ').trim();
    editing = null;
    if (!title || title === flow.title) { ui.refresh('flows'); return; }
    if (flow.draft && patchDraft(flow.draft, function (op) { op.title = title; })) { ui.refresh('flows'); return; }
    saveOps([{ op: 'renameFlow', flow: flow.id, title: title }]);
  }

  function newFlow() {
    var ref = store.newRef('f');
    editing = null;
    store.saveFlows([{ op: 'addFlow', ref: ref }]).then(function (out) {
      var id = out.res && out.res.flows[ref];
      if (id) store.setUi({ flow: id });
      ui.refresh('flows');
    }, fail(t('snack.saveFailed')));
  }

  function deleteState(flow, i) {
    var s = flow.steps[i];
    if (!core.canDeleteState(flow, i)) return;
    var name = label(flow, i);
    ui.confirm({ title: t('del.title', { state: name }), text: s.draft ? t('del.draftText') : t('del.text', { n: s.state }), ok: t('btn.delete') }).then(function (yes) {
      if (!yes) return;
      if (s.draft) {
        /* черновое состояние — просто убрать его операцию из журнала: номер ещё не выдан */
        store.setFlowOps(store.flowOps().filter(function (op) { return op.ref !== s.draft && op.state !== s.draft; }));
        ui.refresh('flows');
        return;
      }
      saveOps([{ op: 'deleteState', state: s.state }]);
    });
  }

  /** Открыть поле названия состояния (после Fix State — с выделенным автоназванием). */
  function openRename(n, select) {
    var hit = runner.byState(n);
    if (!hit) return;
    store.setUi({ flow: hit.flow.id });
    var title = hit.flow.steps[hit.index].title || '';
    editing = { kind: 'state', n: n, value: title, sel: select ? [0, title.length] : [title.length, title.length] };
    ui.refresh('flows');
  }

  /* Клики — делегированием: меню узла при открытии уезжает в скрим шторки. */
  document.addEventListener('click', function (e) {
    var tg = e.target;
    if (!tg.closest || !tg.closest('#pp-drawer')) return;
    var flow = selected();
    if (tg.closest('[data-pp-rec="toggle"]')) { showActs = !showActs; ui.refresh('flows'); return; }
    if (tg.closest('[data-pp-rename-save]')) { commitEdit(); return; }
    if (tg.closest('[data-pp-rename-cancel]')) { editing = null; ui.refresh('flows'); return; }
    var fc = tg.closest('[data-pp-flow-cmd]');
    if (fc) {
      var cmd = fc.getAttribute('data-pp-flow-cmd');
      if (cmd === 'new') newFlow();
      else if (!flow) return;
      else if (cmd === 'start') go(flow, 0);
      else if (cmd === 'stop') runner.stop();
      else if (cmd === 'rename') { editing = { kind: 'flow', id: flow.id, value: flow.title, sel: [0, flow.title.length] }; ui.refresh('flows'); }
      return;
    }
    if (!flow) return;
    var goBtn = tg.closest('[data-pp-go]');
    if (goBtn) { go(flow, +goBtn.getAttribute('data-pp-go')); return; }
    var sc = tg.closest('[data-pp-step-cmd]');
    if (sc && sc.getAttribute('aria-disabled') !== 'true') {
      var scmd = sc.getAttribute('data-pp-step-cmd'), i = +sc.getAttribute('data-pp-i');
      if (scmd === 'copy') { copyStep(flow, i); return; }
      setTimeout(function () {
        if (scmd === 'go') go(flow, i);
        else if (scmd === 'comment') commentStep(flow, i);
        else if (scmd === 'rename' && flow.steps[i]) openRename(flow.steps[i].state, true);
        else if (scmd === 'delete') deleteState(flow, i);
      }, 0);
    }
  });

  function commitEdit() {
    var input = document.querySelector('#pp-drawer [data-pp-rename]');
    if (!editing || !input) return;
    var flow = selected();
    if (editing.kind === 'flow') { if (flow) renameFlow(flow, input.value); return; }
    var hit = runner.byState(editing.n);
    if (hit) renameState(hit.flow, hit.index, input.value);
    else { editing = null; ui.refresh('flows'); }
  }

  /* Значение и выделение поля названия — в editing: перерисовка их восстанавливает. */
  function keep(e) {
    if (!editing || !e.target || !e.target.matches || !e.target.matches('#pp-drawer [data-pp-rename]')) return;
    editing.value = e.target.value;
    editing.sel = [e.target.selectionStart, e.target.selectionEnd];
  }
  ['input', 'select', 'keyup', 'mouseup'].forEach(function (type) { document.addEventListener(type, keep, true); });
  document.addEventListener('keydown', function (e) {
    if (!editing || !e.target || !e.target.matches || !e.target.matches('#pp-drawer [data-pp-rename]')) return;
    if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); editing = null; ui.refresh('flows'); }
  }, true);

  PP._flowsTab = { rename: openRename, selected: selected };
  PP.tab({ id: 'flows', title: t('flows.tab'), render: render, onShow: function () { showActs = false; } });
})();

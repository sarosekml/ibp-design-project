/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — таб «Comments» (tab-comments.js).

   Правки к прототипу с привязкой к странице и состоянию (State NN);
   статусы «открыт / сделан / отклонён» (в интерфейсе — Open / Done /
   Rejected). С подключённой папкой запись идёт в proto-panel/comments.md
   (store.save: прочитать → слить → записать), без неё комментарий —
   черновик в браузере. Комментарий к черновому состоянию (номер ещё не
   выдан) тоже остаётся черновиком до записи схемы: ссылка получает
   выданный номер (задача 0005a, §7.4). Набранный текст и контекст хранятся
   при каждом вводе: шторка закрывается кликом мимо, а текст не теряется.
   Текст комментария показывается безопасным markdown: сначала экранирование
   HTML, потом абзацы, списки, выделение, код и ссылки (только http(s) и
   относительные). Тексты интерфейса — strings.js.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  if (!PP || !PP._ui || !PP._runner) return;
  var store = PP._store, runner = PP._runner, ui = PP._ui, core = window.ProtoPanelCore;
  var ctx = window.__PROTO_PANEL || {};
  var esc = ui.esc;
  var t = PP._strings ? PP._strings.t : function (k) { return k; };
  var FILE = (ctx.dir || 'proto-panel') + '/comments.md';
  var TOOL = 'node .agents/tools/proto-panel.mjs';
  var STATUS_LABEL = { open: 'comments.status.open', done: 'comments.status.done', rejected: 'comments.status.rejected' };
  var editing = null;   // { key, text }
  var saving = false;
  /* номер комментария К-3 — формат файла, строка живёт в strings.js */
  function num(n) { return t('comments.num', { n: n }); }

  /* ---------------- контекст и форма ---------------- */

  function pageNow() {
    var f = location.pathname.split('/').pop();
    try { f = decodeURIComponent(f); } catch (e) { /* как есть */ }
    return f + location.search;
  }
  function fileOf(page) { return page ? String(page).split(/[?#]/)[0] : ''; }

  /* Текущее состояние сценария — ссылка комментария: номер (у чернового — и ref). */
  function autoStep() {
    var c = runner.current();
    if (!c || c.dirty || c.error || !c.state) return null;
    var f = runner.flowById(c.flow);
    var s = f && f.steps[c.index];
    return s && s.draft ? { state: c.state, ref: s.draft } : { state: c.state };
  }
  function form() {
    var f = store.ui().form || {};
    var out = { text: f.text || '', custom: !!f.custom, page: null, step: null };
    /* Контекст зафиксирован при вводе (или выбран человеком) — восстанавливается
       как есть; пересчёт по текущему адресу — только для пустой формы без
       фиксации (ревью 0005, R6). */
    if (f.custom || 'page' in f) { out.page = f.page || null; out.step = f.step || null; }
    else { out.page = pageNow(); out.step = autoStep(); }
    return out;
  }
  function saveForm(patch) {
    /* База — то, что человек видит: зафиксированный контекст или текущий
       автоматический. Первый ввод фиксирует видимые страницу и шаг; снятый чип
       убирает только свой ключ (ревью 0005, R11). */
    var cur = form();
    var next = { text: 'text' in patch ? patch.text : cur.text, custom: 'custom' in patch ? !!patch.custom : cur.custom };
    /* Текст стёрт, а контекст руками не выбирали — фиксация снимается: пустая
       форма снова берёт текущие страницу и шаг. */
    if (!next.custom && !String(next.text).trim()) {
      store.setUi({ form: next.text ? { text: next.text, custom: false } : undefined });
      return;
    }
    next.page = 'page' in patch ? patch.page : cur.page;
    next.step = 'step' in patch ? patch.step : cur.step;
    store.setUi({ form: next });
  }
  function resetForm() { store.setUi({ form: undefined }); }

  /** Контекст из «Comment on state» в табе Flows. */
  function setContext(o) {
    saveForm({ custom: true, page: o.page || null, step: o.step || null });
    ui.refresh('comments');
  }

  /* Ссылка на состояние → { flow, title, name, ok }: по номеру или прежней паре <сценарий>/<шаг>. */
  function stepInfo(step) {
    if (!step) return null;
    if (step.state != null) {
      var hit = runner.byState(step.state);
      var name = core.stateLabel(step.state);
      return hit ? { flow: hit.flow.title, title: hit.flow.steps[hit.index].title, name: name, ok: true, flowId: hit.flow.id, index: hit.index }
        : { flow: '', title: '', name: name, ok: false };
    }
    var f = runner.flowById(step.flow);
    var i = f ? runner.stepIdx(f, step.step) : -1;
    return i >= 0 ? { flow: f.title, title: f.steps[i].title, name: runner.stepName(f, i), ok: true, flowId: f.id, index: i }
      : { flow: '', title: '', name: core.stepRefText(step), ok: false };
  }

  /* ---------------- markdown ---------------- */

  function safeUrl(u) {
    var raw = u.replace(/&amp;/g, '&');
    return /^https?:\/\//i.test(raw) || (!/^[a-z][\w+.-]*:/i.test(raw) && !/^\/\//.test(raw));
  }
  function inline(s) {
    var codes = [];
    s = s.replace(/`([^`]+)`/g, function (m, c) { codes.push('<code class="pp-code">' + c + '</code>'); return '\u0000' + (codes.length - 1) + '\u0000'; });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, text, url) {
      return safeUrl(url) ? '<a class="link link--accent link--inline" href="' + url + '" target="_blank" rel="noopener">' + text + '</a>' : m;
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>');
    return s.replace(/\u0000(\d+)\u0000/g, function (m, i) { return codes[+i]; });
  }
  /** Безопасный markdown: HTML экранирован до разметки. */
  function md(text) {
    var out = [], para = [], list = null, fence = null;
    function flushPara() { if (para.length) { out.push('<p>' + para.map(inline).join('<br>') + '</p>'); para = []; } }
    function flushList() {
      if (!list) return;
      out.push('<' + list.tag + '>' + list.items.map(function (x) { return '<li>' + inline(x) + '</li>'; }).join('') + '</' + list.tag + '>');
      list = null;
    }
    esc(text).split('\n').forEach(function (l) {
      var m;
      if (fence) {
        if (/^(```|~~~)/.test(l)) { out.push('<pre class="pp-pre"><code>' + fence.join('\n') + '</code></pre>'); fence = null; }
        else fence.push(l);
        return;
      }
      if (/^(```|~~~)/.test(l)) { flushPara(); flushList(); fence = []; return; }
      if (!l.trim()) { flushPara(); flushList(); return; }
      if ((m = /^#{1,6}\s+(.*)$/.exec(l))) { flushPara(); flushList(); out.push('<p><strong>' + inline(m[1]) + '</strong></p>'); return; }
      if ((m = /^[-*]\s+(.*)$/.exec(l))) { flushPara(); if (!list || list.tag !== 'ul') { flushList(); list = { tag: 'ul', items: [] }; } list.items.push(m[1]); return; }
      if ((m = /^\d+[.)]\s+(.*)$/.exec(l))) { flushPara(); if (!list || list.tag !== 'ol') { flushList(); list = { tag: 'ol', items: [] }; } list.items.push(m[1]); return; }
      if (list && /^\s{2,}\S/.test(l)) { list.items[list.items.length - 1] += ' ' + l.trim(); return; }
      flushList();
      para.push(l);
    });
    if (fence) out.push('<pre class="pp-pre"><code>' + fence.join('\n') + '</code></pre>');
    flushPara();
    flushList();
    return out.join('');
  }

  /* ---------------- разметка ---------------- */

  function canWrite() {
    var d = store.data();
    var s = store.status();
    return (s === 'linked' || s === 'needs-permission') && !(d && d.commentErrors && d.commentErrors.length);
  }
  function keyOf(c) { return c.draft ? 'd:' + c.draft : 'n:' + c.n; }

  function chip(kind, icon, text, removeLabel) {
    return '<span class="chip chip--edit chip--s" tabindex="0" data-pp-ctx="' + kind + '">'
      + (icon ? '<span class="chip__icon"><i data-icon="' + icon + '"></i></span>' : '')
      + '<span class="chip__label">' + esc(text) + '</span>'
      + '<span class="chip__remove" role="button" aria-label="' + esc(removeLabel) + '"><i data-icon="close"></i></span></span>';
  }

  function newForm(f) {
    var chips = '';
    if (f.page) chips += chip('page', 'file', f.page, t('comments.removePage'));
    if (f.step) {
      var si = stepInfo(f.step);
      chips += chip('step', null, si.ok ? t('comments.stateChip', { state: si.name, title: si.title }) : si.name, t('comments.removeState'));
    }
    if (!chips) chips = '<span class="ds-body-xs pp-muted">' + esc(t('comments.whole')) + '</span>';
    return '<section class="pp-new" aria-label="' + esc(t('comments.new')) + '">'
      + '<div class="inp inp--m inp--multiline inp--fullwidth"><label class="ds-label" for="pp-new-text"><span class="ds-label__text">' + esc(t('comments.new')) + '</span></label>'
      + '<div class="inp__field"><textarea class="inp__control" id="pp-new-text" rows="3" placeholder="' + esc(t('comments.placeholder')) + '" aria-describedby="pp-new-hint">' + esc(f.text) + '</textarea></div></div>'
      + '<div class="pp-new__row"><div class="chiplist chiplist--s pp-new__ctx" role="group" aria-label="' + esc(t('comments.context')) + '">' + chips + '</div>'
      + '<span class="pp-new__add"><button type="button" class="btn btn--accent btn--s" data-pp-c="add"' + (f.text.trim() && !saving ? '' : ' disabled') + '><span class="btn__label">' + esc(t('comments.add')) + '</span></button></span></div>'
      + '<span class="ds-helper ds-helper--left" id="pp-new-hint">' + esc(t('comments.hint')) + '</span>'
      + '</section>';
  }

  function contextLink(c) {
    if (!c.page && !c.step) return '';
    var parts = [];
    if (c.page) parts.push(c.page);
    var gone = false;
    if (c.step) {
      var si = stepInfo(c.step);
      if (si.ok) parts.push(si.flow + ' → ' + t('comments.stateChip', { state: si.name, title: si.title }));
      else { gone = true; if (!c.page) parts.push(si.name); }
    }
    var href = c.page ? new URL(c.page, ctx.pagesUrl).href : '#';
    return '<p class="pp-comment__ctx ds-body-s"><a class="link link--accent link--s" href="' + esc(href) + '" data-pp-c="goto" data-pp-key="' + esc(keyOf(c)) + '">' + esc(parts.join(' · ')) + '</a>'
      + (gone ? '<span class="pp-muted ds-body-xs"> · ' + esc(t('comments.stateGone')) + '</span>' : '') + '</p>';
  }

  function locked(btn) {
    return '<span class="pp-tipwrap" tabindex="0" data-tooltip="' + esc(t('comments.locked')) + '">' + btn + '</span>';
  }

  function card(c) {
    var key = keyOf(c);
    var tone = c.status === 'open' ? ' chip--info' : c.status === 'done' ? ' chip--success' : '';
    var who = [c.created, c.author].filter(Boolean).join(' · ');
    var write = c.draft ? true : canWrite();
    var what = c.draft ? t('comments.draft') : num(c.n);
    var edit = '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="' + esc(t('comments.editAria', { what: what })) + '" data-pp-c="edit" data-pp-key="' + esc(key) + '"'
      + (write ? ' data-tooltip="' + esc(t('comments.edit')) + '"' : ' disabled') + '><i data-icon="edit"></i></button>';
    var menu = '';
    if (!c.draft) {
      var mid = 'pp-cmenu-' + c.n;
      var items = c.status === 'open'
        ? item('status', key, 'done', 'check-circle', t('comments.markDone')) + item('status', key, 'rejected', 'close', t('comments.reject'))
        : item('status', key, 'open', 'refresh', t('comments.reopen'));
      items += '<hr class="menu__divider">' + '<button type="button" class="menu__item menu__item--danger" role="menuitem" data-pp-c="delete" data-pp-key="' + esc(key) + '">'
        + '<span class="menu__item-icon"><i data-icon="trash"></i></span><span class="menu__item-label">' + esc(t('comments.delete')) + '</span></button>';
      var trigger = '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="' + esc(t('comments.menuAria', { what: what })) + '" data-menu="' + mid + '" data-menu-align="end"' + (write ? '' : ' disabled') + '><i data-icon="more-dots"></i></button>';
      menu = '<span class="menu-anchor">' + (write ? trigger : locked(trigger)) + '<div id="' + mid + '" class="menu" role="menu" hidden>' + items + '</div></span>';
    }
    var body = editing && editing.key === key
      ? '<div class="inp inp--m inp--multiline inp--fullwidth"><label class="ds-label" for="pp-edit-text"><span class="ds-label__text">' + esc(t('comments.textLabel')) + '</span></label>'
        + '<div class="inp__field"><textarea class="inp__control" id="pp-edit-text" rows="4">' + esc(editing.text) + '</textarea></div></div>'
        + '<div class="pp-row"><button type="button" class="btn btn--accent btn--s" data-pp-c="save" data-pp-key="' + esc(key) + '"' + (saving ? ' disabled' : '') + '><span class="btn__label">' + esc(t('btn.save')) + '</span></button>'
        + '<button type="button" class="btn btn--transparent btn--s" data-pp-c="cancel"><span class="btn__label">' + esc(t('btn.cancel')) + '</span></button></div>'
      : '<div class="pp-md ds-body-s">' + md(c.body) + '</div>';
    return '<li class="pp-comment' + (c.draft ? ' pp-comment--draft' : '') + '">'
      + '<div class="pp-comment__head">'
      + '<span class="ds-body-s-strong">' + esc(what) + '</span>'
      + '<span class="chip chip--s chip--rounded' + tone + '"><span class="chip__label">' + esc(t(STATUS_LABEL[c.status])) + '</span></span>'
      + (who ? '<span class="ds-body-xs pp-muted pp-comment__who">' + esc(who) + '</span>' : '')
      + '<span class="pp-comment__acts">' + (write ? edit : locked(edit)) + menu + '</span>'
      + '</div>'
      + contextLink(c)
      + body
      + (c.resolution ? '<p class="pp-comment__res ds-body-s"><i data-icon="check-circle"></i><span>' + esc(t('comments.resolution', { text: c.resolution })) + '</span></p>' : '')
      + (c.draft ? '<p class="pp-comment__draft ds-body-xs"><span>' + esc(t('comments.draftNote')) + '</span>'
        + '<button type="button" class="btn btn--transparent btn--xs" data-pp-c="draft-delete" data-pp-key="' + esc(key) + '"><span class="btn__label">' + esc(t('comments.deleteDraft')) + '</span></button></p>' : '')
      + '</li>';
  }
  function item(cmd, key, status, icon, text) {
    return '<button type="button" class="menu__item" role="menuitem" data-pp-c="' + cmd + '" data-pp-key="' + esc(key) + '" data-pp-status="' + status + '">'
      + '<span class="menu__item-icon"><i data-icon="' + icon + '"></i></span><span class="menu__item-label">' + esc(text) + '</span></button>';
  }

  function sorted(list) {
    return list.slice().sort(function (a, b) {
      if (!!a.draft !== !!b.draft) return a.draft ? -1 : 1;
      return (b.n || 0) - (a.n || 0);
    });
  }

  function render(pane, c) {
    c.hideFloating();
    var d = store.data();
    if (!d) { pane.innerHTML = ''; return; }
    var u = store.ui();
    var filter = u.filter === 'all' ? 'all' : 'open';
    var only = !!u.onlyPage;
    var all = store.comments();
    var openCount = all.filter(function (x) { return x.status === 'open'; }).length;
    var here = fileOf(pageNow());
    var shown = sorted(all.filter(function (x) {
      return (filter === 'all' || x.status === 'open') && (!only || fileOf(x.page) === here);
    }));
    var html = newForm(form());
    if (d.commentErrors && d.commentErrors.length) {
      html += '<div class="alert alert--error alert--m" role="alert"><span class="alert__icon" aria-hidden="true"><i data-icon="alert-circle-filled"></i></span>'
        + '<div class="alert__body"><p class="alert__title">' + esc(t('comments.errors.title')) + '</p><p class="alert__text">'
        + d.commentErrors.slice(0, 5).map(esc).join('<br>') + '<br>' + esc(t('comments.errors.text', { tool: TOOL })) + '</p></div></div>';
    }
    html += '<div class="pp-filter">'
      + '<div class="segctrl segctrl--s" role="radiogroup" aria-label="' + esc(t('comments.filter')) + '" data-pp-seg>'
      + '<div class="segctrl__thumb"></div>'
      + '<button type="button" class="segctrl__item" role="radio" aria-checked="' + (filter === 'open') + '" tabindex="' + (filter === 'open' ? 0 : -1) + '" data-pp-filter="open"><span class="segctrl__label">' + esc(t('comments.open')) + '</span><span class="badge badge--text badge--xs">' + openCount + '</span></button>'
      + '<button type="button" class="segctrl__item" role="radio" aria-checked="' + (filter === 'all') + '" tabindex="' + (filter === 'all' ? 0 : -1) + '" data-pp-filter="all"><span class="segctrl__label">' + esc(t('comments.all')) + '</span><span class="badge badge--text badge--xs">' + all.length + '</span></button>'
      + '</div>'
      + '<label class="sw"><input type="checkbox" class="sw__input" role="switch" aria-checked="' + only + '" data-pp-only' + (only ? ' checked' : '') + '>'
      + '<span class="sw__control"><span class="sw__thumb"></span></span><span class="sw__content"><span class="sw__label">' + esc(t('comments.thisPage')) + '</span></span></label>'
      + '</div>';
    if (!all.length) {
      html += '<div class="es es--m pp-empty"><span class="illu es__illu" data-illu="empty-check" aria-hidden="true"></span>'
        + '<div class="es__body"><p class="es__title">' + esc(t('comments.none.title')) + '</p><p class="es__text">' + esc(t('comments.none.text')) + '</p></div></div>';
    } else if (!shown.length) {
      html += '<p class="ds-body-s pp-muted">' + esc(t(only ? 'comments.noneHere' : 'comments.noneOpen') + (filter === 'open' ? t('comments.noneOpenAll') : '')) + '</p>';
    } else {
      html += '<ul class="pp-comments" aria-label="' + esc(t('comments.tab')) + '">' + shown.map(card).join('') + '</ul>';
    }
    pane.innerHTML = html;
    c.wire(pane);
    var seg = pane.querySelector('[data-pp-seg]');
    if (seg && window.DSTabs) {
      window.DSTabs.segment(seg, { onChange: function (i, b) {
        store.setUi({ filter: b.getAttribute('data-pp-filter') });
        setTimeout(function () { ui.refresh('comments'); }, 0);
      } });
    }
    if (editing) {
      var ta = pane.querySelector('#pp-edit-text');
      if (ta) ta.focus();
    }
  }

  /* ---------------- действия ---------------- */

  function find(key) { return store.comments().filter(function (c) { return keyOf(c) === key; })[0] || null; }

  function afterSave(message) { saving = false; ui.refresh('comments'); if (message) ui.toast(message, 'success'); }
  function afterFail(e) {
    saving = false;
    ui.refresh('comments');
    if (e && e.name === 'AbortError') return;
    ui.updateAlert();
  }

  function add() {
    var f = form();
    var text = f.text.trim();
    if (!text || saving) return;
    var page = f.page || null, step = f.step || null;
    /* ссылка на черновое состояние: номер выдаст запись схемы — комментарий ждёт её черновиком */
    if (canWrite() && !(step && step.ref)) {
      saving = true;
      ui.refresh('comments');
      /* Время и автор фиксируются до записи: черновик после сбоя получает ту же
         подпись, и повтор не задвоит комментарий, если запись всё же дошла до
         диска (ревью 0005, R9). */
      var op = { op: 'add', text: text, page: page, step: step, created: core.stamp(), author: store.prefs().author || null };
      store.save([op]).then(function (added) {
        resetForm();
        afterSave(t('comments.saved', { file: FILE, n: num(added[0]) }));
      }, function (e) {
        if (e && e.name !== 'AbortError') { store.addDraft(text, page, step, { created: op.created, author: op.author }); resetForm(); }
        afterFail(e);
      });
      return;
    }
    store.addDraft(text, page, step);
    resetForm();
    ui.refresh('comments');
    ui.toast(t('comments.draftSaved'), 'neutral');
  }

  function saveEdit(key) {
    var ta = document.getElementById('pp-edit-text');
    var text = ta ? ta.value.trim() : '';
    var c = find(key);
    if (!c || !text || saving) return;
    if (c.draft) { store.editDraft(c.draft, text); editing = null; ui.refresh('comments'); return; }
    saving = true;
    store.save([{ op: 'edit', n: c.n, text: text }]).then(function () { editing = null; afterSave(t('comments.updated', { n: num(c.n) })); }, afterFail);
  }

  function setStatus(key, status) {
    var c = find(key);
    if (!c || c.draft || saving) return;
    saving = true;
    store.save([{ op: 'status', n: c.n, status: status }]).then(function () {
      afterSave(t('comments.statusSet', { n: num(c.n), status: t(STATUS_LABEL[status]) }));
    }, afterFail);
  }

  function remove(key) {
    var c = find(key);
    if (!c || c.draft) return;
    ui.confirm({ title: t('comments.delTitle', { n: num(c.n) }), text: t('comments.delText'), ok: t('btn.delete') }).then(function (yes) {
      if (!yes) return;
      saving = true;
      store.save([{ op: 'delete', n: c.n }]).then(function () { afterSave(t('comments.deleted', { n: num(c.n) })); }, afterFail);
    });
  }

  function gotoContext(key) {
    var c = find(key);
    if (!c) return;
    var si = c.step ? stepInfo(c.step) : null;
    if (si && si.ok) {
      runner.goTo(si.flowId, si.index).catch(function (e) { ui.snack({ tone: 'error', title: t('snack.stateNotOpened'), text: e.message }); });
      return;
    }
    if (c.page) location.href = new URL(c.page, ctx.pagesUrl).href;
  }

  function onClick(e) {
    var tg = e.target;
    if (!tg.closest || !tg.closest('#pp-drawer')) return;
    var rm = tg.closest('[data-pp-ctx] .chip__remove');
    if (rm) {
      var kind = rm.closest('[data-pp-ctx]').getAttribute('data-pp-ctx');
      saveForm(kind === 'page' ? { custom: true, page: null } : { custom: true, step: null });
      setTimeout(function () { ui.refresh('comments'); }, 0);
      return;
    }
    var b = tg.closest('[data-pp-c]');
    if (!b || b.disabled) return;
    var cmd = b.getAttribute('data-pp-c'), key = b.getAttribute('data-pp-key');
    if (cmd === 'goto') { e.preventDefault(); gotoContext(key); return; }
    if (cmd === 'add') { add(); return; }
    if (cmd === 'save') { saveEdit(key); return; }
    if (cmd === 'cancel') { editing = null; ui.refresh('comments'); return; }
    if (cmd === 'draft-delete') { var dc = find(key); if (dc) store.removeDraft(dc.draft); return; }
    setTimeout(function () {
      if (cmd === 'edit') { var c = find(key); if (c) { editing = { key: key, text: c.body }; ui.refresh('comments'); } }
      else if (cmd === 'status') setStatus(key, b.getAttribute('data-pp-status'));
      else if (cmd === 'delete') remove(key);
    }, 0);
  }

  function onInput(e) {
    var tg = e.target;
    if (tg.id === 'pp-new-text') {
      saveForm({ text: tg.value });
      var btn = document.querySelector('#pp-drawer [data-pp-c="add"]');
      if (btn) btn.disabled = !tg.value.trim() || saving;
    } else if (tg.id === 'pp-edit-text' && editing) editing.text = tg.value;
  }

  function onKey(e) {
    var tg = e.target;
    if (!tg.closest || !tg.closest('#pp-drawer')) return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (tg.id === 'pp-new-text') { e.preventDefault(); add(); }
      else if (tg.id === 'pp-edit-text' && editing) { e.preventDefault(); saveEdit(editing.key); }
      return;
    }
    if ((e.key === 'Backspace' || e.key === 'Delete') && tg.matches && tg.matches('[data-pp-ctx]')) {
      var kind = tg.getAttribute('data-pp-ctx');
      saveForm(kind === 'page' ? { custom: true, page: null } : { custom: true, step: null });
      setTimeout(function () { ui.refresh('comments'); }, 0);
    }
  }

  function onChange(e) {
    var tg = e.target;
    if (!tg.matches || !tg.matches('#pp-drawer [data-pp-only]')) return;
    tg.setAttribute('aria-checked', String(tg.checked));
    store.setUi({ onlyPage: tg.checked });
    ui.refresh('comments');
  }

  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('keydown', onKey);
  document.addEventListener('change', onChange);

  /* после записи схемы черновой номер в форме получает выданный */
  if (PP._bus) PP._bus.on('flows-saved', function (x) {
    var f = store.ui().form;
    if (!f || !f.step || !f.step.ref || !x || !x.map || !x.map.states[f.step.ref]) return;
    f.step = { state: x.map.states[f.step.ref].to.state };
    store.setUi({ form: f });
  });

  PP._comments = { setContext: setContext, md: md, form: form };

  PP.tab({
    id: 'comments',
    title: t('comments.tab'),
    badge: function () { return store.comments().filter(function (c) { return c.status === 'open'; }).length || null; },
    render: render,
    onShow: function () { editing = null; }
  });
})();

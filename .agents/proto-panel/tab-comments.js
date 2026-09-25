/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — таб «Комментарии» (tab-comments.js).

   Правки к прототипу с привязкой к странице и шагу сценария; статусы
   «открыт / сделан / отклонён». С подключённой папкой запись идёт в
   proto-panel/comments.md (store.save: прочитать → слить → записать), без
   неё комментарий — черновик в браузере. Набранный текст и контекст
   хранятся при каждом вводе: шторка закрывается кликом мимо, а текст не
   теряется. Текст комментария показывается безопасным markdown: сначала
   экранирование HTML, потом абзацы, списки, выделение, код и ссылки
   (только http(s) и относительные).
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  if (!PP || !PP._ui || !PP._runner) return;
  var store = PP._store, runner = PP._runner, ui = PP._ui, core = window.ProtoPanelCore;
  var ctx = window.__PROTO_PANEL || {};
  var esc = ui.esc;
  var FILE = (ctx.dir || 'proto-panel') + '/comments.md';
  var editing = null;   // { key, text }
  var saving = false;

  /* ---------------- контекст и форма ---------------- */

  function pageNow() {
    var f = location.pathname.split('/').pop();
    try { f = decodeURIComponent(f); } catch (e) { /* как есть */ }
    return f + location.search;
  }
  function fileOf(page) { return page ? String(page).split(/[?#]/)[0] : ''; }

  function autoStep() {
    var c = runner.current();
    return c && !c.dirty && !c.error ? { flow: c.flow, step: c.step } : null;
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

  /** Контекст из «Комментировать шаг» в табе «Сценарии». */
  function setContext(o) {
    saveForm({ custom: true, page: o.page || null, step: o.step || null });
    ui.refresh('comments');
  }

  function stepTitle(step) {
    var f = step && runner.flowById(step.flow);
    var i = f ? runner.stepIdx(f, step.step) : -1;
    return i >= 0 ? { flow: f.title, step: f.steps[i].title, ok: true } : { flow: step ? step.flow : '', step: step ? step.step : '', ok: false };
  }

  /* ---------------- markdown ---------------- */

  function safeUrl(u) {
    var raw = u.replace(/&amp;/g, '&');
    return /^https?:\/\//i.test(raw) || (!/^[a-z][\w+.-]*:/i.test(raw) && !/^\/\//.test(raw));
  }
  function inline(s) {
    var codes = [];
    s = s.replace(/`([^`]+)`/g, function (m, c) { codes.push('<code class="pp-code">' + c + '</code>'); return '\u0000' + (codes.length - 1) + '\u0000'; });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, url) {
      return safeUrl(url) ? '<a class="link link--accent link--inline" href="' + url + '" target="_blank" rel="noopener">' + label + '</a>' : m;
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

  function chip(kind, icon, label, removeLabel) {
    return '<span class="chip chip--edit chip--s" tabindex="0" data-pp-ctx="' + kind + '">'
      + (icon ? '<span class="chip__icon"><i data-icon="' + icon + '"></i></span>' : '')
      + '<span class="chip__label">' + esc(label) + '</span>'
      + '<span class="chip__remove" role="button" aria-label="' + esc(removeLabel) + '"><i data-icon="close"></i></span></span>';
  }

  function newForm(f) {
    var chips = '';
    if (f.page) chips += chip('page', 'file', f.page, 'Убрать страницу из контекста');
    if (f.step) { var t = stepTitle(f.step); chips += chip('step', null, 'Шаг: ' + t.step, 'Убрать шаг из контекста'); }
    if (!chips) chips = '<span class="ds-body-xs pp-muted">Ко всему прототипу</span>';
    return '<section class="pp-new" aria-label="Новый комментарий">'
      + '<div class="inp inp--m inp--multiline inp--fullwidth"><label class="ds-label" for="pp-new-text"><span class="ds-label__text">Новый комментарий</span></label>'
      + '<div class="inp__field"><textarea class="inp__control" id="pp-new-text" rows="3" placeholder="Что поправить, что обсудить…" aria-describedby="pp-new-hint">' + esc(f.text) + '</textarea></div></div>'
      + '<div class="pp-new__row"><div class="chiplist chiplist--s pp-new__ctx" role="group" aria-label="Контекст комментария">' + chips + '</div>'
      + '<span class="pp-new__add"><button type="button" class="btn btn--accent btn--s" data-pp-c="add"' + (f.text.trim() && !saving ? '' : ' disabled') + '><span class="btn__label">Добавить</span></button></span></div>'
      + '<span class="ds-helper ds-helper--left" id="pp-new-hint">Ctrl+Enter — добавить</span>'
      + '</section>';
  }

  function contextLink(c) {
    if (!c.page && !c.step) return '';
    var parts = [];
    if (c.page) parts.push(c.page);
    var gone = false;
    if (c.step) {
      var t = stepTitle(c.step);
      if (t.ok) parts.push(t.flow + ' → ' + t.step); else { gone = true; }
    }
    var href = c.page ? new URL(c.page, ctx.pagesUrl).href : '#';
    return '<p class="pp-comment__ctx ds-body-s"><a class="link link--accent link--s" href="' + esc(href) + '" data-pp-c="goto" data-pp-key="' + esc(keyOf(c)) + '">' + esc(parts.join(' · ') || c.step.flow + '/' + c.step.step) + '</a>'
      + (gone ? '<span class="pp-muted ds-body-xs"> · шаг удалён из сценария</span>' : '') + '</p>';
  }

  function locked(btn) {
    return '<span class="pp-tipwrap" tabindex="0" data-tooltip="Подключите папку проекта">' + btn + '</span>';
  }

  function card(c) {
    var key = keyOf(c);
    var tone = c.status === 'open' ? ' chip--info' : c.status === 'done' ? ' chip--success' : '';
    var who = [c.created, c.author].filter(Boolean).join(' · ');
    var write = c.draft ? true : canWrite();
    var edit = '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Изменить ' + (c.draft ? 'черновик' : 'К-' + c.n) + '" data-pp-c="edit" data-pp-key="' + esc(key) + '"'
      + (write ? ' data-tooltip="Изменить"' : ' disabled') + '><i data-icon="edit"></i></button>';
    var menu = '';
    if (!c.draft) {
      var mid = 'pp-cmenu-' + c.n;
      var items = c.status === 'open'
        ? item('status', key, 'done', 'check-circle', 'Отметить сделанным') + item('status', key, 'rejected', 'close', 'Отклонить')
        : item('status', key, 'open', 'refresh', 'Вернуть в открытые');
      items += '<hr class="menu__divider">' + '<button type="button" class="menu__item menu__item--danger" role="menuitem" data-pp-c="delete" data-pp-key="' + esc(key) + '">'
        + '<span class="menu__item-icon"><i data-icon="trash"></i></span><span class="menu__item-label">Удалить</span></button>';
      var trigger = '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Действия с К-' + c.n + '" data-menu="' + mid + '" data-menu-align="end"' + (write ? '' : ' disabled') + '><i data-icon="more-dots"></i></button>';
      menu = '<span class="menu-anchor">' + (write ? trigger : locked(trigger)) + '<div id="' + mid + '" class="menu" role="menu" hidden>' + items + '</div></span>';
    }
    var body = editing && editing.key === key
      ? '<div class="inp inp--m inp--multiline inp--fullwidth"><label class="ds-label" for="pp-edit-text"><span class="ds-label__text">Текст комментария</span></label>'
        + '<div class="inp__field"><textarea class="inp__control" id="pp-edit-text" rows="4">' + esc(editing.text) + '</textarea></div></div>'
        + '<div class="pp-row"><button type="button" class="btn btn--accent btn--s" data-pp-c="save" data-pp-key="' + esc(key) + '"' + (saving ? ' disabled' : '') + '><span class="btn__label">Сохранить</span></button>'
        + '<button type="button" class="btn btn--transparent btn--s" data-pp-c="cancel"><span class="btn__label">Отмена</span></button></div>'
      : '<div class="pp-md ds-body-s">' + md(c.body) + '</div>';
    return '<li class="pp-comment' + (c.draft ? ' pp-comment--draft' : '') + '">'
      + '<div class="pp-comment__head">'
      + '<span class="ds-body-s-strong">' + (c.draft ? 'Черновик' : 'К-' + c.n) + '</span>'
      + '<span class="chip chip--s chip--rounded' + tone + '"><span class="chip__label">' + core.STATUS.label[c.status] + '</span></span>'
      + (who ? '<span class="ds-body-xs pp-muted pp-comment__who">' + esc(who) + '</span>' : '')
      + '<span class="pp-comment__acts">' + (write ? edit : locked(edit)) + menu + '</span>'
      + '</div>'
      + contextLink(c)
      + body
      + (c.resolution ? '<p class="pp-comment__res ds-body-s"><i data-icon="check-circle"></i><span>Решение: ' + esc(c.resolution) + '</span></p>' : '')
      + (c.draft ? '<p class="pp-comment__draft ds-body-xs"><span>не сохранено — черновик в этом браузере</span>'
        + '<button type="button" class="btn btn--transparent btn--xs" data-pp-c="draft-delete" data-pp-key="' + esc(key) + '"><span class="btn__label">Удалить черновик</span></button></p>' : '')
      + '</li>';
  }
  function item(cmd, key, status, icon, label) {
    return '<button type="button" class="menu__item" role="menuitem" data-pp-c="' + cmd + '" data-pp-key="' + esc(key) + '" data-pp-status="' + status + '">'
      + '<span class="menu__item-icon"><i data-icon="' + icon + '"></i></span><span class="menu__item-label">' + esc(label) + '</span></button>';
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
        + '<div class="alert__body"><p class="alert__title">comments.md не по формату — запись остановлена</p><p class="alert__text">'
        + d.commentErrors.slice(0, 5).map(esc).join('<br>') + '<br>Чтобы не затереть файл, новые комментарии остаются черновиками. Исправьте файл и пересоберите: node .agents/tools/proto-panel.mjs</p></div></div>';
    }
    html += '<div class="pp-filter">'
      + '<div class="segctrl segctrl--s" role="radiogroup" aria-label="Какие комментарии показать" data-pp-seg>'
      + '<div class="segctrl__thumb"></div>'
      + '<button type="button" class="segctrl__item" role="radio" aria-checked="' + (filter === 'open') + '" tabindex="' + (filter === 'open' ? 0 : -1) + '" data-pp-filter="open"><span class="segctrl__label">Открытые</span><span class="badge badge--text badge--xs">' + openCount + '</span></button>'
      + '<button type="button" class="segctrl__item" role="radio" aria-checked="' + (filter === 'all') + '" tabindex="' + (filter === 'all' ? 0 : -1) + '" data-pp-filter="all"><span class="segctrl__label">Все</span><span class="badge badge--text badge--xs">' + all.length + '</span></button>'
      + '</div>'
      + '<label class="sw"><input type="checkbox" class="sw__input" role="switch" aria-checked="' + only + '" data-pp-only' + (only ? ' checked' : '') + '>'
      + '<span class="sw__control"><span class="sw__thumb"></span></span><span class="sw__content"><span class="sw__label">Только эта страница</span></span></label>'
      + '</div>';
    if (!all.length) {
      html += '<div class="es es--m pp-empty"><span class="illu es__illu" data-illu="empty-check" aria-hidden="true"></span>'
        + '<div class="es__body"><p class="es__title">Комментариев пока нет</p><p class="es__text">Напишите, что поправить в прототипе, — комментарий сохранится рядом с ним.</p></div></div>';
    } else if (!shown.length) {
      html += '<p class="ds-body-s pp-muted">' + (only ? 'К этой странице' : 'Открытых') + ' комментариев нет' + (filter === 'open' ? ' — остальные на вкладке «Все»' : '') + '.</p>';
    } else {
      html += '<ul class="pp-comments" aria-label="Комментарии">' + shown.map(card).join('') + '</ul>';
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

  function afterSave(msg) { saving = false; ui.refresh('comments'); if (msg) ui.toast(msg, 'success'); }
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
    if (canWrite()) {
      saving = true;
      ui.refresh('comments');
      /* Время и автор фиксируются до записи: черновик после сбоя получает ту же
         подпись, и повтор не задвоит комментарий, если запись всё же дошла до
         диска (ревью 0005, R9). */
      var op = { op: 'add', text: text, page: page, step: step, created: core.stamp(), author: store.prefs().author || null };
      store.save([op]).then(function (added) {
        resetForm();
        afterSave('Сохранено в ' + FILE + ': К-' + added[0]);
      }, function (e) {
        if (e && e.name !== 'AbortError') { store.addDraft(text, page, step, { created: op.created, author: op.author }); resetForm(); }
        afterFail(e);
      });
      return;
    }
    store.addDraft(text, page, step);
    resetForm();
    ui.refresh('comments');
    ui.toast('Черновик сохранён в этом браузере', 'neutral');
  }

  function saveEdit(key) {
    var ta = document.getElementById('pp-edit-text');
    var text = ta ? ta.value.trim() : '';
    var c = find(key);
    if (!c || !text || saving) return;
    if (c.draft) { store.editDraft(c.draft, text); editing = null; ui.refresh('comments'); return; }
    saving = true;
    store.save([{ op: 'edit', n: c.n, text: text }]).then(function () { editing = null; afterSave('К-' + c.n + ' сохранён'); }, afterFail);
  }

  function setStatus(key, status) {
    var c = find(key);
    if (!c || c.draft || saving) return;
    saving = true;
    store.save([{ op: 'status', n: c.n, status: status }]).then(function () {
      afterSave('К-' + c.n + ': ' + core.STATUS.word[status]);
    }, afterFail);
  }

  function remove(key) {
    var c = find(key);
    if (!c || c.draft) return;
    ui.confirm({ title: 'Удалить комментарий К-' + c.n + '?', text: 'Он пропадёт из файла comments.md; прежняя версия останется в истории git.', ok: 'Удалить' }).then(function (yes) {
      if (!yes) return;
      saving = true;
      store.save([{ op: 'delete', n: c.n }]).then(function () { afterSave('К-' + c.n + ' удалён'); }, afterFail);
    });
  }

  function gotoContext(key) {
    var c = find(key);
    if (!c) return;
    var t = c.step ? stepTitle(c.step) : null;
    if (t && t.ok) {
      runner.goTo(c.step.flow, c.step.step).catch(function (e) { ui.snack({ tone: 'error', title: 'Шаг не открыт', text: e.message }); });
      return;
    }
    if (c.page) location.href = new URL(c.page, ctx.pagesUrl).href;
  }

  function onClick(e) {
    var t = e.target;
    if (!t.closest || !t.closest('#pp-drawer')) return;
    var rm = t.closest('[data-pp-ctx] .chip__remove');
    if (rm) {
      var kind = rm.closest('[data-pp-ctx]').getAttribute('data-pp-ctx');
      saveForm(kind === 'page' ? { custom: true, page: null } : { custom: true, step: null });
      setTimeout(function () { ui.refresh('comments'); }, 0);
      return;
    }
    var b = t.closest('[data-pp-c]');
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
    var t = e.target;
    if (t.id === 'pp-new-text') {
      saveForm({ text: t.value });
      var btn = document.querySelector('#pp-drawer [data-pp-c="add"]');
      if (btn) btn.disabled = !t.value.trim() || saving;
    } else if (t.id === 'pp-edit-text' && editing) editing.text = t.value;
  }

  function onKey(e) {
    var t = e.target;
    if (!t.closest || !t.closest('#pp-drawer')) return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (t.id === 'pp-new-text') { e.preventDefault(); add(); }
      else if (t.id === 'pp-edit-text' && editing) { e.preventDefault(); saveEdit(editing.key); }
      return;
    }
    if ((e.key === 'Backspace' || e.key === 'Delete') && t.matches && t.matches('[data-pp-ctx]')) {
      var kind = t.getAttribute('data-pp-ctx');
      saveForm(kind === 'page' ? { custom: true, page: null } : { custom: true, step: null });
      setTimeout(function () { ui.refresh('comments'); }, 0);
    }
  }

  function onChange(e) {
    var t = e.target;
    if (!t.matches || !t.matches('#pp-drawer [data-pp-only]')) return;
    t.setAttribute('aria-checked', String(t.checked));
    store.setUi({ onlyPage: t.checked });
    ui.refresh('comments');
  }

  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('keydown', onKey);
  document.addEventListener('change', onChange);

  PP._comments = { setContext: setContext, md: md, form: form };

  PP.tab({
    id: 'comments',
    title: 'Комментарии',
    badge: function () { return store.comments().filter(function (c) { return c.status === 'open'; }).length || null; },
    render: render,
    onShow: function () { editing = null; }
  });
})();

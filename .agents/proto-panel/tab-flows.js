/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — таб «Сценарии» (tab-flows.js).

   Сценарии показа из flows.yaml (через зеркало): выбор сценария, кнопки
   «С первого шага» и «Выйти из сценария», шаги вертикальной блок-схемой.
   Узел — кнопка перехода к шагу и меню: перейти, скопировать адрес шага,
   комментировать шаг. Состояния узла: текущий, идёт переход, ошибка.
   Соединитель между узлами подписан «↻ страница», если следующий шаг
   открывает страницу заново. Таб регистрируется так же, как будущие табы.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  if (!PP || !PP._ui || !PP._runner) return;
  var store = PP._store, runner = PP._runner, ui = PP._ui;
  var ctx = window.__PROTO_PANEL || {};
  var esc = ui.esc;

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }
  function stepsLabel(n) { return n + ' ' + plural(n, 'шаг', 'шага', 'шагов'); }
  function actionsLabel(n) { return n ? n + ' ' + plural(n, 'действие', 'действия', 'действий') : 'без действий'; }

  function selected() {
    var list = runner.flows();
    var cur = runner.current(), busy = runner.busy();
    var id = store.ui().flow || (busy && busy.flow) || (cur && cur.flow);
    return list.filter(function (f) { return f.id === id; })[0] || list[0] || null;
  }

  function menuItem(cmd, i, icon, label) {
    return '<button type="button" class="menu__item" role="menuitem" data-pp-step-cmd="' + cmd + '" data-pp-i="' + i + '">'
      + '<span class="menu__item-icon"><i data-icon="' + icon + '"></i></span><span class="menu__item-label">' + esc(label) + '</span></button>';
  }

  function node(flow, s, i, st) {
    var cls = 'pp-step' + (st.current ? ' pp-step--current' : '') + (st.error ? ' pp-step--error' : '') + (st.busy ? ' pp-step--busy' : '');
    var num = st.busy
      ? '<span class="spin spin--s spin--accent pp-step__spin" aria-hidden="true"></span>'
      : '<span class="av av--circular av--s pp-step__num" aria-hidden="true"><span class="av__text">' + (i + 1) + '</span></span>';
    var meta = s.page
      ? '<span class="pp-step__meta ds-body-xs"><i data-icon="file"></i><span>' + esc(s.page) + '</span></span>'
      : '<span class="pp-step__meta ds-body-xs">' + actionsLabel(s.do.length) + '</span>';
    var mark = st.current ? '<span class="pp-step__mark ds-body-xs">' + (st.dirty ? 'текущий · изменено' : 'текущий шаг') + '</span>' : '';
    var note = s.note ? '<span class="pp-step__note ds-body-s' + (st.current ? ' pp-step__note--full' : '') + '">' + esc(s.note) + '</span>' : '';
    var err = st.error ? '<span class="pp-step__err ds-body-xs"><i data-icon="alert-triangle"></i><span>' + esc(st.message) + '</span></span>' : '';
    var link = i ? '<div class="pp-link" aria-hidden="true"><span class="pp-link__line"></span><i data-icon="arrow-narrow-down"></i>'
      + (s.page ? '<span class="pp-link__page ds-body-xs">↻ ' + esc(s.page) + '</span>' : '') + '</div>' : '';
    var mid = 'pp-step-menu-' + i;
    return '<li class="' + cls + '"' + (st.current ? ' aria-current="step"' : '') + '>' + link
      + '<div class="pp-step__card">'
      + '<button type="button" class="pp-step__go" data-pp-go="' + i + '" aria-label="Шаг ' + (i + 1) + ': ' + esc(s.title) + (st.current ? ', текущий' : '') + (st.error ? ', ошибка' : '') + '">'
      + num + '<span class="pp-step__main"><span class="pp-step__head"><span class="pp-step__title ds-body-m-strong">' + esc(s.title) + '</span>' + mark + '</span>'
      + meta + note + err + '</span></button>'
      + '<span class="menu-anchor pp-step__menu"><button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Действия шага ' + (i + 1) + '" data-menu="' + mid + '" data-menu-align="end"><i data-icon="more-dots"></i></button>'
      + '<div id="' + mid + '" class="menu" role="menu" hidden>'
      + menuItem('go', i, 'arrow-right', 'Перейти к шагу') + menuItem('copy', i, 'link', 'Скопировать адрес шага') + menuItem('comment', i, 'message-text', 'Комментировать шаг')
      + '</div></span>'
      + '</div></li>';
  }

  function header(list, flow, active) {
    var html = '';
    if (list.length > 1) {
      html += '<div class="inp inp--m inp--fullwidth">'
        + '<label class="ds-label" for="pp-flow-input"><span class="ds-label__text">Сценарий</span></label>'
        + '<div class="inp__field" data-pp-ddl>'
        + '<input class="inp__control" id="pp-flow-input" readonly autocomplete="off" value="' + esc(flow.title) + '">'
        + '<span class="inp__acts"><button type="button" class="inp__act inp__act--chev" aria-label="Показать список сценариев"><i data-icon="chevron-down"></i></button></span>'
        + '</div>'
        + '<div id="pp-flow-list" class="ddl ddl--floating ddl--scroll" role="listbox" aria-label="Сценарии">'
        + list.map(function (f) {
          return '<button type="button" class="ddl__item" role="option" aria-selected="' + (f.id === flow.id) + '" data-pp-flow="' + esc(f.id) + '">'
            + '<span class="ddl__item-body"><span class="ddl__item-label">' + esc(f.title) + '</span><span class="ds-helper">' + stepsLabel(f.steps.length) + '</span></span></button>';
        }).join('')
        + '</div></div>';
    } else {
      html += '<p class="ds-body-l-strong pp-flow__title">' + esc(flow.title) + '</p>';
    }
    if (flow.desc) html += '<p class="ds-body-s pp-muted">' + esc(flow.desc) + '</p>';
    html += '<div class="pp-row">'
      + '<button type="button" class="btn btn--accent btn--s" data-pp-flow-cmd="start"><i data-icon="arrow-right"></i><span class="btn__label">С первого шага</span></button>'
      + (active ? '<button type="button" class="btn btn--transparent btn--s" data-pp-flow-cmd="stop"><span class="btn__label">Выйти из сценария</span></button>' : '')
      + '</div>';
    return html;
  }

  function render(pane, c) {
    c.hideFloating();
    var d = store.data();
    if (!d) { pane.innerHTML = ''; return; }
    if (d.flowErrors && d.flowErrors.length) {
      pane.innerHTML = '<div class="alert alert--error alert--m" role="alert">'
        + '<span class="alert__icon" aria-hidden="true"><i data-icon="alert-circle-filled"></i></span>'
        + '<div class="alert__body"><p class="alert__title">Сценарии не прочитаны</p>'
        + '<p class="alert__text">' + d.flowErrors.slice(0, 5).map(esc).join('<br>')
        + (d.flowErrors.length > 5 ? '<br>…и ещё ' + (d.flowErrors.length - 5) : '')
        + '<br>Исправьте ' + esc(ctx.dir || 'proto-panel') + '/flows.yaml и пересоберите: node .agents/tools/proto-panel.mjs</p></div></div>';
      c.wire(pane);
      return;
    }
    var list = runner.flows();
    if (!list.length) {
      pane.innerHTML = '<div class="es es--m pp-empty">'
        + '<span class="illu es__illu" data-illu="empty-folder" aria-hidden="true"></span>'
        + '<div class="es__body"><p class="es__title">Сценариев пока нет</p>'
        + '<p class="es__text">Сценарии показа описывает агент в ' + esc(ctx.dir || 'proto-panel') + '/flows.yaml — команда /panel ' + esc(d.app && d.app.id || '') + ' flows</p></div></div>';
      c.wire(pane);
      return;
    }
    var flow = selected();
    var cur = runner.current(), busy = runner.busy();
    var active = cur && cur.flow === flow.id ? cur : null;
    var busyHere = busy && busy.flow === flow.id ? busy : null;
    var errIdx = active && active.error ? runner.stepIdx(flow, active.error.step) : -1;
    var items = flow.steps.map(function (s, i) {
      return node(flow, s, i, {
        current: !!active && !busyHere && active.index === i,
        dirty: !!active && active.dirty,
        error: errIdx === i && !busyHere,
        message: errIdx === i ? active.error.message : '',
        busy: !!busyHere && busyHere.to === i
      });
    }).join('');
    pane.innerHTML = '<div class="pp-flow">' + header(list, flow, !!active) + '</div>'
      + '<ol class="pp-chart" aria-label="Шаги сценария «' + esc(flow.title) + '»">' + items + '</ol>';
    c.wire(pane);
    var field = pane.querySelector('[data-pp-ddl]');
    if (field && window.DSDropdownList) {
      window.DSDropdownList.bind(field, {
        list: pane.querySelector('#pp-flow-list'),
        onSelect: function (it) {
          store.setUi({ flow: it.getAttribute('data-pp-flow') });
          setTimeout(function () { ui.refresh('flows'); }, 0);
        }
      });
    }
    var curNode = pane.querySelector('.pp-step--current, .pp-step--error, .pp-step--busy');
    if (curNode && curNode.scrollIntoView) curNode.scrollIntoView({ block: 'nearest' });
  }

  function go(flow, i) {
    store.setUi({ flow: flow.id });
    runner.goTo(flow.id, i).catch(function (e) {
      ui.snack({ tone: 'error', title: 'Шаг не открыт', text: e && e.message || String(e) });
    });
  }

  function copyStep(flow, i) {
    var u = runner.stepUrl(flow.id, i);
    if (!u) return;
    store.copyText(u).then(function () { ui.toast('Адрес шага скопирован', 'success'); }, function (e) {
      ui.snack({ tone: 'error', title: 'Адрес не скопирован', text: e && e.message || String(e) });
    });
  }

  function commentStep(flow, i) {
    var k = runner.entryIdx(flow, i);
    if (PP._comments) PP._comments.setContext({ page: k >= 0 ? flow.steps[k].page : null, step: { flow: flow.id, step: flow.steps[i].id } });
    ui.selectTab('comments');
  }

  /* Клики — делегированием: меню узла при открытии уезжает в скрим шторки. */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('#pp-drawer')) return;
    var flow = selected();
    if (!flow) return;
    var goBtn = t.closest('[data-pp-go]');
    if (goBtn) { go(flow, +goBtn.getAttribute('data-pp-go')); return; }
    var fc = t.closest('[data-pp-flow-cmd]');
    if (fc) {
      if (fc.getAttribute('data-pp-flow-cmd') === 'start') go(flow, 0);
      else runner.stop();
      return;
    }
    var sc = t.closest('[data-pp-step-cmd]');
    if (sc) {
      var cmd = sc.getAttribute('data-pp-step-cmd'), i = +sc.getAttribute('data-pp-i');
      if (cmd === 'copy') { copyStep(flow, i); return; }
      setTimeout(function () { if (cmd === 'go') go(flow, i); else if (cmd === 'comment') commentStep(flow, i); }, 0);
    }
  });

  PP.tab({ id: 'flows', title: 'Сценарии', render: render });
})();

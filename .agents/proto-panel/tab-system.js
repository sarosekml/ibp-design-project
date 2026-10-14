/* ============================================================
   ПАНЕЛЬ ПРОТОТИПА — таб «System» (tab-system.js, MS0016).

   Состояние системы прототипа: переключатели, которые меняют не текущий
   экран, а данные и режим всего прототипа — «сделка заполнена / пустая»,
   «новых лидов 7 / 0», «Было / Стало», «Сбросить демо». Такие служебные
   элементы в интерфейс прототипа не ставятся (правило — скилл proto-panel,
   §9): их объявляет сам прототип, панель только показывает.

   Объявление — глобальная очередь, её можно наполнять до загрузки панели:
     (window.PP_SYSTEM = window.PP_SYSTEM || []).push({
       id: 'new-leads',                     // латиница, цифры, дефис
       title: '…', desc: '…',               // на русском, desc — по желанию
       options: [{ value: '7', label: '…' }, { value: '0', label: '…' }],
       value: function () { return '7'; },  // текущее значение
       set: function (v) { … },             // применить на этой странице
       reload: false                        // true — set уводит со страницы
     });
     … .push({ id: 'reset', title: '…', action: '…', run: function () { … } });

   Вариант (options) — SegmentControl S. Смена человеком — шаг пути: событие
   system-set, рекордер пишет действие system { target: id, value }, и
   сценарий потом ставит то же состояние глаголом system (runner.exec).
   reload: true и действия (action) в сценарий не пишутся: проигрыватель не
   переживает уход со страницы посреди шага. Тексты интерфейса — strings.js.
   ============================================================ */
(function () {
  'use strict';
  var PP = window.ProtoPanel;
  if (!PP || !PP._ui || !PP._runner) return;
  var ui = PP._ui, bus = PP._bus, runner = PP._runner;
  var t = PP._strings ? PP._strings.t : function (k) { return k; };
  var esc = ui.esc;
  var handle = null;

  function list() {
    return (window.PP_SYSTEM || []).filter(function (d) {
      return d && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.id || '') && (d.options && typeof d.set === 'function' || d.action && typeof d.run === 'function');
    });
  }
  function current(d) { try { return String(d.value ? d.value() : ''); } catch (e) { return ''; } }

  function itemHTML(d) {
    var head = '<div class="pp-sys__head"><p class="ds-body-m pp-subtitle">' + esc(d.title || d.id) + '</p>'
      + (d.desc ? '<p class="ds-body-s pp-muted">' + esc(d.desc) + '</p>' : '')
      + (d.reload ? '<p class="ds-body-xs pp-muted">' + esc(t('system.reloads')) + '</p>' : '') + '</div>';
    if (d.action) {
      return '<section class="pp-sys__item">' + head + '<div class="pp-row"><button type="button" class="btn btn--outline btn--s" data-pp-sys-run="' + esc(d.id) + '">'
        + '<span class="btn__label">' + esc(d.action) + '</span></button></div></section>';
    }
    var cur = current(d);
    return '<section class="pp-sys__item">' + head + '<div class="pp-sys__ctrl"><div class="segctrl segctrl--s" data-segctrl role="radiogroup" aria-label="' + esc(d.title || d.id) + '">'
      + '<div class="segctrl__thumb"></div>' + d.options.map(function (o) {
        var on = String(o.value) === cur;
        return '<button type="button" class="segctrl__item" role="radio" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) + '"'
          + ' data-pp-sys="' + esc(d.id) + '" data-pp-sys-value="' + esc(o.value) + '"><span class="segctrl__label">' + esc(o.label) + '</span></button>';
      }).join('') + '</div></div></section>';
  }

  function render(pane, ctx) {
    var defs = list();
    if (!defs.length) {
      pane.innerHTML = '<div class="es es--s pp-empty" role="status"><div class="es__body"><p class="es__title">' + esc(t('system.empty')) + '</p>'
        + '<p class="es__text">' + esc(t('system.emptyHint')) + '</p></div></div>';
      return;
    }
    var choices = defs.filter(function (d) { return d.options; }), acts = defs.filter(function (d) { return d.action; });
    pane.innerHTML = '<div class="pp-sys">'
      + (choices.length ? '<p class="ds-body-s pp-muted">' + esc(t('system.states')) + '</p>' + choices.map(itemHTML).join('') : '')
      + (acts.length ? '<p class="ds-body-s pp-muted">' + esc(t('system.actions')) + '</p>' + acts.map(itemHTML).join('') : '')
      + '</div>';
    ctx.wire(pane);
    /* Сегменты оживляет рантайм ДС (бегунок, стрелки, Home/End); выбор — его onChange. */
    if (window.DSTabs) pane.querySelectorAll('[data-segctrl]').forEach(function (root) {
      window.DSTabs.segment(root, { onChange: function (i, b) { choose(b); } });
    });
    thumbs(pane);
    pane.onclick = function (e) {
      var run = e.target.closest && e.target.closest('[data-pp-sys-run]');
      if (run) { var a = defs.filter(function (d) { return d.id === run.getAttribute('data-pp-sys-run'); })[0]; if (a) a.run(); }
    };
    function choose(b) {
      if (!b || runner.busy()) return;
      var d = defs.filter(function (x) { return x.id === b.getAttribute('data-pp-sys'); })[0];
      var v = b.getAttribute('data-pp-sys-value');
      if (!d || current(d) === v) return;
      var opt = d.options.filter(function (o) { return String(o.value) === v; })[0];
      if (!d.reload) bus.emit('system-set', { id: d.id, value: v, label: (d.title || d.id) + ': ' + (opt ? opt.label : v) });
      Promise.resolve(d.set(v)).then(function () {
        if (!d.reload && handle) handle.refresh();
      }, function (err) { if (ctx.snack) ctx.snack({ tone: 'warning', title: err && err.message || String(err) }); });
    }
  }

  /* Бегунок меряется по видимой разметке: таб мог рисоваться скрытым. */
  function thumbs(pane) {
    if (!window.DSTabs) return;
    requestAnimationFrame(function () { pane.querySelectorAll('[data-segctrl]').forEach(function (r) { window.DSTabs.positionThumb(r); }); });
  }

  /* Смена состояния сценарием — перерисовать таб, если он открыт. */
  bus.on('system', function () { if (handle) handle.refresh(); });

  /* API для консоли и проверки: тот же путь, что у проигрывателя. */
  PP.system = {
    list: list,
    set: function (id, value) {
      var d = runner.systemSwitch(id);
      if (!d || !d.options) return Promise.reject(new Error(t('system.missing', { id: id })));
      return Promise.resolve(d.set(String(value))).then(function () { bus.emit('system', { id: id, value: String(value) }); });
    }
  };
  handle = PP.tab({ id: 'system', title: t('system.tab'), render: render, onShow: function () {
    var pane = document.getElementById('pp-pane-system');
    if (pane) thumbs(pane);
  } });
})();

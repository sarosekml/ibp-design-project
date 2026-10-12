/* ============================================================
   InterestRepaymentOrderModal.js — поведение окна «Порядок погашения».

   Делает то, чего нет в рантаймах ДС, и только это:
   1) рисует список типов задолженности по приоритету (Entity: надзаголовок
      «Приоритет N», подпись типа, стрелки «выше» / «ниже»);
   2) переставляет строку на одно место стрелкой; у первой строки «выше»
      выключена, у последней — «ниже»; фокус остаётся на нажатой стрелке
      переставленной строки (или на соседней, если нажатая выключилась);
   3) разводит режимы окна по оси data-mode: edit — стрелки, «Отменить»
      и «Сохранить»; view — только список и «Закрыть».

   Открытие, фокус, Esc и крестик делают рантаймы ДС. Порядок окно не хранит:
   получает его при открытии, новый отдаёт странице по «Сохранить».

   API:
     PostModalRepaymentOrder.bind(scrim, { labels, save }) → api
       labels()           → { CODE: 'Подпись' } — подписи типов задолженности
       save(order)        — принять новый порядок (коды, первый — приоритет 1)
       api.open(order, mode) — заполнить окно ('edit' | 'view') и открыть
       api.fill(order, mode) — только заполнить (на витрине окно уже на экране)
   ============================================================ */
(function () {
  'use strict';

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function bind(scrim, opts) {
    if (!scrim) return null;
    if (scrim.__repayOrder) return scrim.__repayOrder;
    opts = opts || {};

    var modal = scrim.querySelector('.modal');
    var list = scrim.querySelector('[data-repay-list]');
    var saveBtn = scrim.querySelector('[data-repay-save]');
    var order = [];

    function labelOf(code) { var l = (opts.labels && opts.labels()) || {}; return l[code] || code; }
    function isInline() { return scrim.classList.contains('modal-scrim--inline'); }

    function rowHTML(code, i, n) {
      var name = esc(labelOf(code));
      return '<div class="entity" data-code="' + esc(code) + '">'
        + '<div class="entity__main"><div class="entity__titles"><p class="entity__header">Приоритет ' + (i + 1) + '</p>'
        + '<div class="entity__labelrow"><span class="entity__label">' + name + '</span></div></div></div>'
        + '<div class="entity__actions">'
        + '<button type="button" class="ibtn ibtn--neutral ibtn--s" data-move="up" aria-label="Выше: ' + name + '"' + (i === 0 ? ' disabled' : '') + '><i data-icon="arrow-narrow-up"></i></button>'
        + '<button type="button" class="ibtn ibtn--neutral ibtn--s" data-move="down" aria-label="Ниже: ' + name + '"' + (i === n - 1 ? ' disabled' : '') + '><i data-icon="arrow-narrow-down"></i></button>'
        + '</div></div>';
    }

    function paint() {
      list.innerHTML = order.map(function (c, i) { return rowHTML(c, i, order.length); }).join('');
      if (window.dsIcons) window.dsIcons.apply(list);
    }

    /* Стрелка: строка на одно место выше или ниже, фокус — за строкой */
    list.addEventListener('click', function (e) {
      var b = e.target.closest('[data-move]');
      if (!b || b.disabled) return;
      var row = b.closest('.entity');
      var i = order.indexOf(row.getAttribute('data-code'));
      var dir = b.getAttribute('data-move');
      var j = dir === 'up' ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= order.length) return;
      var t = order[i]; order[i] = order[j]; order[j] = t;
      paint();
      var moved = list.querySelector('.entity[data-code="' + t + '"]');
      var same = moved && moved.querySelector('[data-move="' + dir + '"]');
      var other = moved && moved.querySelector('[data-move="' + (dir === 'up' ? 'down' : 'up') + '"]');
      var target = same && !same.disabled ? same : other;
      if (target) target.focus();
    });

    saveBtn.addEventListener('click', function () {
      if (opts.save) opts.save(order.slice());
      if (!isInline() && window.DSModal) window.DSModal.closeTop();
    });

    function fill(next, mode) {
      order = (next || []).slice();
      modal.setAttribute('data-mode', mode === 'view' ? 'view' : 'edit');
      paint();
    }

    function open(next, mode) {
      fill(next, mode);
      if (window.DSModal) window.DSModal.open(scrim);
    }

    var api = { open: open, fill: fill };
    scrim.__repayOrder = api;
    return api;
  }

  window.PostModalRepaymentOrder = { bind: bind };
})();

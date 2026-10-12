/* ============================================================
   EarlyInterestPaymentsTile.js — вид тайла «Досрочные проценты».

   API:
     PostTileEarlyInterest.render(tile, opts)
       opts.state        — 'locked' | 'none' | 'filled' — вид по данным; раскладывается
                           на оси корня: locked → data-calc="required",
                           none → data-state="empty", filled → data-state="data"
       opts.mode         — 'edit' | 'view' (data-mode, по умолчанию edit): в view
                           нет кнопки «Заполнить»
       opts.payments     — внесённые платежи [{ paymentDate, paymentAmount }] — сводка
                           для filled: число, последняя дата, общая сумма
       opts.currencyCode — валюта инструмента (по умолчанию RUB)
       opts.query        — строка адреса '?id=…&tr=…', которую страница передаёт
                           на страницу «Досрочные проценты» (необязательно)
   ============================================================ */
(function () {
  'use strict';

  var STATES = ['locked', 'none', 'filled'];
  var NBSP = ' ';

  function money(n) {
    var p = Number(n).toFixed(2).split('.');
    return p[0].replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + ',' + p[1];
  }
  function date(iso) { var p = String(iso).split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }
  function set(tile, sel, text) { var el = tile.querySelector(sel); if (el) el.textContent = text; }

  function render(tile, opts) {
    if (!tile) return;
    opts = opts || {};
    var st = STATES.indexOf(opts.state) >= 0 ? opts.state : 'none';
    var q = opts.query || '';
    tile.setAttribute('data-calc', st === 'locked' ? 'required' : 'done');
    if (st !== 'locked') tile.setAttribute('data-state', st === 'filled' ? 'data' : 'empty');
    tile.setAttribute('data-mode', opts.mode === 'view' ? 'view' : 'edit');

    /* сводка: число платежей, самая поздняя дата, общая сумма */
    var list = opts.payments || [];
    var total = 0, last = '';
    list.forEach(function (p) {
      total += Number(p.paymentAmount) || 0;
      if (p.paymentDate > last) last = p.paymentDate;
    });
    set(tile, '[data-ei-count]', String(list.length));
    set(tile, '[data-ei-last]', last ? date(last) : '—');
    set(tile, '[data-ei-total]', money(total));
    set(tile, '[data-ei-currency]', opts.currencyCode || 'RUB');

    /* страница вшивает окна меткой ds-include — по двойному клику её открывают собранной */
    var page = /\.preview\.html$/.test(window.location.pathname) ? 'EarlyInterestPayments.preview.html' : 'EarlyInterestPayments.html';
    var open = tile.querySelector('.lc-early-int__open');
    if (open) open.setAttribute('href', page + q);
    var fill = tile.querySelector('.lc-early-int__fill');
    if (fill) fill.setAttribute('href', page + (q ? q + '&' : '?') + 'open=add');
  }

  window.PostTileEarlyInterest = { render: render };
})();

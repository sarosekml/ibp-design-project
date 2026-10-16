/* ============================================================
   EarlyInterestRepaymentTile.js — вид тайла «Досрочное погашение процентов».

   API:
     PostTileEarlyInterest.render(tile, opts)
       opts.state        — 'locked' | 'none' | 'filled' — вид по данным; раскладывается
                           на оси корня: locked → data-calc="required",
                           none → data-state="empty", filled → data-state="data"
       opts.mode         — 'edit' | 'view' (data-mode, по умолчанию edit): в view
                           нет кнопки «Новый платеж»
       opts.payments     — платежи [{ statusCode, paymentDate, paymentAmount }]; в сводку для
                           filled идут только обработанные (PROCESSED): число, общая сумма,
                           дата и сумма последнего платежа
       opts.currencyCode — валюта инструмента (по умолчанию RUB)
       opts.query        — строка адреса '?id=…&tr=…', которую страница передаёт
                           на страницу «Досрочное погашение процентов» (необязательно)
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

    /* сводка — только обработанные платежи; «В обработке» и «Не обработан» в счёт не идут */
    var list = (opts.payments || []).filter(function (p) { return !p.statusCode || p.statusCode === 'PROCESSED'; });
    /* обработанных платежей нет — вид «Досрочные погашения отсутствуют» (ответ человека 16.10.2026) */
    if (st === 'filled' && !list.length) { st = 'none'; tile.setAttribute('data-state', 'empty'); }
    var total = 0, last = null;
    list.forEach(function (p) {
      total += Number(p.paymentAmount) || 0;
      if (!last || p.paymentDate >= last.paymentDate) last = p;
    });
    set(tile, '[data-ei-count]', String(list.length));
    set(tile, '[data-ei-total]', money(total));
    set(tile, '[data-ei-last]', last ? date(last.paymentDate) : '—');
    set(tile, '[data-ei-last-amount]', last ? money(last.paymentAmount) : '—');
    tile.querySelectorAll('[data-ei-currency]').forEach(function (el) { el.textContent = opts.currencyCode || 'RUB'; });

    /* страница вшивает окна меткой ds-include — по двойному клику её открывают собранной */
    var page = /\.preview\.html$/.test(window.location.pathname) ? 'EarlyInterestPayments.preview.html' : 'EarlyInterestPayments.html';
    /* запрет действия — не только скрытие стилем: у недоступного контрола адреса нет */
    var canOpen = st !== 'locked' && !(st === 'none' && opts.mode === 'view');
    var canAdd = st === 'none' && opts.mode !== 'view';
    var open = tile.querySelector('.lc-early-int__open');
    if (open) { if (canOpen) open.setAttribute('href', page + q); else open.removeAttribute('href'); }
    var fill = tile.querySelector('.lc-early-int__fill');
    if (fill) { if (canAdd) fill.setAttribute('href', page + (q ? q + '&' : '?') + 'open=add'); else fill.removeAttribute('href'); }
  }

  window.PostTileEarlyInterest = { render: render };
})();

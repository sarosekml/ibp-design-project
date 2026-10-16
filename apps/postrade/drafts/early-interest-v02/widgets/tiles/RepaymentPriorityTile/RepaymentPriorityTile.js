/* ============================================================
   RepaymentPriorityTile.js — вид тайла «Приоритет погашения».

   API:
     PostTileRepaymentOrder.render(tile, opts)
       opts.order   — коды видов задолженности по приоритету (первый — приоритет 1)
       opts.labels  — подписи кодов { CODE: 'Подпись' }
       opts.mode    — 'edit' | 'view' (data-mode, по умолчанию edit)
       opts.onOpen  — вызывается по карандашу шапки; окно открывает страница
   Показываются все виды: номер приоритета в квадрате, рядом название.
   ============================================================ */
(function () {
  'use strict';

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function row(i, label) {
    return '<div class="entity entity--s"><div class="entity__lead"><span class="entity__icon entity__icon--neutral lc-repay-order__num" aria-hidden="true">' + (i + 1) + '</span></div>'
      + '<div class="entity__main"><div class="entity__titles"><div class="entity__labelrow"><span class="entity__label">' + esc(label) + '</span></div></div></div></div>';
  }

  function render(tile, opts) {
    if (!tile) return;
    opts = opts || {};
    var order = opts.order || [], labels = opts.labels || {};
    tile.setAttribute('data-mode', opts.mode === 'view' ? 'view' : 'edit');

    var list = tile.querySelector('[data-repay-list]');
    if (list) list.innerHTML = order.map(function (code, i) { return row(i, labels[code] || code); }).join('');

    if (!tile.__repayBound) {
      tile.__repayBound = true;
      tile.addEventListener('click', function (e) {
        if (tile.getAttribute('data-mode') === 'view') return;
        if (e.target.closest('[data-repay-open]') && tile.__repayOpen) tile.__repayOpen();
      });
    }
    tile.__repayOpen = opts.onOpen || null;
  }

  window.PostTileRepaymentOrder = { render: render };
})();

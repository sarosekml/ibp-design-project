/* ============================================================
   InterestRepaymentOrderTile.js — вид тайла «Порядок погашения».

   API:
     PostTileRepaymentOrder.render(tile, opts)
       opts.order   — коды типов задолженности по приоритету (первый — приоритет 1)
       opts.labels  — подписи кодов { CODE: 'Подпись' }
       opts.mode    — 'edit' | 'view' (data-mode, по умолчанию edit)
       opts.onOpen  — вызывается по кнопке шапки (карандаш или «Посмотреть»);
                      окно открывает страница
   Показываются первые три типа; сколько осталось — в подсказке под ними.
   ============================================================ */
(function () {
  'use strict';

  var TOP = 3;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  /* 1 тип, 2–4 типа, 5+ типов */
  function types(n) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return n + ' тип';
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return n + ' типа';
    return n + ' типов';
  }

  function field(i, label) {
    return '<div class="rof"><span class="ds-label"><span class="ds-label__text">Приоритет ' + (i + 1) + '</span></span>'
      + '<div class="rof__row"><span class="rof__value">' + esc(label) + '</span></div></div>';
  }

  function render(tile, opts) {
    if (!tile) return;
    opts = opts || {};
    var order = opts.order || [], labels = opts.labels || {};
    tile.setAttribute('data-mode', opts.mode === 'view' ? 'view' : 'edit');

    var top = tile.querySelector('[data-repay-top]');
    if (top) top.innerHTML = order.slice(0, TOP).map(function (code, i) { return field(i, labels[code] || code); }).join('');

    var rest = Math.max(order.length - TOP, 0);
    var note = tile.querySelector('[data-repay-note]');
    if (note) {
      note.textContent = 'Досрочный платёж сначала гасит задолженность с приоритетом 1, остаток — следующую по порядку.'
        + (rest ? ' Ещё ' + types(rest) + ' задолженности — в окне «Порядок погашения».' : '');
    }

    if (!tile.__repayBound) {
      tile.__repayBound = true;
      tile.addEventListener('click', function (e) {
        if (e.target.closest('[data-repay-open]') && tile.__repayOpen) tile.__repayOpen();
      });
    }
    tile.__repayOpen = opts.onOpen || null;
  }

  window.PostTileRepaymentOrder = { render: render };
})();

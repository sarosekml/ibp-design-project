/* ============================================================
   RsbuInterestAdjustmentsTile.js — вид тайла «Корректировки процентов РСБУ».

   API:
     PostTileRsbuAdjustments.render(tile, opts)
       opts.state  — 'locked' | 'none' | 'filled' — вид по данным; раскладывается
                     на оси корня: locked → data-calc="required",
                     none → data-state="empty", filled → data-state="data"
       opts.mode   — 'edit' | 'view' (data-mode, по умолчанию edit): в view
                     нет кнопки «Внести корректировку»
       opts.count  — число внесённых корректировок (для filled)
       opts.query  — строка адреса '?id=…&tr=…', которую страница передаёт
                     на страницу корректировок (необязательно)
   ============================================================ */
(function () {
  'use strict';

  var STATES = ['locked', 'none', 'filled'];

  function render(tile, opts) {
    if (!tile) return;
    opts = opts || {};
    var st = STATES.indexOf(opts.state) >= 0 ? opts.state : 'none';
    var q = opts.query || '';
    tile.setAttribute('data-calc', st === 'locked' ? 'required' : 'done');
    if (st !== 'locked') tile.setAttribute('data-state', st === 'filled' ? 'data' : 'empty');
    tile.setAttribute('data-mode', opts.mode === 'view' ? 'view' : 'edit');
    var count = tile.querySelector('[data-rsbu-count]');
    if (count) count.textContent = opts.count == null ? '' : String(opts.count);
    /* страница корректировок вшивает окно меткой ds-include — по двойному клику её открывают собранной */
    var page = /\.preview\.html$/.test(window.location.pathname) ? 'RsbuInterestAdjustments.preview.html' : 'RsbuInterestAdjustments.html';
    var open = tile.querySelector('.lc-rsbu-adj__open');
    if (open) open.setAttribute('href', page + q);
    var add = tile.querySelector('.lc-rsbu-adj__add');
    if (add) add.setAttribute('href', page + (q ? q + '&' : '?') + 'open=add');
  }

  window.PostTileRsbuAdjustments = { render: render };
})();

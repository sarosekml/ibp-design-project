/* V2ProductClientTiles — заполнение тайлов «Заёмщик» и «КНР».
   render(host, { product, onDelete }) — продукт (OpportunityProductDto):
   borrower и knr ({name, inn, crmId, kpp, kio, ogrn}); КНР нет — тайл
   скрыт. Корзина зовёт onDelete(key) — страница спрашивает подтверждение
   (Р7). */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function fill(root, key, party) {
    show(root, '[data-pc-tile="' + key + '"]', !!party);
    if (!party) return;
    root.querySelectorAll('[data-pc-' + key + ']').forEach(function (el) {
      var v = party[el.getAttribute('data-pc-' + key)];
      el.textContent = v == null || v === '' ? '–' : v;
    });
  }

  function render(host, opts) {
    var p = opts && opts.product;
    if (!host || !p) return;
    var root = host.classList.contains('lc-product-clients') ? host : host.querySelector('.lc-product-clients') || host;
    fill(root, 'borrower', p.borrower);
    fill(root, 'knr', p.knr);
    root.querySelectorAll('[data-pc-delete]').forEach(function (b) {
      b.onclick = function () { if (opts.onDelete) opts.onDelete(b.getAttribute('data-pc-delete')); };
    });
  }

  window.LcProductClientTiles = { render: render };
})();

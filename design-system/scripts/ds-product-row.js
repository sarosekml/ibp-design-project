/* =========================================================================
   DS ProductRow — рантайм дерева строк (out-of-box).
   Зависимости: styles/product-row.css.

   Экспорт: window.DSProductRow = {
     wire(nodeEl, opts) → api      — оживить один узел дерева
     wireAll(root)                 — обойти .prow-tree__node с кнопкой сворачивания
     toggle(nodeEl, collapsed)     — программно свернуть / развернуть ветку
   }
   api: { el, toggle(v), collapsed() }

   Подключение — разметкой, без атрибутов: любой узел .prow-tree__node, у
   строки которого есть кнопка .prow__toggle, оживает сам.
     <li class="prow-tree__node">
       <div class="prow prow--root">
         <div class="prow__lead">
           <button type="button" class="prow__toggle" aria-expanded="true">
             <i data-icon="chevron-up"></i>
           </button>
         </div>…
       </div>
       <ul class="prow-tree__group">…</ul>
     </li>
   Свёрнутая ветка — класс .prow-tree__node--collapsed на узле (в разметке
   можно задать сразу, рантайм подхватит и выставит aria-expanded).
   Кнопка вне дерева (строка сама по себе) только переключает aria-expanded.
   События: 'prowtoggle' с { collapsed } всплывает с узла (или со строки).
   ========================================================================= */
(function () {
  'use strict';

  var COLLAPSED = 'prow-tree__node--collapsed';

  function ownToggle(node) { return node.querySelector(':scope > .prow .prow__toggle'); }
  function ownGroup(node) { return node.querySelector(':scope > .prow-tree__group'); }
  function collapsed(node) { return node.classList.contains(COLLAPSED); }

  function label(toggle, isCollapsed) {
    toggle.setAttribute('aria-expanded', String(!isCollapsed));
    toggle.setAttribute('aria-label', isCollapsed ? 'Развернуть' : 'Свернуть');
  }

  function apply(node, next) {
    node.classList.toggle(COLLAPSED, next);
    var toggle = ownToggle(node);
    if (toggle) {
      label(toggle, next);
      /* связываем кнопку с веткой, которой она управляет */
      var group = ownGroup(node);
      if (group) {
        if (!group.id) group.id = 'prow-group-' + Math.random().toString(36).slice(2, 8);
        toggle.setAttribute('aria-controls', group.id);
      }
    }
    node.dispatchEvent(new CustomEvent('prowtoggle', { detail: { collapsed: next }, bubbles: true }));
  }

  function wire(node, opts) {
    if (!node || node.__dsProwNode) return node && node.__dsProwNode;
    opts = opts || {};
    if (!ownToggle(node)) return null;
    /* исходное состояние берём из разметки: класс важнее атрибута */
    apply(node, opts.collapsed != null ? opts.collapsed : collapsed(node));
    if (opts.onToggle) node.addEventListener('prowtoggle', function (e) { opts.onToggle(e.detail.collapsed, node); });
    var api = {
      el: node,
      toggle: function (v) { apply(node, v != null ? v : !collapsed(node)); return api; },
      collapsed: function () { return collapsed(node); },
    };
    node.__dsProwNode = api;
    return api;
  }

  function wireAll(root) {
    (root || document).querySelectorAll('.prow-tree__node').forEach(function (n) { wire(n); });
  }

  /* клик обрабатывается делегированием: дерево, перерисованное экраном или
     конструктором, работает без повторной инициализации */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.prow__toggle');
    if (!t || t.disabled || t.getAttribute('aria-disabled') === 'true') return;
    var row = t.closest('.prow');
    var node = row && row.parentElement && row.parentElement.classList.contains('prow-tree__node') ? row.parentElement : null;
    if (node) { apply(node, !collapsed(node)); return; }
    /* строка вне дерева: только состояние кнопки и событие */
    var next = t.getAttribute('aria-expanded') !== 'false';
    label(t, next);
    if (row) row.dispatchEvent(new CustomEvent('prowtoggle', { detail: { collapsed: next }, bubbles: true }));
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { wireAll(document); });
  else wireAll(document);

  window.DSProductRow = {
    wire: wire, wireAll: wireAll,
    toggle: function (node, v) { var a = wire(node); return a && a.toggle(v); },
  };
})();

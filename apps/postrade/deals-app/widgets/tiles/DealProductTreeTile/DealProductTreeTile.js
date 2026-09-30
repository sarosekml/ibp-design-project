/* ============================================================
   DealProductTreeTile.js — дерево продуктов сделки из данных.

   Фрагмент DealProductTreeTile.html держит эталон всех состояний, а дерево в
   нём — пример с макета. Страница сделки рисует дерево своей сделки из
   ProductTreeStore.view(); витрина — этой же функцией, разметка узла одна на
   оба места.

   Правила предметной области (номера, кнопки и меню по типу узла, основной и
   обязательный продукт) живут в сторе дерева — data/product-tree-store.js.
   Здесь только отрисовка и передача действий.

   API:
     PostTileProductTree.treeHTML(view, opts) → строка
       view — ProductTreeNodeView[]; opts.mode — 'edit' | 'view'. В просмотре
       у строк нет кнопок и меню, звезда — знак, а не кнопка.
     PostTileProductTree.stateOf(view) → 'empty' | 'partial' | 'data'
     PostTileProductTree.render(tile, view, opts)
       Перерисовывает дерево и ставит data-state. opts.state — явное
       состояние ('loading' | 'updating'); opts.mode — режим, по умолчанию
       data-mode тайла. Состояния ошибки нет (ответ человека 30.09.2026, 21).
     PostTileProductTree.bind(tile, store) → off()
       Связывает тайл со стором: перерисовка на use и commit; ⊕ у договора
       займа добавляет транш сразу, без окна (ответ человека 30.09.2026, 6).

   Каждое действие уходит событием 'ptreeaction' с корня тайла:
   detail = { action, id, node }. Слушают его окна:
     ADD_DID, ADD у продукта ДИД и у продукта — окна выбора;
     MAIN и DELETE — подтверждение ProductTreeConfirmModal (ответы 9, 20);
     REPAY, UNDO_REPAY — RepaymentModal; MOVE — InstrumentTransferModal;
     ATTACH — LinkChangeModal («Изменить связь с ФИ», ответ 2).
   Заголовок-ссылка ведёт на страницу инструмента или транша — страниц
   пока нет (ответ 4), адрес «#», переход не делается.
   ============================================================ */
(function () {
  'use strict';

  var ROOT = '.lc-deal-products';
  /* дерево с данными — .prow-tree в блоке данных; заготовка загрузки — другое
     дерево, вне этого блока */
  var TREE = '.lc-deal-products__data > .prow-tree';

  var ADD_LABELS = {
    PRODUCT: 'Добавить продукт',
    INSTRUMENT: 'Добавить инструмент',
    TRANCHE: 'Добавить транш'
  };
  var DATE_FIELDS = { signedAt: 1, didEntryAt: 1, didExitAt: 1 };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* id узла — в атрибуте меню: только буквы, цифры, «-» и «_» */
  function menuId(id) { return 'ptree-m-' + String(id).replace(/[^A-Za-z0-9_-]/g, '-'); }

  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? m[3] + '.' + m[2] + '.' + m[1] : '';
  }

  /* 800000 → «800 000,00», разряды — неразрывным пробелом */
  function fmtAmount(n) {
    var parts = Number(n).toFixed(2).split('.');
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ',' + parts[1];
  }

  function detailLabel(field) {
    var map = window.PRODUCT_DETAIL_LABELS || {};
    return map[field] || '';
  }

  /* ── Строка ─────────────────────────────────────────────────────── */

  function actAttrs(action, node) {
    return ' data-ptree-act="' + action + '" data-ptree-id="' + esc(node.id) + '"';
  }

  /* «Фондирование» основным не бывает — звезды у него нет (ответ 11) */
  function markHTML(node, edit) {
    if (!node.canBeMain) return '';
    var glyph = node.isMain ? 'star-filled' : 'star';
    if (edit) {
      return '<button type="button" class="prow__mark" aria-pressed="' + node.isMain + '"'
        + ' aria-label="Основной продукт ДИД"' + actAttrs('MAIN', node) + '>'
        + '<i data-icon="' + glyph + '"></i></button>';
    }
    return node.isMain
      ? '<span class="prow__mark" role="img" aria-label="Основной продукт ДИД"><i data-icon="' + glyph + '"></i></span>'
      : '<span class="prow__mark" aria-hidden="true"><i data-icon="' + glyph + '"></i></span>';
  }

  function titleHTML(node) {
    var text = esc(node.number + ' ' + node.name);
    /* адрес страницы инструмента — не решено (29.09.2026) */
    return node.hasPage === true
      ? '<a class="prow__title prow__title--link" href="#">' + text + '</a>'
      : '<span class="prow__title">' + text + '</span>';
  }

  function statusHTML(node) {
    if (!node.repaidAt) return '';
    return '<div class="prow__status prow__status--success"><i data-icon="check-circle-filled"></i>'
      + '<span class="prow__status-text">' + esc(detailLabel('repaidAt') + ' ' + fmtDate(node.repaidAt)) + '</span></div>';
  }

  function metaItemHTML(d) {
    var date = DATE_FIELDS[d.field] === 1;
    var text;
    if (d.value == null || d.value === '') text = '–';
    else if (date) text = esc(fmtDate(d.value));
    else text = esc(fmtAmount(d.value)) + (d.currency ? ' <span class="prow__meta-affix">' + esc(d.currency) + '</span>' : '');
    return '<span class="prow__meta-item" data-tooltip="' + esc(detailLabel(d.field)) + '">'
      + '<i data-icon="' + (date ? 'calendar' : 'bar-chart-square') + '"></i>'
      + '<span class="prow__meta-text">' + text + '</span></span>';
  }

  function metaHTML(node) {
    if (!node.details || !node.details.length) return '';
    return '<div class="prow__meta">' + node.details.map(metaItemHTML).join('') + '</div>';
  }

  function ibtnHTML(action, node, glyph, label) {
    return '<button type="button" class="ibtn ibtn--neutral ibtn--l" aria-label="' + esc(label) + '"'
      + ' data-tooltip="' + esc(label) + '"' + actAttrs(action, node) + '><i data-icon="' + glyph + '"></i></button>';
  }

  function menuHTML(node) {
    if (!node.menu || !node.menu.length) return '';
    var id = menuId(node.id);
    var items = node.menu.map(function (m) {
      return '<button type="button" class="menu__item" role="menuitem"'
        + (m.disabled ? ' aria-disabled="true"' : '') + actAttrs(m.action, node) + '>'
        + '<span class="menu__item-label">' + esc(m.label) + '</span></button>';
    }).join('');
    return '<span class="menu-anchor"><button type="button" class="ibtn ibtn--neutral ibtn--l" aria-label="Действия"'
      + ' data-menu="' + id + '" data-menu-align="end"><i data-icon="more-dots"></i></button>'
      + '<div id="' + id + '" class="menu menu--floating" role="menu" hidden>' + items + '</div></span>';
  }

  function actionsHTML(node) {
    var s = '';
    if (node.canAttachToFi === true) s += ibtnHTML('ATTACH', node, 'arrow-left-right', 'Изменить связь с ФИ');
    if (node.add) s += ibtnHTML('ADD', node, 'add-circle', ADD_LABELS[node.add] || 'Добавить');
    s += menuHTML(node);
    return s ? '<div class="prow__actions">' + s + '</div>' : '';
  }

  function rowHTML(node, edit) {
    var root = node.kind === 'DID';
    var cls = 'prow' + (root ? ' prow--root' : '') + ((node.fiIds || []).length ? ' prow--tinted' : '');
    var lead = root
      ? '<div class="prow__lead"><button type="button" class="prow__toggle" aria-expanded="true" aria-label="Свернуть"><i data-icon="chevron-up"></i></button></div>'
      : '';
    return '<div class="' + cls + '">' + lead
      + '<div class="prow__main"><div class="prow__head">' + titleHTML(node) + (root ? markHTML(node, edit) : '') + '</div>'
      + statusHTML(node) + metaHTML(node) + '</div>'
      + (edit ? actionsHTML(node) : '') + '</div>';
  }

  function nodeHTML(node, edit) {
    var kids = node.children || [];
    return '<li class="prow-tree__node" data-ptree-id="' + esc(node.id) + '">' + rowHTML(node, edit)
      + (kids.length ? '<ul class="prow-tree__group">' + kids.map(function (k) { return nodeHTML(k, edit); }).join('') + '</ul>' : '')
      + '</li>';
  }

  function treeHTML(view, opts) {
    var edit = !opts || opts.mode !== 'view';
    return '<ul class="prow-tree">'
      + (view || []).map(function (n) { return nodeHTML(n, edit); }).join('') + '</ul>';
  }

  function stateOf(view) {
    if (!view || !view.length) return 'empty';
    var partial = false;
    (function scan(list) {
      list.forEach(function (n) {
        (n.details || []).forEach(function (d) { if (d.value == null || d.value === '') partial = true; });
        scan(n.children || []);
      });
    })(view);
    return partial ? 'partial' : 'data';
  }

  /* ── Отрисовка ──────────────────────────────────────────────────── */

  function collapsedOf(tile) {
    if (!tile.__ptreeCollapsed) {
      tile.__ptreeCollapsed = {};
      /* свёрнутые ветки переживают перерисовку, пока открыта страница */
      tile.addEventListener('prowtoggle', function (e) {
        var node = e.target.closest && e.target.closest('.prow-tree__node');
        var id = node && node.getAttribute('data-ptree-id');
        if (id) tile.__ptreeCollapsed[id] = !!(e.detail && e.detail.collapsed);
      });
    }
    return tile.__ptreeCollapsed;
  }

  function render(tile, view, opts) {
    if (!tile) return;
    opts = opts || {};
    var mode = opts.mode || tile.getAttribute('data-mode') || 'edit';
    var collapsed = collapsedOf(tile);

    /* меню открытого узла и тултип под курсором уходят вместе со старым деревом */
    if (window.DSMenu) window.DSMenu.closeAll();
    if (window.DSTooltip) window.DSTooltip.hideAll();

    var old = tile.querySelector(TREE);
    if (old) old.outerHTML = treeHTML(view, { mode: mode });

    tile.setAttribute('data-mode', mode);
    tile.setAttribute('data-state', opts.state || stateOf(view));

    if (window.dsIcons) window.dsIcons.apply(tile);
    if (window.DSMenu) window.DSMenu.bindAll(tile);
    if (window.DSModal) window.DSModal.bindAll(tile);
    if (window.DSTooltip) window.DSTooltip.bindAll(tile);
    if (window.DSProductRow) {
      tile.querySelectorAll(TREE + ' .prow-tree__node').forEach(function (n) {
        if (collapsed[n.getAttribute('data-ptree-id')]) window.DSProductRow.toggle(n, true);
      });
    }
  }

  /* ── Действия ───────────────────────────────────────────────────── */

  function emit(tile, action, id, node) {
    tile.dispatchEvent(new CustomEvent('ptreeaction', {
      bubbles: true, detail: { action: action, id: id || null, node: node || null }
    }));
  }

  function bind(tile, store) {
    if (!tile || !store) return function () {};
    var paint = function () { render(tile, store.view()); };
    var offChange = store.on('change', function (d) { if (d.reason === 'use') paint(); });
    var offCommit = store.on('commit', paint);

    tile.__ptreeAct = function (action, id) {
      var node = id ? store.node(id) : null;
      /* транш — сразу, без окна; данных у него ещё нет, вторая строка в
         прочерках (ответы 5, 6) */
      if (action === 'ADD' && node && node.add === 'TRANCHE') {
        if (store.addTranche(id)) store.commit();
        return;
      }
      emit(tile, action, id, node);
    };
    paint();
    return function off() { offChange(); offCommit(); tile.__ptreeAct = null; };
  }

  /* Один слушатель на документ. Кнопки строк и шапки лежат в тайле, а пункты
     меню открытого узла рантайм держит в общем слое DSFloat, вне тайла: их
     тайл восстанавливается по кнопке-триггеру меню, а не по цели клика (Л88). */
  function ownerOf(el) {
    var menu = el.closest('.menu');
    if (menu && menu.id) {
      var trigger = document.querySelector('[data-menu="' + menu.id + '"]');
      return trigger ? trigger.closest(ROOT) : null;
    }
    return el.closest(ROOT);
  }

  document.addEventListener('click', function (e) {
    /* страниц инструментов пока нет — ссылка «#» никуда не ведёт */
    var link = e.target.closest && e.target.closest(ROOT + ' .prow__title--link[href="#"]');
    if (link) e.preventDefault();
    var el = e.target.closest && e.target.closest('[data-ptree-act]');
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    var tile = ownerOf(el);
    if (!tile) return;
    var action = el.getAttribute('data-ptree-act');
    var id = el.getAttribute('data-ptree-id');
    if (tile.__ptreeAct) tile.__ptreeAct(action, id);
    else emit(tile, action, id, null);
  });

  window.PostTileProductTree = { treeHTML: treeHTML, stateOf: stateOf, render: render, bind: bind };
})();

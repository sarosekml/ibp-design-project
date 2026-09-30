/* ============================================================
   ProductsModal.js — окна выбора дерева продуктов сделки.

   Два слоя в одном файле:
   1) PostProductPicker — общая логика окна «доступно / выбрано», на ней
      стоят все три окна тайла «Продукты сделки»: «Продукты ДИД»
      (DidProductsModal.js), «Продукты» (этот файл, ниже) и «Инструменты»
      (InstrumentsModal.js). Одно правило — один владелец: перенос,
      черновик, номера, подтверждение, состояния и отрисовка строк живут
      здесь, окна задают только списки и что делает перенос;
   2) окно «Продукты» — продукты одного продукта ДИД, заголовок
      «N. <продукт ДИД>».

   Что делает общий слой (и только это — открытие, фокус, Esc, подсказки
   делают рантаймы ДС):
   – строки обеих колонок — ProductRow ДС: название, ⓘ с описанием в
     подсказке и ⇄ «Переместить»; описаний пока нет — в подсказке заглушка,
     подпись кнопки (ответ человека 30.09.2026, 27);
   – номер у строки «Выбрано» — только у того, что было сохранено до
     открытия окна: номер — место в дереве сделки, у добавленного в окне он
     появится после «Сохранить» (ответ 24). Слева — каталог, без номеров;
   – перенос строки в соседнюю колонку — кнопкой ⇄ или двойным кликом;
     выключенная строка (aria-disabled) не переносится. Убрать из «Выбрано»
     сохранённое (с номером) — через подтверждение ProductTreeConfirmModal,
     несохранённое — сразу (ответы 20, 25);
   – черновик: окно открылось — стор запоминает дерево (begin), «Сохранить»
     сохраняет (commit), крестик, Esc и подложка возвращают дерево как было
     (rollback);
   – состояние данных окна (data-state на .modal): data | loading |
     updating. Отрисовка ставит data; остальные ставит тот, кто грузит и
     сохраняет (в прототипе стор отвечает сразу, поэтому они не наступают —
     их показывает витрина). updating переводится в классы ДС:
     .modal--saving на окне и .btn--loading на «Сохранить». Ошибки и
     «нечего выбрать» нет (ответ 27).

   Данные — ProductTreeStore (data/product-tree-store.js): списки, правила
   «можно ли убрать», нумерация и черновик — там, здесь не дублируются.

   API:
     PostProductPicker.rowHTML(item, cfg) → строка
       item = { key, name, number, description, main, disabled };
       cfg.infoLabel — подпись ⓘ, cfg.markLabel — подпись звезды,
       cfg.numbered — ключи строк, которые показываются с номером.
     PostProductPicker.bind(scrim, cfg) → { open(), repaint(), use(), root }
       cfg.available() / cfg.selected() → item[]; cfg.add(key),
       cfg.remove(key); cfg.ready() → есть ли что рисовать; cfg.onStart() —
       перед черновиком; cfg.title() → заголовок окна. Ключ строки
       «Выбрано» — id узла дерева.
     PostProductPicker.mirror(scrim) — классы ДС по data-state окна
       (updating); связанное окно зовёт само, копии витрины — явно.
     PostModalProducts.open(didId)  — открыть окно для продукта ДИД
     PostModalProducts.use(didId)   — нарисовать без открытия (витрина)

   Окно «Продукты» открывает событие тайла 'ptreeaction' с action ADD у
   продукта ДИД (DealProductTreeTile.js).
   ============================================================ */
(function () {
  'use strict';

  var MOVE_LABEL = 'Переместить';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function store() { return window.ProductTreeStore; }

  /* ── Строка колонки ─────────────────────────────────────────────── */
  /* Выключенная строка — состояние ProductRow: aria-disabled на строке и
     disabled на её кнопках. Звезда — знак, а не кнопка: основной продукт
     назначают на странице сделки (ответ человека 30.09.2026, 9). */
  function rowHTML(item, cfg) {
    cfg = cfg || {};
    var off = item.disabled === true;
    var dis = off ? ' disabled' : '';
    var info = cfg.infoLabel || 'Описание';
    var numbered = cfg.numbered && item.number && cfg.numbered[item.key];
    var title = numbered ? item.number + ' ' + item.name : item.name;
    var mark = item.main
      ? '<span class="prow__mark" role="img" aria-label="' + esc(cfg.markLabel || 'Основная строка') + '"><i data-icon="star-filled"></i></span>'
      : '';
    return '<div class="prow"' + (off ? ' aria-disabled="true"' : '') + ' data-prodpick-key="' + esc(item.key) + '">'
      + '<div class="prow__main"><div class="prow__head"><span class="prow__title">' + esc(title) + '</span>' + mark + '</div></div>'
      + '<div class="prow__actions">'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--l" aria-label="' + esc(info) + '"'
      + ' data-tooltip="' + esc(item.description || info) + '"' + dis + '><i data-icon="info-circle"></i></button>'
      + '<button type="button" class="ibtn ibtn--neutral ibtn--l" aria-label="' + MOVE_LABEL + '"'
      + ' data-tooltip="' + MOVE_LABEL + '" data-prodpick-move' + dis + '><i data-icon="arrow-left-right"></i></button>'
      + '</div></div>';
  }

  /* ── Сохранение идёт ────────────────────────────────────────────── */
  /* updating → классы ДС: тело окна приглушено, «Сохранить» с индикатором.
     Состояние ставит тот, кто сохраняет (или витрина); окно, связанное
     bind, зовёт это само, копии витрины — через PostProductPicker.mirror. */
  function mirror(scrim) {
    var root = scrim && scrim.querySelector('.lc-prodpick');
    if (!root) return;
    var busy = root.getAttribute('data-state') === 'updating';
    root.classList.toggle('modal--saving', busy);
    var save = scrim.querySelector('[data-prodpick-save]');
    if (!save) return;
    save.classList.toggle('btn--loading', busy);
    save.disabled = busy;
    if (busy) save.setAttribute('aria-busy', 'true'); else save.removeAttribute('aria-busy');
    var spin = save.querySelector('.spin');
    if (busy && !spin) save.insertAdjacentHTML('afterbegin', '<span class="spin spin--current"></span>');
    if (!busy && spin) spin.parentNode.removeChild(spin);
  }

  /* ── Окно ───────────────────────────────────────────────────────── */

  function bind(scrim, cfg) {
    if (!scrim) return null;
    var root = scrim.querySelector('.lc-prodpick');
    var lists = {
      available: scrim.querySelector('[data-prodpick-list="available"]'),
      selected: scrim.querySelector('[data-prodpick-list="selected"]')
    };
    var save = scrim.querySelector('[data-prodpick-save]');
    var drafting = false;
    var saving = false;
    var focus = null;   /* куда вернуть фокус после переноса: { side, key, index } */
    var known = {};     /* узлы «Выбрано», сохранённые до открытия окна */

    function inline() { return scrim.classList.contains('modal-scrim--inline'); }

    function rowsOf(list) {
      return list ? Array.prototype.slice.call(list.querySelectorAll('.prow')) : [];
    }

    function fill(list, items) {
      if (!list) return;
      var opts = { infoLabel: cfg.infoLabel, markLabel: cfg.markLabel, numbered: known };
      rowsOf(list).forEach(function (el) { el.parentNode.removeChild(el); });
      list.insertAdjacentHTML('beforeend', items.map(function (it) { return rowHTML(it, opts); }).join(''));
    }

    /* Что сохранено сейчас — строки «Выбрано» до правок окна. */
    function remember() {
      known = {};
      if (!store() || (cfg.ready && !cfg.ready())) return;
      cfg.selected().forEach(function (it) { known[it.key] = true; });
    }

    /* После переноса фокус остаётся у той же строки (левая колонка не
       убывает), а если строки больше нет — у соседней на её месте. */
    function restoreFocus() {
      var f = focus;
      focus = null;
      if (!f) return;
      var rows = rowsOf(lists[f.side]);
      var row = rows.filter(function (r) { return r.getAttribute('data-prodpick-key') === f.key; })[0]
        || rows[Math.min(f.index, rows.length - 1)];
      var btn = row && row.querySelector('[data-prodpick-move]:not([disabled])');
      if (!btn) btn = save;
      if (btn && btn.focus) btn.focus();
    }

    function repaint() {
      if (!store() || (cfg.ready && !cfg.ready())) return;
      /* подсказка кнопки, которую уберёт перерисовка, иначе осталась бы висеть */
      if (window.DSTooltip) window.DSTooltip.hideAll();
      fill(lists.available, cfg.available());
      fill(lists.selected, cfg.selected());
      if (cfg.title) {
        var t = scrim.querySelector('.modal__title');
        if (t) t.textContent = cfg.title();
      }
      if (root) root.setAttribute('data-state', 'data');
      if (window.dsIcons) window.dsIcons.apply(scrim);
      if (window.DSTooltip) window.DSTooltip.bindAll(scrim);
      restoreFocus();
    }

    /* ── Перенос ── */
    function move(row) {
      var list = row.closest('[data-prodpick-list]');
      if (!list || !store() || row.getAttribute('aria-disabled') === 'true') return;
      var side = list.getAttribute('data-prodpick-list');
      var key = row.getAttribute('data-prodpick-key');
      focus = { side: side, key: key, index: rowsOf(list).indexOf(row) };
      if (side === 'available') { cfg.add(key); return; }
      var Confirm = window.PostProductTreeConfirm;
      if (!known[key] || !Confirm) { cfg.remove(key); return; }
      /* сохранённое — с подтверждением; удаление остаётся в черновике окна */
      Confirm.ask({
        variant: 'delete',
        text: Confirm.deleteText(store().node(key)),
        onOk: function () { cfg.remove(key); },
        onCancel: function () { focus = null; }
      });
    }

    scrim.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-prodpick-move]');
      if (!btn || btn.disabled) return;
      var row = btn.closest('.prow');
      if (row) move(row);
    });

    /* Двойной клик по строке — то же, что ⇄. Не срабатывает на кнопках
       строки. Выделение текста, которое оставил двойной клик, снимается:
       строка уже в другой колонке. */
    scrim.addEventListener('dblclick', function (e) {
      var row = e.target.closest('[data-prodpick-list] .prow');
      if (!row || e.target.closest('button')) return;
      var sel = window.getSelection && window.getSelection();
      if (sel && sel.removeAllRanges) sel.removeAllRanges();
      move(row);
    });

    /* ── Черновик и «Сохранить» ── */
    /* Слушатель «Сохранить» стоит на скриме и срабатывает раньше глобального
       закрытия ds-modal.js (кнопка несёт data-modal-close). Окно, показанное
       статично (витрина), не открывается и не закрывается — черновика у него
       нет. */
    function start() {
      if (drafting || !store()) return;
      drafting = true;
      saving = false;
      if (cfg.onStart) cfg.onStart();
      remember();
      store().begin();
      repaint();
    }

    function finish() {
      if (!drafting) return;
      drafting = false;
      if (!saving && store()) store().rollback();
      saving = false;
    }

    new MutationObserver(function () {
      if (inline()) return;
      if (scrim.hidden) finish(); else start();
    }).observe(scrim, { attributes: true, attributeFilter: ['hidden'] });

    scrim.addEventListener('click', function (e) {
      if (!e.target.closest('[data-prodpick-save]') || !store()) return;
      saving = true;
      store().commit();
    });

    /* Сохранение идёт — классы ДС (mirror выше) следом за data-state. */
    if (root) new MutationObserver(function () { mirror(scrim); }).observe(root, { attributes: true, attributeFilter: ['data-state'] });
    mirror(scrim);

    /* Перерисовка по событию стора: перенос, откат черновика, смена сделки. */
    if (store()) {
      store().on('change', function () { if (drafting || inline()) repaint(); });
    }

    /* Возврат фокуса. Рантайм ДС возвращает его на кнопку, открывшую окно,
       но после «Сохранить» тайл перерисован и этой кнопки уже нет. Тогда
       фокус встаёт на её двойника в новой разметке — кнопку с теми же
       data-атрибутами (тот же узел, то же действие). */
    var opener = null;

    function twinOf(el) {
      var sel = Array.prototype.filter.call(el.attributes, function (a) { return a.name.indexOf('data-') === 0; })
        .map(function (a) { return '[' + a.name + '="' + a.value.replace(/["\\]/g, '\\$&') + '"]'; }).join('');
      return sel ? document.querySelector(el.tagName.toLowerCase() + sel) : null;
    }

    function refocus() {
      var el = opener;
      opener = null;
      if (!el || document.contains(el)) return;
      var twin = twinOf(el);
      if (twin && twin.focus) twin.focus();
    }

    /* Программное открытие: черновик и списки — до открытия, чтобы начальный
       фокус рантайма встал уже на свежие строки. */
    function open() {
      opener = document.activeElement;
      start();
      if (window.DSModal && !inline()) window.DSModal.open(scrim, { onClose: refocus });
    }

    /* Витрина: нарисовать без открытия и без черновика; всё выбранное —
       сохранённое, с номерами. */
    function use() {
      if (cfg.onStart) cfg.onStart();
      remember();
      repaint();
    }

    return { open: open, repaint: repaint, use: use, root: root };
  }

  window.PostProductPicker = { rowHTML: rowHTML, bind: bind, mirror: mirror };

  /* ── Окно «Продукты» ────────────────────────────────────────────── */

  var scrim = document.getElementById('ptree-products-scrim');
  if (!scrim) return;

  var didId = null;

  function descOf(code) {
    var hit = (window.PRODUCT_CATALOG || []).filter(function (p) { return p.code === code; })[0];
    return hit ? hit.description : null;
  }

  function didNode() { return didId && store() ? store().node(didId) : null; }

  var picker = bind(scrim, {
    infoLabel: 'Описание продукта',
    ready: function () { return !!didNode(); },
    title: function () {
      var n = didNode();
      return n ? n.number + ' ' + n.name : '';
    },
    available: function () {
      return store().availableProducts(didId).map(function (p) {
        return { key: p.code, name: p.name, description: p.description };
      });
    },
    selected: function () {
      var n = didNode();
      return (n ? n.children : []).map(function (c) {
        return {
          key: c.id, name: c.name, number: c.number,
          description: descOf(c.code),
          disabled: !store().canRemove(c.id)
        };
      });
    },
    add: function (code) { store().addProduct(didId, code); },
    remove: function (id) { store().remove(id); }
  });

  function open(id) {
    didId = id;
    picker.open();
  }

  function use(id) {
    didId = id;
    picker.use();
  }

  /* ⊕ «Добавить продукт» у продукта ДИД в тайле */
  document.addEventListener('ptreeaction', function (e) {
    var d = e.detail || {};
    if (d.action !== 'ADD' || !store()) return;
    var node = d.node || store().node(d.id);
    if (node && node.kind === 'DID') open(node.id);
  });

  window.PostModalProducts = { open: open, use: use };
})();

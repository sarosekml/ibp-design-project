/* ============================================================
   InstrumentTransferModal.js — окно «Перенос инструмента» (макет «Перенос
   инструмента», 30.09.2026).

   Открывается пунктом «Перенести» в меню инструмента в тайле «Продукты
   сделки» (событие 'ptreeaction', action MOVE). Инструмент переносится в
   другой подходящий продукт этой же сделки — в том числе в продукт другого
   продукта ДИД (ответ человека 30.09.2026, 3).
   – «Откуда» — продукт ДИД и продукт, где инструмент сейчас; продукт
     выключен.
   – «Куда» — все продукты ДИД сделки и их продукты. Текущий продукт и
     продукты, в состав которых тип инструмента не входит, выключены
     (ProductTreeStore.moveTargets; правило — допущение агента, вопрос 41
     задачи RE0001). Выбор — одна строка: радиогруппа, клик или клавиши
     (стрелки, Пробел, Enter); выбранная строка — состояние ProductRow
     «выбрана» (aria-checked).
   – «Сохранить» доступна после выбора: ProductTreeStore.moveInstrument и
     commit, тайл перерисован, номера пересчитаны. Крестик, Esc и подложка —
     без изменений.
   Строки продуктов ДИД сворачиваются шевроном справа (у фронтенда —
   AccordionProductRow): рантайм ProductRow находит кнопку в любом месте
   строки. Состояние «Обновление» (сохранение идёт) — data-state="updating"
   на .modal, его переводит в классы ДС mirror(); в прототипе стор отвечает
   сразу, поэтому его показывает витрина.

   API: PostModalInstrumentTransfer.open(instrumentId) · use(instrumentId) —
        нарисовать без открытия (витрина) · listHTML(targets, section) ·
        mirror(scrim)
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function store() { return window.ProductTreeStore; }

  /* ── Разметка ───────────────────────────────────────────────────── */

  function markHTML(did) {
    if (!did.canBeMain) return '';
    return did.isMain
      ? '<span class="prow__mark" role="img" aria-label="Основной продукт ДИД"><i data-icon="star-filled"></i></span>'
      : '<span class="prow__mark" aria-hidden="true"><i data-icon="star"></i></span>';
  }

  function didHTML(did, rows) {
    return '<li class="prow-tree__node">'
      + '<div class="prow prow--root"><div class="prow__main"><div class="prow__head">'
      + '<span class="prow__title">' + esc(did.number + ' ' + did.name) + '</span>' + markHTML(did) + '</div></div>'
      + '<div class="prow__actions"><button type="button" class="prow__toggle" aria-expanded="true" aria-label="Свернуть"><i data-icon="chevron-up"></i></button></div></div>'
      + '<ul class="prow-tree__group">' + rows + '</ul></li>';
  }

  function productHTML(p, pick) {
    var title = '<div class="prow__main"><div class="prow__head"><span class="prow__title">'
      + esc(p.product.number + ' ' + p.product.name) + '</span></div></div>';
    if (!pick) return '<li class="prow-tree__node"><div class="prow" aria-disabled="true">' + title + '</div></li>';
    var off = p.current || !p.suitable;
    return '<li class="prow-tree__node"><div class="prow" role="radio" aria-checked="false" tabindex="-1"'
      + (off ? ' aria-disabled="true"' : '') + ' data-transfer-product="' + esc(p.product.id) + '">' + title + '</div></li>';
  }

  /* section: 'from' — только продукт ДИД и продукт, где инструмент сейчас;
     'to' — все продукты ДИД и их продукты, строки — радиокнопки. */
  function listHTML(targets, section) {
    return (targets || []).map(function (t) {
      var list = section === 'from'
        ? t.products.filter(function (p) { return p.current; })
        : t.products;
      if (!list.length) return '';
      return didHTML(t.did, list.map(function (p) { return productHTML(p, section !== 'from'); }).join(''));
    }).join('');
  }

  /* Сохранение идёт → классы ДС: тело приглушено, «Сохранить» с индикатором. */
  function mirror(scrim) {
    var root = scrim && scrim.querySelector('.lc-transfer');
    var save = scrim && scrim.querySelector('[data-transfer-save]');
    if (!root || !save) return;
    var busy = root.getAttribute('data-state') === 'updating';
    root.classList.toggle('modal--saving', busy);
    save.classList.toggle('btn--loading', busy);
    if (busy) save.setAttribute('aria-busy', 'true'); else save.removeAttribute('aria-busy');
    var spin = save.querySelector('.spin');
    if (busy && !spin) save.insertAdjacentHTML('afterbegin', '<span class="spin spin--current"></span>');
    if (!busy && spin) spin.parentNode.removeChild(spin);
    if (busy) save.disabled = true;
  }

  window.PostModalInstrumentTransfer = { listHTML: listHTML, mirror: mirror };

  /* ── Окно ───────────────────────────────────────────────────────── */

  var scrim = typeof document !== 'undefined' && document.getElementById('ptree-transfer-scrim');
  if (!scrim) return;
  var root = scrim.querySelector('.lc-transfer');
  var intro = scrim.querySelector('.lc-transfer__text');
  var from = scrim.querySelector('[data-transfer-list="from"]');
  var to = scrim.querySelector('[data-transfer-list="to"]');
  var save = scrim.querySelector('[data-transfer-save]');
  var instrumentId = null;
  var selected = null;

  function radios() {
    return to ? Array.prototype.slice.call(to.querySelectorAll('[role="radio"]')) : [];
  }
  function enabled() {
    return radios().filter(function (r) { return r.getAttribute('aria-disabled') !== 'true'; });
  }

  /* Отметка и табуляция: выбранная строка (или первая доступная) в порядке
     Tab, остальные — стрелками, как у радиогруппы. */
  function sync() {
    var list = enabled();
    radios().forEach(function (r) {
      var on = r.getAttribute('data-transfer-product') === selected;
      r.setAttribute('aria-checked', on ? 'true' : 'false');
      r.setAttribute('tabindex', '-1');
    });
    var active = list.filter(function (r) { return r.getAttribute('data-transfer-product') === selected; })[0] || list[0];
    if (active) active.setAttribute('tabindex', '0');
    if (save && root && root.getAttribute('data-state') !== 'updating') save.disabled = !selected;
  }

  function choose(row, focus) {
    if (!row || row.getAttribute('aria-disabled') === 'true') return;
    selected = row.getAttribute('data-transfer-product');
    sync();
    if (focus) row.focus();
  }

  function paint(id) {
    var S = store();
    var node = S && S.node(id);
    if (!node || node.kind !== 'INSTRUMENT') return false;
    instrumentId = id;
    selected = null;
    var targets = S.moveTargets(id);
    if (intro) intro.textContent = 'Выберите продукт, в который вы хотите переместить ' + node.number + ' ' + node.name;
    if (from) from.innerHTML = listHTML(targets, 'from');
    if (to) to.innerHTML = listHTML(targets, 'to');
    if (root) root.setAttribute('data-state', 'data');
    if (window.dsIcons) window.dsIcons.apply(scrim);
    sync();
    mirror(scrim);
    return true;
  }

  function open(id) {
    if (!paint(id)) return;
    if (window.DSModal && !scrim.classList.contains('modal-scrim--inline')) window.DSModal.open(scrim);
  }

  function use(id) { paint(id); }

  if (to) {
    to.addEventListener('click', function (e) {
      if (e.target.closest('button')) return;
      choose(e.target.closest('[role="radio"]'), false);
    });
    to.addEventListener('keydown', function (e) {
      var row = e.target.closest('[role="radio"]');
      if (!row || e.target !== row) return;
      var list = enabled();
      var i = list.indexOf(row);
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        choose(row, false);
      } else if (list.length && (e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
        e.preventDefault();
        choose(list[(i + 1) % list.length], true);
      } else if (list.length && (e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        choose(list[(i - 1 + list.length) % list.length], true);
      }
    });
  }

  /* «Сохранить» — раньше глобального закрытия ds-modal.js (data-modal-close) */
  scrim.addEventListener('click', function (e) {
    if (!e.target.closest('[data-transfer-save]') || !instrumentId || !selected || !store()) return;
    var S = store();
    if (S.moveInstrument(instrumentId, selected)) S.commit();
    instrumentId = null;
    selected = null;
  });

  if (root) new MutationObserver(function () { mirror(scrim); sync(); }).observe(root, { attributes: true, attributeFilter: ['data-state'] });

  /* «Перенести» в меню инструмента */
  document.addEventListener('ptreeaction', function (e) {
    var d = e.detail || {};
    if (d.action === 'MOVE') open(d.id);
  });

  window.PostModalInstrumentTransfer.open = open;
  window.PostModalInstrumentTransfer.use = use;
  window.PostModalInstrumentTransfer.select = function (productId) {
    var row = radios().filter(function (r) { return r.getAttribute('data-transfer-product') === productId; })[0];
    choose(row, false);
  };
})();

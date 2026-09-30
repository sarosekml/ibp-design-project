/* ============================================================
   ProductTreeConfirmModal.js — подтверждение действия над деревом
   продуктов сделки: удаление узла и назначение основного продукта ДИД.

   Один диалог на всё дерево (Л43, один владелец):
   – тайл «Продукты сделки» отдаёт событие 'ptreeaction' — DELETE у любого
     узла или MAIN у продукта ДИД. Диалог слушает его сам, спрашивает и
     после «Подтвердить» правит стор и сохраняет (commit): удаление и
     назначение основного в тайле сохраняются сразу;
   – окна выбора зовут ask() напрямую, когда из «Выбрано» убирают
     сохранённый узел (с номером): «Подтвердить» убирает его в черновик
     окна (ответы человека 30.09.2026: 20, 25).

   Тексты: удаление продукта ДИД — как на макете окна «Продукты ДИД»;
   назначение основного — ответ человека 30.09.2026 (9); удаление продукта,
   инструмента и транша — допущение агента (вопрос 42 задачи RE0001).

   Диалог поднимается рантаймом ДС вложенным слоем и закрывается первым:
   действие идёт после закрытия, когда окно под ним снова доступно.
   Диалог, показанный статично (витрина, .modal-scrim--inline), не
   открывают, а показывают и прячут атрибутом hidden. Фрагмента на странице
   нет — действие без вопроса (витрина окна без хозяина).

   API: PostProductTreeConfirm.ask({ variant: 'delete' | 'main', text,
          onOk(), onCancel() }) · paint(scrim, { variant, text }) —
          нарисовать без открытия (витрина) · deleteText(node) · mainText(node)
   ============================================================ */
(function () {
  'use strict';

  function store() { return window.ProductTreeStore; }
  function scrim() { return document.getElementById('ptree-confirm-scrim'); }
  function isInline(el) { return el.classList.contains('modal-scrim--inline'); }

  function titleOf(node) { return node.number + ' ' + node.name; }

  function deleteText(node) {
    if (!node) return '';
    var kids = (node.children || []).length > 0;
    if (node.kind === 'DID') return 'Удаление продукта ДИД со всеми продуктами и инструментами';
    if (node.kind === 'PRODUCT') return 'Удаление продукта «' + titleOf(node) + '»' + (kids ? ' со всеми инструментами' : '');
    if (node.kind === 'INSTRUMENT') return 'Удаление инструмента «' + titleOf(node) + '»' + (kids ? ' со всеми траншами' : '');
    return 'Удаление транша «' + titleOf(node) + '»';
  }

  function mainText(node) {
    return node ? 'Назначение продукта «' + titleOf(node) + '» основным в сделке' : '';
  }

  var pending = null;

  function paint(c, opts) {
    var main = opts.variant === 'main';
    var root = c.querySelector('.lc-ptree-confirm');
    if (root) root.setAttribute('data-variant', main ? 'main' : 'delete');
    var title = c.querySelector('.modal__title');
    if (title) title.textContent = main ? 'Подтверждение действия' : 'Подтвердите действие';
    var text = c.querySelector('.lc-ptree-confirm__text');
    if (text) text.textContent = opts.text || '';
    var ok = c.querySelector('[data-ptree-confirm="ok"]');
    if (ok) ok.classList.toggle('btn--error', !main);
  }

  function settle(ok) {
    var p = pending;
    pending = null;
    if (!p) return;
    if (ok) { if (p.onOk) p.onOk(); } else if (p.onCancel) p.onCancel();
  }

  function ask(opts) {
    opts = opts || {};
    var c = scrim();
    if (!c) { if (opts.onOk) opts.onOk(); return; }
    paint(c, opts);
    pending = opts;
    if (isInline(c)) { c.hidden = false; return; }
    if (!window.DSModal) { settle(true); return; }
    window.DSModal.open(c, { nested: true, onClose: function (ok) { settle(!!ok); } });
  }

  document.addEventListener('click', function (e) {
    var c = scrim();
    if (!c || !c.contains(e.target)) return;
    var btn = e.target.closest('[data-ptree-confirm]');
    var ok = !!btn && btn.getAttribute('data-ptree-confirm') === 'ok';
    if (isInline(c)) {
      if (!btn && !e.target.closest('[data-modal-close]')) return;
      c.hidden = true;
      settle(ok);
      return;
    }
    if (btn && window.DSModal) window.DSModal.closeTop(ok);
  });

  /* Тайл: «Удалить» у любого узла и звезда продукта ДИД. Выключенный пункт
     меню (узел прикреплён к ФИ, обязательный и единственный продукт) тайл
     не отдаёт; основной продукт снять нельзя — клик по его звезде ничего не
     делает (ответ 19). */
  document.addEventListener('ptreeaction', function (e) {
    var d = e.detail || {};
    var S = store();
    if (!S || (d.action !== 'DELETE' && d.action !== 'MAIN')) return;
    var node = d.node || S.node(d.id);
    if (!node) return;
    if (d.action === 'DELETE') {
      if (!S.canRemove(node.id)) return;
      ask({ variant: 'delete', text: deleteText(node), onOk: function () { if (S.remove(node.id)) S.commit(); } });
      return;
    }
    if (node.kind !== 'DID' || node.isMain || !node.canBeMain) return;
    ask({ variant: 'main', text: mainText(node), onOk: function () { if (S.setMain(node.id)) S.commit(); } });
  });

  window.PostProductTreeConfirm = { ask: ask, paint: paint, deleteText: deleteText, mainText: mainText };
})();

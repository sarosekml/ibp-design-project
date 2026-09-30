/* ============================================================
   RepaymentModal.js — окно погашения инструмента или транша дерева
   продуктов сделки (макет «Погашение», 30.09.2026).

   Открывается событием тайла 'ptreeaction': REPAY — погашение, UNDO_REPAY —
   отмена погашения. Узел и его номер — из ProductTreeStore.
   – Погашение: дата фактического погашения, по умолчанию сегодня.
     «Подтвердить» — ProductTreeStore.repay(id, дата) и commit: узел гасится
     вместе с вложенными (ответ человека 30.09.2026, 3), в тайле у строк —
     «Фактическая дата погашения ДД.ММ.ГГГГ». Пустая или несуществующая дата
     — «Подтвердить» недоступна (допущение агента, вопрос 43 задачи RE0001).
   – Отмена: ProductTreeStore.undoRepay(id) и commit.
   Крестик, Esc и подложка закрывают окно без изменений.

   Слушатель «Подтвердить» стоит на скриме и срабатывает раньше глобального
   закрытия ds-modal.js (кнопка несёт data-modal-close).

   API: PostModalRepayment.open(nodeId, mode) · use(nodeId, mode) — нарисовать
        без открытия (витрина); mode — 'repay' | 'undo'
   ============================================================ */
(function () {
  'use strict';

  var scrim = document.getElementById('ptree-repay-scrim');
  if (!scrim) return;
  var root = scrim.querySelector('.lc-repay');
  var text = scrim.querySelector('.lc-repay__text');
  var field = scrim.querySelector('.lc-repay__date');
  var control = field && field.querySelector('.inp__control');
  var ok = scrim.querySelector('[data-repay-ok]');
  var target = null;

  function store() { return window.ProductTreeStore; }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() {
    var d = new Date();
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
  }

  /* ДД.ММ.ГГГГ → ГГГГ-ММ-ДД; несуществующая дата — null */
  function toIso(value) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value || '');
    if (!m) return null;
    var d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    if (d.getFullYear() !== Number(m[3]) || d.getMonth() !== Number(m[2]) - 1 || d.getDate() !== Number(m[1])) return null;
    return m[3] + '-' + m[2] + '-' + m[1];
  }

  function mode() { return root && root.getAttribute('data-variant') === 'undo' ? 'undo' : 'repay'; }

  function sync() {
    if (ok) ok.disabled = mode() === 'repay' && !toIso(control && control.value);
  }

  function paint(nodeId, m) {
    var S = store();
    var node = S && S.node(nodeId);
    if (!node || !root) return false;
    target = { id: nodeId, mode: m === 'undo' ? 'undo' : 'repay' };
    root.setAttribute('data-variant', target.mode);
    if (text) {
      text.textContent = (target.mode === 'undo' ? 'Отмена погашения инструмента ' : 'Погашение инструмента ')
        + node.number + ' ' + node.name;
    }
    if (control && target.mode === 'repay') {
      control.value = today();
      if (window.DSInput && field) window.DSInput.sync(field);
    }
    sync();
    return true;
  }

  function open(nodeId, m) {
    if (!paint(nodeId, m)) return;
    if (window.DSModal && !scrim.classList.contains('modal-scrim--inline')) window.DSModal.open(scrim);
  }

  function use(nodeId, m) { paint(nodeId, m); }

  if (control) {
    ['input', 'change'].forEach(function (type) { control.addEventListener(type, sync); });
  }
  if (field) field.addEventListener('ds-input:clear', sync);

  scrim.addEventListener('click', function (e) {
    if (!e.target.closest('[data-repay-ok]') || !target || !store()) return;
    var S = store();
    var done = target.mode === 'undo' ? S.undoRepay(target.id) : S.repay(target.id, toIso(control && control.value));
    target = null;
    if (done) S.commit();
  });

  /* «Погасить» и «Отменить погашение» в меню инструмента или транша */
  document.addEventListener('ptreeaction', function (e) {
    var d = e.detail || {};
    if (d.action !== 'REPAY' && d.action !== 'UNDO_REPAY') return;
    open(d.id, d.action === 'UNDO_REPAY' ? 'undo' : 'repay');
  });

  window.PostModalRepayment = { open: open, use: use };
})();

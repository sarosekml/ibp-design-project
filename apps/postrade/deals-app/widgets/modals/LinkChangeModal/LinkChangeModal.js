/* ============================================================
   LinkChangeModal.js — окно «Изменить связь с ФИ» (макет «Перенос из
   дерева в ФИ», 30.09.2026).

   Открывается кнопкой ⇄ «Изменить связь с ФИ» у инструмента или транша в
   тайле «Продукты сделки» (событие 'ptreeaction', action ATTACH). Заголовок
   — номер и название узла, ниже карточки ФИ сделки (у фронтенда — FICards):
   номер и тип ФИ в сделке, наименование, баланс, валюта, тип отчётности.
   – Клик по карточке выбирает её (Card ДС, состояние Selected по
     aria-checked) или снимает выбор. Узел связан не больше чем с двумя ФИ
     (решение человека 30.09.2026): клик по третьей карточке переносит выбор
     с той, что выбрана раньше (допущение агента, вопрос 40 задачи RE0001).
   – Карточка ФИ другого типа выключена (Card Disabled): транш — к кредиту,
     акции — к акциям, пут и колл — к РЕПО (допущение агента, вопрос 39).
   – «Сохранить» доступна, когда выбор отличается от сохранённого, — так
     связь и снимается: снять выбор со всех карточек и сохранить.
     ProductTreeStore.linkFi и commit; строка в тайле с заливкой, если узел
     прикреплён.
   Крестик, Esc и подложка — без изменений. Клавиатура: Tab по карточкам,
   Пробел или Enter — выбрать.

   API: PostModalLinkChange.open(nodeId) · use(nodeId) — нарисовать без
        открытия (витрина) · cardsHTML(cards) · mirror(scrim)
   ============================================================ */
(function () {
  'use strict';

  var MAX = 2;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function store() { return window.ProductTreeStore; }

  /* ── Разметка ───────────────────────────────────────────────────── */

  function lineHTML(label, value) {
    return '<p class="lc-fi-link__line">' + esc(label) + ': ' + esc(value) + '</p>';
  }

  function cardHTML(c) {
    var off = !c.available;
    return '<article class="tile tile--card lc-fi-link__card" role="checkbox" aria-checked="' + (c.selected && !off ? 'true' : 'false') + '"'
      + ' tabindex="' + (off ? '-1' : '0') + '"' + (off ? ' aria-disabled="true"' : '') + ' data-link-fi="' + esc(c.id) + '">'
      + '<header class="tile__header"><div class="tile__header-main">'
      + '<div class="tile__title-row"><h4 class="tile__title">' + esc(c.number + '. ' + c.typeLabel) + '</h4></div>'
      + '<p class="tile__subtitle">' + esc(c.name) + '</p></div></header>'
      + '<div class="tile__body">'
      + lineHTML('Баланс', c.balance) + lineHTML('Валюта', c.currency) + lineHTML('Тип отчетности', c.reportingLabel)
      + '</div></article>';
  }

  function cardsHTML(cards) { return (cards || []).map(cardHTML).join(''); }

  /* Сохранение идёт → классы ДС: тело приглушено, «Сохранить» с индикатором. */
  function mirror(scrim) {
    var root = scrim && scrim.querySelector('.lc-fi-link');
    var save = scrim && scrim.querySelector('[data-link-save]');
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

  window.PostModalLinkChange = { cardsHTML: cardsHTML, mirror: mirror };

  /* ── Окно ───────────────────────────────────────────────────────── */

  var scrim = typeof document !== 'undefined' && document.getElementById('ptree-link-scrim');
  if (!scrim) return;
  var root = scrim.querySelector('.lc-fi-link');
  var list = scrim.querySelector('[data-link-list]');
  var save = scrim.querySelector('[data-link-save]');
  var nodeId = null;
  var initial = [];
  var chosen = [];   /* в порядке выбора: третий вытесняет первого */

  function same(a, b) { return a.slice().sort().join('|') === b.slice().sort().join('|'); }

  function sync() {
    if (list) {
      Array.prototype.forEach.call(list.querySelectorAll('[data-link-fi]'), function (card) {
        var on = chosen.indexOf(card.getAttribute('data-link-fi')) !== -1;
        card.setAttribute('aria-checked', on ? 'true' : 'false');
      });
    }
    if (save && root && root.getAttribute('data-state') !== 'updating') save.disabled = same(chosen, initial);
  }

  function toggle(card) {
    if (!card || card.getAttribute('aria-disabled') === 'true') return;
    var id = card.getAttribute('data-link-fi');
    var at = chosen.indexOf(id);
    if (at !== -1) chosen.splice(at, 1);
    else {
      chosen.push(id);
      if (chosen.length > MAX) chosen.shift();
    }
    sync();
  }

  function paint(id) {
    var S = store();
    var node = S && S.node(id);
    if (!node || !node.canAttachToFi) return false;
    nodeId = id;
    var cards = S.fiCards(id);
    initial = cards.filter(function (c) { return c.selected && c.available; }).map(function (c) { return c.id; });
    chosen = initial.slice();
    var title = scrim.querySelector('.modal__title');
    if (title) title.textContent = node.number + ' ' + node.name;
    if (list) list.innerHTML = cardsHTML(cards);
    if (root) root.setAttribute('data-state', 'data');
    sync();
    mirror(scrim);
    return true;
  }

  function open(id) {
    if (!paint(id)) return;
    if (window.DSModal && !scrim.classList.contains('modal-scrim--inline')) window.DSModal.open(scrim);
  }

  function use(id) { paint(id); }

  if (list) {
    list.addEventListener('click', function (e) { toggle(e.target.closest('[data-link-fi]')); });
    list.addEventListener('keydown', function (e) {
      var card = e.target.closest('[data-link-fi]');
      if (!card || e.target !== card || (e.key !== ' ' && e.key !== 'Enter')) return;
      e.preventDefault();
      toggle(card);
    });
  }

  /* «Сохранить» — раньше глобального закрытия ds-modal.js (data-modal-close) */
  scrim.addEventListener('click', function (e) {
    if (!e.target.closest('[data-link-save]') || !nodeId || !store()) return;
    var S = store();
    if (S.linkFi(nodeId, chosen.slice())) S.commit();
    nodeId = null;
  });

  if (root) new MutationObserver(function () { mirror(scrim); sync(); }).observe(root, { attributes: true, attributeFilter: ['data-state'] });

  /* ⇄ «Изменить связь с ФИ» у инструмента или транша */
  document.addEventListener('ptreeaction', function (e) {
    var d = e.detail || {};
    if (d.action === 'ATTACH') open(d.id);
  });

  window.PostModalLinkChange.open = open;
  window.PostModalLinkChange.use = use;
  window.PostModalLinkChange.choose = function (ids) { chosen = (ids || []).slice(0, MAX); sync(); };
})();

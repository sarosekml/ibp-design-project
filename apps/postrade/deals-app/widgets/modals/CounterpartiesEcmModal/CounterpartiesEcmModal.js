/* ============================================================
   CounterpartiesEcmModal.js — окна «Документы по сделке».

   Два шага одного сценария: выбрать участника сделки → посмотреть его
   документы. Окна — два скрима (CounterpartiesEcmModal.html и подчасть
   EcmModal/EcmModal.html); слой, фокус и закрытие ведёт рантайм ДС
   (ds-modal.js). Скрипт делает то, чего рантаймы не делают:

     1. Список участников. Состав сделки держит CounterpartiesStore; окно
        перечитывает его при каждом открытии — после правки в окне «КНР»
        список уже новый. Пока состав грузится — loading, участников нет —
        empty. Карточки рисует CounterpartyCard (PostCardCounterparty) в
        режиме select, риск-метрику на них собирает рантайм ДС.
     2. Выбор. Карточка — пункт радиогруппы (role="radio", aria-checked);
        вид выбранной даёт Card из ДС (Selected). Выбор — клик по карточке,
        Enter / Space, стрелки двигают выбор по списку. В табуляции одна
        карточка — выбранная, без выбора первая. «Открыть» доступна, только
        когда участник выбран.
     3. Переход между шагами. «Открыть» закрывает первое окно и открывает
        второе с наименованием участника; «К списку контрагентов» — обратно,
        с тем же выбором.

   API:
     PostDealEcmModal.bind(scrim, docsScrim, opts) → api
       opts.members() → запись[] | null — участники текущей сделки (формат
                        mock-counterparties.js); null — состав ещё грузится
       api.refresh()  — перечитать участников
   ============================================================ */
(function () {
  'use strict';

  var SCRIM_ID = 'deal-ecm-scrim';

  function bind(scrim, docsScrim, opts) {
    if (!scrim) return null;
    if (scrim.__dealEcmApi) return scrim.__dealEcmApi;
    opts = opts || {};

    var modal = scrim.querySelector('.lc-deal-ecm');
    var items = scrim.querySelector('[data-ecm-items]');
    var next = scrim.querySelector('[data-ecm-next]');
    var parties = [];
    var selected = null;

    function cards() {
      return items ? Array.prototype.slice.call(items.querySelectorAll('[role="radio"]')) : [];
    }

    /* Отметка выбора и табуляция: выбранная карточка (или первая) в порядке
       Tab, остальные — только стрелками, как у радиогруппы. */
    function sync() {
      var list = cards();
      list.forEach(function (card, i) {
        var on = card.getAttribute('data-knr-card') === selected;
        card.setAttribute('aria-checked', on ? 'true' : 'false');
        card.setAttribute('tabindex', (on || (!selected && i === 0)) ? '0' : '-1');
      });
      if (next) next.disabled = !selected;
    }

    function choose(card, focus) {
      if (!card) return;
      selected = card.getAttribute('data-knr-card');
      sync();
      if (focus) card.focus();
    }

    function refresh() {
      var list = opts.members ? opts.members() : [];
      if (list == null) {
        if (modal) modal.setAttribute('data-state', 'loading');
        if (next) next.disabled = true;
        return;
      }
      parties = list;
      /* Выбор переживает повторное открытие, пока контрагент остаётся
         участником: вернулись из документов — выделение на месте. */
      if (selected && !parties.some(function (p) { return p.id === selected; })) selected = null;
      if (items) {
        items.innerHTML = '';
        if (window.PostCardCounterparty) {
          parties.forEach(function (p) {
            var card = window.PostCardCounterparty.render(p, { mode: 'select', selected: p.id === selected });
            if (card) items.appendChild(card);
          });
        }
        if (window.DSRiskMetric) window.DSRiskMetric.mount(items);
      }
      if (modal) modal.setAttribute('data-state', parties.length ? 'data' : 'empty');
      sync();
    }

    if (items) {
      /* Клик по карточке выбирает её. Чип риск-метрики — своё действие
         (поповер рейтинга), выбора он не делает. */
      items.addEventListener('click', function (e) {
        if (e.target.closest('button, a, [data-riskmetric]')) return;
        choose(e.target.closest('[role="radio"]'), false);
      });
      items.addEventListener('keydown', function (e) {
        var card = e.target.closest('[role="radio"]');
        if (!card || e.target !== card) return;
        var list = cards();
        var i = list.indexOf(card);
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          choose(card, false);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          choose(list[(i + 1) % list.length], true);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          choose(list[(i - 1 + list.length) % list.length], true);
        }
      });
    }

    function partyById(id) {
      for (var i = 0; i < parties.length; i++) if (parties[i].id === id) return parties[i];
      return null;
    }

    /* Открытие по кнопке тайла: список — на момент клика. Слушатель на фазе
       перехвата: карточки должны встать ДО того, как рантайм откроет окно и
       поставит фокус, — иначе перерисовка снесла бы элемент с фокусом. */
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-modal="' + SCRIM_ID + '"]')) refresh();
    }, true);

    if (next) {
      next.addEventListener('click', function () {
        var party = partyById(selected);
        if (!party || !docsScrim || !window.DSModal) return;
        var name = docsScrim.querySelector('[data-ecm-party-name]');
        if (name) name.textContent = party.name;
        window.DSModal.closeTop();
        window.DSModal.open(docsScrim);
      });
    }

    var back = docsScrim && docsScrim.querySelector('[data-ecm-back]');
    if (back) {
      back.addEventListener('click', function () {
        if (!window.DSModal) return;
        window.DSModal.closeTop();
        refresh();
        window.DSModal.open(scrim);
      });
    }

    var api = { refresh: refresh };
    scrim.__dealEcmApi = api;
    return api;
  }

  window.PostDealEcmModal = { bind: bind };
})();

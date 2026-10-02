/* ============================================================
   FinInstrumentsTile.js — карточки финансовых инструментов сделки из данных.

   Фрагмент FinInstrumentsTile.html держит эталон всех состояний, а список
   карточек в нём — пример с макета. Страница сделки рисует карточки своей
   сделки из FinInstrumentsStore.view(); витрина — этой же функцией.

   Правила предметной области (поля по типу ФИ, производные значения из
   дерева продуктов, погашение, генерация) живут в сторе —
   data/fin-instruments-store.js. Здесь только отрисовка и передача действий.

   API:
     PostTileFinInstruments.cardHTML(card, opts) → строка
       card — FinInstrumentCardView; opts.mode — 'edit' | 'view';
       opts.open — карточка развёрнута. В просмотре у карточки нет меню,
       «+ Добавить» и ⇄ у инструментов.
     PostTileFinInstruments.counts(cards) → { all, active, repaid }
     PostTileFinInstruments.stateOf(cards) → 'empty' | 'partial' | 'data'
     PostTileFinInstruments.render(tile, cards, opts)
       Перерисовывает список, счётчики вкладок и ставит data-state.
       opts.state — явное состояние ('loading' | 'updating'); opts.mode —
       режим, по умолчанию data-mode тайла; opts.canGenerate — есть ли что
       генерировать (иначе «Сгенерировать автоматически» выключена).
     PostTileFinInstruments.bind(tile, store) → off()
       Связывает тайл со стором ФИ: перерисовка на use и commit стора ФИ и
       дерева продуктов; «Сгенерировать автоматически» — store.generate().

   Действия, у которых есть исполнитель, уходят событием 'fiaction' с корня
   тайла: detail = { action, id }. Слушают его окна:
     CREATE — DealFinancialInstrumentCreateModal («+ Фин. инструмент»,
              «+ Финансовый инструмент», «Заполнить вручную»);
     EDIT   — DealFinancialInstrumentEditModal (пункт «Изменить» меню
              карточки — временный: что в меню, не решено, 02.10.2026).
   «→», «+ Добавить», ⇄ у инструмента и ссылка у кодов RWA нарисованы по
   макету и пока ничего не делают: что они делают, человек опишет позже
   (02.10.2026).
   ============================================================ */
(function () {
  'use strict';

  var ROOT = '.lc-fin-instruments';
  var LIST = '.lc-fin-instruments__list';
  var DATE_FIELDS = { signedAt: 1 };
  var FILTERS = {
    all: function () { return true; },
    active: function (c) { return !c.isRepaid; },
    repaid: function (c) { return c.isRepaid; }
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* id карточки — в атрибуте меню: только буквы, цифры, «-» и «_» */
  function menuId(id) { return 'fi-m-' + String(id).replace(/[^A-Za-z0-9_-]/g, '-'); }

  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? m[3] + '.' + m[2] + '.' + m[1] : '';
  }

  /* 800000 → «800 000,00», разряды — неразрывным пробелом */
  function fmtAmount(n) {
    var parts = Number(n).toFixed(2).split('.');
    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ',' + parts[1];
  }

  /* 17.03 → «17,03» */
  function fmtNumber(n) {
    return String(n).replace('.', ',');
  }

  function detailLabel(field) {
    var map = window.PRODUCT_DETAIL_LABELS || {};
    return map[field] || '';
  }

  function has(v) { return v !== null && v !== undefined && v !== ''; }

  /* ── Поле ───────────────────────────────────────────────────────── */

  function rofHTML(label, value, cls, affix) {
    var empty = !has(value);
    return '<div class="rof' + (cls ? ' ' + cls : '') + '">'
      + '<span class="ds-label"><span class="ds-label__text">' + esc(label) + '</span></span>'
      + '<div class="rof__row"><span class="rof__value rof__value--clamp-1">' + (empty ? '—' : esc(value)) + '</span>'
      + (affix && !empty ? '<span class="rof__affix">' + esc(affix) + '</span>' : '') + '</div></div>';
  }

  function riskHTML(risk) {
    if (!risk) return '';
    var a = ' data-risk="' + esc(risk.rating) + '"';
    if (risk.zone) a += ' data-zone="' + esc(risk.zone) + '"';
    if (risk.ratingDate) a += ' data-rating-date="' + esc(risk.ratingDate) + '"';
    if (risk.zoneDate) a += ' data-zone-date="' + esc(risk.zoneDate) + '"';
    if (risk.segment) a += ' data-segment="' + esc(risk.segment) + '"';
    if (risk.profile) a += ' data-profile="' + esc(risk.profile) + '"';
    return '<span data-riskmetric' + a + '></span>';
  }

  /* Контрагент — на всю ширину сетки, две строки с усечением, риск-метрика
     справа. */
  function partyHTML(label, party) {
    return '<div class="rof tile__grid-full lc-fin-card__party">'
      + '<span class="ds-label"><span class="ds-label__text">' + esc(label) + '</span></span>'
      + '<div class="rof__row rof__row--top"><span class="rof__value rof__value--clamp-n">' + (party ? esc(party.name) : '—') + '</span>'
      + (party ? riskHTML(party.risk) : '') + '</div></div>';
  }

  function flagHTML(text) {
    return '<div class="rof__row"><span class="rof__icon"><i data-icon="check"></i></span>'
      + '<span class="rof__value">' + esc(text) + '</span></div>';
  }

  function rwaHTML(codes) {
    return '<div class="rof tile__grid-full">'
      + '<span class="ds-label"><span class="ds-label__text">Код для RWA</span></span>'
      + '<div class="rof__row"><div class="rof__value rof__value--chips"><div class="chiplist chiplist--s">'
      + codes.map(function (c) { return '<span class="chip chip--s chip--grey"><span class="chip__label">' + esc(c) + '</span></span>'; }).join('')
      + '</div></div>'
      /* куда ведёт ссылка — не решено (02.10.2026) */
      + '<span class="rof__icon rof__icon--interactive" role="button" tabindex="0" aria-label="Коды для RWA"><i data-icon="link-external"></i></span>'
      + '</div></div>';
  }

  /* ── Инструменты карточки ───────────────────────────────────────── */

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

  function nodeHTML(n, edit) {
    var status = n.repaidAt
      ? '<div class="prow__status prow__status--success"><i data-icon="check-circle-filled"></i>'
        + '<span class="prow__status-text">' + esc(detailLabel('repaidAt') + ' ' + fmtDate(n.repaidAt)) + '</span></div>'
      : '';
    var meta = (n.details || []).length
      ? '<div class="prow__meta">' + n.details.map(metaItemHTML).join('') + '</div>' : '';
    var acts = '';
    if (n.isIfrsOption) {
      acts += '<button type="button" class="ibtn ibtn--neutral ibtn--l" aria-label="Опцион включенный в расчет МСФО"'
        + ' data-tooltip="Опцион включенный в расчет МСФО" data-tooltip-multiline="yes"><i data-icon="info-circle"></i></button>';
    }
    /* ⇄ у инструмента в карточке — что делает, не решено (02.10.2026) */
    if (edit) acts += '<button type="button" class="ibtn ibtn--neutral ibtn--l lc-fin-card__move" aria-label="Перенести"><i data-icon="arrow-left-right"></i></button>';
    return '<div class="prow" data-fi-node="' + esc(n.id) + '"><div class="prow__main">'
      + '<div class="prow__head"><span class="prow__title">' + esc(n.number + ' ' + n.name) + '</span></div>'
      + status + meta + '</div>'
      + (acts ? '<div class="prow__actions">' + acts + '</div>' : '') + '</div>';
  }

  /* ── Карточка ───────────────────────────────────────────────────── */

  function menuHTML(c) {
    var id = menuId(c.id);
    return '<span class="menu-anchor"><button type="button" class="ibtn ibtn--neutral ibtn--m" aria-label="Действия"'
      + ' data-menu="' + id + '" data-menu-align="end"><i data-icon="more-dots"></i></button>'
      + '<div id="' + id + '" class="menu menu--floating" role="menu" hidden>'
      + '<button type="button" class="menu__item" role="menuitem" data-fi-act="EDIT" data-fi-id="' + esc(c.id) + '">'
      + '<span class="menu__item-label">Изменить</span></button></div></span>';
  }

  function headHTML(c, edit, open) {
    var pe = c.isPE
      ? '<span class="tile__title-add"><span class="chip chip--s chip--fit lc-fin-card__pe"><span class="chip__label">Private Equity</span></span></span>' : '';
    return '<header class="tile__header"><div class="tile__header-main">'
      + '<div class="tile__title-row"><h4 class="tile__title">' + esc(c.name) + '</h4>' + pe + '</div></div>'
      + '<div class="tile__actions">'
      /* страницы финансового инструмента в прототипе нет (02.10.2026) */
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m" aria-label="Открыть финансовый инструмент"><i data-icon="arrow-right"></i></button>'
      + (edit ? menuHTML(c) : '')
      + '<button type="button" class="ibtn ibtn--neutral ibtn--m tile__toggle" aria-expanded="' + open + '" aria-label="' + (open ? 'Свернуть' : 'Развернуть') + '">'
      + '<span class="tile__chevron"><i data-icon="chevron-up"></i></span></button>'
      + '</div></header>';
  }

  function alertHTML(c) {
    if (!has(c.errorText)) return '';
    return '<div class="alert alert--error alert--m alert--flush" role="alert" aria-live="assertive">'
      + '<span class="alert__icon" aria-hidden="true"><i data-icon="alert-circle-filled"></i></span>'
      + '<div class="alert__body"><p class="alert__title">Ошибка</p><p class="alert__text">' + esc(c.errorText) + '</p></div></div>';
  }

  /* Значения сетки: баланс, тип отчётности, валюта, FV/AC (+ целевой IRR у
     акций), ниже — сумма, дата подписания, плановая дата погашения. */
  function fieldsHTML(c) {
    var irr = c.typeCode === 'SHARES';
    return rofHTML('Баланс', c.balance)
      + rofHTML('Тип отчетности', c.reportingLabel)
      + rofHTML('Валюта', c.currency)
      + rofHTML('FV/AC', c.fvAcLabel)
      + (irr ? rofHTML('Целевой IRR', has(c.targetIrr) ? fmtNumber(c.targetIrr) : null, null, '%') : '')
      + rofHTML(c.amountLabel, has(c.amount) ? fmtAmount(c.amount) : null, 'lc-fin-card__amount')
      + rofHTML('Дата подписания', fmtDate(c.signedAt), 'lc-fin-card__signed')
      + rofHTML('Плановая дата погашения', fmtDate(c.plannedMaturityAt), 'lc-fin-card__planned');
  }

  /* Свёрнутая часть: заполненные контрагенты резервирования и аллокации,
     признаки, коды для RWA — пустые не показываются (макет «Не заполнено»). */
  function moreHTML(c) {
    var s = '';
    if (c.reserveCounterparty) s += partyHTML('Контрагент для целей резервирования', c.reserveCounterparty);
    if (c.allocationCounterparty) s += partyHTML('Контрагент для аллокации финансового результата', c.allocationCounterparty);
    var flags = '';
    if (c.isDkkk) flags += flagHTML('Участие ДККК');
    if (c.hasLinkedUnconditionalOption) flags += flagHTML('Связанный безусловный опцион');
    if (flags) s += '<div class="lc-fin-card__flags">' + flags + '</div>';
    if ((c.rwaCodes || []).length) s += rwaHTML(c.rwaCodes);
    /* своя сетка в одну колонку: поля остаются внутри .tile__grid */
    return s ? '<div class="tile__collapsible tile__grid-full"><div class="tile__grid">' + s + '</div></div>' : '';
  }

  function nodesHTML(c, edit) {
    var count = (c.nodes || []).length;
    var head = '<div class="tile__grid-full lc-fin-card__nodes-head">'
      + '<h5 class="lc-fin-card__nodes-title">Инструменты</h5>'
      + (count ? '<span class="badge badge--s badge--neutral" aria-label="Инструментов: ' + count + '">' + count + '</span>' : '')
      /* «+ Добавить» — что делает, не решено (02.10.2026) */
      + (edit ? '<button type="button" class="btn btn--outline btn--xs lc-fin-card__add-node"><i data-icon="add"></i><span class="btn__label">Добавить</span></button>' : '')
      + '</div>';
    var list = count
      ? '<div class="tile__collapsible tile__grid-full lc-fin-card__nodes">' + c.nodes.map(function (n) { return nodeHTML(n, edit); }).join('') + '</div>'
      : '<div class="tile__collapsible tile__grid-full"><p class="lc-fin-card__no-nodes">Нет связанных инструментов</p></div>';
    return head + list;
  }

  function cardHTML(c, opts) {
    opts = opts || {};
    var edit = opts.mode !== 'view';
    var open = opts.open === true;
    return '<article class="tile tile--card tile--accordion lc-fin-card' + (open ? '' : ' tile--collapsed') + '" data-fi-id="' + esc(c.id) + '">'
      + headHTML(c, edit, open) + alertHTML(c)
      + '<div class="tile__body"><div class="tile__grid lc-fin-card__grid' + (c.typeCode === 'SHARES' ? ' lc-fin-card__grid--irr' : '') + '">'
      + fieldsHTML(c) + partyHTML('Контрагент', c.counterparty) + moreHTML(c) + nodesHTML(c, edit)
      + '</div></div></article>';
  }

  /* ── Список и счётчики ──────────────────────────────────────────── */

  function counts(cards) {
    cards = cards || [];
    var repaid = cards.filter(FILTERS.repaid).length;
    return { all: cards.length, active: cards.length - repaid, repaid: repaid };
  }

  function stateOf(cards) {
    if (!cards || !cards.length) return 'empty';
    var partial = cards.some(function (c) {
      return !c.counterparty || !(c.nodes || []).length || !has(c.fvAcCode);
    });
    return partial ? 'partial' : 'data';
  }

  /* ── Отрисовка ──────────────────────────────────────────────────── */

  /* Что развёрнуто и какая вкладка выбрана — переживает перерисовку, пока
     открыта страница. По умолчанию развёрнута первая карточка (макет). */
  function memoOf(tile) {
    if (!tile.__fiMemo) {
      tile.__fiMemo = { open: {}, filter: 'all' };
      tile.addEventListener('tiletoggle', function (e) {
        var card = e.target.closest && e.target.closest('.lc-fin-card');
        var id = card && card.getAttribute('data-fi-id');
        if (id) tile.__fiMemo.open[id] = !(e.detail && e.detail.collapsed);
      });
    }
    return tile.__fiMemo;
  }

  function paintTabs(tile, n, memo) {
    var tabs = tile.querySelectorAll('[data-fi-filter]');
    Array.prototype.forEach.call(tabs, function (tab) {
      var key = tab.getAttribute('data-fi-filter');
      var count = n[key] || 0;
      var badge = tab.querySelector('.tab__badge');
      if (badge) { badge.textContent = String(count); badge.hidden = count === 0; }
      /* пустая вкладка выключена (макет: «Погашенные» без счётчика) */
      if (count === 0 && key !== 'all') tab.setAttribute('aria-disabled', 'true');
      else tab.removeAttribute('aria-disabled');
    });
    if (memo.filter !== 'all' && !n[memo.filter]) memo.filter = 'all';
    Array.prototype.forEach.call(tabs, function (tab) {
      var on = tab.getAttribute('data-fi-filter') === memo.filter;
      tab.classList.toggle('tab--selected', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.setAttribute('tabindex', on ? '0' : '-1');
    });
  }

  function render(tile, cards, opts) {
    if (!tile) return;
    opts = opts || {};
    cards = cards || [];
    var mode = opts.mode || tile.getAttribute('data-mode') || 'edit';
    var memo = memoOf(tile);
    var n = counts(cards);

    /* меню открытой карточки и тултип под курсором уходят вместе со списком */
    if (window.DSMenu) window.DSMenu.closeAll();
    if (window.DSTooltip) window.DSTooltip.hideAll();

    paintTabs(tile, n, memo);
    var shown = cards.filter(FILTERS[memo.filter] || FILTERS.all);
    var list = tile.querySelector(LIST);
    if (list) {
      list.innerHTML = shown.map(function (c, i) {
        var open = memo.open[c.id] != null ? memo.open[c.id] : i === 0;
        return cardHTML(c, { mode: mode, open: open });
      }).join('');
    }
    var gen = tile.querySelector('[data-fi-act="GENERATE"]');
    if (gen) gen.disabled = opts.canGenerate === false;

    tile.setAttribute('data-mode', mode);
    tile.setAttribute('data-state', opts.state || stateOf(cards));

    if (window.dsIcons) window.dsIcons.apply(tile);
    if (window.DSMenu) window.DSMenu.bindAll(tile);
    if (window.DSModal) window.DSModal.bindAll(tile);
    if (window.DSTooltip) window.DSTooltip.bindAll(tile);
    if (window.DSRiskMetric) window.DSRiskMetric.mount(tile);
    if (window.DSTile && list) {
      list.querySelectorAll('.lc-fin-card').forEach(function (card) { window.DSTile.wire(card); });
    }
  }

  /* ── Действия ───────────────────────────────────────────────────── */

  function emit(tile, action, id) {
    tile.dispatchEvent(new CustomEvent('fiaction', { bubbles: true, detail: { action: action, id: id || null } }));
  }

  function bind(tile, store) {
    if (!tile || !store) return function () {};
    var trees = window.ProductTreeStore;
    var paint = function () {
      render(tile, store.view(), { canGenerate: store.generatable().length > 0 });
    };
    var offs = [
      store.on('change', function (d) { if (d.reason === 'use') paint(); }),
      store.on('commit', paint)
    ];
    if (trees) {
      offs.push(trees.on('change', function (d) { if (d.reason === 'use') paint(); }));
      offs.push(trees.on('commit', paint));
    }
    tile.__fiPaint = paint;
    tile.__fiAct = function (action, id) {
      if (action === 'GENERATE') { store.generate(); return; }
      emit(tile, action, id);
    };
    paint();
    return function off() {
      offs.forEach(function (f) { f(); });
      tile.__fiAct = null;
      tile.__fiPaint = null;
    };
  }

  /* Пункты меню открытой карточки рантайм держит в общем слое DSFloat, вне
     тайла: их тайл восстанавливается по кнопке-триггеру меню (Л88). */
  function ownerOf(el) {
    var menu = el.closest('.menu');
    if (menu && menu.id) {
      var trigger = document.querySelector('[data-menu="' + menu.id + '"]');
      return trigger ? trigger.closest(ROOT) : null;
    }
    return el.closest(ROOT);
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('[data-fi-act]');
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    var tile = ownerOf(el);
    if (!tile) return;
    var action = el.getAttribute('data-fi-act');
    var id = el.getAttribute('data-fi-id');
    if (tile.__fiAct) tile.__fiAct(action, id);
    else emit(tile, action, id);
  });

  /* Вкладки: выбор ведёт рантайм Tab (data-tabs), список фильтрует тайл —
     по выбранной вкладке после клика или клавиши, а не по onChange: рантайм
     мог привязать группу раньше скрипта тайла. Выбор читается микрозадачей —
     когда обработчики рантайма этого же события уже отработали, в каком бы
     порядке они ни были привязаны. */
  function watchTabs(tile) {
    var bar = tile && tile.querySelector('[data-fi-tabs]');
    if (!bar || bar.__fiWatch) return;
    bar.__fiWatch = true;
    function sync() {
      Promise.resolve().then(function () {
        var sel = bar.querySelector('[data-fi-filter][aria-selected="true"]');
        var key = sel && sel.getAttribute('data-fi-filter');
        var memo = memoOf(tile);
        if (!key || key === memo.filter) return;
        memo.filter = key;
        if (tile.__fiPaint) tile.__fiPaint();
      });
    }
    bar.addEventListener('click', sync);
    bar.addEventListener('keydown', sync);
  }

  function wireTabs(root) {
    (root || document).querySelectorAll(ROOT).forEach(watchTabs);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { wireTabs(document); });
  else wireTabs(document);

  window.PostTileFinInstruments = {
    cardHTML: cardHTML, counts: counts, stateOf: stateOf, render: render, bind: bind, watchTabs: watchTabs
  };
})();

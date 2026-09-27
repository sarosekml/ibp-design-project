/* ============================================================
   DealDescriptionTile.js — тайл «Описание сделки» из данных.

   Фрагмент DealDescriptionTile.html держит эталон всех состояний, а значения
   в нём — пример. Страница сделки берёт запись своей сделки из DealsStore и
   отдаёт сюда. Разметка не пересоздаётся: скрипт меняет текст, иконку и тон
   на местах. Так триггер поповера «Связанные сделки», который рантайм ДС
   привязал при загрузке, переживает любую перерисовку.

   Поля записи (mock-deals.js, typedef DealDescriptionFields): description ·
   operationsComment · gsz — текстом; ceParticipation · ifDeskParticipation
   · restructured — да/нет; finTpl — «Да» / «Нет» (поле реестра); jointness —
   код территориального банка; riskCategory — код категории риска ЦУП;
   relatedDeals — список связанных сделок. additionalIncome тайл не
   показывает — только окно (макет).

   API:
     PostTileDealDescription.render(tile, deal)
       Раскладывает значения, ставит data-state по stateOf.
     PostTileDealDescription.stateOf(deal) → 'data' | 'partial' | 'empty'
       empty — в окне правки не заполнено ничего и не отмечен ни один
       признак; data — заполнены все три текстовых поля; иначе partial.
       Связанные сделки на состояние не влияют: они приходят из системы, а
       не заполняются.
     PostTileDealDescription.flags(deal) → [{ key, icon, tone, text }]
       Признаки в порядке отображения — чем их рисовать. Отдано наружу,
       чтобы вид признака читался из одного места. «Связанные сделки» в
       списке только тогда, когда они есть: без них строки в тайле нет
       (решение человека 25.09.2026).
   ============================================================ */
(function () {
  'use strict';

  var TEXT_FIELDS = ['description', 'operationsComment', 'gsz'];

  function str(deal, key) {
    return String((deal && deal[key]) || '').trim();
  }

  function yes(deal, key) {
    var v = deal && deal[key];
    return v === true || v === 'Да';
  }

  /* Категория риска ЦУП: тон иконки по категории (макет, «Пояснение»).
     Нет категории и «не определена» — пустой круг без тона. */
  var RISK_TONE = { A: 'error', B: 'warning', C: 'success', D: 'dark' };

  function riskFlag(deal) {
    var code = str(deal, 'riskCategory');
    if (RISK_TONE[code]) {
      return { icon: 'alert-triangle-filled', tone: RISK_TONE[code], text: 'Категория риска ЦУП: ' + code };
    }
    return { icon: 'circle', tone: '', text: 'Категория риска ЦУП: ' + (code === 'UNDEFINED' ? 'не определена' : 'отсутствует') };
  }

  /* Признак да/нет: отмечен — залитый круг с галочкой, нет — пустой круг.
     Текст один в обоих случаях — значение несёт иконка. */
  function checkFlag(on, text) {
    return { icon: on ? 'check-circle-filled' : 'circle', tone: '', text: text };
  }

  function hasRelated(deal) {
    return ((deal && deal.relatedDeals) || []).length > 0;
  }

  function flags(deal) {
    var joint = str(deal, 'jointness');
    function flag(key, f) { f.key = key; return f; }
    /* Порядок — по колонкам подложки: 1 — категория риска, фин. расчёты и
       связанные сделки; 2 — совместность и реструктуризация; 3 — Деск ИФ и
       ЦЭ (решение человека 25.09.2026). */
    var list = [flag('riskCategory', riskFlag(deal))];
    /* Фин.расчеты в шаблоне: сделка ведётся в Excel, а не в системе. */
    list.push(flag('finTpl', yes(deal, 'finTpl')
      ? { icon: 'bar-chart-square', tone: 'warning', text: 'Фин.расчеты в шаблоне' }
      : { icon: 'circle', tone: '', text: 'Фин.расчеты в шаблоне' }));
    /* Связанные сделки — строка только когда они есть; текст — ссылка на
       поповер, в разметке он постоянный. */
    if (hasRelated(deal)) list.push(flag('relatedDeals', checkFlag(true, '')));
    /* Совместность — с каким территориальным банком ведётся сделка. */
    list.push(flag('jointness', joint
      ? { icon: 'link', tone: '', text: 'Совместность: ' + joint }
      : { icon: 'circle', tone: '', text: 'Совместность: отсутствует' }));
    list.push(flag('restructured', checkFlag(yes(deal, 'restructured'), 'Реструктуризация')));
    list.push(flag('ifDeskParticipation', checkFlag(yes(deal, 'ifDeskParticipation'), 'Участие Деска ИФ')));
    list.push(flag('ceParticipation', checkFlag(yes(deal, 'ceParticipation'), 'Участие ЦЭ')));
    return list;
  }

  function stateOf(deal) {
    var anyText = TEXT_FIELDS.concat(['additionalIncome', 'jointness', 'riskCategory'])
      .some(function (k) { return str(deal, k); });
    var anyFlag = ['ceParticipation', 'ifDeskParticipation', 'restructured', 'finTpl']
      .some(function (k) { return yes(deal, k); });
    if (!anyText && !anyFlag) return 'empty';
    var allText = TEXT_FIELDS.every(function (k) { return str(deal, k); });
    return allText ? 'data' : 'partial';
  }

  function setIcon(host, name, tone) {
    host.className = 'lc-deal-description__icon' + (tone ? ' lc-deal-description__icon--' + tone : '');
    host.innerHTML = '<i data-icon="' + name + '"></i>';
    if (window.dsIcons) window.dsIcons.apply(host);
  }

  function render(tile, deal) {
    if (!tile) return;

    /* Незаполненное текстовое поле — прочерк цветом обычного текста: прочерк
       — значение, а не подсказка (ReadOnlyField 1.010). */
    tile.querySelectorAll('[data-dd-field]').forEach(function (el) {
      el.textContent = str(deal, el.getAttribute('data-dd-field')) || '—';
    });

    /* Строка признака, которого нет в списке, прячется целиком — так уходит
       «Связанные сделки» у сделки без них. */
    var shown = {};
    flags(deal).forEach(function (f) {
      shown[f.key] = true;
      var row = tile.querySelector('[data-dd-flag="' + f.key + '"]');
      if (!row) return;
      var icon = row.querySelector('[data-dd-icon]');
      if (icon) setIcon(icon, f.icon, f.tone);
      var text = row.querySelector('[data-dd-text]');
      if (text) text.textContent = f.text;
    });
    tile.querySelectorAll('[data-dd-flag]').forEach(function (row) {
      row.hidden = !shown[row.getAttribute('data-dd-flag')];
    });

    tile.setAttribute('data-state', stateOf(deal));
  }

  window.PostTileDealDescription = {
    flags: flags,
    stateOf: stateOf,
    render: render
  };
})();

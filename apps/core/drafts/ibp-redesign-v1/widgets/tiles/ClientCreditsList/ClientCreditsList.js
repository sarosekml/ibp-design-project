/* ClientCreditsList — карточки кредитов клиента.
   render(host, { credits, variant }) — variant 'active': ClientCreditDto[]
   (вид, период, номер, название, метрики; раскрыто — «Сроки» и «Финансовые
   показатели»); 'pipeline': ClientCreditPipelineDto[] («Оборотный кредит»,
   КФЮЛ ID, этап, ставка, валюта, сумма; раскрыто — «Данные по сделке» и
   «Описание сделки»). Сворачивание — рантайм Tile ДС. */
(function () {
  'use strict';

  var seq = 0;
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function field(label, value) {
    return '<div class="rof"><span class="ds-label"><span class="ds-label__text">' + esc(label) + '</span></span><div class="rof__row"><span class="rof__value">' + esc(value || '–') + '</span></div></div>';
  }
  function chip(label, o) {
    o = o || {};
    return '<span class="chip chip--xs' + (o.rounded ? ' chip--rounded' : '') + (o.tone ? ' chip--' + o.tone : '') + '">'
      + (o.icon ? '<span class="chip__icon" aria-hidden="true"><i data-icon="' + o.icon + '"></i></span>' : '')
      + '<span class="chip__label">' + esc(label) + '</span></span>';
  }
  function table(heads, rows) {
    var grid = '8px ' + heads.map(function () { return 'minmax(140px,1fr)'; }).join(' ') + ' minmax(8px,1fr)';
    return '<div class="tbl" data-table><div class="tbl__row tbl__row--head" style="grid-template-columns:' + grid + '"><div class="th th--separator"></div>'
      + heads.map(function (l) { return '<div class="th"><span class="th__label">' + esc(l) + '</span></div>'; }).join('')
      + '<div class="th th--separator"></div></div>'
      + rows.map(function (r) {
        return '<div class="tbl__row" style="grid-template-columns:' + grid + '"><div class="tc tc--separator"></div>'
          + r.map(function (v) { return '<div class="tc"><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(v) + '</span></span></div>'; }).join('')
          + '<div class="tc tc--separator"></div></div>';
      }).join('') + '</div>';
  }
  function inset(title, inner) {
    return '<section class="tile tile--inset"><header class="tile__header"><div class="tile__header-main"><div class="tile__title-row"><h4 class="tile__title">' + esc(title) + '</h4></div></div></header>'
      + '<div class="tile__body">' + inner + '</div></section>';
  }
  function card(chips, title, summary, details) {
    var id = 'cc-' + (++seq);
    return '<section class="tile tile--accordion tile--collapsed">'
      + '<header class="tile__header"><div class="tile__header-main"><div class="tile__chiplist">' + chips + '</div>'
      + '<div class="tile__title-row"><span class="tile__title-icon" aria-hidden="true"><i data-icon="document-signed"></i></span><h3 class="tile__title">' + esc(title) + '</h3></div></div>'
      + '<div class="tile__actions"><button type="button" class="ibtn ibtn--neutral ibtn--m tile__toggle" aria-expanded="false" aria-controls="' + id + '" aria-label="Развернуть"><span class="tile__chevron"><i data-icon="chevron-up"></i></span></button></div></header>'
      + '<div class="tile__body"><div class="tile__grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">' + summary + '</div></div>'
      + '<div class="tile__collapsible" id="' + id + '"><div class="tile__body"><div class="lc-client-credits__pair">' + details + '</div></div></div></section>';
  }

  var TONE = { warning: 'warning', success: 'success' };

  function render(host, opts) {
    var list = (opts && opts.credits) || [];
    var root = host && (host.matches('[data-cc-list]') ? host : host.querySelector('[data-cc-list]'));
    if (!root) return;
    root.innerHTML = list.map(function (k) {
      if (opts.variant === 'pipeline') {
        return card(chip(k.stageStatus, { tone: 'info', rounded: true }) + chip(k.dateLabel + ' · ' + k.termLabel, { icon: 'calendar' }),
          'Оборотный кредит · КФЮЛ ID ' + k.kfuId,
          field('Наименование этапа сделки', k.stageLabel) + field('Ставка по сделке', k.rateLabel) + field('Валюта сделки', k.currencyLabel) + field('Сумма сделки, RUB', k.amountLabel),
          inset('Данные по сделке', table(['Параметр', 'Значение'], (k.dealData || []).map(function (d) { return [d.label, d.value]; })))
          + inset('Описание сделки', '<p class="lc-client-credits__text">' + esc(k.description) + '</p><p class="lc-client-credits__meta">' + esc(k.updatedLabel) + '</p>'));
      }
      return card(chip(k.kindLabel, { tone: TONE[k.tone] }) + chip(k.period, { icon: 'calendar' }),
        k.name + ' ' + k.number,
        (k.metrics || []).map(function (m) { return field(m.label, m.value); }).join(''),
        inset('Сроки', table(['Категория', 'Дата'], (k.schedules || []).map(function (s) { return [s.category, s.date]; })))
        + inset('Финансовые показатели', table(['Показатель', 'Сумма, RUB'], (k.finIndicators || []).map(function (f) { return [f.label, f.amount]; }))));
    }).join('');
    if (window.DSTable) root.querySelectorAll('.tbl').forEach(function (t) { window.DSTable.bind(t.parentNode); });
    if (window.dsIcons) window.dsIcons.apply(root);
  }

  window.LcClientCreditsList = { render: render };
})();

/* ============================================================
   RelatedDealsPopover.js — список поповера «Связанные сделки».

   Открытие, закрытие, позицию и фокус ведёт рантайм ДС (ds-popover.js) по
   триггеру data-popover в тайле «Описание сделки». Здесь только список:
   связанные сделки приходят из записи сделки (relatedDeals, typedef
   RelatedDealRsDto в mock-deals.js). Каждая сделка — одна ссылка
   «№ <номер сделки клиента> · <наименование>».

   Ссылка ведёт на страницу сделки клиента. Такой страницы в прототипе нет,
   поэтому переход погашен (паспорт, «Открытые вопросы»): ссылка выглядит и
   фокусируется как настоящая, но никуда не ведёт.

   API:
     PostRelatedDealsPopover.render(pop, deals)
       deals — RelatedDealRsDto[]; список заменяется целиком.
     PostRelatedDealsPopover.label(deal) → строка ссылки
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function label(d) {
    return '№ ' + String((d && d.opportunityId) || '') + ' · ' + String((d && d.name) || '');
  }

  function render(pop, deals) {
    var list = pop && pop.querySelector('[data-related-list]');
    if (!list) return;
    list.innerHTML = (deals || []).map(function (d) {
      return '<li><a class="link link--accent link--m" href="#" data-opportunity-link>' + esc(label(d)) + '</a></li>';
    }).join('');
  }

  /* Переход на страницу сделки клиента погашен: страницы нет. */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-opportunity-link]')) e.preventDefault();
  });

  window.PostRelatedDealsPopover = { render: render, label: label };
})();

/* ============================================================
   StatCard.js — карточка-счётчик из шаблона #lc-stat-card-tpl.

   Шаблон вшивает страница (StatCard.html), поэтому разметка одна на все
   места, где карточка стоит: тайлы главной и витрина компонента.

   API (window.LcStatCard):
     render(opts) → HTMLElement
       opts.key       — значение data-stat (фильтр, который включает карточка)
       opts.label     — подпись
       opts.value     — число
       opts.caption   — пояснение (у размера S не показывается)
       opts.tone      — '' | 'accent' | 'info' | 'warning' | 'error' | 'success'
       opts.size      — 'm' (по умолчанию) | 's'
       opts.pressed   — фильтр включён
       opts.static    — показатель без действия (span вместо кнопки)
       opts.ariaLabel — полная подпись для чтения с экрана
   ============================================================ */
(function () {
  'use strict';

  function render(o) {
    o = o || {};
    var tpl = document.getElementById('lc-stat-card-tpl');
    if (!tpl) { console.warn('StatCard: нет шаблона #lc-stat-card-tpl — вшейте StatCard.html меткой ds-include'); return document.createElement('span'); }
    var el = tpl.content.firstElementChild.cloneNode(true);
    if (o.static) {
      var span = document.createElement('span');
      span.className = el.className + ' lc-stat--static';
      span.innerHTML = el.innerHTML;
      el = span;
    } else {
      el.setAttribute('aria-pressed', o.pressed ? 'true' : 'false');
    }
    if (o.size === 's') el.classList.add('lc-stat--s');
    if (o.tone) el.classList.add('lc-stat--' + o.tone);
    if (o.key) el.setAttribute('data-stat', o.key);
    if (o.ariaLabel) el.setAttribute('aria-label', o.ariaLabel);
    el.querySelector('.lc-stat__label').textContent = o.label || '';
    el.querySelector('.lc-stat__value').textContent = o.value == null ? '—' : String(o.value);
    var cap = el.querySelector('.lc-stat__caption');
    if (o.caption) cap.textContent = o.caption; else cap.remove();
    return el;
  }

  window.LcStatCard = { render: render };
})();

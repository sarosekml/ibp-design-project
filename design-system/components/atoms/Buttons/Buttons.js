/* =========================================================================
   Design System — Button runtime
   DSButton.swap(button, { icon, label, type, ariaLabel }) — замена кнопки
   на другую: «Показать в чате» → «В чате». Правило ДС (MS0010b): кнопка
   меняется на другую и у них есть иконки — иконка меняется с анимацией:
   старая поворачивается, уменьшается и гаснет, новая проявляется встречным
   поворотом (как у .btn__icon--toggle, 0,4 с). Подпись и тип меняются сразу.
   При prefers-reduced-motion смена мгновенная.

   Переключатель вкл/выкл (та же кнопка) — не сюда: две иконки в
   .btn__icon--toggle и aria-pressed / aria-expanded, смену рисует CSS.

   Рантайм без разметки молчит; хуков нет — только API.
   ========================================================================= */
(function () {
  'use strict';
  if (window.DSButton) return;

  var EASE = 'cubic-bezier(.22, 1, .36, 1)';
  var OUT = [{ transform: 'none', opacity: 1 }, { transform: 'rotate(90deg) scale(.5)', opacity: 0 }];
  var IN = [{ transform: 'rotate(-90deg) scale(.5)', opacity: 0 }, { transform: 'none', opacity: 1 }];
  var TYPES = ['btn--accent', 'btn--outline', 'btn--transparent'];

  function reduced() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  /* ведущая иконка кнопки: слот .btn__icon, <i data-icon> или вставленный <svg>
     перед подписью (шеврон меню — не иконка) */
  function leadIcon(btn) {
    var kids = btn.children;
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (k.classList.contains('btn__label')) return null;
      if (k.classList.contains('btn__chevron') || k.classList.contains('spin')) continue;
      if (k.classList.contains('btn__icon') || k.hasAttribute('data-icon') || k.tagName.toLowerCase() === 'svg') return k;
    }
    return null;
  }

  function hydrate(el) {
    if (window.dsIcons && typeof window.dsIcons.apply === 'function') window.dsIcons.apply(el);
  }

  function makeIcon(name) {
    var i = document.createElement('i');
    i.setAttribute('data-icon', name);
    i.setAttribute('aria-hidden', 'true');
    return i;
  }

  function swap(btn, o) {
    if (!btn || !btn.classList || !btn.classList.contains('btn')) return;
    o = o || {};
    if (o.type) {
      TYPES.forEach(function (c) { btn.classList.remove(c); });
      btn.classList.add('btn--' + o.type);
    }
    var label = btn.querySelector('.btn__label');
    if (o.label != null && label) label.textContent = o.label;
    if (Object.prototype.hasOwnProperty.call(o, 'ariaLabel')) {
      if (o.ariaLabel) btn.setAttribute('aria-label', o.ariaLabel); else btn.removeAttribute('aria-label');
    }
    if (!o.icon) return;

    var old = leadIcon(btn);
    var next = makeIcon(o.icon);
    var animate = !reduced() && typeof next.animate === 'function';

    function put() {
      if (old && old.parentNode === btn) btn.replaceChild(next, old);
      else btn.insertBefore(next, btn.firstChild);
      hydrate(btn);
      if (!animate) return;
      var shown = leadIcon(btn);
      if (shown) shown.animate(IN, { duration: 400, easing: EASE });
    }

    if (!old || !animate) { put(); return; }
    /* put — ровно один раз: по окончании анимации или по таймеру-страховке
       (в скрытой вкладке анимации стоят и onfinish не приходит) */
    var done = false;
    function once() { if (done) return; done = true; put(); }
    var out = old.animate(OUT, { duration: 200, easing: 'ease', fill: 'forwards' });
    out.onfinish = once;
    out.oncancel = once;
    setTimeout(once, 260);
  }

  window.DSButton = { swap: swap };
})();

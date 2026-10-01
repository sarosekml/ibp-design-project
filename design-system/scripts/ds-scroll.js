/* =========================================================================
   DS Scroll — полосы прокрутки ДС (Layout 1.013). Два механизма.

   1. .ds-scroll — внутренние области. Вид полосы — styles/layout.css
      (.ds-scroll): только бегунок, в покое скрыт. Здесь одно: пока область
      прокручивается, на ней стоит класс .is-scrolling, и через HIDE_AFTER мс
      после остановки он снимается — плавное затухание делает переход в CSS.
      Слушатель один, делегированный: событие scroll не всплывает, поэтому он
      стоит на document в фазе захвата и видит прокрутку любого элемента.
      Привязывать ничего не нужно — работает и для разметки, нарисованной
      скриптом после загрузки.
      Тот же класс получают области компонентов с полосой в виде .ds-scroll
      (Layout 1.014, 01.10.2026): тела Modal, Drawer, Popover, списки
      ContextMenu (.menu--scroll), DropdownList (.ddl--scroll) и NavPanel. Класса
      ds-scroll в их разметке нет — вид задаёт CSS компонента, здесь только
      показ. Тело таблицы ведёт свой рантайм (ds-table.js).

   2. .ds-page-scroll — сама страница экрана (body > .nav-layout). Системная
      полоса документа скрыта в layout.css: она занимает место у окна, и
      рабочая область меняла ширину, когда прокрутка появлялась и пропадала
      (переключение табов). Вместо неё здесь вставляется дорожка с бегунком
      ДС — оверлеем в правом поле контента. Рантайм размеряет бегунок по
      окну и высоте документа, двигает его при прокрутке, даёт тянуть мышью
      и показывает так же, как у .ds-scroll: .is-scrolling на время
      прокрутки, .is-dragging, пока тянут. Пересчёт — на прокрутке, на
      изменении окна и на изменении высоты body (ResizeObserver: смена таба,
      раскрытие секции, подгрузка данных). Прокручивать нечего — дорожка
      [hidden]. Колесо, клавиатура и тач работают у документа как обычно:
      дорожка только показывает положение и даёт его перетащить.
   ========================================================================= */
(function () {
  'use strict';

  var HIDE_AFTER = 800; /* мс после последнего события scroll */
  var THUMB_MIN = 32;   /* минимальная высота бегунка страницы, px */
  /* области, которым .is-scrolling ставится при прокрутке: см. шапку */
  var AREAS = '.ds-scroll, .modal__body, .drawer__body, .pop__body, .menu--scroll, .ddl--scroll, .nav__list';

  function flash(el) {
    el.classList.add('is-scrolling');
    clearTimeout(el.__dsScrollTimer);
    el.__dsScrollTimer = setTimeout(function () {
      el.classList.remove('is-scrolling');
    }, HIDE_AFTER);
  }

  document.addEventListener('scroll', function (e) {
    var el = e.target;
    if (!el || !el.matches || !el.matches(AREAS)) return;
    flash(el);
  }, { capture: true, passive: true });

  /* ---------- полоса страницы ---------- */
  function pageScroll() {
    if (!document.querySelector('body > .nav-layout')) return;
    if (document.querySelector('body > .ds-page-scroll')) return;

    var root = document.documentElement;
    var bar = document.createElement('div');
    bar.className = 'ds-page-scroll';
    bar.setAttribute('aria-hidden', 'true');
    bar.hidden = true;
    var thumb = document.createElement('div');
    thumb.className = 'ds-page-scroll__thumb';
    bar.appendChild(thumb);
    document.body.appendChild(bar);

    var geo = { track: 0, size: 0, range: 0 }; /* дорожка, бегунок, ход прокрутки */
    var frame = 0;

    function update() {
      frame = 0;
      var view = window.innerHeight;
      var range = root.scrollHeight - view;
      if (range <= 1) { bar.hidden = true; geo.range = 0; return; }
      bar.hidden = false;
      var track = bar.clientHeight;
      var size = Math.max(THUMB_MIN, Math.round(track * view / root.scrollHeight));
      var top = (track - size) * Math.min(1, Math.max(0, window.scrollY / range));
      thumb.style.height = size + 'px';
      thumb.style.transform = 'translateY(' + top + 'px)';
      geo.track = track; geo.size = size; geo.range = range;
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }

    window.addEventListener('scroll', function () { schedule(); flash(bar); }, { passive: true });
    window.addEventListener('resize', schedule);
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(document.body);

    /* перетаскивание: сдвиг бегунка → сдвиг прокрутки в пропорции хода */
    var drag = null;
    thumb.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || !geo.range) return;
      e.preventDefault();
      drag = { y: e.clientY, from: window.scrollY };
      thumb.setPointerCapture(e.pointerId);
      bar.classList.add('is-dragging');
      root.classList.add('ds-page-scroll-drag');
    });
    thumb.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var free = geo.track - geo.size;
      if (free <= 0) return;
      window.scrollTo(0, drag.from + (e.clientY - drag.y) * geo.range / free);
    });
    function stop() {
      if (!drag) return;
      drag = null;
      bar.classList.remove('is-dragging');
      root.classList.remove('ds-page-scroll-drag');
    }
    thumb.addEventListener('pointerup', stop);
    thumb.addEventListener('pointercancel', stop);
    thumb.addEventListener('lostpointercapture', stop);

    update();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pageScroll);
  else pageScroll();
})();

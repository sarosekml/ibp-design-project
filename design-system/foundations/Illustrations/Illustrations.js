/* ds-illustrations.js — подставляет реальные SVG в слоты .illu[data-illu].
   Использование: <span class="illu" data-illu="deals" aria-hidden="true"></span>
   Путь к файлу: assets/illustrations/<data-illu>.svg (учитывает window.__DS_ROOT,
   как ds-nav.js). Если файл не найден — img удаляет себя, слот пустеет и
   foundations/Illustrations/Illustrations.css рисует штриховую заглушку (.illu:empty).
   Тёмная тема: для иллюстраций из списка DARK (у которых есть
   assets/illustrations/<имя>-dark.svg) под тёмной темой берётся тёмный вариант,
   при ошибке загрузки — обычный. Смена темы перерисовывает слоты.
   (RE0010 — проба на current-depo; RE0011 — все тайловые и фон, генератор
   design-system/tools/illustration-dark.mjs) */
(function () {
  /* Имена, у которых есть тёмный вариант <имя>-dark.svg (тайловые RE0011). */
  var DARK = {
    'deals': 1, 'booked-deals': 1, 'calclate-fv': 1, 'cash-flow': 1, 'ckp-pipeline': 1,
    'clients': 1, 'corporate-transactions': 1, 'current-depo': 1, 'dcm-pipeline': 1,
    'dcm-potentials': 1, 'ecm-pipeline': 1, 'empty-check': 1, 'empty-folder': 1,
    'empty-loading': 1, 'important-deals': 1, 'important-leads': 1, 'kpki-cal': 1,
    'mna-pipeline': 1, 'payment-ib': 1, 'pipeline': 1, 'possible-deals': 1,
    'possible-leads': 1, 'potentials-rd': 1, 'qliksense-reports': 1, 'registry': 1,
    'reports-1-c': 1, 'reserve': 1, 'rwa': 1, 'sales-company': 1, 'sales-projects': 1,
    'settings': 1, 'tasks': 1
  };

  function isDarkTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    return t === 'ibp-dark' || t === 'service';
  }

  function render() {
    var root = window.__DS_ROOT || '';
    var dark = isDarkTheme();
    document.querySelectorAll('.illu[data-illu]').forEach(function (el) {
      if (el.querySelector('img')) return;
      var name = el.getAttribute('data-illu');
      var base = root + 'assets/illustrations/' + name;
      var img = document.createElement('img');
      img.alt = '';
      img.draggable = false;
      var plain = function () { img.onerror = function () { img.remove(); }; img.src = base + '.svg'; };
      if (dark && DARK[name]) { img.onerror = plain; img.src = base + '-dark.svg'; }
      else { img.onerror = function () { img.remove(); }; img.src = base + '.svg'; }
      el.appendChild(img);
    });
  }

  function rerender() {
    document.querySelectorAll('.illu[data-illu] img').forEach(function (i) { i.remove(); });
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
  // авто-рендер для слотов, добавленных в DOM позже (конструкторы/тайквики
  // перестраивают innerHTML — без наблюдателя новые слоты остаются пустыми
  // и показывают заглушку вместо иллюстрации).
  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      if (muts[i].addedNodes.length) { render(); return; }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('ds:themechange', rerender);
  window.DSIllustrations = { render: render };
})();

/* ============================================================
   kit-nav.js — левая панель витрины и карточки компонентов на обзоре.

   Правила локальных компонентов ДС требуют одну навигацию по категориям и
   на обзоре кита, и на странице каждого компонента, а список — из
   паспортов, в одном файле. Список лежит в kit-data.js (его собирает
   kit-build.mjs из паспортов), а этот модуль его рисует, чтобы разметка
   панели не копировалась в каждую страницу.

   Панель — компонент ДС NavPanel: группа = категория паспорта
   (.nav__block + .nav__block-label), пункт = компонент (.nav__item),
   текущий — .nav__item--selected. Окна и поповеры тайла — под-пункты его
   аккордеона (.nav__item--acc + .nav__sub): в ките они не самостоятельны.

   Вызов со страницы:
     IBPKitNav.render({ nav, groups, base, current, hub })
       nav     — узел <nav class="nav">
       groups  — узел под карточки (на странице компонента его нет)
       base    — путь от страницы до папки витрины ('.' или '../..')
       current — id текущего компонента или null
       hub     — путь от страницы до хаба: строка пользователя в футере
                 ведёт туда, как на всех экранах проекта (статичный футер в
                 разметке страницы ведёт туда же)
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var byName = function (a, b) { return a.name.localeCompare(b.name, 'ru'); };

  /* Группы в порядке категорий проекта; внутри — по алфавиту видимого
     названия (правила ДС). Пустая категория тоже рисуется: по ней видно,
     куда класть новый компонент. Окна и поповеры — у своего тайла. */
  function grouped(kit) {
    var top = kit.components.filter(function (c) { return !c.owner; });
    return kit.categories.map(function (cat) {
      return { category: cat, items: top.filter(function (c) { return c.category === cat; }).sort(byName) };
    });
  }
  function artifactsOf(kit, id) {
    return kit.components.filter(function (c) { return c.owner === id; }).sort(byName);
  }

  function item(href, name, selected, extra) {
    return '<a class="nav__item' + (selected ? ' nav__item--selected' : '') + (extra || '') + '" href="' + esc(href) + '"'
      + (selected ? ' aria-current="page"' : '') + '><span class="nav__label">' + esc(name) + '</span></a>';
  }

  /* Родитель аккордеона по контракту ДС не ведёт по ссылке — ds-nav-panel.js
     перехватывает клик. Поэтому страница самого тайла — первый под-пункт
     «Обзор», иначе на неё из панели не попасть. */
  function listHTML(kit, groups, base, current) {
    return groups.map(function (g) {
      var s = '<div class="nav__block"><p class="nav__block-label">' + esc(g.category) + '</p>';
      if (!g.items.length) {
        return s + '<span class="nav__item nav__item--disabled" aria-disabled="true"><span class="nav__label">пока пусто</span></span></div>';
      }
      g.items.forEach(function (it) {
        var arts = artifactsOf(kit, it.id);
        var href = base + '/' + it.doc;
        if (!arts.length) { s += item(href, it.name, it.id === current); return; }
        var open = it.id === current || arts.some(function (a) { return a.id === current; });
        var subId = 'kit-sub-' + it.id;
        s += '<a class="nav__item nav__item--acc' + (it.id === current ? ' nav__item--selected' : '') + '" href="#"'
          + ' aria-expanded="' + (open ? 'true' : 'false') + '" aria-controls="' + subId + '">'
          + '<span class="nav__label">' + esc(it.name) + '</span><span class="nav__caret"><i data-icon="chevron-down"></i></span></a>'
          + '<div class="nav__sub" id="' + subId + '"><div class="nav__sub-in">'
          + item(href, 'Обзор', it.id === current)
          + arts.map(function (a) { return item(base + '/' + a.doc, a.name, a.id === current); }).join('')
          + '</div></div>';
      });
      return s + '</div>';
    }).join('');
  }

  function cardsHTML(kit, groups, base) {
    return groups.map(function (g) {
      var cards = g.items.map(function (it) {
        var arts = artifactsOf(kit, it.id);
        return '<a class="tile tile--card kit-card col-4 colw-6" href="' + esc(base + '/' + it.doc) + '">'
          + '<header class="tile__header"><div class="tile__header-main">'
          + '<div class="tile__title-row"><h3 class="tile__title">' + esc(it.name) + '</h3></div>'
          + (it.stub ? '<div class="tile__chiplist"><span class="chip chip--xs"><span class="chip__label">Заглушка</span></span></div>' : '')
          + '</div></header>'
          + '<div class="tile__body"><p class="kit-card__purpose">' + esc(it.purpose) + '</p>'
          + '<p class="kit-card__meta">' + esc(it.typeLabel) + ' · ' + esc(it.module)
          + (arts.length ? ' · окна и поповеры: ' + arts.length : '') + '</p>'
          + '</div></a>';
      }).join('');
      return '<section class="kit-group">'
        + '<h2 class="kit-group__head">' + esc(g.category) + '<span class="kit-group__count">' + g.items.length + '</span></h2>'
        + (g.items.length ? '<div class="grid12">' + cards + '</div>' : '<p class="kit-card__empty">В этой категории пока нет компонентов</p>')
        + '</section>';
    }).join('');
  }

  /* Футер панели стоит в разметке страницы целиком — анатомию NavPanel
     приёмка читает в .html (линтер ДС, F5). Если каталог ДС подключён, футер
     заменяется его IBPHome.footerHTML: у него строка пользователя ведёт на
     «#», здесь она подменяется ссылкой на хаб. */
  function refreshFooter(nav, hub) {
    if (!window.IBPHome || !window.IBPHome.footerHTML) return;
    var from = ' href="#" aria-label="Открыть личный кабинет"';
    var to = ' href="' + esc(hub) + '" aria-label="Хаб проектов"';
    var html = window.IBPHome.footerHTML(window.IBPHome.defaultRole || 'Финансист ДИД').replace(from, to);
    var old = nav.querySelector('.nav__footer');
    if (old) old.outerHTML = html;
    else nav.insertAdjacentHTML('beforeend', html);
  }

  function render(opts) {
    var kit = window.IBPKit;
    if (!kit) return;
    var groups = grouped(kit);
    var base = opts.base || '.';
    var list = opts.nav && opts.nav.querySelector('.nav__list');
    if (list) list.innerHTML = listHTML(kit, groups, base, opts.current || null);
    if (opts.nav && opts.hub) refreshFooter(opts.nav, opts.hub);
    if (opts.groups) opts.groups.innerHTML = cardsHTML(kit, groups, base);
    if (window.dsIcons) window.dsIcons.apply(document);
  }

  window.IBPKitNav = { render: render };
})();

/* ============================================================
   NewsTile.js — тайл «Новости по клиентам» из HomeStore.

   Тайл сам находит свои корни (.lc-news) на DOMContentLoaded и рисует ленту
   — живой и на странице, и в витрине. Загрузку ставит страница.

   API (window.LcNewsTile):
     render(root)            — лента выбранной выборки (до пяти новостей)
     setState(root, state)   — data-state; data|empty считает сам по данным
     refresh(root)           — обновление: updating → данные
   Хук рантайма — data-segctrl (переключатель «Мои клиенты / Клиенты моего
   деска»). Ссылка «Открыть в источнике» ведёт по url новости; в прототипе
   адресов нет — страница показывает уведомление (home:goto).
   ============================================================ */
(function () {
  'use strict';

  var LIMIT = 5;
  var EMPTY_TEXT = { MY: 'О ваших клиентах новостей пока нет', DESK: 'О клиентах деска новостей пока нет' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function st(root) { return root.__lcNews || (root.__lcNews = { scope: 'MY' }); }

  function itemHTML(n, S) {
    return '<article class="lc-news__item" data-news-id="' + esc(n.newsId) + '">' +
      '<div class="lc-news__meta">' +
        '<span>' + esc(S.fmt.date(n.publishedAt)) + '</span>' +
        '<span class="lc-news__source">' + esc(n.sourceName) + '</span>' +
        '<a class="ibtn ibtn--neutral ibtn--s lc-news__open" href="' + esc(n.url) + '" data-home-goto="news-source" aria-label="Открыть в источнике: ' + esc(n.sourceName) + '" data-tooltip="Открыть в источнике"><i data-icon="arrow-up-right"></i></a>' +
      '</div>' +
      '<h4 class="lc-news__title">' + esc(n.title) + '</h4>' +
      '<p class="lc-news__text">' + esc(n.summary) + '</p>' +
    '</article>';
  }

  function setState(root, state) {
    var S = window.HomeStore;
    if (state === 'data' || state === 'empty') state = S && S.news(st(root).scope).length ? 'data' : 'empty';
    root.setAttribute('data-state', state);
  }

  function render(root) {
    var S = window.HomeStore;
    if (!S) return;
    var s = st(root);
    var list = root.querySelector('.lc-news__list');
    if (window.DSTooltip) window.DSTooltip.hideAll();
    list.innerHTML = S.news(s.scope).slice(0, LIMIT).map(function (n) { return itemHTML(n, S); }).join('');
    root.querySelector('.lc-news__empty').textContent = EMPTY_TEXT[s.scope];
    if (window.dsIcons) window.dsIcons.apply(root);
    if (window.DSTooltip) window.DSTooltip.bindAll(list);
  }

  function refresh(root) {
    setState(root, 'updating');
    setTimeout(function () { setState(root, 'data'); render(root); }, 900);
  }

  function init(root) {
    if (root.__lcNewsInit) return;
    root.__lcNewsInit = true;
    var s = st(root);
    var seg = root.querySelector('.lc-news__scope');
    function syncScope() {
      setTimeout(function () {
        var on = seg.querySelector('.segctrl__item[aria-checked="true"]');
        var scope = on ? on.getAttribute('data-scope') : 'MY';
        if (scope !== s.scope) {
          s.scope = scope;
          var cur = root.getAttribute('data-state');
          if (cur === 'data' || cur === 'empty') setState(root, 'data');
          render(root);
        }
      }, 0);
    }
    seg.addEventListener('click', syncScope);
    seg.addEventListener('keydown', syncScope);
    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-news-act="refresh"], [data-news-act="retry"]')) refresh(root);
    });
    render(root);
  }

  function initAll() { document.querySelectorAll('.lc-news').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll); else initAll();

  window.LcNewsTile = { render: render, setState: setState, refresh: refresh, init: init };
})();

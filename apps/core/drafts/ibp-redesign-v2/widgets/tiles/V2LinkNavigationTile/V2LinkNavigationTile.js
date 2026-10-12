/* V2LinkNavigationTile — плитка со ссылками раздела «Администрирование».
   render(host, { title, subtitle, groups, cols }) — groups: {label?, links:
   {label, href}[]}[]; ссылка без href — вне объёма (Р5): вид как у живой,
   клик гасится (data-inert), ревью MS0014, З1. cols — колонок групп (1–4). */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }

  function render(host, opts) {
    if (!host || !opts) return;
    var root = host.classList.contains('lc-link-nav') ? host : host.querySelector('.lc-link-nav') || host;
    set(root, '[data-ln-title]', opts.title);
    set(root, '[data-ln-subtitle]', opts.subtitle);
    root.setAttribute('data-cols', String(Math.max(1, Math.min(4, opts.cols || 1))));
    var box = root.querySelector('[data-ln-groups]');
    if (!box) return;
    box.innerHTML = (opts.groups || []).map(function (g) {
      return '<div class="lc-link-nav__group">' + (g.label ? '<p class="lc-link-nav__label">' + esc(g.label) + '</p>' : '')
        + '<div class="lc-link-nav__links">' + (g.links || []).map(function (l) {
          return '<a class="link link--accent link--m" href="' + (l.href || '#') + '"' + (l.href ? '' : ' data-inert') + '>' + esc(l.label) + '</a>';
        }).join('') + '</div></div>';
    }).join('');
  }

  window.LcLinkNavigationTile = { render: render };
})();

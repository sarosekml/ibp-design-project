/* =========================================================================
   nav-links.js — меню и карта страниц концепта ibp-redesign-v2. Один
   источник для всех страниц (MS0014a, С1).

   Страница держит в разметке только анатомию NavPanel: .nav__top (бургер и
   пин), пустой .nav__list[data-nav-list] и .nav__footer со строкой
   пользователя — ссылкой на хаб. Пункты меню, имя и роль пользователя
   заполняет IBPR_NAV.mount() из каталога роли «Аналитик ДИД»
   (design-system/patterns/HomeRoles/ibp-home.js) и этой карты. Анатомия в
   разметке нужна сторожам: Б31 сенсора читает .nav__pin и .nav__user,
   П5 сторожа хаба — ссылку строки пользователя на хаб.

   Имена страниц — имена фронтенда (MS0014a, раздел 3). Страница с метками
   <ds-include> открывается собранной .preview.html: по file:// fetch не
   работает, поэтому ссылка всегда ведёт на сборку.

   Пункт без страницы (null) — вне объёма части 1 (Р5): виден как в системе,
   клик гасится, адрес не меняется, сообщения нет.

   Подключается после ds-body.js (ibp-home.js), employees.js.
   API: window.IBPR_NAV
     PAGES — ключ страницы → файл; href(key, params) → адрес
     mount({ active }) — заполнить меню; active — id пункта каталога или 'home'
     select(key) — перенести выделение на пункт страницы key; itemOf(key) — id пункта
     inert(root) — погасить клики по [data-inert] внутри root
   ========================================================================= */
(function () {
  'use strict';

  /** Страницы концепта: ключ → файл (имя фронтенда, сборка .preview.html). */
  var PAGES = {
    home: 'HomePage.html',
    binding: 'BindingActiveNewOpportunities.preview.html',
    possible: 'PossibleActiveNewOpportunities.preview.html',
    cib: 'OpportunityActiveSalesProjects.preview.html',
    campaign: 'CampaignsActiveOpportunities.preview.html',
    pipeline: 'MyDeskOpportunities.preview.html',
    opportunity: 'Opportunity.preview.html',
    product: 'OpportunityProduct.preview.html',
    leads: 'LeadsPage.preview.html',
    bindingLeads: 'BindingAllLeadsPage.preview.html',
    possibleLeads: 'PossibleAllLeadsPage.preview.html',
    potential: 'PotentialPage.preview.html',
    clients: 'MyClientsPage.preview.html',
    client: 'ClientInfoPage.preview.html',
    clientComments: 'ClientComments.preview.html',
    meetings: 'MeetingsProtocolsPage.preview.html',
    tasks: 'TasksPage.preview.html',
    admin: 'AdminPage.preview.html',
    taskStates: 'TaskStatesPage.preview.html'
  };
  PAGES.board = 'HomeBoard.preview.html';
  PAGES.leadsNew = 'LeadsNew.preview.html';
  PAGES.lead = 'Lead.preview.html';
  var MODE_KEY = 'ibp-redesign-v2-mode';
  var requestedMode = new URLSearchParams(window.location.search).get('mode');
  var currentMode = 'after';
  try { currentMode = requestedMode || sessionStorage.getItem(MODE_KEY) || 'after'; } catch (e) { currentMode = requestedMode || 'after'; }
  if (window.location.pathname.endsWith('/HomePage.html') && !requestedMode) currentMode = 'before';
  if (['HomeBoard', 'LeadsNew', 'Lead'].some(function (name) { return window.location.pathname.endsWith('/' + name + '.html') || window.location.pathname.endsWith('/' + name + '.preview.html'); }) && !requestedMode) currentMode = 'after';
  try { sessionStorage.setItem(MODE_KEY, currentMode); } catch (e) { /* режим в памяти */ }
  PAGES.home = currentMode === 'before' ? 'HomePage.html' : PAGES.board;

  /** Пункт каталога → ключ страницы (null — вне объёма, Р5). */
  var NAV_LINKS = {
    'obligatory-deals': 'binding',
    'possible-deals': 'possible',
    'leads': 'leads',
    'obligatory-leads': 'bindingLeads',
    'possible-leads': 'possibleLeads',
    'sales-projects': 'cib',
    'sales-company': 'campaign',
    'pipeline': 'pipeline',
    'pipeline-ckp': null,
    'pipeline-mna': null,
    'kpki-calendar': null,
    'current-portfolio': null,
    'cf-sbi': null,
    'corporate-requests': null,
    'reports-for-risks': null,
    'clients': 'clients',
    'meetings': 'meetings',
    'tasks': 'tasks',
    'qliksense-reports': null,
    'admin': 'admin'
  };

  function href(key, params) {
    if (key === 'potential' && currentMode === 'after' && params && params.mode !== 'before' && window.LEADS && window.LEADS.get(params.id)) key = 'lead';
    var file = PAGES[key];
    if (!file) return null;
    if (!params) return file;
    var q = Object.keys(params).filter(function (k) { return params[k] != null && params[k] !== ''; })
      .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
    return q ? file + '?' + q : file;
  }

  function ic(name) { return '<i data-icon="' + name + '"></i>'; }

  function itemHTML(it, active) {
    var sel = it.id === active;
    if (it.tile && it.tile.links && it.tile.links.length) {
      var sub = '<div class="nav__sub" id="nav-sub-' + it.id + '"><div class="nav__sub-in">'
        + it.tile.links.map(function (l) { return '<a class="nav__item" href="#" data-inert><span class="nav__label">' + l + '</span></a>'; }).join('')
        + '</div></div>';
      return '<a class="nav__item nav__item--acc" href="#" aria-expanded="false" aria-controls="nav-sub-' + it.id + '">'
        + '<span class="nav__ico">' + ic(it.icon) + '</span><span class="nav__label">' + it.label + '</span>'
        + '<span class="nav__caret">' + ic('chevron-down') + '</span></a>' + sub;
    }
    var key = NAV_LINKS[it.id];
    var url = key ? href(key) : null;
    var badge = it.badge
      ? '<span class="nav__badge"><span class="badge badge--xs badge--accent" aria-hidden="true">' + it.badge + '</span></span>'
      : '';
    return '<a class="nav__item' + (sel ? ' nav__item--selected' : '') + '" href="' + (url || '#') + '"'
      + (url ? '' : ' data-inert') + (sel ? ' aria-current="page"' : '')
      + (it.badge ? ' aria-label="' + it.label + ', ' + (it.badgeLabel || it.badge) + '"' : '') + '>'
      + '<span class="nav__ico">' + ic(it.icon) + '</span><span class="nav__label">' + it.label + '</span>' + badge + '</a>';
  }

  function inert(root) {
    (root || document).addEventListener('click', function (e) {
      var a = e.target.closest('[data-inert]');
      if (a) e.preventDefault();
    });
  }

  /* Состояние системы прототипа — в табе «System» панели прототипа (MS0016,
     правило скилла proto-panel §9): «Было / Стало», число новых лидов у пункта
     меню и сброс демо в интерфейс прототипа не ставятся. */
  var NEW_KEY = 'ibp-redesign-v2-new-leads';
  var lastMount = null;
  // [ПРЕДЛОЖЕНИЕ] Сворачивание групп только в новом подходе этого концепта.
  var GROUPS_KEY = 'ibp-redesign-v2-nav-groups';
  var collapsedGroups = new Set();
  try { collapsedGroups = new Set(JSON.parse(sessionStorage.getItem(GROUPS_KEY) || '[]')); } catch (e) { /* все раскрыты */ }
  function syncGroups(nav) {
    var rail = nav.classList.contains('nav--rail');
    nav.querySelectorAll('[data-nav-group-toggle]').forEach(function (button) {
      var collapsed = collapsedGroups.has(button.dataset.navGroupToggle);
      var body = document.getElementById(button.getAttribute('aria-controls'));
      button.setAttribute('aria-expanded', String(!collapsed));
      button.setAttribute('aria-label', (collapsed ? 'Развернуть раздел «' : 'Свернуть раздел «') + button.dataset.navGroupLabel + '»');
      // В rail заголовки недоступны: показываем все иконки, сохраняя выбор для раскрытой панели.
      if (body) body.hidden = collapsed && !rail;
    });
    if (window.dsIcons) window.dsIcons.apply(nav);
  }
  function bindGroups(nav) {
    if (!nav.querySelector('[data-nav-group-toggle]')) return;
    if (!document.getElementById('lead-nav-sections-css')) {
      var css = document.createElement('link');
      css.id = 'lead-nav-sections-css'; css.rel = 'stylesheet'; css.href = 'NavSections.css';
      document.head.appendChild(css);
    }
    if (!nav.__leadGroupsBound) {
      nav.__leadGroupsBound = true;
      nav.addEventListener('click', function (e) {
        var button = e.target.closest('[data-nav-group-toggle]');
        if (!button || !nav.contains(button)) return;
        var key = button.dataset.navGroupToggle;
        if (collapsedGroups.has(key)) collapsedGroups.delete(key); else collapsedGroups.add(key);
        try { sessionStorage.setItem(GROUPS_KEY, JSON.stringify(Array.from(collapsedGroups))); } catch (err) { /* в памяти */ }
        syncGroups(nav);
      });
      nav.addEventListener('ds-nav-mode', function () { syncGroups(nav); });
    }
    syncGroups(nav);
  }
  function newLeads() { try { var v = sessionStorage.getItem(NEW_KEY); return v == null ? '7' : v; } catch (e) { return '7'; } }
  function resetDemo() {
    try { sessionStorage.removeItem('ibp-redesign-v2-state'); sessionStorage.removeItem(NEW_KEY); } catch (e) { /* хранилище недоступно */ }
    window.location.reload();
  }
  (window.PP_SYSTEM = window.PP_SYSTEM || []).push(
    { id: 'mode', title: 'Подход', desc: 'Было — разделы текущей системы, Стало — единые лиды и доска «Мои проекты».', reload: true,
      options: [{ value: 'before', label: 'Было' }, { value: 'after', label: 'Стало' }],
      value: function () { return currentMode; },
      set: function (v) { window.location.href = v === 'before' ? 'HomePage.html?mode=before' : PAGES.board + '?mode=after'; } },
    { id: 'new-leads', title: 'Новые лиды с прошлого входа', desc: 'Счётчик у пункта меню «Лиды».',
      options: [{ value: '7', label: '7 новых' }, { value: '0', label: 'Нет новых' }],
      value: newLeads,
      set: function (v) { try { sessionStorage.setItem(NEW_KEY, v); } catch (e) { /* в памяти не храним */ } if (lastMount) mount(lastMount); } },
    { id: 'reset-demo', title: 'Демо-данные v2', desc: 'Вернуть лиды, встречи и сделки к исходной засевке.', action: 'Сбросить демо', run: resetDemo }
  );

  function mount(opts) {
    opts = opts || {};
    lastMount = opts;
    var nav = document.getElementById('nav');
    if (!nav || !window.IBPHome) return;
    var role = window.IBPR_NAV.role;
    var list = nav.querySelector('[data-nav-list]');
    var home = opts.active === 'home';
    var s = '<a class="nav__item' + (home ? ' nav__item--selected' : '') + '" href="' + PAGES.home + '"' + (home ? ' aria-current="page"' : '') + '>'
      + '<span class="nav__ico">' + ic('main-page') + '</span><span class="nav__label">Главная</span></a>';
    var groups = currentMode === 'before' ? window.IBPHome.itemsFor(role) : [
      { id: 'client-work', label: 'Работа с клиентом', items: [
        { id: 'leads-new', label: 'Лиды', icon: 'corporate-transactions', badge: newLeads() !== '0' ? newLeads() : null, badgeLabel: 'новых: ' + newLeads() },
        { id: 'clients', label: 'Клиенты', icon: 'client-search' },
        { id: 'meetings', label: 'Встречи', icon: 'calendar' },
        { id: 'tasks', label: 'Задачи', icon: 'tasks' }
      ] }
    ].concat(window.IBPHome.itemsFor(role).filter(function (g) {
      return ['pipeline', 'current-portfolio', 'reports', 'admin'].indexOf(g.id) >= 0;
    }).map(function (g) {
      return { id: g.id, label: g.label, items: g.items.map(function (it) {
        // В новом подходе — шестерёнка; исходный каталог ДС не меняется.
        return it.id === 'admin' ? Object.assign({}, it, { icon: 'settings' }) : it;
      }) };
    }));
    NAV_LINKS['leads-new'] = 'leadsNew';
    groups.forEach(function (g, i) {
      var collapsible = currentMode === 'after';
      var bodyId = 'lead-nav-group-' + g.id;
      s += '<div class="nav__block' + (i === 0 ? ' nav__block--first' : '') + '"><div class="nav__block-label"' + (collapsible ? ' data-nav-section-header' : '') + '>'
        + (collapsible ? '<button type="button" data-nav-group-toggle="' + g.id + '" data-nav-group-label="' + g.label + '" aria-controls="' + bodyId + '" aria-expanded="true" aria-label="Свернуть раздел «' + g.label + '»">' + g.label + '</button>' : g.label) + '</div>';
      if (collapsible) s += '<div id="' + bodyId + '" data-nav-section-body>';
      g.items.forEach(function (it) { s += itemHTML(it, opts.active); });
      if (collapsible) s += '</div>';
      s += '</div>';
    });
    if (list) list.innerHTML = s;
    var u = window.IBPR_NAV.user;
    var put = function (sel, text) { var el = nav.querySelector(sel); if (el) el.textContent = text; };
    put('.nav__user-name', u.fullName);
    put('.nav__user-role', role);
    put('.nav__user .av__text', u.initials);
    if (window.dsIcons) window.dsIcons.apply(nav);
    if (window.DSNavPanel) window.DSNavPanel.bind(nav);
    bindGroups(nav);
  }

  /* Перенести выделение меню на пункт другой страницы без перестройки меню
     (сделка сменила раздел после «Взять в работу»). key — ключ страницы. */
  function select(key) {
    var nav = document.getElementById('nav');
    var url = href(key);
    if (!nav || !url) return;
    nav.querySelectorAll('.nav__item--selected').forEach(function (a) {
      a.classList.remove('nav__item--selected');
      a.removeAttribute('aria-current');
    });
    var a = nav.querySelector('.nav__item[href="' + url + '"]');
    if (a) { a.classList.add('nav__item--selected'); a.setAttribute('aria-current', 'page'); }
  }

  /* Пункт каталога по ключу страницы (обратная карта NAV_LINKS). */
  function itemOf(key) {
    for (var id in NAV_LINKS) if (NAV_LINKS[id] === key) return id;
    return null;
  }

  var cur = window.MOCK_CURRENT_USER || {};
  window.NAV_LINKS = NAV_LINKS;
  window.IBPR_NAV = {
    role: 'Аналитик ДИД',
    /* Путь до хаба от страницы концепта: pages/ → drafts/ → core/ → apps/ → корень. */
    hubHref: '../../../../../index.html',
    /* Демо-пользователь концепта (допущение ТЗ MS0014 §3) — из employees.js. */
    user: { fullName: cur.fullName || 'Ким Александр Сергеевич', initials: cur.initials || 'КА', desk: 'SMB Природные ресурсы +6' },
    PAGES: PAGES,
    href: href,
    mount: mount,
    select: select,
    itemOf: itemOf,
    mode: function () { return currentMode; },
    inert: inert,
    pageHref: function (itemId) { var k = NAV_LINKS[itemId]; return k ? href(k) : null; }
  };
  inert(document);
})();

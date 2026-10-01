/* ============================================================
   DS NAV — построение левой навигации и подсветка текущей страницы
   Структура: Основы · Компоненты (Атомы / Молекулы / Организмы) · Правила и паттерны
   Закреплённый низ: «Хаб проектов» — выход в корень рабочего пространства
   ============================================================ */
(function () {
  var ROOT = window.__DS_ROOT || '';
  var NAV = [
    {
      cat: 'Основы',
      items: [
        { label: 'Иконки',      href: 'foundations/Icons/Icons.html' },
        { label: 'Иллюстрации', href: 'foundations/Illustrations/Illustrations.html' },
        { label: 'Каркас экрана', href: 'foundations/Layout/Layout.html' },
        { label: 'Сетка и отступы', href: 'foundations/Spacing/Spacing.html' },
        { label: 'Скругления',  href: 'foundations/Radius/Radius.html' },
        { label: 'Тени',        href: 'foundations/Elevation/Elevation.html' },
        { label: 'Типографика', href: 'foundations/Typography/Typography.html' },
        { label: 'Цвета',       href: 'foundations/Colors/Colors.html' }
      ]
    },
    {
      cat: 'Компоненты',
      groups: [
        {
          group: 'Атомы',
          items: [
            { label: 'Avatar',       href: 'components/atoms/Avatar/Avatar.html' },
            { label: 'Badge',        href: 'components/atoms/Badge/Badge.html' },
            { label: 'Button',       href: 'components/atoms/Buttons/Buttons.html' },
            { label: 'Checkbox',     href: 'components/atoms/Checkbox/Checkbox.html' },
            { label: 'Chip',         href: 'components/atoms/Chip/Chip.html' },
            { label: 'Divider',      href: 'components/atoms/Divider/Divider.html' },
            { label: 'IconButton',   href: 'components/atoms/IconButton/IconButton.html' },
            { label: 'Label / Helper', href: 'components/atoms/LabelHelper/LabelHelper.html' },
            { label: 'Link',         href: 'components/atoms/Link/Link.html' },
            { label: 'ProgressBar',  href: 'components/atoms/ProgressBar/ProgressBar.html' },
            { label: 'Radiobutton',  href: 'components/atoms/Radiobutton/Radiobutton.html' },
            { label: 'Skeleton',     href: 'components/atoms/Skeleton/Skeleton.html' },
            { label: 'Spinner',      href: 'components/atoms/Spinner/Spinner.html' },
            { label: 'Switch',       href: 'components/atoms/Switch/Switch.html' }
          ]
        },
        {
          group: 'Молекулы',
          items: [
            { label: 'Alert',            href: 'components/molecules/Alert/Alert.html' },
            { label: 'Breadcrumbs',       href: 'components/molecules/Breadcrumbs/Breadcrumbs.html' },
            { label: 'ButtonGroup',      href: 'components/molecules/ButtonGroup/ButtonGroup.html' },
            { label: 'Context Menu',     href: 'components/molecules/ContextMenu/ContextMenu.html' },
            { label: 'DatePicker',       href: 'components/molecules/DatePicker/DatePicker.html' },
            { label: 'DropdownList',     href: 'components/molecules/DropdownList/DropdownList.html' },
            { label: 'EmptyState',       href: 'components/molecules/EmptyState/EmptyState.html' },
            { label: 'InputAmountRange', href: 'components/molecules/Inputs/InputAmountRange/InputAmountRange.html' },
            { label: 'InputAutocomplete', href: 'components/molecules/Inputs/InputAutocomplete/InputAutocomplete.html' },
            { label: 'InputDate',        href: 'components/molecules/Inputs/InputDate/InputDate.html' },
            { label: 'InputDateRange',   href: 'components/molecules/Inputs/InputDateRange/InputDateRange.html' },
            { label: 'InputText',        href: 'components/molecules/Inputs/InputText/InputText.html' },
            { label: 'NavTile',          href: 'components/molecules/NavTile/NavTile.html' },
            { label: 'Pagination',       href: 'components/molecules/Pagination/Pagination.html' },
            { label: 'ReadOnlyField',    href: 'components/molecules/ReadOnlyField/ReadOnlyField.html' },
            { label: 'SegmentControl',   href: 'components/molecules/SegmentControl/SegmentControl.html' },
            { label: 'Splitter',         href: 'components/molecules/Splitter/Splitter.html' },
            { label: 'SubTab',           href: 'components/molecules/SubTab/SubTab.html' },
            { label: 'Tab',              href: 'components/molecules/Tab/Tab.html' },
            { label: 'Toast',            href: 'components/molecules/Toast/Toast.html' },
            { label: 'Tooltip',          href: 'components/molecules/Tooltip/Tooltip.html' }
          ]
        },
        {
          group: 'Организмы',
          items: [
            { label: 'AllocationBar', href: 'components/organisms/AllocationBar/AllocationBar.html' },
            { label: 'Chart',    href: 'components/organisms/Chart/Chart.html' },
            { label: 'Drawer',   href: 'components/organisms/Drawer/Drawer.html' },
            { label: 'Entity',     href: 'components/organisms/Entity/Entity.html' },
            { label: 'Kanban',   href: 'components/organisms/Kanban/Kanban.html' },
            { label: 'Modal',    href: 'components/organisms/Modal/Modal.html' },
            { label: 'NavPanel', href: 'components/organisms/NavPanel/NavPanel.html' },
            { label: 'PageHeader', href: 'components/organisms/PageHeader/PageHeader.html' },
            { label: 'Popover',  href: 'components/organisms/Popover/Popover.html' },
            { label: 'ProductRow', href: 'components/organisms/ProductRow/ProductRow.html' },
            { label: 'RiskMetric', href: 'components/organisms/RiskMetric/RiskMetric.html' },
            { label: 'SnackBar',   href: 'components/organisms/SnackBar/SnackBar.html' },
            { label: 'Table',      href: 'components/organisms/Table/Table.html' },
            { label: 'TableCell',  href: 'components/organisms/TableCell/TableCell.html' },
            { label: 'TableFilter', href: 'components/organisms/TableFilter/TableFilter.html' },
            { label: 'Tile',       href: 'components/organisms/Tile/Tile.html' }
          ]
        }
      ]
    },
    {
      cat: 'Правила и паттерны',
      items: [
        { label: 'Локальные компоненты',  href: 'patterns/LocalComponents/LocalComponents.html' },
        { label: 'Главная страница · роли', href: 'patterns/HomeRoles/HomeRoles.html' },
        { label: 'Редполитика',           href: 'patterns/Redpolicy/Redpolicy.html' },
        { label: 'Тон оф войс',           soon: true },
        { label: 'Паттерны интерфейса',   soon: true }
      ],
    },
    {
      cat: 'RND',
      items: [
        { label: 'Общий бэклог',            href: 'rnd/Backlog/Backlog.html' }
      ]
    }
  ];

  // текущий файл
  var current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (current === '') current = 'index.html';

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function makeLink(item) {
    if (item.soon) {
      var s = el('span', 'ds-nav__link is-soon');
      s.appendChild(el('span', 'ds-nav__dot'));
      s.appendChild(el('span', 'ds-nav__label', item.label));
      s.appendChild(el('span', 'ds-nav__soon-badge', 'Скоро'));
      return s;
    }
    var a = el('a', 'ds-nav__link');
    a.href = ROOT + item.href;
    a.appendChild(el('span', 'ds-nav__dot'));
    a.appendChild(el('span', 'ds-nav__label', item.label));
    if (item.href.split('/').pop().toLowerCase() === current) {
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'page');
    }
    return a;
  }

  // ---- построение DOM ----
  var nav = el('nav', 'ds-nav');
  nav.setAttribute('aria-label', 'Навигация по дизайн-системе');

  var brand = el('a', 'ds-nav__brand');
  brand.href = ROOT + 'index.html';
  var logo = el('span', 'ds-nav__logo');
  logo.appendChild(el('img'));
  logo.querySelector('img').src = ROOT + 'assets/logo.svg';
  logo.querySelector('img').alt = 'IBP';
  brand.appendChild(logo);
  var bt = el('span', 'ds-nav__brandtext');
  bt.appendChild(el('span', 'ds-nav__title', 'ДС IBP'));
  bt.appendChild(el('span', 'ds-nav__sub', 'Investment Banking Platform'));
  brand.appendChild(bt);
  if (current === 'index.html') brand.classList.add('is-active');
  nav.appendChild(brand);

  var scroll = el('div', 'ds-nav__scroll');

  NAV.forEach(function (block) {
    var cat = el('div', 'ds-nav__cat');
    cat.appendChild(el('div', 'ds-nav__cat-label', block.cat));

    if (block.items) {
      block.items.forEach(function (it) { cat.appendChild(makeLink(it)); });
    }
    if (block.groups) {
      block.groups.forEach(function (g) {
        var gl = el('div', 'ds-nav__group-label', g.group);
        var real = g.items.filter(function (i) { return !i.soon; }).length;
        if (real) gl.appendChild(el('span', 'ds-nav__count', String(real)));
        cat.appendChild(gl);
        g.items.forEach(function (it) { cat.appendChild(makeLink(it)); });
      });
    }
    scroll.appendChild(cat);
  });

  nav.appendChild(scroll);

  /* Закреплённый низ панели — выход в хаб проектов (корневой index.html рабочего
     пространства, на уровень выше design-system/). Из документации ДС иначе не вернуться
     к проектам и концептам. Пункт строится не записью массива NAV: хаб — не
     страница ДС, в реестрах index.html и specs его нет, а линтер (D4) разбирает
     подписи NAV по категориям и втянул бы его в последнюю. */
  var foot = el('div', 'ds-nav__footer');
  var hub = el('a', 'ds-nav__link');
  hub.href = ROOT + '../index.html';
  hub.appendChild(el('span', 'ds-nav__dot'));
  hub.appendChild(el('span', 'ds-nav__label', 'Хаб проектов'));
  foot.appendChild(hub);
  nav.appendChild(foot);

  // мобильный тоггл + бэкдроп
  var toggle = el('button', 'ds-nav__toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Открыть навигацию');
  toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  var backdrop = el('div', 'ds-nav__backdrop');

  function setOpen(open) {
    document.body.classList.toggle('ds-nav-open', open);
  }
  toggle.addEventListener('click', function () { setOpen(!document.body.classList.contains('ds-nav-open')); });
  backdrop.addEventListener('click', function () { setOpen(false); });
  nav.addEventListener('click', function (e) { if (e.target.closest('.ds-nav__link')) setOpen(false); });


  // самодостаточность: подтягиваем свой стиль, если страница его не подключила
  function ensureCss() {
    if (document.querySelector('link[rel="stylesheet"][href$="ds-nav.css"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = (window.__DS_ROOT || '') + 'docs-kit/ds-nav.css';
    document.head.appendChild(l);
  }

  function mount() {
    // no-op guard: монтируемся только на страницах-хостах навигации (index и документация
    // имеют <main class="page">). Там, где скрипт подключён без этого контейнера, —
    // молча выходим и ничего не ломаем.
    if (!document.querySelector('main.page')) return;
    if (document.body.classList.contains('ds-has-nav')) return;
    ensureCss();
    document.body.classList.add('ds-has-nav');
    document.body.insertBefore(backdrop, document.body.firstChild);
    document.body.insertBefore(nav, document.body.firstChild);
    document.body.appendChild(toggle);
    // прокрутка к активному пункту, если он ниже сгиба
    var active = nav.querySelector('.ds-nav__link.is-active');
    if (active) {
      var top = active.offsetTop;
      if (top > scroll.clientHeight - 80) scroll.scrollTop = top - scroll.clientHeight / 2;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();

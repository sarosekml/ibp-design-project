/* ============================================================
   Themes.js — рантайм тем ДС (RE0005, Э3.2).
   Применение и хранение темы, сервисное окно переключения, API.

   Тема — атрибут `data-theme` на <html>. До первой отрисовки его ставит
   загрузчик приложений (`apps/ds-config.js`, генерат boot-build.mjs) и
   служебный тег страниц ДС (`docs-kit/ds-theme-boot.js`); этот рантайм
   дочитывает `?theme=` в хранилище (`localStorage`, ключ `ds.theme`),
   строит кнопку и панель и рассылает `ds:themechange`.

   API: window.DSTheme = { get(), set(id), list() }.
     get()   — текущая тема (`legacy`, если атрибута нет);
     set(id) — применить и сохранить; `legacy` снимает атрибут и запись;
     list()  — [{ id, label }]: «Текущая» + темы из `window.DS_THEMES.themes`.

   Окно — немодальная панель слева внизу; `Alt+Shift+T` открывает/закрывает,
   «Скрыть кнопку» прячет кнопку (вернуть — той же клавишей). Кнопку можно
   свободно перетаскивать левой клавишей (позиция — `ds.theme.pos`), панель
   открывается рядом с ней. В `legacy` метка
   на кнопке скрыта, при любой другой теме видно её название — снимок экрана
   для разработки не уйдёт в новой теме незаметно. Хром окна —
   `foundations/Themes/Themes.panel.css`; CSS компонентов рантайм подтягивает
   сам, если страница его не подключила (как `ensureCss()` в `ds-nav.js`).
   На экранах рантайм идёт в списке `ds.js`, на страницах ДС его грузит тег
   темы. Кнопка и окно помечены `data-theme="service"` — служебная тема,
   не зависящая от темы страницы (Э6); список тем в окне остаётся
   пользовательским (`PANEL`), `service` в него не входит.
   ============================================================ */
(function () {
  'use strict';
  if (window.DSTheme) return;

  var ROOT = window.__DS_ROOT || '';
  var KEY = 'ds.theme';
  var HIDE_KEY = 'ds.theme.hide';
  var POS_KEY = 'ds.theme.pos';
  var LEGACY = 'legacy';
  var LABELS = {
    'legacy': 'Текущая',
    'ibp-light': 'Новая светлая',
    'ibp-dark': 'Новая тёмная',
    'service': 'Сервисная'
  };
  /* Панель показывает пользовательские темы; service — служебная (Э6). */
  var PANEL = ['legacy', 'ibp-light', 'ibp-dark'];
  var FALLBACK = ['ibp-light', 'ibp-dark', 'service'];

  function area(kind) {
    var a = null;
    try { a = window[kind]; } catch (e) { a = null; }
    return {
      get: function (k) { try { return a ? a.getItem(k) : null; } catch (e) { return null; } },
      set: function (k, v) {
        try { if (!a) return; if (v === null) a.removeItem(k); else a.setItem(k, v); }
        catch (e) { /* хранилище недоступно (file://) — выбор живёт до перезагрузки */ }
      }
    };
  }
  var local = area('localStorage');

  function themeIds() {
    var d = window.DS_THEMES && window.DS_THEMES.themes;
    return (d && d.length) ? d.slice() : FALLBACK.slice();
  }
  function knownIds() { return [LEGACY].concat(themeIds()); }
  function label(id) { return LABELS[id] || id; }

  function get() {
    var v = document.documentElement.getAttribute('data-theme');
    return v || LEGACY;
  }

  function emit(id) {
    var ev;
    try { ev = new CustomEvent('ds:themechange', { detail: { theme: id } }); }
    catch (e) {
      ev = document.createEvent('CustomEvent');
      ev.initCustomEvent('ds:themechange', false, false, { theme: id });
    }
    document.dispatchEvent(ev);
  }

  function set(id) {
    id = id || LEGACY;
    if (knownIds().indexOf(id) < 0) {
      console.warn('DSTheme: неизвестная тема «' + id + '»');
      return get();
    }
    if (id === LEGACY) {
      document.documentElement.removeAttribute('data-theme');
      local.set(KEY, null);
    } else {
      document.documentElement.setAttribute('data-theme', id);
      local.set(KEY, id);
    }
    sync();
    emit(id);
    return id;
  }

  function list() {
    var out = [{ id: LEGACY, label: label(LEGACY) }];
    themeIds().forEach(function (t) { out.push({ id: t, label: label(t) }); });
    return out;
  }

  /* ---------------- окно ---------------- */

  var els = null;
  var dragState = null;
  var suppressClick = false;

  function ensureCss(rel) {
    var file = rel.split('/').pop();
    if (document.querySelector('link[rel="stylesheet"][href$="' + file + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = ROOT + rel;
    document.head.appendChild(l);
  }
  function css() {
    ensureCss('foundations/Themes/Themes.panel.css');   /* хром окна — вне бандла */
    if (document.querySelector('link[rel="stylesheet"][href$="/ds.css"]')) return;
    ensureCss('components/atoms/IconButton/IconButton.css');
    ensureCss('components/atoms/Buttons/Buttons.css');
    ensureCss('components/atoms/Link/Link.css');
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function build() {
    if (els) return;
    css();

    var launcher = el('div', 'ds-theme-launcher');
    launcher.setAttribute('data-theme', 'service');
    var btn = el('button', 'ibtn ibtn--neutral ibtn--l ibtn--circle');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Темы');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<i data-icon="settings"></i>';
    var mark = el('span', 'ds-theme-launcher__mark');
    mark.hidden = true;
    launcher.appendChild(btn);
    launcher.appendChild(mark);

    var panel = el('div', 'ds-theme-panel');
    panel.setAttribute('data-theme', 'service');
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', 'Темы');
    panel.appendChild(el('p', 'ds-theme-panel__title', 'Темы'));

    var listBox = el('div', 'ds-theme-panel__list');
    PANEL.forEach(function (id) {
      var item = el('button', 'ds-theme-item');
      item.type = 'button';
      item.setAttribute('data-theme-id', id);
      item.setAttribute('aria-pressed', 'false');
      item.appendChild(el('span', 'ds-theme-item__label', label(id)));
      var check = el('i', 'ds-theme-item__check');
      check.setAttribute('data-icon', 'check');
      item.appendChild(check);
      item.addEventListener('click', function () { set(id); close(); });
      listBox.appendChild(item);
    });
    panel.appendChild(listBox);

    var foot = el('div', 'ds-theme-panel__foot');
    var link = el('a', 'link link--accent link--m', 'Страница «Темы» ДС');
    link.href = ROOT + 'foundations/Themes/Themes.html';
    foot.appendChild(link);
    var hide = el('button', 'btn btn--transparent btn--s btn--fullwidth', 'Скрыть кнопку');
    hide.type = 'button';
    hide.addEventListener('click', function () { hideLauncher(); });
    foot.appendChild(hide);
    panel.appendChild(foot);

    els = { launcher: launcher, btn: btn, mark: mark, panel: panel };
    btn.addEventListener('click', function () {
      if (suppressClick) return;
      if (panel.hidden) open(); else close();
    });
    launcher.addEventListener('pointerdown', onLauncherDown);
    document.addEventListener('mousedown', onDocDown, true);
    document.addEventListener('keydown', onKey);
  }

  function onDocDown(e) {
    if (!els || els.panel.hidden) return;
    if (els.panel.contains(e.target) || els.launcher.contains(e.target)) return;
    close();
  }

  function onKey(e) {
    if (!e.altKey || !e.shiftKey) return;
    var k = (e.key || '').toLowerCase();
    if (k !== 't' && String(e.code || '').toLowerCase() !== 'keyt') return;
    e.preventDefault();
    if (els.launcher.hidden) { showLauncher(); open(); return; }
    if (els.panel.hidden) open(); else close();
  }

  function open() {
    if (!els) return;
    els.panel.hidden = false;
    positionPanel();
    els.btn.setAttribute('aria-expanded', 'true');
    var active = els.panel.querySelector('.ds-theme-item.is-active');
    if (active) active.focus();
  }
  function close() {
    if (!els) return;
    els.panel.hidden = true;
    els.btn.setAttribute('aria-expanded', 'false');
  }
  function hideLauncher() {
    local.set(HIDE_KEY, '1');
    close();
    els.launcher.hidden = true;
  }
  function showLauncher() {
    local.set(HIDE_KEY, null);
    els.launcher.hidden = false;
  }

  function sync() {
    if (!els) return;
    var cur = get();
    els.mark.textContent = label(cur);
    els.mark.hidden = cur === LEGACY;
    var items = els.panel.querySelectorAll('.ds-theme-item');
    for (var i = 0; i < items.length; i++) {
      var on = items[i].getAttribute('data-theme-id') === cur;
      items[i].classList.toggle('is-active', on);
      items[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  /* ---------------- перетаскивание кнопки ---------------- */

  function viewport() {
    return {
      w: window.innerWidth || document.documentElement.clientWidth || 0,
      h: window.innerHeight || document.documentElement.clientHeight || 0
    };
  }
  function clampPos(x, y) {
    var r = els.launcher.getBoundingClientRect();
    var w = r.width || 48, h = r.height || 48, v = viewport();
    return {
      x: Math.min(Math.max(0, x), Math.max(0, v.w - w)),
      y: Math.min(Math.max(0, y), Math.max(0, v.h - h))
    };
  }
  function applyPos(x, y) {
    var p = clampPos(x, y);
    els.launcher.style.left = p.x + 'px';
    els.launcher.style.top = p.y + 'px';
    els.launcher.style.bottom = 'auto';
    positionPanel();
  }
  function savePos() {
    var r = els.launcher.getBoundingClientRect();
    local.set(POS_KEY, JSON.stringify({ x: Math.round(r.left), y: Math.round(r.top) }));
  }
  function readPos() {
    var raw = local.get(POS_KEY);
    if (!raw) return null;
    try {
      var p = JSON.parse(raw);
      if (p && typeof p.x === 'number' && typeof p.y === 'number') return p;
    } catch (e) { /* мусор в хранилище — позиция по умолчанию */ }
    return null;
  }
  /* Панель открывается привязанной к кнопке: сверху, если есть место, иначе снизу. */
  function positionPanel() {
    if (!els || els.panel.hidden) return;
    var l = els.launcher.getBoundingClientRect();
    var pr = els.panel.getBoundingClientRect();
    var v = viewport();
    var x = l.left;
    var y = l.top - pr.height - 8;
    if (y < 8) y = l.bottom + 8;
    x = Math.min(Math.max(8, x), Math.max(8, v.w - pr.width - 8));
    y = Math.min(Math.max(8, y), Math.max(8, v.h - pr.height - 8));
    els.panel.style.left = Math.round(x) + 'px';
    els.panel.style.top = Math.round(y) + 'px';
    els.panel.style.bottom = 'auto';
  }

  function onLauncherDown(e) {
    if (!els || e.button !== 0 || els.launcher.hidden) return;
    var r = els.launcher.getBoundingClientRect();
    dragState = {
      offX: e.clientX - r.left, offY: e.clientY - r.top,
      startX: e.clientX, startY: e.clientY, moved: false, id: e.pointerId
    };
    document.addEventListener('pointermove', onLauncherMove);
    document.addEventListener('pointerup', onLauncherUp);
    document.addEventListener('pointercancel', onLauncherUp);
  }
  function onLauncherMove(e) {
    if (!dragState) return;
    if (!dragState.moved &&
        Math.abs(e.clientX - dragState.startX) < 4 &&
        Math.abs(e.clientY - dragState.startY) < 4) return;
    dragState.moved = true;
    els.launcher.classList.add('is-dragging');
    applyPos(e.clientX - dragState.offX, e.clientY - dragState.offY);
    e.preventDefault();
  }
  function onLauncherUp(e) {
    if (!dragState) return;
    var moved = dragState.moved;
    dragState = null;
    els.launcher.classList.remove('is-dragging');
    document.removeEventListener('pointermove', onLauncherMove);
    document.removeEventListener('pointerup', onLauncherUp);
    document.removeEventListener('pointercancel', onLauncherUp);
    if (moved) {
      savePos();
      suppressClick = true;   /* клик после перетаскивания панель не открывает */
      setTimeout(function () { suppressClick = false; }, 0);
    }
  }
  function onResize() {
    if (!els || els.launcher.hidden) return;
    var r = els.launcher.getBoundingClientRect();
    var p = clampPos(r.left, r.top);
    if (p.x !== r.left || p.y !== r.top) applyPos(p.x, p.y);
    positionPanel();
  }

  function mount() {
    if (!document.body || els) return;
    /* Страница с панелью прототипа: переключатель темы живёт в её рельсе —
       плавающую кнопку не строим (решение человека 04.10.2026). API остаётся. */
    if (!window.__PROTO_PANEL) {
      build();
      document.body.appendChild(els.launcher);
      document.body.appendChild(els.panel);
      var saved = readPos();
      if (saved) applyPos(saved.x, saved.y);
      window.addEventListener('resize', onResize);
      if (local.get(HIDE_KEY) === '1') els.launcher.hidden = true;
    }
    /* Мусор в атрибуте (чужое имя темы) — к legacy, чтобы get() не врал. */
    if (knownIds().indexOf(get()) < 0) set(LEGACY);
    /* `?theme=` — применить и запомнить (атрибут до отрисовки ставит загрузчик/тег). */
    var m = /[?&]theme=([^&#]*)/.exec(window.location.search || '');
    if (m) set(decodeURIComponent(m[1]));
    sync();
    if (window.dsIcons && window.dsIcons.apply) window.dsIcons.apply(document);
  }

  window.DSTheme = { get: get, set: set, list: list };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();

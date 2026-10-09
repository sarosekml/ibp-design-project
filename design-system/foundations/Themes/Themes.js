/* ============================================================
   Themes.js — выбор темы на странице (MS0013).

   Темы живут в файлах tokens/*.json (зеркало для file:// —
   tokens/tokens.data.js, window.DS_THEME_DATA). Скрипт компилирует
   выбранную тему через DS_THEME_ENGINE и пишет её CSS в
   <style id="ds-theme-runtime">; IBP Legacy (без data-theme) и
   служебная service берут цвета из статического Themes.css.

   Выбор темы — в конструкторе «Темы» и в панели прототипа. Выбор
   помнит localStorage (ds.theme), страница может задать ?theme=<id>.

   API window.DSTheme (прежние get / set / list сохранены):
     get()                — id текущей темы: 'legacy', 'ibp-neo-light', …;
     set(id, mode)        — выбрать тему; прежние ibp-light / ibp-dark
                            ведут на ibp-neo; вернёт итоговый id;
     list()               — пары «файл × режим» для меню: { id, name, mode, label };
     files()              — файлы тем: { name, label, locked, modes };
     selection()          — копия выбора { name, mode, id };
     preview(file, mode)  — показать несохранённый черновик (конструктор);
     reload(data)         — подменить данные тем после записи файлов;
     normalize(id, mode)  — разобрать id в { name, mode, id } или null.
   События на document: ds:themechange (detail { theme, name, mode }),
   ds:themelistchange — список файлов изменился.
   ============================================================ */
(function () {
  'use strict';
  if (window.DSTheme) return;

  var data = window.DS_THEME_DATA;
  var engine = window.DS_THEME_ENGINE;
  if (!data || !engine) return;

  var STORAGE_KEY = 'ds.theme';
  var SAVED_KEY = 'ds.theme.saved';
  var ALIASES = { 'ibp-light': 'ibp-neo-light', 'ibp-dark': 'ibp-neo-dark' };
  var scriptSrc = (document.currentScript && document.currentScript.src) || '';

  var style = document.createElement('style');
  style.id = 'ds-theme-runtime';
  document.head.appendChild(style);

  var selection = { name: 'ibp-legacy', mode: 'light' };

  function findFile(name) {
    return data.themes.find(function (f) { return f.name === name; });
  }

  /* id темы → { name, mode, id }. Тёмный режим — только если он есть в файле. */
  function normalize(id, mode) {
    id = ALIASES[id] || id;
    if (!id || id === 'legacy' || id === 'ibp-legacy') return { name: 'ibp-legacy', mode: 'light', id: 'legacy' };
    if (id === 'service') return { name: 'service', mode: 'dark', id: id };

    var file = data.themes.find(function (f) {
      return f.name === id || f.name + '-light' === id || f.name + '-dark' === id;
    });
    if (!file) return null;

    mode = mode || (id.slice(-5) === '-dark' ? 'dark' : 'light');
    mode = mode === 'dark' && file.dark ? 'dark' : 'light';
    return { name: file.name, mode: mode, id: file.name + '-' + mode };
  }

  /* Пишет CSS темы и data-theme на <html>. file — черновик конструктора. */
  function apply(next, file) {
    selection = next;
    var fromStatic = next.id === 'legacy' || next.id === 'service';
    style.textContent = fromStatic ? '' : engine.css(engine.compile(file || findFile(next.name), next.mode, data));
    if (next.id === 'legacy') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', next.id);
  }

  function get() {
    return document.documentElement.getAttribute('data-theme') || 'legacy';
  }

  function emit() {
    document.dispatchEvent(new CustomEvent('ds:themechange', {
      detail: { theme: get(), name: selection.name, mode: selection.mode }
    }));
  }

  function remember(id) {
    try {
      if (id === 'legacy') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, id);
    } catch (e) { /* хранилище недоступно — выбор живёт до перезагрузки */ }
  }

  function set(id, mode) {
    var next = normalize(id, mode);
    if (!next) {
      console.warn('DSTheme: неизвестная тема ' + id);
      return get();
    }
    apply(next);
    remember(next.id);
    emit();
    return get();
  }

  function files() {
    return data.themes.map(function (f) {
      return { name: f.name, label: f.label, locked: !!f.locked, modes: f.dark ? ['light', 'dark'] : ['light'] };
    });
  }

  function list() {
    var result = [];
    files().forEach(function (f) {
      f.modes.forEach(function (m) {
        var suffix = f.modes.length > 1 ? ' · ' + (m === 'dark' ? 'Тёмная' : 'Светлая') : '';
        result.push({
          id: f.name === 'ibp-legacy' ? 'legacy' : f.name + '-' + m,
          name: f.name,
          mode: m,
          label: f.label + suffix
        });
      });
    });
    return result;
  }

  function preview(file, mode) {
    var next = normalize(file.name, mode) || { name: file.name, mode: mode, id: file.name + '-' + mode };
    apply(next, file);
    emit();
  }

  function reload(next) {
    data = next;
    window.DS_THEME_DATA = next;
    document.dispatchEvent(new CustomEvent('ds:themelistchange'));
  }

  window.DSTheme = {
    get: get,
    set: set,
    list: list,
    files: files,
    selection: function () { return Object.assign({}, selection); },
    preview: preview,
    reload: reload,
    normalize: normalize
  };

  /* Начальная тема: ?theme=, затем localStorage. Прежний или неизвестный id
     переписывается в хранилище итоговым. */
  var requested = '';
  try {
    requested = new URLSearchParams(window.location.search).get('theme') || localStorage.getItem(STORAGE_KEY) || '';
  } catch (e) { /* хранилище недоступно */ }
  var initial = normalize(requested) || normalize('legacy');
  apply(initial);
  if (requested && requested !== initial.id) {
    try { localStorage.setItem(STORAGE_KEY, initial.id); } catch (e) { /* хранилище недоступно */ }
  }

  /* Между вкладками передаётся только сигнал сохранения файла: вкладка
     перечитывает зеркало tokens.data.js. Черновики не передаются. */
  function dsRoot() {
    if (window.__DS_ROOT) return window.__DS_ROOT;
    var src = scriptSrc;
    if (!src) {
      var tag = document.querySelector('script[src$="Themes.js"]');
      src = tag ? tag.src : '';
    }
    return src ? new URL('../../', src).href : '';
  }

  window.addEventListener('storage', function (e) {
    if (e.key !== SAVED_KEY) return;
    var script = document.createElement('script');
    script.src = dsRoot() + 'foundations/Themes/tokens/tokens.data.js?' + Date.now();
    script.onload = function () {
      reload(window.DS_THEME_DATA);
      var current = normalize(get());
      if (current) apply(current);
      emit();
      script.remove();
    };
    document.head.appendChild(script);
  });
})();

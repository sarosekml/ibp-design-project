/* ============================================================
   ThemeFiles.js — запись тем в папку tokens (MS0013).

   Пишет только в подключённую папку tokens этой ДС: JSON темы и
   зеркало tokens.data.js; черновики не сохраняются. Ссылка на папку
   хранится в IndexedDB и восстанавливается при следующем заходе,
   если браузер сохранил разрешение. attach(handle) подключает любую
   папку-handle — так ту же логику проверяют в OPFS встроенного браузера
   и в tools/theme-files-selftest.mjs.

   Защита повторяется перед каждой записью: базовые и закрытые темы
   не перезаписываются, имя «Сохранить как…» не занимает существующее,
   правка в другом окне не затирается, при сбое зеркала JSON откатывается.

   API window.DSThemeFiles:
     connect()            — выбрать папку (showDirectoryPicker) и прочитать темы;
     restore()            — вернуть папку из IndexedDB, если разрешение живо;
     attach(handle)       — подключить папку-handle и прочитать темы;
     read()               — прочитать и проверить все темы подключённой папки;
     save(file, opts)     — записать тему и зеркало; opts { create, original };
     download(file)       — скачать JSON темы без записи в папку;
     connected()          — подключена ли папка.
   ============================================================ */
(function () {
  'use strict';

  var engine = window.DS_THEME_ENGINE;
  var dir = null;

  var DB_NAME = 'ds-theme-files';
  var DB_STORE = 'handles';
  var DB_KEY = 'tokens';
  var MIRROR = 'tokens.data.js';
  var REQUIRED = ['ibp-legacy', 'ibp-neo', 'custom'];
  var PROTECTED = ['ibp-legacy', 'ibp-neo', 'service', 'legacy', 'base-light', 'base-dark'];

  /* ---------- IndexedDB: ссылка на папку ---------- */
  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore(DB_STORE); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  async function remember(handle) {
    var db = await openDb();
    await new Promise(function (resolve, reject) {
      var tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(handle, DB_KEY);
      tx.oncomplete = resolve;
      tx.onerror = function () { reject(tx.error); };
    });
    db.close();
  }

  async function restore() {
    try {
      var db = await openDb();
      var handle = await new Promise(function (resolve, reject) {
        var req = db.transaction(DB_STORE).objectStore(DB_STORE).get(DB_KEY);
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error); };
      });
      db.close();
      if (handle && await handle.queryPermission({ mode: 'readwrite' }) === 'granted') {
        dir = handle;
        return handle;
      }
    } catch (e) { /* нет IndexedDB или разрешения — папку подключат заново */ }
    return null;
  }

  /* ---------- чтение папки ---------- */
  async function readText(name) {
    try {
      var handle = await dir.getFileHandle(name);
      return await (await handle.getFile()).text();
    } catch (e) {
      if (e.name === 'NotFoundError') return null;
      throw e;
    }
  }

  /* Порядок тем: обязательные первыми, остальные по имени. */
  function rank(name) {
    var i = REQUIRED.indexOf(name);
    return i < 0 ? 99 : i;
  }
  function sortThemes(themes) {
    themes.sort(function (a, b) { return rank(a.name) - rank(b.name) || a.name.localeCompare(b.name); });
  }

  function sameJson(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  async function read() {
    if (!dir) throw new Error('Подключите папку tokens');
    var data = { version: 1, bases: {}, legacy: window.DS_THEMES.legacySnapshot, themes: [] };

    for await (var entry of dir.values()) {
      if (entry.kind !== 'file' || !entry.name.endsWith('.json')) continue;
      var value = JSON.parse(await (await entry.getFile()).text());
      if (entry.name === 'base-light.json' || entry.name === 'base-dark.json') {
        data.bases[entry.name.slice(5, -5)] = value;
        continue;
      }
      var errors = engine.validate(value);
      if (errors.length || entry.name !== value.name + '.json') {
        throw new Error(entry.name + ': ' + (errors.join('; ') || 'имя файла расходится с темой'));
      }
      data.themes.push(value);
    }

    var bases = window.DS_THEME_DATA.bases;
    if (!sameJson(data.bases.light, bases.light) || !sameJson(data.bases.dark, bases.dark)) {
      throw new Error('Выберите папку tokens этой ДС: базовые растяжки не совпадают');
    }
    REQUIRED.forEach(function (name) {
      if (!data.themes.some(function (f) { return f.name === name; })) throw new Error('В папке отсутствует ' + name + '.json');
    });
    sortThemes(data.themes);
    return data;
  }

  /* Неподходящая папка не сбивает прежнее подключение. */
  async function attach(handle) {
    var previous = dir;
    dir = handle;
    try {
      return await read();
    } catch (e) {
      dir = previous;
      throw e;
    }
  }

  async function connect() {
    if (!window.showDirectoryPicker) {
      throw new Error('Этот браузер не пишет в папку. Скачайте JSON и пересоберите зеркало командой theme-build');
    }
    if (dir && dir.requestPermission && await dir.requestPermission({ mode: 'readwrite' }) === 'granted') return read();

    var handle = await window.showDirectoryPicker({ id: 'ds-theme-tokens', mode: 'readwrite' });
    var data = await attach(handle);
    try { await remember(handle); } catch (e) { /* недоступный IndexedDB не мешает записи в этом сеансе */ }
    return data;
  }

  /* ---------- запись ---------- */
  async function write(name, value) {
    var handle = await dir.getFileHandle(name, { create: true });
    var writable = await handle.createWritable();
    try {
      await writable.write(value);
      await writable.close();
    } catch (e) {
      try { await writable.abort(); } catch (_) { /* поток уже закрыт */ }
      throw e;
    }
  }

  async function save(file, opts) {
    opts = opts || {};
    if (!dir) throw new Error('Подключите папку tokens');
    if (PROTECTED.indexOf(file.name) >= 0 || file.locked) {
      throw new Error('Базовую тему нельзя перезаписать. Используйте «Сохранить как…»');
    }
    var errors = engine.validate(file);
    if (errors.length) throw new Error(errors.join('; '));

    /* Папку перечитываем перед каждой записью: её могли изменить в другом окне. */
    var data = await read();
    var index = data.themes.findIndex(function (f) { return f.name === file.name; });
    if (index >= 0 && data.themes[index].locked) throw new Error('Тема закрыта для записи');
    if (opts.create && index >= 0) throw new Error('Тема с этим именем уже есть. Выберите другое имя');
    if (opts.original && index >= 0 && !sameJson(data.themes[index], opts.original)) {
      throw new Error('Файл изменён в другом окне. Перезагрузите сохранённую тему');
    }
    ['light', 'dark'].forEach(function (mode) { if (file[mode]) engine.compile(file, mode, data); });

    var name = file.name + '.json';
    var json = JSON.stringify(file, null, 2) + '\n';
    var previous = await readText(name);
    if (index < 0) data.themes.push(file);
    else data.themes[index] = file;
    sortThemes(data.themes);

    /* При сбое зеркала JSON откатывается: страница остаётся несохранённой. */
    await write(name, json);
    try {
      await write(MIRROR, engine.mirror(data));
    } catch (e) {
      try {
        if (previous !== null) await write(name, previous);
        else await dir.removeEntry(name);
      } catch (_) { /* откат не удался — ошибку зеркала всё равно покажем */ }
      throw new Error('Не удалось записать зеркало: ' + e.message);
    }

    window.DSTheme.reload(data);
    try { localStorage.setItem('ds.theme.saved', Date.now().toString()); } catch (e) { /* другие вкладки узнают при перезагрузке */ }
    return data;
  }

  function download(file) {
    var errors = engine.validate(file);
    if (errors.length) throw new Error(errors.join('; '));
    var blob = new Blob([JSON.stringify(file, null, 2) + '\n'], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = file.name + '.json';
    link.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  window.DSThemeFiles = {
    connect: connect,
    restore: restore,
    attach: attach,
    read: read,
    save: save,
    download: download,
    connected: function () { return !!dir; }
  };
})();

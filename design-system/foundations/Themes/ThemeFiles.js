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

   Список тем — всё, что лежит в папке (08.10.2026): имя темы — имя файла
   (DS_THEME_ENGINE.fromFile), файл с ошибкой не роняет чтение остальных и
   попадает в problems(). Зеркало сверяется с папкой и переписывается, если
   разошлось (syncMirror) — тогда новую тему видят и другие страницы ДС.

   API window.DSThemeFiles:
     connect()            — выбрать папку (showDirectoryPicker) и прочитать темы;
     restore()            — вернуть папку из IndexedDB, если разрешение живо;
     pending()            — папка запомнена, но браузер ждёт разрешения;
     refresh()            — по жесту пользователя: разрешение и чтение папки;
     attach(handle)       — подключить папку-handle и прочитать темы;
     read()               — прочитать и проверить все темы подключённой папки;
     problems()           — файлы, пропущенные при последнем чтении: [{ file, reason }];
     renamed()            — файлы, чьё имя внутри разошлось с именем файла: [{ file, from }];
     syncMirror(data)     — переписать tokens.data.js, если он разошёлся с папкой; true — переписан;
     save(file, opts)     — записать тему и зеркало; opts { create, original };
     download(file)       — скачать JSON темы без записи в папку;
     connected()          — подключена ли папка.
   ============================================================ */
(function () {
  'use strict';

  var engine = window.DS_THEME_ENGINE;
  var dir = null;
  var stored = null;       // папка из IndexedDB, разрешение ещё не подтверждено
  var lastProblems = [];
  var lastRenamed = [];

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
      if (!handle) return null;
      stored = handle;
      if (await handle.queryPermission({ mode: 'readwrite' }) === 'granted') {
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
    var bases = {}, themes = [], problems = [], renamed = [];

    for await (var entry of dir.values()) {
      if (entry.kind !== 'file' || !entry.name.endsWith('.json')) continue;
      var text = await (await entry.getFile()).text();
      if (entry.name === 'base-light.json' || entry.name === 'base-dark.json') {
        bases[entry.name.slice(5, -5)] = JSON.parse(text);
        continue;
      }
      /* Один плохой файл не прячет остальные: он уходит в problems(). */
      var value;
      try { value = JSON.parse(text); } catch (e) { problems.push({ file: entry.name, reason: 'не JSON: ' + e.message }); continue; }
      var got = engine.fromFile(entry.name, value);
      var errors = engine.validate(got.theme);
      if (errors.length) { problems.push({ file: entry.name, reason: errors.join('; ') }); continue; }
      if (got.renamedFrom !== null) renamed.push({ file: entry.name, from: got.renamedFrom });
      themes.push(got.theme);
    }

    var known = window.DS_THEME_DATA.bases;
    if (!sameJson(bases.light, known.light) || !sameJson(bases.dark, known.dark)) {
      throw new Error('Выберите папку tokens этой ДС: базовые растяжки не совпадают');
    }
    REQUIRED.forEach(function (name) {
      if (!themes.some(function (f) { return f.name === name; })) throw new Error('В папке отсутствует ' + name + '.json');
    });
    sortThemes(themes);
    problems.sort(function (a, b) { return a.file.localeCompare(b.file); });
    lastProblems = problems;
    lastRenamed = renamed;
    /* Порядок ключей — как у theme-build (файлы по алфавиту): зеркало из
       папки и из сборщика побайтно одно и то же. */
    return { version: 1, bases: { dark: bases.dark, light: bases.light }, legacy: window.DS_THEMES.legacySnapshot, themes: themes };
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
    var known = dir || stored;
    if (known && known.requestPermission && await known.requestPermission({ mode: 'readwrite' }) === 'granted') {
      dir = known;
      return read();
    }

    var handle = await window.showDirectoryPicker({ id: 'ds-theme-tokens', mode: 'readwrite' });
    var data = await attach(handle);
    try { await remember(handle); } catch (e) { /* недоступный IndexedDB не мешает записи в этом сеансе */ }
    return data;
  }

  /* По жесту пользователя: запомненная папка получает разрешение и читается. */
  async function refresh() {
    if (!dir && stored) {
      if (await stored.requestPermission({ mode: 'readwrite' }) !== 'granted') throw new Error('Браузер не дал доступ к папке tokens');
      dir = stored;
    }
    return read();
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

    /* Записанный файл больше не расходится с именем: папку читали до записи. */
    lastRenamed = lastRenamed.filter(function (r) { return r.file !== name; });
    window.DSTheme.reload(data);
    try { localStorage.setItem('ds.theme.saved', Date.now().toString()); } catch (e) { /* другие вкладки узнают при перезагрузке */ }
    return data;
  }

  /* Зеркало tokens.data.js — из прочитанной папки, только если разошлось:
     файл, положенный в папку руками, появляется и на других страницах ДС. */
  async function syncMirror(data) {
    var text = engine.mirror(data);
    if (await readText(MIRROR) === text) return false;
    await write(MIRROR, text);
    try { localStorage.setItem('ds.theme.saved', Date.now().toString()); } catch (e) { /* другие вкладки узнают при перезагрузке */ }
    return true;
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
    pending: function () { return !dir && !!stored; },
    refresh: refresh,
    problems: function () { return lastProblems.slice(); },
    renamed: function () { return lastRenamed.slice(); },
    syncMirror: syncMirror,
    attach: attach,
    read: read,
    save: save,
    download: download,
    connected: function () { return !!dir; }
  };
})();

/* =========================================================================
   PostApi — адаптер хранения данных направления Post.

   Единственное место, которое знает, КУДА пишутся данные. Сторы и страницы
   говорят только с ним, поэтому переход на настоящий бэкенд — правка этого
   файла, а не экранов. Контракт API — data/API.md.

   Экспорт: window.PostApi = {
     mode() → 'server' | 'local' | null   — null, пока режим не определён
     ready → Promise<'server'|'local'>
     — состав участников сделки (CounterpartiesStore):
     all() → Promise<{ dealId: { members, knr, updated } }>
     get(dealId) → Promise<{ members, knr, updated } | null>
     put(dealId, { members, knr }) → Promise<{ ok, updated }>
     reset() → Promise
     — дерево продуктов сделки (ProductTreeStore):
     trees.all() → Promise<{ dealId: { tree, updated } }>
     trees.get(dealId) → Promise<{ tree, updated } | null>
     trees.put(dealId, { tree }) → Promise<{ ok, updated }>
     trees.reset() → Promise
   }

   Два режима, общие для обоих ресурсов:
   – server — страница открыта с локального сервера данных (в этом репозитории
     пока не заведён, data/API.md) и он отвечает на /api/post/participants: данные пишутся в его базу;
   – local — страница открыта двойным кликом (file://) или с чужого сервера без
     этого API: данные пишутся в localStorage этого браузера. Так же ДС хранит
     закрепление меню между страницами (ds-nav-panel.js). Режим объявляется в
     консоли один раз.

   Состояние:
   – участники — members (id контрагентов из базы mock-counterparties.js) и
     knr (те из них, кто отмечен КНР);
   – дерево продуктов — tree (DealProductTreeRsDto, mock-deal-trees.js)
     целиком: сохранённое дерево перекрывает демо-дерево сделки.
   ========================================================================= */
(function () {
  'use strict';

  var PROBE = '/api/post/participants';
  var mode = null;

  /* Ресурс: одна база на сервере и один ключ localStorage. pack(rec) —
     какие поля записи хранятся (копией). */
  function resource(base, lsKey, pack) {
    function readLocal() {
      try {
        var raw = window.localStorage.getItem(lsKey);
        var data = raw ? JSON.parse(raw) : {};
        return data && typeof data === 'object' ? data : {};
      } catch (e) { return {}; }
    }
    function writeLocal(data) {
      try { window.localStorage.setItem(lsKey, JSON.stringify(data)); } catch (e) { /* хранилище недоступно — правка живёт до перезагрузки */ }
    }

    var local = {
      all: function () { return Promise.resolve(readLocal()); },
      get: function (id) { return Promise.resolve(readLocal()[String(id)] || null); },
      put: function (id, rec) {
        var data = readLocal();
        var updated = new Date().toISOString();
        var stored = pack(rec);
        stored.updated = updated;
        data[String(id)] = stored;
        writeLocal(data);
        return Promise.resolve({ ok: true, updated: updated });
      },
      reset: function () {
        try { window.localStorage.removeItem(lsKey); } catch (e) {}
        return Promise.resolve();
      }
    };

    var server = {
      all: function () { return http('GET', base).then(function (d) { return d || {}; }); },
      get: function (id) { return http('GET', base + '/' + encodeURIComponent(id)); },
      put: function (id, rec) { return http('PUT', base + '/' + encodeURIComponent(id), pack(rec)); },
      reset: function () { return http('DELETE', base); }
    };

    function impl() { return mode === 'server' ? server : local; }
    function call(name, args) {
      return ready.then(function () { return impl()[name].apply(null, args); });
    }

    return {
      all: function () { return call('all', []); },
      get: function (id) { return call('get', [id]); },
      put: function (id, rec) { return call('put', [id, rec]); },
      reset: function () { return call('reset', []); }
    };
  }

  /* ── server: HTTP API локального сервера ─────────────────────────── */
  function http(method, url, body) {
    var init = { method: method, headers: { 'Accept': 'application/json' }, cache: 'no-store' };
    if (body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    return fetch(url, init).then(function (res) {
      if (res.status === 404 && method === 'GET') return null;
      if (!res.ok) throw new Error('PostApi: ' + method + ' ' + url + ' → ' + res.status);
      return res.status === 204 ? null : res.json();
    });
  }

  /* ── выбор режима ───────────────────────────────────────────────── */
  /* По file:// fetch не работает вовсе, поэтому сервер пробуется только на
     http(s). Любой отказ (нет сервера, чужой сервер, 404) — режим local. */
  function detect() {
    var proto = window.location && window.location.protocol;
    if ((proto === 'http:' || proto === 'https:') && window.fetch) {
      return fetch(PROBE, { cache: 'no-store' })
        .then(function (res) { return res.ok ? 'server' : 'local'; })
        .catch(function () { return 'local'; });
    }
    return Promise.resolve('local');
  }

  var ready = detect().then(function (m) {
    mode = m;
    if (m === 'local' && window.console) {
      console.info('PostApi: сервер данных не найден — правки состава участников и дерева продуктов сохраняются только в этом браузере (localStorage). Контракт сервера — data/API.md');
    }
    return m;
  });

  var participants = resource('/api/post/participants', 'ibp.post.participants', function (rec) {
    return { members: rec.members.slice(), knr: rec.knr.slice() };
  });
  var trees = resource('/api/post/product-trees', 'ibp.post.product-trees', function (rec) {
    return { tree: JSON.parse(JSON.stringify(rec.tree)) };
  });

  window.PostApi = {
    mode: function () { return mode; },
    ready: ready,
    all: participants.all,
    get: participants.get,
    put: participants.put,
    reset: participants.reset,
    trees: trees
  };
})();

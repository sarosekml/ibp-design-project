/* ============================================================
   ds-icons.js — иконки ДС на экранах без инлайна SVG в разметку.
   Подключение (в конце body):
     <script src="icons-data.js"></script>
     <script src="ds-icons.js"></script>
   Использование:
     <i data-icon="check"></i>
   Цвет — через color родителя (перекрашивается в currentColor).
   Размер — от слота: правила размера в CSS компонентов написаны на
   `:is(svg,[data-icon])`, поэтому один и тот же слот задаёт габарит
   и вставленному <svg>, и <i data-icon> — формы взаимозаменяемы,
   вид не меняется (RulesAudit W0 · K2). Вне компонентов действует
   дефолт 24px через :where() — нулевая специфичность, любое
   компонентное правило перебивает его независимо от порядка загрузки.
   Имена глифов — specs/Icons.md. Динамика: window.dsIcons.apply(root).
   Строкой в скрипте: window.dsIcons.svg(name).

   У каждой копии глифа — свои id внутри SVG (задача 0007). У 141 глифа из
   247 есть маска clipPath с id и ссылка на неё url(#id), а url(#id)
   браузер ищет по всему документу: одинаковый текст во всех копиях давал
   повторы id, и копия ссылалась на чужую маску. Копия получает суффикс -iN
   у всех id и ссылки на свои id; глиф без id не меняется. После загрузки
   рантайма window.DS_ICONS отдаёт такую же копию при каждом чтении —
   рантаймы, которые берут глифы из DS_ICONS напрямую (ds-notify,
   ds-pagination, input-kit…), правок не требуют: ds.js грузит их после
   ds-icons.js.
   ============================================================ */
(function () {
  var css = ':where([data-icon]){display:inline-flex;width:24px;height:24px;flex:none;font-style:normal}' +
            ':where([data-icon]) svg{width:100%;height:100%;display:block}';
  var tag = document.createElement('style');
  tag.textContent = css;
  document.head.appendChild(tag);

  function recolor(svg) {
    svg.querySelectorAll('[fill]').forEach(function (n) {
      var f = n.getAttribute('fill');
      var boundingRect = n.tagName.toLowerCase() === 'rect' && n.getAttribute('fill-opacity') === '0';
      if (f && f !== 'none' && !boundingRect) n.setAttribute('fill', 'currentColor');
    });
    svg.querySelectorAll('[stroke]').forEach(function (n) {
      var s = n.getAttribute('stroke');
      if (s && s !== 'none') n.setAttribute('stroke', 'currentColor');
    });
  }

  /* ---------- копия глифа с уникальными id ---------- */

  var seq = 0;
  var RAW = null;   // исходные строки icons-data.js — после замены DS_ICONS
  var own = function (o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); };

  /* Суффикс копии всем id, ссылки url(#…), href="#…", xlink:href="#…" —
     на свои id; ссылки на чужие id не трогаются. Экспорт глифов пишет
     один id дважды (rect внутри clipPath и снаружи): повтор внутри копии
     получает ещё -2, -3…, а ссылка ведёт на первый элемент — как у
     одиночной копии, где url(#id) находит первый. */
  function unique(src) {
    if (!/\sid=["']/.test(src)) return src;
    var n = ++seq, map = {}, seen = {};
    return src
      .replace(/(\sid=)(["'])([^"']+)\2/g, function (m, pre, q, id) {
        var k = seen[id] = (seen[id] || 0) + 1;
        var nid = id + '-i' + n + (k > 1 ? '-' + k : '');
        if (k === 1) map[id] = nid;
        return pre + q + nid + q;
      })
      .replace(/url\((["']?)#([^"')]+)\1\)/g, function (m, q, id) { return own(map, id) ? 'url(' + q + '#' + map[id] + q + ')' : m; })
      .replace(/(\s(?:xlink:)?href=)(["'])#([^"']+)\2/g, function (m, pre, q, id) { return own(map, id) ? pre + q + '#' + map[id] + q : m; });
  }

  /* window.DS_ICONS → объект с теми же ключами, чтение отдаёт копию.
     icons-data.js ещё не загружен — замена при первом обращении. */
  function wrap() {
    var data = window.DS_ICONS;
    if (!data || data.__dsUnique) return;
    var raw = {}, out = {};
    Object.keys(data).forEach(function (name) {
      raw[name] = data[name];
      Object.defineProperty(out, name, { enumerable: true, configurable: true, get: function () { return unique(String(raw[name])); } });
    });
    Object.defineProperty(out, '__dsUnique', { value: true });
    RAW = raw;
    window.DS_ICONS = out;
  }

  /** SVG глифа строкой — копия с уникальными id; нет глифа — ''. */
  function svg(name) {
    wrap();
    if (own(RAW, name)) return unique(String(RAW[name]));
    var d = window.DS_ICONS;   // глиф дописан в DS_ICONS после замены — исходная строка
    return own(d, name) && d[name] ? unique(String(d[name])) : '';
  }

  function apply(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
      if (el.dataset.iconDone === '1') return;
      var name = el.getAttribute('data-icon');
      var markup = svg(name);
      if (!markup) { console.warn('ds-icons: нет глифа "' + name + '" (см. specs/Icons.md)'); return; }
      el.innerHTML = markup;
      var node = el.querySelector('svg');
      if (node) recolor(node);
      el.dataset.iconDone = '1';
    });
  }

  wrap();
  window.dsIcons = { apply: apply, svg: svg };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { apply(); });
  } else {
    apply();
  }
})();

/* RelatedPersonsTile — связанные физические лица клиента.
   render(host, { persons }) — {fullName, role, initials}[]: первые два —
   строки Entity с аватаром, остальные — счётчик «+N». */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function set(host, sel, text) { var el = host.querySelector(sel); if (el) el.textContent = text == null || text === '' ? '–' : text; }
  function show(host, sel, on) { var el = host.querySelector(sel); if (el) el.hidden = !on; }
  function check(host, sel, on) { var el = host.querySelector(sel); if (el) el.checked = !!on; }
  function avatar(initials) { return '<span class="av av--circular av--m"><span class="av__text">' + esc(initials) + '</span></span>'; }
  function entity(lead, label, subs) {
    return '<div class="entity"><div class="entity__lead">' + lead + '</div><div class="entity__main"><div class="entity__titles">'
      + '<div class="entity__labelrow"><span class="entity__label entity__label--truncate">' + esc(label) + '</span></div></div>'
      + (subs ? '<div class="entity__subs"><span class="entity__subs-list">' + esc(subs) + '</span></div>' : '')
      + '</div></div>';
  }

  function render(host, opts) {
    var list = (opts && opts.persons) || [];
    if (!host) return;
    var ul = host.querySelector('[data-rp-list]');
    if (ul) ul.innerHTML = list.slice(0, 2).map(function (p) { return entity(avatar(p.initials), p.fullName, p.role); }).join('');
    var rest = Math.max(0, list.length - 2);
    show(host, '[data-rp-more]', rest > 0);
    set(host, '[data-rp-more]', '+' + rest);
  }

  window.LcRelatedPersonsTile = { render: render };
})();

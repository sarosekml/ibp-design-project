/* V2TeamInfoTile — заполнение тайла команды.
   render(host, { title, members, editable }) — members: {employeeId,
   roleLabel, withNumber}; withNumber — подпись «Табельный номер · роль»
   (главный КМ). editable — карандаш (команда клиента ДИД; по клику ничего,
   Р6). */
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
    if (!host || !opts) return;
    var S = window.IBPR;
    var root = host.classList.contains('lc-team-info') ? host : host.querySelector('.lc-team-info') || host;
    if (opts.title) set(root, '[data-ti-title]', opts.title);
    root.setAttribute('data-editable', opts.editable ? 'yes' : 'no');
    var list = root.querySelector('[data-ti-list]');
    if (!list) return;
    list.innerHTML = (opts.members || []).map(function (m) {
      var e = S.employee(m.employeeId);
      if (!e) return '';
      var subs = m.withNumber ? 'Табельный номер: ' + e.id + ' · ' + (m.roleLabel || e.position || '') : (m.roleLabel || '');
      return entity(avatar(e.initials), e.fullName, subs);
    }).join('');
  }

  window.LcTeamInfoTile = { render: render };
})();

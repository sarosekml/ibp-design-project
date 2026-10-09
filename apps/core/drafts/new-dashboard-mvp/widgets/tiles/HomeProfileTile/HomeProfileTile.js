/* ============================================================
   HomeProfileTile.js — тайл профиля главной из HomeStore.profile.

   API (window.LcHomeProfileTile):
     render(root)   — имя, должность и деск, фото (нет или не загрузилось —
                      инициалы), точка «в сети», приветствие по времени
     greeting(hhmm) — «Доброе утро» | «Добрый день» | «Добрый вечер» | «Доброй ночи»
   Телефон копируется в буфер (DSCopy), почта — ссылка mailto. Быстрые
   действия открывают окна через data-modal — своего кода у них нет.
   ============================================================ */
(function () {
  'use strict';

  function greeting(hhmm) {
    var h = +String(hhmm || '12:00').split(':')[0];
    if (h >= 5 && h < 12) return 'Доброе утро,';
    if (h >= 12 && h < 18) return 'Добрый день,';
    if (h >= 18 && h < 23) return 'Добрый вечер,';
    return 'Доброй ночи,';
  }

  function initials(p) { return (p.firstName.charAt(0) + p.lastName.charAt(0)).toUpperCase(); }

  /* Цепочка Avatar: фото → инициалы → иконка */
  function toInitials(av, p) {
    av.innerHTML = '<span class="av__text">' + initials(p) + '</span>';
  }

  function render(root) {
    var S = window.HomeStore, p = S && S.profile;
    if (!p) return;
    var full = p.firstName + ' ' + p.middleName + ' ' + p.lastName;
    var name = root.querySelector('[data-profile="name"]');
    name.textContent = full;
    name.setAttribute('data-tooltip', full);
    root.querySelector('[data-profile="greeting"]').textContent = greeting(S.now);
    root.querySelector('[data-profile="position"]').textContent = p.positionName + ' · ' + p.deskName;
    root.querySelector('[data-profile="mail"]').setAttribute('href', 'mailto:' + p.email);

    var stack = root.querySelector('[data-profile="avatar"]');
    var av = stack.querySelector('.av');
    var img = av.querySelector('img');
    if (p.photoUrl && img) {
      img.addEventListener('error', function () { toInitials(av, p); }, { once: true });
      if (img.getAttribute('src') !== p.photoUrl) img.setAttribute('src', p.photoUrl);
      if (img.complete && img.getAttribute('src') && !img.naturalWidth) toInitials(av, p);
    } else {
      toInitials(av, p);
    }
    var dot = stack.querySelector('.badge--dot');
    if (dot) dot.hidden = !p.isOnline;
    stack.setAttribute('aria-label', full + (p.isOnline ? ', в сети' : ''));
  }

  function init(root) {
    if (root.__lcProfileInit) return;
    root.__lcProfileInit = true;
    root.addEventListener('click', function (e) {
      var p = window.HomeStore && window.HomeStore.profile;
      var phone = e.target.closest('[data-profile-act="phone"]');
      if (phone && p && window.DSCopy) {
        window.DSCopy.write(p.phone);
        window.DSCopy.flash(phone, 'Телефон ' + p.phone + ' скопирован');
      }
      if (e.target.closest('[data-profile-act="retry"]')) {
        root.setAttribute('data-state', 'loading');
        setTimeout(function () { render(root); root.setAttribute('data-state', 'data'); }, 700);
      }
    });
    render(root);
  }

  function initAll() { document.querySelectorAll('.lc-profile').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll); else initAll();

  window.LcHomeProfileTile = { render: render, greeting: greeting, init: init };
})();

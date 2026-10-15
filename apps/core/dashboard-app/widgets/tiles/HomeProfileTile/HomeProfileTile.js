/* ============================================================
   HomeProfileTile.js — тайл профиля главной из HomeStore.profile.

   API (window.LcHomeProfileTile):
     render(root, opts) — имя, должность и деск, фото (нет или не загрузилось
                          — инициалы); opts.avatar = 'text' — запасной вид
                          без фотографии (иконка, как в макете главной)
   Вид аватара переключает и атрибут data-avatar="text" на корне тайла —
   его читает таб «System» панели прототипа через скрипт страницы.
   Телефон копируется в буфер (DSCopy), почта — ссылка mailto. Быстрые
   действия открывают окна через data-modal — своего кода у них нет.
   ============================================================ */
(function () {
  'use strict';

  function initials(p) { return (p.firstName.charAt(0) + p.lastName.charAt(0)).toUpperCase(); }

  /* Цепочка Avatar: фото → инициалы → иконка */
  function toInitials(av, p) {
    av.innerHTML = '<span class="av__text">' + initials(p) + '</span>';
  }

  function render(root, opts) {
    var S = window.HomeStore, p = S && S.profile;
    if (!p) return;
    var text = (opts && opts.avatar === 'text') || root.getAttribute('data-avatar') === 'text';
    var full = p.firstName + ' ' + p.middleName + ' ' + p.lastName;
    var name = root.querySelector('[data-profile="name"]');
    name.textContent = full;
    name.setAttribute('data-tooltip', full);
    root.querySelector('[data-profile="position"]').textContent = p.positionName + ' · ' + p.deskName;
    root.querySelector('[data-profile="mail"]').setAttribute('href', 'mailto:' + p.email);

    var av = root.querySelector('[data-profile="avatar"]');
    if (!root.__lcAvatarHTML) root.__lcAvatarHTML = av.innerHTML;
    if (text) {
      /* Запасной вид без фотографии — иконка персоны, как в макете главной */
      av.innerHTML = '<span class="lc-profile__av-fallback"><i data-icon="user-circle" aria-hidden="true"></i></span>';
      if (window.dsIcons) window.dsIcons.apply(av);
      return;
    }
    av.innerHTML = root.__lcAvatarHTML;
    var img = av.querySelector('img');
    if (p.photoUrl && img) {
      img.addEventListener('error', function () { toInitials(av, p); }, { once: true });
      if (img.getAttribute('src') !== p.photoUrl) img.setAttribute('src', p.photoUrl);
      if (img.complete && img.getAttribute('src') && !img.naturalWidth) toInitials(av, p);
    } else {
      toInitials(av, p);
    }
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

  window.LcHomeProfileTile = { render: render, init: init };
})();

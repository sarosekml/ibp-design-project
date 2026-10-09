/* ============================================================
   Slider.js — рантайм ползунка (1.001).

   Держит в синхроне заполненную часть трека (--slr-progress) и вывод
   значения (.slr__value, единица — data-unit на .slr). Клавиатура и
   доступность — у нативного input[type=range].

   API window.DSSlider:
     bind(root)    — связать один .slr; вернёт { sync, set(value), input };
                     повторный вызов вернёт ту же связку;
     bindAll(root) — связать все .slr внутри root (по умолчанию document).
   Разметку, перерисованную скриптом, связывают заново: DSSlider.bindAll(область).
   ============================================================ */
(function () {
  'use strict';

  function bind(root) {
    if (root.__dsSlider) return root.__dsSlider;
    var input = root.querySelector('.slr__input');
    var output = root.querySelector('.slr__value');
    if (!input) return null;

    function sync() {
      var min = input.min === '' ? 0 : Number(input.min);
      var max = input.max === '' ? 100 : Number(input.max);
      var span = max - min;
      var share = span > 0 ? (Number(input.value) - min) / span * 100 : 0;
      input.style.setProperty('--slr-progress', share + '%');
      if (output) output.textContent = input.value + (root.getAttribute('data-unit') || '');
    }

    input.addEventListener('input', sync);
    input.addEventListener('change', sync);
    sync();

    root.__dsSlider = {
      sync: sync,
      set: function (value) { input.value = value; sync(); },
      input: input
    };
    return root.__dsSlider;
  }

  function bindAll(root) {
    (root || document).querySelectorAll('.slr').forEach(bind);
  }

  window.DSSlider = { bind: bind, bindAll: bindAll };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { bindAll(); });
  else bindAll();
})();

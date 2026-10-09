/* ============================================================
   CreateFairValueCalculationModal.js — поведение окна «Формирование
   нового расчета».

   Делает то, чего нет в рантаймах ДС, и только это:
   1) включает «Сформировать», когда дата введена целиком (ДД.ММ.ГГГГ) и
      существует в календаре;
   2) по «Сформировать» спрашивает у страницы, есть ли расчет на эту дату:
      есть — показывает Alert уровня окна и не закрывает окно; нет —
      отдаёт дату странице и закрывает окно;
   3) при каждом открытии стирает дату и снимает Alert.

   Маску, календарь и крестик даёт InputDate ДС. Реестр окно не знает:
   проверку и создание делают функции страницы.

   API:
     PostCreateFairValueCalculationModal.bind(scrim, { exists, create }) → api
       exists(isoDate)  → boolean — есть ли расчет на дату
       create(isoDate)  — принять дату нового расчета
       api.reset()      — стереть дату и снять Alert
   ============================================================ */
(function () {
  'use strict';

  /* «ДД.ММ.ГГГГ» → ISO-строка или null, если даты нет в календаре */
  function parseRuDate(s) {
    var m = /^(\d{2})\.(\d{2})\.(\d{4})/.exec(s || '');
    if (!m) return null;
    var d = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
    if (d.getUTCFullYear() !== +m[3] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[1]) return null;
    return m[3] + '-' + m[2] + '-' + m[1];
  }

  function bind(scrim, opts) {
    if (!scrim) return null;
    if (scrim.__fvCreate) return scrim.__fvCreate;
    opts = opts || {};
    var input = scrim.querySelector('[data-fv-create-date]');
    var submit = scrim.querySelector('[data-fv-create-submit]');
    var alertBox = scrim.querySelector('[data-fv-create-alert]');
    if (!input || !submit) return null;

    function reset() {
      input.value = '';
      if (window.DSInput) window.DSInput.syncAll(scrim);
      if (alertBox) alertBox.hidden = true;
      submit.disabled = true;
    }
    function sync() {
      /* правка даты снимает ошибку «расчет уже есть» */
      if (alertBox) alertBox.hidden = true;
      submit.disabled = !parseRuDate(input.value);
    }
    input.addEventListener('input', sync);
    input.addEventListener('change', sync);
    /* календарь и крестик пишут значение событием change/ds-input:clear */
    scrim.addEventListener('ds-input:clear', sync);

    submit.addEventListener('click', function () {
      var iso = parseRuDate(input.value);
      if (!iso) return;
      if (opts.exists && opts.exists(iso)) {
        if (alertBox) {
          alertBox.hidden = false;
          if (window.dsIcons) window.dsIcons.apply(alertBox);
        }
        return;
      }
      if (opts.create) opts.create(iso);
      if (window.DSModal) window.DSModal.closeTop(true);
    });

    var api = { reset: reset };
    scrim.__fvCreate = api;
    return api;
  }

  window.PostCreateFairValueCalculationModal = { bind: bind };
})();

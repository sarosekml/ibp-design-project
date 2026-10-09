/* ============================================================
   FairValueInstrumentablesUploadFileModal.js — поведение окна «Данные по
   инструменту» (загрузка XML-файла инструмента ФИ).

   Тестовых файлов нет, поэтому системный выбор файла имитируется: кнопка
   «Выбрать файл» подставляет образец XML (window.MOCK_FV_INSTRUMENT_XML).
   Окно живёт в двух состояниях (data-state на .modal):
     choose  — выбора ещё не было, «Сохранить» выключена;
     preview — файл «выбран» и проверен, текст XML в теле, «Сохранить» включена.
   Выбор не удался (opts.fails() → true) — окно закрывается и страница
   показывает Alert «Не удалось загрузить файл» в окне ФИ (opts.onFail).
   Закрытие крестиком ничего не применяет.

   API:
     PostFairValueInstrumentablesUploadFileModal.bind(scrim, { fails })
       → api.open(label, { onSaved, onFail }) — открыть окно поверх текущего слоя
       fails()   → boolean — демо-сценарий «файл не загрузился»
       label     — подпись инструмента для подсказки («1.1.1.1. Транш»)
       onSaved() — «Сохранить» в предпросмотре
       onFail()  — выбор файла не удался
   ============================================================ */
(function () {
  'use strict';

  function bind(scrim, opts) {
    if (!scrim) return null;
    if (scrim.__fvUpload) return scrim.__fvUpload;
    opts = opts || {};
    var modal = scrim.querySelector('.modal');
    var pick = scrim.querySelector('[data-fv-upload-pick]');
    var save = scrim.querySelector('[data-fv-upload-save]');
    var xml = scrim.querySelector('[data-fv-upload-xml]');
    var hint = scrim.querySelector('[data-fv-upload-hint]');
    if (!modal || !pick || !save) return null;

    var handlers = {};

    function setState(state) {
      modal.setAttribute('data-state', state);
      save.disabled = state !== 'preview';
    }

    pick.addEventListener('click', function () {
      if (opts.fails && opts.fails()) {
        window.DSModal.closeTop();
        if (handlers.onFail) handlers.onFail();
        return;
      }
      xml.textContent = window.MOCK_FV_INSTRUMENT_XML || '';
      setState('preview');
    });
    save.addEventListener('click', function () {
      window.DSModal.closeTop(true);
      if (handlers.onSaved) handlers.onSaved();
    });

    var api = {
      open: function (label, h) {
        handlers = h || {};
        hint.textContent = 'Выберите xml файл инструмента ' + label + '.';
        xml.textContent = '';
        setState('choose');
        return window.DSModal.open(scrim, { nested: true });
      }
    };
    scrim.__fvUpload = api;
    return api;
  }

  window.PostFairValueInstrumentablesUploadFileModal = { bind: bind };
})();

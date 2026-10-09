/* ============================================================
   FairValueUserMetricsModal.js — поведение окна ФИ расчета FV.

   Делает то, чего нет в рантаймах ДС, и только это:
   1) при открытии рисует данные ФИ, значения полей, подсказки «Расчетное: …»
      и строки таблицы «Инструменты в составе ФИ»;
   2) поле правится — значение пользователя; пусто (крестик) — откат к
      расчетному. «Сохранить» без изменений просто закрывает окно, с
      изменениями — спрашивает подтверждение у страницы и после него
      пересобирает ФИ в «Сформирован», XML-файлы инструментов — в «Сформирован»;
   3) действия над файлом инструмента — по матрице FV_INSTRUMENT_FILE_ACTIONS
      (data/fv-dictionaries.js): выгрузка (хук страницы), загрузка
      (подтверждение → окно «Данные по инструменту»), удаление и «Вернуть с
      ошибкой» (подтверждение страницы). Правки данных идут прямо в ФИ,
      который передала страница, и сообщаются ей через onChange.

   Окно ничего не знает о таблице расчета: подтверждения, статус расчета и
   выгрузки — функции страницы (opts). Подтверждения открываются поверх окна
   ФИ (вложенный слой).

   API:
     PostFairValueUserMetricsModal.bind(scrim, opts) → api
       opts.confirm(text, onOk)           — окно «Подтвердите действие»
       opts.upload                        — api окна «Данные по инструменту»
       opts.onChange(item)                — данные ФИ изменены
       opts.exportFile(item, inst, action) — выгрузка файла инструмента (Э5)
     api.open(item, { calcStatus, userRole })
     api.showError(text) / api.hideError() — Alert уровня окна
   ============================================================ */
(function () {
  'use strict';

  var ITEM_LABELS = window.FV_ITEM_STATUS_LABELS;
  var TONES = window.FV_STATUS_TONES;
  var FILE_LABELS = window.FV_XML_FILE_STATE_LABELS;
  var FILE_ACTIONS = window.FV_INSTRUMENT_FILE_ACTIONS;

  /* поля ввода: расчетное значение берётся из editedFields или из самого ФИ */
  var FIELDS = [
    { key: 'rating', post: '' },
    { key: 'lgd', post: '%' },
    { key: 'individualReserveRate', post: '%' }
  ];
  var ACTION_META = {
    exportTemplate: { icon: 'download', tip: 'Выгрузить шаблон xml файла' },
    export: { icon: 'download', tip: 'Выгрузить xml файл' },
    upload: { icon: 'upload', tip: 'Загрузить xml файл' },
    delete: { icon: 'trash', tip: 'Удалить xml файл' },
    returnWithError: { icon: 'flip-backward', tip: 'Вернуть с ошибкой' }
  };
  var FILE_ICONS = { GENERATED: 'file-basic', UPLOADED: 'file-attachment', DELETED: 'file-off-close' };
  var SAVE_TEXT = 'Внесенные изменения заново сформируют XML для расчета FV по всем инструментам ФИ и потребуют повторной отправки в LP.';

  function esc(v) {
    var d = document.createElement('div');
    d.textContent = v == null ? '' : String(v);
    return d.innerHTML;
  }
  function fmtNum(n, digits) {
    if (n == null) return '';
    var parts = Math.abs(n).toFixed(digits).split('.');
    return (n < 0 ? '−' : '') + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (parts[1] ? ',' + parts[1] : '');
  }
  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? m[3] + '.' + m[2] + '.' + m[1] : '';
  }
  function parseNum(s) {
    var t = String(s).replace(/\s/g, '').replace(',', '.');
    if (t === '') return null;
    var n = Number(t);
    return isNaN(n) ? null : n;
  }
  function label(inst) { return inst.instrumentCode + '. ' + inst.instrumentName; }

  function bind(scrim, opts) {
    if (!scrim) return null;
    if (scrim.__fvMetrics) return scrim.__fvMetrics;
    opts = opts || {};

    var titleEl = scrim.querySelector('[data-fv-title]');
    var errBox = scrim.querySelector('[data-fv-error]');
    var errText = scrim.querySelector('[data-fv-error-text]');
    var sendEl = scrim.querySelector('[data-fv-send]');
    var commentEl = scrim.querySelector('[data-fv-comment]');
    var saveBtn = scrim.querySelector('[data-fv-save]');
    var rowsHost = scrim.querySelector('[data-fv-rows]');
    var headRow = rowsHost.querySelector('.tbl__row--head');
    var inputs = {};
    var helpers = {};
    FIELDS.forEach(function (f) {
      inputs[f.key] = scrim.querySelector('[data-fv-input="' + f.key + '"]');
      helpers[f.key] = scrim.querySelector('[data-fv-helper="' + f.key + '"]');
    });

    var cur = null;  /* { item, ctx, init } */

    function field(key) { return scrim.querySelector('[data-fv-field="' + key + '"]'); }
    function editedOf(it, key) {
      return it.editedFields.filter(function (f) { return f.fieldCode === key; })[0];
    }
    function calcOf(it, key) {
      var e = editedOf(it, key);
      return e ? e.calculatedValue : it[key];
    }

    /* ---------- рисование ---------- */
    function fillSummary(it) {
      titleEl.textContent = it.itemName;
      field('rowNumber').textContent = it.rowNumber;
      field('itemTypeName').textContent = it.itemTypeName || '—';
      field('currencyCode').textContent = it.currencyCode || '—';
      field('fvAmount').textContent = it.fvAmount == null ? '—' : fmtNum(it.fvAmount, 2);
      field('counterpartyName').textContent = it.counterpartyName || '—';
      field('counterpartyInn').textContent = it.counterpartyInn || '—';
      field('crmId').textContent = it.crmId || '—';
      field('vbsAmount').textContent = it.vbsAmount == null ? '—' : fmtNum(it.vbsAmount, 2);
    }
    function fillForm(it) {
      sendEl.checked = !!it.sendToLp;
      FIELDS.forEach(function (f) {
        var edited = editedOf(it, f.key);
        inputs[f.key].value = edited ? String(it[f.key]) : '';
        var calc = calcOf(it, f.key);
        helpers[f.key].hidden = calc == null;
        helpers[f.key].textContent = calc == null ? '' : 'Расчетное: ' + fmtNum(calc, 0) + f.post;
      });
      commentEl.value = it.comment || '';
      if (window.DSInput) window.DSInput.syncAll(scrim);
    }
    function snapshot() {
      var s = { send: sendEl.checked, comment: commentEl.value.trim() };
      FIELDS.forEach(function (f) { s[f.key] = parseNum(inputs[f.key].value); });
      return s;
    }
    function isDirty() {
      var a = cur.init, b = snapshot();
      return Object.keys(a).some(function (k) { return a[k] !== b[k]; });
    }

    function actionBtn(act, idx, inst) {
      var m = ACTION_META[act];
      var off = act === 'delete' && inst.xmlFileStateCode !== 'UPLOADED';
      return '<button type="button" class="ibtn ibtn--neutral ibtn--s" data-fv-act="' + act + '" data-inst="' + idx + '"'
        + ' aria-label="' + m.tip + '" data-tooltip="' + m.tip + '"' + (off ? ' disabled' : '') + '><i data-icon="' + m.icon + '"></i></button>';
    }
    function rowHTML(it, inst, idx) {
      var grid = headRow.style.gridTemplateColumns;
      var acts = (FILE_ACTIONS[inst.statusCode] || []).map(function (a) { return actionBtn(a, idx, inst); }).join('');
      var cells = [
        '<div class="tc tc--separator"></div>',
        '<div class="tc"><span class="tc__row"><span class="tc__text">' + esc(it.rowNumber) + '</span></span></div>',
        '<div class="tc"><span class="tc__row"><span class="chip chip--s chip--rounded ' + TONES[inst.statusCode] + '"'
          + (inst.errorText ? ' data-tooltip="' + esc(inst.errorText) + '"' : '') + '><span class="chip__label">' + esc(ITEM_LABELS[inst.statusCode]) + '</span></span></span></div>',
        '<div class="tc"><span class="tc__row"><a class="link link--accent tc__text tc__text--truncate" href="#">' + esc(label(inst)) + '</a></span></div>',
        '<div class="tc tc--numbers"><span class="tc__row"><span class="tc__text tc__text--truncate">' + (inst.fvAmount == null ? '' : fmtNum(inst.fvAmount, 2)) + '</span></span></div>',
        '<div class="tc"><span class="tc__row"><span class="tc__text">' + fmtDate(it.firstIssueDate) + '</span></span></div>',
        '<div class="tc"><span class="tc__row"><span class="tc__text">' + fmtDate(it.maturityDate) + '</span></span></div>',
        '<div class="tc"><span class="tc__row"><span class="tc__icon tc__icon--lead"><i data-icon="' + FILE_ICONS[inst.xmlFileStateCode] + '"></i></span>'
          + '<span class="tc__text tc__text--truncate">' + esc(FILE_LABELS[inst.xmlFileStateCode]) + '</span></span></div>',
        '<div class="tc"><span class="tc__row">' + acts + '</span></div>',
        '<div class="tc tc--separator"></div>'
      ];
      return '<div class="tbl__row" data-row="' + idx + '" style="grid-template-columns:' + grid + ';">' + cells.join('') + '</div>';
    }
    function renderRows() {
      var it = cur.item;
      Array.prototype.forEach.call(rowsHost.querySelectorAll('[data-row], [data-fv-empty]'), function (r) { r.remove(); });
      var html = it.instruments.length
        ? it.instruments.map(function (inst, i) { return rowHTML(it, inst, i); }).join('')
        : '<div class="tbl__row" data-fv-empty style="grid-template-columns:' + headRow.style.gridTemplateColumns + ';">'
          + '<div class="tc tc--separator"></div><div class="tc" style="grid-column:2 / -2"><span class="tc__row"><span class="tc__text">Нет данных</span></span></div><div class="tc tc--separator"></div></div>';
      rowsHost.insertAdjacentHTML('beforeend', html);
      if (window.dsIcons) window.dsIcons.apply(rowsHost);
    }

    function showError(text) {
      errText.textContent = text;
      errBox.hidden = false;
      if (window.dsIcons) window.dsIcons.apply(errBox);
    }
    function hideError() { errBox.hidden = true; }

    /* ---------- правка данных ---------- */
    function setFormed(it) {
      it.statusCode = 'FORMED';
      it.instruments.forEach(function (i) {
        i.statusCode = 'FORMED'; i.xmlFileStateCode = 'GENERATED'; i.errorText = null;
      });
    }
    /* файл инструмента удалён — у ФИ «Нет данных»; все файлы на месте — снова «Сформирован» */
    function syncItemStatus(it) {
      var gone = it.instruments.some(function (i) { return i.statusCode === 'NO_DATA'; });
      if (gone) it.statusCode = 'NO_DATA';
      else if (it.statusCode === 'NO_DATA') it.statusCode = 'FORMED';
    }
    function applySave() {
      var it = cur.item;
      it.sendToLp = sendEl.checked;
      FIELDS.forEach(function (f) {
        var raw = parseNum(inputs[f.key].value);
        var calc = calcOf(it, f.key);
        var e = editedOf(it, f.key);
        if (raw == null || raw === calc) {
          if (e) { it[f.key] = calc; it.editedFields.splice(it.editedFields.indexOf(e), 1); }
        } else {
          it[f.key] = raw;
          if (!e) it.editedFields.push({ fieldCode: f.key, calculatedValue: calc });
        }
      });
      it.comment = commentEl.value.trim();
      setFormed(it);
    }
    function changed() {
      renderRows();
      if (opts.onChange) opts.onChange(cur.item);
    }

    saveBtn.addEventListener('click', function () {
      if (!cur) return;
      if (!isDirty()) { window.DSModal.closeTop(true); return; }
      var text = SAVE_TEXT + (cur.ctx.calcStatus === 'APPROVED' ? '<br>Расчет утвержден: пересчитан будет только этот ФИ.' : '');
      opts.confirm(text, function () {
        applySave();
        window.DSModal.closeTop(true);
        if (opts.onChange) opts.onChange(cur.item);
      });
    });

    /* числовые поля: только цифры и разделитель */
    FIELDS.forEach(function (f) {
      inputs[f.key].addEventListener('input', function () {
        var v = inputs[f.key].value.replace(/[^\d.,]/g, '');
        if (v !== inputs[f.key].value) inputs[f.key].value = v;
      });
    });

    /* ---------- файлы инструментов ---------- */
    /* подтверждение загрузки — общее окно подтверждения страницы */
    function askUpload(inst, onOk) {
      opts.confirm('Загрузка данных по инструменту «' + esc(label(inst)) + '» из файла. Сформированный xml файл инструмента будет заменен.', onOk);
    }

    rowsHost.addEventListener('click', function (e) {
      var link = e.target.closest('a.link');
      if (link) { e.preventDefault(); return; }
      var b = e.target.closest('[data-fv-act]');
      if (!b || b.disabled || !cur) return;
      var inst = cur.item.instruments[b.dataset.inst];
      var act = b.dataset.fvAct;
      hideError();
      if (act === 'export' || act === 'exportTemplate') {
        if (opts.exportFile) opts.exportFile(cur.item, inst, act, api);
      } else if (act === 'upload') {
        askUpload(inst, function () {
          opts.upload.open(label(inst), {
            onSaved: function () {
              inst.xmlFileStateCode = 'UPLOADED';
              if (inst.statusCode === 'NO_DATA' || inst.statusCode === 'ERROR' || inst.statusCode === 'RETURNED_FROM_LP') inst.statusCode = 'FORMED';
              inst.errorText = null;
              syncItemStatus(cur.item);
              changed();
            },
            onFail: function () { showError('Не удалось загрузить файл'); }
          });
        });
      } else if (act === 'delete') {
        opts.confirm('Удаление xml файла инструмента ' + esc(label(inst)) + '.', function () {
          inst.xmlFileStateCode = 'DELETED';
          inst.statusCode = 'NO_DATA';
          inst.errorText = null;
          syncItemStatus(cur.item);
          changed();
        });
      } else if (act === 'returnWithError') {
        opts.confirm('Возврат инструмента ' + esc(label(inst)) + ' с ошибкой.', function () {
          inst.statusCode = 'ERROR';
          inst.errorText = 'Файл возвращён пользователем на доработку';
          changed();
        });
      }
    });

    var api = {
      open: function (item, ctx) {
        cur = { item: item, ctx: ctx || {}, init: null };
        hideError();
        fillSummary(item);
        fillForm(item);
        cur.init = snapshot();
        renderRows();
        if (window.dsIcons) window.dsIcons.apply(scrim);
        return window.DSModal.open(scrim);
      },
      showError: showError,
      hideError: hideError
    };
    scrim.__fvMetrics = api;
    return api;
  }

  window.PostFairValueUserMetricsModal = { bind: bind };
})();

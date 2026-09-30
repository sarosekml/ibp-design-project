/* ============================================================
   InstrumentsModal.js — окно «Инструменты»: инструменты одного продукта.

   Окно стоит на общем слое двух колонок PostProductPicker
   (../ProductsModal/ProductsModal.js — подключается раньше этого файла):
   перенос, черновик, номера, подтверждение, состояния и строки — там.
   Здесь только что в колонках и что делает перенос (ответ человека
   30.09.2026, 6: окно инструментов работает так же, как окно продуктов;
   во фронтенде это отдельный виджет InstrumentsModal):
   – «Доступные инструменты» — типы инструментов, которые можно добавить в
     этот продукт (ProductTreeStore.availableInstruments): состав продукта
     из каталога, без состава — весь справочник (вопрос 38 задачи RE0001);
   – «Выбрано» — инструменты продукта; у сохранённых — номер. Строка
     выключена, если инструмент прикреплён к ФИ или к ФИ прикреплён его
     транш (ответ 20, вопрос 35);
   – перенос вправо добавляет инструмент (ProductTreeStore.addInstrument),
     влево — удаляет его с траншами: сохранённый — после подтверждения,
     добавленный в окне — сразу.

   Открывает окно событие тайла 'ptreeaction' с action ADD у продукта
   (⊕ «Добавить инструмент»).

   API: PostModalInstruments.open(productId) · use(productId) — нарисовать
        без открытия (витрина)
   ============================================================ */
(function () {
  'use strict';

  var scrim = document.getElementById('ptree-instruments-scrim');
  var Picker = window.PostProductPicker;
  if (!scrim || !Picker) return;

  var productId = null;

  function store() { return window.ProductTreeStore; }
  function productNode() { return productId && store() ? store().node(productId) : null; }

  var picker = Picker.bind(scrim, {
    infoLabel: 'Описание инструмента',
    ready: function () { return !!productNode(); },
    title: function () {
      var n = productNode();
      return n ? n.number + ' ' + n.name : '';
    },
    available: function () {
      return store().availableInstruments(productId).map(function (t) {
        return { key: t.code, name: t.name, description: null };
      });
    },
    selected: function () {
      var n = productNode();
      return (n ? n.children : []).map(function (c) {
        return { key: c.id, name: c.name, number: c.number, description: null, disabled: !store().canRemove(c.id) };
      });
    },
    add: function (code) { store().addInstrument(productId, code); },
    remove: function (id) { store().remove(id); }
  });

  function open(id) {
    productId = id;
    picker.open();
  }

  function use(id) {
    productId = id;
    picker.use();
  }

  /* ⊕ «Добавить инструмент» у продукта в тайле */
  document.addEventListener('ptreeaction', function (e) {
    var d = e.detail || {};
    if (d.action !== 'ADD' || !store()) return;
    var node = d.node || store().node(d.id);
    if (node && node.kind === 'PRODUCT') open(node.id);
  });

  window.PostModalInstruments = { open: open, use: use };
})();

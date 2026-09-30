/* ============================================================
   DidProductsModal.js — окно «Продукты ДИД».

   Окно стоит на общем слое двух колонок PostProductPicker
   (../ProductsModal/ProductsModal.js — подключается раньше этого файла):
   перенос, черновик, номера, подтверждение, состояния и строки — там.
   Здесь только что в колонках и что делает перенос:
   – «Доступные продукты ДИД» — весь справочник продуктов ДИД; колонка не
     убывает, продукт ДИД можно выбрать повторно (ответ человека
     30.09.2026, 14);
   – «Выбрано» — продукты ДИД сделки; у сохранённых — номер, у основного —
     звезда-знак: основной назначают на странице сделки (ответы 9, 24);
   – перенос вправо добавляет продукт ДИД с обязательными продуктами и их
     обязательными инструментами (ProductTreeStore.addDid), влево — удаляет
     его со всей веткой: сохранённый — после подтверждения
     ProductTreeConfirmModal, добавленный в окне — сразу (ответ 25).

   Удаление продукта ДИД из меню тайла — тоже ProductTreeConfirmModal, окно
   в нём не участвует.

   Открывает окно событие тайла 'ptreeaction' с action ADD_DID.

   API: PostModalDidProducts.open() · repaint() · use()
   ============================================================ */
(function () {
  'use strict';

  var scrim = document.getElementById('ptree-did-scrim');
  var Picker = window.PostProductPicker;
  if (!scrim || !Picker) return;

  function store() { return window.ProductTreeStore; }

  function descOf(code) {
    var hit = (window.PRODUCT_DID_CATALOG || []).filter(function (d) { return d.code === code; })[0];
    return hit ? hit.description : null;
  }

  var picker = Picker.bind(scrim, {
    infoLabel: 'Описание продукта ДИД',
    markLabel: 'Основной продукт ДИД',
    ready: function () { return store().dealId() != null || store().view().length > 0; },
    available: function () {
      return store().didCatalog().map(function (d) {
        return { key: d.code, name: d.name, description: d.description };
      });
    },
    selected: function () {
      return store().view().map(function (n) {
        return {
          key: n.id, name: n.name, number: n.number, description: descOf(n.code),
          main: n.isMain, disabled: !store().canRemove(n.id)
        };
      });
    },
    add: function (code) { store().addDid(code); },
    /* в окне удаление остаётся в черновике до «Сохранить» */
    remove: function (id) { store().remove(id); }
  });

  /* «+ Продукт ДИД», «+ Добавить продукт ДИД», «Добавить продукт ДИД» в
     пустом тайле */
  document.addEventListener('ptreeaction', function (e) {
    var d = e.detail || {};
    if (d.action === 'ADD_DID' && store()) picker.open();
  });

  window.PostModalDidProducts = { open: picker.open, repaint: picker.repaint, use: picker.use };
})();

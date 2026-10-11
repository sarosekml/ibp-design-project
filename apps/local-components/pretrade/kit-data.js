/* Реестр витрины локальных компонентов (Локальные компоненты Pre) — меню и карточки страниц apps/local-components/pretrade/.

   СГЕНЕРИРОВАН kit-build.mjs из паспортов виджетов (apps/<раздел>/<модуль>/widgets/<группа>/<Имя>/<Имя>.md)
   и project.json → localKit. Руками не править: пересобрать — node .agents/tools/kit-build.mjs
   (гейт сверяет, шаг kit).

   Обычный <script>, а не JSON: страницы открываются по file://, где fetch не работает.

   Поля компонента: id — папка виджета; name, category, purpose, version, updated —
   из паспорта; type — tile | table | modal | popover | context-menu | part (подчасть)
   | model (статусная модель data/*-status-model.js: name, category, purpose — из meta);
   module — <раздел>/<модуль>; doc — страница компонента от папки витрины; owner —
   id компонента, чей это артефакт (окно, поповер), или null; stub — заглушка. */
window.IBPKit = {
  "title": "Локальные компоненты Pre",
  "categories": [
    "Общие",
    "Другое"
  ],
  "components": []
};

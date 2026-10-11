/* Реестр витрины локальных компонентов (Локальные компоненты Core) — меню и карточки страниц apps/local-components/core/.

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
  "title": "Локальные компоненты Core",
  "categories": [
    "Общие",
    "Другое"
  ],
  "components": [
    {
      "id": "DateBadge",
      "name": "Блок даты",
      "category": "Общие",
      "purpose": "День и месяц «листком календаря» в ведущем слоте строки встречи; сегодняшняя дата — в тоне accent",
      "type": "tile",
      "typeLabel": "тайл",
      "module": "core/drafts/new-dashboard-mvp",
      "doc": "core/drafts/new-dashboard-mvp/DateBadge.doc.html",
      "owner": null,
      "stub": false,
      "version": "1.000",
      "updated": "09.10.2026"
    },
    {
      "id": "HomeProfileTile",
      "name": "Профиль на главной",
      "category": "Другое",
      "purpose": "Кто вошёл — фото, имя, должность и деск, связь — и быстрый вход в создание встречи и задачи",
      "type": "tile",
      "typeLabel": "тайл",
      "module": "core/drafts/new-dashboard-mvp",
      "doc": "core/drafts/new-dashboard-mvp/HomeProfileTile.doc.html",
      "owner": null,
      "stub": false,
      "version": "1.000",
      "updated": "09.10.2026"
    },
    {
      "id": "MeetingCreateModal",
      "name": "Новая встреча",
      "category": "Другое",
      "purpose": "Быстро назначить встречу с клиентом с главной — клиент, тема, дата и время",
      "type": "modal",
      "typeLabel": "модальное окно",
      "module": "core/drafts/new-dashboard-mvp",
      "doc": "core/drafts/new-dashboard-mvp/MeetingCreateModal.doc.html",
      "owner": "MeetingsTile",
      "stub": false,
      "version": "1.000",
      "updated": "09.10.2026"
    },
    {
      "id": "MeetingsTile",
      "name": "Встречи",
      "category": "Другое",
      "purpose": "Ближайшие встречи с клиентами — свои или деска, с выборками «сегодня», «на неделе», «требует внимания»",
      "type": "tile",
      "typeLabel": "тайл",
      "module": "core/drafts/new-dashboard-mvp",
      "doc": "core/drafts/new-dashboard-mvp/MeetingsTile.doc.html",
      "owner": null,
      "stub": false,
      "version": "1.000",
      "updated": "09.10.2026"
    },
    {
      "id": "MyDayTile",
      "name": "Мой день",
      "category": "Другое",
      "purpose": "Сегодняшние встречи по времени и горящие сроки задач — с переходом к нужной выборке в один клик",
      "type": "tile",
      "typeLabel": "тайл",
      "module": "core/drafts/new-dashboard-mvp",
      "doc": "core/drafts/new-dashboard-mvp/MyDayTile.doc.html",
      "owner": null,
      "stub": false,
      "version": "1.000",
      "updated": "09.10.2026"
    },
    {
      "id": "NewsTile",
      "name": "Новости по клиентам",
      "category": "Другое",
      "purpose": "Свежие публикации о клиентах сотрудника или деска — повод для звонка и тема встречи",
      "type": "tile",
      "typeLabel": "тайл",
      "module": "core/drafts/new-dashboard-mvp",
      "doc": "core/drafts/new-dashboard-mvp/NewsTile.doc.html",
      "owner": null,
      "stub": false,
      "version": "1.000",
      "updated": "09.10.2026"
    },
    {
      "id": "StatCard",
      "name": "Карточка-счётчик",
      "category": "Общие",
      "purpose": "Число с подписью и тоном, по клику включает выборку списка — счётчики встреч и задач главной",
      "type": "tile",
      "typeLabel": "тайл",
      "module": "core/drafts/new-dashboard-mvp",
      "doc": "core/drafts/new-dashboard-mvp/StatCard.doc.html",
      "owner": null,
      "stub": false,
      "version": "1.000",
      "updated": "09.10.2026"
    },
    {
      "id": "TaskCreateModal",
      "name": "Новая задача",
      "category": "Другое",
      "purpose": "Быстро поставить себе задачу с главной — формулировка, срок, приоритет, клиент и сделка",
      "type": "modal",
      "typeLabel": "модальное окно",
      "module": "core/drafts/new-dashboard-mvp",
      "doc": "core/drafts/new-dashboard-mvp/TaskCreateModal.doc.html",
      "owner": "TasksTile",
      "stub": false,
      "version": "1.000",
      "updated": "09.10.2026"
    },
    {
      "id": "TasksTile",
      "name": "Задачи",
      "category": "Другое",
      "purpose": "Открытые задачи по срочности — свои или деска, с выборками «новые», «сегодня», «просрочено» и сменой статуса на месте",
      "type": "tile",
      "typeLabel": "тайл",
      "module": "core/drafts/new-dashboard-mvp",
      "doc": "core/drafts/new-dashboard-mvp/TasksTile.doc.html",
      "owner": null,
      "stub": false,
      "version": "1.000",
      "updated": "09.10.2026"
    }
  ]
};

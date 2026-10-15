# Дашборд Аналитика

Рабочий дашборд сотрудника на главной (трек `product`): вместо навигационных
тайлов разделов — профиль с быстрыми действиями на всю строку, под ним —
встречи, задачи и новости по клиентам; навигация по разделам — только в меню.
Макет дизайнера «Главная» 1920, версия от 15.10.2026, в репозитории не
хранится; решения человека 09.10.2026 и 15.10.2026 — в спеке страницы.
Переведён из концепта `new-dashboard-mvp` (drafts) 15.10.2026.

Открывать: `pages/HomePage.preview.html` (собирает
`node .agents/tools/assemble.mjs`; источник — `pages/HomePage.html` с метками
`<ds-include>`). Демо-состояния — `?state=loading | empty | error`, вид аватара
— `?avatar=text`; то же переключателями таба «System» панели прототипа.

Панель прототипа: Alt+Shift+P на любой странице; сценарии —
`proto-panel/flows.yaml` («Утро аналитика», три состояния).

## Что где

| Путь | Что |
|---|---|
| `pages/HomePage.*` | страница, собранное превью, спека `HomePage.screen.md` |
| `widgets/tiles/` | тайлы `HomeProfileTile`, `MeetingsTile`, `HomeTasksTile`, `NewsTile`; подчасти-кандидаты в ДС `StatCard`, `DateBadge` |
| `widgets/modals/` | окна `MeetingCreateModal`, `TaskCreateModal` |
| `data/` | демо-данные с typedef и хранилище `home-store.js` |
| `refs/` | фото профиля (участвует в прототипе) |
| `proto-panel/` | сценарии показа и комментарии |

Кандидаты в ДС (карточка-счётчик, блок даты, тон поверхности Tile) — спека
страницы, раздел 15.

## Что лежит

<!-- @tree — дерево генерирует .agents/tools/module-readme.mjs, руками не править -->
```
dashboard-app/
├── app.json                     ← запись хаба: «Дашборд Аналитика», трек product
├── README.md
├── pages/
│   ├── HomePage.html            ← Главная — дашборд — источник, собирается в HomePage.preview.html
│   ├── HomePage.preview.html    ← собранная страница — открывать её
│   └── HomePage.screen.md       ← спека
├── widgets/
│   ├── modals/                  ← модальные окна
│   │   ├── MeetingCreateModal/  ← Новая встреча
│   │   │   ├── CHANGELOG.md
│   │   │   ├── fixtures.json
│   │   │   ├── MeetingCreateModal.css
│   │   │   ├── MeetingCreateModal.html
│   │   │   ├── MeetingCreateModal.js
│   │   │   └── MeetingCreateModal.md
│   │   └── TaskCreateModal/     ← Новая задача
│   │       ├── CHANGELOG.md
│   │       ├── fixtures.json
│   │       ├── TaskCreateModal.css
│   │       ├── TaskCreateModal.html
│   │       ├── TaskCreateModal.js
│   │       └── TaskCreateModal.md
│   └── tiles/                   ← тайлы
│       ├── DateBadge/           ← Блок даты
│       │   ├── CHANGELOG.md
│       │   ├── DateBadge.css
│       │   ├── DateBadge.html
│       │   ├── DateBadge.js
│       │   ├── DateBadge.md
│       │   └── fixtures.json
│       ├── HomeProfileTile/     ← Профиль на главной
│       │   ├── CHANGELOG.md
│       │   ├── fixtures.json
│       │   ├── HomeProfileTile.css
│       │   ├── HomeProfileTile.html
│       │   ├── HomeProfileTile.js
│       │   └── HomeProfileTile.md
│       ├── HomeTasksTile/       ← Задачи
│       │   ├── CHANGELOG.md
│       │   ├── fixtures.json
│       │   ├── HomeTasksTile.css
│       │   ├── HomeTasksTile.html
│       │   ├── HomeTasksTile.js
│       │   └── HomeTasksTile.md
│       ├── MeetingsTile/        ← Встречи
│       │   ├── CHANGELOG.md
│       │   ├── fixtures.json
│       │   ├── MeetingsTile.css
│       │   ├── MeetingsTile.html
│       │   ├── MeetingsTile.js
│       │   └── MeetingsTile.md
│       ├── NewsTile/            ← Новости по клиентам
│       │   ├── CHANGELOG.md
│       │   ├── fixtures.json
│       │   ├── NewsTile.css
│       │   ├── NewsTile.html
│       │   ├── NewsTile.js
│       │   └── NewsTile.md
│       └── StatCard/            ← Карточка-счётчик
│           ├── CHANGELOG.md
│           ├── fixtures.json
│           ├── StatCard.css
│           ├── StatCard.html
│           ├── StatCard.js
│           └── StatCard.md
├── data/
│   ├── home-store.js            ← home-store.js — хранилище главной: выборки, счётчики и правки демо-данн…
│   ├── mock-meetings.js         ← Встречи с клиентами — демо-данные прототипа (window.MOCK_MEETINGS).
│   ├── mock-news.js             ← Новости по клиентам — демо-данные прототипа (window.MOCK_NEWS).
│   ├── mock-profile.js          ← Профиль сотрудника на главной — демо-данные прототипа (window.MOCK_EMPL…
│   └── mock-tasks.js            ← Задачи сотрудника и деска — демо-данные прототипа (window.MOCK_TASKS).
├── proto-panel/                 ← панель прототипа: сценарии показа и комментарии
│   ├── comments.md              ← комментарии к прототипу
│   ├── flows.yaml               ← сценарии показа
│   └── panel-data.js            ← генерат панели — руками не править
└── new-dashboard-mvp.handoff.md
```
<!-- /@tree -->

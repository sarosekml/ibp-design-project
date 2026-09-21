# ai-Designer — памятка для прототипирования

Локальный файл (исключён из git через `.git/info/exclude`): в репозитории
действует сторож нейтральности, служебным файлам агентов в `main` не место.
Общие правила живут в `AGENTS.md` и `.agents/` — здесь только указатели и
выжимка того, что нужно при сборке прототипа.

@AGENTS.md

## Перед началом — прочитать

| Что | Где |
|---|---|
| Правила процесса (целиком) | `.agents/rules/process.md` |
| Знание о ДС (целиком) | `design-system/AGENTS.md` |
| Как устроены роли и маршруты | `.agents/agents/ai-designer.md`, `.agents/agents/screen-builder.md` |
| Сборка экрана по шагам | `.agents/skills/screen-assembly/SKILL.md` + `design-system/templates/screen/Screen.html`, `patterns.md`, `design-system/specs/_runtime-hooks.md` |
| Формат спеки экрана | `.agents/skills/screen-spec/references/template.md` |
| Композиция | `.agents/skills/layout-composition/SKILL.md` |
| Приёмка | `.agents/skills/screen-review/SKILL.md`, `.agents/skills/composition-review/SKILL.md` |

## ДС — читать точечно

```bash
grep -n "^## " design-system/specs/_cheatsheet.md                 # оглавление
sed -n '/^## Kanban$/,/^## /p' design-system/specs/_cheatsheet.md  # блок компонента
cat design-system/specs/Kanban.md                                  # полная спека, если блока мало
```

- Никогда целиком: `_cheatsheet.md`, `design-system/scripts/icons-data.js`, `design-system/pages/**`.
- Имена глифов — `design-system/specs/Icons.md`; иллюстрации — `ls design-system/assets/illustrations`.
- Каталог тайлов и меню главной — `design-system/scripts/ibp-home.js`.
- Живые примеры экранов: `apps/post/` (главная, реестр с фильтром `.tfm`),
  `apps/pipeline-manager-kanban/` (канбан + таблица + Drawer + модалки).

## Прототип в `apps/<имя>/`

- `app.json` — `id` и `track: "rnd"`; экраны и спеки — в `pages/`, все на одной
  глубине (иначе сторож хаба, П6).
- `pages/index.html` — главная (стартовая страница Layout) → остальные экраны.
- На каждый `.html` — спека `<Имя>.screen.md` рядом (иначе сенсор Б12).
- ДС подключает загрузчик: `<script src="../../../boot/ds-head.js">` первым в
  `<head>` и `<script src="../../../boot/ds-body.js">` вместо `ds.js`
  (`data-ds="scripts/ibp-home.js"` — доп. скрипты ДС); фон главной —
  `var(--boot-bg-illustration, none)`. Литерал `design-system/` в экране — Б34.
- Демо-данные — `data/*.js` приложения, из экрана `../data/*.js`, обычным
  `<script>` (file://, без fetch).
- Экранный скрипт — после `ds.js`; после перерисовки `innerHTML` заново звать
  `dsIcons.apply`, `DSMenu.bindAll`, `DSModal.bindAll`, `DSDrawer.bindAll`,
  `DSKanban.bind`, `DSTable.wireAll`.
- Запись в `hub.js` (`group: 'concepts'`, `root: 'apps/<имя>'`, `href`), строка
  пользователя в меню → `../../../index.html`.
- Валюта — кодом (`RUB`), не «руб.»/«₽» (Б26). Глиф `Important-deals` сенсор не знает.
- Своё поверх ДС — только на токенах и с записью в «Открытые вопросы» спеки.

## Проверка

```bash
node .agents/tools/layout-check.mjs apps/<имя>/pages/<Экран>.html
node .agents/tools/lessons-cli.mjs gate
node .agents/tools/vendor-scan.mjs
```

Во встроенном браузере страницы по file:// открываются без стилей — поднимать
статический сервер из локальной конфигурации запуска (`ds-static`, порт 8765) и открывать `http://localhost:8765/apps/<имя>/pages/…`.

## Pixso

Прототипы — через плагин (канал называет дизайнер). Экспорт фрейма —
`export_node_as_image`; тексты — `scan_text_nodes`. Особенности плагина — в
памяти проекта.

## Репозиторий

- Без абсолютных путей с машины автора в файлах (источник — словами).
- Без имён вендоров/ассистентов/моделей в содержимом файлов.
- Без подписей агента в коммитах и PR.

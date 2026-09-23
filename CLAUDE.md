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
- Живые примеры экранов: `apps/postrade/drafts/` (главная, реестр с фильтром `.tfm`),
  `apps/pretrade/drafts/pipeline-manager-kanban/` (канбан + таблица + Drawer + модалки).

## Прототип в `apps/<раздел>/drafts/<имя>/`

- Разделы повторяют дерево фронтенда (`core/`, `ib/`, `pretrade/`, `postrade/`,
  `common/`, `ui-kit/`); концепты и черновики — в `drafts/` своего модуля
  (`ib/drafts/`, `pretrade/drafts/`, `postrade/drafts/`).
  Приложение — папка с `app.json` на любой глубине.
- **Внутри `drafts/` структура свободная — это ресерч**: приложение может лежать
  прямо в `drafts/` (`postrade/drafts/` — это Post) или глубже, экраны вне
  `pages/`, `id` не по имени папки. Сторож хаба там не требует П4/П6/сверки id,
  но ссылки (П7) и возврат на хаб (П5) проверяет. Вне `drafts/` — строгая форма.
  Пути до `apps/` и хаба считать от экрана.

- `app.json` — `id` и `track: "rnd"`; экраны и спеки — в `pages/`, все на одной
  глубине (иначе сторож хаба, П6).
- `pages/index.html` — главная (стартовая страница Layout) → остальные экраны.
- На каждый `.html` — спека `<Имя>.screen.md` рядом (иначе сенсор Б12).
- ДС подключает загрузчик: `<script src="../../../../ds-config.js">` первым в
  `<head>` и `<script src="../../../../ds-body.js">` вместо `ds.js` (путь до `apps/`
  из `<раздел>/drafts/<имя>/pages/`). Адрес ДС — одна строка `DS_PATH` в `apps/ds-config.js`
  (`data-ds="scripts/ibp-home.js"` — доп. скрипты ДС); фон главной —
  `var(--boot-bg-illustration, none)`. Литерал `design-system/` в экране — Б34.
- Демо-данные — `data/*.js` приложения, из экрана `../data/*.js`, обычным
  `<script>` (file://, без fetch).
- Экранный скрипт — после `ds.js`; после перерисовки `innerHTML` заново звать
  `dsIcons.apply`, `DSMenu.bindAll`, `DSModal.bindAll`, `DSDrawer.bindAll`,
  `DSKanban.bind`, `DSTable.wireAll`.
- Запись приложения — `app.json` (`id`, `track`, `title`, `desc`, `home`, `icon`),
  реестр `hub.js` пересобрать: `node .agents/tools/hub-build.mjs` (руками не
  править); строка пользователя в меню → `../../../../../index.html`.
- Валюта — кодом (`RUB`), не «руб.»/«₽» (Б26). Глиф `Important-deals` сенсор не знает.
- Своё поверх ДС — только на токенах и с записью в «Открытые вопросы» спеки.

## Проверка

```bash
node .agents/tools/layout-check.mjs apps/<раздел>/drafts/<имя>/pages/<Экран>.html
node .agents/tools/lessons-cli.mjs gate
node .agents/tools/vendor-scan.mjs
```

Во встроенном браузере страницы по file:// открываются без стилей — поднимать
статический сервер из локальной конфигурации запуска (`ds-static`, порт 8765) и открывать `http://localhost:8765/apps/<раздел>/drafts/<имя>/pages/…`.

## Pixso

Прототипы — через плагин (канал называет дизайнер). Экспорт фрейма —
`export_node_as_image`; тексты — `scan_text_nodes`. Особенности плагина — в
памяти проекта.

## Репозиторий

- Без абсолютных путей с машины автора в файлах (источник — словами).
- Без имён вендоров/ассистентов/моделей в содержимом файлов.
- Без подписей агента в коммитах и PR.

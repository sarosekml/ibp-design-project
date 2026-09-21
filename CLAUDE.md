# ai-Designer — памятка для прототипирования

Локальный файл (исключён из git через `.git/info/exclude`): в репозитории
действует сторож нейтральности, служебным файлам агентов в `main` не место.
Общие правила живут в `AGENTS.md` и `.opencode/` — здесь только указатели и
выжимка того, что нужно при сборке прототипа.

@AGENTS.md

## Перед началом — прочитать

| Что | Где |
|---|---|
| Правила процесса (целиком) | `.opencode/rules/ds-rules.md` |
| Знание о ДС (целиком) | `DS-IBP/AGENTS.md` |
| Как устроены роли и маршруты | `.opencode/agents/ai-designer.md`, `.opencode/agents/screen-builder.md` |
| Сборка экрана по шагам | `.opencode/skills/screen-assembly/SKILL.md` + `DS-IBP/templates/screen/Screen.html`, `patterns.md`, `DS-IBP/specs/_runtime-hooks.md` |
| Формат спеки экрана | `.opencode/skills/screen-spec/references/template.md` |
| Композиция | `.opencode/skills/layout-composition/SKILL.md` |
| Приёмка | `.opencode/skills/screen-review/SKILL.md`, `.opencode/skills/composition-review/SKILL.md` |

## ДС — читать точечно

```bash
grep -n "^## " DS-IBP/specs/_cheatsheet.md                 # оглавление
sed -n '/^## Kanban$/,/^## /p' DS-IBP/specs/_cheatsheet.md  # блок компонента
cat DS-IBP/specs/Kanban.md                                  # полная спека, если блока мало
```

- Никогда целиком: `_cheatsheet.md`, `DS-IBP/scripts/icons-data.js`, `DS-IBP/pages/**`.
- Имена глифов — `DS-IBP/specs/Icons.md`; иллюстрации — `ls DS-IBP/assets/illustrations`.
- Каталог тайлов и меню главной — `DS-IBP/scripts/ibp-home.js`.
- Живые примеры экранов: `Projects/post/` (главная, реестр с фильтром `.tfm`),
  `Concepts/pipeline-manager-kanban/` (канбан + таблица + Drawer + модалки).

## Прототип в `Concepts/<имя>/`

- `index.html` — главная (стартовая страница Layout) → остальные экраны.
- На каждый `.html` — спека `<Имя>.screen.md` рядом (иначе сенсор Б12).
- Демо-данные — `data/*.js` обычным `<script>` (file://, без fetch).
- Экранный скрипт — после `ds.js`; после перерисовки `innerHTML` заново звать
  `dsIcons.apply`, `DSMenu.bindAll`, `DSModal.bindAll`, `DSDrawer.bindAll`,
  `DSKanban.bind`, `DSTable.wireAll`.
- Запись в `hub.js` (`group: 'concepts'`, `root`, `href`), строка пользователя
  в меню → `../../index.html`.
- Валюта — кодом (`RUB`), не «руб.»/«₽» (Б26). Глиф `Important-deals` сенсор не знает.
- Своё поверх ДС — только на токенах и с записью в «Открытые вопросы» спеки.

## Проверка

```bash
node .opencode/skills/screen-review/tooling/layout-check.mjs Concepts/<имя>/<Экран>.html
node .opencode/skills/screen-review/tooling/lessons-cli.mjs gate
node .opencode/skills/screen-review/tooling/vendor-scan.mjs
```

Во встроенном браузере страницы по file:// открываются без стилей — поднимать
статический сервер из локальной конфигурации запуска (`ds-static`, порт 8765) и открывать `http://localhost:8765/Concepts/<имя>/…`.

## Pixso

Прототипы — через плагин (канал называет дизайнер). Экспорт фрейма —
`export_node_as_image`; тексты — `scan_text_nodes`. Особенности плагина — в
памяти проекта.

## Репозиторий

- Без абсолютных путей с машины автора в файлах (источник — словами).
- Без имён вендоров/ассистентов/моделей в содержимом файлов.
- Без подписей агента в коммитах и PR.

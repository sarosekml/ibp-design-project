---
id: 'RE002'
title: 'ДС: компонент в своей папке со всеми файлами — структура как в ibp-ui-kit'
status: pending
priority: medium
effort: large
dependencies: ['RE001']
tags:
  - design-system
  - restructure
  - tooling
created: 2026-10-01
---

# ДС: компонент в своей папке, как в ibp-ui-kit

## Коротко

- **Что не так.** У разработчиков (репозиторий ibp-ui-kit, снимок у автора на
  01.10.2026) компонент — это папка `src/components/<категория>/<Имя>/`, и в ней
  лежит всё про него: разметка, стили, типы, сторис, утилиты. У нас один
  компонент разнесён по четырём местам: стили — `styles/<имя>.css`, рантайм и
  сценарий страницы — `scripts/ds-<имя>.js` и `scripts/<имя>.page.js`, страница
  документации — `pages/<категория>/<Имя>.html`, спека — `specs/<Имя>.md`.
- **Зачем.** Дизайнер и разработчик ищут компонент в одном месте и видят одну и
  ту же форму. Новый компонент — новая папка, правка компонента не размазана по
  дереву, удаление — одна папка.
- **Решение.** Папка на компонент (основу, паттерн) со всеми его файлами;
  один модуль путей ДС, из которого инструменты узнают, где что лежит.
- **Объём.** Переезжают ≈280 файлов ДС. Вне ДС на старые пути ссылаются ≈120
  файлов, из них ≈30 — генераты витрины локальных компонентов.
- **Главный риск — тихие поломки проверок.** Почти все инструменты читают ДС под
  защитой `existsSync` / `try…catch` или включают правила по префиксу пути
  (`pages/`, `styles/`). После переезда они не упадут, а молча перестанут
  проверять, и гейт останется зелёным. Поэтому раздел 7 и протокол проверки
  «до/после» на полных выводах инструментов, а не на вердиктах.

Решения человека 01.10.2026:

| Вопрос | Решение |
|---|---|
| Уровень категории в пути | да, как в ui-kit: `components/atoms/Avatar/` |
| Имена файлов в папке | PascalCase, как в ui-kit: `Tooltip/Tooltip.css`, `Tooltip.js` |
| Спека компонента | в папку компонента: `Tooltip/Tooltip.md` |

## Objective

Каждый компонент, основа и паттерн ДС — папка со всеми своими файлами, по форме
ibp-ui-kit. Экраны приложений, витрина, хаб, линтер, сенсор и гейт работают как
до переезда — это доказано сравнением полных выводов, мутациями и проверкой
ссылок, а не зелёным вердиктом.

## Предусловия

- Правки `AGENTS.md`, `MAINTAINING.md`, `scripts/ds-lint.md` от 01.10.2026
  закоммичены. Этап Э0 начинается на чистом дереве, на отдельной ветке.
  На 01.10.2026 дерево не чистое: `docs/index.md` изменён, карта RE0002 не
  закоммичена, — погасить до Э0.
- Перенос (Э2) — после закрытия RE0001: она на приёмке и ещё может править
  ProductRow в ДС.
- На время Э2 правки ДС в других копиях репозитория (контур банка)
  замораживаются.

## 1. Как сейчас (замер 01.10.2026)

| Папка | Что там |
|---|---|
| `styles/` | 63 CSS: компоненты и основы плоско; 6 из них — оболочка страниц документации (`ds-docs`, `ds-nav`, `ds-toc`, `docs-split`, `pg-kit`, `input-pages`) |
| `scripts/` | 89 файлов: точка входа `ds.js`, рантаймы `ds-*.js`, 35 сценариев страниц `*.page.js`, линтер и проверки (`ds-lint.js`, `ds-lint.md`, `ds-lint-cli.mjs`, `ds-check.mjs`, `spec-audit.mjs`, `ds-home.mjs`, `ds-icon.mjs`, `kit-link.mjs`), данные (`icons-data.js`, `ibp-home.js`) |
| `pages/` | 64 страницы: `foundations` 8, `atoms` 14, `molecules` 21, `organisms` 16, `patterns` 3, `rnd` 1; плюс `atoms/.image-slots.state.json` |
| `specs/` | 59 спек компонентов и 4 общих файла: `_index.md`, `_cheatsheet.md`, `_runtime-hooks.md`, `_TEMPLATE.md` |
| `fonts/` | 6 шрифтов SB Sans |

- Экраны приложений подключают ДС только загрузчиком: `apps/ds-config.js`
  пишет `ds.css` и фавикон, `apps/ds-body.js` — `scripts/ds.js` и скрипты из
  атрибута `data-ds`. Разметку экранов переезд почти не задевает.
- В YAML каждой спеки уже записаны пути компонента: `page`, `page_js`,
  `runtime`, `css` (от корня ДС). Это готовый паспорт файлов компонента.
- Страницы документации подключают CSS и рантаймы поштучно (правило
  `MAINTAINING.md`, «file://»): 1008 ссылок на `styles/`, 532 на `scripts/`.

## 2. Как устроено в ibp-ui-kit

| ibp-ui-kit | Что там | У нас станет |
|---|---|---|
| `src/components/{atoms,molecules,organisms}/<Имя>/` | `<Имя>.tsx`, `.styles.ts`, `.types.ts`, `.stories.tsx`, `.utils.ts`, `index.ts` | `components/{atoms,molecules,organisms}/<Имя>/` |
| `src/components/molecules/Inputs/…` | группа полей с общей базой (`InternalComponents`, `InputRanges`) | `components/molecules/Inputs/` |
| `src/styles/` + `src/documentation/` | токены и тема + страницы Colors, Typography | `foundations/<Имя>/` |
| `src/assets/fonts`, `src/assets/images` | шрифты, картинки | `assets/fonts/`, `assets/illustrations/` |
| `src/utils/` | общие хелперы | `utils/` — общие рантаймы без своего компонента |
| `.storybook/` | оболочка витрины | `docs-kit/` — оболочка страниц документации |
| `tools/`, `scripts/` | оснастка | `tools/` |
| `src/index.ts`, `components/index.ts` | точки сборки | `ds.css` и `ds.js` в корне ДС |

## 3. Целевая структура

```
design-system/
  AGENTS.md · readme.md · MAINTAINING.md · CHANGELOG.md
  index.html · ds.css · ds.js          ← ds.js переезжает из scripts/ в корень, к ds.css
  components/
    atoms/<Имя>/                       Avatar, Badge, Buttons, Checkbox, Chip, Divider, IconButton,
                                       LabelHelper, Link, ProgressBar, Radiobutton, Skeleton, Spinner, Switch
    molecules/<Имя>/                   Alert, Breadcrumbs, ButtonGroup, ContextMenu, DatePicker, DropdownList,
                                       EmptyState, NavTile, Pagination, ReadOnlyField, SegmentControl,
                                       Splitter, SubTab, Tab, Toast, Tooltip
    molecules/Inputs/                  ← группа: Inputs.css · InputRanges.css · Inputs.js · InputKit.js
      InputText/ InputAutocomplete/ InputDate/ InputAmountRange/ InputDateRange/
    organisms/<Имя>/                   AllocationBar, Chart, Drawer, Entity, Kanban, Modal, NavPanel,
                                       PageHeader, Popover, ProductRow, RiskMetric, SnackBar, Table,
                                       TableCell, TableFilter, Tile
  foundations/<Имя>/                   Colors (Colors.css, Palette.css), Typography, Spacing, Radius,
                                       Elevation, Layout, Icons (Icons.js, icons-data.js), Illustrations
  patterns/<Имя>/                      HomeRoles, LocalComponents, Redpolicy
  rnd/Backlog/
  utils/                               общие рантаймы без своего компонента
  docs-kit/                            оболочка страниц документации
  tools/                               линтер, гейт, аудит, ds-icon, kit-link, ds-paths.mjs
  specs/                               только общее: _index.md · _cheatsheet.md · _runtime-hooks.md · _TEMPLATE.md
  templates/ · fixtures/ · uploads/
  assets/                              logo.svg · illustrations/ · fonts/   ← fonts/ переезжает сюда
```

Не переезжают: `ds.css`, `index.html` ДС, `assets/logo.svg`,
`assets/illustrations/`. Поэтому `apps/ds-config.js` и реестр хаба не меняются.

Папка компонента на примере Tooltip:

```
components/molecules/Tooltip/
  Tooltip.css       ← styles/tooltip.css
  Tooltip.js        ← scripts/ds-tooltip.js
  Tooltip.page.js   ← scripts/tooltip.page.js
  Tooltip.html      ← pages/molecules/Tooltip.html
  Tooltip.md        ← specs/Tooltip.md
```

## 4. Правила раскладки

1. **Имя папки** — имя компонента из манифеста `specs/_index.md`; оно же имя
   страницы и спеки (`Buttons`, `Radiobutton`, `RiskMetric`).
2. **Имена в папке — PascalCase:**

   | Файл | Что это | Аналог в ui-kit |
   |---|---|---|
   | `<Имя>.css` | стили | `.styles.ts` |
   | `<Имя>.js` | рантайм, если есть | `.tsx` |
   | `<Имя>.page.js` | сценарий страницы документации | `.stories.tsx` |
   | `<Имя>.html` | страница документации | сторис в витрине |
   | `<Имя>.md` | спека | `.types.ts` + документация |
   | `<Имя><Часть>.js/.css` | часть компонента | подпапки `plugins/`, `components/` |

3. **Группа** — только когда у нескольких компонентов общий файл, и одна
   ступень, не глубже. Сейчас она одна: `molecules/Inputs/`. Своей страницы и
   спеки у группы нет.
4. **`utils/`, `docs-kit/`, `tools/`** — имена файлов прежние: паритету с
   ui-kit переименование там ничего не даёт, а ссылки в уроках и документах
   ломает. `icons-data.js` тоже сохраняет имя — на него ссылаются запреты чтения.
5. **Не меняются:** классы CSS, глобальные имена рантаймов (`window.DSTooltip`),
   хуки разметки, версии компонентов, формат YAML спек и колонки `_index.md`.
   Меняются только места и имена файлов; пути в спеках и манифесте остаются
   от корня ДС.
6. **`__DS_ROOT`** страницы — путь до корня ДС по её глубине: `../../` у основ
   и паттернов, `../../../` у компонентов, `../../../../` внутри `Inputs/`.
7. **Аналога `index.ts` нет:** точки сборки — `ds.css` и `ds.js`.

## 5. Карта неочевидных переносов

Остальное — по правилу раздела 4: `styles/<имя>.css` → `<Имя>/<Имя>.css`,
`scripts/ds-<имя>.js` → `<Имя>/<Имя>.js`, `scripts/<имя>.page.js` →
`<Имя>/<Имя>.page.js`, страница и спека — в ту же папку. Полную карту строит
скрипт на Э0, человек её утверждает.

| Было | Станет | Почему так |
|---|---|---|
| `styles/button.css`, `radio.css`, `riskmetric.css`, `datepicker.css` | `atoms/Buttons/Buttons.css`, `atoms/Radiobutton/Radiobutton.css`, `organisms/RiskMetric/RiskMetric.css`, `molecules/DatePicker/DatePicker.css` | имя файла ≠ имя компонента |
| `styles/colors.css`, `palette.css` | `foundations/Colors/Colors.css`, `Palette.css` | два файла одной основы |
| `styles/shadow.css` | `foundations/Elevation/Elevation.css` | основа называется Elevation |
| `styles/illustration.css`, `scripts/ds-illustrations.js` | `foundations/Illustrations/Illustrations.css`, `Illustrations.js` | |
| `styles/layout.css`, `scripts/ds-scroll.js`, `layout.page.js` | `foundations/Layout/Layout.css`, `Layout.js`, `Layout.page.js` | `ds-scroll.js` — рантайм Layout (Layout 1.013) |
| `scripts/ds-icons.js`, `icons-data.js` | `foundations/Icons/Icons.js`, `icons-data.js` | имя данных прежнее |
| `styles/input.css`, `input-range.css`, `scripts/ds-input.js`, `input-kit.js` | `molecules/Inputs/Inputs.css`, `InputRanges.css`, `Inputs.js`, `InputKit.js` | общая база пяти полей |
| `pages/molecules/InputText.html`, `input-text.page.js`, `specs/InputText.md` (и ещё четыре поля) | `molecules/Inputs/InputText/InputText.html`, `.page.js`, `.md` | компоненты группы |
| `scripts/ds-table.js`, `tbl-resize.js`, `tbl-reorder.js`, `tbl-pin.js`, `ds-table-settings.js`, `styles/table-settings.css` | `organisms/Table/Table.js`, `TableResize.js`, `TableReorder.js`, `TablePin.js`, `TableSettings.js`, `TableSettings.css` | части Table |
| `scripts/ds-menu.js`, `ds-tabs.js`, `ds-buttongroup.js` | `molecules/ContextMenu/ContextMenu.js`, `molecules/Tab/Tab.js`, `molecules/ButtonGroup/ButtonGroup.js` | имя рантайма ≠ имя компонента |
| `scripts/ds-float.js`, `ds-copy.js`, `ds-actions-overflow.js`, `ds-include.js`, `ds-notify.js` | `utils/` (имена прежние) | общие: плавающий слой, буфер обмена, «Ещё действия», `<ds-include>`; `ds-notify.js` обслуживает и Toast, и SnackBar |
| `scripts/ds-nav.js`, `ds-toc.js`, `docs-split.js`, `pg-kit.js`, `image-slot.js`; `styles/ds-docs.css`, `ds-nav.css`, `ds-toc.css`, `docs-split.css`, `pg-kit.css`, `input-pages.css` | `docs-kit/` (имена прежние) | оболочка документации; `input-pages.css` подключают 8 страниц, не только поля |
| `scripts/ds-lint.js`, `ds-lint.md`, `ds-lint-cli.mjs`, `ds-check.mjs`, `spec-audit.mjs`, `ds-home.mjs`, `ds-icon.mjs`, `kit-link.mjs` | `tools/` (имена прежние) | `kit-link.mjs` считает корень ДС уровнем выше себя — в `tools/` это по-прежнему так |
| `scripts/ds.js` | `ds.js` в корне ДС | пара к `ds.css` |
| `scripts/ibp-home.js` | `patterns/HomeRoles/ibp-home.js` | открытый вопрос 1 |
| `pages/rnd/Backlog.html` | `rnd/Backlog/Backlog.html` | |
| `fonts/*.otf` | `assets/fonts/` | как `src/assets/fonts` |
| `specs/Icons.md` | `foundations/Icons/Icons.md` | самый цитируемый извне путь (скиллы, роли, `layout-check`, `registry-check`, `hub-build`); остальные спеки основ (Colors, Elevation, Illustrations, Layout, Radius, Spacing, Typography) — в свою папку по правилу раздела 4 |
| `pages/atoms/.image-slots.state.json` | копия в `atoms/Avatar/` и `atoms/Chip/` | `image-slot.js` читает файл `fetch`-ем рядом со страницей; Avatar и Chip разъезжаются по разным папкам |

## 6. Кто завязан на пути

Действие: **переписать** (скриптом по карте), **пересобрать** (генератором),
**история** (не трогать).

| Группа | Что | Действие |
|---|---|---|
| Внутри ДС | `ds.css` (@import), `ds.js` (список FILES — пути от корня ДС) | переписать |
| | Страницы: `<link>`/`<script>` (1008 на `styles/`, 532 на `scripts/`), 40 на `assets/`, 19 на `index.html`, ≈120 ссылок между страницами, 1 на `apps/`; `__DS_ROOT`; `url()` в `<style>` страницы Layout | переписать |
| | Ссылки между страницами в `label-helper.page.js`, `layout.page.js` | переписать |
| | `index.html` (карточки), `ds-nav.js` (полный список страниц) | переписать |
| | Самоподключение своего CSS (`'styles/' + f`) в `ds-nav.js`, `ds-toc.js`, `pg-kit.js`, `docs-split.js` | переписать |
| | `url()` шрифтов в `Typography.css` | переписать |
| | YAML спек (`page`, `page_js`, `runtime`, `css`), `_index.md`, `_cheatsheet.md`, `_runtime-hooks.md`, `_TEMPLATE.md` | переписать |
| | `fixtures/*.html`, `templates/screen/Screen.html` (`scripts/ds.js` → `ds.js`), `templates/local-component/` | переписать |
| Инструменты ДС | `ds-lint.js`: `CONTRACT_DIRS`, `REGISTRY_DIRS`, A8 (`^pages/`), D7 (`pages/rnd`); реестры по именам файлов — `JS_CSS_PAIRS` (A1), `DS_JS_BUNDLES` (A7), `CSS_NOT_IN_BUNDLE`, `SCROLL_GEOMETRY_OK`, `HIDDEN_PAIR_OK` (B11), `RAIL_PAD_OK` (B15), пара `icons-data.js`/`ds-icons.js`; `readFile('scripts/' + page.js)`; источник классов P1–P4; критерий полноты — в коде не осталось выборок по `styles/`, `scripts/`, `pages/`, `specs/`: под нож идут также B10 и P-проходы (`^scripts/.+\.js$`), D2/D5/D6/D8, `isScreen`, разрешение ссылок страниц, `homeMeta` | переписать |
| | `ds-lint-cli.mjs` (хелперы `readFile`/`ls`), `ds-check.mjs` (`pagesOf('pages')`), `spec-audit.mjs`, `ds-home.mjs` (счётчик компонентов), `ds-icon.mjs` (`icons-data.js`, `ds-icons.js`, порядок в FILES); их внутренние `scripts/…`-строки: `ds-check` — три пути к инструментам, `ds-home`/`ds-lint-cli` — `scripts/ds-lint.js`, `ds-icon` — `scripts/ds-icons.js` | переписать |
| Загрузчик | `boot-build.mjs` (`scripts/ds.js` → `ds.js`, пример `data-ds`, его селфтест) | переписать |
| | `apps/ds-body.js` | пересобрать |
| | `data-ds="scripts/ibp-home.js"`: корневой `index.html`, `apps/local-components/index.html`, `Portfolio.html`, `MainPage.html`, `Deal.html` deals-app | переписать |
| Оснастка `.agents/tools/` | `lessons-cli.mjs`: маршрутизация гейта «изменился файл → какие проверки» (≈стр. 1440–1500), корпус фикстур ДС, `pageForScript`, пути к `ds-lint`, `spec-audit`, `ds-icon`, `ds-lint-cli` | переписать |
| | `layout-check.mjs`: `TOKEN_FILES`, классы ДС из `styles/`, хуки из `scripts/`, Б1 (`styles/`, `scripts/ds-`, `scripts/ds.js`), исключение `DS/scripts`, `specs/Icons.md` | переписать |
| | `kit-build.mjs` (`dsPages`, CSS и `docs-split.js` витрины), `proto-panel.mjs` (`dsCorpus` под `try…catch` — молчит, ловится мутацией), `readme-stats.mjs` (глоб `pages/{atoms,…}`, стенд), `registry-check.mjs` (Icons.md, стенд селфтеста), `hub-build.mjs` (комментарий про Icons.md), `fragments.mjs` (комментарий про `ds-lint-cli`), фикстуры `fixtures/lint-screens/` | переписать |
| | `anchors.json`, `coverage.json` | пересобрать (`anchors --write`), `coverage.json` — переписать |
| Скиллы с оснасткой | `docs-split/tooling/docs-split.mjs` (`styles/`, `pages/`, карта CSS из `_index.md`), `references/pages-index.md` | переписать; карту — `docs-split map` |
| | `session-plan/tooling/ctx-budget.mjs`, `stages.json` | переписать |
| Правила и роли | `.agents/rules/process.md`: §4 (список папок ДС), §8 («копия ломает `../../styles`»), §9 (токены из `styles/*.css`), §11, §12 (`inject --css`) | переписать |
| | Роли `ai-designer`, `screen-builder`, `screen-reviewer`; скиллы `ds-lookup`, `docs-split`, `screen-assembly` (+ `patterns.md`), `screen-review`, `composition-review`, `screen-spec` (оба шаблона), `lessons` (SKILL.md — живые пути; `references/lessons.md` — история, строка «История» ниже), `knowledge-lookup`, `concept-design`; `.agents/README.md` | переписать |
| Документы ДС | `AGENTS.md`: §2 (карта), §3 (команды чтения), §4 (Icons.md, страница-правило `patterns/LocalComponents/…`), §5 (подключение, «поштучно не подключать»), §6 (путь `spec-audit`), §7 (команды проверки) | переписать |
| | `MAINTAINING.md`: «Жёсткие запреты», «Версионирование» (счётчик), «Контракт CSS компонента», «file://», «Страницы документации», «Таблицы в документации», «Порядок компонентов», «Экономия токенов» п. 1, 4, 6, «Сборка экранов» п. 2, 10, «Новый компонент» (завести папку), «Правка существующего», «Проверка: чем гонять», «Целостность страниц», «Структура проекта». **Номера пунктов «Сборки экранов» и «Экономии токенов» не менять — на них ссылаются уроки** | переписать |
| | `readme.md`, `tools/ds-lint.md` | переписать |
| Приложения и проект | Паспорта виджетов и спеки экранов (`design-system/specs/<Имя>.md` → путь в папке), `apps/README.md`, `apps/local-components/README.md`, `apps/postrade/deals-app/widgets/README.md` (вне `module-readme`; там строка-закрепление урока про страницу-правило), рукописные строки README модулей вне блока `@tree` (`data-ds`, `design-system/scripts/ds.js`), README концептов, корневые `README.md`, `index.screen.md`, `GIGACODE.md`; локальные памятки агентов в корне, исключённые из git | переписать |
| | Страницы витрины локальных компонентов, `docs/index.md`, `hub.js`, README модулей | пересобрать (`kit-build`, `docs-index`, `hub-build`, `module-readme`) |
| | Комментарии экранов со ссылкой на `specs/_cheatsheet.md`, `specs/_runtime-hooks.md` | не меняются — файлы остаются в `specs/` |
| | Комментарии экранов со ссылкой на переезжающие спеки (`specs/Kanban.md` в `pipeline-manager-kanban`) | переписать |
| История | `CHANGELOG.md` ДС (кроме новой записи), `lessons-raw.md`, закрытые задачи `docs/tasks/`, `docs/misc/`; выжимки уроков `skills/*/references/lessons.md` — пути в прозе и «дата/зона» не переписываются (технические якоря обновляет `lessons-cli anchors --write`) | не трогать |

## 7. Где сломается молча

| Место | Что будет, если пропустить | Чем ловим |
|---|---|---|
| **Маршрутизация гейта** (`lessons-cli`: префиксы `pages/`, `styles/`, `specs/`, `scripts/*.page.js`, файлы иконок; после переезда — те же виды в `components/`, `foundations/`, `docs-kit/`, `utils/`, `tools/`, `rnd/`, `patterns/`) | правка CSS, страницы или спеки компонента не запускает ни линтер, ни parity, ни spec-audit — гейт зелёный, ничего не проверив | `gate --changed <файл>` по образцу каждого вида файла до и после переезда: набор шагов совпадает |
| **Правила линтера, включаемые по папке страницы** (`CONTRACT_DIRS`, `REGISTRY_DIRS`, A8, D7) | контракт разделов, реестры D1–D9 и `__DS_ROOT` молча не применяются. Фикстуры этого не докажут: они лежат в `fixtures/`, вне папок страниц. Сравнение отчётов тоже: «чисто» и «не проверялось» выглядят одинаково | мутации на Э2 |
| **Реестры линтера по именам файлов** (A1, A7, B11, B15, `SCROLL_GEOMETRY_OK`, пара иконок) | пара или исключение не находятся: пропуск дефекта или ложные находки | `lessons-cli verify` и сравнение отчётов линтера |
| **Сенсор** (`TOKEN_FILES` под `existsSync`, классы и хуки ДС из `styles/` и `scripts/`, Б1) | геометрия считается по умолчаниям, Б4 объявляет выдуманным всё или ничего, Б1 перестаёт видеть поштучные файлы ДС | полный отчёт сенсора по каждому экрану до/после, а не вердикт |
| **Генераторы и сторожа с `try…catch`** (`kit-build` → `dsPages`, `proto-panel` → `dsCorpus`, `readme-stats`, `registry-check`) | из витрины пропадают ссылки на страницы ДС, классы состояний «не найдены», счётчики README = 0 | `--check` генераторов и diff генератов: допустима только замена путей |
| **Браузер** (`ds.js` FILES, `ds-nav.js`, самоподключение CSS, `url()` шрифтов, `__DS_ROOT`, `.image-slots.state.json`) | 404: страница без стилей, шрифтов или иконок, мёртвая навигация | разовый скрипт проверки ссылок и ручной просмотр |

## 8. Этапы

Каждый этап — отдельная сессия: смета `ctx-budget.mjs` до старта, в конце —
`/handoff`. Массовые правки — только скриптом на Node по карте, страницы не
читаются. Регулярки в сторожах пишутся редактором, не через шелл
(`process.md` §8). **Новых сторожей не заводим:** модуль путей — справочник,
разовые скрипты лежат в `docs/misc/RE0002-ds-folders/` и удаляются в конце.

### Э0 · Снимок и карта (файлы ДС не меняются)

1. **Карта.** Скрипт строит `move-map.json`: каждый файл ДС — «было → стало» по
   разделам 4–5; файлы без владельца — отдельным списком человеку.
   **Человек утверждает карту.**
2. **Отчёт ссылок вне ДС** — каждый файл с действием из раздела 6.
3. **Эталонные выводы** — в `baseline/`, полный текст:
   - `ds-check.mjs --all`, `ds-lint-cli.mjs` (глобальные правила и `--parity`),
     `spec-audit.mjs`, `ds-icon.mjs --selftest`, `ds-home.mjs --check`;
   - `layout-check.mjs` по каждому экрану;
   - `lessons-cli verify`, `anchors`, `check`, `coverage`;
   - `--check` всех генераторов (`boot-build`, `hub-build`, `kit-build`,
     `docs-index`, `module-readme`, `readme-stats`);
   - `lessons-cli gate --changed <файл>` по образцу каждого вида: CSS
     компонента, рантайм, `*.page.js`, страница, спека, CSS основ (токены),
     страница основ, `docs-kit` (`styles/docs-split.css`,
     `scripts/docs-split.js`), `utils`-рантайм (`scripts/ds-float.js`),
     `ds.js`, `icons-data.js`, `ds-lint.js`, фикстура, `index.html` ДС,
     `AGENTS.md` ДС, `specs/Icons.md`, `templates/screen/Screen.html`,
     `scripts/ibp-home.js`.
4. **Проверка ссылок** — разовый скрипт: все локальные `href`, `src`, `url()` в
   `.html` и `.css` ДС, приложений, витрины и хаба; `ds.js` FILES; `ds-nav.js`;
   самоподключение CSS в `docs-kit`; цели `data-ds` — ведут в существующий файл.
   Снимок «до».

### Э1 · Модуль путей на старой раскладке

`design-system/tools/ds-paths.mjs` — единственное место, которое знает
раскладку ДС:

- списки CSS, рантаймов, страниц, спек, фикстур;
- `kindOf(путь)` → вид файла (css, рантайм, сценарий страницы, страница, спека,
  фикстура) и категория страницы;
- `specOf`, `cssOf`, `pageOf`, `runtimeOf(имя)` — из YAML спек;
- CLI `node tools/ds-paths.mjs <Имя>` — файлы компонента. Это ответ агенту,
  которому для пути теперь нужна категория.

Инструменты ДС и оснастка из раздела 6 берут из модуля пути, обход и
маршрутизацию гейта (оснастка — от `P.dsAbs`). Пропавшая раскладка — громкая
ошибка, а не пустой список. Реестры по именам файлов на этом этапе не трогаются.

**Проверка:** все эталонные выводы Э0 совпадают побайтно. Так доказано, что
инструменты отвязаны от путей, ещё до того, как файлы сдвинулись.

### Э2 · Перенос

- **Коммит А** — только `git mv` по карте. История файлов не теряется, слияние
  с другими копиями видит переименования.
- **Коммит Б** — ссылки скриптом по той же карте; `ds-paths.mjs` на новую
  раскладку; реестры линтера и Б1 сенсора на новые имена; `boot-build` и
  пересборка `ds-body.js`; `data-ds`. **Генераторы, читающие раскладку, — в
  том же коммите:** `kit-build`, `readme-stats`, `proto-panel` (код и
  пересборка: иначе их `--check` падает или молчит ещё до Э3), `docs-index` —
  только пересборка (раскладку не знает). **Скрипт ссылок генераты не
  трогает** — `docs/index.md`, `*.doc.html`, `kit-data.js`, счётчики README
  пересобираются генераторами.

**Проверка:**

1. Эталонные выводы Э0 совпадают после замены путей по карте.
2. Скрипт ссылок: битых не больше, чем «до».
3. `gate --changed` по новым путям — те же шаги, что по старым.
4. Мутации — порча файла, прогон, откат `git checkout`. Каждое правило обязано
   сработать:

   | Мутация | Где | Что должно сработать |
   |---|---|---|
   | убрать раздел контракта (`<h2>Анатомия</h2>`) | страница атома, молекулы из `Inputs/`, организма | правило контракта разделов |
   | убрать пункт страницы из `ds-nav.js` | любая страница компонента | D2 |
   | убрать `window.__DS_ROOT` | страница с `ds-nav.js` | A8 |
   | разойтись версией со спекой | `rnd/Backlog/Backlog.html` | D7 |
   | убрать строку компонента из `specs/_index.md` | любой компонент | D5 |
   | убрать блок `## <Имя>` из чит-шита | любой компонент из контрактных папок | D6 |
   | добавить `.style.<prop> = …` в рантайм | любой `<Имя>.js` | B10 (выборка всех скриптов) |
   | класс из сниппета спеки без правила в CSS | спека любого компонента | P1 |
   | подключить CSS компонента поштучно на экране | экран приложения | Б1 сенсора |

   Полный список классов без фикстурного входа печатает `lessons-cli verify`
   (вход РЕПОЗИТОРИЙ) — таблица дополняется по нему.

5. `git log --follow` нового файла показывает историю до переезда.
6. Человек открывает через `ds-static` (порт 8765): главную ДС; по странице
   каждой категории и одну из `Inputs/` (шрифты, иконки, навигация, вкладка
   «Код»); Icons; Illustrations; хаб; `Deal.preview.html`; страницу витрины
   локальных компонентов. В консоли — ни одного 404.

### Э3 · Документы и харнес

- Всё из раздела 6: «Правила и роли», «Документы ДС», «Приложения и проект».
- Генераторы: `hub-build` (комментарий про Icons.md), `docs-split map`,
  `module-readme`, `lessons-cli anchors --write`; `kit-build`, `docs-index`,
  `readme-stats` уже пересобраны в коммите Б — здесь только их `--check`.
- Запись в `CHANGELOG.md` ДС (открытый вопрос 2).
- Удалить `docs/misc/RE0002-ds-folders/`.

**Проверка:** `lessons-cli gate --full` — `ВЕРДИКТ: OK`, новых FAIL против базы
нет; `vendor-scan.mjs`; поиск старых путей вне истории пуст:
`design-system/(styles|scripts|pages)/` и `specs/<Имя>.md`.

### Э4 · Закрытие

Урок — если на этапах что-то ломалось (скилл `lessons`). Приёмка экранов не
нужна, если отчёты сенсора по экранам совпали с базой.

## Tasks

- [x] Задача описана (этот документ)
- [x] Предусловия: правки 01.10.2026 закоммичены, RE0001 закрыта, ветка —
  ветка `feat/ds-component-folders`; RE0001 закрыта (пользователь, 01.10.2026)
- [x] Э0: карта утверждена человеком, отчёт ссылок, эталонные выводы, проверка ссылок «до» —
  `docs/misc/RE0002-ds-folders/`, карта утверждена 01.10.2026
- [x] Э1: `tools/ds-paths.mjs`, инструменты на нём, выводы совпали побайтно —
  177 из 177 (01.10.2026); состав выборок — `docs/misc/RE0002-ds-folders/selections.mjs`, сужений нет
- [ ] Э2: коммит А (`git mv`), коммит Б (ссылки, реестры, загрузчик, генераторы раскладки: `kit-build`, `readme-stats`, `proto-panel`, `docs-index`)
- [ ] Э2: эталоны, ссылки, `gate --changed`, мутации, `git log --follow`, просмотр человеком
- [ ] Э3: документы, роли, скиллы, генераторы, журнал ДС
- [ ] Э3: `gate --full` — `ВЕРДИКТ: OK`, поиск старых путей пуст
- [ ] Э4: урок, если был повод

## Acceptance Criteria

- Каждый компонент, основа и паттерн — папка со всеми своими файлами. В ДС нет
  `styles/`, `scripts/`, `pages/`, `fonts/`; в `specs/` — только 4 общих файла.
- Эталонные выводы Э0 совпадают с поправкой на пути; мутации ловятся;
  `gate --changed` маршрутизирует так же, как до переезда; битых ссылок не
  прибавилось.
- Разметка экранов приложений не менялась, кроме `data-ds`.
- Агент находит файлы компонента одной командой (`ds-paths.mjs <Имя>` или
  манифест); новый компонент по `MAINTAINING.md` заводится одной папкой.
- В коде инструментов (`design-system/tools`, `.agents/tools`, тулчейны
  скиллов) не осталось литералов раскладки `styles/`, `scripts/`, `pages/`,
  `specs/`.

## Риски

| Риск | Что делаем |
|---|---|
| Проверки молча перестают проверять | раздел 7; Э1 отвязывает инструменты до переноса; сравнение полных выводов, мутации, `gate --changed` |
| Теряется история файлов | отдельный коммит только с `git mv` |
| Параллельные правки ДС: RE0001, копия в контуре банка | зависимость от RE001; заморозка на время Э2 |
| Заход не влезает в окно | этапы по сессиям, смета до старта, правки скриптами |
| `@import` в `ds.css` по `file://` | пути считаются от `ds.css`, как сейчас; проверить вручную на Э2 |
| Генераты правятся руками | только генераторами, проверка `--check`; генераторы раскладки (`kit-build`, `readme-stats`, `proto-panel`) обновляются и пересобираются в коммите Б, скрипт ссылок их не трогает |
| Регулярка, испорченная шеллом | сторожа правятся редактором (`process.md` §8) |
| Висят якоря уроков | `anchors --write`, `lessons-cli check` |
| Глубокие пути внутри `Inputs/` | `__DS_ROOT` по глубине; мутация A8 на странице из группы |

## Открытые вопросы

1. `ibp-home.js` — каталог разделов продукта, а не файл компонента; его
   подключают хаб и экраны через `data-ds`. Место — `patterns/HomeRoles/ibp-home.js`
   или другое? Решить до коммита Б: от ответа зависят `data-ds` в 5 рукописных
   файлах, пересборка витрины и пути на страницах `NavPanel.html`/`NavTile.html`.
   **Ответ человека 01.10.2026:** `patterns/HomeRoles/ibp-home.js`.
2. Версия ДС в журнале: пометить день переезда `· ДС 2.000` (внутренние пути
   ДС — несовместимое изменение для прямых ссылок) или обычный шаг?
3. `fixtures/` — общий корпус линтера (по умолчанию) или по папкам
   компонентов, как тесты в ui-kit?
4. Категории не меняем, хотя в ui-kit местами иначе (ButtonGroup у них в
   `atoms/buttons`, Toast — в `atoms`). Подтвердить.
5. Колонка «Зависимости» в `_index.md` и поле `deps` спек содержат имена CSS
   (`button`, `link`). Перевести на имена компонентов (`Buttons`, `Link`) — после
   проверки, кто их читает, — или оставить?
6. `pages/atoms/.image-slots.state.json` (найдено на Э0): ключ в файле один —
   `pg-av-img`, картинка Avatar; Chip подключает `image-slot.js`, но своего
   ключа не имеет. Файл переезжает в `Avatar/`; что в `Chip/`?
   **Ответ человека 01.10.2026:** в `Chip/` — файл с содержимым `{}` (без файла
   страница Chip даёт 404, чужая картинка в папке не нужна). Раздел 5 в части
   «копия в Avatar и Chip» читать с этой поправкой.
7. Папки `apps/pretrade/drafts/pipeline-manager-kanban/` нет (найдено на Э0):
   канбан теперь в `pipelineManager-v01` и `pipelineManager-v02`, ссылка на
   `specs/Kanban.md` — в их `PipelineManagement.html` (уже в отчёте ссылок
   `refs-report.md`). Раздел 6 и локальная памятка агента называют старое имя —
   поправить при Э3?
8. Дыры маршрутизации гейта, найденные эталоном Э0 (существуют и до переезда):
   `gate --changed` на `scripts/ds-check.mjs` и `scripts/kit-link.mjs` гоняет
   только `vendor-scan`, на шрифт `fonts/*.otf` — ничего. Переезд обязан
   сохранить маршруты как есть; чинить ли дыры — отдельным решением, вне RE0002?
9. Правило линтера P2 и признак экрана `isScreen` (найдено на Э1): оба смотрят в
   `pages/screens/`, а такого каталога нет — P2 не срабатывает никогда, его вход
   пуст. Это единственный литерал раскладки, оставленный в коде на Э1: удаление —
   это снятие правила (и его якоря в журнале уроков), а не чистка кода. Удалить P2,
   перенацелить на экраны приложений или оставить — решить до Э3 (критерий «в коде
   инструментов нет литералов раскладки»).

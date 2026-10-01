# RE0002 · ДС: компонент в своей папке — handoff

- **Дата:** 01.10.2026
- **Статус:** в работе — Э1 закрыт, следующий Э2 (новая сессия)

## Цель
Каждый компонент, основа и паттерн ДС — папка со всеми своими файлами, по
форме ibp-ui-kit; инструменты и проверки работают как до переезда. Задача —
`docs/tasks/RE0002-ds-component-folders.md`.

## Этапы
- ✓ предусловия: ветка `feat/ds-component-folders`, задача и `docs/index.md` закоммичены
- ✓ Э0: карта (утверждена 01.10.2026), отчёт ссылок, эталоны, ссылки «до»
- ✓ Э1: `design-system/tools/ds-paths.mjs` на старой раскладке, инструменты на нём, эталоны побайтно
- → Э2: перенос (коммит А `git mv`, коммит Б ссылки) — RE0001 закрыта, блокера нет
- — Э3: документы, роли, скиллы, генераторы, журнал ДС
- — Э4: урок, если был повод (повод есть — см. «Для урока»)

## Смета
`ctx-budget.mjs` к задаче не применим: в паспорте этапов (`stages.json`) только
маршруты сборки экрана. Граница сессии — по этапу задачи.

## Принятые решения
- категория в пути, PascalCase в папке, спека в папке компонента — пользователь, 01.10.2026 (таблица в задаче)
- карта `move-map.md` утверждена — пользователь, 01.10.2026
- `ibp-home.js` → `patterns/HomeRoles/` — пользователь, 01.10.2026 (вопрос 1)
- `.image-slots.state.json` → `Avatar/`; в `Chip/` — файл `{}` — пользователь, 01.10.2026 (вопрос 6)
- Э1 — в новой сессии — пользователь, 01.10.2026
- план Э1 утверждён; маршрут гейта: правка `tools/ds-paths.mjs` → `verify-lint`, `anchors`,
  `lint-global`, `parity`, `spec-audit`, `icons-selftest`, `etalons`, `readme-stats` — пользователь, 01.10.2026
- линтер остаётся в корпусах, где был (аудит, хуки сенсора, корпус панели, B9): без него
  аудит дал бы +4 класса и `data-off-grid`; пересмотр — вне RE0002 — план Э1
- `ds-lint.js` в браузере не работает (`ds-lint.md`, «не браузерный скрипт»): раскладку
  получает третьим параметром `dsLayout` от `ds-lint-cli.mjs` и `ds-home.mjs` — план Э1

## Что сделано на Э1
- `design-system/tools/ds-paths.mjs`: `layout(root)` → `at.*`, `kindOf`, списки `styles`,
  `scripts`, `runtimes`, `pageScripts`, `pages`, `specs` (бросают, если каталога нет или
  он пуст), `specOf`, `pageOf`, `cssOf`/`runtimeOf`/`pageJsOf` из YAML; CLI `<Имя>`.
  Раздел «Раскладка» — единственное, что меняется на Э2.
- Оснастка получает модуль через `dsPaths()` в `.agents/tools/project.mjs`.
- На модуле: `ds-lint.js`, `ds-lint-cli`, `ds-home`, `ds-check`, `spec-audit`, `ds-icon`;
  `lessons-cli` (маршруты гейта, пути инструментов, полный режим), `layout-check`,
  `kit-build`, `proto-panel`, `readme-stats`, `registry-check`, `hub-build`, `boot-build`;
  `docs-split.mjs`. Не трогались: `ctx-budget`/`stages.json` (их пути не переезжают),
  `fragments.mjs` (комментарий — Э3).
- Разовый `docs/misc/RE0002-ds-folders/selections.mjs` — состав выборок «старая регулярка
  против модуля».

## Проверки
- `baseline.mjs` до правок = эталон Э0 (0 расхождений); после правок — 177 из 177 побайтно.
- `selections.mjs`: сужений нет; шире только B9 (+ `docs-split.js`, `pg-kit.js`,
  `image-slot.js`, `ibp-home.js`), вывод не изменился; маршруты гейта по 368 файлам ДС — 0 расхождений.
- `docs-split`: `map`, `rollout` двух ⬜-страниц (Illustrations, HomeRoles) и `inject` Tooltip
  до и после — одинаково (страницы откатаны).
- Громкость: `layout('<не ДС>')` — все списки бросают; линтер без `dsLayout` — отказ;
  сенсор на спеке с BOM упал громко (см. «Для урока»).
- Селфтесты `kit-build`, `proto-panel`, `readme-stats`, `registry-check`, `hub-build`, `boot-build` — OK.

## Осталось на Э2 (литералы старой раскладки, оставленные намеренно)
- тексты сообщений и справки: `ds-lint.js` (B1, D2, D5, A8 — «нужно '../../'» → по глубине),
  `spec-audit` (проходы 6–8), `ds-check`/`ds-home`/`ds-icon` (справка), `docs-split` (`inject`, `--css`);
- реестры линтера по именам (`JS_CSS_PAIRS`, `DS_JS_BUNDLES`, `CSS_NOT_IN_BUNDLE`, B11, B15,
  `SCROLL_GEOMETRY_OK`); Б1 сенсора (`layout-check.mjs` ≈стр. 555–564);
- `ds.js` FILES и регулярка FILES в `ds-icon.mjs` (`'([\w.-]+\.js)'` — без `/`);
- `docs-split.mjs`: регулярки страниц уже по имени файла, а раскладка — из модуля;
- стенды селфтестов в старой раскладке: `kit-build` (`ds/pages/atoms/Divider.html`),
  `proto-panel` (`ds/styles`, `ds/scripts`), `readme-stats` (`ds/pages/…`, `ds/scripts/icons-data.js`),
  `registry-check` (`design-system/specs/Icons.md`);
- комментарии — Э3.
- CLI `ds-paths.mjs <Имя>` на старой раскладке показывает только YAML (у Table нет
  `page_js`); на новой — содержимое папки.

## Для урока (Э4)
Модуль путей читал шапку YAML спеки через `split(/^---$/m)`, а `Tile.md` начинается с
BOM — шапка терялась, `cssOf('Tile')` был пуст. Поймано сразу: сенсор берёт токены без
`existsSync` и упал с понятной ошибкой на всех экранах. Тот же разбор — в разовом
`move-map.mjs` (`yamlNotes` по Tile молча пропущен). Починка — снятие BOM в `ds-paths.mjs`.

## Открытые вопросы
- вопросы 2–5, 7, 8 задачи (версия ДС, fixtures, категории, `deps`, старое имя канбан-концепта, дыры маршрутов гейта) — пользователь; 2–5 — до коммита Б
- вопрос 9 задачи: правило P2 и `isScreen` по несуществующему `pages/screens/` — удалить, перенацелить или оставить; до Э3

## Следующий шаг
Э2, коммит А: `git mv` по `move-map.json` (+ копия `{}` в `Chip/`), только переносы.
Затем коммит Б: раздел «Раскладка» `ds-paths.mjs` на новую раскладку, ссылки скриптом
по карте, список «Осталось на Э2», `boot-build` → пересборка `ds-body.js`, `data-ds`,
генераторы раскладки. Перед коммитом Б — ответы на вопросы 2–5.

## Читать первыми
- `docs/tasks/RE0002-ds-component-folders.md` — разделы 4–8
- `docs/misc/RE0002-ds-folders/move-map.md`
- `design-system/tools/ds-paths.mjs` — раздел «Раскладка»

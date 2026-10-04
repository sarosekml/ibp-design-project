# RE0005 — handoff

- **Дата:** 04.10.2026
- **Статус:** все этапы сделаны (Э0–Э7). По решению человека 04.10.2026 продуктовые темы
  пересмотрены: `ibp-light` = копия текущей палитры, `ibp-dark` — от неё, `service` —
  тёмная служебная; окно выбора темы и протопанель в `service`. Задача ждёт визуальной
  проверки человеком (стенд `Themes.html` и пилот `ai-bankster-prototype-v02`) — рендер
  скриптом в контуре не снимается. Коммиты — по просьбе.

## Цель
Темы ДС наложением: `legacy` без правок, новые `ibp-light`, `ibp-dark`, `service` под
`data-theme`, переключатель на всех страницах. Задача — `docs/tasks/RE0005-ds-themes.md`.

## Этапы
- ✓ Э0 · задача
- ✓ Э1 · аудит палитры, решение человека о лишнем
- ✓ Э2 · словарь ролей, карта 119 имён, точечные правила, `Themes.tokens.js` v1
- ✓ Э3.1 · основа `foundations/Themes/`, генератор `theme-build.mjs` (+`--check`/`--selftest`), черновая `ibp-light`
- ✓ Э3.2a · подключение: тег `docs-kit/ds-theme-boot.js` на 65 страницах ДС, `data-theme` в `boot-build`/`ds-config`, правило `ДС20`
- ✓ Э3.2b · рантайм `foundations/Themes/Themes.js` (`DSTheme.get/set/list`, хранение, `?theme=`, `ds:themechange`), сервисное окно (`Themes.panel.css`), `Themes.tokens.js`+`Themes.js` в `ds.js` и теге
- ✓ Э3.2c · постоянные проверки: `theme-build --check` в `ds-check --all` и шагом гейта; линтер `B16` (имена тем вне `foundations/Themes/`) и `B17` (тег темы на не-ds-split страницах и главной); фикстуры, `verify`, `anchors`
- ✓ Э4a · семена новых тонов (accent/neutral/grey), финальная шкала, перенос базовых тонов из `Colors.css`, значения ролей под AA
- ✓ Э4b · стенд `foundations/Themes/Themes.html` (рампы, роли, карта, точечные правила, контраст, `legacy`/`ibp-light` рядом) + редактор семян; 04.10.2026 вариант семян отклонён (см. Э6)
- ~ Э4/Э5 · пересмотрены в Э6: `ibp-light` = копия текущей палитры, `ibp-dark` — её тёмная версия (тот же оттенок)
- ✓ Э6 · `service` (тёмная служебная), окно и протопанель в `service`, стенд на четыре сцены, флаг `palette` и `exempt` в генераторе (04.10.2026)
- ✓ Э7 · `AGENTS.md` §2/§4, `MAINTAINING.md` («Темы: новая тема и точечное правило»), `CHANGELOG.md`, `ds-home`, `docs-index`, приёмка, гейт (04.10.2026)

## Смета
`ctx-budget.mjs` описывает этапы сборки экрана, этапы этой задачи не покрывает. Э1 и Э2 —
около 120 тыс. токенов каждый. Решением человека (02.10.2026) Э3 разделён на 3.2a/3.2b/3.2c —
по заходу на часть; так же Э4 разделён на Э4a (данные) и Э4b (стенд, утверждение).
`audit.md` и `map.md` целиком не читать: `grep -n "^## "`, затем
offset/limit; данные — импортом `palette-audit.mjs` или `vm` по `Themes.tokens.js`.

## Принятые решения
- Ветка `feat/re0005-themes`; коммиты — только по просьбе (пользователь).
- Э1: новые темы переносят все тона палитры; 7 токенов без применения — полноценные роли;
  виджет `DealFinancialMetricsModal` на `--tertiary-bg`; `pipelineScanner-v07` не трогать
  (пользователь). Подробно — §1 задачи.
- Э2 (пользователь, 02.10.2026, всё по рекомендации): нейтральные — две рампы `neutral`
  (сине-серая) и `grey` (чисто серая); рампа акцента `--ramp-accent-*` из изумрудного семени,
  остальные тона по именам legacy; роли дробятся на fg / граница / заливка / фокус, статусы —
  только по уровню; граница парная; `--text-on-dark` → `fg-on-fill` и `fg-inverse`; наведение
  в меню = в списке (`bg-hover`); тост, затемнения, дорожка SubTab — роли по назначению;
  нажатая ссылка тона — `<тон>-fg-pressed`; скелетон AllocationBar — как Skeleton; инлайн-цвета
  страниц ДС — правила по значению `style` и селектору блока, только страницы ДС.
- Э3.1 (пользователь, 02.10.2026): черновые значения ролей — вариант B; `ds-nav.js` на
  страницах ДС не связывается с `Themes.js` — сосуществование; сервисное окно в Э3.2 рабочее,
  вид и тема `service` — Э6; точечные правила гейтятся
  `:where([data-theme]:not([data-theme="legacy"]))`.
- Э3.2 (пользователь, 02.10.2026, всё по рекомендации): `theme-build --check` — в `ds-check --all`
  и гейт; наличие тега темы — проверять в `docs-split.mjs check` (правило `ДС20`); линтер
  запрещает `--color-*`/`--ramp-*` в экранах, виджетах и компонентах до переезда; тег — на
  65 страницах (64 документации + главная ДС); сервисное окно — немодальная плавающая панель
  слева внизу из компонентов ДС.
- Э4 (пользователь, 02.10.2026): тема считает и правит **только новые тона** — `accent`,
  `neutral`, `grey`; базовые тона тема **переносит из `Colors.css` как есть** и не меняет
  (промежуточно рассматривали «все 19 из семян» и «+ статусные», человек вернулся к варианту
  «только accent/neutral/grey»). Э4 разделён на Э4a (данные) и Э4b (стенд); семена на стенде
  правит дизайнер ползунками `h/c` с выгрузкой JSON. Следствие: пары на базовых тонах
  помечены `required: false` (INFO, пометка `legacy` на стенде) — их AA не гарантируется.
- Э5 (пользователь, 02.10.2026): в тёмной теме базовые тона **генерируются** (не переносятся) —
  иначе legacy-рампы дают неверные статусы и подложки; палитру графиков пересчитать под тёмный
  фон; иллюстрации, фон хаба, логотип и глифы с собственным цветом — **решение отложено**
  (открытый вопрос, бэклог Э7).

## Что сделано
- Э2-артефакты: `docs/misc/RE0005-themes/{palette-audit,role-map}.mjs`, `map.md`,
  `audit.md`, v1 `Themes.tokens.js`.
- `docs/misc/RE0005-themes/theme-values.mjs` — разовый сборщик v2.
- `design-system/foundations/Themes/Themes.tokens.js` — v2: 158 ролей, `values` (146
  выражений) + `themeValues` (12 графиков), семена, карта 119, 332 правила, правила страниц, `keep`.
- `design-system/foundations/Themes/Ramp.tokens.js` — алгоритм рамп (OKLCH → hex, WCAG), один файл для Node и браузера.
- `design-system/tools/theme-build.mjs` — генератор `Themes.css` и `Themes.pages.css` (`--check`, `--selftest`).
- `design-system/tools/ds-paths.mjs`, `ds-lint.js`, `ds.css` — вид «данные», `Themes.pages.css` вне бандла, импорт последним.
- Основа зарегистрирована: `Themes.html`, `Themes.md`, `specs/_index.md`, `specs/_cheatsheet.md`, `AGENTS.md` §6, `index.html`, `docs-kit/ds-nav.js`, `CHANGELOG.md`, `ds-home`, `readme-stats`, `docs-index`.
- **Э3.2a:** `design-system/docs-kit/ds-theme-boot.js` — тег `<head>`: `data-theme` из
  `?theme=`/`localStorage(ds.theme)` до отрисовки, `document.write` `Themes.css` + `Themes.pages.css`.
- `.agents/tools/boot-build.mjs` — первый тег ставит `data-theme` и на экранах; в `--selftest`
  кейс (исполнение в vm). `apps/ds-config.js` пересобран (`--check` OK).
- `docs/misc/RE0005-themes/inject-theme-tag.mjs` — разовый идемпотентный тег на 65 страниц
  (64 документации + `index.html`), по одной строке.
- `.agents/skills/docs-split/tooling/docs-split.mjs` — правило `ДС20`;
  `.agents/skills/docs-split/references/skeleton.md` и `design-system/MAINTAINING.md` — тег и позиция (последним в `<head>`).
- **Э3.2b:** `design-system/foundations/Themes/Themes.js` — рантайм: `window.DSTheme = { get(), set(id), list() }`,
  хранение (`localStorage`, `ds.theme`), применение `?theme=`, событие `ds:themechange`, чужое имя → `legacy`;
  сервисное окно (кнопка `IconButton` слева внизу, `Alt+Shift+T`, список тем, ссылка на «Темы», «Скрыть кнопку», метка ≠ legacy).
- `design-system/foundations/Themes/Themes.panel.css` — хром окна (вне бандла); `Themes.tokens.js` + `Themes.js`
  добавлены в `FILES` `ds.js` и в `document.write` тега `ds-theme-boot.js`; `Themes.md` и `_cheatsheet.md` дополнены.
- Разовые проверки: `docs/misc/RE0005-themes/boot-selftest.mjs`, `themes-selftest.mjs` (vm, браузер запрещён).
- **Э3.2c:** `design-system/tools/ds-check.mjs` — шаг `theme-build --check`;
  `.agents/tools/lessons-cli.mjs` — шаг гейта `theme-build` (добавляется на правку
  `foundations/Themes/`); `design-system/tools/ds-lint.js` — `B16` (имена тем
  `--color-*`/`--ramp-*` вне `foundations/Themes/`: глобально CSS/JS ДС и в экранах,
  включая их локальный CSS) и `B17` (служебный тег темы на страницах ДС, не проходящих
  `docs-split check`: страницы старого образца и главная); фикстуры
  `design-system/fixtures/B16.bad.html`, `B17.bad.html` + экранная
  `.agents/tools/fixtures/lint-screens/B16.bad.*` (доказывает чтение локального CSS
  экрана); `anchors --write` (линтер 66); ссылки — `AGENTS.md` §4, `Themes.md`,
  `specs/_cheatsheet.md`. ДС20 усилено: тег считается по разметке, не по комментарию.
- **Э4a:** `docs/misc/RE0005-themes/light-seeds.mjs` — разовый сборщик семян новых тонов
  (`accent` из emerald, `neutral`/`grey` — решения Э2; печатает таблицу всех тонов для
  справки, в источник идут три; ничего не пишет).
- `foundations/Themes/Themes.tokens.js` — `seeds["ibp-light"].ramps` на 3 новых тона;
  значения ролей-границ под 3:1 (`--color-border-default` → `neutral-500`,
  `--color-border-strong` → `neutral-600`); `contrast` (17 пар, `required`); шапка обновлена.
- `foundations/Themes/Ramp.tokens.js` — шкала новых тонов: `LIGHT_L['600']` 0.535 → 0.525
  (светлый текст на акцентной заливке проходит AA 4,5:1); считаются только accent/neutral/grey.
- `design-system/tools/theme-build.mjs` — новые рампы из семян + **перенос базовых из
  `Colors.css` как есть** (`950` = `900`); `contrast` источника с порогами (4,5:1 текст,
  3:1 границы/управление), `required: false` → INFO; `checkMonotone` только по сгенерированным;
  `--selftest` — 19 кейсов.
- `foundations/Themes/Themes.md`, `Themes.html` — описание: новые тона из семян, базовые —
  перенос с пометкой `legacy`.
- **Э4b:** `foundations/Themes/Themes.html` — стенд: две сцены рядом (`legacy` и
  `ibp-light`) на компонентах Buttons/Badge/Link/Chip/Switch; вкладка «Конструктор» —
  редактор семян **трёх новых тонов** (ползунки `h/c`, живой пересчёт через `window.DS_RAMP`,
  inline `--ramp-*` на сцене темы, сброс, JSON); документация — рампы 19×11 (новые из семян,
  базовые с пометкой `legacy` — читаются из `Colors.css` через `getComputedStyle`), роли по
  группам, карта 119, отчёт контраста (обязательные и `legacy`-пары), точечные правила,
  правила страниц, `keep`. Таблицы строит скрипт страницы из `DS_THEMES`; `Ramp.tokens.js`
  подключён тегом страницы.
- `foundations/Themes/Themes.tokens.js` — `contrast` (17 пар с порогами и `required`) как
  единый список для генератора и стенда; `theme-build.mjs` читает `tokens.contrast`
  (запасной список в коде — для фикстуры `--selftest`).
- **Э5:** `foundations/Themes/Ramp.tokens.js` — две шкалы `SCALES.light`/`SCALES.dark`,
  `tone(seed, profile)` (по умолчанию `light`), `build(seeds, profile)`, `LIGHT_L`/`CHROMA`
  оставлены как алиасы светлой; тёмная — шаг 50 самый тёмный, 950 светлый.
- `Themes.tokens.js` — `seeds["ibp-dark"]` (profile `dark`, 19 тонов: accent/neutral/grey —
  дизайнерские, базовые 16 — из legacy-производных); `themeValues["ibp-dark"]` — иерархия
  поверхностей (`bg-page`/`sunken`/`surface`/`raised`/`hover`/`pressed`/строки), инверсная
  поверхность, `--color-shadow` из тёмного конца, затемнение, `--color-accent-shadow`,
  12 графиков под тёмный фон.
- `tools/theme-build.mjs` — рампы считаются с профилем темы; `themeValues[тема]` перекрывает
  общий `values`; монотонность проверяется по направлению профиля (light — вниз, dark — вверх);
  `--selftest` без изменений (19 кейсов, светлая фикстура).
- `foundations/Themes/Themes.html` — три сцены (`legacy`/`ibp-light`/`ibp-dark`), конструктор
  с переключателем темы (`#editTheme`), редактор семян по выбранной теме (light — 3 тона,
  dark — 19), рампы/карта/контраст/JSON — по выбранной теме, роли — колонка на каждую тему.
- **Э6:** `docs/misc/RE0005-themes/{light-roles,ramp-compare}.mjs` — разовые замер и
  сборщик ролей светлой (печатают, не пишут).
- `Themes.tokens.js` — `themeValues["ibp-light"]` = 118 ролей значениями `Palette.css`
  (hex/`color-mix`); `seeds["ibp-light"].palette = true`; `seeds["service"]` (профиль dark,
  индиго-акцент 271.4, 19 тонов) + `themeValues["service"]`; нейтраль светлой и тёмной
  переведена на бирюзовый тон 187°; у 4 пар контраста добавлено `exempt: ["ibp-light"]`;
  шапка обновлена.
- `theme-build.mjs` — `hexOf` резолвит hex и токены `Colors.css`; `exempt` даёт INFO;
  селектор точечных правил исключает темы-«палитры»
  (`:where([data-theme]:not([data-theme="legacy"]):not([data-theme="ibp-light"]))`).
- `Themes.js` — кнопка и панель окна помечены `data-theme="service"`.
- `.agents/proto-panel/ui.js` — корни `#pp-root`, `#pp-drawer`, `.pp-modal` в `service`;
  обёртка `DSFloat.mount` помечает плавающие слои панели (меню, список, тултип) по исходному
  родителю до переезда, чужие не трогает.
- `Themes.html` — четвёртая сцена `service`, `EDIT`/`stages`/селект на три темы, `hexOf`
  резолвит hex и токены `Colors.css`, отчёт контраста знает `exempt`, описания и вкладка
  «Код» обновлены; `Themes.md`, `specs/_cheatsheet.md`, `CHANGELOG.md`, `index.html` (ds-home),
  задача — по решениям.
- **Э7:** `design-system/AGENTS.md` §2 — строки основы `foundations/Themes/`, тега
  `docs-kit/ds-theme-boot.js` и импорта тем в `ds.css`; `MAINTAINING.md` — раздел «Темы:
  новая тема и точечное правило» (`seeds`/`themeValues`, флаг `palette`, точечное правило,
  «пропал селектор», `exempt`); `CHANGELOG.md` — запись 04.10.2026; `ds-home.mjs` (1.025 ·
  04.10.2026); `docs-index.mjs` (280 документов); `pages-index.md` docs-split перегенерирован;
  приёмка страницы «Темы» — `screen-reviewer`, PASS; урок Л169.

## Проверки
- `boot-build --selftest` — OK (17 кейсов, включая тему); `--check` — OK.
- `theme-build --check` — OK.
- `boot-selftest.mjs` — 6/6; `themes-selftest.mjs` — 11/11 (API, хранение, событие).
- `docs-split check` по 56 ds-split страницам — 0 падений; `ds-check --all` — OK (в нём шаг тем).
- `verify --corpus lint --only B16` и `--only B17` — ДОКАЗАНЫ (падают на фикстуре, молчат на эталоне); полный `verify --corpus lint` — OK.
- Гейт `lessons-cli gate` — `ВЕРДИКТ: OK` (16 шагов, включая `theme-build` и `ds-check --all`).
- `git diff --numstat`: на страницах ДС ровно +1 строка (тег); больше — только `index.html` (карточка Э3.1).
- **Э4a:** `theme-build --check` — OK (обязательный контраст и монотонность без дефектов,
  генерат совпал; 5 INFO по парам на базовых тонах — `warning-fg` 2.14, `success-fg` 3.83,
  `info-fg` 4.48, `fg-on-fill` на `success-fill` 2.97 и `info-fill` 3.60 — это legacy,
  `required: false`); `--selftest` — OK (19 кейсов: тон с семенем, перенос тона без семени,
  `950` = `900`, монотонность, информационная пара не роняет); `ds-check --all` — `ВЕРДИКТ: OK`;
  `boot-build --check` — OK; `ds-check foundations/Themes/Themes.html` — `ВЕРДИКТ: OK`.
  Правки лежат в untracked `foundations/Themes/` и `tools/theme-build.mjs` — tracked-файлы ДС не тронуты (критерий 2).
- **Э4b:** `ds-check foundations/Themes/Themes.html` — `ВЕРДИКТ: OK` (docs-split 20/20);
  `ds-check --all` — `ВЕРДИКТ: OK` (P4 по `.stand-tbl--keep` поймал и снят — рантайм-класс без CSS);
  у стенда: новые тона из семян, базовые — из `Colors.css`; контраст обязательных пар PASS,
  базовые показаны пометкой `legacy`.
- **Э5:** `theme-build --check` — `ВЕРДИКТ: OK` (собраны `ibp-light, ibp-dark`; обязательный
  контраст и монотонность без дефектов). Тёмная проверена: `bg-page #0F1214` < `surface #1D1D1D`
  < `raised #292929`, `fg-default #D6E0E6`, `accent-fill #20A496` + `fg-on-fill #121212` (6.08:1),
  `shadow #0F1214`; обязательные AA — без FAIL. `ds-check --all` — `ВЕРДИКТ: OK`;
  `ds-check foundations/Themes/Themes.html` — `ВЕРДИКТ: OK` (docs-split 20/20, JS компилируется).
  Глазами стенд не смотрели: рендер в контуре не снимается, смотрит человек (Э4b, шаг 4).
- **Э6:** `theme-build.mjs` — собраны `ibp-light, ibp-dark, service`; `--check` — `ВЕРДИКТ: OK`
  (light: 4 пары `exempt` + 4 `legacy` — INFO; обязательных FAIL нет). Светлая = legacy:
  `--color-accent-fill #00AA9B`, `--color-border-default #B8CCCC`, `--color-fg-default #324844`,
  `--color-bg-page #F5F7F7`; селектор точечных правил без `ibp-light` (проверено грепом).
  `ds-check --all` — `ВЕРДИКТ: OK`; `ds-check foundations/Themes/Themes.html` — `ВЕРДИКТ: OK`
  (docs-split 20/20). `boot-build --check` — OK; `proto-panel.mjs` — OK; гейт
  `lessons-cli gate` — `ВЕРДИКТ: OK` (15 шагов). `git diff --numstat`: страницы компонентов,
  основ и паттернов — ровно +1 строка (тег темы). Глазами — человек.
- **Э7:** `ds-check --all` — `ВЕРДИКТ: OK`; `ds-home.mjs --check` — шапка актуальна (1.025 ·
  04.10.2026); `docs-index.mjs` — OK (280); приёмка `screen-reviewer` по `Themes.html` —
  `ВЕРДИКТ: PASS`; `lessons-cli check` — находок нет (запись Л169); гейт — `ВЕРДИКТ: OK`.
  Приёмка вычистила: опечатку «светлota» (страница и задача), класс-сироту `stand-tbl--variants`,
  устаревшее имя `.theme-trio` → `.theme-stand`; перегенерирована карта docs-split.

## Открытые вопросы
- Вопросы 1–2 задачи закрыты решениями Э3.2 (см. задачу); остаются 3–8 — на своих этапах.
- Вопрос 3 (иллюстрации/логотип/фон хаба/глифы в тёмной теме) — решение человека
  02.10.2026 отложено (Э5); записано в бэклог Э7.
- Вид окна и тема `service` для его корня/поповеров — сделано в Э6.
- Светлая тема: дизайнер правит значения ролей позже (решение 04.10.2026 — сначала копия
  текущей). Семена светлой на неё не влияют (флаг `palette`).

## Следующий шаг
Все этапы сделаны. Осталось за человеком:
1. Посмотреть стенд `design-system/foundations/Themes/Themes.html` — четыре сцены
   `legacy`/`ibp-light`/`ibp-dark`/`service`; вкладка «Конструктор» — темы `ibp-dark`/`service`.
2. Посмотреть пилот `apps/ib/drafts/ai-bankster-prototype-v02` — панель и её меню в `service`
   при любой теме страницы; хаб, приложение `apps/postrade/deals-app/`, витрина, страница ДС.
3. Сказать, что подкрутить (цвета светлой правятся ролями, не семенами), и не делать ли коммиты.
После подтверждения — задача закрывается (коммиты в ветке `feat/re0005-themes` — по просьбе).

## Читать первыми
- `docs/tasks/RE0005-ds-themes.md` — §2 (архитектура, роли и рампы), §4 (итоги всех этапов, Э6/Э7)
- `docs/misc/RE0005-themes/light-roles.mjs` — как роли светлой выведены из `Palette.css` (правило)
- `docs/misc/RE0005-themes/light-verify.mjs` — доказательство «светлая = текущая» (119/119)
- `docs/misc/RE0005-themes/palette-guard-proof.mjs` — доказательство сторожа откатом
- `design-system/foundations/Themes/Themes.html` — стенд и редактор семян (данные — из `DS_THEMES`)
- `design-system/MAINTAINING.md` — «Темы: новая тема и точечное правило», «Страницы документации»
- `design-system/foundations/Themes/Themes.md` и `Themes.tokens.js` — шапки (формат, темы)
- `design-system/foundations/Themes/Themes.js`, `docs-kit/ds-theme-boot.js` — атрибут, API, окно
- `design-system/docs-kit/ds-nav.js` — образец `ensureCss()` и монтажа на страницах ДС

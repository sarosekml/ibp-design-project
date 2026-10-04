# RE0011 — handoff

- **Дата:** 04.10.2026
- **Статус:** закрыта

## Цель
Тёмные варианты всех тайловых иллюстраций ДС и фоновой иллюстрации главной: под
темами `ibp-dark`/`service` прототипы IBP показывают тёмные картинки, а не светлые.

## Этапы
- ✓ карта цветов и генератор
- ✓ 32 тайловых тёмных файла + фон
- ✓ рантайм (`Illustrations.js`) и загрузчик (`ds-config.js`)
- ✓ документация и проверки
- ✓ визуальная приёмка человеком

## Смета
`ctx-budget` не считался: заход — правка основы ДС, а не сборка экрана (маршрут
«Собери экран» не применялся).

## Принятые решения (человек 04.10.2026)
- Объём — все 32 тайловых иллюстрации одним генератором.
- Способ — машинная перекраска по карте (как `current-depo-dark`), не перерисовка.
- Фон — хаб + главные приложений, тема-зависимая `--boot-bg-illustration`.
- Оснастка — тул ДС `tools/illustration-dark.mjs` + задача RE0011.

## Что сделано
- `design-system/tools/illustration-dark.mjs` — генератор: карта от 6 якорей
  `current-depo-dark`, `--check` / `--selftest` / `--table`; `<mask>` и семантика
  не красятся.
- `design-system/assets/illustrations/*-dark.svg` — 31 новый тайловый +
  `background-illustration-dark.svg`; `current-depo-dark.svg` — эталон.
- `design-system/foundations/Illustrations/Illustrations.js` — список `DARK` (32 тайла).
- `.agents/tools/boot-build.mjs` → `apps/ds-config.js` — под тёмной темой тёмный
  фон, перестановка на `ds:themechange`; в `--selftest` кейс фона.
- `design-system/tools/ds-check.mjs --all` — шаги `illustration-dark --check` и `--selftest`.
- Сторож `visibleLight` в генераторе: ловит оставшийся светлый видимый цвет;
  фон залит градиентами, поэтому добавлена перекраска `stop-color` (урок **Л182**).
- `Illustrations.md` / `Illustrations.html` (1.006), `specs/_index.md`, `CHANGELOG.md`.

## Проверки
- `node design-system/tools/ds-check.mjs --all` — ВЕРДИКТ: OK.
- `node .agents/tools/boot-build.mjs --selftest` — ВЕРДИКТ: OK (18 кейсов).
- `node design-system/tools/illustration-dark.mjs --check` / `--selftest` — ВЕРДИКТ: OK.
- `node .agents/tools/lessons-cli.mjs gate` — ВЕРДИКТ: OK.

## Открытые вопросы
- Оттенки, которых не было в эталоне `current-depo`, получены интерполяцией карты.
  Человек смотрит тёмные плитки; не понравился оттенок — правим карту в
  `illustration-dark.mjs` и пересобираем: `node design-system/tools/illustration-dark.mjs`.

## Следующий шаг
Открыть `apps/postrade/deals-app/pages/MainPage.html?theme=ibp-dark` (и
`index.html?theme=ibp-dark`) и оценить тёмные плитки и фон.

## Читать первыми
- `docs/tasks/RE0011-ds-illustrations-dark.md`
- `design-system/tools/illustration-dark.mjs`
- `design-system/foundations/Illustrations/Illustrations.md`

# RE0008 — handoff

- **Дата:** 04.10.2026
- **Статус:** Э1–Э3 сделаны, задача закрыта. Приёмка `Themes.html` — PASS; гейт — OK.
- **Задача:** `docs/tasks/RE0008-ds-palette-legacy.md`.
- **Осталось за человеком:** визуальная проверка (рендер в контуре не снимается) — стенд `design-system/foundations/Themes/Themes.html`, хаб (навигация), кнопки-аутлайны, SegmentControl/SubTab, график, статусные чипы, поля с постфиксами и хелперами; клик и перетаскивание кнопки тем.

## Цель
Вторая итерация полировки после RE0007 по замечаниям человека: вернуть legacy-цвета графиков и статусов, синúть neutral, поправить аутлайны/иконки/треки и вернуть клик по кнопке тем.

## Решения человека (04.10.2026)
- Графики и статусная палитра — legacy во **всех трёх** темах.
- `neutral` — средняя синева (тон ≈ 250°, хрома ≈ 0.02, светлота как была).
- `--color-fg-muted` — общий `neutral-500` в светлой.

## Сделано
- `Themes.tokens.js`:
  - `values`: `--color-status-*` — legacy-токены `Palette.css`; `--color-chart-1…12` — legacy hex (`--ch-*`).
  - `themeValues["ibp-light"]`: `--color-fg-icon-strong` = `var(--emerald-600)`, `--color-fg-muted` = `var(--ramp-neutral-500)`; из `themeValues` всех тем удалены `--color-chart-*`.
  - `seeds[...].neutral` (все темы) — синеватые ступени.
  - `rules`: `.segctrl`/`.subtabs` → `var(--color-bg-muted)`; `.btn--outline` → `var(--color-accent-fill)`; `.btn--outline:active`/`.is-active` → `var(--color-accent-muted)`.
- `Themes.js`: убран `setPointerCapture` — клик по кнопке тем работает, перетаскивание сохранено.
- Документация: проза и «Код» `Themes.html`, `Themes.md`, шапка `Themes.tokens.js`; версия Themes **1.004**, `CHANGELOG.md`, `specs/_index.md`, `ds-home`.
- Урок **Л175** (`setPointerCapture` уводит `click` с вложенной кнопки).

## Проверки
- `theme-build --check` / `--selftest` — OK; `ds-check --all` — OK; `ds-check Themes.html` — OK; `lessons-cli gate` — `ВЕРДИКТ: OK`. Приёмка `screen-reviewer` — **PASS** (первый круг — NEEDS-WORK по прозе, закрыт).
- Визуально смотрит человек.

## Открытый пункт
- Техническое покрытие равенства статусной палитры `Palette.css` — сторожа нет (перенесено из RE0007).
- Клик/перетаскивание кнопки тем проверяются только указателем (Л175).

## Читать первыми
- `docs/tasks/RE0008-ds-palette-legacy.md` — правки и итог.
- `docs/tasks/RE0007-ds-palette-polish.md` — предыдущая итерация.
- `design-system/foundations/Themes/Themes.tokens.js` — `values`, `themeValues`, `rules`.
- `.agents/skills/screen-review/references/lessons-raw.md` — Л174, Л175.

# RE0009 — handoff

- **Дата:** 04.10.2026
- **Статус:** Э1–Э3 сделаны, задача закрыта. Приёмка — PASS; гейт — OK.
- **Задача:** `docs/tasks/RE0009-ds-scroll-dark.md`.
- **Осталось за человеком:** визуальная проверка (рендер не снимается) — окно «Продукты ДИД» и модалка фильтра (ширина при появлении полосы), тёмная тема: тултипы, кнопка «Новая сделка», рамка плитки на наведении, выпадающий список статуса, разделители табов/фильтра, статусные чипы.

## Цель
Третья итерация после RE0008: оверлейные полосы прокрутки внутренних областей и читаемость тёмной темы.

## Решения человека (04.10.2026)
- Статусы тёмной — сгенерированные (читаемые); legacy — только в светлой.
- Границы тёмной — лесенка `subtle` → `neutral-300`, `default` → `neutral-400`.

## Сделано
- **Скролл:** `overflow-y: overlay` + `scrollbar-gutter: stable` — `foundations/Layout/Layout.css` (`.ds-scroll`), Modal, Popover, Drawer, DropdownList, ContextMenu, NavPanel, DatePicker, Splitter, Kanban, `docs-kit/ds-nav.css`, `docs-kit/ds-toc.css`. Причина: при стилизованном `::-webkit-scrollbar` `scrollbar-gutter` место не резервирует (Л176).
- **Тёмная тема** (`Themes.tokens.js`): `--color-fg-on-fill` → `var(--ramp-neutral-950)`; `--color-border-subtle`/`--color-border-default` → `neutral-300`/`neutral-400`; `values["--color-status-*"]` — сгенерированные, legacy-статусы — в `themeValues["ibp-light"]`; графики legacy во всех темах; `contrast` — `exempt` заливок и границ для тёмной/сервисной.
- **Документация:** версии Themes 1.005; Layout 1.015, Modal 1.012, Popover 1.010, Drawer 1.003, DropdownList 1.017, ContextMenu 1.011, NavPanel 1.023, DatePicker 1.009, Splitter 1.005, Kanban 1.006; `CHANGELOG.md`, `specs/_index.md`, `.md` и `.html` шапки; вкладки «Код» — `docs-split inject`.
- Урок **Л176**.

## Проверки
- `theme-build --check` / `--selftest` — OK; `ds-check --all` — OK; `ds-check Themes.html` — OK; `docs-split check` — OK; `lessons-cli gate` — `ВЕРДИКТ: OK`. Приёмка `screen-reviewer` — **PASS** (первый круг — NEEDS-WORK по `ds-toc`, закрыт).

## Открытый пункт
- Сторож: правило линтера «у селектора с `::-webkit-scrollbar` есть `overflow-y: overlay`» — посильно, не написано (Л176, уровень «неизмеримое»).

## Читать первыми
- `docs/tasks/RE0009-ds-scroll-dark.md` — правки и итог.
- `docs/tasks/RE0008-ds-palette-legacy.md` — предыдущая итерация.
- `.agents/skills/screen-review/references/lessons-raw.md` — Л174–Л176.

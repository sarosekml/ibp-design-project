---
id: 'RE0009'
title: 'Оверлейные полосы прокрутки и читаемость тёмной темы'
status: done
priority: high
effort: medium
dependencies: ['RE0008']
tags:
  - design-system
  - themes
  - scroll
  - dark-theme
created: 2026-10-04
---

# Оверлейные полосы прокрутки и читаемость тёмной темы (RE0009)

## Коротко

Третья итерация после RE0008 (замечания человека 04.10.2026): снова ширина
прыгает при появлении полосы прокрутки (теперь в окне «Продукты ДИД»), и шесть
дефектов тёмной темы.

## Решения человека (04.10.2026)

| Вопрос | Решение |
|---|---|
| Статусы в тёмной | вернуть сгенерированные (читаемые) ступени; legacy — только в светлой |
| Границы в тёмной | лесенка `subtle` → `neutral-300`, `default` → `neutral-400` |

## Правки

1. **Полоса прокрутки — оверлейная.** `.ds-scroll` и тела Modal/Popover/Drawer,
   списки DropdownList/ContextMenu/NavPanel, DatePicker, Splitter, Kanban:
   `overflow-y: overlay` (Chromium) + `scrollbar-gutter: stable` (Firefox).
   Причина: при стилизованном `::-webkit-scrollbar` `scrollbar-gutter` место не
   резервирует — ширина контента скакала.
2. **Тултип / текст на кнопке** в тёмной: `--color-fg-on-fill` светлый.
3. **Рамка плитки на наведении** мягче: границы `subtle/default` в тёмной.
4. **Дропдаун** в окне: видимая рамка (из п. 3) отделяет от фона окна.
5. **Разделитель** табов и фильтра: видим (из п. 3).
6. **Статусы тёмной**: `--color-status-*` в `ibp-dark`/`service` — сгенерированные
   ступени; legacy — только `ibp-light`. Графики — legacy во всех темах.

## Этапы

- [x] Э1: скролл — оверлейные полосы
- [x] Э2: тёмная тема — роли и контраст, пересборка `Themes.css`
- [x] Э3: документация, проверки, приёмка, урок (04.10.2026; `screen-reviewer` — PASS, урок Л176)

## Итог (04.10.2026)

- **Скролл:** `.ds-scroll` и 10 внутренних контейнеров (Modal/Popover/Drawer,
  DropdownList, ContextMenu, NavPanel, DatePicker, Splitter, Kanban) и docs-kit
  (ds-nav, ds-toc) — `overflow-y: overlay` + `scrollbar-gutter: stable`.
- **Тёмная тема:** светлый `--color-fg-on-fill`, границы `subtle`/`default` =
  `neutral-300`/`neutral-400`, статусная палитра снова сгенерированная (legacy —
  только в светлой), графики legacy во всех темах; пары заливок и границы —
  `exempt` для тёмной/сервисной.
- Версии: Themes 1.005 + 10 компонентов подняты, `CHANGELOG`, `_index`, шапки,
  вкладки «Код» через `docs-split inject`.
- Проверки: `theme-build --check`/`--selftest`, `ds-check --all`, `ds-check
  Themes.html`, `lessons-cli gate` — OK; приёмка `screen-reviewer` — PASS. Урок
  **Л176** (`scrollbar-gutter` не работает при стилизованном `::-webkit-scrollbar`).

## Acceptance Criteria

1. Ширина контента внутренних областей не меняется при появлении/исчезновении
   полосы прокрутки.
2. В тёмной теме читаемы тултипы, текст на кнопках, разделители, дропдаун,
   статусы; рамка плитки на наведении мягче.
3. `legacy` без `data-theme` не изменилась от правок ролей; скролл-правка — общая,
   осознанная.
4. `theme-build --check`/`--selftest`, `ds-check --all`, `lessons-cli gate` — OK;
   приёмка `screen-reviewer` — PASS.

## Риски

| Риск | Что делаем |
|---|---|
| `overflow-y: overlay` устарел в Chromium | оставляем `scrollbar-gutter: stable` для браузеров без overlay; следим при обновлении |
| Правка границ тёмной влияет на поля ввода | смотрим глазами, при переборах — точечно |

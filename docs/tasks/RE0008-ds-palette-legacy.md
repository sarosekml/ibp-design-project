---
id: 'RE0008'
title: 'Палитра: возврат legacy для графиков и статусов, синева neutral, аутлайны и мелочи'
status: done
priority: high
effort: medium
dependencies: ['RE0007']
tags:
  - design-system
  - themes
  - colors
  - tokens
created: 2026-10-04
---

# Палитра: legacy для графиков и статусов (RE0008)

## Коротко

Вторая итерация визуальной полировки после RE0007 (замечания человека
04.10.2026). Человек предпочёл legacy-цвета для графиков и статусов, просит
больше синевы в нейтрали и точечные правки компонентов.

## Решения человека (04.10.2026)

| Вопрос | Решение |
|---|---|
| Графики и статусы | вернуть legacy-палитру **во всех трёх темах** |
| Синева `neutral` | средняя: тон ≈ 250°, хрома ≈ 0.02, светлoта ступеней как была |
| `--color-fg-muted` | общий `neutral-500` в светлой (темнее постфиксы, хелперы, плейсхолдеры) |

## Правки

1. **Кнопка тем — клик.** `Themes.js`: убран `setPointerCapture` — он уводил
   `click` с кнопки на контейнер; перетаскивание ведут слушатели `document`.
2. **Аутлайн-кнопки и выбранный пункт меню — как legacy.** `.btn--outline`
   (цвет/рамка/иконка) → `--color-accent-fill` (`#00AA9B`), активное состояние →
   `--color-accent-muted`; `--color-fg-icon-strong` в светлой → `var(--emerald-600)`
   (`#639994`, legacy `--secondary-dark`).
3. **`neutral` синён** (все темы): явные ступени пересчитаны тем же методом
   (OKLCH, светлота сохранена, хрома профиля при c ≈ 0.02, тон ≈ 250°).
4. **`--color-fg-muted`** в светлой → `var(--ramp-neutral-500)`.
5. **Треки SegmentControl и SubTab** — точечными правилами на `--color-bg-muted`
   (на ступень светлее; OFF-свитч не тронут).
6. **Графики** — legacy hex из `Palette.css` (`--ch-*`) в `values` (все темы).
7. **Статусная палитра** — legacy-токены `Palette.css` в `values` (все темы).

## Этапы

- [x] Э1: правки ролей и правил, пересборка `Themes.css`
- [x] Э2: `Themes.js` — вернуть клик по кнопке тем
- [x] Э3: документация, проверки, приёмка, урок

## Итог (04.10.2026)

- **Пп. 6–7:** `--color-chart-1…12` и `--color-status-*` перенесены в `values`
  legacy-значениями `Palette.css` — во всех трёх темах; из `themeValues` графики
  удалены.
- **П. 3:** `neutral` всех трёх тем синён (OKLCH, светлота сохранена, хрома ≈ 0.02,
  тон ≈ 250°); светлая 400 `#B9BBC6 → #B4BDC7`, 900 `#1C2024 → #1B2025`.
- **Пп. 2, 4, 5:** `.btn--outline` → `--color-accent-fill`, активное → `--color-accent-muted`;
  `--color-fg-icon-strong` светлой → `var(--emerald-600)`; `--color-fg-muted` → `neutral-500`;
  треки SegmentControl/SubTab → `--color-bg-muted`.
- **П. 1:** в `Themes.js` убран `setPointerCapture` — клик по кнопке тем снова
  открывает панель, перетаскивание сохранено.
- Проверки: `theme-build --check`/`--selftest`, `ds-check --all`, `ds-check Themes.html`,
  `lessons-cli gate` — OK; приёмка `screen-reviewer` — PASS. Урок **Л175** (pointer capture
  уводит клик с вложенной кнопки). Версия Themes 1.004.

## Acceptance Criteria

1. Графики и статусы — legacy во всех темах; `neutral` синён; аутлайны и
   выбранный пункт меню светлее (как legacy); fg-muted и треки поправлены.
2. Клик по кнопке тем работает, перетаскивание сохраняется.
3. `legacy` без `data-theme` не изменилась (кроме прежней общей правки скролла).
4. `theme-build --check`/`--selftest`, `ds-check --all`, `lessons-cli gate` — OK;
   приёмка `screen-reviewer` по `Themes.html` — PASS.

## Риски

| Риск | Что делаем |
|---|---|
| Синение neutral меняет все поверхности | проверка на стенде, сила — на утверждение |
| Legacy-статусы на тёмном фоне | смотрим тёмную и сервисную на стенде |

# RE0007 — handoff

- **Дата:** 04.10.2026
- **Статус:** Э1–Э6 сделаны, задача закрыта. Приёмка `Themes.html` — PASS; гейт — OK.
- **Задача:** `docs/tasks/RE0007-ds-palette-polish.md`.
- **Осталось за человеком:** визуальная проверка полировки (рендер в контуре не снимается) — стенд `design-system/foundations/Themes/Themes.html` (четыре сцены), хаб (левая панель), тайлы «Описание сделки» и «Финансовые инструменты», поповер RiskMetric, модалка фильтра, кнопка тем.

## Цель
Полировка палитры и тем после RE0006: статусы светлой — как в legacy; иконки по умолчанию серо-синие; границы и подложки мягче; панель навигации не сливается; выбранный пункт — светлый акцент; кнопка тем перетаскивается; ширина при скролле не скачет; в документации палитры — колонка legacy.

## Решения человека (04.10.2026)
- Статусы `ibp-light` — **ровно legacy** (`Palette.css`), пары контраста — информационные.
- Фон левой панели — **белый `#FFFFFF`**.
- Фикс ширины при скролле — `scrollbar-gutter: stable`.
- Отдельная задача RE0007.

## Сделано
- **Роли светлой** (`Themes.tokens.js`, `themeValues["ibp-light"]`): статусы `danger/warning/success/info`
  = legacy-значения (`var(--red-300)` → `#E5625C` и т.п.); `--color-fg-icon` и
  `--color-border-default` = `neutral-400`; `--color-bg-nav` = `grey-50`; `--color-row-pinned`
  `neutral-100/200/200`. В `ibp-dark`/`service` `--color-fg-icon` = `neutral-600`. Точечные
  правила: `.nav__item--selected` (и `:hover`, `[aria-current]`) → `--color-secondary-bg`,
  `.rm-block` → `--color-bg-sunken`. Пары контраста границы и статусов — `exempt: ["ibp-light"]`.
- **Генератор** (`tools/theme-build.mjs`): токены компонентов (правила `:root`) — в блоке
  **каждой** темы, а не один раз на `:root[data-theme]`; вложенная тема (`service` на стенде,
  окно тем) больше не наследует токены темы страницы. Кейс `--selftest` обновлён. Пересобран `Themes.css`.
- **Кнопка тем** (`Themes.js`, `Themes.panel.css`): перетаскивание левой клавишей, позиция в
  `localStorage` (`ds.theme.pos`), панель у кнопки, порог 4px от клика, зажим в вьюпорт, resize.
- **Скролл** (`Modal.css`, `Popover.css`, `Drawer.css`): `scrollbar-gutter: stable` на телах;
  страницы пересобраны `docs-split inject`; версии `1.011/1.009/1.002`, `_index.md`, `CHANGELOG`.
- **Документация** (`Themes.html`): в таблицах ролей и карты — колонка `legacy` (значение старого
  имени из `Palette.css`, резолв `var()`-цепочки); обновлены проза, «Доступность», вкладка «Код».
- **Урок Л174** (компонентные токены во вложенной теме) — `lessons-raw.md`.

## Проверки
- `theme-build --check` / `--selftest` — OK; `ds-check --all` — OK; `ds-check Themes.html` — OK;
  `lessons-cli gate` — `ВЕРДИКТ: OK`. Приёмка `screen-reviewer` — **PASS**.
- Визуально смотрит человек (рендер в контуре не снимается).

## Открытый пункт
- Нет автоматической сверки, что роли статусов `ibp-light` в точности равны `Palette.css`:
  равенство держится ссылками `var(--red-300)` и т.п.; ветка сверки в генераторе работает только
  при флаге `seeds[тема].palette`, которого нет ни у одной темы. Сторож — на будущее.

## Читать первыми
- `docs/tasks/RE0007-ds-palette-polish.md` — решения, правки, итог.
- `design-system/foundations/Themes/Themes.tokens.js` — `values`, `themeValues`, `contrast`, `rules`.
- `design-system/tools/theme-build.mjs` — блок темы и `--selftest`.
- `.agents/skills/screen-review/references/lessons-raw.md` — Л174.

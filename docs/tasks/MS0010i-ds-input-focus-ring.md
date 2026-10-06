---
id: '010i'
title: 'Inputs: светлое кольцо фокуса как в прототипе — во всех полях ДС'
status: done
priority: medium
effort: small
dependencies: []
tags:
  - design-system
  - inputs
  - ai-bankster
created: 2026-10-05
---

# Inputs: кольцо фокуса

## Коротко

- **Откуда.** Решение человека 05.10.2026 (разбор MS0010): в прототипе
  `apps/ib/drafts/ai-bankster-prototype-v02` у полей «Поиск по чатам»
  (`.hsearch`) и «Поиск объекта» (`.bfind`) при вводе вокруг поля — толстое
  очень светлое primary-кольцо: `box-shadow: 0 0 0 3px` primary 14 %
  (`RequestThread.html`, строки ~70 и ~385). Человеку оно нравится —
  перенести во **все поля ДС**.
- **Как сейчас в ДС** (`components/molecules/Inputs/Inputs.css`, замер
  05.10.2026): фокус — рамка `--primary` + `inset 0 0 0 1px var(--primary)` +
  `0 0 0 3px var(--primary-bg-light)`. Кольцо той же толщины, но 4 % —
  почти не видно. У ошибки — `color-mix(error 8 %)`, у предупреждения —
  `color-mix(warning 10 %)`.
- **Задача.** Кольцо фокуса полей — как в прототипе (заметное светлое);
  поведение компонента (рамка, inset, hover, крестик) — без изменений.
  Общая основа `.inp__field` — значит, меняются сразу InputText,
  InputAutocomplete, InputDate, InputDateRange, InputAmountRange и поля
  фильтра. Версии — по правилу «Версионирование».

## План (на согласование в диалоге)

Замер 05.10.2026: внешнее кольцо фокуса в ДС есть только у полей — три
правила в `components/molecules/Inputs/Inputs.css` (обычное, ошибка,
предупреждение). У Checkbox, Radiobutton, Switch — ореол наведения, это не
кольцо поля, задача их не трогает.

| Состояние | Сейчас | Станет |
|---|---|---|
| Фокус | рамка `--primary` + `inset 1px --primary` + кольцо 3px `--primary-bg-light` (4 %) | то же + кольцо 3px `--st-primary-light` (16 %, ближайший токен к 14 % прототипа) |
| Фокус с ошибкой | … + кольцо 3px `color-mix(error 8 %)` | кольцо 3px `--st-red-light` (16 %) — вопрос |
| Фокус с предупреждением | … + кольцо 3px `color-mix(warning 10 %)` | кольцо 3px `--st-orange-light` (16 %) — вопрос |

- Толщина кольца (3px), рамка, inset, hover, крестик — без изменений.
- Новых токенов нет.
- Точечные правила тем (`Themes.tokens.js`, селекторы
  `.inp__field:focus-within, .inp.is-focus .inp__field` и варианты error/warning)
  обновить вместе с CSS, пересобрать темы — иначе `theme-build --check` упадёт.
- Версии: Inputs-компоненты по правилу «Версионирование» (страницы и спеки
  полей, `_index.md`), строка в журнале; вкладка «Код» — `docs-split inject`.
- Прототип v02 не правится: его поля поиска переедут на InputText в MS0010h.

## Tasks

- [x] План согласован в диалоге (05.10.2026: «далее к MS0010i» — по плану, Error/Warning усиливаются вместе с фокусом)
- [x] `Inputs.css`, темы, страницы, спеки, журнал
- [x] Гейты ДС и проекта — `ВЕРДИКТ: OK`

## Итог (05.10.2026)

- `Inputs.css`: кольцо 3px — фокус `--st-primary-light`, Error `--st-red-light`,
  Warning `--st-orange-light` (все 16 %); рамка, inset, hover, габариты прежние
  (замер: высота поля M в фокусе — 40px).
- Темы: точечные правила `.inp__field:focus-within` и Error/Warning → роли
  `--color-status-accent-subtle` / `-red-subtle` / `-orange-subtle`; в
  `ibp-dark` кольца тоже 16 % (замер в браузере). Themes 1.009.
- Версии: InputText 1.016, InputAutocomplete 1.018, InputDate 1.016 (страница,
  спека, манифест); таблица цветов InputText — три строки колец; шпаргалка;
  журнал; вкладка «Код» трёх страниц — `docs-split inject`.
- Попутно (решение человека 05.10.2026): панель прототипа на страницах ДС
  остаётся; в генераторе включателя `.agents/tools/proto-panel.mjs` путь
  `molecules/Switch` → `atoms/Switch` (404 на всех страницах ДС, свитчи
  панели без стилей); правило ПН8 теперь сверяет, что каждый путь ДС во
  включателе ведёт к файлу; самопроверка — случай «9в».

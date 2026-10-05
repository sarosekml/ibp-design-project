---
id: '010b'
title: 'Buttons: кнопка-переключатель — нажатое и раскрытое состояние, смена глифа'
status: pending
priority: medium
effort: small
dependencies: []
tags:
  - design-system
  - buttons
  - ai-bankster
created: 2026-10-05
---

# Buttons: кнопка-переключатель

## Коротко

- **Откуда.** `RequestThread.html` v02, две кнопки ведут себя как
  переключатели, а Buttons этого не умеет:
  1. **«Конструктор» ↔ «Закрыть конструктор»** (`.cmp__tgl`, строки
     ~315–321): Button Outline S с `aria-expanded`. Открыто — фон primary
     10 %, рамка `--primary`, текст `--primary-dark`; глиф `ai-stars`
     поворачивается и гаснет, проявляется `close`. Подпись меняет скрипт.
  2. **«Добавить в контекст» ↔ «В контексте»** под карточкой документа
     коллеги (`syncPriorCtx`, ~1715): Button Transparent S с `aria-pressed`,
     глиф `add` → `check`, класс перерисовывается скриптом.
- **Чего нет в ДС.** У Buttons нет нажатого состояния (`.is-active` — только
  форс для витрины, `Buttons.md`) и нет смены глифа. У IconButton есть
  `.ibtn--selected` + `aria-pressed` — у кнопки с подписью аналога нет.
- **Задача.** Расширить Buttons: состояние **Selected** по
  `aria-pressed="true"` и `aria-expanded="true"` (у кнопок-переключателей
  панели, не у кнопок-меню) и слот **двух глифов** `.btn__icon--toggle`.
  Версия Buttons `1.011` → `1.012`.
- **Часть группы MS0010.** Нужна PromptInput (MS0010) и карточке
  документа (MS0011). Правка ДС — после согласования вопросов §5.

## Objective

Кнопка с подписью может быть переключателем: выбранный вид задаётся ARIA, а
не классом экрана; ведущий глиф меняется вместе с состоянием без смены
габарита. Прототип v02 переведён: локальные `.cmp__tgl*` удалены.

## 1. Как сейчас в ДС

- `Buttons.md`: «`.is-hover` / `.is-active` — форсированные состояния только
  для спецификаций». `aria-expanded` используется только у кнопки-меню —
  разворачивает `.btn__chevron`.
- IconButton 1.011: `.ibtn--selected` + `aria-pressed` — режим-переключатель.

## 2. Решение

### 2.1. Состояние Selected

- Селектор: `.btn:is(.btn--selected, [aria-pressed="true"], .btn--toggle[aria-expanded="true"])`.
  - `aria-pressed` — переключатель вкл/выкл («В контексте»).
  - `aria-expanded` — **только с `.btn--toggle`**: у кнопки-меню
    (`aria-haspopup`) `aria-expanded` уже значит «меню открыто» и красить её
    не нужно — поворачивается шеврон. Модификатор отделяет «раскрывает
    панель» от «открывает меню».
  - `.btn--selected` — форс для витрины (как `.chip--selected`, RulesAudit W1).
- Цвета — **из существующих токенов выбранного состояния** (одни на всю ДС,
  совпадают с Chip Selected MS0009): фон `--st-primary-light`, рамка — primary
  тона Outline, текст `--primary-dark`, иконка `--primary`; hover выбранного —
  `--st-primary-midlight`. Для Transparent — только фон и цвет, без рамки.
  Accent selected не бывает (вопрос 5.1).
- Габарит не меняется: рамка той же толщины, паддинги прежние.

### 2.2. Смена глифа — `.btn__icon--toggle`

```html
<button type="button" class="btn btn--outline btn--s btn--toggle" aria-expanded="false" aria-controls="drawer">
  <span class="btn__icon btn__icon--toggle" aria-hidden="true"><i data-icon="ai-stars"></i><i data-icon="close"></i></span>
  <span class="btn__label">Конструктор</span>
</button>
```

- Слот размером иконки кнопки (20/18/16 по M/S/XS). Первый глиф виден в
  обычном состоянии, второй — в Selected. Переход — `opacity` + `transform`
  внутри слота; `prefers-reduced-motion` — без перехода.
- Тот же приём, что `.chip__icon--toggle` в MS0009 — одно имя модификатора
  `--toggle` в обоих компонентах.
- Подпись кнопки компонент не меняет: «Конструктор» → «Закрыть
  конструктор» — данные экрана.

### 2.3. Доступность

- `aria-pressed` — для переключателя вкл/выкл; подпись при этом **не
  меняется** по смыслу (скринридер сам скажет «нажата»). В прототипе
  «Добавить в контекст» → «В контексте» — допустимо, но проверить озвучку.
- `aria-expanded` + `aria-controls` — для кнопки, раскрывающей панель.
- Нельзя ставить оба атрибута одновременно.

## 3. Что править

### 3.1. ДС — `components/atoms/Buttons/`

| Файл | Что |
|---|---|
| `Buttons.css` | `.btn--toggle`, Selected по §2.1 для Outline и Transparent, `.btn__icon`, `.btn__icon--toggle` |
| `Buttons.page.js` + `Buttons.html` | конструктор: свитч «Переключатель», «Выбрана», «Два глифа»; раздел «Поведение · Переключатель»; «Состояния» — Selected; «Доступность»; «Для разработчиков»; версия `1.012` |
| `Buttons.md` | версия, инварианты (Selected только Outline/Transparent; `aria-expanded` красит только с `--toggle`), классы, `Buttons.types.ts` |
| `specs/_cheatsheet.md`, `specs/_index.md`, `CHANGELOG.md`, `ds-home.mjs` | блок, версия, строка дня |

### 3.2. Прототип v02

- Кнопка «Конструктор»: `btn--toggle` + `.btn__icon--toggle`; удалить
  `.cmp__tgl*` (строки ~315–321).
- «Добавить в контекст»: `aria-pressed` без перерисовки класса;
  глифы `add` / `check` — `.btn__icon--toggle`.
- `RequestThread.screen.md` — строки этих кнопок.

## 4. Проверка

- Гейты ДС (`ds-check` Buttons, `--all`) и проекта — `ВЕРДИКТ: OK`.
- Регресс: **ни у одного потребителя Buttons нет `aria-pressed` на `.btn`**
  до правки (греп) — иначе он станет выбранным. Кнопки-меню с
  `aria-expanded="true"` не перекрашиваются (страница ContextMenu, PageHeader).
- Страница Buttons в трёх темах: Selected Outline / Transparent, hover
  выбранной, смена глифа без сдвига подписи (замер ширины).

## 5. Вопросы к человеку

1. **Selected у Accent** — не нужен (рекомендую: Accent — главное действие,
   не переключатель)?
2. **Цвета Selected** — общие с Chip Selected (`--st-primary-light` и т. д.,
   рекомендую) или как в прототипе (primary 10 %)?
3. **Модификатор `.btn--toggle`** для `aria-expanded` — согласны, или
   красить любой `aria-expanded="true"` без `aria-haspopup`?

## Tasks

- [ ] Вопросы §5 согласованы
- [ ] `Buttons.css`, страница, спека, чит-шит, манифест, журнал
- [ ] Греп потребителей на `aria-pressed`; регресс кнопок-меню
- [ ] Гейты ДС — `ВЕРДИКТ: OK`; проверка в трёх темах
- [ ] Прототип v02: `.cmp__tgl*` удалены, обе кнопки на ДС; гейт проекта — `ВЕРДИКТ: OK`

## Acceptance Criteria

- Buttons 1.012: Selected по ARIA, `.btn--toggle`, `.btn__icon--toggle` —
  на странице и в спеке.
- Существующие кнопки и кнопки-меню не изменились.
- В прототипе v02 нет `.cmp__tgl*`.

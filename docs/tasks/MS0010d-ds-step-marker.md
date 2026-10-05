---
id: '010d'
title: 'StepMarker: новый атом ДС — номер шага, который становится галочкой'
status: pending
priority: medium
effort: small
dependencies: []
tags:
  - design-system
  - new-component
  - step-marker
  - ai-bankster
created: 2026-10-05
---

# StepMarker: номер шага

## Коротко

- **Откуда.** Конструктор запроса в `RequestThread.html` v02: у каждой
  секции слева кружок с номером — «1 Объект анализа», «2 Дополнительный
  фокус» (`.bsec__num`, строки ~374–378). Когда шаг заполнен (`.bsec.is-done`),
  кружок заливается `--primary`, цифра прячется, проявляется галочка
  `check` с анимацией `bldPop`. Скриншоты человека 05.10.2026: шаги 1 и 2
  до выбора — светлые кружки с цифрой; после выбора — зелёные с галочкой.
- **Чего нет в ДС.** Ни степпера, ни маркера шага. Badge — счётчик-бейдж на
  родителе, глиф не держит; Avatar — человек или объект.
- **Задача.** Новый атом **StepMarker** — `components/atoms/StepMarker/`,
  версия `1.000`. Используется в StepForm (MS0010h); пригодится будущему
  Stepper (бэклог).
- **Часть группы MS0010.** Атом без зависимостей. Правка ДС — после
  согласования вопросов §5.

## Objective

В ДС есть атом StepMarker с состояниями «ожидает», «текущий», «готов»,
«ошибка» и «disabled»; конструктор прототипа собирает номера секций из него.

## 1. Как сейчас

```css
.bsec__num { width: 24px; height: 24px; border-radius: var(--radius-full);
  font: var(--type-body-xs); font-weight: 600; color: var(--primary-dark);
  background: color-mix(in srgb, var(--primary) 10%, transparent); }
.bsec__num > [data-icon] { display: none; width: 14px; height: 14px; }
.bsec.is-done .bsec__num { background: var(--primary); color: var(--text-on-dark); }
```

Не токены: `color-mix(… 10 %)`, `font-weight: 600` поверх `body-xs`, 14 px
глиф, 24 px.

## 2. Решение

### 2.1. Разметка

```html
<span class="stepmark stepmark--m" aria-hidden="true">
  <span class="stepmark__num">1</span>
  <i class="stepmark__icon" data-icon="check"></i>
</span>
<!-- готов -->
<span class="stepmark stepmark--m stepmark--done" aria-hidden="true">…</span>
```

- Маркер декоративный (`aria-hidden`): номер и статус шага озвучивает его
  контейнер (StepForm — заголовок секции и `aria-describedby`/текст статуса).
- Состояние задаёт контейнер данными: класс на маркере или атрибут
  контейнера — решение в MS0010h; маркер красится своим модификатором.

### 2.2. Размеры

| Размер | Диаметр | Цифра | Глиф | Где |
|---|---|---|---|---|
| M (по умолчанию) | 24 (`--space-24`) | `--type-body-xs-strong` (если есть, вопрос 5.2) | 16 | StepForm |
| S | 20 | `--type-body-xs-strong` | 12 | плотные списки — вопрос 5.1 |

### 2.3. Состояния и цвета (токены)

| Состояние | Класс | Фон | Цифра / глиф |
|---|---|---|---|
| Ожидает (default) | — | `--st-primary-light` | цифра `--primary-dark` |
| Текущий | `.stepmark--current` | `--st-primary-light` + inset-рамка 1 px `--primary` | цифра `--primary-dark` |
| Готов | `.stepmark--done` | `--primary` | глиф `check`, `--text-on-dark` |
| Ошибка | `.stepmark--error` | `--st-error-light` | глиф `alert-circle` или цифра `--error-dark` — вопрос 5.3 |
| Disabled | `.stepmark--disabled` | `--st-disabled-light` | цифра `--st-disabled-dark` |

- Смена цифры на глиф — `opacity` + `transform` в пределах кружка, габарит
  не меняется; `prefers-reduced-motion` — без перехода.
- Имена токенов `--st-*-light` проверить по `Palette.css` при реализации
  (в MS0009 используются `--st-primary-light`, `--st-system-light`,
  `--st-disabled-light`).

## 3. Что править

### 3.1. ДС — новый компонент (`MAINTAINING.md`, «Новый компонент»)

| Файл | Что |
|---|---|
| `components/atoms/StepMarker/StepMarker.css` | `.stepmark`, размеры, состояния, `.stepmark[hidden]` |
| `…/StepMarker.html` + `.page.js` | конструктор: номер, размер, состояние; демо «шаги 1–3» |
| `…/StepMarker.md` | спека 1.000 |
| `ds.css`, `specs/_cheatsheet.md`, `specs/_index.md`, `AGENTS.md` §6, `index.html`, `ds-nav.js`, `CHANGELOG.md`, `ds-home.mjs` | регистрация |

### 3.2. Прототип v02

Перевод номеров секций — в MS0010h вместе с самой секцией (StepForm). Здесь
прототип не правится, чтобы не трогать `.bsec` дважды.

## 4. Проверка

- Гейты ДС — `ВЕРДИКТ: OK`.
- Страница в трёх темах: контраст цифры на `--st-primary-light` в
  `ibp-dark`; смена цифры на галочку без сдвига.

## 5. Вопросы к человеку

1. **Размер S** — нужен сейчас? Рекомендую только M.
2. **Начертание цифры.** В прототипе `body-xs` + `font-weight: 600` —
   комбинации нет в шкале. Взять существующий strong-стиль шкалы
   (проверить по `Typography.css`) или обычный `body-xs`?
3. **Ошибка** — глиф или красная цифра? Рекомендую глиф: цвет не
   единственный носитель смысла.
4. **Имя** — `StepMarker` (`.stepmark`) или `StepNumber`? Класс `.steps`
   занят стилями страниц ДС (`Themes.pages.css`) — `.step` не берём.

## Tasks

- [ ] Вопросы §5 согласованы
- [ ] Компонент StepMarker 1.000 со страницей, спекой и регистрацией
- [ ] Гейты ДС — `ВЕРДИКТ: OK`; проверка в трёх темах

## Acceptance Criteria

- В ДС есть атом StepMarker 1.000; состояния §2.3 на странице.
- Ни одного `color-mix` и литерала размера в `StepMarker.css`.

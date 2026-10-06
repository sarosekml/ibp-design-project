---
component: StepMarker
title: "Номер шага"
version: "1.000"
updated: "06.10.2026"
page: components/atoms/StepMarker/StepMarker.html
page_js: components/atoms/StepMarker/StepMarker.page.js
css: components/atoms/StepMarker/StepMarker.css
status: curated
---

> Спека для быстрого контекста. Источник истины — CSS-файл и страница компонента. При изменении компонента обновляй эту спеку и блок в specs/_cheatsheet.md.

## Назначение
Кружок с номером шага пошаговой формы: шаг выполнен — номер сменяется галочкой, ошибка — глифом ошибки. Используется в StepForm (подпись шага); пригодится будущему Stepper. Перенесён из конструктора запроса AI Pitcher (прототип ai-bankster v02, задача MS0010d).

## Инварианты
- Маркер декоративный (`aria-hidden="true"`): номер и статус шага озвучивает контейнер — подпись шага и скрытый статус StepForm. Своего текста для скринридера у маркера нет.
- Не интерактивен: не кнопка — не фокусируется, `hover` нет. Переход к шагу по клику — забота контейнера.
- Состояние задаётся данными: модификатором на маркере (`.stepmark--done` и др.) или атрибутом `data-state` шага StepForm (`.stepform__step[data-state="done"]`) — маркер красится сам, экран меняет только атрибут.
- Смена номера на глиф не меняет габарит: глиф лежит по центру кружка поверх номера.
- Глиф ошибки `.stepmark__icon--error` — в разметке, только если шаг бывает с ошибкой; без него в состоянии «ошибка» остаётся номер тоном Error.
- Номер — одна-две цифры. Буквы и слова в маркер не ставятся.

## Ключевые правила (из разделов страницы)
- **Использование** — номер шага в пошаговой форме (StepForm) и в будущем степпере. Не счётчик (это Badge) и не аватар объекта (Avatar).
- **Анатомия** — кружок (заливка по состоянию) + номер `.stepmark__num` + глиф готовности `.stepmark__icon` (`check`) + опц. глиф ошибки `.stepmark__icon--error` (`alert-circle`).
- **Варианты** — состояния: ожидает · текущий · готов · ошибка · недоступен.
- **Размеры** — S 20 (глиф 12) · M 24, по умолчанию (глиф 14) · L 32 (глиф 18); цифра — Body XS полужирным у S и M, Body S полужирным у L.
- **Контент** — номер шага по порядку, с 1; одна-две цифры.
- **Поведение** — номер гаснет (0,2 с), глиф появляется с поворотом −30° и масштабом 0,3 → 1 (0,4 с, `cubic-bezier(.22, 1, .36, 1)`); заливка и цвет — переход 0,25 с; `prefers-reduced-motion` — без анимации.
- **Состояния** — ожидает (`--st-primary-light`, цифра `--primary-dark`) · текущий (+ рамка 1px внутрь `--primary`) · готов (`--primary`, глиф `--text-on-dark`) · ошибка (`--st-red-light`, `--error-dark`) · недоступен (`--st-disabled-light`, `--st-disabled-dark`).
- **Доступность** — `aria-hidden="true"`; статус шага — текстом у контейнера (StepForm — скрытый статус «выполнено»); цвет не единственный носитель смысла — глиф меняется вместе с цветом.
- **Типографика** — `--type-body-xs` / `--type-body-s` + `--weight-semibold`.
- **Цвета** — `--st-primary-light`, `--primary-dark`, `--primary`, `--text-on-dark`, `--st-red-light`, `--error-dark`, `--st-disabled-light`, `--st-disabled-dark`.

## Для разработчиков (выжимка)

### Точные размеры (redline)
Таблица рендерится на странице через getComputedStyle. Точные значения — в CSS-файле компонента (см. `css:` в шапке).

### Разметка · HTML (эталонная реализация ДС)

```
<span class="stepmark stepmark--m" aria-hidden="true">
  <span class="stepmark__num">1</span>
  <i class="stepmark__icon" data-icon="check"></i>
</span>

<!-- готов -->
<span class="stepmark stepmark--m stepmark--done" aria-hidden="true">…</span>

<!-- шаг бывает с ошибкой: глиф ошибки в разметке -->
<span class="stepmark stepmark--m stepmark--error" aria-hidden="true">
  <span class="stepmark__num">2</span>
  <i class="stepmark__icon" data-icon="check"></i>
  <i class="stepmark__icon stepmark__icon--error" data-icon="alert-circle"></i>
</span>
```

### Справочник классов и атрибутов

| Класс/атрибут | Назначение |
|---|---|
| `.stepmark` | корень — кружок |
| `.stepmark--s` / `--m` / `--l` | размер: 20 / 24 / 32 |
| `.stepmark__num` | номер шага |
| `.stepmark__icon` | глиф готовности (`check`) |
| `.stepmark__icon--error` | глиф ошибки (`alert-circle`), опц. |
| `.stepmark--current` / `--done` / `--error` / `--disabled` | состояние на самом маркере |
| `.stepform__step[data-state]` | состояние от шага StepForm: `pending` · `current` · `done` · `error` · `disabled` |

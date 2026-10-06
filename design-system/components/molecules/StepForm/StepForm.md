---
component: StepForm
title: "Пошаговая форма"
version: "1.000"
updated: "06.10.2026"
page: components/molecules/StepForm/StepForm.html
page_js: components/molecules/StepForm/StepForm.page.js
css: components/molecules/StepForm/StepForm.css
status: curated
---

> Спека для быстрого контекста. Источник истины — CSS-файл и страница компонента. При изменении компонента обновляй эту спеку и блок в specs/_cheatsheet.md.

## Назначение
Форма из шагов: слева номер шага (StepMarker) и подпись, справа контролы — любые поля ДС (InputText M, чипы Chip), шаги разделены пунктиром, внизу опц. заметка (Note). Шаг заполнен — номер сменяется галочкой. На узкой форме подпись встаёт над контролами. Перенесена из конструктора запроса AI Pitcher (прототип ai-bankster v02, задача MS0010h).

## Инварианты
- Своего фона, рамки и полей нет — их даёт контейнер (в прототипе — панель поля ввода промпта).
- Колонка подписи общая у всех шагов: равна самой длинной подписи, но не шире трети формы (`fit-content(33%)`, шаг — `subgrid`); длиннее — подпись переносится.
- Строка подписи высотой 40 (`--space-40`) — по высоте поля M: в StepForm поля M. Поля S — бэклог. Поле — на всю ширину колонки контролов: `.inp--fullwidth` (у InputText ширина по умолчанию 280px).
- Шаги разделяет сам компонент — пунктир 1px `--border-light` с отступом 12 сверху; у первого шага линии нет. Разделитель `hr` между шагами не ставится.
- Состояние шага — атрибут `data-state` на `.stepform__step` (`pending` · `current` · `done` · `error` · `disabled`). Маркер внутри красится сам (StepMarker), экран меняет только атрибут — параллельных классов на маркере нет.
- Статус шага для скринридера — скрытый текст `.stepform__status--done` («выполнено») / `--error` в подписи: компонент показывает его только в своём состоянии.
- Блок на всю ширину шага (`.stepform__wide`) — класс на самом блоке: скрытый блок (`hidden`) не оставляет пустой строки.
- Форма уже 840px — подпись над контролами (container query по ширине самой формы, контейнер `stepform`).

## Ключевые правила (из разделов страницы)
- **Использование** — форма, разбитая на шаги, где порядок важен: конструктор запроса, мастер настройки в панели. Не для обычной формы полей (там поля с метками) и не для навигации по экранам (Stepper, бэклог).
- **Анатомия** — `.stepform` → `.stepform__step` (`.stepform__label`: StepMarker + `.stepform__title` + `.stepform__status`; `.stepform__control`; опц. `.stepform__wide`) × N → опц. `p.note.stepform__foot`.
- **Варианты** — состав контролов шага: поле · чипы · поле и чипы; блок на всю ширину; подвал; опция появления `.stepform--appear`.
- **Размеры** — один размер: подпись Body S Strong, строка 40, зазоры колонок 16 и строк 8, отступ шага 12; поля M.
- **Контент** — название шага — существительное или короткая фраза; контролы — компоненты ДС.
- **Поведение** — узкая форма (< 840px) — подпись над контролами; `.stepform--appear`: закрытая панель (`[inert]`) — форма прозрачна и сдвинута на 16 вверх, открытие — проявление 0,25 с и сдвиг 0,55 с с задержкой 0,06 с, шаги лесенкой 145 / 200 / 255 мс, `cubic-bezier(.22, 1, .36, 1)`; блок на всю ширину появляется так же (0,4 с) при показе; `prefers-reduced-motion` — без анимации.
- **Состояния** — шага: ожидает · текущий · готов · ошибка · недоступен (название `--text-inactive`, контролы выключает экран).
- **Доступность** — шаг — `section` с `aria-labelledby` на подпись (название + скрытый статус); контролы шага подписаны названием шага (`aria-labelledby` на `.stepform__title`) — у поля без своей метки это обязательно; маркер `aria-hidden`.
- **Типографика** — подпись `--type-body-s-strong`; подвал — Note S (`--type-body-s`).
- **Цвета** — подпись `--text-primary` (недоступен — `--text-inactive`), пунктир `--border-light`; маркер и заметка — по своим спекам.

## Для разработчиков (выжимка)

### Точные размеры (redline)
Таблица рендерится на странице через getComputedStyle. Точные значения — в CSS-файле компонента (см. `css:` в шапке).

### Разметка · HTML (эталонная реализация ДС)

```
<div class="stepform stepform--appear" role="group" aria-label="Конструктор запроса">
  <section class="stepform__step" data-state="pending" aria-labelledby="stObjectLabel">
    <div class="stepform__label" id="stObjectLabel">
      <span class="stepmark stepmark--m" aria-hidden="true"><span class="stepmark__num">1</span><i class="stepmark__icon" data-icon="check"></i></span>
      <span class="stepform__title" id="stObjectTitle">Объект анализа</span>
      <span class="stepform__status stepform__status--done">выполнено</span>
    </div>
    <div class="stepform__control">
      <div class="inp inp--m inp--fullwidth">
        <div class="inp__field">
          <span class="inp__lead" aria-hidden="true"><i data-icon="client-search"></i></span>
          <input class="inp__control" type="text" role="searchbox" placeholder="Компания, группа или отрасль" aria-labelledby="stObjectTitle">
        </div>
      </div>
      <div class="chiplist" role="radiogroup" aria-labelledby="stObjectTitle">…Chip…</div>
    </div>
    <section class="tile tile--inset stepform__wide" hidden>…</section>
  </section>
  <section class="stepform__step" data-state="pending" aria-labelledby="stFocusLabel">…</section>
  <p class="note note--s note--accent stepform__foot">
    <span class="note__icon" aria-hidden="true"><i data-icon="clock-timer"></i></span>
    <span class="note__text">Подготовка отчета обычно занимает до 30 минут.</span>
  </p>
</div>
```

### Справочник классов и атрибутов

| Класс/атрибут | Назначение |
|---|---|
| `.stepform` | корень: грид из двух колонок (подпись `fit-content(33%)` · контролы), контейнер `stepform` |
| `.stepform--appear` | опция: появление из прототипа (по снятию `inert` с панели) |
| `.stepform__step` | шаг: подсетка формы, пунктир сверху (у первого нет) |
| `[data-state]` | состояние шага: `pending` · `current` · `done` · `error` · `disabled` |
| `.stepform__label` | подпись: маркер + название, строка 40 |
| `.stepform__title` | название шага; на него ссылаются контролы (`aria-labelledby`) |
| `.stepform__status--done` / `--error` | скрытый статус для скринридера |
| `.stepform__control` | колонка контролов шага, зазор 8 |
| `.stepform__wide` | блок на всю ширину шага (ставится на сам блок) |
| `.stepform__foot` | подвал — Note под пунктиром |

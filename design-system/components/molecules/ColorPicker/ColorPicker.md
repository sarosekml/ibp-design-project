---
component: ColorPicker
title: "Выбор цвета"
version: "1.002"
updated: "08.10.2026"
page: components/molecules/ColorPicker/ColorPicker.html
page_js: components/molecules/ColorPicker/ColorPicker.page.js
runtime: components/molecules/ColorPicker/ColorPicker.js
css: components/molecules/ColorPicker/ColorPicker.css
deps: [slider, input-text, icon-button, button, popover]
status: curated
---

## Назначение
Выбор одного цвета в sRGB, как у coolors: поле насыщенности и яркости, ползунок тона, строка Hex с плашкой цвета, IconButton «Пипетка» и «Копировать». Открывается в Popover (`bind`) или размещается в форме (`create`). 1.001 — компактный вид для конструктора тем (MS0013, Р29).

## Инварианты
- Подключать Slider, InputText/Inputs, Popover и DSCopy перед ColorPicker.
- Внешний обработчик сохраняет цвет; пикер не пишет файлы и не хранит черновики.
- `onChange` — каждое промежуточное значение (тянут маркер или ползунок), `onCommit` — законченная правка (отпустили, Enter, уход из поля, пипетка). История правок у потребителя строится по `onCommit`.
- Повторный `bind` того же триггера перенастраивает живой пикер (`configure`), второй поповер не создаётся.
- Функциональные цвета (градиенты SV и тона, кольцо маркера `#FFFFFF` с тенью `rgba(0, 0, 0, .4)`) и значение без `value` — `#000000` — исключение из правила «hex только в Colors.css»: это сами значения цвета, а не хром, и от темы они не зависят.

## Ключевые правила (из разделов страницы)
- **Использование** — Для правки цвета. Имя роли и её назначение задаёт окружающая форма.
- **Анатомия** — SV-поле с маркером, Slider тона без подписи, строка: InputText S (`.inp__lead` — плашка цвета `.cpk__swatch`) + IconButton `dropper` + IconButton `copy`; подвал `.cpk__foot` — слот потребителя (`footer`) и «Сбросить» (`onReset`).
- **Варианты** — в форме `create(root, opts)`; у триггера `bind(trigger, opts)` открывает Popover M (320). После `bind` триггер сам открывает и закрывает пикер по клику; `open()` — только программно (первый клик, в котором вызван `bind`). Позиция — `opts.popover { placement, align }`.
- **Размеры** — SV — квадрат во всю ширину пикера (в Popover M — 288 × 288), маркер 14px; Popover M 320px, тело без прокрутки; поле InputText S, IconButton M; между подложками кнопок и до поля Hex — 8px.
- **Контент** — Hex принимает «18a59e», «#18A59E» и «#abc»; ошибка формата — текстом, только по Enter или уходу из поля.
- **Поведение** — SV — pointer drag; стрелки меняют S/V на 1%, Shift на 10%. Тон — Slider; Hex применяется сразу после полного корректного ввода.
- **Состояния** — Default, focus, disabled, некорректный Hex; отмена пипетки сохраняет цвет.
- **Доступность** — SV — role=slider с aria-valuetext; тон и Hex имеют label. Без EyeDropper кнопка скрыта.
- **Типографика** — Подписи полей — LabelHelper, кнопки — Buttons; компоненты используют шрифты ДС.
- **Цвета** — Цветовое поле показывает функциональные значения HSV; хром — цвета ДС. Только непрозрачный sRGB, альфа не редактируется.

## Для разработчиков (выжимка)

### Точные размеры (redline)
Источник — ColorPicker.css; таблица на странице из getComputedStyle.

### Разметка · HTML (эталонная реализация ДС)
```html
<button id="color" type="button" class="btn btn--outline btn--m"><span class="btn__label">Выбрать цвет</span></button>
<!-- create() строит: .cpk > .cpk__sv(.cpk__marker) + .slr.cpk__hue + .cpk__row(.inp.inp--s.cpk__hex, .ibtn[data-pick], .ibtn[data-copy]) + .cpk__foot -->
```

### Поведение · псевдокод (framework-agnostic)
```js
DSColorPicker.bind(document.getElementById('color'), {
  value: '#18A59E',
  onChange: function (hex) { /* живой предпросмотр */ },
  onCommit: function (hex) { /* законченная правка */ }
}).open();
```

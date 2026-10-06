---
component: ColorPicker
title: "Выбор цвета"
version: "1.000"
updated: "07.10.2026"
page: components/molecules/ColorPicker/ColorPicker.html
page_js: components/molecules/ColorPicker/ColorPicker.page.js
runtime: components/molecules/ColorPicker/ColorPicker.js
css: components/molecules/ColorPicker/ColorPicker.css
deps: [slider, input-text, button, popover]
status: curated
---

## Назначение
Выбор одного цвета в sRGB: поле насыщенности и яркости, тон, Hex, пипетка и копирование. Открывается в Popover или размещается в форме.

## Инварианты
- Подключать Slider, InputText/Inputs, Popover и DSCopy перед ColorPicker.
- Внешний обработчик сохраняет цвет; пикер не пишет файлы и не хранит черновики.

## Ключевые правила (из разделов страницы)
- **Использование** — Для правки цвета. Имя роли и её назначение задаёт окружающая форма.
- **Анатомия** — SV-поле, маркер, Slider тона, InputText Hex, кнопки пипетки и копирования.
- **Варианты** — В форме create(root,opts); у триггера bind(trigger,opts) открывает Popover M.
- **Размеры** — SV 160px по высоте; Popover M 320px; поля InputText M.
- **Контент** — Hex #RRGGBB; ошибка формата показана текстом. Начальный цвет обязателен.
- **Поведение** — SV — pointer drag; стрелки меняют S/V на 1%, Shift на 10%. Тон — Slider; Hex работает сразу после полного корректного ввода.
- **Состояния** — Default, focus, disabled, некорректный Hex; отмена пипетки сохраняет цвет.
- **Доступность** — SV — role=slider с aria-valuetext; тон и Hex имеют label. Без EyeDropper кнопка скрыта.
- **Типографика** — Подписи полей — LabelHelper, кнопки — Buttons; компоненты используют шрифты ДС.
- **Цвета** — Цветовое поле показывает функциональные значения HSV; хром — цвета ДС. Только непрозрачный sRGB, альфа не редактируется.

## Для разработчиков (выжимка)

### Точные размеры (redline)
Источник — ColorPicker.css; таблица на странице из getComputedStyle.

### Разметка · HTML (эталонная реализация ДС)
```html
<button id="color" type="button">Выбрать цвет</button>
```

### Поведение · псевдокод (framework-agnostic)
```js
DSColorPicker.bind(document.getElementById('color'), { value: '#7F56D9', onChange: function(hex) { console.log(hex); } });
```

---
component: Slider
title: "Ползунок"
version: "1.000"
updated: "07.10.2026"
page: components/atoms/Slider/Slider.html
page_js: components/atoms/Slider/Slider.page.js
runtime: components/atoms/Slider/Slider.js
css: components/atoms/Slider/Slider.css
deps: [label-helper]
status: curated
---

## Назначение
Непрерывное числовое значение: трек, бегунок, метка и текущая величина. Нативный range обеспечивает клавиатуру и поддержку вспомогательных технологий.

## Инварианты
- Задавать min, max, step и доступную метку нативному range.
- Не заменять range перетаскиваемым div: клавиатура принадлежит нативному контролу.

## Ключевые правила (из разделов страницы)
- **Использование** — Для диапазона одного значения; дискретный выбор нескольких вариантов — ButtonGroup.
- **Анатомия** — Метка и output над треком, нативный input type=range.
- **Варианты** — Обычный трек или функциональный градиент через --slr-track.
- **Размеры** — Трек 4px, бегунок 16px, область ввода 32px; ширина по контейнеру.
- **Контент** — Метка называет величину. Единица — data-unit, границы — min/max.
- **Поведение** — Стрелки меняют на step; Home/End — край диапазона; PageUp/PageDown — крупный шаг.
- **Состояния** — Default, hover, focus-visible, disabled. Выключенный input сохраняет значение.
- **Доступность** — Обязателен label[for] или aria-label. output связан атрибутом for.
- **Типографика** — Body XS — подпись и значение, табличные цифры.
- **Цвета** — Трек --primary/--border-light, бегунок --primary, контур --bg-tile. Градиент — смысловая шкала, хром от темы.

## Для разработчиков (выжимка)

### Точные размеры (redline)
Источник — Slider.css; таблица на странице из getComputedStyle.

### Разметка · HTML (эталонная реализация ДС)
```html
<div class="slr" data-unit="%"><div class="slr__head"><label for="demo-slider">Насыщенность</label><output class="slr__value" for="demo-slider"></output></div><input type="range" class="slr__input" id="demo-slider" min="0" max="100" step="1" value="50"></div>
```

### Поведение · псевдокод (framework-agnostic)
```js
DSSlider.bindAll();
DSSlider.bind(document.querySelector('.slr')).set(75);
```

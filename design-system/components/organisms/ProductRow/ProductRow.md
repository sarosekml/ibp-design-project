---
component: ProductRow
title: "ProductRow"
version: "1.001"
updated: "30.09.2026"
page: components/organisms/ProductRow/ProductRow.html
runtime: components/organisms/ProductRow/ProductRow.js
css: components/organisms/ProductRow/ProductRow.css
deps: [icon-button, context-menu, tooltip, skeleton]
status: curated
---

> Спека для быстрого контекста. Источник истины — CSS-файл и страница компонента. При изменении компонента обновляй эту спеку и блок в specs/_cheatsheet.md.

## Назначение
Строка иерархического списка объектов: заголовок с номером, необязательные строка статуса и строка значений (иконка + значение), действия справа. Строки собираются в дерево `.prow-tree`: вложенная строка на 24px уже родителя, ветку можно свернуть. Предметной области компонент не знает — какие объекты в строках, как они нумеруются и какие действия у каждого уровня, решает потребитель.

## Инварианты
- Корни `.prow`, `.prow-tree`, `.prow-tree__node`, `.prow-tree__group` объявляют парное `[hidden] { display: none }` — правило B11 линтера.
- Рамка — внутренняя тень, а не `border`: смена рамки на наведении и её отсутствие у корневой строки не сдвигают содержимое.
- Кнопки в `<a>` не вкладываются: у объекта со своей страницей ссылкой становится заголовок `a.prow__title.prow__title--link`, его `::after` растягивает зону клика на строку, ведущий слот, метка и действия подняты над ней.
- Группа детей корневого узла не сдвигается: корень и его дети одной ширины; каждый следующий уровень — на 24px уже.
- Метка `.prow__mark` — своя кнопка строки, не IconButton: в нажатом положении меняется только глиф (`star` → `star-filled`), цвет остаётся `--secondary`.
- Пустое значение — прочерк «–» на месте значения; пара «иконка + значение» не скрывается.

## Ключевые правила (из разделов страницы)
- **Использование** — иерархия объектов в 2–4 уровня с действиями по уровням; строки списка выбора в окне (колонки «доступно / выбрано»). Плоский список с иконкой или аватаром — Entity; данные с колонками и деревом строк таблицы — Table; сворачиваемые разделы страницы — Tile-аккордеон.
- **Анатомия** — `.prow` = `.prow__lead` (`.prow__toggle`) · `.prow__main` (`.prow__head`: `.prow__title`, `.prow__mark`; `.prow__status`; `.prow__meta` / `.prow__meta-item`) · `.prow__actions`. Обязательны строка и заголовок. Дерево: `ul.prow-tree` → `li.prow-tree__node` → `.prow` + `ul.prow-tree__group`. В списке выбора окна кнопка сворачивания корневой строки может стоять последней в `.prow__actions` — рантайм находит её в любом месте строки.
- **Варианты** — обычная строка и корневая `.prow--root` (без рамки в покое, жирный заголовок); заливка `.prow--tinted` (смысл назначает потребитель); заголовок-ссылка `.prow__title--link`; состав: только заголовок · со значениями · со статусом и значениями; набор действий — решение потребителя (IconButton L и кебаб).
- **Размеры** — один размер. Высота: 48px (только заголовок), 72px (со значениями), 92px (со статусом и значениями). Поля 12/16 (`--space-12`/`--space-16`), радиус 4px (`--radius-xs`), кнопки 24px с зазором 8, от заголовка до действий 16, зазор рядов содержимого 4, иконка значения 20 / статуса 16, иконка ↔ текст пары 8, пары значений через 16, ширина пары не меньше иконки и 10 знаков. Сверено с макетом 30.09.2026. Дерево: отступ уровня 24 (`--space-24`), строки в ветке через 8, корневые узлы через 16.
- **Контент** — номер и название одним текстом, номер формирует потребитель; заголовок переносится по словам, не усекается; единица или код валюты — `.prow__meta-affix`; пары значений переносятся на следующий ряд в узком контейнере; действия не сжимаются.
- **Поведение** — сворачивание ветки кнопкой `.prow__toggle` (рантайм, делегирование, событие `prowtoggle`); наведение на любую строку — рамка `--primary`; строка-ссылка — клик по строке ведёт на страницу объекта, заголовок на наведении `--primary`; метка — переключатель, правило «одна на дерево» у потребителя; строка списка выбора (`role="radio"` или `"checkbox"` с `aria-checked`) выбирается кликом, правило выбора — у потребителя. Рамка `.15s`, шеврон `.18s`, при `prefers-reduced-motion` без переходов; ветка скрывается без анимации высоты.
- **Состояния** — обычное · наведение (`:hover`, для витрины `.is-hover`) · с заливкой · наведение с заливкой · выбранная в списке выбора (`aria-checked="true"`, для витрины `.is-selected`) · выключенное (`aria-disabled="true"` на строке, `disabled` на её кнопках; перекрывает выбранную) · загрузка (`aria-busy`, `.sk-line` в ряду заголовка) · ветка свёрнута (`.prow-tree__node--collapsed`).
- **Доступность** — дерево на вложенных `<ul>`/`<li>`, навигация порядком Tab; кнопка сворачивания — `aria-expanded`, `aria-controls`, подпись «Свернуть»/«Развернуть» (ставит рантайм); метка — `aria-pressed` + `aria-label`, в просмотре `<span>`; IconButton — `aria-label` и `data-tooltip`; фокус строки-ссылки — обводка 2px `--primary` по всей строке; строка списка выбора — `role="radio"`/`"checkbox"`, `aria-checked`, `tabindex`, фокус — обводка 2px `--primary`.
- **Типографика** — заголовок `--type-body-m`, корневой `--type-body-l-strong`, значения `--type-body-s`, статус `--type-body-xs`.
- **Цвета** — рамка `--border-primary`, наведение `--primary` (Active Primary макета), выключенная `--disabled-border`; заливка `--tertiary-bg-light`; выбранная — подложка `--primary-bg` и рамка `--primary`; заголовок `--text-primary`, значение `--text-secondary`, единица, статус и выключенный текст `--text-inactive`; иконки `--secondary`, шеврон и метка на наведении `--secondary-dark`, иконка статуса «выполнено» `--success`.

## Диагностика
- «Строка прыгает на 1px при наведении» → рамка задана `border`, а не внутренней тенью компонента
- «Клик по кнопке строки-ссылки уводит на страницу» → кнопка вложена в `<a>`; ссылкой должен быть только `.prow__title--link`
- «Вложенная ветка не сворачивается» → кнопка `.prow__toggle` стоит не в строке узла `.prow-tree__node`, либо у узла нет `.prow-tree__group`
- «Дети корня сдвинуты на 24px» → группа детей корня не прямой потомок узла корня `.prow-tree > .prow-tree__node`

## Для разработчиков (выжимка)

### Точные размеры (redline)
Таблица рендерится на странице через getComputedStyle. Точные значения — в CSS-файле компонента (см. `css:` в шапке).

### Разметка · HTML (эталонная реализация ДС)

```html
<ul class="prow-tree">
  <li class="prow-tree__node">
    <div class="prow prow--root">
      <div class="prow__lead">
        <button type="button" class="prow__toggle" aria-expanded="true" aria-label="Свернуть"><i data-icon="chevron-up"></i></button>
      </div>
      <div class="prow__main">
        <div class="prow__head">
          <span class="prow__title">1. Раздел</span>
          <button type="button" class="prow__mark" aria-pressed="true" aria-label="Основная строка"><i data-icon="star-filled"></i></button>
        </div>
      </div>
      <div class="prow__actions">
        <button type="button" class="ibtn ibtn--neutral ibtn--l" aria-label="Добавить" data-tooltip="Добавить"><i data-icon="add-circle"></i></button>
        <span class="menu-anchor">
          <button type="button" class="ibtn ibtn--neutral ibtn--l" aria-label="Действия" data-menu="m1" data-menu-align="end"><i data-icon="more-dots"></i></button>
          <div id="m1" class="menu menu--floating" role="menu" hidden>…</div>
        </span>
      </div>
    </div>
    <ul class="prow-tree__group">
      <li class="prow-tree__node">
        <div class="prow prow--tinted">
          <div class="prow__main">
            <div class="prow__head"><a class="prow__title prow__title--link" href="…">1.1. Позиция</a></div>
            <div class="prow__status prow__status--success"><i data-icon="check-circle-filled"></i><span class="prow__status-text">Выполнено 12.01.2021</span></div>
            <div class="prow__meta">
              <span class="prow__meta-item"><i data-icon="calendar"></i><span class="prow__meta-text">22.04.2024</span></span>
              <span class="prow__meta-item"><i data-icon="bar-chart-square"></i><span class="prow__meta-text">800 000,00 <span class="prow__meta-affix">RUB</span></span></span>
            </div>
          </div>
          <div class="prow__actions">…</div>
        </div>
      </li>
    </ul>
  </li>
</ul>
```

### Поведение · псевдокод (framework-agnostic)

```
indent(node) = level(node) <= 1 ? 0 : (level(node) - 1) * 24px   // корень — уровень 0
on click(.prow__toggle в строке узла):
  collapsed = !collapsed
  node.group.hidden = collapsed
  toggle.aria-expanded = !collapsed; toggle.aria-label = collapsed ? 'Развернуть' : 'Свернуть'
  emit('prowtoggle', { collapsed })                    // всплывает с узла
on click(.prow__mark):                                 // решает потребитель
  pressed = !pressed; glyph = pressed ? 'star-filled' : 'star'
```

Рантайм: `window.DSProductRow = { wire(nodeEl, opts) → api, wireAll(root), toggle(nodeEl, collapsed) }`; `api = { el, toggle(v), collapsed() }`; `opts = { collapsed, onToggle(collapsed, node) }`. Клик по `.prow__toggle` обрабатывается делегированием — перерисованное дерево повторной привязки не требует; кнопка вне дерева только переключает `aria-expanded` и шлёт событие со строки.

### Справочник классов и атрибутов

| Класс/атрибут | Назначение |
|---|---|
| `.prow` | корень строки: flex, поля 12/16, рамка внутренней тенью, радиус 4 |
| `.prow--root` | корневая строка: без рамки в покое, заголовок Body L Strong |
| `.prow--tinted` | заливка `--tertiary-bg-light` |
| `.is-hover` | форс-наведение для витрины |
| `[aria-checked="true"]` · `.is-selected` | выбранная строка списка выбора: подложка `--primary-bg`, рамка `--primary` |
| `[aria-disabled="true"]` | выключенная строка: рамка `--disabled-border`, текст `--text-inactive`, наведение и ссылка не работают |
| `.prow__lead` | ведущий слот, отступ 4 до содержимого |
| `.prow__toggle` | кнопка сворачивания ветки 24px, глиф `chevron-up` (поворот у свёрнутой) |
| `.prow__main` | колонка содержимого, зазор 4 |
| `.prow__head` | ряд заголовка от 24px: заголовок и метка через 8 |
| `.prow__title` | заголовок Body M, переносится |
| `.prow__title--link` | заголовок-ссылка `<a>`: зона клика на всю строку, на наведении строки `--primary` |
| `.prow__mark` | метка 24px (`button` с `aria-pressed` или `span`), глиф `star` / `star-filled` |
| `.prow__status` · `.prow__status-text` | строка статуса: иконка 16 + текст Body XS `--text-inactive` |
| `.prow__status--success` | иконка статуса цвета `--success` |
| `.prow__meta` | строка значений: пары через 16, перенос рядом 4 |
| `.prow__meta-item` · `.prow__meta-text` | пара: иконка 20 + текст Body S `--text-secondary`; ширина не меньше иконки и 10 знаков |
| `.prow__meta-affix` | единица или код валюты, `--text-inactive` |
| `.prow__actions` | действия: IconButton L и кебаб через 8, от заголовка 16 |
| `.prow-tree` | дерево `<ul>`: корневые узлы через 16 |
| `.prow-tree__node` | узел `<li>`: строка и группа детей через 8 |
| `.prow-tree__group` | группа детей `<ul>`: строки через 8, сдвиг 24 (у детей корня — 0) |
| `.prow-tree__node--collapsed` | ветка свёрнута: группа скрыта, шеврон вниз |
| `prowtoggle` | событие `{ collapsed }` с узла |

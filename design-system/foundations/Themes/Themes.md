---
component: Themes
title: "Темы (Themes)"
version: "1.013"
updated: "07.10.2026"
page: foundations/Themes/Themes.html
page_js: foundations/Themes/Themes.page.js
runtime: foundations/Themes/Themes.js
css: foundations/Themes/Themes.css
status: curated
---

## Назначение
Темы из JSON в tokens/. IBP Legacy совпадает с текущей ДС и не ставит data-theme;
IBP Neo строится из Brand #18A59E / Neutral #617179; Custom — сиреневая, её
тёмный профиль сохраняет прежнюю service. Service остаётся хромом панели.

## Инварианты
- Без выбранной темы нет data-theme и новых правил: текущие экраны сохраняются.
- Legacy и Neo не перезаписываются; конструктор сохраняет Custom или новую тему.
- Статусы и графики фиксированы; акцентные статусы следуют за Brand.
- Несохранённое существует только в памяти страницы; IndexedDB хранит handle папки.
- Имя старого токена меняется через роль; карта содержит все 119 имён.

## Ключевые правила (из разделов страницы)
- **Использование** — выбор в конструкторе и панели прототипа; плавающего окна нет.
- **Анатомия** — JSON: name, label, locked; light/dark: brand, neutral, adjust, overrides, onFill.
- **Варианты** — Light/Dark, у Legacy только Light; aliases ibp-light/ibp-dark → Neo.
- **Размеры** — 19 × 11 рамп, 160 ролей, 119 имён. Тема не меняет геометрию компонентов.
- **Контент** — Brand и Neutral в #RRGGBB; имена файлов — латиница, цифры, дефис.
- **Поведение** — OKLCH, уменьшение хромы в sRGB, генерация восьмью методами, история, ручные отклонения, файловое сохранение.
- **Состояния** — базовая, сохранена, не сохранено, ошибка записи; предупреждение beforeunload.
- **Доступность** — метки контролов, Slider и ColorPicker с клавиатурой, текстовое обозначение контраста и ручных правок.
- **Типографика** — шрифты ДС сохраняются.
- **Цвета** — 17 тонов базы; светлая из Colors.css (grey = mgrey, 950 = 900), тёмная из прежней ibp-dark. Генерируются только Brand/Neutral; обязательные пары корректируются, ручные отклонения остаются видимыми.

## Для разработчиков (выжимка)

### Источники и сборка
Ramp.tokens.js — математические преобразования. ThemeEngine.js — общий компилятор
для Node и браузера. Themes.tokens.js — роли, профили, карта, точечные правила;
tokens/*.json — файлы тем и базы; tokens.data.js — зеркало для file://.
`node design-system/tools/theme-build.mjs` собирает CSS и зеркало. `--check`
сверяет JSON, 119 legacy-имён, базу, контраст, монотонность и генераты; `--selftest`
проверяет алгоритм и падающие мутации. Исторические исключения статусов,
service и соответствующего custom-dark выводятся как INFO, не скрываются.

### Файловое сохранение
ThemeFiles.js: connect/restore/attach/read/save/download. FSA подключает папку
tokens один раз; в каждом сеансе проверяется разрешение. Запись защищает имена
базовых тем, не перезаписывает существующее имя через Save As, проверяет
конфликт изменений файла и пишет JSON + зеркало. Сбой зеркала откатывает JSON.
Firefox/Safari скачивают JSON; зеркало пересобирается Node-инструментом.
attach(handle) проверяет ту же запись на OPFS во встроенном браузере.

### API
```js
DSTheme.get(); // id или legacy
DSTheme.set('custom', 'dark');
DSTheme.set('ibp-dark'); // ibp-neo-dark
DSTheme.list(); // [{id,name,mode,label}]
DSTheme.files(); // [{name,label,locked,modes}]
DSTheme.selection(); // {name,mode,id}
DSTheme.preview(file, 'light'); // только до перезагрузки
DSTheme.reload(data); // после сохранения зеркало
document.addEventListener('ds:themechange', function(e) { /* e.detail.theme/name/mode */ });
```

### Разметка · HTML
```html
<!-- Обычный синхронный тег head; загрузчик приложений ставит его сам. -->
<script src="foundations/Themes/ThemeBoot.js"></script>
<div data-theme="ibp-neo-light">Компоненты ДС</div>
```

### Точечные правила
В rules: файл, селектор, свойство, from и роль. Все правила под data-theme и
низкоспецифичным :where; вложенная legacy возвращает исходные токены. Проверка
селекторов и исходных объявлений сохраняется. Роли --color-*/рампы --ramp-*
живут только в foundations/Themes.

## Бэклог
Третий цвет, Explore, ручная настройка статусов/графиков — вне MS0013.

# RE0005 · Э2 — словарь ролей и карта «старое → новое»

> Генерат `docs/misc/RE0005-themes/role-map.mjs`, руками не править: решения правятся в таблицах скрипта.
> Перезапуск из корня проекта: `node docs/misc/RE0005-themes/role-map.mjs`. Он же пишет `Themes.tokens.js` v1.
> Места — из замера Э1 (`audit.md`, `palette-audit.mjs`). Значений цвета здесь нет: их дают темы на Э4–Э6.

## 1. Сводка

| Что | Сколько |
|---|---|
| Ролей в словаре | 158 в 16 группах |
| Старых имён в карте | 119 из 119 |
| Ролей, на которые смотрит несколько старых имён (N → 1) | 1 |
| Ролей только из правил (старого имени нет) | 40 |
| Точечных правил (объявлений CSS) | 332: старое имя в другой роли 224, токен компонента 26, мимо токена 83 |
| Правил страниц ДС | по значению `style` 5 (483 мест), по селектору блока 22 |
| Фолбэки токенов в `style` страниц — перекрасятся сами | 108 мест |
| Не перекрашивается до переезда | CSS и JS ДС 47 мест; страницы ДС 669 мест |
| Тени `--elevation-*` | 6 — цвет через `--color-shadow`, непрозрачность прежняя |

## 2. Как читать карту

- **Основная роль** — значение старого имени в новой теме. Её получают все места, где правила нет: экраны и виджеты `apps/`, хаб, протопанель, страницы ДС.
- **Точечное правило** — место компонента, где старое имя работает в другой роли. Правило тем одно на все новые темы: в `[data-theme]` объявление получает значение из `value`. CSS компонента не меняется.
- **Группа класса**: fg — текст и иконка; border — граница; fill — заливка (фон); focus — граница и тень в состоянии фокуса; shadow — тень. Решение пользователя 02.10.2026: fg, граница, заливка и фокус — отдельные роли; статусы `--st-*` делятся только по уровню.
- **Граница парная**: рядом с заливкой того же имени — роль заливки, рядом с текстом — роль текста. **Глифы** (дуги спиннера, шевроны и точки из границ и фонов) остаются в роли своего имени.
- **Токен компонента** (`--btn-pale`, `--menu-item-hover`) получает правило в месте определения; если места его применения расходятся по ролям — ещё и в месте применения.

## 3. Спорные строки — согласовано с пользователем 02.10.2026

1. Наведение в ContextMenu (`--menu-item-hover` = `--tertiary`) приравнено к наведению в списке (`--color-bg-hover`, legacy `--tertiary-light`). В legacy меню при наведении темнее списка. — **принято**.
2. Статусы вне статусов: фон тоста (`--st-grey` → `--color-bg-inverse`), затемнение под тостом и модалкой (`--st-grey` → `--color-bg-scrim`), дорожка SubTab (`--st-system-light` → `--color-control-track`). Остальные `--st-*` вне чипов (маркеры колонок Kanban, скелетон, недоступные Tab, DatePicker, SegmentControl, InputText, полоса AllocationBar) остаются статусами. — **принято**.
3. `--text-on-dark` разделён: на цветной заливке — `--color-fg-on-fill` (основная), на инверсной поверхности — `--color-fg-inverse` (тултип, тост, IconButton Contrast, инверсный спиннер). В тёмной теме инверсная поверхность светлая, заливка — нет. — **принято**.
4. Граница парная: в одном правиле с заливкой того же имени граница берёт роль заливки (сплошная кнопка без кольца), с текстом — роль текста (у обводочной кнопки рамка цвета подписи). Отдельная роль границы — только у отдельной границы (поле с ошибкой, выбранный чип). — **принято**.
5. Нажатая ссылка тона (`color-mix(--info-dark 80 %, #000)` и т. п.) — новые роли `--color-<тон>-fg-pressed`. — **принято**.
6. Скелетон AllocationBar (`--cgrey-100`/`--cgrey-50`) → статус disabled, как у Skeleton. — **принято**.
7. Семь имён без применения — каждое со своей ролью: `--color-secondary-bg`, `--color-secondary-bg-subtle`, `--color-bg-muted-strong`, `--color-danger-bg-strong`, `--color-link-muted`, `--color-disabled-veil`, `--color-bg-tint` (с Э1 применён в apps/). — **принято**.

## 4. Словарь ролей

### Фон

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-bg-page` | Фон страницы и рабочей области; зоны внутри поверхности, которые продолжают фон страницы | `--bg-page` | 3 |
| `--color-bg-surface` | Поверхность: тайл, ячейка таблицы, поле ввода | `--bg-tile`, `--bg-table-default` | 5 |
| `--color-bg-raised` | Поднятая поверхность: меню, выпадающий список, поповер, модалка, Drawer | `--bg-popup` | — |
| `--color-bg-nav` | Панель навигации | `--bg-main-menu` | — |
| `--color-bg-inverse` | Инверсная поверхность: тултип, тост, подпись свёрнутой навигации | `--bg-hint` | 1 |
| `--color-bg-sunken` | Приглушённая зона внутри поверхности: шапка и подвал поповера, панель сплиттера, стенд документации | — | 8 |
| `--color-bg-muted` | Нейтральная плашка: аватар, бейдж, иконка Entity, полоса раздела Divider | `--tertiary` | 9 |
| `--color-bg-muted-strong` | Плотная нейтральная плашка (бывший --tertiary-dark; в ДС не применяется) | `--tertiary-dark` | — |
| `--color-bg-hover` | Наведение на нейтральный пункт: меню, список, «ещё» крошек, раскрытие строки | `--tertiary-light` | 2 |
| `--color-bg-pressed` | Нажатие на нейтральный пункт меню и списка | — | 2 |
| `--color-bg-selected-hover` | Наведение на выбранный пункт списка | — | 1 |
| `--color-bg-tint` | Нейтральная полупрозрачная подложка (8 %): плашка «Данные рассчитываются», наведение на иконку ReadOnlyField | `--tertiary-bg` | 1 |
| `--color-bg-tint-subtle` | Нейтральная полупрозрачная подложка (4 %): тонированная строка ProductRow | `--tertiary-bg-light` | — |
| `--color-bg-veil` | Светлая полупрозрачная вуаль поверх содержимого: окно периода в Chart | `--primary-bg-semy-transparent` | — |
| `--color-bg-scrim` | Затемнение под модалкой и тостом, подложка выезжающей навигации документации | — | 3 |

### Строки таблиц

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-row-hover` | Наведение на строку; на день календаря и строку AllocationBar | `--bg-table-default-hover` | — |
| `--color-row-selected` | Выбранная строка (в legacy — «focus») | `--bg-table-default-focus` | — |
| `--color-row-selected-hover` | Наведение на выбранную строку | — | 1 |
| `--color-row-accent` | Выделенная строка | `--bg-table-accent` | — |
| `--color-row-accent-hover` | Наведение на выделенную строку | `--bg-table-accent-hover` | — |
| `--color-row-accent-selected` | Выбранная выделенная строка | `--bg-table-accent-focus` | — |
| `--color-row-pinned` | Закреплённая колонка и шапка таблицы | `--bg-table-pinned` | 1 |
| `--color-row-pinned-hover` | Наведение на закреплённую колонку | `--bg-table-pinned-hover` | — |
| `--color-row-pinned-selected` | Выбранная ячейка закреплённой колонки | `--bg-table-pinned-focus` | — |

### Текст и иконки

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-fg-default` | Основной текст и иконки | `--text-primary` | — |
| `--color-fg-secondary` | Второстепенный текст и иконки: подписи, лейблы | `--text-secondary` | — |
| `--color-fg-muted` | Неактивный текст: плейсхолдер, недоступное, подсказка | `--text-inactive` | — |
| `--color-fg-on-fill` | Текст и иконки на цветной заливке: акцентная кнопка, бейдж, выбранный день, сплошной чип | `--text-on-dark` | 25 |
| `--color-fg-inverse` | Текст и иконки на инверсной поверхности: тултип, тост, кнопка-иконка Contrast, инверсный спиннер | — | 9 |
| `--color-fg-icon` | Иконка по умолчанию (правило ДС: цвет иконки — --secondary) | `--secondary` | — |
| `--color-fg-icon-strong` | Иконка при наведении, в выбранном пункте, у сортировки колонки | `--secondary-dark` | — |

### Границы

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-border-default` | Граница поля, контрастная линия Divider, ось графика | `--border-primary` | — |
| `--color-border-subtle` | Разделитель, граница тайла и таблицы, сетка графика | `--border-light` | 5 |
| `--color-border-strong` | Сильная граница: рамка чекбокса, нажатая карточка, курсор графика | `--border-dark` | — |

### Акцент

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-accent-fill` | Заливка акцентом: акцентная кнопка, выбранный чекбокс, заполнение прогресса | `--primary` | 2 |
| `--color-accent-fill-hover` | Наведение на заливку акцентом | `--primary-dark` | — |
| `--color-accent-fill-pressed` | Нажатие на заливку акцентом | — | 1 |
| `--color-accent-fg` | Текст и иконки акцентом: обводочная и прозрачная кнопка, выбранный пункт | — | 52 |
| `--color-accent-fg-strong` | Плотный акцентный текст: аватар Accent, выбранный чип, нажатая встроенная кнопка-иконка | — | 7 |
| `--color-accent-fg-pressed` | Текст и иконки нажатой обводочной и прозрачной кнопки | — | 10 |
| `--color-accent-border` | Отдельная акцентная граница и обводка-тень: выбранный чип и карточка, «сегодня» в календаре, место вставки | — | 20 |
| `--color-accent-muted` | Приглушённый акцент (бывший --primary-light; в CSS ДС не применяется, есть в apps/) | `--primary-light` | — |
| `--color-accent-bg` | Акцентная подложка (8 %): диапазон дат, выбранный пункт, плашка аватара и Entity Accent | `--primary-bg` | 5 |
| `--color-accent-bg-subtle` | Акцентная подложка (4 %): ореол наведения чекбокса, радио, переключателя, поля в фокусе | `--primary-bg-light` | 3 |
| `--color-accent-bg-hover` | Наведение на обводочную и прозрачную кнопку | — | 1 |
| `--color-accent-bg-pressed` | Нажатие на обводочную и прозрачную кнопку | — | 1 |
| `--color-accent-shadow` | Тень бегунка включённого переключателя | — | 3 |

### Ссылка

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-link` | Ссылка | `--link` | — |
| `--color-link-hover` | Наведение на ссылку | `--link-dark` | — |
| `--color-link-pressed` | Нажатая ссылка | — | 2 |
| `--color-link-muted` | Приглушённая ссылка (бывший --link-light; в ДС не применяется) | `--link-light` | — |

### Вторичный тон

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-secondary-bg` | Подложка вторичного тона, 32 % (бывший --secondary-bg; в ДС не применяется) | `--secondary-bg` | — |
| `--color-secondary-bg-subtle` | Подложка вторичного тона, 16 % (бывший --secondary-bg-light; в ДС не применяется) | `--secondary-bg-light` | — |

### Элементы управления

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-control-track` | Дорожка: выключенный переключатель, SegmentControl, SubTab, переключатели документации | — | 6 |
| `--color-control-track-hover` | Наведение на дорожку выключенного переключателя | — | 1 |
| `--color-control-track-on` | Дорожка включённого переключателя | `--secondary-light` | — |
| `--color-control-track-on-hover` | Наведение на включённый переключатель | — | 1 |
| `--color-control-thumb` | Бегунок переключателя | — | 5 |
| `--color-scrollbar` | Бегунок полосы прокрутки | — | 18 |
| `--color-focus-ring` | Кольцо фокуса и граница поля в фокусе | — | 45 |

### Неактивное

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-disabled-fill` | Заливка недоступного: акцентная кнопка, выбранный чекбокс, бейдж Muted | `--disabled` | — |
| `--color-disabled-border` | Граница недоступного: обводочная кнопка, рамка чекбокса | — | 4 |
| `--color-disabled-border-subtle` | Светлая граница недоступного: ProductRow | `--disabled-border` | — |
| `--color-disabled-bg` | Фон недоступного: дорожка переключателя, SegmentControl | `--disabled-bg` | — |
| `--color-disabled-veil` | Вуаль поверх недоступного (бывший --disabled-bg-semy-transparent; в ДС не применяется) | `--disabled-bg-semy-transparent` | — |

### Сообщения · danger

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-danger-fg` | Ошибка: текст и иконки | `--error` | — |
| `--color-danger-fg-strong` | Ошибка: плотный текст — нажатая обводочная кнопка, текст на подложке тона | `--error-dark` | — |
| `--color-danger-fg-pressed` | Ошибка: нажатая ссылка тона | — | 1 |
| `--color-danger-fg-inverse` | Ошибка: иконка на инверсной поверхности (тост) | — | 1 |
| `--color-danger-fill` | Ошибка: заливка — бейдж, акцентная кнопка тона | — | 10 |
| `--color-danger-fill-hover` | Ошибка: наведение на заливку | — | 6 |
| `--color-danger-fill-pressed` | Ошибка: нажатие на заливку | `--error-light` | — |
| `--color-danger-border` | Ошибка: отдельная граница — поле, рамка чекбокса | — | 7 |
| `--color-danger-bg` | Ошибка: подложка — нажатая обводочная кнопка, Alert | `--error-bg` | — |
| `--color-danger-bg-subtle` | Ошибка: светлая подложка — наведение, Alert | `--error-bg-light` | — |
| `--color-danger-bg-strong` | Ошибка: плотная подложка (бывший --error-bg-dark; в ДС не применяется) | `--error-bg-dark` | — |

### Сообщения · warning

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-warning-fg` | Предупреждение: текст и иконки | `--warning` | — |
| `--color-warning-fg-strong` | Предупреждение: плотный текст — нажатая обводочная кнопка, текст на подложке тона | `--warning-dark` | — |
| `--color-warning-fg-pressed` | Предупреждение: нажатая ссылка тона | — | 1 |
| `--color-warning-fill` | Предупреждение: заливка — бейдж, акцентная кнопка тона | — | 8 |
| `--color-warning-fill-hover` | Предупреждение: наведение на заливку | — | 4 |
| `--color-warning-fill-pressed` | Предупреждение: нажатие на заливку | `--warning-light` | — |
| `--color-warning-border` | Предупреждение: отдельная граница — поле, рамка чекбокса | — | 3 |
| `--color-warning-bg` | Предупреждение: подложка — нажатая обводочная кнопка, Alert | `--warning-bg` | 4 |

### Сообщения · success

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-success-fg` | Успех: текст и иконки | `--success` | — |
| `--color-success-fg-strong` | Успех: плотный текст — нажатая обводочная кнопка, текст на подложке тона | `--success-dark` | — |
| `--color-success-fg-pressed` | Успех: нажатая ссылка тона | — | 1 |
| `--color-success-fg-inverse` | Успех: иконка на инверсной поверхности (тост) | — | 1 |
| `--color-success-fill` | Успех: заливка — бейдж, акцентная кнопка тона | — | 11 |
| `--color-success-fill-hover` | Успех: наведение на заливку | — | 4 |
| `--color-success-fill-pressed` | Успех: нажатие на заливку | `--success-light` | — |
| `--color-success-bg` | Успех: подложка — нажатая обводочная кнопка, Alert | `--success-bg` | 4 |

### Сообщения · info

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-info-fg` | Информация: текст и иконки | `--info` | — |
| `--color-info-fg-strong` | Информация: плотный текст — нажатая обводочная кнопка, текст на подложке тона | `--info-dark` | — |
| `--color-info-fg-pressed` | Информация: нажатая ссылка тона | — | 1 |
| `--color-info-fg-inverse` | Информация: иконка на инверсной поверхности (тост) | — | 1 |
| `--color-info-fill` | Информация: заливка — бейдж, акцентная кнопка тона | — | 8 |
| `--color-info-fill-hover` | Информация: наведение на заливку | — | 4 |
| `--color-info-fill-pressed` | Информация: нажатие на заливку | `--info-light` | — |
| `--color-info-bg` | Информация: подложка — нажатая обводочная кнопка, Alert | `--info-bg` | 4 |

### Статусы

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-status-green-strong` | Статус зелёный, плотный: текст на подложке | `--st-green-dark` | — |
| `--color-status-green-solid` | Статус зелёный, основной: маркер, сплошная заливка | `--st-green` | — |
| `--color-status-green-mid` | Статус зелёный, средний (56 %) | `--st-green-mid` | — |
| `--color-status-green-soft` | Статус зелёный, мягкий (32 %) | `--st-green-midlight` | — |
| `--color-status-green-subtle` | Статус зелёный, светлый (16 %): подложка | `--st-green-light` | — |
| `--color-status-blue-strong` | Статус синий, плотный: текст на подложке | `--st-blue-dark` | — |
| `--color-status-blue-solid` | Статус синий, основной: маркер, сплошная заливка | `--st-blue` | — |
| `--color-status-blue-mid` | Статус синий, средний (56 %) | `--st-blue-mid` | — |
| `--color-status-blue-soft` | Статус синий, мягкий (32 %) | `--st-blue-midlight` | — |
| `--color-status-blue-subtle` | Статус синий, светлый (16 %): подложка | `--st-blue-light` | — |
| `--color-status-orange-strong` | Статус оранжевый, плотный: текст на подложке | `--st-orange-dark` | — |
| `--color-status-orange-solid` | Статус оранжевый, основной: маркер, сплошная заливка | `--st-orange` | — |
| `--color-status-orange-mid` | Статус оранжевый, средний (56 %) | `--st-orange-mid` | — |
| `--color-status-orange-soft` | Статус оранжевый, мягкий (32 %) | `--st-orange-midlight` | — |
| `--color-status-orange-subtle` | Статус оранжевый, светлый (16 %): подложка | `--st-orange-light` | — |
| `--color-status-red-strong` | Статус красный, плотный: текст на подложке | `--st-red-dark` | — |
| `--color-status-red-solid` | Статус красный, основной: маркер, сплошная заливка | `--st-red` | — |
| `--color-status-red-mid` | Статус красный, средний (56 %) | `--st-red-mid` | — |
| `--color-status-red-soft` | Статус красный, мягкий (32 %) | `--st-red-midlight` | — |
| `--color-status-red-subtle` | Статус красный, светлый (16 %): подложка | `--st-red-light` | — |
| `--color-status-purple-strong` | Статус фиолетовый, плотный: текст на подложке | `--st-dpurple-dark` | — |
| `--color-status-purple-solid` | Статус фиолетовый, основной: маркер, сплошная заливка | `--st-dpurple` | — |
| `--color-status-purple-mid` | Статус фиолетовый, средний (56 %) | `--st-dpurple-mid` | — |
| `--color-status-purple-soft` | Статус фиолетовый, мягкий (32 %) | `--st-dpurple-midlight` | — |
| `--color-status-purple-subtle` | Статус фиолетовый, светлый (16 %): подложка | `--st-dpurple-light` | — |
| `--color-status-grey-strong` | Статус серый, плотный: текст на подложке | `--st-grey-dark` | — |
| `--color-status-grey-solid` | Статус серый, основной: маркер, сплошная заливка | `--st-grey` | — |
| `--color-status-grey-mid` | Статус серый, средний (56 %) | `--st-grey-mid` | — |
| `--color-status-grey-soft` | Статус серый, мягкий (32 %) | `--st-grey-midlight` | — |
| `--color-status-grey-subtle` | Статус серый, светлый (16 %): подложка | `--st-grey-light` | — |
| `--color-status-system-strong` | Статус системный, плотный: текст на подложке | `--st-system-dark` | — |
| `--color-status-system-solid` | Статус системный, основной: маркер, сплошная заливка | `--st-system` | — |
| `--color-status-system-mid` | Статус системный, средний (56 %) | `--st-system-mid` | — |
| `--color-status-system-soft` | Статус системный, мягкий (32 %) | `--st-system-midlight` | — |
| `--color-status-system-subtle` | Статус системный, светлый (16 %): подложка | `--st-system-light` | — |
| `--color-status-disabled-strong` | Статус недоступный, плотный: текст на подложке | `--st-disabled-dark` | — |
| `--color-status-disabled-solid` | Статус недоступный, основной: маркер, сплошная заливка | `--st-disabled` | — |
| `--color-status-disabled-mid` | Статус недоступный, средний (56 %) | `--st-disabled-mid` | — |
| `--color-status-disabled-soft` | Статус недоступный, мягкий (32 %) | `--st-disabled-midlight` | 2 |
| `--color-status-disabled-subtle` | Статус недоступный, светлый (16 %): подложка | `--st-disabled-light` | 1 |
| `--color-status-accent-strong` | Статус акцентный, плотный: текст на подложке | `--st-primary-dark` | — |
| `--color-status-accent-solid` | Статус акцентный, основной: маркер, сплошная заливка | `--st-primary` | — |
| `--color-status-accent-mid` | Статус акцентный, средний (56 %) | `--st-primary-mid` | — |
| `--color-status-accent-soft` | Статус акцентный, мягкий (32 %) | `--st-primary-midlight` | — |
| `--color-status-accent-subtle` | Статус акцентный, светлый (16 %): подложка | `--st-primary-light` | — |

### Графики

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-chart-1` | Серия 1 (legacy --ch-blue) | `--ch-blue` | — |
| `--color-chart-2` | Серия 2 (legacy --ch-turquoise) | `--ch-turquoise` | — |
| `--color-chart-3` | Серия 3 (legacy --ch-indigo) | `--ch-indigo` | — |
| `--color-chart-4` | Серия 4 (legacy --ch-orange) | `--ch-orange` | — |
| `--color-chart-5` | Серия 5 (legacy --ch-pastel-green) | `--ch-pastel-green` | — |
| `--color-chart-6` | Серия 6 (legacy --ch-purple) | `--ch-purple` | — |
| `--color-chart-7` | Серия 7 (legacy --ch-light-blue) | `--ch-light-blue` | — |
| `--color-chart-8` | Серия 8 (legacy --ch-yellow) | `--ch-yellow` | — |
| `--color-chart-9` | Серия 9 (legacy --ch-shiny-green) | `--ch-shiny-green` | — |
| `--color-chart-10` | Серия 10 (legacy --ch-pink-purple) | `--ch-pink-purple` | — |
| `--color-chart-11` | Серия 11 (legacy --ch-red) | `--ch-red` | — |
| `--color-chart-12` | Серия 12 (legacy --ch-pale-purple) | `--ch-pale-purple` | — |

### Тень

| Роль | Назначение | Старые имена (основная роль) | Правил |
|---|---|---|---|
| `--color-shadow` | Цвет тени: --elevation-*, тени компонентов (непрозрачность — в месте применения) | — | 35 |

## 5. Карта 119 старых имён

Группы — как в `Palette.css`. «apps/» — ссылок в приложениях: им правил нет, они получают основную роль.

| Группа | Старое имя | Legacy | Основная роль | apps/ | Мест в другой роли |
|---|---|---|---|---|---|
| STATIC · BG | `--bg-popup` | #FFFFFF | `--color-bg-raised` | — | — |
| STATIC · BG | `--bg-tile` | #FFFFFF | `--color-bg-surface` | 63 | — |
| STATIC · BG | `--bg-main-menu` | #FEFEFE | `--color-bg-nav` | — | — |
| STATIC · BG | `--bg-hint` | #283237 | `--color-bg-inverse` | — | — |
| STATIC · BG | `--bg-page` | #F5F7F7 | `--color-bg-page` | 87 | — |
| STATIC · BGTable | `--bg-table-default` | #FFFFFF | `--color-bg-surface` | — | — |
| STATIC · BGTable | `--bg-table-default-hover` | #F6FAFA | `--color-row-hover` | 15 | — |
| STATIC · BGTable | `--bg-table-default-focus` | #DEEDEC | `--color-row-selected` | 15 | — |
| STATIC · BGTable | `--bg-table-accent` | #FFF8E1 | `--color-row-accent` | — | — |
| STATIC · BGTable | `--bg-table-accent-hover` | #FEF0C2 | `--color-row-accent-hover` | — | — |
| STATIC · BGTable | `--bg-table-accent-focus` | #FCE9AE | `--color-row-accent-selected` | — | — |
| STATIC · BGTable | `--bg-table-pinned` | #F5F7F7 | `--color-row-pinned` | 1 | — |
| STATIC · BGTable | `--bg-table-pinned-hover` | #EEF2F1 | `--color-row-pinned-hover` | — | — |
| STATIC · BGTable | `--bg-table-pinned-focus` | #DEEDEC | `--color-row-pinned-selected` | — | — |
| STATIC · Border | `--border-primary` | #B8CCCC | `--color-border-default` | 19 | — |
| STATIC · Border | `--border-light` | #E1EDE7 | `--color-border-subtle` | 131 | — |
| STATIC · Border | `--border-dark` | #6C8080 | `--color-border-strong` | — | — |
| STATIC · Border | `--disabled-border` | #E8EDED | `--color-disabled-border-subtle` | — | — |
| STATIC · Text | `--text-primary` | #324844 | `--color-fg-default` | 141 | 1 |
| STATIC · Text | `--text-secondary` | #6C8080 | `--color-fg-secondary` | 79 | — |
| STATIC · Text | `--text-inactive` | #AAB2B1 | `--color-fg-muted` | 47 | — |
| STATIC · Text | `--text-on-dark` | #FFFFFF | `--color-fg-on-fill` | 19 | 5 |
| ACTIVE · Primary | `--primary` | #00AA9B | `--color-accent-fill` | 192 | 117 |
| ACTIVE · Primary | `--primary-dark` | #0A7D6D | `--color-accent-fill-hover` | 31 | 7 |
| ACTIVE · Primary | `--primary-light` | #82CDC6 | `--color-accent-muted` | 10 | — |
| ACTIVE · Primary | `--primary-bg` | #00AA9B · 8% | `--color-accent-bg` | 6 | — |
| ACTIVE · Primary | `--primary-bg-light` | #00AA9B · 4% | `--color-accent-bg-subtle` | 1 | — |
| ACTIVE · Primary | `--primary-bg-semy-transparent` | #FFFFFF · 50% | `--color-bg-veil` | — | — |
| ACTIVE · Secondary | `--secondary` | #B8D6D3 | `--color-fg-icon` | 1 | 19 |
| ACTIVE · Secondary | `--secondary-dark` | #639994 | `--color-fg-icon-strong` | — | — |
| ACTIVE · Secondary | `--secondary-light` | #CDE2E0 | `--color-control-track-on` | — | — |
| ACTIVE · Secondary | `--secondary-bg` | #B8D6D3 · 32% | `--color-secondary-bg` | — | — |
| ACTIVE · Secondary | `--secondary-bg-light` | #B8D6D3 · 16% | `--color-secondary-bg-subtle` | — | — |
| ACTIVE · Tertiary | `--tertiary` | #E5ECEB | `--color-bg-muted` | — | — |
| ACTIVE · Tertiary | `--tertiary-dark` | #7A9994 | `--color-bg-muted-strong` | — | — |
| ACTIVE · Tertiary | `--tertiary-light` | #EEF2F1 | `--color-bg-hover` | — | 5 |
| ACTIVE · Tertiary | `--tertiary-bg` | #617C7C · 8% | `--color-bg-tint` | 1 | — |
| ACTIVE · Tertiary | `--tertiary-bg-light` | #617C7C · 4% | `--color-bg-tint-subtle` | — | — |
| SITUATIVE · Error | `--error` | #E5625C | `--color-danger-fg` | 7 | 18 |
| SITUATIVE · Error | `--error-light` | #E57373 | `--color-danger-fill-pressed` | — | — |
| SITUATIVE · Error | `--error-dark` | #D32F2F | `--color-danger-fg-strong` | 2 | 6 |
| SITUATIVE · Error | `--error-bg` | #FBECEB | `--color-danger-bg` | 3 | — |
| SITUATIVE · Error | `--error-bg-light` | #FCF1F1 | `--color-danger-bg-subtle` | — | — |
| SITUATIVE · Error | `--error-bg-dark` | #F6D8D7 | `--color-danger-bg-strong` | — | — |
| SITUATIVE · Warning | `--warning` | #FFB300 | `--color-warning-fg` | 1 | 12 |
| SITUATIVE · Warning | `--warning-light` | #FFCA28 | `--color-warning-fill-pressed` | — | — |
| SITUATIVE · Warning | `--warning-dark` | #FF8F00 | `--color-warning-fg-strong` | — | 4 |
| SITUATIVE · Warning | `--warning-bg` | #FFF8E1 | `--color-warning-bg` | — | — |
| SITUATIVE · Success | `--success` | #7CB342 | `--color-success-fg` | 1 | 11 |
| SITUATIVE · Success | `--success-light` | #9CCC65 | `--color-success-fill-pressed` | — | — |
| SITUATIVE · Success | `--success-dark` | #558B2F | `--color-success-fg-strong` | 2 | 4 |
| SITUATIVE · Success | `--success-bg` | #E9F6DA | `--color-success-bg` | — | — |
| SITUATIVE · Info | `--info` | #039BE5 | `--color-info-fg` | — | 8 |
| SITUATIVE · Info | `--info-light` | #29B6F6 | `--color-info-fill-pressed` | 3 | — |
| SITUATIVE · Info | `--info-dark` | #01579B | `--color-info-fg-strong` | — | 4 |
| SITUATIVE · Info | `--info-bg` | #EAF8FE | `--color-info-bg` | — | — |
| SITUATIVE · Link | `--link` | #00AA9B | `--color-link` | — | — |
| SITUATIVE · Link | `--link-light` | #82CDC6 | `--color-link-muted` | — | — |
| SITUATIVE · Link | `--link-dark` | #0A7D6D | `--color-link-hover` | — | — |
| SITUATIVE · Disabled | `--disabled` | #BEC5C8 | `--color-disabled-fill` | — | 4 |
| SITUATIVE · Disabled | `--disabled-bg` | #FBFBFB | `--color-disabled-bg` | — | — |
| SITUATIVE · Disabled | `--disabled-bg-semy-transparent` | #FFFFFF · 56% | `--color-disabled-veil` | — | — |
| STATUS · Green | `--st-green-dark` | #2E7D32 | `--color-status-green-strong` | — | — |
| STATUS · Green | `--st-green` | #4CAF50 | `--color-status-green-solid` | — | — |
| STATUS · Green | `--st-green-mid` | #4CAF50 · 56% | `--color-status-green-mid` | — | — |
| STATUS · Green | `--st-green-midlight` | #4CAF50 · 32% | `--color-status-green-soft` | — | — |
| STATUS · Green | `--st-green-light` | #4CAF50 · 16% | `--color-status-green-subtle` | — | — |
| STATUS · Blue | `--st-blue-dark` | #01579B | `--color-status-blue-strong` | — | — |
| STATUS · Blue | `--st-blue` | #03A9F4 | `--color-status-blue-solid` | — | — |
| STATUS · Blue | `--st-blue-mid` | #03A9F4 · 56% | `--color-status-blue-mid` | — | — |
| STATUS · Blue | `--st-blue-midlight` | #03A9F4 · 32% | `--color-status-blue-soft` | — | — |
| STATUS · Blue | `--st-blue-light` | #03A9F4 · 16% | `--color-status-blue-subtle` | — | — |
| STATUS · Orange | `--st-orange-dark` | #FF6F00 | `--color-status-orange-strong` | — | — |
| STATUS · Orange | `--st-orange` | #FFA000 | `--color-status-orange-solid` | — | — |
| STATUS · Orange | `--st-orange-mid` | #FFA000 · 56% | `--color-status-orange-mid` | 4 | — |
| STATUS · Orange | `--st-orange-midlight` | #FFA000 · 32% | `--color-status-orange-soft` | — | — |
| STATUS · Orange | `--st-orange-light` | #FFA000 · 16% | `--color-status-orange-subtle` | — | — |
| STATUS · Red | `--st-red-dark` | #D32F2F | `--color-status-red-strong` | — | — |
| STATUS · Red | `--st-red` | #EF5350 | `--color-status-red-solid` | — | — |
| STATUS · Red | `--st-red-mid` | #EF5350 · 56% | `--color-status-red-mid` | — | — |
| STATUS · Red | `--st-red-midlight` | #EF5350 · 32% | `--color-status-red-soft` | — | — |
| STATUS · Red | `--st-red-light` | #EF5350 · 16% | `--color-status-red-subtle` | — | — |
| STATUS · Purple | `--st-dpurple-dark` | #311B92 | `--color-status-purple-strong` | — | — |
| STATUS · Purple | `--st-dpurple` | #7E57C2 | `--color-status-purple-solid` | 9 | — |
| STATUS · Purple | `--st-dpurple-mid` | #7E57C2 · 56% | `--color-status-purple-mid` | 2 | — |
| STATUS · Purple | `--st-dpurple-midlight` | #7E57C2 · 32% | `--color-status-purple-soft` | — | — |
| STATUS · Purple | `--st-dpurple-light` | #7E57C2 · 16% | `--color-status-purple-subtle` | 6 | — |
| STATUS · Grey | `--st-grey-dark` | #131618 | `--color-status-grey-strong` | — | — |
| STATUS · Grey | `--st-grey` | #333F48 | `--color-status-grey-solid` | — | — |
| STATUS · Grey | `--st-grey-mid` | #333F48 · 56% | `--color-status-grey-mid` | — | — |
| STATUS · Grey | `--st-grey-midlight` | #333F48 · 32% | `--color-status-grey-soft` | — | — |
| STATUS · Grey | `--st-grey-light` | #333F48 · 16% | `--color-status-grey-subtle` | — | — |
| STATUS · System | `--st-system-dark` | #324844 | `--color-status-system-strong` | — | — |
| STATUS · System | `--st-system` | #7A9994 | `--color-status-system-solid` | — | — |
| STATUS · System | `--st-system-mid` | #7A9994 · 56% | `--color-status-system-mid` | — | — |
| STATUS · System | `--st-system-midlight` | #7A9994 · 32% | `--color-status-system-soft` | — | — |
| STATUS · System | `--st-system-light` | #7A9994 · 16% | `--color-status-system-subtle` | — | 1 |
| STATUS · Disabled | `--st-disabled-dark` | #324844 · 40% | `--color-status-disabled-strong` | — | — |
| STATUS · Disabled | `--st-disabled` | #324844 · 24% | `--color-status-disabled-solid` | — | — |
| STATUS · Disabled | `--st-disabled-mid` | #324844 · 16% | `--color-status-disabled-mid` | — | — |
| STATUS · Disabled | `--st-disabled-midlight` | #324844 · 8% | `--color-status-disabled-soft` | — | — |
| STATUS · Disabled | `--st-disabled-light` | #324844 · 4% | `--color-status-disabled-subtle` | — | — |
| STATUS · Primary | `--st-primary-dark` | #055143 | `--color-status-accent-strong` | — | — |
| STATUS · Primary | `--st-primary` | #00AA9B | `--color-status-accent-solid` | — | — |
| STATUS · Primary | `--st-primary-mid` | #00AA9B · 56% | `--color-status-accent-mid` | — | — |
| STATUS · Primary | `--st-primary-midlight` | #00AA9B · 32% | `--color-status-accent-soft` | — | — |
| STATUS · Primary | `--st-primary-light` | #00AA9B · 16% | `--color-status-accent-subtle` | — | — |
| CHART · CHART | `--ch-red` | #F99290 | `--color-chart-11` | 1 | — |
| CHART · CHART | `--ch-orange` | #F9A580 | `--color-chart-4` | 1 | — |
| CHART · CHART | `--ch-yellow` | #FFD081 | `--color-chart-8` | 1 | — |
| CHART · CHART | `--ch-shiny-green` | #8CCB5E | `--color-chart-9` | 8 | — |
| CHART · CHART | `--ch-pastel-green` | #76E385 | `--color-chart-5` | 1 | — |
| CHART · CHART | `--ch-turquoise` | #31D4A8 | `--color-chart-2` | 1 | — |
| CHART · CHART | `--ch-light-blue` | #7DCAFA | `--color-chart-7` | 8 | — |
| CHART · CHART | `--ch-blue` | #5B9CFA | `--color-chart-1` | 1 | — |
| CHART · CHART | `--ch-indigo` | #8D87F9 | `--color-chart-3` | 8 | — |
| CHART · CHART | `--ch-purple` | #CB88F8 | `--color-chart-6` | 1 | — |
| CHART · CHART | `--ch-pale-purple` | #F58BD8 | `--color-chart-12` | — | — |
| CHART · CHART | `--ch-pink-purple` | #EC7390 | `--color-chart-10` | — | — |

## 6. Решения «имя × группа → роль»

Прямые места CSS ДС (без токенов компонентов), где роль отличается от основной. Примеры — до трёх.

| Старое имя | Группа | Роль | Мест | Примеры |
|---|---|---|---|---|
| `--disabled` | border | `--color-disabled-border` | 4 | Buttons.css:138 `.btn--outline:disabled, .btn--outline.btn--disabled` border-color; Checkbox.css:153 `.cb--disabled .cb__mark, .cb__input:disabled ~ .cb__box .cb_` border-color; ButtonGroup.css:140 `.btn-group--outline.btn-group--disabled > .btn` border-color |
| `--error` | fill | `--color-danger-fill` | 10 | Badge.css:78 `.badge--error` background; Buttons.css:155 `.btn--error.btn--accent, .btn--danger.btn--accent` background; Buttons.css:155 `.btn--error.btn--accent, .btn--danger.btn--accent` border-color |
| `--error` | border | `--color-danger-border` | 4 | Checkbox.css:119 `.cb--error .cb__mark` border-color; Chip.css:356 `.chip--edit.chip--invalid:not(:is(.chip--disabled,[aria-disa` border-color; Inputs.css:93 `.inp--error .inp__field` border-color |
| `--error` | focus | `--color-danger-border` | 4 | ContextMenu.css:175 `.menu__item--danger:focus-visible, .menu__item--danger.is-fo` outline; Inputs.css:96 `.inp--error .inp__field:focus-within, .inp--error.is-focus .` border-color; Inputs.css:97 `.inp--error .inp__field:focus-within, .inp--error.is-focus .` box-shadow |
| `--error-dark` | fill | `--color-danger-fill-hover` | 6 | Buttons.css:158 `.btn--error.btn--accent:hover, .btn--danger.btn--accent:hove` background; Buttons.css:158 `.btn--error.btn--accent:hover, .btn--danger.btn--accent:hove` border-color; Buttons.css:228 `.btn--error.btn--accent.is-hover, .btn--danger.btn--accent.i` background |
| `--info` | fill | `--color-info-fill` | 8 | Badge.css:76 `.badge--info` background; Buttons.css:210 `.btn--info.btn--accent` background; Buttons.css:210 `.btn--info.btn--accent` border-color |
| `--info-dark` | fill | `--color-info-fill-hover` | 4 | Buttons.css:212 `.btn--info.btn--accent:hover` background; Buttons.css:212 `.btn--info.btn--accent:hover` border-color; Buttons.css:250 `.btn--info.btn--accent.is-hover` background |
| `--primary` | fg | `--color-accent-fg` | 52 | Badge.css:89 `.badge--text.badge--accent` color; Buttons.css:109 `.btn--outline` color; Buttons.css:110 `.btn--outline` border-color |
| `--primary` | focus | `--color-focus-ring` | 45 | Avatar.css:90 `.av--button:focus-visible` outline; Buttons.css:50 `.btn:focus-visible` outline; Checkbox.css:112 `.cb__input:focus-visible + .cb__box .cb__mark, .cb--focus .c` outline |
| `--primary` | border | `--color-accent-border` | 13 | Checkbox.css:89 `.cb:hover .cb__mark, .cb--hover .cb__mark` border-color; Chip.css:240 `.chip--selected` border-color; Chip.css:243 `.chip--edit.chip--selected:not(:is(.chip--disabled,[aria-dis` border-color |
| `--primary` | shadow | `--color-accent-border` | 7 | DatePicker.css:129 `.dpk__day--today .dpk__daynum` box-shadow; DatePicker.css:172 `.dpk__panel-cell--current` box-shadow; Kanban.css:306 `.kbcol.kbcol--drop` box-shadow |
| `--primary-dark` | fg | `--color-accent-fg-strong` | 7 | Avatar.css:84 `.av--accent` color; Avatar.css:85 `.av--accent .av__icon` color; Chip.css:240 `.chip--selected` color |
| `--secondary` | control | `--color-scrollbar` | 8 | ContextMenu.css:223 `.menu--scroll.is-scrolling` scrollbar-color; DropdownList.css:353 `.ddl--scroll.is-scrolling` scrollbar-color; Drawer.css:207 `.drawer__body.is-scrolling` scrollbar-color |
| `--secondary` | border | `--color-scrollbar` | 7 | Drawer.css:185 `.drawer__body.is-scrolling` border-color; Modal.css:238 `.modal__body.is-scrolling` border-color; NavPanel.css:117 `.nav__list.is-scrolling, .nav:hover .nav__list` border-color |
| `--secondary` | fill | `--color-scrollbar` | 3 | ContextMenu.css:220 `.menu--scroll.is-scrolling::-webkit-scrollbar-thumb` background; DropdownList.css:350 `.ddl--scroll.is-scrolling::-webkit-scrollbar-thumb` background; Layout.css:178 `.ds-page-scroll__thumb` background |
| `--secondary` | место | `--color-control-track-on-hover` | 1 | Switch.css:98 `.sw:hover.sw--on .sw__control, .sw--hover.sw--on .sw__contro` background |
| `--st-system-light` | место | `--color-control-track` | 1 | SubTab.css:58 `.subtabs` background |
| `--success` | fill | `--color-success-fill` | 11 | Badge.css:75 `.badge--success` background; Buttons.css:192 `.btn--success.btn--accent` background; Buttons.css:192 `.btn--success.btn--accent` border-color |
| `--success-dark` | fill | `--color-success-fill-hover` | 4 | Buttons.css:194 `.btn--success.btn--accent:hover` background; Buttons.css:194 `.btn--success.btn--accent:hover` border-color; Buttons.css:243 `.btn--success.btn--accent.is-hover` background |
| `--tertiary-light` | место | `--color-bg-sunken` | 5 | Splitter.css:144 `.splitpane__a` background; ds-docs.css:94 `.spec__head` background; input-pages.css:49 `.use-block__stage` background |
| `--text-on-dark` | место | `--color-fg-inverse` | 5 | IconButton.css:90 `.ibtn--contrast` color; Spinner.css:25 `.spin--inverse` border-color; Spinner.css:25 `.spin--inverse` border-top-color |
| `--text-primary` | место | `--color-bg-tint` | 1 | ReadOnlyField.css:82 `.rof__icon--interactive:hover, .rof__icon--interactive:focus` background |
| `--warning` | fill | `--color-warning-fill` | 8 | Badge.css:77 `.badge--warning` background; Buttons.css:174 `.btn--warning.btn--accent` background; Buttons.css:174 `.btn--warning.btn--accent` border-color |
| `--warning` | focus | `--color-warning-border` | 3 | Inputs.css:102 `.inp--warning .inp__field:focus-within, .inp--warning.is-foc` border-color; Inputs.css:103 `.inp--warning .inp__field:focus-within, .inp--warning.is-foc` box-shadow; Inputs.css:103 `.inp--warning .inp__field:focus-within, .inp--warning.is-foc` box-shadow |
| `--warning` | border | `--color-warning-border` | 1 | Inputs.css:99 `.inp--warning .inp__field` border-color |
| `--warning-dark` | fill | `--color-warning-fill-hover` | 4 | Buttons.css:176 `.btn--warning.btn--accent:hover` background; Buttons.css:176 `.btn--warning.btn--accent:hover` border-color; Buttons.css:236 `.btn--warning.btn--accent.is-hover` background |

## 7. Токены компонентов

| Токен | Определение | Роль | Почему |
|---|---|---|---|
| `--alert-accent` | Alert.css:27, Alert.css:53, Alert.css:55, Alert.css:57, Alert.css:59 | основная | граница строки Alert и иконка — одного цвета тона: основная роль (fg тона) |
| `--btn-active-bg` | Buttons.css:23 | `--color-accent-bg-pressed` (значение целиком) | акцент 18 % поверх #fff |
| `--btn-hover-bg` | Buttons.css:22 | `--color-accent-bg-hover` (значение целиком) | акцент 10 % поверх #fff |
| `--btn-pale` | Buttons.css:24 | `--color-accent-fill-pressed` (значение целиком), и 10 мест применения | акцент 45 % поверх #fff: заливка нажатой акцентной кнопки и текст нажатой обводочной |
| `--ddl-item-selected-hover` | DropdownList.css:52 | `--color-bg-selected-hover` (значение целиком) | swamp-300 30 % поверх фона списка |
| `--link-fg-active` | Link.css:19 | `--color-link-pressed` (значение целиком) | нажатая ссылка, emerald-900 |
| `--menu-item-active` | ContextMenu.css:46 | `--color-bg-pressed` (значение целиком) | нейтральное нажатие: swamp-500 16 % поверх фона меню |
| `--menu-item-hover` | ContextMenu.css:45 | `--color-bg-hover` | наведение в меню = наведение в списке (в legacy меню темнее: --tertiary против --tertiary-light) |
| `--modal-scrim` | Modal.css:73 | `--color-bg-scrim` (значение целиком) | статус вне статусов: затемнение под модалкой |
| `--pop-zone-bg` | Popover.css:72 | `--color-bg-sunken` | шапка и подвал поповера — зона, не закреплённая колонка |
| `--tip-fg` | Tooltip.css:42 | `--color-fg-inverse` | текст тултипа — на инверсной поверхности |
| `--toast-bg` | Toast.css:29 | `--color-bg-inverse` | статус вне статусов: фон тоста |
| `--toast-fg` | Toast.css:30 | `--color-fg-inverse` | текст тоста — на инверсной поверхности |
| `--toast-icon-error` | Toast.css:45 | `--color-danger-fg-inverse` | иконка на тосте |
| `--toast-icon-info` | Toast.css:46 | `--color-info-fg-inverse` | иконка на тосте |
| `--toast-icon-success` | Toast.css:44 | `--color-success-fg-inverse` | иконка на тосте |
| `--toast-scrim` | Toast.css:41 | `--color-bg-scrim` (значение целиком) | статус вне статусов: затемнение под тостом |

## 8. Места без токена и правила по файлам

Все точечные правила: `from` — как в файле, `value` — в новых темах.


**components/atoms/Avatar/Avatar.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 43 | `.av` | background | `var(--swamp-100)` | `var(--color-bg-muted)` | мимо токена |
| 84 | `.av--accent` | background | `color-mix(in srgb, var(--primary) 14%, var(--mgrey-50))` | `var(--color-accent-bg)` | мимо токена |
| 84 | `.av--accent` | color | `var(--primary-dark)` | `var(--color-accent-fg-strong)` | роль |
| 85 | `.av--accent .av__icon` | color | `var(--primary-dark)` | `var(--color-accent-fg-strong)` | роль |
| 90 | `.av--button:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 144 | `.av-group__more` | background | `var(--cgrey-100)` | `var(--color-bg-muted)` | мимо токена |

**components/atoms/Badge/Badge.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 47 | `.badge` | background | `var(--cgrey-100)` | `var(--color-bg-muted)` | мимо токена |
| 73 | `.badge--neutral` | background | `var(--cgrey-100)` | `var(--color-bg-muted)` | мимо токена |
| 75 | `.badge--success` | background | `var(--success)` | `var(--color-success-fill)` | роль |
| 76 | `.badge--info` | background | `var(--info)` | `var(--color-info-fill)` | роль |
| 77 | `.badge--warning` | background | `var(--warning)` | `var(--color-warning-fill)` | роль |
| 78 | `.badge--error` | background | `var(--error)` | `var(--color-danger-fill)` | роль |
| 89 | `.badge--text.badge--accent` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |

**components/atoms/Buttons/Buttons.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 22 | `:root` | --btn-hover-bg | `color-mix(in srgb, var(--primary) 10%, #fff)` | `var(--color-accent-bg-hover)` | токен компонента |
| 23 | `:root` | --btn-active-bg | `color-mix(in srgb, var(--primary) 18%, #fff)` | `var(--color-accent-bg-pressed)` | токен компонента |
| 24 | `:root` | --btn-pale | `color-mix(in srgb, var(--primary) 45%, #fff)` | `var(--color-accent-fill-pressed)` | токен компонента |
| 50 | `.btn:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 109 | `.btn--outline` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 110 | `.btn--outline` | border-color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 112 | `.btn--outline svg` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 114 | `.btn--outline:active` | border-color | `var(--btn-pale)` | `var(--color-accent-fg-pressed)` | токен компонента |
| 114 | `.btn--outline:active` | color | `var(--btn-pale)` | `var(--color-accent-fg-pressed)` | токен компонента |
| 115 | `.btn--outline:active svg` | color | `var(--btn-pale)` | `var(--color-accent-fg-pressed)` | токен компонента |
| 120 | `.btn--transparent` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 123 | `.btn--transparent svg` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 125 | `.btn--transparent:active` | color | `var(--btn-pale)` | `var(--color-accent-fg-pressed)` | токен компонента |
| 126 | `.btn--transparent:active svg` | color | `var(--btn-pale)` | `var(--color-accent-fg-pressed)` | токен компонента |
| 138 | `.btn--outline:disabled, .btn--outline.btn--disabled` | border-color | `var(--disabled)` | `var(--color-disabled-border)` | роль |
| 155 | `.btn--error.btn--accent, .btn--danger.btn--accent` | background | `var(--error)` | `var(--color-danger-fill)` | роль |
| 155 | `.btn--error.btn--accent, .btn--danger.btn--accent` | border-color | `var(--error)` | `var(--color-danger-fill)` | роль |
| 158 | `.btn--error.btn--accent:hover, .btn--danger.btn--accent:hover` | background | `var(--error-dark)` | `var(--color-danger-fill-hover)` | роль |
| 158 | `.btn--error.btn--accent:hover, .btn--danger.btn--accent:hover` | border-color | `var(--error-dark)` | `var(--color-danger-fill-hover)` | роль |
| 174 | `.btn--warning.btn--accent` | background | `var(--warning)` | `var(--color-warning-fill)` | роль |
| 174 | `.btn--warning.btn--accent` | border-color | `var(--warning)` | `var(--color-warning-fill)` | роль |
| 176 | `.btn--warning.btn--accent:hover` | background | `var(--warning-dark)` | `var(--color-warning-fill-hover)` | роль |
| 176 | `.btn--warning.btn--accent:hover` | border-color | `var(--warning-dark)` | `var(--color-warning-fill-hover)` | роль |
| 182 | `.btn--warning.btn--outline:active` | background | `color-mix(in srgb, var(--warning) 18%, var(--warning-bg))` | `color-mix(in srgb, var(--color-warning-fill) 18%, var(--color-warning-bg))` | роль |
| 188 | `.btn--warning.btn--transparent:active` | background | `color-mix(in srgb, var(--warning) 18%, var(--warning-bg))` | `color-mix(in srgb, var(--color-warning-fill) 18%, var(--color-warning-bg))` | роль |
| 192 | `.btn--success.btn--accent` | background | `var(--success)` | `var(--color-success-fill)` | роль |
| 192 | `.btn--success.btn--accent` | border-color | `var(--success)` | `var(--color-success-fill)` | роль |
| 194 | `.btn--success.btn--accent:hover` | background | `var(--success-dark)` | `var(--color-success-fill-hover)` | роль |
| 194 | `.btn--success.btn--accent:hover` | border-color | `var(--success-dark)` | `var(--color-success-fill-hover)` | роль |
| 200 | `.btn--success.btn--outline:active` | background | `color-mix(in srgb, var(--success) 18%, var(--success-bg))` | `color-mix(in srgb, var(--color-success-fill) 18%, var(--color-success-bg))` | роль |
| 206 | `.btn--success.btn--transparent:active` | background | `color-mix(in srgb, var(--success) 18%, var(--success-bg))` | `color-mix(in srgb, var(--color-success-fill) 18%, var(--color-success-bg))` | роль |
| 210 | `.btn--info.btn--accent` | background | `var(--info)` | `var(--color-info-fill)` | роль |
| 210 | `.btn--info.btn--accent` | border-color | `var(--info)` | `var(--color-info-fill)` | роль |
| 212 | `.btn--info.btn--accent:hover` | background | `var(--info-dark)` | `var(--color-info-fill-hover)` | роль |
| 212 | `.btn--info.btn--accent:hover` | border-color | `var(--info-dark)` | `var(--color-info-fill-hover)` | роль |
| 218 | `.btn--info.btn--outline:active` | background | `color-mix(in srgb, var(--info) 18%, var(--info-bg))` | `color-mix(in srgb, var(--color-info-fill) 18%, var(--color-info-bg))` | роль |
| 224 | `.btn--info.btn--transparent:active` | background | `color-mix(in srgb, var(--info) 18%, var(--info-bg))` | `color-mix(in srgb, var(--color-info-fill) 18%, var(--color-info-bg))` | роль |
| 228 | `.btn--error.btn--accent.is-hover, .btn--danger.btn--accent.is-hover` | background | `var(--error-dark)` | `var(--color-danger-fill-hover)` | роль |
| 228 | `.btn--error.btn--accent.is-hover, .btn--danger.btn--accent.is-hover` | border-color | `var(--error-dark)` | `var(--color-danger-fill-hover)` | роль |
| 236 | `.btn--warning.btn--accent.is-hover` | background | `var(--warning-dark)` | `var(--color-warning-fill-hover)` | роль |
| 236 | `.btn--warning.btn--accent.is-hover` | border-color | `var(--warning-dark)` | `var(--color-warning-fill-hover)` | роль |
| 239 | `.btn--warning.btn--outline.is-active` | background | `color-mix(in srgb, var(--warning) 18%, var(--warning-bg))` | `color-mix(in srgb, var(--color-warning-fill) 18%, var(--color-warning-bg))` | роль |
| 241 | `.btn--warning.btn--transparent.is-active` | background | `color-mix(in srgb, var(--warning) 18%, var(--warning-bg))` | `color-mix(in srgb, var(--color-warning-fill) 18%, var(--color-warning-bg))` | роль |
| 243 | `.btn--success.btn--accent.is-hover` | background | `var(--success-dark)` | `var(--color-success-fill-hover)` | роль |
| 243 | `.btn--success.btn--accent.is-hover` | border-color | `var(--success-dark)` | `var(--color-success-fill-hover)` | роль |
| 246 | `.btn--success.btn--outline.is-active` | background | `color-mix(in srgb, var(--success) 18%, var(--success-bg))` | `color-mix(in srgb, var(--color-success-fill) 18%, var(--color-success-bg))` | роль |
| 248 | `.btn--success.btn--transparent.is-active` | background | `color-mix(in srgb, var(--success) 18%, var(--success-bg))` | `color-mix(in srgb, var(--color-success-fill) 18%, var(--color-success-bg))` | роль |
| 250 | `.btn--info.btn--accent.is-hover` | background | `var(--info-dark)` | `var(--color-info-fill-hover)` | роль |
| 250 | `.btn--info.btn--accent.is-hover` | border-color | `var(--info-dark)` | `var(--color-info-fill-hover)` | роль |
| 253 | `.btn--info.btn--outline.is-active` | background | `color-mix(in srgb, var(--info) 18%, var(--info-bg))` | `color-mix(in srgb, var(--color-info-fill) 18%, var(--color-info-bg))` | роль |
| 255 | `.btn--info.btn--transparent.is-active` | background | `color-mix(in srgb, var(--info) 18%, var(--info-bg))` | `color-mix(in srgb, var(--color-info-fill) 18%, var(--color-info-bg))` | роль |
| 265 | `.btn--outline.is-active` | border-color | `var(--btn-pale)` | `var(--color-accent-fg-pressed)` | токен компонента |
| 265 | `.btn--outline.is-active` | color | `var(--btn-pale)` | `var(--color-accent-fg-pressed)` | токен компонента |
| 266 | `.btn--outline.is-active svg` | color | `var(--btn-pale)` | `var(--color-accent-fg-pressed)` | токен компонента |
| 268 | `.btn--transparent.is-active` | color | `var(--btn-pale)` | `var(--color-accent-fg-pressed)` | токен компонента |
| 269 | `.btn--transparent.is-active svg` | color | `var(--btn-pale)` | `var(--color-accent-fg-pressed)` | токен компонента |

**components/atoms/Checkbox/Checkbox.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 89 | `.cb:hover .cb__mark, .cb--hover .cb__mark` | border-color | `var(--primary)` | `var(--color-accent-border)` | роль |
| 112 | `.cb__input:focus-visible + .cb__box .cb__mark, .cb--focus .cb__mark` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 119 | `.cb--error .cb__mark` | border-color | `var(--error)` | `var(--color-danger-border)` | роль |
| 126 | `.cb--error.cb--selected .cb__mark, .cb--error.cb--indeterminate .cb__m` | background | `var(--error)` | `var(--color-danger-fill)` | роль |
| 127 | `.cb--error.cb--selected .cb__mark, .cb--error.cb--indeterminate .cb__m` | border-color | `var(--error)` | `var(--color-danger-fill)` | роль |
| 137 | `.cb:hover.cb--error.cb--selected .cb__mark, .cb--hover.cb--error.cb--s` | background | `var(--error-dark)` | `var(--color-danger-fill-hover)` | роль |
| 138 | `.cb:hover.cb--error.cb--selected .cb__mark, .cb--hover.cb--error.cb--s` | border-color | `var(--error-dark)` | `var(--color-danger-fill-hover)` | роль |
| 153 | `.cb--disabled .cb__mark, .cb__input:disabled ~ .cb__box .cb__mark` | border-color | `var(--disabled)` | `var(--color-disabled-border)` | роль |

**components/atoms/Chip/Chip.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 172 | `.chip__info:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 235 | `.chip--edit:focus-visible, .chip--edit.is-focus` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 240 | `.chip--selected` | border-color | `color-mix(in srgb, var(--primary) 56%, transparent)` | `color-mix(in srgb, var(--color-accent-border) 56%, transparent)` | роль |
| 240 | `.chip--selected` | color | `var(--primary-dark)` | `var(--color-accent-fg-strong)` | роль |
| 241 | `.chip--selected .chip__icon, .chip--selected .chip__marker, .chip--sel` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 243 | `.chip--edit.chip--selected:not(:is(.chip--disabled,[aria-disabled="tru` | border-color | `var(--primary)` | `var(--color-accent-border)` | роль |
| 262 | `.chip--accent .chip__icon, .chip--accent .chip__marker, .chip--accent ` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 290 | `.chip--outline.chip--accent, .chip--outline.chip--primary` | border-color | `color-mix(in srgb, var(--primary) 56%, transparent)` | `color-mix(in srgb, var(--color-accent-border) 56%, transparent)` | роль |
| 318 | `.chip--success-solid, .chip--green-solid` | color | `var(--mgrey-50)` | `var(--color-fg-on-fill)` | мимо токена |
| 319 | `.chip--warning-solid, .chip--orange-solid` | color | `var(--mgrey-50)` | `var(--color-fg-on-fill)` | мимо токена |
| 320 | `.chip--error-solid, .chip--red-solid` | color | `var(--mgrey-50)` | `var(--color-fg-on-fill)` | мимо токена |
| 321 | `.chip--dark-solid, .chip--grey-solid` | color | `var(--mgrey-50)` | `var(--color-fg-on-fill)` | мимо токена |
| 322 | `.chip--info-solid, .chip--lblue-solid` | color | `var(--mgrey-50)` | `var(--color-fg-on-fill)` | мимо токена |
| 323 | `.chip--accent-solid, .chip--primary-solid` | color | `var(--mgrey-50)` | `var(--color-fg-on-fill)` | мимо токена |
| 324 | `.chip--dpurple-solid` | color | `var(--mgrey-50)` | `var(--color-fg-on-fill)` | мимо токена |
| 326 | `.chip--success-solid .chip__icon, .chip--success-solid .chip__marker, ` | color | `var(--mgrey-50)` | `var(--color-fg-on-fill)` | мимо токена |
| 328 | `.chip--warning-solid .chip__icon, .chip--warning-solid .chip__marker, ` | color | `var(--mgrey-50)` | `var(--color-fg-on-fill)` | мимо токена |
| 330 | `.chip--error-solid .chip__icon, .chip--error-solid .chip__marker, .chi` | color | `var(--mgrey-50)` | `var(--color-fg-on-fill)` | мимо токена |
| 332 | `.chip--dark-solid .chip__icon, .chip--dark-solid .chip__marker, .chip-` | color | `var(--mgrey-50)` | `var(--color-fg-on-fill)` | мимо токена |
| 334 | `.chip--info-solid .chip__icon, .chip--info-solid .chip__marker, .chip-` | color | `var(--mgrey-50)` | `var(--color-fg-on-fill)` | мимо токена |
| 336 | `.chip--accent-solid .chip__icon, .chip--accent-solid .chip__marker, .c` | color | `var(--mgrey-50)` | `var(--color-fg-on-fill)` | мимо токена |
| 337 | `.chip--dpurple-solid .chip__icon, .chip--dpurple-solid .chip__marker, ` | color | `var(--mgrey-50)` | `var(--color-fg-on-fill)` | мимо токена |
| 356 | `.chip--edit.chip--invalid:not(:is(.chip--disabled,[aria-disabled="true` | border-color | `var(--error)` | `var(--color-danger-border)` | роль |

**components/atoms/IconButton/IconButton.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 68 | `.ibtn:focus-visible, .ibtn.is-focus` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 88 | `.ibtn--primary` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 90 | `.ibtn--contrast` | color | `var(--text-on-dark)` | `var(--color-fg-inverse)` | роль |
| 100 | `.ibtn--contrast:hover::before, .ibtn--contrast.is-hover::before` | background | `color-mix(in srgb, #fff 18%, transparent)` | `color-mix(in srgb, var(--color-fg-inverse) 18%, transparent)` | мимо токена |
| 101 | `.ibtn--contrast:active::before, .ibtn--contrast.is-pressed::before` | background | `color-mix(in srgb, #fff 30%, transparent)` | `color-mix(in srgb, var(--color-fg-inverse) 30%, transparent)` | мимо токена |
| 106 | `.ibtn:is(.ibtn--selected,[aria-pressed="true"])` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 116 | `.ibtn--embedded:hover, .ibtn--embedded.is-hover` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 118 | `.ibtn--embedded:active, .ibtn--embedded.is-pressed` | color | `var(--primary-dark)` | `var(--color-accent-fg-strong)` | роль |

**components/atoms/Link/Link.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 19 | `.link` | --link-fg-active | `var(--emerald-900)` | `var(--color-link-pressed)` | токен компонента + мимо токена |
| 41 | `.link.link--accent:active, .link.link--accent.is-pressed` | color | `var(--emerald-900)` | `var(--color-link-pressed)` | мимо токена |
| 60 | `.link.link--info:active, .link.link--info.is-pressed` | color | `color-mix(in srgb, var(--info-dark) 80%, #000)` | `var(--color-info-fg-pressed)` | мимо токена |
| 63 | `.link.link--warning:active, .link.link--warning.is-pressed` | color | `color-mix(in srgb, var(--warning-dark) 80%, #000)` | `var(--color-warning-fg-pressed)` | мимо токена |
| 66 | `.link.link--error:active, .link.link--error.is-pressed` | color | `color-mix(in srgb, var(--error-dark) 80%, #000)` | `var(--color-danger-fg-pressed)` | мимо токена |
| 69 | `.link.link--success:active, .link.link--success.is-pressed` | color | `color-mix(in srgb, var(--success-dark) 80%, #000)` | `var(--color-success-fg-pressed)` | мимо токена |

**components/atoms/Radiobutton/Radiobutton.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 73 | `.rb--selected .rb__mark, .rb__input:checked ~ .rb__box .rb__mark` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 78 | `.rb:hover .rb__mark, .rb--hover .rb__mark` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 84 | `.rb:hover.rb--selected .rb__mark, .rb--hover.rb--selected .rb__mark, .` | color | `var(--primary-dark)` | `var(--color-accent-fg-strong)` | роль |
| 97 | `.rb__input:focus-visible + .rb__box .rb__mark, .rb--focus .rb__mark` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |

**components/atoms/Spinner/Spinner.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 14 | `.spin` | border-top-color | `var(--primary)` | `var(--color-accent-border)` | роль |
| 19 | `.spin--accent` | border-top-color | `var(--primary)` | `var(--color-accent-border)` | роль |
| 25 | `.spin--inverse` | border-color | `color-mix(in srgb, var(--text-on-dark) 28%, transparent)` | `color-mix(in srgb, var(--color-fg-inverse) 28%, transparent)` | роль |
| 25 | `.spin--inverse` | border-top-color | `var(--text-on-dark)` | `var(--color-fg-inverse)` | роль |
| 38 | `.spin-group--inverse .spin-group__label` | color | `var(--text-on-dark)` | `var(--color-fg-inverse)` | роль |

**components/atoms/Switch/Switch.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 55 | `.sw__control` | background | `var(--cgrey-100)` | `var(--color-control-track)` | мимо токена |
| 67 | `.sw__thumb` | background | `var(--mgrey-50)` | `var(--color-control-thumb)` | мимо токена |
| 68 | `.sw__thumb` | box-shadow | `0 1px 2px rgba(40, 50, 55, .28)` | `0 1px 2px color-mix(in srgb, var(--color-shadow) 28%, transparent)` | мимо токена |
| 85 | `.sw--on .sw__thumb, .sw__input:checked ~ .sw__control .sw__thumb` | box-shadow | `0 1px 2px rgba(0, 99, 90, .35)` | `0 1px 2px color-mix(in srgb, var(--color-accent-shadow) 35%, transparent)` | мимо токена |
| 92 | `.sw:hover .sw__thumb, .sw--hover .sw__thumb` | box-shadow | `0 1px 2px rgba(40, 50, 55, .28), 0 0 0 5px var(--primary-bg-light)` | `0 1px 2px color-mix(in srgb, var(--color-shadow) 28%, transparent), 0 0 0 5px var(--color-accent-bg-subtle)` | мимо токена |
| 95 | `.sw:hover .sw__control, .sw--hover .sw__control` | background | `var(--cgrey-200)` | `var(--color-control-track-hover)` | мимо токена |
| 98 | `.sw:hover.sw--on .sw__control, .sw--hover.sw--on .sw__control, .sw:hov` | background | `var(--secondary)` | `var(--color-control-track-on-hover)` | роль |
| 103 | `.sw:hover.sw--on .sw__thumb, .sw--hover.sw--on .sw__thumb, .sw:hover:h` | box-shadow | `0 1px 2px rgba(0, 99, 90, .4), 0 0 0 5px var(--primary-bg-light)` | `0 1px 2px color-mix(in srgb, var(--color-accent-shadow) 40%, transparent), 0 0 0 5px var(--color-accent-bg-subtle)` | мимо токена |
| 111 | `.sw:active .sw__thumb, .sw--pressed .sw__thumb` | box-shadow | `0 1px 2px rgba(40, 50, 55, .28), 0 0 0 7px var(--primary-bg)` | `0 1px 2px color-mix(in srgb, var(--color-shadow) 28%, transparent), 0 0 0 7px var(--color-accent-bg)` | мимо токена |
| 117 | `.sw:active.sw--on .sw__thumb, .sw--pressed.sw--on .sw__thumb, .sw:acti` | box-shadow | `0 1px 2px rgba(0, 99, 90, .4), 0 0 0 7px var(--primary-bg)` | `0 1px 2px color-mix(in srgb, var(--color-accent-shadow) 40%, transparent), 0 0 0 7px var(--color-accent-bg)` | мимо токена |
| 123 | `.sw__input:focus-visible + .sw__control, .sw--focus .sw__control` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 131 | `.sw--loading .sw__thumb` | box-shadow | `0 1px 2px rgba(40, 50, 55, .28)` | `0 1px 2px color-mix(in srgb, var(--color-shadow) 28%, transparent)` | мимо токена |
| 140 | `.sw--on .sw__thumb .spin` | border-color | `color-mix(in srgb, #fff 45%, transparent)` | `color-mix(in srgb, var(--color-fg-on-fill) 45%, transparent)` | мимо токена |
| 141 | `.sw--on .sw__thumb .spin` | border-top-color | `#fff` | `var(--color-fg-on-fill)` | мимо токена |
| 152 | `.sw--disabled .sw__thumb, .sw__input:disabled ~ .sw__control .sw__thum` | background | `var(--mgrey-50)` | `var(--color-control-thumb)` | мимо токена |
| 153 | `.sw--disabled .sw__thumb, .sw__input:disabled ~ .sw__control .sw__thum` | box-shadow | `0 1px 1px rgba(40, 50, 55, .12)` | `0 1px 1px color-mix(in srgb, var(--color-shadow) 12%, transparent)` | мимо токена |

**components/molecules/ButtonGroup/ButtonGroup.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 27 | `:root` | --btng-divider-disabled | `color-mix(in srgb, #fff 38%, transparent)` | `color-mix(in srgb, var(--color-fg-on-fill) 38%, transparent)` | мимо токена |
| 88 | `.btn-group--outline > .btn:hover, .btn-group--outline > .btn:active, .` | border-color | `var(--primary)` | `var(--color-accent-border)` | роль |
| 140 | `.btn-group--outline.btn-group--disabled > .btn` | border-color | `var(--disabled)` | `var(--color-disabled-border)` | роль |

**components/molecules/ContextMenu/ContextMenu.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 45 | `.menu` | --menu-item-hover | `var(--tertiary)` | `var(--color-bg-hover)` | токен компонента |
| 46 | `.menu` | --menu-item-active | `color-mix(in srgb, var(--swamp-500) 16%, var(--bg-popup))` | `var(--color-bg-pressed)` | токен компонента |
| 47 | `.menu` | --menu-shadow | `0 10px 30px rgba(40, 50, 55, .16)` | `0 10px 30px color-mix(in srgb, var(--color-shadow) 16%, transparent)` | мимо токена |
| 134 | `.menu__item-check` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 144 | `.menu__item:focus-visible, .menu__item.is-focus` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 175 | `.menu__item--danger:focus-visible, .menu__item--danger.is-focus` | outline | `2px solid var(--error)` | `2px solid var(--color-danger-border)` | роль |
| 220 | `.menu--scroll.is-scrolling::-webkit-scrollbar-thumb` | background | `var(--secondary)` | `var(--color-scrollbar)` | роль |
| 223 | `.menu--scroll.is-scrolling` | scrollbar-color | `var(--secondary) transparent` | `var(--color-scrollbar) transparent` | роль |

**components/molecules/DatePicker/DatePicker.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 63 | `.dpk__caption:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 123 | `.dpk__day:focus-visible .dpk__daynum` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 129 | `.dpk__day--today .dpk__daynum` | box-shadow | `inset 0 0 0 1px var(--primary)` | `inset 0 0 0 1px var(--color-accent-border)` | роль |
| 129 | `.dpk__day--today .dpk__daynum` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 171 | `.dpk__panel-cell:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 172 | `.dpk__panel-cell--current` | box-shadow | `inset 0 0 0 1px var(--primary)` | `inset 0 0 0 1px var(--color-accent-border)` | роль |
| 172 | `.dpk__panel-cell--current` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |

**components/molecules/DropdownList/DropdownList.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 52 | `.ddl` | --ddl-item-selected-hover | `color-mix(in srgb, var(--swamp-300) 30%, var(--bg-popup))` | `var(--color-bg-selected-hover)` | токен компонента |
| 171 | `.ddl__item-check-single` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 188 | `.ddl__item:focus-visible, .ddl__item.is-focus` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 194 | `.ddl__item:active, .ddl__item.is-active` | background | `color-mix(in srgb, var(--swamp-500) 12%, var(--bg-popup))` | `var(--color-bg-pressed)` | мимо токена |
| 237 | `.ddl__item[aria-disabled="true"] .cb__mark, .ddl__item.is-disabled .cb` | border-color | `var(--disabled)` | `var(--color-disabled-border)` | роль |
| 323 | `.ddl__item--action` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 324 | `.ddl__item--action .ddl__item-icon` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 350 | `.ddl--scroll.is-scrolling::-webkit-scrollbar-thumb` | background | `var(--secondary)` | `var(--color-scrollbar)` | роль |
| 353 | `.ddl--scroll.is-scrolling` | scrollbar-color | `var(--secondary) transparent` | `var(--color-scrollbar) transparent` | роль |

**components/molecules/Inputs/Inputs.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 70 | `.inp__field:hover, .inp.is-hover .inp__field` | border-color | `var(--primary)` | `var(--color-accent-border)` | роль |
| 78 | `.inp__field:focus-within, .inp.is-focus .inp__field` | border-color | `var(--primary)` | `var(--color-focus-ring)` | роль |
| 79 | `.inp__field:focus-within, .inp.is-focus .inp__field` | box-shadow | `inset 0 0 0 1px var(--primary), 0 0 0 3px var(--primary-bg-light)` | `inset 0 0 0 1px var(--color-focus-ring), 0 0 0 3px var(--color-accent-bg-subtle)` | роль |
| 93 | `.inp--error .inp__field` | border-color | `var(--error)` | `var(--color-danger-border)` | роль |
| 96 | `.inp--error .inp__field:focus-within, .inp--error.is-focus .inp__field` | border-color | `var(--error)` | `var(--color-danger-border)` | роль |
| 97 | `.inp--error .inp__field:focus-within, .inp--error.is-focus .inp__field` | box-shadow | `inset 0 0 0 1px var(--error), 0 0 0 3px color-mix(in srgb, var(--error) 8%, transparent)` | `inset 0 0 0 1px var(--color-danger-border), 0 0 0 3px color-mix(in srgb, var(--color-danger-border) 8%, transparent)` | роль |
| 99 | `.inp--warning .inp__field` | border-color | `var(--warning)` | `var(--color-warning-border)` | роль |
| 102 | `.inp--warning .inp__field:focus-within, .inp--warning.is-focus .inp__f` | border-color | `var(--warning)` | `var(--color-warning-border)` | роль |
| 103 | `.inp--warning .inp__field:focus-within, .inp--warning.is-focus .inp__f` | box-shadow | `inset 0 0 0 1px var(--warning), 0 0 0 3px color-mix(in srgb, var(--warning) 10%, transparent)` | `inset 0 0 0 1px var(--color-warning-border), 0 0 0 3px color-mix(in srgb, var(--color-warning-border) 10%, transparent)` | роль |
| 241 | `.inp__act:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |

**components/molecules/NavTile/NavTile.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 110 | `.ntile__title-link:hover .ntile__title` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 112 | `.ntile__title-link:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 124 | `a.ntile:focus-visible, a.ntile.is-focus` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |

**components/molecules/Pagination/Pagination.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 108 | `.pgn__pagesize-btn:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 159 | `.pgn__arrow:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 181 | `.pgn__num:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |

**components/molecules/ReadOnlyField/ReadOnlyField.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 82 | `.rof__icon--interactive:hover, .rof__icon--interactive:focus-visible` | background | `color-mix(in srgb, var(--text-primary) 8%, transparent)` | `var(--color-bg-tint)` | роль |
| 85 | `.rof__icon--interactive:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |

**components/molecules/SegmentControl/SegmentControl.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 52 | `.segctrl` | background | `color-mix(in srgb, var(--swamp-400) 16%, transparent)` | `var(--color-control-track)` | мимо токена |
| 72 | `.segctrl__thumb` | box-shadow | `0 1px 2px rgba(40, 50, 55, .10)` | `0 1px 2px color-mix(in srgb, var(--color-shadow) 10%, transparent)` | мимо токена |
| 163 | `.segctrl__item[aria-checked="true"]` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 165 | `.segctrl__item:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |

**components/molecules/Splitter/Splitter.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 103 | `.spl:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 144 | `.splitpane__a` | background | `var(--tertiary-light)` | `var(--color-bg-sunken)` | роль |
| 146 | `.splitpane--app` | box-shadow | `0 10px 30px rgba(40,50,55,.08)` | `0 10px 30px color-mix(in srgb, var(--color-shadow) 8%, transparent)` | мимо токена |

**components/molecules/SubTab/SubTab.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 58 | `.subtabs` | background | `var(--st-system-light)` | `var(--color-control-track)` | роль |
| 149 | `.subtab:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |

**components/molecules/Tab/Tab.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 82 | `.tabs-scroll__arrow` | box-shadow | `0 4px 14px rgba(40, 50, 55, .16)` | `0 4px 14px color-mix(in srgb, var(--color-shadow) 16%, transparent)` | мимо токена |
| 119 | `.tabs-overflow__menu` | box-shadow | `0 10px 30px rgba(40, 50, 55, .16)` | `0 10px 30px color-mix(in srgb, var(--color-shadow) 16%, transparent)` | мимо токена |
| 143 | `.tabs-overflow__item[aria-checked="true"]` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 145 | `.tabs-overflow__item[aria-checked="true"] .tab__icon` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 308 | `.tab:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 316 | `.tab:is(.tab--selected,[aria-selected="true"],[aria-current="true"]) .` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |

**components/molecules/Toast/Toast.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 29 | `:root` | --toast-bg | `var(--st-grey)` | `var(--color-bg-inverse)` | токен компонента |
| 30 | `:root` | --toast-fg | `var(--text-on-dark)` | `var(--color-fg-inverse)` | токен компонента |
| 41 | `:root` | --toast-scrim | `color-mix(in srgb, var(--st-grey) 25%, transparent)` | `var(--color-bg-scrim)` | токен компонента |
| 44 | `:root` | --toast-icon-success | `var(--success-light)` | `var(--color-success-fg-inverse)` | токен компонента |
| 45 | `:root` | --toast-icon-error | `var(--error-light)` | `var(--color-danger-fg-inverse)` | токен компонента |
| 46 | `:root` | --toast-icon-info | `var(--info-light)` | `var(--color-info-fg-inverse)` | токен компонента |

**components/molecules/Tooltip/Tooltip.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 42 | `.tip` | --tip-fg | `var(--text-on-dark)` | `var(--color-fg-inverse)` | токен компонента |
| 61 | `.tip` | box-shadow | `0 4px 14px rgba(40, 50, 55, .18)` | `0 4px 14px color-mix(in srgb, var(--color-shadow) 18%, transparent)` | мимо токена |
| 108 | `.tip--error` | background | `var(--error)` | `var(--color-danger-fill)` | роль |
| 109 | `.tip--error .tip__arrow` | background | `var(--error)` | `var(--color-danger-fill)` | роль |

**components/organisms/AllocationBar/AllocationBar.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 73 | `.albar__sk` | background | `linear-gradient(90deg,var(--cgrey-100) 0%,var(--cgrey-50) 50%,var(--cgrey-100) 100%)` | `linear-gradient(90deg,var(--color-status-disabled-soft) 0%,var(--color-status-disabled-subtle) 50%,var(--color-status-disabled-soft) 100%)` | мимо токена |
| 80 | `.albar__dot--sk` | background | `var(--cgrey-100)` | `var(--color-status-disabled-soft)` | мимо токена |

**components/organisms/Chart/Chart.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 40 | `.chart__legend-item:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 64 | `.chart__bar` | fill | `var(--chart-c,var(--primary))` | `var(--chart-c,var(--color-accent-fg))` | роль |
| 66 | `.chart__line` | stroke | `var(--chart-c,var(--primary))` | `var(--chart-c,var(--color-accent-fg))` | роль |
| 68 | `.chart__area` | fill | `var(--chart-c,var(--primary))` | `var(--chart-c,var(--color-accent-fg))` | роль |
| 69 | `.chart__dot` | stroke | `var(--chart-c,var(--primary))` | `var(--chart-c,var(--color-accent-fg))` | роль |
| 70 | `.chart__dot--solid` | fill | `var(--chart-c,var(--primary))` | `var(--chart-c,var(--color-accent-fg))` | роль |
| 92 | `.chart__tip-total` | border-top | `1px solid color-mix(in srgb,var(--text-on-dark) 24%,transparent)` | `1px solid color-mix(in srgb,var(--color-fg-inverse) 24%,transparent)` | роль |
| 99 | `.chart__brush-window` | border-left | `2px solid var(--primary)` | `2px solid var(--color-accent-border)` | роль |
| 99 | `.chart__brush-window` | border-right | `2px solid var(--primary)` | `2px solid var(--color-accent-border)` | роль |
| 119 | `.chart__spark-dot` | fill | `var(--chart-c,var(--primary))` | `var(--chart-c,var(--color-accent-fg))` | роль |

**components/organisms/Drawer/Drawer.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 115 | `.drawer__head.is-scrolled` | box-shadow | `0 6px 12px -8px rgba(40, 50, 55, .18)` | `0 6px 12px -8px color-mix(in srgb, var(--color-shadow) 18%, transparent)` | мимо токена |
| 185 | `.drawer__body.is-scrolling` | border-color | `var(--secondary)` | `var(--color-scrollbar)` | роль |
| 207 | `.drawer__body.is-scrolling` | scrollbar-color | `var(--secondary) transparent` | `var(--color-scrollbar) transparent` | роль |
| 261 | `.drawer__foot.is-scrolled` | box-shadow | `0 -6px 12px -8px rgba(40, 50, 55, .18)` | `0 -6px 12px -8px color-mix(in srgb, var(--color-shadow) 18%, transparent)` | мимо токена |

**components/organisms/Entity/Entity.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 87 | `.entity__icon` | background | `var(--swamp-100)` | `var(--color-bg-muted)` | мимо токена |
| 93 | `.entity__icon--accent` | background | `color-mix(in srgb, var(--primary) 14%, var(--mgrey-50))` | `var(--color-accent-bg)` | мимо токена |
| 93 | `.entity__icon--accent` | color | `var(--primary-dark)` | `var(--color-accent-fg-strong)` | роль |
| 94 | `.entity__icon--neutral` | background | `var(--cgrey-100)` | `var(--color-bg-muted)` | мимо токена |
| 170 | `.entity__bookmark--active` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 171 | `.entity__bookmark:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 237 | `.entity--interactive:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |

**components/organisms/Kanban/Kanban.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 202 | `.kbcol__head:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 306 | `.kbcol.kbcol--drop` | box-shadow | `inset 0 0 0 1px var(--primary)` | `inset 0 0 0 1px var(--color-accent-border)` | роль |
| 463 | `.kbcard--selected` | border-color | `var(--primary)` | `var(--color-accent-border)` | роль |
| 465 | `.kbcard--error` | border-color | `var(--error)` | `var(--color-danger-border)` | роль |

**components/organisms/Modal/Modal.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 73 | `:root` | --modal-scrim | `color-mix(in srgb, var(--st-grey) 48%, transparent)` | `var(--color-bg-scrim)` | токен компонента |
| 177 | `.modal__head.is-scrolled` | box-shadow | `0 6px 12px -8px rgba(40, 50, 55, .18)` | `0 6px 12px -8px color-mix(in srgb, var(--color-shadow) 18%, transparent)` | мимо токена |
| 238 | `.modal__body.is-scrolling` | border-color | `var(--secondary)` | `var(--color-scrollbar)` | роль |
| 261 | `.modal__body.is-scrolling` | scrollbar-color | `var(--secondary) transparent` | `var(--color-scrollbar) transparent` | роль |
| 294 | `.modal__foot.is-scrolled` | box-shadow | `0 -6px 12px -8px rgba(40, 50, 55, .18)` | `0 -6px 12px -8px color-mix(in srgb, var(--color-shadow) 18%, transparent)` | мимо токена |

**components/organisms/NavPanel/NavPanel.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 117 | `.nav__list.is-scrolling, .nav:hover .nav__list` | border-color | `var(--secondary)` | `var(--color-scrollbar)` | роль |
| 138 | `.nav__list.is-scrolling, .nav:hover .nav__list` | scrollbar-color | `var(--secondary) transparent` | `var(--color-scrollbar) transparent` | роль |
| 211 | `.nav__item:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 317 | `.nav__user:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |

**components/organisms/Popover/Popover.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 72 | `:root` | --pop-zone-bg | `var(--bg-table-pinned)` | `var(--color-bg-sunken)` | токен компонента |
| 129 | `.pop__head.is-scrolled` | box-shadow | `0 6px 12px -8px rgba(40, 50, 55, .18)` | `0 6px 12px -8px color-mix(in srgb, var(--color-shadow) 18%, transparent)` | мимо токена |
| 182 | `.pop__body.is-scrolling` | border-color | `var(--secondary)` | `var(--color-scrollbar)` | роль |
| 204 | `.pop__body.is-scrolling` | scrollbar-color | `var(--secondary) transparent` | `var(--color-scrollbar) transparent` | роль |
| 230 | `.pop__foot.is-scrolled` | box-shadow | `0 -6px 12px -8px rgba(40, 50, 55, .18)` | `0 -6px 12px -8px color-mix(in srgb, var(--color-shadow) 18%, transparent)` | мимо токена |

**components/organisms/ProductRow/ProductRow.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 50 | `.prow:hover, .prow.is-hover` | box-shadow | `inset 0 0 0 1px var(--primary)` | `inset 0 0 0 1px var(--color-accent-border)` | роль |
| 59 | `.prow[aria-checked]:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 63 | `.prow[aria-checked="true"], .prow.is-selected` | box-shadow | `inset 0 0 0 1px var(--primary)` | `inset 0 0 0 1px var(--color-accent-border)` | роль |
| 107 | `.prow__toggle:focus-visible, .prow__mark:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 160 | `.prow:hover .prow__title--link, .prow.is-hover .prow__title--link` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 162 | `.prow__title--link:focus-visible::after` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |

**components/organisms/SnackBar/SnackBar.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 83 | `.snack--info .snack__dupe` | background | `color-mix(in srgb, var(--info) 20%, transparent)` | `color-mix(in srgb, var(--color-info-fill) 20%, transparent)` | роль |
| 84 | `.snack--warning .snack__dupe` | background | `color-mix(in srgb, var(--warning) 20%, transparent)` | `color-mix(in srgb, var(--color-warning-fill) 20%, transparent)` | роль |
| 85 | `.snack--error .snack__dupe` | background | `color-mix(in srgb, var(--error) 20%, transparent)` | `color-mix(in srgb, var(--color-danger-fill) 20%, transparent)` | роль |
| 86 | `.snack--success .snack__dupe` | background | `color-mix(in srgb, var(--success) 20%, transparent)` | `color-mix(in srgb, var(--color-success-fill) 20%, transparent)` | роль |
| 108 | `.snack__close:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 132 | `.snack-more__btn:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |

**components/organisms/Table/Table.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 91 | `.dtable__body.is-scrolling` | border-color | `var(--secondary)` | `var(--color-scrollbar)` | роль |
| 104 | `.dtable__body::-webkit-scrollbar-thumb:horizontal` | border-color | `var(--secondary)` | `var(--color-scrollbar)` | роль |
| 116 | `.dtable__body.is-scrolling` | scrollbar-color | `var(--secondary) transparent` | `var(--color-scrollbar) transparent` | роль |

**components/organisms/Table/TableSettings.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 49 | `.col-item.drop-before` | box-shadow | `inset 0 2px 0 0 var(--primary)` | `inset 0 2px 0 0 var(--color-accent-border)` | роль |
| 50 | `.col-item.drop-after` | box-shadow | `inset 0 -2px 0 0 var(--primary)` | `inset 0 -2px 0 0 var(--color-accent-border)` | роль |

**components/organisms/TableCell/TableCell.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 65 | `.tc:focus-visible` | box-shadow | `inset 0 0 0 2px var(--primary)` | `inset 0 0 0 2px var(--color-focus-ring)` | роль |
| 76 | `.tbl__row--selected:hover > .tc, .tbl__row--selected.tbl__row--hover >` | background | `color-mix(in srgb, var(--emerald-500) 10%, transparent)` | `var(--color-row-selected-hover)` | мимо токена |
| 203 | `.tc__twisty:hover` | background | `var(--swamp-100)` | `var(--color-bg-hover)` | мимо токена |
| 204 | `.tc__twisty:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |

**components/organisms/TableFilter/TableFilter.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 32 | `.tfilter__open i[data-icon="filter"]` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 56 | `.tfilter__trigger .btn i[data-icon="filter"], .tfilter__trigger .btn i` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |

**components/organisms/Tile/Tile.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 368 | `.tile--card:is(.is-selected, [aria-checked="true"], [aria-selected="tr` | border-color | `var(--primary)` | `var(--color-accent-border)` | роль |
| 374 | `.tile--card:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 380 | `.tile--card.is-move` | border-color | `var(--primary)` | `var(--color-accent-border)` | роль |

**docs-kit/docs-split.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 59 | `main.ds-split .docs-toc__link.is-active` | border-left-color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 59 | `main.ds-split .docs-toc__link.is-active` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |

**docs-kit/ds-docs.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 20 | `.crumb:hover` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 23 | `.badge-new` | border | `1px solid color-mix(in srgb, var(--primary) 22%, transparent)` | `1px solid color-mix(in srgb, var(--color-accent-fg) 22%, transparent)` | роль |
| 23 | `.badge-new` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 33 | `.toggle .sw-mini` | background | `var(--cgrey-200)` | `var(--color-control-track)` | мимо токена |
| 34 | `.toggle .sw-mini::after` | background | `#fff` | `var(--color-control-thumb)` | мимо токена |
| 34 | `.toggle .sw-mini::after` | box-shadow | `0 1px 2px rgba(0,0,0,.2)` | `0 1px 2px color-mix(in srgb, var(--color-shadow) 20%, transparent)` | мимо токена |
| 37 | `.toggle[aria-pressed="true"]` | border-color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 37 | `.toggle[aria-pressed="true"]` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 39 | `.addon` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 42 | `.toggle .sw` | background | `var(--cgrey-200)` | `var(--color-control-track)` | мимо токена |
| 51 | `.toggle .sw::after` | background | `#fff` | `var(--color-control-thumb)` | мимо токена |
| 51 | `.toggle .sw::after` | box-shadow | `0 1px 2px rgba(0,0,0,.2)` | `0 1px 2px color-mix(in srgb, var(--color-shadow) 20%, transparent)` | мимо токена |
| 56 | `.pg-select select:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 63 | `.pg-text input:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 72 | `.seg button[aria-selected="true"]` | box-shadow | `0 1px 2px rgba(40,50,55,.10)` | `0 1px 2px color-mix(in srgb, var(--color-shadow) 10%, transparent)` | мимо токена |
| 72 | `.seg button[aria-selected="true"]` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 77 | `.pg-toggle__sw` | background | `var(--cgrey-200)` | `var(--color-control-track)` | мимо токена |
| 79 | `.pg-toggle__sw::after` | background | `#fff` | `var(--color-control-thumb)` | мимо токена |
| 79 | `.pg-toggle__sw::after` | box-shadow | `0 1px 2px rgba(0,0,0,.2)` | `0 1px 2px color-mix(in srgb, var(--color-shadow) 20%, transparent)` | мимо токена |
| 94 | `.spec__head` | background | `var(--tertiary-light)` | `var(--color-bg-sunken)` | роль |
| 103 | `.guide-card.bad .guide-card__bar` | background | `var(--error)` | `var(--color-danger-fill)` | роль |
| 104 | `.guide-card.good .guide-card__bar` | background | `var(--success)` | `var(--color-success-fill)` | роль |
| 106 | `.guide-card__tag .ic` | color | `#fff` | `var(--color-fg-on-fill)` | мимо токена |
| 108 | `.spec__sw` | border | `1px solid rgba(40,50,55,.12)` | `1px solid var(--color-border-subtle)` | мимо токена |
| 109 | `.guide-card.bad .guide-card__tag .ic` | background | `var(--error)` | `var(--color-danger-fill)` | роль |
| 113 | `.guide-card.good .guide-card__tag .ic` | background | `var(--success)` | `var(--color-success-fill)` | роль |
| 119 | `.ref-table .rt-tok code` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 125 | `.cref-sw` | border | `1px solid rgba(40,50,55,.12)` | `1px solid var(--color-border-subtle)` | мимо токена |
| 156 | `.code-panel__copy.is-copied` | background | `color-mix(in srgb, var(--success) 30%, transparent)` | `color-mix(in srgb, var(--color-success-fill) 30%, transparent)` | роль |
| 161 | `.cref-row .sw` | border | `1px solid rgba(40,50,55,.1)` | `1px solid var(--color-border-subtle)` | мимо токена |
| 200 | `.eyebrow` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 207 | `code.tok` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |

**docs-kit/ds-nav.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 34 | `.ds-nav__logo` | background | `var(--primary-bg, color-mix(in srgb, var(--primary) 10%, #fff))` | `var(--color-accent-bg, color-mix(in srgb, var(--color-accent-fill) 10%, var(--color-bg-surface)))` | мимо токена |
| 91 | `.ds-nav__link.is-active` | color | `var(--primary-dark)` | `var(--color-accent-fg-strong)` | роль |
| 116 | `.ds-nav__toggle` | box-shadow | `0 4px 14px rgba(40,50,55,.10)` | `0 4px 14px color-mix(in srgb, var(--color-shadow) 10%, transparent)` | мимо токена |
| 121 | `.ds-nav__backdrop` | background | `rgba(40,50,55,.34)` | `var(--color-bg-scrim)` | мимо токена |
| 129 | `.ds-nav` | box-shadow | `0 0 40px rgba(40,50,55,.16)` | `0 0 40px color-mix(in srgb, var(--color-shadow) 16%, transparent)` | мимо токена |

**docs-kit/ds-toc.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 17 | `.ref-table--cols code.tok` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 68 | `.ds-toc__link.is-active` | border-left-color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 69 | `.ds-toc__link.is-active` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 73 | `.ds-toc__link:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |

**docs-kit/input-pages.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 29 | `.pg__stage` | background | `linear-gradient(var(--bg-tile),var(--bg-tile)) padding-box, repeating-conic-gradient(#f2f5f5 0% 25%, #fbfcfc 0% 50%) 0 / 22px 22px` | `linear-gradient(var(--color-bg-surface),var(--color-bg-surface)) padding-box, repeating-conic-gradient(var(--color-bg-sunken) 0% 25%, var(--color-bg-page) 0% 50%) 0 / 22px 22px` | мимо токена |
| 41 | `.pg-text input[type="text"]:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 49 | `.use-block__stage` | background | `var(--tertiary-light)` | `var(--color-bg-sunken)` | роль |
| 54 | `.anat__stage` | background | `var(--tertiary-light)` | `var(--color-bg-sunken)` | роль |
| 57 | `.anat__legend li .n` | color | `#fff` | `var(--color-fg-on-fill)` | мимо токена |
| 72 | `.tbl-demo__row--head` | background | `var(--bg-table-pinned, var(--tertiary-light))` | `var(--color-row-pinned, var(--color-bg-sunken))` | роль |

**docs-kit/pg-kit.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 83 | `.pg__controls .icnpick__btn[aria-checked="true"]` | border-color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 83 | `.pg__controls .icnpick__btn[aria-checked="true"]` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |
| 84 | `.pg__controls .icnpick__btn:focus-visible` | outline | `2px solid var(--primary)` | `2px solid var(--color-focus-ring)` | роль |
| 95 | `.pg__controls .readout .r .v.tokv` | color | `var(--primary)` | `var(--color-accent-fg)` | роль |

**foundations/Layout/Layout.css**

| Строка | Селектор | Свойство | Было | Стало | Вид |
|---|---|---|---|---|---|
| 108 | `.ds-scroll.is-scrolling` | border-color | `var(--secondary)` | `var(--color-scrollbar)` | роль |
| 131 | `.ds-scroll.is-scrolling` | scrollbar-color | `var(--secondary) transparent` | `var(--color-scrollbar) transparent` | роль |
| 178 | `.ds-page-scroll__thumb` | background | `var(--secondary)` | `var(--color-scrollbar)` | роль |

## 9. Страницы ДС

### Правила по значению атрибута `style`

| Значение | Свойство → роль | Мест | Страниц |
|---|---|---|---|
| `border:1px solid rgba(40,50,55,.12)` | border-color → `var(--color-border-subtle)` | 442 | 47 |
| `background:var(--swamp-100)`, `background:var(--swamp-100,#E1EDE7)` | background → `var(--color-bg-muted)` | 24 | 3 |
| `background:var(--cgrey-100)` | background → `var(--color-bg-muted)` | 7 | 6 |
| `background:var(--mgrey-50)`, `background:var(--mgrey-50,#fff)` | background → `var(--color-bg-surface)` | 8 | 3 |
| `background:var(--swamp-A100,#EEF4F4)` | background → `var(--color-bg-page)` | 2 | 1 |

### Правила по селектору блока `<style>`

| Селектор | Свойство | Было | Стало | Страниц |
|---|---|---|---|---|
| `.anat__legend li .n` | color | `#fff` | `var(--color-fg-on-fill)` | 35 |
| `.anat__num` | color | `#fff` | `var(--color-fg-on-fill)` | 1 |
| `.anat__stage` | background | `color-mix(in srgb,var(--primary) 5%,#fff)` | `color-mix(in srgb,var(--color-accent-fill) 5%,var(--color-bg-surface))` | 6 |
| `.anat-dia .mk` | color | `#fff` | `var(--color-fg-on-fill)` | 8 |
| `.anat2__legend li .n` | color | `#fff` | `var(--color-fg-on-fill)` | 1 |
| `.badge-proposal` | background | `var(--cgrey-100)` | `var(--color-bg-muted)` | 4 |
| `.card:hover` | box-shadow | `0 12px 30px rgba(40,50,55,.08)` | `0 12px 30px color-mix(in srgb, var(--color-shadow) 8%, transparent)` | 1 |
| `.demo-vscroll__footer` | box-shadow | `0 -6px 12px -10px rgba(40,50,55,.25)` | `0 -6px 12px -10px color-mix(in srgb, var(--color-shadow) 25%, transparent)` | 1 |
| `.dropdown__menu` | box-shadow | `0 10px 30px rgba(40,50,55,.16)` | `0 10px 30px color-mix(in srgb, var(--color-shadow) 16%, transparent)` | 1 |
| `.entity-stage__card` | box-shadow | `var(--elevation-1,0 1px 2px rgba(40,50,55,.06))` | `var(--elevation-1,0 1px 2px color-mix(in srgb, var(--color-shadow) 6%, transparent))` | 1 |
| `.ex-menu` | box-shadow | `0 10px 30px rgba(40,50,55,.12)` | `0 10px 30px color-mix(in srgb, var(--color-shadow) 12%, transparent)` | 1 |
| `.ex-modal` | box-shadow | `0 18px 50px rgba(40,50,55,.14)` | `0 18px 50px color-mix(in srgb, var(--color-shadow) 14%, transparent)` | 1 |
| `.mcard` | box-shadow | `0 1px 3px rgba(40,50,55,.06)` | `0 1px 3px color-mix(in srgb, var(--color-shadow) 6%, transparent)` | 1 |
| `.mk` | color | `#fff` | `var(--color-fg-on-fill)` | 6 |
| `.navcell` | box-shadow | `0 4px 14px rgba(40,50,55,.06)` | `0 4px 14px color-mix(in srgb, var(--color-shadow) 6%, transparent)` | 1 |
| `.pg__stage` | background | `linear-gradient(var(--bg-tile),var(--bg-tile)) padding-box, repeating-conic-gradient(#f2f5f5 0% 25%, #fbfcfc 0% 50%) 0 / 22px 22px` | `linear-gradient(var(--color-bg-surface),var(--color-bg-surface)) padding-box, repeating-conic-gradient(var(--color-bg-sunken) 0% 25%, var(--color-bg-page) 0% 50%) 0 / 22px 22px` | 29 |
| `.pg-range::-moz-range-thumb` | box-shadow | `0 1px 3px rgba(40,50,55,.3)` | `0 1px 3px color-mix(in srgb, var(--color-shadow) 30%, transparent)` | 1 |
| `.pg-range::-webkit-slider-thumb` | box-shadow | `0 1px 3px rgba(40,50,55,.3)` | `0 1px 3px color-mix(in srgb, var(--color-shadow) 30%, transparent)` | 1 |
| `.pv-colors` | box-shadow | `0 1px 3px rgba(40,50,55,.12)` | `0 1px 3px color-mix(in srgb, var(--color-shadow) 12%, transparent)` | 1 |
| `.stripe span` | border | `1px solid rgba(40,50,55,.10)` | `1px solid var(--color-border-subtle)` | 1 |
| `.surface` | box-shadow | `0 6px 26px -18px rgba(40,50,55,.4)` | `0 6px 26px -18px color-mix(in srgb, var(--color-shadow) 40%, transparent)` | 2 |
| `ol.steps li::before` | color | `#fff` | `var(--color-fg-on-fill)` | 1 |

### Не перекрашивается

| Причина | Мест | Файлы |
|---|---|---|
| код на странице всегда на тёмном фоне | 36 | Alert.html, AllocationBar.html, Avatar.html, Badge.html, Breadcrumbs.html, ButtonGroup.html, Buttons.html, Chart.html и ещё 28 |
| редкое значение — ждёт переезда | 53 | Alert.html, Backlog.html, Badge.html, Breadcrumbs.html, ContextMenu.html, Divider.html, DropdownList.html, Elevation.html и ещё 16 |
| шахматка под образцами с прозрачностью | 8 | Buttons.html, IconButton.html |
| тёмный стенд — показ на тёмном фоне намеренно | 8 | Elevation.html, IconButton.html, Spinner.html |
| селектор страницы совпадает с классом компонента — глобальным правилом нельзя | 6 | AllocationBar.html, Chart.html, Icons.html, Modal.html, Pagination.html, RiskMetric.html |
| образцы legacy-палитры — документация текущих цветов | 9 | Colors.html |
| сценарии и данные страниц (скрипты), образцы SVG — не CSS | 549 | Alert.page.js, Avatar.html, Badge.html, Buttons.html, Colors.html, Elevation.html, EmptyState.html, IconButton.html и ещё 13 |

## 10. Не перекрашивается в CSS и JS ДС

| Где | Причина | Мест |
|---|---|---|
| компоненты | не цвет: маска прокрутки | 2 |
| оболочка доков | код на странице всегда на тёмном фоне | 23 |
| JS ДС | не цвет: HTML-сущность &#8943; (многоточие) | 1 |
| JS ДС | сообщение об ошибке подключения — для разработчика | 2 |
| JS ДС | заглушка изображения на страницах ДС — собственный вид, не продукт | 19 |

## 11. Тени

| Токен | Legacy | В новых темах |
|---|---|---|
| `--elevation-1` | `0 1px 2px rgba(40, 50, 55, .28)` | `0 1px 2px color-mix(in srgb, var(--color-shadow) 28%, transparent)` |
| `--elevation-2` | `0 10px 30px rgba(40, 50, 55, .16)` | `0 10px 30px color-mix(in srgb, var(--color-shadow) 16%, transparent)` |
| `--elevation-3` | `0 14px 38px rgba(40, 50, 55, .18)` | `0 14px 38px color-mix(in srgb, var(--color-shadow) 18%, transparent)` |
| `--elevation-4` | `0 18px 48px rgba(40, 50, 55, .20)` | `0 18px 48px color-mix(in srgb, var(--color-shadow) 20%, transparent)` |
| `--elevation-5` | `0 22px 58px rgba(40, 50, 55, .22)` | `0 22px 58px color-mix(in srgb, var(--color-shadow) 22%, transparent)` |
| `--shadow-modal-form` | `0 24px 64px rgba(40, 50, 55, .28)` | `0 24px 64px color-mix(in srgb, var(--color-shadow) 28%, transparent)` |

## 12. Рампы новых тем

Имя — `--ramp-<тон>-<шаг>`, шаги 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950. Тона (19): `accent`, `neutral`, `grey`, `amber`, `blue`, `brown`, `cyan`, `deep-orange`, `deep-purple`, `green`, `indigo`, `light-blue`, `light-green`, `lime`, `orange`, `pink`, `purple`, `red`, `yellow`.
`accent` — из изумрудного семени (решение пользователя 02.10.2026: имя роли, а не тона — кастомный акцент меняет семя);
`neutral` — сине-серая, `grey` — чисто серая (C = 0) вместо swamp, cgrey, mgrey (решение пользователя 02.10.2026);
остальные — все тона legacy, в том числе без применения (решение Э1). A-шаги не переносятся.

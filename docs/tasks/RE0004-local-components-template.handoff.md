# RE0004 — handoff

- **Дата:** 02.10.2026
- **Статус:** ЗАДАЧА ЗАКРЫТА — Э2, Э3, Э4 выполнены, гейт `ВЕРДИКТ: OK`

## Что сделано в Э3 (генератор и рантайм витрины)

1. **`kit-build.mjs`** — канон разделов читается из `design-system/templates/local-component/Component.md`
   (нет шаблона — КТ1); вкладка «Документация» — «Паспорт» (карточка+связи, + требования
   и версия правил), затем 13 разделов по канону, «Из чего собран» в «Компонентах»,
   «Все состояния рядом» в «Состояниях»; HTML-комментарии тела не выводятся; заголовок
   `<h2>` — русская часть. КТ2 — раздел мимо канона / пропущен / повторён / текст до
   первого `##` (мимо канона и текст выводятся в конце — не теряются). Селфтест: стенд с
   шаблоном и каноническими паспортами + 5 новых кейсов КТ2 — 21 кейс OK.
2. **`kit-docpage.js`** — порядок контролов по ключу (`state→mode→variant→example→long→свои→width`);
   `labels` из сценария; `found`/`member` ушли в `CounterpartyCard.demo.js` (`labels`).
3. **Сценарии демо** — `DealFinancialInstrumentCreateModal` (Вид → state), `DealProductTreeTile`
   (Пример дерева → example+long), `DealFinancialInstrumentEditModal` (Тип ФИ → variant+state),
   `CounterpartiesTile` (подпись long); копии «Все состояния рядом» у окон ФИ рисуются напрямую
   (окно привязано к живому скриму).
4. **`lessons-cli.mjs`** — правка `templates/local-component/Component.md` поднимает шаг `kit`.

## Что сделано в Э4 (указатели и закрытие)

1. `widget-template.md` удалён; ссылки — на `design-system/templates/local-component/Component.md`
   в `screen-spec/SKILL.md`, `screen-builder.md`, `.agents/README.md`, `apps/README.md`,
   `apps/local-components/README.md`; задача `0003` — виджетная часть закрыта этой задачей.
2. `docs-index.mjs` — каталог обновлён (275 документов).

## Проверки (02.10.2026)
`node .agents/tools/kit-build.mjs --selftest` — ВЕРДИКТ: OK (21 кейс).
`node .agents/tools/kit-build.mjs` — 32 компонента, ВЕРДИКТ: OK.
`node .agents/tools/lessons-cli.mjs gate` — ВЕРДИКТ: OK.

## Цель
Одна форма для всех локальных компонентов (виджетов): одна шапка паспорта, один канон
разделов вкладки «Документация», одна конвенция «Конструктора». Задача —
`RE0004-local-components-template.md`.

## Этапы
- ✓ Э0 · задача
- ✓ Э1 · правила и шаблон в ДС
- ✓ Э2 · миграция 32 паспортов (скрипт + Э2б: разделы, журналы, ссылки)
- — Э3 · генератор `kit-build.mjs`, рантайм `kit-docpage.js`, сценарии демо, маршрут гейта
- — Э4 · указатели харнеса, задача 0003, каталог документации, приёмка

## Что сделано в Э2 (заход миграции)

1. **Скрипт `docs/misc/RE0004-local-components/migrate-passports.mjs`** — написан редактором,
   прогнан `--write`. Механика:
   - шапка — порядок по шаблону ДС, `widget`/`file`/`module` убраны, `type` кодом,
     `rulesVersion: 2.000`, `updated: "02.10.2026"`, `version` не тронут;
   - тело — канонические h2 → «Русский (English)» в каноническом порядке; **все** «свои h2»
     понижены до h3 под нужный канон («Правила…», «Проверка…», «Связанные артефакты» →
     Поведение; «Параметры метки», «Соответствие файлов», «Скрипт …» → Для разработчиков;
     «Типы узлов» → Поля; «Витрина» → «Варианты состава» в Состояниях); `### Скрипт …`,
     вложенный под «Связанные артефакты», вынесен в «Для разработчиков» как h3; вложенные
     h3 внутри переезжающего раздела → h4.
   - **Доказательство сохранности:** сравнение «до/после» — 32 паспорта, 0 потерянных строк.
   - Скрипт **не идемпотентный** — на уже мигрированных файлах его не перезапускать.

2. **frontend** заполнен у 12 паспортов без него (по README модуля §«Виджет → Пара во
   фронтенде» + §«Имена фронтенда»): 5 тайлов → `postrade/deals-app/widgets/tiles/<Имя>`;
   3 модалки → `postrade/deals-app/widgets/modals/<Имя>`; `CounterpartyCard` → `CardCounterparty`;
   `DealSetupTile`, `EpsVbsImpactTile`, `DealCounterpartiesTable` → `new`.

3. **fixtures**: убрана подпись «он же эталонный снимок» из трёх `fixtures.json`
   (DealDescriptionTile, DealFinancialMetricsTile, DealTeamTile).

4. **«Состав» → Раскладка + Поля** сделано у `DealTeamModal`.

5. **Disabled** — удалены 3 строки «нет | —» (DealFinancialInstrumentCreateModal,
   DealFinancialInstrumentEditModal, FinInstrumentsTile).

## Э2б — сделано (02.10.2026)

### А. «Состав» → Раскладка + Поля (3 файла) — ГОТОВО
Сплитнут `## Состав` у `DealPeriodModal`, `DealFinancialMetricsModal`,
`InstrumentsCounterpartiesModal`: сетка/порядок → «Раскладка (Layout)» (после «Описание»),
«что чем собрано, источник» → «Поля (Fields)» (после «Раскладки»), `## Состав` удалён.
`## Состав` больше нет ни в одном паспорте (grep `^## Состав` — только README.md виджетов).

### Б. Строки «Правка временно запрещена (Disabled)» — 11 штук — ГОТОВО
- 6 «да, у…» → «### Свои состояния»: DidProductsModal, InstrumentTransferModal,
  InstrumentsModal, RepaymentModal, ProductsModal, LinkChangeModal (у трёх без этого h3 —
  создан).
- 4 «нет…» → в строку «Только просмотр» (суффикс `(Disabled)` НЕ добавлялся — решение
  человека): DealDescriptionTile, ProjectInformationTile, ProductTreeConfirmModal,
  DealProductTreeTile.
- 1 «не решено» → «Открытые вопросы»: DealTitleModal.
- grep `^\| Правка временно запрещена` по паспортам — 0 совпадений.

### В. Недостающие разделы (главный объём)
Заглушки — ГОТОВО (5): EpsVbsImpactTile, DealMetricsCalculationTile,
DealRelatedCollateralsTile, DealSetupTile, DealCounterpartiesTable — получили недостающие
`Раскладка`, `Компоненты`, `Данные`, `Для разработчиков` = «не решено (02.10.2026)»,
`Осознанные отклонения` = «Отклонений нет». У всех 13 канонических h2 на местах.

Наполнено (фактами из фрагмента `<Имя>.html` и страницы-хозяина `Deal.html`, чего не
узнать — «не решено (02.10.2026)» + строка в «Открытые вопросы»):

1. **Наполненные ДС-тайлы + подчасть** — добавить `Раскладка`, `Компоненты`, `Данные`,
   `Для разработчиков` (+ `Осознанные отклонения` у CounterpartyCard):
   CounterpartiesTile, DealPeriodTile, DealTeamTile, DealFinancialMetricsTile,
   CounterpartyCard (modals/InstrumentsCounterpartiesModal/CounterpartyCard).
2. **«Свои» модалки** — после сплита «Состав» ещё без разделов:
   - DealPeriodModal: Компоненты, Обязательность заполнения, Данные, Для разработчиков,
     Осознанные отклонения.
   - DealFinancialMetricsModal: Компоненты, Обязательность заполнения, Поведение, Данные,
     Для разработчиков.
   - InstrumentsCounterpartiesModal: Компоненты, Обязательность заполнения, Данные,
     Для разработчиков, Осознанные отклонения.
   - DealTeamModal: Компоненты, Обязательность заполнения, Данные, Для разработчиков,
     Осознанные отклонения.
3. **Харнес-модалки** — дозаполнить по таблице раздела 5:
   - CounterpartiesEcmModal: Обязательность заполнения, Переполнение, Данные.
   - DealDescriptionModal: Обязательность заполнения, Переполнение, Данные, Осознанные
     отклонения.
   - DealProjectInformationModal: Обязательность заполнения, Переполнение, Данные.
   - DealTitleModal: Обязательность заполнения, Осознанные отклонения.
   - RelatedDealsPopover: Компоненты, Права, Обязательность заполнения, Поведение, Данные,
     Осознанные отклонения.
4. **Только «Осознанные отклонения»**: DealFinancialInstrumentCreateModal,
   DealFinancialInstrumentEditModal, InstrumentTransferModal, LinkChangeModal.

### Г. Журналы — ГОТОВО
14 виджетов без `CHANGELOG.md` получили журнал с первой записью «паспорт приведён к правилам
2.000»; у остальных 18 та же запись дописана сверху.

### Д. Ссылки на разделы — проверено
`grep «см. „…“»` по всем паспортам — 10 ссылок, все ведут на канонические имена разделов,
переименованных («Состав», «Витрина», «Правила состава» и т.п.) в ссылках нет. Правок не
потребовалось.

## Проверки (прогнаны 02.10.2026)
`node .agents/tools/kit-build.mjs` — ВЕРДИКТ: OK (32 компонента).
`node .agents/tools/module-readme.mjs` — ВЕРДИКТ: OK.
`node .agents/tools/docs-index.mjs` — ВЕРДИКТ: OK (276 документов, журналы внесены в каталог).
`node .agents/tools/lessons-cli.mjs gate` — ВЕРДИКТ: OK.

Все 32 паспорта — в каноническом порядке 13 разделов (grep `^## ` сходится с шаблоном ДС).

## Читать первыми (для Э3)
- `docs/tasks/RE0004-local-components-template.md` — разделы 1, 3, 6 (Э3)
- `design-system/templates/local-component/Component.md` — канон, источник заголовков генератора
- `apps/local-components/README.md` — что генератор читает из паспорта

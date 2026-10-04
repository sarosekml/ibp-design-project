# FinInstrumentsCard — handoff

- **Дата:** 04.10.2026
- **Статус:** закрыта

## Цель
У карточки ФИ под заголовком — сабхедер о погашении (иконка + текст), как у прикреплённого
инструмента; в конструкторе витрины — свитч о погашении. Модуль `postrade/deals-app`, трек product.

## Этапы
- ✓ plan
- ✓ build
- ✓ review (PASS)
- ✓ lessons

## Смета
Не считалась: правка одного виджета, не сборка экрана.

## Принятые решения
- Сабхедер — компонент ДС `Tile`: `.tile__subtitle` + `.tile__subtitle-icon--success`, иконка
  `check-circle-filled`; текст общий со строкой узла (`repaidText`) — правило ДС.
- Карточка погашена, когда все прикреплённые узлы погашены; дата — самая поздняя из узлов
  (`FinInstrumentsStore.view().repaidAt`) — правило стора.
- Погашенные сделки: все карточки ФИ погашены — у 1030/1039/1048 убраны карточки без
  прикреплённых узлов (решение человека 04.10.2026).
- Свитч витрины честный: показывает сделку 1048 (`fixtures.data.repaidDealId`), где все карточки
  реально погашены, а не подставляет признак (требование приёмки).

## Что сделано
- `data/fin-instruments-store.js` — в представление карточки добавлено поле `repaidAt`.
- `widgets/tiles/FinInstrumentsTile/` — `FinInstrumentsTile.js` рисует сабхедер у погашенной
  карточки; эталон `.html` (погашенная `FI-1027-2` внутри `.lc-fin-instruments__list`); паспорт
  1.001 и `CHANGELOG.md`.
- `data/mock-fin-instruments.js` — у 1030/1039/1048 оставлены только карточки с погашенными узлами
  (1030 — FI-1030-1, 1039 — FI-1039-3/4, 1048 — FI-1048-1).
- `apps/local-components/postrade/deals-app/FinInstrumentsTile.demo.js` и `fixtures.json` — свитч
  «Погашенная сделка».
- Пересобраны витрина (`kit-build.mjs`) и `pages/Deal.preview.html` (`assemble.mjs`).

## Проверки
`lessons-cli gate` → `ВЕРДИКТ: OK`. `screen-reviewer` — **PASS** (3-й заход): закрыты блокеры
Б27 «ложное погашение у непогашенной карточки» и «карточка вне контейнера списка». Уроки Л179 и
Л180 добавлены в архив (`.agents/skills/screen-review/references/lessons-raw.md`).

## Открытые вопросы
- Метрики и данные портфеля — см. `PortfolioData.handoff.md`.
- localStorage перекрывает фикстуру — для показа новых данных нужна очистка хранилища.

## Следующий шаг
Открыть `apps/local-components/postrade/deals-app/FinInstrumentsTile.doc.html`, свитч «Погашенная
сделка» — карточки сделки 1048 с сабхедером; сверить с `pages/Deal.preview.html` сделки 1048.

## Читать первыми
- `apps/postrade/deals-app/widgets/tiles/FinInstrumentsTile/FinInstrumentsTile.md`
- `apps/postrade/deals-app/data/fin-instruments-store.js`
- `apps/postrade/deals-app/PortfolioData.handoff.md`

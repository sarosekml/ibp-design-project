# RE0003 FinInstrumentsTile — handoff

- **Дата:** 02.10.2026
- **Статус:** ждёт ответа пользователя

## Цель
Тайл «Финансовые инструменты» страницы сделки (`apps/postrade/deals-app`, трек `product`) —
вместо заглушки, по макетам дизайнера из `tmp/ФИ/` (вне git): тайл, карточка ФИ, окна
создания и изменения ФИ.

## Этапы
- ✓ plan
- ✓ build
- ✓ review (приёмка по чек-листам `screen-review` и `composition-review` в той же сессии)
- → close — ждёт описания действий карточки от пользователя

## Смета
`ctx-budget.mjs --stage build --cheat Tile,Tab,ReadOnlyField,Chip,Badge,RiskMetric,Buttons,IconButton,ContextMenu,Tooltip,Alert,Modal,InputText,InputAutocomplete,DropdownList,Checkbox,ProductRow --out-lines 1400` → `ВЕРДИКТ: OK — запас 67 404`.

## Принятые решения
- Правка модуля трека `product` — подтверждена одобрением плана (пользователь, 02.10.2026).
- «Сгенерировать автоматически» — карточка ФИ на каждый тип прикрепляемых узлов дерева,
  узлы сразу прикрепляются (пользователь).
- Баланс, валюта, сумма лимита / стоимость покупки, дата подписания, плановая дата погашения —
  из прикреплённых узлов дерева (пользователь).
- ФИ — в сторе с сохранением через `PostApi`; окно связи с ФИ у дерева читает тот же стор
  (пользователь).
- Действия карточки («→», «⋮», «+ Добавить», ⇄, ссылка RWA) — пользователь опишет позже; пока
  без обработчиков, в «⋮» временный пункт «Изменить» (допущение агента).
- Правила производных полей, «погашен», имя новой карточки, тип отчётности сгенерированной,
  контрагенты окна — допущения агента (паспорт тайла, «Открытые вопросы» 6–16).

## Что сделано
- `apps/postrade/deals-app/data/fin-instruments-store.js` — новый стор `FinInstrumentsStore`.
- `data/mock-fin-instruments.js` — расширенный DTO, тип `ADDITIONAL_YIELD`, демо 1027/1024/1026/1035/1042.
- `data/post-api.js` (ресурс `fin-instruments`), `data/product-tree-store.js` (`fiCards` из стора ФИ), `data/API.md`.
- `widgets/tiles/FinInstrumentsTile/` — тайл 1.000: html, css, js, паспорт, CHANGELOG, fixtures.
- `widgets/modals/DealFinancialInstrumentCreateModal/`, `DealFinancialInstrumentEditModal/` — окна 1.000.
- `widgets/modals/LinkChangeModal/` 1.001 — «—» у свободной карточки, паспорт.
- `pages/Deal.html` + `Deal.screen.md`; README модуля и `widgets/README.md`.
- Витрина: `apps/local-components/postrade/deals-app/*.demo.js` трёх виджетов.

## Проверки
`lessons-cli gate` — `ВЕРДИКТ: OK`; сенсор `Deal.preview.html` — `ВЕРДИКТ: OK (замечаний: 11)`,
ни одно не из тайла ФИ. Прогон на linkedom со всеми рантаймами: сделки 1027/1026/1024/1042/1035 —
56 проверок, 0 провалов; страницы витрины трёх виджетов — 0 ошибок. Приёмка — PASS.

## Открытые вопросы
- Что делают «→», «⋮», «+ Добавить», ⇄ у инструмента, ссылка у кодов RWA — к пользователю.
- Остальные — паспорт тайла (1, 3–17), окон (по 3–6), `Deal.screen.md` §7 п. 16 — к владельцу продукта.

## Следующий шаг
Получить от пользователя описание действий карточки и подключить их (тайл: `cardHTML`, `fiaction`).

## Читать первыми
- `apps/postrade/deals-app/widgets/tiles/FinInstrumentsTile/FinInstrumentsTile.md`
- `apps/postrade/deals-app/data/fin-instruments-store.js` (шапка)
- `apps/postrade/deals-app/pages/Deal.screen.md` — §4 «Финансовые инструменты», §6

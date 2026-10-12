# RE0017-early-interest — handoff

- **Дата:** 12.10.2026
- **Статус:** ждёт ответа пользователя (разбор решений агента, этап Э6)

## Цель
Концепт «Досрочные проценты» для Post: карточка на странице транша, страница досрочных
платежей процентов, окна «Новые проценты» и «Порядок погашения» — для показа бизнесу и
передачи в разработку (`/promote` в `deals-app`, затем `/dev-spec`).

## Этапы
- ✓ Э0 задача · ✓ Э1 концепт и данные · ✓ Э2 тайл и пометки Note · ✓ Э3 страница и окно
- ✓ Э4 порядок погашения · ✓ Э5 панель, витрина, приёмка, гейт
- → Э6 разбор решений агента человеком, правки

## Смета
`ctx-budget.mjs --stage build --cheat Tile,Table,Modal,Note,Entity,InputText,DropdownList,ReadOnlyField --out-lines 1400` — `ВЕРДИКТ: OK`.

## Принятые решения
- ответы человека на 11 вопросов — таблица «Решения человека 12.10.2026» в задаче;
- 16 решений агента — раздел «Решения агента — на разбор» в задаче, каждое продублировано
  в «Открытых вопросах» паспорта или спеки.

## Что сделано
- `apps/postrade/drafts/early-interest/` — концепт (`app.json`, `pages/`, `widgets/`, `data/`, `proto-panel/`);
- `pages/Tranche.html` — копия транша `deals-app` + тайл и пометки Note;
- `pages/EarlyInterestPayments.html` — страница; `widgets/tiles/EarlyInterestPaymentsTile`,
  `InterestRepaymentOrderTile`, `widgets/modals/EarlyInterestPaymentModal`, `InterestRepaymentOrderModal`;
- `proto-panel/flows.yaml` — 4 сценария, состояния State 01–17;
- урок Л208 — крошки после привязки Breadcrumbs меняют через `DSBreadcrumbs` API.

## Проверки
`lessons-cli gate` — `ВЕРДИКТ: OK (35 шаг.)`; сенсор на трёх страницах — OK (замечания
унаследованы от транша модуля и K4 тайла порядка — обосновано в спеке); приёмка по
`screen-review` и `composition-review` — PASS с замечаниями; смоук на linkedom со всеми
рантаймами ДС — 56 проверок из 56 (харнес в скретчпаде сессии, в репозиторий не входит).

## Открытые вопросы
- Note против Alert для пометки «нужен пересчёт» — к человеку;
- загрузка, ошибка, «нет права видеть» — не решено;
- долг курации журнала уроков (Л182 Л185 Л202 Л206 Л207) — был до задачи, курация обязательна.

## Следующий шаг
Пройти с человеком таблицу «Решения агента — на разбор» в задаче, внести правки.

## Читать первыми
- `docs/tasks/RE0017-early-interest.md`
- `apps/postrade/drafts/early-interest/pages/EarlyInterestPayments.screen.md`
- `apps/postrade/drafts/early-interest/pages/Tranche.screen.md`

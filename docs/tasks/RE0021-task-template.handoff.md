# RE0021 — handoff

- **Дата:** 14.10.2026
- **Статус:** ждёт приёмки человеком (`status: review`); не закоммичено

## Цель
Единый шаблон задач и ревью, handoff и ревью в `docs/tasks/`, токены и активное время по этапам — для обоих авторов задач и для любого CLI.

## Этапы
- ✓ Э0 задача · ✓ Э1 разбор · ✓ Э2 шаблоны · ✓ Э3 task-cost · ✓ Э4 handoff и ревью · ✓ Э5 проверки
- → приёмка человеком; затем `probe` на банковском контуре

## Принятые решения
- Затраты — скриптом по локальным журналам; время без ожидания ответов — человек
- Новые handoff и ревью — только в `docs/tasks/`; старые в `apps/` не переносить — человек
- Старые задачи не трогать — человек
- Проверка шапки задач в гейте — пока не нужна — человек
- На контуре GigaCode CLI, Node 22.5+ есть, opencode — только вне контура — человек
- В счёт затрат — сессии, где ID задачи написал человек или агент (вывод инструментов не в счёт) — допущение агента, проверено на живых журналах
- Работа без файла задачи сначала заводит короткую задачу, handoff рядом — допущение агента (уточняет RE0019 Э5)

## Что сделано
- `docs/tasks/0000-task-template.md` — шаблон задачи
- `docs/tasks/0000-review-template.md` — шаблон ревью
- `docs/tasks/README.md` — правила папки
- `.agents/tools/task-cost.mjs` — учёт затрат
- `.agents/commands/handoff.md`, `.agents/agents/ai-designer.md`, `.agents/agents/screen-reviewer.md` — место handoff и ревью
- `AGENTS.md`, `.agents/README.md`, `apps/README.md` — указатели
- `docs/tasks/RE0019-harness-speed.md` (Э5), `docs/tasks/RE0020-lessons-digest.md` (вопрос 2) — пометки

## Проверки
`lessons-cli gate` — `ВЕРДИКТ: OK (9 шаг.)`; `task-cost --selftest` — OK (12); `vendor-scan` — OK.

## Открытые вопросы
- Где GigaCode CLI хранит журналы — к человеку: `node .agents/tools/task-cost.mjs probe` на контуре, вывод — в RE0021

## Следующий шаг
Человек смотрит итог и таблицу «Затраты» в RE0021; по выводу `probe` — читатель журналов GigaCode в `task-cost.mjs`.

## Читать первыми
- `docs/tasks/RE0021-task-template.md`
- `docs/tasks/README.md`
- шапка `.agents/tools/task-cost.mjs`

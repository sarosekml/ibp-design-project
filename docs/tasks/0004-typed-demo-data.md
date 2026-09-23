---
id: '004'
title: 'Описать типы в демо-данных прототипов (JSDoc, имена в стиле API)'
status: pending
priority: low
effort: medium
dependencies: []
tags:
  - data
  - handoff
created: 2026-09-24
---

# Описать типы в демо-данных прототипов

## Objective

С 24.09.2026 демо-данные `data/*.js` устроены как ответ API: у каждого типа
JSDoc `@typedef`, имена в стиле фронтенда (`…RsDto`, camelCase, коды
перечислений и отдельная карта подписей), источник имён — DTO или
`invented`. Образец — `.agents/skills/screen-spec/references/data-template.js`,
правила — скилл `screen-spec`, раздел «Демо-данные». Файлы, заведённые раньше,
typedef не имеют, часть полей названа транслитом (`knr`, `gsz`, `tsupEmployee`).

## Tasks

- [ ] `apps/postrade/deals-app/data/mock-deals.js` — typedef записи сделки, перечни
- [ ] `apps/postrade/deals-app/data/mock-deal-trees.js` — typedef дерева продуктов
- [ ] `apps/postrade/deals-app/data/deals-store.js` — типы параметров и результатов помощника
- [ ] `apps/pretrade/drafts/pipeline-manager-kanban/data/pipeline-data.js` — typedef десков, стадий, сотрудников, сделок
- [ ] при появлении DTO (человек кладёт их в `refs/dto/` модуля) — заменить
  придуманные имена контрактными в данных, спеках и разметке
- [ ] переименования полей — синхронно с экранами, которые их читают

## Acceptance Criteria

- У каждого типа в файлах данных есть `@typedef` с `@property` и строкой `Source:`
- Экраны работают как раньше (открыть в браузере, консоль без ошибок)
- `node .agents/tools/lessons-cli.mjs gate` — `ВЕРДИКТ: OK`

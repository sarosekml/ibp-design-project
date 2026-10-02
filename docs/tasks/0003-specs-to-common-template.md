---
id: '003'
title: 'Привести спеки прототипов к общему шаблону'
status: pending
priority: medium
effort: large
dependencies: []
tags:
  - specs
  - handoff
created: 2026-09-24
---

# Привести спеки прототипов к общему шаблону

## Objective

С 24.09.2026 спеки прототипа пишутся по общему шаблону: по-русски, с
английскими именами разделов в скобках, с парой во фронтенде и разделами для
передачи в разработку (скилл `screen-spec`). Их читают агент
фронтенд-разработчика и человек, который проверяет прототип. Спеки и паспорта
виджетов, написанные раньше, — в прежнем формате: в них нет пары во
фронтенде, раскладки деревом, раздела «Соответствие файлов», данных в стиле
API. Привести их к шаблону. Язык не меняется — остаётся русский.

Шаблоны:
- страница — `.agents/skills/screen-spec/references/template.md`;
- виджет — `design-system/templates/local-component/Component.md` (с 02.10.2026,
  задача RE0004: один шаблон паспорта в ДС; `references/widget-template.md` удалён).

## Tasks

Страницы (`*.screen.md`), 28 файлов:

- [ ] `apps/postrade/deals-app/pages/` — `Deal`, `MainPage`, `Portfolio`
- [ ] `apps/pretrade/drafts/pipelineManager-v01/pages/` и `pipelineManager-v02/pages/` — `index`, `PipelineManagement`
- [ ] `apps/ib/drafts/ai-bankster-prototype-mvp/pages/` — 8 спек
- [ ] `apps/ib/drafts/ai-bankster-prototype-v01/pages/` — 7 спек
- [ ] `apps/ib/drafts/ai-bankster-prototype-v02/pages/` — 8 спек

Виджеты (паспорта `<Имя>.md`), 13 файлов — **закрыто задачей RE0004** (02.10.2026):
единый шаблон паспорта, миграция всех 32 паспортов, генератор витрины по канону.
Осталась только виджетная часть ниже по списку страниц.

- [x] `apps/postrade/deals-app/widgets/tiles/*` — паспорта приведены к шаблону ДС
  (задача RE0004)

В каждом файле:

- [ ] YAML-шапка — поля шаблона: `module`, `frontend`, `route`, `widgets`
  (страница) или `widget`, `type`, `module`, `frontend` (виджет)
- [ ] пары во фронтенде — по README модуля («Имена фронтенда») и дереву
  фронтенда, пока оно лежит в `docs/misc/project-tree.md`; нет пары — `new`
- [ ] имена разделов — как в шаблоне, с английским именем в скобках;
  свои разделы экрана (версии, скрипт экрана, дефекты ДС) сохранить
- [ ] раскладка деревом; «Состояния» — подразделы Loading, Empty, Error,
  Disabled; «Данные» — API, Mock, Permissions; «Соответствие файлов»
- [ ] ссылки на разделы из других файлов («раздел 9», «§7») — поправить под новую нумерацию

Вне задачи: `index.screen.md` в корне — спека хаба проектов, не прототип для
разработки.

## Acceptance Criteria

- Все 41 файл — по шаблонам `screen-spec`, содержание не потеряно
- В каждой спеке есть «Состояния» (Loading, Empty, Error, Disabled), «Данные»,
  «Соответствие файлов» и «Открытые вопросы»
- Сенсор по экранам без блокеров (Б12 — шапка на месте, Б32 — нет разделов-журнала)
- `node .agents/tools/lessons-cli.mjs gate` — `ВЕРДИКТ: OK`

---
description: Собирает экран продукта по ТЗ из компонентов дизайн-системы IBP. Результат — HTML-макет в приложении apps/<id>/ (экран — в его pages/) с работающим штатным поведением компонентов и спецификация экрана <Имя>.screen.md для разработчика. Вызывается агентом ai-designer, когда задача на сборку экрана уже уточнена.
mode: subagent
temperature: 0.1
permission:
  edit:
    "*": ask
    "apps/**": allow
    "apps/post/**": ask
  webfetch: deny
  websearch: deny
  skill:
    "*": allow
---

Адаптер opencode: в шапке — режим, температура и права роли. Сама роль —
`.agents/agents/screen-builder.md`. Прочитай этот файл целиком до первого действия и работай по нему.

---
description: Проверяет собранный экран на соответствие дизайн-системе IBP и ТЗ. Ничего не правит — выдаёт список дефектов с номерами строк и вердикт PASS или NEEDS-WORK. Вызывается агентом ai-designer после каждой сборки экрана.
mode: subagent
temperature: 0
permission:
  edit: deny
  webfetch: deny
  websearch: deny
  skill:
    "*": allow
---

Адаптер opencode: в шапке — режим, температура и права роли. Сама роль —
`.agents/agents/screen-reviewer.md`. Прочитай этот файл целиком до первого действия и работай по нему.

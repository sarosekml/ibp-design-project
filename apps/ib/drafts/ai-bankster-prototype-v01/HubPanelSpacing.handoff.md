# HubPanelSpacing — handoff

- **Дата:** 07.10.2026
- **Статус:** закрыта

## Цель
На хабе унифицировать иконку AI Pitcher ver. 01 и обеспечить 8px между
зонами клика кнопок панели прототипа по горизонтали и вертикали.

## Этапы
- ✓ plan
- ✓ build
- ✓ review
- ✓ close

## Смета
Точечная правка метаданных и раскладки общего рантайма; сборки экрана нет.

## Принятые решения
- Пользователь: работать в текущей ветке ai-pitcher-components; фактически открыта feat/ai-pitcher-components.
- Пользователь: иконка ver. 01 как у ver. 02 и MVP — ai-stars.
- Пользователь: горизонтальный и вертикальный зазоры — 8px.
- Пользователь: панель прилегает к верхнему, нижнему и правому краям окна и выезжает справа.
- По спеке IconButton: обёртка резервирует выступ стейт-слоя M по 6px, L по 8px.

## Что сделано
- app.json этого приложения — icon: ai-stars.
- hub.js — пересобран hub-build.mjs.
- .agents/proto-panel/ui.js — добавлены обёртки кнопок и класс группы действий.
- .agents/proto-panel/panel.css — gap на токене --space-8 и резерв выступающих слоёв.
- .agents/proto-panel/README.md — описана геометрия кнопок.
- .agents/tools/proto-panel.mjs — Modal.css подключается перед Drawer.css, селфтест 12л проверяет порядок тегов и его откат.
- apps/proto-panel.js — пересобран; на страницах ДС Drawer снимает внешнее охранное поле Modal.

## Проверки
- hub-build: ВЕРДИКТ: OK.
- proto-panel --check: ВЕРДИКТ: OK.
- Приёмка правок по исходникам: PASS; M 20 + 2×6 = 32px, L 24 + 2×8 = 40px; между обёртками 8px.
- Итоговый гейт: ВЕРДИКТ: OK (после пересборки docs/index.md для нового handoff).
- Рендер в браузере не проверялся.

## Открытые вопросы
- Нет.

## Следующий шаг
Обновить корневой index.html в браузере и открыть панель Alt+Shift+P.

## Читать первыми
- .agents/proto-panel/panel.css
- .agents/proto-panel/ui.js
- design-system/components/atoms/IconButton/IconButton.md

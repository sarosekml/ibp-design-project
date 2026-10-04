/* ============================================================
   Themes.tokens.js — источник тем ДС (RE0005, RE0006, RE0007, RE0008, RE0009, RE0010). v3, Э2–Э4 (04.10.2026):
   роли, карта 119 имён, точечные правила, правила страниц,
   «не перекрашивается», семена рамп, значения ролей и значения графиков.
   RE0007 (04.10.2026): в светлой статусы danger/warning/success/info — ровно
   legacy (Palette.css), иконки по умолчанию — нейтральные, границы светлее,
   нав-панель белая, закреплённые строки на ступень темнее; выбранный пункт
   навигации и блок зоны/рейтинга — точечными правилами.
   RE0008 (04.10.2026): графики и статусная палитра — legacy, neutral синён,
   аутлайн-кнопки и выбранный пункт меню — как legacy, fg-muted темнее,
   треки SegmentControl/SubTab светлее.
   RE0009 (04.10.2026): графики legacy во всех темах, статусная палитра —
   legacy только в светлой (в тёмной/сервисной снова сгенерированные ступени
   читаются); в тёмной/сервисной fg-on-fill светлый, границы subtle/default
   мягче (лесенка 300/400); внутренние скролл-области — оверлейная полоса
   (Layout/Modal/Popover/Drawer и др.).
   RE0010 (04.10.2026): тёмный плавающий слой `--color-bg-float`/`-hover`
   (меню, выпадашки, блоки поповера — светлее окна), инпуты — raised, шапка
   поповера — sunken, выбранная иконка нав — акцентная; из точечных правил
   убраны `scrollbar-color` (в Chromium они отключали `::-webkit-scrollbar`).
   Файл читают Node (vm) и страница (тег), как icons-data.js. С Э3 это
   источник: правится руками, а Themes.css пересобирает генератор
   tools/theme-build.mjs.

   Формат:
   - seeds[тема].ramps — семена тонов: `{ h, c }` — по кривой профиля
     темы, `{ values: { '50': '#…', …, '950': '#…' } }` — явные ступени
     (эталонная шкала). Светлая ibp-light (RE0006, Э2) задаёт явными
     ступенями neutral (Radix slate, синён в RE0008), grey (чисто-серая, 50 = #FFFFFF)
     и accent (изумруд вокруг #00AA9B, ступень 500); статусные тона (red,
     amber, light-green, light-blue, green, deep-purple) с Э4 — Tailwind-
     ориентированные семена, остальные базовые тона переносятся из Colors.css
     как есть. У ibp-dark (RE0006, Э3–Э4) neutral, grey и accent — явными
     ступенями под тёмный фон, все 19 тонов считаются из семян; service (Э6) —
     своя тема;
   - seeds[тема].palette = true — «тема = текущая палитра»: роли заданы
     в themeValues значениями Palette.css, точечные правила к ней не
     применяются. Флаг поддержан генератором, но с RE0006 ни одна тема
     им не пользуется (ibp-light переведена на генератор);
   - values[роль] — выражение над --ramp-* или legacy-токенами Colors.css/
     Palette.css, общее для новых тем; здесь же графики (--color-chart-*,
     legacy hex) и сгенерированная статусная палитра (--color-status-*);
   - themeValues[тема][роль] — переопределение роли для темы: у ibp-light —
     акцентные роли, статусы danger/warning/success/info и статусная палитра
     (legacy), границы, фон навигации, закреплённые строки, иконки и fg-muted;
     у ibp-dark и service — поверхности, тень, иконки, бегунок, светлый
     fg-on-fill и мягкие границы; графики — в values, не здесь;
   - roles / map / elevation / rules / pages / keep — как в v1;
   - contrast — пары «текст/фон» с порогом; required: true — генератор роняет
     сборку (с Э4 этим покрыты и статусы), false — показывает стенд; exempt:
     [тема] — для этой темы пара информационная (акцент, границы и заливки —
     там, где тема повторяет legacy или несёт светлый текст, RE0007–RE0009).
   ============================================================ */
window.DS_THEMES = {
  "version": 2,
  "legacy": "legacy",
  "themes": [
    "ibp-light",
    "ibp-dark",
    "service"
  ],
  "ramps": {
    "steps": [
      "50",
      "100",
      "200",
      "300",
      "400",
      "500",
      "600",
      "700",
      "800",
      "900",
      "950"
    ],
    "tones": [
      "accent",
      "neutral",
      "grey",
      "amber",
      "blue",
      "brown",
      "cyan",
      "deep-orange",
      "deep-purple",
      "green",
      "indigo",
      "light-blue",
      "light-green",
      "lime",
      "orange",
      "pink",
      "purple",
      "red",
      "yellow"
    ],
    "note": "--ramp-<тон>-<шаг>; accent строится из изумрудного семени (Ф2 меняет семя), neutral — сине-серая, grey — чисто серая (C = 0); остальные тона — по именам legacy. A-шаги не переносятся."
  },
  "seeds": {
    "ibp-light": {
      "profile": "light",
      "ramps": {
        "accent": {
          "values": {
            "50": "#E9F7F5",
            "100": "#C9EDE9",
            "200": "#A0DFD8",
            "300": "#6BCCC2",
            "400": "#38B8AB",
            "500": "#00AA9B",
            "600": "#0A7D6D",
            "700": "#0A6A5C",
            "800": "#085648",
            "900": "#064238",
            "950": "#043027"
          }
        },
        "neutral": {
          "values": {
            "50": "#F8F9FB",
            "100": "#EEF1F3",
            "200": "#DDE2E7",
            "300": "#D4DBE2",
            "400": "#B4BDC7",
            "500": "#858F9A",
            "600": "#5C656F",
            "700": "#505860",
            "800": "#393F46",
            "900": "#1B2025",
            "950": "#0E1215"
          }
        },
        "grey": {
          "values": {
            "50": "#FFFFFF",
            "100": "#FAFAFA",
            "200": "#F5F5F5",
            "300": "#E5E5E5",
            "400": "#D4D4D4",
            "500": "#A3A3A3",
            "600": "#737373",
            "700": "#525252",
            "800": "#404040",
            "900": "#171717",
            "950": "#0A0A0A"
          }
        },
        "red": {
          "h": 27,
          "c": 0.22
        },
        "amber": {
          "h": 75,
          "c": 0.185
        },
        "light-green": {
          "h": 145,
          "c": 0.2
        },
        "light-blue": {
          "h": 258,
          "c": 0.205
        },
        "green": {
          "h": 145,
          "c": 0.2
        },
        "deep-purple": {
          "h": 293,
          "c": 0.25
        }
      }
    },
    "ibp-dark": {
      "profile": "dark",
      "ramps": {
        "accent": {
          "values": {
            "50": "#04302B",
            "100": "#06453E",
            "200": "#085A50",
            "300": "#0A7063",
            "400": "#0C8778",
            "500": "#0E9E8D",
            "600": "#12B3A1",
            "700": "#2FCBBB",
            "800": "#5FDDD0",
            "900": "#96EAE0",
            "950": "#C9F5F0"
          }
        },
        "neutral": {
          "values": {
            "50": "#111112",
            "100": "#18191B",
            "200": "#1F2326",
            "300": "#252A30",
            "400": "#59616A",
            "500": "#87919C",
            "600": "#ABB5C0",
            "700": "#C3CCD6",
            "800": "#D2DAE2",
            "900": "#E8EFF6",
            "950": "#F6FBFF"
          }
        },
        "grey": {
          "values": {
            "50": "#0D0D0D",
            "100": "#161616",
            "200": "#1E1E1E",
            "300": "#262626",
            "400": "#383838",
            "500": "#666666",
            "600": "#999999",
            "700": "#B8B8B8",
            "800": "#D6D6D6",
            "900": "#EDEDED",
            "950": "#FAFAFA"
          }
        },
        "amber": {
          "h": 75,
          "c": 0.185
        },
        "blue": {
          "h": 248.8,
          "c": 0.169
        },
        "brown": {
          "h": 40.7,
          "c": 0.053
        },
        "cyan": {
          "h": 210.8,
          "c": 0.108
        },
        "deep-orange": {
          "h": 36.5,
          "c": 0.211
        },
        "deep-purple": {
          "h": 293,
          "c": 0.25
        },
        "green": {
          "h": 145,
          "c": 0.2
        },
        "indigo": {
          "h": 271.4,
          "c": 0.159
        },
        "light-blue": {
          "h": 258,
          "c": 0.205
        },
        "light-green": {
          "h": 145,
          "c": 0.2
        },
        "lime": {
          "h": 114.8,
          "c": 0.141
        },
        "orange": {
          "h": 64.1,
          "c": 0.141
        },
        "pink": {
          "h": 9.6,
          "c": 0.23
        },
        "purple": {
          "h": 321.2,
          "c": 0.215
        },
        "red": {
          "h": 27,
          "c": 0.22
        },
        "yellow": {
          "h": 102.5,
          "c": 0.131
        }
      }
    },
    "service": {
      "profile": "dark",
      "ramps": {
        "accent": {
          "values": {
            "50": "#1E1240",
            "100": "#2C1C5F",
            "200": "#42307D",
            "300": "#53389E",
            "400": "#6941C6",
            "500": "#7F56D9",
            "600": "#9E77ED",
            "700": "#B692F6",
            "800": "#D6BBFB",
            "900": "#E9D7FE",
            "950": "#F4EBFF"
          }
        },
        "neutral": {
          "values": {
            "50": "#111112",
            "100": "#18191B",
            "200": "#1F2326",
            "300": "#252A30",
            "400": "#59616A",
            "500": "#87919C",
            "600": "#ABB5C0",
            "700": "#C3CCD6",
            "800": "#D2DAE2",
            "900": "#E8EFF6",
            "950": "#F6FBFF"
          }
        },
        "grey": {
          "values": {
            "50": "#0D0D0D",
            "100": "#161616",
            "200": "#1E1E1E",
            "300": "#262626",
            "400": "#383838",
            "500": "#666666",
            "600": "#999999",
            "700": "#B8B8B8",
            "800": "#D6D6D6",
            "900": "#EDEDED",
            "950": "#FAFAFA"
          }
        },
        "amber": {
          "h": 75,
          "c": 0.185
        },
        "blue": {
          "h": 248.8,
          "c": 0.169
        },
        "brown": {
          "h": 40.7,
          "c": 0.053
        },
        "cyan": {
          "h": 210.8,
          "c": 0.108
        },
        "deep-orange": {
          "h": 36.5,
          "c": 0.211
        },
        "deep-purple": {
          "h": 293,
          "c": 0.25
        },
        "green": {
          "h": 145,
          "c": 0.2
        },
        "indigo": {
          "h": 271.4,
          "c": 0.159
        },
        "light-blue": {
          "h": 258,
          "c": 0.205
        },
        "light-green": {
          "h": 145,
          "c": 0.2
        },
        "lime": {
          "h": 114.8,
          "c": 0.141
        },
        "orange": {
          "h": 64.1,
          "c": 0.141
        },
        "pink": {
          "h": 9.6,
          "c": 0.23
        },
        "purple": {
          "h": 321.2,
          "c": 0.215
        },
        "red": {
          "h": 27,
          "c": 0.22
        },
        "yellow": {
          "h": 102.5,
          "c": 0.131
        }
      }
    }
  },
  "roles": {
    "--color-bg-page": {
      "group": "Фон",
      "desc": "Фон страницы и рабочей области; зоны внутри поверхности, которые продолжают фон страницы"
    },
    "--color-bg-surface": {
      "group": "Фон",
      "desc": "Поверхность: тайл, ячейка таблицы, поле ввода"
    },
    "--color-bg-raised": {
      "group": "Фон",
      "desc": "Поднятая поверхность: модалка, Drawer, тело поповера"
    },
    "--color-bg-nav": {
      "group": "Фон",
      "desc": "Панель навигации"
    },
    "--color-bg-inverse": {
      "group": "Фон",
      "desc": "Инверсная поверхность: тултип, тост, подпись свёрнутой навигации"
    },
    "--color-bg-sunken": {
      "group": "Фон",
      "desc": "Приглушённая зона внутри поверхности: шапка и подвал поповера, панель сплиттера, стенд документации"
    },
    "--color-bg-float": {
      "group": "Фон",
      "desc": "Плавающий слой над окном: меню, выпадающий список, блоки поповера — на ступень светлее окна в тёмной теме"
    },
    "--color-bg-float-hover": {
      "group": "Фон",
      "desc": "Наведение на пункт плавающего слоя: светлее его фона (в тёмной — лёгкий светлый оверлей)"
    },
    "--color-bg-muted": {
      "group": "Фон",
      "desc": "Нейтральная плашка: аватар, бейдж, иконка Entity, полоса раздела Divider"
    },
    "--color-bg-muted-strong": {
      "group": "Фон",
      "desc": "Плотная нейтральная плашка (бывший --tertiary-dark; в ДС не применяется)"
    },
    "--color-bg-hover": {
      "group": "Фон",
      "desc": "Наведение на нейтральный пункт: меню, список, «ещё» крошек, раскрытие строки"
    },
    "--color-bg-pressed": {
      "group": "Фон",
      "desc": "Нажатие на нейтральный пункт меню и списка"
    },
    "--color-bg-selected-hover": {
      "group": "Фон",
      "desc": "Наведение на выбранный пункт списка"
    },
    "--color-bg-tint": {
      "group": "Фон",
      "desc": "Нейтральная полупрозрачная подложка (8 %): плашка «Данные рассчитываются», наведение на иконку ReadOnlyField"
    },
    "--color-bg-tint-subtle": {
      "group": "Фон",
      "desc": "Нейтральная полупрозрачная подложка (4 %): тонированная строка ProductRow"
    },
    "--color-bg-veil": {
      "group": "Фон",
      "desc": "Светлая полупрозрачная вуаль поверх содержимого: окно периода в Chart"
    },
    "--color-bg-scrim": {
      "group": "Фон",
      "desc": "Затемнение под модалкой и тостом, подложка выезжающей навигации документации"
    },
    "--color-row-hover": {
      "group": "Строки таблиц",
      "desc": "Наведение на строку; на день календаря и строку AllocationBar"
    },
    "--color-row-selected": {
      "group": "Строки таблиц",
      "desc": "Выбранная строка (в legacy — «focus»)"
    },
    "--color-row-selected-hover": {
      "group": "Строки таблиц",
      "desc": "Наведение на выбранную строку"
    },
    "--color-row-accent": {
      "group": "Строки таблиц",
      "desc": "Выделенная строка"
    },
    "--color-row-accent-hover": {
      "group": "Строки таблиц",
      "desc": "Наведение на выделенную строку"
    },
    "--color-row-accent-selected": {
      "group": "Строки таблиц",
      "desc": "Выбранная выделенная строка"
    },
    "--color-row-pinned": {
      "group": "Строки таблиц",
      "desc": "Закреплённая колонка и шапка таблицы"
    },
    "--color-row-pinned-hover": {
      "group": "Строки таблиц",
      "desc": "Наведение на закреплённую колонку"
    },
    "--color-row-pinned-selected": {
      "group": "Строки таблиц",
      "desc": "Выбранная ячейка закреплённой колонки"
    },
    "--color-fg-default": {
      "group": "Текст и иконки",
      "desc": "Основной текст и иконки"
    },
    "--color-fg-secondary": {
      "group": "Текст и иконки",
      "desc": "Второстепенный текст и иконки: подписи, лейблы"
    },
    "--color-fg-muted": {
      "group": "Текст и иконки",
      "desc": "Неактивный текст: плейсхолдер, недоступное, подсказка"
    },
    "--color-fg-on-fill": {
      "group": "Текст и иконки",
      "desc": "Текст и иконки на цветной заливке: акцентная кнопка, бейдж, выбранный день, сплошной чип"
    },
    "--color-fg-inverse": {
      "group": "Текст и иконки",
      "desc": "Текст и иконки на инверсной поверхности: тултип, тост, кнопка-иконка Contrast, инверсный спиннер"
    },
    "--color-fg-icon": {
      "group": "Текст и иконки",
      "desc": "Иконка по умолчанию (правило ДС: цвет иконки — --secondary)"
    },
    "--color-fg-icon-strong": {
      "group": "Текст и иконки",
      "desc": "Иконка при наведении, в выбранном пункте, у сортировки колонки"
    },
    "--color-border-default": {
      "group": "Границы",
      "desc": "Граница поля, контрастная линия Divider, ось графика"
    },
    "--color-border-subtle": {
      "group": "Границы",
      "desc": "Разделитель, граница тайла и таблицы, сетка графика"
    },
    "--color-border-strong": {
      "group": "Границы",
      "desc": "Сильная граница: рамка чекбокса, нажатая карточка, курсор графика"
    },
    "--color-accent-fill": {
      "group": "Акцент",
      "desc": "Заливка акцентом: акцентная кнопка, выбранный чекбокс, заполнение прогресса"
    },
    "--color-accent-fill-hover": {
      "group": "Акцент",
      "desc": "Наведение на заливку акцентом"
    },
    "--color-accent-fill-pressed": {
      "group": "Акцент",
      "desc": "Нажатие на заливку акцентом"
    },
    "--color-accent-fg": {
      "group": "Акцент",
      "desc": "Текст и иконки акцентом: обводочная и прозрачная кнопка, выбранный пункт"
    },
    "--color-accent-fg-strong": {
      "group": "Акцент",
      "desc": "Плотный акцентный текст: аватар Accent, выбранный чип, нажатая встроенная кнопка-иконка"
    },
    "--color-accent-fg-pressed": {
      "group": "Акцент",
      "desc": "Текст и иконки нажатой обводочной и прозрачной кнопки"
    },
    "--color-accent-border": {
      "group": "Акцент",
      "desc": "Отдельная акцентная граница и обводка-тень: выбранный чип и карточка, «сегодня» в календаре, место вставки"
    },
    "--color-accent-muted": {
      "group": "Акцент",
      "desc": "Приглушённый акцент (бывший --primary-light; в CSS ДС не применяется, есть в apps/)"
    },
    "--color-accent-bg": {
      "group": "Акцент",
      "desc": "Акцентная подложка (8 %): диапазон дат, выбранный пункт, плашка аватара и Entity Accent"
    },
    "--color-accent-bg-subtle": {
      "group": "Акцент",
      "desc": "Акцентная подложка (4 %): ореол наведения чекбокса, радио, переключателя, поля в фокусе"
    },
    "--color-accent-bg-hover": {
      "group": "Акцент",
      "desc": "Наведение на обводочную и прозрачную кнопку"
    },
    "--color-accent-bg-pressed": {
      "group": "Акцент",
      "desc": "Нажатие на обводочную и прозрачную кнопку"
    },
    "--color-accent-shadow": {
      "group": "Акцент",
      "desc": "Тень бегунка включённого переключателя"
    },
    "--color-link": {
      "group": "Ссылка",
      "desc": "Ссылка"
    },
    "--color-link-hover": {
      "group": "Ссылка",
      "desc": "Наведение на ссылку"
    },
    "--color-link-pressed": {
      "group": "Ссылка",
      "desc": "Нажатая ссылка"
    },
    "--color-link-muted": {
      "group": "Ссылка",
      "desc": "Приглушённая ссылка (бывший --link-light; в ДС не применяется)"
    },
    "--color-secondary-bg": {
      "group": "Вторичный тон",
      "desc": "Подложка вторичного тона, 32 % (бывший --secondary-bg; в ДС не применяется)"
    },
    "--color-secondary-bg-subtle": {
      "group": "Вторичный тон",
      "desc": "Подложка вторичного тона, 16 % (бывший --secondary-bg-light; в ДС не применяется)"
    },
    "--color-control-track": {
      "group": "Элементы управления",
      "desc": "Дорожка: выключенный переключатель, SegmentControl, SubTab, переключатели документации"
    },
    "--color-control-track-hover": {
      "group": "Элементы управления",
      "desc": "Наведение на дорожку выключенного переключателя"
    },
    "--color-control-track-on": {
      "group": "Элементы управления",
      "desc": "Дорожка включённого переключателя"
    },
    "--color-control-track-on-hover": {
      "group": "Элементы управления",
      "desc": "Наведение на включённый переключатель"
    },
    "--color-control-thumb": {
      "group": "Элементы управления",
      "desc": "Бегунок переключателя"
    },
    "--color-scrollbar": {
      "group": "Элементы управления",
      "desc": "Бегунок полосы прокрутки"
    },
    "--color-focus-ring": {
      "group": "Элементы управления",
      "desc": "Кольцо фокуса и граница поля в фокусе"
    },
    "--color-disabled-fill": {
      "group": "Неактивное",
      "desc": "Заливка недоступного: акцентная кнопка, выбранный чекбокс, бейдж Muted"
    },
    "--color-disabled-border": {
      "group": "Неактивное",
      "desc": "Граница недоступного: обводочная кнопка, рамка чекбокса"
    },
    "--color-disabled-border-subtle": {
      "group": "Неактивное",
      "desc": "Светлая граница недоступного: ProductRow"
    },
    "--color-disabled-bg": {
      "group": "Неактивное",
      "desc": "Фон недоступного: дорожка переключателя, SegmentControl"
    },
    "--color-disabled-veil": {
      "group": "Неактивное",
      "desc": "Вуаль поверх недоступного (бывший --disabled-bg-semy-transparent; в ДС не применяется)"
    },
    "--color-danger-fg": {
      "group": "Сообщения · danger",
      "desc": "Ошибка: текст и иконки"
    },
    "--color-danger-fg-strong": {
      "group": "Сообщения · danger",
      "desc": "Ошибка: плотный текст — нажатая обводочная кнопка, текст на подложке тона"
    },
    "--color-danger-fg-pressed": {
      "group": "Сообщения · danger",
      "desc": "Ошибка: нажатая ссылка тона"
    },
    "--color-danger-fg-inverse": {
      "group": "Сообщения · danger",
      "desc": "Ошибка: иконка на инверсной поверхности (тост)"
    },
    "--color-danger-fill": {
      "group": "Сообщения · danger",
      "desc": "Ошибка: заливка — бейдж, акцентная кнопка тона"
    },
    "--color-danger-fill-hover": {
      "group": "Сообщения · danger",
      "desc": "Ошибка: наведение на заливку"
    },
    "--color-danger-fill-pressed": {
      "group": "Сообщения · danger",
      "desc": "Ошибка: нажатие на заливку"
    },
    "--color-danger-border": {
      "group": "Сообщения · danger",
      "desc": "Ошибка: отдельная граница — поле, рамка чекбокса"
    },
    "--color-danger-bg": {
      "group": "Сообщения · danger",
      "desc": "Ошибка: подложка — нажатая обводочная кнопка, Alert"
    },
    "--color-danger-bg-subtle": {
      "group": "Сообщения · danger",
      "desc": "Ошибка: светлая подложка — наведение, Alert"
    },
    "--color-danger-bg-strong": {
      "group": "Сообщения · danger",
      "desc": "Ошибка: плотная подложка (бывший --error-bg-dark; в ДС не применяется)"
    },
    "--color-warning-fg": {
      "group": "Сообщения · warning",
      "desc": "Предупреждение: текст и иконки"
    },
    "--color-warning-fg-strong": {
      "group": "Сообщения · warning",
      "desc": "Предупреждение: плотный текст — нажатая обводочная кнопка, текст на подложке тона"
    },
    "--color-warning-fg-pressed": {
      "group": "Сообщения · warning",
      "desc": "Предупреждение: нажатая ссылка тона"
    },
    "--color-warning-fill": {
      "group": "Сообщения · warning",
      "desc": "Предупреждение: заливка — бейдж, акцентная кнопка тона"
    },
    "--color-warning-fill-hover": {
      "group": "Сообщения · warning",
      "desc": "Предупреждение: наведение на заливку"
    },
    "--color-warning-fill-pressed": {
      "group": "Сообщения · warning",
      "desc": "Предупреждение: нажатие на заливку"
    },
    "--color-warning-border": {
      "group": "Сообщения · warning",
      "desc": "Предупреждение: отдельная граница — поле, рамка чекбокса"
    },
    "--color-warning-bg": {
      "group": "Сообщения · warning",
      "desc": "Предупреждение: подложка — нажатая обводочная кнопка, Alert"
    },
    "--color-success-fg": {
      "group": "Сообщения · success",
      "desc": "Успех: текст и иконки"
    },
    "--color-success-fg-strong": {
      "group": "Сообщения · success",
      "desc": "Успех: плотный текст — нажатая обводочная кнопка, текст на подложке тона"
    },
    "--color-success-fg-pressed": {
      "group": "Сообщения · success",
      "desc": "Успех: нажатая ссылка тона"
    },
    "--color-success-fg-inverse": {
      "group": "Сообщения · success",
      "desc": "Успех: иконка на инверсной поверхности (тост)"
    },
    "--color-success-fill": {
      "group": "Сообщения · success",
      "desc": "Успех: заливка — бейдж, акцентная кнопка тона"
    },
    "--color-success-fill-hover": {
      "group": "Сообщения · success",
      "desc": "Успех: наведение на заливку"
    },
    "--color-success-fill-pressed": {
      "group": "Сообщения · success",
      "desc": "Успех: нажатие на заливку"
    },
    "--color-success-bg": {
      "group": "Сообщения · success",
      "desc": "Успех: подложка — нажатая обводочная кнопка, Alert"
    },
    "--color-info-fg": {
      "group": "Сообщения · info",
      "desc": "Информация: текст и иконки"
    },
    "--color-info-fg-strong": {
      "group": "Сообщения · info",
      "desc": "Информация: плотный текст — нажатая обводочная кнопка, текст на подложке тона"
    },
    "--color-info-fg-pressed": {
      "group": "Сообщения · info",
      "desc": "Информация: нажатая ссылка тона"
    },
    "--color-info-fg-inverse": {
      "group": "Сообщения · info",
      "desc": "Информация: иконка на инверсной поверхности (тост)"
    },
    "--color-info-fill": {
      "group": "Сообщения · info",
      "desc": "Информация: заливка — бейдж, акцентная кнопка тона"
    },
    "--color-info-fill-hover": {
      "group": "Сообщения · info",
      "desc": "Информация: наведение на заливку"
    },
    "--color-info-fill-pressed": {
      "group": "Сообщения · info",
      "desc": "Информация: нажатие на заливку"
    },
    "--color-info-bg": {
      "group": "Сообщения · info",
      "desc": "Информация: подложка — нажатая обводочная кнопка, Alert"
    },
    "--color-status-green-strong": {
      "group": "Статусы",
      "desc": "Статус зелёный, плотный: текст на подложке"
    },
    "--color-status-green-solid": {
      "group": "Статусы",
      "desc": "Статус зелёный, основной: маркер, сплошная заливка"
    },
    "--color-status-green-mid": {
      "group": "Статусы",
      "desc": "Статус зелёный, средний (56 %)"
    },
    "--color-status-green-soft": {
      "group": "Статусы",
      "desc": "Статус зелёный, мягкий (32 %)"
    },
    "--color-status-green-subtle": {
      "group": "Статусы",
      "desc": "Статус зелёный, светлый (16 %): подложка"
    },
    "--color-status-blue-strong": {
      "group": "Статусы",
      "desc": "Статус синий, плотный: текст на подложке"
    },
    "--color-status-blue-solid": {
      "group": "Статусы",
      "desc": "Статус синий, основной: маркер, сплошная заливка"
    },
    "--color-status-blue-mid": {
      "group": "Статусы",
      "desc": "Статус синий, средний (56 %)"
    },
    "--color-status-blue-soft": {
      "group": "Статусы",
      "desc": "Статус синий, мягкий (32 %)"
    },
    "--color-status-blue-subtle": {
      "group": "Статусы",
      "desc": "Статус синий, светлый (16 %): подложка"
    },
    "--color-status-orange-strong": {
      "group": "Статусы",
      "desc": "Статус оранжевый, плотный: текст на подложке"
    },
    "--color-status-orange-solid": {
      "group": "Статусы",
      "desc": "Статус оранжевый, основной: маркер, сплошная заливка"
    },
    "--color-status-orange-mid": {
      "group": "Статусы",
      "desc": "Статус оранжевый, средний (56 %)"
    },
    "--color-status-orange-soft": {
      "group": "Статусы",
      "desc": "Статус оранжевый, мягкий (32 %)"
    },
    "--color-status-orange-subtle": {
      "group": "Статусы",
      "desc": "Статус оранжевый, светлый (16 %): подложка"
    },
    "--color-status-red-strong": {
      "group": "Статусы",
      "desc": "Статус красный, плотный: текст на подложке"
    },
    "--color-status-red-solid": {
      "group": "Статусы",
      "desc": "Статус красный, основной: маркер, сплошная заливка"
    },
    "--color-status-red-mid": {
      "group": "Статусы",
      "desc": "Статус красный, средний (56 %)"
    },
    "--color-status-red-soft": {
      "group": "Статусы",
      "desc": "Статус красный, мягкий (32 %)"
    },
    "--color-status-red-subtle": {
      "group": "Статусы",
      "desc": "Статус красный, светлый (16 %): подложка"
    },
    "--color-status-purple-strong": {
      "group": "Статусы",
      "desc": "Статус фиолетовый, плотный: текст на подложке"
    },
    "--color-status-purple-solid": {
      "group": "Статусы",
      "desc": "Статус фиолетовый, основной: маркер, сплошная заливка"
    },
    "--color-status-purple-mid": {
      "group": "Статусы",
      "desc": "Статус фиолетовый, средний (56 %)"
    },
    "--color-status-purple-soft": {
      "group": "Статусы",
      "desc": "Статус фиолетовый, мягкий (32 %)"
    },
    "--color-status-purple-subtle": {
      "group": "Статусы",
      "desc": "Статус фиолетовый, светлый (16 %): подложка"
    },
    "--color-status-grey-strong": {
      "group": "Статусы",
      "desc": "Статус серый, плотный: текст на подложке"
    },
    "--color-status-grey-solid": {
      "group": "Статусы",
      "desc": "Статус серый, основной: маркер, сплошная заливка"
    },
    "--color-status-grey-mid": {
      "group": "Статусы",
      "desc": "Статус серый, средний (56 %)"
    },
    "--color-status-grey-soft": {
      "group": "Статусы",
      "desc": "Статус серый, мягкий (32 %)"
    },
    "--color-status-grey-subtle": {
      "group": "Статусы",
      "desc": "Статус серый, светлый (16 %): подложка"
    },
    "--color-status-system-strong": {
      "group": "Статусы",
      "desc": "Статус системный, плотный: текст на подложке"
    },
    "--color-status-system-solid": {
      "group": "Статусы",
      "desc": "Статус системный, основной: маркер, сплошная заливка"
    },
    "--color-status-system-mid": {
      "group": "Статусы",
      "desc": "Статус системный, средний (56 %)"
    },
    "--color-status-system-soft": {
      "group": "Статусы",
      "desc": "Статус системный, мягкий (32 %)"
    },
    "--color-status-system-subtle": {
      "group": "Статусы",
      "desc": "Статус системный, светлый (16 %): подложка"
    },
    "--color-status-disabled-strong": {
      "group": "Статусы",
      "desc": "Статус недоступный, плотный: текст на подложке"
    },
    "--color-status-disabled-solid": {
      "group": "Статусы",
      "desc": "Статус недоступный, основной: маркер, сплошная заливка"
    },
    "--color-status-disabled-mid": {
      "group": "Статусы",
      "desc": "Статус недоступный, средний (56 %)"
    },
    "--color-status-disabled-soft": {
      "group": "Статусы",
      "desc": "Статус недоступный, мягкий (32 %)"
    },
    "--color-status-disabled-subtle": {
      "group": "Статусы",
      "desc": "Статус недоступный, светлый (16 %): подложка"
    },
    "--color-status-accent-strong": {
      "group": "Статусы",
      "desc": "Статус акцентный, плотный: текст на подложке"
    },
    "--color-status-accent-solid": {
      "group": "Статусы",
      "desc": "Статус акцентный, основной: маркер, сплошная заливка"
    },
    "--color-status-accent-mid": {
      "group": "Статусы",
      "desc": "Статус акцентный, средний (56 %)"
    },
    "--color-status-accent-soft": {
      "group": "Статусы",
      "desc": "Статус акцентный, мягкий (32 %)"
    },
    "--color-status-accent-subtle": {
      "group": "Статусы",
      "desc": "Статус акцентный, светлый (16 %): подложка"
    },
    "--color-chart-1": {
      "group": "Графики",
      "desc": "Серия 1 (legacy --ch-blue)"
    },
    "--color-chart-2": {
      "group": "Графики",
      "desc": "Серия 2 (legacy --ch-turquoise)"
    },
    "--color-chart-3": {
      "group": "Графики",
      "desc": "Серия 3 (legacy --ch-indigo)"
    },
    "--color-chart-4": {
      "group": "Графики",
      "desc": "Серия 4 (legacy --ch-orange)"
    },
    "--color-chart-5": {
      "group": "Графики",
      "desc": "Серия 5 (legacy --ch-pastel-green)"
    },
    "--color-chart-6": {
      "group": "Графики",
      "desc": "Серия 6 (legacy --ch-purple)"
    },
    "--color-chart-7": {
      "group": "Графики",
      "desc": "Серия 7 (legacy --ch-light-blue)"
    },
    "--color-chart-8": {
      "group": "Графики",
      "desc": "Серия 8 (legacy --ch-yellow)"
    },
    "--color-chart-9": {
      "group": "Графики",
      "desc": "Серия 9 (legacy --ch-shiny-green)"
    },
    "--color-chart-10": {
      "group": "Графики",
      "desc": "Серия 10 (legacy --ch-pink-purple)"
    },
    "--color-chart-11": {
      "group": "Графики",
      "desc": "Серия 11 (legacy --ch-red)"
    },
    "--color-chart-12": {
      "group": "Графики",
      "desc": "Серия 12 (legacy --ch-pale-purple)"
    },
    "--color-shadow": {
      "group": "Тень",
      "desc": "Цвет тени: --elevation-*, тени компонентов (непрозрачность — в месте применения)"
    }
  },
  "values": {
    "--color-bg-page": "var(--ramp-neutral-50)",
    "--color-bg-surface": "var(--ramp-grey-50)",
    "--color-bg-raised": "var(--ramp-grey-50)",
    "--color-bg-nav": "var(--ramp-grey-100)",
    "--color-bg-inverse": "var(--ramp-neutral-900)",
    "--color-bg-sunken": "var(--ramp-neutral-100)",
    "--color-bg-float": "var(--ramp-grey-50)",
    "--color-bg-float-hover": "var(--ramp-neutral-100)",
    "--color-bg-muted": "var(--ramp-neutral-100)",
    "--color-bg-muted-strong": "var(--ramp-neutral-400)",
    "--color-bg-hover": "var(--ramp-neutral-100)",
    "--color-bg-pressed": "var(--ramp-neutral-200)",
    "--color-bg-selected-hover": "var(--ramp-neutral-200)",
    "--color-bg-tint": "color-mix(in srgb, var(--ramp-neutral-900) 8%, transparent)",
    "--color-bg-tint-subtle": "color-mix(in srgb, var(--ramp-neutral-900) 4%, transparent)",
    "--color-bg-veil": "color-mix(in srgb, var(--ramp-grey-50) 50%, transparent)",
    "--color-bg-scrim": "color-mix(in srgb, var(--ramp-neutral-950) 32%, transparent)",
    "--color-row-hover": "var(--ramp-neutral-50)",
    "--color-row-selected": "var(--ramp-neutral-100)",
    "--color-row-selected-hover": "var(--ramp-neutral-200)",
    "--color-row-accent": "var(--ramp-amber-50)",
    "--color-row-accent-hover": "var(--ramp-amber-100)",
    "--color-row-accent-selected": "var(--ramp-amber-200)",
    "--color-row-pinned": "var(--ramp-neutral-50)",
    "--color-row-pinned-hover": "var(--ramp-neutral-100)",
    "--color-row-pinned-selected": "var(--ramp-neutral-100)",
    "--color-fg-default": "var(--ramp-neutral-900)",
    "--color-fg-secondary": "var(--ramp-neutral-600)",
    "--color-fg-muted": "var(--ramp-neutral-400)",
    "--color-fg-on-fill": "var(--ramp-grey-50)",
    "--color-fg-inverse": "var(--ramp-grey-50)",
    "--color-fg-icon": "var(--ramp-neutral-400)",
    "--color-fg-icon-strong": "var(--ramp-accent-600)",
    "--color-border-default": "var(--ramp-neutral-500)",
    "--color-border-subtle": "var(--ramp-neutral-200)",
    "--color-border-strong": "var(--ramp-neutral-600)",
    "--color-accent-fill": "var(--ramp-accent-600)",
    "--color-accent-fill-hover": "var(--ramp-accent-700)",
    "--color-accent-fill-pressed": "var(--ramp-accent-800)",
    "--color-accent-fg": "var(--ramp-accent-700)",
    "--color-accent-fg-strong": "var(--ramp-accent-800)",
    "--color-accent-fg-pressed": "var(--ramp-accent-800)",
    "--color-accent-border": "var(--ramp-accent-500)",
    "--color-accent-muted": "var(--ramp-accent-300)",
    "--color-accent-bg": "color-mix(in srgb, var(--ramp-accent-600) 8%, transparent)",
    "--color-accent-bg-subtle": "color-mix(in srgb, var(--ramp-accent-600) 4%, transparent)",
    "--color-accent-bg-hover": "color-mix(in srgb, var(--ramp-accent-600) 10%, transparent)",
    "--color-accent-bg-pressed": "color-mix(in srgb, var(--ramp-accent-600) 18%, transparent)",
    "--color-accent-shadow": "color-mix(in srgb, var(--ramp-accent-950) 24%, transparent)",
    "--color-link": "var(--ramp-accent-700)",
    "--color-link-hover": "var(--ramp-accent-800)",
    "--color-link-pressed": "var(--ramp-accent-900)",
    "--color-link-muted": "var(--ramp-accent-300)",
    "--color-secondary-bg": "color-mix(in srgb, var(--ramp-accent-300) 32%, transparent)",
    "--color-secondary-bg-subtle": "color-mix(in srgb, var(--ramp-accent-300) 16%, transparent)",
    "--color-control-track": "var(--ramp-neutral-200)",
    "--color-control-track-hover": "var(--ramp-neutral-300)",
    "--color-control-track-on": "var(--ramp-accent-200)",
    "--color-control-track-on-hover": "var(--ramp-accent-300)",
    "--color-control-thumb": "var(--ramp-grey-50)",
    "--color-scrollbar": "var(--ramp-neutral-400)",
    "--color-focus-ring": "var(--ramp-accent-600)",
    "--color-disabled-fill": "var(--ramp-neutral-300)",
    "--color-disabled-border": "var(--ramp-neutral-200)",
    "--color-disabled-border-subtle": "var(--ramp-neutral-100)",
    "--color-disabled-bg": "var(--ramp-neutral-100)",
    "--color-disabled-veil": "color-mix(in srgb, var(--ramp-grey-50) 56%, transparent)",
    "--color-danger-fg": "var(--ramp-red-800)",
    "--color-danger-fg-strong": "var(--ramp-red-900)",
    "--color-danger-fg-pressed": "var(--ramp-red-900)",
    "--color-danger-fg-inverse": "var(--ramp-grey-50)",
    "--color-danger-fill": "var(--ramp-red-700)",
    "--color-danger-fill-hover": "var(--ramp-red-800)",
    "--color-danger-fill-pressed": "var(--ramp-red-900)",
    "--color-danger-border": "var(--ramp-red-500)",
    "--color-danger-bg": "var(--ramp-red-50)",
    "--color-warning-fg": "var(--ramp-amber-800)",
    "--color-warning-fg-strong": "var(--ramp-amber-900)",
    "--color-warning-fg-pressed": "var(--ramp-amber-900)",
    "--color-warning-fill": "var(--ramp-amber-700)",
    "--color-warning-fill-hover": "var(--ramp-amber-800)",
    "--color-warning-fill-pressed": "var(--ramp-amber-900)",
    "--color-warning-border": "var(--ramp-amber-500)",
    "--color-warning-bg": "var(--ramp-amber-50)",
    "--color-success-fg": "var(--ramp-light-green-800)",
    "--color-success-fg-strong": "var(--ramp-light-green-900)",
    "--color-success-fg-pressed": "var(--ramp-light-green-900)",
    "--color-success-fg-inverse": "var(--ramp-grey-50)",
    "--color-success-fill": "var(--ramp-light-green-700)",
    "--color-success-fill-hover": "var(--ramp-light-green-800)",
    "--color-success-fill-pressed": "var(--ramp-light-green-900)",
    "--color-success-bg": "var(--ramp-light-green-50)",
    "--color-info-fg": "var(--ramp-light-blue-800)",
    "--color-info-fg-strong": "var(--ramp-light-blue-900)",
    "--color-info-fg-pressed": "var(--ramp-light-blue-900)",
    "--color-info-fg-inverse": "var(--ramp-grey-50)",
    "--color-info-fill": "var(--ramp-light-blue-700)",
    "--color-info-fill-hover": "var(--ramp-light-blue-800)",
    "--color-info-fill-pressed": "var(--ramp-light-blue-900)",
    "--color-info-bg": "var(--ramp-light-blue-50)",
    "--color-danger-bg-subtle": "var(--ramp-red-100)",
    "--color-danger-bg-strong": "var(--ramp-red-200)",
    "--color-status-green-strong": "var(--ramp-green-800)",
    "--color-status-green-solid": "var(--ramp-green-500)",
    "--color-status-green-mid": "color-mix(in srgb, var(--ramp-green-500) 56%, transparent)",
    "--color-status-green-soft": "color-mix(in srgb, var(--ramp-green-500) 32%, transparent)",
    "--color-status-green-subtle": "color-mix(in srgb, var(--ramp-green-500) 16%, transparent)",
    "--color-status-blue-strong": "var(--ramp-light-blue-800)",
    "--color-status-blue-solid": "var(--ramp-light-blue-500)",
    "--color-status-blue-mid": "color-mix(in srgb, var(--ramp-light-blue-500) 56%, transparent)",
    "--color-status-blue-soft": "color-mix(in srgb, var(--ramp-light-blue-500) 32%, transparent)",
    "--color-status-blue-subtle": "color-mix(in srgb, var(--ramp-light-blue-500) 16%, transparent)",
    "--color-status-orange-strong": "var(--ramp-amber-800)",
    "--color-status-orange-solid": "var(--ramp-amber-500)",
    "--color-status-orange-mid": "color-mix(in srgb, var(--ramp-amber-500) 56%, transparent)",
    "--color-status-orange-soft": "color-mix(in srgb, var(--ramp-amber-500) 32%, transparent)",
    "--color-status-orange-subtle": "color-mix(in srgb, var(--ramp-amber-500) 16%, transparent)",
    "--color-status-red-strong": "var(--ramp-red-800)",
    "--color-status-red-solid": "var(--ramp-red-500)",
    "--color-status-red-mid": "color-mix(in srgb, var(--ramp-red-500) 56%, transparent)",
    "--color-status-red-soft": "color-mix(in srgb, var(--ramp-red-500) 32%, transparent)",
    "--color-status-red-subtle": "color-mix(in srgb, var(--ramp-red-500) 16%, transparent)",
    "--color-status-purple-strong": "var(--ramp-deep-purple-800)",
    "--color-status-purple-solid": "var(--ramp-deep-purple-500)",
    "--color-status-purple-mid": "color-mix(in srgb, var(--ramp-deep-purple-500) 56%, transparent)",
    "--color-status-purple-soft": "color-mix(in srgb, var(--ramp-deep-purple-500) 32%, transparent)",
    "--color-status-purple-subtle": "color-mix(in srgb, var(--ramp-deep-purple-500) 16%, transparent)",
    "--color-status-grey-strong": "var(--ramp-grey-800)",
    "--color-status-grey-solid": "var(--ramp-grey-500)",
    "--color-status-grey-mid": "color-mix(in srgb, var(--ramp-grey-500) 56%, transparent)",
    "--color-status-grey-soft": "color-mix(in srgb, var(--ramp-grey-500) 32%, transparent)",
    "--color-status-grey-subtle": "color-mix(in srgb, var(--ramp-grey-500) 16%, transparent)",
    "--color-status-system-strong": "var(--ramp-neutral-800)",
    "--color-status-system-solid": "var(--ramp-neutral-500)",
    "--color-status-system-mid": "color-mix(in srgb, var(--ramp-neutral-500) 56%, transparent)",
    "--color-status-system-soft": "color-mix(in srgb, var(--ramp-neutral-500) 32%, transparent)",
    "--color-status-system-subtle": "color-mix(in srgb, var(--ramp-neutral-500) 16%, transparent)",
    "--color-status-disabled-strong": "color-mix(in srgb, var(--ramp-neutral-600) 40%, transparent)",
    "--color-status-disabled-solid": "color-mix(in srgb, var(--ramp-neutral-600) 24%, transparent)",
    "--color-status-disabled-mid": "color-mix(in srgb, var(--ramp-neutral-600) 16%, transparent)",
    "--color-status-disabled-soft": "color-mix(in srgb, var(--ramp-neutral-600) 8%, transparent)",
    "--color-status-disabled-subtle": "color-mix(in srgb, var(--ramp-neutral-600) 4%, transparent)",
    "--color-status-accent-strong": "var(--ramp-accent-800)",
    "--color-status-accent-solid": "var(--ramp-accent-500)",
    "--color-status-accent-mid": "color-mix(in srgb, var(--ramp-accent-500) 56%, transparent)",
    "--color-status-accent-soft": "color-mix(in srgb, var(--ramp-accent-500) 32%, transparent)",
    "--color-status-accent-subtle": "color-mix(in srgb, var(--ramp-accent-500) 16%, transparent)",
    "--color-chart-1": "#5B9CFA",
    "--color-chart-2": "#31D4A8",
    "--color-chart-3": "#8D87F9",
    "--color-chart-4": "#F9A580",
    "--color-chart-5": "#76E385",
    "--color-chart-6": "#CB88F8",
    "--color-chart-7": "#7DCAFA",
    "--color-chart-8": "#FFD081",
    "--color-chart-9": "#8CCB5E",
    "--color-chart-10": "#EC7390",
    "--color-chart-11": "#F99290",
    "--color-chart-12": "#F58BD8",
    "--color-shadow": "var(--ramp-neutral-950)"
  },
  "themeValues": {
    "ibp-light": {
      "--color-accent-fill": "var(--ramp-accent-500)",
      "--color-accent-fill-hover": "var(--ramp-accent-600)",
      "--color-accent-fill-pressed": "var(--ramp-accent-700)",
      "--color-accent-bg": "color-mix(in srgb, var(--ramp-accent-500) 8%, transparent)",
      "--color-accent-bg-subtle": "color-mix(in srgb, var(--ramp-accent-500) 4%, transparent)",
      "--color-accent-bg-hover": "color-mix(in srgb, var(--ramp-accent-500) 10%, transparent)",
      "--color-accent-bg-pressed": "color-mix(in srgb, var(--ramp-accent-500) 18%, transparent)",
      "--color-secondary-bg": "color-mix(in srgb, var(--ramp-accent-200) 32%, transparent)",
      "--color-secondary-bg-subtle": "color-mix(in srgb, var(--ramp-accent-200) 16%, transparent)",
      "--color-focus-ring": "var(--ramp-accent-500)",
      "--color-link": "var(--ramp-accent-500)",
      "--color-link-hover": "var(--ramp-accent-600)",
      "--color-link-pressed": "var(--ramp-accent-700)",
      "--color-fg-icon": "var(--ramp-neutral-400)",
      "--color-fg-icon-strong": "var(--ramp-accent-600)",
      "--color-fg-muted": "var(--ramp-neutral-500)",
      "--color-border-default": "var(--ramp-neutral-400)",
      "--color-bg-nav": "var(--ramp-grey-50)",
      "--color-row-pinned": "var(--ramp-neutral-100)",
      "--color-row-pinned-hover": "var(--ramp-neutral-200)",
      "--color-row-pinned-selected": "var(--ramp-neutral-200)",
      "--color-danger-fg": "var(--red-300)",
      "--color-danger-fg-strong": "var(--red-700)",
      "--color-danger-fg-pressed": "var(--red-700)",
      "--color-danger-fill": "var(--red-300)",
      "--color-danger-fill-hover": "var(--red-700)",
      "--color-danger-fill-pressed": "var(--red-200)",
      "--color-danger-bg": "var(--red-A200)",
      "--color-danger-bg-subtle": "var(--red-A100)",
      "--color-danger-bg-strong": "var(--red-A400)",
      "--color-warning-fg": "var(--amber-600)",
      "--color-warning-fg-strong": "var(--amber-800)",
      "--color-warning-fg-pressed": "var(--amber-800)",
      "--color-warning-fill": "var(--amber-600)",
      "--color-warning-fill-hover": "var(--amber-800)",
      "--color-warning-fill-pressed": "var(--amber-400)",
      "--color-warning-bg": "var(--amber-50)",
      "--color-success-fg": "var(--light-green-600)",
      "--color-success-fg-strong": "var(--light-green-800)",
      "--color-success-fg-pressed": "var(--light-green-800)",
      "--color-success-fill": "var(--light-green-600)",
      "--color-success-fill-hover": "var(--light-green-800)",
      "--color-success-fill-pressed": "var(--light-green-400)",
      "--color-success-bg": "var(--light-green-50)",
      "--color-info-fg": "var(--light-blue-600)",
      "--color-info-fg-strong": "var(--light-blue-900)",
      "--color-info-fg-pressed": "var(--light-blue-900)",
      "--color-info-fill": "var(--light-blue-600)",
      "--color-info-fill-hover": "var(--light-blue-900)",
      "--color-info-fill-pressed": "var(--light-blue-400)",
      "--color-info-bg": "var(--light-blue-50)",
      "--color-status-green-strong": "var(--green-800)",
      "--color-status-green-solid": "var(--green-500)",
      "--color-status-green-mid": "color-mix(in srgb, var(--green-500) 56%, transparent)",
      "--color-status-green-soft": "color-mix(in srgb, var(--green-500) 32%, transparent)",
      "--color-status-green-subtle": "color-mix(in srgb, var(--green-500) 16%, transparent)",
      "--color-status-blue-strong": "var(--light-blue-900)",
      "--color-status-blue-solid": "var(--light-blue-500)",
      "--color-status-blue-mid": "color-mix(in srgb, var(--light-blue-500) 56%, transparent)",
      "--color-status-blue-soft": "color-mix(in srgb, var(--light-blue-500) 32%, transparent)",
      "--color-status-blue-subtle": "color-mix(in srgb, var(--light-blue-500) 16%, transparent)",
      "--color-status-orange-strong": "var(--amber-900)",
      "--color-status-orange-solid": "var(--amber-700)",
      "--color-status-orange-mid": "color-mix(in srgb, var(--amber-700) 56%, transparent)",
      "--color-status-orange-soft": "color-mix(in srgb, var(--amber-700) 32%, transparent)",
      "--color-status-orange-subtle": "color-mix(in srgb, var(--amber-700) 16%, transparent)",
      "--color-status-red-strong": "var(--red-700)",
      "--color-status-red-solid": "var(--red-400)",
      "--color-status-red-mid": "color-mix(in srgb, var(--red-400) 56%, transparent)",
      "--color-status-red-soft": "color-mix(in srgb, var(--red-400) 32%, transparent)",
      "--color-status-red-subtle": "color-mix(in srgb, var(--red-400) 16%, transparent)",
      "--color-status-purple-strong": "var(--deep-purple-900)",
      "--color-status-purple-solid": "var(--deep-purple-400)",
      "--color-status-purple-mid": "color-mix(in srgb, var(--deep-purple-400) 56%, transparent)",
      "--color-status-purple-soft": "color-mix(in srgb, var(--deep-purple-400) 32%, transparent)",
      "--color-status-purple-subtle": "color-mix(in srgb, var(--deep-purple-400) 16%, transparent)",
      "--color-status-grey-strong": "var(--cgrey-900)",
      "--color-status-grey-solid": "var(--cgrey-700)",
      "--color-status-grey-mid": "color-mix(in srgb, var(--cgrey-700) 56%, transparent)",
      "--color-status-grey-soft": "color-mix(in srgb, var(--cgrey-700) 32%, transparent)",
      "--color-status-grey-subtle": "color-mix(in srgb, var(--cgrey-700) 16%, transparent)",
      "--color-status-system-strong": "var(--cgrey-600)",
      "--color-status-system-solid": "var(--swamp-400)",
      "--color-status-system-mid": "color-mix(in srgb, var(--swamp-400) 56%, transparent)",
      "--color-status-system-soft": "color-mix(in srgb, var(--swamp-400) 32%, transparent)",
      "--color-status-system-subtle": "color-mix(in srgb, var(--swamp-400) 16%, transparent)",
      "--color-status-disabled-strong": "color-mix(in srgb, var(--cgrey-600) 40%, transparent)",
      "--color-status-disabled-solid": "color-mix(in srgb, var(--cgrey-600) 24%, transparent)",
      "--color-status-disabled-mid": "color-mix(in srgb, var(--cgrey-600) 16%, transparent)",
      "--color-status-disabled-soft": "color-mix(in srgb, var(--cgrey-600) 8%, transparent)",
      "--color-status-disabled-subtle": "color-mix(in srgb, var(--cgrey-600) 4%, transparent)",
      "--color-status-accent-strong": "var(--emerald-900)",
      "--color-status-accent-solid": "var(--emerald-500)",
      "--color-status-accent-mid": "color-mix(in srgb, var(--emerald-500) 56%, transparent)",
      "--color-status-accent-soft": "color-mix(in srgb, var(--emerald-500) 32%, transparent)",
      "--color-status-accent-subtle": "color-mix(in srgb, var(--emerald-500) 16%, transparent)"
    },
    "ibp-dark": {
      "--color-bg-sunken": "var(--ramp-neutral-100)",
      "--color-bg-float": "var(--ramp-neutral-300)",
      "--color-bg-float-hover": "color-mix(in srgb, var(--ramp-neutral-950) 7%, transparent)",
      "--color-bg-surface": "var(--ramp-neutral-100)",
      "--color-bg-raised": "var(--ramp-neutral-200)",
      "--color-bg-muted": "var(--ramp-neutral-200)",
      "--color-bg-hover": "var(--ramp-neutral-200)",
      "--color-bg-pressed": "var(--ramp-neutral-300)",
      "--color-bg-selected-hover": "var(--ramp-neutral-300)",
      "--color-bg-inverse": "var(--ramp-neutral-200)",
      "--color-fg-inverse": "var(--ramp-neutral-900)",
      "--color-bg-scrim": "color-mix(in srgb, var(--ramp-neutral-50) 64%, transparent)",
      "--color-shadow": "var(--ramp-neutral-50)",
      "--color-accent-shadow": "color-mix(in srgb, var(--ramp-accent-300) 40%, transparent)",
      "--color-row-hover": "var(--ramp-neutral-200)",
      "--color-row-selected": "var(--ramp-neutral-200)",
      "--color-row-selected-hover": "var(--ramp-neutral-300)",
      "--color-row-pinned": "var(--ramp-neutral-200)",
      "--color-row-pinned-hover": "var(--ramp-neutral-300)",
      "--color-row-pinned-selected": "var(--ramp-neutral-200)",
      "--color-bg-nav": "var(--ramp-neutral-100)",
      "--color-control-thumb": "var(--ramp-neutral-700)",
      "--color-fg-icon": "var(--ramp-neutral-600)",
      "--color-fg-icon-strong": "var(--ramp-accent-900)",
      "--color-accent-muted": "var(--ramp-accent-700)",
      "--color-fg-on-fill": "var(--ramp-neutral-950)",
      "--color-border-subtle": "var(--ramp-neutral-300)",
      "--color-border-default": "var(--ramp-neutral-400)"
    },
    "service": {
      "--color-bg-sunken": "var(--ramp-neutral-100)",
      "--color-bg-float": "var(--ramp-neutral-300)",
      "--color-bg-float-hover": "color-mix(in srgb, var(--ramp-neutral-950) 7%, transparent)",
      "--color-bg-surface": "var(--ramp-neutral-100)",
      "--color-bg-raised": "var(--ramp-neutral-200)",
      "--color-bg-muted": "var(--ramp-neutral-200)",
      "--color-bg-hover": "var(--ramp-neutral-200)",
      "--color-bg-pressed": "var(--ramp-neutral-300)",
      "--color-bg-selected-hover": "var(--ramp-neutral-300)",
      "--color-bg-inverse": "var(--ramp-neutral-200)",
      "--color-fg-inverse": "var(--ramp-neutral-900)",
      "--color-bg-scrim": "color-mix(in srgb, var(--ramp-neutral-50) 64%, transparent)",
      "--color-shadow": "var(--ramp-neutral-50)",
      "--color-accent-shadow": "color-mix(in srgb, var(--ramp-accent-300) 40%, transparent)",
      "--color-row-hover": "var(--ramp-neutral-200)",
      "--color-row-selected": "var(--ramp-neutral-200)",
      "--color-row-selected-hover": "var(--ramp-neutral-300)",
      "--color-row-pinned": "var(--ramp-neutral-200)",
      "--color-row-pinned-hover": "var(--ramp-neutral-300)",
      "--color-row-pinned-selected": "var(--ramp-neutral-200)",
      "--color-bg-nav": "var(--ramp-neutral-100)",
      "--color-control-thumb": "var(--ramp-neutral-700)",
      "--color-fg-icon": "var(--ramp-neutral-600)",
      "--color-fg-icon-strong": "var(--ramp-accent-900)",
      "--color-accent-muted": "var(--ramp-accent-700)",
      "--color-fg-on-fill": "var(--ramp-neutral-950)",
      "--color-border-subtle": "var(--ramp-neutral-300)",
      "--color-border-default": "var(--ramp-neutral-400)"
    }
  },
  "map": {
    "--bg-popup": "--color-bg-raised",
    "--bg-tile": "--color-bg-surface",
    "--bg-main-menu": "--color-bg-nav",
    "--bg-hint": "--color-bg-inverse",
    "--bg-page": "--color-bg-page",
    "--bg-table-default": "--color-bg-surface",
    "--bg-table-default-hover": "--color-row-hover",
    "--bg-table-default-focus": "--color-row-selected",
    "--bg-table-accent": "--color-row-accent",
    "--bg-table-accent-hover": "--color-row-accent-hover",
    "--bg-table-accent-focus": "--color-row-accent-selected",
    "--bg-table-pinned": "--color-row-pinned",
    "--bg-table-pinned-hover": "--color-row-pinned-hover",
    "--bg-table-pinned-focus": "--color-row-pinned-selected",
    "--border-primary": "--color-border-default",
    "--border-light": "--color-border-subtle",
    "--border-dark": "--color-border-strong",
    "--disabled-border": "--color-disabled-border-subtle",
    "--text-primary": "--color-fg-default",
    "--text-secondary": "--color-fg-secondary",
    "--text-inactive": "--color-fg-muted",
    "--text-on-dark": "--color-fg-on-fill",
    "--primary": "--color-accent-fill",
    "--primary-dark": "--color-accent-fill-hover",
    "--primary-light": "--color-accent-muted",
    "--primary-bg": "--color-accent-bg",
    "--primary-bg-light": "--color-accent-bg-subtle",
    "--primary-bg-semy-transparent": "--color-bg-veil",
    "--secondary": "--color-fg-icon",
    "--secondary-dark": "--color-fg-icon-strong",
    "--secondary-light": "--color-control-track-on",
    "--secondary-bg": "--color-secondary-bg",
    "--secondary-bg-light": "--color-secondary-bg-subtle",
    "--tertiary": "--color-bg-muted",
    "--tertiary-dark": "--color-bg-muted-strong",
    "--tertiary-light": "--color-bg-hover",
    "--tertiary-bg": "--color-bg-tint",
    "--tertiary-bg-light": "--color-bg-tint-subtle",
    "--error": "--color-danger-fg",
    "--error-light": "--color-danger-fill-pressed",
    "--error-dark": "--color-danger-fg-strong",
    "--error-bg": "--color-danger-bg",
    "--error-bg-light": "--color-danger-bg-subtle",
    "--error-bg-dark": "--color-danger-bg-strong",
    "--warning": "--color-warning-fg",
    "--warning-light": "--color-warning-fill-pressed",
    "--warning-dark": "--color-warning-fg-strong",
    "--warning-bg": "--color-warning-bg",
    "--success": "--color-success-fg",
    "--success-light": "--color-success-fill-pressed",
    "--success-dark": "--color-success-fg-strong",
    "--success-bg": "--color-success-bg",
    "--info": "--color-info-fg",
    "--info-light": "--color-info-fill-pressed",
    "--info-dark": "--color-info-fg-strong",
    "--info-bg": "--color-info-bg",
    "--link": "--color-link",
    "--link-light": "--color-link-muted",
    "--link-dark": "--color-link-hover",
    "--disabled": "--color-disabled-fill",
    "--disabled-bg": "--color-disabled-bg",
    "--disabled-bg-semy-transparent": "--color-disabled-veil",
    "--st-green-dark": "--color-status-green-strong",
    "--st-green": "--color-status-green-solid",
    "--st-green-mid": "--color-status-green-mid",
    "--st-green-midlight": "--color-status-green-soft",
    "--st-green-light": "--color-status-green-subtle",
    "--st-blue-dark": "--color-status-blue-strong",
    "--st-blue": "--color-status-blue-solid",
    "--st-blue-mid": "--color-status-blue-mid",
    "--st-blue-midlight": "--color-status-blue-soft",
    "--st-blue-light": "--color-status-blue-subtle",
    "--st-orange-dark": "--color-status-orange-strong",
    "--st-orange": "--color-status-orange-solid",
    "--st-orange-mid": "--color-status-orange-mid",
    "--st-orange-midlight": "--color-status-orange-soft",
    "--st-orange-light": "--color-status-orange-subtle",
    "--st-red-dark": "--color-status-red-strong",
    "--st-red": "--color-status-red-solid",
    "--st-red-mid": "--color-status-red-mid",
    "--st-red-midlight": "--color-status-red-soft",
    "--st-red-light": "--color-status-red-subtle",
    "--st-dpurple-dark": "--color-status-purple-strong",
    "--st-dpurple": "--color-status-purple-solid",
    "--st-dpurple-mid": "--color-status-purple-mid",
    "--st-dpurple-midlight": "--color-status-purple-soft",
    "--st-dpurple-light": "--color-status-purple-subtle",
    "--st-grey-dark": "--color-status-grey-strong",
    "--st-grey": "--color-status-grey-solid",
    "--st-grey-mid": "--color-status-grey-mid",
    "--st-grey-midlight": "--color-status-grey-soft",
    "--st-grey-light": "--color-status-grey-subtle",
    "--st-system-dark": "--color-status-system-strong",
    "--st-system": "--color-status-system-solid",
    "--st-system-mid": "--color-status-system-mid",
    "--st-system-midlight": "--color-status-system-soft",
    "--st-system-light": "--color-status-system-subtle",
    "--st-disabled-dark": "--color-status-disabled-strong",
    "--st-disabled": "--color-status-disabled-solid",
    "--st-disabled-mid": "--color-status-disabled-mid",
    "--st-disabled-midlight": "--color-status-disabled-soft",
    "--st-disabled-light": "--color-status-disabled-subtle",
    "--st-primary-dark": "--color-status-accent-strong",
    "--st-primary": "--color-status-accent-solid",
    "--st-primary-mid": "--color-status-accent-mid",
    "--st-primary-midlight": "--color-status-accent-soft",
    "--st-primary-light": "--color-status-accent-subtle",
    "--ch-red": "--color-chart-11",
    "--ch-orange": "--color-chart-4",
    "--ch-yellow": "--color-chart-8",
    "--ch-shiny-green": "--color-chart-9",
    "--ch-pastel-green": "--color-chart-5",
    "--ch-turquoise": "--color-chart-2",
    "--ch-light-blue": "--color-chart-7",
    "--ch-blue": "--color-chart-1",
    "--ch-indigo": "--color-chart-3",
    "--ch-purple": "--color-chart-6",
    "--ch-pale-purple": "--color-chart-12",
    "--ch-pink-purple": "--color-chart-10"
  },
  "elevation": [
    {
      "name": "--elevation-1",
      "from": "0 1px 2px rgba(40, 50, 55, .28)",
      "value": "0 1px 3px color-mix(in srgb, var(--color-shadow) 10%, transparent), 0 1px 2px -1px color-mix(in srgb, var(--color-shadow) 10%, transparent)"
    },
    {
      "name": "--elevation-2",
      "from": "0 10px 30px rgba(40, 50, 55, .16)",
      "value": "0 4px 6px -1px color-mix(in srgb, var(--color-shadow) 10%, transparent), 0 2px 4px -2px color-mix(in srgb, var(--color-shadow) 6%, transparent)"
    },
    {
      "name": "--elevation-3",
      "from": "0 14px 38px rgba(40, 50, 55, .18)",
      "value": "0 12px 16px -4px color-mix(in srgb, var(--color-shadow) 8%, transparent), 0 4px 6px -2px color-mix(in srgb, var(--color-shadow) 3%, transparent), 0 2px 2px -1px color-mix(in srgb, var(--color-shadow) 4%, transparent)"
    },
    {
      "name": "--elevation-4",
      "from": "0 18px 48px rgba(40, 50, 55, .20)",
      "value": "0 20px 24px -4px color-mix(in srgb, var(--color-shadow) 8%, transparent), 0 8px 8px -4px color-mix(in srgb, var(--color-shadow) 3%, transparent), 0 3px 3px -1.5px color-mix(in srgb, var(--color-shadow) 4%, transparent)"
    },
    {
      "name": "--elevation-5",
      "from": "0 22px 58px rgba(40, 50, 55, .22)",
      "value": "0 24px 48px -12px color-mix(in srgb, var(--color-shadow) 18%, transparent), 0 4px 4px -2px color-mix(in srgb, var(--color-shadow) 4%, transparent)"
    },
    {
      "name": "--shadow-modal-form",
      "from": "0 24px 64px rgba(40, 50, 55, .28)",
      "value": "0 32px 64px -12px color-mix(in srgb, var(--color-shadow) 14%, transparent), 0 5px 5px -2.5px color-mix(in srgb, var(--color-shadow) 4%, transparent)"
    }
  ],
  "contrast": [
    {
      "fg": "--color-fg-default",
      "bg": "--color-bg-page",
      "min": 4.5,
      "required": true
    },
    {
      "fg": "--color-fg-default",
      "bg": "--color-bg-surface",
      "min": 4.5,
      "required": true
    },
    {
      "fg": "--color-fg-default",
      "bg": "--color-bg-raised",
      "min": 4.5,
      "required": true
    },
    {
      "fg": "--color-fg-secondary",
      "bg": "--color-bg-surface",
      "min": 4.5,
      "required": true
    },
    {
      "fg": "--color-fg-inverse",
      "bg": "--color-bg-inverse",
      "min": 4.5,
      "required": true
    },
    {
      "fg": "--color-accent-fg",
      "bg": "--color-bg-surface",
      "min": 4.5,
      "required": true
    },
    {
      "fg": "--color-link",
      "bg": "--color-bg-surface",
      "min": 4.5,
      "required": true,
      "exempt": [
        "ibp-light"
      ]
    },
    {
      "fg": "--color-fg-on-fill",
      "bg": "--color-accent-fill",
      "min": 4.5,
      "required": true,
      "exempt": [
        "ibp-light",
        "ibp-dark",
        "service"
      ]
    },
    {
      "fg": "--color-border-default",
      "bg": "--color-bg-surface",
      "min": 3,
      "required": true,
      "exempt": [
        "ibp-light",
        "ibp-dark",
        "service"
      ]
    },
    {
      "fg": "--color-border-strong",
      "bg": "--color-bg-surface",
      "min": 3,
      "required": true
    },
    {
      "fg": "--color-danger-fg",
      "bg": "--color-bg-surface",
      "min": 4.5,
      "required": true,
      "exempt": [
        "ibp-light"
      ]
    },
    {
      "fg": "--color-warning-fg",
      "bg": "--color-bg-surface",
      "min": 4.5,
      "required": true,
      "exempt": [
        "ibp-light"
      ]
    },
    {
      "fg": "--color-success-fg",
      "bg": "--color-bg-surface",
      "min": 4.5,
      "required": true,
      "exempt": [
        "ibp-light"
      ]
    },
    {
      "fg": "--color-info-fg",
      "bg": "--color-bg-surface",
      "min": 4.5,
      "required": true,
      "exempt": [
        "ibp-light"
      ]
    },
    {
      "fg": "--color-fg-on-fill",
      "bg": "--color-danger-fill",
      "min": 4.5,
      "required": true,
      "exempt": [
        "ibp-light",
        "ibp-dark",
        "service"
      ]
    },
    {
      "fg": "--color-fg-on-fill",
      "bg": "--color-success-fill",
      "min": 4.5,
      "required": true,
      "exempt": [
        "ibp-light",
        "ibp-dark",
        "service"
      ]
    },
    {
      "fg": "--color-fg-on-fill",
      "bg": "--color-info-fill",
      "min": 4.5,
      "required": true,
      "exempt": [
        "ibp-light",
        "ibp-dark",
        "service"
      ]
    }
  ],
  "rules": [
    {
      "file": "components/atoms/Avatar/Avatar.css",
      "line": 43,
      "selector": ".av",
      "prop": "background",
      "from": "var(--swamp-100)",
      "value": "var(--color-bg-muted)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Avatar/Avatar.css",
      "line": 84,
      "selector": ".av--accent",
      "prop": "background",
      "from": "color-mix(in srgb, var(--primary) 14%, var(--mgrey-50))",
      "value": "var(--color-accent-bg)",
      "kind": "мимо токена",
      "why": "акцент 14 % поверх белого — акцентная подложка"
    },
    {
      "file": "components/atoms/Avatar/Avatar.css",
      "line": 84,
      "selector": ".av--accent",
      "prop": "color",
      "from": "var(--primary-dark)",
      "value": "var(--color-accent-fg-strong)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Avatar/Avatar.css",
      "line": 85,
      "selector": ".av--accent .av__icon",
      "prop": "color",
      "from": "var(--primary-dark)",
      "value": "var(--color-accent-fg-strong)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Avatar/Avatar.css",
      "line": 90,
      "selector": ".av--button:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Avatar/Avatar.css",
      "line": 144,
      "selector": ".av-group__more",
      "prop": "background",
      "from": "var(--cgrey-100)",
      "value": "var(--color-bg-muted)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Badge/Badge.css",
      "line": 47,
      "selector": ".badge",
      "prop": "background",
      "from": "var(--cgrey-100)",
      "value": "var(--color-bg-muted)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Badge/Badge.css",
      "line": 74,
      "selector": ".badge--accent",
      "prop": "background",
      "from": "var(--primary)",
      "value": "var(--color-accent-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Badge/Badge.css",
      "line": 73,
      "selector": ".badge--neutral",
      "prop": "background",
      "from": "var(--cgrey-100)",
      "value": "var(--color-bg-muted)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Badge/Badge.css",
      "line": 75,
      "selector": ".badge--success",
      "prop": "background",
      "from": "var(--success)",
      "value": "var(--color-success-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Badge/Badge.css",
      "line": 76,
      "selector": ".badge--info",
      "prop": "background",
      "from": "var(--info)",
      "value": "var(--color-info-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Badge/Badge.css",
      "line": 77,
      "selector": ".badge--warning",
      "prop": "background",
      "from": "var(--warning)",
      "value": "var(--color-warning-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Badge/Badge.css",
      "line": 78,
      "selector": ".badge--error",
      "prop": "background",
      "from": "var(--error)",
      "value": "var(--color-danger-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Badge/Badge.css",
      "line": 89,
      "selector": ".badge--text.badge--accent",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 22,
      "selector": ":root",
      "prop": "--btn-hover-bg",
      "from": "color-mix(in srgb, var(--primary) 10%, #fff)",
      "value": "var(--color-accent-bg-hover)",
      "kind": "токен компонента",
      "why": "--btn-hover-bg: акцент 10 % поверх #fff"
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 23,
      "selector": ":root",
      "prop": "--btn-active-bg",
      "from": "color-mix(in srgb, var(--primary) 18%, #fff)",
      "value": "var(--color-accent-bg-pressed)",
      "kind": "токен компонента",
      "why": "--btn-active-bg: акцент 18 % поверх #fff"
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 24,
      "selector": ":root",
      "prop": "--btn-pale",
      "from": "color-mix(in srgb, var(--primary) 45%, #fff)",
      "value": "var(--color-accent-fill-pressed)",
      "kind": "токен компонента",
      "why": "--btn-pale: акцент 45 % поверх #fff: заливка нажатой акцентной кнопки и текст нажатой обводочной"
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 50,
      "selector": ".btn:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 109,
      "selector": ".btn--outline",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 110,
      "selector": ".btn--outline",
      "prop": "border-color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 112,
      "selector": ".btn--outline svg",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 114,
      "selector": ".btn--outline:active",
      "prop": "border-color",
      "from": "var(--btn-pale)",
      "value": "var(--color-accent-muted)",
      "kind": "токен компонента",
      "why": "--btn-pale в группе fg: --color-accent-fg-pressed"
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 114,
      "selector": ".btn--outline:active",
      "prop": "color",
      "from": "var(--btn-pale)",
      "value": "var(--color-accent-muted)",
      "kind": "токен компонента",
      "why": "--btn-pale в группе fg: --color-accent-fg-pressed"
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 115,
      "selector": ".btn--outline:active svg",
      "prop": "color",
      "from": "var(--btn-pale)",
      "value": "var(--color-accent-muted)",
      "kind": "токен компонента",
      "why": "--btn-pale в группе fg: --color-accent-fg-pressed"
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 120,
      "selector": ".btn--transparent",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 123,
      "selector": ".btn--transparent svg",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 125,
      "selector": ".btn--transparent:active",
      "prop": "color",
      "from": "var(--btn-pale)",
      "value": "var(--color-accent-fg-pressed)",
      "kind": "токен компонента",
      "why": "--btn-pale в группе fg: --color-accent-fg-pressed"
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 126,
      "selector": ".btn--transparent:active svg",
      "prop": "color",
      "from": "var(--btn-pale)",
      "value": "var(--color-accent-fg-pressed)",
      "kind": "токен компонента",
      "why": "--btn-pale в группе fg: --color-accent-fg-pressed"
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 138,
      "selector": ".btn--outline:disabled, .btn--outline.btn--disabled",
      "prop": "border-color",
      "from": "var(--disabled)",
      "value": "var(--color-disabled-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 155,
      "selector": ".btn--error.btn--accent, .btn--danger.btn--accent",
      "prop": "background",
      "from": "var(--error)",
      "value": "var(--color-danger-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 155,
      "selector": ".btn--error.btn--accent, .btn--danger.btn--accent",
      "prop": "border-color",
      "from": "var(--error)",
      "value": "var(--color-danger-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 158,
      "selector": ".btn--error.btn--accent:hover, .btn--danger.btn--accent:hover",
      "prop": "background",
      "from": "var(--error-dark)",
      "value": "var(--color-danger-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 158,
      "selector": ".btn--error.btn--accent:hover, .btn--danger.btn--accent:hover",
      "prop": "border-color",
      "from": "var(--error-dark)",
      "value": "var(--color-danger-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 174,
      "selector": ".btn--warning.btn--accent",
      "prop": "background",
      "from": "var(--warning)",
      "value": "var(--color-warning-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 174,
      "selector": ".btn--warning.btn--accent",
      "prop": "border-color",
      "from": "var(--warning)",
      "value": "var(--color-warning-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 176,
      "selector": ".btn--warning.btn--accent:hover",
      "prop": "background",
      "from": "var(--warning-dark)",
      "value": "var(--color-warning-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 176,
      "selector": ".btn--warning.btn--accent:hover",
      "prop": "border-color",
      "from": "var(--warning-dark)",
      "value": "var(--color-warning-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 182,
      "selector": ".btn--warning.btn--outline:active",
      "prop": "background",
      "from": "color-mix(in srgb, var(--warning) 18%, var(--warning-bg))",
      "value": "color-mix(in srgb, var(--color-warning-fill) 18%, var(--color-warning-bg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 188,
      "selector": ".btn--warning.btn--transparent:active",
      "prop": "background",
      "from": "color-mix(in srgb, var(--warning) 18%, var(--warning-bg))",
      "value": "color-mix(in srgb, var(--color-warning-fill) 18%, var(--color-warning-bg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 192,
      "selector": ".btn--success.btn--accent",
      "prop": "background",
      "from": "var(--success)",
      "value": "var(--color-success-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 192,
      "selector": ".btn--success.btn--accent",
      "prop": "border-color",
      "from": "var(--success)",
      "value": "var(--color-success-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 194,
      "selector": ".btn--success.btn--accent:hover",
      "prop": "background",
      "from": "var(--success-dark)",
      "value": "var(--color-success-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 194,
      "selector": ".btn--success.btn--accent:hover",
      "prop": "border-color",
      "from": "var(--success-dark)",
      "value": "var(--color-success-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 200,
      "selector": ".btn--success.btn--outline:active",
      "prop": "background",
      "from": "color-mix(in srgb, var(--success) 18%, var(--success-bg))",
      "value": "color-mix(in srgb, var(--color-success-fill) 18%, var(--color-success-bg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 206,
      "selector": ".btn--success.btn--transparent:active",
      "prop": "background",
      "from": "color-mix(in srgb, var(--success) 18%, var(--success-bg))",
      "value": "color-mix(in srgb, var(--color-success-fill) 18%, var(--color-success-bg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 210,
      "selector": ".btn--info.btn--accent",
      "prop": "background",
      "from": "var(--info)",
      "value": "var(--color-info-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 210,
      "selector": ".btn--info.btn--accent",
      "prop": "border-color",
      "from": "var(--info)",
      "value": "var(--color-info-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 212,
      "selector": ".btn--info.btn--accent:hover",
      "prop": "background",
      "from": "var(--info-dark)",
      "value": "var(--color-info-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 212,
      "selector": ".btn--info.btn--accent:hover",
      "prop": "border-color",
      "from": "var(--info-dark)",
      "value": "var(--color-info-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 218,
      "selector": ".btn--info.btn--outline:active",
      "prop": "background",
      "from": "color-mix(in srgb, var(--info) 18%, var(--info-bg))",
      "value": "color-mix(in srgb, var(--color-info-fill) 18%, var(--color-info-bg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 224,
      "selector": ".btn--info.btn--transparent:active",
      "prop": "background",
      "from": "color-mix(in srgb, var(--info) 18%, var(--info-bg))",
      "value": "color-mix(in srgb, var(--color-info-fill) 18%, var(--color-info-bg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 228,
      "selector": ".btn--error.btn--accent.is-hover, .btn--danger.btn--accent.is-hover",
      "prop": "background",
      "from": "var(--error-dark)",
      "value": "var(--color-danger-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 228,
      "selector": ".btn--error.btn--accent.is-hover, .btn--danger.btn--accent.is-hover",
      "prop": "border-color",
      "from": "var(--error-dark)",
      "value": "var(--color-danger-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 236,
      "selector": ".btn--warning.btn--accent.is-hover",
      "prop": "background",
      "from": "var(--warning-dark)",
      "value": "var(--color-warning-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 236,
      "selector": ".btn--warning.btn--accent.is-hover",
      "prop": "border-color",
      "from": "var(--warning-dark)",
      "value": "var(--color-warning-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 239,
      "selector": ".btn--warning.btn--outline.is-active",
      "prop": "background",
      "from": "color-mix(in srgb, var(--warning) 18%, var(--warning-bg))",
      "value": "color-mix(in srgb, var(--color-warning-fill) 18%, var(--color-warning-bg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 241,
      "selector": ".btn--warning.btn--transparent.is-active",
      "prop": "background",
      "from": "color-mix(in srgb, var(--warning) 18%, var(--warning-bg))",
      "value": "color-mix(in srgb, var(--color-warning-fill) 18%, var(--color-warning-bg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 243,
      "selector": ".btn--success.btn--accent.is-hover",
      "prop": "background",
      "from": "var(--success-dark)",
      "value": "var(--color-success-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 243,
      "selector": ".btn--success.btn--accent.is-hover",
      "prop": "border-color",
      "from": "var(--success-dark)",
      "value": "var(--color-success-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 246,
      "selector": ".btn--success.btn--outline.is-active",
      "prop": "background",
      "from": "color-mix(in srgb, var(--success) 18%, var(--success-bg))",
      "value": "color-mix(in srgb, var(--color-success-fill) 18%, var(--color-success-bg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 248,
      "selector": ".btn--success.btn--transparent.is-active",
      "prop": "background",
      "from": "color-mix(in srgb, var(--success) 18%, var(--success-bg))",
      "value": "color-mix(in srgb, var(--color-success-fill) 18%, var(--color-success-bg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 250,
      "selector": ".btn--info.btn--accent.is-hover",
      "prop": "background",
      "from": "var(--info-dark)",
      "value": "var(--color-info-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 250,
      "selector": ".btn--info.btn--accent.is-hover",
      "prop": "border-color",
      "from": "var(--info-dark)",
      "value": "var(--color-info-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 253,
      "selector": ".btn--info.btn--outline.is-active",
      "prop": "background",
      "from": "color-mix(in srgb, var(--info) 18%, var(--info-bg))",
      "value": "color-mix(in srgb, var(--color-info-fill) 18%, var(--color-info-bg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 255,
      "selector": ".btn--info.btn--transparent.is-active",
      "prop": "background",
      "from": "color-mix(in srgb, var(--info) 18%, var(--info-bg))",
      "value": "color-mix(in srgb, var(--color-info-fill) 18%, var(--color-info-bg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 265,
      "selector": ".btn--outline.is-active",
      "prop": "border-color",
      "from": "var(--btn-pale)",
      "value": "var(--color-accent-muted)",
      "kind": "токен компонента",
      "why": "--btn-pale в группе fg: --color-accent-fg-pressed"
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 265,
      "selector": ".btn--outline.is-active",
      "prop": "color",
      "from": "var(--btn-pale)",
      "value": "var(--color-accent-muted)",
      "kind": "токен компонента",
      "why": "--btn-pale в группе fg: --color-accent-fg-pressed"
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 266,
      "selector": ".btn--outline.is-active svg",
      "prop": "color",
      "from": "var(--btn-pale)",
      "value": "var(--color-accent-muted)",
      "kind": "токен компонента",
      "why": "--btn-pale в группе fg: --color-accent-fg-pressed"
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 268,
      "selector": ".btn--transparent.is-active",
      "prop": "color",
      "from": "var(--btn-pale)",
      "value": "var(--color-accent-fg-pressed)",
      "kind": "токен компонента",
      "why": "--btn-pale в группе fg: --color-accent-fg-pressed"
    },
    {
      "file": "components/atoms/Buttons/Buttons.css",
      "line": 269,
      "selector": ".btn--transparent.is-active svg",
      "prop": "color",
      "from": "var(--btn-pale)",
      "value": "var(--color-accent-fg-pressed)",
      "kind": "токен компонента",
      "why": "--btn-pale в группе fg: --color-accent-fg-pressed"
    },
    {
      "file": "components/atoms/Checkbox/Checkbox.css",
      "line": 89,
      "selector": ".cb:hover .cb__mark, .cb--hover .cb__mark",
      "prop": "border-color",
      "from": "var(--primary)",
      "value": "var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Checkbox/Checkbox.css",
      "line": 112,
      "selector": ".cb__input:focus-visible + .cb__box .cb__mark, .cb--focus .cb__mark",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Checkbox/Checkbox.css",
      "line": 119,
      "selector": ".cb--error .cb__mark",
      "prop": "border-color",
      "from": "var(--error)",
      "value": "var(--color-danger-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Checkbox/Checkbox.css",
      "line": 126,
      "selector": ".cb--error.cb--selected .cb__mark, .cb--error.cb--indeterminate .cb__mark, .cb--error:has(.cb__input:checked) .cb__mark, .cb--error:has(.cb__input:indeterminate) .cb__mark",
      "prop": "background",
      "from": "var(--error)",
      "value": "var(--color-danger-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Checkbox/Checkbox.css",
      "line": 127,
      "selector": ".cb--error.cb--selected .cb__mark, .cb--error.cb--indeterminate .cb__mark, .cb--error:has(.cb__input:checked) .cb__mark, .cb--error:has(.cb__input:indeterminate) .cb__mark",
      "prop": "border-color",
      "from": "var(--error)",
      "value": "var(--color-danger-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Checkbox/Checkbox.css",
      "line": 137,
      "selector": ".cb:hover.cb--error.cb--selected .cb__mark, .cb--hover.cb--error.cb--selected .cb__mark, .cb:hover.cb--error:has(.cb__input:checked) .cb__mark",
      "prop": "background",
      "from": "var(--error-dark)",
      "value": "var(--color-danger-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Checkbox/Checkbox.css",
      "line": 138,
      "selector": ".cb:hover.cb--error.cb--selected .cb__mark, .cb--hover.cb--error.cb--selected .cb__mark, .cb:hover.cb--error:has(.cb__input:checked) .cb__mark",
      "prop": "border-color",
      "from": "var(--error-dark)",
      "value": "var(--color-danger-fill-hover)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Checkbox/Checkbox.css",
      "line": 153,
      "selector": ".cb--disabled .cb__mark, .cb__input:disabled ~ .cb__box .cb__mark",
      "prop": "border-color",
      "from": "var(--disabled)",
      "value": "var(--color-disabled-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 172,
      "selector": ".chip__info:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 235,
      "selector": ".chip--edit:focus-visible, .chip--edit.is-focus",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 240,
      "selector": ".chip--selected",
      "prop": "border-color",
      "from": "color-mix(in srgb, var(--primary) 56%, transparent)",
      "value": "color-mix(in srgb, var(--color-accent-border) 56%, transparent)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 240,
      "selector": ".chip--selected",
      "prop": "color",
      "from": "var(--primary-dark)",
      "value": "var(--color-accent-fg-strong)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 241,
      "selector": ".chip--selected .chip__icon, .chip--selected .chip__marker, .chip--selected .chip__remove, .chip--selected .chip__dropdown, .chip--selected .chip__info, .chip--selected .chip__count",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 243,
      "selector": ".chip--edit.chip--selected:not(:is(.chip--disabled,[aria-disabled=\"true\"])):hover, .chip--edit.chip--selected:not(:is(.chip--disabled,[aria-disabled=\"true\"])).is-hover",
      "prop": "border-color",
      "from": "var(--primary)",
      "value": "var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 262,
      "selector": ".chip--accent .chip__icon, .chip--accent .chip__marker, .chip--accent .chip__remove, .chip--accent .chip__dropdown, .chip--accent .chip__info, .chip--accent .chip__count, .chip--primary .chip__icon, .chip--primary .chip__marker, .chip--primary .chip__remove, .chip--primary .chip__dropdown, .chip--primary .chip__info, .chip--primary .chip__count",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 290,
      "selector": ".chip--outline.chip--accent, .chip--outline.chip--primary",
      "prop": "border-color",
      "from": "color-mix(in srgb, var(--primary) 56%, transparent)",
      "value": "color-mix(in srgb, var(--color-accent-border) 56%, transparent)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 318,
      "selector": ".chip--success-solid, .chip--green-solid",
      "prop": "color",
      "from": "var(--mgrey-50)",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "текст и иконки сплошного чипа"
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 319,
      "selector": ".chip--warning-solid, .chip--orange-solid",
      "prop": "color",
      "from": "var(--mgrey-50)",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "текст и иконки сплошного чипа"
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 320,
      "selector": ".chip--error-solid, .chip--red-solid",
      "prop": "color",
      "from": "var(--mgrey-50)",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "текст и иконки сплошного чипа"
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 321,
      "selector": ".chip--dark-solid, .chip--grey-solid",
      "prop": "color",
      "from": "var(--mgrey-50)",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "текст и иконки сплошного чипа"
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 322,
      "selector": ".chip--info-solid, .chip--lblue-solid",
      "prop": "color",
      "from": "var(--mgrey-50)",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "текст и иконки сплошного чипа"
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 323,
      "selector": ".chip--accent-solid, .chip--primary-solid",
      "prop": "color",
      "from": "var(--mgrey-50)",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "текст и иконки сплошного чипа"
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 324,
      "selector": ".chip--dpurple-solid",
      "prop": "color",
      "from": "var(--mgrey-50)",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "текст и иконки сплошного чипа"
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 326,
      "selector": ".chip--success-solid .chip__icon, .chip--success-solid .chip__marker, .chip--success-solid .chip__remove, .chip--success-solid .chip__dropdown, .chip--success-solid .chip__info, .chip--success-solid .chip__count, .chip--green-solid .chip__icon, .chip--green-solid .chip__marker, .chip--green-solid .chip__remove, .chip--green-solid .chip__dropdown, .chip--green-solid .chip__info, .chip--green-solid .chip__count",
      "prop": "color",
      "from": "var(--mgrey-50)",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "текст и иконки сплошного чипа"
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 328,
      "selector": ".chip--warning-solid .chip__icon, .chip--warning-solid .chip__marker, .chip--warning-solid .chip__remove, .chip--warning-solid .chip__dropdown, .chip--warning-solid .chip__info, .chip--warning-solid .chip__count, .chip--orange-solid .chip__icon, .chip--orange-solid .chip__marker, .chip--orange-solid .chip__remove, .chip--orange-solid .chip__dropdown, .chip--orange-solid .chip__info, .chip--orange-solid .chip__count",
      "prop": "color",
      "from": "var(--mgrey-50)",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "текст и иконки сплошного чипа"
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 330,
      "selector": ".chip--error-solid .chip__icon, .chip--error-solid .chip__marker, .chip--error-solid .chip__remove, .chip--error-solid .chip__dropdown, .chip--error-solid .chip__info, .chip--error-solid .chip__count, .chip--red-solid .chip__icon, .chip--red-solid .chip__marker, .chip--red-solid .chip__remove, .chip--red-solid .chip__dropdown, .chip--red-solid .chip__info, .chip--red-solid .chip__count",
      "prop": "color",
      "from": "var(--mgrey-50)",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "текст и иконки сплошного чипа"
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 332,
      "selector": ".chip--dark-solid .chip__icon, .chip--dark-solid .chip__marker, .chip--dark-solid .chip__remove, .chip--dark-solid .chip__dropdown, .chip--dark-solid .chip__info, .chip--dark-solid .chip__count, .chip--grey-solid .chip__icon, .chip--grey-solid .chip__marker, .chip--grey-solid .chip__remove, .chip--grey-solid .chip__dropdown, .chip--grey-solid .chip__info, .chip--grey-solid .chip__count",
      "prop": "color",
      "from": "var(--mgrey-50)",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "текст и иконки сплошного чипа"
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 334,
      "selector": ".chip--info-solid .chip__icon, .chip--info-solid .chip__marker, .chip--info-solid .chip__remove, .chip--info-solid .chip__dropdown, .chip--info-solid .chip__info, .chip--info-solid .chip__count, .chip--lblue-solid .chip__icon, .chip--lblue-solid .chip__marker, .chip--lblue-solid .chip__remove, .chip--lblue-solid .chip__dropdown, .chip--lblue-solid .chip__info, .chip--lblue-solid .chip__count",
      "prop": "color",
      "from": "var(--mgrey-50)",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "текст и иконки сплошного чипа"
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 336,
      "selector": ".chip--accent-solid .chip__icon, .chip--accent-solid .chip__marker, .chip--accent-solid .chip__remove, .chip--accent-solid .chip__dropdown, .chip--accent-solid .chip__info, .chip--accent-solid .chip__count, .chip--primary-solid .chip__icon, .chip--primary-solid .chip__marker, .chip--primary-solid .chip__remove, .chip--primary-solid .chip__dropdown, .chip--primary-solid .chip__info, .chip--primary-solid .chip__count",
      "prop": "color",
      "from": "var(--mgrey-50)",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "текст и иконки сплошного чипа"
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 337,
      "selector": ".chip--dpurple-solid .chip__icon, .chip--dpurple-solid .chip__marker, .chip--dpurple-solid .chip__remove, .chip--dpurple-solid .chip__dropdown, .chip--dpurple-solid .chip__info, .chip--dpurple-solid .chip__count",
      "prop": "color",
      "from": "var(--mgrey-50)",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "текст и иконки сплошного чипа"
    },
    {
      "file": "components/atoms/Chip/Chip.css",
      "line": 356,
      "selector": ".chip--edit.chip--invalid:not(:is(.chip--disabled,[aria-disabled=\"true\"])):hover, .chip--edit.chip--invalid:not(:is(.chip--disabled,[aria-disabled=\"true\"])).is-hover",
      "prop": "border-color",
      "from": "var(--error)",
      "value": "var(--color-danger-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/IconButton/IconButton.css",
      "line": 68,
      "selector": ".ibtn:focus-visible, .ibtn.is-focus",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/IconButton/IconButton.css",
      "line": 88,
      "selector": ".ibtn--primary",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/IconButton/IconButton.css",
      "line": 90,
      "selector": ".ibtn--contrast",
      "prop": "color",
      "from": "var(--text-on-dark)",
      "value": "var(--color-fg-inverse)",
      "kind": "роль",
      "why": "тон Contrast — «для тёмных поверхностей» (спека IconButton)"
    },
    {
      "file": "components/atoms/IconButton/IconButton.css",
      "line": 100,
      "selector": ".ibtn--contrast:hover::before, .ibtn--contrast.is-hover::before",
      "prop": "background",
      "from": "color-mix(in srgb, #fff 18%, transparent)",
      "value": "color-mix(in srgb, var(--color-fg-inverse) 18%, transparent)",
      "kind": "мимо токена",
      "why": "стейт-слой тона Contrast — от цвета его иконки"
    },
    {
      "file": "components/atoms/IconButton/IconButton.css",
      "line": 101,
      "selector": ".ibtn--contrast:active::before, .ibtn--contrast.is-pressed::before",
      "prop": "background",
      "from": "color-mix(in srgb, #fff 30%, transparent)",
      "value": "color-mix(in srgb, var(--color-fg-inverse) 30%, transparent)",
      "kind": "мимо токена",
      "why": "стейт-слой тона Contrast — от цвета его иконки"
    },
    {
      "file": "components/atoms/IconButton/IconButton.css",
      "line": 106,
      "selector": ".ibtn:is(.ibtn--selected,[aria-pressed=\"true\"])",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/IconButton/IconButton.css",
      "line": 116,
      "selector": ".ibtn--embedded:hover, .ibtn--embedded.is-hover",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/IconButton/IconButton.css",
      "line": 118,
      "selector": ".ibtn--embedded:active, .ibtn--embedded.is-pressed",
      "prop": "color",
      "from": "var(--primary-dark)",
      "value": "var(--color-accent-fg-strong)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Link/Link.css",
      "line": 19,
      "selector": ".link",
      "prop": "--link-fg-active",
      "from": "var(--emerald-900)",
      "value": "var(--color-link-pressed)",
      "kind": "токен компонента + мимо токена",
      "why": "--link-fg-active: нажатая ссылка, emerald-900"
    },
    {
      "file": "components/atoms/Link/Link.css",
      "line": 41,
      "selector": ".link.link--accent:active, .link.link--accent.is-pressed",
      "prop": "color",
      "from": "var(--emerald-900)",
      "value": "var(--color-link-pressed)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Link/Link.css",
      "line": 60,
      "selector": ".link.link--info:active, .link.link--info.is-pressed",
      "prop": "color",
      "from": "color-mix(in srgb, var(--info-dark) 80%, #000)",
      "value": "var(--color-info-fg-pressed)",
      "kind": "мимо токена",
      "why": "info-dark 80 % с чёрным"
    },
    {
      "file": "components/atoms/Link/Link.css",
      "line": 63,
      "selector": ".link.link--warning:active, .link.link--warning.is-pressed",
      "prop": "color",
      "from": "color-mix(in srgb, var(--warning-dark) 80%, #000)",
      "value": "var(--color-warning-fg-pressed)",
      "kind": "мимо токена",
      "why": "warning-dark 80 % с чёрным"
    },
    {
      "file": "components/atoms/Link/Link.css",
      "line": 66,
      "selector": ".link.link--error:active, .link.link--error.is-pressed",
      "prop": "color",
      "from": "color-mix(in srgb, var(--error-dark) 80%, #000)",
      "value": "var(--color-danger-fg-pressed)",
      "kind": "мимо токена",
      "why": "error-dark 80 % с чёрным"
    },
    {
      "file": "components/atoms/Link/Link.css",
      "line": 69,
      "selector": ".link.link--success:active, .link.link--success.is-pressed",
      "prop": "color",
      "from": "color-mix(in srgb, var(--success-dark) 80%, #000)",
      "value": "var(--color-success-fg-pressed)",
      "kind": "мимо токена",
      "why": "success-dark 80 % с чёрным"
    },
    {
      "file": "components/atoms/Radiobutton/Radiobutton.css",
      "line": 73,
      "selector": ".rb--selected .rb__mark, .rb__input:checked ~ .rb__box .rb__mark",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Radiobutton/Radiobutton.css",
      "line": 78,
      "selector": ".rb:hover .rb__mark, .rb--hover .rb__mark",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Radiobutton/Radiobutton.css",
      "line": 84,
      "selector": ".rb:hover.rb--selected .rb__mark, .rb--hover.rb--selected .rb__mark, .rb:hover:has(.rb__input:checked) .rb__mark",
      "prop": "color",
      "from": "var(--primary-dark)",
      "value": "var(--color-accent-fg-strong)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Radiobutton/Radiobutton.css",
      "line": 97,
      "selector": ".rb__input:focus-visible + .rb__box .rb__mark, .rb--focus .rb__mark",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Spinner/Spinner.css",
      "line": 14,
      "selector": ".spin",
      "prop": "border-top-color",
      "from": "var(--primary)",
      "value": "var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Spinner/Spinner.css",
      "line": 19,
      "selector": ".spin--accent",
      "prop": "border-top-color",
      "from": "var(--primary)",
      "value": "var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Spinner/Spinner.css",
      "line": 25,
      "selector": ".spin--inverse",
      "prop": "border-color",
      "from": "color-mix(in srgb, var(--text-on-dark) 28%, transparent)",
      "value": "color-mix(in srgb, var(--color-fg-inverse) 28%, transparent)",
      "kind": "роль",
      "why": "инверсный спиннер — на тёмной поверхности"
    },
    {
      "file": "components/atoms/Spinner/Spinner.css",
      "line": 25,
      "selector": ".spin--inverse",
      "prop": "border-top-color",
      "from": "var(--text-on-dark)",
      "value": "var(--color-fg-inverse)",
      "kind": "роль",
      "why": "инверсный спиннер — на тёмной поверхности"
    },
    {
      "file": "components/atoms/Spinner/Spinner.css",
      "line": 38,
      "selector": ".spin-group--inverse .spin-group__label",
      "prop": "color",
      "from": "var(--text-on-dark)",
      "value": "var(--color-fg-inverse)",
      "kind": "роль",
      "why": "инверсный спиннер — на тёмной поверхности"
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 55,
      "selector": ".sw__control",
      "prop": "background",
      "from": "var(--cgrey-100)",
      "value": "var(--color-control-track)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 67,
      "selector": ".sw__thumb",
      "prop": "background",
      "from": "var(--mgrey-50)",
      "value": "var(--color-control-thumb)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 68,
      "selector": ".sw__thumb",
      "prop": "box-shadow",
      "from": "0 1px 2px rgba(40, 50, 55, .28)",
      "value": "0 1px 2px color-mix(in srgb, var(--color-shadow) 28%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 85,
      "selector": ".sw--on .sw__thumb, .sw__input:checked ~ .sw__control .sw__thumb",
      "prop": "box-shadow",
      "from": "0 1px 2px rgba(0, 99, 90, .35)",
      "value": "0 1px 2px color-mix(in srgb, var(--color-accent-shadow) 35%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 92,
      "selector": ".sw:hover .sw__thumb, .sw--hover .sw__thumb",
      "prop": "box-shadow",
      "from": "0 1px 2px rgba(40, 50, 55, .28), 0 0 0 5px var(--primary-bg-light)",
      "value": "0 1px 2px color-mix(in srgb, var(--color-shadow) 28%, transparent), 0 0 0 5px var(--color-accent-bg-subtle)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 95,
      "selector": ".sw:hover .sw__control, .sw--hover .sw__control",
      "prop": "background",
      "from": "var(--cgrey-200)",
      "value": "var(--color-control-track-hover)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 98,
      "selector": ".sw:hover.sw--on .sw__control, .sw--hover.sw--on .sw__control, .sw:hover:has(.sw__input:checked) .sw__control",
      "prop": "background",
      "from": "var(--secondary)",
      "value": "var(--color-control-track-on-hover)",
      "kind": "роль",
      "why": "наведение на включённый переключатель, не полоса прокрутки"
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 103,
      "selector": ".sw:hover.sw--on .sw__thumb, .sw--hover.sw--on .sw__thumb, .sw:hover:has(.sw__input:checked) .sw__thumb",
      "prop": "box-shadow",
      "from": "0 1px 2px rgba(0, 99, 90, .4), 0 0 0 5px var(--primary-bg-light)",
      "value": "0 1px 2px color-mix(in srgb, var(--color-accent-shadow) 40%, transparent), 0 0 0 5px var(--color-accent-bg-subtle)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 111,
      "selector": ".sw:active .sw__thumb, .sw--pressed .sw__thumb",
      "prop": "box-shadow",
      "from": "0 1px 2px rgba(40, 50, 55, .28), 0 0 0 7px var(--primary-bg)",
      "value": "0 1px 2px color-mix(in srgb, var(--color-shadow) 28%, transparent), 0 0 0 7px var(--color-accent-bg)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 117,
      "selector": ".sw:active.sw--on .sw__thumb, .sw--pressed.sw--on .sw__thumb, .sw:active:has(.sw__input:checked) .sw__thumb",
      "prop": "box-shadow",
      "from": "0 1px 2px rgba(0, 99, 90, .4), 0 0 0 7px var(--primary-bg)",
      "value": "0 1px 2px color-mix(in srgb, var(--color-accent-shadow) 40%, transparent), 0 0 0 7px var(--color-accent-bg)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 123,
      "selector": ".sw__input:focus-visible + .sw__control, .sw--focus .sw__control",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 131,
      "selector": ".sw--loading .sw__thumb",
      "prop": "box-shadow",
      "from": "0 1px 2px rgba(40, 50, 55, .28)",
      "value": "0 1px 2px color-mix(in srgb, var(--color-shadow) 28%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 140,
      "selector": ".sw--on .sw__thumb .spin",
      "prop": "border-color",
      "from": "color-mix(in srgb, #fff 45%, transparent)",
      "value": "color-mix(in srgb, var(--color-fg-on-fill) 45%, transparent)",
      "kind": "мимо токена",
      "why": "спиннер на включённом (акцентном) бегунке"
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 141,
      "selector": ".sw--on .sw__thumb .spin",
      "prop": "border-top-color",
      "from": "#fff",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "спиннер на включённом (акцентном) бегунке"
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 152,
      "selector": ".sw--disabled .sw__thumb, .sw__input:disabled ~ .sw__control .sw__thumb",
      "prop": "background",
      "from": "var(--mgrey-50)",
      "value": "var(--color-control-thumb)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/atoms/Switch/Switch.css",
      "line": 153,
      "selector": ".sw--disabled .sw__thumb, .sw__input:disabled ~ .sw__control .sw__thumb",
      "prop": "box-shadow",
      "from": "0 1px 1px rgba(40, 50, 55, .12)",
      "value": "0 1px 1px color-mix(in srgb, var(--color-shadow) 12%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/molecules/ButtonGroup/ButtonGroup.css",
      "line": 27,
      "selector": ":root",
      "prop": "--btng-divider-disabled",
      "from": "color-mix(in srgb, #fff 38%, transparent)",
      "value": "color-mix(in srgb, var(--color-fg-on-fill) 38%, transparent)",
      "kind": "мимо токена",
      "why": "разделитель недоступной акцентной группы"
    },
    {
      "file": "components/molecules/ButtonGroup/ButtonGroup.css",
      "line": 88,
      "selector": ".btn-group--outline > .btn:hover, .btn-group--outline > .btn:active, .btn-group--outline > .btn.is-hover, .btn-group--outline > .btn.is-active",
      "prop": "border-color",
      "from": "var(--primary)",
      "value": "var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/ButtonGroup/ButtonGroup.css",
      "line": 140,
      "selector": ".btn-group--outline.btn-group--disabled > .btn",
      "prop": "border-color",
      "from": "var(--disabled)",
      "value": "var(--color-disabled-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/ContextMenu/ContextMenu.css",
      "line": 45,
      "selector": ".menu",
      "prop": "--menu-item-hover",
      "from": "var(--tertiary)",
      "value": "var(--color-bg-hover)",
      "kind": "токен компонента",
      "why": "--menu-item-hover: наведение в меню = наведение в списке (в legacy меню темнее: --tertiary против --tertiary-light)"
    },
    {
      "file": "components/molecules/ContextMenu/ContextMenu.css",
      "line": 46,
      "selector": ".menu",
      "prop": "--menu-item-active",
      "from": "color-mix(in srgb, var(--swamp-500) 16%, var(--bg-popup))",
      "value": "var(--color-bg-pressed)",
      "kind": "токен компонента",
      "why": "--menu-item-active: нейтральное нажатие: swamp-500 16 % поверх фона меню"
    },
    {
      "file": "components/molecules/ContextMenu/ContextMenu.css",
      "line": 47,
      "selector": ".menu",
      "prop": "--menu-shadow",
      "from": "0 10px 30px rgba(40, 50, 55, .16)",
      "value": "0 10px 30px color-mix(in srgb, var(--color-shadow) 16%, transparent)",
      "kind": "мимо токена",
      "why": "тень меню"
    },
    {
      "file": "components/molecules/ContextMenu/ContextMenu.css",
      "line": 134,
      "selector": ".menu__item-check",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/ContextMenu/ContextMenu.css",
      "line": 144,
      "selector": ".menu__item:focus-visible, .menu__item.is-focus",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/ContextMenu/ContextMenu.css",
      "line": 175,
      "selector": ".menu__item--danger:focus-visible, .menu__item--danger.is-focus",
      "prop": "outline",
      "from": "2px solid var(--error)",
      "value": "2px solid var(--color-danger-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/ContextMenu/ContextMenu.css",
      "line": 220,
      "selector": ".menu--scroll.is-scrolling::-webkit-scrollbar-thumb",
      "prop": "background",
      "from": "var(--secondary)",
      "value": "var(--color-scrollbar)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/DatePicker/DatePicker.css",
      "line": 63,
      "selector": ".dpk__caption:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/DatePicker/DatePicker.css",
      "line": 123,
      "selector": ".dpk__day:focus-visible .dpk__daynum",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/DatePicker/DatePicker.css",
      "line": 129,
      "selector": ".dpk__day--today .dpk__daynum",
      "prop": "box-shadow",
      "from": "inset 0 0 0 1px var(--primary)",
      "value": "inset 0 0 0 1px var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/DatePicker/DatePicker.css",
      "line": 129,
      "selector": ".dpk__day--today .dpk__daynum",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/DatePicker/DatePicker.css",
      "line": 171,
      "selector": ".dpk__panel-cell:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/DatePicker/DatePicker.css",
      "line": 172,
      "selector": ".dpk__panel-cell--current",
      "prop": "box-shadow",
      "from": "inset 0 0 0 1px var(--primary)",
      "value": "inset 0 0 0 1px var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/DatePicker/DatePicker.css",
      "line": 172,
      "selector": ".dpk__panel-cell--current",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/DropdownList/DropdownList.css",
      "line": 52,
      "selector": ".ddl",
      "prop": "--ddl-item-selected-hover",
      "from": "color-mix(in srgb, var(--swamp-300) 30%, var(--bg-popup))",
      "value": "var(--color-bg-selected-hover)",
      "kind": "токен компонента",
      "why": "--ddl-item-selected-hover: swamp-300 30 % поверх фона списка"
    },
    {
      "file": "components/molecules/DropdownList/DropdownList.css",
      "line": 171,
      "selector": ".ddl__item-check-single",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/DropdownList/DropdownList.css",
      "line": 188,
      "selector": ".ddl__item:focus-visible, .ddl__item.is-focus",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/DropdownList/DropdownList.css",
      "line": 194,
      "selector": ".ddl__item:active, .ddl__item.is-active",
      "prop": "background",
      "from": "color-mix(in srgb, var(--swamp-500) 12%, var(--bg-popup))",
      "value": "var(--color-bg-pressed)",
      "kind": "мимо токена",
      "why": "нейтральное нажатие: swamp-500 12 % поверх фона списка"
    },
    {
      "file": "components/molecules/DropdownList/DropdownList.css",
      "line": 237,
      "selector": ".ddl__item[aria-disabled=\"true\"] .cb__mark, .ddl__item.is-disabled .cb__mark",
      "prop": "border-color",
      "from": "var(--disabled)",
      "value": "var(--color-disabled-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/DropdownList/DropdownList.css",
      "line": 323,
      "selector": ".ddl__item--action",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/DropdownList/DropdownList.css",
      "line": 324,
      "selector": ".ddl__item--action .ddl__item-icon",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/DropdownList/DropdownList.css",
      "line": 350,
      "selector": ".ddl--scroll.is-scrolling::-webkit-scrollbar-thumb",
      "prop": "background",
      "from": "var(--secondary)",
      "value": "var(--color-scrollbar)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Inputs/Inputs.css",
      "line": 70,
      "selector": ".inp__field:hover, .inp.is-hover .inp__field",
      "prop": "border-color",
      "from": "var(--primary)",
      "value": "var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Inputs/Inputs.css",
      "line": 78,
      "selector": ".inp__field:focus-within, .inp.is-focus .inp__field",
      "prop": "border-color",
      "from": "var(--primary)",
      "value": "var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Inputs/Inputs.css",
      "line": 79,
      "selector": ".inp__field:focus-within, .inp.is-focus .inp__field",
      "prop": "box-shadow",
      "from": "inset 0 0 0 1px var(--primary), 0 0 0 3px var(--primary-bg-light)",
      "value": "inset 0 0 0 1px var(--color-focus-ring), 0 0 0 3px var(--color-accent-bg-subtle)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Inputs/Inputs.css",
      "line": 93,
      "selector": ".inp--error .inp__field",
      "prop": "border-color",
      "from": "var(--error)",
      "value": "var(--color-danger-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Inputs/Inputs.css",
      "line": 96,
      "selector": ".inp--error .inp__field:focus-within, .inp--error.is-focus .inp__field",
      "prop": "border-color",
      "from": "var(--error)",
      "value": "var(--color-danger-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Inputs/Inputs.css",
      "line": 97,
      "selector": ".inp--error .inp__field:focus-within, .inp--error.is-focus .inp__field",
      "prop": "box-shadow",
      "from": "inset 0 0 0 1px var(--error), 0 0 0 3px color-mix(in srgb, var(--error) 8%, transparent)",
      "value": "inset 0 0 0 1px var(--color-danger-border), 0 0 0 3px color-mix(in srgb, var(--color-danger-border) 8%, transparent)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Inputs/Inputs.css",
      "line": 99,
      "selector": ".inp--warning .inp__field",
      "prop": "border-color",
      "from": "var(--warning)",
      "value": "var(--color-warning-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Inputs/Inputs.css",
      "line": 102,
      "selector": ".inp--warning .inp__field:focus-within, .inp--warning.is-focus .inp__field",
      "prop": "border-color",
      "from": "var(--warning)",
      "value": "var(--color-warning-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Inputs/Inputs.css",
      "line": 103,
      "selector": ".inp--warning .inp__field:focus-within, .inp--warning.is-focus .inp__field",
      "prop": "box-shadow",
      "from": "inset 0 0 0 1px var(--warning), 0 0 0 3px color-mix(in srgb, var(--warning) 10%, transparent)",
      "value": "inset 0 0 0 1px var(--color-warning-border), 0 0 0 3px color-mix(in srgb, var(--color-warning-border) 10%, transparent)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Inputs/Inputs.css",
      "line": 241,
      "selector": ".inp__act:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/NavTile/NavTile.css",
      "line": 110,
      "selector": ".ntile__title-link:hover .ntile__title",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/NavTile/NavTile.css",
      "line": 112,
      "selector": ".ntile__title-link:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/NavTile/NavTile.css",
      "line": 124,
      "selector": "a.ntile:focus-visible, a.ntile.is-focus",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Pagination/Pagination.css",
      "line": 108,
      "selector": ".pgn__pagesize-btn:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Pagination/Pagination.css",
      "line": 159,
      "selector": ".pgn__arrow:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Pagination/Pagination.css",
      "line": 181,
      "selector": ".pgn__num:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/ReadOnlyField/ReadOnlyField.css",
      "line": 82,
      "selector": ".rof__icon--interactive:hover, .rof__icon--interactive:focus-visible",
      "prop": "background",
      "from": "color-mix(in srgb, var(--text-primary) 8%, transparent)",
      "value": "var(--color-bg-tint)",
      "kind": "роль",
      "why": "подложка наведения 8 % от цвета текста — нейтральная подложка"
    },
    {
      "file": "components/molecules/ReadOnlyField/ReadOnlyField.css",
      "line": 85,
      "selector": ".rof__icon--interactive:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/SegmentControl/SegmentControl.css",
      "line": 52,
      "selector": ".segctrl",
      "prop": "background",
      "from": "color-mix(in srgb, var(--swamp-400) 16%, transparent)",
      "value": "var(--color-bg-muted)",
      "kind": "мимо токена",
      "why": "дорожка: swamp-400 16 %"
    },
    {
      "file": "components/molecules/SegmentControl/SegmentControl.css",
      "line": 72,
      "selector": ".segctrl__thumb",
      "prop": "box-shadow",
      "from": "0 1px 2px rgba(40, 50, 55, .10)",
      "value": "0 1px 2px color-mix(in srgb, var(--color-shadow) 10%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/molecules/SegmentControl/SegmentControl.css",
      "line": 163,
      "selector": ".segctrl__item[aria-checked=\"true\"]",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/SegmentControl/SegmentControl.css",
      "line": 165,
      "selector": ".segctrl__item:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Splitter/Splitter.css",
      "line": 103,
      "selector": ".spl:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Splitter/Splitter.css",
      "line": 144,
      "selector": ".splitpane__a",
      "prop": "background",
      "from": "var(--tertiary-light)",
      "value": "var(--color-bg-sunken)",
      "kind": "роль",
      "why": "фон панели, не наведение"
    },
    {
      "file": "components/molecules/Splitter/Splitter.css",
      "line": 146,
      "selector": ".splitpane--app",
      "prop": "box-shadow",
      "from": "0 10px 30px rgba(40,50,55,.08)",
      "value": "0 10px 30px color-mix(in srgb, var(--color-shadow) 8%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/molecules/SubTab/SubTab.css",
      "line": 58,
      "selector": ".subtabs",
      "prop": "background",
      "from": "var(--st-system-light)",
      "value": "var(--color-bg-muted)",
      "kind": "роль",
      "why": "статус вне статусов: дорожка SubTab"
    },
    {
      "file": "components/molecules/SubTab/SubTab.css",
      "line": 149,
      "selector": ".subtab:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Tab/Tab.css",
      "line": 82,
      "selector": ".tabs-scroll__arrow",
      "prop": "box-shadow",
      "from": "0 4px 14px rgba(40, 50, 55, .16)",
      "value": "0 4px 14px color-mix(in srgb, var(--color-shadow) 16%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/molecules/Tab/Tab.css",
      "line": 119,
      "selector": ".tabs-overflow__menu",
      "prop": "box-shadow",
      "from": "0 10px 30px rgba(40, 50, 55, .16)",
      "value": "0 10px 30px color-mix(in srgb, var(--color-shadow) 16%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/molecules/Tab/Tab.css",
      "line": 143,
      "selector": ".tabs-overflow__item[aria-checked=\"true\"]",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Tab/Tab.css",
      "line": 145,
      "selector": ".tabs-overflow__item[aria-checked=\"true\"] .tab__icon",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Tab/Tab.css",
      "line": 308,
      "selector": ".tab:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Tab/Tab.css",
      "line": 316,
      "selector": ".tab:is(.tab--selected,[aria-selected=\"true\"],[aria-current=\"true\"]) .tab__icon",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Toast/Toast.css",
      "line": 29,
      "selector": ":root",
      "prop": "--toast-bg",
      "from": "var(--st-grey)",
      "value": "var(--color-bg-inverse)",
      "kind": "токен компонента",
      "why": "--toast-bg: статус вне статусов: фон тоста"
    },
    {
      "file": "components/molecules/Toast/Toast.css",
      "line": 30,
      "selector": ":root",
      "prop": "--toast-fg",
      "from": "var(--text-on-dark)",
      "value": "var(--color-fg-inverse)",
      "kind": "токен компонента",
      "why": "--toast-fg: текст тоста — на инверсной поверхности"
    },
    {
      "file": "components/molecules/Toast/Toast.css",
      "line": 41,
      "selector": ":root",
      "prop": "--toast-scrim",
      "from": "color-mix(in srgb, var(--st-grey) 25%, transparent)",
      "value": "var(--color-bg-scrim)",
      "kind": "токен компонента",
      "why": "--toast-scrim: статус вне статусов: затемнение под тостом"
    },
    {
      "file": "components/molecules/Toast/Toast.css",
      "line": 44,
      "selector": ":root",
      "prop": "--toast-icon-success",
      "from": "var(--success-light)",
      "value": "var(--color-success-fg-inverse)",
      "kind": "токен компонента",
      "why": "--toast-icon-success: иконка на тосте"
    },
    {
      "file": "components/molecules/Toast/Toast.css",
      "line": 45,
      "selector": ":root",
      "prop": "--toast-icon-error",
      "from": "var(--error-light)",
      "value": "var(--color-danger-fg-inverse)",
      "kind": "токен компонента",
      "why": "--toast-icon-error: иконка на тосте"
    },
    {
      "file": "components/molecules/Toast/Toast.css",
      "line": 46,
      "selector": ":root",
      "prop": "--toast-icon-info",
      "from": "var(--info-light)",
      "value": "var(--color-info-fg-inverse)",
      "kind": "токен компонента",
      "why": "--toast-icon-info: иконка на тосте"
    },
    {
      "file": "components/molecules/Tooltip/Tooltip.css",
      "line": 42,
      "selector": ".tip",
      "prop": "--tip-fg",
      "from": "var(--text-on-dark)",
      "value": "var(--color-fg-inverse)",
      "kind": "токен компонента",
      "why": "--tip-fg: текст тултипа — на инверсной поверхности"
    },
    {
      "file": "components/molecules/Tooltip/Tooltip.css",
      "line": 61,
      "selector": ".tip",
      "prop": "box-shadow",
      "from": "0 4px 14px rgba(40, 50, 55, .18)",
      "value": "0 4px 14px color-mix(in srgb, var(--color-shadow) 18%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/molecules/Tooltip/Tooltip.css",
      "line": 108,
      "selector": ".tip--error",
      "prop": "background",
      "from": "var(--error)",
      "value": "var(--color-danger-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/molecules/Tooltip/Tooltip.css",
      "line": 109,
      "selector": ".tip--error .tip__arrow",
      "prop": "background",
      "from": "var(--error)",
      "value": "var(--color-danger-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/AllocationBar/AllocationBar.css",
      "line": 73,
      "selector": ".albar__sk",
      "prop": "background",
      "from": "linear-gradient(90deg,var(--cgrey-100) 0%,var(--cgrey-50) 50%,var(--cgrey-100) 100%)",
      "value": "linear-gradient(90deg,var(--color-status-disabled-soft) 0%,var(--color-status-disabled-subtle) 50%,var(--color-status-disabled-soft) 100%)",
      "kind": "мимо токена",
      "why": "скелетон — как Skeleton (статус disabled)"
    },
    {
      "file": "components/organisms/AllocationBar/AllocationBar.css",
      "line": 80,
      "selector": ".albar__dot--sk",
      "prop": "background",
      "from": "var(--cgrey-100)",
      "value": "var(--color-status-disabled-soft)",
      "kind": "мимо токена",
      "why": "скелетон — как Skeleton (статус disabled)"
    },
    {
      "file": "components/organisms/Chart/Chart.css",
      "line": 40,
      "selector": ".chart__legend-item:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Chart/Chart.css",
      "line": 64,
      "selector": ".chart__bar",
      "prop": "fill",
      "from": "var(--chart-c,var(--primary))",
      "value": "var(--chart-c,var(--color-accent-fg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Chart/Chart.css",
      "line": 66,
      "selector": ".chart__line",
      "prop": "stroke",
      "from": "var(--chart-c,var(--primary))",
      "value": "var(--chart-c,var(--color-accent-fg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Chart/Chart.css",
      "line": 68,
      "selector": ".chart__area",
      "prop": "fill",
      "from": "var(--chart-c,var(--primary))",
      "value": "var(--chart-c,var(--color-accent-fg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Chart/Chart.css",
      "line": 69,
      "selector": ".chart__dot",
      "prop": "stroke",
      "from": "var(--chart-c,var(--primary))",
      "value": "var(--chart-c,var(--color-accent-fg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Chart/Chart.css",
      "line": 70,
      "selector": ".chart__dot--solid",
      "prop": "fill",
      "from": "var(--chart-c,var(--primary))",
      "value": "var(--chart-c,var(--color-accent-fg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Chart/Chart.css",
      "line": 92,
      "selector": ".chart__tip-total",
      "prop": "border-top",
      "from": "1px solid color-mix(in srgb,var(--text-on-dark) 24%,transparent)",
      "value": "1px solid color-mix(in srgb,var(--color-fg-inverse) 24%,transparent)",
      "kind": "роль",
      "why": "итог в тултипе графика — на инверсной поверхности"
    },
    {
      "file": "components/organisms/Chart/Chart.css",
      "line": 99,
      "selector": ".chart__brush-window",
      "prop": "border-left",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Chart/Chart.css",
      "line": 99,
      "selector": ".chart__brush-window",
      "prop": "border-right",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Chart/Chart.css",
      "line": 119,
      "selector": ".chart__spark-dot",
      "prop": "fill",
      "from": "var(--chart-c,var(--primary))",
      "value": "var(--chart-c,var(--color-accent-fg))",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Drawer/Drawer.css",
      "line": 115,
      "selector": ".drawer__head.is-scrolled",
      "prop": "box-shadow",
      "from": "0 6px 12px -8px rgba(40, 50, 55, .18)",
      "value": "0 6px 12px -8px color-mix(in srgb, var(--color-shadow) 18%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/organisms/Drawer/Drawer.css",
      "line": 185,
      "selector": ".drawer__body.is-scrolling",
      "prop": "border-color",
      "from": "var(--secondary)",
      "value": "var(--color-scrollbar)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Drawer/Drawer.css",
      "line": 261,
      "selector": ".drawer__foot.is-scrolled",
      "prop": "box-shadow",
      "from": "0 -6px 12px -8px rgba(40, 50, 55, .18)",
      "value": "0 -6px 12px -8px color-mix(in srgb, var(--color-shadow) 18%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/organisms/Entity/Entity.css",
      "line": 87,
      "selector": ".entity__icon",
      "prop": "background",
      "from": "var(--swamp-100)",
      "value": "var(--color-bg-muted)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/organisms/Entity/Entity.css",
      "line": 93,
      "selector": ".entity__icon--accent",
      "prop": "background",
      "from": "color-mix(in srgb, var(--primary) 14%, var(--mgrey-50))",
      "value": "var(--color-accent-bg)",
      "kind": "мимо токена",
      "why": "акцент 14 % поверх белого — акцентная подложка"
    },
    {
      "file": "components/organisms/Entity/Entity.css",
      "line": 93,
      "selector": ".entity__icon--accent",
      "prop": "color",
      "from": "var(--primary-dark)",
      "value": "var(--color-accent-fg-strong)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Entity/Entity.css",
      "line": 94,
      "selector": ".entity__icon--neutral",
      "prop": "background",
      "from": "var(--cgrey-100)",
      "value": "var(--color-bg-muted)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/organisms/Entity/Entity.css",
      "line": 170,
      "selector": ".entity__bookmark--active",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Entity/Entity.css",
      "line": 171,
      "selector": ".entity__bookmark:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Entity/Entity.css",
      "line": 237,
      "selector": ".entity--interactive:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Kanban/Kanban.css",
      "line": 202,
      "selector": ".kbcol__head:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Kanban/Kanban.css",
      "line": 306,
      "selector": ".kbcol.kbcol--drop",
      "prop": "box-shadow",
      "from": "inset 0 0 0 1px var(--primary)",
      "value": "inset 0 0 0 1px var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Kanban/Kanban.css",
      "line": 463,
      "selector": ".kbcard--selected",
      "prop": "border-color",
      "from": "var(--primary)",
      "value": "var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Kanban/Kanban.css",
      "line": 465,
      "selector": ".kbcard--error",
      "prop": "border-color",
      "from": "var(--error)",
      "value": "var(--color-danger-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Modal/Modal.css",
      "line": 73,
      "selector": ":root",
      "prop": "--modal-scrim",
      "from": "color-mix(in srgb, var(--st-grey) 48%, transparent)",
      "value": "var(--color-bg-scrim)",
      "kind": "токен компонента",
      "why": "--modal-scrim: статус вне статусов: затемнение под модалкой"
    },
    {
      "file": "components/organisms/Modal/Modal.css",
      "line": 177,
      "selector": ".modal__head.is-scrolled",
      "prop": "box-shadow",
      "from": "0 6px 12px -8px rgba(40, 50, 55, .18)",
      "value": "0 6px 12px -8px color-mix(in srgb, var(--color-shadow) 18%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/organisms/Modal/Modal.css",
      "line": 238,
      "selector": ".modal__body.is-scrolling",
      "prop": "border-color",
      "from": "var(--secondary)",
      "value": "var(--color-scrollbar)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Modal/Modal.css",
      "line": 294,
      "selector": ".modal__foot.is-scrolled",
      "prop": "box-shadow",
      "from": "0 -6px 12px -8px rgba(40, 50, 55, .18)",
      "value": "0 -6px 12px -8px color-mix(in srgb, var(--color-shadow) 18%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/organisms/NavPanel/NavPanel.css",
      "line": 117,
      "selector": ".nav__list.is-scrolling, .nav:hover .nav__list",
      "prop": "border-color",
      "from": "var(--secondary)",
      "value": "var(--color-scrollbar)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/NavPanel/NavPanel.css",
      "line": 211,
      "selector": ".nav__item:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/NavPanel/NavPanel.css",
      "line": 317,
      "selector": ".nav__user:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/NavPanel/NavPanel.css",
      "line": 215,
      "selector": ".nav__item--selected, .nav__item--selected:hover, .nav__item[aria-current]:not([aria-current=\"false\"]), .nav__item[aria-current]:not([aria-current=\"false\"]):hover",
      "prop": "background",
      "from": "var(--bg-table-default-focus)",
      "value": "var(--color-secondary-bg)",
      "kind": "роль",
      "why": "выбранный пункт навигации — светлая акцентная заливка, а не нейтральная подложка строки таблицы"
    },
    {
      "file": "components/organisms/RiskMetric/RiskMetric.css",
      "line": 21,
      "selector": ".rm-block",
      "prop": "background",
      "from": "var(--bg-page)",
      "value": "var(--color-bg-float)",
      "kind": "роль",
      "why": "блок зоны и рейтинга в поповере — светлее тела поповера"
    },
    {
      "file": "components/molecules/DatePicker/DatePicker.css",
      "line": 26,
      "selector": ".dpk",
      "prop": "background",
      "from": "var(--bg-popup)",
      "value": "var(--color-bg-float)",
      "kind": "роль",
      "why": "календарь — плавающая поверхность, на ступень светлее окна в тёмной (RE0010)"
    },
    {
      "file": "components/molecules/DropdownList/DropdownList.css",
      "line": 41,
      "selector": ".ddl",
      "prop": "--ddl-bg",
      "from": "var(--bg-popup)",
      "value": "var(--color-bg-float)",
      "kind": "токен компонента",
      "why": "выпадающий список — плавающий слой, на ступень светлее окна (RE0010)"
    },
    {
      "file": "components/molecules/DropdownList/DropdownList.css",
      "line": 50,
      "selector": ".ddl",
      "prop": "--ddl-item-hover",
      "from": "var(--tertiary-light)",
      "value": "var(--color-bg-float-hover)",
      "kind": "токен компонента",
      "why": "наведение пункта светлее фона выпадашки (RE0010)"
    },
    {
      "file": "components/molecules/ContextMenu/ContextMenu.css",
      "line": 36,
      "selector": ".menu",
      "prop": "--menu-bg",
      "from": "var(--bg-popup)",
      "value": "var(--color-bg-float)",
      "kind": "токен компонента",
      "why": "меню — плавающий слой (RE0010)"
    },
    {
      "file": "components/molecules/ContextMenu/ContextMenu.css",
      "line": 45,
      "selector": ".menu",
      "prop": "--menu-item-hover",
      "from": "var(--tertiary)",
      "value": "var(--color-bg-float-hover)",
      "kind": "токен компонента",
      "why": "наведение пункта меню светлее фона (RE0010)"
    },
    {
      "file": "components/molecules/Inputs/Inputs.css",
      "line": 62,
      "selector": ".inp__field",
      "prop": "background",
      "from": "var(--bg-tile)",
      "value": "var(--color-bg-tint)",
      "kind": "роль",
      "why": "полупрозрачная заливка поля (альфа): в тёмной светлее поверхности, в светлой — лёгкий серый тон (RE0010, пост-приёмка)"
    },
    {
      "file": "components/organisms/Popover/Popover.css",
      "line": 72,
      "selector": ":root",
      "prop": "--pop-zone-bg",
      "from": "var(--bg-table-pinned)",
      "value": "var(--color-bg-float)",
      "kind": "токен компонента",
      "why": "--pop-zone-bg: шапка и подвал поповера — на ступень светлее тела (RE0010, пост-приёмка)"
    },
    {
      "file": "components/organisms/Modal/Modal.css",
      "line": 68,
      "selector": ":root",
      "prop": "--modal-surface",
      "from": "var(--bg-tile)",
      "value": "var(--color-bg-float)",
      "kind": "токен компонента",
      "why": "поверхность карточек и тайлов внутри окна — слой выше модалки: в тёмной светлее, в светлой темнее (решение человека 04.10.2026)"
    },
    {
      "file": "components/organisms/Drawer/Drawer.css",
      "line": 46,
      "selector": ":root",
      "prop": "--drawer-bg",
      "from": "var(--bg-popup)",
      "value": "var(--color-bg-raised)",
      "kind": "токен компонента",
      "why": "фон шторки объявлен на :root и резолвился от темы страницы — служебная тема панели не перебивала его; тема задаёт токен в своём блоке (Л174)"
    },
    {
      "file": "components/organisms/Modal/Modal.css",
      "line": 68,
      "selector": ":root",
      "prop": "--modal-bg",
      "from": "var(--bg-popup)",
      "value": "var(--color-bg-raised)",
      "kind": "токен компонента",
      "why": "поверхность окна объявлена на :root — та же болезнь вложенной темы, что у шторки (Л174)"
    },
    {
      "file": "components/organisms/Popover/Popover.css",
      "line": 69,
      "selector": ":root",
      "prop": "--pop-bg",
      "from": "var(--bg-popup)",
      "value": "var(--color-bg-raised)",
      "kind": "токен компонента",
      "why": "поверхность поповера объявлена на :root — вложенная тема не перебила бы её (Л174)"
    },
    {
      "file": "components/organisms/Popover/Popover.css",
      "line": 129,
      "selector": ".pop__head.is-scrolled",
      "prop": "box-shadow",
      "from": "0 6px 12px -8px rgba(40, 50, 55, .18)",
      "value": "0 6px 12px -8px color-mix(in srgb, var(--color-shadow) 18%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/organisms/Popover/Popover.css",
      "line": 182,
      "selector": ".pop__body.is-scrolling",
      "prop": "border-color",
      "from": "var(--secondary)",
      "value": "var(--color-scrollbar)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Popover/Popover.css",
      "line": 230,
      "selector": ".pop__foot.is-scrolled",
      "prop": "box-shadow",
      "from": "0 -6px 12px -8px rgba(40, 50, 55, .18)",
      "value": "0 -6px 12px -8px color-mix(in srgb, var(--color-shadow) 18%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/organisms/ProductRow/ProductRow.css",
      "line": 50,
      "selector": ".prow:hover, .prow.is-hover",
      "prop": "box-shadow",
      "from": "inset 0 0 0 1px var(--primary)",
      "value": "inset 0 0 0 1px var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/ProductRow/ProductRow.css",
      "line": 59,
      "selector": ".prow[aria-checked]:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/ProductRow/ProductRow.css",
      "line": 63,
      "selector": ".prow[aria-checked=\"true\"], .prow.is-selected",
      "prop": "box-shadow",
      "from": "inset 0 0 0 1px var(--primary)",
      "value": "inset 0 0 0 1px var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/ProductRow/ProductRow.css",
      "line": 107,
      "selector": ".prow__toggle:focus-visible, .prow__mark:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/ProductRow/ProductRow.css",
      "line": 160,
      "selector": ".prow:hover .prow__title--link, .prow.is-hover .prow__title--link",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/ProductRow/ProductRow.css",
      "line": 162,
      "selector": ".prow__title--link:focus-visible::after",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/SnackBar/SnackBar.css",
      "line": 83,
      "selector": ".snack--info .snack__dupe",
      "prop": "background",
      "from": "color-mix(in srgb, var(--info) 20%, transparent)",
      "value": "color-mix(in srgb, var(--color-info-fill) 20%, transparent)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/SnackBar/SnackBar.css",
      "line": 84,
      "selector": ".snack--warning .snack__dupe",
      "prop": "background",
      "from": "color-mix(in srgb, var(--warning) 20%, transparent)",
      "value": "color-mix(in srgb, var(--color-warning-fill) 20%, transparent)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/SnackBar/SnackBar.css",
      "line": 85,
      "selector": ".snack--error .snack__dupe",
      "prop": "background",
      "from": "color-mix(in srgb, var(--error) 20%, transparent)",
      "value": "color-mix(in srgb, var(--color-danger-fill) 20%, transparent)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/SnackBar/SnackBar.css",
      "line": 86,
      "selector": ".snack--success .snack__dupe",
      "prop": "background",
      "from": "color-mix(in srgb, var(--success) 20%, transparent)",
      "value": "color-mix(in srgb, var(--color-success-fill) 20%, transparent)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/SnackBar/SnackBar.css",
      "line": 108,
      "selector": ".snack__close:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/SnackBar/SnackBar.css",
      "line": 132,
      "selector": ".snack-more__btn:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Table/Table.css",
      "line": 91,
      "selector": ".dtable__body.is-scrolling",
      "prop": "border-color",
      "from": "var(--secondary)",
      "value": "var(--color-scrollbar)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Table/Table.css",
      "line": 104,
      "selector": ".dtable__body::-webkit-scrollbar-thumb:horizontal",
      "prop": "border-color",
      "from": "var(--secondary)",
      "value": "var(--color-scrollbar)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Table/TableSettings.css",
      "line": 49,
      "selector": ".col-item.drop-before",
      "prop": "box-shadow",
      "from": "inset 0 2px 0 0 var(--primary)",
      "value": "inset 0 2px 0 0 var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Table/TableSettings.css",
      "line": 50,
      "selector": ".col-item.drop-after",
      "prop": "box-shadow",
      "from": "inset 0 -2px 0 0 var(--primary)",
      "value": "inset 0 -2px 0 0 var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/TableCell/TableCell.css",
      "line": 65,
      "selector": ".tc:focus-visible",
      "prop": "box-shadow",
      "from": "inset 0 0 0 2px var(--primary)",
      "value": "inset 0 0 0 2px var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/TableCell/TableCell.css",
      "line": 76,
      "selector": ".tbl__row--selected:hover > .tc, .tbl__row--selected.tbl__row--hover > .tc, .tbl__row[aria-selected=\"true\"]:hover > .tc, .tc--selected.tc--hover",
      "prop": "background",
      "from": "color-mix(in srgb, var(--emerald-500) 10%, transparent)",
      "value": "var(--color-row-selected-hover)",
      "kind": "мимо токена",
      "why": "наведение на выбранную строку: emerald-500 10 %"
    },
    {
      "file": "components/organisms/TableCell/TableCell.css",
      "line": 203,
      "selector": ".tc__twisty:hover",
      "prop": "background",
      "from": "var(--swamp-100)",
      "value": "var(--color-bg-hover)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "components/organisms/TableCell/TableCell.css",
      "line": 204,
      "selector": ".tc__twisty:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/TableFilter/TableFilter.css",
      "line": 32,
      "selector": ".tfilter__open i[data-icon=\"filter\"]",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/TableFilter/TableFilter.css",
      "line": 56,
      "selector": ".tfilter__trigger .btn i[data-icon=\"filter\"], .tfilter__trigger .btn i[data-icon=\"filter-reset\"]",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Tile/Tile.css",
      "line": 368,
      "selector": ".tile--card:is(.is-selected, [aria-checked=\"true\"], [aria-selected=\"true\"])",
      "prop": "border-color",
      "from": "var(--primary)",
      "value": "var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Tile/Tile.css",
      "line": 374,
      "selector": ".tile--card:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "components/organisms/Tile/Tile.css",
      "line": 380,
      "selector": ".tile--card.is-move",
      "prop": "border-color",
      "from": "var(--primary)",
      "value": "var(--color-accent-border)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/docs-split.css",
      "line": 59,
      "selector": "main.ds-split .docs-toc__link.is-active",
      "prop": "border-left-color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/docs-split.css",
      "line": 59,
      "selector": "main.ds-split .docs-toc__link.is-active",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 20,
      "selector": ".crumb:hover",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 23,
      "selector": ".badge-new",
      "prop": "border",
      "from": "1px solid color-mix(in srgb, var(--primary) 22%, transparent)",
      "value": "1px solid color-mix(in srgb, var(--color-accent-fg) 22%, transparent)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 23,
      "selector": ".badge-new",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 33,
      "selector": ".toggle .sw-mini",
      "prop": "background",
      "from": "var(--cgrey-200)",
      "value": "var(--color-control-track)",
      "kind": "мимо токена",
      "why": "переключатель документации"
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 34,
      "selector": ".toggle .sw-mini::after",
      "prop": "background",
      "from": "#fff",
      "value": "var(--color-control-thumb)",
      "kind": "мимо токена",
      "why": "бегунок переключателя документации"
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 34,
      "selector": ".toggle .sw-mini::after",
      "prop": "box-shadow",
      "from": "0 1px 2px rgba(0,0,0,.2)",
      "value": "0 1px 2px color-mix(in srgb, var(--color-shadow) 20%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 37,
      "selector": ".toggle[aria-pressed=\"true\"]",
      "prop": "border-color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 37,
      "selector": ".toggle[aria-pressed=\"true\"]",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 39,
      "selector": ".addon",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 42,
      "selector": ".toggle .sw",
      "prop": "background",
      "from": "var(--cgrey-200)",
      "value": "var(--color-control-track)",
      "kind": "мимо токена",
      "why": "переключатель документации"
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 51,
      "selector": ".toggle .sw::after",
      "prop": "background",
      "from": "#fff",
      "value": "var(--color-control-thumb)",
      "kind": "мимо токена",
      "why": "бегунок переключателя документации"
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 51,
      "selector": ".toggle .sw::after",
      "prop": "box-shadow",
      "from": "0 1px 2px rgba(0,0,0,.2)",
      "value": "0 1px 2px color-mix(in srgb, var(--color-shadow) 20%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 56,
      "selector": ".pg-select select:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 63,
      "selector": ".pg-text input:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 72,
      "selector": ".seg button[aria-selected=\"true\"]",
      "prop": "box-shadow",
      "from": "0 1px 2px rgba(40,50,55,.10)",
      "value": "0 1px 2px color-mix(in srgb, var(--color-shadow) 10%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 72,
      "selector": ".seg button[aria-selected=\"true\"]",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 77,
      "selector": ".pg-toggle__sw",
      "prop": "background",
      "from": "var(--cgrey-200)",
      "value": "var(--color-control-track)",
      "kind": "мимо токена",
      "why": "переключатель документации"
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 79,
      "selector": ".pg-toggle__sw::after",
      "prop": "background",
      "from": "#fff",
      "value": "var(--color-control-thumb)",
      "kind": "мимо токена",
      "why": "бегунок переключателя документации"
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 79,
      "selector": ".pg-toggle__sw::after",
      "prop": "box-shadow",
      "from": "0 1px 2px rgba(0,0,0,.2)",
      "value": "0 1px 2px color-mix(in srgb, var(--color-shadow) 20%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 94,
      "selector": ".spec__head",
      "prop": "background",
      "from": "var(--tertiary-light)",
      "value": "var(--color-bg-sunken)",
      "kind": "роль",
      "why": "шапка таблицы спеки на странице ДС"
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 103,
      "selector": ".guide-card.bad .guide-card__bar",
      "prop": "background",
      "from": "var(--error)",
      "value": "var(--color-danger-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 104,
      "selector": ".guide-card.good .guide-card__bar",
      "prop": "background",
      "from": "var(--success)",
      "value": "var(--color-success-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 106,
      "selector": ".guide-card__tag .ic",
      "prop": "color",
      "from": "#fff",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 108,
      "selector": ".spec__sw",
      "prop": "border",
      "from": "1px solid rgba(40,50,55,.12)",
      "value": "1px solid var(--color-border-subtle)",
      "kind": "мимо токена",
      "why": "рамка образца"
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 109,
      "selector": ".guide-card.bad .guide-card__tag .ic",
      "prop": "background",
      "from": "var(--error)",
      "value": "var(--color-danger-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 113,
      "selector": ".guide-card.good .guide-card__tag .ic",
      "prop": "background",
      "from": "var(--success)",
      "value": "var(--color-success-fill)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 119,
      "selector": ".ref-table .rt-tok code",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 125,
      "selector": ".cref-sw",
      "prop": "border",
      "from": "1px solid rgba(40,50,55,.12)",
      "value": "1px solid var(--color-border-subtle)",
      "kind": "мимо токена",
      "why": "рамка образца"
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 156,
      "selector": ".code-panel__copy.is-copied",
      "prop": "background",
      "from": "color-mix(in srgb, var(--success) 30%, transparent)",
      "value": "color-mix(in srgb, var(--color-success-fill) 30%, transparent)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 161,
      "selector": ".cref-row .sw",
      "prop": "border",
      "from": "1px solid rgba(40,50,55,.1)",
      "value": "1px solid var(--color-border-subtle)",
      "kind": "мимо токена",
      "why": "рамка образца"
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 200,
      "selector": ".eyebrow",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-docs.css",
      "line": 207,
      "selector": "code.tok",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-nav.css",
      "line": 34,
      "selector": ".ds-nav__logo",
      "prop": "background",
      "from": "var(--primary-bg, color-mix(in srgb, var(--primary) 10%, #fff))",
      "value": "var(--color-accent-bg, color-mix(in srgb, var(--color-accent-fill) 10%, var(--color-bg-surface)))",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "docs-kit/ds-nav.css",
      "line": 91,
      "selector": ".ds-nav__link.is-active",
      "prop": "color",
      "from": "var(--primary-dark)",
      "value": "var(--color-accent-fg-strong)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-nav.css",
      "line": 116,
      "selector": ".ds-nav__toggle",
      "prop": "box-shadow",
      "from": "0 4px 14px rgba(40,50,55,.10)",
      "value": "0 4px 14px color-mix(in srgb, var(--color-shadow) 10%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "docs-kit/ds-nav.css",
      "line": 121,
      "selector": ".ds-nav__backdrop",
      "prop": "background",
      "from": "rgba(40,50,55,.34)",
      "value": "var(--color-bg-scrim)",
      "kind": "мимо токена",
      "why": "подложка выезжающей навигации"
    },
    {
      "file": "docs-kit/ds-nav.css",
      "line": 129,
      "selector": ".ds-nav",
      "prop": "box-shadow",
      "from": "0 0 40px rgba(40,50,55,.16)",
      "value": "0 0 40px color-mix(in srgb, var(--color-shadow) 16%, transparent)",
      "kind": "мимо токена",
      "why": ""
    },
    {
      "file": "docs-kit/ds-toc.css",
      "line": 17,
      "selector": ".ref-table--cols code.tok",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-toc.css",
      "line": 68,
      "selector": ".ds-toc__link.is-active",
      "prop": "border-left-color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-toc.css",
      "line": 69,
      "selector": ".ds-toc__link.is-active",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/ds-toc.css",
      "line": 73,
      "selector": ".ds-toc__link:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/input-pages.css",
      "line": 29,
      "selector": ".pg__stage",
      "prop": "background",
      "from": "linear-gradient(var(--bg-tile),var(--bg-tile)) padding-box, repeating-conic-gradient(#f2f5f5 0% 25%, #fbfcfc 0% 50%) 0 / 22px 22px",
      "value": "linear-gradient(var(--color-bg-surface),var(--color-bg-surface)) padding-box, repeating-conic-gradient(var(--color-bg-sunken) 0% 25%, var(--color-bg-page) 0% 50%) 0 / 22px 22px",
      "kind": "мимо токена",
      "why": "стенд — верх градиента; стенд — низ градиента"
    },
    {
      "file": "docs-kit/input-pages.css",
      "line": 41,
      "selector": ".pg-text input[type=\"text\"]:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/input-pages.css",
      "line": 49,
      "selector": ".use-block__stage",
      "prop": "background",
      "from": "var(--tertiary-light)",
      "value": "var(--color-bg-sunken)",
      "kind": "роль",
      "why": "стенды и шапка демо-таблицы на страницах ДС"
    },
    {
      "file": "docs-kit/input-pages.css",
      "line": 54,
      "selector": ".anat__stage",
      "prop": "background",
      "from": "var(--tertiary-light)",
      "value": "var(--color-bg-sunken)",
      "kind": "роль",
      "why": "стенды и шапка демо-таблицы на страницах ДС"
    },
    {
      "file": "docs-kit/input-pages.css",
      "line": 57,
      "selector": ".anat__legend li .n",
      "prop": "color",
      "from": "#fff",
      "value": "var(--color-fg-on-fill)",
      "kind": "мимо токена",
      "why": "номер легенды анатомии"
    },
    {
      "file": "docs-kit/input-pages.css",
      "line": 72,
      "selector": ".tbl-demo__row--head",
      "prop": "background",
      "from": "var(--bg-table-pinned, var(--tertiary-light))",
      "value": "var(--color-row-pinned, var(--color-bg-sunken))",
      "kind": "роль",
      "why": "стенды и шапка демо-таблицы на страницах ДС"
    },
    {
      "file": "docs-kit/pg-kit.css",
      "line": 83,
      "selector": ".pg__controls .icnpick__btn[aria-checked=\"true\"]",
      "prop": "border-color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/pg-kit.css",
      "line": 83,
      "selector": ".pg__controls .icnpick__btn[aria-checked=\"true\"]",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/pg-kit.css",
      "line": 84,
      "selector": ".pg__controls .icnpick__btn:focus-visible",
      "prop": "outline",
      "from": "2px solid var(--primary)",
      "value": "2px solid var(--color-focus-ring)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "docs-kit/pg-kit.css",
      "line": 95,
      "selector": ".pg__controls .readout .r .v.tokv",
      "prop": "color",
      "from": "var(--primary)",
      "value": "var(--color-accent-fg)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "foundations/Layout/Layout.css",
      "line": 108,
      "selector": ".ds-scroll.is-scrolling",
      "prop": "border-color",
      "from": "var(--secondary)",
      "value": "var(--color-scrollbar)",
      "kind": "роль",
      "why": ""
    },
    {
      "file": "foundations/Layout/Layout.css",
      "line": 178,
      "selector": ".ds-page-scroll__thumb",
      "prop": "background",
      "from": "var(--secondary)",
      "value": "var(--color-scrollbar)",
      "kind": "роль",
      "why": ""
    }
  ],
  "pages": {
    "style": [
      {
        "match": [
          "border:1px solid rgba(40,50,55,.12)"
        ],
        "prop": "border-color",
        "value": "var(--color-border-subtle)",
        "hits": 442,
        "pages": 47,
        "why": "рамка демо-ячейки"
      },
      {
        "match": [
          "background:var(--swamp-100)",
          "background:var(--swamp-100,#E1EDE7)"
        ],
        "prop": "background",
        "value": "var(--color-bg-muted)",
        "hits": 24,
        "pages": 3,
        "why": ""
      },
      {
        "match": [
          "background:var(--cgrey-100)"
        ],
        "prop": "background",
        "value": "var(--color-bg-muted)",
        "hits": 7,
        "pages": 6,
        "why": ""
      },
      {
        "match": [
          "background:var(--mgrey-50)",
          "background:var(--mgrey-50,#fff)"
        ],
        "prop": "background",
        "value": "var(--color-bg-surface)",
        "hits": 8,
        "pages": 3,
        "why": ""
      },
      {
        "match": [
          "background:var(--swamp-A100,#EEF4F4)"
        ],
        "prop": "background",
        "value": "var(--color-bg-page)",
        "hits": 2,
        "pages": 1,
        "why": ""
      }
    ],
    "block": [
      {
        "selector": ".anat__legend li .n",
        "prop": "color",
        "from": "#fff",
        "value": "var(--color-fg-on-fill)",
        "pages": 35,
        "why": "номера и метки анатомии"
      },
      {
        "selector": ".anat__num",
        "prop": "color",
        "from": "#fff",
        "value": "var(--color-fg-on-fill)",
        "pages": 1,
        "why": "номера и метки анатомии"
      },
      {
        "selector": ".anat__stage",
        "prop": "background",
        "from": "color-mix(in srgb,var(--primary) 5%,#fff)",
        "value": "color-mix(in srgb,var(--color-accent-fill) 5%,var(--color-bg-surface))",
        "pages": 6,
        "why": ""
      },
      {
        "selector": ".anat-dia .mk",
        "prop": "color",
        "from": "#fff",
        "value": "var(--color-fg-on-fill)",
        "pages": 8,
        "why": "номера и метки анатомии"
      },
      {
        "selector": ".anat2__legend li .n",
        "prop": "color",
        "from": "#fff",
        "value": "var(--color-fg-on-fill)",
        "pages": 1,
        "why": "номера и метки анатомии"
      },
      {
        "selector": ".badge-proposal",
        "prop": "background",
        "from": "var(--cgrey-100)",
        "value": "var(--color-bg-muted)",
        "pages": 4,
        "why": ""
      },
      {
        "selector": ".card:hover",
        "prop": "box-shadow",
        "from": "0 12px 30px rgba(40,50,55,.08)",
        "value": "0 12px 30px color-mix(in srgb, var(--color-shadow) 8%, transparent)",
        "pages": 1,
        "why": ""
      },
      {
        "selector": ".demo-vscroll__footer",
        "prop": "box-shadow",
        "from": "0 -6px 12px -10px rgba(40,50,55,.25)",
        "value": "0 -6px 12px -10px color-mix(in srgb, var(--color-shadow) 25%, transparent)",
        "pages": 1,
        "why": ""
      },
      {
        "selector": ".dropdown__menu",
        "prop": "box-shadow",
        "from": "0 10px 30px rgba(40,50,55,.16)",
        "value": "0 10px 30px color-mix(in srgb, var(--color-shadow) 16%, transparent)",
        "pages": 1,
        "why": ""
      },
      {
        "selector": ".entity-stage__card",
        "prop": "box-shadow",
        "from": "var(--elevation-1,0 1px 2px rgba(40,50,55,.06))",
        "value": "var(--elevation-1,0 1px 2px color-mix(in srgb, var(--color-shadow) 6%, transparent))",
        "pages": 1,
        "why": ""
      },
      {
        "selector": ".ex-menu",
        "prop": "box-shadow",
        "from": "0 10px 30px rgba(40,50,55,.12)",
        "value": "0 10px 30px color-mix(in srgb, var(--color-shadow) 12%, transparent)",
        "pages": 1,
        "why": ""
      },
      {
        "selector": ".ex-modal",
        "prop": "box-shadow",
        "from": "0 18px 50px rgba(40,50,55,.14)",
        "value": "0 18px 50px color-mix(in srgb, var(--color-shadow) 14%, transparent)",
        "pages": 1,
        "why": ""
      },
      {
        "selector": ".mcard",
        "prop": "box-shadow",
        "from": "0 1px 3px rgba(40,50,55,.06)",
        "value": "0 1px 3px color-mix(in srgb, var(--color-shadow) 6%, transparent)",
        "pages": 1,
        "why": ""
      },
      {
        "selector": ".mk",
        "prop": "color",
        "from": "#fff",
        "value": "var(--color-fg-on-fill)",
        "pages": 6,
        "why": "номера и метки анатомии"
      },
      {
        "selector": ".navcell",
        "prop": "box-shadow",
        "from": "0 4px 14px rgba(40,50,55,.06)",
        "value": "0 4px 14px color-mix(in srgb, var(--color-shadow) 6%, transparent)",
        "pages": 1,
        "why": ""
      },
      {
        "selector": ".pg__stage",
        "prop": "background",
        "from": "linear-gradient(var(--bg-tile),var(--bg-tile)) padding-box, repeating-conic-gradient(#f2f5f5 0% 25%, #fbfcfc 0% 50%) 0 / 22px 22px",
        "value": "linear-gradient(var(--color-bg-surface),var(--color-bg-surface)) padding-box, repeating-conic-gradient(var(--color-bg-sunken) 0% 25%, var(--color-bg-page) 0% 50%) 0 / 22px 22px",
        "pages": 29,
        "why": ""
      },
      {
        "selector": ".pg-range::-moz-range-thumb",
        "prop": "box-shadow",
        "from": "0 1px 3px rgba(40,50,55,.3)",
        "value": "0 1px 3px color-mix(in srgb, var(--color-shadow) 30%, transparent)",
        "pages": 1,
        "why": ""
      },
      {
        "selector": ".pg-range::-webkit-slider-thumb",
        "prop": "box-shadow",
        "from": "0 1px 3px rgba(40,50,55,.3)",
        "value": "0 1px 3px color-mix(in srgb, var(--color-shadow) 30%, transparent)",
        "pages": 1,
        "why": ""
      },
      {
        "selector": ".pv-colors",
        "prop": "box-shadow",
        "from": "0 1px 3px rgba(40,50,55,.12)",
        "value": "0 1px 3px color-mix(in srgb, var(--color-shadow) 12%, transparent)",
        "pages": 1,
        "why": ""
      },
      {
        "selector": ".stripe span",
        "prop": "border",
        "from": "1px solid rgba(40,50,55,.10)",
        "value": "1px solid var(--color-border-subtle)",
        "pages": 1,
        "why": ""
      },
      {
        "selector": ".surface",
        "prop": "box-shadow",
        "from": "0 6px 26px -18px rgba(40,50,55,.4)",
        "value": "0 6px 26px -18px color-mix(in srgb, var(--color-shadow) 40%, transparent)",
        "pages": 2,
        "why": ""
      },
      {
        "selector": "ol.steps li::before",
        "prop": "color",
        "from": "#fff",
        "value": "var(--color-fg-on-fill)",
        "pages": 1,
        "why": "номера и метки анатомии"
      }
    ]
  },
  "keep": [
    {
      "scope": "компоненты",
      "why": "не цвет: маска прокрутки",
      "where": [
        "AllocationBar.css:113 `.albar-host[data-height=\"A\"] .albar__list` mask-image #000",
        "AllocationBar.css:113 `.albar-host[data-height=\"A\"] .albar__list` -webkit-mask-image #000"
      ]
    },
    {
      "scope": "оболочка доков",
      "why": "код на странице всегда на тёмном фоне",
      "where": [
        "docs-split.css:99 `main.ds-split .code-view pre` color rgba(255,255,255,.85)",
        "docs-split.css:100 `main.ds-split .code-view .tk-pun` color rgba(255,255,255,.5)",
        "docs-split.css:101 `main.ds-split .code-view .tk-kw` color #C792EA",
        "docs-split.css:102 `main.ds-split .code-view .tk-num` color #F78C6C",
        "ds-docs.css:144 `.code-panel` background --cgrey-800",
        "ds-docs.css:147 `.code-wrap` background --cgrey-800",
        "ds-docs.css:148 `.code-panel__head` border-bottom rgba(255,255,255,.08)",
        "ds-docs.css:150 `.code-panel__copy` background rgba(255,255,255,.08)",
        "ds-docs.css:150 `.code-panel__copy` color rgba(255,255,255,.86)",
        "ds-docs.css:152 `.copy-btn` border rgba(255,255,255,.2)",
        "ds-docs.css:152 `.copy-btn` background rgba(255,255,255,.1)",
        "ds-docs.css:152 `.copy-btn` color #fff",
        "ds-docs.css:153 `.code-panel__copy:hover` background rgba(255,255,255,.16)",
        "ds-docs.css:154 `.copy-btn:hover` background rgba(255,255,255,.2)",
        "ds-docs.css:156 `.code-panel__copy.is-copied` color #fff",
        "ds-docs.css:157 `.copy-btn.is-copied` border-color rgba(100,220,150,.5)",
        "ds-docs.css:157 `.copy-btn.is-copied` background rgba(100,220,150,.15)",
        "ds-docs.css:160 `.code-panel code` color rgba(255,255,255,.82)",
        "ds-docs.css:162 `.code-panel .tk-tag` color #79D9C9",
        "ds-docs.css:164 `.code-panel .tk-attr` color #9FC1FF",
        "ds-docs.css:165 `.code-panel .tk-val` color #F2C879",
        "ds-docs.css:166 `.code-panel .tk-cm` color rgba(255,255,255,.4)",
        "input-pages.css:95 `.code-panel__name` color rgba(255,255,255,.72)"
      ]
    },
    {
      "scope": "JS ДС",
      "why": "не цвет: HTML-сущность &#8943; (многоточие)",
      "where": [
        "ds-actions-overflow.js:25 #8943"
      ]
    },
    {
      "scope": "JS ДС",
      "why": "сообщение об ошибке подключения — для разработчика",
      "where": [
        "ds-include.js:60 #d33",
        "ds-include.js:60 #d33"
      ]
    },
    {
      "scope": "JS ДС",
      "why": "заглушка изображения на страницах ДС — собственный вид, не продукт",
      "where": [
        "image-slot.js:164 rgba(0,0,0,.55)",
        "image-slot.js:165 rgba(0,0,0,.04)",
        "image-slot.js:180 rgba(0,0,0,.2)",
        "image-slot.js:180 rgba(0,0,0,.2)",
        "image-slot.js:182 #fff",
        "image-slot.js:182 #c96442",
        "image-slot.js:182 rgba(0,0,0,.3)",
        "image-slot.js:190 #c96442",
        "image-slot.js:197 rgba(0,0,0,.25)",
        "image-slot.js:198 rgba(0,0,0,.75)",
        "image-slot.js:199 #c96442",
        "image-slot.js:200 rgba(201,100,66,.10)",
        "image-slot.js:201 rgba(0,0,0,.25)",
        "image-slot.js:203 #c96442",
        "image-slot.js:214 #fff",
        "image-slot.js:214 rgba(0,0,0,.65)",
        "image-slot.js:216 rgba(0,0,0,.8)",
        "image-slot.js:217 #b3261e",
        "image-slot.js:218 rgba(255,255,255,.85)"
      ]
    },
    {
      "scope": "страницы ДС",
      "why": "код на странице всегда на тёмном фоне",
      "hits": 36,
      "files": [
        "Alert.html",
        "AllocationBar.html",
        "Avatar.html",
        "Badge.html",
        "Breadcrumbs.html",
        "ButtonGroup.html",
        "Buttons.html",
        "Chart.html",
        "Checkbox.html",
        "Chip.html",
        "ContextMenu.html",
        "Divider.html",
        "DropdownList.html",
        "IconButton.html",
        "Icons.html",
        "Illustrations.html",
        "LabelHelper.html",
        "Link.html",
        "Modal.html",
        "NavPanel.html",
        "Pagination.html",
        "Popover.html",
        "ProgressBar.html",
        "Radiobutton.html",
        "ReadOnlyField.html",
        "RiskMetric.html",
        "SegmentControl.html",
        "Skeleton.html",
        "Spinner.html",
        "Splitter.html",
        "SubTab.html",
        "Switch.html",
        "Tab.html",
        "TableFilter.html",
        "Toast.html",
        "Tooltip.html"
      ]
    },
    {
      "scope": "страницы ДС",
      "why": "редкое значение — ждёт переезда",
      "hits": 53,
      "files": [
        "Alert.html",
        "Backlog.html",
        "Badge.html",
        "Breadcrumbs.html",
        "ContextMenu.html",
        "Divider.html",
        "DropdownList.html",
        "Elevation.html",
        "Icons.html",
        "Illustrations.html",
        "Layout.html",
        "Link.html",
        "LocalComponents.html",
        "Redpolicy.html",
        "RiskMetric.html",
        "Skeleton.html",
        "SnackBar.html",
        "Splitter.html",
        "Switch.html",
        "TableFilter.html",
        "Tile.html",
        "Toast.html",
        "Tooltip.html",
        "index.html"
      ]
    },
    {
      "scope": "страницы ДС",
      "why": "шахматка под образцами с прозрачностью",
      "hits": 8,
      "files": [
        "Buttons.html",
        "IconButton.html"
      ]
    },
    {
      "scope": "страницы ДС",
      "why": "тёмный стенд — показ на тёмном фоне намеренно",
      "hits": 8,
      "files": [
        "Elevation.html",
        "IconButton.html",
        "Spinner.html"
      ]
    },
    {
      "scope": "страницы ДС",
      "why": "селектор страницы совпадает с классом компонента — глобальным правилом нельзя",
      "hits": 6,
      "files": [
        "AllocationBar.html",
        "Chart.html",
        "Icons.html",
        "Modal.html",
        "Pagination.html",
        "RiskMetric.html"
      ]
    },
    {
      "scope": "страницы ДС",
      "why": "образцы legacy-палитры — документация текущих цветов",
      "hits": 9,
      "files": [
        "Colors.html"
      ]
    },
    {
      "scope": "страницы ДС",
      "why": "сценарии и данные страниц (скрипты), образцы SVG — не CSS",
      "hits": 549,
      "files": [
        "Alert.page.js",
        "Avatar.html",
        "Badge.html",
        "Buttons.html",
        "Colors.html",
        "Elevation.html",
        "EmptyState.html",
        "IconButton.html",
        "Link.html",
        "Modal.page.js",
        "NavPanel.html",
        "Popover.html",
        "Popover.page.js",
        "RiskMetric.page.js",
        "SegmentControl.page.js",
        "Skeleton.html",
        "Spinner.html",
        "Switch.html",
        "Table.html",
        "TableFilter.html",
        "index.html"
      ]
    }
  ]
};

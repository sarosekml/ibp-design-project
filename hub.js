/* Реестр хаба проектов — источник меню и списка на корневой странице index.html.

   СГЕНЕРИРОВАН hub-build.mjs из apps/<id>/app.json и project.json → hub.ds, localKit. Руками не
   править: запись приложения — его app.json, пересобрать — node .agents/tools/hub-build.mjs
   (гейт сверяет, шаг hub). Хаб строит из реестра и меню, и три колонки; сама
   страница не правится.

   Обычный <script>, а не JSON: страницы открываются по file://, а fetch по
   file:// с кириллическим путём не работает.

   Группы (колонки хаба, в этом порядке):
     ds       — дизайн-система (запись — project.json → hub.ds) и витрина локальных компонентов (project.json → localKit);
     projects — приложения трека product: соответствует настоящей системе, строго на ДС;
     concepts — приложения трека rnd: R&D: кастом допустим, если ТЗ прямо просит;
   Группа приложения — hubGroup его трека (project.json → tracks).
   Карта экранов (project.json → screenMap.maps) — сразу под записью приложения
   after, в его колонке; root — папка карты, не приложения.

   Поля:
     id     — уникальный ключ, латиница; у приложения — его каталог;
     group  — 'ds' | 'projects' | 'concepts';
     title  — название строки на хабе и пункта меню;
     desc   — описание одной строкой;
     href   — стартовая страница от корня: каталог приложения + home из app.json;
     root   — каталог приложения от корня; у группы 'ds' — null. Всё внутри
              него — часть записи: экраны с меню обязаны вести строкой
              пользователя в футере на хаб;
     icon   — имя глифа из design-system/foundations/Icons/Icons.md. */
window.IBPHub = [
  {
    id: 'ds-ibp',
    group: 'ds',
    title: 'Дизайн-система IBP',
    desc: 'Документация основ и компонентов',
    href: 'design-system/index.html',
    root: null,
    icon: 'layer-01'
  },
  {
    id: 'local-kit-post',
    group: 'ds',
    title: 'Локальные компоненты Post',
    desc: 'Тайлы, окна и поповеры модулей Post: как работают, из чего собраны, зачем',
    href: 'apps/local-components/postrade/index.html',
    root: null,
    icon: 'layout-grid-01'
  },
  {
    id: 'local-kit-pre',
    group: 'ds',
    title: 'Локальные компоненты Pre',
    desc: 'Тайлы, окна и поповеры модулей Pre: как работают, из чего собраны, зачем',
    href: 'apps/local-components/pretrade/index.html',
    root: null,
    icon: 'layout-grid-01'
  },
  {
    id: 'local-kit-core',
    group: 'ds',
    title: 'Локальные компоненты Core',
    desc: 'Тайлы, окна и поповеры модулей Core: как работают, из чего собраны, зачем',
    href: 'apps/local-components/core/index.html',
    root: null,
    icon: 'layout-grid-01'
  },
  {
    id: 'local-kit-ib',
    group: 'ds',
    title: 'Локальные компоненты IB',
    desc: 'Тайлы, окна и поповеры модулей IB: как работают, из чего собраны, зачем',
    href: 'apps/local-components/ib/index.html',
    root: null,
    icon: 'layout-grid-01'
  },
  {
    id: 'local-kit-common',
    group: 'ds',
    title: 'Локальные компоненты Общие',
    desc: 'Тайлы, окна и поповеры, общие для разделов: как работают, из чего собраны, зачем',
    href: 'apps/local-components/common/index.html',
    root: null,
    icon: 'layout-grid-01'
  },
  {
    id: 'dashboard-app',
    group: 'projects',
    title: 'Дашборд Аналитика',
    desc: 'Редизайн главной: профиль, встречи, задачи и новости по клиентам',
    href: 'apps/core/dashboard-app/pages/HomePage.preview.html',
    root: 'apps/core/dashboard-app',
    icon: 'layout-grid-01'
  },
  {
    id: 'deals-app',
    group: 'projects',
    title: 'Post — ДИД',
    desc: 'Финансист ДИД: главная, текущий портфель, страница сделки',
    href: 'apps/postrade/deals-app/pages/MainPage.html',
    root: 'apps/postrade/deals-app',
    icon: 'folder'
  },
  {
    id: 'screen-map-post',
    group: 'projects',
    title: 'Карта Post',
    desc: 'Все страницы Post в один клик: от главной до транша и расчета FV',
    href: 'apps/screen-map/postrade/index.html',
    root: 'apps/screen-map/postrade',
    icon: 'tree-view'
  },
  {
    id: 'ai-bankster-prototype-mvp',
    group: 'concepts',
    title: 'AI Pitcher — MVP',
    desc: 'Состав MVP: чат, история, журнал; без конструктора и просмотра материала',
    href: 'apps/ib/drafts/ai-bankster-prototype-mvp/pages/index.html',
    root: 'apps/ib/drafts/ai-bankster-prototype-mvp',
    icon: 'ai-stars'
  },
  {
    id: 'ai-bankster-prototype-v01',
    group: 'concepts',
    title: 'AI Pitcher ver. 01',
    desc: 'Прототип модуля AI Pitcher: новый отчёт, история, журнал',
    href: 'apps/ib/drafts/ai-bankster-prototype-v01/pages/index.html',
    root: 'apps/ib/drafts/ai-bankster-prototype-v01',
    icon: 'ai-stars'
  },
  {
    id: 'ai-bankster-prototype-v02',
    group: 'concepts',
    title: 'AI Pitcher ver. 02',
    desc: 'Прототип v02: чат с конструктором запроса и просмотром материала',
    href: 'apps/ib/drafts/ai-bankster-prototype-v02/pages/index.html',
    root: 'apps/ib/drafts/ai-bankster-prototype-v02',
    icon: 'ai-stars'
  },
  {
    id: 'dev-specs',
    group: 'concepts',
    title: 'Post — Спецификации на разработку',
    desc: 'Сценарии Post для разработки: шаги, экраны, новые компоненты и снимки состояний; выгрузка папкой md + html',
    href: 'apps/postrade/drafts/dev-specs/pages/index.html',
    root: 'apps/postrade/drafts/dev-specs',
    icon: 'file-check'
  },
  {
    id: 'early-interest',
    group: 'concepts',
    title: 'Post — Досрочные проценты',
    desc: 'Транш: карточка «Досрочные проценты», страница досрочных платежей процентов, окна «Новые проценты» и «Порядок погашения» (RE0017)',
    href: 'apps/postrade/drafts/early-interest/pages/Tranche.preview.html',
    root: 'apps/postrade/drafts/early-interest',
    icon: 'folder'
  },
  {
    id: 'ibp-redesign-v1',
    group: 'concepts',
    title: 'Текущая система - Аналитик ДИД',
    desc: 'Страницы системы под роль «Аналитик ДИД» на компонентах ДС — контекст для редизайна (MS0014, часть 1)',
    href: 'apps/core/drafts/ibp-redesign-v1/pages/HomePage.html',
    root: 'apps/core/drafts/ibp-redesign-v1',
    icon: 'layout-grid-01'
  },
  {
    id: 'ibp-redesign-v2',
    group: 'concepts',
    title: 'IBP Redesign v2 — Лиды и мои проекты',
    desc: 'Единые лиды, главная «Мои проекты» и путь лида (MS0015). Отдельная версия на базе контекстных страниц MS0014.',
    href: 'apps/core/drafts/ibp-redesign-v2/pages/HomeBoard.preview.html',
    root: 'apps/core/drafts/ibp-redesign-v2',
    icon: 'layout-grid-01'
  },
  {
    id: 'pipelineManager-v01',
    group: 'concepts',
    title: 'Pipeline Management ver. 01',
    desc: 'Сделки и лиды всех pipeline: канбан по стадиям и дескам, таблица',
    href: 'apps/pretrade/drafts/pipelineManager-v01/pages/index.html',
    root: 'apps/pretrade/drafts/pipelineManager-v01',
    icon: 'layout-grid-01'
  },
  {
    id: 'pipelineManager-v02',
    group: 'concepts',
    title: 'Pipeline Management ver. 02',
    desc: 'Сделки и лиды всех pipeline: канбан по стадиям и дескам, таблица — версия 02',
    href: 'apps/pretrade/drafts/pipelineManager-v02/pages/index.html',
    root: 'apps/pretrade/drafts/pipelineManager-v02',
    icon: 'layout-grid-01'
  },
  {
    id: 'pipelineScanner-v07',
    group: 'concepts',
    title: 'Pipeline Scanner ver. 07',
    desc: 'Пайплайн сканер: нить запроса, конструктор, материалы с заключением АР, история и журнал',
    href: 'apps/pretrade/drafts/pipelineScanner-v07/pages/index.html',
    root: 'apps/pretrade/drafts/pipelineScanner-v07',
    icon: 'ai-stars'
  },
  {
    id: 'tranche-page',
    group: 'concepts',
    title: 'Post — Страница транша',
    desc: 'Транш кредитной линии (НКЛ): шапка, общая информация, проценты, комиссии, платежи',
    href: 'apps/postrade/drafts/tranche-page/pages/Tranche.html',
    root: 'apps/postrade/drafts/tranche-page',
    icon: 'folder'
  },
  {
    id: 'tranche-page-v02',
    group: 'concepts',
    title: 'Post — Страница транша v02',
    desc: 'Транш кредитной линии (НКЛ): шапка, общая информация, проценты, комиссии, платежи. Версия 2: корректировки процентов РСБУ',
    href: 'apps/postrade/drafts/tranche-page-v02/pages/Tranche.html',
    root: 'apps/postrade/drafts/tranche-page-v02',
    icon: 'folder'
  }
];

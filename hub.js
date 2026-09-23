/* Реестр хаба проектов — источник меню и списка на корневой странице index.html.

   СГЕНЕРИРОВАН hub-build.mjs из apps/<id>/app.json и project.json → hub.ds. Руками не
   править: запись приложения — его app.json, пересобрать — node .agents/tools/hub-build.mjs
   (гейт сверяет, шаг hub). Хаб строит из реестра и меню, и три колонки; сама
   страница не правится.

   Обычный <script>, а не JSON: страницы открываются по file://, а fetch по
   file:// с кириллическим путём не работает.

   Группы (колонки хаба, в этом порядке):
     ds       — дизайн-система (запись — project.json → hub.ds);
     projects — приложения трека product: соответствует настоящей системе, строго на ДС;
     concepts — приложения трека rnd: R&D: кастом допустим, если ТЗ прямо просит;
   Группа приложения — hubGroup его трека (project.json → tracks).

   Поля:
     id     — уникальный ключ, латиница; у приложения — его каталог;
     group  — 'ds' | 'projects' | 'concepts';
     title  — название строки на хабе и пункта меню;
     desc   — описание одной строкой;
     href   — стартовая страница от корня: каталог приложения + home из app.json;
     root   — каталог приложения от корня; у группы 'ds' — null. Всё внутри
              него — часть записи: экраны с меню обязаны вести строкой
              пользователя в футере на хаб;
     icon   — имя глифа из design-system/specs/Icons.md. */
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
    id: 'deals-app',
    group: 'projects',
    title: 'Post — ДИД',
    desc: 'Финансист ДИД: главная, текущий портфель, страница сделки',
    href: 'apps/postrade/deals-app/pages/MainPage.html',
    root: 'apps/postrade/deals-app',
    icon: 'folder'
  },
  {
    id: 'ai-bankster-prototype-mvp',
    group: 'concepts',
    title: 'AI Pitcher — MVP',
    desc: 'Состав MVP: чат, конструктор отчёта, история, журнал; без просмотра материала',
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
    icon: 'folder'
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
    id: 'pipeline-manager-kanban',
    group: 'concepts',
    title: 'Pipeline Management',
    desc: 'Сделки и лиды всех pipeline: канбан по стадиям и дескам, таблица',
    href: 'apps/pretrade/drafts/pipeline-manager-kanban/pages/index.html',
    root: 'apps/pretrade/drafts/pipeline-manager-kanban',
    icon: 'layout-grid-01'
  }
];

/* Реестр хаба проектов — источник меню и списка на корневой странице index.html.

   Новое приложение (проект или концепт) = одна запись здесь. Хаб строит из
   реестра и меню, и три колонки; сама страница не правится. Полноту реестра
   проверяет сторож `.agents/tools/registry-check.mjs` (шаг `registry` в
   `lessons-cli gate`): любой .html в apps/ вне каталога зарегистрированного
   приложения даёт FAIL.

   Обычный <script>, а не JSON: страницы открываются по file://, а fetch по
   file:// с кириллическим путём не работает (process.md §10).

   Группы (колонки хаба, в этом порядке):
     ds       — дизайн-система;
     projects — приложения трека product: соответствуют настоящей системе,
                строго на ДС;
     concepts — приложения трека rnd: концепты на ДС, кастомные решения —
                только если ТЗ прямо их просит.
   Трек — свойство приложения, записан в его apps/<id>/app.json; группа
   записи обязана ему соответствовать (треки и группы — project.json).

   Поля:
     id     — уникальный ключ, латиница;
     group  — 'ds' | 'projects' | 'concepts';
     title  — название строки на хабе и пункта меню;
     desc   — описание одной строкой;
     href   — стартовая страница, путь от корня (от папки этого файла);
     root   — каталог приложения от корня, apps/<id>; у группы 'ds' — null.
              Всё внутри него — часть записи: остальным экранам своя запись не
              нужна, а экраны с меню обязаны вести строкой пользователя в
              футере на хаб;
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
    id: 'post',
    group: 'projects',
    title: 'Post — ДИД',
    desc: 'Финансист ДИД: главная, текущий портфель, страница сделки',
    href: 'apps/post/pages/MainPage.html',
    root: 'apps/post',
    icon: 'folder'
  },
  {
    id: 'ai-bankster-prototype',
    group: 'concepts',
    title: 'Аналитические материалы',
    desc: 'Прототип модуля AI Pitcher: новый отчёт, история, журнал',
    href: 'apps/ai-bankster-prototype/pages/index.html',
    root: 'apps/ai-bankster-prototype',
    icon: 'folder'
  },
  {
    id: 'ai-bankster-prototype-v02',
    group: 'concepts',
    title: 'AI Pitcher',
    desc: 'Прототип v02: чат с конструктором запроса и просмотром материала',
    href: 'apps/ai-bankster-prototype-v02/pages/index.html',
    root: 'apps/ai-bankster-prototype-v02',
    icon: 'ai-stars'
  },
  {
    id: 'pipeline-manager-kanban',
    group: 'concepts',
    title: 'Pipeline Management',
    desc: 'Сделки и лиды всех pipeline: канбан по стадиям и дескам, таблица',
    href: 'apps/pipeline-manager-kanban/pages/index.html',
    root: 'apps/pipeline-manager-kanban',
    icon: 'layout-grid-01'
  }
];

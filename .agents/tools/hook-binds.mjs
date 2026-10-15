/* ============================================================
   HOOK-BINDS — единственный список «хук рантайма ДС → чем связывают
   поддерево → по чему видно, что узел связан» (RE0020, Э5).

   Рантаймы ДС связывают хуки один раз, на DOMContentLoaded; разметку,
   нарисованную позже, экран связывает сам (Л93). Список читают двое:
     layout-check.mjs, З12 — статика: строки с `static`, поля bind и accepted;
     page-run.mjs, ЖВ5 — прогон: все строки, поле bound.

   Поля строки:
     hook     — атрибут-хук в разметке;
     bind     — как связывают поддерево (имя в тексте находки);
     accepted — что засчитывается вызовом в статике: связать можно и поштучно
                (`DSModal.bind(trigger)` на реестре сделок), поэтому короче bind;
     static   — строка входит в З12. Прежний HOOK_BINDS сенсора — ровно эти
                строки: новые хуки в З12 без прогона по эталонам не попадают;
     bound    — (узел, окно страницы) → true, если рантайм узел связал; false —
                не связал; null — проверять нечего (у иконки нет глифа — о нём
                уже сказал console.warn рантайма). Отметки — те, что ставит сам
                рантайм ДС; другой отметки рантайм не ставит, своей не заводим.

   Новый хук — строка здесь, а не копия списка в инструменте или документе.
   ============================================================ */

export const HOOK_BINDS = [
  { hook: 'data-modal', bind: 'DSModal.bindAll', accepted: 'DSModal.bind', static: true,
    bound: (el) => !!el.__dsModalBound },
  { hook: 'data-menu', bind: 'DSMenu.bindAll', accepted: 'DSMenu.bind', static: true,
    bound: (el) => !!el.__dsMenu },
  { hook: 'data-drawer', bind: 'DSDrawer.bindAll', accepted: 'DSDrawer.bind', static: true,
    bound: (el) => !!el.__dsDrawerBound },
  { hook: 'data-tabs', bind: 'DSTabs.wireAll', accepted: 'DSTabs.wire', static: true,
    bound: (el) => !!el.__dsTabs },
  { hook: 'data-icon', bind: 'dsIcons.apply', accepted: 'dsIcons.apply', static: true,
    bound: (el, win) => {
      if (el.getAttribute('data-icon-done') === '1') return true;
      const icons = win && win.dsIcons;
      return icons && typeof icons.svg === 'function' && !icons.svg(el.getAttribute('data-icon')) ? null : false;
    } },
  { hook: 'data-kanban', bind: 'DSKanban.bindAll', accepted: 'DSKanban.bind', static: false,
    bound: (el) => !!el.__dsKanban },
  { hook: 'data-table', bind: 'DSTable.wireAll', accepted: 'DSTable.wire', static: false,
    bound: (el) => !!el.__dsTableWired },
];

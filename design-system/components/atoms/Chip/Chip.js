/* =========================================================================
   ds-chip.js — общий рантайм Chip.

   Закрывает три поведения:

   1. УДАЛЕНИЕ (RulesAudit W5 · K5). Клик по .chip__remove ИЛИ Backspace/Delete
      на сфокусированном .chip убирает чип и переносит фокус на соседний чип
      (или на контейнер чиплиста, если чипов не осталось).

   2. ТУЛТИП НА УСЕЧЁННОЙ ПОДПИСИ. Правило спеки Chip («Контент · Переполнение
      текста»): подпись длиннее max-width уходит в многоточие, а по наведению
      показывается тултип с полной версией. Кода за правилом не было — тултипы
      навешивал только ds-table.js и только внутри ячейки таблицы, поэтому чип
      в поле ввода, в баре фильтра, в тайле обрезался молча.
      Механизм общего действия — DSTooltip.truncated() (см. ds-tooltip.js);
      этот рантайм регистрирует селектор подписи чипа и держит только
      специфическое для чипа: исключение счётчиков «+N» и скан disabled-чипов.

   3. РАСКРЫТИЕ (1.020, задача MS0010f). Раскрывающийся чип .chip--expandable:
      клик по шапке-кнопке .chip__toggle (Enter / Space — сама кнопка)
      раскрывает и сворачивает чип — aria-expanded на шапке; в одном
      чиплисте раскрыт один чип; на чипе всплывает событие ds-chip:toggle
      (detail.expanded). Стиль раскрытого рисует CSS.

   Зависимости: components/atoms/Chip/Chip.css; опционально components/molecules/Tooltip/Tooltip.js (без него
   тултипов просто нет, остальное работает).

   Экспорт: window.DSChip = { refresh(root), expand(chip, open) } — refresh
   привязывает тултипы у disabled-чипов внутри root (см. ниже, почему только у
   них); expand раскрывает / сворачивает раскрывающийся чип кодом.
   ========================================================================= */
(function () {
  'use strict';

  function removeChip(chip) {
    if (!chip) return;
    var list = chip.parentElement;
    var next = chip.nextElementSibling || chip.previousElementSibling;
    chip.remove();
    /* у раскрывающегося чипа фокус живёт на шапке-кнопке */
    if (next && next.classList && next.classList.contains('chip')) (next.querySelector('.chip__toggle') || next).focus();
    else if (list) list.focus && list.focus();
  }
  document.addEventListener('click', function (e) {
    var removeBtn = e.target.closest ? e.target.closest('.chip__remove') : null;
    if (!removeBtn) return;
    /* чип «Применено: N» у TableFilter — не наш: его снимает ds-table-filter.js,
       он же шлёт наружу tfilter:reset. Этот рантайм грузится раньше и, снимая
       чип первым, обрывал цепочку: у оторванного от DOM чипа closest('.tfilter')
       уже null, событие сброса не уходило и параметры фильтра оставались
       применёнными (инцидент: портфель ДИД, 05.09.2026). */
    if (removeBtn.closest('.tfilter__applied')) return;
    removeChip(removeBtn.closest('.chip'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Backspace' && e.key !== 'Delete') return;
    var chip = e.target.closest ? e.target.closest('.chip.chip--edit') : null;
    var onToggle = chip && document.activeElement && document.activeElement.classList.contains('chip__toggle') && chip.contains(document.activeElement);
    if (!chip || (chip !== document.activeElement && !onToggle)) return;
    if (chip.classList.contains('tfilter__applied')) return; /* см. выше — владелец ds-table-filter.js */
    if (!chip.querySelector('.chip__remove')) return;
    e.preventDefault();
    removeChip(chip);
  });

  /* ------------------------------------------------------------------ */
  /* Раскрытие (1.020)                                                   */
  /* ------------------------------------------------------------------ */
  function emit(chip, open) {
    var ev;
    try { ev = new CustomEvent('ds-chip:toggle', { bubbles: true, detail: { expanded: open } }); }
    catch (err) { ev = document.createEvent('CustomEvent'); ev.initCustomEvent('ds-chip:toggle', true, false, { expanded: open }); }
    chip.dispatchEvent(ev);
  }
  function expand(chip, open) {
    var toggle = chip && chip.querySelector('.chip__toggle');
    if (!toggle) return;
    open = !!open;
    if ((toggle.getAttribute('aria-expanded') === 'true') === open) return;
    /* в одном чиплисте раскрыт один чип */
    var list = open && chip.parentElement && chip.parentElement.classList.contains('chiplist') ? chip.parentElement : null;
    if (list) {
      list.querySelectorAll('.chip--expandable > .chip__toggle[aria-expanded="true"]').forEach(function (t) {
        if (t === toggle) return;
        t.setAttribute('aria-expanded', 'false');
        emit(t.parentElement, false);
      });
    }
    toggle.setAttribute('aria-expanded', String(open));
    emit(chip, open);
  }
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest ? e.target.closest('.chip__toggle') : null;
    if (!toggle) return;
    var chip = toggle.parentElement;
    if (!chip || !chip.classList.contains('chip--expandable')) return;
    expand(chip, toggle.getAttribute('aria-expanded') !== 'true');
  });

  /* ------------------------------------------------------------------ */
  /* Тултип на усечённой подписи                                         */
  /* ------------------------------------------------------------------ *
     Правило Chip («Контент · Переполнение текста»): подпись длиннее
     max-width уходит в многоточие, а по наведению показывается тултип с
     полной версией. Механизм общий для всей ДС — DSTooltip.truncated()
     (см. ds-tooltip.js): один владелец вместо четырёх почти одинаковых
     копий (этот файл был одной из них). Чип регистрирует свой селектор
     подписи; счётчики «+N» исключены (опция skip) — у них собственный
     тултип со списком скрытых значений от владельца стека.
     Disabled-чип событий не даёт (pointer-events:none), поэтому его
     усечённая подпись читается только сканом refresh() с хук-классом
     .chip--has-tooltip (хук в CSS давно заведён, но его никто не ставил). */

  /* Счётчики свёрнутых чипов исключены: «+N» — не усечённое значение, у него
     собственный тултип со списком скрытых значений, который ставит владелец
     стека (ds-input.js в поле, ds-table.js в ячейке). */
  var COUNTER_SEL = '[data-tc-count], [data-inp-count]';

  function skipCounter(el) {
    if (!el || !el.closest) return false;
    var chip = el.closest('.chip');
    return !chip || chip.matches(COUNTER_SEL) || !!el.closest(COUNTER_SEL);
  }

  /* Регистрация отложена до DOMContentLoaded: в ds.js ds-chip.js грузится
     раньше ds-tooltip.js, и на этапе загрузки window.DSTooltip ещё нет.
     register() — идемпотентная, guard на факт регистрации. */
  var truncHandle = null;
  function registerTrunc() {
    if (truncHandle || !window.DSTooltip) return;
    truncHandle = window.DSTooltip.truncated('.chip__label', {
      host: '.chip',
      disabled: '.chip--disabled, .chip[aria-disabled="true"]',
      disabledClass: 'chip--has-tooltip',
      skip: skipCounter,
      init: false,   /* refresh вызываем сами — один проход, без дубля */
    });
  }

  function refresh(root) {
    registerTrunc();
    if (truncHandle) truncHandle.refresh(root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { refresh(document); });
  else refresh(document);

  window.DSChip = { refresh: refresh, expand: expand };
})();

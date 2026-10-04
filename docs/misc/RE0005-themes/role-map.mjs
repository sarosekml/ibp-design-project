#!/usr/bin/env node
/* ============================================================
   RE0005 · Э2 — словарь ролей и карта «старое → новое». Разовый скрипт этапа.

   Решения этапа — в таблицах ниже (ROLES, MAIN, BY_CLASS, AT, COMP, NO_TOKEN,
   STYLE_RULES, BLOCK_RULES). Места берутся из замера Э1: palette-audit.mjs
   импортируется модулем и ничего не пишет.

   Пишет рядом с собой:
   - Themes.tokens.js — v1 источника тем: роли, карта 119 старых имён,
     точечные правила, правила страниц ДС, «не перекрашивается»; значений
     цвета нет (Э4–Э6). С Э3 файл переезжает в foundations/Themes/ и
     правится руками;
   - map.md — документ согласования (генерат, руками не править).

   Громкий отказ, если: старое имя без роли; роль не из словаря; место без
   решения; решение, которое ничего не нашло; компонентный токен в разных
   ролях без решения.

   Запуск из корня проекта:
     node docs/misc/RE0005-themes/role-map.mjs
   ============================================================ */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const A = await import(pathToFileURL(path.join(HERE, 'palette-audit.mjs')).href);
const OUT_JS = path.join(HERE, 'Themes.tokens.js');
const OUT_MD = path.join(HERE, 'map.md');

const slash = (p) => p.split(path.sep).join('/');
const dsPath = (f) => slash(path.relative(A.L.root, path.join(A.P.root, f)));   // путь от корня ДС
const base = (f) => f.split('/').pop();
const TODAY = '02.10.2026';

/* ============================================================
   1. Словарь ролей. Имя — --color-<группа>-<назначение>[-<состояние>],
      класс словом: fg (текст и иконка) · border · fill · bg.
   ============================================================ */
const R = [];
const role = (group, name, desc) => R.push({ name, group, desc });

role('Фон', '--color-bg-page', 'Фон страницы и рабочей области; зоны внутри поверхности, которые продолжают фон страницы');
role('Фон', '--color-bg-surface', 'Поверхность: тайл, ячейка таблицы, поле ввода');
role('Фон', '--color-bg-raised', 'Поднятая поверхность: меню, выпадающий список, поповер, модалка, Drawer');
role('Фон', '--color-bg-nav', 'Панель навигации');
role('Фон', '--color-bg-inverse', 'Инверсная поверхность: тултип, тост, подпись свёрнутой навигации');
role('Фон', '--color-bg-sunken', 'Приглушённая зона внутри поверхности: шапка и подвал поповера, панель сплиттера, стенд документации');
role('Фон', '--color-bg-muted', 'Нейтральная плашка: аватар, бейдж, иконка Entity, полоса раздела Divider');
role('Фон', '--color-bg-muted-strong', 'Плотная нейтральная плашка (бывший --tertiary-dark; в ДС не применяется)');
role('Фон', '--color-bg-hover', 'Наведение на нейтральный пункт: меню, список, «ещё» крошек, раскрытие строки');
role('Фон', '--color-bg-pressed', 'Нажатие на нейтральный пункт меню и списка');
role('Фон', '--color-bg-selected-hover', 'Наведение на выбранный пункт списка');
role('Фон', '--color-bg-tint', 'Нейтральная полупрозрачная подложка (8 %): плашка «Данные рассчитываются», наведение на иконку ReadOnlyField');
role('Фон', '--color-bg-tint-subtle', 'Нейтральная полупрозрачная подложка (4 %): тонированная строка ProductRow');
role('Фон', '--color-bg-veil', 'Светлая полупрозрачная вуаль поверх содержимого: окно периода в Chart');
role('Фон', '--color-bg-scrim', 'Затемнение под модалкой и тостом, подложка выезжающей навигации документации');

role('Строки таблиц', '--color-row-hover', 'Наведение на строку; на день календаря и строку AllocationBar');
role('Строки таблиц', '--color-row-selected', 'Выбранная строка (в legacy — «focus»)');
role('Строки таблиц', '--color-row-selected-hover', 'Наведение на выбранную строку');
role('Строки таблиц', '--color-row-accent', 'Выделенная строка');
role('Строки таблиц', '--color-row-accent-hover', 'Наведение на выделенную строку');
role('Строки таблиц', '--color-row-accent-selected', 'Выбранная выделенная строка');
role('Строки таблиц', '--color-row-pinned', 'Закреплённая колонка и шапка таблицы');
role('Строки таблиц', '--color-row-pinned-hover', 'Наведение на закреплённую колонку');
role('Строки таблиц', '--color-row-pinned-selected', 'Выбранная ячейка закреплённой колонки');

role('Текст и иконки', '--color-fg-default', 'Основной текст и иконки');
role('Текст и иконки', '--color-fg-secondary', 'Второстепенный текст и иконки: подписи, лейблы');
role('Текст и иконки', '--color-fg-muted', 'Неактивный текст: плейсхолдер, недоступное, подсказка');
role('Текст и иконки', '--color-fg-on-fill', 'Текст и иконки на цветной заливке: акцентная кнопка, бейдж, выбранный день, сплошной чип');
role('Текст и иконки', '--color-fg-inverse', 'Текст и иконки на инверсной поверхности: тултип, тост, кнопка-иконка Contrast, инверсный спиннер');
role('Текст и иконки', '--color-fg-icon', 'Иконка по умолчанию (правило ДС: цвет иконки — --secondary)');
role('Текст и иконки', '--color-fg-icon-strong', 'Иконка при наведении, в выбранном пункте, у сортировки колонки');

role('Границы', '--color-border-default', 'Граница поля, контрастная линия Divider, ось графика');
role('Границы', '--color-border-subtle', 'Разделитель, граница тайла и таблицы, сетка графика');
role('Границы', '--color-border-strong', 'Сильная граница: рамка чекбокса, нажатая карточка, курсор графика');

role('Акцент', '--color-accent-fill', 'Заливка акцентом: акцентная кнопка, выбранный чекбокс, заполнение прогресса');
role('Акцент', '--color-accent-fill-hover', 'Наведение на заливку акцентом');
role('Акцент', '--color-accent-fill-pressed', 'Нажатие на заливку акцентом');
role('Акцент', '--color-accent-fg', 'Текст и иконки акцентом: обводочная и прозрачная кнопка, выбранный пункт');
role('Акцент', '--color-accent-fg-strong', 'Плотный акцентный текст: аватар Accent, выбранный чип, нажатая встроенная кнопка-иконка');
role('Акцент', '--color-accent-fg-pressed', 'Текст и иконки нажатой обводочной и прозрачной кнопки');
role('Акцент', '--color-accent-border', 'Отдельная акцентная граница и обводка-тень: выбранный чип и карточка, «сегодня» в календаре, место вставки');
role('Акцент', '--color-accent-muted', 'Приглушённый акцент (бывший --primary-light; в CSS ДС не применяется, есть в apps/)');
role('Акцент', '--color-accent-bg', 'Акцентная подложка (8 %): диапазон дат, выбранный пункт, плашка аватара и Entity Accent');
role('Акцент', '--color-accent-bg-subtle', 'Акцентная подложка (4 %): ореол наведения чекбокса, радио, переключателя, поля в фокусе');
role('Акцент', '--color-accent-bg-hover', 'Наведение на обводочную и прозрачную кнопку');
role('Акцент', '--color-accent-bg-pressed', 'Нажатие на обводочную и прозрачную кнопку');
role('Акцент', '--color-accent-shadow', 'Тень бегунка включённого переключателя');

role('Ссылка', '--color-link', 'Ссылка');
role('Ссылка', '--color-link-hover', 'Наведение на ссылку');
role('Ссылка', '--color-link-pressed', 'Нажатая ссылка');
role('Ссылка', '--color-link-muted', 'Приглушённая ссылка (бывший --link-light; в ДС не применяется)');

role('Вторичный тон', '--color-secondary-bg', 'Подложка вторичного тона, 32 % (бывший --secondary-bg; в ДС не применяется)');
role('Вторичный тон', '--color-secondary-bg-subtle', 'Подложка вторичного тона, 16 % (бывший --secondary-bg-light; в ДС не применяется)');

role('Элементы управления', '--color-control-track', 'Дорожка: выключенный переключатель, SegmentControl, SubTab, переключатели документации');
role('Элементы управления', '--color-control-track-hover', 'Наведение на дорожку выключенного переключателя');
role('Элементы управления', '--color-control-track-on', 'Дорожка включённого переключателя');
role('Элементы управления', '--color-control-track-on-hover', 'Наведение на включённый переключатель');
role('Элементы управления', '--color-control-thumb', 'Бегунок переключателя');
role('Элементы управления', '--color-scrollbar', 'Бегунок полосы прокрутки');
role('Элементы управления', '--color-focus-ring', 'Кольцо фокуса и граница поля в фокусе');

role('Неактивное', '--color-disabled-fill', 'Заливка недоступного: акцентная кнопка, выбранный чекбокс, бейдж Muted');
role('Неактивное', '--color-disabled-border', 'Граница недоступного: обводочная кнопка, рамка чекбокса');
role('Неактивное', '--color-disabled-border-subtle', 'Светлая граница недоступного: ProductRow');
role('Неактивное', '--color-disabled-bg', 'Фон недоступного: дорожка переключателя, SegmentControl');
role('Неактивное', '--color-disabled-veil', 'Вуаль поверх недоступного (бывший --disabled-bg-semy-transparent; в ДС не применяется)');

const TONES = [['danger', '--error', 'Ошибка'], ['warning', '--warning', 'Предупреждение'], ['success', '--success', 'Успех'], ['info', '--info', 'Информация']];
for (const [t, , ru] of TONES) {
  const g = 'Сообщения · ' + t;
  role(g, '--color-' + t + '-fg', ru + ': текст и иконки');
  role(g, '--color-' + t + '-fg-strong', ru + ': плотный текст — нажатая обводочная кнопка, текст на подложке тона');
  role(g, '--color-' + t + '-fg-pressed', ru + ': нажатая ссылка тона');
  if (t !== 'warning') role(g, '--color-' + t + '-fg-inverse', ru + ': иконка на инверсной поверхности (тост)');
  role(g, '--color-' + t + '-fill', ru + ': заливка — бейдж, акцентная кнопка тона');
  role(g, '--color-' + t + '-fill-hover', ru + ': наведение на заливку');
  role(g, '--color-' + t + '-fill-pressed', ru + ': нажатие на заливку');
  // у success и info все границы парные (с заливкой или текстом) — отдельной роли нет
  if (t === 'danger' || t === 'warning') role(g, '--color-' + t + '-border', ru + ': отдельная граница — поле, рамка чекбокса');
  role(g, '--color-' + t + '-bg', ru + ': подложка — нажатая обводочная кнопка, Alert');
  if (t === 'danger') {
    role(g, '--color-danger-bg-subtle', 'Ошибка: светлая подложка — наведение, Alert');
    role(g, '--color-danger-bg-strong', 'Ошибка: плотная подложка (бывший --error-bg-dark; в ДС не применяется)');
  }
}

const ST_TONES = [['green', 'green', 'зелёный'], ['blue', 'blue', 'синий'], ['orange', 'orange', 'оранжевый'], ['red', 'red', 'красный'],
  ['dpurple', 'purple', 'фиолетовый'], ['grey', 'grey', 'серый'], ['system', 'system', 'системный'], ['disabled', 'disabled', 'недоступный'], ['primary', 'accent', 'акцентный']];
const ST_LEVELS = [['-dark', 'strong', 'плотный: текст на подложке'], ['', 'solid', 'основной: маркер, сплошная заливка'], ['-mid', 'mid', 'средний (56 %)'],
  ['-midlight', 'soft', 'мягкий (32 %)'], ['-light', 'subtle', 'светлый (16 %): подложка']];
for (const [, t, ru] of ST_TONES) for (const [, lv, lru] of ST_LEVELS) role('Статусы', '--color-status-' + t + '-' + lv, 'Статус ' + ru + ', ' + lru);

const CHART_ORDER = ['--ch-blue', '--ch-turquoise', '--ch-indigo', '--ch-orange', '--ch-pastel-green', '--ch-purple',
  '--ch-light-blue', '--ch-yellow', '--ch-shiny-green', '--ch-pink-purple', '--ch-red', '--ch-pale-purple'];   // порядок серий Chart.js
CHART_ORDER.forEach((c, i) => role('Графики', '--color-chart-' + (i + 1), 'Серия ' + (i + 1) + ' (legacy ' + c + ')'));

role('Тень', '--color-shadow', 'Цвет тени: --elevation-*, тени компонентов (непрозрачность — в месте применения)');

const ROLES = new Map(R.map((r) => [r.name, r]));

/* ============================================================
   2. Карта 119 старых имён → основная роль
   ============================================================ */
const MAIN = {
  '--bg-popup': '--color-bg-raised', '--bg-tile': '--color-bg-surface', '--bg-main-menu': '--color-bg-nav',
  '--bg-hint': '--color-bg-inverse', '--bg-page': '--color-bg-page',
  '--bg-table-default': '--color-bg-surface', '--bg-table-default-hover': '--color-row-hover', '--bg-table-default-focus': '--color-row-selected',
  '--bg-table-accent': '--color-row-accent', '--bg-table-accent-hover': '--color-row-accent-hover', '--bg-table-accent-focus': '--color-row-accent-selected',
  '--bg-table-pinned': '--color-row-pinned', '--bg-table-pinned-hover': '--color-row-pinned-hover', '--bg-table-pinned-focus': '--color-row-pinned-selected',
  '--border-primary': '--color-border-default', '--border-light': '--color-border-subtle', '--border-dark': '--color-border-strong',
  '--disabled-border': '--color-disabled-border-subtle',
  '--text-primary': '--color-fg-default', '--text-secondary': '--color-fg-secondary', '--text-inactive': '--color-fg-muted', '--text-on-dark': '--color-fg-on-fill',
  '--primary': '--color-accent-fill', '--primary-dark': '--color-accent-fill-hover', '--primary-light': '--color-accent-muted',
  '--primary-bg': '--color-accent-bg', '--primary-bg-light': '--color-accent-bg-subtle', '--primary-bg-semy-transparent': '--color-bg-veil',
  '--secondary': '--color-fg-icon', '--secondary-dark': '--color-fg-icon-strong', '--secondary-light': '--color-control-track-on',
  '--secondary-bg': '--color-secondary-bg', '--secondary-bg-light': '--color-secondary-bg-subtle',
  '--tertiary': '--color-bg-muted', '--tertiary-dark': '--color-bg-muted-strong', '--tertiary-light': '--color-bg-hover',
  '--tertiary-bg': '--color-bg-tint', '--tertiary-bg-light': '--color-bg-tint-subtle',
  '--error-bg': '--color-danger-bg', '--error-bg-light': '--color-danger-bg-subtle', '--error-bg-dark': '--color-danger-bg-strong',
  '--link': '--color-link', '--link-light': '--color-link-muted', '--link-dark': '--color-link-hover',
  '--disabled': '--color-disabled-fill', '--disabled-bg': '--color-disabled-bg', '--disabled-bg-semy-transparent': '--color-disabled-veil',
};
for (const [t, old] of TONES) {
  MAIN[old] = '--color-' + t + '-fg';
  MAIN[old + '-dark'] = '--color-' + t + '-fg-strong';
  MAIN[old + '-light'] = '--color-' + t + '-fill-pressed';
  if (t !== 'danger') MAIN[old + '-bg'] = '--color-' + t + '-bg';
}
for (const [st, t] of ST_TONES) for (const [suf, lv] of ST_LEVELS) MAIN['--st-' + st + suf] = '--color-status-' + t + '-' + lv;
CHART_ORDER.forEach((c, i) => { MAIN[c] = '--color-chart-' + (i + 1); });

/* ============================================================
   3. Старое имя в другой роли — по группе класса места.
      Группа: fg (текст, иконка) · border · fill · focus (граница/тень в
      фокусе) · shadow · control. Граница парная: в одном правиле с заливкой
      того же имени — роль заливки, с текстом — роль текста. Статусы --st-*
      не делятся (решение пользователя). Нет строки — основная роль: так
      глифы из границ и фонов (дуги спиннера, шевроны, точки, линии-фоны)
      остаются в роли своего имени.
   ============================================================ */
const BY_CLASS = {
  '--primary': { fg: '--color-accent-fg', border: '--color-accent-border', focus: '--color-focus-ring', shadow: '--color-accent-border' },
  '--primary-dark': { fg: '--color-accent-fg-strong' },
  '--secondary': { control: '--color-scrollbar', border: '--color-scrollbar', fill: '--color-scrollbar' },
  '--disabled': { border: '--color-disabled-border' },
};
for (const [t, old] of TONES) {
  const b = '--color-' + t + '-border';
  BY_CLASS[old] = R.some((r) => r.name === b) ? { fill: '--color-' + t + '-fill', border: b, focus: b, shadow: b } : { fill: '--color-' + t + '-fill' };
  BY_CLASS[old + '-dark'] = { fill: '--color-' + t + '-fill-hover' };
}

/* Место — своя роль (file — имя файла; sel — подстрока селектора). */
const AT = [
  { file: 'Switch.css', old: '--secondary', prop: 'background', role: '--color-control-track-on-hover', why: 'наведение на включённый переключатель, не полоса прокрутки' },
  { file: 'TableCell.css', old: '--secondary', role: '--color-fg-icon', why: 'ручка ширины колонки — цвет иконки, не полоса прокрутки' },
  { file: 'Spinner.css', old: '--text-on-dark', sel: 'inverse', role: '--color-fg-inverse', why: 'инверсный спиннер — на тёмной поверхности' },
  { file: 'Chart.css', old: '--text-on-dark', sel: '.chart__tip-total', role: '--color-fg-inverse', why: 'итог в тултипе графика — на инверсной поверхности' },
  { file: 'IconButton.css', old: '--text-on-dark', sel: '.ibtn--contrast', role: '--color-fg-inverse', why: 'тон Contrast — «для тёмных поверхностей» (спека IconButton)' },
  { file: 'ReadOnlyField.css', old: '--text-primary', prop: 'background', role: '--color-bg-tint', full: true, why: 'подложка наведения 8 % от цвета текста — нейтральная подложка' },
  { file: 'Splitter.css', old: '--tertiary-light', sel: '.splitpane__a', role: '--color-bg-sunken', why: 'фон панели, не наведение' },
  { file: 'ds-docs.css', old: '--tertiary-light', sel: '.spec__head', role: '--color-bg-sunken', why: 'шапка таблицы спеки на странице ДС' },
  { file: 'input-pages.css', old: '--tertiary-light', role: '--color-bg-sunken', why: 'стенды и шапка демо-таблицы на страницах ДС' },
  { file: 'SubTab.css', old: '--st-system-light', sel: '.subtabs', role: '--color-control-track', why: 'статус вне статусов: дорожка SubTab' },
];

/* Компонентные токены: решение в месте определения. def — роль всего
   объявления (full — значение целиком, иначе подставляется вместо старого
   имени); fg/fill/… — роль мест применения этой группы; keep — основная
   роль, правила нет. */
const COMP = {
  '--btn-hover-bg': { def: '--color-accent-bg-hover', full: true, why: 'акцент 10 % поверх #fff' },
  '--btn-active-bg': { def: '--color-accent-bg-pressed', full: true, why: 'акцент 18 % поверх #fff' },
  '--btn-pale': { def: '--color-accent-fill-pressed', full: true, fg: '--color-accent-fg-pressed', why: 'акцент 45 % поверх #fff: заливка нажатой акцентной кнопки и текст нажатой обводочной' },
  '--tip-fg': { def: '--color-fg-inverse', why: 'текст тултипа — на инверсной поверхности' },
  '--toast-fg': { def: '--color-fg-inverse', why: 'текст тоста — на инверсной поверхности' },
  '--toast-bg': { def: '--color-bg-inverse', why: 'статус вне статусов: фон тоста' },
  '--toast-scrim': { def: '--color-bg-scrim', full: true, why: 'статус вне статусов: затемнение под тостом' },
  '--modal-scrim': { def: '--color-bg-scrim', full: true, why: 'статус вне статусов: затемнение под модалкой' },
  '--toast-icon-error': { def: '--color-danger-fg-inverse', why: 'иконка на тосте' },
  '--toast-icon-success': { def: '--color-success-fg-inverse', why: 'иконка на тосте' },
  '--toast-icon-info': { def: '--color-info-fg-inverse', why: 'иконка на тосте' },
  '--menu-item-hover': { def: '--color-bg-hover', why: 'наведение в меню = наведение в списке (в legacy меню темнее: --tertiary против --tertiary-light)' },
  '--menu-item-active': { def: '--color-bg-pressed', full: true, why: 'нейтральное нажатие: swamp-500 16 % поверх фона меню' },
  '--ddl-item-selected-hover': { def: '--color-bg-selected-hover', full: true, why: 'swamp-300 30 % поверх фона списка' },
  '--pop-zone-bg': { def: '--color-bg-sunken', why: 'шапка и подвал поповера — зона, не закреплённая колонка' },
  '--link-fg-active': { def: '--color-link-pressed', full: true, why: 'нажатая ссылка, emerald-900' },
  '--alert-accent': { keep: true, why: 'граница строки Alert и иконка — одного цвета тона: основная роль (fg тона)' },
};

/* ============================================================
   4. Места без токена (раздел 9 аудита): v — значение (строка или
      RegExp); role — роль литерала; full — роль всего объявления;
      alpha — сохранить непрозрачность rgba (тени); keep — не
      перекрашивается до переезда.
   ============================================================ */
const SHADOW = /^rgba\(\s*40\s*,\s*50\s*,\s*55\s*,/;
const BLACK_SHADOW = /^rgba\(\s*0\s*,\s*0\s*,\s*0\s*,/;
const WHITE_A = /^rgba\(\s*255\s*,\s*255\s*,\s*255\s*,/;
const NO_TOKEN = [
  // компоненты
  { file: 'Avatar.css', sel: '.av--accent', role: '--color-accent-bg', full: true, why: 'акцент 14 % поверх белого — акцентная подложка' },
  { file: 'Avatar.css', v: '--swamp-100', role: '--color-bg-muted' },
  { file: 'Avatar.css', v: '--cgrey-100', role: '--color-bg-muted' },
  { file: 'Badge.css', v: '--cgrey-100', role: '--color-bg-muted' },
  { file: 'Chip.css', v: '--mgrey-50', role: '--color-fg-on-fill', why: 'текст и иконки сплошного чипа' },
  { file: 'IconButton.css', v: '#fff', role: '--color-fg-inverse', why: 'стейт-слой тона Contrast — от цвета его иконки' },
  { file: 'Link.css', v: '--emerald-900', role: '--color-link-pressed' },
  { file: 'Link.css', sel: '.link--info', role: '--color-info-fg-pressed', full: true, why: 'info-dark 80 % с чёрным' },
  { file: 'Link.css', sel: '.link--warning', role: '--color-warning-fg-pressed', full: true, why: 'warning-dark 80 % с чёрным' },
  { file: 'Link.css', sel: '.link--error', role: '--color-danger-fg-pressed', full: true, why: 'error-dark 80 % с чёрным' },
  { file: 'Link.css', sel: '.link--success', role: '--color-success-fg-pressed', full: true, why: 'success-dark 80 % с чёрным' },
  { file: 'Switch.css', v: '--cgrey-100', role: '--color-control-track' },
  { file: 'Switch.css', v: '--cgrey-200', role: '--color-control-track-hover' },
  { file: 'Switch.css', v: '--mgrey-50', role: '--color-control-thumb' },
  { file: 'Switch.css', v: /^rgba\(\s*0\s*,\s*99\s*,\s*90\s*,/, role: '--color-accent-shadow', alpha: true },
  { file: 'Switch.css', v: '#fff', role: '--color-fg-on-fill', why: 'спиннер на включённом (акцентном) бегунке' },
  { file: 'ButtonGroup.css', v: '#fff', role: '--color-fg-on-fill', why: 'разделитель недоступной акцентной группы' },
  { file: 'ContextMenu.css', v: SHADOW, role: '--color-shadow', alpha: true, why: 'тень меню' },
  { file: 'DropdownList.css', v: '--swamp-500', role: '--color-bg-pressed', full: true, why: 'нейтральное нажатие: swamp-500 12 % поверх фона списка' },
  { file: 'SegmentControl.css', v: '--swamp-400', role: '--color-control-track', full: true, why: 'дорожка: swamp-400 16 %' },
  { file: 'AllocationBar.css', v: '#000', keep: 'не цвет: маска прокрутки' },
  { file: 'AllocationBar.css', v: '--cgrey-100', role: '--color-status-disabled-soft', why: 'скелетон — как Skeleton (статус disabled)' },
  { file: 'AllocationBar.css', v: '--cgrey-50', role: '--color-status-disabled-subtle', why: 'скелетон — как Skeleton (статус disabled)' },
  { file: 'Entity.css', sel: '.entity__icon--accent', role: '--color-accent-bg', full: true, why: 'акцент 14 % поверх белого — акцентная подложка' },
  { file: 'Entity.css', v: '--swamp-100', role: '--color-bg-muted' },
  { file: 'Entity.css', v: '--cgrey-100', role: '--color-bg-muted' },
  { file: 'TableCell.css', v: '--emerald-500', role: '--color-row-selected-hover', full: true, why: 'наведение на выбранную строку: emerald-500 10 %' },
  { file: 'TableCell.css', v: '--swamp-100', role: '--color-bg-hover' },
  // оболочка документации
  { file: 'docs-split.css', keep: 'код на странице всегда на тёмном фоне' },
  { file: 'ds-docs.css', sel: 'code', keep: 'код на странице всегда на тёмном фоне' },
  { file: 'ds-docs.css', sel: 'copy-btn', keep: 'код на странице всегда на тёмном фоне' },
  { file: 'ds-docs.css', v: '--cgrey-200', role: '--color-control-track', why: 'переключатель документации' },
  { file: 'ds-docs.css', v: '#fff', sel: '::after', role: '--color-control-thumb', why: 'бегунок переключателя документации' },
  { file: 'ds-docs.css', v: '#fff', sel: '.guide-card__tag', role: '--color-fg-on-fill' },
  { file: 'ds-nav.css', v: '#fff', sel: '.ds-nav__logo', role: '--color-bg-surface' },
  { file: 'ds-nav.css', v: SHADOW, sel: '.ds-nav__backdrop', role: '--color-bg-scrim', why: 'подложка выезжающей навигации' },
  { file: 'input-pages.css', v: '#f2f5f5', role: '--color-bg-sunken', why: 'стенд — верх градиента' },
  { file: 'input-pages.css', v: '#fbfcfc', role: '--color-bg-page', why: 'стенд — низ градиента' },
  { file: 'input-pages.css', v: '#fff', role: '--color-fg-on-fill', why: 'номер легенды анатомии' },
  { file: 'input-pages.css', v: WHITE_A, keep: 'код на странице всегда на тёмном фоне' },
  // тени и тонкие рамки rgba — по классу свойства
  { v: SHADOW, cls: 'тень', role: '--color-shadow', alpha: true },
  { v: BLACK_SHADOW, cls: 'тень', role: '--color-shadow', alpha: true },
  { v: SHADOW, cls: 'граница', role: '--color-border-subtle', why: 'рамка образца' },
];
const JS_KEEP = [
  { file: 'image-slot.js', keep: 'заглушка изображения на страницах ДС — собственный вид, не продукт' },
  { file: 'ds-include.js', keep: 'сообщение об ошибке подключения — для разработчика' },
  { file: 'ds-actions-overflow.js', keep: 'не цвет: HTML-сущность &#8943; (многоточие)' },
];

/* ============================================================
   5. Страницы ДС (решение пользователя: правила по значению).
      STYLE_RULES — атрибут style: отрезок «свойство: значение» → свойство
      и роль; вывод — [style*="…"] с !important, только страницы ДС.
      BLOCK_RULES — блоки <style> страниц: селектор и значение → роль.
   ============================================================ */
const STYLE_RULES = [
  { raw: 'border:1px solid rgba(40,50,55,.12)', prop: 'border-color', role: '--color-border-subtle', why: 'рамка демо-ячейки' },
  { prefix: 'background:var(--swamp-100', prop: 'background', role: '--color-bg-muted' },
  { prefix: 'background:var(--cgrey-100', prop: 'background', role: '--color-bg-muted' },
  { prefix: 'background:var(--mgrey-50', prop: 'background', role: '--color-bg-surface' },
  { prefix: 'background:var(--swamp-A100', prop: 'background', role: '--color-bg-page' },
];
const BLOCK_RULES = [
  { sel: '.pg__stage', v: '#f2f5f5', role: '--color-bg-sunken' },
  { sel: '.pg__stage', v: '#fbfcfc', role: '--color-bg-page' },
  { sel: /^\.anat2?__legend li \.n$|^\.anat-dia \.mk$|^\.mk$|^\.anat__num$|^ol\.steps li::before$/, v: '#fff', role: '--color-fg-on-fill', why: 'номера и метки анатомии' },
  { sel: '.anat__stage', v: '#fff', role: '--color-bg-surface' },
  { sel: '.badge-proposal', v: '--cgrey-100', role: '--color-bg-muted' },
];
const PAGE_KEEP = [
  { file: 'Colors.html', why: 'образцы legacy-палитры — документация текущих цветов' },
  { sel: /code|tk-/, why: 'код на странице всегда на тёмном фоне' },
  { v: '#d9e0e0', why: 'шахматка под образцами с прозрачностью' },
  { v: '--cgrey-800', why: 'тёмный стенд — показ на тёмном фоне намеренно' },
  { sel: /dark/, why: 'тёмный стенд — показ на тёмном фоне намеренно' },
];

// спорные строки карты — согласованы с пользователем 02.10.2026, все по рекомендации
const FLAGS = [
  'Наведение в ContextMenu (`--menu-item-hover` = `--tertiary`) приравнено к наведению в списке (`--color-bg-hover`, legacy `--tertiary-light`). В legacy меню при наведении темнее списка.',
  'Статусы вне статусов: фон тоста (`--st-grey` → `--color-bg-inverse`), затемнение под тостом и модалкой (`--st-grey` → `--color-bg-scrim`), дорожка SubTab (`--st-system-light` → `--color-control-track`). Остальные `--st-*` вне чипов (маркеры колонок Kanban, скелетон, недоступные Tab, DatePicker, SegmentControl, InputText, полоса AllocationBar) остаются статусами.',
  '`--text-on-dark` разделён: на цветной заливке — `--color-fg-on-fill` (основная), на инверсной поверхности — `--color-fg-inverse` (тултип, тост, IconButton Contrast, инверсный спиннер). В тёмной теме инверсная поверхность светлая, заливка — нет.',
  'Граница парная: в одном правиле с заливкой того же имени граница берёт роль заливки (сплошная кнопка без кольца), с текстом — роль текста (у обводочной кнопки рамка цвета подписи). Отдельная роль границы — только у отдельной границы (поле с ошибкой, выбранный чип).',
  'Нажатая ссылка тона (`color-mix(--info-dark 80 %, #000)` и т. п.) — новые роли `--color-<тон>-fg-pressed`.',
  'Скелетон AllocationBar (`--cgrey-100`/`--cgrey-50`) → статус disabled, как у Skeleton.',
  'Семь имён без применения — каждое со своей ролью: `--color-secondary-bg`, `--color-secondary-bg-subtle`, `--color-bg-muted-strong`, `--color-danger-bg-strong`, `--color-link-muted`, `--color-disabled-veil`, `--color-bg-tint` (с Э1 применён в apps/).',
];

/* ============================================================
   Развёртка
   ============================================================ */
const fail = [];
const warn = [];
const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const RAMP_TONES = ['accent', 'neutral', 'grey', 'amber', 'blue', 'brown', 'cyan', 'deep-orange', 'deep-purple', 'green', 'indigo',
  'light-blue', 'light-green', 'lime', 'orange', 'pink', 'purple', 'red', 'yellow'];

// 119 имён
for (const t of A.sem) {
  if (!MAIN[t.name]) fail.push('нет основной роли: ' + t.name);
  else if (!ROLES.has(MAIN[t.name])) fail.push('роль не из словаря: ' + t.name + ' → ' + MAIN[t.name]);
}
for (const k of Object.keys(MAIN)) if (!A.semByName.has(k)) fail.push('в MAIN лишнее имя: ' + k);
const checkRole = (r, where) => { if (r && !ROLES.has(r)) fail.push('роль не из словаря: ' + r + ' (' + where + ')'); };
for (const [k, o] of Object.entries(BY_CLASS)) for (const r of Object.values(o)) checkRole(r, 'BY_CLASS ' + k);
AT.forEach((a) => checkRole(a.role, 'AT ' + a.file));
for (const [k, o] of Object.entries(COMP)) for (const [kk, r] of Object.entries(o)) if (kk !== 'why' && kk !== 'full' && kk !== 'keep') checkRole(r, 'COMP ' + k);
NO_TOKEN.forEach((n) => checkRole(n.role, 'NO_TOKEN ' + (n.file || '*')));
[...STYLE_RULES, ...BLOCK_RULES].forEach((n) => checkRole(n.role, 'страницы'));

const GROUP = { 'текст': 'fg', 'иконка': 'fg', 'граница': 'border', 'фон': 'fill', 'тень': 'shadow', 'контрол': 'control', 'токен': 'token' };
function group(p) {
  const st = p.state || '';
  if ((p.cls === 'граница' || p.cls === 'тень') && st.includes('фокус') && !st.includes('наведение')) return 'focus';
  return GROUP[p.cls] || 'other';
}
// все места CSS ДС одним списком, с именем семантики
const allPlaces = [];
for (const [S, list] of A.places) for (const p of list) allPlaces.push({ ...p, S, g: group(p) });
// парная граница: в том же правиле то же имя (через тот же токен) в заливке или тексте
const sibling = new Map();
for (const p of allPlaces) {
  const k = p.file + '|' + p.selector + '|' + p.S + '|' + p.via;
  if (!sibling.has(k)) sibling.set(k, new Set());
  sibling.get(k).add(p.g);
}
function effGroup(p) {
  if (p.g !== 'border') return p.g;
  const s = sibling.get(p.file + '|' + p.selector + '|' + p.S + '|' + p.via);
  return s.has('fill') ? 'fill' : s.has('fg') ? 'fg' : 'border';
}
const used = new Set();
const atFor = (p, S) => AT.find((a) => (!a.old || a.old === S) && base(p.file) === a.file && (!a.sel || p.selector.includes(a.sel)) && (!a.prop || a.prop === p.prop));
function roleFor(S, p) {
  const a = atFor(p, S);
  if (a) { used.add(a); return { role: a.role, full: !!a.full, why: a.why }; }
  if (S.startsWith('--st-')) return { role: MAIN[S] };
  const g = effGroup({ ...p, S });
  return { role: BY_CLASS[S]?.[g] || MAIN[S], g };
}

// объявления CSS ДС по месту
const declIndex = new Map();
for (const F of A.files) if (F.decls) for (const d of F.decls) declIndex.set(F.rel + '|' + d.line + '|' + d.prop + '|' + d.selector, d);
const rules = new Map();   // ключ объявления → правило в сборке
function ruleAt(file, line, selector, prop) {
  const k = file + '|' + line + '|' + prop + '|' + selector;
  if (!rules.has(k)) {
    const d = declIndex.get(k);
    if (!d) { fail.push('нет объявления: ' + k); return null; }
    rules.set(k, { file, line, selector, prop, from: d.value, sem: new Map(), comp: new Map(), lit: [], full: null, why: new Set(), kinds: new Set() });
  }
  return rules.get(k);
}

// компонентные токены: места применения (вместе с токенами, которые на них ссылаются)
const usageByComp = new Map();
for (const p of allPlaces) if (p.via) {
  if (!usageByComp.has(p.via)) usageByComp.set(p.via, new Map());
  usageByComp.get(p.via).set(p.file + '|' + p.line + '|' + p.prop + '|' + p.selector + '|' + p.S, p);
}
const VAR_RX = /var\(\s*(--[\w-]+)\s*[,)]/g;
const semIn = (value) => [...new Set([...value.matchAll(VAR_RX)].map((m) => m[1]).filter((n) => A.semByName.has(n)))];
const compIn = (value) => [...new Set([...value.matchAll(VAR_RX)].map((m) => m[1]).filter((n) => A.compDefs.has(n)))];
function usagesOf(C, seen = new Set()) {
  if (seen.has(C)) return [];
  seen.add(C);
  const out = [...(usageByComp.get(C)?.values() || [])];
  for (const [D, refs] of A.compDefs) if (refs.has(C)) out.push(...usagesOf(D, seen));
  return out;
}

const compReport = [];   // для map.md
const mixed = [];
for (const [C, defs] of A.compAt) {
  const dec = COMP[C];
  const uses = usagesOf(C);
  if (dec) {
    used.add(dec);
    if (dec.keep) { compReport.push({ C, defs, dec, uses: uses.length, note: 'основная роль' }); continue; }
    for (const d of defs) {
      const r = ruleAt(d.file, d.line, d.selector, C);
      if (!r) continue;
      r.kinds.add('токен компонента'); r.why.add(C + ': ' + dec.why);
      if (dec.full) r.full = dec.def;
      else for (const S of semIn(d.value)) r.sem.set(S, dec.def);
    }
    let usageRules = 0;
    const seenDecl = new Set();
    for (const u of uses) {
      const g = effGroup(u);
      if (!dec[g] || dec[g] === dec.def) continue;
      const dk = u.file + '|' + u.line + '|' + u.prop + '|' + u.selector;
      if (seenDecl.has(dk)) continue;
      seenDecl.add(dk);
      const r = ruleAt(u.file, u.line, u.selector, u.prop);
      if (!r) continue;
      r.kinds.add('токен компонента'); r.why.add(C + ' в группе ' + g + ': ' + dec[g]);
      r.comp.set(C, dec[g]);
      usageRules++;
    }
    compReport.push({ C, defs, dec, uses: uses.length, note: usageRules ? 'и ' + usageRules + ' мест применения' : '' });
    continue;
  }
  // без решения: роль выводится из мест применения
  for (const d of defs) {
    const Ss = semIn(d.value);
    if (!Ss.length || !uses.length) continue;
    const per = Ss.map((S) => [S, new Set(uses.map((u) => roleFor(S, { ...u, S }).role))]);
    if (per.every(([S, rs]) => rs.size === 1 && rs.has(MAIN[S]))) continue;
    if (per.every(([, rs]) => rs.size === 1)) {
      const r = ruleAt(d.file, d.line, d.selector, C);
      if (!r) continue;
      r.kinds.add('токен компонента');
      for (const [S, rs] of per) { const x = [...rs][0]; if (x !== MAIN[S]) { r.sem.set(S, x); r.why.add(C + ': все места применения — ' + x); } }
      compReport.push({ C, defs: [d], dec: null, uses: uses.length, note: 'выведено из мест применения' });
    } else mixed.push(C + ' (' + d.file.split('/').pop() + ':' + d.line + '): ' + per.map(([S, rs]) => S + ' → ' + [...rs].join(' / ')).join('; '));
  }
}
for (const m of mixed) fail.push('компонентный токен в разных ролях — нужно решение в COMP: ' + m);

// прямые места: роль ≠ основной → правило
const decisions = new Map();   // «имя · группа → роль» для map.md
for (const p of allPlaces) {
  if (p.via) continue;
  const r0 = roleFor(p.S, p);
  const key = p.S + '|' + (r0.g || 'место') + '|' + r0.role;
  if (!decisions.has(key)) decisions.set(key, { S: p.S, g: r0.g || 'место', role: r0.role, n: 0, ex: [] });
  const dd = decisions.get(key); dd.n++; if (dd.ex.length < 3) dd.ex.push(base(p.file) + ':' + p.line + ' `' + p.selector.slice(0, 60) + '` ' + p.prop);
  if (r0.role === MAIN[p.S] && !r0.full) continue;
  const r = ruleAt(p.file, p.line, p.selector, p.prop);
  if (!r) continue;
  r.kinds.add('роль');
  if (r0.full) { r.full = r0.role; r.why.add(r0.why); } else { r.sem.set(p.S, r0.role); if (r0.why) r.why.add(r0.why); }
}

// места без токена
const keep = [];
const ntMatch = (n, x) => (!n.file || base(x.file) === n.file) && (!n.sel || x.selector.includes(n.sel)) && (!n.cls || n.cls === x.cls)
  && (!n.v || (n.v instanceof RegExp ? n.v.test(x.v) : n.v === x.v));
for (const x of A.noToken) {
  if (x.group === 'основы') continue;
  const n = NO_TOKEN.find((nn) => ntMatch(nn, x));
  // литерал в объявлении, которое решение токена компонента заменяет целиком, — уже покрыт
  if (!n && rules.get(x.file + '|' + x.line + '|' + x.prop + '|' + x.selector)?.full) continue;
  if (!n) { fail.push('место без решения: ' + x.file + ':' + x.line + ' ' + x.selector + ' ' + x.prop + ' ' + x.v); continue; }
  used.add(n);
  if (n.keep) { keep.push({ scope: x.group === 'оболочка доков' ? 'оболочка доков' : 'компоненты', where: base(x.file) + ':' + x.line + ' `' + x.selector.slice(0, 50) + '` ' + x.prop, v: x.v, why: n.keep }); continue; }
  // литерал в объявлении компонентного токена с решением full — уже покрыт
  const r = ruleAt(x.file, x.line, x.selector, x.prop);
  if (!r) continue;
  r.kinds.add('мимо токена');
  if (n.why) r.why.add(n.why);
  if (n.full) { if (!r.full) r.full = n.role; continue; }
  r.lit.push({ v: x.v, kind: x.kind, role: n.role, alpha: !!n.alpha });
}
for (const x of A.jsNoToken) {
  const n = JS_KEEP.find((j) => base(x.file) === j.file);
  if (!n) { fail.push('JS без решения: ' + x.file + ':' + x.line + ' ' + x.v); continue; }
  used.add(n);
  keep.push({ scope: 'JS ДС', where: base(x.file) + ':' + x.line, v: x.v, why: n.keep });
}

// значение правила
const escRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const alphaOf = (v) => { const m = v.match(/,\s*([\d.]+)\s*\)$/); return m ? parseFloat(m[1]) : 1; };
const pct = (a) => String(Math.round(a * 10000) / 100) + '%';
function valueOf(r) {
  if (r.full) return 'var(' + r.full + ')';
  let v = r.from;
  for (const l of r.lit) {
    const to = (l.alpha && alphaOf(l.v) < 1) ? 'color-mix(in srgb, var(' + l.role + ') ' + pct(alphaOf(l.v)) + ', transparent)' : 'var(' + l.role + ')';
    if (l.kind === 'рампа') v = v.replace(new RegExp('var\\(\\s*' + escRx(l.v) + '\\s*(,[^()]*)?\\)', 'g'), to);
    else if (l.kind === 'hex') v = v.replace(new RegExp(escRx(l.v) + '(?![0-9a-fA-F])', 'gi'), to);
    else v = v.split(l.v).join(to);
  }
  for (const [C, role] of r.comp) v = v.replace(new RegExp('var\\(\\s*' + escRx(C) + '\\s*([,)])', 'g'), 'var(' + role + '$1');
  v = v.replace(/var\(\s*(--[\w-]+)\s*([,)])/g, (m, n, end) => (A.semByName.has(n) ? 'var(' + (r.sem.get(n) || MAIN[n]) + end : m));
  return v;
}
// после подстановки в значении не должно остаться hex, rgb, рамп legacy и старых имён
function leftover(value) {
  if (/#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])|\brgba?\(|\bwhite\b|\bblack\b/.test(value)) return true;
  if (/var\(\s*--(?!color-)[a-z-]+-(?:50|[1-9]00|A[1-7]00)\s*[,)]/.test(value)) return true;
  return [...value.matchAll(/var\(\s*(--[\w-]+)/g)].some((m) => A.semByName.has(m[1]));
}
const RULES = [...rules.values()].map((r) => {
  const value = valueOf(r);
  if (leftover(value)) warn.push('в значении правила осталось не роль: ' + r.file + ':' + r.line + ' → ' + value);
  return { file: dsPath(r.file), line: r.line, selector: r.selector, prop: r.prop, from: r.from, value, kind: [...r.kinds].join(' + '), why: [...r.why].join('; ') };
}).sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.prop.localeCompare(b.prop));
// одинаковые селектор и свойство в одном файле — правило перебьёт оба
const dupKey = new Map();
for (const r of RULES) { const k = r.file + '|' + r.selector + '|' + r.prop; dupKey.set(k, (dupKey.get(k) || 0) + 1); }
for (const [k, n] of dupKey) if (n > 1) warn.push('селектор и свойство повторяются в файле (' + n + '): ' + k);

/* ---------- страницы ДС ---------- */
const compClasses = new Set();
for (const F of A.files) if (F.area === 'css' && F.decls) for (const d of F.decls) for (const m of d.selector.matchAll(/\.([a-zA-Z][\w-]*)/g)) compClasses.add(m[1]);
const collides = (sel) => [...sel.matchAll(/\.([a-zA-Z][\w-]*)/g)].some((m) => compClasses.has(m[1]));
const pageKeep = new Map();   // причина → { hits, files:Set }
const noteKeep = (why, file, n = 1) => { const k = pageKeep.get(why) || { hits: 0, files: new Set() }; k.hits += n; k.files.add(base(file)); pageKeep.set(why, k); };
const styleRules = STYLE_RULES.map((s) => ({ ...s, hits: 0, raws: new Set(), files: new Set() }));
const blockRules = new Map();
let fallbackHits = 0;
const fbRx = (v) => new RegExp('var\\(\\s*(--[\\w-]+)\\s*,\\s*' + escRx(v) + '(?![0-9a-fA-F])', 'i');
const pk = (p) => PAGE_KEEP.find((k) => (k.file && base(p.file) === k.file) || (k.sel && p.selector && k.sel.test(p.selector)) || (k.v && p.v === k.v));
for (const p of A.pagePlaces) {
  const kp = pk(p);
  if (kp && kp.file) { noteKeep(kp.why, p.file); continue; }
  if (p.where === 'style') {
    const raw = p.raw.replace(/\s+/g, ' ').trim();
    const fb = p.kind === 'hex' && raw.match(fbRx(p.v));
    if (fb && A.semByName.has(fb[1])) { fallbackHits++; continue; }
    if (fb && /^--ch-/.test(fb[1])) { fallbackHits++; continue; }
    const s = styleRules.find((x) => (x.raw && raw === x.raw) || (x.prefix && raw.startsWith(x.prefix)));
    if (s) { s.hits++; s.raws.add(p.raw.trim()); s.files.add(base(p.file)); continue; }
    noteKeep(kp ? kp.why : 'редкое значение — ждёт переезда', p.file);
    continue;
  }
  // блок <style>
  if (kp) { noteKeep(kp.why, p.file); continue; }
  let b = BLOCK_RULES.find((x) => (x.sel instanceof RegExp ? x.sel.test(p.selector) : x.sel === p.selector) && x.v === p.v);
  if (!b && SHADOW.test(p.v)) {
    const cls = A.propClass(p.prop, p.selector);
    if (cls === 'тень') b = { role: '--color-shadow', alpha: true };
    else if (cls === 'граница') b = { role: '--color-border-subtle' };
  }
  if (!b) { noteKeep('редкое значение — ждёт переезда', p.file); continue; }
  if (collides(p.selector)) { noteKeep('селектор страницы совпадает с классом компонента — глобальным правилом нельзя', p.file); continue; }
  if (b.sel) used.add(b);
  const k = p.selector + '|' + p.prop + '|' + p.value;
  if (!blockRules.has(k)) blockRules.set(k, { selector: p.selector, prop: p.prop, from: p.value, lit: [], files: new Set(), why: b.why || '' });
  const br = blockRules.get(k);
  br.files.add(base(p.file));
  if (!br.lit.some((l) => l.v === p.v)) br.lit.push({ v: p.v, kind: p.kind, role: b.role, alpha: !!b.alpha });
}
for (const s of styleRules) if (!s.hits) fail.push('правило страниц ничего не нашло: ' + (s.raw || s.prefix));
const scriptHits = A.pageColors.reduce((n, r) => n + r.script, 0), svgHits = A.pageColors.reduce((n, r) => n + r.svg, 0);
noteKeep('сценарии и данные страниц (скрипты), образцы SVG — не CSS', 'скрипты', 0);
pageKeep.get('сценарии и данные страниц (скрипты), образцы SVG — не CSS').hits = scriptHits + svgHits;
pageKeep.get('сценарии и данные страниц (скрипты), образцы SVG — не CSS').files = new Set(A.pageColors.filter((r) => r.script + r.svg).map((r) => base(r.file)));
// конфликт: один селектор и свойство с разными значениями на разных страницах
const blockList = [...blockRules.values()].map((b) => ({ selector: b.selector, prop: b.prop, from: b.from, value: valueOf({ from: b.from, lit: b.lit, comp: new Map(), sem: new Map(), full: null }), pages: b.files.size, why: b.why }));
const bySelProp = new Map();
for (const b of blockList) { const k = b.selector + '|' + b.prop; bySelProp.set(k, [...(bySelProp.get(k) || []), b]); }
const PAGE_BLOCK = [];
for (const [, bs] of bySelProp) {
  bs.sort((a, b) => b.pages - a.pages || a.from.localeCompare(b.from));
  PAGE_BLOCK.push(bs[0]);
  for (const x of bs.slice(1)) noteKeep('у селектора на разных страницах разные значения — правило одно, по самому частому', x.selector + ' (' + x.pages + ' стр.)', 0);
}
PAGE_BLOCK.sort((a, b) => a.selector.localeCompare(b.selector) || a.prop.localeCompare(b.prop));
const PAGE_STYLE = styleRules.map((s) => ({ match: [...s.raws].sort(), prop: s.prop, value: 'var(' + s.role + ')', hits: s.hits, pages: s.files.size, why: s.why || '' }));

/* ---------- неиспользованные решения и роли ---------- */
for (const a of AT) if (!used.has(a)) fail.push('решение AT ничего не нашло: ' + a.file + ' ' + (a.old || '') + ' ' + (a.sel || ''));
for (const [k, d] of Object.entries(COMP)) if (!used.has(d)) fail.push('решение COMP ничего не нашло: ' + k);
for (const n of NO_TOKEN) if (!used.has(n)) fail.push('решение NO_TOKEN ничего не нашло: ' + (n.file || '*') + ' ' + (n.sel || '') + ' ' + (n.v || ''));
for (const n of JS_KEEP) if (!used.has(n)) fail.push('решение JS_KEEP ничего не нашло: ' + n.file);
for (const b of BLOCK_RULES) if (!used.has(b)) fail.push('решение BLOCK_RULES ничего не нашло: ' + b.sel + ' ' + b.v);

const roleUse = new Map(R.map((r) => [r.name, { main: [], rules: 0, pages: 0 }]));
for (const [o, r] of Object.entries(MAIN)) roleUse.get(r)?.main.push(o);
const rolesInValue = (v) => [...v.matchAll(/var\((--color-[\w-]+)/g)].map((m) => m[1]);
for (const r of RULES) for (const x of new Set(rolesInValue(r.value))) if (roleUse.has(x)) roleUse.get(x).rules++;
for (const r of [...PAGE_STYLE, ...PAGE_BLOCK]) for (const x of new Set(rolesInValue(r.value))) if (roleUse.has(x)) roleUse.get(x).pages++;
for (const [n, u] of roleUse) if (!u.main.length && !u.rules && !u.pages) fail.push('роль без источника: ' + n);

if (fail.length) {
  console.error('role-map: ОТКАЗ — ' + fail.length);
  for (const f of fail) console.error('  ' + f);
  process.exit(1);
}

/* ============================================================
   Themes.tokens.js
   ============================================================ */
const elevation = A.elevation.map((e) => {
  const m = e.value.match(/rgba?\([^)]*\)/i);
  const value = m ? e.value.replace(m[0], 'color-mix(in srgb, var(--color-shadow) ' + pct(alphaOf(m[0])) + ', transparent)') : e.value;
  return { name: e.name, from: e.value, value };
});
const J = (x) => JSON.stringify(x);
const js = [];
js.push('/* ============================================================',
  '   Themes.tokens.js — источник тем ДС (RE0005). v1, Э2 (' + TODAY + '):',
  '   словарь ролей --color-*, карта 119 старых имён, точечные правила, правила',
  '   страниц ДС, «не перекрашивается». Значений цвета ещё нет — Э4–Э6.',
  '',
  '   v1 собран docs/misc/RE0005-themes/role-map.mjs по решениям этапа; с Э3',
  '   файл переезжает в foundations/Themes/ и правится руками. Формат — как у',
  '   icons-data.js: Node читает через vm, страница — тегом <script>.',
  '',
  '   rules — место компонента или оболочки документации: file (от корня ДС),',
  '   selector и prop — как в файле, from — исходное значение (генератор',
  '   сверяет его с файлом), value — значение в новых темах. Одинаково для',
  '   всех новых тем: значения ролей у каждой темы свои.',
  '   pages — только страницы ДС: style — по значению атрибута style',
  '   ([style*="…"], !important), block — по селектору блока <style>.',
  '   ============================================================ */',
  'window.DS_THEMES = {',
  '  version: 1,',
  '  legacy: "legacy",',
  '  themes: ' + J(['ibp-light', 'ibp-dark', 'service']) + ',',
  '  ramps: {',
  '    steps: ' + J(STEPS) + ',',
  '    tones: ' + J(RAMP_TONES) + ',',
  '    note: ' + J('--ramp-<тон>-<шаг>; accent строится из изумрудного семени (Ф2 меняет семя), neutral — сине-серая, grey — чисто серая (C = 0); остальные тона — по именам legacy. A-шаги не переносятся.'),
  '  },',
  '  roles: {');
for (const r of R) js.push('    ' + J(r.name) + ': ' + J({ group: r.group, desc: r.desc }) + ',');
js.push('  },', '  map: {');
for (const t of A.sem) js.push('    ' + J(t.name) + ': ' + J(MAIN[t.name]) + ',');
js.push('  },', '  elevation: [');
for (const e of elevation) js.push('    ' + J(e) + ',');
js.push('  ],', '  rules: [');
for (const r of RULES) js.push('    ' + J(r) + ',');
js.push('  ],', '  pages: {', '    style: [');
for (const r of PAGE_STYLE) js.push('      ' + J(r) + ',');
js.push('    ],', '    block: [');
for (const r of PAGE_BLOCK) js.push('      ' + J(r) + ',');
js.push('    ],', '  },', '  keep: [');
const keepGrouped = new Map();
for (const k of keep) { const kk = k.scope + '|' + k.why; if (!keepGrouped.has(kk)) keepGrouped.set(kk, { scope: k.scope, why: k.why, where: [] }); keepGrouped.get(kk).where.push(k.where + ' ' + k.v); }
for (const k of keepGrouped.values()) js.push('    ' + J(k) + ',');
for (const [why, k] of pageKeep) js.push('    ' + J({ scope: 'страницы ДС', why, hits: k.hits, files: [...k.files].sort() }) + ',');
js.push('  ],', '};', '');
writeFileSync(OUT_JS, js.join('\n'), 'utf8');

/* ============================================================
   map.md
   ============================================================ */
const code = (s) => '`' + String(s).replace(/\|/g, '\\|') + '`';
const md = [];
const out = (...l) => md.push(...l);
const kindCount = (k) => RULES.filter((r) => r.kind.includes(k)).length;
const pageStyleHits = PAGE_STYLE.reduce((n, r) => n + r.hits, 0);
const pageKeepHits = [...pageKeep.values()].reduce((n, k) => n + k.hits, 0);
const groups = [...new Set(R.map((r) => r.group))];

out('# RE0005 · Э2 — словарь ролей и карта «старое → новое»', '',
  '> Генерат `docs/misc/RE0005-themes/role-map.mjs`, руками не править: решения правятся в таблицах скрипта.',
  '> Перезапуск из корня проекта: `node docs/misc/RE0005-themes/role-map.mjs`. Он же пишет `Themes.tokens.js` v1.',
  '> Места — из замера Э1 (`audit.md`, `palette-audit.mjs`). Значений цвета здесь нет: их дают темы на Э4–Э6.', '');

out('## 1. Сводка', '',
  '| Что | Сколько |', '|---|---|',
  '| Ролей в словаре | ' + R.length + ' в ' + groups.length + ' группах |',
  '| Старых имён в карте | ' + Object.keys(MAIN).length + ' из ' + A.sem.length + ' |',
  '| Ролей, на которые смотрит несколько старых имён (N → 1) | ' + [...roleUse.values()].filter((u) => u.main.length > 1).length + ' |',
  '| Ролей только из правил (старого имени нет) | ' + [...roleUse.values()].filter((u) => !u.main.length).length + ' |',
  '| Точечных правил (объявлений CSS) | ' + RULES.length + ': старое имя в другой роли ' + kindCount('роль') + ', токен компонента ' + kindCount('токен компонента') + ', мимо токена ' + kindCount('мимо токена') + ' |',
  '| Правил страниц ДС | по значению `style` ' + PAGE_STYLE.length + ' (' + pageStyleHits + ' мест), по селектору блока ' + PAGE_BLOCK.length + ' |',
  '| Фолбэки токенов в `style` страниц — перекрасятся сами | ' + fallbackHits + ' мест |',
  '| Не перекрашивается до переезда | CSS и JS ДС ' + keep.length + ' мест; страницы ДС ' + pageKeepHits + ' мест |',
  '| Тени `--elevation-*` | ' + elevation.length + ' — цвет через `--color-shadow`, непрозрачность прежняя |', '');

out('## 2. Как читать карту', '',
  '- **Основная роль** — значение старого имени в новой теме. Её получают все места, где правила нет: экраны и виджеты `apps/`, хаб, протопанель, страницы ДС.',
  '- **Точечное правило** — место компонента, где старое имя работает в другой роли. Правило тем одно на все новые темы: в `[data-theme]` объявление получает значение из `value`. CSS компонента не меняется.',
  '- **Группа класса**: fg — текст и иконка; border — граница; fill — заливка (фон); focus — граница и тень в состоянии фокуса; shadow — тень. Решение пользователя 02.10.2026: fg, граница, заливка и фокус — отдельные роли; статусы `--st-*` делятся только по уровню.',
  '- **Граница парная**: рядом с заливкой того же имени — роль заливки, рядом с текстом — роль текста. **Глифы** (дуги спиннера, шевроны и точки из границ и фонов) остаются в роли своего имени.',
  '- **Токен компонента** (`--btn-pale`, `--menu-item-hover`) получает правило в месте определения; если места его применения расходятся по ролям — ещё и в месте применения.', '');

out('## 3. Спорные строки — согласовано с пользователем ' + TODAY, '');
FLAGS.forEach((f, i) => out((i + 1) + '. ' + f + ' — **принято**.'));
out('');

out('## 4. Словарь ролей', '');
for (const g of groups) {
  out('### ' + g, '', '| Роль | Назначение | Старые имена (основная роль) | Правил |', '|---|---|---|---|');
  for (const r of R.filter((x) => x.group === g)) {
    const u = roleUse.get(r.name);
    out('| ' + code(r.name) + ' | ' + r.desc + ' | ' + (u.main.length ? u.main.map(code).join(', ') : '—') + ' | ' + (u.rules + u.pages || '—') + ' |');
  }
  out('');
}

out('## 5. Карта 119 старых имён', '',
  'Группы — как в `Palette.css`. «apps/» — ссылок в приложениях: им правил нет, они получают основную роль.', '',
  '| Группа | Старое имя | Legacy | Основная роль | apps/ | Мест в другой роли |', '|---|---|---|---|---|---|');
const otherRole = new Map();
for (const d of decisions.values()) if (d.role !== MAIN[d.S]) otherRole.set(d.S, (otherRole.get(d.S) || 0) + d.n);
for (const t of A.sem) {
  out('| ' + t.section + ' · ' + t.group + ' | ' + code(t.name) + ' | ' + A.fmtColor(t.color) + ' | ' + code(MAIN[t.name]) + ' | ' + (A.cnt('apps', t.name) || '—') + ' | ' + (otherRole.get(t.name) || '—') + ' |');
}
out('');

out('## 6. Решения «имя × группа → роль»', '',
  'Прямые места CSS ДС (без токенов компонентов), где роль отличается от основной. Примеры — до трёх.', '',
  '| Старое имя | Группа | Роль | Мест | Примеры |', '|---|---|---|---|---|');
for (const d of [...decisions.values()].filter((x) => x.role !== MAIN[x.S]).sort((a, b) => a.S.localeCompare(b.S) || b.n - a.n)) {
  out('| ' + code(d.S) + ' | ' + d.g + ' | ' + code(d.role) + ' | ' + d.n + ' | ' + d.ex.join('; ') + ' |');
}
out('');

out('## 7. Токены компонентов', '', '| Токен | Определение | Роль | Почему |', '|---|---|---|---|');
for (const c of compReport.sort((a, b) => a.C.localeCompare(b.C))) {
  const role0 = c.dec ? (c.dec.keep ? 'основная' : code(c.dec.def) + (c.dec.full ? ' (значение целиком)' : '') + (c.note ? ', ' + c.note : '')) : c.note;
  out('| ' + code(c.C) + ' | ' + c.defs.map((d) => base(d.file) + ':' + d.line).join(', ') + ' | ' + role0 + ' | ' + (c.dec ? c.dec.why : '') + ' |');
}
out('');

out('## 8. Места без токена и правила по файлам', '',
  'Все точечные правила: `from` — как в файле, `value` — в новых темах.', '');
let lastFile = '';
for (const r of RULES) {
  if (r.file !== lastFile) { out('', '**' + r.file + '**', '', '| Строка | Селектор | Свойство | Было | Стало | Вид |', '|---|---|---|---|---|---|'); lastFile = r.file; }
  out('| ' + r.line + ' | ' + code(r.selector.slice(0, 70)) + ' | ' + r.prop + ' | ' + code(r.from) + ' | ' + code(r.value) + ' | ' + r.kind + ' |');
}
out('');

out('## 9. Страницы ДС', '', '### Правила по значению атрибута `style`', '',
  '| Значение | Свойство → роль | Мест | Страниц |', '|---|---|---|---|');
for (const s of PAGE_STYLE) out('| ' + s.match.map(code).join(', ') + ' | ' + s.prop + ' → ' + code(s.value) + ' | ' + s.hits + ' | ' + s.pages + ' |');
out('', '### Правила по селектору блока `<style>`', '', '| Селектор | Свойство | Было | Стало | Страниц |', '|---|---|---|---|---|');
for (const b of PAGE_BLOCK) out('| ' + code(b.selector) + ' | ' + b.prop + ' | ' + code(b.from) + ' | ' + code(b.value) + ' | ' + b.pages + ' |');
out('', '### Не перекрашивается', '', '| Причина | Мест | Файлы |', '|---|---|---|');
for (const [why, k] of pageKeep) out('| ' + why + ' | ' + k.hits + ' | ' + [...k.files].sort().slice(0, 8).join(', ') + (k.files.size > 8 ? ' и ещё ' + (k.files.size - 8) : '') + ' |');
out('');

out('## 10. Не перекрашивается в CSS и JS ДС', '', '| Где | Причина | Мест |', '|---|---|---|');
for (const k of keepGrouped.values()) out('| ' + k.scope + ' | ' + k.why + ' | ' + k.where.length + ' |');
out('');

out('## 11. Тени', '', '| Токен | Legacy | В новых темах |', '|---|---|---|');
for (const e of elevation) out('| ' + code(e.name) + ' | ' + code(e.from) + ' | ' + code(e.value) + ' |');
out('');

out('## 12. Рампы новых тем', '',
  'Имя — `--ramp-<тон>-<шаг>`, шаги ' + STEPS.join(', ') + '. Тона (' + RAMP_TONES.length + '): ' + RAMP_TONES.map(code).join(', ') + '.',
  '`accent` — из изумрудного семени (решение пользователя 02.10.2026: имя роли, а не тона — кастомный акцент меняет семя);',
  '`neutral` — сине-серая, `grey` — чисто серая (C = 0) вместо swamp, cgrey, mgrey (решение пользователя 02.10.2026);',
  'остальные — все тона legacy, в том числе без применения (решение Э1). A-шаги не переносятся.', '');
if (warn.length) { out('## Предупреждения сборщика', ''); for (const w of warn) out('- ' + w); out(''); }
writeFileSync(OUT_MD, md.join('\n'), 'utf8');

/* ---------- сводка в консоль ---------- */
console.log('role-map: ' + slash(path.relative(A.P.root, OUT_JS)) + ', ' + slash(path.relative(A.P.root, OUT_MD)));
console.log('  ролей ' + R.length + ' · карта ' + Object.keys(MAIN).length + '/' + A.sem.length + ' · правил ' + RULES.length +
  ' (роль ' + kindCount('роль') + ', токен компонента ' + kindCount('токен компонента') + ', мимо токена ' + kindCount('мимо токена') + ')');
console.log('  страницы: style ' + PAGE_STYLE.length + ' (' + pageStyleHits + ' мест) · блоки ' + PAGE_BLOCK.length + ' · фолбэки ' + fallbackHits + ' · keep ' + pageKeepHits);
console.log('  keep CSS/JS ' + keep.length + ' · спорных строк согласовано ' + FLAGS.length + ' · предупреждений ' + warn.length + ' · неразрешённых 0');
for (const w of warn) console.log('  ! ' + w);

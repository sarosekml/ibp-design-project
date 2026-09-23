/* =========================================================================
   Команда сделки — демо-данные прототипа (window.MOCK_DEAL_TEAMS).

   Обычный <script>, а не JSON: страницы открываются по file://, где fetch не
   работает. Подключается до экранного скрипта:
   <script src="../data/deal-teams.js"></script>.

   Имена типов и полей — в стиле API фронтенда, по-английски: типы в
   PascalCase с суффиксом Rs/Rq + Dto (DealTeamMemberRsDto — ответ,
   DealTeamMemberRqDto — запрос), поля в camelCase, доменные сокращения как
   есть (partyId, gosbName, terBankName). Перечисления передаются кодами
   (UPPER_SNAKE), подписи для интерфейса — отдельной картой. Суммы — числа,
   валюта — код ISO 4217 (RUB), даты — ISO-строки (2026-09-24), форматируются
   при выводе.

   Источник имён — одно из двух, строкой у каждого typedef:
     Source: DTO <Имя> (refs/dto/<файл>) — взято из контракта бэкенда;
     Source: invented (ДД.ММ.ГГГГ) — названо в стиле проекта, пока DTO нет;
             заменить, когда DTO придёт.
   Описания полей и комментарии — по-русски. Значения правдоподобные и
   детерминированные (без Math.random): экран одинаков при каждом открытии.
   Значения правятся по ходу дизайна фичи — имена и типы при этом держатся.
   ========================================================================= */

/**
 * Участник команды сделки.
 * Source: invented (24.09.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} DealTeamMemberRsDto
 * @property {number} dealId             сделка, в команду которой входит сотрудник
 * @property {string} employeeId         идентификатор сотрудника
 * @property {string} employeeFullName   ФИО так, как его показывает интерфейс
 * @property {DealTeamRoleCode} roleCode роль в сделке
 * @property {boolean} isMain            главный ответственный по роли
 */

/**
 * Роль сотрудника в сделке.
 * Source: invented (24.09.2026).
 * @typedef {'DIRECTOR'|'MANAGER'|'OPS_OFFICER'|'CREDIT_INSPECTOR'} DealTeamRoleCode
 */

/** @type {DealTeamMemberRsDto[]} */
window.MOCK_DEAL_TEAMS = [
  { dealId: 1024, employeeId: 'E-0001', employeeFullName: 'Иванов Иван Иванович', roleCode: 'DIRECTOR', isMain: true },
  { dealId: 1024, employeeId: 'E-0002', employeeFullName: 'Павлов Павел Павлович', roleCode: 'MANAGER', isMain: true },
  { dealId: 1024, employeeId: 'E-0003', employeeFullName: 'Комаров Кирилл Константинович', roleCode: 'OPS_OFFICER', isMain: false }
];

/** Подписи кодов DealTeamRoleCode для интерфейса. @type {Record<DealTeamRoleCode, string>} */
window.DEAL_TEAM_ROLE_LABELS = {
  DIRECTOR: 'Директор',
  MANAGER: 'Менеджер',
  OPS_OFFICER: 'Сотрудник ЦУП',
  CREDIT_INSPECTOR: 'Кредитный инспектор'
};

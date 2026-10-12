/* =========================================================================
   employees.js — сотрудники демо-данных концепта ibp-redesign-v1.

   Демо-пользователь прототипа — Ким А. С., Аналитик ДИД, деск
   «SMB Природные ресурсы +6» (тот же персонаж, что в new-dashboard-mvp;
   допущение агента из ТЗ MS0014 §3). ФИО придуманные (Source: invented
   (10.10.2026)), реальные сотрудники системы не используются.
   ========================================================================= */

/**
 * Сотрудник.
 * Source: invented (10.10.2026).
 * @typedef {Object} EmployeeRsDto
 * @property {string} id               табельный номер
 * @property {string} fullName         ФИО как в интерфейсе
 * @property {string} initials         инициалы для аватара
 * @property {string} position         должность
 * @property {string} roleCode         роль в командах (ANALYST | DIRECTOR | VP | REGIONAL_DIRECTOR | KM)
 */

/**
 * Роль сотрудника в команде сделки/потенциала/клиента.
 * Source: invented (10.10.2026) — состав ролей из ТЗ MS0014 §4.3, §4.6, §4.8.
 * @typedef {'ANALYST'|'DIRECTOR'|'VP'|'REGIONAL_DIRECTOR'|'KM'} EmployeeRoleCode
 */

/** Подписи ролей. @type {Record<EmployeeRoleCode, string>} */
window.EMPLOYEE_ROLE_LABELS = { ANALYST: 'Аналитик', DIRECTOR: 'Директор', VP: 'VP', REGIONAL_DIRECTOR: 'Региональный директор', KM: 'Клиентский менеджер' };

/** @type {EmployeeRsDto[]} */
window.MOCK_EMPLOYEES = [
  { id: '04127', fullName: 'Ким Александр Сергеевич', initials: 'КА', position: 'Аналитик ДИД', roleCode: 'ANALYST' },
  { id: '03882', fullName: 'Лебедев Олег Николаевич', initials: 'ЛО', position: 'Аналитик ДИД', roleCode: 'ANALYST' },
  { id: '05204', fullName: 'Ежова Дарья Андреевна', initials: 'ЕД', position: 'Аналитик ДИД', roleCode: 'ANALYST' },
  { id: '02940', fullName: 'Соколов Дмитрий Викторович', initials: 'СД', position: 'Директор', roleCode: 'DIRECTOR' },
  { id: '02941', fullName: 'Юсупова Лейла Тимерьяновна', initials: 'ЮЛ', position: 'Директор', roleCode: 'DIRECTOR' },
  { id: '01855', fullName: 'Ветрова Марина Игоревна', initials: 'ВМ', position: 'Vice President', roleCode: 'VP' },
  { id: '01203', fullName: 'Гурьев Аркадий Петрович', initials: 'ГА', position: 'Региональный директор', roleCode: 'REGIONAL_DIRECTOR' },
  { id: '04630', fullName: 'Панова Елена Юрьевна', initials: 'ПЕ', position: 'Клиентский менеджер', roleCode: 'KM' },
  { id: '04711', fullName: 'Шотов Руслан Маратович', initials: 'ШР', position: 'Клиентский менеджер', roleCode: 'KM' }
];

/** Демо-пользователь прототипа. @type {EmployeeRsDto} */
window.MOCK_CURRENT_USER = window.MOCK_EMPLOYEES[0];

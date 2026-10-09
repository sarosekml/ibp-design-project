/* =========================================================================
   Сотрудники для выгрузки расчета FV — демо-данные (window.MOCK_FV_EMPLOYEES).

   Обычный <script> (file://). Подключается на странице расчета:
   <script src="../data/fv-employees.js"></script>.
   Справочник для автокомплита «Сотрудник» в окне «Выгрузка расчета».
   Значения — рыба, имена и типы держатся.
   ========================================================================= */

/**
 * Сотрудник, которому будет доступен зашифрованный файл.
 * Source: invented (08.10.2026).
 * @typedef {Object} FvEmployeeRsDto
 * @property {string} employeeId      идентификатор сотрудника
 * @property {string} fullName        ФИО
 * @property {string} positionName    должность
 * @property {string} externalEmail   почта во внешнем домене (Сигма)
 * @property {string} internalEmail   почта во внутреннем домене (Альфа / Омега)
 */

/** @type {FvEmployeeRsDto[]} */
window.MOCK_FV_EMPLOYEES = [
  { employeeId: 'E-101', fullName: 'Иванов Михаил Александрович', positionName: 'Аналитик', externalEmail: 'IvanovMA@sberbank.ru', internalEmail: 'IvanovMA@omega.sberbank.ru' },
  { employeeId: 'E-102', fullName: 'Петрова Анна Викторовна', positionName: 'Ведущий аналитик', externalEmail: 'PetrovaAV@sberbank.ru', internalEmail: 'PetrovaAV@omega.sberbank.ru' },
  { employeeId: 'E-103', fullName: 'Сидоров Дмитрий Олегович', positionName: 'Риск-менеджер', externalEmail: 'SidorovDO@sberbank.ru', internalEmail: 'SidorovDO@omega.sberbank.ru' },
  { employeeId: 'E-104', fullName: 'Кузнецова Елена Павловна', positionName: 'Финансист', externalEmail: 'KuznetsovaEP@sberbank.ru', internalEmail: 'KuznetsovaEP@omega.sberbank.ru' },
  { employeeId: 'E-105', fullName: 'Смирнов Алексей Игоревич', positionName: 'Руководитель направления', externalEmail: 'SmirnovAI@sberbank.ru', internalEmail: 'SmirnovAI@omega.sberbank.ru' },
  { employeeId: 'E-106', fullName: 'Орлова Татьяна Сергеевна', positionName: 'Аналитик', externalEmail: 'OrlovaTS@sberbank.ru', internalEmail: 'OrlovaTS@omega.sberbank.ru' }
];

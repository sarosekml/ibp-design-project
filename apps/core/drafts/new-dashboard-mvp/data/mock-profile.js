/* =========================================================================
   Профиль сотрудника на главной — демо-данные прототипа (window.MOCK_EMPLOYEE_PROFILE).

   Обычный <script>, а не JSON: страницы открываются по file://, где fetch не
   работает. Подключается до скриптов виджетов:
   <script src="../data/mock-profile.js"></script>.

   Имена — в стиле API фронтенда; DTO нет, поэтому Source: invented. Значения —
   «рыба» прототипа: фото — refs/profile-photo.jpg, имя подобрано под фото.
   Адрес фото считается от этого файла, а не от страницы: файл подключают и
   страница концепта, и витрина локальных компонентов из другой папки.
   ========================================================================= */

/**
 * Профиль сотрудника, который открыл главную.
 * Source: invented (09.10.2026) — заменить на DTO, когда он появится.
 * @typedef {Object} EmployeeProfileRsDto
 * @property {string} employeeId      идентификатор сотрудника
 * @property {string} lastName        фамилия
 * @property {string} firstName       имя
 * @property {string} middleName      отчество
 * @property {string} positionName    должность так, как её показывает интерфейс
 * @property {string} deskName        деск сотрудника
 * @property {string} phone           рабочий телефон
 * @property {string} email           рабочая почта
 * @property {string|null} photoUrl   фото; нет — инициалы
 * @property {boolean} isOnline       сотрудник в сети (точка на аватаре)
 */

/** @type {EmployeeProfileRsDto} */
window.MOCK_EMPLOYEE_PROFILE = {
  employeeId: 'E-1042',
  lastName: 'Ким',
  firstName: 'Анна',
  middleName: 'Сергеевна',
  positionName: 'Аналитик ДИД',
  deskName: 'Металлургия и машиностроение',
  phone: '+7 495 000-10-42',
  email: 'a.kim@example.ru',
  photoUrl: new URL('../refs/profile-photo.jpg', document.currentScript.src).href,
  isOnline: true
};

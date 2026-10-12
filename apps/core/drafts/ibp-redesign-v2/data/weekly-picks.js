/* Подборка — демонстрационная, без числового скоринга.
   Source: invented (12.10.2026). */
(function () {
  'use strict';
  /** @typedef {Object} WeeklyPickRsDto
   * @property {string} week Неделя ISO.
   * @property {number} limit Размер подборки.
   * @property {string} title Подпись периода.
   * Source: invented (12.10.2026). */
  /** @type {WeeklyPickRsDto} */
  window.WEEKLY_PICKS = { week: '2026-W42', limit: 10, title: 'Неделя 42 · 12–18 октября' };
  window.LEAD_PICK_REASONS = function (client, row) {
    var result = [];
    if (client.inQuarterPlan) result.push('Клиент в плане Q4 2026');
    if (client.responsibleAnalystId === '04127') result.push('Клиент в вашей зоне ответственности');
    if (client.didGrowthCompany) result.push('Компания роста ДИД');
    if (client.topClient) result.push('Топ-клиент');
    if ((row.amountMln || 0) >= 3000) result.push('Объём от 3 000 млн RUB');
    if (client.goalsFixed) result.push('Цели клиента зафиксированы');
    return result.slice(0, 4);
  };
})();

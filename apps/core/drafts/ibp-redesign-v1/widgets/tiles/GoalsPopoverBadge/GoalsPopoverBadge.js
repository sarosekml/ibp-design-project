/* GoalsPopoverBadge — чип «Цели зафиксированы».
   render(host, { fixed }) — показать чип, если цели клиента зафиксированы. */
(function () {
  'use strict';

  function render(host, opts) {
    if (!host) return;
    host.hidden = !(opts && opts.fixed);
  }

  window.LcGoalsPopoverBadge = { render: render };
})();

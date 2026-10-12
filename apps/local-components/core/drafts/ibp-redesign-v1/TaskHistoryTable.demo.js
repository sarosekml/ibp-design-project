/* Витрина использует тот же рендер истории, что предпросмотр задачи. */
(function () {
  window.IBPKitDemo.register('TaskHistoryTable', {
    apply: function (host, st, ctx) {
      if (['loading', 'empty', 'error'].indexOf(st.state) >= 0) return;
      var fx = ctx.fixtures || {}, sample = fx[st.state] || fx.data || {};
      var task = window.IBPR && window.IBPR.task(sample.taskId || 169437);
      if (task && window.LcTaskHistoryTable) window.LcTaskHistoryTable.render(host, { task: task });
    }
  });
})();

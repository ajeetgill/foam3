/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.cron',
  name: 'CronScheduleDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Cron scheduledTime is storageTransient, calculate on find and select, and update on put',

  javaImports: [
    'foam.core.script.ScriptStatus',
    'foam.dao.ProxySink',
    'foam.dao.Sink',
    'foam.lang.X',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Cron newCron = (Cron) obj;
        Cron oldCron = (Cron) getDelegate().find_(x, obj);
        if ( newCron.getStatus() == ScriptStatus.UNSCHEDULED ||
             newCron.getStatus() == ScriptStatus.ERROR ||
             ( oldCron != null &&
               ! SafetyUtil.equals(oldCron.getSchedule(), newCron.getSchedule()) ) ) {
          newCron = updateScheduledTime(x, newCron);
        }
        return getDelegate().put_(x, newCron);
      `
    },
    {
      name: 'find_',
      javaCode: `
        Cron cron = (Cron) getDelegate().find_(x, id);
        return updateScheduledTime(x, cron);
      `
    },
    {
      name: 'select_',
      javaCode: `
      Sink delegate = prepareSink(sink);
      getDelegate().select_(x,
        new ProxySink(x, delegate) {
          public void put(Object obj, foam.lang.Detachable sub) {
            getDelegate().put(updateScheduledTime(x, (Cron) obj), sub);
          }
        }, skip, limit, order, predicate);
      return delegate;
      `
    },
    {
      name: 'updateScheduledTime',
      args: 'X x, Cron cron',
      type: 'Cron',
      javaCode: `
        if ( cron != null &&
             cron.getEnabled() &&
             ( cron.getStatus() == ScriptStatus.UNSCHEDULED ||
               cron.getStatus() == ScriptStatus.ERROR ) &&
             cron.getScheduledTime() == null ) {
          if ( cron.isFrozen() ) {
            cron = (Cron) cron.fclone();
          }
          cron.setScheduledTime(cron.getNextScheduledTime(x));
        }
        return cron;
      `
    }
  ]
});

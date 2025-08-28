/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.cron',
  name: 'CronScheduler',

  implements: [
    'foam.lang.ContextAgent',
    'foam.core.auth.EnabledAware',
    'foam.core.COREService'
  ],

  documentation: ``,

  javaImports: [
    'foam.core.COREService',
    'foam.core.auth.EnabledAware',
    'foam.core.cron.SimpleIntervalSchedule',
    'foam.core.er.EventRecord',
    'foam.core.logger.Logger',
    'foam.core.logger.Loggers',
    'foam.core.script.ScriptStatus',
    'foam.dao.AbstractDAO',
    'foam.dao.AbstractSink',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.MapDAO',
    'foam.dao.Sink',
    'foam.lang.Agency',
    'foam.lang.AgencyTimerTask',
    'foam.lang.ContextAwareSupport',
    'foam.lang.Detachable',
    'foam.lang.FObject',
    'foam.log.LogLevel',
    'foam.mlang.MLang',
    'foam.mlang.sink.Min',
    'foam.mlang.sink.Sequence',
    'java.util.Date',
    'java.util.List',
    'java.util.Timer'
  ],

  properties: [
    {
      name: 'cronDelay',
      class: 'Long',
      value: 5000
    },
    {
      name: 'initialTimerDelay',
      class: 'Long',
      value: 60000
    },
    {
      name: 'schedulableDAO',
      class: 'String',
      value: 'schedulableDAO',
      documentation: `
        move existing schedulables to cronJobDAO
      `
    },
    {
      name: 'cronJobDAO',
      class: 'String',
      value: 'localCronJobDAO'
    },
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    }
  ],

  methods: [
    {
      documentation: 'COREService implementation.',
      name: 'start',
      javaCode: `
      Loggers.logger(getX(), this).info("start");
      Timer timer = new Timer(this.getClass().getSimpleName());
      timer.schedule(
        new AgencyTimerTask(getX(), this),
        getInitialTimerDelay());
      `
    },
    {
      name: 'execute',
      javaCode: `
    final Logger logger = Loggers.logger(x, this);
    try {
      logger.info("initialize", "cronjobs", "start");
      DAO schedulableDAO = (DAO) getX().get(getSchedulableDAO());
      schedulableDAO.where(MLang.EQ(Schedulable.ENABLED, true)).
        select(new Sink() {
          public void put(Object obj, Detachable sub) {
            Schedulable schedulable = (Schedulable) ((FObject) obj).fclone();
            Date from = schedulable.getLastRun();
            if ( from == null ) from = new Date();
            schedulable.setScheduledTime(
              ((SimpleIntervalSchedule) schedulable.getSchedule()).
                calculateNextDate(
                  foam.lang.XLocator.get(),
                  from,
                  true
                )
            );
            ((DAO) x.get(getCronJobDAO())).put(schedulable);
          }
          public void remove(Object obj, Detachable sub) {}
          public void eof() {}
          public void reset(Detachable sub) {}
        });
      logger.info("initialize", "cronjobs", "complete");

      while ( true ) {
        long delay = getCronDelay();
        if ( getEnabled() ) {
          Date now = new Date();
          DAO cronJobDAO = (DAO) x.get(getCronJobDAO());
          cronJobDAO.where(
            MLang.AND(
              MLang.EQ(Cron.STATUS, ScriptStatus.RUNNING),
              MLang.GT(Cron.THREAD_TIMEOUT, 0)
            )
          ).select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
              Cron cron = (Cron) ((FObject) obj).fclone();
              long elapsed = System.currentTimeMillis() - cron.getThreadStartTime();
              if ( elapsed > cron.getThreadTimeout() ) {
                cron.setStatus(ScriptStatus.INTERRUPTED);
                cronJobDAO.put_(x, cron);
              }
            }
          });

          Min min = (Min) MLang.MIN(Cron.SCHEDULED_TIME);
          ArraySink arraySink = new ArraySink();
          cronJobDAO.select_(x,
              new Sequence.Builder(x)
                .setArgs(new Sink[] {
                  min,
                  arraySink
                }).build(),
              0, foam.dao.AbstractDAO.MAX_SAFE_INTEGER,
              null,
              MLang.AND(
                MLang.EQ(Cron.ENABLED, true),
                MLang.IN(Cron.STATUS, new ScriptStatus[] {
                  ScriptStatus.UNSCHEDULED,
                  ScriptStatus.ERROR
                }))
             );
          List<Cron> crons = (List) arraySink.getArray();
          for ( Cron cron : crons ) {
            try {
              if ( cron.getScheduledTime().getTime() > now.getTime() ||
                   ! cron.canRun(x) )
                continue;

              cron = (Cron) cron.fclone();
              cron.setStatus(ScriptStatus.SCHEDULED);
              cronJobDAO.put_(x, cron);
            } catch (Throwable t) {
              ((DAO) x.get("eventRecordDAO")).put(new EventRecord(x, this, "schedule", cron.getId(), LogLevel.ERROR, t));
            }
          }

          // Check for new cronjobs every 5 seconds if no current jobs
          // or if their next scheduled execution time is > 5s away
          // Delay at least a little bit to avoid blocking in case of a script error.
          Date minDate = (Date) min.getValue();
          if( minDate != null &&
              getEnabled() ) {
            delay = Math.abs(minDate.getTime() - System.currentTimeMillis());
            delay = Math.min(getCronDelay(), delay);
            delay = Math.max(500, delay);
          }
        }
        try {
          Thread.sleep(delay);
        } catch ( InterruptedException e ) {
          // noop, do not kill cron scheduler since we now support cron timeout via interrupt
        }
      }
    } catch (Throwable t) {
      ((DAO) x.get("eventRecordDAO")).put(new EventRecord(x, this, "execute", null, LogLevel.ERROR, t));
    }
    `
    }
  ]
});

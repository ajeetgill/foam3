/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'TimeSegmentedJournalDAO',
  extends: 'foam.dao.AbstractDAO',
  implements: [
    'foam.core.COREService',
    'foam.lang.ContextAgent'
  ],

  documentation: `The Time Segmented Journal DAO is a DAO which keeps
data for each day in a separate MDAO and Journal.
see #flowdoc/TimeSegmentedJournalDAO

ISSUES: predicate traversal is redumentary and only min/max is determined.
`,

  javaImports: [
    'foam.core.logger.Logger',
    'foam.core.logger.Loggers',
    'foam.dao.DAO',
    'foam.dao.java.JDAO',
    'foam.lang.ClassInfo',
    'foam.lang.ContextAgent',
    'foam.lang.ContextAgentTimerTask',
    'foam.lang.FObject',
    'foam.lang.PropertyInfo',
    'foam.lang.X',
    'foam.mlang.MLang',
    'foam.mlang.predicate.*',
    'static foam.util.DateUtil.getTimeZoneId',
    'java.io.File',
    'java.time.LocalDate',
    'java.time.LocalDateTime',
    'java.time.temporal.ChronoUnit',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.Collection',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'java.util.Map.Entry',
    'java.util.Timer',
    'java.util.concurrent.ConcurrentHashMap'
  ],

  properties: [
    {
      name: 'of',
      class: 'Class',
      javaInfoType: 'foam.lang.AbstractObjectPropertyInfo',
      javaType: 'foam.lang.ClassInfo',
    },
    {
      documentation: 'Unique filename for this journal. Defaults to model name.',
      name: 'filename',
      class: 'String',
      javaFactory: `
        String s = getOf().getObjClass().getSimpleName();
        return s.substring(0,1).toLowerCase() + s.substring(1);
      `
    },
    {
      documentation: `Optional PropertyInfo of FObject which contains
date for segmentation.  Defaults to 'created'.`,
      name: 'pInfo',
      class: 'FObjectProperty',
      of: 'foam.lang.PropertyInfo',
      javaFactory:`
      return (PropertyInfo) getOf().getAxiomByName("created");
      `
    },
    {
      documentation: `Shift object or system date to this Timezone for segmentation.
When null, no timezone shifting will occur`,
      name: 'timeZone',
      class: 'Reference',
      of: 'foam.time.TimeZone'
    },
    {
      documentation: 'MDAOs not accessed in this time are cleared out',
      name: 'ttl',
      class: 'Long',
      units: 'ms',
      value: 300000 // 5 minutes
    },
    {
      documentation: 'Check LRU cache for idle entries',
      name: 'timerInterval',
      class: 'Long',
      units: 'ms',
      value: 60000 // 1 minute
    },
    {
      documentation: 'LRU cache clearing timer',
      name: 'timer',
      class: 'Object',
      visibility: 'HIDDEN',
      transient: true
    },
    {
      documentation: 'Record daos access times and clear out LRU at TTL.',
      name: 'lrus',
      class: 'Map',
      javaFactory: 'return new ConcurrentHashMap();',
      visibility: 'HIDDEN',
      transient: true
    },
    {
      name: 'daos',
      class: 'Map',
      javaFactory: 'return new ConcurrentHashMap();',
      visibility: 'HIDDEN',
      transient: true
    }
  ],

  javaCode: `
  public TimeSegmentedJournalDAO(X x, ClassInfo of) {
    setX(x);
    setOf(of);
  }
  public TimeSegmentedJournalDAO(X x, ClassInfo of, PropertyInfo pInfo) {
    setX(x);
    setOf(of);
    setPInfo(pInfo);
  }
  public TimeSegmentedJournalDAO(X x, ClassInfo of, PropertyInfo pInfo, String filename) {
    setX(x);
    setOf(of);
    setPInfo(pInfo);
    setFilename(filename);
  }

  // AND, OR
  public List traverse(Nary nary, List list) {
    for ( Predicate p : nary.getArgs() ) {
      traverse(p, list);
    }
    return list;
  }

  // IN (pInfo, [dates])
  public List traverse(ArrayBinary bary, List list) {
    if ( bary.getArg1() == getPInfo() ) {
      Object arg2 = bary.getArg2().f(null);
      if ( arg2 instanceof List ) {
        for ( Object obj : (List) arg2 ) {
          Binary b = (Binary) MLang.EQ(getPInfo(), obj);
          Loggers.logger(getX(), this).info("traverse,add",b);
          list.add(b);
        }
      }
      if ( arg2 instanceof Object[] ) {
        for ( Object obj : (Object[]) arg2 ) {
          Binary b = (Binary) MLang.EQ(getPInfo(), obj);
          Loggers.logger(getX(), this).info("traverse,add",b);
          list.add(b);
        }
      }
    }
    return list;
  }

  // EQ, LT, GT... - will post process these.
  public List traverse(Binary binary, List list) {
    PropertyInfo pInfo = (PropertyInfo) binary.getArg1();
    if ( pInfo == getPInfo() ) {
      Loggers.logger(getX(), this).info("traverse,add", binary);
      list.add(binary);
    }
    return list;
  }

  public List traverse(Object obj, List list) {
    if ( obj instanceof Binary ) {
      return traverse((Binary) obj, list);
    }
    if ( obj instanceof ArrayBinary ) {
      return traverse((ArrayBinary) obj, list);
    }
    if ( obj instanceof Nary ) {
      return traverse((Nary) obj, list);
    }
    Loggers.logger(getX(), this).info("traverse,ignore", obj);
    return list;
  }
  `,

  methods: [
    {
      documentation: `If id is an FObject, then find via data property.
Otherwise attempt to find id in current cache - assuming a select has
just occured and user is finding from a table view.`,
      name: 'find_',
      javaCode: `
      if ( foam.util.SafetyUtil.isEmpty(String.valueOf(id)) )
        return null;

      if ( id instanceof FObject ) {
        FObject obj = (FObject) id;
        if ( ! foam.util.SafetyUtil.isEmpty(String.valueOf(((PropertyInfo) getOf().getAxiomByName("id")).get(obj))) ) {
          try {
            return getDAO(x, getDate(x, (FObject) id)).find_(x, id);
          } catch (Throwable t) {
            Loggers.logger(x, this).error(t.getMessage());
          }
        }
        return null;
      }

      // Attempt to return from current cache
      for ( DAO dao : (Collection<DAO>) getDaos().values() ) {
        FObject found = (FObject) dao.find_(x, id);
        if ( found != null )
          return found;
      }

      return null;
      `
    },
    {
      name: 'put_',
      javaCode: `
      return getDAO(x, getDate(x, (FObject) obj)).put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      return getDAO(x, getDate(x, (FObject) obj)).remove_(x, obj);
      `
    },
    {
      name: 'select_',
      javaCode: `
      Sink prepared    = prepareSink(sink);
      Sink decorated   = decorateSink_(prepared, skip, limit, order, predicate);

      List<LocalDate> dates = (List<LocalDate>) getDates(x, predicate);
      for ( LocalDate d : dates ) {
        DAO dao = getDAO(x, d);
        dao.select_(x, decorated, skip, limit, order, predicate);
      }

      decorated.eof();
      return sink;
      `
    },
    {
      documentation: 'Return LocalDate ',
      name: 'getDate',
      args: 'X x, FObject obj',
      type: 'LocalDate',
      exceptions: ['java.lang.IllegalArgumentException'],
      javaCode: `
      java.util.Date date = (java.util.Date) getPInfo().get(obj);
      if ( date == null )
        throw new IllegalArgumentException("Date null");
      return date.toInstant().atZone(getTimeZoneId(x, getTimeZone())).toLocalDate();
      `
    },
    {
      documentation: '',
      name: 'getDates',
      args: 'X x, Predicate predicate',
      javaType: 'List<LocalDate>',
      javaCode: `
      if ( predicate == null ||
           predicate == MLang.TRUE ) {
        return Arrays.asList(LocalDate.now());
      }
      Predicate pred = predicate.partialEval();
      List<Binary> list = (List<Binary>) traverse(pred, new ArrayList());
      List<LocalDate> dates = new ArrayList();
      LocalDate min = null;
      LocalDate max = null;
      for ( Binary b : list ) {
        Object arg2 = b.getArg2().f(null);
        if ( arg2 instanceof java.util.Date ) {
          java.util.Date date = (java.util.Date) arg2;
          LocalDate local = date.toInstant().atZone(getTimeZoneId(x, getTimeZone())).toLocalDate();
          if ( b instanceof Eq ||
               b instanceof Gt ) {
            if ( min == null ) {
              min = local;
            }
          }
          if ( b instanceof Eq ||
               b instanceof Lt ) {
            if ( max == null ) {
              max = local;
            }
          }
          if ( b instanceof Eq ) {
            dates.add(local);
          }
        } else {
          Loggers.logger(x, this).warning("Binary arg2 not Date", arg2);
        }
      }
      // TODO: configuration or don't support
      if ( min != null && max == null ) {
        max = min.plusMonths(1);
      }
      if ( min == null && max != null ) {
        min = max.plusMonths(-1);
      }
      if ( min != null && max != null ) {
        long days = ChronoUnit.DAYS.between(min, max);
        if ( days > 0 ) {
          dates = new ArrayList();
          dates.add(min);
          dates.add(max);
          LocalDate next = min;
          for ( var i = 0; i < days; i++ ) {
            next = next.plusDays(1);
            dates.add(next);
          }
        }
      }
      return dates;
      `
    },
    {
      name: 'getDAO',
      args: 'X x, LocalDate date',
      type: 'DAO',
      javaCode: `
      DAO dao = (DAO) getDaos().get(date);
      if ( dao != null )
        return dao;

      // TODO: improve lock granularity - perhaps directory path
      synchronized ( this ) {
        dao = (DAO) getDaos().get(date);
        if ( dao != null ) {
          getLrus().put(date, LocalDateTime.now());
          return dao;
        }
        JDAO jdao = new JDAO(x);
        jdao.setRuntimeOnly(true); // ignore .0 journals
        jdao.setFilename(getDirectory(x, date).toString());
        jdao.setOf(getOf());

        MDAO mdao = new MDAO(getOf());
        mdao.addIndex(getPInfo());

        // NOTE: set delegate last as it triggers replay
        jdao.setDelegate(mdao);

        getDaos().put(date, jdao);
        getLrus().put(date, LocalDateTime.now());
        return jdao;
      }
      `
    },
    {
      name: 'getDirectory',
      args: 'X x, LocalDate date',
      javaType: 'StringBuilder',
      javaCode: `
        StringBuilder directory = new StringBuilder();
        directory.append(String.valueOf(date.getYear()));
        directory.append(File.separator);
        directory.append(String.valueOf(date.getMonthValue()));
        directory.append(File.separator);
        directory.append(String.valueOf(date.getDayOfMonth()));
        directory.append(File.separator);
        directory.append(getFilename());
        return directory;
      `
    },
    {
      // COREService
      name: 'start',
      javaCode: `
      Loggers.logger(getX(), this).info("start");
      Timer timer = new Timer(this.getClass().getSimpleName(), true);
      setTimer(timer);
      timer.schedule(
        new ContextAgentTimerTask(getX(), this),
        getTimerInterval(),
        getTtl());
      `
    },
    {
      // COREService
      name: 'stop',
      javaCode: `
      Timer timer = (Timer) getTimer();
      if ( timer != null )
        timer.cancel();
      `
    },
    {
      // ContextAgent
      name: 'execute',
      javaCode: `
      LocalDateTime now = LocalDateTime.now();
      for ( Entry<LocalDate, LocalDate> entry : ((Map<LocalDate, LocalDate>) getLrus()).entrySet() ) {
        if ( ChronoUnit.MILLIS.between(entry.getValue(), now) > getTtl() ) {
          synchronized ( this ) {
            Loggers.logger(getX(), this).info("execute,clearing",entry.getKey());
            getDaos().remove(entry.getKey());
            getLrus().remove(entry.getKey());
          }
        }
      }
      `
    }
  ]
});

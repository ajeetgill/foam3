/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.strategy',
  name: 'BasicStrategizer',

  documentation: 'A basic implementation of the StrategizerService interface.',

  implements: [
    'foam.strategy.StrategizerService'
  ],

  imports: [
    'DAO strategyDAO'
  ],

  javaImports: [
    'foam.core.Detachable',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.ProxySink',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.AuthService',
    'foam.util.SafetyUtil',
    'java.util.List'
  ],

  methods: [
    {
      name: 'query',
      javaCode: `
        if ( SafetyUtil.isEmpty(desiredModelId) ) {
          throw new RuntimeException("A desired model id must be specified.");
        }

        Predicate predicate = SafetyUtil.isEmpty(target)
          ? AND(
              EQ(StrategyReference.DESIRED_MODEL_ID, desiredModelId),
              EQ(StrategyReference.TARGET, "")
            )
          : AND(
              EQ(StrategyReference.DESIRED_MODEL_ID, desiredModelId),
              OR(
                EQ(StrategyReference.TARGET, ""),
                EQ(StrategyReference.TARGET, target)
              )
            );

        if ( strategyPredicate != null  ) {
          predicate = (Predicate) strategyPredicate;
        }

        AuthService auth = (AuthService) x.get("auth");
        ArraySink delegate = new ArraySink();
        ((DAO) getStrategyDAO()).inX(x)
          .where(predicate)
          .select(
            new ProxySink(x, delegate) {
              public void put(Object obj, Detachable sub) {
                if ( auth.check(x, "strategyreference.read."+((StrategyReference) obj).getId()) ) {
                  getDelegate().put(obj, sub);
                }
              }
              public void remove(Object obj, Detachable sub) {}
              public void eof() {}
              public void reset(Detachable sub) {}
            }
          );
        List refs = delegate.getArray();
        return (StrategyReference[]) refs.toArray(new StrategyReference[refs.size()]);
      `
    }
  ]
});

/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.session',
  name: 'PersistentSessionDAO',
  extends: 'foam.dao.ProxyDAO',
  implements: [
    'foam.core.COREService'
  ],

  documentation: `The key to 'persistent' sessions is the userId on the
session. If a user makes a client call with an existing session id and
a matching user id, then the system considers the user logged in.
Sessions are NOT-frozen, for reasons discussed elsewhere.  The
implication is updates are not persisted to the runtime journal because
there is never a delta.
This DAO maintains it's own copy of the session to calculate the delta
and then makes an explicit journal put call to store the session with
the user id.

Additionally, anonymous also adds a complication.  When a user is logged
out, the client will present anonymous views and the anonymous user
uses the same session id as it is the same client connection. This DAO
also ensures the session is not saved with the anonymous user id.

Background
Every single client operation interacts with a session object.
On each operation the session properties 'uses' and 'lastUsed' are updated.
To reduce Java object garbage, caused by cloning on put, and, if my memory
serves, to deal with threading concerns during simultaneous client operations,
the session is not-frozen.

Other possible solutions
* Revert to frozen - clone and put as normal. Move uses and lastUsed to
another non-frozen model.
* Create a generic persistence model that listens for update and outputs
accordingly.
`,

  javaImports: [
    'foam.core.auth.AuthService',
    'foam.core.auth.ServiceProvider',
    'foam.core.logger.Logger',
    'foam.core.logger.Loggers',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.java.JDAO',
    'foam.dao.Journal',
    'foam.dao.MDAO',
    'foam.dao.NullDAO',
    'foam.dao.ProxyDAO',
    'foam.lang.X',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map'
  ],

  javaCode: `
  public PersistentSessionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }
  `,

  properties: [
    {
      documentation: 'Reference to Session DAO stack mdao to allow explicit put operations that should side-step the journal',
      name: 'mDAO',
      class: 'foam.dao.DAOProperty'
    },
    {
      documentation: 'Reference to Session DAO stack journal to allow explicit put operations',
      name: 'journal',
      class: 'FObjectProperty',
      of: 'foam.dao.Journal'
    },
    {
      documentation: 'Copies of user sessions from which to perform delta against to determine if output to journal should occur.',
      name: 'sessionCache',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    },
    {
      documentation: 'Record anonymous users to avoid irrelevant journal updates with anonymouss user ids.  Also slows replay.',
      name: 'anonymousCache',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    },
    {
      name: 'nullDAO',
      class: 'foam.dao.DAOProperty',
      javaFactory: 'return new NullDAO(getX(), Session.getOwnClassInfo());'
    }
  ],

  methods: [
    {
      documentation: 'Load anonymous users',
      name: 'start',
      javaCode: `
      X x = getX();
      List<ServiceProvider> providers = (List) ((ArraySink) ((DAO) x.get("serviceProviderDAO")).select(new ArraySink())).getArray();
      for ( ServiceProvider sp : providers ) {
        long uid = sp.getAnonymousUser();
        if ( uid != 0 ) {
          getAnonymousCache().put(uid, true);
        }
      }

      foam.core.logger.Logger logger = foam.core.logger.Loggers.logger(x, this, "start");
      DAO dao = (DAO) x.get("localSessionDAO");
      while ( dao instanceof ProxyDAO ) {
        logger.info("dao", dao.getClass().getSimpleName());
        if ( dao instanceof JDAO ) {
          break;
        }
        dao = ((ProxyDAO) dao).getDelegate();
      }
      if ( dao instanceof JDAO ) {
        setMDAO(((JDAO)dao).getDelegate());
        setJournal(((JDAO)dao).getJournal());
      } else {
        throw new RuntimeException("PersistentSessionDAO JDAO not found");
      }
      `
    },
    {
      name: 'put_',
      javaCode: `
        Session nu = (Session) getMDAO().put_(x, obj);
        if ( nu.getUserId() == 0 ||
             getAnonymousCache().containsKey(nu.getUserId()) ) {
          // Avoid irrelevant journals updates that will only slow replay
          return nu;
        }

        nu = (Session) getDelegate().put_(x, obj);

        boolean save = false;
        Session per = (Session) getSessionCache().get(nu.getId());
        if ( per == null ) {
          per = new Session();
          per.copyFrom(nu);
          save = true;
        } else {
           Map diff = per.diff(nu);
           // future - could move these to property for config.
           if ( diff.containsKey(Session.USER_ID.getName()) ||
                diff.containsKey(Session.AGENT_ID.getName()) ||
                diff.containsKey(Session.TTL.getName()) ||
                diff.containsKey(Session.CIDR_WHITE_LIST.getName()) ) {
             per = (Session) per.copyFrom(nu);
             save = true;
           }
        }
        if ( save ) {
          getSessionCache().put(per.getId(), per);
          getJournal().put(x, null, getNullDAO(), per);
        }
        return nu;
      `
    },
    {
      name: 'remove_',
      javaCode: `
      getSessionCache().remove(((Session) obj).getId());
      return getDelegate().remove_(x, obj);
      `
    }
  ]
});

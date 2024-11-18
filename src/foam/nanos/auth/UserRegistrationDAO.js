/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'UserRegistrationDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Final configuration of new user before creation',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'static foam.mlang.MLang.*',
    'foam.nanos.logger.Loggers',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'foam.util.SafetyUtil',
    'java.util.List'
  ],

  messages: [
    { name: 'EMAIL_REQUIRED', message: 'Email required' },
    { name: 'DUPLICATE_USER', message: 'User with the same username already exists' }
  ],

  javaCode: `
    public UserRegistrationDAO(X x, DAO delegate) {
      setX(x);
      setDelegate(delegate);
    }
  `,

  methods: [
    {
      name: 'put_',
      javaCode: `
        User user = register(x, (User) obj);
        return super.put_(getX(), user);
      `
    },
    {
      name: 'register',
      args: 'X x, User user',
      type: 'User',
      javaCode: `
        if ( user == null || SafetyUtil.isEmpty(user.getEmail()) ) {
          throw new RuntimeException(EMAIL_REQUIRED);
        }

        Theme theme = null;
        String spid = null;
        if ( user != null &&
             SafetyUtil.isEmpty(user.getSpid()) ) {
          theme = ((Themes) x.get("themes")).findTheme(x);
          if ( theme != null &&
                ! SafetyUtil.isEmpty(theme.getSpid()) ) {
            spid = theme.getSpid();
          } else {
            Loggers.logger(x, this).error("Theme not found");
            throw new RuntimeException("Theme not found for user registration");
          }
        }

        if ( ! SafetyUtil.isEmpty(theme.getRegistrationGroup()) ) {
          user.setGroup(theme.getRegistrationGroup());
        }

        // User duplicate = (User) getDelegate().find_(getX(),
        List users = (List) ((ArraySink) getDelegate()
          .where(
            AND(
              EQ(User.USER_NAME, user.getUserName()),
              EQ(User.LIFECYCLE_STATE, LifecycleState.ACTIVE),
              EQ(User.SPID, user.getSpid())
            ))
           .select(new ArraySink())).getArray();
         // if ( duplicate != null ) {
        if ( users != null && users.size() > 1 ) {
          Loggers.logger(x, this).debug("Duplicate user", user.getUserName());
          throw new RuntimeException(DUPLICATE_USER);
        }

        return user;
      `
    },
    {
      name: 'find_',
      javaCode: `
        return null;
      `
    },
    {
      name: 'select_',
      javaCode: `
        // Return an empty sink instead of null to avoid breaking calling code that
        // expects this method to return a sink.
        return new ArraySink();
      `
    },
    {
      name: 'remove_',
      javaCode: `
        return null;
      `
    },
    {
      name: 'cmd_',
      javaCode: `
        if ( "AUTHORIZER?".equals(obj) ) {
          return getClass().getName();
        }

        return super.cmd_(x, obj);
      `
    }
  ]
});

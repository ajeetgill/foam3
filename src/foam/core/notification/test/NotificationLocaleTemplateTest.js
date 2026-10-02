/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.notification.test',
  name: 'NotificationLocaleTemplateTest',
  extends: 'foam.core.test.Test',

  documentation: 'Test title and body locale template replacement',

  javaImports: [
    'foam.core.auth.User',
    'foam.core.auth.LanguageId',
    'foam.core.notification.Notification',
    'foam.dao.DAO',
    'foam.lang.X',
    'static foam.mlang.MLang.EQ',
    'foam.test.TestUtils',
    'java.util.HashMap',
    'java.util.Map'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
      String name = this.getClass().getSimpleName();
      User user = TestUtils.createTestUser(name);
      user.setUserName(name);
      user.setGroup("test");
      user.setLanguage(new LanguageId("pt", "BR"));
      user = (User) ((DAO) x.get("userDAO")).put_(x, user);
      test ( user.getId() > 0, "user setup");

      DAO notificationDAO = (DAO) x.get("notificationDAO");
      notificationDAO.removeAll();

      Notification notification = new Notification();
      notification.setUserId(user.getId());
      notification.setLocaleTemplateName(name+"-pt");
      Map map = new HashMap<String, String>();
      map.put("arg1", name);
      map.put("arg2", name);
      map.put("toastMessage", name);
      notification.setLocaleTemplateArgs(map);
      ((DAO) x.get("notificationDAO")).put_(x, notification);

      try {
        Thread.sleep(100L);
      } catch (InterruptedException e ) {
        // ignore - nop
      }

      notification = (Notification) notificationDAO.find(EQ(Notification.USER_ID, user.getId()));
      test ( notification != null, "Notification found");
      if ( notification != null ) {
        test ( notification.getBody() != null &&
               notification.getBody().equals("Body "+name+"\\\\nline2 "+name),
               "Body set: "+notification.getBody());
        test ( notification.getToastMessage() != null &&
               notification.getToastMessage().equals("ToastMessage "+name),
               "ToastMessage set: "+notification.getToastMessage());
      }
      `
    }
  ]
});

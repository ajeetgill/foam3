/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pii',
  name: 'PreventDuplicatePIIRequestsDAO',
  extends: 'foam.dao.ProxyDAO',

  imports: [
    'viewPIIRequestDAO',
    'user'
  ],

  documentation: `Prevents a new request being put to the dao if
  there is already an active request assosciated with the user`,

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',

    'java.util.Date'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
  DAO vprDAO = (DAO) x.get("viewPIIRequestDAO");
  User user = ((Subject) x.get("subject")).getUser();

  if ( obj.getProperty("viewRequestStatus").equals(foam.nanos.pii.PIIRequestStatus.PENDING)){
    // get pending or valid and approved PII requests for current user
    Count count = (Count) vprDAO.where(
      MLang.OR(
        (MLang.AND(
          MLang.EQ(ViewPIIRequest.CREATED_BY, user.getId() ),
          MLang.EQ(ViewPIIRequest.VIEW_REQUEST_STATUS, PIIRequestStatus.PENDING))
        ),
        (MLang.AND(
          MLang.EQ(ViewPIIRequest.CREATED_BY, user.getId() ),
          MLang.EQ(ViewPIIRequest.VIEW_REQUEST_STATUS, PIIRequestStatus.APPROVED),
          MLang.GT(ViewPIIRequest.REQUEST_EXPIRES_AT , new Date() ))
        )
      )
    ).select(new Count());

    if ( count.getValue() > 0 ) {
      return null;
    }
  }
  return getDelegate().put_(x, obj);
  `
    },
  ]
});

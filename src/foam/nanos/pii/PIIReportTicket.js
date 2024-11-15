/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pii',
  name: 'PIIReportTicket',
  extends: 'foam.nanos.ticket.Ticket',

  documentation: 'Regenerate a PII Report for a user',

  implements: [
    'foam.mlang.Expressions'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      name: 'status',
      order: 5,
      createVisibility: 'HIDDEN'
    },
    // {
    //   name: 'createdFor',
    //   hidden: true,
    //   required: false
    // },
    // {
    //   name: 'assignedTo',
    //   hidden: true
    // },
    {
      name: 'assignedToGroup',
      hidden: true
    },
    {
      name: 'comment',
      hidden: true
    },
    {
      name: 'externalComment',
      hidden: true
    },
    {
      name: 'type',
      hidden: true
    }
  ]
})

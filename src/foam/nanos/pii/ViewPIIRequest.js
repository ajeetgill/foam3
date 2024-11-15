/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.pii',
  name: 'ViewPIIRequest',

  documentation: `Modelled PII Request`,

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware'
  ],

  searchColumns: [
    'viewRequestStatus'
   ],

  tableColumns: [
    'id',
    'createdBy.firstName',
    'createdBy.lastName',
    'approvedBy.firstName',
    'approvedBy.lastName'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      documentation: 'User who created the request'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      documentation: 'Agent who created the request'
    },
    {
      name: 'created',
      class: 'DateTime',
    },
    {
      name: 'reportIssued',
      class: 'Boolean'
    },
    {
      name: 'viewRequestStatus',
      class: 'Enum',
      of: 'foam.nanos.pii.PIIRequestStatus',
      value: 'PENDING'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'approvedBy',
      documentation: 'Id of user that Approved the request'
    },
    {
      name: 'approvedAt',
      class: 'DateTime',
      documentation: 'Time at which the request was approved'
    },
    {
      name: 'requestExpiresAt',
      class: 'DateTime',
    },
    {
      class: 'List',
      name: 'downloadedAt',
      documentation: 'List that holds times at which the report was downloaded',
      javaType: 'java.util.ArrayList<java.util.Date>'
    }
  ]
});

/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'foam.nanos.pii',
  name: 'PIIRequestStatus',
  values: [
    { name: 'PENDING',       label: 'Pending' },
    { name: 'APPROVED',      label: 'Approved' },
    { name: 'DENIED',        label: 'Denied' }
  ]
});


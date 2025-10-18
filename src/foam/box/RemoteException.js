/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.box',
  name: 'RemoteException',
  extends: 'foam.lang.FOAMException',

  properties: [
    {
      class: 'Boolean',
      name: 'isRetryable',
      documentation: 'Indicates whether the originating exception is safe to retry. Defaults to true.',
      value: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.lang.Exception',
      name: 'exception'
    }
  ]
});

/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.pii',
  name: 'PIIAware',

  methods: [
    {
      name: 'piiSummary',
      type: 'String',
      code: function() { return this.toSummary(); },
      javaCode: 'return ((foam.core.FObject) this).toSummary();'
    }
  ]
});

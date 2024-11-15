/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.pii',
  name: 'PII',

  methods: [
    {
      name: 'getPIIData',
      type: 'String',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          class: 'Long',
          documentation: 'id of the user for whom the data is being reported'
        }
      ]
    }
    // TODO - implement method to deletablePII
    // {
    //   name: 'deletePIIData',
    //   type: 'void',
    // }
  ]
});

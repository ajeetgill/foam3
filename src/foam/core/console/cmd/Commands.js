/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.console.cmd',
  name: 'Help',

  imports: [ 'log' ],

  properties: [
    { class: 'String', name: 'name',        value: 'help' },
    { class: 'String', name: 'description', value: 'Show help text' }
  ],

  methods: [
    function execute() {
      this.log('Help');
    }
  ]
});

/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.console.cmd',
  name: 'Command',

  imports: [ 'log' ],

  properties: [
    { class: 'String', name: 'id' },
    { class: 'String', name: 'description' }
  ],

  methods: [
    function execute() {}
  ]
});


foam.CLASS({
  package: 'foam.core.console.cmd',
  name: 'Help',
  extends: 'foam.core.console.cmd.Command',

  properties: [
    { name: 'id',          value: 'help' },
    { name: 'description', value: 'Show help text' }
  ],

  methods: [
    function execute() {
      this.log('Help');
    }
  ]
});

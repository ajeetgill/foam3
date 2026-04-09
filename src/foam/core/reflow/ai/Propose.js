/**
 * @license
 * Copyright 2026 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.reflow.ai',
  name: 'Propose',

  imports: [ 'eval_', 'block' ],

  properties: [
    {
      class: 'String',
      name: 'command'
    }
  ],

  methods: [
    function addToE(e) {
      e.startContext({data: this}).start('span').add('>', this.COMMAND, this.ACCEPT, this.REJECT);
    }
  ],

  actions: [
    function accept() {
      this.eval_(this.command);
      this.block.del();
    },

    function reject() {
      this.block.del();
    }
  ]
});

/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.console',
  name: 'ComparatorView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.TextField'
  ],

  css: `
  `,

  properties: [
    [ 'type', 'search' ]
  ],

  methods: [
    function render() {
      this.
        start('span').
          style({display: 'flex'}).
          tag(this.TextField, {data$: this.data$, size: 40});
    }
  ],

  listeners: [
  ],

});

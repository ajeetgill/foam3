/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.reflow.float',
  name: 'PassFailView',
  extends: 'foam.u2.View',

  methods: [
    function render() {
      this.SUPER();
      this.add(this.dynamic(function(data) {
        if ( data ) {
          this.start('span').style({color: 'green'}).add('PASSED');
        } else {
          this.start('span').style({color: 'red'}).add('FAILED');
        }
      }));
    }
  ]
});


foam.CLASS({
  package: 'foam.core.reflow.float',
  name: 'TestResults',

  requires: [ 'foam.dao.EasyDAO' ],

  imports: [ 'eval_' ],

  properties: [
    {
      class: 'Int',
      name: 'passed',
      visibility: 'RO',
      transient: true
    },
    {
      class: 'Int',
      name: 'failed',
      visibility: 'RO',
      transient: true
    },
    {
      name: 'dao',
      hidden: true,
      transient: true,
      factory: function() {
        return this.EasyDAO.create({daoType: 'MDAO', of: foam.core.reflow.float.Test});
      }
    }
  ],

  methods: [
    function report(test) {
      this.dao.put(test);
      if ( test.status ) { this.passed++; } else { this.failed++; }
      test.status$.sub((_, __, ___, slot) => {
        if ( slot.get() ) {
          this.passed++;
          this.failed--;
        } else {
          this.passed--;
          this.failed++;
        }

        this.dao.put(test);
      });
    }
  ],

  actions: [
    {
      name: 'browse',
      code: function() {
        this.eval_('dao(testResults.dao, "Test Results")');
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.core.reflow.float',
  name: 'Test',

  tableColumns: [
    'description', 'status'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      reactive: false,
      hidden: true,
      transient: true
    },
    {
      class: 'String',
      name: 'description',
      reactive: false,
    },
    {
      class: 'String',
      name: 'notes',
      reactive: false,
      width: 80,
      view: { class: 'foam.u2.tag.TextArea', rows: 3, cols: 78 }
    },
    {
      class: 'String',
      name: 'received',
      reactive: false,
      transient: true,
      visibility: 'RO',
      width: 80,
      view: { class: 'foam.u2.tag.TextArea', rows: 6, cols: 78 }
    },
    {
      class: 'String',
      name: 'expected',
//      visibility: 'RO',
      reactive: false,
      width: 80,
      view: { class: 'foam.u2.tag.TextArea', rows: 6, cols: 78 }
    },
    {
      class: 'Boolean',
      name: 'status',
      reactive: false,
      visibility: 'RO',
      view: 'foam.core.reflow.float.PassFailView',
      tableCellFormatter: function(value, obj) {
        this.start(foam.core.reflow.float.PassFailView, {data: value});
      },
      expression: function(received, expected) {
        return received === expected;
      }
    }
  ],

  actions: [
    {
      name: 'accept',
      isEnabled: function(status) { return ! status; },
      code: function() {
        this.expected = this.received;
      }
    }
  ]
});

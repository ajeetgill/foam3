/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.menu',
  name: 'FlowMenu',
  extends: 'foam.core.menu.AbstractMenu',

  documentation: 'A menu item which contains a flow.',


  properties: [
    {
      class: 'Reference',
      of: 'foam.core.console.Flow',
      name: 'flow',
    }
  ],

  methods: [
    function createView(X) { 
      var view = {
        class: 'foam.core.console.Console',
        flowName: this.flow,
        flowMode: 'readonly'
      };

      return view;
     }
  ],
});
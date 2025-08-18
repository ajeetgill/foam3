/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ColorEditView',
  extends: 'foam.u2.MultiView',

  css: `
    ^container:first-child {
      flex-grow: 1;
    }
  `,

  properties: [
    {
      name: 'views',
      factory: function() {
        var self = this;
        return [
          { 
            class: 'foam.u2.TextField',
            placeholder: 'Enter color token ($primary500) or hex (#ff0000)',
            // For Color properties, use the raw value; for String properties, use the value directly
            data$: self.data$
          },
          { class: 'foam.u2.view.ColorPicker' }
        ];
      }
    }
  ]
});

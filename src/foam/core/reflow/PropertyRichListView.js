/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.reflow',
  name: 'PropertyRichListView',
  extends: 'foam.core.reflow.PropertyListView',

  properties: [
    {
      name: 'choice',
      view: function(_, X) { return { class: 'foam.core.reflow.PropertyRichChoiceView', of: X.data.of } },
      preSet: function(o, n) {
        if ( n == '*' ) {
          this.data = this.data || '';
        } else {
          if ( this.data ) this.data += ',';
          this.data += n;
        }
        return n;
      }
    }
  ],
});

/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.console',
  name: 'PropertyChoiceView',
  extends: 'foam.u2.view.ChoiceView',

  properties: [
    'of',
    {
      name: 'choices',
      factory: function(of) {
        var choices = [ ];
        this.of.getAxiomsByClass(foam.core.Property).forEach(p => {
          if ( p.hidden || p.networkTransient ) return;
          choices.push([p, p.name]);
        });
        if ( choices.length ) this.data = choices[0][0];
        return choices;
      }
    }
  ]
});

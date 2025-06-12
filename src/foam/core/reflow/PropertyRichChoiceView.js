/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.reflow',
  name: 'PropertyRichChoiceView',

  documentation: 'todo & todo:expression with sections',

  extends: 'foam.u2.view.RichChoiceView',

  requires: [
    'foam.u2.view.RichChoiceViewSection'
  ],

  imports: [
    'cSpecDAO'
  ],

  properties: [
    {
      name: 'of'
    },
    {
      name: 'search',
      value: true
    },
    {
      name: 'sections',
      value: []
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      var tempPropertiesDAO = foam.dao.MDAO.create({ of: this.of });

      var propertiesSection = this.RichChoiceViewSection.create({
        heading: 'Properties',
        dao: tempPropertiesDAO
      });
      
      if ( this.of ) {
        this.of.getAxiomsByClass(foam.lang.Property).forEach(p => {
          if ( ! p.showInPropertyChoice ) return;
          tempPropertiesDAO.put(foam.core.boot.CSpec.create({
            id: p,
            name: p.name
          }))
        });
      }

      this.sections = [propertiesSection];
    }
  ]
});

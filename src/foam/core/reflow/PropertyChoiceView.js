/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.reflow',
  name: 'PropertyRefinement',
  refines: 'Property',

  properties: [
    {
      class: 'Boolean',
      name: 'showInPropertyChoice',
      factory: function() { return ! this.hidden && ! this.networkTransient; }
    }
  ]
});


foam.CLASS({
  package: 'foam.core.reflow',
  name: 'PropertyChoiceView',
  extends: 'foam.u2.view.RichChoiceView',

  properties: [
    {
      name: 'of',
      postSet: function(_, value) {
        this.rebuildSections();
      }
    },
    'predicate',
    'optionalChoice',
    {
      name: 'search',
      value: true
    },
    {
      name: 'idProperty',
      value: 'name'
    },
    {
      name: 'sections',
      factory: function() {
        if ( ! this.of ) return [
          {
            heading: 'Properties',
            dao: foam.dao.ArrayDAO.create({ array: [] })
          }
        ];
        
        let arr = this.of.getAxiomsByClass(foam.lang.Property)
          .filter(p => p.showInPropertyChoice)
          .filter(p => ! this.predicate || this.predicate(p));

        // MISSING - currently not dealing with this.optionalChoice at all
        // BUGGY: currently two files(Upload.js and PropertyListView.js) are passing optionalChoice, both differently. Couldn't get this to render correctly - gui won't show the text (e.g. '--, *' was not being rendered)
        // TRIED: changing the initialization of optionalChoice in both to be same as Upload.js. Still didn't work.
        // if ( this.optionalChoice ) {
        //   arr.unshift(this.optionalChoice);
        // }

        return [
          {
            heading: 'Properties',
            dao: foam.dao.ArrayDAO.create({ array: arr })
          }
        ];
      }
    }
  ],

  methods: [
    function rebuildSections() {
      this.clearProperty('sections');
    }
  ]
});

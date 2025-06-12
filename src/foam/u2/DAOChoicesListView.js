/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'DAOChoicesListView',

  implements: [ 'foam.mlang.Expressions' ],

  documentation: `A view that provides a searchable list of all served DAOs and flowChildren if any available. 
  For flowChildren, 
  - all flow-DAOs would be shown irrespective of whether that fow was declared before or after the current selected block,
  - current selected flowChild is not shown in list of dropdowns.`,

  extends: 'foam.u2.TextField',

  imports: [
    'cSpecDAO',
    'selected',
    'flowChildren'
  ],
  
  properties: [
    'of',
    {
      name: 'choices',
      value: []
    },
  ],

  methods: [
    function init() {
      var flowChoices = [];

      this.flowChildren.forEach(child =>{
        // if (child.flowName !== this.selected.flowName) {
          child.value?.cls_ && child.value.cls_.getAxiomsByClass(foam.dao.DAOProperty).forEach(prop => flowChoices.push(child.flowName + '.' + prop.name))
        // }
      })
      
      // this.choices = [...flowChoices]
      // try removing below with above one
      
      var daoChoices = [];
      
      // Set initial choices to flowChoices (if any)
      if (flowChoices.length > 0) {
        this.choices = [...flowChoices];
      }
      
      var allDAOs = this.cSpecDAO.where(
        this.AND(
          this.ENDS_WITH(foam.core.boot.CSpec.ID, 'DAO'),
          this.EQ(foam.core.boot.CSpec.SERVE, true)
        )
      );
      
      allDAOs.select().then(sink => {
        sink.array.forEach(d => {
          daoChoices.push(d.name);
        });

        // if( flowChoices ) this.choices = [...flowChoices, ...daoChoices];
        // else this.choices = [...daoChoices];
        // Update choices with combined array only after DAO query completes
        if (flowChoices.length > 0) {
          var currentSelectedRemovedArray = Array.from(flowChoices).filter(e => {
            const dotIndex = e.indexOf(".");
            // Skip this check if there's no dot
            if (dotIndex === -1) return true;
            return e.substring(0, dotIndex) !== this.selected.flowName;
          })
          this.choices = [...currentSelectedRemovedArray, ...daoChoices];
        } 
      });
      
    }
  ]
});
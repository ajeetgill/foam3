/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'DAOChoicesListView',
  extends: 'foam.u2.view.ChoiceView',

  imports: ['cSpecDAO'],
  
  properties: [
    'of',
    {
      name: 'choices',
      value: []
    },
  ],

  methods: [
    function init() {
      var self = this;
      var values = [];
      
      var allDAOs = this.cSpecDAO.where(
        this.AND(
          this.ENDS_WITH(foam.core.boot.CSpec.ID, 'DAO'),
          this.EQ(foam.core.boot.CSpec.SERVE, true)
        )
      );
      
      allDAOs.select().then(sink => {
        sink.array.forEach(d => {
          values.push([d, d.name]);
        });
        this.choices = [...values];
      });
    }
  ]
});
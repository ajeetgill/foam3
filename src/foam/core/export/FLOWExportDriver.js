/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.export',
  name: 'FLOWExportDriver',

  implements: [
    'foam.core.export.ExportDriver'
  ],

  requires: [ 'foam.core.console.Flow' ],

  imports: [ 'currentMenu', 'flowDAO' ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'description',
      width: 80
    },
    { name: 'daoKey', hidden: true },
    { name: 'dao',    hidden: true },
    { name: 'of',     hidden: true },
    { name: 'plural', hidden: true }
  ],

  methods: [
    async function init() {
      this.SUPER();

      // TODO: Make work when used from Data Management menus
      this.daoKey = this.currentMenu.handler.config.daoKey;
      this.dao    = this.__context__[this.daoKey];
      this.of     = this.dao.of;
      this.plural = this.of.model_.plural;

      this.name = await this.suggestName(this.of);
    },

    async function suggestName() {
      var prefix = this.plural + ' View ';
      for ( var i = 1 ; i < 99 ; i++ ) {
        var name = prefix + i;
        // TODO: faster to do a .limit(1).select(COUNT())
        var flow = await this.flowDAO.find(name);
        if ( ! flow ) return name;
      }
      return 'Unnamed';
    },

    function exportFObject(X, obj) {
      debugger;
      return '/reflow.html';
    },

    function exportDAO(X, dao) {
      var flow = this.Flow.create({
        name: this.name,
        description: this.description,
        mementoStr: `
[
  {
    "flowName": "${this.plural}1",
    "cmd": "dao2 ${this.daoKey}",
    "value": {
      "class": "foam.core.console.DAOPrompt2",
      "label": "${this.plural}",
      "version": 2,
      "select": {
        "class": "foam.core.console.ScrollTableDAOAgent",
        "of": {"class":"__Class__","forClass_":"${this.of.id}"}
      }
    }
  }
]
        `
      });
      this.flowDAO.put(flow);
      return '/reflow.html?flow=' + this.name;
    }
  ]
});

/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.core.reflow.control',
    name: 'CollectionsControl',
    extends: 'foam.u2.Element',
  
    requires: [ 'foam.core.reflow.DynamicReflowData' ],
    imports: [ 'eval_' ],
  
    css: `
      ^promptHolder {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        position: relative;
        max-height: 30px;
      }
      ^expanded-island {
        position: absolute;
        bottom: 100%;
        margin-bottom: 10px;
        background-color: $white;
        border: 1px solid $grey200;
        box-shadow: 0 0 10px 0 $grey200;
        border-radius: 4px;
        padding: 10px;
      }
    `,
  
    properties: [
      'data',
      {
        class: 'Boolean',
        name: 'opened',
        value: false
      }
    ],
  
    methods: [
      function render() {
        var self = this;
        this.start().addClass(this.myClass('promptHolder'))
            .add(this.dynamic(function(opened) {
                console.log('opened', opened);
                if (opened) {
                    this.start().addClass(self.myClass('expanded-island'), self.myClass('holder'))
                        .start(self.DynamicReflowData, { data: self.data })
                    .end();
                }
            }))
            .start()
                .startContext({ data: this })
                    .add(this.COLLECTIONS)
                .endContext()
            .end()
        .end();
      }
    ],

    actions: [
      {
        name: 'collections',
        label: 'Data',
        buttonStyle: foam.u2.ButtonStyle.TERTIARY,
        size: 'SMALL',
        code: function() {
            this.opened = !this.opened;
        }
      }
    ]
  });
  
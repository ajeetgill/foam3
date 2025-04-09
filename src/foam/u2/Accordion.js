/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.u2',
  name: 'Accordion',
  extends: 'foam.u2.Element',

  requires: [ 'foam.u2.ActionView' ],

  css: `
    ^ {
      width: 100%;
      overflow: hidden;
      background-color: #eee;
      border: 1px solid #eee;
      border-bottom-color: #ccc;
    }
    ^:first-child {
      margin-top: 15px;
      border-radius: 5px 5px 0 0;
    }
    ^:last-child {
      margin-bottom: 15px;
      border-radius: 0 0 5px 5px;
      border-bottom-color: #eee;
    }
    ^toolbar {
      background-color: #eee;
      padding: 5px;
      display: flex;
      justify-content: space-between;
    }
    ^actions {
        
    }
    ^title {
      padding: 3px;
      font-size: 1.1em;
      cursor: default;
      display: flex;
      align-items: center;
    }
    ^content {
      background: white;
      display: block;
      transition: 0.2s ease-in-out;
      height: 0;
      padding: 0;
      opacity: 0;
    }
    ^.expanded ^content {
      height: auto;
      padding: 5px;
      opacity: 1;
    }
    ^ .foam-u2-ActionView-toggle svg {
      width: 12px;
      height: 12px;
      color: black;
    }
    ^ .foam-u2-ActionView-toggle {
      transform: rotate(90deg);
      transition: transform 0.3s;
      background: transparent;
      border-radius: 50%;
      border: none;
      outline: none;
      outline: none;
      padding: 3px;
      width: 30px;
      height: 30px;
    }
    ^ .foam-u2-ActionView-toggle:hover {
      background: transparent !important;
    }
    ^.expanded .foam-u2-ActionView-toggle {
      transform: rotate(180deg);
      transition: transform 0.3s;
    }
  `,

  properties: [
    'title',
    {
      name: 'icon',
      documentation: `
        An icon that appears before the title in the Accordion toolbar.

        Example:
          this.start(foam.u2.Accordion, {
            title: 'Action Accordion',
            icon: {
              class: 'foam.u2.tag.Image',
              data: 'images/my-icon.svg'
            },
          })
            .add('This is hidden content...');
      `,
    },
    {
      name: 'actions',
      documentation: `
        A list of actions that appear in the accordion toolbar.

        Example:
          this.start(foam.u2.Accordion, {
            title: 'Action Accordion',
            actions: [
              {
                label: 'Action 1',
                action: this.someFunction
              },
              {
                label: 'Action 2',
                action: this.someOtherFunction
              }
            ]
          })
            .add('This is hidden content...');
      `,
      value: []
    },
    {
      class: 'Boolean',
      name: 'expanded',
      value: true
    }
  ],

  methods: [
    function init() {
      let toolbar = this
        .addClass(this.myClass())
        .enableClass('expanded', this.expanded$)
        .start('div')
          .addClass(this.myClass('toolbar'))
          .on('click', _ => this.toggle());
      
      let titleSection = toolbar
        .start('div')
          .addClass(this.myClass('title'));

      if ( this.icon !== undefined ) {
        titleSection.tag(this.icon);
      }
      
      titleSection
        .start('span')
          .addClass(this.myClass('title'))
          .add(this.title$)
        .end();

      let actionsSection = toolbar
        .start()
          .addClass(this.myClass('actions'));

      if ( this.actions.length > 0 ) {
        // Add actions to the accordion.
      }

      //actionsSection.tag(this.ActionView, {action: this.TOGGLE, data: this, label: '\u25BD'})
      actionsSection.tag(this.ActionView, {action: this.TOGGLE, data: this, icon: 'images/triangle.svg', label: ''})

      this.start('div', null, this.content$)
        //.show(this.expanded$)
        .addClass(this.myClass('content'))
      .end();
    }
  ],

  actions: [
    function toggle() { this.expanded = ! this.expanded; }
  ]
});

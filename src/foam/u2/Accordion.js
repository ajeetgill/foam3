/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'Panel',
  extends: 'foam.u2.Element',

  documentation: 'Accordion content panel.',

  properties: [
    {
      name: 'title',
      class: 'String'
    },
    {
      name: 'expanded',
      class: 'Boolean'
    },
    {
      name: 'href',
      class: 'String',
      factory: function() {
        return this.slugify(this.title);
      }
    }
  ],

  methods: [
    function slugify(str) {
      str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
      str = str.toLowerCase(); // convert string to lowercase
      str = str.replace(/[^a-z0-9 -_]/g, '') // remove any non-alphanumeric characters
               .replace(/_/g, '-') // replace spaces with hyphens
               .replace(/\s+/g, '-') // replace spaces with hyphens
               .replace(/-+/g, '-'); // remove consecutive hyphens
      return str;
    }
  ],

  actions: [
    function toggle() { this.expanded = ! this.expanded; }
  ]
})


//foam.CLASS({
//  package: 'foam.u2',
//  name: 'Accordion',
//  extends: 'foam.u2.Element',
//
//  requires: [ 'foam.u2.Panel' ],
//  mixins: [ 'foam.u2.memento.Memorable' ],
//
//  documentation: 'HTML Accordion.',
//
//  properties: [
//    'accordions',
//    'panels',
//    {
//      name: 'linked',
//      documentation: "Accordions are linked; Only one can be expanded at a time.",
//      class: 'Boolean',
//      value: false
//    },
//  ],
//
//  methods: [
//    function init() {
//      this.panels = [];
//      this
//        .addClass(this.myClass())
//        .start('div', null, this.accordions$)
//          .addClass(this.myClass('accordions'))
//        .end()
//        .start('div', null, this.content$)
//          .addClass(this.myClass('panels'))
//        .end();
//    },
//    function add(panel) {
//      if ( this.Panel.isInstance(panel) ) {
//        var self = this;
//
//        console.log("Calling Accordion.add method.")
//
//        this.accordions
//          .start('button')
//            .addClass(this.myClass('accordion'))
//            .attr('target', `${this.myClass()}-panel-${panel.href}`)
//            .add(panel.title)
//            .on('click', function() {
//              // fire display animation
//            })
//          .end()
//          .start('div', { id: `${this.myClass()}-panel-${panel.href}` })
//            .addClass(this.myClass('panel'))
//            .createChild_(panel)
//
//        this.panels.push(panel);
//      }
//      else {
//        //this.SUPER(panel);
//      }
//      this.SUPER(panel);
//    },
//  ]
//});



foam.CLASS({
  package: 'foam.u2',
  name: 'Accordion',
  extends: 'foam.u2.Element',

  requires: [ 'foam.u2.ActionView' ],

  css: `
    ^ {
      width: 100%;
      background-color: #eee;
      border: 1px solid #eee;
    }
    ^:first-child {
      margin-top: 15px;
      border-radius: 5px 5px 0 0;
      overflow: hidden;
    }
    ^:last-child {
      margin-bottom: 15px;
      border-radius: 0 0 5px 5px;
      overflow: hidden;
    }
    ^.expanded {
        
    }
    ^toolbar {
      background-color: #eee;
      padding: 5px;
    }
    ^control {
      float: right;
      position: relative;
      top: -5px;
      width: 30px;
      height: 30px;
    }
    ^title {
      left: 6px;
      padding: 3px;
      font-size: 1.1em;
      cursor: default;
    }
    ^content {
      background: white;
      padding: 5px;
      display: block;
    }
    ^ .foam-u2-ActionView-toggle {
      transform: rotate(-90deg);
      transition: transform 0.3s;
      background: transparent;
      border: none;
      outline: none;
      padding: 3px;
      width: 30px;
      height: 30px;
    }
    ^.expanded .foam-u2-ActionView-toggle {
      transform: rotate(0deg);
      transition: transform 0.3s;
    }
    ^ .foam-u2-ActionView-toggle:hover {
      background: transparent !important;
    }
  `,

  properties: [
    'title',
    {
      class: 'Boolean',
      name: 'expanded',
      value: true
    }
  ],

  methods: [
    function init() {
      this
        .addClass(this.myClass())
        .enableClass('expanded', this.expanded$)
        .start('div')
          .addClass(this.myClass('toolbar'))
          .on('click', _ => this.toggle())
          .start('span')
            .addClass(this.myClass('title'))
            .add(this.title$)
          .end()
          .start('div')
            .addClass(this.myClass('control'))
            .tag(this.ActionView, {action: this.TOGGLE, data: this, label: '\u25BD'})
          .end()
        .end()
        .start('div', null, this.content$)
          .show(this.expanded$)
          .addClass(this.myClass('content'))
        .end();
    }
  ],

  actions: [
    function toggle() { this.expanded = ! this.expanded; }
  ]
});

/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.u2.borders',
    name: 'FoldingSection',
    extends: 'foam.u2.Element',
  
    requires: [ 'foam.u2.ActionView' ],
  
    css: `
      ^ {
        width: 98%;
        border-top: 1px solid #999;
        display: inline-block;
        padding: 10px 4px;
      }
      ^.expanded {
        border: 1px solid #999;
        // padding-left: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.38);
        margin-top: 5%;
      }
      ^control {
        background:$white;
        display: inline;
        float: right;
        height: 30px;
        position: relative;
        top: -10px;
        width: 30px;
      }
      ^toolbar {
        color: #666;
        display: inline-block;
        padding: 3px;
        position: relative;
        left: -8px;
        top: -20px;
        width: 100%;
      }
      ^title {
        background:$white;
        left: 6px;
        padding: 3px;
        position: relative;
        top: -3px;
      }
      ^content {
        background:$white;
        display: initial;
        //  height: 200px;
        position: relative;
        top: -22px;
        width: 300px;
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
        background: transparent;
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
        this.
          addClass(this.myClass()).
          enableClass('expanded', this.expanded$).
          start('div').
            addClass(this.myClass('toolbar')).
            start('span').
              addClass(this.myClass('title')).
              add(this.title$).
            end().
            start('div').
              addClass(this.myClass('control')).
              tag(this.ActionView, {action: this.TOGGLE, data: this, label: '\u25BD'}).
            end().
          end().
          start('div', null, this.content$).
            show(this.expanded$).
            addClass(this.myClass('content')).
          end();
      }
    ],
  
    actions: [
      function toggle() { this.expanded = ! this.expanded; }
    ]
  });
  
  
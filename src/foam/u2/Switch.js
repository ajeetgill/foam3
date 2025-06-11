/**
 * @license
 * Copyright 2025 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'Switch',
  extends: 'foam.u2.View',

  documentation: 'Switch View.',

  cssTokens: [
    {
      class: 'foam.u2.ColorToken',
      name: 'checkboxColor',
      value: '$primary400'
    }
  ],

  css: `
    ^switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 24px;
  }
  ^switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  ^slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid $grey200;
    transition: .4s;
    border-radius: 24px;
    background: $white;
  }
  ^slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 3px;
    top: 2px;
    background-color: $grey200;
    transition: .4s;
    border-radius: 50%;
  }
  ^switch input:checked + ^slider {
    border: 1px solid $primary500;
    background-color: $primary100;
  }
  ^switch input:checked + ^slider:before {
    top: 3px;
    transform: translateX(15px);
    background-color: $primary500;
  }
  ^desc {
    color: $grey700;
    margin-left: 8px;
    vertical-align: middle;
  }
    `,

  methods: [
    function render() {
      var self = this;
      this
        .start('label')
          .addClass(this.myClass('switch'))
            .tag(foam.u2.CheckBox, {data$: this.data$, mode: foam.u2.DisplayMode.RW })
          .start('span')
            .addClass(this.myClass('slider'))
          .end()
        .end();
    
      if ( this.showLabel ) {
        this.start('span')
          .addClass(this.myClass('desc'))
          .callIfElse(this.labelFormatter,
            this.labelFormatter,
            function() { this.add(self.label$); }
          )
        .end();
      }
    }
  ],

  listeners: [
    function onClick() {
      if ( this.getAttribute('disabled') ) return;
      this.data = ! this.data;
    }
  ]
});

/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2',
  name: 'ColorToken',
  extends: 'foam.u2.CSSToken',
  requires: ['foam.u2.CSSToken'],
  documentation: 'SubClass of CSS tokens that installs convenience tokens for different states',

  properties: [
    {
      class: 'String',
      name: 'color'
    },
    {
      class: 'Int',
      name: 'hoverModifier',
      value: -20
    },
    {
      class: 'Int',
      name: 'activeModifier',
      value: -40
    },
    {
      class: 'Int',
      name: 'disabledModifier',
      value: 60
    },
    {
      class: 'String',
      name: 'onLight',
      value: '$black'
    },
    {
      class: 'String',
      name: 'onDark',
      value: '$white'
    }
  ],
  
  javaCode: `
  public ColorToken(String name, String value, String fallback) {
    setName(name);
    setValue(value);
    setFallback(fallback);
  }
  `,
});

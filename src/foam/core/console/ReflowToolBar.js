/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.core.console',
  name: 'ReflowToolBar',
  extends: 'foam.u2.View',

  css: `
    ^ {
      padding: 10px;
      background-color: $white;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: absolute;
      left: 35%;
      bottom: 50;
      border: 1px solid $grey200;
    }
    ^ > div {
      display: flex;
      gap: 10px;      
      align-items: center;
    }
    ^ .foam-u2-ActionView {
      border: none;
      box-shadow: none;
    }
  `,

  methods: [
    function render() {
      var self = this;
      this.addClass().
      start()
        .tag(this.DATA_BUTTON)
        .tag(this.COMPONENTS)
        .tag(this.UTILITIES)
        .tag(this.HELP)
      .end();
    }
  ],

  actions: [
    {
      name: 'dataButton',
      label: 'Data',
      buttonStyle: foam.u2.ButtonStyle.SECONDARY,
      size: 'SMALL',
      themeIcon: 'file',
      code: function() {
        console.log('data');
      }
    },
    {
      name: 'components',
      label: 'Components',
      buttonStyle: foam.u2.ButtonStyle.SECONDARY,
      size: 'SMALL',
      themeIcon: 'plus',
      code: function() {
        console.log('components');
      }
    },
    {
      name: 'utilities',
      label: 'Utilities',
      buttonStyle: foam.u2.ButtonStyle.SECONDARY,
      size: 'SMALL',
      themeIcon: 'star',
      code: function() {
        console.log('utilities');
      }
    },
    {
      name: 'help',
      label: 'Help',
      buttonStyle: foam.u2.ButtonStyle.SECONDARY,
      themeIcon: 'helpIcon',
      size: 'SMALL',
      code: function() {
        console.log('help');
      }
    }
  ]
});
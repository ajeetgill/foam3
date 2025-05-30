/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'GroupByView',
  extends: 'foam.u2.View',

  cssTokens: [
    {
      name: 'backgroundTransition',
      value: 'background-color 0.15s ease'
    },
    {
      name: 'borderSize',
      value: '1px solid #D1D5DB'
    },
    {
      name: 'borderRadius',
      value: '4px'
    },
    {
      name: 'cellPadding',
      value: '.8rem 1rem'
    },
    {
      name: 'hoverColor',
      value: '#E1EFFE'
    },
    {
      name: 'headerBgColor',
      value: '#EEF2F6'
    },
    {
      name: 'rowHoverColor',
      value: '#F3F4F6'
    }
  ],

  css: `
    /* Base table styling */
    ^table { 
      border-collapse: separate; 
      border-spacing: 0;
      border-radius: $borderRadius;
      width: 100%;
      border: $borderSize;
    }
    
    /* Row styling */
    ^tr {
      border-bottom: $borderSize;
      transition: background-color 0.2s ease;
    }
    
    ^tr:hover {
      background-color: $rowHoverColor;
    }
    
    ^tr:last-child {
      border-bottom: none;
    }
    
    /* Cell styling - both TH and TD */
    ^td {
      border: none;
      padding: $cellPadding;
      transition: $backgroundTransition;
    }
    
    /* First column-cells styling */
    ^tr > ^td:first-child {
      font-weight: bold;
      border-right: $borderSize;
      background-color: $headerBgColor;
    }
    
    /* Hover effects */
    ^td:hover {
      background-color: $hoverColor;
      z-index: 1;
    }
    
    ^tr > ^td:first-child:hover {
      background-color: $rowHoverColor;
    }
  `,

  properties: [
    { name: 'selection' }
  ],

  methods: [
    function render(e) {
      var self = this;
      var data = this.data;

      this.addClass();

      var groups = data.groups;
      this.start('table').addClass(this.myClass('table')).start('tbody').
        forEach(data.sortedKeys(), function(g) {
          this.start('tr').addClass(self.myClass('tr')).
            on('click', () => self.selection = g).
            start('td').addClass(self.myClass('td')).add(g.toString()).end().
            start('td').addClass(self.myClass('td')).add(groups[g]);
        });
    }
  ]
});

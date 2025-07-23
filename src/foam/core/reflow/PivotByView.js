/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.reflow',
  name: 'PivotByView',
  extends: 'foam.u2.View',

  documentation: 'Table View for GridBy mLang.',

  cssTokens: [
    {
      class: 'foam.u2.ColorToken',
      name: 'highlightRowCol',
      value: '$backgroundBrandTertiary'
    },
    {
      class: 'foam.u2.ColorToken',
      name: 'highlightCell',
      value: '$backgroundBrand'
    }
  ],

  css: `
    /* Base table styling */
    ^table {
      border-collapse: collapse;
      border-spacing: 0;
      border: 1px solid $borderStrong;
    }

    /* Row styling */
    ^tr {
      transition: background-color 0.2s ease;
    }

    /* Header row */
    ^tr:first-child {
      background-color: $backgroundDefault;
    }

    /* Cell styling - both TH and TD */
    ^th, ^td {
      padding: .8rem 1rem;
      transition: background-color 0.15s ease;
      border: 1px solid $borderDefault;
    }

    /* Header cells */
    ^th {
      background-color: $backgroundDefault;
      font-weight: bold;
      text-align: center;
      text-wrap-mode: nowrap;
    }
      
    ^ td:hover {
      font-weight: 600;
      background: $highlightCell;
      color: $highlightCell$foreground;
    }
    
    ^highlighted-col {
      background: $highlightRowCol;
      color: $highlightRowCol$foreground;
    }

    /* Row highlighting */
    ^highlighted-row, ^highlighted-row > th, ^highlighted-row > td {
      background: $highlightRowCol;
      color: $highlightRowCol$foreground;
    }
  `,

  properties: [
    { name: 'x' },
    { name: 'y' },
    { name: 'currentHoverCol' },
    { name: 'currentHoverRow' }
  ],

  methods: [
    
    function render() {
      var data = this.data;
      var colsDict = this.makeDictionary(data.cols);
      var rowsDict = this.makeDictionary(data.rows);
      console.log(rowsDict);
      var rowDepth = this.data.yFunc.length;
      var colDepth = this.data.xFunc.length;

      this.addClass();

      var table = this.start('table').addClass(this.myClass('table'));
      this.renderColHeaders(table, colsDict, [], 0, rowDepth);
    },


    function renderColHeaders(table, cols, rows, depth, rowDepth = 1) {
      var row;
      if ( rows.length < depth + 1 ) {
        row = table.start('tr').addClass(this.myClass('tr'));
        for ( var i = 0; i < rowDepth; i++ ) {
          row.start('th').addClass(this.myClass('th')).add("X").end();
        }
        rows.push(row);
      }
      row = rows[depth];
      var keys = Object.keys(cols);
      var hasChildren = keys.some(c => cols[c] instanceof Object); // sus
      var colSpans = [];
      if ( hasChildren ) {
        keys.forEach(c => {
          childKeys = 
            this.renderColHeaders(table, cols[c], rows, depth + 1, rowDepth);
          colSpans.push(childKeys);
        });
      }
      for ( var i = 0; i < keys.length; i++ ) {
        var colSpan = hasChildren ? colSpans[i] : 1;
        rows[depth].start('th')
          .addClass(this.myClass('th'))
          .attrs({'colspan':colSpan})
          .add(keys[i].toString())
        .end();
      }
      if ( depth = 0 ) rows.forEach(r => r.end());
      return hasChildren ? 
        colSpans.reduce((x,y) => x + y, 0) :
        keys.length;
    },

    function makeDictionary(data /** instanceof GroupBy */) {
      if ( ! foam.mlang.sink.GroupBy.isInstance(data) ) return data.value || data;
      var ret = {};
      var keys = data.sortedKeys();
      for ( var i = 0; i < keys.length; i++ ) {
        ret[keys[i]] = makeDictionary(data.groups[keys[i]]);
      }
      return ret;
    }
  ]
});

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
    { name: 'currentHoverCol' },
    { name: 'currentHoverRow' },
    { name: 'colIndexMap' }
  ],

  methods: [
    function render() {
      this.colIndexMap = [];
      var self = this;
      var rowDepth = this.data.yFunc.length;
      var colDepth = this.data.xFunc.length;
      var rowsDict = this.makeDictionary(this.data.rows);
      // instead of using data.cols which might include cols that aren't in the rows data
      var colsDict = this.getColsFromRows(rowsDict, rowDepth);
      var table = this.start('table').addClass(this.myClass('table'));
      this.renderColHeaders(self, table, colsDict, [], 0, rowDepth, colDepth);
      this.renderRows(self, table, rowsDict, 0, rowDepth);
      table.end();
    },

    function renderRows(self, table, rows, currDepth, rowDepth, prefix = '') {
      var rowKeys = Object.keys(rows);
      if ( currDepth == rowDepth ) {
        return 1;
      }
      var rowSpans = [];
      var retData = { rowSpan: 1, row: null };
      for ( var i = 0; i < rowKeys.length; i++ ) {
        const key = prefix + rowKeys[i];
        if ( currDepth < rowDepth - 1 ) {
          ret = renderRows(self, table, rows[rowKeys[i]], currDepth + 1, rowDepth, key);
          if ( ret.row ) {
            var el = foam.u2.Element.create({nodeName: 'th'});
            el.attrs({ 'rowspan' : ret.rowSpan, 'key' : key })
              .addClass(self.myClass('th'))
              .add(rowKeys[i].toString())
              .on('mouseover', () => self.currentHoverRow = key)
              .on('mouseleave', () => self.currentHoverRow = undefined)
              .enableClass(self.myClass('highlighted-row'), self.slot((currentHoverRow) => currentHoverRow === key || key.startsWith(currentHoverRow) || currentHoverRow?.startsWith(key) ));
            ret.row.insertBefore(el, ret.row.children[0]);
            if ( i == 0 ) retData.row = ret.row;
          }
          rowSpans.push(ret.rowSpan);
        } else {
          var row = table.start('tr').addClass(self.myClass('tr'))
          row.start('th')
            .attrs({ 'key' : key })
            .addClass(self.myClass('th'))
            .on('mouseover', () => self.currentHoverRow = key)
            .on('mouseleave', function() { self.currentHoverCol = undefined; self.currentHoverRow = undefined; })
            .enableClass(self.myClass('highlighted-col'), self.slot((currentHoverRow) => currentHoverRow === key || key.startsWith(currentHoverRow) || currentHoverRow?.startsWith(key) ))
            .add(rowKeys[i].toString())
            .end();
          var map = self.flattenMap(rows[rowKeys[i]]);
          row.forEach(self.colIndexMap, function(col) {
            const c = col;
            row.start('td')
              .addClass(self.myClass('td'))
              .attrs({ 'col' : c, 'row' : key })
              .on('mouseover', function() { self.currentHoverCol = c; self.currentHoverRow = key; })
              .on('mouseleave', function() { self.currentHoverCol = undefined; self.currentHoverRow = undefined; })
              .enableClass(
                self.myClass('highlighted-col'),
                self.slot((currentHoverCol, currentHoverRow) => {
                  var ret = currentHoverCol === c || currentHoverRow === key
                    || c.startsWith(currentHoverCol) || key.startsWith(currentHoverRow);
                  return ret;
                }))
              .add(map[c] || '')
            .end();
          })
          console.log('map',map);
          row.end();
          if ( i == 0 ) retData.row = row;
          rowSpans.push(1);
        } 
      }
      retData.rowSpan = rowSpans.reduce((x, y) => x + y, 0);
      return retData;
    },

    function renderColHeaders(self, table, cols, rows, depth, rowDepth, colDepth, keyPrefix) {
      if ( ! keyPrefix ) keyPrefix = '';
      var row;
      if ( rows.length < depth + 1 ) {
        row = table.start('tr').addClass(this.myClass('tr'));
        if ( depth == 0 ) row.start('th').addClass(this.myClass('th')).attrs({ 'colspan' : rowDepth, 'rowspan' : colDepth }).add('').end();
        rows.push(row);
      }
      row = rows[depth];
      var keys = Object.keys(cols).sort();
      var hasChildren = keys.some(c => cols[c] instanceof Object && Object.keys(cols[c]).length);
      var colSpans = [];
      if ( hasChildren ) {
        keys.forEach(c => {
          childKeysSpan = 
            this.renderColHeaders(self, table, cols[c], rows, depth + 1, rowDepth, colDepth, keyPrefix + c);
          colSpans.push(childKeysSpan);
        });
      }
      for ( var i = 0; i < keys.length; i++ ) {
        var colSpan = hasChildren ? colSpans[i] : 1;
        const key = keyPrefix + keys[i];
        rows[depth].start('th')
          .addClass(this.myClass('th'))
          .attrs({ 'colspan' : colSpan, 'key' : key })
          .on('mouseover', () => self.currentHoverCol = key)
          .on('mouseleave', function() { self.currentHoverCol = undefined; self.currentHoverRow = undefined; })
          .enableClass(self.myClass('highlighted-col'), self.slot((currentHoverCol) => currentHoverCol === key || currentHoverCol?.startsWith(key) || key.startsWith(currentHoverCol)))
          .add(keys[i].toString())
        .end();
        if ( depth == colDepth - 1 ) this.colIndexMap.push(key);

      }
      if ( depth = 0 ) rows.forEach(r => r.end());
      return hasChildren ? 
        colSpans.reduce((x,y) => x + y, 0) :
        keys.length;
    },

    function makeDictionary(data /** GroupBy */) {
      if ( ! foam.mlang.sink.GroupBy.isInstance(data) ) return data.value || data;
      var ret = {};
      var keys = data.sortedKeys();
      for ( var i = 0; i < keys.length; i++ ) {
        ret[keys[i]] = makeDictionary(data.groups[keys[i]]);
      }
      return ret;
    },

    function getColsFromRows(rows, depth) {
      var cols = {};
      this.getColsHelper(rows, 0, cols, depth);
      return cols;
    },
    function getColsHelper(rows, currDepth, cols, depth) {
      if ( currDepth === depth ) {
        for ( var key in rows ) {
          if ( ! cols[key] ) cols[key] = {};
          this.merge(cols[key], rows[key]);
        }
      } else if ( rows && typeof rows === 'object' && Object.keys(rows).length ) {
        for ( var key in rows ) {
          this.getColsHelper(rows[key], currDepth + 1, cols, depth);
        }
      }
    },
  
    function merge(ret, toMerge) {
      for ( var key in toMerge ) {
        if ( typeof toMerge[key] === 'object' && toMerge[key] !== null ) {
          if ( ! ret[key] ) ret[key] = {};
          this.merge(ret[key], toMerge[key]);
        } else {
          ret[key] = toMerge[key];
        }
      }
    },

    function flattenMap(obj, prefix = '') {
      var map = {};
      for (var key in obj) {
        var val = obj[key];
        if (typeof val === 'object' && val !== null) {
          Object.assign(map, flattenMap(val, prefix + key));
        } else {
          map[prefix + key] = val;
        }
      }
      return map;
    }
  ]
});

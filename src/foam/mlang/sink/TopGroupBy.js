/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'TopGroupBy',
  extends: 'foam.mlang.sink.GroupBy',

  documentation: 'GroupBy sink that limits results to top/bottom N groups based on their values.',

  properties: [
    {
      class: 'Int',
      name: 'topLimit',
      value: -1,
      documentation: 'Number of top groups to keep (-1 for no limit)'
    },
    {
      class: 'Boolean', 
      name: 'descending',
      value: true,
      documentation: 'If true, keep top groups (highest values). If false, keep bottom groups (lowest values).'
    },
    {
      class: 'Boolean',
      name: 'includeOthers',
      value: false,
      documentation: 'If true, includes an "Others" category that aggregates all remaining groups'
    },
    {
      class: 'String',
      name: 'othersLabel',
      value: 'Others',
      documentation: 'Label for the aggregated "Others" category'
    }
  ],

  methods: [
    {
      name: 'getTopGroups',
      documentation: 'Returns the top/bottom N groups based on their values',
      code: function() {
        if ( this.topLimit <= 0 ) {
          return this.groups;
        }
        
        // Get all group keys with their values
        var self = this;
        var groupEntries = this.groupKeys.map(function(key) {
          var group = self.groups[key];
          var value = group.value != null ? group.value : 0;
          return { key: key, value: value, group: group };
        });
        
        // Sort by value (descending for top, ascending for bottom)
        groupEntries.sort(function(a, b) {
          if ( self.descending ) {
            return b.value - a.value; // Descending (top values first)
          } else {
            return a.value - b.value; // Ascending (bottom values first)  
          }
        });
        
        // Take only the top N entries
        var topEntries = groupEntries.slice(0, this.topLimit);
        var remainingEntries = groupEntries.slice(this.topLimit);
        
        // Convert back to groups object
        var topGroups = {};
        topEntries.forEach(function(entry) {
          topGroups[entry.key] = entry.group;
        });
        
        // Add "Others" category if requested and there are remaining entries
        if ( this.includeOthers && remainingEntries.length > 0 ) {
          var othersValue = 0;
          remainingEntries.forEach(function(entry) {
            othersValue += entry.value;
          });
          
          // Create a simple group with aggregated value
          topGroups[this.othersLabel] = {
            value: othersValue
          };
        }
        
        return topGroups;
      }
    },
    
    {
      name: 'getTopGroupKeys',  
      documentation: 'Returns keys for the top/bottom N groups (including Others if enabled)',
      code: function() {
        if ( this.topLimit <= 0 ) {
          return this.groupKeys;
        }
        
        return Object.keys(this.getTopGroups());
      }
    }
  ]
});
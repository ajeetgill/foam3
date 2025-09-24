/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.reflow',
  name: 'AbstractDAOCommand',

  imports: [ 'scope' ],

  properties: [
    {
      class: 'String',
      name: 'daoKey',
      documentation: 'Key to identify the DAO in the context or scope'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      hidden: true,
      transient: true,
      adapt: function(o, n, p) {
        return this.adaptDAOProperty(o, n, p);
      },
      expression: function(daoKey) {
        return this.resolveDAOFromKey(daoKey);
      }
    }
  ],

  methods: [
    function resolveDAOFromKey(daoKey) {
      if ( ! daoKey ) return null;

      // Handle dotted keys by traversing down the scope hierarchy
      // e.g., "transform1.data1.dao" or "flow.subflow.property"
      if ( daoKey.includes('.') ) {
        // Split the key into parts at each dot
        var parts = daoKey.split('.');
        // Start at the root scope
        var current = this.scope;
        var i = 0;

        // Traverse down the object hierarchy following each part
        while ( i < parts.length && current ) {
          var part = parts[i];

          // Check if this part ends with '()' - it's a method call
          if ( part.endsWith('()') ) {
            // Remove the '()' to get the method name
            var methodName = part.substring(0, part.length - 2);
            // Get the method and call it with current as 'this'
            var method = current[methodName];
            if ( typeof method === 'function' ) {
              current = method.call(current);
            } else {
              current = null;
            }
          } else {
            current = current[part];
          }
          i++;
        }

        // If we successfully resolved the dotted path, use it
        if ( current ) {
          return current;
        } else {
          console.error('Could not resolve dotted DAO path:', daoKey);
          return null;
        }
      }

      // Try exact key first in scope
      if ( this.scope && this.scope[daoKey] ) return this.scope[daoKey];

      // Try exact key in context
      if ( this.__context__[daoKey] ) return this.__context__[daoKey];

      // Handle plural ending with 's'
      if ( daoKey.endsWith('s') ) {
        // Try plural+DAO first (preserves exact name), then fallback to singular+DAO
        if ( this.scope && this.scope[daoKey + 'DAO'] ) {
          return this.scope[daoKey + 'DAO'];
        } else if ( this.__context__[daoKey + 'DAO'] ) {
          return this.__context__[daoKey + 'DAO'];
        } else {
          // Try singular version
          var singular = daoKey.substring(0, daoKey.length-1) + 'DAO';
          if ( this.__context__[singular] ) {
            return this.__context__[singular];
          }
        }
      } else {
        // Try with DAO suffix
        if ( this.__context__[daoKey + 'DAO'] ) return this.__context__[daoKey + 'DAO'];
        if ( this.scope && this.scope[daoKey + 'DAO'] ) return this.scope[daoKey + 'DAO'];
      }

      console.error('Missing DAO:', daoKey);
      return null;
    },

    function normalizeDaoKey(daoKey) {
      if ( ! daoKey ) return daoKey;

      // Return the key if it resolves directly
      if ( this.scope && this.scope[daoKey] ) return daoKey;
      if ( this.__context__[daoKey] ) return daoKey;

      // Handle plural ending with 's'
      if ( daoKey.endsWith('s') ) {
        // Try plural+DAO first
        if ( this.scope && this.scope[daoKey + 'DAO'] ) {
          return daoKey + 'DAO';
        } else if ( this.__context__[daoKey + 'DAO'] ) {
          return daoKey + 'DAO';
        } else {
          // Try singular version
          var singular = daoKey.substring(0, daoKey.length-1) + 'DAO';
          if ( this.__context__[singular] ) {
            return singular;
          }
        }
      } else {
        // Try with DAO suffix
        if ( this.__context__[daoKey + 'DAO'] ) return daoKey + 'DAO';
        if ( this.scope && this.scope[daoKey + 'DAO'] ) return daoKey + 'DAO';
      }

      return daoKey;
    },

    function adaptDAOProperty(oldValue, newValue, property) {
      // Enhanced DAO property adapter that combines the best logic from DAOPrompt
      let oldAdapt = foam.dao.DAOProperty.ADAPT;

      if ( foam.String.isInstance(newValue) ) {
        // Handle dotted keys by traversing down the scope hierarchy
        // e.g., "daoCommand.data1.dao" or "flow.subflow.property"
        if ( newValue.includes('.') ) {
          var resolved = this.resolveDAOFromKey(newValue);
          if ( resolved ) {
            // Store the original key for reference
            this.daoKey = newValue;
            newValue = resolved;
          } else {
            console.error('Could not resolve dotted DAO path:', newValue);
            return null;
          }
        } else {
          if ( newValue.endsWith('s') ) {
            // Try plural+DAO first (preserves exact name), then fallback to singular+DAO
            if ( this.scope && this.scope[newValue + 'DAO'] ) {
              this.daoKey = newValue + 'DAO';
              newValue = this.scope[newValue + 'DAO'];
            } else if ( this.__context__[newValue + 'DAO'] ) {
              this.daoKey = newValue + 'DAO';
              newValue = newValue + 'DAO';
            } else {
              this.daoKey = newValue;
              newValue = newValue.substring(0, newValue.length-1) + 'DAO';
            }
          } else if ( this.__context__[newValue + 'DAO'] ) {
            newValue = newValue + 'DAO';
          } else if ( this.scope && this.scope[newValue + 'DAO'] ) {
            this.daoKey = newValue + 'DAO';
            newValue = this.scope[newValue + 'DAO'];
          } else if ( this.scope && this.scope[newValue] ) {
            this.daoKey = newValue;
            newValue = this.scope[newValue];
          }
        }
      }

      return oldAdapt.value.call(this, oldValue, newValue, property);
    }
  ]
});
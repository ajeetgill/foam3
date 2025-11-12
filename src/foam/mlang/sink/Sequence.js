/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Sequence',
  extends: 'foam.dao.AbstractSink',
  implements: [ 'foam.lang.Serializable' ],

  properties: [
    {
      class: 'Boolean',
      name: 'horizontal'
    },
    {
      class: 'Array',
      type: 'foam.dao.Sink[]',
      name: 'args'
    }
  ],

  methods: [
    {
      name: 'setX',
      args: 'foam.lang.X x',
      javaCode: `
        super.setX(x);
        // Propagate context to child sinks
        if ( getArgs() != null ) {
          for ( int i = 0; i < getArgs().length; i++ ) {
            if ( getArgs()[i] instanceof foam.lang.FObject ) {
              ((foam.lang.FObject)getArgs()[i]).setX(x);
            }
          }
        }
      `
    },
    {
      name: 'put',
      code: function(obj, s) {
        this.args.forEach(function(a) {
          a.put(obj, s);
        });
      },
      javaCode: `for ( int i = 0 ; i < getArgs().length ; i++ ) {
  getArgs()[i].put(obj, sub);
}`
    },
    {
      name: 'remove',
      code: function(obj, s) {
        this.args.forEach(function(a) { a.remove(obj, s); });
      },
      javaCode: `for ( int i = 0 ; i < getArgs().length ; i++ ) {
  getArgs()[i].remove(obj, sub);
}`
    },
    {
      name: 'reset',
      code: function(s) {
        this.args.forEach(function(a) { a.reset(s); });
      },
      javaCode: `for ( int i = 0 ; i < getArgs().length ; i++ ) {
  getArgs()[i].reset(sub);
}`
    },
    function toString() {
      return 'SEQ(' + this.args.map(function(a) { return a.toString(); }).join(',') + ')';
    },
    function addToE(e) {
      var self = this;
      if ( this.horizontal ) {
        e.start('span').style({display:'flex'}).call(function() {
          self.args.forEach(a => e.start('span').style({padding: '8px'}).add(a));
        });
      } else {
        this.args.forEach(a => e.start('div').add(a));
      }
    },

    function toProperties() {
      var allProps     = this.args.map(a => a.toProperties ? a.toProperties() : a.VALUE).flat();
      var nameCount    = {};
      var renamedProps = [];

      // Track name usage and rename duplicates
      allProps.forEach(prop => {
        if ( ! prop || ! prop.name ) {
          renamedProps.push(prop);
          return;
        }

        var originalName = prop.name;
        if ( nameCount[originalName] ) {
          // This name already exists, create a unique version
          nameCount[originalName]++;
          var newProp = prop.clone ? prop.clone() : foam.util.clone(prop);
          newProp.name = originalName + '_' + nameCount[originalName];
          newProp.label = foam.String.labelize(newProp.name);
          renamedProps.push(newProp);
        } else {
          // First occurrence of this name
          nameCount[originalName] = 1;
          renamedProps.push(prop);
        }
      });

      return renamedProps;
    },

    function setPropertyValues(o, sink, ps) {
      // Check if we're in multi-row context (flag set by parent GroupBy)
      var inMultiRowContext = o.__multiRowContext__ === true;
      // Also check if id/row are set (DAO context)
      var isDAOContext = ! inMultiRowContext && (o.id !== undefined || o.row !== undefined);
      console.log('[Sequence] setPropertyValues called, multiRowContext:', inMultiRowContext, ', o.id:', o.id, ', o.row:', o.row, ', isDAOContext:', isDAOContext);

      // Helper to unwrap wrapper sinks
      var unwrapSink = function(s) {
        var maxDepth = 10;
        var depth = 0;
        while ( s && s.delegate && depth < maxDepth ) {
          s = s.delegate;
          depth++;
        }
        return s;
      };

      // Helper to recursively check for GroupBy
      var hasNestedGroupBy = function(s) {
        var unwrapped = unwrapSink(s);
        if ( foam.mlang.sink.GroupBy && foam.mlang.sink.GroupBy.isInstance(unwrapped) ) {
          return true;
        }
        if ( foam.mlang.sink.Sequence && foam.mlang.sink.Sequence.isInstance(unwrapped) && unwrapped.args ) {
          for ( var i = 0; i < unwrapped.args.length; i++ ) {
            if ( hasNestedGroupBy(unwrapped.args[i]) ) {
              return true;
            }
          }
        }
        return false;
      };

      // Check if any child is a GroupBy
      var hasGroupBy = false;
      if ( sink.args ) {
        for ( var i = 0; i < sink.args.length; i++ ) {
          if ( hasNestedGroupBy(sink.args[i]) ) {
            hasGroupBy = true;
            break;
          }
        }
      }

      // If not in DAO context and has GroupBy, collect rows from GroupBy
      if ( ! isDAOContext && hasGroupBy ) {
        console.log('[Sequence] Sequence context with GroupBy - generating multiple rows');
        var allRows = null;
        var propIndex = 0;

        for ( var i = 0 ; i < this.args.length ; i++ ) {
          var arg = sink.args[i];
          var argProps = arg.toProperties ? arg.toProperties() : [{ name: 'value' }];
          var propsForArg = [];

          if ( argProps && Array.isArray(argProps) ) {
            for ( var j = 0 ; j < argProps.length ; j++ ) {
              if ( propIndex < ps.length ) {
                propsForArg.push(ps[propIndex]);
                propIndex++;
              }
            }
          } else {
            if ( propIndex < ps.length ) {
              propsForArg.push(ps[propIndex]);
              propIndex++;
            }
          }

          if ( arg.setPropertyValues ) {
            var result = arg.setPropertyValues(o, sink.args[i], propsForArg);
            // Check if the unwrapped sink.args[i] (the actual instance) is a GroupBy
            var unwrappedSinkArg = unwrapSink(sink.args[i]);
            console.log('[Sequence] arg.setPropertyValues returned:', result, ', unwrapped sink type:', unwrappedSinkArg.cls_ ? unwrappedSinkArg.cls_.id : 'unknown');
            if ( result && Array.isArray(result) && foam.mlang.sink.GroupBy.isInstance(unwrappedSinkArg) ) {
              console.log('[Sequence] GroupBy returned', result.length, 'rows');
              allRows = result;
            }
          } else {
            if ( allRows ) {
              allRows.forEach(row => {
                for ( var k = 0 ; k < propsForArg.length ; k++ ) {
                  propsForArg[k].set(row, arg.value);
                }
              });
            } else {
              for ( var k = 0 ; k < propsForArg.length ; k++ ) {
                propsForArg[k].set(o, arg.value);
              }
            }
          }
        }

        console.log('[Sequence] Returning', allRows ? allRows.length : 0, 'rows');
        return allRows;
      } else {
        // DAO context or no GroupBy - normal behavior
        var propIndex = 0;
        for ( var i = 0 ; i < this.args.length ; i++ ) {
          var arg = sink.args[i];
          var argProps = arg.toProperties ? arg.toProperties() : [{ name: 'value' }];
          var propsForArg = [];

          if ( argProps && Array.isArray(argProps) ) {
            for ( var j = 0 ; j < argProps.length ; j++ ) {
              if ( propIndex < ps.length ) {
                propsForArg.push(ps[propIndex]);
                propIndex++;
              }
            }
          } else {
            if ( propIndex < ps.length ) {
              propsForArg.push(ps[propIndex]);
              propIndex++;
            }
          }

          if ( arg.setPropertyValues ) {
            arg.setPropertyValues(o, sink.args[i], propsForArg);
          } else {
            for ( var k = 0 ; k < propsForArg.length ; k++ ) {
              propsForArg[k].set(o, arg.value);
            }
          }
        }
        return null;
      }
    }
  ]
});

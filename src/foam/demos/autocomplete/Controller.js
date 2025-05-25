foam.CLASS({
  package: 'foam.demos.autocomplete',
  name: 'Controller',
  extends: 'foam.u2.Controller',

  requires: [ 'foam.parse.QueryParser' ],

  properties: [
    {
      class: 'String',
      name: 'query',
      onKey: true
    },
    {
      name: 'parser',
      factory: function() {
        return this.QueryParser.create({of: foam.util.Timer});
      }
    },
    {
      name: 'predicate',
      expression: function(query) {
        console.log('parsing:', query);
        var ps = this.parser.parseString(query);
        return ps || null;
      }
    },
    {
      class: 'String',
      name: 'result',
      expression: function(predicate) {
        console.log('predicate:', predicate);
        return predicate ? predicate.toString() : 'error'
      }
    }
  ],

  methods: [
    function render() {
      this.add(this.QUERY.__).br();
      this.add(this.RESULT.__);
    }
  ]

});

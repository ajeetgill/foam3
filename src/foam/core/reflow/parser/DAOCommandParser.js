/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// TODO: historyParser doesn't update when history changes
foam.CLASS({
  package: 'foam.core.reflow.parse',
  name: 'DAOCommandParser',
  extends: 'foam.parse.Grammar',

  requires: [
    'foam.core.reflow.parser.DAONameParser',
    'foam.core.reflow.parser.SinkParser',
    'foam.parse.Parsers',
    'foam.parse.SimpleQueryParser'
  ],

  properties: [
    {
      name: 'daoNameParser',
      factory: function() { return this.DAONameParser.create(); }
    },
    {
      name: 'sinkParser',
      factory: function() { return this.SinkParser.create(); }
    }
  ],

  methods: [
    async function aInit() {
      await this.daoNameParser.aInit();
      await this.sinkParser.aInit();
    },

    function grammar(alt, eof, seq0, seq, seq1, str, sug, substring, sym, repeat, repeat0, anyChar, optional, notChars, literal, range, not, until0, literalIC) {
      return {
        START: sym('cmd'),

        cmd: seq(
          ' ',
          sym('dao'),
//          optional(sym('labelClause')),
//          optional(sym('orderClause')),
//          optional(sym('columnsClause')),
          optional(sym('skipClause')),
          optional(sym('limitClause')),
          optional(sym('whereClause')),
          optional(sym('toClause'))
        ),

        dao: this.daoNameParser,

        skipClause: seq1(2,
          sug(literalIC(' skip'), {text: ' SKIP', prependSpaceOnSelect: false}),
          ' ',
          sym('number')),

        limitClause: seq1(2,
          sug(literalIC(' limit'), {text: ' LIMIT', prependSpaceOnSelect: false}),
          ' ',
          sym('number')),

        whereClause: seq1(2,
          sug(literalIC(' where'), {text: ' WHERE', prependSpaceOnSelect: false}),
          ' ',
          substring(sym('query'))),

        toClause: seq1(2,
          sug(literalIC(' to'), {text: ' TO', prependSpaceOnSelect: false}),
          ' ',
          sym('sink')),

        query: seq1(0), // placeholder, filled in when the dao name is parsed

        sink: this.sinkParser,

        number: str(repeat(range('0', '9'), null, 1))
      };
    },

    function numberAction(v) {
      return parseInt(v);
    },

    function STARTAction(a) {
      debugger;
      let m = { daoKey: a[1] };

      if ( a[2] ) m.skip   = a[2];
      if ( a[3] ) m.limit  = a[3];
      if ( a[4] ) m.aql    = a[4];
      if ( a[5] ) m.select = a[5];
      return m;
    },

    function daoAction(daoName) {
      let dao    = this.__context__[daoName];
      let sym    = this.getSymbol('query');
      let parser = this.SimpleQueryParser.create({of: dao.of});

      sym.args[0] = parser;

      return daoName;
    }
  ]
});

/*

        parser = this.ParserWithAction.create({
          p: parser,
          action: v => {
            let key = 'query__' + v;
            if ( ! this.symbolMap_[key] ) {
              let dao = this.__context__[v];
              this.addSymbol(key, this.SimpleQueryParser.create({of: dao.of}));
              // TODO: this shouldn't be needed, just setting this.symbolMap_ = undefined
              // should work but it doesn't.
              this.symbolMap_ = this.SYMBOL_MAP_.expression(this.symbols);
            }
            return v;
          }
        });

        parser = p.seq(
          parser,
          p.optional(p.seq(' ', p.sym('where'), ' ', p.sym('query__' + c.id))),
          p.optional(p.seq(' ', p.sym('to'),    ' ', p.sym('agentName')))
        );
*/

/*
    function xxxdaoNameAction(v) {
      console.log('***** daoName ', v, this.__context__[v]);
      let key = 'query:' + v;
      if ( ! this.symbolMap_[key] )
        this.symbolMap_[key] = this.SimpleQueryParser.create({of: dao.of});
      return v;
      }
      */

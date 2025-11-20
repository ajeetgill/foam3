/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.parse',
  name: 'SimpleJavaScriptParser',

  documentation: 'A simple JavaScript expression parser for basic field operations with autocomplete support',

  requires: [
    'foam.parse.Alternate',
    'foam.parse.ImperativeGrammar',
    'foam.parse.Literal',
    'foam.parse.Parsers',
    'foam.parse.Suggest'
  ],

  axioms: [
    foam.pattern.Multiton.create({property: 'of'})
  ],

  properties: [
    {
      class: 'Class',
      name: 'of',
      documentation: 'The model class that defines available fields'
    },
    {
      name: 'grammar_',
      factory: function() {
        const self = this;
        const cls = this.of;
        const fields = [];
        const properties = cls ? cls.getAxiomsByClass(foam.lang.Property) : [];

        console.log('[SimpleJavaScriptParser] Building grammar for model:', cls && cls.id);
        console.log('[SimpleJavaScriptParser] Found properties:', properties.length);

        // Build field list from model properties with suggestions
        for ( var i = 0; i < properties.length; i++ ) {
          var prop = properties[i];
          console.log('[SimpleJavaScriptParser] Adding field suggestion:', prop.name);
          var lit = this.Literal.create({
            s: prop.name,
            value: prop.name
          });
          // Wrap with Suggest to provide autocomplete
          var suggestParser = this.Suggest.create({
            p: lit,  // ParserDecorator expects 'p' not 'parser'
            suggestion: { text: prop.name, label: prop.name, category: 'property' }
          });
          console.log('[SimpleJavaScriptParser] Created suggest parser:', suggestParser);
          fields.push(suggestParser);
        }

        console.log('[SimpleJavaScriptParser] Total field suggestions:', fields.length);

        // Sort fields by length (longest first) then alphabetically
        fields.sort(function(a, b) {
          var aText = a.suggestion.text;
          var bText = b.suggestion.text;
          var c = foam.util.compare(bText.length, aText.length);
          if ( c ) return c;
          return foam.util.compare(aText, bText);
        });

        var base = foam.Function.withArgs(
          this.baseGrammar_,
          this.Parsers.create(), this);

        var grammar = {
          __proto__: base
        };

        // Create fieldname parser - if no fields, use the word parser from base
        if ( fields.length > 0 ) {
          grammar.fieldname = this.Alternate.create({args: fields});
        }
        // else fieldname will inherit from base.fieldname which is base.word

        var g = this.ImperativeGrammar.create({
          symbols: grammar
        });

        g.addActions({
          field: function(v) { return v; },
          string: function(v) { return v; },
          number: function(v) { return v[0] == null ? parseInt(v[1].join("")) : -parseInt(v[1].join("")); }
        });

        return g;
      }
    },
    {
      name: 'baseGrammar_',
      value: function(alt, anyChar, eof, join, literal, literalIC, not, notChars, optional, range,
        repeat, repeat0, seq, seq1, str, sym, until) {
        return {
          START: sym('expr'),

          expr: alt(sym('string'), sym('field'), sym('number')),

          field: sym('fieldname'),

          string: str(seq1(1, '"', repeat(alt(literal('\\"', '"'), notChars('"'))), '"')),

          number: seq(optional(literal('-')), repeat(range('0', '9'), null, 1)),

          fieldname: sym('word'),

          word: str(repeat(alt(range('a', 'z'), range('A', 'Z'), range('0', '9'), '_'), null, 1))
        };
      }
    }
  ],

  methods: [
    function parseString(str, opt_name) {
      console.log('[SimpleJavaScriptParser] parseString called with:', str);
      console.log('[SimpleJavaScriptParser] Grammar:', this.grammar_);
      var result = this.grammar_.parseString(str, opt_name);
      console.log('[SimpleJavaScriptParser] Parse result:', result);
      return result;
    }
  ]
});

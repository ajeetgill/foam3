/**
 * @license
 * Copyright 2026 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.markdown',
  name: 'GlossaryTerm',

  documentation: 'A term with its definition for glossary lookup.',

  properties: [
    {
      class: 'String',
      name: 'term',
      required: true
    },
    {
      class: 'String',
      name: 'definition',
      required: true
    },
    {
      class: 'String',
      name: 'source',
      documentation: 'Optional source or reference for the definition.'
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.markdown',
  name: 'GlossaryTermView',
  extends: 'foam.u2.View',

  documentation: `
    Displays a hyperlinked term that shows a popup definition on click.
    Usage: tag('foam.doc.GlossaryTermView', { data: glossaryTermInstance })
    Or with inline props: tag('foam.doc.GlossaryTermView', { term: 'API', definition: '...' })
  `,

  imports: [
    'document'
  ],

  css: `
    ^ {
      display: inline;
    }

    ^term {
      color: #0066cc;
      text-decoration: underline;
      text-decoration-style: dotted;
      cursor: pointer;
      position: relative;
    }

    ^term:hover {
      color: #004499;
    }

    ^popup {
      position: absolute;
      z-index: 1000;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 12px 16px;
      max-width: 320px;
      min-width: 200px;
      font-size: 14px;
      line-height: 1.5;
    }

    ^popup-header {
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid #eee;
    }

    ^popup-definition {
      color: #555;
    }

    ^popup-source {
      margin-top: 8px;
      font-size: 12px;
      color: #888;
      font-style: italic;
    }

    ^popup-close {
      position: absolute;
      top: 8px;
      right: 10px;
      cursor: pointer;
      color: #999;
      font-size: 16px;
      line-height: 1;
    }

    ^popup-close:hover {
      color: #333;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'term',
      attribute: true,
      expression: function(data) {
        return data?.term || '';
      }
    },
    {
      class: 'String',
      name: 'definition',
      attribute: true,
      expression: function(data) {
        return data?.definition || '';
      }
    },
    {
      class: 'String',
      name: 'source',
      attribute: true,
      expression: function(data) {
        return data?.source || '';
      }
    },
    {
      class: 'Boolean',
      name: 'showPopup',
      value: false
    },
    {
      name: 'popupE_',
      documentation: 'Reference to the popup element for positioning.'
    }
  ],

  methods: [
    function render() {
      var self = this;

      this.
        addClass().
        start('span').
          addClass(this.myClass('term')).
          add(this.term$).
          on('click', this.togglePopup).
        end().
        add(this.slot(function(showPopup) {
          if ( ! showPopup ) return null;
          return self.E().
            addClass(self.myClass('popup')).
            call(function() { self.popupE_ = this; }).
            start('span').
              addClass(self.myClass('popup-close')).
              add('×').
              on('click', self.closePopup).
            end().
            start('div').
              addClass(self.myClass('popup-header')).
              add(self.term$).
            end().
            start('div').
              addClass(self.myClass('popup-definition')).
              add(self.definition$).
            end().
            callIf(self.source, function() {
              this.start('div').
                addClass(self.myClass('popup-source')).
                add('— ', self.source$).
              end();
            });
        }));
    },

    function positionPopup() {
      if ( ! this.popupE_?.el_() ) return;

      var popup = this.popupE_.el_();
      var rect = popup.getBoundingClientRect();
      var viewportWidth = window.innerWidth;
      var viewportHeight = window.innerHeight;

      // Adjust horizontal position if overflowing
      if ( rect.right > viewportWidth ) {
        popup.style.left = 'auto';
        popup.style.right = '0';
      }

      // Adjust vertical position if overflowing
      if ( rect.bottom > viewportHeight ) {
        popup.style.top = 'auto';
        popup.style.bottom = '100%';
        popup.style.marginBottom = '4px';
      }
    }
  ],

  listeners: [
    function togglePopup(e) {
      e.stopPropagation();
      this.showPopup = ! this.showPopup;

      if ( this.showPopup ) {
        // Position after render
        this.onDetach(this.document.addEventListener('click', this.onDocumentClick));
        setTimeout(() => this.positionPopup(), 0);
      }
    },

    function closePopup() {
      this.showPopup = false;
    },

    function onDocumentClick(e) {
      // Close if clicking outside
      if ( this.showPopup && this.popupE_?.el_() && ! this.popupE_.el_().contains(e.target) ) {
        this.closePopup();
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.markdown',
  name: 'Glossary',
  extends: 'foam.u2.Controller',

  documentation: 'A collection of glossary terms with lookup and rendering utilities.',

  properties: [
    {
//      class: 'Map',
      name: 'terms',
      documentation: 'Map of term name to GlossaryTerm object.',
      factory: function() { return {}; }
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      this.start('h1').add('Glossary').end();

      this.addTerm('DAO', 'A Data Access Object.');
      this.addTerm('FOAM', 'The Feature Oriented Active Modeller framework.');

      var self = this;
      var keys = Object.keys(this.terms).sort();

      keys.forEach(function(key) {
        var term = self.terms[key];
        self.start('div').
          addClass(self.myClass('entry')).
          start('dt').add(term.term).end().
          start('dd').
            add(term.definition).
            callIf(term.source, function() {
              this.start('span').
                addClass(self.myClass('source')).
                add(' — ', term.source).
              end();
            }).
            end().
          end();
      });
    },

    function addTerm(term, definition, source) {
      this.terms[term.toLowerCase()] = foam.u2.markdown.GlossaryTerm.create({
        term: term,
        definition: definition,
        source: source
      });
      return this;
    },

    function lookup(term) {
      return this.terms[term.toLowerCase()];
    },

    function termView(term) {
      /** Returns a GlossaryTermView for embedding in documents. */
      var t = this.lookup(term);
      if ( ! t ) {
        console.warn('Glossary term not found:', term);
        return foam.u2.Element.create().add(term);
      }
      return foam.doc.GlossaryTermView.create({ data: t });
    }
  ]
});

foam.SCRIPT({
  package: 'foam.u2.markdown',
  name: 'GlossaryTagScript',
  code: function() {
    foam.__context__.registerElement(foam.u2.markdown.Glossary);
  }
});

/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
    package: 'foam.u2.view',
    name: 'MultiSelectView',
    extends: 'foam.u2.View',
    flags: ['web'],
    

    documentation: `
        The choices are in [value, label, isSelected ] quartets.

        However the client can simply pass in [value, label] and it will adapt to a [value, label, isSelected, choiceMode ] format


        Calling the following methods:

        MultiChoiceView.data will be automatically set to a predicated dao based on the choices selected only if
        the minSelected, maxSelected criteria is respected, it will be foam.dao.NullDAO othrewise
    `,

    css: `
    ^input-container {
        padding: 10px;
        border: 1px solid $grey400;
        cursor: pointer;
        min-width: 400px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: $white;
        color: $surface-neutral-darker;
        border-radius: 4px;
    }
    ^select-modal {
        background: $white!important;
        color: $black !important;
        opacity: 1 !important;
        border: 1px solid $grey400;
        box-shadow: none !important;
        border-radius: 4px;
        margin-top: 5px;
    }
    ^choices-holder {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        line-height: 1.2;
        padding: 5px;
    }
    ^input-holder {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: $black;
        width: 100%;
    }
    ^checkbox-input {
        -webkit-appearance: none;
        appearance: none;
        border-radius: 2px;
        border: solid 1px $grey400;
        height: 1.275em;
        margin: 7px 0;
        padding: 0px;
        transition: background-color 140ms, border-color 140ms;
        width: 1.275em;
        flex-shrink: 0;
    }
    ^checkbox-input:checked {
        background-color: $primary500;
        border-color: $primary500;
    }
    ^checkbox-input:checked:disabled {
      border-color: $grey600;
      background-color: $grey600;
      fill: white;
    }
    ^checkbox-input:checked:after {
      position:relative;
      top: 1px;
      content: url("/images/checkmark-white.svg");
    }
    `,

    requires: [
        'foam.u2.PopupView'
    ],

    messages: [
        { name: 'OPTIONS_MSG', message: 'options' },
        { name: 'CHOOSE_1_OF_FOLLOWING_OPTIONS', message: 'Choose one of the following options' },
        { name: 'CHOOSE_AT_LEAST_1_OPTION', message: 'Choose at least one option' },
        { name: 'CHOOSE_AT_LEAST', message: 'Choose at least' },
        { name: 'CHOOSE_EXACTLY', message: 'Choose exactly' },
        { name: 'CHOOSE', message: 'Choose' }
    ],

    properties: [
        {
            name: 'placeholder'
        },
        {
            class: 'Function',
            name: 'onSelect'
        },
        {
            name: 'choices',
            documentation: `
                An array of choices which are single choice is denoted as [value, label, isFinal]
            `,
            factory: function() {
                return [];
            },
            adapt: function(old, nu) {
                if ( foam.Object.isInstance(nu) ) {
                  var out = [];
                  for ( var key in nu ) {
                    if ( nu.hasOwnProperty(key) ) out.push([ key, nu[key] ]);
                  }
                  return out;
                }
        
                nu = foam.Array.shallowClone(nu);
        
                // Upgrade single values to [value, value].
                for ( var i = 0; i < nu.length; i++ ) {
                  if ( ! Array.isArray(nu[i]) ) {
                    nu[i] = [ nu[i], nu[i] ];
                  }
                }
                return nu;
            }
        },
        {
            name: 'data',
            value: []
        },
    ],

    methods: [
        function render() {
            var self = this;

            this.start('button').addClass(this.myClass('input-container'))
                .start()
                    .add(this.placeholder ?? 'Options')
                .end()
                .start({
                    class: 'foam.u2.tag.Image',
                    data: '/images/chevron-down.svg',
                    embedSVG: true
                }).end()
            .end().on('click', this.createPopup)
        } 
    ],

    listeners: [
        function createPopup(e) {
            self = this;
            let selectCreateModal = this.PopupView.create({
                width: 400,
                x: 0,
                y: 0
            })
                .addClass(this.myClass('select-modal'))
                .start().addClass(this.myClass('choices-holder'))
                    .add(this.dynamic(function(choices, data) {
                        return choices.map(choice => {
                            var isSelected = data?.includes(choice[1]);
                            var inputId = 'u' + choice.$UID;
                            console.log('self.data ==>', self.data)
                            this
                                .start().addClass(self.myClass('input-holder'))
                                    .start('input', {id: inputId}).addClass(self.myClass('checkbox-input'))
                                        .attrs({
                                        type:     'checkbox',
                                        name:     self.getAttribute('name') + self.$UID,
                                        value:    choice[1],
                                        checked:  isSelected,
                                        label: choice[0]
                                        })
                                        .on('change', function (evt) {
                                            self.onSelect(choice[1]);
                                        })
                                    .end()
                                    .start('label')
                                        .attrs({for: inputId})
                                        .start('span')
                                            .add(choice[0])
                                        .end()
                                .end()
                            
                        });
                    }))
                .end()

            this.parentNode.add(selectCreateModal)
        }  
    ]
    
})
/**
 * @license
 * Copyright 2025 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ColorTokenRefinement',
  refines: 'foam.u2.ColorToken',

  properties: [
    {
      name: 'javaValue',
      expression: function(javaType, name, value, fallback) {
        return "new "+javaType+"(\""+name+"\",\""+value+"\",\""+fallback+"\");";
      }
    },
    {
      class: 'foam.java.JavaType',
      value: 'foam.u2.ColorToken'
    } // JavaType defines 'name' and other properties
  ],


  javaCode: `
  public ColorToken(String name, String value, String fallback) {
    setName(name);
    setValue(value);
    setFallback(fallback);
  }
  `,

  methods: [
    // function installInClass(cls) {
    //   this.SUPER(cls);
    //   let ax = this;
    //   ['hover', 'active', 'disabled'].forEach(a => {
    //     let n = `${ax.name}$${a}`;
    //     Object.defineProperty(
    //       cls,
    //       foam.String.constantize(n),
    //       {
    //         value: {
    //           name: n,
    //           value: function(e) { return e.LIGHTEN(e.TOKEN('$' + ax.name), ax[`${a}Modifier`]); },
    //           fallback: ax.fallback
    //         }
    //       }
    //     );
    //   });
    //   ['', 'hover', 'active', 'disabled'].forEach(a => {
    //     let n = a ? `${ax.name}$${a}$foreground` : ax.name + '$foreground';
    //     Object.defineProperty(
    //       cls,
    //       foam.String.constantize(n),
    //       {
    //         value: {
    //           name: n,
    //           value: function(e) { return e.FOREGROUND(e.TOKEN(a ? `$${ax.name}$${a}` : '$' + ax.name), e.TOKEN(ax.onLight), e.TOKEN(ax.onDark)); }
    //         }
    //       }
    //     );
    //   });
    // },

    function buildJavaClass(cls) {
      cls.constant({
        name: foam.String.constantize(this.name),
        type: this.javaType,
        value: this.javaValue,
        falback: this.fallback,
        documentation: this.documentation
      });
    }
  ]
});

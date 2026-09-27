/**
* @license
* Copyright 2026 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.test',
  name: 'CSSTokenVariantKeyJSTest',
  extends: 'foam.core.test.JSTest',

  documentation: `A CSSToken that declares a variants map must also say which
    axis it listens to (variantKey). Without the key the map is never read, so
    the token looks themed and silently renders its base value in every mode.
    Declaring one is an error at class load, not a no-op.`,

  methods: [
    function runTest(x) {
      var threw = null;
      try {
        foam.CLASS({
          package: 'foam.u2.test',
          name: 'CSSTokenVariantKeyBad_',
          extends: 'foam.u2.Element',
          cssTokens: [
            { name: 'panelBg', value: 'white', variants: { dark: { value: 'black' } } }
          ]
        });
        foam.u2.test.CSSTokenVariantKeyBad_.PANEL_BG;
      } catch (e) {
        threw = e;
      }
      x.test(!! threw, 'variants without variantKey throws at class load');
      x.test(!! threw && /panelBg/.test(threw.message) && /variantKey/.test(threw.message),
        'the error names the token and the missing field, got: ' + (threw && threw.message));

      threw = null;
      try {
        foam.CLASS({
          package: 'foam.u2.test',
          name: 'CSSTokenVariantKeyGood_',
          extends: 'foam.u2.Element',
          cssTokens: [
            { name: 'panelBg', value: 'white', variantKey: 'color', variants: { dark: { value: 'black' } } },
            { name: 'pad', value: '8px' }
          ]
        });
      } catch (e) {
        threw = e;
      }
      x.test(! threw, 'variants with variantKey loads, got: ' + (threw && threw.message));
      var G = foam.u2.test.CSSTokenVariantKeyGood_;
      var lightX = x.createSubContext({ theme: { activeVariants: {} } });
      var darkX  = x.createSubContext({ theme: { activeVariants: { color: 'dark' } } });
      x.test(foam.CSS.returnTokenValue('$panelBg', G, lightX) === 'white', 'light resolves the base value');
      x.test(foam.CSS.returnTokenValue('$panelBg', G, darkX) === 'black', 'dark resolves the dark variant');
      x.test(foam.CSS.returnTokenValue('$pad', G, darkX) === '8px', 'a token with no variants and no key is fine');
    }
  ]
});

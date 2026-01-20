/**
 * @license
 * Copyright 2026 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core.reflow.test',
  name: 'ColumnParserTest',
  extends: 'foam.core.test.JSTest',

  requires: [
    'foam.core.reflow.ColumnParser'
  ],

  methods: [
    async function runTest(x) {
      // Create a test model with various property names, shortNames, and aliases
      foam.CLASS({
        package: 'foam.core.reflow.test',
        name: 'TestModel',
        properties: [
          { name: 'id' },
          { name: 'firstName', shortName: 'fn' },
          { name: 'lastName', aliases: ['surname', 'familyName'] },
          { name: 'elementAttribute' },
          { name: 'parentChildValue' },
          { name: 'level1Level2Level3Value' },
          { name: 'aBc' },
          { name: 'emailAddress', shortName: 'email', aliases: ['mail', 'e_mail'] },
          { name: 'PTest' },
          { name: 'camelCaseTest' }
        ]
      });

      var parser = this.ColumnParser.create({
        of: foam.core.reflow.test.TestModel
      });

      // ============================================
      // PATH 1: Direct Case-Insensitive Lookup
      // ============================================

      // 1.1 Exact property name match
      x.test(
        parser.parseString('firstName')?.name === 'firstName',
        'Direct: Exact match - firstName'
      );
      x.test(
        parser.parseString('id')?.name === 'id',
        'Direct: Exact match - id (short name)'
      );
      x.test(
        parser.parseString('elementAttribute')?.name === 'elementAttribute',
        'Direct: Exact match - elementAttribute (multi-word camelCase)'
      );

      // 1.2 Case variations (no normalization needed)
      x.test(
        parser.parseString('FIRSTNAME')?.name === 'firstName',
        'Direct: Case insensitive - FIRSTNAME'
      );
      x.test(
        parser.parseString('FirstName')?.name === 'firstName',
        'Direct: Case insensitive - FirstName (PascalCase)'
      );
      x.test(
        parser.parseString('firstname')?.name === 'firstName',
        'Direct: Case insensitive - firstname (lowercase)'
      );
      x.test(
        parser.parseString('CAMELCASETEST')?.name === 'camelCaseTest',
        'Direct: Case insensitive - CAMELCASETEST'
      );
      x.test(
        parser.parseString('ID')?.name === 'id',
        'Direct: Case insensitive - ID'
      );

      // 1.3 ShortName lookup
      x.test(
        parser.parseString('fn')?.name === 'firstName',
        'Direct: ShortName exact - fn'
      );
      x.test(
        parser.parseString('FN')?.name === 'firstName',
        'Direct: ShortName uppercase - FN'
      );
      x.test(
        parser.parseString('email')?.name === 'emailAddress',
        'Direct: ShortName exact - email'
      );
      x.test(
        parser.parseString('EMAIL')?.name === 'emailAddress',
        'Direct: ShortName uppercase - EMAIL'
      );

      // 1.4 Alias lookup
      x.test(
        parser.parseString('surname')?.name === 'lastName',
        'Direct: Alias exact - surname'
      );
      x.test(
        parser.parseString('SURNAME')?.name === 'lastName',
        'Direct: Alias uppercase - SURNAME'
      );
      x.test(
        parser.parseString('familyName')?.name === 'lastName',
        'Direct: Alias camelCase - familyName'
      );
      x.test(
        parser.parseString('FAMILYNAME')?.name === 'lastName',
        'Direct: Alias uppercase - FAMILYNAME'
      );
      x.test(
        parser.parseString('mail')?.name === 'emailAddress',
        'Direct: Alias exact - mail'
      );
      x.test(
        parser.parseString('e_mail')?.name === 'emailAddress',
        'Direct: Alias with underscore - e_mail'
      );
      x.test(
        parser.parseString('E_MAIL')?.name === 'emailAddress',
        'Direct: Alias with underscore uppercase - E_MAIL'
      );

      // ============================================
      // PATH 2: Normalized Lookup
      // ============================================

      // 2.1 Underscore → camelCase
      x.test(
        parser.parseString('first_name')?.name === 'firstName',
        'Normalized: Underscore lowercase - first_name'
      );
      x.test(
        parser.parseString('FIRST_NAME')?.name === 'firstName',
        'Normalized: CONSTANT_CASE - FIRST_NAME'
      );
      x.test(
        parser.parseString('First_Name')?.name === 'firstName',
        'Normalized: Mixed case underscore - First_Name'
      );
      x.test(
        parser.parseString('element_attribute')?.name === 'elementAttribute',
        'Normalized: Two words underscore - element_attribute'
      );
      x.test(
        parser.parseString('Element_attribute')?.name === 'elementAttribute',
        'Normalized: Mixed case - Element_attribute'
      );
      x.test(
        parser.parseString('ELEMENT_ATTRIBUTE')?.name === 'elementAttribute',
        'Normalized: CONSTANT_CASE - ELEMENT_ATTRIBUTE'
      );
      x.test(
        parser.parseString('parent_child_value')?.name === 'parentChildValue',
        'Normalized: Three words underscore - parent_child_value'
      );
      x.test(
        parser.parseString('Parent_Child_Value')?.name === 'parentChildValue',
        'Normalized: Mixed three words - Parent_Child_Value'
      );
      x.test(
        parser.parseString('PARENT_CHILD_VALUE')?.name === 'parentChildValue',
        'Normalized: CONSTANT_CASE three words - PARENT_CHILD_VALUE'
      );
      x.test(
        parser.parseString('level1_level2_level3_value')?.name === 'level1Level2Level3Value',
        'Normalized: With numbers - level1_level2_level3_value'
      );
      x.test(
        parser.parseString('LEVEL1_LEVEL2_LEVEL3_VALUE')?.name === 'level1Level2Level3Value',
        'Normalized: CONSTANT_CASE with numbers - LEVEL1_LEVEL2_LEVEL3_VALUE'
      );

      // 2.2 Space → camelCase
      x.test(
        parser.parseString('first name')?.name === 'firstName',
        'Normalized: Space lowercase - first name'
      );
      x.test(
        parser.parseString('FIRST NAME')?.name === 'firstName',
        'Normalized: Space uppercase - FIRST NAME'
      );
      x.test(
        parser.parseString('First Name')?.name === 'firstName',
        'Normalized: Title case space - First Name'
      );
      x.test(
        parser.parseString('element attribute')?.name === 'elementAttribute',
        'Normalized: Two words space - element attribute'
      );
      x.test(
        parser.parseString('ELEMENT ATTRIBUTE')?.name === 'elementAttribute',
        'Normalized: Uppercase two words space - ELEMENT ATTRIBUTE'
      );
      x.test(
        parser.parseString('parent child value')?.name === 'parentChildValue',
        'Normalized: Three words space - parent child value'
      );
      x.test(
        parser.parseString('PARENT CHILD VALUE')?.name === 'parentChildValue',
        'Normalized: Uppercase three words space - PARENT CHILD VALUE'
      );

      // 2.3 Short segments (aBc property)
      x.test(
        parser.parseString('A_B_c')?.name === 'aBc',
        'Normalized: Short segments mixed - A_B_c'
      );
      x.test(
        parser.parseString('a_b_c')?.name === 'aBc',
        'Normalized: Short segments lowercase - a_b_c'
      );
      x.test(
        parser.parseString('A_B_C')?.name === 'aBc',
        'Normalized: Short segments uppercase - A_B_C'
      );
      x.test(
        parser.parseString('a b c')?.name === 'aBc',
        'Normalized: Short segments space - a b c'
      );
      x.test(
        parser.parseString('A B C')?.name === 'aBc',
        'Normalized: Short segments space uppercase - A B C'
      );

      // ============================================
      // EDGE CASES
      // ============================================

      // 3.1 Whitespace handling
      x.test(
        parser.parseString('  firstName  ')?.name === 'firstName',
        'Edge: Leading/trailing spaces trimmed'
      );
      x.test(
        parser.parseString('first  name')?.name === 'firstName',
        'Edge: Multiple spaces between words'
      );
      x.test(
        parser.parseString('  FIRST_NAME  ')?.name === 'firstName',
        'Edge: Spaces around underscore format'
      );
      x.test(
        parser.parseString('  FIRST NAME  ')?.name === 'firstName',
        'Edge: Spaces around space format'
      );

      // 3.2 Underscore edge cases
      x.test(
        parser.parseString('_firstName')?.name === 'firstName',
        'Edge: Leading underscore - _firstName'
      );
      x.test(
        parser.parseString('firstName_')?.name === 'firstName',
        'Edge: Trailing underscore - firstName_'
      );
      x.test(
        parser.parseString('first__name')?.name === 'firstName',
        'Edge: Consecutive underscores - first__name'
      );
      x.test(
        parser.parseString('__first__name__')?.name === 'firstName',
        'Edge: Multiple edge underscores - __first__name__'
      );
      x.test(
        parser.parseString('_element_attribute_')?.name === 'elementAttribute',
        'Edge: Underscores around - _element_attribute_'
      );

      // 3.3 Non-matching / Invalid
      x.test(
        parser.parseString('nonExistent') === undefined,
        'Invalid: Non-existent property returns undefined'
      );
      x.test(
        parser.parseString('') === undefined,
        'Invalid: Empty string returns undefined'
      );
      x.test(
        parser.parseString('   ') === undefined,
        'Invalid: Only spaces returns undefined'
      );
      x.test(
        parser.parseString('___') === undefined,
        'Invalid: Only underscores returns undefined'
      );
      x.test(
        parser.parseString('random_property_name') === undefined,
        'Invalid: Random underscore name returns undefined'
      );

      // ============================================
      // COLUMN LIST PARSING
      // ============================================

      // 4.1 Basic lists
      var list1 = parser.parseString('firstName, lastName', 'columnList');
      x.test(
        list1?.length === 2 && list1[0]?.name === 'firstName' && list1[1]?.name === 'lastName',
        'List: Simple comma-separated - firstName, lastName'
      );

      var list2 = parser.parseString('firstName,lastName', 'columnList');
      x.test(
        list2?.length === 2 && list2[0]?.name === 'firstName' && list2[1]?.name === 'lastName',
        'List: No spaces - firstName,lastName'
      );

      var list3 = parser.parseString('  firstName  ,  lastName  ', 'columnList');
      x.test(
        list3?.length === 2 && list3[0]?.name === 'firstName' && list3[1]?.name === 'lastName',
        'List: Extra whitespace -   firstName  ,  lastName  '
      );

      // 4.2 Mixed format lists
      var list4 = parser.parseString('firstName, LAST_NAME, element_attribute', 'columnList');
      x.test(
        list4?.length === 3 &&
        list4[0]?.name === 'firstName' &&
        list4[1]?.name === 'lastName' &&
        list4[2]?.name === 'elementAttribute',
        'List: Mixed formats - firstName, LAST_NAME, element_attribute'
      );

      var list5 = parser.parseString('FIRST NAME, LAST NAME', 'columnList');
      x.test(
        list5?.length === 2 && list5[0]?.name === 'firstName' && list5[1]?.name === 'lastName',
        'List: Space-separated names - FIRST NAME, LAST NAME'
      );

      var list6 = parser.parseString('fn, surname, email', 'columnList');
      x.test(
        list6?.length === 3 &&
        list6[0]?.name === 'firstName' &&
        list6[1]?.name === 'lastName' &&
        list6[2]?.name === 'emailAddress',
        'List: ShortNames and aliases - fn, surname, email'
      );

      var list7 = parser.parseString('ID, FIRST_NAME, ELEMENT ATTRIBUTE, a_b_c', 'columnList');
      x.test(
        list7?.length === 4 &&
        list7[0]?.name === 'id' &&
        list7[1]?.name === 'firstName' &&
        list7[2]?.name === 'elementAttribute' &&
        list7[3]?.name === 'aBc',
        'List: All format variations - ID, FIRST_NAME, ELEMENT ATTRIBUTE, a_b_c'
      );

      // ============================================
      // normalizeToPropertyName DIRECT TESTS
      // ============================================

      x.test(
        parser.normalizeToPropertyName(null) === null,
        'Normalize: null returns null'
      );
      x.test(
        parser.normalizeToPropertyName('') === '',
        'Normalize: empty string returns empty'
      );
      x.test(
        parser.normalizeToPropertyName('SimpleValue') === 'simpleValue',
        'Normalize: No separator - SimpleValue → simpleValue'
      );
      x.test(
        parser.normalizeToPropertyName('Element_attribute') === 'elementAttribute',
        'Normalize: Basic underscore - Element_attribute → elementAttribute'
      );
      x.test(
        parser.normalizeToPropertyName('A_B_C') === 'aBC',
        'Normalize: Short parts - A_B_C → aBC'
      );
      x.test(
        parser.normalizeToPropertyName('FIRST NAME') === 'firstName',
        'Normalize: Space separator - FIRST NAME → firstName'
      );
      x.test(
        parser.normalizeToPropertyName('_leading') === 'leading',
        'Normalize: Leading underscore - _leading → leading'
      );
      x.test(
        parser.normalizeToPropertyName('trailing_') === 'trailing',
        'Normalize: Trailing underscore - trailing_ → trailing'
      );
      x.test(
        parser.normalizeToPropertyName('multi__under') === 'multiUnder',
        'Normalize: Consecutive underscores - multi__under → multiUnder'
      );
      x.test(
        parser.normalizeToPropertyName('  spaced  ') === 'spaced',
        'Normalize: Multiple spaces - "  spaced  " → spaced'
      );
      x.test(
        parser.normalizeToPropertyName('CONSTANT_CASE_VALUE') === 'constantCaseValue',
        'Normalize: CONSTANT_CASE - CONSTANT_CASE_VALUE → constantCaseValue'
      );
      x.test(
        parser.normalizeToPropertyName('Mixed_CASE_value') === 'mixedCaseValue',
        'Normalize: Mixed case - Mixed_CASE_value → mixedCaseValue'
      );

      // ============================================
      // SPECIAL CASES (PTest property)
      // ============================================

      x.test(
        parser.parseString('PTest')?.name === 'PTest',
        'Special: PTest exact match'
      );
      x.test(
        parser.parseString('ptest')?.name === 'PTest',
        'Special: ptest lowercase'
      );
      x.test(
        parser.parseString('PTEST')?.name === 'PTest',
        'Special: PTEST uppercase'
      );
      x.test(
        parser.parseString('p_test')?.name === 'PTest',
        'Special: p_test underscore normalized'
      );
      x.test(
        parser.parseString('P_TEST')?.name === 'PTest',
        'Special: P_TEST CONSTANT_CASE'
      );
      x.test(
        parser.parseString('p test')?.name === 'PTest',
        'Special: p test space separated'
      );
      x.test(
        parser.parseString('P TEST')?.name === 'PTest',
        'Special: P TEST space uppercase'
      );
    }
  ]
});

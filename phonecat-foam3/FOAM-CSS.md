---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/foam-css/
---

# CSS in FOAM3: The Comprehensive Guide

FOAM3 has a unique and powerful approach to CSS styling that tightly integrates with its component system. This guide explains FOAM3's CSS system, its special syntax, and best practices for styling your FOAM3 applications.

## Core Concepts

### The `css` Property

In FOAM3, CSS is typically defined directly on a class using the `css` property:

```javascript
foam.CLASS({
  name: 'MyComponent',
  extends: 'foam.u2.Element',
  
  css: `
    ^ {
      display: flex;
      padding: 16px;
    }
    
    ^header {
      font-weight: bold;
      margin-bottom: 8px;
    }
  `
});
```

### Special CSS Selectors

FOAM3 uses special selectors in its CSS system:

1. **`^` (Caret)**: Represents the component's root element
   - `^` alone selects the root element
   - `^header` selects elements with the component's namespace plus 'header'
   
2. **`myClass()`**: A method that returns the component's CSS namespace
   - `this.myClass()` returns the base CSS class for the component
   - `this.myClass('header')` returns the namespaced class for a sub-element

## How FOAM3 CSS Works Behind the Scenes

When you define CSS in a FOAM3 class:

1. FOAM3 generates a unique CSS namespace for your component (e.g., `foam-u2-MyComponent`)
2. It replaces all `^` symbols with this namespace
3. It injects the CSS into the document
4. It provides the `myClass()` method to apply these namespaced classes

This approach solves CSS scoping issues without requiring complex build systems or Shadow DOM.

## CSS Application Examples

### Basic Component Styling

```javascript
foam.CLASS({
  name: 'UserCard',
  extends: 'foam.u2.Element',
  
  css: `
    ^ {
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 16px;
      max-width: 300px;
    }
    
    ^avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
    }
    
    ^name {
      font-size: 18px;
      font-weight: bold;
      margin: 8px 0;
    }
    
    ^role {
      color: #666;
    }
  `,
  
  methods: [
    function render() {
      this
        .addClass(this.myClass())  // Apply the base class
        .start('img')
          .addClass(this.myClass('avatar'))  // Apply the avatar class
          .attr('src', this.data.avatarUrl)
        .end()
        .start('div')
          .addClass(this.myClass('name'))
          .add(this.data.name)
        .end()
        .start('div')
          .addClass(this.myClass('role'))
          .add(this.data.role)
        .end();
    }
  ]
});
```

### State-Based Styling

You can also apply conditional classes based on component state:

```javascript
foam.CLASS({
  name: 'ToggleButton',
  extends: 'foam.u2.Element',
  
  css: `
    ^ {
      padding: 8px 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    ^active {
      background-color: #4285f4;
      color: white;
      border-color: #2a75f3;
    }
  `,
  
  properties: [
    {
      name: 'active',
      class: 'Boolean',
      value: false
    }
  ],
  
  methods: [
    function render() {
      this
        .addClass(this.myClass())
        .enableClass(this.myClass('active'), this.active$)  // Conditional class
        .on('click', () => this.active = !this.active)
        .add(this.active ? 'Active' : 'Inactive');
    }
  ]
});
```

Note the use of `enableClass`, which adds or removes a class based on a boolean property.

## Advanced CSS Features

### 1. Child Component Styling

You can style child components using nesting:

```javascript
foam.CLASS({
  name: 'ParentComponent',
  extends: 'foam.u2.Element',
  
  css: `
    ^ {
      padding: 16px;
    }
    
    ^ .foam-u2-TextField {
      border: 2px solid #4285f4;
    }
  `,
  
  methods: [
    function render() {
      this
        .addClass(this.myClass())
        .start(foam.u2.TextField)
          .attrs({placeholder: 'Enhanced text field'})
        .end();
    }
  ]
});
```

### 2. Global Theming

You can define global CSS variables and use them throughout your components:

```javascript
// Theme definition
foam.CLASS({
  name: 'AppTheme',
  
  css: `
    :root {
      --primary-color: #4285f4;
      --secondary-color: #34a853;
      --text-color: #202124;
      --background-color: #f8f9fa;
    }
  `
});

// Component using theme variables
foam.CLASS({
  name: 'ThemedButton',
  extends: 'foam.u2.Element',
  
  css: `
    ^ {
      background-color: var(--primary-color);
      color: white;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
    }
    
    ^:hover {
      background-color: var(--secondary-color);
    }
  `
});
```

### 3. CSS Tokens

FOAM3 supports two powerful approaches to using design tokens in CSS, making it easy to maintain consistent styling across your application:

#### Direct Token References with `$token` Syntax

FOAM3 provides a built-in token system that allows you to reference tokens directly in your CSS using a simple `$token` syntax (not using string interpolation):

```javascript
foam.CLASS({
  name: 'ProfileCard',
  extends: 'foam.u2.Element',
  
  css: `
    ^ {
      background-color: $grey50;
      border: 1px solid $grey200;
    }
    
    ^header {
      color: $primary400;
      font-weight: bold;
    }
    
    ^error {
      color: $destructive500;
    }
  `
});
```

Behind the scenes, FOAM3:

1. Looks for `$tokenName` patterns in CSS strings 
2. Resolves these tokens using the built-in `foam.u2.CSSTokens` class or any class-specific token definitions
3. Replaces tokens with their actual values when the CSS is installed
4. Even maintains a comment with the original token name for debugging: `/* $primary400 */ #0A4AC6`

The global tokens are defined in `foam.u2.CSSTokens` and include:

- Color palettes (blue, red, green, orange, purple, grey scales)
- Semantic colors (primary, destructive, success, warn)
- Sizing and spacing tokens
- Font definitions

#### Programmatic Tokens with JavaScript Template Literals

For more complex or computed token values, you can use JavaScript template literals:

```javascript
foam.CLASS({
  name: 'AppTokens',
  
  constants: {
    SPACING: {
      SMALL: '4px',
      MEDIUM: '8px',
      LARGE: '16px',
      XLARGE: '24px'
    },
    
    FONT_SIZE: {
      SMALL: '12px',
      MEDIUM: '14px',
      LARGE: '16px',
      XLARGE: '20px'
    }
  }
});

// Using tokens in a component
foam.CLASS({
  name: 'TokenizedComponent',
  extends: 'foam.u2.Element',
  
  requires: ['AppTokens'],
  
  css: function(AppTokens) {
    return `
      ^ {
        padding: ${AppTokens.SPACING.LARGE};
      }
      
      ^title {
        font-size: ${AppTokens.FONT_SIZE.XLARGE};
        margin-bottom: ${AppTokens.SPACING.MEDIUM};
      }
    `;
  }
});
```

#### Token Inheritance and Override

FOAM3's token system is hierarchical:

1. Global tokens are defined in `foam.u2.CSSTokens`
2. Application-specific tokens can override these
3. Tokens can reference other tokens (e.g., `'primary400': '$blue400'`)
4. The token resolution system handles recursive token references

## Best Practices

### 1. Keep CSS Simple and Component-Specific

Focus your CSS on the component itself. Avoid overly generic styles that might conflict with other components.

### 2. Use `enableClass` for State-Based Styling

Instead of manually adding and removing classes, use the `enableClass` method to bind classes to boolean properties.

```javascript
this.enableClass(this.myClass('disabled'), this.disabled$);
```

### 3. Organize CSS by Component Function

Within your CSS string, organize styles by component function:

```javascript
css: `
  /* Layout */
  ^ {
    display: flex;
    flex-direction: column;
  }
  
  /* Typography */
  ^title {
    font-size: 18px;
    font-weight: bold;
  }
  
  /* States */
  ^:hover {
    background-color: #f5f5f5;
  }
`
```

### 4. Use CSS Variables for Theming

Leverage CSS variables for consistent theming across components:

```javascript
css: `
  ^ {
    color: var(--text-color);
    background-color: var(--background-color);
  }
`
```

### 5. Use Media Queries for Responsive Design

FOAM3 CSS supports standard media queries:

```javascript
css: `
  ^ {
    flex-direction: column;
  }
  
  @media (min-width: 768px) {
    ^ {
      flex-direction: row;
    }
  }
`
```

## Comparison with Other CSS Approaches

| Feature | FOAM3 CSS | CSS Modules | Styled Components | Emotion |
|---------|-----------|-------------|-------------------|---------|
| Scoping | Automatic namespacing | Build-time scoping | Runtime scoping | Runtime scoping |
| Runtime overhead | Minimal | None | Some | Some |
| Build step required | No | Yes | No | No |
| CSS syntax | Standard + `^` | Standard | Template literals | Template literals |
| Dynamic styles | Yes | Limited | Yes | Yes |

## Common Gotchas and Solutions

### 1. Forgetting to Apply the Base Class

**Problem**: CSS styles don't apply because you forgot to add the base class.

```javascript
// Missing the base class
function render() {
  this
    // Missing .addClass(this.myClass())
    .start('div')
      .addClass(this.myClass('header'))
    .end();
}
```

**Solution**: Always apply the base class to the root element:

```javascript
function render() {
  this
    .addClass(this.myClass())  // Apply the base class
    .start('div')
      .addClass(this.myClass('header'))
    .end();
}
```

### 2. CSS Specificity Issues

**Problem**: Styles from parent components override your component styles.

**Solution**: Use more specific selectors or `!important` sparingly:

```javascript
css: `
  /* More specific selector */
  ^.some-parent-class {
    color: red !important;
  }
`
```

### 3. External Styling

**Problem**: You need to style FOAM3 components from external CSS.

**Solution**: Inspect the generated class names and target them:

```css
/* External CSS */
.foam-u2-MyComponent {
  border: 2px solid red;
}

.foam-u2-MyComponent-header {
  font-size: 24px;
}
```

## Conclusion

FOAM3's CSS system provides a powerful way to style components with proper scoping and without the need for complex build systems. By using the `^` symbol, the `myClass()` method, and other FOAM3-specific features, you can create beautifully styled applications with clean, maintainable code.

Remember that FOAM3's approach to CSS is designed to solve common styling problems in component-based applications, particularly CSS conflicts and specificity issues. By embracing this system, you'll create more maintainable and predictable UI code.

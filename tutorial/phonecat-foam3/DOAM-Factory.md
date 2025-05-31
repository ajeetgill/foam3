---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/factory/
---

# Default Values in FOAM3 Properties

In FOAM3, there are multiple ways to set default values for properties. The two primary mechanisms are `value` and `factory`.

## `value` vs `factory`

### Using `value`

The `value` property attribute sets a static default value that is shared across all instances of the class:

```javascript
foam.CLASS({
  name: 'Product',
  properties: [
    {
      name: 'category',
      class: 'String',
      value: 'Uncategorized'  // Static default value
    },
    {
      name: 'isAvailable',
      class: 'Boolean',
      value: true  // Static default value
    }
  ]
});
```

Key characteristics of `value`:
- Evaluated only once when the class is defined
- Same value is shared by all instances
- Simple and efficient for primitive values (strings, numbers, booleans)
- Best for immutable defaults

### Using `factory`

The `factory` attribute is a function that creates a new default value for each instance:

```javascript
foam.CLASS({
  name: 'User',
  properties: [
    {
      name: 'created',
      class: 'DateTime',
      factory: function() {
        return new Date();  // Dynamic default value
      }
    },
    {
      name: 'preferences',
      factory: function() {
        // Each user gets their own fresh preferences object
        return {
          theme: 'light',
          notifications: true,
          language: 'en'
        };
      }
    }
  ]
});
```

Key characteristics of `factory`:
- Evaluated lazily - only when the property is first accessed
- Creates a unique value for each instance
- Avoids sharing references to mutable objects
- Can use instance context (this) and other property values
- Perfect for dates, arrays, objects, and other reference types

## When to Use Each

Use `value` when:
- The default is a primitive (string, number, boolean)
- The same default should be shared across all instances
- Performance is critical (slightly faster)

Use `factory` when:
- The default is an object, array, or other reference type
- The default should be unique for each instance
- The default depends on instance state or time
- You want to defer creation until the property is accessed

## Common Pitfalls to Avoid

### Don't Use `value` with Mutable Objects

```javascript
// BAD PRACTICE - all instances will share the same array!
foam.CLASS({
  name: 'ShoppingCart',
  properties: [
    {
      name: 'items',
      value: []  // DON'T DO THIS
    }
  ]
});

// CORRECT APPROACH
foam.CLASS({
  name: 'ShoppingCart',
  properties: [
    {
      name: 'items',
      factory: function() {
        return [];  // Each instance gets its own array
      }
    }
  ]
});
```

### Property Dependencies in Factory

Factory functions can use `this` to access other properties of the instance:

```javascript
foam.CLASS({
  name: 'Product',
  properties: [
    {
      name: 'name',
      class: 'String'
    },
    {
      name: 'slug',
      class: 'String',
      factory: function() {
        // Generate a URL-friendly slug from the name
        return this.name.toLowerCase().replace(/\s+/g, '-');
      }
    }
  ]
});
```

## Related Concepts

### Expression

While `factory` creates a default value once, an `expression` creates a computed value that updates automatically:

```javascript
foam.CLASS({
  name: 'Product',
  properties: [
    {
      name: 'price',
      class: 'Float'
    },
    {
      name: 'taxRate',
      class: 'Float',
      value: 0.08
    },
    {
      name: 'priceWithTax',
      class: 'Float',
      expression: function(price, taxRate) {
        return price * (1 + taxRate);
      }
    }
  ]
});
```

When `price` or `taxRate` changes, `priceWithTax` is automatically recalculated.

### Property Initialization Order

Be careful with dependencies between properties in factories - properties are initialized in the order they appear in the class definition.

### Final Properties

The `final` attribute prevents a property from being changed after initialization:

```javascript
foam.CLASS({
  name: 'Document',
  properties: [
    {
      name: 'createdAt',
      class: 'DateTime',
      factory: function() { return new Date(); },
      final: true  // Cannot be changed once set
    }
  ]
});
```

This is often combined with `factory` to set an unchangeable timestamp or ID.

## Advanced Factory Patterns

### Singleton Factory

Create a singleton instance shared across the application:

```javascript
let configInstance;

foam.CLASS({
  name: 'AppConfig',
  properties: [
    {
      name: 'config',
      factory: function() {
        if (!configInstance) {
          configInstance = foam.json.parse({
            apiKey: 'your-api-key',
            endpoints: {
              users: '/api/users',
              products: '/api/products'
            }
          });
        }
        return configInstance;
      }
    }
  ]
});
```

### Lazy Loading with Promises

Factories can return Promises for asynchronous initialization:

```javascript
foam.CLASS({
  name: 'UserProfile',
  properties: [
    {
      name: 'preferences',
      factory: function() {
        return fetch('/api/user/preferences')
          .then(response => response.json());
      }
    }
  ]
});
```

## Best Practices

1. Use `factory` for all reference types (objects, arrays, dates)
2. Keep factory functions pure when possible
3. Document any side effects in factory functions
4. Consider using expressions for values that depend on other properties
5. Test both the default state and explicitly set values

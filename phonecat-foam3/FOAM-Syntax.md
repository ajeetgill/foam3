---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/foam-syntax/
---

# FOAM3 Syntax Guide

This guide covers FOAM3-specific syntax and concepts that you'll encounter throughout the tutorials. Understanding these foundational elements will help you read, write, and debug FOAM3 code more effectively.

## Core Syntax Elements

### `foam.CLASS()`

The primary way to define a class in FOAM3:

```javascript
foam.CLASS({
  package: 'com.example',
  name: 'MyClass',
  extends: 'foam.core.FObject',
  
  // Class body...
});
```

### Class Sections

FOAM3 classes are structured into distinct sections:

```javascript
foam.CLASS({
  package: 'com.example',
  name: 'MyClass',
  
  requires: [ /* Dependencies */ ],
  imports: [ /* Context imports */ ],
  exports: [ /* Context exports */ ],
  
  constants: { /* Constants */ },
  properties: [ /* Properties */ ],
  methods: [ /* Methods */ ],
  listeners: [ /* Event listeners */ ],
  actions: [ /* Actions */ ],
  
  // Other sections...
});
```

## Dependency Management

### `requires`

Imports other FOAM classes for use in this class:

```javascript
foam.CLASS({
  name: 'MyView',
  
  requires: [
    'foam.u2.TextField',    // Available as this.TextField
    'foam.u2.tag.Select',   // Available as this.Select
    'com.example.User as Person'  // Available as this.Person (aliased)
  ],
  
  methods: [
    function render() {
      // Use the required classes directly:
      this.start(this.TextField).end();
    }
  ]
});
```

### `imports`

Imports values from the context (dependency injection):

```javascript
foam.CLASS({
  name: 'UserProfile',
  
  imports: [
    'userDAO',                // Available as this.userDAO
    'currentUser',            // Available as this.currentUser
    'notify as showMessage'   // Available as this.showMessage (aliased)
  ],
  
  methods: [
    function loadData() {
      this.userDAO.find(this.currentUser.id).then(user => {
        // ...
        this.showMessage('User loaded');
      });
    }
  ]
});
```

### `exports`

Makes properties/methods available to child components:

```javascript
foam.CLASS({
  name: 'AppController',
  
  exports: [
    'userDAO',
    'currentTheme',
    'logout as performLogout'  // Export with an alias
  ],
  
  properties: [
    {
      name: 'userDAO',
      factory: function() {
        return foam.dao.EasyDAO.create({/* ... */});
      }
    },
    {
      name: 'currentTheme',
      value: 'light'
    }
  ],
  
  methods: [
    function logout() {
      // Logout implementation
    }
  ]
});
```

## Properties

Properties are a core concept in FOAM3, providing type safety, validation, and reactive capabilities:

```javascript
foam.CLASS({
  name: 'User',
  
  properties: [
    {
      name: 'id',
      class: 'String',
      required: true
    },
    {
      name: 'name',
      class: 'String',
      label: 'Full Name',
      validateObj: function(name) {
        if (name && name.length < 2) return 'Name is too short';
      }
    },
    {
      name: 'age',
      class: 'Int',
      value: 0
    }
  ]
});
```

### Property Types

FOAM3 provides many specialized property types:

```javascript
properties: [
  {
    name: 'name',
    class: 'String'        // String property
  },
  {
    name: 'age',
    class: 'Int'           // Integer property
  },
  {
    name: 'isActive',
    class: 'Boolean'       // Boolean property
  },
  {
    name: 'dateCreated',
    class: 'DateTime'      // Date/time property
  },
  {
    name: 'tags',
    class: 'StringArray'   // Array of strings
  },
  {
    name: 'user',
    class: 'FObjectProperty',  // Reference to another FOAM object
    of: 'com.example.User'     // Specifies the class
  },
  {
    name: 'userDAO',
    class: 'foam.dao.DAOProperty'  // Reference to a DAO
  },
  {
    name: 'role',
    class: 'Enum',              // Enumeration property
    of: 'com.example.UserRole'  // Reference to an enum class
  }
]
```

### Property Features

#### Default Values: `value` vs `factory`

```javascript
properties: [
  {
    name: 'count',
    class: 'Int',
    value: 0        // Static default value
  },
  {
    name: 'items',
    class: 'Array',
    factory: function() {
      return [];    // Dynamic default value, fresh for each instance
    }
  }
]
```

#### Derived Properties with `expression`

```javascript
properties: [
  { name: 'firstName', class: 'String' },
  { name: 'lastName', class: 'String' },
  {
    name: 'fullName',
    class: 'String',
    // Updates automatically when dependencies change
    expression: function(firstName, lastName) {
      return firstName + ' ' + lastName;
    }
  }
]
```

#### Property Lifecycle Methods

```javascript
properties: [
  {
    name: 'score',
    class: 'Int',
    
    // Called before value is changed
    preSet: function(old, nu) {
      return Math.max(0, Math.min(100, nu)); // Clamp between 0-100
    },
    
    // Called after value is changed
    postSet: function(old, nu) {
      if (nu >= 100) this.levelCompleted();
    }
  }
]
```

## Method Enhancements

### `this.SUPER()`

Calls the parent class's implementation of the current method:

```javascript
methods: [
  function init() {
    this.SUPER(); // Call parent class's init method first
    
    // Additional initialization
    this.loadData();
  }
]
```

### Method Overriding

```javascript
foam.CLASS({
  name: 'Animal',
  
  methods: [
    function makeSound() {
      return 'Generic animal sound';
    }
  ]
});

foam.CLASS({
  name: 'Dog',
  extends: 'Animal',
  
  methods: [
    function makeSound() {
      // Completely override the parent method
      return 'Woof!';
    }
  ]
});

foam.CLASS({
  name: 'GermanShepherd',
  extends: 'Dog',
  
  methods: [
    function makeSound() {
      // Extend the parent method
      return this.SUPER() + ' (but louder)';
    }
  ]
});
```

## Events and Listeners

### `listeners`

Event handlers with automatic `this` binding:

```javascript
foam.CLASS({
  name: 'LoginView',
  
  listeners: [
    function onSubmit(e) {
      e.preventDefault();
      this.login(this.username, this.password);
    },
    
    function onLoginSuccess() {
      this.redirect('/dashboard');
    }
  ],
  
  methods: [
    function render() {
      this
        .start('form')
          .on('submit', this.onSubmit)
        .end();
    }
  ]
});
```

### Pub/Sub Events

```javascript
// Publishing events
this.pub('userUpdated', user);

// Subscribing to events
this.sub('userUpdated', function(user) {
  this.refreshUserData(user);
});

// Unsubscribing
var subscription = this.sub('userUpdated', this.onUserUpdated);
subscription.detach(); // Unsubscribe
```

## Reactive Programming

### Slots

Slots are FOAM3's reactive programming primitives:

```javascript
// Creating a slot from a property
var nameSlot = user.name$;

// Two-way binding
this.TextField.create({ data$: nameSlot });

// One-way binding (read only)
this.add(nameSlot);

// Mapping a slot
var upperNameSlot = nameSlot.map(name => name.toUpperCase());

// Binding to a DOM element
this.start('div')
  .add(upperNameSlot)
.end();
```

### Reactive Templates

```javascript
foam.CLASS({
  name: 'UserCard',
  extends: 'foam.u2.Element',
  
  properties: [
    {
      name: 'data',
      class: 'FObjectProperty',
      of: 'com.example.User'
    }
  ],
  
  methods: [
    function render() {
      this
        .start('div')
          .start('h2')
            // Dynamic content - updates when data.name changes
            .add(this.data$.dot('name'))
          .end()
          .start('p')
            .add('Email: ')
            .add(this.data$.dot('email'))
          .end()
          // Conditional class - adds/removes based on boolean property
          .enableClass('premium-user', this.data$.dot('isPremium'))
        .end();
    }
  ]
});
```

## Meta-Programming

### Axioms

FOAM3 uses axioms for meta-programming:

```javascript
foam.CLASS({
  name: 'User',
  
  axioms: [
    // Add custom behavior to the class
    foam.pattern.Singleton.create(),
    
    // Custom index for a DAO
    foam.index.TreeIndex.create({
      propName: 'email'
    })
  ]
});

// Getting axioms programmatically
var axioms = MyClass.getAxioms();
var propertyAxioms = MyClass.getAxiomsByClass(foam.core.Property);
```

### Class Information

```javascript
// Get reference to class object
var cls = obj.cls_;

// Get class name
console.log(cls.name);

// Get all properties
var props = Object.values(cls.getAxiomsByClass(foam.core.Property));

// Check if an object is an instance of a class
if (foam.core.FObject.isInstance(obj)) {
  // It's a FOAM object
}

if (foam.typeOf(obj) === 'com.example.User') {
  // It's a User object
}
```

## CSS and UI

### CSS in FOAM3

```javascript
foam.CLASS({
  name: 'MyComponent',
  extends: 'foam.u2.Element',
  
  css: `
    ^ {
      padding: 10px;
      background: #f5f5f5;
    }
    
    ^header {
      font-weight: bold;
    }
  `,
  
  methods: [
    function render() {
      this
        .addClass(this.myClass())
        .start('div')
          .addClass(this.myClass('header'))
          .add('Header Text')
        .end();
    }
  ]
});
```

For detailed information on CSS in FOAM3, see the [FOAM CSS Guide](FOAM-CSS.md).

## Actions

Actions define operations that can be triggered by UI elements:

```javascript
foam.CLASS({
  name: 'TodoItem',
  
  properties: [
    {
      name: 'completed',
      class: 'Boolean'
    },
    {
      name: 'text',
      class: 'String'
    }
  ],
  
  actions: [
    {
      name: 'delete',
      label: 'Delete',
      code: function() {
        this.dao.remove(this);
      }
    },
    {
      name: 'complete',
      label: 'Mark as Complete',
      isEnabled: function(completed) {
        return !completed;
      },
      code: function() {
        this.completed = true;
      }
    }
  ]
});
```

## Multilingual Support (i18n)

```javascript
foam.CLASS({
  name: 'InternationalApp',
  
  messages: [
    { name: 'WELCOME', message: 'Welcome to our app!' },
    { name: 'GREETING', message: 'Hello, {name}!' }
  ],
  
  methods: [
    function render() {
      this
        .start('h1')
          .add(this.WELCOME)
        .end()
        .start('p')
          .add(foam.String.crunch(this.GREETING, { name: this.user.name }))
        .end();
    }
  ]
});
```

## Conclusion

This guide covers the most common FOAM3-specific syntax you'll encounter. For more detailed information on specific topics, refer to:

- [FOAM CSS Guide](FOAM-CSS.md)
- [Factory and Default Values](Factory.md)
- [DAO Decorators](DAO-Decorators.md)

FOAM3's syntax is designed to create a declarative, reactive programming model that reduces boilerplate code and improves code maintainability. By understanding these patterns, you'll be able to take full advantage of FOAM3's powerful features.

---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/4-advanced/
tutorial: 4
---

# **Advanced FOAM3 Features**

Now that you've built a basic FOAM3 application, it's time to explore some of the more powerful features that make FOAM3 a robust framework for complex applications. This section covers advanced techniques and patterns that will help you build more sophisticated applications.

## **What You'll Learn**
- Advanced property types and features
- Composition patterns for reusable components
- Context and dependency injection
- Optimization techniques for performance
- Advanced DAO patterns
- Custom UI components
- Authentication and security patterns

## **Advanced Property Types and Features**

FOAM3 includes many specialized property types beyond the basic ones we've already covered:

### **Factory Properties**

Factory properties allow lazy initialization of complex values:

```javascript
// File: my-foam3-app/js/models/Person.js

foam.CLASS({
  name: 'Person',
  
  properties: [
    {
      name: 'id',
      class: 'String',
      // Factory functions are only called when the property is accessed for the first time
      // This enables lazy initialization and prevents unnecessary computation
      factory: function() {
        // Generate a unique ID only when first accessed
        return 'person_' + Math.floor(Math.random() * 10000);
      }
    },
    {
      name: 'createdAt',
      class: 'DateTime',
      factory: function() {
        return new Date();
      }
    }
    // Note: Unlike default values, factories can produce different values
    // for each instance and can execute complex logic
  ]
});

// When we create a Person, the factory functions are NOT called yet
var person = Person.create();
console.log(person.id); // Generates ID on first access
```

### **Expression Properties**

Expression properties can derive their values from multiple other properties:

```javascript
// File: my-foam3-app/js/models/Invoice.js

foam.CLASS({
  name: 'Invoice',
  
  properties: [
    {
      name: 'items',
      class: 'Array',
      factory: function() { return []; }
    },
    {
      name: 'subtotal',
      class: 'Float',
      expression: function(items) {
        return items.reduce(function(sum, item) {
          return sum + (item.price * item.quantity);
        }, 0);
      }
    },
    {
      name: 'taxRate',
      class: 'Float',
      value: 0.07
    },
    {
      name: 'tax',
      class: 'Float',
      expression: function(subtotal, taxRate) {
        return subtotal * taxRate;
      }
    },
    {
      name: 'total',
      class: 'Float',
      // This expression creates a dependency chain:
      // items → subtotal → tax → total
      // Changing any item will update the entire chain
      expression: function(subtotal, tax) {
        return subtotal + tax;
      }
    }
  ]
});

// Create an invoice with some items
var invoice = Invoice.create({
  items: [
    { price: 10, quantity: 2 },
    { price: 15, quantity: 1 }
  ]
});

console.log(invoice.subtotal); // 35
console.log(invoice.tax); // 2.45
console.log(invoice.total); // 37.45
```

### **Custom Property Types**

You can create your own property types for reusable behavior:

```javascript
foam.CLASS({
  package: 'custom',
  name: 'CurrencyProperty',
  extends: 'Float',
  
  properties: [
    {
      name: 'currencySymbol',
      value: '$'
    }
  ],
  
  methods: [
    function formatValue(value) {
      return this.currencySymbol + value.toFixed(2);
    },
    
    // Parse a string input back to a number value
    // Handles user input like "$123.45" or "123.45"
    function fromString(str) {
      return parseFloat(str.replace(/[^0-9.-]/g, ''));  // Remove non-numeric characters
    }
  ]
});

// Register the property type
foam.CLASS({
  refines: 'foam.core.Property',
  properties: [
    {
      name: 'CurrencyProperty',
      value: 'custom.CurrencyProperty'
    }
  ]
});

// Use the custom property
foam.CLASS({
  name: 'Product',
  
  properties: [
    {
      name: 'price',
      class: 'Currency'  // Now we can use our custom property type
      // No need to specify package - the registration took care of that
    }
  ]
});

// Usage example:
// var product = Product.create({ price: 99.99 });
// console.log(product.price);  // Access the raw number: 99.99
// var formatted = product.PRICE.formatValue(product.price);  // "$99.99"
// product.price = product.PRICE.fromString("$123.45");  // Sets price to 123.45
```

## **Composition Patterns**

FOAM3 provides several ways to compose and reuse functionality across classes.

### **Traits (Mixins)**

Traits are a form of multiple inheritance that let you mix behavior into classes:

```javascript
// File: my-foam3-app/js/traits/Timestamped.js

// Define a reusable trait that can be mixed into any class
// Traits are similar to interfaces in other languages, but with implementation
foam.CLASS({
  package: 'traits',
  name: 'Timestamped',
  
  properties: [
    {
      name: 'createdAt',
      class: 'DateTime',
      factory: function() {
        return new Date();
      },
      final: true          // Once set, this value cannot be changed
    },
    {
      // Tracks when an object was last modified
      name: 'updatedAt',
      class: 'DateTime'
    }
  ],
  
  methods: [
    // Override init to set initial timestamps
    function init() {
      this.SUPER();         // Always call parent implementation first
      this.updatedAt = new Date();  // Set initial update time
    }
  ],
  
  listeners: [
    {
      // This listener can be attached to events to update the timestamp
      name: 'updateTimestamp',
      code: function() {
        this.updatedAt = new Date();
      }
    }
  ]
});

// File: my-foam3-app/js/models/User.js

// Use the trait in a concrete class
foam.CLASS({
  name: 'User',
  
  // The implements property adds all the trait's properties, methods, and listeners
  // Multiple traits can be implemented by adding more entries to this array
  implements: [
    'traits.Timestamped'
  ],
  
  properties: [
    'firstName',
    'lastName',
    'email'
  ],
  
  methods: [
    function init() {
      this.SUPER();  // This calls both User's parent init and Timestamped's init
      
      // Subscribe to the propertyChange event for ANY property
      // This automatically updates the timestamp whenever any property changes
      this.propertyChange.sub(this.updateTimestamp);
    }
  ]
});

// Usage example
var user = User.create();
console.log(user.createdAt); // Current time - from the Timestamped trait
console.log(user.updatedAt); // Same as createdAt initially

// If we change any property, the timestamp would update:
// user.firstName = 'John';  // This would trigger propertyChange and update updatedAt

// Wait a moment, then update a property
setTimeout(function() {
  user.firstName = 'John';
  console.log(user.updatedAt); // Updated time
}, 1000);
```

### **Refinements**

Refinements let you add or modify the behavior of existing classes:

```javascript
// File: my-foam3-app/js/models/Person.js

// Original class definition - could be in a core library or external dependency
foam.CLASS({
  name: 'Person',  // Note: no package specified, so it's in the global namespace
  
  properties: [
    'firstName',   // Simple property definitions using just the property name
    'lastName'     // These are equivalent to { name: 'lastName', class: 'String' }
  ]
});

// File: my-foam3-app/js/refinements/PersonRefinement.js

// Refinement - enhances an existing class WITHOUT modifying its original source code
// This is perfect for:
// 1. Adding features to third-party classes
// 2. Splitting large classes into multiple files
// 3. Adding app-specific behavior to framework classes
foam.CLASS({
  refines: 'Person',  // Instead of 'name', we use 'refines' to target an existing class
  
  // Add new properties to the Person class
  properties: [
    {
      name: 'fullName',
      expression: function(firstName, lastName) {
        return firstName + ' ' + lastName;
      }
    }
  ],
  
  // Add new methods to the Person class
  methods: [
    function sayHello() {
      return 'Hello, my name is ' + this.fullName;
    }
  ]
  
  // You can also add listeners, constants, or override existing methods
});

// Usage example
// Note that we're using the original Person class, but it now has the refined behavior
var person = Person.create({ firstName: 'John', lastName: 'Doe' });
console.log(person.fullName);    // "John Doe" - new expression property works
console.log(person.sayHello());  // "Hello, my name is John Doe" - new method works

// Key point: Refinements are applied globally at load time - all instances
// of the refined class will have the new behavior, even ones created elsewhere
```

### **Inheritance and Super Calls**

FOAM3 supports traditional inheritance with super calls:

```javascript
// File: my-foam3-app/js/models/Animal.js

// Define a base class with a method
foam.CLASS({
  name: 'Animal',  // Base class name
  
  methods: [
    // Basic implementation of the speak method
    function speak() {
      return 'Animal sound';
    }
  ]
});

// File: my-foam3-app/js/models/Dog.js

// Define a subclass that extends the base class
foam.CLASS({
  name: 'Dog',
  extends: 'Animal',  // This is the inheritance relationship
  
  methods: [
    // Override the speak method from the parent class
    function speak() {
      // Call the parent class implementation using SUPER()
      // SUPER() is a special keyword in FOAM that calls the parent method
      // It's similar to super.speak() in other languages
      return this.SUPER() + ' - Woof!';
    }
    
    // Note: You can also call SUPER() with arguments if needed:
    // this.SUPER(arg1, arg2)
  ]
});

// Usage example
var dog = Dog.create();
console.log(dog.speak()); // "Animal sound - Woof!"

// The inheritance chain can be as deep as needed:
// foam.CLASS({
//   name: 'Poodle',
//   extends: 'Dog',
//   methods: [
//     function speak() {
//       return this.SUPER() + ' (elegantly)';
//     }
//   ]
// });
```

## **Context and Dependency Injection**

FOAM3 has a powerful context system for dependency injection and service location.

### **Creating and Using Contexts**

```javascript
// Define services
foam.CLASS({
  name: 'Logger',
  
  methods: [
    function log(message) {
      console.log('[LOG]:', message);
    }
  ]
});

// Define a service that uses the logger
foam.CLASS({
  name: 'UserService',
  
  // The imports array specifies services this class needs from context
  imports: [
    'logger'  // This matches a property name in the context
  ],
  
  methods: [
    function getCurrentUser() {
      // The imported logger is available as this.logger
      this.logger.log('Getting current user');
      return { id: 1, name: 'John' };
    }
  ]
});

// Create a context object with our services
// A context is a map of name->service instances
var context = foam.createSubContext({
  logger: Logger.create()  // Register the logger service
});

// Create an object with the context
// The second parameter is the context to use
var userService = UserService.create({}, context);
userService.getCurrentUser(); // Logs: [LOG]: Getting current user
```

### **Exporting Services**

Classes can export their own services to child components:

```javascript
foam.CLASS({
  name: 'Application',
  
  requires: [
    'Logger'  // Makes Logger available as this.Logger
  ],
  
  // Export properties for child components to import
  exports: [
    'logger'  // Make logger available to any component created with this context
  ],
  
  properties: [
    {
      name: 'logger',
      // Create Logger instance lazily when first accessed
      factory: function() {
        return this.Logger.create();
      }
    }
  ]
});

foam.CLASS({
  name: 'Component',
  
  // Import services from the parent context
  imports: [
    'logger'  // Will be provided by any context that exports 'logger'
  ],
  
  methods: [
    function doSomething() {
      this.logger.log('Component did something');
    }
  ]
});

// Create the application which sets up the logger
var app = Application.create();
// Create a component with the application's context
// __subContext__ is the context that includes this object's exports
var component = Component.create({}, app.__subContext__);
component.doSomething(); // Uses the logger from Application
```

## **Optimization Techniques**

As your application grows, you may need to optimize for performance.

### **Lazy Loading**

Load components only when needed:

```javascript
// Define a component that's expensive to initialize
foam.CLASS({
  name: 'HeavyComponent',
  
  requires: [
    // Heavy dependencies would go here
  ],
  
  methods: [
    function init() {
      this.SUPER();
      console.log('Heavy component initialized');
    },
    
    function doSomething() {
      console.log('Heavy component doing work');
    }
  ]
});

// Create a wrapper that only loads the heavy component when needed
foam.CLASS({
  name: 'LazyLoader',
  
  properties: [
    {
      name: 'component',
      // Factory properties are perfect for lazy loading
      // This code only runs when component is first accessed
      factory: function() {
        console.log('Creating heavy component');
        return HeavyComponent.create();
      }
    }
  ],
  
  methods: [
    function useComponentIfNeeded(condition) {
      if (condition) {
        // Accessing this.component triggers the factory if not already created
        this.component.doSomething();
      } else {
        console.log('Component not needed');
      }
    }
  ]
});

// Demo of lazy loading behavior
var loader = LazyLoader.create();
loader.useComponentIfNeeded(false); // Outputs: "Component not needed"
loader.useComponentIfNeeded(true);  // Outputs: "Creating heavy component" followed by "Heavy component doing work"
```

### **Memoization**

Cache expensive calculations:

```javascript
foam.CLASS({
  name: 'Calculator',
  
  methods: [
    {
      name: 'fibonacci',
      // Recursive implementation of Fibonacci sequence
      // Without memoization, this would recalculate many values repeatedly
      code: function(n) {
        console.log('Computing fibonacci for', n);
        if (n <= 1) return n;
        return this.fibonacci(n - 1) + this.fibonacci(n - 2);
      },
      // Enable automatic caching of results based on parameters
      // FOAM will store results and reuse them for identical calls
      memoize: true
    }
  ]
});

// Demo of memoization behavior
var calc = Calculator.create();

// First call computes everything
console.log(calc.fibonacci(5)); // Logs computing for 5,4,3,2,1,0

// Second call uses cached results
// console.log(calc.fibonacci(5)); // No computation logs, returns immediately
console.log(calc.fibonacci(5)); // No logs, uses cached result
```

### **Property Validation and Type Checking**

FOAM3 can validate properties to catch errors early:

```javascript
foam.CLASS({
  name: 'ValidatedModel',
  
  properties: [
    {
      name: 'email',
      class: 'EMail',
      required: true,
      validateObj: function(email) {
        if (!email.includes('@')) {
          return 'Email must include @ symbol';
        }
      }
    },
    {
      name: 'age',
      class: 'Int',
      min: 0,
      max: 120,
      units: 'years'
    }
  ]
});

try {
  ValidatedModel.create({ email: 'invalid' });
} catch (e) {
  console.error(e.message); // Validation error
}
```

## **Advanced DAO Patterns**

FOAM3 provides sophisticated DAO patterns for managing data.

### **Sink Patterns**

Create custom sinks for processing query results:

```javascript
// Custom sink to calculate statistics
foam.CLASS({
  name: 'ProductStatsSink',
  extends: 'foam.dao.AbstractSink',
  
  properties: [
    {
      name: 'count',
      class: 'Int',
      value: 0
    },
    {
      name: 'priceSum',
      class: 'Float',
      value: 0
    },
    {
      name: 'minPrice',
      class: 'Float',
      value: Number.MAX_VALUE
    },
    {
      name: 'maxPrice',
      class: 'Float',
      value: 0
    }
  ],
  
  methods: [
    function put(product) {
      this.count++;
      this.priceSum += product.price;
      this.minPrice = Math.min(this.minPrice, product.price);
      this.maxPrice = Math.max(this.maxPrice, product.price);
    },
    
    function getAverage() {
      return this.count > 0 ? this.priceSum / this.count : 0;
    }
  ]
});

// Use the custom sink
productDAO
  .select(ProductStatsSink.create())
  .then(function(sink) {
    console.log('Count:', sink.count);
    console.log('Average Price:', sink.getAverage());
    console.log('Price Range:', sink.minPrice, 'to', sink.maxPrice);
  });
```

### **DAO Decorators**

Add behavior to DAOs without modifying them:

```javascript
// Authentication decorator
foam.CLASS({
  name: 'AuthenticatedDAO',
  extends: 'foam.dao.ProxyDAO',
  
  imports: [
    'authService'
  ],
  
  methods: [
    function find(id) {
      if (!this.authService.isAuthenticated()) {
        return Promise.reject(new Error('Not authenticated'));
      }
      return this.SUPER(id);
    },
    
    function select(sink, skip, limit, order, predicate) {
      if (!this.authService.isAuthenticated()) {
        return Promise.reject(new Error('Not authenticated'));
      }
      return this.SUPER(sink, skip, limit, order, predicate);
    },
    
    function put(obj) {
      if (!this.authService.isAuthenticated()) {
        return Promise.reject(new Error('Not authenticated'));
      }
      if (!this.authService.canWrite(obj)) {
        return Promise.reject(new Error('No write permission'));
      }
      return this.SUPER(obj);
    },
    
    function remove(obj) {
      if (!this.authService.isAuthenticated()) {
        return Promise.reject(new Error('Not authenticated'));
      }
      if (!this.authService.canDelete(obj)) {
        return Promise.reject(new Error('No delete permission'));
      }
      return this.SUPER(obj);
    }
  ]
});

// Usage
var securedDAO = AuthenticatedDAO.create({
  delegate: productDAO
}, authContext);
```

### **Composite DAOs**

Combine multiple data sources:

```javascript
// Cache remote data locally
var cachedProductDAO = foam.dao.CachingDAO.create({
  src: remoteProductDAO,
  cache: localProductDAO
});

// Union multiple DAOs
var allProductsDAO = foam.dao.UnionDAO.create({
  delegate: cachedProductDAO,
  secondary: legacyProductDAO
});
```

## **Custom UI Components**

Create reusable UI components for your application.

### **Building Custom Form Controls**

```javascript
foam.CLASS({
  package: 'ui.custom',
  name: 'RatingView',
  extends: 'foam.u2.View',
  
  css: `
    ^ {
      display: inline-flex;
      align-items: center;
    }
    
    ^star {
      color: #ddd;
      cursor: pointer;
      font-size: 24px;
      padding: 2px;
    }
    
    ^star.selected {
      color: gold;
    }
    
    ^star:hover {
      color: #ffcc00;
    }
  `,
  
  properties: [
    {
      name: 'data',
      class: 'Int',
      value: 0
    },
    {
      name: 'maxRating',
      value: 5
    }
  ],
  
  methods: [
    function render() {
      var self = this;
      
      this
        .addClass(this.myClass())
        .add(this.slot(function(data, maxRating) {
          var stars = this.E();
          
          for (var i = 1; i <= maxRating; i++) {
            stars
              .start('span')
                .addClass(self.myClass('star'))
                .enableClass('selected', i <= data)
                .add('★')
                .on('click', function(i) {
                  return function() {
                    self.data = i;
                  };
                }(i))
              .end();
          }
          
          return stars;
        }));
      
      return this;
    }
  ]
});

// Use the custom component
foam.CLASS({
  name: 'ProductReview',
  
  properties: [
    'product',
    {
      name: 'rating',
      class: 'Int',
      view: {
        class: 'ui.custom.RatingView'
      }
    },
    {
      name: 'comment',
      class: 'String',
      view: {
        class: 'foam.u2.view.TextArea',
        rows: 3
      }
    }
  ]
});
```

### **Responsive Components**

```javascript
foam.CLASS({
  package: 'ui.responsive',
  name: 'ResponsiveView',
  extends: 'foam.u2.View',
  
  requires: [
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit'
  ],
  
  imports: [
    'window'
  ],
  
  properties: [
    {
      name: 'breakpoint',
      value: 768
    },
    {
      name: 'isMobile',
      expression: function(width) {
        return width < this.breakpoint;
      }
    },
    {
      name: 'width',
      value: 1024
    }
  ],
  
  methods: [
    function init() {
      this.SUPER();
      
      // Listen for window resize
      this.onResize();
      this.window.addEventListener('resize', this.onResize);
    },
    
    function render() {
      return this
        .addClass(this.myClass())
        .add(this.slot(function(isMobile) {
          return isMobile ? this.renderMobile() : this.renderDesktop();
        }));
    },
    
    function renderMobile() {
      return this.E()
        .addClass(this.myClass('mobile'))
        .start('div')
          .addClass('mobile-content')
          // Mobile-specific content
        .end();
    },
    
    function renderDesktop() {
      return this.E()
        .addClass(this.myClass('desktop'))
        .start(this.Grid)
          // Desktop grid layout
          .start(this.GUnit, { columns: 4 })
            // Sidebar
          .end()
          .start(this.GUnit, { columns: 8 })
            // Main content
          .end()
        .end();
    }
  ],
  
  listeners: [
    function onResize() {
      this.width = this.window.innerWidth;
    }
  ]
});
```

## **Authentication and Security**

Implement authentication and security in your FOAM3 applications.

### **User Authentication**

```javascript
foam.CLASS({
  name: 'User',
  
  properties: [
    {
      name: 'id',
      class: 'String'
    },
    {
      name: 'email',
      class: 'EMail',
      required: true
    },
    {
      name: 'password',
      class: 'Password',
      hidden: true
    },
    {
      name: 'role',
      class: 'String',
      value: 'user' // 'user', 'admin', etc.
    }
  ]
});

foam.CLASS({
  name: 'AuthService',
  
  requires: [
    'User'
  ],
  
  imports: [
    'userDAO'
  ],
  
  exports: [
    'as authService',
    'currentUser$'
  ],
  
  properties: [
    {
      name: 'currentUser',
      class: 'FObjectProperty',
      of: 'User'
    },
    {
      name: 'token',
      class: 'String'
    }
  ],
  
  methods: [
    function login(email, password) {
      // Find the user by email
      return this.userDAO
        .where(foam.mlang.predicate.Eq.create({
          arg1: this.User.EMAIL,
          arg2: email
        }))
        .select()
        .then(function(sink) {
          if (sink.array.length === 0) {
            throw new Error('User not found');
          }
          
          var user = sink.array[0];
          
          // Check password (in a real app, use proper password hashing)
          if (user.password !== password) {
            throw new Error('Invalid password');
          }
          
          // Set current user and generate token
          this.currentUser = user;
          this.token = this.generateToken();
          
          return user;
        }.bind(this));
    },
    
    function logout() {
      this.currentUser = null;
      this.token = '';
    },
    
    function isAuthenticated() {
      return !!this.currentUser;
    },
    
    function hasRole(role) {
      return this.isAuthenticated() && this.currentUser.role === role;
    },
    
    function canAccess(resource) {
      // Implement access control logic
      if (!this.isAuthenticated()) return false;
      
      if (this.hasRole('admin')) return true;
      
      // Check resource-specific permissions
      return true; // Simplified example
    },
    
    function generateToken() {
      // Generate a random token (simplified example)
      return Math.random().toString(36).substring(2);
    }
  ]
});
```

### **Secure Data Access**

```javascript
foam.CLASS({
  name: 'SecureDAO',
  extends: 'foam.dao.ProxyDAO',
  
  imports: [
    'authService'
  ],
  
  methods: [
    function find(id) {
      if (!this.authService.canAccess('read')) {
        return Promise.reject(new Error('Access denied'));
      }
      return this.SUPER(id);
    },
    
    function put(obj) {
      if (!this.authService.canAccess('write')) {
        return Promise.reject(new Error('Access denied'));
      }
      return this.SUPER(obj);
    },
    
    function remove(obj) {
      if (!this.authService.canAccess('delete')) {
        return Promise.reject(new Error('Access denied'));
      }
      return this.SUPER(obj);
    },
    
    function select(sink, skip, limit, order, predicate) {
      if (!this.authService.canAccess('read')) {
        return Promise.reject(new Error('Access denied'));
      }
      
      // Add security predicate to filter results
      var securityPredicate = this.getSecurityPredicate();
      
      if (predicate) {
        predicate = foam.mlang.predicate.AND.create({
          args: [predicate, securityPredicate]
        });
      } else {
        predicate = securityPredicate;
      }
      
      return this.SUPER(sink, skip, limit, order, predicate);
    },
    
    function getSecurityPredicate() {
      // Create a predicate that filters based on user permissions
      // This is a simplified example
      if (this.authService.hasRole('admin')) {
        return foam.mlang.predicate.TRUE.create();
      }
      
      // Filter to show only resources owned by the current user
      return foam.mlang.predicate.Eq.create({
        arg1: this.of.OWNER_ID,
        arg2: this.authService.currentUser.id
      });
    }
  ]
});
```

## **Next Steps**

Now that you've explored these advanced FOAM3 features, you're ready to build more complex applications. In the next section, we'll cover best practices to help you write maintainable, efficient FOAM3 code.

## **[NEXT: Best Practices](5-best-practices.md)**

### **Tutorial Menu:** 

1. [Getting Started](1-gettingstarted.md)
2. [Core Concepts](2-concepts.md)
3. Applied Learning: Build a Phone Catalog App with FOAM3
    * [Defining the Model](3a-model.md)
    * [Working with DAOs](3b-dao.md)
    * [Building UI with U2](3c-UI.md)
    * [Navigation and Controllers](3d-navigation.md)
4. [Advanced FOAM3 Features](4-advanced.md)
5. [Best Practices](5-best-practices.md)
6. [Appendix](6-appendix.md)

* [Tutorial Overview](0-intro.md)

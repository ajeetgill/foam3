---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/5-best-practices/
tutorial: 5
---

# **FOAM3 Best Practices**

This section covers recommended practices and patterns for building maintainable, efficient, and robust FOAM3 applications. Following these guidelines will help you avoid common pitfalls and create better applications.

## **What You'll Learn**
- Code organization and project structure
- Naming conventions and coding standards
- Performance optimization strategies
- Error handling and debugging techniques
- Testing strategies for FOAM3 applications
- Deployment considerations

## **FOAM3 Project Organization**

### **Complete Project Structure**

FOAM3 projects require careful organization to leverage the framework's capabilities effectively. Below is a comprehensive project structure that follows FOAM best practices:

```
my-foam3-app/
├── build.sh                    # Main build script (wrapper for tools/build.js)
├── package.json                # Node.js package configuration
├── pom.js                      # Project Object Model for build configuration
├── index.html                  # Main entry point
├── foam3/                      # FOAM3 core submodule
├── src/                        # Application source code
│   ├── <app-package>/          # Root package namespace (e.g., 'com/myapp/')
│   │   ├── models/             # Data models
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   └── index.js        # Exports all models
│   │   ├── daos/               # DAO definitions
│   │   │   ├── UserDAO.js
│   │   │   ├── ProductDAO.js
│   │   │   └── index.js        # Exports all DAOs
│   │   ├── views/              # UI components
│   │   │   ├── UserView.js
│   │   │   ├── ProductView.js
│   │   │   └── index.js        # Exports all views
│   │   ├── controllers/        # Controllers and business logic
│   │   │   ├── AppController.js
│   │   │   └── index.js        # Exports all controllers
│   │   └── app.js              # Application initialization
├── css/                        # Global CSS styles
├── journals/                   # Journal files (.jrl) for configuration
│   ├── menus.jrl               # Menu configuration
│   ├── services.jrl            # Service configuration
│   └── scripts.jrl             # Scripts configuration
├── deployment/                 # Deployment-specific journals
│   ├── dev.jrl                 # Development configuration
│   └── prod.jrl                # Production configuration
├── test/                       # Tests
│   ├── models/
│   ├── daos/
│   └── views/
└── build/                      # Build output (generated)
    ├── src/                    # Generated Java source files
    ├── classes/                # Compiled Java class files
    ├── foam-bin.js             # Minified JavaScript bundle
    ├── journals/               # Processed journal files
    └── documents/              # Documentation files
```

### **Integrating FOAM3 as a Submodule**

Most FOAM3 applications should include the FOAM3 core as a Git submodule rather than copying the code directly. This approach makes it easier to update FOAM3 and maintain a clean separation between framework and application code.

```bash
# Initialize a new FOAM3 project
mkdir my-foam3-app
cd my-foam3-app

# Add FOAM3 as a Git submodule
git submodule add https://github.com/kgrgreer/foam3.git

# Create symlink to make foam.js accessible
ln -s foam3/src/foam.js foam.js

# Create basic project structure
mkdir -p src/com/myapp/{models,views,controllers,daos}
mkdir -p journals deployment
```

### **Package Namespacing**

Using proper package namespaces is essential in FOAM3 to avoid conflicts and organize your code:

```javascript
// Bad: Global namespace pollution
foam.CLASS({
  name: 'User'
});

// Good: Use package namespace
foam.CLASS({
  package: 'com.myapp.models',  // Follow Java package naming conventions
  name: 'User'
});
```

### **Journal Directory Organization**

Journals (covered in detail in [FOAM-Journals.md](FOAM-Journals.md)) should be organized in specific directories in your project:

```
my-foam3-app/
├── journals/                   # Application journals
│   ├── data/                   # Data storage journals
│   │   ├── users.jrl           # User data
│   │   └── products.jrl        # Product data
│   └── config/                 # Configuration journals
│       ├── menus.jrl           # Menu structure
│       └── services.jrl        # Service definitions
└── deployment/                 # Environment-specific journals
    ├── dev.jrl                 # Development settings
    └── prod.jrl                # Production settings
```

Refer to the FOAM-Journals documentation for detailed information on journal formats and usage.

### **Build System Integration**

FOAM3 uses a sophisticated build system defined in `pom.js`. This file configures how your application is built and deployed:

```javascript
// Example pom.js file
foam.POM({
  name: 'my-foam3-app',
  version: '1.0.0',
  description: 'My FOAM3 Application',
  license: 'Apache-2.0',
  
  // Core FOAM3 files to include
  dependencies: [
    'foam.core.*',
    'foam.dao.*',
    'foam.u2.*'
  ],
  
  // Application files to include
  files: [
    'src/com/myapp/models/User.js',
    'src/com/myapp/models/Product.js',
    'src/com/myapp/daos/UserDAO.js',
    'src/com/myapp/views/UserView.js',
    'src/com/myapp/controllers/AppController.js',
    'src/com/myapp/app.js'
  ],
  
  // Journals to include
  journals: [
    'journals/menus.jrl',
    'journals/services.jrl',
    'deployment/dev.jrl'
  ]
});
```

To build your application, use the `build.sh` script:

```bash
# Basic build
./build.sh

# Build with specific options
./build.sh --debug --no-java
```

// Then import with requires
foam.CLASS({
  name: 'UserView',
  requires: [
    'myapp.models.User'
  ]
});

## **FOAM3 Development Best Practices**

### **Using JDAO Pattern for Persistence**

For persistent data storage, use the EasyDAO pattern with journaling enabled. For details on journals, see [FOAM-Journals.md](FOAM-Journals.md) and [FOAM-Journals-Developer-Guide.md](FOAM-Journals-Developer-Guide.md).

```javascript
// Create a persistent DAO with journaling
foam.CLASS({
  package: 'com.myapp.daos',
  name: 'UserDAO',
  
  requires: [
    'foam.dao.EasyDAO',
    'com.myapp.models.User'
  ],
  
  exports: [
    'userDAO',
  ],
  
  properties: [
    {
      name: 'userDAO',
      factory: function() {
        return this.EasyDAO.create({
          of: this.User,
          daoType: 'MDAO',       // In-memory storage
          journal: true,          // Enable journaling
          journalName: 'users'    // Journal file name (users.jrl)
        });
      }
    }
  ]
});
```

### **Module Organization**

Group related classes into modules for better organization:

```javascript
// File: src/com/myapp/models/user/index.js
foam.CLASS({
  package: 'com.myapp.models.user',
  name: 'User',
  // User model implementation
});

foam.CLASS({
  package: 'myapp.models.user',
  name: 'UserProfile'
});

foam.CLASS({
  package: 'myapp.models.user',
  name: 'UserPreferences'
});

// File: js/models/index.js
// Export all models
// This makes imports cleaner in other files
```

## **Naming Conventions**

Follow consistent naming conventions for better readability:

### **Class Names**

- Use PascalCase for class names: `UserProfile`, `OrderController`
- Use descriptive, noun-based names for models: `Invoice`, `Product`
- Use verb phrases for service classes: `PaymentProcessor`, `EmailSender`
- Use the suffix "View" for UI components: `ProductView`, `OrderFormView`
- Use the suffix "DAO" for DAOs: `UserDAO`, `ProductDAO`
- Use the suffix "Controller" for controllers: `AppController`, `NavController`

### **Property Names**

- Use camelCase for property names: `firstName`, `itemCount`
- Use Boolean prefixes like "is", "has", "can" for Boolean properties: `isActive`, `hasItems`, `canEdit`
- Be consistent with abbreviations (e.g., `id` vs `identifier`)

### **Method Names**

- Use camelCase for method names: `calculateTotal()`, `fetchUserData()`
- Use verb phrases that describe the action: `save()`, `fetchData()`, `renderView()`
- Use "get" prefix for accessor methods: `getTotal()`, `getUserById()`
- Use "set" prefix for mutator methods: `setStatus()`, `setActiveUser()`

## **FOAM3 Coding Standards**

### **Property Definitions**

Prefer explicit property definitions over shorthand:

```javascript
// Not recommended for complex apps
foam.CLASS({
  name: 'Person',
  properties: [
    'name',
    'age',
    'email'
  ]
});

// Recommended: explicit property definitions
foam.CLASS({
  name: 'Person',
  properties: [
    {
      name: 'name',
      class: 'String',
      required: true
    },
    {
      name: 'age',
      class: 'Int',
      min: 0,
      max: 120
    },
    {
      name: 'email',
      class: 'EMail',
      required: true
    }
  ]
});
```

### **Documentation**

Document your classes and properties thoroughly:

```javascript
/**
 * Represents a customer in the system.
 * Handles customer information and purchase history.
 */
foam.CLASS({
  package: 'myapp.models',
  name: 'Customer',
  
  documentation: `
    Customer model that stores personal information and tracks purchase history.
    This is the central model for customer management in the application.
  `,
  
  properties: [
    {
      name: 'id',
      class: 'String',
      documentation: 'Unique identifier for the customer'
    },
    {
      name: 'firstName',
      class: 'String',
      required: true,
      documentation: 'Customer first name'
    },
    {
      name: 'lastName',
      class: 'String',
      required: true,
      documentation: 'Customer last name'
    },
    {
      name: 'email',
      class: 'EMail',
      required: true,
      documentation: 'Primary contact email for the customer'
    }
    // More properties...
  ],
  
  methods: [
    /**
     * Calculates the total amount spent by this customer.
     * @return {Number} The total amount spent.
     */
    function calculateTotalSpent() {
      // Implementation...
    }
  ]
});
```

### **Immutable Programming**

When appropriate, use immutable programming patterns:

```javascript
// Instead of modifying objects directly
function updateUser(user) {
  user.firstName = 'New Name';
  return user;
}

// Create a new copy with changes
function updateUser(user) {
  return Object.assign({}, user, { firstName: 'New Name' });
}

// Or with FOAM3
function updateUser(user) {
  return user.clone().copyFrom({ firstName: 'New Name' });
}
```

## **Performance Optimization**

### **Efficient Property Access**

Minimize unnecessary property changes to reduce event firing:

```javascript
// Inefficient - triggers multiple change events
function updatePerson(person) {
  person.firstName = 'John';
  person.lastName = 'Doe';
  person.age = 30;
  person.email = 'john.doe@example.com';
}

// More efficient - batch changes
function updatePerson(person) {
  person.copyFrom({
    firstName: 'John',
    lastName: 'Doe',
    age: 30,
    email: 'john.doe@example.com'
  });
}
```

### **DAO Optimization**

Use appropriate DAO implementations for your use case:

```javascript
// Simple in-memory DAO for small data sets
var simpleDAO = foam.dao.ArrayDAO.create({ of: MyModel });

// MDAO for indexed queries
var indexedDAO = foam.dao.MDAO.create({
  of: MyModel,
  indexes: [
    MyModel.NAME,
    MyModel.CREATED_AT
  ]
});

// Cached DAO for remote data
var cachedDAO = foam.dao.CachingDAO.create({
  src: remoteDAO,
  cache: foam.dao.MDAO.create({ of: MyModel })
});
```

### **Lazy Loading Components**

Load components only when needed:

```javascript
foam.CLASS({
  name: 'LazyComponent',
  
  requires: [
    // Avoid requiring heavy components here
  ],
  
  methods: [
    function loadHeavyComponentIfNeeded() {
      if (!this.heavyComponent && this.shouldLoadHeavyComponent) {
        // Load dynamically when needed
        this.heavyComponent = this.HeavyComponent.create();
      }
    }
  ]
});
```

### **Memory Management**

Be mindful of event listeners and subscriptions:

```javascript
foam.CLASS({
  name: 'MyController',
  
  properties: [
    {
      name: 'sub',
      postSet: function(old, nu) {
        if (old) old.detach();
      }
    }
  ],
  
  methods: [
    function init() {
      this.SUPER();
      
      // Store subscription for later cleanup
      this.sub = someObject.on.sub(this.onEvent);
    },
    
    function cleanup() {
      // Detach subscription when done
      if (this.sub) {
        this.sub.detach();
        this.sub = null;
      }
    }
  ]
});
```

## **Error Handling and Debugging**

### **Robust Error Handling**

Implement thorough error handling in your application:

```javascript
// Promise-based error handling
myDAO.find(id)
  .then(function(obj) {
    // Handle success
    return processObject(obj);
  })
  .catch(function(error) {
    // Handle specific errors
    if (error.name === 'NotFoundError') {
      console.error('Object not found:', id);
      // Show user-friendly message
      return createDefaultObject();
    } else {
      console.error('Unexpected error:', error);
      // Log error to monitoring service
      errorLoggingService.logError(error);
      throw error; // Re-throw if cannot handle
    }
  });

// Custom error classes
foam.CLASS({
  package: 'myapp.errors',
  name: 'ValidationError',
  extends: 'Error',
  
  properties: [
    {
      name: 'errors',
      factory: function() { return []; }
    }
  ]
});

// Using custom errors
function validateUser(user) {
  var errors = [];
  
  if (!user.firstName) {
    errors.push('First name is required');
  }
  
  if (!user.email) {
    errors.push('Email is required');
  } else if (!user.email.includes('@')) {
    errors.push('Email is invalid');
  }
  
  if (errors.length > 0) {
    var error = myapp.errors.ValidationError.create();
    error.errors = errors;
    throw error;
  }
  
  return true;
}
```

### **Debugging Techniques**

Use FOAM3's debugging tools effectively:

```javascript
// Enable FOAM debugging
foam.debugger.enabled = true;

// Debug specific components
myDAO.debug = true;

// Create a debug DAO
var debugDAO = foam.dao.LoggingDAO.create({
  delegate: myDAO,
  name: 'MyDAO'
});

// Inspect objects
console.log(myObject.toJSON());

// Get the class info
console.log(myObject.cls_);

// Inspect property values
console.log(Object.values(myObject.cls_.getAxiomsByClass(foam.core.Property))
  .map(function(prop) {
    return {
      name: prop.name,
      value: myObject[prop.name]
    };
  }));
```

## **Testing Strategies**

### **Unit Testing Models**

```javascript
// Test a model
describe('Customer model', function() {
  var Customer;
  
  beforeEach(function() {
    Customer = myapp.models.Customer;
  });
  
  it('should create with valid properties', function() {
    var customer = Customer.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    });
    
    expect(customer.firstName).toBe('John');
    expect(customer.lastName).toBe('Doe');
    expect(customer.email).toBe('john.doe@example.com');
  });
  
  it('should calculate fullName correctly', function() {
    var customer = Customer.create({
      firstName: 'John',
      lastName: 'Doe'
    });
    
    expect(customer.fullName).toBe('John Doe');
    
    customer.firstName = 'Jane';
    expect(customer.fullName).toBe('Jane Doe');
  });
  
  it('should validate required fields', function() {
    expect(function() {
      Customer.create({
        // Missing required fields
      });
    }).toThrow();
    
    expect(function() {
      Customer.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      });
    }).not.toThrow();
  });
});
```

### **Testing DAOs**

```javascript
describe('CustomerDAO', function() {
  var CustomerDAO, Customer;
  var dao;
  
  beforeEach(function() {
    Customer = myapp.models.Customer;
    CustomerDAO = myapp.daos.CustomerDAO;
    
    // Create a fresh DAO for each test
    dao = foam.dao.ArrayDAO.create({ of: Customer });
  });
  
  it('should put and find objects', function(done) {
    var customer = Customer.create({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    });
    
    dao.put(customer)
      .then(function() {
        return dao.find('123');
      })
      .then(function(found) {
        expect(found).not.toBeNull();
        expect(found.firstName).toBe('John');
        expect(found.lastName).toBe('Doe');
        done();
      })
      .catch(done.fail);
  });
  
  it('should filter objects correctly', function(done) {
    var customers = [
      Customer.create({ id: '1', firstName: 'John', lastName: 'Doe' }),
      Customer.create({ id: '2', firstName: 'Jane', lastName: 'Doe' }),
      Customer.create({ id: '3', firstName: 'Bob', lastName: 'Smith' })
    ];
    
    Promise.all(customers.map(function(c) { return dao.put(c); }))
      .then(function() {
        return dao.where(foam.mlang.predicate.Eq.create({
          arg1: Customer.LAST_NAME,
          arg2: 'Doe'
        })).select();
      })
      .then(function(sink) {
        expect(sink.array.length).toBe(2);
        expect(sink.array[0].firstName).toBe('John');
        expect(sink.array[1].firstName).toBe('Jane');
        done();
      })
      .catch(done.fail);
  });
});
```

### **Testing UI Components**

```javascript
describe('CustomerView', function() {
  var CustomerView, Customer;
  var view, customer;
  
  beforeEach(function() {
    Customer = myapp.models.Customer;
    CustomerView = myapp.views.CustomerView;
    
    customer = Customer.create({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    });
    
    view = CustomerView.create({ data: customer });
    
    // Render to the DOM
    view.write(document.body);
  });
  
  afterEach(function() {
    // Clean up
    view.remove();
  });
  
  it('should render customer name', function() {
    var nameElement = document.querySelector('.customer-name');
    expect(nameElement.textContent).toContain('John Doe');
  });
  
  it('should update when customer changes', function() {
    customer.firstName = 'Jane';
    
    // Wait for the DOM to update
    setTimeout(function() {
      var nameElement = document.querySelector('.customer-name');
      expect(nameElement.textContent).toContain('Jane Doe');
    }, 0);
  });
  
  it('should fire edit event when edit button clicked', function(done) {
    var editButton = document.querySelector('.edit-button');
    
    view.on('edit', function(event) {
      expect(event.customer.id).toBe('123');
      done();
    });
    
    // Simulate click
    editButton.click();
  });
});
```

## **Deployment Considerations**

### **Bundling**

Use a module bundler like webpack or rollup to optimize your application:

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  entry: './js/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
```

### **Code Splitting**

Load code on demand to improve initial load time:

```javascript
// Dynamic import with webpack
function loadAdminModule() {
  return import('./admin/index.js')
    .then(module => {
      // Initialize admin module
      return module.default.create();
    });
}

// Use when needed
if (user.isAdmin) {
  loadAdminModule().then(adminModule => {
    // Use admin module
  });
}
```

### **Progressive Web App (PWA)**

Make your FOAM3 application a PWA for better user experience:

```javascript
// service-worker.js
const CACHE_NAME = 'my-foam3-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/dist/bundle.js',
  '/css/styles.css',
  // Add other assets
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### **Server-Side Rendering (SSR)**

Consider server-side rendering for better performance:

```javascript
// server.js (Node.js with Express)
const express = require('express');
const app = express();
const foam = require('foam3');

// Load your FOAM3 models
require('./js/models');
require('./js/views');

app.get('/', (req, res) => {
  // Create your app
  const myApp = foam.myapp.App.create();
  
  // Render to string
  const html = myApp.renderToString();
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>My FOAM3 App</title>
        <link rel="stylesheet" href="/css/styles.css">
      </head>
      <body>
        <div id="app">${html}</div>
        <script src="/dist/bundle.js"></script>
      </body>
    </html>
  `);
});

app.listen(3000);
```

## **Maintenance and Scaling**

### **Versioning and Updates**

Implement a strategy for versioning your models:

```javascript
// Version your models
foam.CLASS({
  package: 'myapp.models',
  name: 'Customer',
  version: '1.0.0',
  
  properties: [
    // ...
  ]
});

// Add version migration
foam.CLASS({
  refines: 'myapp.models.Customer',
  version: '1.1.0',
  
  properties: [
    {
      name: 'middleName',
      class: 'String'
    }
  ]
});

// Version migration service
foam.CLASS({
  name: 'VersionMigrationService',
  
  methods: [
    function migrateObject(obj, toVersion) {
      var currentVersion = obj.cls_.version;
      
      // Apply migrations in sequence
      if (this.isOlderVersion(currentVersion, '1.1.0') && 
          this.isOlderVersion('1.1.0', toVersion)) {
        this.migrateToV110(obj);
      }
      
      // Apply more migrations as needed
      
      return obj;
    },
    
    function migrateToV110(obj) {
      // Add middleName property if it doesn't exist
      if (obj.middleName === undefined) {
        obj.middleName = '';
      }
    },
    
    function isOlderVersion(v1, v2) {
      // Compare version strings
      // Simple implementation - you might want a more robust version comparison
      return v1 < v2;
    }
  ]
});
```

### **Monitoring and Logging**

Implement monitoring and logging for your application:

```javascript
foam.CLASS({
  name: 'LoggingService',
  
  properties: [
    {
      name: 'level',
      value: 'info' // 'debug', 'info', 'warn', 'error'
    }
  ],
  
  methods: [
    function debug(message, ...args) {
      if (this.isLevelEnabled('debug')) {
        console.debug(`[DEBUG] ${message}`, ...args);
      }
    },
    
    function info(message, ...args) {
      if (this.isLevelEnabled('info')) {
        console.info(`[INFO] ${message}`, ...args);
      }
    },
    
    function warn(message, ...args) {
      if (this.isLevelEnabled('warn')) {
        console.warn(`[WARN] ${message}`, ...args);
      }
    },
    
    function error(message, ...args) {
      if (this.isLevelEnabled('error')) {
        console.error(`[ERROR] ${message}`, ...args);
        
        // You might want to send errors to a monitoring service
        if (window.errorMonitoringService) {
          window.errorMonitoringService.captureError(message, args);
        }
      }
    },
    
    function isLevelEnabled(level) {
      const levels = { debug: 0, info: 1, warn: 2, error: 3 };
      return levels[level] >= levels[this.level];
    }
  ]
});

// Usage
var logger = LoggingService.create();

logger.debug('Initializing component', { component: 'UserView' });
logger.info('User logged in', { userId: 123 });
logger.warn('API request slow', { endpoint: '/users', time: 2500 });
logger.error('Failed to save data', { error: 'Network error' });
```

## **Next Steps**

Now that you've learned about best practices for FOAM3 development, you're ready to build robust, maintainable applications. The Appendix provides reference information and additional resources to help you continue your FOAM3 journey.

## **[NEXT: Appendix](6-appendix.md)**

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

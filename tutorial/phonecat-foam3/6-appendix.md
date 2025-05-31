---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/6-appendix/
tutorial: 6
---

# **Appendix: FOAM3 Reference**

This appendix provides reference information about FOAM3, including details about available property types, built-in classes, common patterns, and additional resources for further learning.

## **Table of Contents**
- [Property Types](#property-types)
- [Built-in Classes](#built-in-classes)
- [MLANG Reference](#mlang-reference)
- [DAO Types](#dao-types)
- [UI Components](#ui-components)
- [Common Patterns](#common-patterns)
- [Glossary](#glossary)
- [Additional Resources](#additional-resources)

## **Property Types**

FOAM3 provides a variety of property types to suit different needs:

| Property Type | Description | Example |
|---------------|-------------|---------|
| `String` | Text values | `{ name: 'firstName', class: 'String' }` |
| `Int` | Integer values | `{ name: 'age', class: 'Int' }` |
| `Float` | Floating-point numbers | `{ name: 'price', class: 'Float' }` |
| `Boolean` | True/false values | `{ name: 'active', class: 'Boolean' }` |
| `Date` | Date values | `{ name: 'birthDate', class: 'Date' }` |
| `DateTime` | Date and time values | `{ name: 'createdAt', class: 'DateTime' }` |
| `Enum` | Enumerated values | `{ name: 'status', class: 'Enum', values: [{ name: 'PENDING' }, { name: 'ACTIVE' }, { name: 'INACTIVE' }] }` |
| `EMail` | Email addresses | `{ name: 'email', class: 'EMail' }` |
| `Password` | Password fields (with hashing) | `{ name: 'password', class: 'Password' }` |
| `PhoneNumber` | Phone numbers | `{ name: 'phoneNumber', class: 'PhoneNumber' }` |
| `URL` | URL values | `{ name: 'website', class: 'URL' }` |
| `Color` | Color values | `{ name: 'backgroundColor', class: 'Color' }` |
| `Map` | Key-value pairs | `{ name: 'metadata', class: 'Map' }` |
| `Array` | Array of values | `{ name: 'tags', class: 'Array' }` |
| `StringArray` | Array of strings | `{ name: 'categories', class: 'StringArray' }` |
| `FObjectProperty` | Reference to another FOAM object | `{ name: 'author', class: 'FObjectProperty', of: 'Author' }` |
| `FObjectArray` | Array of FOAM objects | `{ name: 'comments', class: 'FObjectArray', of: 'Comment' }` |
| `foam.dao.DAOProperty` | Reference to a DAO | `{ name: 'users', class: 'foam.dao.DAOProperty' }` |

### **Common Property Features**

Properties can have additional features:

| Feature | Description | Example |
|---------|-------------|---------|
| `value` | Default value | `{ name: 'active', value: true }` |
| `factory` | Function that creates the default value | `{ name: 'createdAt', factory: function() { return new Date(); } }` |
| `expression` | Calculate value from other properties | `{ name: 'fullName', expression: function(firstName, lastName) { return firstName + ' ' + lastName; } }` |
| `required` | Whether the property is required | `{ name: 'email', required: true }` |
| `final` | Whether the property can be changed | `{ name: 'id', final: true }` |
| `hidden` | Whether to hide in UI | `{ name: 'password', hidden: true }` |
| `transient` | Whether to exclude from serialization | `{ name: 'temporaryValue', transient: true }` |
| `documentation` | Description of the property | `{ name: 'email', documentation: 'User email address' }` |
| `view` | Default view to use | `{ name: 'bio', view: { class: 'foam.u2.view.TextArea', rows: 5 } }` |
| `validateObj` | Custom validation function | `{ name: 'email', validateObj: function(email) { if (!email.includes('@')) return 'Invalid email'; } }` |
| `adapt` | Transform input values | `{ name: 'name', adapt: function(_, v) { return v.trim(); } }` |
| `postSet` | Function called after value changes | `{ name: 'status', postSet: function(old, nu) { if (old !== nu) this.statusChanged(); } }` |
| `units` | Units for numeric values | `{ name: 'weight', units: 'kg' }` |
| `min` / `max` | Range constraints | `{ name: 'rating', min: 1, max: 5 }` |

## **Built-in Classes**

FOAM3 includes many built-in classes for common functionality:

### **Core Classes**

| Class | Description |
|-------|-------------|
| `foam.core.FObject` | Base class for all FOAM objects |
| `foam.core.Property` | Base property class |
| `foam.core.Method` | Method definition |
| `foam.core.Listener` | Event listener definition |
| `foam.core.Action` | User action definition |
| `foam.core.Constant` | Constant value definition |
| `foam.core.Enum` | Enumeration definition |
| `foam.core.Implements` | Interface implementation |

### **DAO Classes**

| Class | Description |
|-------|-------------|
| `foam.dao.DAO` | Base DAO interface |
| `foam.dao.ArrayDAO` | In-memory DAO using an array |
| `foam.dao.MDAO` | In-memory indexed DAO for efficient queries |
| `foam.dao.LocalStorageDAO` | DAO that stores data in browser localStorage |
| `foam.dao.RestDAO` | DAO that communicates with a REST API |
| `foam.dao.IDBDAO` | DAO that uses IndexedDB |
| `foam.dao.CachingDAO` | DAO that caches results |
| `foam.dao.LoggingDAO` | DAO that logs operations |
| `foam.dao.ProxyDAO` | Base class for DAO decorators |
| `foam.dao.SyncDAO` | DAO that synchronizes with a remote DAO |
| `foam.dao.EasyDAO` | Convenience factory for creating DAOs |

### **UI Classes**

| Class | Description |
|-------|-------------|
| `foam.u2.Element` | Base UI element |
| `foam.u2.View` | Base view for displaying properties |
| `foam.u2.TextField` | Text input field |
| `foam.u2.IntView` | Integer input field |
| `foam.u2.FloatView` | Float input field |
| `foam.u2.DateView` | Date input field |
| `foam.u2.DateTimeView` | Date and time input field |
| `foam.u2.BooleanView` | Boolean input field |
| `foam.u2.CheckBox` | Checkbox input |
| `foam.u2.RadioView` | Radio button group |
| `foam.u2.tag.Select` | Dropdown select |
| `foam.u2.view.TextArea` | Multi-line text input |
| `foam.u2.view.RichTextView` | Rich text editor |
| `foam.u2.view.TableView` | Table view for DAOs |
| `foam.u2.view.TreeView` | Tree view for hierarchical data |
| `foam.u2.view.ImageView` | Image display |
| `foam.u2.layout.Grid` | Grid layout |
| `foam.u2.dialog.Popup` | Popup dialog |
| `foam.u2.Tabs` | Tabbed interface |

## **MLANG Reference**

FOAM3's MLANG (Model Language) provides powerful querying capabilities:

### **Predicates**

| Predicate | Description | Example |
|-----------|-------------|---------|
| `Eq` | Equals | `EQ(Person.NAME, 'John')` |
| `Neq` | Not equals | `NEQ(Person.AGE, 30)` |
| `Lt` | Less than | `LT(Person.AGE, 18)` |
| `Lte` | Less than or equal | `LTE(Person.AGE, 18)` |
| `Gt` | Greater than | `GT(Person.SALARY, 50000)` |
| `Gte` | Greater than or equal | `GTE(Person.SALARY, 50000)` |
| `Like` | String contains (case sensitive) | `LIKE(Person.NAME, 'oh')` |
| `ContainsIC` | String contains (case insensitive) | `CONTAINS_IC(Person.NAME, 'john')` |
| `StartsWith` | String starts with | `STARTS_WITH(Person.NAME, 'J')` |
| `And` | Logical AND | `AND(GT(Person.AGE, 18), LT(Person.AGE, 65))` |
| `Or` | Logical OR | `OR(EQ(Person.ROLE, 'admin'), EQ(Person.ROLE, 'manager'))` |
| `Not` | Logical NOT | `NOT(EQ(Person.STATUS, 'inactive'))` |
| `Has` | Property exists | `HAS(Person.MIDDLE_NAME)` |
| `In` | Value in array | `IN(Person.STATUS, ['active', 'pending'])` |
| `InIC` | Value in array (case insensitive) | `IN_IC(Person.CATEGORY, ['electronics', 'computers'])` |

### **Expressions**

| Expression | Description | Example |
|------------|-------------|---------|
| `Dot` | Property access | `DOT(product, 'price')` |
| `Map` | Transform values | `MAP(person, function(p) { return p.firstName + ' ' + p.lastName; })` |
| `Count` | Count objects | `COUNT()` |
| `Min` | Minimum value | `MIN(Person.AGE)` |
| `Max` | Maximum value | `MAX(Person.AGE)` |
| `Sum` | Sum values | `SUM(Product.PRICE)` |
| `Average` | Average value | `AVERAGE(Product.RATING)` |
| `Join` | Join two DAOs | `JOIN(product, Product.SUPPLIER_ID, Supplier.ID, 'supplier')` |

### **Orders**

| Order | Description | Example |
|-------|-------------|---------|
| (Property) | Ascending order | `Product.PRICE` |
| `Desc` | Descending order | `DESC(Product.PRICE)` |
| `Then` | Compound ordering | `THEN(Product.CATEGORY, Product.PRICE)` |

### **Sinks**

| Sink | Description | Example |
|------|-------------|---------|
| `ArraySink` | Collect results in an array | `ArraySink.create()` |
| `Count` | Count results | `Count.create()` |
| `GroupBy` | Group results | `GroupBy.create({ arg1: Person.CITY, arg2: Count.create() })` |
| `Map` | Transform results | `Map.create({ arg1: function(p) { return p.name; } })` |
| `Explain` | Debug query execution | `Explain.create({ delegate: ArraySink.create() })` |

## **DAO Types**

FOAM3 provides various DAO implementations for different use cases:

### **ArrayDAO**
Simple in-memory DAO using JavaScript arrays. Good for small datasets and prototyping.

```javascript
var dao = foam.dao.ArrayDAO.create({ of: Person });
```

### **MDAO**
In-memory indexed DAO for efficient querying. Good for medium-sized datasets with frequent queries.

```javascript
var dao = foam.dao.MDAO.create({
  of: Person,
  indexes: [
    Person.LAST_NAME,
    Person.AGE
  ]
});
```

### **LocalStorageDAO**
Persists data to browser localStorage. Good for simple client-side persistence.

```javascript
var dao = foam.dao.LocalStorageDAO.create({
  of: Person,
  prefix: 'person_' // localStorage key prefix
});
```

### **IDBDAO**
Persists data to IndexedDB. Good for larger client-side datasets.

```javascript
var dao = foam.dao.IDBDAO.create({
  of: Person,
  name: 'persons' // IndexedDB store name
});
```

### **RestDAO**
Communicates with a REST API. Good for server-backed data.

```javascript
var dao = foam.dao.RestDAO.create({
  of: Person,
  baseURL: 'https://api.example.com/persons'
});
```

### **SyncDAO**
Synchronizes data between a local and remote DAO. Good for offline-capable applications.

```javascript
var dao = foam.dao.SyncDAO.create({
  of: Person,
  syncProperty: Person.LAST_MODIFIED,
  remoteDAO: remoteDAO,
  delegate: localDAO
});
```

### **EasyDAO**
Factory for creating DAOs with various features enabled.

```javascript
var dao = foam.dao.EasyDAO.create({
  of: Person,
  daoType: 'MDAO',
  cache: true,
  logging: true,
  seqNo: true,
  timing: true
});
```

## **UI Components**

FOAM3's UI library (U2) provides various components for building interfaces:

### **Basic Elements**

```javascript
// Create a div with text
this.E()
  .setNodeName('div')
  .add('Hello, World!');

// Create a button
this.E()
  .setNodeName('button')
  .addClass('my-button')
  .add('Click Me')
  .on('click', this.onClick);

// Create an input field
this.E()
  .setNodeName('input')
  .setAttribute('type', 'text')
  .setAttribute('placeholder', 'Enter your name')
  .on('input', function(e) {
    console.log('Input:', e.target.value);
  });
```

### **Layout Components**

```javascript
// Grid layout
this.E()
  .start(this.Grid)
    .start(this.GUnit, { columns: 4 })
      .add('Sidebar')
    .end()
    .start(this.GUnit, { columns: 8 })
      .add('Main Content')
    .end()
  .end();

// Card layout
this.E()
  .start('div')
    .addClass('card')
    .start('div')
      .addClass('card-header')
      .add('Card Title')
    .end()
    .start('div')
      .addClass('card-body')
      .add('Card content goes here')
    .end()
    .start('div')
      .addClass('card-footer')
      .start('button')
        .add('OK')
      .end()
    .end()
  .end();
```

### **Data Binding**

```javascript
// Two-way data binding
this.E()
  .start(this.TextField)
    .data$(this.data$.dot('name'))
  .end();

// Expression binding
this.E()
  .start('div')
    .addClass('greeting')
    .add(this.slot(function(data) {
      return 'Hello, ' + data.name;
    }))
  .end();

// Conditional visibility
this.E()
  .start('div')
    .addClass('error-message')
    .show(this.slot(function(data) {
      return data.hasError;
    }))
    .add('An error occurred')
  .end();
```

### **Tables and Lists**

```javascript
// Table view
this.E()
  .start(this.TableView)
    .data$(this.dao$)
    .columns([
      { name: 'name', label: 'Name' },
      { name: 'age', label: 'Age' },
      { name: 'email', label: 'Email' }
    ])
    .on('click', function(_, __, ___, obj) {
      this.selection = obj;
    })
  .end();

// List view
this.E()
  .start('ul')
    .addClass('item-list')
    .add(this.slot(function(data) {
      var list = this.E();
      
      data.forEach(function(item) {
        list
          .start('li')
            .addClass('item')
            .add(item.name)
          .end();
      });
      
      return list;
    }))
  .end();
```

### **Forms**

```javascript
// Form with multiple fields
this.E()
  .start('form')
    .addClass('user-form')
    .on('submit', function(e) {
      e.preventDefault();
      this.submit();
    })
    .start('div')
      .addClass('form-group')
      .start('label')
        .add('Name:')
      .end()
      .start(this.TextField)
        .data$(this.data$.dot('name'))
        .addClass('form-control')
      .end()
    .end()
    .start('div')
      .addClass('form-group')
      .start('label')
        .add('Email:')
      .end()
      .start(this.TextField)
        .data$(this.data$.dot('email'))
        .addClass('form-control')
      .end()
    .end()
    .start('div')
      .addClass('form-group')
      .start('button')
        .setAttribute('type', 'submit')
        .addClass('btn', 'btn-primary')
        .add('Save')
      .end()
    .end()
  .end();
```

## **Common Patterns**

Here are some common patterns used in FOAM3 applications:

### **Factory Pattern**

```javascript
foam.CLASS({
  name: 'UserFactory',
  
  requires: [
    'User',
    'AdminUser',
    'GuestUser'
  ],
  
  methods: [
    function createUser(type, data) {
      switch (type) {
        case 'admin':
          return this.AdminUser.create(data);
        case 'guest':
          return this.GuestUser.create(data);
        default:
          return this.User.create(data);
      }
    }
  ]
});
```

### **Observer Pattern**

```javascript
foam.CLASS({
  name: 'DataService',
  
  topics: [
    'dataChanged',
    'dataLoaded',
    'error'
  ],
  
  methods: [
    function loadData() {
      // Simulate async data loading
      setTimeout(function() {
        var data = { /* ... */ };
        this.dataLoaded.pub(data);
      }.bind(this), 1000);
    },
    
    function updateData(newData) {
      // Update logic
      // ...
      
      // Notify observers
      this.dataChanged.pub(newData);
    }
  ]
});

// Usage
var service = DataService.create();

service.dataLoaded.sub(function(_, _, data) {
  console.log('Data loaded:', data);
});

service.dataChanged.sub(function(_, _, data) {
  console.log('Data changed:', data);
});

service.loadData();
```

### **Decorator Pattern**

```javascript
foam.CLASS({
  name: 'LoggingDAODecorator',
  extends: 'foam.dao.ProxyDAO',
  
  properties: [
    {
      name: 'name',
      class: 'String',
      value: 'DAO'
    }
  ],
  
  methods: [
    function put(obj) {
      console.log(`${this.name}.put:`, obj.id);
      return this.SUPER(obj);
    },
    
    function find(id) {
      console.log(`${this.name}.find:`, id);
      return this.SUPER(id);
    },
    
    function remove(obj) {
      console.log(`${this.name}.remove:`, obj.id);
      return this.SUPER(obj);
    },
    
    function select(sink, skip, limit, order, predicate) {
      console.log(`${this.name}.select:`, { skip, limit, predicate });
      return this.SUPER(sink, skip, limit, order, predicate);
    }
  ]
});

// Usage
var loggingDAO = LoggingDAODecorator.create({
  delegate: originalDAO,
  name: 'UserDAO'
});
```

### **Command Pattern**

```javascript
foam.CLASS({
  name: 'Command',
  
  properties: [
    {
      name: 'execute',
      class: 'Function'
    },
    {
      name: 'undo',
      class: 'Function'
    },
    {
      name: 'name',
      class: 'String'
    }
  ]
});

foam.CLASS({
  name: 'CommandManager',
  
  properties: [
    {
      name: 'history',
      class: 'Array',
      factory: function() { return []; }
    },
    {
      name: 'undone',
      class: 'Array',
      factory: function() { return []; }
    }
  ],
  
  methods: [
    function execute(command) {
      command.execute();
      this.history.push(command);
      this.undone = [];
    },
    
    function undo() {
      if (this.history.length === 0) return;
      
      var command = this.history.pop();
      command.undo();
      this.undone.push(command);
    },
    
    function redo() {
      if (this.undone.length === 0) return;
      
      var command = this.undone.pop();
      command.execute();
      this.history.push(command);
    }
  ]
});

// Usage
var cmdMgr = CommandManager.create();

var addUserCommand = Command.create({
  name: 'Add User',
  execute: function() {
    userDAO.put(newUser);
  },
  undo: function() {
    userDAO.remove(newUser);
  }
});

cmdMgr.execute(addUserCommand);
// Later
cmdMgr.undo();
```

## **Glossary**

| Term | Definition |
|------|------------|
| **Axiom** | A fundamental building block of a FOAM class (property, method, listener, etc.) |
| **Class** | A template for creating objects with specific properties and behavior |
| **DAO** | Data Access Object - an interface for working with collections of objects |
| **Expression** | A function that calculates a property value based on other properties |
| **Factory** | A function that creates a default value for a property when first accessed |
| **FObject** | The base class for all FOAM objects |
| **MLANG** | Model Language - FOAM's query language for filtering and manipulating data |
| **Model** | A FOAM class that represents a data structure |
| **Property** | A characteristic or attribute of a FOAM object |
| **Refinement** | A modification to an existing class |
| **Sink** | An object that collects the results of a DAO query |
| **Slot** | A container for a value that can be observed and modified |
| **Sub-context** | A child context that inherits from its parent context |
| **U2** | FOAM's UI library for building user interfaces |
| **View** | A UI component that displays and manipulates data |

## **Additional Resources**

### **Official Resources**

- [FOAM3 GitHub Repository](https://github.com/kgrgreer/foam3)
- [FOAM3 Wiki](https://github.com/kgrgreer/foam3/wiki)
- [FOAM3 Issue Tracker](https://github.com/kgrgreer/foam3/issues)

### **Community Resources**

- [FOAM3 Discussion Group](https://groups.google.com/forum/#!forum/foam-framework-discuss)
- [Stack Overflow FOAM3 Questions](https://stackoverflow.com/questions/tagged/foam3)

### **Sample Applications**

- [FOAM3 TodoMVC](https://github.com/kgrgreer/foam3/tree/master/src/foam/demos/todomvc)
- [FOAM3 Sweeper Game](https://github.com/kgrgreer/foam3/tree/master/src/foam/demos/sweeper)
- [FOAM3 Calculator](https://github.com/kgrgreer/foam3/tree/master/src/foam/demos/calculator)

### **Books and Articles**

- "Building Scalable Web Applications with FOAM" (online guide)
- "Reactive Programming with FOAM3" (tutorial series)
- "FOAM3: The Comprehensive Guide" (documentation)

## **Tutorial Menu:** 

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

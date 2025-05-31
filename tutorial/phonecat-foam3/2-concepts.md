---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/2-concepts/
tutorial: 2
---

# **Core Concepts in FOAM3**

This section introduces the fundamental concepts that make FOAM3 powerful and unique. Understanding these core principles will help you build effective applications and appreciate the "FOAM way" of solving problems.

## **What You'll Learn**
- The FOAM3 class system and how it extends JavaScript's OOP capabilities
- How properties work in FOAM3 and why they're more powerful than regular JavaScript properties
- The reactive programming model in FOAM3
- How FOAM3 implements the MVC (Model-View-Controller) pattern
- The DAO (Data Access Object) pattern for consistent data operations

## **The FOAM3 Class System**

FOAM3 provides a rich class system that extends JavaScript's native object-oriented programming capabilities. This system is the foundation for everything in FOAM3.

### **Defining Classes**

In FOAM3, classes are defined using the `foam.CLASS()` function:

```javascript
foam.CLASS({
  name: 'Person',
  properties: [
    'firstName',
    'lastName',
    {
      name: 'fullName',
      expression: function(firstName, lastName) {
        return firstName + ' ' + lastName;
      }
    }
  ],
  methods: [
    function greet() {
      return 'Hello, my name is ' + this.fullName;
    }
  ]
});
```

This is more than just a convenience wrapper around JavaScript classes. FOAM3 classes have features like:

- **Meta-programming**: Classes are objects themselves that you can inspect and modify
- **Multiple inheritance**: Classes can extend from multiple sources
- **Aspect-oriented programming**: Add cross-cutting concerns easily
- **Declarative definitions**: Define complex behaviors with simple JSON-like syntax

### **FOAM3 vs JavaScript Classes**

Let's compare a FOAM3 class with an equivalent JavaScript class:

**JavaScript Class:**
```javascript
// File: my-foam3-app/person-js-native.js (JavaScript native class equivalent)
class Person {
  constructor(firstName, lastName) {
    this._firstName = firstName;
    this._lastName = lastName;
  }
  
  get firstName() { return this._firstName; }
  set firstName(value) { 
    this._firstName = value;
    this._updateFullName();
  }
  
  get lastName() { return this._lastName; }
  set lastName(value) { 
    this._lastName = value;
    this._updateFullName();
  }
  
  get fullName() { return this._fullName; }
  
  _updateFullName() {
    this._fullName = this._firstName + ' ' + this._lastName;
  }
  
  greet() {
    return 'Hello, my name is ' + this.fullName;
  }
}
```

**FOAM3 Class:**
```javascript
foam.CLASS({
  name: 'Person',
  properties: [
    'firstName',
    'lastName',
    {
      name: 'fullName',
      expression: function(firstName, lastName) {
        return firstName + ' ' + lastName;
      }
    }
  ],
  methods: [
    function greet() {
      return 'Hello, my name is ' + this.fullName;
    }
  ]
});
```

Notice how the FOAM3 version is much more concise while providing more functionality. The `expression` feature automatically recalculates `fullName` whenever `firstName` or `lastName` changes.

### **Creating Instances**

To create an instance of a FOAM3 class, use the `create()` method:

```javascript
// File: my-foam3-app/person-usage.js
var person = Person.create({
  firstName: 'John',
  lastName: 'Doe'
});

console.log(person.fullName); // "John Doe"
console.log(person.greet()); // "Hello, my name is John Doe"

// Change a property and fullName updates automatically
person.firstName = 'Jane';
console.log(person.fullName); // "Jane Doe"
```

### **Why FOAM3 Does It This Way**

FOAM3's class system was designed to address common challenges in building complex applications:

1. **Reducing boilerplate**: Many patterns (like getters/setters, event handling) are automated
2. **Consistency**: All FOAM3 classes follow the same patterns, making code more predictable
3. **Reactivity**: Changes to properties automatically propagate through the system
4. **Metaprogramming**: Classes themselves are objects that can be manipulated programmatically

## **Properties: The Heart of FOAM3**

Properties are one of the most powerful features of FOAM3. They're much more than simple fields - they're self-contained units with built-in behaviors.

### **Property Features**

Properties in FOAM3 can have various features:

```javascript
// File: my-foam3-app/Product.js
foam.CLASS({
  name: 'Product',
  properties: [
    {
      name: 'name',
      class: 'String',
      required: true,
      validation: function(name) {
        return name.length > 3 ? true : 'Name must be longer than 3 characters';
      }
    },
    {
      name: 'price',
      class: 'Float',
      value: 0.0,
      validateObj: function(price) {
        if (price < 0) return 'Price cannot be negative';
      }
    },
    {
      name: 'discountedPrice',
      class: 'Float',
      expression: function(price) {
        return price * 0.9; // 10% discount
      }
    },
    {
      name: 'created',
      class: 'DateTime',
      factory: function() {
        return new Date();
      },
      final: true
    }
  ]
});
```

Key property features include:

- **Types**: Properties can have specific types (String, Number, Boolean, Date, etc.)
- **Validation**: Built-in or custom validation rules
- [**Default values**: Set with `value` or dynamically with `factory`](Factory.md)
- **Expressions**: Calculate values based on other properties
- **Factories**: Create default values lazily
- **Adapters**: Transform input values automatically
- **Reactivity**: Changes trigger updates to dependent properties

### **Property Types**

FOAM3 comes with many built-in property types:

- `String`: Text values
- `Int`: Integer values
- `Float`: Floating-point numbers
- `Boolean`: True/false values
- `Date`: Date values
- `DateTime`: Date and time values
- `Enum`: Enumerated values
- `Array`: Array values
- `StringArray`: Arrays of strings
- `Map`: Key-value pairs
- `FObjectProperty`: References to other FOAM3 objects
- `FObjectArray`: Arrays of FOAM3 objects

Each type provides appropriate validation, serialization, and UI rendering. For example:

- `String` properties render as text inputs
- `Int` and `Float` properties render as number inputs with appropriate validation
- `Boolean` properties render as checkboxes
- `Date` and `DateTime` properties render as date pickers
- `Enum` properties render as dropdown select lists when paired with a view
- `StringArray` properties can render as tag inputs or multi-select components

Here's how an `Enum` property renders as a dropdown list when using FOAM3's view system:

```javascript
foam.CLASS({
  name: 'Product',
  properties: [
    {
      name: 'category',
      class: 'Enum',
      of: 'foam.u2.view.ChoiceView',
      values: [
        ['electronics', 'Electronics'],
        ['clothing', 'Clothing'],
        ['food', 'Food & Beverages']
      ]
    }
  ]
});

// When this Product is displayed in a DetailView or similar component,
// the category property will automatically render as a dropdown
```

This automatic UI rendering happens when the property is used within FOAM3's view system, such as in a `foam.u2.DetailView` or when explicitly setting a property's view.
Each type provides appropriate validation, serialization, and UI rendering.

### **Why FOAM3 Does It This Way**

Properties in FOAM3 encapsulate many common patterns:
1. **Validation**: Ensuring data consistency
2. **Reactivity**: Updating dependent values automatically
3. **UI binding**: Connecting data to UI components
4. **Serialization**: Converting to/from JSON
5. **Type safety**: Ensuring values are of the correct type

This approach keeps your code DRY (Don't Repeat Yourself) and focused on business logic rather than infrastructure.

## **Reactive Programming in FOAM3**

FOAM3 has built-in support for reactive programming, which automatically propagates changes through your application.

### **What is Reactive Programming?**

Reactive programming is a declarative programming paradigm concerned with data streams and the propagation of changes. In FOAM3, when a property changes, any property that depends on it (through an expression) automatically updates.

### **Expressions**

Expressions are functions that calculate a property's value based on other properties:

```javascript
foam.CLASS({
  name: 'Rectangle',
  properties: [
    'width',
    'height',
    {
      name: 'area',
      expression: function(width, height) {
        return width * height;
      }
    }
  ]
});

var rect = Rectangle.create({ width: 5, height: 10 });
console.log(rect.area); // 50

rect.width = 7;
console.log(rect.area); // 70 (automatically updated)
```

The function parameters (`width` and `height`) tell FOAM3 which properties to listen to. When either changes, the expression automatically recalculates.

### **Slots**

For more complex reactive scenarios, FOAM3 provides a concept called Slots. A Slot is a container for a value that can be observed and modified.

```javascript
foam.CLASS({
  name: 'Counter',
  properties: ['count'],
  methods: [
    function increment() {
      this.count++;
    }
  ]
});

var counter = Counter.create();

// Create a slot for the count property
var countSlot = counter.count$;

// Subscribe to changes
countSlot.sub(function(_, __, ___, newValue) {
  console.log('Count changed to:', newValue);
});

counter.increment(); // Logs: "Count changed to: 1"
counter.increment(); // Logs: "Count changed to: 2"
```

The `$` suffix is a convention in FOAM3 that returns a Slot for a property.

### **Why FOAM3 Does It This Way**

FOAM3's reactive system is designed to:
1. **Reduce complexity**: Changes propagate automatically, eliminating manual synchronization
2. **Improve performance**: Only affected parts of the system update when data changes
3. **Make code more declarative**: Describe relationships between data, not how to update it
4. **Support complex UIs**: Keep UI elements in sync with underlying data

## **The MVC Pattern in FOAM3**

FOAM3 implements the Model-View-Controller (MVC) pattern in a unique way that leverages its reactive capabilities.

### **Models**

Models in FOAM3 are classes that define your data structure and business logic:

```javascript
foam.CLASS({
  name: 'Task',
  properties: [
    {
      name: 'title',
      class: 'String',
      required: true
    },
    {
      name: 'description',
      class: 'String'
    },
    {
      name: 'completed',
      class: 'Boolean',
      value: false
    },
    {
      name: 'priority',
      class: 'Int',
      value: 1,
      min: 1,
      max: 5
    },
    {
      name: 'dueDate',
      class: 'Date'
    }
  ],
  methods: [
    function isOverdue() {
      return !this.completed && this.dueDate && this.dueDate < new Date();
    }
  ]
});
```

### **Views**

Views in FOAM3 render models to the UI and handle user interactions:

```javascript
foam.CLASS({
  name: 'TaskView',
  extends: 'foam.u2.View',
  
  requires: [
    'foam.u2.CheckBox'
  ],
  
  properties: [
    {
      name: 'data',
      class: 'FObjectProperty',
      of: 'Task'
    }
  ],
  
  methods: [
    function render() {
      var self = this;
      this
        .addClass('task-view')
        .start('div')
          .addClass('task-header')
          .start(this.CheckBox)
            .data$(this.data$.dot('completed'))
          .end()
          .start('span')
            .addClass('task-title')
            .add(this.data$.dot('title'))
            .style({
              textDecoration: this.data$.dot('completed').map(function(completed) {
                return completed ? 'line-through' : 'none';
              })
            })
          .end()
        .end()
        .start('div')
          .addClass('task-body')
          .add(this.data$.dot('description'))
        .end();
      
      return this;
    }
  ]
});
```

### **Controllers**

Controllers in FOAM3 manage collections of models and coordinate between models and views:

```javascript
foam.CLASS({
  name: 'TaskController',
  
  requires: [
    'Task',
    'foam.dao.ArrayDAO',
    'foam.u2.TableView'
  ],
  
  properties: [
    {
      name: 'taskDAO',
      factory: function() {
        var dao = this.ArrayDAO.create({ of: this.Task });
        
        // Add some initial tasks
        dao.put(this.Task.create({
          title: 'Learn FOAM3',
          description: 'Complete the tutorial',
          priority: 1,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
        }));
        
        return dao;
      }
    }
  ],
  
  methods: [
    function render() {
      return this.E()
        .addClass('task-controller')
        .start(this.TableView)
          .data$(this.taskDAO$)
          .columns([
            'completed',
            'title',
            'priority',
            'dueDate'
          ])
        .end();
    },
    
    function addTask(task) {
      this.taskDAO.put(task);
    },
    
    function removeTask(task) {
      this.taskDAO.remove(task);
    }
  ]
});
```

### **Why FOAM3 Does It This Way**

FOAM3's MVC implementation:
1. **Decouples concerns**: Models, views, and controllers can be developed independently
2. **Leverages reactivity**: Views automatically update when models change
3. **Promotes reusability**: Models can be used with different views, and vice versa
4. **Simplifies testing**: Each component can be tested in isolation

## **The DAO Pattern**

DAO (Data Access Object) is a pattern for abstracting data sources. FOAM3 provides a consistent interface for working with data regardless of where it comes from.

### **What is a DAO?**

A DAO in FOAM3 is an object that provides methods for creating, reading, updating, and deleting (CRUD) data. It can represent in-memory data, server-side data, local storage, or any other data source.

### **Common DAO Operations**

All DAOs support these operations:

```javascript
// Create or update an object
dao.put(obj).then(function(savedObj) {
  console.log('Saved:', savedObj);
});

// Find an object by id
dao.find(id).then(function(obj) {
  console.log('Found:', obj);
});

// Remove an object
dao.remove(obj).then(function() {
  console.log('Removed');
});

// Select multiple objects
dao.select().then(function(sink) {
  var array = sink.array;
  console.log('All objects:', array);
});

// Count objects
dao.select(foam.mlang.sink.Count.create()).then(function(sink) {
  console.log('Count:', sink.value);
});
```

### **Types of DAOs**

FOAM3 comes with several DAO implementations:

- **ArrayDAO**: Stores objects in memory
- **LocalStorageDAO**: Persists to browser localStorage
- **RestDAO**: Communicates with a REST API
- **IDBDAO**: Uses IndexedDB for storage
- **MDAO**: Memory-indexed DAO for fast querying
- And many more...

### **Filtering and Querying**

FOAM3 provides a powerful query language called MLANG (Model Language):

```javascript
// Find all tasks with high priority (4 or 5) that aren't completed
dao
  .where(
    foam.mlang.predicate.AND.create({
      args: [
        foam.mlang.predicate.GTE.create({
          arg1: Task.PRIORITY,
          arg2: 4
        }),
        foam.mlang.predicate.EQ.create({
          arg1: Task.COMPLETED,
          arg2: false
        })
      ]
    })
  )
  .select()
  .then(function(sink) {
    console.log('High priority incomplete tasks:', sink.array);
  });
```

### **Why FOAM3 Does It This Way**

The DAO pattern in FOAM3:
1. **Provides consistency**: Same interface regardless of data source
2. **Enables swapping**: Change data sources without changing application code
3. **Supports composition**: DAOs can be composed (cached, decorated, etc.)
4. **Abstracts complexity**: Handling asynchronous operations, indexing, etc.

## **Common Pitfalls for Beginners**

As you start working with FOAM3, here are some common issues to watch out for:

### **1. Forgetting to use create()**

Unlike JavaScript classes, FOAM3 classes are instantiated with `create()`, not the `new` keyword:

```javascript
// Incorrect
var person = new Person({ firstName: 'John' });

// Correct
var person = Person.create({ firstName: 'John' });
```

### **2. Not handling promises from DAOs**

DAO operations return promises that need to be handled:

```javascript
// Incorrect
var obj = dao.find(id); // obj is a promise, not the actual object

// Correct
dao.find(id).then(function(obj) {
  // Now you have the actual object
});
```

### **3. Modifying expressions directly**

Properties defined with expressions should not be set directly:

```javascript
// Incorrect
rect.area = 100; // This will be overwritten when width or height changes

// Correct
// Modify the source properties instead
rect.width = 10;
rect.height = 10;
```

### **4. Missing required properties**

If a property is marked as `required: true`, FOAM3 will throw an error if it's not provided:

```javascript
// If 'name' is required, this will throw an error
var product = Product.create({ price: 10 });

// Correct
var product = Product.create({ name: 'Widget', price: 10 });
```

## **FOAM3 Syntax Reference**

For a comprehensive reference of FOAM3-specific syntax, patterns, and features covered in this tutorial and beyond, check out our [FOAM3 Syntax Guide](FOAM-Syntax.md). This guide is an invaluable resource that explains key FOAM concepts like properties, methods, reactive programming, imports/exports, and more.

## **Next Steps**

Now that you understand the core concepts of FOAM3, you're ready to apply this knowledge to build a real application. In the next section, we'll start building our Phone Catalog app by defining the data model.

## **[NEXT: Defining the Model](3a-model.md)**

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

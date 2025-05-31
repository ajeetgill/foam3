---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/3c-UI/
tutorial: 3c
---

# **Building UI with U2 in FOAM3**

This section introduces FOAM3's UI library called U2, which provides a declarative way to build user interfaces that automatically stay in sync with your data model.

## **What You'll Learn**
- The core concepts of FOAM3's U2 UI library
- How to create and style UI components
- How to bind UI elements to your data models
- How to handle user interactions
- How to create reusable view components
- How to build the Phone Catalog UI

## **Understanding U2**

U2 is FOAM3's UI library that follows a declarative, component-based approach. Instead of manipulating the DOM directly, you describe what your UI should look like, and U2 handles the rendering and updates.

### **Key Concepts in U2**

1. **Elements**: The building blocks of U2 UIs, similar to DOM elements
2. **Views**: Reusable UI components that render FOAM3 models
3. **Data Binding**: Automatic synchronization between UI and data
4. **Event Handling**: Declarative way to respond to user interactions
5. **Composition**: Building complex UIs from simple components

## **Creating UI Elements**

U2 provides a chainable API for creating and manipulating UI elements:

```javascript
// File: my-foam3-app/js/ui/HelloElement.js
// Create a simple element
var element = this.E()
  .setNodeName('div')
  .addClass('greeting')
  .add('Hello, World!');

// Render it to the DOM
element.write(document.getElementById('app'));
```

### **Element Chaining Methods**

U2 elements have many chainable methods:

```javascript
// File: my-foam3-app/js/ui/ChainedElement.js
this.E()
  // Set HTML attributes
  .setNodeName('div')
  .setAttribute('id', 'main')
  .setAttribute('role', 'main')
  
  // Add CSS classes
  .addClass('container')
  .addClass('large')
  
  // Add styles
  .style({
    padding: '20px',
    color: '#333',
    backgroundColor: '#f5f5f5'
  })
  
  // Add content
  .add('Hello, ') // Add text
  .start('span')  // Start a new element
    .addClass('name')
    .add('World')
  .end()          // End the current element
  .add('!');
```

## **Data Binding**

One of the most powerful features of U2 is automatic data binding:

```javascript
// File: my-foam3-app/js/ui/PersonView.js
foam.CLASS({
  name: 'PersonView',
  extends: 'foam.u2.Element',  // Extend the base U2 Element class
  
  requires: [
    'foam.u2.TextField'  // Import the TextField component for reuse
  ],
  
  properties: [
    {
      name: 'data',      // The 'data' property will hold the Person object
      class: 'FObjectProperty',  // This is a reference to another FOAM object
      of: 'Person'      // Specifies the type of object this property holds
    }
  ],
  
  methods: [
    function render() {
      // The render method defines the UI structure using a fluent/chaining API
      this
        .addClass('person-view')
        .start('div')
          .addClass('person-name')
          .add('Name: ')           // Add text content
          .start(this.TextField)   // Create a U2 TextField component instance
            // The $ suffix creates a "slot" (reactive binding)
            // data$ is a two-way binding to the TextField's data property
            // dot() navigates to a property of the referenced object
            // So this binds TextField.data to this.data.name with two-way updates
            .data$(this.data$.dot('name'))
          .end()                  // End the TextField, return to parent div
        .end()                    // End the div, return to root element
        .start('div')
          .addClass('person-age')
          .add('Age: ')
          // Here we use add() with a slot, creating a read-only binding
          // When this.data.age changes, this text will automatically update
          .add(this.data$.dot('age'))
        .end()
        .start('div')
          .addClass('person-greeting')
          // Similarly, this creates a read-only binding to the greeting property
          .add(this.data$.dot('greeting'))
        .end();
      // The $ syntax is FOAM's reactive binding system
      // The dot() method navigates property paths within reactive bindings
    }
  ]
});
```

The `$` suffix creates a "slot" (reactive binding) to a property, allowing two-way data binding.

## **Building Our Phone List View**

Let's create a view for displaying the list of phones in our catalog:

```javascript
// File: my-foam3-app/js/ui/PhoneListView.js
foam.CLASS({
  package: 'phonecat',
  name: 'PhoneListView',
  extends: 'foam.u2.Element',
  
  requires: [
    'phonecat.Phone',
    'foam.u2.view.TableView'
  ],
  
  properties: [
    {
      name: 'data',
      class: 'foam.dao.DAOProperty',  // FOAM-specific: Specialized property type for DAOs
      required: true
    },
    {
      name: 'selection',
      // FOAM-specific: postSet is a property method that runs after a value changes
      // old = previous value, nu = new value
      postSet: function(old, nu) {
        if (nu) this.onPhoneSelected(nu);
      }
    }
  ],
  
  methods: [
    function render() {
      this
        .addClass('phone-list-view')
        .start('div')
          .addClass('phone-list-header')
          .start('h2').add('Phone Catalog').end()
          .start('div')
            .addClass('search-box')
            .start('input')
              .setAttribute('type', 'text')
              .setAttribute('placeholder', 'Search...')
              // FOAM-specific: .on() attaches an event listener to the element
              // Similar to element.addEventListener() in standard DOM
              // The listener function is automatically bound to 'this'
              .on('input', this.onSearch)
            .end()
          .end()
        .end()
        .start('div')
          .addClass('phone-list-content')
          // FOAM-specific: TableView is a FOAM UI component for displaying tabular data
          .start(this.TableView)
            .addClass('phone-table')
            // FOAM-specific: data$ binding connects this table to the DAO in this.data
            // The $ suffix creates a two-way binding between properties
            .data$(this.data$)
            // FOAM-specific: columns configuration for TableView
            // This defines which properties to display and how to label them
            .columns([
              { name: 'imageUrl', label: 'Image' },
              { name: 'name', label: 'Name' },
              { name: 'snippet', label: 'Description' },
              { name: 'age', label: 'Age (months)' }
            ])
            // FOAM-specific: selection$ binding connects the table's selected row
            // to this view's selection property (with two-way updates)
            .selection$(this.selection$)
          .end()
        .end();
    }
  ],
  
  // FOAM-specific: 'listeners' section contains event handler methods
  // These are automatically bound to 'this' so they maintain proper context
  listeners: [
    function onSearch(e) {
      var query = e.target.value.trim().toLowerCase();
      
      if (!query) {
        // If query is empty, show all phones
        this.data = this.originalData;
        return;
      }
      
      // Filter the DAO based on search query
      // FOAM-specific: mlang (Model Language) provides a query language for DAOs
      // ContainsIC = case-Insensitive Contains predicate
      var pred = foam.mlang.predicate.ContainsIC.create({
        // arg1 is the property to search (Phone.NAME is a property constant)
        arg1: phonecat.Phone.NAME,
        // arg2 is the value to search for
        arg2: query
      });
      
      // FOAM-specific: .where() filters a DAO using a predicate
      this.data = this.originalData.where(pred);
    },
    
    function onPhoneSelected(phone) {
      // FOAM-specific: .pub() publishes an event on FOAM's pub/sub system
      // Other components can subscribe to 'phoneSelected' events with .sub()
      this.pub('phoneSelected', phone);
    }
  ]
});
```

## **Creating the Phone Detail View**

Now let's create a view for displaying the details of a selected phone:

```javascript
foam.CLASS({
  package: 'phonecat',
  name: 'PhoneDetailView',
  extends: 'foam.u2.Element',
  
  properties: [
    {
      name: 'data',
      class: 'FObjectProperty',  // FOAM-specific: Property type for object references
      of: 'phonecat.Phone'       // Specifies the expected class of the object
    },
    {
      name: 'currentImageIndex',
      value: 0                   // FOAM-specific: Default value for the property
    }
  ],
  
  methods: [
    function render() {
      var self = this;
      
      this
        .addClass('phone-detail-view')
        .enableClass('phone-detail-view-hidden', this.slot(function(data) {
          return data === null;
        }))
        .start('div')
          .addClass('phone-detail-header')
          .start('h2')
            .add(this.data$.dot('name'))
          .end()
          .start('div')
            .addClass('phone-snippet')
            .add(this.data$.dot('snippet'))
          .end()
        .end()
        .start('div')
          .addClass('phone-detail-content')
          .start('div')
            .addClass('phone-images')
            .start('div')
              .addClass('main-image')
              .start('img')
                .setAttribute('src', this.slot(function(data, currentImageIndex) {
                  return data && data.images && data.images.length > 0 ?
                    data.images[currentImageIndex] : '';
                }))
              .end()
            .end()
            .start('div')
              .addClass('thumbnail-list')
              .add(this.slot(function(data) {
                if (!data || !data.images) return this.E();
                
                var thumbnails = this.E();
                data.images.forEach(function(img, index) {
                  thumbnails
                    .start('div')
                      .addClass('thumbnail')
                      .enableClass('selected', self.slot(function(currentImageIndex) {
                        return currentImageIndex === index;
                      }))
                      .on('click', function() {
                        self.currentImageIndex = index;
                      })
                      .start('img')
                        .setAttribute('src', img)
                      .end()
                    .end();
                });
                
                return thumbnails;
              }))
            .end()
          .end()
          .start('div')
            .addClass('phone-info')
            .start('div')
              .addClass('info-section')
              .start('h3').add('Availability').end()
              .add(this.slot(function(data) {
                if (!data || !data.availability) return this.E();
                
                var list = this.E().addClass('availability-list');
                data.availability.forEach(function(item) {
                  list.start('div').add(item).end();
                });
                
                return list;
              }))
            .end()
            .start('div')
              .addClass('info-section')
              .start('h3').add('Description').end()
              .start('p')
                .add(this.data$.dot('description'))
              .end()
            .end()
            // Add more sections for other phone properties...
          .end()
        .end();
    }
  ]
});
```

## **Creating the Main Application View**

Finally, let's create the main application view that combines the list and detail views:

```javascript
foam.CLASS({
  package: 'phonecat',
  name: 'PhoneCatApp',
  extends: 'foam.u2.Element',
  
  requires: [
    'phonecat.PhoneDAO',
    'phonecat.PhoneListView',
    'phonecat.PhoneDetailView'
  ],
  
  properties: [
    {
      name: 'phoneDAO',
      factory: function() {
        return this.PhoneDAO.create();
      }
    },
    {
      name: 'selectedPhone',
      value: null
    }
  ],
  
  methods: [
    function init() {
      this.SUPER();
      // Load the first phone as the default selection
      this.phoneDAO.dao.limit(1).select().then(function(sink) {
        if (sink.array.length > 0) {
          this.selectedPhone = sink.array[0];
        }
      }.bind(this));
    },
    
    function render() {
      this
        .addClass('phonecat-app')
        .start('div')
          .addClass('app-header')
          .start('h1').add('FOAM3 Phone Catalog').end()
        .end()
        .start('div')
          .addClass('app-content')
          .start('div')
            .addClass('phone-list-container')
            .start(this.PhoneListView)
              .data$(this.phoneDAO.dao$)
              .on('phoneSelected', this.onPhoneSelected)
            .end()
          .end()
          .start('div')
            .addClass('phone-detail-container')
            .start(this.PhoneDetailView)
              .data$(this.selectedPhone$)
            .end()
          .end()
        .end();
    }
  ],
  
  listeners: [
    function onPhoneSelected(phone) {
      this.selectedPhone = phone;
    }
  ]
});
```

## **Adding CSS**

We can style our application by adding CSS to our components. For a comprehensive guide to FOAM3's CSS system, including special selectors and best practices, see [FOAM CSS Guide](FOAM-CSS.md).

```javascript
// Add this to PhoneCatApp.js
foam.CLASS({
  package: 'phonecat',
  name: 'PhoneCatApp',
  extends: 'foam.u2.Element',
  
  // Other properties and methods...
  
  css: `
    .phonecat-app {
      font-family: 'Roboto', sans-serif;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .app-header {
      background-color: #3f51b5;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    
    .app-content {
      display: flex;
      flex-wrap: wrap;
    }
    
    .phone-list-container {
      flex: 1;
      min-width: 300px;
      margin-right: 20px;
    }
    
    .phone-detail-container {
      flex: 2;
      min-width: 400px;
    }
    
    @media (max-width: 768px) {
      .app-content {
        flex-direction: column;
      }
      
      .phone-list-container,
      .phone-detail-container {
        width: 100%;
        margin-right: 0;
        margin-bottom: 20px;
      }
    }
  `
});
```

## **FOAM2 vs FOAM3: UI Development**

Here's how UI development has evolved from FOAM2 to FOAM3:

**FOAM2:**
```javascript
// CSS in FOAM2
axioms: [
  foam.u2.CSS.create({
    code: `
      ^ {
        padding: 10px;
      }
    `
  })
]

// View in FOAM2
foam.CLASS({
  name: 'MyView',
  extends: 'foam.u2.Element',
  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start('div')
          .addClass(this.myClass('title'))
          .add('Title')
        .end();
    }
  ]
});
```

**FOAM3:**
```javascript
// CSS in FOAM3 (simpler)
foam.CLASS({
  name: 'MyView',
  extends: 'foam.u2.Element',
  
  css: `
    ^ {
      padding: 10px;
    }
    
    ^title {
      font-weight: bold;
    }
  `,
  
  methods: [
    function render() { // render() instead of initE()
      this
        .addClass(this.myClass())
        .start('div')
          .addClass(this.myClass('title'))
          .add('Title')
        .end();
    }
  ]
});
```

Key differences:
1. FOAM3 uses a direct `css` property instead of CSS axioms
2. The `render()` method is preferred over `initE()` in FOAM3
3. FOAM3 has improved data binding with more consistent API
4. Event handling is more streamlined in FOAM3

## **Next Steps**

Now that we've built the UI for our phone catalog, we'll explore how to handle navigation and create a complete application in the next section.

## **[NEXT: Navigation and Controllers](../3d-navigation/)**

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

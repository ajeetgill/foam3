---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/3d-navigation/
tutorial: 3d
---

# **Navigation and Controllers in FOAM3**

This section covers how to implement navigation and controllers in your FOAM3 application. We'll build on our Phone Catalog app to add routing, history support, and more advanced controller functionality.

## **What You'll Learn**
- How to implement navigation in FOAM3 applications
- How to create controllers that coordinate between models and views
- How to use FOAM3's hash-based router
- How to manage application state
- How to implement responsive layouts
- How to connect all parts of your application together

## **Understanding Controllers in FOAM3**

In the Model-View-Controller (MVC) pattern, controllers coordinate between models and views. In FOAM3, controllers are classes that:

1. Manage application state
2. Coordinate data flow between models and views
3. Handle user interactions that affect multiple components
4. Implement application-level business logic

## **Creating a Controller for Our Phone Catalog**

Let's create a controller for our phone catalog application:

```javascript
// File: my-foam3-app/js/controllers/PhoneCatController.js
foam.CLASS({
  package: 'phonecat',
  name: 'PhoneCatController',
  
  requires: [
    'phonecat.Phone',
    'phonecat.PhoneDAO',
    'phonecat.PhoneListView',
    'phonecat.PhoneDetailView'
  ],
  
  imports: [
    'window'
  ],
  
  exports: [
    'as phoneCatController',
    'phoneDAO',
    'selectedPhone$'
  ],
  
  properties: [
    {
      name: 'phoneDAO',
      factory: function() {
        return this.PhoneDAO.create().dao;
      }
    },
    {
      name: 'selectedPhone',
      value: null
    },
    {
      name: 'filterText',
      value: '',
      postSet: function(old, nu) {
        this.filterPhones();
      }
    },
    {
      name: 'filteredDAO',
      factory: function() {
        return this.phoneDAO;
      }
    },
    {
      name: 'sortOrder',
      value: 'name',
      postSet: function(old, nu) {
        this.sortPhones();
      }
    }
  ],
  
  methods: [
    function init() {
      this.SUPER();
      
      // Listen for hash changes to update the selected phone
      this.window.addEventListener('hashchange', this.onHashChange);
      
      // Initialize based on current hash
      this.onHashChange();
    },
    
    function selectPhoneById(phoneId) {
      if (!phoneId) {
        this.selectedPhone = null;
        return Promise.resolve();
      }
      
      return this.phoneDAO.find(phoneId)
        .then(function(phone) {
          this.selectedPhone = phone;
        }.bind(this))
        .catch(function(error) {
          console.error('Error finding phone:', error);
          this.selectedPhone = null;
        }.bind(this));
    },
    
    function filterPhones() {
      if (!this.filterText) {
        this.filteredDAO = this.phoneDAO;
        return;
      }
      
      // Create a case-insensitive contains predicate
      var pred = foam.mlang.predicate.ContainsIC.create({
        arg1: this.Phone.NAME,
        arg2: this.filterText
      });
      
      this.filteredDAO = this.phoneDAO.where(pred);
      
      // If we have a sort order, apply it
      this.sortPhones();
    },
    
    function sortPhones() {
      if (!this.sortOrder) return;
      
      var comparator;
      
      if (this.sortOrder === 'name') {
        comparator = this.Phone.NAME;
      } else if (this.sortOrder === 'age') {
        comparator = this.Phone.AGE;
      } else {
        return; // Unknown sort order
      }
      
      this.filteredDAO = this.filteredDAO.orderBy(comparator);
    }
  ],
  
  listeners: [
    function onHashChange() {
      // Get the phone ID from the hash (e.g., #/phones/motorola-xoom)
      var hash = this.window.location.hash;
      var match = hash.match(/^#\/phones\/(.+)$/);
      
      if (match && match[1]) {
        this.selectPhoneById(match[1]);
      } else if (hash === '#/phones') {
        // List view without a selected phone
        this.selectedPhone = null;
      } else {
        // Default to showing the phone list
        this.window.location.hash = '#/phones';
      }
    },
    
    function onPhoneSelected(phone) {
      if (phone) {
        // Update the URL hash to reflect the selected phone
        this.window.location.hash = '#/phones/' + phone.id;
      } else {
        this.window.location.hash = '#/phones';
      }
    }
  ]
});
```

## **Implementing Hash-Based Routing**

## **Implementing Navigation in FOAM3**

FOAM3 doesn't have a built-in router, but we can implement hash-based routing to enable navigation in our application. The following example shows how to create a custom router that handles different URL patterns and renders the appropriate views:

```javascript
// File: my-foam3-app/js/router/PhoneCatRouter.js
foam.CLASS({
  package: 'phonecat',
  name: 'PhoneCatRouter',
  
  // Required dependencies - views we'll need to instantiate based on routes
  requires: [
    'phonecat.PhoneListView',    // View for displaying the list of phones
    'phonecat.PhoneDetailView'   // View for displaying details of a single phone
  ],
  
  // External services and objects we need access to
  imports: [
    'phoneCatController',  // We get this from the application context
    'window'                // Browser window object for accessing location and adding event listeners
  ],
  
  properties: [
    {
      // Define the routing table - maps URL patterns to handler methods
      // Each key is a regex pattern, and each value is a function to handle that route
      name: 'routes',
      factory: function() {
        return {
          '': this.handleHomeRoute,              // Empty route (root URL)
          'phones': this.handlePhonesRoute,      // /phones - shows the phone list
          'phones/(.+)': this.handlePhoneDetailRoute  // /phones/:id - shows details for a specific phone
                                                      // The (.+) is a capture group that will match any ID
        };
      }
    },
    {
      // Keeps track of the currently displayed view
      // We need this to properly clean up old views when navigating
      name: 'currentView',
      value: null
    }
  ],
  
  methods: [
    function init() {
      // Call the parent class's init method
      this.SUPER();
      
      // Set up hash change listener to detect URL changes
      // This is how we respond to navigation events like back/forward buttons
      this.window.addEventListener('hashchange', this.onHashChange);
      
      // Trigger initial routing when the app first loads
      this.onHashChange();
    },
    
    function handleRoute(path) {
      for (var pattern in this.routes) {
        if (!pattern) {
          if (!path) return this.routes[pattern].call(this);
          continue;
        }
        
        // Create a regex from the route pattern
        var regex = new RegExp('^' + pattern + '$');
        var match = path.match(regex);
        
        // If we have a match, call the appropriate handler
        // and pass any captured parameters from the URL
        if (match) {
          return this.routes[pattern].call(this, match.slice(1));
        }
      }
      
      // Fallback - if no route matches, go to home
      return this.handleHomeRoute();
    },
    
    // Handler for the root route - redirects to phones list
    function handleHomeRoute() {
      // Update the URL and delegate to the phones route handler
      this.window.location.hash = '#/phones';
      return this.handlePhonesRoute();
    },
    
    // Handler for the phones list route
    function handlePhonesRoute() {
      // Create a new PhoneListView instance
      // data$ binds the filteredDAO from the controller to this view
      // The $ suffix indicates a property binding (reactive data connection)
      return this.PhoneListView.create({
        data$: this.phoneCatController.filteredDAO$,
        onPhoneSelected: this.phoneCatController.onPhoneSelected.bind(this.phoneCatController)
      });
    },
    
    // Handler for the phone detail route with parameter for phone ID
    function handlePhoneDetailRoute(params) {
      // Extract the phone ID from the URL parameters
      var phoneId = params[0];
      
      // Tell the controller which phone is selected
      this.phoneCatController.selectPhoneById(phoneId);
      
      // Create a page layout with both the list and detail views side by side
      var Element = foam.u2.Element;
      var view = Element.create();
      
      view
        .addClass('phone-detail-page')
        .start('div')
          .addClass('container')
          .start('div')
            .addClass('row')
            .start('div')
              .addClass('col-md-4')
              .tag(this.PhoneListView, {    // Insert the PhoneListView
                // Bind the data source and selection to controller properties
                data$: this.phoneCatController.filteredDAO$,
                selection$: this.phoneCatController.selectedPhone$,
                onPhoneSelected: this.phoneCatController.onPhoneSelected.bind(this.phoneCatController)
              })
            .end()
            .start('div')
              .addClass('col-md-8')
              .tag(this.PhoneDetailView, {  // Insert the PhoneDetailView
                data$: this.phoneCatController.selectedPhone$  // Bind to selected phone
              })
            .end()
          .end()
        .end();
      
      return view;
    }
  ],
  
  listeners: [
    function onHashChange() {
      // Extract the path from the hash portion of the URL
      var hash = this.window.location.hash;
      var path = hash.replace(/^#\//, ''); // Remove '#/' prefix
      
      // Process the route and get back a view to display
      var view = this.handleRoute(path);
      
      if (view && this.currentView !== view) {
        if (this.currentView) {
          this.currentView.remove();
        }
        
        // Save the new view as current
        this.currentView = view;
        // Render the view into the app container
        view.write(document.getElementById('app'));
      }
    }
  ]
});
```

## **Connecting Everything Together**

With our router implementation in place, we now need to connect all the pieces of our application together. The main application class will:

1. Initialize the controller that manages application state and data
2. Set up the router to handle navigation
3. Export shared objects to the context so they can be imported by other components

Here's how we create the main application file:

```javascript
// File: my-foam3-app/js/PhoneCatApplication.js
foam.CLASS({
  package: 'phonecat',
  name: 'PhoneCatApplication',
  
  requires: [
    'phonecat.PhoneCatController',
    'phonecat.PhoneCatRouter'
  ],
  
  exports: [
    'phoneCatController'  // We export the controller so views and router can access it
  ],
  
  properties: [
    {
      // The main controller instance
      name: 'phoneCatController',
      // Factory function creates the controller when needed
      factory: function() {
        return this.PhoneCatController.create();
      }
    },
    {
      // The router instance
      name: 'router',
      // Factory function creates the router when needed
      factory: function() {
        return this.PhoneCatRouter.create();
      }
    }
  ],
  
  methods: [
    function init() {
      this.SUPER();
      
      // Create the controller and router
      this.phoneCatController;
      this.router;
    }
  ]
});
```

## **Adding Search and Sorting Controls**

Let's enhance our `PhoneListView` to include search and sorting controls:

```javascript
foam.CLASS({
  package: 'phonecat',
  name: 'PhoneListView',
  extends: 'foam.u2.Element',
  
  requires: [
    'foam.u2.view.TableView'
  ],
  
  imports: [
    'phoneCatController'
  ],
  
  properties: [
    {
      name: 'data',
      class: 'foam.dao.DAOProperty'
    },
    {
      name: 'selection'
    }
  ],
  
  methods: [
    function render() {
      this
        .addClass('phone-list-view')
        .start('div')
          .addClass('controls')
          .start('div')
            .addClass('search-box')
            .start('input')
              .setAttribute('type', 'text')
              .setAttribute('placeholder', 'Search...')
              .addClass('form-control')
              .attr('value', this.phoneCatController.filterText$)
              .on('input', function(e) {
                this.phoneCatController.filterText = e.target.value;
              })
            .end()
          .end()
          .start('div')
            .addClass('sort-controls')
            .add('Sort by: ')
            .start('select')
              .addClass('form-control')
              .on('change', function(e) {
                this.phoneCatController.sortOrder = e.target.value;
              })
              .start('option')
                .setAttribute('value', 'name')
                .add('Alphabetical')
                .attrs({
                  selected: { factory: function() { 
                    return this.phoneCatController.sortOrder === 'name'; 
                  }}
                })
              .end()
              .start('option')
                .setAttribute('value', 'age')
                .add('Newest')
                .attrs({
                  selected: { factory: function() { 
                    return this.phoneCatController.sortOrder === 'age'; 
                  }}
                })
              .end()
            .end()
          .end()
        .end()
        .start(this.TableView)
          .addClass('phone-table')
          .data$(this.data$)
          .columns([
            {
              name: 'imageUrl',
              label: '',
              formatter: function(imageUrl, _, phone) {
                return foam.u2.Element.create()
                  .start('img')
                    .setAttribute('src', imageUrl)
                    .style({
                      width: '50px',
                      height: '50px',
                      objectFit: 'contain'
                    })
                  .end();
              }
            },
            { name: 'name', label: 'Name' },
            { name: 'snippet', label: 'Description' }
          ])
          .selection$(this.selection$)
          .on('click', function(_, __, ___, obj) {
            this.phoneCatController.onPhoneSelected(obj);
          })
        .end();
    }
  ]
});
```

## **Responsive Layout with CSS**

Let's add responsive layout CSS to our application to ensure it looks good on all devices:

```javascript
// Add this to the PhoneCatApplication class
foam.CLASS({
  package: 'phonecat',
  name: 'PhoneCatApplication',
  
  // Previous code...
  
  css: `
    body {
      font-family: 'Roboto', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    
    /* Main application container with max width and centered */
    #app {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    /* Standard container class for consistent spacing */
    .container {
      width: 100%;
      padding-right: 15px;
      padding-left: 15px;
      margin-right: auto;
      margin-left: auto;
    }
    
    /* Flexbox row for creating grid layouts */
    .row {
      display: flex;
      flex-wrap: wrap;
      margin-right: -15px;
      margin-left: -15px;
    }
    
    .col-md-4 {
      flex: 0 0 33.333333%; /* Don't grow, don't shrink, take 1/3 width */
      max-width: 33.333333%;
      padding-right: 15px;
      padding-left: 15px;
    }
    
    .col-md-8 {
      flex: 0 0 66.666667%;
      max-width: 66.666667%;
      padding-right: 15px;
      padding-left: 15px;
    }
    
    @media (max-width: 768px) {
      .row {
        flex-direction: column;
      }
      
      .col-md-4,
      .col-md-8 {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 20px;
      }
    }
    
    .phone-list-view {
      background-color: white;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 20px;
    }
    
    .controls {
      margin-bottom: 20px;
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .search-box {
      flex: 2; /* Takes twice as much space as sort controls */
      min-width: 200px; /* Ensures minimum usable width */
    }
    
    .sort-controls {
      flex: 1;
      min-width: 150px;
    }
    
    .form-control {
      display: block;
      width: 100%;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      color: #495057;
      background-color: #fff;
      border: 1px solid #ced4da;
      border-radius: 0.25rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }
    
    .phone-table {
      width: 100%;
      border-collapse: collapse; /* Removes double borders */
    }
    
    .phone-table th {
      text-align: left;
      padding: 12px;
      border-bottom: 2px solid #ddd;
    }
    
    .phone-table td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }
    
    .phone-table tr:hover {
      background-color: #f5f5f5;
      cursor: pointer;
    }
    
    /* Phone detail view container */
    .phone-detail-view {
      background-color: white;
      border-radius: 4px; /* Rounded corners */
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* Subtle shadow for depth */
      padding: 20px;
    }
  `
});
```

## **Creating Our Main HTML File**

Finally, let's create the `index.html` file that will load our application:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FOAM3 Phone Catalog</title>
  
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  
  <!-- FOAM3 Library -->
  <script src="../path/to/foam3/src/foam.js"></script>
  
  <!-- Our Application Files -->
  <script src="js/Phone.js"></script>
  <script src="js/PhoneDAO.js"></script>
  <script src="js/PhoneListView.js"></script>
  <script src="js/PhoneDetailView.js"></script>
  <script src="js/PhoneCatController.js"></script>
  <script src="js/PhoneCatRouter.js"></script>
  <script src="js/PhoneCatApplication.js"></script>
</head>
<body>
  <div id="app"></div>
  
  <script>
    // Initialize the application
    var app = phonecat.PhoneCatApplication.create();
  </script>
</body>
</html>
```

## **FOAM2 vs FOAM3: Navigation and Controllers**

Here's how navigation and controllers have evolved from FOAM2 to FOAM3:

**FOAM2:**
```javascript
// Controller in FOAM2
foam.CLASS({
  name: 'PhoneCatController',
  implements: ['foam.mlang.Expressions'],
  
  imports: [
    'window'
  ],
  
  exports: [
    'as controller',
    'phoneDAO as dao'
  ],
  
  properties: [
    {
      name: 'phoneDAO',
      factory: function() {
        return this.PhoneDAO.create();
      }
    }
  ],
  
  methods: [
    function init() {
      this.SUPER();
      this.window.addEventListener('hashchange', this.onHashChange);
    }
  ],
  
  listeners: [
    function onHashChange() {
      // Hash-based routing
    }
  ]
});
```

**FOAM3:**
```javascript
// Controller in FOAM3
foam.CLASS({
  package: 'phonecat', // Package namespacing is more common in FOAM3
  name: 'PhoneCatController',
  
  implements: ['foam.mlang.Expressions'], // Still available but often not needed
  
  imports: [
    'window'
  ],
  
  exports: [
    'as phoneCatController', // More specific export names
    'phoneDAO'
  ],
  
  properties: [
    {
      name: 'phoneDAO',
      factory: function() {
        return this.PhoneDAO.create().dao; // Often return the DAO property directly
      }
    }
  ],
  
  methods: [
    function init() {
      this.SUPER();
      // More ES6-style event handling
      this.window.addEventListener('hashchange', this.onHashChange);
    }
  ],
  
  listeners: [
    function onHashChange() {
      // Promise-based routing with async/await support
    }
  ]
});
```

Key differences:
1. FOAM3 makes more use of packages for organization
2. FOAM3 uses more Promise-based asynchronous operations
3. FOAM3 has a more consistent API for data binding and events
4. FOAM3 often separates routing more cleanly from controllers
5. CSS in FOAM3 is typically defined directly on the class

## **Advanced Topics**

Here are some advanced topics you might want to explore next:

### **1. Server-Side Rendering**

FOAM3 can be used on the server with Node.js to pre-render content:

```javascript
// Server-side rendering with FOAM3 and Express
const express = require('express');
const app = express();
const foam = require('foam3/src/foam.js');

// Load your FOAM3 classes
require('./js/Phone.js');
require('./js/PhoneDAO.js');
// ...

app.get('/', async (req, res) => {
  // Create your application
  const phoneCatApp = global.phonecat.PhoneCatApplication.create();
  
  // Render to HTML
  const html = await phoneCatApp.renderToString();
  
  // Send the response
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>FOAM3 Phone Catalog</title>
        <!-- Include your CSS and JavaScript -->
      </head>
      <body>
        <div id="app">${html}</div>
        <script>
          // Initialize client-side application
          var app = phonecat.PhoneCatApplication.create();
        </script>
      </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### **2. State Management**

For more complex applications, you might want to implement a centralized state management pattern:

```javascript
foam.CLASS({
  package: 'phonecat',
  name: 'AppState',
  
  properties: [
    {
      name: 'currentRoute',
      value: 'home'
    },
    {
      name: 'selectedPhoneId',
      value: null
    },
    {
      name: 'filterText',
      value: ''
    },
    {
      name: 'sortOrder',
      value: 'name'
    }
  ]
});

// Then use this state object throughout your application
foam.CLASS({
  package: 'phonecat',
  name: 'PhoneCatApplication',
  
  requires: [
    'phonecat.AppState'
  ],
  
  exports: [
    'state',
    'dispatch'
  ],
  
  properties: [
    {
      name: 'state',
      factory: function() {
        return this.AppState.create();
      }
    }
  ],
  
  methods: [
    function dispatch(action, payload) {
      // Handle actions to update state
      switch (action) {
        case 'NAVIGATE':
          this.state.currentRoute = payload.route;
          this.state.selectedPhoneId = payload.phoneId || null;
          break;
        case 'SET_FILTER':
          this.state.filterText = payload;
          break;
        case 'SET_SORT':
          this.state.sortOrder = payload;
          break;
      }
    }
  ]
});
```

## **Next Steps**

Congratulations! You've completed the basic tutorial for building a FOAM3 application. Here are some next steps to continue your learning:

1. Add more features to the Phone Catalog app, such as a shopping cart or user reviews
2. Explore integrating with backend services and APIs
3. Implement more advanced UI patterns like infinite scrolling or animations
4. Add testing for your FOAM3 components
5. Explore performance optimizations for larger applications

In the next section, we'll dive into advanced FOAM3 features to take your applications to the next level.

## **[NEXT: Advanced FOAM3 Features](4-advanced.md)**

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

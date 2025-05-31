---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/1-gettingstarted/
tutorial: 1
---

# **Getting Started with FOAM3**

In this section, we'll set up your development environment and create your first FOAM3 application. By the end, you'll have a functioning "Hello World" app and be ready to dive deeper into FOAM3 concepts.

## **What You'll Learn**
- How to set up FOAM3 in your project
- The basic structure of a FOAM3 application
- How to create a simple FOAM3 class
- How to render UI elements
- How to run your FOAM3 application

## **Setting Up Your Environment**

### **Step 1: Clone the FOAM3 Repository**

Start by cloning the FOAM3 repository to your local machine:

```bash
# Command to run in your terminal
git clone https://github.com/kgrgreer/foam3.git
cd foam3
```

### **Step 2: Set Up Your Project Directory**

Create a new directory for your project outside the FOAM3 repository:

```bash
# Command to run in your terminal
mkdir my-foam3-app
cd my-foam3-app
```

### **Step 3: Create Your HTML Entry Point**

Create an `index.html` file in your project directory:

```html
<!-- File: my-foam3-app/index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>My First FOAM3 App</title>
  <!-- FOAM3 core library -->
  <script src="../path/to/foam3/src/foam.js"></script>
</head>
<body>
  <div id="app"></div>
  
  <!-- Your application code -->
  <script src="HelloWorld.js"></script>
  <script>
    // Initialize your application
    foam.CLASS({
      name: 'HelloWorldApp',
      requires: [
        'HelloWorld'
      ],
      exports: [
        'as data'
      ],
      properties: [
        {
          name: 'helloWorld',
          factory: function() {
            return this.HelloWorld.create();
          }
        }
      ],
      methods: [
        function init() {
          // Mount the app to the DOM
          this.helloWorld.write(document.getElementById('app'));
        }
      ]
    });

    // Start the application
    var app = HelloWorldApp.create();
  </script>
</body>
</html>
```

### **Step 4: Create Your First FOAM3 Class**

Create a file called `HelloWorld.js` in your project directory:

```javascript
// File: my-foam3-app/HelloWorld.js
foam.CLASS({
  name: 'HelloWorld',
  
  // Properties define your data model
  properties: [
    {
      name: 'message',
      value: 'Hello, FOAM3!'
    }
  ],
  
  // Methods define your business logic
  methods: [
    // This method creates the UI
    function render() {
      // FOAM3 uses a declarative UI system called U2
      return this.E()  // E() creates a new Element
        .setNodeName('div')
        .addClass('hello-world')
        .style({
          padding: '20px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif'
        })
        .add(
          this.E().setNodeName('h1')
            .add(this.message)
            .style({
              color: '#4285f4'
            })
        )
        .add(
          this.E().setNodeName('button')
            .add('Click Me')
            .style({
              padding: '8px 16px',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            })
            .on('click', this.onClick)
        );
    }
  ],
  
  // Listeners handle events
  listeners: [
    function onClick() {
      // Update the message property
      this.message = 'Hello, FOAM3! You clicked the button!';
    }
  ]
});
```

## **Running Your Application**

To run your application, you'll need a local web server. Here are a few options:

### **Using Python**

If you have Python installed, run one of the following commands in your project directory:

For Python 3:
```bash
# Command to run in your terminal (Python 3)
python -m http.server 8000
```

For Python 2:
```bash
# Command to run in your terminal (Python 2)
python -m SimpleHTTPServer 8000
```

### **Using Node.js**

If you have Node.js installed, you can use the `http-server` package:

```bash
# Command to run in your terminal (Node.js)
# Install http-server globally if you haven't already
npm install -g http-server

# Run the server
http-server -p 8000
```

Once your server is running, open your browser and navigate to `http://localhost:8000` to see your application.

## **Understanding What You Just Built**

Let's break down the key components of your first FOAM3 application:

### **1. Class Definition**

```javascript
// File: my-foam3-app/HelloWorld.js
foam.CLASS({
  name: 'HelloWorld',
  // ...
});
```

In FOAM3, everything starts with a class definition. The `foam.CLASS()` function is the core building block for creating models, views, and controllers.

### **2. Properties**

```javascript
properties: [
  {
    name: 'message',
    value: 'Hello, FOAM3!'
  }
]
```

Properties define the data model of your class. In this case, we have a single property called `message` with a default value. Properties in FOAM3 are reactive - when they change, any UI elements displaying them automatically update.

### **3. Methods**

```javascript
methods: [
  function render() {
    // UI rendering code
  }
]
```

Methods define the behavior of your class. The `render()` method is called when your component needs to be displayed.

### **4. UI Building with U2**

```javascript
return this.E()
  .setNodeName('div')
  .addClass('hello-world')
  // ...
```

FOAM3 uses a chainable API for building UI elements. `this.E()` creates a new Element (similar to a DOM element) that you can customize and nest.

### **5. Event Handling**

```javascript
.on('click', this.onClick)
```

Events are handled by attaching listeners to UI elements. In this case, we're listening for a click event and calling the `onClick` listener when it happens.

### **6. Listeners**

```javascript
listeners: [
  function onClick() {
    this.message = 'Hello, FOAM3! You clicked the button!';
  }
]
```

Listeners are special methods that handle events. When the `onClick` listener changes the `message` property, the UI automatically updates to show the new value - demonstrating FOAM3's reactive nature.

## **The FOAM3 Development Workflow**

The typical development workflow in FOAM3 follows these steps:

1. **Define your models** - Create classes that represent your data
2. **Define your views** - Create classes that render your data
3. **Connect with controllers** - Create classes that handle user interactions
4. **Compose your application** - Connect everything together

This pattern follows the Model-View-Controller (MVC) architecture, which we'll explore more in the next section.

## **Debugging Tips**

FOAM3 provides several tools to help you debug your applications:

### **Inspect FOAM3 Objects**

In your browser console, you can access any FOAM3 object to inspect its properties and methods:

```javascript
// Get a reference to your application
var app = foam.__context__.lookup('HelloWorldApp').create();

// Inspect it
console.log(app);

// Access properties
console.log(app.helloWorld.message);
```

### **Enable Debug Mode**

FOAM3 has a debug mode that provides more detailed logging:

```javascript
foam.debugger.enabled = true;
```

## **Next Steps**

Now that you've created your first FOAM3 application, you're ready to learn more about FOAM3's core concepts. In the next section, we'll explore the fundamental principles that make FOAM3 powerful and unique.

## **[NEXT: Core Concepts](2-concepts.md)**

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

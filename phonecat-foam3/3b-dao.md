---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/3b-dao/
tutorial: 3b
---

# **Working with DAOs in FOAM3**

In this section, we'll explore how to work with Data Access Objects (DAOs) in FOAM3. DAOs are a fundamental part of any FOAM3 application, providing a consistent interface for storing, retrieving, and manipulating data.

## **What You'll Learn**
- What DAOs are and why they're important in FOAM3
- How to create different types of DAOs
- How to perform CRUD operations (Create, Read, Update, Delete)
- How to filter, sort, and query data
- How to use FOAM3's MLANG (Model Language) for advanced queries
- How to create relationships between data using DAOs

## **Understanding DAOs in FOAM3**

A DAO (Data Access Object) is an abstraction layer that provides a consistent interface for working with data, regardless of where that data comes from or is stored. In FOAM3, all DAOs share the same interface, which means you can switch between different data sources without changing your application code.

For example, you could start development with an in-memory DAO:

```javascript
// File: my-foam3-app/js/dao/example-array-dao.js
// Using an in-memory DAO during development
var phoneDAO = foam.dao.ArrayDAO.create({
  of: phonecat.Phone
});

// Your application code
async function findPhoneById(id) {
  return await phoneDAO.find(id);
}
```

Later, you might switch to a REST-based DAO for production:

```javascript
// File: my-foam3-app/js/dao/example-rest-dao.js
// Switch to a REST DAO for production
var phoneDAO = foam.dao.RestDAO.create({
  of: phonecat.Phone,
  baseURL: 'https://api.example.com/phones'
});

// Your application code remains the same!
async function findPhoneById(id) {
  return await phoneDAO.find(id);
}
```

Or perhaps you need to store data locally for offline use:

```javascript
// File: my-foam3-app/js/dao/example-idb-dao.js
// Switch to IndexedDB for offline storage
var phoneDAO = foam.dao.IDBDAO.create({
  of: phonecat.Phone,
  name: 'phones'
});

// Again, your application code doesn't change
async function findPhoneById(id) {
  return await phoneDAO.find(id);
}
```

This consistent interface means you can focus on your business logic without worrying about the specifics of data storage and retrieval.

### **The DAO Interface**

All FOAM3 DAOs support these core operations:

- **put(obj)**: Create or update an object
- **find(id)**: Find an object by its ID
- **remove(obj)**: Delete an object
- **select(sink)**: Query for multiple objects
- **removeAll(skip, limit, order, predicate)**: Delete multiple objects
- **listen(sink)**: Listen for changes to the DAO

These operations are asynchronous and return Promises in FOAM3, allowing for non-blocking operations.

## **Creating a DAO for Our Phone Catalog**

For our phone catalog application, we'll create a DAO to manage our collection of phones. We'll start with an in-memory DAO that we can later extend to use other storage mechanisms.

### **Step 1: Create the DAO File**

Create a file named `PhoneDAO.js` in your project directory:

```javascript
// File: my-foam3-app/js/dao/PhoneDAO.js
/**
 * DAO configuration for the Phone Catalog application.
 * This file sets up the data access layer for phone data.
 */
foam.CLASS({
  package: 'phonecat',
  name: 'PhoneDAO',
  
  requires: [
    'foam.dao.ArrayDAO',
    'foam.dao.LocalStorageDAO',
    'foam.dao.EasyDAO',
    'phonecat.Phone'
  ],
  
  exports: [
    'as phoneDAO'
  ],
  
  properties: [
    {
      name: 'dao',
      factory: function() {
        // Create an EasyDAO - a factory for creating DAOs with various features
        return this.EasyDAO.create({
          of: this.Phone,           // The model this DAO handles
          daoType: 'ARRAY',         // Store in memory (for now)
          seqNo: true,              // Auto-assign IDs if not provided
          cache: true,              // Add caching for better performance
          dedup: true,              // Remove duplicates
          logging: true,            // Log DAO operations for debugging
          testData: this.generateTestData  // Generate initial data
        });
      }
    }
  ],
  
  methods: [
    {
      name: 'generateTestData',
      documentation: 'Generates sample phone data for testing',
      code: function() {
        return [
          this.Phone.create({
            id: 'motorola-xoom',
            name: 'Motorola XOOM™ with Wi-Fi',
            snippet: 'The Next, Next Generation tablet.',
            age: 36,
            imageUrl: 'img/phones/motorola-xoom-with-wi-fi.0.jpg',
            images: [
              'img/phones/motorola-xoom-with-wi-fi.0.jpg',
              'img/phones/motorola-xoom-with-wi-fi.1.jpg',
              'img/phones/motorola-xoom-with-wi-fi.2.jpg',
              'img/phones/motorola-xoom-with-wi-fi.3.jpg',
              'img/phones/motorola-xoom-with-wi-fi.4.jpg',
              'img/phones/motorola-xoom-with-wi-fi.5.jpg'
            ],
            android: {
              os: 'Android 3.0',
              ui: 'Honeycomb'
            },
            battery: {
              standbyTime: '336 hours',
              talkTime: '24 hours',
              type: 'Lithium Ion (Li-Ion) (24 Wh)'
            },
            camera: {
              features: ['Flash', 'Video'],
              primary: '5 megapixels'
            },
            display: {
              screenSize: '10.1 inches',
              screenResolution: 'WXGA (1200 x 800)',
              touchScreen: true
            },
            hardware: {
              accelerometer: true,
              audioJack: '3.5mm',
              cpu: '1GHz Dual Core Tegra 2',
              fmRadio: false,
              physicalKeyboard: false,
              usb: 'USB 2.0'
            },
            sizeAndWeight: {
              dimensions: ['249.1 mm (w)', '167.8 mm (h)', '12.9 mm (d)'],
              weight: '708.0 grams'
            },
            storage: {
              flash: '32000MB',
              ram: '1000MB'
            },
            connectivity: {
              bluetooth: 'Bluetooth 2.1',
              cell: '',
              gps: true,
              infrared: false,
              wifi: '802.11 b/g/n'
            },
            availability: [
              'Verizon',
              'Cellular South'
            ],
            description: 'MOTOROLA XOOM has a super-powerful dual-core processor and Android™ 3.0 (Honeycomb) — the Android platform designed specifically for tablets. With its 10.1-inch HD widescreen display, you\'ll enjoy HD video in a thin, light, powerful and upgradeable tablet.'
          }),
          this.Phone.create({
            id: 'motorola-atrix-4g',
            name: 'MOTOROLA ATRIX™ 4G',
            snippet: 'MOTOROLA ATRIX 4G the world\'s most powerful smartphone.',
            age: 28,
            imageUrl: 'img/phones/motorola-atrix-4g.0.jpg',
            // Add more properties as per our Phone model
            // ...
          }),
          // Add more phone examples here
          // ...
        ];
      }
    },
    
    // Convenience method to access the underlying DAO
    function find(id) {
      return this.dao.find(id);
    },
    
    function put(phone) {
      return this.dao.put(phone);
    },
    
    function remove(phone) {
      return this.dao.remove(phone);
    },
    
    function select(sink) {
      return this.dao.select(sink);
    },
    
    function where(predicate) {
      return this.dao.where(predicate);
    },
    
    function orderBy(comparator) {
      return this.dao.orderBy(comparator);
    },
    
    function limit(count) {
      return this.dao.limit(count);
    },
    
    function skip(count) {
      return this.dao.skip(count);
    }
  ]
});
```

### **Step 2: Using JSON Data**

In a real-world application, you might load data from a server or JSON file. Let's create a JSON DAO that loads phone data from a file:

```javascript
// Add this to PhoneDAO.js
foam.CLASS({
  package: 'phonecat',
  name: 'PhoneJSONDAO',
  
  requires: [
    'foam.dao.RestDAO',
    'foam.net.HTTPRequest',
    'foam.json.Parser',
    'phonecat.Phone'
  ],
  
  properties: [
    {
      name: 'dao',
      factory: function() {
        // Create a RestDAO to load data from a JSON file
        var dao = this.RestDAO.create({
          of: this.Phone,
          url: 'data/phones.json',
          responseType: 'json'
        });
        
        // Force load the data immediately
        dao.select().then(function(sink) {
          console.log('Loaded ' + sink.array.length + ' phones from JSON');
        });
        
        return dao;
      }
    }
  ],
  
  methods: [
    // Same convenience methods as PhoneDAO
    function find(id) { return this.dao.find(id); },
    function put(phone) { return this.dao.put(phone); },
    function remove(phone) { return this.dao.remove(phone); },
    function select(sink) { return this.dao.select(sink); },
    function where(predicate) { return this.dao.where(predicate); },
    function orderBy(comparator) { return this.dao.orderBy(comparator); },
    function limit(count) { return this.dao.limit(count); },
    function skip(count) { return this.dao.skip(count); }
  ]
});
```

### **Step 3: Create a phones.json File**

Create a `data` directory in your project and add a `phones.json` file with phone data:

```json
[
  {
    "id": "motorola-xoom",
    "name": "Motorola XOOM™ with Wi-Fi",
    "snippet": "The Next, Next Generation tablet.",
    "age": 36,
    "imageUrl": "img/phones/motorola-xoom-with-wi-fi.0.jpg",
    "images": [
      "img/phones/motorola-xoom-with-wi-fi.0.jpg",
      "img/phones/motorola-xoom-with-wi-fi.1.jpg",
      "img/phones/motorola-xoom-with-wi-fi.2.jpg",
      "img/phones/motorola-xoom-with-wi-fi.3.jpg",
      "img/phones/motorola-xoom-with-wi-fi.4.jpg",
      "img/phones/motorola-xoom-with-wi-fi.5.jpg"
    ],
    "android": {
      "os": "Android 3.0",
      "ui": "Honeycomb"
    },
    "battery": {
      "standbyTime": "336 hours",
      "talkTime": "24 hours",
      "type": "Lithium Ion (Li-Ion) (24 Wh)"
    },
    "camera": {
      "features": ["Flash", "Video"],
      "primary": "5 megapixels"
    },
    "display": {
      "screenSize": "10.1 inches",
      "screenResolution": "WXGA (1200 x 800)",
      "touchScreen": true
    },
    "hardware": {
      "accelerometer": true,
      "audioJack": "3.5mm",
      "cpu": "1GHz Dual Core Tegra 2",
      "fmRadio": false,
      "physicalKeyboard": false,
      "usb": "USB 2.0"
    },
    "sizeAndWeight": {
      "dimensions": ["249.1 mm (w)", "167.8 mm (h)", "12.9 mm (d)"],
      "weight": "708.0 grams"
    },
    "storage": {
      "flash": "32000MB",
      "ram": "1000MB"
    },
    "connectivity": {
      "bluetooth": "Bluetooth 2.1",
      "cell": "",
      "gps": true,
      "infrared": false,
      "wifi": "802.11 b/g/n"
    },
    "availability": [
      "Verizon",
      "Cellular South"
    ],
    "description": "MOTOROLA XOOM has a super-powerful dual-core processor and Android™ 3.0 (Honeycomb) — the Android platform designed specifically for tablets. With its 10.1-inch HD widescreen display, you'll enjoy HD video in a thin, light, powerful and upgradeable tablet."
  },
  {
    "id": "motorola-atrix-4g",
    "name": "MOTOROLA ATRIX™ 4G",
    "snippet": "MOTOROLA ATRIX 4G the world's most powerful smartphone.",
    "age": 28,
    "imageUrl": "img/phones/motorola-atrix-4g.0.jpg",
    "images": [
      "img/phones/motorola-atrix-4g.0.jpg",
      "img/phones/motorola-atrix-4g.1.jpg",
      "img/phones/motorola-atrix-4g.2.jpg",
      "img/phones/motorola-atrix-4g.3.jpg"
    ],
    "android": {
      "os": "Android 2.2",
      "ui": "MOTOBLUR"
    },
    "battery": {
      "standbyTime": "350 hours",
      "talkTime": "5 hours",
      "type": "Lithium Ion (Li-Ion) (1930 mAh)"
    },
    "camera": {
      "features": ["Flash", "Video"],
      "primary": "5 megapixels"
    },
    "display": {
      "screenSize": "4.0 inches",
      "screenResolution": "QHD (960 x 540)",
      "touchScreen": true
    },
    "hardware": {
      "accelerometer": true,
      "audioJack": "3.5mm",
      "cpu": "1 GHz Dual Core",
      "fmRadio": false,
      "physicalKeyboard": false,
      "usb": "USB 2.0"
    },
    "sizeAndWeight": {
      "dimensions": ["63.5 mm (w)", "117.75 mm (h)", "10.95 mm (d)"],
      "weight": "135.0 grams"
    },
    "storage": {
      "flash": "16384MB",
      "ram": "1000MB"
    },
    "connectivity": {
      "bluetooth": "Bluetooth 2.1",
      "cell": "AT&T",
      "gps": true,
      "infrared": false,
      "wifi": "802.11 b/g/n"
    },
    "availability": [
      "AT&T"
    ],
    "description": "MOTOROLA ATRIX 4G gives you dual-core processing power and the revolutionary webtop application. With webtop and a compatible Motorola docking station, sold separately, you can surf the Internet with a full Firefox browser, create and edit documents, or access multimedia on a large screen—all while your phone charges. Take it wherever you go."
  }
  // Add more phones...
]
```

## **Working with DAOs**

Now that we've created our DAO, let's explore how to use it in our application.

### **1. Basic CRUD Operations**

Here's how to perform basic CRUD (Create, Read, Update, Delete) operations with our Phone DAO:

```javascript
// Create a new PhoneDAO instance
var phoneDAO = phonecat.PhoneDAO.create();

// CREATE: Add a new phone
var newPhone = phonecat.Phone.create({
  id: 'samsung-galaxy-s21',
  name: 'Samsung Galaxy S21',
  snippet: 'The latest Samsung flagship phone.',
  // ... other properties
});

phoneDAO.put(newPhone).then(function(savedPhone) {
  console.log('Phone saved:', savedPhone.name);
});

// READ: Get a phone by ID
phoneDAO.find('motorola-xoom').then(function(phone) {
  if (phone) {
    console.log('Found phone:', phone.name);
  } else {
    console.log('Phone not found');
  }
});

// UPDATE: Modify a phone
phoneDAO.find('motorola-xoom').then(function(phone) {
  if (phone) {
    phone.snippet = 'Updated description';
    return phoneDAO.put(phone);
  }
}).then(function(updatedPhone) {
  if (updatedPhone) {
    console.log('Phone updated:', updatedPhone.name);
  }
});

// DELETE: Remove a phone
phoneDAO.find('motorola-xoom').then(function(phone) {
  if (phone) {
    return phoneDAO.remove(phone);
  }
}).then(function() {
  console.log('Phone removed');
});
```

### **2. Querying with MLANG**

FOAM3 provides a powerful query language called MLANG (Model Language) for filtering, sorting, and manipulating data:

```javascript
// Import MLANG predicates and expressions
var EQ = foam.mlang.Expressions.create().EQ;
var GT = foam.mlang.Expressions.create().GT;
var LT = foam.mlang.Expressions.create().LT;
var AND = foam.mlang.Expressions.create().AND;
var OR = foam.mlang.Expressions.create().OR;
var DESC = foam.mlang.order.Desc.create();

// Find all phones with Android 3.0
phoneDAO.where(EQ(phonecat.Phone.ANDROID.OS, 'Android 3.0'))
  .select()
  .then(function(sink) {
    console.log('Found Android 3.0 phones:', sink.array.length);
  });

// Find all phones newer than 24 months old and with a camera > 8MP
phoneDAO.where(
  AND(
    LT(phonecat.Phone.AGE, 24),
    GT(phonecat.Phone.CAMERA.PRIMARY, '8 megapixels')
  )
)
.select()
.then(function(sink) {
  console.log('Found newer phones with good cameras:', sink.array.length);
});

// Sort phones by name in descending order
phoneDAO.orderBy(DESC(phonecat.Phone.NAME))
  .select()
  .then(function(sink) {
    console.log('Phones sorted by name (descending):');
    sink.array.forEach(function(phone) {
      console.log('- ' + phone.name);
    });
  });

// Pagination: Get 10 phones, skip the first 5
phoneDAO.skip(5).limit(10)
  .select()
  .then(function(sink) {
    console.log('Phones 6-15:');
    sink.array.forEach(function(phone, i) {
      console.log((i + 6) + '. ' + phone.name);
    });
  });
```

### **3. Working with Sinks**

Sinks in FOAM3 are objects that collect and process the results of a query. Think of sinks as specialized containers that not only collect data but can also transform, aggregate, or analyze it as it flows in. They're similar to reducers in functional programming or aggregation pipelines in databases.

**What makes sinks powerful:**

- They process data as it arrives (streaming) rather than waiting for all results
- They can perform calculations without loading all data into memory
- They follow a consistent interface so they can be composed and chained
- They handle both synchronous and asynchronous data sources transparently

**Common types of sinks in FOAM3:**

- **Collection sinks**: `ArraySink` (collects objects in an array), `MapSink` (collects objects by ID)
- **Aggregation sinks**: `Count`, `Sum`, `Average`, `Min`, `Max`
- **Transformation sinks**: `Map` (transforms objects), `Sequence` (chains multiple sinks)
- **Grouping sinks**: `GroupBy` (groups results by a property)

Here are some practical examples of sinks in action:

```javascript
// Count the number of phones
phoneDAO.select(foam.mlang.sink.Count.create())
  .then(function(sink) {
    console.log('Total phones:', sink.value);
  });

// Get the average age of phones
phoneDAO.select(foam.mlang.sink.Average.create({
  arg1: phonecat.Phone.AGE
}))
.then(function(sink) {
  console.log('Average phone age:', sink.value);
});

// Group phones by manufacturer
phoneDAO.select(foam.mlang.sink.GroupBy.create({
  arg1: function(phone) {
    // Extract manufacturer from name (simplified example)
    return phone.name.split(' ')[0];
  },
  arg2: foam.mlang.sink.Count.create()
}))
.then(function(sink) {
  console.log('Phones by manufacturer:');
  for (var key in sink.groups) {
    console.log('- ' + key + ': ' + sink.groups[key].value);
  }
});
```

### **4. Listening for Changes**

FOAM3 DAOs can notify you when data changes:

```javascript
// Create a listener
var listener = {
  put: function(phone) {
    console.log('Phone added or updated:', phone.name);
  },
  remove: function(phone) {
    console.log('Phone removed:', phone.id);
  },
  reset: function() {
    console.log('DAO reset');
  }
};

// Start listening
phoneDAO.dao.listen(listener);

// Make changes
phoneDAO.put(phonecat.Phone.create({
  id: 'test-phone',
  name: 'Test Phone'
}));

// Stop listening
phoneDAO.dao.unlisten(listener);
```

## **Advanced DAO Features**

FOAM3 provides several advanced DAO features that can be useful in real-world applications:

### **1. Caching**

Improve performance by caching results:

```javascript
// Create a cached DAO
var cachedDAO = foam.dao.CachingDAO.create({
  src: phoneDAO.dao,
  cache: foam.dao.MDAO.create({ of: phonecat.Phone })
});
```

### **2. Decorators**

Modify DAO behavior with decorators:

> Note: The 'delegate' property is a key part of DAO decorators - [learn more about DAO Decorators here](DAO-Decorators.md)
```javascript
// Add logging to a DAO
var loggingDAO = foam.dao.LoggingDAO.create({
  delegate: phoneDAO.dao, // 'delegate' property
  name: 'PhoneDAO'
});

// Add validation to a DAO
var validatingDAO = foam.dao.ValidatingDAO.create({
  delegate: phoneDAO.dao, // This links to the underlying DAO being decorated
  validator: {
    validate: function(phone) {
      if (!phone.name || phone.name.length < 3) {
        throw new Error('Phone name must be at least 3 characters');
      }
    }
  }
});
```

### **3. Relationships**

FOAM3 supports relationships between objects:

```javascript
// Define a manufacturer model
foam.CLASS({
  package: 'phonecat',
  name: 'Manufacturer',
  
  properties: [
    {
      name: 'id',
      class: 'String',
      required: true
    },
    {
      name: 'name',
      class: 'String',
      required: true
    },
    {
      name: 'website',
      class: 'String'
    },
    {
      name: 'country',
      class: 'String'
    }
  ]
});

// Add a relationship between Phone and Manufacturer
foam.RELATIONSHIP({
  sourceModel: 'phonecat.Manufacturer',
  targetModel: 'phonecat.Phone',
  forwardName: 'phones',
  inverseName: 'manufacturer',
  sourceProperty: {
    name: 'phones',
    factory: function() { return []; }
  },
  targetProperty: {
    name: 'manufacturer',
    required: true
  }
});

// Now you can access related objects
var samsung = phonecat.Manufacturer.create({
  id: 'samsung',
  name: 'Samsung',
  website: 'https://www.samsung.com',
  country: 'South Korea'
});

var galaxy = phonecat.Phone.create({
  id: 'samsung-galaxy-s21',
  name: 'Samsung Galaxy S21',
  // ...
});

// Set the relationship
galaxy.manufacturer = samsung;

// Access the relationship
console.log(galaxy.manufacturer.name); // "Samsung"
console.log(samsung.phones.length); // 1
```

## **FOAM2 vs FOAM3: DAO Usage**

Here's how DAO usage has evolved from FOAM2 to FOAM3:

**FOAM2:**
```javascript
// Create a DAO
var phoneDAO = foam.dao.ArrayDAO.create({ of: Phone });

// Put an object
phoneDAO.put(Phone.create({ id: 'test', name: 'Test Phone' }));

// Find an object (no Promise)
var phone = phoneDAO.find('test');

// Query with MLANG
phoneDAO
  .where(foam.mlang.predicate.Eq.create({
    arg1: Phone.NAME,
    arg2: 'Test Phone'
  }))
  .select();
```

**FOAM3:**
```javascript
// Create a DAO with EasyDAO
var phoneDAO = foam.dao.EasyDAO.create({
  of: phonecat.Phone,
  daoType: 'ARRAY'
});

// Put an object (returns Promise)
phoneDAO.put(phonecat.Phone.create({ id: 'test', name: 'Test Phone' }))
  .then(function(savedPhone) {
    console.log('Saved:', savedPhone.id);
  });

// Find an object (returns Promise)
phoneDAO.find('test').then(function(phone) {
  console.log('Found:', phone.name);
});

// Query with MLANG (more consistent API)
var EQ = foam.mlang.Expressions.create().EQ;
phoneDAO
  .where(EQ(phonecat.Phone.NAME, 'Test Phone'))
  .select()
  .then(function(sink) {
    console.log('Results:', sink.array.length);
  });
```

Key differences:
1. FOAM3 consistently uses Promises for asynchronous operations
2. FOAM3 provides a more streamlined API for MLANG expressions
3. FOAM3's EasyDAO simplifies configuration of complex DAO setups
4. FOAM3 has improved support for relationships between objects

## **Common Pitfalls**

Here are some common issues to watch out for when working with DAOs:

### **1. Not Handling Promises**

Since DAO operations in FOAM3 return Promises, you need to handle them properly:

```javascript
// Incorrect - not handling the Promise
var phone = phoneDAO.find('motorola-xoom');
console.log(phone.name); // Error: phone is a Promise, not a Phone

// Correct - use then() to handle the Promise
phoneDAO.find('motorola-xoom').then(function(phone) {
  console.log(phone.name);
});

// Alternatively, use async/await (in an async function)
async function getPhone() {
  const phone = await phoneDAO.find('motorola-xoom');
  console.log(phone.name);
}
```

### **2. Forgetting to Specify 'of'**

When creating a DAO, you must specify what type of objects it contains:

```javascript
// Incorrect - missing 'of' property
var dao = foam.dao.ArrayDAO.create();

// Correct
var dao = foam.dao.ArrayDAO.create({ of: phonecat.Phone });
```

### **3. Not Using select() Properly**

The `select()` method returns a Promise that resolves to a Sink, not an array:

```javascript
// Incorrect - trying to use the result directly
phoneDAO.select().forEach(function(phone) {
  // This won't work
});

// Correct - access the array property of the sink
phoneDAO.select().then(function(sink) {
  sink.array.forEach(function(phone) {
    console.log(phone.name);
  });
});
```

### **4. Modifying Objects Without Putting Them Back**

Changes to objects aren't automatically saved to the DAO:

```javascript
// Incorrect - the change won't be persisted
phoneDAO.find('motorola-xoom').then(function(phone) {
  phone.name = 'Updated Name';
  // The DAO doesn't know about this change
});

// Correct - put the object back after changing it
phoneDAO.find('motorola-xoom').then(function(phone) {
  phone.name = 'Updated Name';
  return phoneDAO.put(phone);
}).then(function() {
  console.log('Phone updated');
});
```

## **Next Steps**

Now that we've set up our data model and DAO, we're ready to build the user interface for our phone catalog. In the next section, we'll explore FOAM3's UI library to create a responsive and interactive user interface.

## **[NEXT: Building UI with U2](3c-UI.md)**

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

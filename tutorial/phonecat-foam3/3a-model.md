---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/3a-model/
tutorial: 3a
---

# **Defining the Model in FOAM3**

In this section, we'll create the data model for our Phone Catalog application. The model is the foundation of any FOAM3 application, defining the structure of our data and how it behaves.

## **What You'll Learn**
- How to define a FOAM3 model class
- How to specify different types of properties
- How to add validation and formatting
- How to create relationships between models
- How FOAM3 models differ from plain JavaScript objects

## **The Phone Model**

Our application will display a catalog of phones. Let's start by defining a `Phone` model that represents all the data we need for each phone in our catalog.

### **Step 1: Create the Phone.js File**

Create a file named `Phone.js` in your project directory:

```javascript
// File: my-foam3-app/js/models/Phone.js
/**
 * Phone model definition for the FOAM3 Phone Catalog application.
 * This model defines all the properties of a phone in our catalog.
 */
foam.CLASS({
  package: 'phonecat',
  name: 'Phone',
  
  documentation: `
    Represents a phone in the catalog with all its specifications and details.
    This model is used throughout the application to display phone information.
  `,
  
  properties: [
    {
      name: 'id',
      class: 'String',
      required: true,
      documentation: 'Unique identifier for the phone'
    },
    {
      name: 'name',
      class: 'String',
      required: true,
      documentation: 'Name of the phone model'
    },
    {
      name: 'snippet',
      class: 'String',
      documentation: 'Short description of the phone'
    },
    {
      name: 'age',
      class: 'Int',
      documentation: 'Age of the phone model in months'
    },
    {
      name: 'imageUrl',
      class: 'String',
      documentation: 'URL to the main image of the phone',
      view: { class: 'foam.u2.view.ImageView' }
    },
    {
      name: 'images',
      class: 'StringArray',
      documentation: 'Array of URLs to additional phone images'
    },
    {
      name: 'additionalFeatures',
      class: 'String',
      documentation: 'Additional features not covered by other properties'
    },
    {
      name: 'description',
      class: 'String',
      view: { class: 'foam.u2.view.ModeAltView', normalView: { class: 'foam.u2.view.TextArea', rows: 5 } },
      documentation: 'Detailed description of the phone'
    },
    // Complex nested properties for detailed specifications
    {
      name: 'android',
      class: 'FObjectProperty',
      of: 'phonecat.AndroidInfo',
      documentation: 'Android OS information',
      factory: function() { return phonecat.AndroidInfo.create(); }
    },
    {
      name: 'battery',
      class: 'FObjectProperty',
      of: 'phonecat.BatteryInfo',
      documentation: 'Battery specifications',
      factory: function() { return phonecat.BatteryInfo.create(); }
    },
    {
      name: 'camera',
      class: 'FObjectProperty',
      of: 'phonecat.CameraInfo',
      documentation: 'Camera specifications',
      factory: function() { return phonecat.CameraInfo.create(); }
    },
    {
      name: 'display',
      class: 'FObjectProperty',
      of: 'phonecat.DisplayInfo',
      documentation: 'Display specifications',
      factory: function() { return phonecat.DisplayInfo.create(); }
    },
    {
      name: 'hardware',
      class: 'FObjectProperty',
      of: 'phonecat.HardwareInfo',
      documentation: 'Hardware specifications',
      factory: function() { return phonecat.HardwareInfo.create(); }
    },
    {
      name: 'sizeAndWeight',
      class: 'FObjectProperty',
      of: 'phonecat.SizeAndWeightInfo',
      documentation: 'Physical dimensions and weight',
      factory: function() { return phonecat.SizeAndWeightInfo.create(); }
    },
    {
      name: 'storage',
      class: 'FObjectProperty',
      of: 'phonecat.StorageInfo',
      documentation: 'Storage specifications',
      factory: function() { return phonecat.StorageInfo.create(); }
    },
    {
      name: 'availability',
      class: 'StringArray',
      documentation: 'List of carriers/retailers where the phone is available'
    },
    {
      name: 'connectivity',
      class: 'FObjectProperty',
      of: 'phonecat.ConnectivityInfo',
      documentation: 'Connectivity options',
      factory: function() { return phonecat.ConnectivityInfo.create(); }
    }
  ],
  
  methods: [
    {
      name: 'isPremium',
      documentation: 'Determines if this is a premium phone based on specifications',
      code: function() {
        // Consider a phone premium if it has a high-res display and good camera
        return this.display && 
               this.display.screenResolution && 
               this.display.screenResolution.includes('1080') &&
               this.camera && 
               this.camera.primary && 
               parseInt(this.camera.primary) >= 12;
      }
    }
  ]
});
```

### **Step 2: Create Supporting Model Classes**

Now let's define the supporting model classes for the nested properties of the `Phone` model. Add these to the same `Phone.js` file:

```javascript
// File: my-foam3-app/js/models/Phone.js (continued)
// Android OS information
foam.CLASS({
  package: 'phonecat',
  name: 'AndroidInfo',
  
  properties: [
    {
      name: 'os',
      class: 'String',
      documentation: 'Android OS version'
    },
    {
      name: 'ui',
      class: 'String',
      documentation: 'Custom UI layer on top of Android'
    }
  ]
});

// Battery information
foam.CLASS({
  package: 'phonecat',
  name: 'BatteryInfo',
  
  properties: [
    {
      name: 'standbyTime',
      class: 'String',
      documentation: 'Standby time (e.g., "30 hours")'
    },
    {
      name: 'talkTime',
      class: 'String',
      documentation: 'Talk time (e.g., "8 hours")'
    },
    {
      name: 'type',
      class: 'String',
      documentation: 'Battery type (e.g., "Lithium Ion")'
    },
    {
      name: 'capacity',
      class: 'String',
      documentation: 'Battery capacity in mAh'
    }
  ]
});

// Camera information
foam.CLASS({
  package: 'phonecat',
  name: 'CameraInfo',
  
  properties: [
    {
      name: 'features',
      class: 'StringArray',
      documentation: 'Camera features (e.g., "Flash", "Video")'
    },
    {
      name: 'primary',
      class: 'String',
      documentation: 'Primary camera resolution (e.g., "8 megapixels")'
    }
  ]
});

// Display information
foam.CLASS({
  package: 'phonecat',
  name: 'DisplayInfo',
  
  properties: [
    {
      name: 'screenResolution',
      class: 'String',
      documentation: 'Screen resolution (e.g., "1080x1920 pixels")'
    },
    {
      name: 'screenSize',
      class: 'String',
      documentation: 'Screen size (e.g., "5.5 inches")'
    },
    {
      name: 'touchScreen',
      class: 'Boolean',
      value: true,
      documentation: 'Whether the phone has a touch screen'
    }
  ]
});

// Hardware information
foam.CLASS({
  package: 'phonecat',
  name: 'HardwareInfo',
  
  properties: [
    {
      name: 'accelerometer',
      class: 'Boolean',
      documentation: 'Whether the phone has an accelerometer'
    },
    {
      name: 'audioJack',
      class: 'String',
      documentation: 'Audio jack type (e.g., "3.5mm")'
    },
    {
      name: 'cpu',
      class: 'String',
      documentation: 'CPU specifications (e.g., "Snapdragon 855")'
    },
    {
      name: 'fmRadio',
      class: 'Boolean',
      documentation: 'Whether the phone has FM radio'
    },
    {
      name: 'physicalKeyboard',
      class: 'Boolean',
      documentation: 'Whether the phone has a physical keyboard'
    },
    {
      name: 'usb',
      class: 'String',
      documentation: 'USB type (e.g., "USB Type-C")'
    }
  ]
});

// Size and weight information
foam.CLASS({
  package: 'phonecat',
  name: 'SizeAndWeightInfo',
  
  properties: [
    {
      name: 'dimensions',
      class: 'StringArray',
      documentation: 'Dimensions in different units'
    },
    {
      name: 'weight',
      class: 'String',
      documentation: 'Weight (e.g., "140 grams")'
    }
  ]
});

// Storage information
foam.CLASS({
  package: 'phonecat',
  name: 'StorageInfo',
  
  properties: [
    {
      name: 'flash',
      class: 'String',
      documentation: 'Flash storage capacity (e.g., "128 GB")'
    },
    {
      name: 'ram',
      class: 'String',
      documentation: 'RAM amount (e.g., "6 GB")'
    }
  ]
});

// Connectivity information
foam.CLASS({
  package: 'phonecat',
  name: 'ConnectivityInfo',
  
  properties: [
    {
      name: 'bluetooth',
      class: 'String',
      documentation: 'Bluetooth version (e.g., "5.0")'
    },
    {
      name: 'cell',
      class: 'StringArray',
      documentation: 'Cellular network compatibility'
    },
    {
      name: 'gps',
      class: 'Boolean',
      documentation: 'Whether the phone has GPS'
    },
    {
      name: 'infrared',
      class: 'Boolean',
      documentation: 'Whether the phone has infrared'
    },
    {
      name: 'wifi',
      class: 'String',
      documentation: 'WiFi standards supported (e.g., "802.11 a/b/g/n/ac")'
    }
  ]
});
```

## **Key Concepts in FOAM3 Models**

Let's break down the key concepts in our Phone model:

### **1. Class Definition**

FOAM3 models are defined using `foam.CLASS()`:

```javascript
foam.CLASS({
  package: 'phonecat',  // Optional namespace
  name: 'Phone',        // Required class name
  // ...
});
```

The `package` and `name` together form the fully qualified class name (`phonecat.Phone`).

### **2. Documentation**

FOAM3 encourages self-documenting code with the `documentation` property:

```javascript
documentation: `
  Represents a phone in the catalog with all its specifications and details.
  This model is used throughout the application to display phone information.
`,
```

Using ES6 backtick strings allows for multi-line documentation that's more readable.

### **3. Property Types**

FOAM3 provides many built-in property types:

- `String`: For text values (`name`, `snippet`, etc.)
- `Int`: For integer values (`age`)
- `Boolean`: For true/false values (`touchScreen`, `accelerometer`)
- `StringArray`: For arrays of strings (`images`, `availability`)
- `FObjectProperty`: For nested FOAM objects (`android`, `battery`, etc.)

### **4. Property Features**

Properties can have additional features:

- `required: true`: The property must have a value
- `value: ...`: Default value for the property
- `view: { ... }`: Specifies how to display the property in UI
- `factory: function() { ... }`: Function to create a default value when needed
- `documentation: '...'`: Description of the property

### **5. Methods**

Models can have methods that operate on their data:

```javascript
methods: [
  {
    name: 'isPremium',
    documentation: 'Determines if this is a premium phone based on specifications',
    code: function() {
      // Method implementation
    }
  }
]
```

### **6. Nested Models**

FOAM3 supports complex data structures through nested models. We created separate models for different aspects of a phone:

- `AndroidInfo` for OS information
- `BatteryInfo` for battery specifications
- `CameraInfo` for camera details
- And so on...

This organization makes the code more maintainable and allows for better reusability.

## **FOAM2 vs FOAM3: Model Definitions**

Here's how defining models has evolved from FOAM2 to FOAM3:

**FOAM2:**
```javascript
foam.CLASS({
  name: 'Phone',
  properties: [
    'id', 'age', 'name', 'snippet', 'additionalFeatures', 'android',
    'availability', 'battery', 'camera', 'connectivity', 'display',
    'description', 'hardware', 'sizeAndWeight', 'storage', 'details',
    { name: 'imageUrl', view: 'foam.u2.ImageView' },
    { name: 'images', class: 'StringArray' }
  ]
});
```

**FOAM3:**
```javascript
foam.CLASS({
  package: 'phonecat', // Package is more commonly used in FOAM3
  name: 'Phone',
  
  // Documentation using ES6 backticks instead of comment blocks
  documentation: `Represents a phone in the catalog.`,
  
  properties: [
    {
      name: 'id',
      class: 'String', // Explicit property type
      required: true,
      documentation: 'Unique identifier for the phone'
    },
    // More properties with explicit types and documentation
    {
      name: 'imageUrl',
      class: 'String',
      view: { class: 'foam.u2.view.ImageView' } // Object-based view definition
    },
    {
      name: 'images',
      class: 'StringArray',
      documentation: 'Array of URLs to additional phone images'
    }
  ]
});
```

Key differences:
1. More extensive use of the `package` attribute
2. ES6 backtick strings for multi-line documentation
3. More explicit property definitions with type information
4. View definitions use object syntax instead of string references
5. Documentation is more comprehensive at both class and property levels

## **Using the Phone Model**

Now that we've defined our `Phone` model, we can create instances of it:

```javascript
// Create a new phone
var phone = phonecat.Phone.create({
  id: 'motorola-xoom',
  name: 'Motorola XOOM™ with Wi-Fi',
  snippet: 'The Next, Next Generation tablet.',
  age: 36,
  imageUrl: 'img/phones/motorola-xoom-with-wi-fi.0.jpg',
  images: [
    'img/phones/motorola-xoom-with-wi-fi.0.jpg',
    'img/phones/motorola-xoom-with-wi-fi.1.jpg',
    'img/phones/motorola-xoom-with-wi-fi.2.jpg'
  ],
  android: phonecat.AndroidInfo.create({
    os: 'Android 3.0',
    ui: 'Honeycomb'
  }),
  // ... other properties
});

// Access properties
console.log(phone.name); // "Motorola XOOM™ with Wi-Fi"
console.log(phone.android.os); // "Android 3.0"

// Call methods
console.log(phone.isPremium()); // true or false based on specs
```

## **Why Model Design Matters**

Taking the time to design a comprehensive model is crucial for several reasons:

1. **Single Source of Truth**: The model defines the structure and behavior of your data in one place
2. **Validation**: Properties can include validation rules to ensure data integrity
3. **UI Integration**: FOAM3 can automatically generate UI components based on your model
4. **Serialization**: Models can be easily converted to/from JSON for storage or API communication
5. **Documentation**: Well-documented models make your code more maintainable

## **Common Pitfalls**

Here are some common issues to watch out for when defining models:

### **1. Not Initializing Nested Properties**

If you use `FObjectProperty` types without providing factories, they'll be undefined:

```javascript
// Incorrect - will cause errors when trying to access phone.android.os
var phone = phonecat.Phone.create({ 
  name: 'Example Phone' 
  // Missing android property initialization
});

// Correct - initialize nested objects
var phone = phonecat.Phone.create({
  name: 'Example Phone',
  android: phonecat.AndroidInfo.create({
    os: 'Android 10'
  })
});

// Alternative - rely on the factory functions we defined
var phone = phonecat.Phone.create({
  name: 'Example Phone'
  // android will be created by the factory
});
phone.android.os = 'Android 10';
```

### **2. Using FOAM Arrays Properly**

```javascript
// First, let's define a Phone class with an images array property
foam.CLASS({
  name: 'Phone',
  properties: [
    {
      name: 'images',
      class: 'StringArray'
    }
  ]
});

var phone = Phone.create();

// Problem 1: If you bypass FOAM's property system by setting a raw array
// directly to the internal variable, you lose FOAM functionality
phone.instance_.images = ['img1.jpg', 'img2.jpg']; // Direct assignment bypasses FOAM
phone.images.removeAll(); // Error: removeAll is not a function

// Problem 2: Even proper assignment can lose functionality if you reassign
// with a plain JavaScript array later
phone.images = ['img1.jpg', 'img2.jpg']; // Correct initial assignment
phone.images = Array.from(phone.images); // Converting to plain array loses FOAM methods
phone.images.removeAll(); // Error: removeAll is not a function

// Correct approach: Always use FOAM's property assignment methods
phone.images = ['img1.jpg', 'img2.jpg']; // Initial assignment
phone.images.push('img3.jpg');           // Adding items (standard array method)
phone.images.removeAll();                 // Clearing (FOAM-specific method)
phone.images = ['new1.jpg', 'new2.jpg']; // Reassignment (keeps FOAM functionality)
```

### **3. Not Using Explicit Types**

```javascript
// Less clear - implicit typing
foam.CLASS({
  name: 'LessCleanModel',
  properties: [
    'name',
    'isActive',
    'count'
  ]
});

// More explicit and self-documenting
foam.CLASS({
  name: 'BetterModel',
  properties: [
    { name: 'name', class: 'String' },
    { name: 'isActive', class: 'Boolean' },
    { name: 'count', class: 'Int' }
  ]
});
```

## **Next Steps**

Now that we've defined our `Phone` model, we need to:
1. Create a data source to populate our app with phone data
2. Build a DAO (Data Access Object) to access and manipulate this data

In the next section, we'll explore how to work with DAOs in FOAM3 to manage collections of phone data.

## **[NEXT: Working with DAOs](3b-dao.md)**

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

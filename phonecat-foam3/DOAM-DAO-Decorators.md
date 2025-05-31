---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/dao-decorators/
---

# DAO Decorators and the Delegate Pattern in FOAM3

One of the most powerful aspects of FOAM3's DAO system is its extensive use of the **Decorator Pattern**. This pattern allows you to add functionality to DAOs by wrapping them with "decorator" DAOs that add specific behaviors while maintaining the same interface.

## Understanding the Delegate Pattern

In FOAM3, decorator DAOs have a property called `delegate` that points to the DAO being wrapped. When methods are called on the decorator DAO, it may:

1. Perform some action before delegating to the wrapped DAO
2. Modify the request before delegating
3. Modify the response after delegation
4. Completely override the behavior

The beauty of this pattern is that multiple decorators can be stacked to create a chain of responsibility, with each decorator adding its own specific functionality.

```
Client → CachingDAO → AuthDAO → ValidatingDAO → IDBDAO
```

## Common DAO Decorators

FOAM3 provides many decorator DAOs out of the box:

### 1. CachingDAO

```
avascript
var cachedDAO = foam.dao.CachingDAO.create({
  delegate: persistentDAO,    // Long-term storage DAO
  cache: memoryDAO            // Fast in-memory cache
});
```

The `CachingDAO` improves performance by storing recently accessed objects in a faster cache DAO (usually an in-memory DAO), while delegating persistent storage to the delegate DAO.

### 2. ValidatingDAO

```javascript
var validatingDAO = foam.dao.ValidatingDAO.create({
  delegate: phoneDAO,
  validator: {
    validate: function(phone) {
      if (!phone.name || phone.name.length < 3) {
        throw new Error('Phone name must be at least 3 characters');
      }
    }
  }
});
```

The `ValidatingDAO` ensures objects meet certain criteria before they are stored in the delegate DAO. It's ideal for enforcing business rules and data integrity.

### 3. AuthenticatedDAO

```javascript
var secureDAO = foam.dao.AuthenticatedDAO.create({
  delegate: phoneDAO,
  authenticator: {
    authenticate: function(user) {
      if (!user || user.role !== 'admin') {
        throw new Error('Only admins can access this DAO');
      }
    }
  }
});
```

The `AuthenticatedDAO` checks permissions before allowing operations on the delegate DAO, implementing access control.

### 4. MDAO (Memory DAO with Indices)

```javascript
var indexedDAO = foam.dao.MDAO.create({
  of: phonecat.Phone
});

// MDAO can also delegate to another DAO for persistence
indexedDAO.delegate = persistentDAO;
```

While not strictly a decorator, `MDAO` can delegate to another DAO for persistence while providing fast indexed queries in memory.

### 5. SyncDAO

```javascript
var syncDAO = foam.dao.SyncDAO.create({
  delegate: localDAO,           // Local storage
  remoteDAO: serverDAO,         // Remote storage
  syncProperty: Phone.SYNCED    // Property to track sync status
});
```

The `SyncDAO` synchronizes data between a local DAO and a remote DAO, handling conflicts and tracking sync status.

## Creating Custom DAO Decorators

You can create your own DAO decorators by extending `ProxyDAO`:

```javascript
foam.CLASS({
  package: 'phonecat',
  name: 'LoggingDAO',
  extends: 'foam.dao.ProxyDAO',
  
  methods: {
    put: function(obj) {
      console.log('Putting object:', obj.id);
      return this.delegate.put(obj);
    },
    
    find: function(id) {
      console.log('Finding object:', id);
      return this.delegate.find(id);
    },
    
    remove: function(obj) {
      console.log('Removing object:', obj.id);
      return this.delegate.remove(obj);
    }
  }
});

// Usage
var loggingDAO = phonecat.LoggingDAO.create({
  delegate: phoneDAO
});
```

## Best Practices for DAO Decoration

1. **Chain from specific to general**: Put more specific decorators (like validation) before more general ones (like caching)

2. **Single responsibility**: Each decorator should add one clear piece of functionality

3. **Maintain the interface**: Your custom decorators should maintain the same interface as the standard DAO

4. **Consider performance**: Some decorators add overhead, so only use what you need

5. **Document the chain**: When creating complex chains, document the purpose and order of each decorator

## DAO Decoration Examples for Common Scenarios

### Complete Example: A Production-Ready DAO Chain

```javascript
// Start with base storage
var baseDAO = foam.dao.IDBDAO.create({
  of: phonecat.Phone,
  name: 'phones'
});

// Add validation
var validatedDAO = foam.dao.ValidatingDAO.create({
  delegate: baseDAO,
  validator: phoneValidator
});

// Add authorization
var secureDAO = foam.dao.AuthenticatedDAO.create({
  delegate: validatedDAO,
  authenticator: userAuthenticator
});

// Add caching for performance
var cachedDAO = foam.dao.CachingDAO.create({
  delegate: secureDAO,
  cache: foam.dao.MDAO.create({ of: phonecat.Phone })
});

// Add logging for debugging
var phoneDAO = phonecat.LoggingDAO.create({
  delegate: cachedDAO
});

// Now use phoneDAO in your application
phoneDAO.put(phone).then(/* ... */);
```

This example creates a chain that:
1. Stores data in IndexedDB
2. Validates objects before storage
3. Checks user permissions
4. Caches results for performance
5. Logs operations for debugging

By changing just the baseDAO, you could switch your entire storage mechanism while keeping all the additional functionality intact.

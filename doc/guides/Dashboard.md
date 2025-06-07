# FOAM3 Dashboard Quick Start Guide

This guide shows you how to create a simple dashboard in FOAM3 in just a few steps.

## What You Need

A FOAM3 dashboard requires these components:

1. **Dashboard Class** - extends `foam.dashboard.view.DashboardView`
2. **Widget Menus** - hidden menu entries that define your widgets
3. **Citation Views** - for displaying individual records (optional)

## Step 1: Create a Simple Dashboard

Create `MyDashboard.js`:

```javascript
foam.CLASS({
  package: 'my.dashboard',
  name: 'MyDashboard',
  extends: 'foam.dashboard.view.DashboardView',

  properties: [
    {
      name: 'dashboardTitle',
      value: 'My Dashboard'
    },
    {
      name: 'main',
      value: true
    },
    {
      name: 'widgets',
      factory: function() {
        return {
          'my.dashboard.users.table': { column: 6 },
          'my.dashboard.users.count': { column: 6 }
        };
      }
    }
  ]
});
```

## Step 2: Create Widget Menus

Create `menus.jrl`:

```javascript
// Main dashboard menu
p({
  class: "foam.core.menu.Menu",
  id: "my.dashboard",
  label: "My Dashboard",
  handler: {
    class: "foam.core.menu.ViewMenu",
    view: { class: "my.dashboard.MyDashboard" }
  }
})

// Data table widget
p({
  class: "foam.core.menu.Menu",
  id: "my.dashboard.users.table",
  label: "Users Table",
  handler: {
    class: "foam.core.menu.ViewMenu",
    view: {
      class: "foam.dashboard.view.CardWrapper",
      title: "Recent Users",
      currentView: {
        class: "foam.dashboard.view.DAOTable",
        dao: "userDAO",
        limit: 5,
        viewMore: true,
        viewMoreMenuItem: "users",
        emptyTitle: "No Users",
        emptySubTitle: "No users found"
      }
    }
  },
  parent: "hidden"
})

// Count widget
p({
  class: "foam.core.menu.Menu",
  id: "my.dashboard.users.count",
  label: "User Count",
  handler: {
    class: "foam.core.menu.ViewMenu",
    view: {
      class: "foam.dashboard.view.CardWrapper",
      title: "Total Users",
      currentView: {
        class: "foam.dashboard.model.Count",
        daoName: "userDAO"
      }
    }
  },
  parent: "hidden"
})
```

## Step 3: Create Package File

Create `pom.js`:

```javascript
foam.POM({
  name: 'my.dashboard',
  files: [
    { name: "MyDashboard", flags: "js" }
  ]
});
```

## Step 4: Register Your Package

Add to your main `pom.js`:

```javascript
foam.POM({
  // ... other config
  projects: [
    // ... other projects
    { name: "my.dashboard" }
  ]
});
```

## Step 5: Add Menu Entry

Add to your main `menus.jrl`:

```javascript
p({
  class: "foam.core.menu.Menu",
  id: "my.dashboard",
  label: "My Dashboard",
  handler: {
    class: "foam.core.menu.ViewMenu",
    view: { class: "my.dashboard.MyDashboard" }
  },
})
```

## That's It!

Your dashboard is now ready. It will show:
- A table of recent users (if you have a `userDAO`)
- A count of total users

## Grid Layout

The `column` property controls widget width (12-column grid):
- `{ column: 12 }` - Full width
- `{ column: 6 }` - Half width  
- `{ column: 4 }` - Third width
- `{ column: 3 }` - Quarter width

## Common Widget Types

### Data Table
```javascript
{
  class: "foam.dashboard.view.CardWrapper",
  title: "My Data",
  currentView: {
    class: "foam.dashboard.view.DAOTable",
    dao: "myDAO",
    limit: 5
  }
}
```

### Count Widget
```javascript
{
  class: "foam.dashboard.view.CardWrapper", 
  title: "Total Records",
  currentView: {
    class: "foam.dashboard.model.Count",
    daoName: "myDAO"
  }
}
```

### Custom Widget
```javascript
{
  class: "my.custom.Widget",
  // your custom properties
}
```

## Adding More Widgets

Just add more entries to your `widgets` factory:

```javascript
widgets: {
  factory: function() {
    return {
      'widget1': { column: 4 },
      'widget2': { column: 4 }, 
      'widget3': { column: 4 },
      'widget4': { column: 12 }
    };
  }
}
```

And create corresponding hidden menu entries for each widget ID.

That's all you need for a basic FOAM3 dashboard!
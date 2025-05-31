---
layout: tutorial-phonecat
permalink: /tutorial/phonecat/0-intro/
tutorial: 0
---

# **FOAM3 Tutorial Overview**

Welcome to the FOAM3 tutorial! This guide will introduce you to the core concepts of FOAM3 (Feature-Oriented Active Modeller) and walk you through building a functional application using FOAM3's powerful features. By the end of this tutorial, you'll have a solid understanding of the FOAM3 ecosystem and the "FOAM way" of building applications.

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

## **What is FOAM3?**

*Fast apps fast.* FOAM3 is the latest version of the Feature-Oriented Active Modeller framework designed to help developers build robust, reactive applications efficiently. FOAM3 is a comprehensive system for converting abstract models into concrete software implementations with minimal boilerplate.

FOAM3 embraces a declarative programming style, where you define *what* your application should do rather than precisely *how* it should do it. This paradigm shift allows you to focus on your application's core business logic while FOAM handles many implementation details for you.

### **Key Features of FOAM3:**

- **Enhanced Class System**: A powerful object-oriented class system that goes beyond JavaScript's native capabilities
- **Reactive Programming Model**: Built-in reactivity that automatically updates your UI when data changes
- **Declarative UI Library**: A modern UI library (U2) for building complex interfaces with minimal code
- **Unified Data Access**: A consistent DAO (Data Access Object) pattern that works across different data sources
- **Composition over Inheritance**: Strong support for composition patterns to build modular, reusable code

## **Why FOAM3?**

FOAM3 excels in scenarios where you need to:

- Build data-centric applications with complex models
- Create reactive UIs that automatically update when data changes
- Implement rich business logic with minimal boilerplate
- Work with multiple data sources in a consistent way
- Build applications that scale in complexity while remaining maintainable

FOAM3 combines the best aspects of reactive frameworks like React with the strong modeling capabilities of enterprise frameworks, all while maintaining a lean and efficient codebase.

## **Audience**

This tutorial is designed for developers who:
- Have experience with JavaScript and modern web development
- Understand basic object-oriented programming concepts
- Are interested in learning a different approach to building web applications
- May be new to FOAM3 or migrating from FOAM2

While prior experience with FOAM is helpful, it's not required. We'll explain core concepts from the ground up.

## **Required Tools**

To follow along with this tutorial, you'll need:

1. [FOAM3 framework](https://github.com/kgrgreer/foam3.git)
2. [Git](https://git-scm.com/) or [GitHub Desktop](https://desktop.github.com/)
3. A local web server (we recommend [Node.js](https://nodejs.org/) with http-server, or [Python](https://www.python.org/downloads/))
4. [Tutorial Companion Files](bundle.zip)
5. A modern code editor (like [VS Code](https://code.visualstudio.com/))

## **Resources**

- [FOAM3 Website](https://foamdev.com/)
- [FOAM3 GitHub Repository](https://github.com/kgrgreer/foam3)
- [FOAM3 API Documentation](https://foamdev.com/api/foam/)
- [FOAM3 Syntax Guide](FOAM-Syntax.md) - A comprehensive reference for FOAM3-specific syntax
- [FOAM3 CSS Guide](FOAM-CSS.md) - Detailed guide to FOAM3's CSS system

## **The FOAM Way of Thinking**

Before diving into code, it's helpful to understand the "FOAM way" of thinking about application development:

1. **Model First**: In FOAM3, you start by defining your data models, which form the foundation of your application
2. **Declarative Over Imperative**: Describe what your application should do, not how it should do it
3. **Reactivity Built-In**: Your UI automatically stays in sync with your data
4. **Composition Over Inheritance**: Build complex behaviors by combining simple components
5. **Convention Over Configuration**: FOAM3 provides sensible defaults while allowing customization

This approach leads to applications that are more maintainable, easier to understand, and faster to develop.

## **What You'll Build**

In this tutorial, you'll build a phone catalog application (inspired by the classic AngularJS tutorial) that:
- Displays a list of phones
- Allows filtering and sorting
- Shows detailed information for each phone
- Includes images and specifications

Through this process, you'll learn how FOAM3's features combine to create a complete application with minimal code.

Ready to get started? Let's begin with [Setting Up Your Environment](1-gettingstarted.md).

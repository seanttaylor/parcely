
# Object Design at Parcely Engineering

## Dependency Injection

Without splitting hairs, getting into the weeds (or arguments,) for the purposes of Parcely object design, dependency injection is a pattern for providing (or injecting) all dependencies required by a module when that module is invoked

```
    const dependencies = {};
    const mod = new Module(dependencies);
    mod.doStuff();
```

We do this for a number of reasons: 

1) It becomes trivial to change or alter the dependencies of a module should we need to. 

An example might be a dependency on a third-party API or another expensive process. We probably don't need to hit that API throughout the entirety of our development and during our unit tests (especially if the API is rate-limited or if we're hitting a production endpoint.) 

By way of dependency injection, we can replace on or all of the dependencies with mocks at the module's call site. While we could use mocking features of a sophisticated framework like Jest, a POJO (Plain Ol' JavaScript Object) will do just fine for simple method calls.

2) For dependencies that are general-purpose in nature (e.g. database solutions) we can reduce the cost of experimentation to zero.

```
    //const dependencies = {};
    const mockedDependencies = {};
    const mod = new Module(mockedDependencies);
    mod.doStuff(); 
    //Method returns mocked data acccording to documented
    //signature
    
    //...later

    const productionDependencies = {};
    const productionMod = new Module(productionDependencies);
    productionMod.doStuff(); 
    //Method returns production data;

```

Maybe we're on Mongo but we want to try Google Cloud Firestore or go full on relational with MySQL or Postgres. Providing (or injecting) a database connector that exposese the interface our module depends upon is the extent of the effort required to change a non-trivial portion of our application infrastructure.

This also enables parallel development (which product managers love.) While the implementation of the updated dependency is in development, our teammates aren't blocked. They can mock the updated dependency. When the production version of the dependency is available we don't need to touch _any_ other code in our module. We just instantiate our module with the new dependency.

Though this workflow is well-known and well-documented, it isn't practiced as much as it should be, with a lot of blocked devs, delays and wasted time as the result. 

## Factory Functions vs. ES6 Classes

## Services, Interfaces and Libraries

Services, Interfaces and Libraries are system components that have a specific meanings within Parcely Engineering. This section goes into detail on each component and how that component adds value to our systems as a whole.

### Services

Services are objects that:
* Create or alter data entities
* Emit or listen for registered application events
* Produce side effects in other systems (both internal and external)
* Advance a business objective

If our business was a bakery we'd most likely have a `CakeService` or a `PastyService` and a `BillingService` to help us manage our business accounts and catering orders. We _wouldn't_ have a `QuickBooksService` because QuickBooks is an implementation detail related to _how_ we complete the task of billing. 

In this example, whatever QuickBooks functionality we need would best be represented as a library. 

#### A Note on Names

Services and their the methods should be as generic as possible and their names should reflect this. Methods should also describe business capabilities foremost. This is an aspiration, however and won't always be achievable. 

Above all, business users should be able to ascertain the point of a _majority_ methods exposed on the API and API methods should map as closely to the business doman and operations as possible.  

### Interfaces

Interfaces are a defined contract for the API an object exposes to its consumers. The value of the interface is that it is _static_ for an object's consumer, obscuring any complexity _within_ the object's implementation. 

When we combine interfaces with dependency injection we create objects that have the quality attributes of composability, extensibility (the ability of a solution to incorporate new functionality) and maintainability (the ease with which a solution or component can be modified to correct faults, improve performance or other attributes, or adapt to a changed environment.)

```
/**
 * An interface for any CRUD-able data.
 * @param {Object} myImpl - implementation of repository
 * interface
 */
const IRepository = function(myImpl={}) {
  function required() {
    throw Error("Missing implementation");
  }

  //Creates a new record in the datastore;
  this.create = myImpl.create || required;
  
  //Reads a record in the datastore;
  this.read = myImpl.read || required;
  
  //Updates a record in the datastore;
  this.update = myImpl.update || required;

  //Deletes a new record in the datastore;
  this.delete = myImpl.delete || required;
};

```

Above is an example of an interface for any CRUD-able datasource (i.e. any datasource we can perform CRUD operations upon.) This datasource could be in-memory, cloud-based and accessible only via REST API, a document store or a traditional relational database. 

Thing is: for consumers of the interface it doesn't and _shouldn't_ matter. What matters is the business capabilities exposed on the API. Further, what consumers should **depend** on is the interface, _not_ the implementation.

In the example above (an admittedly naive example of an interface in JavaScript that still makes the point) we must provide an implementation for all of the methods on the interface. If we don't, an error is thrown when a method for which no implementation is called. 

>In some languages, we can't even instantiate the an instance of the interface without all methods having a implementation. Here we cut ourselves some slack.

Below we provide a number of implementations for the `create` method of the interface we defined earlier.

Whe have implementations for prod and non-prod enviroments and we also have a experimental implementation that allows to explore solutions to an existing problem or an emerging business opportunity.

```
const prodImpl = {
  create() {
    console.log("do something really specific for production...");
  }

  return true;
};

const nonProdImpl = {
   create() {
    console.log("do something totally different for non-prod...");
  }

  return true;
}

const expImpl = {
   create() {
    console.log("do something really wild in new experimental implementation...");
  }

  return true;
}
```

Here we instantiate our interface with different implementations with different outcomes based upon business needs.

```
const myProdDb = new IRepository(prodImpl);
myProdDb.create();

const myNonProdDb = new IRepository(nonProdImpl);
myNonProdDb.create();
```

We get (2) different versions of our database according to environment: 

```
const myProdDb = new IRepository(prodImpl);
myProdDb.create();

const myNonProdDb = new IRepository(nonProdImpl);
myNonProdDb.create();
```

We also get experimental behavior for free in our non-prod database by way of composition:

```
//1)
const myExperimentalNonProdDb = Object.assign({},myNonProdDb, expImpl);
//2)
myExperimentalNonProdDb.create();
//3)
myNonProdDb.create();

```

To break it down: 

1) We get new experimental behavior via composition
2) The `IRepository` interface remains untouched, no need to refactor its implementation after composition
3) Original non-prod behavior is _still_ available

The cherry on top is that all of our unit tests will pass because all of our implementations respect the `IRepository` interface as produce the same return type, in this case a boolean `true`.

These patterns allow us maximal freedom to experiment and explore while limiting the scope of required change to our codebase. 

The implementation for the interface could even be provided by the consumer or the result of a remote call to an API endpoint. So long as the interface is respected it doesn't matter where the implementation comes from or how it's designed. 

Quite often its argued that we don't switch out major pieces of our application infrastructure that often so this approach isn't that valuable. 

While its true we don't often swap or switch major application components this is as much because we _can't_ as it is that we _won't_. 

When our systems does not have the attributes of composability or extensibility, change of this kind is a non-starter in any case. The result is that we are blocked in by irreversible architectural decisions we've made in the past. The consequence is similarly blocked or unexplorable business opportunities.

#### A Further Note on Implementations
Since what we've described here is design philosophy, the language used is, interestingly enough, an implementation detail. 

Object-Oriented languages such as C, Python and Java for example all provide native features for making use of Interfaces. 

While JavaScript is used in these examples, this shouldn't be taken to mean that we anticipate all of our systems to be realized in JavaScript, though again that would an implementation detail. 

Rather, this documentation should be used as a frame of reference to inform design decisions in Parcely engineering endeavors, particularly when an Object-Oriented approach is suitable.


####


### Libraries
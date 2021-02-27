
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

### Services

### Interfaces

### Libraries
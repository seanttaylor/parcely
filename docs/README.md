
# Object Design at Parcely Engineering

## Dependency Injection

Without splitting hairs, getting into the weeds (or arguments,) for the purposes of Parcely object design, dependency injection is a pattern for providing (or injecting) all dependencies required by a module when that module is invoked.

```
    const dependencies = {};
    const mod = new Module(dependencies);
    mod.doStuff();
```

We do this for a number of reasons: 

1) It becomes trivial to change or alter the dependencies of a module should we need to. 

An example might be a dependency on a third-party API or another expensive process. We probably don't need to hit that API throughout the entirety of our development and during our unit tests (especially if the API is rate-limited or if we're hitting a production endpoint.) 

By way of dependency injection, we can replace one or all of the dependencies with mocks at the module's call site. While we could use mocking features of a sophisticated framework like Jest, a POJO (Plain Ol' JavaScript Object) will do just fine for simple method calls.

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

Maybe we're on Mongo but we want to try Google Cloud Firestore or go full on relational with MySQL or Postgres. Providing (or injecting) a database connector that exposes the interface our module depends upon is the extent of the effort required to change a non-trivial portion of our application infrastructure.

This also enables parallel development (which product managers love.) While the implementation of the updated dependency is in development, our teammates aren't blocked; they can mock the updated dependency. When the production version of the dependency is available, we don't need to touch _any_ other code in our module. We just instantiate our module with the new dependency.

Though this workflow is well-known and well-documented it isn't practiced as much as it should be, with a lot of blocked devs, project delays and wasted time as the inevitable result. 


## Services, Interfaces and Libraries

Services, Interfaces and Libraries are system components that have a specific meanings within Parcely Engineering. This section details each component and how that component adds value to our systems as a whole.

### Services

Services are objects that:
* Create or alter data entities
* Emit or listen for registered application events
* Produce side effects in other systems (both internal and external)
* Advance a business objective

If our business is a bakery we'd most likely have a `CakeService` or a `PastyService` and a `BillingService` to help us manage our business accounts and catering orders. We _wouldn't_ have a `QuickBooksService` because QuickBooks is an implementation detail related to _how_ we complete billing-related tasks. 

In this example, whatever QuickBooks functionality we need would best be represented as a library (see below.) 

#### A Note on Names

Services and their methods should be as generic as possible and their names should reflect this. Methods should describe business capabilities foremost. This is an aspiration however and won't always be achievable. 

Above all, business users should be able to ascertain the point of a _majority_ of methods exposed on an API and API methods should map as closely to the business doman and operations as possible.  

### Interfaces

Interfaces are a defined contract for the API an object exposes to its consumers. The value of the interface is that it is _static_ for an object's consumers, obscuring any complexity _within_ the object's implementation. 

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

In the example above (a naive example of an interface in JavaScript) we must provide an implementation for all of the methods on the interface. If we don't, an error is thrown when a method for which no implementation exists is called. 

>In some languages, we can't even instantiate an instance of the interface without _all_ methods having an implementation. Here we cut ourselves some slack.

Below we provide a number of implementations for the `create` method of the interface we defined earlier.

Whe have implementations for production and non-production environments and we also have an experimental implementation that allows us to explore solutions to an existing problem or an emerging business opportunity.

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

Here we instantiate our interface with different implementations with different outcomes based upon business needs:

```
    const myProdDb = new IRepository(prodImpl);

    const myNonProdDb = new IRepository(nonProdImpl);
```

We get (2) different versions of our database according to environment (i.e. prod and non-prod): 

```
    const myProdDb = new IRepository(prodImpl);
    myProdDb.create();

    const myNonProdDb = new IRepository(nonProdImpl);
    myNonProdDb.create();
```

We also get experimental behavior essentially for free in our non-prod database by way of composition:

```
    //1.
    const myExperimentalNonProdDb = Object.assign({}, myNonProdDb, expImpl);
    //2.
    myExperimentalNonProdDb.create();
    //3.
    myNonProdDb.create();
```

To break it down: 

1) We get new experimental behavior via composition
2) The `IRepository` interface remains untouched; there is no need to refactor its implementation after composition
3) Original non-prod behavior is _still_ available if desired

The cherry on top is that all of our unit tests will pass in each of these instances because all of our implementations respect the `IRepository` interface. They all produce the same return type, in this case a boolean `true`.

These patterns allow us maximum freedom to experiment while limiting the scope of required change to our codebase when we need new or different business outcomes. 

The implementation for this interface could even be provided _by_ the consumer or be the result of a remote call to an API endpoint. So long as the interface is respected it doesn't matter where the implementation comes from or how it's designed. 

Quite often its argued that we don't switch out major pieces of our application infrastructure that often so approaches like these aren't that valuable. 

While it's true we don't often swap or switch major application components, this is as much because we _can't_ as it is the case we _won't_. 

When our systems do not have the attributes of composability or extensibility, change of this kind is a non-starter in _any_ case. The result is that we're blocked in by irreversible architectural decisions we've made by programming to an implementation. 

A consequence is similarly blocked or unexplorable business opportunities.

#### A Further Note on Implementations
Since what we've described here is a design philosophy, the language used is, interestingly enough, an implementation detail. 

Object-Oriented languages such as C, Python and Java for example, all provide native features for making use of Interfaces. 

While JavaScript is used in these examples, this shouldn't be taken to mean that we anticipate all of our systems to be realized in JavaScript, though again that would be an implementation detail. 

Rather, this documentation should be used as a frame of reference to inform design decisions in Parcely engineering endeavors, particularly when an Object-Oriented approach is deemed suitable.


### Libraries

Libraries are purpose-specific modules from internal or external sources that support or advance business objectives. To return to the bakery business example, QuickBooks doesn't make sense as a service because it is an implementation detail of _how_ we complete billing-related tasks. We could change to a different billing vendor or create our own billing library.

This is an example of a volatile dependency--a dependency on a third-party vendor API we do not control or a dependency that provides use-case specific functionality that is substitutable.

Email is another candidate for a library. We're literally _not_ in the business of sending email. So we choose SendGrid to meet our outbound email marketing and email contact list management needs. 

Because of the volatility of this library it would be a good idea to wrap the needed email functionality in a static contract--an interface.

Note our interface methods and method signatures should serve _our_ needs. If the SendGrid API requires an array of email addresses in order to send our email but we want our email contacts to be represented as an object on our `sendEmail` interface method, we should by all means design our interface in this manner.

>If our interfaces mirror the SendGrid API methods one to one, we don't have an interface, we have a _façade_.

With our library interface in place, we're free to experiment with SendGrid or switch to MailGun or our own home brewed email marketing solution.

Using dependency injection we can provide our library of choice to the mail interface. All of our unit tests continue to pass and our codebase remains stable in the face of change. Interface authors can comparison shop on implementations and consumers only need to worry about calling methods (e.g. `sendEmail` or `getContactsList`.)


## Factory Functions, ES6 Classes and Inheritance

When it comes to creating objects, we prefer Factory Functions to shiny new ES6 classes. This is because Factory Functions can provide private methods via closures. 

We can opt out of the new syntax for designating private methods which, in our opinion, make for code that is harder to read and steer developers toward class-oriented development practices that often result in brittle codebases (e.g. Inheritance, see [Fragile Base Class Problem](https://en.wikipedia.org/wiki/Fragile_base_class).)

Factory Functions combined with composition (as opposed to class inheritance) provides flexibility and stability of object design with arguably cleaner code.


## Data Transfer Objects (DTOs)

Data-Transfer Objects hae a specific meaning in Object-Oriented programming but Parcely Engineering uses them somewhat differently. 

We use DTOs to move immutable data across our application, especially between the business logic and the data access layer where our persistence solution lives.

The DTO can contain the data required by our application entities; it also validates the data against a JSON Schema document. 

We try to use objects to move data around the application instead of language primitives like strings, numbers, arrays and plain objects because these items are mutable and thus subject to unintended changes that may break our application.

If we want to edit our DTO we have to create a new one.

If we want to extract the data from our DTO we call the object's one and only `value` method, which returns the object's contents.

We can of course use TypeScript or a strongly typed programming language to enforce the correct type usage during our application's execution but correct types are distinct from data that is valid for our business logic. 

An object whose fields are all of the correct type is still mutable and vulnerable to breakage.

Futher, using JSON Schema allows us to do more robust validation on data, beyond type enforcement, as that data moves through our application.

Here's an example of how we've used DTOs:


```
    const Ajv = require("ajv");
    const ajv = new Ajv();
    const userSchema = require("../../database/connectors/json/schemas/users.json");
    const userSchemaValidation = ajv.compile(userSchema);

    /*
    * @param {String} emailAddress - email address for a user
    * @param {String} avatarURL - URL of avatar image for a user
    * @param {String} firstName - user first name
    * @param {String} lastName - user last name
    */

    function UserDTO({emailAddress, avatarURL, firstName, lastName}) {
        const userData = {
            emailAddress,
            avatarURL,
            firstName,
            lastName,
            createdDate = new Date().toISOString()
        };

        if(!userSchemaValidation(userData)) {
            throw new Error(`UserDTOError/InvalidUserDTO => ${JSON.stringify(userSchemaValidation.errors, null, 2)}`);
        }

        this.value = function() {
            return userData;
        }
    }

```

We're pulling `ajv` to validate a JSON schema that describes what our records need to look like before we commit them to our datastore.

This object doesn't do much and that's really the point. It exists to gather the consumer-supplied arguments required for creating a new `User` record into an immutable object. As we pass this DTO along, we have a guarantee that its data can't be tampered with. 

The data is validated before we exit this function. If we provide invalid data we can't instantiate the DTO and we throw an error. If our JSON schema is configured correctly it should be _impossible_ to create this DTO in an invalid state.

> If we wanted maximum rigor we could do an `Object.freeze` (in JavaScript) to make certain the result of the `value` method cannot be altered either.

Let's see a quick example of extract data from the DTO:

```
//userRepo instantiated here blah...

const userDTO = new UserDTO({
    emailAddress: "tstark@avengers.io"
    avatarURL: "https://placehold.it/120x120"
    firstName: "Tony",
    lastName: "Stark"
});


await usersRepo.addUser(userDTO);
```

Our `Users` repository takes the `userDTO` object via the `addUser` method. Deeper inside the implementation of our repository the data from `userDTO` is extracted:

```
//Other repository implementation details blah...

async function addUser(userDTO) {
    await mongoDbClient.collection("users").add(userDTO.value());
}

```

A naive example but the point is clear enough. The `value` method is really only called in the implementation details of consumer objects, in this case the `userRepo`. 

We pass our data from our business logic to the data access layer, here implemented as a MongoDB collection.


## Key Themes

The major insights about Parcely object design to take away can be summarized as: 
1) Object API contracts are first-class citizens, not afterthoughts
2) Interfaces are invaluable because consumers know what they can depend upon and they are excellent examples of documentation as code. Interfaces should be used to wrap volatile dependencies and and libraries _always_.
3) We should always strive to make modules as composable as possible. This allows us maximum freedom of choice of implementation both now and in the future. 
4) Where and when it's suitable objects should be immutable
5) _Why_ a design decision is made is at least as important as _what_ design decision is made. Justify all the things.

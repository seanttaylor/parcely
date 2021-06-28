[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/seanttaylor/parcely)


# Parcely

This repository houses code facilitating the software-defined Parcely crate and the real-time logistics API that ingests the telemetry data harvested from our hardware crates deployed in the field.

### Local Development

1. Pull the Github repo to your local machine
2. Ensure all environment variables documented in the `./.env-template` file are set to valid values. If these environment variables are not set, running unit tests with `npm test` may result in failed tests.
3. Run `npm tests`
4. To launch the application do `docker-compose up`


### Deployment

#### Gotchas and Other Field Notes

##### User Creation via UserService

In development, note there is a _temporal dependency_ between and entities, their `create` methods and their `save` methods. That is, in order to persist an entity it must be created _and_ saved.

``` 
  const user = await userService.createUser();
  await user.save();
```

In the example above the user entity is actually saved in the datastore until the `save` method is called. Obvious here but this behavior has been the cause of more than one time-sink in development. This behavior _will eventually be deprecated_ but until it is, keep this in mind. Particularly when investigating why a created entity does not appear to be saving.

##### Ignored Unit Tests

In _some_ cases services or components (a Queue, for example) whose interface already has unit tests _will not_  have unit tests for a different _implementation_ of the same interface (e.g. the AWS SQS implementation of the same Queue interface mentioned above.) In such cases, integration or end-to-end tests will be used to verify the correct behavior of interfaces that have multiple implementations used differently in local development versus production.


## References

Find additional documentation in the `/docs` folder.

* [Parcely Object Graph](https://sketchboard.me/pCA3XiCjQkUY)
* [Parcely Crate State Diagram](https://sketchboard.me/jCCKOLBJEod) 
* [LocalStack Documentation](https://github.com/localstack/localstack)
* [AWS v2 CLI Documentation](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/index.html)
* [AWS v2 SDK Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS.html)
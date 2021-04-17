[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/seanttaylor/parcely)


# Parcely

This repository houses code facilitating the software-defined Parcely crate and the real-time logistics API that ingests the telemetry data harvested from our hardware crates deployed in the field.

### Local Development

1. Pull the Github repo to your local machine
2. Ensure all environment variables documented in the `./.env-template` file are set to valid values. If these environment variables are not set, running unit tests with `npm test` may result in failed tests.
3. Run `npm tests`
4. To launch the application do `docker-compose up`

> You will need to setup the Terraform configuration in order to launch the application outside test mode (see below.)


#### Gotchas and Other Field Notes

##### User Creation via UserService

In development, note there is a _temporal dependency_ between and entities, their `create` methods and their `save` methods. That is, in order to persist an entity it must be created _and_ saved.

``` 
  const user = await userService.createUser();
  await user.save();
```

In the example above the user entity is actually saved in the datastore until the `save` method is called. Obvious here but this behavior has been the cause of more than one time-sink in development. This behavior _will eventually be deprecated_ but until it is, keep this in mind. Particularly when investigating why a created entity does not appear to be saving.

##### Local Development with AWS, LocalStack and Terraform 
>LocalStack is used to mock critical AWS infrastructure components in local development prior to standing up live (paid) resources on AWS Cloud. 
>
>Terraform is used to document and provision infrastructure in our codebase in keeping with the Infrastructure-as-Code (IaC) paradigm.

In order to launch the application with mocked AWS resources ensure the Docker daemon is running and do `docker-compose`. Most likely unit tests _will fail_ because the local terraform configuration has not been applied. Change to `/tf/local` directiory. Run `terraform init` **if this is the first time launching the app**. Once the terraform configuration has been initialized do `terraform apply` to create the resources specified in the terraform files on LocalStack.

If the application _has been previously launched_ and AWS resources have _been previously provisioned_, doing a `terraform apply` should refresh the configuration with the resources specified in the terraform files.

##### Ignored Unit Tests

In _some_ cases services or components (a Queue, for example) whose interface already has unit tests _will not_  have unit tests for a different _implementation_ of the same interface (e.g. the AWS SQS implementation of the same Queue interface mentioned above.) In such cases, integration or end-to-end tests will be used to verify the correct behavior of interfaces that have multiple implementations used differently in local development versus production.


## References

Find additional documentation in the `/docs` folder.

* [Parcely Object Graph](https://sketchboard.me/pCA3XiCjQkUY)
* [Parcely Crate State Diagram](https://sketchboard.me/jCCKOLBJEod) 
* [LocalStack Documentation](https://github.com/localstack/localstack)
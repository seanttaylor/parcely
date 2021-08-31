[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/seanttaylor/parcely)


# Parcely

This repository houses code facilitating the software-defined Parcely crate and the real-time logistics API that ingests the telemetry data harvested from hardware crates deployed in the field.

### Local Development

1. Pull the Github repo to your local machine
2. Ensure all environment variables documented in the `./.env-template.csv` file are set to valid values. If these environment variables are not set, running unit tests with `npm test` may result in failed tests.
3. Run `npm test`
4. To launch the application do `docker-compose up`


### Deployment

Heroku is the deployment platform for Parcely REST API services. When a pull request is merged into the `master` branch, the application is pushed to Heroku via a Github Action configured in `./github/workflows/main.yml`.

### User Interface End-to-End Testing Notes

Find a general set of instructions for testing the main use case for the Parcely mobile app below.

1. Create a new user; note the user `uuid`
2. Create a new merchant with the user `uuid` from the previous step; note the merchant `uuid`
3. Create a new crate with the merchant `uuid` from the previous step
4. Create a new shipment; assign the crate `uuid` to the shipment (if testing on the deployed mobile app scan the QR code from the crate creation step); complete the shipment creation
5. Review the shipment in the "Shipments" screen
6. Select the shipment to view current crate telemetry data
7. Open/tap "Telemetry" to view historical telemetry data 

### Gotchas and Other Field Notes

#### User Creation via UserService

In development, note there is a _temporal dependency_ between and entities, their `create` methods and their `save` methods. That is, in order to persist an entity it must be created _and_ saved.

``` 
  const user = await userService.createUser();
  await user.save();
```

In the example above the user entity isn't actually saved in the datastore until the `save` method is called. Obvious here but this behavior has been the cause of more than one time-sink in development. This behavior _will eventually be deprecated_ but until it is, keep this in mind. Particularly when investigating why a created entity does not appear to be saving.

#### Ignored Unit Tests

In _some_ cases services or components (a Queue, for example) whose interface already has unit tests _will not_  have unit tests for a different _implementation_ of the same interface (e.g. the AWS SQS implementation of the same Queue interface mentioned above). In such cases, integration or end-to-end tests will be used to verify the correct behavior of interfaces that have multiple implementations used differently in local development versus production.


#### Kafka 

Kafka has very rich capabilities and a complex set of configurations as a result. Below are references to common encounters using Kafka in development

* Kafka keeps re-processing old messages even after restarting containers and destroying volumes
    * Retention policy is **key** here. Each topic in a Kafka cluster has its own retention policy (i.e. the duration for which the topic retains individual messages). If messages are refusing to purge from a specified topic, examine the retention policy configuration first.

## References

Find additional documentation in the `/docs` folder.

* [Parcely Object Graph](https://sketchboard.me/pCA3XiCjQkUY)
* [Parcely Crate State Diagram](https://sketchboard.me/jCCKOLBJEod) 
* [LocalStack Documentation](https://github.com/localstack/localstack)
* [AWS v2 CLI Documentation](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/index.html)
* [AWS v2 SDK Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS.html)
[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/seanttaylor/parcely)


# Parcely

This repository houses code facilitating the software-defined Parcely crate and the real-time logistics API that ingests the telemetry data harvested from our hardware crates deployed in the field.

### Local Development

#### Recommended

1. Install the [Gitpod Google Chrome Extension](https://chrome.google.com/webstore/detail/gitpod-dev-environments-i/dodmmooeoklaejobgleioelladacbeki?hl=en)
2. Click the Gitpod button on an issue in Github to bootstrap a new workspace on [gitpod.io](https://gitpod.io/)

Unit and integration tests will run once the workspace initializes.

#### Alternative

1. Pull the Github repo to your local machine
2. Ensure you do `export JWT_SECRET={someRandomSecret}`. If this environment variable is not set, running unit tests with `npm test` will cause the tests to break.


#### Why Gitpod

We decided to explore Gitpod to bring the configuration-as-code paradigm that's traditionally been associated with DevOps and Intrastructure to our local development practices. Put simply, our use of Gitpod for local development makes it easy to do the right things, like: creating atomic pull requests and decreasing the need for configuration of a developer's local machine in order to contribute to our codebase.

Even with tools like Docker, subtle changes to the environment of developers' local machines can cause bugs or other novel behaviors that waste enormous amounts of time to resolve. 

By separating the dev environment entirely from a developer's local machine, we're able to establish a truly cloud native software development practice. Through having to configure a single environment only once, we can ensure that _every_ developer environment is identical forever, all from an easy out-of-the-box solution.





## References

Find additional documentation in the `/docs` folder.


* [Parcely Object Graph](https://sketchboard.me/pCA3XiCjQkUY)
* [Parcely Crate State Diagram](https://sketchboard.me/jCCKOLBJEod) 

# Schemas

This folder contains JSON Schema documents describing the core data entities for the application. In the `/api` folder you can find JSON Schema documents _solely_ for validating incoming API request bodies in the middleware stack.

We have two schemas for the many of the same data entities so the JSON objects that come in at the API edge can evolve independently from how data entities are expressed stored records in the database. 

See [ref](https://codeopinion.com/web-api-resource-model-isnt-data-model/) for some additional insight. 

At the time of writing, some of the schemas are duplicative. There is an item in the backlog to use JSON schema's `$ref` feature to reference schemas across files to reduce redundancy. Until that time please document and correct any inconsistencies you may discover.




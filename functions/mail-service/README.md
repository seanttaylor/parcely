### Mail Service 

#### Overview 
`mail-service` is a Google Cloud Function that provides mail forwarding service driven by the SendGrid API. Messages sent via this function are forwarded to the main Parcely inbox at hello@parcely.us

This function will be deprecated when the Parcely homepage is migrated to AWS Cloud. Google Cloud is used in this instance solely out of expedience. 

This folder does not contain any sub-folders because the source code for this function was created in the Google Cloud Functions inline editor. Any updates to this source code should:
    * use the appropriate CLI to deploy the function updates
    * create a suitable folder structure as part of the update

#### Usage

`mail-service` takes a JSON object with (3) fields: 

| name  | description                       | type   |
|-------|-----------------------------------|--------|
| email | Reply email address of the sender | string |
| name  | Display name of the sender        | string |
| body  | The body of the message           | string |

### Example

Below is an example of a JSON `POST` request body to the function endpoint:

```
{
    "email": "tstark@avengers.io",
    "name": "Tony Stark",
    "body": "Playboy. Billionaire. Genius"
}
```
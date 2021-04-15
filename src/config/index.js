/* istanbul ignore file */

/*Non-secret configuration for application modules*/

//Requests with status codes below 400 are not logged during unit/integration test runs
function doNotLogRequestsWithStatusBelow400 (req, res) { 
    return process.env.NODE_ENV == "ci/cd/test" 
}


module.exports = {
    application: {
        morgan: {
            verbosity: process.env.NODE_ENV === "ci/cd/test" ? "tiny" : "dev",
            requestLoggingBehavior: process.env.NODE_ENV == "ci/cd/test" ? doNotLogRequestsWithStatusBelow400 : () => undefined
        }
    },
    users: {
        emailAddressRegex: /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi,
        userHandleRegex: /\@[a-zA-Z0-9_]{1,}/g
    }
};
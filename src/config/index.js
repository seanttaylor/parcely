/* istanbul ignore file */

/*Non-secret configuration for application modules*/

//HTTP requests are not logged during unit/integration test runs
function logRequestsInNonTestEnvironmentsOnly (req, res) { 
    return process.env.NODE_ENV === "ci/cd/test" 
}


module.exports = {
    application: {
        logger: {
            verbosity: process.env.NODE_ENV === "ci/cd/test" ? "tiny" : "dev",
            behavior: process.env.NODE_ENV === "ci/cd/test" ? logRequestsInNonTestEnvironmentsOnly : () => undefined
        }
    },
    users: {
        emailAddressRegex: /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi,
        userHandleRegex: /\@[a-zA-Z0-9_]{1,}/g
    }
};
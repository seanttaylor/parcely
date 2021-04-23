/* istanbul ignore file */

/*Non-secret configuration for application modules*/

//HTTP requests are not logged during unit/integration test runs
const functions = require("firebase-functions");

function logRequestsInNonTestEnvironmentsOnly (req, res) { 
    return process.env.NODE_ENV === "ci/cd/test" 
}

/**
 * Wrapper for firebase-functions package to generalize environment variable access
 */
function initializeEnvironment() {
    let envMap;

    if (process.env.NODE_ENV ===  "ci/cd/test") {
        envMap = process.env;
    } else {
        envMap = functions.config().env;
    }
     
   return {
        get(keyName) {
            if (process.env.NODE_ENV !== "ci/cd/test") {
                //Environment variables in firebase functions can only contain lowercase letters
                return envMap[keyName.toLowerCase()];
            }
            return envMap[keyName];
        }
    }
}




module.exports = {
    environment: initializeEnvironment(),
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
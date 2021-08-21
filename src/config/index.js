/* istanbul ignore file */

/* Non-secret configuration for application modules */

// HTTP requests are not logged during unit/integration test runs

function logRequestsInNonTestEnvironmentsOnly() {
  return process.env.NODE_ENV === 'ci/cd/test';
}

/**
 * Wrapper for firebase-functions package to generalize environment variable access
 */
function initializeEnvironment() {
  const envMap = process.env;

  return {
    get(keyName) {
      return envMap[keyName];
    },
  };
}

module.exports = {
  environment: initializeEnvironment(),
  application: {
    logger: {
      verbosity: process.env.NODE_ENV === 'ci/cd/test' ? 'tiny' : 'dev',
      behavior: process.env.NODE_ENV === 'ci/cd/test' ? logRequestsInNonTestEnvironmentsOnly : () => undefined,
    },
  },
  users: {
    emailAddressRegex: /\b[\w-]+@[\w-]+\.\w{2,4}\b/gi,
  },
};

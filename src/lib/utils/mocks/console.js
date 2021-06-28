/* istanbul ignore file */

/**
 * Mock implementation for various console methods
 */
const mockConsoleImplementation = {
  error() {
    this.calledMethods.error = true;
  },
  log() {
    this.calledMethods.log = true;
  },
  info() {
    this.calledMethods.info = true;
  },
  calledMethods: {
    error: false,
    log: false,
    info: false,
  },
};

module.exports = mockConsoleImplementation;

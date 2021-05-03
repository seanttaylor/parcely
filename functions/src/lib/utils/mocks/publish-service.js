/* istanbul ignore file */

/**
 * Mock implementation for various publishService methods
 * See /src/interfaces/publisher for documentation
 */
const mockPublishServiceImplementation = {
  onPublishFn(fn) {
    this.calledMethods.onPublishFnCalledWithArg = !!fn;
    this.calledMethods.onPublishFn = true;
  },
  eventEmitter: {
    on() {

    },
  },
  calledMethods: {
    onPublishFn: false,
    onPublishFnCalledWithArg: null,
  },
  _data: {},
};

module.exports = mockPublishServiceImplementation;

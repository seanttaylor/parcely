/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to 'ci/cd/test'//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';

const IPublisher = require('../../src/interfaces/publisher');
const SSEPublisher = require('../../src/lib/publisher/sse');
const mocks = require('../../src/lib/utils/mocks');

const ssePublishService = new IPublisher(new SSEPublisher(mocks.mockImpl.publishService.eventEmitter));

/** Tests ** */

describe('Server-Sent Event Publisher', () => {
  test('Completes initialization of the SSE publisher', () => {
    ssePublishService.init(() => mocks.mockImpl.publishService.onPublishFn());
    ssePublishService.publish(['SSEPublisher.TelemetryUpdateReceived', { toJSON: () => null }]);

    expect(mocks.mockImpl.publishService.calledMethods.onPublishFn).toBe(true);
  });

  test('Should NOT complete initialization of the SSE publisher without an onPublish function', () => {
    ssePublishService.init();
    ssePublishService.publish(['SSEPublisher.TelemetryUpdateReceived', { toJSON: () => null }]);

    expect(mocks.mockImpl.publishService.calledMethods.onPublishFnCalledWithArg).toBe(false);
  });
});

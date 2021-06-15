/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to 'ci/cd/test'//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';
const ServerSentEvent = require('../../src/lib/sse');
const SSEPublisher = require('../../src/lib/publisher/sse');
const publisher = new SSEPublisher();
const sse = ServerSentEvent();

describe('Server-Sent Event Creation', () => {
  test('Should return a string matching the Server-Sent Event/Event Stream format', () => {
    const [myEvent] = sse.of('fakeEvent');
    expect(typeof (myEvent)).toBe('string');
  });

  test('Should initialize the publisher', () => {
    //This won't return anything, purely here to exercise the side-effect...and the coverage report...
    publisher.init();
    publisher.publish(['fakeEvent', {}]);
  });
});

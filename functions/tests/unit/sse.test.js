/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to 'ci/cd/test'//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';
const ServerSentEvent = require('../../src/lib/sse');

const sse = ServerSentEvent();

describe('Server-Sent Event Creation', () => {
  test('Should return a string matching the Server-Sent Event/Event Stream format', () => {
    const [myEvent] = sse.of('fakeEvent');
    expect(typeof (myEvent)).toBe('string');
  });
});

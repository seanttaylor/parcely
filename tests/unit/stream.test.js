/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to 'ci/cd/test'//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';
const { MockStream } = require('../../src/lib/stream');
const IStreamService = require('../../src/interfaces/stream');
const streamService = new IStreamService(new MockStream());

describe('Stream Management', () => {

  test('Should throw an error when a stream subscription does not have an onMessage function', async () => {
    try {
      await streamService.subscribe({topic: 'fakeTopic', onMessageFn: null });
    } catch(e) {
        expect(e.message).toMatch('StreamService.BadRequest');
    }
  });
});

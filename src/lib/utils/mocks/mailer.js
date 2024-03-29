/* istanbul ignore file */

/**
 * Mock implementation for various mailer service methods
 */
function mockMailerImplementation({ eventEmitter }) {
  eventEmitter.on('UserService.newUserCreated', send);
  const calledMethods = {
    send: false,
  };

  async function send() {
    calledMethods.send = true;
    return { messageId: 'fake-id', messagePreviewURL: 'http://who-cares.io' };
  }

  return {
    send,
    calledMethods,
  };
}

module.exports = mockMailerImplementation;

/*
* Implements IPublisher interface for publishing posts
* See interfaces/publisher for method documentation
* Publishes posts to connected clients via Server-Sent Events (e.g. a web browser)
*/

const ServerSentEvent = require('../sse');

const sse = ServerSentEvent();

/**
 * @implements {IPublisherAPI}
 * @param {EventEmitter} eventEmitter - an instance of EventEmitter
 */

function SSEPublisher(eventEmitter) {
  let onPublish;
  /**
    * Serializes an instance of the Post class to EventStream format sending Server-Sent Events
    * @param {Array} eventData - whose elements consist of a {String} eventName and an {Object} having a toJSON method
    */

  this.publish = function ([eventName, data]) {
    const event = sse.of(eventName, data);
    onPublish(event);
  };

  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'ci/cd/test') {
    /* These lines are ignored because a connection to the server needs to be kept alive in order to successfully trigger the event. Inside of a test this would cause the test to hang indefinitely
    */
    /* istanbul ignore next */
    eventEmitter.on('SSEPublisher.TelemetryUpdateReceived', this.publish);
  }

  /**
    * Adds additional configuration necessary to execute the publish method after class is instantiated
    * @param {Function} onPublishFn - a function containing the implementation for publishing events
    */

  this.init = function (onPublishFn) {
    if (!onPublishFn) {
      return;
    }

    onPublish = onPublishFn;
  };
}

module.exports = SSEPublisher;

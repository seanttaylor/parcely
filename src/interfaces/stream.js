/* istanbul ignore file */

/**
* An object having the IStreamService API; a set of methods for managing data streams
* @typedef {Object} IStreamServiceAPI
* @property {Function} connect - creates a new storage bucket
* @property {Function} subscribe - list all buckets

/**
 * Interface for a stream service
 * @param {IStreamServiceAPI} myImpl - object defining concrete implementations for interface methods
 */

function IStreamService(myImpl) {
  function required() {
    throw Error('Missing implementation');
  }

  /**
   * Connects to a data stream
   */
  this.connect = myImpl.connect || required;

  /**
   * @param {String} topic- stream topic to subscribe to
   * @param {Function} onMessageFn - callback function to process messages
   * after they are consumed
   */
  this.subscribe = myImpl.subscribe || required;
}

module.exports = IStreamService;

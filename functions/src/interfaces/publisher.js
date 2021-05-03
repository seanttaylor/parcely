/* istanbul ignore file */

/**
* An object having the IPublisher API; a set of methods for publishing user posts
* @typedef {Object} IPublisherAPI
* @property {Function} publish - publishes posts to a consumer
* @property {Function} setup - adds additional configuration necessary to execute the publish method after class is instantiated
*/

/**
 * Interface for a service to deliver published posts to a specified consumer
 * @param {IPublisherAPI} myImpl - object defining concrete implementations for interface methods
 */

function IPublisher(myImpl) {
  function required() {
    throw Error('Missing implementation');
  }

  /**
    @param {Post} post - an instance of the Post class
    */
  this.publish = myImpl.publish || required;

  /**
    @param {Response} response - an instance of an Express response object
    */
  this.init = myImpl.init || required;
}

module.exports = IPublisher;

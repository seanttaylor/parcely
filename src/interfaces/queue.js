/* istanbul ignore file */

/**
* An object having the IQueue API; a set of methods for managing queue entries
* @typedef {Object} IQueueAPI
* @property {Function} enqueue - introduce a new entry into the queue
* @property {Function} dequeue - pull an entry from the queue
* @property {Function} size - get the number of entries currently in the queue
* @property {Function} contains - checks for the presence of an item in the queue
*/

/** Interface for managing queue entries
 * @param {IQueueAPI} myImpl
*/

function IQueue(myImpl) {
    function required() {
        throw Error("Missing implementation");
    }

    this.enqueue = myImpl.enqueue || required;

    this.dequeue = myImpl.dequeue || required;

    this.size = myImpl.size || required;

    this.contains = myImpl.contains || required;

}

module.exports = IQueue;
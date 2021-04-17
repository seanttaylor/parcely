const SQSQueue = require("./sqs");

/* Implements the IQueue interface 
* See interfaces/queue for method documentation
* Manages queue entries
*/


/**
 * @implements {IQueueAPI}
 * @returns {Object} an implementation of the IQueue interface
 */

function Queue() {

    const currentQueue = [];

    /**
     * @returns {Integer} the size of the current queue
     */
    this.enqueue = async function(entry) {
        return currentQueue.unshift(entry);
    }

    /**
     * @returns {Array} - a list containing a queue entry or entries
     */
    this.dequeue = async function(key) {
        return [currentQueue.pop()];
    }

    /**
     * @returns {Integer} - the size of the queue 
     */

    this.size = async function() {
        return currentQueue.length;
    }
}


module.exports = {
    InMemoryQueue: Queue,
    SQSQueue
};
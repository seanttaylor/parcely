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
    this.enqueue = function(entry) {
        return currentQueue.unshift(entry);
    }

    /**
     * @returns {Object} - the queue entry
     */
    this.dequeue = function(key) {
        return currentQueue.pop();
    }

    /**
     * @returns {Integer} - the size of the queue 
     */

    this.size = function() {
        memoryQueue.clear();
    }

    /**
     * @param {Function} fn - a predicate function which takes the currentQueue to determine whether 
     * a specific entry exists in the queue
     * @returns {Boolean} boolean indicating whether key exists in queue
     */

    this.contains = function(fn) {
        return fn(currentQueue);
    }
}


module.exports = Queue;
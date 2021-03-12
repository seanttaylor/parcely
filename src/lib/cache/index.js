/* Implements the ICache interface 
* See interfaces/cache for method documentation
* Manages cache entries
*/

const memoryCache = require("memory-cache");
const DEFAULT_TTL = 300000;

/**
* @typedef {Object} CacheEntry
* @property {String} key - the key of a specified cache entry
* @property {String} value - the value of a cache entry
* @property {Number} ttl - the Time-to-Live of the cache entry 
*/

/**
 * @implements {ICacheAPI}
 * @returns {Object} an implementation of the ICache interface
 */

function Cache() {
    /**
    * Creates a new cache entry
    * @param {CacheEntry} entry - A new entry to introduce into the cache
    */

    this.set = function({ key, value, ttl = DEFAULT_TTL }) {
        memoryCache.put(key, value, ttl);
    }

    /**
    * Gets an existing cache entry
    * @param {String} key - the key of a specified cache entry
    * @returns {CacheEntry} the cache entry
    */

    this.get = function(key) {
        return memoryCache.get(key);
    }

    /**
    * Deletes an entry from the cache
    * @param {String} key - the key of a specified cache entry
    */

    this.delete = function(key) {
        memoryCache.del(key);
    }

    /**
    * Clears the cache of all entries
    */

    this.clear = function() {
        memoryCache.clear();
    }

    /**
    * Checks whether a given cache entry is expired
    * @param {String} key - the key of a specified cache entry
    * @returns {Boolean} boolean indicating whether key exists in cache
    */

    this.has = function(key) {
        return memoryCache.keys().includes(key);
    }
}


module.exports = Cache;
/* Implements the ICache interface
* See interfaces/cache for method documentation
* Manages cache entries
*/

const memoryCache = require('memory-cache');

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
  this.set = function ({ key, value, ttl = DEFAULT_TTL }) {
    memoryCache.put(key, value, ttl);
  };

  this.get = function (key) {
    return memoryCache.get(key);
  };

  this.delete = function (key) {
    memoryCache.del(key);
  };

  this.clear = function () {
    memoryCache.clear();
  };

  this.has = function (key) {
    return memoryCache.keys().includes(key);
  };
}

module.exports = Cache;

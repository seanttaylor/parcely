/* istanbul ignore file */

/**
* An object having the IStorageBucket API; a set of methods for managing storage buckets
* @typedef {Object} IStorageBucketAPI
* @property {Function} create - creates a new storage bucket
* @property {Function} listBuckets - list all buckets
* @property {Function} listBucketContents - list all items in a specified bucket
* @property {Function} getBucketItem - get specified bucket item
* @property {Function} deleteBucketItem - delete specified bucket item
* @property {Function} deleteBucket - delete a specified bucket
* @property {Function} getBucket - get a specified bucket
* @property {Function} putBucket - add a new entry to a specified bucket

/**
 * Interface for a storage bucket
 * @param {IStorageBucketAPI} myImpl - object defining concrete implementations for interface methods
 */

function IStorageBucket(myImpl) {
  function required() {
    throw Error('Missing implementation');
  }

  /**
     @returns {Object} - a new storage bucket
    */
  this.create = myImpl.create || required;

  /**
     @returns {Array} - a list of buckets
    */
  this.listBuckets = myImpl.listBuckets || required;

  /**
     @returns {Array} - a list of all items in the bucket
    */
  this.listBucketContents = myImpl.listBucketContents || required;

  /**
     @returns {Object} - a bucket item
    */
  this.getBucketItem = myImpl.getBucketItem || required;

  /**
     @returns
    */
  this.deleteBucketItem = myImpl.deleteBucketItem || required;

  /**
     @returns
    */
  this.deleteBucket = myImpl.deleteBucket || required;

  /**
     @returns {Object} a storage bucket
    */
  this.getBucket = myImpl.getBucket || required;

  /**
     @returns
    */
  this.putBucket = myImpl.putBucket || required;
}

module.exports = IStorageBucket;

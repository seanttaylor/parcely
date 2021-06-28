/* Implements the IStorageBucket interface
* See interfaces/storage-buckeet for method documentation
* Manages queue entries
*/

/**
 * @implements {IStorageBucketAPI}
 * @returns {Object} an implementation of the IStorageBucket interface
 */

function StorageBucket() {
  const buckets = {};

  /**
   * @param {String} bucketName
     @returns {Object} - a new storage bucket
    */
  this.create = async function (bucketName) {
    if (buckets[bucketName]) {
      throw Error('CannotCreateBucket.BadRequest.BucketNameAlreadyExists');
    }
    buckets[bucketName] = {};
  };

  /**
     @returns {Array} - a list of buckets
    */
  this.listBuckets = async function () {
    return Object.keys(buckets);
  };

  /**
   * @param {String} bucketName - name of the bucket
     @returns {Array} - a list of all items in the bucket
    */
  this.listBucketContents = async function (bucketName) {
    return Object.keys(buckets[bucketName]);
  };

  /**
   * @param {String} bucketName - name of the bucket
   * @param {String} itemName - name of the item
     @returns {Object} - storage bucket item
    */
  this.getBucketItem = async function (bucketName, itemName) {
    return buckets[bucketName][itemName];
  };

  /**
   * @param {String} bucketName - name of the bucket
   * @param {String} itemName - name of the item
     @returns
    */
  this.deleteBucketItem = async function (bucketName, itemName) {
    delete buckets[bucketName][itemName];
  };

  /**
   * @param {String} bucketName - name of the bucket
     @returns
    */
  this.deleteBucket = async function (bucketName) {
    delete buckets[bucketName];
  };

  /**
   * @param {String} bucketName - name of the bucket
     @returns {Object} a storage bucket
    */
  this.getBucket = async function (bucketName) {
    return buckets[bucketName];
  };

  /**
   * @param {String} bucketName - name of the bucket
   * @param {String} itemName - name of the bucket item
   * @param {Buffer} item - Buffer object containing data
     @returns
    */
  this.putBucket = async function ({ bucketName, itemName, item }) {
    if (!buckets[bucketName]) {
      throw Error(`CannotPut.BadRequest.BucketNotFound (${bucketName})`);
    }
    buckets[bucketName][itemName] = item;
  };
}

module.exports = {
  InMemoryStorageBucket: StorageBucket,
};

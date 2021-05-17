/* istanbul ignore file */

const express = require('express');
const {
  authorizeRequest,
  validateJWT,
} = require('../../lib/middleware');

const router = new express.Router();

/**
 * @param {StorageBucketService} storageBucketService - an instance of StorageBucketService
 * @returns router - an instance of an Express router
 */

function StorageRouter(storageBucketService) {
  // This API will be deprecated in favor of a permanent solution for static files storage (e.g. AWS S3)
  router.get('/buckets/:bucketId/:itemId', async (req, res) => {
    const { bucketId, itemId } = req.params;
    const bucketItem = await storageBucketService.getBucketItem(bucketId, itemId);

    if (!bucketItem) {
      res.status(404);
      res.end();
      return;
    }

    res.status(200);
    res.set({
      'content-type': 'image/png',
      'content-length': bucketItem.length,
    });
    res.end(bucketItem);
  });

  router.get('/buckets', validateJWT, authorizeRequest({ actionId: 'readAny:buckets' }), async (req, res) => {
    const bucketList = await storageBucketService.listBuckets();

    res.status(200);
    res.json({
      entries: bucketList,
      error: null,
      count: bucketList.length,
    });
  });

  router.get('/buckets/:bucketId', validateJWT, authorizeRequest({ actionId: 'readAny:buckets' }), async (req, res) => {
    const { bucketId } = req.params;
    const bucket = await storageBucketService.getBucket(bucketId);

    if (!bucket) {
      res.status(404);
      res.end();
      return;
    }

    res.status(200);
    res.json({
      entries: Object.keys(bucket),
      error: null,
      count: Object.keys(bucket).length,
    });
  });

  return router;
}

module.exports = StorageRouter;

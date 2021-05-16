/* istanbul ignore file */

const express = require('express');

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

    res.status(200);
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': bucketItem.length,
    });
    res.end(bucketItem);
  });

  router.get('/buckets', async (req, res) => {
    const bucketList = await storageBucketService.listBuckets();

    res.status(200);
    res.json({
      entries: bucketList,
      error: null,
      count: bucketList.length,
    });
  });

  router.get('/buckets/:bucketId', async (req, res) => {
    const { bucketId } = req.params;
    const bucket = await storageBucketService.getBucket(bucketId);

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

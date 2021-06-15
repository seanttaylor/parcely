/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to 'ci/cd/test'//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';
const IStorageBucket = require('../../src/interfaces/storage-bucket');
const petname = require('node-petname');
const {InMemoryStorageBucket} = require('../../src/lib/storage');
const testStorageBucketService = new IStorageBucket(new InMemoryStorageBucket());

describe('Storage Bucket Management', () => {
  test('Should be able to create a new storage bucket', async () => {
    const bucketName = petname(2, '-');
    const bucket = await testStorageBucketService.create(bucketName);
    const bucketList = await testStorageBucketService.listBuckets();

    expect(bucketList.length === 1).toBe(true);
    expect(typeof(testStorageBucketService.getBucket(bucketName)) === 'object').toBe(true);
  });

  test('Should be able to get a list of existing storage buckets', async () => {
    const bucketName = petname(2, '-');
    await testStorageBucketService.create(bucketName);
    const bucketList = await testStorageBucketService.listBuckets();

    expect(Array.isArray(bucketList)).toBe(true);
    expect(bucketList.includes(bucketName)).toBe(true);
  });

  test('Should NOT be able to create a bucket with a bucketName that already exists', async () => {
    try {
      const bucketName = petname(2, '-');
      await testStorageBucketService.create(bucketName);
      await testStorageBucketService.create(bucketName);
    } catch(e) {
        expect(e.message).toMatch('CannotCreateBucket.BadRequest.BucketNameAlreadyExists');
    }
  });

  test('Should be able to list contents of a specified bucket', async () => {
    const bucketName = petname(2, '-');
    await testStorageBucketService.create(bucketName);
    const bucketContents = await testStorageBucketService.listBucketContents(bucketName);

    expect(Array.isArray(bucketContents)).toBe(true);
    expect(bucketContents.length === 0).toBe(true);
  });

  test('Should be able to get a specified bucket item', async () => {
    const bucketName = petname(2, '-');
    await testStorageBucketService.create(bucketName);
    await testStorageBucketService.putBucket({
        item: Buffer.alloc(8),
        itemName: 'testItem',
        bucketName, 
    })
    const bucketItem = await testStorageBucketService.getBucketItem(bucketName, 'testItem');
    expect(typeof(bucketItem) === 'object').toBe(true);
   });

   test('Should be able to get a specified bucket item', async () => {
    const bucketName = petname(2, '-');
    await testStorageBucketService.create(bucketName);
    await testStorageBucketService.putBucket({
        item: Buffer.alloc(8),
        itemName: 'testItem',
        bucketName, 
    })
    const bucketItem = await testStorageBucketService.getBucketItem(bucketName, 'testItem');
    expect(typeof(bucketItem) === 'object').toBe(true);
   });

   test('Should NOT be able to put a bucket item in a non-existing bucket', async () => {
    try {
      await testStorageBucketService.putBucket({
          bucketName: 'bogus-bucket', 
          item: {},
          itemName: 'fake-item'
        });
    } catch(e) {
        expect(e.message).toMatch('CannotPut.BadRequest.BucketNotFound');
    }
  });

   test('Should be able to delete a specified bucket item', async () => {
    const bucketName = petname(2, '-');
    await testStorageBucketService.create(bucketName);
    await testStorageBucketService.putBucket({
        item: Buffer.alloc(8),
        itemName: 'testItem',
        bucketName, 
    })
    const bucketItem = await testStorageBucketService.deleteBucketItem(bucketName, 'testItem');
    const bucketContents = await testStorageBucketService.listBucketContents(bucketName);
    expect(bucketContents.length === 0).toBe(true);
   });

   test('Should be able to delete a specified bucket', async () => {
    const bucketName = petname(2, '-');
    await testStorageBucketService.create(bucketName);
    await testStorageBucketService.deleteBucket(bucketName);

    const bucket = await testStorageBucketService.getBucket(bucketName);
    expect(bucket === undefined).toBe(true);
   });
});

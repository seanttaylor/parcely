/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';

const ICache = require('../../src/interfaces/cache');
const CacheService = require('../../src/lib/cache');

const testCacheService = new ICache(new CacheService());

test('Should be able to create a new entry in the cache', async () => {
  await testCacheService.set({ key: 'foo', value: 'bar' });
  const cacheEntry = await testCacheService.get('foo');
  expect(cacheEntry === 'bar').toBe(true);
});

test('Should be able to delete an existing entry in the cache', async () => {
  await testCacheService.set({ key: 'baz', value: 'qux' });
  await testCacheService.delete('baz');
  const result = await testCacheService.get('baz');

  expect(result === null).toBe(true);
});

test('Should be able to verify existence of an entry in the cache', async () => {
  await testCacheService.set({ key: 'baz', value: 'qux' });
  const result = await testCacheService.has('baz');

  expect(result).toBe(true);
});

test('Should be able to remove all entries from the cache', async () => {
  await testCacheService.set({ key: 'qux', value: 'foo' });
  const res = await testCacheService.clear();
  const result = await testCacheService.has('qux');

  expect(result).toBe(false);
});

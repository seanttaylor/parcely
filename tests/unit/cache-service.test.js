const ICache = require("../../src/interfaces/cache");
const CacheService = require("../../src/lib/cache");
const testCacheService = new ICache(new CacheService());

/**Tests**/

test("Should create a new entry in the cache", async() => {
    await testCacheService.set({key: "foo", value: "bar"});
    const cacheEntry = await testCacheService.get("foo");
    expect(cacheEntry === "bar").toBe(true);
});

test("Should create a new entry in the cache", async() => {
    await testCacheService.set({key: "baz", value: "qux"});
    await testCacheService.delete("baz");
    const result = await testCacheService.get("baz");

    expect(result === null).toBe(true);
});

test("Should return null when deleting an existing entry in the cache", async() => {
    await testCacheService.set({key: "baz", value: "qux"});
    await testCacheService.delete("baz");
    const result = await testCacheService.get("baz");

    expect(result === null).toBe(true);
});

test("Should return true when checking for the existence entry in the cache", async() => {
    await testCacheService.set({key: "baz", value: "qux"});
    const result = await testCacheService.has("baz");

    expect(result).toBe(true);
});

test("Should return true when checking for the existence entry in the cache", async() => {
    await testCacheService.set({key: "qux", value: "foo"});
    const res = await testCacheService.clear();
    const result = await testCacheService.has("qux");

    expect(result).toBe(false);
});
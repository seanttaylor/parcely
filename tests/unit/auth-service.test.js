const mocks = require("../../src/lib/utils/mocks");
const mockUserService = mocks.mockImpl.userService;
const mockCacheService = mocks.mockImpl.cache;
/*AuthService*/
const AuthService = require("../../src/services/auth");
const testAuthService = new AuthService({cacheService: mockCacheService, userService: mockUserService});

/**Tests**/

test("Should assign a new authorization credential to a user", async() => {
    const credential = await testAuthService.issueAuthCredential({});
    //expect(mockUserService.calledMethods.getUserRole).toBe(true);
    expect(typeof(credential) === "string").toBe(true);
});

test("Should expire an existing authorization credential", async() => {
    testAuthService.expireAuthCredential("xxxyyyzzz");
    expect(mockCacheService.calledMethods.del).toBe(true);
});

test("Should validate an existing authorization credential", async() => {
    testAuthService.validateAuthCredential("xxxyyyzzz");
    expect(mockCacheService.calledMethods.has).toBe(true);
});
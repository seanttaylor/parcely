const mocks = require("../../src/lib/utils/mocks");
const config = require("../../src/config");
const mockUserService = mocks.mockImpl.userService;
const mockCacheService = mocks.mockImpl.cache;
/*AuthService*/
const { UserAuthService } = require("../../src/services/auth");
const testAuthService = new UserAuthService({
    cacheService: mockCacheService, 
    userService: mockUserService,
    config
});

/**Tests**/

test("Should be able to assign a new authorization credential to a user", async() => {
    const credential = await testAuthService.issueAuthCredential({}, "user");
    //expect(mockUserService.calledMethods.getUserRole).toBe(true);
    expect(typeof(credential) === "string").toBe(true);
});


test("Should be able to expire an existing authorization credential", async() => {
    testAuthService.expireAuthCredential("xxxyyyzzz");
    expect(mockCacheService.calledMethods.del).toBe(true);
});


test("Should be able to validate an existing authorization credential", async() => {
    testAuthService.validateAuthCredential("xxxyyyzzz");
    expect(mockCacheService.calledMethods.has).toBe(true);
});
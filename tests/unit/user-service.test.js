const uuid = require("uuid");
const events = require("events");
const eventEmitter = new events.EventEmitter();
const { mockImpl } = require("../../src/lib/utils/mocks");
const { UserService } = require("../../src/services/user");
const UserRepository = require("../../src/lib/repository/user/json");
const { randomEmailAddress, randomPhoneNumber } = require("../../src/lib/utils");
const DatabaseConnector = require("../../src/lib/database/connectors/memory");
const testJSONDbConnector = new DatabaseConnector({
    console: mockImpl.console
});
const IUserRepository = require("../../src/interfaces/user-repository");
const testUserJSONRepo = new IUserRepository(new UserRepository(testJSONDbConnector));
const testUserService = new UserService(testUserJSONRepo);

/**Tests**/
afterAll(()=> {
    //testSqlDbConnector.end();
});

test("Should return new User instance", async() => {
    const testUserData = {
        motto: "Hulk smash!",
        emailAddress: randomEmailAddress(),
        firstName: "Bruce",
        lastName: "Banner",
        phoneNumber: randomPhoneNumber()
    };
    const testUser = await testUserService.createUser(testUserData);
    expect(Object.keys(testUser).includes("id")).toBe(true);
    expect(Object.keys(testUser).includes("_repo")).toBe(true);
    expect(Object.keys(testUser).includes("_data")).toBe(true);
});


test("Should return list of User instances", async() => {
    const result = await testUserService.findAllUsers();

    expect(Array.isArray(result)).toBe(true);
    expect(Object.keys(result[0]).includes("id")).toBe(true);
    expect(Object.keys(result[0]).includes("_repo")).toBe(true);
    expect(Object.keys(result[0]).includes("_data")).toBe(true);

});

test("Should return a specified User instance", async() => {
    const testUserData = {
        motto: "Hulk smash!",
        emailAddress: randomEmailAddress(),
        firstName: "Bruce",
        lastName: "Banner",
        phoneNumber: randomPhoneNumber()
    };
    const testUser = await testUserService.createUser(testUserData);
    const testUserId = await testUser.save();
    const result = await testUserService.findUserById(testUserId);

    expect(uuid.validate(testUserId)).toBe(true);
    expect(result[0].id === testUserId).toBe(true);
});


test("Should delete user", async() => {
    //FUNCTIONALITY NOT IMPLEMENTED YET
    const result = await testUserService.deleteUser("fakeUserId");
    expect(result == undefined).toBe(true);
});


test("Should return user id on save", async() => {
    const testUserData = {
        motto: "Hulk smash!",
        emailAddress: randomEmailAddress(),
        firstName: "Bruce",
        lastName: "Banner",
        phoneNumber: randomPhoneNumber()
    };
    const testUser = await testUserService.createUser(testUserData);
    const userId = await testUser.save();
    expect(uuid.validate(userId)).toBe(true);
});

test("Should update user first name", async() => {
    const testFirstnameEdit = "Brucie";
    const testUser = await testUserService.createUser({
        motto: "Hulk smash!",
        emailAddress: randomEmailAddress(),
        firstName: "Bruce",
        lastName: "Banner",
        phoneNumber: randomPhoneNumber()
    });
    const id = await testUser.save();
    testUser.editName({ firstName: testFirstnameEdit });

    expect(testUser._data.firstName === testFirstnameEdit).toBe(true);
});


test("Should update user last name", async() => {
    const testLastnameEdit = "Banner, M.D.";
    const testUser = await testUserService.createUser({
        motto: "Hulk smash!",
        emailAddress: randomEmailAddress(),
        firstName: "Bruce",
        lastName: testLastnameEdit,
        phoneNumber: randomPhoneNumber()
    });
    const id = await testUser.save();
    testUser.editName({ lastName: testLastnameEdit });

    expect(testUser._data.lastName === testLastnameEdit).toBe(true);
});


test("Should update user phone number", async() => {
    const testPhoneNumberEdit = randomPhoneNumber();
    const testUser = await testUserService.createUser({
        motto: "Hulk smash!",
        emailAddress: randomEmailAddress(),
        firstName: "Bruce",
        lastName: "Banner",
        phoneNumber: randomPhoneNumber()
    });
    const id = await testUser.save();
    await testUser.editPhoneNumber(testPhoneNumberEdit);

    expect(testUser._data.phoneNumber === testPhoneNumberEdit).toBe(true);
});


test("Should return false when a user does NOT exist", async() => {
    const fakeUserId = new Date().toISOString();
    const result = await testUserService.userExists(fakeUserId);

    expect(result).toBe(false);
});


test("Should return a user role", async() => {
    const [user] = await testUserService.findUserById("e98417a8-d912-44e0-8d37-abe712ca840f");
    const userRole = await testUserService.getUserRole(user);

    expect(userRole === "admin").toBe(true);
});


test("Should create a new user password", async() => {
    const testUserData = {
        motto: "Hulk smash!",
        emailAddress: randomEmailAddress(),
        firstName: "Bruce",
        lastName: "Banner",
        phoneNumber: randomPhoneNumber()
    };
    const testUser = await testUserService.createUser(testUserData);
    const testUserId = await testUser.save();
    const testPassword = await testUserService.createUserPassword.call(mockImpl.repo, {password: "xxxyyyzzz", user: testUser});
  
    expect(mockImpl.repo._repo.calledMethods.createUserPasswordCalled).toBe(true);
});

test("Should return true when plain-text password and equivalent hash match", async() => {
    const testUserData = {
        motto: "Hulk smash!",
        emailAddress: randomEmailAddress(),
        firstName: "Bruce",
        lastName: "Banner",
        phoneNumber: randomPhoneNumber()
    };
    const testUser = await testUserService.createUser(testUserData);
    const testUserId = await testUser.save();
    const testPasswordHash = await testUserService.createUserPassword({password: "xxxyyyzzz", user: testUser});
    const passwordMatches = await testUserService.isUserPasswordCorrect({password: "xxxyyyzzz", user: testUser});
  
    expect(passwordMatches).toBe(true);
});

test("Should return a User instance with a matching email address", async() => {
    const testUserEmail = randomEmailAddress();
    const testUserData = {
        motto: "Hulk smash!",
        emailAddress: testUserEmail,
        firstName: "Bruce",
        lastName: "Banner",
        phoneNumber: randomPhoneNumber()
    };

    const testUser = await testUserService.createUser(testUserData);
    const testUserId = await testUser.save();
    const testPasswordHash = await testUserService.createUserPassword({password: "xxxyyyzzz", user: testUser});
    
    const [matchedUser] = await testUserService.findUserByEmail(testUserEmail);

    expect(testUser.id === matchedUser.id).toBe(true);
});

test("Should return true when a User instance already exists", async() => {
    const testUserEmail = randomEmailAddress();
    const testUserData = {
        motto: "Hulk smash!",
        emailAddress: testUserEmail,
        firstName: "Bruce",
        lastName: "Banner",
        phoneNumber: randomPhoneNumber()
    };

    const testUser = await testUserService.createUser(testUserData);
    const testUserId = await testUser.save();
    const testPasswordHash = await testUserService.createUserPassword({password: "xxxyyyzzz", user: testUser});
    
    const result = await testUserService.userExists(testUserId);

    expect(result).toBe(true);
});

test("Should return JSON object representation", async() => {
    const testUser = await testUserService.createUser({
        motto: "Let's do this!",
        emailAddress: randomEmailAddress(),
        firstName: "Steve",
        lastName: "Rogers",
        phoneNumber: randomPhoneNumber()
    });

    await testUser.save();
    expect(typeof(testUser.toJSON()) === "object").toBe(true);
});


/*Negative Tests*/

test("Should return FALSE when plain-text password and hash do NOT match", async() => {
    const testUserData = {
        motto: "Hulk smash!",
        emailAddress: randomEmailAddress(),
        firstName: "Bruce",
        lastName: "Banner",
        phoneNumber: randomPhoneNumber()
    };
    const testUser = await testUserService.createUser(testUserData);
    const testUserId = await testUser.save();

    const testPasswordHash = await testUserService.createUserPassword({password: "xxxyyyzzz", user: testUser});
    const passwordMatches = await testUserService.isUserPasswordCorrect({password: "foobarbaz", user: testUser});
  
    expect(passwordMatches).toBe(false);
});


test("Should throw exception when attempting to create an invalid user", async() => {
    try {
        await testUserService.createUser();
    }
    catch (e) {
        expect(e.message).toMatch("UserDataEmpty");
    }
});

test("Should throw an exception when email address is missing", async() => {
    try {
        await testUserService.createUser({
            motto: "Hulk smash!",
            firstName: "Bruce",
            lastName: "Banner",
            phoneNumber: randomPhoneNumber()
        });
    }
    catch (e) {
        expect(e.message).toMatch("MissingOrInvalidEmail.Missing");
    }
});

test("Should throw an exception when first name is missing", async() => {
    try {
        await testUserService.createUser({
            motto: "Hulk smash!",
            lastName: "Banner",
            emailAddress: randomEmailAddress(),
            phoneNumber: randomPhoneNumber()
        });
    }
    catch (e) {
        expect(e.message).toMatch("MissingOrInvalidFirstName");
    }
});

test("Should throw an exception when last name is missing", async() => {
    try {
        await testUserService.createUser({
            motto: "Hulk smash!",
            firstName: "Bruce",
            emailAddress: randomEmailAddress(),
            phoneNumber: randomPhoneNumber()
        });
    }
    catch (e) {
        expect(e.message).toMatch("MissingOrInvalidLastName");
    }
});






test("Should throw exception when phone number is missing", async() => {
    try {
        await testUserService.createUser({
            motto: "Hulk smash!",
            firstName: "Bruce",
            lastName: "Banner",
            emailAddress: randomEmailAddress()
        });
    }
    catch (e) {
        expect(e.message).toMatch("MissingOrInvalidPhone");
    }
});

test("Should throw exception when creating a user with an email that already exists", async() => {
    try {
        const testEmailAddress = randomEmailAddress();
        const testUserNo1 = await testUserService.createUser({
            emailAddress: testEmailAddress,
            firstName: "Bruce",
            lastName: "Banner",
            phoneNumber: randomPhoneNumber()
        });
        await testUserNo1.save();

        const testUserNo2 = await testUserService.createUser({
            emailAddress: testEmailAddress,
            firstName: "Bruce",
            lastName: "Banner",
            phoneNumber: randomPhoneNumber()
        });
        await testUserNo2.save();
    }
    catch (e) {
        expect(e.message).toMatch("MissingOrInvalidEmail.EmailExists");
    }
});


test("Should throw exception when creating user with invalid email address", async() => {
    try {
        const testUserNo1 = await testUserService.createUser({
            emailAddress: "invalid-email@",
            firstName: "Bruce",
            lastName: "Banner",
            phoneNumber: randomPhoneNumber()
        });
        await testUserNo1.save();
    }
    catch (e) {
        expect(e.message).toMatch("MissingOrInvalidEmail.Format");
    }
});


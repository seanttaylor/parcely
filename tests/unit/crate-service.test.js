const { mockImpl } = require("../../src/lib/utils/mocks");
const uuid = require("uuid");
const CrateService = require("../../src/services/crate");
const CrateRepository = require("../../src/lib/repository/crate");
const DatabaseConnector = require("../../src/lib/database/connectors/memory");
const testDbConnector = new DatabaseConnector({console: mockImpl.console});
const ICrateRepository = require("../../src/interfaces/crate-repository");
const testCrateRepo = new ICrateRepository(new CrateRepository(testDbConnector));
const testCrateService = new CrateService(testCrateRepo);

/**Tests**/
afterAll(()=> {
    //testSqlDbConnector.end();
});

test("Should return new Crate instance", async() => {
    const testCrateData = {
        size: ["M"]
    };
    const testCrate = await testCrateService.createCrate(testCrateData);
    expect(Object.keys(testCrate).includes("id")).toBe(true);
    expect(Object.keys(testCrate).includes("_repo")).toBe(true);
    expect(Object.keys(testCrate).includes("_data")).toBe(true);    
});


test("Should return list of Crate instances", async() => {
    const result = await testCrateService.getAllCrates();

    expect(Array.isArray(result)).toBe(true);
    expect(Object.keys(result[0]).includes("id")).toBe(true);
    expect(Object.keys(result[0]).includes("_repo")).toBe(true);
    expect(Object.keys(result[0]).includes("_data")).toBe(true);
});

test("Should return a specified Crate instance", async() => {
    const testCrateData = {
      size: ["S"]
    };
    const testCrate = await testCrateService.createCrate(testCrateData);
    const testCrateId = await testCrate.save();
    const result = await testCrateService.getCrateById(testCrateId);

    expect(uuid.validate(testCrateId)).toBe(true);
    expect(result[0].id === testCrateId).toBe(true);
});


test("Should delete user", async() => {
    //FUNCTIONALITY NOT IMPLEMENTED YET
    const result = await testCrateService.deleteCrate("fakeUserId");
    expect(result == undefined).toBe(true);
});


test("Should return user id on save", async() => {
    const testCrateData = {
        size: ["L"]
    };
    const testCrate = await testCrateService.createCrate(testCrateData);
    const testCrateId = await testCrate.save();
    expect(uuid.validate(testCrateId)).toBe(true);
});


test("Should mark crate for pending return", async() => {
    const testCrate = await testCrateService.createCrate({
      size: ["S"]
    });

    await testCrate.save();
    expect(typeof(testCrate.toJSON()) === "object").toBe(true);
});

test("Should return JSON object representation", async() => {
    const testCrate = await testCrateService.createCrate({
      size: ["S"]
    });

    await testCrate.save();
    expect(typeof(testCrate.toJSON()) === "object").toBe(true);
});


/*Negative Tests*/


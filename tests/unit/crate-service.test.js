const { mockImpl } = require("../../src/lib/utils/mocks");
const uuid = require("uuid");
const Ajv = require("ajv");
const ajv = new Ajv();
const crateSchema = require("../../src/schemas/crate.json");
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


test("Should delete crate", async() => {
    const result = await testCrateService.deleteCrate("crateId");
    expect(result == undefined).toBe(true);
});


test("Should return crate id on save", async() => {
    const testCrateData = {
        size: ["L"]
    };
    const testCrate = await testCrateService.createCrate(testCrateData);
    const testCrateId = await testCrate.save();
    expect(uuid.validate(testCrateId)).toBe(true);
});


test("Should set crate status to pendingReturn", async() => {
    const testCrate = await testCrateService.createCrate({
      size: ["S"]
    });

    await testCrate.save();
    testCrateService.markCrateReturned(testCrate);
    const [crateStatus] = testCrate._data.status;
    
    expect(crateStatus === "pendingReturn").toBe(true);
});


test("Should get current crate telemetry data", async() => {
    const testCrate = await testCrateService.createCrate({
      size: ["S"]
    });
    
    await testCrate.save();
    const telemetry = await testCrateService.getCurrentCrateTelemetry(testCrate);
  
    expect(typeof(testCrate) === "object").toBe(true);
});


test("Should get a list of crate trips for a specified crate", async() => {
    const testCrate = await testCrateService.createCrate({
      size: ["S"]
    });
    
    await testCrate.save();
    const crateTripList = await testCrateService.getCrateTrips(testCrate);
  
    expect(Array.isArray(crateTripList)).toBe(true);
});

test("Should return a specified trip for a specified crate", async() => {
    const testCrateTripId = "d54cc57f-c32c-454a-a295-6481f126eb8b";
    const testCrate = await testCrateService.createCrate({
      size: ["S"]
    });
    
    await testCrate.save();
    const crateTrip = await testCrateService.getCrateTripById(testCrateTripId);
  
    expect(crateTrip.id === testCrateTripId).toBe(true);
});



test("Should return JSON object representation", async() => {
    const testCrate = await testCrateService.createCrate({
      size: ["S"]
    });

    await testCrate.save();
    expect(typeof(testCrate.toJSON()) === "object").toBe(true);
});


/*Negative Tests*/


const { mockImpl } = require("../../src/lib/utils/mocks");
const uuid = require("uuid");
const Ajv = require("ajv");
const ajv = new Ajv();
const faker = require("faker");
const crateSchema = require("../../src/schemas/crate.json");
const CrateService = require("../../src/services/crate");
const CrateRepository = require("../../src/lib/repository/crate");
const CrateTripRepository = require("../../src/lib/repository/crate-trip");
const DatabaseConnector = require("../../src/lib/database/connectors/memory");
const testDbConnector = new DatabaseConnector({console: mockImpl.console});
const ICrateRepository = require("../../src/interfaces/crate-repository");
const ICrateTripRepository = require("../../src/interfaces/trip-repository");
const testCrateRepo = new ICrateRepository(new CrateRepository(testDbConnector));
const testCrateTripRepo = new ICrateTripRepository(new CrateTripRepository(testDbConnector));
const testCrateService = new CrateService({
    crateRepo: testCrateRepo,
    crateTripRepo: testCrateTripRepo
});

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
    expect(result.id === testCrateId).toBe(true);
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
    const telemetry = await testCrate.getCurrentTelemetry();
  
    expect(typeof(telemetry) === "object").toBe(true);
});


test("Should associate a specified user with a crate", async() => {
    const thorUserId = "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09";
    const testCrate = await testCrateService.createCrate({
      size: ["S"],
      merchantId: faker.random.uuid()
    });
    
    await testCrate.save();
    await testCrate.setRecipient(thorUserId);
  
    expect(testCrate._data.recipientId === thorUserId).toBe(true);
});


test("Should get a list of crates associated with a specified user", async() => {
    const thorUserId = "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09";
    const testCrate = await testCrateService.createCrate({
      size: ["S"]
    });
    
    await testCrate.save();
    await testCrate.setRecipient(thorUserId);
  
    const crateList = await testCrateService.getCratesByRecipient({ 
        id: thorUserId 
    });

    expect(Array.isArray(crateList)).toBe(true);
    expect(crateList[0]._data.recipientId === thorUserId).toBe(true);
});


test("Should return new CrateTrip instance", async() => {
    const testCrateData = {
        size: ["M"]
    };
    const testCrate = await testCrateService.createCrate(testCrateData);
    expect(Object.keys(testCrate).includes("id")).toBe(true);
    expect(Object.keys(testCrate).includes("_repo")).toBe(true);
    expect(Object.keys(testCrate).includes("_data")).toBe(true);    
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


test("Should create a new trip for an existing crate", async() => {
     const originAddress = {
        street: faker.address.streetName(),
        apartmentNumber: "7",
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };
    const destinationAddress = {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };
    const testCrate = await testCrateService.createCrate({
      size: ["S"],
      merchantId: faker.random.uuid(),
      recipientId: faker.random.uuid()
    });
    
    const testCrateId = await testCrate.save();
    const testCrateTripId = await testCrate.startTrip({
        originAddress, 
        destinationAddress, 
        trackingNumber: faker.random.uuid()
    });
    const [crateTrip] = await testCrateService.getCrateTrips(testCrate);
    const crateDbRecord = await testCrateService.getCrateById(testCrateId);
    
    expect(crateTrip.id === testCrateTripId).toBe(true);
    expect(crateDbRecord._data.status[0] === "inTransit");
    expect(testCrate._data.status[0] === "inTransit");
});


test("Should push telemetry data to platform", async() => {
    const testCrate = await testCrateService.createCrate({
      size: ["S"],
      merchantId: faker.random.uuid(),
      recipientId: faker.random.uuid()
    });
    const originAddress = {
        street: faker.address.streetName(),
        apartmentNumber: "7",
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };
    const destinationAddress = {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };
    const fakeTelemetryData = {
        "temp": {
            "degreesFahrenheit": String(faker.random.float())
        },
        "location": {
            "coords": {
                "lat": faker.address.latitude(),
                "long": faker.address.longitude()
            },
            "zip": faker.address.zipCode()
        },
        "sensors": {
            "moisture": {
                "thresholdExceeded": false
            },
            "thermometer": {
                "thresholdExceeded": false
            },
            "photometer": {
                "thresholdExceeded": false
            }
        }
    };
    
    await testCrate.save();
    const testCrateTripId = await testCrate.startTrip({
        originAddress, 
        destinationAddress, 
        trackingNumber: faker.random.uuid()
    });
    
    await testCrate.pushTelemetry(fakeTelemetryData);
    const updatedTestCrate = await testCrateService.getCrateById(testCrate.id);
   
    expect(updatedTestCrate._data.telemetry.temp.degreesFahrenheit === fakeTelemetryData.temp.degreesFahrenheit).toBe(true);

    expect(testCrate._data.telemetry.temp.degreesFahrenheit === fakeTelemetryData.temp.degreesFahrenheit).toBe(true);

    expect(testCrate._data.telemetry.location.coords.lat === fakeTelemetryData.location.coords.lat).toBe(true);

    expect(testCrate._data.telemetry.location.coords.long === fakeTelemetryData.location.coords.long).toBe(true);

    expect(testCrate._data.telemetry.location.zip === fakeTelemetryData.location.zip).toBe(true);
});

test("Pushing crate telemetry should add a waypoint to the associated CrateTrip", async() => {
    const originAddress = {
        street: faker.address.streetName(),
        apartmentNumber: "7",
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };
    const destinationAddress = {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };

    const fakeTelemetryData = {
        "temp": {
            "degreesFahrenheit": String(faker.random.float())
        },
        "location": {
            "coords": {
                "lat": faker.address.latitude(),
                "long": faker.address.longitude()
            },
            "zip": faker.address.zipCode()
        },
        "sensors": {
            "moisture": {
                "thresholdExceeded": false
            },
            "thermometer": {
                "thresholdExceeded": false
            },
            "photometer": {
                "thresholdExceeded": false
            }
        }
    };

    const testCrate = await testCrateService.createCrate({
      size: ["S"],
      merchantId: faker.random.uuid(),
      recipientId: faker.random.uuid()
    });
    
    const testCrateId = await testCrate.save();
    const testCrateTripId = await testCrate.startTrip({
        originAddress, 
        destinationAddress, 
        trackingNumber: faker.random.uuid()
    });

    await testCrate.pushTelemetry(fakeTelemetryData);
    expect(testCrate.currentTrip.waypoints.length === 1).toBe(true);

    const updatedTestCrate = await testCrateService.getCrateById(testCrateId);
    expect(updatedTestCrate._data.telemetry.location.zip ===  fakeTelemetryData.location.zip).toBe(true);

    const updatedTestCrateTrip  = await testCrateService.getCrateTripById(testCrateTripId);
    expect(updatedTestCrateTrip.waypoints[0].telemetry.location.zip === fakeTelemetryData.location.zip).toBe(true);

});


test("Should return JSON object representation of a Crate", async() => {
    const testCrate = await testCrateService.createCrate({
      size: ["S"]
    });

    await testCrate.save();
    expect(typeof(testCrate.toJSON()) === "object").toBe(true);
});


test("Should return JSON object representation of a CrateTrip", async() => {
      const originAddress = {
        street: faker.address.streetName(),
        apartmentNumber: "7",
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };
    const destinationAddress = {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };
    const testCrate = await testCrateService.createCrate({
      size: ["S"],
      merchantId: faker.random.uuid(),
      recipientId: faker.random.uuid()
    });
    
    await testCrate.save();
    const testCrateTripId = await testCrate.startTrip({
        originAddress, 
        destinationAddress, 
        trackingNumber: faker.random.uuid()
    });
    const [crateTrip] = await testCrateService.getCrateTrips(testCrate);
    
    expect(typeof(crateTrip.toJSON()) === "object").toBe(true);
});


/* Negative Tests */

test("Should NOT be able to add waypoints to a completed CrateTrip", async() => {
      const originAddress = {
        street: faker.address.streetName(),
        apartmentNumber: "7",
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };
    const destinationAddress = {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };
    const fakeTelemetryData = {
        "temp": {
            "degreesFahrenheit": String(faker.random.float())
        },
        "location": {
            "coords": {
                "lat": faker.address.latitude(),
                "long": faker.address.longitude()
            },
            "zip": faker.address.zipCode()
        },
        "sensors": {
            "moisture": {
                "thresholdExceeded": false
            },
            "thermometer": {
                "thresholdExceeded": false
            },
            "photometer": {
                "thresholdExceeded": false
            }
        }
    };
    const testCrate = await testCrateService.createCrate({
      size: ["S"],
      merchantId: faker.random.uuid(),
      recipientId: faker.random.uuid()
    });
    
    await testCrate.save();
    const testCrateTripId = await testCrate.startTrip({
        originAddress, 
        destinationAddress, 
        trackingNumber: faker.random.uuid()
    });
    await testCrate.pushTelemetry(fakeTelemetryData);
    await testCrate.completeTrip();
    await testCrate.pushTelemetry(fakeTelemetryData);

    expect(testCrate.currentTrip.waypoints.length === 1).toBe(true);
});


test("Should throw an error when crateTrip is initialized without a merchantId assigned to the associated crate", async() => {
    const originAddress = {
        street: faker.address.streetName(),
        apartmentNumber: "7",
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };
    const destinationAddress = {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };
    const testCrate = await testCrateService.createCrate({
      size: ["S"]
    });
    await testCrate.save();

    try {
        await testCrate.startTrip({
            originAddress,
            destinationAddress,
            trackingNumber: faker.random.uuid()       
        });   
    } catch(e) {
        expect(e.message).toMatch("CrateError.CannotStartTrip.missingMerchantId");
    }
});

test("Should throw an error when crateTrip is initialized without a recipientId assigned to the associated crate", async() => {
    const originAddress = {
        street: faker.address.streetName(),
        apartmentNumber: "7",
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };
    const destinationAddress = {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };
    const testCrate = await testCrateService.createCrate({
      size: ["S"],
      merchantId: faker.random.uuid()
    });
    await testCrate.save();

    try {
        await testCrate.startTrip({
            originAddress,
            destinationAddress,
            trackingNumber: faker.random.uuid()       
        });   
    } catch(e) {
        expect(e.message).toMatch("CrateError.CannotStartTrip.missingRecipientId");
    }
});


test("Crate trip waypoints should be read-only", async() => {
    const testCrate = await testCrateService.createCrate({
      size: ["S"],
      merchantId: faker.random.uuid(),
      recipientId: faker.random.uuid()
    });
    const originAddress = {
        street: faker.address.streetName(),
        apartmentNumber: "7",
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };
    const destinationAddress = {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode()
    };
    const fakeTelemetryData = {
        "temp": {
            "degreesFahrenheit": String(faker.random.float())
        },
        "location": {
            "coords": {
                "lat": faker.address.latitude(),
                "long": faker.address.longitude()
            },
            "zip": faker.address.zipCode()
        },
        "sensors": {
            "moisture": {
                "thresholdExceeded": false
            },
            "thermometer": {
                "thresholdExceeded": false
            },
            "photometer": {
                "thresholdExceeded": false
            }
        }
    };
    
    await testCrate.save();
    const testCrateTripId = await testCrate.startTrip({
        originAddress, 
        destinationAddress, 
        trackingNumber: faker.random.uuid()
    });
    
    await testCrate.pushTelemetry(fakeTelemetryData);
   
    testCrate["currentTrip"]["waypoints"][0]["timestamp"] = "now";
    expect(testCrate["currentTrip"]["waypoints"][0]["timestamp"] !== "now").toBe(true);

    try {
        testCrate.currentTrip.waypoints.push({});
    } catch(e) {
        expect(e.message).toMatch("Cannot add property");
    }
    
});


test("Crates can ONLY be associated with one recipient", async() => {
    const firstUserId = faker.random.uuid();
    const secondUserId = faker.random.uuid();
    const testCrate = await testCrateService.createCrate({
      size: ["S"],
      merchantId: faker.random.uuid()
    });
    
    await testCrate.save();
    await testCrate.setRecipient(firstUserId);
    
    try {
        await testCrate.setRecipient(secondUserId);
    } catch(e) {
        expect(e.message).toMatch("CrateError.CannotSetRecipient");
        expect(testCrate._data.recipientId === firstUserId).toBe(true);
    }
    
});

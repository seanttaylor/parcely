/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';

const { mockImpl } = require('../../src/lib/utils/mocks');
const uuid = require('uuid');
const Ajv = require('ajv');

const ajv = new Ajv();
const faker = require('faker');
const events = require('events');
const crateSchema = require('../../src/schemas/crate.json');
const { CrateService } = require('../../src/services/crate');
const CrateRepository = require('../../src/lib/repository/crate');
const CrateShipmentRepository = require('../../src/lib/repository/crate-shipment');
const DatabaseConnector = require('../../src/lib/database/connectors/memory');

const testDbConnector = new DatabaseConnector({ console: mockImpl.console });
const ICrateRepository = require('../../src/interfaces/crate-repository');
const ICrateShipmentRepository = require('../../src/interfaces/shipment-repository');

const IStorageBucket = require('../../src/interfaces/storage-bucket');
const {InMemoryStorageBucket} = require('../../src/lib/storage');
const testStorageBucketService = new IStorageBucket(new InMemoryStorageBucket())

const testCrateRepo = new ICrateRepository(new CrateRepository(testDbConnector));
const testCrateShipmentRepo = new ICrateShipmentRepository(new CrateShipmentRepository(testDbConnector));
const testCrateService = new CrateService({
  crateRepo: testCrateRepo,
  crateShipmentRepo: testCrateShipmentRepo,
  eventEmitter: new events.EventEmitter(),
  storageBucketService: testStorageBucketService
});
const starkMerchantId = 'dd8b20dd-1637-4396-bba5-bcd6d65e2d5d';

/** Tests* */
afterAll(() => {
  // testSqlDbConnector.end();
});

describe('CrateManagement', () => {
  test('Should be able to create a new Crate instance', async () => {
    const testCrateData = {
      size: ['M'],
    };
    const testCrate = await testCrateService.createCrate(testCrateData);
    expect(Object.keys(testCrate).includes('id')).toBe(true);
    expect(Object.keys(testCrate).includes('_repo')).toBe(true);
    expect(Object.keys(testCrate).includes('_data')).toBe(true);
  });

  test('Should be able to get a list of existing Crate instances', async () => {
    const result = await testCrateService.getAllCrates();

    expect(Array.isArray(result)).toBe(true);
    expect(Object.keys(result[0]).includes('id')).toBe(true);
    expect(Object.keys(result[0]).includes('_repo')).toBe(true);
    expect(Object.keys(result[0]).includes('_data')).toBe(true);
  });

  test('Should be able to get a specified Crate instance', async () => {
    const testCrateData = {
      size: ['S'],
    };
    const testCrate = await testCrateService.createCrate(testCrateData);
    const testCrateId = await testCrate.save();
    const result = await testCrateService.getCrateById(testCrateId);

    expect(uuid.validate(testCrateId)).toBe(true);
    expect(result.id === testCrateId).toBe(true);
  });

  test('Should be able to delete a crate', async () => {
    const result = await testCrateService.deleteCrate('crateId');
    expect(result == undefined).toBe(true);
  });

  test('Should get the uuid of a Crate instance when it is saved', async () => {
    const testCrateData = {
      size: ['L'],
    };
    const testCrate = await testCrateService.createCrate(testCrateData);
    const testCrateId = await testCrate.save();
    expect(uuid.validate(testCrateId)).toBe(true);
  });

  test('Should be able to set crate status to pendingReturn', async () => {
    const originAddress = {
      street: faker.address.streetName(),
      apartmentNumber: '7',
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const destinationAddress = {
      street: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };

    const fakeTelemetryData = {
      temp: {
        degreesFahrenheit: String(faker.datatype.float()),
      },
      location: {
        coords: {
          lat: Number(faker.address.latitude()),
          lng: Number(faker.address.longitude()),
        },
        zip: faker.address.zipCode(),
      },
      sensors: {
        moisture: {
          thresholdExceeded: false,
        },
        thermometer: {
          thresholdExceeded: false,
        },
        photometer: {
          thresholdExceeded: false,
        },
      },
    };

    const testCrate = await testCrateService.createCrate({
      size: ['S'],
      merchantId: faker.datatype.uuid(),
      recipientId: faker.datatype.uuid(),
    });

    const testCrateId = await testCrate.save();
    const testCrateTripId = await testCrate.startShipment({
      originAddress,
      destinationAddress,
      trackingNumber: faker.datatype.uuid(),
    });

    await testCrate.pushTelemetry(fakeTelemetryData);
    expect(testCrate.currentTrip.waypoints.length === 1).toBe(true);

    await testCrate.completeShipment();
    testCrateService.markCrateReturned(testCrate);
    const [crateStatus] = testCrate._data.status;

    expect(crateStatus === 'pendingReturn').toBe(true);
  });

  test("Should ONLY be able to set crate status to pendingReturn if current crate status is 'delivered'", async () => {
    const originAddress = {
      street: faker.address.streetName(),
      apartmentNumber: '7',
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const destinationAddress = {
      street: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };

    const fakeTelemetryData = {
      temp: {
        degreesFahrenheit: String(faker.datatype.float()),
      },
      location: {
        coords: {
          lat: Number(faker.address.latitude()),
          lng: Number(faker.address.longitude()),
        },
        zip: faker.address.zipCode(),
      },
      sensors: {
        moisture: {
          thresholdExceeded: false,
        },
        thermometer: {
          thresholdExceeded: false,
        },
        photometer: {
          thresholdExceeded: false,
        },
      },
    };

    const testCrate = await testCrateService.createCrate({
      size: ['S'],
      merchantId: faker.datatype.uuid(),
      recipientId: faker.datatype.uuid(),
    });

    const testCrateId = await testCrate.save();
    const testCrateTripId = await testCrate.startShipment({
      originAddress,
      destinationAddress,
      trackingNumber: faker.datatype.uuid(),
    });

    await testCrate.pushTelemetry(fakeTelemetryData);
    expect(testCrate.currentTrip.waypoints.length === 1).toBe(true);

    testCrateService.markCrateReturned(testCrate);
    const [crateStatus] = testCrate._data.status;

    expect(crateStatus === 'inTransit').toBe(true);
  });

  test('Should be able to get current crate telemetry data', async () => {
    const testCrate = await testCrateService.createCrate({
      size: ['S'],
    });

    await testCrate.save();
    const telemetry = await testCrate.getCurrentTelemetry();

    expect(typeof (telemetry) === 'object').toBe(true);
  });

  test('Should be able to associate a specified user with a specified crate', async () => {
    const thorUserId = 'b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09';
    const testCrate = await testCrateService.createCrate({
      size: ['S'],
      merchantId: faker.datatype.uuid(),
    });

    await testCrate.save();
    await testCrate.setRecipient(thorUserId);

    expect(testCrate._data.recipientId === thorUserId).toBe(true);
  });

  test('Should be able to get a list of crates associated with a specified user', async () => {
    const thorUserId = 'b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09';
    const testCrate = await testCrateService.createCrate({
      size: ['S'],
    });

    await testCrate.save();
    await testCrate.setRecipient(thorUserId);

    const crateList = await testCrateService.getCratesByRecipient({
      id: thorUserId,
    });

    expect(Array.isArray(crateList)).toBe(true);
    expect(crateList[0]._data.recipientId === thorUserId).toBe(true);
  });

  test('Should be able to get a list of crates associated with a specified merchant', async () => {
    const testCrate = await testCrateService.createCrate({
      size: ['S'],
      merchantId: starkMerchantId,
    });

    await testCrate.save();

    const crateList = await testCrateService.getCratesByMerchantId(starkMerchantId);

    expect(Array.isArray(crateList)).toBe(true);
  });

  test('Should return JSON object representation of a Crate', async () => {
    const testCrate = await testCrateService.createCrate({
      size: ['S'],
    });

    await testCrate.save();
    expect(typeof (testCrate.toJSON()) === 'object').toBe(true);
  });
});

describe('ShipmentManagement', () => {
  test('Should be able to create a new CrateShipment instance', async () => {
    const testCrateData = {
      size: ['M'],
    };
    const testCrate = await testCrateService.createCrate(testCrateData);
    expect(Object.keys(testCrate).includes('id')).toBe(true);
    expect(Object.keys(testCrate).includes('_repo')).toBe(true);
    expect(Object.keys(testCrate).includes('_data')).toBe(true);
  });

  test('Should be able to get a list of crate shipments for a specified crate', async () => {
    const testCrate = await testCrateService.createCrate({
      size: ['S'],
    });

    await testCrate.save();
    const crateShipmentList = await testCrateService.getCrateShipments(testCrate);

    expect(Array.isArray(crateShipmentList)).toBe(true);
  });

  test('Should be able to get a specified shipment for a specified crate', async () => {
    const testCrateShipmentId = 'd54cc57f-c32c-454a-a295-6481f126eb8b';
    const testCrate = await testCrateService.createCrate({
      size: ['S'],
    });

    await testCrate.save();
    const crateShipment = await testCrateService.getCrateShipmentById(testCrateShipmentId);

    expect(crateShipment.id === testCrateShipmentId).toBe(true);
  });

  test('Should be able to create a new shipment for an existing crate', async () => {
    const originAddress = {
      street: faker.address.streetName(),
      apartmentNumber: '7',
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const destinationAddress = {
      street: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const testCrate = await testCrateService.createCrate({
      size: ['S'],
      merchantId: faker.datatype.uuid(),
      recipientId: faker.datatype.uuid(),
    });

    const testCrateId = await testCrate.save();
    const testCrateShipmentId = await testCrate.startShipment({
      originAddress,
      destinationAddress,
      trackingNumber: faker.datatype.uuid(),
    });
    const [crateShipment] = await testCrateService.getCrateShipments(testCrate);
    const crateDbRecord = await testCrateService.getCrateById(testCrateId);

    expect(crateShipment.id === testCrateShipmentId).toBe(true);
    expect(crateDbRecord._data.status[0] === 'inTransit');
    expect(testCrate._data.status[0] === 'inTransit');
  });

  test('Should be able to push the hardware crate telemetry data to the platform', async () => {
    const testCrate = await testCrateService.createCrate({
      size: ['S'],
      merchantId: faker.datatype.uuid(),
      recipientId: faker.datatype.uuid(),
    });
    const originAddress = {
      street: faker.address.streetName(),
      apartmentNumber: '7',
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const destinationAddress = {
      street: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const fakeTelemetryData = {
      temp: {
        degreesFahrenheit: String(faker.datatype.float()),
      },
      location: {
        coords: {
          lat: Number(faker.address.latitude()),
          lng: Number(faker.address.longitude()),
        },
        zip: faker.address.zipCode(),
      },
      sensors: {
        moisture: {
          thresholdExceeded: false,
        },
        thermometer: {
          thresholdExceeded: false,
        },
        photometer: {
          thresholdExceeded: false,
        },
      },
    };

    await testCrate.save();
    const testCrateTripId = await testCrate.startShipment({
      originAddress,
      destinationAddress,
      trackingNumber: faker.datatype.uuid(),
    });

    await testCrate.pushTelemetry(fakeTelemetryData);
    const updatedTestCrate = await testCrateService.getCrateById(testCrate.id);

    expect(updatedTestCrate._data.telemetry.temp.degreesFahrenheit === fakeTelemetryData.temp.degreesFahrenheit).toBe(true);

    expect(testCrate._data.telemetry.temp.degreesFahrenheit === fakeTelemetryData.temp.degreesFahrenheit).toBe(true);

    expect(testCrate._data.telemetry.location.coords.lat === fakeTelemetryData.location.coords.lat).toBe(true);

    expect(testCrate._data.telemetry.location.coords.lng === fakeTelemetryData.location.coords.lng).toBe(true);

    expect(testCrate._data.telemetry.location.zip === fakeTelemetryData.location.zip).toBe(true);
  });

  test('Pushing crate telemetry should add a waypoint to the associated CrateShipment', async () => {
    const originAddress = {
      street: faker.address.streetName(),
      apartmentNumber: '7',
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const destinationAddress = {
      street: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };

    const fakeTelemetryData = {
      temp: {
        degreesFahrenheit: String(faker.datatype.float()),
      },
      location: {
        coords: {
          lat: Number(faker.address.latitude()),
          lng: Number(faker.address.longitude()),
        },
        zip: faker.address.zipCode(),
      },
      sensors: {
        moisture: {
          thresholdExceeded: false,
        },
        thermometer: {
          thresholdExceeded: false,
        },
        photometer: {
          thresholdExceeded: false,
        },
      },
    };

    const testCrate = await testCrateService.createCrate({
      size: ['S'],
      merchantId: faker.datatype.uuid(),
      recipientId: faker.datatype.uuid(),
    });

    const testCrateId = await testCrate.save();
    const testCrateShipmentId = await testCrate.startShipment({
      originAddress,
      destinationAddress,
      trackingNumber: faker.datatype.uuid(),
    });

    await testCrate.pushTelemetry(fakeTelemetryData);
    expect(testCrate.currentTrip.waypoints.length === 1).toBe(true);

    const updatedTestCrate = await testCrateService.getCrateById(testCrateId);
    expect(updatedTestCrate._data.telemetry.location.zip === fakeTelemetryData.location.zip).toBe(true);

    const updatedTestCrateShipment = await testCrateService.getCrateShipmentById(testCrateShipmentId, { includeWaypoints: true });
    expect(updatedTestCrateShipment.waypoints[0].telemetry.location.zip === fakeTelemetryData.location.zip).toBe(true);
  });

  test('Current shipment data should be available on single Crate entities retrieved from the database', async () => {
    const originAddress = {
      street: faker.address.streetName(),
      apartmentNumber: '7',
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const destinationAddress = {
      street: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };

    const fakeTelemetryData = {
      temp: {
        degreesFahrenheit: String(faker.datatype.float()),
      },
      location: {
        coords: {
          lat: Number(faker.address.latitude()),
          lng: Number(faker.address.longitude()),
        },
        zip: faker.address.zipCode(),
      },
      sensors: {
        moisture: {
          thresholdExceeded: false,
        },
        thermometer: {
          thresholdExceeded: false,
        },
        photometer: {
          thresholdExceeded: false,
        },
      },
    };

    const testCrate = await testCrateService.createCrate({
      size: ['S'],
      merchantId: faker.datatype.uuid(),
      recipientId: faker.datatype.uuid(),
    });

    const testCrateId = await testCrate.save();
    const testCrateTripId = await testCrate.startShipment({
      originAddress,
      destinationAddress,
      trackingNumber: faker.datatype.uuid(),
    });

    await testCrate.pushTelemetry(fakeTelemetryData);
    expect(testCrate.currentTrip.waypoints.length === 1).toBe(true);

    const returnedTestCrate = await testCrateService.getCrateById(testCrateId);
    expect(returnedTestCrate.currentTrip.waypoints.length === 1).toBe(true);
  });

  test('Completing an existing crate shipment should remove the attached recipient and shipment ids', async () => {
    const originAddress = {
      street: faker.address.streetName(),
      apartmentNumber: '7',
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const destinationAddress = {
      street: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };

    const fakeTelemetryData = {
      temp: {
        degreesFahrenheit: String(faker.datatype.float()),
      },
      location: {
        coords: {
          lat: Number(faker.address.latitude()),
          lng: Number(faker.address.longitude()),
        },
        zip: faker.address.zipCode(),
      },
      sensors: {
        moisture: {
          thresholdExceeded: false,
        },
        thermometer: {
          thresholdExceeded: false,
        },
        photometer: {
          thresholdExceeded: false,
        },
      },
    };

    const testCrate = await testCrateService.createCrate({
      size: ['S'],
      merchantId: faker.datatype.uuid(),
      recipientId: faker.datatype.uuid(),
    });

    const testCrateId = await testCrate.save();
    const testCrateShipmentId = await testCrate.startShipment({
      originAddress,
      destinationAddress,
      trackingNumber: faker.datatype.uuid(),
    });

    await testCrate.pushTelemetry(fakeTelemetryData);
    expect(testCrate.currentTrip.waypoints.length === 1).toBe(true);

    await testCrate.completeShipment();
    expect(testCrate._data.recipientId === null).toBe(true);
    expect(testCrate._data.shipmentId === null).toBe(true);

    const returnedCrate = await testCrateService.getCrateById(testCrateId);
    expect(returnedCrate._data.recipientId === null).toBe(true);
    expect(returnedCrate._data.shipmentId === null).toBe(true);
  });

  test("Should NOT be able to add waypoints to a CrateShipment with a 'completed' status", async () => {
    const originAddress = {
      street: faker.address.streetName(),
      apartmentNumber: '7',
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const destinationAddress = {
      street: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const fakeTelemetryData = {
      temp: {
        degreesFahrenheit: String(faker.datatype.float()),
      },
      location: {
        coords: {
          lat: Number(faker.address.latitude()),
          lng: Number(faker.address.longitude()),
        },
        zip: faker.address.zipCode(),
      },
      sensors: {
        moisture: {
          thresholdExceeded: false,
        },
        thermometer: {
          thresholdExceeded: false,
        },
        photometer: {
          thresholdExceeded: false,
        },
      },
    };
    const testCrate = await testCrateService.createCrate({
      size: ['S'],
      merchantId: faker.datatype.uuid(),
      recipientId: faker.datatype.uuid(),
    });

    await testCrate.save();
    const testCrateShipmentId = await testCrate.startShipment({
      originAddress,
      destinationAddress,
      trackingNumber: faker.datatype.uuid(),
    });
    await testCrate.pushTelemetry(fakeTelemetryData);
    await testCrate.completeShipment();
    await testCrate.pushTelemetry(fakeTelemetryData);

    const testCrateShipment = await testCrateService.getCrateShipmentById(testCrateShipmentId, { includeWaypoints: true });

    await testCrateShipment.addWaypoint({
      timestamp: new Date().toISOString(),
      telemetry: fakeTelemetryData,
    });

    expect(testCrateShipment.waypoints.length === 1).toBe(true);
    expect(testCrate.currentTrip.waypoints.length === 1).toBe(true);
  });

  test('Should throw an error when CrateShipment is initialized without a merchantId assigned to the associated crate', async () => {
    const originAddress = {
      street: faker.address.streetName(),
      apartmentNumber: '7',
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const destinationAddress = {
      street: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const testCrate = await testCrateService.createCrate({
      size: ['S'],
    });
    await testCrate.save();

    try {
      await testCrate.startShipment({
        originAddress,
        destinationAddress,
        trackingNumber: faker.datatype.uuid(),
      });
    } catch (e) {
      expect(e.message).toMatch('CrateError.CannotStartShipment.missingMerchantId');
    }
  });

  test('Should throw an error when CrateShipment is initialized without a recipientId assigned to the associated Crate', async () => {
    const originAddress = {
      street: faker.address.streetName(),
      apartmentNumber: '7',
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const destinationAddress = {
      street: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const testCrate = await testCrateService.createCrate({
      size: ['S'],
      merchantId: faker.datatype.uuid(),
    });
    await testCrate.save();

    try {
      await testCrate.startShipment({
        originAddress,
        destinationAddress,
        trackingNumber: faker.datatype.uuid(),
      });
    } catch (e) {
      expect(e.message).toMatch('CrateError.CannotStartShipment.missingRecipientId');
    }
  });

  test('CrateShipment waypoints should be read-only', async () => {
    const testCrate = await testCrateService.createCrate({
      size: ['S'],
      merchantId: faker.datatype.uuid(),
      recipientId: faker.datatype.uuid(),
    });
    const originAddress = {
      street: faker.address.streetName(),
      apartmentNumber: '7',
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const destinationAddress = {
      street: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const fakeTelemetryData = {
      temp: {
        degreesFahrenheit: String(faker.datatype.float()),
      },
      location: {
        coords: {
          lat: Number(faker.address.latitude()),
          lng: Number(faker.address.longitude()),
        },
        zip: faker.address.zipCode(),
      },
      sensors: {
        moisture: {
          thresholdExceeded: false,
        },
        thermometer: {
          thresholdExceeded: false,
        },
        photometer: {
          thresholdExceeded: false,
        },
      },
    };

    await testCrate.save();
    const testCrateTripId = await testCrate.startShipment({
      originAddress,
      destinationAddress,
      trackingNumber: faker.datatype.uuid(),
    });

    await testCrate.pushTelemetry(fakeTelemetryData);

    testCrate.currentTrip.waypoints[0].timestamp = 'now';

    expect(testCrate.currentTrip.waypoints[0].timestamp !== 'now').toBe(true);

    try {
      testCrate.currentTrip.waypoints.push({});
    } catch (e) {
      expect(e.message).toMatch('Cannot add property');
    }
  });

  test('Should ONLY be able to associate (1) recipient with (1) crate on a single shipment.', async () => {
    const firstUserId = faker.datatype.uuid();
    const secondUserId = faker.datatype.uuid();
    const testCrate = await testCrateService.createCrate({
      size: ['S'],
      merchantId: faker.datatype.uuid(),
    });

    await testCrate.save();
    await testCrate.setRecipient(firstUserId);

    try {
      await testCrate.setRecipient(secondUserId);
    } catch (e) {
      expect(e.message).toMatch('CrateError.CannotSetRecipient');
      expect(testCrate._data.recipientId === firstUserId).toBe(true);
    }
  });

  test('Should return JSON object representation of a CrateShipment', async () => {
    const originAddress = {
      street: faker.address.streetName(),
      apartmentNumber: '7',
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const destinationAddress = {
      street: faker.address.streetName(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const testCrate = await testCrateService.createCrate({
      size: ['S'],
      merchantId: faker.datatype.uuid(),
      recipientId: faker.datatype.uuid(),
    });

    await testCrate.save();
    const testCrateShipmentId = await testCrate.startShipment({
      originAddress,
      destinationAddress,
      trackingNumber: faker.datatype.uuid(),
    });
    const [crateShipmentNoWaypoints] = await testCrateService.getCrateShipments(testCrate);

    expect(typeof (crateShipmentNoWaypoints.toJSON()) === 'object').toBe(true);
    expect(crateShipmentNoWaypoints.toJSON().data.waypoints.length === 0).toBe(true);
    expect(crateShipmentNoWaypoints.toJSON().data.waypointsIncluded === false).toBe(true);

    const [crateShipmentWithWaypoints] = await testCrateService.getCrateShipments(testCrate, { includeWaypoints: true });

    expect(typeof (crateShipmentWithWaypoints.toJSON()) === 'object').toBe(true);

    expect(crateShipmentWithWaypoints.toJSON().data.waypoints.length === 0).toBe(true);
    expect(crateShipmentWithWaypoints.toJSON().data.waypointsIncluded).toBe(true);
  });
});

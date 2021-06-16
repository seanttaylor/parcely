/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';

const { mockImpl } = require('../../src/lib/utils/mocks');
const Ajv = require('ajv');
const events = require('events');
const ajv = new Ajv();
const faker = require('faker');
const { MerchantService } = require('../../src/services/merchant');
const DatabaseConnector = require('../../src/lib/database/connectors/memory');
const { CrateService } = require('../../src/services/crate');
const CrateRepository = require('../../src/lib/repository/crate');
const CrateShipmentRepository = require('../../src/lib/repository/crate-shipment');
const ICrateRepository = require('../../src/interfaces/crate-repository');
const ICrateShipmentRepository = require('../../src/interfaces/shipment-repository');
const IMerchantRepository = require('../../src/interfaces/merchant-repository');
const MerchantRepository = require('../../src/lib/repository/merchant');
const IStorageBucket = require('../../src/interfaces/storage-bucket');
const {InMemoryStorageBucket} = require('../../src/lib/storage');

const testStorageBucketService = new IStorageBucket(new InMemoryStorageBucket())

const testDbConnector = new DatabaseConnector({ console: mockImpl.console });

const testCrateRepo = new ICrateRepository(new CrateRepository(testDbConnector));
const testCrateShipmentRepo = new ICrateShipmentRepository(new CrateShipmentRepository(testDbConnector));

const testCrateService = new CrateService({
  crateRepo: testCrateRepo,
  crateShipmentRepo: testCrateShipmentRepo,
  eventEmitter: new events.EventEmitter(),
  storageBucketService: testStorageBucketService
});

const testMerchantRepo = new IMerchantRepository(new MerchantRepository(testDbConnector));
const fakeUserService = {
  userExists() {
    return true;
  },
};
const testMerchantService = new MerchantService({
  repo: testMerchantRepo, 
  userService: fakeUserService, 
  crateService: testCrateService
});
const defaultPlan = {
  planType: ['smallBusiness'],
  startDate: '01/01/2021',
  expiryDate: '01/01/2022',
  status: [
    'active',
  ],
  autoRenew: true,
};
const starkUserId = 'e98417a8-d912-44e0-8d37-abe712ca840f';

afterAll(() => {

});

describe('MerchantManagement', () => {
  test('Should be able to create a new Merchant instance', async () => {
    const testMerchantData = {
      name: faker.company.companyName(),
      userId: faker.datatype.uuid(),
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };
    const testMerchant = await testMerchantService.createMerchant(testMerchantData);

    expect(Object.keys(testMerchant).includes('id')).toBe(true);
    expect(Object.keys(testMerchant).includes('_repo')).toBe(true);
    expect(Object.keys(testMerchant).includes('_data')).toBe(true);
  });

  test('Should NOT be able to create a new Merchant instance for non-existing user', async () => {
    const anotherTestMerchantService = new MerchantService({
      repo: testMerchantRepo,
      userService: { 
        userExists() {
          return false;
        },
      }
    });
    const testMerchantData = {
      name: faker.company.companyName(),
      userId: faker.datatype.uuid(),
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };

    try {
      const testMerchant = await anotherTestMerchantService.createMerchant(testMerchantData);
    } catch (e) {
      expect(e.message).toMatch('MerchantServiceError.CannotCreateMerchant.BadRequest.UserDoesNotExist');
    }
  });

  test('Should NOT be able to create a new Merchant instance for user that is already a merchant', async () => {
    const uuid = faker.datatype.uuid();
    const testMerchantData = {
      name: faker.company.companyName(),
      userId: uuid,
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };
    const testMerchantDataNo2 = {
      name: faker.company.companyName(),
      userId: uuid,
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };

    const testMerchant = await testMerchantService.createMerchant(testMerchantData);

    await testMerchant.save();

    try {
      const testMerchantNo2 = await testMerchantService.createMerchant(testMerchantDataNo2);
    } catch (e) {
      expect(e.message).toMatch('MerchantServiceError.CannotCreateMerchant.BadRequest.UserIsAlreadyMerchant');
    }
  });

  test('Should be able to find a merchant by id', async () => {
    const testMerchantData = {
      name: faker.company.companyName(),
      userId: faker.datatype.uuid(),
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };
    const testMerchant = await testMerchantService.createMerchant(testMerchantData);

    await testMerchant.save();

    const testMerchantId = testMerchant.id;

    const record = await testMerchantService.getMerchantById(testMerchantId);

    const fakeRecord = await testMerchantService.getMerchantById(faker.datatype.uuid());

    expect(record.id === testMerchantId).toBe(true);
    expect(fakeRecord === undefined).toBe(true);
  });

  test('Should be able to update an existing plan for a merchant', async () => {
    const testMerchantData = {
      name: faker.company.companyName(),
      userId: faker.datatype.uuid(),
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };
    const testMerchant = await testMerchantService.createMerchant(testMerchantData);

    await testMerchant.save();

    const testMerchantId = testMerchant.id;

    await testMerchant.updatePlan({
      planType: ['enterprise'],
      status: ['suspended'],
    });

    expect(testMerchant._data.plan.planType[0] === 'enterprise').toBe(true);
    expect(testMerchant._data.plan.status[0] === 'suspended').toBe(true);

    const record = await testMerchantService.getMerchantById(testMerchantId);

    expect(record._data.plan.planType[0] === 'enterprise').toBe(true);
    expect(record._data.plan.status[0] === 'suspended').toBe(true);
  });

  test('Should be able to cancel an existing plan for a merchant', async () => {
    const testMerchantData = {
      name: faker.company.companyName(),
      userId: faker.datatype.uuid(),
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };
    const testMerchant = await testMerchantService.createMerchant(testMerchantData);

    await testMerchant.save();

    const testMerchantId = testMerchant.id;

    await testMerchant.cancelPlan();

    expect(testMerchant._data.plan.status[0] === 'cancelled').toBe(true);

    const record = await testMerchantService.getMerchantById(testMerchantId);

    expect(record._data.plan.status[0] === 'cancelled').toBe(true);
  });

  test('Should be able to archive an existing merchant', async () => {
    const testMerchantData = {
      name: faker.company.companyName(),
      userId: faker.datatype.uuid(),
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };
    const testMerchant = await testMerchantService.createMerchant(testMerchantData);

    await testMerchant.save();

    const testMerchantId = testMerchant.id;

    await testMerchantService.archiveMerchant(testMerchant);

    expect(testMerchant._data.status[0] === 'archived').toBe(true);

    const record = await testMerchantService.getMerchantById(testMerchantId);

    expect(record._data.status[0] === 'archived').toBe(true);
  });

  test('Should be able to find all shipments associated with a specified merchant', async () => {
    const testMerchantData = {
      name: faker.company.companyName(),
      userId: faker.datatype.uuid(),
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };
    const testMerchant = await testMerchantService.createMerchant(testMerchantData);
 
    await testMerchant.save();

    const testMerchantId = testMerchant.id;

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
        merchantId: testMerchantId
      });
      

      await testCrate.save();
      await testCrate.setRecipient(faker.internet.email());
      await testCrate.startShipment({
        originAddress,
        destinationAddress,
        trackingNumber: faker.datatype.uuid(),
      });
  
      await testCrate.pushTelemetry(fakeTelemetryData);

    const shipmentList = await testMerchantService.getShipmentsByMerchantId({merchantId: testMerchantId});


    expect(Array.isArray(shipmentList)).toBe(true);
    expect(shipmentList[0]['_data']['merchantId'] === testMerchantId).toBe(true);
  });

  test('Should be able to find all shipments associated with a specified merchant with shipment waypoints in a digest format', async () => {
    const testMerchantData = {
      name: faker.company.companyName(),
      userId: faker.datatype.uuid(),
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };
    const testMerchant = await testMerchantService.createMerchant(testMerchantData);
 
    await testMerchant.save();

    const testMerchantId = testMerchant.id;

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
        merchantId: testMerchantId
      });
      

      await testCrate.save();
      await testCrate.setRecipient(faker.internet.email());
      await testCrate.startShipment({
        originAddress,
        destinationAddress,
        trackingNumber: faker.datatype.uuid(),
      });
  
      await testCrate.pushTelemetry(fakeTelemetryData);

    const shipmentList = await testMerchantService.getShipmentsByMerchantId({merchantId: testMerchantId, asDigest: true});

    expect(Array.isArray(shipmentList)).toBe(true);
    expect(shipmentList[0]['waypoints'][0]['timestamp']).toBeTruthy();
    expect(shipmentList[0]['_data']['merchantId'] === testMerchantId).toBe(true);
  });

  test('Should NOT be able to update existing merchants who have been archived', async () => {
    const testMerchantData = {
      name: faker.company.companyName(),
      userId: faker.datatype.uuid(),
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    };
    const testMerchant = await testMerchantService.createMerchant(testMerchantData);

    await testMerchant.save();

    const testMerchantId = testMerchant.id;

    await testMerchantService.archiveMerchant(testMerchant);

    expect(testMerchant._data.status[0] === 'archived').toBe(true);

    await testMerchant.updatePlan({
      planType: ['enterprise'],
      status: ['suspended'],
    });

    expect(testMerchant._data.plan.planType[0] === 'smallBusiness').toBe(true);
  });
});

describe('ObjectRepresentation', () => {
  test('Should return JSON object representation of a Merchant', async () => {
    const testMerchant = await testMerchantService.createMerchant({
      name: faker.company.companyName(),
      userId: faker.datatype.uuid(),
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      emailAddress: faker.internet.email(),
      phoneNumber: faker.phone.phoneNumber(),
      plan: defaultPlan,
    });

    await testMerchant.save();
    expect(typeof (testMerchant.toJSON()) === 'object').toBe(true);
  });
});

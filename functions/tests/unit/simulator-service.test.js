/* eslint-disable */ 

/** ******************************************* */
// ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/** ******************************************* */
process.env.NODE_ENV = 'ci/cd/test';

const { mockImpl } = require('../../src/lib/utils/mocks');
const events = require('events');
const eventEmitter = new events.EventEmitter();
const faker = require('faker');
const { MerchantService } = require('../../src/services/merchant');
const { UserService } = require('../../src/services/user');
const { CrateService } = require('../../src/services/crate');
const DatabaseConnector = require('../../src/lib/database/connectors/memory');
const testDbConnector = new DatabaseConnector({ console: mockImpl.console });
const IMerchantRepository = require('../../src/interfaces/merchant-repository');
const IUserRepository = require('../../src/interfaces/user-repository');
const ICrateRepository = require('../../src/interfaces/crate-repository');
const ICrateShipmentRepository = require('../../src/interfaces/shipment-repository');
const IQueue = require('../../src/interfaces/queue');
const UserRepository = require('../../src/lib/repository/user');
const MerchantRepository = require('../../src/lib/repository/merchant');
const CrateRepository = require('../../src/lib/repository/crate');
const CrateShipmentRepository = require('../../src/lib/repository/crate-shipment');
const { InMemoryQueue } = require('../../src/lib/queue');
const testQueueService = new IQueue(new InMemoryQueue());
const { ShipmentSimulatorService } = require('../../src/services/simulator');
const testUserRepo = new IUserRepository(new UserRepository(testDbConnector));
const testCrateRepo = new ICrateRepository(new CrateRepository(testDbConnector));
const testCrateShipmentRepo = new ICrateShipmentRepository(new CrateShipmentRepository(testDbConnector));
const testMerchantRepo = new IMerchantRepository(new MerchantRepository(testDbConnector));
const testCrateService = new CrateService({
    crateRepo: testCrateRepo,
    crateShipmentRepo: testCrateShipmentRepo,
    queueService: testQueueService,
    eventEmitter
});
const testUserService = new UserService(testUserRepo);
const testMerchantService = new MerchantService(testMerchantRepo, testUserService);
const testSimulationService = new ShipmentSimulatorService({
    userService: testUserService,
    merchantService: testMerchantService,
    crateService: testCrateService
});

describe('ShipmentSimulation', () => {
    test("Simulator should create a specifed number of crates", async() => {
        await testSimulationService.init({instanceCount: 5});
        expect(testSimulationService.getCrates().length === 5).toBe(true);
        
        testSimulationService.end();
    });

    test("Simulator should create a merchant associated with created crate", async() => {
        const simulation = await testSimulationService.init({instanceCount: 5});
        const merchantId = testSimulationService.getCurrentMerchantId();
        const crateList = testSimulationService.getCrates();

        expect(crateList.length === 5).toBe(true);
 
        const allCratesAssociatedWithCurrentMerchant = crateList.every((c) => {
            return c._data.merchantId === merchantId;
        });

        expect(allCratesAssociatedWithCurrentMerchant).toBe(true);
        testSimulationService.end();
    });

    test("Simulator should set a recipient for each created crate", async() => {
        await testSimulationService.init({instanceCount: 5});
        const crateList = testSimulationService.getCrates();
        const allCratesHaveRecipientsAttached = crateList.every((c) => {
            return c._data.recipientId;
        });

        expect(allCratesHaveRecipientsAttached).toBe(true);
        testSimulationService.end();
    });

    test("Simulator should assign a route for each crate", async() => {
        await testSimulationService.init({instanceCount: 5});
        await testSimulationService.start();
        const crateList = testSimulationService.getCrates();
        const crateRouteMap = testSimulationService.getCrateRouteMap();
        const allCratesHaveRouteAssigned = crateList.every((c) => {
            return crateRouteMap[c.id];
        });

        expect(allCratesHaveRouteAssigned).toBe(true);
        
        testSimulationService.end();
    });

    test("Simulator should start a shipment for each crate", async() => {
        await testSimulationService.init({instanceCount: 5});
        await testSimulationService.start();
        const crateList = testSimulationService.getCrates();
        const allCratesHaveShipmentInProgress = crateList.every((c) => {
            return c._data.status[0] === "inTransit" && c.currentTrip._data.status[0] === "inProgress"
        });

        expect(allCratesHaveShipmentInProgress).toBe(true);
        
        testSimulationService.end();
    });

    test("Simulator should push telemetry updates to each crate", async(done) => {
        await testSimulationService.init({instanceCount: 5});
        await testSimulationService.start();
        
        setTimeout(()=> {
            const crateList = testSimulationService.getCrates();
            const allCrateShipmentsHaveMinWaypointLength = crateList.every((c) => {
                return c.currentTrip.waypoints.length > 0;
            });

            expect(allCrateShipmentsHaveMinWaypointLength).toBe(true);
            
            testSimulationService.end();
            done();
        }, 5000);
        
    },10000);
});

const { mockImpl } = require("../../src/lib/utils/mocks");
const uuid = require("uuid");
const Ajv = require("ajv");
const ajv = new Ajv();
const faker = require("faker");
const crateSchema = require("../../src/schemas/crate.json");
const { MerchantService } = require("../../src/services/merchant");
const { UserService } = require("../../src/services/user");
const DatabaseConnector = require("../../src/lib/database/connectors/memory");
const testDbConnector = new DatabaseConnector({console: mockImpl.console});
const IMerchantRepository = require("../../src/interfaces/merchant-repository");
const IUserRepository = require("../../src/interfaces/user-repository");
const UserRepository = require("../../src/lib/repository/user");
const MerchantRepository = require("../../src/lib/repository/merchant");
const testUserRepo = new IUserRepository(new UserRepository(testDbConnector));
const testMerchantRepo = new IMerchantRepository(new MerchantRepository(testDbConnector));
const fakeUserService = {
    userExists() {
        return true;
    }
};
const testMerchantService = new MerchantService(testMerchantRepo, fakeUserService);
const defaultPlan = {
    planType: ["smallBusiness"],
    startDate: "01/01/2021",
    expiryDate: "01/01/2022",
    status: [
        "active"
    ],
    autoRenew: true
};
const starkUserId = "e98417a8-d912-44e0-8d37-abe712ca840f";

afterAll(()=> {

});

describe("MerchantManagement", function MerchantManagement() {
    test("Should be able to create a new Merchant instance", async() => {
        const testMerchantData = {
            name: faker.company.companyName(),
            userId: faker.random.uuid(),
            address: {
                street: faker.address.streetName(),
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            emailAddress: faker.internet.email(),
            phoneNumber: faker.phone.phoneNumber(),
            plan: defaultPlan
        };
        const testMerchant = await testMerchantService.createMerchant(testMerchantData);

        expect(Object.keys(testMerchant).includes("id")).toBe(true);
        expect(Object.keys(testMerchant).includes("_repo")).toBe(true);
        expect(Object.keys(testMerchant).includes("_data")).toBe(true);    
    });


    test("Should NOT be able to create a new Merchant instance for non-existing user", async() => {
        const anotherTestMerchantService = new MerchantService(testMerchantRepo, {
            userExists() {
                return false;
            }
        });
        const testMerchantData = {
            name: faker.company.companyName(),
            userId: faker.random.uuid(),
            address: {
                street: faker.address.streetName(),
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            emailAddress: faker.internet.email(),
            phoneNumber: faker.phone.phoneNumber(),
            plan: defaultPlan
        };

        try {
            const testMerchant = await anotherTestMerchantService.createMerchant(testMerchantData);
        } catch(e) {
            expect(e.message).toMatch("MerchantServiceError.CannotCreateMerchant.BadRequest.UserDoesNotExist");
        } 
    });


    test("Should NOT be able to create a new Merchant instance for user that is already a merchant", async() => {
        const uuid = faker.random.uuid();
        const testMerchantData = {
            name: faker.company.companyName(),
            userId: uuid,
            address: {
                street: faker.address.streetName(),
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            emailAddress: faker.internet.email(),
            phoneNumber: faker.phone.phoneNumber(),
            plan: defaultPlan
        };
        const testMerchantDataNo2 = {
            name: faker.company.companyName(),
            userId: uuid,
            address: {
                street: faker.address.streetName(),
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            emailAddress: faker.internet.email(),
            phoneNumber: faker.phone.phoneNumber(),
            plan: defaultPlan
        };

        const testMerchant = await testMerchantService.createMerchant(testMerchantData);

        await testMerchant.save();

        try {
            const testMerchantNo2 = await testMerchantService.createMerchant(testMerchantDataNo2);
        } catch(e) {
            expect(e.message).toMatch("MerchantServiceError.CannotCreateMerchant.BadRequest.UserIsAlreadyMerchant");
        } 
    });


    test("Should be able to find a merchant by id", async() => {
        const testMerchantData = {
            name: faker.company.companyName(),
            userId: faker.random.uuid(),
            address: {
                street: faker.address.streetName(),
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            emailAddress: faker.internet.email(),
            phoneNumber: faker.phone.phoneNumber(),
            plan: defaultPlan
        };
        const testMerchant = await testMerchantService.createMerchant(testMerchantData);

        await testMerchant.save();

        const testMerchantId = testMerchant.id;

        const record = await testMerchantService.getMerchantById(testMerchantId);

        const fakeRecord = await testMerchantService.getMerchantById(faker.random.uuid());
        
        expect(record.id === testMerchantId).toBe(true);
        expect(fakeRecord === undefined).toBe(true);
    });


    test("Should be able to update an existing plan for a merchant", async() => {
        const testMerchantData = {
            name: faker.company.companyName(),
            userId: faker.random.uuid(),
            address: {
                street: faker.address.streetName(),
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            emailAddress: faker.internet.email(),
            phoneNumber: faker.phone.phoneNumber(),
            plan: defaultPlan
        };
        const testMerchant = await testMerchantService.createMerchant(testMerchantData);

        await testMerchant.save();

        const testMerchantId = testMerchant.id;

        await testMerchant.updatePlan({
            planType: ["enterprise"],
            status: ["suspended"]
        }); 
        
        expect(testMerchant._data.plan.planType[0] === "enterprise").toBe(true);
        expect(testMerchant._data.plan.status[0] === "suspended").toBe(true);


        const record = await testMerchantService.getMerchantById(testMerchantId);

        expect(record._data.plan.planType[0] === "enterprise").toBe(true);
        expect(record._data.plan.status[0] === "suspended").toBe(true);
    });


    test("Should be able to cancel an existing plan for a merchant", async() => {
        const testMerchantData = {
            name: faker.company.companyName(),
            userId: faker.random.uuid(),
            address: {
                street: faker.address.streetName(),
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            emailAddress: faker.internet.email(),
            phoneNumber: faker.phone.phoneNumber(),
            plan: defaultPlan
        };
        const testMerchant = await testMerchantService.createMerchant(testMerchantData);

        await testMerchant.save();

        const testMerchantId = testMerchant.id;

        await testMerchant.cancelPlan(); 
        
        expect(testMerchant._data.plan.status[0] === "cancelled").toBe(true);

        const record = await testMerchantService.getMerchantById(testMerchantId);

        expect(record._data.plan.status[0] === "cancelled").toBe(true);
    });


    test("Should be able to archive an existing merchant", async() => {
        const testMerchantData = {
            name: faker.company.companyName(),
            userId: faker.random.uuid(),
            address: {
                street: faker.address.streetName(),
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            emailAddress: faker.internet.email(),
            phoneNumber: faker.phone.phoneNumber(),
            plan: defaultPlan
        };
        const testMerchant = await testMerchantService.createMerchant(testMerchantData);

        await testMerchant.save();

        const testMerchantId = testMerchant.id;

        await testMerchantService.archiveMerchant(testMerchant);

        expect(testMerchant._data.status[0] === "archived").toBe(true);

        const record = await testMerchantService.getMerchantById(testMerchantId);

        expect(record._data.status[0] === "archived").toBe(true);
    });


    test("Should NOT be able to update existing merchants who have been archived", async() => {
        const testMerchantData = {
            name: faker.company.companyName(),
            userId: faker.random.uuid(),
            address: {
                street: faker.address.streetName(),
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            emailAddress: faker.internet.email(),
            phoneNumber: faker.phone.phoneNumber(),
            plan: defaultPlan
        };
        const testMerchant = await testMerchantService.createMerchant(testMerchantData);

        await testMerchant.save();

        const testMerchantId = testMerchant.id;

        await testMerchantService.archiveMerchant(testMerchant);

        expect(testMerchant._data.status[0] === "archived").toBe(true);

        await testMerchant.updatePlan({
            planType: ["enterprise"],
            status: ["suspended"]
        });

        expect(testMerchant._data.plan.planType[0] === "smallBusiness").toBe(true);
    });
});

describe("ObjectRepresentation", function ObjectRepresentation() {
    test("Should return JSON object representation of a Merchant", async() => {
        const testMerchant = await testMerchantService.createMerchant({
            name: faker.company.companyName(),
            userId: faker.random.uuid(),
            address: {
                street: faker.address.streetName(),
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            emailAddress: faker.internet.email(),
            phoneNumber: faker.phone.phoneNumber(),
            plan: defaultPlan
        });

        await testMerchant.save();
        expect(typeof(testMerchant.toJSON()) === "object").toBe(true);
    });
});
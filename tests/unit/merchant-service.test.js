const { mockImpl } = require("../../src/lib/utils/mocks");
const uuid = require("uuid");
const Ajv = require("ajv");
const ajv = new Ajv();
const faker = require("faker");
const crateSchema = require("../../src/schemas/crate.json");
const { MerchantService } = require("../../src/services/merchant");
const MerchantRepository = require("../../src/lib/repository/merchant");
const DatabaseConnector = require("../../src/lib/database/connectors/memory");
const testDbConnector = new DatabaseConnector({console: mockImpl.console});
const IMerchantRepository = require("../../src/interfaces/merchant-repository");
const testMerchantRepo = new IMerchantRepository(new MerchantRepository(testDbConnector));
const testMerchantService = new MerchantService(testMerchantRepo);
const defaultPlan = {
    name: ["smallBusiness"],
    startDate: "01/01/2021",
    expiryDate: "01/01/2022",
    status: [
        "active"
    ],
    autoRenew: true
};
const starkUserId = "e98417a8-d912-44e0-8d37-abe712ca840f";

/**Tests**/
afterAll(()=> {
    //testSqlDbConnector.end();
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
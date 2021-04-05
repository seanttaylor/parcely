/**********************************************/
//ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/**********************************************/
process.env.NODE_ENV = "ci/cd/test";

const app = require("../../index");
const supertest = require("supertest");
const request = supertest(app);
const faker = require("faker");
const starkUserId = "e98417a8-d912-44e0-8d37-abe712ca840f";
const starkEmailAddress = "tstark@avengers.io";
const furyUserId = "5298b9ab-9493-4fee-bf7e-805e47bb5d42";
const furyEmailAddress = "nfury@shield.gov";
const thorUserId = "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09";
const thorEmailAddress = "thor@avengers.io";
const superSecretPassword = "superSecretPassword";

describe("CrateAccess", function CrateAccess() {

    describe("UserAccess", function Users() {
        test("Platform users should be able to get a list of shipments associated with a user account", async() => {
            const res1 = await request.post(`/api/v1/users/token`)
            .send({
                emailAddress: thorEmailAddress,
                password: superSecretPassword
            })
            .expect(200);

            const thorAccessToken = res1.body.accessToken;

            const res2 = await request.get(`/api/v1/users/${thorUserId}/shipments`)
            .set("authorization", `Bearer ${thorAccessToken}`)
            .send()
            .expect(200);
            
            expect(Array.isArray(res2.body.entries)).toBe(true);
            expect(res2.body.count === 1).toBe(true);
        });

        test("Platform users should be able to get a filtered list of shipments associated with a user account based on trip status", async() => {
        const res1 = await request.post(`/api/v1/users/token`)
        .send({
            emailAddress: thorEmailAddress,
            password: superSecretPassword
        })
        .expect(200);

        const thorAccessToken = res1.body.accessToken;

        const res2 = await request.get(`/api/v1/users/${thorUserId}/shipments?status=inProgress`)
        .set("authorization", `Bearer ${thorAccessToken}`)
        .send()
        .expect(200);

        expect(Array.isArray(res2.body.entries)).toBe(true);
        expect(res2.body.count === 0).toBe(true);
    
        });

        test("Platform users should be able to find geolocation data for all crates associated with their own account", async() => {
        const res1 = await request.post(`/api/v1/users/token`)
        .send({
            emailAddress: thorEmailAddress,
            password: superSecretPassword
        })
        .expect(200);

        const thorAccessToken = res1.body.accessToken;

        const res2 = await request.get(`/api/v1/users/${thorUserId}/crates`)
        .set("authorization", `Bearer ${thorAccessToken}`)
        .send()
        .expect(200);

        expect(Array.isArray(res2.body.entries)).toBe(true);
        expect(res2.body.count === 1).toBe(true);
        expect(res2["body"]["entries"][0]["data"]["recipientId"] === thorUserId).toBe(true);

        expect(Object.keys(res2["body"]["entries"][0]["data"]).includes("telemetry")).toBe(true);
        });

        test("Platform users should be able to get a summarized list of real-time telemetry data points for a specified crate shipment", async() => {
            const res1 = await request.post(`/api/v1/users/token`)
            .send({
                emailAddress: furyEmailAddress,
                password: superSecretPassword
            })
            .expect(200);

            const res2 = await request.post(`/api/v1/users/token`)
            .send({
                emailAddress: thorEmailAddress,
                password: superSecretPassword
            })
            .expect(200);

            const furyAccessToken = res1.body.accessToken;
            const thorAccessToken = res2.body.accessToken;

            const res3 = await request.post(`/api/v1/crates`)
            .set("authorization", `Bearer ${furyAccessToken}`)
            .send({
                size: ["L"],
                merchantId: faker.random.uuid()
            })
            .expect(201);

            const crateId = res3["body"]["entries"][0]["id"];

            const res4 = await request.put(`/api/v1/crates/${crateId}/recipient`)
            .set("authorization", `Bearer ${furyAccessToken}`)
            .send({
                recipientId: thorUserId
            })
            .expect(204);

            const res5 = await request.post(`/api/v1/crates/${crateId}/shipments`)
            .set("authorization", `Bearer ${furyAccessToken}`)
            .send({ 
                originAddress: {
                    street: faker.address.streetName(),
                    apartmentNumber: "7",
                    city: faker.address.city(),
                    state: faker.address.stateAbbr(),
                    zip: faker.address.zipCode()
                },
                destinationAddress: {
                    street: faker.address.streetName(),
                    apartmentNumber: "7",
                    city: faker.address.city(),
                    state: faker.address.stateAbbr(),
                    zip: faker.address.zipCode()
                },
                trackingNumber: faker.random.uuid()
            }).expect(201);

            //STILL need to add a waypoint via API endpoint here
            const shipmentId = res5["body"]["entries"][0]["data"]["tripId"];

            const res6 = await request.post(`/api/v1/crates/${crateId}/shipments/${shipmentId}/waypoints`)
            .set("authorization", `Bearer ${furyAccessToken}`)
            .send({
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
            })
            .expect(201);

            const res7 = await request.get(`/api/v1/crates/${crateId}/shipments/${shipmentId}`)
            .set("authorization", `Bearer ${thorAccessToken}`)
            .send()

            expect(Array.isArray(res7["body"]["entries"])).toBe(true);
            expect(res7["body"]["entries"]["length"] === 1).toBe(true);
            expect(res7["body"]["count"] === 1).toBe(true);
        });
    });

    describe("AdminAccess", function Admins() {
        test("Admins should be able to access ALL crates", async() => {
            const res1 = await request.post(`/api/v1/users/token`)
            .send({
                emailAddress: furyEmailAddress,
                password: superSecretPassword
            })
            .expect(200);

            const furyAccessToken = res1.body.accessToken;

            const res2 = await request.get(`/api/v1/crates`)
            .set("authorization", `Bearer ${furyAccessToken}`)
            .send()
            .expect(200);

            expect(Array.isArray(res2.body.entries)).toBe(true);
            expect(typeof(res2.body.count) === "number").toBe(true);
            expect(Object.keys(res2["body"]["entries"][0]).includes("data")).toBe(true);
        });

        test("Platform users should NOT be able to access ALL crates", async() => {
            const res1 = await request.post(`/api/v1/users/token`)
            .send({
                emailAddress: starkEmailAddress,
                password: superSecretPassword
            })
            .expect(200);

            const starkAccessToken = res1.body.accessToken;

            const res2 = await request.get(`/api/v1/crates`)
            .set("authorization", `Bearer ${starkAccessToken}`)
            .send()
            .expect(401);
        });
    });
});

describe("CrateManagement", function CrateManagement() {
    test("Platform users should NOT be able to create new crates", async() => {
        const res1 = await request.post(`/api/v1/users/token`)
        .send({
            emailAddress: starkEmailAddress,
            password: superSecretPassword
        })
        .expect(200);

        const starkAccessToken = res1.body.accessToken;

        const res2 = await request.post(`/api/v1/crates`)
        .set("authorization", `Bearer ${starkAccessToken}`)
        .send({
            size: ["L"]
        })
        .expect(401);
    });

    test("Admins should be able to create new crates", async() => {
        const res1 = await request.post(`/api/v1/users/token`)
            .send({
                emailAddress: furyEmailAddress,
                password: superSecretPassword
            })
            .expect(200);

            const furyAccessToken = res1.body.accessToken;

            const res2 = await request.post(`/api/v1/crates`)
            .set("authorization", `Bearer ${furyAccessToken}`)
            .send({
                size: ["L"]
            })
            .expect(201);

            expect(res2.body.count === 1).toBe(true);
            expect(Object.keys(res2["body"]["entries"][0]).includes("id"));
            expect(res2["body"]["entries"][0]["data"]["size"][0] === "L");
    });

    test("Admins should be able to set the recipient of an existing crate", async() => {
        const res1 = await request.post(`/api/v1/users/token`)
            .send({
                emailAddress: furyEmailAddress,
                password: superSecretPassword
            })
            .expect(200);

            const furyAccessToken = res1.body.accessToken;

            const res2 = await request.post(`/api/v1/crates`)
            .set("authorization", `Bearer ${furyAccessToken}`)
            .send({
                size: ["L"]
            })
            .expect(201);


            const crateId = res2["body"]["entries"][0]["id"];
            const fakeRecipientId = faker.random.uuid();
            
            const res3 = await request.put(`/api/v1/crates/${crateId}/recipient`)
            .set("authorization", `Bearer ${furyAccessToken}`)
            .send({
                recipientId: fakeRecipientId
            })
            .expect(204);

            const res4 = await request.get(`/api/v1/crates/${crateId}`)
            .set("authorization", `Bearer ${furyAccessToken}`)
            .send()
            .expect(200);

            expect(res4["body"]["entries"][0]["data"]["recipientId"] === fakeRecipientId).toBe(true);
    });

    test("Admins should be able to delete an existing crate", async() => {
        const res1 = await request.post(`/api/v1/users/token`)
        .send({
            emailAddress: furyEmailAddress,
            password: superSecretPassword
        })
        .expect(200);

        const furyAccessToken = res1.body.accessToken;

        const res2 = await request.post(`/api/v1/crates`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send({
            size: ["L"]
        })
        .expect(201);

        const crateId = res2["body"]["entries"][0]["id"];
            
        const res3 = await request.delete(`/api/v1/crates/${crateId}`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(204);

        const res4 = await request.get(`/api/v1/crates/${crateId}`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(404);
    });

    test("Platform users should NOT be able to delete an existing crate", async() => {
        const res1 = await request.post(`/api/v1/users/token`)
        .send({
            emailAddress: furyEmailAddress,
            password: superSecretPassword
        })
        .expect(200);

        const furyAccessToken = res1.body.accessToken;

        const res2 = await request.post(`/api/v1/users/token`)
        .send({
            emailAddress: starkEmailAddress,
            password: superSecretPassword
        })
        .expect(200);

        const starkAccessToken = res2.body.accessToken;

        const res3 = await request.post(`/api/v1/crates`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send({
            size: ["L"]
        })
        .expect(201);

        const crateId = res3["body"]["entries"][0]["id"];
            
        const res4 = await request.delete(`/api/v1/crates/${crateId}`)
        .set("authorization", `Bearer ${starkAccessToken}`)
        .send()
        .expect(401);

        const res5 = await request.get(`/api/v1/crates/${crateId}`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(200);
    });

    test("Platform should be able to set a crate to pendingReturn", async() => {
        const res1 = await request.post(`/api/v1/users/token`)
        .send({
            emailAddress: furyEmailAddress,
            password: superSecretPassword
        })
        .expect(200);

        const furyAccessToken = res1.body.accessToken;
        const fakeMerchantId = faker.random.uuid();

        const res2 = await request.post(`/api/v1/crates`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send({
            size: ["L"],
            merchantId: fakeMerchantId
        })
        .expect(201);

        const crateId = res2["body"]["entries"][0]["id"];

        const res3 = await request.put(`/api/v1/crates/${crateId}/recipient`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send({
            recipientId: faker.random.uuid()
        })
        .expect(204);

        const res4 = await request.post(`/api/v1/crates/${crateId}/shipments`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send({
            originAddress: {
                street: faker.address.streetName(),
                apartmentNumber: "7",
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            destinationAddress: {
                street: faker.address.streetName(),
                apartmentNumber: "7",
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            trackingNumber: faker.random.uuid()
        })
        .expect(201);

        const shipmentId = res4["body"]["entries"][0]["data"]["tripId"];

        expect(res4["body"]["entries"][0]["id"] === crateId).toBe(true);
        expect(res4["body"]["entries"][0]["data"]["tripId"]).toBeTruthy();
        expect(res4["body"]["entries"][0]["data"]["merchantId"] === fakeMerchantId).toBe(true);

        const res5 = await request.get(`/api/v1/crates/${crateId}`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(200);
        
        expect(res5["body"]["entries"][0]["data"]["status"][0] === "inTransit").toBe(true);

        const res6 = await request.put(`/api/v1/crates/${crateId}/shipments/${shipmentId}/status`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(204);

        const res7 = await request.get(`/api/v1/crates/${crateId}`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(200);
        
        expect(res7["body"]["entries"][0]["data"]["status"][0] === "delivered").toBe(true);

        const res8 = await request.get(`/api/v1/crates/${crateId}/shipments/${shipmentId}`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(200);

        expect(res8["body"]["entries"][0]["data"]["status"][0] === "complete").toBe(true);

        const res9 = await request.put(`/api/v1/crates/${crateId}/status`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(204);

        const res10 = await request.get(`/api/v1/crates/${crateId}`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(200);
        
        expect(res10["body"]["entries"][0]["data"]["status"][0] === "pendingReturn").toBe(true);
    });

    
});

describe("ShipmentManagement", function ShipmentManagement() {
    test("Platform should be able to start shipment of a specified crate", async() => {
        const res1 = await request.post(`/api/v1/users/token`)
        .send({
            emailAddress: furyEmailAddress,
            password: superSecretPassword
        })
        .expect(200);

        const furyAccessToken = res1.body.accessToken;
        const fakeMerchantId = faker.random.uuid();

        const res2 = await request.post(`/api/v1/crates`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send({
            size: ["L"],
            merchantId: fakeMerchantId
        })
        .expect(201);

        const crateId = res2["body"]["entries"][0]["id"];

        const res3 = await request.put(`/api/v1/crates/${crateId}/recipient`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send({
            recipientId: faker.random.uuid()
        })
        .expect(204);

        const res4 = await request.post(`/api/v1/crates/${crateId}/shipments`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send({
            originAddress: {
                street: faker.address.streetName(),
                apartmentNumber: "7",
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            destinationAddress: {
                street: faker.address.streetName(),
                apartmentNumber: "7",
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            trackingNumber: faker.random.uuid()
        })
        .expect(201);

        expect(res4["body"]["entries"][0]["id"] === crateId).toBe(true);
        expect(res4["body"]["entries"][0]["data"]["tripId"]).toBeTruthy();
        expect(res4["body"]["entries"][0]["data"]["merchantId"] === fakeMerchantId).toBe(true);

        const res5 = await request.get(`/api/v1/crates/${crateId}`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(200);

        
        expect(res5["body"]["entries"][0]["data"]["status"][0] === "inTransit").toBe(true);
    });

    test("Platform should be able to get a list of all shipments for a specified crate", async() => {
        const res1 = await request.post(`/api/v1/users/token`)
        .send({
            emailAddress: furyEmailAddress,
            password: superSecretPassword
        })
        .expect(200);

        const furyAccessToken = res1.body.accessToken;
        const fakeMerchantId = faker.random.uuid();

        const res2 = await request.post(`/api/v1/crates`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send({
            size: ["L"],
            merchantId: fakeMerchantId
        })
        .expect(201);

        const crateId = res2["body"]["entries"][0]["id"];

        const res3 = await request.put(`/api/v1/crates/${crateId}/recipient`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send({
            recipientId: faker.random.uuid()
        })
        .expect(204);

        const res4 = await request.post(`/api/v1/crates/${crateId}/shipments`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send({
            originAddress: {
                street: faker.address.streetName(),
                apartmentNumber: "7",
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            destinationAddress: {
                street: faker.address.streetName(),
                apartmentNumber: "7",
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            trackingNumber: faker.random.uuid()
        })
        .expect(201);

        const res5 = await request.get(`/api/v1/crates/${crateId}/shipments`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(200);
        
        expect(res5["body"]["count"] === 1).toBe(true);
        expect(res5["body"]["entries"][0]["data"]["status"][0] === "inProgress").toBe(true);
    });

    test("Platform should be able to complete shipment of a specified crate", async() => {
        const res1 = await request.post(`/api/v1/users/token`)
        .send({
            emailAddress: furyEmailAddress,
            password: superSecretPassword
        })
        .expect(200);

        const furyAccessToken = res1.body.accessToken;
        const fakeMerchantId = faker.random.uuid();

        const res2 = await request.post(`/api/v1/crates`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send({
            size: ["L"],
            merchantId: fakeMerchantId
        })
        .expect(201);

        const crateId = res2["body"]["entries"][0]["id"];

        const res3 = await request.put(`/api/v1/crates/${crateId}/recipient`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send({
            recipientId: faker.random.uuid()
        })
        .expect(204);

        const res4 = await request.post(`/api/v1/crates/${crateId}/shipments`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send({
            originAddress: {
                street: faker.address.streetName(),
                apartmentNumber: "7",
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            destinationAddress: {
                street: faker.address.streetName(),
                apartmentNumber: "7",
                city: faker.address.city(),
                state: faker.address.stateAbbr(),
                zip: faker.address.zipCode()
            },
            trackingNumber: faker.random.uuid()
        })
        .expect(201);

        const shipmentId = res4["body"]["entries"][0]["data"]["tripId"];

        expect(res4["body"]["entries"][0]["id"] === crateId).toBe(true);
        expect(res4["body"]["entries"][0]["data"]["tripId"]).toBeTruthy();
        expect(res4["body"]["entries"][0]["data"]["merchantId"] === fakeMerchantId).toBe(true);

        const res5 = await request.get(`/api/v1/crates/${crateId}`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(200);
        
        expect(res5["body"]["entries"][0]["data"]["status"][0] === "inTransit").toBe(true);

        const res6 = await request.put(`/api/v1/crates/${crateId}/shipments/${shipmentId}/status`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(204);

        const res7 = await request.get(`/api/v1/crates/${crateId}`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(200);
        
        expect(res7["body"]["entries"][0]["data"]["status"][0] === "delivered").toBe(true);

        const res8 = await request.get(`/api/v1/crates/${crateId}/shipments/${shipmentId}`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(200);

        expect(res8["body"]["entries"][0]["data"]["status"][0] === "complete").toBe(true);
    });
});






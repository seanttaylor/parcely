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
        test("Should be able to get a list of trips associated with a user account", async() => {
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

        test("Should be able to get a filtered list of trips associated with a user account based on trip status", async() => {
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
            .expect(200);

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
            .expect(200);


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
});






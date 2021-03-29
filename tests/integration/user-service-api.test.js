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
const thorUserId = "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09";
const thorEmailAddress = "thor@avengers.io";
const superSecretPassword = "superSecretPassword";

test("Should be able to get a userId and access credential when a new User instance is created", async()=> {
    const fakePassword = faker.internet.password();
    const res1 = await request.post(`/api/v1/users`)
    .send({
        handle: faker.internet.userName(),
        motto: "Hulk smash!",
        emailAddress: faker.internet.email(),
        firstName: "Bruce",
        lastName: "Banner",
        phoneNumber: faker.phone.phoneNumber(),
        password: fakePassword
    })
    .expect(200);

    expect(Object.keys(res1.body).includes("accessToken")).toBe(true);
    expect(Object.keys(res1.body).includes("userId")).toBe(true);
    expect(typeof(res1.body.accessToken) === "string").toBe(true);
    expect(typeof(res1.body.userId) === "string").toBe(true);
});

describe("Authorization", function Authorization() {
    describe("User Auth", function UserAuth() {
        test("Platform Users should be able to access their own data", async() => {
            const res1 = await request.post(`/api/v1/users/token`)
            .send({
                emailAddress: starkEmailAddress,
                password: superSecretPassword
            })
            .expect(200);

            const starkAccessToken = res1.body.accessToken;

            const res2 = await request.get(`/api/v1/users/${starkUserId}`)
            .set("authorization", `Bearer ${starkAccessToken}`)
            .send()
            .expect(200);
        });

        test("Platform Users should NOT be able to access other users' data", async() => {
            const res1 = await request.post(`/api/v1/users/token`)
            .send({
                emailAddress: starkEmailAddress,
                password: superSecretPassword
            })
            .expect(200);

            const starkAccessToken = res1.body.accessToken;

            const res2 = await request.get(`/api/v1/users/${thorUserId}`)
            .set("authorization", `Bearer ${starkAccessToken}`)
            .send()
            .expect(401);

            const res3 = await request.post(`/api/v1/users/token`)
            .send({
                emailAddress: thorEmailAddress,
                password: superSecretPassword
            })
            .expect(200);

            const thorAccessToken = res3.body.accessToken;

            const res4 = await request.get(`/api/v1/users/${thorUserId}`)
            .set("authorization", `Bearer ${thorAccessToken}`)
            .send()
            .expect(200);
        });

        test("Platform Users should be able to edit their own account data", async() => {
            const res1 = await request.post(`/api/v1/users/token`)
            .send({
                emailAddress: starkEmailAddress,
                password: superSecretPassword
            })
            .expect(200);

            const starkAccessToken = res1.body.accessToken;

            const res2 = await request.put(`/api/v1/users/${starkUserId}/name`)
            .set("authorization", `Bearer ${starkAccessToken}`)
            .send({
                firstName: "Anthony"
            })
            .expect(200);
            
            expect(res2["body"]["entries"][0]["data"]["firstName"] === "Anthony").toBe(true);

        });

        test("Platform Users should NOT be able to edit other users' account  data", async() => {
            const res1 = await request.post(`/api/v1/users/token`)
            .send({
                emailAddress: thorEmailAddress,
                password: superSecretPassword
            })
            .expect(200);

            const thorAccessToken = res1.body.accessToken;

            const res2 = await request.put(`/api/v1/users/${starkUserId}/name`)
            .set("authorization", `Bearer ${thorAccessToken}`)
            .send({
                firstName: "PoopyHead"
            })
            .expect(401);

        });

        test("Platform Users should be able to find geolocation data for all crates associated with their own account", async() => {
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
    /*
        describe("Admin Auth", function AdminAuth() {

        }); 
    */ 
});

describe("UserCrateAccess", function CrateAccess() {
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
});






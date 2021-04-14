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

test("Should be able to get a userId and access credential when a new User instance is created", async()=> {
    const fakePassword = faker.internet.password();
    const res1 = await request.post(`/api/v1/users`)
    .send({
        handle: faker.internet.userName(),
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
    describe("User Auth", function Users() {
        test("Platform users should be able to access their own data", async() => {
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

        test("Platform users should NOT be able to access other users' data", async() => {
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
            .expect(403);

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

        test("Platform users should NOT be able to edit other users' account  data", async() => {
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
            .expect(403);
        });
        
    }); 
    
    describe("Admin Auth", function AdminAuth() {
        test("Admin users should be able to access ANY user account data", async() => {
            const res1 = await request.post(`/api/v1/users/token`)
            .send({
                emailAddress: furyEmailAddress,
                password: superSecretPassword
            })
            .expect(200);

            const furyAccessToken = res1.body.accessToken;

            const res2 = await request.get(`/api/v1/users/${starkUserId}`)
            .set("authorization", `Bearer ${furyAccessToken}`)
            .send()
            .expect(200);

            expect(res2["body"]["entries"][0]["data"]["emailAddress"] === starkEmailAddress).toBe(true);

            const res3 = await request.get(`/api/v1/users/${thorUserId}`)
            .set("authorization", `Bearer ${furyAccessToken}`)
            .send()
            .expect(200);

            expect(res3["body"]["entries"][0]["data"]["emailAddress"] === thorEmailAddress).toBe(true);
        });

        test("Admin users should be able to edit ANY user account data", async() => {
            const res1 = await request.post(`/api/v1/users/token`)
            .send({
                emailAddress: furyEmailAddress,
                password: superSecretPassword
            })
            .expect(200);

            const furyAccessToken = res1.body.accessToken;

            const res2 = await request.put(`/api/v1/users/${starkUserId}/name`)
            .set("authorization", `Bearer ${furyAccessToken}`)
            .send({
                lastName: "PoopyHead"
            })
            .expect(200);

            const res3 = await request.get(`/api/v1/users/${starkUserId}`)
            .set("authorization", `Bearer ${furyAccessToken}`)
            .send()
            .expect(200);

            expect(res3["body"]["entries"][0]["data"]["lastName"] === "PoopyHead").toBe(true);
        });
    });  
});

describe("UserAccountManagement", function UserAccountManagement() {
    test("Platform users should be able to edit the name on their account", async() => {
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

    test("Platform users should be able to edit the phone number on their account", async() => {
        const fakePhoneNumber = faker.phone.phoneNumber();

        const res1 = await request.post(`/api/v1/users/token`)
        .send({
            emailAddress: starkEmailAddress,
            password: superSecretPassword
        })
        .expect(200);

        const starkAccessToken = res1.body.accessToken;

        const res2 = await request.put(`/api/v1/users/${starkUserId}/phone`)
        .set("authorization", `Bearer ${starkAccessToken}`)
        .send({
            phoneNumber: fakePhoneNumber
        })
        .expect(200);
    });

    test("Platform users should be able to update the email address on their account", async() => {
        const fakeEmail = faker.internet.email();

        const res1 = await request.post(`/api/v1/users/token`)
        .send({
            emailAddress: starkEmailAddress,
            password: superSecretPassword
        })
        .expect(200);

        const starkAccessToken = res1.body.accessToken;

        const res2 = await request.put(`/api/v1/users/${starkUserId}/email`)
        .set("authorization", `Bearer ${starkAccessToken}`)
        .send({
            emailAddress: fakeEmail
        })
        .expect(200);

        expect(res2["body"]["entries"][0]["data"]["emailAddress"] === fakeEmail).toBe(true);
    });

    test("Platform should be able to determine if a specified email address already exists in the datastore", async() => {
        const fakeEmail = faker.internet.email();

        const res1 = await request.post(`/api/v1/users/token`)
        .send({
            emailAddress: furyEmailAddress,
            password: superSecretPassword
        })
        .expect(200);

        const furyAccessToken = res1.body.accessToken;

        const res2 = await request.get(`/api/v1/users/email_exists/${fakeEmail}`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(404);

        const res3 = await request.get(`/api/v1/users/email_exists/${furyEmailAddress}`)
        .set("authorization", `Bearer ${furyAccessToken}`)
        .send()
        .expect(200);
    });

    test("Platform should be able to reset a specified user password", async() => {
        const updatedPassword = "brandNewPassword";
        const testUserEmail = faker.internet.email();
        const testUserPassword = faker.internet.password();
        
        const res1 = await request.post(`/api/v1/users`)
        .send({
            handle: faker.internet.userName(),
            emailAddress: testUserEmail,
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            phoneNumber: faker.phone.phoneNumber(),
            password: testUserPassword
        })
        .expect(200);

        const testUserId = res1.body.userId;
        const testUserAccessToken = res1.body.accessToken;

        const res2 = await request.post(`/api/v1/users/token`)
        .send({
            emailAddress: testUserEmail,
            password: testUserPassword
        })
        .expect(200);


        const res3 = await request.put(`/api/v1/users/${testUserId}/password`)
        .set("authorization", `Bearer ${testUserAccessToken}`)
        .send({
            password: updatedPassword
        })
        .expect(204);

        const res4 = await request.post(`/api/v1/users/token`)
        .set("authorization", `Bearer ${testUserAccessToken}`)
        .send({
            emailAddress: testUserEmail,
            password: updatedPassword
        })
        .expect(200);
    });
});






/**********************************************/
//ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/**********************************************/
process.env.NODE_ENV = "ci/cd/test";

const app = require("../../index");
const supertest = require("supertest");
const request = supertest(app);
const faker = require("faker");
const starkUserId = "e98417a8-d912-44e0-8d37-abe712ca840f";
const thorUserId = "b0a2ca71-475d-4a4e-8f5b-5a4ed9496a09";


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
                emailAddress: "tstark@avengers.io",
                password: "superSecretPassword"
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
                emailAddress: "tstark@avengers.io",
                password: "superSecretPassword"
            })
            .expect(200);

            const starkAccessToken = res1.body.accessToken;

            const res2 = await request.get(`/api/v1/users/${thorUserId}`)
            .set("authorization", `Bearer ${starkAccessToken}`)
            .send()
            .expect(401);

            const res3 = await request.post(`/api/v1/users/token`)
            .send({
                emailAddress: "thor@avengers.io",
                password: "superSecretPassword"
            })
            .expect(200);

            const thorAccessToken = res3.body.accessToken;

            const res4 = await request.get(`/api/v1/users/${thorUserId}`)
            .set("authorization", `Bearer ${thorAccessToken}`)
            .send()
            .expect(200);
        });
    }); 
    /*
        describe("Admin Auth", function AdminAuth() {

        }); 
    */ 
});






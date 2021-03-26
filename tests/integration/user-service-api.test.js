/**********************************************/
//ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/**********************************************/
process.env.NODE_ENV = "ci/cd/test";

const app = require("../../index");
const supertest = require("supertest");
const request = supertest(app);
const faker = require("faker");


test("Should be able to create a new User instance", async()=> {
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
});
/**********************************************/
//ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/**********************************************/
process.env.NODE_ENV = "ci/cd/test";

const app = require("../../app.index");
const supertest = require("supertest");
const request = supertest(app);
const faker = require("faker");

process.env.COMMIT_HASH = faker.git.commitSha();


describe("SystemStatus", function SystemStatus() {

    test("Should be able to get the current system status", async() => {
        const res1 = await request.get("/status")
        .send()
        .expect(200);

        expect(res1.body.status === "OK").toBe(true);
        expect(res1.body.commitHash).toBeTruthy();
    });

});
/**********************************************/
//ENSURE NODE_ENV is hardcoded to "ci/cd/test"//
/**********************************************/
process.env.NODE_ENV = "ci/cd/test";

const IMailer= require("../../src/interfaces/mailer");
const events = require("events");
const eventEmitter = new events.EventEmitter();
const MockMailImpl = require("../../src/lib/utils/mocks/mailer");
const myMockMailService = new MockMailImpl({eventEmitter});
const testMailService = new IMailer(myMockMailService);
const EmailTemplate = require("../../src/lib/mailer/email-templates");


test("Should print message metadata to the console when an email is sent", async() => {
    await testMailService.send({
        from: "qa@nicely.io", 
        to: ["noone@none.com"], 
        subject: "Test Email",
        html: "<h1>A Test Email</h1>"
    })
    expect(myMockMailService.calledMethods.send).toBe(true);
});

test("Should throw an error when interface methods are NOT overridden with an implementation", async() => {
    const testMailService1 = new IMailer({});

    try {
        testMailService1.send({
            from: "qa@nicely.io", 
            to: ["noone@none.com"], 
            subject: "Test Email",
            html: "<h1>A Test Email</h1>"
        });
    } catch (e) {
        expect(e.message).toMatch("Missing implementation");
    }
});

test("Should use a specified template file to render email if a named templated is not provided", async() => {
    const myTemplate = await EmailTemplate.of({
        filePath: "./src/lib/mailer/email-templates/welcome-email.ejs", 
        data: {
            data: {
                firstName: "Tony"
            }
        }
    });

    expect(typeof(myTemplate) === "string").toBe(true);
});

test("Should use a named template file to render email if a template file path is not provided", async() => {
    const myTemplate = await EmailTemplate.of({
        templateName: "welcomeEmail", 
        data: {
            data: {
                firstName: "Tony"
            }
        }
    });

    expect(typeof(myTemplate) === "string").toBe(true);
});

test("Should send a welcome email on the UserService.newUserCreated event", async() => {
    const mockUserObject = {
        _data: {
            emailAddress: "noone@nowhere.io"
        }
    };
    eventEmitter.emit("UserService.newUserCreated", mockUserObject);

    expect(myMockMailService.calledMethods.send).toBe(true);
});

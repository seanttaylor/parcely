const IMailer= require("../../src/interfaces/mailer");
const MailService = require("../../src/lib/mailer");
const console = require("../../src/lib/utils/mocks/console");
const events = require("events");
const eventEmitter = new events.EventEmitter();
const testMailService = new IMailer(new MailService({console, eventEmitter}));
const EmailTemplate = require("../../src/lib/mailer/email-templates");

/**Tests**/

test("Should print message metadata to the console when an email is sent", async() => {
    await testMailService.send({
        from: "qa@nicely.io", 
        to: ["noone@none.com"], 
        subject: "Test Email",
        html: "<h1>A Test Email</h1>"
    })
    expect(console.calledMethods.log).toBe(true);
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

test("Should use a specified template filename to render email if a named templated is not provided", async() => {
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

test("Should send a welcome email on the userService.newUserCreated event", async() => {
    const mockUserObject = {
        _data: {
            emailAddress: "noone@nowhere.io"
        }
    };
    eventEmitter.emit("userService.newUserCreated", mockUserObject);

    expect(console.calledMethods.log).toBe(true);
});

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.PLATFORM_OUTBOUND_EMAIL_USERNAME,
        pass: process.env.PLATFORM_OUTBOUND_EMAIL_PASSWORD
    }
});
const EmailTemplate = require("../mailer/email-templates");

/**
* An configuration object for send emails via the Mailable interface
* @typedef {Object} EmailMessageConfiguration
* @property {String} from - email addrress of the sender
* @property {Array} to - email address of the primary recipient
* @property {Array} bcc - List of email addresses to 'bcc'
* @property {Array} cc - List of email addresses to 'cc'
* @property {String} subject - Subject of the email
*/


/**
* @typedef {Object} MailSService
* @property {Function} send - sends an email
*/

/**
 * @implements {IMailerAPI}
 * @returns {Object} an implementation of the IMailer interface
 */

/**
 * @param {Object} console - the console object
 * @param {EventEmitter} eventEmitter - an instance of EventEmitter
 */

function MailService({console, eventEmitter}) {

    eventEmitter.on("userService.newUserCreated", sendWelcomeEmail.bind(this));

    async function sendWelcomeEmail(user) {
        await this.send({
            from: process.env.PLATFORM_OUTBOUND_EMAIL_USERNAME,
            to: [user._data.emailAddress],
            subject: "Welcome to Nicely!",
            html: await EmailTemplate.of({templateName: "welcomeEmail", data: user._data})
        });
    }

    /**
    * Sends an email to specified recipients
    * @param {EmailMessageConfiguration} 
    */

    this.send = async function({ from, to, bcc, subject, html}) {
        const message = {
            from,
            to: to.join(', '), // Nodemailer API requires a single comma-separated string of addresses
            bcc,
            subject,
            html
        };

        const outboundMessage = await transporter.sendMail(message);
        console.log({
            messageId: outboundMessage.messageId,
            messagePreviewURL: nodemailer.getTestMessageUrl(outboundMessage)
        });
    }
}



module.exports = MailService;

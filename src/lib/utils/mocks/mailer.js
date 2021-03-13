/* istanbul ignore file */

/**
 * Mock implementation for various mailer service methods
 */
const mockMailerImplementation =  {
    _transporter: {
        async sendMail(data) {
            mockMailerImplementation.calledMethods.sendMail = true;
            return {messageId: "fake-id", messagePreviewURL: "http://who-cares.io"}
        }
    },
    _mailLib: {
        getTestMessageUrl() {
            mockMailerImplementation.calledMethods.getTestMessageUrl = true;
        }
    },
    calledMethods: {
        sendMail: false,
        getTestMessageUrl: false
    }
}

module.exports = mockMailerImplementation;
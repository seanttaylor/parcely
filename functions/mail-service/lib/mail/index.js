const sendGridMail = require("@sendgrid/mail");
const functions = require("firebase-functions");

// OUTSIDE Google Cloud Functions the API_KEY value SHOULD BE an environment variable
sendGridMail.setApiKey(functions.config().sendgrid_api_key.value);

/**
* Sends an email to specified recipients
* @param {EmailMessageConfiguration}
*/

async function send({
  from, to, subject, html,
}) {
  await sendGridMail.send({
    from, to, subject, html,
  });
}

module.exports = {
  send,
};

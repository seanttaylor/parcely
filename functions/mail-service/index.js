const functions = require("firebase-functions");
const Ajv = require("ajv");
const IMailer = require("./interfaces/mail");
const MailService = require("./services/mail");
const EmailTemplate = require("./lib/mail/template");
const mailLibrary = require("./lib/mail");
const messageSchema = require("./schemas/email-schema.json");

const mailService = new IMailer(new MailService(mailLibrary));
const FUNC_REGION = "us-east1";
const ajv = new Ajv();
const validate = ajv.compile(messageSchema);

/**
 * Forwards the contents of an email contact form to
 * the main Parcely inbox
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */

// eslint-disable-next-line max-len
exports.fwdMessage = functions.region(FUNC_REGION).https.onRequest(async (req, res) => {
  const valid = validate(req.body);
  if (req.method !== "POST") {
    res.status(405).send();
    return;
  }

  if (!valid) {
    res.status(400).send({
      errors: validate.errors,
    });
    return;
  }

  try {
    await mailService.send({
      from: "hello@parcely.us",
      to: [functions.config().mail_service_inbound_email_address.value],
      subject: `Contact inquiry from ${req.body.name} (${req.body.email})`,
      html: await EmailTemplate.of({ templateName: "generalInquiry", data: req.body }),
    });

    res.status(204).send();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    res.status(500).send();
  }
});

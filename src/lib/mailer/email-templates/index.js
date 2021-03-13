const ejs = require("ejs");
const { promisify } = require("util");
const renderFile = promisify(ejs.renderFile);

const templateLibrary = {
    welcomeEmail: `${__dirname}/welcome-email.ejs`
};


/**
 * Creates a new email template 
 * @param {String} templateName - render a known email template [REQUIRED if `filePath` undefined]
 * @param {Object} data - data used in the rendered template
 * @param {String} filePath - file path to a template [REQUIRED if `templateName` undefined]
 * @returns {String} a rendered HTML string
 */

const EmailTemplate = {
    async of({templateName, data, filePath}) {
        let template;
        const templateExistsInLibrary = Object.keys(templateLibrary).includes(templateName);

        if (!templateExistsInLibrary) {
            template = await renderFile(filePath, {data});
        } else {
            template = await renderFile(templateLibrary[templateName], {data});
        }

        return template;
    }
};

module.exports = EmailTemplate;
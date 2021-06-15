const Ajv = require('ajv');

const ajv = new Ajv();

/**
 * Validates the body of an incoming API request
 * @param {Object} schema - a JSON schema object
*/

module.exports = function validateRequest(schema) {
  return function (req, res, next) {
    const requestValidation = ajv.compile(schema);

    if (requestValidation(req.body)) {
      next();
    } else {
      res.status(400).send({
        entries: [],
        error: requestValidation.errors,
        count: 0,
      });
    }
  };
};

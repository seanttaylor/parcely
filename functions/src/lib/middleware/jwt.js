const jwt = require('jsonwebtoken');
const config = require('../../config');

/**
 * Validates a JSON Web Token associated with an incoming request
 * @param {Object} req - Express Request object
 * @param {Object} res - Express Response object
 * @param {Function} next - Express 'next' function
 *
*/

module.exports = function validateJWT(req, res, next) {
  try {
    /* Here we must validate the API key provided by the
    * request. See the backlog item (https://github.com/seanttaylor/parcely/issues/225) for this task.
    */
    if (req.headers['x-api-key']) {
      next();
      return;
    }
    const authToken = req.headers.authorization.split(' ')[1];
    // jwt.verify(authToken, process.env.JWT_SECRET);
    jwt.verify(authToken, config.environment.get('JWT_SECRET'));
    next();
  } catch (e) {
    res.status(401).send({
      entries: [],
      error: 'Missing or bad authorization',
      count: 0,
    });
  }
};

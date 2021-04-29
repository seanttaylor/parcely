/* istanbul ignore file */

const express = require('express');

const router = new express.Router();

/**
 * @param {Object} config - application config object
 * @returns router - an instance of an Express router
 */

function StatusRouter(config) {
  router.get('/', async (req, res) => {
    res.set('content-type', 'application/json');
    res.status(200);
    res.json({
      status: 'OK',
      commitHash: config.environment.get('COMMIT_HASH'),
    });
  });

  return router;
}

module.exports = StatusRouter;

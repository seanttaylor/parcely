const repo = require('./repo');
const user = require('./user');
const userService = require('./user-service');
const cache = require('./cache');
const console = require('./console');
const publishService = require('./publish-service');
const hardwareCrateService = require('./hardware-crate-service');

module.exports = {
  mocks: {

  },
  mockImpl: {
    repo,
    user,
    publishService,
    hardwareCrateService,
    userService,
    cache,
    console,
  },
};

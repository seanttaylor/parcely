const repo = require('./repo');
const user = require('./user');
const userService = require('./user-service');
const cache = require('./cache');
const console = require('./console');

module.exports = {
  mocks: {

  },
  mockImpl: {
    repo,
    user,
    userService,
    cache,
    console,
  },
};

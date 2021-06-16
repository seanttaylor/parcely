/* istanbul ignore file */

/**
 * Mock implementation for various UserService methods
 * See /src/services/user for documentation
 */
const mockUserServiceImplementation = {
  getUserRole() {
    this.calledMethods.getUserRole = true;
    return 'test-user-role';
  },
  calledMethods: {
    getUserRole: false,
  },
  _data: {},
};

module.exports = mockUserServiceImplementation;

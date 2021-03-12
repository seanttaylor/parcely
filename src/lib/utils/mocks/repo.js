/* istanbul ignore file */

/**
 * Mock implementation for various Repository methods
 * See /src/interfaces and /src/lib/repository for documentation and actual implementation
 */
const mockRepositoryImplementation = {
    _repo: {
        createUserPassword() {
            this.calledMethods.createUserPasswordCalled = true;
        },
        calledMethods: {
            createUserPasswordCalled: false
        }
    },
    _data: {
        
    },

};

module.exports = mockRepositoryImplementation;
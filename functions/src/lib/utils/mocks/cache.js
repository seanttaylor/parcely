/* istanbul ignore file */

/**
 * Mock implementation for various Cache methods
 * See /src/interfaces/cache for documentation
 */
const mockCacheImplementation = {
    set() {
        this.calledMethods.set = true;
    },
    del() {
        this.calledMethods.del = true;
    },
    has() {
        this.calledMethods.has = true;
    },
    calledMethods: {
        set: false,
        del: false,
        has: false
    }
};

module.exports = mockCacheImplementation;
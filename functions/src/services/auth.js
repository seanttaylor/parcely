const functions = require("firebase-functions");
const jwt = require("jsonwebtoken");

/**
 * Manages creation and lifecycle of auth credentials
 * @param {CacheService} cacheService - an instance of the CacheService
 * @param {UserService} userService - an instance of the UserService
 * @param {Object} config - application configuration
 */

function UserAuthService({cacheService, userService, config}) {
    /**
     * Issues a new authorization credential for a specified user
     * @param {User} user - an instance of the User class
     * @param {String} role - role associated with the user in the datastore
     * @returns a JSON Web Token
    */

    this.issueAuthCredential = async function(user, role="user") {
        const expiresInOneHour = Math.floor(Date.now() / 1000) + (60 * 60);
        const token = jwt.sign({ 
            iss: "api@parcely", 
            exp: expiresInOneHour,
            sub: user.id,
            role: [role]
        }, config.environment.get("JWT_SECRET"));
        
        cacheService.set({key: user.id, value: token, ttl: expiresInOneHour});
        return token;
    }

    /**
     * Expires an existing credential
     * @param {String} credential - a JSON Web Token
    */

    this.expireAuthCredential = function(credential) {
        cacheService.del(credential);
    }


    /**
     * @param {String} credential - a JSON Web Token 
     * @returns Boolean indicating whether the credential is valid (i.e. not expired)
    */

    this.validateAuthCredential = function(credential) {
        return cacheService.has(credential);
    }
}

module.exports = { UserAuthService };
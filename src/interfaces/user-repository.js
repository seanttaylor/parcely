/* istanbul ignore file */

/**
* An object having the IUserRepository API; a set of methods for managing users
* @typedef {Object} IUserRepositoryAPI
* @property {Function} create - creates a new user in the data store
* @property {Function} findOneById - finds a user in the data store by uuid
* @property {Function} findAll - finds all users in the data store
* @property {Function} editName - update user.firstName and/or user.lastName properties
* @property {Function} delete - deletes a user in the data store by its uuid
*/

/**
 * Interface for a repository of users
 * @param {IUserRepositoryAPI} myImpl - object defining concrete implementations for interface methods
 */

function IUserRepository(myImpl) {
    function required() {
        throw Error("Missing implementation");
    }

    /**
    @returns {String} - a uuid for the new user
    */
    this.create = myImpl.create || required;

    /**
    @returns {User} - the requested User instance
    */
    this.findOneById = myImpl.findOneById || required;

    /**
    @returns {Array} - a list of all records in the data store
    */
    this.findAll = myImpl.findAll || required;

    /**
    @returns {Array} - a list of all records in the data store
    */
    this.findOneByEmail = myImpl.findOneByEmail || required;

    /**
    @returns 
    */
    this.editName = myImpl.editName || required;

    /**
    @returns 
    */
    this.editPhoneNumber = myImpl.editPhoneNumber || required;

    /**
    @returns
    */
    this.deleteUser = myImpl.deleteUser || required;

    /**
    @returns
    */
    this.getUserRole = myImpl.getUserRole || required;

    /**
    @returns
    */
    this.createUserPassword = myImpl.createUserPassword || required;

    /**
    @returns
    */
    this.getUserPassword = myImpl.getUserPassword || required;

}


module.exports = IUserRepository;
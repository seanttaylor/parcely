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
    @param {Object} doc - object representing a valid entry
    @returns {String} - a uuid for the new user
    */
    this.create = myImpl.create || required;

    /**
    @param {String} id - uuid of the user
    @returns {User} - the requested User instance
    */
    this.findOneById = myImpl.findOneById || required;

    /**
    @returns {Array} - a list of all records in the data store
    */
    this.findAll = myImpl.findAll || required;

    /**
    @param {String} id - uuid of the usr
    @param {Object} doc - object containing user first name and last name
    */
    this.editName = myImpl.editName || required;

    /**
    @param {String} id - uuid of the user
    */
    this.delete = myImpl.delete || required;

    const {
        editName,
        findAll,
        findOne,
        create,
        ...optionalMethods
    } = myImpl;

    Object.assign(this, optionalMethods);

}


module.exports = IUserRepository;
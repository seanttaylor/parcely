/* istanbul ignore file */

/**
* An object having the ICrateRepository API; a set of methods for managing crates
* @typedef {Object} ICrateRepositoryAPI
* @property {Function} create - creates a new crate in the data store
* @property {Function} getCrateById - finds a crate in the data store by uuid
* @property {Function} getAllCrates - finds all crates in the data store
* @property {Function} getCrateById - 
* @property {Function} getCrateTripsByCrateId - 
* @property {Function} getCratesByUser -
* @property {Function} markCrateReturned -
* @property {Function} delete - deletes a crate in the data store by its uuid
*/

/**
 * Interface for a repository of crates
 * @param {ICrateRepositoryAPI} myImpl - object defining concrete implementations for interface methods
 */

function ICrateRepository(myImpl) {
    function required() {
        throw Error("Missing implementation");
    }

    /**
    @param {Object} doc - dictionary representing a valid entry
    @returns {String} - a uuid for the new user
    */
    this.create = myImpl.create || required;

    /**
    @param {String} id - uuid of the user
    @returns {Object} - the requested user
    */
    this.getCrateById = myImpl.getCrateById || required;

    /**
    @returns {Array} - a list of all records in the data store
    */
    this.getAllCrates = myImpl.getAllCrates || required;

    /**
    @returns {CrateTrip} - an instance of a specified CrateTrip
    */
    this.getCrateTripById = myImpl.getCrateTripById || required;

    /**
    @returns {Array} - a list of CrateTrip instances
    */
    this.getCrateTripsByCrateId = myImpl.getCrateTripsByCrateId || required;    

    /**
    @returns {Array} - a list of crates associated with a specified user
    */
    this.getCratesByUser = myImpl.getCratesByUser || required;

    /**
    * Set a crate's status to indicate a pending return
    */
    this.markCrateReturned = myImpl.markCrateReturned || required;

    /**
    @param {String} id - uuid of the crate
    */
    this.deleteCrate = myImpl.deleteCrate || required;

}

module.exports = ICrateRepository;
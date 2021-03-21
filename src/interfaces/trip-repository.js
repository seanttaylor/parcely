/* istanbul ignore file */

/**
* An object having the ICrateTripRepository API; a set of methods for managing crates trips
* @typedef {Object} ICrateTripRepositoryAPI
* @property {Function} create - creates a new crate trip in the data store
* @property {Function} getCrateTripById- finds a crate trip in the data store by uuid
* @property {Function} getAllCrateTrips- finds all crate trips in the data store
* @property {Function} getCrateTripsByCrateId - finds a list of all unique trips of a specified crate
*/

/**
 * Interface for a repository of crates trips
 * @param {ICrateTripRepositoryAPI} myImpl - object defining concrete implementations for interface methods
 */

function ICrateTripRepository(myImpl) {
    function required() {
        throw Error("Missing implementation");
    }

    /**
    @param {Object} doc - dictionary representing a valid entry
    @returns {String} - a uuid for the new user
    */
    this.create = myImpl.create || required;

    /**
    @param {String} id - uuid of the crateTrip
    @returns {CrateTrip} - the requested crateTrip
    */
    this.getCrateTripById = myImpl.getCrateTripById || required;

    /**
    @returns {Array} - a list of all records in the data store
    */
    this.getAllCrateTrips = myImpl.getAllCrateTrips|| required;

    /**
    @returns {CrateTrip} - an instance of a specified CrateTrip
    */
    this.getCrateTripById = myImpl.getCrateTripById || required;

    /**
    @returns {Array} - a list of CrateTrip instances
    */
    this.getCrateTripsByCrateId = myImpl.getCrateTripsByCrateId || required;   
    
    this.addTripWaypoint = myImpl.addTripWaypoint || required;   

    this.completeCrateTrip= myImpl.completeCrateTrip || required;   

}

module.exports = ICrateTripRepository;
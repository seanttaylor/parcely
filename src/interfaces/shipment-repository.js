/* istanbul ignore file */

/**
* An object having the ICrateShipmentRepository API; a set of methods for managing crate shipments
* @typedef {Object} ICrateShipmentRepositoryAPI
* @property {Function} create - creates a new crate shipment in the data store
* @property {Function} getCrateShipmentById- finds a crate shipment in the data store by uuid
* @property {Function} getAllCrateShipments- finds all crate shipments in the data store
* @property {Function} getCrateShipmentsByCrateId - finds a list of all unique shipments of a specified crate
*/

/**
 * Interface for a repository of crate shipments
 * @param {ICrateShipmentRepositoryAPI} myImpl - object defining concrete implementations for interface methods
 */

function ICrateShipmentRepository(myImpl) {
    function required() {
        throw Error("Missing implementation");
    }

    /**
    @param {Object} doc - object representing a valid entry
    @returns {String} - a uuid for the new user
    */
    this.create = myImpl.create || required;

    /**
    @param {String} id - uuid of the crateTrip
    @returns {CrateShipment} - the requested crateTrip
    */
    this.getCrateShipmentById = myImpl.getCrateShipmentById || required;

    /**
    @returns {Array} - a list of all records in the data store
    */
    this.getAllCrateShipments = myImpl.getAllCrateShipments|| required;

    /**
    @returns {CrateShipment} - an instance of a specified CrateShipment
    */
    this.getCrateShipmentById = myImpl.getCrateShipmentById || required;

    /**
    @returns {Array} - a list of CrateShipment instances
    */
    this.getCrateShipmentsByCrateId = myImpl.getCrateShipmentsByCrateId || required;   

    /**
    @returns {Array} - a list of CrateShipment instances
    */
    this.getCrateShipmentsByRecipientId = myImpl.getCrateShipmentsByRecipientId || required;   
    
    this.addTripWaypoint = myImpl.addTripWaypoint || required;   

    this.completeCrateShipment= myImpl.completeCrateShipment || required;   

}

module.exports = ICrateShipmentRepository;
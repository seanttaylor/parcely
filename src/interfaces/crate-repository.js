/* istanbul ignore file */

/**
* An object having the ICrateRepository API; a set of methods for managing crates
* @typedef {Object} ICrateRepositoryAPI
* @property {Function} create - creates a new crate in the data store
* @property {Function} getCrateById - finds a crate in the data store by uuid
* @property {Function} getAllCrates - finds all crates in the data store
* @property {Function} getCrateShipmentsByCrateId - finds a list of all unique shipments of a specified crate
* @property {Function} getCratesByMerchantId - finds a list of all unique crates associated with a specified merchant
* @property {Function} getCratesByRecipientId - finds all crates associated with a specified recipient
* @property {Function} markCrateReturned - set a crate's status to indicate a pending return
* @property {Function} delete - deletes a crate in the data store by its uuid
* @property {Function} setCrateRecipient - associates a crate with a specified recipient user in the data store
* @property {Function} startCrateShipment - initializes a new shipment for the current crate
* @property {Function} updateCrateTelemetry - updates crate telemetry with latest sensor data
*/

/**
 * Interface for a repository of crates
 * @param {ICrateRepositoryAPI} myImpl - object defining concrete implementations for interface methods
 */

function ICrateRepository(myImpl) {
  function required() {
    throw Error('Missing implementation');
  }

  /**
    @param {Object} doc - object representing a valid entry
    @returns {String} - a uuid for the new crate
    */
  this.create = myImpl.create || required;

  /**
    @param {String} id - uuid of the crate
    @returns {Crate} - the requested Crate instance
    */
  this.getCrateById = myImpl.getCrateById || required;

  /**
    @returns {Array} - a list of all records in the data store
    */
  this.getAllCrates = myImpl.getAllCrates || required;

  /**
    @returns {CrateShipment} - an instance of a specified CrateShipment
    */
  this.getCrateShipmentById = myImpl.getCrateShipmentById || required;

  /**
    @returns {Array} - a list of CrateShipment instances
    */
  this.getCrateShipmentsByCrateId = myImpl.getCrateShipmentsByCrateId || required;

  /**
    @returns {Array} - a list of Crate instances
    */
  this.getCratesByMerchantId = myImpl.getCratesByMerchantId || required;

  /**
    @param {String} uuid - a uuid for a recipient
    @returns {Array} - a list of crates associated with a specified recipient
    */
  this.getCratesByRecipientId = myImpl.getCratesByRecipientId || required;

  /**
    @param {CrateDTO} crate - an instance of CrateDTO
    */
  this.markCrateReturned = myImpl.markCrateReturned || required;

  /**
    @param {String} id - uuid of the crate
    */
  this.deleteCrate = myImpl.deleteCrate || required;

  /**
    @param {Object} user - an instance of User
    */
  this.setCrateRecipient = myImpl.setCrateRecipient || required;

  /**
    @param {CrateDTO} crate - an instance of CrateDTO
    */
  this.updateCrateTelemetry = myImpl.updateCrateTelemetry || required;

  this.startCrateShipment = myImpl.startCrateShipment || required;
}

module.exports = ICrateRepository;

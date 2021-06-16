/* istanbul ignore file */

/**
* An object having the IHardwareCrateService API; a set of methods for command and control functionality of hardware crates
* @typedef {Object} IHardwareCrateServiceAPI
* @property {Function} getCrateStatus - gets the current operational status of
* a hardware crate
* @property {Function} shipCrate - sends a control message to a specified
* hardware crate to begin pushing telemetry data
*/

/**
 * Interface for managing and monitoring Parcely hardware crates
 * @param {IHardwareCrateServiceAPI} myImpl - object defining concrete implementations for interface methods
 */

function IHardwareCrateService(myImpl) {
  function required() {
    throw Error('Missing implementation');
  }

  /**
    @param {String} crateId - a uuid for a crate
    */
  this.getCrateStatus = myImpl.getCrateStatus || required;

  /**
    @param {Crate} crate - an instance of Crate
    */
  this.shipCrate = myImpl.shipCrate || required;
}

module.exports = IHardwareCrateService;

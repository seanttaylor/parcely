/* istanbul ignore file */

/**
* An object having the IMerchantRepository API; a set of methods for managing Merchants
* @typedef {Object} IMerchantRepositoryAPI
* @property {Function} create - creates a new Merchant in the data store
* @property {Function} getMerchantById - finds a Merchant in the data store by uuid
* @property {Function} getAllMerchants - finds all Merchants in the data store
* @property {Function} archiveMerchant - archives a Merchant in the data store by its uuid
*/

/**
 * Interface for a repository of Merchants
 * @param {IMerchantRepositoryAPI} myImpl - object defining concrete implementations for interface methods
 */

function IMerchantRepository(myImpl) {
    function required() {
        throw Error("Missing implementation");
    }

    /**
    @param {Object} doc - object representing a valid entry
    @returns {String} - a uuid for the new merchant
    */
    this.create = myImpl.create || required;

    /**
    @param {String} id - uuid of the merchant
    @returns {Merchant} - the requested Merchant instance
    */
    this.getMerchantById = myImpl.getMerchantById || required;

    /**
    @returns {Array} - a list of all records in the data store
    */
    this.getAllMerchants = myImpl.getAllMerchants || required;

    /**
    @param {MerchantDTO} Merchant - an instance of MerchantDTO
    */
    this.archiveMerchant = myImpl.archiveMerchant || required;

}

module.exports = IMerchantRepository;
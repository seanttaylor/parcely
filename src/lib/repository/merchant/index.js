/* istanbul ignore file */

/*Implements IMerchantRepository interface for connecting to a datastore.
See interfaces/merchant-repository for method documentation*/

const { MerchantDTO } = require("./dto");


/**
 * @implements {IMerchantRepository}
 * @param {Object} databaseConnector - object with methods for connecting to a database 
 */

function MerchantRepository(databaseConnector) {
    /**
     * @param {MerchantDTO} merchantDTO - an instance of MerchantDTO
     */
    this.create = async function(merchantDTO) {
        const [record] = await databaseConnector.add({
            doc: merchantDTO, 
            collection: "merchants"
        });
        
        return { id: record.id, createdDate: record.createdDate };

    }

    this.getMerchantById = async function(id) {
        const [record] = await databaseConnector.findOne({id, collection: "merchants"});
        
        return record;
    }

    this.getAllMerchants = async function() {
        const result = await databaseConnector.findAll("merchants");
        return result;
    }

    this.archiveMerchant = async function(merchantDTO) {
        const [result] = await databaseConnector.updateOne({
            doc: merchantDTO, 
            collection: "merchants"
        });
    }

    this.updateMerchantPlan = async function(merchantDTO) {
        const [result] = await databaseConnector.updateOne({
            doc: merchantDTO, 
            collection: "merchants"
        });
    }

}

/*MerchantRepository*/

module.exports = MerchantRepository;
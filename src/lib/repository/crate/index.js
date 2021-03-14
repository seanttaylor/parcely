/* istanbul ignore file */

/*Implements IUserRepository interface for connecting to a datastore.
See interfaces/user-repository for method documentation*/

const { CrateDTO } = require("./dto");


/**
 * @implements {ICrateRepository}
 * @param {Object} databaseConnector - object with methods for connecting to a database 
 */

function CrateRepository(databaseConnector) {
    /**
     * @param {CrateDTO} crateDTO - an instance of CrateDTO
     */
    this.create = async function({crateDTO}) {
        const [record] = await databaseConnector.add({
            doc: crateDTO, 
            collection: "crates"
        });

        return { id: record.id, createdDate: record.createdDate };

    }

    this.getCrateById = async function(id) {
        const result = await databaseConnector.findOne({id, collection: "crates"});
        return result;
    }


    this.getAllCrates = async function() {
        const result = await databaseConnector.findAll("crates");
        return result;
    }

    
    this.getCrateByTripId = async function(tripId) {
        const [record] = await databaseConnector.findOne({
            id: tripId,
            collection: "crates"
        });

        return { lastModified: record.lastModified };
    }


    this.getCrateTripsByCrateId = async function(id) {
        const [result] = await databaseConnector.findAll({
            id: currentUserId, 
            collection: "crate_trips"
        });
        
        return result.filter(t => t.id === id);
    }

    
    this.getCurrentCrateTelemetryById = async function(id) {

    }

    this.getCratesByUser = async function(id) {

    }


    this.markCrateReturned = async function(id) {

    }


    this.deleteCrate = async function(id) {
        return
    }

}

/*CrateRepository*/

module.exports = CrateRepository;
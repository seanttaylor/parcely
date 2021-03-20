/* istanbul ignore file */

/*Implements ICrateRepository interface for connecting to a datastore.
See interfaces/crate-repository for method documentation*/

const { CrateDTO } = require("./dto");


/**
 * @implements {ICrateRepository}
 * @param {Object} databaseConnector - object with methods for connecting to a database 
 */

function CrateRepository(databaseConnector) {
    /**
     * @param {CrateDTO} crateDTO - an instance of CrateDTO
     */
    this.create = async function(crateDTO) {
        const [record] = await databaseConnector.add({
            doc: crateDTO, 
            collection: "crates"
        });
        
        return { id: record.id, createdDate: record.createdDate };

    }

    this.getCrateById = async function(id) {
        const [record] = await databaseConnector.findOne({id, collection: "crates"});
        return record;
    }


    this.getAllCrates = async function() {
        const result = await databaseConnector.findAll("crates");
        return result;
    }

    
    this.getCrateTripById = async function(tripId) {
        const [record] = await databaseConnector.findOne({
            id: tripId,
            collection: "crate_trips"
        });

        return record;
    }


    this.setCrateRecipient = async function(crateDTO) {
        const result = await databaseConnector.updateOne({
            doc: crateDTO,
            collection: "crates"
        });
    }

    /*this.removeCrateRecipient = async function(crateDTO) {
        const result = await databaseConnector.updateOne({
            doc: crateDTO,
            collection: "crates"
        });
    }*/

    /**
     * @param {CrateDTO} crateDTO - an instance of a CrateDTO
     */
    this.startCrateTrip = async function(crateDTO) {
        const result = await databaseConnector.updateOne({
            doc: crateDTO,
            collection: "crates"
        });
    }


    this.getCrateTripsByCrateId = async function(id) {
        const crateTrips = await databaseConnector.findAll("crate_trips");
        return crateTrips.filter(trip => trip.crateId === id);
    }


    this.getCratesByRecipientId = async function(id) {
        const crates = await databaseConnector.findAll("crates");
        return crates.filter(crate => crate.recipientId === id);
    }


    this.markCrateReturned = async function(crateDTO) {
        const [result] = await databaseConnector.updateOne({
            doc: crateDTO, 
            collection: "crates"
        });
    }


    this.markCrateReturned = async function(crateDTO) {
        const [result] = await databaseConnector.updateOne({
            doc: crateDTO, 
            collection: "crates"
        });
    }


    this.updateCrateTelemetry = async function(crateDTO) {
        const [result] = await databaseConnector.updateOne({
            doc: crateDTO, 
            collection: "crates"
        });
    }


    this.deleteCrate = async function(id) {
        return
    }

}

/*CrateRepository*/

module.exports = CrateRepository;
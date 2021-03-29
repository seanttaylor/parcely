/* istanbul ignore file */

/*Implements ICrateTripRepository interface for connecting to a datastore.
See interfaces/trip-repository for method documentation*/

const { CrateTripDTO } = require("./dto");


/**
 * @implements {ICrateTripRepository}
 * @param {Object} databaseConnector - object with methods for connecting to a database 
 */

function CrateTripRepository(databaseConnector) {
    /**
     * @param {CrateTripDTO} crateDTO - an instance of CrateDTO
     */
    this.create = async function(crateTripDTO) {
        const [record] = await databaseConnector.add({
            doc: crateTripDTO, 
            collection: "crate_trips"
        });
        
        return { id: record.id, createdDate: record.createdDate };

    }


    this.getAllCrateTrips = async function() {
        const result = await databaseConnector.findAll("crate_trips");
        return result;
    }

    /**
     * @param {String} tripId - uuid for a trip
     */
    this.getCrateTripById = async function(tripId) {
        const [record] = await databaseConnector.findOne({
            id: tripId,
            collection: "crate_trips"
        });

        return record;
    }

    /**
     * @param {String} id - uuid for a crate
     */
    this.getCrateTripsByCrateId = async function(id) {
        const crateTrips = await databaseConnector.findAll("crate_trips");
        return crateTrips.filter(t => t.crateId === id);
    }

    /**
     * @param {String} id - uuid for a user
     */
    this.getCrateTripsByRecipientId = async function(id) {
        const crateTrips = await databaseConnector.findAll("crate_trips");
        return crateTrips.filter(t => t.recipientId === id);
    }

    /**
     * @param {CrateTripDTO} crateTripDTO - an instance of CrateTelemetryDTO
     */
    this.addTripWaypoint = async function(crateTripDTO) {
        await databaseConnector.updateOne({
            doc: crateTripDTO,
            collection: "crate_trips"
        });
    } 

    /**
     * @param {CrateTripDTO} crateTripDTO - an instance of CrateTelemetryDTO
     */
    this.completeCrateTrip = async function(crateTripDTO) {
        await databaseConnector.updateOne({
            doc: crateTripDTO,
            collection: "crate_trips"
        });
    } 

}

/*CrateTripRepository*/

module.exports = CrateTripRepository;
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

    
    this.getCrateTripById = async function(tripId) {
        const [record] = await databaseConnector.findOne({
            id: tripId,
            collection: "crate_trips"
        });

        return record;
    }


    this.getCrateTripsByCrateId = async function(id) {
        const crateTrips = await databaseConnector.findAll("crate_trips");
        return crateTrips.filter(trip => trip.crateId === id);
    }

}

/*CrateTripRepository*/

module.exports = CrateTripRepository;
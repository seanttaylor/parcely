/* istanbul ignore file */

/*Implements ICrateShipmentRepository interface for connecting to a datastore.
See interfaces/shipment-repository for method documentation*/

const { CrateShipmentDTO } = require("./dto");


/**
 * @implements {ICrateShipmentRepository}
 * @param {Object} databaseConnector - object with methods for connecting to a database 
 */

function CrateShipmentRepository(databaseConnector) {
    /**
     * @param {CrateShipmentDTO} crateShipmentDTO - an instance of CrateShipmentDTO
     */
    this.create = async function(crateShipmentDTO) {
        const [record] = await databaseConnector.add({
            doc: crateShipmentDTO, 
            collection: "crate_shipments"
        });
        
        return { id: record.id, createdDate: record.createdDate };

    }


    this.getAllCrateShipments = async function() {
        const result = await databaseConnector.findAll("crate_shipments");
        return result;
    }

    /**
     * @param {String} tripId - uuid for a trip
     */
    this.getCrateShipmentById = async function(tripId) {
        const [record] = await databaseConnector.findOne({
            id: tripId,
            collection: "crate_shipments"
        });

        return record;
    }

    /**
     * @param {String} id - uuid for a crate
     */
    this.getCrateShipmentsByCrateId = async function(id) {
        const crateTrips = await databaseConnector.findAll("crate_shipments");
        return crateTrips.filter(t => t.crateId === id);
    }

    /**
     * @param {String} id - uuid for a user
     */
    this.getCrateShipmentsByRecipientId = async function(id) {
        const crateTrips = await databaseConnector.findAll("crate_shipments");
        return crateTrips.filter(t => t.recipientId === id);
    }

    /**
     * @param {CrateShipmentDTO} crateShipmentDTO - an instance of CrateShipmentDTO
     */
    this.addTripWaypoint = async function(crateShipmentDTO) {
        await databaseConnector.updateOne({
            doc: crateShipmentDTO,
            collection: "crate_shipments"
        });
    } 

    /**
     * @param {CrateShipmentDTO} crateShipmentDTO - an instance of CrateShipmentDTO
     */
    this.completeCrateShipment = async function(crateShipmentDTO) {
        await databaseConnector.updateOne({
            doc: crateShipmentDTO,
            collection: "crate_shipments"
        });
    } 

}

/*CrateShipmentRepository*/

module.exports = CrateShipmentRepository;
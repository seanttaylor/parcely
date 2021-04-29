/* istanbul ignore file */

/* Implements ICrateRepository interface for connecting to a datastore.
See interfaces/crate-repository for method documentation */

// const { CrateDTO } = require('./dto');

/**
 * @implements {ICrateRepository}
 * @param {Object} databaseConnector - object with methods for connecting to a database
 */

function CrateRepository(databaseConnector) {
  /**
     * @param {CrateDTO} crateDTO - an instance of CrateDTO
     */
  this.create = async function (crateDTO) {
    const [record] = await databaseConnector.add({
      doc: crateDTO,
      collection: 'crates',
    });

    return { id: record.id, createdDate: record.createdDate };
  };

  this.getCrateById = async function (id) {
    const [record] = await databaseConnector.findOne({ id, collection: 'crates' });
    return record;
  };

  this.getAllCrates = async function () {
    const result = await databaseConnector.findAll('crates');
    return result;
  };

  this.getCrateShipmentById = async function (shipmentId) {
    const [record] = await databaseConnector.findOne({
      id: shipmentId,
      collection: 'crate_shipments',
    });

    return record;
  };

  /**
     * @param {CrateDTO} crateDTO - an instance of a CrateDTO
     */
  this.setCrateRecipient = async function (crateDTO) {
    await databaseConnector.updateOne({
      doc: crateDTO,
      collection: 'crates',
    });
  };

  /**
     * @param {CrateDTO} crateDTO - an instance of a CrateDTO
     */
  this.startCrateShipment = async function (crateDTO) {
    await databaseConnector.updateOne({
      doc: crateDTO,
      collection: 'crates',
    });
  };

  this.getCrateShipmentsByCrateId = async function (id) {
    const crateShipments = await databaseConnector.findAll('crate_trips');
    return crateShipments.filter((s) => s.crateId === id);
  };

  this.getCratesByMerchantId = async function (id) {
    const crateList = await databaseConnector.findAll('crates');
    return crateList.filter((c) => c.merchantId === id);
  };

  this.getCratesByRecipientId = async function (id) {
    const crates = await databaseConnector.findAll('crates');
    return crates.filter((crate) => crate.recipientId === id);
  };

  this.markCrateReturned = async function (crateDTO) {
    await databaseConnector.updateOne({
      doc: crateDTO,
      collection: 'crates',
    });
  };

  this.updateCrateTelemetry = async function (crateDTO) {
    await databaseConnector.updateOne({
      doc: crateDTO,
      collection: 'crates',
    });
  };

  this.deleteCrate = async function (id) {
    await databaseConnector.removeOne(id, 'crates');
  };
}

/* CrateRepository */

module.exports = CrateRepository;

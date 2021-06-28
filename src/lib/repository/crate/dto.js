/* istanbul ignore file */

const Ajv = require('ajv');

const ajv = new Ajv();
const crateSchema = require('../../../schemas/crate.json');

const crateSchemaValidation = ajv.compile(crateSchema);
const defaultTelemetry = {
  temp: {
    degreesFahrenheit: null,
  },
  location: {
    coords: {
      lat: null,
      lng: null,
    },
    zip: null,
  },
  sensors: {
    moisture: {
      thresholdExceeded: false,
    },
    thermometer: {
      thresholdExceeded: false,
    },
    photometer: {
      thresholdExceeded: false,
    },
  },
};

/**
 * @typedef {Object} CrateDTO
 * @property {String} id
 * @property {String} status
 * @property {String} size
 * @property {String} recipientId
 * @property {String} merchantId
 * @property {String} lastPing
 * @property {String} telemetry
 * @property {String} createdDate
 * @property {String|null} lastModified
 */

/**
  * @param {String} id - uuid for a crate
  * @param {String} status - status of crate
  * @param {String} size - size of crate
  * @param {String} shipmentId - uuid for a unique crate shipment
  * @param {String} recipientId - uuid for a recipient associated with a specified crate
  * @param {String} merchantId - uuid for a merchant associated with a specified crate
  * @param {String} lastPing - last ping received from a specified crate
  * @param {Object} telemetry - summary of telemetry data
  * @param {String} createdDate - date a user was created
  * @param {String|null} lastModified - date crate was last modified
  * @returns {CrateDTO}
  */

function CrateDTO({
  id, size, telemetry, status = ['awaitingDeployment'], shipmentId = null, merchantId = null, recipientId = null, recipientEmail = null, lastPing = null, createdDate = new Date().toISOString(), lastModified = null,
}) {
  const crateData = {
    id,
    status,
    size,
    shipmentId,
    merchantId,
    recipientId,
    recipientEmail,
    lastPing,
    telemetry: telemetry || defaultTelemetry,
    createdDate,
    lastModified,
  };

  if (!crateSchemaValidation(crateData)) {
    throw new Error(`CrateDTOError/InvalidCrateDTO => ${JSON.stringify(crateSchemaValidation.errors, null, 2)}`);
  }

  this.value = function () {
    return crateData;
  };
}

module.exports = {
  CrateDTO,
};

/* istanbul ignore file */

const Ajv = require('ajv');

const ajv = new Ajv();
const crateShipmentSchema = require('../../../schemas/shipment.json');

const crateShipmentSchemaValidation = ajv.compile(crateShipmentSchema);
const crateTelemetrySchema = crateShipmentSchema.properties.waypoints;
const crateTelemetrySchemaValidation = ajv.compile(crateTelemetrySchema);

/**
 * @typedef {Object} CrateShipmentDTO
 * @property {String} id
 * @property {String} crateId
 * @property {String} tripId
 * @property {String} departureTimestamp
 * @property {String} arrivalTimestamp
 * @property {String} departureZip
 * @property {String} arrivalZip
 * @property {String} trackingNumber
 * @property {String} createdDate
 * @property {Array}  waypoints
 * @property {String} tripLengthMiles
 * @property {Object} originAddress
 * @property {Object} destinationAddress
 * @property {Array} status
 */

/**
 * @param {String} id - uuid for a trip
 * @param {String} crateId - uuid for a crateId
 * @param {String} departureTimestamp - datetime of crate departure (i.e. when the crate trip is initialized)
 * @param {String} arrivalTimestamp - datetime of crate arrival (i.e. when crate trip is concluded)
 * @param {String} departureZip - departue zip code
 * @param {String} arrivalZip - arrival zip code
 * @param {String} trackingNumber - Shipping carrier tracking number associated with this crate for this trip
 * @param {Array} waypoints - list of each point in the trip where the crate pushed telemetry data to the logistics API
 * @param {String|null} lastModified - datetime crate trip data was last modified
 * @param {String} tripLengthMiles - estimated length of the trip in miles
 * @param {Object} originAddress - the postal address a crate originates from
 * @param {Object} destinationAddress - the postal address a crate ships to
 * @param {String} createdDate - datetime a crate trip is created
 * @param {Array} status - current status of the crate trip
 * @returns {CrateShipmentDTO}
 */

function CrateShipmentDTO({
  id, crateId, recipientId, departureTimestamp, arrivalTimestamp = null, trackingNumber, departureZip, arrivalZip, waypoints = [], createdDate = new Date().toISOString(), lastModified = null, tripLengthMiles = null, status = ['inProgress'], originAddress, destinationAddress,
}) {
  const crateShipmentData = {
    id,
    crateId,
    recipientId,
    departureTimestamp,
    arrivalTimestamp,
    trackingNumber,
    departureZip,
    arrivalZip,
    waypoints,
    createdDate,
    lastModified,
    tripLengthMiles,
    originAddress,
    destinationAddress,
    status,
  };

  if (!crateShipmentSchemaValidation(crateShipmentData)) {
    throw new Error(`CrateShipmentDTOError/InvalidCrateShipmentDTO => ${JSON.stringify(crateShipmentSchemaValidation.errors, null, 2)}`);
  }

  this.value = function () {
    return crateShipmentData;
  };
}

/**
 * @typedef {Object} CrateTelemetryDTO
 * @property {String} timestamp
 * @property {Object} telemetry
 */

/**
 * @param {String} timestamp - date/time telemetry datea
 * @param {Object} telemetry - telemetry data from Crate sensors
 * @returns {CrateTelemetry}
 */

function CrateTelemetryDTO({ timestamp, telemetry }) {
  const crateTelemetryData = {
    timestamp,
    telemetry,
  };

  if (!crateTelemetrySchemaValidation([crateTelemetryData])) {
    throw new Error(`CrateTelemetryDTOError/InvalidCrateTelemetryDTO => ${JSON.stringify(crateTelemetrySchemaValidation.errors, null, 2)}`);
  }

  this.value = function () {
    return crateTelemetryData;
  };
}

module.exports = {
  CrateShipmentDTO,
  CrateTelemetryDTO,
};

/* istanbul ignore file */

const Ajv = require("ajv");
const ajv = new Ajv();
const crateTripSchema = require("../../../schemas/trip.json");
const crateTripSchemaValidation = ajv.compile(crateTripSchema);


/**
 * @typedef {Object} CrateTripDTO
 * @property {String} id 
 * @property {String} crateId 
 * @property {String} departureTimestamp
 * @property {String} arrivalTimestamp
 * @property {String} departureZip
 * @property {String} arrivalZip
 * @property {String} trackingNumber
 * @property {String} createdDate
 * @property {String} tripLengthMiles
 * @property {Object} originAddress - the postal address a crate originates from
 * @property {Object} destinationAddress - the postal address a crate ships to
 */

/**
 * @param {String} id - uuid for a id
 * @param {String} crateId - uuid for a crateId
 * @param {String} departureTimestamp - datetime of crate departure (i.e. when the crate trip is initialized)
 * @param {String} arrivalTimestamp - datetime of crate arrival (i.e. when crate trip is concluded)
 * @param {String} departureZip - departue zip code
 * @param {String} arrivalZip - arrival zip code
 * @param {String} trackingNumber - Shipping carrier tracking number associated with this crate for this trip
 * @param {String} waypoints - list of each point in the trip where the crate pushed telemetry data to the logistics API
 * @param {String|null} lastModified - datetime crate trip data was last modified
 * @param {String} tripLengthMiles - estimated length of the trip in miles
 * @param {Object} originAddress - the postal address a crate originates from
 * @param {Object} destinationAddress - the postal address a crate ships to
 * @param {String} createdDate - datetime a crate trip is created
 * @returns {CrateTripDTO}
 */

function CrateTripDTO({id, crateId, departureTimestamp, arrivalTimestamp=null, trackingNumber, departureZip, arrivalZip, waypoints=[], createdDate=new Date().toISOString(), lastModified=null, tripLengthMiles=null, originAddress, destinationAddress}) {
    
    const crateTripData = {
      id,
      crateId,
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
      destinationAddress
    };
  

  if(!crateTripSchemaValidation(crateTripData)) {
    throw new Error(`CrateTripDTOError/InvalidCrateTripDTO => ${JSON.stringify(crateTripSchemaValidation.errors, null, 2)}`);
  }

  this.value = function() {
    return crateTripData;
  }

}

module.exports = {
    CrateTripDTO
};